/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Syndicate Engine

   Manages the Galactic Syndicate: discovery, rank progression,
   contracts, shadow signature, exposure, and controller tracking.
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId } from "../types/ids";
import type {
  SyndicateMember,
  SyndicateState,
  SyndicateContractId,
  SyndicateRank,
  BlackRegisterItemId,
} from "../types/syndicate";
import type { SyndicateEvent } from "../types/events";
import {
  RANK_INFLUENCE_THRESHOLDS,
  CONTRACT_DEFINITIONS,
  BLACK_REGISTER_ITEMS,
  BLACK_REGISTER_RANK_PREMIUMS,
} from "../types/syndicate";
import type { SeededRNG } from "../utils/rng";

/** Exposure threshold: shadow signature must be at or above this to risk detection */
const EXPOSURE_THRESHOLD = 75;

/* ══════════════════════════════════════════════════════════════
   computeRankFromInfluence
   ══════════════════════════════════════════════════════════════ */

/**
 * Compute the rank an empire should have given its current influence total.
 * Returns 0 if below rank-1 threshold.
 */
export function computeRankFromInfluence(influence: number): SyndicateRank {
  // Walk ranks from 8 down to find the highest applicable threshold
  for (let rank = 8; rank >= 1; rank--) {
    if (influence >= RANK_INFLUENCE_THRESHOLDS[rank as SyndicateRank]) {
      return rank as SyndicateRank;
    }
  }
  return 0;
}

/* ══════════════════════════════════════════════════════════════
   executeContract
   ══════════════════════════════════════════════════════════════ */

/**
 * Execute a contract for an empire. Validates rank requirement, applies
 * influence reward and shadow signature growth to the member.
 * Returns the updated member and a SyndicateEvent, or null if ineligible.
 * Does not mutate input.
 */
export function executeContract(
  member: SyndicateMember,
  contractId: SyndicateContractId,
  cycle: number,
): { member: SyndicateMember; event: SyndicateEvent } | null {
  const def = CONTRACT_DEFINITIONS[contractId];
  if (member.rank < def.minRank) return null;

  const newInfluence = member.influence + def.influenceReward;
  const newSignature = Math.min(100, member.shadowSignature + def.shadowSignatureGrowth);

  const updatedMember: SyndicateMember = {
    ...member,
    influence: newInfluence,
    shadowSignature: newSignature,
  };

  const event: SyndicateEvent = {
    type: "syndicate",
    kind: "contract-completed",
    empireId: member.empireId,
    cycle,
  };

  return { member: updatedMember, event };
}

/* ══════════════════════════════════════════════════════════════
   applyCounterIntelDecay
   ══════════════════════════════════════════════════════════════ */

/**
 * Apply counter-intelligence decay to shadow signature.
 * counterIntelStrength is a 0.0–1.0 factor (e.g. 0.1 = 10% reduction per cycle).
 * Does not mutate input.
 */
export function applyCounterIntelDecay(
  member: SyndicateMember,
  counterIntelStrength: number,
): SyndicateMember {
  const newSignature = Math.max(0, member.shadowSignature - member.shadowSignature * counterIntelStrength);
  return { ...member, shadowSignature: newSignature };
}

/* ══════════════════════════════════════════════════════════════
   checkExposure
   ══════════════════════════════════════════════════════════════ */

/**
 * Determine whether an empire's shadow signature triggers exposure.
 * Detection risk = (shadowSignature - THRESHOLD) / 100, clamped to [0, 1].
 * Returns the exposed member + event, or null if not detected.
 * Does not mutate input.
 */
export function checkExposure(
  member: SyndicateMember,
  rngRoll: number,
  cycle: number,
): { member: SyndicateMember; event: SyndicateEvent } | null {
  // Skip already-exposed members
  if (member.exposed) return null;
  // Below threshold: safe
  if (member.shadowSignature < EXPOSURE_THRESHOLD) return null;

  const risk = (member.shadowSignature - EXPOSURE_THRESHOLD) / 100;
  if (rngRoll >= risk) return null;

  const exposedMember: SyndicateMember = { ...member, exposed: true };

  const event: SyndicateEvent = {
    type: "syndicate",
    kind: "empire-exposed",
    empireId: member.empireId,
    cycle,
  };

  return { member: exposedMember, event };
}

