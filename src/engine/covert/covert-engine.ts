/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Covert Operations Engine

   Handles the agent economy, dual-roll resolution (success + detection),
   and per-cycle covert operation processing.
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId } from "../types/ids";
import type {
  CovertState,
  EmpireCovertState,
  QueuedCovertOp,
  CovertResult,
  CovertOperationType,
} from "../types/covert";
import type { CovertEvent } from "../types/events";
import { COVERT_OPERATION_DEFS } from "../types/covert";
import type { SeededRNG } from "../utils/rng";

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */

export interface CovertModifiers {
  /** Attacker intel level (0–5) */
  attackerIntelLevel: number;
  /** Whether attacker has Schemer archetype */
  attackerIsSchemer: boolean;
  /** Defender's counter-intel agent count */
  defenderCounterIntelAgents: number;
  /** Defender's security doctrine tier (0 = none) */
  defenderSecurityDoctrineLevel: number;
}

/* ══════════════════════════════════════════════════════════════
   computeSuccessRate
   ══════════════════════════════════════════════════════════════ */

/**
 * Compute the clamped success probability for an operation.
 * Base: 0.60; clamp: [0.15, 0.85].
 * +5% per attacker intel level; +10% for Schemer.
 * -1.5% per 100 defender counter-intel agents; -10% per defender doctrine tier.
 */
export function computeSuccessRate(mods: CovertModifiers): number {
  let rate = 0.60;
  rate += mods.attackerIntelLevel * 0.05;
  if (mods.attackerIsSchemer) rate += 0.10;
  rate -= (mods.defenderCounterIntelAgents / 100) * 0.015;
  rate -= mods.defenderSecurityDoctrineLevel * 0.10;
  return Math.min(0.85, Math.max(0.15, rate));
}

/* ══════════════════════════════════════════════════════════════
   computeDetectionRisk
   ══════════════════════════════════════════════════════════════ */

/**
 * Compute the clamped detection probability for an operation.
 * Base: operation's baseDetectionRisk; clamp: [0.05, 0.75].
 * -5% per attacker intel level; -10% for Schemer.
 * +2% per 100 defender counter-intel agents; +10% per defender doctrine tier.
 */
export function computeDetectionRisk(
  baseDetectionRisk: number,
  mods: CovertModifiers,
): number {
  let risk = baseDetectionRisk;
  risk -= mods.attackerIntelLevel * 0.05;
  if (mods.attackerIsSchemer) risk -= 0.10;
  risk += (mods.defenderCounterIntelAgents / 100) * 0.02;
  risk += mods.defenderSecurityDoctrineLevel * 0.10;
  return Math.min(0.75, Math.max(0.05, risk));
}

/* ══════════════════════════════════════════════════════════════
   queueCovertOp
   ══════════════════════════════════════════════════════════════ */

/**
 * Queue a covert operation. Validates attacker has enough agents.
 * Deducts agent cost from agentPool.
 * Returns updated EmpireCovertState or null if insufficient agents.
 * Does not mutate input.
 */
export function queueCovertOp(
  state: EmpireCovertState,
  op: QueuedCovertOp,
): EmpireCovertState | null {
  const def = COVERT_OPERATION_DEFS[op.operationType];
  if (state.agentPool < def.agentCost) return null;

  return {
    ...state,
    agentPool: state.agentPool - def.agentCost,
    queuedOps: [...state.queuedOps, op],
  };
}

/* ══════════════════════════════════════════════════════════════
   accrueAgents
   ══════════════════════════════════════════════════════════════ */

/**
 * Add agents to an empire's pool (called each cycle from intelligencePoints income).
 * Does not mutate input.
 */
export function accrueAgents(
  state: EmpireCovertState,
  agentsToAdd: number,
): EmpireCovertState {
  return { ...state, agentPool: state.agentPool + agentsToAdd };
}

/* ══════════════════════════════════════════════════════════════
   resolveCovertOp
   ══════════════════════════════════════════════════════════════ */

/**
 * Resolve a single queued operation. Two independent rolls via rng.
 * Roll 1: success roll vs successRate
 * Roll 2: detection roll vs detectionRisk (independent of success)
 *
 * Returns CovertResult + CovertEvents + updated attacker state.
 * Does not mutate input states.
 */
export function resolveCovertOp(
  op: QueuedCovertOp,
  attackerState: EmpireCovertState,
  mods: CovertModifiers,
  rng: SeededRNG,
  cycle: number,
): {
  result: CovertResult;
  events: CovertEvent[];
  updatedAttackerState: EmpireCovertState;
} {
  const def = COVERT_OPERATION_DEFS[op.operationType];
  const attackerMods: CovertModifiers = {
    ...mods,
    attackerIntelLevel: attackerState.intelLevel,
  };

  const successRate = computeSuccessRate(attackerMods);
  const detectionRisk = computeDetectionRisk(def.baseDetectionRisk, attackerMods);

  const successRoll = rng.next();
  const detectionRoll = rng.next();

  const succeeded = successRoll < successRate;
  const detected = detectionRoll < detectionRisk;

  const result: CovertResult = {
    opId: op.id,
    operationType: op.operationType,
    attackerId: op.attackerId,
    targetId: op.targetId,
    succeeded,
    detected,
    effectSummary: succeeded
      ? `${op.operationType} succeeded against ${op.targetId}`
      : `${op.operationType} failed`,
  };

  const events: CovertEvent[] = [];

  if (detected) {
    events.push({
      type: "covert",
      kind: "op-detected",
      cycle,
      attackerId: op.attackerId,
      targetId: op.targetId,
      operationType: op.operationType,
      succeeded,
      reputationHit: -15,
      framedEmpireId: succeeded && op.operationType === "frame-another-empire" ? undefined : op.framedEmpireId,
    });
  } else if (succeeded) {
    events.push({
      type: "covert",
      kind: "op-succeeded",
      cycle,
      attackerId: op.attackerId,
      targetId: op.targetId,
      operationType: op.operationType,
      succeeded: true,
      framedEmpireId: op.framedEmpireId,
    });
  } else {
    events.push({
      type: "covert",
      kind: "op-failed",
      cycle,
      attackerId: op.attackerId,
      targetId: op.targetId,
      operationType: op.operationType,
      succeeded: false,
    });
  }

  const updatedAttackerState: EmpireCovertState = {
    ...attackerState,
    totalOpsCompleted: succeeded
      ? attackerState.totalOpsCompleted + 1
      : attackerState.totalOpsCompleted,
    timesDetectedAsAttacker: detected
      ? attackerState.timesDetectedAsAttacker + 1
      : attackerState.timesDetectedAsAttacker,
  };

  return { result, events, updatedAttackerState };
}

