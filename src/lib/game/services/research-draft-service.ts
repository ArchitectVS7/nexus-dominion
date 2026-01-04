/**
 * Research Draft Service
 *
 * Implements the 3-tier research draft system:
 * - Tier 1 (Turn ~10, 1000 RP): Draft 1 of 3 Doctrines
 * - Tier 2 (Turn ~30, 5000 RP): Draft 1 of 2 Specializations
 * - Tier 3 (Turn ~60, 15000 RP): Automatic Capstone
 *
 * Based on: docs/redesign-01-02-2026/RESEARCH-REDESIGN.md
 */

import type { Empire } from "@/lib/db/schema";

// ============================================
// TYPES
// ============================================

export type ResearchDoctrine = "war_machine" | "fortress" | "commerce";

export type ResearchSpecialization =
  | "shock_troops"
  | "siege_engines"
  | "shield_arrays"
  | "minefield_networks"
  | "trade_routes"
  | "economic_sanctions";

export type ResearchTier = 0 | 1 | 2 | 3;

export interface ResearchProgress {
  currentTier: ResearchTier;
  researchPoints: number;
  doctrine: ResearchDoctrine | null;
  specialization: ResearchSpecialization | null;
  canDraft: boolean; // True if RP threshold reached but no choice made
  nextThreshold: number | null;
}

export interface DoctrineDraft {
  options: ResearchDoctrine[];
  thresholdRequired: number;
}

export interface SpecializationDraft {
  options: ResearchSpecialization[];
  thresholdRequired: number;
  requiresDoctrine: ResearchDoctrine;
}

export interface ResearchBonuses {
  attackMultiplier: number; // e.g., 1.15 for War Machine
  defenseMultiplier: number; // e.g., 1.25 for Fortress
  incomeMultiplier: number; // e.g., 0.90 for War Machine penalty
  marketSellBonus: number; // e.g., 1.20 for Commerce
  planetCostMultiplier: number; // e.g., 1.10 for Commerce penalty
}

// ============================================
// CONSTANTS
// ============================================

export const RESEARCH_TIER_THRESHOLDS = {
  TIER_1: 1000, // ~10 turns with 1 research planet
  TIER_2: 5000, // ~30 turns with 2 research planets
  TIER_3: 15000, // ~60 turns with 3 research planets
} as const;

export const DOCTRINES: Record<
  ResearchDoctrine,
  {
    name: string;
    description: string;
    bonuses: Partial<ResearchBonuses>;
    unlocks: string[];
  }
> = {
  war_machine: {
    name: "War Machine",
    description: "Military superiority through aggressive expansion",
    bonuses: {
      attackMultiplier: 1.15,
      incomeMultiplier: 0.90,
    },
    unlocks: ["Heavy Cruisers"],
  },
  fortress: {
    name: "Fortress",
    description: "Impenetrable defense through fortification",
    bonuses: {
      defenseMultiplier: 1.25,
      attackMultiplier: 0.95,
    },
    unlocks: ["Defense Platforms"],
  },
  commerce: {
    name: "Commerce",
    description: "Economic dominance through trade",
    bonuses: {
      marketSellBonus: 1.20,
      planetCostMultiplier: 1.10,
    },
    unlocks: ["Trade Fleets"],
  },
};

export const SPECIALIZATIONS: Record<
  ResearchSpecialization,
  {
    name: string;
    description: string;
    doctrine: ResearchDoctrine;
    bonuses: Partial<ResearchBonuses>;
    effect: string;
  }
