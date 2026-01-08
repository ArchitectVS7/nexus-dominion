# Database Schema Documentation

This document provides Entity-Relationship Diagrams (ERD) and table descriptions for the Nexus Dominion database schema.

**Schema Source:** `src/lib/db/schema.ts`
**Database:** PostgreSQL (Neon)
**ORM:** Drizzle

---

## Schema Overview

The database is organized into 11 domains:

| Domain | Tables | Purpose |
|--------|--------|---------|
| Core Game | 5 | Game lifecycle, saves, configuration |
| Empires | 2 | Player/bot empires and territories |
| Military & Combat | 4 | Units, attacks, battle logs |
| Economy | 2 | Market prices and trade orders |
| Research | 2 | Tech progression and branch allocation |
| Diplomacy | 3 | Treaties, reputation, messages |
| Bot AI | 3 | Bot memories, emotions, tells |
| Events | 3 | Galactic events and coalitions |
| LLM Integration | 2 | LLM usage tracking and caching |
| Geography | 3 | Galaxy regions, connections, influence |
| Crafting & Syndicate | 5 | Advanced resource crafting, contracts |

**Total Tables:** 34

---

## Core Game Domain

```mermaid
erDiagram
    games ||--o{ empires : has
    games ||--o{ gameSessions : tracks
    games ||--o{ gameSaves : snapshots
    games ||--o{ gameConfigs : configures
    games ||--o{ performanceLogs : logs

    games {
        uuid id PK
        varchar name
        game_status status
        game_mode gameMode
        integer turnLimit
        integer currentTurn
        difficulty difficulty
        integer botCount
        integer protectionTurns
        timestamp createdAt
    }

    gameSessions {
        uuid id PK
        uuid gameId FK
        integer sessionNumber
        integer startTurn
        integer endTurn
        json notableEvents
    }

    gameSaves {
        uuid id PK
        uuid gameId FK
        integer turn
        json snapshot
    }

    gameConfigs {
        uuid id PK
        uuid gameId FK
        game_config_type configType
        json overrides
    }

    performanceLogs {
        uuid id PK
        uuid gameId FK
        varchar operation
        integer durationMs
        json metadata
    }
```

### Table: `games`

Central game state table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | varchar(255) | Game name |
| `status` | enum | setup, active, paused, completed, abandoned |
| `gameMode` | enum | oneshot (quick) or campaign (multi-session) |
| `turnLimit` | integer | Maximum turns (50-500) |
| `currentTurn` | integer | Current game turn |
| `difficulty` | enum | easy, normal, hard, nightmare |
| `botCount` | integer | Number of AI opponents (10-100) |
| `protectionTurns` | integer | Grace period before attacks allowed |

---

## Empires Domain

```mermaid
erDiagram
    games ||--o{ empires : contains
    empires ||--o{ sectors : owns

    empires {
        uuid id PK
        uuid gameId FK
        varchar name
        empire_type type
        bot_tier botTier
        bot_archetype botArchetype
        bigint credits
        bigint food
        bigint ore
        bigint petroleum
        bigint population
        civil_status civilStatus
        integer soldiers
        integer fighters
        integer stations
        integer lightCruisers
        integer heavyCruisers
        integer carriers
        bigint networth
        integer sectorCount
        boolean isEliminated
    }

    sectors {
        uuid id PK
        uuid empireId FK
        uuid gameId FK
        sector_type type
        varchar name
        decimal productionRate
        integer purchasePrice
    }
```

### Table: `empires`

Player and bot empire data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `gameId` | uuid | Foreign key to games |
| `name` | varchar(255) | Empire name |
| `type` | enum | player or bot |
| `botTier` | enum | tier1_llm, tier1_elite_scripted, tier2_strategic, tier3_simple, tier4_random |
| `botArchetype` | enum | warlord, diplomat, merchant, schemer, turtle, blitzkrieg, tech_rush, opportunist |
| `credits/food/ore/petroleum` | bigint | Base resources |
| `population` | bigint | Current population |
| `civilStatus` | enum | ecstatic → content → neutral → unhappy → revolting |
| `soldiers/fighters/etc` | integer | Military unit counts |
| `networth` | bigint | Calculated empire value |
| `isEliminated` | boolean | Whether empire is defeated |

