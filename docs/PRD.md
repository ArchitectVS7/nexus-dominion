# Nexus Dominion: Product Requirements Document

**Version:** 1.4
**Status:** Active - Canonical Requirements Reference
**Created:** 2026-01-11
**Last Updated:** 2026-01-12 (Frontend Consolidation)

---

## Document Purpose

This PRD is the **single source of truth** for all product requirements. Every feature in the codebase must trace back to a requirement in this document.

### Requirement Format

Each requirement follows this format:

```
### REQ-{SYSTEM}-{NUMBER}: {Title}

**Description:** What the system must do
**Rationale:** Why this requirement exists
**Source:** Original design document reference
**Code:** File path and function/line
**Tests:** Test file and test name
**Status:** Draft | Validated | Deprecated
```

### Section Numbering

Sections are numbered to match existing code references (`@see docs/PRD.md Section X.X`):

| Section | System |
|---------|--------|
| 1 | Game Overview |
| 2 | Turn Processing |
| 3 | Combat System |
| 4 | Resource System |
| 5 | Sector Management |
| 6 | Military & Units |
| 6.8 | Covert Operations |
| 7 | Bot AI System |
| 8 | Diplomacy System |
| 9 | Market System |
| 10 | Research System |
| 11 | Progressive Systems |
| 12 | Victory Conditions |
| 13 | Frontend/UI |
| 14 | Expansion: Crafting |
| 15 | Expansion: Syndicate |

---

## 1. Game Overview

### REQ-GAME-001: Game Identity

**Description:** Nexus Dominion is a 1-2 hour single-player turn-based space empire strategy game where players compete against 10-100 AI bot opponents.

**Rationale:** Defines the core product vision and scope.

**Source:** `docs/design/GAME-DESIGN.md` (Quick Overview)

**Code:** N/A (conceptual)

**Tests:** N/A

**Status:** Validated

---

### REQ-GAME-002: Game Modes

**Description:** Two game modes are supported:
- **Oneshot:** 10-25 bots, 50-100 turns
- **Campaign:** 25-100 bots, 150-500 turns

**Rationale:** Provides variety for different play session lengths.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-GAME-003: Simultaneous Processing

**Description:** All empires (player and bots) process their turns simultaneously, not sequentially. This creates a "single-player MMO" feel.

**Rationale:** Prevents turn-order advantages and creates emergent gameplay.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts`

**Tests:** TBD

**Status:** Draft

---

## 2. Turn Processing

### REQ-TURN-001: Turn Processing Pipeline

**Description:** Each turn consists of two processing tiers executed in order:

**Tier 1 - Transactional (atomic, all-or-nothing):**
1. Income Phase - Resources generated (with civil status multiplier)
2. Tier 1 Auto-Production - Crafting system resource generation
3. Population Phase - Growth/starvation based on food
4. Civil Status Phase - Morale evaluated
5. Research Phase - Research points allocated
6. Build Queue Phase - Unit construction progresses
7. Covert Phase - Spy points generated
8. Crafting Phase - Crafting queue processed

**Tier 2 - Non-Transactional (can fail gracefully):**
9. Bot Decisions - AI makes strategic choices
10. Emotional Decay - Bot emotions cool down
11. Memory Cleanup - Old memories pruned (every 5 turns)
12. Market Phase - Prices update
13. Bot Messages - Communication generated
14. Galactic Events - Random events trigger (M11)
15. Alliance Checkpoints - Coalition evaluations (M11)
16. Victory Check - Win/loss conditions evaluated
17. Auto-Save - Game state persisted

**Rationale:** Two-tier structure ensures critical empire state is atomic (transaction rollback on failure) while allowing non-critical systems to fail gracefully.

**Source:** `docs/design/GAME-DESIGN.md`, `src/lib/game/services/core/turn-processor.ts` (lines 13-29)

**Code:** `src/lib/game/services/core/turn-processor.ts:processTurn()`

**Tests:** `src/lib/game/services/__tests__/turn-processor.test.ts` (25 tests - validates phases 3-4 individually)

**Status:** Partial - phases 3-4 validated, full pipeline integration test pending

---

### REQ-TURN-002: Turn Increment

**Description:** Turn number increments by 1 after all phases complete successfully.

**Rationale:** Provides consistent game clock for all systems.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-TURN-003: Victory Check Timing

**Description:** Victory conditions are checked after all turn processing completes, before the turn number increments.

**Rationale:** Ensures fair evaluation of all empire states.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/turn-processor.ts`

**Tests:** TBD

**Status:** Draft

---

## 3. Combat System

**Source Document:** `docs/design/COMBAT-SYSTEM.md`

### REQ-COMBAT-001: D20 Unified Resolution

**Description:** All combat is resolved with a single D20 roll using unified resolution mechanics, not sequential phase-based combat.

**Rationale:** Simplifies combat while maintaining drama and unpredictability.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/combat/phases.ts`

**Tests:** `src/lib/combat/phases.test.ts`

**Status:** Draft

---

### REQ-COMBAT-002: Attacker Win Rate

**Description:** With equal forces, the attacker wins approximately 47.6% of battles.

**Rationale:** Slight defender advantage encourages defensive play and alliances.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts`

**Tests:** TBD (Monte Carlo validation needed)

**Status:** Draft

---

### REQ-COMBAT-003: Defender Advantage

**Description:** Defenders receive a 1.10x (10%) power bonus when fighting in their own territory.

**Rationale:** Makes conquest harder, rewards defense.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:DEFENDER_ADVANTAGE`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-004: Unit Power Multipliers

**Description:** Each unit type has a specific power multiplier:
- Soldiers: 0.1
- Fighters: 1
- Stations: 3 (6 when defending)
- Light Cruisers: 4
- Heavy Cruisers: 8
- Carriers: 12

**Rationale:** Creates unit hierarchy and strategic choices.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:POWER_MULTIPLIERS`

**Tests:** `src/lib/formulas/combat-power.test.ts` (line 248: "has correct values from PRD 6.2")

**Status:** Draft

---

### REQ-COMBAT-005: Diversity Bonus

**Description:** Fleets with 4 or more distinct unit types receive a 15% power bonus.

**Rationale:** Encourages balanced fleet composition over mono-unit strategies.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:calculateDiversityBonus()`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-006: Station Defense Multiplier

**Description:** Stations have 2.0x power when defending (effectively power 6 instead of 3).

**Rationale:** Stations are defensive installations, not offensive units.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/formulas/combat-power.ts:STATION_DEFENSE_MULTIPLIER`

**Tests:** `src/lib/formulas/combat-power.test.ts`

**Status:** Draft

---

### REQ-COMBAT-007: Protection Period

**Description:** New players have a 20-turn protection period during which they cannot be attacked.

**Rationale:** Allows new players to establish their empire before combat.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts:PROTECTION_TURNS`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-008: Six Dramatic Outcomes

**Description:** Combat results in one of 6 outcomes based on roll and power differential:
1. Decisive Victory (attacker)
2. Victory (attacker)
3. Pyrrhic Victory (attacker)
4. Pyrrhic Victory (defender)
5. Victory (defender)
6. Decisive Victory (defender)

**Rationale:** Creates narrative variety in battle reports.

**Source:** `docs/design/COMBAT-SYSTEM.md`

**Code:** `src/lib/combat/phases.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-009: Multi-Domain Battle Resolution

**Description:** Full Invasions resolve combat across three sequential domains:

1. **SPACE BATTLE:** Fighters, Cruisers, Carriers
   - Winner gains +2 bonus to Orbital and Ground domains

2. **ORBITAL BATTLE:** Stations, Bombers, Support ships
   - Winner gains +2 bonus to Ground domain

3. **GROUND BATTLE:** Soldiers, Mechs (transported by carriers)
   - Winner captures 5-15% of defender's sectors

