### REQ-MKT-002: Dynamic Pricing (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-MKT-002-A through REQ-MKT-002-E for individual price modifiers.

**Overview:** Market prices fluctuate based on supply, demand, market events, and leader penalty. Prices update each turn with decay toward baseline.

**Formula:**
```
Price = Base Price × Supply Modifier × Demand Modifier × Event Modifier × Leader Penalty
```

---

### REQ-MKT-002-A: Base Price and Bounds

**Description:** Base Price defines starting prices for each resource with floor and ceiling bounds. Price Floor is 50% of base, Price Ceiling is 200% of base. These bounds prevent extreme price distortions.

**Rationale:** Establishes price stability and prevents market manipulation through artificial scarcity or oversupply.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Food Base Price | TBD |
| Ore Base Price | TBD |
| Petroleum Base Price | TBD |
| Price Floor | 50% of base price |
| Price Ceiling | 200% of base price |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `BASE_PRICES`, `clampPrice()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Base price, floor/ceiling enforcement

**Status:** Draft

---

### REQ-MKT-002-B: Supply Modifier

**Description:** Supply Modifier adjusts price downward based on net sell volume. Formula: `1.0 - (Net Sell Volume / 100,000) × 0.5`. Market depth of 100,000 units dampens extreme swings.

**Rationale:** High supply (heavy selling) reduces prices. Creates incentive to sell during low supply periods.

**Formula:**
```
Supply Modifier = 1.0 - (Net Sell Volume / 100,000) × 0.5
```

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Market Depth | 100,000 units |
| Supply Impact Factor | 0.5 |
| Direction | Reduces price |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `calculateSupplyModifier()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Supply modifier calculation, extreme volumes

**Status:** Draft

---

### REQ-MKT-002-C: Demand Modifier

**Description:** Demand Modifier adjusts price upward based on net buy volume. Formula: `1.0 + (Net Buy Volume / 100,000) × 0.5`. Market depth of 100,000 units dampens extreme swings.

**Rationale:** High demand (heavy buying) increases prices. Creates incentive to buy during low demand periods.

**Formula:**
```
Demand Modifier = 1.0 + (Net Buy Volume / 100,000) × 0.5
```

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Market Depth | 100,000 units |
| Demand Impact Factor | 0.5 |
| Direction | Increases price |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `calculateDemandModifier()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Demand modifier calculation, extreme volumes

**Status:** Draft

---

### REQ-MKT-002-D: Event Modifier

**Description:** Event Modifier adjusts price based on active market events (Bumper Harvest, Famine, Ore Shortage, Mining Boom, etc.). Each event applies a percentage modifier to specific resources.

**Rationale:** Creates dynamic market conditions driven by galactic events. Rewards players who time trades around event cycles.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Event Types | 8 market events |
| Modifier Range | -15% to +20% |
| Default (No Event) | 1.0 (no change) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1, 3.2

**Code:**
- `src/lib/market/pricing.ts` - `calculateEventModifier()`
- `src/lib/market/events.ts` - Event definitions

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Event modifier application, multiple events

**Status:** Draft

**Cross-Reference:** REQ-MKT-005 (Market Events)

---

### REQ-MKT-002-E: Leader Penalty and Price Decay

**Description:** Leader Penalty applies +10% price increase for empire with highest VP (anti-snowball mechanic). Price Decay applies 5% decay per turn toward baseline to prevent permanent inflation/deflation.

**Rationale:** Leader penalty slows economic advantage of leading empire. Price decay ensures temporary market events don't cause permanent distortions.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Leader Penalty | +10% price increase |
| Decay Rate | 5% per turn toward baseline |
| Baseline Target | Base Price × 1.0 |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 2.2, 3.1

**Code:**
- `src/lib/market/pricing.ts` - `calculateLeaderPenalty()`, `applyPriceDecay()`

**Tests:**
- `src/lib/market/__tests__/pricing.test.ts` - Leader penalty, decay convergence

**Status:** Draft

**Cross-Reference:** REQ-VIC-008 (Anti-Snowball Mechanics)
