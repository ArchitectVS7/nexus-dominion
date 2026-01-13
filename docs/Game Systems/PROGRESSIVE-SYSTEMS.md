# Progressive Systems

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-PROG
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/PROGRESSIVE-SYSTEMS.md

---

## Document Purpose

This document defines the Progressive Systems for Nexus Dominion, including tutorial onboarding, feature unlocks, checkpoints, and galactic events. These systems gradually introduce complexity, ensure player retention across sessions, and create shared narrative moments that affect all empires.

**Who Should Read This:**
- Backend developers implementing unlock conditions, checkpoint logic, and event triggers
- Game designers balancing tutorial pacing and event frequency
- Frontend developers building tutorial UI, notification systems, and checkpoint interfaces
- QA testers validating onboarding experience and event balance

**What This Resolves:**
- Complete tutorial sequence for first-time players (Turn 1-10)
- Turn-based feature unlock schedule (Diplomacy, Black Market, Nuclear Weapons)
- Checkpoint/save system for campaign games (200+ turns)
- Galactic event types, triggers, and empire-wide effects
- Integration with bot behavior and player notifications

**Design Philosophy:**
- **"Every game is someone's first game"**: Onboarding teaches core mechanics in 5 minutes
- **Progressive complexity**: Features unlock as players gain experience, not all at once
- **Teach through play**: Tutorial integrated into first turns, not separate mode
- **Respect player time**: Checkpoints enable play across multiple sessions
- **Shared narrative moments**: Galactic events create common experiences and challenges
- **Skippable but valuable**: Veterans can skip tutorial, but it's designed to be enjoyable

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

### 1.1 Progressive Complexity

Nexus Dominion introduces mechanics gradually over the first 100 turns, preventing cognitive overload for new players while maintaining depth for veterans.

**Tutorial Phase (Turns 1-10):**
- Turn 1-5: Learn sector management (your "neighborhood in space")
- Turn 6-10: Discover borders, attack basics, simple economy

**Early Game (Turns 11-50):**
- Turn 20: Full diplomacy unlocked (alliances, treaties, coalitions)
- Turn 30: Research draft (Tier 2 specializations available)
- Turn 50: Black Market access (covert operations, smuggling)

**Mid-Late Game (Turns 51-200):**
- Turn 100: Nuclear weapons unlocked (high-power strategic weapons)
- Turn 150+: Endgame events (galactic crises, final showdowns)

### 1.2 Key Mechanic: Learn By Playing

Unlike traditional tutorials that isolate players in a sandbox, Nexus Dominion teaches within the actual game:
- **Turn 1**: "Welcome, Commander. This is your sector. Click to explore."
- **Turn 2**: "Your sectors produce resources. Let's build a Food sector."
- **Turn 3**: "You have neighbors. Time to meet them—or conquer them."

Each turn introduces one new concept, with contextual tooltips and optional deeper explanations.

### 1.3 Player Experience

**New Player (First Game):**
- Guided through Turn 1-10 with clear objectives
- Each turn teaches one mechanic (building, attacking, resources)
- Can ask for help at any time via "?" button
- Skip tutorial option appears after Turn 3

**Veteran Player (Subsequent Games):**
- "Skip Tutorial" button on game start
- All features immediately available (no artificial locks)
- Can toggle "Advanced Mode" for minimal UI guidance

**Campaign Player (200-turn game):**
- Checkpoints every 20 turns (auto-save)
- Manual checkpoint at any time
- Resume from checkpoint within 7 days (cloud save)

---

## 2. Mechanics Overview

### 2.1 Feature Unlock Schedule

| Turn | Feature Unlocked | UI Notification | Tutorial Step |
|------|-----------------|-----------------|---------------|
| 1 | Sector management | "Welcome Commander" | Explore your sector |
| 3 | Military units | "Build Your Fleet" | Purchase first Fighter |
| 5 | Resource trading | "Galactic Market" | Buy/sell resources |
| 10 | Border discovery | "Your Neighbors" | View adjacent sectors |
| 20 | **Diplomacy** | "Diplomacy Unlocked" | Propose treaty to neighbor |
| 30 | Research draft | "Tech Tree Available" | Draft Tier 2 specialization |
| 50 | **Black Market** | "Covert Ops Unlocked" | Access spy missions |
| 100 | **Nuclear Weapons** | "WMDs Available" | Devastating strategic weapons |

**Unlock Conditions:**
- Turn threshold reached (primary condition)
- Player has completed prerequisite tutorial steps (for early unlocks)
- Player is not in "Skip Tutorial" mode (vets get all features immediately)

### 2.2 Checkpoint System

**Automatic Checkpoints:**
- Every 20 turns (Turn 20, 40, 60, etc.)
- Before major events (war declarations, nuclear launches)
- On victory conditions met

**Manual Checkpoints:**
- Player can save at any turn (max 3 manual saves per game)
- "Save & Exit" button creates checkpoint and quits
- Checkpoint includes full game state (all empires, market, events)

**Storage:**
- Checkpoints stored in cloud (authenticated users)
- Local fallback for offline play
- 7-day retention period (auto-delete after 7 days)

### 2.3 Galactic Events

**Event Frequency:**
- 1 event per 30 turns (average)
- Random trigger between turns 20-180
- Cannot occur during tutorial (Turns 1-10)

**Event Types:**

| Event | Effect | Duration | Frequency |
|-------|--------|----------|-----------|
| **Supernova** | Random sector destroyed | Instant | Rare (5%) |
| **Plague** | All empires lose 10% population | 5 turns | Uncommon (15%) |
| **Golden Age** | +20% income for all empires | 10 turns | Common (25%) |
| **Rebellion** | Random empire loses 2-5 sectors | Instant | Uncommon (15%) |
| **Wormhole Collapse** | All wormholes destroyed | Instant | Rare (5%) |
| **Tech Breakthrough** | Free Tier 2 research for all | Instant | Common (20%) |
| **Galactic War** | All empires at war (no treaties) | 15 turns | Rare (10%) |
| **Resource Boom** | 2× resource production | 8 turns | Common (25%) |

**Event Impact:**
- Affects **all empires** equally (no targeting)
- Creates strategic opportunities and challenges
- Announced 1 turn in advance (except Supernova)

---

## 3. Detailed Rules

### 3.1 Tutorial Sequence (Turns 1-10)

**Turn 1: Welcome & Sector Overview**
```
OBJECTIVE: Explore your starting sector

UI: Highlight starmap, show 5 starting sectors
Tutorial Text: "Welcome, Commander. This is your sector—your territory in
               the galaxy. You start with 5 sectors: Food, Ore, Petroleum,
               Commerce, and Urban. Click each to see what they produce."

SUCCESS: Player clicks all 5 sectors
REWARD: +500 credits bonus
NEXT: Turn 2 unlocked
```

**Turn 2: Building Your First Sector**
```
OBJECTIVE: Build a Food sector

UI: Highlight "Build Sector" button
Tutorial Text: "Your empire needs resources to grow. Food feeds your
               population. Let's build another Food sector."

GUIDANCE: "Food sectors cost 8,000 credits and produce 160 food/turn."
SUCCESS: Player builds any sector type (accepts deviation)
REWARD: Tutorial continues regardless of choice
NEXT: Turn 3 unlocked
```

**Turn 3: Military Basics**
```
OBJECTIVE: Purchase 10 Fighters

UI: Highlight "Build Units" button
Tutorial Text: "To expand or defend, you need military units. Fighters
               are versatile attack/defense units. Build 10 Fighters."

GUIDANCE: "Fighters cost 100 credits each. You need 1,000 credits total."
SUCCESS: Player owns 10+ Fighters
REWARD: +10 Fighters bonus (free reinforcements)
NEXT: Turn 4 unlocked, "Skip Tutorial" button appears
```

