"use client";

/**
 * Combat Page
 *
 * Displays combat interface for attacking other empires.
 * Uses React Query for data fetching.
 */

import { useState } from "react";
import { useDashboard, useStarmapData } from "@/lib/api";
import { usePanelStore } from "@/stores";
import type { Forces } from "@/lib/combat/phases";

export default function CombatPage() {
  const { panelContext } = usePanelStore();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: starmap, isLoading: starmapLoading } = useStarmapData();

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    panelContext?.targetEmpireId ?? null
  );
  const [attackType, setAttackType] = useState<"invasion" | "guerilla">("invasion");
  const [selectedForces, setSelectedForces] = useState<Forces>({
    soldiers: 0,
    fighters: 0,
    stations: 0,
    lightCruisers: 0,
    heavyCruisers: 0,
    carriers: 0,
  });

  const isLoading = dashboardLoading || starmapLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="combat-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Combat</h1>
        <div className="lcars-panel animate-pulse">
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  const myForces = dashboard?.military ?? null;
  const targets = starmap?.empires.filter(
    (e) => e.id !== starmap.playerEmpireId && !e.isEliminated
  ) ?? [];
  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  return (
    <div className="max-w-6xl mx-auto" data-testid="combat-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Combat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Attack Interface */}
        <div className="space-y-6">
          {/* Target Selection */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Select Target
            </h2>
            {targets.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No targets available. Start a game with bots to have enemies.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {targets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTargetId(target.id)}
                    className={`w-full p-3 rounded text-left transition-colors ${
                      selectedTargetId === target.id
                        ? "bg-lcars-amber/20 border border-lcars-amber"
                        : "bg-gray-800 hover:bg-gray-700 border border-transparent"
                    }`}
                  >
                    <div className="font-semibold">{target.name}</div>
                    <div className="text-sm text-gray-400">
                      NW: {target.networth.toLocaleString()} | Sectors: {target.sectorCount}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Attack Type */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Attack Type
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setAttackType("invasion")}
                className={`flex-1 p-3 rounded transition-colors ${
                  attackType === "invasion"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="font-semibold">Invasion</div>
                <div className="text-xs opacity-75">Full 3-phase assault</div>
              </button>
              <button
                onClick={() => setAttackType("guerilla")}
                className={`flex-1 p-3 rounded transition-colors ${
                  attackType === "guerilla"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="font-semibold">Guerilla</div>
                <div className="text-xs opacity-75">Soldiers only</div>
              </button>
            </div>
          </div>

          {/* Force Selection */}
          {myForces && (
            <div className="lcars-panel">
              <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
                Select Forces
              </h2>
              <div className="space-y-3">
                {(["soldiers", "fighters", "lightCruisers", "heavyCruisers", "carriers"] as const).map(
                  (unit) => (
                    <div key={unit} className="flex items-center justify-between">
                      <label className="text-sm capitalize">
                        {unit.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">
                          Available: {myForces[unit]}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={myForces[unit]}
                          value={selectedForces[unit]}
                          onChange={(e) =>
                            setSelectedForces((prev) => ({
                              ...prev,
                              [unit]: Math.min(
                                Math.max(0, parseInt(e.target.value) || 0),
                                myForces[unit]
                              ),
                            }))
                          }
                          className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-right"
                          disabled={attackType === "guerilla" && unit !== "soldiers"}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Attack Button */}
          <button
            disabled={!selectedTarget}
            className={`w-full p-4 rounded font-semibold ${
              selectedTarget
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedTarget
              ? `LAUNCH ${attackType.toUpperCase()} AGAINST ${selectedTarget.name.toUpperCase()}`
              : "Select a target to attack"}
          </button>
          <p className="text-gray-500 text-sm text-center">
            Full combat execution will be implemented in Phase 3
          </p>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          {/* Combat Info */}
          <div className="lcars-panel bg-gray-800/50">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Combat System
            </h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div>
                <span className="text-lcars-amber">Invasion:</span> 3-phase combat
                (Space → Orbital → Ground). Win all phases to capture sectors.
              </div>
              <div>
                <span className="text-lcars-amber">Guerilla:</span> Hit-and-run
                with soldiers only. Damages enemy forces but no sector capture.
              </div>
              <div>
                <span className="text-lcars-amber">Carriers:</span> Required to
                transport soldiers. Each carrier holds 100 soldiers.
              </div>
            </div>
          </div>

          {/* Recent Battles */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Recent Battles
            </h2>
            <p className="text-gray-500 text-sm">No battles yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
