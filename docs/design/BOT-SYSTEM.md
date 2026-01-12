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

```
1. GATHER STATE
   ├── Own empire status (resources, military, sectors)
   ├── Relationship data (allies, enemies, neutrals)
   ├── Global game state (rankings, market prices)
   └── Recent events (attacks, messages, treaties)

2. ASSESS SITUATION
   ├── Threat analysis (who can attack us?)
   ├── Opportunity analysis (who is weak?)
   ├── Economic position (are we growing?)
   └── Alliance health (are allies reliable?)

3. STRATEGIC DECISION (varies by tier)
   ├── Tier 1: LLM analysis with personality prompt
   ├── Tier 2: Decision tree with weighted priorities
   ├── Tier 3: Simple if/then rules
   └── Tier 4: Random with constraints

4. EXECUTE ACTIONS
   ├── Military: Attack, defend, produce units
   ├── Economic: Buy/sell, adjust production
   ├── Diplomatic: Propose/accept/break treaties
   ├── Research: Choose tech path
   └── Communication: Send messages

5. LOG & LEARN
   ├── Record decision reasoning
   ├── Update relationship scores
   └── Adjust strategy if needed
```

### Bot Decision Types

```typescript
type BotDecision =
  | { type: "build_units"; unitType: UnitType; quantity: number }
  | { type: "buy_sector"; sectorType: SectorType }
  | { type: "attack"; targetId: string; forces: Forces }
  | { type: "diplomacy"; action: "propose_nap" | "propose_alliance"; targetId: string }
  | { type: "trade"; resource: ResourceType; quantity: number; action: "buy" | "sell" }
  | { type: "do_nothing" }
```

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

```
IF no coalition AND game_turn > 10:
  ├── Diplomat: Seek allies (trust_score > 30)
  ├── Warlord: Only ally with strong (top 20% networth)
  ├── Merchant: Ally with trade partners
  ├── Schemer: Join any coalition (plan betrayal)
  ├── Turtle: Join defensive coalitions only
  └── Random: 30% chance to propose/accept

IF in coalition:
  ├── Honor defense pacts (loyalty > 0.5)
  ├── Coordinate attacks on shared enemies
  ├── Share intelligence via coalition chat
  └── Consider betrayal IF:
      ├── Schemer: Always after 20 turns
      └── Others: Only if trust_score < -50

LEAVE coalition IF:
  ├── Coalition attacks us
  ├── Leader is eliminated
  └── Better opportunity exists (risk_tolerance > 0.7)
```

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
FALSE: "You seem reasonable. Let's form an alliance -
       together we can dominate!"
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

Each persona has:

```typescript
interface BotPersona {
  id: string;                    // "commander_hexen"
  name: string;                  // "Commander Hexen"
  archetype: Archetype;

  voice: {
    tone: string;                // "gruff military veteran"
    quirks: string[];            // ["never says please"]
    vocabulary: string[];        // ["soldier", "campaign"]
    catchphrase?: string;        // "Victory favors the prepared"
  };

  templates: {
    greeting: string[];
    battleTaunt: string[];
    victoryGloat: string[];
    defeat: string[];
    tradeOffer: string[];
    allianceProposal: string[];
    betrayal: string[];
    // ... more categories
  };

  usedPhrases: Set<string>;      // Prevent repetition
}
```

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

```typescript
const LLM_PROVIDERS = [
  { name: 'groq', priority: 1 },
  { name: 'together', priority: 2 },
  { name: 'openai', priority: 3 }
];

// Rate limits
const RATE_LIMITS = {
  llmCallsPerGame: 5000,
  llmCallsPerTurn: 50,
  llmCallsPerHour: 500,
  maxDailySpend: 50.00
};
```

---

## LLM System Prompts

### System Prompt Template (Tier 1 Bots)

