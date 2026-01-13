# Tech Card System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-TECH
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** 4-tier crafting supply chain concept (explicitly rejected)

---

## Document Purpose

This document defines the **Technology Card (Tech Card) draft system** for Nexus Dominion. Tech Cards provide tactical combat advantages and hidden objectives that complement the Research system's strategic bonuses.

The Tech Card system replaces the originally proposed 4-tier crafting supply chain (22 resources, logistics management) with a streamlined card draft mechanic. This design choice prioritizes strategic decision-making over micromanagement while maintaining depth through card synergies and counter-play.

**Who Should Read This:**
- **Game Designers**: Understand the 3-tier card system and balance targets
- **Developers**: Implement draft mechanics, combat integration, and database schema
- **Testers**: Validate card effects, balance targets, and bot decision-making

**Design Philosophy:**
- **Draft, Don't Manage** — Pick from options, don't run supply chains
- **Visible Decisions** — Public drafts create counter-play and bot drama
- **Combat Integration** — Every card directly affects battles
- **Hidden Objectives** — Lord of Waterdeep-style end-game reveals
- **Tactical vs Strategic** — Cards provide situational advantages, Research provides permanent identity
- **Boardgame Feel** — Simple card effects, visual choices, immediate impact

**Relationship to Research:**
- **Research = Foundation:** Permanent empire-wide stat modifiers (+2 STR, +4 AC)
- **Tech Cards = Tactical Layer:** Situational combat advantages (+2 first round, cloaking)
- **Combined Effect:** War Machine doctrine (+2 STR) + Plasma Torpedoes (+2 first round) = +4 STR opening salvo

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

### 1.1 Three-Tier Card System

Tech Cards replace crafting supply chains with strategic card drafting. The system consists of three distinct tiers, each serving a different strategic purpose:

| Tier | Name | Draw Timing | Visibility | Purpose |
|------|------|-------------|------------|---------|
| **Tier 1** | Hidden Objectives | Turn 1 (once) | Revealed at game end | Secret scoring conditions |
| **Tier 2** | Tactical Cards | Every 10 turns | Public draft | Combat advantages |
| **Tier 3** | Legendary Cards | Turn 50+ | Public announcement | Game-changing abilities |

**Turn 1 (Hidden Objective):**
- Draw 3 Tier 1 cards
- Keep 1 (hidden from all players)
- Reveals at game end for bonus Victory Points

**Every 10 turns (Tactical Draft):**
- Turn 10: Draw 3 Tier 2 cards, pick 1 (public)
- Turn 20: Draw 3 Tier 2 cards, pick 1 (public)
- Turn 30: Draw 3 Tier 2 cards, pick 1 (public)
- Turn 50+: Tier 3 Legendary cards enter draft pool

### 1.2 Draft as Strategic Choice

**Key Mechanic:**
- Drafts are **public** (all players see what you picked)
- Hand is **public** (enemies know what cards you have)
- Hidden objective is **private** (no one knows your T1 card)
- Usage is **visible** (combat log shows which card activated)

This visibility creates natural counter-play: when Emperor Varkus drafts Plasma Torpedoes, savvy opponents will draft Shield Arrays to counter the first-strike bonus.

### 1.3 Integration with Research

Tech Cards stack multiplicatively with Research bonuses, creating powerful synergies:

**Example Combo: "Alpha Strike Warlord"**

Foundation (Research):
- Doctrine: War Machine (+2 STR to all units)
- Specialization: Shock Troops (surprise round)

Tactical Layer (Tech Cards):
- Plasma Torpedoes (+2 damage first round)
- Ion Cannons (disable enemy stations)

Combined Effect in Combat:
- Surprise round (Shock Troops)
- Base STR 14 (+2) → STR 16 (+3)
- +2 damage first round (Plasma Torpedoes)
- Effective first strike: 2d8+5 damage before enemy acts
- Ion Cannons shut down defense stations

Counter: Fortress + Shield Arrays (negates surprise round)

**Why Both Systems Work Together:**
1. Research provides **empire-wide permanent bonuses**
2. Tech Cards provide **tactical situational advantages**
3. Neither is redundant—they stack multiplicatively
4. Counter-play exists at both layers

---

## 2. Mechanics Overview

### 2.1 Card Anatomy

Every Tech Card follows a standard format for clarity and consistency:

```
┌─────────────────────────────────┐
│ PLASMA TORPEDOES         [T2]  │ ← Card name + tier
├─────────────────────────────────┤
│                                 │
│  "The first volley decides      │ ← Flavor text
│   most battles."                │
│                                 │
│  ───────────────────────────    │
│                                 │
│  COMBAT: +2 damage in first     │ ← Mechanical effect (D20)
│  round of combat                │
│                                 │
│  VISIBLE: Enemies see a         │ ← Visual indicator
│  "torpedo" icon on your fleet   │
│                                 │
│  COUNTER: Shield Arrays         │ ← Rock-paper-scissors
│  reduce effect to +1 damage     │
│                                 │
├─────────────────────────────────┤
│  Cost: 2,000 cr + 50 ore        │ ← Activation cost
│  Activation: Turn 20+           │ ← Unlock requirement
└─────────────────────────────────┘
```

**Card Elements:**

**Top Bar:**
- Card name (descriptive, thematic)
- Tier indicator [T1]/[T2]/[T3]

**Flavor Text:**
- 1-2 lines establishing theme
- Not mechanically relevant

**Effect Block:**
- COMBAT: Mechanical effect using D20 terms
- VISIBLE: What enemies see when you use it
- COUNTER: Which cards or strategies negate this

**Footer:**
- Cost: Credits/resources to activate (if any)
- Activation: Turn requirement or prerequisite

### 2.2 Card Tier Summary

| Tier | Purpose | Example | Mechanical Impact | VP Impact |
|------|---------|---------|-------------------|-----------|
| **T1** | Secret scoring conditions | Warmonger's Arsenal (+2 VP per empire eliminated) | None during gameplay | +2-8 VP avg |
| **T2** | Combat advantages | Plasma Torpedoes (+2 first round damage) | +10-20% win rate | None |
| **T3** | Game-changing abilities | Planet Cracker (destroy 1 planet permanently) | +30-50% swing | Varies |

### 2.3 Draft Schedule

| Turn | Event | Cards Offered | Visibility |
|------|-------|---------------|------------|
| 1 | Hidden Objective | 3 T1 cards, keep 1 | Private |
| 10 | First Tactical Draft | 3 T2 cards, pick 1 | Public |
| 20 | Second Tactical Draft | 3 T2 cards, pick 1 | Public |
| 30 | Third Tactical Draft | 3 T2 cards, pick 1 | Public |
| 40 | Fourth Tactical Draft | 3 T2 cards, pick 1 | Public |
| 50+ | Legendary Drafts | 3 cards (1-2 may be T3) | Public |

