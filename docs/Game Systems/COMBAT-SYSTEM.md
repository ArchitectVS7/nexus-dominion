# Combat System

**Version:** 2.1
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-COMBAT
**Created:** 2026-01-11
**Last Updated:** 2026-01-12
**Replaces:** COMBAT-SYSTEM.md (v2.0), d20-exec-summary.md

---

## Document Purpose

This document provides the complete specification for Nexus Dominion's D20-based combat system. All combat mechanics, stat systems, and unit cards are defined here.

This document is intended for:
- **Game designers** defining combat mechanics and balance
- **Developers** implementing the combat engine
- **QA** validating combat behavior against specifications

**Design Philosophy:**
- **Familiar D20 mechanics** (5% granularity, roll + modifiers >= threshold)
- **Card-based clarity** (all stats visible on unit cards)
- **Strategic depth** (multi-domain conflict, positioning, composition)
- **Boardgame feel** (easy to learn, dramatic moments, visible tactics)
- **Full OGL compliance** (standard STR/DEX/CON ability scores)

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

### 1.1 Resolution Formula

**Universal Formula:**
```
d20 + (Relevant Stat Modifier) + Bonuses >= Target Defense
```

**Example:**
```
Light Cruiser attacks Heavy Cruiser
Roll: 14
Attacker ATK bonus: +5
Fleet coordination: +2
Total: 14 + 5 + 2 = 21

Defender DEF: 18
Result: 21 >= 18 -> HIT
```

### 1.2 Why D20?

- **5% granularity** - Easy probability calculation
- **Threshold logic** - Clear success/failure
- **Familiar** - Players know D&D mechanics
- **Scales well** - Works for single units or fleets
- **Supports drama** - Critical successes (nat 20), critical failures (nat 1)

### 1.3 Player Experience

Combat in Nexus Dominion feels like commanding a fleet in a tabletop wargame. Players assign units to domains, watch dice rolls resolve, and see dramatic swings from critical hits. The multi-domain structure creates narrative coherence: "We lost space superiority, but our orbital stations held, and ground forces repelled the invasion."

---

## 2. Mechanics Overview

### 2.1 Critical Events

| Roll | Event | Effect |
|------|-------|--------|
| **Natural 20** | Critical Success | 2x damage, bypass 50% DEF |
| **Natural 1** | Critical Failure | Miss, lose 1 SPEED (initiative penalty next round) |
| **18-19** | Excellent Hit | +50% damage |
| **2-3** | Glancing Blow | -50% damage (if hit) |

### 2.2 Three Battle Types

| Type | Purpose | Requirements | Resolution | Can Capture? |
|------|---------|--------------|------------|--------------|
| **Full Invasion** | Capture sectors | Carriers + space control | Multi-domain | YES (5-15%) |
| **Covert Strike** | Harassment, sabotage | Commandos OR Syndicate contract | Ground only | NO |
| **Blockade** | Economic warfare | Space fleet | No combat | NO |

**Full Invasions** are overt military campaigns requiring fleet superiority. You must fight through Space and Orbital defenses before landing ground forces. Victory captures enemy sectors.

**Covert Strikes** are black ops missions using specialized forces or Syndicate-hired operatives. These bypass conventional defenses through stealth insertion, insurgent support networks, or diplomatic cover. They weaken enemies but cannot capture territory.

**Blockades** are naval sieges that strangle enemy trade routes without landing troops. Effective for economic pressure but cannot capture ground.

### 2.3 Unit Type Matrix

| Unit Type | Strong vs | Weak vs | Domain |
|-----------|-----------|---------|--------|
| **Soldiers** | Ground units | Air/Space | GROUND |
| **Fighters** | Bombers, Interceptors | Cruisers | SPACE |
| **Bombers** | Cruisers, Stations | Fighters | ORBITAL |
| **Light Cruisers** | Fighters, Carriers | Heavy Cruisers | SPACE |
| **Heavy Cruisers** | Light Cruisers, Stations | Bombers | SPACE |
| **Stations** | All (when defending) | Bombers | ORBITAL |
| **Carriers** | None (support) | All | SPACE |

