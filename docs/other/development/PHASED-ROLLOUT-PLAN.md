# Nexus Dominion: Phased Rollout Plan

**Version:** 2.0
**Status:** Active
**Last Updated:** January 2026
**Replaces:** Previous expansion-based rollout strategy

---

## Executive Summary

This document defines a **phased rollout strategy** for Nexus Dominion that aligns with the decision to include Syndicate and Tech Cards as part of the v1.0 release, not post-launch DLC.

**Key Changes from Previous Plan:**
- Syndicate System: DLC → Core v1.0 feature
- Tech Cards (formerly Crafting): DLC → Core v1.0 feature
- Rollout: Single launch → Phased testing (Alpha → Beta → Release)

**Rollout Timeline:**
- **Internal Alpha** - Core game loop validation
- **Beta 1 (Closed)** - Add complexity layers (Syndicate + Tech Cards)
- **Beta 2 (Open)** - Scale, polish, and performance
- **Release (v1.0)** - Feature complete with all systems

---

## Phase 1: Internal Alpha

**Goal:** Validate core 4X game loop works and is fun

**Duration:** 2-4 weeks of internal testing

**Target Audience:** Development team + 5-10 trusted playtesters

### Systems Included

#### Core Gameplay Loop ✅
- Turn-based empire management (50-500 turns)
- 10-100 AI opponents with basic personalities
- 6 victory conditions (Conquest, Economic, Diplomatic, Research, Military, Survival)
- 10-sector galaxy with wormhole connectivity

#### Empire Management ✅
- 5 resource types (Credits, Food, Ore, Petroleum, Research Points)
- 8 sector types producing different resources
- Civil status system affecting income multipliers
- Military unit production and maintenance

#### Combat System ✅
- D20-based combat resolution
- 6 unit types across 3 domains (Space, Orbital, Ground)
- 3-phase invasion system (Space → Orbital → Ground)
- Defender advantage (1.10x home turf bonus)

#### Bot AI System (Basic) ✅
- 4-tier intelligence architecture
- 8 archetypes (Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist)
- Basic emotional states and relationship memory
- ~25 functional bot personas (not all 100)

#### Research System (Basic) ✅
- Linear 8-level progression
- 6 research branches
- Basic stat bonuses per level

#### Diplomacy System (Basic) ✅
- Treaties (NAP, Alliance, Coalition)
- Reputation system
- Basic treaty mechanics

#### Market System ✅
- Dynamic pricing based on supply/demand
- Buy/sell functionality
- Price fluctuations

#### UI/UX (MVP) ✅
- LCARS-inspired design system
- Starmap command center
- Basic action panels
- Tutorial system (5-step onboarding)

### Systems Explicitly EXCLUDED

❌ **Syndicate System** - Hidden roles add complexity; test core loop first
❌ **Tech Card System** - Tactical depth layer; validate foundation first
❌ **Covert Ops** - Asymmetric warfare; complex to balance
❌ **Advanced Research** - Draft mechanics deferred to Beta 1
❌ **Coalition Raids** - Coordinated attacks; test basic combat first
❌ **LLM-Powered Bots** - Tier 1 elite bots deferred to Beta 2
❌ **WMD Systems** - Chemical/Nuclear/Bio weapons deferred to Beta 1

### Alpha Test Focus Areas

We need feedback on:

1. **Core Loop Flow** - Is the build → attack → expand → win cycle engaging?
2. **Turn Pacing** - Do 50-500 turns feel right for 1-2 hour sessions?
3. **Combat Balance** - Are battles exciting? Is the 47.6% attacker win rate correct?
4. **Bot Behavior** - Do opponents feel alive, or robotic?
5. **Victory Paths** - Are all 6 victory conditions viable?
6. **Learning Curve** - Can new players figure out what to do?

### Success Criteria

