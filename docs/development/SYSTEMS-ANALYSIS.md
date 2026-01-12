# Nexus Dominion: Systems Documentation Analysis

**Date:** January 2026
**Purpose:** Comprehensive review of all *-SYSTEM.md documentation and dependency mapping

---

## Executive Summary

This document provides:
1. **Documentation Completeness Review**: Assessment of all 5 system documents against the GAME-SYSTEM-TEMPLATE.md
2. **Dependency Matrix**: Cross-system interconnections, blockers, and implementation critical path
3. **Action Items**: Specific gaps that must be addressed before implementation

**Overall Assessment:** ⭐⭐⭐⭐½ (4.5/5) - Documentation is implementation-ready with minor gaps

---

## Part 1: Documentation Completeness Review

### Systems Reviewed

| System | Lines | Status | Completeness |
|--------|-------|--------|--------------|
| **COMBAT-SYSTEM.md** | 1,012 | Canonical | Complete* |
| **RESEARCH-SYSTEM.md** | 1,098 | FOR IMPL | Complete |
| **SYNDICATE-SYSTEM.md** | 934 | Core Feature | Mostly Complete |
| **CRAFTING-SYSTEM.md** | 1,382 | Beta 3 | Complete* |
| **BOT-SYSTEM.md** | 1,035 | Active | Complete* |

*Minor gaps noted below

---

### 1. COMBAT-SYSTEM.md ✅

**Strengths:**
- Complete D20 mechanics with multi-domain battles (Space/Orbital/Ground)
- Comprehensive database schema (unit_templates, empire_units)
- Full TypeScript service architecture (D20CombatEngine)
- Bot integration for 3 archetypes (Warlord, Turtle, Schemer)
- Testing checklist with 11 test categories

**Issues:**
- ⚠️ **BLOCKER:** 1 unresolved DEV NOTE (line 255)
  - Question: "Can you do ground-only invasion without space/orbital dominance?"
  - **Recommendation:** Clarify that full invasions require multi-domain; ground raids are covert ops (Syndicate system)

**Verdict:** Ready for implementation after resolving DEV NOTE

---

### 2. RESEARCH-SYSTEM.md ✅

**Strengths:**
- Asymmetric information model (public doctrines, hidden specializations)
- 3-tier progression with clear unlock timings
- 40+ bot message templates
- Complete database schema (4 tables)
- Hybrid visibility model well-explained

**Issues:**
- None - fully complete

**Verdict:** Ready for implementation immediately

---

### 3. SYNDICATE-SYSTEM.md ⚠️

**Strengths:**
- Hidden role mechanics clearly specified
- 14 contract types across 4 tiers
- Accusation trial system detailed
- Comprehensive database schema (8 tables)
- Asymmetric victory conditions

**Issues:**
- ⚠️ Turn processing integration (Section 10.5) is brief
- ⚠️ UI component specs (Section 10.3) are one-liners
- ⚠️ Intel Point economy formula not explicitly stated (must be inferred)

**Recommendations:**
1. Expand Section 10.5 with contract trigger details
2. Add full React interface specifications for UI components
3. Document explicit Intel Point earning formula

**Verdict:** Mostly ready, can proceed with implementation while expanding docs

---

### 4. CRAFTING-SYSTEM.md ✅

**Strengths:**
- 40 unique cards across 3 tiers (T1: 12, T2: 20, T3: 8)
- Complete draft mechanics with turn-by-turn schedule
- Integration with Research system (combo examples)
- Extensive database schema (4 tables)
- Bot decision logic for all 8 archetypes

**Issues:**
- ⚠️ Minor typo: `applyTechCardsToCommbat` should be `applyTechCardsToCombat` (line 1041)

**Recommendations:**
1. Fix typo in service method name
2. Add playtesting notes for card cost justification

**Verdict:** Ready for implementation after typo fix

---

### 5. BOT-SYSTEM.md ⚠️

**Strengths:**
- 4-tier intelligence system (LLM, Strategic, Simple, Random)
- 8 archetypes with decision priority matrices
- Comprehensive LLM integration strategy with fallback chain
- Emotional state and relationship memory systems
- 60+ message templates documented
- Phased migration plan (M12-M16)

