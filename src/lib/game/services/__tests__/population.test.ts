/**
 * Population Service Tests
 *
 * Comprehensive test suite for population mechanics:
 * - Food consumption calculation
 * - Population growth
 * - Starvation
 * - Edge cases
 */

import { describe, it, expect } from "vitest";
import {
  calculateFoodConsumption,
  calculatePopulationGrowth,
  calculateStarvation,
  processPopulation,
  FOOD_CONSUMPTION_PER_CITIZEN,
  POPULATION_GROWTH_RATE,
  STARVATION_RATE,
} from "../population";

describe("Population Service", () => {
  describe("calculateFoodConsumption", () => {
    it("should calculate food consumption for starting population", () => {
      // Starting population: 10,000
      // Expected: 10,000 × 0.05 = 500
      expect(calculateFoodConsumption(10_000)).toBe(500);
    });

    it("should calculate food consumption for various populations", () => {
      expect(calculateFoodConsumption(1_000)).toBe(50); // 1,000 × 0.05
      expect(calculateFoodConsumption(20_000)).toBe(1_000); // 20,000 × 0.05
      expect(calculateFoodConsumption(50_000)).toBe(2_500); // 50,000 × 0.05 (at cap)
    });

    it("should return 0 for zero population", () => {
      expect(calculateFoodConsumption(0)).toBe(0);
    });

    it("should floor decimal results", () => {
      // 999 × 0.05 = 49.95, floored to 49
      expect(calculateFoodConsumption(999)).toBe(49);
    });
  });

  describe("calculatePopulationGrowth", () => {
    it("should calculate 2% growth for starting population", () => {
      // Starting: 10,000 @ 2% = 200
      const growth = calculatePopulationGrowth(10_000, 50_000);
      expect(growth).toBe(200);
    });

    it("should calculate growth for various populations", () => {
      expect(calculatePopulationGrowth(5_000, 50_000)).toBe(100); // 5,000 × 0.02
      expect(calculatePopulationGrowth(25_000, 50_000)).toBe(500); // 25,000 × 0.02
    });

    it("should return 0 growth when at population cap", () => {
      expect(calculatePopulationGrowth(50_000, 50_000)).toBe(0);
    });

    it("should return 0 growth when above population cap", () => {
      // Edge case: somehow population exceeded cap
      expect(calculatePopulationGrowth(55_000, 50_000)).toBe(0);
    });

    it("should not exceed population cap", () => {
      // Population: 49,800, Cap: 50,000
      // Growth would be 49,800 × 0.02 = 996
      // But that would exceed cap, so limit to 200
      const growth = calculatePopulationGrowth(49_800, 50_000);
      expect(growth).toBe(200); // Exactly to cap
    });

    it("should floor growth calculations", () => {
      // 999 × 0.02 = 19.98, floored to 19
      expect(calculatePopulationGrowth(999, 10_000)).toBe(19);
    });
  });

  describe("calculateStarvation", () => {
    it("should calculate base 5% loss for minor deficit (starting population)", () => {
      // Pop: 10,000, Food consumed: 500, Deficit: 1
      // Deficit %: 1/500 = 0.002 (0.2%)
      // Adjusted rate: 0.05 × (1 + 0.002) = 0.0501
      // Loss: 10,000 × 0.0501 = 501, but floor = -501
      const loss = calculateStarvation(10_000, 1);
      expect(loss).toBeLessThan(0);
      expect(loss).toBeGreaterThanOrEqual(-510); // Approximately base rate
    });

    it("should calculate graduated loss for moderate deficit (50% short)", () => {
      // Pop: 10,000, Food consumed: 500, Deficit: 250 (50%)
      // Deficit %: 250/500 = 0.5
      // Adjusted rate: 0.05 × (1 + 0.5) = 0.075 (7.5%)
      // Loss: 10,000 × 0.075 = 750
      const loss = calculateStarvation(10_000, 250);
      expect(loss).toBe(-750);
    });

    it("should calculate severe loss for complete starvation (100% deficit)", () => {
      // Pop: 10,000, Food consumed: 500, Deficit: 500 (100%)
      // Deficit %: 500/500 = 1.0
      // Adjusted rate: 0.05 × (1 + 1.0) = 0.10 (10%)
      // Loss: 10,000 × 0.10 = 1000
      const loss = calculateStarvation(10_000, 500);
      expect(loss).toBe(-1000);
    });

    it("should cap at 200% deficit for extreme shortages", () => {
      // Pop: 10,000, Food consumed: 500, Deficit: 2000 (400% but capped at 200%)
      // Deficit %: capped at 2.0
      // Adjusted rate: 0.05 × (1 + 2.0) = 0.15 (15%)
      // Loss: 10,000 × 0.15 = 1500
      const loss = calculateStarvation(10_000, 2000);
      expect(loss).toBe(-1500);
    });

    it("should enforce minimum loss of 1 citizen for small populations", () => {
      // Pop: 10, Food consumed: 0 (floor), Deficit: 5
      // Would calculate to 0 due to flooring, but minimum is -1
      const loss = calculateStarvation(10, 5);
      expect(loss).toBe(-1); // Minimum loss to prevent immortality
    });

    it("should enforce minimum loss of 1 for pop 19 (old exploit case)", () => {
      // Pop: 19, Food consumed: 0 (floor of 0.95), Deficit: any
      // Old bug: would return 0 (immortal)
      // New: returns at least -1
      const loss = calculateStarvation(19, 1);
      expect(loss).toBe(-1);
    });

    it("should always return negative values for non-zero population with deficit", () => {
      expect(calculateStarvation(10_000, 100)).toBeLessThan(0);
      expect(calculateStarvation(1_000, 50)).toBeLessThan(0);
      expect(calculateStarvation(1, 1)).toBeLessThan(0);
    });

    it("should return 0 for zero population", () => {
      expect(calculateStarvation(0, 100)).toBe(0);
    });

    it("should return 0 for zero deficit", () => {
      expect(calculateStarvation(10_000, 0)).toBe(0);
    });

    it("should floor starvation calculations", () => {
      // Pop: 999, Food consumed: 49, Deficit: 25 (51%)
      // Deficit %: 25/49 ≈ 0.51
      // Adjusted rate: 0.05 × 1.51 ≈ 0.0755
      // Loss: 999 × 0.0755 ≈ 75.4, floored to -75
      const loss = calculateStarvation(999, 25);
      expect(loss).toBeLessThanOrEqual(-75);
      expect(loss).toBeGreaterThanOrEqual(-76);
    });
  });

  describe("processPopulation - Growth Scenarios", () => {
    it("should grow population when food surplus exists", () => {
      // Population: 10,000, Cap: 50,000, Food available: 600
      // Food consumed: 500
      // Food balance: +100 (surplus)
      // Growth: 10,000 × 0.02 = 200
      const result = processPopulation(10_000, 50_000, 600);

      expect(result.newPopulation).toBe(10_200);
      expect(result.foodConsumed).toBe(500);
      expect(result.populationChange).toBe(200);
      expect(result.status).toBe("growth");
    });

    it("should grow population with small surplus", () => {
      // Even 1 food surplus triggers growth
      const result = processPopulation(10_000, 50_000, 501);

      expect(result.newPopulation).toBe(10_200);
      expect(result.populationChange).toBe(200);
      expect(result.status).toBe("growth");
    });

    it("should not grow beyond population cap", () => {
      // Population near cap with surplus
      const result = processPopulation(49_900, 50_000, 3_000);

      expect(result.newPopulation).toBe(50_000); // Capped
      expect(result.populationChange).toBe(100); // Only grew to cap
      expect(result.status).toBe("growth");
    });
  });

  describe("processPopulation - Stable Scenarios", () => {
    it("should remain stable when food exactly matches consumption", () => {
      // Population: 10,000, Food consumed: 500, Food available: 500
      const result = processPopulation(10_000, 50_000, 500);

      expect(result.newPopulation).toBe(10_000);
      expect(result.foodConsumed).toBe(500);
      expect(result.populationChange).toBe(0);
      expect(result.status).toBe("stable");
    });

    it("should remain stable at population cap with exact food", () => {
      const result = processPopulation(50_000, 50_000, 2_500);

      expect(result.newPopulation).toBe(50_000);
      expect(result.populationChange).toBe(0);
      expect(result.status).toBe("stable");
    });
  });

  describe("processPopulation - Starvation Scenarios", () => {
    it("should lose population when moderate food deficit exists", () => {
      // Population: 10,000, Food consumed: 500, Food available: 300
      // Deficit: 200 (40% short)
      // Deficit %: 200/500 = 0.4
      // Adjusted rate: 0.05 × (1 + 0.4) = 0.07
      // Starvation: 10,000 × 0.07 = 700 (approximately, may have floating point rounding)
      const result = processPopulation(10_000, 50_000, 300);

      expect(result.foodConsumed).toBe(500);
      expect(result.populationChange).toBeLessThanOrEqual(-699);
      expect(result.populationChange).toBeGreaterThanOrEqual(-701);
      expect(result.newPopulation).toBeGreaterThanOrEqual(9_299);
      expect(result.newPopulation).toBeLessThanOrEqual(9_301);
      expect(result.status).toBe("starvation");
    });

    it("should lose population with small deficit (graduated)", () => {
      // Food short: 1 food
      // Deficit %: 1/500 = 0.002
      // Adjusted rate: 0.05 × (1 + 0.002) ≈ 0.0501
      // Loss: 10,000 × 0.0501 ≈ -501
      const result = processPopulation(10_000, 50_000, 499);

      expect(result.newPopulation).toBeLessThan(10_000);
      expect(result.newPopulation).toBeGreaterThan(9_400); // Approximately base rate
      expect(result.status).toBe("starvation");
    });

    it("should handle complete food shortage (100% deficit)", () => {
      // No food available at all
      // Food consumed: 500, Deficit: 500 (100%)
      // Adjusted rate: 0.05 × (1 + 1.0) = 0.10
      // Loss: 10,000 × 0.10 = 1,000
      const result = processPopulation(10_000, 50_000, 0);

      expect(result.newPopulation).toBe(9_000); // 10,000 - 1,000
      expect(result.populationChange).toBe(-1_000);
      expect(result.status).toBe("starvation");
    });

    it("should not reduce population below zero", () => {
      // Low population: 100, Food consumed: 5, Deficit: 5 (100%)
      // Adjusted rate: 0.05 × 2 = 0.10
      // Loss: 100 × 0.10 = 10
      const result = processPopulation(100, 50_000, 0);

      expect(result.newPopulation).toBe(90); // 100 - 10
      expect(result.newPopulation).toBeGreaterThanOrEqual(0);
    });

    it("should enforce minimum loss of 1 for small populations (anti-exploit)", () => {
      // Very small population: 10
      // Food consumed: 0 (floor of 0.5), but deficit exists
      // Old bug: would return 0 loss (immortal)
      // New: minimum -1 loss
      const result = processPopulation(10, 50_000, 0);

      expect(result.newPopulation).toBe(9); // 10 - 1 (minimum)
      expect(result.populationChange).toBe(-1);
      expect(result.newPopulation).toBeGreaterThanOrEqual(0);
    });

    it("should eliminate population 1 when starving", () => {
      // Population of 1 with food deficit
      // Minimum loss is -1
      const result = processPopulation(1, 50_000, 0);

      expect(result.newPopulation).toBe(0); // Eliminated
      expect(result.populationChange).toBe(-1);
    });
  });

  describe("processPopulation - Edge Cases", () => {
    it("should handle zero population", () => {
      const result = processPopulation(0, 50_000, 1_000);

      expect(result.newPopulation).toBe(0);
      expect(result.foodConsumed).toBe(0);
      expect(result.populationChange).toBe(0);
      expect(result.status).toBe("growth"); // Surplus exists but no population to grow
    });

    it("should handle population at exact cap with surplus", () => {
      const result = processPopulation(50_000, 50_000, 5_000);

      expect(result.newPopulation).toBe(50_000);
      expect(result.populationChange).toBe(0); // Cannot grow
      expect(result.status).toBe("growth"); // Surplus exists
    });

    it("should handle very large populations", () => {
      const result = processPopulation(1_000_000, 2_000_000, 60_000);

      // Food consumed: 1,000,000 × 0.05 = 50,000
      // Food balance: 60,000 - 50,000 = +10,000 (surplus)
      // Growth: 1,000,000 × 0.02 = 20,000
      expect(result.foodConsumed).toBe(50_000);
      expect(result.populationChange).toBe(20_000);
      expect(result.newPopulation).toBe(1_020_000);
      expect(result.status).toBe("growth");
    });

    it("should maintain consistent calculations across multiple turns", () => {
      let population = 10_000;
      const cap = 50_000;

      // Simulate 10 turns of growth
      for (let i = 0; i < 10; i++) {
        const result = processPopulation(population, cap, 1_000); // Always surplus
        population = result.newPopulation;

        expect(result.status).toBe("growth");
        expect(result.newPopulation).toBeGreaterThan(population - result.populationChange);
      }

      // After 10 turns of 2% growth: ~12,190
      expect(population).toBeGreaterThan(12_000);
      expect(population).toBeLessThan(13_000);
    });
  });

  describe("Constants Verification", () => {
    it("should have correct food consumption rate", () => {
      expect(FOOD_CONSUMPTION_PER_CITIZEN).toBe(0.05); // PRD specification
    });

    it("should have correct growth rate", () => {
      expect(POPULATION_GROWTH_RATE).toBe(0.02); // 2% per turn
    });

    it("should have correct starvation rate", () => {
      expect(STARVATION_RATE).toBe(0.05); // 5% per turn
    });
  });
});
