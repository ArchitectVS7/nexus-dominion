"use client";

/**
 * Sectors Panel
 *
 * Displays owned sectors and colonization options.
 */

import { useDashboard } from "@/lib/api";

export function SectorsPanel() {
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-800 rounded" />;
  }

  const sectors = dashboard?.sectors ?? [];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Owned Sectors ({sectors.length})
        </h3>
        <div className="space-y-2">
          {sectors.length > 0 ? (
            sectors.map((sector) => (
              <div
                key={sector.id}
                className="p-3 bg-gray-800/50 rounded border border-gray-700"
              >
                <div className="text-lcars-amber capitalize">{sector.type}</div>
                <div className="text-xs text-gray-500">
                  Type: {sector.type}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No sectors owned</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Colonize New Sector
        </h3>
        <p className="text-gray-500 text-sm">
          Colonization interface coming in Phase 3
        </p>
      </section>
    </div>
  );
}

export default SectorsPanel;
