/**
 * Action Wrapper
 *
 * Higher-order function for creating standardized server actions.
 * Provides consistent session handling, rate limiting, authorization,
 * and error handling across all server actions.
 *
 * Migration Strategy: INCREMENTAL
 * - Existing actions continue to work
 * - Migrate each action when building its React Query hook
 * - Use normalizeActionResult() in the API client to wrap legacy responses
 */

import { getGameSession, getRateLimitIdentifier } from "@/lib/session";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/security/rate-limiter";
import { verifyEmpireOwnership } from "@/lib/security/validation";
import type { ActionResult, ErrorCode } from "./types";

// =============================================================================
// CONTEXT TYPES
// =============================================================================

/**
 * Session data available to action handlers.
 */
export interface ActionSession {
  gameId: string;
  empireId: string;
}

/**
 * Context passed to action handlers.
 */
export interface ActionContext {
  session: ActionSession;
}

/**
 * Options for configuring action behavior.
 */
export interface ActionOptions {
  /**
   * Whether the action requires an active game session.
   * @default true
   */
  requireSession?: boolean;

  /**
   * Whether to verify empire ownership.
   * @default true
   */
  verifyOwnership?: boolean;

  /**
   * Rate limit category for this action.
   * Set to null to disable rate limiting.
   * @default "GAME_ACTION"
   */
  rateLimit?: keyof typeof RATE_LIMIT_CONFIGS | null;

  /**
   * Custom rate limit configuration.
   */
  rateLimitConfig?: {
    maxRequests?: number;
    windowMs?: number;
    blockDurationMs?: number;
  };
}

// =============================================================================
// ERROR HELPERS
// =============================================================================

/**
 * Create a standardized error result.
 */
function createError<T>(error: string, code?: ErrorCode): ActionResult<T> {
  return { success: false, error, code };
}

/**
 * Create a standardized success result.
 */
function createSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Map common errors to error codes.
 */
function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit")) return "RATE_LIMITED";
    if (msg.includes("not found")) return "GAME_NOT_FOUND";
    if (msg.includes("unauthorized")) return "UNAUTHORIZED";
    if (msg.includes("insufficient")) return "INSUFFICIENT_CREDITS";
  }
  return "INTERNAL_ERROR";
}

// =============================================================================
// ACTION WRAPPER
// =============================================================================

/**
 * Create a standardized server action with automatic session, auth, and rate limiting.
 *
 * @example
 * // Define an action
 * export const myAction = createAction(
 *   async (input: { quantity: number }, ctx) => {
 *     // ctx.session.gameId and ctx.session.empireId are available
 *     const result = await doSomething(input.quantity, ctx.session.empireId);
 *     return result;
 *   },
 *   { rateLimit: "GAME_ACTION" }
 * );
 *
 * // Call the action
 * const result = await myAction({ quantity: 10 });
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
export function createAction<TInput, TOutput>(
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
  options: ActionOptions = {}
): (input: TInput) => Promise<ActionResult<TOutput>> {
  const {
    requireSession = true,
    verifyOwnership = true,
    rateLimit = "GAME_ACTION",
  } = options;

  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // Step 1: Get session if required
      let session: ActionSession | undefined;

      if (requireSession) {
        const { gameId, empireId } = await getGameSession();

        if (!gameId || !empireId) {
          return createError("No active game session", "NO_SESSION");
        }

        session = { gameId, empireId };
      }

      // Step 2: Check rate limit if enabled
      if (rateLimit !== null) {
        const identifier = await getRateLimitIdentifier();
        const rateLimitResult = checkRateLimit(
          identifier,
          rateLimit,
          options.rateLimitConfig
        );

        if (!rateLimitResult.allowed) {
          const waitSeconds = Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000
          );
          return createError(
            `Rate limit exceeded. Please wait ${waitSeconds} seconds.`,
            "RATE_LIMITED"
          );
        }
      }

      // Step 3: Verify empire ownership if required
      if (requireSession && verifyOwnership && session) {
        const ownership = await verifyEmpireOwnership(
          session.empireId,
          session.gameId
        );

        if (!ownership.valid) {
          const code = ownership.error?.includes("eliminated")
            ? "EMPIRE_ELIMINATED"
            : ownership.error?.includes("not found")
            ? "EMPIRE_NOT_FOUND"
            : "UNAUTHORIZED";

          return createError(ownership.error ?? "Authorization failed", code);
        }
      }

      // Step 4: Execute the handler
      const ctx: ActionContext = { session: session! };
      const data = await handler(input, ctx);

      return createSuccess(data);
    } catch (error) {
      // Log the error for debugging (but don't expose details to client)
      console.error("[Action Error]", error);

      // Return a safe error message
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred";

      return createError(message, getErrorCode(error));
    }
  };
}

/**
 * Create a query action that returns null on failure.
 * Used for read-only operations where null is an acceptable response.
 *
 * @example
 * export const getStatus = createQueryAction(async (_, ctx) => {
 *   return await fetchStatus(ctx.session.gameId);
 * });
 */
export function createQueryAction<TInput, TOutput>(
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
  options: ActionOptions = {}
): (input: TInput) => Promise<TOutput | null> {
  const action = createAction(handler, options);

  return async (input: TInput): Promise<TOutput | null> => {
    const result = await action(input);
    return result.success ? result.data : null;
  };
}

/**
 * Create an action that doesn't require a session.
 * Useful for public actions like game creation.
 *
 * @example
 * export const createGame = createPublicAction(async (input) => {
 *   return await startNewGame(input);
 * });
 */
export function createPublicAction<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>,
  options: Omit<ActionOptions, "requireSession" | "verifyOwnership"> = {}
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return createAction(
    (input) => handler(input),
    {
      ...options,
      requireSession: false,
      verifyOwnership: false,
    }
  );
}

// =============================================================================
// LEGACY NORMALIZATION
// =============================================================================

/**
 * Normalize a legacy action response to the standard ActionResult format.
 * Used by the API client to wrap responses from actions that haven't been migrated yet.
 *
 * Handles both patterns:
 * - { success: true, data: T }
 * - { success: true, ...fields }
 * - { success: false, error: string }
 * - Null/undefined (query failures)
 *
 * @example
 * const legacyResult = await someLegacyAction();
 * const normalized = normalizeActionResult<MyDataType>(legacyResult);
 */
export function normalizeActionResult<T>(result: unknown): ActionResult<T> {
  // Handle null/undefined
  if (result === null || result === undefined) {
    return createError("Action returned no data", "INTERNAL_ERROR");
  }

  // Handle non-object results (direct data return)
  if (typeof result !== "object") {
    return createSuccess(result as T);
  }

  const obj = result as Record<string, unknown>;

  // Handle explicit success/error format
  if ("success" in obj) {
    if (obj.success === false) {
      return createError(
        (obj.error as string) || "Unknown error",
        (obj.code as ErrorCode) || "UNKNOWN"
      );
    }

    // Success case
    if (obj.success === true) {
      // Check for nested data property
      if ("data" in obj) {
        return createSuccess(obj.data as T);
      }

      // No nested data - extract all fields except success
      const { success: _, ...data } = obj;
      return createSuccess(data as T);
    }
  }

  // No success field - treat entire object as data
  return createSuccess(result as T);
}

/**
 * Extract error message from a normalized result.
 * Returns undefined if the result is successful.
 */
export function getErrorMessage<T>(result: ActionResult<T>): string | undefined {
  if (result.success) {
    return undefined;
  }
  return result.error;
}

/**
 * Extract data from a successful result.
 * Throws if the result is an error.
 */
export function requireSuccess<T>(result: ActionResult<T>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
}