**Turn 4: Resource Management**
```
OBJECTIVE: View resource production

UI: Highlight resource panel
Tutorial Text: "Each turn, your sectors produce resources. Check your
               Food, Ore, Petroleum, and Credits. These sustain your empire."

SUCCESS: Player views resource panel
NEXT: Turn 5 unlocked
```

**Turn 5: Market Trading (Optional)**
```
OBJECTIVE: Buy or sell 1,000 units of any resource

UI: Highlight Market button
Tutorial Text: "The Galactic Market lets you convert resources. If you
               have excess Food, sell it for Credits. Need Ore? Buy it!"

SUCCESS: Player completes any market transaction
REWARD: -50% transaction fee (tutorial bonus)
NEXT: Turn 6 unlocked
```

**Turns 6-10: Discovery & Combat**
```
Turn 6: Discover border sectors (view neighbors)
Turn 7: Understand networth and victory conditions
Turn 8: Attack a neighbor (guided first battle)
Turn 9: Defend against counter-attack
Turn 10: Tutorial complete, all features unlocked early access
```

**Tutorial Completion:**
- "Tutorial Complete! You're ready for the galaxy."
- +5,000 credits bonus
- Option to replay tutorial from main menu

### 3.2 Feature Unlock Rules

**Diplomacy Unlock (Turn 20):**
```
TRIGGER: game_turn >= 20 AND NOT skip_tutorial

ON UNLOCK:
  - Enable treaty proposals (NAP, Alliance, Coalition)
  - Enable messaging to other empires
  - Show notification: "DIPLOMACY UNLOCKED: Forge alliances or betray rivals"
  - Highlight Diplomacy tab in UI

TUTORIAL (if first unlock):
  - "Diplomacy lets you form alliances. Click the Diplomacy tab."
  - "Propose a Non-Aggression Pact to a neighbor."
  - SUCCESS: Player proposes any treaty
```

**Black Market Unlock (Turn 50):**
```
TRIGGER: game_turn >= 50

ON UNLOCK:
  - Enable Covert Operations (10 spy mission types)
  - Enable smuggling (buy/sell contraband)
  - Enable agent recruitment
  - Show notification: "BLACK MARKET UNLOCKED: Hire spies and saboteurs"

TUTORIAL (if first unlock):
  - "Covert operations let you sabotage enemies without war."
  - "Hire 10 agents from the Government sector."
  - SUCCESS: Player owns 10+ agents
```

**Nuclear Weapons Unlock (Turn 100):**
```
TRIGGER: game_turn >= 100

ON UNLOCK:
  - Enable Nuclear Weapons research (if not already researched)
  - Enable nuclear launch capability
  - Show notification: "WMDs AVAILABLE: The ultimate deterrent—or weapon"

WARNING:
  - "Nuclear weapons cause massive destruction."
  - "Other empires will condemn their use."
  - "Launch only if you're prepared for retaliation."

NO TUTORIAL: Nuclear weapons are self-explanatory and intentionally dangerous
```

**Skip Tutorial Mode:**
```
IF player selects "Skip Tutorial" OR veteran_account:
  - ALL features unlocked immediately (Turn 1)
  - Turn-based unlocks disabled
  - No tutorial notifications
  - "Advanced Mode" enabled (minimal UI guidance)
```

### 3.3 Checkpoint Mechanics

**Automatic Checkpoint Creation:**
```
TRIGGER CONDITIONS:
  - Every 20 turns (Turn 20, 40, 60, ..., 200)
  - Before war declaration (if > 100 turns elapsed)
  - Before nuclear weapon launch
  - On victory condition met
  - On player elimination (defeat checkpoint)

CHECKPOINT DATA:
  - Full game state (all empires, sectors, units)
  - Market prices and transaction history
  - Bot relationships and emotional states
  - Active treaties and coalitions
  - Turn number and elapsed time
  - Player decisions log

STORAGE:
  - Cloud save (Supabase, authenticated users)
  - Local save (IndexedDB, fallback)
  - Compressed JSON (~500KB per checkpoint)

RETENTION:
  - 7 days for automatic checkpoints
  - 30 days for manual checkpoints
  - Permanent for victory/defeat checkpoints
```

**Manual Checkpoint Creation:**
```
TRIGGER: Player clicks "Save & Exit" or "Manual Save"

LIMITS:
  - Max 3 manual saves per game
  - Cannot save during bot turns (processing)
  - Cannot save during event resolution

UI:
  - "Save Game" button in main menu
  - "Save & Exit" button (saves and quits)
  - Checkpoint name: "Turn [N] - [Date]"

CONFIRMATION:
  - "Game saved. You can resume from Turn [N]."
  - Shows cloud sync status
```

**Resume from Checkpoint:**
```
UI: Main menu shows "Continue Game" button

CHECKPOINT LIST:
  - Shows all available checkpoints
  - Displays: Turn, Date, Empire Name, Status
  - Sorted by most recent

ON RESUME:
  - Load full game state
  - Restore market prices, bot states
  - Continue from exact turn
  - Show notification: "Resumed from Turn [N]"

EXPIRATION:
  - Checkpoints older than 7 days auto-deleted
  - Warning: "This checkpoint expires in 2 days"
```

### 3.4 Galactic Events

**Event Trigger System:**
```
EACH TURN (if turn >= 20):
  roll = random(1-100)

  if roll <= 3 AND no_active_event:
    trigger_galactic_event()

FREQUENCY:
  - 3% chance per turn
  - Approximately 1 event per 30 turns
  - Cannot occur during tutorial (Turns 1-10)
  - Max 1 active event at a time (no overlap)
```

**Event Details:**

**1. Supernova (5% probability)**
```
EFFECT: Random sector destroyed (unowned or weakest empire)
NOTIFICATION: "SUPERNOVA: A star has gone nova in [Sector Name]!"
IMPACT:
  - Sector removed from game (cannot be rebuilt)
  - All units in sector destroyed
  - Neighboring sectors unaffected
DURATION: Instant
STRATEGY: Creates power vacuum, opportunity for expansion
```

**2. Plague (15% probability)**
```
EFFECT: All empires lose 10% of population
NOTIFICATION: "PLAGUE: A deadly virus spreads across the galaxy!"
IMPACT:
  - All empires lose 10% population (rounded down)
  - Military upkeep costs increase (less pop to support army)
  - Lasts 5 turns
DURATION: 5 turns
STRATEGY: Hurts empires with large armies more than turtles
```

**3. Golden Age (25% probability)**
```
EFFECT: +20% income for all empires
NOTIFICATION: "GOLDEN AGE: Economic boom! All commerce flourishes!"
IMPACT:
  - All empires gain +20% credits from sectors
  - Market prices stable (no volatility)
DURATION: 10 turns
STRATEGY: Build economy, stockpile for post-boom
```

**4. Rebellion (15% probability)**
```
EFFECT: Random empire loses 2-5 sectors to independence
NOTIFICATION: "REBELLION: [Empire Name]'s sectors rebel!"
IMPACT:
  - Target: Weakest empire (lowest military power)
  - Loses 2-5 random sectors (become neutral)
  - Sectors can be recaptured by anyone
DURATION: Instant
STRATEGY: Opportunity to grab neutral sectors
```

**5. Wormhole Collapse (5% probability)**
```
EFFECT: All wormholes destroyed galaxy-wide
NOTIFICATION: "WORMHOLE COLLAPSE: Spatial anomalies destroy all wormholes!"
IMPACT:
  - Every empire loses all wormhole connections
  - Must rebuild (15,000-40,000 credits each)
  - Isolates distant empires
DURATION: Instant
STRATEGY: Heavily impacts expansion-focused empires
```

**6. Tech Breakthrough (20% probability)**
```
EFFECT: Free Tier 2 research for all empires
NOTIFICATION: "TECH BREAKTHROUGH: Galactic archives unlocked!"
IMPACT:
  - All empires gain 1 free Tier 2 research
  - Player chooses from available Tier 2 options
  - Bots choose based on archetype priorities
DURATION: Instant (permanent research)
STRATEGY: Accelerates mid-game tech race
```

