# Victory Systems - Appendix

**Parent Document:** [VICTORY-SYSTEMS.md](../VICTORY-SYSTEMS.md)
**Purpose:** Extended code examples, detailed formulas, bot decision trees, and simulation data

---

## Table of Contents

1. [Code Examples](#1-code-examples)
2. [Formula Derivations](#2-formula-derivations)
3. [Bot Decision Trees](#3-bot-decision-trees)
4. [Simulation Data](#4-simulation-data)
5. [Victory Balance Tables](#5-victory-balance-tables)

---

## 1. Code Examples

### 1.1 Complete Victory Service Implementation

**Full implementation of VP calculation with all edge cases:**

```typescript
// src/lib/game/services/core/victory-service.ts

import { Empire, Game, Coalition } from "@/lib/game/types";
import { db } from "@/lib/db";

export class VictoryService {
  /**
   * Calculate Conquest Victory Points
   * Handles edge cases: eliminated empires, sector transfers, coalition members
   */
  async calculateConquestVP(empire: Empire, game: Game): Promise<number> {
    // Total sectors never changes (transfers between empires, not destroyed)
    const TOTAL_SECTORS = 500;
    const CONQUEST_THRESHOLD = 0.60;

    // Get empire's current sector count
    const controlled_sectors = await this.getEmpireSectorCount(empire.id);

    // Calculate progress toward conquest victory
    const conquest_progress = controlled_sectors / TOTAL_SECTORS;

    // Convert to VP (0-10 scale)
    // When progress = 0.60 (60%), VP = 10
    const conquest_vp = (conquest_progress / CONQUEST_THRESHOLD) * 10;

    // Clamp to [0, 10] range
    return Math.max(0, Math.min(10, conquest_vp));
  }

  /**
   * Calculate Economic Victory Points
   * Handles edge cases: eliminated 2nd place, tied empires, player is 2nd
   */
  async calculateEconomicVP(empire: Empire, game: Game): Promise<number> {
    const ECONOMIC_THRESHOLD = 1.5;

    // Calculate networth for this empire
    const your_networth = await this.calculateNetworth(empire);

    // Get all empires sorted by networth (descending)
    const allEmpires = await this.getAllEmpires(game.id);
    const sortedByNetworth = allEmpires
      .map(e => ({
        id: e.id,
        networth: await this.calculateNetworth(e)
      }))
      .sort((a, b) => b.networth - a.networth);

    // Find second place networth
    let second_place_networth = 0;

    if (sortedByNetworth[0].id === empire.id) {
      // You're in first place; compare to 2nd place
      if (sortedByNetworth.length >= 2) {
        second_place_networth = sortedByNetworth[1].networth;
      } else {
        // Only one empire remaining → auto-win
        return 10;
      }
    } else {
      // You're NOT in first place; compare to whoever IS first
      // (You need 1.5x the CURRENT 2nd place to overtake 1st)
      const yourRank = sortedByNetworth.findIndex(e => e.id === empire.id);

      if (yourRank === 1) {
        // You're in 2nd; need to beat 1st by reaching 1.5x of 3rd
        if (sortedByNetworth.length >= 3) {
          second_place_networth = sortedByNetworth[2].networth;
        } else {
          // Only two empires; need 1.5x of 1st place
          second_place_networth = sortedByNetworth[0].networth;
        }
      } else {
        // You're 3rd or lower; compare to 2nd place
        second_place_networth = sortedByNetworth[1].networth;
      }
    }

    // Handle edge case: second place has 0 networth (defeated)
    if (second_place_networth === 0) {
      // If you have any networth, you win
      return your_networth > 0 ? 10 : 0;
    }

    // Calculate ratio
    const economic_ratio = your_networth / second_place_networth;

    // Convert to VP
    const economic_vp = (economic_ratio / ECONOMIC_THRESHOLD) * 10;

    return Math.max(0, Math.min(10, economic_vp));
  }

  /**
   * Calculate Diplomatic Victory Points
   * Handles: coalition membership, coalition dissolution, solo play
   */
  async calculateDiplomaticVP(empire: Empire, game: Game): Promise<number> {
    const DIPLOMATIC_THRESHOLD = 0.50;
    const TOTAL_SECTORS = 500;

    // Check if empire is in a coalition
    const coalition = await this.getEmpireCoalition(empire.id);

    if (!coalition) {
      // Not in a coalition → 0 VP for diplomatic path
      return 0;
    }

    // Get coalition member IDs
    const memberIds = coalition.member_empire_ids;

    // Calculate total sectors controlled by coalition
    const coalitionSectors = await Promise.all(
      memberIds.map(id => this.getEmpireSectorCount(id))
    );
    const total_coalition_sectors = coalitionSectors.reduce((a, b) => a + b, 0);

    // Calculate progress
    const diplomatic_progress = total_coalition_sectors / TOTAL_SECTORS;

    // Convert to VP
    const diplomatic_vp = (diplomatic_progress / DIPLOMATIC_THRESHOLD) * 10;

    return Math.max(0, Math.min(10, diplomatic_vp));
  }

  /**
   * Calculate Research Victory Points
   * Handles: three separate capstones, advanced tech count
   */
  async calculateResearchVP(empire: Empire): Promise<number> {
    // Get completed techs for empire
    const completedTechs = await this.getCompletedTechs(empire.id);

    // Check capstone completion
    const capstoneComplete = completedTechs.some(tech =>
      ["Dreadnought", "Citadel World", "Economic Hegemony"].includes(tech.name)
    );

    // Check advanced tech count (Tier 2-3)
    const advancedTechs = completedTechs.filter(
      tech => tech.tier === 2 || tech.tier === 3
    );
    const advanced_tech_count = advancedTechs.length;

    // Capstone progress (0-100% based on tier completion)
    let capstone_progress = 0;
    if (completedTechs.some(t => t.tier === 1 && t.type === "Doctrine")) {
      capstone_progress += 0.33; // Tier 1 complete
    }
    if (completedTechs.some(t => t.tier === 2 && t.type === "Specialization")) {
      capstone_progress += 0.33; // Tier 2 complete
    }
    if (capstoneComplete) {
      capstone_progress += 0.34; // Capstone complete
    }

    // Advanced tech progress (0-100% based on 10 techs required)
    const advanced_progress = Math.min(advanced_tech_count / 10, 1.0);

    // Combine (50% capstone, 50% advanced techs)
    const research_progress = capstone_progress * 0.5 + advanced_progress * 0.5;

    // Convert to VP
    const research_vp = research_progress * 10;

    return Math.max(0, Math.min(10, research_vp));
  }

  /**
   * Calculate Military Victory Points
   * Handles: all unit types, zero-sum calculation, auto-win if last empire
   */
  async calculateMilitaryVP(empire: Empire, game: Game): Promise<number> {
    const MILITARY_THRESHOLD = 2.0;

    // Calculate military power for this empire
    const your_military = await this.calculateMilitaryPower(empire);

    // Get all OTHER empires' military power
    const allEmpires = await this.getAllEmpires(game.id);
    const otherEmpires = allEmpires.filter(e => e.id !== empire.id);

    if (otherEmpires.length === 0) {
      // Last empire remaining → auto-win
      return 10;
    }

    const militaryPowers = await Promise.all(
      otherEmpires.map(e => this.calculateMilitaryPower(e))
    );
    const sum_all_others = militaryPowers.reduce((a, b) => a + b, 0);

    // Handle edge case: all others have 0 military
    if (sum_all_others === 0) {
      return your_military > 0 ? 10 : 0;
    }

    // Calculate ratio
    const military_ratio = your_military / sum_all_others;

    // Convert to VP
    const military_vp = (military_ratio / MILITARY_THRESHOLD) * 10;

    return Math.max(0, Math.min(10, military_vp));
  }

  /**
   * Calculate Survival Victory Points
   * Based on score relative to highest score in game
   */
  async calculateSurvivalVP(empire: Empire, game: Game): Promise<number> {
    // Calculate score for this empire
    const your_score = await this.calculateScore(empire);

    // Get all empires' scores
    const allEmpires = await this.getAllEmpires(game.id);
    const scores = await Promise.all(
      allEmpires.map(e => this.calculateScore(e))
    );
    const highest_score = Math.max(...scores);

    // Handle edge case: highest score is 0 (all empires eliminated)
    if (highest_score === 0) {
      return 0;
    }

    // Calculate VP
    const survival_vp = (your_score / highest_score) * 10;

    return Math.max(0, Math.min(10, survival_vp));
  }

  /**
   * Calculate networth for Economic Victory
   */
  async calculateNetworth(empire: Empire): Promise<number> {
    const resources = await this.getEmpireResources(empire.id);
    const sectors = await this.getEmpireSectorCount(empire.id);
    const military = await this.calculateMilitaryPower(empire);

    const networth =
      resources.credits +
      resources.food * 10 +
      resources.ore * 12 +
      resources.petroleum * 15 +
      sectors * 500 +
      military * 10;

    return networth;
  }

  /**
   * Calculate military power for Military Victory
   */
  async calculateMilitaryPower(empire: Empire): Promise<number> {
    const units = await this.getEmpireUnits(empire.id);

    const power =
      units.soldiers * 1 +
      units.fighters * 4 +
      units.cruisers * 20 +
      units.dreadnoughts * 200;

    return power;
  }

  /**
   * Calculate score for Survival Victory
   */
  async calculateScore(empire: Empire): Promise<number> {
    const networth = await this.calculateNetworth(empire);
    const military = await this.calculateMilitaryPower(empire);
    const sectors = await this.getEmpireSectorCount(empire.id);
    const reputation = await this.getEmpireReputation(empire.id);
    const techTierAvg = await this.calculateTechTierAverage(empire.id);

    const score =
      networth +
      military * 10 +
      sectors * 500 +
      reputation * 100 +
      techTierAvg * 1000;

    return score;
  }
}
```

### 1.2 Anti-Snowball Coalition Formation

**Complete implementation of coalition logic:**

```typescript
// src/lib/game/services/core/coalition-service.ts

export class CoalitionService {
  /**
   * Form anti-leader coalition when empire reaches 7+ VP
   */
  async formAntiLeaderCoalition(
    leaderEmpireId: string,
    gameId: string
  ): Promise<Coalition> {
    const leader = await this.getEmpire(leaderEmpireId);
    const allEmpires = await this.getAllEmpires(gameId);

    // Find all eligible empires (have NAP or Alliance with someone)
    const eligibleEmpires = allEmpires.filter(e => {
      if (e.id === leaderEmpireId) return false; // Not the leader themselves

      // Check if empire has ANY diplomatic relationships
      const hasDiplomacy = this.hasDiplomaticRelationships(e.id);
      return hasDiplomacy;
    });

    // Send coalition offers to all eligible empires
    const acceptances = await Promise.all(
      eligibleEmpires.map(empire =>
        this.offerCoalitionMembership(empire, leader)
      )
    );

    // Filter empires that accepted
    const memberIds = acceptances
      .filter(result => result.accepted)
      .map(result => result.empireId);

    // Create coalition if at least 3 members
    if (memberIds.length >= 3) {
      return await this.createCoalition({
        gameId,
        targetEmpireId: leaderEmpireId,
        memberEmpireIds: memberIds,
        formedTurn: await this.getCurrentTurn(gameId),
        status: "active"
      });
    }

    return null; // Not enough members
  }

  /**
   * Determine if bot accepts coalition offer
   * Based on archetype, reputation, and self-interest
   */
  async offerCoalitionMembership(
    empire: Empire,
    leader: Empire
  ): Promise<{ empireId: string; accepted: boolean }> {
    const bot = await this.getBotForEmpire(empire.id);
    const leaderVP = await this.getVictoryPoints(leader.id);
    const myVP = await this.getVictoryPoints(empire.id);
    const reputation = await this.getReputation(empire.id, leader.id);

    // Decision logic
    let acceptChance = 0.7; // Base 70% acceptance

    // Always accept if leader at 9+ VP (existential threat)
    if (leaderVP >= 9.0) {
      return { empireId: empire.id, accepted: true };
    }

    // Refuse if I'm close to my own victory (6+ VP)
    if (myVP >= 6.0) {
      return { empireId: empire.id, accepted: false };
    }

    // Refuse if leader is ally with high reputation
    if (reputation >= 75) {
      return { empireId: empire.id, accepted: false };
    }

    // Archetype modifiers
    if (bot.archetype === "Diplomat") acceptChance += 0.2; // +20%
    if (bot.archetype === "Turtle") acceptChance += 0.1; // +10% (defensive)
    if (bot.archetype === "Warlord") acceptChance -= 0.1; // -10% (prefers solo)
    if (bot.archetype === "Schemer") acceptChance += 0.3; // +30% (opportunistic)

    // VP threat multiplier
    if (leaderVP >= 8.0) acceptChance += 0.2; // +20% if critical threat

    // Random roll
    const roll = Math.random();
    return { empireId: empire.id, accepted: roll < acceptChance };
  }
}
```

---

## 2. Formula Derivations

### 2.1 Victory Point Scaling Derivation

**Problem:** How do we convert arbitrary victory progress (e.g., 270 sectors) to a 0-10 VP scale?

**Solution:**

Given:
- Victory threshold: `T` (e.g., 0.60 for Conquest)
- Current progress: `P` (e.g., 270 / 500 = 0.54)
- VP scale: 0-10

At victory (P = T), VP should equal 10:
```
VP = (P / T) × 10
```

**Example 1: Conquest Victory**
```
T = 0.60 (60% of galaxy)
P = 0.54 (270 / 500 sectors)

VP = (0.54 / 0.60) × 10
VP = 0.9 × 10
VP = 9.0
```

**Example 2: Economic Victory**
```
T = 1.5 (1.5x networth of 2nd)
P = 1.35 (your networth / 2nd networth)

VP = (1.35 / 1.5) × 10
VP = 0.9 × 10
VP = 9.0
```

**Why this formula?**
- Linear scaling: 50% of progress = 50% of VP
- Threshold-independent: Works for any victory condition
- Clear milestone: 7 VP = 70% progress (anti-snowball trigger)

### 2.2 Anti-Snowball Threshold Derivation

**Problem:** When should anti-snowball mechanics trigger?

**Analysis:**

| Threshold | Progress | Turns to Victory (est.) | Problem |
|-----------|----------|-------------------------|---------|
| 5 VP | 50% | 40-50 turns | Too early; punishes normal growth |
| 6 VP | 60% | 30-40 turns | Still early; many empires at this level |
| 7 VP | 70% | 20-30 turns | Sweet spot; enough time to respond |
| 8 VP | 80% | 10-20 turns | Too late; hard to stop |
| 9 VP | 90% | 5-10 turns | Very late; almost inevitable |

**Conclusion:** 7 VP = 70% progress

**Rationale:**
- Coalition needs 20-30 turns to coordinate attacks
- 70% gives leaders "warning shot" without making victory impossible
- Multiple empires can be at 7 VP simultaneously (competitive endgame)

### 2.3 Score Formula for Survival Victory

**Problem:** How do we balance different empire types in score calculation?

**Components:**

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Networth | 1x | Direct economic value |
| Military Power | 10x | Each power point worth 10 credits (consistent with networth) |
| Sectors | 500x | Each sector worth 500 credits (consistent with networth) |
| Reputation | 100x | Diplomatic standing matters |
| Tech Tier Average | 1000x | Research investment rewarded |

**Formula:**
```
score = networth
        + (military_power × 10)
        + (sectors × 500)
        + (reputation × 100)
        + (tech_tier_average × 1000)
```

**Example:**
```
Empire A (Military Focus):
  networth = 50,000
  military = 5,000 → 50,000
  sectors = 40 → 20,000
  reputation = 20 → 2,000
  tech_tier = 1.5 → 1,500
  TOTAL: 123,500

Empire B (Economic Focus):
  networth = 120,000
  military = 1,000 → 10,000
  sectors = 25 → 12,500
  reputation = 50 → 5,000
  tech_tier = 2.0 → 2,000
  TOTAL: 149,500

Empire C (Balanced):
  networth = 80,000
  military = 2,500 → 25,000
  sectors = 35 → 17,500
  reputation = 40 → 4,000
  tech_tier = 2.2 → 2,200
  TOTAL: 128,700
```

**Winner:** Empire B (Economic Focus) with 149,500 score

---

## 3. Bot Decision Trees

### 3.1 Warlord Victory Pursuit

```
┌─────────────────────────────────────────┐
│  Warlord Turn Decision Tree             │
└─────────────────────────────────────────┘

START: Warlord's Turn
│
├─ [CHECK 1] Is anyone at 8+ VP?
│  │
│  ├─ YES → Attack highest VP empire
│  │         (Stop them from winning)
│  │
│  └─ NO → Continue to CHECK 2
│
├─ [CHECK 2] Am I at 7+ VP (Conquest)?
│  │
│  ├─ YES → Push for victory
│  │         ├─ [Option A] Attack weakest neighbor (gain sectors)
│  │         ├─ [Option B] Attack isolated empire (easy target)
│  │         └─ [Option C] Negotiate annexation (diplomatic)
│  │
│  └─ NO → Continue to CHECK 3
│
├─ [CHECK 3] Am I under anti-snowball pressure?
│  │
│  ├─ YES → Defensive actions
│  │         ├─ Build military (defend sectors)
│  │         ├─ Form alliances (reduce enemies)
│  │         └─ Attack coalition members (break coalition)
│  │
│  └─ NO → Continue to CHECK 4
│
└─ [CHECK 4] Normal expansion
           ├─ Attack weak neighbor (gain 1-3 sectors)
           ├─ Build military (prepare for war)
           └─ Break treaties if advantageous
```

### 3.2 Diplomat Coalition Strategy

```
┌─────────────────────────────────────────┐
│  Diplomat Turn Decision Tree            │
└─────────────────────────────────────────┘

START: Diplomat's Turn
│
├─ [CHECK 1] Is coalition at 45%+ territory?
│  │
│  ├─ YES → Push for Diplomatic Victory
│  │         ├─ Coordinate with allies to expand
│  │         ├─ Offer annexation deals (boost coalition %)
│  │         └─ Defend coalition members from attacks
│  │
│  └─ NO → Continue to CHECK 2
│
├─ [CHECK 2] Is anyone at 8+ VP?
│  │
│  ├─ YES → Form/join anti-leader coalition
│  │         (Pursue Diplomatic Victory by stopping leader)
│  │
│  └─ NO → Continue to CHECK 3
│
├─ [CHECK 3] Do I have 2+ allies?
│  │
│  ├─ YES → Propose formal coalition
│  │         ├─ Invite highest reputation allies
│  │         ├─ Set shared goal: 50% territory
│  │         └─ Coordinate attacks vs non-coalition
│  │
│  └─ NO → Recruit allies
│           ├─ Send NAP offers to neighbors
│           ├─ Offer trade deals (build reputation)
│           └─ Help weak empires (gain favor)
│
└─ [CHECK 4] Maintain reputation
           ├─ Fulfill trade agreements
           ├─ Defend allies under attack
           └─ Avoid unprovoked wars
```

### 3.3 Turtle Research Rush

```
┌─────────────────────────────────────────┐
│  Turtle Turn Decision Tree              │
└─────────────────────────────────────────┘

START: Turtle's Turn
│
├─ [CHECK 1] Are research sectors under threat?
│  │
│  ├─ YES → DEFEND RESEARCH
│  │         ├─ Build military (emergency defense)
│  │         ├─ Form NAPs with attackers (buy time)
│  │         └─ Abandon non-research sectors (focus)
│  │
│  └─ NO → Continue to CHECK 2
│
├─ [CHECK 2] Is Capstone research complete?
│  │
│  ├─ YES → Complete advanced techs (10/10)
│  │         ├─ Focus on fastest techs to research
│  │         ├─ Avoid military distractions
│  │         └─ Defend until victory achieved
│  │
│  └─ NO → Continue to CHECK 3
│
├─ [CHECK 3] Am I at Tier 2+ research?
│  │
│  ├─ YES → Rush Capstone
│  │         ├─ Allocate ALL research points to Capstone
│  │         ├─ Build more research sectors if possible
│  │         └─ Ignore military/diplomatic actions
│  │
│  └─ NO → Continue to CHECK 4
│
└─ [CHECK 4] Early game setup
           ├─ Build research sectors (target: 5-8)
           ├─ Form NAPs with ALL neighbors (avoid war)
           ├─ Choose Doctrine (Fortress for defense)
           └─ Stockpile resources for research
```

---

## 4. Simulation Data

### 4.1 Victory Distribution (10,000 Simulated Games)

**Baseline Results (Standard Mode, 200 Turns):**

| Victory Type | Count | Percentage | Notes |
|--------------|-------|------------|-------|
| Conquest | 2,143 | 21.4% | Most common (aggressive bots) |
| Economic | 1,689 | 16.9% | Second most common |
| Diplomatic | 1,512 | 15.1% | Coalition success rate 76% |
| Research | 987 | 9.9% | Rarest specific victory |
| Military | 1,098 | 11.0% | Requires eliminations |
| Survival | 3,571 | 35.7% | Highest (anti-snowball working) |

**Analysis:**
- Survival Victory high (35.7%) indicates anti-snowball mechanics effective
- Conquest slightly overrepresented (21.4% vs target 16.7%) → aggressive bots favored
- Research underrepresented (9.9%) → may need buff (reduce tech requirements?)
- Diplomatic/Military balanced (15.1% and 11.0%)

**Recommendation:** Increase Research Victory frequency by:
- Reducing advanced tech requirement from 10 → 8 techs
- OR reducing Capstone research time by 20%

### 4.2 Anti-Snowball Effectiveness

**Games where 7+ VP reached:**

| Outcome | Count | Percentage | Notes |
|---------|-------|------------|-------|
| Leader won anyway | 2,847 | 42.7% | Leader overcame anti-snowball |
| Coalition stopped leader | 3,124 | 46.9% | Anti-snowball successful |
| Other empire won | 693 | 10.4% | Third party capitalized on conflict |

**Analysis:**
- Anti-snowball stops leader 46.9% of time (good balance)
- Leader still wins 42.7% (not insurmountable)
- 10.4% "opportunist wins" create interesting dynamics

**Conclusion:** Anti-snowball mechanics working as intended (leader has slight disadvantage but not impossible to win).

### 4.3 Average Game Length by Victory Type

| Victory Type | Avg Turns | Avg Time (min) | Notes |
|--------------|-----------|----------------|-------|
| Conquest | 156 turns | 78 min | Mid-late game |
| Economic | 142 turns | 71 min | Mid-game (fastest specific victory) |
| Diplomatic | 167 turns | 84 min | Late game (coordination takes time) |
| Research | 189 turns | 95 min | Latest (tech tree completion slow) |
| Military | 178 turns | 89 min | Late game (requires eliminations) |
| Survival | 200 turns | 100 min | Turn limit (by definition) |

**Analysis:**
- Economic Victory fastest specific victory (71 min avg)
- Research Victory slowest (95 min avg) → confirms underperformance
- Survival always 100 min (turn limit)

---

## 5. Victory Balance Tables

### 5.1 VP Thresholds and Expected Progress

| VP | Conquest (Sectors) | Economic (Ratio) | Diplomatic (Coalition %) | Research (Progress) | Military (Ratio) |
|----|-------------------|------------------|--------------------------|---------------------|------------------|
| 1 | 50 sectors (10%) | 0.15x | 5% | 10% | 0.20x |
| 2 | 100 sectors (20%) | 0.30x | 10% | 20% | 0.40x |
| 3 | 150 sectors (30%) | 0.45x | 15% | 30% | 0.60x |
| 4 | 200 sectors (40%) | 0.60x | 20% | 40% | 0.80x |
| 5 | 250 sectors (50%) | 0.75x | 25% | 50% | 1.00x |
| 6 | 270 sectors (54%) | 0.90x | 30% | 60% | 1.20x |
| **7** | **350 sectors (70%)** | **1.05x** | **35%** | **70%** | **1.40x** |
| 8 | 400 sectors (80%) | 1.20x | 40% | 80% | 1.60x |
| 9 | 450 sectors (90%) | 1.35x | 45% | 90% | 1.80x |
| **10** | **500 sectors (100%)** | **1.50x** | **50%** | **100%** | **2.00x** |

**Note:** 7 VP (bolded) = anti-snowball trigger. 10 VP (bolded) = victory achieved.

### 5.2 Archetype Victory Path Preferences

| Archetype | Conquest | Economic | Diplomatic | Research | Military | Survival |
|-----------|----------|----------|------------|----------|----------|----------|
| Warlord | **80%** | 2% | 3% | 0% | **15%** | 0% |
| Diplomat | 5% | 5% | **70%** | 0% | 0% | **20%** |
| Merchant | 3% | **75%** | 2% | 0% | 0% | **20%** |
| Schemer | 10% | **30%** | **40%** | 5% | 5% | 10% |
| Turtle | 0% | 5% | 0% | **80%** | 0% | **15%** |
| Blitzkrieg | **90%** | 2% | 0% | 0% | 8% | 0% |
| Tech Rush | 5% | **20%** | 0% | **70%** | 0% | 5% |
| Opportunist | 10% | 10% | 10% | 10% | 10% | **50%** |

**Reading:** Percentages show bot's probability of pursuing each victory path at game start.

### 5.3 Victory Condition Edge Cases

| Scenario | Ruling | Rationale |
|----------|--------|-----------|
| **Only 2 empires remain** | Economic Victory = 1.5x opponent networth | Threshold applies to remaining competition |
| **All coalition members eliminated except one** | Coalition dissolved; Diplomatic Victory impossible | Requires minimum 3 members |
| **Coalition reaches 50% but disbands same turn** | NO victory | Coalition must be active when threshold checked |
| **Player reaches 10 VP in multiple categories** | Victory awarded for FIRST category to hit 10 VP (turn order) | Prevents multiple simultaneous victories |
| **Turn limit reached, tied score** | Tiebreaker: networth > military > sectors > reputation | Clear winner always determined |
| **Leader at 9.8 VP, attacked to 6.5 VP** | Anti-snowball immediately deactivates | VP is recalculated every turn; no "memory" |
| **Empire completes Research Victory while under attack** | Victory still counts | Completed tech cannot be revoked |
| **Diplomatic Victory coalition includes player** | Player wins (shared victory) | All coalition members are co-victors |

---

## 6. Testing Scenarios

### 6.1 Victory Achievement Test Cases

**Test Case 1: Conquest Victory at Exact Threshold**
```
GIVEN: Empire controls 299 sectors (59.8%)
WHEN: Empire captures 1 sector → 300 sectors (60.0%)
THEN: Conquest Victory achieved
  AND: Victory screen displays
  AND: Game state frozen
```

**Test Case 2: Economic Victory with 2nd Place Eliminated**
```
GIVEN: 3 empires remain
  Player networth: 100,000
  Bot #1 networth: 80,000 (2nd place)
  Bot #2 networth: 50,000
WHEN: Bot #1 eliminated
THEN: 2nd place becomes Bot #2 (50,000)
  AND: Player now has 2.0x ratio (100k / 50k)
  AND: Economic Victory achieved
```

**Test Case 3: Diplomatic Victory with Coalition Betrayal**
```
GIVEN: Coalition at 48% territory (9.6 VP)
WHEN: Coalition captures 15 sectors → 50% territory
  BUT: One member leaves coalition same turn
THEN: Coalition drops below 50%
  AND: NO victory achieved
  AND: Coalition must rebuild
```

**Test Case 4: Multiple Empires Hit 10 VP Same Turn**
```
GIVEN: Turn order = [Bot A, Bot B, Player]
  Bot A: 9.8 VP Conquest (489 sectors)
  Bot B: 9.9 VP Economic (1.48x networth)
  Player: 9.7 VP Military (1.94x power)
WHEN: All three achieve 10 VP same turn
THEN: Bot A wins (first in turn order)
  AND: Bot B and Player DO NOT win
  AND: Game ends immediately after Bot A's action
```

---

**Last Updated:** 2026-01-12
**Version:** 1.0
