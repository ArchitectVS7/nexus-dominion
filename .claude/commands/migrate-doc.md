---
argument-hint: [draft-file-path]
description: Migrate a draft document to the GAME-SYSTEM-TEMPLATE.md format with full spec extraction. Usage: /migrate-doc docs/draft/MILITARY-SYSTEM.md
---

# Document Migration Workflow

Systematically migrate draft game design documents to the standardized template format with code extraction, specification writing, and quality validation.

## Parameters

- **Draft File**: `$1` (e.g., `docs/draft/MILITARY-SYSTEM.md`)

## Pre-Flight Checks

Current working directory: !`pwd`
Target draft exists: !`test -f "$1" && echo "✓ Found" || echo "✗ Not found"`
Template exists: !`test -f "docs/development/GAME-SYSTEM-TEMPLATE.md" && echo "✓ Found" || echo "✗ Not found"`

## Workflow Overview

This skill guides through a 6-step process to migrate each document:

1. **Content Audit** - Analyze the draft and plan migration
2. **Structure Alignment** - Apply template and migrate content
3. **Code Extraction** - Move code examples to appendix
4. **Specification Writing** - Convert design to formal specs
5. **Fill Missing Sections** - Add Bot Integration, UI/UX, Balance
6. **Quality Check** - Validate completeness and consistency

---

## Step 1: Content Audit (15-30 min)

### 1.1 Read Draft Document

Read the entire draft document to understand:
- Core concepts and mechanics
- Existing structure and organization
- Design decisions and rationale
- Code examples present
- Cross-references to other systems

**Action**: Read `$1` completely

### 1.2 System Classification

Determine the system type and complexity:

| System Type | Target Length | Specs Expected |
|-------------|---------------|----------------|
| **Core (Combat, Economy)** | 800-1200 lines | 10-15 specs |
| **Major Feature (Syndicate, Research)** | 600-900 lines | 8-12 specs |
| **Bot/AI System** | 700-900 lines | 8-10 specs |
| **Minor Feature** | 300-500 lines | 3-6 specs |

**Determine**:
- System name: `[SYSTEM-NAME]`
- System type: `[Core|Major|Minor]`
- Spec prefix: `REQ-[XXX]` (e.g., REQ-MIL, REQ-RES, REQ-DIP)

### 1.3 Content Mapping

Create a mapping table of draft sections to template sections:

| Draft Section | Template Section | Notes |
|---------------|------------------|-------|
| [Section name] | 1. Core Concept | [Migration notes] |
| [Section name] | 2. Mechanics Overview | [Migration notes] |
| [Section name] | 3. Detailed Rules | [Migration notes] |

### 1.4 Extraction Planning

**Flag for Appendix** (code examples > 20 lines):
- [ ] List all code blocks that need extraction
- [ ] List all formula derivations that need extraction
- [ ] List all extensive tables (> 50 rows) that need extraction

**Missing Content** (to be created):
- [ ] Bot Integration section needed?
- [ ] UI/UX Design section needed?
- [ ] Balance Targets section needed?
- [ ] Migration Plan section needed?

**Cross-References** (to validate):
- [ ] List all references to other design docs
- [ ] List all references to implementation files
- [ ] List all references to PRD-EXECUTIVE.md

### 1.5 Audit Summary

Report findings:
```
CONTENT AUDIT COMPLETE
======================
System: [SYSTEM-NAME]
Type: [Core|Major|Minor]
Spec Prefix: REQ-[XXX]
Draft Length: [N] lines
Target Length: [N]-[N] lines
Code Blocks: [N] to extract
Missing Sections: [list]
Cross-References: [N] to validate
Ready for migration: [YES/NO]
```

**Pause for user confirmation before proceeding to Step 2.**

---

## Step 2: Structure Alignment (30-60 min)

### 2.1 Create Output File

**Action**: Determine output path:
- Input: `docs/draft/[SYSTEM-NAME].md`
- Output: `docs/design/[SYSTEM-NAME].md`

If output file already exists:
- [ ] Ask user: "File exists. Overwrite, merge, or abort?"

### 2.2 Initialize from Template

**Action**: Read `docs/development/GAME-SYSTEM-TEMPLATE.md` as base structure

### 2.3 Fill Metadata

Complete the front matter:

```markdown
# [System Name]

**Version:** 1.0
**Status:** FOR IMPLEMENTATION
**Spec Prefix:** REQ-[XXX]
**Created:** [Today's date YYYY-MM-DD]
**Last Updated:** [Today's date YYYY-MM-DD]
**Replaces:** [Draft file name, if applicable]
```

