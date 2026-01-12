# Technology Card System

**Version:** 2.0
**Status:** Core Game Feature - Beta 3
**Created:** 2026-01-11
**Last Updated:** 2026-01-12
**Replaces:** 4-tier crafting supply chain concept (explicitly rejected)

---

## Document Purpose

This document defines the **Technology Card (Tech Card) draft system** for Nexus Dominion. Tech Cards provide tactical combat advantages and hidden objectives that complement the Research system's strategic bonuses.

**Design Philosophy:**
- **Draft, Don't Manage** — Pick from options, don't run supply chains
- **Visible Decisions** — Public drafts create counter-play and bot drama
- **Combat Integration** — Every card directly affects battles
- **Hidden Objectives** — Lord of Waterdeep-style end-game reveals
- **Tactical vs Strategic** — Cards provide situational advantages, Research provides permanent identity
- **Boardgame Feel** — Simple card effects, visual choices, immediate impact

**Relationship to Research:**
- **Research = Foundation:** Permanent empire-wide stat modifiers (+2 STR, +4 AC)
- **Crafting = Tactical Layer:** Situational combat advantages (+2 first round, cloaking)
- **Combined Effect:** War Machine doctrine (+2 STR) + Plasma Torpedoes (+2 first round) = +4 STR opening salvo

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Card Anatomy](#2-card-anatomy)
3. [Tier 1: Hidden Objectives](#3-tier-1-hidden-objectives)
4. [Tier 2: Tactical Cards](#4-tier-2-tactical-cards)
5. [Tier 3: Legendary Cards](#5-tier-3-legendary-cards)
6. [Draft Events](#6-draft-events)
7. [Combat Integration](#7-combat-integration)
8. [Bot Integration](#8-bot-integration)
9. [UI/UX Design](#9-uiux-design)
10. [Implementation Requirements](#10-implementation-requirements)
11. [Balance Targets](#11-balance-targets)
12. [Migration Plan (Beta 3)](#12-migration-plan-beta-3)
13. [Conclusion](#13-conclusion)

---

## 1. Core Concept

### 1.1 Three-Tier Card System

Tech Cards replace crafting supply chains with strategic card drafting:

| Tier | Name | Draw Timing | Visibility | Purpose |
|------|------|-------------|------------|---------|
| **Tier 1** | Hidden Objectives | Turn 1 (once) | Revealed at game end | Secret scoring conditions |
| **Tier 2** | Tactical Cards | Every 10 turns | Public draft | Combat advantages |
| **Tier 3** | Legendary Cards | Turn 50+ | Public announcement | Game-changing abilities |

### 1.2 The Draft System

**Turn 1 (Hidden Objective):**
- Draw 3 Tier 1 cards
- Keep 1 (hidden from all players)
- Reveals at game end for bonus Victory Points

**Every 10 turns (Tactical Draft):**
- Turn 10: Draw 3 Tier 2 cards, pick 1 (public)
- Turn 20: Draw 3 Tier 2 cards, pick 1 (public)
- Turn 30: Draw 3 Tier 2 cards, pick 1 (public)
- Turn 50+: Tier 3 Legendary cards enter draft pool

**Key Mechanic:**
- Drafts are **public** (all players see what you picked)
- Hand is **public** (enemies know what cards you have)
- Hidden objective is **private** (no one knows your T1 card)
- Usage is **visible** (combat log shows which card activated)

### 1.3 Integration with Research

**Example Combo:**
```
Empire Build: "Alpha Strike Warlord"

Foundation (Research):
- Doctrine: War Machine (+2 STR to all units)
- Specialization: Shock Troops (surprise round)

Tactical Layer (Crafting):
- Plasma Torpedoes (+2 damage first round)
- Ion Cannons (disable enemy stations)

Combined Effect in Combat:
- Surprise round (Shock Troops)
- Base STR 14 (+2) → STR 16 (+3)
- +2 damage first round (Plasma Torpedoes)
- Effective first strike: 2d8+5 damage before enemy acts
- Ion Cannons shut down defense stations

Counter: Fortress + Shield Arrays (negates surprise round)
```

**Why Both Systems Work Together:**
1. Research provides **empire-wide permanent bonuses**
2. Crafting provides **tactical situational advantages**
3. Neither is redundant—they stack multiplicatively
4. Counter-play exists at both layers

---

## 2. Card Anatomy

### 2.1 Standard Card Format

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

### 2.2 Card Elements

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

### 2.3 Card Tiers Explained

**Tier 1 (Hidden Objectives):**
- Drawn once at game start
- Secret until game end
- Reward specific playstyles
- Add 0-5 Victory Points at end
- Example: "Warmonger's Arsenal" (+2 VP per empire eliminated)

**Tier 2 (Tactical Cards):**
- Drafted every 10 turns
- Public knowledge
- Usable in combat immediately
- Moderate power level
- Example: "Plasma Torpedoes" (+2 first round damage)

**Tier 3 (Legendary Cards):**
- Rare, game-changing
- Appear Turn 50+
- Galaxy-wide announcement when drafted
- Single-use (except where noted)
- Example: "Planet Cracker" (destroy 1 planet permanently)

---

## 3. Tier 1: Hidden Objectives

### 3.1 Purpose

Hidden objectives create **Lord of Waterdeep-style secret scoring** where players don't know each other's end-game goals.

**Design Goal:**
- Encourage diverse playstyles (not everyone rushes conquest)
- Create post-game "reveal" moments
- Add replayability (different objectives each game)
- Reward player creativity

### 3.2 Hidden Objective Cards

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

### 3.3 Mechanics

**At Game Start:**
1. Each player draws 3 random Tier 1 cards
2. Selects 1 to keep (hidden from all players)
3. Returns 2 to deck (not shown)

**During Game:**
- Objective is secret (not displayed in UI to anyone)
- Player sees reminder in "Objectives" panel
- No mechanical effect during gameplay

**At Game End:**
- All hidden objectives revealed simultaneously
- VP calculated and added to final score
- Victory screen shows all players' objectives
- Creates "aha!" moments ("So THAT'S why they were hoarding planets!")

**Example End-Game Reveal:**
```
┌─────────────────────────────────────────────────────────┐
│              HIDDEN OBJECTIVES REVEALED                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PLAYER: Merchant's Ledger                              │
│  "Every transaction brought me closer to victory."      │
│  Credits earned: 175,000                                │
│  Bonus: +7 VP (1 per 25k)                               │
│                                                         │
│  EMPEROR VARKUS: Warmonger's Arsenal                    │
│  "My weapons were always destined for conquest."        │
│  Empires eliminated: 4                                  │
│  Bonus: +8 VP (2 per elimination)                       │
│                                                         │
│  LADY CHEN: Survivor's Grit                             │
│  "They never touched my homeworld."                     │
│  Planets lost: 0                                        │
│  Bonus: +5 VP                                           │
│                                                         │
│  THE COLLECTIVE: Diplomat's Archive                     │
│  "My alliances were my true strength."                  │
│  Treaties active: 2                                     │
│  Bonus: +6 VP (3 per treaty)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Tier 2: Tactical Cards

### 4.1 Purpose

Tier 2 cards provide **combat advantages** that combine with Research bonuses to create diverse tactical options.

**Design Goal:**
- Add tactical depth without strategic complexity
- Create visible counter-play (public drafts)
- Enable bot drama and reactions
- Stack multiplicatively with Research bonuses

### 4.2 Tier 2 Card Catalog (20 Cards)

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

### 4.3 Draft Timing

**Regular Drafts:**
- Turn 10: First draft (3 T2 cards offered, pick 1)
- Turn 20: Second draft
- Turn 30: Third draft
- Turn 40: Fourth draft
- Turn 50+: T3 cards enter pool (see next section)

**Draft Process:**
1. Game pauses at start of turn
2. Modal displays 3 random cards
3. Player has full turn to decide (no timer)
4. Selection is **public** (all players notified)
5. Card added to player's hand immediately
6. Card usable in next combat

---

## 5. Tier 3: Legendary Cards

### 5.1 Purpose

Tier 3 cards are **game-changing abilities** that create dramatic late-game moments and comebacks.

**Design Goal:**
- Late-game escalation (Turn 50+)
- Dramatic announcements (like Research capstones)
- High-risk, high-reward choices
- Enable comebacks for struggling players

### 5.2 Legendary Card Catalog (8 Cards)

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

### 5.3 Legendary Draft Mechanics

**Availability:**
- Enter draft pool at Turn 50
- Appear alongside T2 cards (now draw 3, 1-2 may be T3)
- Rarity: 30% chance per draft slot after Turn 50

**Draft Announcement:**
```
┌─────────────────────────────────────────────────────────┐
│                 ⚡ LEGENDARY DRAFT EVENT ⚡               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Turn 50: Advanced technologies now available          │
│                                                         │
│  The galaxy enters its final phase.                    │
│  Legendary weapons, unimaginable power,                 │
│  and desperate gambles await those bold enough.         │
│                                                         │
│  Choose wisely. These decisions shape destinies.        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Usage Announcement:**
```
┌─────────────────────────────────────────────────────────┐
│                 🌟 PLANET CRACKER ACTIVATED 🌟           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Emperor Varkus has deployed the PLANET CRACKER.        │
│                                                         │
│  Target: Lady Chen's homeworld (Sector Alpha-7)         │
│                                                         │
│  The planet is consumed by cascading fission.           │
│  4 billion souls. Gone in an instant.                   │
│                                                         │
│  The sector is now DEAD SPACE (uninhabitable).          │
│                                                         │
│  All empires recoil in horror.                          │
│  Diplomatic penalties: -50 with all non-Syndicate       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Single-Use vs Permanent

**Design Decision Resolution:**

Based on playtesting goals, we use a **hybrid model**:
- **Destructive cards:** One-use (Planet Cracker, Quantum Superweapon)
  - Rationale: Too powerful to repeat, creates dramatic moment
- **Economic cards:** Permanent (Dyson Swarm)
  - Rationale: Late-game reward for investing in draft
- **Utility cards:** Limited uses (Mind Control: 3 uses)
  - Rationale: Reusable but not spammable

This prevents "optimal save syndrome" (hoarding cards) while maintaining power fantasy.

---

## 6. Draft Events

### 6.1 Draft Timing

| Turn | Event | Cards Offered | Visibility |
|------|-------|---------------|------------|
| 1 | Hidden Objective | 3 T1 cards, keep 1 | Private |
| 10 | First Tactical Draft | 3 T2 cards, pick 1 | Public |
| 20 | Second Tactical Draft | 3 T2 cards, pick 1 | Public |
| 30 | Third Tactical Draft | 3 T2 cards, pick 1 | Public |
| 40 | Fourth Tactical Draft | 3 T2 cards, pick 1 | Public |
| 50+ | Legendary Drafts | 3 cards (1-2 may be T3) | Public |

### 6.2 Draft Order

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

### 6.3 Draft Drama

**Bot Reactions to Draft Picks:**
```
[Turn 10: Lady Chen drafts Shield Arrays]

[Emperor Varkus]: "Shield Arrays? Coward's technology.
                   I'll break through regardless."

[The Collective]: "Wise choice. Defense wins wars."

[Player's Advisor]: "Intelligence Report: Lady Chen now counters
                     Shock Troops specializations. Adjust strategy
                     accordingly."
```

**Draft creates immediate strategic conversation:**
- Bots comment on picks
- Players adjust plans based on enemy cards
- Counter-play emerges naturally

---

## 7. Combat Integration

### 7.1 Card Activation

**Automatic Activation:**
- Cards activate automatically in combat when conditions met
- Example: Plasma Torpedoes activates in first round without player input
- Simplifies gameplay (no micro-management)

**Conditional Activation:**
- Legendary cards require manual activation (button in combat UI)
- Example: Planet Cracker must be explicitly used (prevents accidents)

### 7.2 Combat Flow with Cards

**Standard Combat (No Cards):**
```
1. Initiative rolls (d20 + DEX)
2. Higher initiative attacks first
3. Attack rolls (d20 + BAB + mods vs AC)
4. Damage rolls (dice + STR)
5. Repeat until one side eliminated
```

**Combat with Tier 2 Cards:**
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

### 7.3 Combined System Example

**Scenario:** War Machine Empire with Plasma Torpedoes vs Fortress Empire with Shield Arrays

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

**Key Insight:** Research + Crafting stack multiplicatively:
- War Machine alone: +2 STR
- Plasma Torpedoes alone: +2 first round
- Combined: +4 effective STR in opening salvo

But counters exist at both layers:
- Shield Arrays (Crafting) negates Shock Troops (Research)
- Fortress doctrine (Research) reduces effectiveness of Plasma Torpedoes (Crafting)

---

## 8. Bot Integration

### 8.1 Archetype Preferences

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

### 8.2 Bot Draft Decision Logic

**Tier 1 (Hidden Objective):**
```typescript
function selectHiddenObjective(bot: Empire, options: Card[]): Card {
  // 90% follow archetype preference
  if (Math.random() < 0.9) {
    const preferred = options.find(c => c.name === bot.archetype.preferredT1);
    if (preferred) return preferred;
  }

  // 10% random (unpredictability)
  return options[Math.floor(Math.random() * options.length)];
}
```

**Tier 2 (Tactical Cards):**
```typescript
function selectTacticalCard(bot: Empire, options: Card[]): Card {
  // Strategic bots analyze synergies
  if (bot.tier === 'strategic') {
    // If has War Machine doctrine, prefer offensive cards
    if (bot.researchDoctrine === 'war_machine') {
      const offensive = options.find(c =>
        c.name === 'Plasma Torpedoes' || c.name === 'Ion Cannons'
      );
      if (offensive) return offensive;
    }

    // If has Fortress doctrine, prefer defensive cards
    if (bot.researchDoctrine === 'fortress') {
      const defensive = options.find(c =>
        c.name === 'Shield Arrays' || c.name === 'Point Defense'
      );
      if (defensive) return defensive;
    }

    // Counter-pick: If enemy has Shock Troops, draft Shield Arrays
    const threats = analyzeThreats(bot);
    if (threats.hasShockTroops) {
      const counter = options.find(c => c.name === 'Shield Arrays');
      if (counter) return counter;
    }
  }

  // Reactive bots pick based on current game state
  if (bot.tier === 'reactive') {
    // If losing, prefer economic cards for recovery
    if (bot.ranking > 50) {
      const economic = options.find(c =>
        c.tags?.includes('economic')
      );
      if (economic) return economic;
    }

    // If winning, prefer offensive cards to press advantage
    if (bot.ranking <= 10) {
      const offensive = options.find(c =>
        c.tags?.includes('offensive')
      );
      if (offensive) return offensive;
    }
  }

  // Chaotic bots pick randomly
  return options[Math.floor(Math.random() * options.length)];
}
```

**Tier 3 (Legendary Cards):**
```typescript
function selectLegendaryCard(bot: Empire, options: Card[]): Card {
  // Desperate bots (bottom 25%) prioritize comeback cards
  if (bot.ranking > 75) {
    const comeback = options.find(c =>
      c.name === 'Planet Cracker' || c.name === 'Economic Collapse'
    );
    if (comeback) return comeback;
  }

  // Dominant bots (top 10%) prioritize finishing cards
  if (bot.ranking <= 10) {
    const finisher = options.find(c =>
      c.name === 'Dyson Swarm' || c.name === 'Quantum Superweapon'
    );
    if (finisher) return finisher;
  }

  // Default: Follow archetype preference
  const preferred = options.find(c => c.name === bot.archetype.preferredT3);
  return preferred || options[0];
}
```

### 8.3 Bot Messaging

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

## 9. UI/UX Design

### 9.1 Card Display

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

### 9.2 Draft Modal

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

### 9.3 Combat Card Display

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
│  Your damage: 2d8+4 (+2 from Torpedoes, -2 from PD) = 2d8+4
│  Enemy AC: 17 (Fortress +4)                             │
│  Enemy HP: 25 → 24 (Repair Drones)                     │
│                                                         │
│ [ATTACK] [RETREAT] [USE LEGENDARY CARD]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.4 End-Game Reveal

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

## 10. Implementation Requirements

### 10.1 Database Schema

```sql
-- Card templates (static data)
CREATE TABLE tech_card_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tier INTEGER NOT NULL, -- 1, 2, 3
  card_type VARCHAR(30) NOT NULL, -- 'hidden_objective', 'tactical', 'legendary'

  -- Card content
  flavor_text TEXT,
  effect_description TEXT NOT NULL,
  effect_mechanics JSONB NOT NULL, -- Structured effect data

  -- Combat integration
  combat_phase VARCHAR(30), -- 'first_round', 'all_rounds', 'post_combat'
  modifier_type VARCHAR(30), -- 'damage_bonus', 'ac_bonus', 'special'
  modifier_value JSONB, -- {amount: 2, condition: 'first_round'}

  -- Counter-play
  countered_by VARCHAR(100), -- Card name or strategy
  counters VARCHAR(100), -- What this card counters

  -- Costs
  activation_cost_credits INTEGER DEFAULT 0,
  activation_cost_ore INTEGER DEFAULT 0,
  activation_cost_petroleum INTEGER DEFAULT 0,
  min_turn INTEGER DEFAULT 1,

  -- Scoring (T1 only)
  scoring_condition VARCHAR(100), -- 'credits_earned', 'empires_eliminated', etc.
  vp_per_unit INTEGER, -- VP per scoring unit
  vp_max INTEGER, -- Maximum VP from this card

  -- Metadata
  rarity VARCHAR(20), -- 'common', 'uncommon', 'rare', 'legendary'
  tags TEXT[], -- ['offensive', 'economic', 'defensive']
  icon VARCHAR(10), -- Emoji or icon identifier

  created_at TIMESTAMP DEFAULT NOW()
);

-- Player/bot card hands
CREATE TABLE empire_tech_cards (
  id UUID PRIMARY KEY,
  empire_id UUID REFERENCES empires(id),
  card_template_id UUID REFERENCES tech_card_templates(id),

  -- Acquisition
  acquired_turn INTEGER NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE, -- T1 hidden objectives
  draft_position INTEGER, -- 1st, 2nd, 3rd pick in draft

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_turn INTEGER,
  is_expended BOOLEAN DEFAULT FALSE, -- One-use cards

  -- Scoring (T1 only)
  current_progress INTEGER DEFAULT 0, -- e.g., credits earned toward objective
  vp_earned INTEGER DEFAULT 0, -- Calculated at game end

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(empire_id, card_template_id) -- Can't have duplicate cards
);

-- Draft events log
CREATE TABLE tech_card_draft_events (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  turn_number INTEGER NOT NULL,
  draft_order UUID[], -- Empire IDs in draft order

  -- Offered cards (for reconstruction/debugging)
  cards_offered JSONB, -- [{empire_id, cards: [id1, id2, id3]}]
  cards_selected JSONB, -- [{empire_id, selected_card_id}]

  created_at TIMESTAMP DEFAULT NOW()
);

-- Card usage in combat (for combat log)
CREATE TABLE tech_card_usage_log (
  id UUID PRIMARY KEY,
  combat_id UUID REFERENCES combats(id),
  empire_id UUID REFERENCES empires(id),
  card_template_id UUID REFERENCES tech_card_templates(id),

  -- Effect details
  effect_applied JSONB, -- What actually happened
  was_countered BOOLEAN DEFAULT FALSE,
  countered_by_card_id UUID REFERENCES tech_card_templates(id),

  turn_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10.2 Service Architecture

```typescript
// src/lib/game/services/tech-card-service.ts

export class TechCardService {
  // Draft system
  async generateDraftEvent(
    gameId: string,
    turn: number
  ): Promise<DraftEvent> {
    const tier = this.determineDraftTier(turn);
    const empires = await this.getEmpiresInGame(gameId);
    const draftOrder = this.rollDraftOrder(empires); // d20 + CHA

    const event: DraftEvent = {
      turn,
      order: draftOrder,
      offers: []
    };

    for (const empire of draftOrder) {
      const availableCards = await this.getAvailableCards(tier, gameId);
      const offered = this.selectRandomCards(availableCards, 3);
      event.offers.push({ empireId: empire.id, cards: offered });
    }

    return event;
  }

  async executeDraft(
    empireId: string,
    cardId: string,
    draftEventId: string
  ): Promise<void> {
    // Add card to empire's hand
    await this.addCardToHand(empireId, cardId);

    // Remove card from available pool for this draft
    await this.removeCardFromDraftPool(draftEventId, cardId);

    // Create public announcement (unless T1 hidden objective)
    const card = await this.getCard(cardId);
    if (card.tier !== 1) {
      await this.announceCardDraft(empireId, cardId);
    }

    // Trigger bot reactions
    await botService.reactToDraft(empireId, cardId);
  }

  // Card activation in combat
  async applyTechCardsToCommbat(
    combat: Combat
  ): Promise<CombatModifiers> {
    const attackerCards = await this.getActiveCards(combat.attackerId);
    const defenderCards = await this.getActiveCards(combat.defenderId);

    const modifiers: CombatModifiers = {
      attackerDamageBonus: 0,
      attackerACBonus: 0,
      defenderDamageBonus: 0,
      defenderACBonus: 0,
      specialEffects: []
    };

    // Apply attacker cards
    for (const card of attackerCards) {
      if (card.combatPhase === 'first_round' && combat.round === 1) {
        modifiers.attackerDamageBonus += card.modifierValue.amount;
        await this.logCardUsage(combat.id, combat.attackerId, card.id);
      }
    }

    // Apply defender cards
    for (const card of defenderCards) {
      if (card.modifierType === 'negate_surprise') {
        modifiers.specialEffects.push('surprise_negated');
      }
    }

    // Check for counter-play
    const counters = this.resolveCounters(attackerCards, defenderCards);
    modifiers.counters = counters;

    return modifiers;
  }

  // Hidden objective scoring
  async scoreHiddenObjectives(gameId: string): Promise<Map<string, number>> {
    const empires = await this.getEmpiresInGame(gameId);
    const scores = new Map<string, number>();

    for (const empire of empires) {
      const objective = await this.getHiddenObjective(empire.id);
      if (!objective) continue;

      const progress = await this.calculateObjectiveProgress(
        empire,
        objective
      );

      const vp = this.calculateVP(objective, progress);
      scores.set(empire.id, vp);

      // Store in database for reveal screen
      await this.updateObjectiveScore(empire.id, objective.id, vp);
    }

    return scores;
  }

  // Helper methods
  private determineDraftTier(turn: number): number {
    if (turn === 1) return 1; // Hidden objective
    if (turn < 50) return 2; // Tactical cards
    return 3; // Legendary cards (mixed with T2)
  }

  private rollDraftOrder(empires: Empire[]): Empire[] {
    return empires
      .map(e => ({
        empire: e,
        roll: this.rollD20() + this.getCHAModifier(e)
      }))
      .sort((a, b) => b.roll - a.roll)
      .map(r => r.empire);
  }

  private resolveCounters(
    attackerCards: Card[],
    defenderCards: Card[]
  ): CounterResult[] {
    const counters: CounterResult[] = [];

    for (const aCard of attackerCards) {
      for (const dCard of defenderCards) {
        if (dCard.counters === aCard.name) {
          counters.push({
            counteredCard: aCard.name,
            counterCard: dCard.name,
            effect: `${dCard.name} negates ${aCard.name}`
          });
        }
      }
    }

    return counters;
  }
}
```

### 10.3 UI Components

```typescript
// src/components/game/techcards/TechCardHand.tsx
// Displays player's current cards
interface TechCardHandProps {
  empireId: string;
  cards: TechCard[];
  onCardDetails: (cardId: string) => void;
}

// src/components/game/techcards/DraftModal.tsx
// Modal for card selection during drafts
interface DraftModalProps {
  offeredCards: TechCard[];
  onSelect: (cardId: string) => void;
  draftPosition: number;
  totalEmpires: number;
}

// src/components/game/techcards/CardDetailPanel.tsx
// Detailed card view (mechanics, counters, flavor)
interface CardDetailPanelProps {
  card: TechCard;
  showUsageHistory?: boolean;
}

// src/components/game/techcards/EnemyCardDisplay.tsx
// Shows known enemy cards
interface EnemyCardDisplayProps {
  empireId: string;
  knownCards: TechCard[];
}

// src/components/game/techcards/HiddenObjectiveReveal.tsx
// End-game reveal screen
interface HiddenObjectiveRevealProps {
  objectives: Array<{
    empire: Empire;
    objective: TechCard;
    progress: number;
    vpEarned: number;
  }>;
}

// src/components/game/combat/CombatCardEffects.tsx
// Shows active card effects during combat
interface CombatCardEffectsProps {
  combat: Combat;
  attackerCards: TechCard[];
  defenderCards: TechCard[];
  modifiers: CombatModifiers;
}
```

---

## 11. Balance Targets

### 11.1 Draft Distribution

| Tier | Cards in Pool | Cards per Empire (avg) | Total Picks Over Game |
|------|---------------|------------------------|----------------------|
| T1 | 12 | 1 (fixed) | 1 (Turn 1 only) |
| T2 | 20 | 4-5 | 4-5 (Turn 10, 20, 30, 40, 50) |
| T3 | 8 | 1-2 | 1-2 (Turn 50+, if game lasts) |

**Goal:** By Turn 50, players have:
- 1 hidden objective
- 4-5 tactical cards
- 0-2 legendary cards (if lucky/game goes long)

### 11.2 Card Power Levels

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

### 11.3 Hidden Objective Balance

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

### 11.4 Legendary Card Balance

**Usage Rate Targets:**

| Card | Expected Usage per Game | Impact if Used | Counter-play Available |
|------|-------------------------|----------------|------------------------|
| Planet Cracker | 0-1 uses | Removes 1 planet (huge) | Can't counter, but diplomatic penalty |
| Dyson Swarm | 0-1 drafts | +100% income (massive) | Target economy before it snowballs |
| Mind Control | 1-3 uses | Forces enemy conflict | Limited uses prevents spam |
| Temporal Stasis | 0-1 uses | Skips turn (delays) | One-use, timing critical |

**Goal:** Legendary cards feel epic but don't guarantee wins. A T3 card should swing momentum ~30-40%, not auto-win.

---

## 12. Migration Plan (Beta 3)

### 12.1 Development Timeline

**Beta 1 & 2 (Combat, Research):**
- No crafting system
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

### 12.2 Testing Requirements

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

---

## 13. Conclusion

The Technology Card system transforms Nexus Dominion from **"Research provides strategic identity"** to **"Research + Crafting provides strategic identity + tactical depth"**.

**Key Features:**
✅ 3-tier card system (Hidden Objectives, Tactical, Legendary)
✅ **Public drafts** create counter-play and bot drama
✅ **Hidden objectives** add Lord of Waterdeep-style replayability
✅ **Combat integration** with D20 bonuses (+2 damage, -4 to hit)
✅ **Synergy with Research** (War Machine + Plasma Torpedoes = +4 STR)
✅ **Counter-play at two layers** (Research counters + Card counters)
✅ **Bot integration** with archetype preferences and messaging
✅ **Legendary cards** create late-game drama (Turn 50+)
✅ **Boardgame simplicity** (draft 1 from 3, see effects immediately)

**Why Include in Core Game:**
1. **Not complexity for complexity's sake** — Simple draft mechanics (pick 1 of 3)
2. **Visual and boardgame-like** — Card UI, clear icons, immediate feedback
3. **Adds strategic depth** — Research + Crafting > Research alone
4. **Enables diverse playstyles** — Hidden objectives reward different strategies
5. **Creates replayability** — 12 hidden objectives × 20 tactical cards × 8 legendary = massive variety
6. **Progressive tutorial works** — Turn 1 (1 card), Turn 10 (first draft), Turn 50 (legendaries)

**Implementation Priority:** Core game feature, Beta 3 (after Combat and Research validated in Beta 1-2).

**Design Resolution:** All 4 open design questions resolved in Sections 3.3, 5.4, and throughout.

---

## Related Documents

- [COMBAT-SYSTEM.md](COMBAT-SYSTEM.md) - D20 combat mechanics, stat modifiers
- [RESEARCH.md](RESEARCH.md) - Research system synergy, doctrine bonuses
- [BOT-SYSTEM.md](BOT-SYSTEM.md) - Bot decision-making, archetype preferences
- [SYNDICATE-SYSTEM.md](SYNDICATE-SYSTEM.md) - Hidden role mechanics (similar asymmetric info)
- [PRD.md](../PRD.md) - Product requirements document

---

**END SPECIFICATION**
