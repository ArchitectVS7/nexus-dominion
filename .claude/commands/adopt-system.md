---
argument-hint: [SYSTEM-NAME] (e.g., COMBAT, MARKET, BOT)
description: Adopt a legacy game system doc from docs/other/ into a new canonical design doc in docs/systems/. PRD and VISION are authoritative; the old doc is inspirational. Usage: /adopt-system COMBAT
---

# System Adoption Workflow

Migrate a legacy game system document into the new canonical design format, resolving conflicts against the PRD and VISION, applying in-world terminology, and stripping premature implementation content.

## Parameters

- **System name**: `$ARGUMENTS` (e.g., `COMBAT`, `MARKET`, `BOT`)

## Derived Paths

- **Legacy main doc**: `docs/other/Game Systems/$ARGUMENTS-SYSTEM.md`
- **Legacy appendix** (may not exist): `docs/other/Game Systems/appendix/$ARGUMENTS-SYSTEM-APPENDIX.md`
- **Output**: `docs/systems/$ARGUMENTS-SYSTEM.md`
- **Authoritative PRD**: `docs/prd.md`
- **Authoritative Vision**: `docs/VISION.md`
- **Format reference**: `docs/systems/DIPLOMACY-SYSTEM.md`

## Pre-Flight Checks

Current directory: !`pwd`
Legacy doc exists: !`test -f "docs/other/Game Systems/$ARGUMENTS-SYSTEM.md" && echo "✓ Found" || echo "✗ Not found — check system name"`
Legacy appendix: !`test -f "docs/other/Game Systems/appendix/$ARGUMENTS-SYSTEM-APPENDIX.md" && echo "✓ Appendix found" || echo "— No appendix"`
Output path clear: !`test -f "docs/systems/$ARGUMENTS-SYSTEM.md" && echo "⚠ Output already exists — will overwrite" || echo "✓ Clear"`
Format reference: !`test -f "docs/systems/DIPLOMACY-SYSTEM.md" && echo "✓ Found" || echo "✗ Missing — format reference unavailable"`

---

## Step 1: Source Analysis

### 1.1 Read Legacy Documents

Read the legacy main doc completely. If an appendix exists, read it and determine what type of content it contains:

| Appendix Content Type | Action |
|----------------------|--------|
| Implementation code (TypeScript, SQL, etc.) | Discard — premature for design phase |
| Design formulas, probability tables, data tables | Evaluate — keep if design-relevant |
| Extended examples, edge case tables | Keep if they inform design decisions |

### 1.2 Classify Legacy Content by Category

Go through the legacy doc section by section and classify each piece of content:

| Classification | Meaning | Action |
|---------------|---------|--------|
| **KEEP** | Design concept is sound and compatible with current vision | Port to new doc, rename terminology |
| **UPDATE** | Good design, but uses old terminology or old structural assumptions | Port with corrections |
| **CONFLICT** | Contradicts a PRD or VISION decision | Flag — PRD wins |
| **PREMATURE** | Implementation detail, code, REQ spec, DB schema, file path | Drop — design phase only |
| **GAP** | Something the new design needs that the old doc doesn't cover | Add new content |

### 1.3 Identify Terminology Violations

Flag every instance of legacy terminology that must be updated in the new doc:

| Legacy Term | Correct Term | Source |
|-------------|-------------|--------|
| Turn | Cycle | PRD §1 |
| 10 turns | Confluence | PRD §1 |
| End Turn | [Cycle commit action] | PRD §1 |
| Sector (owned territory) | Star System | PRD §2 |
| 6 victory conditions | 9 achievement paths | PRD §10 |
| Win condition | Achievement trigger | VISION.md |
| Turn Processor | Cycle Processor | PRD §Architecture |
| Planets / Colonies | Star Systems | PRD §2 |
| TurnNumber | CycleNumber | PRD §Architecture |
| Coalition mechanic | Nexus Compact | DIPLOMACY-SYSTEM.md |
| NAP / Alliance | Stillness Accord / Star Covenant | DIPLOMACY-SYSTEM.md |

If you encounter other terminology mismatches not in this table, document them and apply the same pattern: find the in-world equivalent from the PRD or VISION.

### 1.4 Read Authoritative Sources

