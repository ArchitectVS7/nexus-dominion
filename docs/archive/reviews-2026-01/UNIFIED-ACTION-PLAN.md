# Unified Action Plan - Nexus Dominion

**Synthesized from:** UX Review, Player Journey Review, QA Review
**Date:** 2026-01-10
**Total Issues Identified:** 97 (UX: 40, Player Journey: 30, QA: 27)

---

## Priority Legend

| Priority | Criteria |
|----------|----------|
| P0 | **BLOCKER** - Blocks other work or causes test/build failures |
| P1 | **CRITICAL** - Major user impact, compliance violations, core functionality broken |
| P2 | **HIGH** - Significant UX degradation, missing critical flows |
| P3 | **MEDIUM** - Polish, consistency, enhancement |
| P4 | **LOW** - Nice-to-have, future consideration |

---

## P0: BLOCKERS (Fix Immediately)

These issues block other work and must be resolved first.

### B1: E2E Test Fixture Not Creating Bots
**Source:** QA #1
**File:** `e2e/fixtures/game.fixture.ts:539-562`
**Impact:** Causes 16 combat tests to fail (43% pass rate), blocks all combat-related validation
**Action:**
- Add bot count input selection in `ensureGameExists()`
- Verify bots created before proceeding
- Expected: Pass rate improves from 43% to ~75%

**Dependencies:** None
**Blocks:** All combat E2E tests, Combat UX validation, Tutorial combat testing

---

### B2: UI Overlays Blocking Test Interactions
**Source:** QA #2
**File:** `e2e/fixtures/game.fixture.ts:398-531`
**Impact:** 23+ tests fail due to backdrop overlays intercepting pointer events
**Action:**
- Add force removal of backdrop overlays via JavaScript injection
- Wait for animations to complete after dismissal
- Add verification step ensuring no overlay remains

**Dependencies:** None
**Blocks:** Navigation tests, Interaction tests, Feature validation

---

### B3: Page Render Verification Missing
**Source:** QA #3
**Files:** Multiple E2E test files
**Impact:** Element-not-found errors on Combat, Research, Military pages
**Action:**
- Create `waitForPageReady()` helper function
- Apply to all `navigateToGamePage()` calls
- Expected: Fixes 10+ test failures

**Dependencies:** B2 (overlay fixes improve reliability)
**Blocks:** Page-specific E2E tests

---

## P1: CRITICAL (Sprint 1)

### C1: Tutorial Completion Doesn't Guarantee Gameplay Readiness
**Source:** Player Journey PJ-1
**File:** `src/lib/tutorial/types.ts:60-156`
**Impact:** Players finish 5-step tutorial but face 13+ game pages without guidance
**Action:**
- Add "Tutorial Complete" modal with actionable next steps:
  - "Build 100 soldiers" (link to Military)
  - "Buy 2 more sectors before turn 5" (link to Sectors)
  - Checklist format with clickable goals

**Dependencies:** None
**Blocks:** Player retention (new player drop-off)

---

### C2: No Fallback When Tutorial is Skipped
**Source:** Player Journey PJ-2
**File:** `src/components/game/tutorial/TutorialOverlay.tsx:197-199`
**Impact:** Skip-tutorial players get zero onboarding on turn 1
**Action:**
- Show condensed "Quick Start Guide" modal if skipped
- Enable OnboardingManager from turn 1 (not turn 2)
- Add "Restart Tutorial" button in Quick Reference modal

**Dependencies:** None
**Blocks:** Skipped-tutorial player experience

---

### C3: Research System Has Zero Guidance
**Source:** Player Journey PJ-4
**File:** `src/app/game/research/page.tsx`
**Impact:** Players encounter FundamentalResearchProgress with no context
**Action:**
- Add OnboardingHint at turn 7 explaining research fundamentals
- Add first-time overlay explaining draft system
- Show research prerequisites on Military page

**Dependencies:** C1, C2 (tutorial improvements)
**Blocks:** Research feature adoption

---

### C4: Timeout Errors Without Recovery
**Source:** UX #4
**Files:** `combat/page.tsx:56-58`, `military/page.tsx:19-21`
**Impact:** 15-second hard timeout with no retry option; users must manually refresh
**Action:**
- Replace timeout error with retry mechanism
- Add "Retry" button with exponential backoff
- Show helpful message explaining timeout

**Dependencies:** None
**Blocks:** User experience on slow connections

---