/* ══════════════════════════════════════════════════════════════
   computeController
   ══════════════════════════════════════════════════════════════ */

/**
 * Determine the current controller from all members.
 * Controller = non-exposed member with highest rank (rank 1+ qualifies).
 * Ties broken by highest influence. Returns null if no eligible members.
 */
export function computeController(
  members: Map<EmpireId, SyndicateMember>,
): EmpireId | null {
  let bestId: EmpireId | null = null;
  let bestRank = 0;
  let bestInfluence = -1;

  for (const [id, member] of members) {
    if (member.exposed) continue;
    if (member.rank === 0) continue;
    if (
      member.rank > bestRank ||
      (member.rank === bestRank && member.influence > bestInfluence)
    ) {
      bestId = id;
      bestRank = member.rank;
      bestInfluence = member.influence;
    }
  }

  return bestId;
}

/* ══════════════════════════════════════════════════════════════
   addMember
   ══════════════════════════════════════════════════════════════ */

/**
 * Add a new empire to the Syndicate at rank 0 / 0 influence.
 * Does not mutate input.
 */
export function addMember(
  state: SyndicateState,
  empireId: EmpireId,
  cycle: number,
): SyndicateState {
  const newMember: SyndicateMember = {
    empireId,
    rank: 0,
    influence: 0,
    shadowSignature: 0,
    exposed: false,
    discoveredCycle: cycle,
  };

  const newMembers = new Map(state.members);
  newMembers.set(empireId, newMember);

  return {
    ...state,
    members: newMembers,
    exposedEmpires: new Set(state.exposedEmpires),
  };
}

/* ══════════════════════════════════════════════════════════════
   Black Register (Black Market)
   ══════════════════════════════════════════════════════════════ */

/**
 * Check whether a syndicate member can purchase a Black Register item.
 * Requires minimum rank and must not be exposed.
 */
export function canPurchaseBlackRegisterItem(
  member: SyndicateMember,
  itemId: BlackRegisterItemId,
): boolean {
  if (member.exposed) return false;
  const def = BLACK_REGISTER_ITEMS[itemId];
  return member.rank >= def.minRank;
}

/**
 * Calculate the credit cost of a Black Register item for a given member.
 * Lower-rank members pay a premium; rank 6+ and controller pay base cost.
 * Returns 0 if the member cannot access the item.
 */
export function getBlackRegisterItemCost(
  member: SyndicateMember,
  itemId: BlackRegisterItemId,
  controllerId: EmpireId | null,
): number {
  if (!canPurchaseBlackRegisterItem(member, itemId)) return 0;
  const def = BLACK_REGISTER_ITEMS[itemId];
  const premium = member.empireId === controllerId
    ? 1.0
    : BLACK_REGISTER_RANK_PREMIUMS[member.rank];
  return Math.ceil(def.baseCost * premium);
}

/**
 * Execute a Black Register purchase. Updates the member's shadow signature
 * and returns the updated member + event. Returns null if ineligible.
 * Does not mutate input. Caller is responsible for deducting credits.
 */
export function purchaseBlackRegisterItem(
  member: SyndicateMember,
  itemId: BlackRegisterItemId,
  cycle: number,
): { member: SyndicateMember; event: SyndicateEvent } | null {
  if (!canPurchaseBlackRegisterItem(member, itemId)) return null;

  const def = BLACK_REGISTER_ITEMS[itemId];

  // Shadow Veil is special — it reduces signature instead of growing it
  let newSignature: number;
  if (itemId === "shadow-veil") {
    newSignature = Math.max(0, member.shadowSignature - 25);
  } else {
    newSignature = Math.min(100, member.shadowSignature + def.signatureGrowth);
  }

  const updatedMember: SyndicateMember = {
    ...member,
    shadowSignature: newSignature,
  };

  const event: SyndicateEvent = {
    type: "syndicate",
    kind: "contract-completed", // reuse event kind for now
    empireId: member.empireId,
    cycle,
  };

  return { member: updatedMember, event };
}

/* ══════════════════════════════════════════════════════════════
   computeFuelCellsProductionShare
   ══════════════════════════════════════════════════════════════ */

/**
 * Compute the fuelCells production share for each empire.
 * Used to populate AchievementContext.fuelCellsProductionShare.
 */
