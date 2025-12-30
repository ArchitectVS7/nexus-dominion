# Nexus Dominion: Objective Game Design Evaluation

## Executive Summary

**Assessment**: Nexus Dominion has strong architectural foundations but faces several design challenges that must be addressed for the game to succeed. The core issues are:

1. **Broken combat balance** (1.2% attacker win rate makes the game unplayable)
2. **Visualization problem** (1 vs 100 is conceptually overwhelming)
3. **Dated mechanics** overlaid with modern complexity (worst of both worlds)
4. **No clear identity** between "SRE remake" and "modern 4X lite"

**Verdict**: The game needs a focused redesign around its strengths. Not an overhaul, but surgical fixes to the critical systems.

---

## Part 1: The 100 Empire Problem

### The Core Tension

You've identified the real challenge: **how does one player meaningfully interact with 100 adversaries?**

This isn't just a visualization problem—it's a fundamental game design question that ripples through every system.

### Option A: Everyone Can Attack Everyone (Current Design)

**How it works**: Any empire can attack any other empire at any time.

**Problems**:
- **Cognitive overload**: 100 potential targets is too many to evaluate
- **No strategic positioning**: Geography has no meaning
- **Arbitrary conflict**: Why is Emperor Zyx my enemy? I've never heard of them
- **Impossible to track**: Can't maintain mental model of 100 relationships

**When this works**: Games with very short interaction chains (MMO trading, auction houses)

**When it fails**: Strategy games where positioning and relationships matter

### Option B: Regional/Spatial Constraints (Your Hex/Wormhole Idea)

**How it would work**:
- Galaxy divided into ~10 regions of ~10 empires each
- You can only attack empires in your region OR through wormholes/gates
- Expansion into new regions requires investment (building gates, conquering border systems)

**Benefits**:
- **Manageable scope**: You care about 10-15 empires, not 100
- **Emergent geography**: "The Tau Ceti corridor" becomes meaningful
- **Strategic depth**: Controlling chokepoints, defending borders
- **Natural narratives**: Regional rivalries, spheres of influence

**Challenges**:
- More complex implementation
- Risk of isolated regions becoming stale
- Wormhole/gate system needs careful balance

### Option C: Influence Sphere Model (Recommended)

**How it would work**:
- You start with 3-5 "neighboring" empires based on initial placement
- As you grow, your influence sphere expands (more neighbors)
- Can only attack neighbors; attacking distant empires requires intermediate conquests or expensive "expeditionary forces"
- Dynamic: As empires fall, new neighbors emerge

**Benefits**:
- Scales naturally with power (weak empires have few threats, strong empires have many)
- Creates meaningful expansion paths
- Still allows 100 empires but only ~10 are "relevant" at any time
- No hex map complexity needed

**Implementation**:
```typescript
// Conceptual model
interface InfluenceSphere {
  directNeighbors: Empire[];      // Can attack freely (3-5)
  expandedNeighbors: Empire[];    // Require 2x forces to attack
  distantEmpires: Empire[];       // Cannot attack without special action
}

// Sphere grows with territory
function calculateNeighbors(empire: Empire): InfluenceSphere {
  const baseNeighbors = 3;
  const bonusNeighbors = Math.floor(empire.planets / 5);
  return getClosestEmpires(empire, baseNeighbors + bonusNeighbors);
}
```

### My Recommendation

**Adopt Option C (Influence Sphere)** because:
1. Minimal architecture changes (just a filter on valid attack targets)
2. Solves cognitive overload without geographic complexity
3. Creates natural narratives ("The Eastern Coalition is closing in")
4. Works with existing bot system (bots also have limited targets)

The 100 empires become a **living galaxy** rather than a **menu of targets**.

---

## Part 2: Visualization Strategy

### The Problem

A starmap with 100 nodes is:
- Visual noise (everything is important = nothing is important)
- Performance concern (D3 force graphs get sluggish)
- Cognitively overwhelming

### Proposed Solution: Contextual Zoom

