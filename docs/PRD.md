# Nexus Dominion: Product Requirements Document

**Version:** 1.6
**Status:** Active - Canonical Requirements Reference
**Created:** 2026-01-11
**Last Updated:** 2026-01-12 (Formula & Baseline Values Added)

---

## ⚠️ Implementation Status

**This is a pre-implementation design document.**

- **Code Implementation:** 0% (src/ directory not created)
- **Test Coverage:** 0% (no test files exist)
- **Validated Requirements:** 1 of 91 (1.1%)
- **Phase:** Design & Planning

All code references (e.g., `src/lib/game/services/turn-processor.ts`) are **planned locations**, not existing files. All test references are **planned test files**, not existing tests. The project is in the design phase, and implementation has not yet begun.

**Formula Reference:** Explicit mathematical formulas, baseline values, and calculations are documented in `docs/PRD-FORMULAS-ADDENDUM.md`. Requirements reference formulas; implementation details live in the addendum.

Before full implementation, these formulas must be defined:

Civil Status System

Calculation formula (population + food + battles → happiness level)
Thresholds for state transitions
Education sector boost mechanics
Population Mechanics

Growth rate (baseline: 2%/turn?)
Food consumption (0.5 food/capita?)
Starvation decline rate (-10%/turn?)
Military Economics

Maintenance costs (ore/petroleum per unit per turn)
Construction costs (resources + credits)
Upkeep penalties for oversized armies
Sector Scaling

Cost formula (exponential? Base × (1 + Count × 0.1)^1.5?)
Purchase limits
Destruction/loss mechanics
Bot Intelligence

Decision accuracy by tier (Tier 1: 85%? Tier 2: 70%?)
LLM prompt templates
Memory decay curves
Market System

Price calculation (supply/demand)
Volatility mechanics
Trade volume limits

See `docs/PRD-VALIDATION-ANALYSIS.md` for detailed validation status.

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
| 14 | Tech Wars System |
| 15 | Galactic Syndicate System |

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

### REQ-TURN-001: Turn Processing Pipeline

**Description:** Each turn consists of two processing tiers executed in order:

**Tier 1 - Transactional (atomic, all-or-nothing):**
1. Income Phase - Resources generated (with civil status multiplier)
2. Tier 1 Auto-Production - Crafting system resource generation
3. Population Phase - Growth/starvation based on food
4. Civil Status Phase - Morale evaluated
5. Research Phase - Research points allocated
6. Build Queue Phase - Unit construction progresses
7. Covert Phase - Spy points generated
8. Crafting Phase - Crafting queue processed

**Tier 2 - Non-Transactional (can fail gracefully):**
9. Bot Decisions - AI makes strategic choices
10. Emotional Decay - Bot emotions cool down
11. Memory Cleanup - Old memories pruned (every 5 turns)
12. Market Phase - Prices update
13. Bot Messages - Communication generated
14. Galactic Events - Random events trigger (M11)
15. Alliance Checkpoints - Coalition evaluations (M11)
16. Victory Check - Win/loss conditions evaluated
17. Auto-Save - Game state persisted

**Rationale:** Two-tier structure ensures critical empire state is atomic (transaction rollback on failure) while allowing non-critical systems to fail gracefully.

**Source:** `docs/design/GAME-DESIGN.md`, `src/lib/game/services/core/turn-processor.ts` (lines 13-29)

**Code:** `src/lib/game/services/core/turn-processor.ts:processTurn()`

**Tests:** TBD - Test file planned: `src/lib/game/services/__tests__/turn-processor.test.ts`

**Status:** Draft - Detailed specification complete, awaiting implementation

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

**Description:** Each sector type produces specific resources per turn with defined base rates.

**Production Rates:**
```
Food sector:       160 food/turn
Ore sector:        112 ore/turn
Petroleum sector:  92 petroleum/turn
Commerce sector:   8,000 credits/turn
Urban sector:      1,000 credits/turn + population capacity bonus
Education sector:  +1 civil status level/turn (caps at Ecstatic)
Government sector: 300 spy points/turn
Research sector:   100 research points/turn
```

