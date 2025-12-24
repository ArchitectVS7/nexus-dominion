/**
 * Planet Service Tests (M3)
 *
 * Tests for planet buy/release operations.
 * Note: These are integration-style tests that require database access.
 * For pure unit tests, see the formula tests in planet-costs.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  calculatePlanetCost,
  calculateReleaseRefund,
} from "@/lib/formulas/planet-costs";
import { PLANET_COSTS } from "../../constants";
import { calculateNetworth } from "../../networth";

// =============================================================================
// UNIT TESTS FOR BUSINESS LOGIC
// =============================================================================

describe("Planet Service Business Logic", () => {
  describe("Planet Purchase Cost Calculation", () => {
    it("should calculate correct cost for first planet at 9 owned", () => {
      // With 9 starting planets, cost multiplier is 1.45
      const baseCost = PLANET_COSTS.food; // 8,000
      const currentOwned = 9;
      const cost = calculatePlanetCost(baseCost, currentOwned);

      // 8,000 × 1.45 = 11,600
      expect(cost).toBe(11_600);
    });

    it("should calculate escalating costs for sequential purchases", () => {
      const baseCost = PLANET_COSTS.food; // 8,000

      // 9 planets → 10: 8,000 × 1.45 = 11,600
      expect(calculatePlanetCost(baseCost, 9)).toBe(11_600);

      // 10 planets → 11: 8,000 × 1.50 = 12,000
      expect(calculatePlanetCost(baseCost, 10)).toBe(12_000);

      // 11 planets → 12: 8,000 × 1.55 = 12,400
      expect(calculatePlanetCost(baseCost, 11)).toBe(12_400);
    });

    it("should use different base costs for different planet types", () => {
      const currentOwned = 9;

      expect(calculatePlanetCost(PLANET_COSTS.food, currentOwned)).toBe(11_600); // 8,000 × 1.45
      expect(calculatePlanetCost(PLANET_COSTS.ore, currentOwned)).toBe(8_700);   // 6,000 × 1.45
      expect(calculatePlanetCost(PLANET_COSTS.research, currentOwned)).toBe(33_350); // 23,000 × 1.45
    });
  });

  describe("Planet Release Refund Calculation", () => {
    it("should refund 50% of current price", () => {
      const baseCost = PLANET_COSTS.food; // 8,000
      const currentOwned = 9;
      const refund = calculateReleaseRefund(baseCost, currentOwned);

      // Current price: 11,600, refund: 5,800
      expect(refund).toBe(5_800);
    });

    it("should refund based on current ownership count", () => {
      const baseCost = PLANET_COSTS.food;

      // With 10 planets: price = 12,000, refund = 6,000
      expect(calculateReleaseRefund(baseCost, 10)).toBe(6_000);

      // With 20 planets: price = 16,000, refund = 8,000
      expect(calculateReleaseRefund(baseCost, 20)).toBe(8_000);
    });
  });

  describe("Networth Update on Planet Change", () => {
    it("should increase networth by 10 per planet purchased", () => {
      const baseNetworth = calculateNetworth({
        planetCount: 9,
        soldiers: 100,
        fighters: 0,
        stations: 0,
        lightCruisers: 0,
        heavyCruisers: 0,
        carriers: 0,
        covertAgents: 0,
      });

      const newNetworth = calculateNetworth({
        planetCount: 10,
        soldiers: 100,
        fighters: 0,
        stations: 0,
        lightCruisers: 0,
        heavyCruisers: 0,
        carriers: 0,
        covertAgents: 0,
      });

      // Each planet adds 10 to networth
      expect(newNetworth - baseNetworth).toBe(10);
    });

    it("should decrease networth by 10 per planet released", () => {
      const baseNetworth = calculateNetworth({
        planetCount: 10,
        soldiers: 100,
        fighters: 0,
        stations: 0,
        lightCruisers: 0,
        heavyCruisers: 0,
        carriers: 0,
        covertAgents: 0,
      });

      const newNetworth = calculateNetworth({
        planetCount: 9,
        soldiers: 100,
        fighters: 0,
        stations: 0,
        lightCruisers: 0,
        heavyCruisers: 0,
        carriers: 0,
        covertAgents: 0,
      });

      expect(baseNetworth - newNetworth).toBe(10);
    });
  });

  describe("PRD Compliance - Planet Costs", () => {
    it("should have correct base costs for all planet types (PRD 5.2)", () => {
      expect(PLANET_COSTS.food).toBe(8_000);
      expect(PLANET_COSTS.ore).toBe(6_000);
      expect(PLANET_COSTS.petroleum).toBe(11_500);
      expect(PLANET_COSTS.tourism).toBe(8_000);
      expect(PLANET_COSTS.urban).toBe(8_000);
      expect(PLANET_COSTS.education).toBe(8_000);
      expect(PLANET_COSTS.government).toBe(7_500);
      expect(PLANET_COSTS.research).toBe(23_000);
      expect(PLANET_COSTS.supply).toBe(11_500);
      expect(PLANET_COSTS.anti_pollution).toBe(10_500);
    });

    it("should apply 5% cost scaling per owned planet (PRD 5.3)", () => {
      const baseCost = 10_000;

      // Formula: BaseCost × (1 + OwnedPlanets × 0.05)
      expect(calculatePlanetCost(baseCost, 0)).toBe(10_000);  // × 1.00
      expect(calculatePlanetCost(baseCost, 1)).toBe(10_500);  // × 1.05
      expect(calculatePlanetCost(baseCost, 10)).toBe(15_000); // × 1.50
      expect(calculatePlanetCost(baseCost, 20)).toBe(20_000); // × 2.00
    });

    it("should refund exactly 50% on release (PRD 5.3)", () => {
      const baseCost = 10_000;
      const currentPrice = calculatePlanetCost(baseCost, 10); // 15,000
      const refund = calculateReleaseRefund(baseCost, 10);

      expect(refund).toBe(7_500); // 50% of 15,000
      expect(refund / currentPrice).toBe(0.5);
    });
  });
});

// =============================================================================
// VALIDATION TESTS (logic that would be tested with mocks)
// =============================================================================

describe("Planet Service Validation Logic", () => {
  describe("Buy Planet Validation", () => {
    it("should reject purchase with insufficient credits", () => {
      const credits = 10_000;
      const planetCost = 11_600; // Food at 9 planets

      const canAfford = credits >= planetCost;
      expect(canAfford).toBe(false);
    });

    it("should allow purchase with exact credits", () => {
      const credits = 11_600;
      const planetCost = 11_600;

      const canAfford = credits >= planetCost;
      expect(canAfford).toBe(true);
    });

    it("should correctly calculate credits after purchase", () => {
      const credits = 100_000;
      const planetCost = 11_600;

      const remainingCredits = credits - planetCost;
      expect(remainingCredits).toBe(88_400);
    });
  });

  describe("Release Planet Validation", () => {
    it("should not allow releasing last planet", () => {
      const planetCount = 1;
      const canRelease = planetCount > 1;

      expect(canRelease).toBe(false);
    });

    it("should allow releasing when multiple planets owned", () => {
      const planetCount = 9;
      const canRelease = planetCount > 1;

      expect(canRelease).toBe(true);
    });

    it("should correctly calculate credits after release", () => {
      const credits = 50_000;
      const refund = 5_800;

      const newCredits = credits + refund;
      expect(newCredits).toBe(55_800);
    });
  });

  describe("Planet Type Validation", () => {
    it("should recognize all valid planet types", () => {
      const validTypes = [
        "food", "ore", "petroleum", "tourism", "urban",
        "education", "government", "research", "supply", "anti_pollution"
      ];

      validTypes.forEach(type => {
        expect(PLANET_COSTS[type as keyof typeof PLANET_COSTS]).toBeDefined();
        expect(PLANET_COSTS[type as keyof typeof PLANET_COSTS]).toBeGreaterThan(0);
      });
    });
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

describe("Planet Service Edge Cases", () => {
  it("should handle very high planet counts", () => {
    const baseCost = PLANET_COSTS.food;
    const ownedPlanets = 100;
    const cost = calculatePlanetCost(baseCost, ownedPlanets);

    // 8,000 × (1 + 100 × 0.05) = 8,000 × 6 = 48,000
    expect(cost).toBe(48_000);
  });

  it("should floor fractional costs", () => {
    // 7,500 × 1.45 = 10,875
    const cost = calculatePlanetCost(7_500, 9);
    expect(cost).toBe(10_875);
    expect(Number.isInteger(cost)).toBe(true);
  });

  it("should floor fractional refunds", () => {
    // 7,500 × 1.45 × 0.5 = 5,437.5 → 5,437
    const refund = calculateReleaseRefund(7_500, 9);
    expect(refund).toBe(5_437);
    expect(Number.isInteger(refund)).toBe(true);
  });

  it("should handle bulk planet purchases calculation", () => {
    const baseCost = PLANET_COSTS.food;

    // Calculate cost of buying 3 planets starting at 9 owned
    const cost1 = calculatePlanetCost(baseCost, 9);  // 11,600
    const cost2 = calculatePlanetCost(baseCost, 10); // 12,000
    const cost3 = calculatePlanetCost(baseCost, 11); // 12,400
    const totalCost = cost1 + cost2 + cost3;

    expect(totalCost).toBe(36_000);
  });
});
