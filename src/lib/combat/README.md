# Combat System

## Active System: Volley Combat v2

**File:** `volley-combat-v2.ts`
**Status:** PRODUCTION
**Feature Flag:** `USE_VOLLEY_COMBAT_V2 = true` (in `combat-service.ts`)

### Overview

The Volley Combat v2 system uses true D20 tabletop mechanics for empire-vs-empire combat. Each battle consists of up to 3 volleys, with the winner determined by volley count (best of 3).

### Combat Flow

1. **Pre-combat:** Calculate theater bonuses, set stances
2. **Volley 1:** Both sides roll D20 + TAR vs opponent's DEF
3. **Optional retreat** after Volley 1 (15% attack-of-opportunity casualty penalty)
4. **Volley 2:** Same resolution
5. **Optional retreat** after Volley 2 (if not decided)
6. **Volley 3:** Final tiebreaker if needed
7. **Post-combat:** Sector capture based on victory margin

### D20 Mechanics

Each unit type has D20 stats (defined in `data/unit-stats.json`):
- **TAR** (Targeting): Attack roll modifier
- **DEF** (Defense): Threshold to avoid being hit
- **HUL** (Hull): Damage capacity
- **REA** (Reactor): Initiative/retreat capability
- **CMD** (Command): Morale effects
- **DOC** (Doctrine): Psychological warfare

**Hit formula:** `D20 roll + TAR + stance mod + theater bonus >= target DEF`

### Combat Stances

Players select a stance before combat (see `stances.ts`):

| Stance | Attack | Defense | Casualties |
|--------|--------|---------|------------|
| Aggressive | +3 | -2 | +20% taken |
| Balanced | 0 | 0 | Normal |
| Defensive | -2 | +3 | -20% taken |
| Evasive | -3 | +1 | -40% taken |

### Theater Bonuses

Analyzed by `theater-control.ts`:
- **Space Dominance** (2x space units): +2 attack
- **Orbital Shield** (defender stations): +2 DEF
- **Ground Superiority** (3x marines): Capture even with 2-volley losses

### Sector Capture

| Outcome | Sectors Captured |
|---------|-----------------|
| 3-0 Decisive | 15% of defender's sectors |
| 2-1 Standard | 10% of defender's sectors |
| Retreat | 0 sectors |

---

## Legacy Systems

### Unified Combat (Fallback)

**File:** `unified-combat.ts`
**Status:** DEPRECATED (feature-flagged OFF)

Single-roll combat designed to fix the 1.2% attacker win rate problem from sequential phases. Uses combined power calculation with D20 variance. Kept as fallback only.

Features:
- Underdog bonus (networth-based, when enabled)
- Punch-up bonus (extra sectors for weaker victors)
- Config-driven via `data/combat-config.json`

### Phase Combat v1

**File:** `phases.ts`
**Status:** DEPRECATED (kept for type exports)

Original 3-phase sequential combat (Space → Orbital → Ground). Each phase had to be won to proceed. Problem: ~1.2% attacker win rate due to 0.45³ cascade effect.

**Note:** Still exports core types (`Forces`, `CombatResult`, `PhaseResult`) used by other systems.

---

## Supporting Modules

| File | Purpose |
|------|---------|
| `stances.ts` | Combat stance definitions and modifiers |
| `theater-control.ts` | Theater bonus calculations |
| `effectiveness.ts` | Unit effectiveness matrix |
| `containment-bonus.ts` | Containment mechanics |
| `nuclear.ts` | WMD/nuclear option handling |
| `coalition-raid-service.ts` | Coalition raid mechanics |

---

## Migration Plan

1. ~~Document authoritative system~~ (Done)
2. Add `@deprecated` JSDoc to legacy files
3. Monitor for any unified-combat usage in production
4. Remove deprecated code after beta validation