**Formula:**
```
Final Production = Base Production × Civil Status Multiplier
```

**Rationale:** Creates sector specialization and expansion strategy. Fixed production rates enable predictable planning.

**Source:** `docs/design/GAME-DESIGN.md` Section "Sector System"

**Formulas:** See `docs/PRD-FORMULAS-ADDENDUM.md` Section 2.1

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



## 14. Tech Wars System


---

## 15. The Galactic Syndicate System


---

## Appendix A: Requirement Summary

| Section | System | Reqs Defined | Reqs Validated | Status |
|---------|--------|--------------|----------------|--------|
| 1 | Game Overview | 3 | 1 | 1 conceptual |
| 2 | Turn Processing | 3 | 0 | Design complete |
| 3 | Combat | 12 | 0 | Design complete |
| 4 | Resources | 3 | 0 | Design complete |
| 5 | Sectors | 3 | 0 | Design complete |
| 6 | Military | 2 | 0 | Design complete |
| 6.8 | Covert | 1 | 0 | Design complete |
| 7 | Bot AI | 10 | 0 | Design complete |
| 8 | Diplomacy | 2 | 0 | Design complete |
| 9 | Market | 1 | 0 | Design complete |
| 10 | Research | 8 | 0 | Design complete |
| 11 | Progressive | 3 | 0 | Design complete |
| 12 | Victory | 6 | 0 | Design complete |
| 13 | Frontend | 13 | 0 | Design complete |
| 14 | Tech Wars (Expansion) | 9 | 0 | Expansion only |
| 15 | Syndicate | 12 | 0 | Core (post-Beta-1) |
| **Total** | | **91** | **1** | **1.1% complete** |

**Implementation Status:** Pre-implementation (design phase)
- Code exists: No (src/ directory not created)
- Tests exist: No (0 test files)
- @spec annotations: 0

**Validation Progress:**
- Validated: 1 (REQ-GAME-001 - conceptual)
- Draft: 90 requirements awaiting implementation
- Tests needed: 68 requirements marked "TBD"

---

## Appendix B: Validation Checklist

For each requirement to be marked "Validated":

- [ ] Code location verified (file:line exists)
- [ ] Test exists that explicitly validates the requirement
- [ ] Test has `@spec REQ-XXX-XXX` annotation
- [ ] Test passes
- [ ] Code behavior matches requirement description

### Test Annotation Convention

Tests that validate requirements MUST include a `@spec` comment:

```typescript
describe("Turn Processing", () => {
  // @spec REQ-TURN-001 - validates 6-phase execution order
  it("executes phases in correct order: income, population, civil, market, bots, actions", () => {
    // test implementation
  });
});
```

### Finding Orphaned Requirements

Run this command to find requirements without tests:

