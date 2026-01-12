# [System Name]

**Version:** X.X
**Status:** [FOR IMPLEMENTATION | Active | Canonical | Core Game Feature]
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Replaces:** [Previous document names, if applicable]

---

## Document Purpose

[2-3 paragraphs explaining:
- What this document defines
- Who should read it
- What decisions it resolves]

**Design Philosophy:**
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]
- [4-6 core principles]

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Mechanics Overview](#2-mechanics-overview)
3. [Detailed Rules](#3-detailed-rules)
4. [Bot Integration](#4-bot-integration)
5. [UI/UX Design](#5-uiux-design)
6. [Implementation Requirements](#6-implementation-requirements)
7. [Balance Targets](#7-balance-targets)
8. [Migration Plan](#8-migration-plan)
9. [Conclusion](#9-conclusion)

---

## 1. Core Concept

### 1.1 [Primary Subsystem]
[Explain the core idea with examples]

### 1.2 [Key Mechanic]
[Detail the main game loop]

### 1.3 [Player Experience]
[Describe what it feels like to use this system]

---

## 2. Mechanics Overview

[Tables, formulas, core rules]

---

## 3. Detailed Rules

### 3.1 [Specific Rule Category]
[Complete specification with edge cases]

### 3.2 [Another Rule Category]
[Include examples and counterexamples]

---

## 4. Bot Integration

### 4.1 Archetype Behavior
[How each archetype uses this system]

### 4.2 Bot Decision Logic
[Pseudo-code or decision trees]

### 4.3 Bot Messages
[Message templates and examples]

---

## 5. UI/UX Design

### 5.1 UI Mockups
[ASCII art or detailed descriptions]

### 5.2 User Flows
[Step-by-step interaction patterns]

### 5.3 Visual Design Principles
[Color coding, icons, layout]

---

## 6. Implementation Requirements

### 6.1 Database Schema
```sql
-- Complete SQL with CREATE/ALTER statements


---

### Format Principles

#### **1. Hierarchy & Navigation**
- ✅ Use numbered sections (1, 2, 3...) for main sections
- ✅ Use subsection numbering (1.1, 1.2, 1.3...)
- ✅ Include table of contents with anchor links
- ✅ Use horizontal rules (---) to separate major sections

#### **2. Status & Versioning**
- ✅ Always include version number
- ✅ Specify implementation status
- ✅ Include creation and update dates
- ✅ Note what documents this replaces

#### **3. Implementation Focus**
- ✅ Database schemas in SQL format
- ✅ Service architecture in TypeScript
- ✅ UI components with props/interfaces
- ✅ Complete, copy-pasteable code examples

#### **4. Bot Integration**
- ✅ Archetype-specific behavior tables
- ✅ Message template examples (5-10 minimum)
- ✅ Decision logic pseudo-code or trees
- ✅ Special cases for LLM vs scripted bots

#### **5. Balance & Testing**
- ✅ Quantitative balance targets
- ✅ Win rate expectations
- ✅ Testing checklists with checkboxes
- ✅ Monte Carlo simulation targets (if applicable)

#### **6. Narrative Polish**
- ✅ Player experience walkthroughs
- ✅ Dramatic moment examples (victory screens, announcements)
- ✅ UI mockups in ASCII art or detailed prose
- ✅ Flavor text and messaging

#### **7. Resolution Before Merge**
- ⚠️ **NO unresolved DEV NOTEs** - All design questions must be answered
- ⚠️ **NO placeholder sections** - Every section must be complete
- ⚠️ **NO conflicting information** - Cross-reference with other docs

---

### Document Length Guidelines

**By System Complexity:**

| System Type | Target Length | Reasoning |
|-------------|---------------|-----------|
| **Core Combat/Economy** | 800-1000 lines | Affects every game action |
| **Major Feature (Syndicate, Research)** | 600-900 lines | Central to gameplay loop |
| **Bot/AI System** | 700-800 lines | Complex behavior trees |
| **Minor Feature** | 300-500 lines | Isolated mechanic |
| **Expansion Concept** | 200-400 lines | Future feature, less detail OK |

---

