"use client";

/**
 * Military Page
 *
 * Displays military forces, build queue, and unit construction.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export default function MilitaryPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Military</h1>
        <div className="lcars-panel">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-800 rounded" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Military</h1>
        <div className="lcars-panel">
          <p className="text-red-400">
            {error ? "Failed to load military data" : "No active game session"}
          </p>
        </div>
      </div>
    );
  }

  const { military } = data;

  return (
    <div className="max-w-6xl mx-auto" data-testid="military-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Military</h1>

      {/* Current Forces Summary */}
      <div className="lcars-panel mb-6">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Current Forces
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <UnitCount label="Soldiers" count={military.soldiers} color="green" />
          <UnitCount label="Fighters" count={military.fighters} color="blue" />
          <UnitCount label="Stations" count={military.stations} color="purple" />
          <UnitCount label="Light Cruisers" count={military.lightCruisers} color="cyan" />
          <UnitCount label="Heavy Cruisers" count={military.heavyCruisers} color="orange" />
          <UnitCount label="Carriers" count={military.carriers} color="red" />
          <UnitCount label="Covert Agents" count={military.covertAgents} color="gray" />
        </div>
      </div>

      {/* Build Queue - Placeholder */}
      <div className="lcars-panel mb-6">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Build Queue
        </h2>
        <p className="text-gray-500">No units in construction</p>
      </div>

      {/* Build Units - Placeholder */}
      <div className="lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Build Units
        </h2>
        <p className="text-gray-500">
          Unit construction interface will be implemented in Phase 3
        </p>
      </div>
    </div>
  );
}

function UnitCount({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  const colorClass = {
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    orange: "text-orange-400",
    red: "text-red-400",
    gray: "text-gray-400",
  }[color] ?? "text-gray-400";

  return (
    <div className="bg-black/30 p-3 rounded text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-mono text-lg ${colorClass}`}>
        {count.toLocaleString()}
      </div>
    </div>
  );
}
