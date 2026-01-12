Military & Units

### REQ-MIL-001: Six Unit Types

**Description:** 6 military unit types exist:
1. Soldiers - Ground troops
2. Fighters - Basic space combat
3. Stations - Defensive installations
4. Light Cruisers - Versatile warships
5. Heavy Cruisers - Heavy firepower
6. Carriers - Fleet support

**Rationale:** Unit variety creates strategic depth.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:unitTypeEnum`

**Tests:** `src/lib/game/unit-config.test.ts`

**Status:** Draft

---

### REQ-MIL-002: Build Queue

**Description:** Units are constructed via a build queue with per-turn completion.

**Rationale:** Prevents instant army creation, requires planning.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/build-queue-service.ts`

**Tests:** `src/lib/game/services/__tests__/build-queue-service.test.ts`

**Status:** Draft
