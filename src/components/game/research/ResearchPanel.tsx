"use client";

import { useState, useEffect } from "react";
import { getResearchInfoAction } from "@/app/actions/research-actions";
import type { ResearchStatus } from "@/lib/game/services/research-service";

interface ResearchPanelProps {
  refreshTrigger?: number;
}

export function ResearchPanel({ refreshTrigger }: ResearchPanelProps) {
  const [info, setInfo] = useState<{
    status: ResearchStatus;
    researchPlanetCount: number;
    pointsPerTurn: number;
    turnsToNextLevel: number;
    nextUnlock: { unlock: string; level: number } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInfo = async () => {
      const data = await getResearchInfoAction();
      setInfo(data);
      setIsLoading(false);
    };
    loadInfo();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="lcars-panel" data-testid="research-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Fundamental Research
        </h2>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="lcars-panel" data-testid="research-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Fundamental Research
        </h2>
        <div className="text-gray-400 text-sm">Research data unavailable</div>
      </div>
    );
  }

  const { status, researchPlanetCount, pointsPerTurn, turnsToNextLevel, nextUnlock } = info;

  return (
    <div className="lcars-panel" data-testid="research-panel">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-lcars-lavender">
          Fundamental Research
        </h2>
        <span className="text-2xl font-mono text-lcars-amber">
          Level {status.level}
        </span>
      </div>

      {/* Progress bar */}
      {!status.isMaxLevel && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress to Level {status.level + 1}</span>
            <span>{status.progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{status.currentPoints.toLocaleString()} RP</span>
            <span>{status.requiredPoints.toLocaleString()} RP needed</span>
          </div>
        </div>
      )}

      {status.isMaxLevel && (
        <div className="mb-4 p-3 bg-lcars-amber/10 border border-lcars-amber/30 rounded text-center">
          <span className="text-lcars-amber font-semibold">Maximum Level Reached</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-black/30 p-3 rounded">
          <div className="text-gray-500 text-xs">Research Planets</div>
          <div className="font-mono text-purple-400 text-lg">
            {researchPlanetCount}
          </div>
        </div>
        <div className="bg-black/30 p-3 rounded">
          <div className="text-gray-500 text-xs">Points/Turn</div>
          <div className="font-mono text-cyan-400 text-lg">
            +{pointsPerTurn.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Time to next level */}
      {!status.isMaxLevel && (
        <div className="mt-4 bg-black/30 p-3 rounded">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Turns to Level {status.level + 1}:</span>
            <span className="font-mono text-white text-lg">
              {turnsToNextLevel === -1 ? (
                <span className="text-red-400">No research planets</span>
              ) : (
                `${turnsToNextLevel} turns`
              )}
            </span>
          </div>
        </div>
      )}

      {/* Next unlock */}
      {nextUnlock && (
        <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-800/50 rounded">
          <div className="text-xs text-gray-400">Next Unlock at Level {nextUnlock.level}:</div>
          <div className="text-cyan-400 font-semibold">{nextUnlock.unlock}</div>
        </div>
      )}

      {/* Research levels guide */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Level 2:</span>
          <span className={status.level >= 2 ? "text-green-400" : "text-gray-500"}>
            {status.level >= 2 ? "Unlocked" : "Light Cruisers"}
          </span>
        </div>
      </div>
    </div>
  );
}
