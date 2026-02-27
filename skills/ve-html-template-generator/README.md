# VE HTML Template Generator Skill

Quick guide for using `ve-html-template-generator`.

## What to provide in the prompt

Minimum required inputs:

- `client`: client slug (example: `yeti`)
- `html`: local HTML path (preferred) or URL

Minimal prompt:

```text
Use $ve-html-template-generator.
client: yeti
html: /Users/you/Downloads/yeti-location-source.html
```

## Optional inputs

- `customRoot`: defaults to `packages/visual-editor/src/components/custom/<client>`
- `starterRoot`: defaults to `starter/src/templates/<client>`
- `scope`: what to include/exclude from source page
- `notes`: constraints for slot structure, component behavior, etc.

Example with optional inputs:

```text
Use $ve-html-template-generator.
client: acme
html: /tmp/acme-homepage.html
scope: Exclude legal policy bands and cookie modal markup.
notes:
- Split every heading/body/cta into focused nested slots.
- Lock generated slot surfaces for editing-only use (`allow={[]}` on all section and nested layout slot renders).
- Keep hours entity-defaulted.
- If source has multiple hours bands (for example store + drive-thru), generate separate entity-bound hours slots for each band.
- Do not use any sibling client templates under `starter/src/templates/*` or sibling custom client folders under `packages/visual-editor/src/components/custom/*` as reference; derive structure from source HTML + shared VE components only.
- Nearby Stores/Locations should follow shared NearbyLocations-style dynamic behavior, not hardcoded static store links.
- Build client-local slots/atoms by adapting the closest shared generic baseline first, then layer client-specific changes.
- For FAQ/Q&A bands, adapt shared FAQ behavior patterns first (question/answer modeling + interaction), then restyle to match source.
- For footer social links, baseline against shared `FooterSocialLinksSlot` behavior (platform-specific fields + URL validation + icon rendering), not text-link lists.
- Decompose location summary content into nested focused slots (back-link, heading/meta, status, CTA), not one omnibus summary slot.
- For user-visible copy props, use `translatableString` (or entity-backed string fields) so embedded fields work; reserve plain `text` fields for URLs/class names/ids.
- Ignore likely hidden utility labels from HTML in nav/footer (for example `Top Links`, `Actions`, `Menu`) unless there is source evidence they are visibly rendered.
- Any CTA-like label must have an actionable link/href (or CTA entity). Never render CTA labels as plain non-interactive text.
- Compose complex layouts grid-first using shared Core Information/slot baselines, then wrap into client-bespoke section/slot names.
- Use shared map/image patterns (no map iframes, no backgroundImageUrl text fields).
- Keep functionality first: preserve entity wiring (especially hours) and real map behavior before visual refinements.
- Match header/footer chrome to the source site (dark or light) and preserve readable contrast.
- Include source-theme header/footer background options (for example source brand blue), not only white/neutral choices.
- Use full-bleed hero/promo shells only when source sections are edge-to-edge (`px-0 md:px-0` + `max-w-none`).
- Render rich text slots via `resolveComponentData` output (React element or string), not html-only parsing.
- If source has media + list sections (for example amenities with a lead image), keep a dedicated media slot plus list/content slots.
- When merging similar sections, keep optional slots (like CTA slots) and add top-level show/hide toggles instead of removing those slots.
- For sections with multiple slots, expose top-level show/hide toggles for most slots (`slot count - 1` coverage target).
- When store-info includes hours/location/map/parking, preserve stacked order (`Hours -> Location -> Map -> Parking`) unless source evidence clearly differs.
```

## What the skill generates

Under `packages/visual-editor/src/components/custom/<client>/`:

- `atoms/*.tsx`
- `components/*Section.tsx`
- `components/*Slot.tsx`
- `index.ts`
- `ve.ts`

Under `packages/visual-editor/src/components/categories/`:

- `<Client>SectionsCategory.tsx`
- `<Client>SlotsCategory.tsx`

Shared package registration updates:

- `packages/visual-editor/src/components/configs/mainConfig.tsx` (visible `<client>Sections` + hidden `<client>Slots` category wiring)
- `packages/visual-editor/src/components/categories/index.ts` (category exports)
- `packages/visual-editor/src/components/index.ts` (generated client exports)

Under `starter/src/templates/<client>/`:

- `<client>-config.tsx`
- `<client>-template.tsx`

Starter is a consumer-only wrapper. It should not be the source of truth for generated sections/slots/atoms.

## Validate output

Run validator:

```bash
python3 skills/ve-html-template-generator/scripts/validate_client_template.py --client-path starter/src/templates/<client>
```

Optional screenshot smoke test scaffold:

```bash
python3 skills/ve-html-template-generator/scripts/scaffold_client_template_smoke_test.py \
  --client-slug <client> \
  --template-path starter/src/templates/<client>/<client>-template.tsx \
  --config-path starter/src/templates/<client>/<client>-config.tsx
```

Run generated smoke test:

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.smoke.test.tsx
```

On first run for a newly generated test, seed screenshot baselines:

```bash
pnpm -C packages/visual-editor exec vitest run --update \
  src/components/generated/<Client>Template.smoke.test.tsx
```

Smoke screenshots should capture full page height so lower-page sections (for example footer/legal) are validated.

Default source-vs-generated section parity scaffold (captures source HTML and generated section screenshots):

```bash
python3 skills/ve-html-template-generator/scripts/scaffold_client_template_section_parity_test.py \
  --client-slug <client> \
  --html-path /path/to/source.html \
  --config-path starter/src/templates/<client>/<client>-config.tsx \
  --overwrite
```

Run section parity test:

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

For first-time baseline capture of a new generated parity test, run once with `--update`.

This section parity run is now the default post-generation step for the skill.
After the initial parity run, apply one focused correction pass immediately, then rerun smoke + section parity.
After those reruns, run final build checks before considering the task done:

```bash
pnpm -C packages/visual-editor build
pnpm -C starter build
```

Default behavior for this skill is now: `generate -> parity -> correction pass -> rerun -> build gate`.

Optional section parity controls:

```bash
CLIENT_TEMPLATE_SECTION_PARITY_LIMIT=10 \
CLIENT_TEMPLATE_SECTION_PARITY_ALL_VIEWPORTS=1 \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

Optional full-page parity scaffold:

```bash
python3 skills/ve-html-template-generator/scripts/scaffold_client_template_visual_parity_test.py \
  --client-slug <client> \
  --html-path /path/to/source.html \
  --config-path starter/src/templates/<client>/<client>-config.tsx \
  --overwrite
```

Run parity test:

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.visual-parity.test.tsx
```

For first-time baseline capture of a new generated parity test, run once with `--update`.

Screenshot parity should stay advisory-first: use it to find layout/media/styling gaps, but keep shared baseline functionality and slot wiring intact.
By default, parity should drive one focused correction pass, not open-ended restyling loops.

## From-scratch verification

Use this before evaluating a new generation:

1. Clear or avoid old saved layout data for the target entity (`document.__.layout`).
2. Open editor and drag the new client sections from left nav.
3. Verify header/footer nested slots are clickable/editable (brand/nav/utility, signup/links/legal).
4. Verify default values are visible in the props panel before edits.

Old saved layouts from earlier generations can hide or distort current slot behavior.
