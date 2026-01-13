# Galactic Syndicate System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-SYND
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/SYNDICATE-SYSTEM.md, SYNDICATE-Notes-01.md, SYNDICATE-Notes-Simple.md

---

## Document Purpose

This document defines the **Galactic Syndicate system** for Nexus Dominion. The Syndicate is a hidden criminal organization that operates outside Coordinator jurisdiction, creating asymmetric gameplay through hidden roles, secret contracts, and forbidden technologies.

The Syndicate transforms Nexus Dominion from a pure 4X strategy game into a **hidden role game with 4X elements**. Players receive secret loyalty assignments (Loyalist or Syndicate) that fundamentally change their objectives and create asymmetric gameplay with betrayal mechanics inspired by games like Betrayal at House on the Hill and Among Us.

This document should be read by:
- Game designers implementing victory conditions and asymmetric gameplay
- Backend developers building the contract, accusation, and trust systems
- Frontend developers creating hidden UI panels and dramatic reveals
- Bot AI developers integrating Syndicate behavior into archetypes

**Design Philosophy:**
- **Hidden allegiance** - Some empires secretly serve the Syndicate, creating paranoia and suspicion
- **Asymmetric victory** - Syndicate can win without territory control through contract completion
- **Betrayal mechanics** - "Who among us is the traitor?" drives social deduction gameplay
- **Comeback potential** - Struggling players gain alternative paths to power via Syndicate recruitment
- **Bot integration** - Schemer archetype naturally suspicious, creating false positives and dramatic irony
- **Dramatic tension** - Revelation moments, accusations, and trials create memorable narrative beats

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

### 1.1 The Shadow War

The Syndicate isn't a faction you openly join — it's a **hidden role** that fundamentally changes your win conditions.

**At game start:**
- Each empire (player + bots) receives a secret Loyalty Card
- **90% are Loyalist** - Win through standard victory conditions (conquest, economic, research, military, coalition)
- **10% are Syndicate** - Hidden objective: Complete 3 contracts before Turn 200
- **No one knows** who serves the Syndicate (including you, about others)

The loyalty assignment is completely hidden. Your card is revealed only to you. This creates a fundamental information asymmetry that drives the entire system.

### 1.2 Dual Experience

**If you draw Syndicate:** <!-- @spec REQ-SYND-001 -->
- Play normally (build, attack, expand) to avoid suspicion
- Access **hidden Syndicate Contract panel** in UI (invisible to others)
- Complete contracts to earn Syndicate Victory Points (3 required for victory)
- Use **Black Market** for WMDs and restricted tech unavailable to Loyalists
- Can reveal yourself voluntarily for bonuses (risky but strategic)
- Balance appearing "normal" with completing contracts

**If you draw Loyalist:** <!-- @spec REQ-SYND-001 -->
- Play normally, pursue standard victory conditions
- See **Suspicious Activity Feed** showing unexplained events across the galaxy
- Can **accuse** other empires of being Syndicate (costs Intel Points)
- Report suspicious behavior to **The Coordinator** (NPC faction)
- Form "Stop the Syndicate" coalitions with other empires
- Earn Intel Points each turn for investigations and accusations

### 1.3 The Revelation Moment

**Turn 50 or when first contract completed:** <!-- @spec REQ-SYND-002 -->

All players see this galaxy-wide announcement:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│             ⚠️ THE SHADOW EMERGES ⚠️                     │
│                                                         │
│  A Syndicate operative has completed their first        │
│  contract. The criminal underworld stirs.               │
│                                                         │
│  Someone in this galaxy serves the Syndicate.           │
│  Perhaps multiple someones.                             │
│                                                         │
│  Watch for:                                             │
│  • Unexplained production drops                         │
│  • Market price anomalies                               │
│  • Convenient "accidents"                               │
│  • Black Market purchases                               │
│                                                         │
│  Trust no one.                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**This changes everything:**
- Accusation system becomes available to all players
- Diplomacy becomes suspicious ("Is this alliance a trap?")
- Coalition formation becomes paranoid ("Can I trust my allies?")
- Bot messages shift to include suspicion and accusations
- Suspicious Activity Feed activates for all Loyalists

---

## 2. Mechanics Overview

### 2.1 Loyalty Assignment System

**Distribution Formula (N-empire game):** <!-- @spec REQ-SYND-001 -->
- Loyalist empires: 90% of total
- Syndicate empires: 10% of total
- Minimum 1 Syndicate if game has 10+ empires

**Archetype Weighting:**

| Archetype | Syndicate Chance | Rationale |
|-----------|------------------|-----------|
| Schemer | 50% | Naturally suspicious, creates dramatic irony |
| Opportunist | 20% | Adaptable, willing to take shortcuts |
| Warlord | 10% | Baseline |
| Diplomat | 5% | Rarely (creates maximum betrayal impact) |
| Turtle | 5% | Rarely (creates paranoid defender) |
| Blitzkrieg | 10% | Baseline |
| Tech Rush | 10% | Baseline |
| Merchant | 10% | Baseline |

**Player Assignment:**
- First playthrough: Always Loyalist (learn base game mechanics first)
- Subsequent games: Subject to random assignment based on archetype weighting
- Can opt-in to "Syndicate Mode" for guaranteed Syndicate assignment (veteran feature)

### 2.2 Core Gameplay Loop

**Syndicate Player Loop:**
1. Receive 3 active contracts (tier-gated by Trust level)
2. Choose contract based on risk/reward and current suspicion
3. Complete contract objective (sabotage, manipulation, assassination, etc.)
4. Earn Syndicate VP, credits, and Trust points
5. Manage Suspicion Score through "clean" turns and alliances
6. Reach 3 Syndicate VP before Turn 200 → Victory
7. OR stay hidden until chaos victory at Turn 200

**Loyalist Player Loop:**
1. Earn 5 Intel Points per turn (max 50 stored)
2. Monitor Suspicious Activity Feed for unexplained events
3. Investigate suspicious empires (costs 10 Intel Points)
4. Build evidence and form suspicions
5. Accuse suspected Syndicate (costs 25 Intel Points)
6. Coordinate with coalitions to vote in accusation trials
7. Eliminate Syndicate threats while pursuing standard victory

### 2.3 The Trust & Suspicion Economy

**Trust Progression (Syndicate only):** <!-- @spec REQ-SYND-004 -->

| Level | Points Required | Title | Black Market Access |
|-------|-----------------|-------|---------------------|
| 0 | 0 | Unknown | Must complete intro contract |
| 1 | 100 | Associate | Basic intel, components at 2× price |
| 2 | 500 | Runner | Tier 1 contracts, 1.75× prices |
| 3 | 1,500 | Soldier | Tier 2 contracts, 1.5× prices |
| 4 | 3,500 | Captain | Targeted contracts |
| 5 | 7,000 | Lieutenant | Advanced systems at 1.5× |
| 6 | 12,000 | Underboss | Chemical weapons, EMP devices |
| 7 | 20,000 | Consigliere | Nuclear warheads |
| 8 | 35,000 | Syndicate Lord | Bioweapons, exclusive contracts |

**Suspicion Tracking (All players):** <!-- @spec REQ-SYND-006 -->

| Suspicion Range | Effects |
|-----------------|---------|
| 0-25 (Low) | No special effects, appear normal |
| 26-50 (Moderate) | Occasional bot suspicions |
| 51-75 (High) | Increased bot accusations, coalition distrust |
| 76-100 (Extreme) | Automatic Coordinator monitoring, high accusation success rate |

