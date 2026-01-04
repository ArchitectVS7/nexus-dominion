"use client";

import { useState, useTransition } from "react";
import { buyPlanetAction, getAllPlanetPurchaseInfoAction } from "@/app/actions/planet-actions";
import type { PlanetPurchaseInfo } from "@/lib/game/services/planet-service";
import { UI_LABELS, getSectorTypeLabel } from "@/lib/game/constants";

const PLANET_TYPE_COLORS: Record<string, string> = {
  food: "text-green-400",
  ore: "text-gray-400",
  petroleum: "text-yellow-500",
  tourism: "text-lcars-amber",
  urban: "text-blue-400",
  education: "text-purple-400",
  government: "text-red-400",
  research: "text-cyan-400",
  supply: "text-orange-400",
  anti_pollution: "text-green-300",
};

interface BuyPlanetPanelProps {
  credits: number;
  onPurchase?: () => void;
}

export function BuyPlanetPanel({ credits, onPurchase }: BuyPlanetPanelProps) {
  const [purchaseInfo, setPurchaseInfo] = useState<PlanetPurchaseInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, startPurchase] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPurchaseInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await getAllPlanetPurchaseInfoAction();
      setPurchaseInfo(info);
    } catch {
      setError("Failed to load sector prices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyPlanet = async (planetType: string) => {
    setError(null);
    setSuccess(null);

    startPurchase(async () => {
      const result = await buyPlanetAction(planetType as Parameters<typeof buyPlanetAction>[0]);
      if (result.success) {
        setSuccess(`Colonized ${getSectorTypeLabel(planetType as Parameters<typeof getSectorTypeLabel>[0])} for ${result.creditsDeducted?.toLocaleString()} credits`);
        // Refresh purchase info
        await loadPurchaseInfo();
        onPurchase?.();
      } else {
        setError(result.error || "Failed to colonize sector");
      }
    });
  };

  if (!purchaseInfo) {
    return (
      <div className="lcars-panel" data-testid="buy-planet-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          {UI_LABELS.colonizeSector}
        </h2>
        <button
          onClick={loadPurchaseInfo}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-lcars-amber text-black font-semibold rounded hover:bg-lcars-amber/80 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "View Sector Prices"}
        </button>
      </div>
    );
  }

  return (
    <div className="lcars-panel" data-testid="buy-planet-panel">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-lcars-lavender">
          {UI_LABELS.colonizeSector}
        </h2>
        <span className="text-sm text-gray-400">
          Credits: <span className="text-lcars-amber font-mono">{credits.toLocaleString()}</span>
        </span>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-900/50 border border-red-500 text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-2 bg-green-900/50 border border-green-500 text-green-300 text-sm rounded">
          {success}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {purchaseInfo.map((info) => {
          const label = getSectorTypeLabel(info.planetType as Parameters<typeof getSectorTypeLabel>[0]);
          const color = PLANET_TYPE_COLORS[info.planetType] || "text-gray-300";
          const canAfford = credits >= info.currentCost;

          return (
            <div
              key={info.planetType}
              className="flex items-center justify-between p-2 bg-black/30 rounded border border-gray-700"
              data-testid={`buy-planet-${info.planetType}`}
            >
              <div className="flex-1">
                <div className={`font-semibold ${color}`}>{label}</div>
                <div className="text-xs text-gray-400">
                  Owned: {info.ownedCount} | Cost: {info.costMultiplier.toFixed(2)}x
                </div>
              </div>
              <div className="text-right mr-3">
                <div className={`font-mono ${canAfford ? "text-lcars-amber" : "text-red-400"}`}>
                  {info.currentCost.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">credits</div>
              </div>
              <button
                onClick={() => handleBuyPlanet(info.planetType)}
                disabled={!canAfford || isPurchasing}
                className={`px-3 py-1 rounded font-semibold text-sm transition-colors ${
                  canAfford
                    ? "bg-lcars-amber text-black hover:bg-lcars-amber/80"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPurchasing ? "..." : "Buy"}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setPurchaseInfo(null)}
        className="mt-4 w-full py-1 text-sm text-gray-400 hover:text-gray-200"
      >
        Close
      </button>
    </div>
  );
}
