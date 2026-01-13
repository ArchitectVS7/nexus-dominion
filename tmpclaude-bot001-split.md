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
