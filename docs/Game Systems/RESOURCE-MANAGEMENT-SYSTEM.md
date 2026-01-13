# Resource Management System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-RES
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/RESOURCE-MANAGEMENT-SYSTEM.md

---

## Document Purpose

This document defines the **Resource Management System**, the economic engine that powers empire growth, military capability, and victory in Nexus Dominion. It specifies the five resource types, production mechanics, consumption rates, civil status effects, and the economic decision-making framework for both players and bots.

This document is essential reading for:
- **Game designers** balancing economic growth rates and victory paths
- **Backend engineers** implementing resource production and consumption services
- **Frontend developers** creating resource display and sector management interfaces
- **AI engineers** programming bot economic decision-making

Key decisions resolved:
- **Resource variety vs complexity**: Five distinct resources create strategic choices without overwhelming new players
- **Production vs consumption balance**: Income rates must support military growth while preventing runaway economies
- **Civil status impact**: Happiness affects income (0.25x rioting to 2.5x ecstatic), creating meaningful empire management choices
- **Population mechanics**: Food consumption and growth rates that reward expansion while penalizing overextension

**Design Philosophy:**
- **Scarcity creates choice** - No empire can maximize all resources; specialization is required
- **Civil status matters** - Happiness isn't cosmetic; it directly impacts economic power
- **Growth compounds carefully** - Economic snowballing is limited by civil status decay and consumption scaling
- **Visibility enables planning** - Players see exact production/consumption rates for informed decisions
- **Consequences over hard caps** - Running out of food causes population decline, not an error message
- **Bot viability** - Bots can manage economy effectively without complex micromanagement

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

### 1.1 The Five Resource Types

Nexus Dominion uses five distinct resources, each with specific production sources and strategic purposes: <!-- @spec REQ-RES-001 -->

| Resource | Primary Source | Primary Use | Strategic Role |
|----------|---------------|-------------|----------------|
| **Credits** | Commerce, Urban sectors | Universal currency for purchases | Economic engine, flexibility |
| **Food** | Food sectors | Population sustenance, soldier upkeep | Growth enabler, survival resource |
| **Ore** | Ore sectors | Military unit maintenance | Military sustainability |
| **Petroleum** | Petroleum sectors | Military fuel, wormhole construction | Expansion enabler, military operations |
| **Research Points** | Research sectors | Technology advancement | Long-term power multiplier |

**Design Rationale**: Five resources hit the sweet spot between strategic depth and cognitive load:
- **Too few** (e.g., just Credits): No meaningful economic choices, reduced strategic variety
- **Too many** (e.g., 10+ resources): Overwhelming for new players, micromanagement hell for bots
- **Five resources**: Each has clear purpose, creates specialization incentives, manageable for human and AI players

### 1.2 The Economic Game Loop

The resource economy operates on a **turn-based production-consumption cycle**: <!-- @spec REQ-RES-002, REQ-RES-004, REQ-RES-005 -->

```
TURN START
    ↓
1. PRODUCTION PHASE
   ├─ Each sector produces resources (base rate × civil status multiplier)
   ├─ Credits: 8,000/turn per Commerce sector (Content status)
   ├─ Food: 160/turn per Food sector
   ├─ Ore: 112/turn per Ore sector
   ├─ Petroleum: 92/turn per Petroleum sector
   └─ Research Points: 100/turn per Research sector
    ↓
2. CONSUMPTION PHASE
   ├─ Population consumes 0.5 food/capita/turn
   ├─ Military units consume ore (5% of build cost/turn)
   ├─ Active military consumes petroleum (3% of build cost/turn)
   └─ Sector maintenance costs (if implemented)
    ↓
3. POPULATION GROWTH/DECLINE
   ├─ Food surplus → +2% population growth/turn
   ├─ Food deficit → -10% population decline/turn
   └─ Population affects civil status
    ↓
4. CIVIL STATUS UPDATE
   ├─ Food ratio (surplus/deficit)
   ├─ Recent battle losses
   ├─ Education sector bonuses (+1 level/turn, caps at Ecstatic)
   └─ Territory growth rate
    ↓
5. RESOURCE STORAGE
   ├─ Resources carry over to next turn
   ├─ No hard storage caps (consequence: inflation penalties if hoarding)
   └─ Negative balances allowed (consequence: civil status penalties)
    ↓
TURN END
```

**Example Turn**:
```
Empire has:
- 5 Commerce sectors (8,000 cr/turn each) = +40,000 credits
- 2 Food sectors (160 food/turn each) = +320 food
- 1 Ore sector = +112 ore
- 1 Petroleum sector = +92 petroleum
- 10,000 population × 0.5 food/capita = -5,000 food consumption
- 20 military units × 100 ore/unit × 5% = -100 ore maintenance
- Civil status: Content (1.0× multiplier, no bonus)

Result: +40,000 cr, -4,680 food (deficit!), +12 ore, +92 petroleum
Population next turn: 10,000 × 0.9 = 9,000 (declining due to starvation)
Civil status next turn: Content → Unhappy (food deficit penalty)
```

### 1.3 Player Experience: Economic Decision-Making

**Early Game (Turns 1-20): Survival and Foundation**
- Start with 5 sectors (Food, Ore, Petroleum, Commerce, Urban) producing baseline resources
- Immediate challenge: "Do I build more food sectors to grow population, or military sectors to defend?"
- Economic focus: Establish sustainable production (food = population × 0.5)
- Victory path begins: Merchant archetype builds Commerce sectors, Warlord builds Ore/Petroleum

**Mid Game (Turns 21-60): Specialization and Expansion**
- Conquered sectors allow specialization: "Do I convert to all Commerce for credits, or diversify?"
- Research sector investment: 23,000 credits is expensive but unlocks tech tree
- Population growing: More population = more consumption but higher potential
- Civil status matters: Ecstatic empire (2.5× multiplier) produces 40,000 cr/turn vs 16,000 cr/turn (Content)

**Late Game (Turns 61+): Power and Dominance**
- Economic victory path: Maximize Commerce sectors + Ecstatic status = massive income
- Military dominance: Ore/Petroleum production sustains large fleets
- Tech victory: Research sector spam unlocks Tier 3 capstones
- Balancing act: High military consumption drains resources; must balance offense with economy

**Emotional Beats**:
- 😰 **Panic**: "I'm out of food! Population is starving!"
- 💡 **Breakthrough**: "If I get to Ecstatic, my 10 Commerce sectors produce 200,000 credits/turn!"
- ⚖️ **Tough Choice**: "Do I buy this expensive Research sector now, or build 3 Military sectors?"
- 🎉 **Victory**: "My economic engine produces 5× what my nearest rival does. Economic victory achieved!"

---

## 2. Mechanics Overview

### 2.1 Resource Production Rates

Each sector type produces specific resources at fixed base rates: <!-- @spec REQ-RES-002 -->

| Sector Type | Base Production | Build Cost | ROI (turns) |
|-------------|-----------------|------------|-------------|
| **Food** | 160 food/turn | 8,000 cr | N/A (consumed, not sold) |
| **Ore** | 112 ore/turn | 6,000 cr | ~54 turns (at 1 cr/ore) |
| **Petroleum** | 92 petroleum/turn | 11,500 cr | ~125 turns (at 1 cr/petro) |
| **Commerce** | 8,000 credits/turn | 8,000 cr | 1 turn |
| **Urban** | 1,000 credits/turn + pop capacity | 8,000 cr | 8 turns (credits only) |
| **Education** | +1 civil status level/turn (max: Ecstatic) | 8,000 cr | Indirect (multiplier boost) |
| **Government** | 300 spy points/turn | 7,500 cr | N/A (covert ops only) |
| **Research** | 100 research points/turn | 23,000 cr | 230 turns (expensive!) |

**Production Formula**:
```
Final Production = Base Production × Civil Status Multiplier
```

**Civil Status Multipliers**: <!-- @spec REQ-RES-003 -->

| Civil Status | Multiplier | Effect on 8,000 cr/turn Commerce Sector |
|--------------|------------|------------------------------------------|
| **Ecstatic** | 2.5× | 20,000 credits/turn |
| **Happy** | 1.5× | 12,000 credits/turn |
| **Content** | 1.0× | 8,000 credits/turn (baseline) |
| **Unhappy** | 0.75× | 6,000 credits/turn |
| **Angry** | 0.5× | 4,000 credits/turn |
| **Rioting** | 0.25× | 2,000 credits/turn |

> **Balance Note**: These multipliers create a 10× difference between Ecstatic and Rioting. This is intentional: civil status management is a core strategic skill. An empire that neglects happiness will fall behind economically.

### 2.2 Resource Consumption Rates

**Population Food Consumption**: <!-- @spec REQ-RES-004 -->
```
Food Consumed per Turn = Population × 0.5 food/capita/turn
```

**Examples**:
- 10,000 population = 5,000 food/turn
- 50,000 population = 25,000 food/turn (requires 157 Food sectors at baseline!)

**Military Maintenance**: <!-- @spec REQ-RES-005 -->

Units consume resources each turn to represent maintenance, fuel, and upkeep:

```
Ore Maintenance per Turn = Σ(Unit Ore Cost × 5%)
Petroleum Fuel per Turn = Σ(Unit Petroleum Cost × 3%)
```

**Example Military Costs**:
```
Fighter squadron (20 units):
- Build cost: 100 credits + 50 ore + 25 petroleum each
- Maintenance: 50 ore × 5% = 2.5 ore/turn per fighter
- Fuel: 25 petroleum × 3% = 0.75 petroleum/turn per fighter
- Total fleet: 50 ore/turn + 15 petroleum/turn

Heavy Cruiser (5 units):
- Build cost: 500 credits + 200 ore + 100 petroleum each
- Maintenance: 200 ore × 5% = 10 ore/turn per cruiser
- Fuel: 100 petroleum × 3% = 3 petroleum/turn per cruiser
- Total fleet: 50 ore/turn + 15 petroleum/turn
```

> **⚠️ PLACEHOLDER VALUES**: Maintenance rates (5% ore, 3% petroleum) are initial estimates requiring balance testing. May need adjustment based on:
> - Average fleet size at Turn 50
> - Resource stockpile rates
> - Economic victory feasibility

### 2.3 Population Growth and Decline

**Growth Formula**: <!-- @spec REQ-RES-006 -->
```
Population Change = Current Population × Growth Rate × Food Availability Multiplier

Where:
- Base Growth Rate = 0.02 (2% per turn with adequate food)
- Food Availability Multiplier = min(1.0, Food Surplus / Food Required)
- Food Required = Current Population × 0.5 food/capita/turn
```

**Growth Examples**:
```
Scenario 1: Food Surplus
- Population: 10,000
- Food produced: 6,000/turn
- Food required: 5,000/turn
- Surplus: 1,000 food (20% surplus)
- Food multiplier: 1.0 (capped)
- Growth: 10,000 × 0.02 × 1.0 = +200 people/turn
- Next turn population: 10,200

Scenario 2: Food Deficit
- Population: 10,000
- Food produced: 3,000/turn
- Food required: 5,000/turn
- Deficit: -2,000 food (40% deficit)
- Food multiplier: 3,000 / 5,000 = 0.6
- Starvation penalty: -10%/turn (replaces growth)
- Next turn population: 10,000 × 0.9 = 9,000

Scenario 3: Zero Food
- Population: 10,000
- Food produced: 0/turn
- Food required: 5,000/turn
- Deficit: -5,000 food (100% deficit)
- Starvation penalty: -10%/turn
- Next turn population: 9,000
- Civil status: Rioting (severe penalty)
```