For complete Trust and Suspicion formulas, see [Appendix: Trust & Suspicion Systems](appendix/SYNDICATE-SYSTEM-APPENDIX.md#trust-and-suspicion).

---

## 3. Detailed Rules

### 3.1 Syndicate Contract System

Syndicate players see **3 active contracts** at any time. Completing one reveals a new option. <!-- @spec REQ-SYND-003 -->

**Contract Structure:**
- **Objective** - Clear goal to complete
- **Syndicate VP Reward** - Progress toward 3 VP victory
- **Credit Reward** - Immediate economic benefit
- **Trust Reward** - Progress toward higher Trust levels
- **Suspicion Generated** - Risk of detection
- **Tier Requirement** - Trust level needed to unlock

#### Tier 1: Covert Operations (Trust 0-2)

| Contract | Objective | VP | Suspicion | Reward |
|----------|-----------|----|-----------|----- --|
| Sabotage Production | Reduce target's output by 20% for 3 turns | 1 | Low (15) | 15,000 cr, +15 trust |
| Insurgent Aid | Support rebels (civil status -1) | 1 | Low (10) | 10,000 cr, +10 trust |
| Market Manipulation | Crash resource price by 30% | 1 | Medium (35) | 20,000 cr, +20 trust |
| Pirate Raid | Use NPC pirates as cover for attack | 1 | Very Low (5) | 8,000 cr, +10 trust |

#### Tier 2: Strategic Disruption (Trust 3-5)

| Contract | Objective | VP | Suspicion | Reward |
|----------|-----------|----|-----------|----- --|
| Intelligence Leak | Reveal target's tech to all empires | 1 | Medium (40) | 25,000 cr, +30 trust |
| Arms Embargo | Prevent target from building units (2 turns) | 2 | High (65) | 35,000 cr, +40 trust |
| False Flag Operation | Make Empire A attack Empire B | 2 | Low (20) | 50,000 cr, +45 trust |
| Economic Warfare | Destroy 25% of target's stockpiles | 1 | High (70) | 30,000 cr, +35 trust |

#### Tier 3: High-Risk Operations (Trust 6-7)

| Contract | Objective | VP | Suspicion | Reward |
|----------|-----------|----|-----------|----- --|
| Coup d'État | Cause civil revolt (status = Rioting) | 2 | Very High (80) | 75,000 cr, +60 trust |
| Assassination | Kill target's general (if exists) | 2 | Very High (85) | 60,000 cr, +55 trust |
| Kingslayer | Eliminate #1 ranked empire | 3 | Extreme (95) | 150,000 cr, +100 trust |
| Scorched Earth | Deploy WMD (50% population loss) | 3 | Extreme (100) | WMD unlock, +80 trust |

#### Tier 4: Endgame Contracts (Trust 8)

| Contract | Objective | VP | Suspicion | Reward |
|----------|-----------|----|-----------|----- --|
| Proxy War | Force two top empires into war | 2 | Medium (45) | 100,000 cr, +70 trust |
| The Equalizer | Sabotage all Top 10% empires simultaneously | 3 | Very High (90) | Special tech, +100 trust |
| Shadow Victory | Complete 3 contracts while undetected | 5 | None (if successful) | Instant win |

For detailed contract mechanics and implementation, see [Appendix: Contract Catalog](appendix/SYNDICATE-SYSTEM-APPENDIX.md#contract-catalog).

### 3.2 Black Market System

**Only Syndicate players can access the Black Market.** <!-- @spec REQ-SYND-005 -->

Loyalists who attempt to access see:
```
[ENCRYPTED CHANNEL]
Access denied. The Syndicate does not know you.

Perhaps you're not who we thought you were.
Or perhaps you're not ready to walk this path.
```

#### Price Multipliers by Trust Level

| Trust Level | Multiplier | Economic Impact |
|-------------|------------|-----------------|
| 1-2 | 2.0× | Early contracts are resource-intensive |
| 3-4 | 1.75× | Moderate premium |
| 5-6 | 1.5× | Competitive with standard production |
| 7-8 | 1.25× | Near-parity, access is the benefit |

#### Restricted Weapons (WMDs)

**Single-use weapons unavailable to Loyalists:**

| Item | Price | Trust | Effect | Suspicion |
|------|-------|-------|--------|-----------|
| EMP Device | 50,000 cr | 6 | Disable defenses for 3 turns | High (60) |
| Chemical Weapon | 75,000 cr | 6 | Kill 25% of population | Very High (80) |
| Nuclear Warhead | 100,000 cr | 7 | Destroy 50% of production | Extreme (95) |
| Bioweapon Canister | 150,000 cr | 8 | Kill 75% of population | Extreme (100) |

#### Intelligence Services

| Service | Price | Trust | Effect |
|---------|-------|-------|--------|
| Spy Report | 5,000 cr | 2 | Reveal resources/military |
| Research Espionage | 5,000 cr | 2 | Reveal specialization (85% success) |
| Tech Espionage | 15,000 cr | 3 | Reveal research progress % |
| Diplomatic Intel | 10,000 cr | 3 | Reveal treaties/alliances |
| Future Intel | 25,000 cr | 5 | See planned actions next turn |

For complete Black Market catalog, see [Appendix: Black Market](appendix/SYNDICATE-SYSTEM-APPENDIX.md#black-market).

### 3.3 Accusation System

**Available after Turn 50 or "Shadow Emerges" event.** <!-- @spec REQ-SYND-007 -->

**Process:**
1. **Accuser spends 25 Intel Points** to accuse specific empire
2. **Public announcement** to all empires: "X accuses Y of Syndicate allegiance"
3. **Accused can defend** (spend 10,000 credits for defense statement)
4. **Voting period** - All other empires vote Guilty/Innocent (3 turns)
5. **Resolution** - Majority vote determines outcome

**Resolution Outcomes:**

**If majority votes GUILTY + Target is SYNDICATE:**
- ✅ Accuser gains +5,000 credits, +10 Coordinator standing
- ❌ Target is "outed" (loses hidden status)
- 🔺 Target loses 25% trust with Syndicate
- 📢 Galaxy-wide announcement: "X was indeed Syndicate!"
- ⚡ Target gains "Desperate" status: +20% combat power, -20% income, alliances dissolved

**If majority votes GUILTY + Target is LOYALIST (False Accusation):**
- ❌ Accuser loses -10,000 credits, -20 Coordinator standing
- ✅ Target gains +15,000 credits (sympathy bonus)
- 🤝 Target gains +2 to all diplomatic relations
- 📢 Galaxy-wide announcement: "False accusation damages X's credibility"

**If majority votes INNOCENT:**
- ➡️ No penalties to accuser or accused
- 📊 Suspicion score remains unchanged
- 💭 Lingering doubt persists ("Was the vote wrong?")

### 3.4 The Coordinator Response

**The Coordinator is an NPC faction** that opposes the Syndicate. <!-- @spec REQ-SYND-008 -->

**Loyalist Reporting (15 Intel Points + 5,000 credits):**

If target is SYNDICATE:
- ✅ Receive target's next contract (preview)
- ✅ Gain +10% permanent funding bonus
- ✅ Coordinator standing +50

If target is LOYALIST:
- ❌ Report leaked to target (diplomatic damage)
- ❌ Lose 10,000 credits
- ❌ Coordinator standing -25

**Syndicate Betrayal (Permanent):**

A Syndicate player can betray the Syndicate to the Coordinator:
- **Benefits:** +25,000 credits, +25% permanent funding bonus
- **Consequences:**
  - Trust permanently reset to 0 (burn the bridge)
  - Black Market access revoked permanently
  - All active contracts cancelled
  - Syndicate becomes hostile: 5% assassination chance per turn
  - Cannot re-engage with Syndicate (ever)
  - Loyalty card changes to "Defector"
  - New victory condition: "Survive until Turn 200 with Coordinator support"

### 3.5 Victory Conditions

**Syndicate Victory:** <!-- @spec REQ-SYND-009 -->

**Condition 1: Contract Mastery**
- Complete 3 Syndicate contracts before Turn 200
- Any combination of tiers allowed
- Hidden or outed status doesn't matter
- **Victory Type:** "Shadow Victory" if hidden, "Defiant Victory" if outed

**Condition 2: Chaos Victory**
- If no standard victory achieved by Turn 200
- AND Syndicate player has 2+ contracts completed
- "The galaxy descends into chaos. The Syndicate wins."

**Condition 3: The Perfect Game**
- Complete 3 contracts while remaining undetected
- Never accused, never outed
- Bonus: "Shadow Master" achievement
- Highest Syndicate victory score

**Loyalist Victory:**
- Win through standard victory conditions (see [VICTORY-SYSTEMS.md](VICTORY-SYSTEMS.md))
- Bonus if all Syndicate players eliminated or outed: +10,000 credits, "Guardian of the Galaxy" achievement

---

## 4. Bot Integration

### 4.1 Archetype Behavior

**How each archetype uses the Syndicate system:** <!-- @spec REQ-SYND-010 -->

| Archetype | Syndicate Behavior (if assigned) | Loyalist Behavior | Priority |
|-----------|----------------------------------|-------------------|----------|
| **Warlord** | Aggressive contracts, uses WMDs liberally | High accusation rate, military focus | High |
| **Diplomat** | False flag operations, manipulates alliances | Extremely paranoid, frequent accusations | Medium |
| **Merchant** | Economic warfare, market manipulation | Monitors trade anomalies closely | Medium |
| **Schemer** | Mixed strategies, stays hidden longest | Ironically often accused despite loyalty | High |
| **Turtle** | Defensive contracts, sabotage attackers | Never accuses (too paranoid to act) | Low |
| **Blitzkrieg** | High-risk contracts early, "go loud" strategy | Aggressive accusations when confident | High |
| **Tech Rush** | Intel-focused contracts, research espionage | Monitors tech disparities | Low |
| **Opportunist** | Adapts to game state, completes easiest contracts | Bandwagons on accusations | Variable |

### 4.2 Bot Decision Logic

**Syndicate Bot Contract Selection:**

```
function selectContract(bot, availableContracts, gameState) {
  // Priority 1: Stay hidden if < 2 contracts complete
  if (bot.syndicateVP < 2) {
    return availableContracts.filter(c => c.suspicion < 50)
                             .sort((a, b) => b.vpReward - a.vpReward)[0];
  }

  // Priority 2: Go for victory if close
  if (bot.syndicateVP === 2) {
    return availableContracts.sort((a, b) => b.vpReward - a.vpReward)[0];
  }

  // Priority 3: Target rivals
  const rivals = gameState.empires.filter(e => e.networth > bot.networth);
  return availableContracts.filter(c => rivals.includes(c.target))[0];
}
```

**Loyalist Bot Accusation Logic:**

```
function shouldAccuse(bot, target, suspicionScore) {
  if (bot.archetype === "Turtle") return false; // Never accuse
  if (bot.archetype === "Diplomat") return suspicionScore > 40; // Paranoid
  if (bot.archetype === "Warlord") return suspicionScore > 70; // Confident only

  // Default: accuse if high suspicion
  return suspicionScore > 60;
}
```

For complete bot AI implementation, see [Appendix: Bot AI](appendix/SYNDICATE-SYSTEM-APPENDIX.md#bot-ai).

### 4.3 Bot Messages

**70+ message templates for Syndicate-related events:**

**Syndicate Bot Messages (when Syndicate):**
```
TURN 20: "I've found... alternative revenue streams."
TURN 40: "The market crash? Unfortunate. For some."
TURN 60: "Power doesn't come from territories alone."
TURN 80 (if outed): "Yes, I serve the Syndicate. What of it?"
```

**Loyalist Bot Suspicions:**
```
[Diplomat] "Your production dropped without explanation.
            Should I be concerned about your... loyalties?"

[Warlord] "If you're Syndicate, there won't be a trial.
           Just fire."

[Turtle]  "I defend against external threats.
           But internal threats are harder to see."
```

**The Schemer Paradox:**

Schemer bots create permanent tension because 50% are Syndicate, 50% are Loyalist.

**Loyalist Schemer Bot:**
```
"Everyone suspects me. I'm used to it.
 But I assure you, I'm on the right side.
 This time."
```

**Syndicate Schemer Bot:**
```
"Let them suspect. Suspicion is cheap.
 Proof is expensive."
```

For complete message catalog, see [Appendix: Bot Messages](appendix/SYNDICATE-SYSTEM-APPENDIX.md#bot-messages).

---

## 5. UI/UX Design

### 5.1 UI Mockups

**Loyalty Card Reveal (Game Start):**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              YOUR LOYALTY HAS BEEN ASSIGNED             │
│                                                         │
│                    [SYNDICATE LOGO]                     │
│                         🔺                              │
│                                                         │
│  You serve the Galactic Syndicate.                      │
│                                                         │
│  Your objective:                                        │
│  Complete 3 contracts before Turn 200                   │
│                                                         │
│  Access the Syndicate panel via the hidden menu.        │
│  Complete contracts. Stay hidden. Trust no one.         │
│                                                         │
│  [ Acknowledge ]                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Syndicate Contract Panel (Hidden - Syndicate only):**

```
┌─────────────────────────────────────────────────────────┐
│  SYNDICATE CONTRACTS               Trust Level: 3/8     │
│  Progress: 1/3 VP                  Suspicion: 42/100    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [ CONTRACT 1 ]                                         │
│  Sabotage Production - Empire Zanthar                   │
│  Reward: 1 VP, 15,000 cr, +15 trust                     │
│  Suspicion: Low (15)                                    │
│  [ Accept Contract ]                                    │
│                                                         │
│  [ CONTRACT 2 ]                                         │
│  Market Manipulation - Ore Prices                       │
│  Reward: 1 VP, 20,000 cr, +20 trust                     │
│  Suspicion: Medium (35)                                 │
│  [ Accept Contract ]                                    │
│                                                         │
│  [ CONTRACT 3 ]                                         │
│  Intelligence Leak - Empire Varos                       │
│  Reward: 1 VP, 25,000 cr, +30 trust                     │
│  Suspicion: Medium (40)                                 │
│  [ Accept Contract ] [REQUIRES TRUST 3]                 │
│                                                         │
│  [ Black Market ]  [ Trust Progress ]                   │
└─────────────────────────────────────────────────────────┘
```

**Suspicious Activity Feed (Loyalist only):**

```
┌─────────────────────────────────────────────────────────┐
│  SUSPICIOUS ACTIVITY FEED          Intel: 35/50         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Turn 45: Empire Zanthar production dropped 20%         │
│  Cause: Unknown                                         │
│  [ Investigate - 10 Intel ]                             │
│                                                         │
│  Turn 42: Ore prices crashed 30% unexpectedly           │
│  Cause: Market forces (?)                               │
│  [ Investigate - 10 Intel ]                             │
│                                                         │
│  Turn 38: Empire Varos research leaked publicly         │
│  Source: Communications breach                          │
│  [ Investigate - 10 Intel ]                             │
│                                                         │
│  [ Coordinator Report - 15 Intel ]                      │
└─────────────────────────────────────────────────────────┘
```

**Accusation Trial Interface:**

```
┌─────────────────────────────────────────────────────────┐
│  SYNDICATE ACCUSATION TRIAL                             │
│  Emperor Darvin accuses Emperor Zanthar                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ACCUSER: Emperor Darvin                                │
│  "Zanthar's production inexplicably dropped. His        │
│   diplomatic silence is suspicious. I believe he        │
│   serves the Syndicate."                                │
│                                                         │
│  ACCUSED: Emperor Zanthar                               │
│  "This is baseless paranoia. My production issues       │
│   stem from resource shortages, not sabotage."          │
│                                                         │
│  EVIDENCE:                                              │
│  • Production drop: 20% (Turn 45)                       │
│  • Suspicion score: 58/100                              │
│  • Recent activity: 2 unexplained events                │
│                                                         │
│  YOUR VOTE:                                             │
│  [ GUILTY ]  [ INNOCENT ]  [ ABSTAIN ]                  │
│                                                         │
│  Voting ends: Turn 53                                   │
│  Current tally: 4 Guilty, 2 Innocent, 1 Abstain         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 User Flows

**Completing a Syndicate Contract:**

1. Player (Syndicate) opens hidden Syndicate panel
2. Reviews 3 available contracts
3. Selects "Sabotage Production - Empire Zanthar"
4. Confirmation dialog: "This will generate 15 suspicion. Proceed?"
5. On confirm: Contract activates
6. Next turn: Target's production drops 20%
7. Suspicious Activity Feed (all Loyalists): "Turn 45: Empire Zanthar production dropped 20%"
8. Player receives rewards: 1 VP, 15,000 cr, +15 trust
9. Player suspicion score increases by 15
10. New contract appears in panel to replace completed one

**Making an Accusation (Loyalist):**

1. Player monitors Suspicious Activity Feed
2. Sees multiple events affecting Empire Zanthar
3. Spends 10 Intel Points to investigate
4. Investigation reveals: "Empire Zanthar likely responsible for production sabotage"
5. Player decides to accuse (costs 25 Intel Points)
6. Accusation interface opens
7. Player enters accusation statement
8. Galaxy-wide announcement: "X accuses Y of Syndicate allegiance"
9. Accused has option to defend (10,000 credits)
10. 3-turn voting period begins
11. All empires vote Guilty/Innocent/Abstain
12. Resolution at Turn 53: Majority votes Guilty
13. If Zanthar is Syndicate: Accuser rewarded, Zanthar outed
14. If Zanthar is Loyalist: Accuser penalized, Zanthar compensated

### 5.3 Visual Design Principles

**Color Coding:**
- **Red** - Syndicate-related elements, high suspicion, accusations
- **Blue** - Loyalist elements, Coordinator communications
- **Yellow** - Warnings, moderate suspicion, investigations
- **Green** - Safe actions, low suspicion, successful defenses
- **Purple** - Black Market items, restricted weapons

**LCARS-Inspired Styling:**
- Syndicate panel: Dark theme with red accents, hidden/encrypted aesthetic
- Accusation trials: Formal blue theme, courtroom aesthetic
- Suspicious Activity Feed: Yellow/amber theme, intelligence report aesthetic
- Black Market: Purple/dark theme, illicit marketplace aesthetic

**Iconography:**
- Syndicate logo: Triangle/pyramid (🔺)
- Coordinator: Shield/badge
- Contracts: Scroll/document
- Suspicion: Eye/magnifying glass
- Trust: Handshake/lock levels

**Responsive Behavior:**
- Hidden panels slide in from off-screen when accessed
- Accusations create galaxy-wide notifications (can't be missed)
- Revelation event triggers full-screen modal (dramatic moment)
- Victory screens show full narrative summary with timeline

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

### REQ-SYND-001: Hidden Role Assignment

**Description:** At game start, each empire (player + bots) receives a secret Loyalty Card:
- **90% are Loyalist** - Win through standard victory conditions (conquest, economic, research, etc.)
- **10% are Syndicate** - Hidden objective: Complete 3 contracts before Turn 200
- **No one knows** who serves the Syndicate (including you, about others)

**Archetype Weighting:**
- Schemer: 50% chance Syndicate (vs 10% baseline)
- Opportunist: 20% chance Syndicate
- Diplomat: 5% chance Syndicate
- Turtle: 5% chance Syndicate
- All others: 10% chance Syndicate

**Player Assignment:**
- First playthrough: Always Loyalist (learn base game)
- Subsequent games: Subject to random assignment
- Can opt-in to "Syndicate Mode" for guaranteed assignment

**Rationale:** Hidden roles create paranoia, suspicion, and dramatic betrayal moments. The "Who is the traitor?" mechanic transforms standard diplomacy into social deduction gameplay. Archetype weighting creates natural suspicion patterns (Schemers always suspect, creating dramatic irony).

**Source:** Section 1.1, 1.2, 2.1

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `assignLoyaltyRoles(gameId: string)`
- `src/lib/game/services/core/game-creation-service.ts` - Integration with game creation

**Database:**
- `empires.loyalty_role` column ('loyalist', 'syndicate', 'defector')

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test assignment distribution, archetype weighting, player first-game guarantee

**Status:** Draft

---

### REQ-SYND-002: The Revelation Moment

**Description:** At Turn 50 or when first contract is completed (whichever comes first), all players see "The Shadow Emerges" announcement revealing that a Syndicate operative exists in the galaxy.

**Effects:**
- Galaxy-wide dramatic announcement (see Section 1.3 for exact text)
- Accusation system unlocks for all players
- Suspicious Activity Feed becomes visible to all Loyalists
- Bot messaging shifts to include suspicion and accusations
- "Stop the Syndicate" coalition formation increases

**Rationale:** Creates a narrative turning point where the game shifts from standard 4X to paranoid social deduction. Players now question every action and alliance. The delay (Turn 50) ensures players learn base mechanics before paranoia kicks in.

**Source:** Section 1.3

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `triggerRevelationEvent(gameId: string)`
- `src/lib/game/services/core/turn-processor.ts` - Integration with turn processing
- `src/components/game/events/ShadowEmergence.tsx` - UI modal component

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test triggers at Turn 50 and first contract completion
- Test that accusation system unlocks correctly

**Status:** Draft

---

### REQ-SYND-003: Syndicate Contract System

**Description:** Syndicate players see 3 active contracts at any time across 4 tiers. Completing one reveals a new option to maintain 3 active contracts.

**Tier 1: Covert Operations (Trust 0-2)**
- Sabotage Production, Insurgent Aid, Market Manipulation, Pirate Raid
- 1 Syndicate VP each, Low-Medium suspicion (5-35), 8,000-20,000 credits

**Tier 2: Strategic Disruption (Trust 3-5)**
- Intelligence Leak, Arms Embargo, False Flag Operation, Economic Warfare
- 1-2 Syndicate VP each, Medium-High suspicion (20-70), 25,000-50,000 credits

**Tier 3: High-Risk Operations (Trust 6-7)**
- Coup d'État, Assassination, Kingslayer, Scorched Earth
- 2-3 Syndicate VP each, Very High-Extreme suspicion (80-100), 60,000-150,000 credits

**Tier 4: Endgame Contracts (Trust 8)**
- Proxy War, The Equalizer, Shadow Victory
- 2-5 Syndicate VP each, Variable suspicion (0-90), 100,000+ credits or special tech

**Contract Visibility:**
- Contracts are **hidden** from other players (UI panel not visible)
- Contract **effects are visible** (production drops, market crashes, etc.)
- Suspicious Activity Feed shows results without direct attribution

**Rationale:** Provides Syndicate players with alternative progression path while generating observable events that Loyalists can investigate. Tiered contracts create progression similar to tech tree for Loyalists.

**Source:** Section 3.1

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `generateContracts(empireId: string)`, `completeContract(contractId: string)`
- `src/lib/game/constants/syndicate-contracts.ts` - Contract definitions
- `src/components/game/syndicate/SyndicatePanel.tsx` - UI component

**Database:**
- `syndicate_contracts` table (see Section 7.1 for schema)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test contract generation, tier gating, completion rewards, suspicion tracking

**Status:** Draft

---

### REQ-SYND-004: Trust Progression System

**Description:** Syndicate players build trust (0-8 levels) through contracts and purchases to unlock better goods.

**Trust Levels and Requirements:**
- Level 0 (0 pts): Unknown - Must complete intro contract
- Level 1 (100 pts): Associate - Basic intel, components at 2× price
- Level 2 (500 pts): Runner - Tier 1 contracts, 1.75× prices
- Level 3 (1,500 pts): Soldier - Tier 2 contracts, 1.5× prices
- Level 4 (3,500 pts): Captain - Targeted contracts
- Level 5 (7,000 pts): Lieutenant - Advanced systems at 1.5×
- Level 6 (12,000 pts): Underboss - Chemical weapons, EMP devices
- Level 7 (20,000 pts): Consigliere - Nuclear warheads
- Level 8 (35,000 pts): Syndicate Lord - Bioweapons, exclusive contracts

**Trust Earning:**
- Contract completion: +10 to +200 trust (tier-dependent, see Section 3.1)
- Black Market purchases: +5 trust per 10,000 credits spent
- Recruitment bonus (bottom 50% empires): Double trust for first contract
- WMD purchases: +50 trust (one-time)

**Trust Decay:**
- No interaction for 10 turns: -5% trust decay per turn
- Failed contract: -50% of reward trust, drop 1 level
- Betrayal to Coordinator: Reset to 0, permanent ban
- Being "outed" via accusation: -25% trust

**Rationale:** Creates progression system for Syndicate players similar to standard tech/economy progression for Loyalists. Trust gates access to WMDs and high-impact contracts. Decay prevents inactive Syndicate players from maintaining access.

**Source:** Section 2.3, 3.2

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `increaseTrust(empireId: string, amount: number)`, `applyTrustDecay(empireId: string)`
- `src/lib/game/constants/syndicate-trust.ts` - Trust level definitions

**Database:**
- `empires.syndicate_trust_level` (integer 0-8)
- `empires.syndicate_trust_points` (integer, cumulative)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test trust earning, level thresholds, decay mechanics, recruitment bonus

**Status:** Draft

---

### REQ-SYND-005: Black Market System

**Description:** Only Syndicate players can access the Black Market for restricted goods. Loyalists attempting access see denial message.

**Catalog Categories:**
- **Components (Trust 1+):** Electronics, Armor, Propulsion at 1.75×-2.0× base price
- **Advanced Systems (Trust 5+):** Reactors, Shields, Cloaking at 1.25×-1.5× price
- **Restricted Weapons (Trust 6+):** Single-use WMDs
  - EMP Device (50,000 cr, Trust 6): Disable defenses 3 turns, High suspicion (60)
  - Chemical Weapon (75,000 cr, Trust 6): Kill 25% population, Very High suspicion (80)
  - Nuclear Warhead (100,000 cr, Trust 7): Destroy 50% production, Extreme suspicion (95)
  - Bioweapon Canister (150,000 cr, Trust 8): Kill 75% population, Extreme suspicion (100)
- **Intelligence Services (Trust 2+):** Spy reports, tech espionage, diplomatic intel

**Access Control:**
- Loyalists see encrypted denial message (see Section 3.2)
- Syndicate players see full catalog gated by Trust level
- Purchases increase Trust (+5 per 10,000 cr spent)

**Rationale:** Provides Syndicate-exclusive power spike options that risk high suspicion. WMDs create dramatic moments and give struggling players comeback potential. Economic premium balances power with cost.

**Source:** Section 3.2

**Code:**
- `src/components/game/syndicate/BlackMarketPanel.tsx` - UI component
- `src/lib/game/services/syndicate-service.ts` - Purchase logic
- `src/lib/game/constants/black-market-catalog.ts` - Item definitions

**Database:**
- `black_market_purchases` table (track purchases for trust calculation)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test access control, trust gating, price multipliers, WMD effects, suspicion generation

**Status:** Draft

---

### REQ-SYND-006: Suspicion System

**Description:** Each contract and suspicious action generates suspicion based on visibility and impact. Suspicion affects accusation likelihood and success rate.

**Suspicion Levels:**
- Low (0-25): No special effects, appear normal
- Moderate (26-50): Occasional bot suspicions
- High (51-75): Increased bot accusations, coalition distrust
- Extreme (76-100): Automatic Coordinator monitoring, high accusation success rate

**Suspicion Score Calculation:**
```
Suspicion Score = Σ(Contract Suspicion + WMD Use + Black Market Purchases) × Investigation Modifier
```

**High Suspicion (>75) triggers:**
- More bot accusations (see Section 4.2)
- Coalition formation against suspect
- Coordinator automatic monitoring
- Higher accusation trial success rate (+20% guilty vote bias)

**Reducing Suspicion:**
- Complete "clean" turns (no contracts for 5 turns): -10 suspicion
- Form alliances: -5 suspicion per active treaty
- Win battles legitimately: -15 suspicion
- Public charity (donate resources): -20 suspicion

**Rationale:** Creates risk/reward balance for Syndicate players. High-impact contracts generate high suspicion. Staying hidden requires mixing contracts with legitimate play.

**Source:** Section 2.3, 3.1

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `increaseSuspicion(empireId: string, amount: number)`, `reduceSuspicion(empireId: string, reason: string)`

**Database:**
- `empires.suspicion_score` (integer 0-100)
- `suspicious_events` table (see Section 7.1 for schema)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test suspicion calculation, triggers at thresholds, reduction mechanics

**Status:** Draft

---

### REQ-SYND-007: Accusation System

**Description:** After Turn 50 (or "Shadow Emerges" event), any empire can accuse another of Syndicate allegiance.

**Process:**
1. Accuser spends 25 Intel Points to accuse specific empire
2. Public announcement to all empires: "X accuses Y of Syndicate allegiance"
3. Accused can defend (spend 10,000 credits for defense statement)
4. Voting period - All other empires vote Guilty/Innocent/Abstain (3 turns)
5. Resolution - Majority vote determines outcome

**Resolution Outcomes:**

**If GUILTY + Target is SYNDICATE:**
- Accuser: +5,000 credits, +10 Coordinator standing
- Target: "Outed" (loses hidden status), -25% Syndicate trust
- Target gains "Desperate" status: +20% combat, -20% income, alliances dissolved
- Galaxy-wide announcement of successful accusation

**If GUILTY + Target is LOYALIST (False Accusation):**
- Accuser: -10,000 credits, -20 Coordinator standing
- Target: +15,000 credits (sympathy), +2 all diplomatic relations
- Galaxy-wide announcement of false accusation

**If INNOCENT:**
- No penalties, suspicion score remains, lingering doubt

**Rationale:** Creates high-stakes social deduction mechanics. False accusations have severe penalties to prevent spam. Outed Syndicate players can still win but lose stealth advantage. 3-turn voting period allows for political maneuvering.

**Source:** Section 3.3

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `createAccusation(accuserId: string, accusedId: string)`, `voteOnAccusation(accusationId: string, voterId: string, vote: string)`, `resolveAccusation(accusationId: string)`
- `src/components/game/syndicate/AccusationTrial.tsx` - UI component

**Database:**
- `accusations` table (see Section 7.1 for schema)
- `accusation_votes` table (see Section 7.1 for schema)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test accusation creation, voting mechanics, resolution outcomes, "Desperate" status application

**Status:** Draft

---

### REQ-SYND-008: The Coordinator (NPC Faction)

**Description:** The Coordinator is the galactic authority NPC faction that opposes the Syndicate and provides investigation services to Loyalists.

**Services:**
- **Intel Validation (15 Intel Points + 5,000 credits):** Confirm or deny suspicions
  - If target is SYNDICATE: Receive target's next contract (preview), +10% permanent funding bonus, +50 Coordinator standing
  - If target is LOYALIST: Report leaked to target (diplomatic damage), lose 10,000 credits, -25 Coordinator standing

- **Protection:** +10% funding bonus if you successfully report Syndicate player

- **Whistleblower Rewards:** Syndicate players can betray the Syndicate
  - Benefits: +25,000 credits, +25% permanent funding bonus
  - Consequences: Trust reset to 0, Black Market revoked permanently, Syndicate hostile (5% assassination per turn), loyalty changes to "Defector", new victory condition

**Rationale:** Provides investigation tools for Loyalists and creates betrayal temptation for Syndicate players. Coordinator acts as counterbalance to Syndicate power. False reports have consequences to prevent abuse.

**Source:** Section 3.4

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `reportToCoordinator(reporterId: string, targetId: string)`, `betraySyndicate(empireId: string)`
- `src/components/game/syndicate/CoordinatorInterface.tsx` - UI component

**Database:**
- `coordinator_reports` table (see Section 7.1 for schema)
- `empires.coordinator_standing` (integer, tracks relationship)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test report outcomes, betrayal mechanics, funding bonus application, assassination attempts

**Status:** Draft

---

### REQ-SYND-009: Syndicate Victory Conditions

**Description:** Syndicate players have asymmetric victory conditions separate from standard victories.

**Condition 1: Contract Mastery**
- Complete 3 Syndicate contracts before Turn 200
- Any combination of tiers allowed
- Hidden or outed status doesn't matter
- Victory Type: "Shadow Victory" if hidden, "Defiant Victory" if outed

**Condition 2: Chaos Victory**
- If no standard victory achieved by Turn 200
- AND Syndicate player has 2+ contracts completed
- "The galaxy descends into chaos. The Syndicate wins."

**Condition 3: The Perfect Game**
- Complete 3 contracts while remaining undetected
- Never accused, never outed
- Bonus: "Shadow Master" achievement
- Highest Syndicate victory score

**Victory Screen:**
- Reveals Syndicate operative identity and archetype
- Shows completed contracts with turn timestamps
- Displays suspicion score and false accusations survived
- Shows final Syndicate trust level and credits earned
- Flavor quote based on victory type

**Loyalist Victory Bonus:**
- If Syndicate players all eliminated/outed before standard victory: +10,000 credits, "Guardian of the Galaxy" achievement

**Rationale:** Creates alternative win condition that doesn't require territory or economic dominance. Syndicate can win from behind, providing comeback mechanics and dramatic reveals.

**Source:** Section 3.5

**Code:**
- `src/lib/game/services/syndicate-service.ts` - `checkSyndicateVictory(gameId: string)`
- `src/lib/game/services/core/victory-service.ts` - Integration with standard victory checks
- `src/components/game/victory/SyndicateVictoryScreen.tsx` - UI component

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test all three victory conditions, achievement unlocking, victory screen data

**Status:** Draft

---

### REQ-SYND-010: Bot Syndicate Integration

**Description:** Bots integrate with Syndicate system through archetype-specific behavior.

**Syndicate Bot Behavior:**
- Complete low-suspicion contracts first (suspicion < 50 until 2 VP)
- Target rivals (highest networth enemies)
- Use WMDs only when desperate or for Kingslayer contract
- Attempt to stay hidden until 2/3 contracts complete
- "Go loud" strategy for Blitzkrieg archetype (high-risk early)

**Loyalist Bot Behavior:**
- **Accusation Patterns:**
  - Diplomat bots: High accusation rate (threshold: suspicion > 40)
  - Warlord bots: Only accuse if high suspicion (threshold: > 70)
  - Turtle bots: Never accuse (too defensive)
  - Schemer bots (Loyalist): Frequently accused but rarely accuse others

- **Coalition Formation:**
  - "Stop the Syndicate" coalitions form after Turn 75
  - Bots share suspicions in coalition chat
  - Coordinate accusations via voting

**The Schemer Paradox:**
- 50% of Schemer bots are Syndicate (high risk)
- 50% of Schemer bots are Loyalist (false positives)
- Players never know which, creating permanent suspicion

**Message Templates:**
- 70+ new message templates for Syndicate-related events
- Suspicion accusations, contract hints, coalition coordination
- Post-outing reactions, victory/defeat acknowledgment
- Archetype-specific personality in messages

**Rationale:** Integrates Syndicate mechanics into existing bot AI system. Scheming bots create natural paranoia. Bot accusations and suspicions make solo play feel dynamic.

**Source:** Section 4

**Code:**
- `src/lib/bots/syndicate-ai.ts` - Bot decision logic for contracts, accusations, voting
- `src/lib/bots/messaging/syndicate-messages.ts` - Message templates

**Tests:**
- `src/lib/bots/__tests__/syndicate-ai.test.ts` - Test bot contract selection, accusation logic, voting behavior
- Test Schemer paradox distribution

**Status:** Draft

---

### REQ-SYND-011: Intel Point Economy

**Description:** Loyalist players earn Intel Points for investigation and accusation.

**Earning Intel Points:**
- Earn 5 points per turn (max 50 stored)
- Bonus points from successful Coordinator reports (+10)
- Bonus points from successful accusations (+15)

**Spending Intel Points:**
- Investigation (10 points): Research target's activities, reveals suspicious events linked to target
- Accusation (25 points): Formally accuse empire of being Syndicate
- Coordinator Report (15 points): Request intel validation from NPC faction

**Rationale:** Creates economy around investigation to prevent accusation spam. Players must choose between investigating multiple suspects or making formal accusations. Limited storage (50 max) prevents hoarding.

**Source:** Section 2.2

**Code:**
- `src/lib/game/services/syndicate-service.ts` - Intel point management functions
- `src/lib/game/services/core/turn-processor.ts` - Award 5 points per turn

**Database:**
- `empires.intel_points` (integer 0-50)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test earning, spending, max cap, bonus awards

**Status:** Draft

---

### REQ-SYND-012: Suspicious Activity Feed

**Description:** Loyalist players see a feed of unexplained events in the galaxy.

**Event Types:**
- Production drops without explanation
- Market price anomalies
- Convenient "accidents" affecting empires
- Black Market activity (when detected via investigation)
- Unexplained attacks or disruptions

**Event Data:**
- Turn number
- Affected empire
- Event description (visible to all)
- Suspicion increase (visible only if investigated)
- Related empire (revealed only via investigation)

**Investigation:**
- Spend 10 Intel Points to investigate specific event
- Reveals potential source empire
- Increases suspicion score of suspect by investigation result

**Rationale:** Provides information to Loyalists without explicitly revealing Syndicate contracts. Creates detective gameplay where players piece together clues. Investigation cost prevents spam while allowing targeted detective work.

**Source:** Section 2.2

**Code:**
- `src/components/game/syndicate/SuspiciousActivityFeed.tsx` - UI component
- `src/lib/game/services/syndicate-service.ts` - `generateSuspiciousEvent(gameId: string, eventType: string, affectedEmpireId: string, sourceEmpireId: string)`

**Database:**
- `suspicious_events` table (see Section 7.1 for schema)

**Tests:**
- `src/lib/game/services/__tests__/syndicate-service.test.ts` - Test event generation, investigation mechanics, suspicion linkage

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-SYND-001 | Hidden Role Assignment | Draft | TBD |
| REQ-SYND-002 | The Revelation Moment | Draft | TBD |
| REQ-SYND-003 | Syndicate Contract System | Draft | TBD |
| REQ-SYND-004 | Trust Progression System | Draft | TBD |
| REQ-SYND-005 | Black Market System | Draft | TBD |
| REQ-SYND-006 | Suspicion System | Draft | TBD |
| REQ-SYND-007 | Accusation System | Draft | TBD |
| REQ-SYND-008 | The Coordinator (NPC Faction) | Draft | TBD |
| REQ-SYND-009 | Syndicate Victory Conditions | Draft | TBD |
| REQ-SYND-010 | Bot Syndicate Integration | Draft | TBD |
| REQ-SYND-011 | Intel Point Economy | Draft | TBD |
| REQ-SYND-012 | Suspicious Activity Feed | Draft | TBD |

**Total Specifications:** 12
**Implemented:** 0
**Validated:** 0
**Draft:** 12

---

## 7. Implementation Requirements

### 7.1 Database Schema

For complete database schemas including tables, indexes, and relationships, see [Appendix: Database Schemas](appendix/SYNDICATE-SYSTEM-APPENDIX.md#database-schemas).

**Summary of required tables:**
- `empires` - Add columns for `loyalty_role`, `syndicate_vp`, `syndicate_trust_level`, `syndicate_trust_points`, `suspicion_score`, `is_outed`, `intel_points`, `coordinator_standing`
- `syndicate_contracts` - Track contract assignments, completions, and rewards
- `accusations` - Track accusation trials and outcomes
- `accusation_votes` - Track individual votes in accusation trials
- `suspicious_events` - Track observable events for Suspicious Activity Feed
- `coordinator_reports` - Track Coordinator intel validation requests
- `black_market_purchases` - Track Black Market transactions

### 7.2 Service Architecture

For complete service implementation with full method signatures and logic, see [Appendix: Service Architecture](appendix/SYNDICATE-SYSTEM-APPENDIX.md#service-architecture).

**Primary Service:**
- `SyndicateService` - Core Syndicate system logic (loyalty, contracts, trust, suspicion, accusations, Coordinator)

**Integration Points:**
- `GameCreationService` - Call `assignLoyaltyRoles()` during game creation
- `TurnProcessor` - Process contracts, decay trust, generate events, resolve accusations
- `VictoryService` - Check Syndicate victory conditions
- `BotAI` - Integrate Syndicate decision-making

### 7.3 Server Actions

For complete server action implementations, see [Appendix: Server Actions](appendix/SYNDICATE-SYSTEM-APPENDIX.md#server-actions).

**Required Actions:**
- `acceptContractAction` - Accept and activate Syndicate contract
- `accuseEmpireAction` - Create accusation trial
- `voteOnAccusationAction` - Submit vote in accusation trial
- `reportToCoordinatorAction` - Request Coordinator intel validation
- `betraySyndicateAction` - Betray Syndicate to Coordinator
- `investigateEventAction` - Spend Intel Points to investigate suspicious event
- `purchaseBlackMarketItemAction` - Purchase from Black Market

### 7.4 UI Components

For complete component implementations with props and interfaces, see [Appendix: UI Components](appendix/SYNDICATE-SYSTEM-APPENDIX.md#ui-components).

**Required Components:**
- `LoyaltyCardReveal` - Dramatic reveal at game start
- `SyndicatePanel` - Hidden panel for Syndicate players (contracts, trust, Black Market)
- `SuspiciousActivityFeed` - Intel feed showing unexplained events
- `AccusationTrial` - Voting interface for accusations
- `BlackMarketPanel` - Shopping interface for restricted goods
- `CoordinatorInterface` - Report suspicious activity to NPC faction
- `ShadowEmergence` - Full-screen revelation event
- `SyndicateVictoryScreen` - Victory screen for Syndicate wins

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| Syndicate Victory Rate | 15-20% | ±3% | Track victories over 1,000 games |
| Loyalist Detection Rate | 60-70% | ±5% | % of Syndicate players outed |
| False Accusation Rate | 20-30% | ±5% | % of accusations against Loyalists |
| Average Contract Completion | Turn 80 | ±20 turns | First contract completion turn |
| Trust Level 6 Achievement | Turn 100 | ±15 turns | When WMD access unlocked |
| Syndicate Credits Earned | 200,000 | ±50,000 | Total credits from contracts over full game |

### 8.2 Progression Pacing

**Contract Completion Timeline:**
- First Contract: Turn 20-40 (establish role, low-risk contracts)
- Second Contract: Turn 60-100 (mid-game pressure, medium-risk)
- Third Contract: Turn 120-180 (endgame rush, high-risk acceptable)

**Trust Progression:**
- Level 3 by Turn 50 (basic functionality, Tier 2 contracts)
- Level 6 by Turn 100 (WMD access)
- Level 8 by Turn 150 (if dedicated, Tier 4 contracts)

### 8.3 Economic Balance

**Syndicate Economic Flow:**
- Credits earned from contracts: 150,000-300,000 over full game
- Credits spent on Black Market: 100,000-200,000 over full game
- Net advantage: Syndicate trades efficiency for power (pays premium)

**Black Market Price Multipliers:**
- Trust 1-2: 2.0× (significant premium, limits early purchases)
- Trust 3-4: 1.75× (moderate premium)
- Trust 5-6: 1.5× (competitive with production time saved)
- Trust 7-8: 1.25× (near-parity, access is the benefit)

### 8.4 Simulation Requirements

**Monte Carlo Simulation (10,000 iterations):**
- Variables controlled: Empire count (100), Syndicate % (10%), archetype distribution
- Success criteria: Syndicate victory rate 15-20%, detection rate 60-70%
- Measure: Average suspicion at contract completion, accusation timing distribution

### 8.5 Playtest Checklist

- [ ] **Scenario 1: Stealth Victory** - Syndicate player completes 3 contracts without being outed (expected: 30-40% of Syndicate victories)
- [ ] **Scenario 2: Outed Comeback** - Syndicate player outed after 2 contracts, completes 3rd with "Desperate" status (expected: possible but difficult)
- [ ] **Scenario 3: False Accusation** - Loyalist wrongly accused, accuser penalized appropriately (expected: penalties deter spam)
- [ ] **Scenario 4: Coordinator Betrayal** - Syndicate player betrays to Coordinator, survives to Turn 200 with assassination attempts (expected: challenging but viable)
- [ ] **Scenario 5: Bot Schemer Suspicion** - Loyalist Schemer bot frequently accused despite loyalty (expected: creates dramatic irony)
- [ ] **Scenario 6: WMD Impact** - Syndicate uses Nuclear Warhead, gets immediately outed (expected: Extreme suspicion = outing)
- [ ] **Scenario 7: Coalition Anti-Syndicate** - Bots form "Stop the Syndicate" coalition after Turn 75 (expected: organic coalition formation)
- [ ] **Scenario 8: Chaos Victory** - No standard victory by Turn 200, Syndicate with 2 VP wins (expected: rare but dramatic)

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| No Syndicate system | Full Syndicate implementation | Implement in Milestone 11 (post-Beta-1) |
| Standard victory only | Asymmetric Syndicate victory | Add victory checks to `VictoryService` |
| No hidden roles | Loyalty assignment at game start | Modify `GameCreationService` to call `assignLoyaltyRoles()` |
| No NPC factions | Coordinator NPC faction | Create Coordinator as special empire (non-player, non-bot) |
| No suspicion tracking | Suspicion system active | Add columns to `empires` table, track suspicious events |

### 9.2 Data Migration

**Schema Changes (Safe to run):**

```sql
-- Add Syndicate columns to empires table
-- Safe to run: YES - adds new columns with defaults, no data loss

ALTER TABLE empires ADD COLUMN loyalty_role VARCHAR(20) DEFAULT 'loyalist';
ALTER TABLE empires ADD COLUMN syndicate_vp INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN syndicate_trust_level INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN syndicate_trust_points INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN suspicion_score INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN is_outed BOOLEAN DEFAULT false;
ALTER TABLE empires ADD COLUMN intel_points INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN coordinator_standing INTEGER DEFAULT 0;

-- Create new tables (see Appendix for complete schemas)
-- Safe to run: YES - creates new tables, no impact on existing data

CREATE TABLE syndicate_contracts (...);
CREATE TABLE accusations (...);
CREATE TABLE accusation_votes (...);
CREATE TABLE suspicious_events (...);
CREATE TABLE coordinator_reports (...);
CREATE TABLE black_market_purchases (...);
```

**Existing Games:**
- Games created before Syndicate implementation: No Syndicate system active (loyalty_role = 'loyalist' for all)
- Games created after implementation: Syndicate system active with loyalty assignment
- No retroactive conversion of existing games (clean separation)

### 9.3 Rollback Plan

**If Syndicate system causes issues:**

1. **Database Rollback:**
```sql
-- Remove Syndicate-specific columns (preserve core game data)
ALTER TABLE empires DROP COLUMN loyalty_role;
ALTER TABLE empires DROP COLUMN syndicate_vp;
ALTER TABLE empires DROP COLUMN syndicate_trust_level;
ALTER TABLE empires DROP COLUMN syndicate_trust_points;
ALTER TABLE empires DROP COLUMN suspicion_score;
ALTER TABLE empires DROP COLUMN is_outed;
ALTER TABLE empires DROP COLUMN intel_points;
ALTER TABLE empires DROP COLUMN coordinator_standing;

-- Drop Syndicate tables
DROP TABLE syndicate_contracts;
DROP TABLE accusations;
DROP TABLE accusation_votes;
DROP TABLE suspicious_events;
DROP TABLE coordinator_reports;
DROP TABLE black_market_purchases;
```

2. **Code Rollback:**
- Remove `SyndicateService` and all Syndicate-specific components
- Remove Syndicate victory checks from `VictoryService`
- Remove Syndicate integration from `TurnProcessor`
- Remove Syndicate AI from `BotAI`

3. **Feature Flag (Alternative):**
- Add `game_settings.syndicate_enabled` boolean flag
- Default to `false` for new games initially
- Allow gradual rollout and testing without full removal

---

## 10. Conclusion

The Syndicate system transforms Nexus Dominion from a pure 4X strategy game into a **hidden role game with 4X elements**. The tension between building your empire and completing secret contracts creates a unique experience where every action is scrutinized, alliances are suspect, and victory can come from the shadows.

### Key Decisions

**Hidden Role Assignment:**
- **Decision:** 90/10 Loyalist/Syndicate split with archetype weighting
- **Rationale:** Ensures enough Syndicate players for drama (10% in 100-empire game = 10 Syndicate) while maintaining Loyalist majority. Schemer at 50% creates natural suspicion target and dramatic irony.

**Asymmetric Victory:**
- **Decision:** Syndicate wins via contracts (3 VP), not territory/economy
- **Rationale:** Allows comebacks from behind. Struggling players can pivot to Syndicate contracts for alternative path to victory. Creates tension where dominant empire may lose to hidden Syndicate.

**Accusation Penalties:**
- **Decision:** Severe penalties for false accusations (-10,000 cr, -20 Coordinator standing)
- **Rationale:** Prevents accusation spam while maintaining meaningful stakes. Players must gather evidence before accusing to avoid crippling penalties.

**Trust Progression:**
- **Decision:** 8 levels (0-35,000 points) with exponential requirements
- **Rationale:** Creates long-term progression similar to tech tree. Gates WMDs behind substantial commitment (Trust 6+ requires multiple contracts). Prevents early WMD access while rewarding dedicated Syndicate play.

**Bot Integration:**
- **Decision:** 70+ new message templates, archetype-specific behavior
- **Rationale:** Makes solo play feel dynamic with bot accusations and suspicions. Schemer bots create false positives (50% Loyalist) for dramatic irony. Bots form coalitions organically after Turn 75.

### Open Questions

*No open questions - design is complete and ready for implementation.*

### Dependencies

**Depends On:**
- **Victory System** - Standard victory conditions must exist for Loyalist players ([VICTORY-SYSTEMS.md](VICTORY-SYSTEMS.md))
- **Bot System** - Archetype definitions and messaging system ([BOT-SYSTEM.md](BOT-SYSTEM.md))
- **Research System** - Espionage reveals research progress ([RESEARCH-SYSTEM.md](RESEARCH-SYSTEM.md))
- **Market System** - Market manipulation contracts affect prices ([MARKET-SYSTEM.md](MARKET-SYSTEM.md))
- **Turn Processing** - Integrate Syndicate phases into turn pipeline

**Depended By:**
- **Future Expansion: Syndicate Hideouts** - Physical Syndicate bases in sectors (Milestone 15+)
- **Future Expansion: Syndicate Storylines** - Narrative campaigns involving Syndicate (Milestone 20+)

---

**END SPECIFICATION**
