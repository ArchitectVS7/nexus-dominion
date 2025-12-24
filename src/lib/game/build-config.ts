/**
 * Build Queue Configuration (M3)
 *
 * Defines build times for all unit types.
 * Build times are proportional to unit power/cost.
 */

import type { UnitType } from "./unit-config";

// =============================================================================
// DATABASE TYPE MAPPING
// =============================================================================

/**
 * Database uses snake_case for unit types, but app uses camelCase.
 * This type represents the database enum values.
 */
export type DbUnitType =
  | "soldiers"
  | "fighters"
  | "stations"
  | "light_cruisers"
  | "heavy_cruisers"
  | "carriers"
  | "covert_agents";

/**
 * Map from app UnitType (camelCase) to database unit type (snake_case).
 */
export const UNIT_TYPE_TO_DB: Record<UnitType, DbUnitType> = {
  soldiers: "soldiers",
  fighters: "fighters",
  stations: "stations",
  lightCruisers: "light_cruisers",
  heavyCruisers: "heavy_cruisers",
  carriers: "carriers",
  covertAgents: "covert_agents",
} as const;

/**
 * Map from database unit type (snake_case) to app UnitType (camelCase).
 */
export const DB_TO_UNIT_TYPE: Record<DbUnitType, UnitType> = {
  soldiers: "soldiers",
  fighters: "fighters",
  stations: "stations",
  light_cruisers: "lightCruisers",
  heavy_cruisers: "heavyCruisers",
  carriers: "carriers",
  covert_agents: "covertAgents",
} as const;

/**
 * Convert app UnitType to database unit type.
 */
export function toDbUnitType(unitType: UnitType): DbUnitType {
  return UNIT_TYPE_TO_DB[unitType];
}

/**
 * Convert database unit type to app UnitType.
 */
export function fromDbUnitType(dbUnitType: DbUnitType): UnitType {
  return DB_TO_UNIT_TYPE[dbUnitType];
}

// =============================================================================
// BUILD TIMES (turns to complete)
// =============================================================================

/**
 * Number of turns required to build each unit type.
 * More expensive/powerful units take longer to build.
 */
export const UNIT_BUILD_TIMES: Record<UnitType, number> = {
  soldiers: 1,        // Quick infantry
  fighters: 1,        // Fast orbital craft
  stations: 3,        // Large defensive platforms
  lightCruisers: 2,   // Medium space combat
  heavyCruisers: 2,   // Heavy space combat
  carriers: 3,        // Large troop transports
  covertAgents: 2,    // Specialized training
} as const;

// =============================================================================
// BUILD QUEUE CONSTANTS
// =============================================================================

/**
 * Maximum number of items that can be in the build queue at once.
 */
export const MAX_QUEUE_SIZE = 10;

/**
 * Refund percentage when canceling a queued build order.
 * Only refunds credits if the build has not started processing.
 */
export const BUILD_CANCEL_REFUND = 0.5; // 50% refund

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the number of turns required to build a unit type.
 */
export function getBuildTime(unitType: UnitType): number {
  return UNIT_BUILD_TIMES[unitType];
}

/**
 * Calculate the refund amount for canceling a build order.
 *
 * @param totalCost - The total cost of the build order
 * @param turnsRemaining - Turns remaining until completion
 * @param turnsTotal - Total turns for this build type
 * @returns Refund amount (50% if not started, prorated if in progress)
 */
export function calculateBuildCancelRefund(
  totalCost: number,
  turnsRemaining: number,
  turnsTotal: number
): number {
  // If build hasn't started (turnsRemaining === turnsTotal), give 50% refund
  // If build is in progress, give proportional refund based on remaining turns
  if (turnsRemaining >= turnsTotal) {
    return Math.floor(totalCost * BUILD_CANCEL_REFUND);
  }

  // Proportional refund: (turnsRemaining / turnsTotal) * totalCost * 0.5
  const progressRefund = (turnsRemaining / turnsTotal) * totalCost * BUILD_CANCEL_REFUND;
  return Math.floor(progressRefund);
}