---

## 3. Detailed Rules

### 3.1 Tier 1: Hidden Objectives

**Purpose:**

Hidden objectives create **Lord of Waterdeep-style secret scoring** where players don't know each other's end-game goals.

**Design Goal:**
- Encourage diverse playstyles (not everyone rushes conquest)
- Create post-game "reveal" moments
- Add replayability (different objectives each game)
- Reward player creativity

**Hidden Objective Card Pool:**

| Card | Scoring Condition | VP Reward | Reveal Text |
|------|-------------------|-----------|-------------|
| **Warmonger's Arsenal** | +2 VP per empire eliminated | 0-10 VP | "My weapons were always destined for conquest." |
| **Merchant's Ledger** | +1 VP per 25,000 credits earned | 0-8 VP | "Every transaction brought me closer to victory." |
| **Diplomat's Archive** | +3 VP per active treaty at game end | 0-9 VP | "My alliances were my true strength." |
| **Survivor's Grit** | +5 VP if never lost a planet | 5 VP (all or nothing) | "They never touched my homeworld." |
| **Opportunist's Eye** | +2 VP per planet captured from top 3 empires | 0-10 VP | "I only struck the mighty." |
| **Tech Supremacy** | +3 VP if reached Tier 3 research first | 3 VP | "I led the galaxy into the future." |
| **Economic Hegemon** | +2 VP per 50,000 net worth at end | 0-10 VP | "Wealth is the only true power." |
| **Fortress Builder** | +2 VP per 10 defense stations built | 0-10 VP | "My walls outlasted their armies." |
| **Fleet Admiral** | +1 VP per 50 space units built | 0-10 VP | "I commanded the largest armada." |
| **Shadow Operator** | +4 VP if completed 2+ Syndicate contracts | 4 VP | "The Syndicate remembers its own." |
| **Peacekeeper** | +3 VP if never declared offensive war | 3 VP | "I won through diplomacy alone." |
| **Research Pioneer** | +2 VP per Research planet controlled at end | 0-10 VP | "Knowledge built my empire." |

**Total Pool:** 12 cards (ensures variety, players draw 3 and keep 1)

**Mechanics:**

**At Game Start:** <!-- @spec REQ-TECH-002 -->
1. Each player draws 3 random Tier 1 cards
2. Selects 1 to keep (hidden from all players)
3. Returns 2 to deck (not shown)

**During Game:**
- Objective is secret (not displayed in UI to anyone)
- Player sees reminder in "Objectives" panel
- No mechanical effect during gameplay

**At Game End:** <!-- @spec REQ-TECH-006 -->
- All hidden objectives revealed simultaneously
- VP calculated and added to final score
- Victory screen shows all players' objectives
- Creates "aha!" moments ("So THAT'S why they were hoarding planets!")

### 3.2 Tier 2: Tactical Cards

**Purpose:**

Tier 2 cards provide **combat advantages** that combine with Research bonuses to create diverse tactical options.

**Design Goal:**
- Add tactical depth without strategic complexity
- Create visible counter-play (public drafts)
- Enable bot drama and reactions
- Stack multiplicatively with Research bonuses

**Tier 2 Card Catalog (20 Cards):**

#### Offensive Cards

| Card | Combat Effect (D20) | Counter | Cost |
|------|---------------------|---------|------|
| **Plasma Torpedoes** | +2 damage in first round | Shield Arrays | 2,000 cr + 50 ore |
| **Ion Cannons** | Disable enemy stations for 1 turn (AC becomes 10) | Hardened Circuits | 3,000 cr + 30 petroleum |
| **Boarding Parties** | Capture 5% of defeated enemy units instead of destroying | Point Defense | 1,500 cr + 20 ore |
| **Overcharged Weapons** | +1 damage, but -1 AC during combat | None (risky trade-off) | 2,500 cr |
| **Focus Fire Protocol** | +4 to hit vs single target, -2 vs others | Dispersed formation | 1,000 cr |

#### Defensive Cards

| Card | Combat Effect (D20) | Counter | Cost |
|------|---------------------|---------|------|
| **Shield Arrays** | Negate first-strike effects (surprise rounds) | Siege weapons | 3,000 cr + 40 ore |
| **Point Defense** | -2 to enemy first-round damage | EMP Burst | 2,000 cr + 25 ore |
| **Hardened Circuits** | Immune to Ion Cannon effects | Kinetic weapons | 2,500 cr |
| **Regenerative Hull** | Recover 10% HP after battle (win or lose) | Plasma Torpedoes (overkill) | 3,500 cr + 30 ore |
| **Emergency Shields** | +2 AC when below 50% HP | None (reactive) | 2,000 cr |

#### Utility Cards

| Card | Combat Effect (D20) | Counter | Cost |
|------|---------------------|---------|------|
| **Cloaking Field** | Enemy attacks at -4 to hit first round | Scanner Arrays | 4,000 cr + 50 petroleum |
| **Scanner Arrays** | Negate enemy Cloaking Field | None (pure counter) | 2,000 cr |
| **EMP Burst** | Cancel all enemy tech card effects this battle | Shielded Core | 5,000 cr (one-use) |
| **Shielded Core** | Immune to EMP Burst | None (defensive) | 3,000 cr |
| **Repair Drones** | +1 HP regeneration per turn during combat | None (sustain) | 2,500 cr |

#### Economic Cards

| Card | Combat Effect (D20) | Counter | Cost |
|------|---------------------|---------|------|
| **Salvage Operations** | Gain 25% of enemy losses as credits (win only) | Scorched earth tactics | Free |
| **Rapid Deployment** | Built units cost -10% for 5 turns after victory | None (economic) | 3,000 cr |
| **War Bonds** | Gain 5,000 credits per enemy empire you attack | None (aggressive incentive) | Free |

#### Special Cards

| Card | Combat Effect (D20) | Counter | Cost |
|------|---------------------|---------|------|
| **Morale Boost** | +1 to all rolls when defending homeworld | None (situational) | Free |
| **Kamikaze Doctrine** | Deal +5 damage before death (units at 0 HP) | None (desperation) | Free |

**Total Pool:** 20 cards ensures draft variety (draw 3, pick 1 = 1,140 possible combinations over 4 drafts)

**Draft Process:** <!-- @spec REQ-TECH-003 -->
1. Game pauses at start of turn
2. Modal displays 3 random cards
3. Player has full turn to decide (no timer)
4. Selection is **public** (all players notified)
5. Card added to player's hand immediately
6. Card usable in next combat

### 3.3 Tier 3: Legendary Cards

