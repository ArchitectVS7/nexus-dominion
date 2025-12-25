import { test, expect } from "./fixtures/game.fixture";
import type { Page } from "@playwright/test";

test.describe("Milestone 3: Planet, Units & Research", () => {
  // Helper to ensure a game exists before testing
  async function ensureGameExists(page: Page) {
    const nameInput = page.locator('[data-testid="empire-name-input"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill("M3 Test Empire");
      await page.locator('[data-testid="start-game-button"]').click();
      await page.waitForLoadState("networkidle");
    }
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({
      timeout: 10000,
    });
  }

  test.describe("Research System", () => {
    test("can navigate to research page", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      // Click on research link in navigation
      await gamePage.click('a[href="/game/research"]');
      await gamePage.waitForLoadState("networkidle");

      // Should show research page heading
      await expect(gamePage.locator("h1")).toContainText("Research");
    });

    test("research panel loads without getting stuck", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      // Navigate to research
      await gamePage.click('a[href="/game/research"]');
      await gamePage.waitForLoadState("networkidle");

      // Wait for research panel - should NOT stay at "Loading..."
      const researchPanel = gamePage.locator('[data-testid="research-panel"]');
      await expect(researchPanel).toBeVisible({ timeout: 10000 });

      // Should show either research data OR an error - NOT stuck at loading
      // Wait for loading to complete
      await gamePage.waitForTimeout(2000);

      // Check that "Loading..." is not the final state
      const panelText = await researchPanel.textContent();
      expect(panelText).not.toBe("Fundamental ResearchLoading...");

      // Should show level indicator (Level 0 for new game)
      await expect(researchPanel).toContainText(/Level \d/);
    });

    test("research progress component loads correctly", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/research"]');
      await gamePage.waitForLoadState("networkidle");

      // Wait for research progress
      const researchProgress = gamePage.locator('[data-testid="research-progress"]');
      await expect(researchProgress).toBeVisible({ timeout: 10000 });

      // Wait for loading to complete
      await gamePage.waitForTimeout(2000);

      // Should not be stuck at loading
      const progressText = await researchProgress.textContent();
      expect(progressText).not.toBe("Loading...");
    });

    test("research info shows correct data for new game", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/research"]');
      await gamePage.waitForLoadState("networkidle");

      const researchPanel = gamePage.locator('[data-testid="research-panel"]');
      await expect(researchPanel).toBeVisible({ timeout: 10000 });

      // Should show level 0 for new game
      await expect(researchPanel).toContainText("Level 0");

      // Should show research planets count (1 for starting setup)
      await expect(researchPanel).toContainText("Research Planets");

      // Should show points per turn indicator
      await expect(researchPanel).toContainText("Points/Turn");
    });

    test("research system info panel displays correctly", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/research"]');
      await gamePage.waitForLoadState("networkidle");

      // The static info panel should always render
      await expect(gamePage.locator("text=Research System")).toBeVisible();
      await expect(gamePage.locator("text=Research Planets")).toBeVisible();
      await expect(gamePage.locator("text=100 RP")).toBeVisible();
      await expect(gamePage.locator("text=Light Cruisers")).toBeVisible();
    });

    test("shows error message instead of infinite loading on error", async ({ gamePage }) => {
      // This test verifies that errors are displayed properly, not just loading forever
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/research"]');
      await gamePage.waitForLoadState("networkidle");

      const researchPanel = gamePage.locator('[data-testid="research-panel"]');
      await expect(researchPanel).toBeVisible({ timeout: 10000 });

      // Wait for data to load
      await gamePage.waitForTimeout(3000);

      // Panel should have resolved to either data or error, not loading
      const isLoading = await researchPanel.locator("text=Loading...").isVisible();

      if (isLoading) {
        // If still loading after 3s, there's a bug
        throw new Error("Research panel stuck at Loading... - this indicates unhandled async error");
      }
    });
  });

  test.describe("Military System", () => {
    test("can navigate to military page", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/military"]');
      await gamePage.waitForLoadState("networkidle");

      await expect(gamePage.locator("h1")).toContainText("Military");
    });

    test("military page shows unit list", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/military"]');
      await gamePage.waitForLoadState("networkidle");

      // Should show soldier count (100 starting)
      await expect(gamePage.locator("text=Soldiers")).toBeVisible();
    });
  });

  test.describe("Planets System", () => {
    test("planets page loads correctly", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/planets"]');
      await gamePage.waitForLoadState("networkidle");

      await expect(gamePage.locator('[data-testid="planets-page"]')).toBeVisible({
        timeout: 10000,
      });

      // Should show 9 planet cards
      const planetCards = gamePage.locator('[data-testid^="planet-card-"]');
      await expect(planetCards).toHaveCount(9);
    });

    test("research planet exists in starting planets", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      await gamePage.click('a[href="/game/planets"]');
      await gamePage.waitForLoadState("networkidle");

      // Should have at least one research planet - use specific data-testid
      await expect(gamePage.locator('[data-testid="planet-type-research"]')).toBeVisible();
    });
  });

  test.describe("Dashboard Integration", () => {
    test("dashboard shows research level", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      // Should show research level on dashboard
      const dashboard = gamePage.locator('[data-testid="dashboard"]');
      await expect(dashboard).toBeVisible();

      // Check for research-related content - use the research points display
      await expect(gamePage.locator('[data-testid="research-points"]')).toBeVisible();
    });
  });

  test.describe("Navigation Flow", () => {
    test("can navigate between all main pages", async ({ gamePage }) => {
      await ensureGameExists(gamePage);

      // Test navigation to each page
      const pages = [
        { href: "/game/planets", title: "Planets" },
        { href: "/game/military", title: "Military" },
        { href: "/game/research", title: "Research" },
        { href: "/game", title: "" }, // Dashboard
      ];

      for (const pageInfo of pages) {
        await gamePage.click(`a[href="${pageInfo.href}"]`);
        await gamePage.waitForLoadState("networkidle");

        if (pageInfo.title) {
          await expect(gamePage.locator("h1")).toContainText(pageInfo.title, { timeout: 5000 });
        } else {
          await expect(gamePage.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });
});
