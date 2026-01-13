# Nexus Dominion: Bot AI System

**Version:** 1.0 (Consolidated)
**Status:** Active - Primary Bot Reference
**Last Updated:** January 2026

---

## Document Purpose

This document serves as the canonical reference for all bot AI behavior in Nexus Dominion. It defines the complete bot intelligence system, from simple random bots to sophisticated LLM-powered opponents that create a dynamic, player-like experience.

**Who Should Read This:**
- Backend developers implementing bot decision logic
- Game designers balancing bot archetypes and difficulty
- Frontend developers building bot communication UI
- QA testers validating bot behavior across difficulty levels

**What This Resolves:**
- Complete specification of the 4-tier intelligence system (Random, Simple, Strategic, LLM)
- All 8 archetypes with decision matrices and personality traits
- Bot communication, coalition formation, and betrayal mechanics
- Memory, emotion, and relationship tracking systems
- LLM integration strategy and fallback chains

**Design Philosophy:**
- **Player-like unpredictability**: Bots should feel like human opponents, not robots
- **Observable but not transparent**: Players deduce personality through behavior, not labels
- **Mechanically meaningful emotions**: Emotional states affect decision probabilities, not just flavor text
- **Persistent memory with decay**: Bots remember major events longer than minor ones, creating organic rivalries
- **Scalable intelligence tiers**: Support 10-100 bots with mixed intelligence levels
- **Cost-conscious LLM usage**: Elite bots use LLM calls strategically, with robust fallbacks

---

## Table of Contents

