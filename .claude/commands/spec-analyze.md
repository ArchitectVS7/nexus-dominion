---
argument-hint: [SYSTEM]
description: Analyze dependencies for all specs in a system. Usage: /spec-analyze COMBAT
---

# Spec Dependency Analysis Skill

Analyze all specifications in a game system document to identify dependencies and blockers. This skill is designed for token-efficient batch processing.

## Parameters

- **System**: `$1` (e.g., "COMBAT", "BOT", "DIPLOMACY", "MARKET", "MILITARY", "RESOURCE", "SECTOR", "PROGRESSIVE", "VICTORY", "TURN", "RESEARCH", "SYNDICATE", "TECH", "COVERT", "UI")

## Pre-Flight

Current git status: !`git status --short`
Target system: **$1**

## Workflow

### Step 1: Load Context (Token-Efficient)

Read these files in parallel:
1. `docs/development/SPEC-INDEX.json` - All spec IDs and titles (lightweight lookup)
2. The target system document from SPEC-INDEX.json

Token budget: ~20K (index ~8K + system doc ~12K avg)

### Step 2: Identify System Specs

From SPEC-INDEX.json, get the list of specs for `$1`:
- Extract spec IDs, titles, and atomic status
- Note any `splitCandidate` or `note` fields for context

### Step 3: Intra-System Analysis

For each spec in the system:

1. **Read the spec description and formula**
2. **Identify referenced concepts**:
   - Resources (Credits, Food, Ore, Petroleum, Research Points)
   - Game objects (Units, Sectors, Empires, Treaties, Coalitions)
   - Calculations (Power, Networth, VP, Trust, Reputation)
   - Other specs mentioned by ID (REQ-XXX-NNN)

3. **Match to other specs in SAME system**:
   - If Spec A mentions concept X, and Spec B defines concept X, A depends on B
   - Example: REQ-COMBAT-005 mentions "unit types" → depends on REQ-MIL-001

4. **Classify dependency type**:
   - **HARD**: Cannot implement A without B existing first
     - A uses B's output as input
     - A extends B's functionality
     - A's formula includes B's result
   - **SOFT**: A is enhanced by B, but can work standalone
     - A could use default/placeholder if B not ready
     - A references B for optimization only

### Step 4: Cross-System Reference Detection

For each spec:
1. **Identify external concepts** not defined in current system
2. **Lookup in SPEC-INDEX.json** to find the defining system and spec
3. **Record as cross-system dependency**

Common cross-system patterns:
| Concept | Defining System | Typical Spec |
|---------|-----------------|--------------|
| Unit types, power | MILITARY | REQ-MIL-001, REQ-MIL-006 |
| Resources, production | RESOURCE | REQ-RES-001, REQ-RES-002 |
| Sectors, acquisition | SECTOR | REQ-SEC-001, REQ-SEC-003 |
| Treaties, reputation | DIPLOMACY | REQ-DIP-001, REQ-DIP-003 |
| Victory Points | VICTORY | REQ-VIC-007 |
| Turn processing | TURN | REQ-TURN-001 |
| Bot archetypes | BOT | REQ-BOT-002 |
| Covert ops | COVERT | REQ-COV-001 |
| Research tiers | RESEARCH | REQ-RSCH-001 |

### Step 5: Output Analysis File

Write to `docs/development/analysis/{SYSTEM}-deps.json`:

```json
{
  "system": "{SYSTEM}",
  "analyzedAt": "2026-01-12",
  "totalSpecs": 12,
  "specs": {
    "REQ-XXX-001": {
      "title": "Spec Title",
      "dependencies": [],
      "blockers": [],
      "notes": "Foundational spec, no dependencies"
    },
    "REQ-XXX-002": {
      "title": "Another Spec",
      "dependencies": [
        "REQ-XXX-001",
        "REQ-YYY-003"
      ],
      "blockers": [
        {
          "type": "HARD",
          "spec": "REQ-XXX-001",
          "reason": "Requires base definition to extend"
        },
        {
          "type": "SOFT",
          "spec": "REQ-YYY-003",
          "reason": "Uses for optimization, can use default"
        }
      ],
      "crossSystem": ["RESOURCE", "MILITARY"],
      "notes": "Depends on resource types and unit definitions"
    }
  },
  "summary": {
    "foundationalSpecs": ["REQ-XXX-001"],
    "mostDependedOn": ["REQ-XXX-001"],
    "mostDependencies": ["REQ-XXX-005"],
    "crossSystemDeps": {
      "RESOURCE": 3,
      "MILITARY": 2
    }
  }
}
```

### Step 6: Update Source Document (Optional)

If `--update-docs` flag is passed, add fields to each spec in the system document:

```markdown
### REQ-XXX-002: Spec Title

**Description:** ...

**Dependencies:**
- REQ-XXX-001 (base definition required)
- REQ-YYY-003 (resource types for calculation)

**Blockers:**
- HARD: REQ-XXX-001 - Cannot implement without base attack mechanics
- SOFT: REQ-YYY-003 - Can use placeholder resources initially

**Formula:** ...
```

### Step 7: Commit Analysis

Create commit:
```
spec-analyze: Complete dependency analysis for {SYSTEM}

- Analyzed {N} specifications
- Found {M} intra-system dependencies
- Found {K} cross-system dependencies
- Foundational specs: {list}

Outputs: docs/development/analysis/{SYSTEM}-deps.json
```

## Invocation Examples

```bash
# Analyze single system
/spec-analyze COMBAT

# Analyze with doc updates
/spec-analyze COMBAT --update-docs

# Batch analysis (run sequentially)
/spec-analyze COMBAT && /spec-analyze BOT && /spec-analyze DIPLOMACY
```

## System Processing Order

Recommended order (foundations first):
1. RESOURCE - Base resources, production
2. SECTOR - Sector types, acquisition
3. MILITARY - Unit types, power
4. COMBAT - Combat mechanics
5. DIPLOMACY - Treaties, reputation
6. VICTORY - Victory conditions
7. TURN - Turn processing phases
8. BOT - AI archetypes
9. COVERT - Covert operations
10. MARKET - Market mechanics
11. RESEARCH - Tech tree
12. PROGRESSIVE - Unlocks, events
13. SYNDICATE - Hidden roles
14. TECH - Tech cards
15. UI - Frontend requirements

## Stop Conditions

- System not found in SPEC-INDEX.json
- System document file not found
- Analysis file already exists (use --force to overwrite)
- Error parsing spec format

## Success Criteria

A system analysis is complete when:
1. All specs in the system have been processed
2. All dependencies are classified (HARD/SOFT)
3. Cross-system references are mapped
4. Output JSON is valid
5. Summary statistics are accurate

## Token Efficiency Notes

- **DO NOT** read other system documents during analysis
- **DO** use SPEC-INDEX.json for cross-system lookups (ID/title only)
- **DO** batch process all specs in one session
- Estimated tokens per system: ~20-30K
- Full 15-system analysis: ~300-450K tokens
