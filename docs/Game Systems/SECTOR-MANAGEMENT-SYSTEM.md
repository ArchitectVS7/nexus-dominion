# Sector Management System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-SEC
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/SECTOR-MANAGEMENT-SYSTEM.md

---

## Document Purpose

This document defines the **Sector Management System**, the core economic and territorial foundation of Nexus Dominion. Sectors are the fundamental unit of production, representing distinct industrial zones within an empire that generate resources, house population, and enable military operations.

This document is essential reading for:
- **Backend engineers** implementing resource production, sector acquisition, and economic balance
- **Frontend developers** building the sector management interface and visualization
- **Game designers** balancing production rates, costs, and strategic depth
- **Bot developers** programming AI empire economic strategies

Key decisions resolved:
- **8 sector types** with distinct production profiles and strategic purposes
- **Starting configuration** of 5 sectors providing early-game balance
- **Scaling cost formula** preventing runaway expansion while allowing strategic growth
- **Production values** for each sector type balancing economic complexity with clarity

**Design Philosophy:**
- **Specialization Creates Strategy** - Different sector types force meaningful economic choices
- **Expansion Has Consequences** - Each new sector increases cost, balancing growth vs efficiency
- **No Micromanagement** - Sectors produce automatically, players focus on strategic allocation
- **Clarity Over Realism** - Simple, predictable production rules (no random variation)
- **Economic Foundation** - Sectors are the bedrock; all other systems depend on this working correctly

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

### 1.1 Sectors as Economic Units

A **sector** is an industrial zone within an empire that produces resources each turn. Think of sectors as specialized factories or districts:
- A **Commerce** sector is a financial district generating credits
- A **Food** sector is agricultural land producing sustenance
- An **Ore** sector is a mining operation extracting raw materials

Each empire starts with **5 sectors** (1 Food, 1 Ore, 1 Petroleum, 1 Commerce, 1 Urban), providing a balanced starting economy. Players acquire additional sectors throughout the game, specializing their economy based on their strategic goals.

**Key Properties:**
- Sectors produce resources **automatically** at the start of each turn
- Production is **deterministic** - no randomness
- Sector type determines production (cannot be changed after acquisition)
- No limit on total sector count (but costs scale exponentially)

### 1.2 The Expansion Trade-off

The core mechanic is the **cost scaling** of sector acquisition:
- First sector beyond starting 5: ~8,000 credits
- 10th sector: ~22,000 credits
- 20th sector: ~42,000 credits

This creates a fundamental strategic tension:
- **Wide expansion** (many sectors) provides diverse production but high maintenance
- **Tall specialization** (few sectors + other strategies) is efficient but limited

The formula prevents runaway economic snowballing while still rewarding successful expansion.

### 1.3 Player Experience

**Early Game (Turns 1-20):**
Players operate with their starting 5 sectors, learning resource management. First expansion decision is critical: "Do I need more income (Commerce), military capacity (Ore), or research capability (Research sector)?"

**Mid Game (Turns 21-60):**
Players build 3-7 additional sectors, specializing their economy. A military-focused empire might have 3 Ore sectors and 2 Military sectors. An economic empire might have 4 Commerce sectors and 2 Research sectors.

**Late Game (Turns 61+):**
Wealthy empires manage 15-30 sectors, while struggling empires might have only 8-10. Sector count becomes a visible indicator of empire success. Conquering an enemy might yield their sectors (or destroy them - to be defined in MILITARY-SYSTEM.md).

---

## 2. Mechanics Overview

### 2.1 Sector Types and Production

| Type | Production Per Turn | Base Cost | Strategic Purpose |
|------|---------------------|-----------|-------------------|
| **Food** | 160 food | 8,000 cr | Feed population, prevent starvation |
| **Ore** | 112 ore | 6,000 cr | Build military units, construct buildings |
| **Petroleum** | 92 petro | 11,500 cr | Fuel military operations, creates pollution |
| **Commerce** | 8,000 credits | 8,000 cr | Primary income source |
| **Urban** | +1,000 pop cap<br>+1,000 cr/turn | 8,000 cr | House growing population |
| **Education** | +5 civil status/turn | 8,000 cr | Increase happiness, reduce unrest |
| **Government** | +300 agents/turn | 7,500 cr | Enable covert operations |
| **Research** | +10 research pts/turn | 23,000 cr | Accelerate tech tree progression |

**Notes:**
- **Food, Ore, Petroleum, Commerce:** Direct resource production
- **Urban:** Hybrid - provides both population capacity and income
- **Education:** Intangible benefit (civil status) affecting empire stability
- **Government:** Enables covert ops system (see COVERT-OPS-SYSTEM.md)
- **Research:** Most expensive, provides strategic advantage (see RESEARCH-SYSTEM.md)

### 2.2 Starting Configuration

Every empire begins with exactly **5 sectors**: <!-- @spec REQ-SEC-001 -->

| Sector Type | Production | Purpose |
|-------------|------------|---------|
| Food | 160 food/turn | Sustain starting population |
| Ore | 112 ore/turn | Build initial military units |
| Petroleum | 92 petro/turn | Fuel early operations |
| Commerce | 8,000 credits/turn | Primary income for expansion |
| Urban | +1,000 pop cap + 1,000 cr/turn | House population, bonus income |

**Total Starting Production:**
- **Credits:** 9,000/turn (8,000 Commerce + 1,000 Urban)
- **Food:** 160/turn
- **Ore:** 112/turn
- **Petroleum:** 92/turn
- **Population Capacity:** Base + 1,000

This configuration ensures every empire can:
- Feed their starting population
- Build military units
- Afford early expansion (first sector at turn ~10)
- Make meaningful strategic choices about specialization

### 2.3 Sector Acquisition Cost Formula

Cost increases based on **current sector count** (including starting 5): <!-- @spec REQ-SEC-002 -->

```
Sector Cost = Base Cost × (1 + Current Count × 0.1)^1.5
```

**Example Costs:**

| Current Sectors | Next Sector Cost | Increase |
|-----------------|------------------|----------|
| 5 (starting) | 8,000 cr × 1.5^1.5 = 14,696 cr | Baseline |
| 10 | 8,000 cr × 2.0^1.5 = 22,627 cr | +54% |
| 15 | 8,000 cr × 2.5^1.5 = 31,623 cr | +40% |
| 20 | 8,000 cr × 3.0^1.5 = 41,569 cr | +31% |
| 30 | 8,000 cr × 4.0^1.5 = 64,000 cr | +54% |

**Rationale:**
- Exponential growth (exponent 1.5) prevents infinite expansion
- First expansion affordable by turn 10-12 with starting income
- Late-game empires can still expand but at significant cost
- Creates "saturation point" around 25-30 sectors for most empires

---

## 3. Detailed Rules

### 3.1 Sector Type Classification

All sectors fall into one of three categories: <!-- @spec REQ-SEC-003 -->

**Resource Producers (4 types):**
- Food, Ore, Petroleum, Commerce
- Produce tangible resources added to empire stockpile each turn
- Subject to resource caps (see RESOURCE-SYSTEM.md)

**Infrastructure Providers (2 types):**
- Urban (population capacity + income)
- Government (agent capacity)
- Modify empire capabilities rather than producing consumables