> **⚠️ PLACEHOLDER VALUES**: Growth rate (2%), starvation rate (-10%), and food per capita (0.5) require balance testing against:
> - Desired population at Turn 100 (target: 50,000-100,000?)
> - Food sector availability
> - Victory condition thresholds

---

## 3. Detailed Rules

### 3.1 Civil Status Calculation

Civil status is determined by multiple factors and updates each turn: <!-- @spec REQ-RES-007 -->

**Civil Status Score Formula**:
```
Civil Status Score = Base Score (100)
                     + Food Security Modifier
                     + Battle Outcome Modifier
                     + Territory Growth Modifier
                     + Education Sector Bonus
                     - Overcrowding Penalty

Where:
Food Security Modifier:
  - Food surplus ≥ 20%:  +20 points
  - Food surplus 0-20%:  +10 points
  - Food deficit 0-20%:  -10 points
  - Food deficit ≥ 20%:  -30 points
  - Zero food:           -50 points

Battle Outcome Modifier (last 5 turns):
  - Major victory:       +5 points per victory
  - Minor victory:       +2 points per victory
  - Stalemate:           0 points
  - Minor defeat:        -3 points per defeat
  - Major defeat:        -10 points per defeat

Territory Growth Modifier:
  - Sectors gained last 10 turns: +2 points per sector
  - Sectors lost last 10 turns:   -5 points per sector

Education Sector Bonus:
  - +10 points per Education sector (updated each turn)

Overcrowding Penalty:
  - If Population > Urban capacity: -20 points
```

**Score to Status Mapping**:

| Civil Status | Score Range | Description |
|--------------|-------------|-------------|
| **Ecstatic** | 150+ | Peak morale, maximum productivity (2.5× income) |
| **Happy** | 120-149 | Strong morale, high productivity (1.5× income) |
| **Content** | 90-119 | Neutral morale, baseline productivity (1.0× income) |
| **Unhappy** | 70-89 | Low morale, reduced productivity (0.75× income) |
| **Angry** | 40-69 | Very low morale, poor productivity (0.5× income) |
| **Rioting** | 0-39 | Collapse, minimal productivity (0.25× income) |

**Status Transitions**:
- Civil status changes by a maximum of **1 level per turn** (prevents wild swings)
- Example: Content (100) → Food deficit (-30) = 70 → Unhappy (not Angry)
- Next turn: Unhappy (70) → Still deficit (-30) = 40 → Angry
- Education sectors provide **+1 level boost per turn** (overrides normal transition limit)

> **⚠️ PLACEHOLDER VALUES**: Civil status formula and thresholds are initial estimates requiring playtesting. May need rebalancing based on:
> - How often empires reach Ecstatic naturally
> - Whether Rioting is too punishing
> - Education sector impact (currently very powerful)

### 3.2 Resource Storage and Limits

**Storage Capacity**: <!-- @spec REQ-RES-008 -->
```
No hard storage caps - Resources accumulate indefinitely

Soft limits via consequences:
- Hoarding Credits: No penalty (credits are meant to be saved)
- Hoarding Food/Ore/Petroleum: No direct penalty, but opportunity cost
- Negative Balances Allowed: Resources can go negative with penalties
```

**Negative Balance Consequences**:

| Resource | Negative Balance Consequence |
|----------|------------------------------|
| **Credits** | Cannot purchase (blocked actions), no civil status penalty |
| **Food** | Population decline (-10%/turn), civil status penalty (-30 score) |
| **Ore** | Military units deactivate (cannot attack/defend), maintenance stops |
| **Petroleum** | Military units move at half speed, cannot build wormholes |
| **Research Points** | Research progress halts (cannot be negative) |

**Example Negative Balance**:
```
Empire runs out of ore (balance: -50 ore)
- Military units still exist (not destroyed)
- Cannot attack (action blocked: "Insufficient ore for military operations")
- Cannot defend effectively (50% defense power)
- Next turn: If +112 ore produced, balance becomes +62 ore (units reactivate)
```

### 3.3 Sector Type Conversion

Players can convert existing sectors to new types: <!-- @spec REQ-RES-009 -->

**Conversion Rules**:
```
Cost to Convert: 50% of target sector build cost
Time: Instant (happens same turn)
Restrictions: Cannot convert Urban sectors (population housing)
```

**Example Conversions**:
| From → To | Cost | Use Case |
|-----------|------|----------|
| Food → Commerce | 4,000 cr | Late game, population stable, need income |
| Ore → Petroleum | 5,750 cr | Shifting to wormhole expansion strategy |
| Commerce → Research | 11,500 cr | Tech rush, sacrifice income for research |

**Strategic Implications**:
- Early game: Rarely convert (need diverse production)
- Mid game: Convert conquered sectors to specialize (all Commerce, all Research)
- Late game: Convert to maximize specific victory path (Economic = Commerce spam)

### 3.4 Urban Sectors and Population Capacity

**Urban Sector Mechanics**: <!-- @spec REQ-RES-010 -->

```
Population Capacity = Urban Sectors × 10,000 people

Starting capacity: 1 Urban sector = 10,000 capacity
Starting population: 10,000 (at capacity)

Growth requires expansion:
- Population 10,000 + 200/turn = 10,200 next turn
- No Urban expansion = overcrowding
- Overcrowding = -20 civil status score penalty
```

**Overcrowding Example**:
```
Turn 50:
- Population: 25,000
- Urban sectors: 2 (capacity 20,000)
- Overcrowding: 5,000 people (25% over capacity)
- Civil status penalty: -20 score
- Effect: Likely drops from Happy to Content

Solution: Build 1 more Urban sector (capacity → 30,000, penalty removed)
```

**Urban Sector Production**:
```
Urban sectors produce 1,000 credits/turn (in addition to housing)
- Less than Commerce (8,000 cr/turn)
- But necessary for population growth
- Dual purpose: housing + modest income
```

### 3.5 Research Point Accumulation and Tech Unlocks

**Research Point Production**: <!-- @spec REQ-RES-011 -->

```
Research Points per Turn = (Research Sectors × 100 RP) × Civil Status Multiplier

Tech Tier Unlock Thresholds:
- Tier 1 (Doctrine):        1,000 RP (~Turn 10 with 1 Research sector at Content)
- Tier 2 (Specialization):  5,000 RP (~Turn 50 with 1 Research sector)
- Tier 3 (Capstone):        15,000 RP (~Turn 150 with 1 Research sector)

Time Acceleration Options:
- 2 Research sectors: Tier 3 at ~Turn 75
- 3 Research sectors: Tier 3 at ~Turn 50
- Ecstatic status (2.5×): Tier 3 at ~Turn 60 with 1 sector
```

**Research Sector Investment Decision**:
```
Cost: 23,000 credits (most expensive sector)
Benefit: 100 RP/turn × 150 turns = 15,000 RP (reach Tier 3)
Opportunity cost: 23,000 cr could buy 2.875 Commerce sectors (23,000 cr income over 150 turns)

Economic Victory: Skip Research, build Commerce
Tech Victory: Buy 2-3 Research sectors ASAP, rush Tier 3
Balanced: Buy 1 Research sector Turn 20, reach Tier 3 by Turn 170
```

---

## 4. Bot Integration

### 4.1 Archetype Behavior

Each of the 8 bot archetypes manages resources differently based on strategic priorities:

| Archetype | Economic Priority | Sector Preference | Food Strategy | Military Investment |
|-----------|------------------|-------------------|---------------|---------------------|
| **Warlord** | Low (0.4) | Ore, Petroleum sectors | Minimum viable | High (60% budget) |
| **Diplomat** | Medium (0.5) | Balanced mix | Sustainable surplus | Low (20% budget) |
| **Merchant** | High (0.95) | Commerce spam | Minimal (buy on market) | Low (15% budget) |
| **Schemer** | Medium (0.5) | Government, Research | Sustainable | Medium (30% budget) |
| **Turtle** | High (0.7) | Food, Urban sectors | Large surplus | Medium (40% budget) |
| **Blitzkrieg** | Low (0.5) | Ore, Petroleum only | Minimal (accept starvation) | Very High (80% budget) |
| **Tech Rush** | Medium (0.6) | Research spam | Sustainable | Low (20% budget) |
| **Opportunist** | Variable (0.6) | Adapts to situation | Minimal | Variable (30-50%) |

**Example: Warlord Bot Economic Strategy**:
```
Turn 1-10:   Build Ore + Petroleum sectors (ignore Commerce)
Turn 11-20:  Build minimum Food to prevent starvation (civil status: Unhappy accepted)
Turn 21-50:  Convert conquered sectors to Ore/Petroleum (maximize military)
Turn 51+:    Accept Angry/Rioting status (0.5× income) as cost of military dominance
```

**Example: Merchant Bot Economic Strategy**:
```
Turn 1-10:   Build Commerce sectors immediately (ignore military)
Turn 11-20:  Build Education sectors (reach Ecstatic ASAP)
Turn 21-50:  Commerce spam (10+ Commerce sectors × 2.5× = 200,000 cr/turn)
Turn 51+:    Use credits to buy military units from market (no production needed)
```

### 4.2 Bot Decision Logic

Bots evaluate economic actions using a **priority-weighted decision tree**:

```python
# Tier 2 Bot Economic Decision Pseudo-Code

def bot_economic_turn(bot):
    """Execute economic decisions for this turn"""

    # 1. ASSESS RESOURCES
    food_security = (food_production - food_consumption) / food_consumption
    credit_balance = current_credits
    military_sustainability = ore_balance > 0 and petroleum_balance > 0

    # 2. CRITICAL NEEDS (override archetype priorities)
    if food_security < -0.2:  # 20% food deficit
        action = build_food_sector()
        return action

    if population > urban_capacity:
        action = build_urban_sector()
        return action

    if military_units > 0 and ore_balance < 0:
        action = build_ore_sector()
        return action

    # 3. ARCHETYPE-DRIVEN PRIORITIES
    if archetype == "Merchant":
        if civil_status < "Ecstatic":
            action = build_education_sector()
        else:
            action = build_commerce_sector()

    elif archetype == "Warlord":
        if ore_production < military_consumption * 20:  # 20 turn buffer
            action = build_ore_sector()
        else:
            action = build_petroleum_sector()

    elif archetype == "Tech Rush":
        if research_sectors < 3:
            action = build_research_sector()
        else:
            action = build_commerce_sector()  # fund research

    # 4. DEFAULT: BUILD COMMERCE
    else:
        action = build_commerce_sector()

    return action
```

**Emotional State Modifiers**:

Emotional states affect economic decision-making:

| Emotional State | Effect on Economic Decisions |
|-----------------|------------------------------|
| **Confident** | +10% investment in expansion (more sectors purchased) |
| **Arrogant** | -20% food security priority (risk starvation) |
| **Desperate** | +50% focus on immediate income (Commerce sectors only) |
| **Vengeful** | -30% economic investment (divert to military) |
| **Fearful** | +50% food hoarding priority (build Food sectors) |
| **Triumphant** | +20% luxury investment (Education, Research sectors) |

### 4.3 Bot Messages

Bots send economy-related messages with personality:

**Merchant Bot - Economic Taunts**:
```
On reaching Ecstatic status:
"My citizens rejoice while yours starve, {player_name}. Credits buy happiness."

On Economic Victory:
"The market has spoken, {player_name}. Your empire is bankrupt compared to mine."

On selling resources:
"I'll sell you food at 5 credits each. Your people are hungry, yes?"
```

**Warlord Bot - Resource Scarcity Acceptance**:
```
On Rioting status:
"Let them riot. My soldiers eat while weaklings complain."

On conquering Food sectors:
"Your farmers will feed MY armies now, {player_name}."
```

