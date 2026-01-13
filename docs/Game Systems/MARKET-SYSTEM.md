# Market System

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-MKT
**Created:** 2026-01-12
**Last Updated:** 2026-01-12
**Replaces:** docs/draft/MARKET-SYSTEM.md

---

## Document Purpose

This document defines the complete Galactic Market System for Nexus Dominion, enabling resource trading, price fluctuation, and economic strategy. The market serves as a central economic hub where players and bots can convert surplus resources into needed materials, creating a dynamic economy driven by supply and demand.

**Who Should Read This:**
- Backend developers implementing market logic and price calculations
- Game designers balancing resource values and market dynamics
- Frontend developers building market UI and trading interfaces
- QA testers validating market balance and bot trading behavior

**What This Resolves:**
- Complete specification of buy/sell mechanics and pricing formulas
- Dynamic price fluctuation based on supply, demand, and market events
- Bot archetype trading behavior and decision-making
- Transaction fees, bulk discounts, and market manipulation prevention
- Integration with anti-snowball mechanics and research bonuses

**Design Philosophy:**
- **Economic depth without complexity**: Simple buy/sell interface with strategic depth through timing
- **Supply and demand driven**: Prices respond to player and bot actions, creating market dynamics
- **Merchant archetype advantage**: Market Insight passive makes trading a viable strategy
- **Anti-hoarding mechanics**: Storage costs and price decay discourage market manipulation
- **Bot-driven liquidity**: AI trading ensures market remains active and realistic
- **Integration with victory conditions**: Economic victory path requires market mastery

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

### 1.1 The Galactic Market

The Galactic Market is a centralized exchange where empires trade resources (Food, Ore, Petroleum) for Credits. Prices fluctuate based on:
- **Supply**: How much has been sold recently
- **Demand**: How much has been bought recently
- **Market Events**: Random events (bumper harvests, shortages, trade disruptions)
- **Bot Behavior**: AI empires buy/sell based on archetype and needs

**Example:**
- Turn 10: Ore priced at 50 credits/unit (baseline)
- Turn 11: 3 bots sell 5,000 ore each → supply increases → price drops to 42 credits/unit
- Turn 12: Warlord bot buys 10,000 ore for war → demand spikes → price rises to 58 credits/unit

### 1.2 Key Mechanic: Buy Low, Sell High

Players succeed by:
1. **Selling surplus at peak prices** - Monitor price trends, sell when high
2. **Buying deficits at low prices** - Stock up when prices crash
3. **Anticipating market swings** - Predict bot behavior (wars drive ore demand)
4. **Leveraging Merchant bonuses** - See next turn prices (if Merchant archetype or allied)

**Resource Conversion Loop:**
```
Food Sector → 160 Food/turn → Sell at 35 cr/unit → 5,600 credits
                                ↓
Ore Sector ← 112 Ore/turn ← Buy at 45 cr/unit ← 5,040 credits spent
```

### 1.3 Player Experience

**Early Game (Turns 1-30):**
- Markets stable, prices near baseline
- Players learn buy/sell mechanics
- Bots trade minimally, establishing positions

**Mid Game (Turns 31-100):**
- Wars create demand spikes (Ore, Petroleum)
- Price swings ±30% common
- Merchant bots actively trade
- Market timing becomes strategic

**Late Game (Turns 101-200):**
- Extreme volatility (±50% swings)
- Anti-snowball penalties (leader pays +20%)
- Market manipulation by dominant empires
- Economic victory possible through trading profits

---

## 2. Mechanics Overview

### 2.1 Resource Base Prices

| Resource | Base Price | Volatility | Use Case |
|----------|-----------|------------|----------|
| **Food** | 30 cr/unit | Low (±20%) | Population, soldier upkeep |
| **Ore** | 50 cr/unit | Medium (±35%) | Military units, defenses |
| **Petroleum** | 80 cr/unit | High (±50%) | Unit fuel, wormhole construction |

**Why Different Volatility?**
- Food: Always needed, steady demand → stable prices
- Ore: War-dependent demand → moderate swings
- Petroleum: Luxury resource, wormhole costs → extreme volatility

### 2.2 Price Calculation Formula

```
Current Price = Base Price × Supply Modifier × Demand Modifier × Event Modifier × Leader Penalty

Supply Modifier = 1.0 - (Net Sell Volume / Market Depth) × 0.5
  - Net Sell Volume: Total sold - total bought (last 5 turns)
  - Market Depth: 100,000 units (dampens extreme swings)
  - Max impact: -50% (when 100k+ net sold)

Demand Modifier = 1.0 + (Net Buy Volume / Market Depth) × 0.5
  - Net Buy Volume: Total bought - total sold (last 5 turns)
  - Max impact: +50% (when 100k+ net bought)

Event Modifier = 1.0 ± Event Impact
  - "Bumper Harvest": Food -15% for 10 turns
  - "Ore Shortage": Ore +25% for 15 turns
  - "Fuel Crisis": Petroleum +40% for 8 turns

Leader Penalty = 1.2 if empire has 7+ Victory Points, else 1.0
```

**Example Calculation:**
```
Ore Price:
Base = 50 cr
Supply Modifier = 1.0 - (20,000 / 100,000) × 0.5 = 0.9 (10% cheaper from selling)
Demand Modifier = 1.0 + (15,000 / 100,000) × 0.5 = 1.075 (7.5% more expensive from buying)
Event Modifier = 1.25 (Ore Shortage active)
Leader Penalty = 1.0 (not the leader)

Current Price = 50 × 0.9 × 1.075 × 1.25 × 1.0 = 60.47 cr/unit
```

### 2.3 Transaction Fees

| Transaction Type | Fee | Notes |
|-----------------|-----|-------|
| **Buy** | 2% of total | Minimum 100 credits |
| **Sell** | 5% of total | Minimum 250 credits |
| **Bulk Discount** | -1% per 10,000 units | Max -3% (at 30k+ units) |
| **Research Bonus** | -2% with Commerce Tier 2 | Stacks with bulk discount |

**Rationale:** Sell fees higher to prevent market manipulation (buy low, resell high cycles). Bulk discounts reward large trades.

### 2.4 Market Limits

- **Max Transaction**: 50,000 units per turn per resource
- **Reserve Requirement**: Cannot sell below 10% of sector production capacity
- **Price Floor**: Never falls below 50% of base price
- **Price Ceiling**: Never exceeds 200% of base price

**Example Reserve Requirement:**
```
Player has:
- 3 Food sectors (480 food/turn production)
- 12,500 food in storage

Reserve = 480 × 0.10 = 48 food (must keep)
Can sell = 12,500 - 48 = 12,452 food
```

---

## 3. Detailed Rules

### 3.1 Price Fluctuation Mechanics

**Turn-by-Turn Updates:**

Each turn, prices update using this algorithm:

```
1. CALCULATE NET VOLUME (last 5 turns)
   net_sold = sum(sell_transactions) - sum(buy_transactions)
   net_bought = sum(buy_transactions) - sum(sell_transactions)

2. UPDATE SUPPLY/DEMAND MODIFIERS
   if net_sold > 0:
       supply_modifier -= (net_sold / market_depth) × 0.1
   if net_bought > 0:
       demand_modifier += (net_bought / market_depth) × 0.1

3. APPLY DECAY (revert toward baseline)
   supply_modifier = supply_modifier × 0.95 + 0.05
   demand_modifier = demand_modifier × 0.95 + 0.05

4. CHECK FOR MARKET EVENTS
   if random(1-100) <= event_chance:
       trigger_market_event()

5. APPLY LEADER PENALTY
   for each empire with 7+ VP:
       apply 1.2× multiplier to their buy prices

6. CLAMP PRICES
   final_price = clamp(calculated_price, base × 0.5, base × 2.0)
```

**Price Decay:**
Prices gradually revert to baseline (5% per turn) to prevent permanent inflation/deflation.

### 3.2 Market Events

Random events create dramatic price swings and strategic opportunities.

**Event Types:**

| Event | Trigger Chance | Duration | Impact |
|-------|---------------|----------|--------|
| **Bumper Harvest** | 3% per turn | 10 turns | Food -15% |
| **Famine** | 2% per turn | 12 turns | Food +30% |
| **Ore Shortage** | 4% per turn | 15 turns | Ore +25% |
| **Mining Boom** | 3% per turn | 8 turns | Ore -20% |
| **Fuel Crisis** | 2% per turn | 8 turns | Petroleum +40% |
| **Refinery Glut** | 3% per turn | 10 turns | Petroleum -25% |
| **Trade War** | 1% per turn | 20 turns | All fees +3% |
| **Free Trade** | 2% per turn | 15 turns | All fees -2% |

