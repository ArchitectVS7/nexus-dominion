---
argument-hint: [SPEC-ID]
description: Split an overloaded spec into atomic sub-specs. Usage: /spec-split REQ-TURN-001
---

# Spec Splitting Skill

Interactively split an overloaded specification into atomic sub-specifications. Each sub-spec will be independently testable and implement a single behavior.

## Parameters

- **Spec ID**: `$1` (e.g., "REQ-TURN-001", "REQ-BOT-002", "REQ-VIC-007")

## Pre-Flight

Current git status: !`git status --short`
Target spec: **$1**

## Workflow

### Step 1: Locate Spec

1. Read `docs/development/SPEC-INDEX.json`
2. Find the system containing `$1`
3. Get the file path and line number
4. Read the full spec from the source document

### Step 2: Analyze Current Spec

Parse the spec to identify:
- **Title**: What the spec is called
- **Description**: Full description text
- **Distinct Behaviors**: Count of separate behaviors/rules
- **Key Values**: Any tables, formulas, or constants
- **splitCandidate field**: Pre-identified split hints from SPEC-INDEX

### Step 3: Propose Sub-Specs

Generate a proposal for atomic sub-specs:

```
## Split Proposal for $1

**Current Title:** {original title}
**Behaviors Identified:** {count}

### Proposed Sub-Specs:

1. **$1-A: {Sub-title 1}**
   - Description: {focused description}
   - Key Values: {subset of values}
   - Testable: {yes/no with reason}

2. **$1-B: {Sub-title 2}**
   - Description: {focused description}
   - Key Values: {subset of values}
   - Testable: {yes/no with reason}

... (continue for all behaviors)

### ID Naming Convention:
- Use suffix -A, -B, -C... for 2-8 items
- Use suffix -01, -02, -03... for 9+ items (e.g., phases)

### Impact:
- New spec count: {original} → {new count}
- Files affected: {source doc path}
- SPEC-INDEX.json update required: YES
```

### Step 4: User Approval

Present the proposal and ask:

```
Do you approve this split?
1. Yes, proceed with split
2. Modify proposal (specify changes)
3. Skip this spec
4. Cancel
```

### Step 5: Execute Split (On Approval)

#### 5a. Update Source Document

Replace the original spec with sub-specs:

**Before:**
```markdown
### REQ-XXX-001: Overloaded Title

**Description:** Does A, B, C, and D...
```

**After:**
```markdown
### REQ-XXX-001: {Summary Title}

> **Note:** This spec has been split into atomic sub-specs. See REQ-XXX-001-A through REQ-XXX-001-D.

---

### REQ-XXX-001-A: {Focused Title A}

**Description:** Does A...

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section X.X

**Code:** {same as original or TBD}

**Tests:** {same as original or TBD}

**Status:** Draft

---

### REQ-XXX-001-B: {Focused Title B}
...
```

#### 5b. Update SPEC-INDEX.json

Replace the original entry with sub-spec entries:

**Before:**
```json
{ "id": "REQ-XXX-001", "title": "Overloaded Title", "atomic": false, "splitCandidate": "A, B, C, D" }
```

**After:**
```json
{ "id": "REQ-XXX-001", "title": "Summary Title (Split)", "atomic": true, "parentOf": ["REQ-XXX-001-A", "REQ-XXX-001-B", "REQ-XXX-001-C", "REQ-XXX-001-D"] },
{ "id": "REQ-XXX-001-A", "title": "Focused Title A", "atomic": true, "splitFrom": "REQ-XXX-001" },
{ "id": "REQ-XXX-001-B", "title": "Focused Title B", "atomic": true, "splitFrom": "REQ-XXX-001" },
{ "id": "REQ-XXX-001-C", "title": "Focused Title C", "atomic": true, "splitFrom": "REQ-XXX-001" },
{ "id": "REQ-XXX-001-D", "title": "Focused Title D", "atomic": true, "splitFrom": "REQ-XXX-001" }
```

Update summary counts:
- `totalSpecs`: increment by (sub-count - 1)
- `atomicSpecs`: increment by sub-count
- `splitCandidates`: decrement by 1

### Step 6: Commit

```
spec-split: Split $1 into {N} atomic sub-specs

- Original: $1 ({original title})
- Split into: $1-A through $1-{N}
- Reason: {splitCandidate reason}

Files changed:
- docs/Game Systems/{SYSTEM}-SYSTEM.md
- docs/development/SPEC-INDEX.json
```

## Priority Split Queue

From SPEC-INDEX.json `splitPriority`:

| Rank | Spec ID | Items | Reason |
|------|---------|-------|--------|
| 1 | REQ-TURN-001 | 17 | Entire turn pipeline |
| 2 | REQ-VIC-007 | 6 | 6 VP formulas |
| 3 | REQ-VIC-008 | 7 | 7 anti-snowball mechanics |
| 4 | REQ-BOT-002 | 8 | 8 archetype definitions |
| 5 | REQ-RSCH-003 | 6 | 6 specialization definitions |

## Batch Mode

For processing multiple specs:

```bash
# Interactive batch (prompts for each)
/spec-split REQ-TURN-001
/spec-split REQ-VIC-007
/spec-split REQ-VIC-008

# Or use --batch flag for auto-approval of standard splits
/spec-split --batch REQ-TURN-001 REQ-VIC-007 REQ-VIC-008
```

## Atomicity Criteria

A spec is atomic when:
1. **Single Behavior**: Describes ONE testable rule or calculation
2. **Clear Boundary**: Can be implemented independently
3. **Focused Test**: One test file can cover all cases
4. **No "AND" in Title**: Title doesn't join unrelated concepts

**Examples of Atomic Specs:**
- REQ-COMBAT-001: "D20 Attack Resolution" (one mechanic)
- REQ-SEC-002: "Sector Cost Scaling" (one formula)
- REQ-DIP-001: "Treaty Types" (one definition table)

**Examples of Non-Atomic Specs:**
- REQ-TURN-001: "Turn Processing Pipeline" (17 phases)
- REQ-BOT-002: "Eight Archetypes" (8 distinct definitions)
- REQ-VIC-008: "Anti-Snowball Mechanics" (7 mechanics)

## Stop Conditions

- Spec not found in SPEC-INDEX.json
- Spec already marked as atomic (use --force to re-analyze)
- User cancels
- Unable to identify distinct behaviors

## Success Criteria

A split is successful when:
1. All sub-specs pass atomicity criteria
2. No information lost from original spec
3. SPEC-INDEX.json updated with new entries
4. Source document properly formatted
5. Commit created with clear message
