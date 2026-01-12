Resource System

### REQ-RES-001: Five Resource Types

**Description:** The game has 5 resource types:
1. Credits - Currency for purchases
2. Food - Sustains population and soldiers
3. Ore - Military maintenance
4. Petroleum - Fuel for military and wormholes
5. Research Points - Technology advancement

**Rationale:** Multiple resources create economic strategy.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/db/schema.ts:empires`

**Tests:** TBD

**Status:** Draft

---

### REQ-RES-002: Sector Production

**Description:** Each sector type produces specific resources per turn with defined base rates.

**Production Rates:**
```
Food sector:       160 food/turn
Ore sector:        112 ore/turn
Petroleum sector:  92 petroleum/turn
Commerce sector:   8,000 credits/turn
Urban sector:      1,000 credits/turn + population capacity bonus
Education sector:  +1 civil status level/turn (caps at Ecstatic)
Government sector: 300 spy points/turn
Research sector:   100 research points/turn
```

**Formula:**
```
Final Production = Base Production × Civil Status Multiplier
```

**Rationale:** Creates sector specialization and expansion strategy. Fixed production rates enable predictable planning.

**Source:** `docs/design/GAME-DESIGN.md` Section "Sector System"

**Formulas:** See `docs/PRD-FORMULAS-ADDENDUM.md` Section 2.1

**Code:** `src/lib/game/services/resource-engine.ts`

**Tests:** `src/lib/game/services/__tests__/resource-engine.test.ts`

**Status:** Draft

---

### REQ-RES-003: Civil Status Income Multiplier

**Description:** Civil status affects all income with these multipliers:
- Ecstatic: 4.0x (was disputed, now 2.5x per rebalance)
- Happy: 2.0x (was disputed, now 1.5x per rebalance)
- Content: 1.0x
- Unhappy: 0.75x
- Angry: 0.5x
- Rioting: 0.25x

**Rationale:** Creates meaningful consequences for empire management.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/civil-status.ts`

**Tests:** `src/lib/game/services/__tests__/civil-status.test.ts`

**Status:** Draft (values need verification against code)

---
