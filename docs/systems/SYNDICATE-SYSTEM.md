# Syndicate System

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 8 (Covert and Shadow Power), § Achievements (Shadow Throne)
> **Supersedes:** `docs/other/Game Systems/SYNDICATE-SYSTEM.md`
> **Cross-references:** `docs/systems/BOT-SYSTEM.md` §10, `docs/systems/DIPLOMACY-SYSTEM.md` §1.1

---

## Document Purpose

This document defines the complete design of the Galactic Syndicate: what it is, how empires discover it, how they advance within it, how Syndicate control is earned and contested, and how exposure triggers a unique galaxy-wide response.

**Intended readers:**
- Game designers making decisions about the Syndicate's discovery arc, control mechanics, and contract system
- Developers implementing the Syndicate rank engine, influence tracking, and exposure detection
- Anyone resolving a design question about the Syndicate power axis

**Critical design context:** The Syndicate is not a hidden role assigned at game start. It is not a team. It is a galaxy-wide shadow institution that exists independently — and that any sufficiently curious, sufficiently ruthless empire can discover, engage with, and ultimately attempt to control. The entire system is built on **discovery through play**, not disclosure through assignment.

**Design philosophy:**
- **Discovery is earned.** The Syndicate does not announce itself. Empires that investigate anomalies, invest in intelligence, and listen to cryptic signals find it. Empires that don't may never know it exists.
- **Influence buys access; control is the summit.** Syndicate Rank is the Mercenaries model applied to interstellar politics — complete contracts on behalf of the organisation, purchase influence, ascend through tiers of access. Control is what you get at the top.
- **Control can change hands.** The Syndicate does not serve any empire permanently. It serves the empire with the highest Rank. When that changes, control changes.
- **The shadow is never safe.** Using the Syndicate generates observable traces. Staying hidden is an active effort, not a passive state. The longer you hold control, the more the galaxy suspects someone is pulling strings.
- **Exposure triggers something different.** A dominant military empire faces a coalition. An exposed Syndicate controller faces a purge — and those are not the same thing.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [Discovery and First Contact](#3-discovery-and-first-contact)
4. [The Syndicate Rank System](#4-the-syndicate-rank-system)
5. [Syndicate Control and Contested Control](#5-syndicate-control-and-contested-control)
6. [Syndicate Services](#6-syndicate-services)
7. [Contract Catalogue](#7-contract-catalogue)
8. [Counter-Intelligence and Exposure](#8-counter-intelligence-and-exposure)
9. [Bot Engagement with the Syndicate](#9-bot-engagement-with-the-syndicate)
10. [The Shadow Throne Achievement](#10-the-shadow-throne-achievement)
11. [UI and Player Experience](#11-ui-and-player-experience)
12. [Balance Targets](#12-balance-targets)
13. [Open Questions](#13-open-questions)
14. [Revision History](#14-revision-history)

---

## 1. In-World Framing

### 1.1 What the Syndicate Is

The Galactic Syndicate is older than most of the empires in the galaxy. No one knows who founded it, or when. It operates beneath the visible layer of galactic politics — not as a rival nation or an opposing faction, but as a network. Intelligence brokers, black market supply chains, contracted disruption specialists, and a private communications infrastructure that bypasses the Galactic Commons entirely.

The Syndicate does not declare war. It does not sign treaties. It does not appear in Galactic Commons records. It exists in the gap between what empires do openly and what they cannot afford to be seen doing.

**The Syndicate has no ideology.** It does not care who controls it, so long as the contracts are honoured and the network is maintained. An empire that rises to control the Syndicate does not reshape it — they simply become the hand that directs it, until someone else's hand is stronger.

### 1.2 What the Galaxy Knows

Most empires know the Syndicate exists the way most empires know wormholes can be destabilised: as an abstract fact, not an operational reality. They have heard the rumours. They have seen the anomalies — production drops without military cause, fleets reduced by attackers who never appeared on any scanner, research data that somehow reached every rival simultaneously.

A few empires have engaged with the Syndicate at arm's length — purchased information through channels they do not ask about, commissioned operations they could never authorise publicly. These empires know a little more.

Only the rare empire that has invested seriously in covert operations, investigated the anomalies, and followed the cryptic signals to their source has any understanding of the Syndicate's true structure — or that it can be controlled.

### 1.3 The Galactic Commons and the Syndicate

The Galactic Commons (see DIPLOMACY-SYSTEM.md §1.1) operates in full daylight. Every treaty, every declaration, every accusation and reconciliation is registered and publicly visible. The Commons has no jurisdiction over the Syndicate because it cannot formally acknowledge the Syndicate's existence without evidence, and the Syndicate is careful about evidence.

When a Syndicate controller is exposed, however, the Commons becomes the instrument of the galaxy's response. The exposure is filed as a formal Commons record. The coalition that forms in response is not a standard anti-dominance coalition — it is a Commons-sanctioned action against a hidden power, and it carries a different character: every empire that participates signals publicly that it considers the shadow controller a threat to the foundations of galactic order.

### 1.4 In-World Terminology Reference

| In-World Term | Plain Meaning |
|--------------|---------------|
| The Syndicate | The galaxy-wide shadow organisation |
| Syndicate Rank | Engagement tier within the Syndicate (0–8) |
| Syndicate Influence | Points accumulated through contracts and purchases; currency of rank advancement |
| The Veil | The Syndicate's collective counter-intelligence effort — the reason it stays hidden |
| Shadow Broker | A Syndicate contact — the NPC interface through which contracts and services are accessed |
| The Black Register | The Syndicate's black market catalogue |
| Syndicate Lord | The empire currently holding Rank 8 — the controller |
| Contested Ascent | The period when two empires hold the same high rank and control is disputed |
| The Purge | The galaxy's response to a Syndicate controller being exposed — distinct from a standard coalition |
| Syndicate Contract | A disruptive operation commissioned through the Syndicate against a target empire |
| Galactic Commons Dispatch | The publicly visible galaxy-wide event feed (section of the Cycle Report) |

---

## 2. Core Concept

### 2.1 A Power Axis, Not a Hidden Role

The Syndicate is a power axis. Like military power, economic wealth, or research advancement, Syndicate engagement is a strategic lever that changes what an empire can do and how fast it can act. Unlike those axes, it operates in the shadow — its effects are visible, but their origin is deliberately obscured.

**No empire begins the game as a Syndicate member.** There are no loyalty cards. There are no assigned roles. The Syndicate exists at game start as a background institution, conducting its own operations against various empires. Any empire can discover it. Any empire can engage with it. The empire that engages most deeply controls it.

### 2.2 The Mercenaries Model

The progression structure is inspired by the tiered relationship a mercenary organisation uses to vet and develop contractors. You prove your value through small operations. You earn trust. You gain access to more significant tools. You become someone the organisation depends on. And eventually — if you've advanced far enough — you are the organisation's directing hand.

**Syndicate Influence** is the currency:
- Earned by completing Syndicate contracts
- Purchased directly (slower and more expensive, but available)
- Accumulated over time at each rank tier
- Used to advance Syndicate Rank

**Syndicate Rank** is the gate:
- Determines what contracts are available
- Determines what Black Register items can be purchased
- Determines which intelligence services are accessible
- The empire with the highest Rank controls the Syndicate

### 2.3 The Core Loop

```
Discover anomaly in galaxy
       ↓
Investigate through covert ops
       ↓
Accumulate awareness → First Contact event
       ↓
Accept or ignore Syndicate contact
       ↓
Complete Tier 1 contracts → earn Influence → advance Rank
       ↓
Unlock deeper Black Register access and higher-tier contracts
       ↓
Advance toward Rank 8 (Syndicate Lord)
       ↓
Contest or seize control from current leader
       ↓
Hold control while managing exposure risk
       ↓
Shadow Throne: achieve control + another achievement + never exposed
```

---

## 3. Discovery and First Contact

### 3.1 Phase 1 — Observable Anomalies

The Syndicate operates throughout the campaign regardless of whether the player is engaged with it. Its contracts against other empires produce observable effects — and those effects appear in the Galactic Commons Dispatch (the galaxy-wide event section of the Cycle Report) without attribution.

**Syndicate-origin anomalies visible to all empires:**

| Anomaly Type | Visible As in Commons Dispatch | Actual Cause |
|-------------|-------------------------------|-------------|
| Production Disruption | "Empire X reports unexplained production shortfall this Confluence" | Syndicate Sabotage contract |
| Ghost Fleet Strike | "Empire X reports fleet losses — no attacking empire identified" | Syndicate mercenary operation |
| Market Distortion | "Ore prices collapsed unexpectedly across three sectors" | Syndicate market manipulation |
| Research Leak | "Empire X's research progress was circulated anonymously" | Syndicate intelligence leak contract |
| Civil Disturbance | "Empire X reports internal instability of unknown origin" | Syndicate destabilisation contract |
| Cryptic Dispatch | A message in the Commons Dispatch that is addressed to no one and signed by no one | Syndicate testing whether empires are paying attention |

These anomalies are visible to every empire. Most will interpret them as unexplained game events. An empire actively investigating them will find more.

### 3.2 Phase 2 — Active Investigation

Empires with sufficient intelligence infrastructure can investigate anomalies from the Commons Dispatch. Investigation costs Intelligence Points and yields partial information about the anomaly's origin.

**Investigation outcomes (scaled by covert ops investment):**

| Investigation Result | What the Player Learns |
|---------------------|----------------------|
| No finding | The anomaly appears to have natural causes |
| Partial finding | "This appears to have been deliberately engineered by an external actor" |
| Strong finding | "This bears the signature of a coordinated covert operation — not any known empire" |
| Breakthrough | "Multiple anomalies share the same operational signature. Something organised is operating in this galaxy." |

The Breakthrough result is the awareness threshold. Once an empire has accumulated enough correlated investigation results, its awareness crosses the threshold for Phase 3. The player does not see a progress bar — they simply begin to piece it together.

**Awareness threshold** is a tuning target. Design intent: a player who investigates every anomaly should reach the threshold within 2–3 Confluences. A player who ignores anomalies entirely may never reach it.

### 3.3 Phase 3 — First Contact

When the awareness threshold is crossed, a cryptic message arrives in the next Cycle Report — not from any named empire, not through the Galactic Commons, but through an unnamed channel.

**First contact message (example):**

> *You have been asking questions. That is either very intelligent or very dangerous — possibly both. If you are what your investigation suggests you might be, there is a channel worth knowing about. If you are not, you will never find it anyway.*

The message provides no explicit Syndicate identification. It provides a signal — a contact point. The player can:
- **Engage**: Accept the contact, beginning the Syndicate engagement loop. Syndicate Rank advances from 0 (Unaware) to 1 (Curious).
- **Ignore**: The contact window remains open for 3 Cycles. After that, the awareness threshold is partially reset, and the process must restart.

**Subsequent playthroughs**: A player who has discovered the Syndicate in a previous campaign may recognise the anomaly patterns earlier. The awareness threshold does not change, but experienced players know what to look for.

---

## 4. The Syndicate Rank System

### 4.1 Rank Table

| Rank | Title | Influence Required | Unlocks |
|------|-------|--------------------|---------|
| 0 | **Unaware** | — | No Syndicate awareness |
| 1 | **Curious** | First Contact accepted | Anomaly investigation upgrades; cryptic Syndicate signals in Dispatch |
| 2 | **Associate** | 100 | Tier 1 contracts; basic Black Register access |
| 3 | **Operative** | 500 | Tier 2 contracts; Syndicate intelligence services |
| 4 | **Agent** | 1,500 | Tier 3 contracts; strategic disruption tools |
| 5 | **Handler** | 3,500 | Tier 4 contracts; can see other empires' approximate Syndicate Rank |
| 6 | **Director** | 7,000 | Can commission contracts targeting specific empires; full Black Register |
| 7 | **Shadowhand** | 15,000 | Receives intelligence on current Syndicate Lord's identity; Contested Ascent eligible |
| 8 | **Syndicate Lord** | 30,000 | Full control — directs Syndicate operations; Shadow Throne candidacy |

**Influence earning rates (tuning targets):**
- Completing a Tier 1 contract: ~15–25 Influence
- Completing a Tier 2 contract: ~30–45 Influence
- Completing a Tier 3 contract: ~60–80 Influence
- Completing a Tier 4 contract: ~100–120 Influence
- Purchasing Influence directly: Available at all ranks; cost scales with rank (expensive, but available to empires with large credit reserves who prefer to buy rather than complete operations)

### 4.2 Rank Persistence and Loss

Syndicate Rank is earned through accumulated Influence and does not passively decay. However, Rank can be lost through:
- **Counter-intelligence action**: A rival empire's intelligence operation specifically targeting the Syndicate engagement can disrupt the connection, stripping 1 Rank temporarily
- **Contract failure**: Failing a commissioned contract (the operation is traced back) costs Influence and may cause a Rank regression
- **Contested Ascent resolution**: The loser of a Contested Ascent loses 1 Rank

Rank loss never drops an empire below Rank 2 (Associate) unless they are fully exposed (see §8).

---

## 5. Syndicate Control and Contested Control

### 5.1 Who Controls the Syndicate

At any given Cycle, the empire holding the highest Syndicate Rank is the Syndicate Lord — the controller. This determination is dynamic. If a rival empire's Rank surpasses the current controller's, control transfers.

**Control is not a separate status to be claimed — it is the natural consequence of having the highest Rank.** An empire cannot "refuse" to become the Syndicate Lord. The Syndicate recognises the most powerful engaged party as its directing hand.

**What control means:**
- The controller directs which empires receive Syndicate-origin contract operations against them (within the limits of what the Syndicate will do)
- The controller has access to the full Black Register without price penalties
- The controller can see every other empire's Syndicate Rank
- The controller is the only empire that can commission Tier 4 contracts
- The controller is Shadow Throne candidacy-eligible

### 5.2 Contested Ascent

When a rival empire's Syndicate Rank reaches Rank 7 (Shadowhand) — one step below the current Syndicate Lord — a **Contested Ascent** begins.

**During Contested Ascent:**
- The current Syndicate Lord receives an intelligence signal that their position is being challenged (without naming the challenger)
- Both the Lord and the challenger have partial control: the Lord retains priority access; the challenger begins to receive Director-level intelligence
- The Contested Ascent lasts until one of the following occurs:
  - **The challenger completes the next major contract**: They advance to Rank 8 and seize control. The former Lord drops to Rank 7.
  - **The current Lord completes a major contract first**: The challenge is repelled. The challenger is pushed back to Rank 6 (Director).
  - **The challenger is exposed**: Exposure during Contested Ascent collapses their Rank entirely (see §8).

**Multiple challengers**: More than one empire can be in Contested Ascent simultaneously. All are competing for the same top position. The Syndicate itself remains neutral — it serves whoever reaches the summit.

### 5.3 Control Transfer Events

When control transfers between empires:
- The new Syndicate Lord receives no galaxy-wide announcement (the Syndicate does not broadcast this)
- The new Lord receives a private signal in their next Cycle Report — a cryptic acknowledgement
- The former Lord receives a signal that their directing authority has been revoked
- Empires with sufficient intelligence infrastructure may detect that a control transfer occurred — they will know control changed but not necessarily who holds it now

**Control transfers are not exposed by default.** The Syndicate's continued operational value depends on discretion. Only counter-intelligence investigations can reveal the current controller's identity.

---

## 6. Syndicate Services

### 6.1 Service Access by Rank

| Service Category | Minimum Rank | Notes |
|-----------------|-------------|-------|
| Anomaly investigation upgrades | 1 | Improves Phase 2 investigation yield |
| Tier 1 contracts | 2 | Basic operations; low suspicion |
| Basic Black Register | 2 | Intelligence tools; strategic consumables |
| Tier 2 contracts | 3 | Disruptive operations; moderate risk |
| Syndicate intelligence services | 3 | Targeted empire reports |
| Tier 3 contracts | 4 | High-impact operations; significant exposure risk |
| Strategic disruption tools | 4 | Black Register disruption items |
| Rank visibility (others) | 5 | Approximate Syndicate Rank of other empires |
| Tier 4 contracts | 6 | Endgame-tier operations |
| Full Black Register | 6 | All items, no restrictions |
| Commission targeting | 6 | Direct contract targeting |
| Controller identity intelligence | 7 | Know who currently holds Rank 8 |
| Full directorial control | 8 | All Syndicate operations, priority access, no premiums |

### 6.2 Black Register — Intelligence Services

Available from Rank 2. Price premiums apply at lower ranks (the Syndicate charges more for those it trusts less); the controller pays no premium.

| Service | Effect | Risk |
|---------|--------|------|
| **Shadow Report** | Full resource and military snapshot of target empire | Low |
| **Research Echo** | Reveals target's active research doctrine and progress % | Low |
| **Covenant Map** | Reveals all active treaties of target empire | Low |
| **Advance Signals** | Reveals target's planned major action next Cycle | Medium |
| **Syndicate Audit** | Reveals target empire's Syndicate Rank (if any) | Medium |
| **Fleet Trace** | Reveals target's fleet movements for the next 3 Cycles | Medium |

### 6.3 Black Register — Strategic Disruption Tools

Available from Rank 4. These are consumable items, used once, that are unavailable through normal military or diplomatic channels. They are reframed from mass-casualty weapons to strategic disruption instruments appropriate to the game's tone.

| Tool | Effect | Target | Exposure Risk |
|------|--------|--------|--------------|
| **Nexus Disruptor** | Reduces target star system's resource output by 40% for 3 Cycles | Single star system | Low |
| **Warp Interdiction Net** | Blocks all fleet movement to/from target system for 2 Cycles | Single star system | Medium |
| **Ghost Protocol** | Deploys Syndicate mercenary force that appears to originate from a nominated empire — triggers a false-flag military incident | Target empire + false-flag empire | High |
| **Data Wraith** | Erases target empire's active research doctrine progress entirely | Empire | Medium |
| **Resonance Cascade** | Triggers an Imperial Stability collapse in target empire lasting 2 Confluences | Empire | High |
| **Shadow Veil** | Reduces the controller's exposure risk for 5 Cycles — counter-intelligence operations against the controller are suppressed | Self (controller only) | None |
| **Syndicate Stranglehold** | Severs trade routes of a target empire's richest star system for 1 Confluence | Single star system | Medium |

**Price premiums by rank** (tuning targets): Rank 4–5 pay 2× base price; Rank 6–7 pay 1.5×; Rank 8 (controller) pays base price.

---

## 7. Contract Catalogue

Contracts are operations the Syndicate commissions — or that an empire can commission from the Syndicate, at sufficient rank. Completing contracts is the primary way to earn Syndicate Influence and advance Rank. They are **tools, not win conditions.**

Contracts have:
- **Objective**: The specific action to complete
- **Influence Reward**: Syndicate Influence earned on completion
- **Credit Reward**: Economic benefit
- **Exposure Risk**: Suspicion generated against the commissioning empire
- **Tier**: Rank required to access

### 7.1 Tier 1 — Covert Operations (Rank 2+)

Low risk. Low reward. Entry point for new Syndicate engagers.

| Contract | Objective | Influence | Exposure Risk |
|----------|-----------|-----------|--------------|
| **Production Disruption** | Reduce target empire's resource output by 20% for 3 Cycles | 15 | Low |
| **Civil Agitation** | Trigger a minor Imperial Stability drop in target empire | 10 | Low |
| **Market Interference** | Depress a specific commodity price by 25% for 2 Cycles | 20 | Medium |
| **Phantom Raid** | Use Syndicate mercenaries to simulate a pirate attack on target, reducing fleet | 10 | Very Low |

### 7.2 Tier 2 — Strategic Disruption (Rank 3+)

Meaningful impact. Observable effects. Moderate risk of tracing.

| Contract | Objective | Influence | Exposure Risk |
|----------|-----------|-----------|--------------|
| **Intelligence Broadcast** | Distribute target empire's research progress anonymously to all rivals | 30 | Medium |
| **Supply Embargo** | Prevent target empire from completing build queue items for 2 Cycles | 45 | High |
| **False Colours** | Engineer an incident between two empires that appears to be initiated by neither (diplomatic disruption) | 40 | Low |
| **Economic Erosion** | Destroy 20% of target empire's credit reserves | 35 | High |

### 7.3 Tier 3 — High-Impact Operations (Rank 4+)

Significant consequences. High exposure risk. Targeted precisely.

| Contract | Objective | Influence | Exposure Risk |
|----------|-----------|-----------|--------------|
| **Leadership Crisis** | Trigger a severe Imperial Stability collapse in target empire (Fractured status, 3 Cycles) | 70 | Very High |
| **Doctrine Theft** | Transfer target empire's completed research doctrine progress to a rival empire | 65 | Very High |
| **Fleet Ambush** | Syndicate mercenary force destroys 30% of target empire's military | 80 | High |
| **Warlord Contract** | Commission a specific bot-controlled Nemesis empire to target your chosen empire | 75 | Medium |

### 7.4 Tier 4 — Endgame Operations (Rank 6+, Director and above)

Used to reshape the late-game galaxy. Available only to highly-ranked empires.

| Contract | Objective | Influence | Exposure Risk |
|----------|-----------|-----------|--------------|
| **Proxy War** | Engineer conditions that draw two non-allied empires into declared conflict | 100 | Medium |
| **Coalition Fracture** | Introduce distrust into an existing Nexus Compact, increasing dissolution probability by 80% | 110 | High |
| **Singularity Suppression** | Sabotage an empire's research capstone — delays Singularity achievement by 1 Confluence | 120 | Very High |
| **The Convergence** | Simultaneously suppress the three empires closest to achievement thresholds — delays all three by 5 Cycles | 150 | Extreme |

---

## 8. Counter-Intelligence and Exposure

### 8.1 How the Shadow Is Detected

Syndicate engagement is not invisible. Every contract completed, every Black Register purchase, and every Cycle of control held contributes to an empire's **Shadow Signature** — an observable intelligence footprint that rivals can detect through covert operations investment.

**Shadow Signature grows from:**
- Completing contracts (each completion increases signature, scaled by contract tier)
- Holding Syndicate Rank (passive accumulation — the longer control is held, the more traceable it becomes)
- Purchasing Black Register items (each transaction leaves a trace)
- Failed contracts (failure spikes the signature significantly)

**Shadow Signature decreases from:**
- The Shadow Veil disruption tool (direct suppression)
- "Clean" Cycles — doing nothing Syndicate-related
- Spending Influence on counter-intelligence (available at Rank 5+)

### 8.2 Detection Mechanics

A rival empire can attempt to detect Syndicate engagement through their covert operations infrastructure. Detection probability scales with:
- The detective empire's intelligence investment
- The target empire's Shadow Signature (higher = easier to detect)
- How long the target has held control (duration increases detectability)

**Detection outcomes:**

| Detection Level | What the Detecting Empire Learns |
|----------------|--------------------------------|
| No finding | Nothing |
| Weak signal | "Empire X appears to have connections to non-standard supply channels" |
| Confirmed engagement | "Empire X is confirmed to have Syndicate engagement at some level" |
| Rank estimate | "Empire X appears to hold significant influence within the Syndicate" |
| Controller identified | "Empire X is the current Syndicate Lord" (rare; requires sustained investigation) |

Detection results are private to the discovering empire. There is no automatic public announcement.

### 8.3 Exposure — The Public Revelation

Exposure is the formal, public revelation of a Syndicate controller's identity. It differs from detection — detection is private intelligence; exposure is a Commons-registered event.

**Exposure can occur through:**
- A rival empire choosing to publish their detection intelligence to the Galactic Commons (costs Intelligence Points; requires Confirmed Engagement or better detection result)
- A rival empire reaching Rank 7 (Shadowhand) and using their controller-identity intelligence to make a public filing
- An exposed failed contract that directly traces back to the controller in the same Cycle

**When exposure occurs:**
1. The Galactic Commons registers the exposure as a formal public record
2. The Cycle Report includes a galaxy-wide announcement: the exposed empire's Syndicate control is public knowledge
3. The controller's Shadow Signature resets — they cannot hide what is now known
4. A **Purge Coalition** forms (see §8.4)
5. The Shadow Throne achievement is permanently blocked for this game — exposure is the disqualifying condition

### 8.4 The Purge — A Different Kind of Coalition

A Purge Coalition is qualitatively different from the anti-dominance coalitions that form when an empire approaches an achievement threshold:

| | **Standard Anti-Dominance Coalition** | **Purge Coalition** |
|--|--|--|
| **Trigger** | Empire approaching achievement threshold | Syndicate controller exposed |
| **Target logic** | Prevent the most powerful empire from winning | Destroy the hidden hand — regardless of military power |
| **Participation motivation** | Self-preservation | Galactic Commons-sanctioned moral response |
| **Minimum power threshold** | Yes — weak empires may not join | No — even weak empires may participate |
| **Bot archetype response** | Varies by self-preservation logic | Near-universal — the Syndicate is a threat to galactic order even bots without self-preservation motivation respond to |
| **Duration** | Until dominant empire is brought down | Until controller is eliminated or Syndicate engagement fully severed |

A Purge is harder to survive than a standard coalition, because it draws in empires that would not otherwise act. An exposed controller is fighting the galaxy on moral grounds, not strategic ones.

**Design note**: An exposed controller who survives the Purge earns no special achievement — that would incentivise intentional exposure. Surviving the Purge is the outcome, not the reward. The reward for not being exposed is Shadow Throne.

---

## 9. Bot Engagement with the Syndicate

### 9.1 Which Bots Engage

As established in BOT-SYSTEM.md §10:

| Archetype | Engagement Level |
|-----------|----------------|
| **Schemer** | Full engagement — explicitly pursues Syndicate Rank as an achievement path |
| **Merchant** | Partial engagement — uses Black Register intelligence and market manipulation services; does not pursue control |
| **Warlord** | Minimal — will commission a Warlord Contract if at sufficient rank; otherwise ignores |
| **All others** | Unaware — no Syndicate interaction |

### 9.2 Schemer Bots Pursuing Control

Schemer bots (Apex and Tactical intelligence tiers) treat Syndicate control as an explicit achievement path — specifically the Shadow Throne achievement. They pursue Rank advancement actively, completing contracts and purchasing influence in parallel with their standard strategic decisions.

**Schemer bot Syndicate priorities:**
1. Stay hidden — a Schemer values the Shadow Signature management more than most; they prefer low-exposure Tier 1 and Tier 2 contracts over high-exposure Tier 3 operations
2. Advance Rank steadily — regular contract completion rather than sporadic bursts
3. Time the Contested Ascent carefully — a Schemer bot approaching Rank 7 will assess whether the timing is favourable (e.g., not mid-war, not during high-exposure period) before triggering the ascent challenge
4. Use the Syndicate to advance their other achievement paths — a Schemer pursuing Trade Prince will use market manipulation contracts to suppress rivals' economic growth while growing their own

### 9.3 Multiple Schemers

When multiple Schemer bots are in the galaxy, they compete with each other and the player for Syndicate control. This competition is hidden — Schemer bots cannot see each other's exact Rank (only empires at Rank 5+ can see approximate Rank, and only the controller can see exact Ranks). The result is parallel, covert arms races toward the same summit.

The galaxy may go through several control transfers across a long campaign — from Schemer to Schemer, from Schemer to player, from player back to Schemer. This is intended. The Syndicate's directorship is a resource, not a fixed state.

### 9.4 Bot Discovery of the Syndicate

Bot empires discover the Syndicate through the same Phase 1–3 process as the player, with timing determined by their intelligence investment in each Cycle's decision pass. Schemer bots investigate anomalies as a priority. Merchant bots investigate market-related anomalies. Other bots rarely investigate anomalies at all and typically never discover the Syndicate.

---

## 10. The Shadow Throne Achievement

### 10.1 Requirements

Shadow Throne is the rarest and most complex achievement in the game. It requires three simultaneous conditions to be true at the moment of any other achievement trigger:

1. **Syndicate Control**: The player holds Rank 8 (Syndicate Lord) — they are the current controller
2. **Achievement Co-occurrence**: The player triggers any other named achievement (Conquest, Trade Prince, Market Overlord, Cartel Boss, Grand Architect, Singularity, Warlord, or Endurance) in the same Cycle that they hold control
3. **Never Exposed**: The player has never been publicly exposed as the Syndicate Lord at any point in this campaign

If all three conditions are met, Shadow Throne triggers simultaneously with the co-occurring achievement.

### 10.2 Why It's Designed This Way

The Shadow Throne is not awarded for simply reaching Syndicate control. It is awarded for:
- **Reaching control** (investment and patience)
- **Pursuing another achievement simultaneously** (the Syndicate as a means, not an end)
- **Maintaining the veil throughout** (discipline and counter-intelligence)

It is designed to be discovered, not documented. A player reading a walkthrough can understand what it requires. A player who has never heard of it and plays a full campaign will likely trigger it only by accident — if at all. The achievement's existence is not surfaced in the UI until after it has been earned.

### 10.3 Shadow Throne and Bots

A Schemer bot that meets all three conditions earns Shadow Throne as a bot achievement — a galaxy-wide narrative event. When it fires, the galaxy learns only two things: that a Shadow Throne was earned, and by whom. The fact that the empire was a Schemer — or that they had been controlling the Syndicate — is revealed simultaneously. This moment is designed to recontextualise everything the player observed from that empire throughout the campaign.

---

## 11. UI and Player Experience

### 11.1 Before Discovery — Rank 0

The player sees no Syndicate interface. Anomalies appear in the Galactic Commons Dispatch section of their Cycle Report with no Syndicate labelling — they are simply unexplained events. The investigation option for anomalies is available through the standard Covert Operations interface.

### 11.2 First Contact and Rank 1 — The Revelation

First Contact arrives as a special message in the Cycle Report — distinct visual treatment, no sender attribution. The player can accept or decline. On acceptance, a brief in-world acknowledgement appears — no tutorial, no explicit label. The Syndicate does not explain itself. The player begins to understand through engagement.

### 11.3 Active Engagement — Rank 2–7

A new panel becomes accessible from the main interface: the **Shadow Register**. It contains:
- Current Syndicate Rank and Influence progress
- Available contracts (3 active at any time, refreshed on completion)
- Black Register catalogue (filtered by current Rank)
- Shadow Signature indicator (the player's exposure risk — shown as a qualitative signal, not a precise number)
- Intelligence on other empires' approximate Syndicate engagement (visible from Rank 5+)

The Shadow Register should feel like accessing a hidden layer of the galaxy — distinct visual treatment, encrypted aesthetic, never accessible from the main navigation in an obvious way. Players should feel like they found something they were not supposed to find.

### 11.4 Contested Ascent UI

When the player is in a Contested Ascent (either as challenger or as current Lord being challenged):
- A signal appears in the Shadow Register: "Your position within the organisation is being evaluated"
- No explicit naming of the challenger
- The available contracts include one specially flagged as "the determining operation" — completing it resolves the Ascent in the player's favour

### 11.5 Cycle Report — Syndicate Events

Syndicate-related events that appear in the Cycle Report (at appropriate Rank):
- Confirmation of completed contract and Influence earned
- Shadow Signature change (directional only — "your profile has grown" / "your profile has quieted")
- Control transfer signal (private to the new controller and the former controller)
- Contested Ascent initiation signal (private to the Lord and the challenger)
- Exposure (if it occurs — this is the only public Syndicate event in the Cycle Report)

### 11.6 The Exposure Moment

When exposed, the Cycle Report delivers a galaxy-wide announcement — not the player's private Cycle Report, but the Galactic Commons Dispatch that everyone sees. The Purge Coalition formation is announced in the same Cycle. The player's Shadow Register is replaced by a "Burned" status — the Syndicate severs ties with an exposed controller.

The tone should be dramatic and irrevocable. The player understands immediately that something fundamental has changed.

---

## 12. Balance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Discovery rate (players reaching Rank 1 per campaign) | 40–60% | The Syndicate should be discoverable by engaged players but invisible to disengaged ones |
| Control held by Schemer bots at any given midgame Cycle | 30–50% of campaigns | The Syndicate should feel contested; the player shouldn't always be the controller |
| Average Cycles between control transfers in contested campaigns | 15–30 Cycles | Control should be durable but not permanent |
| Shadow Throne achievement rate | <5% of campaigns | The rarest achievement should remain rare |
| Purge Coalition formation rate after exposure | >85% | Exposure should always trigger a severe response |
| Shadow Signature at exposure event | High (>60 of 100) | Players should have meaningful warning before exposure |
| Black Register usage per campaign (active engager) | 3–8 items purchased | Items should be meaningful, not routine |
| Contract completion time (Tier 1) | 1–3 Cycles | Contracts should feel responsive |
| Contract completion time (Tier 3–4) | 5–10 Cycles | High-tier contracts should require planning |

---

## 13. Open Questions

| # | Question | Context | Recommendation |
|---|----------|---------|----------------|
| 13.1 | **Awareness threshold calibration** | How many successful investigations trigger Phase 3 (First Contact)? Too few = trivial discovery; too many = never discovered. | Tuning target: 5–8 correlated breakthrough-level investigations. Establish through simulation. |
| 13.2 | **Purchased Influence pricing** | Buying Influence directly is available but expensive. What is the credit cost per Influence point, and does it scale with Rank? | Design intent: purchasing should always be slower than completing contracts but viable for credit-rich empires. Specific pricing is a tuning target. |
| 13.3 | **Syndicate Rank visibility** | At Rank 5, a Handler can see "approximate" Rank of other empires. Define "approximate" — do they see the exact title, or a tier (low/medium/high)? | Recommend tier-level visibility (low 1–3 / medium 4–6 / high 7–8) rather than exact rank. Exact rank reserved for the controller (Rank 8). |
| 13.4 | **Failed contract mechanics** | The doc states failed contracts spike Shadow Signature and may cause Rank regression. What causes a contract to fail — time expiry, counter-intel interception, or player/bot action? | All three. Define specific failure conditions per contract tier in the implementation spec phase. |
| 13.5 | **Ghost Protocol attribution** | The false-flag tool nominates a specific empire to appear as the attacker. Can the nominated empire dispute this? Can they investigate the false-flag origin? | Yes — this creates a secondary intelligence dynamic. The nominated empire should have an investigation pathway to clear their name, generating a new anomaly for the galaxy to observe. |

---

## 14. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes legacy SYNDICATE-SYSTEM.md entirely. Replaced hidden-role Loyalty Card model with discovery-through-play / influence-rank model. Replaced binary Loyalist/Syndicate faction split with universal engagement axis. Replaced Syndicate-as-victory-condition with Syndicate-as-power-axis and Shadow Throne achievement. Replaced Accusation voting mechanic with counter-intelligence detection. Replaced The Coordinator NPC with Galactic Commons as exposure institution. Replaced Purge vote system with Purge Coalition (distinct from standard anti-dominance coalition). Replaced WMD catalogue with strategic disruption tool catalogue. Introduced Syndicate Rank system (0–8), Contested Ascent mechanic, control-transfer design, and three-phase discovery arc. |
