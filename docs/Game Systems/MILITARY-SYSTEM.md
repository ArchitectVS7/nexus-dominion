# Military System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-MIL
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/MILITARY-SYSTEM.md

---

## Document Purpose

This document provides the complete specification for Nexus Dominion's military units and production system. All unit types, build mechanics, resource costs, maintenance requirements, and fleet composition rules are defined here.

This document is intended for:
- **Game designers** defining unit balance and military gameplay
- **Developers** implementing the unit production and fleet management systems
- **QA** validating military mechanics against specifications

**Design Philosophy:**
- **Strategic variety** - Six unit types create diverse fleet compositions
- **Resource management** - Units cost credits, ore, and petroleum to build and maintain
- **Production planning** - Build queues require multi-turn investment
- **Card-based clarity** - All unit stats visible on D20-style unit cards
- **Balanced power curves** - Power multipliers create meaningful unit tiers

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

### 1.1 Unit Card System

Nexus Dominion uses a **card-based unit system** inspired by tabletop games and deck-building mechanics. Every military unit is represented as a card with standardized D20 stats (STR, DEX, CON), derived combat values, and resource costs.

**Core Loop:**
1. Accumulate resources (credits, ore, petroleum, food)
2. Queue units for production in build queue
3. Wait N turns for completion (1-5 turns depending on unit type)
4. Deploy completed units to domains (SPACE, ORBITAL, GROUND)
5. Pay per-turn maintenance costs
6. Use units in combat or defense

### 1.2 Six Unit Types

The military system provides **six distinct unit types** across three combat domains:

| Unit | Domain | Role | Power | Cost Tier |
|------|--------|------|-------|-----------|
| **Soldiers** | GROUND | Infantry, occupation | 0.1× | Cheapest |
| **Fighters** | SPACE | Interception, air superiority | 1.0× | Low |
| **Stations** | ORBITAL | Defense platforms | 3.0× (6× defending) | Medium |
| **Light Cruisers** | SPACE | Versatile warships | 4.0× | Medium-High |
| **Heavy Cruisers** | SPACE | Heavy firepower | 8.0× | High |
| **Carriers** | SPACE | Fleet support, logistics | 12.0× | Highest |

**Design Rationale:** Unit variety creates strategic depth. Players must balance cost efficiency (Soldiers, Fighters) with raw power (Cruisers, Carriers) and defensive strength (Stations).

### 1.3 Player Experience

Building a military in Nexus Dominion feels like **managing a multi-turn production pipeline**. You queue units based on strategic needs, watch progress bars fill over multiple turns, and balance immediate defense needs against long-term fleet composition goals.

**Example Scenario:**
> Turn 30: Enemy Warlord threatens invasion. You need 20 fighters (5 turns build time) but can only afford 15 due to ore shortage. Do you:
> - **Rush fighters** - Sacrifice economy, buy ore at market premium
> - **Build stations** - Faster defensive option (3 turns), but 2× cost
> - **Diplomatic solution** - Propose NAP, buy time to build

---

## 2. Mechanics Overview

### 2.1 The Six Unit Types

#### Soldiers (GROUND Domain)
- **Role:** Ground troops, sector occupation
- **Power Multiplier:** 0.1× (weakest, but essential)
- **Cost:** 100 credits + 50 food each
- **Production Time:** 1 turn
- **Maintenance:** 2 credits/turn
- **Special:** Required to capture sectors in Full Invasions

#### Fighters (SPACE Domain)
- **Role:** Basic space combat, intercept bombers
- **Power Multiplier:** 1.0× (baseline)
- **Cost:** 500 credits + 100 ore each
- **Production Time:** 2 turns
- **Maintenance:** 5 credits + 2 ore/turn
- **Strong vs:** Bombers, Interceptors
- **Weak vs:** Cruisers

#### Bombers (ORBITAL Domain)
- **Role:** Strike capital ships and stations
- **Power Multiplier:** 2.0×
- **Cost:** 800 credits + 150 ore each
- **Production Time:** 2 turns
- **Maintenance:** 8 credits + 3 ore/turn
- **Strong vs:** Cruisers, Stations
- **Weak vs:** Fighters

#### Stations (ORBITAL Domain)
- **Role:** Defensive installations, sector control
- **Power Multiplier:** 3.0× (6.0× when defending)
- **Cost:** 3,000 credits + 500 ore + 200 petroleum
- **Production Time:** 3 turns
- **Maintenance:** 15 credits + 10 ore/turn
- **Special:** 2× power when defending home sectors

#### Light Cruisers (SPACE Domain)
- **Role:** Versatile warships, fleet backbone
- **Power Multiplier:** 4.0×
- **Cost:** 5,000 credits + 800 ore + 300 petroleum
- **Production Time:** 4 turns
- **Maintenance:** 25 credits + 15 ore + 5 petroleum/turn
- **Strong vs:** Fighters, Carriers
- **Weak vs:** Heavy Cruisers

