Victory Conditions

### REQ-VIC-001: Conquest Victory

**Description:** Achieved when an empire controls 60% of all territory.

**Rationale:** Classic domination victory.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-002: Economic Victory

**Description:** Achieved when an empire has 1.5x the networth of the second-place empire.

**Rationale:** Builder/trader victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-003: Diplomatic Victory

**Description:** Achieved when a coalition controls 50% of territory.

**Rationale:** Alliance-based victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft

---

### REQ-VIC-004: Research Victory

**Description:** Achieved when an empire completes the entire Tier 3 tech tree.

**Rationale:** Tech rush victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-VIC-005: Military Victory

**Description:** Achieved when an empire has 2x the military power of all other empires combined.

**Rationale:** Military supremacy victory path.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-VIC-006: Survival Victory

**Description:** Achieved by having the highest score when the turn limit is reached.

**Rationale:** Default victory for balanced play.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/core/victory-service.ts`

**Tests:** `src/lib/game/services/__tests__/victory-service.test.ts`

**Status:** Draft
