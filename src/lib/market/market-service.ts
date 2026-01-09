/**
 * Market Service (M7)
 *
 * Handles global market operations for buying and selling resources.
 * Implements dynamic pricing based on supply and demand.
 *
 * @see docs/PRD.md Section 4 - Resource System
 * @see docs/milestones.md M7 - Market & Diplomacy
 */

import { db } from "@/lib/db";
import {
  empires,
  marketPrices,
  marketOrders,
  type MarketOrder,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  MARKET_BASE_PRICES,
  type TradableResource,
  calculateMarketPrice,
  calculateMarketFee,
  decaySupplyDemand,
} from "./constants";

// =============================================================================
// TYPES
// =============================================================================

export interface MarketPriceInfo {
  resourceType: TradableResource;
  basePrice: number;
  currentPrice: number;
  multiplier: number;
  trend: "up" | "down" | "stable";
}

export interface MarketStatus {
  prices: MarketPriceInfo[];
  playerResources: {
    food: number;
    ore: number;
    petroleum: number;
    credits: number;
  };
}

export interface TradeValidation {
  valid: boolean;
  error?: string;
  totalCost: number;
  fee: number;
  pricePerUnit: number;
}

export interface TradeResult {
  success: boolean;
  error?: string;
  order?: MarketOrder;
  newCredits?: number;
  newResourceAmount?: number;
}

// =============================================================================
// MARKET INITIALIZATION
// =============================================================================

/**
 * Initialize market prices for a new game.
 * Creates price entries for each tradable resource.
 *
 * @param gameId - Game UUID
 */
export async function initializeMarketPrices(gameId: string): Promise<void> {
  const resources: TradableResource[] = ["food", "ore", "petroleum"];

  const priceRecords = resources.map((resourceType) => {
    const basePrice = MARKET_BASE_PRICES[resourceType];
    return {
      gameId,
      resourceType,
      basePrice,
      currentPrice: String(basePrice),
      priceMultiplier: "1.00",
      totalSupply: 0,
      totalDemand: 0,
      turnUpdated: 1,
    };
  });

  await db.insert(marketPrices).values(priceRecords);
}

// =============================================================================
// MARKET PRICES
// =============================================================================

/**
 * Get current market prices for a game.
 *
 * @param gameId - Game UUID
 * @returns Array of price info for each resource
 */
export async function getMarketPrices(
  gameId: string
): Promise<MarketPriceInfo[]> {
  const prices = await db.query.marketPrices.findMany({
    where: eq(marketPrices.gameId, gameId),
  });

  return prices.map((p) => {
    const multiplier = Number(p.priceMultiplier);
    let trend: "up" | "down" | "stable" = "stable";

    if (multiplier > 1.1) trend = "up";
    else if (multiplier < 0.9) trend = "down";

    return {
      resourceType: p.resourceType as TradableResource,
      basePrice: p.basePrice,
      currentPrice: Number(p.currentPrice),
      multiplier,
      trend,
    };
  });
}

/**
 * Get market status including prices and player resources.
 *
 * @param gameId - Game UUID
 * @param empireId - Empire UUID
 * @returns Market status
 */
export async function getMarketStatus(
  gameId: string,
  empireId: string
): Promise<MarketStatus | null> {
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
  });

  if (!empire) return null;

  const prices = await getMarketPrices(gameId);

  return {
    prices,
    playerResources: {
      food: empire.food,
      ore: empire.ore,
      petroleum: empire.petroleum,
      credits: empire.credits,
    },
  };
}

// =============================================================================
// BUY RESOURCES
// =============================================================================

/**
 * Validate a buy order.
 *
 * @param gameId - Game UUID
 * @param empireId - Empire UUID
 * @param resourceType - Resource to buy
 * @param quantity - Amount to buy
 * @returns Validation result with cost breakdown
 */
