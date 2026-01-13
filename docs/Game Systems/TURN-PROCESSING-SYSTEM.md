# Turn Processing System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-TURN
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/TURN-PROCESSING-SYSTEM

---

## Document Purpose

This document defines the **Turn Processing System**, the core heartbeat of Nexus Dominion that orchestrates all game state changes in a predictable, atomic, and performant manner. Every game mechanic—from resource generation to combat resolution—executes through this pipeline.

This document is essential reading for:
- **Backend engineers** implementing game logic and database transactions
- **Game designers** understanding execution order and timing dependencies
- **QA engineers** validating turn consistency and rollback safety
- **Bot developers** synchronizing AI decisions with turn phases

**Key Decisions Resolved:**
- **Two-tier architecture** separating atomic empire state updates (Tier 1) from gracefully degradable systems (Tier 2)
- **17-phase pipeline** with explicit ordering to prevent race conditions
- **Performance target** of <2 seconds for 100 empires
- **Transaction boundaries** ensuring database consistency even on partial failures

**Design Philosophy:**
- **Atomicity First**: Critical empire state changes are all-or-nothing transactions
- **Graceful Degradation**: Non-critical systems can fail without rolling back the entire turn
- **Predictable Ordering**: Every phase has explicit dependencies and executes in strict sequence
- **Performance Budget**: Sub-second processing enables "instant" turn feedback
- **Observability**: Every phase logs success/failure for debugging and monitoring
- **Testability**: Each phase is independently testable with clear inputs/outputs

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

### 1.1 The Game Heartbeat

The Turn Processing System is the game's central clock. When a player clicks "End Turn", 17 distinct phases execute in sequence, updating the state of all 100 empires in the galaxy. This happens in under 2 seconds, giving the illusion of simultaneous action while maintaining strict consistency guarantees.

**Core Loop:**
```
Player clicks "End Turn"
  ↓
Tier 1: Transactional Phases (Income, Production, Population, Research...)
  → If ANY phase fails: ROLLBACK entire tier, show error, abort turn
  → If ALL succeed: COMMIT to database
  ↓
Tier 2: Non-Transactional Phases (Bot AI, Market, Events, Victory Check...)
  → If ANY phase fails: LOG error, continue processing
  → Individual failures don't block turn completion
  ↓
Turn number increments
  ↓
Player sees updated game state
```

This two-tier approach ensures that **empire resources are always consistent** (you can't spend credits you don't have due to a failed phase), while **bot messages and market updates can gracefully fail** without breaking the game.

### 1.2 Two-Tier Architecture

**Why Two Tiers?**

In early prototypes, all phases ran in a single transaction. This meant:
- ❌ A bug in bot AI message generation could rollback all resource generation
- ❌ A market price calculation error would prevent population growth
- ❌ Debugging was nightmarish—any failure rolled back the entire turn

The two-tier split separates **critical empire state** (Tier 1) from **derived or cosmetic state** (Tier 2):

| Tier | Purpose | Failure Behavior | Examples |
|------|---------|------------------|----------|
| **Tier 1: Transactional** | Update core empire resources and state | ROLLBACK entire tier, abort turn | Income, population, research points, unit production |
| **Tier 2: Non-Transactional** | Generate derived data, AI decisions, events | LOG error, continue processing | Bot messages, market prices, victory checks, auto-save |

**Tier 1** is wrapped in a database transaction. If phase 5 fails, phases 1-4 are rolled back automatically. The player sees an error message: *"Turn processing failed. Please report this bug."* Their game state is unchanged.

**Tier 2** has no transaction boundary. If bot message generation fails, we log it and move on. The turn still completes. The player never knows.

### 1.3 Player Experience

From the player's perspective, turn processing is **instantaneous and magical**:

1. **Click "End Turn"** → Button shows loading spinner
2. **~1.5 seconds pass** → Subtle animations (stars twinkling, resource counters animating)
3. **Turn completes** → New turn number displayed, updated resources, new bot messages
4. **Notifications appear** → "3 new messages", "Research completed: Improved Shields", "Coalition formed against Empire #42"

**What the player doesn't see:**
- 17 phases executing in sequence
- Database transactions committing
- Bot AI making 99 strategic decisions
- Market prices recalculating based on supply/demand
- Victory conditions being evaluated
- Auto-save writing 500KB to disk

**Design Goal:** Turn processing should feel like flipping to the next page in a book, not waiting for a slow computer. The 2-second budget is sacrosanct.

---

## 2. Mechanics Overview

### 2.1 The 17-Phase Pipeline

Turn processing executes these phases in strict order:

#### Tier 1: Transactional (Atomic)

1. **Income Phase** → Generate credits/ore/food based on sectors, adjusted by civil status multiplier
2. **Tier 1 Auto-Production** → Crafting system generates resources (e.g., refined ore from raw ore)
3. **Population Phase** → Population grows with excess food, starves without food
4. **Civil Status Phase** → Morale evaluated based on population satisfaction, military losses
5. **Research Phase** → Research points allocated toward current research project
6. **Build Queue Phase** → Units in production queue progress by 1 turn (or complete if ready)
7. **Covert Phase** → Spy points generated based on intelligence infrastructure
8. **Crafting Phase** → Crafting queue items progress (complex multi-turn production)

