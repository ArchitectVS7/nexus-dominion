#!/usr/bin/env node

/**
 * Analyze Dependencies Across All Game Systems
 *
 * Autonomous script that:
 * 1. Analyzes all 15 systems for dependencies
 * 2. Writes Dependencies/Blockers directly to markdown specs
 * 3. Uses temp JSON for validation
 * 4. Cleans up temp files on success
 * 5. Runs without human intervention
 */

const fs = require('fs');
const path = require('path');

const SYSTEMS_DIR = './docs/Game Systems';
const TEMP_DIR = './temp-analysis';

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

// Keyword patterns for cross-system dependencies
const CROSS_SYSTEM_PATTERNS = {
  'RESOURCE': {
    patterns: ['Credits', 'Food', 'Ore', 'Petroleum', 'Research Points', 'production', 'consumption'],
    systems: ['SECTOR', 'TURN', 'MARKET', 'RESEARCH']
  },
  'SECTOR': {
    patterns: ['sector', 'territory', 'planet', 'acquisition'],
    systems: ['RESOURCE', 'COMBAT', 'VICTORY']
  },
  'MILITARY': {
    patterns: ['unit', 'Soldier', 'Fighter', 'Bomber', 'Cruiser', 'Carrier', 'Station', 'power'],
    systems: ['COMBAT', 'RESOURCE', 'TURN']
  },
  'COMBAT': {
    patterns: ['attack', 'battle', 'combat', 'D20', 'casualties'],
    systems: ['MILITARY', 'VICTORY']
  },
  'DIPLOMACY': {
    patterns: ['treaty', 'alliance', 'coalition', 'reputation', 'trust'],
    systems: ['VICTORY', 'BOT']
  },
  'VICTORY': {
    patterns: ['victory', 'win condition', 'networth'],
    systems: ['RESOURCE', 'SECTOR', 'COMBAT', 'DIPLOMACY', 'RESEARCH']
  },
  'TURN': {
    patterns: ['turn processing', 'phase'],
    systems: ['RESOURCE', 'COMBAT', 'RESEARCH', 'BOT', 'COVERT', 'MARKET']
  },
  'BOT': {
    patterns: ['bot', 'AI', 'archetype', 'LLM', 'emotion'],
    systems: ['DIPLOMACY', 'COMBAT']
  },
  'COVERT': {
    patterns: ['spy', 'intel', 'covert', 'sabotage'],
    systems: ['RESOURCE', 'TURN']
  },
  'MARKET': {
    patterns: ['market', 'trade', 'buy', 'sell', 'price'],
    systems: ['RESOURCE', 'TURN']
  },
  'RESEARCH': {
    patterns: ['research', 'technology', 'doctrine', 'specialization'],
    systems: ['RESOURCE', 'TURN', 'MILITARY']
  },
  'PROGRESSIVE': {
    patterns: ['unlock', 'progressive', 'milestone'],
    systems: ['TURN', 'VICTORY']
  },
  'SYNDICATE': {
    patterns: ['syndicate', 'loyalty', 'hidden role'],
    systems: ['VICTORY', 'BOT']
  },
  'TECH': {
    patterns: ['tech card', 'tech war'],
    systems: ['RESEARCH']
  },
  'UI': {
    patterns: ['dashboard', 'UI', 'interface'],
    systems: [] // UI doesn't depend on game systems
  }
};

class DependencyAnalyzer {
  constructor() {
    this.stats = {
      systemsProcessed: 0,
      specsAnalyzed: 0,
      dependenciesFound: 0,
      specsUpdated: 0,
      errors: []
    };

    // Create temp dir
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Load all specs into memory for cross-referencing
    this.allSpecs = this.loadAllSpecs();
  }

  loadAllSpecs() {
    const allSpecs = {};

    for (const [system, filename] of Object.entries(SYSTEM_FILES)) {
      const mdPath = path.join(SYSTEMS_DIR, filename);
      if (!fs.existsSync(mdPath)) continue;

      const content = fs.readFileSync(mdPath, 'utf8');
      const specs = this.extractSpecs(content, system);

      allSpecs[system] = specs;
    }

    return allSpecs;
  }

