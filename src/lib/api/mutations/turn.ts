"use client";

/**
 * Turn Mutations
 *
 * React Query mutation hooks for turn-related actions.
 * Handles optimistic updates, error rollback, and cache invalidation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gameKeys, empireKeys } from "../query-keys";
import type { TurnEvent, ResourceDelta, DefeatAnalysis } from "@/lib/game/types/turn-types";

// Import server actions and their types
import {
  endTurnAction,
  endTurnEnhancedAction,
  type EnhancedTurnResult as ServerEnhancedTurnResult,
} from "@/app/actions/turn-actions";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Result from end turn action
 */
export interface EndTurnResult {
  turn: number;
  processingMs: number;
  events: TurnEvent[];
}

/**
 * Enhanced turn result with full resource deltas
 * Maps from server action result to client-friendly format
 */
export interface EnhancedTurnResult {
  turn: number;
  processingMs: number;
  events: TurnEvent[];
  resourceChanges: ResourceDelta;
  populationBefore: number;
  populationAfter: number;
  messagesReceived: number;
  botBattles: number;
  empiresEliminated: string[];
  defeatAnalysis?: DefeatAnalysis;
  victoryResult?: {
    type: string;
    message: string;
  };
}

/**
 * Options for the end turn mutation
 */
export interface EndTurnOptions {
  /** Called when turn processing succeeds */
  onSuccess?: (result: EndTurnResult) => void;
  /** Called when turn processing fails */
  onError?: (error: Error) => void;
  /** Called when mutation settles (success or error) */
  onSettled?: () => void;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to end the current turn.
 *
 * Handles:
 * - Turn processing via server action
 * - Cache invalidation for all game data
 * - Loading state management
 *
 * @example
 * const endTurn = useEndTurn({
 *   onSuccess: (result) => {
 *     console.log(`Turn ${result.turn} complete`);
 *     setTurnEvents(result.events);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   },
 * });
 *
 * // In click handler:
 * endTurn.mutate();
 *
 * // Check state:
 * if (endTurn.isPending) {
 *   return <Spinner />;
 * }
 */
export function useEndTurn(options: EndTurnOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<EndTurnResult> => {
      const result = await endTurnAction();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: async (data) => {
      // Invalidate all game-related queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: gameKeys.all });
      await queryClient.invalidateQueries({ queryKey: empireKeys.all });

      // Call user's success handler
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
    onSettled: () => {
      options.onSettled?.();
    },
  });
}

/**
 * Hook to end turn with enhanced data (resource deltas, defeat analysis).
 *
 * This is the preferred mutation for the main game UI as it provides
 * more detailed feedback about what happened during the turn.
 *
 * @example
 * const endTurn = useEndTurnEnhanced({
 *   onSuccess: (result) => {
 *     if (result.defeatAnalysis) {
 *       showDefeatModal(result.defeatAnalysis);
 *     } else {
 *       showTurnSummary(result);
 *     }
 *   },
 * });
 */
export function useEndTurnEnhanced(
  options: {
    onSuccess?: (result: EnhancedTurnResult) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<EnhancedTurnResult> => {
      const result = await endTurnEnhancedAction();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Map server result to client-friendly format
      // Server returns { success: true, turn, processingMs, ... } directly
      return {
        turn: result.turn,
        processingMs: result.processingMs,
        events: result.events,
        resourceChanges: result.resourceChanges,
        populationBefore: result.populationBefore,
        populationAfter: result.populationAfter,
        messagesReceived: result.messagesReceived,
        botBattles: result.botBattles,
        empiresEliminated: result.empiresEliminated,
        defeatAnalysis: result.defeatAnalysis as DefeatAnalysis | undefined,
        victoryResult: result.victoryResult,
      };
    },
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: gameKeys.layout() });

      // Return context for potential rollback
      const previousLayout = queryClient.getQueryData(gameKeys.layout());
      return { previousLayout };
    },
    onSuccess: async (data) => {
      // Invalidate all game-related queries
      await queryClient.invalidateQueries({ queryKey: gameKeys.all });
      await queryClient.invalidateQueries({ queryKey: empireKeys.all });

      options.onSuccess?.(data);
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousLayout) {
        queryClient.setQueryData(gameKeys.layout(), context.previousLayout);
      }

      options.onError?.(error);
    },
    onSettled: () => {
      options.onSettled?.();
    },
  });
}

/**
 * Hook to check if turn processing is in progress.
 *
 * @example
 * const isProcessing = useIsTurnProcessing();
 * <Button disabled={isProcessing}>End Turn</Button>
 */
export function useIsTurnProcessing(): boolean {
  const queryClient = useQueryClient();
  const mutations = queryClient.getMutationCache().getAll();

  return mutations.some(
    (m) =>
      m.state.status === "pending" &&
      (m.options.mutationKey?.includes("endTurn") ||
        m.options.mutationKey?.includes("endTurnEnhanced"))
  );
}
