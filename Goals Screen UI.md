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

**Visual Description:**
- Horizontal row of four metric cards
- Centered alignment with equal spacing between items
- Compact, clean presentation

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

**Visual Description:**
- Rounded rectangular card with prominent gradient background
- Contains layered decorative pattern overlay
- White text for strong contrast

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

**Shadow:** Strong depth shadow

---

### 3. Vertical Progress Bar

**Purpose:** Visual representation of overall learning progress

**Visual Description:**
- Vertical bar positioned to the left of the units grid
- Tall, narrow track showing the percentage of completed units
- Trophy icon at the top as a visual anchor

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
   - Fills from bottom to top (not top to bottom)

3. **Progress Indicator**
   - Color: Primary (Teal)
   - Shape: Matches track (capsule)
   - Height: Percentage-based (e.g., 8.11% for 3/37 units)
   - Animation: Smooth transition (500ms duration)

**Spacing:**
- Right padding from grid: 1rem (16px)

---

### 4. Units Grid

**Purpose:** Display all individual learning units with status indicators

**Visual Description:**
- Five-column grid layout
- Circular unit cards with bilingual labels
- Color-coded status indicators
- Interactive elements with hover states

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
  - Centered alignment
  - Color: Inherits from status

- **English Name (Transliteration)**
  - Text size: 6px
  - Weight: Semi-bold
  - Centered alignment
  - Opacity: 70%
  - Color: Inherits from status

**Unit Status States:**

#### Completed Units
- **Background:** Success color with 10% opacity (light green)
- **Border:** Success color (green)
- **Text:** Success color (green)
- **Interactive:** Hover effect increases opacity to 20%
- **Special Indicator:** 
  - Diamond/Gem icon displayed in the center
  - Only on the first completed unit (oldest)
  - Faded appearance (opacity 30%) in default state
  - Transitions to full secondary color on hover
  - Icon size: 28px × 28px
  - Smooth color/opacity transition on hover

#### In-Progress Units
- **Background:** Blue with 10% opacity (light blue)
- **Border:** Blue color
- **Text:** Blue color
- **Interactive:** Hover effect increases opacity to 20%
- **Visual Indicator:** 
  - Pencil mascot animation positioned over unit
  - External element (not part of card itself)

#### Not-Started Units
- **Background:** Muted color with 50% opacity (gray)
- **Border:** Border color (light gray)
- **Text:** Muted foreground color
- **Opacity:** 60% reduced visibility
- **Interactive:** Limited interactivity appearance

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
| Secondary | HSL 180° 65% 55% (Cyan) | Accents, gems/gems, hover states |
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
| Muted Foreground | HSL 210° 15% 45% (Gray) | Secondary text |
| Border | HSL 40° 20% 88% (Light gray) | Borders, dividers |

#### Gradients
| Token | Value | Usage |
|-------|-------|-------|
| Primary Gradient | Teal → Cyan (135° angle) | Goal header background |
| Soft Gradient | Light off-white → off-white (180° vertical) | Page background |
| Gold Gradient | Gold → Orange (135° angle) | Optional accent elements |

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

#### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Subtitles, descriptive text |
| Semi-bold | 600 | Card English names |
| Bold | 700 | Titles, achievement values, card Arabic names |

### Spacing

#### Space Scale (8px base)
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px (0.25rem) | Icon gaps, tight spacing |
| sm | 8px (0.5rem) | Grid gaps, card padding |
| md | 12px (0.75rem) | Component spacing |
| lg | 16px (1rem) | Padding, margins |
| xl | 24px (1.5rem) | Card padding, header margins |

#### Specific Measurements
- Card internal padding: 6px (0.375rem)
- Grid gap: 8px (0.5rem)
- Component gap: 16px (1rem)
- Achievement icon-text gap: 6px (1.5)

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| Large | 16px (1rem) | Cards (Goal Header) |
| Medium | 14px | Calculated (lg - 2px) |
| Small | 12px | Calculated (lg - 4px) |
| Full | 100% | Circular elements (Unit Cards, Progress Bar) |

### Shadows

