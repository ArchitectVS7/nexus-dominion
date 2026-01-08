"use client";

import { useState, useEffect } from "react";
import { getResearchStatusAction } from "@/app/actions/research-actions";
import type { ResearchStatus } from "@/lib/game/services/research";

interface FundamentalResearchProgressProps {
  refreshTrigger?: number;
  compact?: boolean;
}

export function FundamentalResearchProgress({
  refreshTrigger,
  compact = false,
}: FundamentalResearchProgressProps) {
  const [status, setStatus] = useState<ResearchStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setError(null);
        const data = await getResearchStatusAction();
        setStatus(data);
      } catch (err) {
        console.error("Failed to load research status:", err);
        setError(err instanceof Error ? err.message : "Failed to load research");
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="text-gray-400 text-sm" data-testid="research-progress">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm" data-testid="research-progress">
        Error: {error}
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (compact) {
    return (
      <div
        className="flex items-center gap-3"
        data-testid="research-progress"
      >
        <span className="text-gray-400 text-sm">Research:</span>
        <span className="font-mono text-cyan-400">
          Lv {status.level}
        </span>
        {!status.isMaxLevel && (
          <div className="flex-1 max-w-24 h-1.5 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-500"
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>
        )}
        {status.isMaxLevel && (
          <span className="text-xs text-lcars-amber">MAX</span>
        )}
      </div>
    );
  }

  return (
    <div data-testid="research-progress">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-sm">Fundamental Research</span>
        <span className="font-mono text-cyan-400 text-lg">Level {status.level}</span>
      </div>

      {!status.isMaxLevel && (
        <>
          <div className="h-2 bg-gray-800 rounded overflow-hidden mb-1">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{status.currentPoints.toLocaleString()} / {status.requiredPoints.toLocaleString()} RP</span>
            <span>{status.progressPercent.toFixed(0)}%</span>
          </div>
        </>
      )}

      {status.isMaxLevel && (
        <div className="text-center text-lcars-amber text-sm">
          Maximum Level Achieved
        </div>
      )}
    </div>
  );
}
