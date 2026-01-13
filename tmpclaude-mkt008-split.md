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