---

## 3. Detailed Rules

### 3.1 Stat Framework

#### Ship Stats (Physical Abilities)

Every unit has three ability scores following D&D conventions:

| Stat | Abbrev | Range | Modifier Range | Affects |
|------|--------|-------|----------------|---------|
| **Strength** | STR | 8-20 | -1 to +5 | Damage bonus |
| **Dexterity** | DEX | 8-20 | -1 to +5 | To-hit bonus, AC, initiative |
| **Constitution** | CON | 8-20 | -1 to +5 | Hit points (HP) |

**Stat Modifier Calculation** (Standard D&D):
```
Modifier = (Stat - 10) / 2 (rounded down)

Examples:
STR  8 -> -1 modifier
STR 10 -> +0 modifier
STR 12 -> +1 modifier
STR 14 -> +2 modifier
STR 16 -> +3 modifier
STR 18 -> +4 modifier
STR 20 -> +5 modifier
```

#### Derived Stats

| Stat | Formula | Purpose |
|------|---------|---------|
| **HP (Hit Points)** | Base HP + (CON mod x level) | Damage absorption (0 = destroyed) |
| **AC (Armor Class)** | 10 + DEX mod + armor bonus | Defense threshold for enemy attacks |
| **Initiative** | DEX modifier | Turn order in combat |
| **Attack Bonus** | BAB + STR/DEX mod | Added to d20 roll to hit |
| **Damage** | Weapon dice + STR mod | HP damage dealt on hit |

**Base Attack Bonus (BAB)** by unit tier:
- Tier I units: BAB +2
- Tier II units: BAB +4
- Tier III units: BAB +6

#### Commander Stats (Bot AI Only)

These stats belong to bot commanders and affect strategic decision-making:

| Stat | Abbrev | Range | Affects |
|------|--------|-------|---------|
| **Intelligence** | INT | 8-18 | Tech research speed, tactical adaptation |
| **Wisdom** | WIS | 8-18 | Strategic planning, retreat decisions, risk assessment |
| **Charisma** | CHA | 8-18 | Alliance formation, diplomacy, surrender negotiations |

### 3.2 Unit Card Anatomy

Every unit is represented as a card with this structure:

```
+-------------------------------------+
| [icon] HEAVY CRUISER      [TIER II] |  <- Unit name + rarity
+------------------------------------|
| ABILITY SCORES                      |
|  STR: 16 (+3)  DEX: 12 (+1)        |  <- D&D ability scores
|  CON: 14 (+2)                       |
|                                     |
| DERIVED STATS                       |
|  HP: 40  (base 20 + CON +2 x 10)   |  <- Hit points
|  AC: 15  (10 + DEX +1 + armor +4)  |  <- Armor class
|  Init: +1 (DEX modifier)            |  <- Initiative
|                                     |
| ATTACK                              |
|  Heavy Cannons (ranged)             |
|  +5 to hit (BAB +4 + DEX +1)       |  <- Attack bonus
|  Damage: 2d8+3 (weapon + STR)       |  <- Damage dice
|                                     |
| SPECIAL ABILITY                     |
|  Broadside: Attack 2 targets/round |
+------------------------------------|
| Cost: 15,000  | Pop: 3              |  <- Build cost
| Domain: SPACE | Maint: 50           |  <- Tags
+-------------------------------------+
```

**Color Coding by Tier:**
- **Standard (Tier I)** - Green border
- **Prototype (Tier II)** - Blue border
- **Singularity (Tier III)** - Purple border

### 3.3 Combat Resolution Phases

Each domain battle follows this sequence:

**PHASE 1: Initiative**
- Each side rolls: d20 + Highest MNV in fleet
- Winner gains "Tactical Advantage Token" (reroll 1 failed attack, strike first)

**PHASE 2: Attack Rolls**
- For each unit: Roll d20 + ATK modifier
- Compare to enemy's DEF
- On hit: Deal damage = Unit's base damage
- On crit (nat 20): Deal 2x damage

