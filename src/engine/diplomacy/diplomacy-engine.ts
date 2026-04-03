import type { EmpireId, PactId, CoalitionId } from "../types/ids";
import type {
  Pact, PactType, Coalition, DiplomacyState,
} from "../types/diplomacy";
import { relationshipKey } from "../types/diplomacy";

export type TreatyType = PactType | "nexus-compact";

/** Treaty benefits as defined in PRD §7 */
export const TREATY_BENEFITS: Record<TreatyType, { tradeDiscount: number; defenceObligation: boolean; intelSharing: boolean }> = {
  "stillness-accord": { tradeDiscount: 0, defenceObligation: false, intelSharing: false },
  "star-covenant": { tradeDiscount: 0.15, defenceObligation: true, intelSharing: true },
  "nexus-compact": { tradeDiscount: 0, defenceObligation: true, intelSharing: false },
};

/** Violation consequences */
export const VIOLATION_PENALTIES: Record<TreatyType, { reputationHit: number; combatBonus: number; recoveryTurns: number }> = {
  "stillness-accord": { reputationHit: -20, combatBonus: 0.25, recoveryTurns: 20 },
  "star-covenant": { reputationHit: -50, combatBonus: 0, recoveryTurns: 30 },
  "nexus-compact": { reputationHit: -40, combatBonus: 0, recoveryTurns: 50 },
};

/**
 * Propose a pact between two empires. Returns the new pact if valid.
 */
export function proposePact(
  type: PactType,
  proposer: EmpireId,
  target: EmpireId,
  currentCycle: number,
  diplomacy: DiplomacyState,
): Pact | null {
  // Cannot pact with yourself
  if (proposer === target) return null;

  // Check if already in a pact of this type
  for (const [, pact] of diplomacy.pacts) {
    if (pact.active && pact.type === type &&
      pact.memberIds.includes(proposer) && pact.memberIds.includes(target)) {
      return null; // already exists
    }
  }

  const pact: Pact = {
    id: `pact-${currentCycle}-${proposer}-${target}` as PactId,
    type,
    memberIds: [proposer, target],
    formedCycle: currentCycle,
    active: true,
  };

  return pact;
}

/**
 * Accept a pact proposal. Registers it in diplomacy state and updates relationships.
 */
export function acceptPact(
  pact: Pact,
  diplomacy: DiplomacyState,
): DiplomacyState {
  const newState = { ...diplomacy };
  const newPacts = new Map(diplomacy.pacts);
  newPacts.set(pact.id, pact);

  // Update relationship
  const key = relationshipKey(pact.memberIds[0], pact.memberIds[1]);
  const newRelationships = new Map(diplomacy.relationships);
  const existing = newRelationships.get(key);
  const newStatus = pact.type === "star-covenant" ? "allied" as const : "non-aggression" as const;
  newRelationships.set(key, {
    status: newStatus,
    reputation: existing?.reputation ?? 0,
    lastChangeCycle: pact.formedCycle,
    violations: existing?.violations ?? 0,
  });

  return { ...newState, pacts: newPacts, relationships: newRelationships };
}

/**
 * Break a pact. Applies violation consequences.
 */
export function breakPact(
  pactId: PactId,
  violator: EmpireId,
  currentCycle: number,
  diplomacy: DiplomacyState,
): { diplomacy: DiplomacyState; reputationPenalty: number; combatBonus: number } {
  const pact = diplomacy.pacts.get(pactId);
  if (!pact || !pact.active) {
    return { diplomacy, reputationPenalty: 0, combatBonus: 0 };
  }

  const newPacts = new Map(diplomacy.pacts);
  newPacts.set(pactId, { ...pact, active: false });

  const victim = pact.memberIds.find((id) => id !== violator)!;
  const key = relationshipKey(violator, victim);
  const newRelationships = new Map(diplomacy.relationships);
  const existing = newRelationships.get(key);

  const penalty = VIOLATION_PENALTIES[pact.type as TreatyType];

  newRelationships.set(key, {
    status: "hostile",
    reputation: Math.max(-100, (existing?.reputation ?? 0) + penalty.reputationHit),
    lastChangeCycle: currentCycle,
    violations: (existing?.violations ?? 0) + 1,
  });

  return {
    diplomacy: { ...diplomacy, pacts: newPacts, relationships: newRelationships },
    reputationPenalty: penalty.reputationHit,
    combatBonus: penalty.combatBonus,
  };
}

