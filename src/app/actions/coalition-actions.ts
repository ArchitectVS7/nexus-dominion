"use server";

/**
 * Coalition Server Actions (M11)
 *
 * Server actions for coalition management.
 * All inputs are validated with Zod schemas.
 *
 * @see docs/PRD.md Section 8.2 (Coalitions)
 */

import { z } from "zod";
import { db } from "@/lib/db";
import { games, empires } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import {
  createCoalition,
  inviteToCoalition,
  acceptCoalitionInvite,
  leaveCoalition,
  getCoalitionMembers,
  getCoalitionPower,
  getMyCoalition,
  checkDiplomaticVictory,
  proposeCoordinatedAttack,
  areCoalitionsUnlocked,
  isCoalitionWarfareUnlocked,
  COALITION_UNLOCK_TURN,
  COALITION_WARFARE_UNLOCK_TURN,
} from "@/lib/game/services/coalition-service";
import {
  getCoalitionById,
  getCoalitionWithMembers,
  getGameCoalitions,
  isEmpireInCoalition,
} from "@/lib/game/repositories/coalition-repository";
import {
  COALITION_MAX_MEMBERS,
  COALITION_MIN_MEMBERS,
  COALITION_VICTORY_THRESHOLD,
} from "@/lib/constants/diplomacy";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const UUIDSchema = z.string().uuid("Invalid UUID format");

const CreateCoalitionSchema = z.object({
  gameId: UUIDSchema,
  founderEmpireId: UUIDSchema,
  name: z.string().min(1, "Name required").max(200, "Name too long"),
});

const InviteToCoalitionSchema = z.object({
  coalitionId: UUIDSchema,
  inviterEmpireId: UUIDSchema,
  inviteeEmpireId: UUIDSchema,
});

const JoinLeaveCoalitionSchema = z.object({
  coalitionId: UUIDSchema,
  empireId: UUIDSchema,
});

const CoordinatedAttackSchema = z.object({
  coalitionId: UUIDSchema,
  proposerEmpireId: UUIDSchema,
  targetEmpireId: UUIDSchema,
  scheduledTurn: z.number().int().positive(),
});

const GameEmpireSchema = z.object({
  gameId: UUIDSchema,
  empireId: UUIDSchema,
});

// =============================================================================
// GET COALITION STATUS
// =============================================================================

/**
 * Get the coalition the empire belongs to (if any).
 */
