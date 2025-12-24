# Pass 5: Project Manager Synthesis

**Date:** December 23, 2024
**Agent:** project-manager
**Agent ID:** a023fe1

# X-Imperium Weekend MVP Sprint Plan
## Project Management Synthesis Document

**Version:** 1.0
**Date:** 2025-12-23
**Target:** Playable v0.5 MVP by End of Weekend
**Status:** CRITICAL PATH PLANNING

---

## EXECUTIVE SUMMARY

### Critical Decision: Technology Foundation
**RULING:** Pure greenfield Next.js/TypeScript implementation. Existing PHP codebase treated as **reference documentation only**.

**Rationale:**
- PRD explicitly specifies Next.js/TypeScript stack
- PHP codebase architecture incompatible with modern real-time requirements
- Turn processing bottleneck (48s) unsolvable in PHP without complete rewrite
- Weekend timeline requires rapid iteration with modern tooling

### Critical Scope Decisions

| Feature | v0.5 (Weekend) | v0.6 (Sprint 2) | v0.7+ (Backlog) |
|---------|---------------|-----------------|-----------------|
| Tech Stack | Next.js/Drizzle/Zustand | <- Same | <- Same |
| Turn Processing | Sequential, rule-based bots | Parallel processing | LLM bots |
| Bot Personalities | 3 archetypes, template messages | 6 archetypes, 100+ templates | Full LLM personalities |
| Combat System | Core 6 units + stations | Balance pass + diversity | Advanced tactics |
| Diplomacy | **CUT** | Basic treaties | Coalitions |
| Save/Load | **IN** (critical) | Cloud sync | Multiple saves |
| Multiplayer | **CUT** | Async turns | Real-time |
| Victory Conditions | 3 types (Conquest/Economic/Military) | 6 types | Dynamic |

---

## PHASE 1: CRITICAL BLOCKERS (RESOLVE BEFORE CODING)

### 1.1 Technology Stack Finalization
**Status:** RESOLVED

```typescript
// Final Stack Decision
{
  framework: "Next.js 14 (App Router)",
  database: "PostgreSQL + Drizzle ORM",
  state: "Zustand + React Query",
  ui: "Tailwind CSS + shadcn/ui",
  visualization: "react-konva (starmap)",
  auth: "NextAuth.js (v0.6+)",
  deployment: {
    frontend: "Vercel",
    backend: "Vercel Serverless Functions",
    database: "Vercel Postgres" // Free tier: 256MB, upgrade path clear
  },
  testing: {
    unit: "Vitest",
    e2e: "Playwright" // v0.6+
  }
}
```

### 1.2 Data Model Finalization
**Status:** CRITICAL - Must complete Day 1 Morning

**Missing Schema Elements:**
```sql
-- CRITICAL ADDITIONS TO SCHEMA

-- Save/Load System
CREATE TABLE game_saves (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_state JSONB NOT NULL,
  turn_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  save_name VARCHAR(100)
);

-- Turn Processing State
CREATE TABLE turn_queue (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  turn_number INTEGER NOT NULL,
  processing_status ENUM('pending', 'processing', 'completed', 'failed'),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Bot Decision Cache (performance optimization)
CREATE TABLE bot_decisions (
  id UUID PRIMARY KEY,
  game_id UUID,
  empire_id UUID,
  turn_number INTEGER,
  decision_type VARCHAR(50),
  decision_data JSONB,
  execution_time_ms INTEGER
);

-- Combat Resolution Log
CREATE TABLE combat_logs (
  id UUID PRIMARY KEY,
  game_id UUID,
  turn_number INTEGER,
  attacker_id UUID,
  defender_id UUID,
  battle_type VARCHAR(50),
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 Turn Processing Budget
**Status:** CRITICAL - Architecture Decision Required

**Problem:** 24 bots x 2s = 48s unacceptable
**Solution:** Rule-based bots v0.5, parallel processing v0.6+

**v0.5 Target:** <500ms total turn processing

```typescript
// Turn Processing Architecture v0.5
interface TurnProcessingPipeline {
  // Phase 1: Pre-computation (parallelizable)
  gatherIntelligence(): void;        // 50ms per bot
  calculateThreats(): void;          // 30ms per bot
  evaluateOpportunities(): void;     // 40ms per bot

