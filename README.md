```markdown
# Nexus Dominion

A turn-based 4X space empire strategy game with AI-controlled bot opponents inspired by Solar Realms Elite (1990). Build your galactic civilization through military conquest, economic dominance, diplomatic coalitions, technological advancement, or survival against 100 uniquely-personalized AI opponents across 50-500 turn campaigns.

## Table of Contents

- [Features](#features)
- [Project Status](#project-status)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Game Mechanics](#game-mechanics)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Gameplay
- Turn-based empire management (50-500 turns based on game mode)
- Multiple resource types: Credits, Food, and more
- Diverse sector types with unique production profiles
- Progressive unlock system for strategic depth

### Military & Combat
- Multiple unit types including Marines, Drones, and specialized forces
- 3-phase combat system: Space Battle → Orbital Bombardment → Ground Assault
- Army diversity bonuses and comprehensive unit effectiveness matrix

### Diplomacy & Economy
- Non-Aggression Pacts and Alliance treaties
- Coalition system enabling group warfare and shared victory conditions
- Dynamic market with supply/demand-driven pricing
- Black Market for covert transactions

### AI Opponents
- 100 unique bot personas with distinct personalities and playstyles
- 8 strategic archetypes: Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist
- 4-tier AI decision-making system:
  - **Tier 1 (LLM Elite):** Natural language processing for contextual decisions
  - **Tier 2 (Strategic):** Decision tree-based planning
  - **Tier 3 (Simple):** Behavioral rule sets
  - **Tier 4 (Random):** Weighted probabilistic actions
- Emotional state tracking and persistent relationship memory

### Victory Conditions
Choose your path to galactic dominance:

1. **Conquest:** Control 60% of all sectors through military expansion
2. **Economic:** Achieve 1.5x networth of second-place player
3. **Diplomatic:** Lead a coalition controlling 50% of territory
4. **Research:** Complete all 8 research technology levels
5. **Military:** Command 2x military power of all other players combined
6. **Survival:** Highest networth when reaching Turn 200

## Project Status

**Active Development** — The project is under active specification and automation development. Recent work has focused on dependency analysis, specification validation, and system documentation automation. 

**Current Focus:**
- System specification validation and documentation automation
- Dependency analysis and cross-system integration testing
- AI personality and decision-making framework refinement

**Testing Status:** Unit and integration test suites are planned for implementation in the next development phase. No automated tests currently exist—this is a priority for the roadmap.

**Last Updated:** January 13, 2026

## Installation

### Prerequisites
- Node.js 14.x or higher
- Git
- npm (bundled with Node.js)

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nexus-dominion.git
cd nexus-dominion
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration settings
```

4. Verify the installation by running the dependency analyzer:
```bash
node analyze-dependencies.js
```

## Usage

### Running System Analysis

The project includes automation tools for system specification validation and dependency analysis:

#### Analyze All Systems
```bash
node analyze-all-systems.js
```
This script traverses all system specifications in the `docs/` directory and generates comprehensive dependency reports.

#### Validate Specifications
```bash
node scripts/validate-specs.js
```
Validates system specification format, parent-child relationships, and numbering consistency across the specification suite.

#### Analyze Dependencies
```bash
node analyze-dependencies.js
```
Performs idempotent analysis of system interdependencies, identifying blockers and integration points between game systems.

### Project Scripts

Detailed documentation for all automation scripts is available in [SCRIPTS-README.md](./SCRIPTS-README.md), including:
- Specification validation workflows
- Dependency analysis procedures
- System documentation generation
- Session tracking and summary tools

### Game Configuration

See `.env.example` for available configuration options including:
- Game turn limits
- AI difficulty tiers
- Resource multipliers
- Coalition victory conditions

## Project Structure

