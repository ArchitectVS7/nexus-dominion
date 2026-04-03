import type { Resources } from "../types/empire";
import type { MarketState, MarketPrices as GSMarketPrices } from "../types/game-state";

export interface MarketPrices {
  credits: number; // always 1 (base currency)
  food: number;
  ore: number;
  fuelCells: number;
  researchPoints: number;
}

export const BASE_PRICES: MarketPrices = {
  credits: 1,
  food: 5,
  ore: 8,
  fuelCells: 12,
  researchPoints: 15,
};

export const TRADEABLE_RESOURCES: (keyof MarketPrices)[] = ["food", "ore", "fuelCells"];

export interface BuyOptions {
  /** Transaction fee as fraction (e.g. 0.05 for 5%) */
  feePercent?: number;
  /** Leader Tax surcharge as fraction (e.g. 0.10 for 10%) */
  leaderTax?: number;
}

export interface SellOptions {
  /** Doctrine sell bonus as fraction (e.g. 0.20 for +20%) */
  sellBonus?: number;
}

/**
 * Calculate market prices based on supply and demand.
 */
export function calculateMarketPrices(
  supply: Partial<Resources>,
  demand: Partial<Resources>,
): MarketPrices {
  const prices = { ...BASE_PRICES };

  for (const key of ["food", "ore", "fuelCells", "researchPoints"] as const) {
    const s = (supply as Record<string, number>)[key] ?? 100;
    const d = (demand as Record<string, number>)[key] ?? 100;
    const ratio = d / Math.max(1, s);
    prices[key] = Math.max(1, Math.round(BASE_PRICES[key] * ratio));
  }

  return prices;
}

/**
 * Execute a buy transaction. Returns credits spent and resources gained.
 */
export function buyResource(
  resource: keyof MarketPrices,
  quantity: number,
  prices: MarketPrices,
  availableCredits: number,
  options?: BuyOptions,
): { creditCost: number; quantityBought: number } | null {
  if (resource === "credits") return null;
  const fee = 1 + (options?.feePercent ?? 0) + (options?.leaderTax ?? 0);
  const unitPrice = Math.ceil(prices[resource] * fee);
  const totalCost = unitPrice * quantity;
  if (totalCost > availableCredits) {
    const affordable = Math.floor(availableCredits / unitPrice);
    if (affordable <= 0) return null;
    return { creditCost: affordable * unitPrice, quantityBought: affordable };
  }
  return { creditCost: totalCost, quantityBought: quantity };
}

/**
 * Execute a sell transaction. Returns credits earned and resources consumed.
 */
export function sellResource(
  resource: keyof MarketPrices,
  quantity: number,
  prices: MarketPrices,
  availableQuantity: number,
  options?: SellOptions,
): { creditsEarned: number; quantitySold: number } | null {
  if (resource === "credits") return null;
  const sellQuantity = Math.min(quantity, availableQuantity);
  if (sellQuantity <= 0) return null;
  const bonus = 1 + (options?.sellBonus ?? 0);
  const unitPrice = Math.max(1, Math.floor(prices[resource] * 0.8 * bonus));
  return { creditsEarned: unitPrice * sellQuantity, quantitySold: sellQuantity };
}

/**
 * Apply blockade effect to market prices for a system/sector.
 */
export function applyBlockadeToMarket(
  prices: MarketPrices,
  blockadeSeverity: number,
): MarketPrices {
  const inflated = { ...prices };
  const multiplier = 1 + blockadeSeverity * 2;
  inflated.food = Math.round(inflated.food * multiplier);
  inflated.ore = Math.round(inflated.ore * multiplier);
  inflated.fuelCells = Math.round(inflated.fuelCells * multiplier);
  return inflated;
}

/* ── Price Decay ── */

/**
 * Decay prices 5% toward baseline each cycle.
 */
export function decayPrices(
  current: MarketPrices,
  baseline: MarketPrices,
  rate: number = 0.05,
): MarketPrices {
  const decayed = { ...current };
  for (const key of ["food", "ore", "fuelCells", "researchPoints"] as const) {
    const diff = current[key] - baseline[key];
    decayed[key] = Math.round(current[key] - diff * rate);
  }
  return decayed;
}

/* ── Price Clamping ── */

/**
 * Clamp prices between min% and max% of baseline.
 */
export function clampPrices(
  prices: MarketPrices,
  baseline: MarketPrices,
  min: number = 0.5,
  max: number = 2.0,
): MarketPrices {
  const clamped = { ...prices };
  for (const key of ["food", "ore", "fuelCells", "researchPoints"] as const) {
    const lo = Math.floor(baseline[key] * min);
    const hi = Math.ceil(baseline[key] * max);
    clamped[key] = Math.max(lo, Math.min(hi, clamped[key]));
  }
  return clamped;
}