**7. Galactic War (10% probability)**
```
EFFECT: All treaties dissolved, forced war state
NOTIFICATION: "GALACTIC WAR: All treaties are void! Total war erupts!"
IMPACT:
  - All NAPs, Alliances, Coalitions dissolved
  - Cannot form new treaties for 15 turns
  - All empires hostile to each other
DURATION: 15 turns
STRATEGY: Chaos benefits opportunists, hurts diplomats
```

**8. Resource Boom (25% probability)**
```
EFFECT: 2× resource production from all sectors
NOTIFICATION: "RESOURCE BOOM: Harvests and mining at record levels!"
IMPACT:
  - Food, Ore, Petroleum sectors produce 2× output
  - Does NOT affect Credits or Research Points
DURATION: 8 turns
STRATEGY: Stockpile resources, sell at market peak
```

**Event Announcement:**
```
TURN BEFORE EVENT:
  - Warning notification (except Supernova—instant)
  - "GALACTIC EVENT INCOMING: Prepare for [Event Type]"
  - Gives players 1 turn to react

DURING EVENT:
  - Banner at top of screen
  - Event icon in UI
  - Turn counter: "8 turns remaining"

AFTER EVENT:
  - "GALACTIC EVENT ENDED: [Event Type] concluded"
  - Summary of impact
```

---

## 4. Bot Integration

### 4.1 Bot Tutorial Behavior

During tutorial phase (Turns 1-10), bots have **reduced aggression** to allow player learning:

| Archetype | Tutorial Behavior | Normal Behavior |
|-----------|------------------|-----------------|
| **Warlord** | 0.3 attack priority | 0.9 attack priority |
| **Diplomat** | Proposes early NAP | Standard diplomacy |
| **Blitzkrieg** | Delayed rush (Turn 15+) | Attacks Turn 5-10 |
| **All Archetypes** | -50% attack damage | Standard damage |

**Rationale:** New players need time to learn without being crushed immediately.

### 4.2 Bot Event Reactions

**Supernova (Sector Destroyed):**
- **Opportunist**: Immediately attacks sector neighbors (land grab)
- **Warlord**: Assesses military opportunity
- **Turtle**: Reinforces own borders (fear of chaos)

