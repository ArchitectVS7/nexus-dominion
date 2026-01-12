# Nexus Dominion: UX Design System

**Version:** 2.0
**Date:** 2026-01-11
**Status:** Consolidated Design Document

**Supersedes:** `UI_DESIGN.md`, `UI-DESIGN.md`, `UX-ROADMAP.md`

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

### 1.1 LCARS Aesthetic (Star Trek Inspired)

Nexus Dominion's interface draws inspiration from **Star Trek's LCARS** (Library Computer Access/Retrieval System) - the iconic futuristic UI seen throughout the franchise. This creates an immersive "command center" experience where players feel like they're running a galactic empire from a starship bridge.

**Core Design Principles:**

1. **Glass Panel Aesthetic** - Translucent panels over space backgrounds
2. **Curved Corners** - Rounded rectangles, pill shapes for buttons
3. **Color-Coded Information** - Different colors for different data types
4. **Ambient Atmosphere** - Space backgrounds, subtle animations
5. **Information Density** - Show critical data without overwhelming
6. **Actionable Guidance** - Every piece of data should suggest an action

### 1.2 Strategic Game UX Philosophy

**From Board Game to Digital:**
- Physical board games have the board always visible as a reference point
- Digital implementation: Star map should be the persistent hub
- Panels overlay the map like picking up cards from a board

**Turn-Based Strategy Best Practices:**

**Phase Awareness (from Civilization VI):**
- Players always know which phase they're in
- Clear "action required" prompts
- Phase-by-phase feedback, not just end-of-turn summary

**Resource Management (from Stellaris):**
- Persistent resource bar always visible
- Tooltips explain every calculation
- Color-coded warnings with severity

**Tactical Clarity (from XCOM):**
- Preview outcomes before committing
- Show action economy (attacks remaining, build slots used)
- Critical alerts demand attention

### 1.3 Core UX Problems Solved

**Problem 1: Turn Phase Invisibility**
- **Issue:** Players don't know which of 6 phases they're in
- **Solution:** Collapsible phase indicator with smart defaults (§6.1)

**Problem 2: Passive Warnings**
- **Issue:** Players see "low food" but don't know how to fix it
- **Solution:** Actionable guidance prompts with clickable actions (§6.2)

**Problem 3: Buried Star Map**
- **Issue:** Map is just another page, not the central hub
- **Solution:** Hybrid navigation with map mode toggle (§3.2)

**Problem 4: Scroll-Heavy Interfaces**
- **Issue:** Action buttons hidden below fold
- **Solution:** Card + details sidebar layout pattern (§4.3)

---

## 2. Visual Design System

### 2.1 Color Palette

**Implementation Strategy: Tailwind Theme + LCARS Aliases**

Configure in `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // LCARS Brand Colors
        lcars: {
          orange: '#FF9900',   // Primary interactive elements
          purple: '#CC99FF',   // Secondary panels, navigation
          blue: '#66CCFF',     // Friendly indicators, alliance
          green: '#99FFCC',    // Success, positive events
          amber: '#FFCC66',    // Warnings, attention
          red: '#FF6666',      // Danger, enemy indicators
          peach: '#FFCC99',    // Data readouts, neutral info
        },
        // Background System
        background: {
          space: '#0a0e27',      // Deep space navy
          panel: '#1a1f3a',      // Panel background
          elevated: '#2a3150',   // Hover/elevated state
        },
        // Semantic Colors (map to LCARS)
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
      // LCARS-specific utilities
      borderRadius: {
        'lcars': '12px',
        'lcars-pill': '9999px',
      },
      backdropBlur: {
        'lcars': '10px',
      },
    },
  },
}
```

**Usage Examples:**

```tsx
// Primary button with LCARS orange
<button className="bg-lcars-orange hover:bg-primary-hover rounded-lcars-pill">
  Launch Attack
</button>

// Panel with glass effect
<div className="bg-background-panel/60 backdrop-blur-lcars border border-lcars-orange/30">
  Panel content
</div>

// Success indicator
<span className="text-lcars-green">+1,500 credits</span>

// Danger warning
<div className="border-l-4 border-lcars-red bg-lcars-red/10">
  Critical food shortage!
</div>
```

### 2.2 Typography

**Font Families:**

```css
font-family: 'Orbitron', 'Exo 2', 'Roboto Mono', monospace;
```