**PHASE 3: Apply Damage**
- Target priority: Lowest HULL units first
- Overkill damage carries to next unit
- Unit destroyed when HULL reaches 0

**PHASE 4: Morale Check**
- If side loses 50%+ units: Roll d20 + Commander WIS
- DC 15: Pass (fight to the end)
- DC 10-14: Shaken (-2 to all rolls next round)
- DC <10: Routed (immediate retreat with losses)

### 3.4 Multi-Domain Battle Resolution

Full Invasions resolve three simultaneous battles:

**Resolution Order:**
1. **SPACE BATTLE** - Winner gains +2 bonus to Orbital and Ground domains
2. **ORBITAL BATTLE** - Winner gains +2 bonus to Ground domain
3. **GROUND BATTLE** - Winner captures 5-15% of defender's sectors

**Victory Conditions:**
- **Total Victory:** Win all 3 domains -> Capture 15% sectors
- **Decisive Victory:** Win 2 domains -> Capture 10% sectors
- **Pyrrhic Victory:** Win 1 domain -> Capture 5% sectors, heavy casualties
- **Stalemate:** Win 0 domains -> No capture, mutual casualties
- **Defeat:** Lose all domains -> Attacker retreats, 15% unit losses

**Cross-Domain Bonuses Stack:**
- Win Space + Orbital = +4 bonus to Ground battle

### 3.5 Fleet Composition Bonuses

| Composition | Requirement | Bonus |
|-------------|-------------|-------|
| **Balanced Force** | 4+ different unit types | +15% to all stats |
| **Speed Wing** | 3+ units with MNV 5+ | Strike first, ignore initiative roll |
| **Defensive Wall** | 5+ Stations | 2x DEF bonus when defending |
| **Overwhelming Force** | 20+ total units | Intimidation: Enemy morale -2 |
| **Surgical Strike** | All units MNV 6+ | +3 to initiative, retreat always succeeds |

### 3.6 Retreat & Surrender

**Attacker Can Retreat:**
- At end of any combat round
- Roll d20 + MNV (best unit) vs DC 12
- Success: Retreat safely
- Failure: Suffer "Attack of Opportunity" (15% casualties)

**Defender Cannot Retreat** (defending home territory)

**Surrender Mechanics:**
- Triggered at 75%+ HULL losses
- Roll: d20 + Attacker CHA vs Defender WIS
- Success: Sector captured without further combat, 50% defender units survive (scattered)
- Failure: Fight continues

### 3.7 Rarity Tiers

| Tier | Name | Design Intent | Stat Range |
|------|------|---------------|------------|
| **Tier I** | Standard-Issue | Baseline units | 8-12 |
| **Tier II** | Prototype | Tech-enhanced | 12-16 |
| **Tier III** | Singularity-Class | Elite/legendary | 16-20 |

**Acquisition:**
- **Tier I:** Available Turn 1, purchased with credits
- **Tier II:** Unlocked via research, draft every 10 turns (draw 2, keep 1), costs 2x Tier I
- **Tier III:** Ultra-rare draft at Turn 50+, only 1 per game per player, public announcement

---

## 4. Bot Integration

### 4.1 Archetype Combat Behavior

| Archetype | INT | WIS | CHA | Aggression | Retreat Threshold | Favored Units |
|-----------|-----|-----|-----|------------|-------------------|---------------|
| **Warlord** | 12 | 14 | 8 | 9/10 | 25% HULL | Heavy Cruisers, Bombers |
| **Turtle** | 14 | 16 | 10 | 2/10 | Never | Stations, Light Cruisers |
| **Diplomat** | 13 | 14 | 18 | 3/10 | 60% HULL | Mixed (balanced) |
| **Tech Rush** | 17 | 12 | 10 | 5/10 | 40% HULL | Prototype units |
| **Schemer** | 13 | 15 | 16 | 6/10 | 50% HULL | Covert Agents, Bombers |

### 4.2 Bot Decision Logic

**Attack Decision:**
```
attackDesirability = baseAggression - (WIS_modifier * riskAssessment)

where riskAssessment = (targetPower / botPower) + (targetAllies * 0.2)
```

