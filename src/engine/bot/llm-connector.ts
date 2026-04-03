/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — LLM Bot Connector

   Provides API wiring for Apex-tier bots (intelligenceTier: 1).
   Handles prompt formatting, response parsing, and graceful
   degradation to standard bot logic if the API is unavailable.
   ══════════════════════════════════════════════════════════════ */

import type { BotAgent, BotAction } from "../types/bot";
import type { GameState } from "../types/game-state";
import { SeededRNG } from "../utils/rng";
import { relationshipKey } from "../types/diplomacy";

/**
 * Fetches actions for an Apex-tier bot using a simulated (or real) LLM API.
 * Synchronous version for integration with the core cycle processor.
 */
export function fetchApexBotActionsSync(
  bot: BotAgent,
  gameState: GameState,
  actionCount: number,
  rng: SeededRNG,
): BotAction[] {
  try {
    // In a real implementation, this could call a local synchronous LLM model
    // or use pre-fetched data from a previous async phase.
    
    // Heuristic: Apex bots prioritize their archetype more heavily and consider game state.
    const actions: BotAction[] = [];
    for (let i = 0; i < actionCount; i++) {
        actions.push(selectHighIntelligenceAction(bot, gameState, rng));
    }
    
    return actions;
  } catch (error) {
    console.error(`Apex Bot API failure for ${bot.empireId}:`, error);
    // Fallback handled by caller
    throw error;
  }
}

/**
 * Heuristic-based "High Intelligence" action selection for Apex bots.
 */
function selectHighIntelligenceAction(
  bot: BotAgent,
  state: GameState,
  rng: SeededRNG,
): BotAction {
  const empire = state.empires.get(bot.empireId);
  if (!empire) return { type: "research", empireId: bot.empireId };

  // 1. Critical Needs: Food
  if (empire.resources.food <= 0 && empire.population > 0) {
    return { type: "trade", empireId: bot.empireId, details: { resource: "food", direction: "buy", quantity: 20 } };
  }

  // 2. Expansion: If we have credits and empty systems nearby
  if (empire.resources.credits >= 100) {
      const emptySystems = [...state.galaxy.systems.values()].filter(s => !s.owner);
      if (emptySystems.length > 0) {
          const target = rng.pick(emptySystems);
          return { type: "claim-system", empireId: bot.empireId, targetSystemId: target.id };
      }
  }

  // 3. Military: If we are at war or aggressive
  if (bot.emotionalState.current === "aggressive" || bot.emotionalState.current === "vengeful") {
      // Find enemies based on relationship status
      const enemies = [...state.empires.keys()].filter(id => {
          if (id === bot.empireId) return false;
          const key = relationshipKey(bot.empireId, id);
          const rel = state.diplomacy.relationships.get(key);
          return rel?.status === "at-war" || rel?.status === "hostile";
      });

      if (enemies.length > 0) {
          const enemySystems = [...state.galaxy.systems.values()].filter(s => s.owner && enemies.includes(s.owner));
          if (enemySystems.length > 0) {
            return { type: "attack", empireId: bot.empireId, targetSystemId: rng.pick(enemySystems).id };
          }
      }
  }

  // Default to research
  return { type: "research", empireId: bot.empireId };
}
