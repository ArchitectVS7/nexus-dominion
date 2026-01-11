/**
 * Standardized API Contract Types
 *
 * These types define the contract for all server action responses,
 * ensuring consistent error handling and type safety across the application.
 */

import type {
  TurnResult,
  TurnEvent,
  ResourceDelta,
  DefeatAnalysis,
  TurnStatus,
} from "@/lib/game/types/turn-types";

// =============================================================================
// CORE RESULT TYPES
// =============================================================================

/**
 * Standardized result type for all server actions that can fail.
 * Uses discriminated union for type-safe error handling.
 *
 * @example
 * const result = await someAction();
 * if (result.success) {
 *   console.log(result.data); // TypeScript knows data exists
 * } else {
 *   console.error(result.error); // TypeScript knows error exists
 * }
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode };

/**
 * Result type for queries that return null on failure.
 * Used for read-only operations where null is an acceptable response.
 */
export type QueryResult<T> = T | null;

/**
 * Void action result for actions that don't return data.
 */
export type VoidActionResult =
  | { success: true }
  | { success: false; error: string; code?: ErrorCode };

// =============================================================================
// ERROR CODES
// =============================================================================

/**
 * Standardized error codes for client-side handling.
 * Allows UI to show appropriate error messages and take actions.
 */
export type ErrorCode =
  // Authentication/Authorization
  | "NO_SESSION"
  | "UNAUTHORIZED"
  | "EMPIRE_NOT_FOUND"
  | "EMPIRE_ELIMINATED"
  // Validation
  | "INVALID_INPUT"
  | "INVALID_UUID"
  | "INVALID_QUANTITY"
  // Rate Limiting
  | "RATE_LIMITED"
  // Game State
  | "GAME_NOT_FOUND"
  | "GAME_ENDED"
  | "TURN_IN_PROGRESS"
  // Resource Constraints
  | "INSUFFICIENT_CREDITS"
  | "INSUFFICIENT_RESOURCES"
  | "INSUFFICIENT_UNITS"
  // Combat
  | "INVALID_TARGET"
  | "SELF_ATTACK"
  | "UNDER_PROTECTION"
  // Generic
  | "INTERNAL_ERROR"
  | "UNKNOWN";

// =============================================================================
// DOMAIN-SPECIFIC RESULT TYPES
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Game Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

export interface GameCreationData {
  gameId: string;
  empireId: string;
  empireName: string;
  botCount: number;
  gameMode: "oneshot" | "campaign";
  difficulty: "easy" | "normal" | "hard" | "brutal";
}

export type GameCreationResult = ActionResult<GameCreationData>;

export interface ResumeCampaignData {
  gameId: string;
  empireId: string;
  currentTurn: number;
}

export type ResumeCampaignResult = ActionResult<ResumeCampaignData>;

// ─────────────────────────────────────────────────────────────────────────────
// Turn Processing
// ─────────────────────────────────────────────────────────────────────────────

export interface TurnProcessingData {
  turn: number;
  processingMs: number;
  events: TurnEvent[];
  resourceDeltas: ResourceDelta;
  defeatAnalysis?: DefeatAnalysis;
}

export type TurnProcessingResult = ActionResult<TurnProcessingData>;

export type TurnStatusResult = QueryResult<TurnStatus>;

// ─────────────────────────────────────────────────────────────────────────────
// Combat
// ─────────────────────────────────────────────────────────────────────────────

export interface AttackData {
  attackId: string;
  combatLog?: string;
  outcome: "victory" | "defeat" | "draw";
  casualties: {
    attacker: Record<string, number>;
    defender: Record<string, number>;
  };
}

export type AttackResult = ActionResult<AttackData>;

export interface AttackValidationData {
  valid: boolean;
  errors: string[];
  targetInfo?: {
    empireId: string;
    empireName: string;
    isProtected: boolean;
    protectionTurns?: number;
  };
}

export type AttackValidationResult = ActionResult<AttackValidationData>;

// ─────────────────────────────────────────────────────────────────────────────
// Market/Trade
// ─────────────────────────────────────────────────────────────────────────────

export type ResourceType = "food" | "ore" | "petroleum";

export interface TradeData {
  orderId: string;
  resourceType: ResourceType;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  newBalance: number;
}

export type TradeResult = ActionResult<TradeData>;

