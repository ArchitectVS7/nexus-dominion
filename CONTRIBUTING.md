# Contributing to Nexus Dominion

Thank you for your interest in contributing to **Nexus Dominion**! This document provides guidelines for contributors.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Terminology Guidelines](#terminology-guidelines)
5. [Code Style](#code-style)
6. [Testing Requirements](#testing-requirements)
7. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to make a great game.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (we recommend [Neon](https://neon.tech) for development)
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-dominion.git
cd nexus-dominion

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

---

## Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**: Follow code style and terminology guidelines
3. **Run tests**: `npm run test` and `npm run test:e2e`
4. **Check linting**: `npm run lint` and `npm run typecheck`
5. **Verify compliance**: `npm run compliance:check` (temporary requirement)
6. **Commit your changes**: Use clear, descriptive commit messages
7. **Push and create PR**: Push to your fork and create a pull request

---

## Terminology Guidelines

⚠️ **CRITICAL: Follow these terminology rules strictly.**

Nexus Dominion has deliberately moved away from Solar Realms Elite's terminology as part of our rebranding. **Violations will fail CI checks.**

### Forbidden Terms

| ❌ DO NOT USE | ✅ USE INSTEAD | WHY |
|---------------|----------------|-----|
| `planet` / `planets` | **sector** / **sectors** | Core rebranding decision |
| `25 AI opponents` | **10-100 AI opponents (configurable)** | Variable bot counts |
| `200 turns` | **50-500 turns (based on game mode)** | Configurable game modes |
| `Bot Phase` | **simultaneous processing** | Accurate game mechanics |
| `buy_planet` | **buy_sector** | API/code consistency |

### Enforcement

1. **ESLint**: Automatically catches terminology violations in code
2. **Compliance Script**: `npm run compliance:check` (temporary, runs in CI)
3. **Code Review**: PRs are manually reviewed for terminology

### Examples

#### ❌ WRONG
```typescript
// Variable names
const planetCount = empire.planets.length;
const totalPlanets = sectors.length;

// Comments
// Buy a new planet for the empire
function acquirePlanet() { ... }

// Documentation
"Empires start with 5 planets"
```

#### ✅ CORRECT
```typescript
// Variable names
const sectorCount = empire.sectors.length;
const totalSectors = sectors.length;

// Comments
// Acquire a new sector for the empire
function acquireSector() { ... }

// Documentation
"Empires start with 5 sectors"
```

### When Adding New Features

- **Always use "sector/sectors"** when referring to territory
- **Reference game modes** when mentioning bot counts or turn limits
- **Check ESLint warnings** before committing
- **Read `docs/development/TERMINOLOGY.md`** for full guidelines

### Database Schema

The database table is named `sectors` (migrated from `planets` in January 2026). Always use "sector" terminology in:
- Column names
- Variable names
- Function names
- Comments
- Documentation

---

## Code Style

### TypeScript

- **Strict mode**: All TypeScript must compile with strict mode
- **No `any`**: Avoid `any` types; use proper typing
- **Prefer `const`**: Use `const` by default, `let` only when necessary
- **Path aliases**: Use `@/` for imports from `src/`

```typescript
// ✅ Good
import { Empire } from "@/lib/db/schema";
const sectorCount: number = empire.sectorCount;

// ❌ Bad
import { Empire } from "../../../lib/db/schema";
let sectorCount: any = empire.sectorCount;
```

### Testing

- **Add tests for new features**: All new code should have unit tests
- **Use descriptive test names**: `it("should calculate sector costs correctly")`
- **Add data-testid**: All interactive UI elements need `data-testid` attributes

```typescript
// ✅ Good test
describe("Sector Service", () => {
  it("should acquire sector when empire has sufficient credits", async () => {
    const result = await acquireSector(empireId, "food");
    expect(result.success).toBe(true);
  });
});
```

### File Organization

- **Services**: Business logic in `src/lib/game/services/`
- **Repositories**: Database access in `src/lib/game/repositories/`
- **Formulas**: Pure calculations in `src/lib/formulas/`
- **Components**: UI components in `src/components/game/`

---

## Testing Requirements

### Before Submitting a PR

Run all checks locally:

```bash
# TypeScript compilation
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test -- --run

# E2E tests
npm run test:e2e

# Terminology compliance (temporary)
npm run compliance:check
```

**All checks must pass** before your PR can be merged.

### Coverage Requirements

- **Unit tests**: 80% coverage for new code
- **E2E tests**: Critical user flows must have E2E coverage

---

## Pull Request Process

### Before Creating a PR

1. ✅ All tests pass locally
2. ✅ ESLint shows no errors
3. ✅ TypeScript compiles without errors
4. ✅ Terminology compliance passes
5. ✅ Commit messages are clear and descriptive

### PR Title Format

```
<type>: <description>

Examples:
feat: Add sector trait system
fix: Correct combat power calculation
docs: Update terminology guidelines
refactor: Simplify resource engine
test: Add unit tests for research service
```

### PR Description

Include:
- **What changed**: Brief summary of changes
- **Why**: Reasoning behind the changes
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes

### Review Process

1. **Automated checks**: CI runs tests, linting, and compliance
2. **Code review**: Maintainers review for quality and terminology
3. **Approval**: At least one maintainer must approve
4. **Merge**: Squash and merge to main

---

## Questions?

- **Terminology questions**: See `docs/development/TERMINOLOGY.md`
- **Architecture questions**: See `docs/core/*.md`
- **Game design questions**: See `docs/PRD.md`

---

**Thank you for contributing to Nexus Dominion!** 🚀
