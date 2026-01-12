# Research System Redesign

**Version:** 2.0
**Status:** FOR IMPLEMENTATION
**Created:** 2026-01-02
**Last Updated:** 2026-01-12
**Replaces:** Current 8-level passive research system

---

## Document Purpose

This document defines the **Research and Technology system** for Nexus Dominion. Research replaces passive tech grinding with strategic draft-based choices that create asymmetric combat advantages and visible progression.

**Design Philosophy:**
- **Meaningful Choices** — Every research decision involves tradeoffs
- **Asymmetric Information** — Hybrid visibility creates intel gameplay
- **Combat Integration** — Tech modifies STR/DEX/CON stats directly
- **Strategic Identity** — Doctrines define playstyle
- **Board Game Feel** — Draft from options, not watch a bar fill
- **Bot Drama** — Bots react to public tech, hide secret progress

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Information Visibility System](#2-information-visibility-system)
3. [Tier 1: Doctrines (Turn ~10)](#3-tier-1-doctrines-turn-10)
4. [Tier 2: Specializations (Turn ~30)](#4-tier-2-specializations-turn-30)
5. [Tier 3: Mastery Capstones (Turn ~60)](#5-tier-3-mastery-capstones-turn-60)
6. [Combat Integration](#6-combat-integration)
7. [Intel & Espionage System](#7-intel--espionage-system)
8. [Bot Integration](#8-bot-integration)
9. [UI/UX Design](#9-uiux-design)
10. [Implementation Requirements](#10-implementation-requirements)
11. [Balance Targets](#11-balance-targets)
12. [Migration Plan](#12-migration-plan)
13. [Conclusion](#13-conclusion)

---

## 1. Core Concept

### 1.1 Three-Tier Structure

Replace 8 passive levels with **3 meaningful choice tiers**:

| Tier | Name | Unlock Turn | Choice | Visibility |
|------|------|-------------|--------|------------|
| **Tier 1** | Doctrine | Turn 10 | Pick 1 of 3 Doctrines | 🌍 PUBLIC |
| **Tier 2** | Specialization | Turn 30 | Pick 1 of 2 Upgrades | 🕵️ HIDDEN |
| **Tier 3** | Mastery | Turn 60 | Doctrine Capstone | 🌍 PUBLIC (unlock) |

### 1.2 Research Points (RP) Accumulation

- Research planets generate **100 RP/turn** (unchanged)
- RP accumulates toward tier thresholds
- Threshold reached → Draft choice unlocks
- **No choice = no progress** (forces engagement)

**Thresholds:**
```
Tier 1: 1,000 RP   (~10 turns with 1 research planet)
Tier 2: 5,000 RP   (~30 turns with 2 research planets)
Tier 3: 15,000 RP  (~60 turns with 3 research planets)
```

### 1.3 The Card Game Metaphor

Think of research like a card game:
- Your **hand** (RP accumulation, progress %) is **HIDDEN** 🔒
- Cards **played face up** (Doctrine) are **PUBLIC** 🌍
- Cards **played face down** (Specialization) are **HIDDEN** until revealed 🕵️
- **Capstone unlocks** are dramatic **PUBLIC** announcements 🌍

---

## 2. Information Visibility System

### 2.1 Hybrid Visibility Model

**PUBLIC Information (All players see):**
- ✅ Doctrine choice (Tier 1)
- ✅ Tier 3 capstone unlock
- ✅ Number of research planets (sector info)
- ✅ Galactic News rumors (50% accurate)

**HIDDEN Information (Private):**
- 🔒 Current RP accumulation
- 🔒 % progress toward next tier
- 🔒 Specialization choice (Tier 2)

**REVEALED Through Gameplay:**
- ⚔️ Specialization effects (experienced in combat)
- 🕵️ Intel operations (costs 5,000 credits)
- 🤝 Alliances (allies share automatically)
- 📰 Galactic News (unreliable rumors)

### 2.2 Information Reveal Matrix

| Info Type | Default | Reveal Method | Cost |
|-----------|---------|---------------|------|
| **Doctrine choice** | 🌍 PUBLIC | Automatic (Turn 10) | Free |
| **Specialization** | 🔒 HIDDEN | Combat, espionage, alliance | 5,000 cr (espionage) |
| **Current RP** | 🔒 PRIVATE | Never visible | N/A |
| **Tier 3 progress %** | 🔒 PRIVATE | Never visible | N/A |
| **Tier 3 unlock** | 🌍 PUBLIC | Automatic announcement | Free |
| **Research planets** | 🌍 PUBLIC | Sector visibility | Free |
| **Active bonuses** | ⚔️ COMBAT | Experienced in battle | Free |

### 2.3 Deduction & Estimates

Players can **estimate** enemy progress:
```
Calculation:
Known research planets × 100 RP/turn × turns elapsed = Estimated RP

Example:
Enemy has 2 research planets visible
Game is on Turn 40
Estimated RP: 2 × 100 × 40 = 8,000 RP
Conclusion: They probably have Tier 2 specialization

But you don't know:
- Which specialization they chose
- Their exact progress toward Tier 3
- If they lost/gained research planets recently
```

---

## 3. Tier 1: Doctrines (Turn ~10)

### 3.1 The Three Doctrines

When threshold reached, player drafts ONE of three Doctrines. This defines their strategic identity.

| Doctrine | Combat Effect (D20) | Economic Effect | Unlocks |
|----------|---------------------|-----------------|---------|
| **War Machine** | +2 STR modifier | -10% planet income | Heavy Cruisers |
| **Fortress** | +4 AC when defending | -5% attack power | Defense Platforms |
| **Commerce** | +2 CHA modifier (commander) | +20% market prices (sell) | Trade Fleets |

### 3.2 Doctrine Details

**War Machine**
- **Effect:** All units gain +2 to STR modifier
- **Example:** Fighter with STR 10 (+0) becomes STR 14 (+2)
  - Damage increases from 1d6+0 to 1d6+2
- **Playstyle:** Aggressive expansion, offensive warfare
- **Counter:** Fortress doctrine negates with +4 AC

**Fortress**
- **Effect:** +4 AC bonus when defending home territory
- **Example:** Station with AC 13 becomes AC 17 when defending
  - Enemies need 17+ to hit instead of 13+
- **Playstyle:** Defensive consolidation, turtle strategy
- **Counter:** War Machine sieges with superior firepower

**Commerce**
- **Effect:** Commander gains +2 CHA (better diplomacy, no direct combat bonus)
- **Economic:** +20% prices when selling resources
- **Playstyle:** Economic victory, trade dominance
- **Counter:** War Machine raids disrupt trade routes

### 3.3 Public Announcement

When doctrine chosen, **galaxy-wide announcement**:

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
- Turtle players fortify borders
- Schemers propose alliances against Warlord
- Diplomats attempt treaties
- Other War Machine players see rival

---

## 4. Tier 2: Specializations (Turn ~30)

### 4.1 Specialization System

Based on Doctrine chosen, player picks ONE of two Specializations.

**Specialization choices are HIDDEN until revealed through:**
- ⚔️ Combat (first use reveals to victim)
- 🕵️ Espionage operation (costs 5,000 credits)
- 🤝 Alliance intel sharing (automatic with allies)
- 📰 Galactic News rumors (50% accuracy)

### 4.2 War Machine Specializations

| Specialization | Effect (D20) | Counter |
|----------------|--------------|---------|
| **Shock Troops** | First strike: Attack before initiative roll | Fortress Shield Arrays negate |
| **Siege Engines** | +50% damage vs stationary targets (AC penalty ignored) | Commerce evacuation tactics |

**Shock Troops**
- **Mechanics:** In D20 terms, this is a "surprise round"
- Your units deal damage before initiative is rolled
- **Example:**
  ```
  Normal combat: Roll initiative → Attack
  Shock Troops: Attack immediately → Then roll initiative
  ```
- **Counter:** Shield Arrays grant immunity to surprise rounds

**Siege Engines**
- **Mechanics:** When attacking stations/defense platforms:
  - Treat target AC as 10 (ignore armor bonuses)
  - +2 STR modifier bonus
- **Example:** Station with AC 17 is treated as AC 10
- **Counter:** Commerce players can evacuate assets before siege completes

### 4.3 Fortress Specializations

| Specialization | Effect (D20) | Counter |
|----------------|--------------|---------|
| **Shield Arrays** | Negate first-strike damage (immunity to surprise rounds) | Siege Engines bypass shields |
| **Minefield Networks** | Attackers roll CON save (DC 15) or lose 10% HP before combat | Shock Troops clear minefields |

**Shield Arrays**
- **Mechanics:** Grants "Uncanny Dodge" equivalent
  - No surprise rounds allowed against you
  - Always roll initiative normally
- **Example:** Enemy Shock Troops must wait for initiative
- **Counter:** Siege Engines treat AC as 10, bypassing shield bonus

**Minefield Networks**
- **Mechanics:** Before combat Phase 1:
  - All attacking units make CON save (d20 + CON mod vs DC 15)
  - Failed save: Lose 10% current HP
  - Successful save: No damage
- **Example:** 100 HP cruiser fails save → 90 HP before combat starts
- **Counter:** Shock Troops auto-clear minefields in surprise round

### 4.4 Commerce Specializations

| Specialization | Effect (D20) | Counter |
|----------------|--------------|---------|
| **Trade Monopoly** | Buy resources at -20%, sell at +30% | War Machine raids trade routes |
| **Mercenary Contracts** | Hire mercenaries: Spend 10,000 cr for +2 STR temp bonus (1 battle) | Fortress resists with high AC |

**Trade Monopoly**
- **Mechanics:** Economic only, no combat effect
- Market prices adjusted in your favor
- Generate passive income lead
- **Counter:** War Machine raids disrupt trade, force military spending

**Mercenary Contracts**
- **Mechanics:** Pay 10,000 credits before battle
  - All units gain +2 STR modifier for that battle
  - Effect expires after battle (win or lose)
- **Example:** Normally 1d8+1 damage → 1d8+3 damage
- **Counter:** Fortress AC negates extra damage

### 4.5 Rock-Paper-Scissors

```
War Machine (Shock Troops) > Commerce (undefended)
Fortress (Shield Arrays)  > War Machine (negates first strike)
Commerce (Mercenaries)    > Fortress (overwhelm with hired power)

Specializations create counter-play within each matchup
```

---

## 5. Tier 3: Mastery Capstones (Turn ~60)

### 5.1 Capstone System

Automatic unlock based on Doctrine. No choice — this is the reward for commitment.

**Capstone progress is HIDDEN** (% toward unlock)
**Capstone unlock is PUBLIC** (dramatic galaxy-wide announcement)

| Doctrine | Capstone | Effect (D20) |
|----------|----------|--------------|
| **War Machine** | **Dreadnought** | Singularity-class unit: STR 20 (+5), 200 HP, once per game |
| **Fortress** | **Citadel World** | One planet becomes AC 25 (nearly invulnerable) |
| **Commerce** | **Economic Hegemony** | Generate 50% of #2's income as passive bonus |

### 5.2 Capstone Unlock Announcement

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
- Defensive coalitions form automatically
- Nearby empires panic
- Rival Warlords launch preemptive strikes
- Game enters endgame phase

### 5.3 Dreadnought Stats (Example)

```
┌─────────────────────────────────────┐
│ DREADNOUGHT          [TIER III]     │
├─────────────────────────────────────┤
│ STR: 20 (+5)  DEX: 10 (+0)         │
│ CON: 20 (+5)                        │
│                                     │
│ HP: 200 (base 100 + CON +5 × 20)   │
│ AC: 20  (10 + DEX +0 + armor +10)  │
│ Init: +0                            │
│                                     │
│ Attack: Planet Killer Cannon        │
│ +11 to hit (BAB +6 + STR +5)       │
│ Damage: 4d12+5                      │
│                                     │
│ ABILITY: Overwhelming Firepower     │
│ Attack all enemy units in sector    │
│                                     │
│ LIMIT: One per game                 │
├─────────────────────────────────────┤
│ Cost: 100,000 💰 | Pop: 10 👥       │
│ Domain: SPACE    | Maint: 500 🛢️    │
└─────────────────────────────────────┘
```

---

## 6. Combat Integration

### 6.1 Doctrine Bonuses Applied to Units

Research bonuses modify base stats on unit cards:

**War Machine Doctrine: +2 STR**
```
Before:  Fighter STR 10 (+0), Damage 1d6+0
After:   Fighter STR 12 (+1), Damage 1d6+1

Before:  Cruiser STR 14 (+2), Damage 2d8+2
After:   Cruiser STR 16 (+3), Damage 2d8+3
```

**Fortress Doctrine: +4 AC (defending)**
```
Before:  Station AC 13 (defending)
After:   Station AC 17 (defending)

Effect: Enemies need to roll 17+ instead of 13+ to hit
```

**Commerce Doctrine: +2 CHA (commander)**
```
Bot commander CHA 12 (+1) → CHA 14 (+2)

Effects:
- +2 to diplomacy checks (d20+2 vs target's WIS)
- +2 to surrender negotiations
- Better alliance formation success rate
```

### 6.2 Combat Integration Example

**Scenario:** War Machine (Shock Troops) vs Fortress (Shield Arrays)

```
ROUND 0 (Surprise Round Attempt):
- War Machine attempts Shock Troops surprise round
- Fortress Shield Arrays: "Uncanny Dodge" immunity
- Result: No surprise round, proceed to initiative

ROUND 1 (Normal):
- Initiative rolls
- War Machine Cruiser: STR 16 (+3), Attack +7, Damage 2d8+3
- Fortress Station: AC 17 (13 + 4 doctrine bonus defending)
- Attack roll: d20+7 vs AC 17
  - Roll 12 + 7 = 19 → HIT
  - Damage: 2d8+3 = 7+5+3 = 15 damage

Result: War Machine still wins due to +2 STR, but Shield Arrays
negated the first-strike advantage.
```

---

## 7. Intel & Espionage System

### 7.1 Intel Operations

**Discover Specialization** (New Operation):
- **Cost:** 5,000 credits
- **Target:** Any empire
- **Success Rate:** 85%
- **Result:** Reveals target's Tier 2 specialization choice

**Example:**
```
You paid 5,000 credits to investigate Emperor Varkus.

INTEL REPORT:
Target: Emperor Varkus (War Machine Doctrine)
Specialization: SHOCK TROOPS
Effect: First-strike capability in combat
Counter: Shield Arrays negate this advantage

Recommendation: Develop Fortress doctrine or avoid engagement.
```

### 7.2 Alliance Intel Sharing

**Automatic sharing with allies:**
- Your specialization revealed to coalition members
- Coalition members' specializations revealed to you
- Estimated RP progress shared (based on planet counts)

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
│ • Defense negates first-strikes (1) │
│ • Economic support (2)              │
│                                     │
│ Suggested Strategy:                 │
│ You attack, Ally 1 defends,         │
│ Ally 2 funds operations             │
└─────────────────────────────────────┘
```

### 7.3 Galactic News Rumor System

**Every 10 turns, generate 5 rumors:**
- **3 TRUE** (50% accuracy overall when mixed with false)
- **2 FALSE**
- Players cannot tell which are which

**Example Rumors (Turn 40):**
```
GALACTIC NEWS NETWORK

🔹 "Sources say Emperor Varkus deployed Shock Troops" (TRUE)
🔹 "Reports indicate Lady Chen uses Shield Arrays" (FALSE - she has Trade Monopoly)
🔹 "The Collective nears Dreadnought completion" (TRUE - 85% progress)
🔹 "Commander Zhen adopted Commerce doctrine" (TRUE)
🔹 "Rumors suggest Admiral Kane has Siege Engines" (FALSE - he has Shock Troops)
```

**Player Decision:**
- Do you trust the Varkus rumor and build Shield Arrays?
- Or is it misinformation to waste your research path?
- Spend 5,000 cr to verify via espionage?

---

## 8. Bot Integration

### 8.1 Archetype Preferences

| Archetype | Preferred Doctrine | Preferred Specialization | Reasoning |
|-----------|-------------------|-------------------------|-----------|
| **Warlord** | War Machine | Shock Troops | Offensive playstyle, first-strike fits aggression |
| **Blitzkrieg** | War Machine | Shock Troops | Early rush benefits from surprise |
| **Turtle** | Fortress | Shield Arrays | Defensive, negates enemy aggression |
| **Diplomat** | Fortress | Minefield Networks | Defensive but warns attackers |
| **Merchant** | Commerce | Trade Monopoly | Economic focus, maximizes income |
| **Tech Rush** | Commerce | Trade Monopoly | Economic to fund fast research |
| **Schemer** | Commerce | Mercenary Contracts | Flexible, buys power when needed |
| **Opportunist** | (copies neighbor) | (copies neighbor) | Mimics strongest neighbor |

### 8.2 Bot Decision Logic

**Doctrine Choice (Turn 10):**
```typescript
function chooseDoctrine(bot: Empire, gameState: GameState): Doctrine {
  // 80% follow archetype preference
  if (Math.random() < 0.8) {
    return bot.archetype.preferredDoctrine;
  }

  // 20% counter-pick based on neighbors
  const neighborDoctrines = getNeighborDoctrines(bot, gameState);
  if (neighborDoctrines.includes('war_machine')) {
    return 'fortress'; // Counter aggression
  }

  return bot.archetype.preferredDoctrine;
}
```

**Specialization Choice (Turn 30):**
```typescript
function chooseSpecialization(bot: Empire): Specialization {
  const doctrine = bot.researchDoctrine;
  const options = getSpecializationOptions(doctrine);

  // Strategic bots analyze threats
  if (bot.tier === 'strategic') {
    const threats = analyzeThreatLevel(bot);
    if (threats.high && doctrine === 'fortress') {
      return 'shield_arrays'; // Defensive when threatened
    }
  }

  // Default to archetype preference
  return bot.archetype.preferredSpecialization;
}
```

### 8.3 Bot Messaging

**Tier 1 (Doctrine Announcement):**
```
[Warlord] "My factories now produce weapons of conquest. Tremble."
[Turtle] "My borders are sealed. Come if you dare."
[Merchant] "While you play soldier, I build an empire of gold."
[Diplomat] "My defenses ensure peace. Attack and you'll regret it."
[Schemer] "I've chosen my path. You'll discover what that means... eventually."
```

**Tier 2 (Specialization Hints - 30% reveal, 70% cryptic):**
```
[War Machine + Shock Troops - 30% reveal]:
"My soldiers strike before you can blink."

[Fortress + Shield Arrays - 70% cryptic]:
"I've installed new defensive systems. You're welcome to test them."

[Commerce + Mercenaries - 70% cryptic]:
"Credits buy loyalty. Loyalty buys... options."
```

**Tier 3 (Capstone Drama):**
```
[Dreadnought Unlock]:
"Behold the INEVITABLE. My dreadnought has awakened.
 Choose your last words carefully."

[Citadel Unlock]:
"My homeworld is now eternal. You cannot touch it.
 But I can still reach you."

[Economic Hegemony Unlock]:
"Your economy flows into mine like water downhill.
 Resistance is... unprofitable."
```

### 8.4 Bot Reactions to Player Research

**When player unlocks Dreadnought:**
```
[Nearby Warlord]: "A Dreadnought? Impressive. But can you build a second
                   before I destroy the first?"

[Distant Diplomat]: "Congratulations on your achievement. Now please
                     don't use it on anyone we care about."

[Schemer]: "Dreadnought noted. I'll adjust my calculations accordingly."

[Turtle]: *Immediately builds 10 defense stations*
```

---

## 9. UI/UX Design

### 9.1 Research Panel (Your Empire)

```
┌─────────────────────────────────────────────────────────┐
│ RESEARCH COMMAND                          [3,247 / 5,000 RP]
├─────────────────────────────────────────────────────────┤
│ Doctrine: FORTRESS (PUBLIC) 🛡️                          │
│ Specialization: Shield Arrays (HIDDEN FROM ENEMIES) 🔒  │
│                                                         │
│ Tier 3 Progress: 65% ████████░░ (HIDDEN FROM ENEMIES)  │
│ Capstone Unlocks: Turn 68 (7 turns)                    │
│                                                         │
│ ⚠️ Enemies know your doctrine but not your spec         │
│ ⚠️ Your capstone unlock will be announced galaxy-wide   │
│                                                         │
│ Intel Operations Available:                             │
│ • Investigate Enemy Specialization (5,000 cr)           │
│ • View Galactic News Rumors (free, 50% accuracy)        │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Intel Display (Enemy Empire)

**Enemy with known doctrine, unknown specialization:**
```
┌─────────────────────────────┐
│ EMPEROR VARKUS              │
│ Warlord · Hostile           │
├─────────────────────────────┤
│ Doctrine: WAR MACHINE ⚔️     │ ← PUBLIC (always visible)
│ Spec: ??? [INVESTIGATE]     │ ← HIDDEN (button to spend 5k)
│ Tier 3: Unknown             │ ← HIDDEN (% not shown)
│                             │
│ Research Planets: 2         │ ← PUBLIC (visible sectors)
│ Est. RP/turn: ~200          │ ← DEDUCED (calculated)
│                             │
│ Rumors:                     │
│ • "May have Shock Troops"   │ ← RUMOR (50% accurate)
│   (Galactic News, Turn 40)  │
└─────────────────────────────┘
```

**After spending 5,000 credits to investigate:**
```
┌─────────────────────────────┐
│ EMPEROR VARKUS              │
│ Warlord · Hostile           │
├─────────────────────────────┤
│ Doctrine: WAR MACHINE ⚔️     │
│ Spec: Shock Troops ⚡        │ ← REVEALED (paid intel)
│ Tier 3: Unknown             │
│                             │
│ INTEL REPORT:               │
│ First-strike capability     │
│ Counter: Shield Arrays      │
│                             │
│ Last updated: Turn 45       │
└─────────────────────────────┘
```

**After experiencing in combat:**
```
┌─────────────────────────────┐
│ EMPEROR VARKUS              │
│ Warlord · Hostile           │
├─────────────────────────────┤
│ Doctrine: WAR MACHINE ⚔️     │
│ Spec: Shock Troops ⚡        │ ← REVEALED (combat)
│ Tier 3: Unknown             │
│                             │
│ COMBAT REPORT (Turn 42):    │
│ "Enemy attacked before      │
│  initiative roll. First-    │
│  strike capability confirmed"│
└─────────────────────────────┘
```

### 9.3 Doctrine Selection Screen (Turn 10)

```
┌─────────────────────────────────────────────────────────┐
│ RESEARCH COMMAND                          [1,247 / 1,000 RP]
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚡ DOCTRINE SELECTION AVAILABLE                        │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ WAR MACHINE │ │  FORTRESS   │ │  COMMERCE   │       │
│  │             │ │             │ │             │       │
│  │ +2 STR      │ │ +4 AC (def) │ │ +2 CHA      │       │
│  │ -10% Income │ │ -5% Attack  │ │ +20% Prices │       │
│  │             │ │             │ │             │       │
│  │ Unlocks:    │ │ Unlocks:    │ │ Unlocks:    │       │
│  │ Heavy       │ │ Defense     │ │ Trade       │       │
│  │ Cruisers    │ │ Platforms   │ │ Fleets      │       │
│  │             │ │             │ │             │       │
│  │  [SELECT]   │ │  [SELECT]   │ │  [SELECT]   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ⚠️ This choice is permanent and PUBLIC                 │
│  ⚠️ All empires will see your doctrine                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Implementation Requirements

### 10.1 Database Schema

```sql
-- New simplified schema
ALTER TABLE empires ADD COLUMN research_doctrine VARCHAR(20);
-- Values: 'war_machine', 'fortress', 'commerce', NULL

ALTER TABLE empires ADD COLUMN research_specialization VARCHAR(30);
-- Values: 'shock_troops', 'siege_engines', 'shield_arrays',
--         'minefield_networks', 'trade_monopoly', 'mercenary_contracts', NULL

ALTER TABLE empires ADD COLUMN research_tier INTEGER DEFAULT 0;
-- Values: 0, 1, 2, 3

ALTER TABLE empires ADD COLUMN research_points INTEGER DEFAULT 0;
-- Accumulated RP

ALTER TABLE empires ADD COLUMN tier3_unlocked_turn INTEGER;
-- Turn when capstone was unlocked (for announcements)

-- Intel operations tracking
CREATE TABLE research_intel_operations (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  investigator_id UUID REFERENCES empires(id),
  target_id UUID REFERENCES empires(id),
  operation_type VARCHAR(30) NOT NULL, -- 'discover_specialization'
  cost_credits INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  result_data JSONB,
  created_turn INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Galactic News rumor system
CREATE TABLE galactic_news_rumors (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  turn_number INTEGER NOT NULL,
  rumor_text TEXT NOT NULL,
  is_true BOOLEAN NOT NULL, -- For validation, not shown to players
  subject_empire_id UUID REFERENCES empires(id),
  rumor_type VARCHAR(30), -- 'doctrine', 'specialization', 'capstone_progress'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Public announcements log
CREATE TABLE research_announcements (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  empire_id UUID REFERENCES empires(id),
  announcement_type VARCHAR(30) NOT NULL, -- 'doctrine', 'capstone'
  announcement_text TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10.2 Service Architecture

```typescript
// src/lib/game/services/research-service.ts

export class ResearchService {
  // Research progression
  async processResearchProduction(
    empireId: string,
    researchPlanets: number
  ): Promise<ResearchStatus> {
    // Add RP, check thresholds, trigger choice events
  }

  async getResearchStatus(empireId: string): Promise<ResearchStatus> {
    // Returns tier, doctrine, specialization, points
  }

  // Tier 1: Doctrine selection
  async selectDoctrine(
    empireId: string,
    doctrine: 'war_machine' | 'fortress' | 'commerce'
  ): Promise<void> {
    // Set doctrine, create public announcement
    await this.createPublicAnnouncement(empireId, 'doctrine', doctrine);
  }

  // Tier 2: Specialization selection (hidden)
  async selectSpecialization(
    empireId: string,
    spec: SpecializationType
  ): Promise<void> {
    // Set specialization (no public announcement)
  }

  // Tier 3: Capstone unlock
  async unlockCapstone(empireId: string): Promise<void> {
    // Unlock based on doctrine, create dramatic announcement
    await this.createPublicAnnouncement(empireId, 'capstone', empireData);
  }

  // Combat integration
  async applyResearchBonuses(
    empireId: string,
    baseStats: UnitStats
  ): Promise<UnitStats> {
    const research = await this.getResearchStatus(empireId);

    if (research.doctrine === 'war_machine') {
      baseStats.strength += 2;
    } else if (research.doctrine === 'fortress' && isDefending) {
      baseStats.armorClass += 4;
    } else if (research.doctrine === 'commerce') {
      // Commander CHA bonus handled separately
    }

    return baseStats;
  }

  // Intel operations
  async investigateSpecialization(
    investigatorId: string,
    targetId: string
  ): Promise<IntelResult> {
    const cost = 5000;
    const successRate = 0.85;

    // Deduct credits, roll for success
    if (Math.random() < successRate) {
      const target = await getEmpire(targetId);
      return {
        success: true,
        specialization: target.researchSpecialization,
        counter: getCounterInfo(target.researchSpecialization)
      };
    } else {
      return { success: false, reason: 'Operation failed' };
    }
  }

  // Galactic News
  async generateRumors(gameId: string, turn: number): Promise<Rumor[]> {
    // Generate 3 true + 2 false rumors
    // Mix them randomly
    // Store in database
  }

  // Announcements
  async createPublicAnnouncement(
    empireId: string,
    type: 'doctrine' | 'capstone',
    data: any
  ): Promise<void> {
    // Create galaxy-wide announcement
    // Notify all players
    // Trigger bot reactions
  }

  // Visibility checks
  async getVisibleResearchInfo(
    viewerEmpireId: string,
    targetEmpireId: string
  ): Promise<VisibleResearchInfo> {
    // Returns only what viewerEmpire can see about targetEmpire
    // Based on: public info, intel ops, alliance membership, combat history
  }
}
```

### 10.3 Combat Integration

```typescript
// src/lib/game/services/combat-service.ts

function applyResearchModifiers(
  attacker: Fleet,
  defender: Fleet
): CombatModifiers {
  const attackerResearch = await researchService.getResearchStatus(attacker.empireId);
  const defenderResearch = await researchService.getResearchStatus(defender.empireId);

  let modifiers: CombatModifiers = {};

  // War Machine: +2 STR
  if (attackerResearch.doctrine === 'war_machine') {
    modifiers.attackerSTRBonus = 2;
  }

  // Fortress: +4 AC when defending
  if (defenderResearch.doctrine === 'fortress') {
    modifiers.defenderACBonus = 4;
  }

  // Shock Troops: Surprise round
  if (attackerResearch.specialization === 'shock_troops') {
    if (defenderResearch.specialization !== 'shield_arrays') {
      modifiers.surpriseRound = true;
    }
  }

  // Shield Arrays: Negate surprise
  if (defenderResearch.specialization === 'shield_arrays') {
    modifiers.surpriseRound = false;
  }

  // Minefield Networks: CON save
  if (defenderResearch.specialization === 'minefield_networks') {
    modifiers.minefieldSave = true; // Attacker units roll CON save DC 15
  }

  // Siege Engines: Treat station AC as 10
  if (attackerResearch.specialization === 'siege_engines') {
    if (defender.hasStations) {
      modifiers.ignoreStationArmor = true;
    }
  }

  return modifiers;
}
```

### 10.4 UI Components

```typescript
// src/components/game/research/ResearchPanel.tsx
interface ResearchPanelProps {
  empire: Empire;
  onSelectDoctrine: (doctrine: Doctrine) => void;
  onSelectSpecialization: (spec: Specialization) => void;
}

// src/components/game/research/IntelPanel.tsx
// Shows known/unknown info about enemy empires
interface IntelPanelProps {
  targetEmpire: Empire;
  visibleInfo: VisibleResearchInfo;
  onInvestigate: (targetId: string) => void;
}

// src/components/game/research/GalacticNewsPanel.tsx
// Shows rumors (mix of true/false)
interface GalacticNewsPanelProps {
  rumors: Rumor[];
  currentTurn: number;
}

// src/components/game/research/ResearchAnnouncement.tsx
// Dramatic full-screen announcement for capstones
interface AnnouncementProps {
  empire: Empire;
  announcementType: 'doctrine' | 'capstone';
  data: any;
}
```

---

## 11. Balance Targets

### 11.1 Doctrine Distribution

| Doctrine | Target % | Reasoning |
|----------|----------|-----------|
| War Machine | 30-35% | Popular with aggressive players |
| Fortress | 30-35% | Popular with defensive players |
| Commerce | 30-35% | Economic players, support role |

**Goal:** No dominant choice, roughly even distribution.

### 11.2 Research Progression Timing

| Milestone | Target Turn | % of Games |
|-----------|-------------|------------|
| Tier 1 (Doctrine) | Turn 10-15 | 95% |
| Tier 2 (Specialization) | Turn 30-40 | 80% |
| Tier 3 (Capstone) | Turn 60-80 | 40-50% |

**Reasoning:** Not all games reach Turn 60+, capstones are late-game rewards.

### 11.3 Intel Operation Usage

| Metric | Target |
|--------|--------|
| % of players who investigate enemy specialization | 60-70% |
| Average investigations per game | 3-5 |
| Galactic News rumor trust rate | 50% (by design) |

### 11.4 Combat Impact

| Research Bonus | Expected Win Rate Increase |
|----------------|----------------------------|
| Doctrine advantage | +10-15% |
| Specialization advantage | +15-20% |
| Both advantages | +25-30% |
| Capstone unlocked | +40-50% (game-changing) |

---

## 12. Migration Plan

### 12.1 Development Path

**Week 1: Database & Core Service**
- Implement new schema
- Create ResearchService with basic methods
- Add RP accumulation logic

**Week 2: Doctrine System**
- Implement doctrine selection UI
- Add public announcement system
- Integrate doctrine bonuses with combat (STR/AC)

**Week 3: Specialization System**
- Implement specialization selection UI (hidden)
- Add specialization effects to combat
- Implement combat reveals (first use shows spec)

**Week 4: Intel & Visibility**
- Implement investigate operation
- Add alliance intel sharing
- Create Galactic News rumor generator

**Week 5: Capstone System**
- Implement capstone unlock logic
- Create dramatic announcement UI
- Add Dreadnought unit (example)

**Week 6: Bot Integration**
- Bot doctrine/spec decision logic
- Bot message templates (30+ messages)
- Bot reactions to player research

**Week 7: UI Polish**
- Research panel redesign
- Intel display improvements
- Announcement animations

**Week 8: Testing & Balance**
- Balance testing (win rates by doctrine)
- Intel operation cost tuning
- Rumor accuracy validation

### 12.2 Testing Requirements

**Unit Tests:**
- [ ] RP accumulation calculation
- [ ] Threshold detection (tier unlocks)
- [ ] Doctrine bonus application to STR/AC
- [ ] Specialization combat effects
- [ ] Intel operation success rate (85%)
- [ ] Rumor generation (60% true, 40% false mix)

**Integration Tests:**
- [ ] Full research progression (Tier 1 → 2 → 3)
- [ ] Combat with research modifiers applied
- [ ] Public announcement system
- [ ] Intel reveal through combat
- [ ] Alliance intel sharing

**Balance Tests:**
- [ ] 1000-game simulation: Doctrine distribution
- [ ] Win rate by doctrine matchup
- [ ] Capstone impact on victory probability
- [ ] Intel operation cost vs value

---

## 13. Conclusion

The Research system transforms tech progression from passive grinding into **strategic identity creation** with **asymmetric information gameplay**.

**Key Features:**
✅ 3-tier structure (Doctrine → Specialization → Capstone)
✅ **Hybrid visibility:** Public doctrines, hidden specializations
✅ **Intel gameplay:** Espionage operations, combat reveals, alliances
✅ **D20 integration:** Research modifies STR/DEX/CON directly
✅ **Galactic News:** Rumor system (50% accuracy)
✅ **Dramatic moments:** Public capstone announcements
✅ **Bot integration:** Archetype preferences, messaging, reactions
✅ **Rock-paper-scissors:** Specialization counter-play

**Implementation Priority:** Core game feature, Milestone 10.

---

## Related Documents

- [COMBAT-SYSTEM.md](COMBAT-SYSTEM.md) - D20 combat mechanics, STR/DEX/CON stats
- [SYNDICATE-SYSTEM.md](SYNDICATE-SYSTEM.md) - Intel operations integration
- [BOT-SYSTEM.md](BOT-SYSTEM.md) - Bot decision-making, commander stats
- [PRD.md](../PRD.md) - Product requirements document

---

**END SPECIFICATION**