export async function validateBuyOrder(
  gameId: string,
  empireId: string,
  resourceType: TradableResource,
  quantity: number
): Promise<TradeValidation> {
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be positive", totalCost: 0, fee: 0, pricePerUnit: 0 };
  }

  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
  });

  if (!empire) {
    return { valid: false, error: "Empire not found", totalCost: 0, fee: 0, pricePerUnit: 0 };
  }

  const priceInfo = await db.query.marketPrices.findFirst({
    where: and(
      eq(marketPrices.gameId, gameId),
      eq(marketPrices.resourceType, resourceType)
    ),
  });

  if (!priceInfo) {
    return { valid: false, error: "Market price not found", totalCost: 0, fee: 0, pricePerUnit: 0 };
  }

  const pricePerUnit = Number(priceInfo.currentPrice);
  const baseCost = quantity * pricePerUnit;
  const fee = calculateMarketFee(baseCost);
  const totalCost = baseCost + fee;

  if (empire.credits < totalCost) {
    return {
      valid: false,
      error: `Insufficient credits. Need ${totalCost}, have ${empire.credits}`,
      totalCost,
      fee,
      pricePerUnit,
    };
  }

  return { valid: true, totalCost, fee, pricePerUnit };
}

/**
 * Execute a buy order.
 *
 * @param gameId - Game UUID
 * @param empireId - Empire UUID
 * @param resourceType - Resource to buy
 * @param quantity - Amount to buy
 * @param turn - Current game turn
 * @returns Trade result
 */
export async function executeBuyOrder(
  gameId: string,
  empireId: string,
  resourceType: TradableResource,
  quantity: number,
  turn: number
): Promise<TradeResult> {
  const validation = await validateBuyOrder(gameId, empireId, resourceType, quantity);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Get current empire state
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
  });

  if (!empire) {
    return { success: false, error: "Empire not found" };
  }

  // Update empire resources
  const newCredits = empire.credits - validation.totalCost;
  const currentResource = empire[resourceType] as number;
  const newResourceAmount = currentResource + quantity;

  await db
    .update(empires)
    .set({
      credits: newCredits,
      [resourceType]: newResourceAmount,
      updatedAt: new Date(),
    })
    .where(eq(empires.id, empireId));

  // Record the order
  const [order] = await db
    .insert(marketOrders)
    .values({
      gameId,
      empireId,
      orderType: "buy",
      resourceType,
      quantity,
      pricePerUnit: String(validation.pricePerUnit),
      totalCost: String(validation.totalCost),
      status: "completed",
      turn,
      completedAt: new Date(),
    })
    .returning();

  // Update demand tracking (atomic increment to prevent race conditions)
  await db
    .update(marketPrices)
    .set({
      totalDemand: sql`${marketPrices.totalDemand} + ${quantity}`,
      lastUpdated: new Date(),
    })
    .where(
      and(
        eq(marketPrices.gameId, gameId),
        eq(marketPrices.resourceType, resourceType)
      )
    );

  return {
    success: true,
    order,
    newCredits,
    newResourceAmount,
  };
}

// =============================================================================
// SELL RESOURCES
// =============================================================================

/**
 * Validate a sell order.
 *
 * @param gameId - Game UUID
 * @param empireId - Empire UUID
 * @param resourceType - Resource to sell
 * @param quantity - Amount to sell
 * @returns Validation result with revenue breakdown
 */
export async function validateSellOrder(
  gameId: string,
  empireId: string,
  resourceType: TradableResource,
  quantity: number
): Promise<TradeValidation> {
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be positive", totalCost: 0, fee: 0, pricePerUnit: 0 };
  }

  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
  });

  if (!empire) {
    return { valid: false, error: "Empire not found", totalCost: 0, fee: 0, pricePerUnit: 0 };
  }

  const currentResource = empire[resourceType] as number;

  if (currentResource < quantity) {
    return {
      valid: false,
      error: `Insufficient ${resourceType}. Have ${currentResource}, want to sell ${quantity}`,
      totalCost: 0,
      fee: 0,
      pricePerUnit: 0,
    };
  }

  const priceInfo = await db.query.marketPrices.findFirst({
    where: and(
      eq(marketPrices.gameId, gameId),
      eq(marketPrices.resourceType, resourceType)
    ),
  });

  if (!priceInfo) {
    return { valid: false, error: "Market price not found", totalCost: 0, fee: 0, pricePerUnit: 0 };
  }

  const pricePerUnit = Number(priceInfo.currentPrice);
  const grossRevenue = quantity * pricePerUnit;
  const fee = calculateMarketFee(grossRevenue);
  const netRevenue = grossRevenue - fee;

  return { valid: true, totalCost: netRevenue, fee, pricePerUnit };
}