#### Shadow System
| Token | Value | Usage |
|-------|-------|-------|
| Soft | 0 2px 8px, Primary 8% opacity | Cards, subtle depth |
| Medium | 0 4px 16px, Primary 12% opacity | Elevated elements |
| Strong | 0 8px 24px, Primary 16% opacity | Goal Header, prominent elements |

### Transitions & Animations
| Property | Duration | Timing | Usage |
|----------|----------|--------|-------|
| Opacity | 200ms | ease-out | Icon fading, hover states |
| Color | 200ms | ease-out | State transitions |
| Scale | 200ms | ease-out | Interactive feedback |
| Height | 500ms | ease-out | Progress bar fill |

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
- All transitions smooth over 200ms

#### Active/Press State
- Card scales to 95% of original size
- Immediate visual feedback
- Indicates clickability

#### Completed Unit with Diamond
- **Faded Diamond:** Gray color (opacity 30%)
- **Hover Diamond:** Transitions to Secondary (Teal) color with full opacity (100%)
- **Icon Size:** 28px × 28px
- **Position:** Centered in the unit card

### Progress Bar Animation
- Fills from bottom to top (not traditional top-down)
- Smooth transition duration: 500ms
- Ease-out timing function for natural deceleration
- Updates when unit status changes

### Interaction Feedback
- All interactive elements provide immediate visual feedback
- Color changes, opacity shifts, and scale changes
- No lag or delayed responses
- Consistent 200ms transition duration for micro-interactions

---

## Responsive Behavior

### Mobile-First Design
The Goals Screen is optimized for mobile devices:

#### Screen Size Breakpoints
- **Mobile (default):** Full-width single column layout
- **Small (640px+):** Maintained single column, slightly wider content
- **Medium (768px+):** Optional: Side-by-side layout adjustment
- **Large (1024px+):** Optional: Expanded grid with increased spacing

#### Responsive Adjustments
1. **Container Width:** Max width of 28rem (448px) on all screens for optimal reading
2. **Padding:** 1rem (16px) horizontal padding on all sides
3. **Grid Columns:** Always 5 columns (unit cards scale with viewport)
4. **Progress Bar:** Height remains fixed (600px) for consistency
5. **Font Sizes:** Remain fixed (designed for mobile-first)

#### Touch Optimization
- Minimum touch target size: 44px × 44px (WCAG recommendation)
- Unit cards are ~60-70px on mobile (meet minimum)
- Gap between cards: 8px (prevents accidental taps)
- Hover states gracefully degraded to active states on touch devices

---

## Accessibility

### WCAG 2.1 Compliance

#### Color Contrast
All text elements meet minimum contrast ratios:
- **Large text (18px+):** 3:1 ratio (AA standard)
- **Normal text:** 4.5:1 ratio (AA standard)
- **UI components:** 3:1 ratio (AA standard)

**Specific Examples:**
- White text on teal gradient: Excellent contrast
- Gold on white: 4.5:1 contrast ratio
- Green on light green: Sufficient contrast for status indication

#### Non-Color Dependent Information
- Status is indicated by both color AND border styling
- Completed units have success color border (green)
- In-progress units have blue border
- Not-started units have gray border with reduced opacity
- Diamond icon serves as additional visual indicator

#### Text Accessibility
- Bilingual text (Arabic + English) provides multiple language options
- RTL support for Arabic text
- Font sizes chosen for readability (no text below 6px for critical content)
- Bold weights increase readability

#### Interactive Elements
- All clickable units have clear focus states
- Minimum touch target size: 44px × 44px
- Unit cards support keyboard navigation
- Clear visual feedback on interaction (hover, active states)

#### Semantic Hierarchy
1. Primary goal header (most important)
2. Achievement metrics (secondary context)
3. Progress bar (supporting information)
4. Individual units (primary interactive elements)

#### Icon Usage
- All icons paired with text or context
- Icons have aria-labels and descriptions for screen readers
- Icons are not sole indicators of functionality
- Diamond indicator paired with completion status

#### Language Support
- Full RTL support for Arabic text
- LTR support for English transliteration
- Clear language directionality in markup
- Both languages equally important in design

#### Touch & Motor Accessibility
- No elements require precise clicking
- Touch targets are appropriately sized
- No time-based interactions
- No content that flashes more than 3 times per second

### Additional Accessibility Features

