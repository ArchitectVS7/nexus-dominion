# PRD Rebuild: Design Interview Process

**Status:** In Progress
**Started:** 2026-01-12
**Purpose:** Rebuild the PRD from first principles through structured interviews

---

## Process Overview

This document captures design decisions made during a structured interview process. Each system is addressed in dependency order, with decisions becoming atomic specifications that will form the new PRD.

### Interview Order

| # | System | Status | Date |
|---|--------|--------|------|
| 1 | Game Identity | **COMPLETE** | 2026-01-12 |
| 2 | Turn Structure | IN PROGRESS | 2026-01-12 |
| 3 | Resources & Economy | Pending | |
| 4 | Sectors & Expansion | Pending | |
| 5 | Combat | Pending | |
| 6 | Military & Units | Pending | |
| 7 | Research & Progression | Pending | |
| 8 | Diplomacy & Coalitions | Pending | |
| 9 | Bot AI | Pending | |
| 10 | Victory Conditions | Pending | |
| 11 | UI/UX | Pending | |
| 12 | Expansion Scope | Pending | |

---

## System 1: Game Identity

### Context

This is the foundational layer. Every other design decision references back to these answers. We're establishing:
- What kind of game is this?
- Who is it for?
- What's the core experience promise?

### Interview Questions

#### Q1.1: What is the elevator pitch?

> *Complete this sentence: "Nexus Dominion is a _____ game where you _____."*

**Decision:** "Nexus Dominion is a **turn-based 4X strategy** game where you **build a space empire against 100 AI opponents**."

---

#### Q1.2: Single-player, multiplayer, or both?

**Decision:** Single-player only (player vs 10-100 AI bots)

**Rationale:** Focus development effort on bot quality. The 100 AI opponents ARE the game - they need to be excellent.

---

#### Q1.3: Target session length?

**Decision:** Variable by game mode

**Rationale:** Different players want different experiences. Quick mode for lunch breaks, Epic mode for weekend sessions.

---

#### Q1.4: Game modes - what configurations should exist?

**Decision:** Three preset modes:

| Mode | Bots | Turns | Session Target |
|------|------|-------|----------------|
| **Quick** | 10 | 50 | 30-45 minutes |
| **Standard** | 25 | 100 | 1-2 hours |
| **Epic** | 100 | 300 | 3-4 hours |

---

#### Q1.5: What's the core fantasy/experience?

**Decision:** **Galactic Emperor** - political and strategic dominance

You rule an empire, make alliances, crush rivals through strategy. Not just military command - you're playing the political game across 100 opponents.

---

#### Q1.6: What makes this game unique vs other 4X games?

**Decision:** Three key differentiators:

1. **100 AI opponents with distinct personalities and memory**
   - Bots remember grudges, have emotional states, feel alive
   - Creates emergent narratives ("Varkus betrayed me on Turn 34")

2. **"Single-player MMO" feel with emergent boss opponents**
   - Runaway bots become "raid bosses" that require coalitions to defeat
   - Alliance mechanics are NECESSARY, not optional
   - Analogous to WoW raid system - you can't solo the endgame

3. **LCARS-inspired UI with Star Trek aesthetic**
   - Visual identity distinct from generic sci-fi
   - Immersive command center feel

---

#### Q1.7: Complexity target - who is the player?

**Decision:** Mid-core strategy fans

**Rationale:** Some complexity with progressive disclosure. Broader appeal than hardcore 4X, but enough depth to reward mastery. Progressive disclosure means new players aren't overwhelmed.

---

#### Q1.8: Platform target?

**Decision:** Web + Mobile responsive

**Rationale:** Browser-based for easy access, but responsive design ensures mobile players can participate. No app store friction.

---

### Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Genre/Pitch | Turn-based 4X strategy vs 100 AI opponents | AI count is the hook |
| Player Mode | Single-player only | Focus on bot quality |
| Session Length | Variable by mode | Flexibility for different play contexts |
| Game Modes | Quick (10/50), Standard (25/100), Epic (100/300) | Three distinct experiences |
| Core Fantasy | Galactic Emperor | Political + strategic dominance |
| Unique Value | 100 personalities + "SP MMO" bosses + LCARS UI | Coalition requirement is key |
| Complexity | Mid-core with progressive disclosure | Broad appeal with depth |
| Platform | Web + Mobile responsive | Easy access, no friction |

---

### Atomic Requirements (System 1)

```
REQ-GAME-001: Game Identity
Description: Nexus Dominion is a single-player turn-based 4X space strategy game
where the player builds an empire competing against 10-100 AI bot opponents.
Acceptance Criteria:
- [ ] Game launches in single-player mode only
- [ ] Player competes against AI bots (no human multiplayer in v1.0)
- [ ] Game presents as 4X strategy (explore, expand, exploit, exterminate)
```

```
REQ-GAME-002: Game Modes
Description: Three preset game modes provide different session lengths and complexity.
Acceptance Criteria:
- [ ] Quick mode: 10 bots, 50 turn limit, targets 30-45 minute session
- [ ] Standard mode: 25 bots, 100 turn limit, targets 1-2 hour session
- [ ] Epic mode: 100 bots, 300 turn limit, targets 3-4 hour session
- [ ] Mode selection available at game start
```

```
REQ-GAME-003: Core Experience - Galactic Emperor
Description: Player experience centers on ruling an empire through political and
strategic dominance, not just military command.
Acceptance Criteria:
- [ ] Diplomacy systems enable alliance formation
- [ ] Coalition mechanics required to defeat runaway opponents
- [ ] Bot personalities create memorable rival relationships
- [ ] Player feels like emperor, not just admiral
```

```
REQ-GAME-004: Platform Support
Description: Game runs in web browsers with responsive design for mobile devices.
Acceptance Criteria:
- [ ] Runs in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Responsive layout adapts to mobile screen sizes
- [ ] Touch controls functional on mobile
- [ ] No native app required
```

```
REQ-GAME-005: Progressive Disclosure
Description: Game complexity is revealed gradually to avoid overwhelming new players.
Acceptance Criteria:
- [ ] Core mechanics available from Turn 1
- [ ] Advanced features unlock at specific turn thresholds
- [ ] Tutorial/guidance helps new players
- [ ] Mid-core complexity ceiling (not hardcore simulation)
```

---

## System 2: Turn Structure

### Context

The turn structure is the **heartbeat** of the game. Every other system plugs into this loop.

**CRITICAL CONFLICT IDENTIFIED:**
- GAME-DESIGN.md describes 6 phases
- PRD.md describes 17 phases (8 transactional + 9 non-transactional)

We must resolve this and establish the definitive structure.

### Interview Questions

#### Q2.1: Simultaneous vs Sequential Processing

How should empires (player + bots) process their turns?

*(awaiting response)*

---

#### Q2.2: Phase Granularity

How detailed should the turn phases be?

*(awaiting response)*

---

#### Q2.3: Transaction Boundaries

What happens if a phase fails mid-processing?

*(awaiting response)*

---

#### Q2.4: Player Visibility

What does the player SEE during turn processing?

*(awaiting response)*

---

### Decisions Summary

*(To be filled after interview)*

---

### Atomic Requirements (System 2)

*(To be generated after decisions)*

---

## System 3: Resources & Economy

*(To be filled after System 2 is complete)*

---

*[Remaining systems to be added as we progress]*