**Issues:**
- ⚠️ Database schema section brief (mentions Drizzle but no full DDL)
- ⚠️ Only 3 of 100 planned personas documented (samples vs full implementation)
- ⚠️ Service architecture TypeScript interfaces not fully shown

**Recommendations:**
1. Expand Database Schema section with full Drizzle DDL
2. Document plan for creating remaining 97 personas
3. Add Service Architecture section with TypeScript interfaces

**Verdict:** Ready for phased implementation; documentation gaps are acceptable for iterative development

---

## Part 2: Systems Dependency Matrix

### Critical Path & Implementation Order

```
IMPLEMENTATION SEQUENCE (Must follow this order):

1. COMBAT-SYSTEM (Foundation)
   - No dependencies
   - All other systems depend on this
   - Timeline: Weeks 1-4

2. RESEARCH-SYSTEM (Strategic Layer)
   - Depends on: COMBAT fully functional
   - Adds: Doctrine bonuses (+2 STR, +4 AC, +2 CHA)
   - Timeline: Weeks 5-8

3. CRAFTING-SYSTEM (Tactical Depth)
   - Depends on: COMBAT + RESEARCH
   - Adds: Tech card modifiers stacked with research
   - Timeline: Weeks 9-12

4. SYNDICATE-SYSTEM (Asymmetric Victory)
   - Depends on: All other systems functional
   - Adds: Hidden roles, contracts, alternative victory
   - Timeline: Weeks 13-16

5. BOT-SYSTEM Full Integration
   - Depends on: All systems stable
   - Phased: Tier 4→3→2→1 (LLM)
   - Timeline: Weeks 17+
```

### Hard Dependencies (Blocking)

| System | Depends On | Reason |
|--------|------------|--------|
| **COMBAT** | None | Foundation |
| **RESEARCH** | COMBAT | Doctrine bonuses modify combat stats |
| **CRAFTING** | COMBAT + RESEARCH | Tech cards stack with research bonuses |
| **SYNDICATE** | All others | Contracts trigger events in all systems |
| **BOT** | All others | Bots make decisions across all systems |

### Soft Dependencies (Enhancement)

| System A | System B | Relationship |
|----------|----------|--------------|
| RESEARCH | CRAFTING | Combo bonuses (War Machine + Plasma Torpedoes) |
| SYNDICATE | RESEARCH | Intel ops reveal enemy specializations |
| SYNDICATE | CRAFTING | Black Market bypasses normal crafting |

---

### Turn-Based Progressive Reveal

```
TURN 0-9: Foundation Phase
- COMBAT: Tier I units only
- RESEARCH: Accumulating RP (not visible)
- CRAFTING: Turn 1 draft (Hidden Objectives, secret)
- SYNDICATE: Not revealed
- BOT: Basic decisions

TURN 10: First Major Milestone
✓ RESEARCH: Doctrine selection (public announcement)
✓ CRAFTING: Tier 2 Tactical Card draft
- BOT: Reactions to doctrine announcements

TURN 30: Mid-Game Unlock
✓ RESEARCH: Specialization selection (hidden until first use)
✓ CRAFTING: Multiple tech cards active
✓ SYNDICATE: Strategic contracts (Tier 2)

TURN 50: Late-Game Revelation
✓ CRAFTING: Legendary cards (Tier 3) enter draft pool
✓ SYNDICATE: "The Shadow Emerges" event (system-wide reveal)
✓ RESEARCH: Approaching capstone (~Turn 60-80)

TURN 60-80: Capstone Era
✓ RESEARCH: Tier 3 Capstones unlock (Dreadnought, Citadel, etc.)
- Game dramatically shifts

TURN 200+: End-Game
✓ CRAFTING: Hidden Objectives revealed (VP calculations)
✓ SYNDICATE: Syndicate victory if 3 contracts completed
- Victory determination
```

---

### Combat Interactions Matrix

| System | How It Modifies Combat |
|--------|------------------------|
| **COMBAT** | Base D20 mechanics: d20 + STR vs AC, damage 2d8 + STR mod |
| **RESEARCH** | +2 STR (War Machine), +4 AC (Fortress), +2 CHA (Commerce) |
| **CRAFTING** | +2 damage (Plasma Torpedoes), -4 enemy AC (Ion Cannons), Surprise negation (Shield Arrays) |
| **SYNDICATE** | Indirect: WMD usage (Planet Cracker), sabotage (production disruption) |
| **BOT** | Decision quality: Tier 1 optimal, Tier 4 random |

