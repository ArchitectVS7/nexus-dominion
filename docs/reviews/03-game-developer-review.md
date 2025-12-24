# Pass 3: Game Developer Review

**Date:** December 23, 2024
**Agent:** game-developer
**Agent ID:** a3faf06

## Executive Summary

X-Imperium has a solid strategic foundation with engaging 3-phase combat and multi-resource economy, but faces critical implementation gaps in bot AI decision-making, turn processing performance, and balance testing methodology. The core loop is mechanically sound but lacks progression hooks beyond turn 50.

**Priority**: Define concrete bot decision trees and establish performance budgets before v0.5 MVP.

## Core Loop Analysis

### Engagement Score: 6/10
- Solid for first 30-40 turns
- Risks repetition in mid-game (turns 40-120)

### Monotony Risks

**Turn 40-120 Mid-Game Sag**
- Early expansion complete (~turn 30)
- Victory still distant (~turn 150+)
- No new mechanics unlocked

**Solution: Era-Based Rule Changes**
```
Turn 50:  Black Market unlocks
Turn 100: Coalition mechanics activate
Turn 150: End-game weapons (nukes)
```

### Pacing Recommendations
```
Turns 1-30:   EXPANSION
Turns 31-80:  COMPETITION  ← ADD MECHANICS HERE
Turns 81-150: DOMINATION
Turns 151-200: ENDGAME
```

**Crisis Events** at turns 60, 120, 180:
- Turn 60: Galactic Recession (-30% production)
- Turn 120: Alien Invasion (temporary truces)
- Turn 180: Singularity Event (experimental weapons)

## Combat System Review

### Critical Balance Issues

**Current Formula Problems:**
- Stations TOO dominant (100× multiplier)
- Carrier dominance (20× makes others obsolete)
- Fixed 30% casualty rate (no tactical variety)

### Recommended Formula Revision (v0.5)

```javascript
function calculatePower(fleet, isDefender) {
  let fighters = fleet.fighters * 1;
  let cruisers = fleet.cruisers * 4;  // Reduced from 5
  let carriers = fleet.carriers * 12; // Reduced from 20

  // Diversity bonus - penalty for mono-unit armies
  let powerDiversity = countUnitTypes(fleet) / 3;
  let basePower = fighters + cruisers + carriers;

  if (isDefender) {
    let stations = fleet.stations * 50; // Reduced from 100
    basePower += stations;
    basePower *= 1.2; // Defender advantage
  }

  return basePower * (0.7 + 0.3 * powerDiversity);
}

function calculateLosses(attackPower, defensePower, units) {
  let powerRatio = defensePower / attackPower;
  let baseLossRate = 0.25; // Average 25%

  if (powerRatio > 2) baseLossRate += 0.15;  // Punish bad attacks
  if (powerRatio < 0.5) baseLossRate -= 0.10; // Reward overwhelming force

  return Math.floor(units * baseLossRate * (0.8 + Math.random() * 0.4));
}
```

### Missing Mechanics (v0.5)
1. **Retreat Mechanics** - No mention of fleeing battles
2. **Reinforcement Rules** - Can you send backup mid-battle?
3. **Fog of War** - See enemy composition before attacking?

## AI Bot Architecture

### Tier Distribution Problem

**Current (unbalanced):**
- LLM Elite: 1-2 bots (1%) - Most players never encounter intelligent opponents
- Standard: 50-60 bots (60%) - Majority are boring

**Recommended:**
- LLM Elite: 10 bots (10%) - Player fights 1-2 per game
- Advanced: 30 bots (30%) - Dynamic meta-game
- Standard: 40 bots (40%) - Filler opponents
- Chaotic: 20 bots (20%) - Wildcards

### Performance Analysis

**CRITICAL: 99 bots per turn**

```
Current estimate (sequential):
(10 × 2000ms LLM) + (30 × 100ms) + (40 × 10ms) + (20 × 1ms)
= 23,420ms = 23.4 seconds ← UNACCEPTABLE
```

**Solution: Parallel + No LLM in v0.5**

```javascript
async function processTurn(bots) {
  // Batch 1: Simple bots (parallel)
  let simpleBots = bots.filter(b => b.tier >= 3);
  await Promise.all(simpleBots.map(b => b.processTurn())); // ~100ms

  // Batch 2: Advanced bots (batched parallel)
  let advancedBots = bots.filter(b => b.tier === 2);
  await processInBatches(advancedBots, 5); // ~600ms

  // v0.6+: LLM bots async with "Thinking..." indicator
}
```

**v0.5 Recommendation: No LLM bots**
- Achieves <500ms turn processing
- Add LLM in v0.6 with async processing

### Decision Trees Needed (v0.5)

BOT_ARCHITECTURE.md is too vague. Need concrete implementations:

```javascript
class WarlordBot {
  decideTurnActions(gameState) {
    let actions = [];

    // 70% budget to military
    if (gameState.credits > 1000) {
      actions.push({
        type: 'BUILD_UNITS',
        allocation: { fighters: 0.3, cruisers: 0.4, carriers: 0.3 },
        budget: gameState.credits * 0.7
      });
    }

    // Attack weakest neighbor if 2× power
    let targets = gameState.neighbors.sort((a, b) => a.power - b.power);
    if (targets[0] && gameState.myPower > targets[0].power * 2) {
      actions.push({
        type: 'ATTACK',
        target: targets[0],
        forceCommitment: 0.6
      });
    }

    return actions;
  }
}

class DiplomatBot {
  decideTurnActions(gameState) {
    // 60% budget to economy
    // Seek alliances with strong neighbors
    // Only attack as part of coalition
  }
}

class EconomistBot {
  decideTurnActions(gameState) {
    // 50% budget to research
    // Market manipulation
    // Sabotage strongest neighbor
  }
}
```