Before generating the conflict report, read the relevant sections of `docs/prd.md` and `docs/VISION.md` for the system being adopted. Specifically:
- Find the PRD section(s) that govern this system
- Note any design decisions already locked down in the PRD
- Note any open questions in the PRD that this system doc should help answer

### 1.5 Source Analysis Report

Output a structured report:

```
SOURCE ANALYSIS: [SYSTEM-NAME]
===============================
Legacy doc length: [N] lines
Appendix: [found / not found] — [content type if found]

CONTENT CLASSIFICATION:
  KEEP: [N items]
  UPDATE: [N items — list top 3]
  CONFLICT: [N items — list all]
  PREMATURE: [N items]
  GAP: [N items — list all]

TERMINOLOGY VIOLATIONS: [N]
  [List each legacy term found]

PRD SECTION: [Reference to relevant PRD section]
KEY PRD CONSTRAINTS FOUND:
  - [Constraint 1]
  - [Constraint 2]

OPEN QUESTIONS SURFACED:
  - [Question 1]
  - [Question 2]

READY TO PROCEED: [YES / NO — if NO, explain blocker]
```

**Pause here. Show report to user. Wait for confirmation before proceeding to Step 2.**

---

## Step 2: Conflict Resolution

### 2.1 State Every Conflict Explicitly

For each CONFLICT item identified, state:

```
CONFLICT: [Brief title]
Legacy says: [What the old doc specifies]
PRD/VISION says: [What the authoritative source says]
Resolution: PRD wins — [how this will be handled in the new doc]
```

### 2.2 State Every Gap Explicitly

For each GAP (new content needed), state:

```
GAP: [Brief title]
What's needed: [Description of missing design]
Proposed approach: [How to fill this gap]
Decision needed from user: [YES if user input required, NO if can proceed from context]
```

### 2.3 Surface Open Questions

List all questions the user must decide before or during writing. Format:

```
OPEN QUESTION [N]: [Question]
Context: [Why this matters for the system]
Options:
  A) [Option A and its implications]
  B) [Option B and its implications]
Recommendation: [Your recommendation if you have one]
```

**Pause here. Show conflicts, gaps, and open questions. Wait for user direction before writing.**

---

## Step 3: Write the Canonical Document

### 3.1 Document Standards

The new document must conform to the format established in `docs/systems/DIPLOMACY-SYSTEM.md`. Key rules:

**MUST**:
- Use in-world terminology throughout (no bare mechanical labels)
- Reference the PRD section it corresponds to
- State what legacy doc it supersedes
- Include an Open Questions section for unresolved design questions
- Use the status header format: `Active — Design Reference`

**MUST NOT**:
- Contain TypeScript, SQL, or other implementation code
- Contain REQ-XXX specification IDs (these belong in implementation phase)
- Contain implementation file paths (`src/lib/...`)
- Contain DB schema definitions
- Contain migration plans or rollback procedures
- Reference `PRD-EXECUTIVE.md` (old document — use `docs/prd.md`)

**DOCUMENT STRUCTURE** (adapt sections as needed for the system):

```markdown
# [System Name]

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** [Date]
> **Last Updated:** [Date]
> **PRD Reference:** `docs/prd.md` § [Section]
> **Supersedes:** `docs/other/Game Systems/[SYSTEM-NAME].md`

---

## Document Purpose
[What this doc defines, who reads it, design philosophy bullet points]

---

## Table of Contents
1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [Mechanics](#3-mechanics) ← rename as appropriate
4. [Bot Behaviour](#4-bot-behaviour) ← include if bots interact with this system
5. [UI and Player Experience](#5-ui-and-player-experience)
6. [Balance Targets](#6-balance-targets)
7. [Open Questions](#7-open-questions)
8. [Revision History](#8-revision-history)

---
```

Section numbering is flexible — add or remove sections as the system requires. Always include In-World Framing, Core Concept, and Open Questions.

### 3.2 In-World Framing Section

This section must:
- Give the system's mechanic an in-world name or explanation
- Tie it to The Nexus, the Galactic Commons, or another in-world institution as appropriate
- Include a terminology table mapping in-world names to plain descriptions

### 3.3 Core Concept Section

This section must:
- Explain what the system does in plain terms
- Describe the player experience (what they see and feel)
- State any structural architecture decisions (e.g., two-tier pipeline) with rationale

