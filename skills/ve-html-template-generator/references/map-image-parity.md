# Map and Image Parity

Use this reference to keep generated client templates consistent with existing shared VE component behavior.

## Map Parity Baseline

Prefer these shared patterns:

- `packages/visual-editor/src/components/pageSections/StaticMapSection.tsx`
- `packages/visual-editor/src/components/contentBlocks/MapboxStaticMap.tsx`
- `packages/visual-editor/src/components/contentBlocks/Address.tsx` (`getDirections` usage)

Required map rules:

- For location templates, prefer `MapboxStaticMapComponent` with coordinate entity defaults:
  - `coordinate.field: "yextDisplayCoordinate"`
- If a static map embed is not available, use `getDirections(...)` links derived from address/entity data.
- Render a real map surface (shared map component/static map image) for map bands; do not use faux coordinate placeholder cards.
- Do not hardcode map provider URLs in defaults.
- Do not use raw `iframe` map embeds for core map blocks.
- Do not model map preview as a generic `mapImage` content field by default.
- Do not seed map defaults with hero/promo marketing imagery.

## Image Parity Baseline

Prefer these shared patterns:

- `packages/visual-editor/src/components/pageSections/HeroSection.tsx`
- `packages/visual-editor/src/components/pageSections/PromoSection/PromoSection.tsx`
- `packages/visual-editor/src/components/contentBlocks/image/Image.tsx` (`ImageWrapper`)
- `packages/visual-editor/src/components/pageSections/heroVariants/SpotlightHero.tsx`

Required image rules:

- Background images should be modeled as `data.backgroundImage` entity fields:
  - `type: "entityField"`
  - `filter.types: ["type.image"]`
- Resolve background images at render-time via shared image resolver patterns:
  - `resolveYextEntityField(...)`
  - `getImageUrl(...)`
- Do not use plain URL text controls for core background image sources:
  - avoid `backgroundImageUrl` fields in `styles`/`data`
- Image slots should follow `ImageWrapper`-style data shapes:
  - `data.image` is an image entity field
  - width/aspect-ratio style controls
  - safe empty-state behavior if image data is missing

## Default Data Guidance

- For image defaults, include URL + dimensions so previews render immediately.
- Keep image defaults entity-compatible (constant by default, entity toggle available).
- For location templates, avoid store-specific hardcoded map URLs in defaults.
