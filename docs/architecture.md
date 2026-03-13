# Nexus Dominion — Architecture

> **Status:** Active — Specification Phase
> **Version:** 3.0
> **Last Updated:** 2026-03-09
> **Author:** VS7
> **PRD:** [docs/prd.md](./prd.md)

---

## System Overview

Nexus Dominion is a turn-based single-player 4X space empire strategy game targeting long, persistent campaigns. It is currently transitioning into active development based on **PRD 3.0**.

The agreed runtime architecture is a **Hybrid Native/Web Application** (e.g., Tauri or Electron encapsulating a React/TypeScript frontend). This approach has been selected to leverage modern web technologies for the complex, panel-heavy LCARS interface while utilizing native OS capabilities (and potentially Rust via Tauri) to handle the computationally heavy simulation of 100 concurrent AI empires and ensure performant turn resolution.

Up to 100 bot opponents operate simultaneously, advancing based on individual **Momentum Ratings** rather than fixed algorithmic tiers. They fight each other, form alliances, and pursue Achievements between player turns, producing an emergent simulation of a living galaxy.

### Top-Level Diagram

```
┌───────────────────────────────────────────────────────────────┐
│              Desktop Client (Tauri / Electron)                │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   Frontend (React/TS)                   │  │
│  │  Star Map (WebGL/Canvas) · LCARS Panels · Turn HUD      │  │
│  └───────────────────────────┬─────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼─────────────────────────────┐  │
│  │                  Game Engine Core                       │  │
│  │  Cycle Processor · Combat Engine · Economy Engine       │  │
│  │  Diplomacy Engine · Research Engine · Syndicate Engine  │  │
│  │  Nexus Engine (Cosmic Order · Confluences · Signals)    │  │
│  └───────────────────────────┬─────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼─────────────────────────────┐  │
│  │                   Bot AI System                         │  │
│  │  Momentum Scheduler · Archetype Decision Weights        │  │
│  │  Emotional State · Relationship Memory                  │  │
│  └───────────────────────────┬─────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼─────────────────────────────┐  │
│  │                   Database / State Store                │  │
│  │  Database State Chronicle (Auto-Saves)                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Game Loop & Cycle Processing
- **Responsibility:** Sequence and resolve all player and bot actions per Cycle; update the Cosmic Order every Confluence.
- **Inputs:** Player action queue, bot decision outputs governed by Momentum Ratings.
- **Outputs:** Updated game state; event log for the Cycle Report.
- **Notes:** Performance target is <5s per turn in alpha, <1s at release with 100 active empires calculating simultaneous moves.

### 2. Galaxy and Sector System
- **Responsibility:** Manage the 10-sector galaxy map, wormhole connectivity, and territorial expansion.
- **Inputs:** Empire expansion actions, wormhole construction events.
- **Outputs:** Sector ownership state, adjacency graph, wormhole network.

### 3. Combat System
- **Responsibility:** Resolve military engagements using d20-style stat block comparisons across three distinct phases.
- **Three phases:**
  1. Fleet Engagement — space combat in orbit
  2. Blockade / Orbital Bombardment — structural and economic targeting
  3. Ground Assault — planetary invasion
- **Outputs:** Combat result, casualties, sector ownership change, rep hits.

### 4. Economy Engine
- **Responsibility:** Process the rigorous Production-Consumption cycle at the end of every turn, enforce limits on populations and military maintenance.
- **Inputs:** Player and bot infrastructure, Civil Status modifiers.
- **Outputs:** Per-empire resource deltas, Market adjustments.

### 5. Bot AI System
- **Responsibility:** Generate bot decisions each turn; maintain emotional state and relationship memory across 100 personas.
- **Architecture:** 
  - Bots no longer use strict "Intelligence Tiers". Instead, they use a **Momentum Rating** which directly scales the number of actions they can take per standard player Cycle.
  - **8 Archetypes:** Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist. These dictate *what* they do, while Momentum dictates *how much* they can do.
  - Tier 1 LLM integration is optionally reserved for high-momentum "Boss" interactions.

### 6. Diplomacy System
- **Responsibility:** Manage Commons-registered pacts (Stillness Accord, Star Covenant, Nexus Compact).
- **Key structures:** Formation of massive anti-snowballing Nexus Compacts against empires nearing achievements.

### 7. Tech Card & Research System
- **Responsibility:** Gate baseline stat advancement through the 8-tier tech tree and handle Public Draft Events for Tech Cards.
- **Notes:** Draft events occur dynamically during the "Nexus Reckoning" at the end of a 10-Cycle Confluence.

### 8. Syndicate System
- **Responsibility:** Discoverable hidden-role overlay controlling the Black Market and covert assassination contracts.
- **Notes:** Controlling the Syndicate without exposure is required for the "Shadow Throne" achievement.

### 9. Achievement Checker
- **Responsibility:** Monitor game state against the 9 continuous milestones.
- **Achievements:** Conquest, Trade Prince, Market Overlord, Cartel Boss, Grand Architect, Singularity, Warlord, Endurance, Shadow Throne.
- **Action:** Generates "Nexus Signals" and "Convergence Alerts" to trigger organic coalition pushback when an empire crosses 80% completion of a threshold. 

### 10. Frontend (React/LCARS)
- **Responsibility:** Render the persistent WebGL/Canvas star map, slide-in card panels, turn HUD, and all game screens.
- **Notes:** The Star Map never leaves view. Panels animate in/out like board game cards being examined on a table.

---

## Deployment Architecture

Nexus Dominion is deployed as a self-contained single-player application designed to run natively on Desktop.

| Target Platform | Deployment Method | Notes |
|---|---|---|
| Desktop (Steam) | Tauri or Electron | Main target. Combines web-native UI tools with OS-level computational power for the engine. |

### Development Stack (Agreed)
- **Frontend Framework:** React + TypeScript (for mature component ecosystem and structured states).
- **Desktop Wrapper:** Tauri (Rust) or Electron (Node.js). Tauri is preferred moving forward for reduced memory overhead and the ability to port heavy pathfinding/simulation math to Rust if the 100-empire bottleneck requires it.
- **Styling:** CSS Modules / Styled-Components tailored to strict LCARS design constraints.

---

## Data Architecture

### Game State (In-Memory Model)

```
GameState
├── galaxy: Galaxy
│   └── sectors[10]: Sector
│       ├── owner: EmpireId | null
│       ├── planets: Planet[]
│       └── wormholes: WormholeEdge[]
├── empires[1..100]: Empire
│   ├── resources: { credits, food, ... }
│   ├── fleets: Fleet[]
│   ├── techs: TechLevel[]
│   └── relationships: Map<EmpireId, RelationshipState>
├── bots[]: BotAgent
│   ├── persona: PersonaProfile
│   ├── archetype: Archetype
│   ├── momentumRating: float
│   └── emotionalState: EmotionalState
├── diplomacy: DiplomacyState
│   ├── pacts: Pact[]
│   └── coalitions: Coalition[]
├── economy: EconomyState
├── syndicateState: SyndicateState
└── time: TimeState
    ├── currentCycle: number
    ├── currentConfluence: number
    └── cosmicOrder: CosmicOrder
```

### Persistence (State Chronicle)
Save/load to local database/JSON file via the database State Chronicle. Saves are fired explicitly by the user, or automatically before major acts of war/nexus reckonings. No cloud save or account system in v1.0.

---

## Open Questions

| Question | Owner | Due | Status |
|---|---|---|---|
| Tauri vs Electron: Final prototype validation? | VS7 | Pre-implementation | Open |
| Will LLM boss bots use a bundled local model (Llama.cpp) or call an external API? | VS7 | Pre-implementation | Open |
| What is the exact Database schema for the State Chronicle? | VS7 | Pre-implementation | Open |