- **Display:** Orbitron (futuristic, geometric) - Headers, titles, important values
- **Body:** Exo 2 - Paragraph text, descriptions
- **Data:** Roboto Mono - Numbers, statistics, monospace data

**Font Scale:**

| Element | Size | Weight | Use Case |
|---------|------|--------|----------|
| **Page Title** | 2rem (32px) | Bold (700) | Screen headers |
| **Section Header** | 1.5rem (24px) | Semi-bold (600) | Panel titles |
| **Panel Title** | 1.25rem (20px) | Medium (500) | Card headers |
| **Body Text** | 1rem (16px) | Normal (400) | Descriptions |
| **Data Values** | 0.875rem (14px) | Medium (500) | Statistics |
| **Labels** | 0.75rem (12px) | Normal (400) | Input labels |

**Tailwind Classes:**

```tsx
<h1 className="text-2xl font-bold font-display text-lcars-orange">
  Empire Dashboard
</h1>

<p className="text-base font-body text-slate-300">
  Manage your galactic empire's resources and military forces.
</p>

<span className="text-sm font-mono text-lcars-blue">
  1,234,567 cr
</span>
```

### 2.3 Panel Design System

**Glass Panel Base Component:**

```tsx
// GlassPanel.tsx
interface GlassPanelProps {
  title?: string;
  accentColor?: 'orange' | 'purple' | 'blue' | 'green' | 'red';
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function GlassPanel({ title, accentColor = 'orange', children, actions }: GlassPanelProps) {
  return (
    <div className="bg-background-panel/60 backdrop-blur-lcars rounded-lcars border border-lcars-orange/30">
      {title && (
        <div className={`flex items-center justify-between px-4 py-3 border-b border-lcars-${accentColor}/30`}>
          <div className={`flex items-center gap-2`}>
            <div className={`w-1 h-6 bg-lcars-${accentColor} rounded-full`} />
            <h2 className="text-lg font-display uppercase tracking-wider text-white">
              {title}
            </h2>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
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

// Ghost Button (Text Only)
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

### 3.1 Navigation Philosophy

**Hybrid Approach: Dashboard + Map Mode Toggle**

Nexus Dominion uses a flexible navigation system that accommodates both traditional dashboard-first users and immersive map-first players.

**Two Modes:**

1. **Dashboard Mode** (Default for new players)
   - 6-panel grid showing empire overview
   - Traditional web app navigation
   - Sidebar with links to all screens

2. **Map Mode** (Toggle for advanced players)
   - Full-screen star map
   - Overlay panels slide in from edges
   - Spatial navigation by clicking empires/sectors

**Mode Switcher:**

```tsx
// Add to top navigation bar
<ToggleButton
  options={[
    { value: 'dashboard', label: 'Dashboard Mode', icon: LayoutGrid },
    { value: 'map', label: 'Map Mode', icon: Map }
  ]}
  value={viewMode}
  onChange={setViewMode}
  className="fixed top-4 right-4 z-50"
/>
```

### 3.2 Dashboard Mode Layout

**6-Panel Actionable Grid:**

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] TURN 42/200 | PHASE 6/6: PLAYER ACTIONS    [▼]  │
├──────────────────┬──────────────────┬──────────────────┤
│ ⚠️ Critical      │ 📊 Empire Stats  │ ⚔️ Military       │
│ Alerts           │                  │ Status            │
│                  │                  │                   │
│ • Food: -500/turn│ • Networth: #12  │ • Active wars: 2  │
│   [Buy Food]     │ • Sectors: 8     │   [View Battles]  │
│   [Build Farms]  │ • Pop: 1.5M      │ • Fleet: 45.2K    │
│                  │   [Details]      │   [Manage]        │
├──────────────────┼──────────────────┼──────────────────┤
│ 🗺️ Territory     │ 📨 Messages (3)  │ 🎯 Opportunities  │
│ [Mini Star Map]  │                  │                   │
│                  │ • Vexar: NAP?    │ • Weak neighbor   │
│ Click for full   │   [Reply]        │   [Attack]        │
│ view             │ • Trade offer    │ • Alliance offer  │
│                  │   [View]         │   [Review]        │
└──────────────────┴──────────────────┴──────────────────┘
```

**Key Features:**