### Table: `sectors`

Territory owned by empires.

| Column | Type | Description |
|--------|------|-------------|
| `type` | enum | food, ore, petroleum, tourism, urban, education, government, research, supply, anti_pollution, industrial |
| `productionRate` | decimal | Resource output per turn |
| `purchasePrice` | integer | Cost to acquire |

---

## Military & Combat Domain

```mermaid
erDiagram
    empires ||--o{ buildQueue : orders
    empires ||--o{ attacks : initiates
    empires ||--o{ unitUpgrades : researches
    attacks ||--o{ combatLogs : records

    buildQueue {
        uuid id PK
        uuid empireId FK
        unit_type unitType
        integer quantity
        integer turnsRemaining
        integer totalCost
        integer queuePosition
    }

    attacks {
        uuid id PK
        uuid gameId FK
        uuid attackerId FK
        uuid defenderId FK
        integer turn
        attack_type attackType
        combat_outcome outcome
        integer attackerSoldiers
        integer defenderSoldiers
        json attackerCasualties
        json defenderCasualties
        boolean sectorCaptured
    }

    combatLogs {
        uuid id PK
        uuid attackId FK
        combat_phase phase
        integer phaseNumber
        json attackerUnits
        json defenderUnits
        varchar phaseWinner
        json phaseCasualties
    }

    unitUpgrades {
        uuid id PK
        uuid empireId FK
        unit_type unitType
        integer upgradeLevel
        bigint totalInvestment
    }
```

### Table: `attacks`

Combat encounter records.

| Column | Type | Description |
|--------|------|-------------|
| `attackerId` | uuid | Attacking empire |
| `defenderId` | uuid | Defending empire |
| `attackType` | enum | invasion or guerilla |
| `outcome` | enum | attacker_victory, defender_victory, retreat, stalemate |
| `attackerCasualties` | json | `{ soldiers: N, fighters: N, ... }` |
| `sectorCaptured` | boolean | Whether territory changed hands |

---

## Economy Domain

```mermaid
erDiagram
    games ||--o{ marketPrices : tracks
    empires ||--o{ marketOrders : places

    marketPrices {
        uuid id PK
        uuid gameId FK
        resource_type resourceType
        integer basePrice
        decimal currentPrice
        decimal priceMultiplier
        bigint totalSupply
        bigint totalDemand
    }

    marketOrders {
        uuid id PK
        uuid empireId FK
        market_order_type orderType
        resource_type resourceType
        integer quantity
        decimal pricePerUnit
        market_order_status status
    }
```

### Market Price Range

Per PRD 4, prices fluctuate between 0.4x and 1.6x base price based on supply/demand.

---

## Research Domain

```mermaid
erDiagram
    empires ||--o{ researchProgress : tracks
    empires ||--o{ researchBranchAllocations : allocates

    researchProgress {
        uuid id PK
        uuid empireId FK
        integer researchLevel
        bigint currentInvestment
        bigint requiredInvestment
    }

    researchBranchAllocations {
        uuid id PK
        uuid empireId FK
        integer militaryPercent
        integer defensePercent
        integer propulsionPercent
        integer stealthPercent
        integer economyPercent
        integer biotechPercent
        bigint militaryInvestment
    }
```

### Research Branches

Six branches with percentage allocation (must sum to 100):
- Military, Defense, Propulsion, Stealth, Economy, Biotech

---

## Diplomacy Domain

```mermaid
erDiagram
    empires ||--o{ treaties : proposes
    empires ||--o{ reputationLog : earns
    empires ||--o{ messages : sends

    treaties {
        uuid id PK
        uuid proposerId FK
        uuid recipientId FK
        treaty_type treatyType
        treaty_status status
        integer proposedAtTurn
        integer activatedAtTurn
        uuid brokenById FK
    }

    reputationLog {
        uuid id PK
        uuid empireId FK
        uuid affectedEmpireId FK
        reputation_event_type eventType
        integer reputationChange
        varchar description
    }

    messages {
        uuid id PK
        uuid senderId FK
        uuid recipientId FK
        message_channel channel
        message_trigger trigger
        varchar content
        boolean isRead
    }
```

### Treaty Types

- **NAP (Non-Aggression Pact):** No attacks for duration
- **Alliance:** Shared defense, trade bonuses

