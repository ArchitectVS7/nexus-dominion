# Nexus Dominion: Product Requirements Document

**Version:** 3.0
**Date:** January 2026
**Last Updated:** January 3, 2026
**Status:** Active - Post-Redesign (Phases 1-3 Complete)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Game Overview](#2-game-overview)
3. [Core Gameplay Loop](#3-core-gameplay-loop)
4. [Resource System](#4-resource-system)
5. [Sector System](#5-sector-system)
6. [Galaxy Structure & Geography](#6-galaxy-structure--geography)
7. [Military & Combat System](#7-military--combat-system)
8. [Bot AI System](#8-bot-ai-system)
9. [Diplomacy System](#9-diplomacy-system)
10. [Research System](#10-research-system)
11. [Scenario System](#11-scenario-system)
12. [Mid-Game Engagement System](#12-mid-game-engagement-system)
13. [New Player Experience](#13-new-player-experience)
14. [User Interface](#14-user-interface)
15. [Tech Stack](#15-tech-stack)
16. [Development Phases](#16-development-phases)
17. [Success Metrics](#17-success-metrics)
18. [Out of Scope](#18-out-of-scope)
19. [Appendix: Future Expansion Content](#19-appendix-future-expansion-content)

---

## 1. Executive Summary

### Product Vision

**Nexus Dominion** is a single-player turn-based space empire strategy game that revives the classic **Solar Realms Elite** (1990) BBS door game. Players compete against AI-controlled bot opponents to build the most powerful galactic empire through economic development, military conquest, research advancement, and diplomatic maneuvering.

### Target Audience

- **Primary**: Nostalgic gamers who played SRE, Trade Wars, or similar BBS games
- **Secondary**: Strategy game enthusiasts (Civilization, Master of Orion, 4X fans)
- **Tertiary**: Casual gamers seeking accessible strategy experiences

### Core Differentiator

Nexus Dominion transforms the original weeks-long multiplayer experience into a **1-2 hour single-player session** with:
- AI opponents with distinct personalities and strategies
- Instant turn processing (no waiting)
- Scenario-based victory conditions for replayability
- Modern LCARS-inspired Star Trek aesthetic

### Key Decisions

| Decision | Choice |
|----------|--------|
| Tech Stack | TypeScript + Next.js (Greenfield Build) |
| Resources | 4 (Food, Credits, Ore, Petroleum) + Research Points |
| Starting Sectors | **5** (reduced from 9 for faster eliminations) |
| Bot Count | 25 (v0.5 MVP) → 100 personas (v0.6+) |
| Galaxy Structure | **10 Sectors** (10 empires each, regional gameplay) |
| Combat System | **Unified Resolution** (single D20 roll, 47.6% attacker win rate) |
| Research System | **3-Tier Draft** (Doctrines → Specializations → Capstones) |
| Turn Processing | Instant (<2 seconds target) |
| Multiplayer | Single-player v1; Async multiplayer v2 |
| UI Style | Star Trek LCARS-inspired |
| Save System | Auto-save only (Ironman mode) |
| Architecture | Unified Actor Model (bots/players interchangeable) |

### Architecture Principles

1. **Unified Actor Model**: Bots and human players flow through identical turn pipeline
2. **Async-First Design**: Same codebase supports single-player and future async multiplayer
3. **Greenfield Build**: Pure TypeScript rewrite (legacy PHP was reference only)
4. **Bot Opacity**: Players cannot see bot archetype — must deduce through observation
5. **Consequence Over Limits**: Game events respond to player behavior, not hard caps
6. **Ironman Mode**: Auto-save only, no rewinding decisions

---

## 2. Game Overview

### Genre
Turn-based 4X space strategy (eXplore, eXpand, eXploit, eXterminate)

### Platform
Web application (desktop-first, responsive for tablet/mobile)

### Mode
Single-player vs AI bot opponents

### Core Experience
Players manage a galactic empire across 200 turns (configurable), making decisions about:
- Resource production and consumption
- Military recruitment and combat
- Research and technology advancement
- Diplomatic relations with bot empires
- Covert operations and espionage

### Win/Lose Conditions

Victory and defeat follow **6 clear paths**:

| Victory | Condition | Playstyle |
|---------|-----------|-----------|
| **Conquest** | Control 60% of territory | Aggressive expansion |
| **Economic** | 1.5× networth of 2nd place | Builder/trader |
| **Diplomatic** | Coalition controls 50% territory | Alliance politics |
| **Research** | Complete tech tree (Tier 3) | Turtle/tech rush |
| **Military** | 2× military of all others combined | Domination |
| **Survival** | Highest score at turn 200 | Balanced play |

**Defeat Conditions**:
- Empire collapses (bankruptcy, civil revolt, elimination)
- Mathematically impossible to achieve any victory (warning given)

---

## 3. Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    TURN STRUCTURE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. REVIEW PHASE                                            │
│     ├── Check resources, events, messages                   │
│     ├── Read bot communications                             │
│     └── Assess threats and opportunities                    │
│                                                             │
│  2. BUILD PHASE                                             │
│     ├── Colonize/release sectors                            │
│     ├── Train military units                                │
│     ├── Invest in research                                  │
│     └── Manage production rates                             │
│                                                             │
│  3. ACTION PHASE                                            │
│     ├── Launch attacks (invasion/guerilla)                  │
│     ├── Execute covert operations                           │
│     ├── Manage diplomacy (treaties, coalitions)             │
│     └── Trade on global market                              │
│                                                             │
│  4. END TURN                                                │
│     ├── Player confirms turn end                            │
│     ├── All bots process instantly (<2s target)             │
│     ├── Resources update                                    │
│     ├── Combat resolves                                     │
│     ├── Events trigger                                      │
│     └── Next turn begins                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Turn Processing Order

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

### Turn Timing
- **No real-world waiting**: Bots process in milliseconds
- **Performance target**: <2 seconds total turn processing
- **Turn limit**: Configurable per scenario (default: 200)
- **Expected game length**: 1-2 hours

---

## 4. Resource System

### 4.1 Primary Resources

| Resource | Description | Primary Source | Primary Use |
|----------|-------------|----------------|-------------|
| **Credits** | Currency | Commerce sectors, taxes | Buying, maintenance |
| **Food** | Sustenance | Food sectors | Population, soldiers |
| **Ore** | Industrial | Ore sectors | Military maintenance |
| **Petroleum** | Fuel | Petroleum sectors | Military fuel |

### 4.2 Research Points

- **Source**: Generated by Research sectors
- **Primary Use**: Tech tree progression
- **Trading**: Can be sold on global market for credits
- **Boosts**: Can be spent for temporary buffs:
  - Combat effectiveness (+10% for 1 turn)
  - Production multiplier (+15% for 1 turn)
  - Covert success bonus (+20% for 1 turn)

### 4.3 Resource Balance

**Income** (per turn):
- Sector production
- Population taxes
- Market trading

**Expenses** (per turn):
- Sector maintenance (168 credits/sector)
- Military maintenance (per unit)
- Loan payments

**Deficit Handling**:
- Auto-purchase from market at current prices
- If can't afford: starvation, desertion, effectiveness loss
- Severe deficit: bankruptcy and empire collapse

### 4.4 Population & Civil Status

Population happiness directly affects economic output through an income multiplier:

| Status | Income Multiplier | Caused By |
|--------|-------------------|-----------|
| **Ecstatic** | 4× | Many victories, high education |
| **Happy** | 3× | Stable empire, winning wars |
| **Content** | 2× | Normal state |
| **Neutral** | 1× | Minor problems |
| **Unhappy** | 0× (no bonus) | Starvation, battle losses |
| **Angry** | Penalties | Severe problems persist |
| **Rioting** | Severe penalties | Extended problems |
| **Revolting** | Empire collapse risk | Critical failure state |

**Population Mechanics**:
- **Growth**: Population grows each turn (if fed)
- **Consumption**: Each citizen eats 0.05 food/turn
- **Housing**: Urban sectors increase population cap
- **Recruitment**: Population required for military units (see Pop column in 7.1)
- **Education Sectors**: Improve civil status over time

### 4.5 Networth Calculation

Networth determines rankings, victory conditions, and attack restrictions:

```
Networth = (Sectors × 10)
         + (Soldiers × 0.0005)
         + (Fighters × 0.001)
         + (Stations × 0.002)
         + (Light Cruisers × 0.001)
         + (Heavy Cruisers × 0.002)
         + (Carriers × 0.005)
         + (Covert Agents × 0.001)
```

**Networth Uses**:
- Scoreboard ranking
- Economic victory condition (1.5× of 2nd place)
- Attack restrictions (can't attack much weaker empires)
- Coalition power calculation

---

## 5. Sector System

### 5.1 Starting Configuration

Players begin with **5 sectors** (reduced from 9 for faster eliminations):

| Sector Type | Count | Initial Production |
|-------------|-------|--------------------|
| Food | 1 | 160 food/turn |
| Ore | 1 | 112 ore/turn |
| Petroleum | 1 | 92 petro/turn |
| Commerce | 1 | 8,000 credits/turn |
| Urban | 1 | Population cap + 1,000 credits |

### 5.2 Sector Types (7 Active)

| Type | Production | Base Cost | Special Effect |
|------|------------|-----------|----------------|
| **Food** | 160 food | 8,000 | Essential sustenance |
| **Ore** | 112 ore | 6,000 | Military material |
| **Petroleum** | 92 petro | 11,500 | Creates pollution |
| **Commerce** | 8,000 credits | 8,000 | Main income |
| **Urban** | +pop cap, +1,000 cr | 8,000 | House citizens |
| **Education** | +civil status | 8,000 | Happiness |
| **Government** | +300 agents | 7,500 | Covert ops |
| **Research** | Research points | 23,000 | Tech tree |

**Disabled Types** (deferred to expansion):
- Industrial, Supply, Anti-Pollution

### 5.3 Sector Mechanics

**Colonizing**:
- Cost increases as you own more: `BaseCost × (1 + OwnedSectors × 0.05)`
- Unlimited colonization per turn (if affordable)

**Releasing**:
- Sell sectors at 50% of current price
- Immediate effect

---

## 6. Galaxy Structure & Geography

### 6.1 Sector-Based Galaxy

**Design Philosophy**: "Geography creates strategy"

The galaxy is divided into **10 sectors**, each containing 8-10 empires. This creates manageable cognitive load while preserving the "100 empires" scale.

#### Sector Structure

```
Galaxy = 10 Sectors
Each Sector = 8-10 Empires
Player starts in 1 sector with ~9 neighbors

Phased Gameplay:
- Turn 1-20:    Focus on your sector (consolidate)
- Turn 21-40:   Expand to adjacent sectors (via borders)
- Turn 41-60:   Build wormholes to distant sectors
- Turn 61-200:  Multi-sector empire management
```

#### Mental Model

- **Sector** = Your neighborhood in space
- **Borders** = Roads to adjacent neighborhoods
- **Wormholes** = Highways to distant regions (fast but expensive)

### 6.2 Attack Accessibility

Not all empires are attackable at all times. Accessibility depends on sector connections:

| Connection Type | Accessibility | Attack Cost Modifier | Notes |
|-----------------|---------------|---------------------|-------|
| **Same Sector** | Always | 1.0× (normal) | Can attack freely |
| **Adjacent Sector** | After border discovery | 1.2× | Requires Turn 10-15+ |
| **Wormhole Connection** | After construction | 1.5× | Requires Research 4+, 6-15 turns to build |
| **Unreachable** | Never | N/A | Cannot attack without connection |

**Example**: If you're in Sector D and want to attack an empire in Sector B, you must either:
1. Expand through Sector C (if it connects D → C → B), OR
2. Build a wormhole from D → B (expensive but instant access)

### 6.3 Sector Balancing

At game setup, sectors are algorithmically balanced for fairness:

```typescript
// Sector balancing algorithm
function balanceSectors(empires: Empire[]): Map<string, Sector> {
  const sectorCount = 10;
  const empiresPerSector = Math.floor(empires.length / sectorCount);

  // Sort empires by starting networth
  empires.sort((a, b) => a.startingNetworth - b.startingNetworth);

  // Distribute to ensure each sector has similar total networth
  const sectors = new Map();
  for (let i = 0; i < sectorCount; i++) {
    const sectorEmpires = distributeEvenly(empires, i);
    sectors.set(`sector-${i}`, {
      empires: sectorEmpires,
      totalNetworth: calculateTotal(sectorEmpires),
      botTierMix: ensureTierMix(sectorEmpires) // Mix of tiers 1-4
    });
  }

  return sectors;
}
```

**Fairness Criteria**:
- Each sector's total networth within ±10% of average
- Mix of bot tiers (1-2 Tier 2, 6-7 Tier 3, 1-2 Tier 4)
- Similar resource distribution across sectors
- **No luck-based advantages** - skill determines victory

### 6.4 Wormhole System

**Purpose**: Connect distant sectors without slow border expansion

**Construction Requirements**:
- **Cost**: 15,000-40,000 credits (based on distance)
- **Petroleum**: 300-800 (fuel for construction)
- **Time**: 6-15 turns (multi-turn construction queue)
- **Research**: Level 4+ (unlocks around Turn 15-20)

**Slot Limits** (prevents late-game sector collapse):
- **Base**: 2 wormholes per empire
- **Research Level 6**: +1 slot (total: 3)
- **Research Level 8**: +1 slot (total: 4)
- **Maximum**: 4 wormholes per empire (hard cap)

**Strategic Value**:
- Bypass crowded borders
- Access high-value sectors (Core Worlds, Mining Belt)
- Create surprise attack vectors
- Expensive investment = meaningful choice (which 2-4 sectors to connect?)

### 6.5 Sector Traits (Future Enhancement)

Different sectors will have distinct characteristics:

| Sector Name | Trait | Benefit |
|-------------|-------|---------|
| **Core Worlds** | Economic Hub | +20% credit generation |
| **Mining Belt** | Rich Resources | +20% ore production |
| **Frontier** | Unexplored | Bonus research for discoveries |
| **Dead Zone** | Harsh Conditions | -20% population growth (but less competition) |
| **Nebula Region** | Stealth | Covert operations +20% success |

---

## 7. Military & Combat System

### 7.1 Unit Types (Rebalanced)

**Basic Units (Credits Only):**

| Unit | Role | Cost | Pop | Attack | Defense |
|------|------|------|-----|--------|---------|
| **Soldiers** | Ground combat | 50 | 0.2 | 1 | 1 |
| **Fighters** | Orbital combat | 200 | 0.4 | 3 | 2 |
| **Carriers** | Troop transport | 2,500 | 3.0 | 12 | 10 |
| **Generals** | Command soldiers | 1,000 | 1.0 | — | — |
| **Covert Agents** | Espionage | 500 | 1.0 | — | — |

**Tier 2 Units (Require Research 2+):**

| Unit | Credits | Research | Attack | Defense |
|------|---------|----------|--------|---------|
| **Light Cruisers** | 5,000 | 2 | 10 | 20 |
| **Defense Stations** | 3,000 | 3 | 50 | 50 (2× on defense) |

**Tier 3 Units (Advanced, Research 4+):**

| Unit | Credits | Research | Attack | Defense |
|------|---------|----------|--------|---------|
| **Heavy Cruisers** | 15,000 | 4 | 25 | 50 |

### 7.2 Combat Resolution (Unified System)

**Design Change (v3.0)**: Replaced sequential 3-phase combat with unified resolution for better balance.

**Previous Problem**: Sequential phases (Space → Orbital → Ground) resulted in 1.2% attacker win rate and 0 eliminations in testing.

**New Solution**: Single combat roll with multiple outcomes.

**Implementation**: `src/lib/combat/unified-combat.ts`

```typescript
// Unified combat resolution
function resolveUnifiedInvasion(
  attackerForces: Forces,
  defenderForces: Forces,
  defenderSectorCount: number
): CombatResult {
  // Calculate total combat power for each side
  const attackerPower = calculateUnifiedPower(attackerForces);
  const defenderPower = calculateUnifiedPower(defenderForces) * 1.10; // Defender advantage

  // Determine winner with D20-style variance
  const { winner, attackerWinChance } = determineUnifiedWinner(
    attackerPower,
    defenderPower
  );

  // Calculate casualties
  const { attackerCasualties, defenderCasualties } = calculateUnifiedCasualties(
    attackerForces,
    defenderForces,
    attackerPower,
    defenderPower,
    winner
  );

  // Determine sectors captured
  let sectorsCaptured = 0;
  if (winner === "attacker") {
    const capturePercent = 0.05 + Math.random() * 0.10; // 5-15%
    sectorsCaptured = Math.max(1, Math.floor(defenderSectorCount * capturePercent));
  }

  return {
    outcome: winner === "attacker" ? "attacker_victory" : "defender_victory",
    sectorsCaptured,
    attackerCasualties,
    defenderCasualties,
    summary: generateDramaticSummary(winner, sectorsCaptured, attackerWinChance)
  };
}
```

**Key Features**:
- **Balanced Win Rate**: 47.6% attacker win rate with equal forces (validated)
- **Defender Advantage**: 1.10× power multiplier (10% home turf bonus)
- **Dramatic Outcomes**: 6 possible results create varied narratives
- **Fast Elimination**: Combined with 5 starting sectors (down from 9)

**Test Validation** (from `unified-combat.test.ts`):
- Equal forces: 47.6% attacker win rate ✅
- Strong attacker (1.5x): 62.2% win rate ✅
- Weak attacker (0.5x): 25.4% win rate ✅

**Design Rationale**:
D-Day wasn't "win air superiority, THEN naval battle, THEN beach landing" - it was a **unified operation** where all elements contributed simultaneously.

### 7.3 Combat Types

**Full Invasion**:
- Full-scale attack to capture sectors
- Requires carriers for troop transport
- Single unified resolution (not phases)
- Victory outcomes: 5-15% sector capture (based on roll)
- Limit: One invasion per turn

**Guerilla Attack**:
- Quick raid using soldiers only
- No carriers required
- Lower risk, lower reward
- Good for harassment

**Nuclear Warfare** (unlocks Turn 100):
- Requires Black Market purchase (500M credits)
- 40% base population damage
- Target may detect and foil

### 7.4 Retreat & Reinforcements

| Mechanic | Rule |
|----------|------|
| **Retreat** | Allowed, but suffer 15% "attack of opportunity" losses |
| **Reinforcements** | Request from alliance, arrival = distance-based (1-5 turns) |
| **Request System** | Alliance member gets notification, can Accept/Deny |
| **Deny Consequence** | Alliance standing drops, trust decay, potential diplomatic event |
| **Fog of War** | See total military power, not composition. Scouts/spies reveal details |

### 7.5 Army Effectiveness

- **Rating**: 0-100%
- **Affects**: Combat damage dealt
- **Recovery**: +2% per turn
- **Victory bonus**: +5-10%
- **Defeat penalty**: -5%
- **Unpaid penalty**: Drops if maintenance not met

### 7.6 Attack Restrictions

Cannot attack:
- Empires in protection period (first 20 turns)
- Coalition members
- Empires with active treaties
- Significantly weaker empires (unless they attacked first)

### 7.7 Covert Operations

Covert agents enable asymmetric warfare through espionage and sabotage.

**Covert Points**:
- Earn 5 points per turn (max 50)
- Operations consume points based on complexity
- Agent capacity = Government sectors × 300

**Available Operations**:

| Operation | Effect | Cost | Risk |
|-----------|--------|------|------|
| **Send Spy** | Reveal enemy stats and composition | Low | Low |
| **Insurgent Aid** | Support rebels, reduce civil status | Medium | Medium |
| **Support Dissension** | Worsen target's civil status | Medium | Medium |
| **Demoralize Troops** | Reduce army effectiveness | Medium | Medium |
| **Bombing Operations** | Destroy resources/production | High | High |
| **Relations Spying** | Reveal diplomacy and alliances | Low | Low |
| **Take Hostages** | Demand ransom payment | High | High |
| **Carriers Sabotage** | Damage carrier fleet | Very High | Very High |
| **Communications Spying** | Intercept messages | Medium | Low |
| **Setup Coup** | Attempt to overthrow government | Very High | Very High |

**Operation Outcomes**:
- **Success**: Effect achieved
- **Failure**: No effect, agent may be caught
- **Agent Caught**: Lose agent, target notified, diplomatic penalty

**Success Rate Factors**:
- Your agent count vs target's agent count
- Target's Government sector count
- Operation difficulty
- Random variance (±20%)

---

## 8. Bot AI System

### 8.1 Overview

AI bots populate the galaxy with varying intelligence and personalities. Bots create a dynamic, unpredictable game world. **Players cannot see bot archetype** — they must deduce personality through observation.

### 8.2 Bot Tiers

| Tier | v0.5 Count | v0.6+ Count | Intelligence | Description |
|------|------------|-------------|--------------|-------------|
| **Tier 4** | 25 | 25 | Random/Chaos | Weighted random decisions, placeholder names |
| **Tier 3** | — | 25 | Simple/Mid-tier | Basic decision trees, template messages |
| **Tier 2** | — | 25 | Strategic | Sophisticated trees with archetypes |
| **Tier 1 Scripted** | — | 15 | Elite Scripted | Sophisticated algorithms, archetype-driven, no LLM |
| **Tier 1 LLM** | — | 10 | Elite LLM | Natural language, adaptive strategies, LLM API |

**Player Selection Options**: 10, 25, 50, or 100 bots (scaled proportionally)

### 8.3 MVP Scope (v0.5 - Tier 4 Only)

**Tier 4 (Random/Chaotic)**:
- 25 bots with placeholder names
- Weighted random actions each turn
- No strategic planning
- No messaging (silent bots)
- Creates baseline challenge

### 8.4 v0.6 Scope (Tiers 2-4)

**Tier 3 (Simple)**:
- Basic decision trees
- Template-based messages (30-45 per persona)
- Responds to threats
- Predictable patterns

**Tier 2 (Strategic)**:
- Archetype-based behavior
- Personality traits with mechanical effects
- Coalition formation
- Emotional state system

### 8.5 v0.7+ Scope (Tier 1)

**Tier 1 Scripted (Elite Scripted)** - 15 bots:
- Sophisticated algorithmic decision-making
- Archetype-driven behavior with full strategic weight system
- Uses same decision framework as LLM bots (fallback compatible)
- No API calls - fully deterministic

**Tier 1 LLM (Elite LLM)** - 10 bots:
- Connected to LLM API with provider failover (Groq → Together → OpenAI)
- Natural language messages reflecting persona voice
- Adaptive strategies based on full game state context
- Async processing (decisions computed for NEXT turn during player's turn)
- Falls back to Tier 1 Scripted behavior on API failure

### 8.6 Bot Archetypes

| Archetype | Style | Key Behaviors | Passive Ability |
|-----------|-------|---------------|-----------------|
| **Warlord** | Aggressive | Military focus, demands tribute | War Economy: -20% military cost when at war |
| **Diplomat** | Peaceful | Alliance-seeking, mediates conflicts | Trade Network: +10% income per alliance |
| **Merchant** | Economic | Trade focus, buys loyalty | Market Insight: Sees next turn's market prices |
| **Schemer** | Deceptive | False alliances, betrayals | Shadow Network: -50% agent cost, +20% success |
| **Turtle** | Defensive | Heavy defense, never attacks first | Fortification Expert: 2× defensive structure effectiveness |
| **Blitzkrieg** | Early aggression | Fast strikes, cripples neighbors | — |
| **Tech Rush** | Research | Prioritizes tech, late-game power | — |
| **Opportunist** | Vulture | Attacks weakened players | — |

### 8.7 Bot Persona System (v0.6+)

```typescript
interface BotPersona {
  id: string;                    // "commander_hexen"
  name: string;                  // "Commander Hexen"
  archetype: Archetype;

  voice: {
    tone: string;                // "gruff military veteran"
    quirks: string[];            // ["never says please", "references old wars"]
    vocabulary: string[];        // ["soldier", "campaign", "flank"]
    catchphrase?: string;        // "Victory favors the prepared"
  };

  templates: {                   // 2-3 seeds per category (15 categories)
    greeting: string[];
    battleTaunt: string[];
    victoryGloat: string[];
    defeat: string[];
    tradeOffer: string[];
    allianceProposal: string[];
    betrayal: string[];
    // ... 8 more categories
  };

  usedPhrases: Set<string>;      // Prevent repetition
}
```

**100 unique personas** with distinct names, voices, and template libraries.

### 8.8 Emotional State System (v0.6+)

| Emotion | Decision | Alliance | Aggression | Negotiation |
|---------|----------|----------|------------|-------------|
| **Confident** | +5% | -20% | +10% | +10% |
| **Arrogant** | -15% | -40% | +30% | -30% |
| **Desperate** | -10% | +40% | -20% | -20% |
| **Vengeful** | -5% | -30% | +40% | -40% |
| **Fearful** | -10% | +50% | -30% | +10% |
| **Triumphant** | +10% | -10% | +20% | -20% |

- States are **hidden** from player (inferred from messages)
- Intensity scales effects (0.0 - 1.0)
- Mechanical impact on decisions, not just flavor

### 8.9 Relationship Memory (v0.6+)

**Weighted, Not Expiring:**
- Events have weight (1-100) and decay resistance
- Major events resist being "washed away"
- 20% of negative events are **permanent scars**

| Event | Weight | Decay Resistance |
|-------|--------|------------------|
| Captured sector | 80 | HIGH |
| Saved from destruction | 90 | HIGH |
| Broke alliance | 70 | HIGH |
| Won battle | 40 | MEDIUM |
| Trade accepted | 10 | LOW |
| Message sent | 1 | VERY LOW |

### 8.10 Player Readability (Tell System)

| Archetype | Telegraph % | Style | Advance Warning |
|-----------|-------------|-------|-----------------|
| **Warlord** | 70% | Obvious | 2-3 turns |
| **Diplomat** | 80% | Polite | 3-5 turns |
| **Schemer** | 30% | Cryptic/Inverted | 1 turn (if any) |
| **Economist** | 60% | Transactional | 2 turns |
| **Aggressor** | 40% | Minimal | 1 turn |
| **Peaceful** | 90% | Clear | 5+ turns |

---

## 9. Diplomacy System

### 9.1 Coalition Mechanics (Anti-Snowball Design)

**Design Philosophy**: Prevent runaway victories through automatic balancing.

When any empire reaches **7+ Victory Points**, a coalition automatically forms against them:

```typescript
// Automatic coalition triggers
if (empire.victoryPoints >= 7) {
  // ALL other empires get bonuses vs leader
  applyAntiLeaderBonuses({
    attackPower: '+10% when attacking leader',
    defenseModifier: '+5% if leader attacks them',
    diplomaticPenalty: 'Leader cannot form new alliances',
    marketPenalty: 'Leader pays 20% more for resources'
  });
}
```

**Why This Works**:
- Mathematical rubber-banding (prevents unstoppable leaders)
- Creates dramatic reversals
- Makes games competitive until the end
- Simulates "balance of power" politics

**Reverse Turn Order** (Catchup Mechanic):
- Weakest empire (lowest VP) goes first each turn
- Last place gets first crack at neutral opportunities
- Last place can act before leader consolidates
- Used in successful board games (7 Wonders, Terraforming Mars)

### 9.2 Treaties

**Types**:
- **Neutrality (NAP)**: Cannot attack each other
- **Alliance**: Shared intelligence, mutual defense
- **Coalition** (Player-Formed): Formal group with shared goals

**Mechanics**:
- Propose/accept/reject treaties
- Breaking treaties incurs reputation penalty
- Bots remember betrayals (weighted grudge system)

### 9.3 Player-Formed Coalitions

- Groups of allied empires (voluntary)
- Cannot attack coalition members
- Shared intelligence
- Coalition chat (with bot messages)
- Combined networth ranking

### 9.4 Bot Diplomacy

Bots form and break alliances based on:
- Personality type / Archetype
- Emotional state
- Trust scores
- Strategic opportunity
- Grudge lists
- Game state

### 9.5 Communication Channels (v0.6+)

| Channel | Visibility | Examples |
|---------|------------|----------|
| **Direct** | Private | Threats, offers, negotiations |
| **Broadcast** | All players | Galactic events, conquest news, shouts |

---

## 10. Research System

**Design Change (v3.0)**: Replaced 8-level passive accumulation with 3-tier draft-based system.

**Previous Problem**: Research was a bar that filled over time with only one meaningful unlock (Light Cruisers at level 2). Other 6 levels did nothing visible.

**New Solution**: Draft-based strategic choices where players select from competing tech paths.

**Implementation**: `src/lib/game/services/research-draft-service.ts`

### 10.1 Three-Tier Structure

| Tier | Name | Unlock Turn | Choice |
|------|------|-------------|--------|
| **Tier 1** | Doctrine | ~Turn 10 (1000 RP) | Pick 1 of 3 Doctrines |
| **Tier 2** | Specialization | ~Turn 30 (5000 RP) | Pick 1 of 2 Upgrades (based on Doctrine) |
| **Tier 3** | Capstone | ~Turn 60 (15000 RP) | Doctrine Capstone (automatic) |

### 10.2 The Three Doctrines (Tier 1)

Players choose their strategic identity at ~Turn 10:

| Doctrine | Combat Effect | Economic Effect | Unlocks |
|----------|---------------|-----------------|---------|
| **War Machine** | +15% attack power | -10% sector income | Heavy Cruisers |
| **Fortress** | +25% defense power | -5% attack power | Defense Platforms |
| **Commerce** | +20% market sell prices | +10% sector costs | Trade Fleets |

**Visibility**: Enemies see your doctrine choice:
```
[GALACTIC INTEL] Varkus adopted WAR MACHINE doctrine.
```

### 10.3 Specializations (Tier 2)

Based on Doctrine, pick one specialization:

**War Machine Options:**
- **Shock Troops** - First strike: Deal 20% damage before defender rolls
- **Siege Engines** - +50% damage to Defense Platforms/Stations

**Fortress Options:**
- **Shield Arrays** - Negate first-strike damage
- **Minefield Networks** - Attackers lose 10% forces before combat

**Commerce Options:**
- **Trade Monopoly** - Buy at -20%, sell at +30%
- **Mercenary Contracts** - Hire temporary combat bonuses with credits

### 10.4 Capstones (Tier 3)

Automatic unlock based on Doctrine:

| Doctrine | Capstone | Effect |
|----------|----------|--------|
| **War Machine** | **Dreadnought** | Unlock Dreadnought unit (10x Heavy Cruiser power, 1 per game) |
| **Fortress** | **Citadel World** | One sector becomes invulnerable (cannot be captured, only blockaded) |
| **Commerce** | **Economic Hegemony** | Generate 50% of #2's income as passive bonus |

### 10.5 Research Victory

**Completing Tier 3** (any doctrine) at Turn ~60 can trigger Research Victory if player maintains tech lead.

**Design Rationale**: Research creates strategic identity, not just a bar to fill. Bots announce choices, players counter-pick, asymmetric gameplay emerges.

---

## 11. Scenario System

### 11.1 Victory Conditions (6 Paths)

| Victory | Condition | Playstyle |
|---------|-----------|-----------|
| **Conquest** | Control 60% of territory | Aggressive expansion |
| **Economic** | 1.5× networth of 2nd place | Builder/trader |
| **Diplomatic** | Coalition controls 50% territory | Alliance politics |
| **Research** | Complete Research Tier 3 | Turtle/tech rush |
| **Military** | 2× military of all others combined | Domination |
| **Survival** | Highest score at turn 200 | Balanced play |

### 11.2 Edge Case Handling

**Simultaneous Victory Resolution**:
```javascript
const VICTORY_PRIORITY = [
  'conquest', 'research', 'diplomatic',
  'economic', 'military', 'survival'
];
```

**Impossible Victory Detection**:
- Warn player when chosen path becomes mathematically impossible
- Offer alternative victory suggestion

**Stalemate Prevention**:
- Turn 180: Check if any victory feasible
- Activate "Sudden Death" — alliances dissolved, last empire standing

### 11.3 Custom Scenario Builder

Players can configure:
- Win condition
- Turn limit
- Bot tier distribution
- Difficulty multipliers
- Starting resources
- Feature toggles (market, covert, etc.)

### 11.4 Difficulty Levels

| Difficulty | Effect |
|------------|--------|
| **Easy** | Bots make suboptimal choices, player bonuses |
| **Normal** | Balanced bot intelligence |
| **Hard** | Bots play optimally |
| **Nightmare** | Bots get resource bonuses |

---

## 12. Mid-Game Engagement System

### 12.1 Progressive Unlocks

Features unlock as the game progresses to maintain engagement:

| Turn | Unlock |
|------|--------|
| 1 | Core mechanics (build, expand, basic combat) |
| 10 | Diplomacy basics (NAP, trade agreements) |
| 20 | Coalition formation |
| 30 | Black Market access |
| 50 | Advanced ship classes |
| 75 | Coalition warfare (coordinated attacks) |
| 100 | Superweapons (nukes) |
| 150 | Endgame ultimatums |

### 12.2 Galactic Events

Events occur every 10-20 turns (semi-random) to shake up the game state:

| Type | Example Effects |
|------|-----------------|
| **Economic** | Market crash, resource boom, trade disruption |
| **Political** | New faction emerges, coup, assassination |
| **Military** | Pirate armada, alien incursion, arms race |
| **Narrative** | Lore drops, rumors, prophecies (flavor) |

### 12.3 Alliance Checkpoints

Every 30 turns, the system evaluates alliance balance:

- Check top 3 alliances + player alliance
- Evaluate: size, strength, territory, talent distribution
- If imbalance detected: merge weaker alliances, spawn challenger, force conflict
- **Presentation**: Partially visible (player sees event, not algorithm)

### 12.4 Market Manipulation Consequences

**No hard limits** — manipulation is a valid strategy with consequences:

| Turn | Event |
|------|-------|
| N | Player hoards >40% of any resource |
| N+5 | "Rumors spread of your monopoly..." |
| N+10 | "The Merchant Guild demands fair pricing" |
| N+15 | CHOICE — release stock OR face consequences |
| N+20 | Pirates/Cartel/Rival coalition attacks |

**Risk/Reward**: Survive the heat → economic dominance

### 12.5 Game Pacing

```
Turns 1-30:   EXPANSION (learn mechanics, form alliances, safe zone)
Turns 31-80:  COMPETITION (galactic events, coalition politics)
Turns 81-150: DOMINATION (superweapons, major conflicts)
Turns 151-200: ENDGAME (ultimatums, final showdowns)
```

---

## 13. New Player Experience

### 13.1 Protection Period

**20-turn safe zone** where:
- No bot attacks on player
- Bots still message (hostile posturing AND friendly overtures)
- Player learns personality reading
- **Turn 21 Trigger**: "The Galactic Council protection has expired. You're on your own, Commander."

### 13.2 Discovery System

**Commander's Codex**:
- Mechanics documented as player encounters them
- Not a manual dump — progressive revelation
- Accessible from main menu at any time

### 13.3 Tutorial

- Separate "Learn to Play" scenario
- Skippable
- Accessible from library
- Covers first 3-5 turns with overlays

### 13.4 Tooltips

- Contextual, on by default
- User toggle in settings
- Every UI element has hover documentation

### 13.5 First 5 Minutes Experience

```
TURN 1 EXPERIENCE:

1. Welcome Message (System)
   "Welcome to the Outer Rim, Commander. Your rivals surround you."

2. First Bot Message (Random)
   - Warlord: "Fresh meat. I'll enjoy crushing you."
   - Diplomat: "Welcome! Perhaps we could... cooperate?"
   - Schemer: "How interesting. A new player. Do you trust easily?"

3. Tutorial Overlay
   "Emperor Varkus just messaged you. Observe their behavior."

4. Immediate Choice
   - [Defiant] "I'm not afraid of you."
   - [Diplomatic] "Perhaps we can avoid conflict?"
   - [Ignore]

5. Consequence (Next Turn)
   Bot responds to choice
```

---

## 14. User Interface

### 14.1 Design Philosophy

Star Trek **LCARS-inspired** aesthetic:
- Translucent "glass panel" overlays
- Curved corners, pill-shaped buttons
- Color-coded information
- Space backgrounds with subtle animation

### 14.2 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Amber | `#FF9900` | Primary interactive |
| Lavender | `#CC99FF` | Secondary panels |
| Salmon | `#FF9999` | Warnings, enemies |
| Mint | `#99FFCC` | Success, positive |
| Blue | `#99CCFF` | Friendly, allies |

### 14.3 Core Screens

1. **Dashboard** - Empire overview, resources, events
2. **Sectors** - Sector management, colonize/release
3. **Military** - Unit management, combat actions
4. **Research** - Visual tech tree (3-tier draft)
5. **Galaxy Map** - Empire locations, targets
6. **Diplomacy** - Treaties, coalitions
7. **Market** - Resource trading
8. **Covert** - Spy operations
9. **Messages** - Bot communications, events

### 14.4 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Desktop (1200px+) | Full 3-column |
| Tablet (768-1199px) | 2-column |
| Mobile (<768px) | Single column |

---

## 15. Tech Stack

### 15.1 Frontend

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui (customized LCARS theme) |
| State | React Query + Zustand |
| Galaxy Map | react-konva |
| Animations | Framer Motion |

### 15.2 Backend

| Layer | Technology |
|-------|------------|
| API | Next.js Server Actions |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Auth | Anonymous (v0.5), NextAuth.js (v0.6+) |
| LLM | OpenAI-compatible abstraction with provider failover |
| Caching | In-memory (v0.5), Redis-ready (v0.6+) |

### 15.3 Infrastructure

| Layer | Technology |
|-------|------------|
| Deployment | Vercel (frontend + serverless) |
| Database | Neon PostgreSQL |
| Future Bot Worker | Railway (scaffolded) |
| Monitoring | Performance logging (JSONL) |

### 15.4 LLM Provider Strategy

```typescript
// Provider failover chain for free tier arbitrage
const LLM_PROVIDERS = [
  { name: 'groq', priority: 1 },
  { name: 'together', priority: 2 },
  { name: 'openai', priority: 3 }
];

interface RateLimits {
  llmCallsPerGame: 5000,
  llmCallsPerTurn: 50,
  llmCallsPerHour: 500,
  maxDailySpend: 50.00
}
```

---

## 16. Development Phases

### Phase 1: Foundation (v0.5 MVP)
**Goal**: Playable game with random bots

- [x] Project setup (Next.js, Tailwind, Drizzle)
- [x] Database schema design
- [x] Core game loop (turns, resources)
- [x] Basic UI (functional, not full LCARS)
- [x] 5 starting sectors
- [x] Combat system (unified resolution, 47.6% win rate)
- [x] 25 Tier 4 random bots (placeholder names)
- [x] 3 victory conditions (Conquest, Economic, Survival)
- [x] Auto-save system (ironman mode)

**Deliverable**: Can play a complete game against random bots

### Phase 2: Bot Intelligence (v0.6)
**Goal**: Bots with personality

- [ ] 100 bot personas with names/voices
- [ ] Tier 3 decision tree bots
- [ ] Template message library (30-45 per persona)
- [ ] Emotional state system
- [x] 20-turn safe zone implementation
- [ ] Commander's Codex system
- [ ] Full diplomacy (NAP, Alliance, Coalition)
- [ ] Global market with dynamic pricing
- [x] 6 victory conditions

**Deliverable**: Bots feel like characters

### Phase 3: Advanced AI (v0.7)
**Goal**: LLM-powered elite bots

- [ ] Tier 2 strategic bots
- [ ] Tier 1 LLM bots (10 max, async processing)
- [ ] LLM provider abstraction with failover
- [ ] Weighted relationship memory
- [x] Progressive unlock system
- [x] Galactic events
- [ ] Alliance checkpoints

**Deliverable**: Intelligent, memorable opponents

### Phase 4: Polish (v0.8)
**Goal**: Production-ready

- [x] Full LCARS UI implementation
- [x] Galaxy map visualization
- [x] Tech tree visualization (3-tier draft)
- [ ] Learn to Play tutorial
- [ ] LLM-generated epilogues
- [ ] Statistics dashboard
- [ ] Accessibility features

**Beta Testing Features**:
- [ ] Hall of Fame system (track best scores, fastest victories, persistent across sessions)
- [ ] Sound design (UI sounds, turn chimes, combat alerts, ambient atmosphere, victory fanfares)

**Deliverable**: Deployable game

### Phase 5: Multiplayer (v1.0+)
**Goal**: Async multiplayer

- [ ] Async turn-based multiplayer
- [ ] Player matchmaking
- [ ] Spectator mode
- [ ] Replay system
- [ ] Achievements
- [ ] Leaderboards

**Deliverable**: Full vision realized

---

## 17. Success Metrics

### 17.1 Game Experience

| Metric | Target |
|--------|--------|
| **Game Length** | 1-2 hours (200 turns) |
| **Turn Processing** | <2 seconds |
| **Bot Variety** | Bots feel distinct |
| **Strategy Balance** | No single dominant path |
| **Replayability** | 6 victory paths provide variety |
| **Learning Curve** | Playable in 10 minutes, mastery takes hours |
| **Nostalgia Factor** | SRE veterans feel at home |
| **Modern UX** | New players aren't intimidated |

### 17.2 Technical Health

| Metric | Target |
|--------|--------|
| **Turn Generation Time** | <2000ms |
| **Database Query Time** | <200ms per turn |
| **LLM Response Time** | Async, non-blocking |
| **Save/Load Integrity** | Zero corruption |

### 17.3 Future Metrics (Post-Alpha)

- NPS: Would you recommend to another SRE veteran? (Target: >50)
- Aha! Moment: Time to first sector capture
- Session completion rate
- Retention (7-day, 30-day)

---

## 18. Out of Scope (v1)

The following are explicitly **not** included in version 1:

- **Synchronous Multiplayer**: Async only
- **Mobile App**: Web-only (responsive, not native)
- **Real-time Combat**: Turn-based only
- **Persistent Universe**: Single sessions, no carry-over
- **Monetization**: No in-app purchases, ads, or premium tiers
- **Modding Support**: No custom content tools
- **Global Leaderboards**: Local Hall of Fame only (v1)

---

## 19. Appendix: Future Expansion Content

The following systems are **deferred to future expansion packs** and are **not** part of the core v1.0 game:

### 19.1 Manufacturing & Crafting System

**Status**: Expansion Content (see `docs/expansion/CRAFTING-EXPANSION.md`)

A 4-tier resource progression system (Tier 0 → Tier 1 → Tier 2 → Tier 3) that gates advanced military units behind strategic resource management.

**Summary**:
- Industrial Sectors process raw resources into refined components
- Crafting queue system for manufacturing advanced systems
- Research unlocks higher-tier recipes
- Optional DLC for players who want deeper economic gameplay

**Why Not in v1.0**: Adds significant cognitive load and competes with core empire management. Better suited as optional expansion for hardcore players.

### 19.2 The Galactic Syndicate

**Status**: Expansion Content (see `docs/expansion/SYNDICATE-EXPANSION.md`)

A criminal organization offering WMDs, contracts, and comeback mechanics for struggling empires.

**Summary**:
- 8-level trust progression system
- Contract missions (4 tiers: Pirate, Standard, Targeted, Operations)
- Black Market for banned weapons and premium components
- Recruitment mechanic targeting bottom 50% players
- Betrayal path with Coordinator response

**Why Not in v1.0**: Parallel progression track that dilutes focus. Better suited as expansion with "hidden traitor" mechanics (see `docs/redesign-01-02-2026/SYNDICATE-EXPANSION-CONCEPT.md` for alternate vision).

---

## Appendix A: Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Game Vision** | `docs/VISION.md` | Core design philosophy and mental models |
| **Bot Architecture** | `docs/design/BOT_ARCHITECTURE.md` | Bot implementation guide (4 tiers, 8 archetypes) |
| **UI Design** | `docs/design/UI_DESIGN.md` | LCARS implementation specifications |
| **UX Roadmap** | `docs/UX-ROADMAP.md` | Player experience improvements |
| **Research Redesign** | `docs/redesign-01-02-2026/RESEARCH-REDESIGN.md` | 3-tier draft-based research system |
| **Crafting Expansion** | `docs/expansion/CRAFTING-EXPANSION.md` | 4-tier resource system (post-v1.0) |
| **Syndicate Expansion** | `docs/expansion/SYNDICATE-EXPANSION.md` | Trust system and contracts (post-v1.0) |
| **Expansion Roadmap** | `docs/expansion/EXPANSION-ROADMAP.md` | Future feature planning |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **4X** | eXplore, eXpand, eXploit, eXterminate strategy genre |
| **BBS** | Bulletin Board System - pre-internet online communities |
| **Black Market** | Syndicate-operated shop for restricted items and components |
| **Crafting** | System for manufacturing advanced components from base resources (expansion) |
| **Door Game** | BBS-hosted multiplayer games |
| **Ironman Mode** | Auto-save only, no manual saves or reloading |
| **LCARS** | Library Computer Access/Retrieval System (Star Trek UI) |
| **Networth** | Empire ranking metric |
| **Research Doctrine** | Tier 1 strategic choice (War Machine, Fortress, Commerce) |
| **Sector** | Controllable region of space containing planets, stations, resources |
| **SRE** | Solar Realms Elite (original 1990 game) |
| **Syndicate** | The Galactic Syndicate - criminal organization (expansion) |
| **Tell** | Behavioral indicator that hints at bot's true archetype |
| **Unified Actor Model** | Architecture where bots and players use same turn pipeline |

---

## Appendix C: Key Design Principles

1. **Unified Actor Model**: Bots and players flow through identical turn pipeline
2. **Async-First Design**: Same codebase supports single-player and future multiplayer
3. **Bot Opacity**: Players cannot see bot archetype — must deduce through observation
4. **Consequence Over Limits**: Market manipulation triggers events, not hard caps
5. **Ironman Mode**: Auto-save only, no rewinding decisions
6. **Weighted Memory**: Events don't expire, but influence fades by weight
7. **Narrative Payoff**: Every game should be a story worth telling

---

## Appendix D: Future Considerations

The following features are **not planned for v1** but represent compelling future directions captured during design brainstorming.

### D.1 Nemesis System (Cross-Game Bot Memory)

Bots remember player behavior across multiple games, creating persistent rivalries:

- "You again! I remember what you did to my empire last time..."
- Bots adjust strategies based on player's historical patterns
- Creates emergent storytelling across sessions
- Could tie into achievement system

**Implementation Considerations**:
- Requires persistent player identity (auth system)
- Bot memory storage per player
- Balance: Don't make it feel unfair to new players

### D.2 Spectator Mode

Watch bots play against each other without player involvement:

- Entertainment/relaxation feature
- Learning tool (observe bot strategies)
- Could run accelerated (10x speed)
- Potential for "AI tournament" events

**Implementation Considerations**:
- UI for fast-forwarding and pausing
- Commentary system (explain bot decisions)
- Requires robust bot AI to be interesting

### D.3 Scenario Unlock System

Completing scenarios unlocks new, harder scenarios:

- Progressive difficulty curve
- Rewards mastery with new challenges
- Example unlock chain:
  - Complete "Survival" → Unlocks "Surrounded" (start with hostile neighbors)
  - Complete "Economic Victory" → Unlocks "Trade Wars" (market-focused)
  - Complete all basic → Unlocks "Nightmare" difficulty

**Implementation Considerations**:
- Requires persistent progress tracking
- Balance unlock requirements (not too grindy)
- Consider "unlock all" option for experienced players

### D.4 Decision Log Viewer

Expose bot decision reasoning for entertainment and learning:

- "Admiral Zharkov considered attacking you but chose to wait..."
- Post-game replay with bot thought processes
- Could be unlocked after game completion
- Educational: Learn to predict bot behavior

**Implementation Considerations**:
- Storage overhead for decision logs
- UI for browsing logs
- Privacy: Only show after game ends

### D.5 Bot Personality Evolution

Bots learn and evolve across the game ecosystem:

- Aggregate player strategies inform bot improvements
- Bots develop "meta" awareness over time
- Seasonal bot personality updates
- Community-driven bot training

**Implementation Considerations**:
- Requires analytics infrastructure
- Balance: Don't make bots unbeatable
- Ethical: Transparent about AI learning

---

## Appendix E: What This Game Is NOT

Explicit anti-patterns to avoid scope creep:

| NOT This | Because |
|----------|---------|
| **Mobile gacha game** | No predatory monetization |
| **Persistent MMO** | Single sessions, complete games |
| **Real-time strategy** | Turn-based, thoughtful |
| **Spreadsheet simulator** | Approachable rules |
| **Multiplayer-first (v1)** | Single-player excellence first |
| **Feature-bloated** | Elegant simplicity like Hammurabi |

*"The galaxy awaits, Commander. Your rivals are ready. Are you?"*

---

*Document Version: 3.0*
*Last Updated: January 3, 2026*
*Status: Post-Redesign (Phases 1-3 Complete)*
