 Diplomacy System

### REQ-DIP-001: Treaty Types

**Description:** Two treaty types exist:
- NAP (Non-Aggression Pact): Cannot attack each other
- Alliance: Shared intel, coordinated actions

**Rationale:** Enables diplomatic gameplay.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/diplomacy/`

**Tests:** `src/lib/diplomacy/constants.test.ts`

**Status:** Draft

---

### 8.2 Coalitions

### REQ-DIP-002: Coalition System

**Description:** Multiple empires can form coalitions against dominant threats. Coalition victory is achieved when coalition controls 50% of territory.

**Rationale:** Anti-snowball mechanic to prevent runaway victories.

**Source:** `docs/design/GAME-DESIGN.md`

**Code:** `src/lib/game/services/__tests__/coalition-service.test.ts`

**Tests:** `src/lib/game/services/__tests__/coalition-service.test.ts`

**Status:** Draft
