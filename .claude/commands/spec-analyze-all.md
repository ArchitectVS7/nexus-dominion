---
argument-hint: [--skip-commits]
description: Analyze dependencies for all 15 game systems in optimal order. Usage: /spec-analyze-all
---

# Spec Analyze All Systems

Automate dependency analysis for all 15 game systems in the recommended processing order (foundations first). This skill orchestrates 15 sequential `/spec-analyze` invocations with progress tracking and error handling.

## Parameters

- **--skip-commits** (optional): Don't create commits, just generate analysis files

## Pre-Flight

Current git status: !`git status --short`
Analysis directory: `docs/development/analysis/`

## Processing Order (Foundations First)

The 15 systems will be processed in this order:

```
Wave 1 (Foundations):
1. RESOURCE      - Base resources, production
2. SECTOR        - Sector types, acquisition
3. MILITARY      - Unit types, power

Wave 2 (Core Mechanics):
4. COMBAT        - Combat resolution
5. DIPLOMACY     - Treaties, reputation
6. VICTORY       - Victory conditions

Wave 3 (Integration):
7. TURN          - Turn processing phases
8. BOT           - AI archetypes
9. COVERT        - Covert operations

Wave 4 (Systems):
10. MARKET       - Market mechanics
11. RESEARCH     - Tech tree
12. PROGRESSIVE  - Unlocks, events

Wave 5 (Extensions):
13. SYNDICATE    - Hidden roles
14. TECH         - Tech cards
15. UI           - Frontend design
```

## Workflow

### Step 1: Initialize

Read `docs/development/SPEC-INDEX.json` to get system list and spec counts.

Create session log file: `docs/development/analysis/BATCH-SESSION-{timestamp}.log`

Initialize progress tracking:
```
Total Systems: 15
Total Specs to Analyze: {count from SPEC-INDEX}
Start Time: {timestamp}
```

### Step 2: Process Each System

For each system in the processing order:

1. **Log start:**
   ```
   [{N}/15] Analyzing {SYSTEM}...
   - Expected specs: {count from SPEC-INDEX}
   - File: {system file path}
   ```

2. **Run analysis:**
   ```
   Invoke /spec-analyze {SYSTEM} internally
   ```

3. **Verify output:**
   - Check `docs/development/analysis/{SYSTEM}-deps.json` exists
   - Validate JSON structure
   - Compare spec count to SPEC-INDEX

4. **Handle errors:**
   - If analysis fails, log error but continue to next system
   - Mark system as FAILED in progress log
   - Append error details to session log

5. **Log completion:**
   ```
   [{N}/15] {SYSTEM} ✓ Complete
   - Specs analyzed: {actual count}
   - Dependencies found: {count from analysis}
   - Cross-system refs: {count}
   - Duration: {seconds}
   ```

6. **Optional commit (if not --skip-commits):**
   ```
   git add docs/development/analysis/{SYSTEM}-deps.json
   git commit -m "spec-analyze: Complete dependency analysis for {SYSTEM}

   - Analyzed {N} specifications
   - Found {M} intra-system dependencies
   - Found {K} cross-system dependencies

   System {N}/15 in batch analysis"
   ```

### Step 3: Generate Summary Report

After all systems processed, create `docs/development/analysis/BATCH-SUMMARY.md`:

```markdown
# Batch Analysis Summary

**Generated:** {timestamp}
**Duration:** {total minutes}
**Systems Processed:** 15/15

---

## Results by System

| # | System | Status | Specs | Dependencies | Cross-System | Duration |
|---|--------|--------|-------|--------------|--------------|----------|
| 1 | RESOURCE | ✓ | 12 | 23 | 8 | 45s |
| 2 | SECTOR | ✓ | 11 | 18 | 12 | 38s |
| 3 | MILITARY | ✓ | 10 | 15 | 9 | 42s |
| 4 | COMBAT | ✓ | 12 | 31 | 15 | 51s |
| ... | ... | ... | ... | ... | ... | ... |

---

## Aggregate Statistics

- **Total Specs Analyzed:** {count}
- **Total Dependencies Found:** {count}
- **Average Dependencies per Spec:** {average}
- **Most Depended-On Spec:** REQ-XXX-NNN ({count} dependents)
- **Most Dependencies:** REQ-YYY-NNN ({count} dependencies)

---

## Cross-System Dependency Matrix

| From System | To System | Count |
|-------------|-----------|-------|
| COMBAT | MILITARY | 15 |
| DIPLOMACY | VICTORY | 8 |
| TURN | RESOURCE | 12 |
| ... | ... | ... |

---

## Systems with Errors

{List any failed systems with error messages}

---

## Next Steps

1. Review `docs/development/analysis/*-deps.json` files
2. Run `/spec-verify` to check for circular dependencies
3. Generate implementation order with topological sort
```

### Step 4: Final Output

Display summary to user:

```
╔════════════════════════════════════════════════════════════╗
║         BATCH ANALYSIS COMPLETE                            ║
╚════════════════════════════════════════════════════════════╝

Systems Processed: 15/15
Total Specs:       {count}
Total Dependencies: {count}
Failures:          {count}

Duration:          {MM}m {SS}s
Average per System: {seconds}s

📊 Full report: docs/development/analysis/BATCH-SUMMARY.md
📁 Analysis files: docs/development/analysis/*-deps.json

Next Steps:
- Review summary report
- Check for circular dependencies
- Generate implementation order
```

### Step 5: Commit Summary (if not --skip-commits)

```
git add docs/development/analysis/BATCH-SUMMARY.md
git add docs/development/analysis/BATCH-SESSION-{timestamp}.log
git commit -m "spec-analyze-all: Complete batch analysis for all 15 systems

- Analyzed {total} specifications across 15 systems
- Found {total_deps} dependencies
- {failures} failures

Summary: docs/development/analysis/BATCH-SUMMARY.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Error Handling

### System Analysis Fails

- **Log error** to session log
- **Mark system as FAILED** in summary
- **Continue** to next system (don't stop batch)
- **Include error details** in BATCH-SUMMARY.md

### JSON Validation Fails

- **Re-run analysis** for that system once
- If fails again, mark as FAILED and continue

### File Write Errors

- **Stop immediately** (can't continue without output files)
- **Report** which system failed
- **Preserve** partial progress

## Progress Display

Real-time progress as systems are processed:

```
╔════════════════════════════════════════════════════════════╗
║  BATCH ANALYSIS PROGRESS                                   ║
╠════════════════════════════════════════════════════════════╣
║  [████████████░░░░░░░░] 7/15 (47%)                        ║
║                                                            ║
║  Current: TURN                                             ║
║  Status:  Analyzing 38 specs...                            ║
║                                                            ║
║  Completed: RESOURCE, SECTOR, MILITARY, COMBAT,            ║
║             DIPLOMACY, VICTORY                             ║
║  Remaining: BOT, COVERT, MARKET, RESEARCH, PROGRESSIVE,    ║
║             SYNDICATE, TECH, UI                            ║
╚════════════════════════════════════════════════════════════╝
```

## Verification Checks

After batch completes, verify:

1. **All 15 analysis files exist:**
   ```bash
   ls docs/development/analysis/*-deps.json | wc -l
   # Should be 15
   ```

2. **All are valid JSON:**
   ```bash
   for f in docs/development/analysis/*-deps.json; do
     jq empty "$f" || echo "Invalid: $f"
   done
   ```

3. **Spec counts match SPEC-INDEX:**
   ```bash
   # Compare totalSpecs in each analysis file to SPEC-INDEX
   ```

4. **No missing cross-references:**
   ```bash
   # All dependency spec IDs exist in SPEC-INDEX
   ```

## Performance

- **Estimated time per system:** 30-60 seconds
- **Total estimated time:** 7-15 minutes
- **Token usage:** ~20-30K per system = ~300-450K total
- **Output size:** ~15 JSON files (each ~5-15KB)

## Stop Conditions

- All 15 systems processed (success or failure)
- Critical error (file system, git)
- User interrupts (Ctrl+C)

## Success Criteria

Batch analysis is successful when:
1. All 15 systems have analysis files
2. All analysis files are valid JSON
3. Summary report generated
4. Total spec count matches SPEC-INDEX
5. All commits created (if not --skip-commits)

## Usage Examples

```bash
# Standard batch analysis with commits
/spec-analyze-all

# Skip commits (just generate files)
/spec-analyze-all --skip-commits

# Re-run failed systems only (future enhancement)
/spec-analyze-all --retry-failed
```

## Recovery from Partial Completion

If the batch stops mid-run:

1. **Check session log:**
   ```bash
   cat docs/development/analysis/BATCH-SESSION-*.log
   ```

2. **See which systems completed:**
   ```bash
   ls docs/development/analysis/*-deps.json
   ```

3. **Re-run only missing systems:**
   ```bash
   # Manually run /spec-analyze for each missing system
   /spec-analyze BOT
   /spec-analyze COVERT
   # etc.
   ```

4. **Or force re-run all:**
   ```bash
   rm docs/development/analysis/*-deps.json
   /spec-analyze-all
   ```
