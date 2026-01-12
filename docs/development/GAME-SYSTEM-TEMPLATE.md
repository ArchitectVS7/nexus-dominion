# [System Name]

**Version:** X.X
**Status:** [FOR IMPLEMENTATION | Active | Canonical | Core Game Feature]
**Spec Prefix:** REQ-XXX (e.g., REQ-COMBAT, REQ-RES, REQ-BOT)
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Replaces:** [Previous document names, if applicable]

---

## Document Purpose

[2-3 paragraphs explaining:
- What this document defines
- Who should read it
- What decisions it resolves]

**Design Philosophy:**
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]
- [4-6 core principles]

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Mechanics Overview](#2-mechanics-overview)
3. [Detailed Rules](#3-detailed-rules)
4. [Bot Integration](#4-bot-integration)
5. [UI/UX Design](#5-uiux-design)
6. [Specifications](#6-specifications)
7. [Implementation Requirements](#7-implementation-requirements)
8. [Balance Targets](#8-balance-targets)
9. [Migration Plan](#9-migration-plan)
10. [Conclusion](#10-conclusion)

---

## 1. Core Concept

### 1.1 [Primary Subsystem]
[Explain the core idea with examples]

### 1.2 [Key Mechanic]
[Detail the main game loop]

### 1.3 [Player Experience]
[Describe what it feels like to use this system]

---

## 2. Mechanics Overview

[Tables, formulas, core rules]

---

## 3. Detailed Rules

### 3.1 [Specific Rule Category]
[Complete specification with edge cases]

### 3.2 [Another Rule Category]
[Include examples and counterexamples]

---

## 4. Bot Integration

### 4.1 Archetype Behavior
[How each archetype uses this system]

### 4.2 Bot Decision Logic
[Pseudo-code or decision trees]

### 4.3 Bot Messages
[Message templates and examples]

---

## 5. UI/UX Design

### 5.1 UI Mockups
[ASCII art or detailed descriptions]

### 5.2 User Flows
[Step-by-step interaction patterns]

### 5.3 Visual Design Principles
[Color coding, icons, layout]

---

## 6. Specifications

This section contains formal requirements for spec-driven development. Each specification:
- Has a unique ID for traceability
- Links to code and tests
- Can be validated independently

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |
| **Deprecated** | Superseded by another spec |

---

### REQ-XXX-001: [Requirement Title]

**Description:** [What must be true - clear, testable statement]

**Rationale:** [Why this requirement exists - ties back to design philosophy]

**Formula:** (if applicable)
```
result = base_value * modifier
```

**Key Values:** (if applicable)
| Parameter | Value | Notes |
|-----------|-------|-------|
| threshold | 0.5 | 50% chance |
| multiplier | 1.1 | 10% bonus |

**Source:** Section [X.X] above

**Code:**
- `src/lib/[system]/[file].ts` - [function or class name]
- `src/app/actions/[system]-actions.ts` - [action name]

**Tests:**
- `src/lib/[system]/__tests__/[file].test.ts` - [test description]

**Status:** Draft

---

### REQ-XXX-002: [Requirement Title]

**Description:** [What must be true]

**Rationale:** [Why]

**Source:** Section [X.X] above

**Code:**
- `src/lib/[system]/[file].ts`

**Tests:**
- `src/lib/[system]/__tests__/[file].test.ts`

**Status:** Draft

---

### REQ-XXX-003: [Requirement Title]

[Continue pattern for each requirement...]

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-XXX-001 | [Title] | Draft | TBD |
| REQ-XXX-002 | [Title] | Draft | TBD |
| REQ-XXX-003 | [Title] | Draft | TBD |

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: [table_name]
-- Purpose: [what this table stores]

CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[table]_[column] ON [table_name]([column]);
```

### 7.2 Service Architecture

```typescript
// src/lib/[system]/[service].ts

export interface [SystemConfig] {
  // configuration options
}

export class [SystemService] {
  /**
   * [Method description]
   * @spec REQ-XXX-001
   */
  async [methodName](params: [Type]): Promise<[ReturnType]> {
    // implementation
  }
}
```

### 7.3 Server Actions

```typescript
// src/app/actions/[system]-actions.ts

"use server";

/**
 * [Action description]
 * @spec REQ-XXX-002
 */
export async function [actionName](
  formData: FormData
): Promise<ActionResult> {
  // implementation
}
```

### 7.4 UI Components

```typescript
// src/components/[system]/[Component].tsx

interface [Component]Props {
  // props
}

export function [Component]({ ...props }: [Component]Props) {
  // component implementation
}
```

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| [Metric 1] | X | ±Y | [How to measure] |
| [Metric 2] | X | ±Y | [How to measure] |

### 8.2 Simulation Requirements

```
Monte Carlo: 10,000 iterations
Variables: [list controlled variables]
Success Criteria: [target within tolerance]
```

### 8.3 Playtest Checklist

- [ ] [Scenario 1]: Expected outcome achieved
- [ ] [Scenario 2]: Edge case handled correctly
- [ ] [Scenario 3]: Player experience feels right

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| [What exists] | [What should exist] | [How to get there] |

### 9.2 Data Migration

```sql
-- Migration: [description]
-- Safe to run: [yes/no, why]

UPDATE [table] SET [column] = [value] WHERE [condition];
```

### 9.3 Rollback Plan

[How to revert if something goes wrong]

---

## 10. Conclusion

### Key Decisions
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

### Open Questions
- [Question 1]: [Context, options being considered]

### Dependencies
- **Depends On:** [List systems this depends on]
- **Depended By:** [List systems that depend on this]

---

## Appendix A: Format Principles

### **1. Hierarchy & Navigation**
- ✅ Use numbered sections (1, 2, 3...) for main sections
- ✅ Use subsection numbering (1.1, 1.2, 1.3...)
- ✅ Include table of contents with anchor links
- ✅ Use horizontal rules (---) to separate major sections

### **2. Status & Versioning**
- ✅ Always include version number
- ✅ Specify implementation status
- ✅ Include creation and update dates
- ✅ Note what documents this replaces

### **3. Specification Traceability**
- ✅ Every spec has unique ID (REQ-XXX-NNN)
- ✅ Specs reference source section in narrative
- ✅ Specs link to implementation code
- ✅ Specs link to validation tests
- ✅ Use `@spec REQ-XXX-NNN` in code comments

### **4. Implementation Focus**
- ✅ Database schemas in SQL format
- ✅ Service architecture in TypeScript
- ✅ UI components with props/interfaces
- ✅ Complete, copy-pasteable code examples

### **5. Bot Integration**
- ✅ Archetype-specific behavior tables
- ✅ Message template examples (5-10 minimum)
- ✅ Decision logic pseudo-code or trees
- ✅ Special cases for LLM vs scripted bots

### **6. Balance & Testing**
- ✅ Quantitative balance targets
- ✅ Win rate expectations
- ✅ Testing checklists with checkboxes
- ✅ Monte Carlo simulation targets (if applicable)

### **7. Narrative Polish**
- ✅ Player experience walkthroughs
- ✅ Dramatic moment examples (victory screens, announcements)
- ✅ UI mockups in ASCII art or detailed prose
- ✅ Flavor text and messaging

### **8. Resolution Before Merge**
- ⚠️ **NO unresolved DEV NOTEs** - All design questions must be answered
- ⚠️ **NO placeholder sections** - Every section must be complete
- ⚠️ **NO conflicting information** - Cross-reference with other docs

---

## Appendix B: Document Length Guidelines

**By System Complexity:**

| System Type | Target Length | Specs Expected |
|-------------|---------------|----------------|
| **Core (Combat, Economy)** | 800-1200 lines | 10-15 specs |
| **Major Feature (Syndicate, Research)** | 600-900 lines | 8-12 specs |
| **Bot/AI System** | 700-900 lines | 8-10 specs |
| **Minor Feature** | 300-500 lines | 3-6 specs |
| **Expansion Concept** | 200-400 lines | 2-4 specs |

---

## Appendix C: Specification Quick Reference

When writing specs, use this checklist:

```markdown
### REQ-XXX-NNN: [Title]

**Description:** [REQUIRED - testable statement]

**Rationale:** [REQUIRED - why this matters]

**Formula:** [IF APPLICABLE - mathematical relationship]

**Key Values:** [IF APPLICABLE - table of constants]

**Source:** [REQUIRED - section reference]

**Code:** [REQUIRED - file paths]

**Tests:** [REQUIRED - test file paths]

**Status:** [REQUIRED - Draft|Implemented|Validated|Deprecated]
```

### Naming Conventions

| System | Prefix |
|--------|--------|
| Combat | REQ-COMBAT |
| Bot AI | REQ-BOT |
| Resources | REQ-RES |
| Sectors | REQ-SEC |
| Military | REQ-MIL |
| Research | REQ-RSCH |
| Diplomacy | REQ-DIP |
| Market | REQ-MKT |
| Victory | REQ-VIC |
| Covert | REQ-COV |
| Turn Processing | REQ-TURN |
| Progressive | REQ-PROG |
| Frontend/UI | REQ-UI |
| Tech Wars | REQ-TECH |
| Syndicate | REQ-SYND |
| Crafting | REQ-CRAFT |
| Game Overview | REQ-GAME |
