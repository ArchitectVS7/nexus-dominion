# Nexus Dominion: Implementation Tracker

**Last Updated**: 2025-12-30
**Status**: Active Development - Redesign Phase

---

## Overview

This document tracks the status of all major features and redesign initiatives for Nexus Dominion. It serves as the source of truth for what's been implemented, what's in progress, and what's scheduled for development.

---

## Status Legend

- ✅ **IMPLEMENTED** - Feature is complete, tested, and merged
- 🚧 **IN PROGRESS** - Currently being developed
- 📋 **PLANNED** - Approved for development, not yet started
- 💡 **PROPOSED** - Under consideration, not yet approved
- ❌ **DEPRECATED** - No longer pursuing this approach
- ⚠️ **BLOCKED** - Waiting on dependencies or decisions

---

## Critical Path Items

### Combat System Redesign

| Item | Status | Priority | Estimated | Notes |
|------|--------|----------|-----------|-------|
| Unified combat resolution (replace 3 phases) | 📋 PLANNED | P0 | 2-3 days | Fixes 1.2% win rate → ~45% |
| Reduce starting planets (9 → 5) | 📋 PLANNED | P0 | 2 hours | Makes eliminations achievable |
| Coalition mechanics (auto-bonuses vs leaders) | 📋 PLANNED | P0 | 1 day | Prevents runaway victories |
| Reverse turn order (weakest first) | 📋 PLANNED | P1 | 0.5 day | Catchup mechanic |
| Combat outcome variety (6 outcomes) | 📋 PLANNED | P0 | Included in unified | Total victory, victory, costly victory, stalemate, defeat, disaster |

**Dependencies**: None - can start immediately
**Blocker**: None
**ETA**: 4-5 days total

---

### Star Map Visualization (Concept 2: Regional Cluster Map)

| Item | Status | Priority | Estimated | Notes |
|------|--------|----------|-----------|-------|
| **Database Schema** | | | | |
| Add sector assignments to empires table | 📋 PLANNED | P0 | 0.5 day | sector_id, position_x, position_y columns |
| Create sectors table | 📋 PLANNED | P0 | 0.5 day | id, game_id, name, description, position |
| Create sector_connections table | 📋 PLANNED | P0 | 0.5 day | natural borders + wormholes |
| Create wormhole_construction table | 📋 PLANNED | P0 | 0.5 day | Multi-turn construction queue |
| **Game Logic** | | | | |
| Sector assignment algorithm (game setup) | 📋 PLANNED | P0 | 1 day | Balanced allocation (10 sectors × 10 empires) |
| Sector balancing (ensure fairness) | 📋 PLANNED | P0 | 1 day | Equal total networth per sector |
| Attack validation (sector accessibility) | 📋 PLANNED | P0 | 1 day | Can only attack same sector or connected |
| Border discovery system | 📋 PLANNED | P1 | 0.5 day | Unlock borders at Turn 10-15 |
| Wormhole construction logic | 📋 PLANNED | P1 | 1 day | 6-15 turn construction, resource costs |
| Wormhole slot limits | 📋 PLANNED | P0 | 0.5 day | 2 base, +2 from research, max 4 |
| **UI Components** | | | | |
| Galaxy View Component (sector boxes) | 📋 PLANNED | P0 | 1 day | LCARS styled, 10 sectors |
| Sector Detail Component (empire nodes) | 📋 PLANNED | P0 | 1 day | Force-directed or static layout |
| Zoom transition animation (galaxy ↔ sector) | 📋 PLANNED | P1 | 0.5 day | Smooth fade/zoom |
| LCARS Panel System (semi-transparent) | 📋 PLANNED | P0 | 1 day | Orange/peach/violet palette |
| Threat Assessment Panel | 📋 PLANNED | P1 | 0.5 day | Right sidebar with active threats |
| Expansion Options Panel | 📋 PLANNED | P1 | 0.5 day | Borders + wormholes |
| **Onboarding** | | | | |
| 5-step tutorial system | 📋 PLANNED | P0 | 2 days | Welcome → Neighbors → Galaxy → Interface → First Turn |
| Victory condition tutorial (Step 6) | 📋 PLANNED | P0 | 0.5 day | Explain 6 victory paths |
| Contextual UI (hide panels until relevant) | 📋 PLANNED | P0 | 1 day | Turn 1-10 basic, 11-20 add threats, 21+ full |
| Turn-by-turn goals | 📋 PLANNED | P1 | 1 day | "Turn 5: Have 200 soldiers" guidance |
| Feedback tooltips | 📋 PLANNED | P1 | 0.5 day | "Good choice!" for newbie actions |
| Skip tutorial checkbox | 📋 PLANNED | P1 | 0.5 day | LocalStorage flag for returning players |