### C5: Insufficient Color Contrast (WCAG AA Violation)
**Source:** UX #1
**Files:** `MobileBottomBar.tsx`, `EmpireStatusBar.tsx`, `TurnOrderPanel.tsx`
**Impact:** Text contrast ratio ~3:1 fails WCAG AA (4.5:1 minimum); affects low-vision users
**Action:**
- Replace `text-gray-400` with `text-gray-300` or `text-gray-200`
- Update `text-gray-500` to `text-gray-400` for secondary text
- Add contrast checker to CI/CD pipeline

**Dependencies:** None
**Blocks:** WCAG Level A compliance

---

### C6: Color-Only Status Indicators (WCAG A Violation)
**Source:** UX #2
**File:** `MobileBottomBar.tsx:108-137`
**Impact:** Screen readers don't announce severity levels
**Action:**
- Wrap status indicators in ARIA live regions
- Add `aria-label` with severity: "Food status: Critical (severe shortage)"
- Use semantic markup beyond just color

**Dependencies:** C5 (color contrast fixes)
**Blocks:** WCAG Level A compliance

---

### C7: Missing Form Validation Error Association (WCAG A Violation)
**Source:** UX #3
**File:** `BuildUnitsPanel.tsx:254-261`
**Impact:** Screen reader users don't know inputs are in error state
**Action:**
- Add `aria-invalid={!isValid}` to inputs when validation fails
- Add `aria-errormessage="error-id"` pointing to error message
- Ensure error messages have proper `id` attributes

**Dependencies:** None
**Blocks:** WCAG Level A compliance

---

### C8: Combat Edge Case Tests Skipped (35 Tests)
**Source:** QA #4
**File:** `e2e/combat-edge-cases.spec.ts:165-619`
**Impact:** Protection period, influence sphere, treaty violation logic untested
**Action:**
- Remove `.skip` from all 6 test suites (~35 tests)
- Fix any failing tests
- Add to CI pipeline

**Dependencies:** B1, B2, B3 (fixture fixes)
**Blocks:** Combat system confidence

---

## P2: HIGH (Sprint 2-3)

### H1: No CI E2E Coverage Beyond Smoke Tests
**Source:** QA #6
**File:** `.github/workflows/ci.yml:125`
**Impact:** Full E2E suite (milestone-core, milestone-advanced) not validated in CI
**Action:**
- Add `milestone-core.spec.ts` to CI after smoke tests pass
- Set as non-blocking initially to gather data
- Add `milestone-advanced.spec.ts` in next phase

**Dependencies:** B1, B2, B3 (fixture fixes must land first)
**Blocks:** CI reliability

---

### H2: Processing State Blocks All Interaction
**Source:** UX #6
**File:** `GameShell.tsx:254-286`
**Impact:** No progress indicator or cancel option during long operations
**Action:**
- Replace "PROCESSING..." with progress bar + percentage
- Show intermediate status: "Processing turn (Phase 3 of 6)..."
- Add estimated time remaining

**Dependencies:** None
**Blocks:** User perception of responsiveness

---

### H3: Information Density Overload in Dashboard
**Source:** Player Journey PJ-6
**File:** `src/components/game/GameShell.tsx:254-509`
**Impact:** New players face 15+ UI elements simultaneously
**Action:**
- Implement progressive UI unlocking:
  - Turn 1: Resources, sectors, turn counter only
  - Turn 5: Add military panel
  - Turn 10: Add research, diplomacy
  - Turn 20: Add combat, market

**Dependencies:** C1, C2 (tutorial improvements)
**Blocks:** New player cognitive load

---

### H4: Pre-Defeat Warnings Missing
**Source:** Player Journey PJ-10
**File:** `src/app/game/page.tsx:86-105`
**Impact:** Players bankrupt with no warning or recovery guidance
**Action:**
- Add warning when credits < 500
- Add warning when food goes negative
- Show mini DefeatAnalysisModal tips before actual defeat

**Dependencies:** None
**Blocks:** Player recovery paths

---

### H5: Combat System Never Practiced in Tutorial
**Source:** Player Journey PJ-9
**File:** `src/lib/tutorial/types.ts:60-156`
**Impact:** First real combat encounter has zero guidance
**Action:**
- Add tutorial mention: "Visit Combat page to preview interface"
- Add "Combat Simulator" showing sample battle with tooltips
- Integrate CombatPanelContent with first-time tutorial

**Dependencies:** C1, C3 (tutorial improvements)
**Blocks:** Combat feature readiness

---

### H6: Test Selector Fragility
**Source:** QA #7
**Files:** Multiple E2E files
**Impact:** Button text changes break tests (e.g., "End Turn" → "NEXT CYCLE")
**Action:**
- Audit all E2E tests for text-based selectors
- Replace with stable `[data-testid]` attributes
- Update components with missing test IDs

