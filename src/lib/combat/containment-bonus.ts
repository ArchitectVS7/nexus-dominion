/**
 * Containment Bonus System (M7.3)
 *
 * Provides combat bonuses for empires attacking a boss from an adjacent sector.
 * This creates natural anti-snowball pressure as neighboring empires gain
 * advantages when containing dominant powers.
 *
 * Mechanics:
 * - +15% attack power when attacking boss from adjacent sector
 * - Reduced force cost modifier (1.1× instead of 1.2×)
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const CONTAINMENT_CONSTANTS = {
  /** Attack power bonus when attacking boss from adjacent sector (+15%) */
  ATTACK_BONUS: 0.15,
  /** Force cost reduction (1.2× → 1.1× = 0.1 reduction) */
  FORCE_COST_REDUCTION: 0.1,
  /** Standard cross-sector force multiplier */
  STANDARD_FORCE_MULTIPLIER: 1.2,
  /** Reduced force multiplier when containing a boss */
  CONTAINMENT_FORCE_MULTIPLIER: 1.1,
};

// =============================================================================
// TYPES
// =============================================================================

export interface ContainmentBonus {
  /** Attack power bonus multiplier (e.g., 0.15 = +15%) */
  attackBonus: number;
  /** Force cost reduction (e.g., 0.1 means 1.2× → 1.1×) */
  forceCostReduction: number;
  /** Whether the bonus is active */
  isActive: boolean;
  /** Reason for the bonus (or why it's not active) */
  reason: string;
}

export interface ContainmentContext {
  /** Attacker's home sector/region ID */
  attackerRegionId: string;
  /** Defender's home sector/region ID */
  defenderRegionId: string;
  /** Whether the defender is a boss */
  defenderIsBoss: boolean;
  /** Map of region IDs to their adjacent region IDs */
  adjacencyMap: Map<string, string[]>;
}

// =============================================================================
// CONTAINMENT BONUS CALCULATION
// =============================================================================

/**
 * Calculate the containment bonus for an attack.
 *
 * @param context The containment context with attacker/defender info
 * @returns The containment bonus (or null bonus if not applicable)
 */
export function calculateContainmentBonus(
  context: ContainmentContext
): ContainmentBonus {
  const { attackerRegionId, defenderRegionId, defenderIsBoss, adjacencyMap } =
    context;

  // No bonus if defender is not a boss
  if (!defenderIsBoss) {
    return {
      attackBonus: 0,
      forceCostReduction: 0,
      isActive: false,
      reason: "Defender is not a dominant empire",
    };
  }

  // Same sector = no bonus (you're already fighting the boss directly)
  if (attackerRegionId === defenderRegionId) {
    return {
      attackBonus: 0,
      forceCostReduction: 0,
      isActive: false,
      reason: "Same sector attacks do not receive containment bonus",
    };
  }

  // Check if attacker is in an adjacent sector
  const defenderAdjacentSectors = adjacencyMap.get(defenderRegionId) ?? [];
  const isAdjacent = defenderAdjacentSectors.includes(attackerRegionId);

  // Also check the reverse (in case adjacency is stored one-way)
  const attackerAdjacentSectors = adjacencyMap.get(attackerRegionId) ?? [];
  const isAdjacentReverse = attackerAdjacentSectors.includes(defenderRegionId);

  if (!isAdjacent && !isAdjacentReverse) {
    return {
      attackBonus: 0,
      forceCostReduction: 0,
      isActive: false,
      reason: "Attacker is not in an adjacent sector to the boss",
    };
  }

  // Containment bonus is active!
  return {
    attackBonus: CONTAINMENT_CONSTANTS.ATTACK_BONUS,
    forceCostReduction: CONTAINMENT_CONSTANTS.FORCE_COST_REDUCTION,
    isActive: true,
    reason: "Adjacent sector containment bonus against dominant empire",
  };
}

/**
 * Apply containment bonus to attack power.
 *
 * @param basePower The base attack power
 * @param bonus The containment bonus
 * @returns The modified attack power
 */
export function applyContainmentAttackBonus(
  basePower: number,
  bonus: ContainmentBonus
): number {
  if (!bonus.isActive) {
    return basePower;
  }

  return basePower * (1 + bonus.attackBonus);
}

/**
 * Calculate the force cost multiplier with containment bonus.
 *
 * @param standardMultiplier The standard force multiplier (usually 1.2×)
 * @param bonus The containment bonus
 * @returns The adjusted force multiplier
 */
export function applyContainmentForceCostReduction(
  standardMultiplier: number,
  bonus: ContainmentBonus
): number {
  if (!bonus.isActive) {
    return standardMultiplier;
  }

  // Apply reduction (e.g., 1.2 - 0.1 = 1.1)
  return Math.max(1.0, standardMultiplier - bonus.forceCostReduction);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if an empire is adjacent to a boss empire.
 *
 * @param empireRegionId The empire's region ID
 * @param bossRegionId The boss's region ID
 * @param adjacencyMap The region adjacency map
 * @returns True if the empire is adjacent to the boss
 */
export function isAdjacentToBoss(
  empireRegionId: string,
  bossRegionId: string,
  adjacencyMap: Map<string, string[]>
): boolean {
  if (empireRegionId === bossRegionId) {
    return false; // Same sector doesn't count
  }

  const bossAdjacent = adjacencyMap.get(bossRegionId) ?? [];
  const empireAdjacent = adjacencyMap.get(empireRegionId) ?? [];

  return (
    bossAdjacent.includes(empireRegionId) ||
    empireAdjacent.includes(bossRegionId)
  );
}

/**
 * Get all empires eligible for containment bonus against a boss.
 *
 * @param bossRegionId The boss's region ID
 * @param allEmpireRegions Map of empire IDs to their region IDs
 * @param adjacencyMap The region adjacency map
 * @returns Array of empire IDs eligible for containment bonus
 */
export function getContainmentEligibleEmpires(
  bossRegionId: string,
  allEmpireRegions: Map<string, string>,
  adjacencyMap: Map<string, string[]>
): string[] {
  const eligibleEmpires: string[] = [];

  for (const [empireId, regionId] of Array.from(allEmpireRegions.entries())) {
    if (isAdjacentToBoss(regionId, bossRegionId, adjacencyMap)) {
      eligibleEmpires.push(empireId);
    }
  }

  return eligibleEmpires;
}
