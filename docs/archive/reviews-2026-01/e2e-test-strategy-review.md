# E2E Test Strategy Review

**Project:** Nexus Dominion
**Date:** 2026-01-10
**Reviewed by:** QA Expert Agent

---

## Executive Summary

The E2E testing infrastructure for Nexus Dominion is well-established with Playwright and follows sensible patterns for database management and test isolation. However, recent codebase optimizations have exposed fragility in the test suite, particularly around:

1. **Turn advancement reliability** - Modal handling and state synchronization issues
2. **Selector fragility** - Mixed use of test IDs, CSS selectors, and text matching
3. **Coverage gaps** - Several game features lack dedicated E2E test coverage
4. **Test duplication** - Overlapping test logic across multiple spec files

---

## 1. Current E2E Test Structure

### 1.1 Test Files Inventory

| File | Purpose | Duration | Bots | Turns |
|------|---------|----------|------|-------|
| `smoke-test.spec.ts` | Fast CI validation | ~30-60s | 10 | 2 |
| `milestone-core.spec.ts` | M1-M4 features (game creation, resources, sectors, combat UI) | ~3-5min | Default | Per-test |
| `milestone-advanced.spec.ts` | M5-M8 features (bots, persistence, covert, market, diplomacy, messages) | ~5-8min | Default | Per-test |
| `comprehensive-test.spec.ts` | Full 10-20 turn playthroughs with feature rotation | ~7-15min | Default | 10-20 |
| `bot-scaling-test.spec.ts` | Performance with 10/25/50/100 bots | ~15min | Variable | 5 |
| `tells-5bot-20turn.spec.ts` | Bot tell system validation (uses DB directly) | ~5min | 5 | 20 |
| `crafting-system.spec.ts` | Crafting and syndicate systems | ~5min | Default | Variable |
| `combat-edge-cases.spec.ts` | Combat validation rules (mostly SKIPPED) | ~3min | Default | Variable |
| `quick-diagnostic.spec.ts` | Debug helper for UI issues | ~2min | Default | 5 |

### 1.2 Playwright Configuration Highlights

**File:** `C:\dev\GIT\x-imperium\playwright.config.ts`

- **Parallelism:** `fullyParallel: true` with 2 workers locally, 1 in CI
- **Timeouts:** 90s per test, 10s for assertions, 15s for actions
- **Retries:** 2 in CI (for flaky test detection), 1 locally
- **Trace/Video:** Retained on failure only
- **Global Teardown:** Database cleanup via `deleteAllGamesAction()`
- **Web Server:** Dev server with `DISABLE_LLM_BOTS=true`

### 1.3 Test Fixtures

**File:** `C:\dev\GIT\x-imperium\e2e\fixtures\game.fixture.ts`

Key helpers:
- `ensureGameExists()` - Creates game if needed, handles redirects
- `getEmpireState()` / `getBasicEmpireState()` - Extract state from DOM
- `advanceTurn()` - Click end turn and verify state change
- `skipTutorialViaLocalStorage()` - Suppress tutorial overlays
- `dismissTutorialOverlays()` - Runtime overlay dismissal
- `navigateToGamePage()` - Safe page navigation

---

## 2. Game Features and Test Coverage

### 2.1 Game Pages (from `src/app/game/`)

