# Dependency Analysis System - Redesign Complete

**Date:** 2026-01-13
**Reason:** Critical automation failure - `/spec-analyze-all` skill was fundamentally broken

## The Problem

### Original Design Flaw

The `/spec-analyze-all` skill had a critical architecture flaw:

1. **Generated JSON files** in `docs/development/analysis/`
2. **Never updated the actual spec markdown documents**
3. **Required 5-6 manual prompts** to complete due to context compacting
4. **Kept stopping and asking** "what should we do next?" instead of running autonomously

### Impact

- **Hours wasted** running automation that produced unusable output
- **51.9% audit pass rate** because specs were never actually updated
- **193 specs (44.9%)** still had placeholder text after "successful" automation
- **False progress** - commits claiming completion but no actual changes to specs

## The Solution

### New Architecture: Hybrid Approach

#### 1. Autonomous Script: `analyze-dependencies.js`

**For batch processing all 15 systems:**

```bash
node analyze-dependencies.js
```

**Features:**
- ✅ Runs completely autonomously (no Claude intervention)
- ✅ Writes Dependencies/Blockers **directly to markdown specs**
- ✅ Uses temp JSON only for validation, then deletes it
- ✅ Never stops to ask questions
- ✅ Pattern-based dependency detection
- ✅ Cross-system dependency mapping
- ✅ Processes all 15 systems in 30-60 seconds
- ✅ No context compacting issues

**How it works:**
1. Loads all 430 specs into memory
2. For each spec, analyzes dependencies using:
   - Explicit REQ-XXX-NNN references
   - Keyword pattern matching (e.g., "Credits" → depends on RESOURCE)
   - Split parent-child relationships
3. Writes Dependencies/Blockers fields directly to markdown
4. Creates temp JSON for validation
5. Validates all JSON data was migrated to markdown
6. Deletes temp JSON files on success
7. Reports results

#### 2. Interactive Skill: `/spec-analyze SYSTEM`

**For manual, one-system analysis:**

```bash
/spec-analyze COMBAT
```

