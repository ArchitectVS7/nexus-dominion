---
argument-hint: [SCOPE] [--agents=LIST] [--output=FILE]
description: Multi-agent documentation review for completeness, consistency, market fit, and UX. Usage: /docs-review FULL or /docs-review SYSTEM COMBAT
---

# Documentation Review Skill

Multi-agent orchestration for comprehensive documentation review. Specialized agents analyze your specifications from different perspectives (technical clarity, market positioning, user experience, game design, etc.) and synthesize findings into actionable recommendations.

## Purpose

This skill helps you validate specifications BEFORE coding by:
1. **Catching internal inconsistencies** across 129+ specs and 43 docs
2. **Validating market positioning** and competitive differentiation
3. **Ensuring player comprehension** and learning curve feasibility
4. **Confirming implementability** and avoiding architectural traps
5. **Identifying gaps** in specifications or missing requirements

## Parameters

- **Scope**: `$1` - What to review
  - `FULL` - All documentation (executive + all systems)
  - `EXEC` - Executive tier only (VISION.md, PRD-EXECUTIVE.md)
  - `SYSTEM {name}` - Single system (e.g., `SYSTEM COMBAT`)
  - `SYSTEMS {list}` - Multiple systems (e.g., `SYSTEMS COMBAT,MILITARY,DIPLOMACY`)
  - `PATH {path}` - Custom path (e.g., `PATH docs/Game Systems/`)

- **Agent Selection**: `--agents=LIST` (optional)
  - Default: All agents run in parallel
  - Custom: `--agents=game-designer,market-researcher,ux-researcher`

- **Output**: `--output=FILE` (optional)
  - Default: `docs/development/analysis/review-{scope}-{timestamp}.md`
  - Custom: `--output=docs/review-combat-ux.md`

## Available Agents

### Game Design Perspective
- **game-designer** (custom for game projects)
  - Internal consistency of game mechanics
  - Game loop coherence and pacing
  - Fun factor and player engagement hooks
  - Balance between complexity and accessibility
  - Replayability and strategic depth

### Documentation Quality
- **technical-writer**
  - Clarity, conciseness, consistency in writing
  - Proper use of technical terminology
  - Formatting, structure, and organization
  - Readability for target audience
  - Grammar, spelling, and style guide compliance

- **documentation-engineer**
  - Documentation architecture and structure
  - Cross-references and linking strategy
  - Documentation tooling and automation
  - Version control and maintenance processes
  - Documentation completeness vs. implementation

**When to use which:**
- Use **technical-writer** for language quality and readability
- Use **documentation-engineer** for structural and systemic issues

### Product & Project Management
- **product-manager**
  - Feature prioritization alignment with vision
  - Market requirements and user stories
  - Business value and ROI considerations
  - Roadmap coherence and dependencies
  - Competitive positioning and differentiation

- **project-manager**
  - Feasibility and scope management
  - Risk identification and mitigation
  - Resource estimation and constraints
  - Timeline implications (if provided)
  - Dependency management and blockers

**When to use which:**
- Use **product-manager** for "what to build" and "why" (market fit, user value)
- Use **project-manager** for "how to execute" (feasibility, risks, dependencies)

### User & Customer Experience
- **ux-researcher**
  - Player journey mapping
  - Cognitive load and learning curve
  - Information architecture for UI specs
  - User comprehension and mental models
  - Accessibility and inclusivity

- **customer-success-manager**
  - Player onboarding and retention
  - Support burden and common pain points
  - Feature discoverability
  - Player satisfaction and churn risks
  - Community feedback integration

### Market & Competition
- **market-researcher**
  - Target audience definition and sizing
  - Market trends and opportunities
  - Pricing and monetization strategy
  - Go-to-market approach
  - Player demographics and psychographics

- **competitive-analyst**
  - Competitive landscape analysis
  - Feature differentiation vs. competitors
  - SWOT analysis
  - Positioning and unique value proposition
  - Competitive threats and opportunities

### Research & Data
- **research-analyst**
  - Evidence-based validation of assumptions
  - Data requirements for metrics
  - Research gaps and unknowns
  - Benchmarking and industry standards
  - Hypothesis testing approach

- **data-researcher**
  - Data model coherence
  - Metrics and KPIs definition
  - Analytics requirements
  - Data collection and storage needs
  - Performance measurement strategy