### Message Triggers

greeting, battle_taunt, victory_gloat, defeat, trade_offer, alliance_proposal, betrayal, covert_detected, tribute_demand, threat_warning, retreat, eliminated, endgame, broadcast_shout, casual_message

---

## Bot AI Domain

```mermaid
erDiagram
    empires ||--o{ botMemories : remembers
    empires ||--o{ botEmotionalStates : feels
    empires ||--o{ botTells : emits

    botMemories {
        uuid id PK
        uuid empireId FK
        uuid targetEmpireId FK
        memory_type memoryType
        integer weight
        decimal decayResistance
        boolean isPermanentScar
        json context
    }

    botEmotionalStates {
        uuid id PK
        uuid empireId FK
        emotional_state state
        decimal intensity
        integer recentVictories
        integer recentDefeats
        integer recentBetrayals
    }

    botTells {
        uuid id PK
        uuid empireId FK
        uuid targetEmpireId FK
        tell_type tellType
        boolean isBluff
        tell_type trueIntention
        decimal confidence
        integer expiresAtTurn
    }
```

### Emotional States

confident, arrogant, desperate, vengeful, fearful, triumphant, neutral

### Bot Tell Types

military_buildup, fleet_movement, target_fixation, diplomatic_overture, economic_preparation, silence, aggression_spike, treaty_interest

---

## Events Domain

```mermaid
erDiagram
    games ||--o{ galacticEvents : triggers
    games ||--o{ coalitions : forms
    coalitions ||--o{ coalitionMembers : includes
    empires ||--o{ civilStatusHistory : experiences

    galacticEvents {
        uuid id PK
        uuid gameId FK
        galactic_event_type eventType
        galactic_event_subtype eventSubtype
        varchar title
        varchar description
        integer severity
        json effects
        integer durationTurns
        boolean isActive
    }

    coalitions {
        uuid id PK
        uuid gameId FK
        varchar name
        uuid leaderId FK
        coalition_status status
        integer memberCount
        bigint totalNetworth
    }

    coalitionMembers {
        uuid id PK
        uuid coalitionId FK
        uuid empireId FK
        boolean isActive
    }

    civilStatusHistory {
        uuid id PK
        uuid empireId FK
        integer turn
        civil_status oldStatus
        civil_status newStatus
        decimal incomeMultiplier
    }
```

### Galactic Event Types

- **Economic:** market_crash, resource_boom, trade_embargo, economic_miracle
- **Political:** coup_attempt, assassination, rebellion, political_scandal
- **Military:** pirate_armada, arms_race, mercenary_influx, military_parade
- **Narrative:** ancient_discovery, prophecy_revealed, mysterious_signal, cultural_renaissance

---

## LLM Integration Domain

```mermaid
erDiagram
    games ||--o{ llmUsageLogs : tracks
    empires ||--o{ llmDecisionCache : caches

    llmUsageLogs {
        uuid id PK
        uuid gameId FK
        uuid empireId FK
        llm_provider provider
        varchar model
        llm_call_status status
        varchar purpose
        integer promptTokens
        integer completionTokens
        decimal costUsd
        integer latencyMs
        boolean didFallback
    }

    llmDecisionCache {
        uuid id PK
        uuid empireId FK
        integer forTurn
        json decisionJson
        varchar reasoning
        varchar message
        llm_provider provider
        integer tokensUsed
    }
```

### LLM Providers

groq, together, openai, anthropic

---

## Geography Domain

```mermaid
erDiagram
    games ||--o{ galaxyRegions : contains
    galaxyRegions ||--o{ regionConnections : connects
    empires ||--o{ empireInfluence : projects

    galaxyRegions {
        uuid id PK
        uuid gameId FK
        varchar name
        region_type regionType
        decimal positionX
        decimal positionY
        decimal wealthModifier
        integer dangerLevel
        integer maxEmpires
    }

    regionConnections {
        uuid id PK
        uuid fromRegionId FK
        uuid toRegionId FK
        connection_type connectionType
        decimal forceMultiplier
        wormhole_status wormholeStatus
        uuid discoveredByEmpireId FK
    }

    empireInfluence {
        uuid id PK
        uuid empireId FK
        uuid homeRegionId FK
        uuid primaryRegionId FK
        integer baseInfluenceRadius
        json directNeighborIds
        json knownWormholeIds
    }
```

