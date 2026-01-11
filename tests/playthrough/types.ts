/**
 * Playthrough Test System - Shared Types
 *
 * Type definitions for the in-memory gameplay testing system.
 * Designed to align with existing schema types while being independent of database.
 */

import type { BotArchetype, BotTier, BotDecision } from "@/lib/bots/types";

// Re-export types used by other modules
export type { BotArchetype, BotTier, BotDecision };

// =============================================================================
// VICTORY CONDITIONS
// =============================================================================

export type VictoryCondition =
  | "none" // Game still in progress
  | "conquest" // One empire controls 60%+ sectors
  | "economic" // One empire has 1.5x networth of next
  | "elimination" // Only one empire remains
  | "turn_limit" // Max turns reached, highest score wins
  | "mutual_destruction"; // All empires eliminated

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

export interface HarnessConfig {
  /** Number of bot empires to create */
  botCount: number;

  /** Maximum turns before game ends */
  maxTurns: number;

  /** Random seed for reproducibility (uses Date.now() if not provided) */
  seed?: number;

  /** Difficulty level */
  difficulty?: "easy" | "normal" | "hard" | "nightmare";

  /** Initial protection turns */
  protectionTurns?: number;

  /** Archetype distribution strategy */
  archetypeDistribution?: "balanced" | "random" | "custom";

  /** Custom archetype list (if distribution is "custom") */
  customArchetypes?: BotArchetype[];

  /** Enable debug logging */
  debug?: boolean;

  /** Apply personality variance (±5-15% to traits) */
  personalityVariance?: boolean;
}

export interface GameConfig extends HarnessConfig {
  gameId: string;
  seed: number;
}

// =============================================================================
// IN-MEMORY EMPIRE STATE
// =============================================================================

/**
 * Simplified empire state for in-memory simulation.
 * Contains only fields needed for gameplay testing.
 */
export interface SimEmpire {
  id: string;
  name: string;
  emperorName: string;

  // Type info
  type: "player" | "bot";
  botTier: BotTier | null;
  botArchetype: BotArchetype | null;

  // Resources
  credits: number;
  food: number;
  ore: number;
  petroleum: number;
  researchPoints: number;

  // Population
  population: number;
  populationCap: number;
  civilStatus: CivilStatus;

  // Military
  soldiers: number;
  fighters: number;
  stations: number;
  lightCruisers: number;
  heavyCruisers: number;
  carriers: number;
  covertAgents: number;

  // State
  networth: number;
  sectorCount: number;
  isEliminated: boolean;
  eliminatedAtTurn: number | null;

  // Game progress
  turnsPlayed: number;
  protectionTurnsRemaining: number;
}

export type CivilStatus =
  | "ecstatic"
  | "happy"
  | "content"
  | "neutral"
  | "unhappy"
  | "angry"
  | "rioting"
  | "revolting";

// =============================================================================
// IN-MEMORY SECTOR STATE
// =============================================================================

export interface SimSector {
  id: string;
  empireId: string;
  type: SectorType;
  productionRate: number;
}

export type SectorType =
  | "food"
  | "ore"
  | "petroleum"
  | "tourism"
  | "urban"
  | "education"
  | "government"
  | "research"
  | "supply"
  | "anti_pollution";

// =============================================================================
// TURN SNAPSHOT (for metrics)
// =============================================================================

export interface TurnSnapshot {
  turn: number;
  empireSnapshots: EmpireSnapshot[];
  timestamp: number;
}

export interface EmpireSnapshot {
  empireId: string;
  archetype: BotArchetype | null;

  // Key metrics
  networth: number;
  sectorCount: number;
  militaryPower: number;
  credits: number;
  population: number;

  // Status
  isEliminated: boolean;
  civilStatus: CivilStatus;
}

// =============================================================================
// DECISION TRACKING
// =============================================================================

export interface DecisionRecord {
  turn: number;
  empireId: string;
  empireName: string;
  archetype: BotArchetype | null;
  decision: BotDecision;
  executed: boolean;
  error?: string;
}

