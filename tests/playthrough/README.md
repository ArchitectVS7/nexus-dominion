# Playthrough Test System

Fast, in-memory gameplay simulation for bot balance testing.

## Overview

This system runs bot-vs-bot game simulations without a database, enabling:
- **1000+ games in under 2 seconds** (~800 games/second)
- **Reproducible results** via seeded random number generation
- **Archetype balance analysis** with win rates, matchup matrices, and position tracking
- **Automated balance reports** in markdown and console formats

## Quick Start

```bash
# Run 10 quick duels (4 bots, 30 turns each)
npx tsx tests/playthrough/runner.ts quick

# Run all archetype matchups (8×7/2 = 28 pairs × 3 runs = 84 games)
npx tsx tests/playthrough/runner.ts matchups -o tests/playthrough/reports/matchups.md

# Run full balance test suite (290 games)
npx tsx tests/playthrough/runner.ts balance -o tests/playthrough/reports/balance.md
```

## Directory Structure

```
tests/playthrough/
├── harness/                    # In-memory game simulation
│   ├── game-harness.ts         # Main simulation orchestrator
│   ├── game-state.ts           # In-memory state container
│   └── seeded-random.ts        # Deterministic PRNG (Mulberry32)
├── metrics/                    # Statistics and reporting
│   ├── aggregator.ts           # Multi-game statistics
│   ├── balance-tracker.ts      # Per-game metrics extraction
│   └── report-generator.ts     # Markdown/console output
├── reports/                    # Generated reports (gitignored)
├── runner.ts                   # CLI entry point
├── types.ts                    # Shared interfaces
└── index.ts                    # Public API exports
```

## CLI Commands

### `quick` - Fast Duels

Run quick games with random archetype assignment.

```bash
npx tsx tests/playthrough/runner.ts quick [options]
```

**Options:**
- `-r, --runs <n>` - Number of games (default: 10)
- `-b, --bots <n>` - Bots per game (default: 4)
- `-t, --turns <n>` - Max turns per game (default: 30)
- `-s, --seed <n>` - Random seed for reproducibility
- `-o, --output <file>` - Save markdown report
- `-d, --debug` - Enable debug output

**Example:**
```bash
npx tsx tests/playthrough/runner.ts quick --runs 100 --bots 8 --turns 50
```

### `matchups` - Archetype 1v1 Analysis

Run all 28 unique archetype pair matchups.

```bash
npx tsx tests/playthrough/runner.ts matchups [options]
```

**Options:**
- `-r, --runs <n>` - Runs per matchup (default: 10, total = 28 × runs)
- `-s, --seed <n>` - Random seed
- `-o, --output <file>` - Save report with matchup matrix

**Example:**
```bash
npx tsx tests/playthrough/runner.ts matchups --runs 5 -o matchups.md
```

### `balance` - Full Test Suite

Run comprehensive balance testing across multiple scenarios.

```bash
npx tsx tests/playthrough/runner.ts balance [options]
```

Runs three phases:
1. **Quick Duels**: 50 games (4 bots, 30 turns)
2. **Standard Games**: 100 games (10 bots, 100 turns)
3. **1v1 Matchups**: 140 games (28 pairs × 5 runs)

**Total: 290 games**

### `report` - Custom Report Generation

Generate a balance report with custom parameters.

```bash
npx tsx tests/playthrough/runner.ts report -o report.md [options]
```

**Requires:** `-o, --output <file>`

## Understanding Reports

### Balance Status Indicators

| Symbol | Meaning |
|--------|---------|
| 🔴 OVERPOWERED | Win rate > 35% |
| ⚡ High | Win rate 25-35% (warning) |
| ✅ OK | Win rate within normal range |
| ⚡ Low | Win rate 8-15% (warning) |
| 🔴 UNDERPOWERED | Win rate < 3% |

### Matchup Matrix

Shows win rates for row archetype vs column archetype:

```
| vs  | WAR | DIP | MER | ... |
|-----|-----|-----|-----|-----|
| WAR | -   | 67% | 100%| ... |  <- Warlord beats Merchant 100%
| DIP | 33% | -   | 33% | ... |  <- Diplomat beats Warlord 33%
```

### Key Metrics

- **Win Rate**: Percentage of games won
- **Avg Position**: Average finishing position (1.0 = always wins)
- **Elimination Rate**: How often eliminated before game end
- **Peak Networth**: Highest networth achieved during game
- **Battles Won/Lost**: Combat performance

## Bot Archetypes

| Archetype | Strategy |
|-----------|----------|
| `warlord` | Aggressive military expansion |
| `diplomat` | Alliance-focused, avoids conflict |
| `merchant` | Economic focus, trade-heavy |
| `schemer` | Opportunistic, backstabbing |
| `turtle` | Defensive, high networth |
| `blitzkrieg` | Fast early aggression |
| `tech_rush` | Research priority |
| `opportunist` | Adaptive, exploits weakness |

## Balance Thresholds

Defined in `types.ts`:

```typescript
export const BALANCE_THRESHOLDS = {
  maxWinRate: 0.35,      // FAIL if any archetype > 35%
  minWinRate: 0.03,      // FAIL if any archetype < 3%
  warnHighWinRate: 0.25, // Warning if > 25%
  warnLowWinRate: 0.08,  // Warning if < 8%
};
```

## Reproducibility

Use the `--seed` flag for deterministic results:

```bash
# Run twice with same seed = identical results
npx tsx tests/playthrough/runner.ts quick --seed 12345
npx tsx tests/playthrough/runner.ts quick --seed 12345
```

## Programmatic Usage

```typescript
import { GameHarness, MetricsAggregator, generateMarkdownReport } from "./tests/playthrough";

// Run a single game
const harness = new GameHarness({
  botCount: 4,
  maxTurns: 30,
  seed: 12345,
});
const result = await harness.runGame();

// Aggregate multiple games
const aggregator = new MetricsAggregator();
aggregator.addGame(result);
const stats = aggregator.getAggregatedStats();

// Generate report
const report = generateMarkdownReport(stats, {
  title: "My Balance Report",
  includeMatchups: true,
});
```

## How It Works

The system simulates games entirely in memory:

1. **SeededRandom** - Mulberry32 PRNG for deterministic randomness
2. **InMemoryGameState** - Holds all game state (empires, sectors, treaties)
3. **GameHarness** - Orchestrates turn processing:
   - Economy (production, upkeep)
   - Population (growth/decline)
   - Bot decisions (build, attack, diplomacy)
   - Combat resolution
   - Victory checking
4. **MetricsAggregator** - Collects statistics across games
5. **ReportGenerator** - Formats output

No database required - all state lives in memory, enabling extremely fast execution.

## Performance

Typical performance on modern hardware:
- Quick duel (4 bots, 30 turns): ~1ms
- Standard game (10 bots, 100 turns): ~5ms
- 100 games: ~100ms
- 1000 games: ~1.3 seconds
