# Research System Redesign

**Status**: FOR IMPLEMENTATION
**Date**: 2026-01-02
**Replaces**: Current 8-level passive research system

---

## Executive Summary

Research built on a **draft-based strategic choice system** where players select from competing tech paths, progress is visible to enemies, and unlocks create asymmetric combat advantages.

**DEV NOTE** Explore why it was deemed necessary to specify that research and progress is visible to enemies. We specifically talked about a "fog of war" system requiring either covert reconnaissance, combat, or trade alliances in order to know what the other capabilities of players are. We want to explore various options here. I believe some information should be publicly known, for example battles may be broadcast on a "galactic news" type of system, or spread via rumors. Approach this conversation from a game design perspective, where some information is hidden (such as the cards held in the hand) versus public (cards played face up on a table)

---

## Design Goals

1. **Meaningful Choices** — Every research decision should feel like a tradeoff
2. **Visible Progress** — Enemies see what you're researching (creates tension)
3. **Asymmetric Combat** — Tech creates different playstyles, not just +10% stats
4. **Board Game Feel** — Draft from options, not watch a bar fill
5. **Bot Integration** — Archetypes prefer different tech, announce milestones

---

## Core Mechanics

### 3-Tier Research Structure

Replace 8 passive levels with 3 meaningful tiers:

| Tier | Name | Unlock Turn | Choice |
|------|------|-------------|--------|
| **Tier 1** | Foundation | Turn 10 | Pick 1 of 3 Doctrines |
| **Tier 2** | Specialization | Turn 30 | Pick 1 of 2 Upgrades (based on Doctrine) |
| **Tier 3** | Mastery | Turn 60 | Doctrine Capstone (automatic) |

### Research Points Still Matter

- Research planets generate 100 RP/turn (unchanged)
- RP accumulates toward tier thresholds
- Threshold reached → Draft choice unlocks
- **No choice = no progress** (forces engagement)

```
Tier 1 Threshold: 1,000 RP  (~10 turns with 1 Research planet)
Tier 2 Threshold: 5,000 RP  (~30 turns with 2 Research planets)
Tier 3 Threshold: 15,000 RP (~60 turns with 3 Research planets)
```

---

## Tier 1: Doctrines (Turn ~10)

When threshold reached, player drafts ONE of three Doctrines. This defines their strategic identity for the game.

### The Three Doctrines

| Doctrine | Combat Effect | Economic Effect | Unlocks |
|----------|---------------|-----------------|---------|
| **War Machine** | +15% attack power | -10% planet income | Heavy Cruisers |
| **Fortress** | +25% defense power | -5% attack power | Defense Platforms |
| **Commerce** | +20% market prices when selling | +10% planet costs | Trade Fleets |

### Why Three?

- **War Machine** — Warlord/Blitzkrieg players. Aggressive expansion.
- **Fortress** — Turtle/Diplomat players. Defensive consolidation.
- **Commerce** — Merchant/Tech Rush players. Economic victory path.

Every archetype has a "natural" doctrine, but players can counter-pick.

### Visibility

When a player chooses a Doctrine:
```
[GALACTIC INTEL] Emperor Varkus has adopted the WAR MACHINE doctrine.
                 Their military grows more dangerous.
```

Bots react to this information. A Turtle seeing neighbors go War Machine will fortify. A Schemer will seek alliance with the Fortress player against the Warlord.

---

## Tier 2: Specializations (Turn ~30)

Based on Doctrine chosen, player picks ONE of two Specializations.

### War Machine Specializations

| Specialization | Effect | Counter |
|----------------|--------|---------|
| **Shock Troops** | First strike: Deal 20% damage before defender rolls | Fortress players negate with Shield Arrays |
| **Siege Engines** | +50% damage to Defense Platforms/Stations | Commerce players can evacuate assets before siege |

### Fortress Specializations

| Specialization | Effect | Counter |
|----------------|--------|---------|
| **Shield Arrays** | Negate first-strike damage | Siege Engines bypass shields |
| **Minefield Networks** | Attackers lose 10% forces before combat | War Machine Shock Troops clear minefields |