**Event Exclusions:**
- Only 1 event active per resource type at a time
- "Trade War" and "Free Trade" cannot overlap
- Events do not trigger in first 10 turns (tutorial period)

**Example Event:**
```
Turn 45: "Ore Shortage" begins
- Ore price: 50 → 62.5 cr/unit (+25%)
- Lasts until Turn 60
- Warlord/Blitzkrieg bots buy aggressively
- Merchant bots sell ore reserves for profit
- Player notification: "ORE SHORTAGE: Galactic mining operations disrupted. Prices surging."
```

### 3.3 Buy Transaction Rules

**Process:**

1. **Player initiates buy order**
   - Select resource (Food/Ore/Petroleum)
   - Enter quantity (1 - 50,000 units)
   - System calculates total cost

2. **Cost Calculation:**
   ```
   unit_price = current_market_price × leader_penalty
   subtotal = unit_price × quantity
   bulk_discount = max(0, floor(quantity / 10000) × 0.01) // Up to -3%
   research_discount = has_commerce_tier2 ? 0.02 : 0.0
   total_discount = min(bulk_discount + research_discount, 0.05)

   fee = max(100, subtotal × 0.02 × (1.0 - total_discount))
   total_cost = subtotal + fee
   ```

3. **Validation:**
   - Player has sufficient credits
   - Quantity > 0 and ≤ 50,000
   - Player storage not full (if applicable)

4. **Execute:**
   - Deduct credits from player
   - Add resources to player storage
   - Record transaction in market history
   - Update demand modifier

**Example Buy:**
```
Player wants to buy 15,000 Ore
Current price: 55 cr/unit
Leader penalty: 1.0 (not leader)
Bulk discount: floor(15000 / 10000) × 0.01 = 0.01 (1%)
Research bonus: 0.02 (has Commerce Tier 2)
Total discount: 0.03 (3%)

Subtotal: 55 × 15,000 = 825,000 credits
Fee: 825,000 × 0.02 × 0.97 = 16,005 credits
Total: 825,000 + 16,005 = 841,005 credits

Player gets: 15,000 Ore
Player pays: 841,005 Credits
```

### 3.4 Sell Transaction Rules

**Process:**

1. **Player initiates sell order**
   - Select resource
   - Enter quantity (respects reserve requirement)
   - System calculates proceeds

2. **Revenue Calculation:**
   ```
   unit_price = current_market_price
   subtotal = unit_price × quantity
   bulk_discount = max(0, floor(quantity / 10000) × 0.01)
   research_discount = has_commerce_tier2 ? 0.02 : 0.0
   total_discount = min(bulk_discount + research_discount, 0.05)

   fee = max(250, subtotal × 0.05 × (1.0 - total_discount))
   total_revenue = subtotal - fee
   ```

3. **Validation:**
   - Player has sufficient resources
   - Quantity respects reserve requirement
   - Quantity > 0 and ≤ 50,000

4. **Execute:**
   - Deduct resources from player
   - Add credits to player
   - Record transaction in market history
   - Update supply modifier

**Example Sell:**
```
Player wants to sell 12,000 Food
Current price: 28 cr/unit
Reserve requirement: 480 × 0.10 = 48 food
Player has: 13,000 food → Can sell: 12,952 food (respects reserve)

Bulk discount: floor(12000 / 10000) × 0.01 = 0.01 (1%)
Research bonus: 0.02 (has Commerce Tier 2)
Total discount: 0.03 (3%)

Subtotal: 28 × 12,000 = 336,000 credits
Fee: 336,000 × 0.05 × 0.97 = 16,296 credits
Total: 336,000 - 16,296 = 319,704 credits

Player receives: 319,704 Credits
Player loses: 12,000 Food
```

### 3.5 Market History & Transparency

**Public Information (visible to all players):**
- Current prices for all resources
- Price history (last 20 turns) as line graph
- Active market events and remaining duration
- Total market volume (last 5 turns)

**Private Information (visible only to Merchant archetype or allies):**
- Next turn price predictions (±10% accuracy)
- Large buy/sell orders (> 10,000 units) from bots
- Upcoming market events (50% chance to detect 2 turns early)

**Merchant Passive Ability:**
```
Market Insight: Sees next turn prices

Implementation:
predicted_price = next_turn_price + random(-10%, +10%)

Display in UI:
"Ore: 55 cr/unit → ~58 cr/unit (next turn)"
                    ↑ green arrow, predicts increase
```

---

## 4. Bot Integration

### 4.1 Archetype Behavior

| Archetype | Trading Priority | Buy Focus | Sell Focus | Strategy |
|-----------|----------------|-----------|------------|----------|
| **Warlord** | Low (0.3) | Ore, Petroleum | Food | Buys war materials when planning attacks |
| **Diplomat** | Medium (0.5) | Food | Ore, Petroleum | Maintains balanced economy |
| **Merchant** | Very High (0.95) | Underpriced resources | Overpriced resources | Profits from market swings |
| **Schemer** | Medium (0.5) | All resources | None (hoards) | Buys low, manipulates prices |
| **Turtle** | Low (0.4) | Food, Ore (defense) | Petroleum | Defensive stockpiling |
| **Blitzkrieg** | Medium (0.6) | Ore (early game) | Food (late game) | Aggressive early spending |
| **Tech Rush** | Low (0.3) | Food | Ore, Petroleum | Focuses credits on research |
| **Opportunist** | Medium (0.5) | War materials | Surplus after conquests | Trades spoils of war |

### 4.2 Bot Decision Logic

**Merchant Archetype (most sophisticated):**

```
EACH TURN:
  1. CHECK PRICE PREDICTIONS (Market Insight passive)
     - If Ore predicted to rise > 10%: Buy 5,000-15,000 Ore
     - If Food predicted to fall > 10%: Sell 3,000-10,000 Food

  2. EVALUATE ARBITRAGE OPPORTUNITIES
     - If (sell_price - buy_price) / buy_price > 0.15:
         Execute buy-hold-sell cycle

  3. DIVERSIFY HOLDINGS
     - Maintain 30% Credits, 25% Food, 25% Ore, 20% Petroleum
     - Rebalance if any resource > 40% of total value

  4. BULK TRADING
     - Trade in 10,000+ unit batches for discount
     - Avoid small trades (inefficient fees)

  5. MANIPULATE PRICES (late game, if dominant)
     - Dump 30,000 Food to crash prices
     - Buy back at -30% discount
     - Profit margin: 20-40%
```

**Warlord Archetype:**

```
WHEN PLANNING ATTACK (2-3 turns before):
  1. BUY ORE
     - Quantity: attack_force_size × 5
     - Max price: 75 cr/unit (baseline + 50%)
     - Timing: 2 turns before attack

  2. BUY PETROLEUM
     - Quantity: attack_force_size × 2
     - Max price: 120 cr/unit
     - Only if distance requires fuel

  3. SELL FOOD
     - Quantity: surplus above 2-turn reserve
     - Min price: 25 cr/unit (baseline - 17%)
     - Use proceeds to fund war
```

**Turtle Archetype:**

```
DEFENSIVE STOCKPILING:
  1. BUY FOOD (always)
     - Target: 20-turn reserve
     - Max price: 35 cr/unit

  2. BUY ORE (if threatened)
     - Trigger: enemy forces on border
     - Quantity: defensive_force_size × 3
     - Max price: 60 cr/unit

  3. SELL PETROLEUM (rarely)
     - Only if > 10,000 surplus
     - Min price: 90 cr/unit (above baseline)
```

### 4.3 Bot Messages

**Merchant Bot (trading activity):**

```
"I've been watching the ore market closely. Prices are about to surge -
 I'd stock up if I were you, {player_name}."

"Just sold 15,000 food at peak prices. The market always rewards patience."

"The petroleum glut won't last forever. Smart empires are buying now."

"To {target}: I notice you're buying ore aggressively. Planning something?"
```

**Warlord Bot (pre-attack buying):**

```
"My war machine demands ore. Sellers, name your price."

"Fuel reserves are critical for the upcoming campaign. Petroleum traders,
 I'm buying in bulk."

"Food is a luxury I cannot afford. All surplus going to the market."
```

**Diplomat Bot (balanced trading):**

```
"A stable market benefits all empires. I propose we coordinate trades
 to prevent price crashes."

"I'm willing to sell food at fair prices to coalition allies.
 Let's support each other economically."

"To {player_name}: I see you're struggling with ore shortages.
 I can offer 5,000 units at a discount."
```

**Schemer Bot (market manipulation):**

