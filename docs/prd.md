# Nexus Dominion — Product Requirements Document

> **Status:** In Review
> **Version:** 3.0
> **Last Updated:** 2026-03-08
> **Author:** VS7

---

## Executive Summary

Nexus Dominion is a single-player 4X space strategy game that simulates the emergent drama of a living multiplayer world without requiring other players. The player commands one empire in a persistent galaxy alongside up to one hundred bot opponents — each with a distinct personality, emotional state, and relationship memory — who advance, fight each other, form alliances, and accumulate power through the same mechanics available to the player. The game has no forced ending: achievements mark milestones within an ongoing campaign, and each achievement triggers a galaxy-wide response that generates new challenges. For players who want a bounded session, scenario packs provide a defined objective and optional constraints on top of the same engine. The game is complete when a player can launch a campaign, engage meaningfully with the galaxy across multiple play sessions, earn achievements through distinct strategic paths, and experience a simulation that feels genuinely alive.

---

## Overview

Nexus Dominion is best described as **"Crusader Kings meets Eve Online, simulated."** It targets single-player enthusiasts who want strategic depth, emergent narrative, and genuine rivals — without the scheduling demands of multiplayer or the predatory dynamics of live-service games.

The game draws inspiration from Solar Realms Elite (1990), a browser-based BBS game where players competed in a persistent galaxy of multiple players, and from the emergent storytelling of Crusader Kings and the player-driven political economy of Eve Online. The core insight is that the most compelling 4X experiences are social — rivalries, betrayals, alliances, and power struggles — and that these can be fully simulated with sufficiently characterised AI opponents.

The galaxy has two levels of geography. At the strategic level, it is divided into **ten sectors** — geographic regions with distinct characteristics, adjacency relationships, and resource profiles. No empire "owns" a sector; sectors are contested regions where empires compete. At the operational level, each sector contains **25 star systems** — the basic unit of empire ownership. Star systems are the nodes on the star map: individual worlds that empires colonise, build on, fight over, and produce resources from. The galaxy begins with 250 total star systems: 100 claimed (one home system per empire) and 150 unclaimed, available for colonisation from turn one.

Players start with their home system inside one sector alongside roughly nine other empires. The early game is a land rush — claim unclaimed systems in your sector before neighbours do. As unclaimed space runs out, expansion becomes zero-sum: every new system requires colonisation of the last unclaimed worlds, a diplomatic arrangement, or conquest. This geographic structure creates natural phases of play — consolidate your sector, push into adjacent sectors, build wormholes to distant regions, contest galaxy-wide dominance — without scripting them.

The one hundred bot opponents are not uniform: they operate on different **Momentum Ratings** (determining how many actions they take per Cycle relative to the player), belong to one of eight personality archetypes, and maintain relationship memory with each other and with the player. Bosses emerge from this simulation organically — a bot that has eliminated five rivals and operated at a high Momentum Rating for many Cycles becomes genuinely powerful, not because it was designed to be, but because it has had more time and used it.

The galaxy itself is governed by a poorly-understood energy phenomenon called **the Nexus** — the origin of the game's title and the cosmological force around which galactic civilisation has organised itself. Every ten Cycles, the Nexus undergoes a measurable shift called a **Confluence**. During a Confluence, the **Galactic Commons** — the ancient diplomatic institution that interprets Nexus behaviour — formally reassesses the standing of every empire and updates the **Cosmic Order**: the ranked hierarchy that determines initiative and priority for the coming ten Cycles.

---

## The Nexus, the Cosmic Order, and In-World Design Language

### Design Principle: Every Mechanic Has an In-World Name

Game systems are never presented to the player in bare mechanical terms. Turn order is not "you go last because you're winning" — it is the **Weight of Dominion**, a known consequence of Sovereign standing that every empire accepts when they rise. Catchup mechanics are not invisible difficulty adjustments — they are **Nexus Favour**, a phenomenon the lore of the game world explains and that other empires reference in diplomatic communications.

The goal is that a player who has never read a manual can infer *why* things happen from the language the game uses to describe them. Every rule, every threshold, every mechanical event should have a name that belongs to the world of Nexus Dominion — not to the spreadsheet underneath it.

### Design Principle: Combat and Negotiation Resolution Use the D20 System

> **⚠ Pending Decision — Requires Further Design Review**

Nexus Dominion intends to base its combat and potentially its negotiation resolution mechanics on the **d20 System Reference Document (SRD)**, based on the 3.5 era of the D20 System published by Wizards of the Coast under the Open Game License (OGL). This approach follows precedent set by games such as *d20 Modern* and *Star Wars: Saga Edition*, which adapted the d20 core mechanic to non-fantasy genres while retaining the foundational stat structure (STR, DEX, CON, INT, WIS, CHA), derived stats (HP, AC, BAB, saving throws), and resolution model (d20 roll vs. target number).

**Intended scope:**
- All military units defined by D20 stat blocks (STR, DEX, CON, HP, AC, BAB, damage dice)
- Special abilities expressed in D20 language (saving throws, conditional modifiers, unique passive effects)
- Combat resolution (Fleet Engagement, Orbital Bombardment, Ground Invasion) using d20 roll mechanics
- Negotiation outcomes potentially resolved with skill-equivalent checks (CHA-based, with situational modifiers)

**Status:** The OGL text will be located and included in this repository when available. The exact adaptation of D20 mechanics to space-based 4X play (unit scale, fleet aggregation, etc.) requires design review before full commitment. All unit stat blocks in system documents should be written in D20 format as design references; exact values are tuning targets subject to this review.

**Reference:** The D20 SRD and OGL were originally published by Wizards of the Coast. The OGL permits use of the core mechanic in derivative works under specified conditions. Compliance with the OGL terms must be confirmed before the game ships.

### The Nexus

The Nexus is an ancient, incompletely understood energy field that permeates the galaxy. Its origins are contested: some civilisations believe it is the remnant signature of a predecessor civilisation that predates all current empires; others hold that it is simply a measurable property of the universe at galactic scale. What is empirically established is that the Nexus is *reactive* — its measurable properties shift in response to the balance of power across the galaxy. When dominance concentrates in too few empires, the Nexus shifts. When civilisations are diminished, the Nexus appears to allocate priority toward their recovery.

