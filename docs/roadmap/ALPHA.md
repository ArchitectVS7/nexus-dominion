# Alpha Release: Current State

**Status:** In Development
**Target:** Playable alpha for testing
**Last Updated:** January 2026

---

## What's Working Right Now

Nexus Dominion is playable end-to-end. Here's what alpha testers can experience:

### Core Gameplay Loop

- **Turn-based empire management** - Build your empire over 50-500 turns
- **10-100 AI opponents** - Dynamic bot personalities compete for dominance
- **6 victory conditions** - Conquest, Economic, Diplomatic, Research, Military, Survival
- **Unified D20 combat** - Balanced 47.6% attacker win rate with dramatic outcomes

### Empire Management

- **5 resource types** - Credits, Food, Ore, Petroleum, Research Points
- **8 sector types** - Each producing different resources
- **8 unit types** - From soldiers to heavy cruisers and defense stations
- **Civil status system** - Empire happiness affects income multipliers

### Bot AI System

- **4-tier intelligence** - From LLM-powered elite bots to simple rule-followers
- **8 archetypes** - Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist
- **Emotional states** - Bots remember relationships and hold grudges
- **100 unique personas** - Each with distinct voice and behavior

### User Interface

- **LCARS-inspired design** - Star Trek aesthetic with modern polish
- **Starmap command center** - Geographic strategy with sector connections
- **Progressive disclosure** - UI complexity grows as you learn
- **Tutorial system** - 5-step guided onboarding

---

## What's Being Fixed

Current development focuses on stability and polish:

### P0 Blockers (Fixing Now)

- E2E test reliability (target: 95% pass rate)
- UI overlay interaction issues
- Page render verification in tests

### P1 Critical (This Sprint)

- Tutorial completion guidance
- Research system onboarding
- WCAG accessibility compliance
- Timeout error recovery

### P2 High Priority (Next Sprint)

- Processing state feedback
- Dashboard information density
- Pre-defeat warnings
- Mobile touch targets

See [Unified Action Plan](../archive/reviews-2026-01/UNIFIED-ACTION-PLAN.md) for the complete issue tracker.

---

## Alpha Tester Focus Areas

We need feedback on:

1. **First-time experience** - Can you figure out what to do?
2. **Bot personality** - Do opponents feel distinct and readable?
3. **Combat balance** - Are battles exciting without being random?
4. **Turn pacing** - Does the game flow well?
5. **Victory paths** - Are all 6 victory conditions viable?

---

## What's NOT in Alpha

These systems exist in code but are disabled or incomplete:

- **Crafting system** - Schema ready, UI pending
- **Syndicate/Black Market** - Backend complete, needs integration
- **Strategic systems** - Virus Uplink, ECM Suite not exposed
- **Persistent pirates** - Future feature

See [Expansion Roadmap](EXPANSION.md) for post-alpha content.

---

## Technical Health

| Metric | Current | Target |
|--------|---------|--------|
| E2E Pass Rate | 43% | 95% |
| Unit Test Coverage | 80%+ | 80%+ |
| Lighthouse Accessibility | 82-88 | 95+ |
| Build Time | ~2 min | <2 min |
| Turn Processing | <500ms | <500ms |

---

## How to Play Alpha

1. Clone the repository
2. Run `npm install && npm run dev`
3. Start a new game at `localhost:3000`
4. Experience 20 turns of protection, then engage!

Report issues via GitHub Issues or the feedback form in-game.

---

*The foundation is solid. Now we polish.*
