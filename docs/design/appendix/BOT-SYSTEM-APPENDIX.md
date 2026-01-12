# Bot System: Implementation Appendix

**Parent Document:** [BOT-SYSTEM.md](../BOT-SYSTEM.md)
**Purpose:** Code examples, database schemas, LLM prompts, and reference materials for bot AI implementation.

---

## Table of Contents

- [A. Type Definitions](#a-type-definitions)
- [B. Decision Engine Logic](#b-decision-engine-logic)
- [C. LLM Integration](#c-llm-integration)
- [D. Database Schema](#d-database-schema)
- [E. Feature Flags](#e-feature-flags)
- [F. Sample Personas](#f-sample-personas)

---

## A. Type Definitions

### A.1 Bot Decision Types

```typescript
// src/lib/bots/types.ts

type BotDecision =
  | { type: "build_units"; unitType: UnitType; quantity: number }
  | { type: "buy_sector"; sectorType: SectorType }
  | { type: "attack"; targetId: string; forces: Forces }
  | { type: "diplomacy"; action: "propose_nap" | "propose_alliance"; targetId: string }
  | { type: "trade"; resource: ResourceType; quantity: number; action: "buy" | "sell" }
  | { type: "do_nothing" }
```

### A.2 Bot Persona Interface

```typescript
// src/lib/bots/personas.ts

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

### A.3 Bot Game Configuration

```typescript
// src/lib/bots/config.ts

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

### A.4 Bot Decision Log Interface

```typescript
// src/lib/bots/decision-log.ts

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

---

## B. Decision Engine Logic

### B.1 Core Decision Loop (Pseudocode)

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

### B.2 Coalition Formation Logic

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

### B.3 Decision Weight Calculation

```typescript
// src/lib/bots/decision-engine.ts

function calculateActionWeight(
  bot: Empire,
  action: ActionType,
  context: GameContext
): number {
  const baseWeight = bot.archetype.priorities[action];
  const emotionModifier = getEmotionModifier(bot.emotionalState, action);
  const situationalBonus = assessSituation(bot, action, context);

  return baseWeight * emotionModifier * situationalBonus;
}

function selectAction(bot: Empire, context: GameContext): BotDecision {
  const weights = ALL_ACTIONS.map(action => ({
    action,
    weight: calculateActionWeight(bot, action, context)
  }));

  // Select highest weight action (with small random variance)
  return argmax(weights, 'weight');
}
```

---

## C. LLM Integration

### C.1 Provider Chain Configuration

```typescript
// src/lib/bots/llm/providers.ts

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

### C.2 System Prompt Template

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

### C.3 LLM Response Schema

```typescript
// src/lib/bots/llm/response-schema.ts

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

## D. Database Schema

### D.1 Bot Memory Table

```sql
-- Relationship tracking with decay
CREATE TABLE bot_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES empires(id),
  target_id UUID REFERENCES empires(id),
  event_type TEXT NOT NULL,
  event_weight INTEGER NOT NULL,  -- 1-100
  decay_resistance TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'PERMANENT'
  is_permanent_scar BOOLEAN DEFAULT false,
  turn_occurred INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_memories_bot_id ON bot_memories(bot_id);
CREATE INDEX idx_bot_memories_target_id ON bot_memories(target_id);
```

### D.2 Bot Emotional States Table

```sql
CREATE TABLE bot_emotional_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES empires(id) UNIQUE,
  current_emotion TEXT NOT NULL, -- 'confident', 'arrogant', 'desperate', etc.
  intensity DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0.0-1.0
  emotion_target_id UUID REFERENCES empires(id), -- For vengeful state
  last_transition_turn INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### D.3 Bot Decision Logs Table

```sql
CREATE TABLE bot_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES empires(id),
  game_id UUID REFERENCES games(id),
  turn_number INTEGER NOT NULL,
  decision_type TEXT NOT NULL,
  decision_data JSONB NOT NULL,
  reasoning TEXT,
  llm_response TEXT,
  pre_decision_state JSONB,
  outcome JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decision_logs_bot ON bot_decision_logs(bot_id, turn_number);
CREATE INDEX idx_decision_logs_game ON bot_decision_logs(game_id, turn_number);
```

### D.4 Bot Coalition Strategy Table

```sql
CREATE TABLE bot_coalition_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES empires(id),
  coalition_id UUID REFERENCES coalitions(id),
  shared_enemies UUID[],
  attack_coordination JSONB,
  betrayal_planned BOOLEAN DEFAULT false,
  betrayal_turn INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## E. Feature Flags

### E.1 Bot Feature Toggles

```typescript
// src/lib/bots/feature-flags.ts

const BOT_FEATURES = {
  tier3Enabled: true,
  tier2Enabled: false,  // Can disable if broken
  tier1LlmEnabled: false,
  emotionSystemEnabled: false,
  memoryDecayEnabled: false,
  coalitionLogicEnabled: true,
};
```

### E.2 Graceful Degradation Chain

```
LLM failure → fall back to Tier 2 decision tree
Tier 2 failure → fall back to Tier 3 simple rules
Tier 3 failure → fall back to Tier 4 random (always works)
Template system failure → use generic fallback messages
```

---

## F. Sample Personas

### F.1 Admiral Zharkov - The Warlord

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

SAMPLE MESSAGES:
- THREAT: "Your pathetic defenses won't save you.
          Surrender 5000 credits or face annihilation."
- VICTORY: "Your empire crumbles. As expected."
- RESPECT: "You fight well. Perhaps there's honor in you."
```

### F.2 Ambassador Velara - The Diplomat

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

SAMPLE MESSAGES:
- PROPOSAL: "Greetings! I believe our empires could benefit
            from mutual cooperation. Shall we discuss?"
- WARNING: "I urge you to reconsider this path.
           War benefits neither of us."
- GRATITUDE: "Your trust honors us. We shall not forget."
```

### F.3 The Broker - The Schemer

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

SAMPLE MESSAGES:
- FALSE ALLIANCE: "You seem reasonable. Let's form an alliance -
                  together we can dominate!"
                  [Internal: Mark as future target]
- BETRAYAL: "You trusted me. That was your mistake."
- PLOTTING: "Have you noticed {target}'s buildup? Interesting timing..."
```

---

## G. Message Templates by Context

### G.1 Coalition Chat Examples

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

### G.2 Global Endgame Announcements

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

**END APPENDIX**