**Level 1 - Galaxy Overview** (default view):
```
┌────────────────────────────────────────────────┐
│  ┌─────────┐      ┌─────────┐                  │
│  │ REGION  │──────│ REGION  │                  │
│  │    A    │      │    B    │                  │
│  │  (12)   │      │  (8)    │                  │
│  └────┬────┘      └────┬────┘                  │
│       │                │                        │
│  ┌────┴────┐      ┌────┴────┐    ┌─────────┐  │
│  │ REGION  │──────│ REGION  │────│ REGION  │  │
│  │    C    │      │    D    │    │    E    │  │
│  │  (15)   │      │  ★ YOU  │    │  (11)   │  │
│  └─────────┘      └─────────┘    └─────────┘  │
│                                                │
│  Click region to zoom in                       │
└────────────────────────────────────────────────┘
```

**Level 2 - Regional View** (zoomed into your region):
```
┌────────────────────────────────────────────────┐
│  REGION D (Your Sphere of Influence)           │
│                                                │
│     ○ Zyx Empire (hostile)                     │
│        ↘                                       │
│          ★ YOUR EMPIRE                         │
│        ↗    ↓                                  │
│     ○ Velara ○ Iron Fist (at war)              │
│       (allied)                                 │
│                   ○ Merchant Guild             │
│                     (neutral)                  │
│                                                │
│  [Attack] [Diplomacy] [Intel Report]           │
└────────────────────────────────────────────────┘
```

**Level 3 - Empire Detail** (click on specific empire):
- Full intel sheet
- Relationship history
- Trade options
- Attack planning

### Design Principles

1. **Show only what matters**: Your neighbors, your enemies, your allies
2. **Hide complexity gracefully**: 100 empires exist, but ~10 are visible at once
3. **Progressive disclosure**: Galaxy → Region → Empire → Detail
4. **Color coding**: Relationship status at a glance
   - Green: Ally
   - Blue: Neutral/Friendly
   - Yellow: Tense/Rival
   - Red: At War/Hostile
   - Gray: Unknown/Distant

---

## Part 3: Combat Math - Root Cause Analysis

### The Two Times You Hit Combat Issues

Based on the investigation documents, here's what happened:

**Issue 1: Sequential Phase Requirement**
- Combat requires winning Space → Orbital → Ground in sequence
- Losing ANY phase = entire attack fails
- Result: 1.2% attacker win rate
- **Root cause**: Too punishing, doesn't match player expectations

**Issue 2: Planet Capture Rate**
- Even when winning, attacker captures only 5-15% of planets (usually 1)
- 9 starting planets means 9+ successful attacks to eliminate
- At 1.2% win rate, elimination takes 900+ turns
- **Root cause**: Numbers don't support intended gameplay

### Why These Are Connected

The original Solar Realms was designed around:
- Smaller empires (fewer starting planets)
- Higher attack success rates
- Shorter games

Nexus Dominion scaled up (100 bots, more planets, more complexity) without adjusting the math.

### The Fix: Unified Combat Resolution

Replace 3-phase sequential combat with a single resolution:

```typescript
// NEW: Single roll combat
function resolveCombat(attacker: Forces, defender: Forces): CombatResult {
  const attackerPower = calculatePower(attacker);
  const defenderPower = calculatePower(defender) * 1.3; // Home advantage

  const roll = rollD20();
  const modified = roll + (attackerPower - defenderPower) / 100;

  if (modified >= 18) return 'total_victory';      // 40% planets, enemy routed
  if (modified >= 14) return 'victory';            // 25% planets captured
  if (modified >= 10) return 'costly_victory';     // 15% planets, both lose units
  if (modified >= 6)  return 'stalemate';          // No capture, both lose units
  if (modified >= 2)  return 'repelled';           // Attacker retreats
  return 'disaster';                               // Attacker routed
}
```

**Why this works**:
- Attacker can win with roughly equal forces (~40% chance)
- Defender advantage is meaningful but not insurmountable
- Multiple outcomes create interesting results
- Fast resolution (one roll vs three phases)

### Supporting Changes

1. **Reduce starting planets**: 9 → 5 (faster eliminations)
2. **Increase capture rate**: 5-15% → 15-40% per victory
3. **Add coalition mechanics**: Automatic bonus vs leader
4. **Reverse turn order**: Weakest goes first (catchup mechanic)

---

## Part 4: Modern Game Design Assessment

### Where Nexus Dominion Falls Short vs Modern Games