Cross-domain bonuses stack: Win Space + Orbital = +4 bonus to Ground battle.

**Rationale:** Creates strategic depth where space/orbital supremacy provides tactical advantage on ground.

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 4.2

**Code:** `src/lib/combat/multi-domain.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-010: Three Battle Types

**Description:** Three distinct battle types with different requirements and outcomes:

1. **Full Invasion:**
   - Requirements: Carriers + space control
   - Resolution: Multi-domain (Space/Orbital/Ground)
   - Outcome: Can capture 5-15% of defender's sectors

2. **Covert Strike:**
   - Requirements: Commando units OR Syndicate "Pirate Raid" contract
   - Resolution: Single domain (Ground only)
   - Outcome: 10-20% infrastructure damage, -20% production for 2-3 turns, NO sector capture

3. **Blockade:**
   - Requirements: Space fleet
   - Resolution: No ground combat (economic pressure)
   - Outcome: Reduce target's trade income, NO sector capture

**Rationale:** Provides strategic alternatives to direct conquest. Covert Strikes enable asymmetric warfare without fleet superiority.

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 4.1 (updated), `docs/design/COMBAT-SYSTEM-RAID-RESOLUTION.md`

**Code:** `src/lib/combat/battle-types.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-011: Unit Rarity Tiers

**Description:** Units are organized into three rarity tiers with escalating power:

- **Tier I (Standard):** Stats 8-12 range, available Turn 1
- **Tier II (Prototype):** Stats 12-16 range, unlocked via research doctrines
- **Tier III (Singularity):** Stats 16-20 range, rare drafts after Turn 50, limit 1 per game per empire

Higher tiers have better STR/DEX/CON modifiers, HP pools, and special abilities.

**Rationale:** Creates power progression and late-game escalation. Tier III units feel "legendary."

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 7

**Code:** `src/lib/combat/unit-cards.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-COMBAT-012: Morale & Surrender System

**Description:** Combat includes morale checks and surrender mechanics:

**Morale Check (50%+ unit losses):**
- Roll: d20 + Commander WIS vs DC 15
- Success: Fight to the end
- Failure DC 10-14: Shaken (-2 all rolls next round)
- Failure <DC 10: Routed (immediate retreat with losses)

**Surrender Offer (75%+ HULL losses):**
- Roll: d20 + Attacker CHA vs Defender WIS
- Success: Defender surrenders sector without further combat
- Failure: Combat continues

**Rationale:** Prevents total annihilation, enables tactical retreats, creates dramatic "last stand" moments.

**Source:** `docs/design/COMBAT-SYSTEM.md` Sections 4.4-4.5

**Code:** `src/lib/combat/morale.ts`

**Tests:** TBD

**Status:** Draft

---

## 4. Resource System

### REQ-RES-001: Five Resource Types

**Description:** The game has 5 resource types:
1. Credits - Currency for purchases
2. Food - Sustains population and soldiers
3. Ore - Military maintenance
4. Petroleum - Fuel for military and wormholes
5. Research Points - Technology advancement

**Rationale:** Multiple resources create economic strategy.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:empires`

**Tests:** TBD

**Status:** Draft

---

### REQ-RES-002: Sector Production

**Description:** Each sector type produces specific resources per turn:
- Commerce: Credits
- Food: Food
- Ore: Ore
- Petroleum: Petroleum
- Research: Research Points
- Industrial: Mixed (Ore + Credits)
- Military: Reduced production, unit bonuses
- Residential: Population growth bonus

**Rationale:** Creates sector specialization and expansion strategy.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/resource-engine.ts`

**Tests:** `src/lib/game/services/__tests__/resource-engine.test.ts`

**Status:** Draft

---

### REQ-RES-003: Civil Status Income Multiplier

**Description:** Civil status affects all income with these multipliers:
- Ecstatic: 4.0x (was disputed, now 2.5x per rebalance)
- Happy: 2.0x (was disputed, now 1.5x per rebalance)
- Content: 1.0x
- Unhappy: 0.75x
- Angry: 0.5x
- Rioting: 0.25x

**Rationale:** Creates meaningful consequences for empire management.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/civil-status.ts`

**Tests:** `src/lib/game/services/__tests__/civil-status.test.ts`

**Status:** Draft (values need verification against code)

---

## 5. Sector Management

### REQ-SEC-001: Starting Sectors

**Description:** Each empire starts with 5 sectors.

**Rationale:** Provides meaningful starting position without overwhelming new players.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts:STARTING_SECTORS`

**Tests:** TBD

**Status:** Draft

---

### REQ-SEC-002: Sector Cost Scaling

**Description:** The cost to acquire new sectors increases based on current sector count using a scaling formula.

**Rationale:** Prevents runaway expansion, creates strategic choices.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/formulas/sector-costs.ts`

**Tests:** `src/lib/formulas/sector-costs.test.ts`

**Status:** Draft

---

### REQ-SEC-003: Eight Sector Types

**Description:** 8 sector types exist: Commerce, Food, Ore, Petroleum, Research, Industrial, Military, Residential.

**Rationale:** Specialization creates strategic depth.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:sectorTypeEnum`

**Tests:** TBD

**Status:** Draft

---

## 6. Military & Units

### REQ-MIL-001: Six Unit Types

**Description:** 6 military unit types exist:
1. Soldiers - Ground troops
2. Fighters - Basic space combat
3. Stations - Defensive installations
4. Light Cruisers - Versatile warships
5. Heavy Cruisers - Heavy firepower
6. Carriers - Fleet support

**Rationale:** Unit variety creates strategic depth.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:unitTypeEnum`

**Tests:** `src/lib/game/unit-config.test.ts`

**Status:** Draft

---

### REQ-MIL-002: Build Queue

**Description:** Units are constructed via a build queue with per-turn completion.

**Rationale:** Prevents instant army creation, requires planning.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/build-queue-service.ts`

**Tests:** `src/lib/game/services/__tests__/build-queue-service.test.ts`

**Status:** Draft

---

## 6.8 Covert Operations

**Note:** Section 6.8 is referenced in existing code.

### REQ-COV-001: Ten Operation Types

**Description:** 10 covert operation types are available for espionage and sabotage.

**Rationale:** Adds non-combat strategic options.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/covert/operations.ts`

**Tests:** TBD

**Status:** Draft

---

## 7. Bot AI System

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

**Description:** 8 bot archetypes define behavioral patterns with unique passive abilities:

1. **Warlord** - Aggressive military focus
   - Passive: War Economy (-20% military cost when at war)
   - Priority: Attack 0.9, Defense 0.5, Alliance 0.3

2. **Diplomat** - Alliance-seeking, mediates conflicts
   - Passive: Trade Network (+10% income per active alliance)
   - Priority: Alliance 0.95, Communication 0.9, Attack 0.2

3. **Merchant** - Economic domination, buys loyalty
   - Passive: Market Insight (sees next turn market prices)
   - Priority: Economy 0.95, Alliance 0.7, Attack 0.3

4. **Schemer** - Deceptive tactics, betrayals
   - Passive: Shadow Network (-50% covert operation cost)
   - Priority: Covert 0.9, Communication 0.95*, Alliance 0.8* (*for deception)

5. **Turtle** - Defensive buildup, never attacks first
   - Passive: Fortification (2× defensive structure power)
   - Priority: Defense 0.95, Economy 0.7, Attack 0.1

6. **Blitzkrieg** - Fast early expansion, aggressive strikes
   - Priority: Early aggression focus, cripples neighbors

7. **Tech Rush** - Research priority, late-game power spike
   - Priority: Research focus, delayed military buildup

8. **Opportunist** - Adaptive vulture strategy, attacks weakened empires
   - Priority: Opportunistic targeting of low-networth empires

