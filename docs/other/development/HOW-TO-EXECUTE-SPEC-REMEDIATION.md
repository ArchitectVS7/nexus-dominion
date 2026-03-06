# How To Execute: Spec Remediation Plan

**Last Updated:** 2026-01-12
**Current Status:** Session 1 Complete, Starting Session 2

---

## Quick Status Check

Run this to see what's done:
```bash
# Check SPEC-INDEX status
cat docs/development/SPEC-INDEX.json | grep -E "(totalSpecs|atomicSpecs|splitCandidates)"

# Check analysis status
ls -la docs/development/analysis/*.json 2>/dev/null | wc -l

# Check if splits are done
git log --oneline --grep="spec-split" | head -5
```

---

## Overall Plan (5 Sessions)

```
✅ Session 1: Foundation (COMPLETE)
   - Created SPEC-INDEX.json (162 specs)
   - Created /spec-analyze skill
   - Created /spec-analyze-all skill (AUTOMATION!)
   - Created /spec-split skill
   - Created analysis/ directory

⏳ Session 2: Priority Splits (IN PROGRESS)
   - Split REQ-TURN-001 (17 → 18 specs)
   - Split REQ-VIC-007 (1 → 6 specs)
   - Split REQ-VIC-008 (1 → 7 specs)
   - Split REQ-BOT-002 (1 → 8 specs)

⬜ Session 3: Automated Dependency Analysis (ONE COMMAND!)
   - /spec-analyze-all
   - Analyzes all 15 systems in optimal order
   - 7-15 minutes total
   - Generates BATCH-SUMMARY.md

⬜ Session 4: Verification & Graph
   - Build complete dependency graph
   - Detect cycles
   - Resolve duplicates
   - Generate implementation order

⬜ Session 5: Document Updates
   - Propagate Dependencies/Blockers to source docs
   - Update audit results
   - Final verification
```

---

## Session 2: Priority Splits (CURRENT)

### Goal
Split the 4 most overloaded specs into atomic sub-specs.

### Parallel Execution Strategy

**You said you're running 4 Claude instances in parallel - here's how:**

#### Terminal 1: REQ-TURN-001
```bash
/spec-split REQ-TURN-001
```
**File Modified:** `docs/Game Systems/TURN-PROCESSING-SYSTEM.md`
**Output:** 18 specs (1 parent + 17 sub-specs)

#### Terminal 2: REQ-BOT-002
```bash
/spec-split REQ-BOT-002
```
**File Modified:** `docs/Game Systems/BOT-SYSTEM.md`
**Output:** 9 specs (1 parent + 8 archetype sub-specs)

#### Terminal 3: REQ-VIC-007
```bash
/spec-split REQ-VIC-007
```
**File Modified:** `docs/Game Systems/VICTORY-SYSTEMS.md`
**Output:** 7 specs (1 parent + 6 VP formula sub-specs)

#### Terminal 4: REQ-VIC-008 (WAIT FOR T3!)
```bash
# ⚠️ WAIT for Terminal 3 to finish first - same file!
/spec-split REQ-VIC-008
```
**File Modified:** `docs/Game Systems/VICTORY-SYSTEMS.md` (SAME as T3)
**Output:** 8 specs (1 parent + 7 anti-snowball sub-specs)

### Merge Strategy

After all terminals complete:

1. **Don't merge git branches** - Each Claude modifies different files (except VIC)
2. **Check git status:**
   ```bash
   git status
   # Should show:
   # - Modified: TURN-PROCESSING-SYSTEM.md
   # - Modified: BOT-SYSTEM.md
   # - Modified: VICTORY-SYSTEMS.md (has both VIC-007 and VIC-008 changes)
   # - Modified: SPEC-INDEX.json (all 4 updated it)
   ```

3. **SPEC-INDEX.json conflicts?**
   If you get merge conflicts in SPEC-INDEX.json:
   ```bash
   # Keep all changes, just remove conflict markers
   # The index should have entries for all split specs
   git add docs/development/SPEC-INDEX.json
   ```

4. **Verify the splits:**
   ```bash
   # Count new specs
   grep -c '"REQ-TURN-001-' docs/development/SPEC-INDEX.json  # Should be 18
   grep -c '"REQ-BOT-002-' docs/development/SPEC-INDEX.json   # Should be 8
   grep -c '"REQ-VIC-007-' docs/development/SPEC-INDEX.json   # Should be 6
   grep -c '"REQ-VIC-008-' docs/development/SPEC-INDEX.json   # Should be 7
   ```

