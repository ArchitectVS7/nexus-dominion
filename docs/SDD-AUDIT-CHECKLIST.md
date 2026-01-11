# SDD Audit Checklist: Full Spec-Code-Test Traceability

**Created:** 2026-01-11
**Status:** In Progress
**Goal:** Every atomic feature has a spec, that spec maps to code, that code has a test, and that test validates the spec.

---

## Overview

This checklist tracks the comprehensive audit to establish full traceability between specifications, code, and tests. Work is designed to span multiple sessions.

### Why This Matters

The project was severely broken (unplayable, hanging tests) due to:
- Features built without atomic specifications
- Tests that verify code works, not that it matches intent
- No PRD connecting design docs to implementation
- 54 references to non-existent `docs/PRD.md`

### Methodology

For each system:
1. **Extract** atomic requirements from design docs
2. **Assign** requirement IDs (e.g., `REQ-COMBAT-001`)
3. **Map** each requirement to code location
4. **Verify** test exists that validates the requirement
5. **Fill gaps** where tests are missing or code doesn't match spec

---

## Phase 1: Foundation

### 1.1 Create PRD Structure
- [x] Create `docs/PRD.md` as the central requirements document
- [x] Define requirement ID format: `REQ-{SYSTEM}-{NUMBER}`
- [x] Define requirement template (ID, description, source, code, test, status)
- [ ] Update all 54 `@see docs/PRD.md` references to use correct section numbers (deferred - sections now match)

### 1.2 Establish Traceability Tooling
- [ ] Create requirement extraction script or template
- [ ] Define "validated" vs "unvalidated" test distinction
- [ ] Add CI check for orphaned requirements (spec without test)

### 1.3 Prioritize Systems
Critical path (game unplayable without):
1. Turn Processing
2. Combat
3. Resources
4. Victory Conditions

Secondary (core gameplay):
5. Sectors
6. Military/Build Queue
7. Bot AI
8. Market

Tertiary (enhancement features):
9. Research
10. Diplomacy
11. Covert Operations
12. Messages
13. Starmap
14. Crafting (expansion)
15. Syndicate (expansion)

---

## Phase 2: Critical Path Audit

### 2.1 Turn Processing System
**Source:** `docs/design/GAME-DESIGN.md` (Turn Structure section)
**Code:** `src/lib/game/services/turn-processor.ts`
**Tests:** `src/lib/game/services/__tests__/turn-processor.test.ts`

#### Requirements to Extract
- [ ] REQ-TURN-001: Turn consists of 6 phases (income, population, civil status, market, bots, actions)
- [ ] REQ-TURN-002: Phases execute in strict order
- [ ] REQ-TURN-003: All empires process simultaneously (not sequentially)
- [ ] REQ-TURN-004: Turn number increments after all processing complete
- [ ] REQ-TURN-005: Game ends when victory condition met or turn limit reached

#### Code Mapping
- [ ] Map each requirement to specific function/line
- [ ] Verify code matches spec intent (not just "works")

#### Test Validation
- [ ] Verify test exists for each requirement
- [ ] Add `@spec REQ-TURN-XXX` annotation to each test
- [ ] Fill gaps with new tests

#### Sign-off
- [ ] All requirements extracted: ___
- [ ] All requirements mapped to code: ___
- [ ] All requirements have validating tests: ___
- [ ] System audit complete: ___

---

### 2.2 Combat System
**Source:** `docs/design/COMBAT-SYSTEM.md`
**Code:** `src/lib/combat/`, `src/lib/formulas/combat-power.ts`, `src/lib/formulas/casualties.ts`
**Tests:** `src/lib/formulas/combat-power.test.ts`, `src/lib/formulas/casualties.test.ts`

#### Requirements to Extract
- [ ] REQ-COMBAT-001: D20 unified resolution system
- [ ] REQ-COMBAT-002: 47.6% attacker win rate with equal forces
- [ ] REQ-COMBAT-003: 1.10x defender advantage (home turf)
- [ ] REQ-COMBAT-004: 6 dramatic outcomes based on roll
- [ ] REQ-COMBAT-005: Power multipliers per unit type (fighters=1, carriers=12, etc.)
- [ ] REQ-COMBAT-006: Diversity bonus (15%) for 4+ unit types
- [ ] REQ-COMBAT-007: Station defense multiplier (2.0x when defending)
- [ ] REQ-COMBAT-008: Casualty calculation based on power differential
- [ ] REQ-COMBAT-009: Sector capture based on outcome severity
- [ ] REQ-COMBAT-010: Protection period (20 turns) prevents attacks on new players

