# Specification Scripts

Automation scripts for validating and managing specifications in the Nexus Dominion project.

## Scripts

### validate-specs.js

Validates spec integrity across all design documents.

**Checks:**
- All spec IDs are unique
- Spec IDs follow REQ-XXX-NNN format
- All specs have required fields (Description, Status, Code, Tests, Source)
- No duplicate spec IDs
- Sequential numbering within systems
- All @spec tags in design docs reference valid specs
- Status values are valid (Draft, Implemented, Validated, Deprecated)
- Status consistency (Validated specs must have Code and Tests)

**Usage:**
```bash
node scripts/validate-specs.js
```

**Exit codes:**
- `0` - All validations passed
- `1` - Validation errors found

**Example output:**
```
Validating Specifications

Found 5 design document(s):
  - COMBAT-SYSTEM.md
  - BOT-SYSTEM.md
  - RESEARCH-SYSTEM.md
  - GAME-DESIGN.md
  - FRONTEND-DESIGN.md

Extracted 47 specification(s)
Found 23 @spec tag(s)

Validation Results:

✓ All specifications are valid!

Summary:
  Total Specs: 47
  Draft: 15
  Implemented: 12
  Validated: 20

By System:
  REQ-BOT: 10 specs
  REQ-COMBAT: 15 specs
  REQ-GAME: 5 specs
  REQ-RSCH: 12 specs
  REQ-UI: 5 specs
```

---

### generate-registry.js

Generates SPEC-REGISTRY.md from all design documents.

**Features:**
- Scans all design documents for REQ-XXX-NNN specs
- Creates centralized registry with metadata
- Groups specs by system and status
- Calculates completion statistics
- Links to source documents and code files

**Usage:**
```bash
node scripts/generate-registry.js
```

**Output:** `docs/SPEC-REGISTRY.md`

**Example output:**
```
Generating Specification Registry

Found 5 design document(s)
  - COMBAT-SYSTEM.md: 15 spec(s)
  - BOT-SYSTEM.md: 10 spec(s)
  - RESEARCH-SYSTEM.md: 12 spec(s)
  - GAME-DESIGN.md: 5 spec(s)
  - FRONTEND-DESIGN.md: 5 spec(s)

Total: 47 specification(s)

✓ Registry generated successfully
  Output: docs/SPEC-REGISTRY.md

Statistics:
  Total Specs: 47
  Systems: 5
  Validated: 20 (42.6%)
  Draft: 15
  Implemented: 12
  Deprecated: 0
```

---

## Integration with Git Workflow

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate specs before allowing commit
node scripts/validate-specs.js

# Regenerate registry if design docs changed
if git diff --cached --name-only | grep -q 'docs/design/.*\.md'; then
  node scripts/generate-registry.js
  git add docs/SPEC-REGISTRY.md
fi
```

### GitHub Actions

Add to `.github/workflows/validate-specs.yml`:

```yaml
name: Validate Specifications

on:
  pull_request:
    paths:
      - 'docs/design/**/*.md'
      - 'scripts/**/*.js'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Validate specs
        run: node scripts/validate-specs.js

      - name: Generate registry
        run: node scripts/generate-registry.js

      - name: Check for changes
        run: |
          if ! git diff --exit-code docs/SPEC-REGISTRY.md; then
            echo "❌ SPEC-REGISTRY.md is out of date"
            echo "Run: node scripts/generate-registry.js"
            exit 1
          fi
```

---

## Troubleshooting

### "No design documents found"

**Cause:** Scripts can't find `docs/design/` directory

**Solution:** Ensure you're running from project root:
```bash
cd /path/to/x-imperium
node scripts/validate-specs.js
```

### "Invalid spec ID format"

**Cause:** Spec ID doesn't match `REQ-XXX-NNN` pattern

**Valid examples:**
- REQ-COMBAT-001 ✓
- REQ-BOT-042 ✓
- REQ-RSCH-010 ✓

**Invalid examples:**
- REQ-Combat-001 ✗ (lowercase)
- COMBAT-001 ✗ (missing REQ prefix)
- REQ-COMBAT-1 ✗ (need 3 digits)

### "Duplicate spec ID"

**Cause:** Same spec ID appears in multiple documents

**Solution:** Each spec ID must be globally unique. Use different numbering:
```
❌ docs/design/COMBAT-SYSTEM.md: REQ-COMBAT-001
❌ docs/design/GAME-DESIGN.md: REQ-COMBAT-001

✓ docs/design/COMBAT-SYSTEM.md: REQ-COMBAT-001
✓ docs/design/GAME-DESIGN.md: REQ-GAME-001
```

### "Status is Validated but Code field is empty"

**Cause:** Spec marked as Validated without implementation details

**Solution:** Update spec with actual code file paths:

**Before:**
```markdown
**Code:** TBD
**Status:** Validated
```

**After:**
```markdown
**Code:**
- `src/lib/combat/combat-service.ts` - resolveAttack()

**Status:** Validated
```

---

## Development

### Requirements

- Node.js 14+ (uses built-in modules only)
- No external dependencies required

### Adding New Checks

Edit `scripts/validate-specs.js` and add your validation logic:

```javascript
// ===========================
// Check N: Your New Check
// ===========================
allSpecs.forEach(spec => {
  if (/* your condition */) {
    errors.push(`${spec.id}: Your error message`);
  }
});
```

### Extending Registry Format

Edit `scripts/generate-registry.js` and modify the markdown generation:

```javascript
markdown += '## Your New Section\n\n';
// Add your content
```

---

## FAQ

**Q: How often should I run these scripts?**

A: Run `validate-specs.js` before every commit. Run `generate-registry.js` after updating any design document.

**Q: Can I edit SPEC-REGISTRY.md manually?**

A: No, it's auto-generated. Your changes will be overwritten. Update design documents instead.

**Q: What if a spec doesn't have tests yet?**

A: Use `**Tests:** TBD` in the spec. Validation will pass but show a warning.

**Q: Should I commit SPEC-REGISTRY.md?**

A: Yes, commit it so the registry is always up-to-date in the repository.

**Q: How do I add a new system prefix?**

A: Just use it in your specs (e.g., REQ-NEWSYS-001). The scripts auto-detect new systems.

---

## Related Documentation

- [SPEC-DRIVEN-DEVELOPMENT.md](../docs/development/SPEC-DRIVEN-DEVELOPMENT.md) - Full SDD methodology
- [GAME-SYSTEM-TEMPLATE.md](../docs/development/GAME-SYSTEM-TEMPLATE.md) - Design document template
- [PRD-EXECUTIVE.md](../docs/PRD-EXECUTIVE.md) - Project overview

---

**Version:** 1.0
**Last Updated:** 2026-01-12
