import { FullConfig } from "@playwright/test";

/**
 * Global teardown for E2E tests
 * Cleans up test data after all tests complete
 */
async function globalTeardown(_config: FullConfig): Promise<void> {
  // In production, this would call an admin endpoint to clear test games
  // For now, just log completion
  console.log("\n[E2E Teardown] All tests complete");

  // Optionally call admin cleanup endpoint if configured
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    try {
      const response = await fetch("http://localhost:3000/api/admin/clear-games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": adminSecret,
        },
        body: JSON.stringify({ testGamesOnly: true }),
      });

      if (response.ok) {
        console.log("[E2E Teardown] Test games cleared successfully");
      }
    } catch {
      // Server might not be running anymore, that's fine
      console.log("[E2E Teardown] Skipped cleanup (server not available)");
    }
  }
}

export default globalTeardown;
