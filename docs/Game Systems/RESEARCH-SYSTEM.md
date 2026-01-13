# Research System

**Version:** 2.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-RSCH
**Created:** 2026-01-02
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/RESEARCH-SYSTEM.md (8-level passive research system)

---

## Document Purpose

This document defines the **Research and Technology System** for Nexus Dominion. Research replaces passive tech grinding with strategic draft-based choices that create asymmetric combat advantages and visible progression. The system introduces a three-tier structure where players make meaningful decisions at critical game moments, creating strategic identity through doctrine selection and tactical depth through hidden specializations.

**Who Should Read This:**
- Gameplay designers implementing research progression mechanics
- Combat system developers integrating research bonuses with D20 stats
- Bot AI developers programming doctrine/specialization decision logic
- UI/UX designers creating research selection and intel display interfaces
- Balance team tuning research timing, costs, and combat impact

**What This Resolves:**
- Replaces passive 8-level research with 3-tier draft system (Doctrine → Specialization → Capstone)
- Defines hybrid visibility model (public doctrines, hidden specializations)
- Establishes research-combat integration (STR/DEX/CON modifiers)
- Specifies intelligence gathering mechanics (espionage, combat reveals, rumors)
- Details bot archetype research preferences and decision trees
- Balances research as strategic identity system with meaningful choices

**Design Philosophy:**
- **Meaningful Choices** - Every research decision involves tradeoffs, not strict upgrades
- **Asymmetric Information** - Hybrid visibility creates intel gameplay and deduction
- **Combat Integration** - Tech modifies STR/DEX/CON stats directly, not abstract bonuses
- **Strategic Identity** - Doctrines define playstyle and unlock paths
- **Board Game Feel** - Draft from options, not watch a progress bar fill
- **Bot Drama** - Bots react to public tech announcements, hide secret specializations

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

### 1.1 Three-Tier Draft Structure

Replace the passive 8-level research system with **3 meaningful choice tiers** that define strategic identity:

| Tier | Name | Unlock Turn | Choice | Visibility | Impact |
|------|------|-------------|--------|------------|--------|
| **Tier 1** | Doctrine | ~Turn 10 | Pick 1 of 3 | 🌍 PUBLIC | Strategic identity, combat bonuses |
| **Tier 2** | Specialization | ~Turn 30 | Pick 1 of 2 | 🔒 HIDDEN | Tactical advantage, counter-play |
| **Tier 3** | Capstone | ~Turn 60 | Automatic | 🌍 PUBLIC | Game-changing power spike |

**Why This Structure?**

The three-tier system creates natural game phases:
- **Early Game (Turns 1-10):** Build economy, prepare for doctrine choice
- **Mid Game (Turns 10-30):** Execute doctrine strategy, gain specialization edge
- **Late Game (Turns 30-60):** Leverage specialization advantage, race to capstone
- **End Game (Turns 60+):** Capstone unlocks change game dynamics, endgame begins

### 1.2 Research Points (RP) Economy

**Production:**
- Research sectors generate **100 RP per turn** (unchanged from current system)
- RP accumulates in empire pool toward tier thresholds
- No automatic advancement - reaching threshold unlocks draft choice event

**Thresholds:**
```
Tier 1 (Doctrine):        1,000 RP   (~10 turns with 1 research sector)
Tier 2 (Specialization):  5,000 RP   (~30 turns with 2 research sectors)
Tier 3 (Capstone):       15,000 RP   (~60 turns with 3 research sectors)
```

**Strategic Considerations:**
- Building more research sectors accelerates progression
- Lost sectors delay advancement (conquered, destroyed)
- No choice = no progress (players must engage with draft system)
- Progress percentage is **hidden** from other empires (intel gameplay)

**Example Progression:**
```
Turn 1-9:   Accumulate RP, focus on economy
Turn 10:    Reach 1,000 RP → Doctrine draft unlocks
Turn 11:    Choose Doctrine → PUBLIC announcement
Turn 12-29: Continue accumulating RP with doctrine bonuses active
Turn 30:    Reach 5,000 RP → Specialization draft unlocks
Turn 31:    Choose Specialization → HIDDEN from enemies
Turn 32-59: Leverage hidden tactical advantage
Turn 60:    Reach 15,000 RP → Capstone auto-unlocks → PUBLIC announcement
```

### 1.3 The Card Game Metaphor

Think of research like a strategic card game:

- Your **hand** (RP accumulation, % progress) is **HIDDEN** 🔒
  - Enemies cannot see your exact RP total or progress percentage
  - They can estimate based on visible research sectors × turns elapsed

- Cards **played face up** (Doctrine) are **PUBLIC** 🌍
  - Galaxy-wide announcement when doctrine selected
  - All empires see your strategic identity immediately
  - Enemies can counter-pick or adapt strategies

- Cards **played face down** (Specialization) are **HIDDEN** until revealed 🕵️
  - No announcement when specialization selected
  - Revealed through combat (first use), espionage (5,000 cr), or alliance intel sharing
  - Creates tactical surprise and information warfare

- **Capstone unlocks** are dramatic **PUBLIC** announcements 🌍
  - Galaxy-wide alert when capstone achieved
  - Triggers bot reactions (coalitions form, preemptive strikes, panic)
  - Signals endgame phase has begun

This hybrid visibility model rewards intelligence gathering and creates strategic depth through asymmetric information.

---

## 2. Mechanics Overview

### 2.1 Research Tier Summary

**Tier 1: Doctrines (Turn ~10)**

| Doctrine | Combat Effect | Economic Effect | Unlocks |
|----------|---------------|-----------------|---------|
| **War Machine** | +2 STR modifier (all units) | -10% planet income | Heavy Cruisers, offensive specs |
| **Fortress** | +4 AC when defending | -5% attack power | Defense Platforms, defensive specs |
| **Commerce** | +2 CHA modifier (commander) | +20% market sell prices | Trade Fleets, economic specs |

**Tier 2: Specializations (Turn ~30)**

Based on doctrine chosen, unlock 2 specializations (pick 1):

**War Machine Specializations:**
- **Shock Troops:** Surprise round (attack before initiative roll)
- **Siege Engines:** +50% damage vs stationary targets (ignore station AC bonuses)

**Fortress Specializations:**
- **Shield Arrays:** Immunity to surprise rounds (negates Shock Troops)
- **Minefield Networks:** Attackers roll CON save DC 15 or lose 10% HP pre-combat

**Commerce Specializations:**
- **Trade Monopoly:** Buy -20%, sell +30% (economic only)
- **Mercenary Contracts:** Pay 10,000 cr to hire +2 STR bonus per battle

**Tier 3: Capstones (Turn ~60)**

Automatic unlock based on doctrine (no choice):

| Doctrine → Capstone | Effect |
|---------------------|--------|
| **War Machine → Dreadnought** | Build unique super-unit: STR 20 (+5), HP 200, 4d12+5 damage, once per game |
| **Fortress → Citadel World** | One planet becomes AC 25 (nearly invulnerable fortress) |
| **Commerce → Economic Hegemony** | Generate 50% of #2 empire's income as passive bonus |

### 2.2 Information Visibility Matrix

| Information Type | Visibility | Reveal Method | Cost |
|------------------|------------|---------------|------|
| **Current RP total** | 🔒 PRIVATE | Never visible | N/A |
| **Progress % to next tier** | 🔒 PRIVATE | Never visible | N/A |
| **Research sector count** | 🌍 PUBLIC | Sector visibility | Free |
| **Doctrine choice** | 🌍 PUBLIC | Auto-announcement (Turn ~10) | Free |
| **Specialization choice** | 🔒 HIDDEN | Combat, espionage, alliance | 5,000 cr (espionage) |
| **Capstone progress %** | 🔒 PRIVATE | Never visible | N/A |
| **Capstone unlock** | 🌍 PUBLIC | Auto-announcement (Turn ~60) | Free |
| **Active combat bonuses** | ⚔️ COMBAT | Experienced in battle | Free |

### 2.3 Rock-Paper-Scissors Counter-Play

Specializations create tactical counter-relationships:

```
War Machine (Shock Troops) ────> Commerce (undefended)
                                      │
                                      │ counters
                                      ▼
        Fortress (Shield Arrays) ◄──── negates first-strike
                │
                │ counters
                ▼
        War Machine (Siege Engines) ──> bypasses shields

Minefield Networks ──> Siege Engines (pre-combat damage)
Shield Arrays ──> Shock Troops (negate surprise)
Mercenary Contracts ──> Fortress AC (hired firepower)
```