```
You are {empire_name}, a player in Nexus Dominion, a space empire strategy game.

PERSONALITY: {archetype_description}

YOUR TRAITS:
- Aggression: {aggression}/10
- Diplomacy: {diplomacy}/10
- Risk Tolerance: {risk_tolerance}/10
- Loyalty: {loyalty}/10
- Deception: {deception}/10

CURRENT SITUATION:
{game_state_summary}

YOUR RELATIONSHIPS:
{relationship_summary}

RECENT EVENTS:
{recent_events}

You must decide your actions for this turn. Consider:
1. Who should you attack, if anyone?
2. Should you propose or accept any alliances?
3. What should your production focus be?
4. Should you send any messages? (trash talk, diplomacy, coordination)

Respond in JSON format with your decisions and reasoning.
Also include any messages you want to send to other players.

Remember: Stay in character as {archetype}. Your messages should reflect your personality.
```

### LLM Response Schema

```typescript
interface LLMBotResponse {
  reasoning: string;
  actions: {
    military: {
      attack_target: string | null;
      attack_force: Forces;
      defense_priority: "low" | "medium" | "high";
    };
    production: {
      military_focus: number;  // 0.0-1.0
      economy_focus: number;
      research_focus: number;
    };
    diplomacy: {
      propose_treaty: Array<{ target: string; type: TreatyType }>;
      accept_treaties: string[];
      break_treaties: string[];
    };
    research: {
      target_tech: string | null;
    };
    covert: {
      operation: CovertOpType | null;
      target: string;
    };
  };
  messages: Array<{
    recipient: string;  // empireId | "global" | "coalition"
    subject: string;
    content: string;
  }>;
  coalition: {
    invite: string[];
    accept_invite: boolean;
    leave: boolean;
  };
}
```

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

All bot decisions are logged for debugging and player entertainment:

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

**Player Access**: Decision logs visible in post-game analysis (optional "God Mode" view)

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

```typescript
interface BotGameConfig {
  botCount: number;              // 10-100
  tierDistribution: {
    tier1: number;               // 5-10 (LLM)
    tier2: number;               // 20-25 (Strategic)
    tier3: number;               // 50-60 (Simple)
    tier4: number;               // 10-15 (Chaotic)
  };

  llmConfig: {
    enabled: boolean;
    providers: LLMProviderConfig[];
    rateLimits: {
      callsPerTurn: number;
      callsPerHour: number;
      maxDailySpend: number;
    };
  };

  difficulty: "easy" | "normal" | "hard" | "nightmare";
  // easy: bots make suboptimal choices
  // normal: balanced bot intelligence
  // hard: bots play optimally
  // nightmare: bots get resource bonuses
}
```

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

# Requirements 

**integrate with new template**

**Source Document:** `docs/design/BOT-SYSTEM.md`

### REQ-BOT-001: Four-Tier Intelligence

**Description:** Bots operate in 4 intelligence tiers with specific behaviors:

**Tier 1 (LLM): 5-10 elite bots**
- Natural language decisions via LLM API (Groq → Together → OpenAI fallback chain)
- Async processing during player turn for performance
- Falls back to Tier 2 scripted behavior on API failure
- Custom personality prompts per persona

**Tier 2 (Strategic): 20-25 bots**
- Archetype-based decision trees with weighted priorities
- Template-based messages (30-45 per persona)
- Sophisticated coalition and betrayal logic

**Tier 3 (Simple): 50-60 bots**
- Basic behavioral rules (if/then decision trees)
- Subtypes: Balanced, Reactive, Builder
- Minimal communication

**Tier 4 (Random): 10-15 chaotic bots**
- Weighted random decisions with constraints
- Intentionally suboptimal choices for baseline challenge
- Adds unpredictability to the game

