/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Galaxy, Sector, and Star System Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, SectorId, SystemId, InstallationId } from "./ids";
import type { Resources } from "./empire";

/* ── Position ── */

export interface Position {
    x: number;
    y: number;
}

/* ── Biome Types ── */

export type BiomeType =
    | "core-world"
    | "mineral-world"
    | "verdant-world"
    | "void-station"
    | "barren-world"
    | "contested-ruin"
    | "frontier-world"
    | "nexus-adjacent"
    | "resource-rich-anomaly";

/* ── Installations ── */

export type InstallationType =
    | "trade-hub"
    | "agricultural-station"
    | "mining-complex"
    | "fuel-extraction"
    | "population-centre"
    | "cultural-institute"
    | "intelligence-nexus"
    | "research-station";

export interface Installation {
    id: InstallationId;
    type: InstallationType;
    /** 0–1; 1.0 = fully operational, 0.5 = damaged */
    condition: number;
    /** Cycle number when construction completes; null if already built */
    completionCycle: number | null;
}

export interface DevelopmentSlot {
    /** The installation occupying this slot, or null if empty */
    installation: Installation | null;
    /** Whether this slot is locked (Frontier World terraforming required) */
    locked: boolean;
}

/* ── Star System ── */

export interface StarSystem {
    id: SystemId;
    name: string;
    sectorId: SectorId;
    position: Position;
    biome: BiomeType;
    owner: EmpireId | null;
    /** Development slots (determined by biome at generation) */
    slots: DevelopmentSlot[];
    /** Small baseline yield that exists regardless of installations */
    baseProduction: Partial<Resources>;
    /** IDs of adjacent systems (for border expansion requirement) */
    adjacentSystemIds: SystemId[];
    /** Cycle the system was claimed/conquered; null if unclaimed */
    claimedCycle: number | null;
    /** Whether the system is a home system for its owner */
    isHomeSystem: boolean;
}

/* ── Sector ── */

export interface Sector {
    id: SectorId;
    name: string;
    /** All system IDs within this sector (25 per sector) */
    systemIds: SystemId[];
    /** Approximate visual centre for the star map */
    centre: Position;
}

/** Computed dominance info for a sector — not stored, derived from game state */
export interface SectorDominance {
    sectorId: SectorId;
    /** Empire → number of systems held */
    ownership: Map<EmpireId, number>;
    /** Empire that holds 13+ systems, if any */
    dominantEmpire: EmpireId | null;
}

/* ── Galaxy ── */

export interface Galaxy {
    systems: Map<SystemId, StarSystem>;
    sectors: Map<SectorId, Sector>;
}

/* ── Galaxy Generation Config ── */

export interface GalaxyConfig {
    /** Total number of star systems (default: 250) */
    totalSystems: number;
    /** Number of geographic sectors (default: 10) */
    sectorCount: number;
    /** Systems per sector (default: 25) */
    systemsPerSector: number;
    /** Number of empires including the player (default: 100) */
    empireCount: number;
    /** Random seed for deterministic generation */
    seed: number;
}
