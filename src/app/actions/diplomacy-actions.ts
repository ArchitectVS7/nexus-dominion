"use server";

/**
 * Diplomacy Server Actions (M7)
 *
 * Server actions for treaty management.
 */

import { db } from "@/lib/db";
import { games, empires } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import {
  type TreatyType,
  getActiveTreaties,
  getPendingProposals,
  proposeTreaty,
  acceptTreaty,
  rejectTreaty,
  breakTreaty,
  endTreatyPeacefully,
  hasActiveTreaty,
  getReputationHistory,
  getReputationLevel,
} from "@/lib/diplomacy";

// =============================================================================
// TYPES
// =============================================================================

interface DiplomacyTarget {
  id: string;
  name: string;
  networth: number;
  reputation: number;
  reputationLevel: string;
  hasTreaty: boolean;
  treatyType?: TreatyType;
}

// =============================================================================
// GET DIPLOMACY STATUS
// =============================================================================

export async function getDiplomacyStatusAction(gameId: string, empireId: string) {
  try {
    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, empireId),
    });

    if (!empire) {
      return { success: false as const, error: "Empire not found" };
    }

    const activeTreaties = await getActiveTreaties(empireId);
    const pendingProposals = await getPendingProposals(empireId);

    return {
      success: true as const,
      data: {
        reputation: empire.reputation,
        reputationLevel: getReputationLevel(empire.reputation),
        activeTreaties,
        pendingProposals,
      },
    };
  } catch (error) {
    console.error("Error fetching diplomacy status:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// GET DIPLOMACY TARGETS
// =============================================================================

export async function getDiplomacyTargetsAction(gameId: string, empireId: string) {
  try {
    // Get all non-eliminated empires except the player
    const allEmpires = await db.query.empires.findMany({
      where: and(
        eq(empires.gameId, gameId),
        ne(empires.id, empireId),
        eq(empires.isEliminated, false)
      ),
    });

    // Get treaty status for each
    const targets: DiplomacyTarget[] = await Promise.all(
      allEmpires.map(async (e) => {
        const hasTreatyFlag = await hasActiveTreaty(empireId, e.id);
        let treatyType: TreatyType | undefined;

        if (hasTreatyFlag) {
          const treaties = await getActiveTreaties(empireId);
          const treaty = treaties.find((t) => t.partnerId === e.id);
          treatyType = treaty?.type;
        }

        return {
          id: e.id,
          name: e.name,
          networth: e.networth,
          reputation: e.reputation,
          reputationLevel: getReputationLevel(e.reputation),
          hasTreaty: hasTreatyFlag,
          treatyType,
        };
      })
    );

    return { success: true as const, data: targets };
  } catch (error) {
    console.error("Error fetching diplomacy targets:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// PROPOSE TREATY
// =============================================================================

export async function proposeTreatyAction(
  gameId: string,
  proposerId: string,
  recipientId: string,
  treatyType: string
) {
  try {
    if (!["nap", "alliance"].includes(treatyType)) {
      return { success: false as const, error: "Invalid treaty type" };
    }

    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await proposeTreaty(
      proposerId,
      recipientId,
      treatyType as TreatyType,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: { treatyId: result.treaty?.id },
    };
  } catch (error) {
    console.error("Error proposing treaty:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// ACCEPT TREATY
// =============================================================================

export async function acceptTreatyAction(
  gameId: string,
  treatyId: string,
  recipientId: string
) {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await acceptTreaty(treatyId, recipientId, game.currentTurn);

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: {
        treaty: result.treaty,
        reputationChange: result.reputationChange,
      },
    };
  } catch (error) {
    console.error("Error accepting treaty:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// REJECT TREATY
// =============================================================================

export async function rejectTreatyAction(treatyId: string, recipientId: string) {
  try {
    const result = await rejectTreaty(treatyId, recipientId);

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return { success: true as const };
  } catch (error) {
    console.error("Error rejecting treaty:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// BREAK TREATY
// =============================================================================

export async function breakTreatyAction(
  gameId: string,
  treatyId: string,
  breakerId: string
) {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await breakTreaty(treatyId, breakerId, game.currentTurn);

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: {
        treaty: result.treaty,
        reputationChange: result.reputationChange,
      },
    };
  } catch (error) {
    console.error("Error breaking treaty:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// END TREATY PEACEFULLY
// =============================================================================

export async function endTreatyAction(
  gameId: string,
  treatyId: string,
  requesterId: string
) {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await endTreatyPeacefully(treatyId, requesterId, game.currentTurn);

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return { success: true as const };
  } catch (error) {
    console.error("Error ending treaty:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// REPUTATION HISTORY
// =============================================================================

export async function getReputationHistoryAction(empireId: string) {
  try {
    const history = await getReputationHistory(empireId);
    return { success: true as const, data: history };
  } catch (error) {
    console.error("Error fetching reputation history:", error);
    return { success: false as const, error: "An error occurred" };
  }
}