**Features:**
- ✅ Interactive, guided by user
- ✅ AI-powered analysis (Claude's intelligence, not just patterns)
- ✅ Writes directly to markdown specs
- ✅ Good for complex systems needing deep analysis
- ✅ Can be refined interactively
- ✅ No JSON files - direct markdown updates only

**When to use:**
- After design changes to a specific system
- When you need Claude's understanding, not just pattern matching
- For reviewing/verifying existing dependencies
- For complex cross-system relationships

**When NOT to use:**
- Don't use for all 15 systems - use `node analyze-dependencies.js` instead

#### 3. Deleted: `/spec-analyze-all`

**Why removed:**
- Fundamentally broken for long-running tasks
- Context compacting caused it to stop and ask for guidance
- Required 5-6 manual re-prompts to complete
- Generated JSON but never updated specs
- No benefit over autonomous Node.js script

## Migration Completed

### What Was Fixed

Created `migrate-dependencies.js` to rescue the existing JSON data:

- ✅ Migrated 327 specs with dependency data from JSON to markdown
- ✅ Removed all 193 placeholder texts
- ✅ 95 specs have real dependencies documented
- ✅ 232 foundational specs marked as "None"
- ✅ Expected audit pass rate: **~85%+** (up from 51.9%)

### Obsolete Files Deleted

```
docs/development/analysis/*.json       # 15 system dependency files
docs/development/analysis/*.log        # Batch session logs
docs/development/analysis/*.md         # Summary reports
```

**Why deleted:**
- Data migrated to specs (single source of truth)
- Would get stale if kept
- No longer needed - new tools don't generate JSON

## Usage Guide

### For Routine Dependency Analysis

**Run the autonomous script:**

```bash
node analyze-dependencies.js
```

**What it does:**
1. Analyzes all 430 specs across 15 systems
2. Detects dependencies using patterns + keywords
3. Writes directly to markdown specs
4. Validates completion
5. Cleans up temp files
6. Reports results

**Time:** 30-60 seconds total
**No intervention required** - runs fully autonomously

### For Manual Analysis

**Use the skill for one system:**

```bash
/spec-analyze COMBAT
```

**What it does:**
1. Claude analyzes the system's specs
2. Detects dependencies using AI understanding
3. Writes directly to markdown specs
4. Reports what was found
5. You can guide and refine

**Time:** 2-5 minutes per system
**Interactive** - you can refine the analysis

### For Migration (One-Time)

**Already complete.** If needed again:

```bash
node migrate-dependencies.js
```

Migrates existing JSON dependency data to markdown specs.

## Design Principles

### 1. Single Source of Truth

**Markdown specs** are the authoritative source. No JSON files committed to the repository.

### 2. Autonomous Scripts for Batch Operations

Long-running tasks (15+ systems) use **Node.js scripts**, not Claude skills, to avoid context compacting issues.

### 3. Claude Skills for Interactive Work

Skills are for **interactive, guided analysis** where Claude's intelligence adds value.

### 4. Temp Files Only

If JSON is needed (validation, intermediate steps), it's **temporary and deleted** after use.

### 5. Direct Updates

All tools **write directly to markdown specs**, not to intermediate files that require separate migration.

## Lessons Learned

### What Went Wrong

1. **Skills != Automation for Long Tasks**
   - Claude skills with context compacting can't run 15-system batches autonomously
   - They stop and ask for guidance after context compacts

2. **JSON Generation Without Migration = Failure**
   - Original design generated JSON but never updated specs
   - Created false sense of progress

3. **Insufficient Stop Conditions**
   - Original skill didn't have explicit "NEVER STOP - CONTINUE AUTOMATICALLY" logic
   - Context compacting erased the continuation intent

### What Worked

1. **Node.js Scripts for Autonomy**
   - Completely autonomous
   - No context issues
   - Fast and reliable

2. **Hybrid Architecture**
   - Script for batch (autonomous)
   - Skill for interactive (guided)
   - Right tool for the job

3. **Direct Markdown Updates**
   - No intermediate files
   - Single source of truth
   - Immediate visibility of changes

## Future Improvements

### Potential Enhancements

1. **Dependency Graph Visualization**
   - Generate SVG/mermaid diagrams from markdown deps
   - On-demand, not committed files

2. **Circular Dependency Detection**
   - Validate no REQ-A-001 → REQ-A-002 → REQ-A-001 cycles
   - Add to validation script

3. **Implementation Order Generator**
   - Topological sort of dependencies
   - Generate recommended build order

4. **Impact Analysis Tool**
   - "What depends on REQ-XXX-001?"
   - "What breaks if I change this spec?"

All of these would be **on-demand tools**, not committed files.

## Files in This Solution

### Active Tools

- `analyze-dependencies.js` - Autonomous dependency analysis for all systems
- `migrate-dependencies.js` - Migrate existing JSON to markdown (one-time use)
- `.claude/commands/spec-analyze.md` - Interactive single-system analysis skill

### Temporary/Cleanup Scripts

- `migrate-dependencies-fix.js` - Fix-up script for remaining systems (can delete)
- `BATCH-ANALYSIS-COMPLETE.md` - Session log (can delete)
- `analyze-all-systems.js` - Old automation attempt (can delete)
- `process_splits.py` - Unrelated to dependencies (keep or evaluate separately)

### Deleted

- `.claude/commands/spec-analyze-all.md` - Broken batch analysis skill ❌
- `docs/development/analysis/` - All JSON and log files ❌

## Conclusion

The dependency analysis system has been **completely redesigned** to fix fundamental automation failures. The new hybrid approach uses:

- **Autonomous Node.js scripts** for batch processing (no stopping, no asking)
- **Interactive Claude skills** for manual analysis (AI-powered, guided)
- **Direct markdown updates** (single source of truth, no JSON)
- **Temp files only** (validation, then deleted)

**Result:** From 51.9% pass rate with broken automation to **expected ~85%+ pass rate** with working, reliable tools.
