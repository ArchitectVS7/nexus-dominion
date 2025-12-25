/**
 * Bot Decision Engine
 *
 * Implements weighted random decision-making for M5 Random Bots.
 * Generates decisions based on game state and difficulty settings.
 *
 * Decision Weights (PRD M5):
 * - 35% build units
 * - 20% buy planets
 * - 15% attack (0% during protection period)
 * - 10% diplomacy (stub: resolves to do_nothing until M7)
 * - 10% trade (stub: resolves to do_nothing until M7)
 * - 10% do nothing
 */

import type {
  BotDecision,
  BotDecisionContext,
  BotDecisionType,
  BotDecisionWeights,
  Forces,
  PlanetType,
  UnitType,
} from "./types";
import {
  selectTarget,
  shouldMakeSuboptimalChoice,
  applySuboptimalQuantity,
} from "./difficulty";
import {
  UNIT_COSTS,
  calculateAffordableUnits,
} from "@/lib/game/unit-config";
import { PLANET_COSTS } from "@/lib/game/constants";

// =============================================================================
// BASE DECISION WEIGHTS
// =============================================================================

export const BASE_WEIGHTS: BotDecisionWeights = {
  build_units: 0.35,
  buy_planet: 0.20,
  attack: 0.15,
  diplomacy: 0.10, // Stub: resolves to do_nothing until M7
  trade: 0.10, // Stub: resolves to do_nothing until M7
  do_nothing: 0.10,
};

// Planet types that bots can purchase (excludes special types)
const PURCHASABLE_PLANET_TYPES: PlanetType[] = [
  "food",
  "ore",
  "petroleum",
  "tourism",
  "urban",
  "government",
  "research",
];

// Combat unit types (excludes covert agents)
const COMBAT_UNIT_TYPES: UnitType[] = [
  "soldiers",
  "fighters",
  "lightCruisers",
  "heavyCruisers",
  "carriers",
  "stations",
];

// =============================================================================
// WEIGHT ADJUSTMENT
// =============================================================================

/**
 * Get adjusted weights based on game state.
 * - Attack weight is 0 during protection period (turn <= protectionTurns)
 * - Redistributes attack weight proportionally to other actions
 *
 * @param context - Current game context
 * @returns Adjusted decision weights
 */
export function getAdjustedWeights(
  context: BotDecisionContext
): BotDecisionWeights {
  const isProtected = context.currentTurn <= context.protectionTurns;

  if (!isProtected) {
    // After protection period, use base weights
    return { ...BASE_WEIGHTS };
  }

  // During protection: redistribute attack weight to other actions
  const attackWeight = BASE_WEIGHTS.attack;
  const otherWeightSum =
    BASE_WEIGHTS.build_units +
    BASE_WEIGHTS.buy_planet +
    BASE_WEIGHTS.diplomacy +
    BASE_WEIGHTS.trade +
    BASE_WEIGHTS.do_nothing;

  // Redistribute proportionally
  const redistributionFactor = 1 + attackWeight / otherWeightSum;

  return {
    build_units: BASE_WEIGHTS.build_units * redistributionFactor,
    buy_planet: BASE_WEIGHTS.buy_planet * redistributionFactor,
    attack: 0, // No attacks during protection
    diplomacy: BASE_WEIGHTS.diplomacy * redistributionFactor,
    trade: BASE_WEIGHTS.trade * redistributionFactor,
    do_nothing: BASE_WEIGHTS.do_nothing * redistributionFactor,
  };
}

// =============================================================================
// DECISION TYPE SELECTION
// =============================================================================

/**
 * Select a decision type based on weights using weighted random selection.
 *
 * @param weights - Decision weights (must sum to ~1.0)
 * @param random - Optional random value for testing (0-1)
 * @returns Selected decision type
 */
export function selectDecisionType(
  weights: BotDecisionWeights,
  random?: number
): BotDecisionType {
  const roll = random ?? Math.random();
  let cumulative = 0;

  const entries: [BotDecisionType, number][] = [
    ["build_units", weights.build_units],
    ["buy_planet", weights.buy_planet],
    ["attack", weights.attack],
    ["diplomacy", weights.diplomacy],
    ["trade", weights.trade],
    ["do_nothing", weights.do_nothing],
  ];

  for (const [type, weight] of entries) {
    cumulative += weight;
    if (roll < cumulative) {
      return type;
    }
  }

  // Fallback (should never reach due to weights summing to 1.0)
  return "do_nothing";
}

// =============================================================================
// DECISION GENERATORS
// =============================================================================

/**
 * Generate a complete bot decision.
 * Selects a decision type and generates the appropriate decision.
 *
 * @param context - Current game context
 * @param randomType - Optional random value for type selection (testing)
 * @param randomDecision - Optional random value for decision generation (testing)
 * @returns Generated decision
 */
export function generateBotDecision(
  context: BotDecisionContext,
  randomType?: number,
  randomDecision?: number
): BotDecision {
  const weights = getAdjustedWeights(context);
  let decisionType = selectDecisionType(weights, randomType);

  // Apply suboptimal choice for Easy mode
  if (shouldMakeSuboptimalChoice(context.difficulty, randomDecision)) {
    // Make a less optimal choice by choosing a random decision type
    const allTypes: BotDecisionType[] = [
      "build_units",
      "buy_planet",
      "attack",
      "diplomacy",
      "trade",
      "do_nothing",
    ];
    const validTypes = allTypes.filter((t) => {
      if (t === "attack" && context.currentTurn <= context.protectionTurns) {
        return false;
      }
      return true;
    });
    const suboptimalIndex = Math.floor(
      (randomDecision ?? Math.random()) * validTypes.length
    );
    decisionType = validTypes[suboptimalIndex] ?? "do_nothing";
  }

  // Generate specific decision based on type
  switch (decisionType) {
    case "build_units":
      return generateBuildUnitsDecision(context, randomDecision);
    case "buy_planet":
      return generateBuyPlanetDecision(context, randomDecision);
    case "attack":
      return generateAttackDecision(context, randomDecision);
    case "diplomacy":
      return generateDiplomacyDecision();
    case "trade":
      return generateTradeDecision();
    case "do_nothing":
    default:
      return { type: "do_nothing" };
  }
}

