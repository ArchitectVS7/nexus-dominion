# Covert Operations System

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` § Requirements 10
> **Supersedes:** `docs/other/Game Systems/COVERT-OPS-SYSTEM.md`

---

## Document Purpose

This document defines the **Covert Operations System** for Nexus Dominion. It provides the framework for non-combat strategic options, allowing empires to engage in espionage, sabotage, and subterfuge. It defines operation types, the agent economy, detection mechanics, and archetype-specific considerations (particularly the Schemer).

**Intended readers:**
- Game designers balancing asymmetric warfare and risk/reward.
- Developers implementing covert mechanics, agent resources, and detection logic.
- Anyone referencing how covert ops interact with diplomacy, combat, and the Cosmic Order.

**Design philosophy:**
- **Asymmetric Warfare:** Covert operations are the primary equalizer, allowing weaker empires to disrupt dominant ones without direct military confrontation.
- **Information is Power:** Reconnaissance and military intelligence gathering are as valuable as direct sabotage.
- **Risk and Consequence:** Operations carry a dual roll system (Success and Detection). Detection always results in diplomatic fallout, ensuring espionage is never truly "free."
- **The Schemer's Domain:** The system is built to support the Schemer archetype's core identity, making them a formidable, persistent threat throughout the campaign.
- **In-World Letigimacy:** Operations are not game mechanics; they represent the clandestine deployment of shadow assets. Detection is an incident recorded by the Galactic Commons.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [The Agent Economy](#2-the-agent-economy)
3. [Operation Mechanics](#3-operation-mechanics)
4. [The Operations](#4-the-operations)
5. [Diplomatic Consequences of Detection](#5-diplomatic-consequences-of-detection)
6. [Bot Covert Behaviour](#6-bot-covert-behaviour)
7. [UI and UX](#7-ui-and-ux)

---

## 1. In-World Framing

### 1.1 The Shadow War

While the Galactic Commons governs the public face of diplomacy and warfare, a silent war is fought constantly in the shadows. Covert operations are deniable actions taken to weaken, manipulate, or steal from rival empires.

When an operation is successful and undetected, the victim only knows they suffered a setback. When an operation is detected, it becomes an "Incident" — a formal violation that causes immediate diplomatic damage and gives the victim grounds for retaliation or reparation demands.

### 1.2 The Syndicate Connection

The Syndicate operates in parallel to empire-directed covert operations. While empires use their own agents, Syndicate missions (see `SYNDICATE-SYSTEM.md`) often involve overlapping goals. The Schemer archetype frequently utilizes both their own covert network and Syndicate connections to destabilize the galaxy.

---

## 2. The Agent Economy

Covert operations require a dedicated resource: **Agents**.

### 2.1 Agent Generation

- Agents are generated primarily by **Government Sectors**.
- Each Government Sector produces a fixed number of agents per Cycle (Target: **+300 agents/Cycle**).
- Building Government Sectors represents a significant strategic choice, as it consumes a Development Slot that could otherwise be used for Commerce, Industry, or Research.
- Agents accumulate in an empire's global pool with no maximum cap.

### 2.2 Agent Consumption

- Every covert operation has an upfront **Agent Cost**.
- Agents are consumed when the operation is *queued*, not when it resolves.
- If an operation auto-fails before the resolution phase (e.g., attempting to steal credits from an empire that is bankrupt), the agent cost is partially refunded (Target: **50% refund**).

---

## 3. Operation Mechanics

Covert operations resolve during **Tier 2 (Living Galaxy)** of the Cycle processing pipeline (see `TURN-MANAGEMENT-SYSTEM.md`), specifically in Phase 8 (Bot Decisions & Covert Ops). Operations are processed in **reverse power order** (weakest empires execute their ops before strongest empires), giving smaller empires a fractional initiative advantage in the shadow war.

Every queued operation undergoes two independent checks: **Success** and **Detection**.

### 3.1 Success Roll

Determines if the operation's effect actually occurs.

`Base Success Rate` (Target: 60%)

**Modifiers:**
- **+ Attacker Agent Advantage:** Bonus representing overwhelming operative numbers (Target: +2% per 100 attacking agents, capped).
- **- Defender Counter-Intelligence:** Penalty based on the defender's total agent pool (Target: -1.5% per 100 defending agents, capped).
- **+ Attacker Intel Level:** Bonus for having recent reconnaissance on the target (+5% per Intel Level).
- **- Defender Security Doctrine:** Penalty if the defender has researched security tech (Target: -10% per tier).
- **+ Archetype Bonus:** Schemers receive an innate success bonus (+10%).

*Note: The final Success Rate is clamped (e.g., between 15% and 85%) to ensure no operation is guaranteed to fail or succeed.*

### 3.2 Detection Roll

Determines if the target discovers *who* launched the operation. Detection is independent of success — an operation can succeed but be detected, or fail and remain a secret.

`Base Detection Risk` (Varies by operation severity — see §4)

**Modifiers:**
- **- Attacker Intel Level:** Better intel reduces the chance of sloppy mistakes (-5% per Intel Level).
- **+ Defender Counter-Intelligence:** Higher defending agent count increases edge-case discovery (+2% per 100 defending agents).
- **+ Defender Security Doctrine:** Security tech raises alarms more effectively (+10% per tier).
- **- Archetype Bonus:** Schemers are harder to catch (-10%).

*Note: Final Detection Chance is also clamped (e.g., between 5% and 75%).*

---

## 4. The Operations

There are 10 distinct covert operations, categorized by intent and risk. Base values (Cost and Detection Risk) are tuning targets.

### 4.1 Intelligence Operations (Low Risk, High Value)

Intelligence operations do not directly harm the target, but provide crucial strategic clarity.

**1. Reconnaissance**
- **Cost:** ~100 Agents
- **Detection Risk:** Very Low (~10%)
- **Effect:** Increases Intel Level against the target (Levels 0 → 3).
  - *Level 0:* Basic stats (Networth, Rank).
  - *Level 1:* Fleet power breakdown, resource stockpiles.
  - *Level 2:* Sector details, current builds, active treaties.
  - *Level 3:* Queued deployments, queued covert ops, research progress.
  - *Intel Decay:* Intel Level automatically drops by 1 every 20 Cycles if not refreshed.

**2. Steal Military Plans**
- **Cost:** ~150 Agents
- **Detection Risk:** Low (~20%)
- **Effect:** Reveals the target's specific combat deployments for the current/next Cycle, including defensive postures and planned attack vectors. Essential before engaging Warlord or fortified Turtle bots.

### 4.2 Economic Sabotage (Moderate Risk, Direct Harm)

**3. Steal Credits**
- **Cost:** ~200 Agents
- **Detection Risk:** Moderate (~25%)
- **Effect:** Siphons a percentage (5-15%) of the target's current treasury. Capped at a maximum absolute value to prevent instant bankruptcy.

**4. Sabotage Production**
- **Cost:** ~300 Agents
- **Detection Risk:** Moderate-High (~35%)
- **Effect:** Substantially delays the execution of the target's current build queues (delays ships, installations, or wormholes by 2-4 Cycles).

**5. Steal Research**
- **Cost:** ~250 Agents
- **Detection Risk:** Moderate (~30%)
- **Effect:** Siphons a percentage of the target's banked (unspent) Research Points. Cannot steal completed Doctrines/Specializations.

**6. Sabotage Infrastructure**
- **Cost:** ~450 Agents
- **Detection Risk:** High (~45%)
- **Effect:** Severely damages 1-3 random sectors in the target empire, halving their output for several Cycles until auto-repaired or manually sped-up with a credit injection.

### 4.3 Social Disruption & Decapitation (High Risk, Strategic Impact)

**7. Incite Rebellion**
- **Cost:** ~350 Agents
- **Detection Risk:** High (~40%)
- **Effect:** Plunges 1-3 random sectors into civil unrest, devastating their production modifiers (e.g., dropping status from Content to Unrest/Rioting). Particularly effective on newly conquered sectors.

**8. Recruit Defectors**
- **Cost:** ~500 Agents
- **Detection Risk:** Very High (~55%)
- **Effect:** Induces 5-10% of the target's Population and Soldier count (ground troops) to defect to the attacker's empire. Does not affect space fleets.

**9. Assassinate Leader**
- **Cost:** ~400 Agents
- **Detection Risk:** High (~50%)
- **Effect:** Inflicts a sweeping, temporary penalty (-10%) to ALL target stats (combat power, income, research generation) for 5 Cycles. Simulates administrative chaos. Non-stacking.

### 4.4 Diplomatic Intrigue

**10. Frame Another Empire**
- **Cost:** ~300 Agents
- **Detection Risk:** Moderate-High (~35%)
- **Effect:** Manufactures a "false flag" incident, making Target A believe Empire B attacked them or broke a treaty. Plunges Target A's reputation toward Empire B, potentially triggering war. *Critically: If detected, the framing empire suffers a catastrophic reputation penalty with BOTH Target A and Empire B.*

---

## 5. Diplomatic Consequences of Detection

Detection overrides any success benefit with immediate, severe diplomatic fallout. It represents tangible proof of hostile action witnessed by the Galactic Commons.

1. **Reputation Hit:** The perpetrator suffers an immediate **-15 Reputation standing** loss with the victim empire. (For "Frame Another Empire," the penalty is applied to both the victim and the framed party).
2. **Treaty Violation:** If the perpetrator and victim hold an active treaty, the detection provides the victim with legal justification to terminate the treaty without suffering the usual withdrawal penalties. The perpetrator is marked as the treaty breaker (with associated severe reputation penalties across the galaxy).
3. **Casus Belli / Incident Response:** The victim is notified of the perpetrator's identity. They may:
    *   **Demand Reparations:** Demand a credit payment (usually 2x the operation cost) under threat of war/blockade.
    *   **Share Intel:** Formally notify their Covenant or Compact allies of the detected breach, cascading the reputation drop across the bloc.
    *   **Retaliate:** Authorize immediate military or covert strikes.

**"Undetected" Operations:** If an operation succeeds or fails without detection, the victim knows the *effect* happened (e.g., "Credits were stolen"), but the perpetrator field remains "UNKNOWN."

---

## 6. Bot Covert Behaviour

Covert operations define how bot archetypes, particularly the Schemer, influence the mid-to-late game power dynamics.

### 6.1 Archetype Usage Summaries

| Archetype | Covert Priority | Preferred Strategy |
|---|---|---|
| **Schemer** | **Highest** | Core gameplay loop. Uses Shadow Network to spam high-impact ops (Assassinate, Frame, Incite Rebellion) to keep rivals weak and break up powerful coalitions. Builds 3-5 Government Sectors early. |
| **Opportunist** | High | Situational theft. Will happily drain credits from rich merchants or steal research from tech leaders when the risk is low. |
| **Warlord** | Moderate | Pre-invasion preparation. Strongly favors "Steal Military Plans" and "Sabotage Production" immediately before launching a Fleet Engagement. |
| **Merchant** | Low | Economic defense. Keeps a solid agent pool for counter-intelligence, occasionally using "Reconnaissance" or stealing credits from weak neighbors. |
| **Blitzkrieg** | Low | Immediate disruption. Uses sabotage only to clear the way for aggressive, rapid expansion. |
| **Diplomat / Turtle / Tech Rush** | Very Low | Primarily defensive. Uses agents for counter-intelligence; rarely initiates hostile operations due to reputational risk (Diplomat) or isolationist tendencies (Turtle/Tech). |

### 6.2 The Schemer's Shadow Network

The Schemer archetype possesses a unique passive ability: **The Shadow Network**.

- **50% Agent Cost Reduction:** All covert operations cost the Schemer half the standard agent value.
- **-10% Detection Modifier:** Innate skill at covering their tracks.
- **Kingmaker Logic:** The Schemer AI specifically evaluates the current leading empire (closest to a victory condition) and targets them relentlessly with Assassinations, Rebellions, and Framing ops to prevent a runaway victory.

---

## 7. UI and UX

### 7.1 Covert Operations Panel

Covert Ops are managed via a dedicated panel accessible from the main interface:

- **Target Selection:** A list of visible empires. Clicking an empire displays current known intelligence (based on the active Intel Level).
- **Agent Tracker:** Prominently displays the current empire-wide agent pool and incoming agents/Cycle.
- **Operation Grid:** Lists the 10 operations. Unavailable operations (due to insufficient agents or tech locks) are grayed out.
- **Risk Assessment:** When an operation is selected, the UI displays explicit calculated values:
    *   **Success Estimate:** e.g., "65% Probable"
    *   **Detection Risk:** e.g., "30% (Moderate Risk)"
    *   *Note: Tooltips provide a breakdown of these calculations so players understand why a mission is risky (e.g., "Target Counter-Intelligence: -15%").*

### 7.2 Detection Alerts

When a player is targeted by an operation, they receive an Incident Alert during the Cycle Report:

- **Undetected Event:** "WARNING: Supply chain disruption! 45,000 credits have vanished from Imperial accounts. The perpetrators covered their tracks."
- **Detected Event:** "INCIDENT DETECTED: Security forces intercepted operatives attempting to sabotage orbital construction. The operatives have been identified as assets of **The Warlord Empire**. Your standing with them has deteriorated."
