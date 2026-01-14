#!/usr/bin/env node

/**
 * Fix Migration for Remaining Systems
 * Handles specs with existing placeholder Dependencies/Blockers
 */

const fs = require('fs');
const path = require('path');

const SYSTEMS_TO_FIX = [
  { system: 'RESEARCH', file: 'RESEARCH-SYSTEM.md' },
  { system: 'TURN', file: 'TURN-PROCESSING-SYSTEM.md' },
  { system: 'VICTORY', file: 'VICTORY-SYSTEMS.md' }
];

const ANALYSIS_DIR = './docs/development/analysis';
const SYSTEMS_DIR = './docs/Game Systems';

function fixSystem(system, filename) {
  console.log(`Fixing ${system}...`);

  const jsonPath = path.join(ANALYSIS_DIR, `${system}-deps.json`);
  const mdPath = path.join(SYSTEMS_DIR, filename);

  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let content = fs.readFileSync(mdPath, 'utf8');

  const specs = jsonData.specs || [];
  let updateCount = 0;

  for (const spec of specs) {
    const id = spec.id;
    const deps = spec.dependencies || [];
    const dependents = spec.dependents || [];

    // Simple find and replace for placeholders
    const depsPlaceholder = `**Dependencies:** (to be filled by /spec-analyze)`;
    const blockersPlaceholder = `**Blockers:** (to be filled by /spec-analyze)`;

    // Build new content
    let newDeps, newBlockers;

    if (deps.length === 0) {
      newDeps = `**Dependencies:** None (foundational spec)`;
    } else {
      newDeps = `**Dependencies:**\n` + deps.map(d => `- ${d}`).join('\n');
    }

    if (dependents.length === 0) {
      newBlockers = `**Blockers:** None`;
    } else {
      newBlockers = `**Blockers:**\n` + dependents.map(d => `- ${d} (depends on this spec)`).join('\n');
    }

    // Find this specific spec's placeholders and replace them
    // Use a more specific pattern that includes the spec ID
    const specPattern = new RegExp(
      `(### ${id.replace(/[-]/g, '\\-')}:.*?)(\\*\\*Dependencies:\\*\\* \\(to be filled by \\/spec-analyze\\).*?\\*\\*Blockers:\\*\\* \\(to be filled by \\/spec-analyze\\))`,
      'gs'
    );

    const replacement = `$1${newDeps}\n\n${newBlockers}`;

    const newContent = content.replace(specPattern, replacement);

    if (newContent !== content) {
      content = newContent;
      updateCount++;
    }
  }

  if (updateCount > 0) {
    fs.writeFileSync(mdPath, content, 'utf8');
    console.log(`  ✓ Updated ${updateCount} specs in ${system}`);
  } else {
    console.log(`  - No updates made for ${system}`);
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         FIXING REMAINING SYSTEMS                           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

for (const { system, file } of SYSTEMS_TO_FIX) {
  try {
    fixSystem(system, file);
  } catch (error) {
    console.error(`✗ ${system}: ${error.message}`);
  }
}

console.log('\n✓ Fix Complete\n');
