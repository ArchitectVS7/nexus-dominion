"use server";

import { cookies } from "next/headers";
import {
  addToBuildQueue,
  cancelBuildOrder,
  getBuildQueueStatus,
  type AddToQueueResult,
  type CancelBuildResult,
  type QueueStatus,
} from "@/lib/game/services/build-queue-service";
import type { UnitType } from "@/lib/game/unit-config";

// =============================================================================
// COOKIE HELPERS
// =============================================================================

const GAME_ID_COOKIE = "gameId";
const EMPIRE_ID_COOKIE = "empireId";

async function getGameCookies(): Promise<{
  gameId: string | undefined;
  empireId: string | undefined;
}> {
  const cookieStore = await cookies();
  return {
    gameId: cookieStore.get(GAME_ID_COOKIE)?.value,
    empireId: cookieStore.get(EMPIRE_ID_COOKIE)?.value,
  };
}

// =============================================================================
// BUILD QUEUE ACTIONS
// =============================================================================

/**
 * Add units to the build queue.
 */
export async function addToBuildQueueAction(
  unitType: UnitType,
  quantity: number
): Promise<AddToQueueResult> {
  const { gameId, empireId } = await getGameCookies();

  if (!gameId || !empireId) {
    return { success: false, error: "No active game session" };
  }

  try {
    return await addToBuildQueue(empireId, gameId, unitType, quantity);
  } catch (error) {
    console.error("Failed to add to build queue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add to build queue",
    };
  }
}

/**
 * Cancel a build order.
 */
export async function cancelBuildOrderAction(
  queueId: string
): Promise<CancelBuildResult> {
  const { empireId } = await getGameCookies();

  if (!empireId) {
    return { success: false, error: "No active game session" };
  }

  try {
    return await cancelBuildOrder(empireId, queueId);
  } catch (error) {
    console.error("Failed to cancel build order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel build order",
    };
  }
}

/**
 * Get the current build queue status.
 */
export async function getBuildQueueStatusAction(): Promise<QueueStatus | null> {
  const { empireId } = await getGameCookies();

  if (!empireId) {
    return null;
  }

  try {
    return await getBuildQueueStatus(empireId);
  } catch (error) {
    console.error("Failed to get build queue status:", error);
    return null;
  }
}
