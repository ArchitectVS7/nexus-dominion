---
argument-hint: [SYSTEM]
description: AI-powered dependency analysis for a single system, writes directly to specs. Usage: /spec-analyze COMBAT
---

# Spec Dependency Analysis Skill (Single System)

Interactive, AI-powered dependency analysis for one game system. Writes Dependencies and Blockers fields directly to the specification markdown document.

## When to Use This

- **Manual analysis** of a single system (e.g., after design changes)
- **Deep analysis** requiring Claude's understanding (not just pattern matching)
- **Review and verification** of existing dependencies
- **Interactive refinement** - you can guide the analysis

## When NOT to Use This

- **Batch processing all 15 systems** - Use `node analyze-dependencies.js` instead (autonomous, no stopping)
- **Simple pattern-based analysis** - Use `node analyze-dependencies.js` (faster)

## Parameters

- **System**: `$1` (e.g., "COMBAT", "BOT", "DIPLOMACY")

## Pre-Flight

Current git status: !`git status --short`

Target system: **$1**

## Workflow

### Step 1: Load Context

Read the target system document from `docs/Game Systems/{SYSTEM}.md`.

Also read `docs/development/SPEC-INDEX.json` (first 5000 lines) to get cross-system spec references.

**Token budget:** ~40K total

### Step 2: Analyze Dependencies

For each spec in the system:

1. **Read spec description, formula, and rationale**
2. **Identify dependencies:**
   - Explicit REQ-XXX-NNN references in the text
   - Implicit dependencies (mentions "units" → depends on REQ-MIL-001)
   - Cross-system dependencies (references to Resources, Sectors, Victory, etc.)
   - Parent-child relationships (split specs depend on parent)

3. **Classify dependency type:**
   - **HARD**: Cannot implement without the dependency (blocks implementation)
   - **SOFT**: Enhanced by dependency but can work without it
   - **REFERENCE**: Mentions another spec but doesn't depend on it

4. **Find blockers (reverse dependencies):**
   - Which other specs depend on THIS spec?
   - Search for references to this spec's ID across all specs

### Step 3: Update Specs Directly

For each spec, construct the Dependencies and Blockers fields:

**If dependencies exist:**
```markdown
**Dependencies:**
- REQ-XXX-001 (reason why this is needed)
- REQ-YYY-002 (HARD: cannot implement without this)
- REQ-ZZZ-003 (SOFT: enhances but optional)
```

**If no dependencies:**
```markdown
**Dependencies:** None (foundational spec)
```

**For blockers:**
```markdown
**Blockers:**
- REQ-XXX-005 (depends on this spec)
- REQ-YYY-007 (depends on this spec)
```

**Or:**
```markdown
**Blockers:** None
```

**Use the Edit tool** to update each spec in the markdown document:
- Find the spec by ### heading
- Locate insertion point (after Rationale, or after Description)
- Replace existing Dependencies/Blockers or insert new ones
- Make ONE edit per document if possible (batch multiple specs)

### Step 4: Verify Updates

After all specs updated:

1. **Count specs updated:**
   ```bash
   grep -c "**Dependencies:**" "docs/Game Systems/{SYSTEM}.md"
   ```

2. **Check for placeholders:**
   ```bash
   grep "to be filled by" "docs/Game Systems/{SYSTEM}.md"
   ```
   Should be empty.

3. **Validate spec references:**
   - All REQ-XXX-NNN references should exist in SPEC-INDEX.json

### Step 5: Summary Report

Display to user:

```
╔════════════════════════════════════════════════════════════╗
║      DEPENDENCY ANALYSIS COMPLETE - {SYSTEM}               ║
╚════════════════════════════════════════════════════════════╝

Specs Analyzed:           {count}
Specs Updated:            {count}
Dependencies Found:       {count}
Cross-System References:  {count}
Foundational Specs:       {count}

Top Dependencies:
  - REQ-XXX-001 (referenced by {N} specs)
  - REQ-YYY-002 (referenced by {M} specs)

System Dependencies:
  - {SYSTEM_A}: {count} references
  - {SYSTEM_B}: {count} references

✓ All updates written directly to markdown
✓ No placeholder text remaining

Ready to commit:
  git add "docs/Game Systems/{SYSTEM}.md"
  git commit -m "spec-analyze: Update dependencies for {SYSTEM}"
```

## Example Analysis Patterns

### Pattern 1: Explicit Reference
```markdown
**Description:** Combat uses D20 resolution (REQ-COMBAT-001) and unit power (REQ-MIL-006).
```

**Detected Dependencies:**
- REQ-COMBAT-001
- REQ-MIL-006

### Pattern 2: Keyword Pattern
```markdown
**Description:** Production generates Credits, Food, and Ore per sector.
```

**Detected Dependencies:**
- REQ-RES-001 (defines the five resource types)
- REQ-SEC-001 (defines sector types)

### Pattern 3: Formula Dependency
```markdown
**Formula:** victory_points = networth * 0.1 + sectors_controlled * 5
```

**Detected Dependencies:**
- REQ-RES-XXX (networth calculation)
- REQ-SEC-XXX (sector control tracking)

### Pattern 4: Split Parent-Child
```markdown
### REQ-COMBAT-009-A: Space Domain Resolution

**Description:** First phase of multi-domain combat.
```

**Detected Dependencies:**
- REQ-COMBAT-009 (parent spec)

**Detected Blockers:**
- REQ-COMBAT-009 (parent depends on this child)

## Cross-System Mapping

Common cross-system dependencies:

| Mentions | Likely Depends On |
|----------|-------------------|
| Credits, Food, Ore, Petroleum | REQ-RES-001 (resource types) |
| Units, Soldiers, Fighters | REQ-MIL-001 (unit types) |
| Sectors, territory, planets | REQ-SEC-001 (sector types) |
| Victory, networth, VP | REQ-VIC-XXX (victory conditions) |
| Treaties, alliances | REQ-DIP-XXX (diplomacy) |
| Research, tech, doctrine | REQ-RSCH-XXX (research) |
| Turn processing, phases | REQ-TURN-001 (turn pipeline) |
| Bots, AI, archetypes | REQ-BOT-XXX (bot system) |
| Spies, intel, covert | REQ-COV-XXX (covert ops) |
| Market, trade, prices | REQ-MKT-XXX (market system) |

## Error Handling

### Spec not found in markdown
- Log error, continue to next spec
- Report at end

### Circular dependency detected
- Log warning (e.g., REQ-A-001 depends on REQ-A-002, which depends on REQ-A-001)
- Still write both dependencies (let validation catch it)

### Cross-system spec not found
- Log warning
- Still write the reference (might be valid but not in index)

## Success Criteria

Analysis is successful when:
1. All specs in the system have Dependencies/Blockers fields
2. No placeholder text "(to be filled by /spec-analyze)" remains
3. All dependency references are valid spec IDs
4. Blockers correctly reflect reverse dependencies
5. Updates written directly to markdown (no intermediate JSON)

## Invocation Examples

```bash
# Analyze COMBAT system
/spec-analyze COMBAT

# Analyze BOT system (complex cross-system dependencies)
/spec-analyze BOT

# Re-analyze after design changes
/spec-analyze RESEARCH
```

## For Batch Processing

**Don't use this skill for all 15 systems.** Instead, run:

```bash
node analyze-dependencies.js
```

That autonomous script:
- Runs without Claude intervention
- Processes all 15 systems
- Never stops to ask questions
- Uses temp JSON for validation only
- Cleans up after itself
- Takes ~30-60 seconds total

This skill (/spec-analyze) is for **interactive, manual, one-system-at-a-time** analysis where you need Claude's intelligence and can guide the process.
