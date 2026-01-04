/**
 * Bot Research Preferences (Phase 2.1)
 *
 * Defines which archetypes prefer which doctrines and specializations
 * Based on: docs/redesign-01-02-2026/RESEARCH-REDESIGN.md
 */

import type { BotArchetype } from "./types";
import type { CombatStance } from "@/lib/combat/stances";

// Inline types (normally from research-draft-service.ts which is not yet complete)
export type ResearchDoctrine = "war_machine" | "fortress" | "commerce" | "shadow_network" | "tech_dominion";
export type ResearchSpecialization = "shock_troops" | "siege_engines" | "shield_arrays" | "minefield_networks" | "trade_routes" | "economic_sanctions" | "espionage" | "sabotage" | "ai_cores" | "nano_swarms";

// ============================================
// ARCHETYPE RESEARCH PREFERENCES
// ============================================

export interface ArchetypeResearchPreference {
  /** Preferred doctrine (70-80% probability) */
  preferredDoctrine: ResearchDoctrine;
  /** Secondary doctrine (15-25% probability) */
  secondaryDoctrine?: ResearchDoctrine;
  /** Preferred specialization for their doctrine */
  preferredSpecialization: ResearchSpecialization;
  /** Secondary specialization (fallback) */
  secondarySpecialization?: ResearchSpecialization;
}

/**
 * Research preferences per archetype
 */
export const ARCHETYPE_RESEARCH_PREFERENCES: Record<
  Exclude<BotArchetype, null>,
  ArchetypeResearchPreference
> = {
  warlord: {
    preferredDoctrine: "war_machine",
    secondaryDoctrine: "fortress",
    preferredSpecialization: "shock_troops",
    secondarySpecialization: "siege_engines",
  },
  blitzkrieg: {
    preferredDoctrine: "war_machine",
    secondaryDoctrine: "commerce",
    preferredSpecialization: "shock_troops",
    secondarySpecialization: "siege_engines",
  },
  turtle: {
    preferredDoctrine: "fortress",
    secondaryDoctrine: "war_machine",
    preferredSpecialization: "shield_arrays",
    secondarySpecialization: "minefield_networks",
  },
  diplomat: {
    preferredDoctrine: "fortress",
    secondaryDoctrine: "commerce",
    preferredSpecialization: "minefield_networks",
    secondarySpecialization: "shield_arrays",
  },
  merchant: {
    preferredDoctrine: "commerce",
    secondaryDoctrine: "fortress",
    preferredSpecialization: "trade_routes",
    secondarySpecialization: "economic_sanctions",
  },
  tech_rush: {
    preferredDoctrine: "commerce",
    secondaryDoctrine: "war_machine",
    preferredSpecialization: "trade_routes",
    secondarySpecialization: "economic_sanctions",
  },
  schemer: {
    preferredDoctrine: "commerce",
    secondaryDoctrine: "war_machine",
    preferredSpecialization: "economic_sanctions",
    secondarySpecialization: "trade_routes",
  },
  opportunist: {
    // Opportunists copy neighbors or choose randomly
    preferredDoctrine: "war_machine", // Default if no neighbors
    secondaryDoctrine: "fortress",
    preferredSpecialization: "shock_troops",
    secondarySpecialization: "shield_arrays",
  },
};

// ============================================
// DECISION FUNCTIONS
// ============================================

/**
 * Get bot's preferred doctrine based on archetype
 * 70% chance of primary, 20% secondary, 10% random
 */
export function getBotDoctrineChoice(
  archetype: BotArchetype,
  random: number = Math.random()
): ResearchDoctrine {
  if (!archetype) {
    return "war_machine"; // Default for null archetype
  }

  const prefs = ARCHETYPE_RESEARCH_PREFERENCES[archetype];
  if (!prefs) {
    return "war_machine"; // Fallback if archetype not found
  }

  if (random < 0.7) {
    // 70% - Preferred doctrine
    return prefs.preferredDoctrine;
  } else if (random < 0.9 && prefs.secondaryDoctrine) {
    // 20% - Secondary doctrine
    return prefs.secondaryDoctrine;
  } else {
    // 10% - Random/counter-pick
    const doctrines: ResearchDoctrine[] = ["war_machine", "fortress", "commerce"];
    return doctrines[Math.floor(Math.random() * doctrines.length)] ?? "war_machine";
  }
}

/**
 * Get bot's preferred specialization based on their doctrine
 */
export function getBotSpecializationChoice(
  archetype: BotArchetype,
  doctrine: ResearchDoctrine,
  random: number = Math.random()
): ResearchSpecialization {
  if (!archetype) {
    // Default specializations per doctrine
    switch (doctrine) {
      case "war_machine":
        return "shock_troops";
      case "fortress":
        return "shield_arrays";
      case "commerce":
        return "trade_routes";
    }
  }

  const prefs = ARCHETYPE_RESEARCH_PREFERENCES[archetype];
  if (!prefs) {
    // Fallback if archetype not found
    switch (doctrine) {
      case "war_machine":
        return "shock_troops";
      case "fortress":
        return "shield_arrays";
      case "commerce":
        return "trade_routes";
    }
  }

  // Check if preferred specialization matches the doctrine
  const preferredMatchesDoctrine =
    getDoctrineForSpecialization(prefs.preferredSpecialization) === doctrine;
  const secondaryMatchesDoctrine =
    prefs.secondarySpecialization &&
    getDoctrineForSpecialization(prefs.secondarySpecialization) === doctrine;

  if (preferredMatchesDoctrine && random < 0.7) {
    // 70% - Preferred specialization (if it matches doctrine)
    return prefs.preferredSpecialization;
  } else if (secondaryMatchesDoctrine && prefs.secondarySpecialization && random < 0.9) {
    // 20% - Secondary specialization (if it matches doctrine)
    return prefs.secondarySpecialization;
  } else {
    // 10% or fallback - Random specialization for this doctrine
    const specs = getSpecializationsForDoctrine(doctrine);
    return specs[Math.floor(Math.random() * specs.length)] ?? specs[0] ?? "shock_troops";
  }
}

