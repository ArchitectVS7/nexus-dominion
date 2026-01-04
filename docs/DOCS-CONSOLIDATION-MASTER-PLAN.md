# Documentation Consolidation Master Plan

**Date**: 2026-01-02
**Status**: Ready for Execution
**Scope**: Entire `docs/` folder review and cleanup

---

## Executive Summary

**Current State**: 54 markdown files across 7 folders, significant redundancy and outdated content
**Target State**: ~20 essential files, clear organization, zero contradictions with new design direction

**Key Changes**:
- Remove 17 files from redesign-12-30-2025/ (keep 2 with insights)
- Archive 4 files from design/ folder to Legacy/
- Remove/Archive 4 files from frontend/
- Compress Legacy/Solar-Realms-Elite/ from 60MB to 30KB
- Update 3 core documents (PRD.md, VISION.md, frontend-developer-manual.md)

**Result**: 63% reduction in file count, 99.9% reduction in storage, 100% alignment with new direction

---

## Analysis Results by Folder

### 1. Root Docs (docs/)

**Reviewed**: 5 files
**Agent**: research-analyst (acd5949)

| File | Action | Priority | Effort |
|------|--------|----------|--------|
| **PRD.md** | Update & Split | HIGH | 4 hours |
| **VISION.md** | Minor updates | MEDIUM | 2 hours |
| **UX-ANALYSIS-2026-01.md** | Promote to UX-ROADMAP.md | HIGH | 1 hour |

**Key Issues**:
- PRD.md has crafting/syndicate (Sections 18-20) as core features → move to expansion/
- PRD.md describes 3-phase combat → update to unified D20 system
- PRD.md describes 8-level passive research → update to 3-tier draft system
- future-visions.md assumes crafting is baseline → clarify as expansion content

**Total Effort**: 8.5 hours

---

### 2. Design Folder (docs/design/)

**Reviewed**: 7 files
**Agent**: research-analyst (af58954)

| File | Action | Rationale |
|------|--------|-----------|
| **BOT_ARCHITECTURE.md** | ✅ Keep | Implementation details, no conflicts |
| **PARITY-CHECK.md** | ✅ Keep | Useful validation tool |
| **UI_DESIGN.md** | ✅ Keep | LCARS implementation guide |

**Result**: 7 files → 3 files (2 deleted, 2 archived)

---

### 3. Frontend Folder (docs/frontend/)

**Reviewed**: 7 files
**Agent**: research-analyst (a27887f)

| File | Action | Priority | Notes |
|------|--------|----------|-------|
| **frontend-developer-manual.md** | Update | HIGH | 60% still valid, update components |
| **SCREENSHOT_SPECS.md** | Update | Medium | Update inventory for map-centric UI |
| **ui-enhancement-plan.md** | Update | HIGH | Remove Phase 8, keep animations |

**Critical Gap**: No documentation for new panel/overlay system (needs 4 new docs)

**Result**: 7 files → 3 active files + 2 archived

---

### 4. Legacy Folder (docs/Legacy/)

**Reviewed**: ~100 files, 60MB
**Agent**: research-analyst (a4697d7)

**Recommendation**: Keep 5%, Archive 75% externally, Delete 20%

**Keep** (30KB):
- `legacy-analysis.md` - Legal protection (70% derivative assessment)
- `Patel-sre-design-notes.md` - Original author philosophy
- `FORMULA_REFERENCE.md` - Formula evolution reference

**Archive Externally** (52MB compressed):
- `decompile-results/` - Used once, never again
- `Ghidra projects` - Binary artifacts (regeneratable)
- `SRE PRD` - "Faithful port" spec (you pivoted)

**Delete** (8.5MB):
- `archive/` - Publicly available at johndaileysoftware.com
- `extracted-info/` - Exact duplicate of archive/
- `FLAVORS/` - Theme skins not used

**Result**: 60MB → 30KB (99.95% reduction)

---

### 5. Redesign 12-30-2025 Folder (docs/redesign-12-30-2025/)



**Result**: 19 files → 2 files

---

## Recommended New Structure

