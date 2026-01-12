 Progressive Systems

### 11.1 Progressive Unlocks

### REQ-PROG-001: Feature Unlocks

**Description:** Certain features unlock at specific turn thresholds:
- Turn 20: Diplomacy fully available
- Turn 50: Black Market access
- Turn 100: Nuclear weapons

**Rationale:** Introduces complexity gradually.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/constants/unlocks.ts`

**Tests:** TBD

**Status:** Draft

---

### 11.3 Checkpoints

### REQ-PROG-002: Game Checkpoints

**Description:** Game state can be saved at checkpoints for campaign continuation.

**Rationale:** Supports long campaign games across sessions.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/events/checkpoint-service.ts`

**Tests:** TBD

**Status:** Draft

---

### 11.4 Events

### REQ-PROG-003: Galactic Events

**Description:** Random galactic events occur that affect all empires.

**Rationale:** Creates shared challenges and narrative moments.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/events/event-service.ts`

**Tests:** TBD

**Status:** Draft