**Retreat Decision:**
```
if (currentHullPercent <= retreatThreshold):
    wisCheck = d20 + WIS_modifier
    if wisCheck >= 15: retreat()
```

**Draft Preference by Archetype:**
- Warlord: +ATK cards
- Turtle: +DEF cards
- Diplomat: Balanced/utility cards
- Tech Rush: Prototype unlocks
- Schemer: Disruption/morale attack cards

### 4.3 Bot Combat Messages

**Warlord (Pre-Battle):**
- "Your defenses crumble before the might of the {empire_name} war machine."
- "Surrender now. My heavy cruisers don't discriminate."

**Warlord (Draft Event):**
- "My fleets grow stronger. Your shields won't save you."

**Turtle (Defending):**
- "You've made a grave miscalculation attacking my territory."
- "My stations have held for decades. You won't be the one to break them."

**Schemer (Covert Strike):**
- "Strange how accidents keep happening to your infrastructure..."
- "The Syndicate sends their regards."

---

## 5. UI/UX Design

### 5.1 Unit Card Visual Design

**Stat Bars:**
- 10-segment visual bars (like fighting games)
- Filled segments = stat value (ATK 8 = 8 segments filled)
- Makes relative power instantly visible

**Icons:**
- Attack: crossed swords
- Defense: shield
- Hull: heart
- Maneuvering: lightning bolt
- Credits: coin
- Population: person
- Petroleum: oil drop

### 5.2 Combat UI Flow

1. **Pre-Battle Screen:** Fleet comparison, domain assignment, predicted outcomes
2. **Domain Selection:** Drag-drop units to Space/Orbital/Ground
3. **Battle Animation:** Dice roll visualization, hit/miss indicators
4. **Result Screen:** Casualties, territory changes, dramatic outcome text

### 5.3 Combat Preview Panel

Shows before committing to battle:
- Attack roll modifiers breakdown
- Estimated hit probability per unit
- Domain-by-domain power comparison
- Predicted outcome range (victory types)

---

## 6. Specifications

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |

---

### REQ-COMBAT-001: D20 Attack Resolution

**Description:** Attack success is determined by rolling d20 + Attack Bonus >= Target AC.

**Formula:**
```
Attack Success = d20 + Attack Bonus >= Target Defense
Attack Bonus = BAB + Stat Modifier + Situational Bonuses
Stat Modifier = floor((Stat - 10) / 2)
```

**Rationale:** Simplifies combat while maintaining drama. Single-roll resolution is faster and more intuitive.

**Source:** Section 1.1

**Code:** `src/lib/combat/d20-combat-engine.ts`

**Tests:** `src/lib/combat/__tests__/d20-combat-engine.test.ts`

**Status:** Draft

---

### REQ-COMBAT-002: Attacker Win Rate

**Description:** With equal forces, the attacker wins approximately 47.6% of battles.

**Rationale:** Slight defender advantage encourages defensive play and alliances.

**Source:** Section 8.1

**Code:** `src/lib/formulas/combat-power.ts`

**Tests:** TBD (Monte Carlo validation needed)

**Status:** Draft

---

### REQ-COMBAT-003: Defender Advantage

**Description:** Defenders receive a 1.10x (10%) power bonus in their own territory.

**Rationale:** Makes conquest harder, rewards defense.

**Source:** Section 3.4

**Code:** `src/lib/formulas/combat-power.ts:DEFENDER_ADVANTAGE`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-004: Unit Power Multipliers

**Description:** Each unit type has a specific power multiplier:
- Soldiers: 0.1
- Fighters: 1
- Stations: 3 (6 when defending)
- Light Cruisers: 4
- Heavy Cruisers: 8
- Carriers: 12

**Rationale:** Creates unit hierarchy and strategic choices.

**Source:** Section 2.3

**Code:** `src/lib/formulas/combat-power.ts:POWER_MULTIPLIERS`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-005: Diversity Bonus

**Description:** Fleets with 4+ distinct unit types receive a 15% power bonus.

**Rationale:** Encourages balanced fleet composition over mono-unit strategies.

**Source:** Section 3.5