1. **Critical Alerts Panel** - Actionable warnings with solution buttons
2. **Empire Stats Panel** - High-level overview with drill-down links
3. **Military Status Panel** - Current conflicts and fleet power
4. **Territory Panel** - Mini star map preview (clicks open full map mode)
5. **Messages Panel** - Latest communications with quick actions
6. **Opportunities Panel** - Strategic suggestions based on game state

**Each Panel Structure:**

```tsx
<GlassPanel title="Critical Alerts" accentColor="red">
  {alerts.map(alert => (
    <ActionPrompt
      key={alert.id}
      severity={alert.severity}
      message={alert.message}
      actions={alert.actions}
    />
  ))}
</GlassPanel>
```

### 3.3 Map Mode Layout

**Full-Screen Star Map with Overlay Panels:**

```
┌──────────────────────────────────────────────────────┐
│ [Logo] [Dashboard Mode] [Map Mode ✓]          [User]│
├──────────────────────────────────────────────────────┤
│                                                      │
│                                                      │
│            [Full-Screen Star Map]                    │
│                                                      │
│          • Click empire → Empire detail overlay      │
│          • Click sector → Sector detail overlay      │
│          • Right-click → Context menu                │
│                                                      │
│                                                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│ [Resource Bar] Credits: 1.2M | Food: +500 | ...     │
└──────────────────────────────────────────────────────┘

[Overlay Panel slides in from right/bottom as needed]
```

**Persistent Map Button (Available in Dashboard Mode):**

```tsx
<button
  onClick={() => router.push('/game/starmap')}
  className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-lcars-orange text-black rounded-full shadow-lg hover:scale-110 transition-all hover:shadow-[0_0_30px_rgba(255,153,0,0.6)]"
  aria-label="Open star map"
>
  <Map className="w-8 h-8 mx-auto" />
</button>
```

### 3.4 Sidebar Navigation (Dashboard Mode)

**LCARS-Style Sidebar:**

```tsx
<nav className="w-64 bg-background-panel/80 backdrop-blur-lcars border-r border-lcars-orange/30">
  <div className="p-4 border-b border-lcars-orange/30">
    <h1 className="text-xl font-display text-lcars-orange">NEXUS DOMINION</h1>
  </div>

  <div className="p-2 space-y-1">
    {navItems.map(item => (
      <NavLink
        key={item.href}
        href={item.href}
        icon={item.icon}
        label={item.label}
        accentColor={item.color}
        isActive={pathname === item.href}
        badge={item.badge}
      />
    ))}
  </div>
</nav>

// NavLink component
function NavLink({ href, icon: Icon, label, accentColor, isActive, badge }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative",
        isActive
          ? `bg-lcars-${accentColor}/20 border-l-4 border-lcars-${accentColor}`
          : "hover:bg-white/5"
      )}
    >
      <div className={`w-1 h-full absolute left-0 bg-lcars-${accentColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <Icon className={`w-5 h-5 text-lcars-${accentColor}`} />
      <span className="text-white font-display uppercase tracking-wide text-sm">
        {label}
      </span>
      {badge && (
        <span className="ml-auto px-2 py-1 bg-lcars-red rounded-full text-xs font-bold">
          {badge}
        </span>
      )}
    </Link>
  );
}
```

**Navigation Items:**

```typescript
const navItems = [
  { href: '/game', icon: LayoutDashboard, label: 'Dashboard', color: 'orange' },
  { href: '/game/starmap', icon: Map, label: 'Star Map', color: 'blue' },
  { href: '/game/sectors', icon: Globe, label: 'Sectors', color: 'green' },
  { href: '/game/military', icon: Swords, label: 'Military', color: 'red' },
  { href: '/game/research', icon: FlaskConical, label: 'Research', color: 'purple' },
  { href: '/game/diplomacy', icon: Users, label: 'Diplomacy', color: 'blue' },
  { href: '/game/market', icon: TrendingUp, label: 'Market', color: 'amber' },
  { href: '/game/covert', icon: Eye, label: 'Covert Ops', color: 'purple' },
  { href: '/game/messages', icon: Mail, label: 'Messages', color: 'blue', badge: unreadCount },
];
```

---

## 4. Component Library

### 4.1 Card Patterns

**Base Card Component:**

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

**Usage Examples:**

```tsx
// Sector Card
<Card
  title="Antares V"
  subtitle="Agricultural Sector"
  accentColor="green"
  interactive
  selected={selectedSector?.id === sector.id}
  onClick={() => selectSector(sector)}
  actions={
    <button className="text-lcars-blue hover:text-blue-300">
      <Settings className="w-4 h-4" />
    </button>
  }