**Transaction Boundary:** All 8 phases succeed or all rollback. Database constraints enforced (e.g., can't go negative on resources).

#### Tier 2: Non-Transactional (Graceful Failure)

9. **Bot Decisions** → AI evaluates strategic options (attack, build, research, diplomacy)
10. **Emotional Decay** → Bot emotions (anger, gratitude, fear) gradually decay toward neutral
11. **Memory Cleanup** → Old bot memories pruned (every 5 turns) to prevent memory bloat
12. **Market Phase** → Prices update based on supply/demand from previous turn
13. **Bot Messages** → Generate diplomatic messages based on bot decisions
14. **Galactic Events** → Random events trigger (if milestone M11 is active)
15. **Alliance Checkpoints** → Coalition evaluations—auto-form coalitions against leaders (M11)
16. **Victory Check** → Evaluate all 6 victory conditions to see if any empire won
17. **Auto-Save** → Persist game state to disk for crash recovery

**No Transaction:** Each phase logs success/failure independently. Failures don't block turn completion.

### 2.2 Execution Timing

```
Phase 1-8 (Tier 1):  ~800ms  (database-heavy, transactional)
Phase 9 (Bot AI):    ~400ms  (100 bots making decisions)
Phase 10-17 (Tier 2): ~300ms  (logging, events, save)
──────────────────────────────
Total:               ~1500ms  (target: <2000ms)
```

**Performance Budget:**
- Database queries are batched (update all empires' income in one query, not 100 individual updates)
- Bot AI runs in parallel where safe (each bot's decision is independent)
- Auto-save is async (doesn't block turn completion UI update)

### 2.3 Phase Dependencies

Some phases depend on others completing first:

```
Income Phase
  ↓ (requires income to calculate food availability)
Population Phase
  ↓ (requires population to calculate morale)
Civil Status Phase
  ↓ (requires morale for research productivity)
Research Phase
  ↓ (requires resources to build units)
Build Queue Phase
```

**Critical Insight:** Phase order matters. If we ran Research before Income, players couldn't spend newly-earned credits on research. If we ran Build Queue before Income, units couldn't be purchased with this turn's income.

### 2.4 Turn Number Increment

Turn number increments **after all 17 phases complete successfully**. This ensures:
- Victory checks reference the correct turn number (e.g., "Win by turn 100")
- Bot memories timestamp correctly
- UI displays consistent state (turn N shows the results of processing turn N)

**Special Case:** If Tier 1 fails (transaction rollback), turn number does NOT increment. The player retries the same turn.

---

## 3. Detailed Rules

### 3.1 Tier 1: Income Phase <!-- @spec REQ-TURN-004 -->

**What Happens:**
Every empire generates base income from controlled sectors, modified by civil status.

**Formula:**
```
credits_income = base_credits_per_sector * num_sectors * civil_status_multiplier
ore_income = base_ore_per_sector * num_sectors * civil_status_multiplier
food_income = base_food_per_sector * num_sectors * civil_status_multiplier
```

**Civil Status Multiplier:**
| Civil Status | Multiplier | Effect |
|--------------|------------|--------|
| Happy | 1.2 | +20% income |
| Content | 1.0 | Normal income |
| Unrest | 0.8 | -20% income |
| Rebellion | 0.5 | -50% income |

**Database Update:**
```sql
UPDATE empires SET
  credits = credits + (sector_count * base_credit_rate * civil_multiplier),
  ore = ore + (sector_count * base_ore_rate * civil_multiplier),
  food = food + (sector_count * base_food_rate * civil_multiplier)
WHERE game_id = ?;
```

**Failure Conditions:**
- Database constraint violation (e.g., integer overflow)
- Missing empire record (data corruption)

→ **On Failure:** Rollback entire Tier 1, show error to player, abort turn.

### 3.2 Tier 1: Auto-Production Phase <!-- @spec REQ-TURN-005 -->

**What Happens:**
Crafting system generates derived resources (e.g., "Ore Refinery" produces refined ore from raw ore).

**Example:**
- Empire has 1 Ore Refinery building
- Refinery consumes 100 raw ore → produces 50 refined ore
- Database: `UPDATE empires SET raw_ore = raw_ore - 100, refined_ore = refined_ore + 50`

**Edge Cases:**
- If not enough raw ore: skip production (don't go negative)
- If refinery was destroyed this turn: no production

**Failure Conditions:**
- Invalid crafting configuration (missing recipe)
- Race condition (another phase modified ore simultaneously)

→ **On Failure:** Rollback entire Tier 1.

### 3.3 Tier 1: Population Phase <!-- @spec REQ-TURN-006 -->

**What Happens:**
Population grows if there's surplus food, starves if there's deficit.

**Formula:**
```
food_consumed = population * food_per_capita
food_balance = food_income - food_consumed

if food_balance >= 0:
  population_growth = min(food_balance / food_per_growth, max_growth_rate)
  new_population = population + population_growth
else:
  starvation_deaths = abs(food_balance) / food_per_capita * 0.1
  new_population = population - starvation_deaths
  civil_status = degrade_civil_status()  // Unrest from starvation
```

**Constants:**
- `food_per_capita = 1` (each person eats 1 food per turn)
- `food_per_growth = 10` (10 food required to add 1 population)
- `max_growth_rate = population * 0.05` (max 5% growth per turn)

**Example:**
- Population: 1,000
- Food income: 1,200
- Food consumed: 1,000
- Surplus: 200
- Growth: 200 / 10 = 20 new citizens
- New population: 1,020

**Failure Conditions:**
- Negative population (logic error)
- Population exceeds max_integer (overflow)

→ **On Failure:** Rollback entire Tier 1.

### 3.4 Tier 1: Civil Status Phase <!-- @spec REQ-TURN-007 -->

**What Happens:**
Morale is recalculated based on:
- Food surplus/deficit
- Recent military losses
- Enemy raids (covert ops)
- Diplomatic incidents

**Status Thresholds:**
| Morale | Civil Status |
|--------|--------------|
| 80-100 | Happy |
| 50-79  | Content |
| 20-49  | Unrest |
| 0-19   | Rebellion |

**Morale Modifiers:**
- Starvation: -10 morale per turn
- Military loss > 50% of forces: -20 morale
- Successful raid defense: +5 morale
- Alliance membership: +5 morale

**Rebellion Effects:**
- Civil status multiplier drops to 0.5 (income halved)
- 10% chance per turn of losing 1 sector (secession)
- Cannot declare new wars (internal instability)

**Failure Conditions:**
- Invalid morale value (out of 0-100 range)

→ **On Failure:** Rollback entire Tier 1.

### 3.5 Tier 1: Research Phase <!-- @spec REQ-TURN-008 -->

**What Happens:**
Research points accumulate toward current research project.

**Formula:**
```
research_points_earned = base_research_rate * civil_status_multiplier
current_project_progress += research_points_earned

if current_project_progress >= current_project_cost:
  complete_research()
  current_project = null
  current_project_progress = 0
```

**Example:**
- Researching "Improved Shields" (cost: 500 RP)
- Current progress: 450 RP
- This turn: +60 RP (base 50 * 1.2 Happy multiplier)
- New progress: 510 RP
- **Research completes!** Improved Shields unlocked.

**Completion Actions:**
- Unlock new units/buildings
- Apply passive bonuses (e.g., +10% defense empire-wide)
- Queue next research if auto-queue enabled

**Failure Conditions:**
- Research project doesn't exist (deleted from config)
- Progress exceeds safe integer bounds

→ **On Failure:** Rollback entire Tier 1.

### 3.6 Tier 1: Build Queue Phase <!-- @spec REQ-TURN-009 -->

**What Happens:**
Units/buildings in production queue progress by 1 turn. Completed items are added to empire.

**Queue Structure:**
```typescript
interface QueueItem {
  item_type: "unit" | "building";
  item_id: string;
  turns_remaining: number;
  cost_paid: boolean;
}
```

**Processing:**
```
for each item in build_queue:
  item.turns_remaining -= 1

  if item.turns_remaining == 0:
    add_to_empire(item)
    remove_from_queue(item)
    notify_player("Build complete: [item_name]")
```

**Example:**
- Queue: [Fighter (2 turns left), Bomber (5 turns left)]
- After processing: [Fighter (1 turn left), Bomber (4 turns left)]
- Next turn: Fighter completes, added to military units

**Failure Conditions:**
- Negative turns_remaining (logic error)
- Invalid item_id (missing unit definition)

→ **On Failure:** Rollback entire Tier 1.

### 3.7 Tier 1: Covert Phase <!-- @spec REQ-TURN-010 -->

**What Happens:**
Generate spy points based on intelligence infrastructure.

**Formula:**
```
spy_points_earned = base_spy_rate * num_spy_buildings * civil_status_multiplier
spy_points = min(spy_points + spy_points_earned, max_spy_points)
```

**Constants:**
- `base_spy_rate = 10` (each spy building generates 10 points/turn)
- `max_spy_points = 500` (cap to prevent hoarding)

**Example:**
- Empire has 3 Intelligence Centers
- Current spy points: 200
- Earned this turn: 3 * 10 * 1.0 = 30
- New spy points: 230

**Usage:**
Spy points are spent during player actions (Sabotage, Espionage, Assassination) between turns. Generation happens automatically here.

**Failure Conditions:**
- Spy points exceed max_integer

→ **On Failure:** Rollback entire Tier 1.

### 3.8 Tier 1: Crafting Phase <!-- @spec REQ-TURN-011 -->

**What Happens:**
Process crafting queue items (multi-turn production chains).

**Example Crafting Item:**
- Crafting "Advanced Fighter" (requires: 100 ore, 50 refined ore, 3 turns)
- Turn 1: Start crafting (resources deducted, queue item created)
- Turn 2: Progress (1 turn remaining)
- Turn 3: Complete (Advanced Fighter added to military)

**Processing:**
```
for each item in crafting_queue:
  item.turns_remaining -= 1

  if item.turns_remaining == 0:
    add_to_empire(item.result)
    remove_from_queue(item)
```

**Difference from Build Queue:**
Crafting queue is for complex items with multi-step dependencies (Tech Wars expansion). Build queue is for basic units.

**Failure Conditions:**
- Invalid crafting recipe
- Missing prerequisite item

→ **On Failure:** Rollback entire Tier 1.

---

### 3.9 Tier 2: Bot Decisions Phase <!-- @spec REQ-TURN-012 -->

**What Happens:**
All 99 bot empires evaluate strategic options and make decisions (attack, build, research, diplomacy).

**Bot Decision Process:**
```
for each bot_empire:
  archetype = bot_empire.archetype  // Warlord, Diplomat, Merchant, etc.

  // Evaluate options based on archetype
  options = []
  if archetype == "Warlord" && has_military_advantage():
    options.push({ action: "attack", target: weakest_neighbor(), priority: 10 })
  if needs_economy():
    options.push({ action: "build_economy", priority: 8 })
  if losing_war():
    options.push({ action: "request_alliance", priority: 12 })

  // Pick highest priority option
  decision = options.sort_by_priority().first()
  execute_decision(decision)
```

**Archetype Behaviors:** (See Section 4.1 for full table)

**Failure Handling:**
- If a single bot's decision fails (e.g., invalid target): LOG error, skip bot, continue
- Turn still completes successfully
- Admin sees error in logs for debugging

**Performance:**
- Bot decisions run in parallel (each bot independent)
- Target: <400ms for 100 bots

### 3.10 Tier 2: Emotional Decay Phase <!-- @spec REQ-TURN-013 -->

**What Happens:**
Bot emotions gradually return to neutral over time.

**Emotion Types:**
- **Anger** (toward specific empire): Decays by 5 points/turn
- **Gratitude** (from alliance help): Decays by 3 points/turn
- **Fear** (of stronger empire): Decays by 2 points/turn

**Example:**
- Bot #42 is angry at player (anger = 80)
- After 5 turns: anger = 80 - (5*5) = 55
- After 15 turns: anger = 5 (nearly neutral)

**Why Decay?**
Without decay, bots hold grudges forever. This creates dynamic relationships—today's enemy can become tomorrow's ally.

**Failure Handling:**
- If decay calculation fails: LOG error, skip bot, continue

### 3.11 Tier 2: Memory Cleanup Phase <!-- @spec REQ-TURN-014 -->

**What Happens:**
Every 5 turns, delete old bot memories to prevent database bloat.

**Memory Retention Rules:**
- Keep last 20 turns of memories
- Always keep "important" memories (first contact, major battles, alliances)
- Delete routine events (routine trades, minor skirmishes)

**Example Cleanup:**
```sql
DELETE FROM bot_memories
WHERE bot_id = ?
  AND turn_number < (current_turn - 20)
  AND importance < 5;  -- Only delete low-importance memories
```

**Why Every 5 Turns?**
Balance between database size and retention. Too frequent = overhead. Too rare = bloat.

**Failure Handling:**
- If cleanup fails: LOG error, skip cleanup, continue
- Not critical—missed cleanup can be retried next cycle

### 3.12 Tier 2: Market Phase <!-- @spec REQ-TURN-015 -->

**What Happens:**
Update market prices based on supply/demand from previous turn.

**Price Formula:**
```
supply = total_units_sold_last_turn
demand = total_units_bought_last_turn

price_change = (demand - supply) / supply * volatility_factor
new_price = old_price * (1 + price_change)
new_price = clamp(new_price, min_price, max_price)
```

**Example:**
- Credits market: 1000 sold, 1200 bought
- Supply/demand ratio: 1200/1000 = 1.2 (20% more demand)
- Price change: +20% * 0.5 volatility = +10%
- Old price: 1.0 credits per unit
- New price: 1.1 credits per unit

**Failure Handling:**
- If price calculation fails: LOG error, keep old prices, continue
- Market still accessible, just with stale prices

### 3.13 Tier 2: Bot Messages Phase <!-- @spec REQ-TURN-016 -->

**What Happens:**
Generate diplomatic messages based on bot decisions from Phase 9.

**Message Generation:**
```
for each bot_decision:
  if decision.action == "attack":
    create_message(template: "war_declaration", from: bot, to: target)
  if decision.action == "request_alliance":
    create_message(template: "alliance_proposal", from: bot, to: target)
  if decision.emotion_changed:
    create_message(template: "emotional_reaction", from: bot, to: player)
```

**Message Templates:** (See Section 4.3 for full list)

**Example:**
- Bot #7 (Warlord archetype) decided to attack player
- Message generated: *"Your empire is weak, Commander. Prepare for battle! -Emperor Kraz'thor of Sector 3"*

**Failure Handling:**
- If message generation fails: LOG error, skip message, continue
- Player just doesn't receive that specific message
- No impact on game state (messages are cosmetic)

### 3.14 Tier 2: Galactic Events Phase <!-- @spec REQ-TURN-017 -->

**What Happens:**
Trigger random events (asteroid strikes, pirate raids, technology breakthroughs).

**Event Trigger:**
```
event_chance = base_event_chance * (current_turn / max_turns)  // More events late-game

if random() < event_chance:
  event = select_random_event()
  apply_event_effects(event)
  notify_affected_empires(event)
```

**Example Events:**
- **Asteroid Strike**: Random empire loses 1 sector
- **Pirate Raid**: Random empire loses 20% military forces
- **Scientific Breakthrough**: Random empire gains 500 research points

**Milestone M11 Requirement:**
Events only trigger if M11 (Galactic Events milestone) is unlocked. Otherwise, skip phase.

**Failure Handling:**
- If event application fails: LOG error, skip event, continue
- Game continues without that event

### 3.15 Tier 2: Alliance Checkpoints Phase <!-- @spec REQ-TURN-018 -->

**What Happens:**
Evaluate coalition formation against dominant empires (anti-snowball mechanic).

**Coalition Logic:**
```
leader = empire_with_most_victory_points()

if leader.victory_points >= 7:  // Threshold for auto-coalition
  potential_allies = empires_not_allied_with(leader)

  coalition = []
  for empire in potential_allies.sort_by_military_power().take(5):
    if empire.is_bot && random() < 0.8:  // 80% chance bot joins
      coalition.push(empire)

  if coalition.length >= 3:
    form_coalition(coalition, target: leader)
    notify_all("Coalition formed against [leader_name]!")
```

**Why This Exists:**
Prevents runaway victories. If one empire gets too strong, others band together to stop them.

**Failure Handling:**
- If coalition formation fails: LOG error, skip coalition, continue
- Players still have manual coalition options

### 3.16 Tier 2: Victory Check Phase <!-- @spec REQ-TURN-019 -->

**What Happens:**
Evaluate all 6 victory conditions. If any empire meets a condition, game ends.

**Victory Conditions:**
1. **Military**: Control 70% of sectors
2. **Economic**: Accumulate 100,000 credits
3. **Diplomatic**: Alliance with 80% of empires
4. **Research**: Complete all tech tree branches
5. **Covert**: Eliminate 5+ empires via assassination
6. **Survival**: Last empire standing

**Check Logic:**
```
for each empire:
  if empire.sectors.length / total_sectors >= 0.7:
    declare_winner(empire, "Military Domination")
  if empire.credits >= 100000:
    declare_winner(empire, "Economic Victory")
  // ... check all 6 conditions
```

**Game End:**
- Display victory screen
- Lock game (no more turns)
- Save final state
- Show leaderboard

**Failure Handling:**
- If victory check fails: LOG error, skip victory check, continue
- Game continues (player can still win next turn)

### 3.17 Tier 2: Auto-Save Phase <!-- @spec REQ-TURN-020 -->

**What Happens:**
Persist entire game state to disk for crash recovery.

**Save Structure:**
```json
{
  "game_id": "abc123",
  "turn_number": 42,
  "timestamp": "2026-01-12T10:30:00Z",
  "empires": [ /* all 100 empire states */ ],
  "galaxy": { /* sector ownership, wormholes */ },
  "events_log": [ /* recent events */ ]
}
```

**Save Frequency:**
- Every turn (auto-save)
- Manual save when player clicks "Save Game"
- Quicksave before major actions (e.g., declaring war)

**File Location:**
- `saves/game_{game_id}_turn_{turn_number}.json`
- Keep last 10 auto-saves (delete older)

**Failure Handling:**
- If save fails: LOG error, continue
- Player warned: "Auto-save failed. Please save manually."
- Game still playable (just no backup)

---

## 4. Bot Integration

### 4.1 Archetype Behavior

How each of the 8 archetypes uses turn processing timing:

| Archetype | Decision Priority (Phase 9) | Typical Actions | Timing Sensitivity |
|-----------|------------------------------|-----------------|-------------------|
| **Warlord** | Attack weakest neighbor | Declares war if military advantage > 1.3x | High (needs income phase to count forces) |
| **Diplomat** | Form/maintain alliances | Proposes NAP or alliance if threat detected | Low (relationship-based) |
| **Merchant** | Trade resource surpluses | Sells excess resources on market | High (needs income phase to know surplus) |
| **Schemer** | Covert operations | Uses spy points for sabotage/espionage | High (needs covert phase to generate points) |
| **Turtle** | Build defenses | Allocates resources to defensive structures | Medium (reactive to threats) |
| **Blitzkrieg** | Rapid expansion | Builds wormholes to distant sectors | High (needs income for wormhole costs) |
| **Tech Rush** | Research focus | Allocates max resources to research | High (needs research phase completion) |
| **Opportunist** | Exploit weaknesses | Attacks empires in rebellion/unrest | Medium (monitors civil status phase) |

**Decision Timing:**
Bots make decisions in Phase 9 (after Tier 1 completes), so they have access to:
- Updated income (Phase 1)
- Current population (Phase 3)
- Civil status (Phase 4)
- Research progress (Phase 5)
- Available spy points (Phase 7)

This ensures bot decisions are based on **current turn state**, not stale data.

### 4.2 Bot Decision Logic

**Warlord Decision Tree:**
```
if military_power > neighbor.military_power * 1.5:
  if anger_toward(neighbor) > 50:
    ACTION: Declare war
  else if random() < 0.3:
    ACTION: Declare war (opportunistic)
  else:
    ACTION: Build more military (prepare)
else:
  if losing_war():
    ACTION: Request alliance (defensive)
  else:
    ACTION: Build economy (prepare for war later)
```

**Diplomat Decision Tree:**
```
if num_alliances < 3:
  target = strongest_non_hostile_empire()
  ACTION: Propose alliance
else if ally_under_attack():
  ACTION: Join ally in war (honor alliance)
else:
  ACTION: Mediate conflicts (peace proposals)
```

**Merchant Decision Tree:**
```
surplus = calculate_resource_surplus()
if surplus.credits > 1000:
  ACTION: Sell credits on market
if surplus.ore > 500:
  ACTION: Sell ore on market
if deficit.food < 0:
  ACTION: Buy food from market
```

**Performance Optimization:**
Bots evaluate decisions in parallel (each bot's decision is independent). This cuts Phase 9 time from ~4 seconds (sequential) to ~400ms (parallel).

### 4.3 Bot Messages

**War Declaration (Warlord):**
```
"Your empire is weak, {player_name}. Prepare for battle! -Emperor {bot_name}"
"I tire of your presence in Sector {sector_id}. Surrender or be destroyed!"
"My fleets are en route. This is your only warning."
```

**Alliance Proposal (Diplomat):**
```
"Greetings, {player_name}. I propose a Non-Aggression Pact. Respond within 3 turns."
"Together we are stronger. Join my coalition against {enemy_name}?"
"Your reputation precedes you. Let us formalize our friendship with an alliance."
```

**Trade Offer (Merchant):**
```
"I have surplus ore. Interested in a trade? {amount} ore for {amount} credits."
"The market is volatile. I can offer you favorable terms on this food shipment."
"Business is business. Here's my offer: take it or leave it."
```

**Covert Success (Schemer):**
```
"A mysterious accident has befallen your research labs. How unfortunate. -Unknown"
"Your spies are clumsy. Mine are not."
"Trust no one, {player_name}. Not even your own advisors."
```

**Threat Warning (Turtle):**
```
"I see your fleets massing. Approach my borders and face consequences."
"My defenses are impenetrable. Attack at your own peril."
"I prefer peace, but I am prepared for war."
```

**Expansion Announcement (Blitzkrieg):**
```
"Sector {sector_id} is now under my control. Expansion is inevitable."
"My empire grows. Yours does not. Interesting."
"I have constructed a wormhole to Sector {sector_id}. Strategic advantage: mine."
```

**Research Breakthrough (Tech Rush):**
```
"My scientists have achieved a breakthrough: {tech_name}. Your primitives cannot compete."
"Technology is the key to victory. You are falling behind."
"I have unlocked {tech_name}. Catch up if you can."
```

**Opportunistic Strike (Opportunist):**
```
"I noticed your civil unrest. A shame. I shall relieve you of Sector {sector_id}."
"Your empire is weak from starvation. I am merciful—I will end your suffering quickly."
"Opportunity knocks. I answer."
```

**Message Timing:**
Messages are generated in Phase 13 (Bot Messages Phase) and delivered to player at turn start. Player sees them immediately when viewing new turn.

---

## 5. UI/UX Design

### 5.1 UI Mockups

#### Turn Processing Overlay

When player clicks "End Turn", this overlay appears:

```
┌────────────────────────────────────────────────────────┐
│              PROCESSING TURN 42 → 43                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░  73%                │
│                                                        │
│   Phase 9/17: Bot Decisions                           │
│                                                        │
│   [Cancel] (only available in first 200ms)            │
└────────────────────────────────────────────────────────┘
```

**Progress Bar:**
- Fills smoothly from 0-100%
- Shows current phase name
- Animated star particles in background (LCARS style)

**Phase Labels:**
- "Generating Income..." (Phase 1)
- "Processing Population..." (Phase 3)
- "Evaluating Bot Strategies..." (Phase 9)
- "Checking Victory Conditions..." (Phase 16)

#### Turn Complete Notification

After processing completes:

```
┌────────────────────────────────────────────────────────┐
│                   TURN 43 BEGINS                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ✓ Income Received: +500 credits, +200 ore, +300 food │
│  ✓ Population Growth: +15 citizens                    │
│  ✓ Research Progress: Improved Shields (80%)          │
│  ✓ Build Queue: Fighter completed!                    │
│                                                        │
│  ⚠ 3 New Messages                                     │
│  ⚠ Coalition formed against Empire #42                │
│                                                        │
│  [View Messages]  [Continue]                          │
└────────────────────────────────────────────────────────┘
```

**Notification Types:**
- ✓ Green checkmarks for positive events
- ⚠ Orange warnings for threats
- ✗ Red X for negative events (attack, sabotage)

#### Turn Counter Display (Always Visible)

Top-right corner of screen:

```
┌─────────────────┐
│  TURN 43 / 500  │
│  [End Turn]     │
└─────────────────┘
```

**Visual States:**
- Normal: White text, blue button
- Processing: Button disabled, spinner animation
- Warning (near turn limit): Yellow text

### 5.2 User Flows

#### Flow 1: Player Ends Turn (Normal)

1. Player clicks **[End Turn]** button
2. Button changes to **[Processing...]** with spinner
3. Processing overlay appears (~100ms fade-in)
4. Progress bar fills over ~1.5 seconds
5. Phase labels update every ~100ms
6. Overlay fades out (~200ms)
7. Turn complete notification appears
8. Player reviews changes
9. Player clicks **[Continue]**
10. Game shows updated Turn 43 state

**Total Time:** ~2 seconds (1.5s processing + 0.5s animations)

#### Flow 2: Turn Processing Error (Rare)

1. Player clicks **[End Turn]**
2. Processing starts normally
3. **ERROR** occurs in Tier 1 (e.g., database timeout)
4. Processing stops immediately
5. Error modal appears:
   ```
   ┌────────────────────────────────────────┐
   │       TURN PROCESSING FAILED           │
   ├────────────────────────────────────────┤
   │                                        │
   │  An error occurred during turn         │
   │  processing. Your game state has       │
   │  not changed.                          │
   │                                        │
   │  Error ID: TRN-42-001                  │
   │  Please report this bug.               │
   │                                        │
   │  [Retry Turn]  [Save & Quit]           │
   └────────────────────────────────────────┘
   ```
6. Player clicks **[Retry Turn]**
7. Processing re-attempts
8. If success: continue normally
9. If failure again: suggest **[Save & Quit]**

**Design Goal:** Never lose player progress. Transaction rollback ensures game state is consistent.

#### Flow 3: Victory Achieved

1. Player clicks **[End Turn]**
2. Processing completes normally
3. Phase 16 (Victory Check) detects: Player controls 70 sectors (Military Victory)
4. Victory screen appears (full-screen overlay):
   ```
   ┌────────────────────────────────────────────────────────┐
   │                                                        │
   │          ★ ★ ★  MILITARY VICTORY  ★ ★ ★              │
   │                                                        │
   │  You have conquered the galaxy, Commander!            │
   │                                                        │
   │  Final Score: 98,450                                  │
   │  Turns Taken: 243 / 500                               │
   │  Empires Eliminated: 87                               │
   │                                                        │
   │  [View Statistics]  [Play Again]  [Quit]              │
   └────────────────────────────────────────────────────────┘
   ```
5. Game is locked (no more turns possible)
6. Player can review stats or start new game

### 5.3 Visual Design Principles

**LCARS-Inspired Turn Processing:**
- **Semi-transparent overlays** (see starfield behind processing UI)
- **Orange/peach progress bars** (LCARS color palette)
- **Smooth animations** (no jarring cuts)
  - Fade-in: 100ms
  - Progress bar fill: smooth 60fps animation
  - Fade-out: 200ms
- **Subtle sound effects**
  - Turn start: soft "whoosh" sound
  - Phase transition: quiet "beep"
  - Turn complete: triumphant "ding"

**Performance Considerations:**
- Animations run on GPU (CSS transforms)
- Progress bar updates throttled to 10fps (sufficient for perception)
- Background starfield pauses during processing (reduce CPU load)

**Accessibility:**
- Progress percentage shown numerically for screen readers
- High-contrast mode available (yellow on black)
- Option to disable animations (instant turn completion)

**Mobile Adaptation:**
- Processing overlay resizes for mobile screens
- Turn counter moves to top-left (thumb-friendly)
- Notifications stack vertically (swipe to dismiss)

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

### REQ-TURN-001: Turn Processing Pipeline (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-TURN-001-01 through REQ-TURN-001-18 below.

---

### REQ-TURN-001-01: Tier Structure Definition

**Description:** Turn processing consists of two tiers executed in order: Tier 1 (Transactional, atomic, all-or-nothing) contains 8 phases for critical empire state updates that must succeed or rollback. Tier 2 (Non-Transactional) contains 9 phases for non-critical systems that can fail gracefully without affecting empire state.

**Rationale:** Two-tier structure ensures critical empire state is atomic (transaction rollback on failure) while allowing non-critical systems to fail gracefully.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 1.2, Section 2.1

**Code:**
- `src/lib/game/services/core/turn-processor.ts` - `processTurn()` main orchestration
- `src/lib/game/services/core/tier1-processor.ts` - Tier 1 transactional phases
- `src/lib/game/services/core/tier2-processor.ts` - Tier 2 non-transactional phases

**Tests:**
- `src/lib/game/services/__tests__/turn-processor.test.ts` - Full pipeline integration test
- `src/lib/game/services/__tests__/tier1-rollback.test.ts` - Transaction rollback validation

**Status:** Draft

---

### REQ-TURN-001-02: Income Phase

**Description:** Phase 1 (Tier 1) generates resources for all empires based on formula: `income = base_rate * sector_count * civil_multiplier`. Each resource type (credits, ore, food) has a base rate per sector, multiplied by civil status multiplier (Happy: 1.2, Content: 1.0, Unrest: 0.8, Rebellion: 0.5).

**Rationale:** Resource generation is foundation of game economy. Civil status link incentivizes maintaining morale.

**Formula:**
```
credits_income = 100 * num_sectors * civil_status_multiplier
ore_income = 50 * num_sectors * civil_status_multiplier
food_income = 75 * num_sectors * civil_status_multiplier
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| base_credits_per_sector | 100 | Base credit generation per sector |
| base_ore_per_sector | 50 | Base ore generation per sector |
| base_food_per_sector | 75 | Base food generation per sector |
| civil_status_multiplier (Happy) | 1.2 | +20% income bonus |
| civil_status_multiplier (Content) | 1.0 | Normal income |
| civil_status_multiplier (Unrest) | 0.8 | -20% income penalty |
| civil_status_multiplier (Rebellion) | 0.5 | -50% income penalty |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.1

**Code:**
- `src/lib/game/services/phases/income-phase.ts` - `processIncomePhase()`
- `src/lib/game/services/civil-status.ts` - `getCivilStatusMultiplier()`

**Tests:**
- `src/lib/game/services/__tests__/income-phase.test.ts` - Verify income calculation with various civil statuses

**Status:** Draft

---

### REQ-TURN-001-03: Auto-Production Phase

**Description:** Phase 2 (Tier 1) processes crafting buildings that automatically generate derived resources (e.g., Ore Refinery: 100 raw ore → 50 refined ore). Only processes if empire has sufficient input resources. Does not allow negative resource balances.

**Rationale:** Enables resource transformation chains for Tech Wars expansion. Automated to reduce micromanagement.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/game/services/phases/auto-production-phase.ts` - `processAutoProduction()`
- `src/lib/game/services/crafting/crafting-recipes.ts` - Recipe definitions

**Tests:**
- `src/lib/game/services/__tests__/auto-production-phase.test.ts` - Verify production, insufficient resources edge case

**Status:** Draft

---

### REQ-TURN-001-04: Population Phase

**Description:** Phase 3 (Tier 1) calculates population growth or starvation based on food balance. If surplus food exists, population grows (max 5% per turn). If food deficit exists, population dies (10% of deficit) and civil status degrades.

**Rationale:** Food is critical resource for empire sustainability. Starvation has cascading negative effects (population loss + morale drop).

**Formula:**
```
food_consumed = population * 1
food_balance = food_income - food_consumed

if food_balance >= 0:
  growth = min(food_balance / 10, population * 0.05)
  population += growth
else:
  deaths = abs(food_balance) * 0.1
  population -= deaths
  civil_status degrades
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| food_per_capita | 1 | Each person consumes 1 food/turn |
| food_per_growth | 10 | 10 food required to add 1 population |
| max_growth_rate | 0.05 | Max 5% population growth per turn |
| starvation_death_rate | 0.1 | 10% of deficit translates to deaths |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.3

**Code:**
- `src/lib/game/services/phases/population-phase.ts` - `processPopulation()`

**Tests:**
- `src/lib/game/services/__tests__/population-phase.test.ts` - Growth, starvation, edge cases (zero population)

**Status:** Draft

---

### REQ-TURN-001-05: Civil Status Phase

**Description:** Phase 4 (Tier 1) calculates morale based on food balance, military losses, raids, and diplomacy. Morale thresholds determine civil status: 80-100 (Happy, 1.2x income), 50-79 (Content, 1.0x income), 20-49 (Unrest, 0.8x income, cannot declare wars), 0-19 (Rebellion, 0.5x income, 10% secession chance).

**Rationale:** Morale creates strategic depth—military losses and starvation weaken economy. Rebellion is severe penalty for neglecting empire health.

**Key Values:**
| Morale Range | Civil Status | Income Multiplier | Special Effects |
|--------------|--------------|-------------------|-----------------|
| 80-100 | Happy | 1.2 | +5 morale/turn |
| 50-79 | Content | 1.0 | Stable |
| 20-49 | Unrest | 0.8 | Cannot declare new wars |
| 0-19 | Rebellion | 0.5 | 10% secession chance/turn |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4

**Code:**
- `src/lib/game/services/phases/civil-status-phase.ts` - `processCivilStatus()`

**Tests:**
- `src/lib/game/services/__tests__/civil-status-phase.test.ts` - Morale calculation, threshold mapping, secession chance

**Status:** Draft

---

### REQ-TURN-001-06: Research Phase

**Description:** Phase 5 (Tier 1) allocates research points to active research projects. Research sectors generate points, which accumulate toward unlocking doctrines, specializations, or capstones.

**Rationale:** Research progression is core to strategic depth. Must be atomic to prevent partial research state.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.5

**Code:**
- `src/lib/game/services/phases/research-phase.ts` - `processResearch()`

**Tests:**
- `src/lib/game/services/__tests__/research-phase.test.ts` - Point accumulation, threshold unlocks

**Status:** Draft

---

### REQ-TURN-001-07: Build Queue Phase

**Description:** Phase 6 (Tier 1) advances unit construction in the build queue. Multi-turn units progress by 1 turn. Completed units are added to empire military. Queue processes in order (FIFO).

**Rationale:** Build queue is critical military mechanic. Must be atomic to prevent partial unit construction.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.6

**Code:**
- `src/lib/game/services/phases/build-queue-phase.ts` - `processBuildQueue()`

**Tests:**
- `src/lib/game/services/__tests__/build-queue-phase.test.ts` - Queue progression, unit completion

**Status:** Draft

---

### REQ-TURN-001-08: Covert Phase

**Description:** Phase 7 (Tier 1) generates spy points for empires based on covert sector count and processes active covert operations. Operations are resolved in Phase 5 processing order (REQ-COV-006).

**Rationale:** Covert operations are critical for intelligence gathering and disruption. Must be atomic for fair resolution.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.7

**Code:**
- `src/lib/game/services/phases/covert-phase.ts` - `processCovert()`

**Tests:**
- `src/lib/game/services/__tests__/covert-phase.test.ts` - Spy point generation, operation resolution

**Status:** Draft

---

### REQ-TURN-001-09: Crafting Phase

**Description:** Phase 8 (Tier 1) processes the crafting queue for manual recipes (player-initiated resource transformations). Consumes input resources and produces output resources if empire has sufficient inputs.

**Rationale:** Crafting completes the resource transformation system. Must be atomic to prevent partial recipe execution.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.8

**Code:**
- `src/lib/game/services/phases/crafting-phase.ts` - `processCrafting()`

**Tests:**
- `src/lib/game/services/__tests__/crafting-phase.test.ts` - Queue processing, recipe execution

**Status:** Draft

---

### REQ-TURN-001-10: Bot Decisions Phase

**Description:** Phase 9 (Tier 2) executes AI decision-making for all bot empires. Bots evaluate strategic options based on archetype, emotional state, and memory, then execute decisions (build units, research, diplomacy, covert ops, market trades).

**Rationale:** Bot decisions are non-critical for turn integrity. Failures should log errors but not block turn processing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.9

**Code:**
- `src/lib/game/services/phases/bot-decisions-phase.ts` - `processBotDecisions()`

**Tests:**
- `src/lib/game/services/__tests__/bot-decisions-phase.test.ts` - Decision evaluation, prioritization, failure handling

**Status:** Draft

---

### REQ-TURN-001-11: Emotional Decay Phase

**Description:** Phase 10 (Tier 2) reduces bot emotional intensity over time. Emotions cool down toward neutral state at decay rates specific to each emotion type (anger, fear, joy, trust, etc.).

**Rationale:** Emotional decay prevents permanent grudges/alliances. Non-critical for turn processing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.10

**Code:**
- `src/lib/game/services/phases/emotional-decay-phase.ts` - `processEmotionalDecay()`

**Tests:**
- `src/lib/game/services/__tests__/emotional-decay-phase.test.ts` - Decay calculation per emotion type

**Status:** Draft

---

### REQ-TURN-001-12: Memory Cleanup Phase

**Description:** Phase 11 (Tier 2) prunes old bot memories every 5 turns. Removes memories below weight threshold to prevent memory bloat. Preserves critical memories (wars, betrayals, alliances).

**Rationale:** Memory cleanup maintains performance. Non-critical for turn integrity.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| cleanup_interval | 5 | Cleanup runs every 5 turns |
| weight_threshold | 0.1 | Memories below this weight are pruned |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.11

**Code:**
- `src/lib/game/services/phases/memory-cleanup-phase.ts` - `processMemoryCleanup()`

**Tests:**
- `src/lib/game/services/__tests__/memory-cleanup-phase.test.ts` - Interval check, threshold pruning, preservation logic

**Status:** Draft

---

### REQ-TURN-001-13: Market Phase

**Description:** Phase 12 (Tier 2) updates market prices for all resources based on supply/demand dynamics. Prices adjust using formula with clamping to prevent extreme swings.

**Rationale:** Market updates are non-critical. Price calculation failures should not block turn processing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.12

**Code:**
- `src/lib/game/services/phases/market-phase.ts` - `processMarket()`

**Tests:**
- `src/lib/game/services/__tests__/market-phase.test.ts` - Price adjustment formulas, clamping

**Status:** Draft

---

### REQ-TURN-001-14: Bot Messages Phase

**Description:** Phase 13 (Tier 2) generates bot communication messages (threats, offers, taunts, requests) based on emotional state and archetype. Uses message templates with variable substitution.

**Rationale:** Bot messages add flavor but are non-critical. Generation failures should not block turn processing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.13

**Code:**
- `src/lib/game/services/phases/bot-messages-phase.ts` - `processBotMessages()`

**Tests:**
- `src/lib/game/services/__tests__/bot-messages-phase.test.ts` - Message generation, template substitution, failure handling

**Status:** Draft

---

### REQ-TURN-001-15: Galactic Events Phase

**Description:** Phase 14 (Tier 2) triggers random galactic events at milestone turns (M11: turn % 11 == 0). Events include market crashes, cosmic storms, peace summits, etc. Each event has probability, duration, and game-wide effects.

**Rationale:** Galactic events add variety but are non-critical. Event failures should not block turn processing.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| milestone_interval | 11 | Events trigger on turn % 11 == 0 |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.14

**Code:**
- `src/lib/game/services/phases/galactic-events-phase.ts` - `processGalacticEvents()`

**Tests:**
- `src/lib/game/services/__tests__/galactic-events-phase.test.ts` - Milestone triggering, probability rolls, event effects

**Status:** Draft

---

### REQ-TURN-001-16: Alliance Checkpoints Phase

**Description:** Phase 15 (Tier 2) evaluates coalition formation criteria at milestone turns (M11: turn % 11 == 0). If conditions met (leader threshold, multiple strong players), auto-coalition forms against leader.

**Rationale:** Alliance checkpoints prevent runaway victories. Non-critical for turn integrity.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| milestone_interval | 11 | Checkpoints trigger on turn % 11 == 0 |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.15

**Code:**
- `src/lib/game/services/phases/alliance-checkpoints-phase.ts` - `processAllianceCheckpoints()`

**Tests:**
- `src/lib/game/services/__tests__/alliance-checkpoints-phase.test.ts` - Milestone check, formation logic

**Status:** Draft

---

### REQ-TURN-001-17: Victory Check Phase

**Description:** Phase 16 (Tier 2) evaluates all 6 victory conditions (conquest, economic, diplomatic, research, military, survival) after turn processing completes. If any empire meets victory criteria, game ends and victory screen displays.

**Rationale:** Victory check must occur after all empires' end-of-turn states are finalized. Non-critical for turn processing but critical for game flow.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkVictory()`

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - All 6 victory condition checks

**Status:** Draft

---

### REQ-TURN-001-18: Auto-Save Phase

**Description:** Phase 17 (Tier 2) persists game state to database/storage with rotation policy (keep last N saves). On failure, logs error but does not block turn completion.

**Rationale:** Auto-save provides recovery points. Non-critical for turn processing integrity.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.17

**Code:**
- `src/lib/game/services/phases/auto-save-phase.ts` - `processAutoSave()`

**Tests:**
- `src/lib/game/services/__tests__/auto-save-phase.test.ts` - Save operation, rotation, failure handling

**Status:** Draft

---

### REQ-TURN-002: Turn Increment

**Description:** Turn number increments by 1 after all phases complete successfully. If Tier 1 fails (transaction rollback), turn number does NOT increment.

**Rationale:** Provides consistent game clock for all systems. Failed turns should not advance time.

**Source:** Section 2.4

**Code:**
- `src/lib/game/services/core/turn-processor.ts` - `incrementTurn()`

**Tests:**
- `src/lib/game/services/__tests__/turn-increment.test.ts` - Verify increment only on success

**Status:** Draft

---

### REQ-TURN-003: Victory Check Timing

**Description:** Victory conditions are checked after all turn processing completes (Phase 16), before the turn number increments. This ensures all empires' end-of-turn states are evaluated fairly.

**Rationale:** Ensures fair evaluation of all empire states. Player shouldn't win/lose mid-turn.

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/core/turn-processor.ts` - `processTurn()` calls `checkVictory()` at end of Tier 2

**Tests:**
- `src/lib/game/services/__tests__/victory-timing.test.ts` - Verify victory checked after all phases

**Status:** Draft

---

### REQ-TURN-004: Income Phase Execution (PARENT)

**Description:** Income Phase (Phase 1) generates resources for all empires. This parent spec tracks the complete income phase system.

**Children:**
- REQ-TURN-004.1: Income Generation Formula
- REQ-TURN-004.2: Civil Status Income Multipliers

**Rationale:** Resource generation is foundation of game economy. Civil status link incentivizes maintaining morale.

**Source:** Section 3.1

**Status:** Draft

---

### REQ-TURN-004.1: Income Generation Formula

**Description:** Base income formula for resource generation:
```
credits_income = base_credits_per_sector * num_sectors * civil_status_multiplier
ore_income = base_ore_per_sector * num_sectors * civil_status_multiplier
food_income = base_food_per_sector * num_sectors * civil_status_multiplier
```

**Formula:**
```
income = base_rate * sector_count * civil_multiplier
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| base_credits_per_sector | 100 | Base credit generation per sector |
| base_ore_per_sector | 50 | Base ore generation per sector |
| base_food_per_sector | 75 | Base food generation per sector |

**Rationale:** Sector-based income scales with empire size, creating expansion incentives.

**Source:** Section 3.1

**Code:**
- `src/lib/game/services/phases/income-phase.ts` - `processIncomePhase()`

**Tests:**
- `src/lib/game/services/__tests__/income-phase.test.ts` - Verify base income calculation

**Status:** Draft

---

### REQ-TURN-004.2: Civil Status Income Multipliers

**Description:** Civil status affects income generation through multipliers:

| Civil Status | Multiplier | Effect |
|--------------|------------|--------|
| Happy | 1.2 | +20% income bonus |
| Content | 1.0 | Normal income |
| Unrest | 0.8 | -20% income penalty |
| Rebellion | 0.5 | -50% income penalty |

**Rationale:** Civil status multipliers incentivize maintaining high morale and create consequences for poor governance.

**Source:** Section 3.1

**Code:**
- `src/lib/game/services/civil-status.ts` - `getCivilStatusMultiplier()`

**Tests:**
- `src/lib/game/services/__tests__/income-phase.test.ts` - Verify multiplier effects on income

**Status:** Draft

---


### REQ-TURN-005: Auto-Production Phase

**Description:** Auto-Production Phase (Phase 2) processes crafting buildings that automatically generate derived resources (e.g., Ore Refinery: 100 raw ore → 50 refined ore). Only processes if empire has sufficient input resources. Does not go negative.

**Rationale:** Enables resource transformation chains for Tech Wars expansion. Automated to reduce micromanagement.

**Source:** Section 3.2

**Code:**
- `src/lib/game/services/phases/auto-production-phase.ts` - `processAutoProduction()`
- `src/lib/game/services/crafting/crafting-recipes.ts` - Recipe definitions

**Tests:**
- `src/lib/game/services/__tests__/auto-production-phase.test.ts` - Verify production, insufficient resources edge case

**Status:** Draft

---

### REQ-TURN-006: Population Phase (PARENT)

**Description:** Population Phase (Phase 3) calculates population growth or starvation based on food balance. This parent spec tracks the complete population system.

**Children:**
- REQ-TURN-006.1: Population Growth Formula
- REQ-TURN-006.2: Starvation Death Formula
- REQ-TURN-006.3: Starvation Civil Status Impact

**Rationale:** Food is critical resource for empire sustainability. Starvation has cascading negative effects (population loss + morale drop).

**Source:** Section 3.3

**Status:** Draft

---

### REQ-TURN-006.1: Population Growth Formula

**Description:** When food surplus exists, population grows based on formula:
```
food_consumed = population * food_per_capita (1 food/person)
food_balance = food_income - food_consumed

if food_balance >= 0:
  growth = min(food_balance / 10, population * 0.05)  // Max 5% growth
  population += growth
```

**Formula:**
```
growth = min(surplus_food / 10, population * 0.05)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| food_per_capita | 1 | Each person consumes 1 food/turn |
| food_per_growth | 10 | 10 food required to add 1 population |
| max_growth_rate | 0.05 | Max 5% population growth per turn |

**Rationale:** Population growth incentivizes food production but is capped to prevent exponential growth.

**Source:** Section 3.3

**Code:**
- `src/lib/game/services/phases/population-phase.ts` - `calculateGrowth()`

**Tests:**
- `src/lib/game/services/__tests__/population-phase.test.ts` - Test growth calculation

**Status:** Draft

---

### REQ-TURN-006.2: Starvation Death Formula

**Description:** When food deficit exists, population dies based on formula:
```
if food_balance < 0:
  deaths = abs(food_balance) * 0.1
  population -= deaths
```

**Formula:**
```
deaths = food_deficit * 0.1
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| starvation_death_rate | 0.1 | 10% of deficit translates to deaths |

**Rationale:** Starvation creates immediate population loss, punishing poor food management.

**Source:** Section 3.3

**Code:**
- `src/lib/game/services/phases/population-phase.ts` - `calculateStarvation()`

**Tests:**
- `src/lib/game/services/__tests__/population-phase.test.ts` - Test starvation deaths, zero population edge case

**Status:** Draft

---

### REQ-TURN-006.3: Starvation Civil Status Impact

**Description:** When starvation occurs, civil status degrades (starvation penalty applied to morale).

**Rationale:** Starvation has cascading negative effects beyond population loss—morale drops create economic penalties.

**Source:** Section 3.3

**Code:**
- `src/lib/game/services/phases/population-phase.ts` - `applyStarvationPenalty()`

**Tests:**
- `src/lib/game/services/__tests__/population-phase.test.ts` - Test civil status degradation

**Status:** Draft

---

| Morale Range | Civil Status | Income Multiplier | Special Effects |
|--------------|--------------|-------------------|-----------------|
| 80-100 | Happy | 1.2 | +5 morale/turn |
| 50-79 | Content | 1.0 | Stable |
| 20-49 | Unrest | 0.8 | Cannot declare new wars |
| 0-19 | Rebellion | 0.5 | 10% secession chance/turn |

**Source:** Section 3.4

**Code:**
- `src/lib/game/services/phases/civil-status-phase.ts` - `processCivilStatus()`
- `src/lib/game/services/morale-calculator.ts` - Morale modifier logic

**Tests:**
- `src/lib/game/services/__tests__/civil-status-phase.test.ts` - All status thresholds, secession trigger

**Status:** Draft

---

### REQ-TURN-008: Research Phase

**Description:** Research Phase (Phase 5) adds research points to current project. When progress >= cost, research completes and unlocks new units/bonuses.
```
research_points_earned = base_research_rate * civil_status_multiplier
current_project_progress += research_points_earned

if current_project_progress >= current_project_cost:
  complete_research()
```

**Rationale:** Research progression is linear with clear completion. Civil status link means low morale slows tech advancement.

**Source:** Section 3.5

**Code:**
- `src/lib/game/services/phases/research-phase.ts` - `processResearch()`
- `src/lib/game/tech/tech-tree.ts` - Tech definitions and unlock effects

**Tests:**
- `src/lib/game/services/__tests__/research-phase.test.ts` - Research progress, completion, unlock validation

**Status:** Draft

---

### REQ-TURN-009: Build Queue Phase

**Description:** Build Queue Phase (Phase 6) decrements turns_remaining for all queue items by 1. When turns_remaining reaches 0, item is added to empire and removed from queue.

**Rationale:** Simple turn-based production. Cost is paid when item is queued, not when it completes.

**Source:** Section 3.6

**Code:**
- `src/lib/game/services/phases/build-queue-phase.ts` - `processBuildQueue()`
- `src/lib/game/actions/build-actions.ts` - Queue management (add/remove)

**Tests:**
- `src/lib/game/services/__tests__/build-queue-phase.test.ts` - Queue processing, completion, notifications

**Status:** Draft

---

### REQ-TURN-010: Covert Phase (PARENT)

**Description:** Covert Phase (Phase 7) generates spy points based on intelligence buildings. This parent spec tracks the complete covert phase system.

**Children:**
- REQ-TURN-010.1: Spy Point Generation Formula
- REQ-TURN-010.2: Spy Point Stockpile Cap

**Rationale:** Automated generation prevents micromanagement. Cap prevents infinite stockpiling.

**Source:** Section 3.7

**Status:** Draft

---

### REQ-TURN-010.1: Spy Point Generation Formula

**Description:** Spy points are generated based on formula:
```
spy_points_earned = base_spy_rate * num_spy_buildings * civil_status_multiplier
spy_points += spy_points_earned
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| base_spy_rate | 10 | Each spy building generates 10 points/turn |

**Rationale:** Spy generation scales with intelligence infrastructure and is affected by civil status.

**Source:** Section 3.7

**Code:**
- `src/lib/game/services/phases/covert-phase.ts` - `generateSpyPoints()`

**Tests:**
- `src/lib/game/services/__tests__/covert-phase.test.ts` - Test generation formula

**Status:** Draft

---

### REQ-TURN-010.2: Spy Point Stockpile Cap

**Description:** Spy points cap at maximum value to prevent hoarding:
```
spy_points = min(spy_points, max_spy_points)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| max_spy_points | 500 | Maximum stockpile |

**Rationale:** Cap prevents infinite stockpiling and encourages active use of covert operations.

**Source:** Section 3.7

**Code:**
- `src/lib/game/services/phases/covert-phase.ts` - `enforceSpyPointCap()`

**Tests:**
- `src/lib/game/services/__tests__/covert-phase.test.ts` - Test cap enforcement

**Status:** Draft

---


### REQ-TURN-012: Bot Decisions Phase

**Description:** Bot Decisions Phase (Phase 9) runs AI evaluation for all bot empires. Each bot evaluates strategic options (attack, build, research, diplomacy) based on archetype and current game state, then executes highest-priority decision. Failures log errors but don't block turn completion.

**Rationale:** Bots need access to updated Tier 1 state (income, population, civil status) to make informed decisions. Graceful failure prevents bot bugs from breaking game.

**Source:** Section 3.9, Section 4.1

**Code:**
- `src/lib/game/services/phases/bot-decisions-phase.ts` - `processBotDecisions()`
- `src/lib/game/ai/bot-archetypes.ts` - Archetype decision trees
- `src/lib/game/ai/decision-evaluator.ts` - Option evaluation and prioritization

**Tests:**
- `src/lib/game/ai/__tests__/bot-decisions.test.ts` - Each archetype decision logic
- `src/lib/game/services/__tests__/bot-decisions-phase.test.ts` - Phase execution, failure handling

**Status:** Draft

---

### REQ-TURN-013: Emotional Decay Phase

**Description:** Emotional Decay Phase (Phase 10) reduces bot emotions toward neutral over time:
- Anger: -5 points/turn
- Gratitude: -3 points/turn
- Fear: -2 points/turn

Emotions clamp at 0 (neutral).

**Rationale:** Prevents permanent grudges/alliances. Creates dynamic relationships where yesterday's enemy can become tomorrow's ally.

**Source:** Section 3.10

**Code:**
- `src/lib/game/services/phases/emotional-decay-phase.ts` - `processEmotionalDecay()`
- `src/lib/game/ai/emotion-system.ts` - Emotion management

**Tests:**
- `src/lib/game/services/__tests__/emotional-decay-phase.test.ts` - Decay rates, clamping at zero

**Status:** Draft

---

### REQ-TURN-014: Memory Cleanup Phase

**Description:** Memory Cleanup Phase (Phase 11) runs every 5 turns. Deletes bot memories older than 20 turns, except "important" memories (importance >= 5). Prevents database bloat.

**Rationale:** Balance between retention (bots remember significant events) and performance (don't store every routine action).

**Source:** Section 3.11

**Code:**
- `src/lib/game/services/phases/memory-cleanup-phase.ts` - `processMemoryCleanup()`
- `src/lib/game/ai/memory-manager.ts` - Memory importance scoring

**Tests:**
- `src/lib/game/services/__tests__/memory-cleanup-phase.test.ts` - Deletion logic, importance preservation

**Status:** Draft

---

### REQ-TURN-015: Market Phase

**Description:** Market Phase (Phase 12) updates resource prices based on supply/demand from previous turn:
```
price_change = (demand - supply) / supply * volatility_factor
new_price = clamp(old_price * (1 + price_change), min_price, max_price)
```

**Rationale:** Dynamic economy responds to player/bot trading behavior. Prevents price manipulation via min/max clamps.

**Formula:**
```
price_change = (demand - supply) / supply * 0.5
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| volatility_factor | 0.5 | Dampens price swings (50% of raw change) |
| min_price | 0.5 | Prevents prices from going too low |
| max_price | 2.0 | Prevents prices from going too high |

**Source:** Section 3.12

**Code:**
- `src/lib/game/services/phases/market-phase.ts` - `processMarket()`
- `src/lib/game/market/price-calculator.ts` - Supply/demand formula

**Tests:**
- `src/lib/game/services/__tests__/market-phase.test.ts` - Price updates, clamping, edge cases (zero supply)

**Status:** Draft

---

### REQ-TURN-016: Bot Messages Phase

**Description:** Bot Messages Phase (Phase 13) generates diplomatic messages based on bot decisions from Phase 9. Messages use archetype-specific templates with personality flavor. Failures log errors but don't block turn.

**Rationale:** Messages are cosmetic (no gameplay impact), so graceful failure is acceptable. Personality adds immersion.

**Source:** Section 3.13, Section 4.3

**Code:**
- `src/lib/game/services/phases/bot-messages-phase.ts` - `processBotMessages()`
- `src/lib/game/ai/message-templates.ts` - Template definitions by archetype
- `src/lib/game/ai/message-generator.ts` - Template substitution ({player_name}, {sector_id}, etc.)

**Tests:**
- `src/lib/game/services/__tests__/bot-messages-phase.test.ts` - Message generation, template substitution

**Status:** Draft

---

### REQ-TURN-017: Galactic Events Phase

**Description:** Galactic Events Phase (Phase 14) triggers random events (asteroid strikes, pirate raids, tech breakthroughs) with probability increasing late-game. Only active if M11 milestone unlocked. Failures log errors but don't block turn.

**Rationale:** Adds variety and unpredictability to mid/late game. Milestone gate prevents overwhelming new players.

**Formula:**
```
event_chance = base_event_chance * (current_turn / max_turns)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| base_event_chance | 0.05 | 5% base chance per turn |
| event_scaling | linear | Scales with turn number (more events late-game) |

**Source:** Section 3.14

**Code:**
- `src/lib/game/services/phases/galactic-events-phase.ts` - `processGalacticEvents()`
- `src/lib/game/events/event-pool.ts` - Event definitions and effects
- `src/lib/game/events/event-selector.ts` - Weighted random selection

**Tests:**
- `src/lib/game/services/__tests__/galactic-events-phase.test.ts` - Event triggering, probability, milestone gate

**Status:** Draft

---

### REQ-TURN-018: Alliance Checkpoints Phase

**Description:** Alliance Checkpoints Phase (Phase 15) evaluates coalition formation against dominant empires. If leader has 7+ victory points, potential coalition of 3-5 weaker empires forms (80% chance per bot). Only active if M11 milestone unlocked. Failures log errors but don't block turn.

**Rationale:** Anti-snowball mechanic. Prevents runaway victories by organizing resistance.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| coalition_trigger_vp | 7 | Victory points threshold for auto-coalition |
| coalition_join_chance | 0.8 | 80% chance bot joins coalition |
| min_coalition_size | 3 | Minimum empires to form coalition |
| max_coalition_size | 5 | Maximum empires in coalition |

**Source:** Section 3.15

**Code:**
- `src/lib/game/services/phases/alliance-checkpoints-phase.ts` - `processAllianceCheckpoints()`
- `src/lib/game/diplomacy/coalition-manager.ts` - Coalition formation logic

**Tests:**
- `src/lib/game/services/__tests__/alliance-checkpoints-phase.test.ts` - Coalition formation, thresholds, milestone gate

**Status:** Draft

---

### REQ-TURN-019: Victory Check Phase (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-TURN-019-01 through REQ-TURN-019-06 for individual victory checks.

**Overview:** Victory Check Phase (Phase 16) evaluates all 6 victory conditions for all empires. First empire to meet any condition wins. Game locks after victory.

---

### REQ-TURN-019-01: Military Victory Check

**Description:** Military Victory Check evaluates if any empire controls 70% or more of all sectors. Threshold is roughly 70 of 100 sectors. First empire to reach threshold wins instantly.

**Rationale:** Military dominance victory path. Rewards aggressive expansion and sector control strategy.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Military |
| Threshold | 70% of total sectors |
| Typical Value | 70 of 100 sectors |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkMilitaryVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Military condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Military victory trigger at 70%

**Status:** Draft

**Cross-Reference:** REQ-VIC-001 (Conquest Victory)

---

### REQ-TURN-019-02: Economic Victory Check

**Description:** Economic Victory Check evaluates if any empire has 100,000 or more credits in stockpile (not income). First empire to reach threshold wins instantly.

**Rationale:** Economic accumulation victory path. Rewards market trading and resource management.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Economic |
| Threshold | 100,000 credits |
| Measurement | Stockpile (not income) |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkEconomicVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Economic condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Economic victory at 100k credits

**Status:** Draft

**Cross-Reference:** REQ-VIC-002 (Economic Victory)

---

### REQ-TURN-019-03: Diplomatic Victory Check

**Description:** Diplomatic Victory Check evaluates if any empire has alliances with 80% or more of all empires. Threshold is roughly 80 of 100 empires. First empire to reach threshold wins instantly.

**Rationale:** Diplomatic unity victory path. Rewards treaty-making and relationship building.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Diplomatic |
| Threshold | 80% of total empires |
| Typical Value | 80 of 100 empires |
| Treaty Type | Active alliances only |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkDiplomaticVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Diplomatic condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Diplomatic victory at 80% alliances

**Status:** Draft

**Cross-Reference:** REQ-VIC-003 (Diplomatic Victory)

---

### REQ-TURN-019-04: Research Victory Check

**Description:** Research Victory Check evaluates if any empire has completed 100% of the tech tree (all branches complete). First empire to reach threshold wins instantly.

**Rationale:** Scientific advancement victory path. Rewards research investment and tech progression.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Research |
| Threshold | 100% tech tree completion |
| Measurement | All branches completed |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkResearchVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Research condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Research victory with full tech tree

**Status:** Draft

**Cross-Reference:** REQ-VIC-004 (Research Victory)

---

### REQ-TURN-019-05: Covert Victory Check

**Description:** Covert Victory Check evaluates if any empire has eliminated 5 or more empires via assassination operations. Only assassinations count (not combat eliminations). First empire to reach threshold wins instantly.

**Rationale:** Shadow ops victory path. Rewards covert operations mastery and strategic eliminations.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Covert |
| Threshold | 5 empire eliminations |
| Measurement | Assassination operations only |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkCovertVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Covert condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Covert victory after 5 assassinations

**Status:** Draft

**Cross-Reference:** REQ-VIC-005 (Military Victory - may need update for covert-specific victory)

---

### REQ-TURN-019-06: Survival Victory Check

**Description:** Survival Victory Check evaluates if only one empire remains alive. Last empire standing wins instantly. Empires are eliminated when they control zero sectors.

**Rationale:** Elimination victory path. Rewards aggressive conquest and total domination.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Survival |
| Threshold | 1 empire remaining |
| Elimination Criteria | Zero sectors controlled |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkSurvivalVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Survival condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Survival victory with 1 empire left

**Status:** Draft

**Cross-Reference:** REQ-VIC-006 (Survival Victory)

---

### REQ-TURN-020: Auto-Save Phase

**Description:** Auto-Save Phase (Phase 17) persists entire game state to JSON file. Saves to `saves/game_{game_id}_turn_{turn_number}.json`. Keeps last 10 auto-saves (deletes older). Failures log errors and warn player but don't block turn.

**Rationale:** Crash recovery. Player can reload last auto-save if game crashes or bug occurs.

**Source:** Section 3.17

**Code:**
- `src/lib/game/services/phases/auto-save-phase.ts` - `processAutoSave()`
- `src/lib/game/persistence/save-manager.ts` - File I/O, rotation logic

**Tests:**
- `src/lib/game/services/__tests__/auto-save-phase.test.ts` - Save file creation, rotation, failure handling

**Status:** Draft

---

### REQ-TURN-021: Performance Budget (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-TURN-021-A through REQ-TURN-021-D below.

**Overview:** Turn processing must complete in <2 seconds (2000ms) for 100 empires on target hardware (modern desktop, 8GB RAM, SSD).

**Budget Breakdown:**
- Tier 1 (Phases 1-8): 800ms [REQ-TURN-021-A]
- Bot Decisions (Phase 9): 400ms [REQ-TURN-021-B]
- Tier 2 (Phases 10-17): 300ms [REQ-TURN-021-C]
- UI/Animations: 500ms [REQ-TURN-021-D]
- **Total:** 2000ms

---

### REQ-TURN-021-A: Tier 1 Performance Budget

**Description:** Phases 1-8 (database-heavy transactional phases) must complete within 800ms budget for 100 empires.

**Budget Allocation:**
- Budget: 800ms (40% of total 2000ms)
- Phases covered: 1-8 (Income, Auto-Production, Population, Civil Status, Research, Build Queue, Covert, Crafting)
- Characteristics: Database writes, transactional operations

**Rationale:** These are the heaviest computational phases with DB writes. Largest budget allocation reflects this complexity.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, PRD-EXECUTIVE.md Success Metrics, Tier 1 Budget

**Code:** TBD - `src/lib/game/monitoring/performance-tracker.ts` - Tier 1 timing

**Tests:** TBD - Load test for Phases 1-8 with 100 empires

**Status:** Draft

> **⚠️ PERFORMANCE TARGET**: 800ms budget requires optimization. Profile each phase to identify bottlenecks.

---

### REQ-TURN-021-B: Bot Decisions Performance Budget

**Description:** Phase 9 (Bot Decisions) must complete within 400ms budget for 100 empires, utilizing parallelization.

**Budget Allocation:**
- Budget: 400ms (20% of total 2000ms)
- Phases covered: 9 (Bot Decisions only)
- Characteristics: Parallelizable, CPU-bound, LLM calls

**Rationale:** Bot AI is expensive but parallelizable. Can utilize multi-core CPUs effectively. Second-largest budget.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, PRD-EXECUTIVE.md Success Metrics, Bot AI Budget

**Code:** TBD - `src/lib/game/monitoring/performance-tracker.ts` - Bot phase timing

**Tests:** TBD - Parallel bot decision load test (100 bots)

**Status:** Draft

> **⚠️ PERFORMANCE TARGET**: 400ms for 100 bots = 4ms/bot average. Requires async/parallel execution.

---

### REQ-TURN-021-C: Tier 2 Performance Budget

**Description:** Phases 10-17 (logging, events, checkpoints, save) must complete within 300ms budget for 100 empires.

**Budget Allocation:**
- Budget: 300ms (15% of total 2000ms)
- Phases covered: 10-17 (Emotional Decay, Memory Cleanup, Market, Bot Messages, Galactic Events, Alliance Checkpoints, Victory Check, Auto-Save)
- Characteristics: Lightweight, async-friendly operations

**Rationale:** These phases are lower-priority bookkeeping tasks. Can be optimized aggressively or deferred.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, PRD-EXECUTIVE.md Success Metrics, Tier 2 Budget

**Code:** TBD - `src/lib/game/monitoring/performance-tracker.ts` - Tier 2 timing

**Tests:** TBD - Load test for Phases 10-17 with 100 empires

**Status:** Draft

> **⚠️ PERFORMANCE TARGET**: 300ms budget is tight. Consider async operations and debouncing.

---

### REQ-TURN-021-D: UI and Animation Performance Budget

**Description:** UI rendering and animations must complete within 500ms budget to maintain responsive feel.

**Budget Allocation:**
- Budget: 500ms (25% of total 2000ms)
- Phases covered: Frontend rendering, animations, state updates
- Characteristics: Client-side, GPU-accelerated when possible

**Rationale:** UI updates happen after server processing. 500ms budget allows smooth animations without feeling laggy.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, PRD-EXECUTIVE.md Success Metrics, UI Budget

**Code:** TBD - `src/lib/frontend/monitoring/render-tracker.ts` - UI timing

**Tests:** TBD - UI render performance test with 100 empire state changes

**Status:** Draft

> **⚠️ PERFORMANCE TARGET**: 500ms for animations. Use CSS transitions and requestAnimationFrame.

---

**Common Code & Tests (All Sub-Specs):**
- `src/lib/game/services/core/turn-processor.ts` - Performance logging orchestration
- `src/lib/game/monitoring/performance-tracker.ts` - Unified phase timing measurement
- `src/lib/game/services/__tests__/performance-budget.test.ts` - Full 2000ms budget validation (100 empires)

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-TURN-001 | Turn Processing Pipeline | Draft | TBD |
| REQ-TURN-002 | Turn Increment | Draft | TBD |
| REQ-TURN-003 | Victory Check Timing | Draft | TBD |
| REQ-TURN-004 | Income Phase Execution | Draft | TBD |
| REQ-TURN-005 | Auto-Production Phase | Draft | TBD |
| REQ-TURN-006 | Population Phase | Draft | TBD |
| REQ-TURN-007 | Civil Status Phase | Draft | TBD |
| REQ-TURN-008 | Research Phase | Draft | TBD |
| REQ-TURN-009 | Build Queue Phase | Draft | TBD |
| REQ-TURN-010 | Covert Phase | Draft | TBD |
| REQ-TURN-011 | Crafting Phase | Draft | TBD |
| REQ-TURN-012 | Bot Decisions Phase | Draft | TBD |
| REQ-TURN-013 | Emotional Decay Phase | Draft | TBD |
| REQ-TURN-014 | Memory Cleanup Phase | Draft | TBD |
| REQ-TURN-015 | Market Phase | Draft | TBD |
| REQ-TURN-016 | Bot Messages Phase | Draft | TBD |
| REQ-TURN-017 | Galactic Events Phase | Draft | TBD |
| REQ-TURN-018 | Alliance Checkpoints Phase | Draft | TBD |
| REQ-TURN-019 | Victory Check Phase | Draft | TBD |
| REQ-TURN-020 | Auto-Save Phase | Draft | TBD |
| REQ-TURN-021 | Performance Budget | Draft | TBD |

**Total Specifications:** 21
**Implemented:** 0
**Validated:** 0
**Draft:** 21

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: game_state
-- Purpose: Store current turn number and processing status
CREATE TABLE game_state (
  game_id UUID PRIMARY KEY,
  current_turn INTEGER NOT NULL DEFAULT 0,
  max_turns INTEGER NOT NULL DEFAULT 500,
  turn_processing_status VARCHAR(20) DEFAULT 'idle',  -- idle, processing, error
  last_processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: empires
-- Purpose: Store empire state (resources, population, morale, etc.)
CREATE TABLE empires (
  empire_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES game_state(game_id) ON DELETE CASCADE,
  empire_name VARCHAR(100) NOT NULL,
  is_player BOOLEAN DEFAULT FALSE,
  archetype VARCHAR(50),  -- Warlord, Diplomat, Merchant, etc.

  -- Resources (updated in Phase 1)
  credits BIGINT DEFAULT 1000,
  ore BIGINT DEFAULT 500,
  food BIGINT DEFAULT 300,

  -- Population (updated in Phase 3)
  population BIGINT DEFAULT 1000,

  -- Morale (updated in Phase 4)
  morale INTEGER DEFAULT 75,  -- 0-100
  civil_status VARCHAR(20) DEFAULT 'Content',  -- Happy, Content, Unrest, Rebellion

  -- Research (updated in Phase 5)
  current_research_id UUID REFERENCES research_projects(id),
  research_progress INTEGER DEFAULT 0,

  -- Covert (updated in Phase 7)
  spy_points INTEGER DEFAULT 0,

  -- Victory Points
  victory_points INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_empires_game_id ON empires(game_id);
CREATE INDEX idx_empires_is_player ON empires(is_player);
CREATE INDEX idx_empires_victory_points ON empires(victory_points DESC);

-- Table: build_queue
-- Purpose: Track units/buildings in production (Phase 6)
CREATE TABLE build_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID REFERENCES empires(empire_id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,  -- unit, building
  item_id VARCHAR(100) NOT NULL,
  turns_remaining INTEGER NOT NULL,
  cost_paid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_build_queue_empire_id ON build_queue(empire_id);

-- Table: crafting_queue
-- Purpose: Track crafting items in production (Phase 8)
CREATE TABLE crafting_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID REFERENCES empires(empire_id) ON DELETE CASCADE,
  recipe_id VARCHAR(100) NOT NULL,
  turns_remaining INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crafting_queue_empire_id ON crafting_queue(empire_id);

-- Table: bot_emotions
-- Purpose: Store bot emotional states (Phase 10)
CREATE TABLE bot_emotions (
  emotion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_empire_id UUID REFERENCES empires(empire_id) ON DELETE CASCADE,
  target_empire_id UUID REFERENCES empires(empire_id) ON DELETE CASCADE,
  emotion_type VARCHAR(20) NOT NULL,  -- anger, gratitude, fear
  intensity INTEGER DEFAULT 0,  -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_emotions_bot_id ON bot_emotions(bot_empire_id);
CREATE INDEX idx_bot_emotions_target_id ON bot_emotions(target_empire_id);

-- Table: bot_memories
-- Purpose: Store bot memories for AI decision-making (Phase 11 cleanup)
CREATE TABLE bot_memories (
  memory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_empire_id UUID REFERENCES empires(empire_id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL,  -- attack, trade, alliance, etc.
  importance INTEGER DEFAULT 1,  -- 1-10 (10 = never delete)
  memory_data JSONB,  -- Flexible storage for event details
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_memories_bot_id ON bot_memories(bot_empire_id);
CREATE INDEX idx_bot_memories_turn ON bot_memories(turn_number);
CREATE INDEX idx_bot_memories_importance ON bot_memories(importance);

-- Table: market_prices
-- Purpose: Track resource prices (Phase 12)
CREATE TABLE market_prices (
  price_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES game_state(game_id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,  -- credits, ore, food
  current_price DECIMAL(10, 2) DEFAULT 1.0,
  supply_last_turn BIGINT DEFAULT 0,
  demand_last_turn BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_prices_game_id ON market_prices(game_id);
CREATE UNIQUE INDEX idx_market_prices_resource ON market_prices(game_id, resource_type);

-- Table: turn_processing_log
-- Purpose: Log phase execution for debugging and monitoring
CREATE TABLE turn_processing_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES game_state(game_id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  phase_name VARCHAR(50) NOT NULL,
  phase_number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,  -- success, error
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_turn_log_game_turn ON turn_processing_log(game_id, turn_number);
CREATE INDEX idx_turn_log_status ON turn_processing_log(status);
```

### 7.2 Service Architecture

**Core TurnProcessor Service:**

```typescript
// src/lib/game/services/core/turn-processor.ts

export class TurnProcessor {
  /**
   * Main turn processing orchestrator
   * Coordinates Tier 1 (transactional) and Tier 2 (non-transactional) phases
   * @spec REQ-TURN-001
   */
  async processTurn(): Promise<TurnProcessingResult> {
    // 1. Mark turn as processing
    // 2. Execute Tier 1 (atomic transaction)
    // 3. On Tier 1 failure: rollback, abort
    // 4. Execute Tier 2 (graceful failure)
    // 5. Increment turn number
    // 6. Return result with performance metrics
  }

  private async processTier1(turn: number): Promise<{ success: boolean }> {
    // Wraps 8 phases in database transaction
    // Commits all or rolls back all on failure
  }

  private async processTier2(turn: number): Promise<string[]> {
    // Executes 9 phases with individual error handling
    // Returns array of errors (empty if all succeed)
  }
}
```

For complete implementation with error handling, performance logging, and all phase orchestration, see [Appendix: Service Architecture](appendix/TURN-PROCESSING-SYSTEM-APPENDIX.md#11-complete-turnprocessor-service).

### 7.3 Server Actions

```typescript
// src/app/actions/turn-actions.ts

"use server";

/**
 * Process next turn
 * @spec REQ-TURN-001
 */
export async function processTurnAction(gameId: string): Promise<TurnActionResult> {
  const processor = new TurnProcessor(gameId);
  const result = await processor.processTurn();
  revalidatePath(`/game/${gameId}`);
  return result;
}

/**
 * Get current turn number
 */
export async function getCurrentTurnAction(gameId: string): Promise<{ turn: number; maxTurns: number }> {
  // Query game_state table
}
```

For complete server action implementations with error handling and revalidation logic, see [Appendix: Server Actions](appendix/TURN-PROCESSING-SYSTEM-APPENDIX.md#12-server-actions).

### 7.4 UI Components

```typescript
// src/components/turn/TurnCounter.tsx
export function TurnCounter({ gameId }: TurnCounterProps) {
  const { turn, maxTurns } = useCurrentTurn(gameId);
  return <div>TURN {turn} / {maxTurns}</div>;
}

// src/components/turn/TurnButton.tsx
export function TurnButton({ gameId }: TurnButtonProps) {
  const handleEndTurn = async () => {
    const result = await processTurnAction(gameId);
    // Handle success/error states
  };
  return <button onClick={handleEndTurn}>End Turn</button>;
}

// src/components/turn/TurnProcessingOverlay.tsx
export function TurnProcessingOverlay({ visible, progress }: Props) {
  return <div>Processing: {progress}%</div>;
}
```

For complete UI components with LCARS styling, animations, and error handling, see [Appendix: UI Components](appendix/TURN-PROCESSING-SYSTEM-APPENDIX.md#13-ui-components).

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| Turn Processing Time (100 empires) | 1500ms | ±500ms | Performance profiler on processTurn() |
| Turn Processing Time (10 empires) | 500ms | ±200ms | Performance profiler on processTurn() |
| Tier 1 Transaction Time | 800ms | ±200ms | Database transaction log |
| Bot Decisions Time (100 bots) | 400ms | ±100ms | Phase 9 execution timer |
| Database Rollback Success Rate | 100% | 0% | Test transaction failures |
| Turn Completion Rate (no errors) | 99.9% | ±0.1% | Production monitoring (successful turns / total attempts) |
| Auto-Save Success Rate | 99% | ±1% | Phase 17 monitoring |

### 8.2 Simulation Requirements

**Load Test:**
```
Scenario: 100 empires, 500 turns
Iterations: 100 games
Success Criteria: Average turn time < 2000ms, 99.9% completion rate
```

**Transaction Rollback Test:**
```
Scenario: Inject random failures in each Tier 1 phase
Iterations: 1000 turns
Success Criteria: 100% rollback success, no data corruption
```

**Bot AI Performance Test:**
```
Scenario: 100 bots making complex decisions (evaluate 20+ options each)
Iterations: 100 turns
Success Criteria: Phase 9 completes in <400ms
```

### 8.3 Playtest Checklist

- [ ] **Turn 1-10**: Player can click "End Turn" and see immediate feedback (<2s)
- [ ] **Turn 50**: Income, population, research all progressing visibly
- [ ] **Turn 100**: Bot messages are diverse and personality-appropriate
- [ ] **Turn 200**: No noticeable slowdown (turn processing still <2s)
- [ ] **Turn 500**: Game still responsive, auto-saves rotating correctly
- [ ] **Error Recovery**: Inject database error during Tier 1 → Transaction rolls back, player can retry
- [ ] **Victory Check**: Player achieves Military Victory → Game ends immediately, victory screen shown
- [ ] **Coalition Formation**: Player reaches 7 VP → Coalition forms against player next turn
- [ ] **Starvation Cascade**: Player runs out of food → Population drops, morale drops, income drops (civil status penalty)
- [ ] **Research Completion**: Player completes research → New units unlocked, notification shown

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| No turn processing system | Full 17-phase pipeline | 1. Implement Tier 1 phases (8 phases) first<br>2. Add Tier 2 phases (9 phases) incrementally<br>3. Connect to UI |
| Manual resource updates | Automated Phase 1 (Income) | 1. Define base income rates per sector<br>2. Implement civil status multipliers<br>3. Batch database updates |
| No bot AI | Phase 9 (Bot Decisions) | 1. Define 8 archetypes<br>2. Implement decision trees<br>3. Parallelize bot evaluation |
| No victory conditions | Phase 16 (Victory Check) | 1. Define 6 victory thresholds<br>2. Implement evaluation logic<br>3. Create victory screen UI |

### 9.2 Data Migration

**No existing data to migrate.** This is a greenfield implementation.

**Initial Game Setup:**
```sql
-- When new game is created, initialize game_state
INSERT INTO game_state (game_id, current_turn, max_turns)
VALUES (?, 0, 500);

-- Initialize all 100 empires with starting resources
INSERT INTO empires (game_id, empire_name, is_player, archetype, credits, ore, food, population, morale)
VALUES
  (?, 'Player Empire', TRUE, NULL, 1000, 500, 300, 1000, 75),
  (?, 'Bot Empire 1', FALSE, 'Warlord', 1000, 500, 300, 1000, 75),
  (?, 'Bot Empire 2', FALSE, 'Diplomat', 1000, 500, 300, 1000, 75),
  -- ... (98 more bot empires)
;

-- Initialize market prices
INSERT INTO market_prices (game_id, resource_type, current_price)
VALUES
  (?, 'credits', 1.0),
  (?, 'ore', 1.0),
  (?, 'food', 1.0);
```

### 9.3 Rollback Plan

If turn processing system causes critical issues:

1. **Immediate Rollback:**
   - Disable "End Turn" button in UI
   - Display maintenance message: "Turn processing temporarily disabled"
   - Restore last working auto-save for all active games

2. **Investigate:**
   - Check `turn_processing_log` table for errors
   - Identify failing phase
   - Fix phase implementation

3. **Gradual Re-enable:**
   - Enable Tier 1 only (critical phases)
   - Test with 10 empires, then 50, then 100
   - Enable Tier 2 phases one at a time
   - Monitor error rates

4. **Data Integrity:**
   - If Tier 1 rollback fails → Database corruption possible
   - Restore from most recent auto-save
   - Manual verification of empire resource balances

---

## 10. Conclusion

### Key Decisions

1. **Two-Tier Architecture**: Separating atomic empire state updates (Tier 1) from gracefully degradable systems (Tier 2) ensures game reliability while allowing non-critical features to fail safely.

2. **17-Phase Pipeline**: Explicit ordering prevents race conditions and ensures predictable state transitions. Each phase builds on previous phases' outputs.

3. **<2 Second Performance Budget**: Sub-second processing enables fluid gameplay. Players perceive instant feedback, not waiting for slow computers.

4. **Transaction Boundaries**: Tier 1 wrapped in database transaction guarantees consistency. Failed turns roll back completely—no partial state corruption.

5. **Graceful Tier 2 Failure**: Bot messages, market updates, and events are cosmetic. Their failure doesn't break gameplay. Log errors, continue processing.

### Open Questions

- **Should Memory Cleanup frequency be configurable?** Currently hard-coded to every 5 turns. Could make it a game setting (1, 5, 10, 20 turns).

- **Should Victory Check be its own Tier 3?** Currently in Tier 2 (non-transactional). If victory check fails, game continues. Is this acceptable, or should victory be transactional?

- **Should bot parallelization be configurable?** Phase 9 runs bots in parallel for performance. Could add setting to run sequentially for easier debugging.

- **Should auto-save rotation limit be configurable?** Currently keeps last 10 auto-saves. Players with limited disk space might want fewer (5). Power users might want more (20).

### Dependencies

**Depends On:**
- Database schema (empires, game_state, build_queue, etc.)
- Civil status system (for income multipliers)
- Research system (tech tree definitions)
- Bot AI archetypes (Warlord, Diplomat, Merchant, etc.)
- Victory conditions (6 victory types defined)
- Market system (price calculation logic)

**Depended By:**
- Player UI (End Turn button, turn counter, notifications)
- Bot AI (needs Phase 9 to run bot decisions)
- Victory screen (triggered by Phase 16)
- Auto-save system (triggered by Phase 17)
- All game mechanics (income, population, research, etc. driven by turn processing)

**Critical Path:** Turn processing is the **central orchestrator** of the game. Nearly all systems depend on it. Must be implemented early and tested thoroughly.

---

**Document Complete**
**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Date:** 2026-01-12
