# Nexus Dominion: Game Design Document

**Version:** 1.0 (Consolidated)
**Status:** Active - Primary Design Reference
**Last Updated:** January 2026

---

## Quick Overview

**Nexus Dominion** is a 1-2 hour single-player turn-based space empire strategy game inspired by Solar Realms Elite (1990). Players compete against 10-100 AI bot opponents to build the most powerful galactic empire.

### Core Experience

> "Command your empire from the bridge of your flagship. Consolidate your sector, expand through borders and wormholes, form coalitions against rising threats, and achieve victory through military conquest, economic dominance, or diplomatic mastery."

### What Makes This Special

1. **Geographic Strategy** - Galaxy divided into 10 sectors creates meaningful expansion paths
2. **100 Unique Opponents** - Bot personas with emotional states and memory
3. **Progressive Complexity** - Onboarding teaches as you play
4. **Anti-Snowball Design** - Coalition mechanics prevent runaway victories
5. **Command Center UI** - LCARS-inspired starmap is your hub for all actions

### Key Decisions

| Aspect | Decision |
|--------|----------|
| **Bots** | 10-100 AI opponents (configurable) |
| **Turns** | 50-500 turns (based on game mode) |
| **Starting Sectors** | 5 per empire |
| **Galaxy** | 10 sectors (10 empires each) |
| **Combat** | Unified D20 resolution (47.6% attacker win rate) |
| **Research** | 3-tier draft system (Doctrines -> Specializations -> Capstones) |

---

## Core Systems

### [Combat System](COMBAT-SYSTEM.md)

Unified D20 resolution replaced sequential 3-phase combat for better balance:
- **47.6% attacker win rate** with equal forces (validated)
- **1.10x defender advantage** (home turf bonus)
- **6 dramatic outcomes** create varied narratives
- Single roll determines victor, casualties, and sectors captured

> **Design Philosophy**: D-Day wasn't "win air superiority, THEN naval battle, THEN beach landing" - it was a **unified operation** where all elements contributed simultaneously. Our combat reflects this.
>
> The original "ground war is hardest" philosophy is preserved through massive defender advantage (1.5× power multiplier), costly victories showing attrition, stalemates representing grinding warfare, and rare but devastating disasters.

### [Bot AI System](BOT-SYSTEM.md)

4-tier intelligence system with 100 unique personas:
- **Tier 1 (LLM)**: 5-10 elite bots with natural language decisions
- **Tier 2 (Strategic)**: 20-25 bots with archetype-based decision trees
- **Tier 3 (Simple)**: 50-60 bots with behavioral rules
- **Tier 4 (Random)**: 10-15 chaotic bots

8 archetypes: Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist

### Galaxy Structure

The galaxy divides into **10 sectors** of 8-10 empires each:

```
Turn 1-20:    Focus on your sector (consolidate)
Turn 21-40:   Expand to adjacent sectors (via borders)
Turn 41-60:   Build wormholes to distant sectors
Turn 61+:     Multi-sector empire management
```

> **Why Sectors?** 100 empires with "attack anyone" = cognitive overload and no strategic positioning. Sectors create **regional strategy**:
> - You start with ~9 neighbors (manageable)
> - Expansion has direction and purpose
> - Wormholes are expensive investments creating meaningful choices
> - At game setup, sectors are balanced for fairness (±10% networth, similar resources)

**Attack Accessibility:**
- **Same Sector**: Attack freely (1.0x cost)
- **Adjacent Sector**: After border discovery (1.2x cost)
- **Wormhole Connection**: After construction (1.5x cost)
- **Unreachable**: Cannot attack without connection

### Resource System

| Resource | Source | Primary Use |
|----------|--------|-------------|
| **Credits** | Commerce sectors, taxes | Buying, maintenance |
| **Food** | Food sectors | Population, soldiers |
| **Ore** | Ore sectors | Military maintenance |
| **Petroleum** | Petroleum sectors | Military fuel, wormholes |
| **Research Points** | Research sectors | Tech advancement |

### Victory Conditions

| Victory | Condition | Playstyle |
|---------|-----------|-----------|
| **Conquest** | Control 60% of territory | Aggressive expansion |
| **Economic** | 1.5x networth of 2nd place | Builder/trader |
| **Diplomatic** | Coalition controls 50% territory | Alliance politics |
| **Research** | Complete tech tree (Tier 3) | Turtle/tech rush |
| **Military** | 2x military of all others combined | Domination |
| **Survival** | Highest score at turn limit | Balanced play |

---

## Design Philosophy

### The MMO Experience (Single Player)

> **"Crusader Kings meets Eve Online, simulated."**

