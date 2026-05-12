# Cafe Portal — Design Reference

Extracted from the approved design HTML (Cafe Portal v2.4).
Use this as the single source of truth for all UI work on the cafe portal.

---

## Fonts

| Role | Family | Weight | Notes |
|------|--------|--------|-------|
| UI sans-serif (default) | `Instrument Sans` | 400, 500, 600, 700 | All body, labels, nav, tables |
| Display / editorial | `Instrument Serif` | 400 (italic) | Page headlines (`<em>` portions only) |
| Monospace / data | `JetBrains Mono` | 400, 500 | Order IDs, numeric codes, kbd shortcuts |

### Google Fonts import
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Font feature settings
```css
font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
font-feature-settings: "ss01", "cv11", "ss03";
-webkit-font-smoothing: antialiased;
text-rendering: optimizelegibility;
```

### Semantic classes
```css
.serif  → font-family: 'Instrument Serif', serif; font-weight: 400; letter-spacing: -0.01em;
.mono   → font-family: 'JetBrains Mono', monospace; font-feature-settings: "ss02";
.tnum   → font-variant-numeric: tabular-nums;  /* all financial figures */
```

---

## Colour Palette (CSS variables)

### Backgrounds & surfaces
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F4F6FB` | App background, page fill |
| `--surface` | `#FFFFFF` | Cards, panels, inputs |
| `--surface-warm` | `#F9FAFD` | Hover rows, warm card fill, filter pills |

### Ink (text & icons)
| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#0E1330` | Primary text, headings, amounts |
| `--ink-2` | `#2A315A` | Secondary text, table rows |
| `--ink-3` | `#5E6689` | Tertiary / labels / meta |
| `--ink-4` | `#8E96B6` | Placeholder, disabled, timestamps |
| `--ink-5` | `#C4CBE2` | Borders on interactive elements |

### Lines / dividers
| Token | Value |
|-------|-------|
| `--line` | `#E3E7F2` |
| `--line-2` | `#EEF1F8` |

### Accent (primary brand blue)
| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#2B5BE5` | CTA buttons, active nav, links |
| `--accent-soft` | `#E4ECFE` | Active nav bg, chip bg, selected row |
| `--accent-ink` | `#1E45B8` | Text on accent-soft bg |

### Semantic status
| Token | Value | Soft | Usage |
|-------|-------|------|-------|
| `--ok` | `#1E8F5A` | `#D9F3E5` | Delivered, on-time, positive trend |
| `--warn` | `#B47A1A` | `#FBEFD1` | Delayed, low stock, payment pending |
| `--danger` | `#C83D4E` | `#FADFE2` | Cancelled, critical, negative trend |
| `--info` | `#2B5BE5` | `#E4ECFE` | In transit, informational |