export async function getMyCoalitionAction(empireId: string) {
  try {
    const parsed = UUIDSchema.safeParse(empireId);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid ID" };
    }

    const coalition = await getMyCoalition(parsed.data);

    if (!coalition) {
      return {
        success: true as const,
        data: null,
      };
    }

    const power = await getCoalitionPower(coalition.id);
    const victoryCheck = await checkDiplomaticVictory(coalition.id);

    return {
      success: true as const,
      data: {
        coalition: {
          id: coalition.id,
          name: coalition.name,
          status: coalition.status,
          leaderId: coalition.leaderId,
          memberCount: coalition.memberCount,
          totalNetworth: coalition.totalNetworth,
          territoryPercent: Number(coalition.territoryPercent),
          formedAtTurn: coalition.formedAtTurn,
        },
        members: coalition.members.map((m) => ({
          id: m.empire.id,
          name: m.empire.name,
          networth: m.empire.networth,
          planetCount: m.empire.planetCount,
          joinedAtTurn: m.joinedAtTurn,
          isLeader: m.empire.id === coalition.leaderId,
        })),
        power,
        victoryProgress: victoryCheck
          ? {
              territoryPercent: victoryCheck.territoryPercent,
              threshold: COALITION_VICTORY_THRESHOLD * 100,
              achieved: victoryCheck.achieved,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching coalition:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

/**
 * Get all coalitions in a game.
 */
export async function getGameCoalitionsAction(gameId: string) {
  try {
    const parsed = UUIDSchema.safeParse(gameId);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid ID" };
    }

    const coalitions = await getGameCoalitions(parsed.data);

    // Get details for each coalition
    const coalitionDetails = await Promise.all(
      coalitions.map(async (c) => {
        const withMembers = await getCoalitionWithMembers(c.id);
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          memberCount: c.memberCount,
          totalNetworth: c.totalNetworth,
          territoryPercent: Number(c.territoryPercent),
          formedAtTurn: c.formedAtTurn,
          leaderName: withMembers?.members.find((m) => m.empire.id === c.leaderId)?.empire.name ?? "Unknown",
        };
      })
    );

    return { success: true as const, data: coalitionDetails };
  } catch (error) {
    console.error("Error fetching game coalitions:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

/**
 * Get potential coalition members (empires not in a coalition).
 */
export async function getAvailableCoalitionMembersAction(gameId: string, excludeEmpireId: string) {
  try {
    const parsed = GameEmpireSchema.safeParse({ gameId, empireId: excludeEmpireId });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get all non-eliminated empires in the game
    const allEmpires = await db.query.empires.findMany({
      where: and(
        eq(empires.gameId, parsed.data.gameId),
        ne(empires.id, parsed.data.empireId),
        eq(empires.isEliminated, false)
      ),
    });

    // Filter out those already in coalitions
    const available = await Promise.all(
      allEmpires.map(async (e) => {
        const inCoalition = await isEmpireInCoalition(e.id);
        return inCoalition ? null : e;
      })
    );

    const filtered = available.filter((e) => e !== null);

    return {
      success: true as const,
      data: filtered.map((e) => ({
        id: e.id,
        name: e.name,
        networth: e.networth,
        planetCount: e.planetCount,
        reputation: e.reputation,
      })),
    };
  } catch (error) {
    console.error("Error fetching available members:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// CREATE COALITION
// =============================================================================

/**
 * Create a new coalition.
 */
export async function createCoalitionAction(
  gameId: string,
  founderEmpireId: string,
  name: string
) {
  try {
    const parsed = CreateCoalitionSchema.safeParse({ gameId, founderEmpireId, name });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, parsed.data.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    // Check if coalitions are unlocked
    if (!areCoalitionsUnlocked(game.currentTurn)) {
      return {
        success: false as const,
        error: `Coalitions unlock at turn ${COALITION_UNLOCK_TURN}. Current turn: ${game.currentTurn}`,
      };
    }

    const result = await createCoalition(
      parsed.data.gameId,
      parsed.data.founderEmpireId,
      parsed.data.name,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: {
        coalitionId: result.coalition?.id,
        message: "Coalition created successfully. Invite members to activate it.",
      },
    };
  } catch (error) {
    console.error("Error creating coalition:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// INVITE MEMBER
// =============================================================================

/**
 * Invite an empire to join the coalition.
 */
export async function inviteToCoalitionAction(
  coalitionId: string,
  inviterEmpireId: string,
  inviteeEmpireId: string
) {
  try {
    const parsed = InviteToCoalitionSchema.safeParse({
      coalitionId,
      inviterEmpireId,
      inviteeEmpireId,
    });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get coalition to find game
    const coalition = await getCoalitionById(parsed.data.coalitionId);
    if (!coalition) {
      return { success: false as const, error: "Coalition not found" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, coalition.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await inviteToCoalition(
      parsed.data.coalitionId,
      parsed.data.inviterEmpireId,
      parsed.data.inviteeEmpireId,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: { message: "Empire joined the coalition" },
    };
  } catch (error) {
    console.error("Error inviting to coalition:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// JOIN COALITION
// =============================================================================

/**
 * Join a coalition.
 */
export async function joinCoalitionAction(coalitionId: string, empireId: string) {
  try {
    const parsed = JoinLeaveCoalitionSchema.safeParse({ coalitionId, empireId });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get coalition to find game
    const coalition = await getCoalitionById(parsed.data.coalitionId);
    if (!coalition) {
      return { success: false as const, error: "Coalition not found" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, coalition.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await acceptCoalitionInvite(
      parsed.data.coalitionId,
      parsed.data.empireId,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: { message: "Successfully joined the coalition" },
    };
  } catch (error) {
    console.error("Error joining coalition:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// LEAVE COALITION
// =============================================================================

/**
 * Leave a coalition.
 */
export async function leaveCoalitionAction(coalitionId: string, empireId: string) {
  try {
    const parsed = JoinLeaveCoalitionSchema.safeParse({ coalitionId, empireId });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get coalition to find game
    const coalition = await getCoalitionById(parsed.data.coalitionId);
    if (!coalition) {
      return { success: false as const, error: "Coalition not found" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, coalition.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const result = await leaveCoalition(
      parsed.data.coalitionId,
      parsed.data.empireId,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: { message: "Successfully left the coalition" },
    };
  } catch (error) {
    console.error("Error leaving coalition:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// COORDINATED ATTACK
// =============================================================================

/**
 * Propose a coordinated attack.
 */
export async function proposeCoordinatedAttackAction(
  coalitionId: string,
  proposerEmpireId: string,
  targetEmpireId: string,
  scheduledTurn: number
) {
  try {
    const parsed = CoordinatedAttackSchema.safeParse({
      coalitionId,
      proposerEmpireId,
      targetEmpireId,
      scheduledTurn,
    });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get coalition to find game
    const coalition = await getCoalitionById(parsed.data.coalitionId);
    if (!coalition) {
      return { success: false as const, error: "Coalition not found" };
    }

    // Get current turn
    const game = await db.query.games.findFirst({
      where: eq(games.id, coalition.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    // Check if coalition warfare is unlocked
    if (!isCoalitionWarfareUnlocked(game.currentTurn)) {
      return {
        success: false as const,
        error: `Coalition warfare unlocks at turn ${COALITION_WARFARE_UNLOCK_TURN}. Current turn: ${game.currentTurn}`,
      };
    }

    const result = await proposeCoordinatedAttack(
      parsed.data.coalitionId,
      parsed.data.proposerEmpireId,
      parsed.data.targetEmpireId,
      parsed.data.scheduledTurn,
      game.currentTurn
    );

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: {
        message: "Coordinated attack proposed",
        scheduledTurn: parsed.data.scheduledTurn,
        bonus: "+10% combat power for all participants",
      },
    };
  } catch (error) {
    console.error("Error proposing coordinated attack:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// VICTORY CHECK
// =============================================================================

/**
 * Check if the coalition has achieved diplomatic victory.
 */
export async function checkDiplomaticVictoryAction(coalitionId: string) {
  try {
    const parsed = UUIDSchema.safeParse(coalitionId);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid ID" };
    }

    const victoryCheck = await checkDiplomaticVictory(parsed.data);

    if (!victoryCheck) {
      return { success: false as const, error: "Coalition not found or not active" };
    }

    return {
      success: true as const,
      data: victoryCheck,
    };
  } catch (error) {
    console.error("Error checking victory:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// INFO
// =============================================================================

/**
 * Get coalition system info.
 */
export async function getCoalitionSystemInfoAction(gameId: string) {
  try {
    const parsed = UUIDSchema.safeParse(gameId);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid ID" };
    }

    const game = await db.query.games.findFirst({
      where: eq(games.id, parsed.data),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    return {
      success: true as const,
      data: {
        currentTurn: game.currentTurn,
        coalitionsUnlocked: areCoalitionsUnlocked(game.currentTurn),
        coalitionUnlockTurn: COALITION_UNLOCK_TURN,
        coalitionWarfareUnlocked: isCoalitionWarfareUnlocked(game.currentTurn),
        coalitionWarfareUnlockTurn: COALITION_WARFARE_UNLOCK_TURN,
        maxMembers: COALITION_MAX_MEMBERS,
        minMembers: COALITION_MIN_MEMBERS,
        victoryThreshold: COALITION_VICTORY_THRESHOLD * 100,
      },
    };
  } catch (error) {
    console.error("Error fetching coalition info:", error);
    return { success: false as const, error: "An error occurred" };
  }
}
