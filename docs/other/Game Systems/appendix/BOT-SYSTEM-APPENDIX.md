# Bot AI System - Appendix

**Parent Document:** [BOT-SYSTEM.md](../BOT-SYSTEM.md)
**Purpose:** Code examples, detailed algorithms, and TypeScript interfaces

---

## Table of Contents

1. [Code Examples](#1-code-examples)
2. [TypeScript Interfaces](#2-typescript-interfaces)
3. [Decision Algorithms](#3-decision-algorithms)
4. [LLM System Prompts](#4-llm-system-prompts)

---

## 1. Code Examples

### 1.1 Bot Decision Engine - Core Loop

Complete pseudo-code for the bot decision processing loop:

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

**Referenced in:** Main document Section 3 (Detailed Rules)

---

### 1.2 Coalition Formation Algorithm

Complete logic for coalition formation and betrayal:

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

**Referenced in:** Main document Section 3 (Coalition Behavior)

---

## 2. TypeScript Interfaces

### 2.1 BotDecision Type

Decision types that bots can make each turn:

```typescript
type BotDecision =
  | { type: "build_units"; unitType: UnitType; quantity: number }
  | { type: "buy_sector"; sectorType: SectorType }
  | { type: "attack"; targetId: string; forces: Forces }
  | { type: "diplomacy"; action: "propose_nap" | "propose_alliance"; targetId: string }
  | { type: "trade"; resource: ResourceType; quantity: number; action: "buy" | "sell" }
  | { type: "do_nothing" }
```

**Referenced in:** Main document Section 3

**Implementation:** `src/lib/bots/types.ts`

---

### 2.2 BotPersona Interface

Complete structure for bot personality definitions:

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

**Referenced in:** Main document Section 3 (100 Unique Personas)

**Implementation:** `data/personas.json`, `src/lib/bots/personas.ts`

**Tests:** `src/lib/messages/__tests__/personas.test.ts`

---

### 2.3 BotDecisionLog Interface

Complete audit logging structure:

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

**Referenced in:** Main document REQ-BOT-007

**Implementation:** `src/lib/game/repositories/bot-decision-log-repository.ts`

---

### 2.4 BotGameConfig Interface

Game setup configuration for bot distribution and LLM settings:

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

**Referenced in:** Main document Section 8 (Configuration & Tuning)

**Implementation:** `src/lib/bots/types.ts`

---

### 2.5 LLMBotResponse Schema

Expected JSON response structure from LLM API calls:

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

**Referenced in:** Main document REQ-BOT-006 (LLM Integration)

**Implementation:** `src/lib/bots/llm/types.ts`

---

## 3. Decision Algorithms

### 3.1 LLM Provider Fallback Chain

Configuration for LLM provider priority and failover:

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

**Fallback Logic:**
1. Attempt Groq API call (fastest, cheapest)
2. On failure → Attempt Together AI
3. On failure → Attempt OpenAI
4. On failure → Fall back to Tier 2 scripted behavior

**Referenced in:** Main document REQ-BOT-006

**Implementation:** `src/lib/bots/llm/provider.ts`

---

### 3.2 Archetype Decision Formula

How bot decisions are weighted based on personality and emotional state:

```
Action Weight = Base Priority × Emotional Modifier × Situational Adjustment

Final Action = argmax(Action Weight for all possible actions)
```

**Example Calculation:**
```
Warlord considering attack:
  Base Priority (Attack): 0.9
  Emotional Modifier (Vengeful): +40% → 1.4
  Situational Adjustment (Enemy Weak): +20% → 1.2

  Final Weight = 0.9 × 1.4 × 1.2 = 1.512

If this is highest weight among all possible actions, bot attacks.
```

**Referenced in:** Main document REQ-BOT-002

**Formulas:** See also `docs/PRD-FORMULAS-ADDENDUM.md` Section 4.2-4.4

---

## 4. LLM System Prompts

### 4.1 Complete System Prompt Template

Full prompt structure sent to LLM for Tier 1 bot decision-making:

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

**Variable Substitution:**
- `{empire_name}`: Bot's empire name
- `{archetype_description}`: Full personality description (e.g., "Aggressive Warlord who respects strength")
- `{aggression}`, `{diplomacy}`, etc.: Numeric trait values (0-10)
- `{game_state_summary}`: Current turn, networth, sector count, military strength
- `{relationship_summary}`: List of empires with trust scores and recent interactions
- `{recent_events}`: Last 5 turns of significant events (attacks, treaties, messages)

**Referenced in:** Main document REQ-BOT-006

**Implementation:** `src/lib/bots/llm/prompts.ts`

**Expected Response:** See Section 2.5 (LLMBotResponse Schema)

---

### 4.2 Archetype-Specific Personality Descriptions

**Warlord:**
```
You are a ruthless military commander who believes power comes from strength alone.
You respect worthy opponents but despise cowards. You prefer direct confrontation
over subterfuge. Alliances are temporary conveniences - only victory matters.
Your messages are commanding, threatening, and never apologetic.
```

**Diplomat:**
```
You are a skilled negotiator who believes cooperation creates prosperity for all.
You seek win-win solutions and value long-term relationships. You avoid violence
when possible and mediate conflicts between others. Your messages are polite,
formal, and emphasize mutual benefit.
```

**Schemer:**
```
You are a master manipulator who views all relationships as transactions. Trust
is a tool to exploit. You appear charming and helpful while planning betrayals.
Nothing is personal - it's all strategic. Your messages are warm and friendly
(which should make players suspicious).
```

**Merchant:**
```
You are a shrewd businessperson who sees every interaction as a deal. You value
efficiency and profit above all. Alliances are purchased, not earned. You're
transactional but fair. Your messages focus on trade terms and economic benefits.
```

**Turtle:**
```
You are a cautious strategist focused on survival and gradual growth. You never
attack first but defend fiercely. You prefer defensive alliances and wait for
enemies to make mistakes. Your messages are clear warnings about defensive
capabilities.
```

**Referenced in:** Main document REQ-BOT-006

**Implementation:** `src/lib/bots/archetypes/personality-prompts.ts`

---

### 4.3 Sample LLM Interaction

**Input (Game State Summary):**
```json
{
  "turn": 45,
  "empire": {
    "name": "Admiral Zharkov's Domain",
    "networth": 125000,
    "rank": 3,
    "sectors": 18,
    "military_power": 8500
  },
  "relationships": [
    {"empire": "Merchant Guild", "trust": -40, "recent": "Broke trade agreement"},
    {"empire": "Diplomatic Corps", "trust": 60, "recent": "Active NAP"},
    {"empire": "Weak Empire", "trust": 0, "recent": "No interaction", "networth": 35000}
  ],
  "recent_events": [
    "Won battle against Merchant Guild (turn 43)",
    "Merchant Guild sent threatening message (turn 44)"
  ]
}
```

**Output (LLM Response):**
```json
{
  "reasoning": "I just defeated the Merchant Guild and they're rattled. Time to finish them while they're weak. The Diplomatic Corps is a useful ally - maintain that NAP. The weak empire to the south is ripe for conquest after I deal with the Guild.",
  "actions": {
    "military": {
      "attack_target": "merchant_guild_empire_id",
      "attack_force": {"fighters": 300, "bombers": 150},
      "defense_priority": "medium"
    },
    "production": {
      "military_focus": 0.7,
      "economy_focus": 0.2,
      "research_focus": 0.1
    },
    "diplomacy": {
      "propose_treaty": [],
      "accept_treaties": [],
      "break_treaties": []
    }
  },
  "messages": [
    {
      "recipient": "merchant_guild_empire_id",
      "subject": "Your End Approaches",
      "content": "You thought you could threaten me? Pathetic. My fleet is en route. Surrender now or be destroyed."
    },
    {
      "recipient": "global",
      "subject": "Declaration",
      "content": "Let this be a lesson: those who cross Admiral Zharkov pay the price in blood."
    }
  ],
  "coalition": {
    "invite": [],
    "accept_invite": false,
    "leave": false
  }
}
```

**Referenced in:** Main document REQ-BOT-006

---

## Revision History

**Version 1.0** (2026-01-12)
- Initial appendix creation
- Extracted 9 major code blocks from main document
- Added complete TypeScript interfaces
- Added LLM prompt templates and examples

---

**Return to:** [BOT-SYSTEM.md](../BOT-SYSTEM.md)