>
  <div className="space-y-2">
    <DataRow label="Population" value="1.2M" />
    <DataRow label="Production" value="+640 food/turn" positive />
    <DataRow label="Maintenance" value="-672 cr/turn" negative />
  </div>
</Card>

// Unit Card
<Card
  title="Soldiers"
  accentColor="red"
  interactive
  selected={selectedUnit === 'soldiers'}
  onClick={() => setSelectedUnit('soldiers')}
>
  <div className="text-center">
    <div className="text-3xl font-mono text-lcars-blue">5,000</div>
    <div className="text-xs text-slate-400 mt-1">Combat Power: 1.0</div>
  </div>
</Card>
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

**Problem:** Vertical stacking forces scrolling and hides action buttons

**Solution:** Horizontal split with selection list and details panel

```tsx
// Example: Market Panel Redesign
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

        {/* RIGHT: Trade Interface (2/3 width, no scroll) */}
        <div className="w-2/3 pl-4 flex flex-col">
          <h3 className="text-xl font-display mb-4">
            Trade {selectedResource.toUpperCase()}
          </h3>

          {/* Buy/Sell Toggle - Always Visible */}
          <SegmentedControl
            options={[
              { value: 'buy', label: 'Buy', icon: ShoppingCart },
              { value: 'sell', label: 'Sell', icon: DollarSign }
            ]}
            value={action}
            onChange={setAction}
            className="mb-6"
          />

          {/* Quantity Slider - Always Visible */}
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

          {/* Trade Preview - Always Visible */}
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

### 5.1 Dashboard (Default Landing)

See §3.2 for full layout. Dashboard uses 6-panel actionable grid.

### 5.2 Star Map (Full-Screen)

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

    // Empire name label
    empireNodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => Math.sqrt(d.networth) / 10 + 20)
      .attr('fill', 'white')
      .attr('font-family', 'Orbitron')
      .attr('font-size', '12px')
      .text(d => d.name);

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
          {/* Glow filter */}
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

**Interactive Features:**

- Click empire → Show detail panel
- Hover empire → Highlight connected empires (allies/enemies)
- Right-click → Context menu (attack, diplomacy, intel)
- Zoom controls
- Filter toggle (show/hide neutral empires, treaties, trade routes)

### 5.3 Combat Interface

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

### 5.4 Research Screen

```tsx
export function ResearchScreen() {
  const [allocations, setAllocations] = useState<ResearchAllocations>({});

  return (
    <div className="space-y-6">

      {/* Fundamental Research Progress */}
      <GlassPanel title="Fundamental Research" accentColor="purple">
        <FundamentalResearchProgress
          currentLevel={fundamentalLevel}
          progress={fundamentalProgress}
          nextLevelCost={nextLevelCost}
        />
      </GlassPanel>

      {/* Eight Research Branches Grid */}
      <GlassPanel title="Research Branches" accentColor="purple">
        <div className="grid grid-cols-4 gap-4">
          {branches.map(branch => (
            <ResearchBranchCard
              key={branch.id}
              branch={branch}
              allocation={allocations[branch.id] || 0}
              onAllocationChange={(value) => updateAllocation(branch.id, value)}
            />
          ))}
        </div>

        {/* Allocation Summary */}
        <div className="mt-6 p-4 bg-black/30 rounded-lg">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Allocation:</span>
            <span className={cn(
              "font-mono text-lg",
              totalAllocation === 100 ? "text-lcars-green" : "text-lcars-amber"
            )}>
              {totalAllocation}%
            </span>
          </div>
          {totalAllocation !== 100 && (
            <p className="text-sm text-lcars-amber mt-2">
              Allocations must total 100%
            </p>
          )}
        </div>
      </GlassPanel>

      {/* Unit Upgrades */}
      <GlassPanel title="Available Upgrades" accentColor="blue">
        <div className="grid grid-cols-3 gap-4">
          {availableUpgrades.map(upgrade => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onPurchase={() => purchaseUpgrade(upgrade.id)}
            />
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
```

### 5.5 Messages / Events

```tsx
export function MessagesInbox() {
  const [filter, setFilter] = useState<'all' | 'diplomatic' | 'combat' | 'trade' | 'system'>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  return (
    <GlassPanel
      title="Messages"
      actions={
        <div className="flex gap-2">
          <button className="text-sm text-slate-400 hover:text-white">
            Mark All Read
          </button>
        </div>
      }
    >
      <div className="flex h-[700px]">

        {/* LEFT: Message List */}
        <div className="w-1/2 overflow-y-auto pr-4 border-r border-slate-700 space-y-2">
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {(['all', 'diplomatic', 'combat', 'trade', 'system'] as const).map(tab => (
              <button
                key={tab}
                className={cn(
                  "px-3 py-1 rounded text-sm transition-colors",
                  filter === tab
                    ? "bg-lcars-orange text-black"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                )}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Message Cards */}
          {filteredMessages.map(message => (
            <MessageCard
              key={message.id}
              message={message}
              isSelected={selectedMessage === message.id}
              onClick={() => setSelectedMessage(message.id)}
            />
          ))}
        </div>

        {/* RIGHT: Message Detail */}
        <div className="w-1/2 pl-4 flex flex-col">
          {selectedMessage ? (
            <MessageDetail
              messageId={selectedMessage}
              onReply={() => openReplyModal(selectedMessage)}
              onDelete={() => deleteMessage(selectedMessage)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a message to view details
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
```

---

## 6. UX Patterns

### 6.1 Turn Phase Awareness System

**Critical Missing Feature:** Players need to know which phase they're in and what actions are available.

**Collapsible Phase Indicator Implementation:**

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
      { label: '⚔️ Launch Attacks', href: '/game/military' },
      { label: '🏗️ Build Units', href: '/game/military?tab=build' },
      { label: '💬 Diplomacy', href: '/game/diplomacy' },
      { label: '📊 Review Intel', href: '/game/starmap' },
      { label: '🔬 Research', href: '/game/research' },
      { label: '📈 Trade', href: '/game/market' },
    ],
    canEndTurn: true,
  },
];
```

### 6.2 Actionable Guidance System

**Problem:** Players see warnings but don't know how to solve them.

**Solution:** Convert passive warnings into actionable prompts.

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
      href: "/game/sectors?type=agriculture",
      icon: ShoppingCart,
      variant: "primary"
    },
    {
      label: "Buy Food from Market",
      href: "/game/market?resource=food&action=buy",
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
  message="Empire 'Vexar Coalition' is Fearful and has weak defenses at Sector Antares V."
  actions={[
    {
      label: "Launch Attack",
      onClick: () => openAttackInterface('vexar', 'antares-v'),
      icon: Swords,
      variant: "primary"
    },
    {
      label: "Demand Tribute",
      href: "/game/diplomacy?action=demand&target=vexar",
      icon: Coins,
      variant: "secondary"
    },
    {
      label: "View on Map",
      href: "/game/starmap?focus=vexar",
      icon: Map,
      variant: "secondary"
    }
  ]}
/>

// Research milestone
<ActionPrompt
  severity="info"
  icon={Sparkles}
  message="Research complete! Fundamental Research Level 2 unlocked."
  actions={[
    {
      label: "View New Upgrades",
      href: "/game/research#upgrades",
      icon: Zap,
      variant: "primary"
    }
  ]}
/>
```

### 6.3 Strategic Visual Language

**Anticipation → Action → Payoff Pattern**

**Tier 1: Anticipation (Pre-Action State)**

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

**Tier 2: Payoff (Post-Action State)**

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

**Tier 3: Threat/Warning (Attention State)**

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

### 6.4 Resource Flow Visualization

**Show connections between sectors → resources → units:**

```tsx
export function ResourceFlowDiagram() {
  return (
    <div className="relative p-6 bg-black/30 rounded-lg">
      <svg className="w-full h-64">
        {/* Sectors → Resources */}
        <g id="sector-to-resource">
          <line x1="50" y1="50" x2="200" y2="100" stroke="#66CCFF" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>
          <text x="100" y="70" fill="#66CCFF" fontSize="12">+640/turn</text>
        </g>

        {/* Resources → Units */}
        <g id="resource-to-units">
          <line x1="200" y1="100" x2="350" y2="100" stroke="#FF9900" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>
          <text x="250" y="90" fill="#FF9900" fontSize="12">-500/turn</text>
        </g>

        {/* Nodes */}
        <circle cx="50" cy="50" r="20" fill="#99FFCC" />
        <text x="50" y="55" textAnchor="middle" fill="black" fontWeight="bold">4</text>
        <text x="50" y="90" textAnchor="middle" fill="white" fontSize="12">Agri Sectors</text>

        <circle cx="200" cy="100" r="20" fill="#66CCFF" />
        <text x="200" y="105" textAnchor="middle" fill="black" fontWeight="bold">640</text>
        <text x="200" y="140" textAnchor="middle" fill="white" fontSize="12">Food</text>

        <circle cx="350" cy="100" r="20" fill="#FF9900" />
        <text x="350" y="105" textAnchor="middle" fill="black" fontWeight="bold">1.2M</text>
        <text x="350" y="140" textAnchor="middle" fill="white" fontSize="12">Population</text>
      </svg>
    </div>
  );
}
```

---

## 7. Animation & Motion

### 7.1 Animation Strategy

**Hybrid Approach: CSS for Simple, GSAP for Complex**

**CSS Transitions - Use For:**
- Hover states
- Focus states
- Simple show/hide
- Color changes
- Opacity fades

**GSAP Timelines - Use For:**
- Combat sequences
- Turn transitions
- Star map interactions
- Multi-step animations (3+ steps)
- Complex easing curves

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
```css
/* Micro-interactions: 100-200ms */
.button {
  transition: background-color 150ms ease;
}

/* UI elements: 200-300ms */
.panel {
  transition: transform 250ms ease-out;
}

/* Page transitions: 300-500ms (max) */
.page-transition {
  transition: opacity 400ms ease-in-out;
}

/* Never exceed 500ms for UI animations */
```

**Common Tailwind Animation Classes:**

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

### 7.3 GSAP Implementation Guide

**Installation:**

```bash
npm install gsap
```

**Example: Combat Animation Sequence**

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

  return tl; // Return timeline for external control (pause, reverse, etc.)
}
```

**Example: Turn Transition**

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

**Always check user preferences:**

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

**Utility Function:**

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

**Usage:**

```tsx
<span className="font-mono text-2xl">{formatNumber(1_234_567)}</span>
// Output: "1.2M"

<span className="text-lcars-green">{formatChange(5_400)}</span>
// Output: "+5.4K"

<span>{formatPercentage(0.8542, 0)}</span>
// Output: "85%"
```

### 8.2 Charts & Graphs

**Win Probability Bar:**

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

**Resource Trend Line (Mini Chart):**

```tsx
export function ResourceTrendLine({ history }: { history: number[] }) {
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min;

  const points = history.map((value, index) => {
    const x = (index / (history.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const isPositiveTrend = history[history.length - 1] > history[0];

  return (
    <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={isPositiveTrend ? '#99FFCC' : '#FF6666'}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
```

---

## 9. Accessibility

### 9.1 Keyboard Navigation

**All interactive elements must be keyboard accessible:**

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

// ✅ GOOD - Divs with proper role and keyboard handling
<div
  role="button"
  tabIndex={0}
  className="..."
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Card content
</div>
```

**Keyboard Shortcuts:**

```tsx
// Global keyboard shortcuts
useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    // Don't trigger if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'b':
        router.push('/game/military?action=build');
        break;
      case 'a':
        router.push('/game/military?action=attack');
        break;
      case 'm':
        router.push('/game/starmap');
        break;
      case 'r':
        router.push('/game/research');
        break;
      case 'd':
        router.push('/game/diplomacy');
        break;
      case 'escape':
        closeAllModals();
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
// ✅ GOOD - Descriptive labels
<button aria-label="Launch attack on Empire Vexar Coalition">
  <Swords className="w-4 h-4" />
</button>

<div aria-label="Combat power: 45,200 units">
  45.2K
</div>

// Live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {turnStatus}
</div>

<div aria-live="assertive" aria-atomic="true">
  {criticalAlert}
</div>
```

**Semantic HTML:**

```tsx
// ✅ GOOD - Use semantic elements
<nav aria-label="Main navigation">
  <Link href="/game">Dashboard</Link>
  <Link href="/game/starmap">Star Map</Link>
</nav>

<main>
  <h1>Empire Dashboard</h1>
  <section aria-labelledby="resources-heading">
    <h2 id="resources-heading">Resources</h2>
    {/* content */}
  </section>
</main>

<aside aria-label="Messages">
  {/* sidebar content */}
</aside>
```

### 9.3 Color Contrast

**WCAG AA Compliance:**

All text must meet minimum contrast ratios:
- Normal text (< 18px): 4.5:1
- Large text (≥ 18px): 3:1

```tsx
// ✅ GOOD - High contrast combinations
<div className="bg-background-space text-white">
  // Contrast ratio: 15.1:1 ✅
</div>

<div className="bg-slate-900 text-slate-300">
  // Contrast ratio: 8.2:1 ✅
</div>

// ❌ BAD - Low contrast
<div className="bg-slate-800 text-slate-600">
  // Contrast ratio: 2.1:1 ❌ Fails WCAG
</div>
```

**Don't rely on color alone:**

```tsx
// ❌ BAD - Color only
<span className="text-green-500">+1,500</span>
<span className="text-red-500">-800</span>

// ✅ GOOD - Color + Symbol/Text
<span className="text-lcars-green">+1,500</span>
<span className="text-lcars-red">-800</span>

// Even better - use icons
<span className="text-lcars-green flex items-center gap-1">
  <TrendingUp className="w-4 h-4" />
  +1,500
</span>
```

### 9.4 Mobile Responsiveness

**Touch Targets:**

Minimum touch target size: 44x44px (iOS guideline)

```tsx
// ✅ GOOD - Large enough for touch
<button className="px-6 py-3 min-h-[44px] min-w-[44px]">
  Tap Me
</button>

// ❌ BAD - Too small
<button className="p-1">
  <X className="w-3 h-3" />
</button>

// ✅ GOOD - Icon button with proper padding
<button className="p-3" aria-label="Close">
  <X className="w-5 h-5" />
</button>
```

**Responsive Breakpoints:**

```tsx
// Mobile-first approach
<div className="
  // Mobile (default)
  flex flex-col p-4

  // Tablet (768px+)
  md:flex-row md:p-6

  // Desktop (1024px+)
  lg:grid lg:grid-cols-3 lg:p-8

  // Wide (1280px+)
  xl:grid-cols-4
">
  Content
</div>
```

---

## 10. Testing Conventions

### 10.1 data-testid Naming Convention

**Pattern:** `[area]-[component]-[identifier]-[action]`

```tsx
// Sector card in sector list
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

// Research branch card
<div data-testid="research-branch-soldiers">
  <input data-testid="research-branch-soldiers-allocation-slider" />
  <button data-testid="research-branch-soldiers-fund-button">Fund</button>
</div>
```

**Rules:**
- Use kebab-case
- Be specific (avoid generic names like "button" or "select")
- Include context (what page/section?)
- For dynamic IDs, use the actual ID (empire name, sector name, etc.)

### 10.2 Playwright E2E Test Selectors

```typescript
// Use data-testid for reliable selectors
const attackButton = page.getByTestId('combat-interface-attack-button');
await attackButton.click();

// For dynamic content, use partial matches
const sectorCard = page.getByTestId(/^sector-card-/);
await expect(sectorCard).toBeVisible();

// Prefer data-testid over text content (text may change with i18n)
// ❌ BAD
await page.getByText('Launch Attack').click();

// ✅ GOOD
await page.getByTestId('combat-interface-attack-button').click();
```

---

## 11. Implementation Guide

### 11.1 Tech Stack

**Required Dependencies:**

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "d3": "^7.8.5",
    "gsap": "^3.12.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/d3": "^7.4.3",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

### 11.2 Tailwind Configuration

**Complete tailwind.config.ts:**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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

**Add to `app/layout.tsx`:**

```tsx
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
        {children}
      </body>
    </html>
  );
}
```

### 11.4 Utility Functions

**Create `src/lib/ui/utils.ts`:**

```typescript
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

---

## Related Documents

- **[Frontend Developer Manual](frontend-developer-manual.md)** - Technical implementation guide, architecture patterns, server actions
- **[PRD.md](../PRD.md)** - Product requirements and game mechanics specifications
- **[BOT-SYSTEM.md](BOT-SYSTEM.md)** - Bot AI architecture and emotional states
- **[GAME-DESIGN.md](../core/GAME-DESIGN.md)** - Core game design philosophy

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-11 | Consolidated from UI_DESIGN.md, UI-DESIGN.md, UX-ROADMAP.md. Incorporated approved design decisions. |
| 1.0 | 2024-12-28 | Initial UI_DESIGN.md creation |

---

**End of Document**
