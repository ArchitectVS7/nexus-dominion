import { describe, it, expect } from "vitest";
import {
  calculateLossRate,
  calculateCasualties,
  calculateCombatCasualties,
  calculateVariance,
  calculateRetreatCasualties,
  CASUALTY_BASE_RATE,
  CASUALTY_MIN_RATE,
  CASUALTY_MAX_RATE,
  BAD_ATTACK_THRESHOLD,
  OVERWHELMING_THRESHOLD,
  VARIANCE_MIN,
  VARIANCE_MAX,
  RETREAT_CASUALTY_RATE,
} from "./casualties";

describe("calculateLossRate", () => {
  it("returns base rate for equal power", () => {
    const rate = calculateLossRate(100, 100);
    expect(rate).toBe(CASUALTY_BASE_RATE);
  });

  it("returns max rate when attacking superior force", () => {
    // Power ratio > 2 triggers bad attack penalty
    const rate = calculateLossRate(100, 250);
    expect(rate).toBe(CASUALTY_MAX_RATE);
  });

  it("returns min rate with overwhelming force", () => {
    // Power ratio < 0.5 triggers overwhelming bonus
    const rate = calculateLossRate(100, 40);
    expect(rate).toBe(CASUALTY_MIN_RATE);
  });

  it("handles zero attack power", () => {
    const rate = calculateLossRate(0, 100);
    expect(rate).toBe(CASUALTY_MAX_RATE);
  });

  it("handles zero defense power", () => {
    const rate = calculateLossRate(100, 0);
    expect(rate).toBe(CASUALTY_MIN_RATE);
  });

  it("returns base rate for moderate disadvantage", () => {
    // Power ratio 1.5 - not enough for penalty
    const rate = calculateLossRate(100, 150);
    expect(rate).toBe(CASUALTY_BASE_RATE);
  });

  it("returns base rate for moderate advantage", () => {
    // Power ratio 0.6 - not enough for bonus
    const rate = calculateLossRate(100, 60);
    expect(rate).toBe(CASUALTY_BASE_RATE);
  });
});

describe("calculateVariance", () => {
  it("returns minimum variance for random value 0", () => {
    expect(calculateVariance(0)).toBe(VARIANCE_MIN);
  });

  it("returns maximum variance for random value 1", () => {
    expect(calculateVariance(1)).toBe(VARIANCE_MAX);
  });

  it("returns middle variance for random value 0.5", () => {
    const middleVariance = (VARIANCE_MIN + VARIANCE_MAX) / 2;
    expect(calculateVariance(0.5)).toBe(middleVariance);
  });

  it("returns value within valid range for random", () => {
    const variance = calculateVariance();
    expect(variance).toBeGreaterThanOrEqual(VARIANCE_MIN);
    expect(variance).toBeLessThanOrEqual(VARIANCE_MAX);
  });
});

describe("calculateCasualties", () => {
  it("returns 0 for 0 units", () => {
    expect(calculateCasualties(0, 0.25, 1.0)).toBe(0);
  });

  it("returns 0 for 0 loss rate", () => {
    expect(calculateCasualties(100, 0, 1.0)).toBe(0);
  });

  it("calculates correct casualties for base rate", () => {
    // 1000 units * 0.25 rate * 1.0 variance = 250
    expect(calculateCasualties(1000, CASUALTY_BASE_RATE, 1.0)).toBe(250);
  });

  it("calculates correct casualties with variance", () => {
    // 1000 units * 0.25 rate * 0.8 variance = 200
    expect(calculateCasualties(1000, 0.25, 0.8)).toBe(200);
    // 1000 units * 0.25 rate * 1.2 variance = 300
    expect(calculateCasualties(1000, 0.25, 1.2)).toBe(300);
  });

  it("floors the result", () => {
    // 100 units * 0.15 rate * 1.0 variance = 15
    expect(calculateCasualties(100, 0.15, 1.0)).toBe(15);
    // 100 units * 0.17 rate * 1.0 variance = 17
    expect(calculateCasualties(100, 0.17, 1.0)).toBe(17);
  });

  it("never returns more than unit count", () => {
    // Even with high rate and variance, can't lose more than you have
    expect(calculateCasualties(100, 1.0, 2.0)).toBe(100);
  });

  it("handles negative units gracefully", () => {
    expect(calculateCasualties(-100, 0.25, 1.0)).toBe(0);
  });
});

describe("calculateCombatCasualties", () => {
  it("combines loss rate and variance calculations", () => {
    // Use deterministic random value
    const casualties = calculateCombatCasualties(1000, 100, 100, 0.5);
    // Loss rate: 0.25 (equal power)
    // Variance: 0.8 + 0.5 * 0.4 = 1.0
    // Casualties: floor(1000 * 0.25 * 1.0) = 250
    expect(casualties).toBe(250);
  });

  it("applies bad attack penalty", () => {
    // Attacker is much weaker
    const casualties = calculateCombatCasualties(1000, 100, 300, 0);
    // Loss rate: 0.35 (bad attack)
    // Variance: 0.8 (min)
    // Casualties: floor(1000 * 0.35 * 0.8) = 280
    expect(casualties).toBe(280);
  });

  it("applies overwhelming force bonus", () => {
    // Attacker is much stronger
    const casualties = calculateCombatCasualties(1000, 300, 100, 0);
    // Loss rate: 0.15 (overwhelming)
    // Variance: 0.8 (min)
    // Casualties: floor(1000 * 0.15 * 0.8) = 120
    expect(casualties).toBe(120);
  });
});

describe("calculateRetreatCasualties", () => {
  it("returns 0 for 0 units", () => {
    expect(calculateRetreatCasualties(0)).toBe(0);
  });

  it("returns 0 for negative units", () => {
    expect(calculateRetreatCasualties(-100)).toBe(0);
  });

  it("calculates 15% casualties", () => {
    expect(calculateRetreatCasualties(100)).toBe(15);
    expect(calculateRetreatCasualties(1000)).toBe(150);
  });

  it("floors the result", () => {
    // 50 * 0.15 = 7.5 -> 7
    expect(calculateRetreatCasualties(50)).toBe(7);
  });
});

describe("constants", () => {
  it("has correct PRD values", () => {
    expect(CASUALTY_BASE_RATE).toBe(0.25);
    expect(CASUALTY_MIN_RATE).toBe(0.15);
    expect(CASUALTY_MAX_RATE).toBe(0.35);
  });

  it("has correct thresholds", () => {
    expect(BAD_ATTACK_THRESHOLD).toBe(2.0);
    expect(OVERWHELMING_THRESHOLD).toBe(0.5);
  });

  it("has correct variance range", () => {
    expect(VARIANCE_MIN).toBe(0.8);
    expect(VARIANCE_MAX).toBe(1.2);
  });

  it("has correct retreat rate", () => {
    expect(RETREAT_CASUALTY_RATE).toBe(0.15);
  });
});
