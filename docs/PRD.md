# Nexus Dominion: Product Requirements Document

**Version:** 1.0
**Status:** Active - Canonical Requirements Reference
**Created:** 2026-01-11
**Last Updated:** 2026-01-11

---

## Document Purpose

This PRD is the **single source of truth** for all product requirements. Every feature in the codebase must trace back to a requirement in this document.

### Requirement Format

Each requirement follows this format:

```
### REQ-{SYSTEM}-{NUMBER}: {Title}

**Description:** What the system must do
**Rationale:** Why this requirement exists
**Source:** Original design document reference
**Code:** File path and function/line
**Tests:** Test file and test name
**Status:** Draft | Validated | Deprecated
```

### Section Numbering

Sections are numbered to match existing code references (`@see docs/PRD.md Section X.X`):

| Section | System |
|---------|--------|
| 1 | Game Overview |
| 2 | Turn Processing |
| 3 | Combat System |
| 4 | Resource System |
| 5 | Sector Management |
| 6 | Military & Units |
| 6.8 | Covert Operations |
| 7 | Bot AI System |
| 8 | Diplomacy System |
| 9 | Market System |
| 10 | Research System |
| 11 | Progressive Systems |
| 12 | Victory Conditions |
| 13 | Frontend/UI |
| 14 | Expansion: Crafting |
| 15 | Expansion: Syndicate |

---

## 1. Game Overview

### REQ-GAME-001: Game Identity

**Description:** Nexus Dominion is a 1-2 hour single-player turn-based space empire strategy game where players compete against 10-100 AI bot opponents.

**Rationale:** Defines the core product vision and scope.

**Source:** `docs/design/GAME-DESIGN.md` (Quick Overview)

**Code:** N/A (conceptual)

**Tests:** N/A

**Status:** Validated

---

### REQ-GAME-002: Game Modes

**Description:** Two game modes are supported:
- **Oneshot:** 10-25 bots, 50-100 turns
- **Campaign:** 25-100 bots, 150-500 turns

**Rationale:** Provides variety for different play session lengths.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-GAME-003: Simultaneous Processing

**Description:** All empires (player and bots) process their turns simultaneously, not sequentially. This creates a "single-player MMO" feel.

**Rationale:** Prevents turn-order advantages and creates emergent gameplay.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts`

**Tests:** TBD

**Status:** Draft

---

## 2. Turn Processing

### REQ-TURN-001: Six-Phase Turn Structure

**Description:** Each turn consists of exactly 6 phases executed in order:
1. Income Phase - Resources generated
2. Population Phase - Population growth/decline
3. Civil Status Phase - Morale evaluated
4. Market Phase - Trade orders executed
5. Bot Phase - AI decisions processed
6. Action Phase - Player/bot actions resolved

**Rationale:** Deterministic phase order ensures predictable game state.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts:processTurn()`

**Tests:** `src/lib/game/services/__tests__/turn-processor.test.ts`

**Status:** Draft

---

### REQ-TURN-002: Turn Increment

**Description:** Turn number increments by 1 after all phases complete successfully.

**Rationale:** Provides consistent game clock for all systems.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-TURN-003: Victory Check Timing

**Description:** Victory conditions are checked after all turn processing completes, before the turn number increments.

**Rationale:** Ensures fair evaluation of all empire states.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts`

**Tests:** TBD

**Status:** Draft

---

## 3. Combat System

**Source Document:** `docs/design/COMBAT-SYSTEM.md`

### REQ-COMBAT-001: D20 Unified Resolution

**Description:** All combat is resolved with a single D20 roll using unified resolution mechanics, not sequential phase-based combat.

**Rationale:** Simplifies combat while maintaining drama and unpredictability.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/combat/phases.ts`

**Tests:** `src/lib/combat/phases.test.ts`

**Status:** Draft

---

### REQ-COMBAT-002: Attacker Win Rate

**Description:** With equal forces, the attacker wins approximately 47.6% of battles.

**Rationale:** Slight defender advantage encourages defensive play and alliances.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts`

**Tests:** TBD (Monte Carlo validation needed)

**Status:** Draft

---

### REQ-COMBAT-003: Defender Advantage

**Description:** Defenders receive a 1.10x (10%) power bonus when fighting in their own territory.

**Rationale:** Makes conquest harder, rewards defense.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:DEFENDER_ADVANTAGE`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-004: Unit Power Multipliers

**Description:** Each unit type has a specific power multiplier:
- Soldiers: 0.1
- Fighters: 1
- Stations: 3 (6 when defending)
- Light Cruisers: 4
- Heavy Cruisers: 8
- Carriers: 12

