"use client";

/**
 * Crafting Panel
 *
 * Manufacturing interface for crafting special items and upgrades.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export function CraftingPanel() {
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
        <p className="text-red-400">Failed to load crafting data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resources */}
      <section className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Available Resources
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-800/50 rounded text-center">
            <div className="text-xs text-gray-500">Ore</div>
            <div className="font-mono text-blue-400">
              {data.resources.ore.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded text-center">
            <div className="text-xs text-gray-500">Petroleum</div>
            <div className="font-mono text-cyan-400">
              {data.resources.petroleum.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded text-center">
            <div className="text-xs text-gray-500">Credits</div>
            <div className="font-mono text-yellow-400">
              {data.resources.credits.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded text-center">
            <div className="text-xs text-gray-500">Research</div>
            <div className="font-mono text-purple-400">
              {data.resources.researchPoints.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Available Recipes
        </h2>
        <p className="text-gray-500 text-sm">
          Crafting system coming in Phase 3. Check back soon!
        </p>
      </section>

      {/* Queue */}
      <section className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Crafting Queue
        </h2>
        <p className="text-gray-500 text-sm">No items in queue</p>
      </section>
    </div>
  );
}

export default CraftingPanel;