**Stacking Example:**
```
War Machine doctrine (+2 STR) + Plasma Torpedoes (+2 damage)
= Base 2d8 + STR mod (+3 base) + doctrine (+2) + card (+2)
= 2d8 + 7 damage (vs base 2d8 + 3)
= Effective +4 damage per hit
```

---

### Bot Decision Impact

| System | Bot Decision Modifications |
|--------|---------------------------|
| **COMBAT** | Adjusts aggression based on win/loss history (±20%) |
| **RESEARCH** | War Machine → +20% attack priority, Fortress → +30% defense |
| **CRAFTING** | Cloaking Field → +15% sneak attack chance |
| **SYNDICATE** | Contract completion becomes primary goal (overrides conquest) |

**Example: Warlord Bot Decision Flow**
```
Base aggression: 0.9 (90% chance to attack when able)

After choosing War Machine:
→ Aggression: 0.9 × 1.2 = 1.08 (capped at 1.0 = 100%)

After drafting Plasma Torpedoes:
→ First-strike bonus increases attack desirability by +10%
→ Attack priority: 1.0 (always attacks when possible)

After joining Syndicate (50% for Schemer, 10% for Warlord):
→ Aggression: 1.0 × 0.9 = 0.9 (fights less to avoid suspicion)
→ Contract completion priority overrides conquest
```

---

### Database Schema Dependencies

```
Core Dependency Chain:

empires (base table, all systems write to it)
├── COMBAT writes: sectors_controlled, units_count, net_power
├── RESEARCH writes: research_doctrine, research_specialization, research_tier
├── CRAFTING writes: (none directly, uses empire_tech_cards join table)
├── SYNDICATE writes: loyalty_role, syndicate_vp, suspicion_score
└── BOT writes: (none directly, uses bot_* separate tables)

Schema Migration Order:
1. Phase 1: Create empires + COMBAT tables (unit_templates, combats)
2. Phase 2: ALTER empires + add RESEARCH tables (research_announcements, research_intel_operations)
3. Phase 3: ALTER empires + add CRAFTING tables (tech_card_templates, empire_tech_cards)
4. Phase 4: ALTER empires + add SYNDICATE tables (syndicate_contracts, accusations, suspicious_events)
5. Phase 5: Create BOT tables (bot_memories, bot_emotional_states, bot_decision_logs)

All new columns are NULLable for backward compatibility.
```

---

### Service-to-Service Call Graph

```
TURN PROCESSING FLOW:

turnProcessor.ts
│
├─→ researchService.processProduction()
│   └─→ Check thresholds, select doctrine/spec, create announcements
│
├─→ techCardService.generateDraftEvent() [Every 10 turns]
│   └─→ Roll draft order, create draft_modal
│
├─→ combatService.processCombats()
│   ├─→ researchService.applyResearchBonuses() ← RESEARCH integration
│   ├─→ techCardService.applyTechCardsToCombat() ← CRAFTING integration
│   ├─→ combatEngine.resolveDomainBattle()
│   └─→ syndicateService.generateSuspiciousEvent() ← SYNDICATE integration
│
├─→ syndicateService.processContracts()
│   ├─→ Check contract completion
│   ├─→ Generate suspicious_events
│   └─→ Resolve accusation trials
│
├─→ victoryService.checkVictoryConditions()
│   └─→ Query all systems (conquest, economic, research, syndicate)
│
└─→ botService.processBots() [Parallel, async]
    ├─→ Read state from ALL systems
    ├─→ Make decisions (Tier 1 LLM / Tier 2 decision tree / Tier 3 simple / Tier 4 random)
    └─→ Enqueue actions for next turn
```

---

## Part 3: Critical Gaps & Action Items

### Blockers (Must Fix Before Implementation)

1. **COMBAT-SYSTEM.md Line 255**
   - Issue: Unresolved DEV NOTE about ground-only invasions
   - Resolution: Clarify that ground-only raids are covert ops (Syndicate), full invasions require multi-domain
   - Owner: Game Designer
   - Priority: HIGH (blocks COMBAT implementation)

