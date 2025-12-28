"use client";

/**
 * Crafting Page (M9)
 *
 * Full crafting interface with:
 * - Recipe browser with research requirements
 * - Tiered resource inventory display
 * - Crafting queue management
 *
 * @see docs/frontend/frontend-developer-manual.md for patterns
 */

import { useState, useEffect } from "react";
import { CraftingPanel } from "@/components/game/crafting/CraftingPanel";
import { fetchDashboardDataAction } from "@/app/actions/game-actions";

export default function CraftingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasGame, setHasGame] = useState(false);
  const [refreshTrigger] = useState(0);

  useEffect(() => {
    async function checkGame() {
      const data = await fetchDashboardDataAction();
      setHasGame(!!data);
      setIsLoading(false);
    }
    checkGame();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="crafting-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Manufacturing
        </h1>
        <div className="lcars-panel animate-pulse h-96" />
      </div>
    );
  }

  if (!hasGame) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="crafting-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Manufacturing
        </h1>
        <div className="lcars-panel">
          <p className="text-gray-400">
            No active game session. Please start a new game from the Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="crafting-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        Manufacturing
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Crafting Panel */}
        <div className="lg:col-span-2">
          <CraftingPanel refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 lcars-panel border-l-lcars-purple">
        <h2 className="text-lg font-semibold text-lcars-purple mb-4">
          Manufacturing System
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <span className="text-cyan-400">Tier 1 Components</span> are crafted from{" "}
            <span className="text-white">Tier 0</span> resources (Ore, Petroleum, Food).
          </p>
          <p>
            <span className="text-cyan-400">Tier 2 Components</span> require{" "}
            <span className="text-white">Tier 1</span> components and higher research.
          </p>
          <p>
            <span className="text-cyan-400">Tier 3 Systems</span> combine{" "}
            <span className="text-white">Tier 2</span> components into powerful upgrades.
          </p>
          <p className="mt-3 text-gray-500">
            Higher research levels unlock more advanced recipes. Check the Research page
            to advance your manufacturing capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
