#!/usr/bin/env node

/**
 * Migrate Dependency Data from JSON to Spec Documents
 *
 * Reads dependency analysis JSON files and updates actual specification
 * markdown documents with Dependencies and Blockers fields.
 */

const fs = require('fs');
const path = require('path');

const ANALYSIS_DIR = './docs/development/analysis';
const SYSTEMS_DIR = './docs/Game Systems';

// System name to document file mapping
const SYSTEM_FILES = {
  'RESOURCE': 'RESOURCE-MANAGEMENT-SYSTEM.md',
  'SECTOR': 'SECTOR-MANAGEMENT-SYSTEM.md',
  'MILITARY': 'MILITARY-SYSTEM.md',
  'COMBAT': 'COMBAT-SYSTEM.md',
  'DIPLOMACY': 'DIPLOMACY-SYSTEM.md',
  'VICTORY': 'VICTORY-SYSTEMS.md',
  'TURN': 'TURN-PROCESSING-SYSTEM.md',
  'BOT': 'BOT-SYSTEM.md',
  'COVERT': 'COVERT-OPS-SYSTEM.md',
  'MARKET': 'MARKET-SYSTEM.md',
  'RESEARCH': 'RESEARCH-SYSTEM.md',
  'PROGRESSIVE': 'PROGRESSIVE-SYSTEMS.md',
  'SYNDICATE': 'SYNDICATE-SYSTEM.md',
  'TECH': 'TECH-CARD-SYSTEM.md',
  'UI': 'FRONTEND-DESIGN.md'
};

class DependencyMigrator {
  constructor() {
    this.stats = {
      systemsProcessed: 0,
      specsUpdated: 0,
      specsWithDependencies: 0,
      foundationalSpecs: 0,
      errors: []
    };
  }

  async migrateAll() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      DEPENDENCY MIGRATION - JSON TO SPEC DOCUMENTS         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    for (const [system, filename] of Object.entries(SYSTEM_FILES)) {
      try {
        await this.migrateSystem(system, filename);
        this.stats.systemsProcessed++;
      } catch (error) {
        console.error(`✗ ${system}: ${error.message}`);
        this.stats.errors.push({ system, error: error.message });
      }
    }

