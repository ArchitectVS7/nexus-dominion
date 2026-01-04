"use client";

/**
 * Release Planet Button Component
 *
 * Allows players to sell/release a planet for 50% refund.
 * Includes confirmation dialog to prevent accidental releases.
 */

import { useState, useTransition } from "react";
import { releasePlanetAction } from "@/app/actions/planet-actions";

interface ReleasePlanetButtonProps {
  planetId: string;
  planetType: string;
  purchasePrice: number;
  planetCount: number;
  onRelease?: () => void;
}

export function ReleasePlanetButton({
  planetId,
  planetType,
  purchasePrice,
  planetCount,
  onRelease,
}: ReleasePlanetButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estimate refund (50% of purchase price)
  const estimatedRefund = Math.floor(purchasePrice * 0.5);

  // Can't release if only 1 planet
  const canRelease = planetCount > 1;

  const handleRelease = () => {
    setError(null);
    startTransition(async () => {
      const result = await releasePlanetAction(planetId);
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
      <span className="text-xs text-gray-600 italic">
        Cannot release last planet
      </span>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-red-900/20 border border-red-800/50 rounded">
        <p className="text-xs text-gray-300">
          Release this {planetType} planet for{" "}
          <span className="text-lcars-amber font-mono">
            {estimatedRefund.toLocaleString()}
          </span>{" "}
          credits?
        </p>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleRelease}
            disabled={isPending}
            className="px-3 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? "Releasing..." : "Confirm"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-2 py-1 text-xs text-red-400 border border-red-800/50 rounded hover:bg-red-900/30 transition-colors"
      title={`Release for ~${estimatedRefund.toLocaleString()} credits`}
    >
      Release
    </button>
  );
}
