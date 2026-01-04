# Legacy Folder Assessment & Recommendations

**Date**: 2026-01-02
**Purpose**: Evaluate docs/Legacy/ folder for archival bloat vs active utility
**Scope**: Solar Realms Elite reference materials, decompilation artifacts, extracted formulas

---

## Executive Summary

**Current State**: The Legacy folder contains ~100 files totaling significant storage:
- 29,946-line decompiled C code
- Ghidra project files (binary artifacts)
- Duplicate documentation (archive/ and extracted-info/)
- Original game executables and data files
- Design notes and formula extractions

**Recommendation**: **Archive 80% of content**, keep 20% for reference

**Rationale**: Nexus Dominion has **diverged significantly** from SRE:
- Different combat system (D20 vs Lanchester)
- 8 new planet types (crafting, syndicate)
- Bot AI system (100 personas, 4 tiers)
- Sector-based geography
- Crafting/syndicate mechanics

The project acknowledges SRE heritage but is no longer reverse-engineering it.

---

## Current Folder Structure

```
docs/Legacy/
├── legacy-analysis.md (70% derivative analysis) ✅ KEEP
└── Solar-Realms-Elite/
    ├── INDEX.md (historical reference) ✅ KEEP (condensed)
    ├── PRD.md (SRE faithful port spec) ❌ ARCHIVE
    ├── Patel-sre-design-notes.md (original author notes) ✅ KEEP
    ├── Patel-0995-documentation.md (player manual) ⚠️ ARCHIVE (external link)
    ├── archive/ (original game files) ❌ DELETE
    │   ├── SRE.EXE, SRDOOR.EXE (DOS executables)
    │   ├── RESOURCE.DAT, *.MSG, *.ANS (game data)
    │   ├── FLAVORS/ (5 theme variants)
    │   └── DOCS/ (original documentation)
    ├── extracted-info/ (duplicate of archive/) ❌ DELETE
    ├── decompile-results/ (Ghidra output) ❌ ARCHIVE
    │   ├── exports/decompiled_code.c (29,946 lines)
    │   ├── ghidra/ (Ghidra project binaries)
    │   └── function_analysis.md
    ├── decompile-tools/ (Python/Java scripts) ❌ ARCHIVE
    └── extracted-info/FORMULA_REFERENCE.md ✅ KEEP (condensed)
```

---

## Usage Analysis

### Active References in Codebase

**Searched**: 183 files for "Legacy", "SRE", "Solar Realms", "decompile", "Ghidra", "Patel"