**Dependencies:** None
**Blocks:** Test maintenance burden

---

### H7: Touch Target Sizes Below Minimum
**Source:** UX #7
**File:** `ConfirmationModal.tsx:174-181`
**Impact:** Modal close buttons < 44x44px; fails iOS/Android touch target recommendations
**Action:**
- Ensure all interactive elements have minimum 44x44px touch targets
- Add padding: `p-3` instead of `p-2` for modal close buttons
- Use `min-w-[44px] min-h-[44px]` utility class

**Dependencies:** None
**Blocks:** Mobile usability

---

### H8: Turn Summary Has No "What Should I Do Next" Guidance
**Source:** Player Journey PJ-13
**File:** `src/components/game/TurnSummaryModal.tsx:82-358`
**Impact:** Players see numbers change but don't know if they're on track
**Action:**
- Add "Recommended Next Actions" section:
  - If soldiers < 200: "Build more ground troops"
  - If credits > 5000: "Consider buying sectors"
  - If turn == 19: "Protection ends next turn!"

**Dependencies:** None
**Blocks:** Player guidance loop

---

### H9: Loading Skeletons Lack Accessibility
**Source:** UX #5
**File:** `sectors/page.tsx:86-96`
**Impact:** Screen reader users don't know content is loading
**Action:**
- Wrap loading skeletons in `<div role="status" aria-live="polite">`
- Add visually hidden text "Loading..." for screen readers

**Dependencies:** C6 (live region patterns)
**Blocks:** WCAG Level A compliance

---

### H10: No Confirmation for Destructive Actions (Server-Side)
**Source:** UX #9
**File:** `sector-actions.ts`
**Impact:** Releasing sectors (permanent action) relies only on client-side confirmation
**Action:**
- Wrap destructive server actions with confirmation step
- Show impact preview: "Releasing this sector will reduce food by 50/turn"

**Dependencies:** None
**Blocks:** User safety on destructive operations

---

## P3: MEDIUM (Sprint 4-6)

### M1: Unlock Notifications Spam at Threshold Turns
**Source:** Player Journey PJ-11
**File:** `src/components/game/UnlockNotification.tsx:56-65`
**Action:** Group unlocks by category; stagger across 3 turns instead of same turn

**Dependencies:** H3 (progressive UI)

---

### M2: Long Lists Without Virtualization
**Source:** UX #10
**Files:** `SectorsList.tsx`, `MessageInbox.tsx`
**Action:** Use `react-window` or `@tanstack/react-virtual` for lists >50 items

**Dependencies:** None

---

### M3: Mobile Viewport Height Issues
**Source:** UX #15
**File:** `MobileActionSheet.tsx:172`
**Action:** Replace `vh` units with `dvh` (dynamic viewport height)

**Dependencies:** None

---

### M4: Tutorial Can't Be Replayed
**Source:** UX #19
**File:** `TutorialOverlay.tsx:197-199`
**Action:** Add "Replay Tutorial" button in settings or help menu

**Dependencies:** C2 (tutorial skip improvements)

---

### M5: Focus Trap Issues in Nested Modals
**Source:** UX #11
**File:** `TutorialOverlay.tsx:113-145`
**Action:** Replace custom focus trap with `@radix-ui/react-dialog` or `react-focus-lock`

**Dependencies:** None

---

### M6: Status Indicators Update Without Announcement
**Source:** UX #13
**File:** `GameShell.tsx:111-137`
**Action:** Add `aria-live` region to announce SSE resource changes

**Dependencies:** C6 (live region patterns)

---

### M7: Inconsistent Error Display Patterns
**Source:** UX #8
**Files:** Multiple actions
**Action:** Create error severity taxonomy (Critical=modal, High=toast, Medium=inline)

**Dependencies:** C4 (error recovery)

---

### M8: No Optimistic UI Updates
**Source:** UX #18
**Files:** Action files
**Action:** Show immediate feedback + rollback on error using React Query patterns

**Dependencies:** M7 (error patterns)

---

### M9: Test Isolation via Global Teardown Only
**Source:** QA #13
**Files:** `e2e/global-teardown.ts`, `playwright.config.ts`
**Action:** Add per-test database cleanup hooks

**Dependencies:** B1, B2 (fixture fixes)

---

### M10: No Coverage for Critical User Actions
**Source:** QA #8
**Files:** All E2E files
**Action:** Add tests for: buy sector, queue unit build, complete research, execute combat

**Dependencies:** B1, B2, B3 (fixture fixes), C8 (combat tests)

