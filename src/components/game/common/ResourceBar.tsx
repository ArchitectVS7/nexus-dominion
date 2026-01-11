"use client";

/**
 * Resource Bar Component
 *
 * Displays current resource levels in the bottom bar.
 * Shows credits, food, ore, and petroleum.
 */

interface ResourceBarProps {
  credits?: number;
  food?: number;
  ore?: number;
  petroleum?: number;
}

/**
 * Format large numbers with K/M suffixes
 */
function formatNumber(value: number | undefined): string {
  if (value === undefined) return "---";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

interface ResourceItemProps {
  label: string;
  value: number | undefined;
  color: string;
  icon: string;
  testId: string;
}

function ResourceItem({ label, value, color, icon, testId }: ResourceItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 hidden md:block">{label}</span>
        <span className={`font-mono ${color}`} data-testid={testId}>
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

export function ResourceBar({ credits, food, ore, petroleum }: ResourceBarProps) {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <ResourceItem
        label="Credits"
        value={credits}
        color="text-yellow-400"
        icon="$"
        testId="resource-credits"
      />
      <ResourceItem
        label="Food"
        value={food}
        color="text-green-400"
        icon="🌾"
        testId="resource-food"
      />
      <ResourceItem
        label="Ore"
        value={ore}
        color="text-orange-400"
        icon="⛏️"
        testId="resource-ore"
      />
      <ResourceItem
        label="Petroleum"
        value={petroleum}
        color="text-blue-400"
        icon="🛢️"
        testId="resource-petroleum"
      />
    </div>
  );
}

export default ResourceBar;
