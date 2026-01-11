/**
 * Starmap Types
 *
 * Type definitions for the galaxy map visualization.
 */

import type { ArchetypeName } from "@/lib/bots/archetypes/types";

// Intel level determines how much information is visible about an empire
export type IntelLevel = "full" | "moderate" | "basic" | "unknown";

// Threat assessment level
export type ThreatLevel = "critical" | "high" | "medium" | "low" | "none" | "neutral" | "at_war" | "peaceful";

// Empire archetype (re-exported for convenience)
export type EmpireArchetype = ArchetypeName;

// Military tier classification
export type MilitaryTier = "weak" | "moderate" | "strong" | "dominant";

// Empire data for the starmap
export interface EmpireMapData {
  id: string;
  name: string;
  isPlayer: boolean;
  isBot: boolean;
  isEliminated: boolean;
  regionId: string;
  sectorCount: number;
  networth: number;
  militaryStrength: number;
  intelLevel: IntelLevel;
  threatLevel: ThreatLevel;
  archetype?: EmpireArchetype | "unknown";
  type?: "player" | "bot";
  militaryTier?: MilitaryTier;
  // Relationship data
  hasNAP: boolean;
  hasAlliance: boolean;
  hasTreaty?: boolean;
  isAtWar: boolean;
  recentAttacker: boolean;
  recentDefender: boolean;
  recentAggressor?: boolean;
}

// Treaty connection between empires
export interface TreatyConnection {
  empire1Id: string;
  empire2Id: string;
  type: "nap" | "alliance";
}

// Tell data for empire behavior hints
export interface EmpireTellData {
  empireId: string;
  tellType: string;
  displayType?: string;
  displayConfidence?: string;
  message: string;
  confidence: number;
  turn: number;
}

// Region data
export interface RegionData {
  id: string;
  name: string;
  type: "core" | "frontier" | "rim" | "void";
  empireCount: number;
  totalNetworth: number;
}

// Wormhole connection
export interface WormholeData {
  id: string;
  fromRegionId: string;
  toRegionId: string;
  status: "discovered" | "stabilized" | "collapsed";
  stabilizationCost?: number;
}

// Full galaxy view data
export interface GalaxyViewData {
  regions: RegionData[];
  empires: EmpireMapData[];
  treaties: TreatyConnection[];
  wormholes: WormholeData[];
  playerRegionId: string;
  currentTurn: number;
}