**Turtle Bot - Resource Hoarding**:
```
On large stockpile:
"I have 500,000 food stockpiled. Can you say the same, {player_name}?"

On rejecting trade:
"I don't share my resources. Build your own sectors."
```

**Tech Rush Bot - Research Investment**:
```
On building 3rd Research sector:
"While you bicker over sectors, I unlock the future."

On reaching Tier 3:
"Technology wins wars, {player_name}. You should have invested sooner."
```

**Opportunist Bot - Adaptive Economy**:
```
On seeing weak empire:
"Your economy is in shambles. I'll offer 10,000 credits for 3 of your sectors."

On strong economy detected:
"{player_name}, your income is impressive. Perhaps we should form an alliance?"
```

---

## 5. UI/UX Design

### 5.1 UI Mockups

**Resource Display (Top Bar - Always Visible)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│  NEXUS DOMINION                         Turn 45 | Empire: "Star Lords" │
├────────────────────────────────────────────────────────────────────────┤
│  💰 Credits: 125,450 (+40,000/turn)                                    │
│  🌾 Food: 12,300 (+320/turn | -5,000 consumption = -4,680 net) ⚠️      │
│  ⛏️  Ore: 8,500 (+112/turn | -100 maintenance = +12 net)               │
│  🛢️  Petroleum: 3,200 (+92/turn | -45 fuel = +47 net)                  │
│  🔬 Research: 4,500 RP (+200/turn)                                      │
│                                                                         │
│  Population: 18,500 / 20,000 capacity | Civil Status: Happy (1.5×) 😊  │
└────────────────────────────────────────────────────────────────────────┘
```

**Visual Design Principles**:
- **Color Coding**:
  - Green numbers: Positive net income
  - Red numbers: Negative net income (consumption exceeds production)
  - Yellow ⚠️ icon: Resource critically low (< 10 turns of consumption)
- **Hover Tooltips**:
  - Hovering over "Food: 12,300" shows: "12 Food sectors × 160 production = 1,920 base. Happy status (1.5×) = 2,880 total. Population (18,500 × 0.5) consumes 9,250. Net: -6,370/turn. **Starvation in 2 turns!**"
- **Iconography**:
  - Credits: 💰 (gold coin)
  - Food: 🌾 (wheat)
  - Ore: ⛏️ (pickaxe)
  - Petroleum: 🛢️ (oil drum)
  - Research: 🔬 (microscope)

**Sector Management Interface**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SECTOR MANAGEMENT                                       [Build Sector]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Your Sectors (24 total):                                               │
│                                                                          │
│  ┌──────────────┬──────────┬─────────────┬──────────────┐              │
│  │ Type         │ Count    │ Production  │ Actions      │              │
│  ├──────────────┼──────────┼─────────────┼──────────────┤              │
│  │ 🌾 Food      │ 3        │ +480/turn   │ [+] [-] [↻]  │              │
│  │ ⛏️  Ore       │ 2        │ +224/turn   │ [+] [-] [↻]  │              │
│  │ 🛢️  Petroleum │ 2        │ +184/turn   │ [+] [-] [↻]  │              │
│  │ 💰 Commerce  │ 12       │ +96,000/turn│ [+] [-] [↻]  │              │
│  │ 🏙️  Urban     │ 3        │ +3,000/turn │ [+] [-]      │ (no convert)│
│  │ 📚 Education │ 1        │ +1 civil    │ [+] [-] [↻]  │              │
│  │ 🏛️  Government│ 0        │ -           │ [+]          │              │
│  │ 🔬 Research  │ 1        │ +100 RP/turn│ [+] [-] [↻]  │              │
│  └──────────────┴──────────┴─────────────┴──────────────┘              │
│                                                                          │
│  [+] Build new sector  [-] Destroy sector  [↻] Convert sector type     │
│                                                                          │
│  💡 Recommendation: Food deficit detected! Build 2 Food sectors.        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Build Sector Modal**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUILD NEW SECTOR                                              [Close ×]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Select sector type to build:                                           │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  🌾 FOOD SECTOR                                                  │   │
│  │  Cost: 8,000 credits                                             │   │
│  │  Production: +160 food/turn (base) × 1.5 (Happy) = +240/turn     │   │
│  │  ROI: Consumed (no direct ROI)                                   │   │
│  │  Current Production: 3 sectors × 240 = 720/turn                  │   │
│  │  Current Consumption: 9,250/turn                                 │   │
│  │  After Build: 4 sectors × 240 = 960/turn (still deficit!)        │   │
│  │                                                           [BUILD] │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  💰 COMMERCE SECTOR                                     ⭐ POPULAR│   │
│  │  Cost: 8,000 credits                                             │   │
│  │  Production: +8,000 credits/turn × 1.5 (Happy) = +12,000 cr/turn │   │
│  │  ROI: 0.67 turns (pays for itself in 1 turn!)                    │   │
│  │  Current Production: 12 sectors × 12,000 = 144,000 cr/turn       │   │
│  │  After Build: 13 sectors × 12,000 = 156,000 cr/turn              │   │
│  │                                                           [BUILD] │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  🔬 RESEARCH SECTOR                                     💎 LUXURY │   │
│  │  Cost: 23,000 credits                                            │   │
│  │  Production: +100 RP/turn × 1.5 (Happy) = +150 RP/turn           │   │
│  │  ROI: 153 turns (very long-term)                                 │   │
│  │  Current Production: 1 sector × 150 = 150 RP/turn                │   │
│  │  After Build: 2 sectors × 150 = 300 RP/turn                      │   │
│  │  Progress to Tier 3: 4,500 / 15,000 RP (30%)                     │   │
│  │  Estimated Tier 3 unlock: Turn 95 (current) → Turn 70 (after)    │   │
│  │                                                           [BUILD] │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  (Show all 8 sector types with similar cards)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 User Flows

**Flow 1: Player Notices Food Shortage**

```
1. Player ends turn
   ↓
2. Turn processes, food consumption exceeds production
   ↓
3. Top bar shows: "🌾 Food: 1,200 (-4,680/turn) ⚠️" in RED
   ↓
4. Tooltip appears: "Food critical! Starvation in 0 turns. Build Food sectors immediately."
   ↓
5. Player clicks "Sector Management" button
   ↓
6. Sector Management screen highlights Food row in red
   ↓
7. Player clicks [+] next to Food sector
   ↓
8. Build Sector modal opens, Food sector card highlighted
   ↓
9. Player clicks [BUILD]
   ↓
10. Confirmation: "Food Sector built for 8,000 credits. Production: +240 food/turn."
    ↓
11. Top bar updates: "🌾 Food: 1,200 (+240/turn | -9,250 consumption = -9,010 net) ⚠️"
    ↓
12. Player realizes 1 sector isn't enough, repeats steps 7-10 until deficit resolved
```

**Flow 2: Player Pursues Economic Victory**

```
1. Player opens Sector Management
   ↓
2. Reviews current production: 5 Commerce sectors = 60,000 cr/turn
   ↓
3. Clicks [↻] (Convert) on Food sector
   ↓
4. Modal: "Convert Food → Commerce? Cost: 4,000 cr. Production changes: -240 food, +12,000 credits"
   ↓
5. Player confirms (accepts food deficit risk for massive credit income)
   ↓
6. Converts 3 Food sectors → 3 Commerce sectors
   ↓
7. New production: 8 Commerce × 12,000 = 96,000 cr/turn
   ↓
8. Food deficit appears, civil status drops to Unhappy
   ↓
9. Production multiplier drops: 1.5× → 0.75× (96,000 → 48,000 cr/turn)
   ↓
10. Player learns: "I need to balance Commerce with Education to maintain Happy/Ecstatic!"
    ↓
11. Builds 2 Education sectors, civil status rises to Ecstatic (2.5× multiplier)
    ↓
12. Final production: 8 Commerce × 8,000 × 2.5 = 160,000 cr/turn (Economic Victory path!)
```

**Flow 3: Bot Economic Aggression (Market Attack)**

```
1. Player receives message from Merchant bot:
   "Your economy is weak. I offer 50,000 credits for 5 of your Commerce sectors."
   ↓
2. Player reviews offer:
   - Gain: 50,000 credits (1-time)
   - Lose: 5 × 12,000 cr/turn = 60,000 cr/turn production
   - ROI: Breaks even in 0.83 turns (terrible deal!)
   ↓
3. Player declines
   ↓
4. Bot responds: "Foolish. I will acquire your sectors by force then."
   ↓
5. Bot declares war, attacks Commerce sectors specifically
   ↓
