"use client";

/**
 * Game Queries
 *
 * React Query hooks for game-related data fetching.
 * Wraps server actions with caching, background refresh, and error handling.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { gameKeys } from "../query-keys";

// Import server actions and their types
import {
  fetchDashboardDataAction,
  hasActiveGameAction,
  getResumableCampaignsAction,
  type ResumableCampaign,
} from "@/app/actions/game-actions";
import {
  getTurnStatusAction,
  getGameLayoutDataAction,
  type GameLayoutData,
} from "@/app/actions/turn-actions";

// Re-export types from server actions for convenience
export type { GameLayoutData, ResumableCampaign };

// Re-export types from repositories
import type { DashboardData } from "@/lib/game/repositories/game-repository";
export type { DashboardData };

// Import turn types for re-export
import type { TurnStatus } from "@/lib/game/types/turn-types";
export type { TurnStatus };

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to fetch game layout data for the shell/dashboard.
 *
 * This is the primary data source for the game UI, containing:
 * - Game info (mode, difficulty, turn)
 * - Empire info (name, resources, military)
 * - Rankings and metrics
 *
 * @example
 * const { data: layout, isLoading, error } = useGameLayout();
 * if (layout) {
 *   console.log(`Turn ${layout.currentTurn}: ${layout.credits} credits`);
 * }
 */
export function useGameLayout() {
  return useQuery({
    queryKey: gameKeys.layout(),
    queryFn: async (): Promise<GameLayoutData | null> => {
      const result = await getGameLayoutDataAction();
      return result;
    },
    // Layout data should be relatively fresh for real-time feel
    staleTime: 10 * 1000, // 10 seconds
    // Refetch on window focus to catch updates
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch detailed dashboard data.
 *
 * Contains more detailed information than layout, including:
 * - Full sector list
 * - Detailed military breakdown
 *
 * @example
 * const { data: dashboard } = useDashboard();
 * dashboard?.sectors.forEach(s => console.log(s.type));
 */
export function useDashboard() {
  return useQuery({
    queryKey: gameKeys.dashboard(),
    queryFn: async (): Promise<DashboardData | null> => {
      const result = await fetchDashboardDataAction();
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch current turn status.
 *
 * Lightweight query for turn information:
 * - Current turn number
 * - Turn limit
 * - Processing state
 *
 * @example
 * const { data: turn } = useTurnStatus();
 * console.log(`Turn ${turn?.currentTurn} of ${turn?.turnLimit}`);
 */
export function useTurnStatus() {
  return useQuery({
    queryKey: gameKeys.turn(),
    queryFn: async (): Promise<TurnStatus | null> => {
      const result = await getTurnStatusAction();
      return result;
    },
    staleTime: 5 * 1000, // 5 seconds - turn status should be fresh
  });
}

/**
 * Hook to check if there's an active game.
 *
 * @example
 * const { data: hasGame } = useHasActiveGame();
 * if (!hasGame) redirect('/game');
 */
export function useHasActiveGame() {
  return useQuery({
    queryKey: [...gameKeys.all, "active"],
    queryFn: async (): Promise<boolean> => {
      const result = await hasActiveGameAction();
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch resumable campaigns.
 *
 * @example
 * const { data: campaigns } = useResumableCampaigns();
 * campaigns?.forEach(c => console.log(c.gameName));
 */
export function useResumableCampaigns() {
  return useQuery({
    queryKey: gameKeys.resumable(),
    queryFn: async (): Promise<ResumableCampaign[]> => {
      const result = await getResumableCampaignsAction();
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to invalidate all game-related queries.
 * Useful after turn processing or major state changes.
 *
 * @example
 * const invalidateGame = useInvalidateGame();
 * await invalidateGame();
 */
export function useInvalidateGame() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: gameKeys.all });
  };
}

/**
 * Hook to refetch layout data.
 * Useful after mutations that affect resources.
 *
 * @example
 * const refetchLayout = useRefetchLayout();
 * await refetchLayout();
 */
export function useRefetchLayout() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.refetchQueries({ queryKey: gameKeys.layout() });
  };
}

/**
 * Hook to optimistically update layout data.
 * Useful for immediate UI feedback during mutations.
 *
 * @example
 * const updateLayout = useOptimisticLayoutUpdate();
 * updateLayout(prev => ({ ...prev, credits: prev.credits - 1000 }));
 */
export function useOptimisticLayoutUpdate() {
  const queryClient = useQueryClient();

  return (
    updater: (prev: GameLayoutData | null | undefined) => GameLayoutData | null
  ) => {
    queryClient.setQueryData<GameLayoutData | null>(
      gameKeys.layout(),
      updater
    );
  };
}