  // Phase 2: Decision (sequential, deterministic)
  executeBotDecisions(): void;       // 10ms per bot x 24 = 240ms

  // Phase 3: Resolution (batch processing)
  resolveCombat(): void;             // 100ms all battles
  updateEconomies(): void;           // 50ms all empires
  processEvents(): void;             // 20ms

  // Total: ~460ms target
}
```

### 1.4 Combat Balance Patch
**Status:** HIGH PRIORITY - Day 1 Afternoon

**Immediate Fixes:**
```typescript
// combat-constants.ts
export const UNIT_STATS = {
  soldiers: { attack: 1, defense: 1, cost: 50 },
  fighters: { attack: 3, defense: 2, cost: 200 },
  lightCruisers: { attack: 5, defense: 4, cost: 500 },
  heavyCruisers: { attack: 8, defense: 6, cost: 1000 },
  carriers: { attack: 12, defense: 10, cost: 2500 }, // NERFED from 20x
  stations: { attack: 50, defense: 50, cost: 5000 }  // NERFED from 100x
};

export const COMBAT_MODIFIERS = {
  diversityBonus: 0.15,      // NEW: +15% if 4+ unit types
  stationDefenseBonus: 2.0,  // Stations 2x effective on defense
  fleetSizeScaling: 0.95     // Diminishing returns on large fleets
};
```

---

## PHASE 2: WEEKEND MVP SPRINT (v0.5)

### Success Criteria
**A working game means:**
- Player can create empire, see starmap
- Player can build units, manage planets
- Player can attack bot empires
- 3 bot archetypes make coherent decisions
- Turn processing completes <1 second
- Victory/defeat conditions trigger correctly
- Game state persists (save/load)

**Explicitly Stubbed:**
- LLM personalities (template messages only)
- Advanced diplomacy (just war/peace)
- Multiplayer
- Complex events (just 3 basic types)
- Detailed analytics

**Explicitly Cut:**
- Coalitions
- Trading (global market only)
- Covert operations beyond basic spying
- Nuclear warfare (v0.6+)

---

## DAY 1: FOUNDATION (8 Hours)

### Morning Session (4h): Core Infrastructure

#### Task 1.1: Project Scaffolding (45min)
```bash
# Project Manager executes:
npx create-t3-app@latest x-imperium \
  --nextjs \
  --tailwind \
  --trpc \
  --skip-prisma

cd x-imperium
npm install drizzle-orm postgres
npm install zustand @tanstack/react-query
npm install react-konva konva
```

**Deliverable:** Clean build with routing structure:
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (game)/
│   ├── dashboard/
│   ├── starmap/
│   ├── planets/
│   ├── military/
│   └── research/
└── api/
    └── trpc/
```

#### Task 1.2: Database Schema Implementation (90min)
```bash
# Database migration setup
drizzle-kit init
drizzle-kit generate:pg
drizzle-kit push:pg
```

**Schema Priority:**
1. Users + Empire tables (30min)
2. Game state tables (30min)
3. Combat/Turn processing tables (30min)

**Deliverable:** `db/schema.ts` with all tables, seeded with test data

#### Task 1.3: State Management Setup (45min)
```typescript
// stores/game-store.ts
export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  playerEmpire: null,
  visibleSector: { x: 0, y: 0, radius: 10 },
  selectedPlanet: null,

  actions: {
    loadGame: async (gameId) => { /* ... */ },
    executeTurn: async () => { /* ... */ },
    selectPlanet: (planetId) => { /* ... */ }
  }
}));
```

**Deliverable:** Working stores for game state, UI state, combat state

#### Task 1.4: Combat System Core (60min)
```typescript
// lib/combat/resolver.ts
export function resolveBattle(
  attacker: Fleet,
  defender: Fleet,
  context: BattleContext
): BattleResult {
  // Implement core combat math
  // Apply balance changes from 1.4
  // Return detailed results
}
```

**Deliverable:** Unit tests passing for all combat scenarios

### Afternoon Session (4h): Game Loop Foundations