**Code:** `src/lib/formulas/combat-power.ts:calculateDiversityBonus()`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-006: Station Defense Multiplier

**Description:** Stations have 2.0x power when defending (effectively power 6 instead of 3).

**Rationale:** Stations are defensive installations, not offensive units.

**Source:** Section 3.5

**Code:** `src/lib/formulas/combat-power.ts:STATION_DEFENSE_MULTIPLIER`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-007: Protection Period

**Description:** New players have a 20-turn protection period during which they cannot be attacked.

**Rationale:** Allows new players to establish their empire before combat.

**Source:** VISION.md

**Code:** `src/lib/game/constants.ts:PROTECTION_TURNS`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-008: Six Dramatic Outcomes

**Description:** Combat results in one of 6 outcomes based on roll and power differential:
1. Decisive Victory (attacker)
2. Victory (attacker)
3. Pyrrhic Victory (attacker)
4. Pyrrhic Victory (defender)
5. Victory (defender)
6. Decisive Victory (defender)

**Rationale:** Creates narrative variety in battle reports.

**Source:** Section 3.4

**Code:** `src/lib/combat/outcomes.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-009: Multi-Domain Resolution (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-COMBAT-009-A through REQ-COMBAT-009-D below.

**Overview:** Full Invasions resolve across three sequential domains (Space -> Orbital -> Ground), with victories in earlier domains providing combat bonuses to later domains.

**Domain Sequence:**
- Space Domain: Fighters, Bombers, Cruisers, Carriers [REQ-COMBAT-009-A]
- Orbital Domain: Stations defend [REQ-COMBAT-009-B]
- Ground Domain: Soldiers battle for sector capture [REQ-COMBAT-009-C]
- Victory Bonuses: +2 per domain win [REQ-COMBAT-009-D]

---

### REQ-COMBAT-009-A: Space Domain Resolution

**Description:** The first combat domain where space-capable units (Fighters, Bombers, Light Cruisers, Heavy Cruisers, Carriers) engage in space combat before proceeding to orbital or ground phases.

**Space Domain Rules:**
- Sequence: Always resolves first in Full Invasion battles
- Eligible Units: Fighters, Bombers, Light Cruisers, Heavy Cruisers, Carriers
- Resolution: Standard D20 attack resolution (REQ-COMBAT-001)
- Victory Condition: Reduce enemy space forces to 0 or force retreat
- Advancement: Winner proceeds to Orbital Domain with victory bonus

**Rationale:** Space superiority is the first hurdle in planetary invasion. Controlling space allows bombardment and troop deployment while denying the defender reinforcement.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4 - Multi-Domain Resolution, Space Domain

**Code:** TBD - `src/lib/combat/multi-domain.ts` - Space domain logic

**Tests:** TBD - Verify space units engage first, winner advances

**Status:** Draft

---

### REQ-COMBAT-009-B: Orbital Domain Resolution

**Description:** The second combat domain where orbital defense stations defend against attacking space forces, representing the battle for orbital control before ground invasion.

**Orbital Domain Rules:**
- Sequence: Resolves second, after Space Domain
- Defender Units: Stations only (orbital defense platforms)
- Attacker Units: Surviving space units from Space Domain
- Resolution: Standard D20 attack resolution with Station Defense Multiplier (REQ-COMBAT-006)
- Victory Condition: Destroy all stations or force retreat
- Advancement: Winner proceeds to Ground Domain with accumulated victory bonuses

**Rationale:** Orbital stations provide last-ditch defense before ground invasion. Even if space is lost, stations can inflict heavy casualties on descending forces.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4 - Multi-Domain Resolution, Orbital Domain

**Code:** TBD - `src/lib/combat/multi-domain.ts` - Orbital domain logic

**Tests:** TBD - Verify stations defend in orbital phase, attacker brings space units

**Status:** Draft

---

### REQ-COMBAT-009-C: Ground Domain Resolution

**Description:** The final combat domain where ground forces (Soldiers) battle for control of planetary sectors, determining whether sectors are captured or successfully defended.

**Ground Domain Rules:**
- Sequence: Resolves third and last, after Orbital Domain
- Eligible Units: Soldiers only (ground troops)
- Resolution: Standard D20 attack resolution
- Victory Condition: Reduce defender soldiers to critical levels
- Sector Capture: Winner captures 5-15% of defender's sectors (per REQ-COMBAT-010)
- Final Domain: No further advancement, battle concludes here

**Rationale:** Ground combat is the decisive phase where sectors change hands. Even with space and orbital superiority, attackers must win on the ground to capture territory.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4 - Multi-Domain Resolution, Ground Domain

**Code:** TBD - `src/lib/combat/multi-domain.ts` - Ground domain logic

**Tests:** TBD - Verify ground combat is final phase, sector capture occurs

**Status:** Draft

---

### REQ-COMBAT-009-D: Cross-Domain Victory Bonuses

**Description:** Winning a combat domain grants the victor a +2 bonus to all attack rolls in subsequent domains, rewarding dominant performance and creating momentum.

**Victory Bonus Rules:**
- Bonus Amount: +2 to attack rolls per domain won
- Stacking: Bonuses stack across domains (win 2 domains = +4 total)
- Application: Applies to all units in subsequent domains
- Maximum: +4 bonus (win Space and Orbital domains)
- Duration: Lasts only for current battle, resets between battles

**Examples:**
- Win Space Domain: +2 bonus in Orbital and Ground
- Win Space + Orbital: +2 in Orbital, +4 in Ground
- Lose Space, Win Orbital: +2 in Ground only

**Rationale:** Victory bonuses create narrative momentum and reward balanced fleet composition. Winning space makes orbital assault easier, winning orbital makes ground invasion easier. Encourages investing in all three domains rather than specializing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4 - Multi-Domain Resolution, Victory Bonuses

**Code:** TBD - `src/lib/combat/multi-domain.ts` - Victory bonus tracking

**Tests:** TBD - Verify +2 per domain win, stacking to +4 maximum

**Status:** Draft

---

### REQ-COMBAT-010: Three Battle Types

**Description:** Three distinct battle types:
- Full Invasion: Multi-domain, can capture 5-15% sectors
- Covert Strike: Ground only, 10-20% infrastructure damage, no capture
- Blockade: Economic pressure, no combat, no capture

**Rationale:** Provides strategic alternatives to direct conquest.

**Source:** Section 2.2

**Code:** `src/lib/combat/battle-types.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-011: Unit Rarity Tiers

