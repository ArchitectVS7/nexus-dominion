import type { BotAgent, Archetype, BotAction, BotActionType, Emotion } from "../types/bot";
import type { DiplomacyState } from "../types/diplomacy";
import type { EmpireId } from "../types/ids";
import { SeededRNG } from "../utils/rng";
import { relationshipKey } from "../types/diplomacy";

/** Turn ratio tiers as defined in PRD §6 */
export const MOMENTUM_TIERS = {
  fodder: { min: 0.5, max: 0.75 },
  standard: { min: 1.0, max: 1.0 },
  elite: { min: 1.25, max: 1.5 },
  nemesis: { min: 2.0, max: 2.0 },
} as const;

export type MomentumTier = keyof typeof MOMENTUM_TIERS;

export const ALL_ARCHETYPES: Archetype[] = [
  "warlord", "diplomat", "merchant", "schemer",
  "turtle", "blitzkrieg", "tech-rush", "opportunist",
];

/** Priority weights for each archetype's action preferences */
const ARCHETYPE_PRIORITIES: Record<Archetype, Partial<Record<BotActionType, number>>> = {
  warlord: { attack: 5, "build-unit": 4, "claim-system": 2 },
  diplomat: { "propose-pact": 5, trade: 3, "claim-system": 2 },
  merchant: { trade: 5, "claim-system": 3, "build-installation": 3 },
  schemer: { "propose-pact": 4, "break-pact": 3, attack: 2 },
  turtle: { "build-installation": 5, "build-unit": 4, "claim-system": 2 },
  blitzkrieg: { attack: 5, "claim-system": 4, "build-unit": 3 },
  "tech-rush": { "build-installation": 4, trade: 3, "claim-system": 2 },
  opportunist: { "claim-system": 4, trade: 3, attack: 3, "propose-pact": 2 },
};

/**
 * Determine how many actions a bot gets this cycle, based on momentum rating.
 * Uses accumulation: fractional actions carry over.
 */
export function botActionsThisCycle(
  momentumRating: number,
  accumulatedActions: number,
): { actions: number; newAccumulated: number } {
  const total = accumulatedActions + momentumRating;
  const actions = Math.floor(total);
  return { actions, newAccumulated: total - actions };
}

/**
 * Select a bot action type based on archetype priorities + emotional modifiers.
 */
export function selectActionType(
  bot: BotAgent,
  rng: SeededRNG,
): BotActionType {
  const priorities = { ...ARCHETYPE_PRIORITIES[bot.archetype] };

  // Emotional modifiers
  if (bot.emotionalState.current === "aggressive") {
    priorities.attack = (priorities.attack ?? 0) + 3;
  } else if (bot.emotionalState.current === "fearful") {
    priorities["build-unit"] = (priorities["build-unit"] ?? 0) + 3;
    priorities["propose-pact"] = (priorities["propose-pact"] ?? 0) + 2;
  } else if (bot.emotionalState.current === "ambitious") {
    priorities["claim-system"] = (priorities["claim-system"] ?? 0) + 3;
  } else if (bot.emotionalState.current === "vengeful") {
    priorities.attack = (priorities.attack ?? 0) + 4;
    priorities["break-pact"] = (priorities["break-pact"] ?? 0) + 2;
  }

  const types = Object.keys(priorities) as BotActionType[];
  const weights = types.map((t) => priorities[t] ?? 0);
  return rng.weighted(types, weights);
}

/**
 * Generate bot actions for one cycle. Deterministic given the same RNG state.
 */
export function generateBotActions(
  bot: BotAgent,
  actionCount: number,
  rng: SeededRNG,
): BotAction[] {
  const actions: BotAction[] = [];
  for (let i = 0; i < actionCount; i++) {
    const type = selectActionType(bot, rng);
    actions.push({
      type,
      empireId: bot.empireId,
    });
  }
  return actions;
}

/**
 * Update bot emotional state based on events.
 */
export function updateEmotion(
  current: Emotion,
  wasAttacked: boolean,
  lostSystem: boolean,
  gainedSystem: boolean,
  highPower: boolean,
): Emotion {
  if (wasAttacked && lostSystem) return "desperate";
  if (wasAttacked) return "fearful";
  if (lostSystem) return "vengeful";
  if (gainedSystem && highPower) return "ambitious";
  if (gainedSystem) return "calm";
  return current;
}

/**
 * Check if a bot has relationship memory with another empire.
 */
export function hasRelationshipMemory(
  diplomacy: DiplomacyState,
  empireA: EmpireId,
  empireB: EmpireId,
): boolean {
  const key = relationshipKey(empireA, empireB);
  return diplomacy.relationships.has(key);
}