#### Code Mapping
- [ ] Map each requirement to specific function/line
- [ ] Verify power multipliers match spec exactly
- [ ] Verify win rate formula produces 47.6%

#### Test Validation
- [ ] Existing test references PRD 6.2 (line 248) - verify still valid
- [ ] Add explicit validation tests for each multiplier
- [ ] Add statistical test for 47.6% win rate (Monte Carlo)
- [ ] Fill gaps with new tests

#### Sign-off
- [ ] All requirements extracted: ___
- [ ] All requirements mapped to code: ___
- [ ] All requirements have validating tests: ___
- [ ] System audit complete: ___

---

### 2.3 Resource System
**Source:** `docs/design/GAME-DESIGN.md` (Resource System section)
**Code:** `src/lib/game/services/resource-engine.ts`, `src/lib/game/constants.ts`
**Tests:** `src/lib/game/services/__tests__/resource-engine.test.ts`

#### Requirements to Extract
- [ ] REQ-RES-001: 5 resource types (Credits, Food, Ore, Petroleum, Research Points)
- [ ] REQ-RES-002: Each sector type produces specific resources
- [ ] REQ-RES-003: Production rates per sector type
- [ ] REQ-RES-004: Consumption rates (military maintenance, population food)
- [ ] REQ-RES-005: Civil status affects income (0.25x to 4.0x multiplier)
- [ ] REQ-RES-006: Negative resources trigger consequences (starvation, desertion)
- [ ] REQ-RES-007: Starting resources per game mode

#### Code Mapping
- [ ] Map each requirement to specific function/line
- [ ] Verify production rates match spec
- [ ] Verify civil status multipliers match spec

#### Test Validation
- [ ] Verify tests exist for each production rate
- [ ] Verify tests exist for civil status effects
- [ ] Fill gaps with new tests

#### Sign-off
- [ ] All requirements extracted: ___
- [ ] All requirements mapped to code: ___
- [ ] All requirements have validating tests: ___
- [ ] System audit complete: ___

---

### 2.4 Victory Conditions
**Source:** `docs/design/GAME-DESIGN.md` (Victory Conditions section)
**Code:** `src/lib/game/services/core/victory-service.ts`, `src/lib/victory/`
**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

#### Requirements to Extract
- [ ] REQ-VIC-001: Conquest victory at 60% territory control
- [ ] REQ-VIC-002: Economic victory at 1.5x networth of 2nd place
- [ ] REQ-VIC-003: Diplomatic victory when coalition controls 50%
- [ ] REQ-VIC-004: Research victory on completing Tier 3 tech
- [ ] REQ-VIC-005: Military victory at 2x military of all others combined
- [ ] REQ-VIC-006: Survival victory (highest score at turn limit)
- [ ] REQ-VIC-007: Victory check runs each turn after processing
- [ ] REQ-VIC-008: Game ends immediately on victory (no further turns)

#### Code Mapping
- [ ] Map each requirement to specific function/line
- [ ] Verify thresholds match spec exactly

#### Test Validation
- [ ] Existing tests verify thresholds - add @spec annotations
- [ ] Add edge case tests (exactly at threshold, one below)
- [ ] Fill gaps with new tests

#### Sign-off
- [ ] All requirements extracted: ___
- [ ] All requirements mapped to code: ___
- [ ] All requirements have validating tests: ___
- [ ] System audit complete: ___

---

## Phase 3: Core Gameplay Audit

### 3.1 Sector System
**Source:** `docs/design/GAME-DESIGN.md`
**Code:** `src/lib/game/services/sector-service.ts`, `src/lib/formulas/sector-costs.ts`
**Tests:** `src/lib/formulas/sector-costs.test.ts`, `src/lib/game/services/__tests__/sector-service.test.ts`

- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 3.2 Military/Build Queue
**Source:** `docs/design/GAME-DESIGN.md`
**Code:** `src/lib/game/services/build-queue-service.ts`
**Tests:** `src/lib/game/services/__tests__/build-queue-service.test.ts`

- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 3.3 Bot AI System
**Source:** `docs/design/BOT-SYSTEM.md`
**Code:** `src/lib/bots/`
**Tests:** `src/lib/bots/__tests__/`

- [ ] Extract requirements (4 tiers, 8 archetypes, emotional states, memory)
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 3.4 Market System
**Source:** `docs/design/GAME-DESIGN.md`
**Code:** `src/lib/market/`
**Tests:** `src/lib/market/constants.test.ts`

- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

---

## Phase 4: Enhancement Features Audit

### 4.1 Research System
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 4.2 Diplomacy System
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 4.3 Covert Operations
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 4.4 Messages System
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 4.5 Starmap/Geography
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

---

## Phase 5: Expansion Features Audit

### 5.1 Crafting System
**Source:** `docs/expansion/CRAFTING.md`
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

### 5.2 Syndicate System
**Source:** `docs/expansion/SYNDICATE.md`
- [ ] Extract requirements
- [ ] Map to code
- [ ] Validate tests
- [ ] Sign-off: ___

---

## Phase 6: Integration Specifications

### 6.1 Cross-System Behaviors
- [ ] Document how Bot AI uses Combat formulas
- [ ] Document how Turn Processing triggers Victory checks
- [ ] Document how Resources affect Civil Status affects Combat
- [ ] Document how Research unlocks affect unit stats

### 6.2 Integration Tests
- [ ] Create integration test suite for cross-system flows
- [ ] Verify full turn cycle end-to-end
- [ ] Verify bot decision → combat → outcome → memory flow

---

## Phase 7: Frontend Audit

### 7.1 SDD Architecture Validation
- [ ] Verify all pages use React Query (completed)
- [ ] Verify Zustand stores match backend state shape
- [ ] Verify mutations match server action contracts

### 7.2 UI-to-Backend Contract Tests
- [ ] Create contract tests for each server action
- [ ] Verify UI displays correct data from queries
- [ ] Verify mutations update UI correctly

---

## Session Tracking

### Session 1 (2026-01-11)
- [x] Identified traceability gaps
- [x] Created SPEC-REGISTRY.md (high-level mapping)
- [x] Completed SDD migration (all 12 pages)
- [x] Fixed TypeScript errors
- [x] Created this checklist
- [x] Created `docs/PRD.md` with 46 initial requirements
- [x] PRD sections match existing code references (7.6, 7.8, 7.9, 7.10, 8.2, 11.x)
- [x] Phase 1.1 complete (PRD structure)

### Session 2
- [ ] Complete Phase 1.2 (Traceability tooling)
- [ ] Start Phase 2.1 (Turn Processing audit)

### Session 3+
- [ ] Continue Phase 2 (Critical Path)
- [ ] ...

---

## Completion Criteria

The audit is complete when:
1. [x] `docs/PRD.md` exists with all atomic requirements (46 initial, more to extract)
2. [x] Every requirement has a unique ID (REQ-{SYSTEM}-{NUMBER} format)
3. [ ] Every requirement maps to specific code location
4. [ ] Every requirement has at least one validating test
5. [ ] Every test has `@spec REQ-XXX-XXX` annotation
6. [ ] Zero orphaned requirements (spec without test)
7. [ ] Zero orphaned tests (test without spec)
8. [ ] All 2705+ tests pass
9. [ ] E2E tests cover critical user flows
10. [ ] Integration tests verify cross-system behavior

---

## Quick Commands

```bash
# Run all tests
npm run test -- --run

# Run specific system tests
npm run test -- --run src/lib/formulas/combat-power.test.ts

# Check TypeScript
npm run typecheck

# Find spec references
grep -r "@spec REQ-" src/ --include="*.test.ts" | wc -l

# Find orphaned code (no spec reference)
grep -rL "@spec\|@see docs/" src/lib/game/services/*.ts
```

---

**Next Action:** Start Phase 1.1 - Create `docs/PRD.md` structure
