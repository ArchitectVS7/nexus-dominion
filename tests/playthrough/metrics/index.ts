/**
 * Metrics Module - Balance Analysis System
 *
 * Provides tools for extracting, aggregating, and reporting
 * balance metrics from playthrough test results.
 */

// Per-game metrics extraction
export { extractGameMetrics, validateGameMetrics } from "./balance-tracker";

// Multi-game aggregation
export {
  MetricsAggregator,
  createAggregator,
  analyzeResults,
  type AggregatedStats,
  type MatchupMatrix,
  type BalanceIssue,
} from "./aggregator";

// Report generation
export {
  generateMarkdownReport,
  generateConsoleReport,
  generateReportForFile,
  type ReportConfig,
} from "./report-generator";