Whether the Nexus is conscious, mechanical, or something else entirely is one of the great unresolved questions of galactic civilisation. The Syndicate claims to have found a way to manipulate it. Most empires simply accept it as the governing physics of political life.

### The Galactic Commons

The Galactic Commons is the ancient diplomatic institution that formed around the interpretation of Nexus behaviour. It is not a government — no empire has ever agreed to be governed — but it is the framework within which all empires conduct diplomacy, sign treaties, declare war, and acknowledge each other's standing. The Commons has no military. Its power is entirely reputational. Violating Commons conventions is legal; it marks you as an empire the galaxy cannot trust.

The Commons maintains the **Cosmic Order**: the formal ranking of every empire in the galaxy, updated at each **Nexus Reckoning**.

### In-World Terminology Reference

| Game Mechanic | In-World Term | In-World Explanation |
|---|---|---|
| One player turn | **Cycle** | A full rotation of action across the galaxy |
| Ten cycles | **Confluence** | The period governed by one state of the Nexus; ends with a Reckoning |
| The 10-cycle recalculation event | **Nexus Reckoning** | The formal moment when the Commons updates the Cosmic Order |
| Power band ranking | **Cosmic Order** | The three-tier standing classification maintained by the Galactic Commons |
| Dominant band (top 20%) | **Sovereign Tier** | Recognised dominant powers — granted prestige, subjected to scrutiny |
| Field band (middle 60%) | **Ascendant Tier** | Empires in active competition — the contested majority of the galaxy |
| Struggling band (bottom 20%) | **Stricken Tier** | Empires in adversity — the Nexus shows them priority; the Commons grants them initiative |
| First-mover advantage for Stricken | **Nexus Favour** | The Nexus actively resists complete collapse of weakened civilisations; concentrated power is believed to destabilise the galactic field |
| Acting last as Sovereign | **Weight of Dominion** | Dominant empires find their every action is anticipated and countered; momentum is greater, but initiative is constrained by the scrutiny dominance attracts |
| Bot advancement rate | **Momentum Rating** | Each empire's inherent expansion velocity — a measure of infrastructure, ambition, and historical trajectory |
| Anti-snowball coalition trigger | **Convergence Alert** | Issued by the Galactic Commons when any empire's standing threatens to destabilise the Cosmic Order; not a command, but a diplomatic signal of enormous weight |
| Achievement threshold approached | **Nexus Signal** | Observable distortion in the Nexus field that indicates an empire approaching a threshold of galactic significance; other empires can sense it before the Commons formalises it |

---

## Goals

1. A player can launch a new campaign, receive embedded onboarding through early sector play, and understand their position in the galaxy without reading a manual.
2. One hundred bot opponents advance via individual turn ratios, producing emergent power dynamics where dominant empires accumulate strength through gameplay rather than scripting.
3. All achievement paths (Conquest, Trade Prince, Market Overlord, Cartel Boss, Grand Architect, Singularity, Warlord, Endurance, Shadow Throne) are simultaneously tracked, accessible through distinct playstyles, and can each be legitimately pursued to completion.
4. The galaxy responds to every major achievement with a specific emergent event — a new threat, a new opportunity, or a coalition — that extends the campaign rather than ending it.
5. Turn processing handles one hundred active empires and produces a resolved game state within acceptable performance targets (defined per phase in the Timeline section).
6. The Syndicate is discoverable through play without upfront explanation; the discovery moment is a meaningful experience, not a tutorial prompt.
7. Scenario packs can define a starting state, a target achievement, and optional constraints without modifying the base engine.

---

## Non-Goals

- **No multiplayer.** The simulation is the multiplayer. No server infrastructure, no player accounts, no live-service features in the base game.
- **No forced time or turn limits in the base campaign.** The game does not end because a turn counter expired. Scenarios may impose constraints; the base campaign does not.
- **No authored narrative arcs.** There is no scripted storyline. Events, rivalries, and alliances emerge from simulation. The game does not direct the player toward a predetermined story.
- **No real-time elements.** The game is strictly turn-based. Bot advancement is measured in actions per player turn, not in real clock time.
- **No tech stack commitment in this document.** Architecture and technology decisions are deferred to the architecture document and will be decided after this PRD is approved.
- **No mobile-first design.** The primary target is desktop browser. Mobile responsiveness is a post-v1.0 consideration.
- **No cloud save or account system in v1.0.** Campaign persistence is local.

---

## User Stories

### Personas

**The Admiral** — Primary persona. A single-player 4X enthusiast who has logged hundreds of hours in Stellaris, Crusader Kings, or Civilization. Wants strategic depth, genuine rivals, and a game that respects their time without being shallow. Does not want to schedule multiplayer sessions or compete with power gamers. Plays in long sessions when available, shorter sessions when not — and wants the game to accommodate both.

**The Challenger** — Wants a defined objective with a clear sense of completion. Prefers curated scenario packs to open-ended campaigns. Measures success by whether they hit the target achievement within the scenario constraints. Will return to the base campaign once they understand the systems.