> Nexus Dominion isn't "Solar Realms with 100 AI players" - it's a **simulated MMO galaxy** designed for solo play:
>
> - **Bots fight bots** - Natural selection occurs. 100 empires become 80, then 60, then fewer.
> - **Emergent bosses** - Victors accumulate power. A bot that eliminated 5 others IS the boss, organically.
> - **Player fights ~10-15** - At any time, only your neighbors matter. Not the whole galaxy.
> - **Coalitions are raids** - Defeating an emergent boss requires coordination, like MMO raids against dungeon bosses.
> - **Sessions are chapters** - A 100-empire campaign spans multiple 1-2 hour sessions, each a chapter in your story.
> - **Neighbors are characters** - Your 5-10 neighbors become personalities you know, with history and rivalries.
>
> **Target audience**: Single-player enthusiasts who want a rich, deep experience without being steamrolled by power gamers in multiplayer. The game delivers MMO-style emergent drama in a controlled, fair environment.

### Design Principles

> 1. **"Every game is someone's first game"** *(Stan Lee / Mark Rosewater)*
>    - New players can learn in 5 minutes
>    - Complexity unlocks progressively over 200 turns
>    - Tutorial is required but can be skipped on replay
>
> 2. **"Geography creates strategy"**
>    - Sectors are neighborhoods, borders are roads, wormholes are highways
>    - 10 regions = manageable cognitive load
>    - Expansion has direction and purpose
>
> 3. **"Consequence over limits"**
>    - No hard caps - game responds to player behavior
>    - Leader hits 7 VP → automatic coalition forms
>    - Weak empires move first (catchup mechanics)
>
> 4. **"Clarity through constraints"**
>    - 100 empires exist, but only ~10 are relevant at once
>    - Fewer systems, deeper interactions
>    - Every feature must earn its place
>
> 5. **"Foundation before complexity"**
>    - Combat must work before adding covert ops
>    - Balance before variety
>    - Elegance before feature creep
>
> 6. **"Natural selection is the content"**
>    - Don't script bosses - let them emerge from bot-vs-bot conflict
>    - A bot that won 5 battles IS the boss, with all the power that implies
>    - The drama comes from organic gameplay, not authored scenarios

### Anti-Snowball Mechanics

When any empire reaches **7+ Victory Points**:
- All other empires get +10% attack power vs leader
- +5% defense if leader attacks
- Leader cannot form new alliances
- Leader pays 20% more for resources

**Reverse Turn Order**: Weakest empire goes first each turn (catchup mechanic).

---

## Sector System

### Starting Configuration (5 Sectors)

| Sector Type | Production |
|-------------|------------|
| Food | 160 food/turn |
| Ore | 112 ore/turn |
| Petroleum | 92 petro/turn |
| Commerce | 8,000 credits/turn |
| Urban | Population cap + 1,000 credits |

### Sector Types

| Type | Production | Cost | Special |
|------|------------|------|---------|
| **Food** | 160 food | 8,000 | Essential sustenance |
| **Ore** | 112 ore | 6,000 | Military material |
| **Petroleum** | 92 petro | 11,500 | Creates pollution |
| **Commerce** | 8,000 cr | 8,000 | Main income |
| **Urban** | +pop cap | 8,000 | House citizens |
| **Education** | +civil status | 8,000 | Happiness |
| **Government** | +300 agents | 7,500 | Covert ops |
| **Research** | Research pts | 23,000 | Tech tree |

### Wormhole System

**Purpose**: Connect distant sectors without slow border expansion

- **Cost**: 15,000-40,000 credits + 300-800 petroleum
- **Time**: 6-15 turns to build
- **Research**: Level 4+ required
- **Slots**: 2 base, up to 4 with research

---

## Research System

### Three-Tier Draft Structure

| Tier | Name | Unlock | Choice |
|------|------|--------|--------|
| **1** | Doctrine | ~Turn 10 | Pick 1 of 3 strategic identities |
| **2** | Specialization | ~Turn 30 | Pick 1 of 2 upgrades (based on Doctrine) |
| **3** | Capstone | ~Turn 60 | Automatic based on Doctrine |

### The Three Doctrines

| Doctrine | Combat | Economic | Unlocks |
|----------|--------|----------|---------|
| **War Machine** | +15% attack | -10% income | Heavy Cruisers |
| **Fortress** | +25% defense | -5% attack | Defense Platforms |
| **Commerce** | +20% sell prices | +10% costs | Trade Fleets |

### Capstones (Tier 3)