**Intangible Boosters (2 types):**
- Education (civil status)
- Research (research points)
- Affect game state but don't produce stockpiled resources

### 3.2 Sector Acquisition Process

**Prerequisites:**
1. Empire must have sufficient credits (see Section 2.3 formula)
2. Empire must have available "slot" (no hard limit, but UI might paginate)
3. Player must select sector type during acquisition

**Process:**
1. Player clicks "Acquire New Sector" in Command Center
2. System calculates cost based on current sector count
3. UI displays cost and sector type selection grid
4. Player selects sector type (Food, Ore, etc.)
5. System deducts credits from empire treasury
6. New sector immediately added to empire (produces starting next turn)
7. Confirmation message: "Acquired [Type] Sector for [Cost] credits"

**Edge Cases:**
- Insufficient funds: Button disabled, shows "Need X more credits"
- No selection made: Confirmation button disabled
- Mid-turn acquisition: Sector doesn't produce until *next* turn boundary

### 3.3 Production Timing

Sector production occurs at the **Turn Boundary** (server-side turn processing): <!-- @spec REQ-SEC-004 -->

**Sequence:**
1. Turn increments (Turn N → Turn N+1)
2. Each sector produces its output
3. Resources added to empire stockpile
4. Population consumes food (population_count × 0.5 food)
5. Military consumes petroleum (military_power × 0.2 petro)
6. Notification: "Turn X complete. Sectors produced: [summary]"

**Example:**
```
Empire has 3 Commerce sectors, 2 Food sectors
Turn 10 → Turn 11:
  + 24,000 credits (3 × 8,000)
  + 320 food (2 × 160)
  - 150 food (population consumption)
  - 40 petro (military maintenance)
Net result: +24,000 cr, +170 food, -40 petro
```

### 3.4 Sector Destruction and Capture

**Destruction (Combat Loss):**
- When an empire is defeated in combat, they may lose sectors
- Losing empire: Randomly lose 1-3 sectors (destroyed, not transferred)
- Destroyed sectors: Gone permanently, reduce loser's production capacity
- Formula: `sectors_lost = floor(1 + random(0, 2) + attacker_overkill_bonus)`

**Capture (Conquest Victory):**
- If an empire is completely conquered (reaches 0 networth or surrenders)
- Victor **may** claim up to 50% of conquered empire's sectors
- Sector types transferred randomly from conquered empire's portfolio
- Rationale: Prevents winner from getting *all* sectors (too snowball-y)

**Clarifications Needed:**
- Does sector destruction reduce conquered empire to minimum 1 sector?
- Can you choose which sectors to transfer, or always random?
- What happens to special sectors (Research, Government) on transfer?

### 3.5 Sector Limits and Caps

**No Hard Limit:**
There is no maximum number of sectors an empire can own. However, practical limits emerge from:
- Exponential cost scaling (see Section 2.3)
- Income vs expansion cost ratio (diminishing returns after ~25-30 sectors)
- UI pagination (Command Center shows 10 sectors per page)

**Resource Caps:**
Sectors can produce more resources than empire storage allows:
- Credits: No cap (stored as integer)
- Food: Capped at 10,000 (excess wasted)
- Ore: Capped at 5,000 (excess wasted)
- Petroleum: Capped at 3,000 (excess wasted)

**Storage Implications:**
- Acquiring more Food sectors when already at cap is wasteful
- Players should balance production vs storage capacity
- Upgrade storage via Research tree (see RESEARCH-SYSTEM.md)

### 3.6 Special Sector Interactions

**Education Sectors:**
- Each Education sector provides +5 civil status per turn
- Civil status affects population happiness, unrest, and rebellion risk
- Multiple Education sectors stack (+5, +10, +15...)
- High civil status reduces bot aggression toward player

**Government Sectors:**
- Each Government sector provides +300 agent capacity
- Agents are consumed by covert operations (see COVERT-OPS-SYSTEM.md)
- Starting empires have 0 Government sectors → 0 agent capacity
- Must acquire to enable espionage, sabotage, etc.

**Research Sectors:**
- Each Research sector provides +10 research points per turn
- Research points accelerate progression through 3-tier tech tree
- Most expensive sector type (23,000 cr base cost)
- Critical for "Research Victory" condition (see VICTORY-SYSTEMS.md)

---

## 4. Bot Integration

### 4.1 Archetype Behavior

How each of the 8 archetypes prioritizes sector acquisition:

| Archetype | Sector Priority | Acquisition Pattern | Economic Strategy |
|-----------|----------------|---------------------|-------------------|
| **Warlord** | Ore > Petroleum > Commerce | Acquires 2-3 Ore sectors early, minimal Commerce | Military-focused, accepts economic weakness |
| **Diplomat** | Commerce > Education > Urban | Balanced portfolio, prioritizes stability | Strong economy funds diplomacy |
| **Merchant** | Commerce > Commerce > Commerce | Hyper-specializes in income, 5-7 Commerce sectors | Maximizes credits, trades for other resources |
| **Schemer** | Government > Commerce > Ore | Acquires 2 Government sectors by mid-game | Funds covert ops economy |
| **Turtle** | Food > Education > Urban | Defensive economy, prioritizes sustainability | Self-sufficient, minimal expansion |
| **Blitzkrieg** | Ore > Petroleum > Ore | Rapid military buildup, then conquest to sustain | Conquers to acquire sectors rather than buying |
| **Tech Rush** | Research > Commerce > Research | Acquires 1-2 Research sectors ASAP | Expensive strategy, needs strong Commerce base |
| **Opportunist** | Variable (context-dependent) | Adapts to game state, no fixed pattern | Acquires whatever gives current advantage |

### 4.2 Bot Decision Logic

Pseudo-code for bot sector acquisition decisions:

```
function decideSectorAcquisition(bot):
    if (bot.credits < calculateSectorCost(bot.sectorCount)):
        return DEFER  # Not enough credits

    if (bot.sectorCount >= 25):
        return DEFER  # Economic saturation reached

    # Calculate resource deficits
    foodDeficit = (bot.population * 0.5) - bot.foodProduction
    oreDeficit = bot.militaryDesiredPower - (bot.oreProduction * 10)
    petroDeficit = (bot.militaryPower * 0.2) - bot.petroProduction

    # Archetype-specific logic
    if (bot.archetype == "Warlord"):
        if (oreDeficit > 200): return ACQUIRE_ORE
        if (petroDeficit > 50): return ACQUIRE_PETROLEUM
        if (bot.commerceSectors < 3): return ACQUIRE_COMMERCE  # Minimum income
        return DEFER

    if (bot.archetype == "Merchant"):
        if (bot.commerceSectors < 7): return ACQUIRE_COMMERCE
        if (foodDeficit > 100): return ACQUIRE_FOOD  # Maintenance only
        return DEFER

    if (bot.archetype == "Tech Rush"):
        if (bot.researchSectors == 0 and bot.credits > 25000):
            return ACQUIRE_RESEARCH  # First priority
        if (bot.commerceSectors < 4): return ACQUIRE_COMMERCE  # Fund research
        if (bot.researchSectors < 2 and bot.credits > 40000):
            return ACQUIRE_RESEARCH  # Second research sector
        return DEFER

    # Default logic for other archetypes
    if (foodDeficit > 150): return ACQUIRE_FOOD
    if (bot.commerceSectors < bot.sectorCount * 0.4):
        return ACQUIRE_COMMERCE  # Maintain income ratio

    return priorityListByArchetype[bot.archetype][0]  # Default priority
```

