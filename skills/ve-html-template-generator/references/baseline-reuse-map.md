# Baseline Reuse Map

Use this map before writing client-local atoms/slots/sections. Pick the closest shared baseline, then copy/adapt it into `packages/visual-editor/src/components/custom/<client>/...`.

## Why

- Client output should stay isolated from shared runtime registrations.
- But implementation quality should still match proven shared patterns.
- "New client component" should usually mean "client-local copy of a proven baseline plus client-specific changes", not an entirely novel shell.

## Baseline Selection

- Nearby locations bands:
  - Section baseline: `packages/visual-editor/src/components/pageSections/NearbyLocations/NearbyLocations.tsx`
  - Slot baseline: `packages/visual-editor/src/components/pageSections/NearbyLocations/NearbyLocationsCardsWrapper.tsx`
  - Expect dynamic radius/limit + coordinate-driven lookup, not hardcoded nearby-store links.
- FAQ / Q&A bands:
  - Section baseline: `packages/visual-editor/src/components/pageSections/FAQsSection/FAQsSection.tsx`
  - Card baseline: `packages/visual-editor/src/components/pageSections/FAQsSection/FAQCard.tsx`
  - Reuse shared FAQ data/functionality patterns first (question/answer rich text behavior, card/list structure, interaction model), then style to source visuals.
- Hours blocks:
  - Baseline: `packages/visual-editor/src/components/contentBlocks/HoursTable.tsx`
  - Expect `field: "hours"` entity defaults.
  - For multiple hours bands (store/drive-thru/lobby), create separate entity-bound hours slots per band.
- Maps/directions:
  - Baseline families: map patterns already used in shared VE (`MapboxStaticMapComponent`, `getDirections`).
  - Avoid static iframe embeds and hardcoded one-off map URLs.
- Media/image slots:
  - Baseline: shared image resolution + wrapper patterns (`resolveYextEntityField`, `getImageUrl`, `ImageWrapper`-style behavior).
- Multi-slot info bands:
  - Baselines: `CoreInfoSection`, `AboutSection`, `VideoSection`.
  - For complex/irregular bands, start with shared grid/core-info composition patterns, then wrap into client-bespoke section names and focused slots.
- CTA/link slots:
  - Baseline: shared CTA slot ergonomics (show/hide toggles at section level for optional actions).
  - Baseline implementation: `packages/visual-editor/src/components/contentBlocks/CtaWrapper.tsx`
  - Every CTA label should map to actionable link/href/cta data; do not render CTA labels as plain text spans.
- Footer social links:
  - Baseline: `packages/visual-editor/src/components/footer/FooterSocialLinksSlot.tsx`
  - Expect platform-specific social fields, URL validation, and icon-based rendering (not plain text social link lists).

## Slot/Atom Reuse Rules

- Prefer adapting existing shared slot APIs first; only diverge when source fidelity requires it.
- Keep slot composition nested and concern-focused.
- For optional content in merged sections, keep the slot and gate with show/hide toggles.
- Keep generated slots non-nestable (`allow={[]}`) because they are editor surfaces, not arbitrary content containers.
- For FAQ/Q&A sections, prioritize shared FAQ interaction and data-shape behavior over bespoke one-off card models.
- Suppress likely hidden utility nav headings (for example `Top Links`, `Actions`, `Menu`) unless source evidence confirms they are visibly rendered.

## Nearby Stores Rule

When source includes a "Nearby Stores/Locations" area on a location template:

- Do not seed static links as the primary behavior.
- Model after shared NearbyLocations behavior:
  - radius + limit controls
  - coordinate/document-driven lookup
  - dynamic card/list rendering
- If source has a short static fallback list, keep it optional and clearly secondary to dynamic lookup.
