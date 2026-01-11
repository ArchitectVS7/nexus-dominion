/**
 * Metrics Aggregator - Multi-Game Statistics
 *
 * Aggregates metrics across multiple game results to produce
 * statistically meaningful balance analysis.
 */

import type {
  GameResult,
  GameMetrics,
  ArchetypeStats,
  BotArchetype,
  VictoryCondition,
} from "../types";
import { BALANCE_THRESHOLDS } from "../types";
import { extractGameMetrics } from "./balance-tracker";

// =============================================================================
// TYPES
// =============================================================================

export interface AggregatedStats {
  // Summary
  totalGames: number;
  totalTurns: number;
  totalDurationMs: number;
  avgTurnsPerGame: number;
  avgDurationPerGame: number;

  // Victory distribution
  victoryDistribution: Record<VictoryCondition, number>;

  // Archetype stats
  archetypeStats: Map<BotArchetype, ArchetypeStats>;

  // Matchup matrix (for 1v1 scenarios)
  matchupMatrix: MatchupMatrix;

  // Balance issues detected
  balanceIssues: BalanceIssue[];

  // Errors encountered
  errors: string[];
}

export interface MatchupMatrix {
  /** matchups[archetype1][archetype2] = wins for archetype1 */
  data: Partial<Record<BotArchetype, Partial<Record<BotArchetype, number>>>>;
  gamesPerMatchup: Partial<Record<BotArchetype, Partial<Record<BotArchetype, number>>>>;
}

export interface BalanceIssue {
  type: "overpowered" | "underpowered" | "dominant_matchup" | "warning";
  archetype: BotArchetype;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

// =============================================================================
// AGGREGATOR CLASS
// =============================================================================

export class MetricsAggregator {
  private gameMetrics: GameMetrics[] = [];
  private gameResults: GameResult[] = [];

  /**
   * Add a game result to the aggregator.
   */
  addGame(result: GameResult): void {
    this.gameResults.push(result);
    this.gameMetrics.push(extractGameMetrics(result));
  }

  /**
   * Add multiple game results.
   */
  addGames(results: GameResult[]): void {
    for (const result of results) {
      this.addGame(result);
    }
  }

  /**
   * Get the number of games aggregated.
   */
  getGameCount(): number {
    return this.gameResults.length;
  }

  /**
   * Clear all aggregated data.
   */
  clear(): void {
    this.gameMetrics = [];
    this.gameResults = [];
  }

  /**
   * Generate aggregated statistics.
   */
  getAggregatedStats(): AggregatedStats {
    const totalGames = this.gameResults.length;

    if (totalGames === 0) {
      return this.emptyStats();
    }

    const totalTurns = this.gameResults.reduce((sum, g) => sum + g.turnsPlayed, 0);
    const totalDurationMs = this.gameResults.reduce((sum, g) => sum + g.durationMs, 0);

    // Victory distribution
    const victoryDistribution = this.calculateVictoryDistribution();

    // Per-archetype stats
    const archetypeStats = this.calculateArchetypeStats();

    // Matchup matrix
    const matchupMatrix = this.calculateMatchupMatrix();

    // Detect balance issues
    const balanceIssues = this.detectBalanceIssues(archetypeStats);

    // Collect errors
    const errors = this.gameResults.flatMap((g) => g.errors);

    return {
      totalGames,
      totalTurns,
      totalDurationMs,
      avgTurnsPerGame: Math.round(totalTurns / totalGames),
      avgDurationPerGame: Math.round(totalDurationMs / totalGames),
      victoryDistribution,
      archetypeStats,
      matchupMatrix,
      balanceIssues,
      errors,
    };
  }

  /**
   * Get archetype stats as a map.
   */
  getArchetypeStats(): Map<BotArchetype, ArchetypeStats> {
    return this.calculateArchetypeStats();
  }

