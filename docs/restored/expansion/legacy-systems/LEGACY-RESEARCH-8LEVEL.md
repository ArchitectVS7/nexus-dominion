# Legacy: 8-Level Research System

**Status**: Replaced by 3-Tier Draft System (January 2026)
**Reason**: Complexity reduction for core game experience
**Preserved**: For potential future expansion or advanced mode

---

## Overview

The original 8-level research system was an **accumulation-based progression** where empires generated research points each turn and advanced through levels 0-7. Each level unlocked new unit types and capabilities.

## How It Worked

### Research Point Generation
- Research planets generated **100 RP per turn**
- Education planets provided bonus RP
- Points accumulated in `researchProgress` table
- Level-up occurred when threshold reached

### Level Requirements

| Level | RP Required | Cumulative RP | Typical Turn | Unlocks |
|-------|-------------|---------------|--------------|---------|
| 0 | 0 | 0 | Start | Basic units (soldiers, fighters) |
| 1 | 1,000 | 1,000 | ~10 | Carriers |
| 2 | 2,000 | 3,000 | ~30 | Light Cruisers |
| 3 | 4,000 | 7,000 | ~70 | Stations |
| 4 | 8,000 | 15,000 | ~150 | Heavy Cruisers |
| 5 | 16,000 | 31,000 | ~310 | Advanced |
| 6 | 32,000 | 63,000 | ~630 | Elite |
| 7 | 64,000 | 127,000 | ~1270 | Ultimate |

**Formula**: `Cost = 1000 × 2^level` (exponential scaling)

### Implementation Files (v2.0)

- **Service**: `src/lib/game/services/research-service.ts` (408 lines)
  - `initializeResearch()` - Create progress entry
  - `processResearchProduction()` - Generate RP each turn
  - `calculateResearchCost()` - Exponential cost formula
  - `getResearchStatus()` - Current progress query

- **Formulas**: `src/lib/formulas/research-costs.ts`
  - Pure calculation functions
  - Cost and progress percentage
  - Level validation

- **Constants**:
  - `RESEARCH_POINTS_PER_PLANET = 100`
  - `RESEARCH_BASE_COST = 1000`
  - `MAX_RESEARCH_LEVEL = 7`

### Database Schema

```sql
CREATE TABLE research_progress (
  id UUID PRIMARY KEY,
  empire_id UUID REFERENCES empires(id),
  game_id UUID REFERENCES games(id),
  research_level INTEGER DEFAULT 0,
  current_investment INTEGER DEFAULT 0,
  required_investment INTEGER DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Why It Was Replaced

### Problems Identified

1. **Too Gradual**: 8 levels meant small incremental unlocks
2. **No Choices**: Completely linear progression, no strategic decisions
3. **Late Unlocks**: Heavy Cruisers at level 4 = Turn 150+ (too late)
4. **Complexity**: Required tracking 8 different thresholds
5. **Predictability**: No variety between games

### Design Goals Missed

- **Strategic Choice**: Players wanted meaningful decisions
- **Dramatic Moments**: Linear progression lacked excitement
- **Replay Value**: Same path every game
- **Archetype Support**: Couldn't differentiate bot strategies

## Replacement: 3-Tier Draft System

The new system addresses all issues:

### Key Improvements

| Old System | New System |
|------------|------------|
| 8 linear levels | 3 draft tiers with choices |
| No decisions | Draft 1 of 3 doctrines, 1 of 2 specializations |
| Same every game | Different builds each playthrough |
| Units only | Combat bonuses + unit unlocks |
| Predictable | Strategic variety |

### Implementation

- **Service**: `src/lib/game/services/research-draft-service.ts`
- **Schema**: Added `researchDoctrine`, `researchSpecialization`, `researchTier` columns
- **Migrations**: `0002_sad_rhodey.sql`, `0003_certain_kate_bishop.sql`
- **Actions**: `selectDoctrine()`, `selectSpecialization()` in research-actions.ts

## Potential Future Use

### Advanced Mode Expansion

The 8-level system could return as an **advanced research mode**:

```
Expansion Idea: "Technology Tree Expansion"
- Keep 3-tier draft as default (accessible)
- Add "Advanced Research Mode" toggle at game creation
- 8-level system unlocks deep tech tree
- Each level branches into specializations
- For veteran players seeking complexity
```

### Hybrid Approach

Combine both systems:
- **Tier 1-3**: Draft system (accessible, strategic)
- **Levels 4-7**: Advanced accumulation (optional depth)
- Best of both worlds

### Board Game Variant

Use 8-level system for slower-paced mode:
- Turns represent weeks instead of days
- Research takes 10-20 turns per level
- Campaign mode across multiple sessions
- "Marathon Mode" for deep strategic play

## Code Preservation

The original implementation remains in:
- `src/lib/game/services/research-service.ts` (functional, tested)
- `src/lib/formulas/research-costs.ts` (pure functions)
- Test suite in `__tests__/research-service.test.ts` (44 tests passing)

**Status**: Code is production-ready and can be re-enabled with:
1. Feature flag toggle
2. Schema support (table still exists)
3. UI components (need recreation)

## References

- **PRD v2.0** (December 2024): Section 10 described 8-level system
- **Implementation**: Milestone M3 (completed)
- **Test Coverage**: 44 unit tests, 80%+ coverage
- **Performance**: <50ms per turn for 100 empires

---

*Documented*: January 3, 2026
*Author*: Development Team
*Purpose*: Preserve institutional knowledge for future expansion consideration