### Supplier avatar colour palette (cyclic)
```
c-1: bg #E4ECFE, text #1E45B8, border #CFD BFC (blue)
c-2: bg #D9F3E5, text #166B44, border #BFE8D3 (green)
c-3: bg #FBEFD1, text #8F5F10, border #F3E0B2 (amber)
c-4: bg #F0E4FB, text #6B2AB8, border #E1D1F4 (purple)
c-5: bg #FADDE2, text #A03145, border #F4C9CE (red)
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `6px` | Small badges, checkboxes, kbd |
| `--radius-sm` | `8px` | Buttons, toolbar items, row actions |
| `--radius-md` | `10px` | Cards inner, filter pills, search |
| `--radius-lg` | `14px` | Cards, KPI tiles |
| `--radius-xl` | `18px` | Large modal panels |
| `999px` | Pill | Buttons (primary), chips, status badges |

---

## Shadows

```css
--shadow-1: 0 1px 0 rgba(28,27,25,0.03), 0 1px 2px rgba(28,27,25,0.04);   /* cards resting */
--shadow-2: 0 1px 0 rgba(28,27,25,0.04), 0 8px 24px -12px rgba(28,27,25,0.10); /* cards elevated */
```

Hover shadow (accent-tinted):
```css
box-shadow: rgba(43, 91, 229, 0.18) 0px 8px 24px -12px;
```

---

## Layout

### Overall shell
```
Sidebar: 248px fixed left, full height, white, 1px right border
Content area: padding-left 248px, max-width 1200px, auto centered
Page padding: 0 32px, bottom 56px
Top bar: sticky, height 64px, frosted glass blur(12px)
```

### Grid system
- KPI row: `repeat(4, 1fr)` gap 20px
- Main 2-col: `1fr 1fr` gap 20px
- Triple col: `1.35fr 0.95fr 0.9fr` gap 20px
- Supplier grid: `repeat(3, 1fr)` gap 18px
- Supplier layout (sidebar + content): `260px 1fr` gap 24px
- Order stats bar: `repeat(5, 1fr)` no gap

---

## Typography Scale

| Element | Size | Weight | Color | Letter-spacing |
|---------|------|--------|-------|----------------|
| Page greeting (sans) | 34px | 500 | `--ink` | -0.022em |
| Page greeting (serif em) | 40px | 400 italic | `--accent` | -0.01em |
| Section heading (h3) | 15px | 600 | `--ink` | -0.005em |
| Panel heading | 15px | 600 | `--ink` | -0.005em |
| KPI value | 34px | 500 | `--ink` | -0.025em |
| KPI unit | 17px | 500 | `--ink-3` | -0.01em |
| Order stat value | 22px | 500 | `--ink` | -0.02em |
| Chart value | 30px | 500 | `--ink` | -0.025em |
| Featured heading | 26px | 500 | white | -0.018em |
| Supplier name in card | 15px | 600 | `--ink` | -0.008em |
| Supplier stat value | 15px | 600 | `--ink` | -0.015em |
| Table heading | 11px | 500 | `--ink-4` | 0.08em UPPERCASE |
| Table body | 13px | 400 | `--ink-2` | — |
| Row primary | 13.5px | 500 | `--ink` | — |
| Row secondary | 12px | 400 | `--ink-3` | — |
| Nav item | 13.5px | 500 | `--ink-2` | — |
| Section label | 10.5px | 500 | `--ink-4` | 0.1em UPPERCASE |
| Eyebrow label | 10.5px | 500 | `--ink-4` | 0.12em UPPERCASE |
| Status badge | 11.5px | 500 | (semantic) | 0.005em |
| Trend badge | 11.5px | 500 | (semantic) | — |
| Chip | 12.5px | 400 | `--ink-2` | — |
| Summary / body | 14.5px | 400 | `--ink-3` | — |
| Page footer | 11.5px | 400 | `--ink-4` | — |
| Order ID | 12px mono | 500 | `--ink` | 0.01em |
| Kbd shortcut | 10.5px mono | 400 | `--ink-4` | 0.02em |
| KPI title | 12.5px | 500 | `--ink-3` | 0.005em |

---

## Component Specs

### Sidebar
```
Width: 248px, position fixed, height 100vh
Background: white, border-right: 1px solid --line
Brand section: padding 4px 8px 18px, border-bottom --line-2, margin-bottom 14px
Brandmark: 32px × 32px, border-radius 10px, blue radial-gradient
Section labels: 10.5px, 500, --ink-4, 0.1em uppercase
Nav items: 8px 10px padding, border-radius 9px, gap 11px
  - Active: background --accent-soft, color --accent-ink, left 3px --accent bar
  - Hover: background --surface-warm
Badge (count): 11px, bg --line-2, padding 1px 7px, radius 999px
Active badge: bg --accent, color white
Outlet dots: 8px circle, d-1=blue, d-2=green, d-3=amber
Footer: border-top --line-2, user card with --surface-warm bg
```

### Top bar
```
Height: 64px, sticky top-0, z-index 40
Background: rgba(244,246,251,0.85) + backdrop-filter saturate(160%) blur(12px)
Border-bottom: 1px solid --line
Search: min-width 260px, height 36px, radius 999px, bg --surface
Icon buttons: 36px circle, bg --surface, border --line
Primary CTA "Urgent Search": height 38px, radius 999px, gradient #3E6CF0→--accent
  - box-shadow: inset white 0 1px 0, accent 0 4px 12px -2px