**Plague (Population Loss):**
- **Merchant**: Sells military units (can't maintain upkeep)
- **Warlord**: Continues aggression (ignores penalty)
- **Turtle**: Hoards resources, defensive stance

**Golden Age (+20% Income):**
- **Merchant**: Invests in economy sectors
- **Warlord**: Buys military units
- **Research**: Stockpiles for research purchases

**Galactic War (All Treaties Void):**
- **Diplomat**: Distressed messages, seeks peace
- **Schemer**: Gleeful, opportunistic attacks
- **Warlord**: "Finally! No more diplomacy!"

### 4.3 Bot Messages

**On Tutorial Start (Turn 1):**
```
Diplomat: "Welcome to the galaxy, Commander. I hope we can be friends."
Warlord: "Another recruit enters the fray. Prove yourself or perish."
Merchant: "New to the market? I can offer guidance—for a price."
```

**On Feature Unlock (Diplomacy, Turn 20):**
```
Diplomat: "Ah, diplomacy is now available. Shall we discuss terms?"
Warlord: "Treaties are for the weak, but I'm listening."
Schemer: "Perfect timing. I have a... proposal for you."
```

**On Galactic Event (Supernova):**
```
All Empires (Global): "SUPERNOVA IN [SECTOR]! The stars themselves betray us!"

Warlord: "Chaos is opportunity. I claim the ruins."
Diplomat: "To all empires: We must cooperate in this crisis."
Turtle: "This confirms my defensive strategy. Stay vigilant."
```

---

## 5. UI/UX Design

### 5.1 Tutorial UI Mockup

**Turn 1 Tutorial Overlay:**
```
┌─────────────────────────────────────────────────────────┐
│  WELCOME, COMMANDER                          [Skip ✕]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  This is your sector—your territory in the galaxy.     │
│  You start with 5 sectors: Food, Ore, Petroleum,       │
│  Commerce, and Urban.                                   │
│                                                         │
│  OBJECTIVE: Click each sector to explore               │
│  Progress: [●●●○○] 3/5 sectors viewed                  │
│                                                         │
│  [STARMAP BELOW WITH HIGHLIGHTED SECTORS]              │
│                                                         │
│  [Need Help?]            [Continue ➜]                   │
└─────────────────────────────────────────────────────────┘
```

**Tutorial Checklist (Always Visible):**
```
┌─────────────────────────────┐
│  TUTORIAL PROGRESS          │
├─────────────────────────────┤
│  ✓ Explore sectors (Turn 1) │
│  ✓ Build sector (Turn 2)    │
│  ► Purchase units (Turn 3)  │
│  ○ View resources (Turn 4)  │
│  ○ Market trading (Turn 5)  │
│  ○ Discover borders (Turn 6)│
│                             │
│  [Skip Tutorial]            │
└─────────────────────────────┘
```

### 5.2 Feature Unlock Notifications

**Diplomacy Unlocked (Turn 20):**
```
┌─────────────────────────────────────────────┐
│  🌟 FEATURE UNLOCKED: DIPLOMACY             │
├─────────────────────────────────────────────┤
│  You can now form alliances, propose        │
│  treaties, and join coalitions.             │
│                                             │
│  Click the Diplomacy tab to get started.   │
│                                             │
│  [VIEW DIPLOMACY]          [DISMISS]        │
└─────────────────────────────────────────────┘
```

**Nuclear Weapons Unlocked (Turn 100):**
```
┌─────────────────────────────────────────────┐
│  ⚠️ WMDs AVAILABLE                          │
├─────────────────────────────────────────────┤
│  Nuclear weapons are now accessible.        │
│                                             │
│  WARNING: Massive destruction, global       │
│  condemnation, and retaliation likely.      │
│                                             │
│  Launch only if you're prepared for war.    │
│                                             │
│  [UNDERSTOOD]                               │
└─────────────────────────────────────────────┘
```

### 5.3 Galactic Event UI

**Event Announcement (1 Turn Before):**
```
┌─────────────────────────────────────────────────────────┐
│  ⚡ GALACTIC EVENT INCOMING                             │
├─────────────────────────────────────────────────────────┤
│  GALACTIC WAR will begin next turn!                     │
│                                                         │
│  EFFECT: All treaties will be dissolved.               │
│          No new treaties for 15 turns.                  │
│                                                         │
│  Prepare your defenses and strategies.                 │
│                                                         │
│  [ACKNOWLEDGE]                                          │
└─────────────────────────────────────────────────────────┘
```

**Active Event Banner (During Event):**
```
┌─────────────────────────────────────────────────────────┐
│  🔥 GALACTIC WAR ACTIVE (12 turns remaining)            │
│  All treaties void. Total war erupts!                   │
└─────────────────────────────────────────────────────────┘
[Displayed at top of every screen during event]
```

### 5.4 Checkpoint UI

**Save & Exit Flow:**
```
Player clicks "Save & Exit"
  ↓
┌─────────────────────────────────┐
│  SAVE GAME?                     │
├─────────────────────────────────┤
│  Checkpoint: Turn 45            │
│  Date: 2026-01-12 15:30        │
│                                 │
│  Your progress will be saved.   │
│  You can resume within 7 days.  │
│                                 │
│  [CANCEL]     [SAVE & EXIT]     │
└─────────────────────────────────┘
  ↓
Save successful
  ↓
Return to main menu
```

**Resume Game UI:**
```
Main Menu:

┌─────────────────────────────────────────┐
│  CONTINUE GAME                          │
├─────────────────────────────────────────┤
│  Turn 45 - Empire "Zeta Command"       │
│  Saved: 2026-01-12 15:30               │
│  Expires: 2026-01-19 (6 days)          │
│                                         │
│  [RESUME]          [DELETE]             │
└─────────────────────────────────────────┘
```

### 5.5 Visual Design Principles

**Color Coding:**
- **Blue**: Tutorial steps, helpful guidance
- **Green**: Feature unlocked, positive events (Golden Age)
- **Yellow**: Warning, event incoming
- **Red**: Danger, destructive events (Supernova, Galactic War)
- **Purple**: Checkpoints, save/load

**Tutorial Style:**
- Non-intrusive overlays (can be minimized)
- Always visible progress checklist
- "Skip Tutorial" option after Turn 3

**Event Style:**
- Dramatic banners (full-width)
- Animated icons for event types
- Clear turn counters for duration

---

## 6. Specifications

This section contains formal requirements for spec-driven development. Each specification:
- Has a unique ID for traceability
- Links to code and tests
- Can be validated independently

### Specification Status Legend

| Status | Meaning |
|--------|---------|
| **Draft** | Design complete, not yet implemented |
| **Implemented** | Code exists, tests pending |
| **Validated** | Code exists and tests pass |
| **Deprecated** | Superseded by another spec |

---

### REQ-PROG-001: Feature Unlocks (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-PROG-001-A through REQ-PROG-001-D.

---

### REQ-PROG-001-A: Diplomacy Feature Unlock

**Description:** Diplomacy features (treaties, alliances, coalitions) unlock at Turn 20. Before Turn 20, diplomacy UI and actions are disabled. At Turn 20 and after, all diplomacy features become available.

**Rationale:** Introduces diplomacy gradually after players establish their initial empire. Prevents overwhelming new players with too many systems at once.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock Turn | 20 | Diplomacy becomes available |
| Features Unlocked | Treaties, alliances, coalitions | Full diplomacy system |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1

**Code:**
- `src/lib/constants/unlocks.ts` - Diplomacy unlock threshold
- `src/lib/game/feature-unlocks.ts` - `isFeatureUnlocked('diplomacy')`

**Tests:**
- `src/lib/game/__tests__/feature-unlocks.test.ts` - Diplomacy unlock tests

**Status:** Draft

---

### REQ-PROG-001-B: Black Market Feature Unlock

**Description:** Black Market features (covert operations, smuggling) unlock at Turn 50. Before Turn 50, covert ops and black market UI are disabled. At Turn 50 and after, all covert operations become available.

**Rationale:** Introduces covert operations at mid-game when players understand basic mechanics. Adds strategic depth after initial expansion phase.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock Turn | 50 | Black Market becomes available |
| Features Unlocked | Covert operations, smuggling | Full espionage system |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1

**Code:**
- `src/lib/constants/unlocks.ts` - Black Market unlock threshold
- `src/lib/game/feature-unlocks.ts` - `isFeatureUnlocked('blackMarket')`

**Tests:**
- `src/lib/game/__tests__/feature-unlocks.test.ts` - Black Market unlock tests

**Status:** Draft

---

### REQ-PROG-001-C: Nuclear Weapons Feature Unlock

**Description:** Nuclear weapons unlock at Turn 100. Before Turn 100, nuclear weapons cannot be built or used. At Turn 100 and after, nuclear weapons become available for production and deployment.

**Rationale:** Reserves ultimate weapons for late game. Ensures early/mid game focuses on conventional warfare and strategy before introducing endgame mechanics.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Unlock Turn | 100 | Nuclear weapons become available |
| Features Unlocked | Nuclear weapon production and use | Endgame weaponry |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.1

**Code:**
- `src/lib/constants/unlocks.ts` - Nuclear weapons unlock threshold
- `src/lib/game/feature-unlocks.ts` - `isFeatureUnlocked('nuclearWeapons')`

**Tests:**
- `src/lib/game/__tests__/feature-unlocks.test.ts` - Nuclear weapons unlock tests

**Status:** Draft

---

### REQ-PROG-001-D: Veteran Override for Feature Unlocks

**Description:** If player selects "Skip Tutorial" during game setup or has veteran account status, all features (Diplomacy, Black Market, Nuclear Weapons) unlock immediately at Turn 1, bypassing turn threshold requirements.

**Rationale:** Veterans and experienced players get full access immediately. Respects player experience level and reduces friction for returning players.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Override Triggers | "Skip Tutorial" or veteran account | Conditions for override |
| Override Turn | 1 | All features available immediately |
| Features Affected | All (Diplomacy, Black Market, Nuclear Weapons) | Complete system access |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/game/feature-unlocks.ts` - Veteran override logic

**Tests:**
- `src/lib/game/__tests__/feature-unlocks.test.ts` - Veteran override tests

**Status:** Draft

---

### REQ-PROG-002: Game Checkpoints (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-PROG-002-A through REQ-PROG-002-C.

---

### REQ-PROG-002-A: Automatic Checkpoint System

**Description:** Game state automatically saves every 20 turns (Turn 20, 40, 60, 80...). Automatic checkpoints have 7-day retention in cloud storage before expiring and being deleted.

**Rationale:** Provides safety net for long campaign games. Players protected from data loss without manual action. Short retention keeps storage costs manageable.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Auto Checkpoint Interval | 20 turns | Triggers at Turn 20, 40, 60... |
| Auto Retention | 7 days | Cloud storage before expiry |
| Checkpoint Size | ~500KB | Compressed JSON format |
| Trigger Timing | End of turn processing | After turn completion |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2

**Code:**
- `src/lib/game/services/events/checkpoint-service.ts` - Auto-save logic
- `src/lib/storage/cloud-save.ts` - Cloud upload

**Tests:**
- `src/lib/game/services/events/__tests__/checkpoint-service.test.ts` - Auto-save tests

**Status:** Draft

---

### REQ-PROG-002-B: Manual Checkpoint System

**Description:** Players can manually trigger checkpoint saves with maximum 3 manual checkpoints per game. Manual checkpoints have 30-day retention in cloud storage. Exceeding 3 saves requires deleting an existing manual checkpoint first.

**Rationale:** Gives players control over important game moments. Longer retention rewards deliberate saves. Limit prevents storage abuse.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Manual Checkpoint Limit | 3 saves | Per game |
| Manual Retention | 30 days | Cloud storage before expiry |
| Checkpoint Size | ~500KB | Compressed JSON format |
| UI Trigger | Player-initiated | Save button in game menu |

**Enforcement Logic:**
```
if (manual_checkpoints.length >= 3) {
  show_error("Maximum 3 manual checkpoints. Delete one first.")
} else {
  create_manual_checkpoint()
}
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2

**Code:**
- `src/lib/game/services/events/checkpoint-service.ts` - Manual save logic
- `src/lib/storage/cloud-save.ts` - Cloud upload
- `src/app/game/GameMenu.tsx` - Manual save UI

**Tests:**
- `src/lib/game/services/events/__tests__/checkpoint-service.test.ts` - Manual save tests

**Status:** Draft

---

### REQ-PROG-002-C: Checkpoint Resume and Cloud Storage

**Description:** Players can resume from any checkpoint (automatic or manual) within its retention period. Checkpoints stored as compressed JSON (~500KB) in cloud storage. Expired checkpoints automatically deleted and unavailable for resume.

**Rationale:** Enables campaign continuation across sessions. Cloud storage ensures saves persist across devices. Automatic expiry manages storage costs.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Checkpoint Format | Compressed JSON | ~500KB per save |
| Storage Location | Cloud | Cross-device sync |
| Resume Availability | Within retention window | 7 days (auto) or 30 days (manual) |
| Expired Behavior | Deleted, unavailable | Automatic cleanup |

**Resume Flow:**
```
1. Player selects "Load Game"
2. Fetch available checkpoints from cloud (within retention)
3. Display list with metadata (turn, date, type)
4. Player selects checkpoint
5. Load game state from checkpoint
6. Resume gameplay from saved turn
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.3

**Code:**
- `src/lib/game/services/events/checkpoint-service.ts` - Resume logic
- `src/lib/storage/cloud-save.ts` - Cloud fetch and cleanup

**Tests:**
- `src/lib/game/services/events/__tests__/checkpoint-service.test.ts` - Resume tests

**Status:** Draft

---

### REQ-PROG-003: Galactic Events (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-PROG-003-01 through REQ-PROG-003-09 for individual event definitions and system rules.

**Overview:** Random galactic events create shared challenges affecting all empires. 8 event types with varying probabilities, durations, and impacts.

---

### REQ-PROG-003-01: Supernova Event

**Description:** Supernova event has 5% probability when events trigger. Destroys a random sector instantly (unowned or from weakest empire). No advance warning.

**Rationale:** Rare catastrophic event creating power vacuum. Instant effect prevents preparation, encouraging opportunistic expansion.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 5% (when event triggers) |
| Duration | Instant |
| Effect | Random sector destroyed permanently |
| Target | Unowned or weakest empire's sector |
| Warning | None (instant) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `SupernovaEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerSupernova()`

**Tests:**
- `src/lib/game/services/events/__tests__/supernova.test.ts` - Supernova effects

**Status:** Draft

---

### REQ-PROG-003-02: Plague Event

**Description:** Plague event has 15% probability when events trigger. All empires lose 10% of population for 5 turns.

**Rationale:** Common harmful event affecting all equally. Hurts empires with large armies more (higher upkeep costs with less population).

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 15% (when event triggers) |
| Duration | 5 turns |
| Effect | -10% population (all empires) |
| Impact | Increased military upkeep burden |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `PlagueEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerPlague()`

**Tests:**
- `src/lib/game/services/events/__tests__/plague.test.ts` - Plague effects

**Status:** Draft

---

### REQ-PROG-003-03: Golden Age Event

**Description:** Golden Age event has 25% probability when events trigger. All empires gain +20% income for 10 turns.

**Rationale:** Most common positive event. Accelerates economic game. Benefits all equally, creating stockpiling opportunities.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 25% (when event triggers) |
| Duration | 10 turns |
| Effect | +20% credits from sectors |
| Market Impact | Stable prices (no volatility) |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `GoldenAgeEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerGoldenAge()`

**Tests:**
- `src/lib/game/services/events/__tests__/golden-age.test.ts` - Golden Age effects

**Status:** Draft

---

### REQ-PROG-003-04: Rebellion Event

**Description:** Rebellion event has 15% probability when events trigger. Weakest empire loses 2-5 random sectors to independence (become neutral). Instant effect.

**Rationale:** Punishes weakest empire, creates neutral territory grab opportunity. Anti-snowball mechanic favoring stronger empires.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 15% (when event triggers) |
| Duration | Instant |
| Effect | 2-5 sectors become neutral |
| Target | Weakest empire (lowest military power) |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `RebellionEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerRebellion()`

**Tests:**
- `src/lib/game/services/events/__tests__/rebellion.test.ts` - Rebellion effects

**Status:** Draft

---

### REQ-PROG-003-05: Wormhole Collapse Event

**Description:** Wormhole Collapse event has 5% probability when events trigger. All wormholes destroyed galaxy-wide. Instant effect.

**Rationale:** Rare catastrophic event isolating distant empires. Heavily impacts expansion-focused strategies. Expensive to rebuild.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 5% (when event triggers) |
| Duration | Instant |
| Effect | All wormholes destroyed |
| Rebuild Cost | 15,000-40,000 cr each |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `WormholeCollapseEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerWormholeCollapse()`

**Tests:**
- `src/lib/game/services/events/__tests__/wormhole-collapse.test.ts` - Wormhole destruction

**Status:** Draft

---

### REQ-PROG-003-06: Tech Breakthrough Event

**Description:** Tech Breakthrough event has 20% probability when events trigger. All empires gain 1 free Tier 2 research. Instant effect (permanent research).

**Rationale:** Common positive event accelerating tech race. Players choose research, bots auto-select by archetype. Mid-game accelerator.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 20% (when event triggers) |
| Duration | Instant (permanent) |
| Effect | Free Tier 2 research for all |
| Player Choice | From available Tier 2 options |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `TechBreakthroughEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerTechBreakthrough()`

**Tests:**
- `src/lib/game/services/events/__tests__/tech-breakthrough.test.ts` - Free research

**Status:** Draft

---

### REQ-PROG-003-07: Galactic War Event

**Description:** Galactic War event has 10% probability when events trigger. All treaties dissolved, no new treaties for 15 turns. All empires hostile.

**Rationale:** Rare chaos event forcing total war. Hurts diplomatic strategies, benefits opportunists. Longest duration event.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 10% (when event triggers) |
| Duration | 15 turns |
| Effect | All treaties void, war state |
| Treaty Lock | Cannot form treaties for duration |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `GalacticWarEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerGalacticWar()`

**Tests:**
- `src/lib/game/services/events/__tests__/galactic-war.test.ts` - Treaty dissolution

**Status:** Draft

---

### REQ-PROG-003-08: Resource Boom Event

**Description:** Resource Boom event has 25% probability when events trigger. Food, Ore, Petroleum sectors produce 2× output for 8 turns. Does NOT affect Credits or Research Points.

**Rationale:** Most common positive event (tied with Golden Age). Accelerates resource game. Creates stockpiling and market selling opportunities.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Probability | 25% (when event triggers) |
| Duration | 8 turns |
| Effect | 2× production (Food, Ore, Petroleum only) |
| Exclusions | Credits, Research Points unaffected |
| Warning | 1 turn advance |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-types.ts` - `ResourceBoomEvent` class
- `src/lib/game/services/events/event-service.ts` - `triggerResourceBoom()`

**Tests:**
- `src/lib/game/services/events/__tests__/resource-boom.test.ts` - Resource doubling

**Status:** Draft

---

### REQ-PROG-003-09: Galactic Event System Rules

**Description:** Galactic event system rules: 3% trigger chance per turn (average 1 event per 30 turns). Max 1 active event at a time. Cannot occur during tutorial (Turns 1-10). Warning notification 1 turn before (except Supernova).

**Rationale:** Shared system rules governing all galactic events. Tutorial grace period prevents overwhelming new players. Max 1 event prevents compounding chaos.

**Key Values:**
| Rule | Value |
|------|-------|
| Trigger Chance | 3% per turn |
| Average Frequency | 1 event per 30 turns |
| Max Active Events | 1 |
| Tutorial Grace Period | No events before Turn 10 |
| Advance Warning | 1 turn (except Supernova) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3, 3.4

**Code:**
- `src/lib/game/services/events/event-service.ts` - `canTriggerEvent()`, `selectEventType()`

**Tests:**
- `src/lib/game/services/events/__tests__/event-system.test.ts` - System rules

**Status:** Draft

---

### REQ-PROG-004: Tutorial Sequence (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-PROG-004-A through REQ-PROG-004-D.

---

### REQ-PROG-004-A: Tutorial Sequence Structure

**Description:** First-time players experience guided tutorial from Turns 1-10. Each turn introduces one new game mechanic in context of actual gameplay. Tutorial integrated into first game, not a separate sandbox mode.

**Rationale:** Teaches core mechanics progressively without overwhelming new players. Context-based learning more effective than abstract instruction.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Duration | Turns 1-10 | 10-turn guided experience |
| Pacing | 1 mechanic per turn | Progressive introduction |
| Mode | Integrated gameplay | Not separate sandbox |
| Target Audience | First-time players | Auto-activates for new accounts |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1

**Code:**
- `src/lib/tutorial/tutorial-service.ts` - Tutorial state machine
- `src/app/tutorial/TutorialOverlay.tsx` - Tutorial UI overlay

**Tests:**
- `src/lib/tutorial/__tests__/tutorial-service.test.ts` - Sequence tests

**Status:** Draft

---

### REQ-PROG-004-B: Tutorial Objectives and Success Criteria

**Description:** Each tutorial turn presents specific objectives with clear success criteria. Examples: "Explore 5 sectors" (Turn 1), "Build 10 Fighters" (Turn 3). Objectives tied to mechanic being taught that turn.

**Rationale:** Clear goals give players immediate targets. Success criteria provide measurable progress. Objectives demonstrate practical use of mechanics.

**Objective Examples:**
| Turn | Objective | Mechanic Taught | Success Criteria |
|------|-----------|-----------------|------------------|
| 1 | Explore 5 sectors | Sector exploration | 5 sectors revealed |
| 3 | Build 10 Fighters | Unit production | 10 Fighters completed |
| 10 | Tutorial complete | All mechanics | All objectives completed |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1

**Code:**
- `src/lib/tutorial/tutorial-service.ts` - Objective tracking
- `src/app/tutorial/TutorialOverlay.tsx` - Objective display

**Tests:**
- `src/lib/tutorial/__tests__/tutorial-service.test.ts` - Objective completion tests

**Status:** Draft

---

### REQ-PROG-004-C: Tutorial Completion Rewards

**Description:** Players receive rewards for completing tutorial objectives. Per-objective rewards (+500 credits, +10 units) granted upon milestone completion. Final completion bonus of +5,000 credits awarded at Turn 10 when all objectives complete.

**Rationale:** Rewards incentivize objective completion. Early resources help new players establish foothold. Completion bonus celebrates achievement.

**Reward Table:**
| Turn/Milestone | Objective | Reward | Notes |
|----------------|-----------|--------|-------|
| Turn 1 | Explore 5 sectors | +500 credits | Early funding |
| Turn 3 | Build 10 Fighters | +10 Fighters | Unit boost |
| Turn 10 | Tutorial complete | +5,000 credits | Completion bonus |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1

**Code:**
- `src/lib/tutorial/tutorial-service.ts` - Reward distribution

**Tests:**
- `src/lib/tutorial/__tests__/tutorial-service.test.ts` - Reward grant tests

**Status:** Draft

---

### REQ-PROG-004-D: Skip Tutorial Option

**Description:** "Skip Tutorial" button becomes available after Turn 3. Veterans or confident new players can bypass remaining tutorial content immediately. Skipping exits tutorial mode and returns to normal gameplay.

**Rationale:** Respects player autonomy. Veterans shouldn't be forced through tutorial. Turn 3 threshold ensures minimal introduction before allowing skip.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Skip Availability | Turn 3+ | Button appears after Turn 3 |
| Skip Effect | Exit tutorial immediately | Return to normal gameplay |
| Skip Rewards | Forfeit remaining rewards | Only keep rewards earned before skip |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1

**Code:**
- `src/lib/tutorial/tutorial-service.ts` - Skip logic
- `src/app/tutorial/TutorialOverlay.tsx` - Skip button UI

**Tests:**
- `src/lib/tutorial/__tests__/tutorial-service.test.ts` - Skip functionality tests

**Status:** Draft

---

### REQ-PROG-005: Bot Tutorial Passivity (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-PROG-005-A through REQ-PROG-005-C.

---

### REQ-PROG-005-A: Warlord/Blitzkrieg Attack Priority Reduction

**Description:** During tutorial phase (Turns 1-10), Warlord and Blitzkrieg archetype attack priority reduced from 0.9 to 0.3. Returns to normal 0.9 after Turn 10 or if player skips tutorial.

**Rationale:** Reduces likelihood of aggressive early attacks on new players. Warlord/Blitzkrieg archetypes most likely to attack early, so priority reduction creates breathing room for learning.

**Key Values:**
| Parameter | Tutorial Value | Normal Value | Notes |
|-----------|---------------|--------------|-------|
| Warlord Attack Priority | 0.3 | 0.9 | During Turns 1-10 |
| Blitzkrieg Attack Priority | 0.3 | 0.9 | During Turns 1-10 |
| Tutorial Duration | Turns 1-10 | N/A | Or until skip |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1

**Code:**
- `src/lib/bots/tutorial-mode.ts` - Priority adjustment logic
- `src/lib/bots/archetypes/warlord.ts` - Warlord priority override
- `src/lib/bots/archetypes/blitzkrieg.ts` - Blitzkrieg priority override

**Tests:**
- `src/lib/bots/__tests__/tutorial-mode.test.ts` - Priority reduction tests

**Status:** Draft

---

### REQ-PROG-005-B: Bot Damage Reduction

**Description:** During tutorial phase (Turns 1-10), all bot attack damage reduced by 50% (0.5× damage modifier). Returns to normal 1.0× damage after Turn 10 or if player skips tutorial.

**Rationale:** Softens impact when bots do attack. New players can survive early mistakes without being immediately eliminated. Creates forgiving learning environment.

**Key Values:**
| Parameter | Tutorial Value | Normal Value | Notes |
|-----------|---------------|--------------|-------|
| Bot Damage Modifier | 0.5× | 1.0× | Applies to all bots |
| Tutorial Duration | Turns 1-10 | N/A | Or until skip |
| Affected Bots | All archetypes | N/A | Universal reduction |

**Formula:**
```
Tutorial Damage = Base Damage × 0.5
Normal Damage = Base Damage × 1.0
```

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1

**Code:**
- `src/lib/bots/tutorial-mode.ts` - Damage modifier
- `src/lib/combat/damage-calculation.ts` - Apply tutorial modifier

**Tests:**
- `src/lib/bots/__tests__/tutorial-mode.test.ts` - Damage reduction tests

**Status:** Draft

---

### REQ-PROG-005-C: Blitzkrieg Rush Delay

**Description:** During tutorial phase (Turns 1-10), Blitzkrieg archetype early rush timing delayed from Turn 5-10 to Turn 15+. Returns to normal Turn 5-10 timing after Turn 10 or if player skips tutorial.

**Rationale:** Prevents overwhelming early aggression from Blitzkrieg's signature rush strategy. Gives new players time to establish defenses before facing coordinated early-game assault.

**Key Values:**
| Parameter | Tutorial Value | Normal Value | Notes |
|-----------|---------------|--------------|-------|
| Blitzkrieg Rush Timing | Turn 15+ | Turn 5-10 | Delayed during tutorial |
| Tutorial Duration | Turns 1-10 | N/A | Or until skip |
| Affected Archetype | Blitzkrieg only | N/A | Specific to rush archetype |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1

**Code:**
- `src/lib/bots/tutorial-mode.ts` - Rush timing override
- `src/lib/bots/archetypes/blitzkrieg.ts` - Rush delay logic

**Tests:**
- `src/lib/bots/__tests__/tutorial-mode.test.ts` - Rush delay tests

**Status:** Draft

---

### REQ-PROG-006: Event Announcements

**Description:** Galactic events announced 1 turn before occurrence (except Supernova):
- Warning notification: "GALACTIC EVENT INCOMING: [Type]"
- Active event banner during duration
- Turn counter showing remaining duration
- End notification when event concludes

**Rationale:** Gives players time to react and prepare. Banner ensures visibility during multi-turn events.

**Source:** Section 3.4, 5.3

**Code:**
- `src/lib/game/services/events/event-announcements.ts`
- `src/app/components/EventBanner.tsx`

**Tests:**
- `src/lib/game/services/events/__tests__/event-announcements.test.ts`

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-PROG-001 | Feature Unlocks | Draft | `feature-unlocks.test.ts` |
| REQ-PROG-002 | Game Checkpoints | Draft | `checkpoint-service.test.ts` |
| REQ-PROG-003 | Galactic Events | Draft | `event-service.test.ts` |
| REQ-PROG-004 | Tutorial Sequence | Draft | `tutorial-service.test.ts` |
| REQ-PROG-005 | Bot Tutorial Passivity | Draft | `tutorial-mode.test.ts` |
| REQ-PROG-006 | Event Announcements | Draft | `event-announcements.test.ts` |

**Total Specifications:** 6
**Implemented:** 0
**Validated:** 0
**Draft:** 6

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: game_checkpoints
-- Purpose: Store saved game states for resume

CREATE TABLE game_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id),
  turn_number INTEGER NOT NULL,
  checkpoint_type VARCHAR(20) NOT NULL, -- 'auto', 'manual', 'victory', 'defeat'
  game_state JSONB NOT NULL, -- Full serialized game state
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL -- 7 or 30 days from creation
);

