# Research System

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 8 (Research System), § Requirements 12 (Achievement Paths — Singularity)
> **Supersedes:** `docs/other/Game Systems/RESEARCH-SYSTEM.md`

---

## Document Purpose

This document defines the complete design of Nexus Dominion's research system: how empires accumulate Research Points, how the Doctrine draft works, what each Doctrine path unlocks through its Specialization and Capstone, how research intelligence is gathered and shared, and how bots pursue research.

Combat bonuses in this document are expressed in D20 System language (STR bonuses, AC modifiers, saving throws, damage dice). This is consistent with the game's intent to use the D20 SRD as its combat resolution framework — see `docs/prd.md` § Design Principle: Combat and Negotiation Resolution Use the D20 System.

**Intended readers:**
- Game designers making decisions about doctrine balance, capstone power levels, and research pacing
- Developers implementing research point accumulation, the doctrine draft event, and combat modifier application
- Anyone resolving a design question about what a research choice grants and how it integrates with combat

**Design philosophy:**
- **Choice over progression.** Research is not a passive upgrade path. It is a permanent commitment to one of three strategic identities, made mid-game with full knowledge that alternatives are being permanently forfeited.
- **Capability improvement, not incremental percentages.** Each tier grants qualitatively different abilities — a Shock Troops commander fights differently, not just slightly better. The Capstone transforms what an empire can do.
- **Information is power.** Doctrine choices are public; Specialization choices are hidden. The intelligence game around what the enemy chose — and the rock-paper-scissors counter-play it implies — is a core strategic layer.
- **Singularity through mastery.** Completing the full path to Capstone is one of the game's nine achievement paths. Research is not a background system — it is a primary strategic commitment for empires pursuing the Singularity achievement.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [Research Point Economy](#3-research-point-economy)
4. [The Three Doctrine Paths](#4-the-three-doctrine-paths)
5. [Specializations](#5-specializations)
6. [Capstone Abilities](#6-capstone-abilities)
7. [The Architect's Covenant — Terraforming](#7-the-architects-covenant--terraforming)
8. [Information Visibility and Intelligence Gathering](#8-information-visibility-and-intelligence-gathering)
9. [Rock-Paper-Scissors Counter-Play](#9-rock-paper-scissors-counter-play)
10. [Bot Research Behaviour](#10-bot-research-behaviour)
11. [UI and Player Experience](#11-ui-and-player-experience)
12. [Balance Targets](#12-balance-targets)
13. [Open Questions](#13-open-questions)
14. [Revision History](#14-revision-history)

---

## 1. In-World Framing

### 1.1 The Nexus Academy

Research in Nexus Dominion is conducted under the auspices of the **Nexus Academy** — the galaxy's oldest and most prestigious scientific institution, founded by the Galactic Commons to study the Nexus energy field and its implications for galactic civilisation. The Academy does not control research; it accredits it. An empire that formally adopts a doctrine becomes a declared research school within the Academy's register — and that declaration is public.

The Academy maintains the **Research Register**: a public ledger of which empires have committed to which Doctrines, and which have achieved Specialization or Capstone status. The Register is one of the most-watched documents in galactic politics. An empire that reaches Capstone is announcing that it has mastered a complete strategic school — which is both an achievement and a provocation.

Specialization choices are the one exception: the Academy does not require disclosure of Specialization at the time of selection. The Register records only that a Specialization has been chosen. What it was is left to rivals to discover.

### 1.2 In-World Terminology Reference

| In-World Term | Plain Meaning |
|--------------|---------------|
| Research Points (RP) | Accumulated research output — produced by Research Stations each Cycle |
| Doctrine | The foundational strategic school chosen at Tier 1 of research (~Cycle 10) |
| Specialization | The tactical sub-school chosen at Tier 2 of research (~Cycle 30) |
| Capstone | The pinnacle ability unlocked automatically at Tier 3 (~Cycle 60) |
| The Iron Doctrine | War Machine — combat enhancement and offensive power |
| The Architect's Covenant | Fortress — engineering, fortification, and territorial control |
| The Mercantile Accord | Commerce — economic dominance and market manipulation |
| Nexus Academy | The galactic institution under which Doctrines are formally registered |
| Research Register | The public record of empire Doctrine commitments |
| Intelligence Operation | An espionage action targeting an enemy empire's Specialization |
| Galactic Commons Dispatch | The in-game news feed where research rumours circulate |

---

## 2. Core Concept

### 2.1 The Three-Tier Draft

Research progresses through three decision points, each triggered by an RP threshold:

```
Tier 1 — Doctrine Selection       (~Cycle 10, RP threshold: tuning target)
          Choose ONE of three paths. Choice is permanent and PUBLIC.
                    ↓
Tier 2 — Specialization Selection  (~Cycle 30, RP threshold: tuning target)
          Choose ONE of two tactical sub-schools within your Doctrine.
          Choice is permanent and HIDDEN.
                    ↓
Tier 3 — Capstone Unlock           (~Cycle 60, RP threshold: tuning target)
          Automatic — no choice required. The Capstone for your Doctrine
          unlocks when the RP threshold is reached. Event is PUBLIC.
```

Each tier is a **draft event** — a moment where the player is presented with options and must choose one, permanently forgoing the others. This is not a tech tree where everything can eventually be unlocked. The Doctrine chosen at Tier 1 determines everything downstream.

### 2.2 What Research Unlocks

Research does not provide incremental percentage bonuses. Each tier grants qualitatively different capabilities:

- **Doctrine**: A persistent D20 stat modifier applied to all units in combat, and an economic or logistical shift
- **Specialization**: A distinct combat mechanic — a new rule that applies to your battles and does not apply to enemies without the same Specialization
- **Capstone**: A game-changing ability unique to your Doctrine path; cannot be replicated through any other means

### 2.3 The Player's Research Experience

Research is background infrastructure — Research Stations produce RP passively each Cycle — until a threshold is reached. At that point, the game surfaces a **draft event**: a full-screen selection screen that requires the player to commit. After the choice, the new capability is active immediately and permanently.

The player is always aware of their RP progress between thresholds. They are not aware of when the threshold will trigger until it does, which creates a moment of anticipation as the progress bar approaches the next tier.

---

## 3. Research Point Economy

### 3.1 How Research Points Are Produced

Research Points are produced each Cycle by **Research Station Installations** (defined in Star System Management). The production rate per Research Station is a tuning target — values are calibrated so that:

- Tier 1 (Doctrine) is reachable by approximately Cycle 10–15 for an empire with 2–3 Research Stations
- Tier 2 (Specialization) is reachable by approximately Cycle 30–40
- Tier 3 (Capstone) is reachable by approximately Cycle 60–80 (not guaranteed — requires sustained research investment)

**No diminishing returns.** Each Research Station contributes identically regardless of how many the empire holds. Research output is strictly a function of Research Station count. This is intentional: diminishing returns would punish dedicated research strategies without providing strategic interest.

### 3.2 Research as an Economic Trade-Off

Every Research Station built on a Star System is a Development Slot not occupied by a Trade Hub, Mining Complex, or other economically productive Installation. An empire pursuing the Singularity achievement must commit significant Development Slots to Research Stations — at the cost of economic depth elsewhere.

**Design intent:** Research investment should feel like a meaningful sacrifice. An empire rushing toward Capstone will be economically thinner than rivals who built Trade Hubs instead. The Capstone must be powerful enough to justify this cost.

### 3.3 Research Progress Is Cumulative

Research Points accumulate continuously. There is no expiry, no "use it or lose it," and no way to bank or redirect RP. Points spend themselves automatically when a threshold is reached — the draft event fires, and the player makes their choice. RP does not reset between tiers; progress carries forward.

---

## 4. The Three Doctrine Paths

At Tier 1, the player chooses one of three foundational research schools. The choice is made from the Doctrine Selection screen and is immediately announced galaxy-wide via the Galactic Commons Dispatch and recorded in the Research Register.

### 4.1 The Iron Doctrine (War Machine)

**Strategic identity:** Military supremacy through enhanced offensive power. Empires of the Iron Doctrine are the galaxy's most dangerous attackers.

**Doctrine bonus (active from Tier 1):**
- All units gain **+2 STR** in combat (offensive power bonus)
- Star System income reduced by **10%** (military investment comes at economic cost)

**Lore:** *"The galaxy will yield to force. All other arrangements are temporary. The Iron Doctrine is the acknowledgment of this truth."*

**Achievement alignment:** Warlord, Conquest

---

### 4.2 The Architect's Covenant (Fortress)

**Strategic identity:** Engineering mastery — fortification, territorial control, and physical development. Empires of the Architect's Covenant build the most defensible Star Systems in the galaxy and unlock infrastructure others cannot access.

**Doctrine bonus (active from Tier 1):**
- All units gain **+4 AC** when defending (defensive power bonus)
- Offensive attack power reduced by **5%**

**Infrastructure capability (active from Tier 1):**
- Empires of the Architect's Covenant may research **Terraforming** — see §7

**Lore:** *"The galaxy is not conquered. It is built. Stone by stone, system by system, the Covenant shapes what endures."*

**Achievement alignment:** Grand Architect, Endurance

---

### 4.3 The Mercantile Accord (Commerce)

**Strategic identity:** Economic dominance through market control and financial leverage. Empires of the Mercantile Accord extract more value from every transaction in the galaxy.

**Doctrine bonus (active from Tier 1):**
- Market sell prices increased by **+20%** on all outgoing trades
- No combat modifier (the Accord offers no battlefield advantage)

**Lore:** *"Credits are power. Power is freedom. The Accord simply ensures more credits flow toward those who understand this."*

**Achievement alignment:** Trade Prince, Market Overlord

---

## 5. Specializations

At Tier 2, the player chooses one of two tactical sub-schools within their Doctrine. The choice is hidden from rivals — the Research Register records only that a Specialization has been made, not what it was.

Specializations are combat mechanics — new rules that apply to engagements involving the empire that holds them. They create asymmetric warfare and make the intelligence game meaningful.

### 5.1 Iron Doctrine Specializations

**Shock Troops**

*Offensive surprise and speed.*

- The empire's forces strike first at the opening of any Fleet Engagement or Ground Invasion: a **Surprise Round** fires before normal initiative, during which only the Shock Troops holder's units act
- Enemies using **Shield Arrays** negate this effect (see counter-play §9)
- In-world: *"First contact. First blood. The Shock Troops doctrine is not about winning battles — it is about ending them before they begin."*

---

**Siege Engines**

*Anti-fortification specialisation.*

- All attacking units gain **+50% damage against stationary targets** (Orbital Stations; Star System fortifications)
- Attacking units **ignore the AC bonus** of Orbital Stations when making attack rolls
- Enemies using **Shield Arrays** do not negate Siege Engines (Siege Engines counter Shield Arrays — see §9)
- In-world: *"No wall is permanent. The Siege Engines doctrine is the proof."*

---

### 5.2 Architect's Covenant Specializations

**Shield Arrays**

*Defensive interception and surprise negation.*

- The empire is **immune to Surprise Rounds** (negates Shock Troops)
- All defending units gain **+2 AC** in addition to the Fortress Doctrine's base bonus
- In-world: *"They came expecting first blood. They found a wall."*

---

**Minefield Networks**

*Pre-combat attrition.*

- At the start of any engagement where this empire is the defender, all attacking units must make a **CON saving throw (DC 15)** or lose **10% of their HP** before combat rolls begin
- Enemies using **Shock Troops** automatically clear minefields before their Surprise Round (see §9)
- In-world: *"The Covenant does not wait for the enemy to arrive. The Covenant is already there."*

---

### 5.3 Mercantile Accord Specializations

**Trade Monopoly**

*Market domination.*

- All **market purchase prices reduced by 20%** for this empire
- All **market sell prices increased by 30%** (stacking with the Accord's base +20% = effectively +50% sell advantage vs. a non-Commerce empire)
- No combat modifier — this Specialization has no battlefield effect
- In-world: *"Every credit in the galaxy passes through our hands eventually."*

---

**Mercenary Contracts**

*Purchased battlefield advantage.*

- Per engagement, the empire may **spend 10,000 credits** to hire mercenary forces, granting all units **+2 STR** for the duration of that battle only
- Can be used in any engagement where the empire has credits to spend
- In-world: *"We do not have the largest fleet. We simply buy the best one, when we need it."*

---

## 6. Capstone Abilities

At Tier 3, the Capstone unlocks automatically when the RP threshold is reached. No choice is required. The unlock is announced publicly via the Galactic Commons Dispatch and surfaced in a dramatic full-screen moment for the player. This event triggers Convergence Alert responses from rival bots.

Each Capstone is unique — no other mechanic in the game replicates it.

### 6.1 The Dreadnought (Iron Doctrine Capstone)

A single unique war asset is constructed: **The Dreadnought**. There is only one. It cannot be replaced if destroyed. It exists alongside the rest of the fleet as an extraordinary capital-class vessel unlike anything else in the galaxy.

**D20 Stat Block:**

| Stat | Value | Modifier |
|------|-------|----------|
| Firepower (STR) | 20 | +5 |
| Maneuverability (DEX) | 8 | −1 |
| Hull Integrity (CON) | 20 | +5 |
| Hull Points (HP) | 200 | — |
| Deflector Rating (DR) | 20 | — |
| Targeting Lock (BAB) | +10 / +5 | — |
| Combat Readiness | −1 | — |

**Primary Weapon — Siege Cannon Array**
- Damage: **4d12 + 5** per attack
- Range: Long
- Type: Space/Orbital domain

**Special Abilities:**

| Ability | Effect |
|---------|--------|
| **Dreadnought Volleys** | The Dreadnought may split its attacks between two targets in the same domain per round (Cleave equivalent) |
| **Armoured Bulkhead** | Damage Reduction 10/— — the first 10 points of any hit are absorbed |
| **Fleet Aura** | All allied units in the same domain gain a +2 morale bonus to attack rolls while the Dreadnought is present |
| **Titan's Grip** | Once per engagement: a full-power barrage targeting one unit deals **double damage** and ignores Damage Reduction |

*In-world: "When the Dreadnought enters the field, other empires do not ask whether they can win. They ask whether they should fight at all."*

---

### 6.2 Citadel World (Architect's Covenant Capstone)

One Star System of the player's choosing is designated a **Citadel World**. This is permanent and cannot be undone.

**Citadel World effects:**
- All defending units at this Star System gain **AC 25** — the highest defensive rating achievable in the game
- Orbital Bombardment against this Star System deals **half damage** (rounded down) before defender saves
- The Citadel World marker is visible to all empires on the star map — it is a public declaration of inviolability
- **Conquest of a Citadel World is not impossible, but it requires exceptional force** (the attacker needs to account for AC 25 on all defence rolls)

*In-world: "The Architect's Covenant does not build walls. It builds worlds that are the wall."*

---

### 6.3 Economic Hegemony (Mercantile Accord Capstone)

The empire achieves total market dominance. A passive income stream is established:

- Each Cycle, the empire receives **50% of the second-highest-income empire's credit income** as passive Hegemony revenue — automatically, without trade action required
- This is not a theft mechanic — the source empire does not lose credits. It is the Accord's modelling of economic gravity: when one empire controls the market, all transactions benefit it
- The Hegemony income is public (visible in the event log) and triggers significant bot resentment and coalition pressure

*In-world: "They asked how we make credits faster than anyone else can spend them. We stopped answering. The answer is everywhere."*

---

## 7. The Architect's Covenant — Terraforming

### 7.1 Terraforming as an Engineering Capability

The **Architect's Covenant** (Fortress Doctrine) is the research school of physical construction and engineering. As such, it grants access to **Terraforming** — the ability to unlock the hidden Development Slots on Frontier World Star Systems (see Star System Management §3.2).

Terraforming is not a combat Specialization. It is an **infrastructure capability** that activates when the Architect's Covenant is chosen as Doctrine (Tier 1). It does not require a Specialization choice — it is an inherent capability of the Covenant path.

### 7.2 How Terraforming Works

Once an empire holds the Architect's Covenant Doctrine:
- **Frontier Worlds within their empire become developable** — locked slots can be unlocked one at a time through a research investment (credits + queue time per slot)
- **Each slot unlock reveals its hidden Biome affinity** — the player learns what type of Installation will be most efficient in that slot after committing to unlock it
- **Empires without the Architect's Covenant cannot unlock Frontier World hidden slots** — their Frontier Worlds remain at 2 active Development Slots indefinitely

### 7.3 Terraforming as a Strategic Differentiator

An empire holding the Architect's Covenant can develop Star Systems that rivals cannot. Frontier Worlds — previously a gamble — become viable high-ceiling Star Systems for Covenant empires. This gives the Architect's Covenant an economic development advantage in addition to its defensive combat advantage.

**Design intent:** Terraforming gives the Architect's Covenant a meaningful economic identity separate from its defensive combat bonuses. It is not the strongest economic path (the Mercantile Accord dominates market play) but it provides development depth through geographic access others lack.

---

## 8. Information Visibility and Intelligence Gathering

### 8.1 What Is Public and What Is Hidden

| Information | Visibility | Source |
|-------------|-----------|--------|
| Empire's Doctrine (Tier 1 choice) | **Public** — immediate galaxy-wide announcement | Research Register; Galactic Commons Dispatch |
| Empire's Research Station count | **Public** — visible on star map | Star map |
| Empire has made a Specialization choice | **Public** — Register records the event | Research Register |
| Empire's Specialization identity | **Hidden** — not disclosed | Must be discovered |
| Empire's RP total / progress % | **Hidden** | Must be inferred |
| Capstone unlock | **Public** — dramatic galaxy-wide event | Galactic Commons Dispatch; full-screen announcement |

### 8.2 How Specialization Is Revealed

Rivals can discover an empire's hidden Specialization through four methods:

**1. Combat Experience (free, automatic)**
When an empire uses their Specialization ability in a battle that involves a rival (either as combatant or observer), the Specialization is revealed to that rival immediately. First use exposes it.

**2. Intelligence Operation (costs 5,000 cr; 85% success)**
An empire may conduct an espionage mission targeting a rival's research records. On success: the Specialization is revealed, and the discovering empire receives a counter-recommendation (see §9). On failure: the attempt is detected, triggering a −10 diplomatic reputation penalty with the target empire.

**3. Alliance Intelligence Sharing (free)**
Empires bound by a Star Covenant (Alliance — see Diplomacy System) automatically share known Specialization intelligence. If one Covenant member has discovered a rival's Specialization through any means, all Covenant members know it.

**4. Galactic Commons Dispatch Rumours (free; 50% accuracy)**
Every 10 Cycles, the Dispatch publishes a batch of research rumours — three accurate and two deliberately misleading, in randomised order. The player cannot tell which are accurate without corroborating information. Rumours describe Specializations in general terms ("sources suggest [Empire] has been conducting trials consistent with pre-combat mine deployment").

---

## 9. Rock-Paper-Scissors Counter-Play

The six Specializations form a structured counter-play loop across doctrine lines. Understanding this loop is strategically important; winning it requires intelligence.

### 9.1 The Counter Loop

```
Shock Troops      →  defeats Minefield Networks (auto-clears mines before Surprise Round)
Minefield Networks →  defeats Siege Engines     (pre-combat HP loss before the siege begins)
Siege Engines     →  defeats Shield Arrays      (ignores the AC bonus Shield Arrays provides)
Shield Arrays     →  defeats Shock Troops       (negates the Surprise Round entirely)

Mercenary Contracts and Trade Monopoly have no direct counter-play —
they are economic Specializations that operate outside the combat loop.
```

### 9.2 Design Rationale

The counter loop creates an intelligence game within the military game. A player who knows their rival has **Shock Troops** can choose **Shield Arrays** and neutralise their advantage. A player without that intelligence is fighting blind. This makes the espionage investment (5,000 cr, Intelligence Operation) a genuine strategic expenditure — not optional decoration.

The Mercantile Accord Specializations deliberately opt out of the combat counter-play: Commerce empires trade battlefield advantage for economic supremacy. This is a design choice, not an oversight.

### 9.3 Counter-Play Visibility

The counter-play relationships are **not explained to the player in tutorial form**. They are surfaced through:
- Combat result reporting (when an ability fires and counters another, the report names both)
- The Intelligence Operation result screen (success reveals Specialization + shows its counters)
- Bot communications (Warlord bots taunt after a successful counter; Diplomat bots sometimes warn allies)

---

## 10. Bot Research Behaviour

### 10.1 Archetype Doctrine Preferences

| Archetype | Primary Doctrine | Secondary (counter-pick) | Preference |
|-----------|-----------------|--------------------------|------------|
| **Warlord** | Iron Doctrine (90%) | — | Strongly prefers offensive path |
| **Diplomat** | Architect's Covenant (60%) | Mercantile Accord (40%) | Defensive or economic |
| **Merchant** | Mercantile Accord (85%) | — | Economic dominance only |
| **Schemer** | Iron Doctrine (50%) | Architect's Covenant (30%) | Flexible; chooses based on galaxy state |
| **Turtle** | Architect's Covenant (90%) | — | Maximum fortification |
| **Blitzkrieg** | Iron Doctrine (85%) | — | Aggressive path |
| **Tech Rush** | Architect's Covenant (50%) | Iron Doctrine (30%) | Engineering depth or offensive edge |
| **Opportunist** | Variable (mirrors dominant empire) | — | Adapts to galaxy meta |

**Counter-pick variance:** All archetypes have a 20% chance to deviate from their primary preference to counter a known dominant neighbour. A Warlord bot surrounded by Iron Doctrine empires may switch to Architect's Covenant to gain Shield Arrays.

### 10.2 Specialization Selection

Bots select Specializations aligned with their archetype and the current threat environment:
- Warlord, Blitzkrieg: Shock Troops if attacking; Siege Engines if surrounded by Stations
- Turtle: Shield Arrays (prioritised); Minefield Networks if facing aggressive neighbours
- Merchant: Trade Monopoly (always); will only take Mercenary Contracts if under severe military threat
- Schemer: Variable — selects whichever Specialization counters their most powerful neighbour
- Opportunist: Selects whichever Specialization the most successful empire is not using

### 10.3 Bot Research Messages

**Doctrine announcements (public):**
> *Warlord adopts Iron Doctrine:* "The Iron Doctrine. My fleet will be unstoppable. I suggest you reconsider any aggressive plans, {player}."
>
> *Turtle adopts Architect's Covenant:* "The Covenant guides my hand. Every system I hold will become a fortress. Good luck taking any of them."
>
> *Merchant adopts Mercantile Accord:* "The Accord, naturally. Credits make the galaxy turn. I intend to keep most of them."

**Capstone unlock (public, dramatic):**
> *Warlord Dreadnought:* "The Dreadnought is complete. There is nothing in this galaxy that can match it. Nothing."
>
> *Turtle Citadel World:* "[System name] is now the Citadel World. You will not take it. No one will."
>
> *Merchant Economic Hegemony:* "Economic Hegemony achieved. Congratulations to everyone who built an economy this Confluence — a portion of your earnings will now reach me automatically. How generous of you."

**Specialization reveal (on first combat use):**
> *Shock Troops revealed:* "Surprised? You shouldn't have been — you had the intelligence to find out. You simply didn't use it."
>
> *Minefield Networks revealed:* "Did you enjoy the approach? The mines are the Covenant's welcome mat."

---

## 11. UI and Player Experience

### 11.1 Research Panel

```
┌──────────────────────────────────────────────────────────┐
│  NEXUS ACADEMY — RESEARCH PROGRESS                       │
├──────────────────────────────────────────────────────────┤
│  Research Points:  3,840                                  │
│  Tier 2 Threshold: 5,000      Progress: ██████████░░ 77% │
│  Research Stations: 4         Output: 40 RP/Cycle         │
│                                                           │
│  CURRENT DOCTRINE                                         │
│  The Iron Doctrine (War Machine)    [PUBLIC ✓]            │
│  Effect: All units +2 STR · Star System income −10%       │
│                                                           │
│  SPECIALIZATION                     [HIDDEN ●]            │
│  Shock Troops                                             │
│  Effect: Surprise Round opens all your engagements        │
│                                                           │
│  CAPSTONE                           [Locked — 15,000 RP]  │
│  The Dreadnought                                          │
│  Unlocks automatically at threshold                       │
└──────────────────────────────────────────────────────────┘
```

### 11.2 Doctrine Selection Screen (Tier 1 Draft Event)

Full-screen overlay presented when the Doctrine RP threshold is reached. Three option cards displayed side by side:

```
╔═════════════════════════════════════════════════════════════╗
║  NEXUS ACADEMY — DOCTRINE SELECTION                         ║
║  Choose your research path. This choice is permanent.       ║
╠══════════════╦══════════════╦══════════════════════════════╣
║ THE IRON     ║ THE          ║ THE MERCANTILE               ║
║ DOCTRINE     ║ ARCHITECT'S  ║ ACCORD                       ║
║              ║ COVENANT     ║                              ║
║ War Machine  ║ Fortress     ║ Commerce                     ║
║              ║              ║                              ║
║ +2 STR all   ║ +4 AC        ║ +20% market                  ║
║ units        ║ defending    ║ sell prices                  ║
║ −10% income  ║ −5% offense  ║ No combat bonus              ║
║              ║              ║                              ║
║ Doctrine     ║ Doctrine     ║ Doctrine                     ║
║ announced    ║ announced    ║ announced                    ║
║ galaxy-wide  ║ galaxy-wide  ║ galaxy-wide                  ║
║              ║              ║                              ║
║ Unlocks:     ║ Unlocks:     ║ Unlocks:                     ║
║ Shock Troops ║ Shield Arrays║ Trade Monopoly               ║
║ Siege Engines║ Minefield    ║ Mercenary                    ║
║              ║ + Terraform  ║ Contracts                    ║
║ Capstone:    ║ Capstone:    ║ Capstone:                    ║
║ Dreadnought  ║ Citadel World║ Economic                     ║
║              ║              ║ Hegemony                     ║
║  [CHOOSE]    ║  [CHOOSE]    ║  [CHOOSE]                    ║
╚══════════════╩══════════════╩══════════════════════════════╝
```

### 11.3 Intelligence Panel

For each rival empire, a research intelligence summary is available:

```
┌──────────────────────────────────────────────────────────┐
│  RESEARCH INTEL — [Empire Name]                          │
├──────────────────────────────────────────────────────────┤
│  Doctrine:        The Iron Doctrine         [CONFIRMED]   │
│  Specialization:  ???                       [UNKNOWN]     │
│                   [ Investigate — 5,000 cr ]             │
│  Capstone:        Not yet reached                        │
│                                                          │
│  Research Stations: 2 (estimated)                        │
│  RP Progress:     Unknown                                │
│                                                          │
│  KNOWN COUNTERS IF SHOCK TROOPS:  Shield Arrays          │
│  KNOWN COUNTERS IF SIEGE ENGINES: Minefield Networks     │
└──────────────────────────────────────────────────────────┘
```

### 11.4 Capstone Unlock — Dramatic Announcement

When any empire reaches Capstone, a full-screen announcement fires for the player:

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        GALACTIC COMMONS DISPATCH — URGENT               ║
║                                                          ║
║   [EMPIRE NAME] HAS ACHIEVED RESEARCH CAPSTONE          ║
║                                                          ║
║   The Dreadnought-class vessel has been sighted in       ║
║   [home system] space. Confirmed: a singular war-        ║
║   asset of unprecedented capability. No empire in        ║
║   recorded history has produced its equal.               ║
║                                                          ║
║   The Nexus Academy formally records this achievement.   ║
║   The Galactic Commons urges all empires to assess       ║
║   their strategic position accordingly.                  ║
║                                                          ║
║                          [Acknowledge]                   ║
╚══════════════════════════════════════════════════════════╝
```

---

## 12. Balance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Doctrine distribution across 100 empires | ~33% each (±5%) | No doctrine should be dominant enough to distort the counter-play loop |
| Tier 1 (Doctrine) unlock timing | Cycle 10–15 for 95% of empires | Early enough to affect mid-game strategy; late enough to feel earned |
| Tier 2 (Specialization) unlock timing | Cycle 30–40 for 80% of empires | Mid-game unlock; reward sustained research investment |
| Tier 3 (Capstone) unlock timing | Cycle 60–80 for 40–50% of empires | Late-game; not guaranteed without deliberate research investment |
| Combat impact of Doctrine alone | +10–15% win rate vs. no-doctrine empire | Meaningful but not decisive; Specialization and Capstone provide the larger swings |
| Combat impact of Doctrine + Specialization | +15–20% win rate advantage | Significant; intelligence gathering to discover Specialization is worth the investment |
| Combat impact of Doctrine + Specialization + Capstone | +40–50% win rate advantage | Decisive. Capstone should feel like a genuine power spike |
| Counter-pick effectiveness | ~30–40% swing when counter is correctly applied | Intelligence Operation at 5,000 cr should be worthwhile if it enables a correct counter |
| Research Stations as % of total Development Slots (Singularity-path empire) | 25–35% | Singularity pursuit should require meaningful sacrifice of economic Development Slots |

---

## 13. Open Questions

| # | Question | Context | Options | Status |
|---|----------|---------|---------|--------|
| 13.1 | **RP threshold calibration** | Tier timing targets (Cycles 10–15 / 30–40 / 60–80) define game pacing. The Research Station RP output rate must hit these targets given typical empire development. | Establish via simulation: run 100-empire campaigns, measure Doctrine unlock timing distribution, adjust RP per Research Station until distribution matches targets. | Defer to simulation |
| 13.2 | **Dreadnought replacement on destruction** | The Dreadnought is described as non-replaceable. Is this absolute? Or can a Capstone-holding empire build a replacement at high cost after a defined rebuild period? | Recommendation: Absolute — one Dreadnought per campaign. Its destruction is a meaningful event, not a temporary setback. Replaceable Dreadnoughts undermine the uniqueness of the Capstone. | Design decision |
| 13.3 | **Mercenary Contracts cost escalation** | At 10,000 cr per engagement, Mercenary Contracts may be trivially affordable for wealthy Mercantile Accord empires in late game. Should the cost scale with game progression? | Recommendation: Scale cost by current empire income (e.g., 5% of income per engagement, min 10,000 cr). Prevents it from becoming trivially cheap for dominant economies. | Defer to simulation |
| 13.4 | **Economic Hegemony bot response** | The Capstone generates significant passive income for the holder. Bot reaction to this should be severe (it's a near-achievement-threshold event). How aggressive is the coalition response? | Per Syndicate and Diplomacy System design: Convergence Alert fires; Nexus Compact formation is incentivised. Exact coalition formation probability tuned in simulation. | Defer to simulation |
| 13.5 | **D20 system adaptation for fleet scale** | The Dreadnought stat block follows standard D20 SRD conventions. Fleet-scale combat (hundreds of units) requires scaling rules. Does each unit roll individually, or does the fleet aggregate into a representative stat block? | This is a Combat System question — defer to Combat System adoption. Note that D20 adaptation for fleet scale is a primary design challenge for that doc. | Defer to Combat System |
| 13.6 | **OGL compliance** | The D20 system use is governed by the OGL (Wizards of the Coast, 3.5 era). OGL text to be located by the user and included in this repository. Legal compliance must be confirmed before ship. | User to provide OGL text. Compliance review deferred until text is available. | Pending — user action |

---

## 14. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes RESEARCH-SYSTEM.md (v2.0). Confirmed 3-tier draft as canonical model ("eight levels" P0 in PRD is superseded by Phase 2 draft design). Retained: doctrine paths (War Machine, Fortress, Commerce), 6 specializations, rock-paper-scissors counter loop, information visibility model (public doctrine / hidden specialization), galactic news rumour system, bot archetype preferences, balance target structure. Added in-world names: The Iron Doctrine, The Architect's Covenant, The Mercantile Accord. Placed Terraforming under the Architect's Covenant as an infrastructure capability (not a combat specialization); resolves cross-system dependency with STAR-SYSTEM-MANAGEMENT.md §3.2. Restored D20 stat blocks and language throughout (including full Dreadnought stat block with special abilities). Added PRD note re D20 / OGL design intent. Removed: REQ-RSCH specs (001–012), migration plan, implementation file paths, entire appendix (SQL schema, TypeScript ResearchService, React components — all implementation-phase content). All RP thresholds and timing values marked as tuning targets. |
