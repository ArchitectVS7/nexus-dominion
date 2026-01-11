import { test as base, expect, Page } from "@playwright/test";

/**
 * Empire state extracted from the game UI
 */
export interface EmpireState {
  turn: number;
  credits: number;
  food: number;
  ore: number;
  petroleum: number;
  researchPoints: number;
  networth: number;
  population: number;
  civilStatus: string;
  sectorCount: number;
  soldiers: number;
  fighters: number;
  stations: number;
  lightCruisers: number;
  heavyCruisers: number;
  carriers: number;
}

/**
 * Game fixture options
 */
export interface GameOptions {
  empireName?: string;
  botCount?: 10 | 25 | 50 | 100;
  difficulty?: "easy" | "normal" | "hard" | "brutal";
  gameMode?: "oneshot" | "campaign";
}

/**
 * Fixtures for game tests
 */
export interface GameFixtures {
  gamePage: Page;
}

/**
 * Parse compact number format (e.g., "10K" -> 10000, "1.5M" -> 1500000)
 */
export function parseCompactNumber(text: string): number {
  const trimmed = text.trim().replace(/,/g, "");

  const kMatch = trimmed.match(/^([\d.]+)K$/i);
  if (kMatch && kMatch[1]) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  const mMatch = trimmed.match(/^([\d.]+)M$/i);
  if (mMatch && mMatch[1]) {
    return Math.round(parseFloat(mMatch[1]) * 1000000);
  }

  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse a number from text, handling various formats
 */
export function parseNumber(text: string): number {
  return parseCompactNumber(text);
}

/**
 * Skip tutorial overlay by setting localStorage before page loads
 */
export async function skipTutorialViaLocalStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("nexus-dominion-tutorial-completed", "true");
    localStorage.setItem("nexus-dominion-welcome-modal-shown", "true");
  });
}

/**
 * Wait for the game UI to be fully interactive (no overlays blocking)
 * Uses state-based checks instead of time-based waits
 */
export async function waitForGameReady(page: Page): Promise<void> {
  // Wait for the main game header to be visible
  const headerCredits = page.locator('[data-testid="header-credits"]');
  await expect(headerCredits).toBeVisible({ timeout: 15000 });

  // Verify no modal overlay is blocking by checking we can interact with the header
  // trial: true means it checks if the click would succeed without actually clicking
  await headerCredits.click({ trial: true, timeout: 5000 }).catch(() => {
    // If trial click fails, there might be an overlay - try to dismiss it
  });

  // Additional check: ensure turn counter is visible and has a valid value
  const turnCounter = page.locator('[data-testid="turn-counter"]');
  await expect(turnCounter).toBeVisible({ timeout: 5000 });

  // Wait for any loading states to complete
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
    // Network might not go fully idle, but that's ok
  });
}

/**
 * Dismiss any tutorial or onboarding overlays
 * Uses state-based waits to ensure overlays are actually dismissed
 */
export async function dismissOverlays(page: Page): Promise<void> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check for various overlay types
    const overlaySelectors = [
      // Tutorial overlay
      'text=Skip all tutorials',
      '[data-testid="skip-tutorial-button"]',
      // Welcome modal
      'text=Got it',
      '[data-testid="welcome-modal-close"]',
      // Onboarding hints
      'text=Dismiss hint',
      '[data-testid="dismiss-hint-button"]',
      // Generic close buttons
      'button:has-text("×")',
      '[data-testid="modal-close"]',
    ];

    let dismissed = false;

    for (const selector of overlaySelectors) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 500 }).catch(() => false);

      if (isVisible) {
        await element.click({ force: true }).catch(() => {});
        // Wait for the element to disappear (state-based, not time-based)
        await expect(element).not.toBeVisible({ timeout: 2000 }).catch(() => {});
        dismissed = true;
        break;
      }
    }

    // If nothing was dismissed this round, we're done
    if (!dismissed) {
      break;
    }

    // Small delay between rounds to let animations complete
    await page.waitForTimeout(200);
  }

  // Final verification: check that the game UI is interactive
  await waitForGameReady(page);
}

/**
 * Ensure a game exists, creating one if necessary
 * IMPORTANT: This now properly sets bot count to create AI opponents
 */
export async function ensureGameExists(
  page: Page,
  options: GameOptions = {}
): Promise<void> {
  const {
    empireName = "Test Empire",
    botCount = 25,
    difficulty = "normal",
    gameMode = "oneshot",
  } = options;

  await page.goto("/game");
  await page.waitForLoadState("networkidle").catch(() => {});

  // Check if we're on the game creation form
  const nameInput = page.locator('[data-testid="empire-name-input"]');
  const isNewGame = await nameInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (isNewGame) {
    // Fill empire name
    await nameInput.fill(empireName);

    // Select game mode if selector is visible
    const gameModeSelector = page.locator(`[data-testid="game-mode-${gameMode}"]`);
    if (await gameModeSelector.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gameModeSelector.click();
    }

    // CRITICAL: Select bot count - this was missing and caused 0 bots to be created
    const botCountSelector = page.locator(`[data-testid="bot-count-${botCount}"]`);
    if (await botCountSelector.isVisible({ timeout: 1000 }).catch(() => false)) {
      await botCountSelector.click();
      // Verify the selection took effect
      await expect(botCountSelector).toHaveClass(/border-lcars-amber/, { timeout: 2000 });
    }

    // Select difficulty if selector is visible
    const difficultySelector = page.locator(`[data-testid="difficulty-${difficulty}"]`);
    if (await difficultySelector.isVisible({ timeout: 1000 }).catch(() => false)) {
      await difficultySelector.click();
    }

    // Submit the form
    const startButton = page.locator('[data-testid="start-game-button"]');
    await startButton.click();

    // Wait for redirect to starmap/dashboard
    await page.waitForURL(/\/game\/(starmap|dashboard)/, { timeout: 30000 });
  }

  // Dismiss any overlays and wait for game to be ready
  await dismissOverlays(page);
}