-- Indexes
CREATE INDEX idx_checkpoints_game ON game_checkpoints(game_id, turn_number DESC);
CREATE INDEX idx_checkpoints_player ON game_checkpoints(player_id, created_at DESC);
CREATE INDEX idx_checkpoints_expiry ON game_checkpoints(expires_at) WHERE expires_at > NOW();

-- Table: galactic_events
-- Purpose: Track active and historical events

CREATE TABLE galactic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'supernova', 'plague', 'golden_age', etc.
  start_turn INTEGER NOT NULL,
  end_turn INTEGER, -- NULL for instant events
  is_active BOOLEAN DEFAULT TRUE,
  event_data JSONB, -- Event-specific parameters (e.g., affected sector)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_game_active ON galactic_events(game_id, is_active);

-- Table: tutorial_progress
-- Purpose: Track player tutorial completion

CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES users(id),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1, -- Turn 1-10
  completed_steps JSONB NOT NULL DEFAULT '[]', -- Array of completed step IDs
  is_skipped BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tutorial_player ON tutorial_progress(player_id, game_id);
```

### 7.2 Service Architecture

```typescript
// src/lib/game/services/tutorial-service.ts

export interface TutorialStep {
  turn: number;
  title: string;
  objective: string;
  successCondition: (gameState: GameState) => boolean;
  reward?: {
    credits?: number;
    units?: { type: UnitType; quantity: number };
  };
}