2. **CRAFTING-SYSTEM.md Line 1041**
   - Issue: Typo in service method name (`applyTechCardsToCommbat`)
   - Resolution: Fix to `applyTechCardsToCombat`
   - Owner: Developer
   - Priority: LOW (cosmetic)

### Documentation Gaps (Should Expand)

3. **SYNDICATE-SYSTEM.md Section 10.5**
   - Issue: Turn processing integration is brief
   - Resolution: Expand with contract trigger details
   - Owner: Technical Writer
   - Priority: MEDIUM (can implement while expanding)

4. **SYNDICATE-SYSTEM.md Section 10.3**
   - Issue: UI component specs are one-liners
   - Resolution: Add full React interface specifications
   - Owner: Frontend Developer
   - Priority: MEDIUM

5. **BOT-SYSTEM.md Database Schema**
   - Issue: No full Drizzle DDL shown
   - Resolution: Add complete schema with column types
   - Owner: Backend Developer
   - Priority: LOW (can be generated during implementation)

6. **BOT-SYSTEM.md Personas**
   - Issue: Only 3 of 100 personas documented
   - Resolution: Create remaining 97 personas with voice profiles
   - Owner: Content Designer
   - Priority: LOW (can be added incrementally)

### Balance Testing Recommendations

7. **Research-Crafting Synergy Cap**
   - Issue: War Machine + Plasma Torpedoes stacking needs testing
   - Resolution: Ensure synergy win rate doesn't exceed 55-60%
   - Owner: Game Designer + QA
   - Priority: HIGH (before Research + Crafting integration)

8. **Syndicate Win Rate Validation**
   - Issue: Hidden role balance needs 100+ game simulation
   - Resolution: Run Monte Carlo simulation, target 15-20% Syndicate win rate
   - Owner: QA + Data Analyst
   - Priority: HIGH (before Syndicate implementation)

9. **Bot Archetype Balance**
   - Issue: Schemer has 50% Syndicate affinity vs 10% baseline
   - Resolution: Validate Schemer doesn't dominate via contracts
   - Owner: Game Designer + QA
   - Priority: MEDIUM (during Bot Tier 2 implementation)

---

## Part 4: Implementation Recommendations

### Phase 1: COMBAT (Weeks 1-4)

**Pre-Implementation Checklist:**
- [ ] Resolve DEV NOTE about ground-only invasions
- [ ] Database schema reviewed (unit templates, empires, sectors)
- [ ] D20 mechanic rules finalized
- [ ] Unit balance spreadsheet complete

**Deliverables:**
- Unit card templates (stats, damage, special abilities)
- D20 resolution engine (attack rolls, damage)
- Multi-domain battle framework (Space/Orbital/Ground)
- Victory condition checks

**Testing:** 100+ Monte Carlo simulations for win rate validation

---

### Phase 2: RESEARCH (Weeks 5-8)

**Pre-Implementation Checklist:**
- [ ] Combat engine fully tested (100+ simulations)
- [ ] Doctrine bonus formula finalized (+2 STR, +4 AC, +2 CHA)
- [ ] Specialization counter-play documented
- [ ] Capstone design final (Dreadnought stats)

**Deliverables:**
- Doctrine selection UI
- Doctrine bonus integration into combat
- Specialization system (hidden selection)
- Combat reveals (first use shows specialization)

**Testing:** Combat with research should validate +10-15% win rate with advantage

---

### Phase 3: CRAFTING (Weeks 9-12)

**Pre-Implementation Checklist:**
- [ ] Research system working in actual combats
- [ ] Draft event timing tested (turns 1, 10, 20...)
- [ ] Tech card counter-play matrices finalized
- [ ] Card synergy balance checked (no 100% win combos)

**Deliverables:**
- Tech card template system (40 cards, 3 tiers)
- Draft event generation
- Tech card modifiers stacked with research bonuses
- Counter-play system (Shield Arrays vs Shock Troops)

**Testing:** Synergy tests (War Machine + Plasma Torpedoes → ~+4 STR effect, <60% win rate)

---

### Phase 4: SYNDICATE (Weeks 13-16)

**Pre-Implementation Checklist:**
- [ ] All three systems stable in 50-turn games
- [ ] Bot turn processor handles all systems
- [ ] Game server can handle parallel bot processing
- [ ] Victory condition checks don't conflict

