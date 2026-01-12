# Combat System: Ground Raid Narrative Resolution

**Issue:** DEV NOTE in COMBAT-SYSTEM.md line 255
> "I shouldn't be able to do a 'ground war only' if I don't get past space and orbital ranges - unless this is a covert guerilla type raid."

**Date:** January 2026
**Status:** Design Consultation - Recommendation for Resolution

---

## The Narrative Problem

**Current Design:**
- **Full Invasion:** Requires carriers, resolves across Space/Orbital/Ground domains
- **Raid:** "Soldiers only," resolves on Ground domain only
- **Blockade:** Space units only, economic warfare

**The Issue:**
How do ground forces reach a planet without controlling space and orbital domains? This breaks the sci-fi narrative of needing fleet superiority to land armies.

---

## Game Design Analysis

### What Creates Strong Narrative Flow?

✅ **Good Narrative:**
- "I sent a fleet, won space superiority, landed troops, captured the planet" (Full Invasion)
- "I blockaded their trade routes with my cruisers" (Blockade)
- "I sent special forces on a covert mission to sabotage their infrastructure" (Raid - but needs better justification)

❌ **Breaks Narrative:**
- "I attacked their ground forces without fighting their space fleet"
- "My soldiers teleported past their orbital defenses"
- "I ignored their cruisers in orbit and just invaded"

### What Creates Better User Engagement?

**Strategic Depth:** Multiple paths to achieve goals
- Military conquest (Full Invasion)
- Economic pressure (Blockade)
- Asymmetric warfare (Raids)

**System Integration:** Raids should connect to other systems
- Syndicate contracts already include "Pirate Raid"
- Research could unlock special forces units
- Crafting could provide stealth insertion tech