  /**
   * Get matchup matrix for 1v1 analysis.
   */
  getMatchupMatrix(): MatchupMatrix {
    return this.calculateMatchupMatrix();
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private emptyStats(): AggregatedStats {
    return {
      totalGames: 0,
      totalTurns: 0,
      totalDurationMs: 0,
      avgTurnsPerGame: 0,
      avgDurationPerGame: 0,
      victoryDistribution: {
        none: 0,
        conquest: 0,
        economic: 0,
        elimination: 0,
        turn_limit: 0,
        mutual_destruction: 0,
      },
      archetypeStats: new Map(),
      matchupMatrix: { data: {}, gamesPerMatchup: {} },
      balanceIssues: [],
      errors: [],
    };
  }

  private calculateVictoryDistribution(): Record<VictoryCondition, number> {
    const dist: Record<VictoryCondition, number> = {
      none: 0,
      conquest: 0,
      economic: 0,
      elimination: 0,
      turn_limit: 0,
      mutual_destruction: 0,
    };

    for (const result of this.gameResults) {
      dist[result.victoryCondition]++;
    }

    return dist;
  }

  private calculateArchetypeStats(): Map<BotArchetype, ArchetypeStats> {
    const statsMap = new Map<BotArchetype, ArchetypeStats>();

    // Initialize stats for all archetypes
    const archetypes: BotArchetype[] = [
      "warlord",
      "diplomat",
      "merchant",
      "schemer",
      "turtle",
      "blitzkrieg",
      "tech_rush",
      "opportunist",
    ];

    for (const arch of archetypes) {
      statsMap.set(arch, this.createEmptyArchetypeStats(arch));
    }

    // Aggregate metrics from all games
    for (const metrics of this.gameMetrics) {
      for (const empire of metrics.empireMetrics) {
        if (!empire.archetype) continue;

        const stats = statsMap.get(empire.archetype);
        if (!stats) continue;

        // Count games and wins
        stats.gamesPlayed++;
        if (empire.finalPosition === 1) {
          stats.wins++;
        }

        // Position distribution
        stats.positionDistribution[empire.finalPosition] =
          (stats.positionDistribution[empire.finalPosition] ?? 0) + 1;

        // Survival
        stats.avgSurvivalTurns += empire.survivalTurns;
        if (empire.wasEliminated) {
          stats.eliminationRate++;
        }

        // Performance peaks
        stats.avgPeakNetworth += empire.peakNetworth;
        stats.avgPeakSectors += empire.peakSectorCount;

        // Combat stats
        stats.avgKills += empire.battlesWon;
        stats.avgDeaths += empire.battlesLost;
      }
    }

    // Calculate averages and rates
    for (const stats of Array.from(statsMap.values())) {
      if (stats.gamesPlayed > 0) {
        stats.winRate = stats.wins / stats.gamesPlayed;
        stats.avgPosition =
          Object.entries(stats.positionDistribution).reduce(
            (sum, [pos, count]) => sum + Number(pos) * (count as number),
            0
          ) / stats.gamesPlayed;
        stats.avgSurvivalTurns = Math.round(
          stats.avgSurvivalTurns / stats.gamesPlayed
        );
        stats.eliminationRate = stats.eliminationRate / stats.gamesPlayed;
        stats.avgPeakNetworth = Math.round(
          stats.avgPeakNetworth / stats.gamesPlayed
        );
        stats.avgPeakSectors = Math.round(
          stats.avgPeakSectors / stats.gamesPlayed
        );
        stats.avgKills = stats.avgKills / stats.gamesPlayed;
        stats.avgDeaths = stats.avgDeaths / stats.gamesPlayed;
      }
    }

    return statsMap;
  }

  private createEmptyArchetypeStats(archetype: BotArchetype): ArchetypeStats {
    return {
      archetype,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      avgPosition: 0,
      positionDistribution: {},
      avgSurvivalTurns: 0,
      eliminationRate: 0,
      avgPeakNetworth: 0,
      avgPeakSectors: 0,
      avgKills: 0,
      avgDeaths: 0,
      winsAgainst: {},
      lossesAgainst: {},
    };
  }

  private calculateMatchupMatrix(): MatchupMatrix {
    const matrix: MatchupMatrix = {
      data: {},
      gamesPerMatchup: {},
    };

    // Only calculate for 2-player games (1v1 matchups)
    const matchupGames = this.gameResults.filter(
      (g) => g.finalEmpires.length === 2
    );

    for (const game of matchupGames) {
      const [empire1, empire2] = game.finalEmpires;
      if (!empire1?.botArchetype || !empire2?.botArchetype) continue;

      const arch1 = empire1.botArchetype;
      const arch2 = empire2.botArchetype;

      // Initialize if needed
      if (!matrix.data[arch1]) matrix.data[arch1] = {};
      if (!matrix.data[arch2]) matrix.data[arch2] = {};
      if (!matrix.gamesPerMatchup[arch1]) matrix.gamesPerMatchup[arch1] = {};
      if (!matrix.gamesPerMatchup[arch2]) matrix.gamesPerMatchup[arch2] = {};

      // Increment game count for both directions (avoid double-count for mirror matchups)
      matrix.gamesPerMatchup[arch1]![arch2] =
        (matrix.gamesPerMatchup[arch1]![arch2] ?? 0) + 1;
      if (arch1 !== arch2) {
        matrix.gamesPerMatchup[arch2]![arch1] =
          (matrix.gamesPerMatchup[arch2]![arch1] ?? 0) + 1;
      }

      // Record winner (mirror matchups: both archetypes get a win recorded)
      if (game.winnerId === empire1.id) {
        matrix.data[arch1]![arch2] = (matrix.data[arch1]![arch2] ?? 0) + 1;
      } else if (game.winnerId === empire2.id) {
        matrix.data[arch2]![arch1] = (matrix.data[arch2]![arch1] ?? 0) + 1;
      }
    }

    // Also update winsAgainst/lossesAgainst in archetype stats
    // (This is done separately in calculateArchetypeStats if needed)

    return matrix;
  }

  private detectBalanceIssues(
    archetypeStats: Map<BotArchetype, ArchetypeStats>
  ): BalanceIssue[] {
    const issues: BalanceIssue[] = [];

    for (const [archetype, stats] of Array.from(archetypeStats.entries())) {
      // Skip archetypes with too few games
      if (stats.gamesPlayed < 5) continue;

      // Check for overpowered
      if (stats.winRate > BALANCE_THRESHOLDS.maxWinRate) {
        issues.push({
          type: "overpowered",
          archetype,
          metric: "winRate",
          value: stats.winRate,
          threshold: BALANCE_THRESHOLDS.maxWinRate,
          message: `${archetype} has ${(stats.winRate * 100).toFixed(1)}% win rate (max: ${BALANCE_THRESHOLDS.maxWinRate * 100}%)`,
        });
      } else if (stats.winRate > BALANCE_THRESHOLDS.warnHighWinRate) {
        issues.push({
          type: "warning",
          archetype,
          metric: "winRate",
          value: stats.winRate,
          threshold: BALANCE_THRESHOLDS.warnHighWinRate,
          message: `${archetype} has high ${(stats.winRate * 100).toFixed(1)}% win rate (warning: ${BALANCE_THRESHOLDS.warnHighWinRate * 100}%)`,
        });
      }

      // Check for underpowered
      if (stats.winRate < BALANCE_THRESHOLDS.minWinRate) {
        issues.push({
          type: "underpowered",
          archetype,
          metric: "winRate",
          value: stats.winRate,
          threshold: BALANCE_THRESHOLDS.minWinRate,
          message: `${archetype} has ${(stats.winRate * 100).toFixed(1)}% win rate (min: ${BALANCE_THRESHOLDS.minWinRate * 100}%)`,
        });
      } else if (stats.winRate < BALANCE_THRESHOLDS.warnLowWinRate) {
        issues.push({
          type: "warning",
          archetype,
          metric: "winRate",
          value: stats.winRate,
          threshold: BALANCE_THRESHOLDS.warnLowWinRate,
          message: `${archetype} has low ${(stats.winRate * 100).toFixed(1)}% win rate (warning: ${BALANCE_THRESHOLDS.warnLowWinRate * 100}%)`,
        });
      }
    }

    // Check matchup dominance
    const matchups = this.calculateMatchupMatrix();
    for (const [arch1, opponents] of Object.entries(matchups.data)) {
      for (const [arch2, wins] of Object.entries(opponents ?? {})) {
        const games = matchups.gamesPerMatchup[arch1 as BotArchetype]?.[arch2 as BotArchetype] ?? 0;
        if (games >= 5) {
          const winRate = (wins ?? 0) / games;
          if (winRate > 0.8) {
            issues.push({
              type: "dominant_matchup",
              archetype: arch1 as BotArchetype,
              metric: `vs_${arch2}`,
              value: winRate,
              threshold: 0.8,
              message: `${arch1} dominates ${arch2} with ${(winRate * 100).toFixed(0)}% win rate`,
            });
          }
        }
      }
    }

    return issues;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a new aggregator with games already loaded.
 */
export function createAggregator(results: GameResult[]): MetricsAggregator {
  const aggregator = new MetricsAggregator();
  aggregator.addGames(results);
  return aggregator;
}

/**
 * Quick analysis of game results.
 */
export function analyzeResults(results: GameResult[]): AggregatedStats {
  const aggregator = createAggregator(results);
  return aggregator.getAggregatedStats();
}
