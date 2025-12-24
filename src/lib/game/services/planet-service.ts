/**
 * Planet Service (M3)
 *
 * Handles planet acquisition and release operations.
 * - Buy planets with cost scaling (PRD 5.3)
 * - Release planets with 50% refund
 * - Atomic updates to empire.planetCount and networth
 */

import { db } from "@/lib/db";
import { empires, planets, type Planet } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  calculatePlanetCost,
  calculateReleaseRefund,
  calculateAffordablePlanets,
} from "@/lib/formulas/planet-costs";
import { PLANET_COSTS, PLANET_PRODUCTION, type PlanetType } from "../constants";
import { calculateNetworth } from "../networth";

// =============================================================================
// TYPES
// =============================================================================

export interface BuyPlanetResult {
  success: boolean;
  error?: string;
  planet?: Planet;
  creditsDeducted?: number;
  newPlanetCount?: number;
  newNetworth?: number;
}

export interface ReleasePlanetResult {
  success: boolean;
  error?: string;
  creditsRefunded?: number;
  newPlanetCount?: number;
  newNetworth?: number;
}

export interface PlanetPurchaseInfo {
  planetType: PlanetType;
  baseCost: number;
  currentCost: number;
  costMultiplier: number;
  affordableCount: number;
  ownedCount: number;
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Buy a planet for an empire.
 *
 * - Validates sufficient credits
 * - Deducts credits using scaled cost
 * - Creates planet record
 * - Updates empire.planetCount and networth atomically
 *
 * @param empireId - The empire purchasing the planet
 * @param planetType - Type of planet to purchase
 * @param gameId - Game ID for the planet record
 * @param currentTurn - Current turn number for acquisition tracking
 */
export async function buyPlanet(
  empireId: string,
  planetType: PlanetType,
  gameId: string,
  currentTurn: number
): Promise<BuyPlanetResult> {
  // Fetch current empire state
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
    with: {
      planets: true,
    },
  });

  if (!empire) {
    return { success: false, error: "Empire not found" };
  }

  // Get base cost for planet type
  const baseCost = PLANET_COSTS[planetType];
  if (!baseCost) {
    return { success: false, error: `Invalid planet type: ${planetType}` };
  }

  // Calculate scaled cost based on current ownership
  const currentPlanetCount = empire.planetCount;
  const scaledCost = calculatePlanetCost(baseCost, currentPlanetCount);

  // Validate sufficient credits
  if (empire.credits < scaledCost) {
    return {
      success: false,
      error: `Insufficient credits. Need ${scaledCost.toLocaleString()}, have ${empire.credits.toLocaleString()}`,
    };
  }

  // Calculate new values
  const newCredits = empire.credits - scaledCost;
  const newPlanetCount = currentPlanetCount + 1;
  const newNetworth = calculateNetworth({
    planetCount: newPlanetCount,
    soldiers: empire.soldiers,
    fighters: empire.fighters,
    stations: empire.stations,
    lightCruisers: empire.lightCruisers,
    heavyCruisers: empire.heavyCruisers,
    carriers: empire.carriers,
    covertAgents: empire.covertAgents,
  });

  // Create planet and update empire atomically
  const [newPlanet] = await db
    .insert(planets)
    .values({
      empireId,
      gameId,
      type: planetType,
      productionRate: String(PLANET_PRODUCTION[planetType]),
      purchasePrice: scaledCost,
      acquiredAtTurn: currentTurn,
    })
    .returning();

  if (!newPlanet) {
    return { success: false, error: "Failed to create planet" };
  }

  // Update empire with new credits, planet count, and networth
  await db
    .update(empires)
    .set({
      credits: newCredits,
      planetCount: newPlanetCount,
      networth: newNetworth,
      updatedAt: new Date(),
    })
    .where(eq(empires.id, empireId));

  return {
    success: true,
    planet: newPlanet,
    creditsDeducted: scaledCost,
    newPlanetCount,
    newNetworth,
  };
}

/**
 * Release (sell) a planet for an empire.
 *
 * - Validates planet ownership
 * - Calculates 50% refund of current price
 * - Deletes planet record
 * - Updates empire.planetCount and networth atomically
 *
 * @param empireId - The empire releasing the planet
 * @param planetId - ID of the planet to release
 */
