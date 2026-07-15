# Nexus Dominion — Phased Coding Plan

> **Version:** 1.2
> **Last Updated:** 2026-07-15 (full status re-audit against the codebase; 934/934 tests passing)
> **Author:** VS7
> **Architecture:** Tauri + React/TypeScript (see `docs/architecture.md`)
> **PRD:** `docs/prd.md` v3.0

---

## Status Key

| Badge | Meaning |
|-------|---------|
| ✅ | Engine + UI both complete; UAT checkpoint passable |
| `Engine ✅ \| UI ❌` | Engine fully implemented and tested; no UI panel built yet |
| `Engine ~N% \| UI ❌` | Engine partially implemented; no UI panel built yet |
| `Engine ❌ \| UI ❌` | Not yet implemented |
| ❓ | Status uncertain — needs verification |

---

## Philosophy

This plan decomposes the PRD's four broad phases into **granular, testable milestones**. Each milestone ends with a **UAT checkpoint** — a moment where you can run the app, interact with what was built, and say *"I like this, but change that"* before we move on. No milestone should take more than a few working sessions to complete.

Before coding each milestone, we will create a **detailed implementation plan** specific to that milestone's scope.

---

## Phase 0 — Scaffolding & Proof of Life

> **Goal:** An empty Tauri + React app launches on your desktop with the LCARS visual foundation in place. Nothing playable yet — just proof the stack works.

### Milestone 0.1 — Desktop Shell ✅
- ~~Tauri project initialised with React/TypeScript frontend~~
- ~~App launches as a native desktop window (resizable, dark background)~~
- ~~Hot-reload dev workflow confirmed working~~
- **UAT:** ✅ Native window launches at 1280×800, resizable, dark LCARS splash. Hot-reload confirmed.

### Milestone 0.2 — LCARS Design System ✅
- ~~CSS foundation: colour palette (Orange/Purple/Blue), typography (Orbitron, Exo 2, Roboto Mono), glass panel material~~
- ~~Reusable React components: `Panel`, `Button`, `DataReadout`, `PhaseIndicator`~~
- ~~A demo page with example panels, buttons, and resource bars~~
- **UAT:** ✅ Glass panels glow. Buttons are pill-shaped. Design system demo page showcases all components.

---

## Phase 1 Foundation — Type Scaffold

> **Goal:** Establish all shared TypeScript types, engine interfaces, and project structure so that milestones 1.1–1.16 develop against a stable, consistent foundation.

### Milestone 1.0 — Foundation Scaffold ✅
- ~~Core types: `GameState`, `Empire`, `StarSystem`, `Sector`, `Galaxy`, `Resources`, IDs~~
- ~~Engine interfaces: `ICycleProcessor`, `IGalaxyGenerator`, `ICombatResolver`, `IBotDecisionEngine`~~
- ~~Project directory structure (`engine/`, `ui/`, `hooks/`)~~
- ~~State management: `GameStateContext` + `useGameState()` hook~~
- **UAT:** ✅ `npm run build` passes. Type imports work across the codebase.

---

## Phase 1A — The Galaxy (Static)

> **Goal:** You can see the galaxy and interact with the star map. No game logic yet — it's a sandbox for the spatial layer.

### Milestone 1.1 — Star Map Rendering `Engine N/A | UI ✅`
- ~~WebGL/Canvas galaxy renderer: 250 star system nodes, 10 sector regions~~
- ~~Nodes coloured by ownership (player = blue, unclaimed = grey, bots = faction colours)~~
- ~~Sector boundaries visible as grouped regions~~
- ~~Pan, zoom, click-to-select on nodes~~
- **UAT:** ✅ Star Map renders. Pan, zoom, and click-to-select all work. Sector hulls visible.

### Milestone 1.2 — Star System & Sector Panels `Engine N/A | UI ~50%`
- ~~Click a star system → slide-in panel shows: name, sector, owner, resources, development level~~ (`SystemPanel.tsx`)
- Click a sector region → slide-in panel shows: 25 systems, ownership breakdown, dominance status — **no Sector panel yet**
- Panels dismiss via `X`, backdrop click, or `Escape`
- **UAT:** You click stars, you read data, you close panels. "This is the information model."

---

## Phase 1B — The Empire (Your Economy)

> **Goal:** You have an empire that produces and consumes resources each turn. You can see your ledger and understand your position.