### Technical Architecture
- **architect-reviewer**
  - System design coherence
  - Scalability and performance implications
  - Technology stack alignment
  - API surface and integration points
  - Technical debt risks

## Workflow

### Step 1: Pre-Flight Check

Show current git status and scope:
```
Current branch: !`git branch --show-current`
Git status: !`git status --short docs/`
Review scope: **$1**
Agent selection: **{agents or "ALL"}**
```

### Step 2: Load Context (Token-Efficient)

Based on scope, read files in parallel:

**For FULL scope:**
1. `docs/VISION.md` (~10K tokens)
2. `docs/PRD-EXECUTIVE.md` (~15K tokens)
3. `docs/development/SPEC-REGISTRY.md` (~8K tokens)
4. `docs/README.md` (~2K tokens)
5. Sample 3-5 representative system docs (~40K tokens total)

**For EXEC scope:**
1. `docs/VISION.md`
2. `docs/PRD-EXECUTIVE.md`
3. `docs/README.md`

**For SYSTEM {name} scope:**
1. `docs/VISION.md` (context)
2. `docs/PRD-EXECUTIVE.md` (context)
3. Target system doc from `docs/Game Systems/{NAME}-SYSTEM.md`
4. Target appendix from `docs/Game Systems/appendix/{NAME}-SYSTEM-APPENDIX.md` (if exists)
5. Related specs from SPEC-REGISTRY.md

**For SYSTEMS {list} scope:**
- Load each system as above

**For PATH {path} scope:**
- Load all markdown files in the specified path

**Token Budget:**
- FULL: ~75K initial load + ~50K per agent = ~550K for 8 agents
- EXEC: ~30K initial load + ~25K per agent = ~230K for 8 agents
- SYSTEM: ~40K initial load + ~30K per agent = ~280K for 8 agents

### Step 3: Launch Review Agents (Parallel)

For each selected agent, launch a Task with subagent_type matching the agent name:

```typescript
// Example: Launch 3 agents in parallel
Task({
  subagent_type: "game-designer",
  description: "Review game design consistency",
  prompt: `Review the following documentation for game design quality:

Scope: {scope}
Focus areas:
- Internal consistency of mechanics
- Game loop coherence
- Balance and pacing
- Fun factor and engagement
- Strategic depth vs. accessibility

Documentation:
{loaded_context}

Provide your analysis in this format:
## Strengths
- [List what works well]

## Issues
- [Critical issues that could cause problems]
- [Moderate issues for consideration]

## Recommendations
- [Specific, actionable suggestions]

## Risk Assessment
- HIGH/MEDIUM/LOW risks identified
`
})

// Launch other agents in parallel with similar prompts
```

**Agent-Specific Focus Areas:**

- **game-designer**: Mechanics consistency, fun factor, balance, strategic depth
- **technical-writer**: Clarity, terminology, structure, readability
- **documentation-engineer**: Architecture, cross-refs, completeness, maintainability
- **product-manager**: Feature priority, market requirements, business value, roadmap
- **project-manager**: Feasibility, scope, risks, dependencies, execution
- **ux-researcher**: Player journey, cognitive load, UI specs, mental models
- **customer-success-manager**: Onboarding, retention, support burden, player satisfaction
- **market-researcher**: Target audience, market trends, monetization, positioning
- **competitive-analyst**: Differentiation, competitive threats, SWOT, positioning
- **research-analyst**: Evidence-based validation, benchmarking, research gaps
- **data-researcher**: Data model, metrics, analytics, performance measurement
- **architect-reviewer**: System design, scalability, tech stack, API surface

### Step 4: Collect Agent Outputs

Wait for all agents to complete. Each agent returns:
- Strengths identified
- Issues found (with severity)
- Recommendations (with priority)
- Risk assessment (HIGH/MEDIUM/LOW)

### Step 5: Synthesize Findings

Launch a **knowledge-synthesizer** agent to:
1. **Merge overlapping findings** across agents
2. **Identify consensus issues** (multiple agents flag same problem)
3. **Resolve contradictions** (when agents disagree)
4. **Prioritize recommendations** by impact and urgency
5. **Create cross-functional insights** (e.g., UX issue that affects marketing)

