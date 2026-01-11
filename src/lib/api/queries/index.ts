/**
 * Query Hooks
 *
 * Central export point for all React Query hooks.
 */

// Game queries
export {
  useGameLayout,
  useDashboard,
  useTurnStatus,
  useHasActiveGame,
  useResumableCampaigns,
  useInvalidateGame,
  useRefetchLayout,
  useOptimisticLayoutUpdate,
} from "./game";

export type {
  GameLayoutData,
  DashboardData,
  TurnStatus,
  ResumableCampaign,
} from "./game";