Alpha is ready to advance when:
- ✅ Complete playable loop: start game → play turns → achieve victory
- ✅ Zero P0 bugs (game-breaking crashes)
- ✅ Turn processing < 2 seconds with 100 empires
- ✅ Tutorial completion rate > 70%
- ✅ At least 3 different victory conditions achieved by playtesters
- ✅ Bot behavior feels distinct (playtesters can identify archetypes)

### Known Limitations

**Acceptable for Alpha:**
- Basic bot personalities (not fully unique 100 personas)
- Placeholder UI art and animations
- Limited sound effects
- No mobile optimization
- Missing edge case error handling

---

## Phase 2: Beta 1 (Closed Beta)

**Goal:** Add complexity layers without breaking core loop

**Duration:** 4-6 weeks of closed testing

**Target Audience:** 50-100 invited beta testers + community volunteers

### New Systems Added

#### Syndicate System (Hidden Roles) 🆕
- Secret loyalty assignments (10% Syndicate, 90% Loyalist)
- Hidden Syndicate contract panel
- Black Market for WMDs and forbidden tech
- Accusation mechanics and Intel Points
- Suspicious Activity Feed for Loyalists
- Revelation moment (Turn 50 or first contract)
- Coordinator faction as NPC authority

**Why Beta 1:** Syndicate fundamentally changes the game experience. Need core loop validated before adding paranoia and betrayal mechanics.

#### Tech Card System (Draft Mechanics) 🆕
- Tier 1: Hidden Objectives (drawn Turn 1, revealed at game end)
- Tier 2: Tactical Cards (drafted every 10 turns, public)
- Tier 3: Legendary Cards (Turn 50+, game-changing)
- 40 unique cards with combat integration
- Public draft visibility creates counter-play

**Why Beta 1:** Tech Cards add tactical depth on top of strategic Research system. Need combat system stable before layering card effects.

#### Advanced Research System 🆕
- 3-tier draft structure (Doctrines, Specializations, Capstones)
- 3 strategic paths (War Machine, Fortress, Commerce)
- Unique capstone abilities

**Why Beta 1:** Draft mechanics require Tech Cards system to be working first (shared UI patterns).

#### Covert Ops System 🆕
- 10 operation types (theft, disruption, assassination)
- Agent allocation and risk management
- Diplomatic consequences for detection

**Why Beta 1:** Asymmetric warfare creates comeback potential, which pairs well with Syndicate's "underdog path."

#### WMD Systems 🆕
- Chemical weapons (morale damage)
- Nuclear weapons (devastation)
- Bioweapons (population targeting)
- Available via Syndicate Black Market or high research

**Why Beta 1:** Syndicate System needs high-value Black Market goods to be compelling.

#### Coalition Raids 🆕
- Coordinated multi-empire attacks
- Coalition formation mechanics against dominant players
- Anti-snowball bonuses

**Why Beta 1:** Syndicate's "Stop the Syndicate" coalitions require coalition mechanics to be robust.

### Beta 1 Test Focus Areas

We need feedback on:

1. **Syndicate Balance** - Is 10% Syndicate vs 90% Loyalist the right ratio?
2. **Hidden Role Fun** - Does the paranoia add drama, or create frustration?
3. **Tech Card Impact** - Do cards feel impactful without being overpowered?
4. **Draft Decisions** - Are draft choices interesting and strategic?
5. **Complexity Creep** - Is the game still learnable, or overwhelming?
6. **Synergy Exploration** - Do players discover Research + Tech Card combos?

### Success Criteria

Beta 1 is ready to advance when:
- ✅ Syndicate victory condition achieved at least once
- ✅ All 40 Tech Cards drafted and used in combat
- ✅ Hidden Objectives reveal correctly at game end
- ✅ Coalition formation works (both Loyalist and anti-dominant)
- ✅ No P0 or P1 bugs in new systems
- ✅ Tutorial updated to teach new mechanics
- ✅ Playtest feedback sentiment > 75% positive

### Known Limitations