| Feature | Stellaris (2016+) | Nexus Dominion | Gap |
|---------|-------------------|----------------|-----|
| **Onboarding** | Extensive tutorials, advisor system | None | Critical |
| **Visual feedback** | Ships animate, battles are visible | Numbers change | Significant |
| **Strategic variety** | Multiple empire types, ethics, civics | 8 archetypes (bots only) | Moderate |
| **Player agency** | Every decision visible and reversible | Many invisible systems | Significant |
| **Progression feeling** | Tech trees visualized, unlocks clear | Numbers accumulate | Moderate |
| **Narrative** | Events have stories, consequences visible | Events announced | Moderate |

### Where Nexus Dominion Can Win

| Feature | Advantage |
|---------|-----------|
| **Session length** | 1-2 hours vs 10-40 hours (Stellaris) |
| **Complexity curve** | Can be learned in one session |
| **Solo experience** | Designed for single-player with AI opponents |
| **Personality** | 100 unique bot personas create character |
| **Accessibility** | Browser-based, no install |

### The Identity Question

Nexus Dominion is caught between two identities:

**Identity A: "Modernized SRE"**
- Keep text-based aesthetic
- Focus on the BBS-era nostalgia
- Accept limited audience

**Identity B: "4X Lite for Modern Players"**
- Compete on presentation
- Streamline complexity
- Broader audience appeal

**My recommendation**: Lean into **Identity B** but keep the personality.

The nostalgia market is tiny. Modern players expect:
- Clear feedback on their actions
- Understanding of why they won/lost
- Visual representation of their empire
- Meaningful choices they can understand

You don't need Stellaris graphics, but you need **clarity**.

---

## Part 5: Crafting System Evaluation

### Current Implementation

4-tier resource hierarchy:
- **Tier 0**: Base resources (Credits, Food, Ore, etc.)
- **Tier 1**: Auto-refined (Metals, Fuel Cells, Polymers)
- **Tier 2**: Manufactured components (Electronics, Armor, etc.)
- **Tier 3**: Advanced systems (Reactor Cores, Shield Generators)

### The Honest Assessment

**Question**: Does crafting create meaningful decisions or just busywork?

**Signs of busywork**:
- Players don't make choices (optimal path is obvious)
- Recipes are "collect 10 of X, wait"
- No strategic timing decisions
- Doesn't interact with other systems

**Signs of meaningful depth**:
- Trade-offs between paths
- Timing matters (build shields before attack OR weapons for attack)
- Resources constrain multiple systems (crafting vs military vs expansion)
- Emergent strategies (rush to Tier 3, or wide Tier 2)

### Verdict: Mixed

The **concept** is good (resource transformation adds decisions), but:

1. **Too many tiers** - 4 tiers is overwhelming for a 1-2 hour game
2. **Not integrated** - Crafting feels separate from core gameplay
3. **No time pressure** - "I'll get there eventually" isn't interesting

### Recommendations

**Option A: Simplify to 2 Tiers**
- Base resources → Finished goods
- Remove intermediate steps
- Each finished good enables specific capability

**Option B: Make Crafting Strategic**
- Crafted items are powerful but require planning
- "Super weapons" require multiple turns of investment
- Creates decision: invest in super weapon OR immediate military

**Option C: Cut Crafting Entirely**
- Focus on core loop (expand, fight, diplomacy)
- Less complexity = more accessible
- Modern roguelikes prove simpler can be better

**My vote**: Option B (make it matter) or Option C (cut it). Option A is half-measure.

---

## Part 6: What Makes Games Engaging in 2025

### Lessons from Successful Modern Games

**Balatro** (2024 hit):
- Simple core mechanic (poker + roguelike)
- Deep emergent complexity
- Every run feels different
- Clear win/loss feedback

**Vampire Survivors** (2022 phenomenon):
- One-button gameplay
- Constant visual feedback
- Progression feels rewarding
- Sessions are short

**Slay the Spire** (2019, still thriving):
- Turn-based, like Nexus Dominion
- Meaningful choices with visible consequences
- Loss is educational, not frustrating
- Every card matters

### Common Threads

1. **Clarity**: Player always knows what's happening and why
2. **Feedback loops**: Actions have visible, immediate results
3. **Meaningful variance**: Each session is different
4. **Respectful of time**: Sessions complete in reasonable time
5. **Fail forward**: Losing teaches you something