**Risk/Reward Balance:** Raids should feel distinct
- Lower risk (don't fight full fleets)
- Lower reward (harassment, not conquest)
- Different tactical use case (weaken before invasion)

---

## Recommended Solution

### Reframe "Raids" as **Covert Strikes**

**Narrative Justification:**
Raids are NOT invasions. They are special operations missions that bypass conventional defenses through:
- Stealth insertion (cloaked dropships)
- Black market smuggling routes
- Insurgent support networks (Syndicate)
- Diplomatic cover (during peace treaties)

**Mechanical Implementation:**

```
RAID (Covert Strike)
├─ Purpose: Harassment, sabotage, weakening
├─ Requirements:
│  ├─ Specialized units (Commandos, not regular Soldiers)
│  ├─ OR Syndicate contract authorization
│  ├─ OR Research unlock (Stealth Insertion tech)
│  └─ Target empire must NOT be on high alert
├─ Resolution:
│  └─ Single ground domain battle
├─ Outcomes:
│  ├─ Success: Destroy 10-20% of target's ground infrastructure
│  ├─ Success: Reduce resource production for 2-3 turns
│  └─ Failure: Commandos captured (diplomatic incident)
└─ Cannot: Capture sectors (that requires Full Invasion)
```

---

## Three-Tier Raid System (Recommended)

### Tier 1: Military Raids (Basic Harassment)

**Available to:** All players with Commando units

**Requirements:**
- 1× Commando Squad (new unit type, requires Research)
- Target empire NOT on "High Alert" status
- No carrier required (stealth insertion)

**Narrative:**
"Elite special forces infiltrate enemy territory via stealth dropships, sabotage key installations, and extract before reinforcements arrive."

**Effects:**
- Destroy 10% of defender's ground units
- -10% resource production for 2 turns
- +20% suspicion if target suspects foul play
- Cannot capture sectors

**Risk:**
- If detected during raid: Diplomatic incident (-50 relations)
- Defender can respond with counter-raid

---

### Tier 2: Syndicate Pirate Raids (Asymmetric Warfare)

**Available to:** Syndicate operatives only (via contracts)

**Requirements:**
- Syndicate Trust Level 0+
- Complete "Pirate Raid" contract (existing in SYNDICATE-SYSTEM)
- 8,000 credits cost

**Narrative:**
"You hire NPC pirates to raid enemy supply lines, using guerrilla tactics and hit-and-run strikes. The Syndicate provides plausible deniability—officially, this is just 'space piracy.'"

**Effects:**
- Identical to Military Raid mechanically
- BUT generates "Very Low" suspicion (hard to trace)
- Uses NPC pirate fleets (you don't risk your own units)
- Can be executed during peace treaties (black ops)

**Risk:**
- Low suspicion generation
- Target empire may hire pirates to counter-raid you

---

### Tier 3: Insurgent Support (Destabilization)

**Available to:** Syndicate operatives with Trust 1+

**Requirements:**
- Complete "Insurgent Aid" contract
- Target empire has "Civil Unrest" status
- 10,000 credits cost

**Narrative:**
"You support rebel factions already on the ground, providing weapons, training, and coordination. These aren't your troops—they're local insurgents fighting their own government."

**Effects:**
- Civil status -1 (Stable → Unrest → Rioting)
- Ground units take 5% attrition per turn (fighting rebels)
- Target empire distracted (defensive penalty)
- Lasts until target quells rebellion

**Risk:**
- Low suspicion (rebellion looks organic)
- Target may accuse you publicly (trial system)

---

## Integration with Existing Systems

### Combat System Integration

**Full Invasion vs Raid Decision Tree:**

```
Player wants to attack Empire X:

Q1: Do you control space/orbital around target?
├─ YES → Full Invasion available
└─ NO → Full Invasion NOT available

Q2: Do you have Commando units OR Syndicate contracts?
├─ YES → Raid available (covert strike)
└─ NO → Only Blockade available (if you have space units)

Q3: What's your goal?
├─ Capture sectors → MUST do Full Invasion
├─ Weaken before invasion → Raid (harassment)
├─ Sabotage economy → Raid OR Blockade
└─ Stay hidden (Syndicate) → Raid via contract
```

### Syndicate System Integration

**Existing "Pirate Raid" contract maps perfectly:**

From SYNDICATE-SYSTEM.md line 172:
> **Pirate Raid** | Guerrilla attack on target (use NPC pirates as cover) | 1 VP | Very Low suspicion | 8,000 cr

**Proposed addition to contract description:**
> "Executes a Covert Strike (Raid) against target empire using NPC pirate fleets. Resolves as Ground domain combat, but uses pirate unit cards. Target sees 'Space Pirate Activity' not 'Attack from [Your Empire].' Generates suspicious_event with Very Low traceability."

### Research System Integration

**New Tier 2 Specialization (War Machine doctrine):**

```
SPECIAL FORCES DOCTRINE
├─ Unlock: Commando Squad unit card
├─ Effect: Raids cost -50% to execute
├─ Bonus: +2 ATK bonus when conducting Raids
└─ Passive: Can raid empires on "High Alert" (normally blocked)
```

### Crafting System Integration

**New Tier 2 Tech Card:**

```
STEALTH INSERTION PODS
├─ Effect: Your Raids bypass defender's orbital defenses
├─ Bonus: +10% damage on first raid round (surprise)
├─ Counter: Scanner Arrays tech card detects raid before execution
└─ Usage: One-time use per draft
```

---

## Updated Combat System Language

### Revised Section 4.1 (Three Battle Types)

```markdown
| Type | Purpose | Requirements | Resolution | Can Capture? |
|------|---------|--------------|------------|--------------|
| **Full Invasion** | Capture sectors | Carriers + space control | Multi-domain (Space/Orbital/Ground) | YES (5-15%) |
| **Covert Strike (Raid)** | Harassment, sabotage | Commandos OR Syndicate contract | Single domain (Ground only) | NO |
| **Blockade** | Economic warfare | Space fleet | No ground combat | NO |
```

**Narrative Clarification:**

> **Full Invasions** are overt military campaigns requiring fleet superiority. You must fight through Space and Orbital defenses before landing ground forces. Victory captures enemy sectors.

> **Covert Strikes (Raids)** are black ops missions using specialized forces or Syndicate-hired pirates. These bypass conventional defenses through stealth, insurgent support, or diplomatic cover. They weaken enemies but cannot capture territory—that requires a Full Invasion.

> **Blockades** are naval sieges that strangle enemy trade routes without landing troops. Effective for economic pressure but cannot capture ground.

---

## Resolving the DEV NOTE

**Original Question:**
> "I shouldn't be able to do a 'ground war only' if I don't get past space and orbital ranges - unless this is a covert guerilla type raid."

**Answer:** ✅ **You're correct—make it explicitly covert.**

**Proposed Resolution:**

1. **Rename "Raid" → "Covert Strike"** (clearer narrative)

2. **Add Requirements Block:**
   ```
   REQUIREMENTS FOR COVERT STRIKE:
   ├─ Option A: Commando Squad units (Research unlock)
   ├─ Option B: Syndicate "Pirate Raid" contract
   ├─ Option C: Insurgent Aid contract (if target has civil unrest)
   └─ Restriction: Target NOT on "High Alert" (unless Special Forces Doctrine)
   ```

3. **Clarify Narrative in Section 4.1:**
   > "Covert Strikes represent special operations missions—commandos infiltrating via stealth dropships, pirates hired through black markets, or insurgents you're secretly supporting. Unlike Full Invasions, these bypass orbital defenses through subterfuge, not firepower. However, they cannot capture territory; they only harass and weaken."

4. **Remove Confusion:**
   - "Soldiers only" → Change to "Commandos OR Pirates (NPC)"
   - Add: "Cannot be executed if defender has space superiority AND orbital defense stations AND is on High Alert"
   - This creates a tactical decision: "I can raid them NOW while they're distracted, or wait until they're vulnerable"

---

## User Engagement Benefits

### Why This Solution Works:

✅ **Narrative Clarity:**
- Players understand WHY they can raid without space control (covert ops)
- The sci-fi logic holds: You're not teleporting armies, you're infiltrating

✅ **Strategic Depth:**
- Multiple paths: Military (Commandos), Syndicate (Pirates), Diplomacy (Insurgents)
- Raids serve a purpose: Weaken before invasion, avoid direct conflict, stay hidden

✅ **System Integration:**
- Syndicate contracts feel meaningful (Pirate Raid becomes combat-relevant)
- Research unlocks matter (Special Forces Doctrine)
- Crafting cards interact (Stealth Insertion vs Scanner Arrays)

✅ **Risk/Reward Balance:**
- Raids are lower risk (don't fight full fleets)
- But lower reward (no sector capture)
- Distinct tactical use case (not just "weak invasion")

✅ **Player Choice:**
- Aggressive players: Use Commandos for military raids
- Sneaky players: Use Syndicate contracts for plausible deniability
- Hybrid players: Soften target with raids, then Full Invasion

---

## Implementation Recommendation

### Phase 1: Minimal Changes (Immediate)

**Update COMBAT-SYSTEM.md Section 4.1:**

Replace current text with:

```markdown
### 4.1 Three Battle Types

| Type | Purpose | Requirements | Resolution | Can Capture? |
|------|---------|--------------|------------|--------------|
| **Full Invasion** | Capture sectors | Carriers + space control | Multi-domain | YES (5-15%) |
| **Covert Strike** | Harassment, sabotage | Commandos OR Syndicate contract | Ground only | NO |
| **Blockade** | Economic warfare | Space fleet | No combat | NO |

**Full Invasions** are overt military campaigns. You fight through Space/Orbital defenses
before landing troops. Victory captures sectors.

**Covert Strikes** are black ops missions using Commandos (special forces) or Syndicate-hired
pirates. These bypass orbital defenses through stealth insertion, not firepower. They weaken
enemies but cannot capture territory. Available to:
- Empires with "Commando Squad" units (Research unlock)
- Syndicate operatives via "Pirate Raid" contract
- Players supporting insurgents in target empire (Syndicate "Insurgent Aid")

**Blockades** strangle trade routes without landing troops. Economic pressure only.
```

**Remove DEV NOTE** (issue resolved)

---

### Phase 2: Full Implementation (Future)

**Add to Research System:**
- Special Forces Doctrine (Tier 2 specialization)
- Commando Squad unit card

**Add to Crafting System:**
- Stealth Insertion tech card
- Scanner Arrays counter-card

**Add to Syndicate System:**
- Expand "Pirate Raid" contract description
- Link to Covert Strike mechanics

**Add to Bot System:**
- Schemer archetype prioritizes Covert Strikes (deceptive)
- Warlord archetype prefers Full Invasions (direct)
- Opportunist uses Covert Strikes to weaken, then invades

---

## Final Recommendation

**RESOLVE DEV NOTE BY:**

1. ✅ **Rename:** "Raid" → "Covert Strike"
2. ✅ **Justify:** Explicitly covert/stealth operations, not conventional warfare
3. ✅ **Restrict:** Requires Commandos OR Syndicate contract (not free for everyone)
4. ✅ **Clarify:** Cannot capture sectors (that requires Full Invasion)
5. ✅ **Integrate:** Links to Syndicate system (Pirate Raid), Research (Commandos), Crafting (Stealth tech)

**Narrative Test:**
✅ "I hired Syndicate pirates to raid their supply depot while I'm at peace with them" (makes sense)
✅ "I sent Commandos on a black ops mission to sabotage their factories" (makes sense)
✅ "I supported local insurgents to destabilize their regime" (makes sense)
❌ "I sent 10,000 regular soldiers to invade without fighting their space fleet" (does NOT make sense—this is blocked)

---

**Decision:** Accept this solution and update COMBAT-SYSTEM.md?

**Impact:**
- Removes blocker for implementation
- Adds strategic depth (multiple raid types)
- Integrates 3 systems (Combat, Syndicate, Research)
- Maintains narrative consistency

**Next Steps:**
1. Update COMBAT-SYSTEM.md Section 4.1 with revised text
2. Remove DEV NOTE (line 255)
3. Add "Commando Squad" unit card to Phase 2 implementation
4. Update SYSTEMS-ANALYSIS.md to reflect blocker resolution
