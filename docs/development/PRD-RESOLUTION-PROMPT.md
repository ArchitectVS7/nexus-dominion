# PRD Critical Issues Resolution Prompt

**Use this prompt in a new Claude session to resolve blocking PRD contradictions.**

---

## Context

The PRD v1.4 (docs/PRD.md) has two CRITICAL blocking issues that prevent development from starting:

1. **Expansion Status Contradiction**: Tech Wars (Section 14) and Syndicate (Section 15) are labeled "expansion" but contain full specifications as if they're core game features
2. **Combat System Contradiction**: The combat system claims both "unified D20 resolution" AND "three sequential domains" which are architecturally incompatible

These must be resolved before handing the PRD to the programming team.

---

## Your Task

Resolve these two critical contradictions in the PRD with clear design decisions and documentation updates.

---

## ISSUE 1: Expansion Status Contradiction

### Current State

**Section 14 (Line ~1770):**
```markdown
## 14. Expansion: Tech Wars (Crafting Replacement)
```
- Contains 9 fully-specified requirements (REQ-TECH-001 through 009)
- Includes 40-card catalog with specific mechanics
- Status marked "Draft - Expansion content only"

**Section 15 (Line ~1985):**
```markdown
## 15. The Galactic Syndicate System
```
- Contains 12 fully-specified requirements (REQ-SYND-001 through 012)
- Includes 14 contract types, loyalty system, accusation trials
- Status marked "Core Game Feature (post-Beta-1)"

### The Problem

21 requirements (26% of PRD) are fully specified but labeled "expansion." This creates confusion:
- Should developers implement these for MVP or Phase 2?
- Are these features required for core game loop or optional post-launch?
- Why are they fully specified if they're expansions?

### What I Need From You

**Make a clear design decision for EACH system:**

**Option A: Mark as CORE**
- If these systems are essential to the core game experience
- Update section headers to remove "Expansion" label
- Update requirement Status from "Draft - Expansion content only" to "Draft"
- Move to appropriate section numbers (keep 14/15 or renumber)

**Option B: Mark as POST-LAUNCH**
- If these systems can be added after initial release
- Move to separate document: `docs/PRD-v2-EXPANSIONS.md`
- Update main PRD to reference future expansion
- Add "Coming in Phase 2" notices

**Option C: Mark as OPTIONAL CORE**
- If these systems enhance but aren't required for MVP
- Add section: "11.5 Optional Systems" or similar
- Clearly mark as "Build if time allows, not MVP-blocking"
- Define minimum viable version vs. full version

### Deliverables

1. **Design Decision Document** (`docs/decisions/EXPANSION-STATUS-DECISION.md`):
   ```markdown
   # Expansion Status Resolution

   **Decision Date:** [Today's date]
   **Decision:** [A/B/C chosen]

   ## Tech Wars (Crafting System)
   **Status:** [Core / Post-Launch / Optional Core]
   **Rationale:** [Why this decision]
   **Implementation Priority:** [MVP / Phase 2 / Optional]

   ## Syndicate System
   **Status:** [Core / Post-Launch / Optional Core]
   **Rationale:** [Why this decision]
   **Implementation Priority:** [MVP / Phase 2 / Optional]

   ## Impact on PRD
   - Section 14 will be: [updated to... / moved to... / marked as...]
   - Section 15 will be: [updated to... / moved to... / marked as...]
   ```

2. **Updated PRD Sections**: Make the actual changes to `docs/PRD.md`:
   - Update section headers (remove "Expansion:" if core)
   - Update requirement Status fields consistently
   - Add implementation priority notes if needed

3. **Updated Section Numbering Table** (PRD lines 30-50):
   ```markdown
   | Section | System | Status |
   |---------|--------|--------|
   | 14 | Tech Wars | Core / Expansion / Optional |
   | 15 | Syndicate | Core / Expansion / Optional |
   ```

---

## ISSUE 2: Combat System Architectural Contradiction

### Current State

**REQ-COMBAT-001 (Lines ~181-195):**
```markdown
**Description:** All combat is resolved with a single D20 roll using unified
resolution mechanics, not sequential phase-based combat.
```

**REQ-COMBAT-009 (Lines ~321-345):**
```markdown
**Description:** Full Invasions resolve combat across three sequential domains:
1. SPACE BATTLE: Winner gains +2 bonus to Orbital and Ground domains
2. ORBITAL BATTLE: Winner gains +2 bonus to Ground domain
3. GROUND BATTLE: Winner captures 5-15% of defender's sectors
```

### The Problem

These are **architecturally incompatible**:
- "Unified resolution" = ONE d20 roll determines entire outcome
- "Three sequential domains" = THREE separate battles with cascading bonuses

Developers cannot implement both. They need to know which is canonical.

### What I Need From You

**Choose ONE of these resolutions:**

**Option A: True Unified System**
- One d20 roll determines combat outcome across all domains simultaneously
- Remove sequential domain mechanics (REQ-COMBAT-009)
- Explain: Cross-domain bonuses are conceptual (fleet composition affects single roll)
- Clarify: "Multi-domain" means considering fleet composition, not separate battles

