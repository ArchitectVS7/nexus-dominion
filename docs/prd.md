# Nexus Dominion — Product Requirements Document

> **Status:** Active - Strategic Reference
> **Version:** 2.0
> **Last Updated:** March 2026
> **Author:** Nexus Dominion Design Team

---

## Executive Summary

Nexus Dominion is a single-player 4X strategy game that delivers MMO-style emergent drama without requiring a multiplayer environment. It targets single-player enthusiasts who want a rich, deep 4X experience — players familiar with titles like Master of Orion, Stellaris, or Civilization — but who want sessions that conclude in a sitting. The core problem it solves is that traditional 4X games either demand enormous time investment or expose solo players to being steamrolled by power gamers in multiplayer. Nexus Dominion is complete when a player can start a game, engage with up to 100 uniquely-personalised bot opponents across a 10-sector galaxy, and reach one of 6 victory conditions within a typical 1–3 hour session.

---

## Overview

Nexus Dominion is best described as **"Crusader Kings meets Eve Online, simulated."** The game delivers MMO-style emergent drama in a single-player environment, allowing players to command a galactic empire, navigate dynamic bot personalities, and achieve victory through military conquest, economic dominance, or diplomatic mastery.

The galaxy is divided into 10 sectors, creating meaningful expansion paths and natural phases of play: consolidate your sector, push into adjacent regions, build wormholes to distant territory, then fight for galactic dominance. Players face up to 100 bot opponents with unique personas, emotional states, and relationship memory. The bots fight each other independently — natural selection occurs, empires rise and fall, emergent "bosses" accumulate power — and the player navigates this living ecosystem rather than a static list of enemies.

At its heart, Nexus Dominion is a **digital boardgame**. The star map is the table that never leaves view. Panels slide in like cards being examined and then set back down. Every turn has weight and clarity. The LCARS (Star Trek) aesthetic makes the player feel like an admiral at a tactical command display, not a manager clicking through spreadsheets.

For the complete design philosophy and principles behind these decisions, see [VISION.md](other/VISION.md) and [BOARDGAME-VISION.md](other/BOARDGAME-VISION.md).

---

## Goals

- Players can start a game, play turns, and reach a victory condition in a typical 1–3 hour session.
- All 6 victory conditions (Conquest, Economic, Diplomatic, Research, Military, Survival) are functional and reachable.
- Up to 100 bot personas are active with working emotional state and relationship memory systems; bots feel like distinct personalities, not decision-tree clones.
- The 10-sector galaxy is fully implemented with wormhole connectivity and phase-gated expansion (same-sector → adjacent sector → wormhole).
- The LCARS UI is complete for all major screens, with the star map as the persistent command hub.
- Turn processing completes in under 2 seconds (alpha target) and under 300ms (release target) at 100 active empires.
- New players can learn the game through play and be engaging meaningfully within 10 minutes via a 5-step progressive tutorial.
- The Syndicate hidden-role system and Tech Card draft system are integrated as core v1.0 features, not post-launch DLC.

---

## Non-Goals

The following are explicitly out of scope for v1.0 and should not be designed for or built toward:

- **No human-vs-human multiplayer.** Nexus Dominion is a single-player experience. The "100 opponents" are all bots. Multiplayer infrastructure, matchmaking, and synchronisation are not part of this product.
- **No real-time gameplay.** The game is turn-based. There are no timers that force player decisions. The player acts, then cycles the turn. Bot actions resolve after the player commits.
- **No live-service or persistent accounts.** Each game is self-contained. There is no account progression, no daily quests, no seasonal content, and no between-session meta-progression in v1.0.
- **No hard session time limit.** While a typical session is designed to conclude in 1–3 hours, there is no game-imposed timer or forced ending. Long-form campaigns with extended turn counts are valid play modes.
- **No authored campaign or scripted narrative.** Story emerges from gameplay (the "natural selection" philosophy). There are no authored cutscenes, scripted boss encounters, or hand-crafted missions. Drama is emergent, not written.
- **No pay-to-win or monetisation mechanics.** No in-game purchases, premium currency, or paywalled content exist in the v1.0 scope.
- **No mobile-first design.** Mobile support is a Beta 2 objective. Alpha and Beta 1 target desktop/tablet browsers. Mobile optimisation (touch targets, responsive layouts, bundle size) is explicitly deferred.
- **No LLM-powered bots in Alpha.** Tier 1 elite bots powered by LLM are a Beta 2 feature. Alpha ships with archetype-driven strategic bots (Tier 2), rule-based bots (Tier 3), and chaotic random bots (Tier 4).
- **No WMD systems in Alpha.** Chemical, nuclear, and bioweapon systems are a Beta 1 feature, gated behind Syndicate Black Market and high research. They are not part of the Alpha combat system.
- **No post-launch expansion content.** Features documented in FUTURE.md (psionic weapons, information warfare, advanced coalition raids, branching tech trees) are not part of v1.0 scope.

---

## User Stories

### Personas

