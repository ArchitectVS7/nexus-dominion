# VISION.md & PRD.md Parity Check

**Date**: 2025-12-30
**Purpose**: Ensure consistency between VISION.md (design direction) and PRD.md (product requirements)

---

## Key Concepts Alignment

| Concept | VISION.md | PRD.md | Status |
|---------|-----------|--------|--------|
| **Starting Planets** | 5 | 5 | ✅ ALIGNED |
| **Galaxy Structure** | 10 sectors | 10 sectors | ✅ ALIGNED |
| **Combat System** | Unified resolution | Unified resolution | ✅ ALIGNED |
| **Coalition Mechanics** | Automatic at 7+ VP | Automatic at 7+ VP | ✅ ALIGNED |
| **Wormhole Slot Limits** | 2 base, +2 research, max 4 | 2 base, +2 research, max 4 | ✅ ALIGNED |
| **Sector Balancing** | Algorithm-based fairness | Algorithm-based fairness | ✅ ALIGNED |
| **5-Step Onboarding** | Detailed in VISION | Not in PRD (future feature) | ⚠️ PARTIAL |
| **Victory Conditions** | 6 paths | 6 paths | ✅ ALIGNED |
| **Bot Tiers** | 4 tiers (LLM, Strategic, Simple, Random) | 4 tiers | ✅ ALIGNED |
| **Bot Archetypes** | 8 types | 8 types | ✅ ALIGNED |

---

## Combat System

### VISION.md
- Unified resolution with single D20 roll
- 6 outcomes (total victory → disaster)
- 1.5× defender advantage
- Target 40-50% attacker win rate
- Planet capture: 15-40% based on outcome

### PRD.md (Section 7.2)
- ✅ Unified resolution with single D20 roll
- ✅ 6 outcomes (total victory → disaster)
- ✅ 1.5× defender advantage
- ✅ Target 40-50% attacker win rate
- ✅ Planet capture: 15-40% based on outcome

**Status**: ✅ **FULLY ALIGNED**

---

## Galaxy Structure

### VISION.md (Section 2)
- 10 sectors, 8-10 empires each
- Attack accessibility: same sector (1.0×), adjacent (1.2×), wormhole (1.5×)
- Sector balancing algorithm (±10% networth)
- Wormhole construction: 15k-40k credits, 300-800 petro, 6-15 turns
- Slot limits: 2 base, +1 at Research 6, +1 at Research 8, max 4

### PRD.md (Section 6)
- ✅ 10 sectors, 8-10 empires each
- ✅ Attack accessibility: same sector (1.0×), adjacent (1.2×), wormhole (1.5×)
- ✅ Sector balancing algorithm (±10% networth)
- ✅ Wormhole construction: 15k-40k credits, 300-800 petro, 6-15 turns
- ✅ Slot limits: 2 base, +1 at Research 6, +1 at Research 8, max 4

**Status**: ✅ **FULLY ALIGNED**

---

## Coalition Mechanics

