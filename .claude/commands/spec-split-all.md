---
argument-hint: [--skip-commits] [--limit N] [--system SYSTEM] [--full-audit] [--skip-audit]
description: Batch split all split-candidate specs into atomic sub-specs. Usage: /spec-split-all
---

# Spec Split All Automation

Automate splitting of all specs marked as `splitCandidate` in SPEC-INDEX.json. Processes specs in priority order (by item count), handling splits, SPEC-INDEX updates, and commits systematically.

## Parameters

- **--skip-commits** (optional): Don't create commits, just update files
- **--limit N** (optional): Process only the first N candidates (e.g., `--limit 5` for top 5)
- **--system SYSTEM** (optional): Process only candidates from a specific system (e.g., `--system MARKET`)
- **--full-audit** (optional): Run full re-audit of SYSTEM-DESIGN-AUDIT-RESULTS.md after splits complete
- **--skip-audit** (optional): Don't update SYSTEM-DESIGN-AUDIT-RESULTS.md at all

## Pre-Flight

Current git status: !`git status --short`
SPEC-INDEX: `docs/development/SPEC-INDEX.json`
Total split candidates: {count from SPEC-INDEX}

## Workflow

### Step 1: Initialize

Read `docs/development/SPEC-INDEX.json` to collect all split candidates.

Create session log file: `docs/development/analysis/SPLIT-BATCH-SESSION-{timestamp}.log`

Initialize progress tracking:
```
Total Split Candidates: {count}
Filtered Candidates: {count after --system or --limit filters}
Start Time: {timestamp}
```

### Step 2: Collect and Prioritize Candidates

Scan all systems in SPEC-INDEX.json for specs with `splitCandidate` field.

Sort by priority (descending):
1. **Primary sort**: Estimated item count (extract number from splitCandidate text)
   - "8 event types" → 8
   - "4 intelligence tiers" → 4
   - "morale + surrender mechanics" → 2
2. **Secondary sort**: System alphabetically

Apply filters:
- If `--system SYSTEM` provided, filter to that system only
- If `--limit N` provided, take only top N candidates

Example prioritized queue:
```
Priority Queue (91 total candidates):

High Priority (8+ items):
  1. REQ-MKT-005: Market Events (8 event types)
  2. REQ-SEC-003: Eight Sector Types (8 sector definitions)
  3. REQ-PROG-003: Galactic Events (8 types + probability)

Medium Priority (4-6 items):
  4. REQ-BOT-003: Emotional States (6 emotional states)
  5. REQ-RSCH-002: Doctrine System (Tier 1) (3 doctrine categories)

Low Priority (2-3 items):
  6. REQ-COMBAT-009: Multi-Domain Resolution (3 domains)
  7. REQ-COMBAT-012: Morale & Surrender (morale + surrender)
```

### Step 3: Process Each Candidate

For each candidate spec in the priority queue:

#### 3a. Log Start
```
[{N}/{total}] Splitting {SPEC-ID}: {title}...
- System: {SYSTEM}
- Split hint: {splitCandidate text}
- Expected sub-specs: ~{estimated count}
```

#### 3b. Run Split
```
Invoke /spec-split {SPEC-ID} internally
```

The `/spec-split` skill will:
- Analyze the spec
- Propose atomic sub-specs
- **Auto-approve** standard splits (clear cases)
- **Prompt user** for complex/ambiguous splits
- Update source document
- Update SPEC-INDEX.json
- Create commit (unless --skip-commits)

#### 3c. Handle User Interaction

If `/spec-split` prompts for approval:
- **Present options:**
  1. Approve and continue
  2. Modify proposal
  3. Skip this spec
  4. Cancel entire batch

- **On skip:** Log as skipped, continue to next
- **On cancel:** Stop batch, generate partial summary
- **On modify:** Let user adjust, then continue

#### 3d. Verify Results

After split completes:
- Check SPEC-INDEX.json updated correctly
- Verify new sub-specs exist in source document
- Verify `splitCandidate` field removed from parent
- Count actual sub-specs created

#### 3e. Log Completion
```
[{N}/{total}] {SPEC-ID} ✓ Split Complete
- Original: {original title}
- Sub-specs created: {actual count}
- SPEC-INDEX entries: +{count}
- Duration: {seconds}
```

#### 3f. Error Handling

If split fails:
- Log error details to session log
- Mark spec as FAILED in progress tracking
- Offer options:
  1. Retry this spec
  2. Skip and continue
  3. Cancel batch
- Continue to next spec (unless user cancels)

### Step 4: Generate Summary Report

After all candidates processed, create `docs/development/analysis/SPLIT-BATCH-SUMMARY.md`:

