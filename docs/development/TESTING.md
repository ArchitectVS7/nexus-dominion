# Testing Guide

> This document covers testing conventions for Nexus Dominion.

---

## Test Commands

```bash
# Unit tests (Vitest)
npm run test             # Watch mode
npm run test -- --run    # Run once
npm run test:ui          # Vitest UI
npm run test:coverage    # Coverage report

# Run specific test file
npm run test -- src/lib/formulas/combat-power.test.ts

# E2E tests (Playwright)
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Playwright UI mode
```

---

## Testing Conventions

### File Organization

| Test Type | Location | Naming |
|-----------|----------|--------|
| Unit tests | Next to source files | `*.test.ts` |
| Service tests | `src/lib/game/services/__tests__/` | `*.test.ts` |
| E2E tests | `e2e/` | `milestone-*.spec.ts` |

### Unit Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { calculateCombatPower } from "./combat-power";

describe("calculateCombatPower", () => {
  it("should apply diversity bonus for 4+ unit types", () => {
    const forces = {
      soldiers: 100,
      fighters: 50,
      lightCruisers: 10,
      heavyCruisers: 5
    };
    const power = calculateCombatPower(forces);
    expect(power).toBeGreaterThan(basePower * 1.15);
  });

  it("should return 0 for empty forces", () => {
    const forces = {};
    expect(calculateCombatPower(forces)).toBe(0);
  });
});
```

### Service Test Pattern

Services require database mocking:

```typescript
import { describe, it, expect, vi } from "vitest";
import { mockDb } from "@/test/utils/db-mock";

describe("SectorService", () => {
  it("should acquire sector when empire has sufficient credits", async () => {
    mockDb.empires.findFirst.mockResolvedValue({
      id: "empire-1",
      credits: 10000,
    });

    const result = await acquireSector("empire-1", "food");
    expect(result.success).toBe(true);
  });
});
```

---

## Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |
| Statements | 80% |

Run coverage report: `npm run test:coverage`

---

## E2E Testing

E2E tests use Playwright and follow milestone-based organization:

```typescript
// e2e/milestone-1.spec.ts
import { test, expect } from "@playwright/test";

test("player can start new game", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="new-game-button"]');
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

### Data-TestId Convention

All interactive UI elements should have `data-testid` attributes:

```tsx
<button data-testid="buy-sector-button">Buy Sector</button>
<div data-testid="empire-credits">{credits}</div>
```

---

## Quality Checks

Run all checks before committing:

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript strict mode
npm run test -- --run # Unit tests
npm run test:e2e      # E2E tests
```

---

## Related Documents

- [CLAUDE.md](../../CLAUDE.md) - All commands reference
- [Architecture Guide](ARCHITECTURE.md) - Project structure
