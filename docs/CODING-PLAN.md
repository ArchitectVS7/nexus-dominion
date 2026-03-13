# Nexus Dominion — Phased Coding Plan

> **Version:** 1.0
> **Last Updated:** 2026-03-09
> **Author:** VS7
> **Architecture:** Tauri + React/TypeScript (see `docs/architecture.md`)
> **PRD:** `docs/prd.md` v3.0

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

### Milestone 1.0 — Foundation Scaffold
- Core types: `GameState`, `Empire`, `StarSystem`, `Sector`, `Galaxy`, `Resources`, IDs
- Engine interfaces: `ICycleProcessor`, `IGalaxyGenerator`, `ICombatResolver`, `IBotDecisionEngine`
- Project directory structure (`engine/`, `ui/`, `hooks/`)
- State management: `GameStateContext` + `useGameState()` hook
- **UAT:** `npm run build` passes. Type imports work across the codebase. "The skeleton is ready."

---

## Phase 1A — The Galaxy (Static)

> **Goal:** You can see the galaxy and interact with the star map. No game logic yet — it's a sandbox for the spatial layer.

### Milestone 1.1 — Star Map Rendering
- WebGL/Canvas galaxy renderer: 250 star system nodes, 10 sector regions
- Nodes coloured by ownership (player = blue, unclaimed = grey, bots = faction colours)
- Sector boundaries visible as grouped regions
- Pan, zoom, click-to-select on nodes
- **UAT:** You can pan around a galaxy. You can zoom. You click a star and it highlights. "This is the board."

### Milestone 1.2 — Star System & Sector Panels
- Click a star system → slide-in panel shows: name, sector, owner, resources, development level
- Click a sector region → slide-in panel shows: 25 systems, ownership breakdown, dominance status
- Panels dismiss via `X`, backdrop click, or `Escape`
- **UAT:** You click stars, you read data, you close panels. "This is the information model."

---

## Phase 1B — The Empire (Your Economy)

> **Goal:** You have an empire that produces and consumes resources each turn. You can see your ledger and understand your position.

### Milestone 1.3 — Game State & Empire Model
- Core data model: `GameState`, `Empire`, `StarSystem`, `Sector` (TypeScript types)
- Galaxy generator: procedurally place 100 empires, 150 unclaimed systems across 10 sectors
- Player starts with 1 home system; 99 bots each have 1 home system
- Save/load round-trip to local storage (State Chronicle foundation)
- **UAT:** You start a new campaign. The galaxy is populated. You can save the game and reload to the same state.

### Milestone 1.4 — Resource Production & Empire Panel
- Five resources (Credits, Food, Ore, Petroleum, Research Points) produce each Cycle based on owned systems
- Empire Panel slide-in: resource ledger with production, consumption, net income, and reserves
- `DataReadout` components show deltas in green/red
- **UAT:** You open the Empire Panel. You see your income. "I understand my economy."

---

## Phase 1C — The Turn (Cycle Processing)

> **Goal:** You can commit a turn and the world advances. This is the core loop.

### Milestone 1.5 — Cycle Commit & Cycle Report
- "Commit Cycle" button in the HUD
- Cycle Processor runs: production phase (resources calculated), consumption phase (maintenance deducted)
- Cycle Report modal appears after commit: resource changes summarised
- Cycle counter increments; Confluence counter tracks progress toward Reckoning
- **UAT:** You press "Commit Cycle." Resources change. You read the report. "This is the heartbeat."

### Milestone 1.6 — Colonisation
- Unclaimed star systems can be colonised from the Star System Panel
- Colonisation costs resources and takes N Cycles to complete
- Colonised systems begin producing resources
- **UAT:** You colonise a neighbouring star. You wait. It completes. Your income goes up. "This is expansion."

---

## Phase 1D — The Bots (They're Alive)

> **Goal:** Bots take actions each Cycle. The galaxy moves without you.

### Milestone 1.7 — Bot Momentum & Colonisation AI
- 99 bots assigned archetypes and Momentum Ratings at campaign start
- Bots colonise unclaimed systems each Cycle according to their Momentum Rating
- Galaxy state updates visibly on the star map (nodes change colour as bots claim territory)
- **UAT:** You commit 10 Cycles. You see bots spreading across the map. "The galaxy is alive."

### Milestone 1.8 — Cosmic Order & Nexus Reckoning
- Power score calculated for every empire (resources + territory + military)
- Every 10 Cycles: Nexus Reckoning fires, empires sorted into Sovereign / Ascendant / Stricken tiers
- Cosmic Order displayed in the Cycle Report and HUD
- Cycle resolution order follows tier priority (Stricken first, Sovereign last)
- **UAT:** You play 10 Cycles. The Reckoning fires. You see your tier. "The cosmos is watching."

---

## Phase 1E — Combat (Fleet Engagement)

> **Goal:** Military units exist. You can build fleets and attack.

