/**
 * Population Mechanics (PRD 4.4)
 *
 * Calculates population food consumption, growth, and starvation.
 * - Food consumption: 0.05 food per citizen per turn
 * - Growth depends on food surplus and population cap
 * - Starvation occurs when food is insufficient
 */

// =============================================================================
// CONSTANTS (PRD 4.4)
// =============================================================================

/** Food consumed per citizen per turn */
export const FOOD_PER_CITIZEN = 0.05;

/** Base population growth rate (2% per turn when fed) */
export const POPULATION_GROWTH_RATE = 0.02;

/** Starvation death rate when food runs out (5% per turn) */
export const STARVATION_RATE = 0.05;

/** Minimum population (empire always has some citizens) */
export const MINIMUM_POPULATION = 100;

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Calculate the food required to feed the population for one turn.
 *
 * Formula (PRD 4.4):
 * FoodConsumption = Population × 0.05
 *
 * Example:
 * - 10,000 citizens: 10,000 × 0.05 = 500 food
 * - 50,000 citizens: 50,000 × 0.05 = 2,500 food
 *
 * @param population - Current population count
 * @returns Food required per turn
 */
export function calculateFoodConsumption(population: number): number {
  if (population <= 0) {
    return 0;
  }
  return population * FOOD_PER_CITIZEN;
}

/**
 * Calculate the population that can be supported by available food.
 *
 * @param availableFood - Food available per turn
 * @returns Maximum supportable population
 */
export function calculateSupportablePopulation(availableFood: number): number {
  if (availableFood <= 0) {
    return 0;
  }
  return Math.floor(availableFood / FOOD_PER_CITIZEN);
}

/**
 * Calculate population growth for the turn.
 * Growth only occurs if there's a food surplus and room under the cap.
 *
 * @param currentPopulation - Current population count
 * @param foodAvailable - Total food available this turn
 * @param populationCap - Maximum population capacity
 * @returns Number of new citizens (can be 0)
 */
export function calculatePopulationGrowth(
  currentPopulation: number,
  foodAvailable: number,
  populationCap: number
): number {
  if (currentPopulation <= 0 || populationCap <= 0) {
    return 0;
  }

  // Check if there's room to grow
  if (currentPopulation >= populationCap) {
    return 0;
  }

  // Check if there's a food surplus
  const foodNeeded = calculateFoodConsumption(currentPopulation);
  const foodSurplus = foodAvailable - foodNeeded;

  if (foodSurplus <= 0) {
    return 0;
  }

  // Calculate growth (capped at population cap)
  const potentialGrowth = Math.floor(currentPopulation * POPULATION_GROWTH_RATE);
  const roomToGrow = populationCap - currentPopulation;
  const growth = Math.min(potentialGrowth, roomToGrow);

  return Math.max(0, growth);
}

/**
 * Calculate population loss due to starvation.
 * Occurs when there isn't enough food to feed everyone.
 *
 * @param currentPopulation - Current population count
 * @param foodAvailable - Total food available this turn
 * @returns Number of citizens lost to starvation (>= 0)
 */
export function calculateStarvationLoss(
  currentPopulation: number,
  foodAvailable: number
): number {
  if (currentPopulation <= MINIMUM_POPULATION) {
    return 0;
  }

  const foodNeeded = calculateFoodConsumption(currentPopulation);
  const foodDeficit = foodNeeded - foodAvailable;

  if (foodDeficit <= 0) {
    return 0; // No starvation if food is sufficient
  }

  // Calculate starvation proportional to deficit
  const deficitRatio = foodDeficit / foodNeeded;
  const baseLoss = Math.floor(currentPopulation * STARVATION_RATE * deficitRatio);

  // Ensure we don't go below minimum population
  const maxLoss = currentPopulation - MINIMUM_POPULATION;
  return Math.min(baseLoss, maxLoss);
}

/**
 * Calculate the net population change for a turn.
 * Combines growth and starvation effects.
 *
 * @param currentPopulation - Current population count
 * @param foodAvailable - Total food available this turn
 * @param populationCap - Maximum population capacity
 * @returns Net change in population (positive for growth, negative for loss)
 */
export function calculateNetPopulationChange(
  currentPopulation: number,
  foodAvailable: number,
  populationCap: number
): number {
  const growth = calculatePopulationGrowth(
    currentPopulation,
    foodAvailable,
    populationCap
  );
  const loss = calculateStarvationLoss(currentPopulation, foodAvailable);
  return growth - loss;
}

/**
 * Calculate the new population after a turn.
 *
 * @param currentPopulation - Current population count
 * @param foodAvailable - Total food available this turn
 * @param populationCap - Maximum population capacity
 * @returns New population count (always >= MINIMUM_POPULATION)
 */
export function calculateNewPopulation(
  currentPopulation: number,
  foodAvailable: number,
  populationCap: number
): number {
  const change = calculateNetPopulationChange(
    currentPopulation,
    foodAvailable,
    populationCap
  );
  const newPopulation = currentPopulation + change;
  return Math.max(MINIMUM_POPULATION, Math.min(newPopulation, populationCap));
}
