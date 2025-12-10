# Goals Screen UI Documentation

## Overview

The Goals Screen is the main interface for displaying learning progress in a Quranic study application. It presents a single learning goal (Juz') with visual progress tracking, achievement metrics, and an interactive grid of individual learning units. The screen combines educational gamification with a clean, accessible design optimized for mobile-first learning experiences.

---

## Screen Layout & Structure

The Goals Screen follows a vertical, single-column layout optimized for mobile devices with the following hierarchy:

1. **Header Area** - Achievements metrics row
2. **Goal Card** - Primary goal information and context
3. **Content Area** - Progress bar and units grid (side-by-side layout)
4. **Background** - Soft gradient with decorative pattern

### Visual Hierarchy
- Goal Header is the most prominent visual element
- Achievements Row provides quick status overview
- Units Grid is the primary interactive component
- Vertical Progress Bar provides constant visual feedback on completion status

---

## Component Breakdown

### 1. Achievements Row

**Purpose:** Display key learning metrics at a glance

**Metrics Displayed:**
1. **Stars** - Total earned achievement points
   - Icon: Star (4x4 units, filled)
   - Color: Accent (Golden Yellow)
   - Value: Numeric count (e.g., 128)

2. **Streak** - Consecutive learning days
   - Icon: Flame (4x4 units)
   - Color: Warning (Orange)
   - Value: Numeric count (e.g., 7)

3. **Recitations/Gems** - Practice sessions completed
   - Icon: Gem/Diamond (4x4 units, filled)
   - Color: Secondary (Teal/Cyan)
   - Value: Numeric count (e.g., 45)

4. **Goals Completed** - Completed learning objectives
   - Icon: Trophy (4x4 units)
   - Color: Accent (Golden Yellow)
   - Value: Numeric count (e.g., 1)

**Design Details:**
- Gap between items: 1rem (16px)
- Icon size: 16px × 16px (4 units × 4 units)
- Text size: Small (14px)
- Text weight: Bold
- Margin bottom: 1rem (16px)

---

### 2. Goal Header Card

**Purpose:** Identify the current learning goal and provide context

**Content:**
- **Title:** Goal name (e.g., "Juz' 30")
  - Size: 24px
  - Weight: Bold
  - Color: White
  
- **Subtitle:** Context information (e.g., "37 Surahs · 564 Ayat")
  - Size: 16px
  - Weight: Normal
  - Color: White with 90% opacity (slightly muted)

**Background:**
- **Gradient:** Teal/Cyan gradient (135° angle)
  - Start color: Primary (Teal: HSL 160° 84% 39%)
  - End color: Secondary (Cyan: HSL 180° 65% 55%)
  
- **Pattern Overlay:** Islamic geometric pattern
  - Opacity: 30%
  - White color
  - Subtle, non-intrusive decoration

**Spacing:**
- Padding: 1.5rem (24px) all sides
- Margin bottom: 1.5rem (24px)
- Border radius: Large (1rem / 16px)

---

### 3. Vertical Progress Bar

**Purpose:** Visual representation of overall learning progress

**Components:**
1. **Trophy Icon**
   - Icon: Trophy
   - Color: Accent (Golden Yellow)
   - Size: 24px × 24px
   - Position: Above progress bar
   - Margin below: 0.75rem (12px)

2. **Progress Track**
   - Shape: Capsule (fully rounded)
   - Width: 0.5rem (8px)
   - Height: 600px (fixed, tall)
   - Background: Secondary with 30% opacity (light teal)
   - Fills from bottom to top

3. **Progress Indicator**
   - Color: Primary (Teal)
   - Shape: Matches track (capsule)
   - Height: Percentage-based
   - Animation: Smooth transition (500ms duration)

**Spacing:**
- Right padding from grid: 1rem (16px)

---

### 4. Units Grid

**Purpose:** Display all individual learning units with status indicators

**Grid Properties:**
- Columns: 5
- Gap between items: 0.5rem (8px)
- Margin bottom: 1rem (16px)

**Unit Card Details:**

**Card Structure:**
- Shape: Perfect circle (aspect-ratio 1:1)
- Border: 2px solid (color varies by status)
- Shadow: Soft drop shadow
- Padding: 0.375rem (6px) internal spacing

**Content:**
- **Arabic Name**
  - Text size: 8px
  - Weight: Bold
  - Direction: Right-to-left (RTL)
  - Color: Inherits from status

- **English Name (Transliteration)**
  - Text size: 6px
  - Weight: Semi-bold
  - Color: Inherits from status

**Unit Status States:**

#### Completed Units
- **Background:** Success color with 10% opacity (light green)
- **Border:** Success color (green)
- **Text:** Success color (green)
- **Interactive:** Hover effect increases opacity to 20%
- **Special Indicator:** Diamond/Gem icon displayed in center

#### In-Progress Units
- **Background:** Blue with 10% opacity (light blue)
- **Border:** Blue color
- **Text:** Blue color
- **Interactive:** Hover effect increases opacity to 20%

#### Not-Started Units
- **Background:** Muted color with 50% opacity (gray)
- **Border:** Border color (light gray)
- **Text:** Muted foreground color
- **Opacity:** 60% reduced visibility

**Interaction:**
- Active state: Scale down to 95% (press effect)
- Transition duration: 200ms for all changes

---

## Design Tokens

### Color Palette

#### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary | HSL 160° 84% 39% (Teal) | Main gradient, progress bar, borders |
| Secondary | HSL 180° 65% 55% (Cyan) | Accents, gems, hover states |
| Accent | HSL 45° 100% 51% (Gold) | Stars, trophies, highlights |

#### Status Colors
| Token | Value | Usage |
|-------|-------|-------|
| Success | HSL 142° 71% 45% (Green) | Completed units |
| Warning | HSL 38° 92% 50% (Orange) | Streak/flame icon |
| Info | HSL 199° 89% 48% (Blue) | In-progress units |

#### Neutral Colors
| Token | Value | Usage |
|-------|-------|-------|
| Background | HSL 40° 20% 97% (Off-white) | Page background |
| Foreground | HSL 210° 20% 15% (Dark gray) | Primary text |
| Muted | HSL 40° 15% 90% (Light gray) | Secondary elements |

### Typography

#### Font Family
- **Primary Font:** Cairo (sans-serif)
- **Used for:** All text content
- **Fallback:** System sans-serif stack

#### Font Sizes
| Component | Size | Line Height |
|-----------|------|-------------|
| Goal Header Title | 24px (1.5rem) | Default |
| Goal Header Subtitle | 16px (1rem) | Default |
| Achievement Value | 14px (0.875rem) | Default |
| Unit Card Arabic | 8px | Tight (1.25) |
| Unit Card English | 6px | Tight (1.25) |

### Spacing

#### Space Scale (8px base)
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px (0.25rem) | Icon gaps, tight spacing |
| sm | 8px (0.5rem) | Grid gaps, card padding |
| md | 12px (0.75rem) | Component spacing |
| lg | 16px (1rem) | Padding, margins |
| xl | 24px (1.5rem) | Card padding, header margins |

### Responsive Behavior

The Goals Screen is optimized for mobile devices:

#### Screen Size Breakpoints
- **Mobile (default):** Full-width single column layout
- **Small (640px+):** Maintained single column, slightly wider content
- **Medium (768px+):** Optional: Side-by-side layout adjustment
- **Large (1024px+):** Optional: Expanded grid with increased spacing

#### Responsive Adjustments
1. **Container Width:** Max width of 28rem (448px) on all screens
2. **Padding:** 1rem (16px) horizontal padding on all sides
3. **Grid Columns:** Always 5 columns (unit cards scale with viewport)
4. **Progress Bar:** Height remains fixed (600px) for consistency
5. **Font Sizes:** Remain fixed (designed for mobile-first)

---

## Accessibility

### WCAG 2.1 Compliance

#### Color Contrast
All text elements meet minimum contrast ratios:
- **Large text (18px+):** 3:1 ratio (AA standard)
- **Normal text:** 4.5:1 ratio (AA standard)
- **UI components:** 3:1 ratio (AA standard)

#### Non-Color Dependent Information
- Status is indicated by both color AND border styling
- Completed units have success color border (green)
- In-progress units have blue border
- Not-started units have gray border with reduced opacity
- Diamond icon serves as additional visual indicator

#### Text Accessibility
- Bilingual text (Arabic + English) provides multiple language options
- RTL support for Arabic text
- Font sizes chosen for readability
- Bold weights increase readability

#### Interactive Elements
- All clickable units have clear focus states
- Minimum touch target size: 44px × 44px
- Unit cards support keyboard navigation
- Clear visual feedback on interaction

#### Language Support
- Full RTL support for Arabic text
- LTR support for English transliteration
- Clear language directionality in markup
- Both languages equally important in design

---

## States & Interactions

### Unit Card States

#### Default State
- Static appearance with assigned colors
- Soft shadow visible
- Text clearly readable

#### Hover State
- Background opacity increases (10% → 20%)
- Cursor changes to pointer
- For completed units: Diamond icon opacity increases to 100%

#### Active/Press State
- Card scales to 95% of original size
- Immediate visual feedback

#### Completed Unit with Diamond
- **Faded Diamond:** Gray color (opacity 30%)
- **Hover Diamond:** Transitions to Secondary color with full opacity
- **Icon Size:** 28px × 28px

### Progress Bar Animation
- Fills from bottom to top
- Smooth transition duration: 500ms
- Ease-out timing function

---

## Version Information

**Current Version:** v1.0

**Components Documented:**
- Achievements Row
- Goal Header
- Vertical Progress Bar
- Units Grid
- Unit Cards

**Design System Included:**
- Complete color palette
- Typography scale
- Spacing system
- Animation specifications
- Responsive guidelines
- Accessibility requirements
