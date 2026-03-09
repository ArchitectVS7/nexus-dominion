# Military System

> **Status:** Active — Design Reference
> **Version:** 1.2
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 4 (Military System), § Requirements 5 (Combat System), § Requirements 3 (Empire Management)
> **Supersedes:** `docs/other/Game Systems/MILITARY-SYSTEM.md`

---

## Document Purpose

This document defines the complete design of Nexus Dominion's military system: the six unit types, how they are produced, how they are maintained, how fleet composition creates strategic trade-offs, and how military force enables the three modes of territorial warfare. Combat resolution mechanics (how battles are calculated) belong to the Combat System; this document defines what exists and why.

**Intended readers:**
- Game designers making decisions about unit balance, production pacing, and military strategy depth
- Developers implementing unit production, fleet management, and maintenance processing
- Anyone resolving a design question about military build priorities, force structure, or the production pipeline

**Design philosophy:**
- **Variety through commitment.** Six unit types with distinct roles create a production planning problem, not just a spend-credits-get-power problem. The right fleet is different for every archetype and situation.
- **Resource competition.** Military units compete with Star System development for the same credits, ore, and fuel cells. Choosing war means choosing less development.
- **Maintenance as a natural brake.** There are no hard caps on military size. Maintenance costs are the governor. An empire that over-builds will eventually consume its own economy.
- **Composition over mass.** A diverse fleet outperforms a single-type stack in many contexts. The composition bonus rewards strategic thinking, not just accumulation.
- **Combat is a multi-stage process.** Fleet victory is not the end — it opens the path to orbital bombardment and ground invasion. Each stage has its own cost and can be chosen or skipped.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [The Six Unit Types](#3-the-six-unit-types)
4. [The Armament Queue](#4-the-armament-queue)
5. [Force Upkeep and Maintenance](#5-force-upkeep-and-maintenance)
6. [Fleet Composition and Military Power](#6-fleet-composition-and-military-power)
7. [Combat Modes](#7-combat-modes)
8. [Defender Advantage](#8-defender-advantage)
9. [Bot Military Behaviour](#9-bot-military-behaviour)
10. [UI and Player Experience](#10-ui-and-player-experience)
11. [Balance Targets](#11-balance-targets)
12. [Open Questions](#12-open-questions)
13. [Revision History](#13-revision-history)

---

## 1. In-World Framing

### 1.1 Force of Arms in the Galaxy

Every empire in Nexus Dominion maintains a military force — not because the Galactic Commons requires it, but because the galaxy does. Territory is won and held by force. Star Systems change hands through fleet engagement, orbital bombardment, and ground invasion. An empire without a credible military exists only at the tolerance of its neighbours.

The Galactic Commons tracks military power as part of the Cosmic Order calculation but passes no judgement on force size. Building the largest fleet is as legitimate a path as building the most productive economy — the universe is indifferent to method.

Military units are built through an empire's **Armament Queue** — the continuous production pipeline that converts ore, fuel cells, and credits into ships and soldiers. The queue runs every Cycle alongside all other production. Units exit the queue ready for deployment.

### 1.2 In-World Terminology Reference

| In-World Term | Plain Meaning |
|--------------|---------------|
| Armament Queue | The unit production pipeline — where units are ordered and built |
| War Chest | An empire's total military resource — the combined cost of its forces |
| Force Upkeep | Per-Cycle maintenance costs paid to sustain all military units |
| Maintenance Crisis | When an empire cannot pay Force Upkeep — triggers grace period and attrition |
| Military Weight | The computed military power of an empire's force — used in Cosmic Order and coalition thresholds |
| D20 Stat Block | A unit's combat statistics expressed in D20 SRD format — Firepower, Maneuverability, Hull Integrity, Hull Points, Deflector Rating, Targeting Lock, Combat Readiness |
| Fleet Engagement | Direct combat between fleets in open space |
| Orbital Bombardment | Pre-invasion strike phase targeting star system defences from orbit |
| Ground Invasion | Surface combat to transfer ownership of a Star System |
| Blockade | Sealing trade and supply routes of a target Star System without occupying it |
| Composition Bonus | The +15% Military Weight bonus earned by fielding 4 or more distinct unit types |
| Home System Defence Modifier | Structural combat bonus for forces defending their home Star System |

---

## 2. Core Concept

### 2.1 What the Military System Does

The Military System governs everything that happens before combat is resolved:

1. **What units exist** — six types across three domains, each with a distinct combat role and resource footprint
2. **How units are built** — a multi-Cycle production queue that requires planning ahead
3. **How units are sustained** — per-Cycle maintenance costs that scale with force size and constrain indefinite accumulation
4. **How force is measured** — a Military Weight calculation used throughout the game for achievements, coalition triggers, and the Cosmic Order
5. **How different force structures interact** — domain assignment, composition bonuses, and combat mode prerequisites

**The Combat System** handles resolution: how battles are calculated, casualty determination, and outcome reporting. This document establishes what exists; the Combat System establishes how it fights.

### 2.2 The Player's Military Experience

The player sees their military as a strategic asset and an ongoing expense simultaneously. Building a Heavy Cruiser is a 5-Cycle investment that competes with building a Research Station. Sustaining a large fleet drains credits and ore every Cycle without fail.

The player's key military decisions each Cycle:
- **Queue decisions**: What to build this Cycle given current resources and projected needs
- **Composition decisions**: Which unit types to prioritise given current threats and future combat goals
- **Upkeep pressure**: Whether the current force is sustainable or needs to be trimmed before maintenance consumes too much of the economy
- **Combat initiation**: Whether current Military Weight is sufficient to pursue a target Star System

### 2.3 The Three Stages of Territorial Warfare

Military force enables territorial expansion through three sequential combat modes (any of which can be initiated; not all are always required):

1. **Fleet Engagement** — fleets contest control of space around a target Star System
2. **Orbital Bombardment** (optional) — orbital strike reduces defender ground forces before invasion
3. **Ground Invasion** — troops transfer ownership of the Star System

Fleet victory is required before either bombardment or invasion can proceed. Each subsequent stage has its own cost, risk, and optional nature. An empire may choose to win a Fleet Engagement and then open negotiations instead of invading.

---

## 3. The Six Unit Types

### 3.1 Unit Roles and Domains

Six unit types serve the three military domains of Nexus Dominion: Ground, Space, and Orbital. Each has a distinct combat role that cannot be replicated by any other type.

| Unit | Domain | Combat Role | Build Time | Resource Mix | Stat Block |
|------|--------|------------|------------|--------------|------------|
| **Soldiers** | Ground | Occupation and ground combat | 1 Cycle | Credits + Food | §3.4.1 |
| **Fighters** | Space / Orbital | Interception, space superiority, orbital strikes | 2 Cycles | Credits + Ore | §3.4.2 |
| **Bombers** | Orbital | Strike craft; primary participants in Orbital Bombardment phase | 2 Cycles | Credits + Ore | §3.4.3 |
| **Stations** | Orbital | Defensive fortification; orbital defence grid | 3 Cycles | Credits + Ore + Fuel Cells | §3.4.4 |
| **Light Cruisers** | Space | Versatile fleet backbone; no combat weaknesses | 4 Cycles | Credits + Ore + Fuel Cells | §3.4.5 |
| **Heavy Cruisers** | Space | Heavy firepower; capital ship engagements | 5 Cycles | Credits + Ore + Fuel Cells | §3.4.6 |

Unit stats follow the D20 System Reference Document format — see `docs/prd.md` § Design Principle: Combat and Negotiation Resolution Use the D20 System. Full stat blocks are in §3.4. Power multipliers (relative combat weight used for Military Weight calculation) are tuning targets established during simulation.

### 3.2 Unit Roles in Detail

**Soldiers** are the only unit type that can occupy and hold a Star System after a Ground Invasion. A fleet without Soldiers can achieve victory in space and bombard a system into submission, but cannot transfer ownership. Soldiers are cheap and fast to produce; they are vulnerable in any domain other than Ground.

**Fighters** are the most flexible unit type. They can be assigned to either Space or Orbital operations — the only unit with cross-domain flexibility. This makes them the universal fill unit: useful in fleet engagements, useful in orbital defence, cheap enough to maintain in volume. Fighters are not strong against capital ships individually, but in numbers they provide coverage across multiple domains.

**Bombers** are orbital strike craft. They deal disproportionate damage to orbital defences, Stations, and large capital ships in the Orbital domain. They cannot operate in Space or Ground domains and have minimal self-defence capability — they are fragile if unescorted. In the Orbital Bombardment phase between fleet victory and ground invasion, Bombers are the primary delivery vehicle for pre-invasion strikes.

**Stations** are immobile orbital defence platforms. They cannot be moved once placed at a Star System. Their defensive effectiveness is dramatically higher than their offensive value — a Station force defending its home system is among the most cost-efficient military structures in the game. They are ineffective on attack and cannot participate in offensive operations. Building Stations commits to defending a Star System, not projecting power from it.

**Light Cruisers** are the Space-domain generalist. They have no particular weakness in fleet engagements, making them reliable in diverse combat situations. They are the workhorse of mid-game fleets — not the most powerful option, but the most predictable. The fleet composition bonus rewards including at least some Light Cruisers in mixed-force strategies.

**Heavy Cruisers** are capital warships. They carry the highest offensive rating in the unit roster — effective at destroying other large ships and breaking through defensive lines. They are expensive in both production cost and maintenance. An empire that invests heavily in Heavy Cruisers is committing to sustained offensive warfare; their maintenance cost is too high for a defensive holding strategy.

### 3.3 Resource Mix Design Intent

The resource footprint of each unit type creates natural production constraints:

- **Soldiers** consume food — tying ground force size to agricultural output. Empires that neglect food production cannot maintain large standing armies.
- **Fighters and Bombers** consume only credits and ore — accessible early, requiring no fuel cells. This makes them the backbone of early-game fleets before fuel cell infrastructure matures.
- **Stations, Light Cruisers, and Heavy Cruisers** all require fuel cells — the scarcest resource. Capital ship and fortification capacity is naturally limited by fuel cell production, creating a hard ceiling on late-game military power that credits and ore alone cannot lift.

### 3.4 Unit Stat Blocks

All units follow D20 SRD conventions. Stats below represent **Tier I base configurations** — the standard unit available from Cycle 1. Research System doctrine and specialization bonuses (e.g., War Machine's +2 Firepower, Fortress's +4 Deflector Rating) apply on top of these base values during combat resolution.

Damage and HP values are design references. Exact tuning occurs during simulation calibration.

---

#### 3.4.1 Soldiers · *Ground Domain*

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 10 | +0 |
| Maneuverability (DEX) | 12 | +1 |
| Hull Integrity (CON) | 10 | +0 |
| Hull Points (HP) | 10 | — |
| Deflector Rating (DR) | 11 | — |
| Targeting Lock (BAB) | +2 | — |
| Combat Readiness | +1 | — |

**Primary Weapon — Assault Rifle**
- Damage: 1d6
- Range: Short
- Type: Ground domain

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Rapid Deployment** | Production time: 1 Cycle — the fastest unit in the roster |
| **Occupying Force** | Required for Ground Invasion; only unit type that transfers Star System ownership on conquest. Count of surviving Soldiers determines occupation strength post-battle |

---

#### 3.4.2 Fighters · *Space / Orbital Domain*

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 12 | +1 |
| Maneuverability (DEX) | 16 | +3 |
| Hull Integrity (CON) | 10 | +0 |
| Hull Points (HP) | 15 | — |
| Deflector Rating (DR) | 14 | — |
| Targeting Lock (BAB) | +4 | — |
| Combat Readiness | +3 | — |

**Primary Weapon — Laser Cannons**
- Damage: 1d8 + 1
- Range: Medium
- Type: Space or Orbital domain

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Intercept** | +2 attack bonus when targeting Bombers specifically |
| **Cross-Domain Assignment** | May be freely assigned to either Space or Orbital domain before each engagement — the only unit with this flexibility |

---

#### 3.4.3 Bombers · *Orbital Domain*

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 16 | +3 |
| Maneuverability (DEX) | 10 | +0 |
| Hull Integrity (CON) | 12 | +1 |
| Hull Points (HP) | 20 | — |
| Deflector Rating (DR) | 12 | — |
| Targeting Lock (BAB) | +4 | — |
| Combat Readiness | +0 | — |

**Primary Weapon — Heavy Missiles**
- Damage: 2d6 + 3
- Range: Long
- Type: Orbital domain only

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Armour Piercing** | Ignore 4 points of target Deflector Rating on all attacks |
| **Bombardment Role** | Primary unit type for the Orbital Bombardment phase between Fleet Engagement and Ground Invasion; deals +50% damage to Orbital Stations specifically during Bombardment phase |

---

#### 3.4.4 Stations · *Orbital Domain*

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 14 | +2 |
| Maneuverability (DEX) | 6 | −2 |
| Hull Integrity (CON) | 18 | +4 |
| Hull Points (HP) | 60 | — |
| Deflector Rating (DR) | 18 | — |
| Targeting Lock (BAB) | +4 | — |
| Combat Readiness | −2 | — |

**Primary Weapon — Point Defense Grid**
- Damage: 2d8 + 2
- Range: Short
- Type: Orbital domain only

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Defender's Bastion** | When defending at the Station's own Star System, Deflector Rating increases to 25; Military Weight contribution doubles for combat resolution purposes |
| **Immovable** | Cannot be reassigned between Star Systems once constructed. Stations are permanent to their Star System |
| **Orbital Lock** | While at least one Station is present at a Star System, all incoming Bomber attacks against that system suffer −2 to attack rolls |

---

#### 3.4.5 Light Cruisers · *Space Domain*

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 14 | +2 |
| Maneuverability (DEX) | 12 | +1 |
| Hull Integrity (CON) | 14 | +2 |
| Hull Points (HP) | 35 | — |
| Deflector Rating (DR) | 15 | — |
| Targeting Lock (BAB) | +6 / +1 | — |
| Combat Readiness | +1 | — |

**Primary Weapon — Medium Cannons**
- Damage: 1d10 + 2 per attack
- Range: Medium
- Type: Space domain

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Versatile** | No situational attack or defence penalties in any combat context; no unit type has a positional advantage against Light Cruisers |
| **Fleet Backbone** | Counts toward the Composition Bonus unit-type threshold at half the credit cost of Heavy Cruisers — the intended mixed-fleet workhorse |

---

#### 3.4.6 Heavy Cruisers · *Space Domain*

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 18 | +4 |
| Maneuverability (DEX) | 10 | +0 |
| Hull Integrity (CON) | 16 | +3 |
| Hull Points (HP) | 50 | — |
| Deflector Rating (DR) | 17 | — |
| Targeting Lock (BAB) | +8 / +3 | — |
| Combat Readiness | +0 | — |

**Primary Weapon — Heavy Cannons**
- Damage: 2d8 + 4 per attack
- Range: Long
- Type: Space domain

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Broadside** | May direct its two attacks (Targeting Lock +8 / +3) at two different targets in the same round |
| **Capital Ship** | Point defence systems grant −2 to attack rolls of Fighters targeting this unit |

---

### 3.5 Unit Upgrade Paths

The Research System provides unit upgrade paths that enhance base unit capabilities. This document notes that upgrades exist; the Research System document defines the specific doctrine unlocks and what they provide. Upgrade paths are unlocked over time — early game uses base unit configurations.

---

## 4. The Armament Queue

### 4.1 How the Queue Works

Units are built through the Armament Queue — a shared production pipeline that runs automatically each Cycle. The player initiates builds by selecting a unit type and quantity; the queue advances one Cycle per pipeline pass until each build completes.

**Build initiation:**
- Player selects unit type and quantity from the Build Queue panel
- Resource cost is deducted immediately and in full at the time of queue entry
- The build enters the queue with a Cycle countdown (build time per unit type)
- Multiple builds can run simultaneously — there is no hard parallel build limit

**Build completion:**
- On the Cycle of completion, units are added to the empire roster
- Newly completed units can be deployed and assigned in the same Cycle they complete
- Maintenance costs begin immediately upon completion

### 4.2 Build Cancellation and Refunds

A player may cancel a queued build before it completes:
- **50% refund** on all resources paid, if more than 1 Cycle remains until completion
- **No refund** if fewer than 1 Cycle remains (the unit is already being finalised)

The 50% refund creates a cost of indecision — changing build priorities mid-production is possible but expensive. This is intentional: the queue rewards planning.

If an empire is eliminated while units are mid-production, those partial builds are lost. Resources deducted at queue entry are not recoverable.

### 4.3 No Hard Unit Caps

There is no maximum on total unit count. Empire size is bounded by:
- **Resource scarcity** — credits, ore, and fuel cells are finite and competed for
- **Maintenance drain** — large forces consume a growing share of income each Cycle
- **Production time** — capital ships take 4–5 Cycles; mass build-up cannot happen overnight
- **Population and food constraints** — Soldier production is food-gated

**Design intent:** Natural limits are more strategic than arbitrary caps. An empire that over-builds its military will face economic constraint without the game stopping them — the consequences emerge from their own decisions.

---

## 5. Force Upkeep and Maintenance

### 5.1 Maintenance as a Continuous Cost

Every unit in an empire's roster requires per-Cycle maintenance resources — credits at minimum, plus ore or fuel cells for more advanced units. Maintenance is deducted automatically during the Cycle Pipeline (Tier 1) before any player action.

**Maintenance resource mix by unit tier (design intent):**
- Soldiers: Credits only
- Fighters, Bombers: Credits + Ore
- Stations, Light Cruisers, Heavy Cruisers: Credits + Ore + Fuel Cells (scaling with unit complexity)

**All maintenance values are tuning targets.** The design constraint is that a fully built-out late-game military should consume 30–40% of total income. Exact per-unit values emerge from balance simulation.

### 5.2 Maintenance Crisis and Attrition

When an empire cannot pay its full maintenance cost in a given Cycle, a **Maintenance Crisis** begins:

**Cycle N — Grace Period:** The empire is notified of the shortfall. No units are lost. This is the warning window: sell assets, halt new production, abandon expansion, or accept that attrition is coming.

**Cycle N+1 and beyond — Attrition Phase:** If the crisis is not resolved, **10% of total military units are lost per Cycle** until maintenance can be paid. Units are destroyed in reverse power order — the most expensive to maintain are lost first:

```
Attrition order: Heavy Cruisers → Light Cruisers → Stations → Bombers → Fighters → Soldiers
```

This order is intentional: the most strategically valuable units are destroyed first in a bankruptcy, which maximises the pain of over-extension and makes recovery genuinely difficult.

The crisis resolves immediately when the empire can cover its maintenance for a full Cycle. Attrition stops; no further units are lost.

### 5.3 Maintenance as Strategic Signalling

Maintenance load is visible on the empire overview — players can see their total upkeep as a percentage of income. This creates a strategic signal: an empire paying 50%+ of income on maintenance is over-extended. Rival bots read this signal and factor it into aggression decisions.

---

## 6. Fleet Composition and Military Power

### 6.1 Military Weight Calculation

Military Weight is the computed measure of an empire's total military capability. It is used for:
- Cosmic Order ranking (contributes to standing alongside economic power)
- Achievement tracking (Warlord, Conquest paths)
- Coalition trigger thresholds (dominant Military Weight triggers self-preservation responses)
- Combat resolution (see Combat System)

```
Military Weight = Σ (Unit Count × Unit Power Rating × Situational Modifiers)
```

**Situational modifiers include:**
- Composition Bonus (see §6.2)
- Home System Defence Modifier (see §8)
- Research-unlocked unit enhancements (see Research System)
- Emotional State modifiers for bot empires (see Bot System)

Power ratings per unit type are tuning targets. The designed relative ratios:

| Unit | Relative Power (design target) | Notes |
|------|-------------------------------|-------|
| Soldiers | Minimal (~0.1×) | Necessary for occupation; not a combat power unit |
| Fighters | Low (~1.0×) | Reference baseline |
| Bombers | Low-Medium (~2.0×) | Power vs. specific targets; higher than raw number suggests |
| Stations | Medium (~3.0×, ~6.0× defending) | Defender bonus transforms their effective power |
| Light Cruisers | Medium-High (~4.0×) | Reliable generalist value |
| Heavy Cruisers | High (~8.0×) | Highest base offensive output |

### 6.2 Composition Bonus

A fleet containing **4 or more distinct unit types** receives a **+15% bonus to total Military Weight**.

**Design rationale:** This bonus rewards the harder-to-achieve fleet structure. A mono-type fleet (50 Fighters) is easy to build but strategically brittle. A mixed fleet requires managing multiple production queues and multiple resource types — the bonus reflects the strategic advantage of a force that can operate across domains and engage different threats.

The bonus applies to Military Weight calculation only, not to individual unit stats.

### 6.3 Domain Assignment

Before each combat engagement, the player assigns their units to domains. Units can only participate in combat within their eligible domains:

| Unit | Eligible Domains |
|------|-----------------|
| Soldiers | Ground only |
| Fighters | Space or Orbital (choose per engagement) |
| Bombers | Orbital only |
| Stations | Orbital only (immobile — permanently at their Star System) |
| Light Cruisers | Space only |
| Heavy Cruisers | Space only |

Domain assignment for mobile units (Fighters specifically) is made before each engagement — players can rebalance their fleet between Space and Orbital depending on what the upcoming combat phase requires.

---

## 7. Combat Modes

The Military System enables three modes of territorial warfare. Each has distinct prerequisites and outcomes. Detailed resolution mechanics belong to the Combat System.

### 7.1 Fleet Engagement

**What it is:** Direct conflict between two fleets in open space around a contested Star System.

**Prerequisite:** The attacker must bring mobile fleet units (Fighters, Bombers, Light Cruisers, Heavy Cruisers) into the contested system's space.

**Outcome:** A victor is determined with clear casualty counts on both sides. Fleet victory is required before Orbital Bombardment or Ground Invasion can proceed. Losing a Fleet Engagement ends the offensive action.

**Can be resolved without further action:** An attacker who wins a Fleet Engagement may choose to stop — taking space superiority without bombarding or invading. This is useful for establishing a blockade or opening negotiations from a position of strength.

### 7.2 Blockade

**What it is:** A blockading force seals the trade and supply routes of a target Star System without occupying it. No formal declaration of war is required by the Galactic Commons, though blockades are visible to all empires.

**How it works:**
- The attacker maintains a fleet presence in or adjacent to the target system
- The blockaded Star System suffers resource shortfalls each Cycle (reduced Installation output, severed trade routes)
- Population strain and Imperial Stability degradation accumulate over sustained blockades
- Military units in a blockaded system suffer degraded maintenance supply

**Breaking a blockade:** The defender can break the blockade by destroying or routing the blockading fleet. The blockade ends immediately if the blockading fleet falls below a minimum threshold.

**Multi-system blockades:** With sufficient force, an empire may blockade multiple systems within a Sector simultaneously — sealing an entire economic region. The force requirement scales with each additional system.

**Design intent:** Blockade is a slow-burn strategic tool — economically strangling a rival without paying the full military cost of conquest. It creates time pressure on the defender and diplomatic options for both parties.

### 7.3 Ground Invasion

**What it is:** Surface combat that, if successful, transfers ownership of a Star System from the defender to the attacker.

**Prerequisites:**
1. Fleet Engagement — attacker must hold space superiority over the target system
2. Soldiers — the attacking force must include at least some Soldiers for the invasion

**Orbital Bombardment phase (optional):** Before troops land, the attacker may conduct an Orbital Bombardment using Bombers. Bombardment reduces defender troop strength and Star System defences (Installations may be damaged — see Star System Management §10). Bombardment is optional; skipping it preserves defender troop strength but avoids the resource cost and time of the bombardment phase.

**Outcome:** Ground combat resolves between attacking and defending Soldiers. Victory transfers ownership. The attacker's remaining Soldiers occupy the Star System. Installations transfer to the new owner intact (except any damaged during bombardment).

---

## 8. Defender Advantage

### 8.1 Home System Defence Modifier

Forces defending their **home Star System** receive a structural combat bonus that reflects the advantages of prepared ground, local knowledge, and the heightened motivation of defending one's seat of power.

The modifier applies to all defending units at the home system — military power is calculated at a bonus multiplier for combat resolution purposes. The exact multiplier value is a tuning target.

**Design intent:** This modifier means that attacking an empire's home system is the most costly military operation in the game — even if the attacker has superior Military Weight in open space. Conquering a home system requires meaningful numerical or qualitative superiority.

### 8.2 Station Defender Bonus

Stations have an additional independent bonus: their power rating roughly doubles when they are defending rather than contributing to offensive operations. A Station is a poor offensive asset; it becomes a formidable defensive one.

The Station defender bonus and the Home System Defence Modifier are separate multipliers that both apply if Stations are defending at a home Star System.

### 8.3 Non-Home System Defence

Defending a non-home Star System provides no structural combat bonus beyond the units deployed there. Contested border systems have no defensive advantage over attackers — the defender's advantage is purely their force size and composition.

---

## 9. Bot Military Behaviour

### 9.1 Archetype Build Priorities

Each bot archetype has distinct military production priorities driven by their role and achievement path:

| Archetype | Primary Units | Secondary | Military Philosophy |
|-----------|--------------|-----------|---------------------|
| **Warlord** | Heavy Cruisers | Bombers + Fighters | Maximum offensive power; aggressively builds toward Conquest achievement |
| **Diplomat** | Fighters | Stations + Light Cruisers | Defensive posture; military used for deterrence and Star Covenant obligations |
| **Merchant** | Fighters | Light Cruisers | Minimal military (10–15% of networth); just enough to deter raiders |
| **Schemer** | Bombers | Fighters + Light Cruisers | Covert-capable fleet; Bombers used for Syndicate-adjacent operations |
| **Turtle** | Stations | Light Cruisers + Fighters | Maximum defensive fortification; builds Stations at all held Star Systems |
| **Blitzkrieg** | Fighters | Bombers + Soldiers | Fast early rush; prioritises speed and quantity over power |
| **Tech Rush** | Light Cruisers | Stations + Fighters | Research-enhanced fleet; avoids Heavy Cruiser maintenance burden |
| **Opportunist** | Fighters | Light Cruisers | Cost-efficient flexibility; copies leading empire's force structure |

### 9.2 Maintenance Awareness

All bots evaluate their maintenance burden before committing to new builds:

- If projected maintenance exceeds 40% of income: halt new military production until the economy recovers
- If maintenance exceeds 50% of income: consider disbanding lower-power units to reduce the burden
- Warlord archetype sets this threshold higher (up to 50% before halting) — they accept greater economic strain for military advantage

### 9.3 Threat Response

Bots evaluate neighbour Military Weight relative to their own each Cycle. When a neighbour's Military Weight exceeds 1.5× their own:

- Warlord, Blitzkrieg: Immediate military prioritisation — redirect economy to production
- Diplomat, Turtle: Seek Star Covenant or Nexus Compact formation; build Stations defensively
- Merchant, Tech Rush: Reach out diplomatically; if unavailable, reluctantly increase military spend
- Schemer: Evaluate covert destabilisation as an alternative to open military competition

### 9.4 Bot Military Messages

**Production announcements:**

> *Warlord queues Heavy Cruisers:* "Another capital ship joins the fleet. My enemies should take note."
>
> *Turtle completes Stations:* "Another orbital bastion complete. My borders are becoming unassailable."
>
> *Blitzkrieg reaches critical mass:* "60 Fighters ready. Time to move."
>
> *Merchant minimal build:* "Why waste credits on warships when trade is more profitable? A few fighters will suffice."
>
> *Schemer on Bombers:* "My fleet looks modest. You haven't accounted for what it can do from orbit."

**Maintenance crisis:**

> *Bot in grace period:* "My treasury is strained. Hard choices ahead."
>
> *Bot entering attrition:* "I cannot sustain these forces. Some will be decommissioned. This is a temporary setback."
>
> *Rival bot observing crisis:* "Their fleet is shrinking. The window may be opening."

---

## 10. UI and Player Experience

### 10.1 Fleet Overview Panel

```
┌──────────────────────────────────────────────────────────┐
│  IMPERIAL FORCES                Military Weight: 94       │
├──────────────────────────────────────────────────────────┤
│  Unit Roster                                              │
│  ────────────────────────────────────────────────────    │
│  Fighters         ×38   Space/Orbital   Low power        │
│  Bombers          ×12   Orbital         Med power        │
│  Light Cruisers   ×10   Space           Med-High power   │
│  Stations         ×4    Orbital (fixed) High (defending) │
│  Soldiers         ×25   Ground          Minimal          │
│  ────────────────────────────────────────────────────    │
│  Unit Types: 5         Composition Bonus: +15% ✓         │
│                                                           │
│  Force Upkeep this Cycle: 4,200 cr · 380 ore · 120 fuel  │
│  Upkeep as % of income:   34%  ■■■■■■░░░░  SUSTAINABLE   │
└──────────────────────────────────────────────────────────┘
```

### 10.2 Armament Queue Panel

```
┌──────────────────────────────────────────────────────────┐
│  ARMAMENT QUEUE                                           │
├──────────────────────────────────────────────────────────┤
│  Resources:  12,400 cr  ·  820 ore  ·  340 fuel  ·  180 food │
│                                                           │
│  UNIT SELECTION                                           │
│  Soldiers       1 Cycle   cr + food      [BUILD]         │
│  Fighters       2 Cycles  cr + ore       [BUILD]         │
│  Bombers        2 Cycles  cr + ore       [BUILD]         │
│  Stations       3 Cycles  cr+ore+fuel    [BUILD]         │
│  Light Cruisers 4 Cycles  cr+ore+fuel    [BUILD]         │
│  Heavy Cruisers 5 Cycles  cr+ore+fuel    [BUILD]  ◀ costly│
│                                                           │
│  ACTIVE BUILDS (2)                                        │
│  10× Fighters       ██████████░  Cycle 4 of 4  [Cancel]  │
│   2× Light Cruisers ██░░░░░░░░░  Cycle 1 of 8  [Cancel]  │
└──────────────────────────────────────────────────────────┘
```

### 10.3 Combat Mode Selection

When a player has fleet superiority over a target system, the interface presents the available next steps as explicit choices:

```
FLEET VICTORY — KETH PRIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Space superiority established.
Defender fleet routed.

Your options:
  ► Orbital Bombardment  — Bombard defences before invasion. Costs Bomber
                           ordnance and 1 Cycle. Weakens ground defenders.
  ► Ground Invasion      — Land troops immediately. Defender at full strength.
  ► Impose Blockade      — Hold space superiority; strangle their economy.
  ► Withdraw             — Disengage. Fleet returns to home position.

Soldiers available for invasion: 45
Defender troop estimate: 30 (before bombardment)
```

### 10.4 Maintenance Crisis Alert

When the empire enters a Maintenance Crisis:

```
⚠ MAINTENANCE CRISIS — CYCLE 34
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Force Upkeep (6,800 cr, 490 ore) exceeds income.

This Cycle: Grace period. No units lost yet.
Next Cycle: If unresolved — 10% of forces decommissioned
            (Heavy Cruisers first).

Options: Halt production | Abandon a Star System | Negotiate resource trade
```

---

## 11. Balance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Military as % of empire networth (typical mid-game) | 20–30% | Military investment should feel significant without crowding out development |
| Force Upkeep as % of total income (sustainable ceiling) | ≤40% | Beyond 40%, economic strain begins to compound |
| Cycles to first combat-capable fleet (early game) | 4–8 Cycles | Early expansion pressure should feel real but not instant |
| Average Military Weight at Cycle 30 | 60–90 | Establishes mid-game baseline for achievement thresholds |
| Average Military Weight at Cycle 60 | 120–180 | Late-game power levels; coalition trigger calibration reference |
| Fighter/Bomber ratio in typical fleet | ~3:1 | Bombers are specialised; Fighters fill volume |
| Composition bonus adoption rate | 60–70% of games | Majority of fleets should be diverse; monofleets should be a deliberate choice |
| Maintenance attrition events per 100-empire game | <10 | Bankruptcy should be rare enough to be meaningful, not a common failure mode |
| Bot Warlord Military Weight vs. average empire | 1.5–2.0× | Warlord archetype should feel militarily dominant; not comically superior |

---

## 12. Open Questions

| # | Question | Context | Options | Status |
|---|----------|---------|---------|--------|
| 12.1 | **Fleet movement mechanics** | How do fleets travel between Star Systems? The PRD mentions wormholes for long-range power projection. Movement speed, transit time, and fleet positioning affect both offensive and defensive strategy. | Resolve when adopting the Combat System — movement rules are tightly coupled to combat initiation. Flag here, resolve there. | Defer to Combat System |
| 12.2 | **Exact unit power multipliers** | The relative ratios (Soldiers ~0.1×, Fighters ~1.0×, ... Heavy Cruisers ~8.0×) are established as design targets. Exact values require simulation calibration. | Establish via balance simulation: Military Weight at Cycle 30 target = 60–90; Cycle 60 = 120–180. Adjust ratios to hit targets. | Defer to simulation |
| 12.3 | **Exact production times and costs** | Build times (1–5 Cycles) and resource costs are design-sound. Exact numbers (e.g., Light Cruiser: 5,000 cr + 800 ore + 300 fuel cells) are tuning targets. | First-pass values from legacy doc are a reasonable simulation starting point. Adjust until "Cycles to first fleet" target is met. | Defer to simulation |
| 12.4 | **Orbital Bombardment resource cost** | The Bombardment phase is optional but should have a resource cost (ordnance, time) to prevent it from being trivially chosen. | Options: (A) Fuel Cells consumed per Bombardment pass. (B) Fixed Cycle delay only — no resource cost. (C) Ore + Cycle delay. Recommendation: A — Fuel Cells, consistent with Bombers' resource footprint. | Design decision |
| 12.5 | **Multi-system blockade force threshold** | How many ships does it take to blockade 1 system? 2? An entire Sector? The force threshold determines whether blockade is a realistic mid-game tactic or a late-game luxury. | Recommendation: Scale with defender's Installation count in the target system — richer systems require more force to effectively blockade. Exact values via simulation. | Defer to simulation |
| 12.6 | **Home System Defence Modifier value** | PRD requires the modifier; the exact value determines how hard it is to attack a home system. Too high = uncapturable; too low = no meaningful deterrence. | Recommendation: 1.5× multiplier on all defending units. Attacker needs ~1.5× Military Weight superiority to assault a defended home system at parity. Tuning target. | Defer to simulation |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2 | 2026-03-08 | Design session | Updated all unit stat block labels to canonical sci-fi names: STR → Firepower (STR), DEX → Maneuverability (DEX), CON → Hull Integrity (CON), HP → Hull Points (HP), AC → Deflector Rating (DR), BAB → Targeting Lock (BAB), Initiative → Combat Readiness. Updated §1.2 terminology table: replaced "Combat Profile" entry with "D20 Stat Block". Updated §3.4 intro text and special ability descriptions to use sci-fi stat names. Resolves Combat System Open Question 15.6. |
| 1.1 | 2026-03-08 | Design session | Added D20 stat blocks (§3.4.1–3.4.6) for all six unit types. Replaced abstract Combat Profile descriptors in §3.1 with stat block references. Renumbered §3.4 (Upgrade Paths) → §3.5. D20 stats consistent with Research System doctrine bonuses (applied on top of base values). |
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes MILITARY-SYSTEM.md. Carriers cut (PRD says 6 unit types; legacy defined 7). D20 stats stripped — replaced with abstract combat profiles (Offensive/Defensive/Durability). D20 resolution mechanics deferred to Combat System. Added Blockade section from PRD §5 (not covered in legacy). Added Home System Defence Modifier from PRD §5. Added explicit Orbital Bombardment phase design. Renamed Petroleum → Fuel Cells. Renamed all "turns" → "Cycles". Renamed "sectors" (owned territory) → "Star Systems". Removed all REQ-MIL specs, implementation file paths, migration plan, and entire appendix (SQL schemas, TypeScript, React components — all implementation-phase content). Deferred fleet movement to Combat System (Open Q 12.1). Deferred unit upgrade path specifics to Research System. Retained: build queue mechanics, 50% refund design, no-hard-caps rationale, maintenance attrition in reverse power order, composition bonus and rationale, archetype build priority matrix, balance target ranges. |
