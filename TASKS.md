# Nexus Dominion — Master Task List

Finish Phase 1 (playable alpha) and complete the Phase 2 depth systems of the
Tauri + React strategy game. Source of truth: `docs/CODING-PLAN.md` (v1.2,
re-audited 2026-07-15) for milestone intent and UAT scripts; `docs/prd.md` v3.0
and `docs/systems/*.md` for game-design specifics. Engine lives in
`src/engine/**` (pure TypeScript, vitest-covered), UI in `src/ui/**` +
`src/App.tsx` (React panels over the LCARS design system).

## Orchestrator protocol

1. **Check out** the first task with `status: TODO` whose `after:` tasks are all DONE. Set it `IN-PROGRESS`.
2. **Plan** — hand the coder the task block plus the pointers named in the intro. Nothing else.
3. **Code** — implement per the plan and the Standing constraints.
4. **Review** — check the diff against the task's **Accept** criteria (written to be mechanically checkable).
5. On pass: run the gate, commit as `<ID>: <title>`, set `status: DONE`, update this file in the same commit. On fail: one fix round, then escalate, then halt.

**Gate (every task):** `npx vitest run`, `npx tsc --noEmit`, and `npm run build` all exit 0. Zero failing tests — no exceptions, no "pre-existing" excuses.

**Human UAT gates:** Tasks with `coder: human` are playtest checkpoints. They start as `BLOCKED(human UAT)` so the runner never checks them out, and every task that lists one in `after:` stays ineligible until a human plays the checklist (see the UAT scripts in `docs/CODING-PLAN.md`), then manually flips the status to `DONE` and commits. This is deliberate: automated work must not proceed past a checkpoint the player has not signed off.

**Standing constraints** (the reviewer enforces on every task):
- Engine purity: nothing under `src/engine/**` may import from `src/ui/**`, touch the DOM, or read `localStorage` (the persistence adapter is the one sanctioned boundary).
- Every engine change ships with coverage in the sibling `*.test.ts`; every new UI behavior ships with a jsdom component test (`@testing-library/react`) asserting render + dispatched action.
- New player actions follow the established pattern: kebab-case `type` string, a `case` in `resolvePlayerActions` (`src/engine/cycle/cycle-processor.ts`), resolved atomically inside `processCycle`, with a typed event pushed to the cycle's event list.
- No new `Math.random()` in engine code — derive randomness from game state (see `simpleHash` in the cycle processor) so campaigns are reproducible.
- Build UI from the LCARS components in `src/components/lcars` (`Panel`, `Button`, `DataReadout`, `PhaseIndicator`) and match existing panel CSS conventions.
- No new runtime dependencies without an explicit note in the task body.

Statuses: `TODO` | `IN-PROGRESS` | `DONE` | `BLOCKED(reason)`

---

## M1 — War Works (combat becomes playable — CODING-PLAN 1.10/1.11)

