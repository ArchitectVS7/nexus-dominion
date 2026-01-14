---
argument-hint: [SYSTEM] or --all
description: Migrate dependency data from JSON files to actual spec documents. Usage: /spec-deps-migrate COMBAT or /spec-deps-migrate --all
---

# Spec Dependencies Migration Skill

Migrate dependency analysis from JSON files in `docs/development/analysis/` to the actual specification markdown documents. This fixes the critical gap where automation generated JSON files but never updated the specs.

## Parameters

- **System**: `$1` (e.g., "COMBAT", "RESOURCE", "BOT", or "--all" for all systems)

## Pre-Flight

Current git status: !`git status --short`

Target: **$1**

Analysis files available:
```bash
ls -lh docs/development/analysis/*-deps.json | wc -l
```

## Workflow

### Step 1: Load Analysis Data

Read the JSON dependency file:
- If `$1` is a system name: `docs/development/analysis/{SYSTEM}-deps.json`
- If `$1` is `--all`: Process all 15 JSON files sequentially

**Stop if JSON file doesn't exist** - no data to migrate.

### Step 2: Read Target System Document

From `docs/development/SPEC-INDEX.json`, get the document path for the system.

Read the full system document (e.g., `docs/Game Systems/COMBAT-SYSTEM.md`)

### Step 3: Process Each Spec

For each spec in the JSON file:

1. **Find the spec in the markdown document**
   - Search for `### REQ-{SYSTEM}-{NNN}:` heading
   - Extract the entire spec block (from ### to next ### or end of Section 6)

2. **Check if Dependencies/Blockers fields already exist**
   - If they exist AND are not "(to be filled by /spec-analyze)", skip this spec
   - If they are placeholders or missing, proceed to update

3. **Build Dependencies field content**

   **Format 1: Simple array (COMBAT, TURN, VICTORY, etc.)**
   ```json
   "dependencies": ["REQ-XXX-001", "REQ-YYY-002"]
   ```

   Becomes:
   ```markdown
   **Dependencies:**
   - REQ-XXX-001
   - REQ-YYY-002
   ```

   **Format 2: Detailed blockers (RESOURCE)**
   ```json
   "blockers": [
     {"type": "HARD", "spec": "REQ-XXX-001", "reason": "Must define base before extending"},
     {"type": "SOFT", "spec": "REQ-YYY-002", "reason": "Can use default if not ready"}
   ]
   ```

   Becomes:
   ```markdown
   **Dependencies:**
   - REQ-XXX-001 (HARD: Must define base before extending)
   - REQ-YYY-002 (SOFT: Can use default if not ready)
   ```

   **If empty dependencies:**
   ```markdown
   **Dependencies:** None (foundational spec)
   ```

4. **Build Blockers field content**

   List specs that depend on THIS spec (reverse dependencies):

   ```markdown
   **Blockers:**
   - REQ-XXX-005 (depends on this spec)
   - REQ-YYY-003 (depends on this spec)
   ```

   If no dependents:
   ```markdown
   **Blockers:** None
   ```

5. **Insert fields into spec**

   Find insertion point:
   - After **Rationale:** field (preferred)
   - After **Description:** field (if no Rationale)
   - Before **Formula:** field (if neither above exists)

   Insert:
   ```markdown

   **Dependencies:** {content from step 3}

   **Blockers:** {content from step 4}
   ```

### Step 4: Update Document

Use the Edit tool to update each spec with its Dependencies and Blockers fields.

**Batch updates:** If multiple specs in same document, make ONE edit per document with all changes.

### Step 5: Update Spec Summary Table

At the end of Section 6, find the specification summary table:

```markdown
| ID | Title | Status | Tests |
|----|-------|--------|-------|
| REQ-XXX-001 | ... | Draft | TBD |
```

Add a Dependencies column if not present:

```markdown
| ID | Title | Status | Dependencies | Tests |
|----|-------|--------|--------------|-------|
| REQ-XXX-001 | ... | Draft | 2 | TBD |
| REQ-XXX-002 | ... | Draft | None | TBD |
```

### Step 6: Create Commit

```bash
git add "docs/Game Systems/{SYSTEM-NAME}.md"
git commit -m "spec-deps-migrate: Populate Dependencies and Blockers for {SYSTEM}

Migrated {N} specs with dependency data from analysis JSON:
- {M} specs have dependencies
- {K} specs are foundational (no dependencies)
- {P} specs block other specs

Data source: docs/development/analysis/{SYSTEM}-deps.json

This addresses the critical gap where JSON analysis was generated
but never propagated to the actual specification documents."
```

### Step 7: Summary Report (if --all)

After processing all systems, display:

```
╔════════════════════════════════════════════════════════════╗
║         DEPENDENCY MIGRATION COMPLETE                      ║
╚════════════════════════════════════════════════════════════╝

Systems Processed: 15/15
Total Specs Updated: {count}
Specs with Dependencies: {count}
Foundational Specs: {count}

By System:
  RESOURCE:    52 specs, 38 with dependencies
  TURN:        70 specs, 59 with dependencies
  COMBAT:      18 specs, 9 with dependencies
  SYNDICATE:   12 specs, 0 with dependencies (empty JSON)
  TECH:        9 specs, 0 with dependencies (empty JSON)
  UI:          13 specs, 0 with dependencies (empty JSON)
  ...

Next Steps:
1. Run validation: node scripts/validate-specs.js
2. Re-run audit to verify 85%+ pass rate
3. Review SYNDICATE/TECH/UI (had no dependency data)
```

## Handling Empty JSON Files

For systems with 0 dependencies (SYNDICATE, TECH, UI):

**Option A:** Add placeholder indicating manual review needed:
```markdown
**Dependencies:** (to be manually reviewed - automation found none)

**Blockers:** (to be manually reviewed - automation found none)
```

**Option B:** Skip these specs entirely, leave them for manual analysis

**Recommendation:** Use Option A - at least we document that automation ran but found nothing.

## Error Handling

### Spec not found in document
- Log warning: "Spec {ID} in JSON but not found in {SYSTEM} document"
- Continue processing other specs
- Report at end

### Multiple matches for spec ID
- Use first match
- Log warning: "Multiple matches for {ID}, used first"

### JSON parse error
- Stop processing this system
- Report error
- Continue to next system (if --all)

## Validation

After migration, verify:

1. **Field presence:**
   ```bash
   grep -c "^\*\*Dependencies:\*\*" "docs/Game Systems/{SYSTEM}.md"
   # Should equal spec count
   ```

2. **No placeholders remaining:**
   ```bash
   grep "to be filled by /spec-analyze" "docs/Game Systems/{SYSTEM}.md"
   # Should be empty after migration
   ```

3. **Dependency references valid:**
   - All REQ-XXX-NNN references exist in SPEC-INDEX.json

## JSON Format Support

This skill handles TWO JSON formats:

### Format 1: Array-based (COMBAT, TURN, VICTORY, etc.)
```json
{
  "id": "REQ-XXX-001",
  "dependencies": ["REQ-XXX-002"],
  "dependents": ["REQ-XXX-005"],
  "crossSystemDeps": ["REQ-YYY-001"]
}
```

### Format 2: Blocker-based (RESOURCE)
```json
{
  "REQ-XXX-001": {
    "dependencies": ["REQ-XXX-002"],
    "blockers": [
      {"type": "HARD", "spec": "REQ-XXX-002", "reason": "..."}
    ],
    "crossSystem": ["RESOURCE"]
  }
}
```

Auto-detect format by checking JSON structure.

## Usage Examples

```bash
# Migrate single system
/spec-deps-migrate COMBAT

# Migrate all systems
/spec-deps-migrate --all

# Re-run for specific system (overwrites existing)
/spec-deps-migrate RESOURCE --force
```

## Success Criteria

Migration is successful when:
1. All specs in JSON have Dependencies/Blockers fields in markdown
2. No "(to be filled by /spec-analyze)" placeholders remain
3. All commits created successfully
4. Validation script shows 85%+ pass rate (up from 51.9%)
5. Summary table updated with dependency counts

## What This Fixes

**Before migration:**
- 193 specs (44.9%) missing Dependencies field
- 193 specs (44.9%) missing Blockers field
- 51.9% pass rate on audit

**After migration:**
- All specs have Dependencies/Blockers fields populated or marked as foundational
- Expected pass rate: 85%+ (only ~73 specs missing Rationale remain)
- JSON data finally in the actual specification documents

## Time Estimate

- Single system: 2-3 minutes
- All 15 systems: 10-15 minutes
- Manual review of SYNDICATE/TECH/UI: 30-60 minutes (separate task)
