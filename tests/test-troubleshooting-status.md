# Test Troubleshooting - Status Update

**Last Updated:** 2026-01-10

## Remediation Plan Status

### ✅ Phase 1: Immediate Investigation - PARTIALLY COMPLETE

#### 1. Manual smoke test of failing pages
- ❌ **NOT DONE** - Haven't run `npm run dev` to manually test pages
- 🔄 **NEEDED**: Manual verification of:
  - `/game/research` - Does it load in browser?
  - `/game/combat` - Does it load in browser?
  - `/game/military` - Does it load in browser?

#### 2. Check for component errors
- ✅ **COMPLETE** - Verified all pages exist:
  - `src/app/game/research/page.tsx` ✅ EXISTS
  - `src/app/game/combat/page.tsx` ✅ EXISTS
  - `src/app/game/military/page.tsx` ✅ EXISTS
- ✅ **COMPLETE** - TypeScript validation passed (no errors in our changes)
- ✅ **COMPLETE** - Component imports verified

---

### ❌ Phase 2: Fix Research Page - NOT STARTED

**Status:** Research page timeout issues NOT FIXED

**Root Cause Identified:**
- `src/components/game/research/ResearchPanel.tsx` has `useEffect` with NO timeout protection (lines 24-38)
- Same pattern as combat page before fix
- Calls `getResearchInfoAction()` which could hang

**Files Needing Fixes:**
1. ❌ `src/components/game/research/ResearchPanel.tsx` - Add timeout to useEffect
2. ❌ `src/components/game/research/FundamentalResearchProgress.tsx` - Check for similar issues
3. ❌ Verify `getResearchInfoAction()` performance

---

### ✅ Phase 3: Fix Combat Page - COMPLETE

**Status:** All combat page fixes IMPLEMENTED and REVIEWED

#### ✅ Priority 1: Timeout Handling
**File:** `src/app/game/combat/page.tsx` (lines 46-100)

**Changes Made:**
- ✅ Added 15-second timeout using `Promise.race()`
- ✅ Added cleanup flag (`mounted`) to prevent state updates on unmounted components
- ✅ Error handling shows clear message: "Data load timeout after 15 seconds. Please refresh the page."
- ✅ Independent code review: APPROVED

**Code Verified:**
```typescript
// CONFIRMED IN CODE - Lines 46-100
useEffect(() => {
  let mounted = true;
  const loadData = async () => {
    try {
      // Timeout wrapper (15 seconds)
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Data load timeout after 15 seconds...")), 15000)
      );

      const [targetsResult, forcesResult, historyResult] = await Promise.race([
        dataPromise,
        timeout,
      ]);

      // Only update if mounted
      if (mounted) {
        // ... state updates
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };
  loadData();
  return () => { mounted = false; };
}, []);
```

#### ✅ Priority 2: N+1 Query Optimization
**File:** `src/lib/game/services/combat/combat-service.ts` (lines 428-477)

**Changes Made:**
- ✅ Eliminated N+1 query pattern in `getTargets()` function
- ✅ Reduced queries from 26 → 2 (92% reduction for 25 bots)
- ✅ Uses batched `inArray()` query instead of individual `hasActiveTreaty()` calls
- ✅ Independent code review: APPROVED (Outstanding performance rating)

**Code Verified:**
```typescript
// CONFIRMED IN CODE - Lines 444-477
// BEFORE: 1 + N queries (26 total for 25 bots)
// AFTER: 2 queries total

const targetIds = targets.map(t => t.id);
const activeTreaties = await db.query.treaties.findMany({
  where: and(
    eq(treaties.status, "active"),
    or(
      and(eq(treaties.proposerId, empireId), inArray(treaties.recipientId, targetIds)),
      and(eq(treaties.recipientId, empireId), inArray(treaties.proposerId, targetIds))
    )
  ),
});

const treatyEmpireIds = new Set(
  activeTreaties.map(t => t.proposerId === empireId ? t.recipientId : t.proposerId)
);
```