| Page | data-testid | Test Coverage | Notes |
|------|-------------|---------------|-------|
| `/game` (setup) | `new-game-prompt`, `return-mode-prompt`, `empire-name-input`, `start-game-button` | Good | Covered in smoke + milestone tests |
| `/game/starmap` | `starmap-page`, `back-to-galaxy` | Moderate | Covered but nav sometimes fails |
| `/game/sectors` | `sectors-page`, `sector-summary-{type}` | Moderate | Basic coverage, no colonization tests |
| `/game/military` | `military-page` | Moderate | Navigation tested, no unit building verified |
| `/game/combat` | `combat-page`, `target-{id}`, `attack-type-*`, `force-*` | Good | M4 has detailed tests |
| `/game/research` | `research-page` | Basic | Navigation only |
| `/game/market` | `market-page`, `market-loading` | Moderate | M7 has trading tests |
| `/game/diplomacy` | `diplomacy-page`, `diplomacy-locked`, `diplomacy-loading` | Moderate | M7 covers basic treaty UI |
| `/game/covert` | `covert-page` | Moderate | M6.5 covers UI elements |
| `/game/messages` | `messages-page` | Basic | M8 covers inbox/news tabs |
| `/game/crafting` | `crafting-page`, `crafting-loading` | Basic | Dedicated test file but sparse |
| `/game/syndicate` | `syndicate-page`, `syndicate-locked` | Basic | Dedicated test file but sparse |
| `/game/result` | None visible | Minimal | Only checked for "Continue Playing" |

### 2.2 Coverage Gaps Identified

1. **No tests for actual actions:**
   - Colonizing sectors (buying new sectors)
   - Building military units via queue
   - Completing research allocations
   - Executing actual combat (tests only verify UI)
   - Completing covert operations
   - Accepting/proposing treaties that persist

2. **Victory/Defeat conditions:** Only UI element checks, no actual game completion

3. **Game result page:** No test for actual victory/defeat screen rendering

4. **Protection period logic:** Combat tests have protection period tests but they are SKIPPED

5. **Multi-turn economic flow:** No tests verify credits/food/ore changes over turns

6. **Error states:** Minimal coverage of error handling UI

---

## 3. Issues and Inefficiencies

### 3.1 Test Reliability Issues (Likely Failure Causes)

#### A. Turn Advancement Fragility

The most common failure pattern is turn advancement. Multiple selectors are tried:
```typescript
const endTurnSelectors = [
  '[data-testid="turn-order-end-turn"]',
  '[data-testid="mobile-end-turn"]',
  'button:has-text("NEXT CYCLE")',
  'button:has-text("End Turn")',
];
```

**Problems:**
1. Button text changed from "End Turn" to "NEXT CYCLE"
2. Turn summary modal can block subsequent actions
3. `waitForLoadState("networkidle")` is unreliable with streaming/SSE

**Recent fix (commit 9a02b4a):** "Improve E2E comprehensive test turn advancement reliability" - likely addressed some but not all issues.

#### B. Modal Handling Complexity

Every test must:
1. Dismiss tutorial overlays (`dismissTutorialOverlays()`)
2. Handle turn summary modal (`dismissTurnSummaryModal()`)
3. Wait for overlays to actually close

This creates race conditions when modals appear/disappear during navigation.

#### C. State Synchronization

```typescript
await page.waitForLoadState("networkidle");
```

This doesn't wait for React hydration or state updates. Tests read stale DOM values.

#### D. Selector Inconsistency

Mixed patterns across tests:
- `[data-testid="..."]` (recommended)
- `text=/.../i` (fragile)
- `button:has-text("...")` (fragile)
- `a[href="..."]` (stable)

### 3.2 Test Duplication

- `comprehensive-test.spec.ts` and `quick-diagnostic.spec.ts` overlap significantly
- Turn processing logic is duplicated across 5+ files with slight variations
- `ensureGameReady()` is defined in multiple files instead of shared

### 3.3 Skipped Tests

`combat-edge-cases.spec.ts` has 5 test suites marked as `test.describe.skip()`:
- Protection Period Enforcement
- Influence Sphere Restrictions
- Treaty Violation Prevention
- Invalid Attack Handling
- Combat Execution and State Verification
- Combat UI State Management

These represent ~60% of the combat edge case coverage that is NOT running.

### 3.4 Database Coupling

Some tests (e.g., `tells-5bot-20turn.spec.ts`, `crafting-system.spec.ts`, `bot-scaling-test.spec.ts`) directly query the database:
```typescript
import { db } from "@/lib/db";
```

This:
- Bypasses the UI verification purpose of E2E tests
- Creates test isolation issues
- Requires database to be accessible from test runner

