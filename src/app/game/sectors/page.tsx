"use client";

/**
 * Sectors Page
 *
 * Displays owned sectors and colonization options.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";
import { getSectorTypeLabel } from "@/lib/game/constants";
import type { Sector } from "@/lib/db/schema";

export default function SectorsPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="sectors-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Sectors</h1>
        <div className="animate-pulse">
          <div className="lcars-panel h-32 bg-gray-800/50 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="lcars-panel h-24 bg-gray-800/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="sectors-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Sectors</h1>
        <div className="lcars-panel">
          <p className="text-red-400">Failed to load sector data</p>
        </div>
      </div>
    );
  }

  // Group sectors by type
  const sectorsByType = data.sectors.reduce<Record<string, Sector[]>>(
    (acc, sector) => {
      const existing = acc[sector.type];
      if (existing) {
        existing.push(sector);
      } else {
        acc[sector.type] = [sector];
      }
      return acc;
    },
    {}
  );

  // Sort types by count (descending)
  const sortedTypes = Object.entries(sectorsByType).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div className="max-w-6xl mx-auto" data-testid="sectors-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Sectors</h1>

      {/* Summary Section */}
      <div className="lcars-panel mb-6">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Empire Holdings ({data.sectors.length} sectors)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedTypes.map(([type, sectors]) => {
            const label = getSectorTypeLabel(
              type as Parameters<typeof getSectorTypeLabel>[0]
            );
            return (
              <div
                key={type}
                className="text-center p-3 bg-gray-800/50 rounded"
              >
                <div className="text-lcars-amber font-mono text-2xl">
                  {sectors.length}
                </div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Colonize Section */}
      <div className="lcars-panel mb-6">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Colonize New Sector
        </h2>
        <p className="text-gray-400 mb-4">
          Credits available:{" "}
          <span className="text-lcars-amber font-mono">
            {data.resources.credits.toLocaleString()}
          </span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(["urban", "agriculture", "mining", "research", "military"] as const).map(
            (type) => {
              const cost = getColonizationCost(type, data.sectors.length);
              const canAfford = data.resources.credits >= cost;
              return (
                <button
                  key={type}
                  disabled={!canAfford}
                  className={`p-3 rounded border ${
                    canAfford
                      ? "bg-gray-800 hover:bg-gray-700 border-gray-600"
                      : "bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="capitalize font-medium">{type}</div>
                  <div className="text-xs text-gray-400">
                    {cost.toLocaleString()} credits
                  </div>
                </button>
              );
            }
          )}
        </div>
        <p className="text-gray-500 text-sm mt-4">
          Colonization execution will be implemented in Phase 3
        </p>
      </div>

      {/* Sector Details */}
      <div className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Your Sectors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.sectors.map((sector) => (
            <div
              key={sector.id}
              className="p-4 bg-gray-800/50 rounded border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lcars-amber capitalize font-medium">
                    {sector.type}
                  </div>
                  <div className="text-xs text-gray-500">
                    Acquired turn {sector.acquiredAtTurn}
                  </div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-900/30 rounded">
                  Release
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getColonizationCost(type: string, currentSectors: number): number {
  const baseCost: Record<string, number> = {
    urban: 5000,
    agriculture: 3000,
    mining: 4000,
    research: 6000,
    military: 7000,
  };
  const base = baseCost[type] ?? 5000;
  // Cost increases with number of sectors
  return Math.floor(base * (1 + currentSectors * 0.1));
}