  extractSpecs(content, system) {
    const specs = [];
    const specRegex = /### (REQ-[A-Z]+-[0-9A-Z-]+):\s+([^\n]+)/g;

    let match;
    while ((match = specRegex.exec(content)) !== null) {
      const [, id, title] = match;

      // Extract the spec body (everything until next ### or ---)
      const startPos = match.index;
      const endMatch = content.substring(startPos + match[0].length).match(/\n(###|---)/);
      const endPos = endMatch ? startPos + match[0].length + endMatch.index : content.length;
      const body = content.substring(startPos, endPos);

      specs.push({ id, title, body, system });
    }

    return specs;
  }

  async analyzeAll() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     AUTONOMOUS DEPENDENCY ANALYSIS - ALL SYSTEMS           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Process in dependency order (foundations first)
    const processingOrder = [
      'RESOURCE', 'SECTOR', 'MILITARY', 'COMBAT', 'DIPLOMACY',
      'VICTORY', 'TURN', 'BOT', 'COVERT', 'MARKET', 'RESEARCH',
      'PROGRESSIVE', 'SYNDICATE', 'TECH', 'UI'
    ];

    for (const system of processingOrder) {
      await this.analyzeSystem(system);
    }

    this.validate();
    this.cleanup();
    this.printSummary();
  }

  async analyzeSystem(system) {
    const filename = SYSTEM_FILES[system];
    console.log(`[${this.stats.systemsProcessed + 1}/15] Analyzing ${system}...`);

    try {
      const mdPath = path.join(SYSTEMS_DIR, filename);
      if (!fs.existsSync(mdPath)) {
        console.log(`  ⚠ Document not found, skipping`);
        return;
      }

      let content = fs.readFileSync(mdPath, 'utf8');
      const specs = this.allSpecs[system];

      const analysis = { system, specs: [] };
      let updatedCount = 0;

      for (const spec of specs) {
        const deps = this.findDependencies(spec, system);
        const blockers = this.findBlockers(spec);

        analysis.specs.push({
          id: spec.id,
          dependencies: deps,
          blockers: blockers
        });

        // Update markdown
        const updated = this.updateSpecInMarkdown(content, spec, deps, blockers);
        if (updated !== content) {
          content = updated;
          updatedCount++;
          this.stats.specsUpdated++;
          if (deps.length > 0) {
            this.stats.dependenciesFound += deps.length;
          }
        }

        this.stats.specsAnalyzed++;
      }

      // Write updated markdown
      if (updatedCount > 0) {
        fs.writeFileSync(mdPath, content, 'utf8');
        console.log(`  ✓ Updated ${updatedCount} specs, found ${this.stats.dependenciesFound} dependencies`);
      } else {
        console.log(`  - No updates needed`);
      }

      // Write temp JSON for validation
      const tempPath = path.join(TEMP_DIR, `${system}-deps.json`);
      fs.writeFileSync(tempPath, JSON.stringify(analysis, null, 2));

      this.stats.systemsProcessed++;

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      this.stats.errors.push({ system, error: error.message });
    }
  }

  findDependencies(spec, system) {
    const dependencies = [];
    const { body, id } = spec;

    // 1. Explicit REQ-XXX-NNN references in description/formula
    const refRegex = /REQ-[A-Z]+-[0-9A-Z-]+/g;
    const refs = body.match(refRegex) || [];

    for (const ref of refs) {
      if (ref !== id && !dependencies.includes(ref)) {
        // Check if this ref exists
        if (this.specExists(ref)) {
          dependencies.push(ref);
        }
      }
    }

    // 2. Cross-system pattern matching
    if (CROSS_SYSTEM_PATTERNS[system]) {
      const { patterns, systems: relatedSystems } = CROSS_SYSTEM_PATTERNS[system];

      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(body)) {
          // Find related specs in other systems
          for (const relatedSystem of relatedSystems) {
            if (this.allSpecs[relatedSystem]) {
              // Find the most relevant spec (usually the first foundational one)
              const foundationalSpec = this.allSpecs[relatedSystem].find(s =>
                s.id.match(/-001$/) || s.id.match(/-001-/) || s.title.toLowerCase().includes(pattern.toLowerCase())
              );

              if (foundationalSpec && !dependencies.includes(foundationalSpec.id)) {
                dependencies.push(foundationalSpec.id);
              }
            }
          }
        }
      }
    }

    // 3. Split parent references (dependencies on child specs)
    if (id.match(/^REQ-[A-Z]+-[0-9]+-[A-Z]$/)) {
      // This is a child spec, depends on parent
      const parentId = id.replace(/-[A-Z]$/, '');
      if (this.specExists(parentId) && !dependencies.includes(parentId)) {
        dependencies.push(parentId);
      }
    }