### T-101 · Engine: `attack` player action — `status: DONE` · `coder: fable` · `after: —`
Add an `attack` case to `resolvePlayerActions` in `src/engine/cycle/cycle-processor.ts` that lets the player assault an enemy-owned system. Details: `{ targetSystemId, unitIds }` (attacking force drawn from the player's units). Resolve via the existing `resolveFullCombat` sequence in `src/engine/combat/combat-resolver.ts` (fleet engagement → orbital bombardment → ground assault, morale checks, infrastructure damage). Apply casualties to both empires' unit rosters, transfer system ownership on ground-assault victory, and push a `combat` event carrying per-phase results (casualties, victor, phases fought, ownership change) so the UI can render it. Reject invalid attacks (unowned/own target, empty or nonexistent force) by breaking without state change. Use state-derived randomness, not `Math.random()`.
**Accept:** new vitest cases in `cycle-processor.test.ts` cover: attacker victory transfers ownership; attacker defeat leaves ownership unchanged; casualties are deducted from both rosters; attacking with 0 units or against own/unclaimed system is a no-op; the pushed combat event contains phase-by-phase results. Full suite green.
**Delivered (2026-07-15):** Implemented the `attack` case in `resolvePlayerActions` (`src/engine/cycle/cycle-processor.ts`): validates the target system and force, builds attacker/defender rosters from live units and stationed fleets, runs them through the existing `resolveFullCombat` phase sequence with a state-derived `SeededRNG` (campaign seed + cycle + hashed target system id, never `Math.random()`), applies orbital-bombardment infrastructure damage, deletes casualty units from both empires' rosters and fleets, transfers system ownership on a ground-assault win, and pushes a `combat` event extended with `results`, `attackerId`/`defenderId`, `victor`, `phasesFought`, `ownershipChanged`, and per-side casualty id lists (`src/engine/types/events.ts`) while keeping the original `result` field for UI/bot back-compat. Invalid attacks (empty/nonexistent force, unclaimed/own/nonexistent target) break out with zero state mutation and no event. Nine new vitest cases in `cycle-processor.test.ts` cover every acceptance scenario plus phase-by-phase event shape. Scope boundary: no retreat/partial-force-withdrawal logic and no multi-system/simultaneous attacks — one `attack` action resolves one full engagement against one target system, matching the task's `{ targetSystemId, unitIds }` contract; UI wiring (attack button, combat modal, fleet orders) is deliberately deferred to T-102/T-103/T-104.

### T-102 · UI: attack action in System Panel — `status: DONE` · `coder: opus` · `after: T-101`
In `src/ui/SystemPanel.tsx`, when the selected system is enemy-owned, render an ATTACK section: list the player's available military units with checkboxes (or select-all), and a launch button that calls a new `onAttack(systemId, unitIds)` prop. Wire `handleAttack` in `src/App.tsx` following the existing handler pattern (dispatch `attack` through `processCycle`, advance cycle, show report). Disable the button with an inline reason when the player has no units.
**Accept:** a jsdom component test renders `SystemPanel` with an enemy-owned system fixture and asserts the attack control appears, is absent for own/unclaimed systems, and fires `onAttack` with the selected unit ids; `tsc` and full suite green.
**Delivered (2026-07-15):** Added a "Military Assault" section to `src/ui/SystemPanel.tsx`, rendered only for enemy-owned systems: it gathers the player's completed (non-in-progress) units across all of their fleets, lists each with a checkbox plus a "Select all" toggle, and a "⚔ LAUNCH ATTACK" button that calls the new `onAttack(systemId, unitIds)` prop — disabled (with an inline "No military units available to deploy" note) when the player has no eligible units, and disabled until at least one unit is checked otherwise. Wired `handleAttack` in `src/App.tsx` following the existing action-handler pattern: dispatches `{ type: "attack", details: { targetSystemId, unitIds } }` through `processCycle`, updates power-history/bot-accumulator refs and cycle state on commit, surfaces the cycle report, and closes the panel. Added matching styles to `src/ui/SystemPanel.css` and enabled `.test.tsx` discovery in `vite.config.ts` (test `include` previously matched only `.test.ts`). New jsdom component test `src/ui/SystemPanel.test.tsx` covers: attack control renders for an enemy system with units, is absent for own/unclaimed systems, is present-but-disabled with a no-units message when the player has none, select-all/individual toggles drive the checked state, and `onAttack` fires with the selected unit ids. Scope boundary: no combat-outcome UI (deferred to T-103's combat report modal) and no fleet-location/range filtering of eligible units — any completed unit in any of the player's fleets is offerable, matching the engine's `attack` action contract from T-101.

