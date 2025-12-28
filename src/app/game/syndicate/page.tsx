"use client";

/**
 * Syndicate Page (M9)
 *
 * Full Syndicate/Black Market interface with:
 * - Trust meter showing reputation levels
 * - Contract board for missions
 * - Black Market catalog for purchasing components
 * - Coordinator betrayal option
 *
 * @see docs/frontend/frontend-developer-manual.md for patterns
 */

import { useState, useEffect } from "react";
import { BlackMarketPanel } from "@/components/game/syndicate/BlackMarketPanel";
import { fetchDashboardDataAction } from "@/app/actions/game-actions";

export default function SyndicatePage() {
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
      <div className="max-w-6xl mx-auto" data-testid="syndicate-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          The Syndicate
        </h1>
        <div className="lcars-panel animate-pulse h-96" />
      </div>
    );
  }

  if (!hasGame) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="syndicate-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          The Syndicate
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
    <div className="max-w-6xl mx-auto" data-testid="syndicate-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        The Syndicate
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Syndicate Panel */}
        <div className="lg:col-span-2">
          <BlackMarketPanel refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 lcars-panel border-l-lcars-purple">
        <h2 className="text-lg font-semibold text-lcars-purple mb-4">
          About the Syndicate
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <span className="text-purple-400">The Galactic Syndicate</span> is an
            underground network operating beyond Coordinator oversight.
          </p>
          <p>
            <span className="text-cyan-400">Trust Levels</span> determine your access
            to contracts and Black Market items. Complete contracts to increase trust.
          </p>
          <p>
            <span className="text-lcars-amber">Contracts</span> offer lucrative rewards
            but may require morally questionable actions.
          </p>
          <p>
            <span className="text-red-400">Warning:</span> Betraying the Syndicate to
            the Coordinator grants a one-time bonus but makes them permanently hostile.
          </p>
        </div>
      </div>
    </div>
  );
}