#### Heavy Cruisers (SPACE Domain)
- **Role:** Heavy firepower, capital ship
- **Power Multiplier:** 8.0×
- **Cost:** 15,000 credits + 2,000 ore + 800 petroleum
- **Production Time:** 5 turns
- **Maintenance:** 50 credits + 30 ore + 15 petroleum/turn
- **Strong vs:** Light Cruisers, Stations
- **Weak vs:** Bombers

#### Carriers (SPACE Domain)
- **Role:** Fleet support, logistics hub
- **Power Multiplier:** 12.0×
- **Cost:** 30,000 credits + 4,000 ore + 1,500 petroleum
- **Production Time:** 5 turns
- **Maintenance:** 100 credits + 50 ore + 30 petroleum/turn
- **Special:** No combat strengths/weaknesses (support role)

### 2.2 Resource Requirements

| Resource | Unit Production | Maintenance | Scarcity |
|----------|----------------|-------------|----------|
| **Credits** | All units | All units | Common (trade, commerce sectors) |
| **Food** | Soldiers only | None | Common (food sectors) |
| **Ore** | All except Soldiers | Fighters, Bombers, Cruisers, Carriers | Medium (ore sectors) |
| **Petroleum** | Stations, Cruisers, Carriers | Cruisers, Carriers | Rare (petroleum sectors, creates pollution) |

**Economic Balance:** Larger units require rarer resources (petroleum), creating natural scarcity and forcing strategic choices.

### 2.3 Build Queue System

Units are constructed via a **per-turn production queue**:

1. Player selects unit type and quantity
2. Resources deducted immediately (upfront cost)
3. Unit enters build queue with N-turn completion time
4. Each turn, build progress increments by 1
5. On completion turn, unit added to empire's military roster
6. Maintenance costs begin immediately upon completion

**Simultaneous Builds:** Players can queue multiple units simultaneously. Each completes independently based on its production time.

**Queue Limit:** No hard limit on queue size, but resource constraints naturally limit production.

### 2.4 Power Multipliers and Combat

Power multipliers determine combat effectiveness:

```
Military Power = Σ (Unit Count × Unit Power Multiplier × Situational Bonuses)

Example Fleet:
20 Fighters (1.0×)    = 20 power
10 Bombers (2.0×)     = 20 power
5 Stations (3.0×)     = 15 power (30 if defending)
2 Light Cruisers (4.0×) = 8 power
Total Power = 63 (78 if defending)
```

**Composition Bonuses:** Fleets with 4+ distinct unit types receive +15% power (see COMBAT-SYSTEM.md REQ-COMBAT-005).

### 2.5 Maintenance Drain

Every completed unit costs resources **per turn** to maintain:

```
Maintenance Drain per Turn = Σ (Unit Maintenance Cost)

Example Fleet Maintenance:
20 Fighters: 20 × (5 credits + 2 ore) = 100 credits + 40 ore/turn
10 Bombers: 10 × (8 credits + 3 ore) = 80 credits + 30 ore/turn
Total: 180 credits + 70 ore/turn
```

**Economic Impact:** Large fleets create significant maintenance burden. Players must balance military strength with economic sustainability.

---

## 3. Detailed Rules

### 3.1 Unit Production Rules

**Production Start:**
1. Player initiates build via build queue UI
2. System validates sufficient resources
3. Resources immediately deducted from empire reserves
4. Unit added to build queue with completion turn = current turn + production time

**Production Completion:**
- On completion turn, unit automatically added to empire's military roster
- Maintenance costs begin immediately
- Unit can be deployed same turn (assign to domain in combat)

**Cancellation:**
- Players can cancel queued units before completion
- Refund: 50% of original cost
- No refund if < 1 turn remaining

**Partial Completion:**
- If empire is eliminated mid-production, all queued units lost
- No partial credit or refunds

### 3.2 Unit Costs and Balance Ratios

**Cost-to-Power Ratio:**
The system maintains balanced cost efficiency across tiers:

| Unit | Total Cost | Power | Credits per Power | Efficiency |
|------|------------|-------|-------------------|------------|
| Soldiers | 150 | 0.1 | 1,500 | Poor (necessary role) |
| Fighters | 600 | 1.0 | 600 | Excellent |
| Bombers | 950 | 2.0 | 475 | Excellent |
| Stations | 3,700 | 3.0 (6.0 def) | 1,233 (617 def) | Good (defensive) |
| Light Cruisers | 6,100 | 4.0 | 1,525 | Fair |
| Heavy Cruisers | 17,800 | 8.0 | 2,225 | Fair |
| Carriers | 35,500 | 12.0 | 2,958 | Poor (support role) |

**Design Intent:** Fighters and Bombers are most cost-efficient, encouraging balanced fleets. Cruisers and Carriers provide raw power but at premium cost.

### 3.3 Fleet Composition Strategies

**Cost-Efficient Fleet (Early Game):**
- 50 Fighters + 20 Bombers = 90 power
- Total Cost: 50 × 600 + 20 × 950 = 49,000 credits
- Maintenance: 410 credits + 260 ore/turn