#### Screen Reader Optimization
- Meaningful alt text for all icons
- Clear element descriptions
- Progress percentage announced clearly
- Achievement metrics identified with context

#### Keyboard Navigation
- All interactive elements accessible via keyboard
- Logical tab order (top to bottom, left to right)
- Focus states clearly visible
- No keyboard traps

#### Motion & Animation
- Animations respect prefers-reduced-motion setting
- Progress bar animation is smooth but not distracting
- Diamond icon transition is subtle
- No auto-playing animations with sound

#### Form & Input Accessibility
- Clear labels for all inputs
- Error messages clearly associated with fields
- Required fields indicated
- Instructions clear and accessible

---

## Visual Design System

### Background Gradient
The page uses a soft gradient background:
- **Direction:** Vertical (180°)
- **Start:** Light off-white (HSL 40° 30% 98%)
- **End:** Slightly darker off-white (HSL 40° 20% 95%)
- **Purpose:** Subtle depth without distraction

### Islamic Pattern Overlay
A decorative geometric pattern is applied as a background element:
- **Placement:** Behind main content
- **Opacity:** 30% (very subtle)
- **Color:** Primary teal
- **Purpose:** Cultural aesthetic and visual interest
- **Responsive:** Scales with viewport

### Visual Hierarchy through Size
1. Goal Header: Largest and most prominent
2. Achievement metrics: Secondary attention
3. Unit cards: Primary interactive focus
4. Progress bar: Supporting visual element

### Visual Hierarchy through Color
1. **Attention colors:** Gold (accent), Primary green (progress)
2. **Interactive colors:** Secondary blue (gems), Status colors
3. **Neutral colors:** Gray text, white backgrounds
4. **Reduced opacity:** Not-started units (secondary importance)

---

## Component Interaction Flow

### User Journey
1. **View Achievements** - Quick overview of progress metrics
2. **Understand Goal** - Read goal title and context in header
3. **Assess Progress** - Check vertical progress bar for completion percentage
4. **Browse Units** - Scan grid of available learning units
5. **Identify Review Opportunities** - Notice diamond on first completed unit
6. **Interact with Unit** - Tap unit to open or view details

### Visual Feedback Loop
- Action (tap unit) → Visual response (scale down 95%)
- Hover (desktop) → Background color deepens, interactions highlighted
- Progress change → Progress bar updates smoothly
- Unit completion → Status color changes, diamond appears

---

## Design Considerations for Developers

### Localization
- Full RTL support required for Arabic content
- Font selection supports Arabic glyphs
- Spacing accounts for different text lengths
- Icons remain language-agnostic

### Performance
- Smooth animations (60fps target)
- No jank on scroll or interaction
- Optimized background patterns
- Efficient re-renders on status changes

### Scalability
- Grid accommodates any number of units
- Progress bar scales with unit count
- Typography system scales without modification
- Color tokens support theme switching

### Testing Guidance
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify color contrast with tools
- Test touch on actual mobile devices
- Verify RTL rendering
- Test keyboard navigation completely

---

## Notes for Cross-Platform Implementation

### iOS Implementation
- Respect system font size settings
- Support Dynamic Type for accessibility
- Use native shadow rendering for performance
- Implement haptic feedback on interactions
- Test with VoiceOver

### Android Implementation
- Respect system font scale
- Use Material Design shadows
- Implement proper ripple effects
- Support TalkBack for accessibility
- Test with various screen densities

### Web Implementation
- Maintain CSS-based styling for theme switching
- Support CSS custom properties for theming
- Implement smooth CSS transitions
- Ensure responsive without media queries where possible
- Use semantic HTML for accessibility

---

## Version History
- **v1.0** - Initial Goals Screen documentation
- **Components Documented:** Achievements Row, Goal Header, Vertical Progress Bar, Units Grid, Unit Cards
- **Design Tokens:** Complete color, typography, and spacing system
- **Accessibility:** Full WCAG 2.1 AA compliance documentation

---

## References & Resources

For implementation questions, refer to:
- Color token definitions in the design system
- Typography scale for consistent sizing
- Spacing scale for consistent margins and padding
- Animation durations for consistent timing
- Shadow definitions for consistent depth
