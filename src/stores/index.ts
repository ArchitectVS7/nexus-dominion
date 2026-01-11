/**
 * Stores Module
 *
 * Central export point for all Zustand stores.
 *
 * Usage:
 * @example
 * import { useGameStore, usePanelStore, useTutorialStore } from "@/stores";
 *
 * function GameUI() {
 *   const { isProcessingTurn } = useGameStore();
 *   const { activePanel, openPanel } = usePanelStore();
 *   const { tutorialComplete } = useTutorialStore();
 *
 *   // ...
 * }
 */

// Panel store
export {
  usePanelStore,
  selectIsPanelOpen,
  selectIsPanel,
  selectTargetEmpireId,
} from "./panel-store";

export type { PanelType, PanelContextData } from "./panel-store";

// Game store
export {
  useGameStore,
  selectHasOpenModal,
  selectIsGameOver,
  selectLastTurnEvents,
} from "./game-store";

export type { TurnResult, VictoryResult } from "./game-store";

// Tutorial store
export {
  useTutorialStore,
  selectIsTutorialActive,
  selectShouldShowHints,
  selectTutorialProgress,
} from "./tutorial-store";

export type { TutorialStep, OnboardingHint } from "./tutorial-store";
