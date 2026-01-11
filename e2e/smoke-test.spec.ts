import { test, expect, ensureGameExists, getEmpireState, advanceTurn } from "./fixtures/game.fixture";

/**
 * Smoke tests - Quick validation that core functionality works
 * These tests run in the "fast" project for rapid feedback
 */

test.describe("Game Creation", () => {
  test("can create a new game with bots", async ({ page }) => {
    // Ensure game exists with 25 bots
    await ensureGameExists(page, { empireName: "Smoke Test Empire", botCount: 25 });

    // Verify we're on a game page
    await expect(page).toHaveURL(/\/game\/(starmap|dashboard)/);

    // Verify header elements are visible
    await expect(page.locator('[data-testid="header-credits"]')).toBeVisible();
    await expect(page.locator('[data-testid="turn-counter"]')).toBeVisible();
  });

  test("game starts with correct initial state", async ({ gamePage }) => {
    const state = await getEmpireState(gamePage);

    // Verify initial turn
    expect(state.turn).toBe(1);

    // Verify starting resources (based on game constants)
    expect(state.credits).toBeGreaterThanOrEqual(40000); // ~50000 starting
    expect(state.population).toBeGreaterThanOrEqual(8000); // ~10000 starting
  });
});

test.describe("Turn Processing", () => {
  test("can advance turn", async ({ gamePage }) => {
    const { before, after } = await advanceTurn(gamePage);

    // Turn should increment
    expect(after.turn).toBe(before.turn + 1);
  });

  test("resources update after turn", async ({ gamePage }) => {
    const { before, after } = await advanceTurn(gamePage);

    // Credits should change (income - expenses)
    // We can't predict exact value but it should be different
    expect(after.credits).not.toBe(before.credits);
  });
});

test.describe("Navigation", () => {
  test("can navigate to military page", async ({ gamePage }) => {
    await gamePage.goto("/game/military");
    await gamePage.waitForLoadState("networkidle").catch(() => {});

    await expect(gamePage).toHaveURL(/\/game\/military/);
  });

  test("can navigate to research page", async ({ gamePage }) => {
    await gamePage.goto("/game/research");
    await gamePage.waitForLoadState("networkidle").catch(() => {});

    await expect(gamePage).toHaveURL(/\/game\/research/);
  });
});
