# Redesign Folder Archive - December 30, 2025

**Purpose**: This folder contains the design evaluation and redesign process that led to Nexus Dominion v2.0.

**Date Range**: December 28-30, 2024

**Outcome**: Major design decisions finalized and documented in `/docs/VISION.md`

---

## What Happened

Between December 28-30, 2024, extensive playtesting and evaluation revealed critical issues with the game's combat system and galaxy structure. This folder contains the investigation, analysis, and redesign process.

---

## Key Documents

### Problem Investigation
- **ELIMINATION-INVESTIGATION.md** - Identified 1.2% attacker win rate, 0 eliminations in testing
- **SRE-COMPARISON.md** - Compared current implementation to original Solar Realms Elite
- **PATH-FORWARD.md** - Honest assessment of problems and solutions

### Design Evaluation
- **GAME-DESIGN-EVALUATION.md** - Comprehensive analysis of 100-empire problem and proposed solutions
- **GAME-MANUAL-CURRENT.md** - Documentation of implemented systems (as-is)
- **GAME-MANUAL-REDESIGN.md** - Ground-up redesign proposal (board game approach)

### Star Map Visualization
- **STARMAP-VISUALIZATION-CONCEPTS.md** - Three starmap concepts evaluated
- **STARMAP-DIAGRAMS.md** - Mermaid diagrams for all three concepts
- **STARMAP-WIREFRAMES.md** - ASCII wireframes showing UI layouts
- **STARMAP-CONCEPT2-DEEP-DIVE.md** - Detailed implementation plan for Concept 2 (Regional Cluster Map)
- **STARMAP-CONCEPT2-REVIEWS.md** - Three independent critical reviews (newbie, experienced, designer perspectives)

### Implementation Planning
- **IMPLEMENTATION-TRACKER.md** - Living tracker of all features, status, timelines

---

## Major Decisions Made

### 1. Combat System Redesign ✅
**Problem**: Sequential 3-phase combat (space → orbital → ground) = 1.2% attacker win rate
**Solution**: Unified combat resolution with single D20 roll, 6 outcomes
**Status**: Greenlit for Phase 1 implementation

### 2. Sector-Based Galaxy ✅
**Problem**: 100 empires with "attack anyone" = cognitive overload
**Solution**: 10 sectors of 10 empires each, phased expansion (sectors → borders → wormholes)
**Status**: Greenlit for Phase 2-3 implementation (13-15 days)

**Selected Approach**: Concept 2 (Regional Cluster Map)
- Galaxy view (10 sector boxes)
- Sector view (8-10 empire nodes)
- Wormholes as strategic connections
- Star Trek LCARS aesthetic

### 3. Coalition Mechanics ✅
**Problem**: Leaders become unstoppable
**Solution**: Automatic anti-leader bonuses at 7+ Victory Points
**Status**: Greenlit for Phase 1 implementation

### 4. Reduced Starting Planets ✅
**Change**: 9 → 5 starting planets
**Rationale**: Faster eliminations, achievable in 200 turns
**Status**: Approved

### 5. Onboarding System ✅
**Approach**: 5-step tutorial (required first game, skippable on replay)
**Philosophy**: "Every game is someone's first game" (Stan Lee / Mark Rosewater)
**Status**: Greenlit for Phase 3 implementation

---

## What Was Considered But Not Chosen

### Starmap Concepts
- **Concept 1 (Radial Sphere)**: Static radial layout, player at center
  - Rejected: Lacks galaxy feel, limited player control
- **Concept 3 (Tactical Filter)**: Three filter modes with mini-map
  - Rejected: Doesn't solve enough problems, Concept 2 scored higher

### Complexity Reduction (Under Evaluation)
- Archetype reduction (8 → 4): Pending playtesting
- Civil status simplification (8 → 3): Pending balance review
- Crafting system: Evaluating strategic value vs busywork

---

## Where Ideas Ended Up

### Consolidated into `/docs/VISION.md`
The comprehensive VISION document now contains:
- Combat system redesign (unified resolution)
- Sector-based galaxy structure
- Coalition mechanics
- Onboarding philosophy
- All greenlit features