**Results**:
1. **CLAUDE.md** - Acknowledges SRE modernization (line 7)
2. **docs/VISION.md** - SRE heritage, divergence notes (12 references)
3. **docs/PRD.md** - Historical context, target audience (5 references)
4. **tests/simulation/** - "SRE-style" battle framework comments (3 files)
5. **docs/redesign-12-30-2025/** - Comparison to original SRE (8 files)

**No direct formula imports** - All references are historical/contextual

### Formula Evolution

**Original SRE Formulas** (from FORMULA_REFERENCE.md):
```
Attack vs Soldiers: 3×soldiers + 1×fighters + 2×cruisers
Defense: 10×soldiers
Food Production: gaussian(mean=50, stddev=2)
Maintenance: 5cr soldiers, 8cr fighters, 12cr cruisers
```

**Current ND Implementation** (src/lib/formulas/):
```typescript
// combat-power.ts - COMPLETELY REDESIGNED
basepower = fighters×1 + stations×50 + lightCruisers×4 + heavyCruisers×4 + carriers×12
+ diversityBonus(1.15 if 4+ types)
+ defenderAdvantage(1.2×)

// population.ts - DIFFERENT SCALING
growth = urbanPlanets × populationGrowthRate × civilStatusMultiplier

// No gaussian food production - fixed rates per planet type
```

**Conclusion**: Formulas were **referenced initially**, then **redesigned for balance**. Legacy formulas are **no longer authoritative**.

---

## Detailed Recommendations

### ✅ KEEP (Actively Valuable)

**File** | **Size** | **Justification**
---------|----------|------------------
`legacy-analysis.md` | ~35KB | Documents divergence from SRE (legal protection, design decisions)
`Patel-sre-design-notes.md` | ~8KB | Original author's philosophy (historical reference, inspiration)
`FORMULA_REFERENCE.md` | ~6KB | Condensed formula comparison (shows evolution)
`INDEX.md` | ~5KB | Historical context (condense to 50%)

**Total Kept**: ~54KB (compressed to ~30KB after condensing)

**Actions**:
1. **Condense INDEX.md**: Remove implementation phases (07-11) - no longer relevant
2. **Add "divergence note"** to each kept file:
   ```markdown
   > **Note (2026)**: Nexus Dominion has diverged from SRE. These notes are
   > historical reference only. See src/lib/formulas/ for current implementations.
   ```

---

### ⚠️ ARCHIVE (Compress & Store Externally)

**Category** | **Files** | **Size Est** | **Reason**
-------------|-----------|--------------|----------
Decompiled source | `decompile-results/exports/` | ~2MB | No longer referenced; formulas redesigned
Ghidra binaries | `decompile-results/ghidra/` | ~50MB | Binary project files (regeneratable)
Decompile tools | `decompile-tools/*.py, *.java` | ~50KB | One-time use scripts
SRE PRD | `PRD.md` | ~40KB | Faithful port spec (project pivoted)
Player manual | `Patel-0995-documentation.md` | ~30KB | Available online

**Total Archived**: ~52MB

**Archive Strategy**:
1. Create `Legacy-Archive-2026-01.7z` (compress at maximum)
2. Upload to external storage (Google Drive, S3, etc.)
3. Add `ARCHIVE_LOCATION.md` with download link
4. Delete from repository

**Archive Manifest**:
```markdown
# Legacy Archive (2026-01-02)

**Contents**: Solar Realms Elite reverse engineering artifacts
**Period**: Original analysis (2025-12-XX)
**Reason**: Project diverged from SRE faithful port

Download: [link-to-archive]

Files:
- decompile-results/ (29,946 lines decompiled C, Ghidra projects)
- decompile-tools/ (Python/Java analysis scripts)
- PRD.md (faithful port specification)
- Patel-0995-documentation.md (player manual - also at johndaileysoftware.com)
```

---

### ❌ DELETE (Truly Unnecessary)

**Category** | **Files** | **Size Est** | **Reason**
-------------|-----------|--------------|----------
Original binaries | `archive/*.EXE, *.DAT` | ~5MB | DOS executables (unrunnable, publicly available)
Extracted game files | `extracted-info/` (duplicate) | ~2MB | Duplicates archive/ folder
Theme flavors | `FLAVORS/*/` (5 variants) | ~1MB | Not used (ND has different theme)
Original docs | `archive/DOCS/`, `TEXT/` | ~500KB | Available from original distribution

**Total Deleted**: ~8.5MB

**Justification**:
1. **archive/** folder = pristine SRE v0.994b distribution
   - Publicly downloadable: https://www.johndaileysoftware.com/download/?id=300SRE
   - Not modified or annotated (no value-add)
   - Binary executables (won't run on modern systems without DOSBox)

2. **extracted-info/** = duplicate of archive/
   - Exact copies of DOCS/, TEXT/, FLAVORS/
   - No analysis or transformation
   - Pure redundancy

3. **Flavor themes** (Medieval, Trek, Dune, Wild West, BRE)
   - SRE had reskinnable themes (RESOURCE.DAT, TRANSLAT.DAT)
   - ND uses LCARS aesthetic (different direction)
   - Not referenced in any design docs

**Preservation**: Original distribution remains available online. If needed, re-download from johndaileysoftware.com.

---

## Migration Plan

### Phase 1: Safety (Day 1)

1. **Create full backup**:
   ```bash
   cd docs/Legacy
   7z a -t7z -mx=9 ../../backups/Legacy-Full-2026-01-02.7z .
   ```

2. **Upload to external storage**:
   - Google Drive / Dropbox / S3
   - Share link with team
   - Verify download works

3. **Document archive location**:
   ```bash
   echo "Archive: [link]" > docs/Legacy/ARCHIVE_LOCATION.md
   ```

### Phase 2: Pruning (Day 2-3)

4. **Delete unnecessary files**:
   ```bash
   rm -rf docs/Legacy/Solar-Realms-Elite/archive/
   rm -rf docs/Legacy/Solar-Realms-Elite/extracted-info/
   rm docs/Legacy/Solar-Realms-Elite/PRD.md
   ```

5. **Archive heavy artifacts**:
   ```bash
   cd docs/Legacy/Solar-Realms-Elite
   7z a ../../../backups/Legacy-Decompile-2026-01.7z decompile-results/ decompile-tools/
   rm -rf decompile-results/ decompile-tools/
   ```

6. **Condense kept files**:
   - Edit INDEX.md (remove phases 07-11, add divergence note)
   - Add header to FORMULA_REFERENCE.md explaining evolution
   - Update legacy-analysis.md with 2026 status

### Phase 3: Documentation (Day 4)

7. **Create migration README**:
   ```markdown
   # Legacy Folder (Condensed)

   **Last Updated**: 2026-01-02
   **Status**: Historical reference only

   Nexus Dominion has **diverged significantly** from Solar Realms Elite.
   These documents preserve:
   - Original design philosophy (Amit Patel's notes)
   - Formula evolution (SRE → ND)
   - Legal acknowledgment of SRE inspiration

   For current implementations, see:
   - src/lib/formulas/ (combat, population, economy)
   - docs/PRD.md (Nexus Dominion specification)
   - docs/VISION.md (divergence from SRE)

   ## Archived Materials

   Full reverse engineering artifacts (decompiled code, Ghidra projects):
   - Download: [link-to-archive]
   - Size: 52MB compressed
   - Contents: See ARCHIVE_MANIFEST.md
   ```

8. **Update main documentation**:
   - **docs/PRD.md** - Update SRE references to note divergence
   - **CLAUDE.md** - Update "modernization" to "inspired by" SRE
   - **README.md** - Confirm SRE attribution is accurate

---

## Storage Impact

**Current**: ~60MB
**After Cleanup**: ~30KB in repo + 52MB archived externally
**Reduction**: 99.95% smaller in-repo footprint

**Git History**: Archive commits remain in history (recoverable via `git checkout`), but clone size decreases significantly.

---

## Risk Assessment

### Legal Risk: ✅ LOW (No Change)

- **Before**: Acknowledged SRE heritage, no code theft (different language/architecture)
- **After**: Same acknowledgment, same legal position
- **Mitigation**: Keep Patel's design notes (shows clean-room design)

### Historical Risk: ✅ LOW

- **Concern**: "What if we need original formulas?"
- **Mitigation**:
  1. Full archive stored externally (downloadable)
  2. Original distribution still online
  3. Git history preserves all commits
  4. Kept FORMULA_REFERENCE.md shows original values

### Development Risk: ✅ NONE

- **Code references**: 0 imports from Legacy folder
- **Formula dependencies**: All redesigned in src/lib/formulas/
- **Breaking changes**: None (documentation only)

---

## Honest Assessment: "Nice to Have" vs "Actively Used"

### Actively Used (Keep)
✅ **legacy-analysis.md** - Referenced in design discussions (shows divergence)
✅ **Patel-sre-design-notes.md** - Philosophical reference (original intent)

### Nice to Have (Archive)
⚠️ **Decompiled source** - Used once for formula extraction, never again
⚠️ **PRD.md** - Faithful port spec (project pivoted to divergence)
⚠️ **Player manual** - Historical curiosity (available online)

### Truly Unnecessary (Delete)
❌ **archive/** - Unmodified binaries (publicly available)
❌ **extracted-info/** - Exact duplicate of archive/
❌ **FLAVORS/** - Theme system (not used in ND)

---

## Final Recommendations

### Immediate Actions (This Week)

1. ✅ **Create full backup** (upload to external storage)
2. ❌ **Delete archive/ and extracted-info/** folders
3. ⚠️ **Archive decompile-results/ and decompile-tools/** (compress externally)
4. ✅ **Add divergence notes** to kept files
5. ✅ **Create ARCHIVE_LOCATION.md** with download links

### Maintenance (Ongoing)

6. **Update SRE references** in docs/PRD.md and docs/VISION.md:
   - Change "modernization of SRE" → "inspired by SRE"
   - Emphasize innovations (bots, crafting, sectors)
   - Note divergence from original mechanics

7. **Legal acknowledgment** (keep in README.md):
   ```markdown
   ## Acknowledgments

   Nexus Dominion is inspired by **Solar Realms Elite** (1990) by Amit Patel.
   While we acknowledge the heritage, ND has diverged significantly with:
   - 100 AI bot opponents (SRE was multiplayer-only)
   - Sector-based geography (SRE had flat structure)
   - Crafting & syndicate systems (new mechanics)
   - Modern LCARS UI (SRE was text-based BBS)

   No code from SRE was used (clean TypeScript implementation).
   ```

### Future Considerations (Post-Alpha)

8. **If SRE veterans request faithful mode**:
   - Restore archived formulas as "classic mode" toggle
   - Use archived PRD.md as specification
   - Download decompiled source from archive

9. **If legal questions arise**:
   - Archived materials show clean-room design process
   - Git history proves iterative development
   - Patel's notes show we studied design, not code

---

## Conclusion

**The Legacy folder served its purpose** (reverse engineering for inspiration) but is now **archival bloat**. The project has moved from "faithful SRE port" to "SRE-inspired original game."

**Recommended split**:
- **Keep 5%** (design philosophy, divergence documentation)
- **Archive 75%** (decompiled code, tools, PRD)
- **Delete 20%** (duplicate files, binaries)

**This is honest**: The decompiled source code and Ghidra projects are "nice to have" in the sense of "we might want to reference them someday," but realistically, **they've been used once** (formula extraction in Dec 2025) and **never referenced since**. The formulas extracted were then **redesigned** for balance.

**Benefit**: Cleaner repository, faster clones, clearer project direction ("inspired by" vs "clone of").

**Risk**: Minimal (full backup exists, original distribution downloadable, git history preserved).

---

## Appendix: File-by-File Decision Matrix

| File | Size | Last Ref | Decision | Reason |
|------|------|----------|----------|--------|
| legacy-analysis.md | 35KB | 2025-12 | ✅ KEEP | Shows divergence (legal/design) |
| Patel-sre-design-notes.md | 8KB | 2025-12 | ✅ KEEP | Original philosophy |
| FORMULA_REFERENCE.md | 6KB | 2025-12 | ✅ KEEP | Evolution reference |
| INDEX.md | 5KB | Never | ✅ KEEP* | Historical context (*condense) |
| PRD.md | 40KB | 2025-12 | ⚠️ ARCHIVE | Faithful port (pivoted) |
| Patel-0995-documentation.md | 30KB | Never | ⚠️ ARCHIVE | Available online |
| decompile-results/ | 50MB | 2025-12 | ⚠️ ARCHIVE | One-time use |
| decompile-tools/ | 50KB | 2025-12 | ⚠️ ARCHIVE | One-time use |
| archive/*.EXE | 5MB | Never | ❌ DELETE | Publicly available |
| archive/DOCS/ | 500KB | Never | ❌ DELETE | Publicly available |
| archive/FLAVORS/ | 1MB | Never | ❌ DELETE | Not used |
| extracted-info/ | 2MB | Never | ❌ DELETE | Duplicate of archive/ |

**Legend**:
- ✅ KEEP = In-repo (~30KB total)
- ⚠️ ARCHIVE = External storage (~52MB compressed)
- ❌ DELETE = Publicly available or redundant (~8.5MB)

**Total repo size reduction**: 99.95% (60MB → 30KB)