**Single-player 4X enthusiast:** A player familiar with Master of Orion, Stellaris, or Civilization who wants strategic depth but cannot commit to multi-day campaigns. They want sessions that conclude in a sitting and prefer not to compete against power gamers in multiplayer environments. They appreciate systems with depth, emergent stories, and meaningful choices — not busywork.

**New player:** Someone new to the 4X genre who needs guided onboarding. They should be able to learn the game through play, not through a manual. They are comfortable with digital interfaces and light strategy games, but have never managed a galactic empire before.

**Returning player:** A player who has completed at least one game and understands the core loop. They want replayability: different bot behaviours, varied starting conditions, and new strategies unlocked by the Syndicate and Tech Card systems.

### Stories

**Core Loop:**
- As a **single-player 4X enthusiast**, I want to **pursue multiple viable victory paths** so that **each playthrough feels distinct and strategically meaningful**.
- As a **single-player 4X enthusiast**, I want to **face bot opponents with unique personalities and emotional states** so that **the game generates emergent drama comparable to a multiplayer experience**.
- As a **single-player 4X enthusiast**, I want to **complete a full game in a single sitting** so that **I experience a complete strategic arc — beginning, escalation, and resolution — without scheduling multiple sessions**.
- As a **returning player**, I want to **discover hidden Syndicate roles and draft Tech Cards** so that **each game has a distinct tactical flavour and creates moments of surprise and deduction**.

**Onboarding:**
- As a **new player**, I want to **learn the game through a 5-step progressive tutorial** so that **I am playing meaningfully within 10 minutes without reading documentation**.
- As a **new player**, I want to **receive protection from bot aggression for my first turns** so that **I have time to establish my empire and learn core mechanics before facing attacks**.
- As a **new player**, I want to **see complexity unlock gradually over the first 60 turns** so that **I am never overwhelmed and always feel competent**.

**Empire Management:**
- As a **player**, I want to **see my star map at all times as the central reference point** so that **I never lose spatial context or strategic awareness**.
- As a **player**, I want to **manage five distinct resources with clear production and consumption feedback** so that **economic decisions feel meaningful and legible**.
- As a **player**, I want to **build diverse military units across three combat domains** so that **fleet composition and strategic planning matter**.

**Diplomacy & Social:**
- As a **player**, I want to **form treaties, alliances, and coalitions with bot opponents** so that **diplomacy is a genuine strategic tool, not window dressing**.
- As a **player**, I want to **observe bot behaviour and deduce their archetypes** so that **reading the political situation is a skill I can develop**.
- As a **player**, I want to **see the galaxy react when I near victory (automatic coalition formation)** so that **endgame is a climactic struggle against the field, not a foregone conclusion**.

**Syndicate (Hidden Roles):**
- As a **Syndicate player**, I want to **complete shadow contracts while appearing loyal** so that **the hidden role creates a dual narrative tension between my public and secret objectives**.
- As a **Loyalist player**, I want to **investigate suspicious behaviour and accuse potential Syndicate members** so that **the deduction layer adds a social thriller quality to strategic play**.

---

## Success Metrics

| Metric | Alpha Target | Release Target | Measurement |
|--------|-------------|----------------|-------------|
| **Game Completion Rate** | 50%+ finish first game | 60%+ | Session analytics |
| **Session Length** | Median 45–90 min | Median 60–120 min | Session analytics |
| **Turn Processing** | < 2 seconds | < 300ms | Perceived instant response |
| **Attacker Win Rate** | 40–50% | 47.6% ± 3% | Monte Carlo validation |
| **Eliminations per Game** | 3–5 | 3–5 | Natural selection creates drama |
| **Tutorial Completion** | > 70% | > 80% | Funnel analytics |
| **Victory Variety** | 3+ conditions achieved | All 6 conditions achieved | Playtester reports |
| **Bot Distinctiveness** | Playtesters identify archetypes | 100 unique personas feel distinct | Qualitative feedback |
| **Feedback Sentiment** | — | > 80% positive | Beta survey |

### Definition of Done (v1.0)

1. Complete playable loop: start game → play turns → achieve victory.
2. All 6 victory conditions functional and reachable in playtesting.
3. 100 bot personas active with emotional state and relationship memory.
4. 10-sector galaxy with wormhole connectivity.
5. LCARS UI complete for all major screens; star map is persistent hub.
6. Syndicate System active: hidden loyalty, contracts, accusation trials, Black Market.
7. Tech Card System active: 40 cards, 3 tiers, draft mechanics, hidden objectives.
8. Research System: 3-tier draft structure (Doctrines → Specialisations → Capstones).
9. Turn processing < 300ms at 100 active empires.
10. WCAG 2.1 AA compliance; full keyboard navigation.
11. Crash rate < 0.1% of sessions; zero data loss incidents.

---

## Architecture & Design Principles

### 1. "Every Game Is Someone's First Game"
*(Stan Lee / Mark Rosewater)*

- New players can learn in 5 minutes.
- Complexity unlocks progressively over 200 turns: sectors (1–20), borders (21–40), wormholes (41–60), galaxy domination (61+).
- Required 5-step tutorial on first play; skippable on subsequent games.
- Bot aggression is suppressed for the player's first turns to provide a safe learning environment.

