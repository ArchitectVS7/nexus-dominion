# Nexus Dominion: Vision & Design Philosophy

**Version:** 2.0
**Status:** Active - Design Philosophy Reference
**Last Updated:** January 2026

---

## What Is Nexus Dominion?

**Nexus Dominion** is a 1-2 hour single-player turn-based space empire strategy game inspired by Solar Realms Elite (1990). Players compete against 10-100 AI bot opponents to build the most powerful galactic empire.

### Core Experience

> "Command your empire from the bridge of your flagship. Consolidate your sector, expand through borders and wormholes, form coalitions against rising threats, and achieve victory through military conquest, economic dominance, or diplomatic mastery."

### What Makes This Special

1. **Geographic Strategy** - Galaxy divided into 10 sectors creates meaningful expansion paths
2. **100 Unique Opponents** - Bot personas with emotional states and memory
3. **Progressive Complexity** - Onboarding teaches as you play
4. **Anti-Snowball Design** - Coalition mechanics prevent runaway victories
5. **Command Center UI** - LCARS-inspired starmap is your hub for all actions

---

## The MMO Experience (Single Player)

> **"Crusader Kings meets Eve Online, simulated."**

Nexus Dominion aims for a **simulated MMO experience** designed for solo play:

- **Bots fight bots** - Natural selection occurs. 100 empires become 80, then 60, then fewer.
- **Emergent bosses** - Victors accumulate power. A bot that eliminated 5 others IS the boss, organically.
- **Player fights ~10-15** - At any time, only your neighbors matter. Not the whole galaxy.
- **Coalitions are raids** - Defeating an emergent boss requires coordination, like MMO raids against dungeon bosses.
- **Sessions are chapters** - A 100-empire campaign spans multiple 1-2 hour sessions, each a chapter in your story.
- **Neighbors are characters** - Your 5-10 neighbors become personalities you know, with history and rivalries.

### Target Audience

Single-player enthusiasts who want a rich, deep experience without being steamrolled by power gamers in multiplayer. The game delivers MMO-style emergent drama in a controlled, fair environment.

---

## Design Principles

### 1. "Every game is someone's first game"
*(Stan Lee / Mark Rosewater)*

- New players can learn in 5 minutes
- Complexity unlocks progressively over 200 turns
- Tutorial is required but can be skipped on replay

The game teaches as you play:
- **Turn 1-20**: Learn your sector ("your neighborhood in space")
- **Turn 21-40**: Discover borders and adjacent sectors
- **Turn 41-60**: Build wormholes to distant sectors
- **Turn 61+**: Galaxy-wide strategic thinking

### 2. "Geography creates strategy"

Sectors are neighborhoods, borders are roads, wormholes are highways. The galaxy's 10 regions create manageable cognitive load - 100 empires exist, but only ~10 are relevant at once.

> **Why Sectors?** 100 empires with "attack anyone" = cognitive overload and no strategic positioning. Sectors create **regional strategy** with direction and purpose. Expansion becomes meaningful - do you consolidate your sector first, or race to grab a border connection?

### 3. "Consequence over limits"

No hard caps - the game responds to player behavior instead of blocking it:
- Leader hits 7 VP → automatic coalition forms
- Weak empires move first (catchup mechanics)
- Break treaties → reputation penalties make future diplomacy harder
- Overextend militarily → economic collapse follows naturally

### 4. "Clarity through constraints"

- Fewer systems, deeper interactions
- Every feature must earn its place
- Better to have 6 well-designed victory paths than 20 shallow ones
- Remove features that don't serve the core experience

### 5. "Foundation before complexity"

Build systems in order of dependency:
- Combat must work before adding covert ops
- Balance before variety
- Elegance before feature creep
- Core loop complete before expansion content

### 6. "Natural selection is the content"

Don't script bosses - let them emerge from bot-vs-bot conflict:
- A bot that won 5 battles IS the boss, with all the power that implies
- The drama comes from organic gameplay, not authored scenarios
- Player agency matters more than scripted events
- Emergent stories > designed stories

---

## Anti-Snowball Philosophy

The greatest threat to fun in 4X games is the **inevitable winner** - when one player (or bot) gets ahead and the outcome becomes mathematically certain with 30% of the game remaining.

### The Problem

Traditional 4X games suffer from "rich get richer" feedback loops:
1. Strong empire conquers weak neighbor
2. Gains resources and territory
3. Becomes even stronger
4. Repeat until unstoppable

