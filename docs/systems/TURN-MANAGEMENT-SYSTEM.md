# Turn Management System

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 1 (Game Loop), § Architecture (Cycle Processor)

---

## Document Purpose

This document defines the complete design of the Nexus Dominion turn management system: how a Cycle is committed, which phases execute and in what order, how the Confluence counter and Nexus Reckoning work, and how bot momentum ratings integrate into the pipeline.

**Intended readers:**
- Game designers making decisions about phase ordering, timing, and pipeline structure
- Developers implementing the Cycle Processor
- Anyone resolving a design question about when something happens during a Cycle

**Design philosophy:**
- **Two tiers, one pipeline.** Critical empire state updates are all-or-nothing (Tier 1). Derived, cosmetic, and AI state can fail gracefully without aborting the Cycle (Tier 2).
- **Phase order is game design, not implementation detail.** The sequence of phases determines what information flows where. Changing it changes the game.
- **The player never waits long.** Turn processing must feel instant. The entire pipeline targets completion under two seconds for 100 empires.
- **The Nexus governs what players cannot.** The Nexus Reckoning is the only automatic recalculation the player cannot influence or prevent. It is the mechanical engine behind the Cosmic Order.
- **Every mechanic has an in-world name.** Phases are described using in-world terminology in the Cycle Report. The player never reads "Phase 12: Market Update" — they read "Galactic Exchange rates shifted."
- **Achievements are milestones, not terminations.** The pipeline never ends the game. When an achievement triggers, the galaxy responds and the Cycle continues.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [The Cycle Pipeline](#3-the-cycle-pipeline)
4. [Phase Details — Tier 1](#4-phase-details--tier-1)
5. [Phase Details — Tier 2](#5-phase-details--tier-2)
6. [The Nexus Reckoning](#6-the-nexus-reckoning)
7. [Bot Momentum and Cycle Participation](#7-bot-momentum-and-cycle-participation)
8. [UI and Player Experience](#8-ui-and-player-experience)
9. [Balance Targets](#9-balance-targets)
10. [Open Questions](#10-open-questions)
11. [Revision History](#11-revision-history)

---

## 1. In-World Framing

### 1.1 The Cycle

A **Cycle** is the fundamental unit of time in Nexus Dominion. When the player commits their Cycle — issuing orders, managing production, making diplomatic moves — the galaxy advances. All 100 empires execute their intentions simultaneously. The Nexus observes the results.

From an in-world perspective, a Cycle represents the operational tempo of an interstellar empire: the time required to issue fleet orders, process resource extraction across star systems, evaluate diplomatic signals, and receive reports from intelligence operations.

### 1.2 The Confluence

Every ten Cycles constitute a **Confluence** — a period of measurable galactic history. The Confluence is not merely a counter: it is the window the Nexus uses to evaluate the Cosmic Order. At the end of each Confluence, the **Nexus Reckoning** fires: every empire's relative standing is recalculated, and the Cosmic Order is updated for the next ten Cycles.

The HUD always displays both the current Cycle number and the player's position within the active Confluence: `Cycle 47 · Confluence 4 · Reckoning in 3`.

### 1.3 The Cosmic Order

The **Cosmic Order** is the Nexus's classification of all empires by relative power. It has three bands:

| Band | Portion | In-World Meaning | Pipeline Effect |
|------|---------|-----------------|----------------|
| **Stricken** | Bottom 20% | Empires the Nexus judges diminished — granted Nexus Favour | Act first within each Cycle |
| **Ascendant** | Middle 60% | Empires in the active contest of power | Act in ascending power order |
| **Sovereign** | Top 20% | Empires the Nexus judges dominant — burdened by Weight of Dominion | Act last within each Cycle |

This classification is updated by the Nexus Reckoning, not continuously. The Cosmic Order is stable within a Confluence and changes only at Reckoning.

### 1.4 In-World Terminology Reference

| In-World Term | Plain Meaning |
|--------------|---------------|
| Cycle | One turn |
| Confluence | Ten Cycles |
| Nexus Reckoning | End-of-Confluence Cosmic Order recalculation |
| Cosmic Order | The power-band ranking (Stricken / Ascendant / Sovereign) |
| Nexus Favour | The advantage given to Stricken empires (act first) |
| Weight of Dominion | The disadvantage given to Sovereign empires (act last) |
| Cycle Report | The turn summary shown to the player after each Cycle |
| Imperial Stability | The morale/civil status rating of an empire's population |
| Galactic Pulse | A random galaxy-wide event triggered by Nexus phenomena |
| Cycle Commitment | The player's action of finalising their orders and advancing the Cycle |
| State Chronicle | The persistent game record (auto-save) written after each Cycle |

---

## 2. Core Concept

### 2.1 The Two-Tier Pipeline

The Cycle pipeline is divided into two tiers:

**Tier 1 — The Iron Guarantee**
Core empire state changes: resource income, population, stability, research progress, production queues, intelligence generation. These phases are all-or-nothing. If any Tier 1 phase fails, all Tier 1 changes roll back and the Cycle does not advance. The player is shown an error and can retry. No empire should ever be in an inconsistent state because of a partial Tier 1 failure.

**Tier 2 — The Living Galaxy**
Derived state, AI decisions, market dynamics, galactic events, achievement evaluation. These phases can fail individually without aborting the Cycle. A failure in bot message generation does not prevent the Cycle from completing. The galaxy always advances, even if some cosmetic or derived layers have degraded gracefully.

```
Player commits Cycle
         ↓
  ┌─────────────────────────────────────────┐
  │  TIER 1 — Iron Guarantee                │
  │  (All succeed or all rollback)          │
  │  Income → Production → Population →     │
  │  Stability → Research → Build Queue →   │
  │  Intelligence → [Crafting if in scope]  │
  └──────────────┬──────────────────────────┘
                 │ All succeed → COMMIT
                 ↓
  ┌─────────────────────────────────────────┐
  │  TIER 2 — Living Galaxy                 │
  │  (Each phase independent)               │
  │  Bot Decisions → Emotional Decay →      │
  │  Memory Maintenance → Market Update →   │
  │  Galactic Pulse → Galaxy Signals →      │
  │  Achievement Check → Nexus Reckoning*   │
  │  → State Chronicle                      │
  └──────────────┬──────────────────────────┘
                 │
  Cycle number increments
                 ↓
  Cycle Report delivered to player
```

*Nexus Reckoning fires only on the last Cycle of each Confluence (Cycles 10, 20, 30, …). See §6.

### 2.2 Phase Order Is Game Design

The sequence of phases encodes design intent:

- **Income before Build Queue**: Resources earned this Cycle are available to fund production this Cycle. This means a player who earns enough credits through income can begin a build in the same Cycle. This is intentional — it rewards economic efficiency.
- **Population before Stability**: Food surplus/deficit informs the stability calculation. A population that starved this Cycle is an unstable population.
- **Stability before Research**: An empire in rebellion researches less effectively. The instability penalty on research rate reflects real internal chaos.
- **Bot Decisions after Tier 1**: Bots decide their next actions after seeing the fully committed empire state. They respond to the world as it actually is, not as it was before Tier 1 processed.
- **Achievement Check before State Chronicle**: Achievements are evaluated on the committed state. If an achievement triggers, the galaxy's response is encoded into the State Chronicle.

### 2.3 Player Experience

From the player's perspective, committing a Cycle is an act with two parts:

1. **Cycle Commitment**: The player finalises orders and commits. A brief transition animation plays. Nothing has changed yet.
2. **Cycle Resolution**: The pipeline processes all phases. This takes under two seconds. The player sees subtle ambient animation — star systems shimmer, resource counters update, a notification count appears.
3. **Cycle Report**: A panel appears summarising what happened this Cycle — resources gained, research progress, notable bot actions, galactic events, and (if this was the final Cycle of a Confluence) the results of the Nexus Reckoning.

The player should never feel they are waiting. The pipeline should feel like turning a page.

---

## 3. The Cycle Pipeline

### 3.1 Complete Phase Sequence

| Phase | Name | Tier | What It Does |
|-------|------|------|-------------|
| 1 | **Resource Income** | 1 | All star systems generate credits, ore, and food based on their development level and Imperial Stability |
| 2 | **Production Output** | 1 | Resource processing facilities convert inputs to outputs (if resource crafting is in scope — see Open Questions) |
| 3 | **Population Growth** | 1 | Population grows with surplus food, declines with deficit |
| 4 | **Imperial Stability** | 1 | Stability rating recalculated from food balance, military losses, covert actions, and treaty status |
| 5 | **Research Advance** | 1 | Research points accumulate toward the active research doctrine; completions apply immediately |
| 6 | **Build Queue Advance** | 1 | All units and structures in production queues advance by one Cycle; completions deliver the asset to the empire |
| 7 | **Intelligence Accumulation** | 1 | Intelligence points generated from covert infrastructure |
| 8 | **Bot Decisions** | 2 | All bot empires evaluate strategic options and commit their decisions for this Cycle |
| 9 | **Emotional Decay** | 2 | Bot emotional states (anger, gratitude, fear) decay toward neutral |
| 10 | **Memory Maintenance** | 2 | Routine bot memories are pruned; significant memories are preserved |
| 11 | **Market Update** | 2 | Galactic Exchange prices update based on supply and demand from the previous Cycle |
| 12 | **Diplomatic Communications** | 2 | Messages generated from bot decisions this Cycle are delivered |
| 13 | **Galactic Pulse** | 2 | Random galaxy-wide events may trigger (asteroid strikes, resource discoveries, pirate surges) |
| 14 | **Galaxy Signals** | 2 | Coalition formation and dissolution evaluated; Nexus Compact formation threshold checks run |
| 15 | **Achievement Check** | 2 | All nine achievement paths evaluated for all empires; triggers fired if thresholds met |
| 16 | **Nexus Reckoning** | 2* | Cosmic Order recalculated using 5-Cycle rolling average (*fires only at end of Confluence) |
| 17 | **State Chronicle** | 2 | Full game state written to persistent storage |

*Phase 16 is skipped on Cycles 1–9 of each Confluence and fires only on Cycle 10 (the final Cycle of each Confluence).

---

## 4. Phase Details — Tier 1

### 4.1 Resource Income

Every empire generates income from its star systems each Cycle. Income is the product of the star system's base yield, its development level, and the empire's Imperial Stability modifier.

**Imperial Stability Modifier:**

| Stability Rating | Multiplier | Effect |
|-----------------|------------|--------|
| Thriving (80–100) | ×1.2 | Workforce is motivated; surplus production |
| Stable (50–79) | ×1.0 | Normal output |
| Strained (20–49) | ×0.8 | Workforce is discontented; reduced efficiency |
| Fractured (0–19) | ×0.5 | Near-rebellion; empire is critically compromised |

**Resources generated**: Credits, Ore, Food. Specific base rates are tuning targets, not canon constants at this design stage.

**Failure conditions**: If a star system's income calculation produces an invalid result (overflow, data corruption), Tier 1 rolls back.

### 4.2 Production Output

If resource processing / multi-step production chains are in scope (see Open Questions §10.1), this phase converts raw inputs to processed outputs via production facilities built on star systems.

**Design intent preserved from legacy**: The concept of a facility that consumes one resource to produce another (ore → refined ore) is architecturally sound. Whether this complexity belongs in the core game or is deferred to a later phase of design is an open question.

### 4.3 Population Growth

Each star system tracks its own population. Population grows when food surplus exists; population declines (and Stability degrades) when food deficit persists.

```
food_surplus = total_food_income - total_food_consumed
if food_surplus ≥ 0:
    population grows (rate = tuning target, capped at max growth rate per Cycle)
else:
    population declines; Imperial Stability takes a hit
```

The starvation-to-stability link is intentional: a starving population destabilises an empire, creating a second-order consequence that compounds a resource problem.

**Failure conditions**: Population cannot fall below 0. If a calculation would result in negative population, cap at 0 and treat as a critical stability event.

### 4.4 Imperial Stability

Imperial Stability is the morale and cohesion of an empire's population. It is recalculated each Cycle from all contributing factors:

| Factor | Effect |
|--------|--------|
| Food surplus | +Stability |
| Food deficit | −Stability |
| Military losses this Cycle | −Stability (scaled to loss magnitude) |
| Successful covert attack against this empire | −Stability |
| Star Covenant membership | +Stability (minor) |
| Achieving an achievement | +Stability (significant, one-time) |

**Stability thresholds** determine the income multiplier applied in Phase 1 of the next Cycle. They also gate certain actions: an empire in Fractured state cannot declare new wars (internal instability takes priority).

### 4.5 Research Advance

Research points accumulate toward the empire's active research doctrine (Research System defines the doctrine and tech tree — not this document). At this phase:

1. Points earned this Cycle = base research rate × Imperial Stability multiplier
2. Points added to current doctrine progress
3. If doctrine is complete: unlock immediately, notify player, clear the active research slot

**Stability modifier on research** reflects the reality that internal chaos reduces scientific productivity. An empire in Fractured Stability is not advancing its technology meaningfully.

### 4.6 Build Queue Advance

All items in all empires' production queues advance by one Cycle. Items that complete are immediately granted to the empire. The player's queue items and all bot queue items process simultaneously.

**Design rationale for including bots**: Bots use the same production queue system as the player. A Nemesis bot that placed a dreadnought in its queue twelve Cycles ago receives that dreadnought through this phase — not through a separate bot-only mechanism. The simulation is symmetric.

**Failure conditions**: A queue item that references a unit or structure definition that no longer exists (data integrity error) causes a Tier 1 rollback. Queue definitions must be immutable once an item enters production.

### 4.7 Intelligence Accumulation

Each empire accumulates intelligence points from its covert infrastructure. Points are capped to prevent unbounded hoarding. Intelligence points are the currency of the Covert Ops System (defined in its own document).

---

## 5. Phase Details — Tier 2

### 5.1 Bot Decisions

All bot empires evaluate their strategic situation and commit decisions for this Cycle. Each bot is independent: their decisions can be computed in parallel. Bot decision logic is fully defined in the Bot System document; this phase in the pipeline is simply the point where those decisions execute.

**Key design constraint**: Bot decisions execute *after* Tier 1 commits. Bots see the galaxy as it actually is after all empire resource updates — not a stale snapshot.

**Momentum rating integration**: Not all bots act every Cycle. See §7 for how Momentum Ratings (0.5×, 1.0×, 2.0×, etc.) determine whether a bot participates in a given Cycle's decision phase.

**Failure handling**: If a single bot's decision phase throws an error, that bot skips this Cycle. The pipeline continues. The bot is unchanged until the next Cycle's decision phase.

### 5.2 Emotional Decay

Bot emotional states — anger, gratitude, fear, admiration — decay toward neutral each Cycle. Without decay, bots hold permanent grudges and permanent loyalties. Decay creates dynamic relationships where history matters but doesn't lock in forever.

**Decay rates are tuning targets.** The design intent: major emotional events (betrayal, being saved from elimination) should take approximately 15–25 Cycles to fade to half strength. Minor events should fade in 5–10 Cycles.

**Important memories are preserved separately from emotional state**: A bot may no longer feel angry about a betrayal from Cycle 12, but it remembers the betrayal happened. Emotional state and factual memory are distinct.

### 5.3 Memory Maintenance

Bot memory is bounded. Each Cycle, routine memories beyond a retention window are pruned. Significant memories — first contact, major military engagements, treaty signings, betrayals, alliances, achievement triggers witnessed — are flagged as permanent and never pruned.

**Retention window**: Expressed in Confluences, not individual Cycles, so that the system scales naturally with game length. (See Open Questions §10.5 for the exact window.)

**Failure handling**: If memory maintenance fails for a bot, skip it. Missed maintenance is not critical — the database grows slightly but the bot continues to function correctly.

### 5.4 Market Update

The Galactic Exchange updates commodity prices based on supply and demand from the previous Cycle. Price movements are bounded to prevent runaway inflation or deflation in any single Cycle. Full Market System mechanics are defined in the Market System document.

**In-world presentation**: The Cycle Report describes this as "Galactic Exchange rates shifted" with relevant price movements. The player never reads "Market Update Phase."

**Failure handling**: If price calculation fails, prices remain at their previous Cycle values. Market still functions; players trade at stale prices. This is acceptable — one Cycle of stale prices is not a game-breaking condition.

### 5.5 Diplomatic Communications

Messages generated by bot decisions in Phase 8 are assembled and delivered. This is purely a communication phase — no game state changes. If a bot decided to propose a Stillness Accord, this phase generates the proposal message and delivers it to the target empire's inbox.

**What this phase does NOT do**: It does not execute diplomatic actions. Proposals, declarations, and breaches are committed through player actions or bot decision logic, not through this communications phase.

**Failure handling**: If message generation fails for a specific bot action, that message is silently dropped. The diplomatic action already occurred; the communication of it failed cosmetically. This is acceptable in the same way a letter getting lost in the mail does not undo the decision to send it.

### 5.6 Galactic Pulse

The Nexus occasionally produces observable phenomena with galaxy-wide consequences — asteroid strikes, resource vein discoveries, pirate fleet surges, wormhole instabilities. These are not scripted. They are random events that occur at a Nexus-governed probability that may be tuned based on the current Confluence number or Cosmic Order state.

**Probability curve intent**: Galactic Pulses should be rare but non-trivial. A player should encounter several over a full campaign, not dozens. They should feel like meaningful interruptions, not background noise.

**In-world framing**: Galactic Pulses are never described as "random events" to the player. They are presented as Nexus phenomena — the galaxy's response to the state of the Cosmic Order, whether or not there is a meaningful mechanical link.

**Failure handling**: If a Pulse event fails to apply, skip it and log. The Cycle continues.

### 5.7 Galaxy Signals

The simulation checks whether conditions are met for emergent coalition formation, Nexus Compact dissolution, or other macro-level galactic state changes. This phase is the mechanical driver of the anti-snowball system: as empires approach achievement thresholds, the galaxy organically responds.

**This is not scripted coalition spawning.** The Galaxy Signals phase evaluates bot self-preservation logic and relationship memory to determine whether any groups of bots have reached a tipping point where coordinated action becomes their optimal choice. Coalitions that form here were going to form anyway — this phase is when the simulation calculates that they have.

**Failure handling**: If the Galaxy Signals phase fails entirely, no new coalitions form this Cycle. Existing coalitions are unaffected. Log and continue.

### 5.8 Achievement Check

All nine achievement paths are evaluated for all empires. If any empire meets an achievement trigger:

1. The achievement is recorded and attributed to that empire
2. The galaxy response is computed (which bots respond, how, based on their relationship memory and the specific achievement type)
3. If the player triggered an achievement: the Cycle Report delivers a special acknowledgement — a title bestowed, a galaxy-wide signal registered
4. **The game does not end.** The Cycle continues. The achievement is a milestone, not a termination.

**Bot achievements matter**: A bot that triggers Grand Architect by successfully leading the coalition that stopped the player is a genuine narrative event. The Achievement Check evaluates bots and the player equally.

**Failure handling**: If the Achievement Check fails, achievements may be delayed by one Cycle. This is acceptable — missing one Cycle of achievement evaluation is not game-breaking. Log and continue.

### 5.9 Nexus Reckoning

Fires only on the final Cycle of each Confluence. See §6 for full detail.

### 5.10 State Chronicle

The complete game state is written to persistent storage. This is the auto-save. It fires at the end of every Cycle, after all other phases complete.

**Design note on storage**: The State Chronicle must use database persistence. Local file serialisation (JSON to disk) is explicitly not the design. The State Chronicle should be a committed database transaction representing the full game state at the end of this Cycle.

**Failure handling**: If the State Chronicle fails, the Cycle still completes from the player's perspective. The failure is logged and a retry should be attempted on the next Cycle. A State Chronicle failure does not abort the Cycle — it only means crash recovery will revert to the previous successful Chronicle.

---

## 6. The Nexus Reckoning

### 6.1 What It Is

The Nexus Reckoning is the automatic recalculation of the Cosmic Order that fires at the end of every Confluence (every 10 Cycles). It is the only game event that can change an empire's power band classification. Within a Confluence, the Cosmic Order is stable.

**In-world**: The Reckoning is the moment the Nexus evaluates all that has occurred in the last Confluence and renders its judgement on the standing of every empire. It is not perceived as mechanical by the empires within the galaxy — they experience it as a shift in the galactic order of precedence.

### 6.2 Calculation Method

The Reckoning uses a **5-Cycle rolling average** of each empire's power score — not the current Cycle's snapshot. This prevents manipulation (deliberately weakening an empire in Cycle 10 to get Nexus Favour) and prevents oscillation (empires rapidly toggling between bands).

```
reckoning_score(empire) =
    average(power_score[Cycle N-4], [N-3], [N-2], [N-1], [N])

Stricken:   bottom 20% of all reckoning_scores
Ascendant:  middle 60%
Sovereign:  top 20%
```

**Power score composition**: What inputs make up an empire's power score is a balance decision not fully locked at this design stage. Candidates: star systems held, military fleet strength, credit reserves, research level, diplomatic reach. The exact weights are tuning targets.

### 6.3 Reckoning Outcomes

After recalculation:

1. **Band changes are announced in the Cycle Report**: "The Nexus has reclassified the Sovereignty. Three empires have risen to Sovereign standing. Seven have fallen to Stricken."
2. **Turn order for the next Confluence is set**: Stricken empires act first; Sovereign empires act last. This is locked for the next 10 Cycles.
3. **Nexus Favour takes effect**: Stricken empires gain first access to market conditions, diplomatic windows, and territorial opportunities each Cycle for the next Confluence.
4. **Weight of Dominion takes effect**: Sovereign empires act last, giving every other empire first access.

### 6.4 Why the Reckoning Is in Tier 2

The Nexus Reckoning is placed in Tier 2 (graceful failure) because:
- A Reckoning failure leaves the Cosmic Order unchanged for another Confluence — not ideal, but not game-breaking
- Placing it in Tier 1 would mean a Reckoning calculation error rolls back all resource income and production for all 100 empires

A Reckoning failure should be flagged prominently and retried, but it should not abort the Cycle.

**Alternative**: Promote to Tier 1 if the Cosmic Order proves game-critical enough that an incorrect power band assignment causes cascading inconsistencies. This remains an open design question (§10.3).

---

## 7. Bot Momentum and Cycle Participation

### 7.1 Momentum Ratings

Every bot empire is assigned a Momentum Rating that governs how many effective actions it takes per player Cycle. This is the mechanical engine behind emergent difficulty — Nemesis bots are powerful because they have had more time to compound decisions, not because they have scripted advantages.

| Classification | Momentum Rating | Cycle Participation |
|---------------|-----------------|-------------------|
| Fodder | 0.5 – 0.75 | Acts every other Cycle (or 3 of 4 Cycles) |
| Standard | 1.0 | Acts every Cycle |
| Elite | 1.25 – 1.5 | Acts every Cycle plus occasional bonus action |
| Nemesis | 2.0 | Acts every Cycle with full double action budget |

### 7.2 Fractional Participation (Fodder)

A Fodder bot with a 0.5 Momentum Rating does not make strategic decisions every Cycle. The pipeline tracks a participation counter per bot and resolves it deterministically:

- **0.5 rating**: Bot participates in odd Cycles, skips even Cycles (or vice versa, set at empire creation)
- **0.75 rating**: Bot participates in 3 of every 4 Cycles, determined by a fixed schedule

When a Fodder bot skips a Cycle's Bot Decision phase, its empire still processes Tier 1 fully — income, population, stability, research, and build queues all advance normally. Only the strategic decision layer is skipped. The bot exists; it just isn't issuing new orders this Cycle.

**Design intent**: Fodder bots should feel like smaller, slower-moving empires — not absent from the galaxy. They still accumulate resources and advance their queues; they just don't pivot their strategy as frequently.

### 7.3 Multiplied Actions (Nemesis)

A Nemesis bot with a 2.0 Momentum Rating resolves its Bot Decision phase twice per player Cycle within a single pipeline pass. Concretely:

- **Decision pass 1**: Nemesis bot evaluates the galaxy state and commits a primary action (e.g., launch fleet engagement against a target)
- **Decision pass 2**: Nemesis bot evaluates again, now seeing the result of its first action, and commits a secondary action (e.g., issue a diplomatic proposal to consolidate gains)

The two passes execute within the same Phase 8 of the pipeline — they are not spread across two pipeline runs. The galaxy state between passes is updated only by the first Nemesis action, not by a full pipeline cycle.

**Design intent**: Nemesis bots should feel qualitatively different — not just quantitatively better. A Nemesis that can attack and then immediately respond to the diplomatic fallout in the same Cycle is strategically ahead in a way a Standard bot cannot match.

**Elite bots (1.25–1.5)**: The "bonus action" for Elite bots is probabilistic rather than guaranteed. A 1.5-rated Elite has a 50% chance of a second decision pass each Cycle. Implementation detail of that probability resolution is deferred to the Bot System document.

### 7.4 Bot Tier 1 Is Symmetric

All bots — Fodder, Standard, Elite, Nemesis — process Tier 1 identically. A Fodder bot still generates income every Cycle. A Nemesis bot does not get double income. Momentum Ratings only affect the strategic decision layer (Phase 8 and the bonus action mechanism). Resources and production are universal and symmetric.

This is a deliberate design choice: the asymmetry in bot capability comes from decision-making advantage and compounding choices, not from resource advantage. A Nemesis bot that has made twice as many strategic decisions over 100 Cycles has a genuinely larger empire — but it got there through the same resource mechanics available to everyone.

---

## 8. UI and Player Experience

### 8.1 The Cycle Commitment Action

The button or action by which the player commits their Cycle should have an in-world label. **This is an open design question** (§10.2) — proposed options include "Commit to the Confluence", "Yield the Cycle", and "Advance". The final label must be consistent with the VISION.md principle that every mechanic has an in-world name.

**During pipeline processing**: A brief transition state is shown — ambient animation, perhaps a subtle Nexus-themed visual effect. The player is not shown a progress bar of 17 phases. From their perspective, the Cycle turns.

### 8.2 The Cycle Report

After each Cycle completes, the Cycle Report panel appears. It summarises:

- **Resource summary**: Net change in credits, ore, food, intelligence
- **Research progress**: Percentage progress on the active doctrine; completion notice if applicable
- **Production completions**: Any units or structures that completed this Cycle
- **Notable bot actions**: Diplomatic messages received, war declarations, treaty proposals, significant movements
- **Galactic Pulse**: Description of any Nexus phenomenon that occurred
- **Achievement events**: If any empire triggered an achievement this Cycle
- **Nexus Reckoning results**: (Only if this was the final Cycle of a Confluence) Band changes, new Cosmic Order standing

**Design principle**: The Cycle Report should surface what matters, not everything. A player with 15 active Star Systems does not need to see 15 individual income breakdowns — they need to see total income change and anything anomalous.

### 8.3 HUD During Play

The persistent HUD shows:
- Current Cycle number
- Current Confluence number
- Cycles until Nexus Reckoning
- Player's current Cosmic Order band (Stricken / Ascendant / Sovereign)

Example: `Cycle 47 · Confluence 4 · Reckoning in 3 · Ascendant`

### 8.4 Notification Layer

Time-sensitive or significant events surfaced outside the Cycle Report:
- Achievement triggered (player or notable bot)
- War declared against the player
- Nexus Compact formed targeting the player
- Nexus Reckoning changed the player's band

These appear as overlay notifications immediately visible when the player returns to the star map after the Cycle Report.

---

## 9. Balance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Pipeline execution time | < 2,000ms for 100 empires | Tuning target, not a hard contract; varies by hardware |
| Tier 1 execution | < 800ms | Database-heavy; use batched queries across all empires |
| Bot decision phase | < 400ms total | Independent bots can run in parallel |
| Tier 2 remaining phases | < 800ms | Mostly in-memory; should be fast |
| State Chronicle write | < 300ms | Database transaction; async if necessary |
| Nexus Reckoning calculation | < 100ms | Mathematical; all data already in memory |
| Bot memory database size | < 20KB per bot after pruning | Memory Maintenance phase responsible for enforcing this |
| Achievement evaluation | Covers all 9 paths × 100 empires in < 50ms | Should be fast — mostly threshold comparisons |

---

## 10. Open Questions

| # | Question | Context | Options | Recommendation |
|---|----------|---------|---------|----------------|
| 10.1 | **Resource processing / crafting in scope?** | The legacy doc had two Tier 1 phases (Auto-Production, Crafting) for multi-step resource chains (raw ore → refined ore). The PRD mentions resources but not refined resources or crafting queues. | A) Include resource processing as a core system; B) Defer crafting to a later design milestone; C) Drop entirely — single-tier resources only | Defer to Resource Management System doc decision. Don't build the pipeline for it until that system is designed. |
| 10.2 | **In-world label for the Cycle Commitment action** | The UI button that the player clicks to advance the Cycle must have an in-world name consistent with the design philosophy. | "Commit to the Confluence" / "Yield the Cycle" / "Advance" / "Issue Orders" | "Yield the Cycle" — evokes submission to the Nexus's rhythm while being action-oriented |
| 10.3 | **Nexus Reckoning tier placement** | Currently Tier 2 (graceful failure). If the Cosmic Order proves game-critical, a failed Reckoning could cause meaningful inconsistency. | A) Keep in Tier 2 — a stale Cosmic Order for one Confluence is acceptable; B) Move to Tier 1 — the Cosmic Order is too important to fail gracefully | Keep in Tier 2 for now. Revisit after simulation testing. |
| 10.4 | **Nemesis multi-action model** | The document proposes "two decision passes within one pipeline run." Alternative: run the full pipeline twice for Nemesis bots (i.e., Nemesis bots trigger a mini pipeline pass between the standard Tier 1 and Tier 2). | A) Two decision passes within Phase 8 (current design); B) Full mini-pipeline pass for Nemesis; C) Single pass with doubled action budget (resource limits double, can do two things from one decision) | Option A — simplest, least expensive, still creates meaningful asymmetry |
| 10.5 | **Bot memory retention window** | Old doc: "last 20 turns." Should align with Confluence cadence. | A) 2 Confluences (20 Cycles); B) 3 Confluences (30 Cycles); C) Fixed at 20 Cycles (same as old, just renamed) | 2 Confluences — thematically coherent, practically identical to 20 Cycles |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-08 | Design session | Initial canon draft. Supersedes legacy TURN-PROCESSING-SYSTEM.md. Adopted two-tier pipeline architecture, updated all terminology to Cycle/Confluence/Nexus Reckoning, added bot momentum integration, replaced victory-check-as-game-end with achievement-check-as-milestone, replaced JSON auto-save with database State Chronicle. |