---

## 4. data-testid Attribute Analysis

### 4.1 Current Coverage

Found **197 occurrences across 74 component files** in `src/components/`.

**Well-instrumented components:**
- `MarketPanel.tsx` (11 test IDs)
- `DiplomacyPanel.tsx` (12 test IDs)
- `ProposeTreatyPanel.tsx` (8 test IDs)
- `CompactHeaderStatus.tsx` (8 test IDs)
- `ExpansionOptionsPanel.tsx` (6 test IDs)
- `ResourcePanel.tsx` (6 test IDs)

**Under-instrumented pages:**
- `/game/result` - No test IDs
- Many interactive buttons lack test IDs (relying on text matching)

### 4.2 Missing Critical Test IDs

Based on test failures and inspection:

| Element | Current Selector | Recommended Test ID |
|---------|------------------|---------------------|
| End Turn button | `button:has-text("NEXT CYCLE")` | `data-testid="end-turn-button"` |
| Turn counter value | `[data-testid="turn-counter"]` | Already exists, but value extraction fragile |
| Colonize button | `button:has-text("Colonize")` | `data-testid="colonize-sector-button"` |
| Build unit button | `button:has-text("Build")` | `data-testid="build-unit-button"` |
| Victory screen | None | `data-testid="victory-screen"` |
| Defeat screen | None | `data-testid="defeat-screen"` |

---

## 5. Recommendations

### 5.1 Immediate Fixes (High Priority)

#### A. Standardize Turn Advancement
Create a single, robust `endTurn()` helper:
```typescript
async function endTurn(page: Page): Promise<{ oldTurn: number; newTurn: number }> {
  const oldTurn = await getTurnNumber(page);

  // Use test ID, not text matching
  await page.click('[data-testid="end-turn-button"]');

  // Wait for turn number to actually change (not just network idle)
  await expect(async () => {
    const newTurn = await getTurnNumber(page);
    expect(newTurn).toBe(oldTurn + 1);
  }).toPass({ timeout: 15000 });

  // Handle turn summary modal
  await dismissModal(page, '[data-testid="turn-summary-modal"]');

  return { oldTurn, newTurn: oldTurn + 1 };
}
```

#### B. Add Missing data-testid Attributes
Priority components:
1. EndTurnButton.tsx - `data-testid="end-turn-button"` (standardize)
2. TurnCounter.tsx - `data-testid="turn-value"` for numeric value
3. VictoryScreen.tsx / DefeatScreen.tsx - container IDs
4. All action buttons (Colonize, Build, Trade, Propose Treaty)

#### C. Unskip Combat Edge Cases
Enable the SKIPPED test suites in `combat-edge-cases.spec.ts` or document why they remain skipped:
- Protection Period Enforcement
- Treaty Violation Prevention
- Combat Execution

### 5.2 Short-Term Improvements (Medium Priority)

#### A. Consolidate Test Helpers
Move all shared functions to `fixtures/game.fixture.ts`:
- `ensureGameReady()`
- `endTurnReliably()`
- `getCurrentTurn()`
- `dismissTurnSummaryModal()`
- `navigateTo()`

Current duplication across 4+ files creates maintenance burden.

#### B. Add Functional Action Tests
Create tests that verify actions actually work:

```typescript
test("can colonize a new sector", async ({ gamePage }) => {
  await ensureGameExists(gamePage);
  const before = await getEmpireState(gamePage);

  await gamePage.goto("/game/sectors");
  await gamePage.click('[data-testid="colonize-tab"]');
  await gamePage.click('[data-testid="colonize-food-sector"]');

  const after = await getEmpireState(gamePage);
  expect(after.sectorCount).toBe(before.sectorCount + 1);
  expect(after.credits).toBeLessThan(before.credits);
});
```

#### C. Remove Database Coupling
Replace direct DB queries with UI assertions:
```typescript
// BAD:
const trust = await db.query.syndicateTrust.findFirst({...});

// GOOD:
await expect(page.locator('[data-testid="trust-level"]')).toContainText("Level 1");
```