```
"Between you and me, {player_name}, ore prices are about to crash.
 Sell now before you lose everything."
 [Lying - actually planning to buy at crashed prices]

"I'm dumping my petroleum reserves. The market is oversaturated."
 [Creating panic to crash prices, then buy low]

"Fair warning: I've heard rumors of an ore shortage. Might want to buy now."
 [Already hoarded ore, wants to drive prices up]
```

---

## 5. UI/UX Design

### 5.1 UI Mockups

**Market Dashboard:**

```
┌─────────────────────────────────────────────────────────────┐
│  GALACTIC MARKET                        Turn 45  [Refresh]  │
├─────────────────────────────────────────────────────────────┤
│  Resource Prices                                            │
│                                                              │
│  FOOD       30 cr/unit  [▼ -5%]   [BUY]  [SELL]            │
│  ┌────────────────────────────────────┐                     │
│  │ 35 │                      ░░░░     │ Last 20 turns       │
│  │ 30 │══════░░░░░░░░░░══════░░░░     │                     │
│  │ 25 │      ░░░░░░░░░░░░            │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  ORE        58 cr/unit  [▲ +16%]  [BUY]  [SELL]            │
│  ┌────────────────────────────────────┐                     │
│  │ 70 │                          ████ │ Last 20 turns       │
│  │ 50 │══════════════════════════████ │                     │
│  │ 30 │                              │                     │
│  └────────────────────────────────────┘                     │
│  ⚠️ ORE SHORTAGE ACTIVE (15 turns remaining)                │
│                                                              │
│  PETROLEUM  85 cr/unit  [▲ +6%]   [BUY]  [SELL]            │
│  ┌────────────────────────────────────┐                     │
│  │ 120│                           ██  │ Last 20 turns       │
│  │ 80 │═══════════════════════════██  │                     │
│  │ 40 │                              │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  Market Events:                                             │
│  🔴 Ore Shortage: +25% to ore prices (15 turns left)        │
│                                                              │
│  Your Holdings:                                             │
│  Credits: 125,000  │  Food: 3,200  │  Ore: 5,800           │
│  Petroleum: 1,400                                           │
└─────────────────────────────────────────────────────────────┘
```

**Buy/Sell Modal:**

```
┌─────────────────────────────────────────┐
│  BUY ORE                    [✕ Close]   │
├─────────────────────────────────────────┤
│  Current Price: 58 cr/unit              │
│                                         │
│  Quantity: [_______] units              │
│            ▼ Slider (0 - 50,000) ▼      │
│                                         │
│  Subtotal:        0 credits             │
│  Transaction Fee: 0 credits (2%)        │
│  Bulk Discount:   0 credits (-0%)       │
│  Research Bonus:  0 credits (-2%) ✓     │
│  ─────────────────────────────           │
│  TOTAL COST:      0 credits             │
│                                         │
│  Your Credits: 125,000                  │
│  After Purchase: 125,000                │
│                                         │
│  [CANCEL]              [CONFIRM BUY]    │
└─────────────────────────────────────────┘

DYNAMIC UPDATE (when quantity = 15,000):
  Subtotal:        870,000 credits
  Transaction Fee:  16,926 credits (2% - 3% discount)
  Bulk Discount:    -8,700 credits (-1%)
  Research Bonus:  -17,400 credits (-2%)
  ─────────────────────────────
  TOTAL COST:      860,826 credits

  Your Credits: 125,000
  After Purchase: [!] INSUFFICIENT CREDITS

  [CANCEL]              [CONFIRM BUY] (disabled)
```

**Merchant Insight UI (Passive Ability):**

```
┌─────────────────────────────────────────┐
│  MARKET INSIGHT (Merchant Passive)      │
├─────────────────────────────────────────┤
│  Next Turn Predictions:                 │
│                                         │
│  FOOD   30 → ~28 cr/unit  [▼ -7%]      │
│         Prediction: Slight decrease     │
│         Confidence: High (95%)          │
│                                         │
│  ORE    58 → ~62 cr/unit  [▲ +7%]      │
│         Prediction: Continued surge     │
│         Confidence: Medium (80%)        │
│         💡 ORE SHORTAGE event ongoing   │
│                                         │
│  PETROLEUM 85 → ~83 cr/unit [▼ -2%]    │
│         Prediction: Slight correction   │
│         Confidence: Low (70%)           │
│                                         │
│  Detected Activity:                     │
│  🔍 Large ore buy order detected        │
│     (Warlord empire, ~12,000 units)     │
│                                         │
│  📊 Recommendation: SELL FOOD NOW       │
│     Price peak detected. Sell before    │
│     predicted drop.                     │
└─────────────────────────────────────────┘
```

### 5.2 User Flows

**Selling Resources:**

1. Player clicks "SELL" button next to ORE
2. Modal opens: "SELL ORE"
3. Player enters quantity: 8,000 units
4. System calculates:
   - Checks reserve requirement (has enough)
   - Subtotal: 8,000 × 58 = 464,000 credits
   - Fee: 464,000 × 0.05 × 0.97 = 22,504 credits
   - Total revenue: 441,496 credits
5. Player sees preview: "You will receive 441,496 credits"
6. Player confirms
7. System executes:
   - Deducts 8,000 ore from player storage
   - Adds 441,496 credits to player balance
   - Records transaction in market history
   - Updates supply modifier (price will decrease slightly next turn)
8. Success notification: "Sold 8,000 Ore for 441,496 Credits"
9. Modal closes, dashboard updates

**Buying with Insufficient Credits:**

1. Player clicks "BUY" next to PETROLEUM
2. Modal opens: "BUY PETROLEUM"
3. Player enters quantity: 20,000 units
4. System calculates: Total cost = 1,712,400 credits
5. Player has: 125,000 credits
6. Error displayed: "INSUFFICIENT CREDITS"
7. "CONFIRM BUY" button disabled (red, grayed out)
8. Player reduces quantity to 1,000 units
9. Total cost updates: 85,340 credits
10. "CONFIRM BUY" button enabled
11. Player confirms, transaction succeeds

### 5.3 Visual Design Principles

**Color Coding:**
- **Green**: Price increasing, profitable sell opportunity
- **Red**: Price decreasing, discounted buy opportunity
- **Yellow**: Market events active, caution advised
- **Blue**: Merchant Insight predictions
- **Purple**: Bulk discounts, bonuses

**LCARS-Inspired Styling:**
- Clean, futuristic market dashboard
- Line graphs with smooth animations
- High-contrast price displays (large, readable)
- Rounded panel corners
- Minimalist transaction modals

**Responsive Behavior:**
- Mobile: Vertical layout, swipe between resources
- Desktop: Side-by-side comparison of all resources
- Real-time price updates (every 30 seconds if market is active)

**Notifications:**
- "Ore prices surging! (+16%)" - prompt to sell
- "Food shortage ending in 3 turns" - warning
- "Market manipulation detected" - anti-cheat alert

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

### REQ-MKT-001: Resource Trading

**Description:** Players can buy and sell resources (Food, Ore, Petroleum) on the galactic market at fluctuating prices. All transactions are immediate and final.

**Rationale:** Enables economic strategy and resource conversion. Players can sell surplus production for credits and buy deficits to support expansion.

**Source:** Section 1.1, 3.3, 3.4

**Code:**
- `src/lib/market/market-service.ts` - `buyResource()`, `sellResource()`
- `src/app/actions/market-actions.ts` - `buyAction()`, `sellAction()`

**Tests:**
- `src/lib/market/__tests__/market-service.test.ts` - Buy/sell transaction tests

**Status:** Draft

---

### REQ-MKT-002: Dynamic Pricing (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-MKT-002-A through REQ-MKT-002-E for individual price modifiers.

**Overview:** Market prices fluctuate based on supply, demand, market events, and leader penalty. Prices update each turn with decay toward baseline.

**Formula:**
```
Price = Base Price × Supply Modifier × Demand Modifier × Event Modifier × Leader Penalty
```

---

### REQ-MKT-002-A: Base Price and Bounds

**Description:** Base Price defines starting prices for each resource with floor and ceiling bounds. Price Floor is 50% of base, Price Ceiling is 200% of base. These bounds prevent extreme price distortions.

**Rationale:** Establishes price stability and prevents market manipulation through artificial scarcity or oversupply.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Food Base Price | TBD |
| Ore Base Price | TBD |
| Petroleum Base Price | TBD |
| Price Floor | 50% of base price |
| Price Ceiling | 200% of base price |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `BASE_PRICES`, `clampPrice()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Base price, floor/ceiling enforcement

**Status:** Draft

---

### REQ-MKT-002-B: Supply Modifier

**Description:** Supply Modifier adjusts price downward based on net sell volume. Formula: `1.0 - (Net Sell Volume / 100,000) × 0.5`. Market depth of 100,000 units dampens extreme swings.

**Rationale:** High supply (heavy selling) reduces prices. Creates incentive to sell during low supply periods.

**Formula:**
```
Supply Modifier = 1.0 - (Net Sell Volume / 100,000) × 0.5
```

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Market Depth | 100,000 units |
| Supply Impact Factor | 0.5 |
| Direction | Reduces price |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `calculateSupplyModifier()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Supply modifier calculation, extreme volumes

