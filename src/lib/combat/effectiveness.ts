/**
 * Unit Effectiveness Matrix (PRD 6.7)
 *
 * Different units excel in different combat phases.
 * This module defines effectiveness ratings for each unit type
 * across all combat phases and scenarios.
 *
 * Effectiveness Scale:
 * - High: 1.0
 * - Medium: 0.5
 * - Low: 0.25
 * - None: 0.0 (unit doesn't participate in this phase)
 */

// =============================================================================
// TYPES
// =============================================================================

export type CombatPhase = "space" | "orbital" | "ground" | "guerilla" | "pirate_defense";

export type CombatUnitType =
  | "soldiers"
  | "fighters"
  | "stations"
  | "lightCruisers"
  | "heavyCruisers"
  | "carriers";

// =============================================================================
// CONSTANTS (PRD 6.7 Unit Effectiveness Matrix)
// =============================================================================

export const EFFECTIVENESS_LEVELS = {
  HIGH: 1.0,
  MEDIUM: 0.5,
  LOW: 0.25,
  NONE: 0.0,
} as const;

/**
 * Unit effectiveness by combat phase.
 * Based on PRD 6.7 Unit Effectiveness Matrix.
 *
 * | Unit          | Guerilla | Ground | Orbital | Space | Pirate Defense |
 * |---------------|----------|--------|---------|-------|----------------|
 * | Soldiers      | High     | High   | —       | —     | Low            |
 * | Fighters      | —        | Low    | High    | Low   | Low            |
 * | Stations      | —        | Medium | Medium  | —     | —              |
 * | Light Cruisers| —        | —      | High    | High  | Low            |
 * | Heavy Cruisers| —        | —      | Medium  | High  | Low            |
 * | Carriers      | —        | —      | —       | —     | —              |
 */
export const UNIT_EFFECTIVENESS: Record<CombatUnitType, Record<CombatPhase, number>> = {
  soldiers: {
    guerilla: EFFECTIVENESS_LEVELS.HIGH,
    ground: EFFECTIVENESS_LEVELS.HIGH,
    orbital: EFFECTIVENESS_LEVELS.NONE,
    space: EFFECTIVENESS_LEVELS.NONE,
    pirate_defense: EFFECTIVENESS_LEVELS.LOW,
  },
  fighters: {
    guerilla: EFFECTIVENESS_LEVELS.NONE,
    ground: EFFECTIVENESS_LEVELS.LOW,
    orbital: EFFECTIVENESS_LEVELS.HIGH,
    space: EFFECTIVENESS_LEVELS.LOW,
    pirate_defense: EFFECTIVENESS_LEVELS.LOW,
  },
  stations: {
    guerilla: EFFECTIVENESS_LEVELS.NONE,
    ground: EFFECTIVENESS_LEVELS.MEDIUM,
    orbital: EFFECTIVENESS_LEVELS.MEDIUM,
    space: EFFECTIVENESS_LEVELS.NONE,
    pirate_defense: EFFECTIVENESS_LEVELS.NONE,
  },
  lightCruisers: {
    guerilla: EFFECTIVENESS_LEVELS.NONE,
    ground: EFFECTIVENESS_LEVELS.NONE,
    orbital: EFFECTIVENESS_LEVELS.HIGH,
    space: EFFECTIVENESS_LEVELS.HIGH,
    pirate_defense: EFFECTIVENESS_LEVELS.LOW,
  },
  heavyCruisers: {
    guerilla: EFFECTIVENESS_LEVELS.NONE,
    ground: EFFECTIVENESS_LEVELS.NONE,
    orbital: EFFECTIVENESS_LEVELS.MEDIUM,
    space: EFFECTIVENESS_LEVELS.HIGH,
    pirate_defense: EFFECTIVENESS_LEVELS.LOW,
  },
  carriers: {
    guerilla: EFFECTIVENESS_LEVELS.NONE,
    ground: EFFECTIVENESS_LEVELS.NONE,
    orbital: EFFECTIVENESS_LEVELS.NONE,
    space: EFFECTIVENESS_LEVELS.NONE,
    pirate_defense: EFFECTIVENESS_LEVELS.NONE,
  },
} as const;

