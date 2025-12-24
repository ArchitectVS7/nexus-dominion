/**
 * Combat Power Calculation (PRD 6.2)
 *
 * Calculates fleet combat power with modifiers for:
 * - Unit type power multipliers
 * - Fleet diversity bonus (+15% for 4+ unit types)
 * - Defender advantage (+20%)
 * - Station defense bonus (2× on defense)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FleetComposition {
  soldiers: number;
  fighters: number;
  stations: number;
  lightCruisers: number;
  heavyCruisers: number;
  carriers: number;
}

// =============================================================================
// CONSTANTS (PRD 6.2)
// =============================================================================

/**
 * Power multipliers per unit type.
 * Based on PRD 6.2 combat power calculation.
 */
export const POWER_MULTIPLIERS = {
  soldiers: 1, // Ground combat only, not counted in fleet power
  fighters: 1, // PRD: fighters * 1
  stations: 50, // PRD: stations * 50 (base, 2× on defense)
  lightCruisers: 4, // PRD: cruisers * 4 (light)
  heavyCruisers: 4, // PRD: cruisers * 4 (heavy)
  carriers: 12, // PRD: carriers * 12
} as const;

/** Number of different unit types required for diversity bonus */
export const DIVERSITY_THRESHOLD = 4;

/** Multiplier applied when fleet has 4+ unit types */
export const DIVERSITY_BONUS = 1.15;

/** Multiplier applied to defending forces */
export const DEFENDER_ADVANTAGE = 1.2;

/** Stations get 2× effectiveness when defending */
export const STATION_DEFENSE_MULTIPLIER = 2;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Count the number of different unit types present in a fleet.
 * Only counts unit types with at least 1 unit.
 *
 * @param fleet - The fleet composition
 * @returns Number of different unit types (0-6)
 */
export function countUnitTypes(fleet: FleetComposition): number {
  let count = 0;
  if (fleet.soldiers > 0) count++;
  if (fleet.fighters > 0) count++;
  if (fleet.stations > 0) count++;
  if (fleet.lightCruisers > 0) count++;
  if (fleet.heavyCruisers > 0) count++;
  if (fleet.carriers > 0) count++;
  return count;
}

/**
 * Check if a fleet qualifies for the diversity bonus.
 *
 * @param fleet - The fleet composition
 * @returns true if fleet has 4+ unit types
 */
export function hasDiversityBonus(fleet: FleetComposition): boolean {
  return countUnitTypes(fleet) >= DIVERSITY_THRESHOLD;
}

/**
 * Calculate the diversity bonus multiplier for a fleet.
 *
 * @param fleet - The fleet composition
 * @returns 1.15 if 4+ unit types, 1.0 otherwise
 */
export function calculateDiversityBonus(fleet: FleetComposition): number {
  return hasDiversityBonus(fleet) ? DIVERSITY_BONUS : 1.0;
}

// =============================================================================
// MAIN CALCULATION
// =============================================================================

/**
 * Calculate the total combat power of a fleet.
 *
 * Formula (PRD 6.2):
 * - Base power = sum of (units × multiplier) for each type
 * - Stations get 2× when defending
 * - Diversity bonus: +15% if 4+ unit types
 * - Defender advantage: +20% for defending fleet
 *
 * Note: Soldiers are not counted in fleet power (ground combat only)
 *
 * @param fleet - The fleet composition
 * @param isDefender - Whether this fleet is defending (applies bonuses)
 * @returns The total combat power
 */
export function calculateFleetPower(
  fleet: FleetComposition,
  isDefender: boolean = false
): number {
  // Calculate base power from space combat units
  let basePower =
    fleet.fighters * POWER_MULTIPLIERS.fighters +
    fleet.lightCruisers * POWER_MULTIPLIERS.lightCruisers +
    fleet.heavyCruisers * POWER_MULTIPLIERS.heavyCruisers +
    fleet.carriers * POWER_MULTIPLIERS.carriers;

  // Add station power (2× on defense)
  const stationMultiplier = isDefender
    ? POWER_MULTIPLIERS.stations * STATION_DEFENSE_MULTIPLIER
    : POWER_MULTIPLIERS.stations;
  basePower += fleet.stations * stationMultiplier;

  // Apply diversity bonus
  const diversityMultiplier = calculateDiversityBonus(fleet);
  basePower *= diversityMultiplier;

  // Apply defender advantage
  if (isDefender) {
    basePower *= DEFENDER_ADVANTAGE;
  }

  return basePower;
}

/**
 * Calculate the power ratio between attacker and defender.
 * Used to determine combat outcome probability.
 *
 * @param attackerFleet - The attacking fleet composition
 * @param defenderFleet - The defending fleet composition
 * @returns Ratio of attacker power to defender power
 */
export function calculatePowerRatio(
  attackerFleet: FleetComposition,
  defenderFleet: FleetComposition
): number {
  const attackPower = calculateFleetPower(attackerFleet, false);
  const defensePower = calculateFleetPower(defenderFleet, true);

  // Avoid division by zero
  if (defensePower === 0) {
    return attackPower > 0 ? Infinity : 1;
  }

  return attackPower / defensePower;
}
