/**
 * Mutation Hooks
 *
 * Central export point for all React Query mutation hooks.
 */

// Turn mutations
export {
  useEndTurn,
  useEndTurnEnhanced,
  useIsTurnProcessing,
} from "./turn";

export type {
  EndTurnResult,
  EnhancedTurnResult,
  EndTurnOptions,
} from "./turn";

// Game mutations
export {
  useStartGame,
  useResumeCampaign,
  useEndGame,
  useEndSession, // Alias for useEndGame
} from "./game";

export type {
  StartGameInput,
  StartGameResult,
  ResumeCampaignResult,
} from "./game";
