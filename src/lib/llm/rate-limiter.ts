/**
 * M12: LLM Rate Limiter
 *
 * In-memory rate limiting for LLM API calls.
 * Enforces per-game, per-turn, and per-hour limits.
 */

import {
  type RateLimitState,
  checkRateLimits,
  createInitialRateLimitState,
  updateRateLimitState,
  resetTurnCounters,
} from "./constants";

// In-memory rate limit state per game
const rateLimitStates = new Map<string, RateLimitState>();

/**
 * Get or create rate limit state for a game.
 */
export function getRateLimitState(gameId: string): RateLimitState {
  let state = rateLimitStates.get(gameId);
  if (!state) {
    state = createInitialRateLimitState();
    rateLimitStates.set(gameId, state);
  }
  return state;
}

/**
 * Check if an LLM call is allowed for a game.
 */
export function isCallAllowed(
  gameId: string,
  estimatedCost: number = 0
): { allowed: boolean; reason?: string } {
  const state = getRateLimitState(gameId);
  return checkRateLimits(state, estimatedCost);
}

/**
 * Record an LLM call and update rate limit state.
 */
export function recordCall(gameId: string, cost: number): void {
  const state = getRateLimitState(gameId);
  const updated = updateRateLimitState(state, cost);
  rateLimitStates.set(gameId, updated);
}

/**
 * Reset turn-specific counters for a game.
 */
export function resetTurnLimits(gameId: string): void {
  const state = getRateLimitState(gameId);
  const updated = resetTurnCounters(state);
  rateLimitStates.set(gameId, updated);
}

/**
 * Clear all rate limit state (for testing).
 */
export function clearAllRateLimits(): void {
  rateLimitStates.clear();
}
