# Spec Registry

This document maps specifications to their implementation and tests. Use this to trace requirements through the codebase.

**Format**: `[SPEC-ID]` → Source Doc → Code Files → Test Files

---

## Core Systems

### SPEC-COMBAT: Combat System
- **Source**: [docs/design/COMBAT-SYSTEM.md](design/COMBAT-SYSTEM.md)
- **Key Values**:
  - 47.6% attacker win rate (validated)
  - 1.10x defender advantage
  - 6 dramatic outcomes
  - D20 unified resolution
- **Code**:
  - `src/lib/combat/phases.ts` - Combat phase execution
  - `src/lib/combat/effectiveness.ts` - Unit effectiveness matrix
  - `src/lib/formulas/combat-power.ts` - Power calculations
  - `src/lib/formulas/casualties.ts` - Casualty formulas
  - `src/app/actions/combat-actions.ts` - Server actions
- **Tests**:
  - `src/lib/formulas/combat-power.test.ts` ✅ References PRD 6.2
  - `src/lib/formulas/casualties.test.ts`
  - `src/lib/game/services/__tests__/combat-service.test.ts`

### SPEC-BOT: Bot AI System
- **Source**: [docs/design/BOT-SYSTEM.md](design/BOT-SYSTEM.md)
- **Key Values**:
  - 4-tier intelligence (LLM, Strategic, Simple, Random)
  - 8 archetypes (Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist)
  - Emotional states with memory decay
  - 100 unique personas
- **Code**:
  - `src/lib/bots/` - Bot decision making
  - `src/lib/bots/archetypes/` - Archetype implementations
  - `src/lib/bots/emotions/` - Emotional state system
  - `src/lib/bots/memory/` - Relationship memory
  - `src/lib/game/config/archetype-loader.ts` - Config loading
- **Tests**:
  - `src/lib/game/services/__tests__/bot-processor.test.ts`
  - `src/lib/bots/__tests__/` (if exists)

### SPEC-VICTORY: Victory Conditions
- **Source**: [docs/design/GAME-DESIGN.md#victory-conditions](design/GAME-DESIGN.md)
- **Key Values**:
  - Conquest: 60% territory control
  - Economic: 1.5x networth of 2nd place
  - Diplomatic: Coalition controls 50%
  - Research: Complete tech tree (Tier 3)
  - Military: 2x military of all others combined
  - Survival: Highest score at turn limit
- **Code**:
  - `src/lib/game/services/core/victory-service.ts`
  - `src/lib/victory/` - Victory condition checks
- **Tests**:
  - `src/lib/game/services/__tests__/victory-service.test.ts` ✅ Validates thresholds

### SPEC-RESOURCES: Resource System
- **Source**: [docs/design/GAME-DESIGN.md#resource-system](design/GAME-DESIGN.md)
- **Key Values**:
  - 5 resources: Credits, Food, Ore, Petroleum, Research Points
  - 8 sector types producing different resources
  - Civil status affects income (0.25x to 4.0x)
- **Code**:
  - `src/lib/game/services/resource-engine.ts`
  - `src/lib/game/services/civil-status.ts`
  - `src/lib/game/constants.ts`
- **Tests**:
  - `src/lib/game/services/__tests__/resource-engine.test.ts`
  - `src/lib/game/services/__tests__/civil-status.test.ts`

### SPEC-SECTORS: Sector Management
- **Source**: [docs/design/GAME-DESIGN.md](design/GAME-DESIGN.md)
- **Key Values**:
  - 5 starting sectors per empire
  - 8 sector types
  - Sector costs scale with count
- **Code**:
  - `src/lib/game/services/sector-service.ts`
  - `src/lib/formulas/sector-costs.ts`
  - `src/app/actions/sector-actions.ts`
- **Tests**:
  - `src/lib/formulas/sector-costs.test.ts`
  - `src/lib/game/services/__tests__/sector-service.test.ts`

---

## Expansion Systems (Post-Alpha)

### SPEC-CRAFTING: Crafting System
- **Source**: [docs/expansion/CRAFTING.md](expansion/CRAFTING.md)
- **Status**: Schema ready, UI pending
- **Code**:
  - `src/app/actions/crafting-actions.ts`
  - `src/app/game/crafting/page.tsx`
- **Tests**: TBD

### SPEC-SYNDICATE: Syndicate/Black Market
- **Source**: [docs/expansion/SYNDICATE.md](expansion/SYNDICATE.md)
- **Status**: Backend complete, needs integration
- **Code**:
  - `src/app/actions/syndicate-actions.ts` (if exists)
  - `src/app/game/syndicate/page.tsx`
- **Tests**: TBD

---

## Frontend/SDD Systems

### SPEC-SDD: React Query + Zustand Architecture
- **Source**: This is the SDD migration pattern
- **Pattern**:
  - Zustand stores for client state (`src/stores/`)
  - React Query for server state (`src/lib/api/`)
  - Server Actions for mutations (`src/app/actions/`)
- **Code**:
  - `src/stores/` - game-store, panel-store, tutorial-store
  - `src/lib/api/queries/` - Data fetching hooks
  - `src/lib/api/mutations/` - Mutation hooks
  - `src/components/game/GameShell.tsx` - Main orchestrator
- **Tests**:
  - Component tests should verify hook usage
  - E2E tests verify user flows

---

## How to Add Traceability

When writing code, add spec references in JSDoc:

```typescript
/**
 * Calculate combat power for attacking forces.
 *
 * @spec SPEC-COMBAT
 * @see docs/design/COMBAT-SYSTEM.md
 * @values 47.6% attacker win rate target
 */
export function calculateCombatPower(forces: Forces): number {
  // ...
}
```

When writing tests, reference the spec:

```typescript
describe("calculateCombatPower", () => {
  // @spec SPEC-COMBAT - validates power multipliers from COMBAT-SYSTEM.md
  it("has correct values from COMBAT-SYSTEM.md", () => {
    expect(POWER_MULTIPLIERS.fighters).toBe(1);
    expect(POWER_MULTIPLIERS.carriers).toBe(12);
  });
});
```

---

## Migration Status

| System | Spec | Code | Tests | SDD Migrated |
|--------|------|------|-------|--------------|
| Combat | ✅ | ✅ | ✅ | ✅ |
| Bot AI | ✅ | ✅ | ⚠️ Partial | ✅ |
| Victory | ✅ | ✅ | ✅ | ✅ |
| Resources | ✅ | ✅ | ✅ | ✅ |
| Sectors | ✅ | ✅ | ✅ | ✅ |
| Market | ✅ | ✅ | ⚠️ | ✅ |
| Research | ✅ | ✅ | ⚠️ | ✅ |
| Diplomacy | ✅ | ✅ | ⚠️ | ✅ |
| Covert | ✅ | ✅ | ⚠️ | ✅ |
| Messages | ✅ | ✅ | ⚠️ | ✅ |
| Crafting | ✅ | ✅ | ⚠️ | ✅ |
| Syndicate | ✅ | ✅ | ⚠️ | ✅ |
| Starmap | ✅ | ✅ | ⚠️ | ✅ |

**Legend**: ✅ Complete | ⚠️ Partial | ❌ Missing