export function computeFuelCellsProductionShare(
  empireProduction: Map<EmpireId, number>,
): Map<EmpireId, number> {
  if (empireProduction.size === 0) return new Map();

  const total = [...empireProduction.values()].reduce((sum, v) => sum + v, 0);
  const shares = new Map<EmpireId, number>();

  for (const [id, production] of empireProduction) {
    shares.set(id, total === 0 ? 0 : production / total);
  }

  return shares;
}

/* ══════════════════════════════════════════════════════════════
   processSyndicateCycle
   ══════════════════════════════════════════════════════════════ */

/**
 * Process one full syndicate cycle. Pure function: clones input, returns
 * updated SyndicateState plus any events produced this cycle.
 *
 * Per cycle:
 * 1. Auto-promote members based on influence thresholds
 * 2. Apply counter-intel decay to shadow signatures
 * 3. Check each member for exposure (rng-gated, only if signature >= threshold)
 * 4. Recompute controller
 * 5. Update exposedEmpires set
 */
export function processSyndicateCycle(
  state: SyndicateState,
  cycle: number,
  rng: SeededRNG,
  counterIntelStrength: number = 0.05,
): { state: SyndicateState; events: SyndicateEvent[] } {
  const events: SyndicateEvent[] = [];
  const members = new Map<EmpireId, SyndicateMember>(
    [...state.members.entries()].map(([k, v]) => [k, { ...v }])
  );

  // 1. Auto-promote members based on influence
  for (const [id, member] of members) {
    const newRank = computeRankFromInfluence(member.influence);
    if (newRank > member.rank) {
      const promoted = { ...member, rank: newRank };
      members.set(id, promoted);
      events.push({
        type: "syndicate",
        kind: "rank-up",
        empireId: id,
        cycle,
        newRank,
      });
    }
  }

  // 2. Apply counter-intel decay for all members
  for (const [id, member] of members) {
    if (member.shadowSignature > 0) {
      const decayed = applyCounterIntelDecay(member, counterIntelStrength);
      members.set(id, decayed);
    }
  }

  // 3. Check exposure for all members
  for (const [id, member] of members) {
    const roll = rng.next();
    const result = checkExposure(member, roll, cycle);
    if (result) {
      members.set(id, result.member);
      events.push(result.event);
    }
  }

  // 4. Recompute controller
  const previousControllerId = state.controllerId;
  const newControllerId = computeController(members);

  if (newControllerId !== previousControllerId) {
    events.push({
      type: "syndicate",
      kind: "controller-changed",
      empireId: newControllerId ?? (previousControllerId as EmpireId),
      cycle,
      previousControllerId,
    });
  }

  // 3. Rebuild exposedEmpires set
  const exposedEmpires = new Set<EmpireId>();
  for (const [id, member] of members) {
    if (member.exposed) exposedEmpires.add(id);
  }

  return {
    state: {
      members,
      controllerId: newControllerId,
      exposedEmpires,
    },
    events,
  };
}

/* ── Rank Name Lookup ── */

const RANK_NAMES: Record<SyndicateRank, string> = {
  0: "Unaware",
  1: "Initiate",
  2: "Operative",
  3: "Agent",
  4: "Handler",
  5: "Shadow Broker",
  6: "Syndicate Captain",
  7: "Inner Circle",
  8: "Shadow Sovereign",
};

/**
 * Get the human-readable name for a syndicate rank.
 */
export function getSyndicateRankName(rank: SyndicateRank): string {
  return RANK_NAMES[rank];
}

/* ── Member Summary ── */

export interface MemberSummary {
  rank: SyndicateRank;
  influence: number;
  shadowSignature: number;
  exposed: boolean;
  rankName: string;
  isController: boolean;
}

/**
 * Get a summary of a member's syndicate standing. Returns null if not a member.
 */
export function getMemberSummary(
  empireId: EmpireId,
  state: SyndicateState,
): MemberSummary | null {
  const member = state.members.get(empireId);
  if (!member) return null;

  return {
    rank: member.rank,
    influence: member.influence,
    shadowSignature: member.shadowSignature,
    exposed: member.exposed,
    rankName: getSyndicateRankName(member.rank),
    isController: state.controllerId === empireId,
  };
}