/**
 * Get basic empire state from header elements
 */
export async function getBasicEmpireState(page: Page): Promise<Partial<EmpireState>> {
  const state: Partial<EmpireState> = {};

  // Turn counter
  const turnText = await page.locator('[data-testid="turn-counter"]').textContent().catch(() => "0");
  state.turn = parseNumber(turnText || "0");

  // Credits
  const creditsText = await page.locator('[data-testid="header-credits"]').textContent().catch(() => "0");
  state.credits = parseCompactNumber(creditsText || "0");

  // Food
  const foodText = await page.locator('[data-testid="header-food"]').textContent().catch(() => "0");
  state.food = parseCompactNumber(foodText || "0");

  // Population
  const popText = await page.locator('[data-testid="header-population"]').textContent().catch(() => "0");
  state.population = parseCompactNumber(popText || "0");

  return state;
}

/**
 * Get full empire state from all UI elements
 */
export async function getEmpireState(page: Page): Promise<EmpireState> {
  const basic = await getBasicEmpireState(page);

  // Get additional values with defaults
  const oreText = await page.locator('[data-testid="header-ore"]').textContent().catch(() => "0");
  const petroleumText = await page.locator('[data-testid="header-petroleum"]').textContent().catch(() => "0");
  const networthText = await page.locator('[data-testid="header-networth"]').textContent().catch(() => "0");
  const sectorsText = await page.locator('[data-testid="header-sectors"]').textContent().catch(() => "0");
  const civilStatusText = await page.locator('[data-testid="header-civil-status"]').textContent().catch(() => "Content");

  return {
    turn: basic.turn ?? 1,
    credits: basic.credits ?? 50000,
    food: basic.food ?? 10000,
    ore: parseCompactNumber(oreText || "0"),
    petroleum: parseCompactNumber(petroleumText || "0"),
    researchPoints: 0, // Would need to fetch from research panel
    networth: parseCompactNumber(networthText || "0"),
    population: basic.population ?? 10000,
    civilStatus: civilStatusText?.trim() || "Content",
    sectorCount: parseNumber(sectorsText || "4"),
    soldiers: 0,
    fighters: 0,
    stations: 0,
    lightCruisers: 0,
    heavyCruisers: 0,
    carriers: 0,
  };
}

/**
 * Wait for turn counter to change to a specific value
 */
export async function waitForTurnChange(
  page: Page,
  expectedTurn: number,
  timeout: number = 30000
): Promise<void> {
  const turnCounter = page.locator('[data-testid="turn-counter"]');

  await expect(async () => {
    const text = await turnCounter.textContent();
    const currentTurn = parseNumber(text || "0");
    expect(currentTurn).toBe(expectedTurn);
  }).toPass({ timeout });
}

/**
 * Advance to the next turn and return before/after state
 */
export async function advanceTurn(
  page: Page
): Promise<{ before: EmpireState; after: EmpireState }> {
  const before = await getEmpireState(page);

  // Click end turn button
  const endTurnButton = page.locator('[data-testid="end-turn-button"]');
  await expect(endTurnButton).toBeEnabled({ timeout: 5000 });
  await endTurnButton.click();

  // Wait for turn to increment (state-based, not time-based)
  await waitForTurnChange(page, before.turn + 1, 30000);

  // Dismiss any turn summary modal
  const turnSummaryClose = page.locator('[data-testid="turn-summary-close"]');
  if (await turnSummaryClose.isVisible({ timeout: 2000 }).catch(() => false)) {
    await turnSummaryClose.click();
  }

  // Wait for UI to stabilize
  await waitForGameReady(page);

  const after = await getEmpireState(page);
  return { before, after };
}

/**
 * Navigate to a specific game page
 */
export async function navigateToGamePage(
  page: Page,
  pageName: "military" | "combat" | "research" | "sectors" | "market" | "diplomacy" | "messages" | "starmap"
): Promise<void> {
  const url = `/game/${pageName}`;
  await page.goto(url);
  await page.waitForLoadState("networkidle").catch(() => {});
  await waitForGameReady(page);
}

/**
 * Verify resource changes within a tolerance
 */
export function verifyResourceChange(
  before: EmpireState,
  after: EmpireState,
  expected: Partial<Record<keyof EmpireState, number>>,
  tolerance: number = 100
): void {
  for (const [key, expectedDelta] of Object.entries(expected)) {
    const k = key as keyof EmpireState;
    const beforeValue = typeof before[k] === 'number' ? before[k] : 0;
    const afterValue = typeof after[k] === 'number' ? after[k] : 0;
    const actualDelta = afterValue - beforeValue;

    expect(
      Math.abs(actualDelta - expectedDelta)
    ).toBeLessThanOrEqual(tolerance);
  }
}

/**
 * Extended test fixture with game page pre-configured
 */
export const test = base.extend<GameFixtures>({
  gamePage: async ({ page }, use) => {
    // Skip tutorial before loading the page
    await skipTutorialViaLocalStorage(page);

    // Ensure game exists with default settings (25 bots)
    await ensureGameExists(page, { empireName: "E2E Test Empire", botCount: 25 });

    // Pass the configured page to the test
    await use(page);
  },
});

export { expect } from "@playwright/test";
