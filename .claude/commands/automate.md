---
argument-hint: [file-path] [task-group]
description: Automate a task group from any file. Usage: /automate docs/milestones.md "Milestone 8"
---

# Automate Task Group

Automate all tasks in a task group from a specified file.

## Parameters

- **File**: `$1` (e.g., `docs/milestones.md`, `docs/backlog.md`, `tasks.md`)
- **Task Group**: `$2` (e.g., "Milestone 8", "Phase 1", "Epic 12", "Sprint 5")

## Pre-Flight

Current git status: !`git status --short`
Current branch: !`git branch --show-current`

## Workflow

For each incomplete task in `$2` from file `$1`:

### 1. Parse & Identify
- Read the task file `$1`
- Find the task group matching `$2`
- Identify the first incomplete task (unchecked `- [ ]` item)
- Report: "Working on: {group} - Task: {description}"

### 2. Gather Context
- Read the task file for requirements
- Check for related docs (PRD, README, etc.)
- Examine existing code patterns in the codebase

### 3. Implement
Following `.claude/prompts/developer.md`:
- Write clean TypeScript (strict mode, no `any`)
- Follow existing patterns in src/lib/
- Add data-testid to all UI elements
- Check formulas match specs exactly

### 4. Self-Review
Following `.claude/prompts/reviewer.md`:
- PRD/spec compliance check
- Security review (input validation, Zod schemas)
- TypeScript quality (types, null handling)
- Logic bugs (edge cases, off-by-one)
- Performance (N+1 queries, re-renders)

Fix any CRITICAL or HIGH issues before proceeding.

### 5. Quality Gates
Run and verify all pass:
```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run build
```

If any fail, fix and re-run.

### 6. Update Task File
- Mark the task complete: `- [ ]` → `- [x]`
- Add implementation notes if significant

### 7. Commit
```
{GroupID}: {Task description}

- Specific changes made
- Files created/modified

Implements: {task from file}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 8. Next Task
Move to the next incomplete task in the group and repeat.

## Stop Conditions

- All tasks in the group are complete
- Quality gates fail after 2 fix attempts
- User interrupts

## Examples

```
/automate docs/milestones.md "Milestone 8"
/automate docs/milestones.md "M8"
/automate docs/backlog.md "Epic 12"
/automate docs/backlog.md "Phase 1"
/automate tasks.md "Sprint 5"
```
