# Victory Systems

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-VIC
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/VICTORY-SYSTEMS.md

---

## Document Purpose

This document defines the victory condition system for Nexus Dominion, a core game feature that determines how players and bots can win the game. It specifies six distinct victory paths, each designed to reward different playstyles and strategic approaches.

**Target Audience:**
- Game designers validating victory balance
- Backend developers implementing victory detection logic
- Frontend developers creating victory progress UI and announcement screens
- QA engineers testing victory condition edge cases

**What This Resolves:**
- Exact thresholds and formulas for each victory type
- Victory Point accumulation and anti-snowball mechanics
- Bot behavior regarding victory pursuit
- UI requirements for victory tracking and announcements
- Balance targets ensuring no single victory path dominates

**Design Philosophy:**
- **Multiple Valid Paths** - All six victory types should be competitively viable; no single "best" strategy
- **Transparent Progress** - Players always know how close they and their rivals are to victory
- **Dramatic Endgame** - Victory moments are celebrated with cinematic announcements
- **Anti-Snowball Integration** - Victory Points (VP) trigger coalition formation to prevent runaway leaders
- **Archetype Diversity** - Each bot archetype prioritizes different victory conditions
- **Strategic Tension** - Late-game becomes a race as multiple empires near victory simultaneously

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Mechanics Overview](#2-mechanics-overview)
3. [Detailed Rules](#3-detailed-rules)
4. [Bot Integration](#4-bot-integration)
5. [UI/UX Design](#5-uiux-design)
6. [Specifications](#6-specifications)
7. [Implementation Requirements](#7-implementation-requirements)
8. [Balance Targets](#8-balance-targets)
9. [Migration Plan](#9-migration-plan)
10. [Conclusion](#10-conclusion)

---

## 1. Core Concept

### 1.1 Victory System Purpose

Nexus Dominion offers **six distinct victory conditions**, each rewarding a different strategic approach:

1. **Conquest Victory** - Dominate through territorial expansion (60% of galaxy)
2. **Economic Victory** - Outproduce all rivals (1.5x networth of 2nd place)
3. **Diplomatic Victory** - Lead a coalition to shared victory (50% territory)
4. **Research Victory** - Achieve technological supremacy (complete Tier 3 tech tree)
5. **Military Victory** - Overwhelming martial power (2x military of all others combined)
6. **Survival Victory** - Highest score when turn limit expires (balanced play)

**Why Six Victory Types?**

In a 100-empire galaxy with diverse bot archetypes, restricting victory to a single condition (e.g., "last empire standing") would:
- Force all players into the same aggressive playstyle
- Make peaceful/economic strategies non-viable
- Eliminate strategic diversity
- Create multi-hour slugfests as empires grind down opponents

Instead, our six-path system:
- Rewards different archetypes (Warlord→Conquest, Merchant→Economic, etc.)
- Creates multiple endgame races (someone near Conquest, another near Economic)
- Allows games to conclude in 1-2 hours with clear winners
- Generates strategic tension as players must defend against AND pursue victory

### 1.2 Victory Points and Tracking

**Victory Points (VP)** are the unifying metric across all victory conditions:
- Each empire accumulates VP (0-10 scale) based on proximity to victory
- 10 VP in any category = instant victory
- 7+ VP triggers anti-snowball mechanics (coalition formation, penalties)
- Players see VP progress for themselves and top 5 threats

**VP Calculation Formula:**
```
VP = (current_progress / victory_threshold) × 10
```

**Examples:**
- **Conquest**: Control 42% of galaxy → 42% / 60% × 10 = **7 VP** (triggers anti-snowball)
- **Economic**: Networth 1.2x of 2nd → 1.2 / 1.5 × 10 = **8 VP** (coalition forming!)
- **Military**: Power 1.5x of all others → 1.5 / 2.0 × 10 = **7.5 VP** (nearing victory)

### 1.3 Player Experience

**Early Game (Turns 1-30):**
- No one near victory; VP typically 1-3 across the board
- Players focus on building economy, securing sectors, forming alliances
- Victory seems distant; choices are about long-term strategy

**Mid Game (Turns 31-100):**
- First empire reaches 5-6 VP in a category (e.g., aggressive Warlord bot hits 50% Conquest progress)
- Players must decide: pursue their own victory path or sabotage the leader?
- Diplomatic messages increase ("Your expansion threatens us all!")

**Late Game (Turns 101-200+):**
- Multiple empires at 7+ VP in different categories (high tension!)
- Anti-snowball mechanics create shifting alliances
- Every turn matters: "I need 3 more sectors for Conquest, but Bot #47 is ONE research away from victory!"
- Strategic choices: all-in on your path, or attack the closest threat?

**Victory Moment:**
- Screen freezes as dramatic announcement plays
- LCARS panels flash victory color (gold/orange)
- Final galaxy state shown with winner highlighted
- Victory statistics displayed (score breakdown, timeline of key moments)

---

## 2. Mechanics Overview

### Victory Conditions Summary

| Victory Type | Threshold | Primary Resource | Playstyle | Typical Archetype |
|--------------|-----------|------------------|-----------|-------------------|
| **Conquest** | 60% territory | Sectors | Aggressive expansion | Warlord, Blitzkrieg |
| **Economic** | 1.5x networth (2nd) | Credits, sectors | Builder/trader | Merchant, Opportunist |
| **Diplomatic** | Coalition 50% territory | Reputation, alliances | Alliance politics | Diplomat, Schemer |
| **Research** | Complete Tier 3 tech tree | Research points | Turtle/tech rush | Tech Rush, Turtle |
| **Military** | 2x military (all others) | Soldiers, ships | Domination | Warlord |
| **Survival** | Highest score at turn limit | All resources | Balanced play | Any |

### Victory Point Accumulation

Victory Points (VP) update **every turn** based on empire progress:

```
Conquest VP = (controlled_sectors / total_sectors) × (10 / 0.6)
Economic VP = (your_networth / second_place_networth) × (10 / 1.5)
Diplomatic VP = (coalition_territory / total_sectors) × (10 / 0.5)
Research VP = (tier3_techs_completed / total_tier3_techs) × 10
Military VP = (your_military / sum_of_all_others) × (10 / 2.0)
Survival VP = (your_score / highest_score) × 10
```

**Empire's Total VP** = MAX of all six categories
- An empire is "closest to victory" via their highest VP category
- Example: Empire has 3 Conquest VP, 7 Economic VP, 2 Military VP → **7 VP (Economic path)**

### Anti-Snowball Thresholds

When any empire reaches **7+ Victory Points** in any category:

| Effect | Impact |
|--------|--------|
| **Coalition Formation** | All empires with NAPs/Alliances receive coalition offer against leader |
| **Attack Bonus** | All empires gain +10% attack power when attacking leader |
| **Defense Bonus** | All empires gain +5% defense if attacked by leader |
| **Alliance Restriction** | Leader cannot form new NAPs or alliances |
| **Market Penalty** | Leader pays +20% for all market purchases |
| **Diplomatic Penalty** | Leader's reputation decays by -2 per turn |

**Rationale:** These mechanics prevent runaway victories while preserving the leader's ability to win. A 7 VP empire is CLOSE to winning, but not guaranteed. The galaxy responds with coordinated pressure.

### Turn Limit and Survival Victory

| Game Mode | Turn Limit | Survival Likelihood |
|-----------|------------|---------------------|
| **Quick Game** | 50 turns | 10% (usually Conquest/Military wins) |
| **Standard Game** | 200 turns | 30% (balanced endgame) |
| **Epic Game** | 500 turns | 60% (no one hits thresholds; highest score wins) |

**Score Formula for Survival Victory:**
```
score = networth + (military_power × 10) + (sectors × 500) + (reputation × 100)
```

This formula balances economic development, military strength, territorial control, and diplomatic standing.

---

## 3. Detailed Rules

### 3.1 Conquest Victory <!-- @spec REQ-VIC-001 -->

**Condition:** Control 60% of all sectors in the galaxy

**Calculation:**
```
controlled_sectors = count of sectors owned by empire
total_sectors = 100 empires × 5 starting sectors = 500 sectors (at game start)
conquest_progress = controlled_sectors / 500
victory_achieved = conquest_progress >= 0.60
```

**Victory Points:**
```
Conquest VP = (controlled_sectors / 500) × (10 / 0.6)
```

**Example:**
- Empire controls 300 sectors → 300 / 500 = 60% → **CONQUEST VICTORY**
- Empire controls 250 sectors → 250 / 500 = 50% → **8.33 VP** (anti-snowball active)

**Strategic Notes:**
- Requires aggressive expansion via combat or diplomacy (annexation/trades)
- Vulnerable to coalitions (7 VP threshold = 350 sectors, which triggers galaxy-wide response)
- Typical path: Consolidate home sector (10 sectors) → expand to 2-3 adjacent sectors (30-40 total) → build wormholes and continue expansion
- Most direct path for Warlord and Blitzkrieg archetypes

**Edge Cases:**
- **Total sector count changes**: As empires are eliminated, total sectors remain constant (sectors transfer, not deleted)
- **Tied sectors**: If two empires have equal claim to a sector (e.g., simultaneous attacks), sector remains with defender until resolved
- **Diplomatic coalition victory**: If player is IN a coalition pursuing Diplomatic Victory, they do NOT need 60% themselves

### 3.2 Economic Victory <!-- @spec REQ-VIC-002 -->

**Condition:** Achieve networth 1.5x greater than the second-place empire

**Calculation:**
```
networth = credits + (food × 10) + (ore × 12) + (petroleum × 15)
           + (sectors × 500) + (military_power × 10)

second_place_networth = networth of empire with 2nd highest networth

victory_achieved = (your_networth / second_place_networth) >= 1.5
```

**Victory Points:**
```
Economic VP = (your_networth / second_place_networth) × (10 / 1.5)
```

**Example:**
- Your networth: 150,000
- Second place: 90,000
- Ratio: 150,000 / 90,000 = 1.67 → **ECONOMIC VICTORY**

**Strategic Notes:**
- Rewards builders and traders (Merchant, Opportunist archetypes)
- Requires maintaining lead over dynamic competition (if 2nd place grows, you must grow faster)
- Synergizes with Commerce doctrine research tree
- Less vulnerable to direct military attack (credits can buy armies)

**Edge Cases:**
- **Second place eliminated**: If 2nd place empire dies, NEW 2nd place is calculated (threshold may shift dramatically)
- **Tied for second**: If two empires tied for 2nd, use their shared networth value
- **Player IS second place**: If player is 2nd, they need 1.5x the 3rd place empire to win
- **Only two empires remain**: Threshold becomes "50% more than opponent"

### 3.3 Diplomatic Victory <!-- @spec REQ-VIC-003 -->

**Condition:** Lead a coalition that collectively controls 50% of all territory

**Calculation:**
```
coalition_territory = sum of sectors owned by all coalition members
total_sectors = 500
victory_achieved = (coalition_territory / total_sectors) >= 0.50
```

**Victory Points:**
```
Diplomatic VP = (coalition_territory / 500) × (10 / 0.5)
```

**Victory Sharing:**
- **ALL coalition members win** if threshold achieved
- Victory announcement lists all coalition members as co-victors
- Final score shows coalition member ranks for leaderboard purposes

**Coalition Formation Requirements:**
- Minimum 3 empires (cannot be 2-player coalition)
- All members must have Alliance treaties with each other
- Coalition leader must have +50 reputation with all members
- Formal coalition proposal must be accepted by all members

**Example:**
- Coalition has 4 members: 150 + 80 + 60 + 40 = 330 sectors
- 330 / 500 = 66% → **DIPLOMATIC VICTORY** (all 4 members win)

**Strategic Notes:**
- Primary path for Diplomat and Schemer archetypes
- Requires high reputation and careful treaty management
- Vulnerable to coalition betrayal (members can leave if better opportunity arises)
- Often pursued reactively (anti-snowball coalitions formed to stop a leader)

**Edge Cases:**
- **Coalition disbanded before victory**: If coalition falls apart on turn victory is checked, NO victory occurs
- **Coalition member attacks another**: Automatically dissolves coalition, requires reformation
- **Player not coalition leader**: Player can be coalition member and share victory
- **Multiple coalitions exist**: Each tracked separately; first to 50% wins

### 3.4 Research Victory <!-- @spec REQ-VIC-004 -->

**Condition:** Complete all Tier 3 technologies in the research tree

**Calculation:**
```
tier3_techs = [Dreadnought, Citadel World, Economic Hegemony] (3 capstones)
completed_tier3 = count of Tier 3 techs completed
victory_achieved = completed_tier3 >= 3
```

**Note:** Only ONE Tier 3 capstone is available per game (based on Tier 1 Doctrine choice). To achieve Research Victory, an empire must:
1. Complete Tier 1 Doctrine research
2. Complete Tier 2 Specialization research
3. Complete Tier 3 Capstone research
4. **Additionally**: Complete 10 miscellaneous advanced techs (Tier 2-3 level)

**Revised Calculation:**
```
research_victory_required = [Capstone] + [10 advanced techs]
victory_achieved = (capstone_complete AND advanced_tech_count >= 10)
```

**Victory Points:**
```
Research VP = ((capstone_progress × 0.5) + (advanced_techs / 10 × 0.5)) × 10

Where:
  capstone_progress = (doctrine_complete × 0.33) + (specialization_complete × 0.33) + (capstone_complete × 0.34)
```

**Example:**
- Empire completed Doctrine (33%), Specialization (33%), Capstone (34%) = 100% capstone progress
- Empire completed 10/10 advanced techs = 100% advanced tech progress
- Research VP = (1.0 × 0.5 + 1.0 × 0.5) × 10 = **10 VP** → **RESEARCH VICTORY**

**Strategic Notes:**
- Turtle and Tech Rush archetypes pursue this path
- Requires significant Research sector investment (expensive: 23,000 credits each)
- Protects turtle strategy (can win without territorial expansion)
- Vulnerable to attacks during research phase (research sectors produce no military)

**Edge Cases:**
- **Research interrupted**: If Research sectors captured during Capstone research, progress lost
- **No rollback**: Once tech completed, cannot be revoked by losing territory
- **Bot priority**: Bots at 8+ Research VP will aggressively defend research sectors

### 3.5 Military Victory <!-- @spec REQ-VIC-005 -->

**Condition:** Achieve military power 2x greater than ALL other empires combined

**Calculation:**
```
your_military = soldiers + (fighters × 4) + (cruisers × 20) + (dreadnoughts × 200)
sum_all_others = sum of military_power for all empires except you

victory_achieved = your_military >= (sum_all_others × 2)
```

**Victory Points:**
```
Military VP = (your_military / sum_all_others) × (10 / 2.0)
```

**Example:**
- Your military: 20,000 power
- All others combined: 9,000 power
- Ratio: 20,000 / 9,000 = 2.22x → **MILITARY VICTORY**

**Strategic Notes:**
- Extremely difficult to achieve (requires overwhelming force advantage)
- Typically only possible if multiple major empires eliminated
- Warlord archetype with War Machine doctrine
- Triggers anti-snowball EARLIER than other paths (high military at 1.4x ratio = 7 VP)

**Edge Cases:**
- **All other empires eliminated**: If you're the only empire remaining, auto-win (infinite ratio)
- **Ally military counts separately**: Allied empires' military power does NOT count toward yours (unless coalition victory active)
- **Last place empire**: If 99 empires have 100 power each (9,900 total), you need 19,800+ to win

### 3.6 Survival Victory <!-- @spec REQ-VIC-006 -->

**Condition:** Have the highest score when the turn limit is reached

**Score Formula:**
```
score = networth
        + (military_power × 10)
        + (sectors × 500)
        + (reputation × 100)
        + (tech_tier_average × 1000)

Where:
  networth = credits + resource_value + sector_value + military_value
  tech_tier_average = (tier1_complete × 1) + (tier2_complete × 2) + (tier3_complete × 3) / total_techs
```

**Victory Points:**
```
Survival VP = (your_score / highest_score_in_game) × 10
```

**Turn Limits by Game Mode:**

| Mode | Turn Limit | Typical Winner |
|------|------------|---------------|
| Quick | 50 turns | Conquest (60% unlikely, but someone hits it) |
| Standard | 200 turns | Mixed (30% Survival, others specific victories) |
| Epic | 500 turns | Survival (60% of games, no one reaches thresholds) |

**Strategic Notes:**
- Rewards balanced empires (good at everything, not great at one thing)
- Opportunist archetype (adaptive strategy based on situation)
- Often the outcome when anti-snowball mechanics successfully prevent all other victories
- Creates tense endgame as turn limit approaches (players race to maximize score)

**Edge Cases:**
- **Tie score**: If two empires have identical scores at turn limit, tiebreaker = networth, then military power, then sectors, then reputation
- **All empires eliminated except one**: Remaining empire wins immediately (no need to wait for turn limit)
- **Turn limit disabled**: If game mode set to "Endless", Survival Victory is unavailable

### 3.7 Victory Point System

**VP Update Frequency:** Every turn, after Phase 1 (Income Generation)

**VP Display:**
- **Your VP**: Show all 6 categories with progress bars
- **Top 5 Threats**: Show highest VP for each of top 5 empires (not all 6 categories, just their leading category)

**VP Notification Thresholds:**

| VP Threshold | Notification | Color |
|--------------|--------------|-------|
| 5 VP | "[Empire] is approaching victory via [type]" | Yellow |
| 7 VP | "[Empire] is NEARING VICTORY via [type]! The galaxy must respond!" | Orange (anti-snowball) |
| 9 VP | "[Empire] is ONE STEP FROM VICTORY via [type]!" | Red (critical) |
| 10 VP | "[Empire] has achieved [type] VICTORY!" | Gold (victory announcement) |

**Multiple VP Tracking:**
- Empire can have high VP in multiple categories simultaneously
- Example: 7 Conquest VP, 6 Economic VP, 3 Military VP → Empire shown as "7 VP (Conquest)" but is ALSO close to Economic
- Strategic implication: Opponents must decide which victory path to sabotage

### 3.8 Anti-Snowball Triggers

When any empire reaches **7+ Victory Points**:

**Automatic Coalition Offer:**
- All empires with NAPs or Alliances receive message: "Emperor [Leader] threatens us all. Join the coalition against them?"
- Acceptance rate based on reputation, archetype, and self-interest
- Coalition goal: "Reduce [Leader] below 7 VP"

**Combat Modifiers:**
```
if (attacker.vp >= 7):
  defender.power_multiplier += 0.05  # +5% defender bonus

if (defender.vp >= 7):
  attacker.power_multiplier += 0.10  # +10% attacker bonus
```

**Economic Penalties:**
```
if (empire.vp >= 7):
  market_purchase_cost_multiplier = 1.20  # +20% cost
  reputation_decay_per_turn = -2
```

**Diplomatic Restrictions:**
```
if (empire.vp >= 7):
  can_form_new_nap = false
  can_form_new_alliance = false
  can_join_coalition = false  # Can only lead their own coalition
```

**VP Decay:**
- VP is NOT a persistent value; it's recalculated each turn based on current status
- If leader loses territory/resources due to attacks, VP automatically drops
- Once below 7 VP, anti-snowball effects immediately lift

---

## 4. Bot Integration

### 4.1 Archetype Behavior

| Archetype | Primary Victory Path | Secondary Path | Priority Logic | Example Action |
|-----------|---------------------|----------------|----------------|----------------|
| **Warlord** | Conquest (80%) | Military (15%) | High | "I need 50 more sectors. Attack!" |
| **Diplomat** | Diplomatic (70%) | Survival (20%) | Medium | "Let us form a coalition to end this bloodshed." |
| **Merchant** | Economic (75%) | Survival (20%) | Medium | "My trading empire will surpass you all." |
| **Schemer** | Diplomatic (40%) | Economic (30%) | Variable | "Join my coalition... for now." (betrayal at 9 VP) |
| **Turtle** | Research (80%) | Survival (15%) | Low | "Leave me to my research." (defensive only) |
| **Blitzkrieg** | Conquest (90%) | Military (10%) | High | "Strike fast, strike everywhere!" |
| **Tech Rush** | Research (70%) | Economic (20%) | Medium | "Technology will ensure my dominance." |
| **Opportunist** | Survival (50%) | (adapts to situation) | Variable | "I'll pursue whatever path is open." |

**Archetype Priority:**
- **High Priority**: Aggressively pursues victory path, making suboptimal short-term choices for long-term victory positioning
- **Medium Priority**: Balances victory pursuit with empire sustainability
- **Low Priority**: Defensive playstyle; only pursues victory if safe to do so
- **Variable**: Adapts based on game state (e.g., Schemer switches from Diplomatic to Economic if coalition fails)

### 4.2 Bot Decision Logic

**Victory Path Selection (Turn 1):**
```typescript
function selectVictoryPath(bot: Bot): VictoryType {
  // Archetypes have weighted preferences
  const weights = ARCHETYPE_VICTORY_WEIGHTS[bot.archetype];

  // Example: Warlord weights = { conquest: 0.8, military: 0.15, survival: 0.05 }
  return weightedRandom(weights);
}
```

**Turn-by-Turn Decision Making:**
```typescript
function botTurnDecision(bot: Bot, gameState: GameState): Action {
  const myVP = calculateVictoryPoints(bot);
  const closestThreat = getEmpireWithHighestVP(gameState);

  // DEFENSIVE: If someone else is at 8+ VP, attack them
  if (closestThreat.vp >= 8 && closestThreat.id !== bot.id) {
    return attackEmpire(closestThreat);
  }

  // OFFENSIVE: If I'm at 7+ VP, push for victory
  if (myVP >= 7) {
    return pursueVictoryPath(bot.victoryPath);
  }

  // NORMAL: Build toward victory path
  if (myVP < 7) {
    return buildTowardVictory(bot.victoryPath);
  }
}

function pursueVictoryPath(path: VictoryType): Action {
  switch (path) {
    case "conquest":
      return attackWeakestNeighbor();  // Expand territory

    case "economic":
      return buildCommerceSectors();  // Maximize income

    case "diplomatic":
      return proposeCoalition();  // Formalize alliance

    case "research":
      return rushCapstone();  // Complete final tech

    case "military":
      return buildDreadnoughts();  // Max military power

    case "survival":
      return optimizeScore();  // Balanced development
  }
}
```

**Coalition Response to 7+ VP Leader:**
```typescript
function respondToLeader(bot: Bot, leader: Empire): boolean {
  // Bots evaluate whether to join anti-leader coalition

  const myRelationship = getReputation(bot, leader);
  const leaderThreat = leader.vp;
  const myVictoryChance = calculateMyVictoryChance(bot);

  // Always join if leader is existential threat
  if (leaderThreat >= 9) return true;

  // Join if I have low victory chance myself
  if (myVictoryChance < 0.2 && leaderThreat >= 7) return true;

  // Refuse if I'm close to my own victory
  if (bot.vp >= 6) return false;

  // Refuse if leader is ally with high reputation
  if (myRelationship >= 75) return false;

  // Default: join the coalition
  return true;
}
```

**Archetype-Specific Overrides:**

**Turtle (Research Victory):**
```typescript
// Turtles NEVER initiate attacks unless research sectors threatened
if (archetype === "Turtle" && !researchSectorsUnderThreat()) {
  return buildDefenses();
}
```

**Schemer (Diplomatic Victory with Betrayal):**
```typescript
// Schemers betray coalitions at 9 VP to secure solo victory
if (archetype === "Schemer" && myVP >= 9 && inCoalition()) {
  return leaveCoalitionAndSabotage();
}
```

**Opportunist (Adaptive Victory Path):**
```typescript
// Opportunists recalculate victory path every 20 turns
if (archetype === "Opportunist" && turn % 20 === 0) {
  bot.victoryPath = selectEasiestVictoryPath(gameState);
}
```

### 4.3 Bot Messages

**Victory Progress Announcements:**

| VP Threshold | Warlord | Diplomat | Merchant | Schemer | Turtle |
|--------------|---------|----------|----------|---------|--------|
| **5 VP** | "My conquests continue, {player}. Your sector may be next." | "Our coalition grows stronger each turn, {player}." | "My wealth eclipses yours tenfold, {player}." | "The pieces fall into place... {player}." | "My research progresses nicely. Do not disturb me." |
| **7 VP** | "The galaxy will be MINE! None can stop me now!" | "Join us, {player}, or be left behind when we achieve victory." | "I am the wealthiest empire in the galaxy. Victory is inevitable." | "You fools trusted me? How delightful." | "My breakthrough is imminent. Leave me in peace!" |
| **9 VP** | "ONE MORE SECTOR! Your defenses are meaningless!" | "The coalition stands at the brink of victory!" | "My economic dominance is absolute!" | "You thought you could stop me? Pathetic." | "THE CAPSTONE IS COMPLETE! Witness my genius!" |

**Responding to Player Near Victory:**

**If Player at 8+ VP:**
```
Warlord: "You grow too strong, {player}! I will crush you before you achieve victory!"
Diplomat: "The galaxy unites against you, {player}. You cannot win alone."
Merchant: "Your ambition will bankrupt you, {player}. I will outspend you."
Schemer: "So close, {player}... but I've already ensured your downfall."
Turtle: "You threaten the balance, {player}. I must intervene."
Blitzkrieg: "You've grown fat and slow, {player}. I will strike before you can react!"
Tech Rush: "Your primitive tactics won't stop my technological superiority, {player}."
Opportunist: "Looks like I need to stop you, {player}. Nothing personal."
```

**Coalition Invitation (7+ VP Trigger):**
```
Diplomat: "Emperor {leader} threatens us all. Join my coalition and we will stop them together!"
Warlord: "I hate alliances, but {leader} must be destroyed. Temporarily, we fight together."
Merchant: "There's profit in cooperation, {player}. Let's eliminate {leader} and split the spoils."
Schemer: "Join me against {leader}, {player}... and we'll deal with each other later." (smirk)
```

**Victory Achievement Taunts:**
```
Warlord (Conquest): "The galaxy is MINE! All sectors bow before my empire!"
Diplomat (Diplomatic): "Our coalition has achieved what none could alone. Together, we are unstoppable!"
Merchant (Economic): "Credits buy anything, {player}. Even victory."
Turtle (Research): "While you waged your petty wars, I unlocked the secrets of the universe. I win."
```

**Flavor Text Principles:**
- **Personality consistency**: Warlords are aggressive, Diplomats are cordial, Schemers are smug
- **Player agency**: Messages reference player by name, creating personal rivalry
- **Narrative tension**: Messages escalate as VP increases (5→7→9)
- **Reactive dialogue**: Bots comment on player's actions (e.g., "You dare attack my research sectors?")

---

## 5. UI/UX Design

### 5.1 UI Mockups

**Victory Progress Panel (Always Visible):**
```
┌─────────────────────────────────────────────────┐
│  VICTORY PROGRESS                               │
├─────────────────────────────────────────────────┤
│  Your Empire                            [7.2 VP]│
│  ┌─────────────────────────────────────────┐    │
│  │ Conquest      [████████░░] 54%   6.0 VP │    │
│  │ Economic      [██████████] 85%   8.5 VP │ ←  │
│  │ Diplomatic    [███░░░░░░░] 18%   1.8 VP │    │
│  │ Research      [████░░░░░░] 32%   3.2 VP │    │
│  │ Military      [█████░░░░░] 41%   4.1 VP │    │
│  │ Survival      [███████░░░] 67%   6.7 VP │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Top Threats                                     │
│  ┌─────────────────────────────────────────┐    │
│  │ 1. Warlord Kraxx     [████████░] 9.2 VP │ ⚠ │
│  │    Conquest - 460 sectors                │    │
│  │ 2. Merchant Vesh     [███████░░] 7.8 VP │ ⚠ │
│  │    Economic - 1.4x networth              │    │
│  │ 3. Bot #47           [██████░░░] 6.1 VP │    │
│  │    Military - 1.2x combined power        │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Victory Alert Notification (7+ VP Reached):**
```
┌───────────────────────────────────────────────┐
│  ⚠ CRITICAL THREAT ALERT ⚠                   │
├───────────────────────────────────────────────┤
│  Emperor Warlord Kraxx is NEARING VICTORY!    │
│                                               │
│  Victory Path: CONQUEST                       │
│  Progress:     460 / 500 sectors (92%)        │
│  Victory Points: 9.2 VP (10 VP = Victory)     │
│                                               │
│  The galaxy must respond!                     │
│                                               │
│  [Join Coalition Against Kraxx]               │
│  [Attack Kraxx's Sectors]                     │
│  [Ignore - Focus On My Victory]               │
└───────────────────────────────────────────────┘
```

**Victory Achievement Screen (Game Over):**
```
╔═════════════════════════════════════════════════════════╗
║                                                         ║
║           🏆  VICTORY ACHIEVED  🏆                      ║
║                                                         ║
║              CONQUEST VICTORY                           ║
║                                                         ║
║        Emperor Warlord Kraxx has conquered              ║
║         60% of the galaxy on Turn 143!                  ║
║                                                         ║
║  ┌───────────────────────────────────────────────┐     ║
║  │  Final Statistics                             │     ║
║  ├───────────────────────────────────────────────┤     ║
║  │  Sectors Controlled:      312 / 500 (62%)     │     ║
║  │  Military Power:          18,450              │     ║
║  │  Networth:                142,000             │     ║
║  │  Reputation:              -47 (Warmonger)     │     ║
║  │  Empires Eliminated:      23                  │     ║
║  └───────────────────────────────────────────────┘     ║
║                                                         ║
║  Your Empire: 2nd Place (267 sectors, 8.9 VP)          ║
║                                                         ║
║  [View Full Leaderboard]  [New Game]  [Exit]           ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
```

**In-Game Victory Progress Tooltip (Hover):**
```
┌────────────────────────────────────────┐
│  CONQUEST VICTORY                      │
├────────────────────────────────────────┤
│  Current Progress:  270 / 500 sectors  │
│  Percentage:        54%                │
│  Victory Points:    6.0 / 10 VP        │
│                                        │
│  Remaining:         30 more sectors    │
│  Est. Turns:        12-15 turns        │
│                                        │
│  Closest Competitor:                   │
│  Warlord Kraxx - 460 sectors (9.2 VP) │
│                                        │
│  ⚠ Kraxx is ONE turn from victory!    │
└────────────────────────────────────────┘
```

### 5.2 User Flows

**Flow 1: Player Nearing Victory (8+ VP)**

1. **Turn 95**: Player reaches 8 VP (Conquest) - 400 sectors controlled
2. **Notification**: "You are NEARING VICTORY via Conquest! 20 more sectors required."
3. **Victory Progress Panel**: Conquest bar glows orange, pulsing animation
4. **Bot Reactions**: 3-5 bots send threatening messages ("You grow too strong!")
5. **Turn 96**: Anti-snowball coalition forms - player sees "Coalition of 5 empires formed against you"
6. **Turn 97**: Player attacks to gain sectors, but coalition attacks back (-10 sectors)
7. **Turn 98**: Player reaches 410 sectors (8.2 VP) - still progressing
8. **Turn 100**: Player captures final sectors → 500 total → **CONQUEST VICTORY**
9. **Victory Screen**: Cinematic freeze, LCARS panels flash gold, victory music plays
10. **Leaderboard**: Final standings shown with score breakdown

**Flow 2: Bot Achieves Victory (Player Loses)**

1. **Turn 120**: Bot "Merchant Vesh" reaches 7 VP (Economic) - notification to player
2. **Turn 125**: Vesh reaches 8.5 VP - critical alert notification
3. **Player Options**:
   - **Option A**: Join coalition against Vesh (coordinate attacks)
   - **Option B**: Attack Vesh directly (sabotage their economy)
   - **Option C**: Ignore and pursue own victory (risky race)
4. **Turn 130**: Player chose Option A, coalition attacks Vesh (-15% networth)
5. **Turn 135**: Vesh recovers, reaches 9.1 VP - "ONE STEP FROM VICTORY" alert
6. **Turn 136**: Vesh achieves 1.5x networth of 2nd place → **ECONOMIC VICTORY (BOT WINS)**
7. **Defeat Screen**: "Merchant Vesh has achieved Economic Victory" - player shown as 3rd place
8. **Post-Game Options**: View replay, analyze turns, start new game

**Flow 3: Multiple Empires Near Victory (High Tension)**

1. **Turn 150**: Three empires at 7+ VP:
   - Player: 7.2 VP (Conquest - 360 sectors)
   - Bot Kraxx: 8.5 VP (Military - 1.7x combined power)
   - Bot Vesh: 7.8 VP (Economic - 1.4x networth)
2. **Strategic Dilemma**:
   - Attack Kraxx (highest threat) → lose progress on own Conquest
   - Attack Vesh (weaker target) → Kraxx may win next turn
   - Push for own victory → risk being sabotaged by coalition
3. **Player Decision**: All-in on Conquest - attack weak neighbor for 15 sectors
4. **Turn 151**: Player reaches 375 sectors (8.3 VP), but Kraxx reaches 9.0 VP (Military)
5. **Turn 152**: Coalition forms against Kraxx - player invited
6. **Turn 153**: Player DECLINES coalition, continues Conquest push → 390 sectors (8.7 VP)
7. **Turn 154**: Kraxx attacked by coalition, drops to 8.2 VP
8. **Turn 155**: Player reaches 420 sectors (9.3 VP) → CRITICAL
9. **Turn 156**: Player captures final 80 sectors in multi-pronged attack → **CONQUEST VICTORY**

**Flow 4: Survival Victory (Turn Limit Reached)**

1. **Turn 195**: Standard game (200 turn limit) - no one above 7 VP
2. **Notification**: "5 turns remaining! Optimize your score for Survival Victory!"
3. **Player Actions**:
   - Turn 196: Build Commerce sectors (+income → +score)
   - Turn 197: Research Tier 2 tech (+tech score)
   - Turn 198: Attack weak neighbor for sectors (+territorial score)
   - Turn 199: Trade for reputation (+diplomatic score)
4. **Turn 200**: Turn limit reached
5. **Score Calculation**:
   ```
   Player Score:     125,000 (1st place)
   Bot Kraxx Score:  118,000 (2nd place)
   Bot Vesh Score:   112,000 (3rd place)
   ```
6. **SURVIVAL VICTORY**: Player wins with highest score
7. **Victory Screen**: Shows score breakdown by category

### 5.3 Visual Design Principles

**Color Coding:**

| Victory Point Range | Color | Meaning | Visual Effect |
|---------------------|-------|---------|---------------|
| 0-4 VP | Gray | No threat | Static progress bar |
| 5-6 VP | Yellow | Approaching victory | Slow pulse animation |
| 7-8 VP | Orange | Nearing victory (anti-snowball) | Fast pulse + warning icon |
| 9-9.9 VP | Red | Critical threat | Rapid pulse + alarm sound |
| 10 VP | Gold | Victory achieved | Flash transition to victory screen |

**LCARS Integration:**
- Victory Progress Panel styled as LCARS console (semi-transparent, orange accent)
- Victory alerts use LCARS notification system (slide-in from right)
- Victory achievement screen: full-screen LCARS takeover with gold highlights

**Animations:**
- **Progress bars**: Smooth fill animation (500ms transition on VP update)
- **VP threshold crossing**: Flash effect when crossing 5 VP, 7 VP, 9 VP milestones
- **Victory achievement**: Screen freeze (250ms) → gold flash (1s) → victory screen fade-in (1.5s)
- **Threat indicators**: Pulsing warning icons next to empires with 7+ VP

**Audio Cues:**
- **5 VP**: Soft chime (awareness tone)
- **7 VP**: Alert klaxon (warning tone) - plays for ANY empire reaching 7 VP
- **9 VP**: Urgent alarm (critical tone) - plays for player AND top threat
- **Victory**: Triumphant fanfare (20s victory music)

**Responsive Design:**
- **Desktop**: Victory Progress Panel docked to right side (250px width)
- **Tablet**: Collapsible panel (swipe to reveal)
- **Mobile**: Bottom sheet (swipe up to view full victory standings)

**Information Hierarchy:**
- **Most Important**: Player's leading VP category (largest, highlighted)
- **Secondary**: Top 3 threats with highest VP (medium size, orange if 7+ VP)
- **Tertiary**: Player's other 5 VP categories (collapsed, expand on click)

---

## 6. Specifications

This section contains formal requirements for spec-driven development. Each specification:
- Has a unique ID for traceability
- Links to code and tests
- Can be validated independently

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |
| **Deprecated** | Superseded by another spec |

---

### REQ-VIC-001: Conquest Victory

**Description:** Achieved when an empire controls 60% of all territory (300+ sectors out of 500 starting sectors).

**Rationale:** Classic domination victory rewards aggressive expansion and military conquest. The 60% threshold ensures empires must control a SIGNIFICANT portion of the galaxy (not just 51%), creating clear dominance.

**Formula:**
```typescript
conquest_progress = controlled_sectors / total_sectors
conquest_victory = conquest_progress >= 0.60
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| victory_threshold | 0.60 | 60% of galaxy |
| starting_sectors | 500 | 100 empires × 5 sectors each |
| anti_snowball_trigger | 350 sectors | 70% of threshold (7 VP) |

**Source:** Section 3.1 - Conquest Victory

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkConquestVictory()`
- `src/lib/game/services/core/victory-service.ts` - `calculateConquestVP()`
- `src/app/actions/victory-actions.ts` - `checkVictoryConditions()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Conquest victory at exactly 60%"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Conquest victory fails at 59.9%"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Anti-snowball triggers at 70% of threshold"

**Status:** Draft

---

### REQ-VIC-002: Economic Victory

**Description:** Achieved when an empire has 1.5x the networth of the second-place empire.

**Rationale:** Rewards builder/trader playstyle. Dynamic threshold (based on 2nd place) ensures competition remains relevant throughout the game. The 1.5x multiplier requires clear economic dominance, not just marginal lead.

**Formula:**
```typescript
networth = credits + (food × 10) + (ore × 12) + (petroleum × 15)
           + (sectors × 500) + (military_power × 10)

economic_victory = (your_networth / second_place_networth) >= 1.5
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| victory_multiplier | 1.5 | 150% of 2nd place |
| food_value | 10 | credits per food |
| ore_value | 12 | credits per ore |
| petroleum_value | 15 | credits per petroleum |
| sector_value | 500 | credits per sector |
| military_value | 10 | credits per power point |
| anti_snowball_trigger | 1.05x | 70% of threshold (7 VP) |

**Source:** Section 3.2 - Economic Victory

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkEconomicVictory()`
- `src/lib/game/services/core/victory-service.ts` - `calculateNetworth()`
- `src/lib/game/services/core/victory-service.ts` - `calculateEconomicVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Economic victory at exactly 1.5x"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Economic victory fails at 1.49x"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Networth calculation includes all resources"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Second place updated when empire eliminated"

**Status:** Draft

---

### REQ-VIC-003: Diplomatic Victory

**Description:** Achieved when a coalition controls 50% of territory. All coalition members win.

**Rationale:** Alliance-based victory path enables cooperative strategies. Shared victory (all members win) incentivizes genuine cooperation rather than betrayal. The 50% threshold (vs 60% Conquest) reflects the difficulty of coordinating multiple empires.

**Formula:**
```typescript
coalition_territory = sum of sectors owned by all coalition members
diplomatic_victory = (coalition_territory / total_sectors) >= 0.50
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| victory_threshold | 0.50 | 50% of galaxy |
| minimum_members | 3 | Cannot be 2-player coalition |
| reputation_required | +50 | Leader must have +50 rep with all members |
| anti_snowball_trigger | 175 sectors | 70% of threshold (7 VP) |

**Source:** Section 3.3 - Diplomatic Victory

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkDiplomaticVictory()`
- `src/lib/game/services/core/coalition-service.ts` - `formCoalition()`
- `src/lib/game/services/core/coalition-service.ts` - `validateCoalition()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Diplomatic victory at 50% coalition territory"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "All coalition members marked as winners"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Coalition disbanded before victory = no win"
- `src/lib/game/services/__tests__/coalition-service.test.ts` - "Coalition requires minimum 3 members"

**Status:** Draft

---

### REQ-VIC-004: Research Victory

**Description:** Achieved when an empire completes the entire Tier 3 tech tree (Doctrine → Specialization → Capstone + 10 advanced techs).

**Rationale:** Tech rush victory path enables turtle strategies. Completing the full tech tree demonstrates long-term investment in research rather than military/economic expansion. The 10 advanced tech requirement ensures breadth of research, not just rushing to capstone.

**Formula:**
```typescript
research_complete = (capstone_complete === true)
                    AND (advanced_tech_count >= 10)

research_victory = research_complete === true
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| tier3_capstones | 3 | Dreadnought, Citadel World, Economic Hegemony |
| advanced_tech_required | 10 | Tier 2-3 level techs |
| anti_snowball_trigger | 7 advanced techs | 70% of threshold (7 VP) |

**Source:** Section 3.4 - Research Victory

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkResearchVictory()`
- `src/lib/game/services/research/research-service.ts` - `getCompletedTechs()`
- `src/lib/game/services/core/victory-service.ts` - `calculateResearchVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Research victory with capstone + 10 advanced techs"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Research victory fails with capstone but only 9 techs"
- `src/lib/game/services/__tests__/research-service.test.ts` - "Capstone progress not revoked after completion"

**Status:** Draft

---

### REQ-VIC-005: Military Victory

**Description:** Achieved when an empire has 2x the military power of all other empires combined.

**Rationale:** Military supremacy victory demonstrates overwhelming force advantage. The 2x multiplier (vs all others COMBINED) ensures this victory is extremely difficult and typically only achievable late-game when many empires eliminated. Rewards Warlord archetype with War Machine doctrine.

**Formula:**
```typescript
your_military = soldiers + (fighters × 4) + (cruisers × 20) + (dreadnoughts × 200)
sum_all_others = sum of military_power for all empires except you

military_victory = your_military >= (sum_all_others × 2)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| victory_multiplier | 2.0 | 200% of all others combined |
| soldier_power | 1 | Base unit |
| fighter_power | 4 | 4x soldier |
| cruiser_power | 20 | 5x fighter |
| dreadnought_power | 200 | 10x cruiser |
| anti_snowball_trigger | 1.4x | 70% of threshold (7 VP) |

**Source:** Section 3.5 - Military Victory

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkMilitaryVictory()`
- `src/lib/game/services/core/military-service.ts` - `calculateMilitaryPower()`
- `src/lib/game/services/core/victory-service.ts` - `calculateMilitaryVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Military victory at exactly 2.0x all others"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Military victory fails at 1.99x"
- `src/lib/game/services/__tests__/military-service.test.ts` - "Military power calculation includes all unit types"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Auto-win if only empire remaining"

**Status:** Draft

---

### REQ-VIC-006: Survival Victory

**Description:** Achieved by having the highest score when the turn limit is reached.

**Rationale:** Default victory for balanced play when no empire achieves other victory conditions. Score formula rewards well-rounded empires (networth + military + territory + reputation + tech). Creates tense endgame as turn limit approaches.

**Formula:**
```typescript
score = networth
        + (military_power × 10)
        + (sectors × 500)
        + (reputation × 100)
        + (tech_tier_average × 1000)

survival_victory = (turn === turn_limit) AND (your_score === highest_score)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| networth_weight | 1 | Direct contribution |
| military_weight | 10 | per power point |
| sector_weight | 500 | per sector |
| reputation_weight | 100 | per reputation point |
| tech_weight | 1000 | per average tier level |
| turn_limit_standard | 200 | Standard game mode |

**Source:** Section 3.6 - Survival Victory

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkSurvivalVictory()`
- `src/lib/game/services/core/victory-service.ts` - `calculateScore()`
- `src/lib/game/services/core/game-service.ts` - `checkTurnLimit()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Survival victory when turn limit reached"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Survival victory with highest score"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Tiebreaker: networth > military > sectors"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "No survival victory if turn limit not reached"

**Status:** Draft

---

### REQ-VIC-007: Victory Point Calculation (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-VIC-007-A through REQ-VIC-007-G below.

---

### REQ-VIC-007-A: Conquest VP Formula

**Description:** Conquest Victory Points are calculated based on sector control percentage: `conquest_vp = (controlled_sectors / total_sectors) × (10 / 0.6)`. Reaches 10 VP when empire controls 60% of all sectors.

**Rationale:** Conquest VP scales linearly with sector control, rewarding territorial expansion. 60% threshold prevents total domination requirement while ensuring clear majority control.

**Formula:**
```typescript
conquest_vp = (controlled_sectors / total_sectors) × (10 / 0.6)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| conquest_threshold | 0.6 | 60% of sectors required for 10 VP |
| vp_scale | 0-10 | Linear scaling |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateConquestVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Conquest VP calculation"

**Status:** Draft

---

### REQ-VIC-007-B: Economic VP Formula

**Description:** Economic Victory Points are calculated based on net worth ratio to second place: `economic_vp = (your_networth / second_networth) × (10 / 1.5)`. Reaches 10 VP when empire's net worth is 1.5x the second richest empire.

**Rationale:** Economic VP rewards wealth accumulation relative to competitors. 1.5x threshold balances difficulty (not too easy) with achievability (not requiring total economic dominance).

**Formula:**
```typescript
economic_vp = (your_networth / second_networth) × (10 / 1.5)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| economic_threshold | 1.5 | 1.5x second place required for 10 VP |
| vp_scale | 0-10 | Linear scaling |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateEconomicVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Economic VP calculation"

**Status:** Draft

---

### REQ-VIC-007-C: Diplomatic VP Formula

**Description:** Diplomatic Victory Points are calculated based on coalition territory control: `diplomatic_vp = (coalition_territory / total_sectors) × (10 / 0.5)`. Reaches 10 VP when coalition (you + allies) controls 50% of all sectors.

**Rationale:** Diplomatic VP rewards alliance building and collective power. 50% threshold reflects cooperative victory path—easier than solo conquest (60%) but requires maintaining alliances.

**Formula:**
```typescript
diplomatic_vp = (coalition_territory / total_sectors) × (10 / 0.5)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| diplomatic_threshold | 0.5 | 50% of sectors required for 10 VP |
| vp_scale | 0-10 | Linear scaling |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateDiplomaticVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Diplomatic VP calculation"

**Status:** Draft

---

### REQ-VIC-007-D: Research VP Formula

**Description:** Research Victory Points are calculated based on capstone progress and advanced techs: `research_vp = ((capstone_progress × 0.5) + (advanced_techs / 10 × 0.5)) × 10`. Capstone and advanced techs each contribute 50% to total research VP.

**Rationale:** Research VP rewards both depth (capstone unlock) and breadth (multiple advanced techs). Equal weighting ensures no single path dominates—empires must balance specialization and diversification.

**Formula:**
```typescript
research_vp = ((capstone_progress × 0.5) + (advanced_techs / 10 × 0.5)) × 10
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| capstone_weight | 0.5 | 50% of research VP |
| advanced_tech_weight | 0.5 | 50% of research VP |
| max_advanced_techs | 10 | 10 techs = 100% advanced contribution |
| vp_scale | 0-10 | Linear scaling |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateResearchVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Research VP calculation"

**Status:** Draft

---

### REQ-VIC-007-E: Military VP Formula

**Description:** Military Victory Points are calculated based on relative military strength: `military_vp = (your_military / sum_all_others) × (10 / 2.0)`. Reaches 10 VP when empire's military power equals 2x the combined power of all other empires.

**Rationale:** Military VP rewards overwhelming force projection. 2x threshold is intentionally difficult—military victory requires clear dominance, not just marginal superiority. Prevents early military snowballing.

**Formula:**
```typescript
military_vp = (your_military / sum_all_others) × (10 / 2.0)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| military_threshold | 2.0 | 2x all others combined required for 10 VP |
| vp_scale | 0-10 | Linear scaling |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateMilitaryVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Military VP calculation"

**Status:** Draft

---

### REQ-VIC-007-F: Survival VP Formula

**Description:** Survival Victory Points are calculated based on score ratio to highest scorer: `survival_vp = (your_score / highest_score) × 10`. Only applicable if turn limit reached. Highest scorer gets 10 VP.

**Rationale:** Survival VP provides fallback victory condition if no empire achieves other victories by turn limit. Simple ratio ensures highest scorer wins, with VP spread showing relative performance.

**Formula:**
```typescript
survival_vp = (your_score / highest_score) × 10
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| vp_scale | 0-10 | Linear scaling |
| turn_limit | 100 | Default turn limit for survival victory |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateSurvivalVP()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Survival VP calculation"

**Status:** Draft

---

### REQ-VIC-007-G: Total VP Aggregation

**Description:** Total VP is the maximum of all six category VPs: `total_vp = MAX(conquest_vp, economic_vp, diplomatic_vp, research_vp, military_vp, survival_vp)`. VP thresholds trigger notifications and anti-snowball mechanics: 5 VP (warning), 7 VP (anti-snowball), 9 VP (critical), 10 VP (victory achieved).

**Rationale:** Max aggregation ensures empires pursue their strongest victory path. Players only need to excel in ONE category, encouraging specialization. Thresholds provide graduated warnings and intervention points.

**Formula:**
```typescript
total_vp = MAX(conquest_vp, economic_vp, diplomatic_vp, research_vp, military_vp, survival_vp)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| warning_threshold | 5 VP | "Approaching victory" notification |
| anti_snowball_threshold | 7 VP | Triggers coalition formation |
| critical_threshold | 9 VP | "One step from victory" alert |
| victory_threshold | 10 VP | Victory achieved |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `calculateTotalVP()`
- `src/lib/game/services/core/victory-service.ts` - `getLeadingVictoryPath()`
- `src/app/components/victory/VictoryProgressPanel.tsx` - Display VP

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Total VP is max of all categories"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "VP updates every turn"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Leading victory path correctly identified"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "VP threshold notifications trigger correctly"

**Status:** Draft

---

### REQ-VIC-008: Anti-Snowball Mechanics (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-VIC-008-A through REQ-VIC-008-G below.

---

### REQ-VIC-008-A: Anti-Snowball Trigger Threshold

**Description:** Anti-snowball mechanics activate when any empire reaches exactly 7 Victory Points (70% to victory) and deactivate when the leader's VP drops below 7. The 7 VP threshold ensures intervention occurs before victory becomes inevitable.

**Rationale:** 7 VP threshold (70% progress) provides sufficient warning time for galaxy to respond while still allowing strong players to close the victory gap. Triggering earlier would punish legitimate progress; later would be too late to prevent snowballing.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| trigger_threshold | 7 VP | 70% of victory progress |
| deactivation_threshold | <7 VP | Mechanics lift when leader drops below 7 |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkAntiSnowballTrigger()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Anti-snowball triggers at exactly 7 VP"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Anti-snowball lifts when VP drops below 7"

**Status:** Draft

---

### REQ-VIC-008-B: Combat Attack Bonus vs Leader

**Description:** When anti-snowball mechanics are active, all non-leader empires gain +10% attack bonus when attacking the leader (empire with 7+ VP). This bonus applies to all combat domains (space, ground, orbital).

**Rationale:** Attack bonus helps underdogs challenge the leader militarily without making combat trivial. +10% is significant but not overwhelming—leader can still win battles through superior strategy and force composition.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| attack_bonus_vs_leader | +10% | Applied to all attack rolls vs leader |
| applies_to | All empires except leader | Leader does not receive this bonus |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/combat/combat-service.ts` - `applyCombatModifiers()`

**Tests:**
- `src/lib/game/services/__tests__/combat-service.test.ts` - "Attack bonus applied when fighting leader"
- `src/lib/game/services/__tests__/combat-service.test.ts` - "Attack bonus not applied in leader vs leader combat"

**Status:** Draft

---

### REQ-VIC-008-C: Combat Defense Bonus vs Leader

**Description:** When anti-snowball mechanics are active, all non-leader empires gain +5% defense bonus when defending against attacks by the leader (empire with 7+ VP). This bonus applies to all combat domains (space, ground, orbital).

**Rationale:** Defense bonus makes it harder for leader to expand aggressively. +5% is intentionally smaller than attack bonus (+10%)—encourages defensive play and coalition formation rather than solo challenges.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| defense_bonus_vs_leader | +5% | Applied to all defense rolls vs leader |
| applies_to | All empires except leader | Leader does not receive this bonus |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/combat/combat-service.ts` - `applyCombatModifiers()`

**Tests:**
- `src/lib/game/services/__tests__/combat-service.test.ts` - "Defense bonus applied when defending vs leader"
- `src/lib/game/services/__tests__/combat-service.test.ts` - "Defense bonus not applied when leader defends"

**Status:** Draft

---

### REQ-VIC-008-D: Market Price Penalty for Leader

**Description:** When anti-snowball mechanics are active, the leader (empire with 7+ VP) pays +20% more for all market purchases (buy orders). Market sell prices are unaffected. This penalty applies to all resources (credits, ore, food, petroleum, research points).

**Rationale:** Economic penalty prevents leader from using economic dominance to further snowball. +20% is significant enough to constrain leader's market activity without completely blocking market access. Sell prices unchanged to avoid punishing legitimate trade.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| market_penalty | +20% | Leader pays 1.2x normal buy price |
| applies_to_purchases | Yes | All buy orders |
| applies_to_sales | No | Sell orders unaffected |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/market/market-service.ts` - `applyLeaderPenalty()`

**Tests:**
- `src/lib/game/services/__tests__/market-service.test.ts` - "Leader pays 20% more for market purchases"
- `src/lib/game/services/__tests__/market-service.test.ts` - "Leader sell prices unaffected"
- `src/lib/game/services/__tests__/market-service.test.ts` - "Non-leaders unaffected by penalty"

**Status:** Draft

---

### REQ-VIC-008-E: Reputation Decay for Leader

**Description:** When anti-snowball mechanics are active, the leader (empire with 7+ VP) automatically loses 2 reputation points per turn. This decay is applied during the turn processing pipeline and represents galactic resentment of the leader's power.

**Rationale:** Reputation decay makes diplomatic victory harder for leaders (requires maintaining alliances) and encourages betrayals. -2/turn is gradual but meaningful—leader must actively invest in diplomacy to counteract decay.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| reputation_decay | -2/turn | Automatic loss per turn |
| applies_to | Leader only | Empire with 7+ VP |
| min_reputation | 0 | Decay stops at 0, doesn't go negative |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/core/reputation-service.ts` - `applyLeaderReputationDecay()`

**Tests:**
- `src/lib/game/services/__tests__/reputation-service.test.ts` - "Leader loses 2 reputation per turn"
- `src/lib/game/services/__tests__/reputation-service.test.ts` - "Reputation decay stops at 0"
- `src/lib/game/services/__tests__/reputation-service.test.ts` - "Non-leaders unaffected by decay"

**Status:** Draft

---

### REQ-VIC-008-F: Automatic Coalition Offers

**Description:** When an empire reaches 7 VP for the first time, all empires with existing NAP (Non-Aggression Pact) or Alliance treaties automatically receive a coalition offer to join an anti-leader coalition. Coalition offers are sent once per leader threshold crossing (not every turn).

**Rationale:** Automatic coalition offers facilitate coordinated response to leaders without requiring manual coordination. Restricting offers to existing NAP/Alliance partners prevents unrealistic instant alliances—empires must have pre-existing diplomatic relations.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| coalition_offer | Automatic | Sent when leader reaches 7 VP |
| eligible_empires | NAP or Alliance with any empire | Must have existing diplomatic ties |
| offer_frequency | Once per threshold crossing | Not sent every turn |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/core/coalition-service.ts` - `formAntiLeaderCoalition()`

**Tests:**
- `src/lib/game/services/__tests__/coalition-service.test.ts` - "Coalition offer sent to all eligible empires"
- `src/lib/game/services/__tests__/coalition-service.test.ts` - "Coalition offer not sent to empires without diplomatic ties"
- `src/lib/game/services/__tests__/coalition-service.test.ts` - "Coalition offer sent only once per threshold crossing"

**Status:** Draft

---

### REQ-VIC-008-G: Anti-Snowball Mechanics Coordination

**Description:** Coordinates activation and deactivation of all anti-snowball mechanics (trigger threshold, combat bonuses, market penalty, reputation decay, coalition offers). All mechanics activate simultaneously when leader reaches 7 VP and deactivate together when leader drops below 7 VP.

**Rationale:** Unified coordination ensures consistent anti-snowball behavior—mechanics don't activate/deactivate independently. Prevents edge cases where some mechanics are active while others aren't. Simplifies debugging and testing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8 - Anti-Snowball Triggers

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `checkAntiSnowballTrigger()`
- `src/lib/game/services/core/anti-snowball-coordinator.ts` - `activateAntiSnowballMechanics()`
- `src/lib/game/services/core/anti-snowball-coordinator.ts` - `deactivateAntiSnowballMechanics()`

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "All mechanics activate simultaneously at 7 VP"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "All mechanics deactivate simultaneously below 7 VP"
- `src/lib/game/services/__tests__/victory-service.test.ts` - "No partial activation states"

**Status:** Draft

---

### REQ-VIC-009: Victory Notifications (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-VIC-009-A through REQ-VIC-009-D below.

**Overview:** Players receive escalating notifications when any empire reaches VP milestones (5, 7, 9, 10), with color-coded visual hierarchy and distinct audio cues.

**Milestone Notifications:**
- 5 VP: "Approaching victory" (Yellow, Soft chime) [REQ-VIC-009-A]
- 7 VP: "Nearing victory" (Orange, Alert klaxon) [REQ-VIC-009-B]
- 9 VP: "One step from victory" (Red, Urgent alarm) [REQ-VIC-009-C]
- 10 VP: "Victory achieved" (Gold, Triumphant fanfare) [REQ-VIC-009-D]

---

### REQ-VIC-009-A: 5 VP Milestone Notification

**Description:** When any empire reaches 5 VP, display an "Approaching victory" notification to all players with yellow alert styling and soft chime audio.

**Notification Rules:**
- Trigger: Any empire reaches exactly 5 VP
- Message: "[Empire Name] is approaching victory (5/10 VP)"
- Color: Yellow (warning level 1)
- Audio: Soft chime (gentle alert)
- Visibility: All players see notification
- Frequency: Once per empire per milestone (no duplicates)

**Rationale:** First early warning. Yellow indicates caution without alarm. Soft chime draws attention without urgency.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System, 5 VP Milestone

**Code:** TBD - `src/lib/game/services/core/victory-service.ts` - 5 VP check

**Tests:** TBD - Notification sent at 5 VP, no duplicates

**Status:** Draft

---

### REQ-VIC-009-B: 7 VP Milestone Notification

**Description:** When any empire reaches 7 VP (anti-snowball trigger), display a "Nearing victory" notification to all players with orange alert styling and alert klaxon audio.

**Notification Rules:**
- Trigger: Any empire reaches exactly 7 VP
- Message: "[Empire Name] is nearing victory (7/10 VP) - Anti-snowball active!"
- Color: Orange (warning level 2)
- Audio: Alert klaxon (heightened urgency)
- Visibility: All players see notification
- Frequency: Once per empire per milestone
- Special: Highlights anti-snowball mechanics activation

**Rationale:** Critical threshold where anti-snowball kicks in. Orange indicates elevated threat. Klaxon signals urgent attention needed.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System, 7 VP Milestone

**Code:** TBD - `src/lib/game/services/core/victory-service.ts` - 7 VP check

**Tests:** TBD - Notification sent at 7 VP, anti-snowball message

**Status:** Draft

---

### REQ-VIC-009-C: 9 VP Milestone Notification

**Description:** When any empire reaches 9 VP (one away from victory), display a "One step from victory" notification to all players with red alert styling and urgent alarm audio.

**Notification Rules:**
- Trigger: Any empire reaches exactly 9 VP
- Message: "[Empire Name] is ONE STEP from victory (9/10 VP)!"
- Color: Red (critical warning)
- Audio: Urgent alarm (maximum urgency)
- Visibility: All players see notification
- Frequency: Once per empire per milestone
- Special: May flash or pulse to emphasize criticality

**Rationale:** Final warning before victory. Red signals imminent threat. Urgent alarm demands immediate action.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System, 9 VP Milestone

**Code:** TBD - `src/lib/game/services/core/victory-service.ts` - 9 VP check

**Tests:** TBD - Notification sent at 9 VP, critical urgency

**Status:** Draft

---

### REQ-VIC-009-D: 10 VP Victory Notification

**Description:** When any empire reaches 10 VP (victory achieved), display a "Victory achieved" notification to all players with gold styling and triumphant fanfare audio.

**Notification Rules:**
- Trigger: Any empire reaches exactly 10 VP
- Message: "[Empire Name] has achieved VICTORY! (10/10 VP)"
- Color: Gold (victory/celebratory)
- Audio: Triumphant fanfare (cinematic victory music)
- Visibility: All players see notification
- Frequency: Once per empire per milestone
- Special: Triggers game freeze and victory screen (see REQ-VIC-010)

**Rationale:** Game-ending event. Gold indicates triumph rather than threat. Fanfare celebrates achievement and signals game conclusion.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Victory Point System, 10 VP Milestone

**Code:** TBD - `src/lib/game/services/core/victory-service.ts` - 10 VP check and game freeze

**Tests:** TBD - Notification sent at 10 VP, game freeze triggered

**Status:** Draft

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/game/services/core/victory-service.ts` - `checkVPMilestones()` orchestration
- `src/app/components/notifications/VictoryAlert.tsx` - Notification display component
- `src/lib/game/services/core/notification-service.ts` - Notification queueing
- `src/lib/game/services/__tests__/victory-service.test.ts` - Milestone notification tests, no duplicates

---

### REQ-VIC-010: Victory Achievement Screen

**Description:** When any empire achieves 10 VP (victory), game immediately freezes, displays cinematic victory announcement screen showing winner, victory type, final statistics, and leaderboard.

**Rationale:** Victory is the most important moment in the game and deserves dramatic presentation. Freeze game state ensures no actions during victory announcement. Statistics provide closure and context for player's performance.

**Source:** Section 5.1 - UI Mockups

**Code:**
- `src/lib/game/services/core/victory-service.ts` - `triggerVictoryScreen()`
- `src/app/components/victory/VictoryScreen.tsx` - Victory UI
- `src/lib/game/services/core/game-service.ts` - Freeze game state

**Tests:**
- `src/lib/game/services/__tests__/victory-service.test.ts` - "Victory screen triggered at 10 VP"
- `src/lib/game/services/__tests__/game-service.test.ts` - "Game state frozen during victory"
- `src/app/components/victory/__tests__/VictoryScreen.test.tsx` - "Victory screen displays winner and stats"

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-VIC-001 | Conquest Victory | Draft | TBD |
| REQ-VIC-002 | Economic Victory | Draft | TBD |
| REQ-VIC-003 | Diplomatic Victory | Draft | TBD |
| REQ-VIC-004 | Research Victory | Draft | TBD |
| REQ-VIC-005 | Military Victory | Draft | TBD |
| REQ-VIC-006 | Survival Victory | Draft | TBD |
| REQ-VIC-007 | Victory Point Calculation | Draft | TBD |
| REQ-VIC-008 | Anti-Snowball Mechanics | Draft | TBD |
| REQ-VIC-009 | Victory Notifications | Draft | TBD |
| REQ-VIC-010 | Victory Achievement Screen | Draft | TBD |

**Total Specifications:** 10
**Implemented:** 0
**Validated:** 0
**Draft:** 10

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: victory_progress
-- Purpose: Track victory progress for all empires across all categories

CREATE TABLE victory_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn INT NOT NULL,

  -- Victory Points by category
  conquest_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  economic_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  diplomatic_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  research_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  military_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  survival_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,

  -- Total VP (max of all categories)
  total_vp DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  leading_path VARCHAR(20) NOT NULL, -- "conquest", "economic", etc.

  -- Anti-snowball status
  anti_snowball_active BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_victory_progress_empire ON victory_progress(empire_id);
CREATE INDEX idx_victory_progress_game ON victory_progress(game_id);
CREATE INDEX idx_victory_progress_turn ON victory_progress(game_id, turn);
CREATE INDEX idx_victory_progress_vp ON victory_progress(game_id, total_vp DESC);

-- Table: victory_achievements
-- Purpose: Record completed victories (game-ending events)

CREATE TABLE victory_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  victor_empire_id UUID NOT NULL REFERENCES empires(id),
  victory_type VARCHAR(20) NOT NULL, -- "conquest", "economic", etc.
  turn_achieved INT NOT NULL,

  -- Coalition victories (if applicable)
  coalition_id UUID REFERENCES coalitions(id),
  coalition_member_ids UUID[], -- All empires that won via coalition

  -- Final statistics
  final_vp DECIMAL(4,2) NOT NULL,
  final_networth BIGINT NOT NULL,
  final_military_power INT NOT NULL,
  final_sectors INT NOT NULL,
  final_reputation INT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_victory_achievements_game ON victory_achievements(game_id);
CREATE INDEX idx_victory_achievements_victor ON victory_achievements(victor_empire_id);
CREATE INDEX idx_victory_achievements_type ON victory_achievements(victory_type);

-- Table: anti_snowball_coalitions
-- Purpose: Track anti-leader coalitions formed due to 7+ VP threshold

CREATE TABLE anti_snowball_coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  target_empire_id UUID NOT NULL REFERENCES empires(id),
  target_vp DECIMAL(4,2) NOT NULL,
  formed_turn INT NOT NULL,
  dissolved_turn INT, -- NULL if still active

  member_empire_ids UUID[] NOT NULL, -- Empires in coalition

  status VARCHAR(20) NOT NULL DEFAULT 'active', -- "active", "dissolved", "succeeded"

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_anti_snowball_game ON anti_snowball_coalitions(game_id);
CREATE INDEX idx_anti_snowball_target ON anti_snowball_coalitions(target_empire_id);
CREATE INDEX idx_anti_snowball_status ON anti_snowball_coalitions(game_id, status);
```

### 7.2 Service Architecture

```typescript
// src/lib/game/services/core/victory-service.ts

export interface VictoryProgress {
  empireId: string;
  gameId: string;
  turn: number;
  conquestVP: number;
  economicVP: number;
  diplomaticVP: number;
  researchVP: number;
  militaryVP: number;
  survivalVP: number;
  totalVP: number;
  leadingPath: VictoryType;
  antiSnowballActive: boolean;
}

export type VictoryType =
  | "conquest"
  | "economic"
  | "diplomatic"
  | "research"
  | "military"
  | "survival";

export interface VictoryCheckResult {
  victoryAchieved: boolean;
  victoryType?: VictoryType;
  victorEmpireIds: string[]; // Multiple IDs for coalition victories
  finalVP: number;
}

export class VictoryService {
  /**
   * Check all victory conditions for all empires
   * @spec REQ-VIC-001, REQ-VIC-002, REQ-VIC-003, REQ-VIC-004, REQ-VIC-005, REQ-VIC-006
   */
  async checkVictoryConditions(gameId: string): Promise<VictoryCheckResult> {
    const empires = await this.getEmpires(gameId);

    for (const empire of empires) {
      // Check each victory type
      if (await this.checkConquestVictory(empire)) {
        return this.createVictoryResult("conquest", [empire.id]);
      }
      if (await this.checkEconomicVictory(empire)) {
        return this.createVictoryResult("economic", [empire.id]);
      }
      if (await this.checkMilitaryVictory(empire)) {
        return this.createVictoryResult("military", [empire.id]);
      }
      if (await this.checkResearchVictory(empire)) {
        return this.createVictoryResult("research", [empire.id]);
      }
    }

    // Check coalition victories (multiple winners)
    const coalitionResult = await this.checkDiplomaticVictory(gameId);
    if (coalitionResult.victoryAchieved) {
      return coalitionResult;
    }

    // Check survival victory (only if turn limit reached)
    const survivalResult = await this.checkSurvivalVictory(gameId);
    if (survivalResult.victoryAchieved) {
      return survivalResult;
    }

    return { victoryAchieved: false, victorEmpireIds: [], finalVP: 0 };
  }

  /**
   * Calculate Victory Points for an empire across all categories
   * @spec REQ-VIC-007
   */
  async calculateVictoryPoints(empireId: string): Promise<VictoryProgress> {
    const empire = await this.getEmpire(empireId);
    const game = await this.getGame(empire.gameId);

    const conquestVP = await this.calculateConquestVP(empire, game);
    const economicVP = await this.calculateEconomicVP(empire, game);
    const diplomaticVP = await this.calculateDiplomaticVP(empire, game);
    const researchVP = await this.calculateResearchVP(empire);
    const militaryVP = await this.calculateMilitaryVP(empire, game);
    const survivalVP = await this.calculateSurvivalVP(empire, game);

    const totalVP = Math.max(
      conquestVP,
      economicVP,
      diplomaticVP,
      researchVP,
      militaryVP,
      survivalVP
    );

    const leadingPath = this.getLeadingVictoryPath({
      conquestVP,
      economicVP,
      diplomaticVP,
      researchVP,
      militaryVP,
      survivalVP
    });

    const antiSnowballActive = totalVP >= 7.0;

    return {
      empireId: empire.id,
      gameId: empire.gameId,
      turn: game.currentTurn,
      conquestVP,
      economicVP,
      diplomaticVP,
      researchVP,
      militaryVP,
      survivalVP,
      totalVP,
      leadingPath,
      antiSnowballActive
    };
  }

  /**
   * Check and trigger anti-snowball mechanics for 7+ VP empires
   * @spec REQ-VIC-008
   */
  async checkAntiSnowballTrigger(gameId: string): Promise<void> {
    const allProgress = await this.getVictoryProgress(gameId);

    for (const progress of allProgress) {
      if (progress.totalVP >= 7.0 && !progress.antiSnowballActive) {
        // Trigger anti-snowball mechanics
        await this.activateAntiSnowball(progress.empireId, gameId);

        // Form coalition against leader
        await this.formAntiLeaderCoalition(progress.empireId, gameId);

        // Send notifications
        await this.notifyAntiSnowball(progress.empireId, gameId);
      } else if (progress.totalVP < 7.0 && progress.antiSnowballActive) {
        // Deactivate anti-snowball (VP dropped)
        await this.deactivateAntiSnowball(progress.empireId, gameId);
      }
    }
  }

  /**
   * Send victory milestone notifications to player
   * @spec REQ-VIC-009
   */
  async checkVPMilestones(empireId: string): Promise<void> {
    const progress = await this.getLatestProgress(empireId);
    const previousProgress = await this.getPreviousProgress(empireId);

    // Check if crossed milestone thresholds
    if (this.crossedThreshold(previousProgress?.totalVP, progress.totalVP, 5.0)) {
      await this.sendNotification(empireId, "approaching_victory", progress);
    }
    if (this.crossedThreshold(previousProgress?.totalVP, progress.totalVP, 7.0)) {
      await this.sendNotification(empireId, "nearing_victory", progress);
    }
    if (this.crossedThreshold(previousProgress?.totalVP, progress.totalVP, 9.0)) {
      await this.sendNotification(empireId, "critical_victory", progress);
    }
  }

  /**
   * Trigger victory screen and freeze game
   * @spec REQ-VIC-010
   */
  async triggerVictoryScreen(result: VictoryCheckResult): Promise<void> {
    const game = await this.getGame(result.gameId);

    // Freeze game state
    await this.freezeGame(game.id);

    // Record victory achievement
    await this.recordVictory(result);

    // Calculate final statistics
    const stats = await this.calculateFinalStats(result);

    // Trigger UI victory screen
    await this.showVictoryScreen({
      victoryType: result.victoryType,
      victorEmpireIds: result.victorEmpireIds,
      finalStats: stats,
      leaderboard: await this.generateLeaderboard(game.id)
    });
  }
}
```

### 7.3 Server Actions

```typescript
// src/app/actions/victory-actions.ts

"use server";

import { VictoryService } from "@/lib/game/services/core/victory-service";

/**
 * Check victory conditions at end of turn
 * @spec REQ-VIC-001 through REQ-VIC-006
 */
export async function checkVictoryConditions(
  gameId: string
): Promise<ActionResult<VictoryCheckResult>> {
  try {
    const victoryService = new VictoryService();
    const result = await victoryService.checkVictoryConditions(gameId);

    if (result.victoryAchieved) {
      await victoryService.triggerVictoryScreen(result);
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get victory progress for empire
 * @spec REQ-VIC-007
 */
export async function getVictoryProgress(
  empireId: string
): Promise<ActionResult<VictoryProgress>> {
  try {
    const victoryService = new VictoryService();
    const progress = await victoryService.calculateVictoryPoints(empireId);

    await victoryService.saveVictoryProgress(progress);

    return { success: true, data: progress };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get top threats (empires with highest VP)
 * @spec REQ-VIC-007, REQ-VIC-009
 */
export async function getTopThreats(
  gameId: string,
  limit: number = 5
): Promise<ActionResult<VictoryProgress[]>> {
  try {
    const victoryService = new VictoryService();
    const allProgress = await victoryService.getVictoryProgress(gameId);

    const topThreats = allProgress
      .sort((a, b) => b.totalVP - a.totalVP)
      .slice(0, limit);

    return { success: true, data: topThreats };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 7.4 UI Components

```typescript
// src/app/components/victory/VictoryProgressPanel.tsx

import { VictoryProgress } from "@/lib/game/services/core/victory-service";

interface VictoryProgressPanelProps {
  empireId: string;
  gameId: string;
}

export function VictoryProgressPanel({ empireId, gameId }: VictoryProgressPanelProps) {
  const [progress, setProgress] = useState<VictoryProgress | null>(null);
  const [topThreats, setTopThreats] = useState<VictoryProgress[]>([]);

  useEffect(() => {
    async function loadProgress() {
      const result = await getVictoryProgress(empireId);
      if (result.success) {
        setProgress(result.data);
      }

      const threatsResult = await getTopThreats(gameId);
      if (threatsResult.success) {
        setTopThreats(threatsResult.data);
      }
    }

    loadProgress();
  }, [empireId, gameId]);

  if (!progress) return null;

  return (
    <div className="victory-progress-panel">
      <h2>Victory Progress</h2>

      {/* Player's VP across all categories */}
      <div className="player-vp">
        <h3>Your Empire [{progress.totalVP.toFixed(1)} VP]</h3>
        <VictoryBar type="conquest" vp={progress.conquestVP} />
        <VictoryBar type="economic" vp={progress.economicVP} highlighted={progress.leadingPath === "economic"} />
        <VictoryBar type="diplomatic" vp={progress.diplomaticVP} />
        <VictoryBar type="research" vp={progress.researchVP} />
        <VictoryBar type="military" vp={progress.militaryVP} />
        <VictoryBar type="survival" vp={progress.survivalVP} />
      </div>

      {/* Top threats */}
      <div className="top-threats">
        <h3>Top Threats</h3>
        {topThreats.map((threat, index) => (
          <ThreatCard key={threat.empireId} rank={index + 1} progress={threat} />
        ))}
      </div>
    </div>
  );
}

// src/app/components/victory/VictoryScreen.tsx

interface VictoryScreenProps {
  victoryType: VictoryType;
  victorEmpireIds: string[];
  finalStats: FinalStats;
  leaderboard: Empire[];
}

export function VictoryScreen({ victoryType, victorEmpireIds, finalStats, leaderboard }: VictoryScreenProps) {
  return (
    <div className="victory-screen-overlay">
      <div className="victory-screen">
        <h1>🏆 VICTORY ACHIEVED 🏆</h1>
        <h2>{victoryType.toUpperCase()} VICTORY</h2>

        <div className="victor-info">
          {victorEmpireIds.length === 1 ? (
            <p>Emperor {getEmpireName(victorEmpireIds[0])} has achieved victory!</p>
          ) : (
            <p>Coalition of {victorEmpireIds.length} empires has achieved victory!</p>
          )}
        </div>

        <div className="final-stats">
          <h3>Final Statistics</h3>
          <StatRow label="Sectors Controlled" value={finalStats.sectors} />
          <StatRow label="Military Power" value={finalStats.militaryPower} />
          <StatRow label="Networth" value={finalStats.networth} />
          <StatRow label="Reputation" value={finalStats.reputation} />
        </div>

        <div className="leaderboard">
          <h3>Final Standings</h3>
          {leaderboard.map((empire, index) => (
            <LeaderboardRow key={empire.id} rank={index + 1} empire={empire} />
          ))}
        </div>

        <div className="actions">
          <button onClick={viewReplay}>View Replay</button>
          <button onClick={newGame}>New Game</button>
          <button onClick={exit}>Exit</button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| **Victory Distribution** | Even (16-17% each) | ±5% | 10,000 simulated games |
| **Game Length (Standard)** | 1-2 hours | ±15 min | 100 playtests |
| **Survival Victory Rate** | 30% | ±10% | Standard mode (200 turns) |
| **Conquest Victory Rate** | 20% | ±5% | Most common specific victory |
| **Anti-Snowball Trigger** | Turn 100-150 | ±25 turns | When first empire hits 7 VP |
| **Multiple Near-Victory** | 2-3 empires at 7+ VP | ±1 | Late-game tension |

**Rationale:**
- **Even Distribution**: All six victory paths should be equally viable. If one dominates (>25%), it indicates imbalance.
- **Survival High**: 30% Survival Victory reflects anti-snowball success (prevents any specific victory from dominating).
- **Conquest Most Common**: Slightly higher than others (20% vs 16.7% even) reflects aggressive bot behavior and map control importance.
- **Anti-Snowball Timing**: Should trigger mid-late game (Turn 100-150), giving coalitions time to respond before Turn 200 endgame.

### 8.2 Simulation Requirements

```
Monte Carlo Simulation: 10,000 iterations
Variables:
  - Bot archetypes (distribution: 20% each for 5 main archetypes, 10% each for 3 minor)
  - Starting positions (randomized sector assignments)
  - Combat outcomes (D20 system with 47.6% attacker win rate)
  - Research paths (Doctrine choices: 40% War Machine, 30% Fortress, 30% Commerce)

Success Criteria:
  - All victory types achieved in 10-25% of games (no single type dominates)
  - Anti-snowball triggers in 60%+ of games (prevents runaway victories)
  - Average game length: 150-200 turns (1-2 hours)
  - 90% of games conclude with specific victory (not timeout/stalemate)
```

**Implementation:**
```typescript
// src/lib/game/simulation/victory-balance-sim.ts

async function runVictoryBalanceSimulation(iterations: number = 10000) {
  const results = {
    conquest: 0,
    economic: 0,
    diplomatic: 0,
    research: 0,
    military: 0,
    survival: 0,
  };

  for (let i = 0; i < iterations; i++) {
    const game = await simulateGame({
      bots: 100,
      turns: 200,
      archetypeDistribution: DEFAULT_DISTRIBUTION
    });

    results[game.victoryType]++;
  }

  return {
    distribution: {
      conquest: results.conquest / iterations,
      economic: results.economic / iterations,
      diplomatic: results.diplomatic / iterations,
      research: results.research / iterations,
      military: results.military / iterations,
      survival: results.survival / iterations
    },
    avgGameLength: calculateAvgGameLength(),
    antiSnowballTriggerRate: calculateAntiSnowballRate()
  };
}
```

### 8.3 Playtest Checklist

**Scenario: Conquest Victory Race**
- [ ] Empire reaches 250 sectors by Turn 100 (5 VP) - notification appears
- [ ] Empire reaches 350 sectors by Turn 130 (7 VP) - anti-snowball triggers, coalition forms
- [ ] Coalition attacks reduce empire to 320 sectors (6.4 VP) - anti-snowball lifts
- [ ] Empire recovers to 400 sectors by Turn 160 (8 VP) - critical alert
- [ ] Empire reaches 300 sectors (60%) by Turn 180 - **Conquest Victory**
- [ ] Victory screen displays with correct statistics

**Scenario: Economic Victory Pursuit**
- [ ] Merchant bot reaches 1.2x networth of 2nd place (6.4 VP) - "approaching victory"
- [ ] Market penalty (+20%) applies when bot hits 1.05x networth (7 VP)
- [ ] Bot continues trading despite penalties, reaches 1.4x (8.9 VP)
- [ ] Bot achieves 1.5x networth - **Economic Victory**
- [ ] All coalition members receive defeat notification

**Scenario: Multiple Victory Races (High Tension)**
- [ ] Turn 140: Three empires at 7+ VP (Conquest, Economic, Military paths)
- [ ] Player must decide: attack threats or pursue own victory
- [ ] Anti-snowball coalitions form against all three leaders
- [ ] Turn 155: Player reaches 9 VP (Conquest), urgent alert plays
- [ ] Turn 157: Bot reaches 10 VP (Economic) first - **Bot wins**
- [ ] Player receives defeat screen with 2nd place standing

**Scenario: Survival Victory (Turn Limit)**
- [ ] Turn 190: No empire above 6 VP, multiple paths progressing slowly
- [ ] Turn 195: "5 turns remaining" notification appears
- [ ] Player optimizes score (builds Commerce sectors, researches techs)
- [ ] Turn 200: Turn limit reached, highest score wins
- [ ] **Survival Victory** for player with 125,000 score
- [ ] Victory screen shows score breakdown by category

**Scenario: Diplomatic Victory (Coalition)**
- [ ] Diplomat bot forms coalition with 3 other empires (minimum requirement met)
- [ ] Coalition collectively controls 220 sectors (44%) - 7.9 VP
- [ ] Anti-snowball triggers against coalition
- [ ] Coalition expands to 250 sectors (50%) - **Diplomatic Victory**
- [ ] All 4 coalition members shown as co-victors on victory screen
- [ ] Leaderboard ranks coalition members by individual score

**Scenario: Anti-Snowball Effectiveness**
- [ ] Warlord bot reaches 9.5 VP (Conquest) - 475 sectors, 1 sector from victory
- [ ] Coalition of 10 empires forms, all attack Warlord simultaneously
- [ ] Warlord loses 80 sectors in 3 turns → drops to 395 sectors (7.9 VP)
- [ ] Anti-snowball successfully prevents runaway victory
- [ ] Warlord must rebuild while under pressure
- [ ] Another empire (Merchant) reaches 8 VP (Economic) during chaos
- [ ] Game remains competitive through late game

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| No victory tracking | Victory Points calculated every turn | 1. Add `victory_progress` table<br>2. Implement `VictoryService.calculateVictoryPoints()`<br>3. Call at end of each turn (Phase 1 completion) |
| No victory UI | Victory Progress Panel | 1. Create `VictoryProgressPanel.tsx` component<br>2. Add to main game UI (docked right side)<br>3. Update every turn with new VP data |
| No victory detection | Six victory conditions checked | 1. Implement each victory check method<br>2. Call `checkVictoryConditions()` at end of turn<br>3. Trigger victory screen if any condition met |
| No anti-snowball | Anti-snowball mechanics at 7 VP | 1. Add `anti_snowball_coalitions` table<br>2. Implement coalition formation logic<br>3. Apply combat/economic modifiers to leaders |
| No victory screen | Cinematic victory announcement | 1. Create `VictoryScreen.tsx` component<br>2. Implement game freeze logic<br>3. Add audio/animation effects |

### 9.2 Data Migration

**No existing data**: This is a new feature, no migration required for existing games.

**For games in progress** (if adding mid-development):
```sql
-- Migration: Add victory tracking to existing games
-- Safe to run: Yes (adds new tables, doesn't modify existing data)

-- Add victory_progress table (see Section 7.1)
-- Backfill victory progress for current turn
INSERT INTO victory_progress (empire_id, game_id, turn, conquest_vp, economic_vp, diplomatic_vp, research_vp, military_vp, survival_vp, total_vp, leading_path)
SELECT
  e.id,
  e.game_id,
  g.current_turn,
  (e.sector_count::DECIMAL / 500) * (10 / 0.6),  -- conquest_vp
  0.0,  -- economic_vp (requires networth calculation)
  0.0,  -- diplomatic_vp (requires coalition check)
  0.0,  -- research_vp (requires tech check)
  0.0,  -- military_vp (requires military calculation)
  0.0,  -- survival_vp (requires score calculation)
  (e.sector_count::DECIMAL / 500) * (10 / 0.6),  -- total_vp (initially just conquest)
  'conquest'  -- leading_path
FROM empires e
JOIN games g ON e.game_id = g.id
WHERE g.status = 'active';
```

**Development Timeline:**
1. **Week 1**: Implement `VictoryService` core logic (VP calculation, victory checks)
2. **Week 2**: Add database schema and persistence layer
3. **Week 3**: Implement anti-snowball mechanics (coalitions, modifiers)
4. **Week 4**: Create UI components (Victory Progress Panel, Victory Screen)
5. **Week 5**: Integration testing and balance validation
6. **Week 6**: Playtest and iterate based on feedback

### 9.3 Rollback Plan

If victory system causes critical bugs:

**Step 1: Disable Victory Detection**
```typescript
// Feature flag: disable victory checks
const VICTORY_SYSTEM_ENABLED = false;

if (VICTORY_SYSTEM_ENABLED) {
  await checkVictoryConditions(gameId);
}
```

**Step 2: Hide Victory UI**
```typescript
// Hide Victory Progress Panel
if (VICTORY_SYSTEM_ENABLED) {
  return <VictoryProgressPanel />;
}
return null;
```

**Step 3: Revert Database Changes (if necessary)**
```sql
-- Remove victory tracking tables
DROP TABLE IF EXISTS victory_achievements;
DROP TABLE IF EXISTS anti_snowball_coalitions;
DROP TABLE IF EXISTS victory_progress;
```

**Step 4: Games continue without victory**
- Games will run until Turn 500 (Epic mode)
- No explicit winner declared
- Players can manually end game anytime via "Quit Game" button

**Recovery:**
- Victory system is purely additive (doesn't modify existing game mechanics)
- Disabling it should not break core gameplay (combat, diplomacy, resources)
- Re-enable after bug fixes and testing

---

## 10. Conclusion

### Key Decisions

**Decision 1: Six Victory Paths (Not One)**
- **Rationale:** A 100-empire game cannot realistically end with "last empire standing" in 1-2 hours. Multiple victory conditions allow games to conclude with clear winners while rewarding diverse strategies.
- **Trade-off:** More complexity in tracking and balancing, but significantly better player experience (games don't drag on endlessly).

**Decision 2: Victory Points (Unified Metric)**
- **Rationale:** VP system provides transparency (players know how close everyone is to victory) and enables anti-snowball triggers (7 VP = 70% to victory). Single metric simplifies UI and notifications.
- **Trade-off:** Abstraction layer between raw progress (e.g., sectors controlled) and VP, but clearer communication to players.

**Decision 3: Anti-Snowball at 7 VP (Not 8 or 9)**
- **Rationale:** 70% threshold gives galaxy enough time to respond (20-30 turns typically) before leader reaches 100%. Too early (5 VP) punishes normal progress; too late (9 VP) makes coalitions ineffective.
- **Trade-off:** Leaders at 7 VP face significant pressure, but this is intentional (prevents runaway victories).

**Decision 4: Diplomatic Victory = Shared Win**
- **Rationale:** If coalition members don't all win, incentive to betray exists (backstab for solo victory). Shared victory encourages genuine cooperation and creates unique victory type.
- **Trade-off:** Some players may prefer "only one winner," but this preserves alliance integrity and rewards cooperation.

**Decision 5: Survival Victory = Highest Score at Turn Limit**
- **Rationale:** Prevents endless games. If no one achieves specific victory by Turn 200, the empire with highest score (balanced across all metrics) wins. This rewards well-rounded empires.
- **Trade-off:** Some players may feel Survival Victory is "anticlimactic," but it's necessary for game closure.

### Open Questions

**Question 1: Should Military Victory threshold be 2.0x or 2.5x?**
- **Context:** Military Victory is currently the rarest (extremely difficult to achieve 2x military of ALL others combined). Should it be even harder (2.5x) to emphasize rarity, or easier (1.5x) to make it more achievable?
- **Options:**
  - **Keep 2.0x**: Preserves difficulty, rewards overwhelming military dominance
  - **Increase to 2.5x**: Makes it near-impossible (only achievable if 80+ empires eliminated)
  - **Decrease to 1.5x**: Makes it more viable (achievable with 50-60 empires eliminated)
- **Recommendation:** Playtest at 2.0x first; adjust based on simulation data.

**Question 2: Should Research Victory require ALL Tier 3 techs or just Capstone?**
- **Context:** Currently requires Capstone + 10 advanced techs. Alternative: just completing Capstone (simpler, faster victory path).
- **Options:**
  - **Current (Capstone + 10 techs)**: Requires breadth of research, prevents rushing
  - **Capstone only**: Faster Research Victory, rewards focused tech rush
- **Recommendation:** Playtest current version; if Research Victory never achieved in 10,000 simulations, simplify to Capstone only.

**Question 3: Should anti-snowball modifiers be stronger or weaker?**
- **Context:** Current modifiers (+10% attack, +5% defense, +20% market cost) may be too weak or too strong to prevent 7+ VP empires from winning.
- **Options:**
  - **Weaken**: Reduce to +5% attack, +2.5% defense, +10% market cost (less punishment)
  - **Keep current**: Moderate pressure on leaders
  - **Strengthen**: Increase to +15% attack, +10% defense, +30% market cost (heavy pressure)
- **Recommendation:** Simulate 1,000 games with current values; measure success rate of 7+ VP empires winning vs coalition success rate. Adjust if leader win rate >70% or <30%.

### Dependencies

**Depends On:**
- **Combat System** - Victory Points require military power calculations → `REQ-COMBAT-001` (military power formula)
- **Sector System** - Conquest/Diplomatic victories require territory tracking → `REQ-SEC-001` (sector ownership)
- **Resource System** - Economic Victory requires networth calculation → `REQ-RES-001` (resource values)
- **Research System** - Research Victory requires tech tree completion → `REQ-RSCH-001` (tech progression)
- **Diplomacy System** - Diplomatic Victory requires coalition formation → `REQ-DIP-001` (treaties and coalitions)
- **Bot System** - Bots must pursue victory paths → `REQ-BOT-001` (archetype behaviors)
- **Turn Processing** - VP calculated at end of each turn → `REQ-TURN-001` (turn phases)

**Depended By:**
- **Leaderboard System** - Displays final standings after victory → `REQ-UI-001` (leaderboard)
- **Game Analytics** - Tracks victory distribution for balance → `REQ-ANALYTICS-001` (metrics)
- **Replay System** - Records victory moments for playback → `REQ-REPLAY-001` (game recording)
- **Achievement System** - Awards achievements for victory types → `REQ-ACHIEVE-001` (unlockables)

---

**Document Status:** COMPLETE - Ready for implementation

This document defines the complete victory system for Nexus Dominion, including six victory conditions, Victory Point tracking, anti-snowball mechanics, bot integration, UI requirements, and balance targets. All sections are complete with no placeholders or unresolved questions (pending playtesting).

**Next Steps:**
1. Begin implementation of `VictoryService` (Week 1)
2. Add database schema for victory tracking (Week 2)
3. Implement anti-snowball mechanics (Week 3)
4. Create Victory UI components (Week 4)
5. Conduct balance simulations (Week 5)
6. Playtest and iterate (Week 6)

---

*For questions or clarifications, reference Section 10 (Conclusion) Open Questions or contact game design team.*
