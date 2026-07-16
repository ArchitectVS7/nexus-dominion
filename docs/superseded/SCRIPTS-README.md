# SDD Automation Scripts - Quick Reference

**Full Documentation:** See `docs/development/SDD-AUTOMATION-GUIDE.md`

---

## Quick Commands

### Analyze All Systems (Autonomous)
```bash
node analyze-dependencies.js
```
**Runtime:** ~60 seconds
**Updates:** All 430 specs across 15 systems
**Human intervention:** Zero (fully autonomous)

---

### Analyze Single System (Interactive)
```bash
/spec-analyze COMBAT
```
**Runtime:** 2-5 minutes
**Updates:** One system with AI-powered analysis
**Human intervention:** Interactive guidance

---

### Validate Spec Quality
```bash
node scripts/validate-specs.js
```
**Checks:** Field completeness, format compliance
**Reports:** Pass rate, missing fields, issues

---

## When to Use What

| Scenario | Use This |
|----------|----------|
| Regular dependency updates (all systems) | `node analyze-dependencies.js` |
| After adding new specs | `node analyze-dependencies.js` |
| Deep analysis of one complex system | `/spec-analyze SYSTEM` |
| Manual review and refinement | `/spec-analyze SYSTEM` |
| Check spec quality | `node scripts/validate-specs.js` |

---

## Script Locations

```
x-imperium/
├── analyze-dependencies.js          ← Main autonomous tool (ACTIVE)
├── .claude/commands/
│   ├── spec-analyze.md             ← Interactive skill (ACTIVE)
│   └── spec-deps-migrate.md        ← Migration helper (ARCHIVE)
├── scripts/
│   └── validate-specs.js           ← Quality checker (ACTIVE)
├── docs/
│   ├── Game Systems/               ← Spec documents (OUTPUT)
│   └── development/
│       └── SDD-AUTOMATION-GUIDE.md ← Full documentation
└── .archive/migration-2026-01-13/  ← One-time migration scripts
    ├── migrate-dependencies.js
    ├── migrate-dependencies-fix.js
    ├── BATCH-ANALYSIS-COMPLETE.md
    └── DEPENDENCY-ANALYSIS-REDESIGN.md
```

---

## Reusability Assessment

### ✅ 70% Reusable (With Config)

**`analyze-dependencies.js`** - Can be used for any SDD project

**What needs customization:**
1. `SYSTEM_FILES` mapping (lines 10-26) - Your system names and files
2. `CROSS_SYSTEM_PATTERNS` (lines 28-100) - Your domain keywords
3. Directory paths (lines 7-8) - If different from `docs/Game Systems/`

**What's fully reusable:**
- Core dependency detection logic
- Markdown parsing and updating
- Validation system
- Temp file management

**To use in new project:**
1. Copy `analyze-dependencies.js` to new project
2. Edit `SYSTEM_FILES` with your systems
3. Edit `CROSS_SYSTEM_PATTERNS` with your domain keywords
4. Run and test

---

### ✅ 100% Reusable (No Changes)

**`/spec-analyze`** Claude skill - Works for any SDD project
- No configuration needed
- Adapts to any spec format
- Uses AI to understand your domain

---

### ❌ One-Time Use (Archive/Delete)

These scripts were for **migrating bad JSON data** and are no longer needed:
- `migrate-dependencies.js` - ✅ Already executed
- `migrate-dependencies-fix.js` - ✅ Already executed
- `BATCH-ANALYSIS-COMPLETE.md` - Session log
- `DEPENDENCY-ANALYSIS-REDESIGN.md` - Design rationale

**Recommendation:** Move to `.archive/` directory for historical reference

---

## For Future SDD Projects

### Option 1: Project-Specific (Current Approach)

**Keep in each project:**
```bash
your-new-project/
├── analyze-dependencies.js     # Customized for this project
├── .claude/commands/
│   └── spec-analyze.md         # Copy from template
└── docs/specifications/        # Your spec documents
```

**Pros:** Self-contained, easy to customize per project
**Cons:** Duplicate code across projects

---

### Option 2: Global SDD Toolkit (Recommended for Multiple Projects)

**Create once, reuse many times:**

```bash
# 1. Create global toolkit directory
mkdir -p ~/sdd-toolkit/

# 2. Copy reusable templates
cp analyze-dependencies.js ~/sdd-toolkit/analyze-dependencies.template.js
cp .claude/commands/spec-analyze.md ~/sdd-toolkit/
cp docs/development/SDD-AUTOMATION-GUIDE.md ~/sdd-toolkit/

# 3. For each new project, copy and customize
cp ~/sdd-toolkit/analyze-dependencies.template.js ./analyze-dependencies.js
vim analyze-dependencies.js  # Edit SYSTEM_FILES and CROSS_SYSTEM_PATTERNS
```

**Pros:** Single source of truth, easy updates
**Cons:** Need to copy and customize for each project

---

## Next Steps

**For this project:**
1. ✅ Scripts are working
2. ✅ Documentation complete
3. 🔄 Archive migration scripts (optional)
4. 🔄 Run `node scripts/validate-specs.js` to verify ~85%+ pass rate

**For future projects:**
1. Decide: Project-specific vs Global toolkit
2. Copy `analyze-dependencies.js` as template
3. Customize for new domain
4. Test on small system first
5. Run on all systems

---

## Common Issues

**"Script reports validation errors"**
- Check spec format matches `### REQ-XXX-NNN:` pattern
- Manually fix problem specs
- Re-run

**"Missing cross-system dependencies"**
- Add keywords to `CROSS_SYSTEM_PATTERNS`
- Use `/spec-analyze SYSTEM` for AI detection
- Update patterns for future runs

**"Script too slow"**
- Reduce pattern complexity
- Check for inefficient regex
- Expected: ~0.15s per spec

**More help:** See `docs/development/SDD-AUTOMATION-GUIDE.md` § Troubleshooting

---

**Created:** 2026-01-13
**For:** X-Imperium SDD automation
**See also:** docs/development/SDD-AUTOMATION-GUIDE.md (full guide)
