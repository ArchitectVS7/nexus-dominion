"use client";

/**
 * Diplomacy Panel
 *
 * Displays diplomatic relations, treaties, and reputation.
 * Uses React Query for data fetching.
 */

import { usePanelStore } from "@/stores";

export function DiplomacyPanel() {
  const { panelContext } = usePanelStore();
  const targetEmpireId = panelContext?.targetEmpireId;

  return (
    <div className="space-y-6">
      {/* Selected Empire */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Target Empire
        </h3>
        {targetEmpireId ? (
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-lcars-amber">Empire ID: {targetEmpireId}</p>
            <p className="text-gray-500 text-sm mt-1">
              Diplomatic options will be available in Phase 3
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-gray-500">
              Select an empire from the starmap for diplomatic actions
            </p>
          </div>
        )}
      </section>

      {/* Active Treaties - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Active Treaties
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-gray-500 text-sm">No active treaties</p>
        </div>
      </section>

      {/* Reputation - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Your Reputation
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Galactic Standing</span>
            <span className="text-lcars-amber">Neutral</span>
          </div>
        </div>
      </section>

      {/* Diplomatic Actions - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Diplomatic Actions
        </h3>
        <p className="text-gray-500 text-sm">
          Full diplomacy interface will be implemented in Phase 3
        </p>
      </section>
    </div>
  );
}

export default DiplomacyPanel;