### Region Types

core (1.5x wealth), inner (1.2x), outer (1.0x), rim (0.5x), void (0.3x, dangerous)

### Connection Types

adjacent (1.0x), trade_route (1.0x + bonus), wormhole (shortcut), hazardous (1.5x), contested (1.25x + events)

---

## Crafting & Syndicate Domain

```mermaid
erDiagram
    empires ||--o{ resourceInventory : stores
    empires ||--o{ craftingQueue : crafts
    empires ||--o{ syndicateTrust : builds
    empires ||--o{ syndicateContracts : accepts
    syndicateContracts ||--o{ pirateMissions : triggers

    resourceInventory {
        uuid id PK
        uuid empireId FK
        crafted_resource_type resourceType
        resource_tier tier
        integer quantity
    }

    craftingQueue {
        uuid id PK
        uuid empireId FK
        crafted_resource_type resourceType
        integer quantity
        crafting_status status
        json componentsReserved
        integer completionTurn
    }

    syndicateTrust {
        uuid id PK
        uuid empireId FK
        integer trustPoints
        syndicate_trust_level trustLevel
        integer contractsCompleted
        boolean isHostile
    }

    syndicateContracts {
        uuid id PK
        uuid empireId FK
        uuid targetEmpireId FK
        contract_type contractType
        contract_status status
        integer creditReward
        integer trustReward
        json completionCriteria
    }

    pirateMissions {
        uuid id PK
        uuid contractId FK
        uuid targetEmpireId FK
        pirate_mission_status status
        integer executionTurn
        json results
    }
```

### Resource Tiers

- **Tier 0:** credits, food, ore, petroleum (base)
- **Tier 1:** refined_metals, fuel_cells, polymers (refined)
- **Tier 2:** electronics, armor_plating, propulsion_units (manufactured)
- **Tier 3:** reactor_cores, shield_generators, nuclear_warheads (advanced)

### Syndicate Trust Levels

unknown → associate → runner → soldier → captain → lieutenant → underboss → consigliere → syndicate_lord

---

## Enum Reference

### Game Enums

| Enum | Values |
|------|--------|
| `game_status` | setup, active, paused, completed, abandoned |
| `game_mode` | oneshot, campaign |
| `difficulty` | easy, normal, hard, nightmare |
| `victory_type` | conquest, economic, diplomatic, research, military, survival |

### Empire Enums

| Enum | Values |
|------|--------|
| `empire_type` | player, bot |
| `bot_tier` | tier1_llm, tier1_elite_scripted, tier2_strategic, tier3_simple, tier4_random |
| `bot_archetype` | warlord, diplomat, merchant, schemer, turtle, blitzkrieg, tech_rush, opportunist |
| `civil_status` | ecstatic, happy, content, neutral, unhappy, angry, rioting, revolting |

### Combat Enums

| Enum | Values |
|------|--------|
| `unit_type` | soldiers, fighters, light_cruisers, heavy_cruisers, carriers, stations, covert_agents |
| `attack_type` | invasion, guerilla |
| `combat_outcome` | attacker_victory, defender_victory, retreat, stalemate |
| `combat_phase` | space, orbital, ground |

### Sector Enums

| Enum | Values |
|------|--------|
| `sector_type` | food, ore, petroleum, tourism, urban, education, government, research, supply, anti_pollution, industrial |

---

## Indexes

All tables include strategic indexes for common query patterns:

- **Game-scoped queries:** `*_game_idx` on all child tables
- **Empire-scoped queries:** `*_empire_idx` on owned resources
- **Turn-based queries:** `*_turn_idx` for historical lookups
- **Status filters:** `*_status_idx` for active/pending items
- **Type filters:** `*_type_idx` for category filtering

---

## Migration Notes

- All tables use UUID primary keys with `defaultRandom()`
- Foreign keys use `CASCADE` delete for child records
- Timestamps use `defaultNow()` for creation tracking
- JSON columns use `json()` for flexible nested data
- Decimal precision varies by use case (prices: 12,2; percentages: 5,2)

---

*Generated: 2026-01-08*
*Schema version: Aligned with src/lib/db/schema.ts*