**Option B: Sequential Domain System**
- Three separate d20 rolls (Space → Orbital → Ground)
- Remove "unified resolution" claim (REQ-COMBAT-001)
- Explain: "Unified" meant "same D20 mechanics per domain," not "single roll"
- Clarify: Each domain is resolved separately with bonuses cascading

**Option C: Hybrid System**
- Initial unified roll determines battle flow
- Sequential domains resolve only if initial roll is contested
- Example: d20 roll determines if battle goes to multiple domains or resolves immediately
- Clarify: "Unified" for simple battles, "Sequential" for full invasions

### Deliverables

1. **Combat System Resolution Document** (`docs/design/COMBAT-SYSTEM-RESOLUTION.md`):
   ```markdown
   # Combat System Architecture Resolution

   **Decision Date:** [Today's date]
   **Decision:** [Option A/B/C]

   ## The Core Mechanic
   [Describe how combat actually works - be specific]

   ## Roll Sequence
   [Step-by-step: What rolls happen, in what order, with what bonuses]

   ## Example Combat
   [Worked example showing:
   - Initial state (attacker fleet, defender fleet)
   - Each roll made
   - How bonuses apply
   - Final outcome]

   ## REQ-COMBAT-001 Revised Language
   [Provide new requirement text that's unambiguous]

   ## REQ-COMBAT-009 Status
   [Keep as-is / Revise language / Deprecate and replace]
   ```

2. **Updated PRD Requirements**: Update `docs/PRD.md` with:
   - **REQ-COMBAT-001:** Revised description that doesn't contradict chosen system
   - **REQ-COMBAT-009:** Either revised to align or deprecated
   - **REQ-COMBAT-NEW (if needed):** New requirement capturing the true architecture

3. **D20 Combat Formula** (this is also missing from PRD):
   ```markdown
   ## Combat Resolution Formula

   **[Chosen System] Resolution:**

   ```
   [Provide actual formula, not just concept]

   Example:
   Attacker Roll: d20 + AttackerPower + Bonuses
   Defender Roll: d20 + DefenderPower + Bonuses

   If Attacker Roll > Defender Roll + 10: Decisive Victory
   If Attacker Roll > Defender Roll + 5: Victory
   If Attacker Roll > Defender Roll: Pyrrhic Victory
   [etc.]
   ```
   ```

---

## Success Criteria

Your resolution is complete when:

### For Issue 1 (Expansion Status):
- [ ] Clear decision made: Core / Post-Launch / Optional for BOTH systems
- [ ] `docs/decisions/EXPANSION-STATUS-DECISION.md` created with rationale
- [ ] PRD Section 14 header updated (removed "Expansion:" if core)
- [ ] PRD Section 15 header updated consistently
- [ ] All REQ-TECH-XXX Status fields updated (removed "Expansion content only" if core)
- [ ] All REQ-SYND-XXX Status fields updated consistently
- [ ] Section numbering table updated (lines 30-50)

### For Issue 2 (Combat Contradiction):
- [ ] Clear decision made: Unified / Sequential / Hybrid
- [ ] `docs/design/COMBAT-SYSTEM-RESOLUTION.md` created with worked example
- [ ] REQ-COMBAT-001 description revised to be unambiguous
- [ ] REQ-COMBAT-009 revised or deprecated
- [ ] D20 combat formula provided (not just concept, actual math)
- [ ] Example combat walkthrough provided
- [ ] No contradictions remain between combat requirements

---

## Files to Read

Before starting, read these files to understand context:

1. **Current PRD**: `docs/PRD.md` (focus on lines 181-195, 321-376, 1770-1890, 1985-2100)
2. **Combat System Spec**: `docs/design/COMBAT-SYSTEM.md` (Section 4.1-4.5)
3. **Syndicate System Spec**: `docs/design/SYNDICATE-SYSTEM.md` (full document)
4. **Crafting System Spec**: `docs/design/CRAFTING-SYSTEM.md` (full document)
5. **Systems Analysis**: `docs/development/SYSTEMS-ANALYSIS.md` (for dependency context)

---

## Output Format

Provide your resolution in this order:

1. **Executive Summary** (2-3 sentences per issue stating your decision)
2. **Issue 1 Resolution** (Expansion Status Decision Document content)
3. **Issue 2 Resolution** (Combat System Resolution Document content)
4. **PRD Updates** (Specific line edits to make in docs/PRD.md)
5. **Validation** (Confirm no new contradictions introduced)

---

## Important Notes

- **Be decisive**: Don't hedge with "maybe" or "it depends" - make clear architectural choices
- **Be specific**: Provide actual formulas, not concepts
- **Be consistent**: Ensure all related requirements align with your decision
- **Think about developers**: They need to implement this - give them clarity
- **Consider testing**: How will QA validate your chosen architecture?

---

## End of Prompt

Use this prompt as-is in a new Claude session. The AI will have full context to resolve both issues with concrete deliverables.