6. Player must defend economically valuable sectors or lose massive income
```

### 5.3 Visual Design Principles

**LCARS-Inspired Styling**:
- **Color Palette**:
  - Orange (#FF9966): Primary accent, resource production values
  - Peach (#FFCC99): Secondary accent, buttons
  - Violet (#CC99FF): Tertiary accent, warnings
  - Dark Gray (#1A1A2E): Background
  - White (#FFFFFF): Text
- **Typography**:
  - Monospace font for numbers (precise alignment)
  - Sans-serif for labels (clarity)
- **Animations**:
  - Smooth transitions when resources update (0.3s fade)
  - Pulse effect on critical warnings (⚠️ icon pulses red)
  - Slide-in modals (0.2s ease-out)

**Responsive Behavior**:
- Desktop: Full resource bar at top, sidebar for Sector Management
- Tablet: Collapsible resource bar, full-screen Sector Management modal
- Mobile: Icon-only resource bar (tap to expand), swipeable sector cards

**Accessibility**:
- Color-blind mode: Replace red/green with icons (⚠️ for deficit, ✓ for surplus)
- High contrast mode: Increase text/background contrast ratio to 7:1
- Screen reader support: All numbers have aria-labels ("Food: 12,300, deficit 4,680 per turn")

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

### REQ-RES-001: Five Resource Types

**Description:** The game has 5 resource types with distinct purposes:
1. Credits - Universal currency for purchases and maintenance
2. Food - Sustains population growth and soldier upkeep
3. Ore - Military unit maintenance and construction
4. Petroleum - Fuel for military operations and wormhole construction
5. Research Points - Technology advancement through tech tree

**Rationale:** Five resources create strategic depth without overwhelming cognitive load. Each resource has clear production sources and consumption uses, enabling informed player decisions and bot AI specialization.

**Source:** Section 1.1 - The Five Resource Types

**Code:**
- `src/lib/db/schema.ts` - `empires` table columns (credits, food, ore, petroleum, research_points)
- `src/lib/game/types/resources.ts` - ResourceType enum and ResourceBalance interface
- `src/lib/game/services/resource-engine.ts` - Resource production and consumption logic

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Resource balance calculations
- `src/lib/game/services/__tests__/resource-validation.test.ts` - Type constraints and boundaries

**Status:** Draft

---

### REQ-RES-002: Sector Production Rates (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RES-002-01 through REQ-RES-002-08 for individual sector production definitions.

**Overview:** Each of 8 sector types produces specific resources per turn with defined base rates. Final production = Base Production × Civil Status Multiplier.

---

### REQ-RES-002-01: Food Sector Production

**Description:** Food sector produces 160 food/turn (base rate). Subject to civil status multiplier (0.25× to 2.5×).

**Rationale:** Base food production balances starting empire needs with strategic expansion incentives.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 160 food/turn |
| Resource Type | Food |
| Multiplier | Civil Status (0.25× - 2.5×) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `FOOD_PRODUCTION = 160`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Food production tests

**Status:** Draft

---

### REQ-RES-002-02: Ore Sector Production

**Description:** Ore sector produces 112 ore/turn (base rate). Subject to civil status multiplier (0.25× to 2.5×).

**Rationale:** Ore production rate balances military unit production needs with strategic resource management.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 112 ore/turn |
| Resource Type | Ore |
| Multiplier | Civil Status (0.25× - 2.5×) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `ORE_PRODUCTION = 112`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Ore production tests

**Status:** Draft

---

### REQ-RES-002-03: Petroleum Sector Production

**Description:** Petroleum sector produces 92 petroleum/turn (base rate). Subject to civil status multiplier (0.25× to 2.5×).

**Rationale:** Petroleum production rate supports military maintenance while requiring strategic resource planning.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 92 petroleum/turn |
| Resource Type | Petroleum |
| Multiplier | Civil Status (0.25× - 2.5×) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `PETROLEUM_PRODUCTION = 92`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Petroleum production tests

**Status:** Draft

---

### REQ-RES-002-04: Commerce Sector Production

**Description:** Commerce sector produces 8,000 credits/turn (base rate). Subject to civil status multiplier (0.25× to 2.5×).

**Rationale:** High base income makes commerce sectors primary economic engine. Self-financing after 1 turn (8,000 cr cost).

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 8,000 credits/turn |
| Resource Type | Credits |
| Multiplier | Civil Status (0.25× - 2.5×) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `COMMERCE_PRODUCTION = 8000`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Commerce production tests

**Status:** Draft

---

### REQ-RES-002-05: Urban Sector Production

**Description:** Urban sector produces 1,000 credits/turn (base rate) AND provides +1,000 population capacity bonus. Subject to civil status multiplier for credits only.

**Rationale:** Hybrid sector providing both income and infrastructure. Lower credit production than Commerce but adds strategic population capacity.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 1,000 credits/turn |
| Resource Type | Credits + Population Capacity |
| Population Bonus | +1,000 capacity (not multiplied) |
| Multiplier | Civil Status (credits only) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `URBAN_PRODUCTION = { credits: 1000, popCap: 1000 }`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Urban production tests

**Status:** Draft

---

### REQ-RES-002-06: Education Sector Production

**Description:** Education sector provides +1 civil status level/turn improvement (caps at Ecstatic). Not subject to civil status multiplier (affects civil status itself).

**Rationale:** Intangible benefit improving empire morale. Essential for maintaining high civil status during resource scarcity or war.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | +1 civil status/turn |
| Resource Type | Civil Status (intangible) |
| Cap | Ecstatic (maximum level) |
| Multiplier | None (produces civil status) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `EDUCATION_PRODUCTION = 1`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Education civil status tests

**Status:** Draft

---

### REQ-RES-002-07: Government Sector Production

**Description:** Government sector produces 300 spy points/turn (base rate). Subject to civil status multiplier (0.25× to 2.5×).

**Rationale:** Spy point production enables covert operations. Lower cost (7,500 cr) encourages intelligence-focused strategies.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 300 spy points/turn |
| Resource Type | Spy Points |
| Multiplier | Civil Status (0.25× - 2.5×) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `GOVERNMENT_PRODUCTION = 300`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Spy point production tests

**Status:** Draft

---

### REQ-RES-002-08: Research Sector Production

**Description:** Research sector produces 100 research points/turn (base rate). Subject to civil status multiplier (0.25× to 2.5×).

**Rationale:** Research point production accelerates tech progression. High cost (23,000 cr) creates strategic trade-off between expansion and research.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Base Production | 100 research points/turn |
| Resource Type | Research Points |
| Multiplier | Civil Status (0.25× - 2.5×) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/constants/sector-production.ts` - `RESEARCH_PRODUCTION = 100`

**Tests:**
- `src/lib/game/services/__tests__/resource-engine.test.ts` - Research point production tests

**Status:** Draft

---

### REQ-RES-003: Civil Status Income Multiplier

**Description:** Civil status affects all income with these multipliers:
- Ecstatic: 2.5×
- Happy: 1.5×
- Content: 1.0×
- Unhappy: 0.75×
- Angry: 0.5×
- Rioting: 0.25×

**Rationale:** Creates meaningful consequences for empire management. A 10× difference between Ecstatic and Rioting incentivizes happiness maintenance without requiring complex mechanics.

**Key Values:**

| Civil Status | Multiplier | Example (8,000 cr Commerce) |
|--------------|------------|----------------------------|
| Ecstatic | 2.5 | 20,000 cr/turn |
| Happy | 1.5 | 12,000 cr/turn |
| Content | 1.0 | 8,000 cr/turn |
| Unhappy | 0.75 | 6,000 cr/turn |
| Angry | 0.5 | 4,000 cr/turn |
| Rioting | 0.25 | 2,000 cr/turn |

**Source:** Section 2.1 - Resource Production Rates

**Code:**
- `src/lib/game/services/civil-status.ts` - `getCivilStatusMultiplier()` function
- `src/lib/game/constants/civil-status.ts` - Multiplier constant definitions

**Tests:**
- `src/lib/game/services/__tests__/civil-status.test.ts` - Multiplier lookup tests
- `src/lib/game/services/__tests__/income-calculation.test.ts` - End-to-end income tests

**Status:** Draft

> **⚠️ Note**: REQ-RES-003 in draft noted "values need verification against code". Current values (2.5× Ecstatic, 1.5× Happy) are from PRD-FORMULAS-ADDENDUM.md. Alternative values (4.0× Ecstatic, 2.0× Happy) may need consideration during balance testing.

---

### REQ-RES-004: Population Food Consumption (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RES-004-A through REQ-RES-004-B.

---

### REQ-RES-004-A: Food Consumption Calculation

**Description:** Population consumes food each turn to sustain citizens. Food consumption calculated as Population × 0.5 food/capita/turn. Food deducted from empire storage each turn during consumption phase.

**Rationale:** Food consumption creates tension between population growth and sustainability. 0.5 food/capita balances population growth with Food sector availability.

**Formula:**
```
Food Required = Population × 0.5 food/capita/turn

Examples:
- 10,000 pop → 5,000 food/turn required
- 50,000 pop → 25,000 food/turn required
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Food per capita | 0.5 food/person/turn | Base consumption rate |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2 - Resource Consumption Rates

**Code:**
- `src/lib/game/services/population-service.ts` - `calculateFoodConsumption()` function
- `src/lib/game/services/resource-engine.ts` - Consumption phase integration

**Tests:**
- `src/lib/game/services/__tests__/population-service.test.ts` - Consumption calculation tests

**Status:** Draft

> **⚠️ PLACEHOLDER VALUE**: Food consumption rate (0.5 food/capita) requires balance testing against Food sector availability and victory condition timelines.

---

### REQ-RES-004-B: Food Deficit Consequences

**Description:** When food storage cannot meet consumption requirements (food deficit), population suffers -10%/turn decline and -30 civil status penalty. Effects apply immediately when deficit detected.

**Rationale:** Creates consequences for unsustainable population growth. Forces players to balance expansion with food production. Food surplus enables growth (+2%/turn), creating incentive to maintain surplus.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Starvation penalty | -10%/turn | Population decline rate |
| Civil status penalty | -30 score | Applied when food deficit exists |
| Growth rate (surplus) | +2%/turn | When food surplus available |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2 - Resource Consumption Rates

**Code:**
- `src/lib/game/services/population-service.ts` - Deficit consequences
- `src/lib/game/services/civil-status.ts` - Civil status penalty

**Tests:**
- `src/lib/game/services/__tests__/starvation-mechanics.test.ts` - Deficit consequence tests

**Status:** Draft

---

### REQ-RES-005: Military Maintenance Costs (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RES-005-A through REQ-RES-005-C.

---

### REQ-RES-005-A: Ore Maintenance Calculation

**Description:** Military units consume ore each turn for maintenance. Ore maintenance calculated as 5% of unit build cost per turn, summed across all units. Ore deducted from empire storage each turn during maintenance phase.

**Rationale:** Prevents infinite military growth without economic support. Encourages balancing military power with resource production.

**Formula:**
```
Ore Maintenance per Turn = Σ(Unit Ore Cost × 5%)

Example - Per-unit maintenance:
- Fighter: 50 ore build cost × 5% = 2.5 ore/turn maintenance

Example - Fleet of 20 fighters:
- Ore: 20 × 2.5 = 50 ore/turn
```

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Ore maintenance rate | 5% of build cost/turn | Per-unit upkeep |

**Source:** Section 2.2 - Resource Consumption Rates

**Code:**
- `src/lib/game/services/military-maintenance.ts` - `calculateMaintenanceCosts()` function
- `src/lib/game/services/resource-engine.ts` - Consumption phase integration

**Tests:**
- `src/lib/game/services/__tests__/military-maintenance.test.ts` - Maintenance calculation tests

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Maintenance rate (5% ore) is initial estimate requiring balance testing against fleet sizes and resource production rates.

---

### REQ-RES-005-B: Petroleum Fuel Calculation

**Description:** Military units consume petroleum each turn for fuel. Petroleum fuel calculated as 3% of unit build cost per turn, summed across all units. Petroleum deducted from empire storage each turn during maintenance phase.

**Rationale:** Prevents infinite military growth without economic support. Encourages balancing military power with resource production.

**Formula:**
```
Petroleum Fuel per Turn = Σ(Unit Petroleum Cost × 3%)

Example - Per-unit fuel:
- Fighter: 25 petroleum build cost × 3% = 0.75 petroleum/turn fuel

Example - Fleet of 20 fighters:
- Petroleum: 20 × 0.75 = 15 petroleum/turn
```

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Petroleum fuel rate | 3% of build cost/turn | Per-unit fuel |

**Source:** Section 2.2 - Resource Consumption Rates

**Code:**
- `src/lib/game/services/military-maintenance.ts` - `calculateMaintenanceCosts()` function
- `src/lib/game/services/resource-engine.ts` - Consumption phase integration

**Tests:**
- `src/lib/game/services/__tests__/military-maintenance.test.ts` - Maintenance calculation tests

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Fuel rate (3% petroleum) is initial estimate requiring balance testing against fleet sizes and resource production rates.

---

### REQ-RES-005-C: Military Resource Deficit Consequences

**Description:** When ore/petroleum balance goes negative during maintenance phase, military units suffer immediate penalties. Ore deficit causes units to deactivate (0% combat power). Petroleum deficit causes units to operate at half effectiveness (50% combat power, half speed).

**Rationale:** Prevents infinite military growth without economic support. Encourages balancing military power with resource production.

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Negative ore consequence | Units deactivate (0% power) | Cannot attack/defend |
| Negative petroleum consequence | Half speed (50% power) | Can attack at 50% effectiveness |

**Source:** Section 2.2 - Resource Consumption Rates

**Code:**
- `src/lib/game/services/military-maintenance.ts` - `calculateMaintenanceCosts()` function
- `src/lib/game/services/resource-engine.ts` - Consumption phase integration

**Tests:**
- `src/lib/game/services/__tests__/negative-resource-penalties.test.ts` - Consequence tests

**Status:** Draft

---

### REQ-RES-006: Population Growth and Decline (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RES-006-A through REQ-RES-006-C.

---

### REQ-RES-006-A: Population Growth Calculation

**Description:** Population grows at 2% per turn when food surplus available. Growth scaled by food availability multiplier, capped at 1.0 to prevent surplus food from accelerating growth beyond base rate.

**Rationale:** Population growth rewards expansion and food production. Food cap prevents runaway growth from excessive food stockpiling.

**Formula:**
```
Population Growth = Current Population × 0.02 × Food Availability Multiplier
Food Availability Multiplier = min(1.0, Food Surplus / Food Required)
Food Required = Population × 0.5 food/capita/turn