/* ── Volume-Based Price Impact ── */

export const VOLUME_SENSITIVITY = 100; // net units traded per 1x base-price swing

/**
 * Adjust prices based on net trade volume accumulated this cycle.
 * Positive volume (net buying) pushes prices up; negative (net selling) pushes down.
 * Result is clamped to the same 0.5–2.0x baseline bounds as clampPrices.
 */
export function updatePricesFromVolume(
  prices: MarketPrices,
  basePrices: MarketPrices,
  volume: { food: number; ore: number; fuelCells: number },
): MarketPrices {
  const updated = { ...prices };
  for (const key of ["food", "ore", "fuelCells"] as const) {
    const netVolume = volume[key] ?? 0;
    const adjustment = 1 + netVolume / VOLUME_SENSITIVITY;
    updated[key] = Math.max(1, Math.round(prices[key] * adjustment));
  }
  return clampPrices(updated, basePrices);
}

/* ── Market Events ── */

export type MarketEventType =
  | "bumper-harvest" | "famine"
  | "mining-boom" | "ore-shortage"
  | "refinery-glut" | "fuel-crisis"
  | "free-trade" | "trade-war";

const EVENT_EFFECTS: Record<MarketEventType, Partial<Record<keyof MarketPrices, number>>> = {
  "bumper-harvest": { food: -0.15 },
  "famine": { food: 0.30 },
  "mining-boom": { ore: -0.20 },
  "ore-shortage": { ore: 0.25 },
  "refinery-glut": { fuelCells: -0.25 },
  "fuel-crisis": { fuelCells: 0.40 },
  "free-trade": {}, // handled via fee reduction, not price change
  "trade-war": {},  // handled via fee increase, not price change
};

export const MARKET_EVENT_PROBABILITY = 0.2; // 20% chance per cycle (~1 event per 5 cycles)

export const MARKET_EVENT_TYPES: MarketEventType[] = [
  "bumper-harvest", "famine", "mining-boom", "ore-shortage",
  "refinery-glut", "fuel-crisis", "free-trade", "trade-war",
];

const EVENT_AFFECTED_RESOURCE: Partial<Record<MarketEventType, string>> = {
  "bumper-harvest": "food",
  "famine": "food",
  "mining-boom": "ore",
  "ore-shortage": "ore",
  "refinery-glut": "fuelCells",
  "fuel-crisis": "fuelCells",
};

const EVENT_PRICE_CHANGE: Record<MarketEventType, number> = {
  "bumper-harvest": -0.15,
  "famine": 0.30,
  "mining-boom": -0.20,
  "ore-shortage": 0.25,
  "refinery-glut": -0.25,
  "fuel-crisis": 0.40,
  "free-trade": 0,
  "trade-war": 0,
};

/** Returns the resource affected by this event type, or undefined for fee-only events. */
export function marketEventAffectedResource(eventType: MarketEventType): string | undefined {
  return EVENT_AFFECTED_RESOURCE[eventType];
}

/** Returns the fractional price change for this event type (e.g. -0.15, 0.30, or 0). */
export function marketEventPriceChange(eventType: MarketEventType): number {
  return EVENT_PRICE_CHANGE[eventType];
}

/**
 * Select a market event type weighted by current price deviation from baseline.
 * When prices are high (scarcity), surplus events (bumper-harvest, mining-boom, refinery-glut)
 * are more likely — the market corrects. When prices are low (oversupply), shortage events
 * (famine, ore-shortage, fuel-crisis) are more likely.
 */
export function selectWeightedMarketEvent(
  rng: { next: () => number },
  prices: MarketPrices,
  basePrices: MarketPrices,
): MarketEventType {
  // For each resource pair (surplus/shortage), weight based on deviation
  const foodRatio = prices.food / Math.max(1, basePrices.food);
  const oreRatio = prices.ore / Math.max(1, basePrices.ore);
  const fuelRatio = prices.fuelCells / Math.max(1, basePrices.fuelCells);

  // Base weight 1.0 for each event; deviation adds up to 1.0 extra (capped)
  const weights: Record<MarketEventType, number> = {
    "bumper-harvest": 1.0 + Math.min(1.0, Math.max(0, (foodRatio - 1) * 2)),   // more likely when food is expensive
    "famine":         1.0 + Math.min(1.0, Math.max(0, (1 - foodRatio) * 2)),    // more likely when food is cheap
    "mining-boom":    1.0 + Math.min(1.0, Math.max(0, (oreRatio - 1) * 2)),
    "ore-shortage":   1.0 + Math.min(1.0, Math.max(0, (1 - oreRatio) * 2)),
    "refinery-glut":  1.0 + Math.min(1.0, Math.max(0, (fuelRatio - 1) * 2)),
    "fuel-crisis":    1.0 + Math.min(1.0, Math.max(0, (1 - fuelRatio) * 2)),
    "free-trade":     0.5,
    "trade-war":      0.5,
  };

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
  let roll = rng.next() * totalWeight;

  for (const eventType of MARKET_EVENT_TYPES) {
    roll -= weights[eventType];
    if (roll <= 0) return eventType;
  }
  return MARKET_EVENT_TYPES[MARKET_EVENT_TYPES.length - 1];
}

