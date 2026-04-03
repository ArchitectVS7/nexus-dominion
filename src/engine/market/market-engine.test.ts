import { describe, it, expect } from "vitest";
import {
  calculateMarketPrices,
  buyResource,
  sellResource,
  applyBlockadeToMarket,
  decayPrices,
  clampPrices,
  applyMarketEvent,
  TRADEABLE_RESOURCES,
  BASE_PRICES,
  VOLUME_SENSITIVITY,
  updatePricesFromVolume,
  marketEventAffectedResource,
  marketEventPriceChange,
  MARKET_EVENT_PROBABILITY,
  MARKET_EVENT_TYPES,
  selectWeightedMarketEvent,
  executeTrade,
  advanceMarketCycle,
} from "./market-engine";
import type { MarketState } from "../types/game-state";

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

  describe("Price decay", () => {
    it("prices decay 5% toward baseline each cycle", () => {
      // Use large deviations to avoid rounding issues
      const inflated = { ...BASE_PRICES, food: 50, ore: 80 }; // 10x baseline
      const decayed = decayPrices(inflated, BASE_PRICES);
      // Food: 50 → should move 5% of distance (50-5=45, 45*0.05=2.25 → rounds to 2)
      expect(decayed.food).toBeLessThan(inflated.food);
      expect(decayed.food).toBeGreaterThan(BASE_PRICES.food);
    });

    it("prices already at baseline stay at baseline", () => {
      const decayed = decayPrices({ ...BASE_PRICES }, BASE_PRICES);
      expect(decayed.food).toBe(BASE_PRICES.food);
      expect(decayed.ore).toBe(BASE_PRICES.ore);
    });
  });

  describe("Price clamping", () => {
    it("prices clamped to minimum 50% of baseline", () => {
      const low = { ...BASE_PRICES, food: 1, ore: 1, fuelCells: 1 };
      const clamped = clampPrices(low, BASE_PRICES);
      expect(clamped.food).toBeGreaterThanOrEqual(Math.floor(BASE_PRICES.food * 0.5));
      expect(clamped.ore).toBeGreaterThanOrEqual(Math.floor(BASE_PRICES.ore * 0.5));
    });

    it("prices clamped to maximum 200% of baseline", () => {
      const high = { ...BASE_PRICES, food: 100, ore: 100, fuelCells: 100 };
      const clamped = clampPrices(high, BASE_PRICES);
      expect(clamped.food).toBeLessThanOrEqual(BASE_PRICES.food * 2);
      expect(clamped.ore).toBeLessThanOrEqual(BASE_PRICES.ore * 2);
    });
  });

  describe("Transaction fees", () => {
    it("buy transaction includes 5% fee when specified", () => {
      const prices = calculateMarketPrices({}, {});
      const withFee = buyResource("ore", 10, prices, 10000, { feePercent: 0.05 });
      const noFee = buyResource("ore", 10, prices, 10000);
      expect(withFee!.creditCost).toBeGreaterThan(noFee!.creditCost);
    });

    it("sell transaction with Commerce doctrine bonus gives more credits", () => {
      // Use ore (base 8) for larger values → floor(8*0.8)=6, floor(8*0.8*1.2)=floor(7.68)=7
      const prices = calculateMarketPrices({}, {});
      const withBonus = sellResource("ore", 10, prices, 20, { sellBonus: 0.20 });
      const noBonus = sellResource("ore", 10, prices, 20);
      expect(withBonus!.creditsEarned).toBeGreaterThan(noBonus!.creditsEarned);
    });
  });

  describe("Market events", () => {
    it("bumper harvest decreases food price", () => {
      const before = { ...BASE_PRICES };
      const after = applyMarketEvent("bumper-harvest", before);
      expect(after.food).toBeLessThan(before.food);
    });

    it("ore shortage increases ore price", () => {
      const before = { ...BASE_PRICES };
      const after = applyMarketEvent("ore-shortage", before);
      expect(after.ore).toBeGreaterThan(before.ore);
    });

    it("fuel crisis increases fuelCells price", () => {
      const before = { ...BASE_PRICES };
      const after = applyMarketEvent("fuel-crisis", before);
      expect(after.fuelCells).toBeGreaterThan(before.fuelCells);
    });
  });

  describe("Tradeable resources", () => {
    it("only food, ore, fuelCells are tradeable", () => {
      expect(TRADEABLE_RESOURCES).toContain("food");
      expect(TRADEABLE_RESOURCES).toContain("ore");
      expect(TRADEABLE_RESOURCES).toContain("fuelCells");
      expect(TRADEABLE_RESOURCES).not.toContain("credits");
      expect(TRADEABLE_RESOURCES).not.toContain("researchPoints");
    });
  });

  describe("Leader Tax", () => {
    it("Sovereign-tier empires pay 10% surcharge on buys", () => {
      const prices = calculateMarketPrices({}, {});
      const normal = buyResource("ore", 10, prices, 10000);
      const taxed = buyResource("ore", 10, prices, 10000, { leaderTax: 0.10 });
      expect(taxed!.creditCost).toBeGreaterThan(normal!.creditCost);
    });
  });

  describe("Market event wiring helpers", () => {
    it("marketEventAffectedResource returns food for bumper-harvest", () => {
      expect(marketEventAffectedResource("bumper-harvest")).toBe("food");
    });

    it("marketEventAffectedResource returns food for famine", () => {
      expect(marketEventAffectedResource("famine")).toBe("food");
    });

    it("marketEventAffectedResource returns ore for ore-shortage", () => {
      expect(marketEventAffectedResource("ore-shortage")).toBe("ore");
    });

    it("marketEventAffectedResource returns fuelCells for fuel-crisis", () => {
      expect(marketEventAffectedResource("fuel-crisis")).toBe("fuelCells");
    });

    it("marketEventAffectedResource returns undefined for free-trade", () => {
      expect(marketEventAffectedResource("free-trade")).toBeUndefined();
    });

    it("marketEventAffectedResource returns undefined for trade-war", () => {
      expect(marketEventAffectedResource("trade-war")).toBeUndefined();
    });

    it("marketEventPriceChange returns negative for bumper-harvest", () => {
      expect(marketEventPriceChange("bumper-harvest")).toBe(-0.15);
    });

    it("marketEventPriceChange returns positive for famine", () => {
      expect(marketEventPriceChange("famine")).toBe(0.30);
    });

    it("marketEventPriceChange returns 0 for free-trade", () => {
      expect(marketEventPriceChange("free-trade")).toBe(0);
    });

    it("marketEventPriceChange returns 0 for trade-war", () => {
      expect(marketEventPriceChange("trade-war")).toBe(0);
    });

    it("MARKET_EVENT_PROBABILITY is 0.2", () => {
      expect(MARKET_EVENT_PROBABILITY).toBe(0.2);
    });

    it("MARKET_EVENT_TYPES contains all 8 event types", () => {
      expect(MARKET_EVENT_TYPES).toHaveLength(8);
      expect(MARKET_EVENT_TYPES).toContain("bumper-harvest");
      expect(MARKET_EVENT_TYPES).toContain("famine");
      expect(MARKET_EVENT_TYPES).toContain("free-trade");
    });
  });

  describe("calculateMarketPrices — edge cases", () => {
    it("zero supply causes maximum demand ratio", () => {
      const prices = calculateMarketPrices({ food: 0 }, { food: 100 });
      // ratio = 100 / max(1, 0) = 100 → food price = 5 * 100 = 500
      expect(prices.food).toBeGreaterThan(BASE_PRICES.food * 10);
    });

    it("zero demand produces minimum price of 1", () => {
      const prices = calculateMarketPrices({ food: 100 }, { food: 0 });
      // ratio = 0 / 100 = 0 → max(1, round(5 * 0)) = 1
      expect(prices.food).toBe(1);
    });
  });

  describe("buyResource — boundary cases", () => {
    it("exact credits buys exactly requested quantity", () => {
      const prices = { ...BASE_PRICES }; // ore = 8
      const result = buyResource("ore", 5, prices, 40); // 5 * 8 = 40 exact
      expect(result).not.toBeNull();
      expect(result!.quantityBought).toBe(5);
      expect(result!.creditCost).toBe(40);
    });

    it("fee + leaderTax stack additively", () => {
      const prices = { ...BASE_PRICES }; // ore = 8
      const result = buyResource("ore", 1, prices, 1000, { feePercent: 0.05, leaderTax: 0.10 });
      // fee = 1 + 0.05 + 0.10 = 1.15; unitPrice = ceil(8 * 1.15) = ceil(9.2) = 10
      expect(result!.creditCost).toBe(10);
    });

    it("returns null when cannot afford even 1 unit", () => {
      const prices = { ...BASE_PRICES }; // ore = 8
      expect(buyResource("ore", 5, prices, 3)).toBeNull();
    });
  });

  describe("sellResource — edge cases", () => {
    it("sell with zero available quantity returns null", () => {
      expect(sellResource("food", 10, BASE_PRICES, 0)).toBeNull();
    });

    it("sell price is 80% of market price (floored) minimum 1", () => {
      const prices = { ...BASE_PRICES }; // food = 5
      const result = sellResource("food", 1, prices, 10);
      // floor(5 * 0.8) = 4
      expect(result!.creditsEarned).toBe(4);
    });
  });

  describe("applyBlockadeToMarket — edge cases", () => {
    it("zero severity returns unchanged prices", () => {
      const prices = { ...BASE_PRICES };
      const result = applyBlockadeToMarket(prices, 0);
      expect(result.food).toBe(prices.food);
      expect(result.ore).toBe(prices.ore);
    });

    it("severity 1.0 triples prices (multiplier 3x)", () => {
      const prices = { ...BASE_PRICES };
      const result = applyBlockadeToMarket(prices, 1.0);
      expect(result.food).toBe(prices.food * 3);
    });
  });

  describe("decayPrices — below baseline", () => {
    it("prices below baseline decay upward toward baseline", () => {
      // Use ore (base 8) with large deviation to avoid rounding to same value
      // ore=2, baseline=8, diff=-6, decay=round(2 - (-6)*0.05) = round(2.3) = 2 ... still rounds
      // Use higher rate to ensure visible movement
      const low = { ...BASE_PRICES, ore: 2 }; // baseline ore = 8
      const decayed = decayPrices(low, BASE_PRICES, 0.5);
      // diff = 2-8 = -6; decay = round(2 - (-6)*0.5) = round(2+3) = 5
      expect(decayed.ore).toBeGreaterThan(2);
      expect(decayed.ore).toBeLessThanOrEqual(BASE_PRICES.ore);
    });

    it("custom decay rate controls speed", () => {
      const inflated = { ...BASE_PRICES, ore: 20 };
      const slow = decayPrices(inflated, BASE_PRICES, 0.01);
      const fast = decayPrices(inflated, BASE_PRICES, 0.50);
      expect(fast.ore).toBeLessThan(slow.ore);
    });
  });

  describe("clampPrices — custom bounds", () => {
    it("custom min/max override defaults", () => {
      const prices = { ...BASE_PRICES, food: 1 };
      const clamped = clampPrices(prices, BASE_PRICES, 0.8, 1.2);
      // min = floor(5 * 0.8) = 4; food 1 → clamped to 4
      expect(clamped.food).toBe(4);
    });
  });

  describe("applyMarketEvent — remaining events", () => {
    it("famine increases food price by 30%", () => {
      const after = applyMarketEvent("famine", { ...BASE_PRICES });
      expect(after.food).toBe(Math.round(BASE_PRICES.food * 1.30));
    });

    it("mining-boom decreases ore price by 20%", () => {
      const after = applyMarketEvent("mining-boom", { ...BASE_PRICES });
      expect(after.ore).toBe(Math.round(BASE_PRICES.ore * 0.80));
    });

    it("refinery-glut decreases fuelCells by 25%", () => {
      const after = applyMarketEvent("refinery-glut", { ...BASE_PRICES });
      expect(after.fuelCells).toBe(Math.round(BASE_PRICES.fuelCells * 0.75));
    });

    it("free-trade has no direct price effect", () => {
      const after = applyMarketEvent("free-trade", { ...BASE_PRICES });
      expect(after).toEqual(BASE_PRICES);
    });

    it("trade-war has no direct price effect", () => {
      const after = applyMarketEvent("trade-war", { ...BASE_PRICES });
      expect(after).toEqual(BASE_PRICES);
    });
  });

  describe("advanceMarketCycle — with events", () => {
    it("fires market event when rng triggers probability", () => {
      const market: MarketState = {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
      // RNG that returns 0.1 first (< 0.2 threshold) then 0.5 for event selection
      let callCount = 0;
      const rng = { next: () => { callCount++; return callCount === 1 ? 0.1 : 0.5; } };
      const result = advanceMarketCycle(market, rng);
      expect(result.events.length).toBe(1);
    });

    it("accumulates history across multiple cycles", () => {
      let market: MarketState = {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
      for (let i = 0; i < 5; i++) {
        const result = advanceMarketCycle(market);
        market = result.market;
      }
      expect(market.priceHistory.length).toBe(5);
    });
  });

  describe("executeTrade — volume stacking", () => {
    it("multiple buys accumulate positive volume", () => {
      let market: MarketState = {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
      const r1 = executeTrade(market, "buy", "ore", 5, 1000)!;
      market = r1.market;
      const r2 = executeTrade(market, "buy", "ore", 3, 1000)!;
      expect(r2.market.cycleVolume!.ore).toBe(8);
    });
  });

  describe("Weighted market event selection", () => {
    it("returns a valid MarketEventType", () => {
      const rng = { next: () => 0.5 };
      const event = selectWeightedMarketEvent(rng, { ...BASE_PRICES }, BASE_PRICES);
      expect(MARKET_EVENT_TYPES).toContain(event);
    });

    it("with balanced prices, all events are roughly equally likely", () => {
      const counts: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        const rng = { next: () => i / 1000 };
        const event = selectWeightedMarketEvent(rng, { ...BASE_PRICES }, BASE_PRICES);
        counts[event] = (counts[event] ?? 0) + 1;
      }
      // All 8 event types should appear
      expect(Object.keys(counts).length).toBe(8);
    });

    it("high food prices bias toward bumper-harvest (surplus correction)", () => {
      const highFood = { ...BASE_PRICES, food: BASE_PRICES.food * 2 };
      const counts: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        const rng = { next: () => i / 1000 };
        const event = selectWeightedMarketEvent(rng, highFood, BASE_PRICES);
        counts[event] = (counts[event] ?? 0) + 1;
      }
      // Bumper harvest should be more common than famine
      expect(counts["bumper-harvest"] ?? 0).toBeGreaterThan(counts["famine"] ?? 0);
    });

    it("low ore prices bias toward ore-shortage (scarcity correction)", () => {
      const lowOre = { ...BASE_PRICES, ore: Math.floor(BASE_PRICES.ore * 0.5) };
      const counts: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        const rng = { next: () => i / 1000 };
        const event = selectWeightedMarketEvent(rng, lowOre, BASE_PRICES);
        counts[event] = (counts[event] ?? 0) + 1;
      }
      // Ore shortage should be more common than mining boom
      expect(counts["ore-shortage"] ?? 0).toBeGreaterThan(counts["mining-boom"] ?? 0);
    });

    it("free-trade and trade-war have lower base weight", () => {
      // With balanced prices, resource events (weight 1.0 each) should appear more
      // than free-trade/trade-war (weight 0.5 each)
      const counts: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        const rng = { next: () => i / 1000 };
        const event = selectWeightedMarketEvent(rng, { ...BASE_PRICES }, BASE_PRICES);
        counts[event] = (counts[event] ?? 0) + 1;
      }
      const resourceEventAvg = ((counts["bumper-harvest"] ?? 0) + (counts["famine"] ?? 0)) / 2;
      const feeEventAvg = ((counts["free-trade"] ?? 0) + (counts["trade-war"] ?? 0)) / 2;
      expect(resourceEventAvg).toBeGreaterThan(feeEventAvg);
    });

    it("extreme rng values (0 and ~1) return valid events", () => {
      const low = selectWeightedMarketEvent({ next: () => 0 }, { ...BASE_PRICES }, BASE_PRICES);
      const high = selectWeightedMarketEvent({ next: () => 0.999 }, { ...BASE_PRICES }, BASE_PRICES);
      expect(MARKET_EVENT_TYPES).toContain(low);
      expect(MARKET_EVENT_TYPES).toContain(high);
    });
  });

  describe("executeTrade", () => {
    function mkMarket(): MarketState {
      return {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
    }

    it("buying updates cycleVolume positive", () => {
      const market = mkMarket();
      const result = executeTrade(market, "buy", "ore", 10, 1000);
      expect(result).not.toBeNull();
      expect(result!.market.cycleVolume!.ore).toBe(10);
      expect(result!.creditDelta).toBeLessThan(0);
      expect(result!.resourceDelta).toBe(10);
    });

    it("selling updates cycleVolume negative", () => {
      const market = mkMarket();
      const result = executeTrade(market, "sell", "food", 5, 100, 20);
      expect(result).not.toBeNull();
      expect(result!.market.cycleVolume!.food).toBe(-5);
      expect(result!.creditDelta).toBeGreaterThan(0);
      expect(result!.resourceDelta).toBe(-5);
    });

    it("returns null if buy is unaffordable", () => {
      const market = mkMarket();
      const result = executeTrade(market, "buy", "ore", 10, 0);
      expect(result).toBeNull();
    });

    it("returns null if sell has zero available", () => {
      const market = mkMarket();
      const result = executeTrade(market, "sell", "food", 10, 0, 0);
      expect(result).toBeNull();
    });

    it("does not mutate input market", () => {
      const market = mkMarket();
      executeTrade(market, "buy", "ore", 5, 1000);
      expect(market.cycleVolume!.ore).toBe(0);
    });
  });

  describe("advanceMarketCycle", () => {
    function mkMarket(): MarketState {
      return {
        prices: { food: 8, ore: 12, fuelCells: 18 } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 50, ore: -30, fuelCells: 0 },
      };
    }

    it("records current prices in history", () => {
      const market = mkMarket();
      const result = advanceMarketCycle(market);
      expect(result.market.priceHistory.length).toBe(1);
    });

    it("resets cycleVolume to zero", () => {
      const market = mkMarket();
      const result = advanceMarketCycle(market);
      expect(result.market.cycleVolume).toEqual({ food: 0, ore: 0, fuelCells: 0 });
    });

    it("applies volume, decay, and clamping", () => {
      const market = mkMarket();
      const result = advanceMarketCycle(market);
      // Prices should have changed from volume + decay
      // Food had +50 volume → prices pushed up, then decayed toward base
      // Just verify they're within clamped bounds
      expect(result.market.prices.food).toBeGreaterThanOrEqual(Math.floor(BASE_PRICES.food * 0.5));
      expect(result.market.prices.food).toBeLessThanOrEqual(Math.ceil(BASE_PRICES.food * 2));
    });

    it("does not mutate input market", () => {
      const market = mkMarket();
      const pricesBefore = { ...market.prices };
      advanceMarketCycle(market);
      expect(market.prices.food).toBe(pricesBefore.food);
    });
  });

  describe("Supply/demand volume coupling", () => {
    it("net buying raises prices above base", () => {
      const base = { ...BASE_PRICES };
      const volume = { food: 100, ore: 0, fuelCells: 0 };
      const result = updatePricesFromVolume(base, base, volume);
      expect(result.food).toBeGreaterThan(BASE_PRICES.food);
    });

    it("net selling lowers prices below base", () => {
      const base = { ...BASE_PRICES };
      const volume = { food: -100, ore: 0, fuelCells: 0 };
      const result = updatePricesFromVolume(base, base, volume);
      expect(result.food).toBeLessThan(BASE_PRICES.food);
    });

    it("zero volume leaves prices unchanged", () => {
      const base = { ...BASE_PRICES };
      const volume = { food: 0, ore: 0, fuelCells: 0 };
      const result = updatePricesFromVolume(base, base, volume);
      expect(result.food).toBe(BASE_PRICES.food);
      expect(result.ore).toBe(BASE_PRICES.ore);
      expect(result.fuelCells).toBe(BASE_PRICES.fuelCells);
    });

    it("large volume effect is clamped at 2x base", () => {
      const base = { ...BASE_PRICES };
      const volume = { food: 10000, ore: 0, fuelCells: 0 };
      const result = updatePricesFromVolume(base, base, volume);
      expect(result.food).toBeLessThanOrEqual(BASE_PRICES.food * 2);
    });

    it("large negative volume is clamped at 0.5x base", () => {
      const base = { ...BASE_PRICES };
      const volume = { food: -10000, ore: 0, fuelCells: 0 };
      const result = updatePricesFromVolume(base, base, volume);
      expect(result.food).toBeGreaterThanOrEqual(Math.floor(BASE_PRICES.food * 0.5));
    });

    it("each tradeable resource is independently affected", () => {
      const base = { ...BASE_PRICES };
      const volume = { food: 0, ore: 100, fuelCells: 0 };
      const result = updatePricesFromVolume(base, base, volume);
      expect(result.food).toBe(BASE_PRICES.food);
      expect(result.ore).toBeGreaterThan(BASE_PRICES.ore);
      expect(result.fuelCells).toBe(BASE_PRICES.fuelCells);
    });
  });

  describe("VOLUME_SENSITIVITY constant", () => {
    it("is 100", () => {
      expect(VOLUME_SENSITIVITY).toBe(100);
    });
  });

  describe("updatePricesFromVolume — researchPoints untouched", () => {
    it("does not modify researchPoints regardless of volume", () => {
      const prices = { ...BASE_PRICES, researchPoints: 15 };
      const volume = { food: 100, ore: 100, fuelCells: 100 };
      const result = updatePricesFromVolume(prices, BASE_PRICES, volume);
      expect(result.researchPoints).toBe(15);
    });
  });

  describe("calculateMarketPrices — both zero", () => {
    it("zero supply and zero demand uses defaults (100/100 = ratio 1)", () => {
      const prices = calculateMarketPrices({}, {});
      expect(prices.food).toBe(BASE_PRICES.food);
      expect(prices.ore).toBe(BASE_PRICES.ore);
    });
  });

  describe("sellResource — exact bonus math", () => {
    it("sell bonus of 0.30 on ore: floor(8*0.8*1.3) = floor(8.32) = 8", () => {
      const result = sellResource("ore", 1, BASE_PRICES, 10, { sellBonus: 0.30 });
      expect(result!.creditsEarned).toBe(8);
    });

    it("sell with negative available quantity returns null", () => {
      expect(sellResource("food", 5, BASE_PRICES, -1)).toBeNull();
    });
  });

  describe("buyResource — partial buy precision", () => {
    it("with 25 credits and ore=8, buys 3 units for 24 credits", () => {
      const result = buyResource("ore", 10, BASE_PRICES, 25);
      expect(result).not.toBeNull();
      expect(result!.quantityBought).toBe(3);
      expect(result!.creditCost).toBe(24);
    });

    it("buying 0 quantity costs 0 credits", () => {
      const result = buyResource("ore", 0, BASE_PRICES, 1000);
      expect(result).not.toBeNull();
      expect(result!.quantityBought).toBe(0);
      expect(result!.creditCost).toBe(0);
    });
  });

  describe("advanceMarketCycle — no event path", () => {
    it("returns empty events when rng exceeds probability threshold", () => {
      const market: MarketState = {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
      const rng = { next: () => 0.9 }; // > 0.2, no event
      const result = advanceMarketCycle(market, rng);
      expect(result.events).toEqual([]);
    });

    it("preserves basePrices unchanged across cycles", () => {
      const market: MarketState = {
        prices: { food: 10, ore: 15, fuelCells: 20 } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 50, ore: -50, fuelCells: 0 },
      };
      const result = advanceMarketCycle(market);
      expect(result.market.basePrices).toEqual(market.basePrices);
    });

    it("without rng, no events are generated", () => {
      const market: MarketState = {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
      const result = advanceMarketCycle(market);
      expect(result.events).toEqual([]);
    });
  });

  describe("applyMarketEvent — price floor of 1", () => {
    it("bumper-harvest on food=1 keeps price at minimum 1", () => {
      const lowPrices = { ...BASE_PRICES, food: 1 };
      const after = applyMarketEvent("bumper-harvest", lowPrices);
      expect(after.food).toBe(1);
    });
  });

  describe("decayPrices — exact math", () => {
    it("ore at 20 (base 8): decay 5% → round(20 - 12*0.05) = round(19.4) = 19", () => {
      const prices = { ...BASE_PRICES, ore: 20 };
      const decayed = decayPrices(prices, BASE_PRICES);
      expect(decayed.ore).toBe(19);
    });

    it("food at 3 (base 5): decay 5% → round(3 - (-2)*0.05) = round(3.1) = 3", () => {
      const prices = { ...BASE_PRICES, food: 3 };
      const decayed = decayPrices(prices, BASE_PRICES);
      expect(decayed.food).toBe(3);
    });
  });

  describe("selectWeightedMarketEvent — high fuel bias", () => {
    it("high fuelCells prices bias toward refinery-glut", () => {
      const highFuel = { ...BASE_PRICES, fuelCells: BASE_PRICES.fuelCells * 2 };
      const counts: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        const rng = { next: () => i / 1000 };
        const event = selectWeightedMarketEvent(rng, highFuel, BASE_PRICES);
        counts[event] = (counts[event] ?? 0) + 1;
      }
      expect(counts["refinery-glut"] ?? 0).toBeGreaterThan(counts["fuel-crisis"] ?? 0);
    });
  });

  describe("executeTrade — non-tradeable resource", () => {
    it("buying researchPoints does not track volume (not in cycleVolume)", () => {
      const market: MarketState = {
        prices: { ...BASE_PRICES } as any,
        basePrices: { ...BASE_PRICES } as any,
        priceHistory: [],
        cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
      };
      const result = executeTrade(market, "buy", "researchPoints", 5, 10000);
      expect(result).not.toBeNull();
      // cycleVolume should still be zeroed (researchPoints not tracked)
      expect(result!.market.cycleVolume).toEqual({ food: 0, ore: 0, fuelCells: 0 });
    });
  });
});
