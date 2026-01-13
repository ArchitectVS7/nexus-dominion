#!/usr/bin/env node

/**
 * Generates SPEC-REGISTRY.md from all design documents
 *
 * Scans docs/design/*.md for REQ-XXX-NNN specs
 * Creates centralized registry with status, code, and test links
 *
 * Usage: node scripts/generate-registry.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DESIGN_DOCS_DIR = path.join(__dirname, '..', 'docs', 'design');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'SPEC-REGISTRY.md');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

/**
 * Extracts all specifications from a markdown file
 */
function extractSpecs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const specs = [];

  // Regex to match specification blocks
  const specHeaderRegex = /^### (REQ-[A-Z]+-\d+):\s*(.+)$/gm;

  let match;
  while ((match = specHeaderRegex.exec(content)) !== null) {
    const specId = match[1];
    const title = match[2];
    const startPos = match.index;

    // Find the next spec header or end of file
    const nextMatch = specHeaderRegex.exec(content);
    const endPos = nextMatch ? nextMatch.index : content.length;

    // Reset regex for next iteration
    specHeaderRegex.lastIndex = startPos + match[0].length;

    // Extract the spec content block
    const specContent = content.substring(startPos, endPos);

    // Extract fields from spec content
    const descMatch = specContent.match(/\*\*Description:\*\*\s*(.+?)(?=\n\n|\*\*)/s);
    const rationaleMatch = specContent.match(/\*\*Rationale:\*\*\s*(.+?)(?=\n\n|\*\*)/s);
    const statusMatch = specContent.match(/\*\*Status:\*\*\s*(.+?)$/m);
    const codeMatch = specContent.match(/\*\*Code:\*\*\s*\n((?:^-\s*.+$\n?)*)/m);
    const testsMatch = specContent.match(/\*\*Tests:\*\*\s*\n((?:^-\s*.+$\n?)*)/m);
    const sourceMatch = specContent.match(/\*\*Source:\*\*\s*(.+?)$/m);

    // Parse code files
    const codeFiles = [];
    if (codeMatch && codeMatch[1]) {
      const codeLines = codeMatch[1].split('\n').filter(line => line.trim());
      codeLines.forEach(line => {
        const fileMatch = line.match(/`([^`]+)`/);
        if (fileMatch) {
          codeFiles.push(fileMatch[1]);
        }
      });
    }

    // Parse test files
    const testFiles = [];
    if (testsMatch && testsMatch[1]) {
      const testLines = testsMatch[1].split('\n').filter(line => line.trim());
      testLines.forEach(line => {
        const fileMatch = line.match(/`([^`]+)`/);
        if (fileMatch) {
          testFiles.push(fileMatch[1]);
        }
      });
    }

    specs.push({
      id: specId,
      title: title.trim(),
      description: descMatch ? descMatch[1].trim() : '',
      rationale: rationaleMatch ? rationaleMatch[1].trim() : '',
      status: statusMatch ? statusMatch[1].trim() : 'Unknown',
      codeFiles: codeFiles,
      testFiles: testFiles,
      source: sourceMatch ? sourceMatch[1].trim() : '',
      sourceDoc: path.basename(filePath),
      docPath: `design/${path.basename(filePath)}`
    });
  }

  return specs;
}

/**
 * Extracts system prefix from spec ID
 */
function getSystemPrefix(specId) {
  const match = specId.match(/^REQ-([A-Z]+)-\d+$/);
  return match ? match[1] : 'UNKNOWN';
}

/**
 * Determines priority based on status and system
 */
function determinePriority(spec) {
  const system = getSystemPrefix(spec.id);

  // Core systems get P0
  const coreSystems = ['TURN', 'COMBAT', 'RES', 'SEC', 'MIL'];
  if (coreSystems.includes(system)) {
    return 'P0';
  }

  // Major features get P1
  const majorSystems = ['BOT', 'VIC', 'RSCH', 'DIP'];
  if (majorSystems.includes(system)) {
    return 'P1';
  }

  // Everything else is P2
  return 'P2';
}

/**
 * Formats code files as markdown links
 */
function formatCodeFiles(files) {
  if (files.length === 0) return 'TBD';
  if (files.length === 1) return `\`${files[0]}\``;
  return files.map(f => `\`${f}\``).join(', ');
}

/**
 * Formats test files count
 */
function formatTestFiles(files) {
  if (files.length === 0) return 'TBD';
  return `${files.length} file(s)`;
}

/**
 * Main generation function
 */