**Rationale:** Creates unit hierarchy and strategic choices.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:POWER_MULTIPLIERS`

**Tests:** `src/lib/formulas/combat-power.test.ts` (line 248: "has correct values from PRD 6.2")

**Status:** Draft

---

### REQ-COMBAT-005: Diversity Bonus

**Description:** Fleets with 4 or more distinct unit types receive a 15% power bonus.

**Rationale:** Encourages balanced fleet composition over mono-unit strategies.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:calculateDiversityBonus()`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-006: Station Defense Multiplier

**Description:** Stations have 2.0x power when defending (effectively power 6 instead of 3).

**Rationale:** Stations are defensive installations, not offensive units.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:STATION_DEFENSE_MULTIPLIER`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-007: Protection Period

**Description:** New players have a 20-turn protection period during which they cannot be attacked.

**Rationale:** Allows new players to establish their empire before combat.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts:PROTECTION_TURNS`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-008: Six Dramatic Outcomes

**Description:** Combat results in one of 6 outcomes based on roll and power differential:
1. Decisive Victory (attacker)
2. Victory (attacker)
3. Pyrrhic Victory (attacker)
4. Pyrrhic Victory (defender)
5. Victory (defender)
6. Decisive Victory (defender)

**Rationale:** Creates narrative variety in battle reports.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/combat/phases.ts`

**Tests:** TBD

**Status:** Draft

---

## 4. Resource System

### REQ-RES-001: Five Resource Types

**Description:** The game has 5 resource types:
1. Credits - Currency for purchases
2. Food - Sustains population and soldiers
3. Ore - Military maintenance
4. Petroleum - Fuel for military and wormholes
5. Research Points - Technology advancement

**Rationale:** Multiple resources create economic strategy.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:empires`

**Tests:** TBD

**Status:** Draft

---

### REQ-RES-002: Sector Production

**Description:** Each sector type produces specific resources per turn:
- Commerce: Credits
- Food: Food
- Ore: Ore
- Petroleum: Petroleum
- Research: Research Points
- Industrial: Mixed (Ore + Credits)
- Military: Reduced production, unit bonuses
- Residential: Population growth bonus

**Rationale:** Creates sector specialization and expansion strategy.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/resource-engine.ts`

**Tests:** `src/lib/game/services/__tests__/resource-engine.test.ts`

**Status:** Draft

---

### REQ-RES-003: Civil Status Income Multiplier

**Description:** Civil status affects all income with these multipliers:
- Ecstatic: 4.0x (was disputed, now 2.5x per rebalance)
- Happy: 2.0x (was disputed, now 1.5x per rebalance)
- Content: 1.0x
- Unhappy: 0.75x
- Angry: 0.5x
- Rioting: 0.25x

**Rationale:** Creates meaningful consequences for empire management.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/civil-status.ts`

**Tests:** `src/lib/game/services/__tests__/civil-status.test.ts`

**Status:** Draft (values need verification against code)

---

## 5. Sector Management

### REQ-SEC-001: Starting Sectors

**Description:** Each empire starts with 5 sectors.

**Rationale:** Provides meaningful starting position without overwhelming new players.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts:STARTING_SECTORS`

**Tests:** TBD

**Status:** Draft

---

### REQ-SEC-002: Sector Cost Scaling

**Description:** The cost to acquire new sectors increases based on current sector count using a scaling formula.

**Rationale:** Prevents runaway expansion, creates strategic choices.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/formulas/sector-costs.ts`

**Tests:** `src/lib/formulas/sector-costs.test.ts`

**Status:** Draft

---

### REQ-SEC-003: Eight Sector Types

**Description:** 8 sector types exist: Commerce, Food, Ore, Petroleum, Research, Industrial, Military, Residential.

**Rationale:** Specialization creates strategic depth.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:sectorTypeEnum`

**Tests:** TBD

**Status:** Draft

---

## 6. Military & Units

### REQ-MIL-001: Six Unit Types

**Description:** 6 military unit types exist:
1. Soldiers - Ground troops
2. Fighters - Basic space combat
3. Stations - Defensive installations
4. Light Cruisers - Versatile warships
5. Heavy Cruisers - Heavy firepower
6. Carriers - Fleet support

**Rationale:** Unit variety creates strategic depth.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:unitTypeEnum`

**Tests:** `src/lib/game/unit-config.test.ts`

**Status:** Draft

---

### REQ-MIL-002: Build Queue

**Description:** Units are constructed via a build queue with per-turn completion.

**Rationale:** Prevents instant army creation, requires planning.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/build-queue-service.ts`

**Tests:** `src/lib/game/services/__tests__/build-queue-service.test.ts`

**Status:** Draft

---

## 6.8 Covert Operations

**Note:** Section 6.8 is referenced in existing code.

### REQ-COV-001: Ten Operation Types

**Description:** 10 covert operation types are available for espionage and sabotage.

**Rationale:** Adds non-combat strategic options.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/covert/operations.ts`

