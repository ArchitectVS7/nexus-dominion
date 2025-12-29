"use server";

/**
 * Nuclear Warfare Server Actions (M11)
 *
 * Server actions for nuclear weapon purchase and deployment.
 * All inputs are validated with Zod schemas.
 *
 * @see docs/PRD.md Section on Turn 100+ unlocks
 */

import { z } from "zod";
import { db } from "@/lib/db";
import { games, empires, resourceInventory, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  executeNuclearStrike,
  canLaunchNuclearStrike,
  getPostStrikeCivilStatus,
  generateNuclearNewsHeadline,
  generateGlobalBroadcast,
  NUCLEAR_CONSTANTS,
  areNuclearWeaponsUnlocked,
  getNuclearWeaponCost,
} from "@/lib/combat/nuclear";
import { getEmpireCoalition } from "@/lib/game/repositories/coalition-repository";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const UUIDSchema = z.string().uuid("Invalid UUID format");

const PurchaseNuclearSchema = z.object({
  gameId: UUIDSchema,
  empireId: UUIDSchema,
});

const LaunchNuclearSchema = z.object({
  gameId: UUIDSchema,
  attackerEmpireId: UUIDSchema,
  targetEmpireId: UUIDSchema,
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if an empire has a nuclear weapon in inventory.
 */
async function hasNuclearWeapon(empireId: string): Promise<boolean> {
  const inventory = await db.query.resourceInventory.findFirst({
    where: and(
      eq(resourceInventory.empireId, empireId),
      eq(resourceInventory.resourceType, "nuclear_warheads")
    ),
  });

  return inventory !== undefined && inventory.quantity > 0;
}

/**
 * Add a nuclear weapon to empire inventory.
 */
async function addNuclearWeapon(empireId: string, gameId: string): Promise<void> {
  // Check if inventory entry exists
  const existing = await db.query.resourceInventory.findFirst({
    where: and(
      eq(resourceInventory.empireId, empireId),
      eq(resourceInventory.resourceType, "nuclear_warheads")
    ),
  });

  if (existing) {
    // Increment quantity
    await db
      .update(resourceInventory)
      .set({
        quantity: existing.quantity + 1,
        updatedAt: new Date(),
      })
      .where(eq(resourceInventory.id, existing.id));
  } else {
    // Create new inventory entry
    await db.insert(resourceInventory).values({
      empireId,
      gameId,
      resourceType: "nuclear_warheads",
      tier: "tier3",
      quantity: 1,
    });
  }
}

/**
 * Remove a nuclear weapon from empire inventory.
 */
async function removeNuclearWeapon(empireId: string): Promise<boolean> {
  const inventory = await db.query.resourceInventory.findFirst({
    where: and(
      eq(resourceInventory.empireId, empireId),
      eq(resourceInventory.resourceType, "nuclear_warheads")
    ),
  });

  if (!inventory || inventory.quantity <= 0) {
    return false;
  }

  await db
    .update(resourceInventory)
    .set({
      quantity: inventory.quantity - 1,
      updatedAt: new Date(),
    })
    .where(eq(resourceInventory.id, inventory.id));

  return true;
}

/**
 * Get the last turn an empire launched a nuclear weapon.
 * For now, we'll track this via messages or a simple approach.
 * A proper implementation would add a field to the empire table.
 */
async function getLastNukeLaunchTurn(
  empireId: string,
  gameId: string
): Promise<number | null> {
  // Check for nuclear launch messages from this empire
  const lastNukeMessage = await db.query.messages.findFirst({
    where: and(
      eq(messages.senderId, empireId),
      eq(messages.gameId, gameId),
      eq(messages.trigger, "broadcast_shout")
    ),
    orderBy: (messages, { desc }) => [desc(messages.turn)],
  });

  // This is a simplified approach - in production, add a lastNukeLaunchTurn field to empires
  return null; // Allow launch for now
}

/**
 * Create a broadcast message for all empires.
 */
async function createGlobalBroadcast(
  gameId: string,
  senderId: string,
  content: string,
  turn: number
): Promise<void> {
  await db.insert(messages).values({
    gameId,
    senderId,
    recipientId: null, // Broadcast
    channel: "broadcast",
    trigger: "broadcast_shout",
    content,
    turn,
  });
}

// =============================================================================
// PURCHASE NUCLEAR WEAPON
// =============================================================================

/**
 * Purchase a nuclear weapon from the Syndicate Black Market.
 */
export async function purchaseNuclearWeaponAction(
  gameId: string,
  empireId: string
) {
  try {
    const parsed = PurchaseNuclearSchema.safeParse({ gameId, empireId });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get game and empire
    const game = await db.query.games.findFirst({
      where: eq(games.id, parsed.data.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, parsed.data.empireId),
    });

    if (!empire) {
      return { success: false as const, error: "Empire not found" };
    }

    if (empire.gameId !== gameId) {
      return { success: false as const, error: "Empire not in this game" };
    }

    // Check if nuclear weapons are unlocked
    if (!areNuclearWeaponsUnlocked(game.currentTurn)) {
      return {
        success: false as const,
        error: `Nuclear weapons unlock at turn ${NUCLEAR_CONSTANTS.UNLOCK_TURN}. Current turn: ${game.currentTurn}`,
      };
    }

    // Check if empire has enough credits
    const cost = getNuclearWeaponCost();
    if (empire.credits < cost) {
      return {
        success: false as const,
        error: `Insufficient credits. Need ${cost.toLocaleString()}, have ${empire.credits.toLocaleString()}`,
      };
    }

    // Deduct credits and add weapon
    await db.transaction(async (tx) => {
      await tx
        .update(empires)
        .set({
          credits: empire.credits - cost,
          updatedAt: new Date(),
        })
        .where(eq(empires.id, parsed.data.empireId));
    });

    await addNuclearWeapon(parsed.data.empireId, parsed.data.gameId);

    return {
      success: true as const,
      data: {
        message: "Nuclear weapon acquired from the Syndicate Black Market",
        cost,
        remainingCredits: empire.credits - cost,
      },
    };
  } catch (error) {
    console.error("Error purchasing nuclear weapon:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// LAUNCH NUCLEAR STRIKE
// =============================================================================

/**
 * Launch a nuclear strike against a target empire.
 */
export async function launchNuclearStrikeAction(
  gameId: string,
  attackerEmpireId: string,
  targetEmpireId: string
) {
  try {
    const parsed = LaunchNuclearSchema.safeParse({
      gameId,
      attackerEmpireId,
      targetEmpireId,
    });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get game
    const game = await db.query.games.findFirst({
      where: eq(games.id, parsed.data.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    // Get attacker
    const attacker = await db.query.empires.findFirst({
      where: eq(empires.id, parsed.data.attackerEmpireId),
    });

    if (!attacker) {
      return { success: false as const, error: "Attacker empire not found" };
    }

    if (attacker.gameId !== gameId) {
      return { success: false as const, error: "Attacker not in this game" };
    }

    // Get target
    const target = await db.query.empires.findFirst({
      where: eq(empires.id, parsed.data.targetEmpireId),
    });

    if (!target) {
      return { success: false as const, error: "Target empire not found" };
    }

    if (target.gameId !== gameId) {
      return { success: false as const, error: "Target not in this game" };
    }

    if (target.isEliminated) {
      return { success: false as const, error: "Cannot target eliminated empire" };
    }

    // Check if attacker has nuclear weapon
    const hasNuke = await hasNuclearWeapon(parsed.data.attackerEmpireId);

    // Get last launch turn
    const lastNukeLaunchTurn = await getLastNukeLaunchTurn(
      parsed.data.attackerEmpireId,
      parsed.data.gameId
    );

    // Validate launch
    const validation = canLaunchNuclearStrike({
      attacker: {
        id: attacker.id,
        credits: attacker.credits,
        civilStatus: attacker.civilStatus,
      },
      target: {
        id: target.id,
        population: target.population,
      },
      currentTurn: game.currentTurn,
      lastNukeLaunchTurn,
      hasNuclearWeapon: hasNuke,
    });

    if (!validation.allowed) {
      return { success: false as const, error: validation.reason };
    }

    // Execute the strike
    const result = executeNuclearStrike(
      { id: attacker.id },
      { id: target.id, population: target.population }
    );

    // Apply consequences in a transaction
    await db.transaction(async (tx) => {
      // Remove nuclear weapon from inventory
      await removeNuclearWeapon(parsed.data.attackerEmpireId);

      // Apply population damage to target
      if (result.populationKilled > 0) {
        const newPopulation = Math.max(
          NUCLEAR_CONSTANTS.MIN_SURVIVING_POPULATION,
          target.population - result.populationKilled
        );

        await tx
          .update(empires)
          .set({
            population: newPopulation,
            updatedAt: new Date(),
          })
          .where(eq(empires.id, parsed.data.targetEmpireId));
      }

      // Apply civil status penalty to attacker
      const newCivilStatus = getPostStrikeCivilStatus(attacker.civilStatus);
      await tx
        .update(empires)
        .set({
          civilStatus: newCivilStatus as typeof attacker.civilStatus,
          reputation: Math.max(0, attacker.reputation + result.reputationLoss),
          updatedAt: new Date(),
        })
        .where(eq(empires.id, parsed.data.attackerEmpireId));
    });

    // Create global broadcast if damage occurred
    if (result.globalOutrage) {
      const broadcast = generateGlobalBroadcast(attacker.name, target.name);
      await createGlobalBroadcast(
        parsed.data.gameId,
        parsed.data.attackerEmpireId,
        broadcast,
        game.currentTurn
      );
    }

    // Generate news headline
    const headline = generateNuclearNewsHeadline(
      attacker.name,
      target.name,
      result.populationKilled,
      result.detected,
      result.detectionOutcome === "intercepted"
    );

    return {
      success: true as const,
      data: {
        result: {
          detected: result.detected,
          detectionOutcome: result.detectionOutcome,
          populationKilled: result.populationKilled,
          civilStatusDrop: result.civilStatusDrop,
          reputationLoss: result.reputationLoss,
          globalOutrage: result.globalOutrage,
        },
        description: result.description,
        headline,
      },
    };
  } catch (error) {
    console.error("Error launching nuclear strike:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// GET NUCLEAR STATUS
// =============================================================================

/**
 * Get nuclear warfare status for an empire.
 */
export async function getNuclearStatusAction(gameId: string, empireId: string) {
  try {
    const parsed = PurchaseNuclearSchema.safeParse({ gameId, empireId });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get game
    const game = await db.query.games.findFirst({
      where: eq(games.id, parsed.data.gameId),
    });

    if (!game) {
      return { success: false as const, error: "Game not found" };
    }

    // Get empire
    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, parsed.data.empireId),
    });

    if (!empire) {
      return { success: false as const, error: "Empire not found" };
    }

    // Check nuclear weapon inventory
    const hasNuke = await hasNuclearWeapon(parsed.data.empireId);
    const inventory = await db.query.resourceInventory.findFirst({
      where: and(
        eq(resourceInventory.empireId, parsed.data.empireId),
        eq(resourceInventory.resourceType, "nuclear_warheads")
      ),
    });

    // Get last launch turn
    const lastNukeLaunchTurn = await getLastNukeLaunchTurn(
      parsed.data.empireId,
      parsed.data.gameId
    );

    const isUnlocked = areNuclearWeaponsUnlocked(game.currentTurn);
    const cost = getNuclearWeaponCost();
    const canAfford = empire.credits >= cost;

    let cooldownRemaining: number | undefined;
    if (lastNukeLaunchTurn !== null) {
      const turnsSinceLaunch = game.currentTurn - lastNukeLaunchTurn;
      if (turnsSinceLaunch < NUCLEAR_CONSTANTS.COOLDOWN_TURNS) {
        cooldownRemaining = NUCLEAR_CONSTANTS.COOLDOWN_TURNS - turnsSinceLaunch;
      }
    }

    return {
      success: true as const,
      data: {
        currentTurn: game.currentTurn,
        unlockTurn: NUCLEAR_CONSTANTS.UNLOCK_TURN,
        isUnlocked,
        turnsUntilUnlock: isUnlocked ? 0 : NUCLEAR_CONSTANTS.UNLOCK_TURN - game.currentTurn,
        hasNuclearWeapon: hasNuke,
        nuclearWeaponCount: inventory?.quantity ?? 0,
        cost,
        canAfford,
        credits: empire.credits,
        lastNukeLaunchTurn,
        cooldownRemaining,
        cooldownTurns: NUCLEAR_CONSTANTS.COOLDOWN_TURNS,
        consequences: {
          populationDamage: `${NUCLEAR_CONSTANTS.POPULATION_DAMAGE * 100}%`,
          civilStatusPenalty: NUCLEAR_CONSTANTS.CIVIL_STATUS_PENALTY,
          reputationPenalty: NUCLEAR_CONSTANTS.REPUTATION_PENALTY,
          detectionChance: `${NUCLEAR_CONSTANTS.DETECTION_CHANCE * 100}%`,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching nuclear status:", error);
    return { success: false as const, error: "An error occurred" };
  }
}

// =============================================================================
// GET NUCLEAR TARGETS
// =============================================================================

/**
 * Get potential nuclear strike targets.
 */
export async function getNuclearTargetsAction(gameId: string, empireId: string) {
  try {
    const parsed = PurchaseNuclearSchema.safeParse({ gameId, empireId });
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    // Get all non-eliminated empires except self
    const targets = await db.query.empires.findMany({
      where: and(
        eq(empires.gameId, parsed.data.gameId),
        eq(empires.isEliminated, false)
      ),
    });

    // Get attacker's coalition (if any)
    const attackerCoalition = await getEmpireCoalition(parsed.data.empireId);

    const targetList = targets
      .filter((e) => e.id !== parsed.data.empireId)
      .map((e) => ({
        id: e.id,
        name: e.name,
        population: e.population,
        networth: e.networth,
        estimatedCasualties: Math.floor(e.population * NUCLEAR_CONSTANTS.POPULATION_DAMAGE),
        isCoalitionMember: attackerCoalition
          ? false // Would need to check coalition membership
          : false,
      }));

    return {
      success: true as const,
      data: targetList,
    };
  } catch (error) {
    console.error("Error fetching nuclear targets:", error);
    return { success: false as const, error: "An error occurred" };
  }
}
