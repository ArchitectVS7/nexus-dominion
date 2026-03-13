/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Military Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, FleetId, SystemId, UnitId } from "./ids";

/* ── Unit Types ── */

export type UnitCategory = "fleet" | "ground";

export interface UnitType {
    id: string;
    name: string;
    category: UnitCategory;
    /** Credit cost to build */
    buildCost: number;
    /** Cycles to construct */
    buildTime: number;
    /** Ore maintenance per cycle (5% of build cost) */
    oreMaintenance: number;
    /** Fuel cell maintenance per cycle (3% of build cost) */
    fuelMaintenance: number;
    /** Attack stat for d20-style combat */
    attack: number;
    /** Defence stat for d20-style combat */
    defence: number;
    /** Hit points */
    hp: number;
}

/* ── Units ── */

export interface Unit {
    id: UnitId;
    typeId: string;
    /** Current HP (may be less than max after combat) */
    currentHp: number;
    /** Cycle when construction completes; null if already built */
    completionCycle: number | null;
}

/* ── Fleets ── */

export interface Fleet {
    id: FleetId;
    ownerId: EmpireId;
    name: string;
    /** System where the fleet is stationed */
    locationSystemId: SystemId;
    /** Unit IDs in this fleet */
    unitIds: UnitId[];
    /** Target system if fleet is in transit; null if stationary */
    targetSystemId: SystemId | null;
    /** Cycle when fleet arrives at target; null if not in transit */
    arrivalCycle: number | null;
}

/* ── Combat ── */

export type CombatPhase = "fleet-engagement" | "orbital-bombardment" | "ground-assault";

export interface CombatResult {
    phase: CombatPhase;
    attackerId: EmpireId;
    defenderId: EmpireId;
    systemId: SystemId;
    attackerLosses: UnitId[];
    defenderLosses: UnitId[];
    victor: EmpireId;
    /** Whether the system changed ownership */
    systemCaptured: boolean;
}
