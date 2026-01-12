# PRD Section 7: Bot System Alignment Review

**Date:** 2026-01-11
**Reviewer:** Claude Code
**Status:** Action Required

---

## Summary

Review of PRD Section 7 (Bot AI System) against the consolidated `BOT-SYSTEM.md` reveals:
- **2 Critical Misalignments** requiring correction
- **5 Missing Requirements** that should be added to PRD
- **3 Requirements** needing detail expansion

---

## Critical Misalignments

### ❌ ISSUE 1: Emotional States List Mismatch

**Location:** REQ-BOT-003 (PRD lines 550-567)

**PRD Currently Says:**
```
Emotional states: Confident, Cautious, Aggressive, Fearful, Vengeful, Neutral
```

**BOT-SYSTEM.md Says:**
```
Emotional states: Confident, Arrogant, Desperate, Vengeful, Fearful, Triumphant
```

**Impact:** Code implementation will not match PRD specification.

**Recommendation:** Update PRD REQ-BOT-003 to match BOT-SYSTEM.md's emotional states, which include mechanical modifiers:
- Confident (+5% decision, -20% alliance, +10% aggression, +10% negotiation)
- Arrogant (-15% decision, -40% alliance, +30% aggression, -30% negotiation)
- Desperate (-10% decision, +40% alliance, -20% aggression, -20% negotiation)
- Vengeful (-5% decision, -30% alliance, +40% aggression, -40% negotiation)
- Fearful (-10% decision, +50% alliance, -30% aggression, +10% negotiation)
- Triumphant (+10% decision, -10% alliance, +20% aggression, -20% negotiation)

---

### ❌ ISSUE 2: Memory Decay System Under-Specified

**Location:** REQ-BOT-004 (PRD lines 569-588)

**PRD Currently Says:**
```
Memory decays by X% per turn
```

**BOT-SYSTEM.md Says:**
```
Events have weight (1-100) and decay resistance levels (LOW, MEDIUM, HIGH)
- Major events resist being "washed away"
- 20% of negative events are permanent scars
- Weighted decay system with event importance
```

**Impact:** PRD doesn't capture the sophisticated memory system's behavior.

**Recommendation:** Expand REQ-BOT-004 with decay resistance details and permanent scar mechanic.

---

## Missing Requirements (Should Be Added)

### 🔵 MISSING 1: LLM System Integration

**BOT-SYSTEM.md Details:**
- LLM provider chain (Groq → Together → OpenAI)
- System prompt template for Tier 1 bots
- Response schema (JSON format with reasoning, actions, messages, coalition)
- Rate limits (5000 calls/game, 50 calls/turn, 500 calls/hour, $50/day max)

**Recommendation:** Add **REQ-BOT-006: LLM Integration** covering provider abstraction and rate limiting.

---

### 🔵 MISSING 2: Decision Logging System

**BOT-SYSTEM.md Details:**
- All bot decisions logged with reasoning
- Pre-decision state captured (resources, military, relationships, emotion)
- LLM responses stored for debugging
- Player access in post-game analysis ("God Mode" view)

**Recommendation:** Add **REQ-BOT-007: Decision Audit System** for transparency and debugging.

---

### 🔵 MISSING 3: Coalition Behavior

**BOT-SYSTEM.md Details:**
- Coalition formation logic (when/why bots form alliances)
- Coalition chat examples (defensive coordination, attack planning)
- Betrayal mechanics (Schemer always betrays after 20 turns)
- Leave conditions

**Recommendation:** Add **REQ-BOT-008: Coalition AI Behavior** (or move to Section 8: Diplomacy).

---

### 🔵 MISSING 4: Player Readability (Telegraph System)

**BOT-SYSTEM.md Details:**
- Each archetype has different telegraph patterns
- Warlord: 70% telegraph, 2-3 turns advance warning
- Diplomat: 80% telegraph, 3-5 turns advance warning
- Schemer: 30% telegraph, 1 turn (cryptic/inverted)
- Turtle: 90% telegraph, 5+ turns advance warning

**Recommendation:** Add **REQ-BOT-009: Behavioral Telegraphing** for player readability.

---

### 🔵 MISSING 5: Endgame Escalation

**BOT-SYSTEM.md Details:**
- Turn 150+: Increased aggression across all archetypes
- Leader at 50% dominance: Defensive coalitions form automatically
- Last 3 empires: Maximum drama in communications
- Tier 1 LLM bots: Generate dramatic monologues