Example:
- Population: 10,000
- Food available: 6,000/turn
- Food required: 5,000/turn
- Food multiplier: min(1.0, 6,000/5,000) = 1.0 (capped)
- Growth: 10,000 × 0.02 × 1.0 = +200 people/turn
```

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Base growth rate | 2%/turn | With adequate food |
| Food cap multiplier | 1.0 | Surplus food doesn't accelerate growth |

**Source:** Section 2.3 - Population Growth and Decline

**Code:**
- `src/lib/game/services/population-service.ts` - `calculatePopulationChange()` function
- `src/lib/game/services/turn-processor.ts` - Population update phase

**Tests:**
- `src/lib/game/services/__tests__/population-growth.test.ts` - Growth formula tests

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Growth rate (2%) and food per capita (0.5) require balance testing against desired Turn 100 population targets.

---

### REQ-RES-006-B: Population Decline from Starvation

**Description:** Population declines at 10% per turn when food deficit exists. Decline rate 5× faster than growth rate to create urgency and severe punishment for food shortages.

**Rationale:** Starvation severely punishes food deficits to create urgency and prevent food mismanagement.

**Formula:**
```
Population Decline = Current Population × -0.10 (10% loss per turn)

Example:
- Population: 10,000
- Food available: 3,000/turn
- Food required: 5,000/turn
- Deficit: -2,000 food (40% deficit)
- Decline: 10,000 × 0.10 = -1,000 people/turn
```

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Starvation decline rate | 10%/turn | Asymmetric (5× faster than growth) |

**Source:** Section 2.3 - Population Growth and Decline

**Code:**
- `src/lib/game/services/population-service.ts` - `calculatePopulationChange()` function
- `src/lib/game/services/turn-processor.ts` - Population update phase

**Tests:**
- `src/lib/game/services/__tests__/population-decline.test.ts` - Starvation tests

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Decline rate (10%) requires balance testing against desired Turn 100 population targets.

---

### REQ-RES-006-C: Population Growth Constraints

**Description:** Population growth constrained by minimum floor of 100 (minimum viable population) to prevent extinction. Food cap multiplier of 1.0 prevents surplus food from accelerating growth beyond base rate.

**Rationale:** Population floor prevents extinction scenarios. Food cap prevents runaway growth from excessive stockpiling.

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Population floor | 100 | Minimum viable population (prevents extinction) |
| Food cap multiplier | 1.0 | Surplus food doesn't accelerate growth |

**Source:** Section 2.3 - Population Growth and Decline

**Code:**
- `src/lib/game/services/population-service.ts` - `calculatePopulationChange()` function
- `src/lib/game/services/turn-processor.ts` - Population update phase

**Tests:**
- `src/lib/game/services/__tests__/population-growth.test.ts` - Growth formula tests

**Status:** Draft

---

### REQ-RES-007: Civil Status Calculation Formula (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-RES-007-A through REQ-RES-007-G below.

**Overview:** Civil status is calculated each turn based on multiple factors that combine into a numeric score, which maps to status levels (Ecstatic → Rioting) with transition rules limiting volatility.

**Formula Structure:**
```
Civil Status Score = Base Score (100)
                     + Food Security Modifier (-50 to +20)       [REQ-RES-007-A]
                     + Battle Outcome Modifier (-50 to +25)      [REQ-RES-007-B]
                     + Territory Growth Modifier (-50 to +20)    [REQ-RES-007-C]
                     + Education Sector Bonus (0 to +50)         [REQ-RES-007-D]
                     - Overcrowding Penalty (0 to -20)           [REQ-RES-007-E]

Score → Status Level Mapping                                     [REQ-RES-007-F]
Transition Rules (max 1 level/turn)                              [REQ-RES-007-G]
```

**Note:** This spec is marked as a duplicate of REQ-TURN-007. Refer to canonical spec in TURN system for authoritative definition.

---

### REQ-RES-007-A: Food Security Modifier

**Description:** Food surplus or deficit modifies civil status score based on current food balance relative to consumption needs.

**Calculation Rules:**
- Surplus ≥20%: +20 to score
- Deficit ≥20%: -30 to score
- Zero food: -50 to score (maximum penalty)
- Intermediate values interpolate between thresholds

**Range:** -50 to +20

**Rationale:** Food security is the primary driver of civil happiness. Starvation causes maximum unrest, while abundant food provides modest satisfaction.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Food Security Factor

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `calculateFoodSecurityModifier()`

**Tests:** TBD - Food surplus, deficit, and zero food scenarios

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Thresholds (20% surplus/deficit) and modifier values require playtesting.

---

### REQ-RES-007-B: Battle Outcome Modifier

**Description:** Recent combat results affect civil status based on major victories and defeats over the last 5 turns.

**Calculation Rules:**
- +5 per major victory (last 5 turns)
- -10 per major defeat (last 5 turns)
- Tracking window: Rolling 5-turn history

**Range:** -50 to +25

**Rationale:** Recent battles affect morale. Victories boost confidence, defeats damage morale. Asymmetric values reflect loss aversion.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Battle Outcome Factor

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `calculateBattleOutcomeModifier()`

**Tests:** TBD - Victory/defeat tracking, 5-turn window, cumulative scoring

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Victory/defeat values (+5/-10) and window size (5 turns) require playtesting.

---

### REQ-RES-007-C: Territory Growth Modifier

**Description:** Sector gains and losses over the last 10 turns affect civil status, reflecting expansion or contraction.

**Calculation Rules:**
- +2 per sector gained (last 10 turns)
- -5 per sector lost (last 10 turns)
- Tracking window: Rolling 10-turn history

**Range:** -50 to +20

**Rationale:** Territorial expansion signals progress and prosperity, while losses indicate decline. Asymmetric penalties reflect loss aversion.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Territory Growth Factor

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `calculateTerritoryGrowthModifier()`

**Tests:** TBD - Sector gain/loss tracking, 10-turn window, cumulative scoring

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Gain/loss values (+2/-5) and window size (10 turns) require playtesting. Loss penalty may be too harsh.

---

### REQ-RES-007-D: Education Sector Bonus

**Description:** Each Education sector provides a flat bonus to civil status score, representing cultural enrichment and quality of life improvements.

**Calculation Rules:**
- +10 per Education sector
- Updated each turn based on current Education sector count
- No cap (stacks linearly)

**Range:** 0 to +50

**Rationale:** Education sectors represent luxury investment in citizen welfare. They provide both score bonus and special transition boost (see REQ-RES-007-G).

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Education Bonus Factor

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `calculateEducationBonus()`

**Tests:** TBD - Bonus calculation with varying Education sector counts

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Bonus per sector (+10) requires playtesting. Can empires reach Ecstatic without Education sectors?

---

### REQ-RES-007-E: Overcrowding Penalty

**Description:** Population exceeding urban capacity triggers a flat penalty to civil status, representing infrastructure strain and living condition deterioration.

**Calculation Rules:**
- -20 if population > urban capacity
- 0 if population ≤ urban capacity
- Binary threshold (no gradual scaling)

**Range:** 0 to -20

**Rationale:** Overcrowding causes unrest regardless of other factors. Binary threshold creates clear incentive to maintain Urban sectors.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Overcrowding Factor

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `calculateOvercrowdingPenalty()`

**Tests:** TBD - Threshold detection at capacity boundary

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Penalty value (-20) requires playtesting. Consider gradual scaling instead of binary threshold?

---

### REQ-RES-007-F: Civil Status Score to Level Mapping

**Description:** Convert numeric civil status score to discrete status levels (Ecstatic, Happy, Content, Unhappy, Angry, Rioting).

**Status Level Thresholds:**
- **Ecstatic:** 150+
- **Happy:** 120-149
- **Content:** 90-119
- **Unhappy:** 70-89
- **Angry:** 40-69
- **Rioting:** 0-39

**Rationale:** Discrete levels provide clear gameplay feedback and hook for status-based mechanics (production multipliers, diplomatic penalties, etc.).

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Score Mapping

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `getCivilStatusFromScore()`

**Tests:** TBD - Boundary conditions for each status level

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: All thresholds require playtesting. Is Rioting threshold (< 40) too punishing?

---

### REQ-RES-007-G: Civil Status Transition Rules

**Description:** Limit civil status level changes to maximum 1 level per turn to prevent volatility, with exception for Education sector boost.

**Transition Rules:**
- Maximum 1 level change per turn (up or down)
- **Exception:** Education sectors grant +1 level boost beyond the normal limit
- If calculated score would jump multiple levels, cap at current level ±1

**Rationale:** Prevents wild status swings from single events. Education sector exception rewards long-term investment in citizen welfare.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Civil Status Calculation, Transition Rules

**Code:** TBD - `src/lib/game/services/civil-status.ts` - `applyTransitionRules()`

**Tests:** TBD - Multi-level jumps capped, Education override

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Transition limit (1 level) and Education boost require playtesting.

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/game/services/civil-status.ts` - Main civil status service
- `src/lib/game/services/__tests__/civil-status-calculation.test.ts` - Score calculation tests
- `src/lib/game/services/__tests__/civil-status-transitions.test.ts` - Level change tests

---

### REQ-RES-008: Resource Storage and Negative Balances (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-RES-008-A through REQ-RES-008-F below.

**Overview:** Resources have unlimited storage with no hard caps. Negative balances are permitted but trigger specific consequences per resource type, implementing "consequence over limits" design philosophy.

**Resource Consequences Summary:**
- **Credits:** Purchase blocking [REQ-RES-008-B]
- **Food:** Population decline + civil status penalty [REQ-RES-008-C]
- **Ore:** Military unit deactivation [REQ-RES-008-D]
- **Petroleum:** Movement penalties + construction blocking [REQ-RES-008-E]
- **Research Points:** Hard floor at zero [REQ-RES-008-F]

**Note:** This spec conflicts with REQ-SEC-006. Verify canonical storage/cap policy during implementation.

---

### REQ-RES-008-A: Unlimited Resource Storage Policy

**Description:** All resources accumulate indefinitely without hard storage caps. Players can stockpile unlimited quantities of Credits, Food, Ore, Petroleum, and Research Points.

**Storage Rules:**
- No maximum cap on any resource
- Resources accumulate without limit
- No overflow or waste mechanics
- Allows strategic hoarding

**Rationale:** Aligns with "consequence over limits" philosophy. Players aren't artificially constrained by arbitrary caps, but face meaningful trade-offs in resource allocation.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2 - Resource Storage and Limits, Storage Policy

**Code:** TBD - `src/lib/game/services/resource-storage.ts` - Storage validation

**Tests:** TBD - Verify resources exceed arbitrary thresholds without clamping

**Status:** Draft

---

### REQ-RES-008-B: Negative Credits Consequence

**Description:** When Credits drop below zero, purchasing actions are blocked but no civil status penalty is applied.

**Consequence Rules:**
- Purchase actions blocked (sectors, units, market trades, covert ops, etc.)
- No civil status impact
- Can still receive income and return to positive balance
- Debt is permitted strategically

**Rationale:** Prevents overspending without punishing empire morale. Represents credit freeze rather than bankruptcy.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2 - Resource Storage and Limits, Credits Consequence

**Code:** TBD - `src/lib/game/services/purchase-validation.ts` - Purchase blocking logic

**Tests:** TBD - Purchase validation when credits < 0

**Status:** Draft

---

### REQ-RES-008-C: Negative Food Consequence

**Description:** When Food drops below zero, population declines at 10% per turn and civil status suffers a -30 score penalty.

**Consequence Rules:**
- Population decline: -10% per turn while Food < 0
- Civil status penalty: -30 score while Food < 0
- Both penalties persist until Food returns to positive
- Cumulative with other civil status modifiers

