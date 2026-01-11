"use client";

/**
 * Military Panel
 *
 * Displays military units, build queue, and unit construction.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export function MilitaryPanel() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-gray-800 rounded" />
        <div className="h-32 bg-gray-800 rounded" />
        <div className="h-24 bg-gray-800 rounded" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded">
        Failed to load military data
      </div>
    );
  }

  const { military } = dashboard;

  return (
    <div className="space-y-6">
      {/* Current Forces */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Current Forces
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <UnitDisplay label="Soldiers" count={military.soldiers} />
          <UnitDisplay label="Fighters" count={military.fighters} />
          <UnitDisplay label="Stations" count={military.stations} />
          <UnitDisplay label="Light Cruisers" count={military.lightCruisers} />
          <UnitDisplay label="Heavy Cruisers" count={military.heavyCruisers} />
          <UnitDisplay label="Carriers" count={military.carriers} />
        </div>
      </section>

      {/* Build Queue - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Build Queue
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-gray-500 text-sm">No units in construction</p>
        </div>
      </section>

      {/* Build Units - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Build Units
        </h3>
        <p className="text-gray-500 text-sm">
          Unit construction will be implemented in Phase 3
        </p>
      </section>
    </div>
  );
}

function UnitDisplay({ label, count }: { label: string; count: number }) {
  return (
    <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-mono text-lcars-amber">
        {count.toLocaleString()}
      </div>
    </div>
  );
}

export default MilitaryPanel;
