import type { Resources } from "../types/empire";

export interface MarketPrices {
  credits: number; // always 1 (base currency)
  food: number;
  ore: number;
  fuelCells: number;
  researchPoints: number;
}

const BASE_PRICES: MarketPrices = {
  credits: 1,
  food: 5,
  ore: 8,
  fuelCells: 12,
  researchPoints: 15,
};

/**
 * Calculate market prices based on supply and demand.
 * supply/demand are totals across the galaxy for each resource.
 */
export function calculateMarketPrices(
  supply: Partial<Resources>,
  demand: Partial<Resources>,
): MarketPrices {
  const prices = { ...BASE_PRICES };

  for (const key of ["food", "ore", "fuelCells", "researchPoints"] as const) {
    const s = (supply as Record<string, number>)[key] ?? 100;
    const d = (demand as Record<string, number>)[key] ?? 100;
    // Price rises when demand exceeds supply, falls when supply exceeds demand
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
): { creditCost: number; quantityBought: number } | null {
  if (resource === "credits") return null;
  const unitPrice = prices[resource];
  const totalCost = unitPrice * quantity;
  if (totalCost > availableCredits) {
    // Buy as much as possible
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
): { creditsEarned: number; quantitySold: number } | null {
  if (resource === "credits") return null;
  const sellQuantity = Math.min(quantity, availableQuantity);
  if (sellQuantity <= 0) return null;
  const unitPrice = Math.max(1, Math.floor(prices[resource] * 0.8)); // 20% spread
  return { creditsEarned: unitPrice * sellQuantity, quantitySold: sellQuantity };
}

/**
 * Apply blockade effect to market prices for a system/sector.
 */
export function applyBlockadeToMarket(
  prices: MarketPrices,
  blockadeSeverity: number, // 0-1
): MarketPrices {
  const inflated = { ...prices };
  const multiplier = 1 + blockadeSeverity * 2;
  inflated.food = Math.round(inflated.food * multiplier);
  inflated.ore = Math.round(inflated.ore * multiplier);
  inflated.fuelCells = Math.round(inflated.fuelCells * multiplier);
  return inflated;
}