```

### KPI Card
```
Padding: 20px 22px 22px
Border-radius: --radius-lg (14px)
Border: 1px solid --line, bg --surface, shadow-1
Hover: border-color #C9D2EB, shadow accent-tinted
Accent variant: 2px top bar in --accent colour
KPI value: 34px, weight 500, letter-spacing -0.025em
Sparkline: height 28px, full width, margin-top 14px
Trend pill: 2px 7px padding, radius 999px
  up → ok-soft bg, ok text
  down → danger-soft bg, danger text
```

### Status Badges
```
padding: 3px 9px 3px 8px, radius 999px, 11.5px 500
dot: 6px circle
ok      → bg --ok-soft, color --ok
warn    → bg --warn-soft, color --warn
danger  → bg --danger-soft, color --danger
info    → bg --info-soft, color --info
neutral → bg --line-2, color --ink-3
accent  → bg --accent-soft, color --accent-ink
```

### Delivery row (Overview - Today's deliveries)
```
Grid: 36px 1.6fr 1fr 1fr auto, gap 12px
Padding: 14px 22px
Border-bottom: 1px solid --line-2
Hover: background --surface-warm
Supplier mark: 36px × 36px, radius 10px
ETA: 13px weight 500, small in --ink-3
```

### Orders table
```
Header: 11px, 500, --ink-4, 0.08em uppercase, --surface-warm bg, sticky
Body cells: 13px, --ink-2, padding 14px 16px
Row hover: background --surface-warm
Selected row: background #EFF4FF, border-bottom-color #D6E0FC
Checkbox: 16px, radius 4px, 1.5px border --ink-5
Order ID: 12px JetBrains Mono, weight 500
Amount: weight 500, --ink, tabular-nums
```

### Order stats bar (Orders page)
```
5-column grid, border 1px --line, radius 14px, overflow hidden
Each stat: padding 16px 20px, border-right --line-2
Key: 11px weight 500 --ink-3, 0.03em spacing
Value: 22px weight 500 --ink, -0.02em spacing
```

### Tab row (Orders page)
```
Border-bottom: 1px --line, padding 0 6px
Tab: padding 10px 14px, 13px weight 500 --ink-3
Active: border-bottom 2px solid --ink, color --ink
Count badge: 11px, bg --line-2, padding 1px 6px, radius 999px
```

### Supplier card
```
Radius: 14px, border: 1px --line, padding: 20px 20px 16px
Hover: translateY(-1px), border #C9D2EB, shadow accent-tinted
Preferred: gradient bg #F4F8FF→white, border #CFD9FC, 2px top --accent bar
Supplier mark: 44px × 44px, radius 11px
Name: 15px weight 600 --ink, -0.008em
Stats section: 3-col grid, border-top/bottom --line-2, padding 12px 0
Stat key: 10.5px, --ink-4, 0.06em uppercase
Stat value: 15px weight 600 --ink, -0.015em
Stars: filled = --accent, empty = --ink-5
Performance bar: 5px height, --ok fill, --line-2 bg
Footer buttons: height 32px, radius 8px
  Primary (Order): bg --ink, color white
  Secondary (Contact): bg --surface, border --line
