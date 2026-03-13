# Frontend Design System

> **Status:** Active — Design Reference
> **Version:** 3.1
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` § Requirements 11 & 12
> **Supersedes:** `docs/other/Game Systems/FRONTEND-DESIGN.md`

---

## Document Purpose

This document defines the **Frontend Design System** for Nexus Dominion. It provides the visual language, layout architecture, and UX patterns required to deliver the game's core fantasy: a complex digital boardgame viewed through the lens of a futuristic command interface.

**Intended readers:**
- Frontend engineers implementing UI components.
- UX designers crafting new panels or interaction flows.
- Game designers balancing information density and player feedback.

**Design philosophy:**
- **Boardgame First:** The Star Map is the board. It is never put away. Everything else is overlaid on top of it.
- **LCARS Aesthetic:** Deep space backgrounds, glass panels, high-contrast color coding, and pill-shaped interactive elements.
- **Actionable Guidance:** Information must be paired with action. Passive warnings are failures of UX.
- **Anticipation & Payoff:** Strategic games require emotional weight. Actions should preview their effects, and completions should celebrate their outcomes.

---

## Table of Contents

1. [Visual Design System](#1-visual-design-system)
2. [Layout Architecture: The Star Map Hub](#2-layout-architecture-the-star-map-hub)
3. [UX Patterns](#3-ux-patterns)
4. [Component Patterns](#4-component-patterns)

---

## 1. Visual Design System

### 1.1 Color Palette

The color palette uses high-contrast, LCARS-inspired colors against deep navy/black backgrounds.

| Color | Primary Use | Secondary Use | Avoid |
|---|---|---|---|
| **Orange** (Primary) | Action buttons, headers, primary focus | Hover states, borders | Warnings (use Amber) |
| **Purple** (Secondary) | Navigation, secondary panels | Accents | Danger states |
| **Blue** (Friendly) | Resources, research, allied indicators | Positive numbers | Enemy indicators |
| **Green** (Success) | Success messages, combat victories | Growth indicators | Neutral data |
| **Amber** (Warning) | Warnings, low resources | Costs | Success messages |
| **Red** (Danger) | Enemy indicators, critical alerts | Combat losses, deficits | Success messages |
| **Panel Backgrounds** | Deep space navy / translucent glass | | |

### 1.2 Typography

Typography separates narrative/display elements from hard data.

- **Display (Orbitron):** Headers, titles, important values, buttons.
- **Body (Exo 2):** Paragraph text, descriptions, labels.
- **Data (Roboto Mono):** Numbers, statistics, codes, resource counts, coordinates.

### 1.3 Glass Panels & Elements

All UI elements float above the Star Map.
- **Material:** Translucent panels with backdrop blur to maintain spatial awareness of the map behind them.
- **Borders:** Subtle colored borders (usually Orange or Purple) to define edges against the dark background.
- **Buttons:** Pill-shaped (`rounded-full`) for primary actions, heavily relying on hover states (glows, scaling) to indicate interactivity.

---

## 2. Layout Architecture: The Star Map Hub

### 2.1 The Core Constraint

The Star Map is not just a routing destination; it is the **persistent central hub and default view** for all gameplay. It is the board.

1. The Star Map is always loaded and always visible (though often dimmed behind overlays).
2. Players do not navigate "away" from the map to view the Market or Military screens. Instead, the Market or Military screens slide in as **Overlay Panels**.
3. Players can immediately return to the clean map context via a hotkey (ESC or M) or by clicking the dimmed backdrop.

### 2.2 Overlay Panel System

When a player selects a system like Research or Diplomacy, a panel slides in.

- **Positioning:** Panels slide in from the edges (Left, Right, Bottom) or appear in the Center depending on their function.
  - *Example:* The Market trades are wide and often slide up from the Bottom.
  - *Example:* Fleet composition might slide in from the Right.
- **Context Preservation:** The Star Map dims and blurs, but remains visible beneath the panel to maintain the player's spatial grounding.
- **Closing:** Panels must universally close via an explicit `X` button, clicking the backdrop, or pressing the `Escape` key.

---

## 3. UX Patterns

### 3.1 Turn Phase Awareness (The Phase Indicator)

Players must always know what phase of the Cycle they are in, as phases dictate the rules of resolution (see `TURN-MANAGEMENT-SYSTEM.md`).

- **Sticky Header:** A persistent HUD element at the top of the screen displays the current Cycle number, the Phase name (e.g., "Phase 4: Player Actions"), and time remaining (if applicable).
- **Expandable Context:** The indicator can be expanded to reveal exactly what actions are currently legal or available, giving new players immediate direction.

### 3.2 Actionable Guidance System

Passive warnings ("Food is low") create administrative anxiety. The UI must convert warnings into solvable problems.

When an Alert is generated:
1. **Context:** State the problem clearly (e.g., "Food deficit! You will lose population next turn.").
2. **Severity:** Use clear color coding (Amber for warnings, bounding Red pulses for critical threats like incoming attacks).
3. **Action:** Provide 1-3 direct buttons to solve the problem (e.g., "[Buy Agriculture Sectors]", "[Trade on Market]").

Critical alerts (like structural starvation or incoming invasions) should block the "End Turn" button until they are explicitly acknowledged or dismissed.

### 3.3 Anticipation → Action → Payoff

Every interaction with consequences must follow this flow to ensure the game feels strategic, not administrative.

1. **Anticipation (Pre-Action):** The UI must explicitly preview the result *before* the player commits. If building ships, show the exact increase in Combat Power. If launching an attack, show estimated casualties and victory probability.
2. **Action (The Click):** The button press should feel responsive (click down states, immediate UI lock/load states to prevent double-submits).
3. **Payoff (Post-Action):** Major actions require celebration. A successful construction should briefly flash green and explicitly state what was gained. A victory should present a distinct, satisfying layout summarizing the conquered assets.

---

## 4. Component Patterns

### 4.1 Card + Details Sidebar (The "No Scroll" Rule)

A critical UX mandate for Nexus Dominion is minimizing vertical scrolling on management screens. If a player has to scroll down to find the "Confirm" button, the design has failed.

**The Solution: Horizontal Splits**
For complex screens like unit building, market trading, or diplomacy:
- **Left Column (1/3 width):** A scrollable list of selectable items (e.g., a list of resources to buy, or a list of ship types to build).
- **Right Column (2/3 width):** A fixed-height details viewing pane. When an item on the left is selected, the right pane populates with data, sliders, and the primary Action Button.
  - **The Action button is ALWAYS visible at the bottom of the Right Column.**

### 4.2 Data Readouts

Resource bars and data rows should always pair the absolute number with the Delta (the amount changing per turn), color-coded appropriately.

- *Example:* `1,250,000 cr (+15,000)` (Delta is Green)
- *Example:* `450 Food (-100)` (Delta is Red)

Tooltips should be used liberally on icons and abbreviated text to explain the underlying math without cluttering the primary display.

---

## 5. Animation Strategy

Nexus Dominion uses a hybrid animation approach:

1. **CSS Transitions:** Used for fast micro-interactions. Hover states, button scales, color shifts, and simple opacity fades must be near-instantaneous (100-200ms) to ensure the UI feels highly responsive.
2. **Timeline Animations (e.g., GSAP/Framer):** Used for narrative sequences. Turn transitions, combat resolution phases, and the rendering of the Star Map layout itself. These tell a story and can take longer (300ms - 2 seconds).

*Accessibility Note:* The UI must respect the OS-level `prefers-reduced-motion` flag, falling back to instant state changes when requested.