5. **Commit all changes:**
   ```bash
   git add -A
   git commit -m "spec-split: Complete priority splits for TURN, BOT, VIC systems

   - REQ-TURN-001 → 18 atomic phase specs
   - REQ-BOT-002 → 8 archetype specs
   - REQ-VIC-007 → 6 VP formula specs
   - REQ-VIC-008 → 7 anti-snowball mechanic specs

   Total: 4 specs → 39 atomic specs (+35 net)

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

### If You Get Lost

**Q: Which specs still need splitting?**
```bash
cat docs/development/SPEC-INDEX.json | grep -B1 '"atomic": false' | grep '"id"'
```

**Q: How many specs are now atomic?**
```bash
cat docs/development/SPEC-INDEX.json | grep -c '"atomic": true'
```

**Q: Did a split succeed?**
```bash
# Check if sub-specs exist in source doc
grep "REQ-TURN-001-01" "docs/Game Systems/TURN-PROCESSING-SYSTEM.md"
# Should find: ### REQ-TURN-001-01: Tier Structure Definition
```

---

## Session 3: Automated Dependency Analysis (CURRENT AFTER SESSION 2)

### Goal
Analyze all 15 game systems to populate Dependencies and Blockers for every spec.

### The Magic Command

**One command does it all:**
```bash
/spec-analyze-all
```

That's it! This will:
- Process all 15 systems in optimal order (foundations first)
- Show real-time progress bar
- Generate 15 analysis files (`*-deps.json`)
- Create commits per system
- Generate summary report
- Take 7-15 minutes total

### Processing Order (Automated)

The skill processes systems in this order:

**Wave 1 (Foundations):** RESOURCE, SECTOR, MILITARY

**Wave 2 (Core Mechanics):** COMBAT, DIPLOMACY, VICTORY

**Wave 3 (Integration):** TURN, BOT, COVERT

**Wave 4 (Systems):** MARKET, RESEARCH, PROGRESSIVE

**Wave 5 (Extensions):** SYNDICATE, TECH, UI

### What You'll See

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

[7/15] TURN ✓ Complete
- Specs analyzed: 38
- Dependencies found: 87
- Cross-system refs: 23
- Duration: 52s
```

### Outputs Generated

After completion:

1. **15 Analysis Files:**
   - `docs/development/analysis/RESOURCE-deps.json`
   - `docs/development/analysis/SECTOR-deps.json`
   - ... (all 15 systems)

2. **Summary Report:**
   - `docs/development/analysis/BATCH-SUMMARY.md`
   - Full stats table
   - Cross-system dependency matrix
   - Top depended-on specs

3. **Session Log:**
   - `docs/development/analysis/BATCH-SESSION-{timestamp}.log`
   - Detailed timing and error info

### Verification After Completion

```bash
# Check all 15 files created
ls docs/development/analysis/*-deps.json | wc -l
# Should be 15

# View summary
cat docs/development/analysis/BATCH-SUMMARY.md

# Check total specs analyzed
cat docs/development/analysis/BATCH-SUMMARY.md | grep "Total Specs"

# Verify no failures
cat docs/development/analysis/BATCH-SUMMARY.md | grep "Systems with Errors"
```

### If Something Goes Wrong

**Batch stopped mid-run?**
```bash
# Check which systems completed
ls docs/development/analysis/*-deps.json

# Read session log to see where it stopped
cat docs/development/analysis/BATCH-SESSION-*.log

# Re-run just the missing systems
/spec-analyze RESEARCH  # Example if RESEARCH failed
```

**Want to skip commits and just generate files?**
```bash
/spec-analyze-all --skip-commits
```

**Need to re-run everything?**
```bash
rm docs/development/analysis/*-deps.json
/spec-analyze-all
```

### Manual Alternative (If Automation Fails)

If `/spec-analyze-all` has issues, fall back to manual:
```bash
# Run systems one at a time
/spec-analyze RESOURCE
/spec-analyze SECTOR
/spec-analyze MILITARY
# ... (continue for all 15)
```

Or use bash loop:
```bash
for sys in RESOURCE SECTOR MILITARY COMBAT DIPLOMACY VICTORY TURN BOT COVERT MARKET RESEARCH PROGRESSIVE SYNDICATE TECH UI; do
  /spec-analyze $sys
done
```

---

## Session 4: Verification & Dependency Graph

### Goal
Build complete cross-system dependency graph and detect issues.

### Steps

1. **Load all analysis files:**
   ```bash
   ls docs/development/analysis/*-deps.json
   # Should see 15 files
   ```

2. **Build dependency graph:**
   ```
   # This will be a new script/skill to create
   # For now, manual verification:

   # Check for circular dependencies
   cat docs/development/analysis/*.json | \
     jq -r '.specs[] | select(.blockers[] | .type == "HARD") | "\(.id) → \(.blockers[].spec)"'
   ```

