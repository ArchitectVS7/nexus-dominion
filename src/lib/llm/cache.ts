/**
 * M12: LLM Decision Cache Service
 *
 * Manages caching of pre-computed LLM decisions for instant turn processing.
 * Decisions are computed in the background during the player's turn and
 * retrieved when bot turns execute.
 */

import { db } from "@/lib/db";
import { llmDecisionCache } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import type { BotDecision } from "@/lib/bots/types";
import type { LlmProvider } from "./constants";

// ============================================
// TYPES
// ============================================

export interface CachedDecision {
  decision: BotDecision;
  reasoning: string;
  message: string;
  provider: LlmProvider;
  model: string;
  tokensUsed: number;
  costUsd: number;
  cachedAt: Date;
}

export interface SaveCacheParams {
  gameId: string;
  empireId: string;
  forTurn: number;
  decision: BotDecision;
  reasoning: string;
  message: string;
  provider: LlmProvider;
  model: string;
  tokensUsed: number;
  costUsd: number;
}

// ============================================
// CACHE OPERATIONS
// ============================================

/**
 * Save a pre-computed decision to the cache.
 *
 * @param params - Cache entry parameters
 * @returns The saved cache entry ID
 */
export async function saveCachedDecision(params: SaveCacheParams): Promise<string> {
  const {
    gameId,
    empireId,
    forTurn,
    decision,
    reasoning,
    message,
    provider,
    model,
    tokensUsed,
    costUsd,
  } = params;

  try {
    // Delete existing cache entry for this bot/turn (if any)
    await db
      .delete(llmDecisionCache)
      .where(
        and(
          eq(llmDecisionCache.gameId, gameId),
          eq(llmDecisionCache.empireId, empireId),
          eq(llmDecisionCache.forTurn, forTurn)
        )
      );

    // Insert new cache entry
    const [cached] = await db
      .insert(llmDecisionCache)
      .values({
        gameId,
        empireId,
        forTurn,
        decisionJson: decision as unknown, // JSON field
        reasoning,
        message,
        provider,
        model,
        tokensUsed,
        costUsd: costUsd.toString(),
      })
      .returning({ id: llmDecisionCache.id });

    if (!cached) {
      throw new Error("Failed to save cached decision");
    }

    return cached.id;
  } catch (error) {
    console.error("Failed to save cached decision:", error);
    throw error;
  }
}

/**
 * Retrieve a cached decision for a specific bot and turn.
 *
 * @param gameId - The game ID
 * @param empireId - The bot empire ID
 * @param forTurn - The turn number this decision is for
 * @returns Cached decision or null if not found
 */
export async function getCachedDecision(
  gameId: string,
  empireId: string,
  forTurn: number
): Promise<CachedDecision | null> {
  try {
    const cached = await db.query.llmDecisionCache.findFirst({
      where: and(
        eq(llmDecisionCache.gameId, gameId),
        eq(llmDecisionCache.empireId, empireId),
        eq(llmDecisionCache.forTurn, forTurn)
      ),
    });

    if (!cached) {
      return null;
    }

    return {
      decision: cached.decisionJson as unknown as BotDecision,
      reasoning: cached.reasoning ?? "",
      message: cached.message ?? "",
      provider: cached.provider,
      model: cached.model,
      tokensUsed: cached.tokensUsed,
      costUsd: parseFloat(cached.costUsd),
      cachedAt: cached.cachedAt,
    };
  } catch (error) {
    console.error("Failed to retrieve cached decision:", error);
    return null;
  }
}

/**
 * Check if a cached decision exists for a bot/turn.
 *
 * @param gameId - The game ID
 * @param empireId - The bot empire ID
 * @param forTurn - The turn number
 * @returns True if cache exists
 */
export async function hasCachedDecision(
  gameId: string,
  empireId: string,
  forTurn: number
): Promise<boolean> {
  const cached = await getCachedDecision(gameId, empireId, forTurn);
  return cached !== null;
}

/**
 * Invalidate (delete) cached decisions for a specific game and turn.
 * Used when game state changes unexpectedly (e.g., major event).
 *
 * @param gameId - The game ID
 * @param forTurn - The turn to invalidate
 * @returns Number of entries deleted
 */
export async function invalidateCache(
  gameId: string,
  forTurn: number
): Promise<number> {
  try {
    const result = await db
      .delete(llmDecisionCache)
      .where(
        and(
          eq(llmDecisionCache.gameId, gameId),
          eq(llmDecisionCache.forTurn, forTurn)
        )
      )
      .returning({ id: llmDecisionCache.id });

    console.log(`Invalidated ${result.length} cached decisions for turn ${forTurn}`);
    return result.length;
  } catch (error) {
    console.error("Failed to invalidate cache:", error);
    return 0;
  }
}

/**
 * Clean up old cached decisions for completed turns.
 * Keeps cache table size manageable by removing entries for turns
 * that have already been processed.
 *
 * @param gameId - The game ID
 * @param currentTurn - The current turn
 * @returns Number of entries deleted
 */
export async function cleanOldCache(
  gameId: string,
  currentTurn: number
): Promise<number> {
  try {
    // Delete cache entries for turns older than current - 1
    // (keep current turn cache in case of rollback/replay)
    const result = await db
      .delete(llmDecisionCache)
      .where(
        and(
          eq(llmDecisionCache.gameId, gameId),
          lt(llmDecisionCache.forTurn, currentTurn - 1)
        )
      )
      .returning({ id: llmDecisionCache.id });

    const deleted = result.length;
    if (deleted > 0) {
      console.log(`Cleaned ${deleted} old cached decisions for game ${gameId}`);
    }

    return deleted;
  } catch (error) {
    console.error("Failed to clean old cache:", error);
    return 0;
  }
}

/**
 * Get cache statistics for a game.
 *
 * @param gameId - The game ID
 * @returns Cache stats
 */
export async function getCacheStats(
  gameId: string
): Promise<{
  totalCached: number;
  totalCost: number;
  totalTokens: number;
  providerBreakdown: Record<string, number>;
}> {
  try {
    const cached = await db
      .select()
      .from(llmDecisionCache)
      .where(eq(llmDecisionCache.gameId, gameId));

    const stats = {
      totalCached: cached.length,
      totalCost: 0,
      totalTokens: 0,
      providerBreakdown: {} as Record<string, number>,
    };

    for (const entry of cached) {
      stats.totalCost += parseFloat(entry.costUsd);
      stats.totalTokens += entry.tokensUsed;
      stats.providerBreakdown[entry.provider] =
        (stats.providerBreakdown[entry.provider] ?? 0) + 1;
    }

    return stats;
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return {
      totalCached: 0,
      totalCost: 0,
      totalTokens: 0,
      providerBreakdown: {},
    };
  }
}
