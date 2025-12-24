# Pass 2: Architect Review

**Date:** December 23, 2024
**Agent:** architect-reviewer
**Agent ID:** aa9d172

## Executive Summary

**Critical Architectural Mismatch Detected**: The PRD specifies a modern TypeScript/Next.js stack, but the existing codebase is a legacy PHP 8.2/MySQL/Smarty application. This represents a **complete rewrite requirement**, not incremental modernization. The bot architecture is well-designed but completely misaligned with the current technology foundation.

## Tech Stack Assessment

### PRD vs Reality Disconnect
```
PRD Specifies:          Current Reality:
├─ Next.js 14+          ├─ PHP 8.2
├─ TypeScript           ├─ No TypeScript
├─ React                ├─ Smarty templates
├─ Tailwind CSS         ├─ Custom CSS
├─ Drizzle ORM          ├─ ADOdb (legacy)
├─ PostgreSQL           ├─ MySQL 8.0
└─ Server Actions       └─ Traditional PHP scripts
```

### Missing from Stack Definition
1. **State management strategy** - Server vs client authority undefined
2. **Caching layer** - Redis for 99 bot processing?
3. **Job queue system** - BullMQ, Inngest for bot processing?
4. **Authentication choice** - NextAuth vs Clerk?

### Recommended Additions
```typescript
// State Management
- Zustand for client state
- React Query for server state
- Server Actions for mutations

// Real-time Updates
- Server-Sent Events (not WebSocket - turn-based)

// Background Jobs
- Inngest for bot turn processing

// Caching
- Vercel KV (Redis) for game state
```

### Migration Strategy
**Recommended: Option C - Abandon Existing Codebase**
- Treat PHP version as reference implementation
- Pure greenfield Next.js build
- Timeline: 4-6 months, cleanest outcome

## Data Architecture

### Critical Gap: Core Game Schema Undefined

PRD covers bot architecture but missing:

```sql
-- NEEDED: Core game tables
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  scenario_id INT NOT NULL,
  current_turn INT DEFAULT 1,
  turn_limit INT DEFAULT 200,
  status VARCHAR(20) -- 'active', 'completed'
);

CREATE TABLE empires (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES games(id),
  player_email VARCHAR(255),
  bot_config_id INT,
  empire_name VARCHAR(100),
  credits BIGINT DEFAULT 100000,
  food BIGINT,
  ore BIGINT,
  petroleum BIGINT,
  research_points INT,
  -- ... all resources
);

CREATE TABLE planets (
  id SERIAL PRIMARY KEY,
  empire_id INT REFERENCES empires(id),
  planet_type VARCHAR(20),
  production_rate DECIMAL(10,2)
);

CREATE TABLE military_units (...);
CREATE TABLE research_progress (...);
CREATE TABLE attacks (...);
CREATE TABLE treaties (...);
CREATE TABLE market_prices (...);
CREATE TABLE game_events (...); -- Event sourcing for replays
```

## Performance Analysis

### Turn Processing Budget

**Target: < 10 seconds**

```
Current Analysis:
├─ Tier 4 (25 bots): ~10ms each = 250ms
├─ Tier 3 (25 bots): ~50ms each = 1.25s
├─ Tier 2 (25 bots): ~100ms each = 2.5s
└─ Tier 1 (24 bots): ~2000ms each = 48s ← PROBLEM
```

**Issue**: Sequential LLM processing = 48 seconds!

**Solution**: Parallel batched LLM processing
```typescript
// Process in batches of 5 to avoid rate limits
async function processTier1Bots(bots) {
  const batches = chunk(bots, 5);
  for (const batch of batches) {
    await Promise.all(batch.map(bot => processLLMBot(bot)));
  }
  // 24 bots / 5 = ~5 batches × 2s = ~10s
}
```

### LLM Cost Analysis
```
Per game (24 LLM bots × 200 turns):
- Input: ~500 tokens/bot × 24 × 200 = 2.4M tokens
- Output: ~200 tokens/bot × 24 × 200 = 960K tokens
- Cost: ~$4.00 per game (Haiku pricing)

With prompt caching: ~$0.80 per game (80% reduction)
```

### UI Performance
- **Galaxy Map**: Use react-konva (100 entities OK)
- **Glass Panel Effect**: Pre-render blur (backdrop-filter expensive)
- **Data Tables**: Virtualization for 100+ empires

## System Design Gaps

### Undefined Decisions

1. **Server Authority vs Client Authority**
   - Recommendation: Server Authority for actions, Client for UI

2. **Turn Advancement Model**
   - Recommendation: Progressive Enhancement with SSE
   - Submit turn → Stream progress → Seamless transition

3. **Game Session Persistence**
   - Checkpoint system every 10 turns
   - Allow resume from last checkpoint

4. **Multi-Tenancy**
   - Recommendation: One game at a time for MVP

### Refactoring Risks

1. **Game Logic Coupling** - Define service layer from start
2. **Bot Prompt Maintenance** - Database-driven prompts
3. **Magic Numbers** - Central configuration file

## Security Review

### Authentication
- Recommendation: NextAuth.js (free, sufficient)
- Email verification required
- JWT sessions for Vercel compatibility

### Game State Integrity
```typescript
// Server-side validation for ALL mutations
export async function buyPlanet(planetType) {
  'use server';
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const empire = await getPlayerEmpire(session.user.email);
  const cost = calculatePlanetCost(empire, planetType);

  if (empire.credits < cost) {
    throw new Error('Insufficient credits');
  }

  // Atomic transaction with optimistic locking
  await db.transaction(async (tx) => {
    await tx.update(empires)
      .set({ credits: empire.credits - cost, version: empire.version + 1 })
      .where(and(eq(empires.id, empire.id), eq(empires.version, empire.version)));
    await tx.insert(planets).values({ empireId: empire.id, planetType });
  });
}
```

### LLM Security
- Sanitize all user input in prompts (prevent injection)
- API keys in environment variables only
- Rate limiting per game (100 turns/hour max)
- Response validation with Zod schema

## DevOps Readiness

### Missing CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    - Type check (tsc)
    - Lint (ESLint)
    - Unit tests (Vitest)
    - E2E tests (Playwright)
    - Build check
  deploy:
    - Auto-deploy to Vercel on main
```

### Deployment Decision
**Recommendation: Hybrid**
- Frontend: Vercel (free, instant deploys)
- Bot Processing: Railway (long-running server)
- Queue job from Vercel to dedicated server

## Priority Items

### v0.5 (Foundation)
1. Tech stack decision - Rewrite vs hybrid
2. Database schema implementation (all core tables)
3. Authentication setup (NextAuth.js)
4. Core game loop - Server Actions
5. UI foundation - LCARS components
6. Turn processing architecture

### v0.6 (Bot Integration)
7. Bot database schema
8. Tier 4 bots (random)
9. Tier 3 bots (decision trees)
10. Bot message system
11. Combat with bots
12. Performance testing

### v0.7 (LLM & Polish)
13. LLM provider abstraction
14. Tier 1 bot implementation
15. Tier 2 strategic bots
16. Galaxy map (react-konva)
17. Scenario system

### Red Flags
1. No PHP→TypeScript migration mentioned
2. LLM timeout risk (48s exceeds Vercel 10s limit)
3. Database schema incomplete
4. Cost analysis missing ($4/game × 1000 players = $4000/mo)