/* ══════════════════════════════════════════════════════════════
   checkStealthSovereign
   ══════════════════════════════════════════════════════════════ */

/**
 * Check whether an empire qualifies for Stealth Sovereign.
 * Condition: totalOpsCompleted >= 15 AND timesDetectedAsAttacker === 0.
 */
export function checkStealthSovereign(state: EmpireCovertState): boolean {
  return state.totalOpsCompleted >= 15 && state.timesDetectedAsAttacker === 0;
}

/* ══════════════════════════════════════════════════════════════
   Op-Specific Effects
   ══════════════════════════════════════════════════════════════ */

export interface CovertOpEffect {
  /** Credits transferred from target → attacker (0 if N/A) */
  creditsStolen: number;
  /** Research points transferred from target → attacker */
  researchStolen: number;
  /** Stability score reduction applied to target empire */
  targetStabilityHit: number;
  /** Intel level increase for the attacker (capped at 5) */
  attackerIntelGain: number;
  /** Agents stolen from target's covert pool */
  agentsStolen: number;
  /** Reputation hit applied from target → framed empire */
  framedReputationHit: number;
}

/** Effect magnitudes per operation type when the op succeeds */
export const COVERT_OP_EFFECTS: Record<CovertOperationType, CovertOpEffect> = {
  "reconnaissance":          { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 0,  attackerIntelGain: 1, agentsStolen: 0,   framedReputationHit: 0 },
  "steal-military-plans":    { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 0,  attackerIntelGain: 1, agentsStolen: 0,   framedReputationHit: 0 },
  "steal-credits":           { creditsStolen: 100, researchStolen: 0,  targetStabilityHit: 0,  attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: 0 },
  "steal-research":          { creditsStolen: 0,   researchStolen: 50, targetStabilityHit: 0,  attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: 0 },
  "sabotage-production":     { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 10, attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: 0 },
  "sabotage-infrastructure": { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 15, attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: 0 },
  "incite-rebellion":        { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 20, attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: 0 },
  "recruit-defectors":       { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 0,  attackerIntelGain: 0, agentsStolen: 100, framedReputationHit: 0 },
  "assassinate-leader":      { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 30, attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: 0 },
  "frame-another-empire":    { creditsStolen: 0,   researchStolen: 0,  targetStabilityHit: 0,  attackerIntelGain: 0, agentsStolen: 0,   framedReputationHit: -25 },
};

/**
 * Compute the concrete effect of a successful covert operation.
 * Returns the effect record; caller is responsible for applying to game state.
 * Returns null for failed ops.
 */
export function getCovertOpEffect(
  operationType: CovertOperationType,
  succeeded: boolean,
): CovertOpEffect | null {
  if (!succeeded) return null;
  return { ...COVERT_OP_EFFECTS[operationType] };
}

/* ══════════════════════════════════════════════════════════════
   processCovertCycle
   ══════════════════════════════════════════════════════════════ */

/**
 * Process all queued ops for all empires this cycle.
 * Processes in the provided empire order (typically weakest to strongest).
 * Pure function: clones input, returns updated CovertState + all events.
 */
export function processCovertCycle(
  covertState: CovertState,
  empireOrder: EmpireId[],
  modsPerEmpire: Map<EmpireId, CovertModifiers>,
  rng: SeededRNG,
  cycle: number,
): { state: CovertState; events: CovertEvent[] } {
  const allEvents: CovertEvent[] = [];

  // Clone empire states
  const empireStates = new Map<EmpireId, EmpireCovertState>(
    [...covertState.empireStates.entries()].map(([k, v]) => [
      k,
      { ...v, queuedOps: [...v.queuedOps] },
    ])
  );

  // Process each empire's queued ops in order
  for (const empireId of empireOrder) {
    const attackerState = empireStates.get(empireId);
    if (!attackerState || attackerState.queuedOps.length === 0) continue;

    const mods = modsPerEmpire.get(empireId) ?? {
      attackerIntelLevel: attackerState.intelLevel,
      attackerIsSchemer: false,
      defenderCounterIntelAgents: 0,
      defenderSecurityDoctrineLevel: 0,
    };

    let currentAttackerState = { ...attackerState, queuedOps: [] as QueuedCovertOp[] };

    for (const op of attackerState.queuedOps) {
      const { events, updatedAttackerState } = resolveCovertOp(
        op,
        currentAttackerState,
        mods,
        rng,
        cycle,
      );
      currentAttackerState = { ...updatedAttackerState, queuedOps: [] };
      for (const e of events) allEvents.push(e);
    }

    empireStates.set(empireId, currentAttackerState);
  }

  return {
    state: { empireStates },
    events: allEvents,
  };
}