By turn 100 of 200, players often know who will win. The rest is grinding through the inevitable.

### Our Solution: Organic Coalitions

When any empire reaches significant power (7+ Victory Points), the galaxy responds:
- Other empires receive combat bonuses against the leader
- Diplomatic penalties make alliances harder for the leader
- Economic penalties increase costs for the leader
- The game telegraphs "this empire is the threat" to all bots

This creates **dramatic tension** instead of predetermined outcomes. The leader must fight the galaxy itself, creating the climactic battles that make victory feel earned.

### Turn Order as Catchup Mechanic

Weakest empires act first each turn, strongest act last. This prevents oscillation where the rich get first pick of opportunities every turn. Small advantage, huge psychological impact.

---

## Core Systems Overview

For detailed mechanics, see the [PRD-EXECUTIVE.md](PRD-EXECUTIVE.md). This section explains the **philosophy** behind each system.

### Combat Philosophy

> **"D-Day wasn't 'win air superiority, THEN naval battle, THEN beach landing' - it was a unified operation where all elements contributed simultaneously."**

We replaced sequential 3-phase combat with unified D20 resolution. One roll determines victor, casualties, and territory captured. The result is dramatic, fast-paced battles with clear outcomes.

**DEV NOTE** This seems outdated and needs to be updated with the current combat system

### Bot Personality Philosophy

100 bots aren't 100 identical decision trees. We use 4 tiers of intelligence:
- **Elite (LLM)**: Can adapt, remember, and surprise you
- **Strategic**: Follow doctrines with personality flavor
- **Simple**: Predictable but varied behavioral rules
- **Chaotic**: Wildcard agents of entropy

Your neighbor "The Merchant Prince" should *feel* different from "Warlord Kxath" across multiple games. Memory and emotional states create persistence.

### Galaxy Structure Philosophy

Sectors solve the "100 targets = analysis paralysis" problem. You start with ~10 neighbors you can attack immediately. Expanding beyond requires investment (border discovery, wormhole construction). This creates phases:

1. **Consolidate** - Dominate your starting sector
2. **Expand** - Push into adjacent sectors
3. **Reach** - Build wormholes to distant regions
4. **Dominate** - Manage your multi-sector empire

Each phase unlocks new strategic considerations without overwhelming new players.

### Research Philosophy

Avoid "tech tree paralysis" where players spend 10 minutes comparing 50 options. Instead: **draft mechanics** with meaningful tradeoffs.

Pick 1 of 3 Doctrines (strategic identity), then 1 of 2 Specializations (tactical flavor). Your choices matter because you're giving up alternatives, not because you need a PhD to evaluate them.

### Victory Philosophy

Six victory paths mean six playstyles are viable:
- **Conquest**: "I want to fight"
- **Economic**: "I want to build"
- **Diplomatic**: "I want to manipulate"
- **Research**: "I want to turtle and tech"
- **Military**: "I want the biggest fleet"
- **Survival**: "I want to be best at everything"

No path should be objectively superior. Bots pursue different paths based on personality, creating varied competition.

---


## Why This Game Matters

In an era of 100-hour open-world games and endless live-service grinds, **Nexus Dominion respects your time**. A complete campaign takes 1-2 hours. You get a beginning, middle, climax, and resolution in one session.

But it's not shallow. The 100-bot galaxy creates emergent complexity that you can't experience in 20 minutes. It's the strategic depth of Civilization compressed into the runtime of a movie.

Single-player 4X games have largely moved toward either:
- Grindy empire builders that take 40+ hours (Stellaris, Endless Space)
- Quick skirmishes that lack narrative weight (indie tactics games)

We're threading the needle: **epic scope, session length**. Command a galactic empire, experience dramatic rivalries and climactic battles, achieve victory or go down swinging - all before bedtime.

**DEV NOTE** While I likley said a game session could last 1-2 hours, I never made this a constraint or a pillar of design philosophy. This is something that crept in and took hold, that we are now wiedling as a differentiator. With the intention of making a "Virtual MMO", we may want to last weeks, not hours. I am expressing concern for this. I do want a single game session to be a thing, as I have tried to make the game design more boardgame like in look and feel. At the same time, I don't thinl forcing a turn or time limit really meets the MMO-like intent.



---

*For detailed mechanics, system specifications, and implementation references, see [PRD-EXECUTIVE.md](PRD-EXECUTIVE.md).*