### Commerce Specializations

| Specialization | Effect | Counter |
|----------------|--------|---------|
| **Trade Monopoly** | Buy resources at -20%, sell at +30% | War Machine players can raid trade routes |
| **Mercenary Contracts** | Hire temporary combat bonuses with credits | Fortress players resist mercenary tactics |

### The Rock-Paper-Scissors

```
War Machine (Shock Troops) > Commerce (undefended)
Fortress (Shield Arrays) > War Machine (negates first strike)
Commerce (Mercenaries) > Fortress (overwhelm with hired power)
```

But specializations create counter-play within each matchup.

---

## Tier 3: Mastery Capstone (Turn ~60)

Automatic unlock based on Doctrine. No choice — this is the reward for commitment.

| Doctrine | Capstone | Effect |
|----------|----------|--------|
| **War Machine** | **Dreadnought** | Unlock Dreadnought unit (10x Heavy Cruiser power, 1 per game) |
| **Fortress** | **Citadel World** | One planet becomes invulnerable (cannot be captured, only blockaded) |
| **Commerce** | **Economic Hegemony** | Generate 50% of #2's income as passive bonus |

### Capstone Drama

These are game-changing. Seeing someone reach Tier 3 should create urgency:

```
[GALACTIC ALERT] The Crimson Admiral has achieved DREADNOUGHT technology!
                 A single devastating warship now patrols their borders.
```

Bots will react. Coalitions may form. The game enters endgame phase.

---

## Bot Integration

### Archetype Preferences

| Archetype | Preferred Doctrine | Preferred Specialization |
|-----------|-------------------|-------------------------|
| Warlord | War Machine | Shock Troops |
| Blitzkrieg | War Machine | Shock Troops |
| Turtle | Fortress | Shield Arrays |
| Diplomat | Fortress | Minefield Networks |
| Merchant | Commerce | Trade Monopoly |
| Tech Rush | Commerce | Trade Monopoly |
| Schemer | Commerce | Mercenary Contracts |
| Opportunist | (copies neighbor) | (copies neighbor) |

### Bot Announcement Messages

Tier 1:
```
[Warlord] "My factories now produce weapons of conquest. Tremble."
[Turtle] "My borders are sealed. Come if you dare."
[Merchant] "While you play soldier, I build an empire of gold."
```

Tier 2:
```
[War Machine + Shock Troops] "My soldiers strike before you can blink."
[Fortress + Shield Arrays] "Your weapons mean nothing against my shields."
[Commerce + Mercenaries] "Credits buy loyalty. Loyalty buys victory."
```

Tier 3:
```
[Dreadnought] "Behold the INEVITABLE. My dreadnought has awakened."
[Citadel] "My homeworld is now eternal. You cannot touch it."
[Hegemony] "Your economy flows into mine. Resistance is... unprofitable."
```

---

## UI/UX Design

### Research Panel (Replaces Current)

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
│  │ +15% Attack │ │ +25% Defense│ │ +20% Sell   │       │
│  │ -10% Income │ │ -5% Attack  │ │ +10% Costs  │       │
│  │             │ │             │ │             │       │
│  │ Unlocks:    │ │ Unlocks:    │ │ Unlocks:    │       │
│  │ Heavy       │ │ Defense     │ │ Trade       │       │
│  │ Cruisers    │ │ Platforms   │ │ Fleets      │       │
│  │             │ │             │ │             │       │
│  │  [SELECT]   │ │  [SELECT]   │ │  [SELECT]   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ⚠️ This choice is permanent for this game.             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Intel Display (Enemy Research)

On the starmap, each empire shows their research status:

```
┌─────────────────────────────┐
│ EMPEROR VARKUS              │
│ Warlord · Hostile           │
├─────────────────────────────┤
│ Doctrine: WAR MACHINE ⚔️     │
│ Spec: Shock Troops          │
│ Tier 3: 67% ████████░░░     │
│                             │
│ ⚠️ Dreadnought in 12 turns   │
└─────────────────────────────┘
```

