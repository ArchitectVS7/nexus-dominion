# D20 System Implementation Audit

**Date:** 2026-01-11
**Purpose:** Audit D20 system documentation vs. implementation and design card-based stat system

---

## Executive Summary

**CRITICAL FINDING:** The d20-exec-summary.md describes a **fully designed but unimplemented** card-based combat system. The actual codebase uses a simplified D20 resolution system without the 6-stat framework.

| Document | Status | D20 Implementation |
|----------|--------|-------------------|
| `d20-exec-summary.md` | Design concept only | **Full 6-stat system with cards** |
| `COMBAT-SYSTEM.md` | Implemented | **Single-roll D20, no stat cards** |
| `PRD.md` | Requirements | **References COMBAT-SYSTEM.md only** |

---

## 1. What's Actually in the Documents?

### d20-exec-summary.md (Design Concept - NOT IMPLEMENTED)

**Complete D20 System with:**
- ✅ 6 rebranded stats (ALL ship-based currently)
- ✅ Card-based unit display
- ✅ 5-phase combat rounds
- ✅ Rarity tiers (Standard → Prototype → Singularity-Class)
- ✅ Sample cards for 9 unit types
- ✅ Momentum/Overextension mechanics
- ✅ Multi-layer battles (Space/Orbital/Planetary)

**Current 6 Stats (ALL SHIP-BASED):**
```
HUL (Hull Integrity)     ← replaces STR
TAR (Targeting Systems)  ← replaces DEX
CPU (Computational Core) ← replaces INT
REA (Reactor Output)     ← replaces CON
CMD (Command Control)    ← replaces WIS
DOC (Doctrine Protocols) ← replaces CHA
```

**Example Card from Document:**
```
Standard-Issue Line Cruiser
───────────────────────────
HUL 5 | TAR 4 | CPU 3 | REA 4 | CMD 3 | DOC 2
Defense: 15 | Hull: 20
Ability: Steady Barrage (+1 damage on hit)
```

---

### COMBAT-SYSTEM.md (IMPLEMENTED)

**Actual Code Implementation:**
- ✅ Single D20 roll resolution
- ✅ 6 dramatic outcomes (Total Victory → Disaster)
- ✅ Power multipliers per unit type
- ✅ Attacker win rate: 47.6% (validated by tests)
- ❌ NO 6-stat system
- ❌ NO card display
- ❌ NO multi-phase combat rounds
- ❌ NO Momentum/Overextension

**Current Unit System:**
```typescript
// Units have simple power multipliers, not stat cards
Soldiers:      0.1
Fighters:      1
Stations:      3 (6 when defending)
Light Cruisers: 4
Heavy Cruisers: 8
Carriers:      12
```

---

### PRD.md (Requirements)

**D20 References:**
- REQ-COMBAT-001: "D20 Unified Resolution" (vague)
- REQ-COMBAT-002-008: Balance targets, outcomes, power multipliers
- ❌ NO mention of 6-stat system
- ❌ NO mention of card-based display
- ❌ References COMBAT-SYSTEM.md, NOT d20-exec-summary.md

---

## 2. The Personality vs. Ship Stat Split

**Your Previous Conversation (Reconstructed from Context):**

You discussed splitting D&D's 6 stats into TWO groups:

**GROUP A - SHIP/UNIT STATS (affects combat directly):**
- STR → Hull Integrity (HUL) - damage absorption
- DEX → Targeting Systems (TAR) - accuracy/evasion
- CON → Reactor Output (REA) - sustained combat power

**GROUP B - BOT PERSONALITY STATS (affects decision-making):**
- WIS → Command Control (CMD) - strategic wisdom, morale
- CHA → Doctrine Protocols (DOC) - diplomacy, psychological warfare
- INT → Computational Core (CPU) - tactical planning, research

**PROBLEM:** The d20-exec-summary.md currently treats ALL 6 stats as ship stats.

---

## 3. Gap Analysis

### What's Missing from Implementation?

| Feature | Designed? | In PRD? | Coded? | Gap |
|---------|-----------|---------|--------|-----|
| 6-stat system | ✅ | ❌ | ❌ | **LARGE** |
| Card-based UI | ✅ | ❌ | ❌ | **LARGE** |
| Multi-phase combat | ✅ | ❌ | ❌ | **LARGE** |
| Momentum mechanics | ✅ | ❌ | ❌ | **LARGE** |
| Rarity tiers | ✅ | ❌ | ❌ | **LARGE** |
| D20 roll outcomes | ✅ | ✅ | ✅ | None |
| Power multipliers | ✅ | ✅ | ✅ | None |

**RECOMMENDATION:** The d20-exec-summary.md is a **future enhancement roadmap**, not current implementation.

---

## 4. Creative Design Recommendations

### 4.1 Simplified Card-Based Stat System

**GOAL:** Easy to learn, fun to use, displays well on cards

**Proposed Split:**

#### SHIP STATS (displayed on unit cards)
```
╔═══════════════════════════════════╗
║  HEAVY CRUISER - PROTOTYPE       ║
╠═══════════════════════════════════╣
║  ⚔️  ATK: 8    🛡️  DEF: 5         ║
║  🔧 HULL: 24   ⚡ SPEED: 3        ║
╠═══════════════════════════════════╣
║  ABILITY: Siege Targeting         ║
║  +2 vs Orbital targets           ║
╚═══════════════════════════════════╝
```

**4 Ship Stats (visible on cards):**
1. **ATK (Attack)** - Offensive power (replaces STR+DEX)
2. **DEF (Defense)** - Defensive rating (visible threshold)
3. **HULL** - Hit points (damage absorption)
4. **SPEED** - Initiative modifier (fast units strike first)

