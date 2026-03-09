# Bot Intelligence System

> **Status:** Active — Design Reference
> **Version:** 1.1
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 4 (Bot Empire Behaviour), § The Nexus and the Cosmic Order
> **Supersedes:** `docs/other/Game Systems/BOT-SYSTEM.md`

---

## Document Purpose

This document defines the complete design of the Nexus Dominion bot intelligence system: how 99 AI-controlled empires think, behave, communicate, remember, form relationships, and pursue their own ambitions across the persistent campaign.

**Intended readers:**
- Game designers making decisions about bot behaviour, archetype balance, and difficulty
- Developers implementing bot decision logic, memory, and LLM integration
- Anyone resolving a design question about how a specific bot archetype should behave

**Design philosophy:**
- **Bots are characters, not numbers.** Each of the 99 opponents has a name, personality, emotional state, and relationship history. Bots are rivals the player comes to know — not obstacles or pawns.
- **Observable but not transparent.** Players cannot see a bot's archetype label. They deduce personality through observation: how the bot communicates, what it attacks, whom it allies with, when it betrays.
- **Mechanically meaningful emotions.** Emotional states change decision probabilities — they are not flavour. A Vengeful bot is statistically more likely to attack even at strategic cost.
- **Memory creates organic rivalries.** Bots remember significant events and carry that history into future decisions. Betrayal lingers. Gratitude fades more quickly.
- **Bots play to win.** Bots pursue achievements, accumulate territory, form coalitions, and react to the player's power position. They are not scenery. The galaxy is full of agents with goals.
- **Emergent difficulty, not artificial handicaps.** The challenge of the galaxy comes from bot Momentum Ratings and the natural compounding of their decisions — not from hidden resource bonuses or invisible difficulty sliders.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [The Two Axes: Momentum and Intelligence](#2-the-two-axes-momentum-and-intelligence)
3. [Intelligence Tiers](#3-intelligence-tiers)
4. [The Eight Archetypes](#4-the-eight-archetypes)
5. [The Tell System](#5-the-tell-system)
6. [Emotional State System](#6-emotional-state-system)
7. [Relationship Memory](#7-relationship-memory)
8. [Coalition and Alliance Behaviour](#8-coalition-and-alliance-behaviour)
9. [Bot Achievement Pursuit](#9-bot-achievement-pursuit)
10. [Syndicate Awareness](#10-syndicate-awareness)
11. [Communication and Persona](#11-communication-and-persona)
12. [LLM Integration Design](#12-llm-integration-design)
13. [Bot Decision Framework](#13-bot-decision-framework)
14. [UI and Player Experience](#14-ui-and-player-experience)
15. [Balance Targets](#15-balance-targets)
16. [Open Questions](#16-open-questions)
17. [Revision History](#17-revision-history)

---

## 1. In-World Framing

### 1.1 The Ninety-Nine Rivals

The player commands one empire in a galaxy of one hundred. The other ninety-nine are not obstacles, not scripted antagonists, and not difficulty adjustments. They are rivals — each with a name, a history, a personality forged by their archetype, and a memory of every significant interaction they have had with the player and with each other.

When the player encounters a powerful empire at Cycle 80, that empire's power is not scripted. It has resulted from ninety-nine Cycles of decisions — expansion choices, alliance formations, research investments, and betrayals — all executed through the same mechanics available to the player.

**The galaxy feels like a multiplayer game because it is simulated as one.** The bot system is the engine behind that simulation.

### 1.2 What Players Experience

Players observe the 99 rivals through:
- Messages arriving in their diplomatic inbox, with distinct voices shaped by persona
- Bot actions visible on the star map — fleet movements, border changes, new wormhole connections
- Reputation shifts visible through the Galactic Commons record
- The Cosmic Order HUD, showing which empires are ascending and which are collapsing

Players cannot see a bot's archetype label, emotional state, or internal decision log. They read the galaxy by watching it.

### 1.3 In-World Terminology Reference

| In-World Term | Plain Meaning |
|--------------|---------------|
| Nexus Imprint | A permanent memory scar — a major event that a bot never forgets |
| The Chronicle | A bot's full relationship and event history |
| Resonance | A bot's current emotional state amplitude (intensity, 0.0–1.0) |
| Galactic Pulse | A bot-observable galaxy event that may shift behaviour |
| Accord Scar | Permanent reputation penalty resulting from a major treaty violation |

---

## 2. The Two Axes: Momentum and Intelligence

Bot empires are classified across two independent axes. These are orthogonal — they do not determine each other by default, though they may be correlated by game configuration.

### 2.1 Momentum Rating (Action Frequency)

Defined in `docs/systems/TURN-MANAGEMENT-SYSTEM.md` and `docs/VISION.md`. Controls how many effective decisions a bot makes per player Cycle.

| Momentum Rating | Classification | Cycles per Player Cycle |
|----------------|---------------|------------------------|
| 0.5 – 0.75 | Fodder | Acts every other Cycle (or 3 of 4) |
| 1.0 | Standard | Acts every Cycle |
| 1.25 – 1.5 | Elite | Acts every Cycle + probabilistic bonus action |
| 2.0 | Nemesis | Acts every Cycle with guaranteed double action |

The player can observe a bot's Momentum Rating on the star map. It is described using in-world language (see VISION.md), not as a raw number.

### 2.2 Intelligence Tier (Decision Quality)

Controls how sophisticated a bot's decision-making is. Four tiers, in descending capability:

| Working Name | Tier | Decision Engine | Count (100 bots) |
|-------------|------|-----------------|------------------|
| **Apex** | I | LLM-powered — natural language reasoning with persona context | 5–10 |
| **Tactical** | II | Archetype-driven decision trees with full emotional state integration | 20–25 |
| **Reactive** | III | Simple behavioural rules — responds to threats and opportunities | 50–60 |
| **Entropic** | IV | Weighted random decisions — adds genuine unpredictability | 10–15 |

The working tier names (Apex / Tactical / Reactive / Entropic) are internal design terminology. Players never see intelligence tier labels. See Open Questions §16.4 for whether these receive final in-world names.

### 2.3 How the Two Axes Interact

**Momentum Rating determines frequency; Intelligence Tier determines quality. They are fully independent.**

A Nemesis-Momentum bot with Reactive intelligence makes twice as many decisions per Cycle as the player — but those decisions follow simple rules. It is dangerous through relentlessness, not sophistication.

A Standard-Momentum bot with Apex intelligence makes decisions at the player's pace — but those decisions are the most human-like in the galaxy. It is dangerous through insight, not speed.

**Independence is intentional.** The two axes are configured independently at game setup (or galaxy generation). This allows for deliberate outlier bots that would not be possible with a correlated system:
- A Fodder-Momentum / Apex-Intelligence bot: acts rarely, but with devastating precision when it does — a dormant genius that punishes complacency
- A Nemesis-Momentum / Entropic-Intelligence bot: acts constantly but chaotically — a relentless, unpredictable presence that exhausts the player through volume

The simulation is meant to approximate the varied nature of real players. A real multiplayer game would include slow-but-brilliant players and fast-but-reckless ones. The two-axis model replicates this without any player knowing which type they are facing.

**Configuration guidance** (tuning target, not canonical lock):
- Mix all four intelligence tiers across all four momentum classifications
- Avoid clustering Nemesis-Momentum with Apex-Intelligence too heavily — the combination is extremely difficult and should be rare
- Ensure at least a few Fodder-Momentum / Apex-Intelligence outliers — these create memorable late-game surprises

---

## 3. Intelligence Tiers

### 3.1 Tier I — Apex (LLM-Powered)

Apex bots use a large language model to generate decisions and communications. The LLM receives a structured context including the bot's persona, current game state, relationship history, and recent events. It produces decisions and messages in the bot's distinctive voice.

**What LLM enables:**
- Contextually appropriate, non-repetitive natural language messages
- Adaptive strategy that responds to unexpected game states
- Reasoning that reflects persona — a Warlord's LLM response reads differently from a Diplomat's
- Genuine strategic surprises that feel player-like

**Graceful degradation**: If the LLM is unavailable, an Apex bot falls back to Tactical (Tier II) behaviour for that Cycle. The fallback is invisible to the player. Game state is never lost because of an LLM failure.

**Cost discipline**: LLM calls are made once per Apex bot per Cycle (or per decision event). The system is designed to be conservative. LLM calls are not made for routine actions — only for decisions that warrant natural language expression.

### 3.2 Tier II — Tactical (Strategic Decision Trees)

Tactical bots use archetype-driven decision trees with full emotional state and relationship memory integration. They are the workhorse tier — sophisticated enough to feel like real opponents, deterministic enough to be predictable at scale.

**What Tactical enables:**
- Archetype-driven priority weighting across all decision types
- Emotional modifiers that change decision probabilities based on current state
- Coalition formation and treaty management following archetype patterns
- Template-based messaging (30–45 templates per persona) that surfaces distinct voice without LLM cost

**Tactical bots feel predictable to experienced players** — their archetype patterns can be read. This is intentional. The Tell System (§5) makes archetype deduction a player skill.

### 3.3 Tier III — Reactive (Simple Behaviour)

Reactive bots follow basic if/then rules. They respond to immediate threats and obvious opportunities but do not plan ahead.

**Reactive subtypes:**
- **Balanced**: Maintains rough parity across military, economy, and diplomacy
- **Aggressive**: Responds to any perceived weakness with military action
- **Builder**: Prioritises economic development; reluctant to engage militarily

Reactive bots communicate minimally — short, flavourless messages or none at all. They are the galactic background: present, occasionally disruptive, rarely decisive.

### 3.4 Tier IV — Entropic (Weighted Random)

Entropic bots make genuinely random decisions, weighted loosely toward their nominal archetype. They make suboptimal choices. They attack when they shouldn't and retreat when they could win.

**Why Entropic bots exist:**
Predictable bot behaviour creates exploitable patterns. Entropic bots introduce genuine uncertainty — they cannot be gamed because they don't follow a game. They also create the chaos that makes early-game geography interesting: an Entropic bot may attack a Warlord-adjacent empire for no strategic reason, inadvertently creating an opportunity for the player.

Entropic bots rarely communicate. When they do, the message is brief and often non-sequitur.

---

## 4. The Eight Archetypes

Every bot has an archetype that defines its strategic personality, decision priorities, and communication style. Archetypes apply primarily to Tactical and Apex bots. Reactive bots have simplified archetype behavior. Entropic bots ignore archetype almost entirely.

### 4.1 Archetype Overview

| Archetype | Strategic Style | Core Drive | Coalition Role |
|-----------|----------------|-----------|----------------|
| **Warlord** | Military dominance | Territorial expansion and tribute | Aggressive partner or demanding leader |
| **Diplomat** | Alliance network | Peace, stability, mutual benefit | Coalition organiser; often founds them |
| **Merchant** | Economic control | Wealth accumulation and trade leverage | Supporter; funds coalitions, rarely leads |
| **Schemer** | Deception and manipulation | Hidden influence; others doing the work | Infiltrates coalitions; betrays at calculated moment |
| **Turtle** | Defensive consolidation | Survival and resource security | Joins defensive coalitions only; never offensive ones |
| **Blitzkrieg** | Early aggression | Cripple neighbours before they can build | Rarely joins coalitions; acts unilaterally |
| **Tech Rush** | Research advantage | Technological capstone; late-game dominance | Prefers informal partnerships; avoids military commitments |
| **Opportunist** | Vulture strikes | Exploit weakness wherever it appears | Joins coalitions mid-success; abandons them when they struggle |

### 4.2 Decision Priority Matrix

The base probability weight for each action type per archetype. These weights are modified by emotional state (§6) and situational adjustments (§13).

| Action Type | Warlord | Diplomat | Merchant | Turtle | Schemer | Blitzkrieg | Tech Rush | Opportunist |
|-------------|---------|----------|----------|--------|---------|------------|-----------|-------------|
| **Military Attack** | 0.90 | 0.20 | 0.30 | 0.10 | 0.60 | 0.95 | 0.25 | 0.70 |
| **Military Defense** | 0.50 | 0.60 | 0.40 | 0.95 | 0.30 | 0.40 | 0.50 | 0.35 |
| **Diplomacy / Alliance** | 0.30 | 0.95 | 0.70 | 0.50 | 0.80* | 0.20 | 0.45 | 0.55 |
| **Economic Development** | 0.40 | 0.50 | 0.95 | 0.70 | 0.50 | 0.35 | 0.60 | 0.60 |
| **Research** | 0.30 | 0.40 | 0.40 | 0.50 | 0.35 | 0.25 | 0.95 | 0.35 |
| **Covert Operations** | 0.50 | 0.20 | 0.40 | 0.30 | 0.90 | 0.30 | 0.30 | 0.55 |

*Schemer's high alliance priority reflects calculated intent — they seek alliances in order to exploit them.

### 4.3 Archetype Passive Abilities

| Archetype | Passive Ability | Mechanical Effect |
|-----------|----------------|-------------------|
| **Warlord** | War Economy | Military unit cost reduced when at war |
| **Diplomat** | Trade Network | Income bonus per active treaty |
| **Merchant** | Market Insight | Sees next Cycle's Galactic Exchange prices |
| **Schemer** | Shadow Network | Reduced covert operation cost; Syndicate-visible earlier |
| **Turtle** | Fortification | Defensive structures have doubled effectiveness |
| **Blitzkrieg** | First Strike | Combat bonus when attacking an empire that has not yet attacked this game |
| **Tech Rush** | Research Surplus | Surplus research points carry over (no cap) |
| **Opportunist** | Scavenger | Bonus when attacking an empire that has lost >30% military this Cycle |

Passive ability values are tuning targets. The design intent is that each passive reinforces the archetype's strategy without creating mandatory exploitation.

---

## 5. The Tell System

### 5.1 Design Principle

Archetype deduction is a player skill. Experienced players who have watched a bot's communication patterns, alliance choices, and aggression timing can form accurate hypotheses about its archetype. New players encounter the galaxy as inscrutable and learn to read it over time.

**The game never labels bot archetypes.** The player never sees "Admiral Zharkov (Warlord)." They see Admiral Zharkov — and learn to recognise the pattern.

### 5.2 Telegraph Rates by Archetype

The telegraph rate is the proportion of decisions for which the bot sends a behavioural signal readable in advance:

| Archetype | Telegraph Rate | Lead Time | Signal Style |
|-----------|---------------|-----------|--------------|
| **Warlord** | 70% | 2–3 Cycles | Direct threats, tribute demands, scouting messages |
| **Diplomat** | 80% | 3–5 Cycles | Diplomatic overtures, coalition proposals, peace warnings |
| **Turtle** | 90% | 5+ Cycles | Defensive posture statements, non-aggression signals |
| **Merchant** | 60% | 2 Cycles | Trade proposals, pricing pressure, economic signals |
| **Tech Rush** | 50% | 2 Cycles | Research mentions, avoidance of military engagement |
| **Opportunist** | 45% | 1 Cycle | Sudden offers after another empire is weakened |
| **Blitzkrieg** | 40% | 1 Cycle | Minimal; brief warning or none |
| **Schemer** | 30% | 1 Cycle or none | Deliberately mimics other archetypes; cryptic "tells" at low frequency |

### 5.3 Schemer Tells

The Schemer archetype is designed to be difficult — not impossible — to identify. Schemer bots:
- Copy the linguistic style of the archetype they are currently impersonating (often Diplomat or Merchant)
- Include infrequent cryptic signals that experienced players can learn to recognise (unusual phrasing, slightly too-warm openings, brief references to information only a Schemer would have)
- Never produce obvious villain behaviour ("muahaha" energy is a design failure for this archetype)

The frequency of Schemer tells should scale inversely with the bot's Intelligence Tier. An Apex Schemer is nearly undetectable. An Entropic Schemer is erratic and easier to read by accident.

---

## 6. Emotional State System

### 6.1 Overview

Bots have emotional states that mechanically modify their decision probability weights. Emotional states are not cosmetic — they change what bots actually do. A Vengeful bot will attack at strategically suboptimal moments. A Desperate bot will accept alliance terms it would otherwise refuse.

Emotional states are **hidden from the player**. Players infer them from observable signals: message tone, unusual decision patterns, and the Tell System.

### 6.2 Emotional State Table

| Emotional State | Decision Quality | Alliance Tendency | Aggression Tendency | Negotiation Tendency |
|----------------|-----------------|------------------|--------------------|--------------------|
| **Confident** | +5% | −20% | +10% | +10% |
| **Arrogant** | −15% | −40% | +30% | −30% |
| **Desperate** | −10% | +40% | −20% | −20% |
| **Vengeful** | −5% | −30% | +40% | −40% |
| **Fearful** | −10% | +50% | −30% | +10% |
| **Triumphant** | +10% | −10% | +20% | −20% |
| **Neutral** | ±0% | ±0% | ±0% | ±0% |

Modifier values are tuning targets. The design intent: emotional states should produce observable, meaningful deviations from base archetype behaviour without overriding it entirely.

### 6.3 Emotional State Amplitude

Each emotional state has an intensity value from 0.0 to 1.0 (Resonance). At Resonance 0.0, the state is functionally neutral. At Resonance 1.0, the modifier applies at full strength.

```
Effective modifier = base modifier × resonance
```

Resonance decays each Cycle (handled in the Turn Management System's Emotional Decay phase). A bot attacked at Cycle 20 may still be Vengeful at Cycle 25, but with reduced Resonance — and therefore reduced mechanical effect.

### 6.4 State Triggers

| Event | Resulting State | Initial Resonance |
|-------|----------------|------------------|
| Victorious in major battle | Triumphant | 0.8 |
| Significant territorial loss | Desperate (if Stricken) or Vengeful (if not) | 0.7 |
| Treaty betrayal suffered | Vengeful | 0.9 |
| Major achievement reached | Confident or Arrogant | 0.6 / 0.8 |
| Empire at <20% original military | Fearful | 0.9 |
| Sustained dominance (Sovereign for 2+ Confluences) | Arrogant | 0.7 |

Initial Resonance values are tuning targets.

---

## 7. Relationship Memory

### 7.1 Overview

Every bot maintains a Chronicle — a record of every significant interaction with every other empire in the galaxy. This Chronicle informs future diplomatic decisions, emotional states, and coalition willingness.

The Chronicle is bounded. Routine events are pruned over time (see Turn Management System §5.3). Major events resist pruning — some become Nexus Imprints (permanent memories that never decay).

### 7.2 Memory Weight and Decay Resistance

| Event Type | Memory Weight | Decay Resistance |
|------------|--------------|-----------------|
| Saved from elimination by this empire | 90 | Permanent (Nexus Imprint) |
| Treaty violated by this empire | 80 | HIGH |
| Star system captured by this empire | 80 | HIGH |
| Star system liberated by this empire | 70 | HIGH |
| Alliance or coalition co-membership | 40 | MEDIUM |
| Major battle won or lost together | 40 | MEDIUM |
| Trade agreement accepted | 10 | LOW |
| Message exchanged | 1 | VERY LOW |

20% of high-weight negative events become Nexus Imprints — permanent memories that are never pruned, even if the bot's Chronicle is otherwise maintaining its retention window. This creates organic persistent rivalries: a bot whose star system you took at Cycle 15 may still remember it at Cycle 150, not as an angry emotion (which has decayed), but as a cold fact that informs its strategic assessments of you.

### 7.3 Trust Score

Each bot maintains a trust score for every other empire, from −100 to +100. Trust score is derived from the Chronicle using weighted event history:

```
trust_score = sum(memory_weight × sign(positive/negative) × resonance_factor)
```

Trust scores inform:
- Alliance and Nexus Compact willingness
- Betrayal likelihood (Schemer Betrayal Clock in DIPLOMACY-SYSTEM.md references trust score thresholds)
- Coalition formation and dissolution decisions
- Whether a bot will accept or reject diplomatic proposals

**Trust score is not Reputation.** Trust score is a bilateral relationship metric (how much Bot A trusts the player). Reputation is a galaxy-wide signal registered by the Galactic Commons. Both exist as separate variables.

---

## 8. Coalition and Alliance Behaviour

### 8.1 Archetype Coalition Patterns

Coalition behaviour is fully mechanised through the Nexus Compact system (see DIPLOMACY-SYSTEM.md). The following describes the decision disposition each archetype has toward coalitions:

| Archetype | Coalition Formation | Coalition Leadership | Betrayal Likelihood |
|-----------|-------------------|---------------------|-------------------|
| **Diplomat** | Actively seeks; initiates often | High — natural organiser | Very Low |
| **Warlord** | Selective — joins only if partner is strong | Medium — prefers to lead | Low (honor-based) |
| **Merchant** | Supportive — rarely initiates | Low — prefers supporting role | Low |
| **Schemer** | Joins readily; always planning departure | Never openly — controls from within | **Guaranteed** (Betrayal Clock applies) |
| **Turtle** | Joins defensive coalitions only | None | Very Low |
| **Blitzkrieg** | Rarely joins; acts unilaterally | None | Medium (if convenient) |
| **Tech Rush** | Informal partnerships only | None | Low |
| **Opportunist** | Joins when coalition is winning | Medium (opportunistic leadership) | High (abandons losing coalitions) |

### 8.2 Coalition Formation Trigger

Coalitions form organically when bots with overlapping self-preservation interests reach a tipping point. The Galaxy Signals phase of the Cycle pipeline evaluates these conditions each Cycle.

**Key trigger condition**: An empire (player or bot) approaching an achievement threshold is perceived as a threat by all empires whose own achievement paths would be blocked by that empire's success. The closer the approaching empire is to its threshold, the wider the coalition response.

**No scripted coalition spawning**: The system evaluates bot trust scores, relationship memory, and self-preservation logic to determine when a coalition naturally forms. It does not fire a scripted "coalition event" at a fixed threshold.

### 8.3 Schemer Betrayal Clock

Documented in full in `docs/systems/DIPLOMACY-SYSTEM.md` § Bot Diplomatic Behaviour. In summary:
- A hidden betrayal clock begins at Nexus Compact formation for Schemer bots
- Observable pre-betrayal signals exist and can be noticed by attentive players
- The clock is determined at coalition formation, not at game setup

---

## 9. Bot Achievement Pursuit

### 9.1 Bots Play to Win — Explicitly

Bots actively pursue achievements, exactly as a player would. This is not emergent side-effect behaviour. Each bot tracks its progress toward all nine achievement paths and makes explicit strategic decisions to advance the paths most aligned with its archetype.

**How explicit pursuit works:**
- Every bot maintains an internal progress estimate for each of the nine achievement paths
- Each Cycle, the bot's decision framework weights available actions by how much they advance its leading achievement paths
- A Merchant bot that is 60% of the way to Trade Prince threshold will prioritise economic actions over military ones — not because it's a Merchant, but because Trade Prince is the closest achievement and advancing it is now an explicit goal
- As a bot gets closer to an achievement threshold, its decisiveness increases — it will accept more risk, pursue more aggressive diplomacy, and spend resources it might otherwise conserve

**Why explicit, not emergent**: The galaxy is meant to feel like a real multiplayer game. Real players don't accidentally accumulate toward victory — they pursue it deliberately, adapt their strategy as they close in, and make choices the whole galaxy can observe and respond to. Bots that do the same create genuine multi-front tension.

### 9.2 Bots Can Earn Achievements

The Achievement Check phase evaluates all empires — bots and player equally. A bot that earns an achievement is treated with the same narrative weight as a player achieving one.

**When a bot earns an achievement:**
- The galaxy registers it publicly — Cycle Report, Galactic Commons record, galaxy-wide communication from the achieving bot
- The bot receives a title and permanent campaign entry
- The galaxy responds immediately — coalition formation logic re-evaluates with this bot as the new dominant threat
- If a bot earns **Grand Architect** (led the coalition that brought down the dominant power), that bot becomes the next empire under the galaxy's scrutiny — every other empire pivots its attention to the new threat

**A campaign where a bot earns an achievement before the player is a legitimate, intentional outcome.** It is not a failure state. It creates a new strategic context: does the player compete for the next achievement faster, join the coalition against the dominant bot, or exploit the chaos of a galaxy reorganising around a new power?

### 9.3 Achievement Path Disposition by Archetype

| Archetype | Natural Achievement Paths | Avoided Paths |
|-----------|--------------------------|---------------|
| **Warlord** | Conquest, Warlord | Trade Prince, Singularity |
| **Diplomat** | Grand Architect, Endurance | Cartel Boss, Warlord |
| **Merchant** | Trade Prince, Market Overlord, Cartel Boss | Conquest |
| **Schemer** | Shadow Throne, Cartel Boss | Grand Architect (too visible) |
| **Turtle** | Endurance | Conquest, Warlord, Cartel Boss |
| **Blitzkrieg** | Warlord (early kills) | Trade Prince, Singularity |
| **Tech Rush** | Singularity | Conquest, Warlord |
| **Opportunist** | Trade Prince, Warlord (late) | Grand Architect |

---

## 10. Syndicate Awareness

### 10.1 Bots and the Syndicate

The Syndicate is introduced to the player as a discovery (see VISION.md). Bots have varying awareness of the Syndicate's existence and controllability, based on their archetype:

| Archetype | Syndicate Awareness Level | Engagement |
|-----------|--------------------------|------------|
| **Schemer** | Full — knows the Syndicate exists and is controllable | Actively pursues Syndicate control as a strategic goal |
| **Merchant** | Partial — aware it exists; views it as a market tool | Uses black market access; does not pursue control |
| **Warlord** | Minimal — knows it exists; treats it as a threat variable | Ignores it unless directly impacted |
| **All others** | Unaware — does not interact with Syndicate systems | No engagement |

### 10.2 Schemer Bots Pursue Syndicate Control

Schemer bots with sufficient intelligence capability (Apex or Tactical tier) treat Syndicate control as an explicit achievement path. It functions identically to how the player pursues the Shadow Throne — the Schemer accumulates influence within the Syndicate network over time, ultimately seizing control if it goes unchallenged.

**This means Syndicate control can change hands.** The Syndicate is not a one-time acquisition. If the player holds Syndicate control and a Schemer bot accumulates sufficient influence, it can wrest control away — triggering a change of power within the shadow organisation. Conversely, the player can reclaim control from a Schemer bot that holds it.

**Implications:**
- The Shadow Throne achievement requires holding Syndicate control *while* holding another achievement simultaneously — not merely achieving control once
- If a Schemer bot holds Syndicate control when the player achieves something, the Schemer is the current Shadow Throne candidate, not the player
- Multiple Schemer bots may compete with each other and the player for Syndicate control throughout the campaign
- Syndicate control changes should be significant, low-frequency events — not routine oscillation. The Syndicate System document will define the specific mechanics of how control is accumulated and contested

### 10.3 Detecting Syndicate Control

Any empire — player or bot — holding Syndicate control can be detected through sufficiently active intelligence operations. Detection probability scales with:
- The detecting empire's covert operations investment
- The number of Confluences the target has held Syndicate control (longer control = more detectable over time)
- The controlling empire's own intelligence counter-measures

**When a bot detects Syndicate control (player-held or another-bot-held):**
- It does not immediately broadcast the discovery — that would be strategically premature
- A Schemer bot uses the knowledge as leverage or as a trigger to compete for control
- A Diplomat bot escalates to coalition formation against the controlling empire
- A Warlord bot incorporates it into its threat model and may act militarily
- A Merchant bot factors it into trade and black market decisions

Full detection, counter-intelligence, and exposure mechanics are defined in the Syndicate System document.

---

## 11. Communication and Persona

### 11.1 The 100 Unique Personas

Every bot in the galaxy has a distinct persona: a name, a background, a voice, and a set of message templates shaped by that voice. No two personas share the same speaking style.

**Persona components:**
- **Name and title** — unique within the galaxy; conveys cultural flavour
- **Voice descriptors** — tone, recurring verbal quirks, vocabulary preferences
- **Message templates** — 30–45 messages per persona across all message categories (greeting, battle, diplomacy, trade, betrayal, alliance, endgame)
- **Phrase deduplication** — within a single game, the same persona does not repeat the same message verbatim

**Design intent**: Personas stored as data, not hardcoded. The system should support adding new personas without touching game logic.

### 11.2 Message Categories

Each persona has templates for:
- Greeting / first contact
- Trade offer / counter-offer
- Alliance proposal (Stillness Accord, Star Covenant)
- Nexus Compact invitation
- War declaration / warning
- Battle taunt / victory gloat
- Defeat acknowledgement
- Betrayal revelation (for Schemers and trust_score < −50 situations)
- Endgame address (when approaching or achieving a milestone)
- Coalition coordination (internal coalition messages)

### 11.3 LLM Communication vs. Template Communication

**Apex bots** use LLM-generated messages for high-stakes communications and any message that requires contextual reasoning. Template messages are used for routine communications to conserve API calls.

**Tactical bots** use templates exclusively. The templates are persona-specific and emotionally modulated — a Vengeful Tactical bot selects from its "hostile" template set, not its "neutral" set.

**Reactive and Entropic bots** communicate minimally, using the shortest templates.

### 11.4 Sample Personas

**Admiral Zharkov** (Warlord)
> Background: Rose through the ranks of a conquered empire and eventually overthrew its leaders. Respects only demonstrated strength. Has never lost a battle he initiated.
> Voice: Direct, commanding. Military metaphors. Addresses others by rank. Never apologises.
> Sample message: *"Commander. I have watched your expansion for four Confluences. You are not weak. But you are in my path. Move, or be moved."*

**Ambassador Velara** (Diplomat)
> Background: From a small empire that survived three generations by making itself indispensable to larger powers. Genuinely believes in the Galactic Commons as an institution.
> Voice: Formal and measured. Proposes compromises. Warns rather than threatens. Uses "we" more than "I."
> Sample message: *"I bring a proposal that requires only that we both continue to exist. I believe that goal aligns well enough. Shall we discuss terms?"*

**The Broker** (Schemer)
> Background: No verified origin. No confirmed name. Has been reported dead twice. Currently operates under this persona.
> Voice: Warm — too warm. Between-the-lines implications. "Nothing personal, just business." Casually reveals that it knows things it shouldn't.
> Sample message: *"Between you and me — and I mean that sincerely — the empire to your north is not as stable as it appears. I happen to know this. I thought you should too. No obligation."*

### 11.5 Endgame Drama Communications

When a galaxy-wide threshold is approaching — any empire (player or bot) closing in on an achievement — certain archetypes generate global communications that the entire galaxy sees:

```
[Global / Warlord approaching Conquest threshold]
"The time for politics has passed. The galaxy will remember who stood —
 and who fell."

[Global / Diplomat organising coalition against dominant empire]
"Attention, commanders. What you do in the next ten Cycles determines
 whether any of us have a galaxy left to govern. I am proposing a
 temporary ceasefire among all remaining powers. Together."

[Global / Schemer post-achievement reveal]
"You all trusted me. Every single one of you, at one point or another.
 And while you were watching each other — the galaxy changed hands.
 Thank you for a fascinating campaign."
```

---

## 12. LLM Integration Design

### 12.1 Design Intent

LLM integration exists to make the Apex intelligence tier feel qualitatively different from scripted bots — not better at the same things, but capable of things scripted bots cannot do: contextual reasoning, non-repetitive natural language, and adaptive strategy.

**What LLM is used for:**
- Generating in-character messages for high-stakes moments (war declarations, alliance proposals at pivotal Cycles, endgame communications)
- Making strategic decisions in ambiguous situations where archetype decision trees return ambiguous results
- Producing "reasoning" that can be surfaced in the decision audit (God Mode) post-game

**What LLM is not used for:**
- Routine decisions (build queue management, basic resource allocation) — too expensive, too slow
- Tier II–IV bots — not in scope

### 12.2 Graceful Degradation

LLM availability is never assumed. At any point, an Apex bot must be able to fall back to Tactical (Tier II) behaviour for any Cycle in which the LLM is unavailable. The fallback must be invisible to the player and must not cause any game state inconsistency.

**Fallback chain (design intent — specific provider selection is an open question, §16.2):**
1. Primary LLM provider
2. Secondary LLM provider
3. Tier II Tactical scripted behaviour

The game should function fully and remain enjoyable if LLM is never available. LLM enhances the experience; it does not underpin it.

### 12.3 LLM Context Structure

The context provided to the LLM for each Apex bot decision should include:

- **Persona definition**: Name, archetype, voice descriptors, key personality traits
- **Current game state**: Cycle number, Confluence, Cosmic Order standing, star systems held, military strength, resource position
- **Relationship summary**: Active treaties (with in-world treaty names), trust scores for the top 5 relevant empires, recent significant events
- **Emotional state**: Current state and Resonance level
- **Achievement proximity**: Which achievement paths this bot is closest to, and which the player is closest to

The LLM is asked to respond with: a primary strategic action, any communications to send, and a brief reasoning statement (for God Mode logging).

### 12.4 Rate Management

LLM calls per game should be managed to keep costs predictable. Specific rate limits and daily spend caps are implementation decisions, not design canon. The design constraint is: LLM calls should be used sparingly enough that a full campaign of 200+ Cycles with 5–10 Apex bots remains economically viable to operate.

---

## 13. Bot Decision Framework

### 13.1 Decision Loop (Design Level)

Each Apex and Tactical bot follows this decision loop every Cycle they are active (subject to Momentum Rating, see Turn Management System §7):

**1. Gather State**
- Own empire position: resources, star systems, military strength, Cosmic Order band
- Relationship Chronicle: trust scores, active treaties, recent significant events
- Galaxy-wide state: Cosmic Order standings, approximate achievement proximity of key rivals, Galactic Exchange prices

**2. Assess Situation**
- Threat assessment: which empires can attack, and which have reason to?
- Opportunity assessment: which empires are weak and targetable?
- Economic assessment: is resource growth adequate? Any critical deficits?
- Alliance health: are active treaties secure or at risk?
- Achievement proximity: how close is this bot to its natural achievement paths?

**3. Strategic Decision**

Decision weight formula:

```
action_weight = base_priority(archetype) × emotional_modifier(state, resonance) × situational_adjustment
final_action = highest weighted action from available options
```

Tier I (LLM): the above framework informs the LLM context; the LLM produces the final decision.
Tier II (Tactical): the formula is evaluated computationally per available action.
Tier III (Reactive): simplified — threat response rules override the priority matrix.
Tier IV (Entropic): weighted random; base_priority is replaced with a near-uniform distribution.

**4. Execute Actions**

Bot actions commit through the same game systems as player actions — there is no separate "bot execution" path. A bot attacking a star system uses the same combat resolution as a player attacking one.

**5. Log and Update**

The bot's Chronicle is updated with the outcome of this Cycle's decisions. Emotional states are updated if significant events occurred. Trust scores are recalculated.

---

## 14. UI and Player Experience

### 14.1 What Players See

| Observable Signal | Source | Player Can Infer |
|------------------|--------|-----------------|
| Message tone and content | Persona + emotional state | Archetype and emotional state (roughly) |
| Border movements on star map | Strategic decisions | Expansion intent |
| Treaty proposals received | Coalition/alliance behaviour | Relationship attitude |
| Public Galactic Commons records | All treaty signings and violations | Trust worthiness |
| Momentum Rating visible on star map | Assigned at game setup | Threat level and action frequency |
| Achievement announcements | Achievement Check phase | Bot's win path |

### 14.2 Decision Audit (God Mode)

Post-game, players can optionally view a decision log for every bot — what they considered, why they chose what they chose, and what their emotional state and trust scores were at the time.

**Design intent**: This is an entertainment feature for curious players, not a gameplay advantage. It is unlocked after a campaign ends (achievement earned or player chooses to end). It should make past bot behaviour feel coherent in retrospect — "of course Zharkov attacked at Cycle 47, his trust score with me was at −60 and he was in Vengeful state."

### 14.3 Communication Inbox

The player receives bot messages through a dedicated inbox, filtered from the Cycle Report. Message display should surface:
- Sender name and any known title
- Message content in the bot's voice
- Any treaty proposals with one-click accept/reject

The inbox does not label the bot's archetype or emotional state. Context clues are embedded in the message itself.

---

## 15. Balance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Win rate: any archetype achieving any achievement | 8–12% per archetype per campaign | If one archetype achieves too often, it dominates the galaxy |
| Player vs. bot win rate (first achievement) | 55–65% player advantage | Player should usually get first achievement; galaxy should occasionally beat them |
| Coalition response time (turns from threshold to formation) | 3–7 Cycles | Fast enough to feel like a real threat; slow enough to feel organic |
| Schemer detection rate by experienced players | 20–40% pre-betrayal | Schemers should be hard but not impossible to read |
| LLM call rate per full campaign (Apex bots) | ≤ 10 calls per Apex bot per Confluence | Cost management; enough for meaningful engagement |
| Average trust score variance between empires | High variance; few neutral relationships | Players should encounter bots they clearly like and clearly distrust |
| Emotional state distribution at Cycle 50 | <30% of bots in neutral state | The galaxy should feel emotionally alive at midgame |
| Persona message repetition rate within game | <5% identical messages per persona | 30–45 templates should be sufficient to prevent staleness |

---

## 16. Open Questions

All questions resolved as of v1.1 (2026-03-08).

| # | Question | Decision |
|---|----------|---------|
| 16.1 | **Are Momentum Rating and Intelligence Tier independently configurable?** | **Yes — fully independent.** Both axes are configured independently at game setup. No default correlation. See §2.3. |
| 16.2 | **LLM provider chain** | **Multi-provider with graceful fallback on both sides.** Primary → secondary LLM provider → Tier II scripted fallback. Specific provider selection is an implementation decision. |
| 16.3 | **Do bots actively pursue named achievements?** | **Yes — explicit, not emergent.** Bots track their own progress toward all nine achievement paths and make deliberate decisions to advance their closest path. Bots behave like real players. See §9. |
| 16.4 | **In-world names for the 4 intelligence tiers** | **Internal only.** Tier names (Apex / Tactical / Reactive / Entropic) are designer-facing terminology. Players never see a label indicating which tier a bot is. The varied nature of real-player-like intelligence is part of the simulation, not a disclosed mechanic. |
| 16.5 | **Syndicate-seeking bots** | **Schemer bots pursue Syndicate control actively, and Syndicate control can change hands.** It is not a one-time acquisition. Schemer bots (Apex and Tactical tier) treat the Syndicate as an explicit achievement path. Multiple Schemers and the player may compete for control across the campaign. See §10. |

---

## 17. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-03-08 | Design session | Resolved all open questions. §2.3: full axis independence confirmed; configuration guidance updated. §9: bot achievement pursuit changed from emergent to explicit — bots actively track and pursue achievement paths as deliberate goals. §10: Syndicate control confirmed as contestable and repeating — Schemer bots (Apex and Tactical) compete for control; Shadow Throne requires holding control at achievement moment, not merely acquiring it once; multiple Schemers may compete simultaneously. All five open questions closed. |
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes legacy BOT-SYSTEM.md. Separated Momentum Rating and Intelligence Tier as independent axes. Replaced difficulty slider with emergent-difficulty model (Momentum Ratings only). Replaced turn-limit endgame triggers with achievement-proximity triggers. Replaced terminal victory conditions with achievement milestone model. Added Bot Achievement Pursuit (§9), Syndicate Awareness (§10), and explicit archetype-to-achievement-path disposition table. Retained: 8 archetypes, emotional state system, Tell System, relationship memory with weighted decay, persona system, LLM fallback chain design. |
