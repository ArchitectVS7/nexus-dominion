/**
 * Report Generator - Markdown Balance Reports
 *
 * Generates human-readable markdown reports from aggregated metrics.
 * Output can be saved to files or displayed in console.
 */

import type { BotArchetype } from "../types";
import type { AggregatedStats, BalanceIssue, MatchupMatrix } from "./aggregator";

// =============================================================================
// REPORT CONFIGURATION
// =============================================================================

export interface ReportConfig {
  /** Report title */
  title?: string;
  /** Include matchup matrix */
  includeMatchups?: boolean;
  /** Include detailed archetype breakdown */
  includeArchetypeDetails?: boolean;
  /** Include victory distribution */
  includeVictoryDistribution?: boolean;
  /** Include errors section */
  includeErrors?: boolean;
  /** Maximum errors to show */
  maxErrors?: number;
  /** Timestamp to include in report */
  timestamp?: Date;
}

const DEFAULT_CONFIG: Required<ReportConfig> = {
  title: "Balance Test Report",
  includeMatchups: true,
  includeArchetypeDetails: true,
  includeVictoryDistribution: true,
  includeErrors: true,
  maxErrors: 10,
  timestamp: new Date(),
};

// =============================================================================
// MAIN REPORT GENERATOR
// =============================================================================

/**
 * Generate a complete markdown balance report.
 */
export function generateMarkdownReport(
  stats: AggregatedStats,
  config: ReportConfig = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const sections: string[] = [];

  // Header
  sections.push(generateHeader(cfg.title, cfg.timestamp, stats));

  // Executive summary
  sections.push(generateExecutiveSummary(stats));

  // Victory distribution
  if (cfg.includeVictoryDistribution) {
    sections.push(generateVictoryDistribution(stats));
  }

  // Archetype balance
  sections.push(generateArchetypeBalance(stats));

  // Detailed archetype breakdown
  if (cfg.includeArchetypeDetails) {
    sections.push(generateArchetypeDetails(stats));
  }

  // Matchup matrix
  if (cfg.includeMatchups && hasMatchupData(stats.matchupMatrix)) {
    sections.push(generateMatchupMatrix(stats.matchupMatrix));
  }

  // Balance issues
  if (stats.balanceIssues.length > 0) {
    sections.push(generateBalanceIssues(stats.balanceIssues));
  }

  // Errors
  if (cfg.includeErrors && stats.errors.length > 0) {
    sections.push(generateErrorsSection(stats.errors, cfg.maxErrors));
  }

  return sections.join("\n\n");
}

/**
 * Generate a console-friendly report (with box drawing characters).
 */
export function generateConsoleReport(stats: AggregatedStats): string {
  const lines: string[] = [];
  const divider = "═".repeat(70);
  const thinDivider = "─".repeat(70);

  lines.push(divider);
  lines.push("  PLAYTHROUGH BALANCE REPORT");
  lines.push(divider);

  // Summary box
  lines.push("");
  lines.push("┌─ SUMMARY " + "─".repeat(59) + "┐");
  lines.push(`│  Games Analyzed: ${stats.totalGames}`.padEnd(69) + "│");
  lines.push(`│  Total Turns: ${stats.totalTurns}`.padEnd(69) + "│");
  lines.push(`│  Avg Turns/Game: ${stats.avgTurnsPerGame}`.padEnd(69) + "│");
  lines.push(`│  Total Duration: ${formatDuration(stats.totalDurationMs)}`.padEnd(69) + "│");
  lines.push(`│  Avg Time/Game: ${stats.avgDurationPerGame}ms`.padEnd(69) + "│");
  lines.push("└" + "─".repeat(69) + "┘");

  // Victory distribution
  lines.push("");
  lines.push("┌─ VICTORY CONDITIONS " + "─".repeat(48) + "┐");
  for (const [condition, count] of Object.entries(stats.victoryDistribution)) {
    if (count > 0) {
      const pct = ((count / stats.totalGames) * 100).toFixed(1);
      lines.push(`│  ${condition}: ${count} (${pct}%)`.padEnd(69) + "│");
    }
  }
  lines.push("└" + "─".repeat(69) + "┘");

  // Archetype balance
  lines.push("");
  lines.push("┌─ ARCHETYPE BALANCE " + "─".repeat(49) + "┐");
  lines.push("│  Archetype       Win%   AvgPos  Survival  Elim%   Status".padEnd(69) + "│");
  lines.push("├" + thinDivider.slice(0, 69) + "┤");

  const sortedArchetypes = Array.from(stats.archetypeStats.entries())
    .filter(([_, s]) => s.gamesPlayed > 0)
    .sort((a, b) => b[1].winRate - a[1].winRate);

  for (const [arch, s] of sortedArchetypes) {
    const status = getStatusEmoji(s.winRate);
    const line = `│  ${arch.padEnd(14)} ${(s.winRate * 100).toFixed(1).padStart(5)}%  ${s.avgPosition.toFixed(1).padStart(6)}  ${String(s.avgSurvivalTurns).padStart(8)}  ${(s.eliminationRate * 100).toFixed(0).padStart(4)}%   ${status}`;
    lines.push(line.padEnd(69) + "│");
  }
  lines.push("└" + "─".repeat(69) + "┘");

  // Balance issues
  if (stats.balanceIssues.length > 0) {
    lines.push("");
    lines.push("┌─ BALANCE ISSUES " + "─".repeat(52) + "┐");
    for (const issue of stats.balanceIssues) {
      const icon = issue.type === "overpowered" ? "⚠️" : issue.type === "underpowered" ? "📉" : "⚡";
      lines.push(`│  ${icon} ${issue.message.slice(0, 62)}`.padEnd(69) + "│");
    }
    lines.push("└" + "─".repeat(69) + "┘");
  }

  // Errors
  if (stats.errors.length > 0) {
    lines.push("");
    lines.push("┌─ ERRORS " + "─".repeat(60) + "┐");
    const uniqueErrors = Array.from(new Set(stats.errors)).slice(0, 5);
    for (const error of uniqueErrors) {
      lines.push(`│  ${error.slice(0, 65)}`.padEnd(69) + "│");
    }
    if (stats.errors.length > 5) {
      lines.push(`│  ... and ${stats.errors.length - 5} more errors`.padEnd(69) + "│");
    }
    lines.push("└" + "─".repeat(69) + "┘");
  }

  lines.push("");
  lines.push(divider);

  return lines.join("\n");
}