/**
 * Execute a sell order.
 *
 * @param gameId - Game UUID
 * @param empireId - Empire UUID
 * @param resourceType - Resource to sell
 * @param quantity - Amount to sell
 * @param turn - Current game turn
 * @returns Trade result
 */
export async function executeSellOrder(
  gameId: string,
  empireId: string,
  resourceType: TradableResource,
  quantity: number,
  turn: number
): Promise<TradeResult> {
  const validation = await validateSellOrder(gameId, empireId, resourceType, quantity);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Get current empire state
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
  });

  if (!empire) {
    return { success: false, error: "Empire not found" };
  }

  // Update empire resources
  const netRevenue = validation.totalCost; // Already calculated as net after fee
  const newCredits = empire.credits + netRevenue;
  const currentResource = empire[resourceType] as number;
  const newResourceAmount = currentResource - quantity;

  await db
    .update(empires)
    .set({
      credits: newCredits,
      [resourceType]: newResourceAmount,
      updatedAt: new Date(),
    })
    .where(eq(empires.id, empireId));

  // Record the order
  const [order] = await db
    .insert(marketOrders)
    .values({
      gameId,
      empireId,
      orderType: "sell",
      resourceType,
      quantity,
      pricePerUnit: String(validation.pricePerUnit),
      totalCost: String(netRevenue),
      status: "completed",
      turn,
      completedAt: new Date(),
    })
    .returning();

  // Update supply tracking (atomic increment to prevent race conditions)
  await db
    .update(marketPrices)
    .set({
      totalSupply: sql`${marketPrices.totalSupply} + ${quantity}`,
      lastUpdated: new Date(),
    })
    .where(
      and(
        eq(marketPrices.gameId, gameId),
        eq(marketPrices.resourceType, resourceType)
      )
    );

  return {
    success: true,
    order,
    newCredits,
    newResourceAmount,
  };
}

// =============================================================================
// PRICE UPDATE (Turn Processing)
// =============================================================================

/**
 * Update market prices based on supply/demand.
 * Called during turn processing.
 *
 * @param gameId - Game UUID
 * @param turn - Current game turn
 */
export async function updateMarketPrices(
  gameId: string,
  turn: number
): Promise<void> {
  const prices = await db.query.marketPrices.findMany({
    where: eq(marketPrices.gameId, gameId),
  });

  for (const price of prices) {
    const { price: newPrice, multiplier } = calculateMarketPrice(
      price.basePrice,
      price.totalSupply,
      price.totalDemand
    );

    // Decay supply/demand for next turn
    const newSupply = decaySupplyDemand(price.totalSupply);
    const newDemand = decaySupplyDemand(price.totalDemand);

    await db
      .update(marketPrices)
      .set({
        currentPrice: String(newPrice.toFixed(2)),
        priceMultiplier: String(multiplier.toFixed(2)),
        totalSupply: newSupply,
        totalDemand: newDemand,
        turnUpdated: turn,
        lastUpdated: new Date(),
      })
      .where(eq(marketPrices.id, price.id));
  }
}

// =============================================================================
// ORDER HISTORY
// =============================================================================

/**
 * Get order history for an empire.
 *
 * @param empireId - Empire UUID
 * @param limit - Maximum number of orders to return
 * @returns Array of market orders
 */
export async function getOrderHistory(
  empireId: string,
  limit: number = 20
): Promise<MarketOrder[]> {
  return db.query.marketOrders.findMany({
    where: eq(marketOrders.empireId, empireId),
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    limit,
  });
}