export interface AttackRecord {
  turn: number;
  attackerId: string;
  attackerName: string;
  attackerArchetype: BotArchetype | null;
  defenderId: string;
  defenderName: string;
  defenderArchetype: BotArchetype | null;
  attackerWon: boolean;
  sectorsTransferred: number;
  attackerCasualties: CasualtyReport;
  defenderCasualties: CasualtyReport;
}

export interface CasualtyReport {
  soldiers: number;
  fighters: number;
  stations: number;
  lightCruisers: number;
  heavyCruisers: number;
  carriers: number;
}

// =============================================================================
// GAME RESULT
// =============================================================================

export interface GameResult {
  // Identification
  gameId: string;
  seed: number;

  // Outcome
  victoryCondition: VictoryCondition;
  winnerId: string | null;
  winnerName: string | null;
  winnerArchetype: BotArchetype | null;

  // Duration
  turnsPlayed: number;
  durationMs: number;

  // Final state
  finalEmpires: SimEmpire[];
  finalRankings: EmpireRanking[];

  // History (for detailed analysis)
  turnSnapshots: TurnSnapshot[];
  attackRecords: AttackRecord[];

  // Errors
  errors: string[];
}

export interface EmpireRanking {
  position: number; // 1 = winner, 2 = second place, etc.
  empireId: string;
  empireName: string;
  archetype: BotArchetype | null;
  tier: BotTier | null;
  finalNetworth: number;
  finalSectorCount: number;
  survivalTurns: number;
  wasEliminated: boolean;
  eliminatedBy: string | null;
}

// =============================================================================
// SCENARIO CONFIGURATION
// =============================================================================

export interface ScenarioConfig {
  name: string;
  description: string;

  // Game setup
  bots: number;
  maxTurns: number;

  // Run configuration
  runs: number;
  timeout: number;

  // Optional overrides
  archetypeDistribution?: "balanced" | "random" | "custom";
  customArchetypes?: BotArchetype[];
  generateMatchups?: boolean;
  runsPerMatchup?: number;
}

// =============================================================================
// METRICS TYPES
// =============================================================================

export interface GameMetrics {
  gameId: string;
  seed: number;
  turnsPlayed: number;
  durationMs: number;

  // Outcome
  victoryCondition: VictoryCondition;
  winnerId: string | null;
  winnerArchetype: BotArchetype | null;

  // Per-empire metrics
  empireMetrics: EmpireMetrics[];
}

export interface EmpireMetrics {
  empireId: string;
  empireName: string;
  archetype: BotArchetype | null;
  tier: BotTier | null;

  // Survival
  survivalTurns: number;
  finalPosition: number;
  wasEliminated: boolean;
  eliminatedBy: string | null;

  // Peak performance
  peakNetworth: number;
  peakSectorCount: number;
  peakMilitaryPower: number;

  // Activity
  attacksLaunched: number;
  attacksReceived: number;
  battlesWon: number;
  battlesLost: number;

  // Economy
  totalCreditsEarned: number;
  totalSectorsBought: number;
  totalUnitsBuilt: number;
}

export interface ArchetypeStats {
  archetype: BotArchetype;
  gamesPlayed: number;

  // Win metrics
  wins: number;
  winRate: number;
  avgPosition: number;
  positionDistribution: Record<number, number>;

  // Survival
  avgSurvivalTurns: number;
  eliminationRate: number;

  // Performance
  avgPeakNetworth: number;
  avgPeakSectors: number;
  avgKills: number;
  avgDeaths: number;

  // Matchup data (1v1 scenarios)
  winsAgainst: Partial<Record<BotArchetype, number>>;
  lossesAgainst: Partial<Record<BotArchetype, number>>;
}

// =============================================================================
// BALANCE THRESHOLDS
// =============================================================================

export const BALANCE_THRESHOLDS = {
  // Expected distribution (not enforced, just flagged)
  topPerformers: 0.25,
  bottomPerformers: 0.25,

  // Red flags (automatic test failure)
  maxWinRate: 0.35,
  minWinRate: 0.03,

  // Warning thresholds (logged, not failure)
  warnHighWinRate: 0.25,
  warnLowWinRate: 0.08,

  // Dominance detection
  dominanceThreshold: 2.0,
} as const;
