# Nexus Dominion: Executive PRD

**Version:** 1.0
**Status:** Active - Strategic Reference
**Last Updated:** January 2026

---

## Vision Statement

> **"Crusader Kings meets Eve Online, simulated."**
>
> Nexus Dominion delivers MMO-style emergent drama in a single-player environment. Command your galactic empire, navigate dynamic bot personalities, and achieve victory through military conquest, economic dominance, or diplomatic mastery - all in a 1-2 hour session.

For the complete design philosophy and principles behind these decisions, see [VISION.md](VISION.md).

### What Makes This Special

| Differentiator | Description |
|----------------|-------------|
| **Geographic Strategy** | Galaxy divided into 10 sectors creates meaningful expansion paths |
| **100 Unique Opponents** | Bot personas with emotional states and memory |
| **Progressive Complexity** | Onboarding teaches as you play |
| **Anti-Snowball Design** | Coalition mechanics prevent runaway victories |
| **Command Center UI** | LCARS-inspired starmap as hub for all actions |

### Target Audience

Single-player enthusiasts who want a rich, deep 4X experience without being steamrolled by power gamers in multiplayer. Players who enjoyed Master of Orion, Stellaris, or Civilization but want sessions that conclude in hours, not days.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Game Length** | 1-2 hours | 50-500 turns depending on mode |
| **Turn Processing** | < 2 seconds | Perceived instant response |
| **Attacker Win Rate** | 40-50% | With equal forces (validated at 47.6%) |
| **Eliminations per Game** | 3-5 | Natural selection creates drama |
| **Learning Curve** | Playable in 10 minutes | 5-step tutorial, progressive disclosure |
| **Replayability** | High variance | Bot personalities + 6 victory paths |

### Definition of Done (v1.0)

1. Complete playable loop: start game, play turns, achieve victory
2. All 6 victory conditions functional
3. 100 bot personas active with emotional state system
4. 10-sector galaxy with wormhole connectivity
5. LCARS UI complete for all major screens
6. < 2 second turn processing at 100 empires

---

## Architecture Principles

### 1. "Every Game Is Someone's First Game"
*(Stan Lee / Mark Rosewater)*

- New players can learn in 5 minutes
- Complexity unlocks progressively over 200 turns
- Required 5-step tutorial (can skip on replay)
- 20-turn protection period before bot attacks

### 2. "Foundation Before Complexity"

- Combat must work before adding covert ops
- Balance before variety
- Elegance before feature creep
- Core loop complete before expansion content

### 3. "Backend-Frontend Completeness"

Every feature must be complete end-to-end:
- Database schema defined
- Server actions implemented
- UI components rendered
- Tests validate behavior

No orphaned backend logic or UI shells without data.

### 4. "Consequence Over Limits"

- No hard caps - game responds to player behavior
- Leader hits 7 VP: automatic coalition forms
- Weak empires move first (catchup mechanics)
- Anti-snowball debuffs on dominant players

### 5. "Clarity Through Constraints"

- 100 empires exist, but only ~10 are relevant at once
- Fewer systems, deeper interactions
- Every feature must earn its place
- Sectors are neighborhoods, borders are roads, wormholes are highways

---

## System Overview

### Combat System
Unified D20 resolution determines battle outcomes. Full invasions resolve across three sequential domains (Space, Orbital, Ground) with cascading bonuses. Defenders receive a 10% home turf advantage. Six dramatic outcomes create varied narratives from decisive victories to pyrrhic defeats.

**Tier 2 Reference:** [COMBAT-SYSTEM.md](Game Systems/COMBAT-SYSTEM.md)

### Bot AI System
Four-tier intelligence architecture: LLM-powered elite bots, archetype-driven strategic bots, rule-based simple bots, and chaotic random bots. Eight archetypes (Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist) combined with emotional states and relationship memory create 100 unique personalities.

**Tier 2 Reference:** [BOT-SYSTEM.md](Game Systems/BOT-SYSTEM.md)

### Galaxy Structure
Ten sectors of 8-10 empires each. Same-sector attacks are free; adjacent sector attacks require border discovery (1.2x cost); distant attacks require wormhole construction (1.5x cost). This creates regional strategy phases: consolidate (Turn 1-20), expand (Turn 21-40), reach (Turn 41-60), dominate (Turn 61+).

**Tier 2 Reference:** [SECTOR-MANAGEMENT-SYSTEM.md](Game Systems/SECTOR-MANAGEMENT-SYSTEM.md)

