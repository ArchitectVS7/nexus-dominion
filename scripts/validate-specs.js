#!/usr/bin/env node

/**
 * Validates spec integrity across all design documents
 *
 * Checks:
 * - All spec IDs are unique
 * - Spec IDs follow REQ-XXX-NNN format
 * - All specs have required fields
 * - No duplicate spec IDs
 * - Sequential numbering within systems
 * - All @spec tags in design docs reference valid specs
 * - Status values are valid (Draft, Implemented, Validated, Deprecated)
 *
 * Usage: node scripts/validate-specs.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DESIGN_DOCS_DIR = path.join(__dirname, '..', 'docs', 'design');
const VALID_STATUSES = ['Draft', 'Implemented', 'Validated', 'Validated ✓', 'Deprecated'];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
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
  // Matches: ### REQ-XXX-NNN: Title
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
    const statusMatch = specContent.match(/\*\*Status:\*\*\s*(.+?)$/m);
    const codeMatch = specContent.match(/\*\*Code:\*\*\s*\n((?:^-\s*.+$\n?)*)/m);
    const testsMatch = specContent.match(/\*\*Tests:\*\*\s*\n((?:^-\s*.+$\n?)*)/m);
    const sourceMatch = specContent.match(/\*\*Source:\*\*\s*(.+?)$/m);

    specs.push({
      id: specId,
      title: title.trim(),
      description: descMatch ? descMatch[1].trim() : null,
      status: statusMatch ? statusMatch[1].trim() : null,
      code: codeMatch ? codeMatch[1].trim() : null,
      tests: testsMatch ? testsMatch[1].trim() : null,
      source: sourceMatch ? sourceMatch[1].trim() : null,
      file: path.basename(filePath),
      filePath: filePath
    });
  }

  return specs;
}

/**
 * Extracts all @spec tags from design document narrative
 */
function extractSpecTags(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tags = [];

  // Regex to match @spec tags in comments
  const tagRegex = /<!--\s*@spec\s+(REQ-[A-Z]+-\d+)\s*-->/g;

  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push({
      specId: match[1],
      file: path.basename(filePath)
    });
  }

  return tags;
}

/**
 * Validates spec ID format
 */
function validateSpecIdFormat(specId) {
  const pattern = /^REQ-[A-Z]+-\d+$/;
  return pattern.test(specId);
}

/**
 * Extracts system prefix from spec ID
 */
function getSystemPrefix(specId) {
  const match = specId.match(/^REQ-([A-Z]+)-\d+$/);
  return match ? match[1] : null;
}

/**
 * Extracts number from spec ID
 */