**Dependencies**: Combat system redesign (ideally complete first for tutorial accuracy)
**Blocker**: None
**ETA**: 13-15 days total (7-9 core + 4-6 iteration)

**Greenlit**: ✅ Full implementation approved (2025-12-30)

---

### Game Balance & Anti-Snowball

| Item | Status | Priority | Estimated | Notes |
|------|--------|----------|-----------|-------|
| Coalition mechanics (automatic) | 📋 PLANNED | P0 | 1 day | +1 attack bonus vs leaders at 7+ VP |
| Reverse turn order | 📋 PLANNED | P1 | 0.5 day | Weakest empire goes first |
| Sector traits | 💡 PROPOSED | P2 | 1 day | "Mining Belt" +20% ore, etc. |
| Victory Points system | 💡 PROPOSED | P2 | 2-3 days | 10 VP from any combination |
| Leader containment bonus | 📋 PLANNED | P1 | 0.5 day | Adjacent sectors get bonuses vs leader |

**Dependencies**: Combat system (for proper balance testing)
**Blocker**: None
**ETA**: 2 days (P0-P1 only), +3 days if including P2

---

## Completed Features

### Core Systems ✅

- ✅ Turn processing pipeline (6 phases)
- ✅ Resource engine (food, credits, ore, petroleum, RP)
- ✅ Population growth & starvation
- ✅ Civil status evaluation (8 levels)
- ✅ Build queue system
- ✅ Research progression
- ✅ Bot architecture (4 tiers, 8 archetypes)
- ✅ Bot emotional states
- ✅ Bot memory system with decay
- ✅ Covert operations (10 operation types)
- ✅ Market system (trading)
- ✅ Diplomacy (treaties, NAPs, alliances)
- ✅ Galactic events
- ✅ Crafting system (4 tiers)
- ✅ Galactic Syndicate (black market)

### Bug Fixes ✅

- ✅ Planet display bug fixed (12/28/2024)
- ✅ Combat logging improvements
- ✅ Turn processing performance optimizations

---

## Deprioritized / Cut Features

### Deprecated Approaches ❌

- ❌ **3-phase sequential combat** - Replaced with unified combat system
  - *Reason*: 1.2% attacker win rate, philosophically sound but mathematically broken
- ❌ **Concept 1: Radial Sphere** (Starmap) - Replaced with Concept 2
  - *Reason*: Lacks galaxy feel, limited player control
- ❌ **Concept 3: Tactical Filter** (Starmap) - Replaced with Concept 2
  - *Reason*: Doesn't solve enough problems, Concept 2 scored higher
- ❌ **"Attack anyone, anywhere" model** - Replaced with sector-based accessibility
  - *Reason*: Cognitive overload with 100 empires, no strategic geography

### Under Evaluation 💭

- 💭 **Reduce archetypes (8 → 4)** - Pending user testing
  - Merge: Warlord + Blitzkrieg → Aggressor
  - Merge: Diplomat + Merchant → Pacifist
  - Keep: Schemer → Opportunist, Turtle + Tech Rush → Developer
