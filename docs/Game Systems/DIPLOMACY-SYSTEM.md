# Diplomacy System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-DIP
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/DIPLOMACY-SYSTEM.md

---

## Document Purpose

This document provides the complete specification for Nexus Dominion's diplomacy and coalition systems. All treaty mechanics, reputation tracking, coalition formation rules, and diplomatic victory conditions are defined here.

This document is intended for:
- **Game designers** defining diplomatic gameplay and balance
- **Developers** implementing the diplomacy engine and coalition systems
- **QA** validating diplomatic behavior against specifications

**Design Philosophy:**
- **Meaningful alliances** - Treaties provide tangible benefits and consequences
- **Emergent coalitions** - Anti-snowball mechanics create organic cooperation
- **Trust and betrayal** - Reputation system tracks history and influences behavior
- **Bot personality expression** - Each archetype approaches diplomacy differently
- **Strategic choices** - Treaties are tools, not guarantees of peace

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

### 1.1 The Diplomacy System

Nexus Dominion's diplomacy system enables formal relationships between empires through **Treaties** and **Coalitions**. Unlike many 4X games where alliances are binary switches, our system treats diplomatic relationships as **evolving states** influenced by reputation, trust scores, and observable behavior.

**Core Loop:**
1. Build reputation through actions (trade, non-aggression, cooperation)
2. Propose or accept treaties (NAP, Alliance)
3. Leverage treaties for strategic advantage (coordinated attacks, shared intel)
4. Monitor for betrayals (reputation loss, coalition collapse)
5. Form coalitions against dominant threats (anti-snowball mechanic)

### 1.2 Why This Matters

Diplomacy serves three critical design goals:

**1. Anti-Snowball Mechanic**
When any empire reaches 7+ Victory Points, automatic coalitions form to prevent runaway victories. This ensures games remain competitive through the mid-late game.

**2. Bot Personality Expression**
Each of the 8 archetypes approaches diplomacy differently:
- Diplomats actively seek alliances
- Schemers join coalitions to betray them
- Warlords only ally with the strong
- Turtles seek defensive pacts

**3. Strategic Depth**
Treaties are not permanent. Betrayals create drama, reputation loss has consequences, and players must deduce bot intentions through observation.

### 1.3 Player Experience

Diplomacy in Nexus Dominion feels like **reading the board** in a political thriller. You observe bot behavior, track who allies with whom, deduce archetypes, and decide whether to trust or prepare for betrayal.

**Example Scenario:**
> Turn 50: Your neighbor (unknown archetype) proposes an alliance. They have high military power and recently attacked two others. Do you:
> - **Accept** - Gain a powerful ally, but risk betrayal
> - **Reject** - Stay independent, but they may attack you next
> - **Counter-propose NAP** - Buy time to build defenses

You cannot see their archetype label. If they're a Schemer, they'll betray you after 20 turns. If they're a Warlord, they'll honor the alliance as long as you're strong. **Reading behavior is the skill.**

---

## 2. Mechanics Overview

### 2.1 Treaty Types

| Treaty Type | Effect | Duration | Breakable? |
|-------------|--------|----------|------------|
| **Non-Aggression Pact (NAP)** | Cannot attack each other | 20 turns minimum | Yes (reputation penalty) |
| **Alliance** | Shared intel, trade bonus (+10%), coordinated attacks | 30 turns minimum | Yes (severe reputation penalty) |
| **Coalition** | Formal multi-empire group, shared victory condition | Until dissolved | Yes (by vote or betrayal) |

### 2.2 Reputation System

Actions affect your reputation with all empires:

| Action | Reputation Change | Visibility |
|--------|-------------------|------------|
| Fulfill trade agreements | +2 per turn | Trade partners |
| Honor treaties | +1 per turn | Treaty partners |
| Help weak empire (gifts, defense) | +5 | All empires |
| Attack without provocation | -10 | All empires |
| Break NAP | -15 | All empires |
| Break Alliance | -25 | All empires |
| Betray coalition | -40 | All empires |
| Attack dominant leader (7+ VP) | +8 | All empires |

**Reputation Ranges:**
- 50+: Trusted ally (bots seek alliances with you)
- 20-49: Friendly (bots consider treaties)
- 0-19: Neutral (bots wary)
- -1 to -19: Untrusted (bots reject proposals)
- -20 to -39: Hostile (bots consider you a threat)
- -40 or lower: Pariah (all bots hostile, no treaties possible)

### 2.3 Trust Scores (Bot-to-Bot & Bot-to-Player)

Each empire tracks a **trust score** for every other empire:

```
Trust Score = Base Reputation + (Recent Interactions × Weight) + Archetype Modifier
```

**Trust Score Effects:**
- Trust > 50: Bot considers alliance
- Trust 30-50: Bot considers NAP
- Trust 0-30: Bot neutral
- Trust < 0: Bot considers attack
- Trust < -30: Bot seeks coalition against you

**Decay:** Trust scores decay toward 0 at 1 point per 5 turns, except for **major events** which resist decay.

### 2.4 Coalition Victory Condition

**Diplomatic Victory:** Coalition controls 50%+ of galaxy territory.