export class TutorialService {
  /**
   * Check if tutorial step is complete
   * @spec REQ-PROG-004
   */
  async checkStepCompletion(
    gameId: string,
    playerId: string,
    step: TutorialStep
  ): Promise<boolean> {
    // Evaluate success condition
    // Award rewards if newly completed
    // Update tutorial progress
  }

  /**
   * Skip remaining tutorial steps
   * @spec REQ-PROG-004
   */
  async skipTutorial(gameId: string, playerId: string): Promise<void> {
    // Mark tutorial as skipped
    // Unlock all features immediately
  }
}

// src/lib/game/services/events/checkpoint-service.ts

export class CheckpointService {
  /**
   * Create automatic checkpoint
   * @spec REQ-PROG-002
   */
  async createAutoCheckpoint(gameId: string): Promise<Checkpoint> {
    // Serialize full game state
    // Compress to JSONB
    // Store in database
    // Set 7-day expiration
  }

  /**
   * Create manual checkpoint
   * @spec REQ-PROG-002
   */
  async createManualCheckpoint(
    gameId: string,
    playerId: string
  ): Promise<Checkpoint> {
    // Validate max 3 manual saves
    // Serialize game state
    // Store with 30-day expiration
  }

  /**
   * Resume from checkpoint
   * @spec REQ-PROG-002
   */
  async resumeFromCheckpoint(checkpointId: string): Promise<GameState> {
    // Load checkpoint data
    // Deserialize game state
    // Restore all empires, market, bots
    // Return to gameplay
  }
}

