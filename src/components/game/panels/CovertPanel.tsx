"use client";

/**
 * Covert Panel
 *
 * Displays covert operations interface for espionage missions.
 * Uses React Query for data and Zustand for panel context.
 */

import { usePanelStore } from "@/stores";
import { useDashboard } from "@/lib/api";

export function CovertPanel() {
  const { panelContext } = usePanelStore();
  const { data: dashboard, isLoading } = useDashboard();
  const targetEmpireId = panelContext?.targetEmpireId;

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-800 rounded" />;
  }

  const spies = dashboard?.military?.covertAgents ?? 0;

  return (
    <div className="space-y-6">
      {/* Spy Count */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Intelligence Assets
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Available Spies</span>
            <span className="text-lg font-mono text-lcars-amber">{spies}</span>
          </div>
        </div>
      </section>

      {/* Target Selection */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Target Empire
        </h3>
        {targetEmpireId ? (
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-lcars-amber">Target ID: {targetEmpireId}</p>
            <p className="text-gray-500 text-sm mt-1">
              Operations available in Phase 3
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-gray-500">
              Select a target from the starmap for covert operations
            </p>
          </div>
        )}
      </section>

      {/* Operations List - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Available Operations
        </h3>
        <div className="space-y-2">
          {["Reconnaissance", "Sabotage", "Steal Tech", "Assassination"].map(
            (op) => (
              <div
                key={op}
                className="p-3 bg-gray-800/50 rounded border border-gray-700 opacity-50"
              >
                <div className="text-gray-400">{op}</div>
                <div className="text-xs text-gray-600">Coming in Phase 3</div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default CovertPanel;