/** Units that primarily participate in each phase */
export const PHASE_PRIMARY_UNITS: Record<CombatPhase, CombatUnitType[]> = {
  space: ["lightCruisers", "heavyCruisers"],
  orbital: ["fighters", "stations", "lightCruisers"],
  ground: ["soldiers"],
  guerilla: ["soldiers"],
  pirate_defense: ["soldiers", "fighters", "lightCruisers", "heavyCruisers"],
};

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Get the effectiveness rating for a unit type in a specific combat phase.
 *
 * @param unitType - The type of unit
 * @param phase - The combat phase
 * @param isDefender - Whether this unit is defending (stations get 2x)
 * @returns Effectiveness rating (0.0 to 1.0)
 */
export function getUnitEffectiveness(
  unitType: CombatUnitType,
  phase: CombatPhase,
  isDefender: boolean = false
): number {
  const baseEffectiveness = UNIT_EFFECTIVENESS[unitType][phase];

  // Stations get 2× effectiveness when defending in orbital phase
  if (unitType === "stations" && isDefender && phase === "orbital") {
    return Math.min(baseEffectiveness * 2, EFFECTIVENESS_LEVELS.HIGH);
  }

  return baseEffectiveness;
}

/**
 * Check if a unit can participate in a combat phase.
 *
 * @param unitType - The type of unit
 * @param phase - The combat phase
 * @returns true if the unit has non-zero effectiveness in this phase
 */
export function canParticipate(unitType: CombatUnitType, phase: CombatPhase): boolean {
  return UNIT_EFFECTIVENESS[unitType][phase] > 0;
}

/**
 * Get all units that can participate in a combat phase.
 *
 * @param phase - The combat phase
 * @returns Array of unit types that can participate
 */
export function getParticipatingUnits(phase: CombatPhase): CombatUnitType[] {
  const units: CombatUnitType[] = [];
  for (const [unit, effectiveness] of Object.entries(UNIT_EFFECTIVENESS)) {
    if (effectiveness[phase] > 0) {
      units.push(unit as CombatUnitType);
    }
  }
  return units;
}

/**
 * Get the primary combat phase for a unit type.
 * Returns the phase where the unit has highest effectiveness.
 *
 * @param unitType - The type of unit
 * @returns The phase where this unit is most effective
 */
export function getPrimaryPhase(unitType: CombatUnitType): CombatPhase | null {
  const effectiveness = UNIT_EFFECTIVENESS[unitType];
  let maxPhase: CombatPhase | null = null;
  let maxValue = 0;

  for (const [phase, value] of Object.entries(effectiveness) as [CombatPhase, number][]) {
    if (value > maxValue) {
      maxValue = value;
      maxPhase = phase;
    }
  }

  return maxPhase;
}

/**
 * Calculate the effective power contribution of units in a phase.
 * Scales unit count by effectiveness rating.
 *
 * @param unitType - The type of unit
 * @param count - Number of units
 * @param basePower - Base power per unit
 * @param phase - The combat phase
 * @param isDefender - Whether defending
 * @returns Effective power for this phase
 */
export function calculatePhaseEffectivePower(
  unitType: CombatUnitType,
  count: number,
  basePower: number,
  phase: CombatPhase,
  isDefender: boolean = false
): number {
  const effectiveness = getUnitEffectiveness(unitType, phase, isDefender);
  return count * basePower * effectiveness;
}

/**
 * Get human-readable description of unit role in a phase.
 *
 * @param unitType - The type of unit
 * @param phase - The combat phase
 * @returns Description of the unit's role
 */
export function getPhaseRoleDescription(
  unitType: CombatUnitType,
  phase: CombatPhase
): string {
  const effectiveness = UNIT_EFFECTIVENESS[unitType][phase];

  switch (unitType) {
    case "soldiers":
      if (phase === "ground") return "Capture enemy planets";
      if (phase === "guerilla") return "Conduct hit-and-run raids";
      break;
    case "fighters":
      if (phase === "orbital") return "Contest orbital control";
      break;
    case "stations":
      if (phase === "orbital") return "Defend orbit from attackers";
      break;
    case "lightCruisers":
      if (phase === "space") return "Engage in space combat";
      if (phase === "orbital") return "Provide orbital fire support";
      break;
    case "heavyCruisers":
      if (phase === "space") return "Heavy capital ship combat";
      break;
    case "carriers":
      return "Transport troops for invasions";
  }

  if (effectiveness === 0) {
    return "Cannot participate in this phase";
  }

  return "Provides support";
}
