/**
 * Combat Stance System
 *
 * Stances modify attack/defense capabilities and casualty rates.
 * Players and bots choose a stance before combat begins.
 *
 * Stances:
 * - Aggressive: High attack, low defense, more casualties taken
 * - Balanced: No modifiers (default)
 * - Defensive: Low attack, high defense, fewer casualties taken
 * - Evasive: Lowest attack, slight defense, minimal casualties
 */

// =============================================================================
// TYPES
// =============================================================================

export type CombatStance = "aggressive" | "balanced" | "defensive" | "evasive";

export interface StanceModifiers {
  /** Attack roll modifier (added to d20 + TAR) */
  attackMod: number;
  /** Defense modifier (added to DEF threshold) */
  defenseMod: number;
  /** Casualty multiplier (1.0 = normal, 1.2 = 20% more) */
  casualtyMultiplier: number;
  /** Display name */
  label: string;
  /** Description for UI */
  description: string;
}

// =============================================================================
// STANCE DEFINITIONS
// =============================================================================

const STANCES: Record<CombatStance, StanceModifiers> = {
  aggressive: {
    attackMod: 3,
    defenseMod: -2,
    casualtyMultiplier: 1.2,
    label: "Aggressive",
    description: "All-out attack. +3 to hit, -2 DEF, take 20% more casualties.",
  },
  balanced: {
    attackMod: 0,
    defenseMod: 0,
    casualtyMultiplier: 1.0,
    label: "Balanced",
    description: "Standard engagement. No modifiers.",
  },
  defensive: {
    attackMod: -2,
    defenseMod: 3,
    casualtyMultiplier: 0.8,
    label: "Defensive",
    description: "Hold the line. -2 to hit, +3 DEF, take 20% fewer casualties.",
  },
  evasive: {
    attackMod: -3,
    defenseMod: 1,
    casualtyMultiplier: 0.6,
    label: "Evasive",
    description:
      "Minimize losses. -3 to hit, +1 DEF, take 40% fewer casualties.",
  },
};

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Get modifiers for a combat stance.
 *
 * @param stance - The combat stance to get modifiers for
 * @returns The stance modifiers
 *
 * @example
 * const mods = getStanceModifiers("aggressive");
 * console.log(mods.attackMod); // 3
 */
export function getStanceModifiers(stance: CombatStance): StanceModifiers {
  return STANCES[stance];
}

/**
 * Get all available stances.
 *
 * @returns Array of stance keys
 *
 * @example
 * const stances = getAllStances();
 * // ["aggressive", "balanced", "defensive", "evasive"]
 */
export function getAllStances(): CombatStance[] {
  return Object.keys(STANCES) as CombatStance[];
}

/**
 * Get all stance definitions.
 *
 * @returns Record of all stances and their modifiers
 */
export function getAllStanceModifiers(): Record<CombatStance, StanceModifiers> {
  return { ...STANCES };
}

/**
 * Calculate effective attack modifier including stance.
 *
 * @param baseTAR - Base targeting stat from unit
 * @param stance - Combat stance
 * @returns Total attack modifier (TAR + stance mod)
 *
 * @example
 * const attackMod = getEffectiveAttackMod(4, "aggressive");
 * // 4 + 3 = 7
 */
export function getEffectiveAttackMod(
  baseTAR: number,
  stance: CombatStance
): number {
  return baseTAR + STANCES[stance].attackMod;
}

/**
 * Calculate effective defense including stance.
 *
 * @param baseDEF - Base defense stat from unit
 * @param stance - Combat stance
 * @returns Total defense threshold (DEF + stance mod)
 *
 * @example
 * const defense = getEffectiveDefense(15, "defensive");
 * // 15 + 3 = 18
 */
export function getEffectiveDefense(
  baseDEF: number,
  stance: CombatStance
): number {
  return baseDEF + STANCES[stance].defenseMod;
}

/**
 * Apply casualty multiplier based on stance.
 *
 * @param baseCasualties - Base casualty count before stance
 * @param stance - Combat stance
 * @returns Adjusted casualty count
 *
 * @example
 * const casualties = applyCasualtyModifier(100, "evasive");
 * // 100 * 0.6 = 60
 */
export function applyCasualtyModifier(
  baseCasualties: number,
  stance: CombatStance
): number {
  return Math.round(baseCasualties * STANCES[stance].casualtyMultiplier);
}

/**
 * Validate that a string is a valid stance.
 *
 * @param stance - String to validate
 * @returns True if valid stance
 */
export function isValidStance(stance: string): stance is CombatStance {
  return stance in STANCES;
}

/**
 * Get the default stance for new combats.
 *
 * @returns The default stance ("balanced")
 */
export function getDefaultStance(): CombatStance {
  return "balanced";
}