### Archetype Differentiation

Need **unique passive abilities**, not just behavior weights:

```javascript
// Warlord: War Economy
// When at war, military production -20% cost

// Diplomat: Trade Network
// Each alliance grants +10% income

// Economist: Market Insight
// Can see next turn's market prices

// Schemer: Shadow Network
// Covert agents -50% cost, +20% success

// Turtle: Fortification Expert
// Defensive structures 2× effectiveness
```

## Economy & Balance

### Dominant Strategy Risks

**1. Carrier Spam Meta**
- Solution: Diversity bonus, carrier nerf to 12×

**2. Turtle + Economic Victory**
- Solution: Passive empire penalty (2% networth loss/turn after 30 turns peace)

**3. Market Manipulation**
- Solution: Purchase limits (10k/resource/turn), price volatility cap (2×)

### Market System (Undefined)

```javascript
class GlobalMarket {
  basePrices = { food: 10, ore: 15, petroleum: 20, research: 50 };

  calculatePrice(resource) {
    let ratio = this.demand[resource] / this.supply[resource];
    let multiplier = Math.log10(ratio) + 1; // 0.1× to 10×
    return Math.floor(this.basePrices[resource] * multiplier);
  }

  // NPC market makers ensure liquidity
  addNPCOrders() {
    // Always buy at 80% market, sell at 120%
  }
}
```

### Snowball Prevention

```javascript
// Progressive Taxation
let maintenanceMultiplier = 1 + (wealthTier * 0.1); // +10% per 100k networth

// Rebellion System
if (empireSize > 20) {
  rebellionRisk += (empireSize - 20) * 0.005; // +0.5% per planet over 20
}

// Catch-Up Mechanics
if (ranking > totalEmpires * 0.75) { // Bottom 25%
  return { productionBonus: 0.25, researchBonus: 0.50 };
}
```

## Victory Conditions

### Redundant Victories
- **Cultural (tourism)** = Economic with different resource
- **Population** = Correlates with economic

### Recommended 6 Victories
1. **Conquest** (60% territory)
2. **Economic** (1.5× second place networth)
3. **Diplomatic** (coalition 50% networth)
4. **Research** (100% tech tree)
5. **Military** (2× second place military)
6. **Survival** (turn 200 timeout)

### Edge Cases

**Simultaneous Victory Resolution:**
```javascript
const VICTORY_PRIORITY = [
  'conquest', 'research', 'diplomatic',
  'economic', 'military', 'survival'
];
```

**Impossible Victory Detection:**
- Warn player when chosen path becomes mathematically impossible
- Offer alternative victory suggestion

**Stalemate Prevention:**
- Turn 180: Check if any victory feasible
- Activate "Sudden Death" - alliances dissolved, last empire standing

## Turn Processing

### Order of Operations (v0.5)

```javascript
async function processTurn(gameState) {
  // PHASE 1: Income (simultaneous)
  await Promise.all(empires.map(e => e.collectIncome()));

  // PHASE 2: Market (sequential)
  gameState.market.processAllOrders();

  // PHASE 3: Bot Decisions (parallel)
  let decisions = await Promise.all(bots.map(b => b.decide()));

  // PHASE 4: Actions (sequential, order matters)
  // 4a. Covert Operations
  // 4b. Diplomatic Actions
  // 4c. Movement Orders
  // 4d. Combat Resolution

  // PHASE 5: Maintenance
  for (let empire of empires) {
    empire.payMaintenance();
    empire.checkRebellions();
  }

  // PHASE 6: Victory Check
  return gameState.checkVictoryConditions();
}
```

### Performance Budget (Optimized)
```
Database reads:       150ms  (single query with joins)
Bot AI processing:   2000ms  (no LLM for v0.5)
Combat resolution:     50ms  (parallelized)
Database writes:      200ms  (batched transactions)
Market calculations:   25ms  (cached prices)
Buffer:               575ms
────────────────────────────
TOTAL:               3000ms  ✓ (under 5s target)
```

## Priority Items

### v0.5 MVP (Weekend Target)

1. **Core Turn Processing Loop** - 6-phase sequence, <3s target
2. **Combat System Foundation** - Revised formulas, retreat mechanics
3. **Bot Decision Trees (3 Archetypes)** - Warlord, Diplomat, Economist
4. **Market System** - Dynamic pricing, NPC makers, limits
5. **Victory Conditions (4 Types)** - Conquest, Economic, Research, Survival

### v0.6 Enhancements

6. Advanced Combat (guerrilla, invasion attrition)
7. Bot Archetype Expansion (Schemer, Turtle, Explorer)
8. Economy Balancing (synergies, taxation, rebellion)
9. Mid-Game Milestones (turn 50/100/150 events)
10. Automated Balance Testing

### v0.7 Advanced

11. LLM Bot Integration (GPT-3.5, async processing)
12. Worker Thread Parallelization
13. Coalition Warfare
14. Wonder System
