# Nexus Dominion — Architecture

> **Status:** Active — Specification Phase (no game implementation yet)
> **Version:** 2.1
> **Last Updated:** 2026-03-06
> **Author:** VS7
> **PRD:** [docs/prd.md](./prd.md)

---

## System Overview

Nexus Dominion is a turn-based single-player 4X space empire strategy game targeting 1–3 hour sessions. It is currently in a specification-driven design phase: the repository contains 15 detailed system-specification documents and Node.js tooling for validating those specs, but no game implementation exists yet.

The planned runtime is a browser-based or Electron-hosted JavaScript application (Node.js 14+). The LCARS (Star Trek command console) aesthetic defines the UI paradigm: a persistent star-map at centre, panels that slide in like cards, every turn action weighted and clear.

Up to 100 bot opponents operate simultaneously with independent emotional states, relationship memory, and the 4-tier AI architecture. Bots fight each other between player turns, producing emergent "natural selection" dynamics where dominant empires rise and weaker ones fall without player involvement.

### Top-Level Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     Player Browser / Client                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    UI Layer (LCARS)                     │  │
│  │  Star Map (persistent) · Slide-in Panels · Turn HUD    │  │
│  └───────────────────────────┬─────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼─────────────────────────────┐  │
│  │                  Game Engine Core                       │  │
│  │  Turn Processor · Combat Engine · Economy Engine        │  │
│  │  Diplomacy Engine · Research Engine · Victory Checker   │  │
│  └───────────────────────────┬─────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼─────────────────────────────┐  │
│  │                   Bot AI System                         │  │
│  │  Tier 1 (LLM Elite) · Tier 2 (Strategic Decision Tree) │  │
│  │  Tier 3 (Rules-Based) · Tier 4 (Probabilistic Random)  │  │
│  │  Emotional State · Relationship Memory · 100 Personas  │  │
│  └───────────────────────────┬─────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼─────────────────────────────┐  │
│  │                   Game State Store                      │  │
│  │  Galaxy · Sectors · Empires · Relationships · History   │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Turn Processing System
- **Responsibility:** Sequence and resolve all player and bot actions per turn; enforce action ordering; advance game state
- **Technology:** JavaScript (planned)
- **Inputs:** Player action queue, bot decision outputs
- **Outputs:** Updated game state; event log for UI
- **Notes:** Performance target is <2s per turn in alpha, <300ms at release with 100 active empires. Specification: `docs/other/Game Systems/TURN-PROCESSING-SYSTEM.md`

### 2. Galaxy and Sector System
- **Responsibility:** Manage the 10-sector galaxy map, wormhole connectivity, and phase-gated expansion
- **Technology:** JavaScript graph data structure (planned)
- **Inputs:** Empire expansion actions, wormhole construction events
- **Outputs:** Sector ownership state, adjacency graph, wormhole network
- **Notes:** Expansion phases: same-sector consolidation → adjacent sector push → wormhole bridging to distant sectors. Spec: `SECTOR-MANAGEMENT-SYSTEM.md`

### 3. Combat System
- **Responsibility:** Resolve military engagements in three sequential phases
- **Technology:** JavaScript (planned)
- **Three phases:**
  1. Space Battle — fleet vs fleet in orbit
  2. Orbital Bombardment — fleet attacks planetary defences
  3. Ground Assault — troops vs troops on surface
- **Inputs:** Attacking and defending fleet/troop compositions, sector modifiers
- **Outputs:** Combat result, casualties, sector ownership change
- **Notes:** Spec: `COMBAT-SYSTEM.md`

### 4. Economy Engine
- **Responsibility:** Manage Credits, Food, and other resources; process market pricing; enforce Black Market
- **Technology:** JavaScript (planned)
- **Inputs:** Player and bot trade/production actions, supply/demand curves
- **Outputs:** Per-empire resource deltas, market price updates
- **Notes:** Dynamic market with supply/demand pricing. Spec: `MARKET-SYSTEM.md`, `RESOURCE-MANAGEMENT-SYSTEM.md`

### 5. Bot AI System
- **Responsibility:** Generate bot decisions each turn; maintain emotional state and relationship memory across 100 personas
- **Technology:** JavaScript (planned); Tier 1 bots optionally use an external LLM API
- **4-tier architecture:**

| Tier | Name | Mechanism | Count |
|---|---|---|---|
| 1 | LLM Elite | Natural language prompt to LLM API | Few (high-value personas) |
| 2 | Strategic | Decision tree + weights | Many |
| 3 | Simple | Rules-based lookup | Many |
| 4 | Random | Probabilistic selection | Remainder |

- **8 archetypes:** Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist
- **State tracked per bot:** emotional state (anger, fear, greed, ambition), relationship memory with each other bot and with the player
- **Notes:** Bots fight each other between player turns; "natural selection" means weak empires collapse without player involvement. Spec: `BOT-SYSTEM.md`, `AI-SYSTEM.md`

### 6. Diplomacy System
- **Responsibility:** Manage pacts, alliances, and the Coalition victory path
- **Technology:** JavaScript (planned)
- **Key structures:** Non-Aggression Pacts, Alliance treaties, Coalition formation (50% territory threshold triggers Diplomatic victory)
- **Notes:** Spec: `DIPLOMACY-SYSTEM.md`