**Rationale:** Starvation has severe consequences: population loss (emigration, death) and massive unrest. Most punishing resource deficit.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2 - Resource Storage and Limits, Food Consequence

**Code:** TBD - `src/lib/game/services/population-service.ts` - Starvation mechanics

**Tests:** TBD - Population decline rate, civil status penalty application

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Decline rate (-10%/turn) and civil penalty (-30) require balance testing. May be too harsh.

---

### REQ-RES-008-D: Negative Ore Consequence

**Description:** When Ore drops below zero, military units deactivate and cannot attack or defend effectively.

**Consequence Rules:**
- Military units become inactive (out of supply)
- Cannot initiate attacks
- Cannot defend effectively (massive combat penalty or auto-lose)
- Units reactivate immediately when Ore returns to positive

**Rationale:** Represents equipment failure, ammunition shortages, and lack of spare parts. Military force becomes decorative.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2 - Resource Storage and Limits, Ore Consequence

**Code:** TBD - `src/lib/game/services/military-service.ts` - Unit deactivation logic

**Tests:** TBD - Unit deactivation, combat blocking, reactivation

**Status:** Draft

> **⚠️ PLACEHOLDER**: "Ineffective" combat behavior needs definition. Auto-lose? -90% power? Zero power?

---

### REQ-RES-008-E: Negative Petroleum Consequence

**Description:** When Petroleum drops below zero, military units move at half speed and wormhole construction is blocked.

**Consequence Rules:**
- Military unit movement speed: 50% of normal
- Cannot build new wormholes (construction blocked)
- Existing wormholes remain functional
- Penalties lift immediately when Petroleum returns to positive

**Rationale:** Fuel shortage limits mobility and expansion but doesn't completely cripple the military (unlike Ore). Strategic positioning remains viable.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2 - Resource Storage and Limits, Petroleum Consequence

**Code:** TBD - `src/lib/game/services/movement-service.ts` - Speed penalties

**Tests:** TBD - Movement speed reduction, wormhole construction blocking

**Status:** Draft

---

### REQ-RES-008-F: Negative Research Points Handling

**Description:** Research Points have a hard floor at zero. They cannot go negative, and research progress halts when RP reaches zero.

**Consequence Rules:**
- Hard floor: RP cannot drop below 0
- Research progress halts at zero (no further accumulation toward thresholds)
- No penalties beyond halted progress
- Resumes immediately when RP generation returns

**Rationale:** Unlike physical resources, "negative research" is nonsensical. Zero RP simply means no progress. No additional penalties needed.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2 - Resource Storage and Limits, Research Points Handling

**Code:** TBD - `src/lib/game/services/research-service.ts` - RP floor enforcement

**Tests:** TBD - RP floor clamping, progress halt

**Status:** Draft

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/game/services/resource-validation.ts` - Penalty orchestration
- `src/lib/game/services/__tests__/negative-balances.test.ts` - Comprehensive penalty tests

---

### REQ-RES-009: Sector Type Conversion (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RES-009-A through REQ-RES-009-C.

---

### REQ-RES-009-A: Sector Conversion Cost Calculation

**Description:** Players can convert existing sectors to new types at 50% of target sector build cost. Conversion cost represents "repurposing infrastructure" discount compared to destroying and rebuilding.

**Rationale:** Enables strategic pivots (early Food sectors → late Commerce sectors) without requiring sector destruction and rebuild. 50% cost represents infrastructure reuse discount.

**Conversion Formula:**
```
Conversion Cost = Target Sector Build Cost × 0.5

Examples:
- Food → Commerce: 8,000 cr × 0.5 = 4,000 cr
- Commerce → Research: 23,000 cr × 0.5 = 11,500 cr
```

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Conversion cost multiplier | 50% of target cost | Infrastructure reuse discount |

**Source:** Section 3.3 - Sector Type Conversion

**Code:**
- `src/lib/game/services/sector-conversion.ts` - `convertSectorType()` function
- `src/app/actions/sector-actions.ts` - `convertSectorAction()` server action

**Tests:**
- `src/lib/game/services/__tests__/sector-conversion.test.ts` - Conversion cost and restrictions

**Status:** Draft

---

### REQ-RES-009-B: Sector Conversion Timing

**Description:** Sector conversion is instant and completes same turn. No construction delay or multi-turn process.

**Rationale:** Enables strategic pivots without timing penalty. Conversion represents repurposing existing infrastructure, not new construction.

**Key Values:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Conversion duration | Instant (same turn) | No construction delay |

**Source:** Section 3.3 - Sector Type Conversion

**Code:**
- `src/lib/game/services/sector-conversion.ts` - `convertSectorType()` function
- `src/app/actions/sector-actions.ts` - `convertSectorAction()` server action

**Tests:**
- `src/lib/game/services/__tests__/sector-conversion.test.ts` - Conversion cost and restrictions

**Status:** Draft

---

### REQ-RES-009-C: Sector Conversion Restrictions

**Description:** Urban sectors cannot be converted from or to. Cannot convert Urban sectors to other types (protects population capacity). Cannot convert other sectors to Urban (must build new for population growth).

**Rationale:** Urban sectors provide population housing capacity. Preventing conversion protects population from displacement and ensures intentional population capacity planning.

**Restrictions:**
- Cannot convert Urban sectors (protects population capacity)
- Cannot convert sectors to Urban (must build new for population growth)

**Source:** Section 3.3 - Sector Type Conversion

**Code:**
- `src/lib/game/services/sector-conversion.ts` - `convertSectorType()` function
- `src/app/actions/sector-actions.ts` - `convertSectorAction()` server action

**Tests:**
- `src/lib/game/services/__tests__/sector-conversion.test.ts` - Conversion cost and restrictions
- `src/app/actions/__tests__/sector-actions.test.ts` - Server action validation

**Status:** Draft

---

### REQ-RES-010: Urban Sectors and Population Capacity

**Description:** Urban sectors provide population housing capacity:

```
Population Capacity = Urban Sectors × 10,000 people
```

Overcrowding occurs when population exceeds capacity, causing -20 civil status score penalty.

**Starting Conditions:**
- 1 Urban sector (10,000 capacity)
- 10,000 population (at capacity)

**Growth Dynamics:**
- Population grows +2%/turn = +200 people/turn
- Turn 51: Population 20,400, capacity 10,000 → overcrowding penalty
- Solution: Build 1 Urban sector (capacity → 20,000)

**Rationale:** Forces infrastructure investment alongside population growth. Prevents runaway population without corresponding sector expansion.

**Source:** Section 3.4 - Urban Sectors and Population Capacity

**Code:**
- `src/lib/game/services/population-service.ts` - `calculatePopulationCapacity()` function
- `src/lib/game/services/civil-status.ts` - Overcrowding penalty logic

**Tests:**
- `src/lib/game/services/__tests__/population-capacity.test.ts` - Capacity calculation tests
- `src/lib/game/services/__tests__/overcrowding-penalties.test.ts` - Penalty application

**Status:** Draft

---

### REQ-RES-011: Research Point Accumulation

**Description:** Research points accumulate from Research sectors to unlock tech tiers:

```
Research Points per Turn = (Research Sectors × 100 RP) × Civil Status Multiplier

Tier Unlock Thresholds:
- Tier 1 (Doctrine): 1,000 RP
- Tier 2 (Specialization): 5,000 RP
- Tier 3 (Capstone): 15,000 RP
```

**Timeline Examples:**
- 1 Research sector, Content status: ~150 turns to Tier 3
- 2 Research sectors, Content status: ~75 turns to Tier 3
- 3 Research sectors, Ecstatic status: ~20 turns to Tier 3

**Rationale:** Research sectors are expensive (23,000 credits) but necessary for tech victory. Multiple paths to Tier 3 (spam sectors, boost civil status, or slow grind).

**Source:** Section 3.5 - Research Point Accumulation and Tech Unlocks

**Code:**
- `src/lib/game/services/research-service.ts` - `calculateResearchProduction()` function
- `src/lib/game/services/tech-unlock.ts` - Tier threshold checking

**Tests:**
- `src/lib/game/services/__tests__/research-accumulation.test.ts` - RP production tests
- `src/lib/game/services/__tests__/tech-tier-unlocks.test.ts` - Threshold tests

**Status:** Draft

---

### REQ-RES-012: Economic Victory Condition

**Description:** Player achieves Economic Victory when their networth reaches 1.5× (150%) the networth of the 2nd place empire.

**Networth Calculation:**
```
Empire Networth = Credits
                  + (Food × Market Price)
                  + (Ore × Market Price)
                  + (Petroleum × Market Price)
                  + (Sectors × 8,000 average value)
                  + (Military Units × Unit Build Cost)
                  + (Research Points × 10)
```

**Victory Condition:**
```
Player Networth ≥ 1.5 × 2nd Place Networth
```

**Rationale:** Economic victory rewards empire-building over military conquest. 1.5× threshold is achievable but requires sustained economic focus (Commerce sectors + Ecstatic status).

**Source:** Section 1.3 - Player Experience (Economic Victory Path)

**Code:**
- `src/lib/game/services/networth-calculator.ts` - `calculateEmpireNetworth()` function
- `src/lib/game/services/victory-checker.ts` - Economic victory condition check

**Tests:**
- `src/lib/game/services/__tests__/networth-calculation.test.ts` - Networth formula tests
- `src/lib/game/services/__tests__/economic-victory.test.ts` - Victory condition tests

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-RES-001 | Five Resource Types | Draft | TBD |
| REQ-RES-002 | Sector Production Rates | Draft | TBD |
| REQ-RES-003 | Civil Status Income Multiplier | Draft | TBD |
| REQ-RES-004 | Population Food Consumption | Draft | TBD |
| REQ-RES-005 | Military Maintenance Costs | Draft | TBD |
| REQ-RES-006 | Population Growth and Decline | Draft | TBD |
| REQ-RES-007 | Civil Status Calculation Formula | Draft | TBD |
| REQ-RES-008 | Resource Storage and Negative Balances | Draft | TBD |
| REQ-RES-009 | Sector Type Conversion | Draft | TBD |
| REQ-RES-010 | Urban Sectors and Population Capacity | Draft | TBD |
| REQ-RES-011 | Research Point Accumulation | Draft | TBD |
| REQ-RES-012 | Economic Victory Condition | Draft | TBD |

**Total Specifications:** 12
**Implemented:** 0
**Validated:** 0
**Draft:** 12

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: empires (resource columns)
-- Purpose: Store empire resource balances

ALTER TABLE empires ADD COLUMN IF NOT EXISTS credits BIGINT DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS food BIGINT DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS ore BIGINT DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS petroleum BIGINT DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_points BIGINT DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS population BIGINT DEFAULT 10000;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS civil_status VARCHAR(20) DEFAULT 'Content';
ALTER TABLE empires ADD COLUMN IF NOT EXISTS civil_status_score INTEGER DEFAULT 100;

-- Table: sectors (production tracking)
-- Purpose: Store sector types and production rates

CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  sector_type VARCHAR(20) NOT NULL CHECK (sector_type IN ('Food', 'Ore', 'Petroleum', 'Commerce', 'Urban', 'Education', 'Government', 'Research')),
  base_production JSONB NOT NULL DEFAULT '{}', -- e.g., {"credits": 8000} or {"food": 160}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sectors_empire_id ON sectors(empire_id);
CREATE INDEX idx_sectors_sector_type ON sectors(sector_type);

-- Table: resource_transactions (audit log)
-- Purpose: Track all resource changes for debugging and analytics

CREATE TABLE IF NOT EXISTS resource_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'production', 'consumption', 'purchase', 'trade'
  resource_type VARCHAR(20) NOT NULL,
  amount BIGINT NOT NULL, -- positive for gain, negative for loss
  source VARCHAR(100), -- e.g., 'sector_production', 'military_maintenance', 'sector_purchase'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_resource_transactions_empire_id ON resource_transactions(empire_id);
CREATE INDEX idx_resource_transactions_turn ON resource_transactions(turn_number);
```