3. **Detect duplicates:**
   ```bash
   # From SPEC-INDEX.json duplicatesToResolve
   cat docs/development/SPEC-INDEX.json | jq '.duplicatesToResolve'
   ```

4. **Generate implementation order (topological sort):**
   ```
   # Wave 0: Specs with no HARD dependencies
   # Wave 1: Specs depending only on Wave 0
   # etc.
   ```

5. **Output:** `docs/development/DEPENDENCY-GRAPH.md`

---

## Session 7: Document Updates

### Goal
Propagate all Dependencies/Blockers back to source documents.

### Process

For each system:
1. Read `analysis/{SYSTEM}-deps.json`
2. For each spec, add to source doc:
   ```markdown
   **Dependencies:**
   - REQ-XXX-NNN (reason from analysis)

   **Blockers:**
   - HARD: REQ-YYY-NNN - reason from analysis
   - SOFT: REQ-ZZZ-NNN - reason from analysis
   ```

3. Commit per-system changes

### Final Verification

```bash
# All specs should have Dependencies and Blockers fields
grep -r "**Dependencies:**" "docs/Game Systems/" | wc -l
# Should equal totalSpecs from SPEC-INDEX.json

grep -r "**Blockers:**" "docs/Game Systems/" | wc -l
# Should equal totalSpecs from SPEC-INDEX.json
```

---

## Emergency Recovery

### Lost Your Place?

Check last commit:
```bash
git log --oneline -5
```

Check what files are modified:
```bash
git status
```

Check current spec count:
```bash
cat docs/development/SPEC-INDEX.json | jq '.summary'
```

### Corrupted SPEC-INDEX.json?

Restore from git:
```bash
git checkout HEAD -- docs/development/SPEC-INDEX.json
```

Or regenerate from source docs (manual):
```bash
grep -rn "^### REQ-" "docs/Game Systems/" > spec-list.txt
# Then rebuild JSON structure
```

### Analysis File Corrupted?

Just re-run the analysis:
```bash
rm docs/development/analysis/COMBAT-deps.json
/spec-analyze COMBAT
```

---

## Success Metrics

After all sessions complete:

```bash
# 1. Spec count increased (splits)
cat docs/development/SPEC-INDEX.json | jq '.summary.totalSpecs'
# Target: 200+ (started at 162)

# 2. All atomic
cat docs/development/SPEC-INDEX.json | jq '.summary.splitCandidates'
# Target: 0

# 3. All have dependencies
ls docs/development/analysis/*.json | wc -l
# Target: 15

# 4. All docs updated
grep -r "**Dependencies:**" "docs/Game Systems/" | wc -l
# Target: 200+

# 5. No circular dependencies detected
# (Manual check of DEPENDENCY-GRAPH.md)

# 6. Implementation order generated
cat docs/development/IMPLEMENTATION-ORDER.md
# Should have Wave 0, Wave 1, Wave 2, etc.
```

---

## Current State Snapshot

**Files Created (Session 1):**
- ✅ `docs/development/SPEC-INDEX.json`
- ✅ `.claude/commands/spec-analyze.md`
- ✅ `.claude/commands/spec-split.md`
- ✅ `docs/development/analysis/README.md`

**In Progress (Session 2):**
- ⏳ REQ-TURN-001 split (your other Claude instances)
- ⏳ REQ-BOT-002 split
- ⏳ REQ-VIC-007 split
- ⏳ REQ-VIC-008 split (waiting on VIC-007)

**Next Up (Session 3):**
- Run `/spec-analyze RESOURCE`
- Run `/spec-analyze SECTOR`
- Run `/spec-analyze MILITARY`
- Run `/spec-analyze COMBAT`
- Run `/spec-analyze DIPLOMACY`

**Token Budget Used:** ~113K / 200K (Session 1)

**Estimated Remaining:** ~350K for Sessions 3-7

---

## Quick Reference: Commands

| Task | Command |
|------|---------|
| Split a spec | `/spec-split REQ-XXX-001` |
| Analyze system | `/spec-analyze COMBAT` |
| Check status | `cat docs/development/SPEC-INDEX.json \| jq '.summary'` |
| List pending splits | `cat docs/development/SPEC-INDEX.json \| grep -B1 '"atomic": false'` |
| Count analysis done | `ls docs/development/analysis/*.json \| wc -l` |
| Verify spec in doc | `grep "REQ-XXX-001" "docs/Game Systems/XXX-SYSTEM.md"` |

---

## Contact Points for Help

If completely stuck:
1. Read the plan: `C:\Users\J\.claude\plans\effervescent-crafting-balloon.md`
2. Check this HOW-TO
3. Examine SPEC-INDEX.json summary section
4. Review recent commits: `git log --oneline -10`

**Remember:** Each session is ~30-60 minutes. Don't rush. Verify after each step.
