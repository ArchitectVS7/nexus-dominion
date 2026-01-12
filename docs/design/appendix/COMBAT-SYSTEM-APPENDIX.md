# Combat System: Implementation Appendix

**Parent Document:** [COMBAT-SYSTEM.md](../COMBAT-SYSTEM.md)
**Purpose:** Code examples, database schemas, and reference materials for combat system implementation.

---

## Table of Contents

- [A. Database Schema](#a-database-schema)
- [B. Service Architecture](#b-service-architecture)
- [C. UI Components](#c-ui-components)
- [D. Bot Decision Engine](#d-bot-decision-engine)
- [E. Unit Card Gallery](#e-unit-card-gallery)

---

## A. Database Schema

### A.1 Unit Templates Table

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
```

### A.2 Empire Units Table

```sql
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

### A.3 Commander Stats Schema Addition

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

-- Other archetypes
UPDATE empires SET commander_intelligence = 17, commander_wisdom = 12, commander_charisma = 10 WHERE archetype = 'tech_rush';
UPDATE empires SET commander_intelligence = 13, commander_wisdom = 14, commander_charisma = 18 WHERE archetype = 'diplomat';
UPDATE empires SET commander_intelligence = 14, commander_wisdom = 16, commander_charisma = 10 WHERE archetype = 'turtle';
UPDATE empires SET commander_intelligence = 13, commander_wisdom = 15, commander_charisma = 16 WHERE archetype = 'schemer';
```

---

## B. Service Architecture

### B.1 D20 Combat Engine

```typescript
// src/lib/combat/d20-combat-engine.ts

export interface DomainBonuses {
  spaceBonus: number;
  orbitalBonus: number;
  groundBonus: number;
}

export interface AttackResult {
  roll: number;
  totalAttack: number;
  hit: boolean;
  critical: boolean;
  damage: number;
}

export interface DomainResult {
  winner: 'attacker' | 'defender' | 'stalemate';
  attackerCasualties: number;
  defenderCasualties: number;
  moraleBreaks: boolean;
}

export interface CombatResult {
  spaceResult: DomainResult;
  orbitalResult: DomainResult;
  groundResult: DomainResult;
  sectorsCapture: number; // 0, 5, 10, or 15 percent
  outcome: 'total_victory' | 'decisive_victory' | 'pyrrhic_victory' | 'stalemate' | 'defeat';
}

export class D20CombatEngine {
  /**
   * Resolve a full invasion across all three domains
   * @spec REQ-COMBAT-001
   * @spec REQ-COMBAT-009
   */
  resolveInvasion(
    attacker: Fleet,
    defender: Fleet,
    sector: Sector
  ): CombatResult;

  /**
   * Resolve a single domain battle
   * @spec REQ-COMBAT-001
   */
  resolveDomainBattle(
    attackerUnits: Unit[],
    defenderUnits: Unit[],
    domain: 'SPACE' | 'ORBITAL' | 'GROUND',
    bonuses: DomainBonuses
  ): DomainResult;

  /**
   * Roll initiative for a fleet
   */
  rollInitiative(fleet: Fleet): number;

  /**
   * Roll an attack and determine hit/damage
   * @spec REQ-COMBAT-001
   */
  rollAttack(unit: Unit, target: Unit, bonuses: Bonuses): AttackResult;

  /**
   * Apply damage to a unit
   */
  applyDamage(unit: Unit, damage: number): void;

  /**
   * Check fleet morale after heavy casualties
   * @spec REQ-COMBAT-012
   */
  checkMorale(fleet: Fleet, commanderWis: number): MoraleResult;
}
```

### B.2 Combat Calculator

```typescript
// src/lib/combat/combat-calculator.ts

/**
 * Calculate total fleet power
 * @spec REQ-COMBAT-004
 */
export function calculateFleetPower(units: Unit[]): number;

/**
 * Get type advantage bonus between unit types
 */
export function getTypeAdvantage(attacker: UnitType, defender: UnitType): number;

/**
 * Determine if fleet qualifies for a composition bonus
 * @spec REQ-COMBAT-005
 */
export function getCompositionBonus(units: Unit[]): CompositionBonus | null;

/**
 * Calculate D&D stat modifier from ability score
 */
export function getStatModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
```

### B.3 Draft Service

```typescript
// src/lib/game/services/draft-service.ts

export class DraftService {
  /**
   * Turn 1: Secret draft (hidden objectives)
   */
  initiateSecretDraft(gameId: string): Promise<void>;

  /**
   * Every 10 turns: Public tech draft
   */
  initiatePublicDraft(gameId: string, turn: number): Promise<void>;

  /**
   * Turn 50+: Singularity draft
   * @spec REQ-COMBAT-011
   */
  initiateSingularityDraft(gameId: string): Promise<void>;

  /**
   * Bot draft AI - select card based on archetype preferences
   */
  botSelectCard(
    bot: Empire,
    options: UnitTemplate[],
    draftType: 'secret' | 'public' | 'singularity'
  ): UnitTemplate;
}
```

---

## C. UI Components

### C.1 Unit Card Component

```typescript
// src/components/game/units/UnitCard.tsx

interface UnitCardProps {
  unit: UnitTemplate;
  quantity?: number;
  showCost?: boolean;
  onClick?: () => void;
}

export function UnitCard({ unit, quantity, showCost, onClick }: UnitCardProps) {
  // Renders a unit card with:
  // - Tier indicator (color-coded border)
  // - Ability scores (STR/DEX/CON with modifiers)
  // - Derived stats (HP, AC, Initiative)
  // - Attack info (weapon name, to-hit, damage dice)
  // - Special ability
  // - Cost footer (if showCost)
}
```

### C.2 Fleet Composition Panel

```typescript
// src/components/game/combat/FleetCompositionPanel.tsx

interface FleetCompositionPanelProps {
  fleet: Fleet;
  onAssignUnit: (unit: Unit, domain: Domain) => void;
}

export function FleetCompositionPanel({ fleet, onAssignUnit }: FleetCompositionPanelProps) {
  // Shows all units assigned to Space/Orbital/Ground domains
  // Displays composition bonus if applicable
  // Allows drag-drop reassignment
}
```

### C.3 Combat Preview

```typescript
// src/components/game/combat/CombatPreview.tsx

interface CombatPreviewProps {
  attacker: Fleet;
  defender: Fleet;
  sector: Sector;
}

export function CombatPreview({ attacker, defender, sector }: CombatPreviewProps) {
  // D20 preview showing:
  // - Attack roll modifiers breakdown
  // - Estimated hit probability
  // - Domain-by-domain power comparison
  // - Predicted outcome range
}
```

---

## D. Bot Decision Engine

### D.1 Attack Desirability Calculation

```typescript
// src/lib/bots/decision-engine.ts

/**
 * Calculate how much a bot wants to attack a target
 * Uses commander WIS to assess risk
 */
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

/**
 * Assess risk of attacking a target
 */
function assessRisk(bot: Empire, target: Empire): number {
  const powerRatio = calculateFleetPower(target.units) / calculateFleetPower(bot.units);
  const allianceRisk = target.allies.length * 0.2;
  return powerRatio + allianceRisk;
}
```

### D.2 Retreat Decision

```typescript
// src/lib/bots/combat-decisions.ts

/**
 * Determine if bot should retreat from combat
 * Uses commander WIS for retreat timing
 */
export function shouldRetreat(
  bot: Empire,
  currentHullPercent: number,
  combatState: CombatState
): boolean {
  const retreatThreshold = bot.archetype.retreatThreshold;

  // Turtle archetype never retreats (fights to 0 HULL)
  if (bot.archetype.name === 'turtle') return false;

  // WIS check to make smart retreat decision
  if (currentHullPercent <= retreatThreshold) {
    const wisCheck = rollD20() + getModifier(bot.commander_wis);
    return wisCheck >= 15; // DC 15 to recognize retreat is smart
  }

  return false;
}
```

---

## E. Unit Card Gallery

### E.1 Space Units

**FIGHTER WING (Tier I)**
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

**LINE CRUISER (Tier I)**
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

**LINE CRUISER (Tier II)**
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

**LINE CRUISER (Tier III)**
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

### E.2 Orbital Units

**DEFENSE STATION (Tier I)**
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

### E.3 Ground Units

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

**END APPENDIX**