- **War Machine** -> **Dreadnought** (10x Heavy Cruiser power)
- **Fortress** -> **Citadel World** (one invulnerable sector)
- **Commerce** -> **Economic Hegemony** (+50% of #2's income)

---

## Diplomacy System

### Treaties

- **Non-Aggression Pact (NAP)**: Cannot attack each other
- **Alliance**: Shared intel, mutual defense, trade bonuses
- **Coalition**: Formal group with shared goals

### Reputation System

| Action | Effect |
|--------|--------|
| Attack without provocation | -10 reputation |
| Break treaty | -25 reputation |
| Help weak empire | +5 reputation |
| Fulfil trade agreements | +2 reputation |

Low reputation makes treaties harder to form and makes bots target you.

---

## Turn Processing

### 6-Phase Structure

```
Phase 1: Income Generation     [PARALLEL]  All empires simultaneously
Phase 2: Build Queue           [PARALLEL]  All empires simultaneously
Phase 3: Bot Planning          [PARALLEL]  Bots decide while player thinks
Phase 4: Diplomacy Resolution  [SEQUENTIAL] Order-dependent
Phase 5: Covert Operations     [SEQUENTIAL] Order-dependent
Phase 6: Combat Resolution     [SEQUENTIAL] Weak-first initiative
```

**Performance**: ~500ms per turn (perceived instant)

### Combat Turn Order

Weakest empire attacks first, strongest last - prevents "rich get richer" oscillation.

---

## User Interface

### LCARS Design Philosophy

Star Trek-inspired aesthetic:
- Semi-transparent panels (see stars behind)
- Orange/peach/violet color palette
- Smooth animations (fades, slides, pulses)
- Clear information hierarchy

### Command Hub

The starmap is your bridge:
- **Click neighbor** -> Attack/Diplomacy panel
- **Click your sector** -> Build/Resource management
- **Click border** -> Expansion options
- **Click wormhole** -> Construction/usage

---

## New Player Experience

> **"Every session is someone's first session"**
>
> The game teaches progressively, unlocking complexity as players gain experience:
> - **Turn 1-5**: Learn your sector ("your neighborhood in space")
> - **Turn 6-15**: Discover borders and adjacent sectors
> - **Turn 16-30**: Build wormholes to distant sectors
> - **Turn 31+**: Galaxy-wide strategic thinking
>
> Interactive tutorial shows concrete actions ("Build 100 soldiers, 50 fighters") rather than abstract rules. Skip checkbox available for veteran players.

### 20-Turn Protection Period

- No bot attacks during protection
- Bots still message (learn personality reading)
- Turn 21: "The Galactic Council protection has expired."

### 5-Step Tutorial

1. **Welcome to Your Bridge** - Introduces sector concept
2. **Meet Your Neighbors** - Highlights 3-4 key neighbors
3. **The Galaxy Beyond** - Shows full galaxy (10 sectors)
4. **Your Command Interface** - Interactive starmap demo
5. **Take Your First Turn** - Guided first actions

### Progressive Disclosure

- **Turns 1-10**: Basic panels only
- **Turns 11-20**: Add Threat Assessment
- **Turns 21+**: Full UI

---

## What's Different from Solar Realms Elite

### Improvements

1. **Strategic Geography** - 10 sectors vs flat list
2. **Combat Balance** - 47.6% win rate vs 1.2% original
3. **Onboarding** - Progressive tutorial vs BBS familiarity
4. **Anti-Snowball** - Formalized coalition mechanics
5. **Visual Design** - LCARS UI vs text only
6. **Single Player** - Designed for solo vs multiplayer only

### What We Kept

1. **100 Empires** - Massive galaxy scale
2. **Turn-Based** - No real-time stress
3. **Bot Personalities** - Distinct behaviors
4. **6 Victory Paths** - Multiple ways to win
5. **Economic Complexity** - Resource management matters

---

## Core Game vs Expansion Content

### In Base Game (v1.0)

- 3-tier draft-based research
- Unified D20 combat
- Sector-based galaxy (10 sectors, wormholes, borders)
- 100 AI bots (4 tiers, 8 archetypes)
- 6 victory conditions
- Coalition mechanics
- Covert operations (10 types)
- Market trading
- LCARS command center UI

### Deferred to Expansion

- **Crafting System** - 4-tier resource progression (see [Crafting Expansion](../expansion/CRAFTING.md))
- **Galactic Syndicate** - Criminal organization, contracts (see [Syndicate Expansion](../expansion/SYNDICATE.md))

---

## Success Metrics

| Metric | Target |
|--------|--------|
| **Game Length** | 1-2 hours |
| **Turn Processing** | < 2 seconds |
| **Attacker Win Rate** | 40-50% (equal forces) |
| **Eliminations** | 3-5 per game |
| **Learning Curve** | Playable in 10 minutes |

---

## Related Documents

- [Combat System](COMBAT-SYSTEM.md) - D20 mechanics detail
- [Bot System](BOT-SYSTEM.md) - AI architecture
- [Terminology Rules](../development/TERMINOLOGY.md) - CRITICAL
- [Architecture](../development/ARCHITECTURE.md) - Tech stack
- [Future Roadmap](../roadmap/FUTURE.md) - Future content

---

**Document History:**
- Consolidated from VISION.md (v2.0) and PRD.md (v3.0) - January 2026
- Enhanced with narrative explanations from VISION.md - January 2026
- VISION.md archived to `docs/archive/design-evolution/`

*This is the canonical design reference. All other design documents defer to this one.*
