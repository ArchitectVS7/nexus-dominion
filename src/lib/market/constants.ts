/**
 * Market Constants (M7)
 *
 * Defines base prices and pricing mechanics for the global market.
 *
 * @see docs/PRD.md Section 4 - Resource System
 * @see docs/milestones.md M7 - Market & Diplomacy
 */

// =============================================================================
// BASE PRICES
// =============================================================================

/**
 * Base prices per unit of resource.
 * These are used as the baseline for dynamic pricing.
 */
export const MARKET_BASE_PRICES = {
  food: 10,
  ore: 15,
  petroleum: 25,
} as const;

export type TradableResource = keyof typeof MARKET_BASE_PRICES;

// =============================================================================
// PRICE MULTIPLIER BOUNDS (PRD: 0.4x to 1.6x base price)
// =============================================================================

export const PRICE_MULTIPLIER_MIN = 0.4;
export const PRICE_MULTIPLIER_MAX = 1.6;

// =============================================================================
// SUPPLY/DEMAND MECHANICS
// =============================================================================

/**
 * How much the price changes per supply/demand imbalance.
 * Positive values increase price (high demand), negative decrease (high supply).
 */
export const PRICE_ADJUSTMENT_RATE = 0.02; // 2% per imbalance unit

/**
 * Decay rate for supply/demand tracking between turns.
 * Prevents old orders from affecting price indefinitely.
 */
export const SUPPLY_DEMAND_DECAY = 0.9; // 10% decay per turn

/**
 * Threshold for significant supply/demand imbalance.
 * Below this, price stays relatively stable.
 */
export const IMBALANCE_THRESHOLD = 100;

// =============================================================================
// MARKET FEES
// =============================================================================

/**
 * Transaction fee as a percentage of trade value.
 * Applied to both buys and sells.
 */
export const MARKET_FEE_PERCENT = 0.02; // 2% fee

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate the current price based on supply/demand.
 *
 * @param basePrice - Base price of the resource
 * @param totalSupply - Total supply on market
 * @param totalDemand - Total demand on market
 * @returns Current price with multiplier applied
 */
export function calculateMarketPrice(
  basePrice: number,
  totalSupply: number,
  totalDemand: number
): { price: number; multiplier: number } {
  // Calculate imbalance (positive = high demand, negative = high supply)
  const imbalance = totalDemand - totalSupply;

  // Calculate raw multiplier based on imbalance
  let multiplier = 1.0;

  if (Math.abs(imbalance) > IMBALANCE_THRESHOLD) {
    // Adjust price based on imbalance
    const adjustmentFactor =
      (imbalance / IMBALANCE_THRESHOLD) * PRICE_ADJUSTMENT_RATE;
    multiplier = 1.0 + adjustmentFactor;
  }

  // Clamp to PRD bounds (0.4x to 1.6x)
  multiplier = Math.max(
    PRICE_MULTIPLIER_MIN,
    Math.min(PRICE_MULTIPLIER_MAX, multiplier)
  );

  const price = basePrice * multiplier;

  return { price, multiplier };
}

/**
 * Calculate transaction fee.
 *
 * @param totalCost - Total transaction value
 * @returns Fee amount
 */
export function calculateMarketFee(totalCost: number): number {
  return Math.floor(totalCost * MARKET_FEE_PERCENT);
}

/**
 * Decay supply/demand values for the next turn.
 *
 * @param value - Current supply or demand value
 * @returns Decayed value
 */
export function decaySupplyDemand(value: number): number {
  return Math.floor(value * SUPPLY_DEMAND_DECAY);
}