**Rationale:** Creates diverse, memorable opponents with distinct mechanical advantages and playstyles.

**Source:** `docs/design/BOT-SYSTEM.md`

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

## 8. Diplomacy System

### REQ-DIP-001: Treaty Types

**Description:** Two treaty types exist:
- NAP (Non-Aggression Pact): Cannot attack each other
- Alliance: Shared intel, coordinated actions

**Rationale:** Enables diplomatic gameplay.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/diplomacy/`

**Tests:** `src/lib/diplomacy/constants.test.ts`

**Status:** Draft

---

### 8.2 Coalitions

### REQ-DIP-002: Coalition System

**Description:** Multiple empires can form coalitions against dominant threats. Coalition victory is achieved when coalition controls 50% of territory.

**Rationale:** Anti-snowball mechanic to prevent runaway victories.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/__tests__/coalition-service.test.ts`

**Tests:** `src/lib/game/services/__tests__/coalition-service.test.ts`

**Status:** Draft

---

## 9. Market System

### REQ-MKT-001: Resource Trading

**Description:** Players can buy and sell resources on the galactic market at fluctuating prices.

**Rationale:** Enables economic strategy and resource conversion.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/market/`

**Tests:** `src/lib/market/constants.test.ts`

**Status:** Draft

---

## 10. Research System

### REQ-RSCH-001: Three-Tier Research Structure

**Description:** Research follows a 3-tier draft system:
1. **Doctrines (Tier 1)** - Turn ~10, choose 1 of 3, public announcement
2. **Specializations (Tier 2)** - Turn ~30, choose 1 of 2, hidden until revealed
3. **Capstones (Tier 3)** - Turn ~60, automatic based on doctrine, galaxy-wide announcement

**Rationale:** Creates meaningful strategic identity choices with progressive power scaling.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 1.1

**Code:** `src/lib/game/services/research-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-002: Doctrine System (Tier 1)

**Description:** Three doctrines define strategic identity:
- **War Machine:** +2 STR to all units, -10% planet income, unlocks military specializations
- **Fortress:** +4 AC when defending, -5% attack power, unlocks defensive specializations
- **Commerce:** +2 CHA (commander), +20% market prices, unlocks economic specializations

Each doctrine unlocks 2 specializations. Choice is public and announced galaxy-wide.

**Rationale:** Establishes strategic direction and asymmetric gameplay early.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 3

**Code:** `src/lib/game/services/research-service.ts:selectDoctrine`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-003: Specialization System (Tier 2)

**Description:** Hidden specializations provide focused tactical bonuses (2 per doctrine, player picks 1):

**War Machine:**
- Shock Troops: Surprise round (attack before initiative)
- Siege Engines: +50% damage vs stationary targets

**Fortress:**
- Shield Arrays: Immunity to surprise rounds
- Minefield Networks: Pre-combat CON save DC 15

**Commerce:**
- Trade Monopoly: -20% buy, +30% sell prices
- Mercenary Contracts: +2 STR to hired units per battle

Choice is **hidden** until revealed through combat, espionage (5,000 cr), alliance sharing, or galactic news rumors.

**Rationale:** Creates information asymmetry and tactical surprise.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 4

**Code:** `src/lib/game/services/research-service.ts:selectSpecialization`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-004: Capstone System (Tier 3)

**Description:** Automatic capstone unlock at ~Turn 60 based on doctrine:

- **War Machine → Dreadnought:** Unique unit (STR 20, HP 200, unlimited attacks per round)
- **Fortress → Citadel World:** One planet becomes AC 25 (nearly invulnerable)
- **Commerce → Economic Hegemony:** Generate 50% of 2nd place empire's income automatically

Triggers galaxy-wide announcement and bot reactions.

**Rationale:** Provides late-game power spike and endgame drama.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 5

**Code:** `src/lib/game/services/research-service.ts:unlockCapstone`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-005: Research Point Economy

