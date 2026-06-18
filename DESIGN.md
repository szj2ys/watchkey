---
name: Aura Luxury Intelligence
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
  surface-elevation: rgba(255, 255, 255, 0.05)
  border-subtle: rgba(255, 255, 255, 0.1)
  text-muted: '#A1A1A1'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The design system is engineered to evoke a sense of "Quiet Luxury" and "Future Precision." It targets high-net-worth individuals and elite real estate professionals who value discretion, speed, and sophistication. The brand personality is authoritative yet ethereal—bridging the gap between the physical weight of luxury stone and the weightless intelligence of AI.

The design style is a hybrid of **Modern Minimalism** and **Glassmorphism**. It utilizes a deep, monochromatic foundation to allow high-end architectural photography to serve as the primary visual driver. UI elements are treated as "optical glass" overlays—ultra-thin, semi-transparent, and meticulously aligned to a strict grid. The aesthetic is "Sartorial Tech": it feels as bespoke and well-tailored as a high-end suit, avoiding the cluttered or neon-heavy tropes of standard AI products.

## Colors

The palette is strictly monochromatic to maintain a premium "Editorial" feel. True black (`#000000`) serves as the void—the primary background for high-impact hero sections. Secondary surfaces use a slightly lighter charcoal (`#121212`) to create subtle depth. 

Primary accents are pure white (`#FFFFFF`), used sparingly for critical text and high-contrast call-to-actions. To avoid visual fatigue, functional neutrals are achieved through opacity levels rather than grey hex codes; this ensures that background colors bleed through UI elements, maintaining the "Glassmorphism" effect. Chromatic color is strictly reserved for high-fidelity property imagery.

## Typography

This design system uses a dual-font strategy. **Plus Jakarta Sans** (substituted for Poppins for a more modern, premium geometric feel) handles all display and headline roles. Its tight tracking and high x-height convey modern intelligence. **Inter** is used for all functional body and utility text, providing maximum legibility at smaller scales.

For an "Editorial" touch in select pull-quotes or feature headings, a serif face like **Source Serif 4** can be used as a secondary accent. All headlines should prioritize negative letter-spacing to appear "locked" and architectural.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop, centered within a 1440px container. It utilizes a 12-column structure with generous gutters to create a sense of breathing room and "gallery" space. 

Vertical rhythm is expansive; sections are separated by significant gaps (120px+) to ensure the user focuses on one concept at a time. On mobile, the grid collapses to 1 column with 20px margins, emphasizing a vertical "feed" of high-impact visuals. Content should be vertically center-aligned within hero sections to maintain a cinematic balance.

## Elevation & Depth

Depth is not communicated through shadows, but through **Tonal Layering** and **Transparency**. 

1.  **Base Layer:** True black (#000000).
2.  **Surface Layer:** Semi-transparent white overlays (5-8% opacity) with a background blur (20px to 40px). 
3.  **Accents:** Thin, 1px borders using `rgba(255, 255, 255, 0.1)` define the boundaries of cards and inputs.

This "Glassmorphism" creates a sense of light passing through the interface, preventing the dark UI from feeling heavy or oppressive.

## Shapes

The shape language is **Soft (0.25rem)**. This design system avoids aggressive roundedness or "bubbly" buttons to maintain its professional, high-end architectural feel. 

Rectilinear forms dominate. Large layout containers (like hero images or section blocks) should remain sharp (0px) to align with screen edges, while interactive elements like buttons and cards use the subtle 4px (Soft) radius to provide a hint of approachability and modern refinement.

## Components

### Buttons
Primary buttons are solid White with Black text, using `label-sm` typography (all-caps). They should have a "Ghost" hover state where the background becomes transparent with a thin white border.

### Cards
Cards are constructed using the "Surface Layer" logic: a 5% white fill with a 20px backdrop-blur and a 1px `border-subtle`. No shadows. Content inside cards should have generous internal padding (32px).

### Input Fields
Inputs are bottom-border only or fully enclosed with a `border-subtle`. The background should be a slightly darker tint or fully transparent. Placeholder text uses `text-muted`.

### Chips / Tags
Small, pill-shaped outlines with `label-sm` text. Used for property categories (e.g., "PENTHOUSE", "OFF-MARKET").

### Imagery
All imagery should use a subtle dark gradient overlay (linear, top-to-bottom) to ensure white text remains legible regardless of the photo's brightness.