This creates urgency. "Varkus is 12 turns from Dreadnought. Do we attack now or ally against him?"

---

## Migration Plan

### Database Changes

```sql
-- Remove old research tables (after backup)
DROP TABLE research_progress;
DROP TABLE research_branch_allocations;
DROP TABLE unit_upgrades;

-- New simplified schema
ALTER TABLE empires ADD COLUMN research_doctrine VARCHAR(20); -- 'war_machine', 'fortress', 'commerce', NULL
ALTER TABLE empires ADD COLUMN research_specialization VARCHAR(30); -- specific spec or NULL
ALTER TABLE empires ADD COLUMN research_tier INTEGER DEFAULT 0; -- 0, 1, 2, 3
ALTER TABLE empires ADD COLUMN research_points INTEGER DEFAULT 0;
```

### Service Changes

Replace `research-service.ts` with:
- `getResearchStatus()` — Returns tier, doctrine, specialization, points
- `selectDoctrine(empireId, doctrine)` — Tier 1 choice
- `selectSpecialization(empireId, spec)` — Tier 2 choice
- `processResearchProduction(empireId, researchPlanets)` — Add RP, check thresholds
- `applyResearchBonuses(empireId, combatPower)` — Apply doctrine/spec modifiers

### Combat Integration

In `combat-service.ts`, add research modifier application:

```typescript
function calculateCombatPower(forces: Forces, empire: Empire): number {
  let power = baseCalculation(forces);

  // Apply doctrine bonus
  if (empire.researchDoctrine === 'war_machine') {
    power *= 1.15; // +15% attack
  } else if (empire.researchDoctrine === 'fortress' && isDefending) {
    power *= 1.25; // +25% defense
  }

  // Apply specialization effects
  if (empire.researchSpecialization === 'shock_troops') {
    // First strike damage calculated separately
  }

  return power;
}
```

---

## Balance Considerations

### Early Game (Turns 1-10)
- No research advantages yet
- Pure economic/expansion competition
- Doctrine choice creates anticipation

### Mid Game (Turns 10-30)
- Doctrines create asymmetric matchups
- War Machine players pressure Fortress players
- Commerce players build economic lead
- Specialization choice is the key decision

### Late Game (Turns 30-60)
- Specializations define combat outcomes
- Rock-paper-scissors counter-play
- Race to Tier 3 capstone

### End Game (Turns 60+)
- Capstones are game-changers
- Dreadnought owners become targets
- Citadel owners are unbreakable (but can be contained)
- Hegemony owners win economic victory if not stopped

---

## What We're Removing

- 8 passive research levels → 3 meaningful tiers
- 6 research branches (never implemented) → 3 doctrines
- Unit upgrade system → Doctrine-based unlocks
- Invisible progress → Visible to all players

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Doctrine distribution | ~33% each (no dominant choice) |
| Games where Tier 3 reached | 40-60% |
| Combat outcome variance by doctrine | 10-20% swing |
| Player engagement with research UI | 90%+ make active choice |

---

## Open Questions

1. **Should Opportunist bots copy neighbor doctrine or counter it?**
   - Copy = they blend in, less predictable
   - Counter = they become natural rivals, more drama

2. **Should Trade Fleet (Commerce unlock) be a unit or a passive bonus?**
   - Unit = more tactical, but adds complexity
   - Passive = simpler, but less visible

3. **Should Dreadnought be destroyable?**
   - Yes = creates dramatic "kill the boss ship" moments
   - No = Tier 3 War Machine is guaranteed power spike

---

## Implementation Priority

1. **Schema migration** — Add new columns, keep old tables temporarily
2. **Research service rewrite** — New draft-based logic
3. **Combat integration** — Apply doctrine/spec modifiers
4. **UI components** — Doctrine selection panel, intel display
5. **Bot decision logic** — Archetype preferences
6. **Message templates** — Announcement strings
7. **Testing** — Balance verification
8. **Cleanup** — Remove old research tables/code

---

*This design transforms research from a passive time-sink into a strategic identity choice that creates visible asymmetry and bot interaction.*