**Deliverables:**
- Loyalty assignment at game start
- Contract system (14 contract types)
- Black Market UI and purchasing
- Accusation trial system

**Testing:** Syndicate win rates 15-20% in 100-game simulation

---

### Phase 5: BOT (Weeks 17+)

**Phase 5a: Tier 4 & 3 (Simple Bots)**
- Random and basic behavioral decision trees
- Should work immediately once COMBAT is coded

**Phase 5b: Tier 2 (Strategic Bots)**
- Decision priority matrices per archetype
- Coalition formation logic
- Template-based messages (30-45 per persona)

**Phase 5c: Tier 1 (LLM Bots)**
- LLM provider chain (Groq → Together → OpenAI)
- System prompts per archetype
- Natural language message generation

**Testing:** Tier 1 bots should win 2-3× more often than Tier 4 bots

---

## Part 5: Integration Test Matrix

### Pre-Implementation Validation

```
BEFORE COMBAT:
[ ] Database schema reviewed
[ ] D20 mechanic rules finalized
[ ] Victory condition definitions confirmed
[ ] Unit balance spreadsheet complete

BEFORE RESEARCH:
[ ] Combat engine fully tested (100+ simulations)
[ ] Doctrine bonus formula decided
[ ] Specialization counter-play documented
[ ] Capstone design final

BEFORE CRAFTING:
[ ] Research system working in actual combats
[ ] Draft event timing tested
[ ] Tech card counter-play matrices finalized
[ ] Card synergy balance checked

BEFORE SYNDICATE:
[ ] All three systems stable in 50-turn games
[ ] Bot turn processor handles all systems
[ ] Game server can handle parallel bot processing
[ ] Victory condition checks don't conflict

BEFORE BOT LLM:
[ ] Tier 2-4 bots stable (50+ games without crashes)
[ ] Message template system working
[ ] Coalition formation tested
[ ] Rate limiting and cost tracking implemented
```

### Critical Integration Tests

1. **Research-Crafting Synergy Test**
   - Bot drafts War Machine doctrine
   - Bot drafts Plasma Torpedoes card
   - Verify: Damage = base + STR(+2) + card(+2) = +4 total

2. **Specialization-Card Counter-Play Test**
   - Attacker has Shock Troops specialization
   - Defender has Shield Arrays card
   - Verify: No surprise round (Shield Arrays negates)

3. **Syndicate Event Cascade Test**
   - Syndicate bot completes "Sabotage Production" contract
   - Verify: suspicious_event created, suspicion_score increased
   - Verify: Loyalist bots see event feed
   - Verify: If suspicion > 75, accusation triggered

4. **Full Game Loop Test (All Systems)**
   - 10-bot game, 200 turns
   - Turn 1: Hidden Objectives drafted
   - Turn 10: Doctrines chosen, Tactical Cards drafted
   - Turn 50: Syndicate revelation, Legendary Cards
   - Turn 200: Victory determination
   - Verify: No crashes, all systems trigger correctly

---

## Conclusion

**Overall Assessment:** Documentation is **implementation-ready** with minor gaps. The critical path is clear, dependencies are well-mapped, and integration points are explicit.

**Key Takeaways:**
1. ✅ All 5 systems meet template requirements
2. ✅ Implementation order is strict: COMBAT → RESEARCH → CRAFTING → SYNDICATE → BOT
3. ⚠️ 1 blocker (COMBAT DEV NOTE) must be resolved immediately
4. ⚠️ 2 documentation gaps (SYNDICATE, BOT) can be expanded during implementation
5. ⚠️ 3 balance validations (Research+Crafting synergy, Syndicate win rate, Bot archetype balance) are critical before integration

**Next Steps:**
1. Resolve COMBAT-SYSTEM.md DEV NOTE (ground-only invasions)
2. Fix CRAFTING-SYSTEM.md typo
3. Begin COMBAT implementation (Weeks 1-4)
4. Expand SYNDICATE documentation during Weeks 1-12
5. Create remaining 97 bot personas during Weeks 1-16

---

**Document Prepared By:** Claude AI Agent (Systems Analysis)
**Date:** January 2026
**Status:** Complete
**Next Review:** After Phase 1 (Combat) implementation