### 5.3 Long-Term Strategy (Lower Priority)

#### A. Implement Headless Simulation Tests
Following the pattern in `e2e/full-game-testing.md`, create in-memory game simulations for:
- Bot balance testing
- Victory condition verification
- Long-game stability (50+ turns)

These don't need a browser and can run in parallel.

#### B. Page Object Model
Refactor tests to use page objects:
```typescript
class SectorsPage {
  constructor(private page: Page) {}

  async colonize(type: SectorType) {
    await this.page.click('[data-testid="colonize-tab"]');
    await this.page.click(`[data-testid="colonize-${type}-sector"]`);
  }

  async getSectorCount(): Promise<number> {
    const text = await this.page.locator('[data-testid="total-sectors"]').textContent();
    return parseInt(text ?? '0', 10);
  }
}
```

#### C. Visual Regression Testing
Add Percy or Playwright screenshot comparison for:
- Victory screen rendering
- Combat report display
- Starmap visualization

---

## 6. Test Execution Efficiency

### 6.1 Current Performance

| Suite | Duration | Parallelization |
|-------|----------|-----------------|
| Full E2E suite | ~20-30 min | Limited (1-2 workers) |
| Smoke test | ~30-60s | Single |
| Per-test average | ~60-90s | - |

### 6.2 Bottlenecks

1. **Game creation:** Each test creates a new game (~5-10s)
2. **Turn processing:** Bot AI execution adds latency
3. **Network waits:** `waitForLoadState("networkidle")` over-waits

### 6.3 Optimization Opportunities

1. **Shared game state for read-only tests:** Use a single game for navigation tests
2. **Reduce bot count in non-scaling tests:** Use 5 bots instead of 10 for faster turns
3. **Replace `networkidle` with explicit waits:**
   ```typescript
   await expect(page.locator('[data-testid="turn-value"]')).toHaveText(/\d+/);
   ```
4. **Parallel test groups:** Separate tests that need fresh games from those that don't

---

## 7. Summary of Key Findings

### Critical Issues
1. Turn advancement is fragile due to modal handling and selector inconsistency
2. ~60% of combat edge case tests are SKIPPED
3. No tests verify actual action completion (only UI element presence)

### Coverage Gaps
1. Sector colonization action
2. Unit building action
3. Combat execution (only UI tested)
4. Victory/defeat flow
5. Multi-turn economic verification

### Positive Aspects
1. Good Playwright configuration with traces/retries
2. Database cleanup prevents test pollution
3. Tutorial dismissal is well-handled
4. Navigation tests are comprehensive
5. 197 data-testid attributes across 74 components

### Recommended Priority Order
1. Fix turn advancement reliability (blocks all multi-turn tests)
2. Add missing data-testid attributes for action buttons
3. Unskip and fix combat edge case tests
4. Add functional action tests (colonize, build, trade)
5. Consolidate duplicated test helpers
6. Implement headless game simulations for balance testing

---

## Appendix: Test File Quick Reference

```
e2e/
  fixtures/
    game.fixture.ts          # Shared helpers and custom test context
  templates/
    functional-test.template.ts  # Template for new tests
  screenshots/               # Diagnostic screenshots
  smoke-test.spec.ts         # CI validation
  milestone-core.spec.ts     # M1-M4 features
  milestone-advanced.spec.ts # M5-M8 features
  comprehensive-test.spec.ts # Full gameplay rotation
  bot-scaling-test.spec.ts   # Performance testing
  tells-5bot-20turn.spec.ts  # Tell system (uses DB)
  crafting-system.spec.ts    # Crafting/syndicate
  combat-edge-cases.spec.ts  # Combat rules (mostly SKIPPED)
  quick-diagnostic.spec.ts   # Debug helper
  global-teardown.ts         # Database cleanup
  flaky-tests.json           # Flaky test tracking
  README.md                  # Usage documentation
```
