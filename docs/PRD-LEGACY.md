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