/**
 * Form a Nexus Compact (coalition) against a target empire.
 */
export function formCompact(
  leader: EmpireId,
  members: EmpireId[],
  target: EmpireId,
  currentCycle: number,
): Coalition {
  return {
    id: `compact-${currentCycle}-${leader}` as CoalitionId,
    targetId: target,
    memberIds: [leader, ...members],
    warChest: 0,
    combatBonus: 0.15,
    formedCycle: currentCycle,
    active: true,
  };
}

/* ── War Declaration ── */

const WAR_DECLARATION_REPUTATION_HIT = -30;

/**
 * Declare war between two empires. Sets status to "at-war", applies reputation
 * penalty, and deactivates any active pacts between them.
 * No-op if already at war (returns penalty 0).
 */
export function declareWar(
  aggressor: EmpireId,
  target: EmpireId,
  currentCycle: number,
  diplomacy: DiplomacyState,
): { diplomacy: DiplomacyState; reputationPenalty: number } {
  const key = relationshipKey(aggressor, target);
  const existing = diplomacy.relationships.get(key);

  // Already at war — no-op
  if (existing?.status === "at-war") {
    return { diplomacy, reputationPenalty: 0 };
  }

  const newRelationships = new Map(diplomacy.relationships);
  newRelationships.set(key, {
    status: "at-war",
    reputation: Math.max(-100, (existing?.reputation ?? 50) + WAR_DECLARATION_REPUTATION_HIT),
    lastChangeCycle: currentCycle,
    violations: (existing?.violations ?? 0),
  });

  // Break any active pacts between these empires
  const newPacts = new Map(diplomacy.pacts);
  for (const [pactId, pact] of newPacts) {
    if (pact.active && pact.memberIds.includes(aggressor) && pact.memberIds.includes(target)) {
      newPacts.set(pactId, { ...pact, active: false });
    }
  }

  return {
    diplomacy: { ...diplomacy, pacts: newPacts, relationships: newRelationships },
    reputationPenalty: WAR_DECLARATION_REPUTATION_HIT,
  };
}

/* ── Trade Discounts ── */

/**
 * Get the best trade discount available to an empire from active pacts.
 * Returns the highest single discount (does not stack multiple pacts).
 * Star Covenant provides 15% discount; other pact types provide 0%.
 */
export function getTradeDiscount(
  empireId: EmpireId,
  diplomacy: DiplomacyState,
): number {
  let bestDiscount = 0;

  for (const [, pact] of diplomacy.pacts) {
    if (!pact.active) continue;
    if (!pact.memberIds.includes(empireId)) continue;

    const benefits = TREATY_BENEFITS[pact.type as TreatyType];
    if (benefits && benefits.tradeDiscount > bestDiscount) {
      bestDiscount = benefits.tradeDiscount;
    }
  }

  return bestDiscount;
}

/* ── Reputation System ── */

const DEFAULT_REPUTATION = 50;
const RECONCILIATION_COOLDOWN = 20;

/**
 * Initialize a new empire's global reputation.
 */
export function initReputation(): number {
  return DEFAULT_REPUTATION;
}

export interface ReputationFactors {
  honoredPactCount?: number;
  violationCount?: number;
}

/**
 * Update global reputation based on honored pacts and violations.
 * +1 per honored pact, -10 per violation. Clamped 0–100.
 */
export function updateReputation(
  current: number,
  factors: ReputationFactors,
): number {
  let delta = 0;
  delta += (factors.honoredPactCount ?? 0) * 1;
  delta -= (factors.violationCount ?? 0) * 10;
  return Math.max(0, Math.min(100, current + delta));
}

/* ── Coalition Combat Bonus ── */

/**
 * Get the coalition combat bonus for an empire attacking a specific target.
 * Returns the bonus (e.g. 0.15 for +15%) if the attacker is in an active
 * coalition targeting the defender, otherwise 0.
 */