### Milestone 1.3 — Game State & Empire Model ✅
- ~~Core data model: `GameState`, `Empire`, `StarSystem`, `Sector` (TypeScript types)~~
- ~~Galaxy generator: procedurally place 100 empires, 150 unclaimed systems across 10 sectors~~
- ~~Player starts with 1 home system; 99 bots each have 1 home system~~
- ~~Save/load round-trip to local storage (`state-serializer`, `LocalStoragePersistence`)~~
- ~~Wire `GameStateProvider` into `main.tsx`~~ (title screen: New Campaign / Continue; Save button in HUD)
- Known limitation: Continue loads the most recent save only — no save-slot picker UI
- **UAT:** You start a new campaign. The galaxy is populated. You can save the game and reload to the same state.

### Milestone 1.4 — Resource Production & Empire Panel ✅
- ~~Five resources (Credits, Food, Ore, Fuel Cells, Research Points) produce each Cycle based on owned systems~~
- ~~Empire Panel slide-in: resource ledger with production, consumption, net income, and reserves~~ (`EmpirePanel.tsx`)
- ~~Deltas shown against previous-cycle resources~~
- **UAT:** You open the Empire Panel. You see your income. "I understand my economy."

---

## Phase 1C — The Turn (Cycle Processing)

> **Goal:** You can commit a turn and the world advances. This is the core loop.

### Milestone 1.5 — Cycle Commit & Cycle Report ✅
- ~~Cycle Processor runs: 17-phase pipeline, Tier 1 atomicity, Tier 2 graceful failure~~
- ~~Cosmic Order resolution order enforced~~
- ~~"Commit Cycle" button in the HUD~~
- ~~Cycle Report modal appears after commit~~ (`CycleReport.tsx`)
- ~~Cycle counter increments; Confluence pips in HUD track progress toward Reckoning~~
- ⚠ Tech debt: the Tier-1 atomicity `catch` in `processCycle` swallows errors silently (a ReferenceError here blocked every cycle until 2026-07-15); add error surfacing to `CycleResult`
- **UAT:** You press "Commit Cycle." Resources change. You read the report. "This is the heartbeat."

### Milestone 1.6 — Colonisation ✅ *(deviation: instant claim)*
- ~~Unclaimed star systems can be claimed by bots and player (engine logic complete)~~
- ~~Colonisation UI: select unclaimed system → colonise action in system panel~~ (`SystemPanel.tsx` → `claim-system`)
- Deviation: colonisation resolves within the committed cycle rather than taking N Cycles — decide whether multi-cycle colonisation is still wanted
- **UAT:** You colonise a neighbouring star. Your income goes up. "This is expansion."

---

## Phase 1D — The Bots (They're Alive)

> **Goal:** Bots take actions each Cycle. The galaxy moves without you.

### Milestone 1.7 — Bot Momentum & Colonisation AI ✅
- ~~99 bots assigned archetypes and Momentum Ratings at campaign start~~
- ~~Bots colonise unclaimed systems each Cycle according to their Momentum Rating~~
- ~~8 archetypes with weighted action selection and emotional state modifiers~~
- ~~Star map re-renders from state after Cycle commit (nodes coloured by ownership)~~
- **UAT:** You commit 10 Cycles. You see bots spreading across the map. "The galaxy is alive."

### Milestone 1.8 — Cosmic Order & Nexus Reckoning ✅
- ~~Power score calculated for every empire (resources + territory + military)~~
- ~~Every 10 Cycles: Nexus Reckoning fires, empires sorted into Sovereign / Ascendant / Stricken tiers~~
- ~~Rolling 5-cycle average power scores; resolution order correctly shuffled~~
- ~~Tier badge and Confluence pips in the HUD; Reckoning surfaced in the Cycle Report~~
- **UAT:** You play 10 Cycles. The Reckoning fires. You see your tier. "The cosmos is watching."

---

## Phase 1E — Combat (Fleet Engagement)

> **Goal:** Military units exist. You can build fleets and attack.

### Milestone 1.9 — Military Build Queue ✅
- ~~7 unit types defined with D20 stat blocks (6 base + Dreadnought capstone)~~
- ~~Build queue mechanics with cycle advancement and completion~~
- ~~Maintenance cost calculation per unit type~~
- ~~Military Panel slide-in: unit types, build queue, fleet overview~~ (`MilitaryPanel.tsx` → `build-unit`)
- **UAT:** You build ships. You see your fleet. Maintenance costs show in the ledger. "I have an army."