> = {
  shock_troops: {
    name: "Shock Troops",
    description: "First strike - Deal 20% damage before defender rolls",
    doctrine: "war_machine",
    bonuses: {},
    effect: "first_strike",
  },
  siege_engines: {
    name: "Siege Engines",
    description: "+50% damage to Defense Platforms/Stations",
    doctrine: "war_machine",
    bonuses: {},
    effect: "siege_bonus",
  },
  shield_arrays: {
    name: "Shield Arrays",
    description: "Negate first-strike damage",
    doctrine: "fortress",
    bonuses: {},
    effect: "negate_first_strike",
  },
  minefield_networks: {
    name: "Minefield Networks",
    description: "Attackers lose 10% forces before combat",
    doctrine: "fortress",
    bonuses: {},
    effect: "minefield",
  },
  trade_routes: {
    name: "Trade Monopoly",
    description: "Buy at -20%, sell at +30%",
    doctrine: "commerce",
    bonuses: {
      marketSellBonus: 1.30,
    },
    effect: "trade_bonus",
  },
  economic_sanctions: {
    name: "Mercenary Contracts",
    description: "Hire temporary combat bonuses with credits",
    doctrine: "commerce",
    bonuses: {},
    effect: "mercenaries",
  },
};

// ============================================
// RESEARCH PROGRESS CHECKS
// ============================================

export function getResearchProgress(empire: Empire): ResearchProgress {
  const currentTier = empire.researchTier as ResearchTier;
  const researchPoints = Number(empire.researchPoints);
  const doctrine = empire.researchDoctrine;
  const specialization = empire.researchSpecialization;

  // Determine if empire can draft
  let canDraft = false;
  let nextThreshold: number | null = null;

  if (currentTier === 0 && researchPoints >= RESEARCH_TIER_THRESHOLDS.TIER_1) {
    canDraft = true;
    nextThreshold = RESEARCH_TIER_THRESHOLDS.TIER_1;
  } else if (
    currentTier === 1 &&
    doctrine &&
    researchPoints >= RESEARCH_TIER_THRESHOLDS.TIER_2
  ) {
    canDraft = true;
    nextThreshold = RESEARCH_TIER_THRESHOLDS.TIER_2;
  } else if (
    currentTier === 2 &&
    specialization &&
    researchPoints >= RESEARCH_TIER_THRESHOLDS.TIER_3
  ) {
    // Tier 3 is automatic, will be granted by turn processor
    canDraft = false;
    nextThreshold = RESEARCH_TIER_THRESHOLDS.TIER_3;
  } else {
    // Determine next threshold
    if (currentTier === 0) {
      nextThreshold = RESEARCH_TIER_THRESHOLDS.TIER_1;
    } else if (currentTier === 1) {
      nextThreshold = RESEARCH_TIER_THRESHOLDS.TIER_2;
    } else if (currentTier === 2) {
      nextThreshold = RESEARCH_TIER_THRESHOLDS.TIER_3;
    }
  }

  return {
    currentTier,
    researchPoints,
    doctrine,
    specialization,
    canDraft,
    nextThreshold,
  };
}

export function getDoctrineDraft(empire: Empire): DoctrineDraft | null {
  const progress = getResearchProgress(empire);

  if (progress.currentTier !== 0 || !progress.canDraft) {
    return null;
  }

  return {
    options: ["war_machine", "fortress", "commerce"],
    thresholdRequired: RESEARCH_TIER_THRESHOLDS.TIER_1,
  };
}

export function getSpecializationDraft(
  empire: Empire
): SpecializationDraft | null {
  const progress = getResearchProgress(empire);

  if (
    progress.currentTier !== 1 ||
    !progress.doctrine ||
    !progress.canDraft
  ) {
    return null;
  }

  // Get specializations for the empire's doctrine
  const options = Object.entries(SPECIALIZATIONS)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_key, spec]) => spec.doctrine === progress.doctrine)
    .map(([key]) => key as ResearchSpecialization);

  return {
    options,
    thresholdRequired: RESEARCH_TIER_THRESHOLDS.TIER_2,
    requiresDoctrine: progress.doctrine,
  };
}

// ============================================
// DRAFT SELECTION
// ============================================

export interface DraftDoctrineResult {
  success: boolean;
  doctrine?: ResearchDoctrine;
  newTier?: ResearchTier;
  error?: string;
}

