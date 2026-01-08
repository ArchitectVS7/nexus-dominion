/**
 * Forces Type Definition
 *
 * Canonical definition of the Forces interface used throughout the codebase.
 * This is the single source of truth for force composition in combat, bots,
 * and other systems.
 *
 * Unit Types:
 * - soldiers: Ground troops for sector capture
 * - fighters: Space combat interceptors
 * - stations: Orbital defense platforms
 * - lightCruisers: Fast attack ships
 * - heavyCruisers: Battleships with heavy firepower
 * - carriers: Transport ships for soldiers (100 soldiers per carrier)
 */

export interface Forces {
  soldiers: number;
  fighters: number;
  stations: number;
  lightCruisers: number;
  heavyCruisers: number;
  carriers: number;
}

/**
 * Create an empty forces object with all values set to 0.
 */
export function createEmptyForces(): Forces {
  return {
    soldiers: 0,
    fighters: 0,
    stations: 0,
    lightCruisers: 0,
    heavyCruisers: 0,
    carriers: 0,
  };
}

/**
 * Unit type keys for iterating over forces.
 */
export type UnitType = keyof Forces;

/**
 * All unit types in order of combat phase relevance.
 */
export const UNIT_TYPES: UnitType[] = [
  "soldiers",
  "fighters",
  "stations",
  "lightCruisers",
  "heavyCruisers",
  "carriers",
];
