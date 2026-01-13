# Covert Operations System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-COV
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/COVERT-OPS-SYSTEM.md

---

## Document Purpose

This document defines the **Covert Operations System** for Nexus Dominion, providing players and AI bots with non-combat strategic options for espionage, sabotage, and subterfuge. Covert operations allow weaker empires to compete with stronger ones through intelligence gathering, economic disruption, and diplomatic manipulation without triggering direct military confrontation.

**Who Should Read This:**
- Gameplay designers implementing stealth mechanics
- Balance team tuning risk/reward for espionage
- Bot AI developers programming archetype-specific covert strategies
- UI/UX designers creating the espionage interface

**What This Resolves:**
- Defines the 10 covert operation types and their effects
- Establishes agent resource economy and operation costs
- Specifies success/failure mechanics and detection risks
- Details bot archetype integration, especially Schemer
- Balances covert ops as anti-snowball mechanisms

**Design Philosophy:**
- **Asymmetric Warfare** - Weaker empires can hurt stronger ones through clever espionage
- **Risk vs Reward** - High-impact operations have higher detection rates and costs
- **Information Warfare** - Intel gathering is as valuable as direct sabotage
- **Emergent Drama** - Detection creates diplomatic incidents and narrative moments
- **Progressive Complexity** - Basic ops unlock early; advanced ops require research
- **No Silver Bullets** - Covert ops supplement strategy but don't replace combat/economy

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Mechanics Overview](#2-mechanics-overview)
3. [Detailed Rules](#3-detailed-rules)
4. [Bot Integration](#4-bot-integration)
5. [UI/UX Design](#5-uiux-design)
6. [Specifications](#6-specifications)
7. [Implementation Requirements](#7-implementation-requirements)
8. [Balance Targets](#8-balance-targets)
9. [Migration Plan](#9-migration-plan)
10. [Conclusion](#10-conclusion)

---

## 1. Core Concept

### 1.1 Espionage as Asymmetric Warfare

In Nexus Dominion's galaxy of 100 competing empires, direct military confrontation isn't always viable. A small empire facing a dominant neighbor needs tools to level the playing field. **Covert operations** provide this asymmetry:

- A **Military Victory** leader with 500 fighters can be disrupted by sabotaging their petroleum refineries
- An **Economic Victory** merchant can have credits stolen, reducing their networth advantage
- A **Research Victory** tech-rusher can lose research points to espionage
- Diplomatic relationships can be manipulated through false intelligence and framing

Unlike combat (which requires military superiority), covert operations depend on **agent resources**, **strategic timing**, and **acceptable risk**. A weak empire with high agent production can punch above its weight class.

**Example Scenario:**
> You're Rank 15 with 3,000 military power. Rank 1 "Admiral Kaine" has 12,000 military power and is nearing Military Victory. Direct combat is suicide. Instead:
>
> 1. Launch **Sabotage Production** to delay his fighter construction
> 2. Use **Steal Military Plans** to see his defenses and share intel with allies
> 3. **Incite Rebellion** in his conquered sectors to drain his resources
> 4. **Frame Kaine** for attacking a powerful neutral, creating enemies
>
> You never fired a shot, but Kaine's momentum stalls, and a coalition forms against him.

### 1.2 The Agent Economy

**Agents** are produced by **Government sectors** (see SECTOR-MANAGEMENT-SYSTEM.md for sector types):
- Each Government sector produces **+300 agents per turn**
- Agents accumulate in a pool (no cap, but expensive opportunity cost)
- Government sectors cost **7,500 credits** to build

**Strategic Trade-off:** Building Government sectors means fewer Commerce (income), Research (tech), or Military production. Espionage-heavy strategies require dedicated investment.

**Agent Production Example:**
```
Starting empire (5 sectors): 0 Government = 0 agents/turn
Mid-game (15 sectors, 2 Government): 600 agents/turn
Late-game (30 sectors, 5 Government): 1,500 agents/turn
Schemer archetype (with Shadow Network): Effective 3,000 agents/turn (50% discount)
```

### 1.3 Player Experience

**As the Spymaster:**
- Open the Covert Operations panel from the Command Center
- Select a target empire and review their defenses (Intel Level affects info visible)
- Choose an operation (Steal Credits, Sabotage, Assassinate, etc.)
- Allocate agents and view success probability
- Click "Execute" and wait for Phase 5 resolution
- Receive a report: Success (with loot), Failure (agents lost), or Detected (diplomatic consequences)

**As the Target:**
- During turn processing, you receive alerts: "COVERT OPERATION DETECTED!"
- Learn the operation type and (sometimes) the perpetrator
- Choose response: Retaliate, demand reparations, form counter-coalition, or ignore
- Invest in counter-espionage (more agents, research defensive tech)

**Emotional Arc:**
- **Curiosity**: "I wonder what that empire is building..."
- **Opportunity**: "They're vulnerable - I can steal their research!"
- **Tension**: "Will they detect me?"
- **Triumph or Regret**: Success feels clever; detection creates drama and rivalry

---

## 2. Mechanics Overview

### 2.1 The Ten Operation Types

| Operation | Cost (Agents) | Effect | Detection Risk | Unlock |
|-----------|---------------|--------|----------------|--------|
| **1. Reconnaissance** | 100 | Reveal target's military, resources, sectors | 10% | Turn 1 |
| **2. Steal Credits** | 200 | Steal 5-15% of target's credits | 25% | Turn 1 |
| **3. Steal Research** | 250 | Steal 10-20% of target's RP bank | 30% | Turn 1 |
| **4. Sabotage Production** | 300 | Delay target's build queue by 2-4 turns | 35% | Turn 15 |
| **5. Incite Rebellion** | 350 | Reduce civil status by 1-2 levels in target sectors | 40% | Turn 15 |
| **6. Assassinate Leader** | 400 | -10% to all target stats for 5 turns | 50% | Turn 30 |
| **7. Steal Military Plans** | 150 | Reveal target's military deployments and planned attacks | 20% | Turn 1 |
| **8. Sabotage Infrastructure** | 450 | Damage 1-3 random target sectors (reduce output 50% for 3 turns) | 45% | Turn 30 |
| **9. Frame Another Empire** | 300 | Make target believe Empire X attacked them (diplomatic incident) | 35% | Turn 30 |
| **10. Recruit Defectors** | 500 | Steal 5-10% of target's population and soldiers | 55% | Turn 60 |

**Operation Categories:**
- **Intelligence Gathering** (Recon, Steal Military Plans): Low risk, high information value
- **Economic Sabotage** (Steal Credits, Sabotage Production, Sabotage Infrastructure): Moderate risk, direct economic harm
- **Social Disruption** (Incite Rebellion, Recruit Defectors): High risk, long-term impact
- **Diplomatic Manipulation** (Frame Another Empire): Moderate risk, creates chaos
- **Assassination** (Assassinate Leader): Highest risk, dramatic but temporary effect

### 2.2 Success Formula

```
Base Success Rate = 60%

Modifiers:
+ (Your Agent Count / 100) * 2%         (max +20%)
- (Target Agent Count / 100) * 1.5%     (max -15%)
+ (Intel Level * 5%)                     (0-3 levels, +0% to +15%)
- (Target Security Research * 10%)       (0-2 tiers, -0% to -20%)
+ (Schemer Archetype Bonus: +10%)
- (Distance Penalty: -5% if adjacent, -10% if wormhole)

Final Success Rate = Clamp(Base + Modifiers, 15%, 85%)
```

**Example Calculation:**
```
You: 800 agents, Intel Level 2, Schemer archetype, same sector
Target: 400 agents, Security Tier 1

Base: 60%
+ Your Agents: (800/100) * 2% = +16%
- Target Agents: (400/100) * 1.5% = -6%
+ Intel: 2 * 5% = +10%
- Security: 1 * 10% = -10%
+ Schemer: +10%
- Distance: 0%

Final = 60 + 16 - 6 + 10 - 10 + 10 = 80% success
```

### 2.3 Detection Mechanics

**Detection Roll** occurs separately from success roll:

```
Detection Chance = Base Detection Risk (per operation)

Modifiers:
- (Your Intel Level * 5%)                (better spycraft)
+ (Target Agent Count / 100) * 2%        (better counter-espionage)
+ (Target Security Research * 10%)       (tech defenses)
- (Schemer Archetype: -10%)

Final Detection = Clamp(Base + Modifiers, 5%, 75%)
```

**Detection Outcomes:**

1. **Success + Undetected** (best case): You gain the benefit, target doesn't know
2. **Success + Detected Anonymous**: Target knows operation occurred, but not who did it
3. **Success + Detected with Blame**: Target knows you did it → Diplomatic incident
4. **Failure + Undetected**: Operation fails, you lose agents, target unaware
5. **Failure + Detected**: Operation fails, you lose agents, target knows you tried

**Diplomatic Consequences of Detection:**
- **-15 Reputation** with target empire
- Target can **Demand Reparations** (pay 2x operation cost in credits, or face war declaration)
- Target can **Share Intel** with allies (your reputation drops with allied empires)
- Target can **Retaliate** with their own covert op (prioritized in Phase 5 processing)

### 2.4 Phase 5 Processing Order

During Turn Processing Phase 5:

```
1. Collect all covert operations queued by empires (weakest to strongest)
2. Process in reverse turn order (strongest empire goes first in covert phase)
   Rationale: Weak empires move first in combat (Phase 6), but strong empires
   get first pick in covert ops, balancing the advantage
3. For each operation:
   a. Roll success (based on Success Formula)
   b. If success, apply effect to target
   c. Roll detection (based on Detection Mechanics)
   d. If detected, apply diplomatic consequences
   e. Log operation result to both empires' event logs
4. Update agent pools (subtract costs)
```

**Why Reverse Order?**
Strong empires with more agents can strike first in espionage, but weak empires attack first in combat. This creates strategic tension: spend agents early (risk counter-ops) or save for retaliation?

---

## 3. Detailed Rules

### 3.1 Operation Details

#### 3.1.1 Reconnaissance (REQ-COV-002)

**Cost:** 100 agents
**Effect:** Reveals intel about target empire
**Detection Risk:** 10% base

**Intel Levels:**
- **Level 0** (default): See empire name, rank, networth
- **Level 1** (Recon once): + military power breakdown, resource stockpiles
- **Level 2** (Recon 3x): + sector count/types, current builds, treaties
- **Level 3** (Recon 6x): + planned attacks, covert operations queue, research progress

Intel decays by 1 level every 20 turns (information becomes stale).

**Use Cases:**
- Scout strong empires before engaging
- Share intel with coalition allies
- Monitor threats for preemptive strikes

#### 3.1.2 Steal Credits (REQ-COV-003)

**Cost:** 200 agents
**Effect:** Steal 5-15% of target's current credit balance (roll 1d10 + 5%)
**Detection Risk:** 25% base

**Stolen Amount:**
```
Roll = 1d10 + 5
Stolen = Target Credits * (Roll / 100)
Maximum = 100,000 credits per operation
```

**Example:**
Target has 250,000 credits. Roll is 8.
Stolen = 250,000 * (8+5)/100 = 250,000 * 0.13 = 32,500 credits

**Use Cases:**
- Economic warfare against merchant empires
- Funding your own economy through espionage
- Denying resources before military engagement

#### 3.1.3 Steal Research (REQ-COV-004)

**Cost:** 250 agents
**Effect:** Steal 10-20% of target's unspent Research Points (roll 1d10 + 10%)
**Detection Risk:** 30% base

**Cannot Steal:**
- Completed techs (Doctrines, Specializations, Capstones)
- RP already allocated to active research

**Can Steal:**
- RP "banked" and not yet spent
- RP from target's current turn income (if operation happens before they spend it)

**Use Cases:**
- Tech-rushing via espionage
- Slowing down Research Victory attempts
- Acquiring RP when you lack Research sectors

#### 3.1.4 Sabotage Production (REQ-COV-005)

**Cost:** 300 agents
**Effect:** Delay target's build queue by 2-4 turns (roll 1d3 + 1 turns)
**Detection Risk:** 35% base

**Affected Builds:**
- Military units (Soldiers, Fighters, Heavy Cruisers)
- Sectors under construction
- Wormholes under construction

**Example:**
Target is building 500 Fighters (5 turns remaining).
Sabotage delays by 3 turns → Now 8 turns remaining.

**Use Cases:**
- Delay enemy military buildup before invasion
- Slow expansion race for contested sectors
- Disrupt wormhole construction to distant regions

#### 3.1.5 Incite Rebellion (REQ-COV-006)

**Cost:** 350 agents
**Effect:** Reduce civil status in 1-3 random target sectors by 1-2 levels
**Detection Risk:** 40% base
**Unlock:** Turn 15+

**Civil Status Levels (from RESOURCE-MANAGEMENT-SYSTEM.md):**
- Ecstatic (4.0x production)
- Content (1.0x production)
- Unrest (0.5x production)
- Rioting (0.25x production)

**Effect Example:**
Target has 3 sectors at "Content". Operation succeeds.
Roll: Affect 2 sectors, reduce by 1 level each.
Result: 2 sectors now "Unrest" (50% production).

**Use Cases:**
- Cripple enemy economy through civil unrest
- Punish conquerors (newly captured sectors easier to destabilize)
- Create openings for liberation attacks (unrest weakens defenses)

#### 3.1.6 Assassinate Leader (REQ-COV-007)

**Cost:** 400 agents
**Effect:** -10% to all target stats for 5 turns (military power, income, research)
**Detection Risk:** 50% base
**Unlock:** Turn 30+

**"All Stats" includes:**
- Military attack/defense power
- Resource production (all types)
- Research point generation
- Credit income

**Narrative Flavor:**
- Success: "BREAKING: [Leader Name] assassinated! Empire in chaos."
- Failure: "Assassination attempt thwarted. [Leader Name] survives."

**Cannot Stack:** Only one Assassinate effect active per empire at a time.

**Use Cases:**
- Critical disruption before major invasion
- Delay victory condition achievement (Research, Economic)
- High-risk, high-reward desperation play

#### 3.1.7 Steal Military Plans (REQ-COV-008)

**Cost:** 150 agents
**Effect:** Reveal target's military deployments, force compositions, and queued attacks
**Detection Risk:** 20% base

**Revealed Information:**
- Soldiers, Fighters, Heavy Cruisers count by location
- Planned attacks next turn (target empire, force allocated)
- Defensive posture (forces reserved for defense)
- Military research bonuses (War Machine doctrine, etc.)

**Use Cases:**
- Pre-combat intelligence (plan counter-strategies)
- Coalition coordination (share target's weaknesses)
- Identify easy targets (low defense sectors)

#### 3.1.8 Sabotage Infrastructure (REQ-COV-009)

**Cost:** 450 agents
**Effect:** Damage 1-3 random target sectors (50% output for 3 turns)
**Detection Risk:** 45% base
**Unlock:** Turn 30+

**Affected Sectors (random):**
- Food sectors → Population growth halted
- Ore sectors → Military maintenance issues
- Petroleum sectors → Wormhole construction stalled
- Commerce sectors → Income loss
- Research sectors → Tech progress slowed

**Repair:**
- Sectors auto-repair after 3 turns (no cost)
- Or pay 5,000 credits to repair immediately

**Use Cases:**
- Economic warfare (target Commerce sectors)
- Pre-invasion softening (damage Ore for military maintenance penalty)
- Desperation attacks against victory leaders

#### 3.1.9 Frame Another Empire (REQ-COV-010)

**Cost:** 300 agents
**Effect:** Make target believe Empire X attacked them (no actual attack occurs)
**Detection Risk:** 35% base
**Unlock:** Turn 30+

**Diplomatic Impact:**
- Target's reputation with Empire X drops by -15
- Target may break treaties with Empire X
- Target may declare war on Empire X
- If detected, YOU take the reputation hit with BOTH empires (-20 each)

**Requirements:**
- Empire X must be known to target (same sector, adjacent, or wormhole-connected)
- Cannot frame an empire the target is currently at war with (not believable)

**Use Cases:**
- Trigger wars between rivals (weaken both)
- Break up enemy alliances
- Redirect aggression away from you

#### 3.1.10 Recruit Defectors (REQ-COV-011)

**Cost:** 500 agents
**Effect:** Steal 5-10% of target's population and soldiers (move to your empire)
**Detection Risk:** 55% base
**Unlock:** Turn 60+ or Capstone research

**Stolen Resources:**
```
Population stolen = Target Population * (Roll 1d6 + 4) / 100
Soldiers stolen = Target Soldiers * (Roll 1d6 + 4) / 100
```

**Cannot Steal:**
- Fighters or Heavy Cruisers (too complex to defect)
- More than 10% (cap per operation)

**Use Cases:**
- Grow your population quickly
- Weaken enemy military before invasion
- Ultimate espionage play (high cost, high risk, high reward)

### 3.2 Counter-Espionage

**Passive Defense:**
- Each 100 agents you have: -1.5% to enemy operation success
- Security Research (Tier 1 & 2): -10% per tier to enemy success, +10% detection

**Active Defense (Future Enhancement):**
- "Counter-Intelligence" operation (not in v1.0): Spend agents to actively hunt enemy spies
- Placeholder for expansion content

### 3.3 Edge Cases

**Operation Fails Due to Insufficient Target Resources:**
- Steal Credits: If target has < 10,000 credits, operation auto-fails (refund 50% agents)
- Steal Research: If target has < 500 RP banked, auto-fail (refund 50%)
- Recruit Defectors: If target has < 10,000 population, auto-fail (refund 50%)

**Multiple Operations Same Turn:**
- Each empire can queue 1 covert operation per turn (v1.0 limit)
- Future: Unlock multiple ops per turn via research

**Operations During Peace Treaties:**
- NAP (Non-Aggression Pact): Covert ops are NOT prohibited, but detection breaks the treaty (-25 reputation)
- Alliance: Covert ops against allies break the alliance and cost -50 reputation
- Coalition: Covert ops against coalition members result in expulsion

**Detection and Anonymity:**
- If detected but anonymous, target cannot retaliate directly (no known perpetrator)
- Target can launch "Reconnaissance" to try to identify the spy
- Advanced AI bots may infer the attacker based on motive/capability

---

## 4. Bot Integration

### 4.1 Archetype Behavior

| Archetype | Covert Priority | Preferred Operations | Frequency | Notes |
|-----------|----------------|----------------------|-----------|-------|
| **Warlord** | 0.5 (Low) | Steal Military Plans, Sabotage Production | Rare | Uses only for military advantage before invasions |
| **Diplomat** | 0.2 (Very Low) | Reconnaissance, Frame Another Empire | Very Rare | Avoids covert ops (conflicts with diplomacy ethos) |
| **Merchant** | 0.4 (Low) | Steal Credits, Reconnaissance | Occasional | Prefers trade but will spy on competitors |
| **Schemer** | 0.9 (Very High) | ALL (especially Frame, Assassinate) | Very Frequent | Core strategy; builds 3-5 Government sectors |
| **Turtle** | 0.3 (Low) | Steal Research | Rare | Uses espionage to catch up on tech when isolated |
| **Blitzkrieg** | 0.4 (Low) | Sabotage Production, Steal Military Plans | Occasional | Softens targets before blitz attacks |
| **Tech Rush** | 0.3 (Low) | Steal Research, Reconnaissance | Occasional | Spies to accelerate research, but prefers building |
| **Opportunist** | 0.5 (Medium) | ALL (context-dependent) | Variable | Uses whichever operation maximizes immediate gain |

**Schemer Archetype Deep Dive:**

Schemers are defined by covert operations:
- **Passive Ability: Shadow Network** → -50% agent cost for all operations
- Builds 3-5 Government sectors by Turn 30 (600-1,500 agents/turn)
- Launches 2-3 operations per turn (when multi-op research unlocked)
- Prioritizes high-risk, high-reward ops (Assassinate, Frame, Recruit Defectors)
- Acts as "kingmaker" → Disrupts leaders to prevent victories
- Diplomatic cover: "I swear it wasn't me!" (even when detected)

**Example Schemer Decision Tree:**
```
if (target.rank == 1 && target.victoryPoints >= 7):
    if (agents >= 400):
        operation = "Assassinate Leader" (disrupt leader)
    else:
        operation = "Sabotage Production" (delay their builds)
else if (target.alliance.size > 3):
    operation = "Frame Another Empire" (break up alliances)
else if (self.rank > 20 && target.rank < 5):
    operation = "Steal Research" (catch up on tech)
else:
    operation = "Reconnaissance" (gather intel for future ops)
```

### 4.2 Bot Decision Logic

**General Bot Covert Operation Logic:**

```python
def choose_covert_operation(bot, game_state):
    # Skip if low priority archetype and low agent count
    if bot.archetype.covert_priority < 0.4 and bot.agents < 300:
        return None

    # Identify threats (higher rank, high military, near victory)
    threats = [e for e in game_state.empires if e.rank < bot.rank and e.is_neighbor(bot)]

    # Schemers always act if they have agents
    if bot.archetype == "Schemer" and bot.agents >= 200:
        target = select_target_schemer(bot, threats, game_state)
        return choose_operation_schemer(bot, target, game_state)

    # Warlords use covert ops pre-invasion
    if bot.archetype == "Warlord" and bot.is_planning_attack():
        target = bot.next_attack_target
        if bot.agents >= 300:
            return "Sabotage Production" on target
        elif bot.agents >= 150:
            return "Steal Military Plans" on target

    # Opportunists look for easy wins
    if bot.archetype == "Opportunist":
        # Find rich targets with low defense
        rich_targets = [e for e in threats if e.credits > 200000 and e.agents < 200]
        if rich_targets and bot.agents >= 200:
            return "Steal Credits" on richest(rich_targets)

    # Default: Reconnaissance on top-ranked neighbor
    if bot.agents >= 100 and threats:
        return "Reconnaissance" on threats[0]

    return None  # Don't use covert ops this turn
```

**Schemer-Specific Logic:**

```python
def choose_operation_schemer(bot, target, game_state):
    # Disruption: Stop leaders from winning
    if target.victoryPoints >= 7:
        if bot.agents >= 200:  # Shadow Network makes Assassinate cost 200
            return "Assassinate Leader"
        else:
            return "Sabotage Production"

    # Chaos: Break up strong alliances
    if target.alliance_size > 3:
        strong_ally = target.strongest_ally()
        return "Frame Another Empire" (blame strong_ally)

    # Profit: Steal from rich merchants
    if target.archetype == "Merchant" and target.credits > 300000:
        return "Steal Credits"

    # Catch-up: Steal tech from leaders
    if target.archetype == "Tech Rush" and target.research_tier > bot.research_tier:
        return "Steal Research"

    # Default: Gather intel
    return "Reconnaissance"
```

### 4.3 Bot Messages

**Schemer Messages (Covert Operations):**

```markdown
**Planning an operation:**
"[Target], I've been watching you. Interesting moves you've been making..."

**After successful (undetected) operation:**
"[Target], you seem to be having some... difficulties. How unfortunate."

**After detected operation (deny):**
"[Target], I assure you, I had nothing to do with your recent troubles. You have enemies everywhere."

**After detected operation (confession with threat):**
"Yes, [Target], it was me. And I'll do it again if you threaten my position."

**Offering to sell intel:**
"[Player], I have some interesting information about [Target]. For a price, of course."

**Recruiting player into scheme:**
"[Player], [Target] is growing too powerful. Help me take them down, and we both benefit."

**When betrayed by player:**
"You fool. You have no idea who you've crossed. I will ruin you."

**When successfully framing another empire:**
"[Target], I heard [Framed Empire] is plotting against you. Just thought you should know..."

**After assassination success:**
"The galaxy is a dangerous place, [Target]. Leaders should watch their backs."

**When caught in failed operation:**
"So you caught me. What are you going to do about it? I'll be back."
```

**Warlord Messages (Limited Covert Use):**

```markdown
**Before invasion (after stealing military plans):**
"[Target], I know your defenses. Surrender now, or face annihilation."

**After sabotaging production:**
"[Target], your factories are in ruins. You cannot stop my advance."

**If asked about covert ops (disdainful):**
"Espionage is for cowards. I crush my enemies on the battlefield."
```

**Diplomat Messages (Reluctant Covert Use):**

```markdown
**After reconnaissance:**
"[Target], I merely seek to understand your position. No harm intended."

**If caught in operation (apologetic):**
"[Target], I regret this misunderstanding. Let us resolve this diplomatically."
```

**Opportunist Messages (Pragmatic):**

```markdown
**After stealing credits:**
"Business is business, [Target]. Nothing personal."

**After successful operation:**
"Opportunity knocked, [Target]. I simply answered."
```

---

## 5. UI/UX Design

### 5.1 UI Mockups

#### 5.1.1 Covert Operations Panel (Main Interface)

```
┌────────────────────────────────────────────────────────────────┐
│  COVERT OPERATIONS CENTER                        Agents: 1,200  │
│  [Intel] [Operations] [Reports] [Counter-Intel]                │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │  TARGET SELECTION   │  │  OPERATION DETAILS               │ │
│  │                     │  │                                  │ │
│  │  [Search Empire...] │  │  Operation: STEAL CREDITS       │ │
│  │                     │  │  Target: Admiral Kaine (#1)     │ │
│  │  Recent Targets:    │  │  Cost: 200 agents               │ │
│  │  • Admiral Kaine    │  │  Success Rate: 65%              │ │
│  │  • Merchant Zara    │  │  Detection Risk: 25%            │ │
│  │  • Tech Corp Alpha  │  │                                  │ │
│  │                     │  │  Effect: Steal 5-15% of credits │ │
│  │  Neighbors:         │  │  Estimate: 32,500 - 97,500 cr   │ │
│  │  • Empire A (Rank 7)│  │                                  │ │
│  │  • Empire B (Rank 9)│  │  Intel Level: 2 (Good)          │ │
│  │  • Empire C (Rank 3)│  │  Target Agents: ~400            │ │
│  │                     │  │  Target Security: Tier 1        │ │
│  └─────────────────────┘  │                                  │ │
│                            │  [EXECUTE OPERATION]  [CANCEL]  │ │
│                            └──────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AVAILABLE OPERATIONS                                    │   │
│  │  ┌────────────┬────────────┬────────────┬────────────┐  │   │
│  │  │ Recon      │ Steal $$$  │ Steal RP   │ Sabotage   │  │   │
│  │  │ 100 agents │ 200 agents │ 250 agents │ 300 agents │  │   │
│  │  ├────────────┼────────────┼────────────┼────────────┤  │   │
│  │  │ Incite     │ Assassinate│ Steal Plans│ Sabotage   │  │   │
│  │  │ 350 agents │ 400 agents │ 150 agents │ Infra 450  │  │   │
│  │  ├────────────┼────────────┼────────────┼────────────┤  │   │
│  │  │ Frame      │ Recruit    │            │            │  │   │
│  │  │ 300 agents │ 500 agents │            │            │  │   │
│  │  └────────────┴────────────┴────────────┴────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

#### 5.1.2 Operation Result Notification

```
┌────────────────────────────────────────┐
│  ⚠️  COVERT OPERATION REPORT           │
├────────────────────────────────────────┤
│  Operation: STEAL CREDITS              │
│  Target: Admiral Kaine (#1)            │
│  Status: SUCCESS (Undetected)          │
│                                        │
│  ✓ Stolen: 47,250 credits             │
│  ✓ No detection                        │
│  ✓ Intel level increased to 2          │
│                                        │
│  Agents Remaining: 1,000               │
│                                        │
│  [VIEW DETAILS]  [CLOSE]               │
└────────────────────────────────────────┘
```

#### 5.1.3 Detection Alert (As Target)

```
┌────────────────────────────────────────┐
│  🚨 COVERT OPERATION DETECTED!        │
├────────────────────────────────────────┤
│  Operation: SABOTAGE PRODUCTION        │
│  Perpetrator: UNKNOWN                  │
│  Impact: Build queue delayed 3 turns   │
│                                        │
│  Your Sectors Affected:                │
│  • Fighter Construction (5 → 8 turns) │
│  • Heavy Cruiser Build (3 → 6 turns)  │
│                                        │
│  Response Options:                     │
│  [Investigate] (100 agents)            │
│  [Increase Security] (500 agents/turn) │
│  [Ignore]                              │
└────────────────────────────────────────┘
```

### 5.2 User Flows

#### 5.2.1 Executing a Covert Operation

```
1. Player clicks "Covert Ops" button in Command Center nav
2. Panel opens showing:
   - Current agent count (top-right)
   - Target selection sidebar (left)
   - Operation grid (center)
   - Details panel (right)
3. Player clicks a target empire from list or searches
4. Target's intel card displays:
   - Name, rank, archetype
   - Intel level (0-3) determines visible info
   - Estimated agent count (if Intel 2+)
   - Recent activity (if Intel 3)
5. Player clicks an operation card from grid
6. Details panel updates:
   - Operation description
   - Agent cost
   - Success rate calculation (shown with tooltip breakdown)
   - Detection risk (color-coded: green < 30%, yellow 30-50%, red > 50%)
   - Estimated effect range (min-max values)
7. Player reviews and clicks [EXECUTE OPERATION]
8. Confirmation modal: "Spend 200 agents on STEAL CREDITS vs Admiral Kaine?"
9. Player confirms
10. Operation queued (visible in "Pending" tab)
11. Turn advances
12. Phase 5 resolves operation
13. Notification appears with result
14. Event log updated
```

#### 5.2.2 Responding to Detection

```
1. Player receives alert during turn processing: "OPERATION DETECTED!"
2. Modal appears with details:
   - Operation type
   - Perpetrator (if identified)
   - Impact on your empire
   - Response options
3. Player chooses response:

   A. INVESTIGATE (if perpetrator unknown):
      - Spend 100 agents
      - Roll to identify perpetrator
      - Success reveals empire name
      - Can then demand reparations or retaliate

   B. DEMAND REPARATIONS (if perpetrator known):
      - Send diplomatic demand: "Pay 2x operation cost or face war"
      - Target can accept (pay credits) or refuse (war declared)

   C. RETALIATE:
      - Opens Covert Ops panel with perpetrator pre-selected
      - Choose counter-operation
      - Queued for next turn (priority processing)

   D. INCREASE SECURITY:
      - Allocate agents to counter-espionage (ongoing cost per turn)
      - Reduces future operation success rates against you

   E. IGNORE:
      - Accept the loss
      - No diplomatic or resource cost
      - Perpetrator may target you again
```

#### 5.2.3 Schemer Bot "Offering Intel" Event

```
1. Player receives message from Schemer bot:
   "I have information about [Empire X]. Interested? 10,000 credits."
2. Player clicks [VIEW OFFER]
3. Modal shows:
   - Schemer's name and archetype
   - Target empire name
   - Type of intel offered (Military Plans, Resource Stockpiles, etc.)
   - Price: 10,000 credits
   - Warning: "Bots may lie or provide outdated intel"
4. Player chooses:
   A. [BUY INTEL] → Pay credits, receive info (may be accurate or false)
   B. [DECLINE] → No transaction
   C. [COUNTEROFFER] → Haggle (Diplomacy check)
5. If purchased, intel added to empire intel card
```

### 5.3 Visual Design Principles

**LCARS Aesthetic Integration:**
- **Color Coding:**
  - Orange: Covert Operations panel headers (matches aggressive actions)
  - Violet: Detection alerts (danger/warning)
  - Peach: Success notifications (positive outcome)
  - Blue: Intel cards (information)

- **Agent Counter:**
  - Persistent in top-right of panel
  - Pulses orange when operation costs more than current agents
  - Smooth decrement animation when spending agents

- **Operation Cards:**
  - Hover state: Glow effect + expand slightly
  - Locked operations (not yet unlocked): Grayscale + lock icon + "Unlock Turn 30"
  - Insufficient agents: Red border + "Need 200 more agents"

- **Success/Detection Bars:**
  - Visual probability bars (0-100%)
  - Green gradient for high success
  - Red gradient for high detection
  - Tooltip on hover: "Base 60% + 16% (agents) - 6% (target defense) + 10% (intel) = 80%"

- **Intel Level Indicator:**
  - 0-3 dots filled (█ █ █ ░)
  - Each level reveals more target information
  - Hover tooltip: "Intel decays every 20 turns. Recon again to refresh."

- **Animation States:**
  - Operation execution: Spinning agent icon + "Processing..."
  - Success: Green checkmark + brief flash
  - Failure: Red X + shake animation
  - Detection: Alert siren icon + pulse effect

---

## 6. Specifications

This section contains formal requirements for spec-driven development. Each specification has a unique ID for traceability, links to code and tests, and can be validated independently.

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |
| **Deprecated** | Superseded by another spec |

---

### REQ-COV-001: Ten Operation Types

**Description:** The covert operations system provides exactly 10 distinct operation types, each with unique effects, costs, and detection risks.

**Rationale:** Variety enables strategic depth while maintaining manageable complexity. Ten operations cover intelligence, economic, social, and diplomatic categories without overwhelming players.

**Key Values:**
| Operation | Cost | Detection Risk | Unlock Turn |
|-----------|------|----------------|-------------|
| Reconnaissance | 100 | 10% | 1 |
| Steal Credits | 200 | 25% | 1 |
| Steal Research | 250 | 30% | 1 |
| Sabotage Production | 300 | 35% | 15 |
| Incite Rebellion | 350 | 40% | 15 |
| Assassinate Leader | 400 | 50% | 30 |
| Steal Military Plans | 150 | 20% | 1 |
| Sabotage Infrastructure | 450 | 45% | 30 |
| Frame Another Empire | 300 | 35% | 30 |
| Recruit Defectors | 500 | 55% | 60 |

**Source:** Section 2.1 - The Ten Operation Types

**Code:**
- `src/lib/covert/operations.ts` - Operation type definitions and constants
- `src/lib/covert/operation-effects.ts` - Effect implementation for each operation

**Tests:**
- `src/lib/covert/__tests__/operations.test.ts` - Verify all 10 operations exist with correct properties

**Status:** Draft

---

### REQ-COV-002: Reconnaissance Intel Levels

**Description:** Reconnaissance operations reveal progressively more detailed intelligence about target empires through 4 intel levels (0-3). Intel decays by 1 level every 20 turns.

**Rationale:** Graduated intel system rewards repeated reconnaissance and creates strategic decisions about when to spy vs. act. Decay prevents stale information from being permanent.

**Key Values:**
| Intel Level | Visible Information | Recon Needed |
|-------------|---------------------|--------------|
| 0 (default) | Name, rank, networth | None |
| 1 | + Military power, resources | 1 recon |
| 2 | + Sectors, builds, treaties | 3 recons |
| 3 | + Planned attacks, covert ops, research | 6 recons |

**Formula:**
```
Intel Level = min(3, total_successful_recons / [1, 3, 6])
Decay: Every 20 turns, Intel Level -= 1 (min 0)
```

**Source:** Section 3.1.1 - Reconnaissance

**Code:**
- `src/lib/covert/intel-system.ts` - Intel level tracking and decay
- `src/lib/covert/operation-effects.ts` - Reconnaissance effect implementation

**Tests:**
- `src/lib/covert/__tests__/intel-system.test.ts` - Test intel progression and decay

**Status:** Draft

---

### REQ-COV-003: Success Rate Formula

**Description:** Covert operation success rates are calculated using a base rate of 60% modified by agent counts, intel level, security research, archetype bonuses, and distance, clamped between 15% and 85%.

**Rationale:** Formula rewards investment (more agents, better intel) while preventing guaranteed success or guaranteed failure. Multiple factors create strategic depth.

**Formula:**
```
Base Success Rate = 60%

Modifiers:
+ (Your Agent Count / 100) * 2%         (max +20%)
- (Target Agent Count / 100) * 1.5%     (max -15%)
+ (Intel Level * 5%)                     (0-3 levels, +0% to +15%)
- (Target Security Research * 10%)       (0-2 tiers, -0% to -20%)
+ (Schemer Archetype Bonus: +10%)
- (Distance Penalty: -5% if adjacent, -10% if wormhole)

Final Success Rate = Clamp(Base + Modifiers, 15%, 85%)
```

**Source:** Section 2.2 - Success Formula

**Code:**
- `src/lib/covert/success-calculator.ts` - Success rate calculation
- `src/lib/covert/operation-resolver.ts` - Roll and resolve success

**Tests:**
- `src/lib/covert/__tests__/success-calculator.test.ts` - Test formula with various inputs, verify clamping

**Status:** Draft

---

### REQ-COV-004: Detection Mechanics

**Description:** Detection occurs independently from success. Detection chance is based on operation base risk, modified by intel level, target agents, target security, and archetype. Detection results in diplomatic consequences including reputation loss and potential war.

**Rationale:** Separating detection from success creates four outcome scenarios (success/failure × detected/undetected), adding risk management complexity. Diplomatic consequences make detection meaningful.

**Formula:**
```
Detection Chance = Base Detection Risk (per operation)

Modifiers:
- (Your Intel Level * 5%)                (better spycraft)
+ (Target Agent Count / 100) * 2%        (better counter-espionage)
+ (Target Security Research * 10%)       (tech defenses)
- (Schemer Archetype: -10%)

Final Detection = Clamp(Base + Modifiers, 5%, 75%)
```

**Diplomatic Consequences:**
- -15 Reputation with target
- Target can demand reparations (2x operation cost)
- Target can share intel with allies
- Target can retaliate with counter-operation

**Source:** Section 2.3 - Detection Mechanics

**Code:**
- `src/lib/covert/detection-calculator.ts` - Detection chance calculation
- `src/lib/covert/detection-resolver.ts` - Handle detection outcomes
- `src/lib/diplomacy/reputation-system.ts` - Apply reputation penalties

**Tests:**
- `src/lib/covert/__tests__/detection.test.ts` - Test detection formula and outcomes
- `src/lib/diplomacy/__tests__/reputation.test.ts` - Verify reputation changes on detection

**Status:** Draft

---

### REQ-COV-005: Agent Economy

**Description:** Government sectors produce 300 agents per turn. Agents accumulate in a pool with no cap. Covert operations consume agents based on operation cost. Schemer archetype receives 50% cost reduction via Shadow Network passive.

**Rationale:** Agent economy creates strategic trade-offs: Government sectors cost 7,500 credits and provide no direct military/economic benefit. Investment in espionage must be intentional.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Government sector production | 300 agents/turn | Per sector |
| Government sector cost | 7,500 credits | Opportunity cost vs Commerce |
| Agent pool cap | None | Can accumulate indefinitely |
| Schemer discount | 50% | Shadow Network passive |

**Formula:**
```
Agents per turn = Government Sector Count * 300
Operation cost = Base Cost * (Schemer ? 0.5 : 1.0)
```

**Source:** Section 1.2 - The Agent Economy

**Code:**
- `src/lib/resources/agent-production.ts` - Agent generation from Government sectors
- `src/lib/covert/agent-pool.ts` - Agent accumulation and spending
- `src/lib/bots/archetypes/schemer.ts` - Shadow Network passive implementation

**Tests:**
- `src/lib/resources/__tests__/agent-production.test.ts` - Verify production rates
- `src/lib/covert/__tests__/agent-pool.test.ts` - Test spending and tracking
- `src/lib/bots/__tests__/schemer.test.ts` - Verify 50% discount applies

**Status:** Draft

---

### REQ-COV-006: Phase 5 Processing Order

**Description:** Covert operations are resolved in Turn Processing Phase 5, after Diplomacy (Phase 4) and before Combat (Phase 6). Operations process in reverse turn order (strongest empire first) to balance weak-first combat advantage.

**Rationale:** Sequential processing creates strategic tension. Strong empires strike first in espionage but last in combat. Timing matters for detection and retaliation.

**Processing Steps:**
```
1. Collect all queued operations (weakest to strongest)
2. Process in reverse order (strongest first)
3. For each operation:
   a. Roll success
   b. Apply effect if successful
   c. Roll detection
   d. Apply diplomatic consequences if detected
   e. Log results
4. Update agent pools
```

**Source:** Section 2.4 - Phase 5 Processing Order

**Code:**
- `src/lib/turn-processor/phase-5-covert.ts` - Covert operations phase handler
- `src/lib/covert/operation-resolver.ts` - Individual operation resolution

**Tests:**
- `src/lib/turn-processor/__tests__/phase-5.test.ts` - Test order, resolution, side effects

**Status:** Draft

---

### REQ-COV-007: Steal Credits Operation

**Description:** Steal Credits operation (cost 200 agents, 25% detection) steals 5-15% of target's current credit balance (roll 1d10+5), capped at 100,000 credits per operation.

**Rationale:** Economic warfare is a core covert strategy. Cap prevents single operation from bankrupting empires. Percentage-based ensures relevance at all game stages.

**Formula:**
```
Roll = 1d10 + 5
Stolen = min(Target Credits * (Roll / 100), 100000)
```

**Source:** Section 3.1.2 - Steal Credits

**Code:**
- `src/lib/covert/operations/steal-credits.ts` - Implementation
- `src/lib/resources/credit-transfer.ts` - Transfer credits between empires

**Tests:**
- `src/lib/covert/__tests__/steal-credits.test.ts` - Verify percentage calculation, cap, detection

**Status:** Draft

---

### REQ-COV-008: Schemer Archetype Integration (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-COV-008-A through REQ-COV-008-D below.

**Overview:** Schemer archetype specializes in espionage with highest covert priority (0.9), Shadow Network passive (50% cost reduction), specialized decision logic, and Government sector focus.

**Components:**
- Covert Priority: 0.9 (highest) [REQ-COV-008-A]
- Shadow Network Passive: 50% agent discount [REQ-COV-008-B]
- Decision Logic: High-impact operation focus [REQ-COV-008-C]
- Government Sectors: 3-5 by Turn 30 [REQ-COV-008-D]

---

### REQ-COV-008-A: Schemer Covert Priority

**Description:** Schemer archetype has 0.9 covert operation priority weight, the highest among all archetypes, making covert ops their most frequent action type.

**Priority Rules:**
- Covert priority weight: 0.9 (90% of decision weight)
- Highest among all 8 archetypes
- Determines action selection in bot decision phase
- Operations per turn: 2-3 when multi-op unlocked

**Rationale:** Defines Schemer identity as espionage specialist. High priority ensures frequent covert action selection during bot decision phase.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1 - Archetype Behavior, Schemer Priority

**Code:** TBD - `src/lib/bots/archetypes/schemer.ts` - Priority weight definition

**Tests:** TBD - Verify Schemer selects covert ops 80-90% of turns

**Status:** Draft

---

### REQ-COV-008-B: Schemer Shadow Network Passive

**Description:** Schemer archetype has "Shadow Network" passive ability that reduces all covert operation agent costs by 50%.

**Discount Rules:**
- Passive name: "Shadow Network"
- Discount: 50% off all agent costs
- Applies to: All covert operations (Reconnaissance, Sabotage, Steal Credits, Assassinate, Frame, etc.)
- Always active (no unlock required)

**Rationale:** Makes frequent covert operations economically viable. Compensates for high agent costs of operations like Assassinate (400 agents → 200 agents).

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1 - Archetype Behavior, Shadow Network Passive

**Code:** TBD - `src/lib/bots/archetypes/schemer.ts` - Cost modifier

**Tests:** TBD - Verify 50% discount applied to all operations

**Status:** Draft

> **⚠️ BALANCE CONCERN**: 50% discount is very strong. May need tuning if Schemers dominate.

---

### REQ-COV-008-C: Schemer Decision Logic

**Description:** Schemer archetype prioritizes high-impact covert operations (Assassinate, Frame Another Empire, Recruit Defectors) over low-impact ops (Reconnaissance, Steal Credits).

**Decision Priorities:**
- **Tier 1 (High-impact):** Assassinate Leader, Frame Another Empire, Recruit Defectors
- **Tier 2 (Medium-impact):** Sabotage Operations, Investigate Specialization
- **Tier 3 (Low-impact):** Reconnaissance, Steal Credits (fallback when low on agents)

**Rationale:** Schemers seek dramatic, game-changing espionage plays rather than incremental advantage. Reinforces "master manipulator" fantasy.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1 - Archetype Behavior, Schemer Decision Tree

**Code:** TBD - `src/lib/bots/decision-trees/schemer-covert.ts` - Operation prioritization

**Tests:** TBD - Verify Tier 1 ops selected 70%+ of time when available

**Status:** Draft

---

### REQ-COV-008-D: Schemer Government Sector Focus

**Description:** Schemer archetype builds 3-5 Government sectors by Turn 30 to generate high agent production for covert operations.

**Sector Building Rules:**
- Target: 3-5 Government sectors by Turn 30
- Purpose: Maximize agent generation for frequent operations
- Priority: High (secondary only to Urban for pop capacity)
- Timing: Start building Government sectors Turn 10-15

**Rationale:** Government sectors produce agents. Schemers need abundant agents for their covert-heavy playstyle. 3-5 sectors support 2-3 operations per turn.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1 - Archetype Behavior, Schemer Economic Strategy

**Code:** TBD - `src/lib/bots/archetypes/schemer.ts` - Sector building priorities

**Tests:** TBD - Verify 3-5 Government sectors by Turn 30

**Status:** Draft

> **⚠️ PLACEHOLDER VALUES**: Government sector count (3-5) requires playtesting. May be too high/low.

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/bots/archetypes/schemer.ts` - Schemer archetype definition and integration
- `src/lib/bots/__tests__/schemer.test.ts` - Comprehensive Schemer behavior tests

---

### REQ-COV-009: Assassinate Leader Operation

**Description:** Assassinate Leader operation (cost 400 agents, 50% detection, Turn 30+ unlock) reduces all target stats by 10% for 5 turns. Cannot stack multiple assassinations on same empire.

**Rationale:** High-risk, high-reward disruption tool. Temporary nature prevents permanent crippling. High detection risk creates dramatic diplomatic incidents. Non-stacking prevents abuse.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Cost | 400 agents | Expensive |
| Detection risk | 50% base | Very risky |
| Effect | -10% all stats | Military, income, research |
| Duration | 5 turns | Temporary disruption |
| Stacking | No | Only one assassination active per empire |

**Source:** Section 3.1.6 - Assassinate Leader

**Code:**
- `src/lib/covert/operations/assassinate.ts` - Implementation
- `src/lib/effects/stat-modifiers.ts` - Apply temporary stat penalties

**Tests:**
- `src/lib/covert/__tests__/assassinate.test.ts` - Verify effect, duration, non-stacking

**Status:** Draft

---

### REQ-COV-010: Frame Another Empire Operation

**Description:** Frame Another Empire operation (cost 300 agents, 35% detection, Turn 30+ unlock) creates a false diplomatic incident making target believe Empire X attacked them. Target's reputation with Empire X drops by -15 and may trigger war. If detected, perpetrator suffers -20 reputation with both empires.

**Rationale:** Diplomatic manipulation creates chaos and redirects aggression. High failure consequences (double reputation hit) balance the power to trigger wars. Requires strategic timing and target selection.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Cost | 300 agents | Moderate |
| Detection risk | 35% base | Moderate risk |
| Reputation impact (target) | -15 with Empire X | Target's perspective |
| Reputation impact (detected) | -20 with both | Perpetrator penalty if caught |
| Requirements | Empire X must be known to target | Believability check |

**Source:** Section 3.1.9 - Frame Another Empire

**Code:**
- `src/lib/covert/operations/frame-empire.ts` - Implementation
- `src/lib/diplomacy/reputation-system.ts` - Apply reputation changes
- `src/lib/diplomacy/incident-resolver.ts` - Handle diplomatic incidents

**Tests:**
- `src/lib/covert/__tests__/frame-empire.test.ts` - Test framing logic, reputation changes, detection consequences

**Status:** Draft

---

### REQ-COV-011: Intel Decay System

**Description:** Intel levels decay by 1 level every 20 turns to represent information becoming stale. Players must perform Reconnaissance periodically to maintain current intelligence.

**Rationale:** Prevents one-time reconnaissance from providing permanent intel. Creates ongoing agent investment decision. Simulates intelligence degradation over time.

**Formula:**
```
Every 20 turns:
  if (turns_since_last_recon >= 20):
    intel_level = max(0, intel_level - 1)
    turns_since_last_recon = 0
```

**Source:** Section 3.1.1 - Reconnaissance, REQ-COV-002

**Code:**
- `src/lib/covert/intel-system.ts` - Intel decay logic
- `src/lib/turn-processor/phase-1-income.ts` - Trigger decay check each turn

**Tests:**
- `src/lib/covert/__tests__/intel-decay.test.ts` - Verify decay timing and intel level reduction

**Status:** Draft

---

### REQ-COV-012: Operation Failure Resource Refunds

**Description:** When operations auto-fail due to insufficient target resources (e.g., Steal Credits when target has < 10,000 credits), 50% of agent cost is refunded to the perpetrator.

**Rationale:** Prevents player frustration from wasting agents on impossible operations. Partial refund (not full) maintains consequence for poor target selection. Encourages reconnaissance before expensive operations.

**Auto-Fail Thresholds:**
| Operation | Minimum Target Resource | Refund |
|-----------|-------------------------|--------|
| Steal Credits | 10,000 credits | 50% |
| Steal Research | 500 RP banked | 50% |
| Recruit Defectors | 10,000 population | 50% |

**Source:** Section 3.3 - Edge Cases

**Code:**
- `src/lib/covert/operation-validator.ts` - Check target resource thresholds
- `src/lib/covert/agent-pool.ts` - Process refunds

**Tests:**
- `src/lib/covert/__tests__/operation-validator.test.ts` - Test auto-fail conditions and refunds

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-COV-001 | Ten Operation Types | Draft | TBD |
| REQ-COV-002 | Reconnaissance Intel Levels | Draft | TBD |
| REQ-COV-003 | Success Rate Formula | Draft | TBD |
| REQ-COV-004 | Detection Mechanics | Draft | TBD |
| REQ-COV-005 | Agent Economy | Draft | TBD |
| REQ-COV-006 | Phase 5 Processing Order | Draft | TBD |
| REQ-COV-007 | Steal Credits Operation | Draft | TBD |
| REQ-COV-008 | Schemer Archetype Integration | Draft | TBD |
| REQ-COV-009 | Assassinate Leader Operation | Draft | TBD |
| REQ-COV-010 | Frame Another Empire Operation | Draft | TBD |
| REQ-COV-011 | Intel Decay System | Draft | TBD |
| REQ-COV-012 | Operation Failure Resource Refunds | Draft | TBD |

**Total Specifications:** 12
**Implemented:** 0
**Validated:** 0
**Draft:** 12

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: covert_operations
-- Purpose: Track covert operation execution and history

CREATE TABLE covert_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,

  perpetrator_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  target_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  operation_type VARCHAR(50) NOT NULL, -- 'reconnaissance', 'steal_credits', etc.
  agents_spent INTEGER NOT NULL,

  success BOOLEAN NOT NULL,
  detected BOOLEAN NOT NULL,
  detected_anonymous BOOLEAN DEFAULT FALSE, -- Detected but perpetrator unknown

  effect_data JSONB, -- Operation-specific results (e.g., credits_stolen: 32500)

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_operation_type CHECK (operation_type IN (
    'reconnaissance', 'steal_credits', 'steal_research', 'sabotage_production',
    'incite_rebellion', 'assassinate_leader', 'steal_military_plans',
    'sabotage_infrastructure', 'frame_empire', 'recruit_defectors'
  ))
);

-- Indexes
CREATE INDEX idx_covert_ops_game_turn ON covert_operations(game_id, turn_number);
CREATE INDEX idx_covert_ops_perpetrator ON covert_operations(perpetrator_empire_id);
CREATE INDEX idx_covert_ops_target ON covert_operations(target_empire_id);

---

-- Table: empire_intel
-- Purpose: Track intel levels between empires

CREATE TABLE empire_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  observer_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  target_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  intel_level INTEGER NOT NULL DEFAULT 0, -- 0-3
  last_recon_turn INTEGER, -- For decay calculation
  total_recons INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, observer_empire_id, target_empire_id),
  CONSTRAINT valid_intel_level CHECK (intel_level BETWEEN 0 AND 3)
);

-- Indexes
CREATE INDEX idx_empire_intel_observer ON empire_intel(observer_empire_id);
CREATE INDEX idx_empire_intel_target ON empire_intel(target_empire_id);

---

-- Table: covert_operation_queue
-- Purpose: Queue operations for Phase 5 processing

CREATE TABLE covert_operation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,

  perpetrator_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  target_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  operation_type VARCHAR(50) NOT NULL,
  agents_allocated INTEGER NOT NULL,

  processed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_operation_type CHECK (operation_type IN (
    'reconnaissance', 'steal_credits', 'steal_research', 'sabotage_production',
    'incite_rebellion', 'assassinate_leader', 'steal_military_plans',
    'sabotage_infrastructure', 'frame_empire', 'recruit_defectors'
  ))
);

-- Indexes
CREATE INDEX idx_covert_queue_game_turn ON covert_operation_queue(game_id, turn_number, processed);

---

-- Add columns to empires table
ALTER TABLE empires ADD COLUMN agents INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN government_sector_count INTEGER DEFAULT 0;

-- Add column to sectors table
ALTER TABLE sectors ADD COLUMN sabotaged_until_turn INTEGER; -- NULL if not sabotaged
```

### 7.2 Service Architecture

```typescript
// src/lib/covert/covert-operations-service.ts

export interface CovertOperationConfig {
  type: CovertOperationType;
  baseCost: number;
  baseDetectionRisk: number;
  unlockTurn: number;
}

export enum CovertOperationType {
  RECONNAISSANCE = 'reconnaissance',
  STEAL_CREDITS = 'steal_credits',
  STEAL_RESEARCH = 'steal_research',
  SABOTAGE_PRODUCTION = 'sabotage_production',
  INCITE_REBELLION = 'incite_rebellion',
  ASSASSINATE_LEADER = 'assassinate_leader',
  STEAL_MILITARY_PLANS = 'steal_military_plans',
  SABOTAGE_INFRASTRUCTURE = 'sabotage_infrastructure',
  FRAME_EMPIRE = 'frame_empire',
  RECRUIT_DEFECTORS = 'recruit_defectors'
}

export interface CovertOperationResult {
  success: boolean;
  detected: boolean;
  detectedAnonymous: boolean;
  effectData: Record<string, any>;
  reputationChanges: Array<{ empireId: string; change: number }>;
}

export class CovertOperationsService {
  /**
   * Queue a covert operation for Phase 5 processing
   * @spec REQ-COV-006
   */
  async queueOperation(
    gameId: string,
    perpetratorId: string,
    targetId: string,
    operationType: CovertOperationType,
    agents: number
  ): Promise<void> {
    // Validate agent availability
    // Validate operation unlock (turn requirement)
    // Validate target accessibility (same sector, border, wormhole)
    // Insert into covert_operation_queue
  }

  /**
   * Calculate success rate for a covert operation
   * @spec REQ-COV-003
   */
  calculateSuccessRate(
    perpetratorAgents: number,
    targetAgents: number,
    intelLevel: number,
    targetSecurityTier: number,
    isSchemer: boolean,
    distance: 'same' | 'adjacent' | 'wormhole'
  ): number {
    let rate = 60; // Base

    rate += Math.min(20, (perpetratorAgents / 100) * 2);
    rate -= Math.min(15, (targetAgents / 100) * 1.5);
    rate += intelLevel * 5;
    rate -= targetSecurityTier * 10;
    if (isSchemer) rate += 10;
    if (distance === 'adjacent') rate -= 5;
    if (distance === 'wormhole') rate -= 10;

    return Math.max(15, Math.min(85, rate));
  }

  /**
   * Calculate detection chance for a covert operation
   * @spec REQ-COV-004
   */
  calculateDetectionChance(
    baseRisk: number,
    intelLevel: number,
    targetAgents: number,
    targetSecurityTier: number,
    isSchemer: boolean
  ): number {
    let chance = baseRisk;

    chance -= intelLevel * 5;
    chance += (targetAgents / 100) * 2;
    chance += targetSecurityTier * 10;
    if (isSchemer) chance -= 10;

    return Math.max(5, Math.min(75, chance));
  }

  /**
   * Execute a covert operation (Phase 5)
   * @spec REQ-COV-006
   */
  async executeOperation(
    operationQueueId: string
  ): Promise<CovertOperationResult> {
    // Load operation from queue
    // Roll success
    // Apply effect if successful
    // Roll detection
    // Apply diplomatic consequences if detected
    // Log to covert_operations table
    // Update agent pools
    // Return result
  }

  /**
   * Process all queued operations for Phase 5
   * @spec REQ-COV-006
   */
  async processPhase5(gameId: string, turnNumber: number): Promise<void> {
    // Load all queued operations for this turn
    // Sort by empire networth (strongest first)
    // Execute each operation sequentially
    // Mark operations as processed
  }

  /**
   * Update intel level after reconnaissance
   * @spec REQ-COV-002
   */
  async updateIntelLevel(
    gameId: string,
    observerId: string,
    targetId: string
  ): Promise<number> {
    // Increment total_recons
    // Calculate new intel_level (0-3)
    // Update last_recon_turn
    // Return new intel level
  }

  /**
   * Decay intel levels (every 20 turns)
   * @spec REQ-COV-011
   */
  async decayIntel(gameId: string, currentTurn: number): Promise<void> {
    // Find all intel records where (currentTurn - last_recon_turn) >= 20
    // Decrement intel_level by 1 (min 0)
    // Update last_recon_turn
  }
}
```

### 7.3 Server Actions

```typescript
// src/app/actions/covert-actions.ts

"use server";

import { CovertOperationsService, CovertOperationType } from '@/lib/covert/covert-operations-service';
import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Queue a covert operation
 * @spec REQ-COV-006
 */
export async function queueCovertOperation(
  gameId: string,
  perpetratorId: string,
  targetId: string,
  operationType: CovertOperationType
): Promise<ActionResult> {
  try {
    const service = new CovertOperationsService();

    // Validate inputs
    // Check agent availability
    // Check operation unlock status
    // Queue operation

    await service.queueOperation(gameId, perpetratorId, targetId, operationType, agentCost);

    revalidatePath(`/game/${gameId}`);

    return {
      success: true,
      message: `Covert operation queued: ${operationType}`
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get available operations for empire
 * @spec REQ-COV-001
 */
export async function getAvailableOperations(
  gameId: string,
  empireId: string
): Promise<ActionResult> {
  // Load empire data (turn number, research, archetype)
  // Filter operations by unlock requirements
  // Return available operations with costs and risks
}

/**
 * Get intel level for target empire
 * @spec REQ-COV-002
 */
export async function getIntelLevel(
  gameId: string,
  observerId: string,
  targetId: string
): Promise<ActionResult> {
  // Load intel record
  // Return intel level and visible information
}

/**
 * Investigate detected operation (identify perpetrator)
 */
export async function investigateOperation(
  gameId: string,
  empireId: string,
  operationId: string
): Promise<ActionResult> {
  // Spend 100 agents
  // Roll to identify perpetrator
  // Update operation record if successful
  // Return result
}

/**
 * Demand reparations from detected perpetrator
 */
export async function demandReparations(
  gameId: string,
  victimId: string,
  perpetratorId: string,
  operationId: string
): Promise<ActionResult> {
  // Create diplomatic demand
  // Target must pay 2x operation cost or face war
  // Update reputation
  // Return result
}
```

### 7.4 UI Components

```typescript
// src/components/covert/CovertOperationsPanel.tsx

interface CovertOperationsPanelProps {
  gameId: string;
  empireId: string;
  agents: number;
  availableOperations: CovertOperationConfig[];
}

export function CovertOperationsPanel({ gameId, empireId, agents, availableOperations }: CovertOperationsPanelProps) {
  // Render main covert ops panel
  // Tabs: Intel, Operations, Reports, Counter-Intel
  // Target selection sidebar
  // Operation grid
  // Details panel with success/detection calculations
}

// src/components/covert/OperationCard.tsx

interface OperationCardProps {
  operation: CovertOperationConfig;
  agents: number;
  isLocked: boolean;
  onSelect: (op: CovertOperationType) => void;
}

export function OperationCard({ operation, agents, isLocked, onSelect }: OperationCardProps) {
  // Render individual operation card
  // Show name, cost, icon
  // Locked state if not unlocked
  // Insufficient agents warning
  // Hover effects
}

// src/components/covert/IntelCard.tsx

interface IntelCardProps {
  target: Empire;
  intelLevel: number;
}

export function IntelCard({ target, intelLevel }: IntelCardProps) {
  // Render target empire intel card
  // Show information based on intel level (0-3)
  // Level 0: Basic info
  // Level 1: + Military, resources
  // Level 2: + Sectors, builds, treaties
  // Level 3: + Planned attacks, covert ops, research
}

// src/components/covert/OperationResultModal.tsx

interface OperationResultModalProps {
  result: CovertOperationResult;
  onClose: () => void;
}

export function OperationResultModal({ result, onClose }: OperationResultModalProps) {
  // Render operation result notification
  // Success/failure status
  // Detection status
  // Effect details (credits stolen, etc.)
  // Reputation changes
}

// src/components/covert/DetectionAlertModal.tsx

interface DetectionAlertModalProps {
  operation: CovertOperation;
  onInvestigate: () => void;
  onRetaliate: () => void;
  onDemandReparations: () => void;
  onIgnore: () => void;
}

export function DetectionAlertModal({ operation, ...handlers }: DetectionAlertModalProps) {
  // Render detection alert for target
  // Show operation type and impact
  // Response options:
  // - Investigate (if perpetrator unknown)
  // - Demand Reparations (if perpetrator known)
  // - Retaliate
  // - Increase Security
  // - Ignore
}
```

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| **Reconnaissance Cost/Benefit** | Intel worth 2x agent cost | ±20% | Compare intel value (prevented losses) vs agent cost |
| **Steal Credits ROI** | 3-5x agent cost | ±30% | Average credits stolen vs 200 agent cost equivalent |
| **Assassination Impact** | Delay victory by 3-5 turns | ±2 turns | Track victory progress before/after assassination |
| **Frame Empire Success** | Trigger war 40% of time | ±15% | Count wars started by framing vs total frames |
| **Schemer Win Rate** | 8-12% (same as other archetypes) | ±3% | Schemer wins / total games with Schemers |
| **Detection Feel** | "Risky but not punishing" | Qualitative | Playtest feedback: players willing to risk detection |
| **Agent Production Balance** | 2-3 Government sectors viable | ±1 | Successful builds use 2-3 Gov sectors on average |
| **Operation Frequency** | 1-2 ops per empire per 10 turns | ±0.5 | Track total ops / (empires * turns / 10) |
| **Counter-Espionage Value** | Prevent 50% of attacks | ±15% | Track operations blocked by high agent defense |

### 8.2 Simulation Requirements

```
Monte Carlo: 10,000 iterations
Variables:
- Empire agents: 0-2000 (varied)
- Target agents: 0-2000 (varied)
- Intel level: 0-3
- Security tier: 0-2
- Operation type: All 10 types
- Distance: Same, adjacent, wormhole

Success Criteria:
- Success rate distribution matches formula (15-85% bounds)
- Detection rate distribution matches formula (5-75% bounds)
- No operation has >90% or <10% success in normal conditions
- Schemer archetype has 1.5-2x operation frequency vs other archetypes
- Economic operations (Steal Credits, Sabotage) have positive ROI 70% of time
```

### 8.3 Playtest Checklist

**Scenario 1: Weak Empire vs Strong Leader**
- [ ] Weak empire (Rank 50+) can disrupt leader (Rank 1) with covert ops
- [ ] Expected outcome: Leader's victory delayed by 5-10 turns
- [ ] Player experience: "I felt like I could fight back"

**Scenario 2: Schemer Archetype Playstyle**
- [ ] Schemer bot builds 3-5 Government sectors by Turn 30
- [ ] Schemer launches 1-2 operations every 3-5 turns
- [ ] Schemer is detected 30-40% of operations
- [ ] Expected outcome: Schemer is disruptive but not overpowered
- [ ] Player experience: "Schemer is annoying but can be countered"

**Scenario 3: Espionage Race**
- [ ] Two empires with high agent production compete
- [ ] Operations and counter-operations escalate
- [ ] Expected outcome: Creates narrative rivalry, neither crippled
- [ ] Player experience: "Cat-and-mouse spy game felt engaging"

**Scenario 4: Detection and Retaliation**
- [ ] Player is detected in high-risk operation (Assassinate)
- [ ] Target demands reparations or retaliates
- [ ] Expected outcome: Player feels consequence but not game-ending
- [ ] Player experience: "Got caught, paid the price, lesson learned"

**Scenario 5: Intel Progression**
- [ ] Player performs Reconnaissance 6 times on same target
- [ ] Intel level increases to 3, revealing planned attacks
- [ ] Player uses intel to form counter-strategy
- [ ] Expected outcome: Intel investment pays off
- [ ] Player experience: "Knowing enemy plans was worth the agent cost"

**Scenario 6: Frame Empire Chaos**
- [ ] Player frames Empire A for attacking Empire B
- [ ] Empire B declares war on Empire A
- [ ] Expected outcome: War benefits player (weaker rivals)
- [ ] Player experience: "Manipulating rivals felt clever and satisfying"

**Scenario 7: Resource Starvation**
- [ ] Player has low agents (<200), faces strong threat
- [ ] Must choose: build military or launch covert op?
- [ ] Expected outcome: Meaningful strategic choice
- [ ] Player experience: "Resource tension created interesting decisions"

**Scenario 8: Late-Game Recruit Defectors**
- [ ] Turn 60+, player unlocks Recruit Defectors
- [ ] Successfully steals 8% of target's population/soldiers
- [ ] Expected outcome: Significant but not game-winning advantage
- [ ] Player experience: "Capstone operation felt impactful"

**Scenario 9: Coalition Target Detection**
- [ ] Player launches covert op against coalition member
- [ ] Detected and expelled from coalition
- [ ] Expected outcome: Severe consequence for betrayal
- [ ] Player experience: "Coalition trust matters, betrayal has cost"

**Scenario 10: Counter-Espionage Investment**
- [ ] Player invests 5 Government sectors (1500 agents)
- [ ] Enemy operations against player have 40-50% success rate
- [ ] Expected outcome: Passive defense is effective
- [ ] Player experience: "Building defense felt worthwhile"

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| No covert system | Full covert ops with 10 types | 1. Implement database schema<br>2. Create service layer<br>3. Integrate with turn processor Phase 5<br>4. Build UI components |
| Government sectors exist but unused | Produce 300 agents/turn | 1. Add agent production to resource generation<br>2. Update sector tooltips<br>3. Add agent counter to UI |
| Schemer archetype placeholder | Shadow Network passive implemented | 1. Add passive to archetype config<br>2. Implement 50% cost reduction<br>3. Update bot decision trees |
| No intel system | 4-level intel with decay | 1. Create empire_intel table<br>2. Implement reconnaissance<br>3. Add decay logic to turn processor |
| Turn processor 6 phases (covert placeholder) | Phase 5 covert ops functional | 1. Implement phase-5-covert.ts<br>2. Add operation queue processing<br>3. Integrate with combat phase |

### 9.2 Data Migration

```sql
-- Migration: Add covert operations support
-- Safe to run: YES (adds new tables, non-destructive)

-- Create new tables (see Section 7.1)
CREATE TABLE covert_operations (...);
CREATE TABLE empire_intel (...);
CREATE TABLE covert_operation_queue (...);

-- Add columns to existing tables
ALTER TABLE empires ADD COLUMN IF NOT EXISTS agents INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS government_sector_count INTEGER DEFAULT 0;
ALTER TABLE sectors ADD COLUMN IF NOT EXISTS sabotaged_until_turn INTEGER;

-- Initialize government_sector_count for existing empires
UPDATE empires e
SET government_sector_count = (
  SELECT COUNT(*) FROM sectors s
  WHERE s.empire_id = e.id AND s.sector_type = 'government'
);

-- No data loss risk: All new columns have safe defaults
```

### 9.3 Rollback Plan

**If covert operations are broken or imbalanced:**

1. **Disable Phase 5 Processing** (emergency)
   ```typescript
   // In turn-processor/index.ts
   // Comment out Phase 5 call
   // await processPhase5Covert(gameId, turnNumber);
   ```

2. **Disable UI Access** (prevents queuing)
   ```typescript
   // In CovertOperationsPanel.tsx
   // Add feature flag check
   if (!featureFlags.covertOps) return null;
   ```

3. **Preserve Data** (don't delete tables)
   - Keep covert_operations table for historical data
   - Keep empire_intel table for investigation
   - Allows re-enabling after fix

4. **Refund Agents** (if needed)
   ```sql
   -- Refund agents from unprocessed operations
   UPDATE empires e
   SET agents = agents + (
     SELECT COALESCE(SUM(agents_allocated), 0)
     FROM covert_operation_queue q
     WHERE q.perpetrator_empire_id = e.id AND q.processed = FALSE
   );

   -- Delete unprocessed queue
   DELETE FROM covert_operation_queue WHERE processed = FALSE;
   ```

5. **Revert Government Sector Opportunity Cost**
   - If Government sectors prove too weak/strong, adjust production
   - Change from 300 agents/turn to 400 or 200 as needed

---

## 10. Conclusion

### Key Decisions

**Decision 1: Sequential Phase 5 Processing (Reverse Turn Order)**
**Rationale:** Creates strategic tension between covert phase (strong first) and combat phase (weak first). Prevents weak empires from always getting espionage advantage. Mirrors real-world power dynamics: strong empires have better espionage capabilities.

**Decision 2: Separate Success and Detection Rolls**
**Rationale:** Four outcome scenarios (success/fail × detected/undetected) add depth and risk management. Allows "successful but detected" (gain benefit but face consequences) and "failed but undetected" (learn nothing but avoid blame). More interesting than binary success/fail.

**Decision 3: Intel Decay Every 20 Turns**
**Rationale:** Prevents one-time reconnaissance from providing permanent information. Creates ongoing agent investment decision. 20 turns is long enough to be useful but short enough to require maintenance. Simulates intelligence staleness in real conflicts.

**Decision 4: Schemer Archetype as Covert Specialist**
**Rationale:** Provides clear identity for Schemer (vs generic "sneaky" personality). Shadow Network passive (50% cost) makes frequent operations viable without imbalancing for other archetypes. Schemer becomes "kingmaker" who disrupts leaders, fitting narrative role.

**Decision 5: Operation Unlock Progression (Turn 1, 15, 30, 60)**
**Rationale:** Progressive complexity aligns with game onboarding philosophy ("Every game is someone's first game"). Early ops (Recon, Steal) are low-risk introduction. Mid-game ops (Sabotage, Incite) add strategic depth. Late-game ops (Assassinate, Recruit) are high-impact capstones.

**Decision 6: Agent Economy via Government Sectors**
**Rationale:** Creates meaningful opportunity cost: Government sectors provide no direct military/economic benefit. Players/bots must intentionally invest in espionage infrastructure. Balances against "espionage spam" by requiring sector allocation (finite resource).

**Decision 7: 15-85% Success Rate Bounds**
**Rationale:** Prevents guaranteed success (no risk) or guaranteed failure (no hope). Always leaves room for surprise outcomes. 15% floor allows desperate plays; 85% ceiling prevents zero-risk operations. Creates memorable "against all odds" and "how did that fail?" moments.

**Decision 8: Diplomatic Consequences for Detection**
**Rationale:** Makes detection meaningful beyond operation failure. Creates narrative moments: "You betrayed me!" Reputation system integration ensures long-term consequences. Option for victim to retaliate creates escalation spirals (emergent spy wars).

### Open Questions

**Question 1: Should multi-operation-per-turn be in v1.0 or expansion?**
**Context:** Currently, empires can queue 1 operation per turn. Research could unlock 2-3 operations per turn. Options:
- v1.0: Keep 1 per turn limit for simplicity
- v1.0: Unlock via research (adds depth, may complicate balance)
- Expansion: Defer to v2.0 when covert meta is established

**Question 2: Active counter-espionage operations?**
**Context:** Currently, agent count provides passive defense. Could add "Counter-Intelligence" operation that actively hunts enemy spies. Options:
- v1.0: Passive defense only (simpler)
- v1.0: Add counter-op (more strategic depth, more UI complexity)
- Expansion: Add as advanced mechanic

**Question 3: Should Intel Level be per-empire or per-category?**
**Context:** Current design: Single intel level (0-3) reveals progressively more info. Alternative: Separate intel for Military, Economy, Diplomacy, Research. Options:
- Keep unified (simpler, current design)
- Split categories (more granular, more micromanagement)

**Question 4: Should detected operations reveal perpetrator identity immediately?**
**Context:** Current design has three states: undetected, detected anonymous, detected with blame. Anonymous detection requires "Investigate" operation. Options:
- Always reveal perpetrator (simpler)
- Use anonymous detection (current design, more depth)

### Dependencies

**Depends On:**
- **Turn Processor System** - Phase 5 must execute between Diplomacy and Combat
- **Resource System** - Agent production from Government sectors
- **Empire System** - Agent pool tracking, reputation
- **Bot Archetype System** - Schemer passive, decision trees
- **Diplomacy System** - Reputation changes, treaty breaking, incident resolution
- **Research System** (optional) - Security tiers, multi-op unlock

**Depended By:**
- **Bot AI Decision Trees** - Covert operations as strategic option
- **Victory Condition System** - Operations can delay/accelerate victory paths
- **Coalition System** - Detection can trigger expulsion or formation
- **Narrative Event System** - Covert ops create dramatic moments and messages

---

**Version History:**
- v1.0 (2026-01-12): Initial design document created from minimal draft

**Next Steps:**
1. Implement database schema (covert_operations, empire_intel, queue tables)
2. Create CovertOperationsService with success/detection calculators
3. Write tests for REQ-COV-001 through REQ-COV-012
4. Integrate Phase 5 processing into turn processor
5. Build UI components (CovertOperationsPanel, OperationCard, etc.)
6. Implement Schemer bot decision logic
7. Balance test with Monte Carlo simulations
8. Playtest all 10 scenarios from Section 8.3
9. Update PRD-EXECUTIVE.md with Covert Operations system reference
10. Create COVERT-OPS-APPENDIX.md if code examples exceed 20 lines

---