export function getCoalitionCombatBonus(
  attackerId: EmpireId,
  targetId: EmpireId,
  diplomacy: DiplomacyState,
): number {
  for (const [, coalition] of diplomacy.coalitions) {
    if (!coalition.active) continue;
    if (coalition.targetId !== targetId) continue;
    if (!coalition.memberIds.includes(attackerId)) continue;
    return coalition.combatBonus;
  }
  return 0;
}

/* ── Mutual Defense ── */

/**
 * Check which empires are obligated to defend an attacked empire.
 * Only Star Covenants and Nexus Compacts carry defense obligations.
 */
export function checkMutualDefense(
  attackerId: EmpireId,
  defenderId: EmpireId,
  diplomacy: DiplomacyState,
): EmpireId[] {
  const obligated: EmpireId[] = [];

  for (const [, pact] of diplomacy.pacts) {
    if (!pact.active) continue;
    if (!pact.memberIds.includes(defenderId)) continue;

    const benefits = TREATY_BENEFITS[pact.type as TreatyType];
    if (!benefits?.defenceObligation) continue;

    const ally = pact.memberIds.find(id => id !== defenderId);
    if (ally && ally !== attackerId && !obligated.includes(ally)) {
      obligated.push(ally);
    }
  }

  return obligated;
}

/* ── Peace Negotiation ── */

/**
 * End a war between two empires. Transitions "at-war" to "neutral".
 * No-op if not at war. Pure function — does not mutate input.
 */
export function makePeace(
  empireA: EmpireId,
  empireB: EmpireId,
  currentCycle: number,
  diplomacy: DiplomacyState,
): DiplomacyState {
  const key = relationshipKey(empireA, empireB);
  const rel = diplomacy.relationships.get(key);
  if (!rel || rel.status !== "at-war") return diplomacy;

  const newRelationships = new Map(diplomacy.relationships);
  newRelationships.set(key, {
    ...rel,
    status: "neutral",
    lastChangeCycle: currentCycle,
  });

  return { ...diplomacy, relationships: newRelationships };
}

/* ── Intel Sharing ── */

/**
 * Get all empires that share intel with the given empire via active pacts.
 * Only pact types with intelSharing: true qualify (Star Covenant).
 */
export function getIntelSharingPartners(
  empireId: EmpireId,
  diplomacy: DiplomacyState,
): EmpireId[] {
  const partners: EmpireId[] = [];

  for (const [, pact] of diplomacy.pacts) {
    if (!pact.active) continue;
    if (!pact.memberIds.includes(empireId)) continue;

    const benefits = TREATY_BENEFITS[pact.type as TreatyType];
    if (!benefits?.intelSharing) continue;

    const partner = pact.memberIds.find(id => id !== empireId);
    if (partner && !partners.includes(partner)) {
      partners.push(partner);
    }
  }

  return partners;
}

/* ── Relationship Queries ── */

/**
 * Get the relationship status between two empires. Returns "neutral" if unknown.
 */
export function getRelationshipStatus(
  empireA: EmpireId,
  empireB: EmpireId,
  diplomacy: DiplomacyState,
): string {
  const key = relationshipKey(empireA, empireB);
  return diplomacy.relationships.get(key)?.status ?? "neutral";
}

/**
 * Get all empires allied with the given empire (status "allied").
 */
export function getEmpireAllies(
  empireId: EmpireId,
  diplomacy: DiplomacyState,
): EmpireId[] {
  const allies: EmpireId[] = [];

  for (const [key, rel] of diplomacy.relationships) {
    if (rel.status !== "allied") continue;
    const [a, b] = key.split("::") as [string, string];
    if (a === empireId) allies.push(b as EmpireId);
    else if (b === empireId) allies.push(a as EmpireId);
  }

  return allies;
}

/**
 * Get all empires at war with the given empire (status "at-war").
 */