/**
 * Generate a build_units decision.
 * Randomly selects a unit type and affordable quantity.
 */
function generateBuildUnitsDecision(
  context: BotDecisionContext,
  random?: number
): BotDecision {
  const { empire, difficulty } = context;

  // Filter to unit types the bot can afford
  const affordableTypes = COMBAT_UNIT_TYPES.filter((type) => {
    const cost = UNIT_COSTS[type];
    return empire.credits >= cost;
  });

  if (affordableTypes.length === 0) {
    return { type: "do_nothing" };
  }

  // Select random unit type
  const typeIndex = Math.floor((random ?? Math.random()) * affordableTypes.length);
  const unitType = affordableTypes[typeIndex];
  if (!unitType) {
    return { type: "do_nothing" };
  }

  // Calculate affordable quantity (use 10-50% of available credits)
  const maxAffordable = calculateAffordableUnits(unitType, empire.credits);
  const spendFraction = 0.1 + (random ?? Math.random()) * 0.4; // 10-50%
  let quantity = Math.max(1, Math.floor(maxAffordable * spendFraction));

  // Apply suboptimal quantity for Easy mode
  quantity = applySuboptimalQuantity(quantity, 1, difficulty, random);

  return { type: "build_units", unitType, quantity };
}

/**
 * Generate a buy_planet decision.
 * Randomly selects an affordable planet type.
 */
function generateBuyPlanetDecision(
  context: BotDecisionContext,
  random?: number
): BotDecision {
  const { empire } = context;

  // Filter to planet types the bot can afford
  // Note: Planet cost scaling isn't applied here for simplicity
  const affordableTypes = PURCHASABLE_PLANET_TYPES.filter((type) => {
    const cost = PLANET_COSTS[type];
    return empire.credits >= cost;
  });

  if (affordableTypes.length === 0) {
    return { type: "do_nothing" };
  }

  // Select random planet type
  const typeIndex = Math.floor((random ?? Math.random()) * affordableTypes.length);
  const planetType = affordableTypes[typeIndex];
  if (!planetType) {
    return { type: "do_nothing" };
  }

  return { type: "buy_planet", planetType };
}

/**
 * Generate an attack decision.
 * Selects a target based on difficulty and allocates forces.
 */
function generateAttackDecision(
  context: BotDecisionContext,
  random?: number
): BotDecision {
  const { empire, difficulty, availableTargets, currentTurn, protectionTurns } =
    context;

  // Can't attack during protection period
  if (currentTurn <= protectionTurns) {
    return { type: "do_nothing" };
  }

  // Filter valid targets (non-eliminated, not self)
  const validTargets = availableTargets.filter(
    (t) => !t.isEliminated && t.id !== empire.id
  );

  if (validTargets.length === 0) {
    return { type: "do_nothing" };
  }

  // Select target based on difficulty
  const target = selectTarget(validTargets, difficulty, random);
  if (!target) {
    return { type: "do_nothing" };
  }

  // Check if bot has any forces to attack with
  const hasSoldiers = empire.soldiers > 0;
  const hasNavy =
    empire.fighters > 0 ||
    empire.lightCruisers > 0 ||
    empire.heavyCruisers > 0 ||
    empire.carriers > 0;

  if (!hasSoldiers && !hasNavy) {
    return { type: "do_nothing" };
  }

  // Allocate a portion of forces (30-70% of each unit type)
  const allocationFactor = 0.3 + (random ?? Math.random()) * 0.4;

  const forces: Forces = {
    soldiers: Math.floor(empire.soldiers * allocationFactor),
    fighters: Math.floor(empire.fighters * allocationFactor),
    stations: 0, // Stations don't attack
    lightCruisers: Math.floor(empire.lightCruisers * allocationFactor),
    heavyCruisers: Math.floor(empire.heavyCruisers * allocationFactor),
    carriers: Math.floor(empire.carriers * allocationFactor),
  };

  // Ensure at least some soldiers for ground combat
  if (forces.soldiers === 0 && empire.soldiers > 0) {
    forces.soldiers = Math.min(10, empire.soldiers);
  }

  return { type: "attack", targetId: target.id, forces };
}

/**
 * Generate a diplomacy decision.
 * STUB: Returns do_nothing until M7 (Market & Diplomacy).
 */
function generateDiplomacyDecision(): BotDecision {
  // Diplomacy not implemented until M7
  return { type: "do_nothing" };
}

/**
 * Generate a trade decision.
 * STUB: Returns do_nothing until M7 (Market & Diplomacy).
 */
function generateTradeDecision(): BotDecision {
  // Trade not implemented until M7
  return { type: "do_nothing" };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the sum of all weights (should be ~1.0).
 */
export function getWeightSum(weights: BotDecisionWeights): number {
  return (
    weights.build_units +
    weights.buy_planet +
    weights.attack +
    weights.diplomacy +
    weights.trade +
    weights.do_nothing
  );
}

/**
 * Validate that weights sum to approximately 1.0.
 */
export function validateWeights(weights: BotDecisionWeights): boolean {
  const sum = getWeightSum(weights);
  return Math.abs(sum - 1.0) < 0.001;
}