**Tests:** TBD

**Status:** Draft

---

## 7. Bot AI System

**Source Document:** `docs/design/BOT-SYSTEM.md`

### REQ-BOT-001: Four-Tier Intelligence

**Description:** Bots operate in 4 intelligence tiers:
- Tier 1 (LLM): 5-10 elite bots with natural language decisions
- Tier 2 (Strategic): 20-25 bots with archetype-based decision trees
- Tier 3 (Simple): 50-60 bots with behavioral rules
- Tier 4 (Random): 10-15 chaotic bots

**Rationale:** Creates varied opposition without requiring LLM for all bots.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/types.ts`

**Tests:** `src/lib/bots/__tests__/bot-processor.test.ts`

**Status:** Draft

---

### 7.6 Bot Archetypes

### REQ-BOT-002: Eight Archetypes

**Description:** 8 bot archetypes define behavioral patterns:
1. Warlord - Aggressive military focus
2. Diplomat - Alliance-seeking
3. Merchant - Economic focus
4. Schemer - Deceptive tactics
5. Turtle - Defensive buildup
6. Blitzkrieg - Fast expansion
7. Tech Rush - Research priority
8. Opportunist - Adaptive strategy

**Rationale:** Creates diverse, memorable opponents.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/archetypes/`

**Tests:** TBD

**Status:** Draft

---

### 7.8 Emotional State System

### REQ-BOT-003: Emotional States

**Description:** Bots have emotional states that affect their decisions:
- Confident, Cautious, Aggressive, Fearful, Vengeful, Neutral

**Rationale:** Creates dynamic, reactive AI behavior.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/emotions/`

**Tests:** TBD

**Status:** Draft

---

### 7.9 Relationship Memory

### REQ-BOT-004: Memory System

**Description:** Bots remember past interactions with decay over time:
- Attacks remembered (creates grudges)
- Treaties remembered (builds trust)
- Memory decays by X% per turn

**Rationale:** Creates persistent relationships and grudges.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/memory/`, `src/lib/game/repositories/bot-memory-repository.ts`

**Tests:** `src/lib/game/repositories/__tests__/bot-memory-repository.test.ts`

**Status:** Draft

---

### 7.10 Bot Personas

### REQ-BOT-005: 100 Unique Personas

**Description:** 100 unique bot personas with distinct names, personalities, and message templates.

**Rationale:** Creates memorable, distinguishable opponents.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `data/personas.json`

**Tests:** `src/lib/messages/__tests__/personas.test.ts`

**Status:** Draft

---

## 8. Diplomacy System

### REQ-DIP-001: Treaty Types

**Description:** Two treaty types exist:
- NAP (Non-Aggression Pact): Cannot attack each other
- Alliance: Shared intel, coordinated actions

**Rationale:** Enables diplomatic gameplay.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/diplomacy/`

**Tests:** `src/lib/diplomacy/constants.test.ts`

**Status:** Draft

---

### 8.2 Coalitions

### REQ-DIP-002: Coalition System

**Description:** Multiple empires can form coalitions against dominant threats. Coalition victory is achieved when coalition controls 50% of territory.

**Rationale:** Anti-snowball mechanic to prevent runaway victories.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/__tests__/coalition-service.test.ts`

**Tests:** `src/lib/game/services/__tests__/coalition-service.test.ts`

**Status:** Draft

---

## 9. Market System

### REQ-MKT-001: Resource Trading

**Description:** Players can buy and sell resources on the galactic market at fluctuating prices.

**Rationale:** Enables economic strategy and resource conversion.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/market/`

**Tests:** `src/lib/market/constants.test.ts`

**Status:** Draft

---

## 10. Research System

### REQ-RES-001: Three-Tier Research

**Description:** Research follows a 3-tier draft system:
1. Doctrines (Tier 1) - Basic bonuses
2. Specializations (Tier 2) - Focused upgrades
3. Capstones (Tier 3) - Powerful abilities

**Rationale:** Creates meaningful tech progression with choices.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/research-service.ts`

**Tests:** TBD

**Status:** Draft

---

## 11. Progressive Systems

### 11.1 Progressive Unlocks

### REQ-PROG-001: Feature Unlocks

**Description:** Certain features unlock at specific turn thresholds:
- Turn 20: Diplomacy fully available
- Turn 50: Black Market access
- Turn 100: Nuclear weapons

