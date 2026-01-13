# Nexus Dominion: Frontend Design System

**Version:** 3.0
**Date:** 2026-01-12
**Status:** Consolidated Design Document

**Consolidates:** `FRONTEND-GUIDE.md`, `UI_DESIGN.md`, `UX-DESIGN.md`, `UX-ROADMAP.md`

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Design System](#2-visual-design-system)
3. [Navigation & Layout Architecture](#3-navigation--layout-architecture)
4. [Component Library](#4-component-library)
5. [Screen Designs](#5-screen-designs)
6. [UX Patterns](#6-ux-patterns)
7. [Animation & Motion](#7-animation--motion)
8. [Data Visualization](#8-data-visualization)
9. [Accessibility](#9-accessibility)
10. [Testing Conventions](#10-testing-conventions)
11. [Implementation Guide](#11-implementation-guide)

---

## 1. Design Philosophy

### 1.1 Core Design Vision: Boardgame + LCARS

Nexus Dominion is a **digital boardgame** with a **Star Trek LCARS-inspired** aesthetic. Every design decision must support these two pillars:

**Boardgame Mental Model:**
- The **star map is the board** - always the central reference point
- Panels are like **picking up cards** from the board - you examine them, then return to the board
- **Spatial awareness** is paramount - players should always know where empires are located
- Actions feel **meaningful and consequential** - not administrative busywork

**LCARS Aesthetic:**
- **Glass panels** over deep space backgrounds
- **Curved corners** and pill-shaped buttons
- **Color-coded information** for instant recognition
- **Ambient atmosphere** with subtle animations
- **Information density** balanced with clarity

### 1.2 The Central Constraint: Star Map as Hub

**Core Architectural Decision:**
The star map is NOT just another page. It is the **default view, central hub, and persistent reference point** for all gameplay.

**This means:**
1. `/game/starmap` is the primary destination
2. All other screens are **overlays** that slide over a dimmed star map
3. Players can **return to the map instantly** from any screen
4. The map is always visible (dimmed) to maintain spatial context

**Why This Matters:**
- In physical boardgames, the board is always visible - you never put it away
- Digital implementations often bury the map in navigation menus
- **Breaking this pattern breaks the boardgame feel**
- Players lose spatial awareness and strategic context

### 1.3 Key UX Problems Solved

Based on analysis of the original design (see archived UX-ROADMAP.md), the following critical issues have been addressed:

**Problem 1: Turn Phase Invisibility**
❌ Players don't know which of 6 phases they're in
✅ **Solution:** Collapsible Phase Indicator (§6.1)

**Problem 2: Passive Warnings**
❌ Players see "low food" but don't know how to fix it
✅ **Solution:** Actionable Guidance System (§6.2)

**Problem 3: Buried Star Map**
❌ Map is just another page in navigation
✅ **Solution:** Star Map as Hub architecture (§3)

**Problem 4: Scroll-Heavy Interfaces**
❌ Action buttons hidden below fold
✅ **Solution:** Card + Details Sidebar pattern (§4.3)

**Problem 5: Administrative Feel**
❌ Game feels like a spreadsheet, not a conquest
✅ **Solution:** Strategic Visual Language (§6.3)

---

## 2. Visual Design System

### 2.1 Color Palette

**LCARS Brand Colors:**

```typescript
// tailwind.config.ts
colors: {
  lcars: {
    orange: '#FF9900',   // Primary interactive elements, headers
    purple: '#CC99FF',   // Secondary panels, navigation
    blue: '#66CCFF',     // Friendly indicators, alliance
    green: '#99FFCC',    // Success, positive events
    amber: '#FFCC66',    // Warnings, attention
    red: '#FF6666',      // Danger, enemy indicators
    peach: '#FFCC99',    // Data readouts, neutral info
  },
  background: {
    space: '#0a0e27',    // Deep space navy
    panel: '#1a1f3a',    // Panel background
    elevated: '#2a3150', // Hover/elevated state
  },
  primary: {
    DEFAULT: '#FF9900',
    hover: '#FFB133',
    active: '#E68A00',
  },
  secondary: {
    DEFAULT: '#CC99FF',
    hover: '#D9B3FF',
    active: '#B380E6',
  },
}
```

**Color Usage Guidelines:**

| Color | Primary Use | Secondary Use | Avoid |
|-------|-------------|---------------|-------|
| **Orange** | Action buttons, headers, primary focus | Hover states | Warnings (use amber) |
| **Purple** | Secondary actions, navigation | Panel accents | Danger states |
| **Blue** | Resources, research, allies | Positive indicators | Enemy indicators |
| **Green** | Success messages, gains | Growth indicators | Neutral info |
| **Amber** | Warnings, attention needed | Cost indicators | Success messages |
| **Red** | Danger, enemies, critical alerts | Losses, deficits | Success messages |

### 2.2 Typography

**Font Families:**

```css
font-family: 'Orbitron', 'Exo 2', 'Roboto Mono', monospace;
```

- **Display (Orbitron):** Headers, titles, important values, buttons
- **Body (Exo 2):** Paragraph text, descriptions, labels
- **Data (Roboto Mono):** Numbers, statistics, codes

**Font Scale:**

| Element | Size | Weight | Font | Use Case |
|---------|------|--------|------|----------|
| Page Title | 2rem (32px) | Bold (700) | Display | Screen headers |
| Section Header | 1.5rem (24px) | Semi-bold (600) | Display | Panel titles |
| Panel Title | 1.25rem (20px) | Medium (500) | Display | Card headers |
| Body Text | 1rem (16px) | Normal (400) | Body | Descriptions |
| Data Values | 0.875rem (14px) | Medium (500) | Mono | Statistics |
| Labels | 0.75rem (12px) | Normal (400) | Body | Input labels |

**Tailwind Classes:**

```tsx
// Page title
<h1 className="text-2xl font-bold font-display text-lcars-orange">
  Empire Dashboard
</h1>

// Body text
<p className="text-base font-body text-slate-300">
  Manage your galactic empire's resources and military forces.
</p>

// Data values
<span className="text-sm font-mono text-lcars-blue">
  1,234,567 cr
</span>
```

### 2.3 Panel Design System

**Base Glass Panel Component:**

```tsx
// GlassPanel.tsx
interface GlassPanelProps {
  title?: string;
  accentColor?: 'orange' | 'purple' | 'blue' | 'green' | 'red';
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function GlassPanel({
  title,
  accentColor = 'orange',
  children,
  actions
}: GlassPanelProps) {
  return (
    <div className="bg-background-panel/60 backdrop-blur-lcars rounded-lcars border border-lcars-orange/30">
      {title && (
        <div className={`flex items-center justify-between px-4 py-3 border-b border-lcars-${accentColor}/30`}>
          <div className="flex items-center gap-2">
            <div className={`w-1 h-6 bg-lcars-${accentColor} rounded-full`} />
            <h2 className="text-lg font-display uppercase tracking-wider text-white">
              {title}
            </h2>
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
```

**Visual Properties:**

```css
.glass-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 153, 0, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### 2.4 Button System

**Primary Button (LCARS Pill):**

```tsx
<button className="px-8 py-3 bg-lcars-orange hover:bg-primary-hover active:bg-primary-active text-black font-display font-semibold uppercase tracking-wide rounded-lcars-pill transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,153,0,0.5)]">
  Launch Attack
</button>
```

**Button Variants:**

```tsx
// Secondary Button (Outlined)
<button className="px-6 py-2 bg-transparent border-2 border-lcars-orange text-lcars-orange hover:bg-lcars-orange/10 rounded-lcars-pill transition-colors">
  Cancel
</button>

// Danger Button
<button className="px-6 py-2 bg-lcars-red hover:bg-red-500 text-white font-semibold rounded-lcars-pill transition-colors">
  Delete
</button>

// Ghost Button
<button className="px-4 py-2 text-lcars-blue hover:text-blue-300 hover:bg-lcars-blue/10 rounded transition-colors">
  Learn More
</button>

// Disabled State
<button disabled className="px-6 py-2 bg-slate-700 text-slate-500 rounded-lcars-pill cursor-not-allowed opacity-50">
  Not Available
</button>
```

### 2.5 Space Background

**Implementation:**

```tsx
// SpaceBackground.tsx
export function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-space via-slate-950 to-background-space" />

      {/* Star field */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent)
          `,
          backgroundSize: '200px 200px, 300px 300px, 150px 150px, 250px 250px',
          backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px',
        }}
      />

      {/* Nebula glow (optional) */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
    </div>
  );
}
```

---

## 3. Navigation & Layout Architecture

### 3.1 Navigation Philosophy: Star Map as Hub

**THE CORE ARCHITECTURAL DECISION:**

The star map is the game. Everything else is an overlay.

```
┌──────────────────────────────────────────────────────────────┐
│                    [Logo]  Turn 42/200    [User]             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                                                              │
│                   STAR MAP (Always Visible)                  │
│                                                              │
│                 • Click empire → Detail overlay              │
│                 • Press ESC → Close all overlays             │
│                 • Press M → Return to full map               │
│                                                              │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Credits: 1.2M  |  Food: +500  |  Ore: +200  |  [Actions]   │
└──────────────────────────────────────────────────────────────┘

     [Overlay panels slide in from edges as needed]
```

### 3.2 Route Architecture

**Primary Routes:**

```typescript
/game/starmap          // DEFAULT - Full-screen star map
/game/starmap?panel=military      // Star map with military overlay
/game/starmap?panel=market        // Star map with market overlay
/game/starmap?panel=research      // Star map with research overlay
/game/starmap?panel=diplomacy     // Star map with diplomacy overlay
/game/starmap?empire=<id>         // Star map with empire detail overlay
```

**Redirect Logic:**

```typescript
// src/app/game/page.tsx
export default function GamePage() {
  redirect('/game/starmap');
}

// All old routes redirect to starmap with panel query
// /game/military → /game/starmap?panel=military
// /game/market → /game/starmap?panel=market
```

### 3.3 Overlay Panel System

**Core Component:**

```tsx
// OverlayPanel.tsx
interface OverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
  position: 'bottom' | 'right' | 'center' | 'left';
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  title: string;
  children: React.ReactNode;
}

export function OverlayPanel({
  isOpen,
  onClose,
  position,
  size = 'large',
  title,
  children
}: OverlayPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - dims star map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={getSlideAnimation(position, 'initial')}
            animate={getSlideAnimation(position, 'animate')}
            exit={getSlideAnimation(position, 'exit')}
            className={cn(
              "fixed z-50 bg-background-panel border border-lcars-orange/50",
              getPositionStyles(position, size)
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-lcars-orange/30">
              <h2 className="text-xl font-display text-lcars-orange">
                {title}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Position Styles:**

```typescript
function getPositionStyles(position: string, size: string) {
  const sizeMap = {
    small: 'w-96',
    medium: 'w-1/3',
    large: 'w-1/2',
    fullscreen: 'w-full h-full'
  };

  const positionMap = {
    right: `top-0 right-0 h-full ${sizeMap[size]}`,
    left: `top-0 left-0 h-full ${sizeMap[size]}`,
    bottom: `bottom-0 left-0 right-0 h-2/3`,
    center: `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${sizeMap[size]} max-h-[90vh]`,
  };

  return positionMap[position];
}
```

### 3.4 Dashboard View (Alternative to Star Map)

Some players may prefer a traditional dashboard. This is available but **not the default**.

**6-Panel Actionable Grid:**

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] TURN 42/200 | PHASE 6/6: PLAYER ACTIONS    [Map] [▼] │
├──────────────────┬──────────────────┬────────────────────────┤
│ ⚠️ Critical      │ 📊 Empire Stats  │ ⚔️ Military Status     │
│ Alerts           │                  │                        │
│                  │ • Networth: #12  │ • Active wars: 2       │
│ • Food: -500/turn│ • Sectors: 8     │   [View Battles]       │
│   [Buy Food]     │ • Pop: 1.5M      │ • Fleet: 45.2K         │
│   [Build Farms]  │   [Details]      │   [Manage]             │
├──────────────────┼──────────────────┼────────────────────────┤
│ 🗺️ Territory     │ 📨 Messages (3)  │ 🎯 Opportunities       │
│ [Mini Star Map]  │                  │                        │
│                  │ • Vexar: NAP?    │ • Weak neighbor        │
│ Click to expand  │   [Reply]        │   [Attack]             │
│                  │ • Trade offer    │ • Alliance offer       │
│                  │   [View]         │   [Review]             │
└──────────────────┴──────────────────┴────────────────────────┘
```

**Key Panels:**

1. **Critical Alerts** - Actionable warnings with solution buttons
2. **Empire Stats** - High-level overview with drill-down links
3. **Military Status** - Current conflicts and fleet power
4. **Territory** - Mini star map preview (clicks open full map)
5. **Messages** - Latest communications with quick actions
6. **Opportunities** - Strategic suggestions based on game state

**Access:**
- Available at `/game/dashboard`
- Floating "View Dashboard" button on star map
- NOT the default view

---

## 4. Component Library

### 4.1 Card Component

**Base Card:**

```tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  accentColor?: 'orange' | 'purple' | 'blue' | 'green' | 'red';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  accentColor = 'orange',
  interactive = false,
  selected = false,
  onClick,
  children,
  actions
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-background-panel rounded-lg border transition-all",
        interactive && "cursor-pointer hover:scale-105 hover:shadow-lg",
        selected
          ? `border-lcars-${accentColor} shadow-[0_0_20px_rgba(255,153,0,0.3)]`
          : "border-lcars-orange/30 hover:border-lcars-orange/50"
      )}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-lcars-orange/30">
          <div>
            {title && (
              <h3 className="font-display text-sm uppercase tracking-wider text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
```

### 4.2 Data Display Components

**DataRow Component:**

```tsx
interface DataRowProps {
  label: string;
  value: string | number;
  positive?: boolean;
  negative?: boolean;
  icon?: LucideIcon;
  tooltip?: string;
}

function DataRow({ label, value, positive, negative, icon: Icon, tooltip }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span className="text-slate-400 text-sm">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info className="w-3 h-3 text-slate-500" />
          </Tooltip>
        )}
      </div>
      <span className={cn(
        "font-mono text-base",
        positive && "text-lcars-green",
        negative && "text-lcars-red",
        !positive && !negative && "text-white"
      )}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
```

**ResourceBar Component:**

```tsx
interface ResourceBarProps {
  label: string;
  current: number;
  max: number;
  change?: number;
  icon?: LucideIcon;
}

function ResourceBar({ label, current, max, change, icon: Icon }: ResourceBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isLow = percentage < 25;
  const isCritical = percentage < 10;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-lcars-orange" />}
          <span className="font-display text-sm uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-white">
            {current.toLocaleString()}
          </span>
          {change !== undefined && (
            <span className={cn(
              "text-sm",
              change > 0 ? "text-lcars-green" : "text-lcars-red"
            )}>
              {change > 0 ? '+' : ''}{change}
            </span>
          )}
        </div>
      </div>

      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCritical && "bg-lcars-red",
            isLow && !isCritical && "bg-lcars-amber",
            !isLow && "bg-gradient-to-r from-lcars-blue to-lcars-green"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### 4.3 Layout Pattern: Card + Details Sidebar

**THE CRITICAL PATTERN - NO SCROLLING TO TAKE ACTION**

**Problem:** Vertical stacking forces scrolling and hides action buttons

**Solution:** Horizontal split with selection list and details panel

```tsx
// Example: Market Panel using this pattern
export function MarketPanel() {
  const [selectedResource, setSelectedResource] = useState<ResourceType>('food');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(100);

  return (
    <GlassPanel title="Galactic Market">
      <div className="flex h-[600px]">

        {/* LEFT: Resource Selection (1/3 width, scrollable) */}
        <div className="w-1/3 overflow-y-auto pr-4 border-r border-slate-700 space-y-2">
          {resources.map(resource => (
            <ResourceCard
              key={resource.type}
              resource={resource}
              isSelected={selectedResource === resource.type}
              onClick={() => setSelectedResource(resource.type)}
            />
          ))}
        </div>

        {/* RIGHT: Trade Interface (2/3 width, NO SCROLL) */}
        <div className="w-2/3 pl-4 flex flex-col">
          <h3 className="text-xl font-display mb-4">
            Trade {selectedResource.toUpperCase()}
          </h3>

          {/* All controls visible without scrolling */}
          <SegmentedControl
            options={[
              { value: 'buy', label: 'Buy', icon: ShoppingCart },
              { value: 'sell', label: 'Sell', icon: DollarSign }
            ]}
            value={action}
            onChange={setAction}
            className="mb-6"
          />

          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">Quantity</label>
            <Slider
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10000}
              step={100}
            />
          </div>

          <div className="flex-1 bg-black/30 rounded-lg p-4 mb-4">
            <TradePreview
              resource={selectedResource}
              action={action}
              quantity={quantity}
              price={marketPrices[selectedResource]}
            />
          </div>

          {/* Action Button - ALWAYS VISIBLE at bottom */}
          <button
            className="w-full py-4 bg-lcars-orange hover:bg-primary-hover text-black font-display text-lg rounded-lg transition-all"
            onClick={() => executeTrade()}
          >
            {action === 'buy' ? 'BUY' : 'SELL'} {quantity} {selectedResource.toUpperCase()} FOR {calculateCost()} CR
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
```

**Benefits:**
- ✅ No scrolling required to complete action
- ✅ Selection and details both visible
- ✅ Action button always in sight
- ✅ Better use of horizontal space
- ✅ Faster workflow (fewer clicks)

**Apply this pattern to:**
- Market trading interface
- Unit building panel
- Sector purchase screen
- Research allocation
- Diplomacy offers

---

## 5. Screen Designs

### 5.1 Star Map (Primary View)

**Implementation: D3.js Force-Directed Graph**

```tsx
// StarMap.tsx
export function StarMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedEmpire, setSelectedEmpire] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Render nodes (empires)
    const empireNodes = svg.selectAll('.empire')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'empire')
      .on('click', (event, d) => setSelectedEmpire(d.id));

    // Empire nebula visualization
    empireNodes.append('circle')
      .attr('r', d => Math.sqrt(d.networth) / 10)
      .attr('fill', d => d.color)
      .attr('opacity', 0.6)
      .attr('filter', 'url(#glow)');

    // Update positions on tick
    simulation.on('tick', () => {
      empireNodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Controls */}
      <div className="absolute top-4 right-4 space-x-2">
        <button className="px-3 py-2 bg-black/50 text-white rounded">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="px-3 py-2 bg-black/50 text-white rounded">
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 p-4 rounded-lg">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Allied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Hostile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500" />
            <span>Neutral</span>
          </div>
        </div>
      </div>

      {/* Empire Detail Overlay */}
      {selectedEmpire && (
        <EmpireDetailPanel
          empireId={selectedEmpire}
          onClose={() => setSelectedEmpire(null)}
        />
      )}
    </div>
  );
}
```

### 5.2 Combat Interface (Overlay)

```tsx
export function AttackInterface({ targetEmpireId }: { targetEmpireId: string }) {
  const [selectedForces, setSelectedForces] = useState<Forces>({});
  const preview = useCombatPreview(selectedForces, targetEmpireId);

  return (
    <GlassPanel title="Launch Attack">
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT: Your Forces */}
        <div>
          <h3 className="text-lg font-display mb-4 text-lcars-blue">
            ATTACKING FORCES
          </h3>

          <ForceCompositionSelector
            available={playerUnits}
            selected={selectedForces}
            onChange={setSelectedForces}
          />

          <div className="mt-4 p-4 bg-lcars-blue/10 border border-lcars-blue rounded-lg">
            <div className="text-sm text-slate-400">Total Combat Power</div>
            <div className="text-3xl font-display text-lcars-blue">
              {preview.attackerPower.toLocaleString()}
            </div>
          </div>
        </div>

        {/* RIGHT: Enemy Forces */}
        <div>
          <h3 className="text-lg font-display mb-4 text-lcars-red">
            DEFENDING FORCES
          </h3>

          <ForceCompositionDisplay forces={preview.defenderForces} />

          <div className="mt-4 p-4 bg-lcars-red/10 border border-lcars-red rounded-lg">
            <div className="text-sm text-slate-400">Total Combat Power</div>
            <div className="text-3xl font-display text-lcars-red">
              {preview.defenderPower.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Preview */}
      <div className="mt-6 p-6 bg-gradient-to-br from-red-950/30 to-orange-950/30 border-2 border-lcars-red/50 rounded-lg">
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-sm text-slate-400">Estimated Casualties</div>
            <div className="text-2xl font-display text-lcars-blue">
              {preview.attackerCasualties} units
            </div>
          </div>

          <Swords className="w-12 h-12 text-lcars-red animate-pulse" />

          <div className="text-center">
            <div className="text-sm text-slate-400">Estimated Casualties</div>
            <div className="text-2xl font-display text-lcars-red">
              {preview.defenderCasualties} units
            </div>
          </div>
        </div>

        <WinProbabilityBar probability={preview.winChance} />

        <div className="mt-6 text-center">
          <button
            className="px-12 py-4 bg-lcars-red hover:bg-red-500 text-white font-display text-xl rounded-lcars-pill transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
            onClick={() => launchAttack()}
          >
            LAUNCH ATTACK
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
```

---

## 6. UX Patterns

### 6.1 Turn Phase Awareness System

**CRITICAL FEATURE** - Players must always know which phase they're in

**Collapsible Phase Indicator:**

```tsx
export function PhaseIndicator() {
  const { currentTurn, maxTurns, currentPhase, timeRemaining } = useTurnState();
  const [isExpanded, setIsExpanded] = useState(() => {
    // Auto-expand for first 5 turns
    if (currentTurn <= 5) return true;
    // Otherwise use saved preference
    return localStorage.getItem('phaseIndicatorExpanded') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('phaseIndicatorExpanded', String(isExpanded));
  }, [isExpanded]);

  return (
    <div className="sticky top-0 z-40 bg-background-panel/90 backdrop-blur-lg border-b border-lcars-orange/30">

      {/* Collapsed State - Always Visible */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="font-display text-lg">
            Turn <span className="text-lcars-orange">{currentTurn}</span> / {maxTurns}
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Phase {currentPhase.order}/6:</span>
            <span className="font-display text-lcars-blue">{currentPhase.name}</span>
          </div>

          {timeRemaining && (
            <>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-lcars-amber" />
                <span className="font-mono text-lcars-amber">{formatTime(timeRemaining)}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded State - Show Guidance */}
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-slate-700/50">
          <div className="mt-4 p-4 bg-black/30 rounded-lg">
            <p className="text-sm text-slate-300 mb-3">
              {currentPhase.description}
            </p>

            <div className="mb-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Available Actions:
              </div>
              <div className="flex flex-wrap gap-2">
                {currentPhase.availableActions.map(action => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="px-3 py-1 bg-lcars-orange/20 border border-lcars-orange/50 rounded text-sm text-lcars-orange hover:bg-lcars-orange/30 transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <button className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                What happens when I end turn?
              </button>

              {currentPhase.canEndTurn && (
                <button className="px-6 py-2 bg-lcars-orange hover:bg-primary-hover text-black font-display rounded transition-colors">
                  End Turn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Phase Configuration:**

```typescript
const TURN_PHASES = [
  {
    order: 1,
    name: 'Income Collection',
    description: 'Resources are collected from sectors and income buildings.',
    availableActions: [],
    canEndTurn: false,
  },
  {
    order: 2,
    name: 'Population Growth',
    description: 'Population grows or shrinks based on food availability.',
    availableActions: [],
    canEndTurn: false,
  },
  {
    order: 3,
    name: 'Civil Status Update',
    description: 'Civil status is recalculated based on food, population, and networth.',
    availableActions: [],
    canEndTurn: false,
  },
  {
    order: 4,
    name: 'Market Fluctuations',
    description: 'Market prices update based on supply and demand.',
    availableActions: [],
    canEndTurn: false,
  },
  {
    order: 5,
    name: 'Bot Decisions',
    description: 'All bot empires make their decisions and execute actions.',
    availableActions: [],
    canEndTurn: false,
  },
  {
    order: 6,
    name: 'Player Actions',
    description: 'Your turn to build units, launch attacks, trade, and make diplomatic offers.',
    availableActions: [
      { label: '⚔️ Launch Attacks', href: '/game/starmap?panel=military' },
      { label: '🏗️ Build Units', href: '/game/starmap?panel=military&tab=build' },
      { label: '💬 Diplomacy', href: '/game/starmap?panel=diplomacy' },
      { label: '📊 Review Intel', href: '/game/starmap' },
      { label: '🔬 Research', href: '/game/starmap?panel=research' },
      { label: '📈 Trade', href: '/game/starmap?panel=market' },
    ],
    canEndTurn: true,
  },
];
```

### 6.2 Actionable Guidance System

**Problem:** Players see warnings but don't know how to solve them

**Solution:** Convert passive warnings into actionable prompts

```tsx
interface ActionPromptProps {
  severity: 'critical' | 'warning' | 'opportunity' | 'info';
  icon?: LucideIcon;
  message: string;
  actions: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary';
  }>;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function ActionPrompt({
  severity,
  icon: Icon,
  message,
  actions,
  dismissible = true,
  onDismiss
}: ActionPromptProps) {
  const config = {
    critical: {
      bgColor: 'bg-lcars-red/10',
      borderColor: 'border-lcars-red',
      iconColor: 'text-lcars-red',
      defaultIcon: AlertTriangle,
    },
    warning: {
      bgColor: 'bg-lcars-amber/10',
      borderColor: 'border-lcars-amber',
      iconColor: 'text-lcars-amber',
      defaultIcon: AlertCircle,
    },
    opportunity: {
      bgColor: 'bg-lcars-blue/10',
      borderColor: 'border-lcars-blue',
      iconColor: 'text-lcars-blue',
      defaultIcon: Target,
    },
    info: {
      bgColor: 'bg-slate-700/20',
      borderColor: 'border-slate-600',
      iconColor: 'text-slate-400',
      defaultIcon: Info,
    },
  }[severity];

  const IconComponent = Icon || config.defaultIcon;

  return (
    <div className={cn(
      "relative p-4 rounded-lg border-l-4",
      config.bgColor,
      config.borderColor,
      severity === 'critical' && "animate-pulse"
    )}>
      <div className="flex items-start gap-3">
        <IconComponent className={cn("w-6 h-6 flex-shrink-0 mt-0.5", config.iconColor)} />

        <div className="flex-1">
          <p className="text-sm text-slate-200 mb-3">{message}</p>

          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => {
              const ButtonComponent = action.href ? Link : 'button';
              const props = action.href ? { href: action.href } : { onClick: action.onClick };

              return (
                <ButtonComponent
                  key={index}
                  {...props}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded font-display text-sm transition-all",
                    action.variant === 'primary'
                      ? "bg-lcars-orange hover:bg-primary-hover text-black"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  {action.label}
                </ButtonComponent>
              );
            })}
          </div>
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
```

**Usage Examples:**

```tsx
// Critical food shortage
<ActionPrompt
  severity="critical"
  message="Food deficit! You will lose population next turn (-500 food/turn)."
  actions={[
    {
      label: "Buy Agriculture Sectors",
      href: "/game/starmap?panel=sectors&type=agriculture",
      icon: ShoppingCart,
      variant: "primary"
    },
    {
      label: "Buy Food from Market",
      href: "/game/starmap?panel=market&resource=food&action=buy",
      icon: Store,
      variant: "primary"
    },
    {
      label: "Release Luxury Sectors",
      onClick: () => openSectorManager('luxury'),
      icon: Trash2,
      variant: "secondary"
    }
  ]}
  dismissible={false} // Force player to address
/>

// Attack opportunity
<ActionPrompt
  severity="opportunity"
  icon={Target}
  message="Empire 'Vexar Coalition' is Fearful and has weak defenses."
  actions={[
    {
      label: "Launch Attack",
      href: "/game/starmap?panel=military&target=vexar",
      icon: Swords,
      variant: "primary"
    },
    {
      label: "View on Map",
      href: "/game/starmap?focus=vexar",
      icon: Map,
      variant: "secondary"
    }
  ]}
/>
```

### 6.3 Strategic Visual Language

**Anticipation → Action → Payoff Pattern**

Game actions should feel meaningful through visual feedback:

**Tier 1: Anticipation (Pre-Action)**

Show what the player will get BEFORE they commit:

```tsx
// Build Units Preview
<div className="p-4 bg-gradient-to-r from-lcars-blue/5 to-lcars-blue/10 border-l-4 border-lcars-blue rounded">
  <div className="flex items-center gap-4">
    <ArrowRight className="w-8 h-8 text-lcars-blue animate-pulse" />
    <div>
      <div className="text-sm text-slate-400">You will gain:</div>
      <div className="text-2xl font-display text-lcars-blue">
        +{quantity} {unitName}
      </div>
      <div className="text-sm text-slate-400">
        Combat Power: +{powerGain.toLocaleString()}
      </div>
    </div>
  </div>
</div>
```

**Tier 2: Payoff (Post-Action)**

Celebrate successful actions with visual feedback:

```tsx
// After unit construction completes
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-2 border-lcars-green rounded-lg"
>
  <div className="flex items-center gap-4">
    <Sparkles className="w-12 h-12 text-lcars-green animate-pulse" />
    <div>
      <div className="text-lg font-display text-lcars-green">
        CONSTRUCTION COMPLETE
      </div>
      <div className="text-3xl font-bold text-white">
        +{quantity} {unitName}
      </div>
      <div className="text-sm text-slate-400">
        Your fleet power increased by {powerGain.toLocaleString()}
      </div>
    </div>
  </div>
</motion.div>
```

**Tier 3: Threat (Attention)**

Make critical issues impossible to ignore:

```tsx
// Incoming attack warning
<div className="relative overflow-hidden p-6 bg-gradient-to-br from-red-950/50 to-orange-950/50 border-2 border-lcars-red rounded-lg animate-pulse">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lcars-red/10 to-transparent animate-shimmer" />

  <div className="relative flex items-center gap-4">
    <AlertTriangle className="w-12 h-12 text-lcars-red animate-bounce" />
    <div>
      <div className="text-xl font-display text-lcars-red">
        INCOMING ATTACK
      </div>
      <div className="text-white text-lg">
        Empire "{attackerName}" is attacking Sector {sectorName}
      </div>
      <div className="text-slate-400 text-sm mt-1">
        Battle begins next turn
      </div>
    </div>
  </div>

  <div className="mt-4 flex gap-2">
    <button className="px-6 py-2 bg-lcars-red hover:bg-red-500 text-white font-display rounded-lg">
      Prepare Defense
    </button>
    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
      View Enemy Forces
    </button>
  </div>
</div>
```

---

## 7. Animation & Motion

### 7.1 Animation Strategy: CSS + GSAP Hybrid

**CSS Transitions - Use For:**
- ✅ Hover states
- ✅ Focus states
- ✅ Simple show/hide
- ✅ Color changes
- ✅ Opacity fades
- ✅ Scale transforms (buttons)

**GSAP Timelines - Use For:**
- ✅ Combat sequences (multi-step)
- ✅ Turn transitions (flash overlay, number updates)
- ✅ Star map interactions (zoom, pan, highlight)
- ✅ Complex easing curves (bounce, elastic)
- ✅ Any animation with 3+ sequential steps

### 7.2 CSS Animation Guidelines

**Performance Best Practices:**

```css
/* ✅ GOOD - Animate transform and opacity only */
.card {
  transition: transform 200ms ease, opacity 200ms ease;
}

.card:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

/* ❌ BAD - Animating layout properties causes reflow */
.card {
  transition: width 200ms ease, height 200ms ease;
}
```

**Timing Guidelines:**
- **Micro-interactions:** 100-200ms (hover, focus)
- **UI elements:** 200-300ms (panels, modals)
- **Page transitions:** 300-500ms (max)

**Common Tailwind Classes:**

```tsx
// Fade in
<div className="animate-in fade-in duration-200">

// Slide in from right
<div className="animate-in slide-in-from-right duration-300">

// Scale on hover
<div className="transition-transform hover:scale-105 duration-200">

// Glow effect on hover
<div className="transition-shadow hover:shadow-[0_0_20px_rgba(255,153,0,0.5)] duration-200">

// Pulse (for critical alerts)
<div className="animate-pulse">
```

### 7.3 GSAP Implementation

**Installation:**

```bash
npm install gsap
```

**Combat Animation Sequence:**

```typescript
import gsap from 'gsap';

export function animateCombatSequence(
  attackerId: string,
  defenderId: string,
  result: CombatResult
) {
  const tl = gsap.timeline();

  // Phase 1: Attackers approach
  tl.to(`.attacker-${attackerId}`, {
    x: 200,
    duration: 1,
    ease: 'power2.out',
  });

  // Phase 2: Shield impact
  tl.to(`.defender-shield-${defenderId}`, {
    opacity: 0.5,
    scale: 1.2,
    duration: 0.2,
    ease: 'power4.out',
  });

  // Phase 3: Explosion
  tl.to(`.explosion-${defenderId}`, {
    scale: 1,
    opacity: 1,
    duration: 0.3,
    ease: 'back.out',
  });

  // Phase 4: Casualties count up
  tl.to(`.casualties-display`, {
    innerText: result.casualties,
    duration: 1,
    snap: { innerText: 1 },
    ease: 'power1.inOut',
  });

  return tl;
}
```

**Turn Transition:**

```typescript
export function animateTurnTransition(fromTurn: number, toTurn: number) {
  const tl = gsap.timeline();

  // Flash overlay
  tl.to('.turn-overlay', {
    opacity: 1,
    duration: 0.2,
  });

  // Update turn number
  tl.to('.turn-number', {
    innerText: toTurn,
    duration: 0,
  });

  // Fade out overlay
  tl.to('.turn-overlay', {
    opacity: 0,
    duration: 0.3,
  });

  return tl;
}
```

### 7.4 Respect Reduced Motion

```tsx
// Hook to detect reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Conditional animation
function MyComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3
      }}
    >
      Content
    </motion.div>
  );
}
```

---

## 8. Data Visualization

### 8.1 Number Formatting

```typescript
export function formatNumber(value: number, decimals: number = 0): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toLocaleString();
}

export function formatChange(value: number, showPlus: boolean = true): string {
  const sign = value >= 0 ? (showPlus ? '+' : '') : '';
  return `${sign}${formatNumber(value)}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
```

### 8.2 Win Probability Bar

```tsx
interface WinProbabilityBarProps {
  probability: number; // 0.0 - 1.0
}

export function WinProbabilityBar({ probability }: WinProbabilityBarProps) {
  const percentage = probability * 100;
  const isLikely = percentage >= 60;
  const isUnlikely = percentage <= 40;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Victory Probability</span>
        <span className={cn(
          "font-display text-lg",
          isLikely && "text-lcars-green",
          isUnlikely && "text-lcars-red",
          !isLikely && !isUnlikely && "text-lcars-amber"
        )}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      <div className="relative h-8 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3",
            isLikely && "bg-gradient-to-r from-green-700 to-green-500",
            isUnlikely && "bg-gradient-to-r from-red-700 to-red-500",
            !isLikely && !isUnlikely && "bg-gradient-to-r from-amber-700 to-amber-500"
          )}
          style={{ width: `${percentage}%` }}
        >
          {percentage >= 20 && (
            <span className="text-white text-sm font-bold">{percentage.toFixed(0)}%</span>
          )}
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>Defeat</span>
        <span>Victory</span>
      </div>
    </div>
  );
}
```

---

## 9. Accessibility

### 9.1 Keyboard Navigation

All interactive elements must be keyboard accessible:

```tsx
// ✅ GOOD - Proper keyboard navigation
<button
  className="..."
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Launch Attack
</button>
```

**Global Keyboard Shortcuts:**

```tsx
useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'm':
        router.push('/game/starmap');
        break;
      case 'b':
        router.push('/game/starmap?panel=military&action=build');
        break;
      case 'a':
        router.push('/game/starmap?panel=military&action=attack');
        break;
      case 'r':
        router.push('/game/starmap?panel=research');
        break;
      case 'd':
        router.push('/game/starmap?panel=diplomacy');
        break;
      case 'escape':
        closeAllPanels();
        break;
    }
  }

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 9.2 Screen Reader Support

**ARIA Labels:**

```tsx
// Descriptive labels
<button aria-label="Launch attack on Empire Vexar Coalition">
  <Swords className="w-4 h-4" />
</button>

// Live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {turnStatus}
</div>

<div aria-live="assertive" aria-atomic="true">
  {criticalAlert}
</div>
```

### 9.3 Color Contrast

**WCAG AA Compliance:**
- Normal text (< 18px): 4.5:1 contrast ratio
- Large text (≥ 18px): 3:1 contrast ratio

**Don't rely on color alone:**

```tsx
// ✅ GOOD - Color + Icon
<span className="text-lcars-green flex items-center gap-1">
  <TrendingUp className="w-4 h-4" />
  +1,500
</span>
```

---

## 10. Testing Conventions

### 10.1 data-testid Naming

**Pattern:** `[area]-[component]-[identifier]-[action]`

```tsx
// Sector card
<div data-testid="sector-card-antares-v">
  <button data-testid="sector-card-antares-v-manage">Manage</button>
  <button data-testid="sector-card-antares-v-release">Release</button>
</div>

// Combat interface
<div data-testid="combat-interface">
  <select data-testid="combat-interface-target-select" />
  <input data-testid="combat-interface-quantity-input" />
  <button data-testid="combat-interface-attack-button">Launch Attack</button>
</div>
```

---

## 11. Implementation Guide

### 11.1 Tech Stack

**Framework:** Next.js 14 with App Router
**Styling:** Tailwind CSS
**Visualization:** D3.js
**Animation:** CSS Transitions + GSAP
**Icons:** Lucide React
**Utilities:** clsx, tailwind-merge

### 11.2 Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lcars: {
          orange: '#FF9900',
          purple: '#CC99FF',
          blue: '#66CCFF',
          green: '#99FFCC',
          amber: '#FFCC66',
          red: '#FF6666',
          peach: '#FFCC99',
        },
        background: {
          space: '#0a0e27',
          panel: '#1a1f3a',
          elevated: '#2a3150',
        },
        primary: {
          DEFAULT: '#FF9900',
          hover: '#FFB133',
          active: '#E68A00',
        },
        secondary: {
          DEFAULT: '#CC99FF',
          hover: '#D9B3FF',
          active: '#B380E6',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'lcars': '12px',
        'lcars-pill': '9999px',
      },
      backdropBlur: {
        'lcars': '10px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 11.3 Font Setup

```tsx
// app/layout.tsx
import { Orbitron, Exo_2, Roboto_Mono } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
});

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${exo2.variable} ${robotoMono.variable}`}>
      <body className="font-body">
        <SpaceBackground />
        {children}
      </body>
    </html>
  );
}
```

### 11.4 Utility Functions

```typescript
// src/lib/ui/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 0): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toLocaleString();
}

export function formatChange(value: number, showPlus: boolean = true): string {
  const sign = value >= 0 ? (showPlus ? '+' : '') : '';
  return `${sign}${formatNumber(value)}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```
# requirements

**integrate with new template**

**Source Document:** `docs/design/FRONTEND-DESIGN.md` (Consolidated design system v3.0, 2026-01-12)

### 13.1 Design Philosophy

### REQ-UI-001: Boardgame + LCARS Aesthetic

**Description:** The UI must embody two core pillars:
1. **Boardgame Mental Model:** Star map is the board (always visible), panels are like examining cards
2. **LCARS Visual Design:** Star Trek-inspired glass panels, curved corners, color-coded information

Visual characteristics:
- Glass panels with backdrop blur over deep space backgrounds
- LCARS color palette: Orange (primary), Purple (secondary), Blue (friendly), Red (danger), Amber (warnings)
- Orbitron/Exo 2 display fonts with Roboto Mono for data
- Pill-shaped buttons with glow effects
- Ambient animations and transitions

**Rationale:** Creates distinctive, immersive interface that reinforces spatial strategy gameplay.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 1

**Code:** `src/components/`, `tailwind.config.ts`

**Tests:** E2E visual tests (TBD)

**Status:** Draft

---

### 13.2 Navigation Architecture

### REQ-UI-002: Star Map as Hub

**Description:** The star map is NOT just another page - it is the **default view and central hub** for all gameplay:
- `/game/starmap` is the primary route (all `/game` routes redirect here)
- All other screens (military, market, research, diplomacy) are **overlay panels** that slide over a dimmed star map
- Overlays use query parameters: `/game/starmap?panel=military`, `/game/starmap?panel=market`
- Pressing ESC or clicking backdrop returns to clean star map view
- Star map remains visible (dimmed/blurred) behind overlays to maintain spatial context

**Rationale:** Physical boardgames keep the board always visible. Breaking this pattern breaks the boardgame feel. Players need spatial awareness and strategic context at all times.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 3.1

**Code:** `src/app/game/starmap/page.tsx`, `src/components/game/OverlayPanel.tsx`, `src/components/game/OverlayPanelController.tsx`

**Tests:** E2E navigation tests (TBD)

**Status:** Draft

---

### REQ-UI-003: Overlay Panel System

**Description:** All game screens (except star map) render as overlay panels with these properties:
- **Positions:** right, left, bottom, center
- **Animations:** Slide in from edge using Framer Motion
- **Backdrop:** Dimmed star map (60% opacity, blur effect) always visible
- **Close actions:** ESC key, click backdrop, close button, navigate to `/game/starmap`
- **Server-rendered:** Panels fetch data server-side, render with Suspense boundaries

Panel routing:
- Military: `?panel=military` (right overlay)
- Market: `?panel=market` (bottom overlay)
- Research: `?panel=research` (right overlay)
- Diplomacy: `?panel=diplomacy` (center overlay)
- Empire details: `?empire=<id>` (right overlay)

**Rationale:** Maintains boardgame feel (picking up cards), faster navigation (no page transitions), preserves spatial context.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 3.3

**Code:** `src/components/game/OverlayPanel.tsx`, `src/components/game/OverlayPanelController.tsx`

**Tests:** Component tests for overlay behavior (TBD)

**Status:** Draft

---

### 13.3 Component Patterns

### REQ-UI-004: Card + Details Sidebar Pattern

**Description:** All resource management screens (market, military, sectors) MUST use horizontal split layout to eliminate scrolling:
- **Left side (1/3 width):** Selection list of items (scrollable if needed)
- **Right side (2/3 width):** Details + action controls + confirmation button
- **Critical:** Action button ALWAYS visible at bottom (no scrolling required to confirm)
- Fixed container height (600px or viewport-based)

Applies to:
- Market trading interface
- Unit building panel
- Sector purchase screen
- Research allocation
- Diplomacy offers

**Rationale:** Original vertical stacking forced scrolling and hid action buttons below fold. UX analysis identified this as major friction point. Horizontal split eliminates scrolling and keeps actions visible.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 4.3, `docs/design/UX-ROADMAP.md` (archived analysis)

**Code:** `src/components/game/market/MarketPanel.tsx`, `src/components/game/military/BuildUnitsPanel.tsx`

**Tests:** E2E tests for no-scroll workflow (TBD)

**Status:** Draft

---

### 13.4 UX Patterns

### REQ-UI-005: Collapsible Phase Indicator

**Description:** A persistent turn phase indicator must show players which of the 6 turn phases is executing:
- **Sticky header** at top of screen showing current turn and phase
- **Auto-expanded** for first 5 turns (tutorial), then collapsible
- **Collapsed state:** Shows turn number, current phase name, time remaining
- **Expanded state:** Shows phase description, available actions (as links), "End Turn" button
- **Keyboard shortcut:** Toggle with spacebar

Phase display:
```
Turn 42/200 | Phase 6/6: Player Actions | ⏰ 4:23 remaining
```

**Rationale:** UX analysis identified turn phase invisibility as CRITICAL issue. Players cannot learn game mechanics without understanding when events occur. Phase indicator teaches timing and guides actions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 6.1, `docs/design/UX-ROADMAP.md` Priority 1

**Code:** `src/components/game/PhaseIndicator.tsx`, `src/app/game/layout.tsx`

**Tests:** Component tests for phase display (TBD)

**Status:** Draft

---

### REQ-UI-006: Actionable Guidance System

**Description:** All warnings and alerts must be actionable (include solution buttons), not passive:
- **Severity levels:** critical (red, pulsing), warning (amber), opportunity (blue), info (gray)
- **Components:** Message + 1-3 action buttons with icons
- **Actions:** Direct links to relevant screens or inline action buttons
- **Non-dismissible:** Critical alerts block turn end until addressed

Example - Food shortage:
```
⚠️ Food deficit! You will lose population next turn (-500 food/turn)
[🛒 Buy Agriculture Sectors] [🏪 Buy Food from Market] [❌ Dismiss]
```

**Rationale:** UX analysis found players see warnings but don't know how to fix them. Actionable prompts convert passive notifications into guided solutions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 6.2, `docs/design/UX-ROADMAP.md` Priority 2

**Code:** `src/components/game/ActionPrompt.tsx`, replaces `FoodWarning.tsx`

**Tests:** Component tests for action routing (TBD)

**Status:** Draft

---

### REQ-UI-007: Strategic Visual Language

**Description:** Game actions must feel meaningful through visual feedback using Anticipation → Action → Payoff pattern:

**Tier 1 - Anticipation (pre-action):**
- Show preview of what player will gain BEFORE committing
- Hover effects with glow/scale (1.05x scale, glow shadow)
- Cost/benefit breakdown visible

**Tier 2 - Payoff (post-action):**
- Success animations on completion (scale pulse, green glow)
- Explicit "+X gained" messages
- Particle effects for major actions (optional)

**Tier 3 - Threat (attention):**
- Critical alerts pulse and animate
- Incoming attacks flash red with countdown
- Can't-be-ignored visual priority

**Rationale:** Game felt "administrative" rather than "strategic." Visual feedback creates tension, risk, reward feelings. Every action should have emotional weight.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 6.3, `docs/design/UX-ROADMAP.md` Priority 5

**Code:** Component-specific styles, `src/components/game/*/styles.ts`

**Tests:** Visual regression tests (TBD)

**Status:** Draft

---

### 13.5 Technical Stack

### REQ-UI-008: React Query Data Layer

**Description:** All server state is managed via React Query hooks.

**Rationale:** SDD architecture for predictable data flow.

**Source:** SDD Migration (Phase 3)

**Code:** `src/lib/api/queries/`, `src/lib/api/mutations/`

**Tests:** TBD

**Status:** Draft - Design complete, awaiting implementation

---

### REQ-UI-009: Zustand Client State

**Description:** All client-only state is managed via Zustand stores.

**Rationale:** SDD architecture for predictable state management.

**Source:** SDD Migration (Phase 3)

**Code:** `src/stores/`

**Tests:** TBD

**Status:** Draft - Design complete, awaiting implementation

---

### REQ-UI-010: CSS + GSAP Hybrid Animation

**Description:** Animation strategy uses two systems:
- **CSS transitions:** Hover states, focus states, simple show/hide, color changes (100-300ms)
- **GSAP timelines:** Combat sequences, turn transitions, complex multi-step animations (3+ steps)

**Performance guidelines:**
- Only animate transform and opacity (GPU-accelerated)
- Never animate layout properties (width, height, top, left)
- Respect `prefers-reduced-motion` setting

**Rationale:** CSS handles micro-interactions efficiently. GSAP handles narrative sequences (combat, turn processing) with precise control. Best of both worlds.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 7

**Code:** `src/styles/globals.css`, `src/lib/animations/`

**Tests:** Animation unit tests (TBD)

**Status:** Draft

---

### REQ-UI-011: D3.js Star Map Visualization

**Description:** Star map uses D3.js force-directed graph visualization:
- **Nodes:** Empires rendered as nebula clouds with glow filters
- **Edges:** Treaty lines (alliances, NAPs) and threat indicators
- **Forces:** Charge (repulsion), center (centering), collision (overlap prevention)
- **Interactions:** Click empire → open detail overlay, zoom, pan
- **Intel system:** Unknown/basic/moderate/full visibility levels

**Rationale:** D3.js is already implemented and perfect for network graph layouts. SVG enables easy styling and interaction. Force simulation creates organic, visually pleasing empire distributions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 8, `docs/design/frontend-developer-manual.md`

**Code:** `src/components/game/starmap/StarMap.tsx`

**Tests:** Visual tests for rendering (TBD)

**Status:** Draft (already implemented)

---

### 13.6 Accessibility

### REQ-UI-012: Keyboard Navigation

**Description:** All interactive elements must be keyboard accessible with global shortcuts:
- `M` → Return to star map
- `B` → Open military panel
- `T` → Open market panel (Trade)
- `R` → Open research panel
- `D` → Open diplomacy panel
- `ESC` → Close all panels
- `Space` → Toggle phase indicator
- `Tab` / `Shift+Tab` → Navigate focusable elements
- `Enter` / `Space` → Activate buttons

**Rationale:** Keyboard navigation improves speed for experienced players and ensures accessibility compliance.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 9.1

**Code:** `src/hooks/useKeyboardShortcuts.ts`, `src/components/game/GameShell.tsx`

**Tests:** E2E keyboard navigation tests (TBD)

**Status:** Draft

---

### REQ-UI-013: WCAG AA Color Contrast

**Description:** All text must meet WCAG AA contrast ratios:
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum
- Don't rely on color alone (use icons + color)

**Rationale:** Ensures readability for players with visual impairments and in various lighting conditions.

**Source:** `docs/design/FRONTEND-DESIGN.md` Section 9.3

**Code:** `tailwind.config.ts` color definitions

**Tests:** Automated contrast tests with axe-core (TBD)

**Status:** Draft

---

---

## Related Documents

- **[Frontend Developer Manual](frontend-developer-manual.md)** - Technical implementation, architecture, server actions
- **[PRD.md](../PRD.md)** - Product requirements and game mechanics
- **[GAME-DESIGN.md](../core/GAME-DESIGN.md)** - Core game design philosophy

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2026-01-12 | **CONSOLIDATED DOCUMENT.** Merged FRONTEND-GUIDE.md, UI_DESIGN.md, UX-DESIGN.md, UX-ROADMAP.md. Implemented Star Map as Hub architecture. Added Card + Details Sidebar pattern. Integrated Phase Indicator and Actionable Guidance systems. |
| 2.0 | 2026-01-11 | (Previous UX-DESIGN.md consolidation) |
| 1.0 | 2024-12-28 | (Original UI_DESIGN.md) |

---

**End of Document**