- 💭 **Simplify civil status (8 → 3)** - Pending balance review
  - Happy / Normal / Revolting
- 💭 **Crafting system evaluation** - Assessing strategic value vs busywork
- 💭 **Fog of war** - Considering full information game (like Chess, Go)

---

## Issues Identified (Needs Resolution)

### Critical 🔴

| Issue | Severity | Status | Resolution Plan |
|-------|----------|--------|-----------------|
| Combat win rate (1.2% attacker) | 🔴 CRITICAL | 📋 PLANNED | Unified combat system |
| 0 eliminations in testing | 🔴 CRITICAL | 📋 PLANNED | Combat redesign + fewer starting planets |
| No coalition mechanics | 🔴 CRITICAL | 📋 PLANNED | Automatic anti-leader bonuses |
| 100-empire cognitive overload | 🔴 CRITICAL | 📋 PLANNED | Sector-based starmap (Concept 2) |

### High Priority 🟠

| Issue | Severity | Status | Resolution Plan |
|-------|----------|--------|-----------------|
| No anti-snowball mechanics | 🟠 HIGH | 📋 PLANNED | Reverse turn order + coalitions |
| Starmap jittering on click | 🟠 HIGH | 📋 PLANNED | Static sector layout (no D3 physics) |
| No onboarding for new players | 🟠 HIGH | 📋 PLANNED | 5-step tutorial system |
| No victory condition clarity | 🟠 HIGH | 📋 PLANNED | Tutorial Step 6 + UI improvements |

### Medium Priority 🟡

| Issue | Severity | Status | Resolution Plan |
|-------|----------|--------|-----------------|
| Complexity overwhelming | 🟡 MEDIUM | 💭 EVALUATING | Consider archetype/civil status simplification |
| Sector balancing | 🟡 MEDIUM | 📋 PLANNED | Balancing algorithm at game setup |
| Wormhole spam potential | 🟡 MEDIUM | 📋 PLANNED | Slot limits (2 base, +2 research) |
| Information overload (22 UI elements) | 🟡 MEDIUM | 📋 PLANNED | Contextual panels (progressive disclosure) |

---

## Timeline & Milestones

### Phase 1: Critical Fixes (Week 1)
**Target**: 2025-01-06
**Status**: 📋 PLANNED

- [ ] Unified combat system
- [ ] Reduce starting planets (9 → 5)
- [ ] Coalition mechanics (automatic bonuses)
- [ ] Combat outcome variety (6 outcomes)

**Goal**: Eliminations become possible, game is playable

---

### Phase 2: Starmap Redesign (Weeks 2-3)
**Target**: 2025-01-20
**Status**: 📋 PLANNED

**Week 2**: Core Implementation (7-9 days)
- [ ] Database schema (sectors, connections, wormholes)
- [ ] Sector assignment & balancing
- [ ] Attack validation (sector accessibility)
- [ ] Galaxy View & Sector Detail UI
- [ ] LCARS panel system

**Week 3**: Iteration & Onboarding (4-6 days)
- [ ] 5-step tutorial system
- [ ] Victory condition explanation
- [ ] Contextual UI panels
- [ ] Wormhole slot limits
- [ ] Threat assessment panel
- [ ] Expansion options panel

**Goal**: Starmap is strategic command center, new players can onboard

---

### Phase 3: Balance & Polish (Week 4)
**Target**: 2025-01-27
**Status**: 📋 PLANNED

- [ ] Reverse turn order (weakest first)
- [ ] Sector traits (Mining Belt, Core Worlds, etc.)
- [ ] Turn-by-turn goals for tutorial
- [ ] Feedback tooltips
- [ ] Border discovery system
- [ ] Wormhole construction logic
- [ ] User playtesting & iteration

**Goal**: Game is balanced, polished, fun

---