```
docs/
├── PRD.md                           ← Updated (crafting removed, combat/research updated)
├── VISION.md                        ← Minor updates (core vs expansion)
├── MILESTONES.md                    ← Keep as-is
├── UX-ROADMAP.md                    ← Renamed from UX-ANALYSIS (status tracking added)
├── CLAUDE.md                        ← Update folder structure references
│
├── design/
│   ├── BOT_ARCHITECTURE.md          ← Keep (implementation guide)
│   ├── UI_DESIGN.md                 ← Keep (LCARS specs)
│   └── PARITY-CHECK.md              ← Keep (validation tool)
│
├── frontend/
│   ├── frontend-developer-manual.md ← Updated (component reference rewrite)
│   ├── SCREENSHOT_SPECS.md          ← Updated (map-centric inventory)
│   ├── ui-enhancement-plan.md       ← Updated (Phase 8 removed)
│   ├── PANEL-SYSTEM.md              ← NEW (overlay architecture)
│   ├── STARMAP-INTEGRATION.md       ← NEW (map interaction patterns)
│   ├── NAVIGATION-PATTERNS.md       ← NEW (breadcrumb/history)
│   └── MAP-CENTRIC-MIGRATION.md     ← NEW (conversion guide)
│
├── expansion/                        ← NEW FOLDER
│   ├── CRAFTING-EXPANSION.md        ← From PRD Sections 18-19
│   ├── SYNDICATE-EXPANSION.md       ← From PRD Section 20
│   └── EXPANSION-ROADMAP.md         ← Renamed from future-visions.md
│
├── redesign-01-02-2026/
│   ├── RESEARCH-REDESIGN.md         ← 3-tier draft system
│   ├── CRAFTING-EXPANSION-CONCEPT.md ← Tech card draft vision
│   └── SYNDICATE-EXPANSION-CONCEPT.md ← Hidden traitor vision
│
├── redesign-12-30-2025/
│   ├── REDESIGN-ARCHIVE-README.md   ← Archive index
│   └── ARCHIVE-INSIGHTS.md          ← Essential wisdom (500 lines)
│
└── Legacy/
    ├── README.md                     ← NEW (explains archived content)
    ├── legacy-analysis.md            ← Keep (legal protection)
    ├── Patel-sre-design-notes.md     ← Keep (inspiration)
    ├── FORMULA_REFERENCE.md          ← Keep (formula evolution)
    ├── CORE_MECHANICS.md             ← From design/ (archived)
    ├── crafting-system.md            ← From design/ (archived)
    ├── BEFORE-AFTER-COMPARISON.md    ← From frontend/ (icon migration)
    ├── ICON-SYSTEM-REDESIGN.md       ← From frontend/ (completed work)
    └── Solar-Realms-Elite/
        └── [EXTERNAL ARCHIVE - compressed, moved to cloud storage]
```

---

## File Count Summary

