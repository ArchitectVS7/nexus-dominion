# Nexus Dominion: Complete D20 Combat Specification

**Version:** 2.0
**Status:** Canonical Combat Design
**Created:** 2026-01-11
**Replaces:** COMBAT-SYSTEM.md (v1.0), d20-exec-summary.md

---

## Document Purpose

This document provides the **complete specification** for Nexus Dominion's D20-based combat system. All combat mechanics, stat systems, and unit cards are defined here.

**Design Philosophy:**
- **Familiar D20 mechanics** (5% granularity, roll + modifiers ≥ threshold)
- **Card-based clarity** (all stats visible on unit cards)
- **Strategic depth** (multi-domain conflict, positioning, composition)
- **Boardgame feel** (easy to learn, dramatic moments, visible tactics)

---

## Table of Contents

1. [Core D20 System](#1-core-d20-system)
2. [Stat Framework](#2-stat-framework)
3. [Unit Cards](#3-unit-cards)
4. [Combat Resolution](#4-combat-resolution)
5. [Multi-Domain Battles](#5-multi-domain-battles)
6. [Fleet Composition](#6-fleet-composition)
7. [Rarity System](#7-rarity-system)
8. [Bot Integration](#8-bot-integration)
9. [Implementation Requirements](#9-implementation-requirements)

---

## 1. Core D20 System

### 1.1 Resolution Formula

**Universal Formula:**
```
d20 + (Relevant Stat Modifier) + Bonuses ≥ Target Defense
```

**Example:**
```
Light Cruiser attacks Heavy Cruiser
Roll: 14
Attacker ATK bonus: +5
Fleet coordination: +2
Total: 14 + 5 + 2 = 21

Defender DEF: 18
Result: 21 ≥ 18 → HIT
```

### 1.2 Why D20?

- **5% granularity** - Easy probability calculation
- **Threshold logic** - Clear success/failure
- **Familiar** - Players know D&D mechanics
- **Scales well** - Works for single units or fleets
- **Supports drama** - Critical successes (nat 20), critical failures (nat 1)

### 1.3 Critical Events

| Roll | Event | Effect |
|------|-------|--------|
| **Natural 20** | Critical Success | 2× damage, bypass 50% DEF |
| **Natural 1** | Critical Failure | Miss, lose 1 SPEED (initiative penalty next round) |
| **18-19** | Excellent Hit | +50% damage |
| **2-3** | Glancing Blow | -50% damage (if hit) |

---

## 2. Stat Framework

### 2.1 The Two Stat Groups

D&D's 6 classic stats are split into **Ship Stats** (3 physical abilities visible on cards) and **Commander Stats** (3 mental abilities affecting bot AI decisions).

### 2.2 Ship Stats (Physical Abilities)

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
STR  8 → -1 modifier
STR 10 → +0 modifier
STR 12 → +1 modifier
STR 14 → +2 modifier
STR 16 → +3 modifier
STR 18 → +4 modifier
STR 20 → +5 modifier
```

### 2.3 Derived Stats (Standard D20)

These are calculated from the three physical stats:

| Stat | Formula | Purpose |
|------|---------|---------|
| **HP (Hit Points)** | Base HP + (CON mod × level) | Damage absorption (0 = destroyed) |
| **AC (Armor Class)** | 10 + DEX mod + armor bonus | Defense threshold for enemy attacks |
| **Initiative** | DEX modifier | Turn order in combat |
| **Attack Bonus** | BAB + STR/DEX mod | Added to d20 roll to hit |
| **Damage** | Weapon dice + STR mod | HP damage dealt on hit |

**Base Attack Bonus (BAB)** by unit tier:
- Tier I units: BAB +2
- Tier II units: BAB +4
- Tier III units: BAB +6

### 2.4 Commander Stats (Mental Abilities - Bot AI Only)

These stats are **not on unit cards**. They belong to bot commanders and affect strategic decision-making.

| Stat | Abbrev | Range | Affects |
|------|--------|-------|---------|
| **Intelligence** | INT | 8-18 | Tech research speed, tactical adaptation |
| **Wisdom** | WIS | 8-18 | Strategic planning, retreat decisions, risk assessment |
| **Charisma** | CHA | 8-18 | Alliance formation, diplomacy, surrender negotiations |

**Commander Stats by Archetype:**

| Archetype | INT | WIS | CHA | Playstyle Impact |
|-----------|-----|-----|-----|------------------|
| **Warlord** | 12 (+1) | 14 (+2) | 8 (-1) | Good tactics, poor diplomacy |
| **Diplomat** | 13 (+1) | 14 (+2) | 18 (+4) | Excellent negotiations |
| **Tech Rush** | 17 (+3) | 12 (+1) | 10 (+0) | Fast research, logical |
| **Turtle** | 14 (+2) | 16 (+3) | 10 (+0) | Patient, excellent defense |
| **Schemer** | 13 (+1) | 15 (+2) | 16 (+3) | Manipulative, cunning |

**Example Bot Commander:**
```
Commander Varkus (Warlord Archetype)
─────────────────────────────────────
INT: 12 (+1) - Strategic Intelligence
WIS: 14 (+2) - Tactical Wisdom
CHA: 8  (-1) - Diplomatic Presence

Effects:
- +1 to tech research points/turn
- +2 to retreat timing decisions (d20+2 vs DC 15)
- -1 to alliance proposal persuasiveness
```

---

## 3. Unit Cards

### 3.1 Card Anatomy

Every unit in the game is represented as a card with this structure:

```
┌─────────────────────────────────────┐
│ [⚔️] HEAVY CRUISER      [TIER II]   │ ← Unit name + rarity
├─────────────────────────────────────┤
│ ABILITY SCORES                      │
│  STR: 16 (+3)  DEX: 12 (+1)        │ ← D&D ability scores
│  CON: 14 (+2)                       │
│                                     │
│ DERIVED STATS                       │
│  HP: 40  (base 20 + CON +2 × 10)   │ ← Hit points
│  AC: 15  (10 + DEX +1 + armor +4)  │ ← Armor class
│  Init: +1 (DEX modifier)            │ ← Initiative
│                                     │
│ ATTACK                              │
│  Heavy Cannons (ranged)             │
│  +5 to hit (BAB +4 + DEX +1)       │ ← Attack bonus
│  Damage: 2d8+3 (weapon + STR)       │ ← Damage dice
│                                     │
│ SPECIAL ABILITY                     │
│  Broadside: Attack 2 targets/round │
├─────────────────────────────────────┤
│ Cost: 15,000 💰 | Pop: 3 👥         │ ← Build cost
│ Domain: SPACE   | Maint: 50 🛢️      │ ← Tags
└─────────────────────────────────────┘
```

### 3.2 Card Elements Explained

**Top Bar:**
- **Icon:** Visual identifier (ship silhouette)
- **Unit Name:** Human-readable type
- **Tier:** Rarity indicator (I-Standard, II-Prototype, III-Singularity)

**Ability Scores Block:**
- **STR/DEX/CON:** Three physical stats with modifiers
- Standard D&D format: "16 (+3)"

**Derived Stats Block:**
- **HP:** Hit points (formula shown for clarity)
- **AC:** Armor class (threshold enemies must roll to hit)
- **Init:** Initiative modifier (turn order in combat)

**Attack Block:**
- **Weapon name:** Descriptive weapon type
- **To hit:** Attack bonus calculation (BAB + mod)
- **Damage:** Dice notation + STR modifier (e.g., "2d8+3")

**Ability Block:**
- **Special power description**
- **Mechanical effect**

**Footer:**
- **Cost:** Credits to build
- **Pop:** Population consumed
- **Domain:** SPACE, ORBITAL, or GROUND
- **Maintenance:** Petroleum/turn upkeep

### 3.3 Visual Design Principles

**Color Coding by Tier:**
- **Standard** (Green border) - Common baseline units
- **Prototype** (Blue border) - Advanced tech variants
- **Singularity** (Purple border) - Legendary units

**Stat Bars:**
- 10-segment visual bars (like fighting games)
- Filled segments = stat value (ATK 8 = 8 segments filled)
- Makes relative power instantly visible

**Icons:**
- ⚔️ Attack
- 🛡️ Defense
- ❤️ Hull
- ⚡ Maneuvering
- 💰 Credits
- 👥 Population
- 🛢️ Petroleum

---

## 4. Combat Resolution

### 4.1 Three Battle Types

| Type | Purpose | Restrictions | Resolution |
|------|---------|--------------|------------|
| **Full Invasion** | Capture sectors | Requires carriers | Multi-domain (Space/Orbital/Ground) |
| **Raid** | Harassment, weaken enemy | Soldiers only | Single domain (Ground) |
| **Blockade** | Economic warfare | Space units only | No sector capture |

**DEV NOTE** We need to make sure this makes sense from a narrative point of view. I shouldn't be able to do a "ground war only" if I don't get past space and orbital ranges - unless this is a covert guerilla type raid. 

### 4.2 Full Invasion (Multi-Domain)

Every contested sector resolves **three simultaneous battles**:

#### Domain Assignment Phase
```
Attacker assigns forces to domains:
- SPACE:   Fighters, Cruisers, Carriers
- ORBITAL: Stations, Bombers, Support ships
- GROUND:  Soldiers, Mechs (transported by carriers)

Defender auto-assigns based on stationed forces.
```

#### Resolution Order
```
1. SPACE BATTLE
   Winner gains +2 bonus to Orbital and Ground domains

2. ORBITAL BATTLE
   Winner gains +2 bonus to Ground domain

3. GROUND BATTLE
   Winner captures 5-15% of defender's sectors
```

**Victory Conditions:**
- **Total Victory:** Win all 3 domains → Capture 15% sectors
- **Decisive Victory:** Win 2 domains → Capture 10% sectors
- **Pyrrhic Victory:** Win 1 domain → Capture 5% sectors, heavy casualties
- **Stalemate:** Win 0 domains → No capture, mutual casualties
- **Defeat:** Lose all domains → Attacker retreats, 15% unit losses

### 4.3 Single Domain Resolution

Each domain battle follows this sequence:

**PHASE 1: Initiative**
```
Each side rolls: d20 + Highest MNV in fleet

Winner gains "Tactical Advantage Token"
- Reroll 1 failed attack this battle
- Strike first (resolve attacks before opponent)
```

**PHASE 2: Attack Rolls**
```
For each unit:
1. Roll d20 + ATK modifier
2. Compare to enemy's DEF
3. On hit: Deal damage = Unit's base damage
4. On crit (nat 20): Deal 2× damage

Example:
Heavy Cruiser (ATK +8, Base Damage: 12)
Roll: 14 + 8 = 22
vs Enemy DEF: 18
Result: HIT → Deal 12 damage
```

**PHASE 3: Apply Damage**
```
Damage is distributed across enemy units:
- Target priority: Lowest HULL units first
- Overkill damage carries to next unit
- Unit destroyed when HULL reaches 0
```

**PHASE 4: Morale Check**
```
If side loses 50%+ units:
Roll d20 + Commander WIS

DC 15: Pass → Fight to the end
DC 10-14: Shaken → -2 to all rolls next round
DC <10: Routed → Immediate retreat with losses
```

### 4.4 Retreat Mechanics

**Attacker Can Retreat:**
- At end of any combat round
- Must roll d20 + MNV (best unit) vs DC 12
- **Success:** Retreat safely
- **Failure:** Suffer "Attack of Opportunity" (15% casualties)

**Defender Cannot Retreat:**
- Defending home territory
- Fight until victory or defeat

### 4.5 Surrender Mechanics

**Defender May Surrender:**
```
Conditions (any trigger surrender roll):
- Lost 75%+ HULL across fleet
- Lost 2/3 domains decisively
- Commander morale roll failed twice

Surrender Roll:
d20 + Attacker's Commander CHA vs Defender's Commander WIS

Success: Defender surrenders
- Sector captured without further combat
- 50% of defender's units survive (scattered)

Failure: Fight continues
```

---

## 5. Multi-Domain Battles

### 5.1 Domain Interactions

Winning one domain affects others through **cross-domain bonuses**:

```
SPACE SUPERIORITY (win space domain)
→ +2 to Orbital attacks
→ +2 to Ground attacks
→ Enemy cannot retreat (blockaded)

ORBITAL CONTROL (win orbital domain)
→ +2 to Ground attacks
→ Bombardment: Deal 10% HULL damage to all ground units before combat
→ Defender's ground DEF -2

GROUND DOMINANCE (win ground domain)
→ Capture sectors
→ No effect on other domains
```

### 5.2 Combined Arms Doctrine

**Fleet Composition Bonuses:**

| Composition | Requirement | Bonus |
|-------------|-------------|-------|
| **Balanced Force** | 4+ different unit types | +15% to all stats |
| **Speed Wing** | 3+ units with MNV 5+ | Strike first, ignore initiative roll |
| **Defensive Wall** | 5+ Stations | 2× DEF bonus when defending |
| **Overwhelming Force** | 20+ total units | Intimidation: Enemy morale -2 |
| **Surgical Strike** | All units MNV 6+ | +3 to initiative, retreat always succeeds |

---

## 6. Fleet Composition

### 6.1 Rock-Paper-Scissors Layer

Unit types have advantages against specific enemies:

```
FIGHTERS ──(+2 ATK)──→ BOMBERS ──(+2 ATK)──→ CRUISERS ──(+2 ATK)──→ FIGHTERS
    ↑                                                                   ↓
    └───────────────────────── STATIONS (2× DEF vs all) ──────────────┘
```

**Example:**
```
Fighter (ATK +5) attacks Bomber (DEF 12)
Roll: 12 + 5 + 2 (type advantage) = 19
vs DEF 12 → HIT
```

### 6.2 Unit Type Matrix

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

## 7. Rarity System

### 7.1 Three Tiers

| Tier | Name | Design Intent | Stat Scaling |
|------|------|---------------|--------------|
| **Tier I** | Standard-Issue | Baseline units | Stats 8-12 |
| **Tier II** | Prototype | Tech-enhanced | Stats 12-16 |
| **Tier III** | Singularity-Class | Elite/legendary | Stats 16-20 |

### 7.2 Tier Progression

**How Players Obtain:**
```
TIER I (Standard):
- Available from Turn 1
- Purchased with credits
- Default build queue options

TIER II (Prototype):
- Unlocked via research (specific tech branches)
- Draft events: Draw 2, keep 1 (every 10 turns)
- Costs 2× credits of Tier I

TIER III (Singularity):
- Ultra-rare draft at Turn 50+
- Only 1 per game per player
- Costs 5× credits of Tier I
- Public announcement to all players when drafted
```

### 7.3 Example Unit Progression

**Line Cruiser Evolution:**

**TIER I: Standard-Issue Line Cruiser**
```
┌─────────────────────────────────────┐
│ LINE CRUISER            [TIER I]    │
├─────────────────────────────────────┤
│ STR: 12 (+1)  DEX: 12 (+1)         │
│ CON: 12 (+1)                        │
│                                     │
│ HP: 18  (base 10 + CON +1 × 8)     │
│ AC: 13  (10 + DEX +1 + armor +2)   │
│ Init: +1                            │
│                                     │
│ Attack: Laser Batteries             │
│ +3 to hit (BAB +2 + DEX +1)        │
│ Damage: 1d10+1                      │
│                                     │
│ ABILITY: Steady Barrage             │
│ +1 damage on hit                    │
├─────────────────────────────────────┤
│ Cost: 5,000 💰 | Pop: 2 👥          │
│ Domain: SPACE  | Maint: 25 🛢️       │
└─────────────────────────────────────┘
```

**TIER II: Prototype Line Cruiser**
```
┌─────────────────────────────────────┐
│ LINE CRUISER            [TIER II]   │
├─────────────────────────────────────┤
│ STR: 14 (+2)  DEX: 14 (+2)         │
│ CON: 14 (+2)                        │
│                                     │
│ HP: 26  (base 10 + CON +2 × 8)     │
│ AC: 15  (10 + DEX +2 + armor +3)   │
│ Init: +2                            │
│                                     │
│ Attack: Plasma Batteries            │
│ +6 to hit (BAB +4 + DEX +2)        │
│ Damage: 1d12+2                      │
│                                     │
│ ABILITY: Linked Targeting           │
│ Reroll 1 miss per round             │
├─────────────────────────────────────┤
│ Cost: 10,000 💰 | Pop: 2 👥         │
│ Domain: SPACE   | Maint: 30 🛢️      │
└─────────────────────────────────────┘
```

**TIER III: Singularity-Class Line Cruiser**
```
┌─────────────────────────────────────┐
│ LINE CRUISER            [TIER III]  │
├─────────────────────────────────────┤
│ STR: 18 (+4)  DEX: 16 (+3)         │
│ CON: 16 (+3)                        │
│                                     │
│ HP: 34  (base 10 + CON +3 × 8)     │
│ AC: 18  (10 + DEX +3 + armor +5)   │
│ Init: +3                            │
│                                     │
│ Attack: Antimatter Cannons          │
│ +9 to hit (BAB +6 + DEX +3)        │
│ Damage: 2d10+4                      │
│                                     │
│ ABILITY: Overload Salvo             │
│ Once per battle: Extra attack at    │
│ +4 to hit, then -2 AC until end     │
├─────────────────────────────────────┤
│ Cost: 25,000 💰 | Pop: 3 👥         │
│ Domain: SPACE   | Maint: 50 🛢️      │
└─────────────────────────────────────┘
```

---

## 8. Bot Integration

### 8.1 Commander Stats in Action

Every bot has 3 commander stats that affect behavior:

**WIS (Tactical Wisdom):**
```
Effects:
- Retreat timing: WIS check vs DC 15
- Risk assessment: WIS modifier to "should I attack?" calculation
- Morale threshold: WIS + d20 vs enemy threat level

Example:
Bot with WIS 16 (+3):
- Retreats smartly (high success rate on DC 15 checks)
- Avoids bad fights (bonus to risk calculation)
- Holds morale longer under pressure
```

**CHA (Diplomatic Presence):**
```
Effects:
- Alliance formation: CHA check vs target's WIS
- Surrender negotiations: CHA vs enemy WIS to end combat early
- Coalition leadership: Highest CHA in coalition = leader

Example:
Diplomat bot with CHA 18 (+4):
- Forms alliances easily (+4 to persuasion)
- Can talk enemies into surrendering
- Natural coalition leader
```

**INT (Strategic Intelligence):**
```
Effects:
- Tech research speed: INT modifier to research points/turn
- Counter-picking: INT check to identify enemy weaknesses
- Adaptation: INT + d20 to learn from defeats

Example:
Tech Rush bot with INT 17 (+3):
- +3 research points per turn
- Frequently counter-picks in drafts
- Adapts strategy after losing battles
```

### 8.2 Bot Card Drafting

**Tier I (Turn 1 Secret Draft):**
```
Each bot draws 3 cards, keeps 1 (hidden objective)

Warlord bot:
- Prefers: "Conqueror's Pride" (+2 VP per empire eliminated)
- Avoids: "Peaceful Prosperity" (+1 VP per treaty)

Diplomat bot:
- Prefers: "Alliance Network" (+2 VP per active treaty)
- Avoids: "Warmonger's Arsenal"
```

**Tier II (Public Drafts Every 10 Turns):**
```
Turn 20 Draft Event:
1. All players notified: "TECH DRAFT AVAILABLE"
2. Each empire draws 2 cards simultaneously
3. 30-second timer to choose 1
4. Choices revealed publicly

Bot Warlord drafts "Plasma Torpedoes" (+2 ATK space domain)
→ Sends message: "My fleets grow stronger. Your shields won't save you."
→ Other bots react:
   - Turtle bot: Queues "Shield Arrays" research
   - Diplomat bot: Proposes alliance against Warlord
```

**Tier III (Singularity Draft at Turn 50+):**
```
GALAXY-WIDE ANNOUNCEMENT:
"Commander Varkus has obtained PLANET CRACKER technology!"

Effects:
- All bots see the card
- Tier 1 LLM bots generate dramatic responses
- Defensive coalitions may form automatically
```

### 8.3 Bot Combat Behavior

**Archetype-Specific Combat Styles:**

**Warlord:**
- **Aggression:** 9/10 - Attacks frequently
- **Retreat Threshold:** 25% HULL remaining
- **Favored Units:** Heavy Cruisers, Bombers
- **Draft Preference:** +ATK cards
- **WIS 14, CHA 8, INT 12** - Good tactics, poor diplomacy

**Turtle:**
- **Aggression:** 2/10 - Only attacks when threatened
- **Retreat Threshold:** Never retreats (fights to 0 HULL)
- **Favored Units:** Stations, Light Cruisers
- **Draft Preference:** +DEF cards
- **WIS 16, CHA 10, INT 14** - Excellent defense, patient

**Schemer:**
- **Aggression:** 6/10 - Opportunistic strikes
- **Retreat Threshold:** 50% HULL (preserves forces)
- **Favored Units:** Covert Agents, Bombers
- **Draft Preference:** Disruption cards (morale attacks)
- **WIS 15, CHA 16, INT 13** - Manipulative, unpredictable

---

## 9. Implementation Requirements

### 9.1 Phase 1: Unit Card System

**Database Schema:**
```sql
CREATE TABLE unit_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  tier INTEGER NOT NULL, -- 1, 2, 3

  -- Physical ability scores (D&D stats)
  strength INTEGER NOT NULL,     -- 8-20
  dexterity INTEGER NOT NULL,    -- 8-20
  constitution INTEGER NOT NULL, -- 8-20

  -- Derived stats (calculated from above)
  base_hp INTEGER NOT NULL,          -- Base hit points before CON modifier
  armor_bonus INTEGER NOT NULL,      -- Natural armor bonus (added to AC calculation)
  base_attack_bonus INTEGER NOT NULL, -- BAB based on tier (2/4/6)

  -- Weapon
  weapon_name TEXT NOT NULL,         -- e.g., "Heavy Cannons"
  weapon_damage_dice TEXT NOT NULL,  -- e.g., "2d8" (STR mod added automatically)
  weapon_type TEXT NOT NULL,         -- 'melee' or 'ranged'

  -- Special ability
  ability_name TEXT,
  ability_description TEXT,
  ability_mechanics JSONB,

  -- Build info
  cost_credits INTEGER NOT NULL,
  cost_population DECIMAL NOT NULL,
  maintenance_petroleum INTEGER NOT NULL,
  domain TEXT NOT NULL, -- 'SPACE', 'ORBITAL', 'GROUND'

  -- Type advantages
  strong_vs TEXT[], -- ['bombers', 'fighters']
  weak_vs TEXT[],

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE empire_units (
  id UUID PRIMARY KEY,
  empire_id UUID REFERENCES empires(id),
  template_id UUID REFERENCES unit_templates(id),
  quantity INTEGER NOT NULL,
  current_hull INTEGER, -- For damaged units
  stationed_sector_id UUID REFERENCES sectors(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI Components:**
```typescript
// src/components/game/units/UnitCard.tsx
interface UnitCardProps {
  unit: UnitTemplate;
  quantity?: number;
  showCost?: boolean;
  onClick?: () => void;
}

// src/components/game/combat/FleetCompositionPanel.tsx
// Shows all units assigned to Space/Orbital/Ground domains

// src/components/game/combat/CombatPreview.tsx
// D20 preview with modifiers breakdown
```

### 9.2 Phase 2: D20 Combat Engine

**Core Services:**
```typescript
// src/lib/combat/d20-combat-engine.ts
export class D20CombatEngine {
  resolveInvasion(
    attacker: Fleet,
    defender: Fleet,
    sector: Sector
  ): CombatResult;

  resolveDomainBattle(
    attackerUnits: Unit[],
    defenderUnits: Unit[],
    domain: 'SPACE' | 'ORBITAL' | 'GROUND',
    bonuses: DomainBonuses
  ): DomainResult;

  rollInitiative(fleet: Fleet): number;
  rollAttack(unit: Unit, target: Unit, bonuses: Bonuses): AttackResult;
  applyDamage(unit: Unit, damage: number): void;
  checkMorale(fleet: Fleet, commanderWis: number): MoraleResult;
}

// src/lib/combat/combat-calculator.ts
export function calculateFleetPower(units: Unit[]): number;
export function getTypeAdvantage(attacker: UnitType, defender: UnitType): number;
export function getCompositionBonus(units: Unit[]): CompositionBonus | null;
```

### 9.3 Phase 3: Card Draft System

**Draft Events:**
```typescript
// src/lib/game/services/draft-service.ts
export class DraftService {
  // Turn 1: Secret draft (hidden objectives)
  initiateSecretDraft(gameId: string): Promise<void>;

  // Every 10 turns: Public tech draft
  initiatePublicDraft(gameId: string, turn: number): Promise<void>;

  // Turn 50+: Singularity draft
  initiateSingularityDraft(gameId: string): Promise<void>;

  // Bot draft AI
  botSelectCard(
    bot: Empire,
    options: UnitTemplate[],
    draftType: 'secret' | 'public' | 'singularity'
  ): UnitTemplate;
}
```

### 9.4 Phase 4: Bot Commander Stats

**Schema Addition:**
```sql
ALTER TABLE empires ADD COLUMN commander_intelligence INTEGER DEFAULT 10;
ALTER TABLE empires ADD COLUMN commander_wisdom INTEGER DEFAULT 10;
ALTER TABLE empires ADD COLUMN commander_charisma INTEGER DEFAULT 10;

-- Generate based on archetype (Warlord example)
UPDATE empires SET
  commander_intelligence = 12,  -- +1 modifier
  commander_wisdom = 14,         -- +2 modifier
  commander_charisma = 8         -- -1 modifier
WHERE archetype = 'warlord';

-- Other archetypes (see Section 2.4 for full table)
UPDATE empires SET commander_intelligence = 17, commander_wisdom = 12, commander_charisma = 10 WHERE archetype = 'tech_rush';
UPDATE empires SET commander_intelligence = 13, commander_wisdom = 14, commander_charisma = 18 WHERE archetype = 'diplomat';
UPDATE empires SET commander_intelligence = 14, commander_wisdom = 16, commander_charisma = 10 WHERE archetype = 'turtle';
UPDATE empires SET commander_intelligence = 13, commander_wisdom = 15, commander_charisma = 16 WHERE archetype = 'schemer';
```

**Bot Decision Modifiers:**
```typescript
// src/lib/bots/decision-engine.ts
export function calculateAttackDesirability(
  bot: Empire,
  target: Empire,
  gameState: GameState
): number {
  const baseDesire = bot.archetype.aggression;
  const wisModifier = getModifier(bot.commander_wis);
  const riskAssessment = assessRisk(bot, target);

  // WIS reduces reckless attacks
  return baseDesire - (wisModifier * riskAssessment);
}
```

### 9.5 Balance Targets

**Combat Win Rates (Equal Forces):**
- Attacker: 45-48%
- Defender: 52-55%
- Stalemate: 5-10%

**Type Advantage Impact:**
- +2 ATK advantage = +15-20% win rate
- Composition bonus = +10-15% power
- Domain superiority = +20-25% win rate in next domain

**Critical Event Frequency:**
- Natural 20: 5% of rolls (expected)
- Natural 1: 5% of rolls (expected)
- Morale breaks: 10-15% of battles with 50%+ casualties

---

## 10. Migration Plan

### 10.1 From Scratch Rewrite

**Development Path:**
```
Week 1: Create unit_templates table with Tier I units
Week 2: Implement D20 combat engine (single-domain first)
Week 3: Add multi-domain battle resolution
Week 4: Implement card UI components
Week 5: Add draft system (Tier II/III cards)
Week 6: Integrate bot commander stats
Week 7: Balance testing and tuning
Week 8: Full deployment
```

### 10.2 Testing Requirements

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

## 11. Card Gallery (Reference)

### 11.1 Space Units

**FIGHTERS (Tier I)**
```
┌─────────────────────────────────────┐
│ FIGHTER WING            [TIER I]    │
├─────────────────────────────────────┤
│ STR: 10 (+0)  DEX: 16 (+3)         │
│ CON: 8  (-1)                        │
│                                     │
│ HP: 8   (base 10 + CON -1 × 2)     │
│ AC: 15  (10 + DEX +3 + armor +2)   │
│ Init: +3                            │
│                                     │
│ Attack: Laser Cannons               │
│ +5 to hit (BAB +2 + DEX +3)        │
│ Damage: 1d6+0                       │
│                                     │
│ ABILITY: Intercept                  │
│ +2 to hit vs Bombers                │
├─────────────────────────────────────┤
│ Cost: 200 💰   | Pop: 0.4 👥        │
│ Domain: SPACE  | Maint: 5 🛢️        │
└─────────────────────────────────────┘
```

**HEAVY CRUISER (Tier II)**
```
┌─────────────────────────────────────┐
│ HEAVY CRUISER           [TIER II]   │
├─────────────────────────────────────┤
│ STR: 16 (+3)  DEX: 12 (+1)         │
│ CON: 14 (+2)                        │
│                                     │
│ HP: 40  (base 20 + CON +2 × 10)    │
│ AC: 15  (10 + DEX +1 + armor +4)   │
│ Init: +1                            │
│                                     │
│ Attack: Heavy Cannons               │
│ +5 to hit (BAB +4 + DEX +1)        │
│ Damage: 2d8+3                       │
│                                     │
│ ABILITY: Broadside                  │
│ Attack 2 targets per round          │
├─────────────────────────────────────┤
│ Cost: 15,000 💰 | Pop: 3 👥         │
│ Domain: SPACE   | Maint: 50 🛢️      │
└─────────────────────────────────────┘
```

### 11.2 Orbital Units

**ORBITAL DEFENSE STATION (Tier I)**
```
┌─────────────────────────────────────┐
│ DEFENSE STATION         [TIER I]    │
├─────────────────────────────────────┤
│ STR: 12 (+1)  DEX: 10 (+0)         │
│ CON: 14 (+2)                        │
│                                     │
│ HP: 20  (base 12 + CON +2 × 4)     │
│ AC: 13  (10 + DEX +0 + armor +3)   │
│ AC: 18 when defending (fortified)   │
│ Init: +0                            │
│                                     │
│ Attack: Defense Turrets             │
│ +3 to hit (BAB +2 + DEX +0)        │
│ Damage: 1d8+1                       │
│                                     │
│ ABILITY: Planetary Bombardment      │
│ +2 damage to Ground domain units    │
├─────────────────────────────────────┤
│ Cost: 3,000 💰 | Pop: 1 👥          │
│ Domain: ORBITAL | Maint: 15 🛢️      │
└─────────────────────────────────────┘
```

### 11.3 Ground Units

**MECHANIZED LEGION (Tier I)**
```
┌─────────────────────────────────────┐
│ MECHANIZED LEGION       [TIER I]    │
├─────────────────────────────────────┤
│ STR: 12 (+1)  DEX: 10 (+0)         │
│ CON: 12 (+1)                        │
│                                     │
│ HP: 14  (base 10 + CON +1 × 4)     │
│ AC: 14  (10 + DEX +0 + armor +4)   │
│ Init: +0                            │
│                                     │
│ Attack: Heavy Weapons               │
│ +3 to hit (BAB +2 + STR +1)        │
│ Damage: 1d8+1                       │
│                                     │
│ ABILITY: Entrenched                 │
│ +2 AC when defending                │
├─────────────────────────────────────┤
│ Cost: 1,000 💰 | Pop: 1 👥          │
│ Domain: GROUND | Maint: 10 🛢️       │
└─────────────────────────────────────┘
```

---

## 12. Conclusion

This specification provides a **complete, implementable D20 combat system** that:

✅ Uses familiar D20 mechanics (roll + modifiers ≥ threshold)
✅ **Full OGL compliance** with standard STR/DEX/CON ability scores
✅ **HP, AC, and BAB** calculated using D&D conventions
✅ **Damage dice notation** (2d8+3) familiar to tabletop gamers
✅ Splits ship stats (STR/DEX/CON - physical) from commander stats (INT/WIS/CHA - mental)
✅ Supports multi-domain battles (Space/Orbital/Ground)
✅ Includes fleet composition bonuses and type advantages
✅ Integrates with bot archetypes and personality system
✅ Provides rarity tiers and draft mechanics
✅ Maintains balance targets (45-48% attacker win rate)


---

**END SPECIFICATION**