### Resource Economy
Five resources (Credits, Food, Ore, Petroleum, Research Points) produced by eight sector types. Civil status multipliers (0.25x rioting to 4.0x ecstatic) affect production. Population grows with food, starves without. Military requires maintenance.

**Tier 2 Reference:** [RESOURCE-MANAGEMENT-SYSTEM.md](Game Systems/RESOURCE-MANAGEMENT-SYSTEM.md)

### Market System
Dynamic galactic market where prices fluctuate based on supply, demand, and random events. Players can profit by selling high and buying low, or manipulate prices to hurt rivals. Merchant archetype bots use predictive insight to dominate trade.

**Tier 2 Reference:** [MARKET-SYSTEM.md](Game Systems/MARKET-SYSTEM.md)

### Research System
Three-tier draft structure: Doctrines (Turn 10), Specializations (Turn 30), Capstones (Turn 60). Three strategic paths: War Machine, Fortress, Commerce. Each leads to unique capstone abilities (Dreadnought, Citadel World, Economic Hegemony).

**Tier 2 Reference:** [RESEARCH-SYSTEM.md](Game Systems/RESEARCH-SYSTEM.md)

### Diplomacy System
Treaties (NAP, Alliance, Coalition) with reputation consequences. Breaking treaties costs reputation; helping weak empires builds it. Low reputation makes bots target you and treaties harder to form.

**Tier 2 Reference:** [DIPLOMACY-SYSTEM.md](Game Systems/DIPLOMACY-SYSTEM.md)

### Military System
Six unit types across three domains (Space, Orbital, Ground). Card-based unit stats with power multipliers ranging from 0.1x (Soldiers) to 12.0x (Carriers). Production queues require multi-turn investment and strategic resource management (Credits, Ore, Petroleum).

**Tier 2 Reference:** [MILITARY-SYSTEM.md](Game Systems/MILITARY-SYSTEM.md)

### Covert Ops System
Asymmetric warfare for weaker empires. Ten operation types ranging from theft (Steal Credits) to disruption (Sabotage Production) and assassination. Success depends on agent allocation and risk management, with diplomatic consequences for detection.

**Tier 2 Reference:** [COVERT-OPS-SYSTEM.md](Game Systems/COVERT-OPS-SYSTEM.md)

### Syndicate System
Hidden role mechanics where 10% of empires secretly serve the Syndicate. Players pursue shadow contracts while maintaining a facade of loyalty. Accusation trials and betrayal mechanics turn the endgame into a high-stakes social deduction challenge.

**Tier 2 Reference:** [SYNDICATE-SYSTEM.md](Game Systems/SYNDICATE-SYSTEM.md)

### Turn Processing System
Atomic 17-phase execution pipeline ensures 100-empire turns process in under 2 seconds. Separates transactional state updates from cosmetic bot logic for robust failure handling. Orchestrates the heartbeat of the galaxy.

**Tier 2 Reference:** [TURN-PROCESSING-SYSTEM.md](Game Systems/TURN-PROCESSING-SYSTEM.md)

### Victory Systems
Six distinct paths to victory: Conquest, Economic, Diplomatic, Research, Military, and Survival. Anti-snowball mechanics trigger coalition formation when any empire nears victory, ensuring dramatic, contested endgames.

**Tier 2 Reference:** [VICTORY-SYSTEMS.md](Game Systems/VICTORY-SYSTEMS.md)

### Frontend/UI
LCARS (Star Trek) inspired design with semi-transparent panels, orange/peach/violet palette, smooth animations. The starmap is the command hub: click neighbors to attack, click sectors to build, click borders to expand.

**Tier 2 Reference:** [FRONTEND-DESIGN.md](Game Systems/FRONTEND-DESIGN.md)

---

## System Dependencies Map

```
                    ┌─────────────────────────────────────────┐
                    │            TURN PROCESSOR               │
                    │    (Orchestrates all phase execution)   │
                    └───────────────────┬─────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌───────────────┐
│   RESOURCES   │◄──────────────│    COMBAT     │──────────────►│     BOTS      │
│   (Economy)   │   casualties  │   (Battles)   │   decisions   │     (AI)      │
└───────┬───────┘   affect      └───────┬───────┘               └───────┬───────┘
        │           production          │                               │
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌───────────────┐
│    SECTORS    │◄──────────────│   MILITARY    │               │   DIPLOMACY   │
│  (Territory)  │   conquest    │    (Units)    │               │  (Treaties)   │
└───────┬───────┘   transfers   └───────────────┘               └───────┬───────┘
        │                               ▲                               │
        │                               │                               │
        │                       ┌───────┴───────┐                       │
        └──────────────────────►│   RESEARCH    │◄──────────────────────┘
                  unlocks       │    (Tech)     │     affects
                  sectors       └───────────────┘     modifiers
                                        │
                                        ▼
                                ┌───────────────┐
                                │    VICTORY    │
                                │  (Win Checks) │
                                └───────────────┘


LEGEND:
────►  Data flow / dependency
◄────  Bidirectional dependency
```