**Status:** Draft

---

### REQ-MKT-002-C: Demand Modifier

**Description:** Demand Modifier adjusts price upward based on net buy volume. Formula: `1.0 + (Net Buy Volume / 100,000) × 0.5`. Market depth of 100,000 units dampens extreme swings.

**Rationale:** High demand (heavy buying) increases prices. Creates incentive to buy during low demand periods.

**Formula:**
```
Demand Modifier = 1.0 + (Net Buy Volume / 100,000) × 0.5
```

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Market Depth | 100,000 units |
| Demand Impact Factor | 0.5 |
| Direction | Increases price |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `calculateDemandModifier()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Demand modifier calculation, extreme volumes

**Status:** Draft

---

### REQ-MKT-002-D: Event Modifier

**Description:** Event Modifier adjusts price based on active market events (Bumper Harvest, Famine, Ore Shortage, Mining Boom, etc.). Each event applies a percentage modifier to specific resources.

**Rationale:** Creates dynamic market conditions driven by galactic events. Rewards players who time trades around event cycles.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Event Types | 8 market events |
| Modifier Range | -15% to +20% |
| Default (No Event) | 1.0 (no change) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1, 3.2

**Code:**
- `src/lib/market/pricing.ts` - `calculateEventModifier()`
- `src/lib/market/events.ts` - Event definitions

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Event modifier application, multiple events

**Status:** Draft

**Cross-Reference:** REQ-MKT-005 (Market Events)

---

### REQ-MKT-002-E: Leader Penalty and Price Decay

**Description:** Leader Penalty applies +10% price increase for empire with highest VP (anti-snowball mechanic). Price Decay applies 5% decay per turn toward baseline to prevent permanent inflation/deflation.

**Rationale:** Leader penalty slows economic advantage of leading empire. Price decay ensures temporary market events don't cause permanent distortions.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Leader Penalty | +10% price increase |
| Decay Rate | 5% per turn toward baseline |
| Baseline Target | Base Price × 1.0 |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `calculateLeaderPenalty()`, `applyPriceDecay()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Leader penalty, decay convergence

**Status:** Draft

**Cross-Reference:** REQ-VIC-008 (Anti-Snowball Mechanics)

---

### REQ-MKT-003: Transaction Fees (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-MKT-003-A through REQ-MKT-003-D below.

**Overview:** Market transactions incur fees to prevent arbitrage and manipulation, with discounts available through volume and research.

**Fee Components:**
- Buy Fee: 2% with 100 cr floor [REQ-MKT-003-A]
- Sell Fee: 5% with 250 cr floor [REQ-MKT-003-B]
- Bulk Discount: -1% per 10k units (max -3%) [REQ-MKT-003-C]
- Research Bonus: -2% with Commerce Tier 2 [REQ-MKT-003-D]

**Total Discount Cap:** 5% across all bonuses

---

### REQ-MKT-003-A: Buy Transaction Fee

**Description:** All market buy orders incur a 2% transaction fee based on the subtotal (price × quantity), with a minimum fee of 100 credits.

**Fee Rules:**
- Base rate: 2% of subtotal
- Minimum fee: 100 credits (enforced even if 2% < 100 cr)
- Applies before discounts are calculated
- Formula: `max(100, subtotal × 0.02 × (1 - total_discount))`

**Rationale:** Base transaction cost prevents zero-risk arbitrage. Low percentage encourages market use while minimum prevents trivial-cost spam trades.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3 - Transaction Fees, Buy Fee

**Code:** TBD - `src/lib/market/fees.ts` - Buy fee calculation

**Tests:** TBD - Verify 2% calculation and 100 cr minimum floor

**Status:** Draft

---

### REQ-MKT-003-B: Sell Transaction Fee

**Description:** All market sell orders incur a 5% transaction fee based on the subtotal (price × quantity), with a minimum fee of 250 credits.

**Fee Rules:**
- Base rate: 5% of subtotal (2.5× higher than buy fee)
- Minimum fee: 250 credits (enforced even if 5% < 250 cr)
- Applies before discounts are calculated
- Formula: `max(250, subtotal × 0.05 × (1 - total_discount))`

**Rationale:** Higher sell fees discourage rapid buy-resell arbitrage cycles and market manipulation. Creates natural friction for speculation.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.3 - Transaction Fees, Sell Fee

**Code:** TBD - `src/lib/market/fees.ts` - Sell fee calculation

**Tests:** TBD - Verify 5% calculation and 250 cr minimum floor

**Status:** Draft

---

### REQ-MKT-003-C: Bulk Transaction Discount

**Description:** Large-volume transactions receive automatic fee discounts based on order size, reducing transaction costs by 1% per 10,000 units traded (capped at -3%).

**Discount Rules:**
- Threshold: 10,000 units per -1% discount
- Scaling: Linear (20k units = -2%, 30k+ units = -3%)
- Maximum discount: -3% (reached at 30,000+ units)
- Applies to both buy and sell fees
- Stacks with research bonuses (up to 5% total max)

**Examples:**
- 5,000 units: 0% discount
- 15,000 units: -1% discount
- 25,000 units: -2% discount
- 40,000 units: -3% discount (capped)

**Rationale:** Rewards strategic large trades and encourages bulk transactions over many small orders. Creates meaningful decision point for trade timing.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.3 - Bulk Discount

**Code:** TBD - `src/lib/market/fees.ts` - Bulk discount calculation

**Tests:** TBD - Verify discount scaling and -3% cap

**Status:** Draft

---

### REQ-MKT-003-D: Commerce Research Fee Reduction

**Description:** Players who have researched Commerce Tier 2 receive a -2% reduction on all transaction fees, stacking with bulk discounts up to a combined 5% maximum discount.

**Research Bonus Rules:**
- Requirement: Commerce Tier 2 research completed
- Discount: -2% on all buy and sell fees
- Stacking: Combines with bulk discount (REQ-MKT-003-C)
- Total cap: 5% maximum discount across all sources
- Permanent: Applies to all transactions once researched

**Examples:**
- Commerce T2 only: -2% discount
- Commerce T2 + 10k units: -3% discount (-2% + -1%)
- Commerce T2 + 30k+ units: -5% discount (-2% + -3%, capped)

**Rationale:** Research investment provides ongoing economic advantage. Commerce specialization creates meaningful strategic choice between military/tech/economic paths.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.4 - Research Bonus

**Code:** TBD - `src/lib/market/fees.ts` - Research bonus check

**Tests:** TBD - Verify research requirement and stacking logic

**Status:** Draft

---

### REQ-MKT-004: Market Limits

**Description:** Enforce transaction and reserve limits:
- **Max Transaction**: 50,000 units per turn per resource
- **Reserve Requirement**: Cannot sell below 10% of sector production capacity
- **Price Clamping**: Prices clamped to [50%, 200%] of base price

**Rationale:** Prevents market manipulation through massive single transactions. Reserve requirement ensures players don't sell critical stockpiles. Price clamping prevents extreme inflation/deflation.