#### Task 1.5: Starmap Renderer (90min)
```typescript
// components/starmap/StarMapCanvas.tsx
export function StarMapCanvas() {
  return (
    <Stage width={1200} height={800}>
      <Layer>
        {sectors.map(sector => (
          <SectorNode key={sector.id} {...sector} />
        ))}
        {empires.map(empire => (
          <EmpireTerritory key={empire.id} {...empire} />
        ))}
      </Layer>
    </Stage>
  );
}
```

**Deliverable:** Zoomable starmap showing 100 sectors, planet ownership

#### Task 1.6: Planet Management UI (90min)
**Components:**
- PlanetOverview (resource production)
- BuildQueue (unit construction)
- PlanetUpgrades (infrastructure)

**Deliverable:** Functional build interface for all 6 unit types

#### Task 1.7: Turn Processing Skeleton (60min)
```typescript
// lib/turn-engine/processor.ts
export async function processTurn(gameId: string) {
  const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });

  // Phase 1: Economic updates
  await updateProduction(game);

  // Phase 2: Bot decisions (STUB: random for now)
  await executeBotActions(game);

  // Phase 3: Combat resolution
  await resolveCombat(game);

  // Phase 4: Victory check
  await checkVictoryConditions(game);

  await incrementTurn(game);
}
```

**Deliverable:** Turn advances, resources update, basic bot movement

---

## DAY 2: CORE GAME LOOP (8 Hours)

### Morning Session (4h): Bot Intelligence

#### Task 2.1: Bot Archetype Decision Trees (120min)
```typescript
// lib/bots/archetypes/warlord.ts
export class WarlordBot implements BotStrategy {
  async executeTurn(empire: Empire, gameState: GameState): Promise<BotActions> {
    const decisions: BotActions = {
      production: this.planProduction(empire),
      military: this.planAttacks(empire, gameState),
      diplomacy: this.updateStances(empire, gameState)
    };

    return decisions;
  }

  private planProduction(empire: Empire): ProductionPlan {
    // 70% military, 20% research, 10% infrastructure
    return {
      fighters: Math.floor(empire.production * 0.3),
      carriers: Math.floor(empire.production * 0.4),
      stations: Math.floor(empire.production * 0.2)
    };
  }

  private planAttacks(empire: Empire, gameState: GameState): Attack[] {
    // Find weakest adjacent enemy
    const targets = this.findVulnerableTargets(empire, gameState);
    return this.selectBestAttack(targets);
  }
}
```

**Deliverable:** 3 working bot archetypes (Warlord, Economist, Diplomat)

#### Task 2.2: Bot Message Templates (60min)
```typescript
// data/bot-messages.ts
export const BOT_MESSAGES = {
  warlord: {
    greeting: [
      "Your empire borders mine. I suggest you fortify your defenses.",
      "Strength respects strength. Show me yours.",
      "I've crushed 7 empires. Don't be the 8th."
    ],
    attack: [
      "Your weakness invited this attack.",
      "Consider this a lesson in military superiority.",
      "I take what I want. Today, I want your sector."
    ],
    victory: [
      "Your empire is dust. As it should be.",
      "Conquest complete. Who's next?"
    ]
  },
  // ... economist, diplomat templates
};
```

**Deliverable:** 50+ messages across 3 archetypes, 5 categories each

#### Task 2.3: Save/Load System (60min)
```typescript
// lib/save-system/serializer.ts
export async function saveGame(gameId: string, saveName?: string) {
  const gameState = await captureFullGameState(gameId);

  await db.insert(gameSaves).values({
    id: crypto.randomUUID(),
    userId: gameState.playerId,
    gameState: JSON.stringify(gameState),
    turnNumber: gameState.currentTurn,
    saveName: saveName || `Turn ${gameState.currentTurn}`
  });
}

export async function loadGame(saveId: string) {
  const save = await db.query.gameSaves.findFirst({ where: eq(gameSaves.id, saveId) });
  return restoreGameState(JSON.parse(save.gameState));
}
```

**Deliverable:** Auto-save every turn, manual save/load working

### Afternoon Session (4h): Combat & Victory

#### Task 2.4: Combat UI & Visualization (90min)
```typescript
// components/combat/BattleReport.tsx
export function BattleReport({ battle }: { battle: BattleResult }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <BattleHeader attacker={battle.attacker} defender={battle.defender} />
      <CombatPhases phases={battle.combatLog} />
      <CasualtyReport losses={battle.losses} />
      <VictoryAnnouncement winner={battle.winner} />
    </motion.div>
  );
}
```