    this.printSummary();
  }

  async migrateSystem(system, filename) {
    console.log(`[${this.stats.systemsProcessed + 1}/15] Processing ${system}...`);

    // Read JSON analysis
    const jsonPath = path.join(ANALYSIS_DIR, `${system}-deps.json`);
    if (!fs.existsSync(jsonPath)) {
      console.log(`  ⚠ No JSON file found, skipping`);
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Read markdown document
    const mdPath = path.join(SYSTEMS_DIR, filename);
    if (!fs.existsSync(mdPath)) {
      throw new Error(`Document not found: ${mdPath}`);
    }

    let content = fs.readFileSync(mdPath, 'utf8');

    // Parse JSON format (handles both array and object formats)
    const specs = this.parseSpecsFromJSON(jsonData);

    let updatedCount = 0;

    // Process each spec
    for (const spec of specs) {
      const updated = this.updateSpec(content, spec);
      if (updated !== content) {
        content = updated;
        updatedCount++;
        this.stats.specsUpdated++;

        if (spec.dependencies && spec.dependencies.length > 0) {
          this.stats.specsWithDependencies++;
        } else {
          this.stats.foundationalSpecs++;
        }
      }
    }

    // Write updated content
    if (updatedCount > 0) {
      fs.writeFileSync(mdPath, content, 'utf8');
      console.log(`  ✓ Updated ${updatedCount} specs`);
    } else {
      console.log(`  - No updates needed`);
    }
  }

  parseSpecsFromJSON(jsonData) {
    const specs = [];

    // Format 1: Array-based (COMBAT, TURN, etc.)
    if (jsonData.specs && Array.isArray(jsonData.specs)) {
      for (const spec of jsonData.specs) {
        specs.push({
          id: spec.id,
          dependencies: spec.dependencies || [],
          dependents: spec.dependents || [],
          crossSystemDeps: spec.crossSystemDeps || []
        });
      }
    }
    // Format 2: Object-based (RESOURCE)
    else if (jsonData.specs && typeof jsonData.specs === 'object') {
      for (const [id, spec] of Object.entries(jsonData.specs)) {
        const dependencies = [];
        const notes = [];

        // Extract dependencies from blockers if present
        if (spec.blockers && Array.isArray(spec.blockers)) {
          for (const blocker of spec.blockers) {
            const note = blocker.type ? `${blocker.type}: ${blocker.reason}` : blocker.reason;
            dependencies.push(blocker.spec);
            notes.push({ spec: blocker.spec, note });
          }
        } else if (spec.dependencies && Array.isArray(spec.dependencies)) {
          dependencies.push(...spec.dependencies);
        }

        specs.push({
          id,
          dependencies,
          notes,
          crossSystem: spec.crossSystem || []
        });
      }
    }

    return specs;
  }

  updateSpec(content, spec) {
    const { id, dependencies, notes, dependents, crossSystemDeps } = spec;

    // Find spec in document
    const specRegex = new RegExp(`(### ${id.replace(/[-]/g, '\\-')}:.*?\\n\\n)(.*?)(\\n\\n---|\n\n### REQ-|$)`, 's');
    const match = content.match(specRegex);

    if (!match) {
      return content; // Spec not found, skip
    }

    const [fullMatch, header, specBody, ending] = match;

    // Check if already has Dependencies/Blockers
    if (specBody.includes('**Dependencies:**') && !specBody.includes('(to be filled by /spec-analyze)')) {
      return content; // Already migrated, skip
    }

    // Build Dependencies content
    let depsContent = '\n**Dependencies:**';
    if (!dependencies || dependencies.length === 0) {
      depsContent += ' None (foundational spec)';
    } else {
      depsContent += '\n';
      dependencies.forEach((dep, i) => {
        const note = notes && notes[i] ? ` (${notes[i].note})` : '';
        depsContent += `- ${dep}${note}\n`;
      });
    }

    // Build Blockers content
    let blockersContent = '\n**Blockers:**';
    if (!dependents || dependents.length === 0) {
      blockersContent += ' None';
    } else {
      blockersContent += '\n';
      dependents.forEach(dep => {
        blockersContent += `- ${dep} (depends on this spec)\n`;
      });
    }

    // Find insertion point (after Rationale or Description)
    let newBody = specBody;

    // Remove existing placeholders
    newBody = newBody.replace(/\n\*\*Dependencies:\*\* \(to be filled by \/spec-analyze\)/g, '');
    newBody = newBody.replace(/\n\*\*Blockers:\*\* \(to be filled by \/spec-analyze\)/g, '');

    // Insert after Rationale (preferred)
    if (newBody.includes('**Rationale:**')) {
      newBody = newBody.replace(
        /(\*\*Rationale:\*\*.*?)(\n\n)/s,
        `$1$2${depsContent}\n${blockersContent}\n`
      );
    }
    // Or after Description if no Rationale
    else if (newBody.includes('**Description:**')) {
      newBody = newBody.replace(
        /(\*\*Description:\*\*.*?)(\n\n)/s,
        `$1$2${depsContent}\n${blockersContent}\n`
      );
    }
    // Or before Source as last resort
    else if (newBody.includes('**Source:**')) {
      newBody = newBody.replace(
        /(\n)(\*\*Source:\*\*)/,
        `${depsContent}\n${blockersContent}\n\n$2`
      );
    }

    return content.replace(fullMatch, header + newBody + ending);
  }

  printSummary() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              MIGRATION SUMMARY                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Systems Processed:        ${this.stats.systemsProcessed}/15`);
    console.log(`Total Specs Updated:      ${this.stats.specsUpdated}`);
    console.log(`Specs with Dependencies:  ${this.stats.specsWithDependencies}`);
    console.log(`Foundational Specs:       ${this.stats.foundationalSpecs}`);
    console.log(`Errors:                   ${this.stats.errors.length}`);

    if (this.stats.errors.length > 0) {
      console.log('\nErrors:');
      this.stats.errors.forEach(({ system, error }) => {
        console.log(`  ✗ ${system}: ${error}`);
      });
    }

    console.log('\n✓ Migration Complete');
    console.log('\nNext Steps:');
    console.log('1. Run: node scripts/validate-specs.js');
    console.log('2. Verify pass rate improved from 51.9% to 85%+');
    console.log('3. Review SYNDICATE/TECH/UI (had no dependency data)');
    console.log('4. Commit changes with: git add docs/Game\\ Systems/');
  }
}

// Run migration
const migrator = new DependencyMigrator();
migrator.migrateAll().catch(console.error);