**Rationale:** Introduces complexity gradually.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/constants/unlocks.ts`

**Tests:** TBD

**Status:** Draft

---

### 11.3 Checkpoints

### REQ-PROG-002: Game Checkpoints

**Description:** Game state can be saved at checkpoints for campaign continuation.

**Rationale:** Supports long campaign games across sessions.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/events/checkpoint-service.ts`

**Tests:** TBD

**Status:** Draft

---

### 11.4 Events

### REQ-PROG-003: Galactic Events

**Description:** Random galactic events occur that affect all empires.

**Rationale:** Creates shared challenges and narrative moments.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/events/event-service.ts`

**Tests:** TBD

**Status:** Draft

---

## 12. Victory Conditions

### REQ-VIC-001: Conquest Victory

**Description:** Achieved when an empire controls 60% of all territory.

**Rationale:** Classic domination victory.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-002: Economic Victory

**Description:** Achieved when an empire has 1.5x the networth of the second-place empire.

**Rationale:** Builder/trader victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-003: Diplomatic Victory

**Description:** Achieved when a coalition controls 50% of territory.

**Rationale:** Alliance-based victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-004: Research Victory

**Description:** Achieved when an empire completes the entire Tier 3 tech tree.

**Rationale:** Tech rush victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-VIC-005: Military Victory

**Description:** Achieved when an empire has 2x the military power of all other empires combined.

**Rationale:** Military supremacy victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-VIC-006: Survival Victory

**Description:** Achieved by having the highest score when the turn limit is reached.

**Rationale:** Default victory for balanced play.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

## 13. Frontend/UI

### REQ-UI-001: LCARS Design

**Description:** UI follows LCARS-inspired design aesthetic with characteristic colors and panel shapes.

**Rationale:** Creates distinctive, immersive interface.

**Source:** `docs/design/UI-DESIGN.md`

**Code:** `src/components/`, `tailwind.config.ts`

**Tests:** E2E visual tests (TBD)

**Status:** Draft

---

### REQ-UI-002: React Query Data Layer

**Description:** All server state is managed via React Query hooks.

**Rationale:** SDD architecture for predictable data flow.

**Source:** SDD Migration (Phase 3)

**Code:** `src/lib/api/queries/`, `src/lib/api/mutations/`

**Tests:** TBD

**Status:** Validated (Phase 3 complete)

---

### REQ-UI-003: Zustand Client State

**Description:** All client-only state is managed via Zustand stores.

**Rationale:** SDD architecture for predictable state management.

**Source:** SDD Migration (Phase 3)

**Code:** `src/stores/`

**Tests:** TBD

**Status:** Validated (Phase 3 complete)

---

## 14. Expansion: Crafting

**Source Document:** `docs/expansion/CRAFTING.md`

### REQ-CRAFT-001: Four-Tier Crafting

**Description:** Crafting system with 4 tiers of craftable items.

**Rationale:** Post-launch expansion content.

**Source:** `docs/expansion/CRAFTING.md`

**Code:** `src/app/actions/crafting-actions.ts`

**Tests:** TBD

**Status:** Draft

---

## 15. Expansion: Syndicate

**Source Document:** `docs/expansion/SYNDICATE.md`

### REQ-SYND-001: Black Market

**Description:** Syndicate offers illicit trades and contracts after Turn 50.

**Rationale:** Post-launch expansion content.

**Source:** `docs/expansion/SYNDICATE.md`

**Code:** `src/components/game/syndicate/BlackMarketPanel.tsx`

**Tests:** TBD

**Status:** Draft

---

## Appendix A: Requirement Summary

| Section | System | Reqs Defined | Reqs Validated |
|---------|--------|--------------|----------------|
| 1 | Game Overview | 3 | 1 |
| 2 | Turn Processing | 3 | 0 |
| 3 | Combat | 8 | 0 |
| 4 | Resources | 3 | 0 |
| 5 | Sectors | 3 | 0 |
| 6 | Military | 2 | 0 |
| 6.8 | Covert | 1 | 0 |
| 7 | Bot AI | 5 | 0 |
| 8 | Diplomacy | 2 | 0 |
| 9 | Market | 1 | 0 |
| 10 | Research | 1 | 0 |
| 11 | Progressive | 3 | 0 |
| 12 | Victory | 6 | 0 |
| 13 | Frontend | 3 | 2 |
| 14 | Crafting | 1 | 0 |
| 15 | Syndicate | 1 | 0 |
| **Total** | | **46** | **3** |

---

## Appendix B: Validation Checklist

For each requirement to be marked "Validated":

- [ ] Code location verified (file:line exists)
- [ ] Test exists that explicitly validates the requirement
- [ ] Test has `@spec REQ-XXX-XXX` annotation
- [ ] Test passes
- [ ] Code behavior matches requirement description

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-11 | 1.0 | Initial PRD structure with 46 requirements |
