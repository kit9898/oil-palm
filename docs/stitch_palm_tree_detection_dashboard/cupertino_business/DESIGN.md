# Design System Document: High-End B2B Editorial

## 1. Overview & Creative North Star: "The Digital Architect"
This design system moves beyond the generic "SaaS dashboard" to create a bespoke, high-end editorial experience. Our Creative North Star is **The Digital Architect**: a philosophy that treats data as structural art. 

We reject the "boxed-in" nature of traditional B2B interfaces. Instead of rigid grids and heavy borders, we utilize **intentional asymmetry**, **tonal depth**, and **expansive white space** to guide the user’s eye. The interface should feel like a premium physical workspace—layered, tactile, and profoundly quiet. We prioritize clarity over density, ensuring every metric feels like a curated insight rather than a line item.

---

## 2. Colors: Tonal Atmosphere
We use a sophisticated palette that mimics natural light falling on high-end materials. 

### The Palette
*   **Primary (Brand):** `#0058bc` (The Signature Blue) - Reserved for high-intent actions.
*   **Surface (Background):** `#f9f9fb` - Our "Canvas."
*   **Surface Container Lowest:** `#ffffff` - Used for primary content cards to create "pop."
*   **Surface Container High:** `#e8e8ea` - Used for recessed areas or navigation sidebars.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. 
Boundaries must be defined solely through background color shifts. To separate a sidebar from a main feed, transition from `surface-container-high` to `surface`. To separate a card, place a `surface-container-lowest` object on a `surface` background. The eye should perceive a change in depth, not a drawn line.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers:
1.  **Level 0 (Base):** `surface` (#f9f9fb)
2.  **Level 1 (Sections):** `surface-container-low` (#f3f3f5)
3.  **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff)
4.  **Level 3 (Overlays):** Glassmorphism (see below).

### The "Glass & Gradient" Rule
To elevate main CTAs or Hero Metrics, use a subtle "Atmospheric Gradient" transitioning from `primary` (#0058bc) to `primary-container` (#0070eb) at a 135-degree angle. For floating navigation or tooltips, apply `surface-container-lowest` with a 70% opacity and a `backdrop-blur: 20px` to create a frosted-glass effect.

---

## 3. Typography: Editorial Authority
We utilize the San Francisco style (Inter) to convey a sense of technical precision and premium Swiss design.

*   **Display (Large Scale):** Use `display-lg` (3.5rem) for hero metrics. It should feel "oversized" to create a focal point of authority.
*   **Headline (The Hook):** `headline-md` (1.75rem) with tight letter-spacing (-0.02em) for section titles.
*   **Body (The Narrative):** `body-lg` (1rem) for standard reading. Ensure a line-height of 1.6 for maximum breathability.
*   **Label (The Metadata):** `label-md` (0.75rem) in `on-surface-variant` (#414755) with ALL CAPS and 0.05em tracking for a "technical" aesthetic.

**Visual Identity Tip:** Use "Asymmetric Emphasis." If a headline is large and bold, the supporting body text should be significantly smaller and lighter to create a high-contrast, editorial hierarchy.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to simulate light; we use tonal shifts to simulate material.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift (the "Paper-on-Table" effect).
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 88, 188, 0.04)`. Note the subtle blue tint in the shadow—this mimics natural refraction and feels more "organic" than grey.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` (#c1c6d7) at **15% opacity**. It should be felt, not seen.
*   **Roundedness Scale:** 
    *   **Cards/Sections:** `DEFAULT` (1rem / 16px) for a soft, approachable feel.
    *   **Buttons/Inputs:** `full` (9999px) to provide a distinct interactive shape against the rectangular cards.

---

## 5. Components: Refined Interaction

### Buttons
*   **Primary:** Atmospheric Gradient (Primary to Primary-Container), `full` radius, white text. No shadow on rest; subtle `0 4px 12px` blue-tinted shadow on hover.
*   **Tertiary:** No background, `primary` text. Focus state uses a `surface-container-high` background pill.

### Cards & Metrics (The B2B Core)
*   **The Metric Card:** Forbid divider lines. Use a `3` (1rem) spacing gap between the label and the value.
*   **The Data Grid:** Instead of table lines, use alternating `surface` and `surface-container-low` row backgrounds. Use `headline-sm` for the "Hero Metric" inside the card to create a clear entry point.

### Sliders & Controls
*   **Refined Sliders:** The track should be `surface-container-highest`. The active fill is `primary`. The thumb must be a `surface-container-lowest` circle with a subtle `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`.

### Input Fields
*   **Field Style:** Use a "Minimalist Tray" approach. Background: `surface-container-low`. Radius: `sm` (0.5rem). On focus, transition background to `surface-container-lowest` and add a 1px "Ghost Border."

---

## 6. Do's and Don'ts

### Do
*   **Do** use vertical white space (Spacing `8` or `12`) to separate major dashboard sections instead of lines.
*   **Do** let typography "breathe." If a card feels crowded, remove content rather than shrinking text.
*   **Do** use `surface-variant` for non-interactive background elements to create a sophisticated "industrial" feel.

### Don't
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#1a1c1d) to maintain the premium, soft-contrast feel.
*   **Don't** use standard "Drop Shadows." If an element isn't floating (like a modal), it shouldn't have a shadow. Use Tonal Layering instead.
*   **Don't** use "Alert Red" for everything negative. Use `tertiary` (#9e3d00) for a more sophisticated, "Burnt Orange" warning tone that feels high-end, only moving to `error` (#ba1a1a) for critical system failures.