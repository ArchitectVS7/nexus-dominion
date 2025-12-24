# Parallel Work Plan - X-Imperium

**Status:** M0 ✅ Complete | M1 ✅ Complete | Currently implementing: M2

This document tracks safe parallel work that can be done alongside each milestone to accelerate development.

---

## ✅ COMPLETED Parallel Work

### During M0-M1
- ✅ **M2-M4 Database Schemas** (2024-12-24)
  - `civil_status_history`, `build_queue`, `research_progress`, `unit_upgrades`
  - `attacks`, `combat_logs`
- ✅ **M8 Bot Personas** (2024-12-24)
  - All 100 unique bot personas with voices, quirks, catchphrases
  - 6 complete template sets (Merlin, Dravos, Redmaw, Synergy, Collective One, Thalen)

---

## 🔄 Parallel to M2: Turn Engine

**What M2 is doing:** Implementing turn processing, civil status system, population mechanics

**Safe parallel work:**

### 1. Pure Calculation Functions ⭐ HIGH VALUE
**Location:** `src/lib/formulas/`
**Time:** 2-3 hours
**Risk:** ⭐ Very Low - pure functions, no dependencies

**Files to create:**
```typescript
// src/lib/formulas/networth.ts
export function calculateNetworth(empire: Empire): number {
  // PRD 4.5 formula
  // Planets × 10 + Soldiers × 0.0005 + Fighters × 0.001 + ...
}

// src/lib/formulas/combat-power.ts
export function calculateCombatPower(forces: Forces, phase: CombatPhase): number {
  // PRD 6.2 formulas
}

export function calculateDiversityBonus(forces: Forces): number {
  // +15% for 4+ unit types
}

export function calculateDefenderAdvantage(): number {
  // × 1.2 multiplier
}

export function calculateCasualties(
  attackerPower: number,
  defenderPower: number
): Casualties {
  // 15-35% dynamic casualty calculation
}

// src/lib/formulas/research-costs.ts
export function calculateResearchCost(level: number): number {
  // Exponential growth from PRD 9.1
}

// src/lib/formulas/planet-costs.ts
export function calculatePlanetCost(basePrice: number, ownedCount: number): number {
  // BaseCost × (1 + OwnedPlanets × 0.05)
}

export function calculateReleaseRefund(purchasePrice: number): number {
  // 50% refund
}

// src/lib/formulas/civil-status.ts
export function getCivilStatusMultiplier(status: CivilStatus): number {
  // PRD 4.4: Ecstatic 4×, Content 2×, Unhappy 0×, etc.
}

export function calculatePopulationGrowth(
  population: number,
  foodSurplus: number
): number {
  // Growth rate calculation
}

export function calculateFoodConsumption(population: number): number {
  // 0.05 food per citizen per turn
}
```

### 2. Constants & Configuration ⭐ MEDIUM VALUE
**Location:** `src/lib/constants/`
**Time:** 1 hour
**Risk:** ⭐ None - static values from PRD

**Files to create:**
```typescript
// src/lib/constants/units.ts
export const UNIT_COSTS = {
  soldiers: 50,
  fighters: 200,
  light_cruisers: 500,
  heavy_cruisers: 1000,
  carriers: 2500,
  stations: 5000,
  covert_agents: 4090,
} as const;

export const UNIT_MAINTENANCE = {
  soldiers: 0.5,
  fighters: 2,
  // ... from PRD 6.1
} as const;

export const BUILD_TIMES = {
  soldiers: 1,
  fighters: 1,
  // ... instant or 1 turn from PRD
} as const;

// src/lib/constants/planets.ts
export const PLANET_PRODUCTION = {
  food: 160,
  ore: 112,
  petroleum: 92,
  tourism: 8000,
  // ... all 10 types from PRD 5.1
} as const;

export const PLANET_MAINTENANCE = 168; // credits per planet per turn

export const PLANET_BASE_COSTS = {
  food: 10000,
  ore: 10000,
  // ... base acquisition costs
} as const;

// src/lib/constants/game.ts
export const TURN_LIMIT = 200;
export const PROTECTION_TURNS = 20;
export const STARTING_CREDITS = 100000;
export const STARTING_POPULATION = 10000;
```

### 3. Remaining M8 Message Templates ⭐⭐ HIGH VALUE
**Location:** `data/templates/`
**Time:** 6-8 hours (can be incremental)
**Risk:** ⭐ None - pure data