**Performance Impact:**
- Query reduction: 92% (25 bots) to 99% (100 bots)
- Estimated page load: 250ms → 20ms
- Database load: Significantly reduced

---

### ❌ Phase 4: Fix Military Page Issues - NOT STARTED

**Status:** Military page timeout issues NOT FIXED

**Root Cause Identified:**
- `src/app/game/military/page.tsx` has `useEffect` with NO timeout protection (lines 22-24)
- Same pattern as combat page before fix
- Calls `fetchDashboardDataAction()` which could hang

**Files Needing Fixes:**
1. ❌ `src/app/game/military/page.tsx` - Add timeout to useEffect (lines 16-24)
2. ❌ Check if `fetchDashboardDataAction()` has performance issues

**Current Code (NO TIMEOUT):**
```typescript
// VULNERABLE - No timeout protection
useEffect(() => {
  loadData(); // Could hang indefinitely
}, [loadData, refreshTrigger]);
```

---

### 🔄 Phase 5: Optimize Page Load Performance - PARTIALLY COMPLETE

#### ✅ Combat Page Optimization - COMPLETE
- ✅ Added timeout handling
- ✅ Optimized getTargets query (N+1 fix)

#### ❌ Research Page Optimization - NOT STARTED
- ❌ No timeout handling
- ❌ No query optimization analysis

#### ❌ Military Page Optimization - NOT STARTED
- ❌ No timeout handling
- ❌ No query optimization analysis

#### ❌ General Performance - NOT STARTED
- ❌ Test-specific timeout configuration
- ❌ Loading state improvements

---

## Summary: Work Completed vs Remaining

### ✅ Work Completed (2 of 5 phases)

1. **✅ Combat Page Timeout Fix**
   - File: `src/app/game/combat/page.tsx`
   - Status: COMPLETE + REVIEWED + APPROVED

2. **✅ Combat Query Optimization**
   - File: `src/lib/game/services/combat/combat-service.ts`
   - Status: COMPLETE + REVIEWED + APPROVED (92% query reduction)

3. **✅ TypeScript Validation**
   - All changes pass strict TypeScript checks

4. **✅ Independent Code Review**
   - Overall assessment: APPROVED
   - Zero critical issues found

### ❌ Work Remaining (3 phases + verification)

## 🔴 HIGH PRIORITY REMAINING WORK

### 1. Fix Research Page Timeouts (Phase 2)

**Impact:** Blocks 21% of failing tests (3/14 M3 tests)

**Required Changes:**

#### File: `src/components/game/research/ResearchPanel.tsx`
Apply same timeout pattern as combat page:

```typescript
// Lines 24-38 - ADD TIMEOUT
useEffect(() => {
  let mounted = true;

  const loadInfo = async () => {
    try {
      if (mounted) setError(null);

      // ADD: Timeout wrapper (15 seconds)
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Research data timeout after 15 seconds")), 15000)
      );

      const dataPromise = getResearchInfoAction();
      const data = await Promise.race([dataPromise, timeout]);

      if (mounted) setInfo(data);
    } catch (err) {
      if (mounted) {
        console.error("Failed to load research info:", err);
        setError(err instanceof Error ? err.message : "Failed to load research data");
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  loadInfo();
  return () => { mounted = false; };
}, [refreshTrigger]);
```

**Files to Fix:**
- [ ] `src/components/game/research/ResearchPanel.tsx` (add timeout)
- [ ] `src/components/game/research/FundamentalResearchProgress.tsx` (check if needed)

---

### 2. Fix Military Page Timeouts (Phase 4)

**Impact:** Blocks 66% of military tests (2/3 tests)

**Required Changes:**

#### File: `src/app/game/military/page.tsx`
Apply same timeout pattern as combat page:

```typescript
// Lines 16-24 - ADD TIMEOUT
const loadData = useCallback(async () => {
  try {
    // ADD: Timeout wrapper (15 seconds)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Military data timeout after 15 seconds")), 15000)
    );

    const dataPromise = fetchDashboardDataAction();
    const dashboardData = await Promise.race([dataPromise, timeout]);

    setData(dashboardData);
  } catch (err) {
    console.error("Failed to load military data:", err);
    setData(null); // Show "no session" message
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  let mounted = true;

  if (mounted) {
    loadData();
  }

  return () => { mounted = false; };
}, [loadData, refreshTrigger]);
```

**Files to Fix:**
- [ ] `src/app/game/military/page.tsx` (add timeout)

---

### 3. Verify Fixes with E2E Tests

**Required Actions:**
- [ ] Run `npm run test:e2e -- milestone-core.spec.ts`
- [ ] Verify M3 research tests now pass (expect 3 more passing)
- [ ] Verify M4 combat tests now pass (expect 10-15 more passing)
- [ ] Verify military tests now pass (expect 2 more passing)

**Expected Results After All Fixes:**
- M1: 12/12 passing (100%) ✅ Already passing
- M3: 12/14 passing (86%) ⬆️ Up from 43%
- M4: 12/16 passing (75%) ⬆️ Up from 6%

**Total Expected:** ~36/42 passing (86%) vs current 14/40 (35%)

---

### 4. Manual Testing (Phase 1 - Still Outstanding)

**Required Actions:**
- [ ] Run `npm run dev`
- [ ] Navigate to `/game/research` - verify it loads
- [ ] Navigate to `/game/combat` - verify it loads quickly (<2s)
- [ ] Navigate to `/game/military` - verify it loads
- [ ] Check browser console for errors
- [ ] Verify timeout messages appear if backend is slow

---

### 5. Performance Optimization Analysis (Phase 5)

**Optional but Recommended:**
- [ ] Check if `getResearchInfoAction()` has N+1 queries
- [ ] Check if `fetchDashboardDataAction()` has N+1 queries
- [ ] Profile database query performance
- [ ] Consider adding database query logging

---

## Quick Action Checklist

To complete the remediation:

### Immediate (30 minutes):
- [ ] Fix `src/components/game/research/ResearchPanel.tsx` timeout
- [ ] Fix `src/app/game/military/page.tsx` timeout
- [ ] Run TypeScript validation

### Verification (15 minutes):
- [ ] Run E2E tests: `npm run test:e2e -- milestone-core.spec.ts`
- [ ] Verify improvement in pass rate

### Manual Testing (10 minutes):
- [ ] Start dev server
- [ ] Test each page loads
- [ ] Check browser console

### Total Estimated Time: ~60 minutes

---

## Files Modified So Far

### ✅ Completed:
1. `src/app/game/combat/page.tsx` - Timeout + cleanup flag
2. `src/lib/game/services/combat/combat-service.ts` - N+1 query fix

### ⏳ Pending:
3. `src/components/game/research/ResearchPanel.tsx` - Needs timeout
4. `src/app/game/military/page.tsx` - Needs timeout

---

## Risk Assessment

### Low Risk Changes:
- ✅ Combat page timeout (already completed, reviewed, approved)
- ✅ Combat query optimization (already completed, reviewed, approved)
- 🔄 Research panel timeout (same pattern, low risk)
- 🔄 Military page timeout (same pattern, low risk)

### No Breaking Changes:
- All fixes are backwards compatible
- Same APIs, enhanced error handling
- Type-safe implementations

### Testing Coverage:
- ✅ TypeScript validation passes
- ✅ Independent code review approved
- ⏳ E2E test verification pending

---

## Next Immediate Action

**Recommended:** Apply timeout fixes to research and military pages using the proven pattern from combat page, then run E2E tests to verify improvement.

**Command to run after fixes:**
```bash
npm run test:e2e -- milestone-core.spec.ts
```