**Formula:**
```
Reserve = sector_production × 0.10
Max Sellable = current_storage - reserve
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Max Transaction | 50,000 units | Per resource per turn |
| Reserve % | 10% | Of sector production |
| Price Floor | 50% | Of base price |
| Price Ceiling | 200% | Of base price |

**Source:** Section 2.4, 3.4

**Code:**
- `src/lib/market/limits.ts` - `validateTransaction()`, `calculateReserve()`

**Tests:**
- `src/lib/market/__tests__/limits.test.ts` - Limit validation tests

**Status:** Draft

---

### REQ-MKT-005: Market Events (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-MKT-005-01 through REQ-MKT-005-09 for individual event definitions.

**Overview:** Random market events create dramatic price swings and strategic opportunities. Each event triggers independently with specific probabilities, durations, and impacts on resource prices or transaction fees.

---

### REQ-MKT-005-01: Bumper Harvest Event

**Description:** Bumper Harvest event triggers with 3% chance per turn, lasts 10 turns, and reduces Food price by 15%.

**Rationale:** Creates favorable food market conditions. Rewards players who sell food during normal times and buy during harvest events.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 3% per turn |
| Duration | 10 turns |
| Impact | Food price -15% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerBumperHarvest()`, `applyBumperHarvestModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Bumper Harvest trigger and effects

**Status:** Draft

---

### REQ-MKT-005-02: Famine Event

**Description:** Famine event triggers with 2% chance per turn, lasts 12 turns, and increases Food price by 30%.

**Rationale:** Creates food scarcity pressure. Players with food stockpiles or agricultural sectors gain advantage.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 2% per turn |
| Duration | 12 turns |
| Impact | Food price +30% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerFamine()`, `applyFamineModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Famine trigger and effects

**Status:** Draft

---

### REQ-MKT-005-03: Ore Shortage Event

**Description:** Ore Shortage event triggers with 4% chance per turn, lasts 15 turns, and increases Ore price by 25%.

**Rationale:** Creates scarcity for military production. Players with ore stockpiles or mining sectors gain advantage.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 4% per turn |
| Duration | 15 turns |
| Impact | Ore price +25% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerOreShortage()`, `applyOreShortageModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Ore Shortage trigger and effects

**Status:** Draft

---

### REQ-MKT-005-04: Mining Boom Event

**Description:** Mining Boom event triggers with 3% chance per turn, lasts 8 turns, and reduces Ore price by 20%.

**Rationale:** Creates favorable ore market conditions. Rewards players who buy ore during boom and sell during normal times.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 3% per turn |
| Duration | 8 turns |
| Impact | Ore price -20% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerMiningBoom()`, `applyMiningBoomModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Mining Boom trigger and effects

**Status:** Draft

---

### REQ-MKT-005-05: Fuel Crisis Event

**Description:** Fuel Crisis event triggers with 2% chance per turn, lasts 8 turns, and increases Petroleum price by 40%.

**Rationale:** Creates severe fuel scarcity. Highest price impact of any event. Players with petroleum sectors gain significant advantage.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 2% per turn |
| Duration | 8 turns |
| Impact | Petroleum price +40% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerFuelCrisis()`, `applyFuelCrisisModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Fuel Crisis trigger and effects

**Status:** Draft

---

### REQ-MKT-005-06: Refinery Glut Event

**Description:** Refinery Glut event triggers with 3% chance per turn, lasts 10 turns, and reduces Petroleum price by 25%.

**Rationale:** Creates favorable petroleum market conditions. Rewards players who stockpile fuel during gluts for future use.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 3% per turn |
| Duration | 10 turns |
| Impact | Petroleum price -25% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerRefineryGlut()`, `applyRefineryGlutModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Refinery Glut trigger and effects

**Status:** Draft

---

### REQ-MKT-005-07: Trade War Event

**Description:** Trade War event triggers with 1% chance per turn, lasts 20 turns, and increases all transaction fees by 3%.

**Rationale:** Creates market friction. Discourages frequent trading. Players must balance need for resources against higher costs.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 1% per turn |
| Duration | 20 turns |
| Impact | All fees +3% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerTradeWar()`, `applyTradeWarModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Trade War trigger and effects

**Status:** Draft

---

### REQ-MKT-005-08: Free Trade Event

**Description:** Free Trade event triggers with 2% chance per turn, lasts 15 turns, and reduces all transaction fees by 2%.

**Rationale:** Creates favorable trading conditions. Encourages market activity and resource redistribution.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger Chance | 2% per turn |
| Duration | 15 turns |
| Impact | All fees -2% |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `triggerFreeTrade()`, `applyFreeTradeModifier()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Free Trade trigger and effects

**Status:** Draft

---

### REQ-MKT-005-09: Event Exclusion Rules

**Description:** Market event exclusion rules: Only 1 event active per resource type at a time. Trade War and Free Trade cannot overlap. Events do not trigger in first 10 turns (tutorial period).

**Rationale:** Prevents multiple simultaneous events from creating unbalanced market conditions. Tutorial grace period ensures new players learn basic mechanics before events introduce volatility.

**Key Values:**
| Rule | Details |
|------|---------|
| Resource Exclusivity | Max 1 Food event, 1 Ore event, 1 Petroleum event active |
| Fee Event Mutual Exclusion | Trade War and Free Trade cannot both be active |
| Tutorial Grace Period | No events before turn 10 |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.2

**Code:**
- `src/lib/market/events.ts` - `canTriggerEvent()`, `getActiveEventsByType()`

**Tests:**
- `src/lib/market/__tests__/events.test.ts` - Event exclusion logic

**Status:** Draft

---

### REQ-MKT-006: Anti-Snowball Leader Penalty

**Description:** Empires with 7+ Victory Points pay 20% more when buying resources (1.2× multiplier to buy price). Sell prices unaffected.

**Rationale:** Integrates with global anti-snowball mechanics. Dominant empires face economic headwinds, giving trailing empires catch-up opportunities.

**Formula:**
```
Buy Price = Base Price × (Modifiers) × (1.2 if VP >= 7 else 1.0)
```

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| VP Threshold | 7 points | Triggers penalty |
| Penalty | +20% | Buy prices only |

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `applyLeaderPenalty()`
- `src/lib/game/victory-points.ts` - VP tracking

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Leader penalty tests

**Status:** Draft

---

### REQ-MKT-007: Merchant Market Insight

**Description:** Merchant archetype (and their coalition allies) see next turn price predictions with ±10% accuracy, large bot orders (>10k units), and upcoming market events (50% chance, 2 turns early).

**Rationale:** Makes Merchant archetype viable. Rewards economic specialization with information advantage.

**Formula:**
```
Predicted Price = Next Turn Price + random(-10%, +10%)
```

**Key Values:**
| Feature | Value | Notes |
|---------|-------|-------|
| Prediction Accuracy | ±10% | Random variance |
| Large Order Threshold | 10,000 units | Bot trades |
| Event Detection Chance | 50% | 2 turns early |

**Source:** Section 3.5, 4.1, 5.1

**Code:**
- `src/lib/market/insights.ts` - `predictNextPrice()`, `detectBotOrders()`
- `src/lib/bots/archetypes/merchant.ts` - Passive ability

**Tests:**
- `src/lib/market/__tests__/insights.test.ts` - Prediction accuracy tests

**Status:** Draft

---

### REQ-MKT-008: Bot Archetype Trading (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-MKT-008-A through REQ-MKT-008-D for individual archetype trading behaviors.

**Overview:** Each bot archetype has distinct trading behavior that creates realistic market activity and strategic opportunities. All bots respect transaction limits and fees like players.

---

### REQ-MKT-008-A: Merchant Trading Behavior

**Description:** Merchant archetype has 0.95 trading priority (highest among archetypes) with arbitrage focus. Actively buys low and sells high, leveraging Market Insight passive to predict price movements. Generates consistent market volume.

**Rationale:** Creates liquidity and price stabilization in the market. Merchant trading behavior demonstrates economic mastery and provides learning example for players.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trading Priority | 0.95 (highest) |
| Focus | Arbitrage (buy low, sell high) |
| Strategy | Price prediction + bulk trading |
| Passive Ability | Market Insight (price predictions) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1, 4.2

**Code:**
- `src/lib/bots/market-behavior.ts` - `botTradingDecision()`
- `src/lib/bots/archetypes/merchant.ts` - Merchant trading logic

**Tests:**
- `src/lib/bots/__tests__/market-behavior.test.ts` - Merchant trading patterns, arbitrage behavior

**Status:** Draft

**Cross-Reference:** REQ-BOT-002-03 (Merchant Archetype), REQ-MKT-007 (Merchant Market Insight)

---

### REQ-MKT-008-B: Warlord Trading Behavior

**Description:** Warlord archetype buys Ore and Petroleum 2 turns before planned attacks to stockpile military resources. Predictable buying pattern creates market signals about upcoming military action. Sells Food and non-military resources to fund purchases.

**Rationale:** Creates telegraphed market signals that skilled players can read to anticipate Warlord attacks. Military preparation drives strategic resource trading.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Buy Trigger | 2 turns before attack |
| Resources Bought | Ore, Petroleum |
| Purpose | Military stockpiling |
| Market Signal | Predictable pattern |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1, 4.2

**Code:**
- `src/lib/bots/market-behavior.ts` - `botTradingDecision()`
- `src/lib/bots/archetypes/warlord.ts` - Warlord trading logic, attack preparation

**Tests:**
- `src/lib/bots/__tests__/market-behavior.test.ts` - Warlord pre-attack buying, resource prioritization

**Status:** Draft

**Cross-Reference:** REQ-BOT-002-01 (Warlord Archetype)

---

### REQ-MKT-008-C: Turtle Trading Behavior

**Description:** Turtle archetype maintains 20-turn food reserve at all times, buying Food proactively to maintain buffer. Conservative trading focused on defensive sustainability. Rarely sells Food. Prioritizes stability over profit.

