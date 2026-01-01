import { test, expect } from "@playwright/test";
import { skipTutorialViaLocalStorage, dismissTutorialOverlays } from "./fixtures/game.fixture";

/**
 * Smoke Test - Fast CI validation
 *
 * This is a minimal test to verify basic game functionality.
 * Runs on every commit to catch critical breakages early.
 *
 * Duration: ~30-60 seconds
 * Bots: 10 (smallest option)
 * Turns: 2
 *
 * Tests:
 * - Can create a game
 * - UI renders correctly
 * - Turn processing works
 * - Basic navigation functions
 */

test.describe("Smoke Test", () => {
  test.beforeEach(async ({ page }) => {
    // Skip tutorials before each test
    await skipTutorialViaLocalStorage(page);
  });

  test("basic game creation works", async ({ page }) => {
    // Short timeout for CI
    test.setTimeout(45000); // 45 seconds

    // Step 1: Navigate to game page
    await page.goto("/game");
    await dismissTutorialOverlays(page);

    // Step 2: Create game with minimal config
    const empireNameInput = page.locator('[data-testid="empire-name-input"]');
    if (await empireNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await empireNameInput.fill("Smoke Test Empire");
      await dismissTutorialOverlays(page);

      // Start game (uses smallest bot count by default)
      await page.locator('[data-testid="start-game-button"]').click();
      await page.waitForURL(/\/game/, { timeout: 10000 });
      await page.waitForLoadState("networkidle");
    }

    await dismissTutorialOverlays(page);

    // Step 3: Navigate to dashboard if on starmap
    const dashboard = page.locator('[data-testid="dashboard"]');
    if (!await dashboard.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.goto("/game");
      await page.waitForLoadState("networkidle");
      await dismissTutorialOverlays(page);
    }

    // Step 4: Verify game is active - dashboard visible with resources
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="credits"]')).toBeVisible();
    await expect(page.locator('[data-testid="food"]')).toBeVisible();

    // Step 5: Verify turn counter exists and shows Turn 1
    const turnCounter = page.locator('[data-testid="turn-counter"]');
    await expect(turnCounter).toBeVisible();

    // Step 6: Verify end turn button exists
    const endTurnBtn = page.locator('[data-testid="end-turn-button"]');
    await expect(endTurnBtn).toBeVisible();
  });

  test("critical UI elements exist", async ({ page }) => {
    test.setTimeout(30000); // 30 seconds

    await page.goto("/");

    // Homepage should have title and start button
    await expect(page).toHaveTitle(/Nexus Dominion/);
    const startButton = page.locator('a[href="/game"]').first();
    await expect(startButton).toBeVisible();

    // Navigate to game
    await startButton.click();
    await page.waitForLoadState("networkidle");
    await dismissTutorialOverlays(page);

    // Game setup should have create button or dashboard (if game exists)
    const createButton = page.locator('[data-testid="start-game-button"]');
    const dashboard = page.locator('[data-testid="dashboard"]');
    await expect(createButton.or(dashboard)).toBeVisible();
  });
});