// src/lib/game/services/events/event-service.ts

export class GalacticEventService {
  /**
   * Check for event trigger
   * @spec REQ-PROG-003
   */
  async checkEventTrigger(gameId: string, turn: number): Promise<void> {
    // 3% chance per turn
    // Cannot occur during tutorial
    // Max 1 active event
    // Select random event type
  }

  /**
   * Apply event effects
   * @spec REQ-PROG-003
   */
  async applyEventEffects(
    gameId: string,
    event: GalacticEvent
  ): Promise<void> {
    // Apply event-specific effects
    // Notify all empires
    // Update bot behavior
  }
}
```

### 7.3 Server Actions

```typescript
// src/app/actions/tutorial-actions.ts

"use server";

/**
 * Skip tutorial
 * @spec REQ-PROG-004
 */
export async function skipTutorial(gameId: string): Promise<ActionResult> {
  const tutorialService = new TutorialService();
  await tutorialService.skipTutorial(gameId, userId);

  return {
    success: true,
    message: "Tutorial skipped. All features unlocked."
  };
}

// src/app/actions/checkpoint-actions.ts

"use server";

/**
 * Create manual checkpoint
 * @spec REQ-PROG-002
 */
export async function createCheckpoint(
  gameId: string
): Promise<ActionResult> {
  const checkpointService = new CheckpointService();
  const checkpoint = await checkpointService.createManualCheckpoint(
    gameId,
    userId
  );

  return {
    success: true,
    message: `Game saved at Turn ${checkpoint.turnNumber}`,
    data: checkpoint
  };
}
```

### 7.4 UI Components

```typescript
// src/app/tutorial/TutorialOverlay.tsx

interface TutorialOverlayProps {
  currentStep: TutorialStep;
  progress: number; // 0.0-1.0
  onSkip: () => void;
  onContinue: () => void;
}

export function TutorialOverlay({
  currentStep,
  progress,
  onSkip,
  onContinue
}: TutorialOverlayProps) {
  return (
    <div className="tutorial-overlay">
      <h2>{currentStep.title}</h2>
      <p>{currentStep.objective}</p>
      <ProgressBar value={progress} />
      <button onClick={onSkip}>Skip Tutorial</button>
      <button onClick={onContinue}>Continue</button>
    </div>
  );
}

// src/app/components/EventBanner.tsx

interface EventBannerProps {
  event: GalacticEvent;
  turnsRemaining?: number;
}

export function EventBanner({ event, turnsRemaining }: EventBannerProps) {
  return (
    <div className={`event-banner event-${event.type}`}>
      <span className="event-icon">{getEventIcon(event.type)}</span>
      <span className="event-name">{event.name}</span>
      {turnsRemaining && (
        <span className="event-duration">({turnsRemaining} turns remaining)</span>
      )}
    </div>
  );
}
```

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| Tutorial completion rate | 70-80% | ±10% | Track players who finish Turn 10 |
| Tutorial skip rate | 15-25% | ±10% | Veterans + impatient players |
| Event frequency | 1 per 30 turns | ±10 turns | Simulation average |
| Checkpoint usage | 40-60% of players | ±15% | Players who save manually |
| Tutorial time to complete | 5-10 minutes | ±3 min | Average Turn 1-10 duration |

### 8.2 Simulation Requirements

**Monte Carlo: 1,000 iterations**

**Variables:**
- 100 empires per game
- 200 turns per game
- Random event triggers (3% per turn)
- Tutorial completion vs skip rates

**Success Criteria:**
- Tutorial completion rate 70-80%
- Average ~6-7 galactic events per game
- No event dominates (max 30% occurrence)
- Checkpoint system used by 50%+ of players

### 8.3 Playtest Checklist

**Scenario 1: New Player Onboarding**
- [ ] Tutorial starts automatically on first game
- [ ] Turn 1 objective is clear and achievable
- [ ] Tutorial progresses smoothly through Turns 1-10
- [ ] Player understands core mechanics by Turn 10
- [ ] "Skip Tutorial" button appears after Turn 3

**Scenario 2: Veteran Player Experience**
- [ ] "Skip Tutorial" works on first click
- [ ] All features unlocked immediately (Turn 1)
- [ ] No tutorial overlays appear
- [ ] Game plays normally without guidance

**Scenario 3: Feature Unlocks**
- [ ] Diplomacy unlocks at Turn 20
- [ ] Black Market unlocks at Turn 50
- [ ] Nuclear Weapons unlock at Turn 100
- [ ] Notifications appear on unlock
- [ ] Features work immediately after unlock

**Scenario 4: Checkpoint System**
- [ ] Auto checkpoint created at Turn 20
- [ ] Manual checkpoint succeeds (player has <3 saves)
- [ ] Manual checkpoint fails at 4th save (error shown)
- [ ] Resume from checkpoint restores exact game state
- [ ] Checkpoint expires after 7 days (auto) or 30 days (manual)

**Scenario 5: Galactic Events**
- [ ] Event triggers randomly (3% chance per turn)
- [ ] Event announced 1 turn before (except Supernova)
- [ ] Event effects apply to all empires
- [ ] Event banner displays during duration
- [ ] Event ends after specified turns

**Scenario 6: Bot Tutorial Behavior**
- [ ] Bots are passive during Turns 1-10
- [ ] Warlord deals -50% damage in tutorial
- [ ] Blitzkrieg doesn't rush until Turn 15+
- [ ] Bots return to normal after Turn 10

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| Stub document (57 lines, 3 specs) | Full progressive systems design | Create complete document with 6 specs |
| No tutorial system | Guided onboarding (Turns 1-10) | Implement tutorial service |
| Features always unlocked | Turn-based unlocks (20, 50, 100) | Add unlock conditions |
| No checkpoints | Auto + manual save system | Implement checkpoint service |
| No galactic events | 8 event types with triggers | Implement event system |
| No UI | Tutorial overlays, event banners | Build React components |

### 9.2 Data Migration

**Initial Setup:**

```sql
-- Migration: Create progressive systems tables
-- Safe to run: YES (new tables, no data loss)