**Description:** Units organized into three tiers:
- Tier I (Standard): Stats 8-12, available Turn 1
- Tier II (Prototype): Stats 12-16, unlocked via research
- Tier III (Singularity): Stats 16-20, rare drafts Turn 50+

**Rationale:** Creates power progression and late-game escalation.

**Source:** Section 3.7

**Code:** `src/lib/combat/unit-cards.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-012: Morale & Surrender

**Description:** Morale checks at 50%+ losses (d20 + WIS vs DC 15). Surrender offers at 75%+ losses (Attacker CHA vs Defender WIS).

**Rationale:** Prevents total annihilation, enables tactical retreats.

**Source:** Section 3.6

**Code:** `src/lib/combat/morale.ts`

**Tests:** TBD

**Status:** Draft

---

### Specification Summary

| ID | Title | Status |
|----|-------|--------|
| REQ-COMBAT-001 | D20 Attack Resolution | Draft |
| REQ-COMBAT-002 | Attacker Win Rate | Draft |
| REQ-COMBAT-003 | Defender Advantage | Draft |
| REQ-COMBAT-004 | Unit Power Multipliers | Draft |
| REQ-COMBAT-005 | Diversity Bonus | Draft |
| REQ-COMBAT-006 | Station Defense Multiplier | Draft |
| REQ-COMBAT-007 | Protection Period | Draft |
| REQ-COMBAT-008 | Six Dramatic Outcomes | Draft |
| REQ-COMBAT-009 | Multi-Domain Resolution | Draft |
| REQ-COMBAT-010 | Three Battle Types | Draft |
| REQ-COMBAT-011 | Unit Rarity Tiers | Draft |
| REQ-COMBAT-012 | Morale & Surrender | Draft |

---

## 7. Implementation Requirements

Implementation details including database schemas, service architecture, and UI components are documented in the appendix.

**See:** [COMBAT-SYSTEM-APPENDIX.md](appendix/COMBAT-SYSTEM-APPENDIX.md)

### 7.1 Key Files

| Component | Path |
|-----------|------|
| Combat Engine | `src/lib/combat/d20-combat-engine.ts` |
| Combat Calculator | `src/lib/combat/combat-calculator.ts` |
| Draft Service | `src/lib/game/services/draft-service.ts` |
| Unit Card Component | `src/components/game/units/UnitCard.tsx` |
| Fleet Panel | `src/components/game/combat/FleetCompositionPanel.tsx` |
| Combat Preview | `src/components/game/combat/CombatPreview.tsx` |

### 7.2 Database Tables

| Table | Purpose |
|-------|---------|
| `unit_templates` | Unit card definitions (stats, abilities, costs) |
| `empire_units` | Player-owned units with current HP |
| `empires` (columns) | Commander stats (INT/WIS/CHA) |

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement |
|--------|--------|-----------|-------------|
| Attacker win rate (equal forces) | 47.6% | +/-3% | Monte Carlo 10,000 battles |
| Defender advantage | 10% | +/-2% | Win rate differential |
| Critical hit frequency | 5% | exact | D20 distribution |
| Morale break rate (50%+ losses) | 10-15% | +/-5% | Combat log analysis |

### 8.2 Type Advantage Impact

- +2 ATK advantage = +15-20% win rate
- Composition bonus = +10-15% power
- Domain superiority = +20-25% win rate in next domain

### 8.3 Playtest Checklist

- [ ] Balanced fleets beat mono-unit fleets (composition bonus working)
- [ ] Defenders win slightly more often (defender advantage working)
- [ ] Tier III units feel legendary but not game-breaking
- [ ] Multi-domain battles have cascading tactical impact
- [ ] Covert strikes provide meaningful alternative to invasion

---

## 9. Migration Plan

### 9.1 Development Path

1. Create `unit_templates` table with Tier I units
2. Implement D20 combat engine (single-domain first)
3. Add multi-domain battle resolution
4. Implement card UI components
5. Add draft system (Tier II/III cards)
6. Integrate bot commander stats
7. Balance testing and tuning
8. Full deployment

### 9.2 Testing Requirements

**Unit Tests:**
- [ ] D20 roll distribution (10,000 samples, validate 5% per number)
- [ ] Type advantage calculations
- [ ] Composition bonus detection
- [ ] Damage application (including overkill)
- [ ] Morale check thresholds

**Integration Tests:**
- [ ] Full invasion with 3 domains
- [ ] Fleet with composition bonus wins more often
- [ ] Defender advantage = 52-55% win rate
- [ ] Critical hits occur at 5% frequency

**Balance Tests:**
- [ ] 1000-battle Monte Carlo simulation
- [ ] Validate win rates per unit composition
- [ ] Ensure no dominant strategies

---

## 10. Conclusion

### Key Decisions

- **D20 system:** Familiar mechanics, 5% granularity, dramatic critical events
- **Three-domain combat:** Narrative coherence, strategic depth, cascading bonuses
- **Ship vs Commander stats:** Physical abilities on cards, mental abilities for bot AI
- **Three battle types:** Full Invasion, Covert Strike, Blockade provide strategic variety

### Open Questions

- None currently

### Dependencies

- **Depends On:** SYNDICATE-SYSTEM (for Covert Strike contracts), RESEARCH-SYSTEM (for unit unlocks)
- **Depended By:** BOT-SYSTEM (combat decision making), FRONTEND-DESIGN (combat UI)

---

## Appendix Reference

Full implementation code examples available in:
- [COMBAT-SYSTEM-APPENDIX.md](appendix/COMBAT-SYSTEM-APPENDIX.md) - Database schemas, service architecture, UI components, unit card gallery

---

**END SPECIFICATION**
