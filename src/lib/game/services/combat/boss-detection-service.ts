/**
 * Boss Detection Service (M7.1)
 *
 * Detects "boss" empires that have emerged as dominant powers.
 * Based on VISION.md: "Don't script bosses - let them emerge from bot-vs-bot conflict."
 *
 * Detection Criteria:
 * - Won 5+ battles against other empires
 * - Networth ≥ 2× average empire networth
 * - Both conditions must be true
 */

import { db } from "@/lib/db";
import { attacks, empires } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

// =============================================================================
// CONSTANTS
// =============================================================================

export const BOSS_CONSTANTS = {
  /** Minimum battle wins required to become a boss */
  MIN_BATTLE_WINS: 5,
  /** Minimum networth ratio vs average to become a boss */
  MIN_NETWORTH_RATIO: 2.0,
  /** Combat outcomes that count as victories */
  VICTORY_OUTCOMES: ["attacker_victory"] as const,
};

// =============================================================================
// TYPES
// =============================================================================

export interface BossStatus {
  empireId: string;
  empireName: string;
  isBoss: boolean;
  battleWins: number;
  networthRatio: number;
  bossEmergenceTurn: number | null;
  wasAlreadyBoss: boolean;
}

export interface BossDetectionResult {
  bosses: BossStatus[];
  newBosses: BossStatus[];
  averageNetworth: number;
  totalEmpires: number;
}

// =============================================================================
// PURE CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate average networth from empire list.
 * Excludes eliminated empires.
 */
export function calculateAverageNetworth(
  empireNetworthList: Array<{ networth: number; isEliminated: boolean }>
): number {
  const activeEmpires = empireNetworthList.filter((e) => !e.isEliminated);
  if (activeEmpires.length === 0) return 0;

  const total = activeEmpires.reduce((sum, e) => sum + e.networth, 0);
  return total / activeEmpires.length;
}

/**
 * Determine if an empire qualifies as a boss.
 */
export function isBossQualified(
  battleWins: number,
  networthRatio: number
): boolean {
  return (
    battleWins >= BOSS_CONSTANTS.MIN_BATTLE_WINS &&
    networthRatio >= BOSS_CONSTANTS.MIN_NETWORTH_RATIO
  );
}

/**
 * Calculate boss status for a single empire.
 */
export function calculateBossStatus(
  empireId: string,
  empireName: string,
  empireNetworth: number,
  averageNetworth: number,
  battleWins: number,
  previousBossEmergenceTurn: number | null,
  currentTurn: number
): BossStatus {
  const networthRatio = averageNetworth > 0 ? empireNetworth / averageNetworth : 0;
  const isBoss = isBossQualified(battleWins, networthRatio);
  const wasAlreadyBoss = previousBossEmergenceTurn !== null;

  // Set emergence turn if newly became boss
  let bossEmergenceTurn = previousBossEmergenceTurn;
  if (isBoss && !wasAlreadyBoss) {
    bossEmergenceTurn = currentTurn;
  } else if (!isBoss) {
    // Lost boss status
    bossEmergenceTurn = null;
  }

  return {
    empireId,
    empireName,
    isBoss,
    battleWins,
    networthRatio,
    bossEmergenceTurn,
    wasAlreadyBoss,
  };
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Count battle wins for an empire.
 * A battle win is when the empire was the attacker and won.
 */
export async function countBattleWins(
  empireId: string,
  gameId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(attacks)
    .where(
      and(
        eq(attacks.gameId, gameId),
        eq(attacks.attackerId, empireId),
        inArray(attacks.outcome, BOSS_CONSTANTS.VICTORY_OUTCOMES)
      )
    );

  return Number(result[0]?.count ?? 0);
}

/**
 * Get current boss status for an empire (if tracked).
 * Returns null if not yet tracked.
 */
export async function getPreviousBossStatus(
  empireId: string
): Promise<{ bossEmergenceTurn: number | null } | null> {
  // Check the empire's bossEmergenceTurn field
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
    columns: { bossEmergenceTurn: true },
  });

  if (!empire) return null;

  return {
    bossEmergenceTurn: empire.bossEmergenceTurn,
  };
}

/**
 * Update boss status for an empire in the database.
 */
export async function updateBossStatus(
  empireId: string,
  isBoss: boolean,
  bossEmergenceTurn: number | null
): Promise<void> {
  await db
    .update(empires)
    .set({
      isBoss,
      bossEmergenceTurn,
      updatedAt: new Date(),
    })
    .where(eq(empires.id, empireId));
}

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

/**
 * Detect all bosses in a game.
 * Call this during turn processing to update boss statuses.
 */
export async function detectBosses(
  gameId: string,
  currentTurn: number
): Promise<BossDetectionResult> {
  // Fetch all active empires
  const allEmpires = await db.query.empires.findMany({
    where: eq(empires.gameId, gameId),
    columns: {
      id: true,
      name: true,
      networth: true,
      isEliminated: true,
      isBoss: true,
      bossEmergenceTurn: true,
    },
  });

  // Calculate average networth (excluding eliminated)
  const averageNetworth = calculateAverageNetworth(allEmpires);

  const bossStatuses: BossStatus[] = [];
  const newBosses: BossStatus[] = [];

  // Process each active empire
  for (const empire of allEmpires) {
    if (empire.isEliminated) continue;

    // Count battle wins
    const battleWins = await countBattleWins(empire.id, gameId);

    // Calculate boss status
    const status = calculateBossStatus(
      empire.id,
      empire.name,
      empire.networth,
      averageNetworth,
      battleWins,
      empire.bossEmergenceTurn,
      currentTurn
    );

    bossStatuses.push(status);

    // Track newly emerged bosses
    if (status.isBoss && !status.wasAlreadyBoss) {
      newBosses.push(status);
    }

    // Update database if status changed
    const statusChanged =
      status.isBoss !== empire.isBoss ||
      status.bossEmergenceTurn !== empire.bossEmergenceTurn;

    if (statusChanged) {
      await updateBossStatus(empire.id, status.isBoss, status.bossEmergenceTurn);
    }
  }

  return {
    bosses: bossStatuses.filter((s) => s.isBoss),
    newBosses,
    averageNetworth,
    totalEmpires: allEmpires.filter((e) => !e.isEliminated).length,
  };
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

/**
 * Get all current bosses in a game.
 */
export async function getBosses(gameId: string): Promise<BossStatus[]> {
  const bossEmpires = await db.query.empires.findMany({
    where: and(eq(empires.gameId, gameId), eq(empires.isBoss, true)),
    columns: {
      id: true,
      name: true,
      networth: true,
      isBoss: true,
      bossEmergenceTurn: true,
    },
  });

  // Get average networth for ratio calculation
  const allEmpires = await db.query.empires.findMany({
    where: eq(empires.gameId, gameId),
    columns: { networth: true, isEliminated: true },
  });

  const averageNetworth = calculateAverageNetworth(allEmpires);

  // Build boss statuses (battle wins would need recalculation for accuracy)
  return Promise.all(
    bossEmpires.map(async (e) => {
      const battleWins = await countBattleWins(e.id, gameId);
      return {
        empireId: e.id,
        empireName: e.name,
        isBoss: true,
        battleWins,
        networthRatio: averageNetworth > 0 ? e.networth / averageNetworth : 0,
        bossEmergenceTurn: e.bossEmergenceTurn,
        wasAlreadyBoss: true,
      };
    })
  );
}

/**
 * Check if a specific empire is a boss.
 */
export async function isEmpireBoss(empireId: string): Promise<boolean> {
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
    columns: { isBoss: true },
  });

  return empire?.isBoss ?? false;
}