**Rationale:** Creates consistent Food demand in market. Demonstrates defensive economic strategy and resource management.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Food Reserve | 20 turns of consumption |
| Trading Style | Conservative, defensive |
| Priority | Sustainability over profit |
| Buy Trigger | Reserve drops below threshold |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1, 4.2

**Code:**
- `src/lib/bots/market-behavior.ts` - `botTradingDecision()`
- `src/lib/bots/archetypes/turtle.ts` - Turtle trading logic, reserve calculation

**Tests:**
- `src/lib/bots/__tests__/market-behavior.test.ts` - Turtle reserve maintenance, Food buying patterns

**Status:** Draft

**Cross-Reference:** REQ-BOT-002-05 (Turtle Archetype)

---

### REQ-MKT-008-D: Schemer Trading Behavior

**Description:** Schemer archetype hoards resources and manipulates prices through strategic bulk trades. Accumulates large stockpiles then floods or starves market to create price swings. Opportunistic behavior that disrupts market equilibrium.

**Rationale:** Creates unpredictable market chaos and price manipulation. Provides adversarial trading behavior for players to counter.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Strategy | Hoarding + manipulation |
| Behavior | Bulk dumps/buys for price swings |
| Trading Style | Opportunistic, disruptive |
| Goal | Profit from artificial scarcity |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 4.1, 4.2

**Code:**
- `src/lib/bots/market-behavior.ts` - `botTradingDecision()`
- `src/lib/bots/archetypes/schemer.ts` - Schemer manipulation logic

**Tests:**
- `src/lib/bots/__tests__/market-behavior.test.ts` - Schemer hoarding, price manipulation

**Status:** Draft

**Cross-Reference:** REQ-BOT-002-04 (Schemer Archetype)

---

### REQ-MKT-009: Market History & Transparency

**Description:** Public information visible to all:
- Current prices (all resources)
- Price history (last 20 turns, line graph)
- Active market events
- Total market volume (last 5 turns)

Private information (Merchant only):
- Next turn price predictions
- Large bot orders
- Upcoming event detection

**Rationale:** Informed decision-making requires historical data. Merchant passive provides information edge without full transparency.

**Source:** Section 3.5

**Code:**
- `src/lib/market/history.ts` - `getMarketHistory()`, `recordTransaction()`

**Tests:**
- `src/lib/market/__tests__/history.test.ts` - History tracking tests

**Status:** Draft

---

### REQ-MKT-010: Base Resource Prices

**Description:** Baseline resource prices before modifiers:
- Food: 30 cr/unit (low volatility ±20%)
- Ore: 50 cr/unit (medium volatility ±35%)
- Petroleum: 80 cr/unit (high volatility ±50%)

**Rationale:** Reflects resource importance and scarcity. Food is abundant (always needed, stable). Ore is war-dependent (moderate swings). Petroleum is luxury/strategic (extreme volatility).

**Key Values:**
| Resource | Base Price | Volatility | Max Swing |
|----------|-----------|------------|-----------|
| Food | 30 cr/unit | Low | ±6 cr (20%) |
| Ore | 50 cr/unit | Medium | ±17.5 cr (35%) |
| Petroleum | 80 cr/unit | High | ±40 cr (50%) |

**Source:** Section 2.1

**Code:**
- `src/lib/market/constants.ts` - BASE_PRICES, VOLATILITY_LIMITS

**Tests:**
- `src/lib/market/__tests__/constants.test.ts` - Constant validation

**Status:** Draft

---

### REQ-MKT-011: Commerce Research Integration

**Description:** Commerce Tier 2 research unlocks -2% transaction fee discount (stacks with bulk discount, max 5% total discount).

**Rationale:** Rewards investment in Commerce research tree. Makes trading more profitable for dedicated economic players.

**Formula:**
```
Research Discount = has_commerce_tier2 ? 0.02 : 0.0
Total Discount = min(bulk_discount + research_discount, 0.05)
```

**Source:** Section 2.3, 3.3, 3.4

**Code:**
- `src/lib/market/fees.ts` - `calculateFee()` (checks research status)
- `src/lib/research/commerce-tree.ts` - Tier 2 unlock

**Tests:**
- `src/lib/market/__tests__/fees.test.ts` - Research bonus tests

**Status:** Draft

---

### REQ-MKT-012: Market UI Real-Time Updates

**Description:** Market dashboard updates prices every 30 seconds when market is active (any transaction in last 60 seconds). Line graphs animate price changes smoothly. Buy/Sell modals calculate totals dynamically as quantity changes.

**Rationale:** Provides responsive, real-time trading experience. Players see immediate feedback on price impacts.

**Key Values:**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Update Interval | 30 seconds | When market active |
| Activity Timeout | 60 seconds | Last transaction |
| Animation Duration | 500ms | Smooth transitions |

**Source:** Section 5.1, 5.2, 5.3

**Code:**
- `src/app/market/MarketDashboard.tsx` - Real-time updates
- `src/app/market/BuySellModal.tsx` - Dynamic calculation

**Tests:**
- `src/app/market/__tests__/MarketDashboard.test.tsx` - UI update tests

**Status:** Draft

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-MKT-001 | Resource Trading | Draft | `market-service.test.ts` |
| REQ-MKT-002 | Dynamic Pricing | Draft | `pricing.test.ts` |
| REQ-MKT-003 | Transaction Fees | Draft | `fees.test.ts` |
| REQ-MKT-004 | Market Limits | Draft | `limits.test.ts` |
| REQ-MKT-005 | Market Events | Draft | `events.test.ts` |
| REQ-MKT-006 | Anti-Snowball Leader Penalty | Draft | `pricing.test.ts` |
| REQ-MKT-007 | Merchant Market Insight | Draft | `insights.test.ts` |
| REQ-MKT-008 | Bot Archetype Trading | Draft | `market-behavior.test.ts` |
| REQ-MKT-009 | Market History & Transparency | Draft | `history.test.ts` |
| REQ-MKT-010 | Base Resource Prices | Draft | `constants.test.ts` |
| REQ-MKT-011 | Commerce Research Integration | Draft | `fees.test.ts` |
| REQ-MKT-012 | Market UI Real-Time Updates | Draft | `MarketDashboard.test.tsx` |

**Total Specifications:** 12
**Implemented:** 0
**Validated:** 0
**Draft:** 12

---

## 7. Implementation Requirements

### 7.1 Database Schema

```sql
-- Table: market_prices
-- Purpose: Store current and historical market prices

CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  resource_type VARCHAR(20) NOT NULL, -- 'food', 'ore', 'petroleum'
  base_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  supply_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  demand_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  event_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_market_prices_game_turn ON market_prices(game_id, turn_number);
CREATE INDEX idx_market_prices_resource ON market_prices(game_id, resource_type, turn_number DESC);

-- Table: market_transactions
-- Purpose: Record all buy/sell transactions for history and analysis

CREATE TABLE market_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  transaction_type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  resource_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  bulk_discount DECIMAL(5,4) DEFAULT 0.0,
  research_discount DECIMAL(5,4) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_game_turn ON market_transactions(game_id, turn_number DESC);
CREATE INDEX idx_transactions_empire ON market_transactions(empire_id, turn_number DESC);
CREATE INDEX idx_transactions_resource ON market_transactions(game_id, resource_type, turn_number DESC);

-- Table: market_events
-- Purpose: Track active and historical market events

CREATE TABLE market_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'bumper_harvest', 'ore_shortage', etc.
  resource_type VARCHAR(20), -- NULL for global events like 'trade_war'
  start_turn INTEGER NOT NULL,
  end_turn INTEGER NOT NULL,
  impact DECIMAL(5,4) NOT NULL, -- Modifier value (e.g., 1.25 for +25%)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_market_events_active ON market_events(game_id, is_active, end_turn);
CREATE INDEX idx_market_events_resource ON market_events(game_id, resource_type, is_active);
```

### 7.2 Service Architecture

