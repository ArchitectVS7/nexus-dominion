/**
 * Bot Empire Generator
 *
 * Creates bot empires for a game. Each bot gets:
 * - Unique name from BOT_EMPIRE_NAMES
 * - Random archetype from 8 options
 * - tier4_random tier (pure random decisions)
 * - Same starting resources/planets as player (9 planets)
 * - Initialized research & upgrades
 */

import { db } from "@/lib/db";
import { empires, planets, type NewEmpire, type NewPlanet, type Empire } from "@/lib/db/schema";
import {
  STARTING_RESOURCES,
  STARTING_MILITARY,
  STARTING_POPULATION,
  STARTING_PLANETS,
  PLANET_PRODUCTION,
  PLANET_COSTS,
  TOTAL_STARTING_PLANETS,
} from "@/lib/game/constants";
import { calculateNetworth } from "@/lib/game/networth";
import { initializeResearch } from "@/lib/game/services/research-service";
import { initializeUnitUpgrades } from "@/lib/game/services/upgrade-service";
import { getBotEmpireName, getBotEmperorName } from "./bot-names";
import type { BotArchetype, BotTier } from "./types";

// =============================================================================
// ARCHETYPES
// =============================================================================

const BOT_ARCHETYPES: BotArchetype[] = [
  "warlord",
  "diplomat",
  "merchant",
  "schemer",
  "turtle",
  "blitzkrieg",
  "tech_rush",
  "opportunist",
];

/**
 * Get a random archetype for a bot.
 * Each archetype has equal probability in M5 (random bots).
 */
export function getRandomArchetype(): BotArchetype {
  const index = Math.floor(Math.random() * BOT_ARCHETYPES.length);
  return BOT_ARCHETYPES[index] ?? "opportunist";
}

// =============================================================================
// BOT EMPIRE CREATION
// =============================================================================

/**
 * Create a single bot empire with starting planets.
 * Follows the same pattern as createPlayerEmpire.
 *
 * @param gameId - Game to create bot for
 * @param name - Bot empire name
 * @param emperorName - Bot emperor name
 * @param archetype - Bot archetype (affects behavior in M9+)
 * @param tier - Bot tier (tier4_random for M5)
 */
export async function createBotEmpire(
  gameId: string,
  name: string,
  emperorName: string,
  archetype: BotArchetype,
  tier: BotTier = "tier4_random"
): Promise<Empire> {
  // Calculate starting networth (same as player)
  const networth = calculateNetworth({
    planetCount: TOTAL_STARTING_PLANETS,
    ...STARTING_MILITARY,
  });

  // Create the empire
  const empireData: NewEmpire = {
    gameId,
    name,
    emperorName,
    type: "bot",
    botTier: tier,
    botArchetype: archetype,
    ...STARTING_RESOURCES,
    ...STARTING_MILITARY,
    ...STARTING_POPULATION,
    networth,
    planetCount: TOTAL_STARTING_PLANETS,
  };

  const [empire] = await db.insert(empires).values(empireData).returning();
  if (!empire) {
    throw new Error(`Failed to create bot empire: ${name}`);
  }

  // Create starting planets (same as player)
  await createBotStartingPlanets(empire.id, gameId);

  // Initialize M3 systems (research & upgrades)
  await initializeResearch(empire.id, gameId);
  await initializeUnitUpgrades(empire.id, gameId);

  return empire;
}

/**
 * Create the 9 starting planets for a bot empire.
 * Same distribution as player: 2 Food, 2 Ore, 1 Petroleum, 1 Tourism, 1 Urban, 1 Government, 1 Research
 */
async function createBotStartingPlanets(
  empireId: string,
  gameId: string
): Promise<void> {
  const planetValues: NewPlanet[] = [];

  for (const { type, count } of STARTING_PLANETS) {
    for (let i = 0; i < count; i++) {
      planetValues.push({
        empireId,
        gameId,
        type,
        productionRate: String(PLANET_PRODUCTION[type]),
        purchasePrice: PLANET_COSTS[type],
      });
    }
  }

  await db.insert(planets).values(planetValues);
}

// =============================================================================
// BATCH BOT CREATION
// =============================================================================

/**
 * Create all bot empires for a game.
 * Creates the specified number of bots (default 25) with unique names.
 *
 * @param gameId - Game to create bots for
 * @param count - Number of bots to create (default 25)
 * @returns Array of created bot empires
 */
export async function createBotEmpires(
  gameId: string,
  count: number = 25
): Promise<Empire[]> {
  const bots: Empire[] = [];

  for (let i = 0; i < count; i++) {
    const name = getBotEmpireName(i);
    const emperorName = getBotEmperorName(i);
    const archetype = getRandomArchetype();

    const bot = await createBotEmpire(
      gameId,
      name,
      emperorName,
      archetype,
      "tier4_random"
    );

    bots.push(bot);
  }

  return bots;
}

/**
 * Create bot empires in parallel for better performance.
 * Uses Promise.all to create bots concurrently.
 *
 * Note: This may cause database connection issues with too many concurrent inserts.
 * Use createBotEmpires for safer sequential creation.
 *
 * @param gameId - Game to create bots for
 * @param count - Number of bots to create (default 25)
 * @returns Array of created bot empires
 */
export async function createBotEmpiresParallel(
  gameId: string,
  count: number = 25
): Promise<Empire[]> {
  const promises: Promise<Empire>[] = [];

  for (let i = 0; i < count; i++) {
    const name = getBotEmpireName(i);
    const emperorName = getBotEmperorName(i);
    const archetype = getRandomArchetype();

    promises.push(
      createBotEmpire(gameId, name, emperorName, archetype, "tier4_random")
    );
  }

  return Promise.all(promises);
}