### 2.4 Write Document Purpose

Write 2-3 paragraphs explaining:
- What this document defines
- Who should read it
- What decisions it resolves

Extract from draft introduction if available.

### 2.5 Define Design Philosophy

Create 4-6 bullet points of core principles:
- Extract from draft if stated
- Infer from design decisions if not explicit
- Ensure alignment with PRD-EXECUTIVE.md principles

### 2.6 Migrate Core Content

Systematically migrate content section by section:

**Section 1: Core Concept**
- 1.1 Primary Subsystem - Main mechanic explanation
- 1.2 Key Mechanic - Core game loop
- 1.3 Player Experience - What it feels like

**Section 2: Mechanics Overview**
- Tables, formulas, core rules
- Keep brief examples (< 20 lines)
- Flag detailed examples for appendix

**Section 3: Detailed Rules**
- 3.1+ Specific rule categories
- Include edge cases
- Provide examples and counterexamples

**Preservation Rule**: Keep all design decisions and rationale. Do not summarize or simplify - migrate faithfully.

### 2.7 Structure Validation

After migration, verify:
- [ ] All template sections present (1-10)
- [ ] Table of contents updated with correct anchors
- [ ] Markdown formatting correct (headers, tables, code blocks)
- [ ] No broken internal links

**Report progress**: "Structure alignment complete. [N]/[N] sections migrated."

---

## Step 3: Code Extraction (30-45 min)

### 3.1 Create Appendix File

**Action**: Create `docs/design/appendix/[SYSTEM-NAME]-APPENDIX.md`

Initialize with:
```markdown
# [System Name] - Appendix

**Parent Document:** [SYSTEM-NAME].md
**Purpose:** Code examples, detailed formulas, and extensive data tables

---

## Table of Contents

1. [Code Examples](#code-examples)
2. [Formula Derivations](#formula-derivations)
3. [Data Tables](#data-tables)

---
```

### 3.2 Extract Code Examples

For each code block > 20 lines in the main document:

1. **Move to appendix** under appropriate section
2. **Add descriptive header** in appendix
3. **Replace in main doc** with brief example + link

**Template for replacement:**
```markdown
Brief example (5-10 lines):
```typescript
// Core concept shown here
```

For complete implementation, see [Appendix A: Code Examples](appendix/[SYSTEM-NAME]-APPENDIX.md#code-examples).
```

### 3.3 Extract Formula Derivations

For complex formulas with multi-step derivations:

1. **Keep final formula** in main document
2. **Move derivation** to appendix
3. **Link to appendix** for details

**Example:**
```markdown
Main doc:
**Damage Formula:**
```
damage = (base_attack * modifiers) - defense
```

For derivation and edge cases, see [Appendix B: Formula Derivations](appendix/[SYSTEM-NAME]-APPENDIX.md#damage-calculation).
```

### 3.4 Extract Extensive Tables

For tables > 50 rows or very wide tables:

1. **Keep summary table** (top 5-10 rows) in main doc
2. **Move full table** to appendix
3. **Link to complete data**

**Example:**
```markdown
Main doc:
| Unit | ATK | DEF | Cost |
|------|-----|-----|------|
| Fighter | 5 | 3 | 100 |
| Bomber | 8 | 2 | 150 |
| ... (5-10 rows) |

For complete unit stats, see [Appendix C: Data Tables](appendix/[SYSTEM-NAME]-APPENDIX.md#unit-stats).
```

### 3.5 Update Cross-References

After extraction, verify:
- [ ] All appendix links work
- [ ] Appendix file has proper anchors
- [ ] No broken references in main doc

**Report**: "Code extraction complete. Appendix created with [N] sections."

---

## Step 4: Specification Writing (45-90 min)

### 4.1 Identify Specifications

Review the migrated content and identify all testable requirements:
- Game mechanics and formulas
- Balance targets and thresholds
- System behaviors and rules
- Data validation rules
- UI/UX requirements

**Guideline**: Every "must", "should", formula, or threshold is a potential spec.

### 4.2 Create Specification Template

For each requirement, create a spec using this format:

```markdown
### REQ-[XXX]-NNN: [Requirement Title]

**Description:** [Clear, testable statement of what must be true]

**Rationale:** [Why this requirement exists - ties to design philosophy]

**Formula:** (if applicable)
```
result = base_value * modifier
```

**Key Values:** (if applicable)
| Parameter | Value | Notes |
|-----------|-------|-------|
| threshold | 0.5 | 50% chance |

**Source:** Section [X.X] - [Section name]

**Code:**
- `src/lib/[system]/[file].ts` - [function or class name]
- `src/app/actions/[system]-actions.ts` - [action name]

**Tests:**
- `src/lib/[system]/__tests__/[file].test.ts` - [test description]

**Status:** Draft
```