```typescript
// src/lib/market/market-service.ts

export interface MarketConfig {
  basePrices: Record<ResourceType, number>;
  marketDepth: number;
  decayRate: number;
  priceFloor: number;
  priceCeiling: number;
}

export class MarketService {
  /**
   * Buy resources from the market
   * @spec REQ-MKT-001, REQ-MKT-003, REQ-MKT-004
   */
  async buyResource(
    gameId: string,
    empireId: string,
    resourceType: ResourceType,
    quantity: number
  ): Promise<BuyResult> {
    // 1. Validate transaction (limits, credits available)
    // 2. Get current price with leader penalty
    // 3. Calculate fees and discounts
    // 4. Execute transaction (deduct credits, add resources)
    // 5. Record transaction in history
    // 6. Update demand modifier
    // 7. Return result
  }

  /**
   * Sell resources to the market
   * @spec REQ-MKT-001, REQ-MKT-003, REQ-MKT-004
   */
  async sellResource(
    gameId: string,
    empireId: string,
    resourceType: ResourceType,
    quantity: number
  ): Promise<SellResult> {
    // 1. Validate transaction (reserve requirement, has resources)
    // 2. Get current price
    // 3. Calculate fees and discounts
    // 4. Execute transaction (deduct resources, add credits)
    // 5. Record transaction in history
    // 6. Update supply modifier
    // 7. Return result
  }

  /**
   * Update market prices for a new turn
   * @spec REQ-MKT-002, REQ-MKT-005, REQ-MKT-006
   */
  async updatePrices(gameId: string, turnNumber: number): Promise<void> {
    // 1. Calculate net volume (last 5 turns)
    // 2. Update supply/demand modifiers
    // 3. Apply decay (5% toward baseline)
    // 4. Check for market events
    // 5. Apply leader penalty to empires with 7+ VP
    // 6. Clamp prices to [floor, ceiling]
    // 7. Save updated prices
  }

  /**
   * Get current market prices for all resources
   * @spec REQ-MKT-009
   */
  async getCurrentPrices(gameId: string): Promise<MarketPrices> {
    // Return current prices for food, ore, petroleum
  }

  /**
   * Get price history for charting
   * @spec REQ-MKT-009
   */
  async getPriceHistory(
    gameId: string,
    resourceType: ResourceType,
    turns: number = 20
  ): Promise<PriceHistory[]> {
    // Return last N turns of prices
  }
}
```

### 7.3 Server Actions

```typescript
// src/app/actions/market-actions.ts

"use server";

/**
 * Buy resources from the market
 * @spec REQ-MKT-001
 */
export async function buyMarketResource(
  formData: FormData
): Promise<ActionResult> {
  const gameId = formData.get("gameId") as string;
  const empireId = formData.get("empireId") as string;
  const resourceType = formData.get("resourceType") as ResourceType;
  const quantity = parseInt(formData.get("quantity") as string);

  try {
    const marketService = new MarketService();
    const result = await marketService.buyResource(
      gameId,
      empireId,
      resourceType,
      quantity
    );

    return {
      success: true,
      message: `Bought ${quantity} ${resourceType} for ${result.totalCost} credits`,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Sell resources to the market
 * @spec REQ-MKT-001
 */
export async function sellMarketResource(
  formData: FormData
): Promise<ActionResult> {
  const gameId = formData.get("gameId") as string;
  const empireId = formData.get("empireId") as string;
  const resourceType = formData.get("resourceType") as ResourceType;
  const quantity = parseInt(formData.get("quantity") as string);

  try {
    const marketService = new MarketService();
    const result = await marketService.sellResource(
      gameId,
      empireId,
      resourceType,
      quantity
    );

    return {
      success: true,
      message: `Sold ${quantity} ${resourceType} for ${result.totalRevenue} credits`,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}
```

### 7.4 UI Components

```typescript
// src/app/market/MarketDashboard.tsx

interface MarketDashboardProps {
  gameId: string;
  empireId: string;
}

export function MarketDashboard({ gameId, empireId }: MarketDashboardProps) {
  const [prices, setPrices] = useState<MarketPrices | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);

  // Real-time price updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const newPrices = await fetchCurrentPrices(gameId);
      setPrices(newPrices);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameId]);

  return (
    <div className="market-dashboard">
      <h1>Galactic Market</h1>

      {/* Price cards for each resource */}
      <ResourcePriceCard resource="food" price={prices.food} history={history} />
      <ResourcePriceCard resource="ore" price={prices.ore} history={history} />
      <ResourcePriceCard resource="petroleum" price={prices.petroleum} history={history} />

      {/* Active market events */}
      <MarketEvents events={events} />

      {/* Player holdings */}
      <PlayerHoldings empireId={empireId} />
    </div>
  );
}

// src/app/market/BuySellModal.tsx

interface BuySellModalProps {
  type: "buy" | "sell";
  resource: ResourceType;
  currentPrice: number;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

export function BuySellModal({
  type,
  resource,
  currentPrice,
  onClose,
  onConfirm
}: BuySellModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [calculation, setCalculation] = useState<TransactionCalculation | null>(null);

  // Dynamic calculation as quantity changes
  useEffect(() => {
    if (quantity > 0) {
      const calc = calculateTransaction(type, resource, currentPrice, quantity);
      setCalculation(calc);
    }
  }, [quantity, type, resource, currentPrice]);

  return (
    <Modal onClose={onClose}>
      <h2>{type === "buy" ? "BUY" : "SELL"} {resource.toUpperCase()}</h2>

      <div>Current Price: {currentPrice} cr/unit</div>

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
        min={0}
        max={50000}
      />

      {calculation && (
        <TransactionSummary calculation={calculation} />
      )}

      <button onClick={onClose}>CANCEL</button>
      <button
        onClick={() => onConfirm(quantity)}
        disabled={!calculation?.valid}
      >
        CONFIRM {type.toUpperCase()}
      </button>
    </Modal>
  );
}
```

---

## 8. Balance Targets

### 8.1 Quantitative Targets

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| Average price swing | ±15% per turn | ±5% | Track price changes in 1000-game simulation |
| Merchant win rate (Economic victory) | 18-22% | ±3% | 100 games with Merchant archetype |
| Market transaction frequency | 15-25 trades/turn | ±5 | Average across all empires |
| Price decay to baseline | 5 turns | ±2 turns | Time for 90% reversion |
| Event frequency | 1 active event per 10 turns | ±0.3 | Simulation average |
| Bot trading volume | 40-60% of total | ±10% | Bot vs player transaction ratio |

### 8.2 Simulation Requirements

**Monte Carlo Simulation: 10,000 iterations**

**Variables:**
- 100 empires per game
- 200 turns per game
- Random bot archetype distribution
- Random market events
- Controlled player strategy (Merchant focus)

**Success Criteria:**
- Merchant archetype achieves 18-22% Economic victory rate
- No resource experiences >80% price swing in single turn
- Price floor/ceiling never violated
- Bot trading generates realistic supply/demand curves
- Anti-snowball leader penalty demonstrably slows dominant empires

### 8.3 Playtest Checklist

**Scenario 1: Basic Trading**
- [ ] Player can buy 1,000 Food at current price
- [ ] Transaction fee calculated correctly (2% buy fee)
- [ ] Player balance updates immediately
- [ ] Transaction appears in market history

**Scenario 2: Price Fluctuation**
- [ ] Selling 10,000 Ore decreases price next turn
- [ ] Buying 10,000 Petroleum increases price next turn
- [ ] Prices decay 5% toward baseline each turn
- [ ] Prices never exceed floor/ceiling limits

**Scenario 3: Market Events**
- [ ] "Ore Shortage" event triggers randomly
- [ ] Ore prices increase by +25% during event
- [ ] Event lasts 15 turns, then ends
- [ ] Merchant bots react by selling ore reserves

**Scenario 4: Merchant Archetype**
- [ ] Merchant sees next turn price predictions
- [ ] Predictions within ±10% accuracy
- [ ] Merchant detects large bot orders (>10k units)
- [ ] Merchant passive provides economic advantage

**Scenario 5: Reserve Requirement**
- [ ] Player with 3 Food sectors (480 food/turn) cannot sell below 48 food
- [ ] Attempting to violate reserve shows error
- [ ] Reserve recalculates when sectors change

**Scenario 6: Anti-Snowball**
- [ ] Empire with 7 VP pays +20% on buy orders
- [ ] Sell orders unaffected by leader penalty
- [ ] Penalty applies immediately when 7th VP earned
- [ ] Penalty removed if VP drops below 7

**Scenario 7: Bulk Discount**
- [ ] Buying 15,000 units grants -1% fee discount
- [ ] Buying 25,000 units grants -2% fee discount
- [ ] Buying 30,000+ units grants -3% fee discount (max)
- [ ] Discount stacks with Commerce Tier 2 research

**Scenario 8: Bot Trading**
- [ ] Warlord bot buys Ore 2 turns before attack
- [ ] Merchant bot executes arbitrage trades
- [ ] Turtle bot maintains 20-turn food reserve
- [ ] Schemer bot attempts price manipulation

**Scenario 9: UI Responsiveness**
- [ ] Market dashboard updates prices in real-time
- [ ] Line graphs animate smoothly on price changes
- [ ] Buy/Sell modal calculates totals dynamically
- [ ] Insufficient credits shows error immediately

