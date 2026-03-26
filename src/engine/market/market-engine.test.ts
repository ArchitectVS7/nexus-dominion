import { describe, it, expect } from "vitest";
import {
  calculateMarketPrices,
  buyResource,
  sellResource,
  applyBlockadeToMarket,
} from "./market-engine";

describe("Market System", () => {
  // REQ-038: Buy/sell resources at fluctuating prices
  describe("REQ-038: Resource trading", () => {
    it("can buy resources with credits", () => {
      const prices = calculateMarketPrices({}, {});
      const result = buyResource("ore", 5, prices, 1000);
      expect(result).not.toBeNull();
      expect(result!.quantityBought).toBe(5);
      expect(result!.creditCost).toBeGreaterThan(0);
    });

    it("cannot buy more than affordable", () => {
      const prices = calculateMarketPrices({}, {});
      const result = buyResource("ore", 1000, prices, 10);
      expect(result).not.toBeNull();
      expect(result!.quantityBought).toBeLessThan(1000);
    });

    it("can sell resources for credits", () => {
      const prices = calculateMarketPrices({}, {});
      const result = sellResource("food", 10, prices, 20);
      expect(result).not.toBeNull();
      expect(result!.quantitySold).toBe(10);
      expect(result!.creditsEarned).toBeGreaterThan(0);
    });

    it("cannot sell more than available", () => {
      const prices = calculateMarketPrices({}, {});
      const result = sellResource("food", 10, prices, 5);
      expect(result).not.toBeNull();
      expect(result!.quantitySold).toBe(5);
    });

    it("cannot buy or sell credits directly", () => {
      const prices = calculateMarketPrices({}, {});
      expect(buyResource("credits", 10, prices, 100)).toBeNull();
      expect(sellResource("credits", 10, prices, 100)).toBeNull();
    });

    it("prices fluctuate based on supply and demand", () => {
      const balanced = calculateMarketPrices({ food: 100 }, { food: 100 });
      const highDemand = calculateMarketPrices({ food: 50 }, { food: 200 });
      expect(highDemand.food).toBeGreaterThan(balanced.food);
    });
  });

  // REQ-039: Prices affected by trade activity/blockades/production
  describe("REQ-039: Price modifiers", () => {
    it("high supply lowers prices", () => {
      const normal = calculateMarketPrices({ ore: 100 }, { ore: 100 });
      const highSupply = calculateMarketPrices({ ore: 500 }, { ore: 100 });
      expect(highSupply.ore).toBeLessThanOrEqual(normal.ore);
    });

    it("blockade inflates local prices", () => {
      const normal = calculateMarketPrices({}, {});
      const blockaded = applyBlockadeToMarket(normal, 0.5);
      expect(blockaded.food).toBeGreaterThan(normal.food);
      expect(blockaded.ore).toBeGreaterThan(normal.ore);
      expect(blockaded.fuelCells).toBeGreaterThan(normal.fuelCells);
    });

    it("severe blockade causes higher price inflation", () => {
      const normal = calculateMarketPrices({}, {});
      const mild = applyBlockadeToMarket(normal, 0.2);
      const severe = applyBlockadeToMarket(normal, 0.8);
      expect(severe.food).toBeGreaterThan(mild.food);
    });
  });
});
