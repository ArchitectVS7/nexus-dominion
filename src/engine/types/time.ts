/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Time and Cosmic Order Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId } from "./ids";

/* ── Cosmic Order (Tier System) ── */

export type CosmicTier =
    | "sovereign"    // Top tier — resolves last (advantage)
    | "ascendant"    // Middle tier
    | "stricken";    // Bottom tier — resolves first (disadvantage)

export interface CosmicOrder {
    /** Empire → tier mapping (recalculated every Confluence) */
    tiers: Map<EmpireId, CosmicTier>;
    /** Sorted empire ranking by power score (highest first) */
    rankings: EmpireId[];
}

/* ── Time State ── */

export interface TimeState {
    /** Current cycle number (1-indexed) */
    currentCycle: number;
    /** Current confluence number (increments every 10 cycles) */
    currentConfluence: number;
    /** Cycles remaining until next Nexus Reckoning */
    cyclesUntilReckoning: number;
    /** The current Cosmic Order */
    cosmicOrder: CosmicOrder;
}

/** Number of cycles per confluence (Nexus Reckoning interval) */
export const CYCLES_PER_CONFLUENCE = 10;