**Scenario 10: Edge Cases**
- [ ] Buying with exactly enough credits succeeds
- [ ] Buying with 1 credit too few fails gracefully
- [ ] Selling 50,000 units (max) succeeds
- [ ] Selling 50,001 units fails with error
- [ ] Price at floor (50% base) cannot decrease further
- [ ] Price at ceiling (200% base) cannot increase further

---

## 9. Migration Plan

### 9.1 From Current State

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| Stub document (13 lines, 1 spec) | Full market system design | Create complete document with 12 specs |
| No market mechanics | Buy/sell with dynamic pricing | Implement pricing formulas and transaction logic |
| No bot trading | 8 archetype behaviors | Implement bot trading decision trees |
| No UI | Market dashboard + modals | Build React components |
| No database schema | 3 tables (prices, transactions, events) | Create migrations |

### 9.2 Data Migration

**Initial Setup:**

```sql
-- Migration: Create market system tables
-- Safe to run: YES (new tables, no data loss)

-- Create market_prices table
CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  resource_type VARCHAR(20) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  supply_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  demand_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  event_modifier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_market_prices_game_turn ON market_prices(game_id, turn_number);
CREATE INDEX idx_market_prices_resource ON market_prices(game_id, resource_type, turn_number DESC);

-- Initialize baseline prices for existing games
INSERT INTO market_prices (game_id, turn_number, resource_type, base_price, current_price)
SELECT
  id AS game_id,
  current_turn AS turn_number,
  unnest(ARRAY['food', 'ore', 'petroleum']) AS resource_type,
  unnest(ARRAY[30, 50, 80]) AS base_price,
  unnest(ARRAY[30, 50, 80]) AS current_price
FROM games
WHERE status = 'active';
```

**Resource Storage (existing empires table):**

```sql
-- Migration: Add resource storage columns to empires table
-- Safe to run: YES (adds columns with defaults)

ALTER TABLE empires
  ADD COLUMN food_storage INTEGER DEFAULT 0,
  ADD COLUMN ore_storage INTEGER DEFAULT 0,
  ADD COLUMN petroleum_storage INTEGER DEFAULT 0;

-- Initialize storage from sector production (estimate 10 turns worth)
UPDATE empires SET
  food_storage = (SELECT COUNT(*) * 160 * 10 FROM sectors WHERE empire_id = empires.id AND type = 'food'),
  ore_storage = (SELECT COUNT(*) * 112 * 10 FROM sectors WHERE empire_id = empires.id AND type = 'ore'),
  petroleum_storage = (SELECT COUNT(*) * 92 * 10 FROM sectors WHERE empire_id = empires.id AND type = 'petroleum');
```

### 9.3 Rollback Plan

If market system causes issues:

1. **Disable market UI**: Hide market dashboard from player interface
2. **Disable bot trading**: Set all bot trading priorities to 0
3. **Freeze prices**: Lock prices at baseline (no fluctuations)
4. **Preserve data**: Keep market_transactions table for analysis

**Rollback SQL:**

```sql
-- Disable market events
UPDATE market_events SET is_active = FALSE WHERE is_active = TRUE;

-- Reset prices to baseline
UPDATE market_prices SET
  current_price = base_price,
  supply_modifier = 1.0,
  demand_modifier = 1.0,
  event_modifier = 1.0;

-- Prevent new transactions (application-level flag)
-- Set MARKET_ENABLED = false in environment config
```

**Re-enable:**
- Set MARKET_ENABLED = true
- Prices resume fluctuating from current values
- Bot trading resumes
- UI becomes visible again

---

## 10. Conclusion

### Key Decisions

**1. Dynamic Pricing with Supply/Demand**
- **Rationale**: Static prices = boring economy. Fluctuating prices create strategic timing decisions and reward market awareness.
- **Trade-off**: Complexity in price calculation vs. economic depth. Accepted complexity for engaging gameplay.

**2. Higher Sell Fees (5%) vs Buy Fees (2%)**
- **Rationale**: Prevents zero-risk arbitrage (buy low, immediately resell high). Makes trading require commitment.
- **Trade-off**: Discourages casual trading, but ensures only strategic trades are profitable.

**3. Merchant Archetype Information Advantage**
- **Rationale**: Makes economic specialization viable. Without Market Insight, Merchant has no clear path to victory.
- **Trade-off**: Information asymmetry can feel unfair, but passive is visible (players know Merchants have advantage).

**4. Reserve Requirement (10% of production)**
- **Rationale**: Prevents players from selling critical stockpiles and crippling their economy.
- **Trade-off**: Slightly reduces player freedom, but protects from self-sabotage.

**5. Market Events for Volatility**
- **Rationale**: Predictable markets become stale. Random events create excitement and force adaptation.
- **Trade-off**: RNG can frustrate players, but events are announced (players can react) and short-duration (8-20 turns).

**6. Anti-Snowball Leader Penalty (+20% buy prices)**
- **Rationale**: Integrates with global anti-snowball mechanics. Dominant empires face economic headwinds.
- **Trade-off**: Can feel punitive, but necessary to prevent runaway leaders from dominating market.

### Open Questions

**1. Should Market Support Player-to-Player Trading?**
- **Context**: Currently only empire-to-market trading. Should players trade directly?
- **Options**:
  - Enable P2P trading with negotiated prices
  - Keep market-only to simplify mechanics
  - Allow gifting but not trading (coalition support)
- **Resolution Needed**: Playtest feedback on whether P2P adds strategic depth or just UI complexity.

**2. Storage Capacity Limits?**
- **Context**: Currently no limit on resource storage. Should there be caps?
- **Options**:
  - Implement storage limits (requires building storage sectors)
  - Keep unlimited storage for simplicity
  - Add storage costs (fee per turn for excess resources)
- **Resolution Needed**: Balance testing to see if hoarding becomes problematic.

**3. Market Manipulation Detection & Penalties?**
- **Context**: Schemer bots intentionally manipulate prices. Should there be anti-cheat?
- **Options**:
  - Automatic penalties for extreme manipulation (>50% price swing caused by single empire)
  - Allow manipulation as intended mechanic
  - Community reputation system (other empires distrust manipulators)
- **Resolution Needed**: Playtest to see if manipulation breaks balance or creates fun cat-and-mouse gameplay.

**4. Futures Contracts / Options Trading?**
- **Context**: Advanced feature: commit to buying/selling at future price.
- **Options**:
  - Implement futures for advanced players
  - Defer to expansion content
  - Skip entirely (too complex for core game)
- **Resolution Needed**: Scope decision for v1.0 vs post-launch.

### Dependencies

**Depends On:**
- **[PRD-EXECUTIVE.md](../PRD-EXECUTIVE.md)** - System overview, victory conditions
- **[RESOURCE-MANAGEMENT-SYSTEM.md](RESOURCE-MANAGEMENT-SYSTEM.md)** - Resource mechanics and production
- **[SECTOR-MANAGEMENT-SYSTEM.md](SECTOR-MANAGEMENT-SYSTEM.md)** - Sector types and production values
- **[BOT-SYSTEM.md](BOT-SYSTEM.md)** - Bot archetypes, decision priorities, Merchant passive
- **Research System** (TBD) - Commerce Tier 2 for -2% fee bonus
- **Victory System** (TBD) - Economic victory condition integration

**Depended By:**
- **Economic Victory Path** - Requires market profitability for victory
- **Bot Trading Behavior** - All archetypes use market to varying degrees
- **Sector Balancing** - Resource production values affect market dynamics
- **Wormhole Construction** - Petroleum prices affect expansion costs

### Implementation Priority

**Critical Path (M12-M14):**
1. Database schema (M12) - market_prices, market_transactions, market_events
2. Pricing service (M12) - Dynamic price calculation, fees, limits
3. Buy/sell actions (M13) - Core trading mechanics
4. Basic UI (M13) - Market dashboard, buy/sell modals

**Enhancement Phase (M14-M15):**
5. Market events (M14) - Random events, price shocks
6. Bot trading (M14) - Archetype-specific behavior
7. Merchant Insight (M15) - Prediction UI, event detection
8. Price history (M15) - Line graphs, analytics

**Polish Phase (M16):**
9. Real-time updates (M16) - WebSocket price streaming
10. Balance tuning (M16) - Adjust volatility, fees, event frequency
11. Anti-manipulation (M16) - Detection and penalties (if needed)
12. Tutorial (M16) - First-time trading walkthrough

---

**END OF MARKET SYSTEM DESIGN DOCUMENT**

*This document replaces the stub at docs/draft/MARKET-SYSTEM.md and provides complete specifications for implementation.*