**Deliverable:** Animated combat reports showing phase-by-phase results

#### Task 2.5: Victory Condition System (60min)
```typescript
// lib/victory/conditions.ts
export const VICTORY_CONDITIONS = {
  conquest: (game: GameState) => {
    const playerSectors = countPlayerSectors(game);
    return playerSectors >= game.totalSectors * 0.6; // 60% control
  },

  economic: (game: GameState) => {
    return game.playerEmpire.credits >= 1_000_000;
  },

  military: (game: GameState) => {
    const totalMilitary = calculateMilitaryPower(game.playerEmpire);
    const enemyMilitary = calculateTotalEnemyPower(game);
    return totalMilitary >= enemyMilitary * 3; // 3x stronger than all enemies
  }
};
```

**Deliverable:** 3 victory types working with celebration screens

#### Task 2.6: Event System (60min)
```typescript
// lib/events/generator.ts
export function generateRandomEvent(game: GameState): GameEvent | null {
  const roll = Math.random();

  if (roll < 0.05) { // 5% chance per turn
    return {
      type: 'pirate_raid',
      target: selectWeakPlanet(game),
      severity: Math.random() < 0.3 ? 'major' : 'minor'
    };
  }

  if (roll < 0.08) { // 3% chance
    return {
      type: 'resource_discovery',
      planet: selectRandomPlanet(game),
      resourceType: randomChoice(['ore', 'petro', 'research'])
    };
  }

  return null;
}
```

**Deliverable:** 3 event types (pirate raid, resource discovery, diplomatic incident)

#### Task 2.7: New Player Experience (30min)
```typescript
// lib/tutorial/onboarding.ts
export const TUTORIAL_STEPS = [
  {
    turn: 1,
    overlay: "WelcomeOverlay",
    message: "Welcome, Emperor! You control 5 planets in the galactic core.",
    action: "View your empire on the starmap",
    highlight: "starmap-button"
  },
  {
    turn: 1,
    overlay: "FirstPlanetOverlay",
    message: "This is your homeworld. Build your first military units.",
    action: "Build 10 Fighters",
    highlight: "planet-build-queue"
  },
  {
    turn: 2,
    trigger: "bot_message",
    message: "A pirate warlord has appeared! Defend your empire.",
    action: "Prepare for combat",
    highlight: "military-overview"
  }
];
```

**Deliverable:** First 3 turns scripted with tutorial overlays

---

## DAY 3: POLISH & INTEGRATION (8 Hours)

### Morning Session (4h): Bug Fixes & Performance

#### Task 3.1: Turn Processing Optimization (90min)
**Focus Areas:**
- Database query optimization (N+1 prevention)
- Bot decision caching
- Combat batch processing

**Target:** <500ms turn processing confirmed

#### Task 3.2: UI/UX Polish (90min)
**Deliverables:**
- Loading states for all async operations
- Error boundaries with recovery
- Toast notifications for events
- Responsive layout (1920x1080 primary target)

#### Task 3.3: Bug Triage & Fixes (60min)
**Critical Path:**
1. Combat resolution edge cases
2. Save/load state corruption
3. Bot decision deadlocks
4. Victory condition false positives

### Afternoon Session (4h): Testing & Deployment

#### Task 3.4: End-to-End Testing (90min)
```typescript
// e2e/game-flow.spec.ts
test('Complete game flow: creation to victory', async ({ page }) => {
  await page.goto('/');

  // Create new game
  await page.click('text=New Game');
  await page.fill('[name=empireName]', 'Test Empire');
  await page.click('text=Start Game');

  // Play 10 turns
  for (let turn = 1; turn <= 10; turn++) {
    await page.click('text=Next Turn');
    await page.waitForSelector(`text=Turn ${turn + 1}`);
  }

  // Verify game state persisted
  await page.reload();
  await expect(page.locator('text=Turn 11')).toBeVisible();
});
```

**Deliverable:** 5 critical path tests passing

#### Task 3.5: Deployment Pipeline (60min)
```bash
# Vercel deployment
vercel --prod

# Database migration
npm run db:push

# Seed production data
npm run db:seed:prod
```