function generateRegistry() {
  console.log(`${colors.bold}${colors.blue}Generating Specification Registry${colors.reset}\n`);

  // Find all markdown files in design directory
  const files = fs.readdirSync(DESIGN_DOCS_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => path.join(DESIGN_DOCS_DIR, f));

  if (files.length === 0) {
    console.log(`${colors.yellow}⚠ No design documents found in ${DESIGN_DOCS_DIR}${colors.reset}`);
    return;
  }

  console.log(`Found ${files.length} design document(s)`);

  // Extract all specs
  const allSpecs = [];

  for (const file of files) {
    const specs = extractSpecs(file);
    console.log(`  - ${path.basename(file)}: ${specs.length} spec(s)`);
    allSpecs.push(...specs);
  }

  console.log(`\nTotal: ${allSpecs.length} specification(s)\n`);

  // Sort specs by ID
  allSpecs.sort((a, b) => {
    const systemA = getSystemPrefix(a.id);
    const systemB = getSystemPrefix(b.id);

    if (systemA !== systemB) {
      return systemA.localeCompare(systemB);
    }

    // Extract numbers for comparison
    const numA = parseInt(a.id.match(/\d+$/)[0], 10);
    const numB = parseInt(b.id.match(/\d+$/)[0], 10);

    return numA - numB;
  });

  // Calculate statistics
  const statusCounts = {
    'Draft': 0,
    'Implemented': 0,
    'Validated': 0,
    'Deprecated': 0
  };

  allSpecs.forEach(spec => {
    const status = spec.status.replace(' ✓', '').trim();
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  });

  // Group by system
  const specsBySystem = {};
  allSpecs.forEach(spec => {
    const system = getSystemPrefix(spec.id);
    if (!specsBySystem[system]) {
      specsBySystem[system] = [];
    }
    specsBySystem[system].push(spec);
  });

  // Generate markdown
  const today = new Date().toISOString().split('T')[0];

  let markdown = '# Specification Registry\n\n';
  markdown += '**Complete index of all requirements across all systems.**\n\n';
  markdown += `**Generated:** ${today}\n`;
  markdown += `**Last Updated:** ${today}\n`;
  markdown += `**Source:** Automatically generated from design documents\n\n`;

  markdown += '---\n\n';
  markdown += '## Summary Statistics\n\n';
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| **Total Specifications** | ${allSpecs.length} |\n`;
  markdown += `| **Draft** | ${statusCounts.Draft} |\n`;
  markdown += `| **Implemented** | ${statusCounts.Implemented} |\n`;
  markdown += `| **Validated** | ${statusCounts.Validated} |\n`;
  markdown += `| **Deprecated** | ${statusCounts.Deprecated} |\n`;

  const percentComplete = allSpecs.length > 0
    ? ((statusCounts.Validated / allSpecs.length) * 100).toFixed(1)
    : 0;
  markdown += `| **Completion Rate** | ${percentComplete}% |\n\n`;

  markdown += '---\n\n';
  markdown += '## By System\n\n';
  markdown += `| System | Specs | Validated | % Complete |\n`;
  markdown += `|--------|-------|-----------|------------|\n`;

  Object.keys(specsBySystem).sort().forEach(system => {
    const systemSpecs = specsBySystem[system];
    const validatedCount = systemSpecs.filter(s =>
      s.status === 'Validated' || s.status === 'Validated ✓'
    ).length;
    const percentComplete = ((validatedCount / systemSpecs.length) * 100).toFixed(0);

    markdown += `| **REQ-${system}** | ${systemSpecs.length} | ${validatedCount} | ${percentComplete}% |\n`;
  });

  markdown += '\n---\n\n';
  markdown += '## Complete Registry\n\n';
  markdown += '| ID | System | Title | Status | Priority | Source | Code | Tests |\n';
  markdown += '|----|--------|-------|--------|----------|--------|------|-------|\n';

  allSpecs.forEach(spec => {
    const system = getSystemPrefix(spec.id);
    const priority = determinePriority(spec);
    const sourceLink = `[${spec.sourceDoc}](${spec.docPath})`;
    const code = formatCodeFiles(spec.codeFiles);
    const tests = formatTestFiles(spec.testFiles);

    markdown += `| ${spec.id} | ${system} | ${spec.title} | ${spec.status} | ${priority} | ${sourceLink} | ${code} | ${tests} |\n`;
  });

  markdown += '\n---\n\n';
  markdown += '## By Status\n\n';

  // Group by status
  const statuses = ['Draft', 'Implemented', 'Validated', 'Validated ✓', 'Deprecated'];
  statuses.forEach(status => {
    const specsInStatus = allSpecs.filter(s => s.status === status || (status === 'Validated' && s.status === 'Validated ✓'));

    if (specsInStatus.length === 0) return;

    markdown += `### ${status} (${specsInStatus.length})\n\n`;

    specsInStatus.forEach(spec => {
      const system = getSystemPrefix(spec.id);
      markdown += `- **${spec.id}** (${system}): ${spec.title}\n`;
    });

    markdown += '\n';
  });

  markdown += '---\n\n';
  markdown += '## Usage\n\n';
  markdown += 'This registry is automatically generated from design documents. Do not edit manually.\n\n';
  markdown += 'To update this registry:\n';
  markdown += '```bash\n';
  markdown += 'node scripts/generate-registry.js\n';
  markdown += '```\n\n';
  markdown += 'To validate specifications:\n';
  markdown += '```bash\n';
  markdown += 'node scripts/validate-specs.js\n';
  markdown += '```\n';

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

  console.log(`${colors.green}${colors.bold}✓ Registry generated successfully${colors.reset}`);
  console.log(`  Output: ${OUTPUT_FILE}\n`);

  console.log(`${colors.bold}Statistics:${colors.reset}`);
  console.log(`  Total Specs: ${allSpecs.length}`);
  console.log(`  Systems: ${Object.keys(specsBySystem).length}`);
  console.log(`  Validated: ${statusCounts.Validated} (${percentComplete}%)`);
  console.log(`  Draft: ${statusCounts.Draft}`);
  console.log(`  Implemented: ${statusCounts.Implemented}`);
  console.log(`  Deprecated: ${statusCounts.Deprecated}\n`);
}

// Run generation
try {
  generateRegistry();
} catch (error) {
  console.error(`${colors.red}${colors.bold}Error during generation:${colors.reset}`);
  console.error(error);
  process.exit(1);
}