**Acceptable for Beta 1:**
- Still basic bot personas (not 100 unique)
- Syndicate bot behavior may be simplistic
- No mobile optimization
- Performance not optimized
- Limited accessibility features

---

## Phase 3: Beta 2 (Open Beta)

**Goal:** Scale, polish, and optimize for public release

**Duration:** 6-8 weeks of open testing

**Target Audience:** Public beta (1,000+ players)

### Focus Areas

#### Stability & Performance ⚙️
- Zero-crash goal (< 0.1% crash rate)
- Performance optimization (turn processing < 300ms)
- Database optimization for 100-empire games
- Memory leak fixes
- Edge case error handling
- Auto-save and session recovery

#### Bot Intelligence (Full Personas) 🤖
- All 100 unique bot personas active
- LLM-powered Tier 1 elite bots (10 opponents)
- Enhanced archetype behavior
- Syndicate-aware bot decision-making
- Tech Card draft intelligence
- Emotional state depth

**Why Beta 2:** Need Syndicate and Tech Cards stable before teaching bots to use them intelligently.

#### Mobile Experience 📱
- Responsive design for tablets and phones
- Touch optimization (44x44px targets)
- Gesture support (swipe, pinch-zoom)
- Portrait and landscape layouts
- Reduced bundle size (< 1.5MB)
- Progressive loading

#### Accessibility 🌐
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation with hints
- Colorblind-friendly modes
- Reduced motion options
- Caption support

#### Polish & Juice ✨
- Smooth animations throughout
- Sound effects and ambient audio
- Visual feedback for all actions
- Celebration moments for achievements
- Keyboard shortcuts
- Replay/history viewer
- Screenshot and share features

#### Documentation 📚
- Complete How to Play manual
- Strategy guides per victory condition
- Bot archetype recognition guide
- Syndicate playbook
- Tech Card catalog reference

### Beta 2 Test Focus Areas

We need feedback on:

1. **Stability** - Can you play 50+ turns without crashes?
2. **Performance** - Does it run smoothly on your device?
3. **Bot Quality** - Do the 100 personas feel unique?
4. **Mobile Experience** - Is it playable on tablets/phones?
5. **Onboarding** - Can new players learn in 10 minutes?
6. **Balance** - Are all victory paths viable?

### Success Criteria

Beta 2 is ready for v1.0 release when:
- ✅ Crash rate < 0.1% of sessions
- ✅ Turn processing < 300ms with 100 empires
- ✅ Lighthouse score > 95
- ✅ WCAG AA compliance certified
- ✅ Mobile playtesting successful on 5+ devices
- ✅ All 100 bot personas functional and distinct
- ✅ Tutorial completion rate > 80%
- ✅ Three consecutive clean builds
- ✅ Zero P0/P1 bugs
- ✅ Documentation complete
- ✅ Playtest feedback sentiment > 80% positive

### Beta Testing Program

#### Tester Groups
1. **Core testers** - Experienced alpha/beta 1 testers
2. **New player testers** - First-time 4X players
3. **Accessibility testers** - Users with disabilities
4. **Mobile testers** - Tablet and phone primary users
5. **Stress testers** - 100-bot games, edge cases

#### Feedback Channels
- In-game feedback form
- Discord community
- GitHub issues for technical bugs
- Survey at key milestones (Turn 50, Turn 100, Victory)

---

## Phase 4: Release (v1.0)

**Goal:** Feature-complete, polished, production-ready

**Target Date:** TBD (after Beta 2 success criteria met)

**Target Audience:** Public release

### v1.0 Definition of Done

#### All Core Systems Work ✅

**Victory Conditions (All 6 Functional):**
- Conquest: Control 60% of territory
- Economic: 1.5x networth of second place
- Diplomatic: Coalition controls 50% territory
- Research: Complete research path and achieve capstone
- Military: 2x power of all others combined
- Survival: Highest score at game end

**Syndicate System (Complete):**
- Hidden loyalty assignments
- Contract completion victory path (3 contracts before Turn 200)
- Black Market with WMDs and forbidden tech
- Accusation trials and Intel Points
- Bot integration (archetypes behave appropriately)