/**
 * Get which doctrine a specialization belongs to
 */
function getDoctrineForSpecialization(spec: ResearchSpecialization): ResearchDoctrine {
  switch (spec) {
    case "shock_troops":
    case "siege_engines":
      return "war_machine";
    case "shield_arrays":
    case "minefield_networks":
      return "fortress";
    case "trade_routes":
    case "economic_sanctions":
      return "commerce";
    case "espionage":
    case "sabotage":
      return "shadow_network";
    case "ai_cores":
    case "nano_swarms":
      return "tech_dominion";
  }
}

/**
 * Get all specializations for a doctrine
 */
function getSpecializationsForDoctrine(
  doctrine: ResearchDoctrine
): ResearchSpecialization[] {
  switch (doctrine) {
    case "war_machine":
      return ["shock_troops", "siege_engines"];
    case "fortress":
      return ["shield_arrays", "minefield_networks"];
    case "commerce":
      return ["trade_routes", "economic_sanctions"];
    case "shadow_network":
      return ["espionage", "sabotage"];
    case "tech_dominion":
      return ["ai_cores", "nano_swarms"];
  }
}

/**
 * Should bot prioritize research draft this turn?
 * Bots should draft immediately when eligible (high priority)
 */
export function shouldBotDraftResearch(canDraft: boolean): boolean {
  // Always draft when eligible - it's a crucial strategic decision
  return canDraft;
}

// ============================================
// COMBAT STANCE PREFERENCES
// ============================================

export interface ArchetypeCombatPreference {
  /** Preferred stance (70% probability) */
  preferredStance: CombatStance;
  /** Secondary stance (20% probability) */
  secondaryStance: CombatStance;
  /** Threshold for retreat (% of force remaining) */
  retreatThreshold: number;
}

/**
 * Combat stance preferences per archetype
 */
export const ARCHETYPE_COMBAT_PREFERENCES: Record<
  Exclude<BotArchetype, null>,
  ArchetypeCombatPreference
> = {
  warlord: {
    preferredStance: "aggressive",
    secondaryStance: "balanced",
    retreatThreshold: 0.1, // Fight to the bitter end
  },
  blitzkrieg: {
    preferredStance: "aggressive",
    secondaryStance: "balanced",
    retreatThreshold: 0.3, // Will retreat if heavily damaged
  },
  turtle: {
    preferredStance: "defensive",
    secondaryStance: "evasive",
    retreatThreshold: 0.6, // Very cautious, retreats early
  },
  diplomat: {
    preferredStance: "defensive",
    secondaryStance: "balanced",
    retreatThreshold: 0.5, // Prefers to preserve forces
  },
  merchant: {
    preferredStance: "balanced",
    secondaryStance: "evasive",
    retreatThreshold: 0.5, // Balanced approach to risk
  },
  tech_rush: {
    preferredStance: "evasive",
    secondaryStance: "defensive",
    retreatThreshold: 0.4, // Prefers to minimize losses
  },
  schemer: {
    preferredStance: "balanced",
    secondaryStance: "aggressive",
    retreatThreshold: 0.3, // Opportunistic
  },
  opportunist: {
    preferredStance: "balanced",
    secondaryStance: "aggressive",
    retreatThreshold: 0.35, // Adapts to situation
  },
};

/**
 * Get bot's preferred combat stance based on archetype
 * 70% preferred, 20% secondary, 10% balanced fallback
 */
export function getBotCombatStance(
  archetype: BotArchetype | null,
  random: number = Math.random()
): CombatStance {
  if (!archetype) {
    return "balanced"; // Default for null archetype
  }

  const prefs = ARCHETYPE_COMBAT_PREFERENCES[archetype];
  if (!prefs) {
    return "balanced"; // Fallback if archetype not found
  }

  if (random < 0.7) {
    // 70% - Preferred stance
    return prefs.preferredStance;
  } else if (random < 0.9) {
    // 20% - Secondary stance
    return prefs.secondaryStance;
  } else {
    // 10% - Balanced fallback
    return "balanced";
  }
}

/**
 * Get retreat threshold for an archetype
 * Returns the % of forces remaining at which bot should consider retreat
 */
export function getBotRetreatThreshold(archetype: BotArchetype | null): number {
  if (!archetype) {
    return 0.4; // Default 40%
  }

  const prefs = ARCHETYPE_COMBAT_PREFERENCES[archetype];
  return prefs?.retreatThreshold ?? 0.4;
}
