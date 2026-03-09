# Star System Management

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 2 (Galaxy and Sector System), § Requirements 3 (Empire Management)
> **Supersedes:** `docs/other/Game Systems/SECTOR-MANAGEMENT-SYSTEM.md`

---

## Document Purpose

This document defines the complete design of Star System management: how Star Systems are characterised at galaxy generation, how empires develop them through Installations, how expansion costs scale, how Sector Dominance creates economic effects, and how loss and transfer work.

**Intended readers:**
- Game designers making decisions about economic balance, development depth, and expansion strategy
- Developers implementing Star System generation, Installation queues, and production calculation
- Anyone resolving a design question about how an empire's economy is structured or how expansion decisions work

**Design philosophy:**
- **The map is the strategy.** Star Systems are pre-existing locations with intrinsic character — not blank purchase slots. Expansion decisions are about *which* systems to pursue, not just *how many*.
- **Development unlocks potential.** A Star System's Biome sets its ceiling; Installations reach toward it. A Mineral World with no Mining Complexes is wasted potential. A Barren World with three Trade Hubs is a deliberate choice.
- **Expansion has compounding cost.** Each system acquired makes the next one more expensive. There is no hard limit on empire size, but the economic pressure creates natural saturation points that emerge from the game rather than being imposed on it.
- **No micromanagement.** Installations produce automatically each Cycle. Players make decisions about what to build and where — not about optimising moment-to-moment production rates.
- **Quality over quantity.** A Nexus-Adjacent system is worth more than three Barren Worlds. The galaxy's varied terrain means empires of different sizes can be economically competitive through smart development.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [Star System Biome Types](#3-star-system-biome-types)
4. [Installations](#4-installations)
5. [Installation Slots and Development Limits](#5-installation-slots-and-development-limits)
6. [The Home Star System](#6-the-home-star-system)
7. [Star System Acquisition and Expansion](#7-star-system-acquisition-and-expansion)
8. [Sector Dominance and Economic Effects](#8-sector-dominance-and-economic-effects)
9. [Resource Production, Caps, and Consumption](#9-resource-production-caps-and-consumption)
10. [Star System Loss and Transfer](#10-star-system-loss-and-transfer)
11. [Bot Economic Priorities](#11-bot-economic-priorities)
12. [UI and Player Experience](#12-ui-and-player-experience)
13. [Balance Targets](#13-balance-targets)
14. [Open Questions](#14-open-questions)
15. [Revision History](#15-revision-history)

---

## 1. In-World Framing

### 1.1 The Productive Galaxy

Star Systems are not merely territory — they are the economic foundation of every empire in the galaxy. Each system is a complex of planets, moons, asteroid fields, and spatial anomalies that an empire can exploit, develop, and defend. The Nexus's ancient energy field permeates every system in the galaxy to varying degrees, and that energy affects what each system is capable of producing.

When an empire acquires a Star System, they are not planting a flag on empty space. They are inheriting a location with its own geological and cosmological history — an existing character that shapes what is possible there. A system of dense mineral-rich asteroid fields lends itself to ore extraction. A system anchored by a warm, life-bearing world has agricultural potential. A system lying in the path of concentrated Nexus currents offers research advantages unavailable anywhere else.

### 1.2 In-World Terminology Reference

| In-World Term | Plain Meaning |
|--------------|---------------|
| Biome | A Star System's intrinsic character, determined at galaxy generation |
| Installation | A production facility built on a Star System |
| Development Slot | A Star System's capacity for Installations (determined by Biome) |
| Frontier Development | The process of terraforming and colonising undeveloped planets within a system |
| Fuel Cells | The energy resource used to sustain military operations (replaces "Petroleum") |
| Imperial Yield | Total resource production across all Star Systems per Cycle |
| Sector Dominance | Controlling 13 or more of the 25 Star Systems within a geographic Sector |
| Dominance Dividend | The economic bonus applied to systems within a Sector where an empire holds Dominance |

---

## 2. Core Concept

### 2.1 The Hybrid Model — Biome and Installation

Star System production follows a **hybrid model** inspired by Settlers of Catan: the map is pre-built with varied terrain, and players develop that terrain through construction.

**Every Star System in the galaxy is generated with:**
- A **Biome Type** — its intrinsic character (Mineral World, Verdant World, Core World, etc.)
- A **Development Slot count** — how many Installations it can hold (determined by Biome)
- An **intrinsic base production** — a small baseline yield that exists regardless of Installations
- A **planet development status** — whether undeveloped planets within the system are ready to colonise, or require terraforming tech to unlock

**Players develop Star Systems by constructing Installations** — specialised facilities that generate resources each Cycle. A Mining Complex built on a Mineral World produces more ore than the same complex on a Barren World. A Research Station on a Nexus-Adjacent system produces more research points than one built anywhere else.

This means expansion decisions have two dimensions:
1. **Which system to acquire** — based on its Biome, slot count, and strategic position
2. **What to build there** — based on current economic priorities and achievement paths

### 2.2 The Catan Comparison

Like Catan tiles, Star Systems are placed at galaxy generation with varied resource potential. Unlike Catan, the map is much larger (250 systems across 10 geographic Sectors), players can build multiple types of Installations on a single system, and some tiles require prior investment (tech unlock) before their full potential is accessible.

The analogy holds strategically: players will race for prime-value systems, negotiate over border systems, and face the choice between settling near productive systems and settling near strategic ones.

### 2.3 What Players Decide

Players do not decide the character of a Star System — they decide:
- **Which systems to expand into** (border system prerequisite applies — see §7)
- **What Installations to construct** (within the system's slot count and Biome bonus)
- **When to invest in terraforming tech** to unlock undeveloped planets within systems
- **Whether to develop for specialisation** (deep investment in one resource type) or **breadth** (diverse production across a Sector)

---

## 3. Star System Biome Types

Galaxy generation assigns every Star System a Biome at the start of a new game. Biomes are not equally distributed — the galaxy is varied terrain, and high-value Biomes are rarer.

### 3.1 Biome Table

| Biome | Base Production | Development Slots | Installation Bonus | Rarity | Notes |
|-------|----------------|-------------------|--------------------|--------|-------|
| **Core World** | Credits + Food (moderate) | 5 | Trade Hub: +20%; Population Centre: +15% | Common | Balanced and immediately productive; often starting-system candidates |
| **Mineral World** | Ore (low base) | 4 | Mining Complex: +40%; Fuel Extraction: +20% | Common | Ideal for military-focused empires |
| **Verdant World** | Food (moderate base) | 4 | Agricultural Station: +35%; Cultural Institute: +15% | Common | High food output; valued by high-population empires |
| **Void Station** | Credits (low base) | 3 | Trade Hub: +25%; Intelligence Nexus: +30% | Uncommon | Pre-existing artificial structure — no planet development possible, but high efficiency |
| **Barren World** | None | 3 | All Installations at base efficiency | Common | Cheap to acquire; no bonus; high slot count relative to value |
| **Contested Ruin** | Credits + Ore (low base) | 4 | Variable — partially destroyed infrastructure | Uncommon | Cheaper acquisition cost; some Installation slots start pre-built (damaged, requires repair investment) |
| **Frontier World** | None (undeveloped) | 2 base + 3 locked | Unlocked slots: Biome-dependent (revealed on terraforming) | Uncommon | Requires Terraforming tech to unlock hidden slots; high ceiling, high investment |
| **Nexus-Adjacent** | Research points (low base) | 3 | Research Station: +50%; all others at −10% (Nexus interference) | Rare | The most research-productive systems in the galaxy; strategically contested |
| **Resource-Rich Anomaly** | Ore + Fuel Cells (moderate base) | 3 | Mining Complex: +30%; Fuel Extraction: +45% | Rare | High intrinsic yield even without Installations; immediately valuable |

### 3.2 Frontier World Terraforming

Frontier Worlds begin with 2 Development Slots active and 3 locked. Unlocking locked slots requires:
1. Researching the Terraforming doctrine (Research System — see that system's document)
2. Spending credits and a queue period on a per-slot basis (each slot requires separate investment)

**What unlocks reveal:** When a locked slot is opened through terraforming, its Biome affinity for Installations is revealed — it was hidden until investment. This creates genuine discovery: a Frontier World might unlock as a de facto Mineral World, or as something else entirely. The risk and reward are intentional.

**Design intent:** Terraforming provides a mid-to-late-game expansion path for empires that have exhausted nearby prime systems. An empire that invests in Terraforming tech gains access to systems that rivals without that tech cannot fully utilise.

### 3.3 Contested Ruin Pre-Built Slots

Contested Ruins arrive with 1–2 Installation slots already occupied by damaged pre-existing structures. These function as degraded Installations — producing at 50% efficiency until repaired. Repair costs credits and queue time but does not consume a new Installation slot. The type of pre-existing Installation is determined at galaxy generation (visible when the system is acquired).

---

## 4. Installations

Installations are the productive facilities built on Star Systems. They are the primary source of an empire's resource income and strategic capabilities. Every Installation type produces one resource or provides one capability, automatically, at each Cycle Boundary.

### 4.1 Installation Table

| Installation | Resource/Effect | Base Production per Cycle | Slot Cost | In-World Flavour |
|-------------|-----------------|--------------------------|-----------|-----------------|
| **Trade Hub** | Credits | 8,000 cr | 1 slot | Commerce exchange; trading post; financial clearinghouse |
| **Agricultural Station** | Food | 160 food | 1 slot | Hydroponic farms; orbital grow-pods; planetary cultivation |
| **Mining Complex** | Ore | 112 ore | 1 slot | Asteroid mining; deep-core extraction; refinery operations |
| **Fuel Extraction Facility** | Fuel Cells | 92 fuel cells | 1 slot | Gas giant skimming; dark matter collection; plasma refinement |
| **Population Centre** | +1,000 pop capacity + 1,000 cr | 1 slot | Habitat rings; colony stations; urban megastructures |
| **Cultural Institute** | +5 Imperial Stability/Cycle | 1 slot | Academic spires; broadcast centres; community infrastructure |
| **Intelligence Nexus** | +300 intelligence points/Cycle | 1 slot | Signal arrays; agent safe houses; cryptographic facilities |
| **Research Station** | +10 research points/Cycle | 1 slot | Science platforms; Nexus observation posts; experiment arrays |

**Biome efficiency bonuses** (from §3.1) apply multiplicatively to base production. A Mining Complex (base: 112 ore) on a Mineral World (+40%) produces 156 ore per Cycle.

**Production values are tuning targets.** The relative ratios between Installation types matter more than the absolute numbers at this design stage.

### 4.2 Installation Acquisition

Installations are built through the **Build Queue** (see Turn Management System §4.6). Each Installation has:
- A credit cost (paid at queue entry, deducted immediately)
- A build time in Cycles (the queue advances one Cycle per pipeline pass)
- A slot requirement (must have an open Development Slot in the target Star System)

An Installation under construction does not produce until it completes. Partially-built Installations are lost if the Star System is captured before completion (the attacker acquires an empty slot, not a building).

**Installation costs are tuning targets.** Design intent: a player with a healthy starting economy should be able to afford their first Installation within 3–5 Cycles.

### 4.3 Installation Permanence

Installations cannot be sold, converted, or demolished by the owning empire. Once built, an Installation remains in that slot indefinitely. This forces long-horizon thinking — choosing what to build on a system is a commitment, not a reversible decision.

The only way to remove an Installation is through combat damage (see §10).

---

## 5. Installation Slots and Development Limits

### 5.1 Slot Count by Biome

Each Star System has a fixed number of Development Slots, determined at galaxy generation by its Biome Type (see §3.1). Slots cannot be added to a system except through Frontier World terraforming (see §3.2).

**This means empire economic specialisation is constrained by geography.** An empire in a Mineral-World-rich region of the galaxy has a natural military-industrial advantage. An empire surrounded by Core Worlds has balanced options. An empire near Nexus-Adjacent systems has research potential unavailable to others.

### 5.2 Slot Interaction with Expansion Strategy

Because slot counts vary by Biome, empire economic depth is not purely a function of how many systems are held. A 10-system empire concentrated in high-slot, high-efficiency systems may outproduce a 15-system empire holding mostly Barren Worlds.

**Design intent:** This creates a genuine trade-off between:
- **Territorial breadth** (holding many systems for Sector Dominance and strategic positioning)
- **Economic depth** (holding fewer, higher-quality systems and developing them fully)

Both strategies should be viable. Neither should be obviously dominant.

---

## 6. The Home Star System

### 6.1 The Starting Point

Every empire begins with exactly one Star System — their Home System. This is the most developed system in their empire at game start, representing generations of prior civilisation before the campaign begins.

The Home System is always a **Core World** Biome with 5 Development Slots — the maximum for Core Worlds, reflecting its status as the seat of an established empire. It begins the game with Installations already built.

### 6.2 Home System Starting Configuration — Balanced Core

The Home System begins with **3 universal Installations pre-built** and **2 open Development Slots**:

- 1× Trade Hub (8,000 cr/Cycle)
- 1× Agricultural Station (160 food/Cycle)
- 1× Mining Complex (112 ore/Cycle, +20% Core World bonus = 134 ore/Cycle)
- 2× Open Slots (player's first Build Queue decisions)

The 3 pre-built Installations provide a viable minimum economy from Cycle 1 — credits, food, and ore are all covered at baseline. The 2 open slots are the player's first meaningful Build Queue decisions, made immediately at game start: expand military capacity (Fuel Extraction Facility), secure population growth (Population Centre), invest in intelligence (Intelligence Nexus), or push research (Research Station).

**Design intent:** The starting economy is real but incomplete. Every empire begins from the same universal foundation; differentiation emerges from what each player chooses to build in those two open slots and which systems they claim first.

---

## 7. Star System Acquisition and Expansion

### 7.1 Border System Prerequisite

Star Systems are not acquired from a menu — they are claimed through expansion. An empire can only claim a Star System that is **adjacent to a system they already hold** (border expansion) or, with sufficient investment, through Wormhole construction (long-range expansion — see the Military System for fleet movement and the PRD for wormhole mechanics).

This prerequisite creates natural phases of play:
- **Early game**: Consolidate the immediate neighbourhood — claim adjacent unclaimed systems
- **Mid game**: Contest border systems with rival empires; begin to shape Sector-level control
- **Late game**: Invest in wormhole infrastructure to project power across geographic Sectors

### 7.2 Acquisition Methods

| Method | How It Works | Cost | Notes |
|--------|-------------|------|-------|
| **Claim (unclaimed system)** | Declare claim on an adjacent unclaimed system | Credits (scaling) | Immediate; no military required |
| **Conquest (held system)** | Defeat the defending fleet and ground forces | Military resources + losses | Combat System governs the resolution |
| **Negotiated Transfer** | Diplomatic exchange — a system changes hands by treaty | Varies (treaty terms) | Diplomacy System governs; both parties agree |
| **Syndicate Contract** | A Syndicate operation that destabilises a system's allegiance | Syndicate Influence + credits | Rare; contested transfer, not clean acquisition |

### 7.3 Claim Cost Scaling Formula

When claiming an unclaimed Star System, the credit cost scales with the empire's current system count:

```
Claim Cost = Biome Base Cost × (1 + current_system_count × 0.1)^1.5
```

**Biome Base Costs (tuning targets):**

| Biome | Base Claim Cost | Rationale |
|-------|----------------|-----------|
| Core World | 10,000 cr | Immediately productive; high demand |
| Mineral World | 8,000 cr | Productive but specialised |
| Verdant World | 8,000 cr | High food value; broadly useful |
| Void Station | 9,000 cr | Pre-built infrastructure; niche |
| Barren World | 5,000 cr | Low intrinsic value |
| Contested Ruin | 6,000 cr | Partially usable; investment required |
| Frontier World | 7,000 cr | High potential, high investment |
| Nexus-Adjacent | 14,000 cr | Rare; strategically invaluable |
| Resource-Rich Anomaly | 12,000 cr | High immediate yield |

**Example cost curve at 8,000 cr base (Standard Biome):**

| Current Systems Held | Next Claim Cost | Cumulative Cost Trend |
|---------------------|----------------|----------------------|
| 1 (home only) | ~9,000 cr | Early game — accessible |
| 5 | ~13,500 cr | Early expansion |
| 10 | ~19,000 cr | Mid game |
| 20 | ~34,000 cr | Significant investment per system |
| 30 | ~55,000 cr | Saturation pressure |

The scaling formula prevents unchecked economic snowballing without imposing an artificial cap. Empires that reach 25–35 systems face diminishing returns — not because a rule stops them, but because each additional claim costs more than the system's production will recoup in the near term.

### 7.4 Conquest Does Not Pay the Claim Cost

When a Star System is taken by military conquest, no claim cost is paid. The cost of conquest is military — fleet losses, time, and the diplomatic consequences of aggression. Economically, conquest is the most efficient way to expand once the military infrastructure exists to support it. This is intentional: military investment should have an economic payoff.

---

## 8. Sector Dominance and Economic Effects

### 8.1 What Sector Dominance Is

The galaxy's 250 Star Systems are divided into 10 geographic Sectors of 25 systems each (see PRD §2). **Sector Dominance** is achieved when a single empire holds 13 or more of the 25 systems within one geographic Sector.

Sector Dominance is:
- A strategic threshold relevant to certain achievement paths (Conquest, Warlord)
- A prerequisite for certain late-game expansion options (Sector-to-Sector wormhole anchors)
- **An economic bonus — the Dominance Dividend**

### 8.2 The Dominance Dividend

When an empire achieves Sector Dominance, all Installations within that Sector receive a **+10% production bonus** (the Dominance Dividend). This represents the administrative and logistical efficiency of consolidated control — supply chains are shorter, governance overhead is reduced, and the Nexus field within the Sector responds to coherent order.

**The Dominance Dividend is:**
- Applied immediately when the 13th system in a Sector is claimed or conquered
- Removed immediately if control falls below 13 systems in that Sector
- Stackable: an empire that achieves Dominance in multiple Sectors receives the bonus in each independently
- Visible on the star map — systems within a Dominated Sector display a visual indicator

**Design intent**: The Dividend is meaningful but not dominant. 10% production bonus should feel rewarding without making Sector Dominance the mandatory strategy for all archetype paths. A 10-system empire of high-quality systems remains competitive with a 13-system empire receiving the Dividend.

---

## 9. Resource Production, Caps, and Consumption

### 9.1 Resource Types

| Resource | Produced By | Consumed By | Notes |
|----------|------------|------------|-------|
| **Credits** | Trade Hub, Population Centre | Installations, claims, diplomacy, research, Syndicate | No storage cap |
| **Food** | Agricultural Station | Population (per Cycle) | Storage cap applies |
| **Ore** | Mining Complex | Build Queue (military units, structures) | Storage cap applies |
| **Fuel Cells** | Fuel Extraction Facility | Fleet operations, military maintenance | Storage cap applies |
| **Intelligence Points** | Intelligence Nexus | Covert operations, Syndicate investigation | Storage cap applies |
| **Research Points** | Research Station | Research doctrine advancement | Consumed on use; no cap |
| **Imperial Stability** | Cultural Institute (positive input) | Various drains (combat loss, food deficit, covert ops) | 0–100 scale; not stored |

### 9.2 Resource Storage Caps

Storage caps prevent hoarding and create meaningful decisions about when to spend:

| Resource | Cap (tuning target) | Consequence of Hitting Cap |
|----------|--------------------|-----------------------------|
| Food | 10,000 | Surplus wasted — additional Agricultural Stations are inefficient |
| Ore | 5,000 | Surplus wasted — over-investment in Mining punishes over-producers |
| Fuel Cells | 3,000 | Surplus wasted — military operations must pace with production |
| Intelligence Points | 500 | Surplus wasted — incentivises regular covert operations use |

Credits have no cap. Research Points have no cap (they are spent immediately on the active doctrine, with no surplus mechanism by default — see Research System).

### 9.3 Production and Consumption Timing

All resource production occurs during **Tier 1 of the Cycle Pipeline** (Resource Income phase — see Turn Management System §4.1). Consumption occurs in the same pipeline:

- Population food consumption: Population Phase (§4.3)
- Military Fuel Cell maintenance: resolved in the Military System pipeline phase
- Intelligence accumulation: Intelligence Accumulation phase (§4.7)

The Imperial Stability modifier applies to all resource production (see Turn Management System §4.1 for the multiplier table). An empire in Fractured Stability produces 50% of its Installation yield.

---

## 10. Star System Loss and Transfer

### 10.1 Loss Through Combat Defeat

When a Star System is successfully conquered by an attacking empire:
- **The system transfers** to the attacker's control intact — all Installations remain
- **Damaged Installations**: Combat bombardment may damage some Installations prior to transfer (Combat System defines damage probability and scope). Damaged Installations function at 50% until repaired.
- **The former owner loses** the system's production and its contribution to any Sector Dominance threshold

The attacker gains the system's full Development Slot configuration, including any Installations the defender built. This is the economic reward for successful military operations.

### 10.2 Contested Capture — What the Attacker Gets

The attacker receives the Star System as-is, with one exception:

**Research Stations**: Research doctrine progress is empire-level, not system-level. A captured Research Station continues to produce Research Points for the new owner, but the captured empire's accumulated research progress is retained by that empire (it does not transfer). The attacker gains future research output, not historical progress.

### 10.3 Deliberate System Abandonment

An empire facing conquest may choose to abandon a Star System before it is captured — withdrawing their forces and population. An abandoned system:
- Reverts to unclaimed status (it does not automatically transfer to the attacker)
- Has all Installations destroyed (scorched earth — the owner removes productive value before leaving)
- Can be reclaimed by any empire with border access

Strategic abandonment is a valid defensive tactic: denying the attacker the economic value of the system while reducing your own Sector Dominance threshold (which may cost you a Dominance Dividend but prevents the attacker from gaining your full Installation investment).

### 10.4 Minimum Retained System

An empire cannot fall below 1 Star System while still existing as a political entity. At exactly 1 system, the empire is considered critically besieged — they retain their home system status but are Stricken and functionally at maximum vulnerability. If that final system falls, the empire is eliminated.

---

## 11. Bot Economic Priorities

### 11.1 Archetype Installation Priorities

How each archetype approaches Installation construction decisions:

| Archetype | Primary Installation | Secondary | Acquisition Philosophy |
|-----------|--------------------|-----------|-----------------------|
| **Warlord** | Mining Complex | Fuel Extraction | Acquires Mineral Worlds aggressively; ignores Research; accepts economic fragility |
| **Diplomat** | Trade Hub | Cultural Institute + Population Centre | Balanced portfolio; prioritises Imperial Stability; funds alliance obligations |
| **Merchant** | Trade Hub | Trade Hub | Hyper-specialises in credits; will hold 4–6 Trade Hubs; trades for other resources |
| **Schemer** | Intelligence Nexus | Trade Hub | Acquires 2 Intelligence Nexus Installations by mid-game; funds covert capacity |
| **Turtle** | Agricultural Station | Cultural Institute + Population Centre | Self-sufficient economy; high Stability; slow but sustainable |
| **Blitzkrieg** | Mining Complex | Fuel Extraction | Rapid military buildup in early Confluences; relies on conquest to expand after that |
| **Tech Rush** | Research Station | Trade Hub | Prioritises Nexus-Adjacent systems; accepts short-term economic weakness for research advantage |
| **Opportunist** | Variable | Variable | Adapts Installation choices to game state; copies the leading strategy if it's winning |

### 11.2 Bot System Acquisition Priorities

Bots evaluate unclaimed adjacent systems by:
1. **Biome value** relative to archetype (Warlord prefers Mineral Worlds; Tech Rush targets Nexus-Adjacent)
2. **Strategic position** (border system that prevents rival expansion is more valuable than productive interior system)
3. **Sector Dominance progress** (when an empire is at 10+ systems in a Sector, the final 3 systems for Dominance are strongly prioritised)
4. **Cost vs production payback** (bots evaluate how many Cycles until a system pays back its claim cost in production value)

### 11.3 Bot Messages — Economic Events

**System claim announcements:**

> *Warlord claims Mineral World:* "Another mining operation secured. The war machine grows stronger."
>
> *Merchant claims second Trade Hub system:* "Credits flow like rivers through my networks. Care to trade, {player}?"
>
> *Tech Rush claims Nexus-Adjacent system:* "The research potential here is extraordinary. Worth every credit."
>
> *Schemer claims Void Station:* "A quiet outpost. Perfect for... administrative purposes."
>
> *Turtle claims Verdant World:* "Self-sufficiency is survival. My people will not starve."

**Economic strain messages:**

> *Bot unable to afford next expansion:* "My treasury is stretched. Perhaps a trade? Or perhaps a raid..."
>
> *Bot hits Sector Dominance threshold:* "This Sector bends to my administration now. The efficiency improvements alone will fund the next campaign."
>
> *Bot loses a developed system to conquest:* "They've taken my [system name]. Years of development — gone. This will not be forgotten."

---

## 12. UI and Player Experience

### 12.1 Star Map Representation

Star Systems are visualised on the persistent star map. Each system shows:
- **Biome icon** (distinctive visual for each Biome type)
- **Owner indicator** (empire colour; unclaimed systems shown in neutral)
- **Development level indicator** (visual shorthand for how many slots are filled)
- **Sector Dominance indicator** (subtle highlight on all systems within a Dominated Sector)

### 12.2 Star System Panel

Clicking a Star System opens its panel (visible for owned and adjacent systems):

```
┌──────────────────────────────────────────────────────┐
│  KETH PRIME              [Mineral World]              │
│  Owner: Your Empire      Sector: Cygnus Reach         │
├──────────────────────────────────────────────────────┤
│  Development Slots: ████░  (4/5 filled)               │
│                                                       │
│  INSTALLATIONS                                        │
│  [Mining Complex]    156 ore/Cycle  (base +40%)       │
│  [Mining Complex]    156 ore/Cycle  (base +40%)       │
│  [Trade Hub]          8,000 cr/Cycle                  │
│  [Fuel Extraction]    110 fuel cells/Cycle (+20%)     │
│  [OPEN SLOT]          [ + Build Installation ]        │
│                                                       │
│  BIOME EFFICIENCY BONUS                               │
│  Mining Complex +40%  ·  Fuel Extraction +20%         │
│                                                       │
│  CLAIMED: Cycle 12  ·  Dominance Dividend: +10%       │
└──────────────────────────────────────────────────────┘
```

### 12.3 Empire Overview Panel

A higher-level view accessible from the main interface:

```
┌──────────────────────────────────────────────────────────┐
│  IMPERIAL YIELD                           12 Star Systems │
├──────────────────────────────────────────────────────────┤
│  Credits:       42,000 cr/Cycle    (5× Trade Hub, 2× Pop)│
│  Food:             480 food/Cycle  (3× Agricultural)      │
│  Ore:              468 ore/Cycle   (3× Mining, 2× bonus)  │
│  Fuel Cells:       276/Cycle       (3× Fuel Extraction)   │
│  Research Points:   20/Cycle       (2× Research Station)  │
│  Intelligence:     900/Cycle       (3× Intel Nexus)       │
├──────────────────────────────────────────────────────────┤
│  Sector Dominance: Cygnus Reach  ✓  (+10% all yields)    │
│  Next claim cost:  ~24,000 cr                            │
└──────────────────────────────────────────────────────────┘
```

### 12.4 Build Queue UI

When the player opens an Installation slot:
- Available Installation types listed with production output, biome efficiency bonus, build time, and cost
- Slots on Frontier Worlds show locked slots with "Requires Terraforming Doctrine" tooltip
- Currently-building Installations show a Cycle countdown in the slot
- Damaged Installations (from combat) show repair option alongside production at 50%

### 12.5 Expansion Decision UI

When the player considers claiming an unclaimed adjacent system:
- Star System panel shows Biome type, slot count, base production potential, and claim cost
- Efficiency bonuses are previewed (what an Installation would produce *here*)
- Locked Frontier World slots are shown with their unlock requirement
- Current treasury and post-claim balance shown to aid decision-making

---

## 13. Balance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Cycles to first expansion (claim) | 3–5 Cycles | First expansion should feel accessible, not gated |
| Economic saturation point (most empires) | 20–30 systems | Natural plateau where expansion cost exceeds production return |
| Dominance Dividend relative value | +10–15% | Meaningful reward; not so large it makes Dominance mandatory |
| Nexus-Adjacent systems per galaxy | 5–10 of 250 | Rare enough to be contested; not so rare they're never in play |
| Frontier World full development cycle (3 locked slots) | 8–15 Cycles post-terraforming | Significant investment; payoff should be visible |
| Bot economic saturation (Standard-tier) | 15–20 systems | Bots should reach productive equilibrium in mid-game |
| Resource cap hit frequency | <20% of Cycles at peak economy | Caps should constrain over-producers, not punish healthy play |
| Home System production as % of total (Cycle 1) | 100% (only system) | Obvious — but used to calibrate against mid/late splits |
| Home System production as % of total (Cycle 50) | 20–35% | Home System should remain relevant but not dominant |

---

## 14. Open Questions

| # | Question | Context | Options | Status |
|---|----------|---------|---------|--------|
| 14.1 | **Home System starting configuration** | PRD has 1 home Star System per empire. The starting configuration determines the early-game economy and sets the template for all 100 empires at game start. | **Resolved: Option D — Balanced Core.** 3 universal pre-built (Trade Hub, Agricultural Station, Mining Complex) + 2 open slots. See §6.2. | **Closed** |
| 14.2 | **Installation build cost values** | All Installation costs noted as tuning targets. What is the design-level cost hierarchy? (e.g., Research Station should cost how much more than Trade Hub?) | Design intent: Research Station ~2.5× Trade Hub base cost. All others within 1–1.5× of Trade Hub. Exact values via simulation. | Defer to simulation |
| 14.3 | **Contested Ruin repair mechanics** | §3.3 states damaged pre-built Installations repair at a credit + queue time cost. What is the repair cost relative to building fresh? | Recommendation: 40–60% of fresh build cost — meaningful savings, but not trivially cheap. Exact values via simulation. | Defer to simulation |
| 14.4 | **Frontier World locked slot reveal** | §3.2 states locked slots reveal their type on unlock. Should the player see any hint of the hidden type before committing to terraforming, or is it fully opaque? | Recommendation: Partial hint — the system's exploratory scan (from covert ops investment) can reveal one locked slot's type. All three locked slots are opaque without scanning. | Defer to simulation / playtesting |
| 14.5 | **Abandoned system Installation destruction** | §10.3 states abandoned systems have Installations destroyed (scorched earth). Should this be automatic, or should the player have to actively choose to destroy each Installation? | Recommendation: Active choice per Installation — players may abandon the system but leave some Installations standing if time pressure (e.g., fleet already at the gate) doesn't allow full scorched earth. | Design decision — preference? |

---

## 15. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes SECTOR-MANAGEMENT-SYSTEM.md. Renamed all "Sector" (owned territory) references to "Star System" throughout. Replaced "buy a sector type" model with Hybrid Biome + Installation model (Settlers of Catan-inspired). Introduced 9 Biome types with varying Development Slots, base production, and Installation efficiency bonuses. Introduced Frontier World terraforming mechanic. Renamed Petroleum → Fuel Cells. Introduced Sector Dominance Dividend (+10% production within a Dominated Sector). Retained: 8 production type design, cost-scaling formula principle, archetype economic priority matrix, resource storage caps, bot acquisition logic, production timing integration with Cycle pipeline. |
| 1.1 | 2026-03-08 | Design session | Resolved Open Question 14.1: Home System starting configuration selected as Option D — Balanced Core (3 universal pre-built + 2 open slots). §6.2 rewritten to canonical spec; five-option presentation removed. |