```

### Featured supplier card (dark hero)
```
Full-width (grid-column: 1 / -1)
Background: linear-gradient(135deg, #1C1B19 0%, #2A2724 100%)
Radius: 16px, padding: 28px 32px
Color: #FBFAF7
Eyebrow: 10.5px, 0.12em, uppercase, --accent color
Heading: 26px weight 500, -0.018em; em in Instrument Serif italic
Sub: 13.5px, rgba(white, 0.65)
Ambient glow: radial-gradient top-right, rgba(107,143,255,0.35)
CTA primary: bg --accent, color white
CTA ghost: rgba(white, 0.06) bg, white border rgba(white,0.12)
Meta grid: 2×2, key 10.5px rgba(white,0.45) uppercase; value 18px white 500
```

### Supplier sidebar (filter)
```
Width: 260px, sticky top 84px
Side link: padding 7px 10px, radius 8px, 13px --ink-2
Active: bg --ink, color white
Side groups: margin-bottom 22px, h5 10.5px uppercase --ink-4
```

### Quick action cards (Overview bottom-right)
```
2-col grid, gap 10px, padding 16px
Card: 14px padding, radius 10px, bg --surface-warm, border --line
  min-height 92px, gap 8px flex col
Icon: 28px × 28px, radius 8px, bg --surface, border --line
Title: 13px weight 600 --ink, -0.005em
Sub: 11.5px --ink-3, line-height 1.4
Primary card: gradient bg #3E6CF0→--accent, accent border, white text
  shadow: rgba(43,91,229,0.4) 0 6px 18px -6px
Hover: translateY(-1px), accent shadow
```

### Order detail drawer
```
Width: 520px, fixed right, border-left: 1px --line
Box-shadow: rgba(28,27,25,0.25) -20px 0 60px -20px
Scrim: rgba(28,27,25,0.35)
Transition: translateX cubic-bezier(0.2, 0.8, 0.2, 1) 0.28s
Head: padding 20px 24px, border-bottom --line
  Eyebrow: 10.5px 500 --ink-4 0.1em uppercase
  Title: 20px 500 --ink -0.015em
  Sub: 12.5px --ink-3
Body: padding 20px 24px, overflow-y auto
Section: padding 16px 0, border-top --line-2
KV grid: 110px 1fr, gap 8 16, keys --ink-3, values --ink 500
Timeline: left 5px bar, nodes 9px circle
  done → --ok, active → --accent + ring
```

### Progress / stock bar
```
Height: 3px (orders), 6px (stock)
Background: --line-2
Fill: ok → --ok, warn → --warn, danger → --danger, accent → --accent
Threshold marker: 1.5px --ink-3 at 60% opacity, label "THRESHOLD" above
```

### Recurring pre-orders calendar widget
```
Cal widget: 32×36px, radius 7px, border --line, bg --surface-warm
Month: 8.5px weight 600, --accent, 0.1em uppercase
Day: 14px weight 600 --ink
Row: 3-col grid (cal 32px, 1fr, auto), gap 12px, padding 12px 22px
```

---

## Motion / Transitions

| Element | Duration | Easing |
|---------|----------|--------|
| Nav hover bg | 120ms | linear |
| Button hover | 150ms | linear |
| Card hover | 200ms | linear |
| KPI hover border | 200ms | linear |
| Drawer slide | 280ms | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Trend progress bar | 600ms | linear |
| Pulse animation | 2000ms | ease-in-out infinite |
| Button active press | scale 0.98 / translateY 1px | — |

---

## Scrollbar
```css
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: #D2D9EC; border-radius: 8px; border: 2px solid var(--bg); }
::-webkit-scrollbar-track { background: transparent; }
```

---

## Focus ring
```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
```

---

## Design Principles (from the design)

1. **Type pairing**: Instrument Sans for data/UI, Instrument Serif italic only for the accent phrase in page titles. Never mix serif into body or tables.
2. **Tabular numbers everywhere money/counts appear**: `font-variant-numeric: tabular-nums`
3. **Status colours are semantic**: never use ok/warn/danger for decorative purposes
4. **Accent blue is single**: `#2B5BE5` is the only interactive accent. No orange/amber in this portal (that's Grabit).
5. **Supplier marks use cyclic 5-colour system** (c-1 through c-5) for visual differentiation.
6. **Dark featured card** (Nandini Dairy Kitchen-style) is reserved for the #1 preferred partner slot only.
7. **Dense data layout**: rows have 14px vertical padding at normal density, 10px compact, 18px roomy.
8. **Frosted glass topbar**: always `backdrop-filter: saturate(160%) blur(12px)`.
9. **No pure black**: darkest is `#0E1330` (--ink). Background never pure white — it's `#F4F6FB`.
10. **Cards breathe**: KPI cards have 20px 22px padding; panels use 18px 22px for heads.