-- Create game_checkpoints table
CREATE TABLE game_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id),
  turn_number INTEGER NOT NULL,
  checkpoint_type VARCHAR(20) NOT NULL,
  game_state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_checkpoints_game ON game_checkpoints(game_id, turn_number DESC);
CREATE INDEX idx_checkpoints_player ON game_checkpoints(player_id, created_at DESC);

-- Create galactic_events table
CREATE TABLE galactic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  start_turn INTEGER NOT NULL,
  end_turn INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_game_active ON galactic_events(game_id, is_active);

-- Create tutorial_progress table
CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES users(id),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps JSONB NOT NULL DEFAULT '[]',
  is_skipped BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tutorial_player ON tutorial_progress(player_id, game_id);
```

### 9.3 Rollback Plan

If progressive systems cause issues:

1. **Disable tutorial**: Set TUTORIAL_ENABLED = false (all features unlocked at Turn 1)
2. **Disable events**: Set EVENT_TRIGGERS_ENABLED = false (no galactic events)
3. **Disable checkpoints**: Auto-checkpoints still created but hidden from UI
4. **Preserve data**: Keep all tables for analysis

**Rollback SQL:**

```sql
-- Disable active events
UPDATE galactic_events SET is_active = FALSE WHERE is_active = TRUE;

-- Mark all tutorials as skipped (disable tutorial UI)
UPDATE tutorial_progress SET is_skipped = TRUE, is_completed = TRUE;

-- Checkpoints remain functional (no changes needed)
```

**Re-enable:**
- Set TUTORIAL_ENABLED = true
- Set EVENT_TRIGGERS_ENABLED = true
- Tutorials start for new players
- Events resume triggering

---

## 10. Conclusion

### Key Decisions

**1. Tutorial Integrated into Gameplay (Not Separate Sandbox)**
- **Rationale**: Players learn by actually playing the game, not in an artificial environment. First 10 turns are real gameplay with guidance.
- **Trade-off**: Bots must be passive during tutorial, which slightly delays full difficulty curve.

**2. Feature Unlocks at Specific Turns (20, 50, 100)**
- **Rationale**: Prevents overwhelming new players with all systems at once. Diplomacy at Turn 20 gives players time to learn combat first.
- **Trade-off**: Veterans must skip tutorial to get immediate access, but skip is prominent and available after Turn 3.

**3. Cloud Checkpoints with Expiration (7/30 Days)**
- **Rationale**: Supports long campaigns without infinite storage costs. 7 days for auto-saves is generous for active players.
- **Trade-off**: Players who abandon games lose progress after 7 days, but this is acceptable for inactive players.

**4. Galactic Events Affect All Empires Equally**
- **Rationale**: Creates shared experiences and prevents RNG targeting feeling unfair. Everyone faces same challenge.
- **Trade-off**: Can't use events for dynamic difficulty (helping losing players), but preserves fairness.

**5. Bot Passivity During Tutorial (Turns 1-10)**
- **Rationale**: New players need breathing room to learn without being crushed. -50% bot damage is significant but necessary.
- **Trade-off**: Veterans who skip tutorial don't experience bot passivity, creating slight advantage for new players who keep tutorial on.

### Open Questions

**1. Should Tutorial Have Difficulty Options?**
- **Context**: Current tutorial has one difficulty (passive bots). Should veterans in tutorial face harder bots?
- **Options**:
  - Single difficulty (current design)
  - "Easy" vs "Normal" tutorial (passive vs active bots)
  - Adaptive difficulty (bots scale to player performance)
- **Resolution Needed**: Playtest feedback on whether single-difficulty tutorial is too easy for some players.

**2. Should Checkpoints Be More Frequent (Every 10 Turns)?**
- **Context**: Current design is every 20 turns. Is this frequent enough?
- **Options**:
  - Every 20 turns (current)
  - Every 10 turns (more frequent, more storage)
  - Player-configurable (5, 10, 20 turn intervals)
- **Resolution Needed**: Storage cost analysis and player preference testing.

**3. Should Galactic Events Have Player Votes?**
- **Context**: Currently events are random. Should players vote on which event occurs?
- **Options**:
  - Pure random (current design)
  - Player vote (3 options presented, majority wins)
  - Leader choice (highest VP player decides)
- **Resolution Needed**: Design decision on player agency vs unpredictability.

### Dependencies

**Depends On:**
- **[VISION.md](../VISION.md)** - Design philosophy and player experience principles
- **[PRD-EXECUTIVE.md](../PRD-EXECUTIVE.md)** - System overview, turn structure, victory conditions
- **[BOT-SYSTEM.md](BOT-SYSTEM.md)** - Bot archetypes, decision priorities, tutorial passivity
- **[MARKET-SYSTEM.md](MARKET-SYSTEM.md)** - Market tutorial step (Turn 5)
- **Research System** (TBD) - Research tutorial integration
- **Combat System** - Combat tutorial (Turn 8-9)

**Depended By:**
- **Tutorial UI** - All UI components show tutorial overlays
- **Bot AI** - Bots adjust behavior during tutorial
- **Save/Load System** - Checkpoint functionality
- **Notification System** - Event announcements, unlock notifications

### Implementation Priority

**Critical Path (M12-M13):**
1. Tutorial service (M12) - Tutorial state machine, step tracking
2. Feature unlock system (M12) - Turn-based unlock conditions
3. Tutorial UI overlays (M13) - Onboarding guidance components

**Enhancement Phase (M14-M15):**
4. Checkpoint system (M14) - Auto/manual save, cloud sync
5. Galactic events (M14) - Event triggers, effects, notifications
6. Event UI (M15) - Banners, announcements

**Polish Phase (M16):**
7. Tutorial skip flow (M16) - Veteran onboarding
8. Checkpoint UI (M16) - Save/load interface
9. Event balance tuning (M16) - Adjust frequencies, effects
10. Tutorial analytics (M16) - Track completion rates, optimize

---

**END OF PROGRESSIVE SYSTEMS DESIGN DOCUMENT**

*This document replaces the stub at docs/draft/PROGRESSIVE-SYSTEMS.md and provides complete specifications for implementation.*