**Rationale:** Creates varied opposition without requiring LLM for all bots. Tier distribution provides skill curve from chaotic to elite.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/types.ts`, `src/lib/bots/bot-processor.ts`

**Tests:** `src/lib/bots/__tests__/bot-processor.test.ts`

**Status:** Draft

---

### 7.6 Bot Archetypes

### REQ-BOT-002: Eight Archetypes

**Description:** 8 bot archetypes define behavioral patterns with unique passive abilities and decision priorities.

**Archetype Profiles:**

1. **Warlord** - Aggressive military focus
   - Passive: War Economy (-20% military cost when at war)
   - Priority: Attack 0.9, Defense 0.5, Alliance 0.3, Economy 0.4, Covert 0.5
   - Commander Stats: INT 12 (+1), WIS 14 (+2), CHA 8 (-1)

2. **Diplomat** - Alliance-seeking, mediates conflicts
   - Passive: Trade Network (+10% income per active alliance)
   - Priority: Alliance 0.95, Attack 0.2, Defense 0.6, Economy 0.5, Covert 0.2
   - Commander Stats: INT 13 (+1), WIS 14 (+2), CHA 18 (+4)

3. **Merchant** - Economic domination, buys loyalty
   - Passive: Market Insight (sees next turn market prices)
   - Priority: Economy 0.95, Alliance 0.7, Attack 0.3, Defense 0.4, Covert 0.4
   - Commander Stats: INT 14 (+2), WIS 13 (+1), CHA 15 (+2)

4. **Schemer** - Deceptive tactics, betrayals
   - Passive: Shadow Network (-50% covert operation cost)
   - Priority: Covert 0.9, Alliance 0.8* (*for deception), Attack 0.6, Defense 0.3, Economy 0.5
   - Commander Stats: INT 13 (+1), WIS 15 (+2), CHA 16 (+3)

5. **Turtle** - Defensive buildup, never attacks first
   - Passive: Fortification (2× defensive structure power)
   - Priority: Defense 0.95, Economy 0.7, Attack 0.1, Alliance 0.5, Covert 0.3
   - Commander Stats: INT 14 (+2), WIS 16 (+3), CHA 10 (+0)

6. **Blitzkrieg** - Fast early expansion, aggressive strikes
   - Priority: Attack 0.95, Defense 0.2, Alliance 0.2, Economy 0.5, Covert 0.4
   - Commander Stats: INT 12 (+1), WIS 10 (+0), CHA 12 (+1)

7. **Tech Rush** - Research priority, late-game power spike
   - Priority: Economy 0.6, Defense 0.5, Attack 0.3, Alliance 0.4, Covert 0.3
   - Commander Stats: INT 17 (+3), WIS 12 (+1), CHA 10 (+0)

8. **Opportunist** - Adaptive vulture strategy, attacks weakened empires
   - Priority: Attack 0.7, Economy 0.6, Defense 0.4, Alliance 0.4, Covert 0.5
   - Commander Stats: INT 13 (+1), WIS 14 (+2), CHA 11 (+0)

**Decision Formula:**
```
Action Weight = Base Priority × Emotional Modifier × Situational Adjustment

