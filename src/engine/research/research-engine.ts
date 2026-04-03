import type { Empire } from "../types/empire";
import type { Archetype } from "../types/bot";
import { SeededRNG } from "../utils/rng";

export const MAX_RESEARCH_TIER = 8;

/** Minimum tier required to select a doctrine */
export const DOCTRINE_TIER = 1;

/** Minimum tier required to select a specialization */
export const SPECIALIZATION_TIER = 3;

/* ── Doctrine Bonuses ── */

export interface DoctrineBonus {
  combatStrBonus?: number;
  defenceAcBonus?: number;
  sellPriceBonus?: number;
  incomeModifier?: number;
  attackModifier?: number;
}

const DOCTRINE_BONUSES: Record<string, DoctrineBonus> = {
  "war-machine": { combatStrBonus: 2, incomeModifier: -0.10 },
  "fortress": { defenceAcBonus: 4, attackModifier: -0.05 },
  "commerce": { sellPriceBonus: 0.20 },
};

/* ── Specialization Bonuses ── */

export interface SpecializationBonus {
  surpriseRound?: boolean;
  stationaryDamageBonus?: number;
  negateSurprise?: boolean;
  acBonus?: number;
  preCombatDamagePercent?: number;
  buyPriceBonus?: number;
  sellPriceBonus?: number;
  mercenaryStrBonus?: number;
  mercenaryCost?: number;
}

const SPECIALIZATION_BONUSES: Record<string, SpecializationBonus> = {
  "shock-troops": { surpriseRound: true },
  "siege-engines": { stationaryDamageBonus: 0.50 },
  "shield-arrays": { negateSurprise: true, acBonus: 2 },
  "minefield-networks": { preCombatDamagePercent: 0.10 },
  "trade-monopoly": { buyPriceBonus: -0.20, sellPriceBonus: 0.30 },
  "mercenary-contracts": { mercenaryStrBonus: 2, mercenaryCost: 10000 },
};

/* ── Counter-Play Matrix ── */

// Rock-paper-scissors: attacker spec → defender spec it counters
const COUNTER_MAP: Record<string, string> = {
  "shock-troops": "minefield-networks",
  "minefield-networks": "siege-engines",
  "siege-engines": "shield-arrays",
  "shield-arrays": "shock-troops",
};

const COUNTER_BONUS = 1.25;

/* ── Research Paths ── */

export interface ResearchPath {
  id: string;
  name: string;
  /** Capstone ability unlocked at tier 8 */
  capstone: string;
  /** Two specialization IDs available at tier 3 */
  specializations?: [string, string];
}

export const RESEARCH_PATHS: ResearchPath[] = [
  {
    id: "war-machine",
    name: "War Machine",
    capstone: "Total Mobilisation",
    specializations: ["shock-troops", "siege-engines"],
  },
  {
    id: "fortress",
    name: "Fortress",
    capstone: "Impregnable Bastion",
    specializations: ["shield-arrays", "minefield-networks"],
  },
  {
    id: "commerce",
    name: "Commerce",
    capstone: "Trade Hegemony",
    specializations: ["trade-monopoly", "mercenary-contracts"],
  },
];

/* ── Core Functions ── */

/** Research cost per tier (research points required) */
export function researchCost(currentTier: number): number {
  return (currentTier + 1) * 50;
}

/**
 * Attempt to advance research tier. Returns updated tier or null if insufficient points.
 */
export function advanceResearch(
  currentTier: number,
  availableResearchPoints: number,
): { newTier: number; pointsConsumed: number } | null {
  if (currentTier >= MAX_RESEARCH_TIER) return null;
  const cost = researchCost(currentTier);
  if (availableResearchPoints < cost) return null;
  return { newTier: currentTier + 1, pointsConsumed: cost };
}

/**
 * Check if an empire has completed a full research path to capstone.
 */
export function hasCapstone(tier: number): boolean {
  return tier >= MAX_RESEARCH_TIER;
}

/* ── Doctrine Selection ── */

/**
 * Select a doctrine for an empire. Once chosen, cannot be changed.
 * Returns true if selection succeeded.
 */
export function selectDoctrine(empire: Empire, pathId: string): boolean {
  if (empire.researchPath) return false;
  const valid = RESEARCH_PATHS.find((p) => p.id === pathId);
  if (!valid) return false;
  empire.researchPath = pathId;
  return true;
}

/**
 * Check if an empire can select a specialization at its current tier.
 */
export function canSelectSpecialization(tier: number): boolean {
  return tier >= SPECIALIZATION_TIER;
}

/**
 * Select a specialization within the empire's chosen doctrine.
 * Requires tier >= SPECIALIZATION_TIER and a valid doctrine.
 */