**What to create:**
- Complete template files for remaining 94 personas
- Follow the pattern established by Merlin, Dravos, Redmaw, etc.
- 30-45 messages per persona across 15 categories

**Prioritize:**
- Remaining Schemers (11 personas) - dramatic betrayals!
- Remaining Warlords (11 personas) - varied military styles
- Remaining Merchants (10 personas) - economic focus
- Then: Diplomats, Turtles, Blitzkrieg, Tech Rush, Opportunists

### 4. UI Component Shells ⭐ LOW-MEDIUM VALUE
**Location:** `src/components/game/`
**Time:** 1-2 hours
**Risk:** ⭐⭐ Low - empty shells only

**Files to create:**
```typescript
// src/components/game/CivilStatusIndicator.tsx
// Empty component with props interface, no logic

// src/components/game/PopulationCounter.tsx
// Empty component with props interface

// src/components/game/TurnCounter.tsx
// Empty component with props interface
```

---

## 🔄 Parallel to M3: Planet, Units & Research

**What M3 is doing:** Building planet management, unit construction, build queues, research system

**Safe parallel work:**

### 1. M4 Combat UI Components ⭐⭐ MEDIUM VALUE
**Location:** `src/components/game/combat/`
**Time:** 2-3 hours
**Risk:** ⭐⭐ Low - UI shells

**Files to create:**
```typescript
// src/components/game/combat/BattleReport.tsx
interface BattleReportProps {
  attack: Attack;
  phases: CombatLog[];
}
// Component shell showing 3-phase combat breakdown

// src/components/game/combat/AttackInterface.tsx
// Interface for launching attacks

// src/components/game/combat/CombatPreview.tsx
// Shows power comparison before attacking

// src/components/game/combat/CasualtyReport.tsx
// Shows losses from battle
```

### 2. M4 Combat Resolution Logic (Pure Functions) ⭐⭐⭐ HIGH VALUE
**Location:** `src/lib/combat/`
**Time:** 3-4 hours
**Risk:** ⭐⭐ Low-Medium - well-specified in PRD

**Files to create:**
```typescript
// src/lib/combat/phases.ts
export function resolveSpaceCombat(
  attackerForces: Forces,
  defenderForces: Forces
): PhaseResult {
  // PRD 6.7 Phase 1: Cruisers vs Cruisers
}

export function resolveOrbitalCombat(
  attackerForces: Forces,
  defenderForces: Forces
): PhaseResult {
  // PRD 6.7 Phase 2: Fighters vs Stations
}

export function resolveGroundCombat(
  attackerForces: Forces,
  defenderForces: Forces
): PhaseResult {
  // PRD 6.7 Phase 3: Soldiers capture
}

// src/lib/combat/effectiveness.ts
export function getUnitEffectiveness(
  unitType: UnitType,
  phase: CombatPhase,
  isDefender: boolean
): number {
  // PRD 6.7 Unit Effectiveness Matrix
}

export function calculateArmyEffectivenessChange(
  outcome: CombatOutcome,
  powerRatio: number
): number {
  // +5-10% on victory, -5% on defeat
}
```

### 3. M6.5 Covert Operations Definitions ⭐⭐ MEDIUM VALUE
**Location:** `src/lib/constants/covert.ts`
**Time:** 1-2 hours
**Risk:** ⭐ None - static data from PRD

**File to create:**
```typescript
// src/lib/constants/covert.ts
export const COVERT_OPERATIONS = {
  send_spy: {
    name: "Send Spy",
    cost: 5,
    risk: "low",
    description: "Reveal enemy stats",
  },
  insurgent_aid: {
    name: "Insurgent Aid",
    cost: 10,
    risk: "medium",
    description: "Support rebels in enemy territory",
  },
  support_dissension: {
    name: "Support Dissension",
    cost: 8,
    risk: "medium",
    description: "Worsen enemy civil status",
  },
  // ... all 10 operations from PRD 6.8
} as const;

export const COVERT_POINTS_PER_TURN = 5;
export const MAX_COVERT_POINTS = 50;
export const AGENT_CAPACITY_PER_GOV_PLANET = 300;
```

### 4. More M8 Templates ⭐⭐ HIGH VALUE
Continue creating templates for remaining personas.

---

## 🔄 Parallel to M4: Combat System

**What M4 is doing:** Implementing 3-phase combat, battle resolution, casualty system

**Safe parallel work:**

### 1. M7 Market Pricing Formulas ⭐⭐ MEDIUM VALUE
**Location:** `src/lib/market/`
**Time:** 2 hours
**Risk:** ⭐⭐ Low - formulas from PRD

