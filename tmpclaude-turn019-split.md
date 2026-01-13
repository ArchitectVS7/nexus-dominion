### REQ-TURN-019: Victory Check Phase (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-TURN-019-01 through REQ-TURN-019-06 for individual victory checks.

**Overview:** Victory Check Phase (Phase 16) evaluates all 6 victory conditions for all empires. First empire to meet any condition wins. Game locks after victory.

---

### REQ-TURN-019-01: Military Victory Check

**Description:** Military Victory Check evaluates if any empire controls 70% or more of all sectors. Threshold is roughly 70 of 100 sectors. First empire to reach threshold wins instantly.

**Rationale:** Military dominance victory path. Rewards aggressive expansion and sector control strategy.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Military |
| Threshold | 70% of total sectors |
| Typical Value | 70 of 100 sectors |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkMilitaryVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Military condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Military victory trigger at 70%

**Status:** Draft

**Cross-Reference:** REQ-VIC-001 (Conquest Victory)

---

### REQ-TURN-019-02: Economic Victory Check

**Description:** Economic Victory Check evaluates if any empire has 100,000 or more credits in stockpile (not income). First empire to reach threshold wins instantly.

**Rationale:** Economic accumulation victory path. Rewards market trading and resource management.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Economic |
| Threshold | 100,000 credits |
| Measurement | Stockpile (not income) |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkEconomicVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Economic condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Economic victory at 100k credits

**Status:** Draft

**Cross-Reference:** REQ-VIC-002 (Economic Victory)

---

### REQ-TURN-019-03: Diplomatic Victory Check

**Description:** Diplomatic Victory Check evaluates if any empire has alliances with 80% or more of all empires. Threshold is roughly 80 of 100 empires. First empire to reach threshold wins instantly.

**Rationale:** Diplomatic unity victory path. Rewards treaty-making and relationship building.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Diplomatic |
| Threshold | 80% of total empires |
| Typical Value | 80 of 100 empires |
| Treaty Type | Active alliances only |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkDiplomaticVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Diplomatic condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Diplomatic victory at 80% alliances

**Status:** Draft

**Cross-Reference:** REQ-VIC-003 (Diplomatic Victory)

---

### REQ-TURN-019-04: Research Victory Check

**Description:** Research Victory Check evaluates if any empire has completed 100% of the tech tree (all branches complete). First empire to reach threshold wins instantly.

**Rationale:** Scientific advancement victory path. Rewards research investment and tech progression.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Research |
| Threshold | 100% tech tree completion |
| Measurement | All branches completed |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkResearchVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Research condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Research victory with full tech tree

**Status:** Draft

**Cross-Reference:** REQ-VIC-004 (Research Victory)

---

### REQ-TURN-019-05: Covert Victory Check

**Description:** Covert Victory Check evaluates if any empire has eliminated 5 or more empires via assassination operations. Only assassinations count (not combat eliminations). First empire to reach threshold wins instantly.

**Rationale:** Shadow ops victory path. Rewards covert operations mastery and strategic eliminations.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Covert |
| Threshold | 5 empire eliminations |
| Measurement | Assassination operations only |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkCovertVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Covert condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Covert victory after 5 assassinations

**Status:** Draft

**Cross-Reference:** REQ-VIC-005 (Military Victory - may need update for covert-specific victory)

---

### REQ-TURN-019-06: Survival Victory Check

**Description:** Survival Victory Check evaluates if only one empire remains alive. Last empire standing wins instantly. Empires are eliminated when they control zero sectors.

**Rationale:** Elimination victory path. Rewards aggressive conquest and total domination.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Victory Type | Survival |
| Threshold | 1 empire remaining |
| Elimination Criteria | Zero sectors controlled |
| Check Timing | Phase 16 (end of turn) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 3.16

**Code:**
- `src/lib/game/services/phases/victory-check-phase.ts` - `checkSurvivalVictory()`
- `src/lib/game/victory/victory-conditions.ts` - Survival condition logic

**Tests:**
- `src/lib/game/services/__tests__/victory-check-phase.test.ts` - Survival victory with 1 empire left

**Status:** Draft

**Cross-Reference:** REQ-VIC-006 (Survival Victory)