### 4.3 Number Sequentially

Number specs sequentially: REQ-[XXX]-001, REQ-[XXX]-002, REQ-[XXX]-003...

**Naming Conventions:**
| System | Prefix |
|--------|--------|
| Combat | REQ-COMBAT |
| Bot AI | REQ-BOT |
| Resources | REQ-RES |
| Sectors | REQ-SEC |
| Military | REQ-MIL |
| Research | REQ-RSCH |
| Diplomacy | REQ-DIP |
| Market | REQ-MKT |
| Victory | REQ-VIC |
| Covert Ops | REQ-COV |
| Progressive | REQ-PROG |

### 4.4 Link Back to Narrative

For each spec:
1. **Reference source section** in the spec (e.g., "Source: Section 3.2")
2. **Add @spec tag** in narrative where the requirement is described

**Example in narrative:**
```markdown
### 3.2 Unit Production Costs

All military units cost 100 credits per power point. <!-- @spec REQ-MIL-001 -->

Fighters cost an additional 50 ore. <!-- @spec REQ-MIL-002 -->
```

### 4.5 Create Specification Summary Table

At the end of Section 6, create:

```markdown
### Specification Summary

| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-[XXX]-001 | [Title] | Draft | TBD |
| REQ-[XXX]-002 | [Title] | Draft | TBD |
| REQ-[XXX]-003 | [Title] | Draft | TBD |
| ... |

**Total Specifications:** [N]
**Implemented:** 0
**Validated:** 0
**Draft:** [N]
```

### 4.6 Validation

Verify specifications:
- [ ] Each spec has unique ID
- [ ] Each spec references source section
- [ ] Each spec has Code and Tests fields (even if "TBD")
- [ ] Each spec has clear, testable Description
- [ ] Numbering is sequential with no gaps
- [ ] Summary table matches individual specs

**Report**: "Specification writing complete. [N] specs created."

---

## Step 5: Fill Missing Sections (30-60 min)

### 5.1 Bot Integration (Section 4)

If the system is used by bots, create:

**4.1 Archetype Behavior**
Table showing how each of the 8 archetypes uses this system:

| Archetype | Behavior | Priority | Example |
|-----------|----------|----------|---------|
| Warlord | [Description] | High | [Example action] |
| Diplomat | [Description] | Medium | [Example action] |
| Merchant | [Description] | Low | [Example action] |
| Schemer | [Description] | High | [Example action] |
| Turtle | [Description] | Medium | [Example action] |
| Blitzkrieg | [Description] | High | [Example action] |
| Tech Rush | [Description] | Low | [Example action] |
| Opportunist | [Description] | Variable | [Example action] |

**4.2 Bot Decision Logic**
Pseudo-code or decision trees showing bot AI:

```
if (archetype == "Warlord" && military_power > threshold):
    prioritize_aggressive_action()
else if (resources_low):
    prioritize_economy()
```

**4.3 Bot Messages**
5-10 message templates with personality:

```markdown
**Warlord declares war:**
"Your territory will be mine, {player_name}. Prepare for battle!"

**Diplomat proposes treaty:**
"Let us end this conflict, {player_name}. I propose a Non-Aggression Pact."

... (5-10 examples)
```

**Skip if**: System is purely mechanical (e.g., formulas) with no bot decision-making.

### 5.2 UI/UX Design (Section 5)

**5.1 UI Mockups**
ASCII art or detailed prose descriptions of interfaces:

```
┌─────────────────────────────────────────┐
│  [System Name] Interface                │
├─────────────────────────────────────────┤
│  Player Resources:                      │
│  Credits: 1,000  Ore: 500  Food: 300    │
│                                         │
│  Available Actions:                     │
│  [ Build Unit ]  [ Research ]  [ Trade ]│
└─────────────────────────────────────────┘
```

**5.2 User Flows**
Step-by-step interaction patterns:

```markdown
**Building a Unit:**
1. Player clicks "Build Unit" button
2. Modal opens with unit selection grid
3. Player selects unit type
4. System validates resources
5. Confirmation dialog: "Build [Unit] for [Cost]?"
6. On confirm: deduct resources, add unit, close modal
7. Show success notification
```

**5.3 Visual Design Principles**
- Color coding (e.g., green for positive, red for negative)
- Icon selection
- LCARS-inspired styling (if applicable)
- Responsive behavior

### 5.3 Balance Targets (Section 8)

**8.1 Quantitative Targets**

