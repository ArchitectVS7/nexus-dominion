# Automation Knowledge Base

This document captures learnings from our ongoing automation research project. Each milestone run adds insights that improve future automation.

---

## Run Log

### Run #1: Milestone 7 (Market & Diplomacy)
**Date:** 2024-12-24
**Status:** PENDING
**Duration:** TBD

#### Configuration
- **Approach:** Single-agent with self-review
- **Quality Gates:** typecheck, lint, test, build
- **E2E Tests:** Yes
- **Human Intervention:** Minimal (approval checkpoints)

#### Tasks
| Task | Description | Status | Notes |
|------|-------------|--------|-------|
| M7-1 | Global market (buy/sell resources) | | |
| M7-2 | Dynamic pricing based on supply/demand | | |
| M7-3 | Price range: 0.4× to 1.6× base price | | |
| M7-4 | NAP treaty system | | |
| M7-5 | Alliance treaty system | | |
| M7-6 | Treaty UI (propose/accept/reject) | | |
| M7-7 | Treaty enforcement | | |
| M7-8 | Treaty breaking penalties (reputation) | | |

#### Observations
- TBD after run

#### What Worked
- TBD

#### What Didn't Work
- TBD

#### Improvements for Next Run
- TBD

---

## Patterns That Work

### 1. Task Granularity
*What's the right size for automated tasks?*

- TBD

### 2. Review Effectiveness
*How effective is self-review vs adversarial review?*

- TBD

### 3. Test Coverage
*What level of test coverage prevents regressions?*

- TBD

### 4. Context Management
*How to prevent context drift over long runs?*

- TBD

### 5. Error Recovery
*Best strategies when automation hits blockers?*

- TBD

---

## Anti-Patterns to Avoid

### 1. TBD
*Description of what to avoid and why*

---

## Metrics

### Per-Run Metrics
| Metric | Description |
|--------|-------------|
| Tasks Completed | Number of tasks successfully finished |
| Time Per Task | Average time from start to commit |
| Review Iterations | How many fix cycles per task |
| Test Failures | Number of test failures encountered |
| Human Interventions | Times human input was required |

### Aggregate Metrics (Running Total)
| Milestone | Tasks | Duration | Success Rate | Interventions |
|-----------|-------|----------|--------------|---------------|
| M7 | 8 | TBD | TBD | TBD |
| M8 | - | - | - | - |
| M9 | - | - | - | - |

---

## Configuration Evolution

### v1: Initial Setup (M7)
```
Agents: Single (developer + self-review)
Quality Gates: typecheck, lint, test, build
E2E: Per milestone
Commits: Per task
Checkpoints: After each task
```

### v2: TBD (after M7 learnings)

---

## Tools & Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run milestone:status` | Check current task | Before starting |
| `npm run milestone:cycle` | Start dev cycle | Begin work |
| `npm run milestone:validate` | Run all checks | Before commit |
| `/milestone` | Full automation skill | In Claude Code |

---

## Key Decisions Log

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| 2024-12-24 | Start with skill-based automation | Lower complexity than Agent SDK | TBD |
| 2024-12-24 | Single agent with self-review | Simpler context management | TBD |

---

## Questions to Answer

1. **Can we complete M7 without human code intervention?**
2. **What's the optimal task batch size?**
3. **How often do quality gates catch real issues?**
4. **Does adversarial review add value over self-review?**
5. **What's the right checkpoint frequency?**

---

*This is a living document. Update after each automation run.*