**Deliverable:** Live URL with working game

#### Task 3.6: Documentation (60min)
**Required Docs:**
- README.md (setup instructions)
- GAMEPLAY.md (rules reference)
- ARCHITECTURE.md (code structure)
- CHANGELOG.md (v0.5 release notes)

#### Task 3.7: Final Playtest (30min)
**Test Scenarios:**
1. Complete game start to finish (30 turns)
2. All 3 bot archetypes encountered
3. All 3 victory conditions tested
4. Save/load mid-game
5. Combat with all unit types

---

## RISK REGISTER

### Critical Risks (P1)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Turn processing >1s** | 40% | CRITICAL | Pre-optimize queries, cache bot decisions, parallel processing ready for v0.6 |
| **Combat balance broken** | 60% | HIGH | Extensive unit testing, balance spreadsheet validation, quick patch ready |
| **Save/load corruption** | 30% | CRITICAL | Comprehensive serialization tests, backup auto-save system |
| **Scope creep** | 70% | HIGH | **HARD CUTOFF:** No features added after Day 2 noon |
| **Database bottleneck** | 25% | HIGH | Vercel Postgres monitoring, upgrade path to Railway ready |

### High Risks (P2)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Bot decision quality poor** | 50% | MEDIUM | Accept simple but coherent decisions v0.5, improve in v0.6 |
| **Starmap performance issues** | 40% | MEDIUM | Viewport culling, lazy loading, canvas optimization |
| **Victory conditions unbalanced** | 60% | MEDIUM | Playtest data collection, easy parameter tuning |
| **UI/UX unclear** | 45% | MEDIUM | Tutorial system required, tooltips everywhere |

### Medium Risks (P3)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Deployment issues** | 30% | LOW | Vercel staging environment, rollback plan |
| **Message templates repetitive** | 70% | LOW | Accept for v0.5, expand in v0.6 with LLM |
| **Event system dull** | 50% | LOW | 3 events enough for MVP, more in v0.6 |

---

## POST-WEEKEND: v0.6 PLANNING (Next Sprint)

### Week 2 Priorities

#### Infrastructure (Week 2, Days 1-2)
- Parallel turn processing (target: <200ms)
- Redis caching layer
- Background job queue (BullMQ)
- Advanced error tracking (Sentry)

#### Game Features (Week 2, Days 3-5)
- 6 bot archetypes (add Schemer, Peaceful, Aggressive)
- 100+ message templates
- LLM personality integration (Vercel AI SDK)
- 6 victory conditions
- Basic treaty system (NAP, Trade Agreement, Alliance)
- Nuclear warfare mechanics
- Advanced events (15 types)

#### User Experience (Week 2, Weekend)
- Enhanced NPE (5-turn tutorial)
- Replay system (battle recordings)
- Statistics dashboard
- Achievement system
- Leaderboard (single-player rankings)

### v0.7+ Backlog (Future Sprints)

**Multiplayer Foundation:**
- Async turn-based multiplayer
- Matchmaking system
- Player vs player combat
- Chat system

**Advanced Features:**
- Coalition system
- Diplomatic victory path
- Technology tree expansion
- Custom game modes
- Modding support

**Platform Expansion:**
- Mobile-responsive design
- PWA support
- Desktop app (Electron)
- API for community tools

---

## SUCCESS METRICS

### v0.5 MVP Definition of Done

**Core Gameplay (MUST HAVE):**
- [ ] Player can create empire with custom name/logo
- [ ] Starmap displays 100 sectors with clear ownership
- [ ] Planet management (build units, view production)
- [ ] Turn processing completes in <1 second
- [ ] Combat system resolves all scenarios correctly
- [ ] 3 bot archetypes make different strategic decisions
- [ ] 3 victory conditions trigger correctly
- [ ] Save/load preserves complete game state

**User Experience (MUST HAVE):**
- [ ] Tutorial overlays guide first 3 turns
- [ ] Bot messages appear with appropriate personality
- [ ] Combat reports display detailed results
- [ ] Victory/defeat screens celebrate/commiserate
- [ ] All UI elements have hover tooltips

**Technical (MUST HAVE):**
- [ ] Zero runtime errors in normal gameplay
- [ ] Database handles 100 concurrent games
- [ ] Deployment pipeline works end-to-end
- [ ] 5 E2E tests pass consistently