---

### M11: Limited Browser Coverage
**Source:** QA #18
**File:** `playwright.config.ts:72-76`
**Action:** Enable Firefox and WebKit projects; run on main branch merges only

**Dependencies:** H1 (CI E2E coverage)

---

### M12: Victory Condition Progressive Reveal Missing
**Source:** Player Journey PJ-3
**File:** `src/lib/tutorial/types.ts:142-156`
**Action:** Show only Conquest/Survival initially; add progress indicators

**Dependencies:** C1 (tutorial improvements)

---

### M13: Progressive Disclosure Thresholds Poorly Aligned
**Source:** Player Journey PJ-8
**File:** `src/hooks/useProgressiveDisclosure.ts:32-36`
**Action:** Consider skill-based adaptation vs. turn-based intervals

**Dependencies:** H3 (dashboard information diet)

---

### M14: Crafting System Appears Without Explanation
**Source:** Player Journey PJ-5
**File:** `src/components/game/onboarding/OnboardingManager.tsx:104-114`
**Action:** Add explanation of recipes, dependencies, and strategic value

**Dependencies:** C3 (research guidance patterns)

---

## P4: LOW (Future Backlog)

### L1: No Visual Regression Testing (QA #21)
### L2: Tooltip Positioning Without Collision Detection (UX #16)
### L3: Form Submit on Enter Inconsistent (UX #17)
### L4: Keyboard Shortcuts Help Hidden (UX #22)
### L5: Search/Filter Missing from Long Lists (UX #21)
### L6: No Recent Actions History (UX #31)
### L7: Success Messages Auto-Dismiss Behavior (UX #39)
### L8: Return Player Flow Bypasses Onboarding Check (PJ-26)
### L9: Mobile Experience Not Covered in Tutorial (PJ-27)
### L10: Success Celebrations Minimal (PJ-29)
### L11: No Gameplay Recording/Replay (PJ-30)
### L12: No Load/Stress Tests in CI (QA #25)
### L13: Test Data Fixtures Limited (QA #22)

---

## Dependency Graph

```
B1 (Bot Creation) ──┬──> C8 (Combat Tests)
                    │
B2 (Overlay Fixes) ─┼──> B3 (Page Render) ──> H1 (CI E2E)
                    │
                    └──> M9 (Test Isolation) ──> M10 (Action Tests)

C1 (Tutorial Complete) ──┬──> C3 (Research Guidance)
                         │
C2 (Tutorial Skip) ──────┼──> H3 (Dashboard Diet) ──> M13 (Progressive Disclosure)
                         │
                         └──> H5 (Combat Tutorial) ──> M12 (Victory Reveal)

C5 (Color Contrast) ──> C6 (Status Indicators) ──> M6 (SSE Announcements)

C4 (Timeout Recovery) ──> M7 (Error Patterns) ──> M8 (Optimistic UI)

H6 (Test Selectors) ──> H1 (CI E2E) ──> M11 (Browser Coverage)
```

---

## Sprint Allocation Recommendation

### Sprint 1: Foundation (2 weeks)
- **Focus:** Test reliability + WCAG compliance
- **Items:** B1, B2, B3, C5, C6, C7, C4

### Sprint 2: Onboarding (2 weeks)
- **Focus:** Tutorial/onboarding improvements
- **Items:** C1, C2, C3, H4, H8

### Sprint 3: Testing & Combat (2 weeks)
- **Focus:** Combat tests + CI integration
- **Items:** C8, H1, H5, H6

### Sprint 4: UX Polish (2 weeks)
- **Focus:** Interaction improvements
- **Items:** H2, H3, H7, H9, H10

### Sprint 5-6: Medium Priority (4 weeks)
- **Focus:** Stability and consistency
- **Items:** M1-M14 (prioritize by team capacity)

### Ongoing Backlog
- **Items:** L1-L13 (pick up as capacity allows)

---

## Success Metrics

| Metric | Current | Sprint 3 Target | Sprint 6 Target |
|--------|---------|-----------------|-----------------|
| E2E Test Pass Rate | 43% | 85% | 95% |
| WCAG Level A Compliance | ~85% | 100% | 100% |
| WCAG Level AA Compliance | ~75% | 90% | 95% |
| Player Journey Score | 62/100 | 75/100 | 85/100 |
| Lighthouse Accessibility | 82-88 | 95 | 98 |
| CI E2E Tests | 2 (smoke) | 40+ (core) | 80+ (full) |

---

**Document Owner:** Development Team
**Review Cadence:** Weekly during standup
**Next Review:** End of Sprint 1