All coalition members share the victory. This encourages cooperation and provides an alternative to military conquest.

---

## 3. Detailed Rules

### 3.1 Treaty Proposal & Acceptance

**Proposal Requirements:**
- NAP: Reputation ≥ 0 with target
- Alliance: Reputation ≥ 20 with target, or existing NAP
- Coalition: Any empire can propose, requires 3+ members

**Acceptance Logic (Bots):**

**NAP Acceptance:**
- Random bots: 30% chance if reputation ≥ 0
- Simple bots: Accept if target not adjacent or target weaker
- Strategic bots: Accept if strategic value > threat score
- LLM bots: Contextual decision based on game state

**Alliance Acceptance:**
- Diplomat: Always accepts if trust > 30
- Warlord: Only if target in top 30% networth
- Merchant: Accepts if trade value > military threat
- Schemer: Always accepts (plans betrayal)
- Turtle: Only if defensive advantage
- Tech Rush: Rarely accepts (isolationist)
- Blitzkrieg: Never accepts (early aggression focus)
- Opportunist: Accepts if currently weak

### 3.2 Coalition Formation

**Automatic Coalition (Anti-Snowball):**
When any empire reaches **7+ Victory Points**:
1. System broadcasts: "Empire [X] threatens galactic domination"
2. All empires with trust > 0 toward each other receive coalition invitation
3. Bots decide based on archetype and threat assessment
4. Coalition forms with shared goal: "Defeat [X]"
5. Coalition disbands when leader drops below 5 VP or is eliminated

**Voluntary Coalition:**
Players or bots can propose coalitions at any time:
- Requires 3+ members
- Must have shared goal (defeat specific empire, defensive pact, etc.)
- Voting: Majority vote required for major decisions (declare war, accept new members)