export interface MarketPriceData {
  food: { buyPrice: number; sellPrice: number };
  ore: { buyPrice: number; sellPrice: number };
  petroleum: { buyPrice: number; sellPrice: number };
}

export type MarketPriceResult = QueryResult<MarketPriceData>;

// ─────────────────────────────────────────────────────────────────────────────
// Military/Build Queue
// ─────────────────────────────────────────────────────────────────────────────

export type UnitType =
  | "soldiers"
  | "fighters"
  | "stations"
  | "lightCruisers"
  | "heavyCruisers"
  | "carriers";

export interface BuildOrderData {
  orderId: string;
  unitType: UnitType;
  quantity: number;
  turnsRemaining: number;
  totalCost: number;
}

export type BuildOrderResult = ActionResult<BuildOrderData>;

export interface CancelBuildData {
  refundAmount: number;
}

export type CancelBuildResult = ActionResult<CancelBuildData>;

// ─────────────────────────────────────────────────────────────────────────────
// Research
// ─────────────────────────────────────────────────────────────────────────────

export interface ResearchProgressData {
  branchId: string;
  currentLevel: number;
  pointsInvested: number;
  pointsRequired: number;
  progressPercent: number;
}

export type ResearchProgressResult = ActionResult<ResearchProgressData>;

export interface ResearchStatusData {
  totalPoints: number;
  branches: Record<string, ResearchProgressData>;
  availableUpgrades: string[];
}

export type ResearchStatusResult = QueryResult<ResearchStatusData>;

// ─────────────────────────────────────────────────────────────────────────────
// Sectors
// ─────────────────────────────────────────────────────────────────────────────

export type SectorType = "urban" | "agricultural" | "mining" | "energy";

export interface ColonizeData {
  sectorId: string;
  sectorType: SectorType;
  cost: number;
  newSectorCount: number;
}

export type ColonizeResult = ActionResult<ColonizeData>;

export interface ReleaseData {
  sectorId: string;
  newSectorCount: number;
}

export type ReleaseResult = ActionResult<ReleaseData>;

// ─────────────────────────────────────────────────────────────────────────────
// Diplomacy
// ─────────────────────────────────────────────────────────────────────────────

export type TreatyType = "nap" | "alliance" | "trade";

export interface TreatyProposalData {
  treatyId: string;
  targetEmpireId: string;
  treatyType: TreatyType;
  status: "pending" | "accepted" | "rejected";
}

export type TreatyProposalResult = ActionResult<TreatyProposalData>;

export interface TreatyResponseData {
  treatyId: string;
  status: "accepted" | "rejected";
}

export type TreatyResponseResult = ActionResult<TreatyResponseData>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout/Dashboard Data
// ─────────────────────────────────────────────────────────────────────────────

export interface GameLayoutData {
  // Game info
  gameId: string;
  gameName: string;
  gameMode: "oneshot" | "campaign";
  difficulty: "easy" | "normal" | "hard" | "brutal";

  // Empire info
  empireId: string;
  empireName: string;
  isEliminated: boolean;

  // Turn info
  currentTurn: number;
  maxTurns: number;
  protectionTurns: number;

  // Resources
  credits: number;
  food: number;
  ore: number;
  petroleum: number;
  researchPoints: number;

  // Population
  population: number;
  maxPopulation: number;
  civilStatus: string;

  // Sectors
  sectorCount: number;
  sectors: SectorSummary[];

  // Military
  soldiers: number;
  fighters: number;
  stations: number;
  lightCruisers: number;
  heavyCruisers: number;
  carriers: number;

  // Metrics
  networth: number;
  rank: number;
  totalEmpires: number;
}

export interface SectorSummary {
  id: string;
  type: SectorType;
  production: number;
}

export type GameLayoutResult = QueryResult<GameLayoutData>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a result is successful.
 * Narrows the type to access the data property.
 */
export function isSuccess<T>(
  result: ActionResult<T>
): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a result is an error.
 * Narrows the type to access the error property.
 */
export function isError<T>(
  result: ActionResult<T>
): result is { success: false; error: string; code?: ErrorCode } {
  return result.success === false;
}

/**
 * Unwrap a successful result or throw an error.
 * Useful for cases where failure should halt execution.
 */
export function unwrapResult<T>(result: ActionResult<T>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw new Error(result.error);
}

/**
 * Unwrap a successful result or return a default value.
 * Useful for cases where failure should use a fallback.
 */
export function unwrapOr<T>(result: ActionResult<T>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}