```bash
# Extract all REQ-* IDs from PRD
grep -oE "REQ-[A-Z]+-[0-9]+" docs/PRD.md | sort -u > /tmp/reqs.txt

# Extract all @spec REQ-* from tests
grep -r "@spec REQ-" src/ --include="*.test.ts" | grep -oE "REQ-[A-Z]+-[0-9]+" | sort -u > /tmp/tested.txt

# Show requirements without tests
comm -23 /tmp/reqs.txt /tmp/tested.txt
```

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-12 | 1.6 | **FORMULA & BASELINE VALUES ADDED:** Created PRD-FORMULAS-ADDENDUM.md with explicit mathematical formulas extracted from design docs. Added formulas to REQ-COMBAT-001 (D20 resolution), REQ-RES-002 (production rates), REQ-BOT-002 (decision priorities and commander stats). Documented 8 missing formulas (civil status calculation, consumption rates, sector cost scaling, bot decision accuracy). Added formula reference to document header. Resolves: "Critical formulas missing" and "Baseline values undefined" review comments. |
| 2026-01-12 | 1.5 | **VALIDATION STATUS CORRECTION:** Fixed incorrect validation claims. Updated REQ-UI-008 and REQ-UI-009 from "Validated (Phase 3 complete)" to "Draft - Design complete, awaiting implementation". Updated REQ-TURN-001 from "Partial" to "Draft". Corrected Appendix A counts: 66→91 total requirements, 3→1 validated. Added implementation status warning at document start. Added PRD-VALIDATION-ANALYSIS.md with detailed audit. Actual status: 1 of 91 requirements validated (1.1%), no code or tests exist yet. |
| 2026-01-12 | 1.5 | **EXPANSION CLARITY & COMBAT FIX:** (1) Removed all "expansion" language from Tech Wars (Section 14) and Syndicate (Section 15)—these are core v1 features rolled out through progressive playtesting, not expansions. (2) Fixed REQ-COMBAT-001: Changed from "unified D20 single roll" to "Three-Phase Domain Combat" (Space → Orbital → Ground). Three sequential phases are intentional for narrative coherence—strong orbital defenses should protect ground forces. Single-roll alternatives were considered but rejected. Updated TOC, section headers, source paths, status fields, and summary table. |
| 2026-01-12 | 1.4 | **FRONTEND CONSOLIDATION:** Section 13 completely revised for FRONTEND-DESIGN.md consolidation. Updated REQ-UI-001 to Boardgame + LCARS Aesthetic. Replaced REQ-UI-002/003 with Star Map Hub navigation architecture. Added 10 new requirements: REQ-UI-002 (Star Map as Hub), REQ-UI-003 (Overlay Panel System), REQ-UI-004 (Card + Details Sidebar), REQ-UI-005 (Collapsible Phase Indicator), REQ-UI-006 (Actionable Guidance), REQ-UI-007 (Strategic Visual Language), REQ-UI-010 (CSS + GSAP Hybrid), REQ-UI-011 (D3.js Star Map), REQ-UI-012 (Keyboard Navigation), REQ-UI-013 (WCAG AA Contrast). Renumbered existing REQ-UI-002/003 to REQ-UI-008/009. Total: 56→66 requirements. |
| 2026-01-12 | 1.3 | **SYNDICATE SYSTEM INTEGRATION:** Section 15 completely revised from single expansion requirement to full core game system. Added 11 new requirements: REQ-SYND-001 (Hidden Roles), REQ-SYND-002 (Revelation Moment), REQ-SYND-003 (Contract System), REQ-SYND-004 (Trust Progression), REQ-SYND-005 (Black Market), REQ-SYND-006 (Suspicion), REQ-SYND-007 (Accusations), REQ-SYND-008 (Coordinator), REQ-SYND-009 (Victory Conditions), REQ-SYND-010 (Bot Integration), REQ-SYND-011 (Intel Economy), REQ-SYND-012 (Activity Feed). Syndicate now marked as Core Game Feature (post-Beta-1). Source updated to `docs/design/SYNDICATE-SYSTEM.md`. Total: 56→67 requirements. |
| 2026-01-11 | 1.2 | **BOT SYSTEM EXPANSION:** Section 7 completely revised for BOT-SYSTEM.md alignment. Fixed REQ-BOT-003 emotional states (now: Confident, Arrogant, Desperate, Vengeful, Fearful, Triumphant per narrative analysis). Expanded REQ-BOT-001, REQ-BOT-002, REQ-BOT-004, REQ-BOT-005 with implementation details. Added 5 new requirements: REQ-BOT-006 (LLM Integration), REQ-BOT-007 (Decision Audit), REQ-BOT-008 (Coalition AI), REQ-BOT-009 (Telegraphing), REQ-BOT-010 (Endgame Behavior). Total: 51→56 requirements. |
| 2026-01-11 | 1.1 | **CRITICAL FIX:** Section 14 updated to Tech Card draft system (CRAFTING-EXPANSION-CONCEPT.md). Removed incorrect 4-tier crafting reference. Added REQ-TECH-001 through REQ-TECH-006 (6 new requirements). Total: 51 requirements. |
| 2026-01-11 | 1.0 | Initial PRD structure with 46 requirements |
