/**
 * Unit Upgrade Configuration (M3 / PRD 9.2)
 *
 * Defines upgrade costs and stat bonuses for all unit types.
 * Each unit can be upgraded from level 0 to level 2 (3 levels total).
 */

import type { UnitType } from "./unit-config";

// =============================================================================
// UPGRADE COSTS (Research Points)
// =============================================================================

/** Maximum upgrade level (0, 1, 2 = 3 levels) */
export const MAX_UPGRADE_LEVEL = 2;

/**
 * Research point cost to upgrade from one level to the next.
 * Level 0 → 1: 500 RP
 * Level 1 → 2: 1000 RP
 */
export const UPGRADE_COSTS: Record<number, number> = {
  0: 500,   // Cost to go from level 0 to level 1
  1: 1_000, // Cost to go from level 1 to level 2
} as const;

/**
 * Get the research point cost to upgrade from a specific level.
 */
export function getUpgradeCost(currentLevel: number): number {
  if (currentLevel >= MAX_UPGRADE_LEVEL) {
    return 0; // Already at max level
  }
  return UPGRADE_COSTS[currentLevel] ?? 0;
}

/**
 * Get the total investment to reach a specific level from 0.
 */
export function getTotalUpgradeInvestment(targetLevel: number): number {
  let total = 0;
  for (let i = 0; i < targetLevel; i++) {
    total += UPGRADE_COSTS[i] ?? 0;
  }
  return total;
}

// =============================================================================
// SOLDIER UPGRADES (PRD 9.2)
// =============================================================================

/**
 * Soldier upgrade bonuses at each level.
 * - Level 0: Guerilla 1×, Ground 1×, Pirate 0.5× (default)
 * - Level 1: Guerilla 1.5×, Ground 1×, Pirate 1×
 * - Level 2: Guerilla 0.5×, Ground 2×, Pirate 2×
 */
export const SOLDIER_UPGRADES = {
  0: { guerilla: 1.0, ground: 1.0, pirate: 0.5 },
  1: { guerilla: 1.5, ground: 1.0, pirate: 1.0 },
  2: { guerilla: 0.5, ground: 2.0, pirate: 2.0 },
} as const;

// =============================================================================
// CARRIER UPGRADES (PRD 9.2)
// =============================================================================

/**
 * Carrier upgrade bonuses at each level.
 * - Level 0: Toughness 1×, Speed 1×, Cargo 1× (default)
 * - Level 1: Toughness 2×, Speed 2×, Cargo 0.5×
 * - Level 2: Toughness 4×, Speed 4×, Cargo 0.25×
 */
export const CARRIER_UPGRADES = {
  0: { toughness: 1.0, speed: 1.0, cargo: 1.0 },
  1: { toughness: 2.0, speed: 2.0, cargo: 0.5 },
  2: { toughness: 4.0, speed: 4.0, cargo: 0.25 },
} as const;

// =============================================================================
// GENERIC UNIT UPGRADES
// =============================================================================

/**
 * Generic combat bonuses for units without specific upgrade paths.
 * - Level 0: Attack 1×, Defense 1× (default)
 * - Level 1: Attack 1.25×, Defense 1.25×
 * - Level 2: Attack 1.5×, Defense 1.5×
 */
export const GENERIC_COMBAT_UPGRADES = {
  0: { attack: 1.0, defense: 1.0 },
  1: { attack: 1.25, defense: 1.25 },
  2: { attack: 1.5, defense: 1.5 },
} as const;

// =============================================================================
// COVERT AGENT UPGRADES
// =============================================================================

/**
 * Covert Agent upgrade bonuses at each level.
 * - Level 0: Stealth 1×, Effectiveness 1× (default)
 * - Level 1: Stealth 1.5×, Effectiveness 1.25×
 * - Level 2: Stealth 2×, Effectiveness 1.5×
 */
export const COVERT_AGENT_UPGRADES = {
  0: { stealth: 1.0, effectiveness: 1.0 },
  1: { stealth: 1.5, effectiveness: 1.25 },
  2: { stealth: 2.0, effectiveness: 1.5 },
} as const;

// =============================================================================
// UPGRADE BONUSES LOOKUP
// =============================================================================

export type SoldierBonus = (typeof SOLDIER_UPGRADES)[0 | 1 | 2];
export type CarrierBonus = (typeof CARRIER_UPGRADES)[0 | 1 | 2];
export type GenericCombatBonus = (typeof GENERIC_COMBAT_UPGRADES)[0 | 1 | 2];
export type CovertAgentBonus = (typeof COVERT_AGENT_UPGRADES)[0 | 1 | 2];

export type UpgradeBonus = SoldierBonus | CarrierBonus | GenericCombatBonus | CovertAgentBonus;

/**
 * Get the upgrade bonuses for a specific unit type and level.
 */
export function getUpgradeBonuses(
  unitType: UnitType,
  level: number
): Record<string, number> {
  const clampedLevel = Math.max(0, Math.min(level, MAX_UPGRADE_LEVEL)) as 0 | 1 | 2;

  switch (unitType) {
    case "soldiers":
      return { ...SOLDIER_UPGRADES[clampedLevel] };
    case "carriers":
      return { ...CARRIER_UPGRADES[clampedLevel] };
    case "covertAgents":
      return { ...COVERT_AGENT_UPGRADES[clampedLevel] };
    default:
      return { ...GENERIC_COMBAT_UPGRADES[clampedLevel] };
  }
}

// =============================================================================
// UPGRADE DESCRIPTIONS
// =============================================================================

export const UPGRADE_DESCRIPTIONS: Record<UnitType, Record<number, string>> = {
  soldiers: {
    0: "Standard infantry with guerilla capabilities",
    1: "Enhanced guerilla warfare and anti-piracy training",
    2: "Elite ground forces with maximum pirate suppression",
  },
  fighters: {
    0: "Standard orbital combat craft",
    1: "Improved maneuverability and weapon systems",
    2: "Elite fighter squadrons with advanced targeting",
  },
  stations: {
    0: "Standard defensive orbital platforms",
    1: "Reinforced armor and improved weapon range",
    2: "Fortified stations with maximum defensive capability",
  },
  lightCruisers: {
    0: "Standard light space combat vessels",
    1: "Enhanced speed and firepower",
    2: "Elite cruiser squadrons with advanced shields",
  },
  heavyCruisers: {
    0: "Standard heavy battleships",
    1: "Improved armor plating and weapons",
    2: "Maximum combat effectiveness",
  },
  carriers: {
    0: "Standard troop transports",
    1: "Fast assault carriers (reduced capacity)",
    2: "Heavy assault carriers (minimal capacity)",
  },
  covertAgents: {
    0: "Standard espionage operatives",
    1: "Enhanced stealth and mission success rate",
    2: "Elite operatives with maximum effectiveness",
  },
} as const;

/**
 * Get the description for a unit upgrade level.
 */
export function getUpgradeDescription(unitType: UnitType, level: number): string {
  const clampedLevel = Math.max(0, Math.min(level, MAX_UPGRADE_LEVEL));
  return UPGRADE_DESCRIPTIONS[unitType][clampedLevel] ?? "Unknown upgrade";
}