### Milestone 1.10 — Fleet Engagement Combat `Engine ✅ | UI ❌` ← **NEXT UP: biggest remaining Phase 1 gap**
- ~~Combat resolution: d20-style stat comparisons, defender 25% bonus, morale checks~~
- ~~Bots attack each other and the player via bot engine action selection~~
- Attack action UI: select a target star system, assign a fleet — **missing; no player-initiated attack exists in the UI**
- Combat result modal: casualties, victor, system ownership change — **missing**
- Fleet movement UI: engine supports `move-fleet` actions (repaired 2026-07-15) but nothing in the UI dispatches them
- **UAT:** You attack a bot's system. Combat resolves. You see the outcome. "War works."

### Milestone 1.11 — Ground Invasion `Engine ✅ | UI ❌`
- ~~Sequential phase resolution: Fleet Engagement → Orbital Bombardment → Ground Assault~~
- ~~Morale checks at 50% fleet / 75% ground casualties~~
- ~~Infrastructure damage from bombardment~~ (`calculateInfrastructureDamage` / `applyInfrastructureDamage`)
- Invasion UI: phase-by-phase combat modal with phase indicator — **missing (part of the 1.10 combat UI work)**
- **UAT:** You conquer a system through the full combat sequence. "Conquest is satisfying."

---

## Phase 1F — Diplomacy & Market

> **Goal:** You can trade, negotiate, and form alliances.

### Milestone 1.12 — Market System ✅
- ~~Base prices, buy/sell transactions, transaction fees, price decay toward base~~
- ~~Price clamping (50%–200% of base)~~
- ~~Supply/demand coupling: prices respond to trade volumes~~ (`updatePricesFromVolume`)
- ~~Market Panel: buy/sell resources at dynamic prices~~ (`MarketPanel.tsx` → `trade`)
- **UAT:** You buy Ore. You sell Credits. Prices change next turn. "The economy is dynamic."

### Milestone 1.13 — Basic Diplomacy (Stillness Accord & Star Covenant) `Engine ✅ | UI ~80%`
- ~~Pact creation/acceptance/violation mechanics~~
- ~~Relationship memory and reputation tracking~~
- ~~Treaty violation penalties (reputation hit, combat bonus for injured party)~~
- ~~Covenant defence obligations in diplomacy engine~~
- ~~Diplomacy Panel: propose/break pacts~~ (`DiplomacyPanel.tsx` → `propose-pact` / `break-pact`)
- ~~Star Covenant trade discount applied to market prices~~
- Covenant Lines visible on the star map — **not rendered**
- **UAT:** You make a peace deal. You ally with a bot. You see the alliance on the map. "Diplomacy has weight."

### Milestone 1.14 — Nexus Compact (Coalition) `Engine ~85% | UI ❌`
- ~~Convergence alert checking when empire approaches achievement threshold~~ (wired into cycle processor)
- ~~Coalition pact type defined in diplomacy engine~~
- ~~Bot coalition formation logic~~
- ~~Shared War Chest~~ (`contributeToWarChest`)
- Coalition UI: convergence alert modal, coalition membership display — **missing**
- **UAT:** A bot becomes dominant. A coalition forms. You see it unfold. "The galaxy polices itself."

---

## Phase 1G — Research & Achievements

> **Goal:** Tech tree is functional. Achievements are trackable and earnable.

### Milestone 1.15 — Research System (Linear) ✅
- ~~3 doctrine paths defined (War Machine, Fortress, Commerce)~~
- ~~6 specialisations with rock-paper-scissors counter-play matrix~~
- ~~Doctrine/specialisation bonuses applied in combat and economy~~
- ~~Research Panel with research / doctrine / specialisation actions~~ (`ResearchPanel.tsx`)
- **UAT:** You research. You level up. Something changes. "Progress feels real."

### Milestone 1.16 — Achievement Tracking & First Three Achievements `Engine ✅ | UI ✅` *(verify galaxy responses in UAT)*
- ~~All 9 achievement definitions with trigger thresholds~~
- ~~Achievement progress percentage calculation~~
- ~~Achievement context population (eliminated count, coalitions survived)~~
- ~~Achievement Panel~~ (`AchievementPanel.tsx`, opened from Empire Panel)
- Verify in UAT: galaxy-wide event and title badge on earn
- **UAT:** You earn an achievement. The galaxy names you. Rivals respond. "This is the endgame."

---

## Phase 1 Complete — Internal Alpha UAT