| Metric | Target | Tolerance | Measurement Method |
|--------|--------|-----------|-------------------|
| [Metric 1] | X | ±Y% | [How to measure] |
| [Metric 2] | X | ±Y% | [How to measure] |

**Examples:**
- "Attacker win rate: 47.6% ±2%"
- "Average game length: 1-2 hours"
- "Resource balance: No resource > 40% of total value"

**8.2 Simulation Requirements**

If applicable:
```
Monte Carlo: 10,000 iterations
Variables: [controlled variables]
Success Criteria: [target within tolerance]
```

**8.3 Playtest Checklist**

- [ ] [Scenario 1]: Expected outcome achieved
- [ ] [Scenario 2]: Edge case handled correctly
- [ ] [Scenario 3]: Player experience feels right
- [ ] [Add 5-10 testable scenarios]

### 5.4 Migration Plan (Section 9)

**9.1 From Current State**

| Current | Target | Migration Steps |
|---------|--------|-----------------|
| [What exists now] | [What should exist] | [How to get there] |

**9.2 Data Migration**

If database changes required:
```sql
-- Migration: [description]
-- Safe to run: [yes/no, why]

ALTER TABLE [table] ADD COLUMN [column] [type];
UPDATE [table] SET [column] = [value] WHERE [condition];
```

**9.3 Rollback Plan**

Describe how to revert if something goes wrong.

### 5.5 Conclusion (Section 10)

**Key Decisions:**
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]
- [Decision 3]: [Rationale]

**Open Questions:**
- [Question 1]: [Context, options being considered]
- [Question 2]: [Context, options being considered]

**Dependencies:**
- **Depends On:** [List systems this depends on]
- **Depended By:** [List systems that depend on this]

**Report**: "Missing sections filled. Document is now complete."

---

## Step 6: Quality Check (15-30 min)

### 6.1 Template Completeness

Verify all sections present:

- [ ] Document Purpose (with Design Philosophy)
- [ ] Table of Contents (with working anchors)
- [ ] 1. Core Concept (3 subsections)
- [ ] 2. Mechanics Overview
- [ ] 3. Detailed Rules (multiple subsections)
- [ ] 4. Bot Integration (if applicable)
- [ ] 5. UI/UX Design
- [ ] 6. Specifications (with summary table)
- [ ] 7. Implementation Requirements (DB, Service, Actions, UI)
- [ ] 8. Balance Targets
- [ ] 9. Migration Plan
- [ ] 10. Conclusion

### 6.2 Content Quality

- [ ] No placeholder text ([FILL THIS IN], [TBD])
- [ ] No unresolved DEV NOTEs or TODO comments
- [ ] All design questions answered
- [ ] No conflicting information
- [ ] Consistent terminology throughout

### 6.3 Specification Integrity

- [ ] All specs have unique IDs (REQ-[XXX]-NNN)
- [ ] Numbering is sequential (no gaps)
- [ ] Each spec has: Description, Rationale, Source, Code, Tests, Status
- [ ] Summary table matches individual specs
- [ ] @spec tags in narrative where appropriate

### 6.4 Cross-References

- [ ] All internal links work (Table of Contents, section references)
- [ ] All appendix links work
- [ ] All references to other design docs are valid
- [ ] All implementation file paths exist or are marked "TBD"

### 6.5 Code Extraction

- [ ] All code blocks > 20 lines moved to appendix
- [ ] Appendix file exists and is properly structured
- [ ] Links between main doc and appendix work
- [ ] Brief examples remain in main doc

### 6.6 Length Compliance

Check against target:

| System Type | Target Length | Actual | Status |
|-------------|---------------|--------|--------|
| Core | 800-1200 lines | [N] | [✓ Within range / ✗ Too short / ✗ Too long] |
| Major | 600-900 lines | [N] | [✓ Within range / ✗ Too short / ✗ Too long] |
| Minor | 300-500 lines | [N] | [✓ Within range / ✗ Too short / ✗ Too long] |

**If out of range:**
- Too short: Sections need more detail, examples, or edge cases
- Too long: Consider moving more content to appendix

### 6.7 Markdown Validation

