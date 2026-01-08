Visionary Recommendations (Post-Alpha)

### 3.1 Event Sourcing for Turn History

**Current**: Turn processor mutates database state directly.

**Vision**: Implement event sourcing pattern for turn actions:
```typescript
// Events are immutable records
type TurnEvent =
  | { type: 'INCOME_COLLECTED'; empireId: string; amount: number }
  | { type: 'POPULATION_GREW'; empireId: string; delta: number }
  | { type: 'BATTLE_RESOLVED'; attackId: string; outcome: CombatOutcome }
  | ...

// Current state is derived from replaying events
function replayTurn(events: TurnEvent[]): GameState
```

**Benefits**:
- Full game replay capability
- Debugging time-travel
- Analytics on player/bot behavior
- Spectator mode for multiplayer future

### 3.2 CQRS for Read/Write Separation

**Current**: Same database tables for reads and writes.

**Vision**: Implement Command Query Responsibility Segregation:
- Write side: Normalized schema (current)
- Read side: Denormalized views optimized for dashboards

**Benefits**:
- 10x faster dashboard loads
- Reduced database contention
- Enables read replicas

### 3.3 Plugin Architecture for Game Modes

**Current**: Game mode configuration is baked into core code.

**Vision**: Create plugin system for game modes:
```typescript
interface GameModePlugin {
  name: string;
  validateConfig(config: GameConfig): Result<void, string>;
  modifyTurnProcessor(processor: TurnProcessor): TurnProcessor;
  customVictoryConditions(): VictoryCondition[];
  customEvents(): GalacticEvent[];
}
```

**Benefits**:
- Community-created game modes
- Easier experimentation
- Cleaner core codebase

### 3.4 WebSocket for Real-Time Updates

**Current**: Client polls for updates.

**Vision**: Implement WebSocket push for turn resolution:
```typescript
// Server pushes turn events as they happen
socket.emit('turn:phase', { phase: 'income', progress: 0.25 });
socket.emit('empire:update', { empireId, credits: 150000 });
socket.emit('battle:resolved', battleReport);
```

**Benefits**:
- Real-time turn animation
- Foundation for multiplayer
- Reduced server load vs polling


Visionary Recommendations (Post-Alpha)

### 3.1 "Living Galaxy" Marketing Campaign

**Unique Selling Point**: Bots remember, adapt, and hold grudges.

**Campaign Concept**:
- Tagline: "Every decision echoes across the galaxy"
- Highlight: Bot memory system tracks player betrayals
- Showcase: Emotional state evolution over 200 turns
- Demo: Time-lapse of bot relationships changing

**Assets Needed**:
- 30-second teaser showing bot personality messages
- Screenshot gallery of diplomatic interactions
- Developer diary on AI personality system

### 3.2 Personality-First Bot Introduction

**Concept**: Before game starts, show 3-5 "key rivals" with story hooks:
```
"Kira Vex, the Iron Matriarch, controls the northern sectors.
She remembers the last empire that crossed her borders.
They don't exist anymore."
```

**Benefit**: Creates narrative investment before first turn.

### 3.3 Story Mode (Post-Beta)

**Concept**: Chain of scenarios with persistent bot relationships:
- Campaign 1: "The Newcomer" - Start weak, build reputation
- Campaign 2: "The Betrayal" - Old ally turns enemy
- Campaign 3: "The Dominion" - Final conquest

**Benefit**: Structured narrative for players who want guided experience.

### 3.4 Steam Next Fest Participation

**Timeline**: Target next Steam Next Fest (quarterly events)

**Demo Scope**:
- 50 turns, 10 bots
- Leaderboard for highest networth
- "Wishlist to continue your empire" CTA

**Preparation**:
- Steam page assets (capsule images, screenshots)
- Demo build with analytics
- Discord community setup

### 3.5 Content Creator Kit

**Problem**: Streamers need dramatic moments.

**Solution**: Provide highlight detection:
- Auto-bookmark "near-defeat recoveries"
- Flag betrayal moments for replay
- Export battle animations as GIFs

Visionary Recommendations (Post-Alpha)

### 3.1 Implement Visual Regression Testing

**Tool**: Percy or Chromatic integration
**Scope**: Starmap visualization, battle reports, resource panels
**Benefit**: Catch unintended UI changes in force-directed graphs

### 3.2 Add Contract Testing for Bot API

**Tool**: Pact or similar
**Scope**: LLM bot decision interface (`BotDecision` type)
**Benefit**: Ensure bot response formats don't break game engine

### 3.3 Implement Chaos Testing for Turn Processing

**Approach**: Inject random failures during `turn-processor.ts` execution
**Benefit**: Verify save-service recovery and state consistency

### 3.4 Add Performance Benchmarking

**Tool**: Lighthouse CI or custom metrics
**Targets**:
- Turn processing < 2 seconds for 100 bots
- Page load < 3 seconds
- Starmap render < 1 second

### 3.5 Implement Test Coverage Badge

**Tool**: Codecov or similar
**Action**: Display coverage in README.md
**Benefit**: Transparency and contributor motivation