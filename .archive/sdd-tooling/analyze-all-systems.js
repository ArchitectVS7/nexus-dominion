const fs = require('fs');
const path = require('path');

// System processing order
const WAVES = [
  { wave: 1, systems: ['RESOURCE', 'SECTOR', 'MILITARY'] },
  { wave: 2, systems: ['COMBAT', 'DIPLOMACY', 'VICTORY'] },
  { wave: 3, systems: ['TURN', 'BOT', 'COVERT'] },
  { wave: 4, systems: ['MARKET', 'RESEARCH', 'PROGRESSIVE'] },
  { wave: 5, systems: ['SYNDICATE', 'TECH', 'UI'] }
];

// Map system prefixes to file names
const SYSTEM_FILE_MAP = {
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

const BASE_DIR = 'C:\\dev\\GIT\\x-imperium';
const SPEC_INDEX_PATH = path.join(BASE_DIR, 'docs', 'development', 'SPEC-INDEX.json');
const ANALYSIS_DIR = path.join(BASE_DIR, 'docs', 'development', 'analysis');
const SYSTEMS_DIR = path.join(BASE_DIR, 'docs', 'Game Systems');

// Ensure analysis directory exists
if (!fs.existsSync(ANALYSIS_DIR)) {
  fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
}

// Read SPEC-INDEX.json
const specIndex = JSON.parse(fs.readFileSync(SPEC_INDEX_PATH, 'utf8'));

// Track all specs across systems for cross-system dependency analysis
const allSpecsMap = new Map();

// Extract spec ID pattern (REQ-XXX-NNN or REQ-XXX-NNN-L)
function extractSpecIds(text) {
  const pattern = /REQ-[A-Z]+-\d+(?:-[A-Z])?/g;
  const matches = text.match(pattern) || [];
  return [...new Set(matches)]; // Remove duplicates
}

// Parse dependencies from spec content
function parseSpecDependencies(specContent, specId) {
  const dependencies = new Set();

  // Look for "Dependencies:" field
  const depsMatch = specContent.match(/Dependencies:\s*([^\n]+)/);
  if (depsMatch) {
    const depsText = depsMatch[1];
    const specIds = extractSpecIds(depsText);
    specIds.forEach(id => {
      if (id !== specId) dependencies.add(id);
    });
  }

  // Look for cross-references in the content
  const allRefs = extractSpecIds(specContent);
  allRefs.forEach(id => {
    if (id !== specId) dependencies.add(id);
  });

  return Array.from(dependencies);
}

// Find spec content in markdown file
function findSpecContent(markdownContent, specId, nextSpecLine) {
  const lines = markdownContent.split('\n');
  const specPattern = new RegExp(`^###.*${specId.replace(/-/g, '\\-')}`, 'i');

  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (specPattern.test(lines[i])) {
      startLine = i;
      break;
    }
  }

  if (startLine === -1) return '';

  // Find end of spec (next ### heading or next spec)
  let endLine = lines.length;
  for (let i = startLine + 1; i < lines.length; i++) {
    if (lines[i].startsWith('###')) {
      endLine = i;
      break;
    }
  }

  return lines.slice(startLine, endLine).join('\n');
}

