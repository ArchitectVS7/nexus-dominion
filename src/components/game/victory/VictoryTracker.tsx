"use client";

/**
 * Victory Tracker Component (Phase 2.4)
 *
 * Displays galactic dominance race with victory points (VP)
 * Shows auto-coalition when leader reaches 7+ VP
 *
 * Based on: docs/redesign-01-02-2026/RESEARCH-REDESIGN.md Phase 2
 */

import { useEffect, useState } from "react";
import type { VictoryRaceData } from "@/lib/game/services/victory-service";
import { getVictoryProgress } from "@/lib/game/services/victory-service";

interface VictoryTrackerProps {
  gameId: string;
  playerEmpireId: string;
}

export function VictoryTracker({ gameId, playerEmpireId }: VictoryTrackerProps) {
  const [victoryRace, setVictoryRace] = useState<VictoryRaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVictoryRace() {
      try {
        // TODO: Create server action to fetch victory race data
        // const data = await getVictoryRaceAction(gameId);
        // setVictoryRace(data);

        // Placeholder for now
        setVictoryRace(null);
      } catch (error) {
        console.error("Failed to load victory race:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVictoryRace();
  }, [gameId]);

  if (loading) {
    return (
      <div className="lcars-panel animate-pulse">
        <div className="h-32 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (!victoryRace || victoryRace.empires.length === 0) {
    return null;
  }

  // Show top 5 empires only
  const topEmpires = victoryRace.empires.slice(0, 5);

  return (
    <div className="lcars-panel p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display text-lcars-amber">
          GALACTIC DOMINANCE RACE
        </h2>
        <span className="text-sm text-gray-400">
          Cycle {victoryRace.currentTurn} of 200
        </span>
      </div>

      {/* Coalition Warning */}
      {victoryRace.coalitionActive && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500 rounded">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-semibold">
                AUTO-COALITION ACTIVE
              </p>
              <p className="text-sm text-yellow-300">
                All empires get +10% combat bonus vs the leader
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Victory Point Progress Bars */}
      <div className="space-y-3">
        {topEmpires.map((empire) => {
          const isPlayer = empire.empireId === playerEmpireId;
          const progress = getVictoryProgress(empire.totalVP);
          const isLeader = empire.isLeader;
          const isCoalitionTarget = empire.coalitionTarget;

          return (
            <div key={empire.empireId} className="space-y-1">
              {/* Empire Name and VP */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      isPlayer
                        ? "text-blue-400"
                        : isLeader
                        ? "text-lcars-amber"
                        : "text-gray-300"
                    }`}
                  >
                    {empire.empireName}
                    {isPlayer && " (You)"}
                  </span>
                  {isLeader && (
                    <span className="text-xs px-2 py-0.5 bg-lcars-amber text-black rounded font-semibold">
                      LEADER
                    </span>
                  )}
                  {isCoalitionTarget && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500 text-black rounded font-semibold">
                      COALITION TARGET
                    </span>
                  )}
                </div>
                <span className="text-gray-400 font-mono">
                  {empire.totalVP}/{victoryRace.maxVP} VP
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    isPlayer
                      ? "bg-blue-500"
                      : isLeader
                      ? "bg-lcars-amber"
                      : isCoalitionTarget
                      ? "bg-yellow-500"
                      : "bg-gray-600"
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white drop-shadow-lg">
                    {empire.totalVP > 0 && (
                      <>
                        T:{empire.territoryVP} E:{empire.economicVP} S:
                        {empire.survivalVP}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VP Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="font-semibold">VP Sources:</span> T = Territory, E =
          Economic, S = Survival • First to {victoryRace.maxVP} VP wins!
        </p>
      </div>
    </div>
  );
}
