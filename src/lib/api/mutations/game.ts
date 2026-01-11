"use client";

/**
 * Game Mutations
 *
 * React Query mutation hooks for game lifecycle actions.
 * Handles starting games, resuming campaigns, and ending sessions.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gameKeys } from "../query-keys";
import type { ActionResult, GameCreationData } from "../types";
import type { Difficulty } from "@/lib/bots/types";
import type { GameMode } from "@/lib/game/constants";

// Import server actions
import {
  startGameAction,
  resumeCampaignAction,
  endGameAction,
} from "@/app/actions/game-actions";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Input for starting a new game
 */
export interface StartGameInput {
  empireName: string;
  gameMode?: GameMode;
  botCount?: 10 | 25 | 50 | 100;
  difficulty?: Difficulty;
}

/**
 * Result from starting a game
 */
export interface StartGameResult {
  gameId: string;
  empireId: string;
  botCount: number;
  difficulty: Difficulty;
  gameMode: GameMode;
}

/**
 * Result from resuming a campaign
 */
export interface ResumeCampaignResult {
  gameId: string;
  empireId: string;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to start a new game.
 *
 * @example
 * const startGame = useStartGame({
 *   onSuccess: (result) => {
 *     router.push('/game/starmap');
 *   },
 * });
 *
 * startGame.mutate({
 *   empireName: 'Terran Federation',
 *   gameMode: 'campaign',
 *   botCount: 50,
 *   difficulty: 'normal',
 * });
 */
export function useStartGame(
  options: {
    onSuccess?: (result: StartGameResult) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartGameInput): Promise<StartGameResult> => {
      // Convert to FormData for server action compatibility
      const formData = new FormData();
      formData.set("empireName", input.empireName);
      if (input.gameMode) formData.set("gameMode", input.gameMode);
      if (input.botCount) formData.set("botCount", String(input.botCount));
      if (input.difficulty) formData.set("difficulty", input.difficulty);

      const result = await startGameAction(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to start game");
      }

      return {
        gameId: result.gameId!,
        empireId: result.empireId!,
        botCount: result.botCount!,
        difficulty: result.difficulty!,
        gameMode: result.gameMode!,
      };
    },
    onSuccess: async (data) => {
      // Clear any existing game data
      await queryClient.invalidateQueries({ queryKey: gameKeys.all });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
}

/**
 * Hook to resume a campaign.
 *
 * @example
 * const resumeCampaign = useResumeCampaign({
 *   onSuccess: () => {
 *     router.push('/game/starmap');
 *   },
 * });
 *
 * resumeCampaign.mutate({ gameId: 'uuid-here' });
 */
export function useResumeCampaign(
  options: {
    onSuccess?: (result: ResumeCampaignResult) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
    }: {
      gameId: string;
    }): Promise<ResumeCampaignResult> => {
      const result = await resumeCampaignAction(gameId);

      if (!result.success) {
        throw new Error(result.error || "Failed to resume campaign");
      }

      return {
        gameId: result.gameId!,
        empireId: result.empireId!,
      };
    },
    onSuccess: async (data) => {
      // Invalidate to fetch fresh game data
      await queryClient.invalidateQueries({ queryKey: gameKeys.all });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
}

/**
 * Hook to end the current game session.
 *
 * @example
 * const endGame = useEndGame({
 *   onSuccess: () => {
 *     router.push('/');
 *   },
 * });
 *
 * endGame.mutate();
 */
export function useEndGame(
  options: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await endGameAction();
    },
    onSuccess: async () => {
      // Clear all cached game data
      queryClient.removeQueries({ queryKey: gameKeys.all });

      options.onSuccess?.();
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
}

// Alias for backwards compatibility
export const useEndSession = useEndGame;