**Purpose:**

Tier 3 cards are **game-changing abilities** that create dramatic late-game moments and comebacks.

**Design Goal:**
- Late-game escalation (Turn 50+)
- Dramatic announcements (like Research capstones)
- High-risk, high-reward choices
- Enable comebacks for struggling players

**Legendary Card Catalog (8 Cards):**

| Card | Effect | Announcement | Cost | Use Limit |
|------|--------|--------------|------|-----------|
| **Planet Cracker** | Destroy 1 planet permanently (remove from game) | "THE WEAPON IS ARMED. A world will die." | 50,000 cr | One-use |
| **Dyson Swarm** | Double income from all planets (permanent) | "Infinite energy flows to my empire." | 75,000 cr | Permanent |
| **Mind Control Array** | Force one bot to attack another (1 turn) | "Their admiral now serves me." | 40,000 cr | 3 uses |
| **Temporal Stasis** | Skip target player's turn (including yourself) | "Time itself bends to my will." | 60,000 cr | One-use |
| **Genesis Device** | Create a new habitable planet in empty space | "Where there was void, now there is life." | 80,000 cr | One-use |
| **Galactic Broadcast** | Reveal all hidden information (specs, Syndicate, etc.) | "All secrets laid bare." | 30,000 cr | One-use |
| **Quantum Superweapon** | Destroy all enemy units in 1 sector | "Witness obliteration." | 100,000 cr | One-use |
| **Economic Collapse** | Reduce target empire's credits to 0 | "Their economy crumbles to dust." | 50,000 cr | One-use |

**Legendary Draft Mechanics:** <!-- @spec REQ-TECH-004 -->

**Availability:**
- Enter draft pool at Turn 50
- Appear alongside T2 cards (now draw 3, 1-2 may be T3)
- Rarity: 30% chance per draft slot after Turn 50

**Single-Use vs Permanent:**

Based on playtesting goals, we use a **hybrid model**:
- **Destructive cards:** One-use (Planet Cracker, Quantum Superweapon)
  - Rationale: Too powerful to repeat, creates dramatic moment
- **Economic cards:** Permanent (Dyson Swarm)
  - Rationale: Late-game reward for investing in draft
- **Utility cards:** Limited uses (Mind Control: 3 uses)
  - Rationale: Reusable but not spammable

This prevents "optimal save syndrome" (hoarding cards) while maintaining power fantasy.

### 3.4 Draft Events

**Draft Order:** <!-- @spec REQ-TECH-009 -->

**Random draft order each event:**
1. Game rolls initiative: d20 + CHA modifier per empire
2. Highest roll drafts first
3. Descending order

**Example Turn 10 Draft:**
```
Draft Order (d20 + CHA):
1. Lady Chen (19+4 CHA = 23)
2. Emperor Varkus (15+2 CHA = 17)
3. Player (12+1 CHA = 13)
...

Lady Chen sees: [Plasma Torpedoes, Shield Arrays, Ion Cannons]
Lady Chen picks: Shield Arrays (defensive, fits Turtle archetype)

Emperor Varkus sees: [Boarding Parties, Cloaking Field, Point Defense]
(Plasma Torpedoes no longer available—Chen took it out of pool)
Varkus picks: Boarding Parties (offensive, fits Warlord)

Player sees: [Regenerative Hull, Salvage Ops, Morale Boost]
Player picks: Regenerative Hull
```

**No Card Duplication:**
- Once drafted, card removed from pool for this event
- Next draft (Turn 20), all cards reset
- Ensures uniqueness and forces adaptation

**Draft Drama:**

Bot Reactions to Draft Picks:
```
[Turn 10: Lady Chen drafts Shield Arrays]

[Emperor Varkus]: "Shield Arrays? Coward's technology.
                   I'll break through regardless."

[The Collective]: "Wise choice. Defense wins wars."

[Player's Advisor]: "Intelligence Report: Lady Chen now counters
                     Shock Troops specializations. Adjust strategy
                     accordingly."
```

Draft creates immediate strategic conversation:
- Bots comment on picks
- Players adjust plans based on enemy cards
- Counter-play emerges naturally

### 3.5 Combat Integration

**Card Activation:**

**Automatic Activation:**
- Cards activate automatically in combat when conditions met
- Example: Plasma Torpedoes activates in first round without player input
- Simplifies gameplay (no micro-management)

**Conditional Activation:**
- Legendary cards require manual activation (button in combat UI)
- Example: Planet Cracker must be explicitly used (prevents accidents)

**Combat Flow with Cards:**

Standard Combat (No Cards):
```
1. Initiative rolls (d20 + DEX)
2. Higher initiative attacks first
3. Attack rolls (d20 + BAB + mods vs AC)
4. Damage rolls (dice + STR)
5. Repeat until one side eliminated
```

Combat with Tier 2 Cards:
```
1. Check for surprise rounds (Research: Shock Troops, Cards: First-strike effects)
2. Apply card modifiers:
   - Plasma Torpedoes: +2 damage first round
   - Shield Arrays: Negate surprise round
   - Cloaking Field: Enemy -4 to hit first round
3. Initiative rolls (d20 + DEX + card modifiers)
4. Combat proceeds with card effects active
5. Post-combat effects:
   - Regenerative Hull: Recover 10% HP
   - Salvage Operations: Gain credits from enemy losses
```

**Combined System Example:**

Scenario: War Machine Empire with Plasma Torpedoes vs Fortress Empire with Shield Arrays

```
EMPIRE A: War Machine + Shock Troops + Plasma Torpedoes
EMPIRE B: Fortress + Shield Arrays + Point Defense

COMBAT RESOLUTION:

ROUND 0 (Surprise Attempt):
- Empire A attempts Shock Troops surprise round
- Empire B Shield Arrays: Negates surprise round
- Result: No surprise, proceed to initiative

ROUND 1 (Initiative):
- Empire A Heavy Cruiser: Init +1
- Empire B Defense Station: Init +0
- Empire A goes first

ROUND 1 (Empire A attacks):
- Base: STR 16 (+3), Attack +7, Damage 2d8+3
- War Machine doctrine: +2 STR → STR 18 (+4), Damage 2d8+4
- Plasma Torpedoes: +2 first round → Damage 2d8+6
- Attack roll: d20+7 vs AC 17 (Fortress +4 defending)
  - Rolls 13 + 7 = 20 → HIT
- Damage: 2d8+6 = (5+7)+6 = 18 damage

ROUND 1 (Empire B counter-attacks):
- Base: STR 12 (+1), Attack +3, Damage 1d8+1
- Fortress doctrine: +4 AC (already applied)
- Point Defense: -2 to enemy first-round damage (too late, A already attacked)
- Attack roll: d20+3 vs AC 15
  - Rolls 9 + 3 = 12 → MISS

ROUND 2:
- Plasma Torpedoes effect expired (first round only)
- Empire A now 2d8+4 damage (still +2 STR from doctrine)
- Combat continues normally...

RESULT: Empire A wins due to stacked bonuses, but Empire B's Shield Arrays
prevented total dominance by negating surprise round.
```