// =============================================================================
// SECTION GENERATORS
// =============================================================================

function generateHeader(
  title: string,
  timestamp: Date,
  stats: AggregatedStats
): string {
  return `# ${title}

**Generated:** ${timestamp.toISOString()}
**Games Analyzed:** ${stats.totalGames}
**Total Duration:** ${formatDuration(stats.totalDurationMs)}`;
}

function generateExecutiveSummary(stats: AggregatedStats): string {
  const criticalIssues = stats.balanceIssues.filter(
    (i) => i.type === "overpowered" || i.type === "underpowered"
  );
  const warnings = stats.balanceIssues.filter((i) => i.type === "warning");

  let summaryStatus = "✅ **BALANCED**";
  if (criticalIssues.length > 0) {
    summaryStatus = "❌ **BALANCE ISSUES DETECTED**";
  } else if (warnings.length > 0) {
    summaryStatus = "⚠️ **MINOR WARNINGS**";
  }

  return `## Executive Summary

${summaryStatus}

| Metric | Value |
|--------|-------|
| Total Games | ${stats.totalGames} |
| Avg Turns/Game | ${stats.avgTurnsPerGame} |
| Avg Time/Game | ${stats.avgDurationPerGame}ms |
| Critical Issues | ${criticalIssues.length} |
| Warnings | ${warnings.length} |`;
}

function generateVictoryDistribution(stats: AggregatedStats): string {
  const rows = Object.entries(stats.victoryDistribution)
    .filter(([_, count]) => count > 0)
    .map(([condition, count]) => {
      const pct = ((count / stats.totalGames) * 100).toFixed(1);
      return `| ${condition} | ${count} | ${pct}% |`;
    })
    .join("\n");

  return `## Victory Conditions

| Condition | Count | Percentage |
|-----------|-------|------------|
${rows}`;
}

function generateArchetypeBalance(stats: AggregatedStats): string {
  const sortedArchetypes = Array.from(stats.archetypeStats.entries())
    .filter(([_, s]) => s.gamesPlayed > 0)
    .sort((a, b) => b[1].winRate - a[1].winRate);

  const rows = sortedArchetypes
    .map(([arch, s]) => {
      const status = getStatusEmoji(s.winRate);
      return `| ${arch} | ${s.gamesPlayed} | ${(s.winRate * 100).toFixed(1)}% | ${s.avgPosition.toFixed(2)} | ${status} |`;
    })
    .join("\n");

  return `## Archetype Balance

| Archetype | Games | Win Rate | Avg Position | Status |
|-----------|-------|----------|--------------|--------|
${rows}`;
}

