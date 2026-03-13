/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Empire and Resource Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, SystemId, FleetId } from "./ids";

/* ── Resources ── */

export interface Resources {
    credits: number;
    food: number;
    ore: number;
    fuelCells: number;
    researchPoints: number;
    intelligencePoints: number;
}

/** Resource deltas per cycle (production - consumption) */
export type ResourceLedger = {
    production: Resources;
    consumption: Resources;
    net: Resources;
    reserves: Resources;
};

/* ── Imperial Stability (Civil Status) ── */

export type StabilityLevel =
    | "ecstatic"    // 2.5x multiplier
    | "happy"       // 1.5x
    | "content"     // 1.0x
    | "unhappy"     // 0.75x
    | "angry"       // 0.5x
    | "rioting";    // 0.25x

export const STABILITY_MULTIPLIERS: Record<StabilityLevel, number> = {
    ecstatic: 2.5,
    happy: 1.5,
    content: 1.0,
    unhappy: 0.75,
    angry: 0.5,
    rioting: 0.25,
};

/* ── Empire ── */

export interface Empire {
    id: EmpireId;
    name: string;
    colour: string;
    /** Is this the human player's empire? */
    isPlayer: boolean;
    /** IDs of all star systems owned */
    systemIds: SystemId[];
    /** Home system ID */
    homeSystemId: SystemId;
    /** Current resource reserves */
    resources: Resources;
    /** Current imperial stability score (0–100) */
    stabilityScore: number;
    /** Derived stability level */
    stabilityLevel: StabilityLevel;
    /** Total population */
    population: number;
    /** Population capacity (from Urban/Population Centre installations) */
    populationCapacity: number;
    /** IDs of all fleets */
    fleetIds: FleetId[];
    /** Current research tier (0–8) */
    researchTier: number;
    /** Power score for Cosmic Order ranking */
    powerScore: number;
}

/** Initial empire configuration for campaign setup */
export interface EmpireConfig {
    name: string;
    colour: string;
    isPlayer: boolean;
}