    // Remove duplicates and self-references
    return [...new Set(dependencies)].filter(d => d !== id);
  }

  findBlockers(spec) {
    const blockers = [];
    const { id } = spec;

    // Find all specs that reference this ID
    for (const [system, specs] of Object.entries(this.allSpecs)) {
      for (const otherSpec of specs) {
        if (otherSpec.id === id) continue;

        // Check if otherSpec references this spec
        const refRegex = new RegExp(`\\b${id}\\b`);
        if (refRegex.test(otherSpec.body)) {
          blockers.push(otherSpec.id);
        }
      }
    }

    return [...new Set(blockers)];
  }

  specExists(specId) {
    for (const specs of Object.values(this.allSpecs)) {
      if (specs.some(s => s.id === specId)) {
        return true;
      }
    }
    return false;
  }

  updateSpecInMarkdown(content, spec, dependencies, blockers) {
    const { id } = spec;

    // Find spec in markdown
    const specRegex = new RegExp(`(### ${id.replace(/[-]/g, '\\-')}:.*?\\n\\n)(.*?)(\\n\\n---|\n\n### REQ-|$)`, 's');
    const match = content.match(specRegex);

    if (!match) return content;

    const [fullMatch, header, specBody, ending] = match;

    // Check if already has dependencies (not placeholder)
    // Note: "**Dependencies:** None" is a valid analyzed state, don't re-update
    if (specBody.includes('**Dependencies:**') &&
        !specBody.includes('(to be filled by /spec-analyze)')) {
      return content; // Already analyzed
    }

    // Build content
    let depsContent = '\n**Dependencies:**';
    if (dependencies.length === 0) {
      depsContent += ' None (foundational spec)';
    } else {
      depsContent += '\n' + dependencies.map(d => `- ${d}`).join('\n');
    }

    let blockersContent = '\n**Blockers:**';
    if (blockers.length === 0) {
      blockersContent += ' None';
    } else {
      blockersContent += '\n' + blockers.map(b => `- ${b} (depends on this spec)`).join('\n');
    }

    // Remove existing placeholders or old content
    let newBody = specBody
      .replace(/\n\*\*Dependencies:\*\*[^\n]*(\n-[^\n]*)*/, '')
      .replace(/\n\*\*Blockers:\*\*[^\n]*(\n-[^\n]*)*/, '');

    // Insert after Rationale (preferred) or Description
    if (newBody.includes('**Rationale:**')) {
      newBody = newBody.replace(
        /(\*\*Rationale:\*\*.*?)(\n\n)/s,
        `$1$2${depsContent}\n${blockersContent}\n`
      );
    } else if (newBody.includes('**Description:**')) {
      newBody = newBody.replace(
        /(\*\*Description:\*\*.*?)(\n\n)/s,
        `$1$2${depsContent}\n${blockersContent}\n`
      );
    } else {
      // Insert before Source
      newBody = newBody.replace(
        /(\n)(\*\*Source:\*\*)/,
        `${depsContent}\n${blockersContent}\n\n$2`
      );
    }

    return content.replace(fullMatch, header + newBody + ending);
  }

  validate() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              VALIDATION                                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    let allValid = true;

    for (const [system, filename] of Object.entries(SYSTEM_FILES)) {
      const tempPath = path.join(TEMP_DIR, `${system}-deps.json`);
      const mdPath = path.join(SYSTEMS_DIR, filename);

      if (!fs.existsSync(tempPath)) continue;

      const jsonData = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
      const mdContent = fs.readFileSync(mdPath, 'utf8');

      // Check each spec in JSON exists in markdown with dependencies
      for (const spec of jsonData.specs) {
        const specRegex = new RegExp(`### ${spec.id.replace(/[-]/g, '\\-')}:`, 'g');
        if (!specRegex.test(mdContent)) {
          console.log(`  ✗ ${system}: Spec ${spec.id} not found in markdown`);
          allValid = false;
          continue;
        }

        // Check if dependencies were written
        const depsRegex = new RegExp(`### ${spec.id.replace(/[-]/g, '\\-')}:.*?\\*\\*Dependencies:\\*\\*`, 's');
        if (!depsRegex.test(mdContent)) {
          console.log(`  ✗ ${system}: Spec ${spec.id} missing Dependencies field`);
          allValid = false;
        }
      }
    }

    if (allValid) {
      console.log('✓ All specs validated - JSON data successfully migrated to markdown');
    } else {
      console.log('✗ Validation failed - some specs not properly migrated');
      this.stats.errors.push({ system: 'VALIDATION', error: 'Some specs not migrated' });
    }

    return allValid;
  }

  cleanup() {
    if (this.stats.errors.length === 0) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║              CLEANUP                                       ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');

      // Delete temp directory
      if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        console.log('✓ Temporary JSON files deleted');
      }
    } else {
      console.log('\n⚠ Temp files preserved due to errors - check temp-analysis/ directory');
    }
  }

  printSummary() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              ANALYSIS SUMMARY                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Systems Processed:        ${this.stats.systemsProcessed}/15`);
    console.log(`Specs Analyzed:           ${this.stats.specsAnalyzed}`);
    console.log(`Specs Updated:            ${this.stats.specsUpdated}`);
    console.log(`Dependencies Found:       ${this.stats.dependenciesFound}`);
    console.log(`Errors:                   ${this.stats.errors.length}`);

    if (this.stats.errors.length > 0) {
      console.log('\nErrors:');
      this.stats.errors.forEach(({ system, error }) => {
        console.log(`  ✗ ${system}: ${error}`);
      });
    }

    console.log('\n✓ Autonomous Analysis Complete');
    console.log('\nNext Steps:');
    console.log('1. Run: node scripts/validate-specs.js');
    console.log('2. Verify improved pass rate');
    console.log('3. Commit: git add "docs/Game Systems/" && git commit');
  }
}

// Run analysis
const analyzer = new DependencyAnalyzer();
analyzer.analyzeAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