// Analyze a single system
function analyzeSystem(systemPrefix, systemNumber, totalSystems) {
  const systemKey = systemPrefix.toUpperCase();
  const systemData = specIndex.systems[systemKey];

  if (!systemData) {
    console.error(`[${systemNumber}/${totalSystems}] ${systemKey} - NOT FOUND IN SPEC-INDEX`);
    return null;
  }

  const systemFile = SYSTEM_FILE_MAP[systemKey];
  if (!systemFile) {
    console.error(`[${systemNumber}/${totalSystems}] ${systemKey} - NO FILE MAPPING`);
    return null;
  }

  const systemPath = path.join(SYSTEMS_DIR, systemFile);
  if (!fs.existsSync(systemPath)) {
    console.error(`[${systemNumber}/${totalSystems}] ${systemKey} - FILE NOT FOUND: ${systemPath}`);
    return null;
  }

  // Read system markdown file
  const markdownContent = fs.readFileSync(systemPath, 'utf8');

  // Analyze each spec
  const specsAnalysis = [];
  const specs = systemData.specs || [];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const nextSpecLine = i < specs.length - 1 ? specs[i + 1].line : null;

    // Find spec content
    const specContent = findSpecContent(markdownContent, spec.id, nextSpecLine);

    // Parse dependencies
    const dependencies = parseSpecDependencies(specContent, spec.id);

    // Identify cross-system dependencies
    const crossSystemDeps = dependencies.filter(depId => {
      const depPrefix = depId.split('-')[1];
      return depPrefix !== systemKey;
    });

    specsAnalysis.push({
      id: spec.id,
      title: spec.title,
      dependencies: dependencies,
      dependents: [], // Will be filled in second pass
      crossSystemDeps: crossSystemDeps
    });

    // Store in global map for cross-system analysis
    allSpecsMap.set(spec.id, {
      system: systemKey,
      dependencies: dependencies
    });
  }

  // Calculate dependents (second pass within system)
  specsAnalysis.forEach(spec => {
    spec.dependencies.forEach(depId => {
      const dependent = specsAnalysis.find(s => s.id === depId);
      if (dependent) {
        dependent.dependents.push(spec.id);
      }
    });
  });

  // Create analysis object
  const analysis = {
    system: systemKey,
    totalSpecs: specs.length,
    analyzedAt: new Date().toISOString(),
    specs: specsAnalysis
  };

  // Write analysis file
  const outputPath = path.join(ANALYSIS_DIR, `${systemKey}-deps.json`);
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2), 'utf8');

  console.log(`[${systemNumber}/${totalSystems}] ${systemKey} ✓ Complete - ${specs.length} specs analyzed`);

  return analysis;
}

// Main execution
async function main() {
  console.log('Starting batch dependency analysis for all 15 game systems...\n');

  const startTime = Date.now();
  const results = [];
  let systemNumber = 0;
  const totalSystems = 15;

  // Process in wave order
  for (const wave of WAVES) {
    console.log(`\n=== Wave ${wave.wave}: ${wave.systems.join(', ')} ===\n`);

    for (const system of wave.systems) {
      systemNumber++;
      try {
        const result = analyzeSystem(system, systemNumber, totalSystems);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`[${systemNumber}/${totalSystems}] ${system} - ERROR: ${error.message}`);
      }
    }
  }

  // Calculate cross-system dependents
  console.log('\n=== Calculating cross-system dependents ===\n');

  results.forEach(systemAnalysis => {
    systemAnalysis.specs.forEach(spec => {
      // Find who depends on this spec from other systems
      allSpecsMap.forEach((depData, depId) => {
        if (depData.system !== systemAnalysis.system && depData.dependencies.includes(spec.id)) {
          if (!spec.dependents.includes(depId)) {
            spec.dependents.push(depId);
          }
        }
      });
    });
  });

  // Re-write all analysis files with updated dependents
  results.forEach(analysis => {
    const outputPath = path.join(ANALYSIS_DIR, `${analysis.system}-deps.json`);
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2), 'utf8');
  });

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Generate summary
  const summary = {
    completedAt: new Date().toISOString(),
    durationSeconds: parseFloat(duration),
    systemsAnalyzed: results.length,
    totalSpecs: results.reduce((sum, r) => sum + r.totalSpecs, 0),
    systems: results.map(r => ({
      system: r.system,
      specs: r.totalSpecs,
      totalDependencies: r.specs.reduce((sum, s) => sum + s.dependencies.length, 0),
      crossSystemDeps: r.specs.reduce((sum, s) => sum + s.crossSystemDeps.length, 0)
    }))
  };

  const summaryPath = path.join(ANALYSIS_DIR, 'BATCH-SUMMARY.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n=== Batch Analysis Complete ===\n');
  console.log(`Systems analyzed: ${results.length}/15`);
  console.log(`Total specs: ${summary.totalSpecs}`);
  console.log(`Duration: ${duration}s`);
  console.log(`\nSummary written to: ${summaryPath}`);
}

main().catch(console.error);