### Implementation Order (Recommended)

```
Phase 1 (Foundation)      Phase 2 (Core Loop)       Phase 3 (Polish)
├── Database Schema       ├── Combat Resolution     ├── Bot Personas
├── Turn Processor        ├── Military Production   ├── Diplomacy
├── Resource Engine       ├── Sector Acquisition    ├── Research Drafts
└── Basic UI Shell        └── Victory Checks        └── Full UI/UX
```

---

## Document Hierarchy

### Tier 0: Vision & Philosophy
[VISION.md](VISION.md) - Design philosophy, principles, and the "why" behind decisions

### Tier 1: Executive (This Document)
Strategic overview, system index, success metrics, implementation order

### Tier 2: Design Documents
Detailed specifications for each system:

| Document | Scope |
|----------|-------|
| [COMBAT-SYSTEM.md](Game Systems/COMBAT-SYSTEM.md) | D20 mechanics, battle resolution |
| [MILITARY-SYSTEM.md](Game Systems/MILITARY-SYSTEM.md) | Unit types, production, fleet composition |
| [BOT-SYSTEM.md](Game Systems/BOT-SYSTEM.md) | AI architecture, personas |
| [RESEARCH-SYSTEM.md](Game Systems/RESEARCH-SYSTEM.md) | Tech tree, draft mechanics |
| [FRONTEND-DESIGN.md](Game Systems/FRONTEND-DESIGN.md) | UI/UX patterns |
| [SECTOR-MANAGEMENT-SYSTEM.md](Game Systems/SECTOR-MANAGEMENT-SYSTEM.md) | Galaxy structure, expansion |
| [RESOURCE-MANAGEMENT-SYSTEM.md](Game Systems/RESOURCE-MANAGEMENT-SYSTEM.md) | Economy, production |
| [MARKET-SYSTEM.md](Game Systems/MARKET-SYSTEM.md) | Trading, price fluctuation |
| [DIPLOMACY-SYSTEM.md](Game Systems/DIPLOMACY-SYSTEM.md) | Treaties, reputation |
| [COVERT-OPS-SYSTEM.md](Game Systems/COVERT-OPS-SYSTEM.md) | Espionage, sabotage |
| [SYNDICATE-SYSTEM.md](Game Systems/SYNDICATE-SYSTEM.md) | Hidden roles, contracts |
| [VICTORY-SYSTEMS.md](Game Systems/VICTORY-SYSTEMS.md) | Victory conditions, scoring |
| [TURN-PROCESSING-SYSTEM.md](Game Systems/TURN-PROCESSING-SYSTEM.md) | Execution pipeline, timing |

### Tier 3: Implementation References

| Document | Purpose |
|----------|---------|
| [PRD.md](PRD.md) | Detailed requirements with code traces |
| [SPEC-REGISTRY.md](SPEC-REGISTRY.md) | Spec-to-code mapping |
| [ARCHITECTURE.md](development/ARCHITECTURE.md) | Technical stack and patterns |

### Tier 4: Roadmap

| Document | Timeframe |
|----------|-----------|
| [ALPHA.md](roadmap/ALPHA.md) | Current playable state |
| [BETA.md](roadmap/BETA.md) | Stability, mobile, polish |
| [LAUNCH.md](roadmap/LAUNCH.md) | v1.0 definition of done |
| [EXPANSION.md](roadmap/EXPANSION.md) | Post-launch: Crafting + Syndicate |

---

## Quick Reference: Key Numbers

| Aspect | Value |
|--------|-------|
| **Bots** | 10-100 AI opponents (configurable) |
| **Turns** | 50-500 turns (based on game mode) |
| **Starting Sectors** | 5 per empire |
| **Galaxy** | 10 sectors (10 empires each) |
| **Attacker Win Rate** | 47.6% with equal forces |
| **Defender Advantage** | 1.10x (home turf) |
| **Protection Period** | 20 turns |
| **Coalition Trigger** | 7+ Victory Points |

---

*This document is the entry point for understanding Nexus Dominion. For implementation details, follow the Tier 2 and Tier 3 references.*