**Defensive Fleet (Mid Game):**
- 10 Stations + 15 Fighters + 5 Bombers = 55 power (100 when defending)
- Total Cost: 10 × 3,700 + 15 × 600 + 5 × 950 = 50,750 credits
- Maintenance: 325 credits + 165 ore + 20 petroleum/turn

**Heavy Fleet (Late Game):**
- 5 Heavy Cruisers + 2 Carriers + 10 Light Cruisers = 104 power
- Total Cost: 5 × 17,800 + 2 × 35,500 + 10 × 6,100 = 221,000 credits
- Maintenance: 1,200 credits + 750 ore + 285 petroleum/turn

**Balanced Fleet (Composition Bonus):**
- 10 Fighters + 5 Bombers + 2 Stations + 2 Light Cruisers + 1 Heavy Cruiser = 40 power × 1.15 = 46 power
- 4+ unit types = +15% bonus
- Encourages strategic diversity

### 3.4 Maintenance Bankruptcy

If empire cannot afford maintenance costs:

**Phase 1: Warning (Turn N)**
- System alerts player: "Insufficient resources for maintenance"
- Grace period: 1 turn to acquire resources

**Phase 2: Unit Attrition (Turn N+1)**
- If still unable to pay: 10% of military lost per turn
- Units destroyed in reverse power order (Carriers first, Soldiers last)
- Continues until maintenance affordable or military depleted

**Rationale:** Prevents runaway military growth. Players must balance expansion with sustainability.

### 3.5 Unit Limits and Caps

**No Hard Caps:** System has no arbitrary unit limits.

**Natural Limits:**
- **Resource scarcity** - Petroleum limits cruiser/carrier production
- **Maintenance drain** - Large fleets consume income
- **Production time** - 5-turn builds limit rapid mobilization
- **Population cap** - Limits total unit slots (see GAME-DESIGN.md)

**Design Philosophy:** "Consequence over limits" - players can build as many units as they can afford and maintain.

### 3.6 Domain Assignment

Units must be assigned to combat domains for battles:

**Domain Rules:**
- Soldiers: GROUND only
- Fighters: SPACE or ORBITAL (flexible)
- Bombers: ORBITAL only
- Stations: ORBITAL only
- Light Cruisers: SPACE only
- Heavy Cruisers: SPACE only
- Carriers: SPACE only

**Reassignment:** Free action, can reassign before each battle.

**Unassigned Units:** Count toward total military power but don't participate in combat.

### 3.7 Rarity Tiers and Advanced Units

Units have three rarity tiers (see COMBAT-SYSTEM.md REQ-COMBAT-011):

**Tier I (Standard-Issue):** Available Turn 1
- All units listed above are Tier I
- Stats: 8-12 range

**Tier II (Prototype):** Unlocked via research (~Turn 30)
- Draft system: Draw 2, keep 1 every 10 turns
- Stats: 12-16 range
- Cost: 2× Tier I equivalent
- Example: "Advanced Fighter" with STR 14, DEX 14, CON 12

**Tier III (Singularity-Class):** Ultra-rare draft Turn 50+
- Only 1 per game per player
- Stats: 16-20 range
- Cost: 5× Tier I equivalent
- Example: "Dreadnought" with STR 20, DEX 12, CON 18

**Migration Note:** Tier II/III units are expansion content. Core game (v1.0) uses Tier I only.

---

## 4. Bot Integration

### 4.1 Archetype Build Priorities

| Archetype | Unit Priority | Build Strategy | Fleet Composition |
|-----------|---------------|----------------|-------------------|
| **Warlord** | Heavy Cruisers > Bombers > Fighters | Aggressive, high-power fleet | 30% Heavy Cruisers, 40% Fighters, 30% Bombers |
| **Turtle** | Stations > Light Cruisers > Fighters | Defensive fortification | 50% Stations, 30% Fighters, 20% Light Cruisers |
| **Blitzkrieg** | Fighters > Bombers > Soldiers | Fast early rush | 60% Fighters, 30% Bombers, 10% Soldiers |
| **Tech Rush** | Light Cruisers > Stations | Balanced, tech-enhanced | 40% Light Cruisers, 30% Stations, 30% Fighters |
| **Opportunist** | Fighters > Light Cruisers | Cost-efficient flexibility | 50% Fighters, 30% Light Cruisers, 20% mix |
| **Diplomat** | Fighters > Stations | Defensive, alliance support | 40% Fighters, 40% Stations, 20% Light Cruisers |
| **Merchant** | Fighters > Light Cruisers | Economic focus, minimal military | 60% Fighters, 30% Light Cruisers, 10% Stations |
| **Schemer** | Bombers > Fighters | Covert + military hybrid | 40% Bombers, 40% Fighters, 20% Light Cruisers |

### 4.2 Bot Production Decision Logic

