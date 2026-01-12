# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nexus Dominion** is a turn-based 4X space empire strategy game with 10-100 AI bot opponents. Built with Next.js 14, TypeScript, and PostgreSQL.

- **Version:** 0.6-Prototype (M11 Complete, M12 In Progress)
- **Inspiration:** Solar Realms Elite (1990) - but with 100 AI bots, modern UI, and sector-based geography

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run typecheck        # TypeScript strict mode
npm run lint             # ESLint

# Testing
npm run test             # Unit tests (watch mode)
npm run test -- --run    # Unit tests once
npm run test -- src/lib/formulas/combat-power.test.ts  # Single test file
npm run test:e2e         # Playwright E2E tests
npm run test:e2e -- -g "test name"                     # Single E2E test
npm run test:e2e -- --project=chromium                 # Chromium only
npm run test:coverage    # Coverage report (80% threshold)

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Drizzle Studio GUI
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
```

## Critical Terminology (MUST READ)

**These rules are non-negotiable. Using forbidden terms is a branding failure.**

| NEVER USE | ALWAYS USE |
|-----------|------------|
| planet(s) | **sector(s)** |
| 25 AI opponents | **10-100 AI opponents (configurable)** |
| 200 turns | **50-500 turns (based on game mode)** |
| Bot Phase | **simultaneous processing** |

Full rules: `docs/development/TERMINOLOGY.md`

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions (mutations)
│   └── game/              # Game pages
├── components/game/        # Game UI components
├── lib/
│   ├── db/schema.ts       # Drizzle schema (all tables)
│   ├── game/
│   │   ├── services/      # Business logic (pure functions, DB mocked in tests)
│   │   ├── repositories/  # Database access layer
│   │   └── constants/     # Game constants
│   ├── formulas/          # Pure calculation functions
│   ├── bots/              # 4-tier AI system
│   ├── combat/            # D20 combat resolution
│   └── api/
│       ├── queries/       # React Query hooks (server state)
│       └── mutations/     # React Query mutations
├── stores/                 # Zustand stores (client state)
└── test/utils/            # Test utilities (db-mock.ts)
```

**Path alias:** Use `@/` for imports from `src/` (e.g., `import { Empire } from "@/lib/db/schema"`)

## Key Patterns

### Server Actions for Mutations
All database writes go through Server Actions in `src/app/actions/`:
- Validate input with Zod schemas
- Handle auth via cookies
- Call services for business logic

### Pure Formulas
Combat power, casualties, population growth are pure functions in `src/lib/formulas/` with unit tests. Modify these for balancing.

### State Management
- **Server state:** React Query hooks in `src/lib/api/queries/`
- **Client state:** Zustand stores in `src/stores/`

### Testing
- Unit tests use Vitest, co-located as `*.test.ts`
- Service tests mock DB with `src/test/utils/db-mock.ts`
- E2E tests use Playwright with `data-testid` attributes
- Every interactive UI element needs `data-testid` for Playwright

## Code Standards

1. **TypeScript strict mode** - No `any` types
2. **PRD compliance** - Formulas and values must match `docs/PRD.md`
3. **Existing patterns** - Follow patterns in `src/lib/game/services/`
4. **data-testid** - Every interactive element needs one

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/PRD.md` | Single source of truth for requirements (REQ-XXX-NNN format) |
| `docs/development/TERMINOLOGY.md` | CRITICAL terminology rules |
| `docs/design/GAME-DESIGN.md` | Core mechanics and vision |
| `docs/design/BOT-SYSTEM.md` | 4-tier AI with 100 personas |
| `docs/milestones.md` | Current development tasks |

## Automation Commands

### /milestone
Automated development cycle for milestone tasks:
1. Parse `docs/milestones.md` for next incomplete task
2. Implement following developer guidelines
3. Spawn code-reviewer agent for adversarial review
4. Fix CRITICAL/HIGH issues
5. Run quality gates (typecheck, lint, test, build)
6. Run E2E tests (mandatory - must pass)
7. Update docs, commit

### /automate [file] [task-group]
Same workflow for any task file:
```
/automate docs/milestones.md "Milestone 12"
/automate docs/backlog.md "Epic 1"
```

## Quality Gates

All tasks must pass before commit:
```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npm run test:e2e -- --project=chromium
```

E2E failures require root cause analysis (see `.claude/prompts/root-cause-analysis.md`). Never skip failing tests.

## Game Systems Reference

| System | Key Details |
|--------|-------------|
| **Combat** | D20 unified resolution, 47.6% attacker win rate, 1.10x defender advantage |
| **Bot AI** | 4 tiers (LLM Elite → Strategic → Simple → Random), 8 archetypes, 100 personas |
| **Resources** | Credits, Food, Ore, Petroleum, Research Points |
| **Victory** | Conquest (60%), Economic (1.5x), Diplomatic (coalition 50%), Research, Military (2x), Survival |

## Hooks Configuration

Post-edit hooks run automatically:
- `npm run typecheck` (first 20 lines of errors)
- `npm run lint -- --max-warnings 0` (first 10 lines)

## Session Notes

Track work in `.claude/prompts/session-notes.md`:
- Tasks completed
- Review findings (CRITICAL/HIGH/MEDIUM)
- E2E iterations and root causes fixed