export function selectDoctrine(
  empire: Empire,
  doctrineChoice: ResearchDoctrine
): DraftDoctrineResult {
  const draft = getDoctrineDraft(empire);

  if (!draft) {
    return {
      success: false,
      error: "Not eligible for doctrine draft",
    };
  }

  if (!draft.options.includes(doctrineChoice)) {
    return {
      success: false,
      error: `Invalid doctrine choice: ${doctrineChoice}`,
    };
  }

  return {
    success: true,
    doctrine: doctrineChoice,
    newTier: 1,
  };
}

export interface DraftSpecializationResult {
  success: boolean;
  specialization?: ResearchSpecialization;
  newTier?: ResearchTier;
  error?: string;
}

export function selectSpecialization(
  empire: Empire,
  specializationChoice: ResearchSpecialization
): DraftSpecializationResult {
  const draft = getSpecializationDraft(empire);

  if (!draft) {
    return {
      success: false,
      error: "Not eligible for specialization draft",
    };
  }

  if (!draft.options.includes(specializationChoice)) {
    return {
      success: false,
      error: `Invalid specialization choice: ${specializationChoice}`,
    };
  }

  return {
    success: true,
    specialization: specializationChoice,
    newTier: 2,
  };
}

// ============================================
// BONUS CALCULATION
// ============================================

const DEFAULT_BONUSES: ResearchBonuses = {
  attackMultiplier: 1.0,
  defenseMultiplier: 1.0,
  incomeMultiplier: 1.0,
  marketSellBonus: 1.0,
  planetCostMultiplier: 1.0,
};

export function getResearchBonuses(empire: Empire): ResearchBonuses {
  const bonuses = { ...DEFAULT_BONUSES };

  // Apply doctrine bonuses
  if (empire.researchDoctrine) {
    const doctrine = DOCTRINES[empire.researchDoctrine as ResearchDoctrine];
    Object.assign(bonuses, doctrine.bonuses);
  }

  // Apply specialization bonuses
  if (empire.researchSpecialization) {
    const spec = SPECIALIZATIONS[empire.researchSpecialization as ResearchSpecialization];
    Object.assign(bonuses, spec.bonuses);
  }

  return bonuses;
}

// ============================================
// ANNOUNCEMENT MESSAGES
// ============================================

export function getResearchAnnouncement(
  empire: Empire,
  tier: ResearchTier
): string | null {
  if (tier === 1 && empire.researchDoctrine) {
    const doctrine = DOCTRINES[empire.researchDoctrine as ResearchDoctrine];
    return `[GALACTIC INTEL] ${empire.name} has adopted the ${doctrine.name.toUpperCase()} doctrine.`;
  }

  if (tier === 2 && empire.researchSpecialization) {
    const spec = SPECIALIZATIONS[empire.researchSpecialization as ResearchSpecialization];
    return `[GALACTIC INTEL] ${empire.name} has specialized in ${spec.name.toUpperCase()}.`;
  }

  if (tier === 3 && empire.researchDoctrine) {
    const capstones: Record<ResearchDoctrine, string> = {
      war_machine: "DREADNOUGHT technology",
      fortress: "CITADEL WORLD fortification",
      commerce: "ECONOMIC HEGEMONY",
    };
    return `[GALACTIC ALERT] ${empire.name} has achieved ${capstones[empire.researchDoctrine as ResearchDoctrine]}!`;
  }

  return null;
}

// ============================================
// AUTO-PROGRESSION (for turn processor)
// ============================================

export interface AutoProgressionResult {
  tierIncreased: boolean;
  newTier: ResearchTier;
  announcement: string | null;
}

/**
 * Called by turn processor to automatically grant Tier 3 capstone
 * when threshold is reached.
 */
export function checkAutoProgression(
  empire: Empire
): AutoProgressionResult {
  const progress = getResearchProgress(empire);

  // Only Tier 2 → Tier 3 is automatic
  if (
    progress.currentTier === 2 &&
    progress.specialization &&
    progress.researchPoints >= RESEARCH_TIER_THRESHOLDS.TIER_3
  ) {
    return {
      tierIncreased: true,
      newTier: 3,
      announcement: getResearchAnnouncement(empire, 3),
    };
  }

  return {
    tierIncreased: false,
    newTier: progress.currentTier,
    announcement: null,
  };
}