### T-103 · UI: combat result modal — `status: TODO` · `coder: opus` · `after: T-101`
New `src/ui/CombatReport.tsx` (+ CSS): a modal that renders the `combat` event from T-101 phase by phase using the LCARS `PhaseIndicator` — per phase: attacker/defender losses, morale breaks, victor; footer shows final outcome and ownership change. Wire into `src/App.tsx`: when a committed cycle's report contains a combat event involving the player, show the modal (stacked above / instead of the generic cycle report, matching existing modal conventions).
**Accept:** a jsdom component test renders the modal from a three-phase combat event fixture and asserts each phase's casualties and the final victor/ownership line are shown; modal closes via its close control; full suite green.

### T-104 · UI: fleet movement orders — `status: TODO` · `coder: opus` · `after: T-101`
Give the player a way to issue `move-fleet` actions (engine path exists and is tested — repaired 2026-07-15). In `src/ui/MilitaryPanel.tsx`, show the player's fleets with location and in-transit status (`targetSystemId`/`arrivalCycle`); add a move control that picks a destination system and calls a new `onMoveFleet(fleetId, targetSystemId)` prop, wired in `App.tsx` to dispatch `{ type: "move-fleet", details: { fleetId, targetSystemId } }`. Show an in-transit badge until arrival.
**Accept:** a jsdom component test asserts a fleet row renders with its location, `onMoveFleet` fires with the chosen fleet + destination, and an in-transit fleet shows its arrival cycle and no move control; full suite green.

### U-110 · HUMAN UAT: "War works" playthrough — `status: BLOCKED(human UAT)` · `coder: human` · `after: T-102, T-103, T-104`
Play the game (`npm run dev` or `npm run tauri dev`): start a campaign, build units over several cycles, move a fleet, attack a bot's system, lose a fight, win a fight, watch the combat modal each time, and confirm the map recolors on conquest. UAT scripts: CODING-PLAN milestones 1.10/1.11. Record verdicts and any change requests directly in this file, add follow-up tasks for them, then set this task `DONE`.
**Accept:** human sign-off recorded here (date + notes); status flipped to DONE by a human commit.

---

## M2 — Phase 1 Completeness (information & lifecycle gaps)

### T-201 · UI: Sector panel — `status: TODO` · `coder: opus` · `after: —`
New `src/ui/SectorPanel.tsx` (+ CSS) per CODING-PLAN 1.2: clicking a sector (add a sector-select affordance to `src/ui/StarMap.tsx` — e.g. clicking the sector hull/label) opens a slide-in listing the sector's 25 systems with owner, plus an ownership breakdown by empire and dominance status. Dismiss via X, backdrop, or Escape, matching `SystemPanel` conventions.
**Accept:** a jsdom component test renders the panel from a sector fixture and asserts the system count, per-empire ownership tallies, and dominance line; panel close control fires; full suite green.

### T-202 · UI: covenant lines + coalition alert — `status: TODO` · `coder: opus` · `after: —`
Two diplomacy visibility gaps (CODING-PLAN 1.13/1.14): (a) render Covenant Lines on `src/ui/StarMap.tsx` — an edge between home systems of empires holding an active star-covenant with the player, visually distinct from wormhole edges; (b) when a committed cycle's events contain a convergence alert, surface it as a prominent HUD banner or modal naming the empire and threatened achievement, and show the player's coalition memberships in `DiplomacyPanel`.
**Accept:** component tests assert (a) a covenant edge is emitted for an active covenant fixture and absent otherwise, and (b) the alert renders from a convergence-event fixture and DiplomacyPanel lists a coalition fixture; full suite green.

### T-203 · UI: save-slot manager — `status: TODO` · `coder: opus` · `after: —`
Replace the load-latest-only behavior in `src/App.tsx` (CODING-PLAN 1.3 limitation). Title screen CONTINUE opens a save list from `persistence.listSaves()`: name, cycle, timestamp; pick one to load, delete with confirm. In-game SAVE keeps working; add save metadata (campaign name + cycle) if the persistence layer lacks it.
**Accept:** a jsdom component test renders the save list from a multi-save fixture, asserts load fires with the chosen save id and delete asks for confirmation; a persistence unit test covers list/load/delete round-trip; full suite green.