Final Action = argmax(Action Weight for all possible actions)
```

**Rationale:** Creates diverse, memorable opponents with distinct mechanical advantages and playstyles. Priority matrix ensures predictable but varied behavior.

**Source:** `docs/design/BOT-SYSTEM.md` Sections 7.6, 8

**Formulas:** See `docs/PRD-FORMULAS-ADDENDUM.md` Section 4.2-4.4

**Code:** `src/lib/bots/archetypes/`, `src/lib/bots/types.ts`

**Tests:** TBD

**Status:** Draft

---

### 7.8 Emotional State System

### REQ-BOT-003: Emotional States

**Description:** Bots have 6 emotional states that mechanically affect their decisions:

1. **Confident** - Baseline positive state (doing well, balanced)
   - Effects: +5% decision, -20% alliance, +10% aggression, +10% negotiation
   - Trigger: Steady progress, winning battles

2. **Arrogant** - Hubris from excessive success (creates vulnerability)
   - Effects: -15% decision, -40% alliance, +30% aggression, -30% negotiation
   - Trigger: Multiple victories, high networth lead, dominant position

3. **Desperate** - Crisis mode (losing badly, makes wild moves)
   - Effects: -10% decision, +40% alliance, -20% aggression, -20% negotiation
   - Trigger: Low networth, losing sectors, under sustained attack

4. **Vengeful** - Revenge focus (personal grudges override strategy)
   - Effects: -5% decision, -30% alliance, +40% aggression (toward target), -40% negotiation
   - Trigger: Sector capture, treaty betrayal, major attack

5. **Fearful** - Defensive (worried about survival, seeks protection)
   - Effects: -10% decision, +50% alliance, -30% aggression, +10% negotiation
   - Trigger: Enemy buildup on borders, recent defeat, networth dropping

6. **Triumphant** - Victory high (post-win momentum and boldness)
   - Effects: +10% decision, -10% alliance, +20% aggression, -20% negotiation
   - Trigger: Won major battle, captured valuable sector, eliminated enemy

**State Arcs:**
- Success spiral: Confident → Triumphant → Arrogant (hubris trap)
- Failure spiral: Fearful → Desperate (escalating crisis)
- Revenge arc: Any state → Vengeful (emotional override)

**Rationale:** Creates dynamic, reactive AI behavior with narrative arcs. States are hidden from player but can be inferred from bot messages and actions. Mechanical effects ensure states meaningfully impact gameplay.

**Source:** `docs/design/BOT-SYSTEM.md`, `docs/decisions/EMOTIONAL-STATES-ANALYSIS.md`

**Code:** `src/lib/bots/emotions/`

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

**Description:** 100 unique bot personas with structured voice and message templates:

```typescript
interface BotPersona {
  id: string;                    // "commander_hexen"
  name: string;                  // "Commander Hexen"
  archetype: Archetype;          // Warlord, Diplomat, etc.

  voice: {
    tone: string;                // "gruff military veteran"
    quirks: string[];            // ["never says please", "addresses by rank"]
    vocabulary: string[];        // ["soldier", "campaign", "victory"]
    catchphrase?: string;        // "Victory favors the prepared"
  };

  templates: {
    greeting: string[];          // 3-5 variations
    battleTaunt: string[];
    victoryGloat: string[];
    defeat: string[];
    tradeOffer: string[];
    allianceProposal: string[];
    betrayal: string[];
    // ... 30-45 total templates per persona
  };

  usedPhrases: Set<string>;      // Prevent phrase repetition within game
}
```

**Template Variables:**
- `{player_name}`, `{empire_name}`, `{target}`, `{sector_count}`, etc.
- Templates filled dynamically based on game state

**Rationale:** Creates memorable, distinguishable opponents. Voice and quirks ensure each bot feels unique. Template variety prevents repetitive messages.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `data/personas.json`, `src/lib/bots/personas.ts`

**Tests:** `src/lib/messages/__tests__/personas.test.ts`

**Status:** Draft

---

### REQ-BOT-006: LLM Integration

**Description:** Tier 1 bots integrate with LLM APIs for natural language decision-making:

**Provider Chain:**
- Primary: Groq (fast, cost-effective)
- Fallback 1: Together AI
- Fallback 2: OpenAI
- Emergency: Tier 2 scripted behavior

**System Prompt Template:**
```
You are {empire_name}, a player in Nexus Dominion.

PERSONALITY: {archetype_description}
TRAITS: Aggression {aggression}/10, Diplomacy {diplomacy}/10, etc.

CURRENT SITUATION:
{game_state_summary}

YOUR RELATIONSHIPS:
{relationship_summary}

RECENT EVENTS:
{recent_events}

Decide your actions for this turn. Respond in JSON format.
Stay in character as {archetype}.
```

**Response Schema:**
- `reasoning`: String explaining thought process
- `actions`: Military, production, diplomacy, research, covert decisions
- `messages`: Array of messages to send (recipient, subject, content)
- `coalition`: Invite/accept/leave decisions

**Rate Limits:**
- 5000 LLM calls per game maximum
- 50 LLM calls per turn maximum
- 500 LLM calls per hour maximum
- $50.00 daily spend cap

**Rationale:** Provides elite-tier AI opponents with natural language communication while controlling costs through fallbacks and rate limits.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/llm/`, `src/lib/bots/types.ts`

**Tests:** TBD

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

### REQ-BOT-008: Coalition AI Behavior

