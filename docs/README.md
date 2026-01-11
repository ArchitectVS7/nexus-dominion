# Nexus Dominion Documentation

Welcome to the Nexus Dominion documentation hub. This guide helps you find what you need, whether you're playing the game, contributing code, or understanding the vision.

---

## Quick Start

| I want to... | Go to... |
|--------------|----------|
| **Play the game** | [Quick Start Guide](guides/QUICK-START.md) |
| **Write code** | [CLAUDE.md](../CLAUDE.md) (start here) |
| **Understand the vision** | [Game Design](design/GAME-DESIGN.md) |
| **See what's coming** | [Alpha Status](roadmap/ALPHA.md) |

---

## Documentation Structure

### The Vision: [/design](design/)

What we're building and why. The soul of the game.

| Document | Description |
|----------|-------------|
| [GAME-DESIGN.md](design/GAME-DESIGN.md) | Core mechanics, philosophy, systems overview |
| [BOT-SYSTEM.md](design/BOT-SYSTEM.md) | 4-tier AI, 8 archetypes, emotional states |
| [COMBAT-SYSTEM.md](design/COMBAT-SYSTEM.md) | D20 unified resolution, outcomes |
| [UI-DESIGN.md](design/UI-DESIGN.md) | LCARS aesthetic, components, patterns |

### The Journey: [/roadmap](roadmap/)

Where we are and where we're going.

| Document | Description |
|----------|-------------|
| [ALPHA.md](roadmap/ALPHA.md) | Current playable state, what's being fixed |
| [BETA.md](roadmap/BETA.md) | Post-alpha priorities: stability, mobile, polish |
| [LAUNCH.md](roadmap/LAUNCH.md) | v1.0 definition of done |
| [EXPANSION.md](roadmap/EXPANSION.md) | Post-launch DLC: Crafting + Syndicate |
| [FUTURE.md](roadmap/FUTURE.md) | Long-term vision (Waves 2-4) |

### For Players: [/guides](guides/)

Learn to play and win.

| Document | Description |
|----------|-------------|
| [QUICK-START.md](guides/QUICK-START.md) | 5-minute introduction |
| [HOW-TO-PLAY.md](guides/HOW-TO-PLAY.md) | Complete game manual |

### For Developers: [/development](development/)

Technical reference for contributors.

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](development/ARCHITECTURE.md) | Tech stack, directory structure |
| [TERMINOLOGY.md](development/TERMINOLOGY.md) | CRITICAL: Terms to use and avoid |
| [TESTING.md](development/TESTING.md) | Vitest and Playwright patterns |
| [SCHEMA.md](development/SCHEMA.md) | Database ERD and table reference |
| [FRONTEND-GUIDE.md](development/FRONTEND-GUIDE.md) | React/Next.js patterns |

### Design History: [/decisions](decisions/)

Why we chose what we chose.

| Document | Description |
|----------|-------------|
| [README.md](decisions/README.md) | How to use this folder |
| [crafting-alternatives.md](decisions/crafting-alternatives.md) | Tech cards vs supply chain |
| [syndicate-alternatives.md](decisions/syndicate-alternatives.md) | Hidden traitor vs trust system |
| [research-alternatives.md](decisions/research-alternatives.md) | D20 breakthrough rolls |
| [ux-improvements.md](decisions/ux-improvements.md) | UX ideas backlog |

### Expansion Details: [/expansion](expansion/)

Deep-dive specifications for post-launch content.

| Document | Description |
|----------|-------------|
| [CRAFTING.md](expansion/CRAFTING.md) | Full 4-tier crafting spec |
| [SYNDICATE.md](expansion/SYNDICATE.md) | Full Syndicate system spec |

### Historical: [/archive](archive/)

Read-only reference for past decisions.

| Folder | Description |
|--------|-------------|
| `reviews-2026-01/` | Alpha readiness reviews |
| `plans-completed/` | Executed design plans |
| `legacy/` | Earlier documentation |

---

## Key Terminology

This is **critical** - incorrect terminology is a branding failure.

| DO NOT USE | USE INSTEAD |
|------------|-------------|
| planet(s) | **sector(s)** |
| 25 AI opponents | **10-100 AI opponents (configurable)** |
| 200 turns | **50-500 turns (based on game mode)** |
| Bot Phase | **simultaneous processing** |

Full rules: [TERMINOLOGY.md](development/TERMINOLOGY.md)

---

## Contributing

1. Read [CLAUDE.md](../CLAUDE.md) first
2. Check [TERMINOLOGY.md](development/TERMINOLOGY.md)
3. Review [ARCHITECTURE.md](development/ARCHITECTURE.md)
4. Run tests before committing

---

## The Vision in 30 Seconds

> Nexus Dominion is a 1-2 hour single-player 4X strategy game where you command a space empire against 10-100 AI opponents. With LCARS-inspired UI, D20 combat, and bots that remember grudges, every game tells a unique story. Build your empire, crush your rivals, dominate the galaxy.

---

*Last updated: January 2026*
