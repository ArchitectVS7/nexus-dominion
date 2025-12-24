import { describe, it, expect } from "vitest";
import {
  calculateFoodConsumption,
  calculateSupportablePopulation,
  calculatePopulationGrowth,
  calculateStarvationLoss,
  calculateNetPopulationChange,
  calculateNewPopulation,
  FOOD_PER_CITIZEN,
  POPULATION_GROWTH_RATE,
  STARVATION_RATE,
  MINIMUM_POPULATION,
} from "./population";

describe("calculateFoodConsumption", () => {
  it("returns 0 for 0 population", () => {
    expect(calculateFoodConsumption(0)).toBe(0);
  });

  it("calculates correct consumption at 0.05 per citizen", () => {
    // 10,000 citizens * 0.05 = 500 food
    expect(calculateFoodConsumption(10_000)).toBe(500);
    // 50,000 citizens * 0.05 = 2,500 food
    expect(calculateFoodConsumption(50_000)).toBe(2_500);
  });

  it("handles small populations", () => {
    expect(calculateFoodConsumption(100)).toBe(5);
    expect(calculateFoodConsumption(20)).toBe(1);
  });

  it("handles negative population as 0", () => {
    expect(calculateFoodConsumption(-1000)).toBe(0);
  });
});

describe("calculateSupportablePopulation", () => {
  it("returns 0 for 0 food", () => {
    expect(calculateSupportablePopulation(0)).toBe(0);
  });

  it("calculates correct population capacity", () => {
    // 500 food / 0.05 = 10,000 citizens
    expect(calculateSupportablePopulation(500)).toBe(10_000);
  });

  it("floors the result", () => {
    // 501 food / 0.05 = 10,020
    expect(calculateSupportablePopulation(501)).toBe(10_020);
  });

  it("handles negative food", () => {
    expect(calculateSupportablePopulation(-100)).toBe(0);
  });
});

describe("calculatePopulationGrowth", () => {
  it("returns 0 for 0 population", () => {
    expect(calculatePopulationGrowth(0, 1000, 100_000)).toBe(0);
  });

  it("returns 0 when at population cap", () => {
    expect(calculatePopulationGrowth(50_000, 10_000, 50_000)).toBe(0);
  });

  it("returns 0 when food is insufficient", () => {
    // 10,000 pop needs 500 food, only 400 available
    expect(calculatePopulationGrowth(10_000, 400, 100_000)).toBe(0);
  });

  it("calculates 2% growth when fed", () => {
    // 10,000 pop * 0.02 = 200 growth
    // Need 500 food, have 1000 (surplus)
    expect(calculatePopulationGrowth(10_000, 1_000, 100_000)).toBe(200);
  });

  it("caps growth at population cap", () => {
    // 49,900 pop, cap at 50,000, growth would be 998 but capped at 100
    expect(calculatePopulationGrowth(49_900, 10_000, 50_000)).toBe(100);
  });

  it("returns 0 for negative cap", () => {
    expect(calculatePopulationGrowth(10_000, 1_000, -1)).toBe(0);
  });
});

describe("calculateStarvationLoss", () => {
  it("returns 0 when food is sufficient", () => {
    // 10,000 pop needs 500 food, have 500
    expect(calculateStarvationLoss(10_000, 500)).toBe(0);
    // Have surplus
    expect(calculateStarvationLoss(10_000, 1_000)).toBe(0);
  });

  it("returns 0 for minimum population", () => {
    expect(calculateStarvationLoss(MINIMUM_POPULATION, 0)).toBe(0);
  });

  it("calculates starvation proportional to deficit", () => {
    // 10,000 pop needs 500 food, have 250 (50% deficit)
    // Loss = floor(10,000 * 0.05 * 0.5) = floor(250) = 250
    const loss = calculateStarvationLoss(10_000, 250);
    expect(loss).toBe(250);
  });

  it("calculates full starvation for no food", () => {
    // 10,000 pop needs 500 food, have 0 (100% deficit)
    // Loss = floor(10,000 * 0.05 * 1.0) = 500
    expect(calculateStarvationLoss(10_000, 0)).toBe(500);
  });

  it("never drops below minimum population", () => {
    // 200 pop, starvation would kill more than available
    const loss = calculateStarvationLoss(200, 0);
    expect(loss).toBeLessThanOrEqual(200 - MINIMUM_POPULATION);
  });
});

describe("calculateNetPopulationChange", () => {
  it("returns positive for growth scenario", () => {
    // Well-fed population with room to grow
    const change = calculateNetPopulationChange(10_000, 1_000, 100_000);
    expect(change).toBeGreaterThan(0);
  });

  it("returns negative for starvation scenario", () => {
    // Starving population
    const change = calculateNetPopulationChange(10_000, 0, 100_000);
    expect(change).toBeLessThan(0);
  });

  it("returns 0 for exactly fed population at cap", () => {
    // Exactly fed, at cap
    const change = calculateNetPopulationChange(50_000, 2_500, 50_000);
    expect(change).toBe(0);
  });
});

describe("calculateNewPopulation", () => {
  it("grows population when well-fed", () => {
    const newPop = calculateNewPopulation(10_000, 1_000, 100_000);
    expect(newPop).toBeGreaterThan(10_000);
  });

  it("shrinks population during starvation", () => {
    const newPop = calculateNewPopulation(10_000, 0, 100_000);
    expect(newPop).toBeLessThan(10_000);
  });

  it("never goes below minimum population", () => {
    const newPop = calculateNewPopulation(200, 0, 100_000);
    expect(newPop).toBeGreaterThanOrEqual(MINIMUM_POPULATION);
  });

  it("never exceeds population cap", () => {
    const newPop = calculateNewPopulation(49_950, 10_000, 50_000);
    expect(newPop).toBeLessThanOrEqual(50_000);
  });

  it("maintains population at cap with sufficient food", () => {
    const newPop = calculateNewPopulation(50_000, 2_500, 50_000);
    expect(newPop).toBe(50_000);
  });
});

describe("constants", () => {
  it("has correct PRD values", () => {
    expect(FOOD_PER_CITIZEN).toBe(0.05);
    expect(POPULATION_GROWTH_RATE).toBe(0.02);
    expect(STARVATION_RATE).toBe(0.05);
    expect(MINIMUM_POPULATION).toBe(100);
  });
});