**Description:** Bots form, manage, and betray coalitions based on archetype and game state:

**Formation Logic (game turn > 10):**
- Diplomat: Actively seeks allies (trust_score > 30)
- Warlord: Only allies with strong players (top 20% networth)
- Merchant: Allies with trade partners
- Schemer: Joins any coalition (plans betrayal after 20 turns)
- Turtle: Joins defensive coalitions only
- Random: 30% chance to propose/accept

**Coalition Behavior:**
- Honor defense pacts (if loyalty > 0.5)
- Coordinate attacks on shared enemies
- Share intelligence via coalition chat
- Coalition chat examples: defensive coordination, attack planning, strategic discussion

**Betrayal Conditions:**
- Schemer archetype: Always after 20 turns in coalition
- Other archetypes: Only if trust_score < -50
- Opportunity: Coalition weakened by war

**Leave Conditions:**
- Coalition attacks the bot
- Coalition leader eliminated
- Better opportunity exists (risk_tolerance > 0.7)

**Rationale:** Creates dynamic alliance politics. Scheming bots make all alliances untrustworthy. Coalition coordination creates challenging multi-bot opponents.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/coalition.ts`, `src/lib/game/services/__tests__/coalition-service.test.ts`

**Tests:** `src/lib/game/services/__tests__/coalition-service.test.ts`

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

### REQ-BOT-010: Endgame Behavior

**Description:** Bot behavior escalates as the game approaches victory conditions:

**Turn 150+ (Late Campaign):**
- All archetypes increase aggression +10%
- Alliance formation increases (defensive coalitions)
- Tier 1 LLM bots generate more dramatic messages

**Leader at 50% Dominance:**
- Automatic defensive coalition forms against leader
- Coalition coordination increases
- "Stop the leader" messaging to all empires

**Last 3 Empires Standing:**
- Maximum communication drama
- Tier 1 bots generate epic monologues
- Final showdown messaging

**Victory Imminent (One Empire at 55%+ territory):**
- Global announcements from LLM bots
- Last alliance proposals
- Dramatic "it's over" or "last stand" messages

**Example Messages:**
- "Attention all commanders. {leader} threatens galactic domination. Temporary ceasefire proposed." (Warlord)
- "To my allies: It has been an honor. For the coalition!" (Diplomat)
- "You all trusted me. Now the galaxy is mine." (Schemer victory)

**Rationale:** Creates narrative climax. Endgame feels different from mid-game. Player experiences dramatic finale whether they win or lose.

**Source:** `docs/design/BOT-SYSTEM.md`

**Code:** `src/lib/bots/endgame.ts`

**Tests:** TBD

**Status:** Draft

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

## Commander Stats Reference

Bot commanders have three mental ability scores that affect decision-making:
- **INT (Intelligence):** 8-18 range, affects tech research speed (+1 RP/turn per modifier)
- **WIS (Wisdom):** 8-18 range, affects retreat decisions (d20+WIS vs DC 15)
- **CHA (Charisma):** 8-18 range, affects alliance formation (d20+CHA vs target WIS)

See [COMBAT-SYSTEM.md Section 2.4](COMBAT-SYSTEM.md#24-commander-stats-mental-abilities---bot-ai-only) for complete commander stat table by archetype.

---

## Related Documents

- [Game Design](GAME-DESIGN.md) - Overall game design
- [COMBAT-SYSTEM.md](COMBAT-SYSTEM.md) - Battle resolution, commander stats (Section 2.4)
- [RESEARCH.md](RESEARCH.md) - Research system, bot preferences (Section 8)
- [Terminology Rules](../development/TERMINOLOGY.md) - CRITICAL
- **[BOT_ARCHITECTURE.md](BOT_ARCHITECTURE.md)** - Original detailed vision (archived)

---

*Consolidated from BOT_ARCHITECTURE.md (original X Imperium vision), VISION.md Section 7, and PRD.md Section 8*
*Last major update: January 2026 - Added LLM prompts, coalition chat, endgame behavior, decision logging*
