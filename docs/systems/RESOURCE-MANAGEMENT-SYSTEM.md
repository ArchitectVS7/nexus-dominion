# Galactic Resource Economy

> **Status:** Active — Core System
> **Version:** 2.0
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` § Phase 2, Phase 6

---

## 1. Lore Integration & In-World Framing

To rule the galaxy in Nexus Dominion, one must first feed it, fuel it, and arm it. The Syndicate economy is ruthless: there is no universal safety net, and planets that fail to produce are quickly abandoned to starvation or conquest.

Governors must manage five crucial pillars of power, each representing a vital component of a star-faring empire:
1. **Credits** (Commerce/Urban): The universal lubricant. Necessary for purchasing bulk resources, enacting espionage, and keeping the gears turning.
2. **Food** (Agriculture): The lifeblood of expansion. Without it, populations wither. With abundance, they breed and colonize.
3. **Ore** (Mining): The bones of the war machine. Consumed constantly to repair hulls, forge munitions, and maintain a standing armada.
4. **Petroleum** (Refinery): The fire of the void. Essential for hyper-light transit, fleet maneuvers, and the massive energy spikes required for Wormhole construction.
5. **Research Points** (Academia): The promise of tomorrow. Expensive, slow, but the only path to the technological supremacy of the ancients.

A master of the Nexus Dominion understands that resources are not merely collected; they are burned in the fires of ambition.

---

## 2. Core Mechanics

The Resource Management system operates on a rigorous **Production-Consumption cycle** evaluated at the conclusion of every player Cycle.

### 2.1 The Production Engine

At the start of every Cycle, every sector an empire controls yields its specific resource.

*Base Yields per Sector:*
- **Food:** +160 units
- **Ore:** +112 units
- **Petroleum:** +92 units
- **Commerce:** +8,000 Credits
- **Urban:** +1,000 Credits (and provides +10,000 Population Capacity)
- **Research:** +100 Research Points
- **Education:** +1 Civil Status point
- **Government:** +300 Spy Points (Used exclusively in Covert Ops)

### 2.2 The Civil Status Multiplier (Morale as Output)

Production isn't just about factories; it's about the people working them. An empire's **Civil Status** applies a massive, empire-wide multiplier to all core resource production (Food, Ore, Petroleum, Credits, Research).

- **Ecstatic:** 2.5x
- **Happy:** 1.5x
- **Content:** 1.0x (Baseline)
- **Unhappy:** 0.75x
- **Angry:** 0.5x
- **Rioting:** 0.25x

*Design Rule:* True economic supremacy (and the Trade Prince achievement path) is virtually impossible without achieving and maintaining **Ecstatic** status.

---

## 3. The Consumption Engine & Consequences

Resources in Nexus Dominion have unlimited storage—there are no arbitrary caps. However, stockpiling is a trap; the game demands consumption. "Consequences over Limits" is the driving philosophy.

### 3.1 Population & Food (The Growth Engine)

**Consumption:** Every citizen requires **0.5 Food per Cycle**. An empire with 10,000 citizens burns 5,000 Food a Cycle.

- **The Surplus (+):** If Food demand is met, the population grows implicitly by **+2% per Cycle** (capped). The larger your population, the greater your capacity for massive tax yields (Credits) later in the game.
- **The Deficit (Starvation):** If Food reserves hit zero, the consequences are immediate and brutal. Population plummets by **-10% per Cycle**, and the empire takes a massive -30 hit to their Civil Status score, almost guaranteeing a slide into Unrest or Rioting.

### 3.2 The Military Burden (Ore & Petroleum)

A standing fleet is a massive economic drain.

- **Ore Maintenance:** Every combat unit drains Ore equal to **5% of its total build cost** every Cycle, representing repairs, ammunition, and parts.
- **Petroleum Fuel:** Every combat unit burns Petroleum equal to **3% of its total build cost** every Cycle to maintain readiness.

*Consequences of Deficit:*
- **Zero Ore:** Fleets are crippled. They cannot initiate attacks and suffer massive defensive penalties.
- **Zero Petroleum:** Fleets crawl. Movement speed is cut by 50%, and empires cannot initiate the construction of new Wormholes.

---

## 4. Sector Management & Flexibility

The galaxy maps are dynamic. Strategic pivots are required as the game progresses from early survival to late-game specialized victory pushes.

### 4.1 Repurposing Infrastructure

Governors can **Convert** existing sectors to new types (e.g., razing Food sectors to build Commerce Hubs).
- **Cost:** Repurposing costs **50% of the target sector's base build cost** (representing the savings of existing infrastructure).
- **Timing:** Conversions happen instantly on the Cycle they are ordered.
- **The Urban Exception:** Urban sectors (Housing) cannot be converted to other types, nor can other sectors be converted to Urban. Population housing must be built from scratch, and destroying homes is politically untenable.

### 4.2 Overcrowding

Populations grow naturally (up to 2% per Cycle). Every **Urban Sector** provides housing for 10,000 citizens.
If an empire's population exceeds its total Urban capacity, they trigger the **Overcrowding Penalty**, suffering a flat -20 to their Civil Status score.

---

## 5. The Bot Economy

AI opponents interact with the economy governed strictly by their Archetypes. Players must learn to read their opponents' economic footprints.

- **The Warlord:** Disdains Commerce. Will deliberately starve their population (accepting Unhappy status) to maximize Ore and Petroleum output for massive, unsustainable fleet pushes.
- **The Merchant:** High risk, high reward. Spams Commerce and Education sectors to rush Ecstatic status. Produces very little raw materials, relying entirely on the Galactic Market to buy Food and Ore using their massive credit reserves.
- **The Tech Rush:** Sacrifices early expansion to build notoriously expensive Research Sectors (23,000 cr each). Highly vulnerable before Cycle 50, terrifying after Cycle 100.

---

## 6. The Trade Prince Path (Economic Supremacy)

Nexus Dominion offers paths to galactic domination through relentless capitalism rather than conquest.

**Networth Calculation:**
An empire's true power is tracked via a 'Networth' score, calculating liquid Credits, the market value of stockpiled resources, the total build-value of all sectors and military units, and a premium on accumulated Research Points.

**The Achievement Trigger:**
If an empire's Networth exceeds its nearest rival by a sustained, overwhelming margin, it crosses the threshold to earn the **Trade Prince** achievement. However, as they approach this massive economic lead, the Nexus generates a **Convergence Alert**, warning the galaxy of the encroaching monopoly and prompting rival cartels or massive covert sabotage efforts.

---

## 7. UI/UX Targets

*Ref: `FRONTEND-DESIGN.md`*

- **The Top Bar:** A persistent, LCARS-styled header tracking the five core resources.
- **Net Income Visibility:** The UI must aggressively highlight *Net Income* per Cycle (Production minus Consumption). Deficits must be clearly marked with an orange/red warning pulse.
- **Sector Management:** Clicking the Top Bar opens a No-Scroll horizontal modal. Players see an aggregate summary of their total sector counts and can issue bulk "+1 Build" or "Convert" orders directly from this screen. Tooltips must explicitly forecast the exact Cycles remaining until a resource deficit triggers severe penalties.
