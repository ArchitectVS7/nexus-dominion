"use client";

/**
 * Galaxy View Component
 *
 * Stub component for the galaxy visualization.
 * Full implementation pending.
 */

// Types for the galaxy view
export interface GalaxyRegion {
  id: string;
  name: string;
  regionType: "core" | "frontier" | "rim" | "void";
  empires: {
    id: string;
    name: string;
    sectorCount: number;
    networth: number;
    isEliminated: boolean;
  }[];
}

export interface WormholeData {
  id: string;
  fromRegionId: string;
  toRegionId: string;
  status: "discovered" | "stabilized" | "collapsed";
}

export interface GalaxyViewProps {
  regions: GalaxyRegion[];
  wormholes: WormholeData[];
  playerRegionId?: string;
  playerEmpireId?: string;
  currentTurn: number;
  onSelectEmpire?: (empireId: string) => void;
}

export function GalaxyView({
  regions,
  wormholes,
  playerRegionId,
  playerEmpireId,
  currentTurn,
  onSelectEmpire,
}: GalaxyViewProps) {
  const activeEmpires = regions
    .flatMap((r) => r.empires)
    .filter((e) => !e.isEliminated);

  return (
    <div className="lcars-panel" data-testid="galaxy-view">
      <div className="mb-4">
        <h2 className="text-xl text-gray-300">Turn {currentTurn}</h2>
        <p className="text-sm text-gray-500">
          {activeEmpires.length} empires remain active
        </p>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {regions.map((region) => (
          <div
            key={region.id}
            className={`p-4 rounded-lg border ${
              region.id === playerRegionId
                ? "bg-lcars-amber/10 border-lcars-amber"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <h3 className="text-lcars-amber font-medium mb-2">{region.name}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {region.regionType} region
            </p>

            <div className="space-y-2">
              {region.empires.slice(0, 5).map((empire) => (
                <button
                  key={empire.id}
                  onClick={() => onSelectEmpire?.(empire.id)}
                  disabled={empire.id === playerEmpireId}
                  className={`w-full p-2 rounded text-sm text-left ${
                    empire.id === playerEmpireId
                      ? "bg-lcars-amber/20 text-lcars-amber cursor-default"
                      : empire.isEliminated
                        ? "bg-gray-900 text-gray-600 line-through"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <div className="truncate">{empire.name}</div>
                  <div className="text-xs text-gray-500">
                    {empire.sectorCount} sectors
                  </div>
                </button>
              ))}
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
      {wormholes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-lcars-lavender mb-3">
            Known Wormholes
          </h3>
          <div className="space-y-2">
            {wormholes.map((wh) => {
              const fromRegion = regions.find((r) => r.id === wh.fromRegionId);
              const toRegion = regions.find((r) => r.id === wh.toRegionId);
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
  );
}

export default GalaxyView;
