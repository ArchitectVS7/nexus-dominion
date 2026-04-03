# Nexus Dominion — Phased Coding Plan

> **Version:** 1.1
> **Last Updated:** 2026-03-27
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

### Milestone 1.2 — Star System & Sector Panels `Engine N/A | UI ❌`
- Click a star system → slide-in panel shows: name, sector, owner, resources, development level
- Click a sector region → slide-in panel shows: 25 systems, ownership breakdown, dominance status
- Panels dismiss via `X`, backdrop click, or `Escape`
- **UAT:** You click stars, you read data, you close panels. "This is the information model."

---

## Phase 1B — The Empire (Your Economy)

> **Goal:** You have an empire that produces and consumes resources each turn. You can see your ledger and understand your position.

### Milestone 1.3 — Game State & Empire Model `Engine ✅ | UI ❌`
- ~~Core data model: `GameState`, `Empire`, `StarSystem`, `Sector` (TypeScript types)~~
- ~~Galaxy generator: procedurally place 100 empires, 150 unclaimed systems across 10 sectors~~
- ~~Player starts with 1 home system; 99 bots each have 1 home system~~
- Save/load round-trip to local storage (State Chronicle foundation) — **engine missing; ~150 LOC**
- Wire `GameStateProvider` into `main.tsx` so state is available app-wide — **not connected**
- **UAT:** You start a new campaign. The galaxy is populated. You can save the game and reload to the same state.

### Milestone 1.4 — Resource Production & Empire Panel `Engine ✅ | UI ❌`
- ~~Five resources (Credits, Food, Ore, Fuel Cells, Research Points) produce each Cycle based on owned systems~~
- Empire Panel slide-in: resource ledger with production, consumption, net income, and reserves
- `DataReadout` components show deltas in green/red
- **UAT:** You open the Empire Panel. You see your income. "I understand my economy."

---

## Phase 1C — The Turn (Cycle Processing)

> **Goal:** You can commit a turn and the world advances. This is the core loop.

### Milestone 1.5 — Cycle Commit & Cycle Report `Engine ✅ | UI ❌`
- ~~Cycle Processor runs: 17-phase pipeline, Tier 1 atomicity, Tier 2 graceful failure~~
- ~~Cosmic Order resolution order enforced~~
- "Commit Cycle" button in the HUD
- Cycle Report modal appears after commit: resource changes summarised
- Cycle counter increments; Confluence counter tracks progress toward Reckoning
- **UAT:** You press "Commit Cycle." Resources change. You read the report. "This is the heartbeat."

### Milestone 1.6 — Colonisation `Engine ✅ | UI ❌`
- ~~Unclaimed star systems can be claimed by bots and player (engine logic complete)~~
- Colonisation UI: select unclaimed system → colonise action in system panel
- Colonisation costs resources, takes N Cycles, then system begins producing
- **UAT:** You colonise a neighbouring star. You wait. It completes. Your income goes up. "This is expansion."

---

## Phase 1D — The Bots (They're Alive)

> **Goal:** Bots take actions each Cycle. The galaxy moves without you.

### Milestone 1.7 — Bot Momentum & Colonisation AI `Engine ✅ | UI ❌`
- ~~99 bots assigned archetypes and Momentum Ratings at campaign start~~
- ~~Bots colonise unclaimed systems each Cycle according to their Momentum Rating~~
- ~~8 archetypes with weighted action selection and emotional state modifiers~~
- Galaxy state updates visibly on the star map after Cycle commit (nodes change colour as bots claim territory)
- **UAT:** You commit 10 Cycles. You see bots spreading across the map. "The galaxy is alive."

### Milestone 1.8 — Cosmic Order & Nexus Reckoning `Engine ✅ | UI ❌`
- ~~Power score calculated for every empire (resources + territory + military)~~
- ~~Every 10 Cycles: Nexus Reckoning fires, empires sorted into Sovereign / Ascendant / Stricken tiers~~
- ~~Rolling 5-cycle average power scores; resolution order correctly shuffled~~
- Cosmic Order displayed in the Cycle Report and HUD
- **UAT:** You play 10 Cycles. The Reckoning fires. You see your tier. "The cosmos is watching."

---

## Phase 1E — Combat (Fleet Engagement)

> **Goal:** Military units exist. You can build fleets and attack.