**Recommendation:** Add **REQ-BOT-010: Endgame Behavior** covering escalation mechanics.

---

## Requirements Needing Expansion

### 📝 EXPAND 1: REQ-BOT-002 - Archetype Details

**Current:** Lists 8 archetypes with brief descriptions.

**BOT-SYSTEM.md Adds:**
- Passive abilities (e.g., Warlord: War Economy -20% military cost when at war)
- Decision priority matrix (numeric weights for each action type per archetype)
- Speaking style and message examples per archetype

**Recommendation:** Add archetype passive abilities to REQ-BOT-002 or create separate requirement.

---

### 📝 EXPAND 2: REQ-BOT-001 - Tier Distribution

**Current:** Lists tier counts (5-10, 20-25, 50-60, 10-15).

**BOT-SYSTEM.md Adds:**
- Tier 1: Async processing during player turn, falls back to scripted on API failure
- Tier 2: Template-based messages (30-45 per persona)
- Tier 3: Subtypes (Balanced, Reactive, Builder)
- Tier 4: Intentionally suboptimal choices for baseline challenge

**Recommendation:** Add tier-specific behaviors to REQ-BOT-001.

---

### 📝 EXPAND 3: REQ-BOT-005 - Persona Structure

**Current:** Simply states "100 unique personas".

**BOT-SYSTEM.md Adds:**
```typescript
interface BotPersona {
  id: string;
  name: string;
  archetype: Archetype;
  voice: {
    tone: string;
    quirks: string[];
    vocabulary: string[];
    catchphrase?: string;
  };
  templates: {
    greeting: string[];
    battleTaunt: string[];
    victoryGloat: string[];
    defeat: string[];
    tradeOffer: string[];
    allianceProposal: string[];
    betrayal: string[];
  };
  usedPhrases: Set<string>;  // Prevent repetition
}
```

**Recommendation:** Add persona structure specification to REQ-BOT-005.

---

## Additional Observations

### ✅ ALIGNED CORRECTLY

These requirements are correctly aligned:
- **REQ-BOT-001:** Four-tier distribution matches (5-10, 20-25, 50-60, 10-15)
- **REQ-BOT-002:** Eight archetypes match exactly
- **REQ-BOT-005:** 100 personas count matches

---

## Implementation Phases (Reference Only)

BOT-SYSTEM.md includes implementation phases (M12-M16) that don't need PRD requirements but should be cross-referenced:
- **M12:** Foundation (Tier 4 random bots) - COMPLETE
- **M13:** Strategic Bots (Tier 2-3)
- **M14:** LLM Integration (Tier 1)
- **M15:** Memory & Emotion systems
- **M16:** Polish & balance

---

## Recommended Actions

### Priority 1: Critical Fixes
1. ✏️ Fix REQ-BOT-003 emotional states list (CRITICAL)
2. ✏️ Expand REQ-BOT-004 memory decay system details (HIGH)

### Priority 2: Add Missing Requirements
3. ➕ Add REQ-BOT-006: LLM Integration
4. ➕ Add REQ-BOT-007: Decision Audit System
5. ➕ Add REQ-BOT-008: Coalition AI Behavior
6. ➕ Add REQ-BOT-009: Behavioral Telegraphing
7. ➕ Add REQ-BOT-010: Endgame Behavior

### Priority 3: Expand Existing Requirements
8. 📝 Expand REQ-BOT-001 with tier-specific behaviors
9. 📝 Expand REQ-BOT-002 with passive abilities
10. 📝 Expand REQ-BOT-005 with persona structure

---

## Cross-Reference Updates Needed

After updating Section 7, ensure these sections reference bot system correctly:
- **Section 2 (Turn Processing):** REQ-TURN-001 Phase 9 "Bot Decisions" should reference REQ-BOT-006
- **Section 8 (Diplomacy):** Coalition system should reference REQ-BOT-008
- **Section 12 (Victory):** Endgame behavior should reference REQ-BOT-010

---

## Conclusion

The consolidated BOT-SYSTEM.md is significantly more detailed than PRD Section 7. The PRD should be updated to:
1. **Fix critical misalignments** (emotional states, memory decay)
2. **Add 5 new requirements** for missing systems
3. **Expand 3 existing requirements** with implementation details

This will ensure the PRD remains the single source of truth and matches the actual bot system design.

---

**Next Steps:**
- [ ] Review this document
- [ ] Approve recommended changes
- [ ] Update PRD Section 7
- [ ] Validate updated requirements against code
