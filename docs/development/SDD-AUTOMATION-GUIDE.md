# Specification-Driven Development (SDD) - Automation Guide

**Project:** X-Imperium
**Created:** 2026-01-13
**Purpose:** Documentation for autonomous dependency analysis tools

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Available Tools](#available-tools)
3. [Tool Usage](#tool-usage)
4. [Script Reusability](#script-reusability)
5. [Customization Guide](#customization-guide)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Initial Setup (One-Time)

If starting a new SDD project from scratch:

1. **Create spec template** with these required fields:
   ```markdown
   ### REQ-XXX-NNN: Spec Title

   **Description:** What this spec does

   **Rationale:** Why this spec exists

   **Dependencies:** (specs this depends on)

   **Blockers:** (specs that depend on this)

   **Source:** Design doc reference

   **Code:** Implementation file paths

   **Tests:** Test file paths

   **Status:** Draft | Implemented | Validated
   ```

2. **Organize specs into system documents:**
   - One markdown file per game system
   - Store in `docs/Game Systems/`
   - Use consistent spec ID format: `REQ-{SYSTEM}-{NUMBER}`

3. **Configure the automation** (see Customization Guide)

### Daily Usage

**To analyze dependencies across all systems:**
```bash
node analyze-dependencies.js
```

**To analyze a single system interactively:**
```bash
/spec-analyze COMBAT
```

**To validate spec quality:**
```bash
node scripts/validate-specs.js
```

---

## Available Tools

### 1. `analyze-dependencies.js` (Primary Tool)

**Purpose:** Autonomous batch dependency analysis for all systems

**Type:** Reusable with customization

**When to use:**
- After adding new specs
- After modifying spec descriptions
- Regular dependency updates (weekly/monthly)
- Before major releases

**Runtime:** 30-60 seconds for ~430 specs

**Output:** Writes Dependencies/Blockers directly to spec markdown files

---

### 2. `/spec-analyze` (Claude Skill)

**Purpose:** Interactive, AI-powered single-system analysis

**Type:** Reusable (Claude Code skill)

**When to use:**
- Deep analysis of one system
- Complex cross-system dependencies needing AI understanding
- Manual review and refinement
- After significant design changes to specific system

**Runtime:** 2-5 minutes per system (interactive)

**Output:** Writes Dependencies/Blockers directly to spec markdown files

---

### 3. `migrate-dependencies.js` (One-Time Tool)

**Purpose:** Migrate existing JSON dependency data to markdown specs

**Type:** Project-specific, one-time use

**When to use:**
- Only needed if you have existing JSON dependency files to migrate
- After running old/broken automation that generated JSON
- NOT needed for new projects

**Status:** ✅ Already executed for this project, can be archived

---

### 4. `migrate-dependencies-fix.js` (One-Time Tool)

**Purpose:** Fix remaining specs after initial migration

**Type:** Project-specific, one-time use

**Status:** ✅ Already executed, can be archived

---

## Tool Usage

### Running `analyze-dependencies.js`

**Full autonomous analysis:**
```bash
node analyze-dependencies.js
```

**What it does:**
1. Loads all 430 specs into memory
2. Analyzes each spec for dependencies using:
   - Explicit `REQ-XXX-NNN` references
   - Keyword patterns (e.g., "Credits" → depends on RESOURCE)
   - Cross-system mappings
   - Parent-child relationships (split specs)
3. Writes `**Dependencies:**` and `**Blockers:**` fields to markdown
4. Creates temp JSON files for validation
5. Validates all JSON data was written to markdown
6. Deletes temp JSON files on success
7. Reports results

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║     AUTONOMOUS DEPENDENCY ANALYSIS - ALL SYSTEMS           ║
╚════════════════════════════════════════════════════════════╝

[1/15] Analyzing RESOURCE...
  ✓ Updated 6 specs, found 18 dependencies
[2/15] Analyzing SECTOR...
  ✓ Updated 12 specs, found 56 dependencies
...

╔════════════════════════════════════════════════════════════╗
║              ANALYSIS SUMMARY                              ║
╚════════════════════════════════════════════════════════════╝

Systems Processed:        15/15
Specs Analyzed:           430
Specs Updated:            279
Dependencies Found:       1074
Errors:                   0

✓ Autonomous Analysis Complete
```

**If validation fails:**
- Check `temp-analysis/` directory for JSON files
- Review error messages for specific specs
- Fix issues manually
- Re-run script

---

### Running `/spec-analyze`

**Single system analysis:**
```bash
/spec-analyze COMBAT
```

**What happens:**
1. Claude loads the COMBAT system document
2. Analyzes each spec using AI understanding
3. Detects dependencies (explicit and implicit)
4. Writes Dependencies/Blockers to markdown
5. Reports what was found

**When Claude asks questions:**
- Provide guidance on complex dependencies
- Clarify cross-system relationships
- Confirm or reject detected dependencies

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║      DEPENDENCY ANALYSIS COMPLETE - COMBAT                 ║
╚════════════════════════════════════════════════════════════╝

Specs Analyzed:           18
Specs Updated:            14
Dependencies Found:       31
Cross-System References:  15
Foundational Specs:       4

✓ All updates written directly to markdown
```

---

## Script Reusability

### ✅ Highly Reusable (With Config)

**`analyze-dependencies.js`** can be used for any SDD project with these customizations:

#### Required Configuration Changes

1. **System Files Mapping** (lines 10-26):
   ```javascript
   const SYSTEM_FILES = {
     'YOUR-SYSTEM-1': 'YOUR-SYSTEM-1.md',
     'YOUR-SYSTEM-2': 'YOUR-SYSTEM-2.md',
     // ... add your systems
   };
   ```

2. **Cross-System Patterns** (lines 28-100):
   ```javascript
   const CROSS_SYSTEM_PATTERNS = {
     'YOUR-SYSTEM-1': {
       patterns: ['keyword1', 'keyword2'],
       systems: ['RELATED-SYSTEM-A', 'RELATED-SYSTEM-B']
     },
     // ... add your patterns
   };
   ```

3. **Directory Paths** (lines 7-8):
   ```javascript
   const SYSTEMS_DIR = './docs/Game Systems'; // Adjust to your structure
   const TEMP_DIR = './temp-analysis';
   ```

#### Core Logic (100% Reusable)

These don't need changes:
- Spec extraction regex (works for any `### REQ-XXX-NNN:` format)
- Dependency detection logic
- Markdown update mechanism
- Validation system
- Temp file cleanup

---

### ✅ Fully Reusable (No Changes)

**`/spec-analyze`** Claude skill works for any SDD project:
- No hardcoded project specifics
- Uses AI to understand context
- Adapts to any spec format
- Works with any cross-system relationships

Just run `/spec-analyze YOUR-SYSTEM` and it works.

---

### ❌ Project-Specific (Not Reusable)

**Migration scripts** are one-time, project-specific:
- `migrate-dependencies.js` - Only for this project's JSON migration
- `migrate-dependencies-fix.js` - Only for fixing this project's edge cases

These can be **deleted or archived** after use.

---

## Customization Guide

### For a New SDD Project

#### Step 1: Copy Core Script

Copy `analyze-dependencies.js` to your new project:
```bash
cp analyze-dependencies.js /path/to/new-project/
```

#### Step 2: Configure System Files

Edit `SYSTEM_FILES` constant:
```javascript
const SYSTEM_FILES = {
  'AUTH': 'AUTHENTICATION-SYSTEM.md',
  'DATABASE': 'DATABASE-SYSTEM.md',
  'API': 'API-SYSTEM.md',
  'CACHE': 'CACHING-SYSTEM.md',
  // ... your systems
};
```

**Format:** `'SYSTEM-PREFIX': 'document-filename.md'`

#### Step 3: Configure Cross-System Patterns

Edit `CROSS_SYSTEM_PATTERNS` to match your domain:

**Example for a Web App:**
```javascript
const CROSS_SYSTEM_PATTERNS = {
  'AUTH': {
    patterns: ['authentication', 'login', 'user', 'session', 'JWT'],
    systems: ['DATABASE', 'API']
  },
  'DATABASE': {
    patterns: ['database', 'query', 'table', 'model', 'schema'],
    systems: ['API', 'CACHE']
  },
  'API': {
    patterns: ['endpoint', 'route', 'REST', 'GraphQL', 'request'],
    systems: ['AUTH', 'DATABASE', 'CACHE']
  },
  'CACHE': {
    patterns: ['cache', 'Redis', 'invalidation', 'TTL'],
    systems: ['DATABASE', 'API']
  }
};
```

**Example for a Mobile App:**
```javascript
const CROSS_SYSTEM_PATTERNS = {
  'UI': {
    patterns: ['screen', 'component', 'view', 'navigation'],
    systems: ['STATE', 'API-CLIENT']
  },
  'STATE': {
    patterns: ['state', 'Redux', 'store', 'reducer', 'action'],
    systems: ['UI', 'STORAGE']
  },
  'API-CLIENT': {
    patterns: ['API', 'fetch', 'request', 'response', 'endpoint'],
    systems: ['STATE', 'AUTH']
  },
  'STORAGE': {
    patterns: ['persistence', 'AsyncStorage', 'local storage'],
    systems: ['STATE']
  },
  'AUTH': {
    patterns: ['authentication', 'token', 'credentials', 'biometric'],
    systems: ['API-CLIENT', 'STORAGE']
  }
};
```

#### Step 4: Adjust Directory Paths (if needed)

```javascript
const SYSTEMS_DIR = './docs/specifications'; // Your spec directory
const TEMP_DIR = './temp-analysis';
```

#### Step 5: Test on One System

Before running on all systems, test on one:
1. Comment out all but one system in `SYSTEM_FILES`
2. Run: `node analyze-dependencies.js`
3. Verify output looks correct
4. Check the markdown file was updated properly
5. If good, uncomment all systems and run full analysis

---

## Advanced Customization

### Adding Custom Dependency Detection Logic

You can extend `findDependencies()` method (lines 200-260) to add custom patterns:

**Example: Detect formula dependencies**
```javascript
// In findDependencies method, add:

// 4. Formula pattern matching
const formulaRegex = /\*\*Formula:\*\*\s*([^*]+)/;
const formulaMatch = body.match(formulaRegex);
if (formulaMatch) {
  const formula = formulaMatch[1];

  // Detect mathematical references
  if (/networth|net_worth/i.test(formula)) {
    dependencies.push('REQ-ECON-001'); // Economic calculation spec
  }
  if (/power|combat_power/i.test(formula)) {
    dependencies.push('REQ-COMBAT-001'); // Combat power spec
  }
}
```

**Example: Detect database table dependencies**
```javascript
// Detect database references
const tableRegex = /`(\w+)` table/gi;
let tableMatch;
while ((tableMatch = tableRegex.exec(body)) !== null) {
  const tableName = tableMatch[1];
  // Find spec that defines this table
  const tableSpec = this.findSpecByPattern(`${tableName} table definition`);
  if (tableSpec && !dependencies.includes(tableSpec.id)) {
    dependencies.push(tableSpec.id);
  }
}
```

### Adding Custom Validation

Extend `validate()` method (lines 400-450) to add custom checks:

```javascript
// Check for circular dependencies
const circularDeps = this.findCircularDependencies(jsonData.specs);
if (circularDeps.length > 0) {
  console.log('  ⚠ Circular dependencies detected:');
  circularDeps.forEach(cycle => {
    console.log(`    ${cycle.join(' → ')}`);
  });
  allValid = false;
}

// Check for orphaned specs (no dependencies, no dependents)
const orphanedSpecs = jsonData.specs.filter(s =>
  s.dependencies.length === 0 && s.blockers.length === 0
);
if (orphanedSpecs.length > 0) {
  console.log(`  ⚠ ${orphanedSpecs.length} orphaned specs (isolated from dependency graph)`);
}
```

---

## Directory Structure Recommendation

### For This Project (Current)

**Keep scripts in root for now:**
```
x-imperium/
├── analyze-dependencies.js          ← Active tool
├── .claude/commands/spec-analyze.md ← Active skill
├── docs/
│   ├── Game Systems/                ← Spec documents
│   └── development/
│       └── SDD-AUTOMATION-GUIDE.md  ← This guide
└── scripts/
    └── validate-specs.js            ← Quality validation
```

**Archive migration scripts:**
```bash
mkdir -p .archive/migration-2026-01-13
mv migrate-dependencies.js .archive/migration-2026-01-13/
mv migrate-dependencies-fix.js .archive/migration-2026-01-13/
mv BATCH-ANALYSIS-COMPLETE.md .archive/migration-2026-01-13/
mv DEPENDENCY-ANALYSIS-REDESIGN.md .archive/migration-2026-01-13/
```

---

### For Future Projects (Recommended)

**Create a global SDD toolkit:**

```bash
# Create global tools directory
mkdir -p ~/sdd-tools/

# Copy reusable script
cp analyze-dependencies.js ~/sdd-tools/analyze-dependencies.template.js

# Copy skill
cp .claude/commands/spec-analyze.md ~/sdd-tools/spec-analyze.md

# Copy documentation
cp docs/development/SDD-AUTOMATION-GUIDE.md ~/sdd-tools/GUIDE.md
```

**Then for each new project:**
```bash
# Copy template and customize
cp ~/sdd-tools/analyze-dependencies.template.js ./analyze-dependencies.js

# Edit SYSTEM_FILES and CROSS_SYSTEM_PATTERNS for your project
vim analyze-dependencies.js

# Copy skill to project
cp ~/sdd-tools/spec-analyze.md ./.claude/commands/
```

---

## Troubleshooting

### Script Reports Validation Errors

**Error:** "Spec REQ-XXX-NNN missing Dependencies field"

**Cause:** Script's regex didn't match the spec format

**Fix:**
1. Check spec format in markdown matches `### REQ-XXX-NNN:` pattern
2. Verify spec has proper spacing around field names
3. Manually add Dependencies/Blockers to that spec
4. Re-run script

---

### Script Updates Wrong Specs

**Error:** Dependencies added to wrong place in spec

**Cause:** Insertion point detection failed

**Fix:**
1. Ensure spec has `**Rationale:**` or `**Description:**` field
2. Check for unusual formatting (extra newlines, weird characters)
3. Review the `updateSpecInMarkdown()` method regex patterns

---

### Circular Dependencies Detected

**Error:** REQ-A-001 depends on REQ-A-002, which depends on REQ-A-001

**Cause:** Actual circular dependency in design

**Fix:**
1. Review the dependency chain
2. Determine which dependency is incorrect
3. Manually remove the circular reference
4. Consider if one spec should be split or refactored

---

### Script Too Slow

**Issue:** Takes >5 minutes for 400+ specs

**Cause:** Inefficient pattern matching or file I/O

**Fix:**
1. Check `CROSS_SYSTEM_PATTERNS` - too many patterns slows it down
2. Reduce pattern complexity (use simpler regex)
3. Consider caching spec lookups
4. Profile with Node.js profiler to find bottleneck

---

### Missing Cross-System Dependencies

**Issue:** Expected cross-system deps not detected

**Cause:** Keywords not in `CROSS_SYSTEM_PATTERNS`

**Fix:**
1. Add relevant keywords to pattern list
2. Use `/spec-analyze SYSTEM` for AI-powered detection
3. Manually add missing dependencies
4. Update `CROSS_SYSTEM_PATTERNS` for future runs

---

## Best Practices

### 1. Regular Analysis

Run dependency analysis:
- **After adding new specs** (weekly during active development)
- **After major design changes** (when refactoring systems)
- **Before releases** (ensure dependency graph is current)
- **Monthly** (maintenance, catch drift)

### 2. Version Control

**Always commit before running analysis:**
```bash
git add .
git commit -m "Pre-analysis checkpoint"
node analyze-dependencies.js
git diff  # Review changes
git commit -am "analyze-dependencies: Update all systems"
```

### 3. Manual Review

**Spot-check automated results:**
- Review 10-20 random specs
- Check cross-system dependencies make sense
- Verify foundational specs have no dependencies
- Look for missing dependencies (false negatives)

### 4. Iterative Improvement

**Improve pattern detection over time:**
1. Note specs with missing dependencies
2. Identify common keywords in those specs
3. Add keywords to `CROSS_SYSTEM_PATTERNS`
4. Re-run analysis
5. Document pattern improvements

### 5. Documentation

**Keep this guide updated:**
- Add new customizations
- Document project-specific patterns
- Note common issues and fixes
- Share learnings with team

---

## Migration from Old System

If you have an existing SDD project without automation:

### Step 1: Audit Current State
```bash
# Count specs
grep -r "^### REQ-" docs/ | wc -l

# Check for Dependencies fields
grep -r "**Dependencies:**" docs/ | wc -l

# Find placeholders
grep -r "to be filled" docs/
```

### Step 2: Clean Up Specs
- Ensure all specs follow standard format
- Remove placeholder text
- Standardize field names

### Step 3: Initial Run
```bash
# Backup first!
git add . && git commit -m "Pre-automation backup"

# Configure script for your project
vim analyze-dependencies.js

# Test on one system
node analyze-dependencies.js  # (with only 1 system enabled)

# Review output
git diff

# If good, enable all systems and run full analysis
```

### Step 4: Manual Cleanup
- Review auto-generated dependencies
- Fix any incorrect detections
- Add missing dependencies
- Commit final result

---

## Performance Metrics

**Expected performance** (based on X-Imperium):

| Specs | Systems | Runtime | Dependencies Found |
|-------|---------|---------|-------------------|
| 430   | 15      | ~60s    | 1,074             |

**Scaling estimates:**
- ~0.15s per spec analyzed
- Linear scaling up to ~1000 specs
- May slow down with complex cross-system patterns

---

## Future Enhancements

**Potential improvements** (not yet implemented):

1. **Dependency Visualization**
   - Generate Mermaid/GraphViz diagrams
   - Interactive dependency explorer
   - Critical path analysis

2. **Circular Dependency Detection**
   - Automated detection and reporting
   - Suggested fixes

3. **Implementation Order**
   - Topological sort for build order
   - Wave-based implementation planning

4. **Impact Analysis**
   - "What depends on spec X?"
   - "What breaks if I change spec Y?"

5. **Confidence Scores**
   - Rate dependency detection confidence
   - Flag uncertain dependencies for manual review

6. **Multi-Project Support**
   - Single script handles multiple projects
   - Config file per project
   - Centralized SDD toolkit

---

## Support & Contributing

**Questions or issues?**
- Check this guide's Troubleshooting section
- Review commit history for examples
- Ask Claude Code for help: `/spec-analyze --help`

**Want to improve the tools?**
- Document your customizations
- Share pattern improvements
- Report bugs and edge cases
- Suggest enhancements

---

**Last Updated:** 2026-01-13
**Author:** Claude Code + VS7
**Project:** X-Imperium
**License:** Internal use, adapt as needed