### 7.2 Service Architecture

```typescript
// src/lib/game/services/resource-engine.ts

import { CivilStatusService } from './civil-status';
import { PopulationService } from './population-service';
import { MilitaryMaintenanceService } from './military-maintenance';

export interface ResourceProduction {
  credits: number;
  food: number;
  ore: number;
  petroleum: number;
  researchPoints: number;
}

export interface ResourceConsumption {
  food: number;
  ore: number;
  petroleum: number;
}

export class ResourceEngine {
  /**
   * Process turn-based resource production for an empire
   * @spec REQ-RES-002
   */
  async calculateTurnProduction(empireId: string): Promise<ResourceProduction> {
    // 1. Get all sectors for empire
    const sectors = await db.query.sectors.findMany({
      where: eq(sectors.empire_id, empireId)
    });

    // 2. Get civil status multiplier
    const civilStatus = await CivilStatusService.getCivilStatus(empireId);
    const multiplier = CivilStatusService.getMultiplier(civilStatus); // @spec REQ-RES-003

    // 3. Calculate production per sector type
    const production: ResourceProduction = {
      credits: 0,
      food: 0,
      ore: 0,
      petroleum: 0,
      researchPoints: 0
    };

    for (const sector of sectors) {
      const baseProduction = this.getBaseProduction(sector.sector_type);

      if (baseProduction.credits) {
        production.credits += baseProduction.credits * multiplier;
      }
      if (baseProduction.food) {
        production.food += baseProduction.food * multiplier;
      }
      // ... other resources
    }

    return production;
  }

  /**
   * Calculate resource consumption for an empire
   * @spec REQ-RES-004, REQ-RES-005
   */
  async calculateTurnConsumption(empireId: string): Promise<ResourceConsumption> {
    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, empireId)
    });

    // Population food consumption @spec REQ-RES-004
    const foodConsumption = PopulationService.calculateFoodConsumption(empire.population);

    // Military maintenance @spec REQ-RES-005
    const maintenanceCosts = await MilitaryMaintenanceService.calculateMaintenance(empireId);

    return {
      food: foodConsumption,
      ore: maintenanceCosts.ore,
      petroleum: maintenanceCosts.petroleum
    };
  }

  /**
   * Apply production and consumption, update balances
   * @spec REQ-RES-002, REQ-RES-004, REQ-RES-005
   */
  async processTurnResources(empireId: string, turnNumber: number): Promise<void> {
    const production = await this.calculateTurnProduction(empireId);
    const consumption = await this.calculateTurnConsumption(empireId);

    // Calculate net changes
    const netCredits = production.credits;
    const netFood = production.food - consumption.food;
    const netOre = production.ore - consumption.ore;
    const netPetroleum = production.petroleum - consumption.petroleum;
    const netResearch = production.researchPoints;

    // Update empire balances
    await db.update(empires)
      .set({
        credits: sql`${empires.credits} + ${netCredits}`,
        food: sql`${empires.food} + ${netFood}`,
        ore: sql`${empires.ore} + ${netOre}`,
        petroleum: sql`${empires.petroleum} + ${netPetroleum}`,
        research_points: sql`${empires.research_points} + ${netResearch}`,
        updated_at: new Date()
      })
      .where(eq(empires.id, empireId));

    // Log transactions for audit
    await this.logResourceTransactions(empireId, turnNumber, production, consumption);
  }

  /**
   * Get base production for sector type
   * @spec REQ-RES-002
   */
  private getBaseProduction(sectorType: string): Partial<ResourceProduction> {
    const baseRates = {
      Food: { food: 160 },
      Ore: { ore: 112 },
      Petroleum: { petroleum: 92 },
      Commerce: { credits: 8000 },
      Urban: { credits: 1000 },
      Research: { researchPoints: 100 },
      Education: {}, // Handled by civil status service
      Government: {} // Handled by covert ops service
    };

    return baseRates[sectorType] || {};
  }
}
```

### 7.3 Server Actions

```typescript
// src/app/actions/sector-actions.ts

"use server";

import { ResourceEngine } from '@/lib/game/services/resource-engine';
import { auth } from '@/lib/auth';

/**
 * Build a new sector for the player's empire
 * @spec REQ-RES-002
 */
export async function buildSectorAction(
  sectorType: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const empireId = session.user.empireId;

  // Validate sector type
  const validTypes = ['Food', 'Ore', 'Petroleum', 'Commerce', 'Urban', 'Education', 'Government', 'Research'];
  if (!validTypes.includes(sectorType)) {
    return { success: false, error: "Invalid sector type" };
  }

  // Get sector cost
  const sectorCosts = {
    Food: 8000,
    Ore: 6000,
    Petroleum: 11500,
    Commerce: 8000,
    Urban: 8000,
    Education: 8000,
    Government: 7500,
    Research: 23000
  };

  const cost = sectorCosts[sectorType];

  // Check credits
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId)
  });

  if (empire.credits < cost) {
    return { success: false, error: `Insufficient credits. Need ${cost}, have ${empire.credits}` };
  }

  // Deduct credits and create sector
  await db.transaction(async (tx) => {
    await tx.update(empires)
      .set({ credits: sql`${empires.credits} - ${cost}` })
      .where(eq(empires.id, empireId));

    await tx.insert(sectors).values({
      empire_id: empireId,
      sector_type: sectorType,
      base_production: getBaseProduction(sectorType)
    });
  });

  return { success: true, message: `${sectorType} sector built for ${cost} credits` };
}

/**
 * Convert existing sector to new type
 * @spec REQ-RES-009
 */
export async function convertSectorAction(
  sectorId: string,
  targetType: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const empireId = session.user.empireId;

  // Validate sector ownership
  const sector = await db.query.sectors.findFirst({
    where: and(eq(sectors.id, sectorId), eq(sectors.empire_id, empireId))
  });

  if (!sector) {
    return { success: false, error: "Sector not found" };
  }

  // Cannot convert Urban sectors
  if (sector.sector_type === 'Urban') {
    return { success: false, error: "Cannot convert Urban sectors (population housing required)" };
  }

  // Cannot convert TO Urban
  if (targetType === 'Urban') {
    return { success: false, error: "Cannot convert to Urban (must build new)" };
  }

  // Calculate conversion cost (50% of target cost)
  const targetCosts = { /* same as above */ };
  const conversionCost = Math.floor(targetCosts[targetType] * 0.5);

  // Check credits
  const empire = await db.query.empires.findFirst({
    where: eq(empires.id, empireId)
  });

  if (empire.credits < conversionCost) {
    return { success: false, error: `Insufficient credits for conversion` };
  }

  // Execute conversion
  await db.transaction(async (tx) => {
    await tx.update(empires)
      .set({ credits: sql`${empires.credits} - ${conversionCost}` })
      .where(eq(empires.id, empireId));

    await tx.update(sectors)
      .set({
        sector_type: targetType,
        base_production: getBaseProduction(targetType),
        updated_at: new Date()
      })
      .where(eq(sectors.id, sectorId));
  });

  return { success: true, message: `Sector converted to ${targetType} for ${conversionCost} credits` };
}
```

### 7.4 UI Components

```typescript
// src/components/game/ResourceBar.tsx

interface ResourceBarProps {
  empireId: string;
}

export function ResourceBar({ empireId }: ResourceBarProps) {
  const { data: empire } = useEmpireResources(empireId);
  const { data: production } = useResourceProduction(empireId);
  const { data: consumption } = useResourceConsumption(empireId);

  if (!empire || !production || !consumption) {
    return <div>Loading resources...</div>;
  }

  const netFood = production.food - consumption.food;
  const netOre = production.ore - consumption.ore;
  const netPetroleum = production.petroleum - consumption.petroleum;

  return (
    <div className="resource-bar">
      <ResourceDisplay
        icon="💰"
        name="Credits"
        balance={empire.credits}
        netChange={production.credits}
        color={production.credits > 0 ? 'green' : 'gray'}
      />
      <ResourceDisplay
        icon="🌾"
        name="Food"
        balance={empire.food}
        netChange={netFood}
        color={netFood < 0 ? 'red' : 'green'}
        warning={empire.food < Math.abs(netFood) * 10} // < 10 turns
      />
      <ResourceDisplay
        icon="⛏️"
        name="Ore"
        balance={empire.ore}
        netChange={netOre}
        color={netOre < 0 ? 'red' : 'green'}
      />
      <ResourceDisplay
        icon="🛢️"
        name="Petroleum"
        balance={empire.petroleum}
        netChange={netPetroleum}
        color={netPetroleum < 0 ? 'red' : 'green'}
      />
      <ResourceDisplay
        icon="🔬"
        name="Research"
        balance={empire.research_points}
        netChange={production.researchPoints}
        color="violet"
      />
      <div className="civil-status">
        Population: {empire.population.toLocaleString()} / {empire.population_capacity.toLocaleString()}
        <br />
        Civil Status: {empire.civil_status} ({getCivilStatusMultiplier(empire.civil_status)}×)
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
| **Turn 50 Population** | 25,000-35,000 | ±5,000 | With 2-3 Food sectors and sustainable growth |
| **Turn 100 Credits (Merchant)** | 500,000-1,000,000 | ±200,000 | With 10+ Commerce sectors + Ecstatic status |
| **Economic Victory Turn** | 80-120 | ±20 turns | Focused Commerce spam strategy |
| **Research Victory Turn** | 100-150 | ±25 turns | With 2-3 Research sectors |
| **Food Sector ROI** | N/A (consumed) | - | Not sold, enables population growth |
| **Commerce Sector ROI** | 1-2 turns | ±0.5 turns | 8,000 cost / 8,000 production (Content status) |
| **Research Sector ROI** | 150-200 turns | ±50 turns | Long-term investment for tech victory |
| **Ecstatic Status Frequency** | 30-40% of games | ±10% | With intentional Education sector investment |
| **Rioting Status Frequency** | <5% of games | ±5% | Should be rare, result of major mistakes |
| **Civil Status Multiplier Impact** | 2.5× income difference (Ecstatic vs Content) | ±0.3× | 20,000 vs 8,000 credits/turn per Commerce |

### 8.2 Simulation Requirements

**Monte Carlo Simulation: Resource Economy Balance**

```
Simulation Parameters:
- Iterations: 10,000 games
- Variables:
  - Starting sectors: 5 (fixed: Food, Ore, Petroleum, Commerce, Urban)
  - Civil status: Random walk with Education sector bias
  - Sector build strategy: Random from {Commerce focus, Research focus, Balanced}
  - Military investment: 20-60% of income (random)
- Controlled:
  - Production rates: Fixed per REQ-RES-002
  - Civil status multipliers: Fixed per REQ-RES-003
  - Consumption rates: Fixed per REQ-RES-004, REQ-RES-005

