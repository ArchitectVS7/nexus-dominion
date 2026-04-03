/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Diplomacy Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, PactId, CoalitionId } from "./ids";

/* ── Relationship ── */

export type RelationshipStatus =
    | "neutral"
    | "friendly"
    | "hostile"
    | "at-war"
    | "allied"
    | "non-aggression";

export interface RelationshipState {
    status: RelationshipStatus;
    /** Reputation score (-100 to 100) */
    reputation: number;
    /** Cycle when the relationship last changed */
    lastChangeCycle: number;
    /** History of treaty violations */
    violations: number;
}

/* ── Pacts ── */

export type PactType =
    | "stillness-accord"   // Non-Aggression Pact
    | "star-covenant"      // Full Alliance
    | "nexus-compact";     // Coalition against a target

export interface Pact {
    id: PactId;
    type: PactType;
    memberIds: [EmpireId, EmpireId];
    /** Cycle when the pact was formed */
    formedCycle: number;
    /** Whether the pact is still active */
    active: boolean;
}

/* ── Coalitions (Nexus Compact) ── */

export interface Coalition {
    id: CoalitionId;
    /** Empire being opposed */
    targetId: EmpireId;
    /** Coalition member empire IDs */
    memberIds: EmpireId[];
    /** Shared war chest (credits) */
    warChest: number;
    /** Combat bonus vs target (percentage) */
    combatBonus: number;
    /** Cycle formed */
    formedCycle: number;
    active: boolean;
}

/* ── Diplomacy State ── */

export interface DiplomacyState {
    pacts: Map<PactId, Pact>;
    coalitions: Map<CoalitionId, Coalition>;
    /** Empire pair → relationship state */
    relationships: Map<string, RelationshipState>;
}

/** Helper to create a consistent key for an empire pair */
export function relationshipKey(a: EmpireId, b: EmpireId): string {
    return [a, b].sort().join("::");
}
