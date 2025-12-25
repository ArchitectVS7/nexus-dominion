/**
 * Diplomacy Constants (M7)
 *
 * Defines treaty types, reputation values, and diplomacy mechanics.
 *
 * @see docs/PRD.md Section 8 - Diplomacy System
 * @see docs/milestones.md M7 - Market & Diplomacy
 */

// =============================================================================
// TREATY TYPES
// =============================================================================

export type TreatyType = "nap" | "alliance";

export interface TreatyDefinition {
  id: TreatyType;
  name: string;
  description: string;
  /** Benefits of having this treaty */
  benefits: string[];
  /** Whether this treaty can be upgraded (NAP → Alliance) */
  canUpgrade: boolean;
}

export const TREATY_DEFINITIONS: Record<TreatyType, TreatyDefinition> = {
  nap: {
    id: "nap",
    name: "Non-Aggression Pact",
    description: "An agreement to refrain from attacking each other",
    benefits: [
      "Cannot be attacked by treaty partner",
      "Reduces reputation penalty for peaceful behavior",
    ],
    canUpgrade: true,
  },
  alliance: {
    id: "alliance",
    name: "Alliance",
    description: "A formal alliance with shared interests",
    benefits: [
      "All NAP benefits",
      "Shared intelligence on mutual enemies",
      "Can request military support",
      "+10% income bonus (PRD 7.6 - Diplomat passive)",
    ],
    canUpgrade: false,
  },
};

// =============================================================================
// REPUTATION SYSTEM
// =============================================================================

/**
 * Starting reputation score (neutral).
 */
export const STARTING_REPUTATION = 50;

/**
 * Minimum reputation score.
 */
export const MIN_REPUTATION = 0;

/**
 * Maximum reputation score.
 */
export const MAX_REPUTATION = 100;

/**
 * Reputation changes for various events.
 */
export const REPUTATION_CHANGES = {
  /** Breaking a NAP treaty */
  napBroken: -30,
  /** Breaking an Alliance */
  allianceBroken: -50,
  /** Forming a NAP */
  napFormed: 5,
  /** Forming an Alliance */
  allianceFormed: 10,
  /** Honoring treaty for 10 turns */
  treatyHonored: 3,
  /** Peacefully ending a NAP */
  napEndedPeacefully: 0,
  /** Peacefully ending an Alliance */
  allianceEndedPeacefully: -5,
} as const;

/**
 * Reputation thresholds for bot behavior.
 */
export const REPUTATION_THRESHOLDS = {
  /** Very trustworthy - bots more likely to accept treaties */
  trustworthy: 70,
  /** Neutral - normal behavior */
  neutral: 50,
  /** Suspicious - bots less likely to accept treaties */
  suspicious: 30,
  /** Treacherous - bots will refuse treaties and be hostile */
  treacherous: 15,
} as const;

/**
 * Get reputation level label based on score.
 */
export function getReputationLevel(reputation: number): string {
  if (reputation >= REPUTATION_THRESHOLDS.trustworthy) return "Trustworthy";
  if (reputation >= REPUTATION_THRESHOLDS.neutral) return "Neutral";
  if (reputation >= REPUTATION_THRESHOLDS.suspicious) return "Suspicious";
  return "Treacherous";
}

// =============================================================================
// BOT TREATY ACCEPTANCE
// =============================================================================

/**
 * Base acceptance rates for treaties (adjusted by reputation).
 */
export const BASE_ACCEPTANCE_RATES = {
  nap: 0.6, // 60% base chance for NAP
  alliance: 0.4, // 40% base chance for Alliance
} as const;

/**
 * Calculate bot's acceptance chance for a treaty proposal.
 *
 * @param treatyType - Type of treaty being proposed
 * @param proposerReputation - Proposer's reputation score
 * @param relationshipScore - Relationship score with this bot (future M10)
 * @returns Probability of acceptance (0-1)
 */
export function calculateAcceptanceChance(
  treatyType: TreatyType,
  proposerReputation: number,
  relationshipScore: number = 50 // Default neutral relationship
): number {
  const baseChance = BASE_ACCEPTANCE_RATES[treatyType];

  // Reputation modifier (-30% to +30%)
  const reputationMod = (proposerReputation - 50) / 100 * 0.6;

  // Relationship modifier (-20% to +20%) - for future M10
  const relationshipMod = (relationshipScore - 50) / 100 * 0.4;

  // Calculate final chance
  const chance = baseChance + reputationMod + relationshipMod;

  // Clamp to reasonable bounds
  return Math.max(0.1, Math.min(0.9, chance));
}

// =============================================================================
// TREATY DURATION
// =============================================================================

/**
 * Minimum turns before a treaty can be peacefully ended.
 */
export const MIN_TREATY_DURATION = 10;