```
nexus-dominion/
├── docs/                              # System specifications and design documents
│   ├── COMBAT-SYSTEM.md              # Combat mechanics: 3-phase system, unit types
│   ├── DIPLOMACY-SYSTEM.md           # Diplomatic and coalition systems
│   ├── ECONOMY-SYSTEM.md             # Market, pricing, black market mechanics
│   ├── AI-SYSTEM.md                  # 4-tier AI decision framework
│   └── [11 additional system specs]  # Complete system documentation
├── scripts/                           # Automation and validation tools
│   ├── validate-specs.js             # Specification format validator
│   └── [additional utilities]        # Supporting scripts
├── .github/                           # GitHub configuration (workflows, etc.)
├── .husky/                            # Git hooks for development
├── .claude/                           # AI assistant context files
├── analyze-all-systems.js            # Comprehensive system analyzer
├── analyze-dependencies.js           # Dependency graph generator
├── BOARDGAME-VISION.md              # Original design vision document
├── SESSION-SUMMARY-2026-01-13.md    # Development session summary
├── SCRIPTS-README.md                # Detailed automation tool documentation
├── .env.example                      # Environment configuration template
├── .env.local                        # Local environment overrides (not in git)
└── README.md                         # This file
```

### Key Directories

- **`docs/`** — Contains 15 system specification documents covering all gameplay systems from combat to AI personality frameworks. Each specification includes dependencies, blockers, and integration requirements.
- **`scripts/`** — Automation and validation tools for maintaining system specifications and generating documentation reports.
- **.`github/`** — GitHub Actions workflows and CI/CD configuration (when implemented).
- **`.claude/`** — Context snapshots and analysis files for AI-assisted development sessions.

## Game Mechanics

### Empire Management
Manage resources across multiple sectors, each with unique production profiles. Balance military spending, research investment, and economic growth to achieve your chosen victory condition over 50-500 turns.

### Combat System
Multi-phase warfare: Space Battles determine orbital control, Orbital Bombardment damages planetary defenses, and Ground Assaults seize territory. Unit composition and diversity bonuses significantly affect outcomes.

### Diplomatic Coalitions
Form alliances with other players and AI opponents to create winning coalitions. Coalition members share victory conditions and can coordinate military action for combined territorial control.

### AI Personalities
Each of 100 AI opponents has a unique personality profile based on 8 strategic archetypes. They form memories of past interactions, track emotional state, and make contextual decisions through a 4-tier system ranging from LLM-based reasoning to simple rule sets.

### Victory Paths
Six distinct victory conditions allow for diverse strategies: military conquest, economic dominance, diplomatic leadership, technological advancement, military superiority, or survival with highest networth.

## Development

### Code Organization

The project follows a specification-driven architecture where game systems are documented as separate specifications in `docs/`. Each specification includes:
- System overview and purpose
- Game mechanics and rules
- Integration points with other systems
- Dependencies and blockers
- Implementation requirements

### Dependency Management

System interdependencies are tracked and analyzed through automated tools:
- Run `node analyze-dependencies.js` to generate a current dependency graph
- Review `docs/` specifications for **Dependencies** and **Blockers** sections
- Check `SESSION-SUMMARY-2026-01-13.md` for recent architectural decisions

### Contributing Code

1. Ensure your changes align with the system specifications in `docs/`
2. Update relevant specification documents if adding new features
3. Run `node validate-specs.js` to verify specification consistency
4. Follow the architectural patterns established in existing system specifications

### Known Limitations

- **No test suite currently exists.** Unit and integration tests are planned as a priority for the next development phase.
- **Automated tests not in CI/CD pipeline.** GitHub Actions workflows for testing and validation will be implemented once test infrastructure is established.
- **Development velocity:** Last commit was 33 days ago. The project is in specification and planning phase with automation tooling prioritized over implementation.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Make your changes and validate against specifications
4. Submit a pull request with a clear description of changes

For major changes, please open an issue first to discuss your proposed modifications.

## License

[Specify your license here - e.g., MIT, GPL-3.0, etc.]
```