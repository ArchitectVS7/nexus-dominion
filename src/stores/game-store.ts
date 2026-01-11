/**
 * Game Store
 *
 * Zustand store for managing game-wide UI state.
 * Handles turn processing state, modals, and defeat analysis.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { TurnEvent, ResourceDelta, DefeatAnalysis } from "@/lib/game/types/turn-types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Turn result data displayed in the turn summary modal.
 */
export interface TurnResult {
  turn: number;
  processingMs: number;
  events: TurnEvent[];
  resourceDeltas?: ResourceDelta;
}

/**
 * Victory result when game ends in player victory.
 */
export interface VictoryResult {
  type: "conquest" | "economic" | "survival";
  winnerId: string;
  winnerName: string;
  message: string;
}

/**
 * Game store state interface.
 */
interface GameState {
  /** Whether a turn is currently being processed */
  isProcessingTurn: boolean;
  /** Result from the last turn processing */
  turnResult: TurnResult | null;
  /** Whether to show the turn summary modal */
  showTurnSummary: boolean;
  /** Defeat analysis if player was defeated */
  defeatAnalysis: DefeatAnalysis | null;
  /** Victory result if player won */
  victoryResult: VictoryResult | null;
  /** Whether the game has ended */
  gameEnded: boolean;
  /** Whether to show the quick reference modal */
  showQuickReference: boolean;
}

/**
 * Game store actions interface.
 */
interface GameActions {
  /** Set turn processing state */
  setProcessingTurn: (processing: boolean) => void;
  /** Set turn result and optionally show summary */
  setTurnResult: (result: TurnResult | null, showSummary?: boolean) => void;
  /** Show/hide turn summary modal */
  setShowTurnSummary: (show: boolean) => void;
  /** Set defeat analysis (triggers defeat screen) */
  setDefeatAnalysis: (analysis: DefeatAnalysis | null) => void;
  /** Set victory result (triggers victory screen) */
  setVictoryResult: (result: VictoryResult | null) => void;
  /** Mark game as ended */
  setGameEnded: (ended: boolean) => void;
  /** Show/hide quick reference modal */
  setShowQuickReference: (show: boolean) => void;
  /** Toggle quick reference modal */
  toggleQuickReference: () => void;
  /** Reset all game state */
  reset: () => void;
}

// =============================================================================
// STORE
// =============================================================================

const initialState: GameState = {
  isProcessingTurn: false,
  turnResult: null,
  showTurnSummary: false,
  defeatAnalysis: null,
  victoryResult: null,
  gameEnded: false,
  showQuickReference: false,
};

/**
 * Game store for managing game-wide UI state.
 *
 * @example
 * import { useGameStore } from "@/stores";
 *
 * function EndTurnButton() {
 *   const { isProcessingTurn, setProcessingTurn, setTurnResult } = useGameStore();
 *   const endTurn = useEndTurn();
 *
 *   const handleEndTurn = async () => {
 *     setProcessingTurn(true);
 *     try {
 *       const result = await endTurn.mutateAsync();
 *       setTurnResult(result, true);
 *     } finally {
 *       setProcessingTurn(false);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleEndTurn} disabled={isProcessingTurn}>
 *       {isProcessingTurn ? "Processing..." : "End Turn"}
 *     </button>
 *   );
 * }
 */
export const useGameStore = create<GameState & GameActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setProcessingTurn: (processing) => {
        set({ isProcessingTurn: processing });
      },

      setTurnResult: (result, showSummary = false) => {
        set({
          turnResult: result,
          showTurnSummary: showSummary,
        });
      },

      setShowTurnSummary: (show) => {
        set({ showTurnSummary: show });
      },

      setDefeatAnalysis: (analysis) => {
        set({
          defeatAnalysis: analysis,
          gameEnded: analysis !== null,
        });
      },

      setVictoryResult: (result) => {
        set({
          victoryResult: result,
          gameEnded: result !== null,
        });
      },

      setGameEnded: (ended) => {
        set({ gameEnded: ended });
      },

      setShowQuickReference: (show) => {
        set({ showQuickReference: show });
      },

      toggleQuickReference: () => {
        set((state) => ({ showQuickReference: !state.showQuickReference }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "game-store" }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Selector to check if any modal is open.
 */
export const selectHasOpenModal = (state: GameState & GameActions): boolean =>
  state.showTurnSummary ||
  state.showQuickReference ||
  state.defeatAnalysis !== null ||
  state.victoryResult !== null;

/**
 * Selector to check if game is in a terminal state.
 */
export const selectIsGameOver = (state: GameState & GameActions): boolean =>
  state.gameEnded || state.defeatAnalysis !== null || state.victoryResult !== null;

/**
 * Selector to get events from last turn.
 */
export const selectLastTurnEvents = (state: GameState & GameActions): TurnEvent[] =>
  state.turnResult?.events ?? [];