```markdown
# Batch Split Summary

**Generated:** {timestamp}
**Duration:** {total minutes}
**Candidates Processed:** {completed}/{total}

---

## Results by Spec

| # | Spec ID | System | Status | Sub-Specs | Original Items | Duration |
|---|---------|--------|--------|-----------|----------------|----------|
| 1 | REQ-MKT-005 | MARKET | ✓ | 8 | 8 event types | 2m 15s |
| 2 | REQ-SEC-003 | SECTOR | ✓ | 8 | 8 sector defs | 2m 45s |
| 3 | REQ-PROG-003 | PROGRESSIVE | ✓ | 8 | 8 galactic events | 3m 10s |
| 4 | REQ-BOT-003 | BOT | ✓ | 6 | 6 emotional states | 1m 50s |
| 5 | REQ-COMBAT-009 | COMBAT | SKIPPED | - | User requested | - |
| 6 | REQ-COMBAT-012 | COMBAT | ✓ | 2 | morale + surrender | 1m 20s |
| ... | ... | ... | ... | ... | ... | ... |

---

## Aggregate Statistics

- **Total Candidates:** {original count}
- **Successfully Split:** {success count}
- **Skipped:** {skip count}
- **Failed:** {fail count}
- **Total Sub-Specs Created:** {sum of sub-specs}
- **SPEC-INDEX Delta:**
  - Original specs: {before count}
  - New specs: {after count}
  - Net increase: +{delta}
  - Split candidates remaining: {remaining count}

---

## System Breakdown

| System | Candidates | Processed | Sub-Specs Created |
|--------|------------|-----------|-------------------|
| MARKET | 8 | 7 | 42 |
| SECTOR | 3 | 3 | 18 |
| BOT | 5 | 4 | 22 |
| ... | ... | ... | ... |

---

## Skipped Specs

{List any skipped specs with reasons}

---

## Failed Specs

{List any failed specs with error messages}

---

## Next Steps

1. Review split specs in source documents
2. Run `/spec-analyze-all` to update dependencies
3. Remaining split candidates: {count}
4. Consider running `/spec-split-all --limit 10` again
```

### Step 4.5: Update Audit Results (Optional)

If `docs/development/SYSTEM-DESIGN-AUDIT-RESULTS.md` exists, add note about staleness:

**Option A: Add Staleness Warning (Quick)**

Prepend warning to existing file:
```markdown
> **⚠️ AUDIT STALE:** Specs have been split since this audit was generated.
> - Last audit: {original date}
> - Specs added: {count of new sub-specs}
> - Run full re-audit to sync with SPEC-INDEX.json ({current spec count} specs)

---

[Original content...]
```

**Option B: Trigger Full Re-Audit (Recommended but slower)**

If audit tooling exists, run it:
```bash
# If audit skill/command exists
/audit-all
# Or similar command that regenerates SYSTEM-DESIGN-AUDIT-RESULTS.md
```

**Option C: Skip (User decision)**

Prompt user:
```
SYSTEM-DESIGN-AUDIT-RESULTS.md is out of sync ({old count} vs {new count} specs).

Options:
1. Add staleness warning (quick)
2. Run full re-audit now (may take 10-15 min)
3. Skip (manually update later)
```

**Implementation:**
- Default: Add staleness warning (Option A)
- If `--full-audit` flag provided: Run full re-audit (Option B)
- If `--skip-audit` flag provided: Skip (Option C)

### Step 5: Final Output

Display summary to user:

```
╔════════════════════════════════════════════════════════════╗
║         BATCH SPLIT COMPLETE                               ║
╚════════════════════════════════════════════════════════════╝

Candidates Processed: {completed}/{total}
Total Sub-Specs:      {count}
Skipped:              {count}
Failed:               {count}

Duration:             {MM}m {SS}s
Average per Split:    {seconds}s

📊 Full report: docs/development/analysis/SPLIT-BATCH-SUMMARY.md
📝 Session log:  docs/development/analysis/SPLIT-BATCH-SESSION-{timestamp}.log

Split Candidates Remaining: {remaining count}

Next Steps:
- Review split specs in source documents
- Run /spec-analyze-all to update dependencies
- Update SYSTEM-DESIGN-AUDIT-RESULTS.md (stale after splits)
- Consider processing remaining candidates
```

### Step 6: Commit Summary (if not --skip-commits)