**Build Timing:**
```
CALCULATE threat_level = (neighbor_military_power / bot_military_power)
CALCULATE resource_surplus = (income_per_turn - expenses_per_turn)

IF threat_level > 1.5 AND resource_surplus > 1000:
    PRIORITIZE military builds (fighters/stations)
ELSE IF threat_level < 0.5 AND expansion_available:
    PRIORITIZE economy (reduce military builds)
ELSE IF archetype == "Warlord":
    ALWAYS build 2-3 units per turn (aggressive)
ELSE IF archetype == "Turtle":
    BUILD stations until defensive_threshold met
ELSE IF archetype == "Merchant":
    BUILD minimal military (10-15% of networth)
```

**Unit Selection:**
```
IF military_power < target_power:
    IF credits_available > 15000 AND petroleum_available > 800:
        BUILD Heavy Cruiser (high power, long-term investment)
    ELSE IF ore_available > 500:
        BUILD Fighters × 5 (cost-efficient swarm)
    ELSE:
        BUILD Soldiers × 20 (emergency defense)
```

**Maintenance Awareness:**
```
projected_maintenance = current_maintenance + new_unit_maintenance
IF projected_maintenance > income_per_turn × 0.4:
    STOP building (maintenance too high)
    SELL excess resources OR expand economy first
```

### 4.3 Bot Military Messages

**Warlord (Military Buildup):**
- "My fleets grow stronger every turn, {player_name}. Prepare your defenses."
- "20 new Heavy Cruisers delivered this turn. Your sectors look tempting."

**Turtle (Defensive Posture):**
- "Another station completed. My borders are impenetrable."
- "Build all the fleets you want. My stations will hold."

**Blitzkrieg (Early Rush):**
- "60 fighters ready. Time to strike before they fortify."
- "Fast and brutal. That's how I fight."

**Merchant (Minimal Military):**
- "Why waste credits on military when trade is more profitable?"
- "10 fighters? Enough for pirates. You? That's what alliances are for."

**Schemer (Covert + Military):**
- "My fleet may look small, but you haven't seen my covert operatives."
- "Who needs heavy cruisers when sabotage does the job?"

---

## 5. UI/UX Design

### 5.1 Build Queue Interface

