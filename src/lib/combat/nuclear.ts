/**
 * Nuclear Warfare System (M11)
 *
 * Implements superweapon mechanics for nuclear strikes.
 * Nuclear weapons are devastating but come with severe consequences:
 * - 40% population damage to target
 * - Massive reputation penalty
 * - Civil status drop for attacker
 * - Global outrage from all empires
 *
 * @see docs/PRD.md Section on Turn 100+ unlocks
 */

import type { Empire } from "@/lib/db/schema";
import {
  NUCLEAR_CONSTANTS,
  NUCLEAR_GLOBAL_CONSEQUENCES,
  NUCLEAR_DETECTION_OUTCOMES,
  type NuclearDetectionOutcome,
  rollForDetection,
  determineDetectionOutcome,
  calculateNuclearCasualties,
  canLaunchNuclear,
  areNuclearWeaponsUnlocked,
} from "@/lib/game/constants/nuclear";

// =============================================================================
// TYPES
// =============================================================================

export interface NuclearStrikeResult {
  /** Whether the strike was executed (even if intercepted) */
  success: boolean;

  /** Whether the strike was detected before launch */
  detected: boolean;

  /** Detection outcome (if detected) */
  detectionOutcome: NuclearDetectionOutcome | null;

  /** Number of population killed */
  populationKilled: number;

  /** Civil status levels the attacker drops */
  civilStatusDrop: number;

  /** Reputation loss for the attacker */
  reputationLoss: number;

  /** Whether global outrage is triggered */
  globalOutrage: boolean;

  /** Description of what happened */
  description: string;
}

export interface NuclearStrikeValidation {
  allowed: boolean;
  reason?: string;
}

export interface NuclearLaunchContext {
  /** Attacker empire */
  attacker: Pick<Empire, "id" | "credits" | "civilStatus">;

  /** Target empire */
  target: Pick<Empire, "id" | "population">;

  /** Current game turn */
  currentTurn: number;

  /** Turn when attacker last launched (null if never) */
  lastNukeLaunchTurn: number | null;