### 4.3 Bot Messages

Message templates with personality (5-10 examples):

**Sector Acquisition Announcements:**

```
Warlord acquires Ore sector:
"Another mining operation under my control. Steel for the war machine!"

Diplomat acquires Education sector:
"Investing in our citizens' future. A prosperous people are a loyal people."

Merchant acquires 5th Commerce sector:
"Credits flow like rivers into my treasury. Care to trade, {player_name}?"

Schemer acquires Government sector:
"My network of agents grows. Your secrets won't stay secret for long..."

Turtle acquires Food sector:
"Self-sufficiency is survival. I won't starve while you fight your wars."

Tech Rush acquires Research sector (expensive):
"The cost is steep, but knowledge is priceless. I'll be unstoppable soon."

Opportunist acquires counter-strategy sector:
"Adapting my economy to exploit {leader_name}'s weakness. Efficiency is key."
```

**Economic Strain Messages:**

```
Bot unable to afford sector expansion:
"My treasury runs dry. Time to tighten the belt... or raid a neighbor."

Bot reaches 25+ sectors:
"My empire sprawls across the stars. Further expansion seems... inefficient."

Bot loses sectors in combat:
"They've destroyed my [sector type]! Reconstruction will take time and credits."
```

---

## 5. UI/UX Design

### 5.1 UI Mockups

**Command Center - Sector Management Panel:**

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTOR MANAGEMENT                                    [+ ACQUIRE]│
├─────────────────────────────────────────────────────────────────┤
│  Total Sectors: 12/∞        Next Cost: 28,450 cr               │
│                                                                  │
│  Production Summary (per turn):                                 │
│    Credits:  32,000 cr/turn  [====      ] (4 Commerce)         │
│    Food:     480 units/turn  [==        ] (3 Food)             │
│    Ore:      224 units/turn  [==        ] (2 Ore)              │
│    Petroleum: 184 units/turn [==        ] (2 Petroleum)        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ YOUR SECTORS                                            │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ [COMMERCE]  8,000 cr/turn                               │   │
│  │ [COMMERCE]  8,000 cr/turn                               │   │
│  │ [COMMERCE]  8,000 cr/turn                               │   │
│  │ [COMMERCE]  8,000 cr/turn                               │   │
│  │ [FOOD]      160 food/turn                               │   │
│  │ [FOOD]      160 food/turn                               │   │
│  │ [FOOD]      160 food/turn                               │   │
│  │ [ORE]       112 ore/turn                                │   │
│  │ [ORE]       112 ore/turn                                │   │
│  │ [PETROLEUM] 92 petro/turn                               │   │
│  │ [PETROLEUM] 92 petro/turn                               │   │
│  │ [URBAN]     +1,000 pop + 1,000 cr/turn                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                              Page 1 of 2 [>]    │
└─────────────────────────────────────────────────────────────────┘
```

**Sector Acquisition Modal:**

```
┌─────────────────────────────────────────────────────────────┐
│  ACQUIRE NEW SECTOR                                    [X]  │
├─────────────────────────────────────────────────────────────┤
│  Cost: 28,450 credits                                       │
│  Your Treasury: 45,200 credits  (16,750 remaining)         │
│                                                             │
│  Select Sector Type:                                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   COMMERCE   │  │     FOOD     │  │     ORE      │     │
│  │  8,000 cr/t  │  │  160 food/t  │  │  112 ore/t   │     │
│  │    8,000 cr  │  │    8,000 cr  │  │    6,000 cr  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PETROLEUM   │  │    URBAN     │  │  EDUCATION   │     │
│  │  92 petro/t  │  │ +1k pop cap  │  │  +5 civil/t  │     │
│  │   11,500 cr  │  │    8,000 cr  │  │    8,000 cr  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  GOVERNMENT  │  │   RESEARCH   │                        │
│  │ +300 agents  │  │ +10 rsch pt/t│                        │
│  │    7,500 cr  │  │   23,000 cr  │  [LOCKED: Need Rsch 2] │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
│              [ CANCEL ]  [ ACQUIRE SELECTED ]              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 User Flows

**Flow 1: Acquiring a New Sector**

1. Player opens Command Center starmap
2. Clicks "Sector Management" tab (or clicks own empire territory)
3. Sector panel displays current sectors + production summary
4. Player clicks "[+ ACQUIRE]" button (top-right)
5. System calculates cost: `cost = 8000 × (1 + sectorCount × 0.1)^1.5`
6. Modal opens with sector type grid
7. Player hovers over sector type → tooltip shows production details
8. Player clicks desired sector type → card highlights
9. Player clicks "ACQUIRE SELECTED" button
10. System validates:
    - Sufficient credits? If no, show error: "Insufficient funds. Need X more."
    - Sector selected? If no, button stays disabled
11. On success:
    - Deduct credits from player treasury
    - Add sector to player's sector list
    - Close modal
    - Show notification: "Acquired [Type] Sector for [Cost] credits"
    - Sector panel updates with new sector
12. New sector begins producing next turn

**Flow 2: Viewing Sector Details**

1. Player opens Sector Management panel
2. Player clicks on a sector card in the list
3. Detailed view expands below the card:
   ```
   [COMMERCE] - Acquired Turn 15
   Production: 8,000 credits/turn
   Total produced: 120,000 credits (15 turns)
   Status: Active

   [No actions available - sectors cannot be destroyed or converted]
   ```
4. Player clicks outside or presses ESC to collapse detail view

**Flow 3: Turn Boundary Production Notification**

1. Turn timer reaches 0:00
2. Server processes turn boundary
3. All sectors produce resources
4. Client receives update
5. Notification banner appears:
   ```
   TURN 25 COMPLETE
   Sector Production: +32,000 cr, +480 food, +224 ore, +184 petro
   Population Consumed: -250 food
   Military Consumed: -120 petro
   Net Result: +32,000 cr, +230 food, +224 ore, +64 petro
   ```
6. Player acknowledges (auto-dismiss after 5 seconds)

### 5.3 Visual Design Principles