### Milestone 1.9 — Military Build Queue `Engine ✅ | UI ❌`
- ~~6 unit types defined with D20 stat blocks (Soldiers, Fighters, Bombers, Stations, Light/Heavy Cruisers)~~
- ~~Build queue mechanics with cycle advancement and completion~~
- ~~Maintenance cost calculation per unit type~~
- Military Panel slide-in: unit types, build queue, fleet overview
- **UAT:** You build ships. You see your fleet. Maintenance costs show in the ledger. "I have an army."

### Milestone 1.10 — Fleet Engagement Combat `Engine ✅ | UI ❌`
- ~~Combat resolution: d20-style stat comparisons, defender 25% bonus, morale checks~~
- ~~Bots attack each other and the player via bot engine action selection~~
- Attack action UI: select a target star system, assign a fleet
- Combat result modal: casualties, victor, system ownership change
- **UAT:** You attack a bot's system. Combat resolves. You see the outcome. "War works."

### Milestone 1.11 — Ground Invasion `Engine ✅ | UI ❌`
- ~~Sequential phase resolution: Fleet Engagement → Orbital Bombardment → Ground Assault~~
- ~~Morale checks at 50% fleet / 75% ground casualties~~
- Infrastructure damage from bombardment — **stubbed; ~100 LOC to complete**
- Invasion UI: phase-by-phase combat modal with phase indicator
- **UAT:** You conquer a system through the full combat sequence. "Conquest is satisfying."

---

## Phase 1F — Diplomacy & Market

> **Goal:** You can trade, negotiate, and form alliances.

### Milestone 1.12 — Market System `Engine ~75% | UI ❌`
- ~~Base prices, buy/sell transactions, transaction fees, price decay toward base~~
- ~~Price clamping (50%–200% of base)~~
- Supply/demand coupling: prices respond to actual trade volumes — **missing; ~150 LOC**
- Market Panel: buy/sell five resources at dynamic prices
- **UAT:** You buy Ore. You sell Credits. Prices change next turn. "The economy is dynamic."

### Milestone 1.13 — Basic Diplomacy (Stillness Accord & Star Covenant) `Engine ~70% | UI ❌`
- ~~Pact creation/acceptance/violation mechanics~~
- ~~Relationship memory and reputation tracking~~
- ~~Treaty violation penalties (reputation hit, combat bonus for injured party)~~
- Covenant defence obligations enforcement — **not wired; ~100 LOC**
- Diplomacy Panel: propose/accept/reject NAPs and Alliances
- Covenant Lines visible on the star map
- **UAT:** You make a peace deal. You ally with a bot. You see the alliance on the map. "Diplomacy has weight."

### Milestone 1.14 — Nexus Compact (Coalition) `Engine ~60% | UI ❌`
- ~~Convergence alert checking when empire approaches achievement threshold~~
- ~~Coalition pact type defined in diplomacy engine~~
- Bot coalition formation logic — **partially implemented**
- Shared War Chest and combat bonus vs. target — **not implemented**
- Coalition UI: convergence alert modal, coalition membership display
- **UAT:** A bot becomes dominant. A coalition forms. You see it unfold. "The galaxy polices itself."

---

## Phase 1G — Research & Achievements

> **Goal:** Tech tree is functional. Achievements are trackable and earnable.

### Milestone 1.15 — Research System (Linear) `Engine ✅ | UI ❌`
- ~~3 doctrine paths defined (War Machine, Fortress, Commerce)~~
- ~~6 specialisations with rock-paper-scissors counter-play matrix~~
- ~~Doctrine/specialisation bonuses applied in combat and economy~~
- Research Panel: 8 tech levels, linear progression (draft deferred to Phase 2)
- **UAT:** You research. You level up. Something changes. "Progress feels real."

### Milestone 1.16 — Achievement Tracking & First Three Achievements `Engine ~85% | UI ❌`
- ~~All 9 achievement definitions with trigger thresholds~~
- ~~Achievement progress percentage calculation~~
- Achievement context population (eliminated count, coalitions survived) — **incomplete**
- Achievement Panel visible in the Empire Panel
- Three achievements earnable in alpha: **Conquest**, **Trade Prince**, **Warlord**
- Galaxy-wide event and title badge on earn
- **UAT:** You earn an achievement. The galaxy names you. Rivals respond. "This is the endgame."

