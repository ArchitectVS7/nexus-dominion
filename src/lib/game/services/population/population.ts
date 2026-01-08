/**
 * Population Service
 *
 * Handles population growth, food consumption, and starvation mechanics.
 * Population grows when fed properly, shrinks during food deficits.
 *
 * PRD References:
 * - Food consumption: 0.05 food per citizen per turn
 * - Population grows at 2% per turn if fed
 * - Starvation causes 5% population loss per turn
 */

import type { PopulationUpdate, PopulationStatus } from "../types/turn-types";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Food consumption per citizen per turn (PRD: 0.05) */
export const FOOD_CONSUMPTION_PER_CITIZEN = 0.05;

/** Population growth rate when fed (2% per turn) */
export const POPULATION_GROWTH_RATE = 0.02;

/** Population loss rate during starvation (5% per turn) */
export const STARVATION_RATE = 0.05;

/** Minimum population (cannot go below this) */
export const MIN_POPULATION = 0;

// =============================================================================
// POPULATION MECHANICS
// =============================================================================

/**
 * Calculate food consumption for a given population
 *
 * @param population - Current population count
 * @returns Food consumed this turn
 *
 * @example
 * calculateFoodConsumption(10_000) // => 500 (10,000 × 0.05)
 */
export function calculateFoodConsumption(population: number): number {
  return Math.floor(population * FOOD_CONSUMPTION_PER_CITIZEN);
}

/**
 * Calculate population growth when food surplus exists
 *
 * @param population - Current population count
 * @param populationCap - Maximum population capacity
 * @returns Population growth this turn (0 if at cap)
 *
 * @example
 * calculatePopulationGrowth(10_000, 50_000) // => 200 (10,000 × 0.02)
 * calculatePopulationGrowth(50_000, 50_000) // => 0 (at cap)
 */
export function calculatePopulationGrowth(
  population: number,
  populationCap: number
): number {
  // Cannot grow if at or above cap
  if (population >= populationCap) {
    return 0;
  }

  const growth = Math.floor(population * POPULATION_GROWTH_RATE);

  // Don't exceed cap
  const newPopulation = population + growth;
  if (newPopulation > populationCap) {
    return populationCap - population;
  }

  return growth;
}

/**
 * Calculate population loss during starvation
 *
 * Uses graduated starvation based on deficit severity.
 * Minimum loss of 1 citizen if population > 0 and deficit exists.
 *
 * @param population - Current population count
 * @param foodDeficit - Amount of food shortage (positive number)
 * @returns Population loss this turn (always negative or zero)
 *
 * @example
 * // Minor deficit (1 food short)
 * calculateStarvation(10_000, 1) // => -500 (base 5%)
 *
 * // Severe deficit (complete starvation)
 * calculateStarvation(10_000, 500) // => -1000 (10% due to 100% deficit)
 *
 * // Small population
 * calculateStarvation(10, 5) // => -1 (minimum of 1 citizen)
 */
export function calculateStarvation(population: number, foodDeficit: number): number {
  if (population <= 0 || foodDeficit <= 0) {
    return 0;
  }

  // Calculate food consumed to determine deficit percentage
  const foodConsumed = calculateFoodConsumption(population);

  // Deficit percentage (0.0 to 1.0+)
  // If deficit = consumed (complete starvation), deficitPct = 1.0
  // If deficit > consumed (somehow), caps at 2.0 (200%)
  const deficitPct = foodConsumed > 0
    ? Math.min(2.0, foodDeficit / foodConsumed)
    : 1.0; // If no food consumed calculated, assume 100% deficit

  // Graduated starvation rate:
  // - Minor deficit (< 50%): base 5% rate
  // - Moderate deficit (50-100%): 5-10% rate
  // - Severe deficit (> 100%): 10-20% rate
  const adjustedRate = STARVATION_RATE * (1 + deficitPct);

  let loss = -Math.floor(population * adjustedRate);

  // Minimum loss of 1 citizen if food deficit exists and population > 0
  if (loss === 0 && population > 0 && foodDeficit > 0) {
    loss = -1;
  }

  // Handle JavaScript -0 edge case
  return loss === 0 ? 0 : loss;
}

/**
 * Process population for a single turn
 *
 * Handles three scenarios:
 * 1. Food surplus → population grows
 * 2. Exact food match → population stable
 * 3. Food deficit → population starves
 *
 * @param currentPopulation - Empire's current population
 * @param populationCap - Empire's population capacity
 * @param foodAvailable - Food available after consumption
 * @returns PopulationUpdate with new population and metrics
 *
 * @example
 * // Scenario 1: Growth (surplus food)
 * processPopulation(10_000, 50_000, 600)
 * // => { newPopulation: 10_200, foodConsumed: 500, populationChange: 200, status: 'growth' }
 *
 * // Scenario 2: Stable (exact match)
 * processPopulation(10_000, 50_000, 500)
 * // => { newPopulation: 10_000, foodConsumed: 500, populationChange: 0, status: 'stable' }
 *
 * // Scenario 3: Starvation (deficit)
 * processPopulation(10_000, 50_000, 300)
 * // => { newPopulation: 9_500, foodConsumed: 500, populationChange: -500, status: 'starvation' }
 */
export function processPopulation(
  currentPopulation: number,
  populationCap: number,
  foodAvailable: number
): PopulationUpdate {
  // Calculate food consumption
  const foodConsumed = calculateFoodConsumption(currentPopulation);

  // Calculate ACTUAL food requirement (before flooring) to detect true deficits
  const actualFoodRequirement = currentPopulation * FOOD_CONSUMPTION_PER_CITIZEN;

  // Determine food surplus or deficit
  const foodBalance = foodAvailable - foodConsumed;
  const actualDeficit = actualFoodRequirement - foodAvailable;

  let newPopulation: number;
  let populationChange: number;
  let status: PopulationStatus;

  // If there's an actual food shortage (even if floored consumption is 0)
  if (actualDeficit > 0) {
    // Deficit: population starves
    // Use the actual deficit for calculation (not the floored version)
    populationChange = calculateStarvation(currentPopulation, actualDeficit);
    newPopulation = Math.max(
      MIN_POPULATION,
      currentPopulation + populationChange
    );
    status = "starvation";
  } else if (foodBalance > 0) {
    // Surplus: population grows
    populationChange = calculatePopulationGrowth(
      currentPopulation,
      populationCap
    );
    newPopulation = currentPopulation + populationChange;
    status = "growth";
  } else {
    // Exact match: population stable
    populationChange = 0;
    newPopulation = currentPopulation;
    status = "stable";
  }

  return {
    newPopulation,
    foodConsumed,
    populationChange,
    status,
  };
}