function getSpecNumber(specId) {
  const match = specId.match(/^REQ-[A-Z]+-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Main validation function
 */
function validateSpecs() {
  console.log(`${colors.bold}${colors.blue}Validating Specifications${colors.reset}\n`);

  // Find all markdown files in design directory
  const files = fs.readdirSync(DESIGN_DOCS_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => path.join(DESIGN_DOCS_DIR, f));

  if (files.length === 0) {
    console.log(`${colors.yellow}⚠ No design documents found in ${DESIGN_DOCS_DIR}${colors.reset}`);
    return;
  }

  console.log(`Found ${files.length} design document(s):\n`);
  files.forEach(f => console.log(`  - ${path.basename(f)}`));
  console.log();

  // Extract all specs
  const allSpecs = [];
  const allTags = [];

  for (const file of files) {
    const specs = extractSpecs(file);
    const tags = extractSpecTags(file);
    allSpecs.push(...specs);
    allTags.push(...tags);
  }

  console.log(`Extracted ${allSpecs.length} specification(s)`);
  console.log(`Found ${allTags.length} @spec tag(s)\n`);

  const errors = [];
  const warnings = [];

  // ===========================
  // Check 1: Duplicate Spec IDs
  // ===========================
  const idCounts = {};
  allSpecs.forEach(spec => {
    idCounts[spec.id] = (idCounts[spec.id] || 0) + 1;
  });

  const duplicates = Object.keys(idCounts).filter(id => idCounts[id] > 1);
  if (duplicates.length > 0) {
    duplicates.forEach(id => {
      const locations = allSpecs.filter(s => s.id === id).map(s => s.file).join(', ');
      errors.push(`Duplicate spec ID: ${id} found in ${locations}`);
    });
  }

  // ===========================
  // Check 2: Spec ID Format
  // ===========================
  allSpecs.forEach(spec => {
    if (!validateSpecIdFormat(spec.id)) {
      errors.push(`Invalid spec ID format: ${spec.id} in ${spec.file}`);
    }
  });

  // ===========================
  // Check 3: Required Fields
  // ===========================
  allSpecs.forEach(spec => {
    if (!spec.description || spec.description === 'TBD') {
      errors.push(`${spec.id}: Missing Description field`);
    }

    if (!spec.status) {
      errors.push(`${spec.id}: Missing Status field`);
    } else if (!VALID_STATUSES.includes(spec.status)) {
      warnings.push(`${spec.id}: Invalid status "${spec.status}" (should be: ${VALID_STATUSES.join(', ')})`);
    }

    if (!spec.code) {
      warnings.push(`${spec.id}: Missing Code field (use "TBD" if not yet implemented)`);
    }

    if (!spec.tests) {
      warnings.push(`${spec.id}: Missing Tests field (use "TBD" if not yet written)`);
    }

    if (!spec.source) {
      warnings.push(`${spec.id}: Missing Source field (should reference design doc section)`);
    }
  });

  // ===========================
  // Check 4: Sequential Numbering
  // ===========================
  const specsBySystem = {};
  allSpecs.forEach(spec => {
    const system = getSystemPrefix(spec.id);
    if (!specsBySystem[system]) {
      specsBySystem[system] = [];
    }
    specsBySystem[system].push(spec);
  });

  Object.keys(specsBySystem).forEach(system => {
    const systemSpecs = specsBySystem[system];
    const numbers = systemSpecs.map(s => getSpecNumber(s.id)).sort((a, b) => a - b);

    // Check for gaps in numbering
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] !== numbers[i-1] + 1) {
        warnings.push(`REQ-${system}: Gap in numbering between ${numbers[i-1]} and ${numbers[i]}`);
      }
    }

    // Check if numbering starts at 001
    if (numbers[0] !== 1) {
      warnings.push(`REQ-${system}: Numbering should start at 001, found ${numbers[0].toString().padStart(3, '0')}`);
    }
  });

  // ===========================
  // Check 5: Orphaned @spec tags
  // ===========================
  const validSpecIds = new Set(allSpecs.map(s => s.id));
  allTags.forEach(tag => {
    if (!validSpecIds.has(tag.specId)) {
      errors.push(`@spec tag references non-existent spec: ${tag.specId} in ${tag.file}`);
    }
  });

  // ===========================
  // Check 6: Status Consistency
  // ===========================
  allSpecs.forEach(spec => {
    const hasCode = spec.code && spec.code !== 'TBD' && spec.code.trim() !== '';
    const hasTests = spec.tests && spec.tests !== 'TBD' && spec.tests.trim() !== '';

    if (spec.status === 'Validated' || spec.status === 'Validated ✓') {
      if (!hasCode) {
        errors.push(`${spec.id}: Status is Validated but Code field is empty or TBD`);
      }
      if (!hasTests) {
        errors.push(`${spec.id}: Status is Validated but Tests field is empty or TBD`);
      }
    }

    if (spec.status === 'Implemented') {
      if (!hasCode) {
        warnings.push(`${spec.id}: Status is Implemented but Code field is empty or TBD`);
      }
    }
  });

  // ===========================
  // Report Results
  // ===========================
  console.log(`${colors.bold}Validation Results:${colors.reset}\n`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}${colors.bold}✓ All specifications are valid!${colors.reset}\n`);

    // Print summary statistics
    const statusCounts = {};
    allSpecs.forEach(spec => {
      const status = spec.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log(`${colors.bold}Summary:${colors.reset}`);
    console.log(`  Total Specs: ${allSpecs.length}`);
    Object.keys(statusCounts).sort().forEach(status => {
      console.log(`  ${status}: ${statusCounts[status]}`);
    });
    console.log();

    const systemCounts = {};
    allSpecs.forEach(spec => {
      const system = getSystemPrefix(spec.id);
      systemCounts[system] = (systemCounts[system] || 0) + 1;
    });

    console.log(`${colors.bold}By System:${colors.reset}`);
    Object.keys(systemCounts).sort().forEach(system => {
      console.log(`  REQ-${system}: ${systemCounts[system]} specs`);
    });

    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Found ${errors.length} error(s):${colors.reset}\n`);
    errors.forEach(err => {
      console.log(`${colors.red}  ✗ ${err}${colors.reset}`);
    });
    console.log();
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠ Found ${warnings.length} warning(s):${colors.reset}\n`);
    warnings.forEach(warn => {
      console.log(`${colors.yellow}  ! ${warn}${colors.reset}`);
    });
    console.log();
  }

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}Validation failed. Please fix errors before proceeding.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.yellow}${colors.bold}Validation passed with warnings.${colors.reset}`);
    process.exit(0);
  }
}

// Run validation
try {
  validateSpecs();
} catch (error) {
  console.error(`${colors.red}${colors.bold}Error during validation:${colors.reset}`);
  console.error(error);
  process.exit(1);
}