### T-204 · Engine: surface cycle-commit errors — `status: TODO` · `coder: fable` · `after: —`
Kill the silent-failure tech debt flagged in CODING-PLAN 1.5. In `src/engine/cycle/cycle-processor.ts`, the Tier-1 atomicity `catch` must capture the thrown error into a new optional `error: string` field on `CycleResult` (state rollback behavior unchanged). In `src/App.tsx`, every handler that checks `result.committed` must, on failure, surface the error to the player (LCARS-styled toast or banner — one shared mechanism, not thirteen copies: extract the repeated commit-handling block into a single helper while you're there).
**Accept:** a vitest case forces a Tier-1 throw and asserts `committed === false` and `error` contains the message while returned state deep-equals the input; a component/unit test asserts the UI error surface renders from a failed-commit result; the commit-handling boilerplate in `App.tsx` appears once, not per-handler; full suite green.

### T-205 · Engine: seed the cycle processor's stray randomness — `status: TODO` · `coder: opus` · `after: —`
Three `Math.random()` calls remain in `src/engine/cycle/cycle-processor.ts` (wormhole id at ~line 632, covert success at ~line 801, covert detection kind at ~line 820), breaking campaign reproducibility. Replace them with deterministic state-derived values following the existing `simpleHash` pattern (hash of empire id + cycle + op type, etc.). Covert probabilities must keep their intended odds (70% success; 50/50 detected-vs-failed) across the input distribution.
**Accept:** `grep -rn "Math.random" src/engine --include="*.ts" | grep -v test` outputs nothing; vitest asserts two identical states produce identical outcomes for the affected paths, and a spread of ~100 hash inputs lands within ±10 points of the 70% success rate; full suite green.

### U-210 · HUMAN UAT: Phase 1 Alpha sign-off — `status: BLOCKED(human UAT)` · `coder: human` · `after: U-110, T-201, T-202, T-203, T-204, T-205`
The full Phase 1 checkpoint from CODING-PLAN ("Phase 1 Complete — Internal Alpha UAT"): one continuous campaign exercising expansion, economy, military, trade, diplomacy, research, achievements, save/load across sessions, and 10+ cycles of bot activity with a Reckoning. Also spot-check the never-played Phase 2 systems already built (installations, syndicate, covert ops — CODING-PLAN 2.1–2.3) since M3 builds on them. File follow-up tasks for everything that feels wrong; flip to DONE when the alpha is genuinely playable.
**Accept:** human sign-off recorded here (date + notes); status flipped to DONE by a human commit.

---

## M3 — Depth Systems (Phase 2 completion; gated on alpha sign-off)

### T-301 · Engine: blockade actions + starvation — `status: TODO` · `coder: fable` · `after: U-210`
Complete CODING-PLAN 2.4 on top of the existing `calculateBlockadeEffect` in `src/engine/combat/combat-resolver.ts`: `blockade` and `break-blockade` player actions in the cycle processor, blockade state tracked on the system, income suppression and escalating food-deficit starvation applied each cycle while blockaded, and bots able to blockade via the bot engine. Blockade-break resolves as fleet-engagement combat.
**Accept:** vitest covers: blockaded system's income suppressed over multiple cycles; starvation escalates with consecutive blockaded cycles; break-blockade combat lifts the blockade on victory and not on defeat; bot blockade action resolves during a cycle; full suite green.

### T-302 · UI: blockade visibility — `status: TODO` · `coder: opus` · `after: T-301`
Blockaded systems get a distinct indicator on `StarMap` and a BLOCKADED status line in `SystemPanel` with blockade/break-blockade actions wired through `App.tsx` (attack-pattern from T-102).
**Accept:** component tests assert the map indicator and panel status render from a blockaded-system fixture and the two actions fire with the right ids; full suite green.

### T-303 · UI: doctrine draft modal at the Reckoning — `status: TODO` · `coder: opus` · `after: U-210`
CODING-PLAN 2.5: when `checkResearchDraftTrigger` (in `src/engine/research/research-engine.ts`) fires during a committed cycle, present a card-selection modal (doctrine or specialisation choices as LCARS cards) instead of relying on the Research Panel; selection dispatches the existing `select-doctrine`/`select-specialization` actions. Research Panel remains the fallback view of the current state.
**Accept:** a component test renders the modal from a draft-trigger fixture, asserts one card per available choice, and selection fires the correct action id; modal does not render absent a trigger; full suite green.

### T-304 · UI: market & galaxy event notifications — `status: TODO` · `coder: opus` · `after: U-210`
CODING-PLAN 2.8 surface work: market events (famine etc., already generated engine-side) and achievement/galaxy-response events must reach the player. Extend `src/ui/CycleReport.tsx` to group and render these event categories with distinct styling, and add a compact "last cycle" event ticker to the HUD.
**Accept:** component tests render the report from a fixture containing market + achievement events and assert both groups appear with their details; ticker shows the most recent events; full suite green.

### T-305 · Engine: achievement galaxy responses + anti-snowball — `status: TODO` · `coder: fable` · `after: U-210`
CODING-PLAN 2.6: every one of the 9 achievements, when earned, must trigger its distinct galaxy response (title event, bot reaction per archetype), and coalition/aggression pressure must scale with proximity to achievement completion (anti-snowball). Audit `src/engine/achievement/achievement-checker.ts` + bot engine for what exists; implement the gaps; document each achievement→response mapping in the code.
**Accept:** vitest asserts each of the 9 achievements produces its specific response event when earned, and bot coalition-formation probability increases monotonically across low/mid/high completion-proximity fixtures; full suite green.

### T-306 · Engine: long-term betrayal memory — `status: TODO` · `coder: opus` · `after: U-210`
CODING-PLAN 2.7: bots remember pact violations for 30+ cycles (existing pruning in `pruneOldRelationships` must not erase betrayal records early), betrayal history weighs on pact acceptance, and reputation is surfaced in `DiplomacyPanel` per empire.
**Accept:** vitest asserts a violation still influences the offending empire's pact-acceptance odds 30 cycles later while ordinary relationship noise is pruned; component test shows the reputation readout from a fixture; full suite green.

### U-310 · HUMAN UAT: depth-systems playthrough — `status: BLOCKED(human UAT)` · `coder: human` · `after: T-302, T-303, T-304, T-305, T-306`
Closed-beta checkpoint from CODING-PLAN Phase 2: a long campaign chasing at least two different achievements, using blockades, reacting to a draft modal, profiting from a market event, and confirming a betrayed bot stays hostile. File follow-ups; flip to DONE.
**Accept:** human sign-off recorded here (date + notes); status flipped to DONE by a human commit.

---

## M4 — Hardening

### T-401 · Long-campaign integration + performance test — `status: TODO` · `coder: opus` · `after: U-310`
CODING-PLAN 3.6 groundwork: an integration test simulating 100+ full cycles at full scale (100 empires, 250 systems) asserting no thrown errors, no `committed:false` cycles, resource/unit invariants hold (no negative reserves, no orphaned unit ids), and mean cycle time under 1s on the test machine. Profile and fix hot paths if the budget is missed.
**Accept:** the new test lives in `src/engine/integration/`, runs in the default suite, asserts the invariants above and the <1s mean cycle budget; full suite green.

---

## Deliberately deferred (do not re-scope into tasks above)

- **LLM Nemesis bots** (CODING-PLAN 3.3) — needs live-model wiring and cost decisions; human-led.
- **100 named bot personas, scenario packs** (3.4/3.5) — content authoring, after beta.
- **Balance pass, in-game help, Steam packaging, LCARS polish pass** (Phase 4 + 2.10) — post-beta, taste-driven.
- **Multi-cycle colonisation** — current instant-claim is a recorded deviation (CODING-PLAN 1.6); revisit only if UAT says expansion feels weightless.