Synthesis format:
```markdown
# Documentation Review Synthesis

**Scope:** {scope}
**Reviewed:** {date}
**Agents:** {list}

---

## Executive Summary

{2-3 paragraph overview of findings}

**Overall Health:** 🟢 GREEN | 🟡 YELLOW | 🔴 RED
**Critical Issues:** {count}
**High Priority Recommendations:** {count}

---

## Critical Issues (Must Fix)

### Issue: {title}
**Severity:** CRITICAL
**Affected Areas:** {systems/docs}
**Identified By:** {agent1, agent2}
**Impact:** {description}
**Recommendation:** {specific action}

---

## High Priority Recommendations

### Recommendation: {title}
**Priority:** HIGH
**Impact:** {game design | UX | market | technical}
**Effort:** LOW | MEDIUM | HIGH
**Proposed By:** {agent}
**Details:** {description}

---

## Medium Priority Improvements

{List of moderate recommendations}

---

## Strengths & Wins

{What's working well - positive reinforcement}

---

## Cross-Cutting Themes

{Patterns that emerged across multiple agents}

---

## Agent-Specific Insights

### Game Design
{Summary from game-designer}

### Documentation Quality
{Summary from technical-writer + documentation-engineer}

### Product Strategy
{Summary from product-manager + market-researcher + competitive-analyst}

### User Experience
{Summary from ux-researcher + customer-success-manager}

### Technical Feasibility
{Summary from architect-reviewer + project-manager}

### Data & Research
{Summary from research-analyst + data-researcher}

---

## Next Steps

1. **Immediate Actions** (this week)
   - {actionable items}

2. **Short-Term** (next sprint)
   - {actionable items}

3. **Long-Term** (roadmap adjustments)
   - {actionable items}

---

## Appendix: Individual Agent Reports

{Full reports from each agent}
```

### Step 6: Write Output

Write synthesis to:
- Default: `docs/development/analysis/review-{scope}-{YYYYMMDD-HHMM}.md`
- Custom: User-specified path

### Step 7: Commit Review (Optional)

If `--commit` flag is passed, create commit:
```
docs-review: Complete {scope} multi-agent review

Agents: {list}
Critical issues: {count}
High priority: {count}

Output: docs/development/analysis/review-{scope}-{timestamp}.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Usage Examples

### Full Documentation Review (All Agents)
```bash
/docs-review FULL
```

### Executive Tier Review (Vision + PRD)
```bash
/docs-review EXEC
```

### Single System Review
```bash
/docs-review SYSTEM COMBAT
```

### Multiple Systems Review
```bash
/docs-review SYSTEMS COMBAT,MILITARY,DIPLOMACY
```

### Custom Agent Selection
```bash
# Game design + UX only
/docs-review FULL --agents=game-designer,ux-researcher

# Market positioning review
/docs-review EXEC --agents=market-researcher,competitive-analyst,product-manager

# Technical feasibility check
/docs-review SYSTEMS COMBAT,BOT --agents=architect-reviewer,project-manager,documentation-engineer
```

### Custom Output Path
```bash
/docs-review SYSTEM COMBAT --output=docs/reviews/combat-deep-dive.md
```

### Quick Pre-Coding Check
```bash
# Before starting implementation of COMBAT system
/docs-review SYSTEM COMBAT --agents=game-designer,architect-reviewer,project-manager
```

## Recommended Review Strategies

### Strategy 1: Layered Review (Most Thorough)
```bash
# Week 1: Foundation
/docs-review EXEC --agents=product-manager,market-researcher,competitive-analyst

# Week 2: Core systems
/docs-review SYSTEMS RESOURCE,SECTOR,MILITARY,COMBAT --agents=game-designer,architect-reviewer,ux-researcher

# Week 3: Advanced systems
/docs-review SYSTEMS DIPLOMACY,BOT,RESEARCH,VICTORY --agents=game-designer,architect-reviewer,ux-researcher

# Week 4: Expansion systems
/docs-review SYSTEMS COVERT,MARKET,SYNDICATE,TECH,PROGRESSIVE --agents=game-designer,project-manager

