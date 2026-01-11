/**
 * Balance Tracker - Per-Game Metrics Collection
 *
 * Extracts detailed metrics from a single game result for balance analysis.
 * Tracks peak performance, activity, and outcome data per empire.
 */

import type {
  GameResult,
  GameMetrics,
  EmpireMetrics,
  TurnSnapshot,
  AttackRecord,
  BotArchetype,
} from "../types";

/**
 * Extract comprehensive metrics from a game result.
 *
 * @param result - Completed game result
 * @returns GameMetrics with per-empire breakdown
 */
export function extractGameMetrics(result: GameResult): GameMetrics {
  const empireMetrics = result.finalEmpires.map((empire) =>
    extractEmpireMetrics(
      empire.id,
      empire.name,
      empire.botArchetype,
      empire.botTier,
      result
    )
  );

  return {
    gameId: result.gameId,
    seed: result.seed,
    turnsPlayed: result.turnsPlayed,
    durationMs: result.durationMs,
    victoryCondition: result.victoryCondition,
    winnerId: result.winnerId,
    winnerArchetype: result.winnerArchetype,
    empireMetrics,
  };
}

/**
 * Extract metrics for a single empire from game result.
 */
function extractEmpireMetrics(
  empireId: string,
  empireName: string,
  archetype: BotArchetype | null,
  tier: string | null,
  result: GameResult
): EmpireMetrics {
  const ranking = result.finalRankings.find((r) => r.empireId === empireId);
  const finalEmpire = result.finalEmpires.find((e) => e.id === empireId);

  // Calculate peak values from snapshots
  const peaks = calculatePeakValues(empireId, result.turnSnapshots);

  // Calculate attack statistics
  const attackStats = calculateAttackStats(empireId, result.attackRecords);

  return {
    empireId,
    empireName,
    archetype,
    tier: tier as EmpireMetrics["tier"],

    // Survival
    survivalTurns: ranking?.survivalTurns ?? result.turnsPlayed,
    finalPosition: ranking?.position ?? result.finalEmpires.length,
    wasEliminated: ranking?.wasEliminated ?? false,
    eliminatedBy: ranking?.eliminatedBy ?? null,

    // Peak performance
    peakNetworth: peaks.peakNetworth,
    peakSectorCount: peaks.peakSectorCount,
    peakMilitaryPower: peaks.peakMilitaryPower,

    // Activity
    attacksLaunched: attackStats.attacksLaunched,
    attacksReceived: attackStats.attacksReceived,
    battlesWon: attackStats.battlesWon,
    battlesLost: attackStats.battlesLost,

    // Economy (simplified - could be expanded with turn-by-turn tracking)
    totalCreditsEarned: finalEmpire?.credits ?? 0,
    totalSectorsBought: Math.max(0, peaks.peakSectorCount - 5), // Starting sectors = 5
    totalUnitsBuilt: calculateTotalUnits(finalEmpire),
  };
}

/**
 * Calculate peak values from turn snapshots.
 */
function calculatePeakValues(
  empireId: string,
  snapshots: TurnSnapshot[]
): { peakNetworth: number; peakSectorCount: number; peakMilitaryPower: number } {
  let peakNetworth = 0;
  let peakSectorCount = 0;
  let peakMilitaryPower = 0;

  for (const snapshot of snapshots) {
    const empireSnapshot = snapshot.empireSnapshots.find(
      (e) => e.empireId === empireId
    );
    if (empireSnapshot) {
      peakNetworth = Math.max(peakNetworth, empireSnapshot.networth);
      peakSectorCount = Math.max(peakSectorCount, empireSnapshot.sectorCount);
      peakMilitaryPower = Math.max(
        peakMilitaryPower,
        empireSnapshot.militaryPower
      );
    }
  }

  return { peakNetworth, peakSectorCount, peakMilitaryPower };
}

/**
 * Calculate attack statistics from attack records.
 */
function calculateAttackStats(
  empireId: string,
  attacks: AttackRecord[]
): {
  attacksLaunched: number;
  attacksReceived: number;
  battlesWon: number;
  battlesLost: number;
} {
  let attacksLaunched = 0;
  let attacksReceived = 0;
  let battlesWon = 0;
  let battlesLost = 0;

  for (const attack of attacks) {
    if (attack.attackerId === empireId) {
      attacksLaunched++;
      if (attack.attackerWon) {
        battlesWon++;
      } else {
        battlesLost++;
      }
    }
    if (attack.defenderId === empireId) {
      attacksReceived++;
      if (!attack.attackerWon) {
        battlesWon++;
      } else {
        battlesLost++;
      }
    }
  }

  return { attacksLaunched, attacksReceived, battlesWon, battlesLost };
}

/**
 * Calculate total units from final empire state.
 */
function calculateTotalUnits(
  empire: GameResult["finalEmpires"][0] | undefined
): number {
  if (!empire) return 0;
  return (
    empire.soldiers +
    empire.fighters +
    empire.stations +
    empire.lightCruisers +
    empire.heavyCruisers +
    empire.carriers
  );
}

/**
 * Validate game metrics for consistency.
 *
 * @param metrics - GameMetrics to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateGameMetrics(metrics: GameMetrics): string[] {
  const errors: string[] = [];

  // Check win consistency
  if (metrics.winnerId) {
    const winner = metrics.empireMetrics.find(
      (e) => e.empireId === metrics.winnerId
    );
    if (!winner) {
      errors.push(`Winner ${metrics.winnerId} not found in empire metrics`);
    } else if (winner.finalPosition !== 1) {
      errors.push(
        `Winner has position ${winner.finalPosition}, expected 1`
      );
    }
  }

  // Check survival turns
  for (const empire of metrics.empireMetrics) {
    if (empire.survivalTurns > metrics.turnsPlayed) {
      errors.push(
        `${empire.empireName} survived ${empire.survivalTurns} turns but game only lasted ${metrics.turnsPlayed}`
      );
    }
    if (empire.wasEliminated && empire.survivalTurns === metrics.turnsPlayed) {
      errors.push(
        `${empire.empireName} marked eliminated but survived all turns`
      );
    }
  }

  // Check position uniqueness
  const positions = metrics.empireMetrics.map((e) => e.finalPosition);
  const uniquePositions = new Set(positions);
  if (uniquePositions.size !== positions.length) {
    errors.push("Duplicate positions found in rankings");
  }

  return errors;
}