### Milestone 1.9 — Military Build Queue
- Military Panel slide-in: unit types, build queue, fleet overview
- Units cost resources, take Cycles to build, require maintenance
- Military power calculated from fleet composition
- **UAT:** You build ships. You see your fleet. Maintenance costs show in the ledger. "I have an army."

### Milestone 1.10 — Fleet Engagement Combat
- Attack action: select a target star system, assign a fleet
- Combat resolution: Fleet Engagement using d20-style stat comparisons
- Combat result modal: casualties, victor, system ownership change
- Bots can attack each other and the player
- **UAT:** You attack a bot's system. Combat resolves. You see the outcome. "War works."

### Milestone 1.11 — Ground Invasion
- After fleet victory: optional orbital bombardment phase, then ground assault
- Troop units required for ground combat; victory transfers system ownership
- Defender advantage bonus for home systems
- **UAT:** You conquer a system through the full combat sequence. "Conquest is satisfying."

---

## Phase 1F — Diplomacy & Market

> **Goal:** You can trade, negotiate, and form alliances.

### Milestone 1.12 — Market System
- Market Panel: buy/sell five resources at dynamic prices
- Prices fluctuate based on galaxy-wide supply and demand each Cycle
- **UAT:** You buy Ore. You sell Credits. Prices change next turn. "The economy is dynamic."

### Milestone 1.13 — Basic Diplomacy (Stillness Accord & Star Covenant)
- Diplomacy Panel: propose/accept/reject NAPs and Alliances
- Bots accept or reject based on archetype and relationship state
- Treaty violations trigger reputation penalties and combat bonuses
- Covenant Lines visible on the star map
- **UAT:** You make a peace deal. You ally with a bot. You see the alliance on the map. "Diplomacy has weight."

### Milestone 1.14 — Nexus Compact (Coalition)
- Multi-party coalition formation against a dominant power
- Convergence Alert fires when an empire approaches an achievement threshold
- Shared War Chest and combat bonus vs. target
- Bots form Compacts independently
- **UAT:** A bot becomes dominant. A coalition forms. You see it unfold. "The galaxy polices itself."

---

## Phase 1G — Research & Achievements

> **Goal:** Tech tree is functional. Achievements are trackable and earnable.

### Milestone 1.15 — Research System (Linear)
- Research Panel: 8 tech levels, linear progression (draft deferred to Phase 2)
- Each level unlocks meaningful capability improvements
- Research Points spent per Cycle to advance
- **UAT:** You research. You level up. Something changes. "Progress feels real."

### Milestone 1.16 — Achievement Tracking & First Three Achievements
- Achievement progress tracked across all 9 paths in game state
- Achievement Panel visible in the Empire Panel
- Three achievements earnable in alpha: **Conquest**, **Trade Prince**, **Warlord**
- Earning an achievement triggers a galaxy-wide event and title badge
- Anti-snowball coalition response scales to the approaching achievement
- **UAT:** You earn an achievement. The galaxy names you. Rivals respond. "This is the endgame."

---

## Phase 1 Complete — Internal Alpha UAT

> **Checkpoint:** The full core loop is playable. You can start a campaign, expand, build, fight, trade, negotiate, research, and earn achievements across a persistent galaxy of 100 rival empires. Save/load works. The LCARS interface is functional.

---

## Phase 2 — Depth Systems

> **Goal:** All nine achievements reachable. Deeper combat, covert ops, the Syndicate, and tech drafting.

### Milestone 2.1 — Blockade Combat Mode
- **UAT:** You blockade a bot's system. It starves over multiple Cycles.

### Milestone 2.2 — Covert Operations
- **UAT:** You assign an agent. They sabotage a rival. You get caught. War is declared.

### Milestone 2.3 — Syndicate Discovery & Engagement
- **UAT:** You stumble onto the Syndicate organically. You access the Black Market.

### Milestone 2.4 — Research Draft Mechanic (Doctrines & Capstones)
- **UAT:** You draft a Doctrine during a Nexus Reckoning. A bot takes the one you wanted.

### Milestone 2.5 — Remaining 6 Achievements + Galaxy Responses
- **UAT:** All 9 achievement paths are live. Each triggers a distinct galaxy response.

### Milestone 2.6 — Reputation System & Full Diplomatic Memory
- **UAT:** A bot remembers your betrayal 30 Cycles later. No one will ally with you.

### Milestone 2.7 — Wormhole Construction
- **UAT:** You build a wormhole. Your fleet jumps across the galaxy.

### Milestone 2.8 — LCARS UI Polish Pass
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
- **UAT:** A Nemesis bot sends you a threatening message that feels written by a person.

### Milestone 3.4 — 100 Named Bot Personas
- **UAT:** Every bot has a name, backstory, and distinct personality.

### Milestone 3.5 — Scenario Pack System
- **UAT:** You load a scenario with a specific goal and constraints. Same engine, different experience.

### Milestone 3.6 — Performance Tuning (<1s Turn Processing)
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

## Phase 4 Complete — Ship It 🚀