### Applying to Nexus Dominion

| Principle | Current State | Improvement |
|-----------|---------------|-------------|
| **Clarity** | Many invisible systems | Surface the important numbers |
| **Feedback** | Numbers change silently | Animate changes, show causation |
| **Variance** | 8 archetypes, 100 personas | Working (if bots feel different) |
| **Time respect** | 200 turn max | Good, but need faster starts |
| **Fail forward** | Defeat = game over | Add post-game analysis |

---

## Part 7: Specific Recommendations

### Tier 1: Critical Fixes (Do First)

1. **Fix combat balance**
   - Implement unified combat resolution
   - Target: 35-45% attacker win rate with equal forces
   - Estimated effort: 1-2 days

2. **Implement influence spheres**
   - Limit attackable targets to neighbors
   - Sphere grows with territory
   - Estimated effort: 1 day

3. **Reduce starting planets**
   - 9 → 5 planets per empire
   - Makes eliminations achievable
   - Estimated effort: 2 hours

4. **Add coalition mechanics**
   - Automatic bonuses when leader hits 7+ VP
   - Prevents runaway victories
   - Estimated effort: 0.5 day

### Tier 2: Design Improvements (Next Sprint)

5. **Contextual zoom visualization**
   - Galaxy → Region → Empire hierarchy
   - Dramatically improves comprehension
   - Estimated effort: 3-5 days

6. **Simplify archetypes**
   - 8 → 4 distinct types
   - Clearer differentiation
   - Estimated effort: 1 day

7. **Simplify civil status**
   - 8 levels → 3 (Happy/Normal/Revolt)
   - Less bookkeeping
   - Estimated effort: 0.5 day

### Tier 3: Polish (Later)

8. **Add onboarding/tutorial**
   - Critical for new players
   - Interactive first game
   - Estimated effort: 1 week

9. **Post-game analysis**
   - "Why you won/lost"
   - Teaches game systems
   - Estimated effort: 2-3 days

10. **Visual feedback improvements**
    - Animate number changes
    - Show battle results dramatically
    - Estimated effort: 1 week

---

## Part 8: What Success Looks Like

### Minimum Viable Success

A game where:
- Combat works (eliminations happen)
- Players understand what's happening
- Sessions complete in 1-2 hours
- Bots feel like opponents, not wallpaper
- There's a reason to play again

### Stretch Success

A game where:
- Each archetype creates different experience
- Stories emerge from gameplay
- Players discuss strategies
- Word of mouth spreads
- Community forms

### Measures

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Eliminations/game | 3-5 | Bot stress tests |
| Win rate variance | Varied winners | Simulation runs |
| Session length | 45-90 minutes | Playtests |
| New player completion | 80%+ finish first game | Analytics |
| Return sessions | 30%+ play again | Analytics |

---

## Conclusion

Nexus Dominion is **not** fundamentally broken—it's a well-architected game with critical balance issues and an identity crisis.

**The path forward**:

1. **Fix combat** (1-2 days) - Without this, nothing else matters
2. **Add influence spheres** (1 day) - Solve the 100 empire problem
3. **Simplify** (1 week) - Cut complexity that doesn't add depth
4. **Polish** (ongoing) - Make the game feel good to play

The question isn't "can we build a game as good as Stellaris?" (you can't, and shouldn't try). The question is "can we build the best 1-2 hour space empire game?"

The answer is yes, but it requires focus on what makes Nexus Dominion unique:
- Bot personalities creating memorable opponents
- Quick sessions with strategic depth
- The feeling of running an empire without 40-hour commitment

Stop trying to be everything. Be the best version of **this** game.

---

## Appendix: Design Principles Going Forward

1. **Every system must earn its place** - If it doesn't create decisions, cut it
2. **Clarity over realism** - Players need to understand what's happening
3. **Fewer, deeper systems** - 4 great systems beats 10 mediocre ones
4. **Test with numbers** - If combat math doesn't work, the game doesn't work
5. **Respect player time** - Every turn should feel meaningful
6. **Bots are opponents, not decoration** - They should feel like rivals
7. **Failure should teach** - Players should know why they lost

---

*Document generated: 2025-12-30*
*Status: Ready for review and decision*
