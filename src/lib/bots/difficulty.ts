/**
 * Difficulty System
 *
 * Defines difficulty modifiers that affect bot behavior:
 * - Easy: 50% chance of suboptimal choices
 * - Normal: Balanced bot intelligence
 * - Hard: Bots target weakest enemies
 * - Nightmare: +25% resources and target weakest
 */

import type { Difficulty, DifficultyModifiers, EmpireTarget } from "./types";

// =============================================================================
// DIFFICULTY MODIFIERS
// =============================================================================

export const DIFFICULTY_MODIFIERS: Record<Difficulty, DifficultyModifiers> = {
  easy: {
    resourceBonus: 1.0,
    suboptimalChance: 0.5, // 50% chance of suboptimal choice
    targetWeakest: false,
  },
  normal: {
    resourceBonus: 1.0,
    suboptimalChance: 0.0,
    targetWeakest: false,
  },
  hard: {
    resourceBonus: 1.0,
    suboptimalChance: 0.0,
    targetWeakest: true, // Target weakest enemies
  },
  nightmare: {
    resourceBonus: 1.25, // +25% resources
    suboptimalChance: 0.0,
    targetWeakest: true,
  },
};

/**
 * Get difficulty modifiers for a given difficulty level.
 */
export function getDifficultyModifiers(
  difficulty: Difficulty
): DifficultyModifiers {
  return DIFFICULTY_MODIFIERS[difficulty];
}

/**
 * Apply nightmare resource bonus to income.
 * Returns the income multiplied by the bonus factor.
 */
export function applyNightmareBonus(
  income: number,
  difficulty: Difficulty
): number {
  const modifiers = getDifficultyModifiers(difficulty);
  return Math.floor(income * modifiers.resourceBonus);
}

/**
 * Check if a suboptimal choice should be made (Easy mode).
 * Returns true if the bot should make a worse decision.
 *
 * @param difficulty - Current difficulty level
 * @param random - Optional random value for testing (0-1)
 */
export function shouldMakeSuboptimalChoice(
  difficulty: Difficulty,
  random?: number
): boolean {
  const modifiers = getDifficultyModifiers(difficulty);
  const roll = random ?? Math.random();
  return roll < modifiers.suboptimalChance;
}

/**
 * Select a target based on difficulty.
 * - Easy/Normal: Random target
 * - Hard/Nightmare: Weakest target by networth
 *
 * @param targets - Available targets to choose from
 * @param difficulty - Current difficulty level
 * @param random - Optional random value for testing (0-1)
 */
export function selectTarget(
  targets: EmpireTarget[],
  difficulty: Difficulty,
  random?: number
): EmpireTarget | null {
  if (targets.length === 0) {
    return null;
  }

  const modifiers = getDifficultyModifiers(difficulty);

  if (modifiers.targetWeakest) {
    // Hard/Nightmare: Target the weakest by networth
    const sorted = [...targets].sort((a, b) => a.networth - b.networth);
    return sorted[0] ?? null;
  }

  // Easy/Normal: Random target
  const roll = random ?? Math.random();
  const index = Math.floor(roll * targets.length);
  return targets[index] ?? null;
}

/**
 * Apply suboptimal choice logic for Easy mode.
 * When triggered, returns a worse alternative (e.g., smaller quantity, random target).
 *
 * @param value - Original value
 * @param minValue - Minimum acceptable value
 * @param difficulty - Current difficulty level
 * @param random - Optional random value for testing
 */
export function applySuboptimalQuantity(
  value: number,
  minValue: number,
  difficulty: Difficulty,
  random?: number
): number {
  if (!shouldMakeSuboptimalChoice(difficulty, random)) {
    return value;
  }

  // Reduce to 25-75% of original value
  const reductionFactor = 0.25 + (random ?? Math.random()) * 0.5;
  const reduced = Math.floor(value * reductionFactor);
  return Math.max(minValue, reduced);
}
