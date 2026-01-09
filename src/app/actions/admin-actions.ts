"use server";

import { db } from "@/lib/db";
import {
  games,
  empires,
  sectors,
  attacks,
  combatLogs,
  messages,
  treaties,
  buildQueue,
  reputationLog,
  unitUpgrades,
  researchBranchAllocations,
  resourceInventory,
  craftingQueue,
  researchProgress,
  marketOrders,
  marketPrices,
  galacticEvents,
  coalitions,
  coalitionMembers,
  syndicateContracts,
  syndicateTrust,
  pirateMissions,
  performanceLogs,
  botMemories,
  botEmotionalStates,
  botTells,
  civilStatusHistory,
  gameSaves,
  gameSessions,
  gameConfigs,
  galaxyRegions,
  regionConnections,
  empireInfluence,
  llmUsageLogs,
  llmDecisionCache,
} from "@/lib/db/schema";
import { eq, lt, and, or, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

// =============================================================================
// SECURITY: Admin Authentication
// =============================================================================

/**
 * Verify admin access using environment variable.
 *
 * For alpha: Uses ADMIN_SECRET env var
 * For production: Should implement proper role-based access control
 *
 * Set ADMIN_SECRET in your .env.local file to enable admin functions.
 */
function verifyAdminAccess(providedSecret?: string): { authorized: boolean; error?: string } {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return {
      authorized: false,
      error: "Admin functions are disabled. Set ADMIN_SECRET environment variable to enable.",
    };
  }

  // SECURITY FIX: Verify caller provides correct secret
  if (!providedSecret || providedSecret !== adminSecret) {
    return {
      authorized: false,
      error: "Invalid admin secret provided.",
    };
  }

  // In production, this should also verify:
  // 1. User session/authentication
  // 2. User has admin role in database
  // 3. Optional: Require re-authentication for destructive operations

  return { authorized: true };
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface TableRow {
  table_name: string;
}

interface GameStatsRow {
  total: number;
  active: number;
  completed: number;
}

interface CountRow {
  count: number;
  total?: number;
}

// Database query result can be either an array or an object with rows property
type DbQueryResult<T = unknown> = T[] | { rows: T[] };

// =============================================================================
// SECURITY: Table Name Allowlist for Truncation
// =============================================================================

/**
 * Type-safe mapping of allowed table names to their Drizzle schema objects.
 * This ensures only these specific tables can be truncated, preventing
 * any SQL injection even if this code is modified in the future.
 *
 * SECURITY: This is a compile-time constant. Adding new tables requires
 * explicit code changes and review.
 */
const ALLOWED_TRUNCATE_TABLES = {
  // Child tables first (have foreign keys to other tables)
  bot_memories: botMemories,
  bot_emotional_states: botEmotionalStates,
  bot_tells: botTells,
  attacks: attacks,
  combat_logs: combatLogs,
  messages: messages,
  treaties: treaties,
  build_queue: buildQueue,
  reputation_log: reputationLog,
  unit_upgrades: unitUpgrades,
  research_branch_allocations: researchBranchAllocations,
  resource_inventory: resourceInventory,
  crafting_queue: craftingQueue,
  research_progress: researchProgress,
  market_orders: marketOrders,
  sectors: sectors,
  civil_status_history: civilStatusHistory,
  game_saves: gameSaves,
  game_sessions: gameSessions,
  game_configs: gameConfigs,
  galaxy_regions: galaxyRegions,
  region_connections: regionConnections,
  empire_influence: empireInfluence,
  llm_usage_logs: llmUsageLogs,
  llm_decision_cache: llmDecisionCache,
  syndicate_trust: syndicateTrust,
  syndicate_contracts: syndicateContracts,
  pirate_missions: pirateMissions,
  coalition_members: coalitionMembers,
  // Then parent tables
  empires: empires,
  market_prices: marketPrices,
  galactic_events: galacticEvents,
  coalitions: coalitions,
  performance_logs: performanceLogs,
  games: games, // Games last since everything references it
} as const;

type AllowedTableName = keyof typeof ALLOWED_TRUNCATE_TABLES;

/**
 * Validates that a table name is in the allowlist and returns the Drizzle table object.
 * Returns null if the table name is not allowed.
 */
function getValidatedTable(tableName: string): PgTable | null {
  if (tableName in ALLOWED_TRUNCATE_TABLES) {
    return ALLOWED_TRUNCATE_TABLES[tableName as AllowedTableName];
  }
  return null;
}

/**
 * Creates a safe SQL identifier for table names using Drizzle's sql.identifier().
 * This is an additional safety layer even though we validate against the allowlist.
 */
function safeTruncateTable(tableName: AllowedTableName): SQL {
  // Double-safety: validate again even though caller should have validated
  if (!(tableName in ALLOWED_TRUNCATE_TABLES)) {
    throw new Error(`Table "${tableName}" is not in the allowed truncate list`);
  }
  // Use sql.identifier() for proper escaping of the table name
  return sql`TRUNCATE TABLE ${sql.identifier(tableName)} CASCADE`;
}

/**
 * Creates a safe DELETE statement using the Drizzle table object directly.
 * This uses schema-based approach instead of raw SQL.
 */
async function safeDeleteFromTable(tableName: AllowedTableName): Promise<void> {
  const table = ALLOWED_TRUNCATE_TABLES[tableName];
  if (!table) {
    throw new Error(`Table "${tableName}" is not in the allowed truncate list`);
  }
  // Use Drizzle's schema-based delete which is completely safe
  await db.delete(table);
}

/**
 * Safely counts rows in a table using the Drizzle table object.
 */
async function safeCountTable(tableName: AllowedTableName): Promise<number> {
  const table = ALLOWED_TRUNCATE_TABLES[tableName];
  if (!table) {
    throw new Error(`Table "${tableName}" is not in the allowed truncate list`);
  }
  // Use Drizzle's schema-based select which is completely safe
  const result = await db.select({ count: sql<number>`count(*)` }).from(table);
  return Number(result[0]?.count ?? 0);
}

// =============================================================================
// ADMIN ACTIONS
// =============================================================================

/**
 * Check which tables actually exist in the database.
 * Useful for diagnosing migration issues.
 */
export async function checkDatabaseTablesAction(adminSecret: string): Promise<{
  success: boolean;
  tables?: string[];
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("Check tables result:", JSON.stringify(result, null, 2));

    // Handle different possible result formats
    let rows: TableRow[] = [];
    const typedResult = result as unknown as DbQueryResult<TableRow>;
    if (Array.isArray(typedResult)) {
      rows = typedResult;
    } else if ('rows' in typedResult && Array.isArray(typedResult.rows)) {
      rows = typedResult.rows;
    }

    const tables = rows.map((row) => row.table_name);

    return {
      success: true,
      tables,
    };
  } catch (error) {
    console.error("Failed to check database tables:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clean up old games to free up database space.
 * Deletes games that are:
 * - Completed or abandoned
 * - OR older than 7 days and inactive
 *
 * Due to cascade deletes, this also removes all related:
 * - empires, sectors, attacks, combat logs
 * - messages, treaties, bot memories
 * - market orders, research progress, etc.
 */
export async function cleanupOldGamesAction(adminSecret: string): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, deletedCount: 0, error: authCheck.error };
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find games to delete
    const gamesToDelete = await db.query.games.findMany({
      where: or(
        // Completed or abandoned games
        eq(games.status, "completed"),
        eq(games.status, "abandoned"),
        // Old inactive games (setup status and older than 7 days)
        and(eq(games.status, "setup"), lt(games.createdAt, sevenDaysAgo)),
        // Old active games (older than 7 days with no recent activity)
        and(lt(games.updatedAt, sevenDaysAgo))
      ),
      columns: { id: true, name: true, status: true },
    });

    if (gamesToDelete.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Delete games (cascade will handle related records)
    for (const game of gamesToDelete) {
      await db.delete(games).where(eq(games.id, game.id));
    }

    return {
      success: true,
      deletedCount: gamesToDelete.length,
    };
  } catch (error) {
    console.error("Failed to cleanup old games:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get detailed database storage statistics.
 */
export async function getDatabaseStatsAction(adminSecret: string): Promise<{
  success: boolean;
  stats?: {
    gameCount: number;
    empireCount: number;
    activeGames: number;
    completedGames: number;
    sectorCount: number;
    memoryCount: number;
    messageCount: number;
    attackCount: number;
    combatLogCount: number;
  };
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Helper to safely get count from result
    const getCount = (result: DbQueryResult<CountRow>): number => {
      if (!result) return 0;
      // Try rows array first
      if (Array.isArray(result)) {
        return Number(result[0]?.total ?? 0);
      }
      if ('rows' in result && Array.isArray(result.rows)) {
        return Number(result.rows[0]?.total ?? 0);
      }
      return 0;
    };

    const getGameStats = (result: DbQueryResult<GameStatsRow>): GameStatsRow => {
      if (!result) return { total: 0, active: 0, completed: 0 };
      // Try rows array first
      if (Array.isArray(result)) {
        return result[0] ?? { total: 0, active: 0, completed: 0 };
      }
      if ('rows' in result && Array.isArray(result.rows)) {
        return result.rows[0] ?? { total: 0, active: 0, completed: 0 };
      }
      return { total: 0, active: 0, completed: 0 };
    };

    // Use raw SQL to be more resilient to missing tables
    const gameStatsResult = await db.execute(sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'active')::int as active,
        COUNT(*) FILTER (WHERE status = 'completed')::int as completed
      FROM games
    `);
    const gameStats = getGameStats(gameStatsResult as unknown as DbQueryResult<GameStatsRow>);

    const empireStatsResult = await db.execute(sql`SELECT COUNT(*)::int as total FROM empires`) as unknown as DbQueryResult<CountRow>;
    const sectorStatsResult = await db.execute(sql`SELECT COUNT(*)::int as total FROM sectors`) as unknown as DbQueryResult<CountRow>;
    const memoryStatsResult = await db.execute(sql`SELECT COUNT(*)::int as total FROM bot_memories`) as unknown as DbQueryResult<CountRow>;
    const messageStatsResult = await db.execute(sql`SELECT COUNT(*)::int as total FROM messages`) as unknown as DbQueryResult<CountRow>;
    const attackStatsResult = await db.execute(sql`SELECT COUNT(*)::int as total FROM attacks`) as unknown as DbQueryResult<CountRow>;
    const combatLogStatsResult = await db.execute(sql`SELECT COUNT(*)::int as total FROM combat_logs`) as unknown as DbQueryResult<CountRow>;

    return {
      success: true,
      stats: {
        gameCount: Number(gameStats?.total ?? 0),
        empireCount: getCount(empireStatsResult),
        activeGames: Number(gameStats?.active ?? 0),
        completedGames: Number(gameStats?.completed ?? 0),
        sectorCount: getCount(sectorStatsResult),
        memoryCount: getCount(memoryStatsResult),
        messageCount: getCount(messageStatsResult),
        attackCount: getCount(attackStatsResult),
        combatLogCount: getCount(combatLogStatsResult),
      },
    };
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete ALL games using TRUNCATE CASCADE for efficiency.
 * WARNING: This deletes everything instantly!
 */
export async function deleteAllGamesAction(adminSecret: string): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, deletedCount: 0, error: authCheck.error };
  }

  try {
    // Count games before deletion
    const countResult = await db.execute(sql`SELECT COUNT(*)::int as count FROM games`) as unknown as DbQueryResult<CountRow>;
    const gameCount = Array.isArray(countResult)
      ? Number((countResult[0])?.count ?? 0)
      : Number((countResult.rows[0])?.count ?? 0);

    console.log("Games before truncate:", gameCount);

    // Use raw SQL TRUNCATE CASCADE for efficiency
    await db.execute(sql`TRUNCATE games CASCADE`);
    console.log("TRUNCATE games CASCADE executed");

    // Also clean up performance logs
    await db.execute(sql`TRUNCATE performance_logs CASCADE`);
    console.log("TRUNCATE performance_logs CASCADE executed");

    // Verify it worked
    const verifyResult = await db.execute(sql`SELECT COUNT(*)::int as count FROM games`) as unknown as DbQueryResult<CountRow>;
    const remainingGames = Array.isArray(verifyResult)
      ? Number((verifyResult[0])?.count ?? 0)
      : Number((verifyResult.rows[0])?.count ?? 0);

    console.log("Games after truncate:", remainingGames);

    if (remainingGames > 0) {
      return {
        success: false,
        deletedCount: 0,
        error: `TRUNCATE failed! Still ${remainingGames} games in database.`,
      };
    }

    return {
      success: true,
      deletedCount: gameCount,
    };
  } catch (error) {
    console.error("Failed to delete all games:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Nuclear option: TRUNCATE all major tables individually.
 * Use this if CASCADE isn't working as expected.
 *
 * SECURITY: This function uses a strict allowlist of table names.
 * - Table names are validated against ALLOWED_TRUNCATE_TABLES constant
 * - sql.identifier() is used for safe SQL construction
 * - Drizzle schema-based operations are used where possible
 * - No user input is ever interpolated into SQL queries
 */
export async function truncateAllTablesAction(adminSecret: string): Promise<{
  success: boolean;
  tablesCleared: string[];
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, tablesCleared: [], error: authCheck.error };
  }

  try {
    // Order matters! Truncate child tables before parents to avoid FK constraint issues
    // SECURITY: These are validated against ALLOWED_TRUNCATE_TABLES constant
    const tablesToTruncate: AllowedTableName[] = [
      // Child tables first (have foreign keys to other tables)
      "bot_memories",
      "bot_emotional_states",
      "bot_tells",
      "attacks",
      "combat_logs",
      "messages",
      "treaties",
      "build_queue",
      "reputation_log",
      "unit_upgrades",
      "research_branch_allocations",
      "resource_inventory",
      "crafting_queue",
      "research_progress",
      "market_orders",
      "sectors",
      "civil_status_history",
      "game_saves",
      "game_sessions",
      "game_configs",
      "galaxy_regions",
      "region_connections",
      "empire_influence",
      "llm_usage_logs",
      "llm_decision_cache",
      "syndicate_trust",
      "syndicate_contracts",
      "pirate_missions",
      "coalition_members",
      // Then parent tables
      "empires",
      "market_prices",
      "galactic_events",
      "coalitions",
      "performance_logs",
      "games", // Games last since everything references it
    ];

    const succeeded: string[] = [];
    const failed: string[] = [];

    console.log("Starting nuclear cleanup - truncating all tables...");

    for (const tableName of tablesToTruncate) {
      // Validate table name against allowlist (compile-time type check + runtime validation)
      const table = getValidatedTable(tableName);
      if (!table) {
        console.error(`SECURITY: Table "${tableName}" rejected - not in allowlist`);
        failed.push(tableName);
        continue;
      }

      try {
        console.log(`Truncating ${tableName}...`);

        // Try TRUNCATE first using safe SQL construction
        try {
          await db.execute(safeTruncateTable(tableName));
        } catch (truncateErr) {
          console.warn(`TRUNCATE failed for ${tableName}, trying DELETE...`, truncateErr);
          // If TRUNCATE fails, use schema-based DELETE (completely safe)
          await safeDeleteFromTable(tableName);
        }

        // Verify it worked using schema-based count (completely safe)
        const count = await safeCountTable(tableName);

        if (count === 0) {
          console.log(`[OK] ${tableName} cleared`);
          succeeded.push(tableName);
        } else {
          console.warn(`[WARN] ${tableName} still has ${count} rows after cleanup`);
          failed.push(tableName);
        }
      } catch (err) {
        console.error(`Failed to clear ${tableName}:`, err);
        failed.push(tableName);
      }
    }

    if (failed.length > 0) {
      return {
        success: false,
        tablesCleared: succeeded,
        error: `Failed to clear ${failed.length} tables: ${failed.join(", ")}. Check console logs.`,
      };
    }

    console.log(`[OK] Successfully cleared all ${succeeded.length} tables`);
    return {
      success: true,
      tablesCleared: succeeded,
    };
  } catch (error) {
    console.error("Failed to truncate all tables:", error);
    return {
      success: false,
      tablesCleared: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Prune bot memories to free up space without deleting games.
 * Useful when the memory table is the main bloat.
 */
export async function pruneAllMemoriesAction(adminSecret: string): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, deletedCount: 0, error: authCheck.error };
  }

  try {
    // Count memories before deletion
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(botMemories);
    const memoryCount = Number(countResult?.count ?? 0);

    // Delete all non-permanent-scar memories
    await db.execute(
      sql`DELETE FROM bot_memories WHERE is_permanent_scar = false`
    );

    // Count remaining
    const [afterCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(botMemories);
    const remaining = Number(afterCount?.count ?? 0);

    return {
      success: true,
      deletedCount: memoryCount - remaining,
    };
  } catch (error) {
    console.error("Failed to prune memories:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Prune performance logs older than 24 hours.
 */
export async function prunePerformanceLogsAction(adminSecret: string): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  const authCheck = verifyAdminAccess(adminSecret);
  if (!authCheck.authorized) {
    return { success: false, deletedCount: 0, error: authCheck.error };
  }

  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Count logs before deletion
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(performanceLogs);
    const totalCount = Number(countResult?.count ?? 0);

    // Delete old logs
    await db
      .delete(performanceLogs)
      .where(lt(performanceLogs.createdAt, oneDayAgo));

    // Count remaining
    const [afterCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(performanceLogs);
    const remaining = Number(afterCount?.count ?? 0);

    return {
      success: true,
      deletedCount: totalCount - remaining,
    };
  } catch (error) {
    console.error("Failed to prune performance logs:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