```
┌─────────────────────────────────────────────────────────┐
│  BUILD QUEUE                            [X Close]       │
├─────────────────────────────────────────────────────────┤
│  Resources Available:                                   │
│  Credits: 50,000  Ore: 8,000  Petroleum: 2,500  Food: 10K│
│  Maintenance Cost: 450 credits/turn                     │
├─────────────────────────────────────────────────────────┤
│  UNIT SELECTION                                         │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ Soldiers │ Fighters │ Bombers  │ Stations │         │
│  │ 100cr+50f│ 500cr+100│ 800cr+150│ 3,000cr+ │         │
│  │ 1 turn   │ 2 turns  │ 2 turns  │ 3 turns  │         │
│  │ [BUILD]  │ [BUILD]  │ [BUILD]  │ [BUILD]  │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│  ┌──────────┬──────────┬──────────┐                    │
│  │ Light Cr.│ Heavy Cr.│ Carriers │                    │
│  │ 5,000cr+ │ 15,000cr+│ 30,000cr+│                    │
│  │ 4 turns  │ 5 turns  │ 5 turns  │                    │
│  │ [BUILD]  │ [BUILD]  │ [BUILD]  │                    │
│  └──────────┴──────────┴──────────┘                    │
├─────────────────────────────────────────────────────────┤
│  ACTIVE BUILDS (3)                                      │
│  ┌────────────────────────────────────────────────────┐│
│  │ ⚙ 10× Fighters     [███████░░░] 7/10 turns   [X]  ││
│  │ ⚙ 2× Heavy Cruiser [███░░░░░░░] 3/10 turns   [X]  ││
│  │ ⚙ 5× Stations      [█████░░░░░] 5/10 turns   [X]  ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  Completion This Turn: 1× Fighters (Turn 47)           │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Fleet Composition Panel

```
┌─────────────────────────────────────────────────────────┐
│  FLEET OVERVIEW                         [Assign Domains]│
├─────────────────────────────────────────────────────────┤
│  Total Military Power: 156 (Rank: #5 of 100 empires)   │
│  Maintenance: 850 credits + 420 ore + 150 petro/turn   │
├─────────────────────────────────────────────────────────┤
│  UNIT ROSTER                                            │
│  ┌─────────────────┬───────┬──────┬──────────────────┐ │
│  │ Unit Type       │ Count │ Power│ Domain           │ │
│  ├─────────────────┼───────┼──────┼──────────────────┤ │
│  │ Soldiers        │   100 │  10  │ GROUND           │ │
│  │ Fighters        │    40 │  40  │ SPACE            │ │
│  │ Bombers         │    15 │  30  │ ORBITAL          │ │
│  │ Stations        │     8 │  24  │ ORBITAL (48 def) │ │
│  │ Light Cruisers  │     5 │  20  │ SPACE            │ │
│  │ Heavy Cruisers  │     2 │  16  │ SPACE            │ │
│  │ Carriers        │     1 │  12  │ SPACE            │ │
│  └─────────────────┴───────┴──────┴──────────────────┘ │
│                                                         │
│  Composition Bonus: ✓ 4+ unit types (+15% power)       │
│  Fleet Status: Balanced (recommended)                   │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Unit Card Display

When viewing individual units:

```
┌─────────────────────────────────────┐
│ [⚔] HEAVY CRUISER     [TIER I]      │
├─────────────────────────────────────┤
│ STATS                               │
│  STR: 16 (+3)  DEX: 12 (+1)        │
│  CON: 14 (+2)                       │
│                                     │
│ COMBAT                              │
│  HP: 40  AC: 15  Init: +1          │
│  Attack: +5 (BAB +4, DEX +1)       │
│  Damage: 2d8+3                      │
│                                     │
│ SPECIAL                             │
│  Broadside: Attack 2 targets/round │
├─────────────────────────────────────┤
│ COST                                │
│  Build: 15,000cr + 2,000ore + 800p │
│  Maintenance: 50cr + 30ore + 15p   │
│  Production: 5 turns                │
│                                     │
│ DOMAIN: SPACE  |  Power: 8.0×      │
└─────────────────────────────────────┘
```

### 5.4 Visual Design Principles

**Color Coding:**
- Green: Sufficient resources to build
- Yellow: Partial resources available
- Red: Insufficient resources
- Blue: Unit in production (progress bar)
- Purple: Completed, ready for deployment

**Icons:**
- ⚔ Soldiers (infantry icon)
- ✈ Fighters (fighter jet icon)
- 💣 Bombers (bomb icon)
- 🛡 Stations (shield icon)
- 🚢 Light Cruisers (small ship icon)
- 🚀 Heavy Cruisers (large ship icon)
- 🛸 Carriers (carrier icon)

**Progress Bars:**
- Animated fill from left to right
- Displays "N/M turns" text overlay
- Completion flash animation

---

## 6. Specifications

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |

---

### REQ-MIL-001: Six Unit Types

**Description:** 6 military unit types exist:
1. **Soldiers** - Ground troops (0.1× power)
2. **Fighters** - Basic space combat (1.0× power)
3. **Bombers** - Strike craft (2.0× power)
4. **Stations** - Defensive installations (3.0× power, 6.0× when defending)
5. **Light Cruisers** - Versatile warships (4.0× power)
6. **Heavy Cruisers** - Heavy firepower (8.0× power)
7. **Carriers** - Fleet support (12.0× power)

**Rationale:** Unit variety creates strategic depth. Six types provide enough diversity for meaningful fleet composition choices without overwhelming complexity.

**Source:** Section 2.1, COMBAT-SYSTEM.md Section 2.3

**Code:**
- `src/lib/db/schema.ts` - unitTypeEnum definition
- `src/lib/units/unit-config.ts` - Unit type configurations

**Tests:**
- `src/lib/units/__tests__/unit-config.test.ts` - Unit type validation

**Status:** Draft

---

### REQ-MIL-002: Build Queue System

**Description:** Units are constructed via a build queue with per-turn completion:
- Resources deducted upfront when queuing
- Each unit has production time: 1-5 turns
- Multiple units can be built simultaneously
- Units complete independently based on production time
- Cancellation before completion refunds 50% of cost

**Rationale:** Prevents instant army creation, requires planning. Multi-turn builds create strategic investment decisions.

**Source:** Section 2.3, Section 3.1

**Code:**
- `src/lib/game/services/build-queue-service.ts` - Queue management
- `src/app/actions/build-actions.ts` - Build unit actions

**Tests:**
- `src/lib/game/services/__tests__/build-queue-service.test.ts` - Queue operations

**Status:** Draft

---

### REQ-MIL-003: Resource Costs

**Description:** Units require resources to build:

| Unit | Credits | Ore | Petroleum | Food |
|------|---------|-----|-----------|------|
| Soldiers | 100 | 0 | 0 | 50 |
| Fighters | 500 | 100 | 0 | 0 |
| Bombers | 800 | 150 | 0 | 0 |
| Stations | 3,000 | 500 | 200 | 0 |
| Light Cruisers | 5,000 | 800 | 300 | 0 |
| Heavy Cruisers | 15,000 | 2,000 | 800 | 0 |
| Carriers | 30,000 | 4,000 | 1,500 | 0 |

**Rationale:** Resource scarcity (especially petroleum) limits production of high-tier units. Forces economic strategy alongside military planning.

**Source:** Section 2.1, Section 3.2

**Code:**
- `src/lib/units/unit-costs.ts` - Cost definitions
- `src/lib/game/services/build-queue-service.ts` - Cost validation

**Tests:**
- `src/lib/units/__tests__/unit-costs.test.ts` - Cost calculations

**Status:** Draft

---

### REQ-MIL-004: Maintenance Costs

**Description:** Completed units cost resources per turn to maintain:

| Unit | Credits/turn | Ore/turn | Petroleum/turn |
|------|--------------|----------|----------------|
| Soldiers | 2 | 0 | 0 |
| Fighters | 5 | 2 | 0 |
| Bombers | 8 | 3 | 0 |
| Stations | 15 | 10 | 0 |
| Light Cruisers | 25 | 15 | 5 |
| Heavy Cruisers | 50 | 30 | 15 |
| Carriers | 100 | 50 | 30 |

If empire cannot afford maintenance for 2+ consecutive turns:
- 10% of military lost per turn
- Units destroyed in reverse power order (Carriers first)

**Rationale:** Prevents runaway military growth. Large fleets must be economically sustainable.

**Source:** Section 2.5, Section 3.4

**Code:**
- `src/lib/game/turn-processing/maintenance-phase.ts` - Maintenance calculation
- `src/lib/units/unit-costs.ts` - Maintenance cost definitions

**Tests:**
- `src/lib/game/turn-processing/__tests__/maintenance.test.ts` - Attrition logic

**Status:** Draft

---

### REQ-MIL-005: Production Time

**Description:** Unit production times:
- Soldiers: 1 turn
- Fighters, Bombers: 2 turns
- Stations: 3 turns
- Light Cruisers: 4 turns
- Heavy Cruisers, Carriers: 5 turns

Production progress increments by 1 each turn. Units complete on turn = (start_turn + production_time).

**Rationale:** Longer production times for powerful units create strategic planning. Cannot rapidly mobilize heavy fleets.

**Source:** Section 2.1, Section 3.1

**Code:**
- `src/lib/units/unit-config.ts` - Production time values
- `src/lib/game/turn-processing/build-completion.ts` - Completion logic

**Tests:**
- `src/lib/game/turn-processing/__tests__/build-completion.test.ts` - Production timing

**Status:** Draft

---

### REQ-MIL-006: Power Multipliers

**Description:** Units have fixed power multipliers for combat:
- Soldiers: 0.1×
- Fighters: 1.0× (baseline)
- Bombers: 2.0×
- Stations: 3.0× (6.0× when defending home sectors)
- Light Cruisers: 4.0×
- Heavy Cruisers: 8.0×
- Carriers: 12.0×

**Formula:**
```
Military Power = Σ (Unit Count × Unit Power Multiplier × Situational Bonuses)
```

**Rationale:** Creates unit hierarchy. Power multipliers define relative combat strength.

**Source:** Section 2.4, COMBAT-SYSTEM.md REQ-COMBAT-004

**Code:**
- `src/lib/formulas/combat-power.ts` - POWER_MULTIPLIERS constant
- `src/lib/combat/calculate-power.ts` - Power calculation

**Tests:**
- `src/lib/formulas/__tests__/combat-power.test.ts` - Power calculations

**Status:** Draft

---

### REQ-MIL-007: Cost-to-Power Efficiency

**Description:** Units maintain balanced cost-to-power ratios:

| Unit | Total Cost | Power | Credits per Power |
|------|------------|-------|-------------------|
| Fighters | 600 | 1.0 | 600 |
| Bombers | 950 | 2.0 | 475 |
| Stations | 3,700 | 3.0 | 1,233 (617 defending) |
| Light Cruisers | 6,100 | 4.0 | 1,525 |
| Heavy Cruisers | 17,800 | 8.0 | 2,225 |
| Carriers | 35,500 | 12.0 | 2,958 |

**Efficiency Tiers:**
- Excellent: Fighters, Bombers (< 600 credits/power)
- Good: Stations (when defending)
- Fair: Light Cruisers, Heavy Cruisers
- Poor: Soldiers, Carriers (specialized roles)

**Rationale:** Fighters and Bombers are most cost-efficient, encouraging balanced fleets. Higher-tier units provide raw power but at premium.

**Source:** Section 3.2

**Code:**
- `src/lib/formulas/cost-efficiency.ts` - Efficiency calculations

**Tests:**
- `src/lib/formulas/__tests__/cost-efficiency.test.ts` - Ratio validation

**Status:** Draft

---

### REQ-MIL-008: Composition Bonus

**Description:** Fleets with 4+ distinct unit types receive +15% total power bonus.

**Rationale:** Encourages diverse fleet compositions over mono-unit strategies. Rewards strategic variety.

**Source:** Section 3.3, COMBAT-SYSTEM.md REQ-COMBAT-005

**Code:**
- `src/lib/formulas/combat-power.ts` - calculateDiversityBonus()

**Tests:**
- `src/lib/formulas/__tests__/combat-power.test.ts` - Diversity bonus

**Status:** Draft

---

### REQ-MIL-009: Domain Assignment

**Description:** Units must be assigned to combat domains:
- **GROUND:** Soldiers only
- **SPACE:** Fighters, Light Cruisers, Heavy Cruisers, Carriers
- **ORBITAL:** Fighters, Bombers, Stations

Fighters can be assigned to SPACE or ORBITAL (flexible).
All other units restricted to single domain.

**Rationale:** Creates tactical assignment decisions. Fighters' flexibility provides strategic options.

**Source:** Section 3.6, COMBAT-SYSTEM.md Section 3.4

**Code:**
- `src/lib/combat/domain-assignment.ts` - Assignment validation
- `src/app/actions/combat-actions.ts` - Assign domain action

**Tests:**
- `src/lib/combat/__tests__/domain-assignment.test.ts` - Domain rules

**Status:** Draft

---

### REQ-MIL-010: No Unit Caps

**Description:** System has no arbitrary hard caps on unit counts.

Natural limits:
- Resource scarcity (petroleum limits cruisers/carriers)
- Maintenance drain (large fleets consume income)
- Production time (5-turn builds limit rapid mobilization)
- Population cap (limits total unit slots)

**Rationale:** "Consequence over limits" design philosophy. Players constrained by economics, not arbitrary caps.

**Source:** Section 3.5, PRD-EXECUTIVE.md

**Code:**
- N/A (absence of cap logic)

**Tests:**
- `src/lib/game/__tests__/no-unit-caps.test.ts` - Verify no hard limits

**Status:** Draft

---

### Specification Summary

| ID | Title | Status |
|----|-------|--------|
| REQ-MIL-001 | Six Unit Types | Draft |
| REQ-MIL-002 | Build Queue System | Draft |
| REQ-MIL-003 | Resource Costs | Draft |
| REQ-MIL-004 | Maintenance Costs | Draft |
| REQ-MIL-005 | Production Time | Draft |
| REQ-MIL-006 | Power Multipliers | Draft |
| REQ-MIL-007 | Cost-to-Power Efficiency | Draft |
| REQ-MIL-008 | Composition Bonus | Draft |
| REQ-MIL-009 | Domain Assignment | Draft |
| REQ-MIL-010 | No Unit Caps | Draft |

**Total Specifications:** 10
**Implemented:** 0
**Validated:** 0
**Draft:** 10

---

## 7. Implementation Requirements

Implementation details including database schemas, service architecture, and UI components are documented in the appendix.

**See:** [MILITARY-SYSTEM-APPENDIX.md](appendix/MILITARY-SYSTEM-APPENDIX.md)

### 7.1 Key Files

| Component | Path |
|-----------|------|
| Unit Configuration | `src/lib/units/unit-config.ts` |
| Build Queue Service | `src/lib/game/services/build-queue-service.ts` |
| Maintenance Processor | `src/lib/game/turn-processing/maintenance-phase.ts` |
| Unit Cost Calculator | `src/lib/units/unit-costs.ts` |
| Build Actions | `src/app/actions/build-actions.ts` |
| Build Queue UI | `src/components/game/build/BuildQueuePanel.tsx` |
| Fleet Overview UI | `src/components/game/military/FleetOverview.tsx` |
| Unit Card Component | `src/components/game/units/UnitCard.tsx` |

### 7.2 Database Tables

| Table | Purpose |
|-------|---------|
| `unit_templates` | Unit type definitions (stats, costs, production time) |
| `empire_units` | Player-owned units with current HP |
| `build_queue` | Active production queue entries |
| `maintenance_log` | Historical maintenance costs per turn |

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement |
|--------|--------|-----------|-------------|
| Average fleet power (Turn 50) | 80-120 | ±20 | Game log analysis |
| Military as % of networth | 20-30% | ±5% | Economic analysis |
| Fighter/Bomber ratio | 2:1 | ±0.5 | Fleet composition tracking |
| Maintenance burden | 30-40% of income | ±10% | Economic sustainability |
| Cost-efficiency variance | ±15% across tiers | ±5% | Cost/power ratio analysis |
| Composition bonus adoption | 60-70% of games | ±10% | Fleet diversity tracking |

### 8.2 Fleet Composition Targets

**Early Game (Turn 1-20):**
- 80% Fighters + Bombers
- 20% Soldiers (ground occupation)
- Average power: 20-40

**Mid Game (Turn 21-50):**
- 40% Fighters + Bombers
- 30% Stations (defensive)
- 20% Light Cruisers
- 10% Heavy Cruisers
- Average power: 80-120

**Late Game (Turn 51+):**
- 20% Fighters + Bombers
- 20% Stations
- 30% Light/Heavy Cruisers
- 20% Carriers
- 10% Soldiers
- Average power: 150-250

### 8.3 Playtest Checklist

- [ ] Fighters remain cost-efficient throughout game (most common unit)
- [ ] Heavy fleets have 30-40% maintenance burden (sustainable)
- [ ] Composition bonus adopted in 60%+ of games (encourages diversity)
- [ ] Stations are primary defensive choice (2× power when defending)
- [ ] Players cannot spam Carriers due to petroleum scarcity
- [ ] Build queue feels strategic (not instant gratification)
- [ ] Maintenance bankruptcy mechanic triggers in <5% of games (safety net, not common)
- [ ] Bot fleet compositions match archetype behavior (Warlord = heavy, Turtle = stations)
- [ ] Unit cards clearly show all relevant stats (no hidden information)
- [ ] Fleet panel provides at-a-glance power assessment

---

## 9. Migration Plan

### 9.1 Development Path

**Phase 1: Core Units (M4-M5)**
1. Create `unit_templates` table with Tier I units
2. Implement unit cost and stat configurations
3. Create unit type enum and validation

**Phase 2: Build Queue (M6-M7)**
4. Implement build queue service
5. Create build actions (queue, cancel)
6. Build queue UI component

**Phase 3: Maintenance System (M8-M9)**
7. Implement maintenance calculation
8. Create maintenance phase in turn processing
9. Add attrition logic for bankruptcy

**Phase 4: Fleet Management (M10-M11)**
10. Create fleet overview UI
11. Implement domain assignment
12. Add unit card display component

**Phase 5: Bot Integration (M12-M13)**
13. Implement bot build priorities per archetype
14. Add bot production decision logic
15. Balance testing and tuning

### 9.2 Database Schema

```sql
-- Unit templates table (Tier I standard units)
CREATE TABLE unit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  unit_type TEXT NOT NULL, -- 'SOLDIER', 'FIGHTER', 'BOMBER', etc.
  tier INTEGER DEFAULT 1, -- 1, 2, 3

  -- Power and domain
  power_multiplier DECIMAL NOT NULL,
  domain TEXT NOT NULL, -- 'GROUND', 'SPACE', 'ORBITAL'

  -- Production
  production_time INTEGER NOT NULL, -- turns to build
  cost_credits INTEGER NOT NULL,
  cost_ore INTEGER DEFAULT 0,
  cost_petroleum INTEGER DEFAULT 0,
  cost_food INTEGER DEFAULT 0,

  -- Maintenance
  maint_credits INTEGER NOT NULL,
  maint_ore INTEGER DEFAULT 0,
  maint_petroleum INTEGER DEFAULT 0,

  -- D20 Stats (for combat integration)
  strength INTEGER, -- 8-20
  dexterity INTEGER, -- 8-20
  constitution INTEGER, -- 8-20
  base_hp INTEGER,
  armor_bonus INTEGER,
  base_attack_bonus INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Empire units (owned units)
CREATE TABLE empire_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  unit_template_id UUID NOT NULL REFERENCES unit_templates(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  current_hp INTEGER, -- For damaged units
  assigned_domain TEXT, -- 'GROUND', 'SPACE', 'ORBITAL', NULL
  created_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build queue
CREATE TABLE build_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  unit_template_id UUID NOT NULL REFERENCES unit_templates(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  start_turn INTEGER NOT NULL,
  completion_turn INTEGER NOT NULL,
  resources_paid JSONB NOT NULL, -- { credits: 500, ore: 100, ... }
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_empire_units_empire ON empire_units(empire_id);
CREATE INDEX idx_build_queue_empire ON build_queue(empire_id);
CREATE INDEX idx_build_queue_completion ON build_queue(completion_turn) WHERE status = 'active';
```

### 9.3 Testing Requirements

**Unit Tests:**
- [ ] Unit cost calculations (all 6 types)
- [ ] Maintenance cost calculations
- [ ] Power multiplier calculations
- [ ] Production time validation
- [ ] Build queue add/remove operations
- [ ] Cancellation refund logic (50% refund)
- [ ] Composition bonus detection (4+ types = +15%)

**Integration Tests:**
- [ ] Build unit → deduct resources → queue entry created
- [ ] Turn advancement → build progress increment
- [ ] Completion turn → unit added to empire_units
- [ ] Maintenance phase → resources deducted per turn
- [ ] Maintenance bankruptcy → 10% unit loss per turn
- [ ] Domain assignment validation

**Balance Tests:**
- [ ] Cost-to-power ratios within ±15% variance
- [ ] Fleet compositions match archetype priorities (80%+ match)
- [ ] Maintenance burden = 30-40% of income (mid game)
- [ ] Composition bonus adopted in 60%+ of simulated games

---

## 10. Conclusion

### Key Decisions

- **Six unit types** - Soldiers, Fighters, Bombers, Stations, Light Cruisers, Heavy Cruisers, Carriers provide strategic variety
- **Build queue with production time** - 1-5 turn builds prevent instant armies, require planning
- **Resource costs (credits, ore, petroleum, food)** - Scarcity creates economic constraints
- **Maintenance costs** - Per-turn upkeep prevents runaway military growth
- **Power multipliers (0.1× to 12.0×)** - Clear unit hierarchy and combat strength
- **No hard caps** - Natural limits via resources, maintenance, and production time
- **Composition bonus (+15% for 4+ types)** - Encourages diverse fleets over mono-unit spam

### Open Questions

- None currently - all design questions resolved during specification

### Dependencies

- **Depends On:** COMBAT-SYSTEM (power multipliers, domain combat), RESOURCE-SYSTEM (credits, ore, petroleum, food production), TURN-PROCESSING (build completion, maintenance phase)
- **Depended By:** BOT-SYSTEM (build priorities per archetype), COMBAT-SYSTEM (unit participation in battles), FRONTEND-DESIGN (build queue UI, fleet overview)

---

## Appendix Reference

Full implementation code examples available in:
- [MILITARY-SYSTEM-APPENDIX.md](appendix/MILITARY-SYSTEM-APPENDIX.md) - Database schemas, service architecture, UI components, unit configurations

---

**END SPECIFICATION**