**Files to create:**
```typescript
// src/lib/market/pricing.ts
export function calculateMarketPrice(
  basePrice: number,
  supply: number,
  demand: number
): number {
  // Dynamic pricing 0.4× to 1.6× base
}

export const BASE_PRICES = {
  credits: 1,
  food: 10,
  ore: 15,
  petroleum: 20,
  research_points: 100,
} as const;

// src/lib/market/supply-demand.ts
export function updateSupplyDemand(
  marketOrders: MarketOrder[]
): SupplyDemandState {
  // Calculate current supply/demand from orders
}
```

### 2. M7 Diplomacy Constants ⭐ MEDIUM VALUE
**Location:** `src/lib/constants/diplomacy.ts`
**Time:** 30 minutes
**Risk:** ⭐ None

**File to create:**
```typescript
// src/lib/constants/diplomacy.ts
export const TREATY_TYPES = {
  nap: {
    name: "Non-Aggression Pact",
    duration: 20,
    breakPenalty: -50, // reputation
  },
  alliance: {
    name: "Alliance",
    duration: 40,
    tradeBonus: 0.1,
    breakPenalty: -100,
  },
} as const;

export const REPUTATION_EVENTS = {
  treaty_broken: -100,
  treaty_honored: +10,
  trade_completed: +5,
  // ... from PRD 8.x
} as const;
```

### 3. M6.5 Covert Operation Logic ⭐⭐ MEDIUM VALUE
**Location:** `src/lib/covert/operations.ts`
**Time:** 2-3 hours
**Risk:** ⭐⭐ Low-Medium

**File to create:**
```typescript
// src/lib/covert/operations.ts
export function calculateCovertSuccess(
  attackerAgents: number,
  defenderAgents: number,
  defenderGovPlanets: number,
  operation: CovertOperation
): SuccessResult {
  // Success rate calculation from PRD 6.8
  // Base rate + agent differential - defender bonus ± 20% variance
}

export function executeCovertOp(
  operation: CovertOperation,
  attacker: Empire,
  defender: Empire
): OperationResult {
  // Execute and return effects
}
```

### 4. M11 Progressive Unlock Definitions ⭐ LOW VALUE
**Location:** `src/lib/constants/unlocks.ts`
**Time:** 30 minutes
**Risk:** ⭐ None

**File to create:**
```typescript
// src/lib/constants/unlocks.ts
export const PROGRESSIVE_UNLOCKS = {
  10: ["diplomacy_basics"],
  20: ["coalitions"],
  30: ["black_market"],
  50: ["advanced_ships"],
  75: ["coalition_warfare"],
  100: ["superweapons"],
  150: ["endgame_ultimatums"],
} as const;
```

---

## 🔄 Parallel to M5: Random Bots

**What M5 is doing:** Creating 25 Tier 4 random bots, starmap, difficulty settings

**Safe parallel work:**

### 1. M9 Archetype Behavior Definitions ⭐⭐⭐ HIGH VALUE
**Location:** `src/lib/bots/archetypes/`
**Time:** 3-4 hours
**Risk:** ⭐⭐ Low - specifications from PRD 7.6

**Files to create:**
```typescript
// src/lib/bots/archetypes/warlord.ts
export const WARLORD_BEHAVIOR = {
  militarySpendingPercent: 0.7,
  attackThreshold: 0.5, // attacks if enemy < 50% power
  passiveAbility: "war_economy", // -20% military cost when at war
  tellRate: 0.7,
};

// src/lib/bots/archetypes/diplomat.ts
export const DIPLOMAT_BEHAVIOR = {
  allianceSeekingPercent: 0.8,
  attackOnlyWithAllies: true,
  passiveAbility: "trade_network", // +10% income per alliance
  tellRate: 0.8,
};

// ... all 8 archetypes from PRD 7.6
```

### 2. M10 Emotional State Definitions ⭐⭐ MEDIUM VALUE
**Location:** `src/lib/bots/emotions/`
**Time:** 1-2 hours
**Risk:** ⭐ None - static data

**Files to create:**
```typescript
// src/lib/bots/emotions/states.ts
export const EMOTIONAL_STATES = {
  confident: {
    decisionQuality: +0.05,
    negotiation: +0.10,
    aggression: +0.10,
  },
  arrogant: {
    decisionQuality: -0.15,
    negotiation: -0.30,
    aggression: +0.30,
  },
  // ... all 6 states from PRD 7.8
} as const;

// src/lib/bots/emotions/triggers.ts
export function calculateEmotionalResponse(
  event: GameEvent,
  currentState: EmotionalState
): EmotionalState {
  // Determine new emotional state based on events
}
```

