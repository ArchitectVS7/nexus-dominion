/**
 * API Module
 *
 * Central export point for all API-related types, utilities, and client functions.
 *
 * Usage:
 * @example
 * import { useGameLayout, useEndTurn, gameKeys } from "@/lib/api";
 *
 * function GameDashboard() {
 *   const { data: layout, isLoading } = useGameLayout();
 *   const endTurn = useEndTurn({ onSuccess: () => toast("Turn complete!") });
 *
 *   return (
 *     <button onClick={() => endTurn.mutate()} disabled={endTurn.isPending}>
 *       End Turn
 *     </button>
 *   );
 * }
 */

// Core types
export type {
  ActionResult,
  QueryResult,
  VoidActionResult,
  ErrorCode,
} from "./types";

// Domain types - Game (contract types for new code)
export type {
  GameCreationData,
  GameCreationResult,
  ResumeCampaignData,
  // Note: GameLayoutData re-exported from ./queries with actual server action type
  GameLayoutResult,
  SectorSummary,
} from "./types";

// Domain types - Turn
export type {
  TurnProcessingData,
  TurnProcessingResult,
  TurnStatusResult,
} from "./types";

// Domain types - Combat
export type {
  AttackData,
  AttackResult,
  AttackValidationData,
  AttackValidationResult,
} from "./types";

// Domain types - Market
export type {
  ResourceType,
  TradeData,
  TradeResult,
  MarketPriceData,
  MarketPriceResult,
} from "./types";

// Domain types - Military
export type {
  UnitType,
  BuildOrderData,
  BuildOrderResult,
  CancelBuildData,
  CancelBuildResult,
} from "./types";

// Domain types - Research
export type {
  ResearchProgressData,
  ResearchProgressResult,
  ResearchStatusData,
  ResearchStatusResult,
} from "./types";

// Domain types - Sectors
export type {
  SectorType,
  ColonizeData,
  ColonizeResult,
  ReleaseData,
  ReleaseResult,
} from "./types";

// Domain types - Diplomacy
export type {
  TreatyType,
  TreatyProposalData,
  TreatyProposalResult,
  TreatyResponseData,
  TreatyResponseResult,
} from "./types";

// Type guards and utilities
export { isSuccess, isError, unwrapResult, unwrapOr } from "./types";

// Action wrapper
export {
  createAction,
  createQueryAction,
  createPublicAction,
  normalizeActionResult,
  getErrorMessage,
  requireSuccess,
} from "./action-wrapper";

export type {
  ActionSession,
  ActionContext,
  ActionOptions,
} from "./action-wrapper";

// Query keys
export {
  gameKeys,
  empireKeys,
  combatKeys,
  marketKeys,
  researchKeys,
  diplomacyKeys,
  messageKeys,
  starmapKeys,
  buildKeys,
} from "./query-keys";

// Query hooks - Game
export {
  useGameLayout,
  useDashboard,
  useTurnStatus,
  useHasActiveGame,
  useResumableCampaigns,
  useInvalidateGame,
  useRefetchLayout,
  useOptimisticLayoutUpdate,
} from "./queries";

export type {
  GameLayoutData,
  DashboardData,
  TurnStatus,
  ResumableCampaign,
} from "./queries";

// Query hooks - Starmap
export {
  useGalaxyView,
  useStarmapData,
  useTellsForPlayer,
} from "./queries/starmap";

export type {
  GalaxyViewData,
  StarmapData,
  PlayerTellData,
} from "./queries/starmap";

// Mutation hooks
export {
  useEndTurn,
  useEndTurnEnhanced,
  useIsTurnProcessing,
  useStartGame,
  useResumeCampaign,
  useEndGame,
  useEndSession, // Alias for useEndGame
} from "./mutations";

export type {
  EndTurnResult,
  EnhancedTurnResult,
  EndTurnOptions,
  StartGameInput,
  StartGameResult,
  // ResumeCampaignResult from mutations (distinct from contract type)
} from "./mutations";
