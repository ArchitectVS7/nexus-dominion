"use client";

/**
 * Starmap Page
 *
 * Displays the galaxy view with empire positions.
 * Uses React Query for data and Zustand for panel state.
 */

import { useRouter } from "next/navigation";
import { useGalaxyView, useHasActiveGame } from "@/lib/api";
import { usePanelStore } from "@/stores";
import { useEffect } from "react";

export default function StarmapPage() {
  const router = useRouter();
  const { openPanel } = usePanelStore();
  const { data: hasGame, isLoading: checkingGame } = useHasActiveGame();
  const { data, isLoading, error } = useGalaxyView();

  // Redirect if no active game
  useEffect(() => {
    if (!checkingGame && !hasGame) {
      router.push("/game");
    }
  }, [checkingGame, hasGame, router]);

  const handleAttack = (targetEmpireId: string) => {
    openPanel("combat", { targetEmpireId });
  };

  const handleMessage = (targetEmpireId: string) => {
    openPanel("messages", { targetEmpireId });
  };

  if (isLoading || checkingGame) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Galactic Starmap
        </h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800/50 rounded w-48 mb-6" />
          <div className="h-[600px] bg-gray-800/50 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Galactic Starmap
        </h1>
        <div className="lcars-panel text-center py-8">
          <p className="text-gray-400">Failed to load starmap data.</p>
        </div>
      </div>
    );
  }

  const activeEmpires = data.regions
    .flatMap((r) => r.empires)
    .filter((e) => !e.isEliminated);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        Galactic Starmap
      </h1>

      <div data-testid="starmap-page">
        <div className="mb-6">
          <h2 className="text-xl text-gray-300">
            Turn {data.currentTurn} of 200
          </h2>
          <p className="text-sm text-gray-500">
            {activeEmpires.length} empires remain active
          </p>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.regions.map((region) => (
            <div
              key={region.id}
              className={`p-4 rounded-lg border ${
                region.id === data.playerRegionId
                  ? "bg-lcars-amber/10 border-lcars-amber"
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <h3 className="text-lcars-amber font-medium mb-2">{region.name}</h3>
              <p className="text-xs text-gray-500 mb-3">
                {region.regionType} region
              </p>

              {/* Empires in this region */}
              <div className="space-y-2">
                {region.empires.length > 0 ? (
                  region.empires.slice(0, 5).map((empire: { id: string; name: string; sectorCount: number; networth: number; isEliminated: boolean }) => (
                    <div
                      key={empire.id}
                      className={`p-2 rounded text-sm ${
                        empire.id === data.playerEmpireId
                          ? "bg-lcars-amber/20 text-lcars-amber"
                          : empire.isEliminated
                          ? "bg-gray-900 text-gray-600 line-through"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{empire.name}</span>
                        {empire.id !== data.playerEmpireId && !empire.isEliminated && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAttack(empire.id)}
                              className="px-2 py-0.5 text-xs bg-red-900/50 hover:bg-red-800 rounded"
                              title="Attack"
                            >
                              ATK
                            </button>
                            <button
                              onClick={() => handleMessage(empire.id)}
                              className="px-2 py-0.5 text-xs bg-blue-900/50 hover:bg-blue-800 rounded"
                              title="Message"
                            >
                              MSG
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {empire.sectorCount} sectors • NW: {empire.networth.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-600">No empires</p>
                )}
                {region.empires.length > 5 && (
                  <p className="text-xs text-gray-500">
                    +{region.empires.length - 5} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Wormholes */}
        {data.wormholes.length > 0 && (
          <div className="mt-8 lcars-panel">
            <h3 className="text-lg font-semibold text-lcars-lavender mb-4">
              Known Wormholes
            </h3>
            <div className="space-y-2">
              {data.wormholes.map((wh) => {
                const fromRegion = data.regions.find((r) => r.id === wh.fromRegionId);
                const toRegion = data.regions.find((r) => r.id === wh.toRegionId);
                return (
                  <div
                    key={wh.id}
                    className={`p-2 rounded text-sm ${
                      wh.status === "stabilized"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-purple-900/30 text-purple-400"
                    }`}
                  >
                    {fromRegion?.name ?? "?"} ↔ {toRegion?.name ?? "?"} ({wh.status})
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