Success Criteria:
- Economic victory achievable in 80-120 turns (50% of Commerce-focused runs)
- No empire reaches >1M credits before Turn 80 (prevents early snowball)
- Average Turn 100 population: 40,000 ±10,000
- Rioting status: <5% of turns across all empires
```

### 8.3 Playtest Checklist

**Economic Victory Path:**
- [ ] Player can reach 1.5× networth of 2nd place by Turn 100 with Commerce focus
- [ ] Ecstatic status is achievable with 2 Education sectors by Turn 30
- [ ] Civil status drops to Unhappy if player ignores food production for 5+ turns
- [ ] Population reaches 50,000 by Turn 100 with adequate Food sectors

**Military Sustainability:**
- [ ] 20-unit fighter fleet sustainable with 1 Ore + 1 Petroleum sector
- [ ] Large fleet (50+ units) requires 3+ Ore and 2+ Petroleum sectors
- [ ] Going negative on ore deactivates military (cannot attack)
- [ ] Military consumption scales linearly with fleet size (no exploits)

**Research Victory Path:**
- [ ] Tier 3 reachable by Turn 150 with 1 Research sector (slow path)
- [ ] Tier 3 reachable by Turn 75 with 2 Research sectors (focused path)
- [ ] Tier 3 reachable by Turn 50 with 3 Research sectors + Ecstatic (rushed path)
- [ ] Research sector cost (23,000 cr) feels expensive but justified for tech rush

**Civil Status System:**
- [ ] Food deficit causes civil status drop within 3 turns
- [ ] Battle losses affect civil status (-10 score per major defeat)
- [ ] Education sectors boost civil status by +1 level per turn
- [ ] Overcrowding penalty (-20 score) is noticeable but not game-breaking

**Population Mechanics:**
- [ ] Population doubles in ~35 turns with adequate food (2% growth)
- [ ] Starvation reduces population by 50% in 7 turns (10% decline)
- [ ] Urban sector expansion required every ~50 turns for growing empires
- [ ] Population growth plateaus naturally at ~100,000 (food sector limits)

**Resource Conversion:**
- [ ] Converting Food → Commerce (late game) increases income without breaking balance
- [ ] Conversion cost (50% of target) feels reasonable for strategic pivots
- [ ] Urban sector conversion restriction prevents population collapse exploits

---

## 9. Migration Plan

### 9.1 From Current State

| Current State | Target State | Migration Steps |
|---------------|--------------|-----------------|
| No resource system implemented | Full resource economy | 1. Create database schema (empires, sectors, resource_transactions) |
| Static empire data | Dynamic turn-based production/consumption | 2. Implement ResourceEngine service |
| No civil status tracking | Civil status affects income multipliers | 3. Implement CivilStatusService |
| No population mechanics | Population growth tied to food | 4. Implement PopulationService |
| No sector management | Players build/convert sectors | 5. Implement sector-actions.ts server actions |
| No resource UI | Real-time resource display | 6. Create ResourceBar and SectorManagement UI components |

### 9.2 Data Migration

**Initial Empire Setup (new games):**

```sql
-- Migration: Initialize starting resources for new empires
-- Safe to run: YES (only affects new game creation)

-- When creating new empire, set starting resources:
INSERT INTO empires (id, name, credits, food, ore, petroleum, research_points, population, civil_status, civil_status_score)
VALUES (
  gen_random_uuid(),
  'Player Empire',
  50000,    -- Starting credits (can build 6 sectors immediately)
  5000,     -- Starting food (10 turns of consumption for 10k pop)
  500,      -- Starting ore (for initial military)
  500,      -- Starting petroleum (for initial military)
  0,        -- No research points yet
  10000,    -- Starting population
  'Content',  -- Starting civil status
  100       -- Starting civil status score
);

-- Create starting sectors (5 sectors):
INSERT INTO sectors (empire_id, sector_type, base_production)
VALUES
  (empire_id, 'Food', '{"food": 160}'),
  (empire_id, 'Ore', '{"ore": 112}'),
  (empire_id, 'Petroleum', '{"petroleum": 92}'),
  (empire_id, 'Commerce', '{"credits": 8000}'),
  (empire_id, 'Urban', '{"credits": 1000}');
```

**Existing Games (if resource system added mid-development):**

```sql
-- Migration: Add resource columns to existing empires
-- Safe to run: YES (uses ALTER TABLE IF NOT EXISTS)

ALTER TABLE empires ADD COLUMN IF NOT EXISTS credits BIGINT DEFAULT 50000;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS food BIGINT DEFAULT 5000;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS ore BIGINT DEFAULT 500;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS petroleum BIGINT DEFAULT 500;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_points BIGINT DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS population BIGINT DEFAULT 10000;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS civil_status VARCHAR(20) DEFAULT 'Content';
ALTER TABLE empires ADD COLUMN IF NOT EXISTS civil_status_score INTEGER DEFAULT 100;

-- Backfill sectors for existing empires (5 starting sectors each):
INSERT INTO sectors (empire_id, sector_type, base_production)
SELECT e.id, 'Food', '{"food": 160}'
FROM empires e
WHERE NOT EXISTS (SELECT 1 FROM sectors s WHERE s.empire_id = e.id AND s.sector_type = 'Food');

-- (Repeat for Ore, Petroleum, Commerce, Urban)
```

### 9.3 Rollback Plan

If resource system causes critical issues:

**Step 1: Disable resource consumption**
```sql
-- Temporarily disable consumption (allow infinite resources)
UPDATE game_config SET resource_consumption_enabled = FALSE;
```

**Step 2: Restore pre-migration state**
```sql
-- Rollback: Remove resource columns
ALTER TABLE empires DROP COLUMN IF EXISTS credits;
ALTER TABLE empires DROP COLUMN IF EXISTS food;
ALTER TABLE empires DROP COLUMN IF EXISTS ore;
ALTER TABLE empires DROP COLUMN IF EXISTS petroleum;
ALTER TABLE empires DROP COLUMN IF EXISTS research_points;
ALTER TABLE empires DROP COLUMN IF EXISTS population;
ALTER TABLE empires DROP COLUMN IF EXISTS civil_status;
ALTER TABLE empires DROP COLUMN IF EXISTS civil_status_score;

-- Drop sectors table
DROP TABLE IF EXISTS sectors CASCADE;
DROP TABLE IF EXISTS resource_transactions CASCADE;
```

**Step 3: Restore from backup**
```bash
# Restore database from pre-migration backup
pg_restore -U postgres -d nexus_dominion backup_pre_resource_system.dump
```

---

## 10. Conclusion

### Key Decisions

**Decision 1: Five Resources (Not Three, Not Ten)**
- **Rationale**: Three resources (Credits, Food, Military) felt too shallow; ten resources overwhelmed playtesters. Five resources create strategic specialization (Merchant vs Warlord vs Tech Rush) without cognitive overload.
- **Trade-off**: More complexity than minimalist design, but significantly more depth than single-currency systems.

**Decision 2: Civil Status Affects Income (0.25× to 2.5× Multiplier)**
- **Rationale**: Makes happiness management critical, not cosmetic. A Rioting empire produces 10× less than Ecstatic, creating powerful incentive to invest in Education sectors and manage food supply.
- **Trade-off**: Players who ignore civil status fall behind economically, but this is intentional (rewards skilled empire management).

**Decision 3: Population Growth Asymmetric (2% Growth, 10% Decline)**
- **Rationale**: Food surplus should be rewarded slowly (prevents runaway population), but food deficit must be severely punished (creates urgency, prevents neglect).
- **Trade-off**: Starvation can spiral quickly (population halves in 7 turns), but this forces players to prioritize food early game.

**Decision 4: No Hard Storage Caps (Soft Limits via Consequences)**
- **Rationale**: Aligns with "Consequence over limits" design philosophy. Players can go into debt strategically, but negative balances have clear penalties (military deactivates, population starves).
- **Trade-off**: Requires clear UI warnings to prevent accidental resource collapse.

**Decision 5: Sector Conversion (50% Cost)**
- **Rationale**: Enables strategic pivots (early Food → late Commerce) without requiring sector destruction and rebuild. 50% cost represents "repurposing infrastructure" discount, feels fair.
- **Trade-off**: Could enable rapid strategy shifts, but conversion cost limits exploitation.

### Open Questions

**Question 1: Civil Status Multiplier Values**
- **Context**: Current values (2.5× Ecstatic, 1.5× Happy) are from PRD-FORMULAS-ADDENDUM. Alternative values (4.0× Ecstatic, 2.0× Happy) exist in draft notes.
- **Options**: Keep current values (10× difference Ecstatic/Rioting) or increase to original values (16× difference)?
- **Decision Needed**: Playtest both and compare economic victory timelines.

**Question 2: Food Consumption Rate (0.5 food/capita)**
- **Context**: Current value creates ~30% population growth potential by Turn 100 with 3 Food sectors. Is this too fast? Too slow?
- **Options**: Increase to 0.75 food/capita (slower growth) or decrease to 0.3 (faster growth)?
- **Decision Needed**: Simulate target Turn 100 population and compare to victory condition thresholds.

**Question 3: Military Maintenance Rates (5% Ore, 3% Petroleum)**
- **Context**: Current values are placeholders. Large fleets (50+ units) require significant resource production. Is this balanced?
- **Options**: Reduce to 3% ore / 2% petroleum (easier to maintain fleets) or keep current (military is expensive)?
- **Decision Needed**: Playtest with various fleet sizes and measure resource sustainability.

**Question 4: Research Sector Cost (23,000 Credits)**
- **Context**: Research sectors are 2.875× more expensive than Commerce sectors. Is this justified for tech victory path?
- **Options**: Reduce to 15,000 cr (faster tech rush) or keep 23,000 (forces economic trade-off)?
- **Decision Needed**: Compare tech victory timelines across cost values.

**Question 5: Urban Sector Population Capacity (10,000 per sector)**
- **Context**: With 2% growth, players need 1 new Urban sector every ~35 turns. Is this too frequent? Not frequent enough?
- **Options**: Increase to 15,000 capacity (less frequent expansion) or keep 10,000 (steady infrastructure investment)?
- **Decision Needed**: Evaluate Urban sector build frequency in playtests.

### Dependencies

**Depends On:**
- **Turn Processing System**: Resource production/consumption happens during turn processing
- **Sector System**: Sectors produce resources; sector acquisition is core gameplay
- **Combat System**: Military units consume ore/petroleum; battle losses affect civil status
- **Database Schema**: Empire and sector tables must exist before resource tracking

**Depended On By:**
- **Military System**: Units require ore/petroleum maintenance; construction costs credits + resources
- **Research System**: Research points unlock tech tree tiers
- **Diplomacy System**: Economic power (networth) affects treaty negotiations
- **Victory System**: Economic victory condition requires networth calculation
- **Bot AI System**: Bots make economic decisions (sector building, resource management)
- **Market System**: Resource trading requires resource balances
- **UI System**: Resource display, sector management interface

---

**⚠️ PLACEHOLDER VALUE SUMMARY**

The following values are **initial estimates requiring balance testing**:

| Value | Current | Needs Testing Against |
|-------|---------|----------------------|
| Food consumption | 0.5 food/capita/turn | Turn 100 population targets |
| Population growth rate | 2%/turn | Victory timeline (80-120 turns) |
| Starvation rate | 10%/turn decline | Player response time to food crisis |
| Ore maintenance | 5% of build cost | Fleet size sustainability |
| Petroleum fuel | 3% of build cost | Military operation frequency |
| Civil status Ecstatic | 2.5× multiplier | Economic victory feasibility |
| Civil status thresholds | 150+ Ecstatic, 0-39 Rioting | Empire management difficulty |
| Urban capacity | 10,000/sector | Build frequency expectations |
| Research sector cost | 23,000 credits | Tech victory timeline |

**Balance testing should prioritize**:
1. Economic victory achievable in 80-120 turns
2. Ecstatic status achievable naturally (not impossible)
3. Military sustainability with moderate Ore/Petroleum investment
4. Food crisis creates urgency but not instant death

---

**END OF DOCUMENT**