**The Explorer** — Plays primarily to discover. Delights in finding hidden systems (the Syndicate), understanding emergent dynamics (why a particular bot became the galaxy's dominant power), and uncovering the relationships between systems. Reads event logs, studies bot behaviour, and treats the galaxy as a mystery to be decoded.

### Stories

**Onboarding and Early Game**

- As **The Admiral**, I want to start a new campaign and be guided into my first sector without a mandatory tutorial screen, so that the game feels alive from the first moment rather than administrative.
- As **The Admiral**, I want to see which neighbouring empires are the greatest immediate threats and which are manageable, so that I can make meaningful decisions in turn one.
- As **The Challenger**, I want to select a scenario pack with a defined objective before starting, so that I know what I am working toward from the beginning.

**Mid-Game Expansion and Strategy**

- As **The Admiral**, I want to pursue territorial expansion through multiple means — military conquest, economic acquisition, diplomatic arrangement — so that my playstyle determines my path rather than the game choosing it for me.
- As **The Admiral**, I want to observe other empires fighting each other without my involvement, and see their relative power shift as a result, so that the galaxy feels like a living simulation rather than a static backdrop.
- As **The Admiral**, I want to enter into treaties, form alliances, and join or lead coalitions, and have those choices remembered by the empires I made them with, so that diplomacy has genuine weight.
- As **The Explorer**, I want to discover the Syndicate through play — a reference in an intercepted message, an unusual contract offer, a rumour from a bot contact — so that the discovery feels earned rather than delivered by a tooltip.

**Late Game and Achievements**

- As **The Admiral**, I want to see my progress toward multiple achievement paths simultaneously, so that I can choose which to pursue based on my current position rather than a declaration I made at game start.
- As **The Admiral**, I want the galaxy to react when I approach a major achievement threshold — rivals forming cartels, coalitions mobilising, pirates emerging — so that the final push feels like a climax rather than a formality.
- As **The Admiral**, I want to see when a bot earns an achievement — particularly Grand Architect, if a bot leads the coalition that stops a dominant empire — as a galaxy-wide event, so that the simulation feels as competitive as multiplayer.
- As **The Explorer**, I want to discover that I can control the Syndicate, pursue that path, and understand the risk of exposure, so that the Shadow Throne feels like a hidden depth layer rather than a listed objective.

**Campaign Persistence**

- As **The Admiral**, I want to save my campaign, close the game, and return to exactly the state I left, so that I can play across multiple sessions without losing progress.
- As **The Admiral**, I want each achievement I earn to persist as a title in my campaign record, so that my history in the galaxy is cumulative and meaningful.

---

## Requirements

### 1. Game Loop and Turn Processing

**In-world language:** A single player turn is a **Cycle**. Ten Cycles constitute a **Confluence**. At the end of each Confluence, the **Nexus Reckoning** reassesses empire standings and updates the **Cosmic Order** for the next Confluence.

| Priority | Requirement |
|----------|-------------|
| P0 | Player can submit a Cycle by queuing actions and committing them; the engine resolves all actions and returns an updated game state. |
| P0 | Bot actions are resolved each Cycle according to each bot's Momentum Rating; a bot with a rating of 0.5 takes one action for every two player Cycles, a bot with rating 2.0 takes two actions per player Cycle. |
| P0 | Cycle processing is atomic — the game state is either fully resolved or not committed; partial resolution does not persist. |
| P0 | **The Cosmic Order governs Cycle resolution order.** Empires are sorted into three tiers, recalculated at each Nexus Reckoning (every 10 Cycles): **Stricken** (bottom 20% by power), **Ascendant** (middle 60%), **Sovereign** (top 20%). Within each Cycle, Stricken empires resolve first (**Nexus Favour**), then Ascendant, then Sovereign (**Weight of Dominion**). Within each tier, resolution order is randomised per Cycle. |
| P0 | The Nexus Reckoning fires at the end of every 10th Cycle. It recalculates tier membership using a rolling 5-Cycle average of empire power scores, not the instantaneous score, to prevent single-Cycle oscillation. |
| P0 | The Nexus Reckoning is a surfaced game event — it appears in the turn summary modal and the event log with the updated Cosmic Order. Tier changes for notable empires (player, named rivals, achievement-holders) are called out explicitly. |
| P0 | Cycle processing completes within 5 seconds per Cycle in alpha (100 empires). Target for release is under 1 second. |
| P1 | A turn summary modal (the **Cycle Report**) displays after each committed Cycle, showing: combat outcomes, diplomatic changes, market movements, achievement progress, and galaxy-wide events. If a Nexus Reckoning occurred, the updated Cosmic Order is displayed first. |
| P1 | The full event log of the Cycle is accessible to the player for review after the Cycle Report. |
| P1 | The Cycle counter and current Confluence number are always visible in the HUD (e.g., "Cycle 47 · Confluence 4"). |
| P1 | The HUD shows cycles remaining until the next Nexus Reckoning (e.g., "3 cycles until Reckoning"). |
| P2 | Cycle history is browsable so the player can review how the game state evolved over prior Cycles. |

### 2. Galaxy and Sector System

**Geographic Model:** The galaxy has two tiers. **Sectors** (10 total) are strategic geographic regions — not owned, but contested. **Star Systems** (250 total, 25 per sector) are the basic unit of ownership: individual worlds that empires colonise, build on, and fight over. Holding a majority of star systems within a sector constitutes **Sector Dominance**, which confers strategic bonuses.

**Starting Configuration:** 100 star systems are claimed at campaign start (one home system per empire). 150 star systems are unclaimed and available for colonisation. Per sector: ~10 empires, 10 home systems, ~15 unclaimed systems.

| Priority | Requirement |
|----------|-------------|
| P0 | The galaxy contains 10 sectors and 250 star systems (25 per sector). Sectors are geographic regions; star systems are the unit of ownership. |
| P0 | Each empire starts with exactly one home system inside a starting sector. Home systems cannot be purchased or colonised — only taken by conquest. |
| P0 | The star map displays all 250 star systems as nodes, coloured by controlling empire, grouped visually by sector. Active alliance lines connect allied empires. |
| P0 | Unclaimed star systems (150 at campaign start) can be colonised by any empire; colonisation has a resource cost and a construction time measured in turns. |
| P0 | Sectors have adjacency relationships. Claiming a **border system** (a star system at the edge of a sector) is the prerequisite for expanding into the adjacent sector. |
| P0 | All 250 star systems can be claimed. When unclaimed space runs out, every expansion requires combat, a diplomatic trade, or staying within current holdings. |
| P1 | **Sector Dominance** is achieved by holding 13 or more of the 25 star systems in a sector. Dominance confers resource bonuses and contributes to territorial achievement thresholds. |
| P1 | Sector types produce different resource mixes (e.g. a mineral-rich sector produces more Ore; a populated sector produces more Food and Credits). Strategic value varies across the galaxy. |
| P1 | Wormhole construction creates a direct connection between two specific star systems in non-adjacent sectors. Wormholes require significant resource investment and construction time. |
| P1 | Star system development level is tracked; developed systems produce more resources but cost more to maintain and are more valuable targets. |
| P1 | Empire star system count, sector dominance count, and total controlled territory are visible on the star map and in the empire panel. |
| P2 | Galaxy configuration (sector layout, adjacency graph, resource distribution across star systems) can be procedurally generated with tunable parameters for variety across campaigns. |

### 3. Empire Management

| Priority | Requirement |
|----------|-------------|
| P0 | Each empire tracks five resource types: Credits, Food, Ore, Petroleum, Research Points. |
| P0 | Resources are produced and consumed each turn based on the empire's star systems, their development level, military, and infrastructure. |
| P0 | Military units require maintenance resources each turn; failure to pay maintenance degrades unit effectiveness or causes attrition. |
| P0 | Player can view their full resource ledger: production, consumption, net income per turn, and reserves. |
| P1 | Empire net worth is calculated from resources, territory, military strength, and research level; this figure drives several achievement thresholds. |
| P1 | Civil status system (a measure of internal stability) affects resource income multipliers; overextension or sustained conflict degrades civil status. |
| P1 | Population per star system is tracked; food shortfalls cause population decline, which reduces that system's production capacity. |

### 4. Military System

| Priority | Requirement |
|----------|-------------|
| P0 | Six unit types exist across three domains: Space (fleet units), Orbital (defence platforms and bombardment units), and Ground (troop units). |
| P0 | Military units are produced in a build queue; production takes turns and consumes resources. |
| P0 | Military power is calculated from unit composition and used in achievement tracking and anti-snowball coalition triggering. |
| P1 | Fleet composition affects combat effectiveness; balanced fleets outperform single-type stacks in some contexts. |
| P1 | Military maintenance costs scale with total force size; overextended militaries create economic strain. |
| P2 | Unit upgrade paths are available through the research system. |

### 5. Combat System

| Priority | Requirement |
|----------|-------------|
| P0 | Three distinct combat modes exist: Fleet Engagement, Sector Blockade, and Ground Invasion. Each has different mechanics, risk profiles, and outcomes. |
| P0 | **Fleet Engagement:** Attacking and defending fleets resolve in the space around a contested star system. Outcome is determined by fleet composition, military power, and strategic modifiers. Results produce clear casualty counts and a victor. Fleet victory is required before orbital bombardment or ground invasion can proceed. |
| P0 | **Blockade:** A blockading force seals the trade and supply routes of a target star system without occupying it. Over sustained turns, the blockaded system suffers resource shortfalls, population strain, and military degradation. Blockades can be broken by a relieving fleet. A blockade can target a single system or, with sufficient force, multiple systems within a sector simultaneously. |
| P0 | **Ground Invasion:** Requires prior fleet superiority over the target star system and optionally orbital bombardment. Troop forces engage in surface combat; victory transfers ownership of the star system to the attacker. Orbital bombardment phase is optional but reduces defender troop strength and system defences before ground engagement. |
| P0 | Defender advantage: defending forces at their home system receive a structural bonus to combat effectiveness. |
| P0 | Combat outcomes are reported to the player with enough detail to understand why the result occurred (force comparison, modifiers applied, key moments). |
| P1 | Orbital bombardment is a distinct phase between fleet victory and ground invasion; it reduces defender troop strength and star system defences at the cost of turns and ordnance. |
| P1 | Covert infiltration enables targeted damage (sabotage, assassination, intelligence gathering) without formal declaration of war; see Covert Operations. |
| P2 | Historical combat log is browsable per empire and per star system. |

### 6. Bot AI System

| Priority | Requirement |
|----------|-------------|
| P0 | Each bot is assigned a turn ratio at campaign generation: Fodder (0.5–0.75), Standard (1.0), Elite (1.25–1.5), or Nemesis (2.0). Specific values within each tier are tunable and will be calibrated through simulation. |
| P0 | Each bot belongs to one of eight archetypes: Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist. Archetype determines decision priorities and default behaviour. |
| P0 | Each bot maintains an emotional state (anger, fear, greed, ambition) that modifies decision-making and shifts in response to events. |
| P0 | Each bot maintains relationship memory with every other empire (including the player) — tracking past agreements, violations, conflicts, and favours. |
| P0 | Bots take actions each turn cycle in accordance with their turn ratio; bot-vs-bot conflicts resolve without player involvement. |
| P0 | Bot decisions are deterministic given the same game state (no hidden random seeds that cannot be traced); this supports simulation and debugging. |
| P1 | Four intelligence tiers determine decision quality: Nemesis (highest — adversarial, adaptive), Elite (strategic — goal-tree with personality), Standard (rules-based with archetype flavour), Fodder (weighted random). |
| P1 | Bots pursue achievement paths aligned with their archetype; Warlords pursue military achievements, Merchants pursue economic achievements, etc. |
| P1 | Bots form coalitions against dominant empires independently when self-preservation instincts trigger. |
| P1 | Bot names, titles, and achievement history are surfaced to the player through the star map and event log. |
| P2 | Nemesis-tier bots optionally use an external LLM API for decision generation; the system degrades gracefully to Elite tier behaviour if the API is unavailable. |
| P2 | One hundred distinct bot personas with names, backstories, and behavioural flavour text are included; each feels meaningfully different from others. |

### 7. Diplomacy System

> **Full design:** `docs/systems/DIPLOMACY-SYSTEM.md`

All diplomatic instruments are formally registered with the **Galactic Commons** and are visible to all empires. Violations are witnessed galaxy-wide — not only by the aggrieved party. The three treaty types are defined below; full mechanical rules, reputation formulas, bot integration, and balance targets are in the system design document.

**Treaty Types:**

| In-World Name | Common Name | Summary |
|---|---|---|
| **Stillness Accord** | NAP | Mutual non-aggression. Minimum unit of trust. Opens basic trade access. No military or intelligence obligations. |
| **Star Covenant** | Alliance | Shared destiny. Mutual military defence, 15% trade discount, full intelligence sharing. Publicly visible as Covenant Lines on the star map. |
| **Nexus Compact** | Coalition | Vow with a purpose. Multi-party military action against a declared target. Shared War Chest, combat bonus vs target, path to Grand Architect achievement for the Compact leader. |

**Violation Consequences (summary):**

| Violation | In-World Designation | Reputation Hit | Key Consequence | Recovery |
|---|---|---|---|---|
| Break a Stillness Accord | *Breach of Accord* | −20 | Victim: +25% combat vs you for 10 Cycles | ~20 Cycles |
| Break a Star Covenant | *Covenant Breaker* | −50 | All Covenant members hostile; −60% Covenant acceptance for 30 Cycles | ~30 Cycles |
| Abandon a Nexus Compact | *Compact Traitor* | −40 | All Compact members hostile; −50% Compact leadership acceptance for 50 Cycles | ~50 Cycles |

| Priority | Requirement |
|----------|-------------|
| P0 | Player can propose, accept, and reject all three treaty types: Stillness Accord, Star Covenant, Nexus Compact. All treaties are registered with the Galactic Commons and visible to all empires. |
| P0 | Each treaty type provides defined mechanical benefits (trade discounts, military obligations, intelligence sharing, combat bonuses) as specified in `docs/systems/DIPLOMACY-SYSTEM.md`. |
| P0 | Treaty violations trigger the designated Commons response, the specified reputation penalty, and the victim's combat bonus — applied immediately and galaxy-wide. |
| P0 | Bots respect and violate treaties according to their archetype, emotional state, and strategic situation — not randomly. Schemer-archetype bots are specifically designed to enter Covenants with intent to betray them at a strategically chosen moment. |
| P1 | Reputation is a persistent per-empire score (range and rebuild mechanic defined in the system doc). It affects treaty offer acceptance rates and negotiation terms for all other empires. |
| P1 | Convergence Alert fires when any empire approaches a major achievement threshold; the Commons notifies all empires and invites Nexus Compact formation. |
| P1 | Bots form Nexus Compacts against dominant empires without player prompting, driven by self-preservation instincts and archetype priorities. |
| P1 | Grand Architect achievement is earnable by any empire (player or bot) that leads the Compact which topples the dominant power. Bot Grand Architect events are surfaced as galaxy-wide events in the Cycle Report and event log. |
| P1 | Covenant Lines (active Star Covenants) are visible on the star map as connecting lines between allied empire home systems. Nexus Compact membership is indicated by a distinct visual marker. |
| P2 | Diplomatic communications use bot persona flavour — messages from bots reflect their archetype, emotional state, and relationship history with the player. |
| P2 | Reconciliation mechanic: former Covenant or Compact partners can pursue reputation repair through sustained non-hostile behaviour over multiple Confluences. |

### 8. Research System

| Priority | Requirement |
|----------|-------------|
| P0 | Research advances through eight levels; each level unlocks capabilities and stat improvements. |
| P1 | Research is structured as a draft: the player selects a Doctrine from a limited set of options, permanently forgoing alternatives. Doctrines determine strategic identity. |
| P1 | Three strategic research paths exist (War Machine, Fortress, Commerce) each with a distinct Capstone ability unlocked at full completion. |
| P1 | Completing a full research path to Capstone contributes toward the Singularity achievement. |
| P1 | Research investments provide meaningful capability improvements, not incremental percentage bonuses; each level should change what the player can do. |
| P2 | Bots pursue research paths aligned with their archetype and compete for doctrine availability where applicable. |
| P2 | Capstone abilities are unique and game-changing — they should visibly shift the player's strategic position when unlocked. |

### 9. Market System

| Priority | Requirement |
|----------|-------------|
| P0 | Player can buy and sell resources at market prices that fluctuate based on supply and demand each turn. |
| P0 | Market prices are affected by empire trade activity, blockades, and resource production across the galaxy. |
| P1 | Trade routes form between star systems and generate ongoing income; they can be disrupted by blockades or covert operations. Routes crossing sector borders are more valuable but more exposed. |
| P1 | A Black Market is accessible through Syndicate engagement; it offers prohibited resources and capabilities unavailable on the open market. |
| P2 | Market manipulation is a viable strategy: cornering a critical resource for a sustained period triggers the Cartel Boss achievement conditions. |
| P2 | Anti-manipulation detection: sustained cornering triggers galactic sanctions as an organic galaxy response, not a punitive game mechanic. |

### 10. Covert Operations

| Priority | Requirement |
|----------|-------------|
| P1 | Player can assign agents to covert operations targeting rival empires: espionage (gather intelligence), sabotage (damage infrastructure or military), and elimination (targeted assassination of bot leaders). |
| P1 | Operations carry a detection probability; detected operations trigger diplomatic consequences and may cause declarations of war. |
| P1 | Intelligence operations can reveal information about rival empires: resource levels, military strength, treaty relationships, research progress. |
| P2 | Intelligence operations at sufficient depth can reveal Syndicate affiliation of a rival empire (or expose the player's own affiliation to rivals). |
| P2 | Covert operations are a viable path to territorial weakening without formal military engagement, enabling strategic flexibility. |

### 11. Syndicate System

| Priority | Requirement |
|----------|-------------|
| P1 | The Syndicate exists as a galaxy-wide shadow organisation in every campaign. Its existence is not explained to the player at campaign start. |
| P1 | The player discovers the Syndicate through organic gameplay cues: intercepted communications, unusual contract offers, rumours surfaced through diplomacy or intelligence operations. |
| P1 | Once discovered, the player can engage with the Syndicate for access to the Black Market and covert contracts. |
| P1 | Syndicate contracts offer significant rewards in exchange for activities that may conflict with overt diplomatic relationships. |
| P2 | The player can work toward Syndicate control by completing a sequence of escalating contracts and accumulating influence within the organisation. |
| P2 | Syndicate control is a hidden game state — it is not announced to the galaxy. The controlling empire appears to be a normal participant in galactic politics. |
| P2 | Any empire (player or bot) can potentially uncover another empire's Syndicate affiliation through high-level intelligence operations. |
| P2 | Exposure of Syndicate control triggers a "burn the hidden hand" response from the galaxy — a distinct coalition threat aimed at eliminating the shadow power, qualitatively different from standard anti-snowball coalitions. |
| P2 | Shadow Throne is the prestige achievement for controlling the Syndicate while holding another major achievement — and never being exposed. It is the rarest achievement in the game. |

### 12. Achievement System

| Priority | Requirement |
|----------|-------------|
| P0 | All achievement paths are tracked simultaneously in game state; the player does not declare a single victory path at campaign start. |
| P0 | When any empire reaches an achievement threshold, the achievement is commemorated with a title badge and a galaxy-wide event. The campaign continues. |
| P0 | The galaxy responds to each achievement with a specific emergent event that creates new strategic conditions (see Achievement Table in VISION.md). |
| P1 | Bots can earn achievements; bot achievements are surfaced as galaxy events in the turn summary and event log. |
| P1 | Achievement progress is visible to the player for their own empire across all paths. |
| P1 | Anti-snowball coalitions scale to all achievement paths: economic approach to Trade Prince triggers cartel formation, research approach to Singularity triggers military prioritisation, etc. |
| P2 | Prestige combinations are tracked: Shadow Throne requires Syndicate control plus any other achievement, with no exposure event having occurred. |
| P2 | Earned titles accumulate across the campaign and form a persistent campaign record. |

**Achievement Definitions:**

| Achievement | Trigger Condition | Galaxy State at Trigger (estimated) |
|---|---|---|
| **Conquest** | Holds a dominant share of star systems; sufficient rivals eliminated | ~45 eliminated, ~55 remaining, achiever holds ~80 systems |
| **Trade Prince** | Net worth exceeds nearest rival by a sustained margin | ~25 eliminated, ~75 remaining, achiever holds ~10 high-value systems |
| **Market Overlord** | Controls the majority of high-volume galactic trade hub systems for a sustained period | ~30 eliminated, ~70 remaining, achiever holds ~12 hub systems |
| **Cartel Boss** | Corners a critical resource (holds its producing systems) and sustains it for a defined period | ~18 eliminated, ~82 remaining, achiever holds ~8 critical systems |
| **Grand Architect** | Leads the coalition that topples the dominant power at time of achievement | ~50 eliminated (dominant power drove this), ~50 remaining |
| **Singularity** | Completes a full research path through all eight levels to Capstone | ~20 eliminated, ~80 remaining, achiever holds ~6 well-developed systems |
| **Warlord** | Directly defeats-in-detail a defined number of rival empires; holds every star system taken | ~40 eliminated by achiever, ~55 remaining, achiever holds ~40 systems |
| **Endurance** | Survives a defined number of coalition attempts as the primary target | ~30 eliminated, ~70 remaining, achiever holds ~15 defensible systems |
| **Shadow Throne** | Holds Syndicate control while holding any other achievement; was never exposed | Co-occurs with another achievement's galaxy state |

> **Design Note:** Specific numeric thresholds for each achievement (star system counts, wealth ratios, coalition attempts survived, etc.) will be defined and calibrated through simulation. The galaxy state estimates above were derived by working backwards from expected end-state conditions for each path across a 250-system galaxy with 100 starting empires. They are starting points for simulation, not final values.

### 13. Scenario Pack System

| Priority | Requirement |
|----------|-------------|
| P2 | A scenario pack is a configuration layer that defines: starting galaxy state, target achievement, and optional constraints (turn limits, resource limits, starting handicaps). |
| P2 | The base game engine runs without modification under a scenario configuration. |
| P2 | Scenario packs may include additional code blocks for mechanics not present in the base engine (e.g. a scenario-specific resource type or event). |
| P2 | Completing a scenario earns a scenario-specific badge distinct from base campaign achievements. |
| P2 | Scenario packs are designed to be authored without deep engine knowledge — goals, parameters, and any scenario-specific code. |

### 14. UI and Interface

| Priority | Requirement |
|----------|-------------|
| P0 | The star map is always visible as the primary view. It is never replaced by a full-screen menu or panel. |
| P0 | The star map renders all 250 star systems as individual nodes. Node colour indicates controlling empire (or unclaimed status). Sector boundaries are visible as grouped regions. |
| P0 | All game actions are accessible via slide-in panels that overlay the dimmed star map. Panels are dismissed to return to full map view. |
| P0 | A turn order sidebar or HUD shows current turn number, available action categories, and the commit turn control. |
| P0 | A turn summary modal displays after each committed turn cycle before returning to the star map. |
| P0 | The interface communicates the player's resource state, military strength, star system count, sector dominance count, and achievement progress without requiring navigation to a separate screen. |
| P1 | LCARS aesthetic (Star Trek command console) is applied consistently: panel borders, colour language, typography. |
| P1 | Star system nodes scale visually to reflect the controlling empire's military presence at that system. |
| P1 | Active alliance and coalition lines are visible on the star map as connecting lines between empire home systems. |
| P1 | Unclaimed star systems are visually distinct from claimed ones; their resource type is discoverable via hover or selection. |
| P1 | Events in the event log are filterable (combat, diplomatic, economic, galaxy-wide, Syndicate). |
| P2 | Animated resource counters and combat resolution displays add visual feedback for key moments. |
| P2 | Bot persona flavour is communicated through styled communication panels when interacting diplomatically. |

---

## UI / UX

### Key Screens / Views

1. **Star Map** — The persistent primary view. Displays the galaxy, empire positions, territory, alliances, and relative power. Never leaves view; all other screens overlay it.
2. **Empire Panel** — Slides in when the player selects their empire. Shows resource ledger, military summary, research progress, achievement tracking, and active treaties.
3. **Star System Panel** — Slides in when the player selects a star system. Shows owner, development level, population, resource production, military presence, and available actions (colonise, develop, blockade, invade). Also shows the containing sector's dominance status and adjacency to other sectors.
4. **Sector Overview Panel** — Slides in when the player selects a sector region. Shows all 25 star systems within it, ownership breakdown, dominance status, and which empires are competing for control.
5. **Rival Empire Panel** — Slides in when the player selects a bot empire. Shows known intelligence, relationship status, treaty options, and combat history.
6. **Military Panel** — Slides in for unit management, build queue, and fleet assignment.
7. **Diplomacy Panel** — Slides in for treaty management, reputation display, and coalition status.
8. **Research Panel** — Slides in for research progress, doctrine selection, and capstone status.
9. **Market Panel** — Slides in for resource trading and active trade route management.
10. **Covert Ops Panel** — Slides in for agent assignment and operation management. (Discovered, not upfront.)
11. **Syndicate Panel** — Unlocked through discovery. Slides in for contract management, Black Market access, and (at higher progression) influence tracking. (Hidden until discovered.)
12. **Turn Summary Modal** — Full-screen overlay after each committed turn. Shows combat outcomes, galaxy events, achievement progress, and bot achievement announcements. Dismisses to star map.
13. **Achievement Log** — Persistent record of earned titles and campaign milestones.

### Design Principles

- **The star map is the board.** The game is played in relation to the map at all times. No action should require the player to lose spatial context.
- **Panels are cards.** Information is examined temporarily and returned to context. Panels slide in, serve their purpose, and dismiss.
- **Complexity scales with reach.** The player sees what is relevant to their current position. The full galaxy reveals itself as they expand, not at the start.
- **Every Cycle has weight.** The Cycle commit is a decisive action. The Cycle Report is the payoff. The rhythm of plan → commit → receive should feel satisfying.
- **The galaxy narrates itself.** Combat outcomes, bot achievements, coalition formations, Nexus Reckonings, and Syndicate events are surfaced through the event log and Cycle Report. The player learns the story of the galaxy by playing, not by reading encyclopaedia entries.
- **Every mechanic has an in-world name.** No game system is presented to the player in bare mechanical terms. Turn order is the Cosmic Order. Catchup advantage is Nexus Favour. A power threshold crossed is a Nexus Signal. The UI uses in-world language at all times. Tooltips and help text explain what things *mean* in the world before they explain what they *do* mechanically.

---

## Architecture

> **Note:** Architecture decisions are deferred. The technology stack, persistence model, runtime environment, and component boundaries will be defined in `docs/architecture.md` after this PRD is approved. The requirements above are written to be stack-agnostic.

### Logical Components (Stack-Agnostic)

```
┌────────────────────────────────────────────────────┐
│                  UI Layer                           │
│  Star Map · Slide-in Panels · Turn HUD · Modals    │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│               Game Engine Core                      │
│  Cycle Processor · Combat Engine · Economy Engine   │
│  Diplomacy Engine · Research Engine · Covert Engine │
│  Achievement Checker · Syndicate Engine             │
│  Nexus Engine (Cosmic Order · Reckoning · Signals)  │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│                Bot AI System                        │
│  Turn Ratio Scheduler · Archetype Decision Engine  │
│  Emotional State Engine · Relationship Memory       │
│  (Nemesis tier: optional LLM integration)          │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│               Game State Store                      │
│  Galaxy                                            │
│  ├── Sectors [10] — geographic regions             │
│  │   └── Star Systems [25 per sector, 250 total]  │
│  │       ├── owner: EmpireId | null (unclaimed)   │
│  │       ├── development_level                    │
│  │       ├── population                           │
│  │       ├── resource_profile                     │
│  │       └── is_border_system: bool               │
│  ├── Empires [1..100]                              │
│  │   ├── resources · military · research          │
│  │   └── relationships · achievement_progress     │
│  ├── Bots [100] — momentum ratings · personas · state│
│  ├── Cosmic Order                                  │
│  │   ├── current_cycle · current_confluence        │
│  │   ├── cycles_until_reckoning                   │
│  │   ├── sovereign_tier: EmpireId[]               │
│  │   ├── ascendant_tier: EmpireId[]               │
│  │   └── stricken_tier: EmpireId[]                │
│  ├── Diplomacy — treaties · reputation · coalitions│
│  ├── Market — prices · trade routes · black market │
│  ├── Syndicate — contracts · influence · exposure  │
│  ├── Achievements — per-empire tracking + history  │
│  └── Event Log — full campaign history            │
└────────────────────────────────────────────────────┘
```

### Key Design Decisions (Agreed)

| Decision | Rationale |
|----------|-----------|
| Persistent campaign, no forced ending | Core design identity; avoids session-length artificial constraint |
| Turn-based, not real-time | Player should never feel pressured by clock time; bot advancement is measured in turn ratios, not real time |
| Bot turn ratios as natural selection engine | Organic boss dynamics without scripting; same mechanics as player |
| Achievements as milestones, not terminals | Campaign continues after each achievement; galaxy responds and generates new challenges |
| Syndicate hidden at campaign start | Discovery is part of the experience; unlocks a depth layer for players who find it |
| Ten-sector galaxy (bounded) | Geographic constraint creates phases of play and manageable cognitive load |
| Scenario packs as configuration layer | Single engine; scenarios are goals and parameters, not a separate game |
| The Nexus as cosmological framework | All mechanical decisions have in-world names derived from a consistent lore framework; the player experiences rules as world-behaviour, not game-behaviour |
| Cosmic Order (power band turn ordering) via Nexus Reckoning | Preserves catchup mechanic without single-Cycle oscillation; 5-Cycle rolling average smooths tier transitions; in-world framing makes the mechanic feel earned rather than arbitrary |
| Tech stack deferred | Game design should drive architecture, not the reverse |

---

## Tech Stack

> **Deferred.** To be defined in `docs/architecture.md` after PRD approval. Constraints to carry into the architecture discussion:
> - Persistence: campaign data must survive application close and re-open (database persistence required; local JSON is not sufficient)
> - Performance: turn processing for 100 empires must meet targets defined in Requirements §1
> - Deployment: browser-based primary target; desktop (Electron or equivalent) as secondary
> - LLM integration: Nemesis-tier bots optionally use an external LLM API; system must degrade gracefully without it

---

## API

### External Dependencies

| Service | Used For | Risk |
|---------|----------|------|
| LLM API (provider TBD) | Nemesis-tier bot decision generation | Optional; system degrades to Elite tier if unavailable |

### Internal Interfaces

The game engine exposes the following logical interfaces (implementation form TBD):

- **CycleProcessor.submitCycle(playerActions)** → GameStateDelta
- **CombatEngine.resolve(engagement)** → CombatResult
- **BotAI.generateActions(botId, gameState)** → BotActions
- **NexusEngine.evaluateReckoning(gameState)** → CosmicOrderUpdate (fires every 10th Cycle)
- **NexusEngine.checkSignals(gameState)** → NexusSignal[] (achievement threshold proximity alerts)
- **AchievementChecker.evaluate(gameState)** → AchievementEvent[]
- **SyndicateEngine.processContracts(gameState)** → SyndicateStateDelta
- **GameState.save()** / **GameState.load(saveId)** → persistence operations

---

## Security

- **Auth model:** No user accounts in v1.0. The game is local and single-player.
- **Permissions:** Not applicable (single-user local application).
- **Sensitive data:** LLM API key (if Nemesis bots are enabled). Key must not be embedded in client-side code; handling model to be defined in architecture.
- **Secrets management:** API keys managed via environment configuration; not committed to source control.
- **Compliance:** No PII collected. No server-side storage of user data. Not applicable in v1.0.
- **Save file integrity:** Campaign save files should be validated on load to detect corruption; corrupted saves should fail gracefully with a clear error.

---

## Success Metrics

### Launch Criteria (Internal Alpha)

- A player can start a new campaign, play through at least 50 turns, and reach one achievement via at least two distinct paths.
- Turn processing handles 100 active empires within the 5-second alpha target.
- Bot archetypes are distinguishable — playtesters can identify which archetype a bot belongs to from its behaviour without being told.
- The Syndicate is discoverable through normal play within 30 turns by a player who is looking, and within 60 turns by a player who is not.
- Zero P0 bugs (crashes, data loss, game state corruption).

### Growth Targets (Post-Launch)

- 40% of players who start a campaign return for a second session.
- All nine achievement types are earned by the community within the first month.
- Shadow Throne is earned by at least one player within the first three months.

### Health Signals (Ongoing)

- Turn processing p95 under 1 second at 100 empires (release target).
- Save/load round-trip completes with zero data loss.
- Bot coalition formation triggers appropriately at achievement thresholds (detectable through simulation runs).
- No achievement path is statistically dominant — achievement distribution across campaigns is meaningfully varied.

---

## Testing

### Coverage Targets

- **Unit:** Game mechanics functions (combat resolution, resource calculation, turn processing phases, achievement threshold evaluation) — 90% coverage target.
- **Integration:** Full turn cycle end-to-end; coalition formation trigger; achievement detection and galaxy response; save/load round-trip.
- **Simulation:** Automated 100-turn campaign runs with 100 bots to validate bot behaviour, turn ratio dynamics, and performance targets.

### Critical Test Paths

1. **Full turn cycle:** Player queues actions → commits turn → engine resolves player actions, all bot actions per turn ratio, diplomacy, market, achievements → game state updated → turn summary generated.
2. **Combat resolution (all three modes):** Fleet engagement, blockade (sustained over multiple turns), ground invasion (with and without orbital bombardment phase).
3. **Achievement detection and response:** Each of the nine achievements triggers correctly at threshold; galaxy response event is generated and surfaces in event log.
4. **Coalition formation:** When any empire crosses the dominant power threshold, at least two other empires form defensive agreements within the next three turn cycles.
5. **Syndicate discovery path:** A new campaign run includes detectable Syndicate discovery cues within the expected turn window.
6. **Save/load fidelity:** Campaign saved at turn N and reloaded produces identical game state at turn N+1 as if never saved.

### Definition of Done

- [ ] All P0 requirements implemented and passing critical test paths
- [ ] All P1 requirements implemented and covered by integration tests
- [ ] Simulation runs pass performance targets (5s alpha, 1s release)
- [ ] No open P0 bugs
- [ ] Save/load round-trip verified with no data loss
- [ ] Playtester feedback confirms bot archetypes are distinguishable
- [ ] Playtester feedback confirms Syndicate is discoverable without prompting

---

## Timeline

### Phase 1 — Foundation (Internal Alpha)

**Goal:** The core loop is playable and verifiably fun. A campaign can be started, played through 50+ turns, and produce a first achievement.

**Delivers:**
- Turn processor with all phases (production, combat, market, diplomacy, research, achievement check)
- Galaxy and sector system (10 sectors, adjacency, border expansion)
- Empire management (5 resources, military build queue, civil status)
- Combat system: Fleet Engagement and Ground Invasion (P0 modes)
- Bot AI: all four intelligence tiers, 8 archetypes, turn ratio scheduling, emotional state, relationship memory
- Basic diplomacy (NAP, Alliance, Coalition treaties)
- Research system (8 levels, linear progression — draft mechanic deferred to Phase 2)
- Market system (buy/sell, dynamic pricing)
- Achievement tracking: Conquest, Trade Prince, Warlord (three paths for alpha validation)
- Star map UI, slide-in panels, turn summary modal
- Save/load (local persistence)

**Explicitly deferred from Phase 1:** Blockade combat mode, Covert Operations, Syndicate, Research draft mechanic, full 100 bot personas, LLM Nemesis bots, Scenario packs, all P2 requirements.

### Phase 2 — Core Systems (Closed Beta)

**Goal:** All major game systems are operational. All nine achievement paths can be reached. The game is deep enough for extended campaign play.

**Delivers:**
- Blockade combat mode
- Covert Operations system
- Syndicate system (discovery, engagement, contracts, Black Market)
- Research draft mechanic (Doctrines, Specialisations, Capstones)
- All nine achievement paths active and producing galaxy responses
- Full anti-snowball coalition formation across all achievement types
- Grand Architect achievement earnable by bots; surfaced as galaxy event
- Reputation system and diplomatic memory fully operational
- Wormhole construction
- Full LCARS UI polish

### Phase 3 — Depth Layer (Open Beta)

**Goal:** The deepest systems work correctly. Syndicate control and Shadow Throne are reachable. Bot personas feel genuinely distinct.

**Delivers:**
- Syndicate control path and exposure mechanic
- Shadow Throne prestige achievement
- LLM Nemesis-tier bots (with graceful degradation)
- Full 100 bot personas with names and backstory flavour
- Scenario pack system (configuration layer)
- Procedural expansion arcs triggered by achievements
- Performance tuned to 1-second turn processing target

### Phase 4 — Release (v1.0)

**Goal:** Production-ready. All systems balanced. All achievement paths viable and distinct.

**Delivers:**
- All P0, P1, P2 requirements implemented
- Balance pass across all achievement paths (numeric thresholds calibrated through simulation)
- Full test coverage meeting targets
- Documentation complete (in-game and developer-facing)
- Zero P0/P1 bugs

---

## Open Questions

| Question | Owner | Due |
|----------|-------|-----|
| Tech stack: language, framework, persistence technology, deployment model | VS7 | Before Phase 1 implementation |
| LLM provider for Nemesis-tier bots: external API (Groq, OpenAI) or bundled local model? | VS7 | Before Phase 3 |
| Achievement numeric thresholds: sector % for Conquest, wealth ratio for Trade Prince, etc. | Design + simulation | During Phase 1 balance pass |
| Turn ratio specific values within each tier (simulation-calibrated) | Design + simulation | During Phase 1 |
| Scenario pack authoring format: configuration file schema, supported constraint types | VS7 | Before Phase 3 |
| How are Syndicate discovery cues seeded — random, scripted triggers, or player-action-gated? | VS7 | Before Phase 2 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0–2.1 | 2026-01 to 2026-03 | VS7 | Previous iteration — extensive design docs, no implementation |
| 3.0 | 2026-03-08 | VS7 | Full redesign — persistent campaign, achievement model, bot turn ratios, Syndicate discovery, tech stack deferred |