export function selectSpecialization(empire: Empire, specId: string): boolean {
  if (!empire.researchPath) return false;
  if (empire.specialization) return false;

  const path = RESEARCH_PATHS.find((p) => p.id === empire.researchPath);
  if (!path || !path.specializations) return false;
  if (!path.specializations.includes(specId)) return false;

  empire.specialization = specId;
  return true;
}

/* ── Bonus Lookups ── */

/**
 * Get the combat/economic bonuses for a given doctrine path.
 */
export function getDoctrineBonus(pathId: string): DoctrineBonus {
  return DOCTRINE_BONUSES[pathId] ?? {};
}

/**
 * Get the specialization-specific bonus.
 */
export function getSpecializationBonus(specId: string): SpecializationBonus {
  return SPECIALIZATION_BONUSES[specId] ?? {};
}

/**
 * Calculate the counter-play multiplier between two specializations.
 * Returns > 1 if attacker counters defender, 1.0 otherwise.
 */
export function getCounterBonus(attackerSpec: string, defenderSpec: string): number {
  if (attackerSpec === defenderSpec) return 1.0;
  if (COUNTER_MAP[attackerSpec] === defenderSpec) return COUNTER_BONUS;
  return 1.0;
}

/* ── Capstone Effects ── */

export interface CapstoneEffect {
  capstoneName: string;
  /** Unit type unlocked by this capstone (if any) */
  unlockedUnitType?: string;
  /** Defence multiplier (e.g. 1.25 for +25%) */
  defenceMultiplier?: number;
  /** Income multiplier (e.g. 1.30 for +30%) */
  incomeMultiplier?: number;
}

export const CAPSTONE_EFFECTS: Record<string, CapstoneEffect> = {
  "war-machine": {
    capstoneName: "Total Mobilisation",
    unlockedUnitType: "dreadnought",
  },
  "fortress": {
    capstoneName: "Impregnable Bastion",
    defenceMultiplier: 1.25,
  },
  "commerce": {
    capstoneName: "Trade Hegemony",
    incomeMultiplier: 1.30,
  },
};

/**
 * Get the capstone effect for a given research path.
 * Returns null if the path doesn't exist.
 */
export function getCapstoneEffect(pathId: string): CapstoneEffect | null {
  return CAPSTONE_EFFECTS[pathId] ?? null;
}

/* ── Research Draft Events ── */

/** Archetype → preferred doctrine paths (index 0 = most preferred = 3x weight) */
export const ARCHETYPE_DOCTRINE_PREFERENCES: Record<Archetype, [string, string, string]> = {
  warlord:     ["war-machine", "fortress",    "commerce"],
  blitzkrieg:  ["war-machine", "fortress",    "commerce"],
  schemer:     ["war-machine", "fortress",    "commerce"],
  turtle:      ["fortress",    "war-machine", "commerce"],
  "tech-rush": ["fortress",    "commerce",    "war-machine"],
  diplomat:    ["fortress",    "commerce",    "war-machine"],
  merchant:    ["commerce",    "fortress",    "war-machine"],
  opportunist: ["commerce",    "war-machine", "fortress"],
};

/**
 * Detect whether a tier transition should trigger a doctrine or specialization draft.
 * Returns "doctrine" | "specialization" | null.
 */
export function checkResearchDraftTrigger(
  empire: Empire,
  previousTier: number,
  newTier: number,
): "doctrine" | "specialization" | "capstone" | null {
  if (previousTier < DOCTRINE_TIER && newTier >= DOCTRINE_TIER && !empire.researchPath) {
    return "doctrine";
  }
  if (previousTier < SPECIALIZATION_TIER && newTier >= SPECIALIZATION_TIER
      && empire.researchPath && !empire.specialization) {
    return "specialization";
  }
  if (previousTier < MAX_RESEARCH_TIER && newTier >= MAX_RESEARCH_TIER && empire.researchPath) {
    return "capstone";
  }
  return null;
}

/**
 * Auto-select a doctrine for a bot based on archetype preference.
 * Weights: 1st choice 3x, 2nd choice 2x, 3rd choice 1x.
 */
export function autoselectDoctrine(archetype: Archetype, rng: SeededRNG): string {
  const prefs = ARCHETYPE_DOCTRINE_PREFERENCES[archetype];
  const weighted = [prefs[0], prefs[0], prefs[0], prefs[1], prefs[1], prefs[2]];
  return weighted[Math.floor(rng.next() * weighted.length)];
}

/**
 * Auto-select a specialization for a bot within the given research path.
 * Returns null if path not found or has no specializations.
 */
export function autoselectSpecialization(
  _archetype: Archetype,
  researchPath: string,
  rng: SeededRNG,
): string | null {
  const path = RESEARCH_PATHS.find(p => p.id === researchPath);
  if (!path?.specializations) return null;
  const idx = Math.floor(rng.next() * path.specializations.length);
  return path.specializations[idx];
}
