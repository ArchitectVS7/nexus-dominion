# Architecture Guide

> This document covers the technical architecture of Nexus Dominion. For a quick reference, see [CLAUDE.md](../../CLAUDE.md).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Testing**: Vitest (unit), Playwright (E2E)

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── game/              # Game pages (dashboard, combat, research, etc.)
│   ├── actions/           # Server Actions (turn-actions, combat-actions, etc.)
│   └── api/               # API routes
├── components/
│   └── game/              # Game UI components
│       ├── combat/        # AttackInterface, BattleReport, CombatPreview
│       ├── military/      # BuildQueuePanel, UnitCard
│       ├── sectors/       # SectorsList, BuySectorPanel
│       ├── research/      # FundamentalResearchProgress
│       ├── messages/      # MessageInbox, GalacticNewsFeed
│       └── starmap/       # Force-directed empire visualization
├── lib/
│   ├── db/                # Drizzle schema and database connection
│   │   └── schema.ts      # All tables, enums, relations, types
│   ├── game/
│   │   ├── services/      # Business logic services
│   │   ├── repositories/  # Database access layer
│   │   └── constants/     # Game constants
│   ├── formulas/          # Pure calculation functions
│   ├── combat/            # Combat system
│   ├── bots/              # AI bot system
│   ├── covert/            # Covert operations
│   ├── market/            # Trading system
│   ├── diplomacy/         # Treaties and reputation
│   ├── events/            # Galactic events
│   └── victory/           # Victory conditions
├── data/
│   ├── personas.json      # 100 bot persona definitions
│   └── templates/         # Message templates per persona
└── test/                  # Test setup and utilities
```

---

## Key Architectural Patterns

### Services are Pure Functions

Services in `src/lib/game/services/` contain pure business logic tested via Vitest. Database calls are mocked in tests using `src/test/utils/db-mock.ts`.

**Key Services:**
- `turn-processor.ts` - 6-phase turn processing
- `combat-service.ts` - Battle resolution
- `resource-engine.ts` - Production/consumption
- `population.ts` - Growth/starvation
- `civil-status.ts` - Civil status evaluation
- `sector-service.ts` - Acquire/release sectors

### Server Actions Handle Database Access

All database writes go through Server Actions in `src/app/actions/`. Actions:
- Validate input with Zod schemas
- Handle authentication via cookies
- Call services for business logic
- Return typed responses

### Formulas in Dedicated Modules

Combat power, casualties, population growth, etc. are pure functions in `src/lib/formulas/` with comprehensive unit tests. This enables:
- Easy balancing without touching service logic
- Predictable, testable calculations
- Clear separation of concerns

---

## Database Schema

The schema in `src/lib/db/schema.ts` defines:

| Category | Tables |
|----------|--------|
| **Core** | `games`, `empires`, `sectors` |
| **Combat** | `attacks`, `combatLogs` |
| **Economy** | `marketPrices`, `marketOrders`, `buildQueue` |
| **Diplomacy** | `treaties`, `messages`, `reputationLog` |
| **Research** | `researchProgress`, `unitUpgrades`, `researchBranchAllocations` |
| **Bots** | `botMemories`, `botEmotionalStates` |
| **Expansion** | `resourceInventory`, `craftingQueue`, `syndicateContracts` |
| **Events** | `galacticEvents`, `coalitions` |

All tables use UUID primary keys and have proper foreign key relationships.

---

## Path Alias

Use `@/` for imports from the `src/` directory:

```typescript
// Good
import { Empire } from "@/lib/db/schema";
import { calculateCombatPower } from "@/lib/formulas/combat-power";

// Avoid
import { Empire } from "../../../lib/db/schema";
```

---

## Related Documents

- [CLAUDE.md](../../CLAUDE.md) - Quick reference for all commands and patterns
- [Testing Guide](TESTING-GUIDE.md) - Testing conventions
- [Frontend Guide](FRONTEND-GUIDE.md) - React/Next.js patterns