/**
 * Apply a market event to prices. Returns adjusted prices.
 */
export function applyMarketEvent(
  eventType: MarketEventType,
  prices: MarketPrices,
): MarketPrices {
  const adjusted = { ...prices };
  const effects = EVENT_EFFECTS[eventType] ?? {};
  for (const [key, modifier] of Object.entries(effects)) {
    const k = key as keyof MarketPrices;
    adjusted[k] = Math.max(1, Math.round(adjusted[k] * (1 + (modifier as number))));
  }
  return adjusted;
}

/* ── Trade Execution ── */

export interface TradeResult {
  market: MarketState;
  /** Negative for buys, positive for sells */
  creditDelta: number;
  /** Positive for buys, negative for sells */
  resourceDelta: number;
}

/**
 * Execute a single trade (buy or sell) and return updated market with volume tracked.
 * Pure function — does not mutate input.
 */
export function executeTrade(
  market: MarketState,
  direction: "buy" | "sell",
  resource: string,
  quantity: number,
  availableCredits: number,
  availableQuantity?: number,
): TradeResult | null {
  const vol = market.cycleVolume ?? { food: 0, ore: 0, fuelCells: 0 };
  const newVol = { ...vol };

  if (direction === "buy") {
    const result = buyResource(resource as keyof MarketPrices, quantity, market.prices as any, availableCredits);
    if (!result) return null;
    if (resource in newVol) (newVol as Record<string, number>)[resource] += result.quantityBought;
    return {
      market: { ...market, cycleVolume: newVol },
      creditDelta: -result.creditCost,
      resourceDelta: result.quantityBought,
    };
  } else {
    const result = sellResource(resource as keyof MarketPrices, quantity, market.prices as any, availableQuantity ?? 0);
    if (!result) return null;
    if (resource in newVol) (newVol as Record<string, number>)[resource] -= result.quantitySold;
    return {
      market: { ...market, cycleVolume: newVol },
      creditDelta: result.creditsEarned,
      resourceDelta: -result.quantitySold,
    };
  }
}

/* ── Market Cycle Advancement ── */

export interface MarketCycleResult {
  market: MarketState;
  events: { eventType: MarketEventType; affectedResource: string | undefined; priceChange: number }[];
}

/**
 * Advance the market by one cycle: record price history, apply volume-based
 * price updates, decay toward baseline, and clamp. Resets cycleVolume.
 * Pure function — does not mutate input.
 */
export function advanceMarketCycle(
  market: MarketState,
  rng?: { next: () => number },
): MarketCycleResult {
  const events: MarketCycleResult["events"] = [];

  // Clone prices to avoid mutation
  let prices = { ...market.prices } as unknown as MarketPrices;
  const basePrices = market.basePrices as unknown as MarketPrices;

  // (a) Optional market event
  if (rng && rng.next() < MARKET_EVENT_PROBABILITY) {
    const eventType = selectWeightedMarketEvent(rng, prices, basePrices);
    prices = applyMarketEvent(eventType, prices);
    events.push({
      eventType,
      affectedResource: marketEventAffectedResource(eventType),
      priceChange: marketEventPriceChange(eventType),
    });
  }

  // (b) Record pre-update prices in history
  const priceHistory = [...market.priceHistory, { ...market.prices }];

  // (c) Volume-based update, decay, clamp
  const vol = market.cycleVolume ?? { food: 0, ore: 0, fuelCells: 0 };
  prices = updatePricesFromVolume(prices, basePrices, vol);
  prices = decayPrices(prices, basePrices);
  prices = clampPrices(prices, basePrices);

  return {
    market: {
      prices: prices as unknown as GSMarketPrices,
      basePrices: { ...market.basePrices },
      priceHistory,
      cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
    },
    events,
  };
}
