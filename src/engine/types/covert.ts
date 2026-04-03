/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Covert Operations Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId } from "./ids";

/* ── Operation Registry ── */

export type CovertOperationType =
  | "reconnaissance"
  | "steal-military-plans"
  | "steal-credits"
  | "sabotage-production"
  | "steal-research"
  | "sabotage-infrastructure"
  | "incite-rebellion"
  | "recruit-defectors"
  | "assassinate-leader"
  | "frame-another-empire";

export interface CovertOperationDef {
  id: CovertOperationType;
  agentCost: number;
  /** Base detection risk (0.0–1.0), will be clamped 0.05–0.75 after modifiers */
  baseDetectionRisk: number;
}

export const COVERT_OPERATION_DEFS: Record<CovertOperationType, CovertOperationDef> = {
  "reconnaissance":          { id: "reconnaissance",          agentCost: 100, baseDetectionRisk: 0.10 },
  "steal-military-plans":    { id: "steal-military-plans",    agentCost: 150, baseDetectionRisk: 0.20 },
  "steal-credits":           { id: "steal-credits",           agentCost: 200, baseDetectionRisk: 0.25 },
  "sabotage-production":     { id: "sabotage-production",     agentCost: 300, baseDetectionRisk: 0.35 },
  "steal-research":          { id: "steal-research",          agentCost: 250, baseDetectionRisk: 0.30 },
  "sabotage-infrastructure": { id: "sabotage-infrastructure", agentCost: 450, baseDetectionRisk: 0.45 },
  "incite-rebellion":        { id: "incite-rebellion",        agentCost: 350, baseDetectionRisk: 0.40 },
  "recruit-defectors":       { id: "recruit-defectors",       agentCost: 500, baseDetectionRisk: 0.55 },
  "assassinate-leader":      { id: "assassinate-leader",      agentCost: 400, baseDetectionRisk: 0.50 },
  "frame-another-empire":    { id: "frame-another-empire",    agentCost: 300, baseDetectionRisk: 0.35 },
};

/* ── Queued Operation ── */

export interface QueuedCovertOp {
  /** Deterministic ID: `${attackerId}-${queuedCycle}-${operationType}` */
  id: string;
  operationType: CovertOperationType;
  attackerId: EmpireId;
  targetId: EmpireId;
  /** Optional: empire to frame if op is detected (only for frame-another-empire) */
  framedEmpireId?: EmpireId;
  queuedCycle: number;
}

/* ── Resolution Result ── */

export interface CovertResult {
  opId: string;
  operationType: CovertOperationType;
  attackerId: EmpireId;
  targetId: EmpireId;
  succeeded: boolean;
  detected: boolean;
  /** Short description for UI/events */
  effectSummary: string;
}

/* ── Per-Empire Covert State ── */

export interface EmpireCovertState {
  empireId: EmpireId;
  /** Available agents */
  agentPool: number;
  /** Intel level (0–5): affects success/detection modifiers */
  intelLevel: number;
  /** Operations queued for this cycle */
  queuedOps: QueuedCovertOp[];
  /** All-time count of successfully completed operations */
  totalOpsCompleted: number;
  /** All-time count of times detected as the attacker — Stealth Sovereign requires 0 */
  timesDetectedAsAttacker: number;
}

/* ── Global Covert State ── */

export interface CovertState {
  empireStates: Map<EmpireId, EmpireCovertState>;
}