### Phase 4: Simplification Review (Week 5+)
**Target**: TBD
**Status**: 💭 EVALUATING

- [ ] Evaluate archetype reduction (8 → 4)
- [ ] Evaluate civil status simplification (8 → 3)
- [ ] Evaluate crafting system (keep/simplify/cut)
- [ ] Victory Points system consideration
- [ ] Advanced player features

**Goal**: Remove complexity that doesn't add strategic depth

---

## Success Metrics

### Technical Performance
- ✅ Turn processing < 2 seconds (currently meeting)
- 🎯 Starmap sector view: 60 FPS (target)
- 🎯 Starmap galaxy view: 30+ FPS (target)

### Game Balance
- 🎯 Attacker win rate: 40-50% with equal forces (target)
- 🎯 Eliminations per game (25 bots, 200 turns): 3-5 (target)
- 🎯 Winner variety: No single archetype dominates (target)

### Onboarding
- 🎯 New player completion rate: 80%+ finish first game (target)
- 🎯 Time to understand sectors: < 5 minutes (target)
- 🎯 First attack within: < 3 clicks (target)

### Engagement
- 🎯 Players reach Turn 30+: 60%+ (target)
- 🎯 Players build wormholes: 40%+ (target)
- 🎯 Understanding galaxy structure: 70%+ (target via survey)

---

## Decision Log

### 2025-12-30
- ✅ **APPROVED**: Concept 2 (Regional Cluster Map) for starmap redesign
  - Full implementation greenlit (13-15 days)
  - Includes LCARS aesthetic, 5-step onboarding, sector system
- ✅ **APPROVED**: Priority 0 changes (sector balancing, victory tutorial, contextual UI, wormhole limits)
- 📋 **PENDING**: Archetype reduction (8 → 4) - awaiting playtesting
- 📋 **PENDING**: Civil status simplification (8 → 3) - awaiting balance review

### 2025-12-28
- ✅ **FIXED**: Planet display bug (showing 0 planets in combat logs)
- 📝 **IDENTIFIED**: Combat balance issue (1.2% attacker win rate)
- 📝 **IDENTIFIED**: 0 eliminations across all test runs

### Earlier
- ✅ **COMPLETED**: Crafting system implementation (4 tiers)
- ✅ **COMPLETED**: Galactic Syndicate (black market)
- ✅ **COMPLETED**: Bot architecture (4 tiers, 8 archetypes)

---

## Notes & Context

### Combat Philosophy
The original "ground war is hardest" philosophy remains valid. The unified combat system preserves this through:
- 1.5× defender advantage (massive home field bonus)
- Multiple outcomes showing attrition (costly victories, stalemates)
- Rare but devastating total defeats
- Ground forces still critical for planet capture

### Sector Design Philosophy
Following **Stan Lee** ("every comic is someone's first") and **Mark Rosewater** ("keep the door open"):
- Progressive disclosure (sectors → borders → wormholes)
- Clear mental models (sector = neighborhood)
- Tutorial is required first game (can skip on replay)
- Complexity unlocks over time, not all at once

### Why Concept 2 Won
Three independent reviewers (newbie, experienced, designer) converged on:
- Sectors solve 100-empire problem elegantly
- Creates strategic geography and phased gameplay
- Best for MMO vision (scales to 100+ players)
- With iteration (P0 changes), scores 8-9/10 across all reviewers

---

## References

- **Design Docs**: `/docs/redesign/` folder (see GAME-DESIGN-EVALUATION.md, PATH-FORWARD.md)
- **Starmap Specs**: STARMAP-CONCEPT2-DEEP-DIVE.md, STARMAP-CONCEPT2-REVIEWS.md
- **PRD**: `/docs/PRD.md`
- **VISION**: `/docs/VISION.md` (comprehensive game vision document)

---

*This tracker is the living source of truth for Nexus Dominion development.*
*Last updated: 2025-12-30 by Claude*