**Description:**
- Research planets generate 100 RP/turn
- Thresholds: 1,000 RP (Tier 1), 5,000 RP (Tier 2), 15,000 RP (Tier 3)
- Progress is **hidden** from other empires (cannot see opponent's RP totals)
- No automatic advancement; reaching threshold unlocks choice event

**Rationale:** Creates predictable timing (~Turn 10/30/60) while hiding exact progress.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 1.2

**Code:** `src/lib/game/services/research-service.ts:processResearchProduction`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-006: Research Information Visibility

**Description:** Asymmetric information model:

**PUBLIC:**
- Doctrine choices (announced Turn ~10)
- Tier 3 capstone unlocks (announced Turn ~60)

**HIDDEN:**
- Current RP accumulation
- Progress % toward next tier
- Specialization choice

**REVEALED THROUGH:**
- Combat (first use of specialization ability)
- Espionage (Investigate Specialization, 5,000 cr, 85% success)
- Alliance membership (auto-share with coalition)
- Galactic News rumors (50% accuracy, every 10 turns)

**Rationale:** Encourages intelligence gathering and creates deduction gameplay.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 2

**Code:** `src/lib/game/services/research-service.ts:revealSpecialization`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-007: Research-Combat Integration

**Description:** Research bonuses modify combat mechanics:

- Doctrine bonuses apply to **all units** (permanent stat changes)
- Specialization bonuses apply **during combat** (conditional effects)
- Stack multiplicatively: Base damage + Doctrine + Specialization + Tech Cards

Example: War Machine (+2 STR) + Shock Troops (surprise round) + Plasma Torpedoes (+2 damage first round)
→ First round: 2d8+1 base → 2d8+3 (doctrine) → 2d8+5 (card) with surprise initiative

**Rationale:** Research directly impacts tactical combat outcomes.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 6

**Code:** `src/lib/combat/research-bonuses.ts:applyResearchBonuses`

**Tests:** TBD

**Status:** Draft

---

### REQ-RSCH-008: Specialization Counter-Play

**Description:** Specializations counter each other in rock-paper-scissors fashion:

- **Shield Arrays** > Shock Troops (immunity to surprise)
- **Siege Engines** > Shield Arrays (bypass AC)
- **Minefield Networks** > Siege Engines (pre-combat damage)

Counter-picking requires knowledge of opponent's specialization (espionage, combat reveal, or alliance intel).

**Rationale:** Rewards intelligence gathering and creates tactical depth.

**Source:** `docs/design/RESEARCH-SYSTEM.md` Section 4.5

**Code:** `src/lib/combat/specialization-counters.ts`

**Tests:** TBD

**Status:** Draft

---

## 11. Progressive Systems

### 11.1 Progressive Unlocks

### REQ-PROG-001: Feature Unlocks

**Description:** Certain features unlock at specific turn thresholds:
- Turn 20: Diplomacy fully available
- Turn 50: Black Market access
- Turn 100: Nuclear weapons

**Rationale:** Introduces complexity gradually.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/constants/unlocks.ts`

**Tests:** TBD

**Status:** Draft

---

### 11.3 Checkpoints

### REQ-PROG-002: Game Checkpoints

**Description:** Game state can be saved at checkpoints for campaign continuation.

**Rationale:** Supports long campaign games across sessions.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/events/checkpoint-service.ts`

**Tests:** TBD

**Status:** Draft

---

### 11.4 Events

### REQ-PROG-003: Galactic Events

**Description:** Random galactic events occur that affect all empires.

**Rationale:** Creates shared challenges and narrative moments.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/events/event-service.ts`

**Tests:** TBD

**Status:** Draft

---

## 12. Victory Conditions

### REQ-VIC-001: Conquest Victory

**Description:** Achieved when an empire controls 60% of all territory.

**Rationale:** Classic domination victory.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-002: Economic Victory

**Description:** Achieved when an empire has 1.5x the networth of the second-place empire.

**Rationale:** Builder/trader victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-003: Diplomatic Victory

**Description:** Achieved when a coalition controls 50% of territory.

**Rationale:** Alliance-based victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-004: Research Victory

**Description:** Achieved when an empire completes the entire Tier 3 tech tree.

**Rationale:** Tech rush victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-VIC-005: Military Victory

**Description:** Achieved when an empire has 2x the military power of all other empires combined.

**Rationale:** Military supremacy victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-VIC-006: Survival Victory

**Description:** Achieved by having the highest score when the turn limit is reached.

**Rationale:** Default victory for balanced play.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

## 13. Frontend/UI

**Source Document:** `docs/design/FRONTEND-DESIGN.md` (Consolidated design system v3.0, 2026-01-12)

### 13.1 Design Philosophy

### REQ-UI-001: Boardgame + LCARS Aesthetic

**Description:** The UI must embody two core pillars:
1. **Boardgame Mental Model:** Star map is the board (always visible), panels are like examining cards
2. **LCARS Visual Design:** Star Trek-inspired glass panels, curved corners, color-coded information

Visual characteristics:
- Glass panels with backdrop blur over deep space backgrounds
- LCARS color palette: Orange (primary), Purple (secondary), Blue (friendly), Red (danger), Amber (warnings)
- Orbitron/Exo 2 display fonts with Roboto Mono for data
- Pill-shaped buttons with glow effects
- Ambient animations and transitions

**Rationale:** Creates distinctive, immersive interface that reinforces spatial strategy gameplay.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 1

**Code:** `src/components/`, `tailwind.config.ts`

**Tests:** E2E visual tests (TBD)

**Status:** Draft

---

### 13.2 Navigation Architecture

### REQ-UI-002: Star Map as Hub

**Description:** The star map is NOT just another page - it is the **default view and central hub** for all gameplay:
- `/game/starmap` is the primary route (all `/game` routes redirect here)
- All other screens (military, market, research, diplomacy) are **overlay panels** that slide over a dimmed star map
- Overlays use query parameters: `/game/starmap?panel=military`, `/game/starmap?panel=market`
- Pressing ESC or clicking backdrop returns to clean star map view
- Star map remains visible (dimmed/blurred) behind overlays to maintain spatial context

**Rationale:** Physical boardgames keep the board always visible. Breaking this pattern breaks the boardgame feel. Players need spatial awareness and strategic context at all times.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 3.1

**Code:** `src/app/game/starmap/page.tsx`, `src/components/game/OverlayPanel.tsx`, `src/components/game/OverlayPanelController.tsx`

**Tests:** E2E navigation tests (TBD)

**Status:** Draft

---

### REQ-UI-003: Overlay Panel System

**Description:** All game screens (except star map) render as overlay panels with these properties:
- **Positions:** right, left, bottom, center
- **Animations:** Slide in from edge using Framer Motion
- **Backdrop:** Dimmed star map (60% opacity, blur effect) always visible
- **Close actions:** ESC key, click backdrop, close button, navigate to `/game/starmap`
- **Server-rendered:** Panels fetch data server-side, render with Suspense boundaries

Panel routing:
- Military: `?panel=military` (right overlay)
- Market: `?panel=market` (bottom overlay)
- Research: `?panel=research` (right overlay)
- Diplomacy: `?panel=diplomacy` (center overlay)
- Empire details: `?empire=<id>` (right overlay)

**Rationale:** Maintains boardgame feel (picking up cards), faster navigation (no page transitions), preserves spatial context.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 3.3

**Code:** `src/components/game/OverlayPanel.tsx`, `src/components/game/OverlayPanelController.tsx`

**Tests:** Component tests for overlay behavior (TBD)

**Status:** Draft

---

### 13.3 Component Patterns

### REQ-UI-004: Card + Details Sidebar Pattern

**Description:** All resource management screens (market, military, sectors) MUST use horizontal split layout to eliminate scrolling:
- **Left side (1/3 width):** Selection list of items (scrollable if needed)
- **Right side (2/3 width):** Details + action controls + confirmation button
- **Critical:** Action button ALWAYS visible at bottom (no scrolling required to confirm)
- Fixed container height (600px or viewport-based)

Applies to:
- Market trading interface
- Unit building panel
- Sector purchase screen
- Research allocation
- Diplomacy offers

**Rationale:** Original vertical stacking forced scrolling and hid action buttons below fold. UX analysis identified this as major friction point. Horizontal split eliminates scrolling and keeps actions visible.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 4.3, `docs/design/UX-ROADMAP.md` (archived analysis)

**Code:** `src/components/game/market/MarketPanel.tsx`, `src/components/game/military/BuildUnitsPanel.tsx`

**Tests:** E2E tests for no-scroll workflow (TBD)

**Status:** Draft

---

### 13.4 UX Patterns

### REQ-UI-005: Collapsible Phase Indicator

**Description:** A persistent turn phase indicator must show players which of the 6 turn phases is executing:
- **Sticky header** at top of screen showing current turn and phase
- **Auto-expanded** for first 5 turns (tutorial), then collapsible
- **Collapsed state:** Shows turn number, current phase name, time remaining
- **Expanded state:** Shows phase description, available actions (as links), "End Turn" button
- **Keyboard shortcut:** Toggle with spacebar

Phase display:
```
Turn 42/200 | Phase 6/6: Player Actions | ⏰ 4:23 remaining
```

**Rationale:** UX analysis identified turn phase invisibility as CRITICAL issue. Players cannot learn game mechanics without understanding when events occur. Phase indicator teaches timing and guides actions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 6.1, `docs/design/UX-ROADMAP.md` Priority 1

**Code:** `src/components/game/PhaseIndicator.tsx`, `src/app/game/layout.tsx`

**Tests:** Component tests for phase display (TBD)

**Status:** Draft

---

### REQ-UI-006: Actionable Guidance System

**Description:** All warnings and alerts must be actionable (include solution buttons), not passive:
- **Severity levels:** critical (red, pulsing), warning (amber), opportunity (blue), info (gray)
- **Components:** Message + 1-3 action buttons with icons
- **Actions:** Direct links to relevant screens or inline action buttons
- **Non-dismissible:** Critical alerts block turn end until addressed

Example - Food shortage:
```
⚠️ Food deficit! You will lose population next turn (-500 food/turn)
[🛒 Buy Agriculture Sectors] [🏪 Buy Food from Market] [❌ Dismiss]
```

**Rationale:** UX analysis found players see warnings but don't know how to fix them. Actionable prompts convert passive notifications into guided solutions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 6.2, `docs/design/UX-ROADMAP.md` Priority 2

**Code:** `src/components/game/ActionPrompt.tsx`, replaces `FoodWarning.tsx`

**Tests:** Component tests for action routing (TBD)

**Status:** Draft

---

### REQ-UI-007: Strategic Visual Language

**Description:** Game actions must feel meaningful through visual feedback using Anticipation → Action → Payoff pattern:

**Tier 1 - Anticipation (pre-action):**
- Show preview of what player will gain BEFORE committing
- Hover effects with glow/scale (1.05x scale, glow shadow)
- Cost/benefit breakdown visible

**Tier 2 - Payoff (post-action):**
- Success animations on completion (scale pulse, green glow)
- Explicit "+X gained" messages
- Particle effects for major actions (optional)

**Tier 3 - Threat (attention):**
- Critical alerts pulse and animate
- Incoming attacks flash red with countdown
- Can't-be-ignored visual priority

**Rationale:** Game felt "administrative" rather than "strategic." Visual feedback creates tension, risk, reward feelings. Every action should have emotional weight.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 6.3, `docs/design/UX-ROADMAP.md` Priority 5

**Code:** Component-specific styles, `src/components/game/*/styles.ts`

**Tests:** Visual regression tests (TBD)

**Status:** Draft

---

### 13.5 Technical Stack

### REQ-UI-008: React Query Data Layer

**Description:** All server state is managed via React Query hooks.

**Rationale:** SDD architecture for predictable data flow.

**Source:** SDD Migration (Phase 3)

**Code:** `src/lib/api/queries/`, `src/lib/api/mutations/`

**Tests:** TBD

**Status:** Validated (Phase 3 complete)

---

### REQ-UI-009: Zustand Client State

**Description:** All client-only state is managed via Zustand stores.

**Rationale:** SDD architecture for predictable state management.

**Source:** SDD Migration (Phase 3)

**Code:** `src/stores/`

**Tests:** TBD

**Status:** Validated (Phase 3 complete)

---

### REQ-UI-010: CSS + GSAP Hybrid Animation

**Description:** Animation strategy uses two systems:
- **CSS transitions:** Hover states, focus states, simple show/hide, color changes (100-300ms)
- **GSAP timelines:** Combat sequences, turn transitions, complex multi-step animations (3+ steps)

**Performance guidelines:**
- Only animate transform and opacity (GPU-accelerated)
- Never animate layout properties (width, height, top, left)
- Respect `prefers-reduced-motion` setting

**Rationale:** CSS handles micro-interactions efficiently. GSAP handles narrative sequences (combat, turn processing) with precise control. Best of both worlds.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 7

**Code:** `src/styles/globals.css`, `src/lib/animations/`

**Tests:** Animation unit tests (TBD)

**Status:** Draft

---

### REQ-UI-011: D3.js Star Map Visualization

**Description:** Star map uses D3.js force-directed graph visualization:
- **Nodes:** Empires rendered as nebula clouds with glow filters
- **Edges:** Treaty lines (alliances, NAPs) and threat indicators
- **Forces:** Charge (repulsion), center (centering), collision (overlap prevention)
- **Interactions:** Click empire → open detail overlay, zoom, pan
- **Intel system:** Unknown/basic/moderate/full visibility levels

**Rationale:** D3.js is already implemented and perfect for network graph layouts. SVG enables easy styling and interaction. Force simulation creates organic, visually pleasing empire distributions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 8, `docs/design/frontend-developer-manual.md`

**Code:** `src/components/game/starmap/StarMap.tsx`

**Tests:** Visual tests for rendering (TBD)

**Status:** Draft (already implemented)

---

### 13.6 Accessibility

### REQ-UI-012: Keyboard Navigation

**Description:** All interactive elements must be keyboard accessible with global shortcuts:
- `M` → Return to star map
- `B` → Open military panel
- `T` → Open market panel (Trade)
- `R` → Open research panel
- `D` → Open diplomacy panel
- `ESC` → Close all panels
- `Space` → Toggle phase indicator
- `Tab` / `Shift+Tab` → Navigate focusable elements
- `Enter` / `Space` → Activate buttons

**Rationale:** Keyboard navigation improves speed for experienced players and ensures accessibility compliance.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 9.1

**Code:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/game/GameShell.tsx`

**Tests:** E2E keyboard navigation tests (TBD)

**Status:** Draft

---

### REQ-UI-013: WCAG AA Color Contrast

**Description:** All text must meet WCAG AA contrast ratios:
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum
- Don't rely on color alone (use icons + color)

**Rationale:** Ensures readability for players with visual impairments and in various lighting conditions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 9.3

**Code:** `tailwind.config.ts` color definitions

**Tests:** Automated contrast tests with axe-core (TBD)

**Status:** Draft

---

## 14. Expansion: Tech Wars (Crafting Replacement)

**Source Document:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Design Note:** The original 4-tier crafting system (22 resources, supply chain management) was explicitly rejected as "logistics management bolted onto empire strategy." The Tech Card draft system replaces it with strategic card drafting integrated into the core combat loop.

---

### REQ-TECH-001: Tech Card Draft System

**Description:** Tech progression uses a card draft system instead of resource crafting:
- 30-40 unique tech cards in three tiers (T1, T2, T3)
- Turn 1: Each player draws 3 T1 cards, keeps 1 (hidden until end game)
- Every 10 turns: Draft event where players draw 2 cards, keep 1 (public)
- Turn 50+: Rare T3 cards become available with game-changing effects

**Rationale:** Provides strategic depth through draft choices while avoiding supply chain micromanagement. Every card directly affects combat, creating visible drama and bot reactions.

**Source:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Code:** TBD (expansion content)

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-002: Hidden Objectives (T1 Cards)

**Description:** T1 cards drawn at Turn 1 are secret objectives that score bonus Victory Points at game end:
- Warmonger's Arsenal: +2 VP per empire eliminated
- Merchant's Ledger: +1 VP per 10,000 credits earned
- Diplomat's Archive: +2 VP per active treaty at game end
- Survivor's Grit: +3 VP if never lost a sector
- Opportunist's Eye: +1 VP per sector captured from top 3 players

**Rationale:** Creates Lord of Waterdeep-style hidden incentives. Players don't know each other's objectives, creating post-game reveals and strategic misdirection.

**Source:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Code:** TBD (expansion content)

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-003: Public Draft Cards (T2)

**Description:** T2 cards drafted publicly every 10 turns provide combat effects with counterplay:
- Each card has a specific combat effect (e.g., Plasma Torpedoes: +20% first-round damage)
- Each card lists its counter card (e.g., Shield Arrays counter Plasma Torpedoes)
- All players see who drafts what, enabling strategic responses

**Rationale:** Creates draft drama ("The Warlord just drafted Plasma Torpedoes!"), encourages counter-picking, and makes tech choices visible to opponents.

**Source:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Code:** TBD (expansion content)

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-004: Legendary Cards (T3)

**Description:** T3 cards are rare, powerful, and announced to all players:
- Planet Cracker: Destroy 1 sector permanently (removes from game)
- Dyson Swarm: Double income from all sectors
- Mind Control Array: Force one bot to attack another
- Temporal Stasis: Skip one player's turn
- Genesis Device: Create a new sector in your territory

**Rationale:** Creates dramatic moments and galaxy-wide reactions. These are "boss abilities" that shift the balance of power.

**Source:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Code:** TBD (expansion content)

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-005: Bot Tech Card Integration

**Description:** Bots have archetype preferences for tech cards and announce their picks:
- Archetypes prefer specific cards (Warlord → Plasma Torpedoes, Turtle → Shield Arrays)
- Bots announce drafts with personality-specific messages
- Bots react to player's visible tech cards in combat decisions

**Rationale:** Integrates tech cards into bot personality system, creating narrative moments and strategic visibility.

**Source:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Code:** TBD (expansion content)

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-006: End Game Hidden Objective Reveal

**Description:** At game end (turn limit or victory achieved), all hidden T1 cards reveal with bonus VP calculations displayed to all players.

**Rationale:** Creates post-game discussion ("I thought Varkus was playing aggressively because he's a Warlord, but he was also scoring his hidden objective!").

**Source:** `docs/expansion/CRAFTING-EXPANSION-CONCEPT.md`

**Code:** TBD (expansion content)

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-007: Tech Card Catalog (40 Cards Total)

**Description:** Specific tech card pool organized by tier:

**TIER 1 - Hidden Objectives (12 cards):**
- Warmonger's Arsenal (+2 VP per empire eliminated)
- Merchant's Ledger (+1 VP per 25k credits earned)
- Diplomat's Archive (+3 VP per active treaty)
- Survivor's Grit (+5 VP if never lost planet)
- [8 additional cards covering different victory paths]

**TIER 2 - Tactical Cards (20 cards, 5 categories):**
- Offensive (5): Plasma Torpedoes (+2 damage first round), Ion Cannons, Boarding Parties, Overcharged Weapons, Focus Fire
- Defensive (5): Shield Arrays (negate surprise), Point Defense, Hardened Circuits, Regenerative Hull, Emergency Shields
- Utility (5): Cloaking Field (-4 enemy to-hit first round), Scanner Arrays (detect cloak), EMP Burst, Shielded Core, Repair Drones
- Economic (3): Salvage Operations, Rapid Deployment (-10% unit cost), War Bonds
- Special (2): Morale Boost, Kamikaze Doctrine

**TIER 3 - Legendary Cards (8 cards):**
- Planet Cracker (destroy 1 planet, one-use)
- Dyson Swarm (double income, permanent)
- Mind Control Array (force bot conflict, 3 uses)
- [5 additional game-changing effects]

**Rationale:** Provides concrete card pool for balance testing and bot decision-making. Cards designed to synergize with research doctrines.

**Source:** `docs/design/CRAFTING-SYSTEM.md` Sections 3-5

**Code:** `src/lib/tech-cards/card-catalog.ts`

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-008: Tech Card Counter-Play System

**Description:** Each card has counters creating rock-paper-scissors dynamics:

**Counter Examples:**
- Shield Arrays counters Shock Troops (research) + Plasma Torpedoes (negates surprise/first-strike)
- Scanner Arrays counters Cloaking Field (reveals hidden units)
- Point Defense counters Plasma Torpedoes (-2 to incoming first-round damage)
- Siege Engines (research) counters Shield Arrays (bypasses AC bonus)

Players can draft cards to counter known opponent strategies (requires intel from research announcements, combat reveals, or espionage).

**Rationale:** Creates strategic drafting decisions beyond "pick strongest card." Rewards intelligence gathering and counter-picking.

**Source:** `docs/design/CRAFTING-SYSTEM.md` Section 2.2, 4

**Code:** `src/lib/tech-cards/counter-system.ts`

**Tests:** TBD

**Status:** Draft - Expansion content only

---

### REQ-TECH-009: Draft Timing & Combat Integration

**Description:** Draft events occur at fixed intervals with combat integration:

**Draft Schedule:**
- Turn 1: T1 hidden objective (draw 3, keep 1)
- Turn 10, 20, 30, 40: T2 tactical cards (draw 3, pick 1, public announcement)
- Turn 50+: T3 legendary cards enter pool (30% chance per draft slot)

**Draft Order:**
- Initiative: d20 + CHA modifier
- Higher roll picks first, repeats each draft event
- Cards removed from pool once drafted (reset next event)

**Combat Integration:**
- Research bonuses + Tech Card bonuses stack multiplicatively
- Example: War Machine (+2 STR) + Plasma Torpedoes (+2 first-round) = 2d8+1 → 2d8+3 → 2d8+5
- Cards activate automatically unless legendary (require manual activation to prevent "save syndrome")

**Rationale:** Predictable timing enables strategic planning. Stacking with research creates powerful synergies. Automatic activation ensures cards get used.

**Source:** `docs/design/CRAFTING-SYSTEM.md` Sections 6, 7

**Code:** `src/lib/tech-cards/draft-engine.ts`, `src/lib/combat/card-integration.ts`

**Tests:** TBD

**Status:** Draft - Expansion content only

---

## 15. The Galactic Syndicate System

**Source Document:** `docs/design/SYNDICATE-SYSTEM.md`

**Design Philosophy:** The Syndicate transforms Nexus Dominion from a pure 4X strategy game into a hidden role game with 4X elements. Players receive secret loyalty assignments (Loyalist or Syndicate) that fundamentally change their objectives and create asymmetric gameplay with betrayal mechanics.

**Status:** Core Game Feature (implement post-Beta-1)

---

### REQ-SYND-001: Hidden Role Assignment

**Description:** At game start, each empire (player + bots) receives a secret Loyalty Card:
- **90% are Loyalist** - Win through standard victory conditions (conquest, economic, research, etc.)
- **10% are Syndicate** - Hidden objective: Complete 3 contracts before Turn 200
- **No one knows** who serves the Syndicate (including you, about others)

**Archetype Weighting:**
- Schemer: 50% chance Syndicate (vs 10% baseline)
- Opportunist: 20% chance Syndicate
- All others: 10% chance Syndicate

**Player Assignment:**
- First playthrough: Always Loyalist (learn base game)
- Subsequent games: Subject to random assignment
- Can opt-in to "Syndicate Mode" for guaranteed assignment

**Rationale:** Hidden roles create paranoia, suspicion, and dramatic betrayal moments. The "Who is the traitor?" mechanic transforms standard diplomacy into social deduction gameplay.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 2)

**Code:** `src/lib/game/services/syndicate-service.ts:assignLoyaltyRoles()`

**Database:** `empires.loyalty_role` column ('loyalist', 'syndicate', 'defector')

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-002: The Revelation Moment

**Description:** At Turn 50 or when first contract is completed, all players see "The Shadow Emerges" announcement revealing that a Syndicate operative exists in the galaxy.

**Effects:**
- Galaxy-wide dramatic announcement
- Accusation system unlocks
- Suspicious Activity Feed becomes visible to Loyalists
- Bot messaging shifts to include suspicion and accusations
- Coalition "Stop the Syndicate" formation increases

**Rationale:** Creates a narrative turning point where the game shifts from standard 4X to paranoid social deduction. Players now question every action and alliance.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 1.3, 12.1)

**Code:** `src/lib/game/services/syndicate-service.ts`, `src/components/game/events/ShadowEmergence.tsx`

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-003: Syndicate Contract System

**Description:** Syndicate players see 3 active contracts at any time across 4 tiers:

**Tier 1: Covert Operations (Trust 0-2)**
- Sabotage Production, Insurgent Aid, Market Manipulation, Pirate Raid
- 1 Syndicate VP each, Low-Medium suspicion, 8,000-20,000 credits

**Tier 2: Strategic Disruption (Trust 3-5)**
- Intelligence Leak, Arms Embargo, False Flag Operation, Economic Warfare
- 1-2 Syndicate VP each, Medium-High suspicion, 25,000-50,000 credits

**Tier 3: High-Risk Operations (Trust 6-7)**
- Coup d'État, Assassination, Kingslayer, Scorched Earth
- 2-3 Syndicate VP each, Very High-Extreme suspicion, 60,000-150,000 credits

**Tier 4: Endgame Contracts (Trust 8)**
- Proxy War, The Equalizer, Shadow Victory
- 2-5 Syndicate VP each, Variable suspicion, 100,000+ credits or special tech

**Contract Visibility:**
- Contracts are **hidden** from other players
- Contract **effects are visible** (but cause is ambiguous)
- Suspicious Activity Feed shows results without attribution

**Rationale:** Provides Syndicate players with alternative progression path while generating observable events that Loyalists can investigate.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 3)

**Code:** `src/lib/game/services/syndicate-service.ts:generateContracts()`, `src/lib/game/constants/syndicate.ts`

**Database:** `syndicate_contracts` table

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-004: Trust Progression System

**Description:** Syndicate players build trust through contracts and purchases to unlock better goods (0-8 levels):

| Level | Points | Title | Access |
|-------|--------|-------|--------|
| 0 | 0 | Unknown | Must complete intro contract |
| 1 | 100 | Associate | Basic intel, components at 2× price |
| 2 | 500 | Runner | Tier 1 contracts, 1.75× prices |
| 3 | 1,500 | Soldier | Tier 2 contracts, 1.5× prices |
| 4 | 3,500 | Captain | Targeted contracts |
| 5 | 7,000 | Lieutenant | Advanced systems at 1.5× |
| 6 | 12,000 | Underboss | Chemical weapons, EMP devices |
| 7 | 20,000 | Consigliere | Nuclear warheads |
| 8 | 35,000 | Syndicate Lord | Bioweapons, exclusive contracts |

**Trust Earning:**
- Contract completion: +10 to +200 trust (tier-dependent)
- Black Market purchases: +5 trust per 10,000 credits spent
- Recruitment bonus (bottom 50% empires): Double trust for first contract

**Trust Decay:**
- No interaction for 10 turns: -5% trust decay per turn
- Failed contract: -50% of reward trust, drop 1 level
- Betrayal to Coordinator: Reset to 0, permanent ban
- Being "outed" via accusation: -25% trust

**Rationale:** Creates progression system for Syndicate players similar to standard tech/economy progression for Loyalists. Trust gates access to WMDs and high-impact contracts.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 4)

**Code:** `src/lib/game/services/syndicate-service.ts:increaseTrust()`, `src/lib/game/constants/syndicate.ts`

**Database:** `empires.syndicate_trust_level`, `empires.syndicate_trust_points`

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-005: Black Market System

**Description:** Only Syndicate players can access the Black Market for restricted goods:

**Components (Trust 1+):**
- Electronics, Armor Plating, Propulsion Units (2.0× base price)
- Targeting Arrays, Stealth Composites (1.75× base price)
- Quantum Processors (1.5× base price)

**Advanced Systems (Trust 5+):**
- Reactor Cores, Shield Generators, Cloaking Devices, Warp Drives
- 1.25×-1.5× base price

**Restricted Weapons (Trust 6+) - Single-use WMDs:**
- EMP Device (50,000 cr, Trust 6): Disable defenses for 3 turns
- Chemical Weapon (75,000 cr, Trust 6): Kill 25% population
- Nuclear Warhead (100,000 cr, Trust 7): Destroy 50% production
- Bioweapon Canister (150,000 cr, Trust 8): Kill 75% population

**Intelligence Services (Trust 2+):**
- Spy Report (5,000 cr): Reveal resources/military
- Tech Espionage (15,000 cr): Reveal research progress
- Diplomatic Intel (10,000 cr): Reveal treaties/alliances
- Future Intel (25,000 cr): See planned actions next turn

**Rationale:** Provides Syndicate-exclusive power spike options that risk high suspicion. WMDs create dramatic moments and give struggling players comeback potential.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 5)

**Code:** `src/components/game/syndicate/BlackMarketPanel.tsx`, `src/lib/game/services/syndicate-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-006: Suspicion System

**Description:** Each contract generates suspicion based on visibility and impact:

**Suspicion Levels:**
- Low (10-20): Minor disruptions, hard to attribute
- Medium (30-50): Noticeable events, moderate attribution
- High (60-80): Obvious interference, easy to suspect
- Extreme (90-100): WMD use, instant reveal risk

**Suspicion Score Calculation:**
```
Suspicion Score = Σ(Contract Suspicion) × Investigation Modifier
```

**High Suspicion (>75) triggers:**
- More bot accusations
- Coalition formation against suspect
- Coordinator automatic monitoring
- Higher accusation trial success rate

**Reducing Suspicion:**
- Complete "clean" turns (no contracts for 5 turns): -10 suspicion
- Form alliances: -5 suspicion per active treaty
- Win battles legitimately: -15 suspicion
- Public charity (donate resources): -20 suspicion

**Rationale:** Creates risk/reward balance for Syndicate players. High-impact contracts generate high suspicion. Staying hidden requires mixing contracts with legitimate play.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 3.3)

**Code:** `src/lib/game/services/syndicate-service.ts:increaseSuspicion()`

**Database:** `empires.suspicion_score`, `suspicious_events` table

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-007: Accusation System

**Description:** After Turn 50 (or "Shadow Emerges" event), any empire can accuse another of Syndicate allegiance:

**Process:**
1. Accuser spends 25 Intel Points to accuse specific empire
2. Public announcement to all empires: "X accuses Y of Syndicate allegiance"
3. Accused can defend (spend 10,000 credits for defense statement)
4. Voting period - All other empires vote Guilty/Innocent (3 turns)
5. Resolution - Majority vote determines outcome

**Resolution Outcomes:**

**If GUILTY + Target is SYNDICATE:**
- Accuser: +5,000 credits, +10 Coordinator standing
- Target: "Outed" (loses hidden status), -25% Syndicate trust
- Target gains "Desperate" status: +20% combat, -20% income, alliances dissolved

**If GUILTY + Target is LOYALIST (False Accusation):**
- Accuser: -10,000 credits, -20 Coordinator standing
- Target: +15,000 credits (sympathy), +2 all diplomatic relations

**If INNOCENT:**
- No penalties, suspicion score remains, lingering doubt

**Rationale:** Creates high-stakes social deduction mechanics. False accusations have severe penalties to prevent spam. Outed Syndicate players can still win but lose stealth advantage.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 6)

**Code:** `src/lib/game/services/syndicate-service.ts:createAccusation()`, `src/components/game/syndicate/AccusationTrial.tsx`

**Database:** `accusations` table, `accusation_votes` table

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-008: The Coordinator (NPC Faction)

**Description:** The Coordinator is the galactic authority that opposes the Syndicate:

**Services:**
- Intel Validation (15 Intel Points + 5,000 credits): Confirm or deny suspicions
- Protection: +10% funding bonus if you report Syndicate player
- Whistleblower Rewards: Betraying Syndicate pays well

**Loyalist Reporting:**
If target is SYNDICATE:
- Receive target's next contract (preview)
- Gain +10% permanent funding bonus
- Coordinator standing +50

If target is LOYALIST:
- Report leaked to target (diplomatic damage)
- Lose 10,000 credits
- Coordinator standing -25

**Syndicate Betrayal (Permanent):**
A Syndicate player can betray the Syndicate:
- Benefits: +25,000 credits, +25% permanent funding bonus
- Consequences: Syndicate becomes hostile, random assassination attempts (5% per turn), cannot re-engage

**Rationale:** Provides investigation tools for Loyalists and creates betrayal temptation for Syndicate players. Coordinator acts as counterbalance to Syndicate power.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 7)

**Code:** `src/lib/game/services/syndicate-service.ts:reportToCoordinator()`, `src/components/game/syndicate/CoordinatorInterface.tsx`

**Database:** `coordinator_reports` table

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-009: Syndicate Victory Conditions

**Description:** Syndicate players have asymmetric victory conditions separate from standard victories:

**Condition 1: Contract Mastery**
- Complete 3 Syndicate contracts before Turn 200
- Any combination of tiers allowed
- Victory Type: "Shadow Victory" if hidden, "Defiant Victory" if outed

**Condition 2: Chaos Victory**
- If no standard victory achieved by Turn 200
- AND Syndicate player has 2+ contracts completed
- "The galaxy descends into chaos. The Syndicate wins."

**Condition 3: The Perfect Game**
- Complete 3 contracts while remaining undetected
- Never accused, never outed
- Bonus: "Shadow Master" achievement

**Victory Screen:**
- Reveals Syndicate operative identity
- Shows completed contracts with timestamps
- Displays suspicion score and false accusations survived
- Shows final Syndicate trust level and credits earned

**Rationale:** Creates alternative win condition that doesn't require territory or economic dominance. Syndicate can win from behind, providing comeback mechanics and dramatic reveals.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 9)

**Code:** `src/lib/game/services/syndicate-service.ts:checkSyndicateVictory()`, `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-010: Bot Syndicate Integration

**Description:** Bots integrate with Syndicate system through archetype-specific behavior:

**Syndicate Bot Behavior:**
- Complete low-suspicion contracts first
- Target rivals (highest networth enemies)
- Use WMDs only when desperate or for Kingslayer contract
- Attempt to stay hidden until 2/3 contracts complete

**Loyalist Bot Behavior:**
- Accusation Patterns:
  - Diplomat bots: High accusation rate (paranoid)
  - Warlord bots: Only accuse if high suspicion
  - Turtle bots: Never accuse (too defensive)
  - Schemer bots (Loyalist): Frequently accused but rarely accuse

- Coalition Formation:
  - "Stop the Syndicate" coalitions form after Turn 75
  - Bots share suspicions in coalition chat
  - Coordinate accusations via voting

**The Schemer Paradox:**
- 50% of Schemer bots are Syndicate (high risk)
- 50% of Schemer bots are Loyalist (false positives)
- Players never know which, creating permanent suspicion

**Message Templates:**
- 70+ new message templates for Syndicate-related events
- Suspicion accusations, contract hints, coalition coordination
- Post-outing reactions, victory/defeat acknowledgment

**Rationale:** Integrates Syndicate mechanics into existing bot AI system. Scheming bots create natural paranoia. Bot accusations and suspicions make solo play feel dynamic.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 8)

**Code:** `src/lib/bots/syndicate-ai.ts`, `src/lib/bots/messaging.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-011: Intel Point Economy

**Description:** Loyalist players earn Intel Points for investigation and accusation:

**Earning Intel Points:**
- Earn 5 points per turn (max 50 stored)
- Bonus points from Coordinator rewards

**Spending Intel Points:**
- Investigation (10 points): Research target's activities
- Accusation (25 points): Formally accuse empire of being Syndicate
- Coordinator Report (15 points): Request intel validation

**Rationale:** Creates economy around investigation to prevent accusation spam. Players must choose between investigating multiple suspects or making formal accusations.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 2.3)

**Code:** `src/lib/game/services/syndicate-service.ts`, `src/lib/game/services/core/turn-processor.ts`

**Database:** `empires.intel_points`

**Tests:** TBD

**Status:** Draft

---

### REQ-SYND-012: Suspicious Activity Feed

**Description:** Loyalist players see a feed of unexplained events in the galaxy:

**Event Types:**
- Production drops without explanation
- Market price anomalies
- Convenient "accidents" affecting empires
- Black Market activity (when detected)
- Unexplained attacks or disruptions

**Event Data:**
- Turn number
- Affected empire
- Event description
- Suspicion increase (if investigation conducted)
- Related empire (if attributable)

**Investigation:**
- Spend Intel Points to investigate specific events
- Reveals potential source empire
- Increases suspicion score of suspect

**Rationale:** Provides information to Loyalists without explicitly revealing Syndicate contracts. Creates detective gameplay where players piece together clues.

**Source:** `docs/design/SYNDICATE-SYSTEM.md` (Section 2.3, 10.1)

**Code:** `src/components/game/syndicate/SuspiciousActivityFeed.tsx`, `src/lib/game/services/syndicate-service.ts`

**Database:** `suspicious_events` table

**Tests:** TBD

**Status:** Draft

---

## Appendix A: Requirement Summary

| Section | System | Reqs Defined | Reqs Validated |
|---------|--------|--------------|----------------|
| 1 | Game Overview | 3 | 1 |
| 2 | Turn Processing | 3 | 0 |
| 3 | Combat | 8 | 0 |
| 4 | Resources | 3 | 0 |
| 5 | Sectors | 3 | 0 |
| 6 | Military | 2 | 0 |
| 6.8 | Covert | 1 | 0 |
| 7 | Bot AI | 10 | 0 |
| 8 | Diplomacy | 2 | 0 |
| 9 | Market | 1 | 0 |
| 10 | Research | 1 | 0 |
| 11 | Progressive | 3 | 0 |
| 12 | Victory | 6 | 0 |
| 13 | Frontend | 13 | 2 |
| 14 | Tech Wars (Expansion) | 6 | 0 |
| 15 | Syndicate | 1 | 0 |
| **Total** | | **66** | **3** |

---

## Appendix B: Validation Checklist

For each requirement to be marked "Validated":

- [ ] Code location verified (file:line exists)
- [ ] Test exists that explicitly validates the requirement
- [ ] Test has `@spec REQ-XXX-XXX` annotation
- [ ] Test passes
- [ ] Code behavior matches requirement description

### Test Annotation Convention

Tests that validate requirements MUST include a `@spec` comment:

```typescript
describe("Turn Processing", () => {
  // @spec REQ-TURN-001 - validates 6-phase execution order
  it("executes phases in correct order: income, population, civil, market, bots, actions", () => {
    // test implementation
  });
});
```

### Finding Orphaned Requirements

Run this command to find requirements without tests:

```bash
# Extract all REQ-* IDs from PRD
grep -oE "REQ-[A-Z]+-[0-9]+" docs/PRD.md | sort -u > /tmp/reqs.txt

# Extract all @spec REQ-* from tests
grep -r "@spec REQ-" src/ --include="*.test.ts" | grep -oE "REQ-[A-Z]+-[0-9]+" | sort -u > /tmp/tested.txt

# Show requirements without tests
comm -23 /tmp/reqs.txt /tmp/tested.txt
```

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-12 | 1.4 | **FRONTEND CONSOLIDATION:** Section 13 completely revised for FRONTEND-DESIGN.md consolidation. Updated REQ-UI-001 to Boardgame + LCARS Aesthetic. Replaced REQ-UI-002/003 with Star Map Hub navigation architecture. Added 10 new requirements: REQ-UI-002 (Star Map as Hub), REQ-UI-003 (Overlay Panel System), REQ-UI-004 (Card + Details Sidebar), REQ-UI-005 (Collapsible Phase Indicator), REQ-UI-006 (Actionable Guidance), REQ-UI-007 (Strategic Visual Language), REQ-UI-010 (CSS + GSAP Hybrid), REQ-UI-011 (D3.js Star Map), REQ-UI-012 (Keyboard Navigation), REQ-UI-013 (WCAG AA Contrast). Renumbered existing REQ-UI-002/003 to REQ-UI-008/009. Total: 56→66 requirements. |
| 2026-01-12 | 1.3 | **SYNDICATE SYSTEM INTEGRATION:** Section 15 completely revised from single expansion requirement to full core game system. Added 11 new requirements: REQ-SYND-001 (Hidden Roles), REQ-SYND-002 (Revelation Moment), REQ-SYND-003 (Contract System), REQ-SYND-004 (Trust Progression), REQ-SYND-005 (Black Market), REQ-SYND-006 (Suspicion), REQ-SYND-007 (Accusations), REQ-SYND-008 (Coordinator), REQ-SYND-009 (Victory Conditions), REQ-SYND-010 (Bot Integration), REQ-SYND-011 (Intel Economy), REQ-SYND-012 (Activity Feed). Syndicate now marked as Core Game Feature (post-Beta-1). Source updated to `docs/design/SYNDICATE-SYSTEM.md`. Total: 56→67 requirements. |
| 2026-01-11 | 1.2 | **BOT SYSTEM EXPANSION:** Section 7 completely revised for BOT-SYSTEM.md alignment. Fixed REQ-BOT-003 emotional states (now: Confident, Arrogant, Desperate, Vengeful, Fearful, Triumphant per narrative analysis). Expanded REQ-BOT-001, REQ-BOT-002, REQ-BOT-004, REQ-BOT-005 with implementation details. Added 5 new requirements: REQ-BOT-006 (LLM Integration), REQ-BOT-007 (Decision Audit), REQ-BOT-008 (Coalition AI), REQ-BOT-009 (Telegraphing), REQ-BOT-010 (Endgame Behavior). Total: 51→56 requirements. |
| 2026-01-11 | 1.1 | **CRITICAL FIX:** Section 14 updated to Tech Card draft system (CRAFTING-EXPANSION-CONCEPT.md). Removed incorrect 4-tier crafting reference. Added REQ-TECH-001 through REQ-TECH-006 (6 new requirements). Total: 51 requirements. |
| 2026-01-11 | 1.0 | Initial PRD structure with 46 requirements |