export function getEmpireEnemies(
  empireId: EmpireId,
  diplomacy: DiplomacyState,
): EmpireId[] {
  const enemies: EmpireId[] = [];

  for (const [key, rel] of diplomacy.relationships) {
    if (rel.status !== "at-war") continue;
    const [a, b] = key.split("::") as [string, string];
    if (a === empireId) enemies.push(b as EmpireId);
    else if (b === empireId) enemies.push(a as EmpireId);
  }

  return enemies;
}

/* ── War Chest ── */

/**
 * Contribute credits to a coalition's war chest.
 */
export function contributeToWarChest(
  coalitionId: CoalitionId,
  amount: number,
  diplomacy: DiplomacyState,
): DiplomacyState {
  const coalition = diplomacy.coalitions.get(coalitionId);
  if (!coalition || !coalition.active) return diplomacy;

  const newCoalitions = new Map(diplomacy.coalitions);
  newCoalitions.set(coalitionId, {
    ...coalition,
    warChest: coalition.warChest + amount,
  });

  return { ...diplomacy, coalitions: newCoalitions };
}

/**
 * Dissolve a coalition. Distributes war chest evenly among members.
 */
export function dissolveCoalition(
  coalitionId: CoalitionId,
  diplomacy: DiplomacyState,
): { diplomacy: DiplomacyState; disbursements: Map<EmpireId, number> } {
  const coalition = diplomacy.coalitions.get(coalitionId);
  const disbursements = new Map<EmpireId, number>();

  if (!coalition) return { diplomacy, disbursements };

  const share = Math.floor(coalition.warChest / coalition.memberIds.length);
  for (const memberId of coalition.memberIds) {
    disbursements.set(memberId, share);
  }

  const newCoalitions = new Map(diplomacy.coalitions);
  newCoalitions.set(coalitionId, { ...coalition, active: false, warChest: 0 });

  return {
    diplomacy: { ...diplomacy, coalitions: newCoalitions },
    disbursements,
  };
}

/* ── Reconciliation ── */

/**
 * Attempt reconciliation between two hostile empires.
 * Requires at least RECONCILIATION_COOLDOWN cycles since relationship change.
 */
export function attemptReconciliation(
  empireA: EmpireId,
  empireB: EmpireId,
  currentCycle: number,
  diplomacy: DiplomacyState,
): DiplomacyState {
  const key = relationshipKey(empireA, empireB);
  const rel = diplomacy.relationships.get(key);
  if (!rel || rel.status !== "hostile") return diplomacy;

  const elapsed = currentCycle - rel.lastChangeCycle;
  if (elapsed < RECONCILIATION_COOLDOWN) return diplomacy;

  const newRelationships = new Map(diplomacy.relationships);
  newRelationships.set(key, {
    ...rel,
    status: "neutral",
    lastChangeCycle: currentCycle,
  });

  return { ...diplomacy, relationships: newRelationships };
}

/* ── Relationship Memory Maintenance ── */

const RELATIONSHIP_PRUNE_THRESHOLD = 50; // Cycles since last interaction

/**
 * Prune old relationships with neutral reputation and no recent activity.
 * Prevents the relationship Map from growing unbounded over long games.
 * Neutral (reputation 0) relationships with status "neutral" or "hostile" (if old enough)
 * are removed if they haven't changed for N cycles.
 */
export function pruneOldRelationships(
  diplomacy: DiplomacyState,
  currentCycle: number,
): DiplomacyState {
  const newRelationships = new Map(diplomacy.relationships);
  let pruned = false;

  for (const [key, rel] of newRelationships) {
    const elapsed = currentCycle - rel.lastChangeCycle;
    
    // Criteria for pruning:
    // 1. Long period with no change
    // 2. Neutral reputation (close to 0)
    // 3. Not in an active pact (checked by looking at pacts separately, 
    //    but usually non-neutral status implies a pact or recent war)
    if (elapsed >= RELATIONSHIP_PRUNE_THRESHOLD && Math.abs(rel.reputation) < 5) {
      if (rel.status === "neutral" || rel.status === "hostile") {
        newRelationships.delete(key);
        pruned = true;
      }
    }
  }

  if (!pruned) return diplomacy;
  return { ...diplomacy, relationships: newRelationships };
}
