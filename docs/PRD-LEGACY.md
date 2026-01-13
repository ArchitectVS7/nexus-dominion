

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