**Tech Card System (Complete):**
- 40 unique cards across 3 tiers
- Draft mechanics every 10 turns
- Combat integration for all card effects
- Hidden objective scoring
- Bot draft intelligence

**Bot System (Complete):**
- 100 unique bot personas
- 10 LLM-powered Tier 1 elite opponents
- 8 archetypes with distinct behavior
- Emotional states and relationship memory
- Syndicate-aware decision-making
- Tech Card draft intelligence

**Research System (Complete):**
- 3-tier draft structure (Doctrines, Specializations, Capstones)
- 3 strategic paths (War Machine, Fortress, Commerce)
- Capstone abilities unlocked

**All Other Systems:**
- Combat System ✅
- Galaxy Structure (10 sectors, wormholes) ✅
- Resource Economy ✅
- Market System ✅
- Diplomacy System ✅
- Military System ✅
- Covert Ops System ✅
- Coalition Mechanics ✅
- Turn Processing System ✅

#### Production Ready ✅

**Quality Bar:**

| Metric | Requirement |
|--------|-------------|
| **Crash rate** | < 0.1% of sessions |
| **Data loss incidents** | Zero |
| **API error rate** | < 1% |
| **Average uptime** | 99.5% |
| **Initial load** | < 2 seconds |
| **Turn processing** | < 300ms |
| **Page navigation** | < 500ms |
| **Animation framerate** | 60fps |
| **Lighthouse score** | 95+ |
| **WCAG 2.1 Level AA** | 100% compliance |
| **Keyboard navigation** | Full support |
| **Screen reader support** | Full support |

**Documentation:**
- Quick Start Guide
- Complete How to Play manual
- Strategy tips per victory condition
- Bot archetype recognition guide
- Syndicate playbook
- Tech Card catalog
- Architecture overview (dev docs)
- API reference (dev docs)
- Contribution guide (dev docs)

#### Launch Checklist

**Pre-Launch (1 week before):**
- [ ] Final security audit
- [ ] Performance load testing (10,000 concurrent games simulated)
- [ ] Content freeze
- [ ] Marketing materials ready
- [ ] Support documentation complete
- [ ] Press kit prepared

**Launch Day:**
- [ ] Deployment to production
- [ ] Monitoring dashboards active
- [ ] Support team briefed
- [ ] Social media announcements
- [ ] Press release distributed
- [ ] Community Discord launched

**Post-Launch (1 week after):**
- [ ] Hotfix process validated
- [ ] User feedback collected
- [ ] Analytics reviewed
- [ ] Post-mortem scheduled
- [ ] Patch 1.0.1 planned

---

## Success Metrics

### User Engagement
- **Retention**: 40% return after first session
- **Completion**: 60% finish first game
- **Session length**: Average 45+ minutes
- **Victory variety**: All 6 conditions achieved by community

### Technical Health
- **Crash-free sessions**: 99.9%
- **API success rate**: 99.5%
- **Average load time**: < 2s globally
- **Average turn time**: < 300ms

### Community
- **Feedback sentiment**: 80% positive
- **Bug reports resolved**: < 48 hour response
- **Feature requests logged**: Active backlog
- **Discord activity**: 500+ active members in first month

---

## Post-v1.0 Roadmap (Future Consideration)

**These features are NOT part of v1.0 release:**

### Wave 1: Polish & Quality of Life (Q1 Post-Launch)
- Feature flags for system toggles
- Advanced tutorial improvements
- Quality of life improvements based on player feedback
- Additional bot persona refinements

### Wave 2: Ecosystem Balance (Q2 Post-Launch)
- Anti-exploit mechanics (hoarding detection, turtle detection)
- Market manipulation detection
- Pirate faction enhancements
- Loan shark system

### Wave 3: Information Warfare (Q3 Post-Launch)
- Rumor system
- Intelligence operations with accuracy ratings
- Framing operations (plant false evidence)
- Bookie/gambling mechanics

