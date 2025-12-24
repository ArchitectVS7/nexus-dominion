"use client";

import { useState, useTransition } from "react";
import { releasePlanetAction } from "@/app/actions/planet-actions";
import type { Planet } from "@/lib/db/schema";
import { PLANET_TYPE_LABELS, PLANET_COSTS, type PlanetType } from "@/lib/game/constants";
import { calculateReleaseRefund } from "@/lib/formulas/planet-costs";

interface PlanetReleaseButtonProps {
  planet: Planet;
  totalPlanets: number;
  onRelease?: () => void;
}

export function PlanetReleaseButton({ planet, totalPlanets, onRelease }: PlanetReleaseButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const planetLabel = PLANET_TYPE_LABELS[planet.type as keyof typeof PLANET_TYPE_LABELS];
  const baseCost = PLANET_COSTS[planet.type as PlanetType];
  const refundAmount = calculateReleaseRefund(baseCost, totalPlanets);
  const canRelease = totalPlanets > 1;

  const handleRelease = () => {
    setError(null);
    startTransition(async () => {
      const result = await releasePlanetAction(planet.id);
      if (result.success) {
        setShowConfirm(false);
        onRelease?.();
      } else {
        setError(result.error || "Failed to release planet");
      }
    });
  };

  if (!canRelease) {
    return (
      <span className="text-xs text-gray-600" title="Cannot release your last planet">
        Last planet
      </span>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-300">
          Refund: <span className="text-green-400">{refundAmount.toLocaleString()}</span>
        </div>
        <button
          onClick={handleRelease}
          disabled={isPending}
          className="px-2 py-0.5 text-xs bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isPending ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-2 py-0.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
      title={`Release ${planetLabel} for ${refundAmount.toLocaleString()} credits (50% refund)`}
    >
      Release
    </button>
  );
}
