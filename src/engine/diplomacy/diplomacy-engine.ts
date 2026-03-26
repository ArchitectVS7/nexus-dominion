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