> **Checkpoint:** The full core loop is playable. You can start a campaign, expand, build, fight, trade, negotiate, research, and earn achievements across a persistent galaxy of 100 rival empires. Save/load works. The LCARS interface is functional.
>
> **Current Reality (2026-07-15, re-audited):** Engine is ~90% complete (934/934 tests passing, `tsc` clean, production build succeeds). UI is ~75% complete — 11 panels are built and wired into `App.tsx` (Empire, System, Military, Market, Diplomacy, Research, Achievement, Syndicate, Covert Ops, HUD, Cycle Report), plus title screen with New Campaign / Continue and save-to-localStorage. The previous "UI ~5%" note was stale.
>
> **Remaining for Phase 1 UAT:** (1) **Combat UI** — attack action + combat/invasion result modal (milestones 1.10/1.11); this is the only core-loop verb the player still cannot perform. (2) Sector panel (1.2). (3) Coalition convergence-alert UI (1.14). (4) Covenant lines on the star map (1.13). After the combat UI lands, run the full Phase 1 UAT walk-through end to end — most engine work has never been played by hand.

---

## Phase 2 — Depth Systems

> **Goal:** All nine achievements reachable. Deeper combat, covert ops, the Syndicate, and tech drafting.
>
> **Priority order revised 2026-03-27:** Syndicate and Covert Ops block 2 of 9 achievements (Shadow Throne, Cartel Boss / Stealth Sovereign) and require the most implementation LOC. They are elevated to the top of Phase 2.
>
> **Status 2026-07-15:** Milestones 2.1–2.3 (Installations, Syndicate, Covert Ops) are implemented — engine and UI — but have never been UAT'd. 2.9 (wormholes) is mostly done. The heavy remaining Phase 2 items are 2.4 (blockades), 2.6 (remaining achievements + galaxy responses), 2.7 (reputation memory), and the draft modal (2.5).

### Milestone 2.1 — Installation System `Engine ✅ | UI ✅` *(needs UAT)*
- ~~Installation type definitions~~ (`installation-registry.ts`)
- ~~Slot limits with anomaly-driven slot unlocks~~ (`slot-unlocker.ts`)
- ~~Installation condition scales production output (better than spec — see `docs/AUDIT.md`)~~
- ~~Installation build UI in Star System panel~~ (`SystemPanel.tsx` → `build-installation`)
- **UAT:** You build an installation on your home world. Your income increases. Slot limits prevent overbuild. "Development matters."

### Milestone 2.2 — Syndicate Discovery & Engagement `Engine ✅ | UI ✅` *(needs UAT)*
- ~~Rank system with influence-based progression~~ (`computeRankFromInfluence`)
- ~~Contracts, control (`computeController`), exposure (`checkExposure`), counter-intel decay~~
- ~~Black Register access with rank-gated items~~ (`purchaseBlackRegisterItem`)
- ~~Syndicate UI panel with funding and Black Register purchases~~ (`SyndicatePanel.tsx`)
- **Blocks:** Shadow Throne achievement, Cartel Boss achievement
- **UAT:** You stumble onto the Syndicate organically. You access the Black Register. "There's a shadow economy."

### Milestone 2.3 — Covert Operations `Engine ✅ | UI ✅` *(needs UAT)*
- ~~Operation types with defined effects~~ (`COVERT_OPERATION_DEFS`, `COVERT_OP_EFFECTS`)
- ~~Agent economy (`accrueAgents`), success/detection rolls, op queue and resolution~~
- ~~Stealth Sovereign check~~ (`checkStealthSovereign`)
- ~~Covert Ops UI: select target and operation, launch~~ (`CovertOpsPanel.tsx`)
- **Blocks:** Stealth Sovereign achievement
- **UAT:** You assign an agent. They sabotage a rival. You get caught. War is declared. "The shadows have claws."

### Milestone 2.4 — Blockade Combat Mode `Engine ~60% | UI ❌`
- ~~Blockade effect calculation~~ (`calculateBlockadeEffect` in combat resolver)
- Blockade action wiring in cycle processor + starvation escalation — **verify/complete**
- Blockade-break combat; UI indicator on blockaded systems — **missing**
- **UAT:** You blockade a bot's system. It starves over multiple Cycles.

### Milestone 2.5 — Research Draft Mechanic (Doctrines & Capstones) `Engine ~60% | UI ~50%`
- ~~Draft trigger detection on tier transitions~~ (`checkResearchDraftTrigger`)
- ~~Doctrine/specialisation selection actions wired through Research Panel~~
- ~~Dreadnought defined as 7th (capstone) unit type~~
- Capstone unlock events (Impregnable Bastion, Trade Hegemony) — **verify/complete**
- Draft UI: card selection modal during Reckoning (currently selected from Research Panel instead) — **missing**
- **UAT:** You draft a Doctrine during a Nexus Reckoning. A bot takes the one you wanted.