### 3.4 Preserve Good Rationale

When the old doc explains WHY a decision was made — preserve that reasoning. Design rationale is valuable. It's the implementation artifacts (code, schemas, specs) that must be stripped.

### 3.5 Do Not Over-Specify

Design docs in `docs/systems/` define **what and why**, not **how**. Avoid:
- Exact database column names
- Function signatures
- Performance benchmarks tied to specific infrastructure
- Hardcoded constants that should be tuning targets (mark these as "tuning target")

Performance targets (e.g., "<2 seconds") are acceptable as design intent, not implementation contracts.

---

## Step 4: Validation

### 4.1 Terminology Check

Search the new document for legacy terms:

!`grep -n "turn\b\|Turn\b" docs/systems/$ARGUMENTS-SYSTEM.md | grep -v "Confluence\|Cycle\|Return\|Pattern" | head -20`
!`grep -n "\bsector\b\|\bSector\b" docs/systems/$ARGUMENTS-SYSTEM.md | grep -v "Star System\|cross-sector" | head -20`
!`grep -n "REQ-\|src/\|\.ts\b\|\.sql\b" docs/systems/$ARGUMENTS-SYSTEM.md | head -20`

Fix any violations found.

### 4.2 PRD Consistency Check

Verify the new document:
- [ ] Does not contradict any PRD requirement
- [ ] References the correct PRD section in its header
- [ ] Uses Cycle/Confluence/Nexus Reckoning consistently
- [ ] Uses Star System (not sector/planet) for owned territory
- [ ] Mentions 9 achievement paths (not 6 victory conditions) if relevant

### 4.3 Format Consistency Check

- [ ] Status header matches DIPLOMACY-SYSTEM.md format
- [ ] Supersedes field is accurate
- [ ] Table of Contents links work
- [ ] Open Questions section exists with at least a placeholder
- [ ] No implementation code present
- [ ] Design philosophy stated in Document Purpose

### 4.4 Appendix Decision

**Create a design appendix only if:**
- The system has extensive data tables (probability distributions, formulas with derivations, archetype behaviour matrices) that would make the main doc unwieldy
- The appendix content is design data, not implementation code

**Do NOT create an appendix for:**
- Code examples (not yet — implementation phase)
- Database schemas
- Extended REQ-spec tables

If an appendix is warranted, create it at `docs/systems/appendix/[SYSTEM-NAME]-APPENDIX.md`.

### 4.5 Validation Report

```
VALIDATION: [SYSTEM-NAME]
==========================
Terminology violations: [N] (0 = pass)
PRD consistency: [PASS / issues found]
Format consistency: [PASS / issues found]
Implementation content: [NONE / found — list]
Appendix: [Created / Not needed]

STATUS: [READY FOR REVIEW / NEEDS FIXES]
```

---

## Step 5: Summary

Output a migration summary:

```
ADOPTION COMPLETE: [SYSTEM-NAME]
==================================
Output: docs/systems/[SYSTEM-NAME].md
Supersedes: docs/other/Game Systems/[SYSTEM-NAME].md

What was kept: [N sections — brief list]
What was updated: [N items — brief list]
What was dropped: [N items — brief list]
New content added: [N items — brief list]

Open questions surfaced: [N — brief list]
Decisions made: [N — brief list]

Appendix created: [YES / NO]
```

---

## Rules and Constraints

1. **PRD wins every conflict.** No exceptions. If the old doc disagrees with the PRD, the old doc is wrong.
2. **Design phase only.** No implementation code, no REQ specs, no file paths.
3. **In-world names always.** If a mechanic doesn't have an in-world name yet, propose one and mark it as a decision in Open Questions.
4. **Surface, don't decide.** If a design question is genuinely unresolved, put it in Open Questions. Don't silently pick an answer.
5. **Preserve rationale.** Why decisions were made is as valuable as what was decided. Keep the reasoning.
6. **No documentation overload.** Appendix only for design data that would bloat the main doc. Never create an appendix just because the old doc had one.
7. **Pause at Step 1 and Step 2.** User confirmation required before writing. Never skip straight to drafting.

---

**Version:** 1.0
**Created:** 2026-03-08
**For:** Nexus Dominion — Design Canon Migration
