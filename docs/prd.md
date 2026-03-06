# Nexus Dominion — Product Requirements Document

> **Status:** Active - Strategic Reference
> **Version:** 1.0
> **Last Updated:** January 2026
> **Author:** [Your name]

---

---

## Executive Summary

Nexus Dominion is a single-player 4X strategy game that delivers MMO-style emergent drama without requiring a multiplayer environment. It targets single-player enthusiasts who want a rich, deep 4X experience — players familiar with titles like Master of Orion, Stellaris, or Civilization — but who want sessions that conclude in hours, not days. The core problem it solves is that traditional 4X games either demand enormous time investment or expose solo players to being steamrolled by power gamers in multiplayer. Nexus Dominion is complete when a player can start a game, engage with 100 uniquely-personalised bot opponents across a 10-sector galaxy, and reach one of 6 victory conditions within a 1–2 hour session.

---

## Overview

Nexus Dominion is best described as "Crusader Kings meets Eve Online, simulated." The game delivers MMO-style emergent drama in a single-player environment, allowing players to command a galactic empire, navigate dynamic bot personalities, and achieve victory through military conquest, economic dominance, or diplomatic mastery — all within a 1–2 hour session.

The galaxy is divided into 10 sectors, creating meaningful expansion paths. Players face 100 bot opponents with unique personas, emotional states, and relationship memory. The game is designed around progressive complexity, teaching players as they play, and anti-snowball mechanics that prevent runaway victories through coalition systems.

The UI is inspired by LCARS (Star Trek), using a starmap as the central command hub for all player actions.

For the complete design philosophy and principles behind these decisions, see [VISION.md](VISION.md).

---

## Goals

- Players can start a game, play turns, and reach a victory condition within 1–2 hours (50–500 turns depending on mode).
- All 6 victory conditions are functional and reachable.
- 100 bot personas are active with a working emotional state and relationship memory system.
- The 10-sector galaxy is fully implemented with wormhole connectivity.
- The LCARS UI is complete for all major screens.
- Turn processing completes in under 2 seconds at 100 active empires.
- New players can learn the game and be playing meaningfully within 10 minutes via a 5-step progressive tutorial.

---

## Non-Goals

> *No content yet — see template instructions in docs/other/prd-pre-migration.md*

---

## User Stories

### Personas

**Single-player 4X enthusiast:** A player familiar with Master of Orion, Stellaris, or Civilization who wants strategic depth but cannot commit to multi-day campaigns. They want sessions that conclude in a sitting and prefer not to compete against power gamers in multiplayer environments.

**New player:** Someone new to the 4X genre who needs guided onboarding. They should be able to learn the game through play, not through a manual.

### Stories

- As a **single-player 4X enthusiast**, I want to **pursue multiple viable victory paths (military, economic, diplomatic, and others)** so that **each playthrough feels distinct and strategically meaningful**.
- As a **single-player 4X enthusiast**, I want to **face 100 bot opponents with unique personalities and emotional states** so that **the game generates emergent drama comparable to a multiplayer experience**.
- As a **single-player 4X enthusiast**, I want to **complete a full game in 1–2 hours** so that **I can enjoy a complete strategic arc in a single sitting**.
- As a **new player**, I want to **learn the game through a 5-step progressive tutorial** so that **I am playing meaningfully within 10 minutes without reading documentation**.
- As a **new player**, I want to **be protected from bot attacks for the first 20 turns** so that **I have time to learn core mechanics before facing aggression**.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Game Length** | 1–2 hours | 50–500 turns depending on mode |
| **Turn Processing** | < 2 seconds | Perceived instant response |
| **Attacker Win Rate** | 40–50% | With equal forces (validated at 47.6%) |
| **Eliminations per Game** | 3–5 | Natural selection creates drama |
| **Learning Curve** | Playable in 10 minutes | 5-step tutorial, progressive disclosure |
| **Replayability** | High variance | Bot personalities + 6 victory paths |

### Definition of Done (v1.0)

1. Complete playable loop: start game, play turns, achieve victory.
2. All 6 victory conditions functional.
3. 100 bot personas active with emotional state system.
4. 10-sector galaxy with wormhole connectivity.
5. LCARS UI complete for all major screens.
6. < 2 second turn processing at 100 empires.

---

## Architecture & Design Principles

### 1. "Every Game Is Someone's First Game"
*(Stan Lee / Mark Rosewater)*

- New players can learn in 5 minutes.
- Complexity unlocks progressively over 200 turns.
- Required 5-step tutorial (can skip on replay).
- 20-turn protection period before bot attacks.

### 2. "Foundation Before Complexity"

- Combat must work before adding covert ops.
- Balance before variety.
- Elegance before feature creep.
- Core loop complete before expansion content.

### 3. "Backend-Frontend Completeness"

Every feature must be complete end-to-end:

- Database schema defined.
- Server actions implemented.
- UI components rendered.
- Tests validate behaviour.

No orphaned backend logic or UI shells without data.

### 4. "Consequence Over Limits"

- No hard caps — game responds to player behaviour.
- Leader hits 7 VP: automatic coalition forms.
- Weak empires move first (catchup mechanics).
- Anti-snowball debuffs on dominant players.

### 5. "Clarity Through Constraints"

- 100 empires exist, but only ~10 are relevant at once.
- Fewer systems, deeper interactions.
- Every feature must earn its place.
- Sectors are neighbourhoods, borders are roads, wormholes are highways.

---

## What Makes This Special

| Differentiator | Description |
|----------------|-------------|
| **Geographic Strategy** | Galaxy divided into 10 sectors creates meaningful expansion paths |
| **100 Unique Opponents** | Bot personas with emotional states and memory |
| **Progressive Complexity** | Onboarding teaches as you play |
| **Anti-Snowball Design** | Coalition mechanics prevent runaway victories |
| **Command Center UI** | LCARS-inspired starmap as hub for all actions |

---

## System Overview

> **Dev Note:** Systems listed alphabetically for easy verification. May require re-ordering by priority / scope.

### Bot AI System

Four-tier intelligence architecture: LLM-powered elite bots, archetype-driven strategic bots, rule-based simple bots, and chaotic random bots. Eight archetypes (Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist) combined with emotional states and relationship memory create 100 unique personalities.

**Tier 2 Reference:** [BOT-SYSTEM.md](Game%20Systems/BOT-SYSTEM.md)

### Combat System

Unified D20 resolution determines battle outcomes. Full invasions resolve across three sequential domains (Space, Orbital, Ground) with cascading bonuses. Defenders receive a 10% home turf advantage. Six dramatic outcomes create varied narratives from decisive victories to pyrrhic defeats.

**Tier 2 Reference:** [COMBAT-SYSTEM.md](Game%20Systems/COMBAT-SYSTEM.md)

### Covert Ops System

Asymmetric warfare for weaker empires. Ten operation types ranging from theft (Steal Credits) to disruption (Sabotage Production) and assassination. Success depends on agent allocation and risk management, with diplomatic consequences for detection.

**Tier 2 Reference:** [COVERT-OPS-SYSTEM.md](Game%20Systems/COVERT-OPS-SYSTEM.md)

### Diplomacy System

Treaties (NAP, Alliance, Coalition) with reputation consequences. Breaking treaties costs reputation; helping weak empires builds it. Low reputation makes bots target you and makes treaties harder to form.

**Tier 2 Reference:** [