- [ ] All headers properly formatted (# ## ###)
- [ ] All tables properly formatted
- [ ] All code blocks have language tags
- [ ] No syntax errors in markdown

### 6.8 Final Report

```
QUALITY CHECK COMPLETE
======================
Template Completeness: [PASS/FAIL]
Content Quality: [PASS/FAIL]
Specification Integrity: [PASS/FAIL]
Cross-References: [PASS/FAIL]
Code Extraction: [PASS/FAIL]
Length Compliance: [PASS/FAIL]
Markdown Validation: [PASS/FAIL]

OVERALL STATUS: [READY FOR REVIEW / NEEDS FIXES]

Issues Found: [N]
- [List critical issues to fix]
```

---

## Post-Migration Tasks

### Update PRD-EXECUTIVE.md

If this is a new system or replaces an existing reference:

1. **Read** `docs/PRD-EXECUTIVE.md`
2. **Locate** System Overview section
3. **Add or update** system entry:

```markdown
### [System Name]
[2-3 sentence summary from Document Purpose]

**Tier 2 Reference:** [[SYSTEM-NAME].md](design/[SYSTEM-NAME].md)
```

4. **Update** System Dependencies Map if needed
5. **Update** Document Hierarchy table if needed

### Update SPEC-REGISTRY.md

If `docs/SPEC-REGISTRY.md` exists:

1. **Read** current registry
2. **Add** all new specs to the table:

```markdown
| ID | System | Title | Status | Priority |
|----|--------|-------|--------|----------|
| REQ-[XXX]-001 | [System] | [Title] | Draft | P1 |
| REQ-[XXX]-002 | [System] | [Title] | Draft | P1 |
```

3. **Sort** by system, then ID

If registry doesn't exist, report: "SPEC-REGISTRY.md not found. Skip for now."

### Archive Draft

Move the draft to an archive location:

**Action**:
```bash
mkdir -p docs/draft/archive
mv docs/draft/[SYSTEM-NAME].md docs/draft/archive/[SYSTEM-NAME].md.backup
```

**Report**: "Draft archived to docs/draft/archive/"

### Create Summary

Generate migration summary:

```markdown
## Migration Complete: [SYSTEM-NAME]

**Date:** [YYYY-MM-DD]
**Draft:** docs/draft/[SYSTEM-NAME].md
**Output:** docs/design/[SYSTEM-NAME].md
**Appendix:** docs/design/appendix/[SYSTEM-NAME]-APPENDIX.md

### Statistics
- Specifications created: [N]
- Code examples extracted: [N]
- Document length: [N] lines (target: [N]-[N])
- Missing sections filled: [N]

### Changes
- [List key changes from draft]

### Next Steps
- [ ] Implement specifications in code
- [ ] Write tests for each REQ-XXX spec
- [ ] Update PRD-EXECUTIVE.md reference (if applicable)
- [ ] Update SPEC-REGISTRY.md (if applicable)
- [ ] Peer review by game designer
```

---

## Success Criteria

Migration is complete when:

- [x] All 6 steps completed successfully
- [x] Quality check passes (7/7 categories)
- [x] Output file created at `docs/design/[SYSTEM-NAME].md`
- [x] Appendix file created at `docs/design/appendix/[SYSTEM-NAME]-APPENDIX.md`
- [x] Draft file archived
- [x] Summary generated

---

## Error Handling

### If Step Fails

1. **Report error**: "Step [N] failed: [reason]"
2. **Ask user**: "Fix and retry, skip step, or abort migration?"
3. **Log issue** in summary for follow-up

### If Quality Check Fails

1. **List all failures** with specific issues
2. **Ask user**: "Fix issues now or save partial progress?"
3. **If saving partial**: Mark document status as "INCOMPLETE - See notes"

### If Cross-References Invalid

1. **List broken references**
2. **Suggest corrections** (if obvious)
3. **Mark as TODO** in document: `<!-- TODO: Validate reference to [system] -->`

---

## Examples

```bash
# Migrate military system
/migrate-doc docs/draft/MILITARY-SYSTEM.md

# Migrate diplomacy system
/migrate-doc docs/draft/DIPLOMACY-SYSTEM.md

# Migrate market system
/migrate-doc docs/draft/MARKET-SYSTEM.md
```

---

## Best Practices

1. **Read thoroughly first** - Don't start migrating until you understand the full scope
2. **Preserve all design rationale** - Never simplify or summarize design decisions
3. **Link extensively** - Cross-reference to other docs, specs, and code files
4. **Be consistent** - Use the same terminology as other design docs
5. **Test all links** - Verify every markdown link works before declaring done
6. **Ask for clarification** - If design intent is unclear, ask the user before proceeding

---

## Notes

- This skill is idempotent: can be run multiple times on the same draft
- Quality checks are non-negotiable: document must pass all 7 categories
- Specification writing is the most time-consuming step - budget accordingly
- User confirmation required at key milestones (after audit, after structure, after quality check)

---

**Version:** 1.0
**Created:** 2026-01-12
**For:** Nexus Dominion Documentation Migration Project