Counter-picking requires intelligence gathering (you must know enemy's specialization to counter it).

### 2.4 Research-Combat Integration Flow

```
1. Empire builds research sectors
2. RP accumulates each turn (100 RP per sector)
3. Reach threshold → Draft event triggers
4. Player selects doctrine/specialization
5. Research bonuses apply to combat:

   DOCTRINE BONUSES (always active):
   - War Machine: +2 STR to all unit stat cards
   - Fortress: +4 AC when defending home sectors
   - Commerce: +2 CHA to commander (diplomacy checks)

   SPECIALIZATION BONUSES (conditional):
   - Shock Troops: IF attacking → Surprise round
   - Shield Arrays: IF defending → Negate surprise
   - Minefield Networks: IF defending → Pre-combat CON saves
   - Siege Engines: IF attacking stations → Treat AC as 10
   - Trade Monopoly: No combat effect (economic only)
   - Mercenary Contracts: IF hired → +2 STR for 1 battle

6. Combat resolves with research modifiers applied
7. Specialization revealed if first use against that empire
```

### 2.5 Intelligence Gathering Summary

**Methods to Reveal Enemy Specialization:**

1. **Combat Experience** (Free, automatic)
   - First time enemy uses specialization against you, it's revealed
   - Example: Enemy Shock Troops surprise you → "Enemy specialization: Shock Troops confirmed"

2. **Espionage Operation** (5,000 credits, 85% success)
   - Spend credits to investigate enemy specialization
   - Success: Reveals specialization + counter recommendations
   - Failure: Credits lost, no info gained

3. **Alliance Intel Sharing** (Free, automatic with allies)
   - Coalition members share specialization info automatically
   - See all allied specializations in Coalition Intel panel

4. **Galactic News Rumors** (Free, 50% accuracy)
   - Every 10 turns, generate 5 rumors (3 true, 2 false)
   - Players cannot tell which are accurate
   - Can verify rumors via espionage

5. **Deduction from Public Info** (Free, imperfect)
   - Visible research sectors × 100 RP/turn × turns elapsed = estimated RP
   - Estimate if enemy has reached Tier 2 specialization
   - Cannot determine which specialization chosen

---

## 3. Detailed Rules

### 3.1 Tier 1: Doctrine System (Turn ~10)

#### 3.1.1 Doctrine Selection

When empire reaches **1,000 RP**, doctrine draft event triggers. Player chooses ONE of three doctrines. This choice:
- Is **permanent** (cannot be changed later)
- Is **public** (announced galaxy-wide to all empires)
- Defines strategic identity for the rest of the game
- Determines which Tier 2 specializations are available
- Activates immediate combat bonuses

#### 3.1.2 War Machine Doctrine

**Combat Effect:** +2 STR modifier to all units

**Mechanics:**
- All unit stat cards gain +2 STR
- Fighter STR 10 (+0) → STR 12 (+1)
- Cruiser STR 14 (+2) → STR 16 (+3)
- Dreadnought (if unlocked) STR 18 (+4) → STR 20 (+5)

**Damage Calculation:**
```
Before: Fighter attacks with 1d6+0 damage
After:  Fighter attacks with 1d6+1 damage

Before: Cruiser attacks with 2d8+2 damage
After:  Cruiser attacks with 2d8+3 damage
```

**Economic Penalty:** -10% income from all planets
```
Commerce planet generating 8,000 cr/turn → 7,200 cr/turn
Ore planet generating 112 ore/turn → 101 ore/turn (rounded)
```

**Unlocks:**
- Heavy Cruisers (military unit type)
- War Machine specializations (Shock Troops, Siege Engines)

**Playstyle:** Aggressive expansion, offensive warfare, early military dominance

**Counter:** Fortress doctrine (+4 AC defending) negates some STR advantage

#### 3.1.3 Fortress Doctrine

**Combat Effect:** +4 AC bonus when defending home territory

**Mechanics:**
- Applies only when defending sectors you own
- Does NOT apply when attacking
- Station AC 13 → AC 17 when defending
- Defense Platform AC 15 → AC 19 when defending

**Example:**
```
Enemy War Machine Cruiser attacks your station
Enemy: +7 to hit (BAB +5 + STR +2)
Your Station: AC 17 (13 base + 4 Fortress bonus)

Attack roll: d20+7 vs AC 17
Enemy needs to roll 10+ to hit (instead of 6+ without Fortress)
```

**Economic Penalty:** -5% attack power when initiating attacks
```
Your Cruiser deals 2d8+2 damage normally
When attacking (not defending): 2d8+2 → Reduce by 5% (average -1 damage)
```

**Unlocks:**
- Defense Platforms (defensive structure)
- Fortress specializations (Shield Arrays, Minefield Networks)

**Playstyle:** Defensive consolidation, turtle strategy, high-value fortress worlds

**Counter:** War Machine Siege Engines bypass AC bonuses (treat as AC 10)

#### 3.1.4 Commerce Doctrine

**Combat Effect:** +2 CHA modifier to commander (no direct unit combat bonus)

**Mechanics:**
- Commander persona gains +2 CHA
- Bot commander CHA 12 (+1) → CHA 14 (+2)
- Affects diplomacy checks: d20 + CHA vs target's WIS
- Better alliance formation success rates
- Improved surrender negotiation outcomes

**Diplomacy Example:**
```
Propose alliance with neutral empire (DC 15)
Your roll: d20+2 (CHA +2) vs DC 15
Success: 13+ on die (65% chance)

Without Commerce: d20+0 vs DC 15
Success: 15+ on die (30% chance)
```

**Economic Effect:** +20% prices when selling resources at market
```
Selling 1,000 ore normally: 10,000 credits
With Commerce: 12,000 credits (+2,000 bonus)
```

**Unlocks:**
- Trade Fleets (economic unit type)
- Commerce specializations (Trade Monopoly, Mercenary Contracts)

**Playstyle:** Economic victory path, trade dominance, diplomatic alliances

**Counter:** War Machine raids disrupt trade routes, force military spending

#### 3.1.5 Public Doctrine Announcement

When doctrine is selected, galaxy-wide announcement displays to all empires:

```
┌─────────────────────────────────────────────────────────┐
│                 GALACTIC INTEL REPORT                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Emperor Varkus has adopted the WAR MACHINE doctrine.   │
│                                                         │
│  Their military grows more dangerous.                   │
│  (+2 STR to all units)                                  │
│                                                         │
│  Neighboring empires should fortify defenses.           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Bot Reactions:**
- **Turtle bots:** Fortify borders, build defense platforms
- **Schemer bots:** Propose defensive alliances against aggressor
- **Diplomat bots:** Attempt peace treaties to avoid conflict
- **Other War Machine bots:** See as rival, prepare for confrontation
- **Merchant bots:** Increase trade with non-War Machine empires

### 3.2 Tier 2: Specialization System (Turn ~30)

#### 3.2.1 Specialization Selection

When empire reaches **5,000 RP**, specialization draft event triggers. Player chooses ONE of TWO specializations based on their doctrine. This choice:
- Is **hidden** (no public announcement)
- Provides tactical combat advantage
- Remains secret until revealed through combat, espionage, or alliance sharing
- Creates information asymmetry and surprise factor

#### 3.2.2 War Machine Specialization: Shock Troops

**Effect:** First strike - Attack before initiative roll (D20 surprise round)

**Mechanics:**
```
Normal Combat:
1. Roll initiative (d20 + DEX mod)
2. Higher initiative attacks first
3. Proceed to normal rounds

With Shock Troops:
1. Shock Troops unit attacks immediately (surprise round)
2. Deal damage before enemy can react
3. THEN roll initiative normally
4. Proceed to normal rounds
```

**Example:**
```
Your Shock Troops Cruiser (2d8+3) vs Enemy Station (AC 13, 100 HP)

Surprise Round:
- You attack: d20+7 vs AC 13
- Roll 15 → Hit!
- Damage: 2d8+3 = 11 damage
- Enemy Station: 100 HP → 89 HP

Initiative Phase:
- Roll initiative: You 14, Enemy 11
- You go first again

Round 1:
- You attack again (normal turn order)
```

**Counter:** Fortress Shield Arrays negate surprise round (see 3.2.4)

**Reveal Conditions:**
- First use in combat against an empire
- Espionage (5,000 cr investigation)
- Alliance intel sharing

#### 3.2.3 War Machine Specialization: Siege Engines

**Effect:** +50% damage vs stationary targets (stations, defense platforms)

**Mechanics:**
- When attacking stations or defense platforms:
  - Treat target AC as 10 (ignore armor bonuses)
  - Add +2 STR modifier bonus (in addition to doctrine bonus)

**Example:**
```
Your Siege Cruiser attacking enemy Defense Platform

Normal:
- Target: AC 19 (15 base + 4 Fortress bonus)
- Your attack: d20+7 vs AC 19 (need 12+ to hit)

With Siege Engines:
- Target: AC 10 (armor ignored)
- Your attack: d20+9 vs AC 10 (need 1+ to hit, auto-hit except crit fail)
- Damage: 2d8+5 (normal +3 + siege +2)
```

**Counter:** Commerce Evacuation Tactics (if implemented) or Minefield Networks

**Reveal Conditions:**
- First use against stationary targets
- Espionage investigation
- Alliance intel sharing

#### 3.2.4 Fortress Specialization: Shield Arrays

**Effect:** Immunity to surprise rounds (D20 "Uncanny Dodge" equivalent)

**Mechanics:**
- Negates enemy Shock Troops surprise round
- Always roll initiative normally (no surprise attacks allowed)
- Shield generators activate before enemy can strike

**Example:**
```
Enemy War Machine (Shock Troops) attacks your station

Without Shield Arrays:
- Enemy surprise round: Attacks before initiative
- You take damage before defending

With Shield Arrays:
- Enemy surprise round: BLOCKED
- "Your shield arrays detected the attack!"
- Roll initiative normally
- No free damage to enemy
```

**Counter:** War Machine Siege Engines (bypass shields by treating AC as 10)

**Reveal Conditions:**
- When enemy attempts surprise round and it's negated
- Espionage investigation
- Alliance intel sharing

#### 3.2.5 Fortress Specialization: Minefield Networks

**Effect:** Attackers roll CON save DC 15 or lose 10% current HP before combat starts

**Mechanics:**
```
Pre-Combat Phase (before initiative):
For each attacking unit:
1. Roll d20 + CON modifier
2. Target: DC 15
3. Success: No damage
4. Failure: Lose 10% current HP

Example:
Enemy Cruiser (100 HP, CON +2) attacks your mined sector
- Enemy rolls: d20+2 vs DC 15
- Roll: 11 + 2 = 13 → FAIL
- Cruiser: 100 HP → 90 HP (before combat even starts)

Combat Phase:
- Roll initiative normally
- Cruiser fights at reduced HP (90 HP, not 100 HP)
```

**Counter:** Shock Troops auto-clear minefields in surprise round (suppress mines before they activate)

**Reveal Conditions:**
- When enemy triggers mines (automatic reveal)
- Espionage investigation
- Alliance intel sharing

#### 3.2.6 Commerce Specialization: Trade Monopoly

**Effect:** Buy resources at -20%, sell at +30% (economic only, no combat effect)

**Mechanics:**
```
Market Prices (Normal):
Buy 1,000 ore: 10,000 credits
Sell 1,000 ore: 10,000 credits

With Trade Monopoly:
Buy 1,000 ore: 8,000 credits (-20%)
Sell 1,000 ore: 13,000 credits (+30%)

Net advantage: +5,000 credits per trade cycle
```

**Passive Income Lead:**
- Over 50 turns, if trading 1,000 ore every 10 turns:
  - Normal: 0 net gain (buy 10k, sell 10k)
  - Trade Monopoly: +25,000 credits net gain

**No Combat Effect:** Does not modify STR/AC/HP in battles

**Counter:** War Machine raids disrupt trade routes (force military spending, prevent trades)

**Reveal Conditions:**
- Observed trade activity (market transactions visible to allies)
- Espionage investigation
- Alliance intel sharing

#### 3.2.7 Commerce Specialization: Mercenary Contracts

**Effect:** Spend 10,000 credits to hire mercenaries (+2 STR to all units for one battle)

**Mechanics:**
```
Before Battle:
- Decision: Hire mercenaries? (Y/N)
- Cost: 10,000 credits (deducted immediately)

If Hired:
- All units gain +2 STR modifier for this battle only
- Stacks with War Machine doctrine (+2 STR)

Example:
Your Commerce Cruiser (STR 14, +2 doctrine → 16)
Hire mercenaries: STR 16 → STR 18 (+4 total)
Damage: 2d8+4 (instead of 2d8+2)

After Battle:
- Mercenary effect expires (win or lose)
- Must pay again for next battle
```

**Cost-Benefit Analysis:**
```
10,000 credits buys:
- +2 STR to all units (1 battle)
- Average +2-3 damage per unit
- Viable for critical battles (defending home, capturing key sectors)
```

**Counter:** Fortress AC negates extra damage (high AC makes hits harder)

**Reveal Conditions:**
- Used in combat (message: "Enemy hired mercenaries!")
- Espionage investigation
- Alliance intel sharing

#### 3.2.8 Specialization Counter-Play Matrix

| Your Specialization | Counters | Countered By |
|---------------------|----------|--------------|
| **Shock Troops** | Commerce (undefended) | Shield Arrays (immunity to surprise) |
| **Siege Engines** | Shield Arrays (bypass AC) | Minefield Networks (pre-combat damage) |
| **Shield Arrays** | Shock Troops (negate surprise) | Siege Engines (ignore armor) |
| **Minefield Networks** | Siege Engines (pre-damage), Commerce | Shock Troops (clear mines in surprise) |
| **Trade Monopoly** | N/A (economic only) | War Machine raids (forced spending) |
| **Mercenary Contracts** | Fortress AC (hired firepower) | N/A (flexible, pay-per-use) |

### 3.3 Tier 3: Capstone System (Turn ~60)

#### 3.3.1 Capstone Unlock

When empire reaches **15,000 RP**, capstone automatically unlocks based on doctrine. No choice - this is the reward for commitment to a strategic path. Capstone unlock:
- Is **automatic** (no draft, immediate activation)
- Is **public** (galaxy-wide announcement, dramatic reveal)
- Triggers **bot reactions** (coalitions form, preemptive strikes)
- Signals **endgame phase** has begun

#### 3.3.2 War Machine Capstone: Dreadnought

**Effect:** Unlock ability to build Dreadnought super-unit (once per game)

**Dreadnought Stats:**
```
┌─────────────────────────────────────┐
│ DREADNOUGHT          [TIER III]     │
├─────────────────────────────────────┤
│ STR: 20 (+5)  DEX: 10 (+0)         │
│ CON: 20 (+5)  INT: 10 (+0)         │
│ WIS: 10 (+0)  CHA: 10 (+0)         │
│                                     │
│ HP: 200 (base 100 + CON +5 × 20)   │
│ AC: 20  (10 + DEX +0 + armor +10)  │
│ Initiative: +0                      │
│                                     │
│ Attack: Planet Killer Cannon        │
│ To Hit: +11 (BAB +6 + STR +5)      │
│ Damage: 4d12+5                      │
│ Average: 31 damage per hit          │
│                                     │
│ ABILITY: Overwhelming Firepower     │
│ Can attack ALL enemy units in       │
│ sector simultaneously (multi-attack)│
│                                     │
│ LIMIT: One per game                 │
│ Cost: 100,000 credits, 10 pop       │
│ Maintenance: 500 petroleum/turn     │
├─────────────────────────────────────┤
│ Domain: SPACE                       │
└─────────────────────────────────────┘
```

**Strategic Impact:**
- Single unit can turn tide of war
- Forces enemies to commit overwhelming force
- Can blockade sectors alone (area control)
- High maintenance cost (500 petroleum/turn)
- Loss is devastating (once per game limit)

**Public Announcement:**
```
┌─────────────────────────────────────────────────────────┐
│                 ⚠️ GALACTIC ALERT ⚠️                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  The Crimson Admiral has achieved                       │
│  DREADNOUGHT TECHNOLOGY!                                │
│                                                         │
│  A single devastating warship now patrols their         │
│  borders with unmatched firepower.                      │
│                                                         │
│  STR 20 (+5), HP 200, Damage: 4d12+5                    │
│                                                         │
│  All empires must decide: Attack now or never.          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Bot Reactions:**
- Defensive coalitions auto-form (3-5 nearby empires ally)
- Nearby empires panic, fortify borders
- Rival Warlords launch preemptive strikes before Dreadnought deployed
- Diplomats offer peace treaties to avoid conflict

#### 3.3.3 Fortress Capstone: Citadel World

**Effect:** Designate one planet as Citadel (AC 25, nearly invulnerable)

**Mechanics:**
```
Before Citadel:
- Homeworld: AC 17 (13 base + 4 Fortress bonus)
- Vulnerable to concentrated attacks

After Citadel:
- Chosen planet: AC 25 (13 base + 12 Citadel bonus)
- Requires roll of 20+ to hit with most units
- Functionally invulnerable to standard attacks

Example:
Enemy War Machine Cruiser (+2 STR doctrine)
Attack bonus: +7 (BAB +5 + STR +2)
Roll: d20+7 vs AC 25
Needs: 18+ on die (15% hit chance)

Enemy War Machine Dreadnought (+5 STR)
Attack bonus: +11 (BAB +6 + STR +5)
Roll: d20+11 vs AC 25
Needs: 14+ on die (35% hit chance)
```

**Strategic Value:**
- Guaranteed safe fallback position
- Cannot lose through direct assault
- Economic production fully protected
- Forces enemies to conquer other planets first
- Psychological deterrent (invincible homeworld)

**Limitations:**
- Only ONE planet becomes Citadel
- Other planets remain vulnerable
- Enemies can isolate Citadel, conquer rest of empire
- Does not prevent economic strangulation (blockades)

**Public Announcement:**
```
┌─────────────────────────────────────────────────────────┐
│                 ⚠️ GALACTIC ALERT ⚠️                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  The Iron Collective has fortified                      │
│  CITADEL WORLD TECHNOLOGY!                              │
│                                                         │
│  Their homeworld is now an impregnable fortress.        │
│                                                         │
│  AC 25 - Nearly invulnerable to attack                  │
│                                                         │
│  They cannot be conquered by force alone.               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Bot Reactions:**
- War Machine bots abandon direct assault plans
- Shift to economic warfare (blockades, trade disruption)
- Diplomats offer permanent alliances (can't be beaten, join them)
- Schemers frame Citadel empire to other powers

#### 3.3.4 Commerce Capstone: Economic Hegemony

**Effect:** Generate 50% of #2 ranked empire's income automatically each turn

**Mechanics:**
```
Each Turn:
1. Calculate 2nd place empire's total income (all sources)
2. Your empire receives 50% of that income automatically
3. No maintenance cost, passive generation

Example:
Turn 65:
- 2nd place empire income: 50,000 credits/turn
- Your Economic Hegemony bonus: +25,000 credits/turn
- Your total income: (your planets) + 25,000 bonus

If 2nd place falls to 3rd:
- Now track new 2nd place empire
- Adjust bonus accordingly each turn
```

**Strategic Impact:**
- Massive economic advantage over time
- Snowballs as 2nd place grows (their growth benefits you)
- Can fund unlimited mercenaries (if Commerce + Mercenary Contracts)
- Enables rapid military expansion from economic base
- Forces economic victory unless stopped militarily

**Limitations:**
- No combat bonuses (still need military to win)
- If 2nd place empire is eliminated, bonus drops to 0 until new #2 emerges
- Enemies can target 2nd place to reduce your income

**Public Announcement:**
```
┌─────────────────────────────────────────────────────────┐
│                 ⚠️ GALACTIC ALERT ⚠️                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  The Golden Dominion has achieved                       │
│  ECONOMIC HEGEMONY!                                     │
│                                                         │
│  Their economy now siphons wealth from the              │
│  entire galaxy.                                         │
│                                                         │
│  +50% of 2nd place income (passive)                     │
│                                                         │
│  Economic victory is imminent unless stopped.           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Bot Reactions:**
- War Machine bots launch immediate military strikes (before wealth converts to military)
- Other Commerce bots see as existential threat (only one can win economically)
- Fortress bots fortify and turtle (can't compete economically)
- Coalitions form to economically isolate (embargo, trade blocks)

### 3.4 Information Visibility & Intelligence System

#### 3.4.1 Hybrid Visibility Model

Research information follows a hybrid model where some data is public (strategic) and some is hidden (tactical):

**PUBLIC Information (Always Visible):**
- ✅ Doctrine choices (Tier 1) - Announced Turn ~10
- ✅ Capstone unlocks (Tier 3) - Announced Turn ~60
- ✅ Number of research sectors owned (sector visibility)
- ✅ Galactic News rumors (50% accurate, every 10 turns)

**HIDDEN Information (Private):**
- 🔒 Current RP accumulation total
- 🔒 % progress toward next tier
- 🔒 Specialization choice (Tier 2)
- 🔒 Exact timing of capstone unlock

**REVEALED Through Gameplay:**
- ⚔️ Specialization effects experienced in combat (first use reveals)
- 🕵️ Espionage operations (Investigate Specialization, 5,000 cr, 85% success)
- 🤝 Alliance intel sharing (automatic with coalition members)
- 📰 Galactic News rumors (mix of true/false, 50% overall accuracy)

#### 3.4.2 Deduction & Estimation

Players can **estimate** enemy research progress from public information:

**Estimation Formula:**
```
Visible Research Sectors × 100 RP/turn × Turns Elapsed = Estimated RP

Example:
Enemy has 2 research sectors visible
Game is on Turn 40
Estimated RP: 2 × 100 × 40 = 8,000 RP

Conclusion:
- Likely has Tier 2 specialization (5,000 RP threshold passed)
- Progress toward Tier 3: 8,000 / 15,000 = 53%
- Estimated capstone unlock: Turn 75 (35 turns remaining)

Uncertainty:
- Don't know which specialization chosen
- Don't know exact RP (could have lost sectors recently)
- Don't know if they're banking RP or spending immediately
```

**Deduction Gameplay:**
```
You observe enemy has:
- 3 research sectors
- War Machine doctrine (public)
- Game is Turn 35

Estimate:
- 3 × 100 × 35 = 10,500 RP
- Definitely has Tier 2 specialization
- Options: Shock Troops OR Siege Engines
- Likely has one, but which?

Decision:
- Spend 5,000 cr to investigate? (85% success)
- Wait for combat reveal? (free but risky)
- Build Fortress Shield Arrays as counter to Shock Troops? (gamble)
```

#### 3.4.3 Investigate Specialization Operation

**New Espionage Operation:** Discover Specialization

**Cost:** 5,000 credits
**Target:** Any empire (must know doctrine first)
**Success Rate:** 85%
**Processing:** Phase 5 (Covert Operations) during turn resolution

**Success Result:**
```
INTEL REPORT
============
Target: Emperor Varkus
Doctrine: WAR MACHINE (public)
Specialization: SHOCK TROOPS (discovered)

Effect: First-strike capability in combat
- Attacks before initiative roll
- Surprise round damage

Counter Strategy:
- Fortress Shield Arrays (immunity to surprise)
- High AC defenders (reduce surprise round effectiveness)
- Economic: Avoid direct military confrontation

Last Updated: Turn 45
```

**Failure Result:**
```
INTEL REPORT
============
Target: Emperor Varkus
Doctrine: WAR MACHINE (public)
Specialization: UNKNOWN (investigation failed)

5,000 credits spent.
Operation detected by target.
Reputation with Emperor Varkus: -10

Recommendation: Try again next turn or wait for combat reveal.
```

**Cross-Reference:** See COVERT-OPS-SYSTEM.md for detailed espionage mechanics

#### 3.4.4 Alliance Intel Sharing

**Automatic Sharing with Coalition Members:**

When empire joins coalition, research intel is automatically shared:
- Your doctrine: Visible to allies (already public anyway)
- Your specialization: **Revealed to allies** (no longer secret)
- Your estimated RP progress: Shared based on sector counts
- Ally doctrines: Visible (public)
- Ally specializations: **Revealed to you** (coalition benefit)

**Coalition Intel Display:**
```
┌─────────────────────────────────────┐
│ COALITION INTEL SUMMARY             │
├─────────────────────────────────────┤
│ YOU: War Machine / Shock Troops     │
│ ALLY 1: Fortress / Shield Arrays    │
│ ALLY 2: Commerce / Trade Monopoly   │
│                                     │
│ Combined Strengths:                 │
│ • First-strike offense (you)        │
│ • Defense negates counters (Ally 1) │
│ • Economic support (Ally 2)         │
│                                     │
│ Suggested Coalition Strategy:       │
│ • You attack with Shock Troops      │
│ • Ally 1 defends with Shield Arrays │
│ • Ally 2 funds operations           │
│                                     │
│ Enemy Counters:                     │
│ • Siege Engines bypass shields      │
│ • Minefield Networks damage rushes  │
└─────────────────────────────────────┘
```

**Strategic Consideration:**
- Joining coalition reveals your specialization
- Tradeoff: Lose tactical surprise vs gain allied intel + coordination
- Schemers may lie about specialization before revealing (trust issues)

#### 3.4.5 Galactic News Rumor System

**Every 10 turns** (Turn 10, 20, 30, 40, etc.), Galactic News generates **5 rumors**:
- **3 TRUE rumors** (accurate information)
- **2 FALSE rumors** (misinformation, outdated, or lies)
- Players **cannot tell which are true** (50% accuracy overall)

**Rumor Types:**
- Doctrine choices (already public, serves as confirmations)
- Specialization speculation (50% accurate)
- Capstone progress estimates (50% accurate)
- Research sector sightings (usually true)

**Example Galactic News (Turn 40):**
```
┌─────────────────────────────────────────────────────────┐
│              GALACTIC NEWS NETWORK                      │
│                  Turn 40 Bulletin                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🔹 "Sources say Emperor Varkus deployed Shock Troops"  │
│    Status: TRUE (but players don't know)               │
│                                                         │
│ 🔹 "Reports indicate Lady Chen uses Shield Arrays"     │
│    Status: FALSE (she actually has Trade Monopoly)     │
│                                                         │
│ 🔹 "The Collective nears Dreadnought completion"       │
│    Status: TRUE (85% progress to Tier 3)               │
│                                                         │
│ 🔹 "Commander Zhen adopted Commerce doctrine"          │
│    Status: TRUE (already public, confirmation)         │
│                                                         │
│ 🔹 "Rumors suggest Admiral Kane has Siege Engines"     │
│    Status: FALSE (he actually has Shock Troops)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Player Decision-Making:**
- Do you trust the Varkus Shock Troops rumor?
  - If TRUE: Build Fortress Shield Arrays (hard counter)
  - If FALSE: Wasted research path
- Verify via espionage (5,000 cr)? Or gamble on rumor?
- Cross-reference with other intel sources (combat reports, alliance intel)

**Strategic Use:**
- Rumors provide free intel (but unreliable)
- Verify critical rumors before counter-picking
- False rumors can mislead entire galaxy (information warfare)

### 3.5 Combat Integration

#### 3.5.1 Applying Research Bonuses to Unit Stats

Research bonuses modify unit stat cards **before combat**:

**War Machine Doctrine (+2 STR):**
```
Original Fighter Card:
STR 10 (+0), DEX 14 (+2), CON 12 (+1)
Attack: +2 (BAB +0 + STR +0 + DEX +2)
Damage: 1d6+0
HP: 20

With War Machine:
STR 12 (+1), DEX 14 (+2), CON 12 (+1)
Attack: +3 (BAB +0 + STR +1 + DEX +2)
Damage: 1d6+1
HP: 20 (unchanged)
```

**Fortress Doctrine (+4 AC when defending):**
```
Original Station Card:
AC 13, HP 100, Attack +5, Damage 1d10+2

Defending Home Sector:
AC 17 (13 + 4 Fortress bonus)
HP 100, Attack +5, Damage 1d10+2

Attacking Enemy Sector:
AC 13 (no bonus when attacking)
HP 100, Attack +5, Damage 1d10+2
```

**Commerce Doctrine (+2 CHA):**
```
Original Commander:
CHA 12 (+1)

With Commerce:
CHA 14 (+2)

Diplomacy Check Example:
Propose alliance: d20+2 vs DC 15 (instead of d20+1)
```

#### 3.5.2 Specialization Combat Resolution

Specializations apply **during combat** based on conditions:

**Shock Troops (Surprise Round):**
```
Combat Phase 1: Pre-Initiative (Shock Troops only)
- Shock Troops units attack first
- Deal damage before enemy can respond
- No retaliation during surprise round

Combat Phase 2: Initiative
- Roll initiative normally (d20 + DEX)
- Proceed with normal combat rounds

Result: Shock Troops get 2 attacks before enemy gets 1
```

**Shield Arrays (Negate Surprise):**
```
Enemy attempts Shock Troops surprise round:
- Shield Arrays activate: "Energy shields online!"
- Surprise round is CANCELLED
- Proceed directly to initiative roll
- No free damage to enemy

Result: Shield Arrays neutralize Shock Troops advantage
```

**Minefield Networks (Pre-Combat Damage):**
```
Combat Phase 0: Pre-Combat (Minefield Networks only)
For each attacking unit:
- Roll CON save: d20 + CON mod vs DC 15
- Success: No damage
- Failure: Lose 10% current HP

Example:
Enemy Cruiser (100 HP, CON +2):
- Rolls: 11 + 2 = 13 vs DC 15 → FAIL
- Takes: 10 HP damage (10% of 100)
- Enters combat at 90 HP

Combat Phase 1: Initiative
- Roll initiative
- Enemy fights at reduced HP
```

**Siege Engines (Station AC Reduction):**
```
Your Siege Cruiser attacks enemy Defense Platform:

Normal:
- Platform AC: 19 (15 base + 4 Fortress bonus)
- Your attack: d20+7 vs AC 19
- Need: 12+ to hit (45% chance)

With Siege Engines:
- Platform AC: 10 (armor bonuses ignored)
- Your attack: d20+9 vs AC 10
- Need: 1+ to hit (95% chance, only crit fail misses)
- Damage: 2d8+5 (+2 Siege bonus)
```

**Mercenary Contracts (Hired STR Boost):**
```
Before Critical Battle:
- Decision: Hire mercenaries? (Y/N)
- Cost: 10,000 credits

If Hired (Y):
- All units gain +2 STR for this battle only
- Commerce Cruiser: STR 14 → STR 16
- Damage: 2d8+2 → 2d8+3

After Battle:
- Effect expires (win or lose)
- Must pay 10,000 cr again for next battle
```

#### 3.5.3 Full Combat Example

**Scenario:** War Machine (Shock Troops) vs Fortress (Shield Arrays)

**Setup:**
```
Attacker: Emperor Varkus (War Machine + Shock Troops)
- Doctrine: War Machine (+2 STR to all units)
- Specialization: Shock Troops (surprise round)
- Fleet: 3 Cruisers (STR 16, +3 mod each)

Defender: Commander Aria (Fortress + Shield Arrays)
- Doctrine: Fortress (+4 AC when defending)
- Specialization: Shield Arrays (negate surprise)
- Fleet: 2 Stations (AC 17 when defending)
```

**Combat Resolution:**
```
PHASE 0: Surprise Round Attempt
Varkus: "Shock Troops, attack!"
Aria: "Shield Arrays online! Surprise negated!"
Result: No surprise round (Shield Arrays blocked)

PHASE 1: Initiative
Roll: Varkus 14, Aria 12
Varkus goes first

PHASE 2: Round 1
Varkus Cruiser 1 attacks Aria Station 1:
- Attack: d20+8 (BAB +5 + STR +3) vs AC 17
- Roll: 15 + 8 = 23 → HIT
- Damage: 2d8+3 = 11 damage
- Station 1: 100 HP → 89 HP

Varkus Cruiser 2 attacks Aria Station 1:
- Attack: d20+8 vs AC 17
- Roll: 9 + 8 = 17 → HIT (exactly)
- Damage: 2d8+3 = 9 damage
- Station 1: 89 HP → 80 HP

Varkus Cruiser 3 attacks Aria Station 2:
- Attack: d20+8 vs AC 17
- Roll: 6 + 8 = 14 → MISS

Aria Station 1 attacks Varkus Cruiser 1:
- Attack: d20+5 vs AC 15
- Roll: 14 + 5 = 19 → HIT
- Damage: 1d10+2 = 8 damage
- Cruiser 1: 80 HP → 72 HP

Aria Station 2 attacks Varkus Cruiser 2:
- Attack: d20+5 vs AC 15
- Roll: 11 + 5 = 16 → HIT
- Damage: 1d10+2 = 10 damage
- Cruiser 2: 80 HP → 70 HP

RESULT:
War Machine still has offensive advantage (+2 STR)
But Shield Arrays prevented surprise round (saved ~20 HP damage)
Combat continues...
```

---

## 4. Bot Integration

### 4.1 Archetype Research Preferences

| Archetype | Preferred Doctrine | Preferred Specialization | Reasoning |
|-----------|-------------------|-------------------------|-----------|
| **Warlord** | War Machine (90%) | Shock Troops (70%) | Offensive playstyle, first-strike fits aggression |
| **Blitzkrieg** | War Machine (95%) | Shock Troops (85%) | Early rush benefits from surprise attacks |
| **Turtle** | Fortress (95%) | Shield Arrays (80%) | Defensive, negates enemy first-strikes |
| **Diplomat** | Fortress (70%) | Minefield Networks (60%) | Defensive but warns attackers (deterrent) |
| **Merchant** | Commerce (95%) | Trade Monopoly (90%) | Economic focus, maximizes trade income |
| **Tech Rush** | Commerce (80%) | Trade Monopoly (70%) | Economic funds rapid research |
| **Schemer** | Commerce (60%) | Mercenary Contracts (75%) | Flexible, buys military power when needed |
| **Opportunist** | (Copies strongest neighbor) | (Copies neighbor) | Mimics successful strategies |

**Note:** Percentages indicate probability of choosing that option. 20% variance allows for counter-picking and diversity.

### 4.2 Bot Decision Logic

**Tier 1: Doctrine Selection (Turn ~10)**

```typescript
function chooseDoctrine(bot: Empire, gameState: GameState): Doctrine {
  // 80% follow archetype preference
  if (Math.random() < 0.8) {
    return bot.archetype.preferredDoctrine;
  }

  // 20% counter-pick based on neighbors
  const neighborDoctrines = getNeighborDoctrines(bot, gameState);

  // If surrounded by War Machine, choose Fortress
  const warMachineCount = neighborDoctrines.filter(d => d === 'war_machine').length;
  if (warMachineCount >= 3) {
    return 'fortress'; // Defensive counter
  }

  // If surrounded by Fortress, choose War Machine
  const fortressCount = neighborDoctrines.filter(d => d === 'fortress').length;
  if (fortressCount >= 3) {
    return 'war_machine'; // Break through defenses
  }

  // Default to archetype preference
  return bot.archetype.preferredDoctrine;
}
```

**Tier 2: Specialization Selection (Turn ~30)**

```typescript
function chooseSpecialization(bot: Empire, gameState: GameState): Specialization {
  const doctrine = bot.researchDoctrine;
  const options = getSpecializationOptions(doctrine);

  // Strategic bots analyze threats
  if (bot.tier === 'strategic' || bot.tier === 'elite') {
    const threats = analyzeThreatLevel(bot, gameState);

    // High threat + Fortress → Shield Arrays (defensive priority)
    if (threats.high && doctrine === 'fortress') {
      return 'shield_arrays';
    }

    // Low threat + War Machine → Siege Engines (economic targets)
    if (!threats.high && doctrine === 'war_machine') {
      return 'siege_engines'; // Target stations/platforms
    }

    // Intel-based counter-picking
    const knownEnemySpecs = getKnownEnemySpecializations(bot, gameState);
    if (knownEnemySpecs.includes('shock_troops')) {
      if (doctrine === 'fortress') {
        return 'shield_arrays'; // Hard counter
      }
    }
  }

  // Simple/Random bots follow archetype preference
  return bot.archetype.preferredSpecialization;
}
```

**Espionage Operations (Investigate Specialization)**

```typescript
function shouldInvestigateSpecialization(bot: Empire, target: Empire): boolean {
  // Schemers always investigate threats
  if (bot.archetype === 'Schemer' && target.militaryPower > bot.militaryPower * 1.5) {
    return true; // High priority intel
  }

  // Strategic bots investigate before major battles
  if (bot.tier === 'strategic') {
    const planningAttack = bot.isPlannedTarget(target);
    if (planningAttack && !bot.knowsSpecialization(target)) {
      return true; // Know enemy before engaging
    }
  }

  // Opportunists investigate when cheap (> 10,000 credits available)
  if (bot.archetype === 'Opportunist' && bot.credits > 10000) {
    return Math.random() < 0.3; // 30% chance if affordable
  }

  // Default: Don't spend credits on intel
  return false;
}
```

### 4.3 Bot Messaging

**Tier 1: Doctrine Selection Announcements**

```
[Warlord] "My factories now produce weapons of conquest. Tremble."

[Blitzkrieg] "Speed and surprise. You won't see me coming."

[Turtle] "My borders are sealed. Come if you dare."

[Diplomat] "My defenses ensure peace. Attack and you'll regret it."

[Merchant] "While you play soldier, I build an empire of gold."

[Tech Rush] "Knowledge is power. I choose knowledge."

[Schemer] "I've chosen my path. You'll discover what that means... eventually."

[Opportunist] "I see [Neighbor] chose [Doctrine]. Interesting choice. I'll take that too."
```

**Tier 2: Specialization Hints (30% reveal, 70% cryptic)**

**30% Direct Reveal:**
```
[War Machine + Shock Troops]:
"My soldiers strike before you can blink."

[Fortress + Shield Arrays]:
"My shield generators are operational. First-strikes won't work."

[Commerce + Trade Monopoly]:
"My trade empire spans the galaxy. Every transaction enriches me."
```

**70% Cryptic (Hidden Intent):**
```
[War Machine + Siege Engines]:
"I've installed new artillery systems. Walls won't save you."

[Fortress + Minefield Networks]:
"I've prepared a warm welcome for attackers. Very warm."

[Commerce + Mercenary Contracts]:
"Credits buy loyalty. Loyalty buys... options."
```

**Tier 3: Capstone Unlock (Dramatic)**

```
[War Machine → Dreadnought]:
"Behold the INEVITABLE. My dreadnought has awakened.
 Choose your last words carefully."

[Fortress → Citadel World]:
"My homeworld is now eternal. You cannot touch it.
 But I can still reach you."

[Commerce → Economic Hegemony]:
"Your economy flows into mine like water downhill.
 Resistance is... unprofitable."
```

**Reactions to Player Research:**

**When player unlocks Dreadnought:**
```
[Nearby Warlord]:
"A Dreadnought? Impressive. But can you build a second
 before I destroy the first?"

[Distant Diplomat]:
"Congratulations on your achievement. Now please
 don't use it on anyone we care about."

[Schemer]:
"Dreadnought noted. I'll adjust my calculations accordingly.
 [Begins covert op to steal military plans]"

[Turtle]:
*Immediately builds 10 defense platforms*
"Let them come. We are ready."
```

**When player unlocks Citadel World:**
```
[War Machine Bot]:
"An invulnerable fortress? How... inconvenient.
 Perhaps I'll conquer everything else instead."

[Commerce Bot]:
"Your Citadel is impressive. But can it feed your people
 when I control all trade routes?"
```

**When enemy specialization revealed in combat:**
```
[After experiencing Shock Troops]:
"So THAT'S how you did it. First-strike. Clever.
 I'll be ready next time."

[After Shield Arrays blocks surprise]:
"My surprise attack failed? Shield Arrays? Damn.
 They were prepared."
```

### 4.4 Bot Reactions to Galactic News Rumors

**Analyzing Rumors:**

```typescript
function botReactToRumor(bot: Empire, rumor: Rumor): BotAction {
  // Strategic bots verify rumors via espionage
  if (bot.tier === 'strategic') {
    if (rumor.isAboutThreat(bot)) {
      return investigateTarget(rumor.subject); // Spend 5k to verify
    }
  }

  // Schemer bots spread counter-rumors (information warfare)
  if (bot.archetype === 'Schemer') {
    if (rumor.isAboutSelf(bot) && rumor.isAccurate) {
      return spreadFalseRumor(bot); // Misinformation campaign
    }
  }

  // Simple bots trust rumors at face value
  if (bot.tier === 'simple' || bot.tier === 'random') {
    if (rumor.says('shock_troops')) {
      return buildCounterUnit('shield_arrays'); // Gullible response
    }
  }

  return null; // Ignore rumor
}
```

**Messaging about Rumors:**

```
[Schemer reads rumor about self]:
"The Galactic News is spreading lies about me again.
 I assure you, I have no such capabilities. [Wink]"

[Diplomat reads accurate rumor]:
"The reports are true. I have chosen Shield Arrays.
 I believe in transparency."

[Warlord reads false rumor]:
"They say I have Siege Engines? Idiots.
 I'll show them what I really have. [Has Shock Troops]"
```

---

## 5. UI/UX Design

### 5.1 UI Mockups

#### 5.1.1 Research Panel (Your Empire)

```
┌─────────────────────────────────────────────────────────┐
│ RESEARCH COMMAND                    [3,247 / 5,000 RP]  │
│                                                         │
│ Progress: ███████████░░░░░ 65% to Tier 2               │
├─────────────────────────────────────────────────────────┤
│ Doctrine: FORTRESS (PUBLIC) 🛡️                          │
│ Bonuses: +4 AC when defending home sectors             │
│                                                         │
│ Specialization: Shield Arrays (HIDDEN FROM ENEMIES) 🔒  │
│ Effect: Immunity to surprise rounds                     │
│ Status: ⚠️ Enemies don't know your specialization       │
│                                                         │
│ Tier 3 Progress: ░░░░░░░░░░ 0% (11,753 RP needed)      │
│ Capstone: Citadel World (Turn ~110 estimated)          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Intel Operations Available:                             │
│ • Investigate Enemy Specialization (5,000 cr)           │
│ • View Galactic News Rumors (free, 50% accuracy)        │
│ • Share Intel with Coalition (automatic if allied)      │
└─────────────────────────────────────────────────────────┘
```

#### 5.1.2 Doctrine Selection Screen (Turn ~10)

```
┌─────────────────────────────────────────────────────────┐
│ RESEARCH COMMAND                    [1,247 / 1,000 RP]  │
│                                                         │
│ ⚡ DOCTRINE SELECTION AVAILABLE - Choose Your Path       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ WAR MACHINE  │  │   FORTRESS   │  │   COMMERCE   │  │
│  │              │  │              │  │              │  │
│  │   +2 STR     │  │  +4 AC (def) │  │   +2 CHA     │  │
│  │ -10% Income  │  │ -5% Attack   │  │ +20% Prices  │  │
│  │              │  │              │  │              │  │
│  │ Unlocks:     │  │ Unlocks:     │  │ Unlocks:     │  │
│  │ • Heavy      │  │ • Defense    │  │ • Trade      │  │
│  │   Cruisers   │  │   Platforms  │  │   Fleets     │  │
│  │ • Offensive  │  │ • Defensive  │  │ • Economic   │  │
│  │   Specs      │  │   Specs      │  │   Specs      │  │
│  │              │  │              │  │              │  │
│  │   [SELECT]   │  │   [SELECT]   │  │   [SELECT]   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ⚠️ This choice is permanent and PUBLIC                 │
│  ⚠️ Galaxy-wide announcement will reveal your doctrine  │
│  ⚠️ Unlocks 2 specializations (choose 1 at Tier 2)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5.1.3 Intel Display (Enemy Empire - Before Investigation)

```
┌─────────────────────────────────────────────────────────┐
│ EMPEROR VARKUS (Rank 3)                                 │
│ Warlord · Hostile                                       │
├─────────────────────────────────────────────────────────┤
│ Doctrine: WAR MACHINE ⚔️                  (PUBLIC)       │
│ Bonuses: +2 STR to all units                            │
│                                                         │
│ Specialization: ??? [INVESTIGATE - 5,000 cr]            │
│ Options: • Shock Troops (surprise round)                │
│          • Siege Engines (+50% vs stations)             │
│                                                         │
│ Tier 3: Unknown Progress                                │
│ Capstone: Dreadnought (if reached)                      │
│                                                         │
│ Research Sectors: 2 visible                             │
│ Est. RP/turn: ~200                                      │
│ Est. Current RP: ~8,000 (Turn 40)                       │
│ Likely has: Tier 2 specialization                      │
│                                                         │
│ Galactic News Rumors:                                   │
│ • "Varkus may have Shock Troops" (Turn 40)             │
│   Reliability: Unknown (50% accuracy)                   │
│                                                         │
│ [INVESTIGATE SPEC - 5,000 cr] [VIEW GALACTIC NEWS]      │
└─────────────────────────────────────────────────────────┘
```

#### 5.1.4 Intel Display (After Espionage Operation)

```
┌─────────────────────────────────────────────────────────┐
│ EMPEROR VARKUS (Rank 3)                                 │
│ Warlord · Hostile                                       │
├─────────────────────────────────────────────────────────┤
│ Doctrine: WAR MACHINE ⚔️                  (PUBLIC)       │
│ Bonuses: +2 STR to all units                            │
│                                                         │
│ Specialization: SHOCK TROOPS ⚡          (DISCOVERED)    │
│ Effect: First-strike capability in combat               │
│                                                         │
│ ═══ INTEL REPORT (Turn 45) ═══                          │
│ Threat Assessment: HIGH                                 │
│ • Shock Troops allows surprise attacks                  │
│ • Combined with +2 STR, first strike hits hard          │
│ • Average 20-30 HP damage before you can respond        │
│                                                         │
│ Counter Strategy:                                       │
│ ✓ Fortress Shield Arrays (negates surprise)             │
│ ✓ High AC defenders (reduce surprise effectiveness)     │
│ ✓ Economic tactics (avoid direct confrontation)         │
│                                                         │
│ Intelligence Source: Espionage Operation                │
│ Last Updated: Turn 45                                   │
│ Cost: 5,000 credits                                     │
│                                                         │
│ [UPDATE INTEL - 5,000 cr] [SHARE WITH COALITION]        │
└─────────────────────────────────────────────────────────┘
```

#### 5.1.5 Galactic News Panel

```
┌─────────────────────────────────────────────────────────┐
│ GALACTIC NEWS NETWORK - Turn 40 Bulletin                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🔹 "Sources say Emperor Varkus deployed Shock Troops"   │
│    Subject: Emperor Varkus (Rank 3, Warlord)            │
│    Type: Specialization rumor                           │
│    Reliability: Unknown                                 │
│    [INVESTIGATE - 5,000 cr to verify]                   │
│                                                         │
│ 🔹 "Reports indicate Lady Chen uses Shield Arrays"      │
│    Subject: Lady Chen (Rank 7, Turtle)                  │
│    Type: Specialization rumor                           │
│    Reliability: Unknown                                 │
│    [INVESTIGATE - 5,000 cr to verify]                   │
│                                                         │
│ 🔹 "The Collective nears Dreadnought completion"        │
│    Subject: The Collective (Rank 1, Tech Rush)          │
│    Type: Capstone progress rumor                        │
│    Reliability: Unknown                                 │
│    [VIEW DETAILS]                                       │
│                                                         │
│ 🔹 "Commander Zhen adopted Commerce doctrine"           │
│    Subject: Commander Zhen (Rank 12, Merchant)          │
│    Type: Doctrine confirmation (already public)         │
│    Reliability: Confirmed                               │
│                                                         │
│ 🔹 "Rumors suggest Admiral Kane has Siege Engines"      │
│    Subject: Admiral Kane (Rank 5, Blitzkrieg)           │
│    Type: Specialization rumor                           │
│    Reliability: Unknown                                 │
│    [INVESTIGATE - 5,000 cr to verify]                   │
│                                                         │
│ ⚠️ Galactic News has ~50% accuracy. Verify critical     │
│    intelligence via espionage before making decisions.  │
│                                                         │
│ Next Bulletin: Turn 50                                  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 User Flows

#### 5.2.1 Selecting a Doctrine (Turn ~10)

```
1. Player accumulates 1,000 RP (research sectors × 100 RP/turn × turns)
2. Notification appears: "Doctrine Selection Available!"
3. Player clicks notification or navigates to Research Panel
4. Doctrine Selection Screen opens with 3 options:
   - War Machine (+2 STR, -10% income)
   - Fortress (+4 AC defending, -5% attack)
   - Commerce (+2 CHA, +20% sell prices)
5. Player reviews each doctrine:
   - Hover for detailed tooltips
   - View unlocked specializations preview
   - Check economic penalties
6. Player clicks [SELECT] on chosen doctrine
7. Confirmation modal: "Select [Doctrine]? This choice is permanent and public."
8. Player confirms
9. Doctrine applied immediately:
   - All unit stat cards updated (+2 STR, +4 AC, or +2 CHA)
   - Economic modifiers applied to planets
   - Unlocked units become buildable
10. Galaxy-wide announcement displays to all empires
11. Bot reactions triggered (messages, strategic adjustments)
```

#### 5.2.2 Investigating Enemy Specialization

```
1. Player views enemy empire intel card
2. Sees: "Specialization: ??? [INVESTIGATE - 5,000 cr]"
3. Player clicks [INVESTIGATE]
4. Confirmation modal:
   "Investigate Emperor Varkus's specialization?
    Cost: 5,000 credits
    Success Rate: 85%
    Failure: Credits lost, no information gained"
5. Player confirms
6. Credits deducted: 5,000 cr
7. Operation queued for Phase 5 (Covert Operations)
8. Turn advances
9. Phase 5 resolves:
   - Roll d100 vs 85% threshold
   - If success (85%):
     a. Specialization revealed
     b. Intel Report generated
     c. Counter recommendations provided
   - If failure (15%):
     a. Operation failed message
     b. Reputation -10 with target (detected)
10. Player receives notification: "Intel Report Available"
11. Player views updated enemy intel card with revealed specialization
```

#### 5.2.3 Using Research Bonuses in Combat

```
1. Player initiates attack on enemy sector
2. Combat initiator confirms attack
3. Combat system loads:
   - Player units with research bonuses applied
   - Enemy units with their research bonuses applied
4. Research modifiers applied pre-combat:
   - War Machine: +2 STR to player unit stat cards
   - Fortress (if defending): +4 AC to defender unit stat cards
   - Minefield Networks (if defending): CON saves for attackers
5. Combat phases execute:

   Phase 0 (Specializations):
   - If attacker has Shock Troops: Surprise round (unless Shield Arrays)
   - If defender has Minefield Networks: Attackers roll CON saves

   Phase 1 (Initiative):
   - Roll d20 + DEX for both sides
   - Higher initiative acts first

   Phase 2+ (Combat Rounds):
   - Units attack with research bonuses applied
   - War Machine units deal +STR damage
   - Fortress units have higher AC when defending
   - Siege Engines ignore station AC bonuses
   - Mercenary Contracts (if hired) add +2 STR

6. Combat resolves to victory/defeat
7. If enemy specialization was unknown:
   - First use reveals it: "Enemy used [Specialization]!"
   - Intel card updated automatically
8. Combat report shows research bonuses applied
```

### 5.3 Visual Design Principles

**LCARS Aesthetic Integration:**

**Color Coding:**
- **Orange:** War Machine doctrine panels (aggressive theme)
- **Blue:** Fortress doctrine panels (defensive theme)
- **Green:** Commerce doctrine panels (economic theme)
- **Violet:** Hidden information (specializations, progress %)
- **Red:** Warnings (permanent choices, detection risks)

**Research Progress Bars:**
- Smooth gradient fills (0-100%)
- Glow effect at threshold milestones (1,000 RP, 5,000 RP, 15,000 RP)
- Color shifts at thresholds: Blue (0-33%), Yellow (34-66%), Green (67-99%), Gold (100%)

**Doctrine Icons:**
- **War Machine:** Crossed swords ⚔️
- **Fortress:** Shield 🛡️
- **Commerce:** Scales/Trade ⚖️

**Specialization Reveal Animation:**
```
Hidden State:
┌──────────┐
│   ???    │  (pulsing question marks)
└──────────┘

Revealing (0.5s fade):
┌──────────┐
│ SHOCK... │  (text fading in)
└──────────┘

Revealed State:
┌──────────┐
│ SHOCK    │  (static, with icon ⚡)
│ TROOPS   │
└──────────┘
```

**Capstone Announcement (Full-Screen Overlay):**
```
Dramatic entrance animation:
1. Screen dims to 50% opacity
2. Galaxy map blurs in background
3. Announcement panel slides in from top (1s)
4. Text types in letter-by-letter (0.5s)
5. Dramatic sound effect (ominous for Dreadnought, triumphant for others)
6. Bot reaction messages scroll in (2s)
7. [ACKNOWLEDGE] button appears
8. Click to dismiss, return to game

Example:
┌═════════════════════════════════════════════════════════┐
║                ⚠️ GALACTIC ALERT ⚠️                     ║
╠═════════════════════════════════════════════════════════╣
║                                                         ║
║  The Crimson Admiral has achieved                       ║
║  DREADNOUGHT TECHNOLOGY!                                ║
║                                                         ║
║  [Dreadnought Icon - rotating 3D model placeholder]     ║
║                                                         ║
║  STR 20 (+5), HP 200, Damage: 4d12+5                    ║
║                                                         ║
║  All empires must decide: Attack now or never.          ║
║                                                         ║
║                  [ACKNOWLEDGE]                          ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
```

**Intel Panel Hover States:**
- **Known Info:** Solid color, no hover effect
- **Hidden Info (???):** Pulsing violet glow on hover
- **Investigate Button:** Orange glow on hover + cost tooltip

**Research Sector Visualization:**
- Research sectors glow on starmap with blue pulse effect
- Intensity increases with RP production (brighter = more sectors)
- Tooltip shows: "2 Research Sectors: +200 RP/turn"

---

## 6. Specifications

This section contains formal requirements for spec-driven development. Each specification has a unique ID for traceability, links to code and tests, and can be validated independently.

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |
| **Deprecated** | Superseded by another spec |

---

### REQ-RSCH-001: Three-Tier Research Structure (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-001-A through REQ-RSCH-001-C.

---

### REQ-RSCH-001-A: Doctrine Tier (Tier 1)

**Description:** First tier of research unlocks at 1,000 RP (~Turn 10). Player chooses 1 of 3 doctrines (War Machine, Fortress, Commerce). Choice is permanent and publicly announced galaxy-wide.

**Rationale:** Establishes early strategic direction and creates diplomatic consequences through public visibility.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock threshold | 1,000 RP | First tier unlock |
| Expected timing | Turn ~10 | With 1 research sector producing 100 RP/turn |
| Doctrine count | 3 options | War Machine, Fortress, Commerce |
| Visibility | Public | Galaxy-wide announcement |
| Permanence | Permanent | Cannot be changed once selected |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.1 - Three-Tier Draft Structure

**Code:**
- `src/lib/game/services/research-service.ts` - ResearchService class
- `src/lib/game/research/tier-system.ts` - Tier 1 threshold logic

**Tests:**
- `src/lib/game/__tests__/research-service.test.ts` - Test doctrine tier unlocks at 1,000 RP

**Status:** Draft

---

### REQ-RSCH-001-B: Specialization Tier (Tier 2)

**Description:** Second tier of research unlocks at 5,000 RP (~Turn 30). Player chooses 1 of 2 specializations based on their doctrine. Choice remains hidden until revealed through combat, espionage, alliance sharing, or galactic rumors.

**Rationale:** Creates information asymmetry and tactical surprise. Rewards intelligence gathering and deduction gameplay.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock threshold | 5,000 RP | Second tier unlock |
| Expected timing | Turn ~30 | Mid-game decision point |
| Specialization count | 2 options | Per doctrine (6 total specializations) |
| Visibility | Hidden | Until revealed through specific conditions |
| Permanence | Permanent | Cannot be changed once selected |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.1 - Three-Tier Draft Structure

**Code:**
- `src/lib/game/services/research-service.ts` - ResearchService class
- `src/lib/game/research/tier-system.ts` - Tier 2 threshold logic
- `src/lib/intel/specialization-reveal.ts` - Hidden specialization reveal logic

**Tests:**
- `src/lib/game/__tests__/research-service.test.ts` - Test specialization tier unlocks at 5,000 RP
- `src/lib/intel/__tests__/specialization-reveal.test.ts` - Test reveal conditions

**Status:** Draft

---

### REQ-RSCH-001-C: Capstone Tier (Tier 3)

**Description:** Third tier of research automatically unlocks at 15,000 RP (~Turn 60). Capstone is automatically granted based on player's doctrine choice. Unlock triggers galaxy-wide announcement.

**Rationale:** Provides late-game strategic escalation and creates game-ending power spikes. Automatic grant based on doctrine ensures capstone aligns with player's strategic identity.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock threshold | 15,000 RP | Third tier unlock |
| Expected timing | Turn ~60 | Late-game power spike |
| Capstone count | 3 options | One per doctrine, automatically granted |
| Selection method | Automatic | Based on doctrine choice |
| Visibility | Galaxy-wide | Announcement to all players |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.1 - Three-Tier Draft Structure

**Code:**
- `src/lib/game/services/research-service.ts` - ResearchService class
- `src/lib/game/research/tier-system.ts` - Tier 3 threshold logic

**Tests:**
- `src/lib/game/__tests__/research-service.test.ts` - Test capstone tier unlocks at 15,000 RP

**Status:** Draft

---

### REQ-RSCH-002: Doctrine System (Tier 1) (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-002-A through REQ-RSCH-002-C.

---

### REQ-RSCH-002-A: War Machine Doctrine

**Description:** Offensive doctrine providing +2 STR to all units and -10% planet income penalty. Unlocks Heavy Cruisers and offensive specializations (Shock Troops, Siege Engines). Choice is permanent, public (announced galaxy-wide), and unlocks at 1,000 RP.

**Rationale:** Establishes aggressive military strategy with unit power focus. Income penalty creates strategic trade-off.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| STR bonus | +2 | Applies to all military units |
| Income penalty | -10% | All planet production |
| Unlocked unit | Heavy Cruisers | Offensive capital ship |
| Unlocked specializations | Shock Troops, Siege Engines | Tier 2 choices |
| Unlock threshold | 1,000 RP | ~Turn 10 with 1 research sector |
| Visibility | Public | Galaxy-wide announcement |
| Permanence | Permanent | Cannot be changed once selected |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Tier 1: Doctrine System

**Code:**
- `src/lib/game/services/research-service.ts:selectDoctrine` - Doctrine selection
- `src/lib/combat/research-bonuses.ts:applyDoctrineBonus` - STR bonus application
- `src/lib/economy/income-calculator.ts` - Income penalty calculation

**Tests:**
- `src/lib/game/__tests__/doctrine-selection.test.ts` - Test War Machine selection
- `src/lib/combat/__tests__/doctrine-combat.test.ts` - Test STR bonus in combat

**Status:** Draft

---

### REQ-RSCH-002-B: Fortress Doctrine

**Description:** Defensive doctrine providing +4 AC when defending and -5% attack power penalty. Unlocks Defense Platforms and defensive specializations (Shield Arrays, Minefield Networks). Choice is permanent, public (announced galaxy-wide), and unlocks at 1,000 RP.

**Rationale:** Establishes defensive strategy with significant armor bonuses. Attack penalty creates strategic trade-off.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| AC bonus | +4 | Defending only (not when attacking) |
| Attack penalty | -5% | When initiating attacks |
| Unlocked unit | Defense Platforms | Defensive structure |
| Unlocked specializations | Shield Arrays, Minefield Networks | Tier 2 choices |
| Unlock threshold | 1,000 RP | ~Turn 10 with 1 research sector |
| Visibility | Public | Galaxy-wide announcement |
| Permanence | Permanent | Cannot be changed once selected |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Tier 1: Doctrine System

**Code:**
- `src/lib/game/services/research-service.ts:selectDoctrine` - Doctrine selection
- `src/lib/combat/research-bonuses.ts:applyDoctrineBonus` - AC bonus application (defending only)
- `src/lib/combat/attack-calculator.ts` - Attack penalty calculation

**Tests:**
- `src/lib/game/__tests__/doctrine-selection.test.ts` - Test Fortress selection
- `src/lib/combat/__tests__/doctrine-combat.test.ts` - Test AC bonus when defending

**Status:** Draft

---

### REQ-RSCH-002-C: Commerce Doctrine

**Description:** Economic doctrine providing +2 CHA to commander and +20% market sell prices. Unlocks Trade Fleets and economic specializations (Trade Monopoly, Mercenary Contracts). Choice is permanent, public (announced galaxy-wide), and unlocks at 1,000 RP.

**Rationale:** Establishes economic strategy with diplomacy and trade focus. Creates asymmetric gameplay through economic advantages rather than military bonuses.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| CHA bonus | +2 | Commander diplomacy stat |
| Market sell bonus | +20% | All market transactions |
| Unlocked unit | Trade Fleets | Economic support ship |
| Unlocked specializations | Trade Monopoly, Mercenary Contracts | Tier 2 choices |
| Unlock threshold | 1,000 RP | ~Turn 10 with 1 research sector |
| Visibility | Public | Galaxy-wide announcement |
| Permanence | Permanent | Cannot be changed once selected |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1 - Tier 1: Doctrine System

**Code:**
- `src/lib/game/services/research-service.ts:selectDoctrine` - Doctrine selection
- `src/lib/economy/market-service.ts` - Market sell price bonus
- `src/lib/diplomacy/commander-stats.ts` - CHA bonus calculation

**Tests:**
- `src/lib/game/__tests__/doctrine-selection.test.ts` - Test Commerce selection
- `src/lib/economy/__tests__/market-bonuses.test.ts` - Test sell price bonus

**Status:** Draft

---

### REQ-RSCH-003: Specialization System Overview (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-003-A through REQ-RSCH-003-F for individual specialization definitions.

**Description:** Tier 2 research system providing hidden specializations with focused tactical bonuses. Each doctrine offers 2 specializations (player picks 1). Choices remain hidden until revealed through combat (first use), espionage (5,000 cr, 85% success), alliance sharing, or galactic news rumors (50% accuracy).

**Reveal Mechanics:**
- Combat: Revealed on first use
- Espionage: 5,000 cr cost, 85% success rate
- Alliance sharing: Automatic reveal to allies
- Galactic news rumors: 50% accuracy

**Rationale:** Creates information asymmetry and tactical surprise. Rewards intelligence gathering and creates deduction gameplay.

**Source:** Section 3.2

**Code:**
- `src/lib/game/services/research-service.ts:selectSpecialization` - Specialization selection (hidden)
- `src/lib/intel/specialization-reveal.ts` - Reveal logic (combat, espionage)

**Tests:**
- `src/lib/intel/__tests__/specialization-reveal.test.ts` - Test reveal conditions

**Status:** Draft

---

### REQ-RSCH-003-A: Shock Troops Specialization

**Description:** War Machine Tier 2 specialization that grants a surprise round, allowing the player to attack before initiative roll.

**Doctrine:** War Machine

**Effect:** Surprise round (attack before initiative)

**Tactical Use:** Enables first strike capability, dealing damage before enemy can respond.

**Counter:** Shield Arrays (REQ-RSCH-003-C) provides immunity to surprise rounds.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:** `src/lib/combat/specialization-effects.ts:applyShockTroops`

**Tests:** `src/lib/combat/__tests__/shock-troops.test.ts`

**Status:** Draft

---

### REQ-RSCH-003-B: Siege Engines Specialization

**Description:** War Machine Tier 2 specialization that provides +50% damage bonus against stationary targets and ignores station armor class.

**Doctrine:** War Machine

**Effect:** +50% damage vs stationary targets (ignore station AC)

**Tactical Use:** Highly effective against defensive structures and stations, bypassing their armor protection.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:** `src/lib/combat/specialization-effects.ts:applySiegeEngines`

**Tests:** `src/lib/combat/__tests__/siege-engines.test.ts`

**Status:** Draft

---

### REQ-RSCH-003-C: Shield Arrays Specialization

**Description:** Fortress Tier 2 specialization that provides immunity to surprise rounds, directly countering Shock Troops.

**Doctrine:** Fortress

**Effect:** Immunity to surprise rounds (negates Shock Troops)

**Tactical Use:** Defensive counter to surprise attacks, ensuring initiative proceeds normally.

**Counters:** Shock Troops (REQ-RSCH-003-A)

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:** `src/lib/combat/specialization-effects.ts:applyShieldArrays`

**Tests:** `src/lib/combat/__tests__/shield-arrays.test.ts`

**Status:** Draft

---

### REQ-RSCH-003-D: Minefield Networks Specialization

**Description:** Fortress Tier 2 specialization that forces enemies to make a pre-combat CON save DC 15 or lose 10% HP before battle begins.

**Doctrine:** Fortress

**Effect:** Pre-combat CON save DC 15 or lose 10% HP

**Tactical Use:** Weakens attacking forces before combat begins, providing defensive attrition advantage.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:** `src/lib/combat/specialization-effects.ts:applyMinefieldNetworks`

**Tests:** `src/lib/combat/__tests__/minefield-networks.test.ts`

**Status:** Draft

---

### REQ-RSCH-003-E: Trade Monopoly Specialization

**Description:** Commerce Tier 2 specialization that provides market advantages: -20% buy cost and +30% sell price (economic transactions only).

**Doctrine:** Commerce

**Effect:** Buy -20%, sell +30% (economic only)

**Tactical Use:** Maximizes economic efficiency in market transactions, accelerating economic growth.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:** `src/lib/market/specialization-effects.ts:applyTradeMonopoly`

**Tests:** `src/lib/market/__tests__/trade-monopoly.test.ts`

**Status:** Draft

---

### REQ-RSCH-003-F: Mercenary Contracts Specialization

**Description:** Commerce Tier 2 specialization that allows hiring mercenaries for 10,000 cr to gain +2 STR bonus per battle.

**Doctrine:** Commerce

**Effect:** Pay 10,000 cr for +2 STR per battle

**Tactical Use:** Converts economic resources into temporary military advantage on demand.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:** `src/lib/combat/specialization-effects.ts:applyMercenaryContracts`

**Tests:** `src/lib/combat/__tests__/mercenary-contracts.test.ts`

**Status:** Draft

---

### REQ-RSCH-004: Capstone System (Tier 3) (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-004-A through REQ-RSCH-004-C.

---

### REQ-RSCH-004-A: Dreadnought Capstone (War Machine)

**Description:** War Machine capstone unlocks automatically at 15,000 RP (~Turn 60). Grants ability to build one Dreadnought super-unit per game (STR 20, HP 200, 4d12+5 damage, multi-attack). Costs 100,000 credits + 10 population. Triggers galaxy-wide announcement and bot reactions (coalitions form, preemptive strikes).

**Rationale:** Provides late-game offensive power spike. One-per-game limit prevents spam. High cost creates strategic decision point. Public announcement signals endgame phase.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock threshold | 15,000 RP | ~Turn 60 with 3 research sectors |
| Build limit | 1 per game | Cannot build multiple |
| STR | 20 (+5) | Highest in game |
| HP | 200 | Double cruiser HP (100) |
| Damage | 4d12+5 | Average 31 damage/hit |
| Cost | 100,000 cr + 10 pop | Major investment |
| Special ability | Multi-attack | Can attack multiple times per round |
| Visibility | Galaxy-wide | Announcement to all players |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.3 - Tier 3: Capstone System

**Code:**
- `src/lib/game/services/research-service.ts:unlockCapstone` - Auto-unlock logic
- `src/lib/units/dreadnought.ts` - Dreadnought unit definition

**Tests:**
- `src/lib/game/__tests__/capstone-unlock.test.ts` - Test Dreadnought unlock at 15k RP
- `src/lib/combat/__tests__/dreadnought.test.ts` - Test Dreadnought stats and abilities

**Status:** Draft

---

### REQ-RSCH-004-B: Citadel World Capstone (Fortress)

**Description:** Fortress capstone unlocks automatically at 15,000 RP (~Turn 60). Allows player to designate one planet as a Citadel World, granting it AC 25 (nearly invulnerable fortress). Triggers galaxy-wide announcement and bot reactions (coalitions form, preemptive strikes).

**Rationale:** Provides late-game defensive power spike. Near-invulnerability creates strategic anchor point. Public announcement signals endgame phase.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock threshold | 15,000 RP | ~Turn 60 with 3 research sectors |
| Citadel limit | 1 planet | Cannot designate multiple |
| AC bonus | AC 25 | Near-invulnerable (normal AC 10-15) |
| Permanence | Permanent | Cannot be changed once designated |
| Visibility | Galaxy-wide | Announcement to all players |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.3 - Tier 3: Capstone System

**Code:**
- `src/lib/game/services/research-service.ts:unlockCapstone` - Auto-unlock logic
- `src/lib/sectors/citadel-world.ts` - Citadel AC bonus application

**Tests:**
- `src/lib/game/__tests__/capstone-unlock.test.ts` - Test Citadel unlock at 15k RP
- `src/lib/sectors/__tests__/citadel-world.test.ts` - Test AC 25 application

**Status:** Draft

---

### REQ-RSCH-004-C: Economic Hegemony Capstone (Commerce)

**Description:** Commerce capstone unlocks automatically at 15,000 RP (~Turn 60). Grants passive income equal to 50% of the 2nd-place empire's income each turn. Triggers galaxy-wide announcement and bot reactions (coalitions form, preemptive strikes).

**Rationale:** Provides late-game economic power spike. Passive income creates snowball effect. Percentage-based ensures relevance regardless of game state. Public announcement signals endgame phase.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock threshold | 15,000 RP | ~Turn 60 with 3 research sectors |
| Income percentage | 50% | Of 2nd-place empire's income |
| Target empire | 2nd place | By networth ranking |
| Timing | Each turn | Passive income generation |
| Visibility | Galaxy-wide | Announcement to all players |

**Formula:**
```
Economic Hegemony Income = floor(2nd_place_empire_income × 0.5)
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.3 - Tier 3: Capstone System

**Code:**
- `src/lib/game/services/research-service.ts:unlockCapstone` - Auto-unlock logic
- `src/lib/economy/economic-hegemony.ts` - Passive income calculation

**Tests:**
- `src/lib/game/__tests__/capstone-unlock.test.ts` - Test Economic Hegemony unlock at 15k RP
- `src/lib/economy/__tests__/economic-hegemony.test.ts` - Test income siphoning calculation

**Status:** Draft

---

### REQ-RSCH-005: Research Point Economy (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-005-A through REQ-RSCH-005-C.

---

### REQ-RSCH-005-A: RP Generation Rate

**Description:** Research sectors generate 100 Research Points (RP) per turn. Generation occurs during Turn Processing Phase 4 (Resource Production).

**Rationale:** Simple flat rate creates predictable timing and makes research sector value clear. No diminishing returns encourages research investment.

**Formula:**
```
RP per turn = Research Sector Count × 100
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| RP per sector | 100 RP/turn | Flat rate, no diminishing returns |
| Processing timing | Phase 4 | Turn Processing (Resource Production) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.2 - Research Points (RP) Economy

**Code:**
- `src/lib/game/services/research-service.ts:processResearchProduction` - RP generation per turn

**Tests:**
- `src/lib/game/__tests__/rp-production.test.ts` - Test 100 RP/sector/turn generation

**Status:** Draft

---

### REQ-RSCH-005-B: RP Accumulation and Tier Thresholds

**Description:** RP accumulates toward tier thresholds: 1,000 RP (Tier 1 / Doctrine), 5,000 RP (Tier 2 / Specialization), 15,000 RP (Tier 3 / Capstone). Reaching threshold triggers draft choice event (player must select). No automatic advancement.

**Rationale:** Creates predictable milestone timing (~Turn 10/30/60 with 1/2/3 research sectors). Manual selection ensures player control over strategic choices.

**Key Values:**
| Parameter | Value | Expected Timing |
|-----------|-------|-----------------|
| Tier 1 threshold | 1,000 RP | ~Turn 10 with 1 research sector (100 RP/turn) |
| Tier 2 threshold | 5,000 RP | ~Turn 30 with 2 research sectors (200 RP/turn from Turn 10) |
| Tier 3 threshold | 15,000 RP | ~Turn 60 with 3 research sectors (300 RP/turn from Turn 30) |
| Advancement | Manual | Player must select when threshold reached |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.2 - Research Points (RP) Economy

**Code:**
- `src/lib/game/research/rp-accumulation.ts` - Threshold detection and draft trigger

**Tests:**
- `src/lib/game/__tests__/rp-thresholds.test.ts` - Test threshold detection (1k, 5k, 15k)

**Status:** Draft

---

### REQ-RSCH-005-C: RP Progress Visibility

**Description:** RP accumulation totals and progress percentage are **hidden** from other empires. Enemies cannot see opponent's RP totals or % progress toward next tier. Enemies can estimate based on visible research sectors and turn count, but actual RP is hidden.

**Rationale:** Creates strategic uncertainty. Empires can estimate progress but cannot know precise RP totals, encouraging intelligence gathering and risk assessment.

**Formula:**
```
Estimated RP (by enemies) = Visible Sectors × 100 × Turns Elapsed
Actual RP = Accumulated total (hidden)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| RP total | Hidden | Cannot see opponent's RP accumulation |
| Progress % | Hidden | Cannot see % toward next tier |
| Research sectors | Visible | Sector count is public information |
| Estimation | Possible | Enemies can estimate based on sectors × turns |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.2 - Research Points (RP) Economy

**Code:**
- `src/lib/game/research/visibility.ts` - Hide RP totals from enemies

**Tests:**
- `src/lib/game/__tests__/rp-visibility.test.ts` - Test RP totals hidden from enemies

**Status:** Draft

---

### REQ-RSCH-006: Research Information Visibility (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-006-A through REQ-RSCH-006-C.

---

### REQ-RSCH-006-A: Public Research Information

**Description:** Three categories of research information are always publicly visible to all empires: Doctrine choices (announced Turn ~10), Capstone unlocks (announced Turn ~60), and Research sector count (visible via sector exploration).

**Rationale:** Public announcements create diplomatic consequences and strategic reactions. Sector count allows estimation but not precision.

**Public Information:**
| Category | Visibility | Timing | Purpose |
|----------|-----------|--------|---------|
| Doctrine choices | Public | Turn ~10 (1,000 RP unlock) | Creates diplomatic consequences |
| Capstone unlocks | Public | Turn ~60 (15,000 RP unlock) | Signals endgame phase |
| Research sector count | Public | Always (via sector visibility) | Allows RP estimation |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2 - Information Visibility Matrix

**Code:**
- `src/lib/game/research/visibility.ts` - Public visibility rules

**Tests:**
- `src/lib/game/__tests__/research-visibility.test.ts` - Test public info is visible

**Status:** Draft

---

### REQ-RSCH-006-B: Hidden Research Information

**Description:** Three categories of research information remain hidden from other empires: Current RP accumulation (total RP), Progress percentage toward next tier, and Specialization choice (Tier 2 selection).

**Rationale:** Creates information asymmetry and strategic uncertainty. Enemies can estimate but not know precisely. Encourages intelligence gathering.

**Hidden Information:**
| Category | Visibility | Rationale |
|----------|-----------|-----------|
| Current RP accumulation | Hidden | Prevents precise timing predictions |
| Progress % toward next tier | Hidden | Creates strategic uncertainty |
| Specialization choice (Tier 2) | Hidden | Until revealed through specific methods (see REQ-RSCH-006-C) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2 - Information Visibility Matrix

**Code:**
- `src/lib/game/research/visibility.ts` - Hidden information rules

**Tests:**
- `src/lib/game/__tests__/research-visibility.test.ts` - Test hidden info not visible to enemies

**Status:** Draft

---

### REQ-RSCH-006-C: Specialization Reveal Methods

**Description:** Hidden specialization choices (Tier 2) can be revealed through four methods: Combat (first use against empire), Espionage (Investigate Specialization operation, 5,000 cr, 85% success), Alliance membership (auto-share with coalition), and Galactic News rumors (50% accuracy, every 10 turns, 3 true + 2 false).

**Rationale:** Multiple reveal paths create deduction gameplay. Players must choose between certainty (espionage cost) vs. uncertainty (rumors) vs. alliance commitment.

**Reveal Methods:**
| Method | Cost | Accuracy | Notes |
|--------|------|----------|-------|
| Combat | Free | 100% | Revealed on first use of specialization |
| Espionage (Investigate) | 5,000 cr | 85% | Active intelligence gathering |
| Alliance membership | Free | 100% | Auto-share between coalition members |
| Galactic News rumors | Free | 50% | Every 10 turns, 3 true + 2 false per cycle |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4 - Information Visibility & Intelligence System

**Code:**
- `src/lib/intel/specialization-reveal.ts` - Reveal condition logic
- `src/lib/covert/investigate-specialization.ts` - Espionage operation

**Tests:**
- `src/lib/intel/__tests__/specialization-reveal.test.ts` - Test all reveal conditions work
- `src/lib/covert/__tests__/investigate-specialization.test.ts` - Test espionage success/fail

**Status:** Draft

---

### REQ-RSCH-007: Research-Combat Integration (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-RSCH-007-A through REQ-RSCH-007-C.

---

### REQ-RSCH-007-A: Doctrine Bonus Application

**Description:** Doctrine bonuses apply to **all units** as permanent stat modifications (STR/AC modifiers). These are persistent changes that remain active for all combat encounters.

**Rationale:** Permanent bonuses create consistent strategic identity. All units benefit equally, reinforcing doctrine theme.

**Application Rules:**
| Doctrine | Stat Modified | Modifier | Scope |
|----------|---------------|----------|-------|
| War Machine | STR | +2 | All units (permanent) |
| Fortress | AC (defending) | +4 | All units (when defending only) |
| Commerce | N/A | N/A | No direct combat bonuses |

**Example:**
```
War Machine Cruiser:
- Base: STR 14 (+2), Damage 2d8+2
- With doctrine: STR 16 (+3), Damage 2d8+3
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.4 - Research-Combat Integration Flow

**Code:**
- `src/lib/combat/research-bonuses.ts:applyDoctrineBonus` - Apply permanent stat changes

**Tests:**
- `src/lib/combat/__tests__/doctrine-bonuses.test.ts` - Test doctrine bonuses apply to all units

**Status:** Draft

---

### REQ-RSCH-007-B: Specialization Effect Application

**Description:** Specialization bonuses apply **during combat** as conditional effects (surprise rounds, damage modifiers, immunity, etc.). These are situational and triggered by specific combat conditions.

**Rationale:** Conditional effects create tactical depth and reward situational awareness. Not all specializations apply to every combat.

**Effect Types:**
| Specialization | Effect Type | Trigger Condition |
|----------------|-------------|-------------------|
| Shock Troops | Surprise round | Combat initiation |
| Siege Engines | Damage modifier | Attacking stationary targets |
| Shield Arrays | Immunity | Defending against surprise |
| Minefield Networks | Pre-combat damage | Enemy enters defended sector |
| Trade Monopoly | N/A | Economic, not combat |
| Mercenary Contracts | STR bonus | Pay 10,000 cr per battle |

**Example:**
```
Shock Troops (surprise round):
- Attack before enemy initiative
- Deal 2d8+3 damage before combat begins
- Then proceed to normal initiative
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.4 - Research-Combat Integration Flow

**Code:**
- `src/lib/combat/specialization-effects.ts` - Apply conditional combat effects

**Tests:**
- `src/lib/combat/__tests__/specialization-effects.test.ts` - Test all specialization effects work

**Status:** Draft

---

### REQ-RSCH-007-C: Bonus Stacking Mechanics

**Description:** Research bonuses stack multiplicatively with base stats and other modifiers: Base stats + Doctrine + Specialization + Tech Cards. All bonuses apply in sequence.

**Rationale:** Multiplicative stacking creates power scaling and rewards research investment. No diminishing returns or caps.

**Stacking Order:**
```
1. Base unit stats (e.g., STR 14)
2. + Doctrine bonus (e.g., +2 STR from War Machine)
3. + Specialization effect (e.g., surprise round from Shock Troops)
4. + Tech Cards (if applicable)
Final result: All bonuses applied
```

**Example:**
```
War Machine (+2 STR) + Shock Troops (surprise round):
- Base: STR 14, Damage 2d8+2
- +Doctrine: STR 16, Damage 2d8+3
- +Specialization: Surprise round (attack first)
- Result: 2d8+3 surprise damage + normal combat rounds
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.5 - Combat Integration

**Code:**
- `src/lib/combat/combat-resolver.ts` - Apply bonuses in stacking order

**Tests:**
- `src/lib/combat/__tests__/research-combat-integration.test.ts` - End-to-end stacking test

**Status:** Draft

---

### REQ-RSCH-008: Specialization Counter-Play (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-RSCH-008-A through REQ-RSCH-008-D below.

**Overview:** Specializations counter each other in rock-paper-scissors fashion, creating tactical depth and rewarding intelligence gathering.

**Counter Relationships:**
- Shield Arrays > Shock Troops (immunity) [REQ-RSCH-008-A]
- Siege Engines > Shield Arrays (bypass) [REQ-RSCH-008-B]
- Minefield Networks > Siege Engines (pre-damage) [REQ-RSCH-008-C]
- Shock Troops > Minefield Networks (auto-clear) [REQ-RSCH-008-D]

**Counter-Picking Prerequisite:** Requires knowledge of opponent's specialization through espionage, combat reveal, or alliance intelligence.

---

### REQ-RSCH-008-A: Shield Arrays Counter Shock Troops

**Description:** Shield Arrays provide complete immunity to Shock Troops' signature surprise round mechanic, fully negating their primary advantage in combat.

**Counter Rules:**
- Effect: 100% negation of surprise round
- Trigger: Defender has Shield Arrays, Attacker has Shock Troops
- Result: No surprise round occurs (combat starts at regular initiative)
- Knowledge required: Must know enemy has Shock Troops to counter-pick

**Rationale:** Hard counter that completely shuts down Shock Troops' defining mechanic, creating strong incentive for intelligence gathering before combat.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3 - Rock-Paper-Scissors Counter-Play, Shield Arrays vs Shock Troops

**Code:** TBD - `src/lib/combat/specialization-counters.ts` - Shield Arrays counter logic

**Tests:** TBD - Verify surprise rounds are blocked when Shield Arrays face Shock Troops

**Status:** Draft

---

### REQ-RSCH-008-B: Siege Engines Counter Shield Arrays

**Description:** Siege Engines ignore Shield Arrays' AC bonuses and bypass their shield protection entirely, gaining +50% effectiveness against them.

**Counter Rules:**
- Effect: +50% effectiveness against Shield Arrays defenders
- AC treatment: Treat defender AC as 10 (ignore Shield Array bonuses)
- Shield bypass: Ignore shield protection entirely
- Knowledge required: Must know enemy has Shield Arrays to counter-pick

**Rationale:** Siege weapons designed to break fortifications naturally counter defensive shields, creating tactical choice between mobility and protection.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3 - Rock-Paper-Scissors Counter-Play, Siege Engines vs Shield Arrays

**Code:** TBD - `src/lib/combat/specialization-counters.ts` - Siege Engines counter logic

**Tests:** TBD - Verify AC reduction and shield bypass vs Shield Arrays

**Status:** Draft

---

### REQ-RSCH-008-C: Minefield Networks Counter Siege Engines

**Description:** Minefield Networks deal pre-combat damage to attacking Siege Engines, punishing their slow movement through prepared defensive positions.

**Counter Rules:**
- Effect: 10% HP damage to attackers before combat starts
- Trigger: Defender has Minefield Networks, Attacker has Siege Engines
- Saving throw: CON save DC 15 to avoid damage
- Timing: Applied before initiative roll
- Knowledge required: Must know enemy has Siege Engines to counter-pick

**Rationale:** Slow-moving siege equipment is vulnerable to prepared defenses like minefields, creating risk for specialized attackers.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3 - Rock-Paper-Scissors Counter-Play, Minefield Networks vs Siege Engines

**Code:** TBD - `src/lib/combat/specialization-counters.ts` - Minefield Networks counter logic

**Tests:** TBD - Verify pre-combat damage and CON saves

**Status:** Draft

---

### REQ-RSCH-008-D: Shock Troops Counter Minefield Networks

**Description:** Shock Troops automatically clear Minefield Networks during their surprise round, neutralizing the defender's prepared positions before combat begins.

**Counter Rules:**
- Effect: Auto-clear all mines during surprise round
- Trigger: Attacker has Shock Troops, Defender has Minefield Networks
- No save: Mines are cleared automatically (no roll required)
- Timing: Surprise round (before regular initiative)
- Knowledge required: Must know enemy has Minefield Networks to counter-pick

**Rationale:** Elite shock troops trained in rapid breach tactics can clear defensive positions before the enemy can react, closing the counter-play circle.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3 - Rock-Paper-Scissors Counter-Play, Shock Troops vs Minefield Networks

**Code:** TBD - `src/lib/combat/specialization-counters.ts` - Shock Troops counter logic

**Tests:** TBD - Verify mines are cleared in surprise round

**Status:** Draft

---

### REQ-RSCH-009: Investigate Specialization Operation (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-RSCH-009-A through REQ-RSCH-009-E below.

**Overview:** Covert operation to discover enemy specializations through espionage, with credit cost, success probability, and failure consequences.

**Operation Components:**
- Cost: 5,000 credits [REQ-RSCH-009-A]
- Success Rate: 85% [REQ-RSCH-009-B]
- Processing: Phase 5 timing [REQ-RSCH-009-C]
- Success Result: Specialization reveal [REQ-RSCH-009-D]
- Failure Result: Detection and penalties [REQ-RSCH-009-E]

---

### REQ-RSCH-009-A: Investigate Specialization Cost

**Description:** The "Investigate Specialization" covert operation costs 5,000 credits to execute, paid upfront when the operation is queued.

**Cost Rules:**
- Fixed cost: 5,000 credits
- Paid upfront (when queued, not when processed)
- Non-refundable (lost even on failure)
- Must have sufficient credits to queue operation

**Rationale:** Significant but affordable mid-game cost creates meaningful decision point. Not trivial (can't spam), but accessible when needed.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4.3 - Investigate Specialization, Cost

**Code:** TBD - `src/lib/covert/operations/investigate-specialization.ts` - Cost validation

**Tests:** TBD - Upfront credit deduction, insufficient credits blocking

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Cost (5,000 cr) requires balance testing relative to mid-game economy.

---

### REQ-RSCH-009-B: Investigate Specialization Success Rate

**Description:** The operation has an 85% chance of success, rolled when processed in Phase 5.

**Success Rate Rules:**
- Base success rate: 85%
- Failure rate: 15%
- RNG rolled during Phase 5 processing
- No modifiers (flat 85% regardless of circumstances)

**Rationale:** High success rate (85%) makes the operation reliable but not guaranteed, creating tension and replayability.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4.3 - Investigate Specialization, Success Rate

**Code:** TBD - `src/lib/covert/operations/investigate-specialization.ts` - RNG check

**Tests:** TBD - Success/failure distribution over many runs

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Success rate (85%) requires playtesting. Consider adding covert tech modifiers?

---

### REQ-RSCH-009-C: Investigate Specialization Processing Timing

**Description:** The operation is processed during Phase 5 (Covert Operations) of the turn processing pipeline.

**Processing Rules:**
- Processed in Phase 5 (Covert Operations phase)
- Queued operations execute in Phase 5 of next turn
- Results available immediately after Phase 5 completes
- Integrates with standard covert operations queue

**Rationale:** Aligns with all other covert operations for consistent turn processing behavior.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4.3 - Investigate Specialization, Processing

**Code:** TBD - `src/lib/covert/covert-operations-service.ts` - Phase 5 integration

**Tests:** TBD - Verify Phase 5 execution timing

**Status:** Draft

---

### REQ-RSCH-009-D: Investigate Specialization Success Result

**Description:** On success, the operation reveals the target empire's specialization (Tier 2 research) and provides counter-play recommendations.

**Success Result Rules:**
- Reveals target's Tier 2 specialization (which of 6 specializations they researched)
- Provides counter-play recommendations (which specializations counter theirs)
- Information is permanent (doesn't decay)
- Target empire is NOT notified of the investigation

**Rationale:** Success provides actionable intel for strategic counter-picking. Counter recommendations help less experienced players.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4.3 - Investigate Specialization, Success Result

**Code:** TBD - `src/lib/intel/specialization-reveal.ts` - Reveal logic

**Tests:** TBD - Verify correct specialization revealed, counter recs provided

**Status:** Draft

---

### REQ-RSCH-009-E: Investigate Specialization Failure Result

**Description:** On failure (15% chance), the operation is detected, credits are lost, no information is gained, and diplomatic reputation with the target drops by 10 points.

**Failure Result Rules:**
- Credits (5,000) are lost (non-refundable)
- No intelligence gained
- Target empire is notified (operation detected)
- Reputation penalty: -10 with target empire
- Does NOT trigger war or automatic retaliation

**Rationale:** Failure has meaningful consequences (wasted credits, diplomatic damage) but isn't catastrophic. Creates risk/reward tension.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4.3 - Investigate Specialization, Failure Result

**Code:** TBD - `src/lib/covert/operations/investigate-specialization.ts` - Failure handling

**Tests:** TBD - Detection notification, reputation penalty (-10)

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Reputation penalty (-10) requires balance testing. Too lenient or too harsh?

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/covert/operations/investigate-specialization.ts` - Main operation logic
- `src/lib/covert/__tests__/investigate-specialization.test.ts` - Comprehensive operation tests

---

### REQ-RSCH-010: Galactic News Rumor System

**Description:** Every 10 turns (Turn 10, 20, 30, 40...), generate 5 rumors:
- 3 TRUE rumors (accurate information about doctrines, specializations, capstone progress)
- 2 FALSE rumors (misinformation, outdated intel, or lies)
- Players cannot tell which are true (50% accuracy overall when mixed)
- Rumors can be verified via espionage (Investigate Specialization, 5,000 cr)

**Rationale:** Provides free (but unreliable) intel. Creates information warfare and decision tension: trust rumors or verify with espionage? False rumors can mislead entire galaxy.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Rumor frequency | Every 10 turns | Turn 10, 20, 30, 40, 50... |
| Rumors per bulletin | 5 total | 3 true + 2 false |
| Overall accuracy | 50% | Players can't distinguish |
| Verification cost | 5,000 cr | Via Investigate operation |

**Source:** Section 3.4.5 - Galactic News Rumor System

**Code:**
- `src/lib/game/galactic-news/rumor-generator.ts` - Generate 3 true + 2 false rumors
- `src/lib/game/galactic-news/rumor-display.ts` - Display to players (hide true/false status)
- `src/lib/game/turn-processor/galactic-news-phase.ts` - Trigger every 10 turns

**Tests:**
- `src/lib/game/__tests__/rumor-generator.test.ts` - Test 3 true + 2 false generation
- `src/lib/game/__tests__/rumor-frequency.test.ts` - Test triggers every 10 turns
- `src/lib/game/__tests__/rumor-accuracy.test.ts` - Test 50% accuracy (3/5 true, 2/5 false)

**Status:** Draft

---

### REQ-RSCH-011: Alliance Intel Sharing

**Description:** Coalition members automatically share research intelligence:
- Your specialization revealed to allies (no longer secret from coalition)
- Ally specializations revealed to you (coalition benefit)
- Estimated RP progress shared based on sector counts
- Shared intel displayed in "Coalition Intel Summary" panel

**Rationale:** Joining coalition trades tactical surprise (specialization secrecy) for coordination and allied intel. Creates strategic tradeoff: maintain secrecy or gain coalition benefits.

**Source:** Section 3.4.4 - Alliance Intel Sharing

**Code:**
- `src/lib/diplomacy/coalition-intel-sharing.ts` - Auto-share on coalition join
- `src/lib/game/research/visibility.ts` - Grant visibility to coalition members
- `src/components/diplomacy/CoalitionIntelPanel.tsx` - Display shared intel

**Tests:**
- `src/lib/diplomacy/__tests__/coalition-intel-sharing.test.ts` - Test auto-share on join
- `src/lib/diplomacy/__tests__/coalition-visibility.test.ts` - Test allied visibility rules

**Status:** Draft

---

### REQ-RSCH-012: Bot Research Decision Logic

**Description:** Bots choose doctrines and specializations based on archetype preferences with variance:
- 80% follow archetype preference (Warlord → War Machine 90%)
- 20% counter-pick based on neighbors (if surrounded by War Machine, choose Fortress)
- Strategic/Elite bots analyze threats and counter-pick specializations
- Simple/Random bots follow archetype preferences without analysis
- Opportunist archetype copies strongest neighbor's research path

**Rationale:** Creates diverse bot research paths while maintaining archetype identity. Counter-picking prevents monoculture (all bots choosing same doctrine). Strategic bots create challenge by adapting to threats.

**Source:** Section 4.2 - Bot Decision Logic

**Code:**
- `src/lib/bots/research-decision.ts` - Bot doctrine/specialization choice logic
- `src/lib/bots/archetypes/archetype-config.ts` - Archetype research preferences
- `src/lib/bots/strategic-bot.ts` - Strategic bot threat analysis and counter-picking

**Tests:**
- `src/lib/bots/__tests__/research-decision.test.ts` - Test archetype preferences work
- `src/lib/bots/__tests__/counter-picking.test.ts` - Test 20% counter-pick based on neighbors
- `src/lib/bots/__tests__/strategic-bot-research.test.ts` - Test strategic bot analysis

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-RSCH-001 | Three-Tier Research Structure | Draft | TBD |
| REQ-RSCH-002 | Doctrine System (Tier 1) | Draft | TBD |
| REQ-RSCH-003 | Specialization System (Tier 2) | Draft | TBD |
| REQ-RSCH-004 | Capstone System (Tier 3) | Draft | TBD |
| REQ-RSCH-005 | Research Point Economy | Draft | TBD |
| REQ-RSCH-006 | Research Information Visibility | Draft | TBD |
| REQ-RSCH-007 | Research-Combat Integration | Draft | TBD |
| REQ-RSCH-008 | Specialization Counter-Play | Draft | TBD |
| REQ-RSCH-009 | Investigate Specialization Operation | Draft | TBD |
| REQ-RSCH-010 | Galactic News Rumor System | Draft | TBD |
| REQ-RSCH-011 | Alliance Intel Sharing | Draft | TBD |
| REQ-RSCH-012 | Bot Research Decision Logic | Draft | TBD |

**Total Specifications:** 12
**Implemented:** 0
**Validated:** 0
**Draft:** 12

---

## 7. Implementation Requirements

### 7.1 Database Schema

See [Appendix A: Database Schema](appendix/RESEARCH-SYSTEM-APPENDIX.md#database-schema) for complete SQL definitions.

**Summary of Tables:**
```sql
-- Empire research tracking (add columns to existing empires table)
ALTER TABLE empires ADD COLUMN research_doctrine VARCHAR(20);
ALTER TABLE empires ADD COLUMN research_specialization VARCHAR(30);
ALTER TABLE empires ADD COLUMN research_tier INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN research_points INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN tier3_unlocked_turn INTEGER;

-- Intel operations tracking
CREATE TABLE research_intel_operations (...);

-- Galactic News rumor system
CREATE TABLE galactic_news_rumors (...);

-- Public announcements log
CREATE TABLE research_announcements (...);
```

### 7.2 Service Architecture

See [Appendix B: Service Architecture](appendix/RESEARCH-SYSTEM-APPENDIX.md#service-architecture) for complete TypeScript class definitions.

**Summary of Services:**
```typescript
export class ResearchService {
  // Research progression
  async processResearchProduction(empireId: string, researchPlanets: number): Promise<ResearchStatus>
  async getResearchStatus(empireId: string): Promise<ResearchStatus>

  // Tier 1: Doctrine selection
  async selectDoctrine(empireId: string, doctrine: Doctrine): Promise<void>

  // Tier 2: Specialization selection (hidden)
  async selectSpecialization(empireId: string, spec: Specialization): Promise<void>

  // Tier 3: Capstone unlock
  async unlockCapstone(empireId: string): Promise<void>

  // Combat integration
  async applyResearchBonuses(empireId: string, baseStats: UnitStats): Promise<UnitStats>

  // Intel operations
  async investigateSpecialization(investigatorId: string, targetId: string): Promise<IntelResult>

  // Galactic News
  async generateRumors(gameId: string, turn: number): Promise<Rumor[]>

  // Announcements
  async createPublicAnnouncement(empireId: string, type: 'doctrine' | 'capstone', data: any): Promise<void>

  // Visibility checks
  async getVisibleResearchInfo(viewerEmpireId: string, targetEmpireId: string): Promise<VisibleResearchInfo>
}
```

### 7.3 Combat Integration

See [Appendix C: Combat Integration](appendix/RESEARCH-SYSTEM-APPENDIX.md#combat-integration) for complete implementation code.

**Summary:**
```typescript
function applyResearchModifiers(attacker: Fleet, defender: Fleet): CombatModifiers {
  // Load research status for both empires
  // Apply doctrine bonuses (STR/AC)
  // Apply specialization effects (surprise rounds, CON saves, etc.)
  // Return modifiers for combat resolver
}
```

### 7.4 UI Components

**Key Components:**
- `ResearchPanel.tsx` - Main research status display (your empire)
- `DoctrineSelectionScreen.tsx` - Doctrine draft interface (Tier 1)
- `SpecializationSelectionScreen.tsx` - Specialization draft interface (Tier 2)
- `IntelPanel.tsx` - Enemy research intel display (known/unknown)
- `GalacticNewsPanel.tsx` - Rumor display (3 true + 2 false mixed)
- `ResearchAnnouncement.tsx` - Full-screen dramatic capstone announcement
- `CoalitionIntelPanel.tsx` - Allied research intel sharing display

---

## 8. Balance Targets

### 8.1 Doctrine Distribution

| Doctrine | Target % | Tolerance | Measurement |
|----------|----------|-----------|-------------|
| War Machine | 33% | ±5% | % of empires choosing War Machine |
| Fortress | 33% | ±5% | % of empires choosing Fortress |
| Commerce | 33% | ±5% | % of empires choosing Commerce |

**Goal:** No dominant doctrine choice. Roughly even distribution across player and bot populations.

**Measurement Method:** Run 1,000 games, track doctrine selections, calculate distribution.

### 8.2 Research Progression Timing

| Milestone | Target Turn | Tolerance | % of Games Reaching |
|-----------|-------------|-----------|---------------------|
| Tier 1 (Doctrine) | Turn 10-15 | ±3 turns | 95% |
| Tier 2 (Specialization) | Turn 30-40 | ±5 turns | 80% |
| Tier 3 (Capstone) | Turn 60-80 | ±10 turns | 40-50% |

**Reasoning:** Not all games last 60+ turns. Capstones are late-game rewards for long campaigns.

### 8.3 Intel Operation Usage

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| % players who investigate enemy specialization | 60-70% | ±10% | Track intel operations per game |
| Average investigations per game | 3-5 | ±2 | Total investigations / games |
| Galactic News trust rate | 50% | N/A | By design (3 true, 2 false) |
| False intel leading to wrong counter-pick | 10-15% | ±5% | Track counter-pick failures |

### 8.4 Combat Impact

| Research Advantage | Expected Win Rate Increase | Tolerance | Notes |
|--------------------|----------------------------|-----------|-------|
| Doctrine advantage only | +10-15% | ±5% | e.g., War Machine vs no doctrine |
| Specialization advantage only | +15-20% | ±5% | e.g., Shield Arrays vs Shock Troops |
| Both advantages | +25-30% | ±5% | Doctrine + Specialization |
| Capstone unlocked | +40-50% | ±10% | Game-changing, intended dominance |

**Measurement Method:** Run 10,000 simulated battles with controlled variables (equal forces, vary research bonuses).

### 8.5 Specialization Reveal Timing

| Reveal Method | Target % Usage | Measurement |
|---------------|----------------|-------------|
| Combat (first use) | 40-50% | Most common reveal (natural gameplay) |
| Espionage (5k cr) | 30-40% | Paid verification |
| Alliance sharing | 15-25% | Coalition benefit |
| Galactic News | 5-10% | Lucky guess from rumors |

### 8.6 Capstone Impact on Victory

| Capstone | Games Won After Unlock | Target % | Notes |
|----------|------------------------|----------|-------|
| Dreadnought | 60-70% | ±10% | Dominant military power |
| Citadel World | 40-50% | ±10% | Defensive stall, other victory paths |
| Economic Hegemony | 70-80% | ±10% | Economic snowball, very strong |

**Balance Note:** Economic Hegemony may need tuning if win rate exceeds 80%. Consider reducing income siphon to 40% or adding counter-mechanics.

### 8.7 Playtest Scenarios

**Scenario 1: Doctrine Rock-Paper-Scissors**
- [ ] War Machine (+2 STR) vs Fortress (+4 AC defending): Fortress wins defense 55-60%
- [ ] War Machine (+2 STR) vs Commerce (no combat bonus): War Machine wins 70-80%
- [ ] Fortress (+4 AC) vs Commerce (Mercenary Contracts): Even 50-50% if Commerce hires

**Scenario 2: Specialization Counter-Play**
- [ ] Shield Arrays negates Shock Troops 100% of time (no surprise rounds)
- [ ] Siege Engines vs Shield Arrays: Siege wins 65-70% (bypass shields)
- [ ] Minefield Networks vs Siege Engines: Mines delay but Siege wins 55-60%

**Scenario 3: Intel Gameplay**
- [ ] Player investigates enemy specialization 3-5 times per game
- [ ] 60-70% of investigations succeed (85% success rate)
- [ ] Players who investigate specializations win 10-15% more often (intel advantage)

**Scenario 4: Capstone Endgame**
- [ ] Dreadnought unlocked Turn 60: Player wins within 20 turns (80% of time)
- [ ] Citadel World unlocked: Game continues 30+ more turns (defensive stall)
- [ ] Economic Hegemony unlocked: Player reaches Economic Victory within 15 turns (75%)

**Scenario 5: Galactic News Misinformation**
- [ ] False rumors lead to 10-15% wrong counter-picks
- [ ] Players verify critical rumors (Dreadnought progress) 70-80% of time
- [ ] Bots trust rumors at face value (Simple/Random bots) 80% of time

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| 8-level passive research | 3-tier draft system | 1. Disable old research UI<br>2. Implement new tier system<br>3. Migrate existing game saves (grant Tier 1 to Turn 10+ games) |
| No visibility system | Hybrid visibility (public/hidden) | 1. Add visibility flags to database<br>2. Implement reveal conditions<br>3. Update intel UI |
| No specializations | 6 specializations (2 per doctrine) | 1. Create specialization effects<br>2. Integrate with combat system<br>3. Add selection UI |
| No intel operations | Investigate Specialization operation | 1. Add to Covert Ops system<br>2. Create espionage action<br>3. Implement 85% success rate |
| No Galactic News | Rumor system (3 true + 2 false) | 1. Create rumor generator<br>2. Add bulletin UI<br>3. Trigger every 10 turns |

### 9.2 Data Migration

```sql
-- Migration: Convert old research system to new 3-tier system
-- Safe to run: YES (non-destructive, adds new columns)

-- Add new columns to empires table
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_doctrine VARCHAR(20);
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_specialization VARCHAR(30);
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_tier INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_points INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS tier3_unlocked_turn INTEGER;

-- Migrate existing games: Grant Tier 1 doctrine to empires past Turn 10
UPDATE empires e
SET research_tier = 1,
    research_doctrine =
      CASE
        WHEN e.archetype_name IN ('Warlord', 'Blitzkrieg') THEN 'war_machine'
        WHEN e.archetype_name IN ('Turtle', 'Diplomat') THEN 'fortress'
        WHEN e.archetype_name IN ('Merchant', 'Tech Rush', 'Schemer') THEN 'commerce'
        ELSE 'war_machine'
      END,
    research_points = 1000
WHERE e.game_id IN (
  SELECT g.id FROM games g WHERE g.current_turn >= 10
);

-- Create new tables
CREATE TABLE IF NOT EXISTS research_intel_operations (...);
CREATE TABLE IF NOT EXISTS galactic_news_rumors (...);
CREATE TABLE IF NOT EXISTS research_announcements (...);
```

### 9.3 Rollback Plan

**If new research system is broken:**

1. **Disable New System** (emergency):
   ```typescript
   // In config/feature-flags.ts
   export const FEATURE_FLAGS = {
     newResearchSystem: false, // Revert to old system
   };
   ```

2. **Restore Old Research UI**:
   - Reactivate old research progress bar UI
   - Hide new doctrine/specialization panels

3. **Preserve Data**:
   - Keep new database tables (research_doctrine, etc.) for investigation
   - Do not delete player choices (can restore later)

4. **Refund Resources** (if needed):
   ```sql
   -- Refund espionage operations if Investigate Specialization failed
   UPDATE empires e
   SET credits = credits + 5000
   WHERE e.id IN (
     SELECT investigator_id FROM research_intel_operations
     WHERE success = FALSE AND created_at > NOW() - INTERVAL '24 hours'
   );
   ```

5. **Communication**:
   - Notify players: "Research system temporarily reverted to old system due to issues"
   - Provide ETA for fix and re-enable

---

## 10. Conclusion

The Research System transforms tech progression from passive grinding into **strategic identity creation** with **asymmetric information gameplay** and **meaningful choices** at three critical game moments.

### Key Decisions

**Decision 1: Three-Tier Draft Structure (Doctrine → Specialization → Capstone)**
**Rationale:** Creates natural game phases (early, mid, late) with meaningful choices at each. Doctrines define strategic identity, specializations add tactical depth, capstones provide dramatic endgame power spikes. Avoids passive "click research, wait" gameplay.

**Decision 2: Hybrid Visibility Model (Public Doctrines, Hidden Specializations)**
**Rationale:** Public doctrines create diplomatic consequences and inform enemy strategies, creating dynamic reactions. Hidden specializations create information asymmetry, rewarding intelligence gathering and tactical surprise. Balances transparency with secrecy.

**Decision 3: Direct D20 Combat Integration (STR/AC Modifiers)**
**Rationale:** Research bonuses modify core combat stats (STR, AC) instead of abstract "tech levels". Makes research impact immediately visible and tactically meaningful. Players understand "+2 STR" better than "15% attack boost".

**Decision 4: Espionage Operation for Specializations (5,000 cr, 85% success)**
**Rationale:** Paid intel method creates risk/reward decision. 85% success rate means most operations succeed, but 15% failure risk (+ reputation penalty) adds tension. 5,000 cr cost is significant but affordable mid-game (equivalent to 1 Combat sector's turn income).

**Decision 5: Galactic News Rumor System (3 True, 2 False, 50% Accuracy)**
**Rationale:** Free intel source adds variance and information warfare. 50% accuracy (by mixing 3 true + 2 false) forces players to verify critical rumors via espionage or risk bad decisions. False rumors can mislead entire galaxy, creating emergent chaos.

**Decision 6: Rock-Paper-Scissors Specialization Counters**
**Rationale:** Creates tactical counter-play where knowing enemy specialization enables counter-picking for advantage. Rewards intelligence gathering and analysis. Shield Arrays > Shock Troops > Minefield Networks > Siege Engines > Shield Arrays creates circular balance.

**Decision 7: Automatic Capstone Unlock (No Choice, Based on Doctrine)**
**Rationale:** Capstones are rewards for commitment to a doctrine path, not another choice point. Automatic unlock at 15,000 RP provides dramatic moment without decision paralysis. Public announcement signals endgame phase.

**Decision 8: Alliance Intel Sharing (Auto-Reveal Specializations)**
**Rationale:** Joining coalition trades tactical surprise (specialization secrecy) for coordination and allied intel. Creates strategic tradeoff: maintain secret advantage or gain coalition benefits. Encourages intel-based coalition formation.

### Open Questions

**Question 1: Should specializations have multiple tiers (e.g., Shock Troops I, II, III)?**
**Context:** Currently specializations are binary (have it or not). Could add progression: Shock Troops I (surprise round), Shock Troops II (surprise round + first round +2 damage), etc.
**Options:**
- Keep binary (current design, simpler)
- Add 2-3 tiers per specialization (more progression, more complexity)

**Question 2: Should capstones be balanced (all equally powerful) or asymmetric (Economic Hegemony stronger)?**
**Context:** Current design: Economic Hegemony appears strongest (70-80% win rate). Dreadnought (60-70%) and Citadel World (40-50%) lower.
**Options:**
- Balance all to 60-70% win rate (nerf Economic Hegemony to 40-45% siphon)
- Keep asymmetric (Economic is "win condition", others are "tools")

**Question 3: Should Galactic News accuracy be adjustable (e.g., 60% true after research investment)?**
**Context:** Currently fixed 50% accuracy (3 true, 2 false). Could allow research or tech to improve accuracy.
**Options:**
- Keep 50% fixed (simpler, no power creep)
- Add "News Network Upgrade" research (improve to 60-70% accuracy)

**Question 4: Should failed Investigate operations have partial results (e.g., "narrow down to 2 options")?**
**Context:** Currently failure = no info. Could provide partial success: "They have either Shock Troops OR Siege Engines (50/50)".
**Options:**
- Keep binary success/failure (simpler)
- Add partial success tier (more nuanced, less frustrating)

### Dependencies

**Depends On:**
- **Combat System** - D20 resolution, STR/DEX/CON stats, initiative system
- **Sector System** - Research sectors, production calculations
- **Turn Processor** - RP accumulation each turn, threshold detection
- **Covert Operations System** - Investigate Specialization operation (Phase 5 processing)
- **Diplomacy System** - Coalition formation, intel sharing with allies
- **Bot Archetype System** - Archetype preferences, decision trees

**Depended By:**
- **Combat Resolution** - Applies research bonuses (STR/AC) to all battles
- **Victory Conditions** - Research Victory path (reach Tier 3 capstone)
- **Bot AI Decision Trees** - Bots choose doctrines/specializations, react to player research
- **UI Panels** - Research panel, Intel panel, Galactic News panel
- **Economic System** - Doctrine income penalties (-10% War Machine, +20% Commerce sell prices)

---

**Version History:**
- v2.0 (2026-01-12): Migrated from draft to standardized template, extracted code to appendix, expanded specifications from 8 to 12
- v1.0 (2026-01-02): Initial draft design

**Next Steps:**
1. Extract code examples (220 lines) to RESEARCH-SYSTEM-APPENDIX.md
2. Implement database schema (research_doctrine, research_specialization columns + 3 new tables)
3. Create ResearchService with tier unlock logic
4. Write tests for REQ-RSCH-001 through REQ-RSCH-012
5. Integrate doctrine bonuses with Combat System (STR/AC modifiers)
6. Implement specialization effects (surprise rounds, CON saves, etc.)
7. Create UI components (Doctrine Selection, Intel Display, Galactic News)
8. Implement Investigate Specialization operation (Covert Ops Phase 5)
9. Create Galactic News rumor generator (3 true + 2 false every 10 turns)
10. Implement bot research decision logic (archetype preferences, counter-picking)
11. Balance test with 10,000 simulated battles (measure doctrine/specialization win rates)
12. Playtest 7 scenarios from Section 8.7
13. Update PRD-EXECUTIVE.md with Research System reference

---