**LCARS-Inspired Styling:**
- Sector cards use colored left border indicating type:
  - Commerce: Gold (#FFD700)
  - Food: Green (#4CAF50)
  - Ore: Gray (#9E9E9E)
  - Petroleum: Dark Blue (#1976D2)
  - Urban: Purple (#9C27B0)
  - Education: Light Blue (#03A9F4)
  - Government: Red (#F44336)
  - Research: Orange (#FF9800)

**Icons:**
- Commerce: Dollar sign ($)
- Food: Wheat stalk (🌾)
- Ore: Pickaxe (⛏)
- Petroleum: Oil barrel (🛢)
- Urban: Buildings (🏙)
- Education: Book (📚)
- Government: Shield (🛡)
- Research: Microscope (🔬)

**Interaction States:**
- Default: Card with subtle shadow
- Hover: Highlighted border, +5% brightness
- Selected (in acquisition modal): Glowing border, checkmark icon
- Disabled (insufficient funds): Grayed out, 50% opacity, lock icon

**Responsive Behavior:**
- Desktop: Grid layout, 3-4 cards per row
- Tablet: 2 cards per row
- Mobile: Single column, scrollable list

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

### REQ-SEC-001: Starting Sectors

**Description:** Each empire starts with exactly 5 sectors: 1 Food, 1 Ore, 1 Petroleum, 1 Commerce, 1 Urban.

**Rationale:** Provides meaningful starting position without overwhelming new players. Ensures every empire can sustain population, build military, and afford expansion. Balanced configuration prevents starting advantage/disadvantage.

**Key Values:**

| Sector Type | Count | Production |
|-------------|-------|------------|
| Food | 1 | 160 food/turn |
| Ore | 1 | 112 ore/turn |
| Petroleum | 1 | 92 petro/turn |
| Commerce | 1 | 8,000 credits/turn |
| Urban | 1 | +1,000 pop cap + 1,000 cr/turn |

**Source:** Section 2.2 - Starting Configuration

**Code:**
- `src/lib/game/constants.ts` - `STARTING_SECTORS` constant
- `src/lib/game/empire-initialization.ts` - `initializeEmpireSectors()` function
- `src/lib/db/schema.ts` - `sectors` table schema

**Tests:**
- `src/lib/game/__tests__/empire-initialization.test.ts` - "should create 5 starting sectors with correct types"
- `src/lib/game/__tests__/empire-initialization.test.ts` - "should produce correct starting resources on turn 1"

**Status:** Draft

---

### REQ-SEC-002: Sector Cost Scaling

**Description:** The cost to acquire new sectors increases based on current sector count using the formula: `Cost = 8000 × (1 + Current_Count × 0.1)^1.5`

**Rationale:** Prevents runaway expansion while allowing strategic growth. Exponential scaling (exponent 1.5) creates diminishing returns, balancing wide vs tall empire strategies. First expansion affordable by turn 10-12 with starting income.

**Formula:**
```
Sector Cost = Base Cost × (1 + Current Sector Count × 0.1)^1.5

Where:
  Base Cost = 8,000 credits
  Current Sector Count = Total sectors owned (including starting 5)
  Exponent = 1.5 (chosen for balance)
```

**Key Values:**

| Current Sectors | Next Sector Cost |
|-----------------|------------------|
| 5 | 14,696 cr |
| 10 | 22,627 cr |
| 15 | 31,623 cr |
| 20 | 41,569 cr |
| 30 | 64,000 cr |

**Source:** Section 2.3 - Sector Acquisition Cost Formula

**Code:**
- `src/lib/formulas/sector-costs.ts` - `calculateSectorCost(currentCount: number): number`
- `src/app/actions/sector-actions.ts` - `acquireSector()` action

**Tests:**
- `src/lib/formulas/__tests__/sector-costs.test.ts` - "should calculate correct cost for various sector counts"
- `src/lib/formulas/__tests__/sector-costs.test.ts` - "should use exponent 1.5 for scaling"
- `src/lib/formulas/__tests__/sector-costs.test.ts` - "first expansion from 5 sectors should cost 14,696 cr"

**Status:** Draft

---

### REQ-SEC-003: Eight Sector Types (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-SEC-003-01 through REQ-SEC-003-08 for individual sector type definitions.

**Overview:** Exactly 8 sector types exist, categorized as Resource Producers (4), Infrastructure Providers (2), and Intangible Boosters (2). Each type has distinct production profile, cost, and strategic purpose.

---

### REQ-SEC-003-01: Food Sector Type

**Description:** Food sector produces 160 food/turn and costs 8,000 cr to acquire. Categorized as Resource Producer.

**Rationale:** Primary food production building. Essential for feeding population and preventing starvation. Standard cost makes it accessible for early expansion.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | 160 food/turn |
| Base Cost | 8,000 cr |
| Category | Resource Producer |
| Strategic Purpose | Feed population, prevent starvation |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('food')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.food = 160`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.food = 8000`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Food sector production and cost validation

**Status:** Draft

---

### REQ-SEC-003-02: Ore Sector Type

**Description:** Ore sector produces 112 ore/turn and costs 6,000 cr to acquire. Categorized as Resource Producer.

**Rationale:** Primary ore production building. Essential for military unit construction. Lowest acquisition cost encourages military-focused expansion strategies.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | 112 ore/turn |
| Base Cost | 6,000 cr |
| Category | Resource Producer |
| Strategic Purpose | Build military units, construct buildings |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('ore')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.ore = 112`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.ore = 6000`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Ore sector production and cost validation

**Status:** Draft

---

### REQ-SEC-003-03: Petroleum Sector Type

**Description:** Petroleum sector produces 92 petroleum/turn and costs 11,500 cr to acquire. Categorized as Resource Producer.

**Rationale:** Primary petroleum production building. Essential for military maintenance and operations. Higher cost reflects strategic importance and environmental trade-offs (pollution).

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | 92 petroleum/turn |
| Base Cost | 11,500 cr |
| Category | Resource Producer |
| Strategic Purpose | Fuel military operations, creates pollution |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('petroleum')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.petroleum = 92`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.petroleum = 11500`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Petroleum sector production and cost validation

**Status:** Draft

---

### REQ-SEC-003-04: Commerce Sector Type

**Description:** Commerce sector produces 8,000 credits/turn and costs 8,000 cr to acquire. Categorized as Resource Producer.

**Rationale:** Primary income source. Self-financing after 1 turn. Standard cost (pays for itself) makes it fundamental choice for economic expansion.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | 8,000 credits/turn |
| Base Cost | 8,000 cr |
| Category | Resource Producer |
| Strategic Purpose | Primary income source |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('commerce')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.commerce = 8000`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.commerce = 8000`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Commerce sector production and cost validation

**Status:** Draft

---

### REQ-SEC-003-05: Urban Sector Type

**Description:** Urban sector provides +1,000 population capacity and +1,000 credits/turn, costs 8,000 cr to acquire. Categorized as Infrastructure Provider.

**Rationale:** Hybrid building providing both population capacity and income. Essential for empires experiencing population growth. Dual benefits create unique strategic value.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Population Capacity | +1,000 |
| Credit Production | +1,000 credits/turn |
| Base Cost | 8,000 cr |
| Category | Infrastructure Provider |
| Strategic Purpose | House growing population, bonus income |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('urban')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.urban = { popCap: 1000, credits: 1000 }`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.urban = 8000`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Urban sector dual effects validation

**Status:** Draft

---

### REQ-SEC-003-06: Education Sector Type

**Description:** Education sector provides +5 civil status/turn and costs 8,000 cr to acquire. Categorized as Intangible Booster.

**Rationale:** Increases empire happiness and stability. Essential for maintaining high morale during wars or resource scarcity. Intangible benefit creates strategic depth.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | +5 civil status/turn |
| Base Cost | 8,000 cr |
| Category | Intangible Booster |
| Strategic Purpose | Increase happiness, reduce unrest |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('education')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.education = 5`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.education = 8000`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Education sector civil status boost validation

**Status:** Draft

---

### REQ-SEC-003-07: Government Sector Type

**Description:** Government sector provides +300 agents/turn and costs 7,500 cr to acquire. Categorized as Infrastructure Provider.

**Rationale:** Enables covert operations system. Lower cost (7,500 cr) encourages intelligence-focused strategies. Essential for Schemer archetype and espionage gameplay.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | +300 agents/turn |
| Base Cost | 7,500 cr |
| Category | Infrastructure Provider |
| Strategic Purpose | Enable covert operations |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('government')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.government = 300`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.government = 7500`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Government sector agent generation validation

**Status:** Draft

---

### REQ-SEC-003-08: Research Sector Type

**Description:** Research sector provides +10 research points/turn and costs 23,000 cr to acquire (most expensive sector). Categorized as Intangible Booster.

**Rationale:** Accelerates tech tree progression. High cost (23,000 cr) creates meaningful trade-off between economic expansion and technological advancement. Strategic advantage justifies premium price.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Production | +10 research points/turn |
| Base Cost | 23,000 cr (most expensive) |
| Category | Intangible Booster |
| Strategic Purpose | Accelerate tech tree progression |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1 - Sector Types and Production

**Code:**
- `src/lib/db/schema.ts` - `sectorTypeEnum` enum ('research')
- `src/lib/sectors/sector-types.ts` - `SECTOR_PRODUCTION.research = 10`
- `src/lib/sectors/sector-types.ts` - `SECTOR_BASE_COSTS.research = 23000`

**Tests:**
- `src/lib/sectors/__tests__/sector-types.test.ts` - Research sector research point generation validation

**Status:** Draft

---

### REQ-SEC-004: Production Timing (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-SEC-004-A through REQ-SEC-004-C.

---

### REQ-SEC-004-A: Turn Boundary Production Timing

**Description:** All sectors produce resources at the Turn Boundary during server-side turn processing. Production is deterministic and server-side to prevent client-side manipulation.

**Rationale:** Deterministic turn processing ensures predictable economy. Server-side processing prevents client-side manipulation and ensures fair play.

**Source:** Section 3.3 - Production Timing

**Code:**
- `src/lib/game/turn-processing.ts` - `processTurnBoundary()` function
- `src/lib/sectors/production.ts` - `calculateSectorProduction(empire: Empire): Resources`

**Tests:**
- `src/lib/game/__tests__/turn-processing.test.ts` - "should produce resources from all sectors at turn boundary"

**Status:** Draft

---

### REQ-SEC-004-B: New Sector Production Delay

**Description:** Newly acquired sectors do not produce resources until the next turn boundary. 1 turn delay prevents same-turn exploitation (acquire sector + immediate benefit).

**Rationale:** Delaying new sector production by 1 turn prevents same-turn exploitation and creates strategic timing considerations for sector acquisition.

**Source:** Section 3.3 - Production Timing

**Code:**
- `src/lib/game/turn-processing.ts` - `processTurnBoundary()` function
- `src/lib/sectors/production.ts` - `calculateSectorProduction(empire: Empire): Resources`

**Tests:**
- `src/lib/game/__tests__/turn-processing.test.ts` - "newly acquired sectors should not produce on same turn"

**Status:** Draft

---

### REQ-SEC-004-C: Production Before Consumption Order

**Description:** Production is added to empire stockpile before consumption calculations during turn processing. Ensures current turn's production can satisfy current turn's consumption.

**Rationale:** Production-before-consumption ordering ensures predictable economy and allows current production to meet current needs.

**Source:** Section 3.3 - Production Timing

**Code:**
- `src/lib/game/turn-processing.ts` - `processTurnBoundary()` function

**Tests:**
- `src/lib/game/__tests__/turn-processing.test.ts` - "production should occur before consumption calculations"

**Status:** Draft

---

### REQ-SEC-005: Sector Acquisition Action

**Description:** Players can acquire a new sector by selecting a sector type and paying the scaled cost. Action validates sufficient credits and immediately adds sector to empire. Server action is atomic (all-or-nothing).

**Rationale:** Simple, immediate feedback loop. No multi-turn construction delays (sectors are abstract, not physical buildings). Atomic transaction prevents race conditions or partial states.

**Source:** Section 3.2 - Sector Acquisition Process

**Code:**
- `src/app/actions/sector-actions.ts` - `acquireSector(formData: FormData): Promise<ActionResult>`
- `src/lib/db/sectors.ts` - `createSector(empireId, sectorType): Promise<Sector>`

**Tests:**
- `src/app/actions/__tests__/sector-actions.test.ts` - "should deduct correct cost and create sector"
- `src/app/actions/__tests__/sector-actions.test.ts` - "should fail if insufficient credits"
- `src/app/actions/__tests__/sector-actions.test.ts` - "should be atomic (rollback on error)"

**Status:** Draft

---

### REQ-SEC-006: Resource Cap Handling (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-SEC-006-A through REQ-SEC-006-D.

---

### REQ-SEC-006-A: Food Resource Cap

**Description:** Food resource capped at 10,000 storage. Sector production can exceed cap, but excess is wasted (not stored). Cap enforced after production phase.

**Rationale:** Prevents infinite food accumulation creating game-breaking strategies. Forces players to balance production vs storage and encourages spending food rather than hoarding.

**Key Values:**

| Resource | Cap | Overflow Behavior |
|----------|-----|-------------------|
| Food | 10,000 | Excess wasted |

**Source:** Section 3.5 - Sector Limits and Caps

**Code:**
- `src/lib/game/constants.ts` - `RESOURCE_CAPS` constant
- `src/lib/resources/cap-handler.ts` - `applyResourceCaps(empire: Empire): void`

**Tests:**
- `src/lib/resources/__tests__/cap-handler.test.ts` - "should cap food at 10,000"
- `src/lib/resources/__tests__/cap-handler.test.ts` - "production exceeding cap should be lost"

**Status:** Draft

---

### REQ-SEC-006-B: Ore Resource Cap

**Description:** Ore resource capped at 5,000 storage. Sector production can exceed cap, but excess is wasted (not stored). Cap enforced after production phase.

**Rationale:** Prevents infinite ore accumulation creating game-breaking strategies. Forces players to balance production vs storage and encourages spending ore rather than hoarding.

**Key Values:**

| Resource | Cap | Overflow Behavior |
|----------|-----|-------------------|
| Ore | 5,000 | Excess wasted |

**Source:** Section 3.5 - Sector Limits and Caps

**Code:**
- `src/lib/game/constants.ts` - `RESOURCE_CAPS` constant
- `src/lib/resources/cap-handler.ts` - `applyResourceCaps(empire: Empire): void`

**Tests:**
- `src/lib/resources/__tests__/cap-handler.test.ts` - "should cap ore at 5,000"
- `src/lib/resources/__tests__/cap-handler.test.ts` - "production exceeding cap should be lost"

**Status:** Draft

---

### REQ-SEC-006-C: Petroleum Resource Cap

**Description:** Petroleum resource capped at 3,000 storage. Sector production can exceed cap, but excess is wasted (not stored). Cap enforced after production phase.

**Rationale:** Prevents infinite petroleum accumulation creating game-breaking strategies. Forces players to balance production vs storage and encourages spending petroleum rather than hoarding.

**Key Values:**

| Resource | Cap | Overflow Behavior |
|----------|-----|-------------------|
| Petroleum | 3,000 | Excess wasted |

**Source:** Section 3.5 - Sector Limits and Caps

**Code:**
- `src/lib/game/constants.ts` - `RESOURCE_CAPS` constant
- `src/lib/resources/cap-handler.ts` - `applyResourceCaps(empire: Empire): void`

**Tests:**
- `src/lib/resources/__tests__/cap-handler.test.ts` - "should cap petroleum at 3,000"
- `src/lib/resources/__tests__/cap-handler.test.ts` - "production exceeding cap should be lost"

**Status:** Draft

---

### REQ-SEC-006-D: Credits Unlimited Storage

**Description:** Credits have no storage cap. Empires can accumulate unlimited credits without overflow or waste.

**Rationale:** Credits unlimited to allow economic flexibility and prevent artificial constraints on economic strategies.

**Key Values:**

| Resource | Cap | Overflow Behavior |
|----------|-----|-------------------|
| Credits | None (unlimited) | N/A |

**Source:** Section 3.5 - Sector Limits and Caps

**Code:**
- `src/lib/game/constants.ts` - `RESOURCE_CAPS` constant
- `src/lib/resources/cap-handler.ts` - `applyResourceCaps(empire: Empire): void`

**Tests:**
- `src/lib/resources/__tests__/cap-handler.test.ts` - "should not cap credits"

**Status:** Draft

---

### REQ-SEC-007: No Maximum Sector Count

**Description:** There is no hard limit on the number of sectors an empire can own. Practical limits emerge from exponential cost scaling and economic balance.

**Rationale:** Design philosophy "consequence over limits". No artificial caps - let economic pressure provide natural saturation point. Allows extreme strategies (hyper-expansion if player can afford it).

**Source:** Section 3.5 - Sector Limits and Caps

**Code:**
- `src/lib/db/schema.ts` - `sectors` table (no constraint on count per empire)
- `src/app/actions/sector-actions.ts` - `acquireSector()` (no count validation)

**Tests:**
- `src/lib/game/__tests__/sector-limits.test.ts` - "empire should be able to acquire 50+ sectors"
- `src/lib/game/__tests__/sector-limits.test.ts` - "no error when exceeding typical sector counts"

**Status:** Draft

---

### REQ-SEC-008: Special Sector Stacking

**Description:** Multiple sectors of the same type stack additively. An empire with 3 Commerce sectors produces 3 × 8,000 = 24,000 credits/turn. An empire with 2 Education sectors gains +10 civil status/turn.

**Rationale:** Simple mental model - more sectors = more production. No diminishing returns per sector (cost scaling provides that). Enables specialization strategies (e.g., "Merchant with 7 Commerce sectors").

**Source:** Section 3.6 - Special Sector Interactions

**Code:**
- `src/lib/sectors/production.ts` - `calculateSectorProduction()` sums production by type

**Tests:**
- `src/lib/sectors/__tests__/production.test.ts` - "3 Commerce sectors should produce 24,000 credits"
- `src/lib/sectors/__tests__/production.test.ts` - "2 Education sectors should provide +10 civil status"

**Status:** Draft

---

### REQ-SEC-009: Sector Destruction in Combat (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-SEC-009-A through REQ-SEC-009-B.

---

### REQ-SEC-009-A: Sector Destruction Formula

**Description:** When an empire loses a combat encounter, they lose 1-3 sectors based on formula with base loss (1), random component (0-2), and overkill bonus (0-1 if attacker deals 2x+ required damage).

**Rationale:** Consequences for military defeat without eliminating empire entirely. Random component adds tension. Overkill bonus rewards decisive victories.

**Formula:**
```
sectors_lost = floor(1 + random(0, 2) + overkill_bonus)

Where:
  Base loss: 1 sector (guaranteed)
  Random: 0-2 additional sectors
  Overkill bonus: 0-1 (if attacker deals 2x+ required damage)

Examples:
- Narrow defeat: 1 + 0 + 0 = 1 sector lost
- Average defeat: 1 + 1 + 0 = 2 sectors lost
- Decisive defeat (overkill): 1 + 2 + 1 = 4 sectors lost (capped at 3)
```

**Key Values:**

| Component | Value | Notes |
|-----------|-------|-------|
| Base sector loss | 1 | Guaranteed minimum |
| Random additional | 0-2 | Adds uncertainty |
| Overkill bonus | 0-1 | Rewards decisive victories |

**Source:** Section 3.4 - Sector Destruction and Capture

**Code:**
- `src/lib/combat/aftermath.ts` - `applyCombatLosses(loser: Empire, overkill: number): void`

**Tests:**
- `src/lib/combat/__tests__/aftermath.test.ts` - "loser should lose 1-3 sectors"

**Status:** Draft

---

### REQ-SEC-009-B: Permanent Sector Removal

**Description:** Destroyed sectors are removed from game permanently (not transferred to victor). Sectors deleted from database, preventing snowballing from sector transfers.

**Rationale:** Sectors destroyed rather than transferred to prevent excessive snowballing. Limits economic growth from conquest alone.

**Source:** Section 3.4 - Sector Destruction and Capture

**Code:**
- `src/lib/db/sectors.ts` - `destroySectors(empireId, count): Promise<void>`

**Tests:**
- `src/lib/combat/__tests__/aftermath.test.ts` - "destroyed sectors should be removed from database"

**Status:** Draft

---

### REQ-SEC-010: Sector Capture on Conquest

**Description:** When an empire is completely conquered (reaches 0 networth or surrenders), victor may claim up to 50% of conquered empire's sectors. Sectors transferred randomly from conquered portfolio.

**Rationale:** Rewards conquest without creating unstoppable snowball. 50% cap ensures even total victory doesn't double empire size instantly. Randomness prevents "only take best sectors" optimization.

**Formula:**
```
sectors_transferred = floor(conquered_empire_sectors × 0.5)

Sectors selected randomly from conquered empire's portfolio.
```

**Source:** Section 3.4 - Sector Destruction and Capture

**Code:**
- `src/lib/conquest/sector-transfer.ts` - `transferSectors(victor, conquered): Promise<Sector[]>`

**Tests:**
- `src/lib/conquest/__tests__/sector-transfer.test.ts` - "should transfer at most 50% of sectors"
- `src/lib/conquest/__tests__/sector-transfer.test.ts` - "sectors should be randomly selected"

**Status:** Draft

---

### REQ-SEC-011: Research Sector Unlock

**Description:** Research sectors cannot be acquired until the empire has unlocked Research Tier 2 (Specialization tier in tech tree). Attempting to acquire before unlock shows "LOCKED: Need Research Tier 2" message.

**Rationale:** Research sectors are most powerful (accelerate tech tree). Gating behind tech progression prevents first-player-to-rush-research dominance. Forces strategic choice: expand economy OR unlock research first.

**Source:** Section 5.1 - UI Mockups (Research sector shown as locked)

**Code:**
- `src/app/actions/sector-actions.ts` - `acquireSector()` validates research tier
- `src/components/sectors/SectorAcquisitionModal.tsx` - Shows lock icon for Research

**Tests:**
- `src/app/actions/__tests__/sector-actions.test.ts` - "should reject Research sector acquisition if tier < 2"
- `src/app/actions/__tests__/sector-actions.test.ts` - "should allow Research sector if tier >= 2"

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-SEC-001 | Starting Sectors | Draft | TBD |
| REQ-SEC-002 | Sector Cost Scaling | Draft | TBD |
| REQ-SEC-003 | Eight Sector Types | Draft | TBD |
| REQ-SEC-004 | Production Timing | Draft | TBD |
| REQ-SEC-005 | Sector Acquisition Action | Draft | TBD |
| REQ-SEC-006 | Resource Cap Handling | Draft | TBD |
| REQ-SEC-007 | No Maximum Sector Count | Draft | TBD |
| REQ-SEC-008 | Special Sector Stacking | Draft | TBD |
| REQ-SEC-009 | Sector Destruction in Combat | Draft | TBD |
| REQ-SEC-010 | Sector Capture on Conquest | Draft | TBD |
| REQ-SEC-011 | Research Sector Unlock | Draft | TBD |

**Total Specifications:** 11
**Implemented:** 0
**Validated:** 0
**Draft:** 11

---

## 7. Implementation Requirements

### 7.1 Database Schema

Brief schema showing core structure:

```sql
-- Table: sectors
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  sector_type TEXT NOT NULL CHECK (sector_type IN (
    'commerce', 'food', 'ore', 'petroleum',
    'urban', 'education', 'government', 'research'
  )),
  acquired_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sectors_empire_id ON sectors(empire_id);
CREATE INDEX idx_sectors_empire_type ON sectors(empire_id, sector_type);
```

For complete schema including materialized views and migration scripts, see [Appendix: Database Schema](appendix/SECTOR-MANAGEMENT-SYSTEM-APPENDIX.md#database-schema).

### 7.2 Service Architecture

Brief example showing core methods:

```typescript
// src/lib/sectors/sector-service.ts

export class SectorService {
  /**
   * Calculate the cost to acquire a new sector
   * @spec REQ-SEC-002
   */
  calculateSectorCost(currentSectorCount: number): number {
    const baseCost = 8000;
    const scalingFactor = 1 + (currentSectorCount * 0.1);
    return Math.floor(baseCost * Math.pow(scalingFactor, 1.5));
  }

  /**
   * Calculate production for all sectors
   * @spec REQ-SEC-004, REQ-SEC-008
   */
  async calculateProduction(empireId: string): Promise<ResourceProduction> {
    // Sum production from all sectors by type
  }

  /**
   * Additional methods: acquireSector, destroySectors, transferSectors
   */
}
```

For complete `SectorService` implementation with all methods, see [Appendix: Service Architecture](appendix/SECTOR-MANAGEMENT-SYSTEM-APPENDIX.md#service-architecture).

### 7.3 Server Actions

Brief example showing sector acquisition action:

```typescript
// src/app/actions/sector-actions.ts

"use server";

/**
 * Acquire a new sector for the player's empire
 * @spec REQ-SEC-005
 */
export async function acquireSector(
  formData: FormData
): Promise<ActionResult> {
  // 1. Validate session
  // 2. Get sector type from formData
  // 3. Check research unlock (REQ-SEC-011)
  // 4. Calculate cost
  // 5. Validate funds
  // 6. Atomic transaction: deduct credits + create sector
  // 7. Revalidate paths
}
```

For complete server action implementation with validation and error handling, see [Appendix: Server Actions](appendix/SECTOR-MANAGEMENT-SYSTEM-APPENDIX.md#server-actions).

### 7.4 UI Components

Brief component structure:

```typescript
// src/components/sectors/SectorManagementPanel.tsx

export function SectorManagementPanel({ empire, sectors }: Props) {
  // Displays current sectors, production summary, and acquisition button
  return (
    <div className="sector-management-panel">
      <header>Sector Management [+ ACQUIRE]</header>
      <SectorSummary count={sectors.length} nextCost={nextCost} />
      <ProductionSummary production={productionData} />
      <SectorList sectors={sectors} />
      {showModal && <SectorAcquisitionModal />}
    </div>
  );
}

// src/components/sectors/SectorAcquisitionModal.tsx

export function SectorAcquisitionModal({ empire, cost, onClose }: Props) {
  // Grid of sector types, validates selection, calls acquireSector action
  return (
    <Modal>
      <SectorTypeGrid onSelect={setSelectedType} />
      <button onClick={handleAcquire}>Acquire Selected</button>
    </Modal>
  );
}
```

For complete UI component implementations with full styling and interaction handlers, see [Appendix: UI Components](appendix/SECTOR-MANAGEMENT-SYSTEM-APPENDIX.md#ui-components).

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| **First Expansion Turn** | Turn 10-12 | ±2 turns | Median turn when players acquire 6th sector |
| **Mid-Game Sectors** | 10-15 sectors | ±3 | Average sector count at turn 50 |
| **Late-Game Sectors** | 20-30 sectors | ±5 | Average sector count at turn 90 |
| **Economic Saturation** | 25 sectors | ±5 | Sector count where cost/benefit ratio = 1.0 |
| **Commerce Dominance** | 30-40% | ±5% | % of total sectors that are Commerce type |
| **Resource Sector Balance** | 15-20% each | ±5% | Food, Ore, Petroleum combined % |
| **Research Sector Rarity** | 1-3 per empire | ±1 | Average Research sectors per empire |

### 8.2 Economic Balance Validation

**Income vs Expansion Cost:**
```
Turn 10: 9,000 cr/turn income vs 14,696 cr expansion = 1.6 turns to afford
Turn 50: ~40,000 cr/turn income vs 31,623 cr expansion = 0.8 turns to afford
Turn 90: ~120,000 cr/turn income vs 64,000 cr expansion = 0.5 turns to afford

Target: Expansion should always require 0.5-2 turns of income
```

**Production Balance:**
```
Food production vs consumption:
- Starting: 160/turn production vs ~50/turn consumption (3.2x surplus)
- Mid-game (15 sectors, 3 Food): 480/turn vs ~150/turn (3.2x surplus)
Target: Maintain 3x food surplus to allow flexibility

Ore production vs military needs:
- 1 Ore sector (112/turn) supports ~11 military power units
- 3 Ore sectors (336/turn) supports ~33 military power units
Target: 2-3 Ore sectors sufficient for moderate military strategy
```

### 8.3 Simulation Requirements

**Monte Carlo: 10,000 iterations**

**Variables:**
- Bot archetype distribution (equal probability all 8 types)
- Random sector acquisition order
- Combat outcomes (winner/loser, sectors destroyed)

**Success Criteria:**
1. **Economic Saturation:** 90% of empires have 15-30 sectors by turn 100
2. **No Runaway Growth:** No empire exceeds 50 sectors by turn 100
3. **Viable Specialization:** All 8 archetypes achieve 40%+ win rate
4. **Resource Balance:** No empire starves (food < 0) unless militarily defeated

**Failure Modes to Test:**
- Pure Commerce spam (7+ Commerce sectors) → Should be viable but not dominant
- Pure Military (minimal Commerce) → Should struggle economically but win through conquest
- Research rush (2 Research sectors early) → Should reach tech victory ~turn 70-80

### 8.4 Playtest Checklist

- [ ] **Scenario 1: Warlord Expansion** - Bot acquires 3 Ore + 2 Petroleum sectors by turn 40
- [ ] **Scenario 2: Merchant Economy** - Bot reaches 7 Commerce sectors, generates 60k+ credits/turn
- [ ] **Scenario 3: Research Rush** - Bot unlocks Research Tier 2 by turn 25, acquires 1st Research sector by turn 30
- [ ] **Scenario 4: Balanced Growth** - Player reaches 12 sectors (mixed portfolio) by turn 50 without struggle
- [ ] **Scenario 5: Late-Game Sprawl** - Player with 28 sectors (turn 85) still finds expansion meaningful
- [ ] **Scenario 6: Combat Loss** - Empire loses 2 sectors in combat, recovers within 10 turns
- [ ] **Scenario 7: Conquest Transfer** - Victor conquers 16-sector empire, receives 8 sectors (50%)
- [ ] **Scenario 8: Resource Cap Hit** - Empire with 5 Food sectors (800/turn) hits 10k cap, excess wasted
- [ ] **Scenario 9: Government Investment** - Empire acquires 2 Government sectors to enable aggressive covert ops
- [ ] **Scenario 10: Education Happiness** - Empire with 3 Education sectors (+15 civil/turn) maintains high stability

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| No implementation | Database schema | 1. Create `sectors` table<br>2. Create `sector_production_summary` materialized view<br>3. Add indexes |
| No sector logic | Service layer | 1. Implement `SectorService` class<br>2. Implement cost calculation formula<br>3. Implement production calculation |
| No UI | Frontend components | 1. Create `SectorManagementPanel`<br>2. Create `SectorAcquisitionModal`<br>3. Create `SectorList` and `SectorCard` |
| Draft specs only | Validated specs | 1. Implement all 11 specs<br>2. Write tests for each spec<br>3. Validate all tests pass |

### 9.2 Data Migration

**Initial Game Setup:**

```sql
-- Migration: Initialize starting sectors for all empires
-- Safe to run: Yes (idempotent with empire_id check)

INSERT INTO sectors (empire_id, sector_type, acquired_turn)
SELECT
  e.id as empire_id,
  sector_type,
  0 as acquired_turn
FROM empires e
CROSS JOIN (
  VALUES
    ('food'),
    ('ore'),
    ('petroleum'),
    ('commerce'),
    ('urban')
) AS starting_sectors(sector_type)
WHERE NOT EXISTS (
  SELECT 1 FROM sectors s WHERE s.empire_id = e.id
);

-- Verify: Each empire should have exactly 5 sectors
SELECT empire_id, COUNT(*) as sector_count
FROM sectors
GROUP BY empire_id
HAVING COUNT(*) != 5;
-- Should return 0 rows
```

### 9.3 Rollback Plan

If sector system causes critical issues:

1. **Database Rollback:**
   ```sql
   -- Remove all sectors
   DELETE FROM sectors;

   -- Drop materialized view
   DROP MATERIALIZED VIEW IF EXISTS sector_production_summary;

   -- Drop table
   DROP TABLE IF EXISTS sectors CASCADE;
   ```

2. **Temporary Workaround:**
   - Implement fixed production per empire (bypass sector system)
   - All empires produce: 9,000 cr/turn, 160 food/turn, 112 ore/turn, 92 petro/turn
   - Disable sector acquisition UI (show "Coming Soon" message)

3. **Graceful Degradation:**
   - If production calculation fails, use cached values from last successful calculation
   - If acquisition fails, show error but don't block other game actions
   - Log all failures for post-mortem analysis

---

## 10. Conclusion

### Key Decisions

1. **8 Sector Types with Distinct Purposes:**
   - Resource producers (Food, Ore, Petro, Commerce) form economic foundation
   - Infrastructure (Urban, Government) enable population and covert ops
   - Boosters (Education, Research) provide strategic advantages
   - **Rationale:** Variety without overwhelming choice, each type has clear use case

2. **Exponential Cost Scaling (Exponent 1.5):**
   - Formula: `Cost = 8000 × (1 + count × 0.1)^1.5`
   - First expansion: ~14,700 cr (affordable turn 10-12)
   - Saturation: ~25-30 sectors for most empires
   - **Rationale:** Prevents runaway expansion while allowing strategic growth

3. **Starting Configuration of 5 Balanced Sectors:**
   - 1 each: Food, Ore, Petroleum, Commerce, Urban
   - Ensures every empire can sustain population, build military, afford expansion
   - **Rationale:** Level playing field, no starting advantage/disadvantage

4. **Deterministic Production (No Randomness):**
   - Sectors produce fixed amounts each turn
   - Production occurs at turn boundary (server-side)
   - **Rationale:** Predictable economy enables strategic planning

5. **No Hard Sector Cap:**
   - Economic pressure (cost scaling) provides natural limit
   - Allows extreme strategies if player can afford it
   - **Rationale:** Design philosophy "consequence over limits"

### Open Questions

1. **Sector Type Conversion:**
   - Can players convert sector types (e.g., Food → Commerce)?
   - If yes, what's the cost? Same as acquisition or cheaper?
   - **Options:** (A) No conversion allowed, (B) Conversion costs 50% of new sector cost, (C) Conversion via Research unlock
   - **Recommendation:** Defer to expansion content - keeps base game simpler

2. **Sector Damage/Repair:**
   - Can sectors be damaged (not destroyed) reducing production?
   - If yes, how do they repair (automatic or player action)?
   - **Options:** (A) No damage system, (B) Covert ops can damage sectors (50% production), (C) Combat can damage sectors
   - **Recommendation:** Implement in covert ops system (REQ-COV-XXX) to avoid overloading base sector system

3. **Minimum Sector Guarantee:**
   - Can an empire be reduced to 0 sectors?
   - If no, what's the minimum (1 sector? Starting 5 sectors?)?
   - **Options:** (A) No minimum (0 sectors = game over), (B) Minimum 1 sector, (C) Minimum 3 sectors
   - **Recommendation:** Minimum 1 sector (prevents elimination by sector loss, must be conquered via other means)

4. **Sector Transfer Selectivity:**
   - When conquering, can victor choose which sectors to take?
   - Or always random 50% transfer?
   - **Options:** (A) Random transfer (prevents optimization), (B) Victor chooses (rewards conquest), (C) Highest-value sectors automatically transfer
   - **Recommendation:** Random transfer to prevent "only take Research/Government" exploit

### Dependencies

**Depends On:**
- **RESOURCE-MANAGEMENT-SYSTEM.md** - Resource caps, consumption rates, storage mechanics
- **[PRD-EXECUTIVE.md](../PRD-EXECUTIVE.md)** - System overview, victory conditions
- **[TURN-PROCESSING-SYSTEM.md](TURN-PROCESSING-SYSTEM.md)** - Turn processing details
- None (blocking) - Sector system can be implemented independently

**Depended By:**
- **MILITARY-SYSTEM.md** - Ore/Petroleum consumption, sector destruction in combat
- **COVERT-OPS-SYSTEM.md** - Government sectors providing agent capacity
- **RESEARCH-SYSTEM.md** - Research sectors providing research points, Research Tier 2 unlock
- **BOT-SYSTEM.md** - Archetype-specific sector acquisition strategies
- **VICTORY-SYSTEMS.md** - Territory control (sector count) for Conquest victory

---

**Document Status:** Complete, ready for review and implementation

**Next Steps:**
1. Review with game design team for balance validation
2. Resolve open questions (sector conversion, damage, minimum guarantee, transfer selectivity)
3. Implement database schema and service layer
4. Write tests for all 11 specifications
5. Build UI components (Sector Management Panel, Acquisition Modal)
6. Integrate with turn processing system
7. Playtest balance targets (Section 8.4 checklist)
8. Update PRD-EXECUTIVE.md with sector system reference