# Week 5: Full synthesis
/docs-review FULL
```

### Strategy 2: By Concern (Targeted)

**Market Validation:**
```bash
/docs-review FULL --agents=market-researcher,competitive-analyst,product-manager,customer-success-manager
```

**Player Experience:**
```bash
/docs-review FULL --agents=game-designer,ux-researcher,customer-success-manager
```

**Technical Feasibility:**
```bash
/docs-review FULL --agents=architect-reviewer,project-manager,documentation-engineer
```

**Documentation Quality:**
```bash
/docs-review FULL --agents=technical-writer,documentation-engineer
```

### Strategy 3: System-by-System (Iterative)

Review each system before implementing:
```bash
/docs-review SYSTEM RESOURCE --commit
# Fix issues found
/docs-review SYSTEM SECTOR --commit
# Fix issues found
/docs-review SYSTEM MILITARY --commit
# Continue...
```

### Strategy 4: Cross-System Dependencies

Review related systems together:
```bash
# Combat cluster
/docs-review SYSTEMS MILITARY,COMBAT,RESEARCH

# Economy cluster
/docs-review SYSTEMS RESOURCE,SECTOR,MARKET

# Diplomacy cluster
/docs-review SYSTEMS DIPLOMACY,BOT,COVERT

# Victory cluster
/docs-review SYSTEMS VICTORY,PROGRESSIVE
```

## Agent Selection Guidelines

### When to Use Each Agent

**Always include for FULL reviews:**
- game-designer (game-specific consistency)
- product-manager (vision alignment)
- architect-reviewer (implementability)

**Include for market validation:**
- market-researcher (audience fit)
- competitive-analyst (differentiation)
- customer-success-manager (retention)

**Include for UX validation:**
- ux-researcher (player journey)
- game-designer (fun factor)
- customer-success-manager (onboarding)

**Include for technical validation:**
- architect-reviewer (system design)
- project-manager (feasibility)
- documentation-engineer (completeness)

**Include for documentation quality:**
- technical-writer (clarity)
- documentation-engineer (structure)

**Include for data/metrics:**
- research-analyst (evidence)
- data-researcher (metrics)

## Token Efficiency

### Agent Cost Estimates
- Small agent (technical-writer, documentation-engineer): ~20-30K tokens
- Medium agent (game-designer, ux-researcher, product-manager): ~30-50K tokens
- Large agent (architect-reviewer, market-researcher): ~50-75K tokens

### Scope Cost Estimates
- EXEC: ~200-300K tokens (all agents)
- SYSTEM: ~250-350K tokens (all agents)
- SYSTEMS (3-4): ~400-600K tokens (all agents)
- FULL: ~500-800K tokens (all agents)

### Cost Optimization
- Use `--agents` flag to run only needed agents
- Review systems in clusters (SYSTEMS) instead of FULL
- Run EXEC first to catch high-level issues before deep-diving

## Stop Conditions

- Scope not found or invalid
- Documentation files missing
- Token budget exceeded (warn user)
- All agents failed (report error)
- User cancels via Ctrl+C

## Success Criteria

A review is complete when:
1. All selected agents have analyzed the documentation
2. Knowledge-synthesizer has merged findings
3. Output file is written with complete synthesis
4. Critical issues are clearly identified
5. Recommendations are prioritized and actionable

## Output Format

The final synthesis file includes:
- **Executive Summary** (decision-makers)
- **Critical Issues** (must fix before coding)
- **High Priority Recommendations** (should fix soon)
- **Medium Priority Improvements** (nice to have)
- **Strengths & Wins** (positive reinforcement)
- **Cross-Cutting Themes** (patterns)
- **Agent-Specific Insights** (detailed perspectives)
- **Next Steps** (actionable roadmap)
- **Appendix** (full agent reports)

## Best Practices

1. **Run EXEC review first** before deep-diving into systems
2. **Use targeted agent sets** for specific concerns
3. **Review systems in dependency order** (foundational first)
4. **Fix critical issues immediately** before continuing
5. **Iterate on high-priority recommendations** before coding
6. **Keep review outputs in version control** to track evolution
7. **Re-run reviews after major doc changes** to validate fixes
8. **Use SYSTEM reviews before implementing** each system

## Integration with Other Skills

- **After /spec-split-all**: Review atomicity and completeness
- **After /spec-analyze**: Review dependencies and blockers
- **Before coding**: Final validation of implementation plan
- **After design changes**: Validate consistency maintained
- **Before stakeholder demos**: Ensure vision alignment

---

**Last Updated:** 2026-01-13
**Version:** 1.0
**Status:** Active