| Folder | Before | After | Change |
|--------|--------|-------|--------|
| **Root** | 5 | 5 | Updated 3, renamed 1, moved 1 |
| **design/** | 7 | 3 | Deleted 2, archived 2 |
| **frontend/** | 7 | 7 | Updated 3, removed 2, archived 2, added 4 |
| **expansion/** | 0 | 3 | NEW |
| **redesign-01-02-2026/** | 3 | 3 | Keep as-is |
| **redesign-12-30-2025/** | 19 | 2 | Deleted 17 |
| **Legacy/** | ~100 | 8 | Archived 90+ externally |
| **TOTAL** | ~141 | ~31 | **78% reduction** |

---

## Execution Plan

### Phase 1: Low-Risk Deletions (Week 1)

**Priority**: Remove exact duplicates and superseded files
**Effort**: 2 hours
**Risk**: Zero

```bash
# 1. Delete exact duplicates
rm docs/design/MILESTONES.md
rm docs/design/GAME_VISION.md

# 2. Delete minimal/obsolete files
rm docs/frontend/frontend-todo.md
rm docs/frontend/INTEGRATION-EXAMPLE.md
rm docs/GAME-START-ISSUE-TURNOVER.md

# 3. Delete 17 files from redesign-12-30-2025/
# (keep REDESIGN-ARCHIVE-README.md and ARCHIVE-INSIGHTS.md)
```

---

### Phase 2: Archive to Legacy (Week 1)

**Priority**: Move outdated but historically valuable content
**Effort**: 1 hour
**Risk**: Low

```bash
# Create Legacy folder structure
mkdir -p docs/Legacy

# Move design/ archives
mv docs/design/CORE_MECHANICS.md docs/Legacy/
mv docs/design/crafting-system.md docs/Legacy/

# Move frontend/ archives
mv docs/frontend/BEFORE-AFTER-COMPARISON.md docs/Legacy/
mv docs/frontend/ICON-SYSTEM-REDESIGN.md docs/Legacy/

# Create Legacy README
cat > docs/Legacy/README.md << 'EOF'
# Legacy Documentation

Archived design documents preserved for historical reference.

## Files

### From design/
- **CORE_MECHANICS.md** - Superseded by PRD.md (3-phase combat, 9 planets)
- **crafting-system.md** - Deferred to expansion

### From frontend/
- **BEFORE-AFTER-COMPARISON.md** - Icon migration (complete)
- **ICON-SYSTEM-REDESIGN.md** - Icon system implementation (complete)

Archived: 2026-01-02
EOF
```

---

### Phase 3: Create Expansion Folder (Week 1)

**Priority**: Separate core from expansion content
**Effort**: 2 hours
**Risk**: Low

```bash
# Create expansion folder
mkdir -p docs/expansion

# Extract from PRD.md Sections 18-20
# (Manual extraction with header updates)

# Move future-visions.md
mv docs/future-visions.md docs/expansion/EXPANSION-ROADMAP.md

# Add header to clarify status
```

---

### Phase 4: Update Core Documents (Week 2)

**Priority**: Align with new design direction
**Effort**: 8 hours
**Risk**: Medium (requires careful editing)

1. **PRD.md** (4 hours)
   - Remove Sections 18-20 (moved to expansion/)
   - Update Section 7.2 (Combat) → unified D20
   - Update Section 10 (Research) → 3-tier draft
   - Remove redundant philosophy (keep in VISION)

2. **VISION.md** (2 hours)
   - Add "Core vs Expansion" section
   - Update research to draft-based
   - Fix planet count inconsistencies
   - Add map-centric UI philosophy

3. **UX-ANALYSIS-2026-01.md** → **UX-ROADMAP.md** (1 hour)
   - Rename file
   - Add implementation status tracking
   - Cross-reference with MILESTONES.md

4. **frontend-developer-manual.md** (1 hour)
   - Update Component Reference (Section 4)
   - Preserve architecture/data flow sections

---

### Phase 5: Update Frontend Docs (Week 2)

**Priority**: Reflect map-centric architecture
**Effort**: 4 hours
**Risk**: Low

1. **SCREENSHOT_SPECS.md** (30 min)
   - Update screenshot inventory
   - Add map-centric examples

2. **ui-enhancement-plan.md** (1 hour)
   - Remove Phase 8 (conflicts with map-centric)
   - Update component references

3. **Create new docs** (2.5 hours)
   - `PANEL-SYSTEM.md` - Overlay architecture
   - `STARMAP-INTEGRATION.md` - Map interactions
   - `NAVIGATION-PATTERNS.md` - Breadcrumb/history
   - `MAP-CENTRIC-MIGRATION.md` - Conversion guide

---

### Phase 6: Legacy Folder Cleanup (Week 3)

**Priority**: Compress SRE archive
**Effort**: 3 hours
**Risk**: Low (with backup)

1. **Create full backup** (30 min)
   - Upload to Google Drive/S3
   - Verify archive integrity

2. **Delete publicly available files** (30 min)
   - `archive/` folder (available at johndaileysoftware.com)
   - `extracted-info/` (duplicate)

3. **Compress decompile results** (1 hour)
   - Archive to external storage
   - Keep README with download link

4. **Update legacy-analysis.md** (1 hour)
   - Add notes on divergence from SRE
   - Reference archived materials

**Result**: 60MB → 30KB

---

## Timeline Summary

| Phase | Effort | Risk | Dependencies |
|-------|--------|------|--------------|
| **Phase 1** | 2 hours | Zero | None |
| **Phase 2** | 1 hour | Low | Phase 1 |
| **Phase 3** | 2 hours | Low | Phase 1 |
| **Phase 4** | 8 hours | Medium | Phase 2, 3 |
| **Phase 5** | 4 hours | Low | Phase 4 |
| **Phase 6** | 3 hours | Low | Backup created |
| **TOTAL** | **20 hours** | | Over 3 weeks |

---

## Risk Mitigation

### Before Starting
- [x] Full git commit of current state
- [ ] Create zip backup of docs/ folder
- [ ] Notify team of documentation restructure

### During Execution
- [ ] Test all internal doc links after moving files
- [ ] Verify no code references deleted docs
- [ ] Update CLAUDE.md with new structure

### After Completion
- [ ] Run link checker on all markdown files
- [ ] Update README.md if it references docs/
- [ ] Tag git commit: "docs: major consolidation 2026-01-02"

---

## Success Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total files** | 141 | 31 | -78% |
| **Storage size** | ~65MB | ~1MB | -98.5% |
| **Outdated docs** | 28 | 0 | -100% |
| **Contradictions** | 12 | 0 | -100% |
| **Core docs aligned** | 60% | 100% | +40% |

---

## Approval Checklist

Before executing:
- [ ] Review Phase 1 deletions (no unique content lost?)
- [ ] Review Phase 2 archives (historical value preserved?)
- [ ] Review Phase 4 updates (new direction clear?)
- [ ] Verify backup created (Legacy/Solar-Realms-Elite/)
- [ ] Approve timeline (3 weeks acceptable?)

---

## Post-Consolidation Maintenance

### Monthly
- [ ] Run PARITY-CHECK.md (validate PRD vs VISION alignment)
- [ ] Update UX-ROADMAP.md status

### Per Major Feature
- [ ] Update PRD.md with new systems
- [ ] Update VISION.md if philosophy changes
- [ ] Update frontend-developer-manual.md if architecture changes

### Per Expansion
- [ ] Add expansion doc to expansion/ folder
- [ ] Update EXPANSION-ROADMAP.md
- [ ] Cross-reference with base game systems

---

**Ready to Execute?** Choose your path:
1. **Full execution** - All 6 phases (20 hours over 3 weeks)
2. **Quick wins only** - Phase 1-3 (5 hours, low risk)
3. **Core updates only** - Phase 4 (8 hours, critical alignment)
4. **Custom** - Pick specific phases