---

## Phase 1 Complete — Internal Alpha UAT

> **Checkpoint:** The full core loop is playable. You can start a campaign, expand, build, fight, trade, negotiate, research, and earn achievements across a persistent galaxy of 100 rival empires. Save/load works. The LCARS interface is functional.
>
> **Current Reality (2026-03-27):** Engine is ~75% complete overall. UI is ~5% complete — only Star Map is functional. All 13 game panels (Empire, Cycle Report, System, Sector, Military, Combat, Market, Diplomacy, Research, Achievement, Colonisation, Build Queue, Save/Load) remain to be built. Phase 1 UAT is **not yet passable**.

---

## Phase 2 — Depth Systems

> **Goal:** All nine achievements reachable. Deeper combat, covert ops, the Syndicate, and tech drafting.
>
> **Priority order revised 2026-03-27:** Syndicate and Covert Ops block 2 of 9 achievements (Shadow Throne, Cartel Boss / Stealth Sovereign) and require the most implementation LOC. They are elevated to the top of Phase 2.

### Milestone 2.1 — Installation System `Engine ❌ | UI ❌` *(New — was missing from plan)*
- Installation type definitions (Trade Hub, Mining Complex, Orbital Defense Platform, etc.)
- Building queue separate from unit queue; slot limits enforced per biome
- Biome production bonuses applied (Core World, Mineral World, Frontier World, etc.)
- Development cost scaling; sector dominance mechanics
- Installation management UI in Star System panel
- **Estimated:** ~300 LOC engine, ~150 LOC UI
- **UAT:** You build a Trade Hub on your home world. Your income increases. Slot limits prevent overbuild. "Development matters."

### Milestone 2.2 — Syndicate Discovery & Engagement `Engine ❌ | UI ❌` *(elevated from 2.3)*
- 8-rank Syndicate system: discovery through anomalies, rank progression
- Contracts, control mechanics, exposure mechanics
- Black Market access (items, intelligence, covert capabilities)
- Syndicate UI panel: rank status, active contracts, exposure risk
- **Estimated:** ~500 LOC engine, ~200 LOC UI
- **Blocks:** Shadow Throne achievement, Cartel Boss achievement
- **UAT:** You stumble onto the Syndicate organically. You access the Black Market. "There's a shadow economy."

### Milestone 2.3 — Covert Operations `Engine ❌ | UI ❌` *(elevated from 2.2)*
- 10 operation types, agent economy, success/detection rolls
- Diplomatic consequences on exposure; war declaration trigger
- Intelligence Points generation and expenditure
- Covert Ops UI: assign agent, select operation, risk display
- **Estimated:** ~400 LOC engine, ~150 LOC UI
- **Blocks:** Stealth Sovereign achievement
- **UAT:** You assign an agent. They sabotage a rival. You get caught. War is declared. "The shadows have claws."

### Milestone 2.4 — Blockade Combat Mode `Engine ❌ | UI ❌`
- Blockade action: cut off system resource income over multiple Cycles
- Starvation mechanics (food deficit escalation under blockade)
- Blockade-break combat; UI indicator on blockaded systems
- **UAT:** You blockade a bot's system. It starves over multiple Cycles.

### Milestone 2.5 — Research Draft Mechanic (Doctrines & Capstones) `Engine ~40% | UI ❌`
- Draft event fires at Nexus Reckoning when tier thresholds are reached
- Doctrine choice becomes public; specialisation remains hidden
- Capstone unlock events (Dreadnought, Impregnable Bastion, Trade Hegemony)
- Dreadnought unit creation and special abilities
- Draft UI: card selection modal during Reckoning
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

### Milestone 2.8 — Market Events
- Bumper Harvest, Famine, Mining Boom, Fuel Shortage event types
- Merchant archetype Market Insight (price forecasting, whale tracking)
- Leader Tax (20% premium on purchases for highest-power empire)
- **UAT:** A Famine event fires. Food prices spike. You profit by selling your reserves.

### Milestone 2.9 — Wormhole Construction
- Wormhole building cost and construction queue
- Jump mechanics: fleet transit across non-adjacent systems
- Map overlay showing wormhole connections
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

### Milestone 3.3 — LLM Nemesis Bots (with Graceful Degradation)
- Apex tier bot decisions routed to LLM with weighted-random fallback
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
