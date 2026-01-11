"use client";

/**
 * Black Market Panel
 *
 * Syndicate interface for illicit trades and contracts.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export function BlackMarketPanel() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-800 rounded mb-4" />
        <div className="h-48 bg-gray-800 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="lcars-panel">
        <p className="text-red-400">Failed to load syndicate data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Syndicate Status */}
      <section className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Syndicate Standing
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono text-purple-400">Neutral</div>
          <div className="text-gray-500 text-sm">
            Complete contracts to increase trust
          </div>
        </div>
      </section>

      {/* Available Contracts */}
      <section className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Available Contracts
        </h2>
        <p className="text-gray-500 text-sm">
          Syndicate contracts coming in Phase 3. Check back soon!
        </p>
      </section>

      {/* Black Market */}
      <section className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Black Market
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <div className="text-purple-400 font-medium">Intelligence Report</div>
            <div className="text-sm text-gray-500 mt-1">
              Reveals enemy military strength
            </div>
            <div className="text-yellow-400 text-sm mt-2">5,000 credits</div>
            <button
              disabled
              className="mt-3 w-full py-2 bg-purple-900/50 text-purple-400 rounded opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <div className="text-purple-400 font-medium">Mercenary Squad</div>
            <div className="text-sm text-gray-500 mt-1">
              Hire temporary soldiers
            </div>
            <div className="text-yellow-400 text-sm mt-2">10,000 credits</div>
            <button
              disabled
              className="mt-3 w-full py-2 bg-purple-900/50 text-purple-400 rounded opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlackMarketPanel;
