/**
 * Rate Limiter for Server Actions
 *
 * Simple in-memory rate limiting to prevent abuse.
 * Uses sliding window algorithm for smooth rate limiting.
 *
 * SCALING LIMITATIONS:
 *
 * This in-memory implementation has the following limitations for production use:
 *
 * 1. **Single Server Only**: Rate limits are not shared across multiple server instances.
 *    Each server process maintains its own independent rate limit state.
 *
 * 2. **Memory Consumption**: All rate limit data is stored in memory. For high-traffic
 *    applications with many users, this can consume significant RAM.
 *
 * 3. **No Persistence**: Rate limit data is lost on server restart. Users could bypass
 *    limits by triggering server restarts.
 *
 * 4. **Process Restart**: Node.js process restarts (deployments, crashes) reset all limits.
 *
 * PRODUCTION RECOMMENDATIONS:
 *
 * For production deployments with:
 * - Multiple server instances (horizontal scaling)
 * - High traffic volumes (>1000 requests/minute)
 * - Strict rate limiting requirements
 *
 * Replace with a distributed rate limiter using:
 * - **Redis** (recommended): Fast, distributed, persistent
 * - **Memcached**: Similar to Redis, but less feature-rich
 * - **Database**: Slower, but works for low-traffic apps
 *
 * Libraries to consider:
 * - `rate-limiter-flexible` (supports Redis, Memcached, PostgreSQL)
 * - `ioredis` + custom implementation
 * - Cloudflare Rate Limiting (if using Cloudflare)
 */

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitEntry {
  timestamps: number[];
  blocked: boolean;
  blockedUntil?: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Block duration in milliseconds when limit exceeded */
  blockDurationMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  blockedUntil?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default configurations for different action types
 */
export const RATE_LIMIT_CONFIGS = {
  /** Standard game actions (turns, builds, etc.) */
  GAME_ACTION: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
  /** Combat actions (attacks) */
  COMBAT_ACTION: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 2 * 60 * 1000, // 2 minute block
  },
  /** Auth-like actions (start game, resume) */
  AUTH_ACTION: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minute block
  },
  /** Market transactions */
  MARKET_ACTION: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
  /** Message/diplomacy actions */
  DIPLOMACY_ACTION: {
    maxRequests: 15,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
} as const;

// =============================================================================
// IN-MEMORY STORE
// =============================================================================

/**
 * In-memory store for rate limit entries.
 * Key format: `${actionType}:${identifier}`
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval - remove stale entries every 5 minutes
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupIntervalId) return;

  cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    const staleThreshold = now - 10 * 60 * 1000; // 10 minutes

    for (const [key, entry] of Array.from(rateLimitStore)) {
      // Remove if blocked period expired and no recent requests
      if (entry.blockedUntil && entry.blockedUntil < now) {
        entry.blocked = false;
        entry.blockedUntil = undefined;
      }

      // Remove if no requests in last 10 minutes
      const recentTimestamps = entry.timestamps.filter(
        (ts: number) => ts > staleThreshold
      );
      if (recentTimestamps.length === 0 && !entry.blocked) {
        rateLimitStore.delete(key);
      } else {
        entry.timestamps = recentTimestamps;
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

// Start cleanup on module load
startCleanup();

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Check rate limit for a given identifier and action type.
 *
 * @param identifier - Unique identifier (e.g., empireId, IP address)
 * @param actionType - Type of action being performed
 * @param config - Rate limit configuration (uses defaults if not provided)
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  actionType: keyof typeof RATE_LIMIT_CONFIGS,
  config?: Partial<RateLimitConfig>
): RateLimitResult {
  const now = Date.now();
  const key = `${actionType}:${identifier}`;

  const effectiveConfig = {
    ...RATE_LIMIT_CONFIGS[actionType],
    ...config,
  };

  // Get or create entry
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [], blocked: false };
    rateLimitStore.set(key, entry);
  }

  // Check if currently blocked
  if (entry.blocked && entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
    };
  }

  // Clear block if expired
  if (entry.blocked && entry.blockedUntil && entry.blockedUntil <= now) {
    entry.blocked = false;
    entry.blockedUntil = undefined;
    entry.timestamps = [];
  }

  // Filter to timestamps within window
  const windowStart = now - effectiveConfig.windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (entry.timestamps.length >= effectiveConfig.maxRequests) {
    // Block the user
    entry.blocked = true;
    entry.blockedUntil = now + effectiveConfig.blockDurationMs;

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
    };
  }

  // Add current request
  entry.timestamps.push(now);

  // Calculate reset time (when oldest request falls out of window)
  const oldestTimestamp = entry.timestamps[0] ?? now;
  const resetAt = oldestTimestamp + effectiveConfig.windowMs;

  return {
    allowed: true,
    remaining: effectiveConfig.maxRequests - entry.timestamps.length,
    resetAt,
  };
}

/**
 * Wrapper function for rate-limited server actions.
 * Throws an error if rate limit is exceeded.
 *
 * @param identifier - Unique identifier
 * @param actionType - Type of action
 * @param action - Async function to execute if allowed
 * @returns Result of the action
 * @throws Error if rate limited
 */
export async function withRateLimit<T>(
  identifier: string,
  actionType: keyof typeof RATE_LIMIT_CONFIGS,
  action: () => Promise<T>
): Promise<T> {
  const result = checkRateLimit(identifier, actionType);

  if (!result.allowed) {
    const waitSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new RateLimitError(
      `Rate limit exceeded. Please wait ${waitSeconds} seconds before trying again.`,
      result.resetAt
    );
  }

  return action();
}

/**
 * Rate limit error with reset time
 */
export class RateLimitError extends Error {
  public readonly resetAt: number;

  constructor(message: string, resetAt: number) {
    super(message);
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
}

/**
 * Get current rate limit status without consuming a request
 */
export function getRateLimitStatus(
  identifier: string,
  actionType: keyof typeof RATE_LIMIT_CONFIGS
): { remaining: number; blocked: boolean; blockedUntil?: number } {
  const key = `${actionType}:${identifier}`;
  const entry = rateLimitStore.get(key);
  const config = RATE_LIMIT_CONFIGS[actionType];

  if (!entry) {
    return { remaining: config.maxRequests, blocked: false };
  }

  const now = Date.now();

  if (entry.blocked && entry.blockedUntil && entry.blockedUntil > now) {
    return { remaining: 0, blocked: true, blockedUntil: entry.blockedUntil };
  }

  const windowStart = now - config.windowMs;
  const recentCount = entry.timestamps.filter((ts) => ts > windowStart).length;

  return {
    remaining: Math.max(0, config.maxRequests - recentCount),
    blocked: false,
  };
}

/**
 * Clear rate limit for a specific identifier (for testing/admin)
 */
export function clearRateLimit(
  identifier: string,
  actionType: keyof typeof RATE_LIMIT_CONFIGS
): void {
  const key = `${actionType}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