### 7. Research System
- **Responsibility:** Gate technology advancement through 8 tech levels
- **Technology:** JavaScript (planned)
- **Notes:** Completing all 8 levels triggers Research victory. Spec: `RESEARCH-SYSTEM.md`

### 8. Syndicate System
- **Responsibility:** Hidden-role overlay; one or more bots secretly belong to the Syndicate faction with concealed objectives
- **Technology:** JavaScript (planned)
- **Notes:** Core v1.0 feature, not post-launch DLC. Spec: `SYNDICATE-SYSTEM.md`

### 9. Tech Card System
- **Responsibility:** Draft-style technology acquisition layer separate from the core research tree
- **Technology:** JavaScript (planned)
- **Notes:** Core v1.0 feature. Spec: `TECH-CARD-SYSTEM.md`

### 10. Victory Checker
- **Responsibility:** Evaluate victory conditions after each turn resolution
- **Technology:** JavaScript (planned)
- **6 victory conditions:**

| Victory | Trigger |
|---|---|
| Conquest | Control 60% of sectors |
| Economic | 1.5x net worth of nearest rival |
| Diplomatic | Coalition controls 50% of territory |
| Research | All 8 tech levels completed |
| Military | Military score 2x all opponents combined |
| Survival | Highest net worth at turn 200 |

- **Notes:** Spec: `VICTORY-SYSTEMS.md`

### 11. LCARS UI
- **Responsibility:** Render the persistent star map, slide-in panel system, turn HUD, and all game screens in the LCARS aesthetic
- **Technology:** JavaScript + browser rendering (planned; framework TBD)
- **Notes:** Star map never leaves view. Panels animate in/out like cards being examined. Spec: `FRONTEND-DESIGN.md`

---

## Specification Tooling (Current State)

The repository's current deliverables are documentation and validation scripts, not game code.

| Tool | File | Purpose |
|---|---|---|
| Spec validator | `scripts/validate-specs.js` | Validates system spec documents for completeness and cross-references |
| System analyser | `analyze-all-systems.js` | Analyses all system docs and produces a summary report |
| Dependency analyser | `analyze-dependencies.js` | Maps inter-system dependencies |
| Registry generator | `scripts/generate-registry.js` | Generates a system registry from spec files |

No automated tests exist yet. Validation is spec-level (document structure) rather than code-level.

---

## Data Architecture

### Game State (Planned In-Memory Model)

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
│   ├── tier: AiTier
│   └── emotionalState: EmotionalState
├── diplomacy: DiplomacyState
│   ├── pacts: Pact[]
│   └── coalitions: Coalition[]
├── market: MarketState
├── syndicateState: SyndicateState
└── turn: number
```

### Persistence (Planned)

Save/load to local JSON file (single-player, no server required). No cloud save or account system in v1.0.

---

## Deployment Architecture

Nexus Dominion is planned as a self-contained single-player application. No multiplayer infrastructure, no server, no accounts.

| Target Platform | Deployment Method | Notes |
|---|---|---|
| Browser | Static HTML/JS bundle | No server required |
| Desktop (optional) | Electron wrapper | Same codebase |

Implementation platform and bundler are not yet decided. The PRD specifies Node.js 14+ compatibility for tooling but does not commit to a frontend framework.

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale | Consequence |
|---|---|---|---|---|
| 1 | Specification-first development (no code yet) | Build-first | 15 complex interdependent game systems require upfront design to avoid cascading rewrites | Game implementation has not started; spec completeness is the current risk |
| 2 | 4-tier bot AI (not uniform AI) | Single decision-tree AI for all bots | Differentiated personas require differentiated intelligence; Tier 1 LLM bots create "boss" behaviour; Tier 4 adds noise and unpredictability | LLM API dependency for Tier 1 bots; need graceful degradation when API unavailable |
| 3 | 10-sector galaxy (not open/unlimited map) | Infinite procedural galaxy | Bounded map creates meaningful phases, natural chokepoints, and session completion in 1–3 hours | Map size limits late-game expansion options; compensated by wormhole system |
| 4 | 6 distinct victory conditions | Single victory condition | Multiple paths support different player archetypes (aggressor, economist, diplomat) and replayability | Victory checker complexity; balance across 6 conditions is non-trivial |
| 5 | No multiplayer in v1.0 | Human-vs-human multiplayer | Multiplayer infrastructure conflicts with session-length and solo-drama design goals; 100 bots simulate multiplayer feel | No player-vs-player; community play is not a launch feature |
| 6 | Syndicate and Tech Card systems as core v1.0 (not DLC) | Post-launch additions | Both systems are load-bearing for depth and replayability; retrofitting hidden-role mechanics post-launch would require major refactor | Higher initial complexity; more spec surface area |

---

## Open Questions

| Question | Owner | Due | Status |
|---|---|---|---|
| What JavaScript framework (if any) for the UI? | VS7 | Pre-implementation | Open |
| Will Tier 1 LLM bots use a bundled local model or call an external API? | VS7 | Pre-implementation | Open |
| What is the save-game format and how are save slots managed? | VS7 | Pre-implementation | Open |
| How is the tutorial integrated — separate tutorial game state or inline progressive unlocks? | VS7 | Pre-implementation | Open |
| Are spec documents considered frozen, or can they change during implementation? | VS7 | Ongoing | Open |

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-06 | VS7 | Initial draft — derived from codebase survey and spec documents |
