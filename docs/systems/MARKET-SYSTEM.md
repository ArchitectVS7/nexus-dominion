# Galactic Market System

> **Status:** Active — Core System
> **Version:** 1.0
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` § Phase 8

---

## 1. Lore Integration & In-World Framing

The **Galactic Market** is the beating heart of Syndicate capitalism. Run by a consortium of automated brokerages and shadowy clearinghouses, it is where Planetary Governors trade their localized surpluses for the galactic necessities of war and expansion.

### The Broker Consortium
The Market isn’t a place; it’s an ever-present hum of sub-space transactions. It operates on brutal efficiency:
- **Food** is the currency of life, relatively stable, primarily traded by Agricultural worlds trying to buy their way into military treaties.
- **Ore** is the currency of war. When a dominant empire starts stockpiling Ore, the entire galaxy knows violence is coming.
- **Petroleum** is the currency of mobility. Highly volatile, it fuels the engines of the largest strike fleets and the construction of interstellar wormholes.

The Mercantile Guilds whisper that true power in Nexus Dominion isn't held by the person with the largest fleet, but by the person who knows when the price of fuel is about to crash.

---

## 2. Core Mechanics

The Galactic Market allows players and bots to instantly buy and sell resources (Food, Ore, Petroleum) for Credits.

### 2.1 Dynamic Pricing

Prices are not static. They are governed by an automated, galaxy-wide algorithmic pricing model responding to supply, demand, and unpredictable cosmic events.

1. **Base Prices:**
   - **Food:** 30 cr/unit (Low Volatility)
   - **Ore:** 50 cr/unit (Medium Volatility)
   - **Petroleum:** 80 cr/unit (High Volatility)

2. **Supply & Demand:**
   - **Selling** resources floods the market, driving the price down.
   - **Buying** resources drains the market, driving the price up.
   - The Market has a "depth" (currently tuned to 100,000 units). Net buy/sell volumes against this depth determine the immediate price modifiers.
   - *Decay:* Market manipulation is temporary. Prices naturally decay 5% per cycle back toward their baseline.

3. **Limits & Guardrails:**
   - **Price Clamping:** An under-the-hood failsafe ensures prices never fall below 50% or exceed 200% of their base.
   - **The Bulk Cap:** No empire may trade more than 50,000 units of a single resource in a single cycle. The Guilds enforce liquidity limits.
   - **The Reserve Mandate:** A Governor cannot sell themselves into starvation. The UI will prevent an empire from selling their stock if it drops them below a 10% reserve of their total sector production capacity.

### 2.2 Transaction Mechanics (The Guild's Cut)

The Market is run for profit. Every transaction incurs friction.

- **Buy Fees:** 2% processing fee (minimum 100 cr).
- **Sell Fees:** 5% processing fee (minimum 250 cr). Selling incurs higher friction to prevent zero-risk day-trading arbitration.

**Mitigating Friction:**
1. **Bulk Trading:** High-volume trades receive discounts. Trading 10,000+ units reduces the fee by 1%, scaling up to a max discount of 3% at 30,000+ units.
2. **Technological Advantage (Commerce Tier 2):** Empires that invest in Commerce Research gain a permanent 2% reduction on all transaction fees, stacking with bulk discounts (to a hard cap of 5% total discount).

---

## 3. Market Events (The Chaos Factor)

The galaxy is unpredictable. Random events can seize control of a commodity's price for several cycles.

- **Bumper Harvest / Famine:** Food supply swings (-15% / +30% price).
- **Mining Boom / Ore Shortage:** Raw material availability shifts (-20% / +25% price).
- **Refinery Glut / Fuel Crisis:** Petroleum reserves fluctuate (-25% / +40% price).
- **Free Trade / Trade War:** Global transaction fees drop (-2%) or spike (+3%).

*Design Rule:* Events do not trigger during the first 10 cycles (the tutorial/stabilization phase), and only one event per resource type can be active at a time.

---

## 4. The Merchant Advantage (Asymmetric Warfare)

While all empires interact with the market, the **Merchant** archetype bends it to their will.

### Market Insight
The true power of the Merchant is foresight. They (and their Coalition Allies) gain access to a private, encrypted data feed.

1. **Price Forecasting:** Merchant UI displays next-cycle price predictions (±10% accuracy). They know when to hold and when to dump.
2. **Whale Tracking:** Merchants receive alerts when massive orders (>10,000 units) are placed by other empires before the price resolves, allowing them to front-run the market.
3. **Event Whispers:** A 50% chance to detect major Market Events (like Famines or Shortages) 2 cycles before they hit the global feed.

### Anti-Snowball Adjustments
The Market hates a monopoly. To curtail runaway leaders, the empire with the highest Victory Point total (provided they have 7+ VP) faces a **"Leader Tax"**, paying an invisible 20% premium on all resource purchases.

---

## 5. Bot Integration & Ecosystem

The AI in Nexus Dominion treats the Market as a core battlefield, adhering strictly to Archetypal logic.

- **The Turtle:** Defensive stockpiling. Buys Food aggressively to maintain a 20-cycle reserve. Never sells.
- **The Warlord:** Telegraphed aggression. 2 cycles before launching an assault, the Warlord dumps Food to aggressively buy Ore and Petroleum. Astute players can read Ore spikes as an impending war.
- **The Schemer:** The manipulator. Hoards resources, artificially constricts supply, and then dumps massive volumes to crash prices and profit off the arbitrage.
- **The Merchant:** High-frequency trader. Driven by their unique Market Insight, they execute continuous buy-low/sell-high arbitrages, single-handedly maintaining market liquidity while skimming the margins.

---

## 6. UI/UX Targets

*Ref: `FRONTEND-DESIGN.md`*

- **The View:** The Market is an overlay panel sliding up from the bottom of the Star Map hub.
- **The Data:** Each commodity features a 20-cycle line graph (Sparkline) detailing price history.
- **The Interaction:** A unified, horizontal "Card + Details" layout (No-Scroll mandatory). Selecting 'Ore' locks the commodity, populating the right-hand panel with a dynamic slider to set unit quantities, instantly reacting with subtotal, fee, discount, and final cost breakdowns.

---

## 7. Open Questions & Future Tuning

- **Volatility Bounds:** Are the base volatilities (Food 20%, Ore 35%, Petroleum 50%) providing enough excitement without breaking late-game economies?
- **The Merchant Problem:** Does the Merchant generate too much passive income via arbitrage? May need to cap bot-arbitrage cycles to 1 per 3 turns if they accelerate too fast.
- **The Reserve Mandate:** Should the 10% reserve block be a hard enforcement, or a soft warning that players can override at their own peril?
