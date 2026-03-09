# Combat System

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 5 (Combat System), § Design Principle: Combat and Negotiation Resolution Use the D20 System
> **Supersedes:** `docs/other/Game Systems/COMBAT-SYSTEM.md`

---

## Document Purpose

This document defines the complete design of Nexus Dominion's combat system: how the D20 resolution mechanic applies to fleet engagements, how the two-layer stat model works, how each of the three combat modes resolves, how fleets move, and how morale, retreat, and surrender function. Covert operations that precede or accompany combat are defined in the Covert Operations System; this document concerns declared military action.

All combat resolution uses the D20 System Reference Document (SRD) as its foundation — adapted for ship-to-ship and fleet-scale space combat. See `docs/prd.md` § Design Principle: Combat and Negotiation Resolution Use the D20 System for OGL context and pending compliance notes.

**Intended readers:**
- Game designers making decisions about combat balance, phase sequencing, and D20 adaptation
- Developers implementing combat resolution, morale checks, and outcome reporting
- Anyone resolving a design question about how a specific combat situation resolves

**Design philosophy:**
- **D20 as the resolution engine.** Every combat outcome flows from a d20 roll with meaningful modifiers. The same probability machinery resolves a skirmish between two Fighters and the clash of capital fleets — scale changes, the mechanic does not.
- **Drama through transparency.** Players see the roll, the modifiers, and the margin. Combat is not a black box. Winning by one feels different from winning by ten, and the report communicates both.
- **Sequential phases with genuine choice.** Fleet victory opens options — bombard, invade, negotiate, withdraw. The attacker chooses what to do with a win. No automatic escalation.
- **Two stat layers, one system.** Individual units carry physical combat stats (ship-level). Fleet commanders carry cognitive combat stats (command-level). Both contribute to outcome. A brilliant fleet of poorly-led ships is a different proposition than an ordinary fleet under a gifted admiral.
- **Defender bias, not defender immunity.** Home systems are harder to take than open-space engagements. Not impossible. The attacker who commits enough force prevails — but the cost is real.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept — The D20 Combat Framework](#2-core-concept--the-d20-combat-framework)
3. [The Two-Layer Stat Model](#3-the-two-layer-stat-model)
4. [Commander Profiles by Archetype](#4-commander-profiles-by-archetype)
5. [Fleet Movement](#5-fleet-movement)
6. [Fleet Engagement](#6-fleet-engagement)
7. [Orbital Bombardment](#7-orbital-bombardment)
8. [Ground Invasion](#8-ground-invasion)
9. [Blockade](#9-blockade)
10. [Morale, Retreat, and Surrender](#10-morale-retreat-and-surrender)
11. [Research Doctrine Modifiers in Combat](#11-research-doctrine-modifiers-in-combat)
12. [Bot Combat Behaviour](#12-bot-combat-behaviour)
13. [UI and Player Experience](#13-ui-and-player-experience)
14. [Balance Targets](#14-balance-targets)
15. [Open Questions](#15-open-questions)
16. [Revision History](#16-revision-history)

---

## 1. In-World Framing

### 1.1 The Doctrine of Engagement

The Galactic Commons maintains a formal **Doctrine of Engagement** — the codified rules under which empires declare and conduct military action. The Commons cannot enforce it (it has no military), but violations are recorded and broadcast. An empire that attacks without declaration is marked; an empire that refuses surrender when offered is remembered.

Combat in Nexus Dominion is not the clean, instant resolution of a market transaction. It is a sequence of decisions made under pressure, each with a cost — fleet losses, ordnance expended, Cycles spent in the field rather than developing the economy. Victory is not free. The attacker who commits to a Ground Invasion has paid for space superiority, chosen whether to bombard, and landed troops that may or may not survive the surface campaign.

### 1.2 In-World Terminology Reference

**Unit-Level Stats (per ship — physical combat capability):**

| Sci-Fi Term | D20 Equivalent | What It Measures |
|-------------|----------------|-----------------|
| **Firepower** | STR | Weapon output — energy delivered per hit, damage capacity |
| **Maneuverability** | DEX | Thruster response — evasion speed, targeting accuracy, initiative |
| **Hull Integrity** | CON | Structural toughness — capacity to absorb damage, Hull Point maximum |

**Commander-Level Stats (fleet/empire — leadership and cognition):**

| Sci-Fi Term | D20 Equivalent | What It Measures |
|-------------|----------------|-----------------|
| **Strategic Acumen** | INT | Analytical command — tactical planning, fleet coordination, target prioritisation |
| **Battlefield Intuition** | WIS | Combat perception — threat assessment, reading engagement dynamics, morale judgement |
| **Command Authority** | CHA | Leadership presence — crew cohesion, rally capacity, surrender/morale negotiation |

**Derived Stats:**

| Sci-Fi Term | D20 Equivalent | Derivation |
|-------------|----------------|------------|
| **Hull Points (HP)** | Hit Points | Structural damage capacity — total punishment before destruction |
| **Deflector Rating (DR)** | Armor Class (AC) | Difficulty to hit — combines physical shielding and Maneuverability |
| **Targeting Lock** | Base Attack Bonus (BAB) | Trained accuracy — modifier to attack rolls |
| **Combat Readiness** | Initiative | Reaction speed — determines action order in an engagement |
| **Hull Save** | Fortitude Save | d20 + Hull Integrity modifier — resist structural damage from special weapons |
| **Evasion Save** | Reflex Save | d20 + Maneuverability modifier — avoid area effects and bombardment |
| **Morale Save** | Will Save | d20 + Battlefield Intuition modifier — maintain combat will under pressure |

**Combat Events:**

| In-World Term | Plain Meaning |
|--------------|---------------|
| Targeting Solution | A successful attack roll — the weapon found its mark |
| Deflection | A missed attack roll — shielding or maneuver avoided the hit |
| Critical Strike | Natural 20 on an attack roll — maximum damage, special effect |
| Systems Failure | Natural 1 on an attack roll — catastrophic miss, possible own-ship effect |
| Engagement Report | The post-combat summary — casualties, modifiers, key moments |
| Field Withdrawal | Voluntary retreat before morale threshold |
| Morale Fracture | Failing the Morale Save at 50%+ losses |
| Capitulation | Surrender — offered at 75%+ losses, resolved by opposed Command Authority vs Battlefield Intuition |

---

## 2. Core Concept — The D20 Combat Framework

### 2.1 The Resolution Formula

All attack actions in Nexus Dominion resolve using the standard D20 formula:

```
Attack Roll:  d20 + Targeting Lock + Firepower modifier  ≥  target's Deflector Rating
Damage Roll:  Weapon dice + Firepower modifier  (on a successful hit)
Initiative:   d20 + Combat Readiness modifier  (determines action order)
```

A **natural 20** (unmodified die result of 20) is a Critical Strike — it hits regardless of modifiers and deals maximum weapon damage plus an additional weapon die. A **natural 1** (unmodified result of 1) is a Systems Failure — it misses regardless of modifiers and may trigger a secondary effect (jamming, weapon cooldown — resolved per Combat System tuning).

### 2.2 Fleet-Scale Resolution

Fleet combat does not roll individually for every unit — a fleet of 80 Fighters does not generate 80 separate attack rolls. Instead, combat resolves at the **fleet level per combat round**:

- Each side's fleet generates a **composite attack roll**: d20 + fleet's averaged Targeting Lock + highest Firepower modifier among active unit types
- Damage is applied to the opposing fleet's total Hull Point pool (sum of all unit HP × unit count)
- This preserves D20 drama (the single roll, the moment of tension) at a scale appropriate for a 4X game
- Individual units are eliminated when their type's cumulative HP contribution to the pool is depleted

**Why fleet-level resolution:** Per-unit rolling at fleet scale produces statistically similar outcomes but removes the narrative clarity of a single roll. The d20 is most powerful as a storytelling device — one number, one moment. Fleet-level resolution keeps that.

### 2.3 The 5% Granularity Principle

Every point of modifier on a d20 roll represents a 5% shift in hit probability. This makes modifier design tractable:

- A +2 Targeting Lock (Fighters) hits a DR 14 target 45% of the time
- A +8/+3 Targeting Lock (Heavy Cruisers) hits the same target 75% / 50% of the time
- The difference between a well-equipped fleet and a poorly-equipped one is measurable and transparent

All combat result reporting communicates the roll, the target DR, and the margin — so the player always understands whether they won narrowly or decisively.

### 2.4 The Three Combat Modes

Military action resolves through three distinct modes, each with its own prerequisites, mechanics, and outcomes:

| Mode | What It Is | Prerequisite | Outcome |
|------|-----------|--------------|---------|
| **Fleet Engagement** | Direct conflict between fleets in open space | Attacking fleet reaches target Star System | Victor holds space superiority; loser's fleet routed or destroyed |
| **Orbital Bombardment** | Pre-invasion strike from orbit | Fleet Engagement victory | Defender troop strength and Star System defences reduced |
| **Ground Invasion** | Surface combat to transfer Star System ownership | Fleet Engagement victory + Soldiers present | Victory transfers Star System to attacker; defeat repels invasion |
| **Blockade** | Economic siege without occupation | Blocking fleet at target Star System | Target suffers per-Cycle resource shortfalls; broken by relieving fleet |

Fleet Engagement is the gateway. Orbital Bombardment and Ground Invasion are sequential options that follow a Fleet Engagement victory. Blockade is a parallel track that does not require Fleet Engagement but does require sustained fleet presence.

---

## 3. The Two-Layer Stat Model

### 3.1 Unit Stats — The Ship Layer

Individual units carry three physical stats that represent the ship itself (see Military System §3.4 for full stat blocks):

- **Firepower** — weapon output (contributes to attack rolls and damage)
- **Maneuverability** — evasion and speed (contributes to Deflector Rating and Combat Readiness)
- **Hull Integrity** — structural toughness (determines Hull Point pool and Hull Save)

These stats are fixed per unit type (base values from Military System; modified by Research doctrine bonuses at combat resolution time).

### 3.2 Commander Stats — The Command Layer

Every empire has a **Fleet Commander profile** — three cognitive stats that represent the leadership quality of the empire's military command. These are empire-level attributes, not per-unit:

- **Strategic Acumen** — analytical command; modifies fleet-wide Targeting Lock on complex manoeuvres (multi-domain engagements, surprise attacks)
- **Battlefield Intuition** — combat perception; modifies Morale Save DCs, retreat threshold timing, and the empire's ability to read incoming threats
- **Command Authority** — leadership presence; modifies morale rallying, the surrender negotiation roll, and fleet cohesion under sustained losses

Commander stats **do not replace** unit stats. They are applied to fleet-wide rolls (Morale Saves, Capitulation checks, multi-domain coordination bonuses) while unit stats govern direct combat (attack rolls, damage, DR).

### 3.3 Modifier Calculation

Stats use the standard D20 modifier table:

| Stat Value | Modifier |
|------------|----------|
| 8–9 | −1 |
| 10–11 | +0 |
| 12–13 | +1 |
| 14–15 | +2 |
| 16–17 | +3 |
| 18–19 | +4 |
| 20 | +5 |

A Fleet Commander with Battlefield Intuition 16 (+3) applies a +3 modifier to all Morale Saves for their fleet. A unit type with Firepower 18 (+4) adds +4 to its damage rolls.

### 3.4 Research Doctrine Bonuses — How They Apply

Research doctrine bonuses (War Machine +2 Firepower, Architect's Covenant +4 DR when defending) are applied **at the time of combat resolution** — they modify the base unit stats for that engagement. They do not permanently alter the unit stat block; they are situational modifiers. This means the same fleet fights differently under different doctrine conditions without requiring separate stat blocks per research state.

---

## 4. Commander Profiles by Archetype

Each bot archetype has a fixed commander profile reflecting their leadership style. These stats are visible to the player once intelligence operations have revealed them (covert ops — see Covert Operations System).

| Archetype | Strategic Acumen (INT) | Battlefield Intuition (WIS) | Command Authority (CHA) | Command Style |
|-----------|----------------------|---------------------------|------------------------|---------------|
| **Warlord** | 16 (+3) | 12 (+1) | 14 (+2) | Aggressive analyst — plans well, reads threats adequately, leads through force |
| **Diplomat** | 12 (+1) | 14 (+2) | 18 (+4) | High command presence — inspires loyalty, excellent at preventing surrender cascades |
| **Merchant** | 10 (+0) | 16 (+3) | 12 (+1) | Threat-sensitive — poor tactical planner but excellent at knowing when to disengage |
| **Schemer** | 18 (+4) | 16 (+3) | 10 (+0) | Brilliant analytical commander — reads everything, plans everything, motivates nobody |
| **Turtle** | 14 (+2) | 18 (+4) | 16 (+3) | Defensive genius — peak threat assessment, never caught off-guard, hard to break |
| **Blitzkrieg** | 12 (+1) | 8 (−1) | 16 (+3) | Momentum-driven — leads through aggression, poor threat assessment, sometimes reckless |
| **Tech Rush** | 18 (+4) | 12 (+1) | 10 (+0) | Cold analytical commander — maximises unit effectiveness, poor at morale management |
| **Opportunist** | 14 (+2) | 16 (+3) | 14 (+2) | Balanced opportunist — reads situations well, adapts command style to conditions |

**Player commander profile** is determined at campaign creation or through play — open question (see §15.1).

---

## 5. Fleet Movement

### 5.1 Adjacent Star System Movement

Moving a fleet between **adjacent Star Systems** (connected on the star map within the same Sector or across a shared border) costs **one Cycle action**. The fleet departs at Cycle commit and arrives at the target Star System at the start of the following Cycle, ready to engage.

- Movement is declared during the player's action phase
- A fleet that moves cannot also engage in the same Cycle (the Cycle is spent on transit)
- The fleet is visible on the star map during transit — there is no hidden movement

**Design intent:** One-Cycle transit keeps the game moving for adjacent Star Systems — the most common combat scenario. It also creates a one-Cycle warning window: when a rival's fleet moves toward your system, you see it coming and have one Cycle to respond (reinforce, fortify, negotiate, or flee).

### 5.2 Long-Range Movement — Wormhole Construction

Cross-Sector movement (between non-adjacent Star Systems separated by geographic distance) requires **Wormhole construction**. Wormholes are permanent infrastructure that enable long-range power projection:

- Construction cost and time: defined in the Military System and PRD (Wormhole specifics — tuning target)
- Once a Wormhole connects two Star Systems, fleet transit through it costs one Cycle action (same as adjacent movement)
- Wormholes are visible to all empires and represent committed strategic infrastructure
- A Wormhole can be destroyed (military operation targeting the Wormhole structure itself — see Open Question 15.2)

**Design intent:** Early- and mid-game conflict is geographic — empires fight over systems near their borders. Late-game conflict becomes trans-Sector as Wormhole networks allow projection of force to distant regions. This mirrors historical 4X pacing without scripting it.

### 5.3 Interception

A fleet moving through space adjacent to a hostile fleet may be intercepted:

- The hostile empire may declare interception during their action phase, preventing the moving fleet from completing transit
- Interception initiates a Fleet Engagement at the intercept point (not at either empire's Star System — no home system defender bonus applies)
- If the intercepting fleet loses, the original fleet completes its transit
- If the moving fleet loses, it is routed back to its origin Star System

---

## 6. Fleet Engagement

### 6.1 Engagement Initiation

A Fleet Engagement begins when an attacking fleet enters a Star System controlled by another empire (or an unclaimed system already occupied by a rival fleet). The attacker commits; there is no "peek without fighting" at a defended system.

**Prerequisites:**
- Attacking fleet must have reached the target Star System via adjacent movement or Wormhole transit (§5)
- Defending fleet (if present) and any Orbital Stations at the Star System automatically participate

### 6.2 Domain Assignment

Before the engagement resolves, both players (or bot logic) assign their mobile units to domains. Stations are fixed to Orbital. Fighters may be assigned to Space or Orbital. All other unit types are domain-locked (see Military System §6.3).

Domain assignment is declared simultaneously — neither side sees the other's assignment before committing.

### 6.3 Combat Round Resolution

Each combat round follows this sequence:

**1. Initiative Phase**
Both fleets roll Combat Readiness: `d20 + highest Maneuverability modifier among active unit types`
Higher result acts first. Ties broken by Maneuverability score; further ties re-roll.

*Research modifier: Shock Troops specialization grants Surprise Round — the Shock Troops fleet acts before initiative is rolled for the first round only.*

**2. Attack Phase (winner of initiative first)**
The acting fleet makes its composite attack roll:
`d20 + fleet Targeting Lock + highest Firepower modifier among active unit types`

Compare against the opposing fleet's **Deflector Rating** (base AC of the most common unit type, modified by Research doctrine if applicable).

- **Hit:** Roll damage dice + Firepower modifier, subtract from opposing fleet's total Hull Point pool
- **Miss:** No damage; opposing fleet responds
- **Critical Strike (natural 20):** Maximum damage + one additional weapon die; special effect possible (weapons jam on target for one round — tuning target)
- **Systems Failure (natural 1):** Automatic miss; possible own-fleet effect (weapon cooldown — tuning target)

**3. Response Phase**
The opposing fleet now acts (same attack sequence). If they were damaged this round, apply morale check if threshold crossed (see §10).

**4. End of Round**
Track cumulative Hull Point losses as percentage of starting fleet Hull Points. Check morale threshold. Check if either fleet is destroyed. If neither: new round begins.

### 6.4 Multi-Domain Resolution

When both Space and Orbital domains are active in an engagement, they resolve **sequentially**:

1. **Space domain** resolves first (fleet-vs-fleet in open space)
2. If the attacker wins the Space domain: **Orbital domain** resolves (orbital platforms, Stations, Fighters assigned to Orbital)
3. Each domain won grants the attacker **+2 to all attack rolls** in the next domain (maximum +4 across both)

This sequential bonus represents momentum and positional advantage — a fleet that has swept the Space domain attacks the Orbital layer with positional superiority already established.

**If the attacker loses any domain, they cannot proceed to subsequent domains.** Orbital cannot be contested unless Space is won. Ground Invasion cannot proceed unless Orbital is cleared (or the attacker accepts taking the Ground phase with the defender's orbital assets intact and active).

### 6.5 Engagement Outcomes

| Outcome | Condition | Result |
|---------|-----------|--------|
| **Attacker Victory** | Defending fleet reduced to 0 Hull Points or capitulates | Attacker holds space superiority; may proceed to Orbital Bombardment, Ground Invasion, or Blockade |
| **Defender Victory** | Attacking fleet reduced to 0 Hull Points or withdraws | Defender retains the Star System; attacker's surviving units routed to origin |
| **Mutual Withdrawal** | Both sides voluntarily withdraw before destruction | Status quo; no territory change; both fleets return to origin |
| **Pyrrhic Victory** | Either side wins with >70% losses | Victory is noted; winner's fleet is severely degraded; Engagement Report highlights the cost |

---

## 7. Orbital Bombardment

### 7.1 When Bombardment Occurs

Orbital Bombardment is available to the attacker after a Fleet Engagement victory, before a Ground Invasion. It is **optional** — the attacker may choose to proceed directly to Ground Invasion, accepting that defender troops are at full strength.

**Why skip bombardment:** Orbital Bombardment costs Bombers ordnance (resource — tuning target) and takes one Cycle. An attacker with a dominant troop advantage may choose speed over attrition.

### 7.2 Bombardment Resolution

Bombing runs target Star System ground defences and deployed Soldier units:

```
Bombardment Attack: d20 + Bombers' Targeting Lock + Firepower modifier
                    vs. target's Evasion Save (d20 + ground troop Maneuverability)
```

- On hit: damage applied to defender's Soldier Hull Point pool
- Bombers' **Armour Piercing** ability: ignore 4 points of target DR in bombardment context
- Stations present: Orbital Lock ability reduces Bomber attack rolls by −2 (they fight back against incoming bombers)
- Bombardment also damages Star System Installations: each successful bombardment round has a chance of damaging one Installation (probability — tuning target)

**Number of rounds:** The attacker chooses how many bombardment rounds to execute (each costs ordnance and one Cycle sub-phase). More rounds = more damage to defenders and Installations = higher cost.

### 7.3 Post-Bombardment State

After bombardment, the Star System's defensive state is updated before Ground Invasion is initiated:
- Defender Soldier count reduced by bombardment damage
- Damaged Installations noted (reduced to 50% output until repaired — see Star System Management)
- Orbital Stations that survived are noted (they do not participate in Ground combat but affect the overall defensive picture)

---

## 8. Ground Invasion

### 8.1 Prerequisites

Ground Invasion requires:
1. Fleet Engagement victory at the target Star System
2. Attacking force includes Soldiers (the only unit capable of occupation)

Bombardment is not required. An attacker may invade directly after Fleet Engagement.

### 8.2 Ground Combat Resolution

Ground combat uses the same D20 resolution as Fleet Engagement, but only Ground-domain units participate:

```
Attacker: Soldiers (with Firepower/Maneuverability/Hull Integrity from their stat block)
Defender: Soldiers (same) + Home System Defence Modifier (if applicable — see §8.3)
```

Each ground combat round follows the same initiative → attack → response → end-of-round structure as Fleet Engagement. Hull Point pools track surviving Soldier capacity on both sides.

**Multi-domain momentum bonus:** If the attacker won both Space and Orbital domains before the ground phase, they carry a cumulative +4 to all ground combat attack rolls. This represents command continuity, momentum, and the psychological effect of watching your orbital defences fall before the troops land.

### 8.3 Home System Defence Modifier

When a Ground Invasion targets an empire's **home Star System**, the defender receives a structural combat bonus applied to all ground defence rolls:

- All defending units gain **+4 DR** (Deflector Rating) for the duration of the ground phase
- This represents prepared ground, local knowledge, fortified positions, and the extreme motivational difference between defending your home and holding an outpost

**Design intent:** Home systems should require significant military superiority to conquer. An attacker with roughly equal force will likely fail a home system ground invasion even after winning space. They need a meaningful numerical or qualitative advantage. The Dreadnought, Research capstone abilities, and composition bonuses exist partly to provide that edge.

Home Star System defence modifier does **not** apply to non-home Star Systems. A border Star System the defender has held for 40 Cycles has no special advantage — only prepared troops and any Stations contribute.

### 8.4 Invasion Outcomes

| Outcome | Condition | Result |
|---------|-----------|--------|
| **Attacker Victory** | Defender Soldiers reduced to 0 or capitulate | Star System transfers to attacker with all Installations intact (minus bombardment damage) |
| **Defender Victory** | Attacker Soldiers reduced to 0 or retreat | Invasion repelled; Star System retained; attacker's Soldiers destroyed at the landing site |
| **Partial Invasion** | Attacker wins but with fewer than 10 Soldiers surviving | Star System transfers but occupation is fragile — see Open Question 15.3 |

---

## 9. Blockade

### 9.1 Establishing a Blockade

A blockade is declared when an empire stations a fleet in or adjacent to a target Star System and formally announces a blockade through the Galactic Commons. No Fleet Engagement is required — a blockade can be imposed on a system without defeating its fleet first (though doing so allows the defender's fleet to break the blockade immediately from the inside).

**Minimum blockade force:** The blocking fleet must maintain a minimum Military Weight threshold at the Star System to sustain the blockade. This threshold scales with the number of Installations in the target system — a more developed system is harder to effectively seal (more points of ingress). Exact threshold: tuning target.

### 9.2 Blockade Effects Per Cycle

Each Cycle the blockade is sustained, the target Star System suffers:

- **Trade route severance:** All Installation credits income at the blockaded Star System reduced by 50% (trade routes blocked)
- **Supply shortfall:** Ore and Fuel Cell consumption for Installations and military maintenance at that system must be sourced from reserves; none flows through blockaded routes
- **Population strain:** Food supply disrupted; population growth stalls; Imperial Stability at the system degrades by a tuning-target amount per Cycle
- **Military degradation:** Military units stationed at the blockaded system cannot receive maintenance supply from outside — they draw from the system's local reserves only; if reserves are exhausted, maintenance attrition begins at that system

### 9.3 Breaking a Blockade

A blockade is broken when:
- A **relieving fleet** from the defender (or an allied empire) reaches the Star System and defeats the blockading fleet in a Fleet Engagement
- The blockading fleet **voluntarily withdraws**
- The blockading fleet is **destroyed or reduced below the minimum threshold** (by the defender's fleet, a third-party fleet, or Covert Operation)

When broken, all blockade effects end immediately. No recovery delay — the system returns to full operation on the next Cycle.

### 9.4 Multi-System Blockade

An empire with sufficient Military Weight may blockade multiple Star Systems within the same Sector simultaneously. Each additional system beyond the first requires proportionally more force to maintain (the fleet is stretched thinner). The force multiplier per additional system is a tuning target.

**Design intent:** Multi-system blockade should be possible but demanding. A fleet that can blockade an entire Sector is a fleet that cannot be doing much else — the resource commitment is real.

---

## 10. Morale, Retreat, and Surrender

### 10.1 Morale Check — 50% Hull Point Loss

When either fleet crosses the **50% Hull Points lost** threshold, a **Morale Save** is triggered:

```
Morale Save: d20 + fleet commander's Battlefield Intuition modifier  ≥  DC 15
```

- **Success:** Fleet holds. Combat continues normally.
- **Failure — Morale Fracture:** Fleet cohesion breaks. The empire must immediately choose: **Field Withdrawal** (retreat) or attempt to **rally** next round (one further attempt at DC 15 with −2 penalty for each subsequent round of continued Fracture)

A fleet that continues fighting after a Morale Fracture without rallying fights at **−2 to all attack rolls** until the engagement ends.

### 10.2 Field Withdrawal (Voluntary Retreat)

An empire may declare a **Field Withdrawal** at any point before their fleet is destroyed — before or after a Morale Fracture. Withdrawal is resolved as follows:

- Declaring fleet makes an **Evasion Save** to disengage without further damage: `d20 + highest Maneuverability modifier ≥ DC 12`
- **Success:** Fleet retreats to the nearest friendly Star System with 10% additional Hull Point loss (the cost of breaking contact under fire)
- **Failure:** Fleet takes one additional round of enemy attacks before successfully disengaging

An empire that withdraws cannot re-initiate an engagement at the same Star System for one Cycle (the fleet is regrouping). They may reinforce and try again the following Cycle.

### 10.3 Surrender — 75% Hull Point Loss

When either fleet crosses **75% Hull Points lost**, the victor may offer **Capitulation**:

- The losing side's commander makes a Capitulation check — but this time it is **opposed**:

```
Attacker's offer: d20 + attacker commander's Command Authority modifier
Defender's resistance: d20 + defender commander's Battlefield Intuition modifier
```

- **Attacker wins the opposed roll:** Defender accepts terms. The engagement ends without further combat. The victor sets the terms (typically: territorial concession, resource payment, or fleet disbandment — negotiated via Diplomacy System for formal treaty).
- **Defender wins the opposed roll:** Defender refuses. Combat continues. This is honourable (the Galactic Commons records it as a contested refusal, not a reckless one).

A commander with high Command Authority (CHA) is better at extracting surrenders. A commander with high Battlefield Intuition (WIS) is better at reading whether they actually need to surrender — or whether they can still fight their way out.

### 10.4 Archetype Morale Thresholds

Bot archetypes have characteristic morale responses that override the DC 15 default in certain directions:

| Archetype | Morale Save Modifier | Retreat Tendency | Surrender Tendency |
|-----------|---------------------|-----------------|-------------------|
| **Warlord** | +0 (Battlefield Intuition 12 = +1) | Will retreat at 60%+ losses | Rarely offers or accepts surrender |
| **Diplomat** | +2 (Command Authority 18 = +4 morale influence) | Retreats early to preserve forces | Offers terms frequently; accepts reasonable offers |
| **Merchant** | +3 (Battlefield Intuition 16 = +3) | Retreats at first sign of unfavourable odds | Accepts surrender readily; troops are expensive |
| **Schemer** | +3 (Battlefield Intuition 16 = +3) | Withdraws tactically when detected | Never surrenders — withdraws before capture |
| **Turtle** | +4 (Battlefield Intuition 18 = +4) | Never retreats from own Star Systems | Defends to destruction at home system |
| **Blitzkrieg** | −1 (Battlefield Intuition 8 = −1) | Almost never retreats (reckless) | Rarely offers or accepts terms |
| **Tech Rush** | +1 (Battlefield Intuition 12 = +1) | Retreats pragmatically | Accepts reasonable offers; forces are valuable |
| **Opportunist** | +3 (Battlefield Intuition 16 = +3) | Retreats when odds shift unfavourably | Adapts to the situation |

---

## 11. Research Doctrine Modifiers in Combat

Research doctrine bonuses are applied at the time of combat resolution. They do not alter base unit stat blocks — they are situational modifiers the Combat System applies based on the combatant's current research state.

### 11.1 Doctrine Bonuses

| Doctrine | Modifier Applied | Condition |
|----------|-----------------|-----------|
| **The Iron Doctrine (War Machine)** | +2 to all attack rolls and damage (Firepower bonus) | Applies to all units of the doctrine holder in any engagement |
| **The Architect's Covenant (Fortress)** | +4 to Deflector Rating | Applies only when the Covenant holder is the **defender** |
| **The Mercantile Accord (Commerce)** | No combat modifier | Commerce doctrine has no battlefield effect |

### 11.2 Specialization Modifiers

| Specialization | Combat Effect | Counter |
|---------------|--------------|---------|
| **Shock Troops** | Surprise Round: acts before initiative is rolled, first round only | Negated by Shield Arrays |
| **Siege Engines** | Ignore 4 points of target DR; +50% damage to Orbital Stations | Countered by Minefield Networks (pre-combat attrition) |
| **Shield Arrays** | Immune to Surprise Rounds; +2 DR when defending | Countered by Siege Engines (bypass DR bonus) |
| **Minefield Networks** | Attacking units make Hull Save DC 15 at engagement start; fail = 10% HP lost | Countered by Shock Troops (Surprise Round clears minefields automatically) |
| **Mercenary Contracts** | +2 Firepower to all units for one engagement (10,000 cr cost) | No counter — economic specialization |
| **Trade Monopoly** | No combat modifier | No counter — economic specialization |

### 11.3 Application Sequence

When multiple modifiers apply, they resolve in this order:
1. Base unit stats (from Military System stat blocks)
2. Research Doctrine bonus (if holder of doctrine)
3. Research Specialization modifier (if applicable to this engagement type)
4. Commander-level modifiers (Strategic Acumen, Battlefield Intuition, Command Authority)
5. Situational modifiers (multi-domain momentum bonus, home system defence, composition bonus)
6. Roll

---

## 12. Bot Combat Behaviour

### 12.1 Attack Decision Framework

Bots evaluate whether to initiate combat each Cycle using an **Attack Desirability Score**:

```
Attack Desirability = Base Aggression
                      + (Military Weight advantage × Strategic Acumen modifier)
                      − (Battlefield Intuition modifier × perceived risk)
                      + Archetype Combat Bias
```

A bot attacks when Attack Desirability exceeds its archetype's **Engagement Threshold** (tuning target per archetype).

### 12.2 Archetype Combat Bias

| Archetype | Combat Bias | Engagement Threshold | Preferred Mode |
|-----------|-------------|---------------------|---------------|
| **Warlord** | +4 | Low — attacks when advantage exists | Fleet Engagement → Ground Invasion |
| **Diplomat** | −3 | High — avoids combat unless provoked or strong advantage | Blockade preferred over invasion |
| **Merchant** | −4 | Very high — almost never initiates | Defensive only |
| **Schemer** | −1 | Moderate — prefers covert over declared combat | Blockade to soften target, then invade |
| **Turtle** | −2 | High — defends aggressively, rarely attacks | Defensive Fleet Engagement only |
| **Blitzkrieg** | +6 | Very low — attacks constantly | Fleet Engagement + immediate invasion, no bombardment |
| **Tech Rush** | 0 | Moderate — attacks when research gives clear advantage | Fleet Engagement + Orbital Bombardment |
| **Opportunist** | +1 | Moderate — attacks weakened targets opportunistically | Blockade + Fleet Engagement |

### 12.3 Retreat Decision

Bots evaluate retreat each round using Battlefield Intuition:

```
Retreat if: current Hull Points < (starting Hull Points × Retreat Threshold)
            AND d20 + Battlefield Intuition modifier ≥ DC 12 (bot recognises threat)
```

The Retreat Threshold varies by archetype (Turtle: never retreats from own Star System; Blitzkrieg: retreats only below 20% Hull Points; Merchant: retreats at 40%).

### 12.4 Bot Combat Messages

**Initiating attack:**
> *Warlord:* "Your defences are inadequate. My fleet moves on [system name] this Cycle."
>
> *Blitzkrieg:* "No warning. No negotiation. 60 Fighters, incoming now."
>
> *Opportunist:* "I noticed your fleet was... elsewhere. Convenient timing."

**During engagement:**
> *Schemer taking heavy losses:* "A tactical repositioning. Not a retreat. There is a difference."
>
> *Diplomat offering terms mid-battle:* "We are both losing ships we cannot easily replace. My offer stands."
>
> *Turtle defending home system:* "You found our fortifications. Now you know why we built them."

**Post-engagement:**
> *Warlord victory:* "[System name] is mine. Your fleet was brave. Rebuilding will take time you do not have."
>
> *Merchant after defending:* "That was expensive for everyone involved. I hope you have learned something."
>
> *Blitzkrieg after loss:* "A setback. I will be back with a larger fleet and less patience."

---

## 13. UI and Player Experience

### 13.1 Combat Preview Panel

Before committing to an engagement, the player sees a preview:

```
┌──────────────────────────────────────────────────────────────┐
│  FLEET ENGAGEMENT PREVIEW — KETH PRIME                        │
├─────────────────────────────┬────────────────────────────────┤
│  YOUR FLEET                 │  DEFENDER (WARLORD EMPIRE)      │
│  Military Weight:  94       │  Military Weight:  78           │
│  Targeting Lock:   +6       │  Targeting Lock:   +8           │
│  Avg. Firepower:  +3        │  Avg. Firepower:  +4            │
│  Deflector Rating: 15       │  Deflector Rating: 17           │
│  Hull Points:      1,850    │  Hull Points:      1,620        │
│                             │                                  │
│  Commander:                 │  Commander (Warlord):           │
│  Strategic Acumen:    14    │  Strategic Acumen:   16         │
│  Battlefield Intuit.: 12    │  Battlefield Intuit.:12         │
│  Command Authority:   16    │  Command Authority:  14         │
├─────────────────────────────┴────────────────────────────────┤
│  Est. Win Probability: 58%     Composition Bonus: +15% ✓     │
│  Defender Advantage: NONE (non-home system)                   │
│  Research Modifier: War Machine +2 Firepower active           │
├──────────────────────────────────────────────────────────────┤
│  [ COMMIT ENGAGEMENT ]    [ IMPOSE BLOCKADE ]    [ WITHDRAW ] │
└──────────────────────────────────────────────────────────────┘
```

### 13.2 Engagement Report

After combat resolves, the player receives a full Engagement Report:

```
ENGAGEMENT REPORT — KETH PRIME  ·  Cycle 34
══════════════════════════════════════════════════════════════
RESULT: ATTACKER VICTORY  ·  Margin: +6 on deciding roll

ROUND 1
  Initiative: Your fleet +7 vs Defender +4  →  You act first
  Attack: d20(14) + Targeting Lock(+6) + Firepower(+3) = 23  vs  DR 17  →  HIT
  Damage: 2d8+3(14) applied to defender Hull Points
  Response: d20(8) + Targeting Lock(+8) + Firepower(+4) = 20  vs  DR 15  →  HIT
  Damage: 1d10+2(9) applied to your Hull Points

ROUND 2
  [Shock Troops Specialization — no effect; defender has Shield Arrays]
  Attack: d20(18) + 6 + 3 = 27  vs  DR 17  →  HIT (Critical Strike)
  Damage: MAX(2d8+3 = 19) + bonus die (d8 = 6) = 25
  Response: d20(3) + 8 + 4 = 15  vs  DR 15  →  HIT (narrow)
  Damage: 1d10+2(7)

ROUND 3
  Defender Morale Check: 52% Hull Points lost  →  DC 15
    d20(9) + Battlefield Intuition(+1) = 10  →  MORALE FRACTURE
    Defender retreats.

FINAL:
  Your losses: 18% Hull Points  ·  8 units destroyed
  Defender losses: 52% Hull Points  ·  22 units destroyed
  Defender withdrew to [origin system]

SPACE SUPERIORITY ESTABLISHED  ·  Choose next action:
  [ Orbital Bombardment ]  [ Ground Invasion ]  [ Impose Blockade ]  [ Withdraw ]
══════════════════════════════════════════════════════════════
```

### 13.3 Star Map Combat Indicators

Active military situations are visible on the star map:
- Engaged Star Systems show crossed-sword icons with attacker/defender empire colours
- Blockaded systems show a chain-link overlay on the system node
- Fleet positions are visible (no hidden movement — see §5.1)
- Combat Readiness indicators show recently-engaged fleets as "regrouping" (reduced Maneuverability modifier for one Cycle post-engagement — tuning target)

---

## 14. Balance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Attacker win rate (equal Military Weight, non-home system) | 47–52% | Slight defender bias; neither side auto-wins at parity |
| Home system assault attacker win rate (equal forces) | 30–40% | Home system should require meaningful superiority to take |
| Composition bonus contribution to outcome | +8–12% effective win rate shift | Diversity should matter, not dominate |
| Research doctrine win rate shift (doctrine only) | +5–8% | Meaningful but not decisive — Specialization is where real asymmetry lives |
| Specialization counter-pick win rate shift | +15–25% | Correctly countering an enemy Specialization should be a significant advantage |
| Morale Fracture frequency (50%+ loss threshold) | <30% of engagements | Most battles should resolve without morale breaking — fracture is for hard fights |
| Surrender uptake at 75% loss threshold | 40–60% of qualified situations | Some empires fight to the end; many accept terms when they should |
| Average rounds per Fleet Engagement | 3–6 | Engagements should feel decisive within a short window, not interminable |
| Blockade economic pressure at Cycle 5 | 30–40% income reduction at target | Enough to hurt; not enough to instantly collapse a developed system |

---

## 15. Open Questions

| # | Question | Context | Options | Status |
|---|----------|---------|---------|--------|
| 15.1 | **Player commander profile** | Player empire needs Strategic Acumen, Battlefield Intuition, Command Authority values. How are these set? | A) Fixed neutral values (14/14/14 — no inherent advantage or disadvantage). B) Chosen at campaign start (pick a commander type). C) Improve through play (start low, increase with victories). Recommendation: B — gives the player a meaningful character choice at campaign start with asymmetric commander identity. | Design decision |
| 15.2 | **Wormhole destruction** | Can a hostile force destroy a Wormhole structure, severing long-range fleet transit? | Yes: Wormholes are military targets; destruction requires a dedicated bombardment operation; reconstruction time = tuning target. No: Wormholes are permanent once built. Recommendation: Yes — destroying a Wormhole is a valid strategic operation that adds a layer of infrastructure warfare. | Design decision |
| 15.3 | **Fragile occupation** | §8.4 notes that winning a Ground Invasion with fewer than 10 surviving Soldiers creates "fragile occupation." What does this mean mechanically? | Fragile occupation: system is owned but Imperial Stability at −20 for 5 Cycles; any attack immediately restores it to the previous owner. Strong occupation: normal transfer. | Design decision |
| 15.4 | **Critical Strike secondary effects** | Natural 20 deals maximum + bonus die. The secondary effect (weapon jam on target) is flagged as a tuning target. What is the canonical secondary effect? | Options: A) Weapon jam: target cannot attack next round. B) Hull breach: additional Hull Point loss equal to Firepower modifier. C) System disruption: target's Deflector Rating reduced by 2 for one round. Recommendation: C — system disruption (DR penalty) is more interesting than silence; creates a meaningful window. | Design decision |
| 15.5 | **Blockade minimum force threshold** | The minimum Military Weight to sustain a blockade scales with Installation count at the target. Exact formula not yet defined. | Recommendation: Minimum = (target Star System Installation count × 5) Military Weight. A 5-Installation system requires 25 Military Weight to blockade; a 2-Installation system requires 10. Values are tuning targets. | Defer to simulation |
| 15.6 | **Unit stat block retroactive update** | MILITARY-SYSTEM.md uses STR/DEX/CON/HP/AC/BAB labels in unit stat blocks (v1.1). Now that canonical sci-fi names are confirmed, those stat blocks should be updated to use Firepower/Maneuverability/Hull Integrity/Hull Points/Deflector Rating/Targeting Lock. | Update MILITARY-SYSTEM.md to v1.2 with renamed stat columns. Low risk — values unchanged, names only. | **Closed** — MILITARY-SYSTEM.md v1.2 + RESEARCH-SYSTEM.md Dreadnought stat block updated. |

---

## 16. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes COMBAT-SYSTEM.md (v2.1). Established canonical sci-fi stat translations: Firepower (STR), Maneuverability (DEX), Hull Integrity (CON) at unit level; Strategic Acumen (INT), Battlefield Intuition (WIS), Command Authority (CHA) at commander level. Established derived stat translations: Hull Points, Deflector Rating, Targeting Lock, Combat Readiness, Hull/Evasion/Morale Saves. Confirmed two-layer stat model (unit-level + commander-level). Confirmed fleet-level D20 resolution (not per-unit rolling). Confirmed three combat modes: Fleet Engagement, Orbital Bombardment, Ground Invasion — Covert Strike removed (redirected to Covert Operations System per PRD). Resolved fleet movement: adjacent = one Cycle action; cross-Sector = Wormhole construction; interception defined. Added commander profiles for all 8 archetypes with Strategic Acumen / Battlefield Intuition / Command Authority values. Added modifier application sequence (base → doctrine → specialization → commander → situational → roll). Added multi-domain momentum bonus (+2 per domain won, max +4). Added blockade mechanics in full. Added surrender opposed roll (Command Authority vs Battlefield Intuition). Removed: REQ-COMBAT specs, implementation file paths, SQL schemas, TypeScript services, React components, migration plan, DraftService (unit draft — not canonical), "Covert Strike" mode (PRD redirects to Covert Operations). All numeric thresholds marked as tuning targets. |
