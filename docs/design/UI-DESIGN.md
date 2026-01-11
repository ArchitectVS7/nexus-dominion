# UI Design Guide

> This document covers the visual design system for Nexus Dominion.

---

## Design Aesthetic

Nexus Dominion uses an **LCARS-inspired** design aesthetic (Library Computer Access/Retrieval System), featuring:

- Rounded rectangular panels
- Bold color blocks with high contrast
- Futuristic, sci-fi terminal feel
- Clean typography with clear hierarchy

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Amber** | `#F59E0B` | Primary actions, highlights |
| **Cyan** | `#06B6D4` | Information, links |
| **Purple** | `#8B5CF6` | Secondary actions |
| **Red** | `#EF4444` | Warnings, combat |

### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Space** | `#0F172A` | Main background |
| **Panel Dark** | `#1E293B` | Card backgrounds |
| **Panel Light** | `#334155` | Elevated elements |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | `#F8FAFC` | Main text |
| **Secondary** | `#94A3B8` | Muted text |
| **Accent** | `#F59E0B` | Highlighted values |

---

## Typography

- **Font Family**: System sans-serif (optimized for screen)
- **Headings**: Bold, larger sizes, amber or white
- **Body**: Regular weight, high contrast
- **Numbers**: Monospace for data readability

```tsx
// Example typography classes
<h1 className="text-2xl font-bold text-amber-400">Empire Dashboard</h1>
<p className="text-slate-300">Current resources and status</p>
<span className="font-mono text-lg text-white">12,450</span>
```

---

## Component Patterns

### Panel Card

```tsx
<div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
  <h2 className="text-lg font-bold text-amber-400 mb-3">Panel Title</h2>
  <div className="space-y-2">
    {/* Content */}
  </div>
</div>
```

### Action Button

```tsx
<button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors">
  Primary Action
</button>

<button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors">
  Secondary Action
</button>
```

### Data Display

```tsx
<div className="flex justify-between items-center py-2 border-b border-slate-700">
  <span className="text-slate-400">Credits</span>
  <span className="font-mono text-lg text-amber-400">1,234,567</span>
</div>
```

### Status Indicator

```tsx
// Positive
<span className="text-green-400">+15%</span>

// Negative
<span className="text-red-400">-8%</span>

// Neutral
<span className="text-slate-400">0%</span>
```

---

## Data-TestId Convention

All interactive elements must have `data-testid` attributes for E2E testing:

```tsx
<button data-testid="attack-button">Launch Attack</button>
<input data-testid="quantity-input" type="number" />
<div data-testid="battle-result">{result}</div>
```

### Naming Convention

- Use kebab-case: `buy-sector-button`
- Be specific: `attack-target-select` not just `select`
- Include context: `combat-preview-power` not just `power`

---

## Responsive Design

- **Desktop-first**: Primary target is desktop browsers
- **Minimum width**: 1024px for full experience
- **Mobile**: Simplified views where applicable

---

## Related Documents

- [Frontend Guide](FRONTEND-GUIDE.md) - React patterns
- [Architecture Guide](ARCHITECTURE.md) - Project structure