  /** Whether attacker has a nuclear weapon */
  hasNuclearWeapon: boolean;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if an empire can launch a nuclear strike.
 */
export function canLaunchNuclearStrike(
  context: NuclearLaunchContext
): NuclearStrikeValidation {
  const { attacker, target, currentTurn, lastNukeLaunchTurn, hasNuclearWeapon } = context;

  // Check if nuclear weapons are unlocked
  if (!areNuclearWeaponsUnlocked(currentTurn)) {
    return {
      allowed: false,
      reason: `Nuclear weapons unlock at turn ${NUCLEAR_CONSTANTS.UNLOCK_TURN}. Current turn: ${currentTurn}`,
    };
  }

  // Check if attacker has a nuclear weapon
  if (!hasNuclearWeapon) {
    return {
      allowed: false,
      reason: "No nuclear weapon available. Purchase one from the Syndicate Black Market.",
    };
  }

  // Check cooldown
  const cooldownCheck = canLaunchNuclear(currentTurn, lastNukeLaunchTurn);
  if (!cooldownCheck.allowed) {
    return {
      allowed: false,
      reason: `Nuclear launch on cooldown. ${cooldownCheck.turnsRemaining} turns remaining.`,
    };
  }

  // Cannot target yourself
  if (attacker.id === target.id) {
    return {
      allowed: false,
      reason: "Cannot target your own empire.",
    };
  }

  // Target must have population
  if (target.population <= NUCLEAR_CONSTANTS.MIN_SURVIVING_POPULATION) {
    return {
      allowed: false,
      reason: "Target population too low for nuclear strike.",
    };
  }

  return { allowed: true };
}

// =============================================================================
// COMBAT EXECUTION
// =============================================================================

/**
 * Execute a nuclear strike against a target empire.
 *
 * @param attacker - The attacking empire
 * @param target - The target empire
 * @param detectionRandom - Optional random value for detection roll (0-1)
 * @param outcomeRandom - Optional random value for outcome determination (0-1)
 */
export function executeNuclearStrike(
  attacker: Pick<Empire, "id">,
  target: Pick<Empire, "id" | "population">,
  detectionRandom?: number,
  outcomeRandom?: number
): NuclearStrikeResult {
  // Roll for detection
  const detected = rollForDetection(detectionRandom);

  let detectionOutcome: NuclearDetectionOutcome | null = null;
  let populationKilled = 0;
  let description = "";

  if (detected) {
    // Determine what happens when detected
    detectionOutcome = determineDetectionOutcome(outcomeRandom);

    switch (detectionOutcome) {
      case NUCLEAR_DETECTION_OUTCOMES.INTERCEPTED:
        populationKilled = 0;
        description = "Nuclear strike was detected and intercepted! The weapon was destroyed before impact.";
        break;

      case NUCLEAR_DETECTION_OUTCOMES.EVACUATION:
        populationKilled = calculateNuclearCasualties(target.population, detectionOutcome);
        description = `Nuclear strike detected! Emergency evacuation reduced casualties. ${populationKilled.toLocaleString()} killed.`;
        break;

      case NUCLEAR_DETECTION_OUTCOMES.PROCEED_WITH_WARNING:
        populationKilled = calculateNuclearCasualties(target.population, detectionOutcome);
        description = `Nuclear strike detected but could not be stopped. ${populationKilled.toLocaleString()} killed despite emergency preparations.`;
        break;
    }
  } else {
    // Undetected - full damage
    populationKilled = calculateNuclearCasualties(target.population, null);
    description = `NUCLEAR DEVASTATION! An undetected nuclear strike killed ${populationKilled.toLocaleString()} population.`;
  }

  // Calculate consequences (always apply, even if intercepted)
  const civilStatusDrop = NUCLEAR_CONSTANTS.CIVIL_STATUS_PENALTY;
  const reputationLoss = NUCLEAR_CONSTANTS.REPUTATION_PENALTY;
  const globalOutrage = populationKilled > 0; // Only if actual damage occurred

  return {
    success: true, // Strike was executed (result varies)
    detected,
    detectionOutcome,
    populationKilled,
    civilStatusDrop,
    reputationLoss,
    globalOutrage,
    description,
  };
}

// =============================================================================
// CONSEQUENCE CALCULATION
// =============================================================================

/**
 * Calculate global reputation penalties for all empires.
 * Called when a nuclear strike causes damage.
 */
export function calculateGlobalReputationPenalties(
  attackerCoalitionMemberIds: string[],
  allEmpireIds: string[],
  targetAllyIds: string[]
): Map<string, number> {
  const penalties = new Map<string, number>();

  for (const empireId of allEmpireIds) {
    // Coalition members don't penalize
    if (attackerCoalitionMemberIds.includes(empireId)) {
      continue;
    }

    // Target's allies get extra penalty
    if (targetAllyIds.includes(empireId)) {
      penalties.set(
        empireId,
        NUCLEAR_GLOBAL_CONSEQUENCES.GLOBAL_REPUTATION_PENALTY +
          NUCLEAR_GLOBAL_CONSEQUENCES.ALLY_BONUS_PENALTY
      );
    } else {
      penalties.set(empireId, NUCLEAR_GLOBAL_CONSEQUENCES.GLOBAL_REPUTATION_PENALTY);
    }
  }

  return penalties;
}

/**
 * Get the civil status after nuclear strike penalty.
 */
export function getPostStrikeCivilStatus(
  currentStatus: string
): string {
  const statusOrder = [
    "ecstatic",
    "happy",
    "content",
    "neutral",
    "unhappy",
    "angry",
    "rioting",
    "revolting",
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1) {
    return "unhappy"; // Default if unknown
  }

  // Drop by penalty amount (negative number, so subtract)
  const newIndex = Math.min(
    statusOrder.length - 1,
    currentIndex - NUCLEAR_CONSTANTS.CIVIL_STATUS_PENALTY
  );

  return statusOrder[newIndex] ?? "revolting";
}

// =============================================================================
// NARRATIVE GENERATION
// =============================================================================

/**
 * Generate a galactic news headline for a nuclear strike.
 */
export function generateNuclearNewsHeadline(
  attackerName: string,
  targetName: string,
  populationKilled: number,
  detected: boolean,
  intercepted: boolean
): string {
  if (intercepted) {
    return `BREAKING: ${targetName} intercepts nuclear missile from ${attackerName}! Galaxy watches in horror.`;
  }

  if (detected && populationKilled > 0) {
    return `NUCLEAR ALERT: ${attackerName} launches nuclear strike on ${targetName}. Despite early warning, ${populationKilled.toLocaleString()} dead.`;
  }

  if (populationKilled > 1_000_000) {
    return `CATASTROPHE: ${attackerName} unleashes nuclear holocaust on ${targetName}. ${populationKilled.toLocaleString()} perish in blinding flash.`;
  }

  return `NUCLEAR STRIKE: ${attackerName} deploys weapon of mass destruction against ${targetName}. ${populationKilled.toLocaleString()} casualties reported.`;
}

/**
 * Generate a broadcast message for all empires.
 */
export function generateGlobalBroadcast(
  attackerName: string,
  targetName: string
): string {
  const messages = [
    `The galaxy trembles as ${attackerName} crosses the nuclear threshold against ${targetName}. No empire is safe.`,
    `A dark day for the galaxy: ${attackerName} has used nuclear weapons against ${targetName}. All empires must respond.`,
    `${attackerName} has violated the unspoken pact. Nuclear fire rains upon ${targetName}. The age of restraint is over.`,
  ];

  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0]!;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export {
  NUCLEAR_CONSTANTS,
  NUCLEAR_GLOBAL_CONSEQUENCES,
  NUCLEAR_DETECTION_OUTCOMES,
  type NuclearDetectionOutcome,
  areNuclearWeaponsUnlocked,
  getNuclearWeaponCost,
} from "@/lib/game/constants/nuclear";
