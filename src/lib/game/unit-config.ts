/**
 * Unit Configuration Constants (PRD 6.1)
 *
 * Defines costs, population requirements, and combat stats for all military units.
 * All values sourced directly from PRD 6.1 Unit Types table.
 */

// =============================================================================
// UNIT TYPES
// =============================================================================

export const UNIT_TYPES = [
  "soldiers",
  "fighters",
  "stations",
  "lightCruisers",
  "heavyCruisers",
  "carriers",
  "covertAgents",
] as const;

export type UnitType = (typeof UNIT_TYPES)[number];

// =============================================================================
// UNIT COSTS (PRD 6.1)
// =============================================================================

/**
 * Credit cost to purchase one unit.
 */
export const UNIT_COSTS: Record<UnitType, number> = {
  soldiers: 50,
  fighters: 200,
  stations: 5_000,
  lightCruisers: 500,
  heavyCruisers: 1_000,
  carriers: 2_500,
  covertAgents: 4_090,
} as const;

// =============================================================================
// UNIT POPULATION REQUIREMENTS (PRD 6.1)
// =============================================================================

/**
 * Population consumed per unit when training.
 */
export const UNIT_POPULATION: Record<UnitType, number> = {
  soldiers: 0.2,
  fighters: 0.4,
  stations: 0.5,
  lightCruisers: 1.0,
  heavyCruisers: 2.0,
  carriers: 3.0,
  covertAgents: 1.0,
} as const;

// =============================================================================
// UNIT ATTACK POWER (PRD 6.1)
// =============================================================================

/**
 * Base attack power per unit.
 * Note: Covert agents don't participate in direct combat.
 */
export const UNIT_ATTACK: Record<Exclude<UnitType, "covertAgents">, number> = {
  soldiers: 1,
  fighters: 3,
  stations: 50,
  lightCruisers: 5,
  heavyCruisers: 8,
  carriers: 12,
} as const;

// =============================================================================
// UNIT DEFENSE POWER (PRD 6.1)
// =============================================================================

/**
 * Base defense power per unit.
 * Note: Stations get 2× effectiveness when defending (handled in combat-power.ts).
 * Note: Covert agents don't participate in direct combat.
 */
export const UNIT_DEFENSE: Record<Exclude<UnitType, "covertAgents">, number> = {
  soldiers: 1,
  fighters: 2,
  stations: 50,
  lightCruisers: 4,
  heavyCruisers: 6,
  carriers: 10,
} as const;

// =============================================================================
// UNIT MAINTENANCE (Derived from PRD context)
// =============================================================================

/**
 * Credits required per unit per turn for maintenance.
 * Approximate values based on unit complexity and cost.
 */
export const UNIT_MAINTENANCE: Record<UnitType, number> = {
  soldiers: 0.5,
  fighters: 2,
  stations: 50,
  lightCruisers: 5,
  heavyCruisers: 10,
  carriers: 25,
  covertAgents: 40,
} as const;

// =============================================================================
// UNIT DISPLAY LABELS
// =============================================================================

export const UNIT_LABELS: Record<UnitType, string> = {
  soldiers: "Soldiers",
  fighters: "Fighters",
  stations: "Stations",
  lightCruisers: "Light Cruisers",
  heavyCruisers: "Heavy Cruisers",
  carriers: "Carriers",
  covertAgents: "Covert Agents",
} as const;

// =============================================================================
// UNIT DESCRIPTIONS
// =============================================================================

export const UNIT_DESCRIPTIONS: Record<UnitType, string> = {
  soldiers: "Ground combat infantry for planet capture",
  fighters: "Orbital combat craft for space superiority",
  stations: "Defensive orbital platforms (2× on defense)",
  lightCruisers: "Fast space combat vessels",
  heavyCruisers: "Heavy space battleships",
  carriers: "Troop transports required for invasions",
  covertAgents: "Espionage specialists for covert operations",
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate the total cost to purchase a quantity of units.
 */
export function calculateUnitPurchaseCost(
  unitType: UnitType,
  quantity: number
): number {
  return UNIT_COSTS[unitType] * quantity;
}

/**
 * Calculate the population required to train a quantity of units.
 */
export function calculateUnitPopulationCost(
  unitType: UnitType,
  quantity: number
): number {
  return UNIT_POPULATION[unitType] * quantity;
}

/**
 * Calculate the maintenance cost per turn for a quantity of units.
 */
export function calculateUnitMaintenanceCost(
  unitType: UnitType,
  quantity: number
): number {
  return UNIT_MAINTENANCE[unitType] * quantity;
}

/**
 * Calculate how many units can be afforded with available credits.
 */
export function calculateAffordableUnits(
  unitType: UnitType,
  availableCredits: number
): number {
  if (availableCredits <= 0) return 0;
  return Math.floor(availableCredits / UNIT_COSTS[unitType]);
}

/**
 * Calculate how many units can be trained with available population.
 */
export function calculateTrainableUnits(
  unitType: UnitType,
  availablePopulation: number
): number {
  if (availablePopulation <= 0) return 0;
  return Math.floor(availablePopulation / UNIT_POPULATION[unitType]);
}
