# Spec-Driven Development: Standard Process

**Version:** 1.0
**Status:** Active - Process Standard
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Applies To:** All Nexus Dominion development

---

## Document Purpose

This document defines the **Spec-Driven Development (SDD)** methodology used for Nexus Dominion development. It establishes the complete lifecycle from design intent to validated implementation.

**Intended Audience:**
- **Game Designers** - Writing specifications from design documents
- **Developers** - Implementing specifications in code
- **QA Engineers** - Testing against specifications
- **Project Managers** - Tracking progress via spec status

**What This Document Covers:**
- The 6-phase SDD lifecycle
- Specification format and conventions
- Implementation and testing practices
- Traceability and change management
- Tools and automation

---

## Table of Contents

1. [What is Spec-Driven Development?](#1-what-is-spec-driven-development)
2. [The SDD Lifecycle](#2-the-sdd-lifecycle)
3. [Phase 1: Design](#3-phase-1-design)
4. [Phase 2: Specification](#4-phase-2-specification)
5. [Phase 3: Implementation](#5-phase-3-implementation)
6. [Phase 4: Testing](#6-phase-4-testing)
7. [Phase 5: Validation](#7-phase-5-validation)
8. [Phase 6: Iteration](#8-phase-6-iteration)
9. [Specification Format Standard](#9-specification-format-standard)
10. [Traceability Requirements](#10-traceability-requirements)
11. [Tools and Automation](#11-tools-and-automation)
12. [Best Practices](#12-best-practices)

---

## 1. What is Spec-Driven Development?

### 1.1 Definition

**Spec-Driven Development (SDD)** is a methodology where formal, testable specifications are written before or alongside implementation. It bridges the gap between design intent and working code.

**Core Principle:**
> "Every game mechanic, formula, and behavior is defined as a testable specification before it is implemented."

### 1.2 How It Differs from Other Methodologies

| Methodology | Focus | When Specs Written | Traceability |
|-------------|-------|-------------------|--------------|
| **Test-Driven Development** | Code-level tests | Before coding | Code → Tests |
| **Behavior-Driven Development** | User scenarios | During planning | Features → Scenarios |
| **Spec-Driven Development** | Formal requirements | After design, before coding | Design → Spec → Code → Tests |

**SDD combines:**
- The rigor of formal specifications
- The testability of TDD
- The design-first approach of waterfall
- The iterative nature of agile

### 1.3 Benefits for Nexus Dominion

1. **Traceability**: Every line of code traces back to a design decision
2. **Testability**: Every spec is verifiable with automated tests
3. **Clarity**: "Implement REQ-COMBAT-001" is unambiguous
4. **Changeability**: Design changes update specs, breaking tests reveal impact
5. **Collaboration**: Designers, developers, and QA speak the same language
6. **Progress Tracking**: Spec status provides clear completion metrics

### 1.4 When to Use SDD

**Use SDD for:**
- ✅ Game mechanics and formulas
- ✅ Combat resolution and balance
- ✅ Resource economy rules
- ✅ Bot AI behavior
- ✅ Victory conditions
- ✅ Turn processing logic

**Don't use SDD for:**
- ❌ Visual polish and animations (unless affecting gameplay)
- ❌ Performance optimizations (unless specific targets)
- ❌ Exploratory prototyping (use after validating approach)

---

## 2. The SDD Lifecycle

### 2.1 Overview

```
┌─────────┐   ┌─────────┐   ┌──────────┐   ┌─────────┐   ┌────────────┐   ┌──────────┐
│ DESIGN  │──→│  SPEC   │──→│ IMPLEMENT│──→│  TEST   │──→│  VALIDATE  │──→│ ITERATE  │
└─────────┘   └─────────┘   └──────────┘   └─────────┘   └────────────┘   └──────────┘
    │             │              │              │               │                │
    │             │              │              │               │                │
  Narrative   Formal REQ     Code with      Unit/E2E        Update          Refine &
  design      requirements    @spec tags      tests          status          evolve
```

### 2.2 Phase Duration (Typical)

| Phase | Duration | Artifacts |
|-------|----------|-----------|
| 1. Design | 2-4 hours per system | Design document (800-1200 lines) |
| 2. Specification | 1-2 hours per system | 10-15 REQ-XXX specs extracted |
| 3. Implementation | 2-4 hours per spec | Service classes, server actions, DB schema |
| 4. Testing | 1-2 hours per spec | Unit tests, integration tests |
| 5. Validation | 15 minutes per spec | Spec status update, registry update |
| 6. Iteration | Ongoing | Spec amendments, deprecations |

**Total time per spec**: ~4-8 hours from design to validated implementation

### 2.3 Complete Lifecycle Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           DESIGN PHASE                                 │
│  Output: COMBAT-SYSTEM.md (narrative design document)                  │
│  - Define mechanics, formulas, rules                                   │
│  - Explain player experience                                           │
│  - Provide examples and edge cases                                     │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SPECIFICATION PHASE                               │
│  Output: REQ-COMBAT-001..020 (formal requirements)                     │
│  - Extract testable requirements from design                           │
│  - Define formulas, key values, and success criteria                   │
│  - Link to source sections in design doc                               │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       PLANNING PHASE                                   │
│  Output: Prioritized spec backlog                                      │
│  - Identify dependencies (REQ-001 blocks REQ-005)                      │
│  - Group specs into milestones                                         │
│  - Assign priorities (P0, P1, P2)                                      │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PHASE (per spec)                     │
│  Output: Working code with @spec tags                                  │
│  1. Read spec REQ-COMBAT-001                                           │
│  2. Implement in combat-service.ts                                     │
│  3. Add @spec REQ-COMBAT-001 comment                                   │
│  4. Update spec with code file path                                    │
│  5. Mark spec status: Draft → Implemented                              │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TESTING PHASE (per spec)                        │
│  Output: Passing tests that validate spec                              │
│  1. Write unit tests referencing REQ-COMBAT-001                        │
│  2. Test name: "REQ-COMBAT-001: [behavior]"                            │
│  3. Run tests until green                                              │
│  4. Write integration/E2E tests if needed                              │
│  5. Update spec with test file path                                    │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      VALIDATION PHASE (per spec)                       │
│  Output: Validated spec with ✓ status                                  │
│  1. Verify all tests pass                                              │
│  2. Code review confirms spec compliance                               │
│  3. Update spec status: Implemented → Validated                        │
│  4. Update SPEC-REGISTRY.md                                            │
│  5. Close any related tickets/issues                                   │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION PHASE (per system)                     │
│  Output: End-to-end working feature                                    │
│  - Connect services to turn processor                                  │
│  - Add UI components                                                   │
│  - Write E2E tests for complete flows                                  │
│  - Playtest and gather feedback                                        │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ITERATION PHASE (ongoing)                         │
│  Output: Evolved specs and updated code                                │
│  - Bug found → Identify violated spec → Fix                            │
│  - Balance change → Update spec → Update code → Update tests           │
│  - New feature → Write new spec → Implement                            │
│  - Deprecated spec → Mark superseded → Link to replacement             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Design

### 3.1 Purpose

Create narrative design documents that explain game mechanics, formulas, and player experience in natural language.

### 3.2 Artifacts

**Primary Output**: Design document following `GAME-SYSTEM-TEMPLATE.md`

**Location**: `docs/design/[SYSTEM-NAME].md`

**Examples**:
- `docs/design/COMBAT-SYSTEM.md`
- `docs/design/BOT-SYSTEM.md`
- `docs/design/RESEARCH-SYSTEM.md`

### 3.3 Design Document Structure

All design documents must follow the standard template:

1. **Core Concept** - What is this system? How does it work?
2. **Mechanics Overview** - Tables, formulas, core rules
3. **Detailed Rules** - Edge cases, specific behaviors
4. **Bot Integration** - How do AI opponents use this?
5. **UI/UX Design** - Player-facing interface
6. **Specifications** - Formal REQ-XXX requirements (Section 6)
7. **Implementation Requirements** - Database, services, actions
8. **Balance Targets** - Quantitative goals
9. **Migration Plan** - How to transition to this system
10. **Conclusion** - Key decisions, dependencies

### 3.4 Design Phase Checklist

- [ ] System purpose clearly explained
- [ ] All formulas defined with examples
- [ ] Edge cases documented
- [ ] Player experience described
- [ ] Bot behavior specified
- [ ] UI flows outlined
- [ ] Balance targets quantified
- [ ] Cross-references to other systems noted
- [ ] No unresolved DEV NOTEs or placeholders

### 3.5 Design Review

Before proceeding to specification phase:

1. **Peer review by another designer**
2. **Technical review by lead developer** (feasibility)
3. **Balance review** (quantitative targets reasonable?)
4. **Consistency check** (conflicts with other systems?)

---

## 4. Phase 2: Specification

### 4.1 Purpose

Extract formal, testable requirements from design documents. Convert narrative design into structured specifications.

### 4.2 What Makes a Good Specification?

**Characteristics:**
- ✅ **Testable** - Can be verified with code
- ✅ **Unambiguous** - Single interpretation
- ✅ **Atomic** - Tests one thing
- ✅ **Traceable** - Links to design source
- ✅ **Complete** - All necessary information present

**Anti-patterns:**
- ❌ "Combat should feel good" (not testable)
- ❌ "Units are balanced" (not measurable)
- ❌ "Performance is fast" (no threshold)

**Good examples:**
- ✅ "Attack hits if d20 + ATK >= DEF" (testable formula)
- ✅ "Attacker win rate: 47.6% ±2% with equal forces" (measurable)
- ✅ "Turn processing completes in < 2 seconds at 100 empires" (specific threshold)

### 4.3 Specification Format

See [Section 9: Specification Format Standard](#9-specification-format-standard) for complete template.

**Minimum Required Fields:**
- Unique ID (REQ-XXX-NNN)
- Description (testable statement)
- Rationale (why this matters)
- Source (section reference in design doc)
- Code (file paths, even if "TBD")
- Tests (test file paths, even if "TBD")
- Status (Draft/Implemented/Validated/Deprecated)

### 4.4 Specification Extraction Process

**Step 1: Identify Candidates**

Read design document section by section. Flag:
- Every formula or calculation
- Every threshold or percentage
- Every "must", "should", or "will"
- Every game rule or mechanic
- Every balance target

**Step 2: Write Formal Specs**

Convert narrative to structured requirements:

**Narrative:**
> "Combat uses D20 resolution. The attacker rolls a 20-sided die, adds their ATK modifier and any bonuses, and compares against the defender's DEF. If the total meets or exceeds DEF, the attack hits."

**Specification:**
```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF

**Rationale:** Provides 5% granularity and familiar D&D-style mechanics

**Formula:**
hit = (roll(1, 20) + attacker.ATK + bonuses) >= defender.DEF

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| die_type | d20 | Standard 20-sided die |
| min_roll | 1 | Always possible |
| max_roll | 20 | Always possible |

**Source:** Section 2.1 - Core Concept

**Code:**
- `src/lib/combat/combat-service.ts` - resolveAttack()

**Tests:**
- `src/lib/combat/__tests__/combat-service.test.ts`

**Status:** Draft
```

**Step 3: Number Sequentially**

Within each system, number specs sequentially:
- REQ-COMBAT-001, REQ-COMBAT-002, REQ-COMBAT-003...
- REQ-MIL-001, REQ-MIL-002, REQ-MIL-003...

**Step 4: Link Back to Narrative**

In design document, add `@spec` tags:

```markdown
### 2.1 Core Concept

Combat uses D20 resolution. <!-- @spec REQ-COMBAT-001 -->

Natural 20 always hits (critical success). <!-- @spec REQ-COMBAT-002 -->

Natural 1 always misses (critical failure). <!-- @spec REQ-COMBAT-003 -->
```

**Step 5: Create Summary Table**

At end of Section 6 in design document:

```markdown
### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-COMBAT-001 | D20 Attack Resolution | Draft | TBD |
| REQ-COMBAT-002 | Critical Success | Draft | TBD |
| REQ-COMBAT-003 | Critical Failure | Draft | TBD |

**Total Specifications:** 3
**Implemented:** 0
**Validated:** 0
**Draft:** 3
```

### 4.5 Specification Review

Before proceeding to implementation:

1. **Completeness check** - All mechanics have specs?
2. **Testability check** - Can each spec be validated with code?
3. **Consistency check** - Specs don't contradict each other?
4. **Dependency check** - Ordering and prerequisites clear?

---

## 5. Phase 3: Implementation

### 5.1 Purpose

Write production code that implements specifications. Every implementation must link back to its spec.

### 5.2 Implementation Requirements

**For every spec:**
1. ✅ Code must include `@spec REQ-XXX-NNN` comment
2. ✅ Implementation must match spec formula/behavior exactly
3. ✅ Spec must be updated with actual file paths
4. ✅ Status must be updated: Draft → Implemented

### 5.3 Code Organization

**Service Layer** (`src/lib/[system]/`)
- Core business logic
- Game mechanics implementation
- No UI, no database queries (use repositories)

**Server Actions** (`src/app/actions/[system]-actions.ts`)
- Frontend-to-backend bridge
- Input validation
- Transaction management
- Error handling

**Repository Layer** (`src/lib/[system]/repositories/`)
- Database queries
- Data access patterns
- No business logic

**UI Components** (`src/components/[system]/`)
- Presentation layer
- User interaction
- Call server actions

### 5.4 Implementation Example

**Specification:**
```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF

**Formula:**
hit = (roll(1, 20) + attacker.ATK + bonuses) >= defender.DEF

**Code:** TBD

**Status:** Draft
```

**Implementation:**
```typescript
// src/lib/combat/combat-service.ts

export interface AttackResult {
  roll: number;
  total: number;
  hit: boolean;
  critical: boolean;
  fumble: boolean;
}

export class CombatService {
  /**
   * Resolves a D20 attack roll
   *
   * @spec REQ-COMBAT-001
   *
   * @param attacker - Attacking unit with ATK stat
   * @param defender - Defending unit with DEF stat
   * @param bonuses - Additional modifiers (flanking, research, etc.)
   * @returns AttackResult with roll, total, and hit status
   */
  resolveAttack(
    attacker: Unit,
    defender: Unit,
    bonuses: number = 0
  ): AttackResult {
    const roll = this.rollD20();
    const total = roll + attacker.ATK + bonuses;
    const hit = total >= defender.DEF;

    return {
      roll,
      total,
      hit,
      critical: roll === 20,  // @spec REQ-COMBAT-002
      fumble: roll === 1      // @spec REQ-COMBAT-003
    };
  }

  /**
   * Rolls a 20-sided die
   * @returns Random integer 1-20 inclusive
   */
  private rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }
}
```

**Update Specification:**
```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF

**Code:**
- `src/lib/combat/combat-service.ts` - CombatService.resolveAttack()

**Tests:** TBD

**Status:** Implemented  ← Changed from Draft
```

### 5.5 Implementation Checklist

For each spec implementation:

- [ ] `@spec REQ-XXX-NNN` comment present in code
- [ ] Implementation matches spec formula exactly
- [ ] Edge cases from spec handled
- [ ] Type safety enforced (no `any` types)
- [ ] Error handling appropriate
- [ ] Spec updated with actual code file path
- [ ] Spec status updated to "Implemented"

### 5.6 Code Review Focus

During code review, verify:

1. **Spec compliance** - Does code match spec behavior?
2. **Formula accuracy** - Math matches design doc?
3. **Edge cases** - All spec scenarios handled?
4. **Traceability** - `@spec` tags present?
5. **Code quality** - Clean, maintainable, follows patterns?

---

## 6. Phase 4: Testing

### 6.1 Purpose

Validate that implementation matches specification through automated tests.

### 6.2 Test Requirements

**For every spec:**
1. ✅ At least one unit test explicitly referencing spec ID
2. ✅ Test name includes "REQ-XXX-NNN"
3. ✅ Tests cover happy path and edge cases
4. ✅ Tests must pass before marking spec "Validated"

### 6.3 Test Organization

**Unit Tests** (`src/lib/[system]/__tests__/`)
- Test individual functions/methods
- Fast execution (< 1ms per test)
- No database, no network
- Mock external dependencies

**Integration Tests** (`src/lib/[system]/__tests__/integration/`)
- Test multiple services together
- Use test database
- Verify data persistence
- Test transaction boundaries

**E2E Tests** (`tests/e2e/`)
- Test complete user flows
- Use Playwright
- Test UI + backend + database
- Slower (seconds per test)

### 6.4 Unit Test Example

**Specification:**
```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF
```

**Unit Tests:**
```typescript
// src/lib/combat/__tests__/combat-service.test.ts

import { describe, it, expect, vi } from 'vitest';
import { CombatService } from '../combat-service';

describe('CombatService', () => {
  describe('REQ-COMBAT-001: D20 Attack Resolution', () => {
    it('should hit when roll + ATK + bonuses >= DEF', () => {
      const service = new CombatService();
      const attacker = { ATK: 5 } as Unit;
      const defender = { DEF: 18 } as Unit;

      // Mock roll to 13 (13 + 5 = 18, exactly meets threshold)
      vi.spyOn(service as any, 'rollD20').mockReturnValue(13);

      const result = service.resolveAttack(attacker, defender);

      expect(result.roll).toBe(13);
      expect(result.total).toBe(18);
      expect(result.hit).toBe(true);
    });

    it('should miss when roll + ATK + bonuses < DEF', () => {
      const service = new CombatService();
      const attacker = { ATK: 5 } as Unit;
      const defender = { DEF: 18 } as Unit;

      // Mock roll to 12 (12 + 5 = 17, below threshold)
      vi.spyOn(service as any, 'rollD20').mockReturnValue(12);

      const result = service.resolveAttack(attacker, defender);

      expect(result.roll).toBe(12);
      expect(result.total).toBe(17);
      expect(result.hit).toBe(false);
    });

    it('should apply bonuses to attack roll', () => {
      const service = new CombatService();
      const attacker = { ATK: 5 } as Unit;
      const defender = { DEF: 20 } as Unit;

      // Mock roll to 12 (12 + 5 + 3 = 20, meets threshold with bonus)
      vi.spyOn(service as any, 'rollD20').mockReturnValue(12);

      const result = service.resolveAttack(attacker, defender, 3);

      expect(result.total).toBe(20);
      expect(result.hit).toBe(true);
    });
  });

  describe('REQ-COMBAT-002: Critical Success', () => {
    it('should always hit on natural 20', () => {
      const service = new CombatService();
      const attacker = { ATK: 1 } as Unit;
      const defender = { DEF: 99 } as Unit; // Impossible normally

      vi.spyOn(service as any, 'rollD20').mockReturnValue(20);

      const result = service.resolveAttack(attacker, defender);

      expect(result.critical).toBe(true);
      expect(result.hit).toBe(true);
    });
  });

  describe('REQ-COMBAT-003: Critical Failure', () => {
    it('should always miss on natural 1', () => {
      const service = new CombatService();
      const attacker = { ATK: 99 } as Unit;
      const defender = { DEF: 1 } as Unit; // Impossible to miss normally

      vi.spyOn(service as any, 'rollD20').mockReturnValue(1);

      const result = service.resolveAttack(attacker, defender);

      expect(result.fumble).toBe(true);
      expect(result.hit).toBe(false);
    });
  });
});
```

**Update Specification:**
```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF

**Code:**
- `src/lib/combat/combat-service.ts` - CombatService.resolveAttack()

**Tests:**
- `src/lib/combat/__tests__/combat-service.test.ts` - REQ-COMBAT-001 suite (3 tests)

**Status:** Implemented  ← Will change to Validated once tests pass
```

### 6.5 Test Naming Convention

**Pattern**: `REQ-XXX-NNN: [Human-readable behavior]`

**Examples:**
- ✅ `REQ-COMBAT-001: should hit when total >= DEF`
- ✅ `REQ-COMBAT-002: should always hit on natural 20`
- ✅ `REQ-RES-005: should deduct credits when building unit`

**Anti-patterns:**
- ❌ `test 1` (not descriptive)
- ❌ `it works` (not specific)
- ❌ `combat test` (no spec reference)

### 6.6 Test Coverage Requirements

**Minimum Coverage:**
- 80% line coverage overall
- 100% coverage of spec-tagged functions
- All edge cases from spec must have tests

**Coverage Check:**
```bash
npm run test:coverage
```

### 6.7 Testing Checklist

For each spec:

- [ ] Unit test suite created with spec ID in describe block
- [ ] Happy path tested
- [ ] Edge cases from spec tested
- [ ] Error conditions tested
- [ ] All tests pass (`npm run test`)
- [ ] Coverage meets threshold
- [ ] Spec updated with test file path
- [ ] Integration tests written (if needed)
- [ ] E2E tests written (if user-facing)

---

## 7. Phase 5: Validation

### 7.1 Purpose

Mark specifications as validated once implementation and tests are complete and verified.

### 7.2 Validation Criteria

A spec can be marked **Validated** when ALL of the following are true:

1. ✅ Implementation exists and includes `@spec REQ-XXX-NNN` tag
2. ✅ Unit tests exist and explicitly reference spec ID
3. ✅ All tests pass (`npm run test`)
4. ✅ Code passes type checking (`npm run typecheck`)
5. ✅ Code passes linting (`npm run lint`)
6. ✅ Code review approved (spec compliance verified)
7. ✅ Integration tests pass (if applicable)
8. ✅ E2E tests pass (if user-facing)

### 7.3 Validation Process

**Step 1: Run All Checks**

```bash
# Run full validation suite
npm run typecheck
npm run lint
npm run test -- --run
npm run test:e2e -- --project=chromium
```

All must pass with zero errors.

**Step 2: Code Review**

Reviewer verifies:
- Implementation matches spec formula/behavior
- Edge cases handled
- Tests comprehensive
- `@spec` tags present

**Step 3: Update Spec Status**

```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF

**Code:**
- `src/lib/combat/combat-service.ts` - CombatService.resolveAttack()

**Tests:**
- `src/lib/combat/__tests__/combat-service.test.ts` - REQ-COMBAT-001 suite (3 tests passing)

**Status:** Validated ✓  ← Changed from Implemented
```

**Step 4: Update Spec Summary**

```markdown
### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-COMBAT-001 | D20 Attack Resolution | **Validated ✓** | 3 passing |
| REQ-COMBAT-002 | Critical Success | **Validated ✓** | 1 passing |
| REQ-COMBAT-003 | Critical Failure | **Validated ✓** | 1 passing |

**Total Specifications:** 3
**Implemented:** 0
**Validated:** 3 ✓
**Draft:** 0
```

**Step 5: Update SPEC-REGISTRY.md**

```markdown
| ID | System | Title | Status | Priority | Blocks |
|----|--------|-------|--------|----------|--------|
| REQ-COMBAT-001 | Combat | D20 Resolution | **Validated ✓** | P0 | REQ-COMBAT-005 |
```

### 7.4 Validation Checklist

- [ ] All automated tests pass
- [ ] Code review completed and approved
- [ ] Spec status updated to "Validated ✓"
- [ ] Spec summary table updated
- [ ] SPEC-REGISTRY.md updated
- [ ] Related tickets/issues closed
- [ ] Documentation updated (if needed)

---

## 8. Phase 6: Iteration

### 8.1 Purpose

Maintain specifications as the game evolves. Handle bugs, balance changes, and new features through spec updates.

### 8.2 Iteration Scenarios

### Scenario 1: Bug Discovered

**Workflow:**

1. **Identify violated spec**
   - Bug: "Critical hits not working"
   - Violated spec: REQ-COMBAT-002

2. **Write failing test**
   ```typescript
   it('REQ-COMBAT-002: should double damage on critical hit', () => {
     // This test fails, reproducing the bug
   });
   ```

3. **Fix implementation**
   - Update code to match spec

4. **Verify tests pass**
   - Bug is fixed, spec is still correct

5. **Update spec notes (optional)**
   ```markdown
   **Notes:** Bug fixed 2026-01-15 - critical damage multiplier was 1.5x instead of 2.0x
   ```

### Scenario 2: Balance Change

**Workflow:**

1. **Decide on balance change**
   - "Critical hits are too rare, expand to 18-20 range"

2. **Update spec FIRST**
   ```markdown
   ### REQ-COMBAT-002: Critical Success

   **Description:** Natural 18-20 always hits and deals double damage

   **Key Values:**
   | Parameter | Value | Notes |
   |-----------|-------|-------|
   | critical_range | 18-20 | Changed from 20 only (2026-01-15) |

   **Status:** Validated → Implemented (requires code update)
   ```

3. **Tests fail (expected)**
   - Tests still check for roll === 20

4. **Update implementation**
   ```typescript
   critical: roll >= 18  // Changed from roll === 20
   ```

5. **Update tests**
   ```typescript
   it('should be critical on roll 18-20', () => {
     [18, 19, 20].forEach(roll => {
       // Test each value
     });
   });
   ```

6. **Tests pass, re-validate spec**
   ```markdown
   **Status:** Validated ✓
   ```

**Critical Rule**: Always update spec before code. This ensures design intent drives implementation.

### Scenario 3: New Feature

**Workflow:**

1. **Design the feature**
   - Add section to design document

2. **Write new specs**
   ```markdown
   ### REQ-COMBAT-015: Flanking Bonus

   **Description:** Attacker receives +2 bonus when target is adjacent to ally

   **Status:** Draft
   ```

3. **Implement feature**
   - Add flanking logic
   - Add `@spec REQ-COMBAT-015` tag

4. **Write tests**
   ```typescript
   describe('REQ-COMBAT-015: Flanking Bonus', () => {
     it('should add +2 when ally adjacent', () => { });
   });
   ```

5. **Validate**
   - Mark spec as Validated ✓

### Scenario 4: Deprecation

**Workflow:**

1. **Mark old spec as deprecated**
   ```markdown
   ### REQ-COMBAT-007: Static Defense Value

   **Description:** All units have fixed DEF value

   **Status:** Deprecated (2026-01-20)

   **Superseded By:** REQ-COMBAT-020 (Dynamic defense based on HP)

   **Migration:** Update all unit definitions to use HP-based formula
   ```

2. **Write new spec**
   ```markdown
   ### REQ-COMBAT-020: Dynamic Defense

   **Description:** Unit DEF = base_def + (current_hp * 0.1)

   **Replaces:** REQ-COMBAT-007

   **Status:** Draft
   ```

3. **Implement replacement**
   - Update code to use new formula
   - Update tests

4. **Remove deprecated spec from summary**
   - Move to "Deprecated Specifications" section at end of doc

### 8.3 Change Management

**Version Control:**
- All spec changes must be committed to git
- Commit message includes spec ID: `REQ-COMBAT-002: Expand critical range to 18-20`

**Change Log:**
- Design docs include a "Last Updated" date
- Major changes noted in document header
- Breaking changes highlighted in spec notes

**Communication:**
- Spec changes announced to team (Slack, standup, etc.)
- Breaking changes require team discussion before implementation

### 8.4 Iteration Best Practices

1. **Spec is source of truth** - Always update spec first
2. **Tests catch drift** - If tests fail after spec update, code is out of sync
3. **Document rationale** - Explain why change was made
4. **Maintain history** - Don't delete deprecated specs, mark them
5. **Review before merge** - Spec changes need approval like code changes

---

## 9. Specification Format Standard

### 9.1 Complete Template

```markdown
### REQ-[SYSTEM]-[NNN]: [Requirement Title]

**Description:** [Clear, testable statement of what must be true]

**Rationale:** [Why this requirement exists - ties back to design philosophy or game goals]

**Formula:** (if applicable)
```
result = base_value * modifier + constant
```

**Key Values:** (if applicable)
| Parameter | Value | Notes |
|-----------|-------|-------|
| threshold | 0.5 | 50% base chance |
| multiplier | 1.1 | 10% bonus |
| max_value | 100 | Hard cap |

**Acceptance Criteria:** (if complex)
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Source:** Section [X.X] - [Section Name in Design Doc]

**Code:**
- `src/lib/[system]/[file].ts` - [function or class name]
- `src/app/actions/[system]-actions.ts` - [action name]

**Tests:**
- `src/lib/[system]/__tests__/[file].test.ts` - [test description]

**Notes:** (optional)
[Additional context, edge cases, or historical notes]

**Status:** [Draft | Implemented | Validated | Deprecated]
```

### 9.2 Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| **ID** | Yes | REQ-[SYSTEM]-[NNN] format, unique, sequential |
| **Title** | Yes | Brief (3-7 words), describes requirement |
| **Description** | Yes | One sentence, testable statement |
| **Rationale** | Yes | Why this exists, ties to design goals |
| **Formula** | If applicable | Mathematical expression |
| **Key Values** | If applicable | Constants, thresholds, parameters |
| **Acceptance Criteria** | If complex | Checklist of success criteria |
| **Source** | Yes | Section reference in design doc |
| **Code** | Yes | File paths (even if "TBD") |
| **Tests** | Yes | Test file paths (even if "TBD") |
| **Notes** | Optional | Additional context |
| **Status** | Yes | Current state of spec |

### 9.3 Status Values

| Status | Meaning | Next Step |
|--------|---------|-----------|
| **Draft** | Spec written, not implemented | Write code |
| **Implemented** | Code exists, tests pending | Write tests |
| **Validated ✓** | Code and tests complete, reviewed | Use in production |
| **Deprecated** | Superseded by another spec | Mark "Superseded By" |

### 9.4 System Prefix Conventions

| System | Prefix | Example |
|--------|--------|---------|
| Combat | REQ-COMBAT | REQ-COMBAT-001 |
| Bot AI | REQ-BOT | REQ-BOT-001 |
| Resources | REQ-RES | REQ-RES-001 |
| Sectors | REQ-SEC | REQ-SEC-001 |
| Military | REQ-MIL | REQ-MIL-001 |
| Research | REQ-RSCH | REQ-RSCH-001 |
| Diplomacy | REQ-DIP | REQ-DIP-001 |
| Market | REQ-MKT | REQ-MKT-001 |
| Victory | REQ-VIC | REQ-VIC-001 |
| Covert Ops | REQ-COV | REQ-COV-001 |
| Turn Processing | REQ-TURN | REQ-TURN-001 |
| Progressive Systems | REQ-PROG | REQ-PROG-001 |
| Frontend/UI | REQ-UI | REQ-UI-001 |
| Tech Wars | REQ-TECH | REQ-TECH-001 |
| Syndicate | REQ-SYND | REQ-SYND-001 |
| Crafting | REQ-CRAFT | REQ-CRAFT-001 |
| Game Overview | REQ-GAME | REQ-GAME-001 |

---

## 10. Traceability Requirements

### 10.1 What is Traceability?

**Traceability** is the ability to link every line of code back to the design decision that motivated it.

**Complete Traceability Chain:**
```
Design Decision → Spec → Implementation → Tests → Validation
```

**Example:**
```
"Combat uses D20 mechanics" (Design Doc Section 2.1)
    ↓
REQ-COMBAT-001: D20 Attack Resolution (Spec)
    ↓
combat-service.ts resolveAttack() with @spec tag (Code)
    ↓
combat-service.test.ts REQ-COMBAT-001 suite (Tests)
    ↓
Status: Validated ✓ (Validation)
```

### 10.2 Forward Traceability

**Design Doc → Specs**
- `@spec REQ-XXX-NNN` tags in design document narrative
- Specs reference source section: `Source: Section 2.1`

**Specs → Code**
- `@spec REQ-XXX-NNN` comments in implementation
- Spec lists code file paths: `Code: src/lib/combat/combat-service.ts`

**Code → Tests**
- Test names include spec ID: `describe('REQ-COMBAT-001')`
- Spec lists test file paths: `Tests: src/lib/combat/__tests__/combat-service.test.ts`

### 10.3 Backward Traceability

**Given a line of code, find its spec:**
```typescript
// Search for @spec tag above function
/** @spec REQ-COMBAT-001 */
resolveAttack() { ... }
```

**Given a spec ID, find all related artifacts:**
```bash
# Find design doc
grep -r "REQ-COMBAT-001" docs/design/

# Find implementation
grep -r "@spec REQ-COMBAT-001" src/

# Find tests
grep -r "REQ-COMBAT-001" src/**/__tests__/
```

### 10.4 Traceability Matrix

**SPEC-REGISTRY.md** provides centralized traceability:

```markdown
| ID | System | Title | Status | Design Doc | Code | Tests |
|----|--------|-------|--------|------------|------|-------|
| REQ-COMBAT-001 | Combat | D20 Resolution | Validated | COMBAT-SYSTEM.md §2.1 | combat-service.ts:45 | combat-service.test.ts:12 |
```

### 10.5 Benefits of Traceability

1. **Impact Analysis** - "If I change this spec, what code is affected?"
2. **Requirements Coverage** - "Are all specs implemented?"
3. **Test Coverage** - "Does every spec have tests?"
4. **Change Management** - "Why was this code written this way?"
5. **Onboarding** - "New developer can trace code → spec → design intent"

---

## 11. Tools and Automation

### 11.1 VS Code Snippets

**Install**: `.vscode/sdd.code-snippets`

```json
{
  "Spec": {
    "prefix": "spec",
    "body": [
      "### REQ-${1:XXX}-${2:NNN}: ${3:Title}",
      "",
      "**Description:** ${4:testable statement}",
      "",
      "**Rationale:** ${5:why this matters}",
      "",
      "**Source:** Section ${6:X.X}",
      "",
      "**Code:**",
      "- `src/lib/${7:system}/${8:file}.ts`",
      "",
      "**Tests:**",
      "- `src/lib/${7:system}/__tests__/${8:file}.test.ts`",
      "",
      "**Status:** Draft"
    ]
  },
  "Spec Tag": {
    "prefix": "@spec",
    "body": [
      "/**",
      " * ${1:Function description}",
      " * ",
      " * @spec REQ-${2:XXX}-${3:NNN}",
      " */"
    ]
  },
  "Test Suite": {
    "prefix": "test-spec",
    "body": [
      "describe('REQ-${1:XXX}-${2:NNN}: ${3:Description}', () => {",
      "  it('${4:should behavior}', () => {",
      "    // Arrange",
      "    ${5}",
      "    ",
      "    // Act",
      "    ${6}",
      "    ",
      "    // Assert",
      "    ${7}",
      "  });",
      "});"
    ]
  }
}
```

### 11.2 Validation Script (`validate-specs.js`)

#### 11.2.1 Purpose

The validation script ensures specification integrity across all design documents. It catches errors early before they become problems in implementation.

**Location:** `scripts/validate-specs.js`

**What it checks:**
- ✅ All spec IDs are unique (no duplicates)
- ✅ Spec IDs follow REQ-XXX-NNN format
- ✅ All specs have required fields (Description, Status, Code, Tests, Source)
- ✅ Status values are valid (Draft, Implemented, Validated, Deprecated)
- ✅ Sequential numbering within systems (no gaps)
- ✅ Status consistency (Validated specs must have Code and Tests filled in)
- ✅ All @spec tags in design docs reference existing specs
- ✅ No orphaned references

#### 11.2.2 Usage

**Basic usage:**
```bash
node scripts/validate-specs.js
```

**The script requires no dependencies** - uses only Node.js built-in modules. Run from project root.

#### 11.2.3 When to Run

**Required:**
- ✅ Before committing any design document changes
- ✅ After creating or updating specs
- ✅ Before marking a spec as "Validated"
- ✅ In CI/CD pipeline (PR checks)

**Recommended:**
- After completing a migration with `/migrate-doc`
- Before starting implementation of a spec
- During code review if design docs were modified

#### 11.2.4 Example Output

**All specs valid:**
```
Validating Specifications

Found 14 design document(s):
  - COMBAT-SYSTEM.md
  - BOT-SYSTEM.md
  - RESEARCH-SYSTEM.md
  ...

Extracted 129 specification(s)
Found 33 @spec tag(s)

Validation Results:

✓ All specifications are valid!

Summary:
  Total Specs: 129
  Draft: 95
  Implemented: 20
  Validated: 14

By System:
  REQ-BOT: 10 specs
  REQ-COMBAT: 12 specs
  REQ-MIL: 10 specs
  REQ-RES: 12 specs
  ...
```

**With warnings (non-fatal):**
```
Validation Results:

⚠ Found 44 warning(s):

  ! REQ-COMBAT-001: Missing Code field (use "TBD" if not yet implemented)
  ! REQ-COMBAT-001: Missing Tests field (use "TBD" if not yet written)
  ! REQ-BOT-005: Missing Source field (should reference design doc section)

Validation passed with warnings.
```

**With errors (fatal - exit code 1):**
```
Validation Results:

❌ Found 3 error(s):

  ✗ Duplicate spec ID: REQ-COMBAT-001 found in COMBAT-SYSTEM.md, GAME-DESIGN.md
  ✗ Invalid spec ID format: REQ-Combat-001 in BOT-SYSTEM.md
  ✗ REQ-MIL-015: Status is Validated but Code field is empty or TBD

Validation failed. Please fix errors before proceeding.
```

#### 11.2.5 Understanding the Output

**Color Coding:**
- 🟢 **Green** - All checks passed
- 🟡 **Yellow** - Warnings (non-blocking, but should be addressed)
- 🔴 **Red** - Errors (blocking, must be fixed)

**Exit Codes:**
- `0` - Success (all validations passed, warnings allowed)
- `1` - Failure (errors found, must fix before commit)

**Common Warnings:**
- Missing Code/Tests fields on Draft specs → Expected, use "TBD"
- Missing Source field → Add section reference
- Gap in numbering → Renumber specs sequentially

**Common Errors:**
- Duplicate spec IDs → Each spec must have unique ID globally
- Invalid format → Must be REQ-SYSTEM-NNN (uppercase, 3 digits)
- Status inconsistency → Validated specs require Code and Tests
- Orphaned @spec tags → Referenced spec doesn't exist

#### 11.2.6 Fixing Common Issues

**Issue: "Missing Code field"**
```markdown
<!-- Before (causes warning) -->
**Status:** Implemented

<!-- After (warning resolved) -->
**Code:**
- `src/lib/combat/combat-service.ts` - resolveAttack()

**Status:** Implemented
```

**Issue: "Duplicate spec ID"**
```markdown
<!-- Problem: Same ID in two files -->
docs/design/COMBAT-SYSTEM.md: REQ-COMBAT-001
docs/design/GAME-DESIGN.md: REQ-COMBAT-001

<!-- Solution: Use different system prefixes -->
docs/design/COMBAT-SYSTEM.md: REQ-COMBAT-001
docs/design/GAME-DESIGN.md: REQ-GAME-001
```

**Issue: "Invalid spec ID format"**
```markdown
<!-- Invalid -->
REQ-Combat-001  ❌ (lowercase)
COMBAT-001      ❌ (missing REQ prefix)
REQ-COMBAT-1    ❌ (need 3 digits)

<!-- Valid -->
REQ-COMBAT-001  ✓
REQ-COMBAT-042  ✓
REQ-MIL-010     ✓
```

**Issue: "Status is Validated but Code field is empty"**
```markdown
<!-- Problem -->
**Code:** TBD
**Status:** Validated  ❌

<!-- Solution 1: Add code paths -->
**Code:**
- `src/lib/combat/combat-service.ts` - resolveAttack()
**Status:** Validated  ✓

<!-- Solution 2: Change status -->
**Code:** TBD
**Status:** Draft  ✓
```

#### 11.2.7 Integration with Workflow

**In daily development:**
```bash
# 1. After writing specs in design doc
node scripts/validate-specs.js

# 2. Fix any errors
# Edit design document to resolve issues

# 3. Commit when clean
git add docs/design/COMBAT-SYSTEM.md
git commit -m "feat: Add combat resolution specs (REQ-COMBAT-001..012)"
```

**In code review:**
- Reviewer runs validation before approving
- CI/CD runs validation automatically on PR
- Merge blocked if validation fails

### 11.3 Registry Generation Script (`generate-registry.js`)

#### 11.3.1 Purpose

The registry generator creates a centralized index of all specifications across all design documents. This provides a single source of truth for spec status and progress tracking.

**Location:** `scripts/generate-registry.js`

**What it generates:**
- `docs/SPEC-REGISTRY.md` - Complete specification index
- Summary statistics (total, by status, by system)
- Completion percentages
- Links to source documents and code files
- Grouped views by system and status

#### 11.3.2 Usage

**Basic usage:**
```bash
node scripts/generate-registry.js
```

**Output location:** `docs/SPEC-REGISTRY.md`

**The script requires no dependencies** - uses only Node.js built-in modules. Run from project root.

#### 11.3.3 When to Run

**Required:**
- ✅ After creating new specs in design documents
- ✅ After updating spec status (Draft → Implemented → Validated)
- ✅ After completing a migration with `/migrate-doc`
- ✅ Before committing design document changes (include registry in commit)

**Recommended:**
- Weekly to track progress
- Before sprint planning meetings
- After merging PRs that add/update specs

**Not required:**
- After only changing code (specs unchanged)
- After only changing tests (specs unchanged)
- During active development (run at logical breakpoints)

#### 11.3.4 Example Output

**Console output:**
```
Generating Specification Registry

Found 14 design document(s)
  - COMBAT-SYSTEM.md: 12 spec(s)
  - BOT-SYSTEM.md: 10 spec(s)
  - MILITARY-SYSTEM.md: 10 spec(s)
  - RESOURCE-MANAGEMENT-SYSTEM.md: 12 spec(s)
  - SECTOR-MANAGEMENT-SYSTEM.md: 11 spec(s)
  - VICTORY-SYSTEMS.md: 10 spec(s)
  - DIPLOMACY-SYSTEM.md: 10 spec(s)
  - MARKET-SYSTEM.md: 12 spec(s)
  - RESEARCH-SYSTEM.md: 12 spec(s)
  - PROGRESSIVE-SYSTEMS.md: 6 spec(s)
  - COVERT-OPS-SYSTEM.md: 12 spec(s)
  - SYNDICATE-SYSTEM.md: 12 spec(s)
  - COMBAT-SYSTEM-RAID-RESOLUTION.md: 0 spec(s)
  - GAME-DESIGN.md: 0 spec(s)

Total: 129 specification(s)

✓ Registry generated successfully
  Output: C:\dev\GIT\x-imperium\docs\SPEC-REGISTRY.md

Statistics:
  Total Specs: 129
  Systems: 12
  Validated: 14 (10.9%)
  Draft: 95
  Implemented: 20
  Deprecated: 0
```

#### 11.3.5 Generated Registry Format

**`docs/SPEC-REGISTRY.md` contains:**

**1. Summary Statistics Table**
```markdown
| Metric | Count |
|--------|-------|
| **Total Specifications** | 129 |
| **Draft** | 95 |
| **Implemented** | 20 |
| **Validated** | 14 |
| **Deprecated** | 0 |
| **Completion Rate** | 10.9% |
```

**2. By System Breakdown**
```markdown
| System | Specs | Validated | % Complete |
|--------|-------|-----------|------------|
| **REQ-BOT** | 10 | 2 | 20% |
| **REQ-COMBAT** | 12 | 4 | 33% |
| **REQ-MIL** | 10 | 3 | 30% |
...
```

**3. Complete Registry Table**
```markdown
| ID | System | Title | Status | Priority | Source | Code | Tests |
|----|--------|-------|--------|----------|--------|------|-------|
| REQ-BOT-001 | BOT | Four-Tier Intelligence | Draft | P1 | [BOT-SYSTEM.md](design/BOT-SYSTEM.md) | TBD | TBD |
| REQ-COMBAT-001 | COMBAT | D20 Attack Resolution | Validated | P0 | [COMBAT-SYSTEM.md](design/COMBAT-SYSTEM.md) | `combat-service.ts` | 1 file(s) |
...
```

**4. By Status Grouping**
```markdown
### Draft (95)
- **REQ-BOT-003** (BOT): Emotional States
- **REQ-COMBAT-005** (COMBAT): Diversity Bonus
...

### Validated (14)
- **REQ-COMBAT-001** (COMBAT): D20 Attack Resolution
- **REQ-MIL-001** (MIL): Six Unit Types
...
```

#### 11.3.6 Using the Registry

**For project managers:**
- Track completion percentages by system
- Identify bottlenecks (systems with low completion)
- Report progress to stakeholders

**For developers:**
- Find specs to implement next
- See which specs are blocked (dependencies)
- Check spec status before starting work

**For QA:**
- Identify specs without tests
- Verify all Validated specs have tests
- Create test plans based on spec groupings

**For designers:**
- See which systems need more specs
- Find gaps in specification coverage
- Prioritize spec writing efforts

#### 11.3.7 Integration with Git

**Recommended workflow:**
```bash
# 1. Update design document
vim docs/design/COMBAT-SYSTEM.md

# 2. Validate specs
node scripts/validate-specs.js

# 3. Regenerate registry
node scripts/generate-registry.js

# 4. Commit both together
git add docs/design/COMBAT-SYSTEM.md docs/SPEC-REGISTRY.md
git commit -m "feat: Add combat specs REQ-COMBAT-001..012"
```

**Why commit the registry:**
- ✅ Team always sees current spec status
- ✅ History tracks progress over time
- ✅ PR reviews can see spec changes
- ✅ No need to regenerate to view status

**Registry in .gitignore?**
❌ **No** - Always commit the registry. It's a generated artifact, but it's valuable documentation that should be versioned.

#### 11.3.8 Automation Tip

**Combine validation and generation:**
```bash
# Create an alias or npm script
node scripts/validate-specs.js && node scripts/generate-registry.js
```

**Add to package.json:**
```json
{
  "scripts": {
    "specs": "node scripts/validate-specs.js && node scripts/generate-registry.js"
  }
}
```

**Then run:**
```bash
npm run specs
```

### 11.4 Pre-commit Hooks

**`.husky/pre-commit`**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate specs before allowing commit
npm run validate-specs

# Regenerate registry if specs changed
if git diff --cached --name-only | grep -q 'docs/design/.*\.md'; then
  npm run generate-registry
  git add docs/SPEC-REGISTRY.md
fi
```

### 11.5 GitHub Actions

**`.github/workflows/validate-specs.yml`**

```yaml
name: Validate Specifications

on:
  pull_request:
    paths:
      - 'docs/design/**/*.md'
      - 'src/**/*.ts'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run validate-specs
      - run: npm run generate-registry
      - name: Check for changes
        run: |
          if ! git diff --exit-code docs/SPEC-REGISTRY.md; then
            echo "SPEC-REGISTRY.md is out of date. Run npm run generate-registry"
            exit 1
          fi
```

---

## 12. Best Practices

### 12.1 Design Phase Best Practices

1. **Write for humans first** - Design docs should be readable narratives
2. **Provide examples** - Show don't tell
3. **Explain rationale** - Why this design choice?
4. **Quantify targets** - "Balanced" is not a spec, "47.6% ±2%" is
5. **Document edge cases** - What happens when...?
6. **Cross-reference** - Link to related systems
7. **Use consistent terminology** - "Sector" not "Territory" sometimes

### 12.2 Specification Phase Best Practices

1. **One spec, one behavior** - Atomic requirements
2. **Testable statements** - Can you write a test for this?
3. **No ambiguity** - Single interpretation only
4. **Include formulas** - Math should be explicit
5. **Link to source** - Always reference design doc section
6. **Sequential numbering** - No gaps, no duplicates
7. **Update as you go** - Don't batch spec updates

### 12.3 Implementation Phase Best Practices

1. **Read spec first** - Understand requirement before coding
2. **Tag every implementation** - `@spec REQ-XXX-NNN` is mandatory
3. **Match formulas exactly** - Don't "improve" math without updating spec
4. **Handle edge cases** - All scenarios from spec must be covered
5. **Update spec immediately** - Add code file path right away
6. **Type safety** - No `any` types, strict mode enabled
7. **Clean code** - Implementation should be readable

### 12.4 Testing Phase Best Practices

1. **Reference spec ID** - Test name must include REQ-XXX-NNN
2. **Test behavior, not implementation** - Test what, not how
3. **Cover edge cases** - All spec scenarios get tests
4. **Mock appropriately** - Isolate unit under test
5. **Fast tests** - Unit tests should be < 1ms
6. **Descriptive assertions** - `expect(hit).toBe(true)` not just `expect(result)`
7. **Update spec immediately** - Add test file path right away

### 12.5 Validation Phase Best Practices

1. **All checks must pass** - No shortcuts
2. **Code review required** - Verify spec compliance
3. **Update status atomically** - Spec + registry + summary at once
4. **Document test count** - "3 tests passing" not just "passing"
5. **Close related issues** - Link spec to tickets
6. **Announce completion** - Team should know spec is validated

### 12.6 Iteration Phase Best Practices

1. **Spec first, always** - Never update code before spec
2. **Document changes** - Note date and reason in spec
3. **Deprecate, don't delete** - Keep history
4. **Communicate breaking changes** - Team discussion required
5. **Version control** - Commit spec changes separately
6. **Regression tests** - Ensure old behavior still works (if intended)

### 12.7 General Best Practices

1. **Consistency** - Use same terminology across all docs
2. **Traceability** - Every artifact links to others
3. **Automation** - Validate with scripts, not manual checks
4. **Communication** - Spec changes need visibility
5. **Living documents** - Specs evolve, that's expected
6. **Quality over speed** - Better to write good spec than rush
7. **Team ownership** - Everyone maintains specs, not just one person

---

## Appendix A: Example Lifecycle Walkthrough

### Complete Example: REQ-COMBAT-001

**Day 1: Design Phase**

Designer writes COMBAT-SYSTEM.md:

```markdown
## 2.1 Core Concept

Combat in Nexus Dominion uses D20 resolution mechanics. The attacker rolls
a 20-sided die, adds their ATK modifier and any situational bonuses, and
compares the total against the defender's DEF stat. If the attacker's total
meets or exceeds the defender's DEF, the attack hits.

This creates 5% granularity familiar to D&D players and enables strategic
depth through modifier stacking.
```

**Day 2: Specification Phase**

Designer extracts formal spec:

```markdown
### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack hits if d20 + ATK modifier + bonuses >= defender DEF

**Rationale:** Provides 5% granularity and familiar D&D-style mechanics for
player accessibility while enabling strategic depth through modifiers

**Formula:**
hit = (roll(1, 20) + attacker.ATK + bonuses) >= defender.DEF

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| die_type | d20 | Standard 20-sided die |
| min_roll | 1 | 5% floor |
| max_roll | 20 | 5% ceiling |

**Source:** Section 2.1 - Core Concept

**Code:** TBD

**Tests:** TBD

**Status:** Draft
```

**Day 3: Implementation Phase**

Developer implements:

```typescript
// src/lib/combat/combat-service.ts

export interface AttackResult {
  roll: number;
  total: number;
  hit: boolean;
  critical: boolean;
  fumble: boolean;
}

export class CombatService {
  /**
   * Resolves a D20 attack roll
   *
   * @spec REQ-COMBAT-001
   *
   * @param attacker - Attacking unit with ATK stat
   * @param defender - Defending unit with DEF stat
   * @param bonuses - Additional modifiers (flanking, research, etc.)
   * @returns AttackResult with roll, total, and hit status
   */
  resolveAttack(
    attacker: Unit,
    defender: Unit,
    bonuses: number = 0
  ): AttackResult {
    const roll = this.rollD20();
    const total = roll + attacker.ATK + bonuses;
    const hit = total >= defender.DEF;

    return {
      roll,
      total,
      hit,
      critical: roll === 20,
      fumble: roll === 1
    };
  }

  private rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }
}
```

Updates spec:

```markdown
**Code:**
- `src/lib/combat/combat-service.ts` - CombatService.resolveAttack()

**Status:** Implemented
```

**Day 4: Testing Phase**

QA writes tests:

```typescript
// src/lib/combat/__tests__/combat-service.test.ts

import { describe, it, expect, vi } from 'vitest';
import { CombatService } from '../combat-service';

describe('CombatService', () => {
  describe('REQ-COMBAT-001: D20 Attack Resolution', () => {
    it('should hit when roll + ATK + bonuses >= DEF', () => {
      const service = new CombatService();
      const attacker = { ATK: 5 } as Unit;
      const defender = { DEF: 18 } as Unit;

      vi.spyOn(service as any, 'rollD20').mockReturnValue(13);

      const result = service.resolveAttack(attacker, defender);

      expect(result.roll).toBe(13);
      expect(result.total).toBe(18);
      expect(result.hit).toBe(true);
    });

    it('should miss when roll + ATK + bonuses < DEF', () => {
      const service = new CombatService();
      const attacker = { ATK: 5 } as Unit;
      const defender = { DEF: 18 } as Unit;

      vi.spyOn(service as any, 'rollD20').mockReturnValue(12);

      const result = service.resolveAttack(attacker, defender);

      expect(result.hit).toBe(false);
    });

    it('should apply bonuses to attack roll', () => {
      const service = new CombatService();
      const attacker = { ATK: 5 } as Unit;
      const defender = { DEF: 20 } as Unit;

      vi.spyOn(service as any, 'rollD20').mockReturnValue(12);

      const result = service.resolveAttack(attacker, defender, 3);

      expect(result.total).toBe(20);
      expect(result.hit).toBe(true);
    });
  });
});
```

Runs validation:

```bash
$ npm run test
✓ REQ-COMBAT-001: should hit when roll + ATK + bonuses >= DEF
✓ REQ-COMBAT-001: should miss when roll + ATK + bonuses < DEF
✓ REQ-COMBAT-001: should apply bonuses to attack roll

Tests: 3 passed, 3 total
```

Updates spec:

```markdown
**Tests:**
- `src/lib/combat/__tests__/combat-service.test.ts` - REQ-COMBAT-001 suite (3 tests)

**Status:** Implemented
```

**Day 5: Validation Phase**

Code review approved. All checks pass:

```bash
$ npm run typecheck
✓ No type errors

$ npm run lint
✓ No linting issues

$ npm run test
✓ All 3 tests pass
```

Updates spec:

```markdown
**Status:** Validated ✓
```

Updates SPEC-REGISTRY.md:

```markdown
| REQ-COMBAT-001 | Combat | D20 Attack Resolution | Validated ✓ | P0 | combat-service.ts | combat-service.test.ts |
```

**Week 2: Iteration Phase**

Playtest feedback: "Crits are too rare!"

Designer updates spec FIRST:

```markdown
### REQ-COMBAT-002: Critical Success

**Description:** Natural 18-20 always hits and deals double damage

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| critical_range | 18-20 | Expanded from 20 only (2026-01-19) |
| damage_multiplier | 2.0 | Double damage |

**Status:** Validated → Implemented (requires update)
```

Tests fail (expected). Developer updates code:

```typescript
critical: roll >= 18  // Changed from roll === 20
```

Tests updated and pass. Spec re-validated:

```markdown
**Status:** Validated ✓
**Notes:** Critical range expanded to 18-20 on 2026-01-19 for balance
```

---

## Appendix B: Migration from Existing Code

### For Projects with Existing Implementation

If you have code before specs, here's how to retrofit SDD:

**Step 1: Identify Behaviors**

Review existing code and list all game mechanics:
- Functions that implement game rules
- Formulas and calculations
- Balance constants
- Conditional logic

**Step 2: Write Specs from Code**

For each behavior, create a spec:

```typescript
// Existing code
function calculateDamage(attacker, defender) {
  return attacker.power - defender.armor * 0.5;
}

// Create spec
### REQ-DMG-001: Damage Calculation

**Description:** Damage = attacker power - (defender armor * 0.5)

**Code:**
- `src/lib/damage/calculator.ts` - calculateDamage()

**Status:** Implemented (retrofitted)
```

**Step 3: Write Tests**

Add tests that reference specs:

```typescript
describe('REQ-DMG-001: Damage Calculation', () => {
  it('should reduce damage by 50% of armor', () => {
    // Test implementation
  });
});
```

**Step 4: Add @spec Tags**

Tag existing code:

```typescript
/**
 * @spec REQ-DMG-001
 */
function calculateDamage(attacker, defender) {
  return attacker.power - defender.armor * 0.5;
}
```

**Step 5: Validate**

If tests exist and pass, mark spec as Validated. If not, write tests first.

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Spec** | Short for "specification" - a formal requirement |
| **REQ-XXX-NNN** | Specification ID format (e.g., REQ-COMBAT-001) |
| **SDD** | Spec-Driven Development methodology |
| **Traceability** | Ability to link code → spec → design decision |
| **@spec tag** | Code comment linking implementation to spec |
| **Status** | Current state: Draft, Implemented, Validated, Deprecated |
| **Validation** | Confirming implementation matches spec via tests |
| **Iteration** | Updating specs and code as game evolves |
| **Atomic** | Spec tests one behavior, not multiple |
| **Testable** | Can be verified with automated tests |

---

## Appendix D: Quick Reference Checklists

### Spec Writing Checklist

- [ ] Unique ID assigned (REQ-XXX-NNN)
- [ ] Description is testable (one sentence)
- [ ] Rationale explains why
- [ ] Formula included (if applicable)
- [ ] Key values defined (if applicable)
- [ ] Source section referenced
- [ ] Code field present (even if TBD)
- [ ] Tests field present (even if TBD)
- [ ] Status is Draft

### Implementation Checklist

- [ ] Spec read and understood
- [ ] @spec tag added to code
- [ ] Formula matches spec exactly
- [ ] Edge cases handled
- [ ] Type safety enforced
- [ ] Error handling appropriate
- [ ] Spec updated with code file path
- [ ] Status changed to Implemented

### Testing Checklist

- [ ] Test name includes REQ-XXX-NNN
- [ ] Happy path tested
- [ ] Edge cases tested
- [ ] Error conditions tested
- [ ] All tests pass
- [ ] Coverage meets threshold (80%+)
- [ ] Spec updated with test file path

### Validation Checklist

- [ ] All tests pass
- [ ] Type check passes
- [ ] Lint passes
- [ ] Code review approved
- [ ] Spec status changed to Validated ✓
- [ ] Summary table updated
- [ ] SPEC-REGISTRY.md updated

---

**End of Document**

*This process standard is a living document. Suggest improvements via pull request.*
