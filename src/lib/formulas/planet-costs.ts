/**
 * Planet Cost Calculation (PRD 5.3)
 *
 * Calculates planet purchase and release costs.
 * - Cost increases as you own more planets: BaseCost × (1 + OwnedPlanets × 0.05)
 * - Release refund is 50% of current purchase price
 */

// =============================================================================
// CONSTANTS (PRD 5.3)
// =============================================================================

/** Cost scaling factor per owned planet (5% increase) */
export const PLANET_COST_SCALING = 0.05;

/** Refund percentage when releasing a planet (50%) */
export const PLANET_RELEASE_REFUND = 0.5;

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Calculate the purchase cost for a planet based on current ownership.
 *
 * Formula (PRD 5.3):
 * Cost = BaseCost × (1 + OwnedPlanets × 0.05)
 *
 * Example with 8,000 base cost:
 * - 0 planets: 8,000 × 1.00 = 8,000
 * - 9 planets: 8,000 × 1.45 = 11,600
 * - 20 planets: 8,000 × 2.00 = 16,000
 * - 50 planets: 8,000 × 3.50 = 28,000
 *
 * @param baseCost - The base cost of the planet type (from PLANET_COSTS)
 * @param ownedPlanets - Number of planets currently owned
 * @returns The purchase cost (integer, rounded down)
 */
export function calculatePlanetCost(
  baseCost: number,
  ownedPlanets: number
): number {
  if (baseCost <= 0) {
    return 0;
  }
  if (ownedPlanets < 0) {
    ownedPlanets = 0;
  }

  const multiplier = 1 + ownedPlanets * PLANET_COST_SCALING;
  return Math.floor(baseCost * multiplier);
}

/**
 * Calculate the refund amount when releasing (selling) a planet.
 *
 * Formula (PRD 5.3):
 * Refund = PurchasePrice × 0.5
 *
 * Note: The refund is based on the current purchase price at time of release,
 * not the original purchase price.
 *
 * @param baseCost - The base cost of the planet type
 * @param ownedPlanets - Number of planets currently owned (including this one)
 * @returns The refund amount (integer, rounded down)
 */
export function calculateReleaseRefund(
  baseCost: number,
  ownedPlanets: number
): number {
  const currentPrice = calculatePlanetCost(baseCost, ownedPlanets);
  return Math.floor(currentPrice * PLANET_RELEASE_REFUND);
}

/**
 * Calculate the cost multiplier for a given number of owned planets.
 * Useful for displaying the scaling factor to players.
 *
 * @param ownedPlanets - Number of planets currently owned
 * @returns The cost multiplier (e.g., 1.45 for 9 planets)
 */
export function getPlanetCostMultiplier(ownedPlanets: number): number {
  if (ownedPlanets < 0) {
    ownedPlanets = 0;
  }
  return 1 + ownedPlanets * PLANET_COST_SCALING;
}

/**
 * Calculate the total cost to purchase multiple planets of the same type.
 * Each subsequent planet costs more due to scaling.
 *
 * @param baseCost - The base cost of the planet type
 * @param currentlyOwned - Number of planets currently owned
 * @param quantity - Number of planets to purchase
 * @returns The total cost for all planets
 */
export function calculateBulkPlanetCost(
  baseCost: number,
  currentlyOwned: number,
  quantity: number
): number {
  if (quantity <= 0) {
    return 0;
  }

  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += calculatePlanetCost(baseCost, currentlyOwned + i);
  }
  return totalCost;
}

/**
 * Calculate how many planets of a type can be afforded with given credits.
 *
 * @param baseCost - The base cost of the planet type
 * @param currentlyOwned - Number of planets currently owned
 * @param availableCredits - Credits available for purchase
 * @returns Maximum number of planets that can be purchased
 */
export function calculateAffordablePlanets(
  baseCost: number,
  currentlyOwned: number,
  availableCredits: number
): number {
  if (availableCredits <= 0 || baseCost <= 0) {
    return 0;
  }

  let count = 0;
  let remainingCredits = availableCredits;

  while (true) {
    const cost = calculatePlanetCost(baseCost, currentlyOwned + count);
    if (cost > remainingCredits) {
      break;
    }
    remainingCredits -= cost;
    count++;
  }

  return count;
}
