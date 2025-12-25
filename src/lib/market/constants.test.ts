import { describe, it, expect } from "vitest";
import {
  MARKET_BASE_PRICES,
  PRICE_MULTIPLIER_MIN,
  PRICE_MULTIPLIER_MAX,
  PRICE_ADJUSTMENT_RATE,
  SUPPLY_DEMAND_DECAY,
  IMBALANCE_THRESHOLD,
  MARKET_FEE_PERCENT,
  calculateMarketPrice,
  calculateMarketFee,
  decaySupplyDemand,
} from "./constants";

// =============================================================================
// CONSTANTS TESTS
// =============================================================================

describe("MARKET_BASE_PRICES constants", () => {
  it("has correct base prices", () => {
    expect(MARKET_BASE_PRICES.food).toBe(10);
    expect(MARKET_BASE_PRICES.ore).toBe(15);
    expect(MARKET_BASE_PRICES.petroleum).toBe(25);
  });
});

describe("PRICE_MULTIPLIER bounds", () => {
  it("has correct PRD bounds (0.4x to 1.6x)", () => {
    expect(PRICE_MULTIPLIER_MIN).toBe(0.4);
    expect(PRICE_MULTIPLIER_MAX).toBe(1.6);
  });
});

describe("SUPPLY_DEMAND constants", () => {
  it("has correct adjustment rate", () => {
    expect(PRICE_ADJUSTMENT_RATE).toBe(0.02);
  });

  it("has correct decay rate", () => {
    expect(SUPPLY_DEMAND_DECAY).toBe(0.9);
  });

  it("has correct imbalance threshold", () => {
    expect(IMBALANCE_THRESHOLD).toBe(100);
  });
});

describe("MARKET_FEE constants", () => {
  it("has correct fee percentage (2%)", () => {
    expect(MARKET_FEE_PERCENT).toBe(0.02);
  });
});

// =============================================================================
// calculateMarketPrice
// =============================================================================

describe("calculateMarketPrice", () => {
  it("returns base price with 1.0 multiplier when supply equals demand", () => {
    const result = calculateMarketPrice(100, 500, 500);
    expect(result.multiplier).toBe(1.0);
    expect(result.price).toBe(100);
  });

  it("returns base price when imbalance is below threshold", () => {
    // Imbalance of 50 (below threshold of 100)
    const result = calculateMarketPrice(100, 100, 150);
    expect(result.multiplier).toBe(1.0);
    expect(result.price).toBe(100);
  });

  it("increases price when demand exceeds supply by threshold", () => {
    // Imbalance of +200 (high demand)
    const result = calculateMarketPrice(100, 0, 200);
    expect(result.multiplier).toBeGreaterThan(1.0);
    expect(result.price).toBeGreaterThan(100);
  });

  it("decreases price when supply exceeds demand by threshold", () => {
    // Imbalance of -200 (high supply)
    const result = calculateMarketPrice(100, 200, 0);
    expect(result.multiplier).toBeLessThan(1.0);
    expect(result.price).toBeLessThan(100);
  });

  it("clamps multiplier to minimum bound (0.4x)", () => {
    // Very high supply should hit the minimum
    const result = calculateMarketPrice(100, 100000, 0);
    expect(result.multiplier).toBe(PRICE_MULTIPLIER_MIN);
    expect(result.price).toBe(100 * PRICE_MULTIPLIER_MIN);
  });

  it("clamps multiplier to maximum bound (1.6x)", () => {
    // Very high demand should hit the maximum
    const result = calculateMarketPrice(100, 0, 100000);
    expect(result.multiplier).toBe(PRICE_MULTIPLIER_MAX);
    expect(result.price).toBe(100 * PRICE_MULTIPLIER_MAX);
  });

  it("correctly applies to food base price", () => {
    const result = calculateMarketPrice(MARKET_BASE_PRICES.food, 0, 0);
    expect(result.price).toBe(10);
    expect(result.multiplier).toBe(1.0);
  });

  it("correctly applies to ore base price", () => {
    const result = calculateMarketPrice(MARKET_BASE_PRICES.ore, 0, 0);
    expect(result.price).toBe(15);
    expect(result.multiplier).toBe(1.0);
  });

  it("correctly applies to petroleum base price", () => {
    const result = calculateMarketPrice(MARKET_BASE_PRICES.petroleum, 0, 0);
    expect(result.price).toBe(25);
    expect(result.multiplier).toBe(1.0);
  });

  it("calculates intermediate price adjustments correctly", () => {
    // Imbalance of exactly +200 (double the threshold)
    // Should add (200/100) * 0.02 = 0.04 to multiplier
    const result = calculateMarketPrice(100, 0, 200);
    expect(result.multiplier).toBeCloseTo(1.04, 5);
    expect(result.price).toBeCloseTo(104, 5);
  });
});

// =============================================================================
// calculateMarketFee
// =============================================================================

describe("calculateMarketFee", () => {
  it("returns 0 for zero cost", () => {
    expect(calculateMarketFee(0)).toBe(0);
  });

  it("calculates 2% fee correctly", () => {
    // 2% of 1000 = 20
    expect(calculateMarketFee(1000)).toBe(20);
  });

  it("floors the fee to integer", () => {
    // 2% of 150 = 3
    expect(calculateMarketFee(150)).toBe(3);
    // 2% of 50 = 1
    expect(calculateMarketFee(50)).toBe(1);
    // 2% of 25 = 0.5 -> floors to 0
    expect(calculateMarketFee(25)).toBe(0);
  });

  it("calculates fee for typical transaction amounts", () => {
    expect(calculateMarketFee(500)).toBe(10);
    expect(calculateMarketFee(2500)).toBe(50);
    expect(calculateMarketFee(10000)).toBe(200);
  });
});

// =============================================================================
// decaySupplyDemand
// =============================================================================

describe("decaySupplyDemand", () => {
  it("returns 0 for zero value", () => {
    expect(decaySupplyDemand(0)).toBe(0);
  });

  it("applies 90% decay (10% reduction)", () => {
    // 90% of 1000 = 900
    expect(decaySupplyDemand(1000)).toBe(900);
  });

  it("floors the result to integer", () => {
    // 90% of 15 = 13.5 -> floors to 13
    expect(decaySupplyDemand(15)).toBe(13);
    // 90% of 7 = 6.3 -> floors to 6
    expect(decaySupplyDemand(7)).toBe(6);
  });

  it("approaches zero over multiple turns", () => {
    let value = 1000;
    for (let i = 0; i < 10; i++) {
      value = decaySupplyDemand(value);
    }
    // After 10 turns of 90% decay, should be very low
    expect(value).toBeLessThan(400);
  });

  it("handles small values correctly", () => {
    expect(decaySupplyDemand(1)).toBe(0); // 90% of 1 = 0.9 -> 0
    expect(decaySupplyDemand(2)).toBe(1); // 90% of 2 = 1.8 -> 1
    expect(decaySupplyDemand(10)).toBe(9); // 90% of 10 = 9
  });
});