export async function releasePlanet(
  empireId: string,
  planetId: string
): Promise<ReleasePlanetResult> {
  // Fetch the planet to release
  const planet = await db.query.planets.findFirst({
    where: eq(planets.id, planetId),
  });

  if (!planet) {
    return { success: false, error: "Planet not found" };
  }

  if (planet.empireId !== empireId) {
    return { success: false, error: "Planet does not belong to this empire" };
  }

  // Fetch current empire state
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
  });

  if (!empire) {
    return { success: false, error: "Empire not found" };
  }

  // Cannot release if only 1 planet left
  if (empire.planetCount <= 1) {
    return { success: false, error: "Cannot release your last planet" };
  }

  // Get base cost for planet type
  const baseCost = PLANET_COSTS[planet.type as PlanetType];
  if (!baseCost) {
    return { success: false, error: `Invalid planet type: ${planet.type}` };
  }

  // Calculate refund (50% of current price based on ownership count)
  // Note: We use current planet count (including this planet) for the refund calculation
  const refund = calculateReleaseRefund(baseCost, empire.planetCount);

  // Calculate new values
  const newCredits = empire.credits + refund;
  const newPlanetCount = empire.planetCount - 1;
  const newNetworth = calculateNetworth({
    planetCount: newPlanetCount,
    soldiers: empire.soldiers,
    fighters: empire.fighters,
    stations: empire.stations,
    lightCruisers: empire.lightCruisers,
    heavyCruisers: empire.heavyCruisers,
    carriers: empire.carriers,
    covertAgents: empire.covertAgents,
  });

  // Delete planet
  await db.delete(planets).where(eq(planets.id, planetId));

  // Update empire with new credits, planet count, and networth
  await db
    .update(empires)
    .set({
      credits: newCredits,
      planetCount: newPlanetCount,
      networth: newNetworth,
      updatedAt: new Date(),
    })
    .where(eq(empires.id, empireId));

  return {
    success: true,
    creditsRefunded: refund,
    newPlanetCount,
    newNetworth,
  };
}

/**
 * Get purchase information for a planet type.
 *
 * Returns current cost, affordable count, and ownership info.
 *
 * @param empireId - The empire to check
 * @param planetType - Type of planet to get info for
 */
export async function getPlanetPurchaseInfo(
  empireId: string,
  planetType: PlanetType
): Promise<PlanetPurchaseInfo | null> {
  // Fetch current empire state
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
    with: {
      planets: true,
    },
  });

  if (!empire) {
    return null;
  }

  // Get base cost for planet type
  const baseCost = PLANET_COSTS[planetType];
  if (!baseCost) {
    return null;
  }

  // Calculate current cost and multiplier
  const currentCost = calculatePlanetCost(baseCost, empire.planetCount);
  const costMultiplier = 1 + empire.planetCount * 0.05;

  // Calculate how many can be afforded
  const affordableCount = calculateAffordablePlanets(
    baseCost,
    empire.planetCount,
    empire.credits
  );

  // Count owned planets of this type
  const ownedCount = empire.planets.filter((p) => p.type === planetType).length;

  return {
    planetType,
    baseCost,
    currentCost,
    costMultiplier,
    affordableCount,
    ownedCount,
  };
}

/**
 * Get purchase information for all planet types.
 *
 * @param empireId - The empire to check
 */
export async function getAllPlanetPurchaseInfo(
  empireId: string
): Promise<PlanetPurchaseInfo[] | null> {
  const planetTypes: PlanetType[] = [
    "food",
    "ore",
    "petroleum",
    "tourism",
    "urban",
    "education",
    "government",
    "research",
    "supply",
    "anti_pollution",
  ];

  // Fetch current empire state once
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId),
    with: {
      planets: true,
    },
  });

  if (!empire) {
    return null;
  }

  return planetTypes.map((planetType) => {
    const baseCost = PLANET_COSTS[planetType];
    const currentCost = calculatePlanetCost(baseCost, empire.planetCount);
    const costMultiplier = 1 + empire.planetCount * 0.05;
    const affordableCount = calculateAffordablePlanets(
      baseCost,
      empire.planetCount,
      empire.credits
    );
    const ownedCount = empire.planets.filter((p) => p.type === planetType).length;

    return {
      planetType,
      baseCost,
      currentCost,
      costMultiplier,
      affordableCount,
      ownedCount,
    };
  });
}
