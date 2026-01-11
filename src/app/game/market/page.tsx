"use client";

/**
 * Market Page
 *
 * Displays market trading interface for buying/selling resources.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export default function MarketPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="market-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Market</h1>
        <div className="lcars-panel animate-pulse">
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="market-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Market</h1>
        <div className="lcars-panel">
          <p className="text-red-400">Failed to load market data</p>
        </div>
      </div>
    );
  }

  const { resources } = data;

  return (
    <div className="max-w-6xl mx-auto" data-testid="market-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Market</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Resources */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Your Resources
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ResourceDisplay
              label="Credits"
              value={resources.credits}
              color="amber"
            />
            <ResourceDisplay
              label="Food"
              value={resources.food}
              color="green"
            />
            <ResourceDisplay
              label="Ore"
              value={resources.ore}
              color="blue"
            />
            <ResourceDisplay
              label="Petroleum"
              value={resources.petroleum}
              color="cyan"
            />
          </div>
        </div>

        {/* Market Prices */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Current Market Prices
          </h2>
          <div className="space-y-3">
            <PriceDisplay resource="Food" buyPrice={10} sellPrice={8} />
            <PriceDisplay resource="Energy" buyPrice={15} sellPrice={12} />
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Market prices fluctuate based on supply and demand
          </p>
        </div>

        {/* Buy Resources */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Buy Resources
          </h2>
          <div className="space-y-3">
            <TradeButton label="Buy 100 Food" cost={1000} canAfford={resources.credits >= 1000} />
            <TradeButton label="Buy 100 Ore" cost={1500} canAfford={resources.credits >= 1500} />
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Trading execution will be implemented in Phase 3
          </p>
        </div>

        {/* Sell Resources */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Sell Resources
          </h2>
          <div className="space-y-3">
            <TradeButton label="Sell 100 Food" cost={-800} canAfford={resources.food >= 100} />
            <TradeButton label="Sell 100 Ore" cost={-1200} canAfford={resources.ore >= 100} />
          </div>
        </div>
      </div>

      {/* Market Info */}
      <div className="mt-6 lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Market System
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            Trade resources with the galactic market to balance your economy.
          </p>
          <p>
            <span className="text-green-400">Food</span> is consumed by population each turn.
          </p>
          <p>
            <span className="text-blue-400">Energy</span> powers military units and production.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResourceDisplay({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClass = {
    amber: "text-lcars-amber",
    green: "text-green-400",
    blue: "text-blue-400",
    cyan: "text-cyan-400",
  }[color] ?? "text-gray-400";

  return (
    <div className="p-3 bg-gray-800/50 rounded text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-mono text-xl ${colorClass}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function PriceDisplay({
  resource,
  buyPrice,
  sellPrice,
}: {
  resource: string;
  buyPrice: number;
  sellPrice: number;
}) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
      <span className="font-medium">{resource}</span>
      <div className="flex gap-4 text-sm">
        <span className="text-red-400">Buy: {buyPrice}</span>
        <span className="text-green-400">Sell: {sellPrice}</span>
      </div>
    </div>
  );
}

function TradeButton({
  label,
  cost,
  canAfford,
}: {
  label: string;
  cost: number;
  canAfford: boolean;
}) {
  return (
    <button
      disabled={!canAfford}
      className={`w-full p-3 rounded flex justify-between items-center ${
        canAfford
          ? "bg-gray-800 hover:bg-gray-700 border border-gray-600"
          : "bg-gray-900 border border-gray-800 opacity-50 cursor-not-allowed"
      }`}
    >
      <span>{label}</span>
      <span className={cost > 0 ? "text-red-400" : "text-green-400"}>
        {cost > 0 ? `-${cost}` : `+${Math.abs(cost)}`} credits
      </span>
    </button>
  );
}