### Consolidated into `/docs/PRD.md` (v2.0)
PRD updated with:
- Section 6: Galaxy Structure & Geography (NEW)
- Section 7: Combat system (updated to unified resolution)
- Section 9: Coalition mechanics (NEW subsection)
- Starting planets changed to 5
- Key Decisions table updated

### Tracked in `/docs/redesign/IMPLEMENTATION-TRACKER.md`
Living document tracking:
- What's implemented ✅
- What's in progress 🚧
- What's planned 📋
- What's under evaluation 💭

---

## Three Independent Reviews

**Starmap Concept 2** was evaluated from three perspectives:

1. **Sarah (Newbie Player)**: 7/10
   - Loved Star Trek aesthetic
   - Needed more guardrails (turn goals, feedback tooltips)
   - Wanted simpler early UI

2. **Marcus (Experienced Player)**: 8.5/10
   - Sectors create real strategic pacing
   - Concerned about sector balancing and wormhole spam
   - "This is what modern SRE should look like"

3. **Elena (Game Designer)**: 7.5/10
   - Elegant core design (one system solves multiple problems)
   - Critical: Sector balancing algorithm is P0 (must have)
   - Recommend implementation with iteration (13-15 days)

**Consensus**: Implement Concept 2 with Priority 0 changes (sector balancing, victory tutorial, contextual UI, wormhole limits)

---

## Timeline

### December 28, 2024
- Planet display bug fixed
- Bot stress tests revealed 0 eliminations
- ELIMINATION-INVESTIGATION.md created

### December 29, 2024
- Comprehensive design evaluation
- Compared to original SRE
- Evaluated game manual approaches
- PATH-FORWARD.md finalized

### December 30, 2024 (Morning)
- Three starmap concepts developed
- Detailed wireframes and diagrams
- Mermaid flowcharts and decision matrices

### December 30, 2024 (Afternoon)
- Concept 2 selected
- Deep dive implementation plan
- Three independent critical reviews
- **Full implementation greenlit**

### December 30, 2024 (Evening)
- VISION.md created (consolidated design direction)
- PRD.md updated to v2.0
- IMPLEMENTATION-TRACKER.md created
- Parity check completed
- This folder archived for reference

---

## Key Learnings

### What Worked
1. **Playtesting revealed truth** - 1.2% win rate was invisible until stress tests
2. **Multiple perspectives helped** - Three independent reviews converged on same issues
3. **Diagrams clarified thinking** - Mermaid + ASCII wireframes made concepts concrete
4. **Comparison to original** - SRE had coalition code we were missing

### What Didn't Work Initially
1. **Sequential combat phases** - Philosophically sound, mathematically broken
2. **"Attack anyone" galaxy** - No strategic geography with 100 empires
3. **Assuming eliminations would happen** - Math proved otherwise

### Design Principles Established
1. "Every game is someone's first game"
2. "Geography creates strategy"
3. "Consequence over limits"
4. "Clarity through constraints"
5. "Foundation before complexity"

---

## References

### Living Documents (Active)
- `/docs/VISION.md` - Unified game vision (v2.0)
- `/docs/PRD.md` - Product requirements (v2.0)
- `/docs/redesign/IMPLEMENTATION-TRACKER.md` - Feature status tracker

### Archive Documents (Historical)
- This folder (`/docs/redesign-12-30-2024/`) - Design process archive
- All files preserved for reference

---

## For Future Developers

If you're reading this and wondering "why did we make these choices?", read in this order:

1. **ELIMINATION-INVESTIGATION.md** - Understand the problem
2. **GAME-DESIGN-EVALUATION.md** - See the evaluation process
3. **PATH-FORWARD.md** - Understand the decision framework
4. **STARMAP-CONCEPT2-REVIEWS.md** - See how we chose the starmap approach
5. **VISION.md** - See the final consolidated vision

The design process was iterative, evidence-based, and considered multiple perspectives. These weren't arbitrary choices - they solved real problems revealed through testing.

---

*Archive created: 2025-12-30*
*Process duration: 3 days (Dec 28-30, 2024)*
*Outcome: v2.0 design direction finalized*
