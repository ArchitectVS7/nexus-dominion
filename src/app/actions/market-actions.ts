"use server";

/**
 * Market Server Actions (M7)
 *
 * Server actions for buying and selling resources on the global market.
 */

import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  type TradableResource,
  getMarketStatus,
  validateBuyOrder,
  executeBuyOrder,
  validateSellOrder,
  executeSellOrder,
  getOrderHistory,
} from "@/lib/market";

// =============================================================================
// GET MARKET STATUS
// =============================================================================

export async function getMarketStatusAction(gameId: string, empireId: string) {
  try {
    const status = await getMarketStatus(gameId, empireId);
    if (!status) {
      return { success: false as const, error: "Failed to fetch market status" };
    }
    return { success: true as const, data: status };
  } catch (error) {
    console.error("Error fetching market status:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// BUY RESOURCES
// =============================================================================

export async function buyResourceAction(
  gameId: string,
  empireId: string,
  resourceType: string,
  quantity: number
) {
  try {
    // Validate resource type
    if (!["food", "ore", "petroleum"].includes(resourceType)) {
      return { success: false as const, error: "Invalid resource type" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    // Execute buy order
    const result = await executeBuyOrder(
      gameId,
      empireId,
      resourceType as TradableResource,
      quantity,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: {
        newCredits: result.newCredits,
        newResourceAmount: result.newResourceAmount,
        orderId: result.order?.id,
      },
    };
  } catch (error) {
    console.error("Error buying resource:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// SELL RESOURCES
// =============================================================================

export async function sellResourceAction(
  gameId: string,
  empireId: string,
  resourceType: string,
  quantity: number
) {
  try {
    // Validate resource type
    if (!["food", "ore", "petroleum"].includes(resourceType)) {
      return { success: false as const, error: "Invalid resource type" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    // Execute sell order
    const result = await executeSellOrder(
      gameId,
      empireId,
      resourceType as TradableResource,
      quantity,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: {
        newCredits: result.newCredits,
        newResourceAmount: result.newResourceAmount,
        orderId: result.order?.id,
      },
    };
  } catch (error) {
    console.error("Error selling resource:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// VALIDATE ORDERS
// =============================================================================

export async function validateBuyOrderAction(
  gameId: string,
  empireId: string,
  resourceType: string,
  quantity: number
) {
  try {
    if (!["food", "ore", "petroleum"].includes(resourceType)) {
      return { success: false as const, error: "Invalid resource type" };
    }

    const validation = await validateBuyOrder(
      gameId,
      empireId,
      resourceType as TradableResource,
      quantity
    );

    return {
      success: true as const,
      data: validation,
    };
  } catch (error) {
    console.error("Error validating buy order:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

export async function validateSellOrderAction(
  gameId: string,
  empireId: string,
  resourceType: string,
  quantity: number
) {
  try {
    if (!["food", "ore", "petroleum"].includes(resourceType)) {
      return { success: false as const, error: "Invalid resource type" };
    }

    const validation = await validateSellOrder(
      gameId,
      empireId,
      resourceType as TradableResource,
      quantity
    );

    return {
      success: true as const,
      data: validation,
    };
  } catch (error) {
    console.error("Error validating sell order:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// ORDER HISTORY
// =============================================================================

export async function getOrderHistoryAction(empireId: string) {
  try {
    const orders = await getOrderHistory(empireId);
    return { success: true as const, data: orders };
  } catch (error) {
    console.error("Error fetching order history:", error);
    return { success: false as const, error: "An error occurred" };
  }
}