**Key Insight:** Research + Tech Cards stack multiplicatively:
- War Machine alone: +2 STR
- Plasma Torpedoes alone: +2 first round
- Combined: +4 effective STR in opening salvo

But counters exist at both layers:
- Shield Arrays (Tech Cards) negates Shock Troops (Research)
- Fortress doctrine (Research) reduces effectiveness of Plasma Torpedoes (Tech Cards)

---

## 4. Bot Integration

### 4.1 Archetype Preferences

| Archetype | Preferred T1 Objective | Preferred T2 Cards | T3 Priority |
|-----------|------------------------|-----------------------|-------------|
| **Warlord** | Warmonger's Arsenal | Plasma Torpedoes, Ion Cannons | Planet Cracker, Quantum Superweapon |
| **Turtle** | Survivor's Grit | Shield Arrays, Point Defense | Genesis Device (expand safely) |
| **Diplomat** | Diplomat's Archive | Morale Boost, Salvage Operations | Mind Control (force conflicts) |
| **Merchant** | Merchant's Ledger | Salvage Ops, War Bonds | Dyson Swarm, Economic Collapse |
| **Tech Rush** | Tech Supremacy | Repair Drones, Regenerative Hull | Dyson Swarm (accelerate research) |
| **Schemer** | Opportunist's Eye | Cloaking Field, EMP Burst | Mind Control, Galactic Broadcast |
| **Blitzkrieg** | Warmonger's Arsenal | Overcharged Weapons, Focus Fire | Temporal Stasis (delay enemies) |
| **Opportunist** | Opportunist's Eye | Boarding Parties, Salvage Ops | Economic Collapse (weaken targets) |

### 4.2 Bot Draft Decision Logic