```
git add docs/development/analysis/SPLIT-BATCH-SUMMARY.md
git add docs/development/analysis/SPLIT-BATCH-SESSION-{timestamp}.log
git commit -m "spec-split-all: Batch split {count} specs into {sub-count} atomic sub-specs

- Processed {total} split candidates
- Created {sub-count} atomic sub-specs
- {failures} failures, {skipped} skipped

Summary: docs/development/analysis/SPLIT-BATCH-SUMMARY.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Auto-Approval Logic

To minimize user prompts, auto-approve splits that meet ALL criteria:

1. **Clear Pattern**: Split hint matches known patterns
   - "N {item type}" (e.g., "8 event types")
   - "N {item} definitions"
   - "N {item} + N {item}" (e.g., "3 phases + 2 checks")

2. **Reasonable Count**: 2-12 sub-specs
   - Too few (<2): Not worth splitting
   - Too many (>12): May need user guidance

3. **Structural Clarity**: Source spec has clear section breaks or table rows

**Prompt user** for:
- Ambiguous split hints (e.g., "complex mechanics")
- Edge cases (nested hierarchies, overlapping concerns)
- First split in a batch (to establish pattern)

## Progress Display

Real-time progress as specs are processed:

```
╔════════════════════════════════════════════════════════════╗
║  BATCH SPLIT PROGRESS                                      ║
╠════════════════════════════════════════════════════════════╣
║  [████████████░░░░░░░░] 12/20 (60%)                       ║
║                                                            ║
║  Current: REQ-PROG-003 (Galactic Events)                   ║
║  Status:  Splitting 8 event types...                       ║
║                                                            ║
║  Completed: REQ-MKT-005, REQ-SEC-003, REQ-BOT-003, ...     ║
║  Remaining: 8 specs                                        ║
║                                                            ║
║  Sub-Specs Created: 67                                     ║
║  Elapsed: 15m 23s                                          ║
╚════════════════════════════════════════════════════════════╝
```

## Error Handling

### Split Fails
- **Log error** to session log with full context
- **Mark spec as FAILED** in summary
- **Offer retry** once
- **Continue** to next spec (preserve partial progress)

### SPEC-INDEX Corruption
- **Stop immediately** (critical error)
- **Backup SPEC-INDEX** before any modifications
- **Report** which spec caused corruption
- **Preserve** all completed work

### Git Commit Fails
- **Continue processing** (collect all changes)
- **Create single commit** at end with all changes
- **Report** commit failure but don't stop splits

### User Cancels Mid-Batch
- **Save progress** immediately
- **Generate partial summary** for completed specs
- **Log** which spec was interrupted
- **Preserve** all file changes made so far

## Performance

- **Estimated time per split:** 1-3 minutes (depends on complexity)
- **Total estimated time for 91 candidates:** 90-270 minutes (1.5-4.5 hours)
- **Recommended batching:** Use `--limit 10-20` for manageable sessions
- **Token usage:** ~5-10K per split = ~50-100K per 10 specs

## Stop Conditions

- All candidates processed (success, skip, or fail)
- User cancels batch
- Critical error (SPEC-INDEX corruption, file system)
- `--limit N` reached

## Success Criteria

Batch split is successful when:
1. All (or filtered subset) of candidates processed
2. All sub-specs created in source documents
3. SPEC-INDEX.json updated correctly for all splits
4. Summary report generated
5. All commits created (if not --skip-commits)
6. No split candidates remain (or count reduced as expected)

## Usage Examples

```bash
# Process all 91 split candidates (with staleness warning on audit results)
/spec-split-all

# Process top 10 priority candidates only
/spec-split-all --limit 10

# Process only MARKET system candidates
/spec-split-all --system MARKET

# Dry run: split files but don't commit
/spec-split-all --skip-commits --limit 5

# Process top 20 with full re-audit after (recommended for large batches)
/spec-split-all --limit 20 --full-audit

# Process without touching audit results file
/spec-split-all --limit 10 --skip-audit

# Process top 20 from COMBAT and BOT systems
/spec-split-all --limit 20 --system COMBAT
/spec-split-all --limit 20 --system BOT
```

## Recovery from Partial Completion

If the batch stops mid-run:

1. **Check session log:**
   ```bash
   cat docs/development/analysis/SPLIT-BATCH-SESSION-*.log
   ```

2. **See which specs completed:**
   ```bash
   # Check SPEC-INDEX for specs without splitCandidate field
   ```

3. **Resume with remaining:**
   ```bash
   # Re-run /spec-split-all (will skip already-split specs)
   /spec-split-all
   ```

4. **Or manually complete:**
   ```bash
   # Run /spec-split for each remaining candidate
   /spec-split REQ-XXX-001
   /spec-split REQ-XXX-002
   ```

## Integration with /spec-analyze-all

After batch splitting, run dependency analysis:

```bash
# Complete workflow
/spec-split-all --limit 20          # Split top 20 candidates
/spec-analyze-all                   # Update all dependencies
```

This ensures:
- New sub-specs get proper dependency analysis
- Cross-references updated
- Implementation order recalculated

## Priority Tracking

The skill maintains priority based on:

1. **Item count** (primary): More items = higher priority
   - 8+ items: High priority (complex systems)
   - 4-7 items: Medium priority (moderate complexity)
   - 2-3 items: Low priority (simple splits)

2. **System importance** (secondary): Core systems first
   - RESOURCE, SECTOR, MILITARY (foundations)
   - COMBAT, DIPLOMACY, VICTORY (core mechanics)
   - MARKET, RESEARCH, PROGRESSIVE (systems)
   - BOT, COVERT, TECH, UI (extensions)

3. **Duplicates** (flag): Specs duplicated in multiple systems
   - Example: REQ-PROG-003 also in REQ-TURN-017
   - Split parent first, then reference in duplicates