### Milestone 2.6 — Remaining 6 Achievements + Galaxy Responses
- All 9 achievement paths live and triggerable
- Each achievement triggers a distinct, scaled galaxy response
- Anti-snowball coalition response scales to proximity of completion
- **UAT:** All 9 achievement paths are live. Each triggers a distinct galaxy response.

### Milestone 2.7 — Reputation System & Full Diplomatic Memory
- Bot relationship memory pruning (maintenance per Tier 2 Phase 10 spec)
- Long-term betrayal memory (bots remember violations for 30+ Cycles)
- Full reputation score surfaced in Diplomacy Panel
- **UAT:** A bot remembers your betrayal 30 Cycles later. No one will ally with you.

### Milestone 2.8 — Market Events `Engine ~70% | UI ❌`
- ~~Market event types implemented in market engine (famine etc.)~~
- Merchant archetype Market Insight (price forecasting, whale tracking) — **verify/complete**
- Leader Tax (20% premium on purchases for highest-power empire) — **verify/complete**
- Event notifications surfaced to the player — **missing**
- **UAT:** A Famine event fires. Food prices spike. You profit by selling your reserves.

### Milestone 2.9 — Wormhole Construction `Engine ✅ | UI ~80%`
- ~~Wormhole build action~~ (`build-wormhole`, wired via System Panel)
- ~~Map overlay showing wormhole edges~~ (`StarMap.tsx`)
- Jump mechanics: fleet transit across non-adjacent systems — **depends on fleet-movement UI (1.10); engine `move-fleet` path repaired 2026-07-15 but `calculateTransitTime` ignores distance/wormholes**
- **UAT:** You build a wormhole. Your fleet jumps across the galaxy.

### Milestone 2.10 — LCARS UI Polish Pass
- Every panel, modal, and readout is consistent and premium
- Animations, transitions, sound hooks (if applicable)
- Accessibility pass (keyboard navigation, contrast)
- **UAT:** Every panel, modal, and readout feels premium.

---

## Phase 2 Complete — Closed Beta UAT

> **Checkpoint:** All nine achievement paths work. The Syndicate is discoverable. Covert Ops provide a non-military path. Research drafting creates genuine tension. The game has strategic depth for extended campaign play.

---

## Phase 3 — Personality & Prestige

> **Goal:** Bots feel like characters. The deepest systems (Shadow Throne, LLM bosses) work.

### Milestone 3.1 — Syndicate Control Path & Exposure
- **UAT:** You control the Syndicate. A rival exposes you. The galaxy turns on you.

### Milestone 3.2 — Shadow Throne Achievement
- **UAT:** You hold Syndicate control + another achievement without being exposed.

### Milestone 3.3 — LLM Nemesis Bots (with Graceful Degradation) `Engine ~30% | UI ❌`
- ~~LLM connector scaffold with sync fallback~~ (`bot/llm-connector.ts`, `fetchApexBotActionsSync`)
- Apex tier bot decisions actually routed through LLM — **not wired to a live model**
- Bot emotional amplitude/resonance system (replace boolean flags with designed system)
- Tell system: archetype telegraph rates surface in Diplomacy Panel
- **UAT:** A Nemesis bot sends you a threatening message that feels written by a person.

### Milestone 3.4 — 100 Named Bot Personas
- **UAT:** Every bot has a name, backstory, and distinct personality.

### Milestone 3.5 — Scenario Pack System
- Scenario configuration loading; distinct goals and constraints per scenario
- **UAT:** You load a scenario with a specific goal and constraints. Same engine, different experience.

### Milestone 3.6 — Performance Tuning (<1s Turn Processing)
- End-to-end integration tests: simulate 100+ full cycles without regression
- Profile and optimise hot paths in Cycle Processor and Bot Engine
- **UAT:** 100 empires, complex game state, turn resolves in under a second.

---

## Phase 3 Complete — Open Beta UAT

---

## Phase 4 — Release (v1.0)

### Milestone 4.1 — Balance Pass (Simulation-Calibrated Thresholds)
### Milestone 4.2 — Full Test Coverage
### Milestone 4.3 — In-Game Documentation & Help
### Milestone 4.4 — Steam Store Integration & Packaging
### Milestone 4.5 — Zero P0/P1 Bugs

---

## Phase 4 Complete — Ship It