Bot decision-making follows archetype preferences with strategic awareness. Complete decision logic pseudocode available in [Appendix: Bot Decision Logic](appendix/TECH-CARD-SYSTEM-APPENDIX.md#bot-decision-logic).

**Tier 1 (Hidden Objective):**
- 90% follow archetype preference
- 10% random (unpredictability)

**Tier 2 (Tactical Cards):**
- Strategic bots analyze synergies with Research doctrine
- Reactive bots pick based on current game state
- Counter-picking: If enemy has Shock Troops, draft Shield Arrays
- Chaotic bots pick randomly

**Tier 3 (Legendary Cards):**
- Desperate bots (bottom 25%) prioritize comeback cards
- Dominant bots (top 10%) prioritize finishing cards
- Default: Follow archetype preference

### 4.3 Bot Messages

**Draft Announcement Messages:**
```
[Warlord drafts Plasma Torpedoes]:
"Plasma Torpedoes. Your shields mean nothing now."

[Turtle drafts Shield Arrays]:
"Shield Arrays installed. Come test them if you dare."

[Merchant drafts Salvage Operations]:
"Every battle is a business opportunity."

[Schemer drafts Cloaking Field]:
"I've acquired... something useful. You'll see. Or won't."
```

**Card Usage Messages (Combat Log):**
```
[Plasma Torpedoes activated]:
"Emperor Varkus: 'First strike protocols engaged. Fire!'"

[Shield Arrays blocks surprise round]:
"Lady Chen: 'Your surprise attack bounces off my shields.
             Did you really think I wouldn't prepare?'"

[Planet Cracker used]:
"Admiral Zhen: 'Forgive me. But this is war.'
 [Target planet obliterated]"
```

**Reactions to Enemy Cards:**
```
[Player drafts EMP Burst]:

[Strategic Bot]: "EMP technology detected. Recommendation:
                  Draft Shielded Core next opportunity."

[Warlord Bot]: "You think EMP will save you? Cute."

[Turtle Bot]: *Immediately begins building more defense stations*
```

---

## 5. UI/UX Design

### 5.1 Card Display

**Player Hand (Your Cards):**
```
┌─────────────────────────────────────────────────────────┐
│ YOUR TECH CARDS                                    [4/5]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ 💥   │ │ 🛡️   │ │ ⚡    │ │ 🔧   │                   │
│  │Plasma│ │Shield│ │ Ion  │ │Repair│                   │
│  │Torps │ │Arrays│ │Canon │ │Drone │                   │
│  │      │ │      │ │      │ │      │                   │
│  │[T2]  │ │[T2]  │ │[T2]  │ │[T2]  │                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│  [DETAILS] [DETAILS] [DETAILS] [DETAILS]               │
│                                                         │
│  Hidden Objective: 🔒 [MERCHANT'S LEDGER]               │
│  Progress: 125,000 credits earned → +5 VP (est.)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Enemy Card Display (Known Cards):**
```
┌─────────────────────────────┐
│ EMPEROR VARKUS              │
│ War Machine · Shock Troops  │
├─────────────────────────────┤
│ Known Tech Cards:           │
│  🛡️ Shield Arrays           │
│  💥 Plasma Torpedoes         │
│  ⚡ Ion Cannons              │
│                             │
│ Hidden Objective: ???       │
│ (Revealed at game end)      │
└─────────────────────────────┘
```

### 5.2 Draft Modal

**Turn 10 Draft Event:**
```
┌─────────────────────────────────────────────────────────┐
│              ⚡ TECH CARD DRAFT - TURN 10 ⚡             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your turn to draft. Choose 1 of 3 cards:              │
│                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │  💥        │ │  🛡️        │ │  ⚡        │          │
│  │  PLASMA    │ │  SHIELD    │ │  ION       │          │
│  │  TORPEDOES │ │  ARRAYS    │ │  CANNONS   │          │
│  │            │ │            │ │            │          │
│  │ +2 damage  │ │ Negate     │ │ Disable    │          │
│  │ first rnd  │ │ surprise   │ │ stations   │          │
│  │            │ │ rounds     │ │ 1 turn     │          │
│  │            │ │            │ │            │          │
│  │ Counter:   │ │ Counter:   │ │ Counter:   │          │
│  │ Shield     │ │ Siege      │ │ Hardened   │          │
│  │ Arrays     │ │ weapons    │ │ Circuits   │          │
│  │            │ │            │ │            │          │
│  │ [SELECT]   │ │ [SELECT]   │ │ [SELECT]   │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                         │
│  ⚠️ Your choice will be public (all players see)        │
│  ⚠️ This card is permanent (cannot be undrafted)        │
│                                                         │
│  Draft order: You are 3rd of 50 empires                │
│  Cards already taken: Salvage Ops, War Bonds           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Combat Card Display

**During Combat:**
```
┌─────────────────────────────────────────────────────────┐
│ COMBAT: Your Fleet vs Enemy Station                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Your Active Cards:                                      │
│  💥 Plasma Torpedoes → +2 damage this round            │
│  🔧 Repair Drones → +1 HP per turn                     │
│                                                         │
│ Enemy Active Cards:                                     │
│  🛡️ Shield Arrays → Your Shock Troops negated          │
│  🔫 Point Defense → -2 to your first-round damage      │
│                                                         │
│ Net Effect:                                             │
│  Your damage: 2d8+4 (+2 from Torpedoes, -2 from PD)    │
│  Enemy AC: 17 (Fortress +4)                             │
│  Enemy HP: 25 → 24 (Repair Drones)                     │
│                                                         │
│ [ATTACK] [RETREAT] [USE LEGENDARY CARD]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.4 End-Game Reveal

**Hidden Objectives Reveal Screen:**
```
┌─────────────────────────────────────────────────────────┐
│              🎭 HIDDEN OBJECTIVES REVEALED 🎭            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  The game is over. Secrets now come to light.          │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 🏆 YOU: Merchant's Ledger                      │     │
│  │ "Every transaction brought me closer."        │     │
│  │ Credits earned: 225,000                       │     │
│  │ Bonus: +9 VP (1 per 25k)                      │     │
│  │ Final Score: 156 → 165 VP                     │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ ⚔️ EMPEROR VARKUS: Warmonger's Arsenal        │     │
│  │ "My weapons were destined for conquest."      │     │
│  │ Empires eliminated: 7                         │     │
│  │ Bonus: +14 VP (2 per elimination)             │     │
│  │ Final Score: 142 → 156 VP                     │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 🛡️ LADY CHEN: Survivor's Grit                 │     │
│  │ "They never touched my homeworld."            │     │
│  │ Planets lost: 0                               │     │
│  │ Bonus: +5 VP                                  │     │
│  │ Final Score: 98 → 103 VP                      │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  💬 "So THAT'S why Varkus was so aggressive!"          │
│  💬 "I should have known Chen would turtle..."         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

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

### REQ-TECH-001: Tech Card Draft System

**Description:** Tech progression uses a card draft system instead of resource crafting:
- 40 unique tech cards in three tiers (12 T1, 20 T2, 8 T3)
- Turn 1: Each player draws 3 T1 cards, keeps 1 (hidden until end game)
- Every 10 turns: Draft event where players draw 3 cards, pick 1 (public)
- Turn 50+: Rare T3 cards become available with game-changing effects

**Rationale:** Provides strategic depth through draft choices while avoiding supply chain micromanagement. Every card directly affects combat, creating visible drama and bot reactions.

**Source:** Section 1.1 - Three-Tier Card System

**Code:**
- `src/lib/tech-cards/draft-system.ts` - Draft event generation
- `src/app/actions/tech-card-actions.ts` - Draft execution actions

**Tests:**
- `src/lib/tech-cards/__tests__/draft-system.test.ts` - Draft generation and execution

**Status:** Draft

---

### REQ-TECH-002: Hidden Objectives (T1 Cards)

**Description:** T1 cards drawn at Turn 1 are secret objectives that score bonus Victory Points at game end:
- 12 unique hidden objectives (Warmonger's Arsenal, Merchant's Ledger, etc.)
- Each has specific scoring condition (empires eliminated, credits earned, treaties active, etc.)
- Rewards range from 0-10 VP depending on achievement
- Secret until game end, then revealed to all players simultaneously

**Rationale:** Creates Lord of Waterdeep-style hidden incentives. Players don't know each other's objectives, creating post-game reveals and strategic misdirection.

**Source:** Section 3.1 - Tier 1: Hidden Objectives

**Code:**
- `src/lib/tech-cards/hidden-objectives.ts` - Objective tracking and scoring
- `src/app/actions/game-end-actions.ts` - End-game reveal

**Tests:**
- `src/lib/tech-cards/__tests__/hidden-objectives.test.ts` - VP calculation for each objective type

**Status:** Draft

---

### REQ-TECH-003: Public Draft Cards (T2)

**Description:** T2 cards drafted publicly every 10 turns provide combat effects with counterplay:
- 20 unique tactical cards across 5 categories (Offensive, Defensive, Utility, Economic, Special)
- Each card has specific combat effect (e.g., Plasma Torpedoes: +2 first-round damage)
- Each card lists counter card (e.g., Shield Arrays counter Plasma Torpedoes)
- All players see who drafts what, enabling strategic responses
- Draft order determined by d20 + CHA modifier

**Rationale:** Creates draft drama ("The Warlord just drafted Plasma Torpedoes!"), encourages counter-picking, and makes tech choices visible to opponents.

**Source:** Section 3.2 - Tier 2: Tactical Cards

**Code:**
- `src/lib/tech-cards/tactical-cards.ts` - Card catalog and effects
- `src/lib/combat/tech-card-integration.ts` - Combat modifier application

**Tests:**
- `src/lib/tech-cards/__tests__/tactical-cards.test.ts` - Each card's effect
- `src/lib/combat/__tests__/tech-card-combat.test.ts` - Combat integration

**Status:** Draft

---

### REQ-TECH-004: Legendary Cards (T3)

**Description:** T3 cards are rare, powerful, and announced to all players:
- 8 unique legendary cards (Planet Cracker, Dyson Swarm, Mind Control Array, etc.)
- Appear in draft pool after Turn 50 (30% chance per slot)
- Galaxy-wide announcement when drafted
- Effects are game-changing (destroy planet, double income, force bot conflicts, etc.)
- Hybrid usage model: one-use (destructive), permanent (economic), limited uses (utility)

**Rationale:** Creates dramatic moments and galaxy-wide reactions. These are "boss abilities" that shift the balance of power while preventing "save syndrome" through varied usage limits.

**Source:** Section 3.3 - Tier 3: Legendary Cards

**Code:**
- `src/lib/tech-cards/legendary-cards.ts` - Legendary card catalog
- `src/lib/game/galaxy-announcements.ts` - Public announcements
- `src/app/actions/legendary-card-actions.ts` - Manual activation

**Tests:**
- `src/lib/tech-cards/__tests__/legendary-cards.test.ts` - Each legendary effect

**Status:** Draft

---

### REQ-TECH-005: Bot Tech Card Integration

**Description:** Bots have archetype preferences for tech cards and announce their picks:
- 8 archetypes have specific preferences for T1, T2, and T3 cards
- Bots announce drafts with personality-specific messages
- Strategic bots analyze synergies (e.g., War Machine + Plasma Torpedoes)
- Reactive bots adapt based on game state (losing = economic, winning = offensive)
- Bots react to player's visible tech cards in combat decisions

**Rationale:** Integrates tech cards into bot personality system, creating narrative moments and strategic visibility.

**Source:** Section 4 - Bot Integration

**Code:**
- `src/lib/bots/tech-card-decisions.ts` - Bot draft decision logic
- `src/lib/bots/tech-card-messages.ts` - Message templates
- `src/lib/combat/bot-combat-ai.ts` - Combat adaptation

**Tests:**
- `src/lib/bots/__tests__/tech-card-decisions.test.ts` - Decision logic for each archetype

**Status:** Draft

---

### REQ-TECH-006: End Game Hidden Objective Reveal

**Description:** At game end (turn limit or victory achieved), all hidden T1 cards reveal with bonus VP calculations displayed to all players.
- Reveal screen shows all players' hidden objectives simultaneously
- VP calculation shown with progress metrics (e.g., "Credits earned: 225,000 → +9 VP")
- Reveal messages displayed ("Every transaction brought me closer to victory.")
- Final scores updated with bonus VP

**Rationale:** Creates post-game discussion ("I thought Varkus was playing aggressively because he's a Warlord, but he was also scoring his hidden objective!").

**Source:** Section 3.1 - Hidden Objective Mechanics (At Game End)

**Code:**
- `src/lib/game/game-end.ts` - Reveal orchestration
- `src/components/game/HiddenObjectiveReveal.tsx` - Reveal UI

**Tests:**
- `src/lib/game/__tests__/game-end.test.ts` - Reveal calculation and display

**Status:** Draft

---

### REQ-TECH-007: Tech Card Catalog (40 Cards Total)

**Description:** Specific tech card pool organized by tier:

**TIER 1 - Hidden Objectives (12 cards):**
- Warmonger's Arsenal, Merchant's Ledger, Diplomat's Archive, Survivor's Grit, Opportunist's Eye, Tech Supremacy, Economic Hegemon, Fortress Builder, Fleet Admiral, Shadow Operator, Peacekeeper, Research Pioneer

**TIER 2 - Tactical Cards (20 cards, 5 categories):**
- Offensive (5): Plasma Torpedoes, Ion Cannons, Boarding Parties, Overcharged Weapons, Focus Fire Protocol
- Defensive (5): Shield Arrays, Point Defense, Hardened Circuits, Regenerative Hull, Emergency Shields
- Utility (5): Cloaking Field, Scanner Arrays, EMP Burst, Shielded Core, Repair Drones
- Economic (3): Salvage Operations, Rapid Deployment, War Bonds
- Special (2): Morale Boost, Kamikaze Doctrine

**TIER 3 - Legendary Cards (8 cards):**
- Planet Cracker, Dyson Swarm, Mind Control Array, Temporal Stasis, Genesis Device, Galactic Broadcast, Quantum Superweapon, Economic Collapse

**Rationale:** Provides concrete card pool for balance testing and bot decision-making. Cards designed to synergize with research doctrines.

**Source:** Sections 3.1, 3.2, 3.3 - Card catalogs

**Code:**
- `src/lib/tech-cards/card-catalog.ts` - Complete card definitions
- Database seed: `supabase/seeds/tech_cards.sql`

**Tests:**
- `src/lib/tech-cards/__tests__/card-catalog.test.ts` - Validate all 40 cards exist

**Status:** Draft

---

### REQ-TECH-008: Tech Card Counter-Play System

**Description:** Each card has counters creating rock-paper-scissors dynamics:

**Counter Examples:**
- Shield Arrays counters Shock Troops (research) + Plasma Torpedoes (negates surprise/first-strike)
- Scanner Arrays counters Cloaking Field (reveals hidden units)
- Point Defense counters Plasma Torpedoes (-2 to incoming first-round damage)
- Siege Engines (research) counters Shield Arrays (bypasses AC bonus)

Players can draft cards to counter known opponent strategies (requires intel from research announcements, combat reveals, or espionage).

**Rationale:** Creates strategic drafting decisions beyond "pick strongest card." Rewards intelligence gathering and counter-picking.

**Source:** Section 2.1 - Card Anatomy (COUNTER field)

**Code:**
- `src/lib/tech-cards/counter-system.ts` - Counter resolution
- `src/lib/combat/combat-modifiers.ts` - Counter application in combat

**Tests:**
- `src/lib/combat/__tests__/counter-play.test.ts` - Each counter relationship

**Status:** Draft

---

### REQ-TECH-009: Draft Timing & Combat Integration

**Description:** Draft events occur at fixed intervals with combat integration:

**Draft Schedule:**
- Turn 1: T1 hidden objective (draw 3, keep 1)
- Turn 10, 20, 30, 40: T2 tactical cards (draw 3, pick 1, public announcement)
- Turn 50+: T3 legendary cards enter pool (30% chance per draft slot)

**Draft Order:**
- Initiative: d20 + CHA modifier
- Higher roll picks first, repeats each draft event
- Cards removed from pool once drafted (reset next event)

**Combat Integration:**
- Research bonuses + Tech Card bonuses stack multiplicatively
- Example: War Machine (+2 STR) + Plasma Torpedoes (+2 first-round) = 2d8+1 → 2d8+3 → 2d8+5
- Cards activate automatically unless legendary (require manual activation to prevent "save syndrome")

**Rationale:** Predictable timing enables strategic planning. Stacking with research creates powerful synergies. Automatic activation ensures cards get used.

**Source:** Section 3.4 - Draft Events, Section 3.5 - Combat Integration

**Code:**
- `src/lib/tech-cards/draft-engine.ts` - Draft scheduling
- `src/lib/combat/card-integration.ts` - Combat modifier stacking
- `src/lib/turn/turn-processor.ts` - Draft event triggering

**Tests:**
- `src/lib/tech-cards/__tests__/draft-timing.test.ts` - Draft schedule validation
- `src/lib/combat/__tests__/modifier-stacking.test.ts` - Research + Card synergy

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-TECH-001 | Tech Card Draft System | Draft | TBD |
| REQ-TECH-002 | Hidden Objectives (T1 Cards) | Draft | TBD |
| REQ-TECH-003 | Public Draft Cards (T2) | Draft | TBD |
| REQ-TECH-004 | Legendary Cards (T3) | Draft | TBD |
| REQ-TECH-005 | Bot Tech Card Integration | Draft | TBD |
| REQ-TECH-006 | End Game Hidden Objective Reveal | Draft | TBD |
| REQ-TECH-007 | Tech Card Catalog (40 Cards Total) | Draft | TBD |
| REQ-TECH-008 | Tech Card Counter-Play System | Draft | TBD |
| REQ-TECH-009 | Draft Timing & Combat Integration | Draft | TBD |

**Total Specifications:** 9
**Implemented:** 0
**Validated:** 0
**Draft:** 9

---

## 7. Implementation Requirements

### 7.1 Database Schema

Complete database schema with tables, indexes, and constraints. For full SQL definitions, see [Appendix: Database Schema](appendix/TECH-CARD-SYSTEM-APPENDIX.md#database-schema).

**Core Tables:**
- `tech_card_templates` - Static card definitions (40 cards)
- `empire_tech_cards` - Player/bot card hands
- `tech_card_draft_events` - Draft history log
- `tech_card_usage_log` - Combat usage tracking

**Key Relationships:**
- Empire → Cards (many-to-many through empire_tech_cards)
- Cards → Templates (many-to-one)
- Draft Events → Games (many-to-one)
- Usage Log → Combats (many-to-one)

### 7.2 Service Architecture

For complete service implementation with methods and interfaces, see [Appendix: Service Architecture](appendix/TECH-CARD-SYSTEM-APPENDIX.md#service-architecture).

**TechCardService:**
- `generateDraftEvent()` - Create draft with random cards
- `executeDraft()` - Process player/bot selection
- `applyTechCardsToCombat()` - Calculate modifiers
- `scoreHiddenObjectives()` - End-game VP calculation
- `resolveCounters()` - Counter-play resolution

### 7.3 Server Actions

```typescript
// src/app/actions/tech-card-actions.ts
"use server";

/**
 * Execute a draft selection for an empire
 * @spec REQ-TECH-001, REQ-TECH-003
 */
export async function draftTechCard(
  empireId: string,
  cardId: string,
  draftEventId: string
): Promise<ActionResult> {
  // Validate empire can draft
  // Add card to hand
  // Announce to other players (if T2/T3)
  // Trigger bot reactions
}

/**
 * Activate a legendary card
 * @spec REQ-TECH-004
 */
export async function activateLegendaryCard(
  empireId: string,
  cardId: string,
  targetId?: string
): Promise<ActionResult> {
  // Validate card can be used
  // Apply legendary effect
  // Galaxy-wide announcement
  // Mark as expended (if one-use)
}
```

### 7.4 UI Components

For complete UI component interfaces and props, see [Appendix: UI Components](appendix/TECH-CARD-SYSTEM-APPENDIX.md#ui-components).

**Core Components:**
- `TechCardHand.tsx` - Display player's cards
- `DraftModal.tsx` - Card selection interface
- `CardDetailPanel.tsx` - Card mechanics viewer
- `EnemyCardDisplay.tsx` - Known enemy cards
- `HiddenObjectiveReveal.tsx` - End-game reveal screen
- `CombatCardEffects.tsx` - Active cards during combat

---

## 8. Balance Targets

### 8.1 Draft Distribution

| Tier | Cards in Pool | Cards per Empire (avg) | Total Picks Over Game |
|------|---------------|------------------------|----------------------|
| T1 | 12 | 1 (fixed) | 1 (Turn 1 only) |
| T2 | 20 | 4-5 | 4-5 (Turn 10, 20, 30, 40, 50) |
| T3 | 8 | 1-2 | 1-2 (Turn 50+, if game lasts) |

**Goal:** By Turn 50, players have:
- 1 hidden objective
- 4-5 tactical cards
- 0-2 legendary cards (if lucky/game goes long)

### 8.2 Card Power Levels

| Tier | Expected Combat Impact | Expected VP Impact |
|------|------------------------|-------------------|
| T1 | None (scoring only) | +2-8 VP average |
| T2 | +10-20% win rate if synergistic | None |
| T3 | +30-50% win rate or game-changing | None (except Planet Cracker = territory loss) |

**Example Balance:**
- War Machine (+2 STR) + Plasma Torpedoes (+2 first round) = +4 STR opening
- Expected damage increase: 2d8+3 → 2d8+7 = +4 average damage
- Expected win rate increase: +15-20% vs equivalent force

**Counter-play:**
- Shield Arrays (T2) negates Shock Troops (Research) surprise round
- Restores balance to ~50/50 win rate

### 8.3 Hidden Objective Balance

**Target Distribution:**

| Objective | % of Players Expected to Pick | Avg VP Earned |
|-----------|-------------------------------|---------------|
| Warmonger's Arsenal | 20-25% | 4-6 VP |
| Merchant's Ledger | 15-20% | 5-7 VP |
| Diplomat's Archive | 10-15% | 3-6 VP |
| Survivor's Grit | 5-10% | 0 or 5 VP (all-or-nothing) |
| Opportunist's Eye | 15-20% | 4-6 VP |
| Others | 30-40% | 2-5 VP |

**Goal:** Hidden objectives contribute 3-6 VP on average, enough to swing close games but not dominant.

### 8.4 Legendary Card Balance

**Usage Rate Targets:**

| Card | Expected Usage per Game | Impact if Used | Counter-play Available |
|------|-------------------------|----------------|------------------------|
| Planet Cracker | 0-1 uses | Removes 1 planet (huge) | Can't counter, but diplomatic penalty |
| Dyson Swarm | 0-1 drafts | +100% income (massive) | Target economy before it snowballs |
| Mind Control | 1-3 uses | Forces enemy conflict | Limited uses prevents spam |
| Temporal Stasis | 0-1 uses | Skips turn (delays) | One-use, timing critical |

**Goal:** Legendary cards feel epic but don't guarantee wins. A T3 card should swing momentum ~30-40%, not auto-win.

### 8.5 Simulation Requirements

**Monte Carlo Balance Testing:**
```
Iterations: 10,000 games
Variables:
- Card combination frequency
- Win rate by research doctrine + card synergy
- Hidden objective VP distribution
- Legendary card usage patterns

Success Criteria:
- No card combination exceeds 65% win rate
- No card picked >40% of the time (variety check)
- Hidden objective average: 3-6 VP ±1 VP
- Legendary usage: 0-2 per game average
```

### 8.6 Playtest Checklist

- [ ] War Machine + Plasma Torpedoes win rate: 55-60% (not 70%+)
- [ ] Hidden objectives create "aha!" moments at game end
- [ ] Legendary cards feel epic (not overpowered or underwhelming)
- [ ] Draft takes <2 minutes per player (no analysis paralysis)
- [ ] Players can understand card effects in 10 seconds (visual clarity)
- [ ] Counter-play is visible and intuitive
- [ ] Bots make sensible draft choices aligned with archetypes
- [ ] No card is "must-pick" regardless of strategy

---

## 9. Migration Plan

### 9.1 Development Timeline

**Beta 1 & 2 (Combat, Research):**
- No tech card system
- Players test core loop + Research bonuses
- Feedback: "Game feels complete but could use more tactical depth"

**Beta 3: Tech Card Implementation (6-8 weeks)**

**Week 1-2: Database & Core Service**
- Implement tech_card_templates schema
- Seed 40 cards (12 T1, 20 T2, 8 T3)
- Create TechCardService with draft generation

**Week 3: Draft System**
- Implement draft event generation (Turn 1, 10, 20, 30, 40, 50)
- Draft modal UI (show 3 cards, pick 1)
- Public announcement system (all players see picks)

**Week 4: Combat Integration**
- Integrate tech cards with combat resolution
- Apply modifiers (+2 damage, -4 to hit, etc.)
- Counter-play resolution (Shield Arrays vs Shock Troops)
- Combat log shows card effects

**Week 5: Bot Integration**
- Bot draft decision logic (archetype preferences)
- Bot messaging (draft reactions, card usage taunts)
- Strategic bots analyze synergies (War Machine + Plasma Torpedoes)

**Week 6: Hidden Objectives**
- Turn 1 hidden objective draft
- End-game scoring calculation
- Reveal screen UI (dramatic reveals)

**Week 7: Legendary Cards**
- Tier 3 card implementation
- Manual activation UI (Planet Cracker button)
- Galaxy-wide announcements

**Week 8: Balance & Polish**
- Playtesting: Win rate by card combination
- Adjust card power levels (nerf/buff as needed)
- UI polish (animations, card flip effects)

**Beta 3 Launch:**
- Full tech card system live
- Players provide feedback: "Does this add fun or complexity?"

### 9.2 Testing Requirements

**Unit Tests:**
- [ ] Draft event generation (correct cards offered)
- [ ] Draft order calculation (d20 + CHA initiative)
- [ ] Card activation in combat (modifiers applied)
- [ ] Counter-play resolution (Shield Arrays negates Shock Troops)
- [ ] Hidden objective scoring (VP calculated correctly)
- [ ] Legendary card effects (Planet Cracker removes planet)

**Integration Tests:**
- [ ] Full draft sequence (Turn 1 → 10 → 20 → 30 → 40 → 50)
- [ ] Bot draft decision-making (picks make sense)
- [ ] Combat with multiple cards active (modifiers stack)
- [ ] End-game reveal screen (all objectives shown)
- [ ] Public announcements (all players notified)

**Balance Tests:**
- [ ] 1000-game simulation: Win rate by card combination
- [ ] War Machine + Plasma Torpedoes win rate: Target 55-60% (not 70%+)
- [ ] Hidden objective VP distribution: Avg 3-6 VP per player
- [ ] Legendary card usage rate: 0-2 per game (not every game)
- [ ] Draft pick distribution: No card picked >40% of the time

**User Acceptance Tests:**
- [ ] Players can understand card effects in 10 seconds (visual clarity)
- [ ] Draft takes <2 minutes per player (no analysis paralysis)
- [ ] Hidden objectives create "aha!" moments at game end
- [ ] Legendary cards feel epic (not overpowered or underwhelming)

### 9.3 Rollback Plan

If Tech Card system proves too complex or unbalanced:

**Immediate Rollback:**
1. Disable draft events in turn processor
2. Hide Tech Card UI elements
3. Remove card modifiers from combat calculations
4. Preserve database tables (don't drop)

**Recovery:**
1. Review playtest feedback for specific issues
2. Adjust card balance values
3. Simplify draft UI if needed
4. Re-enable in phases (T1 only → T1+T2 → Full system)

---

## 10. Conclusion

### Key Decisions

The Technology Card system transforms Nexus Dominion from **"Research provides strategic identity"** to **"Research + Tech Cards provides strategic identity + tactical depth"**.

**Key Features:**
- ✅ 3-tier card system (Hidden Objectives, Tactical, Legendary)
- ✅ **Public drafts** create counter-play and bot drama
- ✅ **Hidden objectives** add Lord of Waterdeep-style replayability
- ✅ **Combat integration** with D20 bonuses (+2 damage, -4 to hit)
- ✅ **Synergy with Research** (War Machine + Plasma Torpedoes = +4 STR)
- ✅ **Counter-play at two layers** (Research counters + Card counters)
- ✅ **Bot integration** with archetype preferences and messaging
- ✅ **Legendary cards** create late-game drama (Turn 50+)
- ✅ **Boardgame simplicity** (draft 1 from 3, see effects immediately)

**Why Include in Core Game:**
1. **Not complexity for complexity's sake** — Simple draft mechanics (pick 1 of 3)
2. **Visual and boardgame-like** — Card UI, clear icons, immediate feedback
3. **Adds strategic depth** — Research + Tech Cards > Research alone
4. **Enables diverse playstyles** — Hidden objectives reward different strategies
5. **Creates replayability** — 12 hidden objectives × 20 tactical cards × 8 legendary = massive variety
6. **Progressive tutorial works** — Turn 1 (1 card), Turn 10 (first draft), Turn 50 (legendaries)

**Implementation Priority:** Core game feature, Beta 3 (after Combat and Research validated in Beta 1-2).

### Open Questions

None. All design questions resolved:
- Card tier structure: 3 tiers (Hidden, Tactical, Legendary) ✅
- Visibility: Public drafts except T1 ✅
- Usage limits: Hybrid model (one-use, permanent, limited) ✅
- Balance targets: Quantified in Section 8 ✅

### Dependencies

**Depends On:**
- **Combat System** - Tech cards modify combat resolution
- **Research System** - Cards synergize with research doctrines
- **Bot System** - Bots need archetype-based draft logic
- **Turn Processor** - Draft events triggered at specific turns

**Depended By:**
- **Victory Conditions** - Hidden objectives add VP to final score
- **UI/UX** - Card display, draft modals, reveal screens
- **Balance System** - Monte Carlo simulations include card effects

---

## Related Documents

- [COMBAT-SYSTEM.md](COMBAT-SYSTEM.md) - D20 combat mechanics, stat modifiers
- [RESEARCH-SYSTEM.md](RESEARCH-SYSTEM.md) - Research system synergy, doctrine bonuses
- [BOT-SYSTEM.md](BOT-SYSTEM.md) - Bot decision-making, archetype preferences
- [SYNDICATE-SYSTEM.md](SYNDICATE-SYSTEM.md) - Hidden role mechanics (similar asymmetric info)
- [PRD-EXECUTIVE.md](../PRD-EXECUTIVE.md) - Product requirements document

---

**END SPECIFICATION**