### 3. M10 Memory Weight System ⭐⭐ MEDIUM VALUE
**Location:** `src/lib/bots/memory/`
**Time:** 1-2 hours
**Risk:** ⭐ None

**File to create:**
```typescript
// src/lib/bots/memory/weights.ts
export const MEMORY_WEIGHTS = {
  planet_captured: 80,
  saved_from_destruction: 90,
  alliance_broken: 70,
  battle_won: 40,
  trade_completed: 10,
  message_sent: 1,
} as const;

export const PERMANENT_SCAR_CHANCE = 0.2; // 20% of negative events

export function calculateMemoryDecay(
  weight: number,
  turnsSince: number
): number {
  // Decay calculation: high-weight memories persist longer
}
```

---

## 🔄 Parallel to M6: Victory & Persistence

**What M6 is doing:** Victory conditions, defeat conditions, auto-save, turn 200 endgame

**Safe parallel work:**

### 1. M11 Galactic Events Definitions ⭐⭐⭐ HIGH VALUE
**Location:** `src/lib/events/`
**Time:** 3-4 hours
**Risk:** ⭐⭐ Low - creative content

**Files to create:**
```typescript
// src/lib/events/economic.ts
export const ECONOMIC_EVENTS = [
  {
    id: "market_crash",
    name: "Market Crash",
    description: "All prices drop 30%",
    effect: { priceMultiplier: 0.7 },
    probability: 0.05,
  },
  {
    id: "resource_boom",
    name: "Resource Boom",
    description: "All production +50% for 5 turns",
    effect: { productionBonus: 0.5, duration: 5 },
    probability: 0.08,
  },
  // ... more economic events
];

// src/lib/events/political.ts
// Coups, assassinations, etc.

// src/lib/events/military.ts
// Pirate armadas, arms races, etc.

// src/lib/events/narrative.ts
// Lore drops, prophecies, etc.
```

### 2. Victory Condition Formulas ⭐ MEDIUM VALUE
**Location:** `src/lib/victory/conditions.ts`
**Time:** 1 hour
**Risk:** ⭐ None

**File to create:**
```typescript
// src/lib/victory/conditions.ts
export function checkConquestVictory(
  empire: Empire,
  totalPlanets: number
): boolean {
  return empire.planetCount / totalPlanets >= 0.6; // 60% control
}

export function checkEconomicVictory(
  empire: Empire,
  secondPlaceNetworth: number
): boolean {
  return empire.networth >= secondPlaceNetworth * 1.5; // 1.5× second place
}

// ... all 6 victory conditions from PRD 10.1
```

---

## 📊 Summary: Safe Parallel Work Remaining

### Immediate (Can start now alongside M2):
1. ⭐⭐⭐ **Pure Calculation Functions** (2-3 hours) - Saves time across ALL milestones
2. ⭐⭐⭐ **Constants Files** (1 hour) - Referenced by all systems
3. ⭐⭐⭐ **Remaining M8 Templates** (6-8 hours, incremental) - Critical for M8

### Next Priority (During M3-M4):
4. ⭐⭐ **Combat Logic** (3-4 hours) - Ready for M4 integration
5. ⭐⭐ **Market Formulas** (2 hours) - Ready for M7
6. ⭐⭐ **Covert Operations** (3-4 hours) - Ready for M6.5

### Later (During M5-M6):
7. ⭐⭐ **Archetype Behaviors** (3-4 hours) - Ready for M9
8. ⭐⭐ **Emotional States** (2-3 hours) - Ready for M10
9. ⭐⭐ **Galactic Events** (3-4 hours) - Ready for M11

### Total Parallel Work Remaining:
- **Time Investment:** ~30-40 hours (can be spread across M2-M6)
- **Time Saved Later:** ~5-7 days during M4-M11 implementation
- **Risk Level:** Low (pure functions, data, UI shells)

---

## ✅ Recommendation: Start with Top 3

**Highest ROI for immediate parallel work:**
1. **Pure Calculation Functions** (2-3 hours) - Used by EVERY milestone
2. **Constants Files** (1 hour) - Referenced constantly
3. **M8 Templates** (incremental) - High value, low risk, can do 5-10 personas at a time

These three provide maximum value with minimal risk and zero dependencies on M2-M6 implementation!
