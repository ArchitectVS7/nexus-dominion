"use client";

/**
 * Combat Panel
 *
 * Displays combat interface for attacking other empires.
 * Uses React Query for data and Zustand for panel context.
 */

import { usePanelStore } from "@/stores";

export function CombatPanel() {
  const { panelContext } = usePanelStore();
  const targetEmpireId = panelContext?.targetEmpireId;

  return (
    <div className="space-y-6">
      {/* Target Selection */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Target Empire
        </h3>
        {targetEmpireId ? (
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-lcars-amber">Target ID: {targetEmpireId}</p>
            <p className="text-gray-500 text-sm mt-1">
              Full combat interface coming in Phase 3
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-gray-500">
              Select a target from the starmap to attack
            </p>
          </div>
        )}
      </section>

      {/* Force Selection - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Select Forces
        </h3>
        <p className="text-gray-500 text-sm">
          Force selection will be implemented in Phase 3
        </p>
      </section>

      {/* Combat Preview - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Combat Preview
        </h3>
        <p className="text-gray-500 text-sm">
          Combat preview will be implemented in Phase 3
        </p>
      </section>
    </div>
  );
}

export default CombatPanel;