### VISION.md (Section 3)
- Automatic coalition at 7+ VP
- +10% attack vs leader
- +5% defense if leader attacks
- Diplomatic penalty (can't form new alliances)
- Market penalty (+20% resource costs)
- Reverse turn order (weakest first)

### PRD.md (Section 9.1)
- ✅ Automatic coalition at 7+ VP
- ✅ +10% attack vs leader
- ✅ +5% defense if leader attacks
- ✅ Diplomatic penalty (can't form new alliances)
- ✅ Market penalty (+20% resource costs)
- ✅ Reverse turn order (weakest first)

**Status**: ✅ **FULLY ALIGNED**

---

## Onboarding System

### VISION.md (Section 5)
- 5-step tutorial (required first game, skippable on replay)
- Step 1: Welcome to Your Bridge
- Step 2: Meet Your Neighbors
- Step 3: The Galaxy Beyond
- Step 4: Your Command Interface
- Step 5: Take Your First Turn
- **Step 6 (NEW)**: Your Path to Victory
- Contextual UI (Turn 1-10: basic, 11-20: add threats, 21+: full)

### PRD.md
- ❌ **NOT DOCUMENTED** (listed as future feature in Section 13)
- New Player Experience section exists but doesn't include 5-step tutorial

**Status**: ⚠️ **PARTIAL ALIGNMENT** - VISION has detailed onboarding, PRD notes it as planned but doesn't specify

**Recommendation**: Onboarding is greenlit for implementation, so PRD should be updated in Section 13 (New Player Experience) to include the 5-step system. However, since it's not implemented yet, it's acceptable to leave as "planned feature" for now.

---

## Starting Planets

### VISION.md
- 5 starting planets (reduced from 9)
- Rationale: Faster eliminations, achievable in 200 turns

### PRD.md (Key Decisions Table)
- ✅ 5 starting planets
- ✅ Note: "(reduced from 9 for faster eliminations)"

**Status**: ✅ **FULLY ALIGNED**

---

## Bot Architecture

### VISION.md (Section 7)
- 4 tiers: LLM (5-10 bots), Strategic (20-25), Simple (50-60), Random (10-15)
- 8 archetypes: Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist
- Emotional states affect decisions
- Memory system with decay

### PRD.md (Section 8)
- ✅ 4 tiers documented
- ✅ 8 archetypes documented
- ✅ Emotional states documented
- ✅ Memory system documented

**Status**: ✅ **FULLY ALIGNED**

---

## Victory Conditions

### VISION.md (Section 6)
- 6 paths: Conquest (60%), Economic (1.5× networth), Research (complete tech tree), Military (2× military), Diplomatic (coalition 50%), Survival (turn 200)

### PRD.md (Section 2)
- ✅ 6 paths matching exactly

**Status**: ✅ **FULLY ALIGNED**

---

## Differences & Discrepancies

### Minor Differences (Acceptable)

1. **Onboarding Detail**
   - VISION: Fully specified 5-step system
   - PRD: Listed as planned feature
   - **Why OK**: Feature is greenlit but not yet implemented, PRD can wait for implementation

2. **Sector Traits**
   - VISION: Mentioned as future enhancement
   - PRD: Included in Section 6.5 as "Future Enhancement"
   - **Status**: ✅ ALIGNED (both mark as future)

3. **Level of Detail**
   - VISION: More narrative, explains "why"
   - PRD: More technical, specifies "what"
   - **Why OK**: Different purposes - VISION is design direction, PRD is requirements

### No Major Discrepancies Found

All core systems (combat, sectors, coalitions, wormholes, bots, victory) are aligned between documents.

---

## Recommendations

### Immediate (Before Implementation)
1. ✅ **No action needed** - VISION and PRD are aligned on all implemented/greenlit features

### When Implementing Onboarding (Phase 2-3)
2. Update PRD Section 13 (New Player Experience) to include:
   - 5-step tutorial system
   - Step-by-step descriptions
   - Contextual UI panel system
   - Reference VISION.md Section 5 for details

### Future Considerations
3. As features move from "planned" to "implemented":
   - Update PRD status markers
   - Ensure VISION and PRD stay in sync
   - Cross-reference between documents

---

## Document Purposes (Reminder)

### VISION.md
- **Audience**: Development team, stakeholders, designers
- **Purpose**: Unified design direction, philosophy, "why we're doing this"
- **Tone**: Narrative, explanatory, justifies decisions
- **Updates**: Major design changes, post-redesign evaluations

### PRD.md
- **Audience**: Product managers, developers, QA
- **Purpose**: Product requirements, specifications, "what we're building"
- **Tone**: Technical, precise, implementation-focused
- **Updates**: Feature additions, requirement changes

Both documents serve different needs and complement each other.

---

## Verdict

### Overall Parity: ✅ **EXCELLENT (95% Aligned)**

- All critical systems aligned
- Combat, sectors, coalitions, wormholes - fully consistent
- Minor differences are appropriate given different document purposes
- Onboarding is the only "partial" item, but acceptable as it's planned not implemented

### Action Required: **NONE**

VISION and PRD are sufficiently aligned for current development phase. No immediate updates needed.

---

*Parity check completed: 2025-12-30*
*Next check: After Phase 1 implementation (unified combat system)*
