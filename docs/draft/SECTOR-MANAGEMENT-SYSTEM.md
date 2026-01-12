 Sector Management

### REQ-SEC-001: Starting Sectors

**Description:** Each empire starts with 5 sectors.

**Rationale:** Provides meaningful starting position without overwhelming new players.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/constants.ts:STARTING_SECTORS`

**Tests:** TBD

**Status:** Draft

---

### REQ-SEC-002: Sector Cost Scaling

**Description:** The cost to acquire new sectors increases based on current sector count using a scaling formula.

**Rationale:** Prevents runaway expansion, creates strategic choices.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/formulas/sector-costs.ts`

**Tests:** `src/lib/formulas/sector-costs.test.ts`

**Status:** Draft

---

### REQ-SEC-003: Eight Sector Types

**Description:** 8 sector types exist: Commerce, Food, Ore, Petroleum, Research, Industrial, Military, Residential.

**Rationale:** Specialization creates strategic depth.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:sectorTypeEnum`

**Tests:** TBD

**Status:** Draft
