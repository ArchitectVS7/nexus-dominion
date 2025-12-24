import { describe, it, expect } from "vitest";
import {
  calculatePlanetCost,
  calculateReleaseRefund,
  getPlanetCostMultiplier,
  calculateBulkPlanetCost,
  calculateAffordablePlanets,
  PLANET_COST_SCALING,
  PLANET_RELEASE_REFUND,
} from "./planet-costs";

describe("calculatePlanetCost", () => {
  it("returns base cost when owning 0 planets", () => {
    expect(calculatePlanetCost(8_000, 0)).toBe(8_000);
    expect(calculatePlanetCost(6_000, 0)).toBe(6_000);
  });

  it("applies 5% increase per owned planet", () => {
    // 8,000 * (1 + 1 * 0.05) = 8,400
    expect(calculatePlanetCost(8_000, 1)).toBe(8_400);
    // 8,000 * (1 + 5 * 0.05) = 10,000
    expect(calculatePlanetCost(8_000, 5)).toBe(10_000);
  });

  it("calculates correctly for 9 starting planets (PRD default)", () => {
    // 8,000 * (1 + 9 * 0.05) = 8,000 * 1.45 = 11,600
    expect(calculatePlanetCost(8_000, 9)).toBe(11_600);
  });

  it("handles large planet counts", () => {
    // 8,000 * (1 + 50 * 0.05) = 8,000 * 3.5 = 28,000
    expect(calculatePlanetCost(8_000, 50)).toBe(28_000);
  });

  it("returns 0 for 0 base cost", () => {
    expect(calculatePlanetCost(0, 10)).toBe(0);
  });

  it("handles negative owned planets as 0", () => {
    expect(calculatePlanetCost(8_000, -5)).toBe(8_000);
  });

  it("floors the result", () => {
    // 7,500 * 1.05 = 7,875
    expect(calculatePlanetCost(7_500, 1)).toBe(7_875);
  });
});

describe("calculateReleaseRefund", () => {
  it("returns 50% of current price", () => {
    // At 9 planets, cost is 11,600, refund is 5,800
    expect(calculateReleaseRefund(8_000, 9)).toBe(5_800);
  });

  it("returns 50% of base price for 0 planets", () => {
    expect(calculateReleaseRefund(8_000, 0)).toBe(4_000);
  });

  it("floors the result", () => {
    // 7,500 * 1.05 = 7,875 * 0.5 = 3,937.5 -> 3,937
    expect(calculateReleaseRefund(7_500, 1)).toBe(3_937);
  });
});

describe("getPlanetCostMultiplier", () => {
  it("returns 1.0 for 0 planets", () => {
    expect(getPlanetCostMultiplier(0)).toBe(1.0);
  });

  it("returns correct multipliers", () => {
    expect(getPlanetCostMultiplier(1)).toBe(1.05);
    expect(getPlanetCostMultiplier(9)).toBe(1.45);
    expect(getPlanetCostMultiplier(20)).toBe(2.0);
  });

  it("handles negative values as 0", () => {
    expect(getPlanetCostMultiplier(-5)).toBe(1.0);
  });
});

describe("calculateBulkPlanetCost", () => {
  it("returns 0 for 0 quantity", () => {
    expect(calculateBulkPlanetCost(8_000, 0, 0)).toBe(0);
  });

  it("returns single planet cost for quantity 1", () => {
    expect(calculateBulkPlanetCost(8_000, 0, 1)).toBe(8_000);
    expect(calculateBulkPlanetCost(8_000, 9, 1)).toBe(11_600);
  });

  it("calculates escalating costs for multiple planets", () => {
    // Buy 3 planets starting from 0
    // Planet 1: 8,000 * 1.0 = 8,000
    // Planet 2: 8,000 * 1.05 = 8,400
    // Planet 3: 8,000 * 1.10 = 8,800
    // Total: 25,200
    expect(calculateBulkPlanetCost(8_000, 0, 3)).toBe(25_200);
  });

  it("handles negative quantity", () => {
    expect(calculateBulkPlanetCost(8_000, 0, -5)).toBe(0);
  });
});

describe("calculateAffordablePlanets", () => {
  it("returns 0 for 0 credits", () => {
    expect(calculateAffordablePlanets(8_000, 0, 0)).toBe(0);
  });

  it("returns 0 for 0 base cost", () => {
    expect(calculateAffordablePlanets(0, 0, 100_000)).toBe(0);
  });

  it("returns 1 for exact cost", () => {
    expect(calculateAffordablePlanets(8_000, 0, 8_000)).toBe(1);
  });

  it("returns correct count for multiple planets", () => {
    // With 25,200 credits, can buy 3 planets (calculated above)
    expect(calculateAffordablePlanets(8_000, 0, 25_200)).toBe(3);
    // With 25,199 credits, can only buy 2
    expect(calculateAffordablePlanets(8_000, 0, 25_199)).toBe(2);
  });

  it("accounts for current planet count", () => {
    // Starting with 9 planets, first new planet costs 11,600
    expect(calculateAffordablePlanets(8_000, 9, 11_600)).toBe(1);
    expect(calculateAffordablePlanets(8_000, 9, 11_599)).toBe(0);
  });

  it("handles negative credits", () => {
    expect(calculateAffordablePlanets(8_000, 0, -1000)).toBe(0);
  });
});

describe("constants", () => {
  it("has correct PRD values", () => {
    expect(PLANET_COST_SCALING).toBe(0.05);
    expect(PLANET_RELEASE_REFUND).toBe(0.5);
  });
});
