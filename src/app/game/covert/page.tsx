"use client";

/**
 * Covert Page
 *
 * Displays covert operations interface for espionage missions.
 * Uses React Query for data fetching and Zustand for panel state.
 */

import { useDashboard, useStarmapData } from "@/lib/api";
import { usePanelStore } from "@/stores";

export default function CovertPage() {
  const { panelContext } = usePanelStore();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: starmap, isLoading: starmapLoading } = useStarmapData();
  const targetEmpireId = panelContext?.targetEmpireId;

  const isLoading = dashboardLoading || starmapLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="covert-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Covert Operations
        </h1>
        <div className="lcars-panel animate-pulse">
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!dashboard || !starmap) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="covert-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Covert Operations
        </h1>
        <div className="lcars-panel">
          <p className="text-red-400">Failed to load covert operations data</p>
        </div>
      </div>
    );
  }

  const spies = dashboard.military.covertAgents;
  const targets = starmap.empires.filter(
    (e) => e.id !== starmap.playerEmpireId && !e.isEliminated
  );
  const selectedTarget = targets.find((t) => t.id === targetEmpireId);

  const operations = [
    {
      name: "Reconnaissance",
      description: "Gather intel on enemy forces",
      spyCost: 1,
      successRate: "High",
    },
    {
      name: "Sabotage",
      description: "Damage enemy production facilities",
      spyCost: 2,
      successRate: "Medium",
    },
    {
      name: "Steal Technology",
      description: "Acquire enemy research data",
      spyCost: 3,
      successRate: "Low",
    },
    {
      name: "Assassination",
      description: "Eliminate enemy leaders",
      spyCost: 5,
      successRate: "Very Low",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto" data-testid="covert-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        Covert Operations
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intelligence Assets */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Intelligence Assets
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded">
            <span className="text-gray-400">Available Agents</span>
            <span className="text-lcars-amber font-mono text-2xl">{spies}</span>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Train more agents from the Military page
          </p>
        </div>

        {/* Target Selection */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Target Empire
          </h2>
          {selectedTarget ? (
            <div className="p-4 bg-gray-800/50 rounded">
              <div className="text-lcars-amber font-semibold">
                {selectedTarget.name}
              </div>
              <div className="text-sm text-gray-400">
                NW: {selectedTarget.networth.toLocaleString()} | Sectors:{" "}
                {selectedTarget.sectorCount}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Select a target from the starmap for covert operations
            </p>
          )}
        </div>

        {/* Available Operations */}
        <div className="lcars-panel lg:col-span-2">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Available Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operations.map((op) => {
              const canExecute = spies >= op.spyCost && selectedTarget;
              return (
                <button
                  key={op.name}
                  disabled={!canExecute}
                  className={`p-4 rounded border text-left ${
                    canExecute
                      ? "bg-gray-800 hover:bg-gray-700 border-gray-600"
                      : "bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="font-semibold text-lcars-amber">{op.name}</div>
                  <div className="text-sm text-gray-400">{op.description}</div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-500">
                      Agents required: {op.spyCost}
                    </span>
                    <span
                      className={
                        op.successRate === "High"
                          ? "text-green-400"
                          : op.successRate === "Medium"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }
                    >
                      {op.successRate} success rate
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Covert operation execution will be implemented in Phase 3
          </p>
        </div>
      </div>

      {/* Covert Info */}
      <div className="mt-6 lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Covert Operations System
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <span className="text-purple-400">Covert Agents</span> are trained
            specialists who can perform espionage missions.
          </p>
          <p>
            Operations have varying success rates based on target defenses and
            agent skill.
          </p>
          <p>Failed operations may expose your agents and damage relations.</p>
        </div>
      </div>
    </div>
  );
}