**Coalition Benefits:**
- Shared intelligence (see all coalition members' territories)
- Coordinated attacks (+5% attack bonus vs common enemy)
- Diplomatic immunity (members cannot be attacked by other members)
- Coalition chat (players see bot discussions, builds narrative)

### 3.3 Betrayal Mechanics

**Treaty Breaking:**
- Player or bot declares betrayal (explicit action)
- Immediate reputation penalty (see Section 2.2)
- All treaties with target immediately void
- "Betrayed" status applied to target for 50 turns (-20 trust toward betrayer)

**Coalition Betrayal:**
- Requires leaving coalition first (action)
- Massive reputation penalty (-40 all empires)
- "Pariah" status applied (no new treaties for 30 turns)
- Coalition receives notification: "[Empire] has betrayed the coalition"

**Betrayal Timing (Bots):**

| Archetype | Betrayal Condition |
|-----------|-------------------|
| **Schemer** | Always betrays after 20 turns in coalition |
| **Opportunist** | Betrays if coalition weakened by 50%+ casualties |
| **Warlord** | Never betrays (honor code) |
| **Merchant** | Betrays if better economic opportunity arises |
| **Others** | Only if trust < -50 (extreme circumstances) |

### 3.4 Reputation Recovery

Reputation can be recovered through positive actions:

**Fast Recovery (10+ turns):**
- Fulfill 10+ consecutive trade agreements (+20)
- Gift resources to weaker empires (+5 per gift, max 3 per target)
- Join defensive coalition against aggressor (+15)

**Slow Recovery (30+ turns):**
- Maintain peace (no attacks) for 30 turns (+10)
- Honor all treaties for 30 turns (+15)

**Permanent Damage:**
Some actions create **permanent reputation scars** that never fully heal:
- Coalition betrayal: -20 permanent scar
- Repeated treaty breaking (3+): -15 permanent scar

### 3.5 Diplomatic Immunity & Restrictions

**When in Alliance or Coalition:**
- Cannot attack alliance/coalition members
- Cannot declare war on members' allies (must leave alliance first)
- Must accept majority vote decisions (for coalitions)

**When Leader (7+ VP):**
- Cannot form new alliances (restriction)
- Existing alliances remain valid
- All non-allies receive +10% attack power vs leader

### 3.6 Treaty Duration & Renewal

**Minimum Duration:**
- NAP: 20 turns
- Alliance: 30 turns

**Auto-Renewal:**
Treaties auto-renew unless:
1. Either party explicitly cancels (reputation penalty applies)
2. One party eliminated
3. Trust score drops below 0

**Early Termination:**
Can terminate early with mutual agreement (no reputation penalty) or unilateral breaking (reputation penalty).

### 3.7 Visibility & Intelligence

**What You Can See:**
- All active treaties (public knowledge)
- Your own reputation scores with each empire
- Coalition membership (public)
- Treaty proposals sent to you

**What You Cannot See:**
- Bot archetypes (must deduce from behavior)
- Bot trust scores toward you (infer from actions)
- Secret bot-to-bot negotiations (unless in same coalition)

**Shared Intelligence (Alliances & Coalitions):**
- See allied territories on starmap
- Receive alerts when ally attacked
- View coalition chat (bots discuss strategy)

---

## 4. Bot Integration

### 4.1 Archetype Diplomatic Behavior

| Archetype | Alliance Priority | Betrayal Rate | Preferred Partners | Trust Threshold |
|-----------|------------------|---------------|-------------------|-----------------|
| **Warlord** | Low (0.3) | Never | Strong empires (top 30%) | 40+ |
| **Diplomat** | Very High (0.9) | Very Low (1%) | Anyone friendly | 25+ |
| **Merchant** | Medium (0.6) | Low (5%) | Trade partners | 30+ |
| **Schemer** | High (0.8)* | Very High (95%) | Anyone trusting | 20+ |
| **Turtle** | Medium (0.5) | Never | Defensive neighbors | 35+ |
| **Blitzkrieg** | Very Low (0.1) | N/A | None (early rush) | 60+ |
| **Tech Rush** | Low (0.2) | Low (3%) | Isolation preferred | 50+ |
| **Opportunist** | Variable | Medium (20%) | Strongest available | 30+ |

\* Schemer's high alliance priority is for deception purposes

### 4.2 Bot Decision Logic

**Coalition Formation Decision:**
```
IF game_turn > 10 AND not in coalition:
    threat_assessment = calculate_threat_level(leader)

    IF leader VP >= 7:
        IF archetype == "Diplomat": JOIN (priority: 0.95)
        IF archetype == "Warlord" AND self in top 30%: JOIN (priority: 0.7)
        IF archetype == "Schemer": JOIN (priority: 0.9, plan_betrayal: true)
        IF archetype == "Turtle": JOIN (priority: 0.8)
        IF archetype == "Merchant" AND leader threatens trade: JOIN (priority: 0.75)
        IF archetype == "Opportunist": JOIN (priority: 0.6)
        ELSE: 30% chance to join
```

**Treaty Proposal Logic:**
```
FOR each potential partner WHERE reputation >= threshold:
    calculate_strategic_value(partner)

    IF archetype == "Diplomat":
        PROPOSE alliance IF trust > 30

    IF archetype == "Schemer":
        PROPOSE alliance IF partner strong (deception target)

    IF archetype == "Merchant":
        PROPOSE NAP to trade partners
        PROPOSE alliance IF trade_value > 1000/turn

    IF archetype == "Turtle":
        PROPOSE NAP to all adjacent empires

    IF archetype == "Warlord":
        PROPOSE alliance IF partner in top 20% military power
```

**Betrayal Timing Logic:**
```
IF in_coalition AND archetype == "Schemer":
    turns_in_coalition++
    IF turns_in_coalition >= 20:
        BETRAY_COALITION()
        ATTACK strongest_coalition_member (surprise attack)

IF in_alliance:
    IF archetype == "Opportunist" AND better_opportunity_exists():
        IF risk_tolerance > 0.7:
            BREAK_ALLIANCE()

    IF trust_score < -50:
        BREAK_ALLIANCE() (all archetypes)
```

### 4.3 Bot Diplomatic Messages

**NAP Proposal:**
- Diplomat: "Let us put aside our differences, {player_name}. I propose a Non-Aggression Pact."
- Warlord: "You're not worth fighting. NAP for 20 turns. Stay out of my way."
- Merchant: "War is bad for business. Let's keep the trade lanes open. NAP?"
- Schemer: "I have no quarrel with you... for now. How about we don't attack each other?"
- Turtle: "I seek only peace. Will you honor a Non-Aggression Pact?"

**Alliance Proposal:**
- Diplomat: "Together we are stronger, {player_name}. Form an alliance with me."
- Warlord: "You fight well. Join me. We'll crush the weak together."
- Merchant: "An alliance benefits us both. +10% trade income. What do you say?"
- Schemer: "I trust you, {player_name}. Let's form an alliance." (planning betrayal)
- Opportunist: "Right now, I need allies. You interested?"

**Coalition Invitation (Anti-Snowball):**
- Diplomat: "Attention all commanders. {leader} threatens galactic domination. We must unite!"
- Warlord: "Nobody dominates this galaxy but me. Join my coalition. We take {leader} down."
- Merchant: "If {leader} wins, we all lose. Temporary coalition? Back to business after."
- Schemer: "You don't trust me. Fine. But you can trust that I want {leader} dead as much as you do."

**Coalition Betrayal (Schemer):**
- Pre-betrayal (internal log): "Coalition trusts me now. {target} forces deployed. Strike window: next turn."
- Pre-betrayal (to coalition): "I'll guard our flank. Trust me."
- Post-betrayal (global): "You all trusted me. Every single one of you. And now, with your fleets depleted... the galaxy is mine."

**Alliance Broken (by bot):**
- Opportunist: "Sorry, {player_name}. Better opportunity came up. Nothing personal."
- Merchant: "Economics change. Our alliance no longer profitable. Apologies."
- Schemer: "Did you really think I meant any of it?"

**Reputation Comment:**
- High reputation: "Commander {player_name} has proven to be an honorable ally." (Diplomat)
- Low reputation: "{player_name} is a snake. Do not trust their treaties." (any bot who was betrayed)

---

## 5. UI/UX Design

### 5.1 Diplomacy Screen

**Main Panel Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  DIPLOMATIC RELATIONS                     [X Close]     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────────┐│
│  │ EMPIRE LIST      │  │ SELECTED: The Merchant Kings ││
│  │ (All Empires)    │  │                              ││
│  ├──────────────────┤  │ Status: Neutral              ││
│  │ ★ Allied (3)     │  │ Reputation: +12 (Friendly)   ││
│  │ ⚪ NAP (5)        │  │ Trust Score: 34 (estimated)  ││
│  │ ⚔ At War (2)     │  │                              ││
│  │ — Other (40)     │  │ Treaties:                    ││
│  │                  │  │ [Propose NAP] [Propose Alliance]│
│  │ Filter:          │  │                              ││
│  │ [All] [Neighbor] │  │ Recent Actions:              ││
│  │ [Allied] [Hostile│  │ • Traded with you (3 turns ago)│
│  │                  │  │ • Attacked by Warlords (5 ago)│
│  └──────────────────┘  │ • Proposed NAP to Diplomat   ││
│                        │                              ││
│                        │ Observed Behavior:           ││
│                        │ "Prefers trade, avoids war,  ││
│                        │  seeks multiple allies."     ││
│                        │ Likely Archetype: Merchant   ││
│                        └──────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  ACTIVE TREATIES (8)                                    │
│  NAP with: Empire A, Empire B, Empire C...             │
│  Alliance: Empire D, Empire E                           │
│  Coalition: [Anti-Warlord Coalition] (6 members)       │
│      └─> [View Coalition] [Coalition Chat]             │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Treaty Proposal Flow

**Step 1: Select Empire**
- Click empire on starmap OR use diplomacy screen list
- View reputation and recent actions

**Step 2: Choose Treaty Type**
- Buttons: [Propose NAP] [Propose Alliance] [Invite to Coalition]
- Disabled if requirements not met (hover shows reason)

**Step 3: Confirm Proposal**
- Modal: "Propose [Treaty Type] to [Empire]?"
- Shows reputation impact if accepted
- Shows minimum duration
- [Confirm] [Cancel]

**Step 4: Wait for Response**
- Bot responds within same turn (during diplomacy phase)
- Notification: "[Empire] has accepted/rejected your proposal"
- If accepted: Treaty immediately active

### 5.3 Coalition Chat UI

```
┌─────────────────────────────────────────────────────────┐
│  COALITION: Anti-Warlord Coalition              [X]     │
├─────────────────────────────────────────────────────────┤
│  Members (6): You, Diplomat Bot, Merchant Bot, ...      │
│  Goal: Defeat The Warlord Empire                        │
│  Status: Active - Coordinating offensive                │
├─────────────────────────────────────────────────────────┤
│  CHAT LOG (Last 10 turns)                               │
│  ───────────────────────────────────────────────────────│
│  Turn 45:                                               │
│  [Diplomat Bot]: "Warlord has 35 Heavy Cruisers in     │
│                   Sector 5. We should strike there."    │
│  [You]: "I can commit 20 Fighters and 10 Bombers."     │
│  [Merchant Bot]: "I'll blockade their trade routes.    │
│                   Cut their income."                    │
│                                                         │
│  Turn 46:                                               │
│  [Schemer Bot]: "I'll guard our flank. Trust me."      │
│  [Diplomat Bot]: "Coordinated attack next turn.        │
│                   Everyone ready?"                      │
│  [You]: "Ready."                                        │
│                                                         │
│  Turn 47:                                               │
│  ⚠️  [System]: Schemer Bot has BETRAYED THE COALITION! │
│  [Schemer Bot]: "You all trusted me. Now you're weak." │
│  [Diplomat Bot]: "NO! We've been deceived!"            │
│  ───────────────────────────────────────────────────────│
│  [Type message...                              ] [Send] │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Visual Design Principles

**Color Coding:**
- Green: Alliances, high reputation
- Blue: NAPs, neutral relations
- Yellow: At war (justified - defending or coalition)
- Red: At war (aggressor), low reputation
- Purple: Coalition members

**Icons:**
- ★ Alliance
- ⚪ NAP
- 🤝 Coalition
- ⚔ At war
- 💔 Betrayed recently
- 🚫 Pariah (cannot form treaties)

**Reputation Bar:**
Visual bar from -50 (red) to +50 (green) with thresholds marked.

**Treaty Duration:**
Progress bar showing remaining turns until auto-renewal decision.

---

## 6. Specifications

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |

---

### REQ-DIP-001: Treaty Types

**Description:** Two treaty types exist:
- **NAP (Non-Aggression Pact)**: Prevents attacks between empires, minimum 20 turns
- **Alliance**: Provides shared intel, +10% trade income bonus, coordinated attacks (+5% attack vs common enemies), minimum 30 turns

**Rationale:** Enables diplomatic gameplay with meaningful choices. NAP is low-commitment, Alliance is strategic partnership.

**Source:** Section 2.1

**Code:**
- `src/lib/diplomacy/treaties.ts` - Treaty types and validation
- `src/app/actions/diplomacy-actions.ts` - Treaty proposal/accept actions

**Tests:**
- `src/lib/diplomacy/__tests__/treaties.test.ts` - Treaty creation, duration, benefits

**Status:** Draft

---

### REQ-DIP-002: Coalition System

**Description:** Multiple empires can form coalitions:
- Requires 3+ members
- Shared victory condition: Coalition controls 50% of territory
- Provides shared intelligence, coordinated attacks (+5% attack bonus), diplomatic immunity
- Can be dissolved by majority vote or betrayal

**Rationale:** Anti-snowball mechanic to prevent runaway victories. Creates "raid boss" feeling when attacking dominant leader.

**Source:** Section 2.1, Section 3.2

**Code:**
- `src/lib/diplomacy/coalitions.ts` - Coalition formation, membership, benefits
- `src/lib/game/services/coalition-service.ts` - Coalition management

**Tests:**
- `src/lib/game/services/__tests__/coalition-service.test.ts` - Coalition operations

**Status:** Draft

---

### REQ-DIP-003: Reputation System

**Description:** All empires track reputation scores (-100 to +100) for every other empire based on actions:
- Fulfill trade: +2 per turn
- Honor treaties: +1 per turn
- Help weak empire: +5
- Attack unprovoked: -10
- Break NAP: -15
- Break Alliance: -25
- Betray coalition: -40
- Attack leader (7+ VP): +8

**Rationale:** Creates consequences for diplomatic actions. Reputation affects bot behavior and treaty acceptance rates.

**Formula:**
```
reputation_change = base_action_value × visibility_multiplier
visibility_multiplier = 1.0 (all empires see major events)
```

**Key Values:**

| Action | Reputation Change | Visibility |
|--------|-------------------|------------|
| Break Alliance | -25 | All empires |
| Betray Coalition | -40 | All empires |

**Source:** Section 2.2

**Code:**
- `src/lib/diplomacy/reputation.ts` - Reputation tracking, decay
- `src/lib/diplomacy/actions.ts` - Reputation change triggers

**Tests:**
- `src/lib/diplomacy/__tests__/reputation.test.ts` - Reputation calculations

**Status:** Draft

---

### REQ-DIP-004: Trust Score Calculation

**Description:** Each empire maintains trust scores for every other empire:
```
Trust Score = Base Reputation + (Recent Interactions × 2) + Archetype Modifier
```

Trust scores decay toward 0 at 1 point per 5 turns, except major events (betrayals, sector captures) which resist decay.

**Rationale:** Separates short-term opportunism from long-term relationships. Recent actions matter more than ancient history.

**Source:** Section 2.3

**Code:**
- `src/lib/diplomacy/trust.ts` - Trust calculation, decay
- `src/lib/bot/personality.ts` - Archetype trust modifiers

**Tests:**
- `src/lib/diplomacy/__tests__/trust.test.ts` - Trust calculations, decay

**Status:** Draft

---

### REQ-DIP-005: Automatic Coalition Formation

**Description:** When any empire reaches 7+ Victory Points:
1. System broadcasts warning to all empires
2. All empires with mutual trust > 0 receive coalition invitation
3. Bots decide based on archetype behavior (see REQ-BOT-008)
4. Coalition forms with goal: "Defeat [dominant empire]"
5. Coalition disbands when leader drops below 5 VP or is eliminated

Leader receives debuffs:
- +10% attack power to all attackers
- +5% defense when attacked
- Cannot form new alliances

**Rationale:** Prevents runaway victories. Creates dramatic "everyone vs the boss" scenarios.

**Source:** Section 3.2

**Code:**
- `src/lib/game/anti-snowball.ts` - Leader detection, coalition trigger
- `src/lib/diplomacy/coalitions.ts` - Auto-coalition formation

**Tests:**
- `src/lib/game/__tests__/anti-snowball.test.ts` - Coalition trigger thresholds

**Status:** Draft

---

### REQ-DIP-006: Betrayal Mechanics

**Description:** Empires can betray treaties and coalitions:

**Treaty Breaking:**
- Reputation penalty: NAP -15, Alliance -25
- All treaties with target immediately void
- "Betrayed" status on target for 50 turns (-20 trust toward betrayer)

**Coalition Betrayal:**
- Requires explicit "Leave Coalition" action
- Reputation penalty: -40 with all empires
- "Pariah" status: Cannot form new treaties for 30 turns
- Coalition receives notification

**Bot Betrayal Rates by Archetype:**
- Schemer: 95% (always betrays after 20 turns)
- Opportunist: 20% (if coalition weakened)
- Warlord: 0% (never betrays)
- Merchant: 5% (if better economic opportunity)
- Others: <3% (only if trust < -50)

**Rationale:** Creates tension in alliances. Schemer archetype makes all treaties risky. Reputation loss discourages frivolous betrayals.

**Source:** Section 3.3

**Code:**
- `src/lib/diplomacy/betrayal.ts` - Betrayal actions, penalties
- `src/lib/bot/archetype-behavior.ts` - Archetype betrayal logic

**Tests:**
- `src/lib/diplomacy/__tests__/betrayal.test.ts` - Betrayal mechanics
- `src/lib/bot/__tests__/schemer-betrayal.test.ts` - Schemer archetype behavior

**Status:** Draft

---

### REQ-DIP-007: Treaty Duration & Renewal

**Description:** Treaties have minimum durations and auto-renewal:
- NAP: 20 turns minimum
- Alliance: 30 turns minimum
- Auto-renewal: Treaties renew unless explicitly cancelled or trust < 0

Early termination:
- Mutual agreement: No reputation penalty
- Unilateral breaking: Reputation penalty applies

**Rationale:** Prevents exploit of forming/breaking treaties for temporary benefits. Enforces meaningful commitment.

**Source:** Section 3.6

**Code:**
- `src/lib/diplomacy/treaties.ts` - Duration tracking, auto-renewal
- `src/app/actions/diplomacy-actions.ts` - Treaty cancellation

**Tests:**
- `src/lib/diplomacy/__tests__/treaty-duration.test.ts` - Duration, renewal logic

**Status:** Draft

---

### REQ-DIP-008: Diplomatic Victory Condition

**Description:** Coalition achieves victory when controlling 50% of galaxy territory:
- Territory calculated as sum of all coalition members' sectors
- Victory shared among all coalition members
- Game ends with coalition victory screen

**Rationale:** Provides non-military victory path. Encourages cooperation. Alternative to conquest for diplomatic players.

**Source:** Section 2.4

**Code:**
- `src/lib/game/victory.ts` - Diplomatic victory check
- `src/lib/diplomacy/coalitions.ts` - Territory calculation

**Tests:**
- `src/lib/game/__tests__/victory-conditions.test.ts` - Diplomatic victory

**Status:** Draft

---

### REQ-DIP-009: Shared Intelligence (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-DIP-009-A through REQ-DIP-009-D below.

**Overview:** Alliances and coalitions provide four types of shared intelligence: allied territory visibility, attack alerts, coalition chat, and shared vision of enemy units.

**Intel Sharing Types:**
- Allied Territory Visibility [REQ-DIP-009-A]
- Attack Alerts [REQ-DIP-009-B]
- Coalition Chat [REQ-DIP-009-C]
- Shared Vision [REQ-DIP-009-D]

---

### REQ-DIP-009-A: Allied Territory Visibility

**Description:** Players can see allied territories on the starmap with fog of war lifted, revealing sector types and development level.

**Visibility Rules:**
- Fog of war lifted for all allied territories
- Shows: Sector types, sector count, station presence
- Does NOT show: Exact unit counts, resource stockpiles, pending operations
- Updates in real-time as allies gain/lose sectors
- Applies to: Treaties (Alliance, Non-Aggression) and coalitions

**Rationale:** Makes alliances tangibly useful. Players can coordinate strategy, identify weak allies needing support, and plan joint operations.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Shared Intelligence, Territory Visibility

**Code:** TBD - `src/components/game/starmap/Starmap.tsx` - Allied territory rendering

**Tests:** TBD - Verify fog of war lifted for allies, hidden for non-allies

**Status:** Draft

---

### REQ-DIP-009-B: Allied Attack Alerts

**Description:** Players receive real-time notifications when an allied empire is attacked, including attacker identity and location.

**Alert Rules:**
- Trigger: When ally is attacked (combat initiated)
- Message: "[Ally Name] is under attack by [Attacker Name] in [Sector]!"
- Timing: Immediate (real-time notification)
- Applies to: Treaties (Alliance only, NOT Non-Aggression) and coalitions
- Audio: Alert sound for urgency

**Rationale:** Enables coordinated defense and creates dramatic "allies under siege" moments. Builds strategic interdependence.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Shared Intelligence, Attack Alerts

**Code:** TBD - `src/lib/diplomacy/shared-intel.ts` - Attack alert logic

**Tests:** TBD - Verify alerts sent to all allies, not sent to non-allies

**Status:** Draft

---

### REQ-DIP-009-C: Coalition Chat Visibility

**Description:** Human players in coalitions can view bot-to-bot discussions and negotiations, revealing bot personalities and strategies.

**Chat Rules:**
- Visibility: Human players see all bot messages within their coalition
- Bots unaware: Bots don't know humans can see their discussions
- Content: Strategy discussions, betrayal planning, emotional reactions
- Updates: Real-time chat feed in coalition UI panel
- One-way: Humans can view but bots don't see human-to-human chats

**Rationale:** Builds narrative and reveals bot personalities. Creates dramatic irony when bots plot betrayal or discuss human player.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Shared Intelligence, Coalition Chat

**Code:** TBD - `src/components/game/diplomacy/CoalitionChat.tsx` - Chat UI

**Tests:** TBD - Verify human players see bot discussions

**Status:** Draft

> **⚠️ DESIGN NOTE**: Coalition chat is one-way (bots → humans visible, humans → bots not visible). This asymmetry is intentional for narrative purposes.

---

### REQ-DIP-009-D: Shared Vision of Enemy Units

**Description:** Players can see enemy unit counts and types in sectors controlled by allied empires.

**Shared Vision Rules:**
- Trigger: Ally controls a sector
- Visibility: Exact enemy unit counts and types in that sector
- Applies to: All allies (treaties and coalitions)
- Updates: Real-time as units move/engage
- Limitation: Only in allied-controlled sectors (not neutral or enemy sectors)

**Rationale:** Enables tactical coordination. Players can identify threats, plan joint attacks, and warn allies of impending invasions.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7 - Shared Intelligence, Shared Vision

**Code:** TBD - `src/lib/diplomacy/shared-intel.ts` - Unit visibility logic

**Tests:** TBD - Verify unit visibility in allied sectors only

**Status:** Draft

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/diplomacy/shared-intel.ts` - Intelligence sharing orchestration
- `src/lib/diplomacy/__tests__/shared-intel.test.ts` - Comprehensive intel sharing tests

---

### REQ-DIP-010: Reputation Recovery

**Description:** Reputation can be recovered through positive actions:

**Fast Recovery (10+ turns):**
- Fulfill 10+ consecutive trades: +20
- Gift resources to weaker empires: +5 per gift (max 3 per target)
- Join defensive coalition: +15

**Slow Recovery (30+ turns):**
- Maintain peace for 30 turns: +10
- Honor all treaties for 30 turns: +15

**Permanent Scars:**
- Coalition betrayal: -20 permanent (never heals)
- Repeated treaty breaking (3+): -15 permanent

**Rationale:** Allows redemption but makes betrayal costly long-term. Permanent scars ensure major betrayals have lasting consequences.

**Source:** Section 3.4

**Code:**
- `src/lib/diplomacy/reputation.ts` - Recovery logic, permanent scars
- `src/lib/game/turn-processing.ts` - Reputation recovery per turn

**Tests:**
- `src/lib/diplomacy/__tests__/reputation-recovery.test.ts` - Recovery mechanics

**Status:** Draft

---

### Specification Summary

| ID | Title | Status |
|----|-------|--------|
| REQ-DIP-001 | Treaty Types | Draft |
| REQ-DIP-002 | Coalition System | Draft |
| REQ-DIP-003 | Reputation System | Draft |
| REQ-DIP-004 | Trust Score Calculation | Draft |
| REQ-DIP-005 | Automatic Coalition Formation | Draft |
| REQ-DIP-006 | Betrayal Mechanics | Draft |
| REQ-DIP-007 | Treaty Duration & Renewal | Draft |
| REQ-DIP-008 | Diplomatic Victory Condition | Draft |
| REQ-DIP-009 | Shared Intelligence | Draft |
| REQ-DIP-010 | Reputation Recovery | Draft |

**Total Specifications:** 10
**Implemented:** 0
**Validated:** 0
**Draft:** 10

---

## 7. Implementation Requirements

Implementation details including database schemas, service architecture, and UI components are documented in the appendix.

**See:** [DIPLOMACY-SYSTEM-APPENDIX.md](appendix/DIPLOMACY-SYSTEM-APPENDIX.md)

### 7.1 Key Files

| Component | Path |
|-----------|------|
| Treaty Service | `src/lib/diplomacy/treaties.ts` |
| Coalition Service | `src/lib/diplomacy/coalitions.ts` |
| Reputation Tracker | `src/lib/diplomacy/reputation.ts` |
| Trust Calculator | `src/lib/diplomacy/trust.ts` |
| Diplomacy Actions | `src/app/actions/diplomacy-actions.ts` |
| Diplomacy Screen | `src/components/game/diplomacy/DiplomacyScreen.tsx` |
| Coalition Chat | `src/components/game/diplomacy/CoalitionChat.tsx` |
| Treaty Panel | `src/components/game/diplomacy/TreatyPanel.tsx` |

### 7.2 Database Tables

| Table | Purpose |
|-------|---------|
| `treaties` | Active treaties between empires |
| `coalitions` | Coalition membership and goals |
| `reputation_scores` | Empire-to-empire reputation tracking |
| `trust_scores` | Calculated trust scores with decay |
| `diplomatic_events` | Historical log of diplomatic actions |

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement |
|--------|--------|-----------|-------------|
| Coalition formation rate (games with leader at 7+ VP) | 85% | ±10% | Game log analysis |
| Schemer betrayal rate | 90%+ | ±5% | Archetype behavior tracking |
| Average treaties per game | 8-12 | ±3 | Treaty creation count |
| Diplomatic victory rate | 10-15% | ±5% | Victory condition analysis |
| Treaty break rate (non-Schemer) | <5% | ±2% | Treaty status tracking |
| Reputation recovery time (from -40) | 40-60 turns | ±10 turns | Reputation log analysis |

### 8.2 Coalition Formation Triggers

**Target:** 7+ VP threshold triggers coalition in 85% of games

**Variables:**
- Leader VP threshold: 7
- Trust threshold for joining: 0+
- Archetype acceptance rates (see Bot Integration)

**Success Criteria:**
- Coalition forms within 3 turns of trigger
- 40-60% of empires join coalition
- Coalition successfully stops leader in 60-70% of cases

### 8.3 Playtest Checklist

- [ ] Auto-coalition forms when player reaches 7 VP
- [ ] Schemer archetype betrays coalitions after 20 turns (>90% of games)
- [ ] Reputation loss from betrayal prevents new treaties for 10+ turns
- [ ] Diplomatic victory achievable through coalition strategy
- [ ] Coalition chat shows bot personality (players can identify archetypes)
- [ ] Breaking alliance feels costly (reputation impact observable)
- [ ] Players report "bots hold grudges" after betrayals
- [ ] Trust scores decay appropriately (minor actions forgotten, major remembered)
- [ ] Alliance provides tangible benefit (+10% trade, shared intel)
- [ ] NAP provides meaningful non-aggression guarantee

---

## 9. Migration Plan

### 9.1 Development Path

**Phase 1: Core Treaties (M6-M7)**
1. Create `treaties` and `reputation_scores` tables
2. Implement treaty proposal/accept/break actions
3. Build reputation tracking system
4. Create basic diplomacy UI (treaty panel)

**Phase 2: Bot Integration (M8-M9)**
5. Implement bot treaty acceptance logic per archetype
6. Add bot diplomatic messages (30-45 templates)
7. Integrate with bot turn processing

**Phase 3: Coalitions (M10-M11)**
8. Create `coalitions` table
9. Implement coalition formation (voluntary and automatic)
10. Build coalition chat UI
11. Implement shared intelligence

**Phase 4: Betrayal & Polish (M12-M13)**
12. Implement betrayal mechanics and reputation penalties
13. Add Schemer betrayal logic (after 20 turns)
14. Test diplomatic victory condition
15. Balance tuning and playtest

### 9.2 Database Schema

```sql
-- Treaties table
CREATE TABLE treaties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_a_id UUID NOT NULL REFERENCES empires(id),
  empire_b_id UUID NOT NULL REFERENCES empires(id),
  treaty_type TEXT NOT NULL, -- 'NAP' or 'ALLIANCE'
  created_turn INTEGER NOT NULL,
  expires_turn INTEGER NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active', -- 'active', 'broken', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coalitions table
CREATE TABLE coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT NOT NULL, -- e.g., "Defeat The Warlord Empire"
  created_turn INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'dissolved', 'victory'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coalition membership table
CREATE TABLE coalition_members (
  coalition_id UUID REFERENCES coalitions(id),
  empire_id UUID REFERENCES empires(id),
  joined_turn INTEGER NOT NULL,
  role TEXT DEFAULT 'member', -- 'founder', 'member'
  PRIMARY KEY (coalition_id, empire_id)
);

-- Reputation scores table
CREATE TABLE reputation_scores (
  empire_id UUID REFERENCES empires(id),
  target_empire_id UUID REFERENCES empires(id),
  reputation INTEGER DEFAULT 0, -- -100 to +100
  permanent_scar INTEGER DEFAULT 0, -- Cannot be healed
  last_updated_turn INTEGER,
  PRIMARY KEY (empire_id, target_empire_id)
);

-- Diplomatic events log
CREATE TABLE diplomatic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_number INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- 'treaty_proposed', 'treaty_accepted', 'treaty_broken', 'coalition_formed', 'betrayal'
  actor_empire_id UUID REFERENCES empires(id),
  target_empire_id UUID REFERENCES empires(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_treaties_empires ON treaties(empire_a_id, empire_b_id);
CREATE INDEX idx_treaties_status ON treaties(status);
CREATE INDEX idx_coalition_members_empire ON coalition_members(empire_id);
CREATE INDEX idx_reputation_empire ON reputation_scores(empire_id);
CREATE INDEX idx_diplomatic_events_turn ON diplomatic_events(turn_number);
```

### 9.3 Testing Requirements

**Unit Tests:**
- [ ] Treaty creation with minimum duration validation
- [ ] Reputation change calculations
- [ ] Trust score calculation and decay
- [ ] Coalition formation logic (automatic and voluntary)
- [ ] Betrayal reputation penalties
- [ ] Treaty auto-renewal logic

**Integration Tests:**
- [ ] Bot accepts/rejects treaties based on archetype
- [ ] Coalition forms when leader reaches 7 VP (90%+ of tests)
- [ ] Schemer betrays after 20 turns (95%+ of tests)
- [ ] Shared intelligence reveals allied territories
- [ ] Diplomatic victory triggers at 50% territory

**Balance Tests:**
- [ ] 1000-game simulation: Coalition formation rate = 85% ±10%
- [ ] Reputation recovery from -40 takes 40-60 turns
- [ ] Diplomatic victory occurs in 10-15% of games

---

## 10. Conclusion

### Key Decisions

- **Two treaty types (NAP, Alliance):** Provides clear progression from low-commitment to strategic partnership
- **Reputation + Trust scores:** Separates public reputation from private trust, allowing nuanced bot behavior
- **Automatic coalitions at 7 VP:** Anti-snowball mechanic prevents runaway victories
- **Schemer archetype betrays reliably:** Creates tension and narrative drama in all alliances
- **Diplomatic victory at 50% coalition territory:** Provides non-military win condition

### Open Questions

- None currently - all design questions resolved during specification

### Dependencies

- **Depends On:** BOT-SYSTEM (archetype behavior, decision logic), COMBAT-SYSTEM (coordinated attack bonuses), VICTORY-SYSTEM (diplomatic victory condition)
- **Depended By:** FRONTEND-DESIGN (diplomacy UI, coalition chat), TURN-PROCESSING (diplomacy phase execution)

---

## Appendix Reference

Full implementation code examples available in:
- [DIPLOMACY-SYSTEM-APPENDIX.md](appendix/DIPLOMACY-SYSTEM-APPENDIX.md) - Database schemas, service architecture, UI components, message templates

---

**END SPECIFICATION**