### Wave 4: Major Expansion (v2.0)
- Branching tech tree (exclusive research paths)
- Psionic weapons
- Advanced bot betrayal mechanics
- Coalition victory condition
- Player-pirate diplomacy

**See [FUTURE.md](FUTURE.md) for detailed post-v1.0 roadmap.**

---

## Migration from Previous Rollout Plan

### What Changed

**Previous Plan (EXPANSION.md):**
- Syndicate = Post-launch DLC "Shadow War"
- Crafting = Post-launch DLC "Industrial Age"
- Rationale: Cognitive load, focus on core loop first

**New Plan (This Document):**
- Syndicate = Core v1.0 feature (Beta 1)
- Tech Cards = Core v1.0 feature (Beta 1)
- Rationale: These systems define Nexus Dominion's identity; not optional add-ons

### Why the Change

1. **Design Evolution**: Syndicate and Tech Cards are now central to the game's identity, not optional depth
2. **Competitive Landscape**: 4X games are crowded; hidden roles + tactical cards differentiate us
3. **Development Reality**: Backend systems already built (per FUTURE.md); excluding them creates artificial delays
4. **Player Expectations**: Beta testers expect feature-complete experience, not DLC roadmap
5. **Marketing**: "4X with hidden roles" is a stronger pitch than "basic 4X, buy DLC for hidden roles"

### Impact on Timeline

**Old Timeline (Expansion-based):**
- Alpha → Beta → v1.0 Launch (6 months)
- DLC 1: Industrial Age (3 months post-launch)
- DLC 2: Shadow War (6 months post-launch)

**New Timeline (Phased Rollout):**
- Internal Alpha (2-4 weeks)
- Beta 1 Closed (4-6 weeks)
- Beta 2 Open (6-8 weeks)
- v1.0 Launch (3-5 months total)

**Net Change:** Faster to feature-complete v1.0 (3-5 months vs 15 months for equivalent features)

---

## Document Updates Required

The following roadmap documents need revision to align with this plan:

1. **ALPHA.md** ✅ (Already aligned with Phase 1)
2. **BETA.md** ⚠️ (Merge with this document's Beta 1 + Beta 2)
3. **LAUNCH.md** ⚠️ (Update to reflect Syndicate + Tech Cards in v1.0)
4. **EXPANSION.md** ⚠️ (Repurpose as post-v1.0 roadmap, remove Syndicate/Crafting)
5. **FUTURE.md** ✅ (Already tracks post-v1.0 features correctly)

### Recommended Approach

**Option A: Merge and Archive**
- Archive old BETA.md and LAUNCH.md
- This document (PHASED-ROLLOUT-PLAN.md) becomes the new source of truth
- Keep ALPHA.md as Phase 1 detail
- Keep FUTURE.md as post-v1.0 vision

**Option B: Update in Place**
- Update BETA.md to match Phase 2 + 3
- Update LAUNCH.md to match Phase 4
- Update EXPANSION.md to remove Syndicate/Crafting
- Keep this document as executive overview

**Recommendation:** Option A (cleaner, less redundancy)

---

## Conclusion

This phased rollout plan provides a clear path from internal alpha to public release, with Syndicate and Tech Cards integrated as core v1.0 features.

**Key Principles:**
1. **Foundation First** - Validate core loop before adding complexity
2. **Incremental Complexity** - Alpha → Beta 1 → Beta 2 → Release
3. **Quality Gates** - Each phase has clear success criteria
4. **Player-Centric** - Test focus areas align with player experience
5. **Flexibility** - Timeline is target-based, not date-based

**Next Steps:**
1. Review and approve this rollout plan
2. Archive or update existing roadmap documents
3. Begin Internal Alpha with Phase 1 scope
4. Iterate based on playtester feedback

---

*From "does it work?" to "is it fun?" to "is it polished?" — one phase at a time.*