**Nice to Have (OPTIONAL):**
- [ ] Sound effects for combat/events
- [ ] Animated transitions between screens
- [ ] Advanced starmap filters
- [ ] Empire statistics charts

### Acceptance Criteria

**The game is SHIPPABLE when:**

1. **A new player can:**
   - Create account and empire in <2 minutes
   - Understand core mechanics from tutorial
   - Complete first 5 turns without confusion
   - Experience meaningful bot interaction
   - Win or lose clearly

2. **The system can:**
   - Process 24-bot turn in <500ms
   - Save/load without data loss
   - Handle 10 concurrent games
   - Recover from common errors gracefully

3. **The experience delivers:**
   - "Just one more turn" engagement
   - Memorable bot personalities (via templates)
   - Strategic depth in combat
   - Clear progression toward victory

---

## COMMUNICATION PLAN

### Daily Standups (15min)
- **Day 1, 9am:** Kickoff, assign tasks
- **Day 1, 5pm:** Review schema, unblock issues
- **Day 2, 9am:** Bot progress, combat testing
- **Day 2, 5pm:** Integration check, identify gaps
- **Day 3, 9am:** Bug priorities, testing focus
- **Day 3, 5pm:** Ship decision, deployment go/no-go

### Escalation Path
- **Blocker:** Any task >2 hours blocked -> immediate escalation
- **Scope Risk:** Feature completion >50% over estimate -> cut or defer
- **Quality Risk:** Critical bug found -> all hands debug session

### Ship Decision Criteria
**GO if:**
- Core game loop works end-to-end
- Save/load functional
- Turn processing <1s
- Zero crash bugs

**NO-GO if:**
- Combat resolution has edge cases causing crashes
- Save/load corrupts state
- Turn processing >2s
- UX completely unclear

---

## CONCLUSION

This sprint plan resolves all conflicts between reviewers by:

1. **Technology:** Pure greenfield Next.js (Architect's recommendation)
2. **Scope:** Cut diplomacy/coalitions, add save/load (Product Manager's recommendation)
3. **Performance:** Rule-based bots v0.5, defer LLM to v0.6 (Game Developer + Architect consensus)
4. **Bot Quality:** Template messages v0.5, full LLM v0.6 (Narrative Designer's phased approach)
5. **Timeline:** Realistic 3-day MVP, not oversold (Agent Organizer's conservative estimate adapted)

**Weekend deliverable:** A playable, save-able, completable strategy game with coherent bot opponents and meaningful combat decisions.

**Next sprint deliverable (v0.6):** The LLM-powered personality system that makes X-Imperium memorable.

**Long-term vision:** A thriving multiplayer community telling stories about their bot rivals.

---

## APPENDIX A: Tech Stack Reference Card

```typescript
// Quick reference for all developers

// State Management
import { useGameStore } from '@/stores/game-store';
const { currentGame, actions } = useGameStore();

// Database Queries
import { db } from '@/db';
import { games, empires, planets } from '@/db/schema';
const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });

// Combat Resolution
import { resolveBattle } from '@/lib/combat/resolver';
const result = resolveBattle(attackerFleet, defenderFleet, context);

// Turn Processing
import { processTurn } from '@/lib/turn-engine/processor';
await processTurn(gameId);

// Bot AI
import { WarlordBot, EconomistBot, DiplomatBot } from '@/lib/bots/archetypes';
const bot = new WarlordBot();
const actions = await bot.executeTurn(empire, gameState);
```

---

## APPENDIX B: Definition of Done Checklist

**Before ANY code commit:**
- [ ] TypeScript strict mode passes
- [ ] ESLint/Prettier clean
- [ ] Unit tests for business logic
- [ ] Self-documenting code or comments

**Before each day ends:**
- [ ] All tasks for day marked complete or blocked
- [ ] Known issues logged in GitHub
- [ ] Tomorrow's task dependencies clear

**Before final deployment:**
- [ ] All E2E tests passing
- [ ] No console errors in production build
- [ ] Environment variables documented
- [ ] Rollback plan tested

---

**PROJECT STATUS: READY TO BEGIN**
**NEXT ACTION: Execute Task 1.1 (Project Scaffolding)**