1. [Overview](#overview)
2. [4-Tier Intelligence System](#4-tier-intelligence-system)
3. [8 Archetypes](#8-archetypes)
4. [Emotional State System](#emotional-state-system)
5. [UI/UX Design](#5-uiux-design)
6. [Requirements (Specifications)](#requirements)
7. [Implementation](#implementation)
8. [Balance Targets](#balance-targets)
9. [Migration Plan](#migration-plan)
10. [Conclusion](#10-conclusion)

---

## Overview

Nexus Dominion features 10-100 AI bot opponents with varying intelligence, personalities, and strategies. Bots create a dynamic, unpredictable game world where players must read behavior, form alliances, and anticipate betrayals.

**Key Principle**: Players cannot see bot archetype - they must deduce personality through observation.

---

## 4-Tier Intelligence System

### Tier Distribution (100 bots)

| Tier | Count | Intelligence | Description |
|------|-------|--------------|-------------|
| **Tier 1 (LLM)** | 5-10 | Elite | Natural language decisions via LLM API |
| **Tier 2 (Strategic)** | 20-25 | Sophisticated | Archetype-based decision trees |
| **Tier 3 (Simple)** | 50-60 | Mid-tier | Basic behavioral rules |
| **Tier 4 (Random)** | 10-15 | Chaotic | Weighted random, adds unpredictability |

### Tier 1: LLM-Powered Elite

Connected to LLM API (Groq → Together → OpenAI fallback chain):
- Natural language messages reflecting persona voice
- Adaptive strategies based on game state
- Async processing (decisions computed during player's turn)
- Falls back to Tier 1 Scripted on API failure

### Tier 2: Strategic Bots

Rule-based with sophisticated decision trees:
- Archetype-driven behavior
- Personality traits with mechanical effects
- Coalition formation logic
- Template-based messages (30-45 per persona)

### Tier 3: Simple Behavioral

Basic decision trees with predictable patterns:
- Responds to threats
- Minimal communication
- Balanced, Reactive, or Builder subtypes

### Tier 4: Chaotic/Random

Unpredictable behavior that adds chaos:
- Weighted random decisions
- Suboptimal choices (some intentionally)
- Creates baseline challenge

---

## 8 Archetypes

| Archetype | Style | Key Behaviors | Passive Ability |
|-----------|-------|---------------|-----------------|
| **Warlord** | Aggressive | Military focus, demands tribute | War Economy: -20% military cost when at war |
| **Diplomat** | Peaceful | Alliance-seeking, mediates | Trade Network: +10% income per alliance |
| **Merchant** | Economic | Trade focus, buys loyalty | Market Insight: Sees next turn prices |
| **Schemer** | Deceptive | False alliances, betrayals | Shadow Network: -50% agent cost |
| **Turtle** | Defensive | Never attacks first | Fortification: 2× defensive structure power |
| **Blitzkrieg** | Early rush | Fast strikes, cripples neighbors early | — |
| **Tech Rush** | Research | Tech priority, late-game power | — |
| **Opportunist** | Vulture | Attacks weakened empires | — |

### Decision Priority Matrix

| Action | Warlord | Diplomat | Merchant | Turtle | Schemer |
|--------|---------|----------|----------|--------|---------|
| **Attack** | 0.9 | 0.2 | 0.3 | 0.1 | 0.6 |
| **Defense** | 0.5 | 0.6 | 0.4 | 0.95 | 0.3 |
| **Alliance** | 0.3 | 0.95 | 0.7 | 0.5 | 0.8* |
| **Economy** | 0.4 | 0.5 | 0.95 | 0.7 | 0.5 |
| **Covert** | 0.5 | 0.2 | 0.4 | 0.3 | 0.9 |

*Schemer uses alliances for deception

---

## Emotional State System

Bots have moods that mechanically affect decisions:

| Emotion | Decision | Alliance | Aggression | Negotiation |
|---------|----------|----------|------------|-------------|
| **Confident** | +5% | -20% | +10% | +10% |
| **Arrogant** | -15% | -40% | +30% | -30% |
| **Desperate** | -10% | +40% | -20% | -20% |
| **Vengeful** | -5% | -30% | +40% | -40% |
| **Fearful** | -10% | +50% | -30% | +10% |
| **Triumphant** | +10% | -10% | +20% | -20% |

- States are **hidden** from player (inferred from messages)
- Intensity scales effects (0.0 - 1.0)
- Mechanical impact on decisions, not just flavor

---

## Relationship Memory

Bots remember interactions with **weighted decay**:

| Event | Weight | Decay Resistance |
|-------|--------|------------------|
| Captured sector | 80 | HIGH |
| Saved from destruction | 90 | HIGH |
| Broke alliance | 70 | HIGH |
| Won battle | 40 | MEDIUM |
| Trade accepted | 10 | LOW |
| Message sent | 1 | VERY LOW |

**Key Features:**
- Events have weight (1-100) and decay resistance
- Major events resist being "washed away"
- 20% of negative events are **permanent scars**
- Creates persistent rivalries without hard-coded alliances

---

## Bot Decision Engine

### Core Decision Loop

Bot decision processing follows a 5-step cycle:

1. **GATHER STATE** - Collect empire status, relationships, and game state
2. **ASSESS SITUATION** - Analyze threats, opportunities, and strategic position
3. **STRATEGIC DECISION** - Choose actions based on tier intelligence
4. **EXECUTE ACTIONS** - Perform military, economic, diplomatic, and research actions
5. **LOG & LEARN** - Record decisions and update relationship scores

For complete pseudo-code, see [Appendix 1.1: Bot Decision Engine](appendix/BOT-SYSTEM-APPENDIX.md#11-bot-decision-engine---core-loop).

### Bot Decision Types

Brief example of bot decision types:

```typescript
type BotDecision =
  | { type: "attack"; targetId: string; forces: Forces }
  | { type: "diplomacy"; action: "propose_nap" | "propose_alliance"; targetId: string }
  | { type: "trade"; resource: ResourceType; quantity: number; action: "buy" | "sell" }
  | { type: "do_nothing" }
```

For complete type definition, see [Appendix 2.1: BotDecision Type](appendix/BOT-SYSTEM-APPENDIX.md#21-botdecision-type).

---

## Player Readability (Tell System)

Each archetype has different telegraph patterns:

| Archetype | Telegraph % | Style | Advance Warning |
|-----------|-------------|-------|-----------------|
| **Warlord** | 70% | Obvious | 2-3 turns |
| **Diplomat** | 80% | Polite | 3-5 turns |
| **Schemer** | 30% | Cryptic/Inverted | 1 turn (if any) |
| **Merchant** | 60% | Transactional | 2 turns |
| **Blitzkrieg** | 40% | Minimal | 1 turn |
| **Turtle** | 90% | Clear | 5+ turns |

---

## Coalition Behavior

### Formation Logic

Coalitions form after turn 10 based on archetype behavior:
- **Diplomat**: Actively seeks allies (trust_score > 30)
- **Warlord**: Only allies with strong players (top 20% networth)
- **Merchant**: Allies with trade partners
- **Schemer**: Joins any coalition, plans betrayal after 20 turns
- **Turtle**: Joins defensive coalitions only

Bots honor defense pacts (if loyalty > 0.5), coordinate attacks, and share intelligence. Betrayals occur when trust_score < -50 or for Schemer archetype after 20 turns.

For complete coalition logic, see [Appendix 1.2: Coalition Formation Algorithm](appendix/BOT-SYSTEM-APPENDIX.md#12-coalition-formation-algorithm).

---

## Communication System

### Message Types by Archetype

**Warlord:**
```
THREAT: "Your pathetic defenses won't save you.
        Surrender 5000 credits or face annihilation."
```

**Diplomat:**
```
PROPOSAL: "Greetings! I believe our empires could benefit
          from mutual cooperation. Shall we discuss?"
```

**Schemer:**
```
FALSE: Schemer bots will use language and behaviors similar to the other archetypes. 
We may include cryptic clues, perhaps the frequency of the cryptic "tells" can be tied 
to difficulty level. What we dont want is an obvious hand wringing "muahaha" type of behavior,
defeats the ourpose of a schemer! Consider copying some warlords, diplomats, and metchants
dialog, and making a few edits as clues. 


       [Internal: Mark as future target]
```

**Merchant:**
```
OFFER: "I have 10,000 ore at competitive rates.
       Interested in a trade agreement?"
```

### Endgame Drama

LLM bots send dramatic global messages:

```
// Entering top 3
"The galaxy will learn to fear the name {empire}!"

// Major alliance
"Let it be known: {coalition} now controls 40%.
Choose your side wisely."

// Before major attack
"To {target}: Your time has come. Prepare your defenses."

// Victory declaration
"The war is over. {empire} stands supreme."
```

---

## 100 Unique Personas

Each persona has a unique voice, personality quirks, vocabulary preferences, and 30-45 message templates across categories (greeting, battle, diplomacy, trade, etc.). The `usedPhrases` set prevents repetitive messaging within a single game.

For complete BotPersona interface, see [Appendix 2.2: BotPersona Interface](appendix/BOT-SYSTEM-APPENDIX.md#22-botpersona-interface).

Personas stored in `data/personas.json`.

---

## Sample Personas

### Admiral Zharkov - The Warlord

```
BACKGROUND: Rose through conquered empire ranks,
overthrew own leaders. Respects only strength.

PERSONALITY:
- Aggressive but calculating
- Respects worthy opponents
- Despises cowardice
- Honors combat agreements

SPEAKING STYLE:
- Direct, commanding tone
- Military metaphors
- Addresses others by rank
- Never apologizes
```

### Ambassador Velara - The Diplomat

```
BACKGROUND: From small empire that survived by
making itself indispensable to larger powers.

PERSONALITY:
- Patient and thoughtful
- Genuinely values relationships
- Avoids violence when possible
- Believes in win-win solutions

SPEAKING STYLE:
- Formal and polite
- Uses "we" more than "I"
- Proposes compromises
- Warns rather than threatens
```

### The Broker - The Schemer

```
BACKGROUND: Nobody knows real name. Built and
destroyed empires from shadows.

PERSONALITY:
- Outwardly charming
- Views relationships as transactions
- Betrayal is just business
- Never reveals true intentions

SPEAKING STYLE:
- Warm, too friendly (red flag)
- "Between you and me..."
- Plants seeds of doubt
- "Nothing personal, just business"
```

---

## Implementation

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/bots/types.ts` | Bot types, decisions, archetypes |
| `src/lib/bots/archetypes/` | 8 archetype implementations |
| `src/lib/bots/emotions/` | Emotional state system |
| `src/lib/bots/memory/` | Relationship memory with decay |
| `src/lib/bots/bot-processor.ts` | Parallel turn processing |
| `src/lib/bots/difficulty.ts` | Difficulty modifiers |
| `data/personas.json` | 100 bot persona definitions |
| `data/templates/` | Message templates per persona |

### LLM Provider Chain

Tier 1 bots use a fallback chain: Groq (priority 1) → Together AI (priority 2) → OpenAI (priority 3) → Tier 2 scripted behavior.

**Rate limits:** 5000 calls/game, 50 calls/turn, 500 calls/hour, $50 daily spend cap.

For complete configuration and fallback logic, see [Appendix 3.1: LLM Provider Fallback Chain](appendix/BOT-SYSTEM-APPENDIX.md#31-llm-provider-fallback-chain).

---

## LLM System Prompts

### System Prompt Template (Tier 1 Bots)

The LLM system prompt includes:
- Empire name and archetype personality description
- Numeric trait values (aggression, diplomacy, risk tolerance, loyalty, deception)
- Current situation (turn, networth, rank, sectors, military power)
- Relationship summary (allies, enemies, trust scores, recent interactions)
- Recent events (last 5 turns of significant events)

The prompt asks the LLM to decide on military actions, production focus, diplomacy, research, and send messages while staying in character.

For complete prompt template with variable substitution, see [Appendix 4.1: Complete System Prompt Template](appendix/BOT-SYSTEM-APPENDIX.md#41-complete-system-prompt-template).

### LLM Response Schema

The LLM responds with JSON containing:
- `reasoning`: Explanation of thought process
- `actions`: Military, production, diplomacy, research, covert decisions
- `messages`: Array of messages to send to other players
- `coalition`: Invite/accept/leave decisions

For complete LLMBotResponse interface, see [Appendix 2.5: LLMBotResponse Schema](appendix/BOT-SYSTEM-APPENDIX.md#25-llmbotresponse-schema).

---

## Extended Message Examples

### Coalition Chat Examples

**Defensive Coordination:**
```
[Warlord]: {player} just hit me with 500 fighters. Requesting backup.
[Diplomat]: Sending 200 fighters as defense convoy now.
[Merchant]: I can fund reinforcements. 10,000 credits incoming.
```

**Attack Planning:**
```
[Warlord]: Empire #{target} is weak. 3000 networth, minimal defense.
           I propose coordinated strike next turn.
[Schemer]: I'll soften them up with covert ops first.
[Diplomat]: Confirmed. I'll block any treaty requests from them.
```

**Betrayal (Internal Log):**
```
[Schemer internal]: Coalition trusts me now.
                   {strongest_ally} has 80% forces deployed.
                   Strike window: next turn.
[Schemer to coalition]: "I'll guard our flank. Trust me."
```

### Global Endgame Announcements

**Last Alliance:**
```
[Global] Admiral Zharkov: "Attention all commanders. {leader} threatens
galactic domination. I propose temporary ceasefire among remaining
powers. We stop them together, or we all fall."
```

**Last Stand:**
```
[Global] Ambassador Velara: "To my allies in {coalition}: It has been
an honor. Whatever happens next, know that our alliance meant something.
For the coalition!"
```

**Villain Victory:**
```
[Global] The Broker: "You all trusted me. Every single one of you.
And now, with your fleets depleted from fighting each other...
the galaxy is mine. Thank you for playing."
```

---

## Victory Conditions & Endgame Behavior

### Victory Types

1. **Conquest**: Control 60% of total sectors
2. **Economic**: 1.5× networth of 2nd place empire
3. **Survival**: Last empire standing (turn 200+ in Campaign mode)

### Bot Endgame Escalation

As victory approaches, bot behavior intensifies:

- **Turn 150+**: Increased aggression across all archetypes
- **Leader at 50% dominance**: Defensive coalitions form automatically
- **Last 3 empires**: Maximum drama in communications
- **Tier 1 LLM bots**: Generate dramatic monologues

---

## Decision Audit System

### Bot Decision Logging

All bot decisions are logged with:
- Decision type, data, and reasoning
- Pre-decision state (resources, military, relationships, emotion)
- Raw LLM response (if applicable)
- Outcome (success, impact)

**Player Access**: Decision logs visible in post-game analysis (optional "God Mode" view)

For complete BotDecisionLog interface, see [Appendix 2.3: BotDecisionLog Interface](appendix/BOT-SYSTEM-APPENDIX.md#23-botdecisionlog-interface).

---

## Implementation Phases

### Phase 1: Foundation (M12)
- [x] Create bot database schema (Drizzle)
- [x] Implement bot creation during game setup
- [x] Basic turn processing for bots
- [x] Tier 4 (random) behavior

### Phase 2: Strategic Bots (M13)
- [ ] Implement Tier 3 simple behaviors
- [ ] Implement Tier 2 decision trees
- [ ] Message template system (30-45 per persona)
- [ ] Basic alliance behavior

### Phase 3: LLM Integration (M14)
- [ ] LLM provider abstraction layer (Groq/Together/OpenAI)
- [ ] Tier 1 bot prompts and response parsing
- [ ] Natural language message generation
- [ ] Coalition coordination with LLM

### Phase 4: Memory & Emotion (M15)
- [ ] Relationship memory with weighted decay
- [ ] Emotional state system with mechanical effects
- [ ] Telegraph system (readable patterns)
- [ ] Grudge/revenge mechanics

### Phase 5: Polish (M16)
- [ ] Balance tuning (win rates per archetype)
- [ ] Dramatic endgame messaging
- [ ] Decision log viewer for entertainment
- [ ] Difficulty settings (bot strength modifiers)

### Phase 6: Advanced Features (Post-Launch)
- [ ] Bot personality evolution (learn from games)
- [ ] Memorable nemesis system (bots remember across games)
- [ ] Spectator mode (watch bots play each other)
- [ ] Replay system with bot reasoning

---

## Configuration & Tuning

### Game Setup Options

Game configuration controls:
- Bot count (10-100)
- Tier distribution (LLM, Strategic, Simple, Chaotic)
- LLM settings (enabled, providers, rate limits)
- Difficulty (easy, normal, hard, nightmare)

Difficulty affects bot resources, decision quality, and aggression levels.

For complete BotGameConfig interface, see [Appendix 2.4: BotGameConfig Interface](appendix/BOT-SYSTEM-APPENDIX.md#24-botgameconfig-interface).

### Difficulty Modifiers

| Difficulty | Bot Resources | Decision Quality | Aggression |
|------------|---------------|------------------|------------|
| Easy | -20% | 70% optimal | -10% |
| Normal | 100% | 85% optimal | 100% |
| Hard | 100% | 95% optimal | +10% |
| Nightmare | +20% | 100% optimal | +20% |

---

## Balance Targets

### Win Rate Expectations (Normal Difficulty, 100-bot games)

| Archetype | Target Win Rate | Avg Placement | Victory Type Preference |
|-----------|----------------|---------------|------------------------|
| **Warlord** | 12-15% | Top 15 | Conquest (60%), Economic (40%) |
| **Diplomat** | 10-13% | Top 20 | Survival (50%), Economic (50%) |
| **Merchant** | 13-16% | Top 12 | Economic (80%), Conquest (20%) |
| **Schemer** | 14-18% | Top 10 | Conquest (70%), Economic (30%) |
| **Turtle** | 8-10% | Top 25 | Survival (90%), Economic (10%) |
| **Blitzkrieg** | 11-14% | Top 18 | Conquest (95%), Eliminated Early (30%) |
| **Tech Rush** | 12-15% | Top 15 | Economic (60%), Conquest (40%) |
| **Opportunist** | 10-12% | Top 22 | Conquest (65%), Economic (35%) |

**Intelligence Tier Win Rates:**
- Tier 1 (LLM): 15-20% win rate (should feel like strong human players)
- Tier 2 (Strategic): 10-15% win rate (competent opponents)
- Tier 3 (Simple): 5-8% win rate (baseline challenge)
- Tier 4 (Random): 2-5% win rate (chaos factor)

### Performance Metrics

**Bot Decision Quality:**
- Average decision time: <500ms for Tier 2-4, <2s for Tier 1 LLM calls
- LLM API success rate: >95% (with fallback chain)
- Decision coherence: Bots should maintain archetype personality >85% of actions
- Coalition betrayal timing: Scheming archetype betrays after 20+ turns, others only if trust <-50

**Communication Targets:**
- Message variety: Minimum 30 unique templates per persona
- Template reuse: <10% repetition in single game
- Telegraph accuracy: Warlord threats predict attacks 70% of time, Schemer 30%
- Drama escalation: 2-5 global announcements in last 20 turns

**Memory & Emotion:**
- Memory decay rate: Minor events decay 50% per 10 turns, major events 10% per 20 turns
- Permanent grudge rate: 20% of major negative events never decay
- Emotion state changes: 3-7 transitions per bot per game
- Emotion intensity impact: Full intensity (1.0) should swing decision probabilities by ±30%

### Testing Checklist

**Core Functionality:**
- [ ] All 8 archetypes make decisions consistent with personality matrix
- [ ] Tier 1 LLM bots generate natural language messages
- [ ] Fallback chain works when LLM providers fail
- [ ] Bot turn processing completes <5s for 100 bots (parallelized)
- [ ] Coalition formation triggers after turn 10 in 80%+ of games
- [ ] Schemer archetype betrays allies in 90%+ of games

**Balance Validation:**
- [ ] Run 100 simulations per archetype, verify win rates within target ranges
- [ ] Verify Tier 1 bots win 2-3× more often than Tier 4 bots
- [ ] No single archetype wins >25% of games (indicates imbalance)
- [ ] Turtle archetype eliminated before turn 50 in <15% of games
- [ ] Blitzkrieg archetype achieves early kills in 60%+ of games

**Communication & Personality:**
- [ ] Each persona uses unique voice (verified by sampling 10 messages per persona)
- [ ] No template repetition exceeds 10% in single-game spot check
- [ ] Warlord threats precede attacks 70% ±10%
- [ ] Diplomat proposals accepted >50% of time (indicates appropriate targeting)
- [ ] Schemer messages contain false promises >40% of alliance proposals

**Memory & Relationships:**
- [ ] Major betrayal events create lasting negative relationship scores (<-30 after 50 turns)
- [ ] Minor positive events (trades) decay to near-zero after 30 turns
- [ ] Permanent grudges persist for 100+ turns in 20% of major events
- [ ] Emotion states trigger appropriate behavior changes (Desperate bots seek alliances)

**Performance & Stability:**
- [ ] LLM API fallback chain tested with provider outages
- [ ] Rate limits prevent excessive API costs (<$50/day across all games)
- [ ] Bot decision logs stored without performance impact
- [ ] 100-bot games complete 200 turns in <60 minutes real-time

**Player Experience:**
- [ ] Playtesters correctly identify 4+ archetypes through observation alone
- [ ] Players report "bots feel human" in >70% of feedback
- [ ] Coalition betrayals create memorable dramatic moments
- [ ] Endgame messaging creates tension in final turns

---

## 5. UI/UX Design

### 5.1 Bot Communication Interface

Players interact with bots primarily through the messaging system:

**Message Display:**
```
┌─────────────────────────────────────────────────────────┐
│  Messages                                      [Mark All Read]│
├─────────────────────────────────────────────────────────┤
│  [!] Admiral Zharkov (Warlord)                Turn 45  │
│      "Your pathetic defenses won't save you..."        │
│                                        [Reply] [Archive] │
│                                                         │
│  [★] Ambassador Velara (Diplomat)             Turn 44  │
│      "I propose a Non-Aggression Pact..."              │
│                                        [Accept] [Decline]│
│                                                         │
│  [?] The Broker (Schemer)                     Turn 43  │
│      "Between you and me, let's form an alliance..."   │
│                                        [Reply] [Ignore]  │
└─────────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- **[!]** = Threat/warning message (red)
- **[★]** = Alliance/diplomatic proposal (blue)
- **[?]** = Trade offer or mysterious message (yellow)
- **[$]** = Economic message (green)

### 5.2 Bot Behavior Observation

Players observe bot behavior through several UI elements:

**Empire List (Spy Report Style):**
```
┌─────────────────────────────────────────────────────────┐
│  Empires                                    [Sort: Networth]│
├─────────────────────────────────────────────────────────┤
│  #1  Admiral Zharkov's Domain          NW: 125,000     │
│      Recent: Attacked Merchant Guild (turn 43)         │
│      Stance: [████████░░] Aggressive                   │
│                                                         │
│  #2  Diplomatic Corps                  NW: 118,000     │
│      Recent: Proposed NAP to 3 empires                 │
│      Stance: [░░████████] Peaceful                     │
│                                                         │
│  #3  Shadow Syndicate                  NW: 105,000     │
│      Recent: Unknown movements                          │
│      Stance: [░░░░?░░░░░] Unpredictable               │
└─────────────────────────────────────────────────────────┘
```

**Key Observations:**
- Recent activity log (attacks, alliances, trades)
- Aggression stance indicator (inferred from actions, not labeled as archetype)
- Coalition membership (if known)
- Military buildup warnings

### 5.3 Coalition Chat Interface

When invited to or forming coalitions, players see a shared chat:

```
┌─────────────────────────────────────────────────────────┐
│  Coalition: "Galactic Defense Pact"                    │
│  Members: You, Ambassador Velara, Merchant Tycoon      │
├─────────────────────────────────────────────────────────┤
│  [Turn 44] Ambassador Velara:                          │
│  "Admiral Zharkov is building up forces on our border. │
│   Requesting defensive support."                        │
│                                                         │
│  [Turn 44] You:                                        │
│  "I can send 200 fighters. What's our strategy?"       │
│                                                         │
│  [Turn 45] Merchant Tycoon:                            │
│  "I'll fund reinforcements. 10,000 credits incoming."  │
│                                                         │
│  [Input] _________________________________ [Send]       │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Bot Personality Tell System

Players learn to identify bot archetypes through behavioral patterns:

**Warlord Tells:**
- Frequent military movements visible on map
- Direct threat messages 2-3 turns before attack
- Resource allocation: 70% military, 20% economy, 10% research

**Diplomat Tells:**
- Multiple alliance proposals per game
- Mediates conflicts between other empires
- Warns 3-5 turns before taking any aggressive action

**Schemer Tells:**
- Overly friendly messages ("Between you and me...")
- Joins coalitions early, leaves after 20+ turns
- Hidden military buildups (not visible until too late)

**Visual Cues:**
- Message tone and vocabulary
- Military movement patterns
- Alliance longevity
- Trade behavior (Merchant bots trade frequently)

### 5.5 Post-Game "God Mode" Viewer

After game completion, players can review bot decision logs:

```
┌─────────────────────────────────────────────────────────┐
│  Bot Decision Viewer: Admiral Zharkov (Turn 45)        │
├─────────────────────────────────────────────────────────┤
│  Decision: Attack Merchant Guild                       │
│                                                         │
│  Reasoning:                                             │
│  "I just defeated the Merchant Guild and they're       │
│   rattled. Time to finish them while they're weak.     │
│   The Diplomatic Corps is a useful ally - maintain     │
│   that NAP."                                            │
│                                                         │
│  Pre-Decision State:                                   │
│  - Networth: 125,000 (Rank #3)                        │
│  - Emotion: Triumphant (intensity 0.8)                │
│  - Relationship with Merchant Guild: -40 (hostile)    │
│                                                         │
│  Action Taken:                                          │
│  - Attack with 300 fighters, 150 bombers              │
│  - Production focus: 70% military                      │
│                                                         │
│  Outcome: Victory - Captured 2 sectors                 │
│                                                         │
│  [← Previous] [Next →] [Timeline View] [Close]         │
└─────────────────────────────────────────────────────────┘
```

### 5.6 Visual Design Principles

**Color Coding:**
- Red: Threats, attacks, hostile actions
- Blue: Diplomatic proposals, alliances
- Yellow: Warnings, unknown/mystery
- Green: Economic actions, trades
- Purple: Coalition activities

**LCARS-Inspired Styling:**
- Clean, futuristic interface
- Rounded panel corners
- High contrast text
- Minimalist, data-focused design

**Responsive Behavior:**
- Mobile-friendly message interface
- Collapsible coalition chat
- Quick-action buttons for common responses

---

# Requirements

**integrate with new template**

**Source Document:** `docs/design/BOT-SYSTEM.md`

### REQ-BOT-001: Four-Tier Intelligence (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-BOT-001-A through REQ-BOT-001-D for individual intelligence tier definitions.

**Overview:** Bots operate in 4 intelligence tiers from elite LLM-driven to chaotic random behavior. Creates varied opposition and skill curve.

---

### REQ-BOT-001-A: Tier 1 LLM Intelligence

**Description:** Tier 1 intelligence uses LLM API integration for 5-10 elite bots with natural language decisions. Uses Groq → Together → OpenAI fallback chain for reliability. Processes async during player turn. Falls back to Tier 2 on API failure.

**Rationale:** Creates most sophisticated bot opponents using AI for realistic decision-making. Fallback chain ensures reliability.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Intelligence Tier | Tier 1 (LLM) |
| Bot Count | 5-10 elite bots |
| Processing | Async during player turn |
| LLM Provider Chain | Groq → Together → OpenAI |
| Fallback | Tier 2 Strategic on API failure |
| Personality | Custom prompts per persona |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/types.ts` - `BotIntelligenceTier` enum
- `src/lib/bots/llm/llm-bot-processor.ts` - LLM decision logic
- `src/lib/bots/llm/provider-chain.ts` - Fallback chain implementation

**Tests:**
- `src/lib/bots/__tests__/llm-bot-processor.test.ts` - LLM integration, fallback behavior

**Status:** Draft

---

### REQ-BOT-001-B: Tier 2 Strategic Intelligence

**Description:** Tier 2 intelligence uses archetype-based decision trees for 20-25 bots. Sophisticated coalition and betrayal logic. Template-based messages (30-45 per persona) for communication.

**Rationale:** Provides strong strategic opponents without LLM cost. Archetype system creates predictable but varied behavior.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Intelligence Tier | Tier 2 (Strategic) |
| Bot Count | 20-25 bots |
| Decision Model | Archetype-based decision trees |
| Message Templates | 30-45 per persona |
| Coalition Logic | Sophisticated formation and betrayal |
| Priority System | Weighted priorities by archetype |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/types.ts` - `BotIntelligenceTier` enum
- `src/lib/bots/strategic/strategic-bot-processor.ts` - Strategic decision logic
- `src/lib/bots/archetypes/` - Archetype implementations
- `src/lib/bots/messages/templates.ts` - Message template system

**Tests:**
- `src/lib/bots/__tests__/strategic-bot-processor.test.ts` - Decision tree logic, archetype behavior

**Status:** Draft

**Cross-Reference:** REQ-BOT-002 (Archetype System)

---

### REQ-BOT-001-C: Tier 3 Simple Intelligence

**Description:** Tier 3 intelligence uses basic behavioral rules for 50-60 bots. Simple if/then decision trees with minimal communication. Three subtypes: Balanced, Reactive, Builder.

**Rationale:** Provides competent but predictable opposition for majority of bots. Low computational cost enables scaling to 100 total bots.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Intelligence Tier | Tier 3 (Simple) |
| Bot Count | 50-60 bots |
| Decision Model | Basic if/then rules |
| Subtypes | Balanced, Reactive, Builder |
| Communication | Minimal |
| Complexity | Simple behavioral rules |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/types.ts` - `BotIntelligenceTier` enum, `SimpleSubtype` enum
- `src/lib/bots/simple/simple-bot-processor.ts` - Simple decision logic
- `src/lib/bots/simple/balanced-bot.ts` - Balanced subtype
- `src/lib/bots/simple/reactive-bot.ts` - Reactive subtype
- `src/lib/bots/simple/builder-bot.ts` - Builder subtype

**Tests:**
- `src/lib/bots/__tests__/simple-bot-processor.test.ts` - Basic decision logic, subtype behavior

**Status:** Draft

---

### REQ-BOT-001-D: Tier 4 Random Intelligence

**Description:** Tier 4 intelligence uses weighted random decisions for 10-15 chaotic bots. Intentionally suboptimal choices with constraints to prevent complete failure. Adds unpredictability and baseline challenge.

**Rationale:** Creates unpredictable wild-card opponents. Provides entertainment value through chaos while maintaining minimal viability through constraints.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Intelligence Tier | Tier 4 (Random) |
| Bot Count | 10-15 chaotic bots |
| Decision Model | Weighted random with constraints |
| Behavior | Intentionally suboptimal |
| Purpose | Unpredictability, baseline challenge |
| Constraints | Prevents complete failure |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/types.ts` - `BotIntelligenceTier` enum
- `src/lib/bots/random/random-bot-processor.ts` - Random decision logic with constraints

**Tests:**
- `src/lib/bots/__tests__/random-bot-processor.test.ts` - Random behavior, constraint enforcement

**Status:** Draft

---

### 7.6 Bot Archetypes

### REQ-BOT-002: Archetype System Overview (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-BOT-002-01 through REQ-BOT-002-08 for individual archetype definitions.

**Description:** Bot archetype system that defines 8 distinct behavioral patterns with unique passive abilities, decision priorities, and commander statistics. Each archetype creates a memorable, predictable opponent with distinct mechanical advantages.

**Decision Formula:**
```
Action Weight = Base Priority × Emotional Modifier × Situational Adjustment

Final Action = argmax(Action Weight for all possible actions)
```

**Rationale:** Creates diverse, memorable opponents with distinct mechanical advantages and playstyles. Priority matrix ensures predictable but varied behavior.

**Source:** Section 7.6

**Formulas:** See `docs/PRD-FORMULAS-ADDENDUM.md` Section 4.2-4.4

**Code:** `src/lib/bots/archetypes/`, `src/lib/bots/types.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-01: Warlord Archetype

**Description:** Aggressive military-focused archetype with War Economy passive ability that reduces military costs during wartime.

**Passive Ability:** War Economy (-20% military cost when at war)

**Priority Matrix:**
- Attack: 0.9
- Defense: 0.5
- Alliance: 0.3
- Economy: 0.4
- Covert: 0.5

**Commander Stats:** INT 12 (+1), WIS 14 (+2), CHA 8 (-1)

**Behavior:** Prioritizes offensive military operations and maintains aggressive expansion through conquest.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/warlord.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-02: Diplomat Archetype

**Description:** Alliance-seeking mediator archetype with Trade Network passive that increases income based on active alliances.

**Passive Ability:** Trade Network (+10% income per active alliance)

**Priority Matrix:**
- Alliance: 0.95
- Attack: 0.2
- Defense: 0.6
- Economy: 0.5
- Covert: 0.2

**Commander Stats:** INT 13 (+1), WIS 14 (+2), CHA 18 (+4)

**Behavior:** Actively seeks and maintains alliances, mediates conflicts, and uses diplomatic relationships for economic advantage.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/diplomat.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-03: Merchant Archetype

**Description:** Economic domination archetype with Market Insight passive that provides advance knowledge of market prices.

**Passive Ability:** Market Insight (sees next turn market prices)

**Priority Matrix:**
- Economy: 0.95
- Alliance: 0.7
- Attack: 0.3
- Defense: 0.4
- Covert: 0.4

**Commander Stats:** INT 14 (+2), WIS 13 (+1), CHA 15 (+2)

**Behavior:** Focuses on economic development, market manipulation, and buying loyalty through trade advantages.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/merchant.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-04: Schemer Archetype

**Description:** Deceptive tactics archetype with Shadow Network passive that reduces covert operation costs.

**Passive Ability:** Shadow Network (-50% covert operation cost)

**Priority Matrix:**
- Covert: 0.9
- Alliance: 0.8 (for deception purposes)
- Attack: 0.6
- Defense: 0.3
- Economy: 0.5

**Commander Stats:** INT 13 (+1), WIS 15 (+2), CHA 16 (+3)

**Behavior:** Employs deceptive tactics, forms alliances for betrayal opportunities, and relies heavily on covert operations.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/schemer.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-05: Turtle Archetype

**Description:** Defensive buildup archetype with Fortification passive that doubles defensive structure power.

**Passive Ability:** Fortification (2× defensive structure power)

**Priority Matrix:**
- Defense: 0.95
- Economy: 0.7
- Attack: 0.1
- Alliance: 0.5
- Covert: 0.3

**Commander Stats:** INT 14 (+2), WIS 16 (+3), CHA 10 (+0)

**Behavior:** Focuses on defensive structures and economic development. Never initiates attacks but responds strongly when attacked.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/turtle.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-06: Blitzkrieg Archetype

**Description:** Fast early expansion archetype focused on aggressive strikes and rapid territorial acquisition.

**Passive Ability:** None specified

**Priority Matrix:**
- Attack: 0.95
- Defense: 0.2
- Alliance: 0.2
- Economy: 0.5
- Covert: 0.4

**Commander Stats:** INT 12 (+1), WIS 10 (+0), CHA 12 (+1)

**Behavior:** Prioritizes early game aggression, rapid expansion, and maintains offensive pressure throughout the game.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/blitzkrieg.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-07: Tech Rush Archetype

**Description:** Research-prioritized archetype that focuses on economic and technological development for late-game power spike.

**Passive Ability:** None specified

**Priority Matrix:**
- Economy: 0.6
- Defense: 0.5
- Attack: 0.3
- Alliance: 0.4
- Covert: 0.3

**Commander Stats:** INT 17 (+3), WIS 12 (+1), CHA 10 (+0)

**Behavior:** Focuses on research and economic development in early-mid game, becomes powerful in late game through technological advantages.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/tech-rush.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-002-08: Opportunist Archetype

**Description:** Adaptive vulture strategy archetype that targets weakened empires and exploits opportunities.

**Passive Ability:** None specified

**Priority Matrix:**
- Attack: 0.7
- Economy: 0.6
- Defense: 0.4
- Alliance: 0.4
- Covert: 0.5

**Commander Stats:** INT 13 (+1), WIS 14 (+2), CHA 11 (+0)

**Behavior:** Monitors empire strengths, opportunistically attacks weakened targets, and adapts strategy based on game state.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.6

**Code:** `src/lib/bots/archetypes/opportunist.ts`

**Tests:** TBD

**Status:** Draft

---

### 7.8 Emotional State System

### REQ-BOT-003: Emotional States (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-BOT-003-A through REQ-BOT-003-F for individual emotional state definitions.

**Overview:** Bots have 6 emotional states that mechanically affect decisions through percentage modifiers to decision quality, alliance willingness, aggression, and negotiation.

---

### REQ-BOT-003-A: Confident Emotional State

**Description:** Confident state is the baseline positive state when bot is doing well and balanced. Provides +5% decision, -20% alliance, +10% aggression, +10% negotiation.

**Rationale:** Baseline state for successful bots. Slight bonuses without extreme behavior changes.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | +5% |
| Alliance Willingness | -20% |
| Aggression | +10% |
| Negotiation | +10% |
| Trigger | Steady progress, winning battles |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/confident-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-B: Arrogant Emotional State

**Description:** Arrogant state from excessive success creates vulnerability through hubris. Provides -15% decision, -40% alliance, +30% aggression, -30% negotiation.

**Rationale:** Punishes excessive success with poor decision-making and diplomatic isolation. Creates comeback opportunities for trailing players.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -15% |
| Alliance Willingness | -40% |
| Aggression | +30% |
| Negotiation | -30% |
| Trigger | Multiple victories, high networth lead, dominant position |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/arrogant-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-C: Desperate Emotional State

**Description:** Desperate crisis mode when losing badly. Bot makes wild moves. Provides -10% decision, +40% alliance, -20% aggression, -20% negotiation.

**Rationale:** Losing bots become alliance-seeking and unpredictable. Creates dramatic comeback attempts.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -10% |
| Alliance Willingness | +40% |
| Aggression | -20% |
| Negotiation | -20% |
| Trigger | Low networth, losing sectors, under sustained attack |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/desperate-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-D: Vengeful Emotional State

**Description:** Vengeful state driven by revenge focus. Personal grudges override strategy. Provides -5% decision, -30% alliance, +40% aggression (toward target), -40% negotiation.

**Rationale:** Emotional override creates irrational but narratively compelling behavior. Target-specific aggression adds drama.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -5% |
| Alliance Willingness | -30% |
| Aggression | +40% (toward revenge target) |
| Negotiation | -40% |
| Trigger | Sector capture, treaty betrayal, major attack |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/vengeful-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-E: Fearful Emotional State

**Description:** Fearful defensive state worried about survival. Seeks protection. Provides -10% decision, +50% alliance, -30% aggression, +10% negotiation.

**Rationale:** Survival instinct creates defensive coalitions. Highest alliance willingness encourages diplomatic gameplay.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -10% |
| Alliance Willingness | +50% |
| Aggression | -30% |
| Negotiation | +10% |
| Trigger | Enemy buildup on borders, recent defeat, networth dropping |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/fearful-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-F: Triumphant Emotional State

**Description:** Triumphant victory high state with post-win momentum and boldness. Provides +10% decision, -10% alliance, +20% aggression, -20% negotiation.

**Rationale:** Victory momentum creates aggressive expansion phase. Temporary power spike after major wins.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | +10% |
| Alliance Willingness | -10% |
| Aggression | +20% |
| Negotiation | -20% |
| Trigger | Won major battle, captured valuable sector, eliminated enemy |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/triumphant-state.ts`

**Tests:** TBD

**Status:** Draft

---

### 7.9 Relationship Memory

### REQ-BOT-004: Memory System with Weighted Decay

**Description:** Bots remember past interactions with sophisticated decay mechanics:

**Event Weighting:**
- Events have weight (1-100) based on significance
- Events have decay resistance levels (LOW, MEDIUM, HIGH, PERMANENT)
- Examples:
  - Captured sector: Weight 80, Decay Resistance HIGH
  - Saved from destruction: Weight 90, Decay Resistance HIGH
  - Broke alliance: Weight 70, Decay Resistance HIGH
  - Won battle: Weight 40, Decay Resistance MEDIUM
  - Trade accepted: Weight 10, Decay Resistance LOW
  - Message sent: Weight 1, Decay Resistance VERY LOW

**Decay System:**
- High-resistance events decay slowly (major betrayals, sector captures)
- Low-resistance events decay quickly (minor trades, casual messages)
- 20% of negative events become permanent scars (never decay)
- Memory cleanup runs every 5 turns

**Effects:**
- Trust score: Positive events increase, negative events decrease
- Threat score: Military actions against bot increase
- Value score: Economic/strategic value as potential ally

**Rationale:** Creates persistent relationships and grudges without hard-coding alliances. Major events (betrayals, conquests) resist being "washed away" by minor positive actions. Permanent scars ensure some grudges last the entire game.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/memory/`, `src/lib/game/repositories/bot-memory-repository.ts`

**Tests:** `src/lib/game/repositories/__tests__/bot-memory-repository.test.ts`

**Status:** Draft

---

### 7.10 Bot Personas

### REQ-BOT-005: 100 Unique Personas

**Description:** 100 unique bot personas with structured voice and message templates.

Each persona includes:
- Unique ID and name
- Archetype assignment
- Voice characteristics (tone, quirks, vocabulary, catchphrase)
- 30-45 message templates across categories (greeting, battle, diplomacy, trade, etc.)
- Phrase tracking to prevent repetition within a game

**Template Variables:**
- `{player_name}`, `{empire_name}`, `{target}`, `{sector_count}`, etc.
- Templates filled dynamically based on game state

For complete BotPersona interface, see [Appendix 2.2: BotPersona Interface](appendix/BOT-SYSTEM-APPENDIX.md#22-botpersona-interface).

**Rationale:** Creates memorable, distinguishable opponents. Voice and quirks ensure each bot feels unique. Template variety prevents repetitive messages.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `data/personas.json`, `src/lib/bots/personas.ts`

**Tests:** `src/lib/messages/__tests__/personas.test.ts`

**Status:** Draft

---

### REQ-BOT-006: LLM Integration (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-BOT-006-A through REQ-BOT-006-C below.

**Overview:** Tier 1 bots integrate with LLM APIs for natural language decision-making, with multi-provider fallback chain, structured prompts, and cost controls.

**Integration Components:**
- Provider Chain: Multi-provider fallback strategy [REQ-BOT-006-A]
- System Prompt: Structured context template [REQ-BOT-006-B]
- Rate Limits: Cost and usage controls [REQ-BOT-006-C]

---

### REQ-BOT-006-A: LLM Provider Chain and Fallbacks

**Description:** Tier 1 bots use a cascading provider chain for LLM calls, starting with fast/cheap providers and falling back to reliable/expensive options or scripted behavior on failure.

**Provider Chain:**
1. **Primary: Groq**
   - Speed: Very fast (optimized inference)
   - Cost: Low ($0.10 per 1M tokens)
   - Reliability: Good
   - Fallback trigger: API unavailable, timeout, or error

2. **Fallback 1: Together AI**
   - Speed: Medium
   - Cost: Medium ($0.20 per 1M tokens)
   - Reliability: Very good
   - Fallback trigger: API unavailable, timeout, or error

3. **Fallback 2: OpenAI**
   - Speed: Medium
   - Cost: High ($1.00 per 1M tokens)
   - Reliability: Excellent
   - Fallback trigger: API unavailable, timeout, or error

4. **Emergency: Tier 2 Scripted Behavior**
   - Speed: Instant (no API call)
   - Cost: Free
   - Reliability: Guaranteed
   - Trigger: All LLM providers failed or rate limits exceeded

**Fallback Logic:**
- Try each provider in sequence with 10-second timeout
- Cache provider availability status for 5 minutes
- Log all fallbacks for monitoring
- Never fail - always fall back to scripted behavior

**Rationale:** Multi-provider strategy balances cost, speed, and reliability. Groq provides fast, cheap responses for most decisions. Together AI and OpenAI provide backup when Groq is down. Scripted fallback ensures game never breaks due to API issues.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 8.3 - LLM Integration, Provider Chain

**Code:** TBD - `src/lib/bots/llm/provider-chain.ts` - Provider fallback logic

**Tests:** TBD - Verify provider failover, timeout handling, emergency fallback

**Status:** Draft

---

### REQ-BOT-006-B: LLM System Prompt Template

**Description:** Structured prompt template that provides LLM with complete game context, personality definition, and response format requirements.

**Prompt Template Structure:**
```
You are {empire_name}, a player in Nexus Dominion.

PERSONALITY: {archetype_description}
TRAITS: Aggression {aggression}/10, Diplomacy {diplomacy}/10, Economy {economy}/10, Cunning {cunning}/10

CURRENT SITUATION:
Turn: {turn_number}
Sectors: {sector_count}
Military Power: {military_power}
Resources: {resource_summary}
Victory Points: {vp_current}/{vp_target}

YOUR RELATIONSHIPS:
{relationship_summary}
- [Empire Name]: Trust {trust_score}, Reputation {reputation}, Treaties: {treaty_list}

RECENT EVENTS:
{recent_events}
- Turn N: Event description with impact

AVAILABLE ACTIONS:
{action_options}

Decide your actions for this turn. Respond in JSON format.
Stay in character as {archetype}.
```

**Response Schema:**
```json
{
  "reasoning": "String explaining thought process in-character",
  "actions": {
    "military": {
      "build": [{"unit": "Fighter", "quantity": 5, "sector": "Alpha"}],
      "attack": [{"target": "EmpireX", "sectors": ["Beta"], "units": {...}}]
    },
    "production": {
      "focus": "military|economy|research"
    },
    "diplomacy": {
      "treaties": [{"type": "NAP", "target": "EmpireY", "duration": 20}]
    },
    "research": {
      "priority": "Military Doctrine Tier 2"
    },
    "covert": {
      "operations": [{"type": "Sabotage Infrastructure", "target": "EmpireZ"}]
    }
  },
  "messages": [
    {
      "recipient": "EmpireY",
      "subject": "Alliance Proposal",
      "content": "In-character message text"
    }
  ],
  "coalition": {
    "invite": ["EmpireA"],
    "accept": ["CoalitionB"],
    "leave": false
  }
}
```

**Rationale:** Structured prompt ensures LLM has all necessary context to make informed decisions. Personality and traits guide decision-making style. Recent events provide continuity. JSON schema ensures parseable responses.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 8.3 - LLM Integration, Prompt Template

**Code:** TBD - `src/lib/bots/llm/prompt-builder.ts` - Prompt generation

**Tests:** TBD - Verify prompt generation with all context fields

**Status:** Draft

---

### REQ-BOT-006-C: LLM Rate Limits and Cost Controls

**Description:** Hard limits on LLM API usage to prevent runaway costs while ensuring reasonable AI quality throughout the game.

**Rate Limits:**
1. **Per-Game Limit: 5,000 LLM calls**
   - Purpose: Cap total LLM usage per game
   - Typical usage: ~50-100 bots × 50-100 turns = 2,500-10,000 potential calls
   - Enforcement: Track calls per game, fall back to scripted when exceeded
   - Reset: Never (game-lifetime limit)

2. **Per-Turn Limit: 50 LLM calls**
   - Purpose: Prevent turn processing delays
   - Typical usage: ~10-20 bots per turn
   - Enforcement: Prioritize high-impact bots, use scripted for others
   - Reset: Every turn

3. **Per-Hour Limit: 500 LLM calls**
   - Purpose: Respect provider rate limits
   - Typical usage: ~100-200 calls/hour for active game
   - Enforcement: Queue calls, distribute across hour
   - Reset: Rolling 60-minute window

4. **Daily Spend Cap: $50.00**
   - Purpose: Hard cost control
   - Typical cost: $0.10-1.00 per 1M tokens, ~$10-20/day expected
   - Enforcement: Stop LLM calls when cap reached, use scripted
   - Reset: Midnight UTC

**Fallback Behavior:**
- When any limit exceeded: Fall back to Tier 2 scripted behavior
- Priority: Military decisions > Diplomacy > Economy > Covert
- Logging: Record all rate limit events for monitoring

**Rationale:** Rate limits prevent cost overruns while maintaining game quality. Per-game limit ensures budget predictability. Per-turn limit prevents slow turn processing. Per-hour limit respects provider constraints. Daily spend cap provides absolute cost safety.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 8.3 - LLM Integration, Rate Limits

**Code:** TBD - `src/lib/bots/llm/rate-limiter.ts` - Rate limiting logic

**Tests:** TBD - Verify all four rate limits enforced, fallback behavior

**Status:** Draft

---

### REQ-BOT-007: Decision Audit System

**Description:** All bot decisions are logged with full context for debugging and player entertainment:

```typescript
interface BotDecisionLog {
  id: string;
  botId: string;
  gameId: string;
  turnNumber: number;

  decisionType: BotDecisionType;
  decisionData: Record<string, unknown>;
  reasoning: string;              // Why bot made this choice
  llmResponse?: string;           // Raw LLM response if applicable

  preDecisionState: {
    resources: Resources;
    military: Forces;
    relationships: RelationshipScore[];
    emotion: EmotionalState;
  };

  outcome?: {
    success: boolean;
    impact: string;
  };

  createdAt: Date;
}
```

**Player Access:**
- Post-game analysis view shows all bot decisions
- Optional "God Mode" view during game (debug/spectator)
- Reasoning visible for understanding bot strategy

**Rationale:** Transparency for debugging, entertainment value seeing bot thought process, learning tool for understanding AI behavior.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/game/repositories/bot-decision-log-repository.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-008: Coalition AI Behavior (Split)

> **Note:** This spec has been split into atomic sub-specs for independent implementation and testing. See REQ-BOT-008-A through REQ-BOT-008-C below.

**Overview:** Bots form, manage, and betray coalitions based on archetype and game state, creating dynamic alliance politics.

**Coalition Mechanics:**
- Formation: Archetype-based joining logic [REQ-BOT-008-A]
- Behavior: Coordination within coalitions [REQ-BOT-008-B]
- Betrayal/Leave: Exit conditions [REQ-BOT-008-C]

---

### REQ-BOT-008-A: Coalition Formation Logic

**Description:** Bots decide whether to form or join coalitions based on their archetype personality, game state, and relationship scores, with formation only occurring after turn 10.

**Formation Rules (game turn > 10):**

1. **Diplomat:**
   - Strategy: Actively seeks allies
   - Trigger: trust_score > 30 with any empire
   - Frequency: Proposes alliances every 5 turns
   - Target: Any empire meeting trust threshold

2. **Warlord:**
   - Strategy: Only allies with strong players
   - Trigger: Target in top 20% networth
   - Frequency: Selective, evaluates every 10 turns
   - Target: Military powerhouses only

3. **Merchant:**
   - Strategy: Allies with trade partners
   - Trigger: Active trade relationship exists
   - Frequency: After 10+ completed trades
   - Target: Empires with mutual economic benefit

4. **Schemer:**
   - Strategy: Joins any coalition (plans betrayal)
   - Trigger: Any coalition invite
   - Frequency: Accepts all reasonable offers
   - Target: Any coalition (planning 20-turn betrayal timer)

5. **Turtle:**
   - Strategy: Joins defensive coalitions only
   - Trigger: Under attack or threatened
   - Frequency: When defensive need exists
   - Target: Coalitions formed against aggressors

6. **Random:**
   - Strategy: Unpredictable alliance behavior
   - Trigger: 30% chance to propose/accept
   - Frequency: Random evaluation each turn
   - Target: Any empire with neutral+ relationship

**Timing Gate:**
- No coalitions before turn 10 (early game isolation period)
- Ensures players establish positions before alliances form

**Rationale:** Archetype-specific formation creates personality-driven diplomacy. Warlords form power blocs, Diplomats build webs, Schemers infiltrate for betrayal. Turn 10 gate prevents instant alliance spam.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 9.2 - Coalition AI Behavior, Formation Logic

**Code:** TBD - `src/lib/bots/coalition-formation.ts` - Formation decision logic

**Tests:** TBD - Verify each archetype's formation behavior

**Status:** Draft

---

### REQ-BOT-008-B: Coalition Behavior and Coordination

**Description:** Bots within coalitions coordinate military actions, honor defense pacts, and share intelligence through coalition chat, creating challenging multi-bot opponents.

**Coalition Coordination:**

1. **Honor Defense Pacts:**
   - Trigger: Coalition member attacked by non-member
   - Condition: Bot loyalty > 0.5
   - Response: Join defensive war within 1 turn
   - Exception: If bot is currently losing own war

2. **Coordinate Attacks:**
   - Strategy: Plan simultaneous strikes on shared enemies
   - Timing: Synchronize attacks within 2-turn window
   - Target selection: Focus fire on coalition threats
   - Communication: Discuss timing in coalition chat

3. **Share Intelligence:**
   - Visibility: Coalition members see each other's shared intel
   - Updates: Sector visibility, enemy movements, resource status
   - Chat: Strategic discussions, warnings, coordination
   - Example messages:
     - "Enemy building carriers at Sector X"
     - "Coordinating attack on EmpireY turn 45"
     - "Need defensive support at border sectors"

4. **Coalition Chat Behavior:**
   - Frequency: 1-3 messages per turn (if significant events)
   - Content: Strategic discussion, attack coordination, defensive warnings
   - Personality: Reflects archetype (Warlord aggressive, Diplomat polite, Schemer deceptive)
   - Visibility: All coalition members see bot-to-bot chats

**Rationale:** Coalition coordination makes bot alliances feel like coordinated opponents rather than independent actors. Defense pact honoring creates reliable allies. Intelligence sharing rewards diplomatic investment.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 9.2 - Coalition AI Behavior, Coalition Behavior

**Code:** TBD - `src/lib/bots/coalition-coordination.ts` - Coordination logic

**Tests:** TBD - Verify defense pacts, attack coordination, intel sharing

**Status:** Draft

---

### REQ-BOT-008-C: Coalition Betrayal and Leave Mechanics

**Description:** Bots betray or leave coalitions based on archetype-specific triggers, creating dramatic political shifts and ensuring alliances aren't permanent.

**Betrayal Conditions:**

1. **Schemer Archetype (Guaranteed):**
   - Timer: Always betrays after exactly 20 turns in coalition
   - Method: Surprise attack on weakest coalition member
   - Preparation: Positions forces during membership
   - Warning: None (surprise betrayal)

2. **Other Archetypes (Conditional):**
   - Trigger: trust_score < -50 with coalition
   - Cause: Repeated slights, broken promises, or aggression
   - Method: Declares exit then attacks (1-turn warning)
   - Frequency: Rare (requires severe trust breakdown)

3. **Opportunity Betrayal:**
   - Trigger: Coalition weakened by war
   - Condition: Bot sees opportunity to gain significantly
   - Method: Attack during coalition's moment of weakness
   - Archetype: Risk-tolerant archetypes more likely

**Leave Conditions (Non-Hostile Exit):**

1. **Coalition Attacks Bot:**
   - Trigger: Coalition member declares war on bot
   - Response: Immediate exit from coalition
   - No betrayal: Just leaves (defensive response)

2. **Coalition Leader Eliminated:**
   - Trigger: Empire that formed coalition is destroyed
   - Response: Coalition dissolves automatically
   - Transition: Bots may form new coalition

3. **Better Opportunity:**
   - Trigger: Stronger coalition invite received
   - Condition: Bot risk_tolerance > 0.7
   - Method: Leave peacefully, join new coalition
   - Archetype: Opportunistic archetypes (Merchant, Schemer)

**Reputation Impact:**
- Betrayal: -20 reputation with all empires (permanent scar)
- Peaceful leave: -5 reputation (temporary)

**Rationale:** Schemer betrayal creates dramatic political moments and makes all alliances feel risky. Conditional betrayal ensures severe mistreatment has consequences. Leave conditions prevent bots being trapped in bad alliances.

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 9.2 - Coalition AI Behavior, Betrayal/Leave Mechanics

**Code:** TBD - `src/lib/bots/coalition-betrayal.ts` - Betrayal/leave logic

**Tests:** TBD - Verify Schemer 20-turn timer, trust-based betrayal, leave triggers

**Status:** Draft

---

### REQ-BOT-009: Behavioral Telegraphing

**Description:** Each archetype telegraphs intentions with varying clarity, enabling player readability:

| Archetype | Telegraph % | Style | Advance Warning |
|-----------|-------------|-------|-----------------|
| Warlord | 70% | Obvious threats | 2-3 turns |
| Diplomat | 80% | Polite warnings | 3-5 turns |
| Schemer | 30% | Cryptic/inverted | 1 turn (if any) |
| Merchant | 60% | Transactional | 2 turns |
| Blitzkrieg | 40% | Minimal | 1 turn |
| Turtle | 90% | Very clear | 5+ turns |

**Telegraph Methods:**
- Direct messages ("Your defenses are weak")
- Military buildup visible on borders
- Coalition chat leaks
- Emotional state changes (Vengeful bot fixates on target)

**Rationale:** Players can read bot intentions and respond strategically. Scheming bots are intentionally hard to read. Creates skill expression in "reading" bot behavior.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/messaging.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-010: Endgame Behavior (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-BOT-010-A through REQ-BOT-010-D for individual turn threshold behaviors.

**Overview:** Bot behavior escalates as the game approaches victory conditions through 4 distinct thresholds. Creates narrative climax where endgame feels different from mid-game.

---

### REQ-BOT-010-A: Late Campaign Threshold (Turn 150+)

**Description:** At Turn 150+, all archetypes increase aggression +10%, alliance formation increases (defensive coalitions), and Tier 1 LLM bots generate more dramatic messages. Signals transition to late-game intensity.

**Rationale:** Creates sense of urgency as game progresses. Increased aggression and coalition formation drive action toward conclusion.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | Turn 150+ |
| Aggression Modifier | +10% for all archetypes |
| Alliance Formation | Increased rate |
| Messaging Style | More dramatic (Tier 1 bots) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkLateCompaignThreshold()`, `applyLateCampaignModifiers()`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-010-B: Dominant Leader Threshold (50% Dominance)

**Description:** When any empire reaches 50% dominance (territory, VP, or other metric), automatic defensive coalition forms against leader. Coalition coordination increases and "Stop the leader" messaging sent to all empires.

**Rationale:** Creates dynamic balancing mechanic. Leading player faces organized opposition that feels narratively justified.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | Leader at 50% dominance |
| Mechanic | Auto defensive coalition formation |
| Coordination | Increased for coalition members |
| Messaging | "Stop the leader" broadcasts |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkDominantLeaderThreshold()`, `formAntiLeaderCoalition()`

**Tests:** TBD

**Status:** Draft

**Cross-Reference:** REQ-VIC-008 (Anti-Snowball Mechanics), REQ-DIP-005 (Automatic Coalition Formation)

---

### REQ-BOT-010-C: Final Three Threshold (3 Empires Remaining)

**Description:** When only 3 empires remain, maximum communication drama activates. Tier 1 bots generate epic monologues and final showdown messaging. Creates climactic narrative tension for final confrontation.

**Rationale:** Endgame deserves epic storytelling. Final three scenario feels like climactic finale with dramatic bot roleplay.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | Last 3 empires standing |
| Communication Level | Maximum drama |
| Messaging | Epic monologues, showdown declarations |
| Tier 1 Behavior | Generate climactic narratives |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkFinalThreeThreshold()`, `generateEpicMonologue()`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-010-D: Victory Imminent Threshold (55%+ Territory)

**Description:** When one empire controls 55%+ territory (approaching 70% victory threshold), global announcements from LLM bots, last alliance proposals, and dramatic "it's over" or "last stand" messages. Signals inevitable victory or desperate final resistance.

**Rationale:** Victory should feel earned and dramatic. Final moments before victory trigger memorable narrative climax.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | One empire at 55%+ territory |
| Announcements | Global broadcasts from LLM bots |
| Last Alliances | Final coalition attempts |
| Messaging | "It's over" or "Last stand" declarations |

**Example Messages:**
- "Attention all commanders. {leader} threatens galactic domination. Temporary ceasefire proposed." (Warlord)
- "To my allies: It has been an honor. For the coalition!" (Diplomat)
- "You all trusted me. Now the galaxy is mine." (Schemer victory)

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkVictoryImminentThreshold()`, `broadcastGlobalAnnouncement()`

**Tests:** TBD

**Status:** Draft

**Cross-Reference:** REQ-TURN-019-01 (Military Victory Check - 70% threshold)

---

### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-BOT-001 | Four-Tier Intelligence | Draft | TBD |
| REQ-BOT-002 | Eight Archetypes | Draft | TBD |
| REQ-BOT-003 | Emotional States | Draft | TBD |
| REQ-BOT-004 | Memory System with Weighted Decay | Draft | `src/lib/game/repositories/__tests__/bot-memory-repository.test.ts` |
| REQ-BOT-005 | 100 Unique Personas | Draft | `src/lib/messages/__tests__/personas.test.ts` |
| REQ-BOT-006 | LLM Integration | Draft | TBD |
| REQ-BOT-007 | Decision Audit System | Draft | TBD |
| REQ-BOT-008 | Coalition AI Behavior | Draft | `src/lib/game/services/__tests__/coalition-service.test.ts` |
| REQ-BOT-009 | Behavioral Telegraphing | Draft | TBD |
| REQ-BOT-010 | Endgame Behavior | Draft | TBD |

**Total Specifications:** 10
**Implemented:** 0
**Validated:** 0
**Draft:** 10

---

## Migration Plan

### Current State (January 2026)

**Implemented:**
- ✅ Bot database schema (Drizzle ORM)
- ✅ Bot creation during game setup
- ✅ Basic turn processing framework
- ✅ Tier 4 (random) behavior functional

**In Progress:**
- 🔄 Tier 3 simple behavioral bots (70% complete)
- 🔄 Message template system (basic structure in place)

**Not Started:**
- ❌ Tier 2 strategic decision trees
- ❌ Tier 1 LLM integration
- ❌ Emotional state system
- ❌ Relationship memory with decay
- ❌ Coalition coordination logic

### Phase-by-Phase Migration

#### Phase 1: Tier 3 & Basic Templates (M12 → M13)
**Goal:** Functional mid-tier bots with personality

**Steps:**
1. Complete Tier 3 simple behavior implementation
   - Balanced, Reactive, Builder subtypes
   - Basic threat response logic
   - Resource management decisions
2. Implement basic message template system
   - 10-15 templates per archetype (expandable to 30-45)
   - Template selection based on context
   - Basic variable substitution
3. Test 50-bot games with Tier 3+4 only
4. Validate decision consistency with archetype personalities

**Success Criteria:**
- Tier 3 bots make archetype-consistent decisions >80% of time
- Games complete without crashes or decision hangs
- Players can identify "aggressive" vs "peaceful" bots

**Rollback Plan:** If Tier 3 proves unstable, fall back to Tier 4 random for all bots until fixed

#### Phase 2: Tier 2 Strategic Bots (M13 → M14)
**Goal:** Sophisticated rule-based opponents with alliance behavior

**Steps:**
1. Implement decision priority matrix system
   - Weight-based action selection
   - Context-aware decision trees
   - Risk assessment calculations
2. Build coalition formation logic
   - Trust score calculations
   - Alliance proposal evaluation
   - Defensive pact coordination
3. Expand template library to 30-45 per persona
4. Add basic personality traits with mechanical effects

**Success Criteria:**
- Coalition formation happens in 80%+ of games after turn 10
- Tier 2 bots win 2× more often than Tier 3
- Alliance messages feel contextually appropriate

**Rollback Plan:** Disable Tier 2 decision trees, fall back to Tier 3 behavior for those bots

#### Phase 3: LLM Integration (M14 → M15)
**Goal:** Elite bots with natural language communication

**Steps:**
1. Implement LLM provider abstraction layer
   - Groq primary, Together secondary, OpenAI fallback
   - Rate limiting and cost tracking
   - Timeout and retry logic
2. Create system prompts per archetype
   - Personality descriptions
   - Game state summarization
   - Decision schema enforcement
3. Build response parser and validator
   - JSON schema validation
   - Fallback to Tier 2 on parse failure
4. Generate natural language messages
   - Replace template selection with LLM generation
   - Maintain voice consistency across messages

**Success Criteria:**
- LLM API success rate >95% with fallback chain
- Tier 1 bots generate coherent, personality-consistent messages
- API costs stay <$50/day across all active games
- Tier 1 bots feel "more human" in playtesting

**Rollback Plan:** Disable LLM calls entirely, treat Tier 1 bots as Tier 2 until issues resolved

#### Phase 4: Memory & Emotion (M15 → M16)
**Goal:** Persistent relationships and dynamic emotional states

**Steps:**
1. Implement relationship memory system
   - Event weight and decay calculations
   - Permanent grudge mechanics (20% of negatives)
   - Cross-turn memory persistence
2. Build emotional state system
   - State transitions based on game events
   - Mechanical modifiers to decision weights
   - Intensity scaling (0.0-1.0)
3. Add telegraph system
   - Archetype-specific warning patterns
   - Message timing before actions
   - Schemer false signal logic
4. Implement grudge/revenge mechanics
   - Prioritize attacks against grudge targets
   - Coalition invitations biased by relationships

**Success Criteria:**
- Bots remember major betrayals for 50+ turns
- Emotional states visibly affect behavior
- Players report "bots hold grudges" in feedback
- Scheming bots successfully deceive players

**Rollback Plan:** Disable emotion system, relationships become static trust scores

#### Phase 5: Polish & Tuning (M16)
**Goal:** Production-ready balance and drama

**Steps:**
1. Run Monte Carlo simulations
   - 1000+ games across difficulty levels
   - Archetype win rate validation
   - Identify dominant strategies
2. Balance tuning
   - Adjust archetype decision weights
   - Calibrate difficulty modifiers
   - Fix exploitable patterns
3. Implement dramatic endgame messaging
   - Global announcements by Tier 1 bots
   - Coalition coordination messages
   - Victory/defeat monologues
4. Build decision log viewer
   - Post-game "God Mode" replay
   - Bot reasoning explanations
   - Entertainment value for players

**Success Criteria:**
- All archetypes within target win rate ranges
- No dominant strategy emerges in 1000-game simulation
- Endgame feels dramatic and memorable
- Players want to review bot decision logs

**Rollback Plan:** N/A (polish phase, no breaking changes)

### Data Migration Strategy

**Bot Persona Data:**
- `data/personas.json` will be created incrementally
- Phase 1: 8 generic personas (1 per archetype)
- Phase 2: Expand to 20 personas (2-3 per archetype)
- Phase 3: Full 100 unique personas with LLM voice profiles
- Migration: Backward compatible, old persona IDs remain valid

**Message Templates:**
- Stored in `data/templates/` as JSON files
- Archetype-based organization: `templates/warlord.json`, etc.
- Phase-by-phase expansion: 10 → 30 → 45+ templates
- Migration: Template ID references, old IDs never deleted

**Database Schema:**
- All bot tables exist from Phase 1 (with nullable fields)
- Each phase activates additional columns
- No breaking schema changes required
- Migration: Drizzle migrations applied automatically

### Rollback Safety

**Feature Flags:**
```typescript
const BOT_FEATURES = {
  tier3Enabled: true,
  tier2Enabled: false,  // Can disable if broken
  tier1LlmEnabled: false,
  emotionSystemEnabled: false,
  memoryDecayEnabled: false,
  coalitionLogicEnabled: true,
};
```

**Graceful Degradation:**
- LLM failure → fall back to Tier 2 decision tree
- Tier 2 failure → fall back to Tier 3 simple rules
- Tier 3 failure → fall back to Tier 4 random (always works)
- Template system failure → use generic fallback messages

**Testing Gates:**
- Each phase requires 50+ successful test games before production
- Balance validation must pass before promoting to next tier
- Player feedback must be "neutral or better" (not "frustrating")

---

## Database Schema

### Bot-Specific Tables (via Drizzle)

**botMemories**
- Relationship tracking with decay
- Event weights (1-100) and decay resistance
- 20% of negative events are permanent scars

**botEmotionalStates**
- Current emotion and intensity
- Mechanical modifiers to decisions
- State transition triggers

**botDecisionLogs**
- Full decision history
- Reasoning and LLM responses
- Pre/post decision state

**botCoalitionStrategy**
- Coalition-level coordination
- Shared enemy lists
- Attack coordination

---

## 10. Conclusion

### Key Decisions

**1. Four-Tier Intelligence Architecture**
- **Rationale**: Balances computational cost with gameplay quality. LLM bots (Tier 1) provide premium experience for 5-10 elite opponents, while Tier 2-4 bots create a varied skill landscape without breaking the budget.
- **Trade-off**: Accepted complexity in bot management to deliver memorable "human-like" opponents.

**2. Hidden Archetypes with Observable Behavior**
- **Rationale**: Players learn through observation rather than UI labels, creating skill expression and discovery moments.
- **Trade-off**: Requires careful telegraph design to avoid frustrating unpredictability. Warlord bots telegraph 70% of attacks; Schemer bots only 30%.

**3. Mechanically Meaningful Emotions**
- **Rationale**: Emotional states (Confident, Arrogant, Desperate, Vengeful, Fearful, Triumphant) directly modify decision weights (±5% to ±50%), ensuring emotions impact gameplay, not just flavor.
- **Trade-off**: Adds complexity to decision engine but creates dynamic, reactive AI behavior that feels alive.

**4. Relationship Memory with Weighted Decay**
- **Rationale**: Major betrayals and sector captures resist decay (20% become permanent grudges), while minor trades fade quickly. Mimics human memory patterns.
- **Trade-off**: Requires ongoing memory cleanup and storage management, but enables persistent rivalries that span 100+ turns.

**5. LLM Provider Fallback Chain**
- **Rationale**: Groq → Together → OpenAI → Scripted ensures 99%+ uptime while minimizing costs. Primary provider (Groq) is fastest and cheapest.
- **Trade-off**: Dependency on external APIs, but graceful degradation to Tier 2 scripted behavior prevents game-breaking failures.

### Open Questions

**1. Optimal Tier Distribution for 100-Bot Games**
- **Context**: Current target is 5-10 LLM, 20-25 Strategic, 50-60 Simple, 10-15 Chaotic.
- **Options**:
  - Increase LLM count to 15-20 for more premium experience (higher cost)
  - Reduce LLM count to 3-5 to minimize API costs (less drama)
- **Resolution Needed**: Playtest feedback on "bot quality vs. quantity" balance.

**2. Cross-Game Memory for Nemesis System**
- **Context**: Should bots remember player across multiple games? ("You again! I remember last time...")
- **Options**:
  - Enable cross-game memory for Tier 1 LLM bots only (epic rivalries)
  - Disable cross-game memory entirely (each game is fresh start)
  - Optional player setting
- **Resolution Needed**: Design decision on persistent universe vs. isolated games.

**3. Spectator Mode for Bot-Only Games**
- **Context**: Players want to watch bots play each other with live commentary.
- **Options**:
  - Implement "fast-forward" mode for bot-only games
  - Record replays with decision logs for post-game viewing
  - Skip entirely for MVP
- **Resolution Needed**: Prioritization against other features.

**4. Dynamic Difficulty Adjustment**
- **Context**: Should bot intelligence adapt if player is dominating or struggling?
- **Options**:
  - Enable dynamic scaling (bots get smarter if player too strong)
  - Static difficulty setting only
  - Per-bot hidden difficulty multiplier based on player performance
- **Resolution Needed**: Player feedback on "fair challenge" vs. "artificial difficulty."

### Dependencies

**Depends On:**
- **[COMBAT-SYSTEM.md](COMBAT-SYSTEM.md)** - Battle resolution, commander stats (Section 2.4)
- **[RESEARCH.md](RESEARCH.md)** - Tech tree for bot research priorities
- **[DIPLOMACY-SYSTEM.md]** (if exists) - Treaty types, alliance mechanics
- **[COVERT-OPS.md]** (if exists) - Spy operations for Schemer archetype

**Depended By:**
- **[PRD-EXECUTIVE.md](../PRD-EXECUTIVE.md)** - Overall game flow relies on bot opponents
- **[VICTORY-SYSTEMS.md](VICTORY-SYSTEMS.md)** - Endgame behavior triggers on victory thresholds
- **[PROGRESSIVE-SYSTEMS.md](PROGRESSIVE-SYSTEMS.md)** - Unlocks may affect bot behavior

### Implementation Priority

**Critical Path (M12-M14):**
1. Tier 3 & Tier 2 bots (M12-M13) - Core gameplay functional
2. Message template system (M13) - Communication with bots
3. LLM integration (M14) - Premium Tier 1 experience

**Polish Phase (M15-M16):**
4. Emotional state system (M15) - Dynamic behavior
5. Memory & grudges (M15) - Persistent relationships
6. Balance tuning (M16) - Win rate targets

**Post-Launch:**
7. Cross-game memory (nemesis system)
8. Spectator mode
9. Dynamic difficulty
10. Bot personality evolution

---

## Commander Stats Reference

Bot commanders have three mental ability scores that affect decision-making:
- **INT (Intelligence):** 8-18 range, affects tech research speed (+1 RP/turn per modifier)
- **WIS (Wisdom):** 8-18 range, affects retreat decisions (d20+WIS vs DC 15)
- **CHA (Charisma):** 8-18 range, affects alliance formation (d20+CHA vs target WIS)

See [COMBAT-SYSTEM.md Section 2.4](COMBAT-SYSTEM.md#24-commander-stats-mental-abilities---bot-ai-only) for complete commander stat table by archetype.

---

## Related Documents

- [Vision & Philosophy](../VISION.md) - Design philosophy and principles
- [PRD-EXECUTIVE.md](../PRD-EXECUTIVE.md) - System overview and game design
- [COMBAT-SYSTEM.md](COMBAT-SYSTEM.md) - Battle resolution, commander stats (Section 2.4)
- [RESEARCH.md](RESEARCH.md) - Research system, bot preferences (Section 8)
- [Terminology Rules](../development/TERMINOLOGY.md) - CRITICAL
- **[BOT_ARCHITECTURE.md](BOT_ARCHITECTURE.md)** - Original detailed vision (archived)

---

*Consolidated from BOT_ARCHITECTURE.md (original X Imperium vision), VISION.md Section 7, and PRD.md Section 8*
*Last major update: January 2026 - Added LLM prompts, coalition chat, endgame behavior, decision logging*