function generateArchetypeDetails(stats: AggregatedStats): string {
  const sections: string[] = ["## Archetype Details"];

  for (const [arch, s] of Array.from(stats.archetypeStats.entries())) {
    if (s.gamesPlayed === 0) continue;

    sections.push(`
### ${arch.charAt(0).toUpperCase() + arch.slice(1)}

| Metric | Value |
|--------|-------|
| Games Played | ${s.gamesPlayed} |
| Wins | ${s.wins} |
| Win Rate | ${(s.winRate * 100).toFixed(1)}% |
| Avg Position | ${s.avgPosition.toFixed(2)} |
| Avg Survival (turns) | ${s.avgSurvivalTurns} |
| Elimination Rate | ${(s.eliminationRate * 100).toFixed(1)}% |
| Avg Peak Networth | ${s.avgPeakNetworth.toLocaleString()} |
| Avg Peak Sectors | ${s.avgPeakSectors} |
| Avg Battles Won | ${s.avgKills.toFixed(1)} |
| Avg Battles Lost | ${s.avgDeaths.toFixed(1)} |`);
  }

  return sections.join("\n");
}

function generateMatchupMatrix(matrix: MatchupMatrix): string {
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

  // Header row
  const shortNames: Record<BotArchetype, string> = {
    warlord: "WAR",
    diplomat: "DIP",
    merchant: "MER",
    schemer: "SCH",
    turtle: "TUR",
    blitzkrieg: "BLI",
    tech_rush: "TEC",
    opportunist: "OPP",
  };

  let header = "| vs |";
  for (const arch of archetypes) {
    header += ` ${shortNames[arch]} |`;
  }

  let separator = "|---|";
  for (let i = 0; i < archetypes.length; i++) {
    separator += "---|";
  }

  const rows: string[] = [];
  for (const arch1 of archetypes) {
    let row = `| **${shortNames[arch1]}** |`;
    for (const arch2 of archetypes) {
      if (arch1 === arch2) {
        row += " - |";
      } else {
        const wins = matrix.data[arch1]?.[arch2] ?? 0;
        const games = matrix.gamesPerMatchup[arch1]?.[arch2] ?? 0;
        if (games > 0) {
          const winRate = ((wins / games) * 100).toFixed(0);
          row += ` ${winRate}% |`;
        } else {
          row += " N/A |";
        }
      }
    }
    rows.push(row);
  }

  return `## Matchup Matrix

Win rates (row vs column):

${header}
${separator}
${rows.join("\n")}

*Legend: WAR=Warlord, DIP=Diplomat, MER=Merchant, SCH=Schemer, TUR=Turtle, BLI=Blitzkrieg, TEC=Tech Rush, OPP=Opportunist*`;
}

function generateBalanceIssues(issues: BalanceIssue[]): string {
  const criticalIssues = issues.filter(
    (i) => i.type === "overpowered" || i.type === "underpowered"
  );
  const warnings = issues.filter((i) => i.type === "warning");
  const dominantMatchups = issues.filter((i) => i.type === "dominant_matchup");

  const sections: string[] = ["## Balance Issues"];

  if (criticalIssues.length > 0) {
    sections.push("\n### Critical Issues\n");
    for (const issue of criticalIssues) {
      const icon = issue.type === "overpowered" ? "🔴" : "🟡";
      sections.push(`- ${icon} **${issue.archetype}**: ${issue.message}`);
    }
  }

  if (dominantMatchups.length > 0) {
    sections.push("\n### Dominant Matchups\n");
    for (const issue of dominantMatchups) {
      sections.push(`- ⚔️ ${issue.message}`);
    }
  }

  if (warnings.length > 0) {
    sections.push("\n### Warnings\n");
    for (const issue of warnings) {
      sections.push(`- ⚠️ ${issue.message}`);
    }
  }

  return sections.join("\n");
}

function generateErrorsSection(errors: string[], maxErrors: number): string {
  const uniqueErrors = Array.from(new Set(errors));
  const displayErrors = uniqueErrors.slice(0, maxErrors);

  let section = `## Errors (${errors.length} total, ${uniqueErrors.length} unique)\n\n`;

  for (const error of displayErrors) {
    section += `- \`${error}\`\n`;
  }

  if (uniqueErrors.length > maxErrors) {
    section += `\n*...and ${uniqueErrors.length - maxErrors} more unique errors*`;
  }

  return section;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getStatusEmoji(winRate: number): string {
  if (winRate > 0.35) return "🔴 OVERPOWERED";
  if (winRate > 0.25) return "⚡ High";
  if (winRate < 0.03) return "🟡 UNDERPOWERED";
  if (winRate < 0.08) return "📉 Low";
  return "✅ OK";
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function hasMatchupData(matrix: MatchupMatrix): boolean {
  return Object.keys(matrix.data).length > 0;
}

// =============================================================================
// FILE OUTPUT
// =============================================================================

/**
 * Generate report and return as string for file writing.
 */
export function generateReportForFile(
  stats: AggregatedStats,
  format: "markdown" | "console" = "markdown"
): string {
  if (format === "console") {
    return generateConsoleReport(stats);
  }
  return generateMarkdownReport(stats);
}
