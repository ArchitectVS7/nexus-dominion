# Nexus Dominion: Bot AI System

**Version:** 1.0 (Consolidated)
**Status:** Active - Primary Bot Reference
**Last Updated:** January 2026

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
