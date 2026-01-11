"use client";

/**
 * Market Panel
 *
 * Displays market trading interface for buying/selling resources.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export function MarketPanel() {
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-800 rounded" />;
  }

  const resources = dashboard?.resources;

  return (
    <div className="space-y-6">
      {/* Current Resources */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Your Resources
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ResourceDisplay label="Credits" value={resources?.credits ?? 0} />
          <ResourceDisplay label="Food" value={resources?.food ?? 0} />
          <ResourceDisplay label="Ore" value={resources?.ore ?? 0} />
          <ResourceDisplay label="Petroleum" value={resources?.petroleum ?? 0} />
        </div>
      </section>

      {/* Market Prices - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Market Prices
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-gray-500 text-sm">
            Market prices interface coming in Phase 3
          </p>
        </div>
      </section>

      {/* Trade Interface - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Trade Resources
        </h3>
        <p className="text-gray-500 text-sm">
          Trading interface will be implemented in Phase 3
        </p>
      </section>
    </div>
  );
}

function ResourceDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-mono text-lcars-amber">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default MarketPanel;
