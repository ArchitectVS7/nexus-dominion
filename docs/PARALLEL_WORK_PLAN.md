# Parallel Work Plan - X-Imperium


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