### 2. "Foundation Before Complexity"

Build systems in dependency order. Combat must work before Covert Ops. Resource balance before market manipulation. Core loop validated before Syndicate hidden roles are layered on top. This is not just a development principle — it is a player experience principle. Complexity that arrives before the foundation is understood creates frustration, not depth.

### 3. "Backend-Frontend Completeness"

Every feature must be complete end-to-end:

- Database schema defined.
- Server actions implemented.
- UI components rendered.
- Tests validate behaviour.

No orphaned backend logic or UI shells without data. A feature is not done until the player can see and interact with it.

### 4. "Consequence Over Limits"

No hard caps — the game responds to player behaviour rather than blocking it:

- Leader hits 7 VP: automatic coalition forms across the galaxy.
- Weak empires move first each turn (built-in catch-up mechanic).
- Break treaties: reputation penalties make future diplomacy harder and bots more hostile.
- Overextend militarily: economic collapse follows naturally from maintenance costs.
- Run out of food: population declines, civil status drops, income craters.

This philosophy keeps the player feeling in control while the world reacts to their choices.

### 5. "Clarity Through Constraints"

- 100 empires exist, but only ~10 are relevant at any moment (your sector's neighbours).
- Fewer systems with deeper interactions beat many shallow systems.
- Every feature must earn its place by serving the core experience.
- Sectors are neighbourhoods, borders are roads, wormholes are highways.
- Six well-designed victory paths beat twenty shallow ones.

### 6. "Natural Selection Is the Content"

Do not script boss encounters. Let them emerge from bot-vs-bot conflict. A bot that survived by eliminating five rivals and accumulating their territory IS the threat — organically powerful, not artificially inflated. The drama comes from watching the galaxy evolve, then choosing when and how to intervene.

### 7. "The Map Never Leaves the Table"

Inspired by boardgame design philosophy: the star map is the playing surface, and it is always visible. All other screens are overlays — panels examined like cards and set back down. Players should never lose spatial context. The board never gets put away.

---

## What Makes This Special

| Differentiator | Description |
|----------------|-------------|
| **Geographic Strategy** | Galaxy divided into 10 sectors creates meaningful expansion phases (consolidate → expand → reach → dominate) |
| **100 Unique Opponents** | Bot personas with 8 archetypes, emotional states, and persistent relationship memory create emergent drama |
| **Progressive Complexity** | Onboarding teaches as you play; new mechanics surface naturally turn-by-turn |
| **Anti-Snowball Design** | Coalition mechanics trigger automatically against any dominant power; victory is never inevitable |
| **Hidden Roles (Syndicate)** | 10% of empires secretly serve the Syndicate; social deduction and paranoia layer over strategic play |
| **Tech Card Draft** | Tactical card drafts every 10 turns add a CCG-lite layer of surprise and counter-play |
| **Command Centre UI** | LCARS-inspired starmap is always visible; panels slide in like cards; boardgame feel in a digital medium |

---

## System Overview

The game is composed of thirteen interdependent systems. They are listed here in priority order for development clarity (see also Build Strategy below). Each entry links to its detailed Tier 2 design document.

---

### 1. Turn Processing System

The heartbeat of the galaxy. An atomic 17-phase execution pipeline ensures all 100 empires process in a deterministic order per turn. The pipeline separates transactional state updates (resources, combat results, sector ownership) from cosmetic bot logic (messages, personality reactions) for robust failure handling. Weak empires act first; dominant empires act last — a systemic catch-up mechanic baked into the turn sequence itself.

**Key Numbers:** Target < 2s (Alpha), < 300ms (Release) at 100 empires.

**Tier 2 Reference:** [TURN-PROCESSING-SYSTEM.md](other/Game%20Systems/TURN-PROCESSING-SYSTEM.md)

---

### 2. Resource Economy

Five resources power the empire: **Credits** (universal currency), **Food** (population and soldiers), **Ore** (military maintenance), **Petroleum** (military fuel and wormhole construction), and **Research Points** (technology advancement). Eight sector types produce different resource mixes, forcing specialisation decisions.

Civil status multipliers (0.25× rioting → 1.0× content → 2.5× ecstatic) mean happiness is not cosmetic — it is a direct economic amplifier. Population grows on food surplus, declines on deficit. Consequences, not caps.

**Key Numbers:** Commerce sectors: 8,000 credits/turn (content). Food sectors: 160 food/turn. Research sectors: 100 RP/turn.

**Tier 2 Reference:** [RESOURCE-MANAGEMENT-SYSTEM.md](other/Game%20Systems/RESOURCE-MANAGEMENT-SYSTEM.md)

---

### 3. Sector Management & Galaxy Structure

Ten sectors of 8–10 empires each form the galaxy. Spatial relationships drive strategic phases:

- **Same-sector attacks:** Free. These are your immediate neighbours.
- **Adjacent-sector attacks:** Require border discovery (1.2× cost). These are your expansion targets.
- **Distant attacks:** Require wormhole construction (1.5× cost, petroleum-intensive). These are your late-game reach.

This structure eliminates analysis paralysis: you always know who matters now and who requires investment to reach. Sectors are neighbourhoods; expansion is earned.

**Key Numbers:** 10 sectors × 10 empires = 100 total empires. 5 starting sectors per empire. Coalition trigger: 7+ VP.

**Tier 2 Reference:** [SECTOR-MANAGEMENT-SYSTEM.md](other/Game%20Systems/SECTOR-MANAGEMENT-SYSTEM.md)

---

### 4. Combat System

Unified D20 resolution determines battle outcomes. The familiar 5% granularity (roll + stat modifier + bonuses ≥ target defence) creates clear probability, dramatic critical moments (nat 20 / nat 1), and transparent tactics.

Full invasions resolve across three sequential domains — **Space → Orbital → Ground** — with cascading victory bonuses (+2 per domain won). Defenders receive a 10% home turf advantage. Three battle types offer strategic variety:

- **Full Invasion:** Multi-domain, can capture 5–15% of defender's sectors.
- **Covert Strike:** Ground-only sabotage; weakens without capturing territory.
- **Blockade:** Economic strangulation; no combat, no capture.

Six dramatic outcomes (Decisive Victory through Decisive Defeat) produce varied battle reports and ensure no two engagements feel identical. Unit cards use D&D-style STR/DEX/CON ability scores with derived HP, AC, and attack bonuses — familiar mechanics, space opera flavour.

**Key Numbers:** Attacker win rate 47.6% at equal forces. Defender advantage 1.10×. Morale check at 50% losses (d20 + WIS vs DC 15). Surrender offer at 75% losses (CHA vs WIS opposed check).

**Tier 2 Reference:** [COMBAT-SYSTEM.md](other/Game%20Systems/COMBAT-SYSTEM.md)

---

### 5. Military System

Six unit types across three combat domains: **Fighters** and **Light/Heavy Cruisers** (Space), **Stations** (Orbital), **Carriers** (Space, support), and **Soldiers** (Ground). Production queues require multi-turn investment and resource management (Credits, Ore, Petroleum for maintenance).

Three rarity tiers create power progression:
- **Tier I (Standard):** Available Turn 1; stats 8–12.
- **Tier II (Prototype):** Research-unlocked; stats 12–16; drafted every 10 turns (draw 2, keep 1).
- **Tier III (Singularity):** Ultra-rare; stats 16–20; available Turn 50+; public announcement on acquisition.

Fleet composition bonuses reward strategic diversity: a balanced fleet (4+ distinct unit types) gains +15% to all stats, discouraging mono-unit strategies.

**Tier 2 Reference:** [MILITARY-SYSTEM.md](other/Game%20Systems/MILITARY-SYSTEM.md)

---

### 6. Bot AI System

Four-tier intelligence architecture creates varied opposition without requiring every bot to be computationally expensive:

- **Tier 1 (Elite / LLM):** 10 bots powered by LLM reasoning; can adapt, remember, and surprise. *(Beta 2)*
- **Tier 2 (Strategic / Archetype):** Rule-following bots with strong doctrinal behaviour.
- **Tier 3 (Simple / Rule-Based):** Predictable but varied; good for filling out sectors.
- **Tier 4 (Chaotic / Random):** Wildcard agents of entropy; create unpredictable events.

Eight archetypes define strategic identities: **Warlord** (expand aggressively), **Diplomat** (seek alliances), **Merchant** (economic dominance), **Schemer** (covert ops and betrayal), **Turtle** (fortify and research), **Blitzkrieg** (fast early rush), **Tech Rush** (tech-to-win), **Opportunist** (attack the weakened).

Bots track relationship memory and emotional states: a bot you helped becomes **Grateful** and offers favourable terms; a bot whose treaty you broke becomes **Vengeful** and coordinates against you. These states persist and evolve, creating the sense that your neighbours are characters, not scripts.

**Tier 2 Reference:** [BOT-SYSTEM.md](other/Game%20Systems/BOT-SYSTEM.md)

---

### 7. Victory Systems

Six distinct paths to victory ensure every playstyle is viable:

| Victory Type | Threshold | Typical Archetype |
|--------------|-----------|-------------------|
| **Conquest** | Control 60% of galaxy territory | Warlord, Blitzkrieg |
| **Economic** | 1.5× networth of 2nd-place empire | Merchant, Opportunist |
| **Diplomatic** | Coalition controls 50% of territory | Diplomat, Schemer |
| **Research** | Complete Tier 3 capstone tech path | Tech Rush, Turtle |
| **Military** | 2× military power of all others combined | Warlord |
| **Survival** | Highest composite score at turn limit | Balanced play |

**Victory Points (VP)** unify progress tracking on a 0–10 scale. Ten VP in any category triggers instant victory. Seven or more VP triggers the **anti-snowball coalition**: other empires receive combat bonuses against the leader, diplomatic penalties hamper the leader's treaties, and the galaxy telegraphs "this empire is the threat." Victory must be earned against a galaxy that fights back.

**Tier 2 Reference:** [VICTORY-SYSTEMS.md](other/Game%20Systems/VICTORY-SYSTEMS.md)

---

### 8. Diplomacy System

Treaties (NAP, Alliance, Coalition) with reputation consequences. The system treats diplomatic relationships as **evolving states** influenced by reputation, trust scores, and observable behaviour — not binary switches.

- **Non-Aggression Pact (NAP):** 20-turn minimum; breaking costs reputation.
- **Alliance:** 30-turn minimum; shared intel, +10% trade bonus; breaking costs severe reputation.
- **Coalition:** Formal multi-empire group; enables Diplomatic Victory; can be dissolved by vote or betrayal.

Reputation tracks across the galaxy. Low reputation makes bots target you preferentially and makes treaties harder to form. High reputation opens diplomatic opportunities and makes bots extend good faith. Breaking treaties is always an option — but the galaxy remembers.

Players cannot see bot archetype labels. Reading behaviour is the skill: does this empire's history suggest Diplomat or Schemer? Trust or prepare?

**Tier 2 Reference:** [DIPLOMACY-SYSTEM.md](other/Game%20Systems/DIPLOMACY-SYSTEM.md)

---

### 9. Research System

Three-tier draft structure replaces passive tech-tree grinding with meaningful strategic choices at natural game phase transitions:

| Tier | Name | Unlock Threshold | Visibility | Impact |
|------|------|-----------------|------------|--------|
| **Tier 1** | Doctrine | ~1,000 RP (~Turn 10) | PUBLIC | Strategic identity, combat stat bonuses |
| **Tier 2** | Specialisation | ~5,000 RP (~Turn 30) | HIDDEN | Tactical advantage, counter-play potential |
| **Tier 3** | Capstone | ~15,000 RP (~Turn 60) | PUBLIC | Game-changing power spike; Research Victory trigger |

Three strategic paths: **War Machine** (offensive bonuses), **Fortress** (defensive and sustainability), **Commerce** (economic and expansion). Doctrines are publicly announced — opponents adapt. Specialisations are hidden — creating intel gameplay and deduction. Capstones are game-changing abilities that mark the endgame escalation.

**Tier 2 Reference:** [RESEARCH-SYSTEM.md](other/Game%20Systems/RESEARCH-SYSTEM.md)

---

### 10. Syndicate System

A hidden criminal organisation transforms Nexus Dominion from pure 4X into **hidden role 4X with social deduction**. At game start, each empire (player and bots) secretly receives a Loyalty Card:

- **90% Loyalist:** Play normally; pursue standard victory conditions; access the Suspicious Activity Feed; accuse suspected Syndicate members using Intel Points.
- **10% Syndicate:** Play normally to avoid suspicion; access the hidden Syndicate Contract panel; complete 3 contracts for Syndicate Victory; access the Black Market for WMDs and forbidden tech.

The Revelation Moment (Turn 50 or first contract completion) announces to the galaxy that a Syndicate operative is active — without identifying who. Paranoia sets in. Every unexplained production drop, market anomaly, and political assassination becomes a clue. Accusation trials create dramatic confrontations. The Schemer archetype's natural deceptive behaviour generates false positives, protecting real Syndicate agents behind a fog of suspicion.

**Tier 2 Reference:** [SYNDICATE-SYSTEM.md](other/Game%20Systems/SYNDICATE-SYSTEM.md)

---

### 11. Tech Card System

A CCG-lite draft layer over the strategic Research system. Tech Cards are tactical tools that create emergent counter-play and in-session variation:

- **Tier 1 (Hidden Objectives):** Drawn at Turn 1; secret bonus scoring conditions revealed at game end.
- **Tier 2 (Tactical Cards):** Drafted publicly every 10 turns; 40 unique cards with combat, economic, and diplomatic effects; opponent drafts are visible, enabling counter-picks.
- **Tier 3 (Legendary Cards):** Ultra-rare drafts from Turn 50+; game-changing effects; public announcement.

Tech Cards integrate directly with the D20 combat system (modifying STR/DEX/CON stats), not as abstract passive buffs. The draft cadence creates regular strategic inflection points across the entire game.

**Tier 2 Reference:** [TECH-CARD-SYSTEM.md](other/Game%20Systems/TECH-CARD-SYSTEM.md)

---

### 12. Market System

A dynamic galactic market where prices fluctuate based on supply, demand, and random events. Players can profit by buying low and selling high, or deliberately manipulate prices to drain rival economies. The Merchant archetype uses predictive insight to dominate trade routes.

Market activity creates indirect player interaction without requiring direct combat: an economic player can throttle a rival's military production by cornering Ore supply, without firing a shot.

**Tier 2 Reference:** [MARKET-SYSTEM.md](other/Game%20Systems/MARKET-SYSTEM.md)

---

### 13. Covert Ops System

Asymmetric warfare that allows weaker empires to punch above their weight. Ten operation types span three categories:

- **Theft:** Steal Credits, steal tech blueprints.
- **Disruption:** Sabotage production, destroy units, poison food supply.
- **Influence:** Assassinate commanders, incite civil unrest, plant false intel.

Success depends on agent allocation and risk management. Failed operations expose the player to diplomatic consequences — detected ops damage relationships with the target and may be used as accusation evidence in Syndicate trials. Covert Ops pairs naturally with Syndicate contracts as an underdog comeback path.

**Tier 2 Reference:** [COVERT-OPS-SYSTEM.md](other/Game%20Systems/COVERT-OPS-SYSTEM.md)

---

### 14. Frontend / UI Design System

LCARS (Star Trek) inspired design: glass panels over deep space backgrounds, orange/peach/violet colour palette, curved corners, animated resource counters, and ambient atmosphere. The UI expresses the **digital boardgame** philosophy:

- **Star map as hub:** Always visible. All other screens are slide-in overlays, not separate pages.
- **Panels as cards:** Examine and dismiss; map re-emerges. Spatial context never lost.
- **Turn Order Panel:** Right-sidebar action checklist showing phase, completed actions, and the Cycle Turn button.
- **Turn Summary Modal:** Post-turn event digest (like end-of-round cards in Pandemic): "You earned 10,500 credits. The Merchant Coalition declared war. Research completed."
- **Unit cards:** D&D-style stat blocks with colour-coded tier borders (green Tier I, blue Tier II, purple Tier III) and 10-segment visual stat bars.

Five UX problems specifically designed against: turn phase invisibility, passive-only warnings (no actionable guidance), buried star map, scroll-heavy interfaces, and administrative feel.

**Tier 2 Reference:** [FRONTEND-DESIGN.md](other/Game%20Systems/FRONTEND-DESIGN.md)

---

## Player Experience Arc

Understanding the intended player journey is essential for prioritising which systems matter most, and when. The arc below describes a single game session.

### Opening: The Board State (Turns 1–20)

The player boots the game and sees the galaxy. Not a loading screen, not a menu — the star map. Their empire glows. Around them, 9–10 neighbours in their sector. This is their neighbourhood in space.

The 5-step tutorial introduces one mechanic per prompt: collect resources → build a unit → attack a neighbour → form a treaty → end the turn. By Turn 5 the player is acting independently. By Turn 20 they understand their sector.

During this phase, bot aggression is suppressed toward the new player, giving them breathing room. Bots fight among themselves. Natural selection begins. Some neighbours are already at war.

### Early Game: Building the Engine (Turns 21–60)

The player discovers borders — connections to adjacent sectors. Each border outpost opened is a strategic decision: fortify my position or race to grab that territory before a rival does?

At Turn 10, the first research Doctrine draft fires. A choice of three identities: War Machine, Fortress, or Commerce. This public announcement lands in the galaxy feed — bots react. "The player has declared War Machine doctrine. Expect aggression."

The market opens. The Tech Card draft cycle begins (every 10 turns). The player's empire starts to feel like theirs — a specific economic composition, a research identity, a roster of named bot relationships.

### Mid Game: Competing for Dominance (Turns 61–150)

Research Specialisation fires at Turn 30 (hidden). Research Capstone fires at Turn 60 (public). The player has a strategic identity and a tactical edge.

Wormhole construction unlocks reach to distant sectors. The scope of the relevant galaxy expands from ~10 neighbours to ~30. Some bots have been eliminated. Emergent bosses — empires that won 5 fights and accumulated their victims' territory — now represent genuine threats.

Victory Point tracking becomes visible on the HUD. Someone in the galaxy hits 5 VP in Conquest. Tension rises. The player must now think about both pursuing their own path and disrupting the leading threat.

At some point between Turns 50–100, the Syndicate reveals itself. The message is galaxy-wide: "A Syndicate operative has completed their first contract." Paranoia sets in. The suspicious activity feed starts generating leads. Accusation Intel Points accumulate.

### Endgame: The Board Fights Back (Turns 100–200+)

As any empire approaches 7 VP, the anti-snowball coalition activates. If the player is leading, every other empire receives combat bonuses against them, diplomatic penalties hamper their alliances, and the galaxy sends a coordinated resistance. Victory must be seized against opposition.

If a bot is leading, the player must decide: pursue their own path to victory, or join the coalition to pull the leader down first?

Multiple empires near victory in different categories simultaneously creates a race: "I need 3 more sectors for Conquest, but Bot #47 is one research step from their Capstone."

Endgame is a climax, not a grind. The winner earns it.

### Victory Moment

The screen freezes. LCARS panels flash victory gold. A cinematic announcement names the winner and victory type. The final galaxy state is displayed with territory, statistics, and the timeline of key moments. The player sees exactly how their choices shaped history.

---

## Build Strategy

Development proceeds in four phases, each gated by the success criteria of the previous phase. Systems are built in dependency order.

### Phase 1: Internal Alpha — Validate the Core Loop

**Goal:** Prove the game is fun at its most fundamental level.
**Target:** Development team + 5–10 trusted playtesters.

**Systems in scope:**
- Turn Processing (17-phase pipeline)
- Resource Economy (5 resources, 8 sector types, civil status)
- Sector Management & Galaxy Structure (10 sectors, same/adjacent/wormhole)
- Combat System (D20, 3 domains, 6 units, 3 battle types)
- Military System (Tier I units, production queues)
- Bot AI System (Tiers 2–4 only; 8 archetypes; ~25 functional personas)
- Victory Systems (all 6 conditions; VP tracking)
- Diplomacy System (NAP, Alliance, Coalition; reputation)
- Market System (dynamic pricing, buy/sell)
- Research System (linear progression as interim; draft system in Beta 1)
- Frontend UI (LCARS shell, star map hub, turn order panel, tutorial)

**Systems deferred:**
- Syndicate System (Beta 1)
- Tech Card System (Beta 1)
- Covert Ops (Beta 1)
- Advanced Research Draft (Beta 1)
- Coalition Raids (Beta 1)
- WMD Systems (Beta 1)
- LLM-powered bots (Beta 2)
- Full 100 unique personas (Beta 2)
- Mobile optimisation (Beta 2)

**Alpha exits when:** Complete playable loop functional; zero P0 bugs; turn processing < 2 seconds; tutorial completion > 70%; 3+ victory conditions achieved by playtesters; bot archetypes feel distinct.

---

### Phase 2: Beta 1 (Closed) — Add Complexity Layers

**Goal:** Layer hidden role, tactical card, and asymmetric warfare systems onto the validated core loop.
**Target:** 50–100 invited beta testers.

**New systems:**
- Syndicate System (hidden roles, contracts, Black Market, accusation trials)
- Tech Card System (40 cards, 3 tiers, draft mechanics)
- Advanced Research (3-tier draft: Doctrines → Specialisations → Capstones)
- Covert Ops System (10 operation types)
- WMD Systems (via Syndicate Black Market)
- Coalition Raids (coordinated multi-empire attacks)

**Beta 1 exits when:** Syndicate victory achieved at least once; all 40 Tech Cards drafted; hidden objectives reveal correctly; coalition formation works; no P0/P1 bugs; feedback sentiment > 75% positive.

---

### Phase 3: Beta 2 (Open) — Scale, Polish, and Performance

**Goal:** Harden the full system for public release at scale.
**Target:** 1,000+ public beta players.

**Focus areas:**
- LLM-powered Tier 1 elite bots (10 opponents)
- Full 100 unique bot personas
- Performance optimisation (< 300ms turn processing)
- Mobile experience (tablet and phone responsive design)
- Accessibility (WCAG 2.1 AA compliance)
- Animations, sound effects, visual polish
- Replay/history viewer; screenshot/share features
- Complete documentation (How to Play, strategy guides, Bot Archetype recognition guide, Syndicate playbook, Tech Card catalogue)

**Beta 2 exits when:** Crash rate < 0.1%; turn processing < 300ms; Lighthouse score > 95; WCAG AA certified; all 100 personas distinct; tutorial completion > 80%; three consecutive clean builds; zero P0/P1 bugs; feedback sentiment > 80% positive.

---

### Phase 4: v1.0 Release — Feature Complete

**Goal:** Production-ready public release with all systems active.

The v1.0 Definition of Done is listed in the Success Metrics section above. Key production quality bars:

| Metric | Requirement |
|--------|-------------|
| Crash rate | < 0.1% of sessions |
| Data loss incidents | Zero |
| API error rate | < 1% |
| Average uptime | 99.5% |
| Initial load | < 2 seconds |
| Turn processing | < 300ms |
| Lighthouse score | 95+ |
| WCAG 2.1 Level AA | 100% compliant |

---

## System Dependency Map

```
                    ┌─────────────────────────────────────────┐
                    │            TURN PROCESSOR               │
                    │    (Orchestrates all phase execution)   │
                    └───────────────────┬─────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌───────────────┐
│   RESOURCES   │◄──────────────│    COMBAT     │──────────────►│     BOTS      │
│   (Economy)   │   casualties  │   (Battles)   │   decisions   │     (AI)      │
└───────┬───────┘   affect      └───────┬───────┘               └───────┬───────┘
        │           production          │                               │
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌───────────────┐
│    SECTORS    │◄──────────────│   MILITARY    │               │   DIPLOMACY   │
│  (Territory)  │   conquest    │    (Units)    │               │  (Treaties)   │
└───────┬───────┘   transfers   └───────────────┘               └───────┬───────┘
        │                               ▲                               │
        │                               │                               │
        │                       ┌───────┴───────┐                       │
        └──────────────────────►│   RESEARCH    │◄──────────────────────┘
                  unlocks       │    (Tech)     │     affects
                  sectors       └───────┬───────┘     modifiers
                                        │
                            ┌───────────┼───────────┐
                            ▼           ▼           ▼
                    ┌───────────┐ ┌─────────┐ ┌─────────┐
                    │  VICTORY  │ │SYNDICATE│ │TECH CARD│
                    │(Win Check)│ │ (Roles) │ │ (Draft) │
                    └───────────┘ └─────────┘ └─────────┘
```

**Implementation Order (Phase 1 → Phase 2 → Phase 3):**

```
Phase 1 (Foundation)      Phase 2 (Core Loop)       Phase 3 (Complexity)
├── Database Schema       ├── Combat Resolution     ├── Syndicate System
├── Turn Processor        ├── Military Production   ├── Tech Card Draft
├── Resource Engine       ├── Sector Acquisition    ├── Covert Ops
├── Galaxy Structure      ├── Victory Checks        ├── Advanced Research
├── Bot Archetypes        ├── Diplomacy             ├── WMD Systems
└── Basic UI Shell        └── Market System         └── Coalition Raids
```

---

## Key Numbers Quick Reference

| Aspect | Value |
|--------|-------|
| **Bot opponents** | 10–100 (configurable) |
| **Bot archetypes** | 8 |
| **Galaxy sectors** | 10 |
| **Empires per sector** | ~10 |
| **Starting sectors per empire** | 5 |
| **Victory conditions** | 6 |
| **Anti-snowball coalition trigger** | 7+ Victory Points |
| **Resource types** | 5 (Credits, Food, Ore, Petroleum, Research Points) |
| **Unit types** | 6 (Soldiers, Fighters, Bombers, Light Cruisers, Heavy Cruisers, Carriers, Stations) |
| **Combat unit tiers** | 3 (Standard, Prototype, Singularity) |
| **Research tiers** | 3 (Doctrine, Specialisation, Capstone) |
| **Research paths** | 3 (War Machine, Fortress, Commerce) |
| **Tech Cards (v1.0)** | 40 across 3 tiers |
| **Attacker win rate (equal forces)** | 47.6% |
| **Defender advantage** | 1.10× (home turf) |
| **Syndicate ratio** | 10% Syndicate / 90% Loyalist |
| **Syndicate contracts to win** | 3 (by Turn 200) |
| **Turn processing target (Alpha)** | < 2 seconds |
| **Turn processing target (Release)** | < 300ms |
| **Tutorial steps** | 5 |

---

## Document Hierarchy

### Tier 0: Vision & Philosophy
- [VISION.md](other/VISION.md) — Design philosophy, principles, and the "why" behind decisions
- [BOARDGAME-VISION.md](other/BOARDGAME-VISION.md) — Digital boardgame design philosophy

### Tier 1: Product Requirements (This Document)
Strategic overview, system index, player experience arc, build strategy, success metrics.

### Tier 2: Design Documents

| Document | Scope |
|----------|-------|
| [BOT-SYSTEM.md](other/Game%20Systems/BOT-SYSTEM.md) | AI architecture, archetypes, emotional states |
| [COMBAT-SYSTEM.md](other/Game%20Systems/COMBAT-SYSTEM.md) | D20 mechanics, multi-domain battle resolution |
| [COVERT-OPS-SYSTEM.md](other/Game%20Systems/COVERT-OPS-SYSTEM.md) | Espionage, sabotage, assassination |
| [DIPLOMACY-SYSTEM.md](other/Game%20Systems/DIPLOMACY-SYSTEM.md) | Treaties, reputation, coalition formation |
| [FRONTEND-DESIGN.md](other/Game%20Systems/FRONTEND-DESIGN.md) | LCARS UI/UX design system |
| [MARKET-SYSTEM.md](other/Game%20Systems/MARKET-SYSTEM.md) | Dynamic trading, price manipulation |
| [MILITARY-SYSTEM.md](other/Game%20Systems/MILITARY-SYSTEM.md) | Unit types, tiers, production, fleet composition |
| [RESEARCH-SYSTEM.md](other/Game%20Systems/RESEARCH-SYSTEM.md) | 3-tier draft tech system |
| [RESOURCE-MANAGEMENT-SYSTEM.md](other/Game%20Systems/RESOURCE-MANAGEMENT-SYSTEM.md) | Economy, production, civil status |
| [SECTOR-MANAGEMENT-SYSTEM.md](other/Game%20Systems/SECTOR-MANAGEMENT-SYSTEM.md) | Galaxy structure, expansion phases |
| [SYNDICATE-SYSTEM.md](other/Game%20Systems/SYNDICATE-SYSTEM.md) | Hidden roles, contracts, Black Market |
| [TECH-CARD-SYSTEM.md](other/Game%20Systems/TECH-CARD-SYSTEM.md) | Card draft, tactical effects, hidden objectives |
| [TURN-PROCESSING-SYSTEM.md](other/Game%20Systems/TURN-PROCESSING-SYSTEM.md) | Execution pipeline, phase ordering |
| [VICTORY-SYSTEMS.md](other/Game%20Systems/VICTORY-SYSTEMS.md) | Victory conditions, VP tracking, anti-snowball |

### Tier 3: Implementation References

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](other/development/ARCHITECTURE.md) | Technical stack and patterns |
| [SCHEMA.md](other/development/SCHEMA.md) | Database schema reference |
| [SPEC-REGISTRY.md](other/development/SPEC-REGISTRY.md) | Spec-to-code mapping |
| [PHASED-ROLLOUT-PLAN.md](other/development/PHASED-ROLLOUT-PLAN.md) | Detailed Alpha → Beta → Release plan |

---

*Nexus Dominion — "Command your empire from the bridge of your flagship. Consolidate your sector, expand through borders and wormholes, form coalitions against rising threats, and achieve victory through military conquest, economic dominance, or diplomatic mastery."*