#### BOT PERSONALITY STATS (hidden from player, drives AI)
```
Commander Varkus (Warlord Archetype)
───────────────────────────────────
WIS: 7  - Strategic planning
CHA: 4  - Diplomatic skill
INT: 6  - Tactical adaptation
```

**3 Personality Stats (bot-only, affects decisions):**
1. **WIS (Wisdom)** - Long-term planning, risk assessment
2. **CHA (Charisma)** - Alliance formation, message persuasiveness
3. **INT (Intelligence)** - Tech research speed, counter-play recognition

---

### 4.2 Card Design for Easy Learning

**Visual Hierarchy (top to bottom):**
```
┌─────────────────────────────────┐
│ [ICON] UNIT NAME        [TIER] │  ← Identity
├─────────────────────────────────┤
│ ATK: ██████░░ (8)              │  ← Primary stats
│ DEF: █████░░░ (5)              │     (visual bars!)
│ HULL: 24  SPEED: 3             │
├─────────────────────────────────┤
│ ABILITY: Short description     │  ← Unique power
├─────────────────────────────────┤
│ Cost: 15,000 💰 | Pop: 3 👥    │  ← Build info
└─────────────────────────────────┘
```

**Design Principles:**
- **Visual bars** for ATK/DEF (like Fighting games: Street Fighter)
- **Icons** for quick scanning (⚔️💰👥⚡)
- **Color coding** by tier (Green=Standard, Blue=Prototype, Purple=Singularity)
- **Ability text** always fits on one line

---

### 4.3 Fun Mechanics for Boardgame Feel

#### A) COMBO SYSTEM (Fleet Synergies)
```
Fleet Composition Bonuses:
──────────────────────────
🎯 Balanced Force (4+ unit types)  → +15% power
⚡ Speed Wing (3+ fast units)      → Strike first
🛡️  Defensive Wall (5+ stations)   → 2× DEF bonus
🔥 Overwhelming Force (20+ units)  → Intimidation (enemy morale -1)
```

**Why it's fun:** Players discover combos, cards "talk to each other"

#### B) DRAFT RARITY (like MTG Draft)
```
Turn 1:  Draw 3 Standard cards → keep 1
Turn 20: Draw 2 Prototype cards → keep 1
Turn 50: Draw 1 Singularity card → auto-keep (DRAMATIC!)
```

**Why it's fun:** Anticipation, public reveals create drama

#### C) ROCK-PAPER-SCISSORS LAYER
```
Unit Type Advantages:
──────────────────────
Fighters   → beat Bombers  (+2 ATK)
Bombers    → beat Cruisers (+2 ATK)
Cruisers   → beat Fighters (+2 ATK)
Stations   → beat all when defending (2× DEF)
```

**Why it's fun:** Simple to remember, creates counter-play

---

### 4.4 Bot Reaction System (Makes Cards Feel Alive)

**When Player Drafts a Card:**
```
PLAYER: Drafts "Plasma Torpedoes" (visible to all)
  ↓
BOT WARLORD: "So, you think plasma will save you?
              We'll see about that."
              [Queues Shield Array research]
  ↓
BOT TURTLE:  "Noted. Fortifying defenses."
              [Builds 5 more stations]
```

**Why it's fun:** Cards trigger narrative responses, feel like competitive draft

---

## 5. Recommended Implementation Path

### Phase 1: Card UI (No Stat Changes)
- Display current units as cards
- Show ATK = power multiplier, DEF = 15 (baseline)
- Use existing combat system

### Phase 2: Add Ship Stats (4-stat system)
- Migrate to ATK/DEF/HULL/SPEED
- Update combat resolution to use stats
- Keep backwards compatibility

### Phase 3: Bot Personality Stats
- Add WIS/CHA/INT to bot profiles
- Use for decision-making weights
- Hidden from player (inferred from messages)

### Phase 4: Rarity Tiers
- Add Prototype/Singularity variants
- Draft system at turn milestones
- Bot reactions to drafts

---

## 6. Answers to Your Questions

**Q: How much D20 is in the exec summary vs PRD?**
- **Exec Summary:** Full 6-stat D20 system (unimplemented design)
- **PRD:** Only mentions "D20 roll" for combat outcomes (implemented)
- **Gap:** About 80% of exec summary is NOT in PRD or code

**Q: How much is just combat resolution?**
- **Yes, mostly.** PRD only uses D20 for combat roll outcomes
- The 6-stat framework, cards, phases are NOT implemented

**Q: Where are the personality vs ship stats?**
- **NOT SPLIT YET.** Exec summary has all 6 as ship stats
- You'd need to move WIS/CHA/INT to bot profiles

---

## 7. Next Steps

1. **Decide:** Do you want to implement the full d20-exec-summary.md system?
2. **If yes:** Update PRD with REQ-COMBAT-100 series for stat system
3. **If no:** Archive d20-exec-summary.md as "future expansion concept"
4. **Either way:** Design the card UI to match your vision

**My recommendation:** Start with Phase 1 (card UI) using simplified 4-stat system. Test with players. Expand from there.

---

## Appendix: Stat Comparison Table

| D&D Stat | d20-Exec (Ship) | Proposed Ship | Proposed Bot |
|----------|-----------------|---------------|--------------|
| STR | Hull Integrity | ATK | - |
| DEX | Targeting Systems | ATK | - |
| CON | Reactor Output | HULL | - |
| INT | Computational Core | - | INT (research) |
| WIS | Command Control | SPEED | WIS (strategy) |
| CHA | Doctrine Protocols | - | CHA (diplomacy) |

---

**END AUDIT**
