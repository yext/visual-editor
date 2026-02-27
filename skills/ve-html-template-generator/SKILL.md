---
name: ve-html-template-generator
description: Generate isolated client-specific Yext Visual Editor templates from existing website HTML by decomposing a page into bespoke atoms, slot components, and section components, then producing package-scoped custom component files under packages/visual-editor/src/components/custom/client-slug plus client template/config files under starter/src/templates/client-slug. Use when asked to create or update a client template from downloaded HTML, view-source markup, or exported page snapshots (Step 1 of the client-template epic).
---

# VE HTML Template Generator

## Enforce Client Isolation

Treat every client template as fully isolated from shared/generic VE components.

Required isolation rules:

- Generate client-specific atoms, sections, slot components, and category/config files.
- Generate new client-specific header and footer sections even when shared versions appear identical.
- Do not import or register shared categories/components/atoms in client generated files.
- Do not read, copy, or adapt any sibling client templates under `starter/src/templates/*` or sibling custom client folders under `packages/visual-editor/src/components/custom/*` (except the target client being generated/updated).
- Never use another client template as a starting scaffold. Baselines come from shared/generic VE components in `packages/visual-editor/src/components/...` plus the target source HTML only.
- Keep custom atoms/slots/sections under `packages/visual-editor/src/components/custom/<client>/...`.
- Keep starter files minimal: only `starter/src/templates/<client>/<client>-config.tsx` and `starter/src/templates/<client>/<client>-template.tsx`.

## Default Assumptions

Assume these defaults unless the user explicitly overrides them:

- Generate client-only atoms, sections, categories, config, and template files.
- Recreate header/footer as client-owned sections.
- Use slot-first section architecture (`sections compose slot children`).
- Default hours content to entity mode (`field: "hours"`, not hard-coded weekly constants).
- Default non-hours content to constant mode unless user explicitly requests KG-first defaults.
- Do not expose atoms in the left nav; expose sections only.
- Create exactly one visible client-specific section category in the left nav.
- Create one hidden client-specific slot category in config.
- Use custom implementation root `packages/visual-editor/src/components/custom/<client>`.
- Do not modify shared/generic VE section/slot implementations, but do update shared package registries for the new client category wiring.
- Do not add or depend on `registerMainConfigExtension`/runtime mainConfig mutation from `starter`.
- Run section-level screenshot parity by default after initial generation (report-first, no default diff gate).
- Prioritize functionality/usability over visual similarity (entity wiring, slot editability, map/hours behavior) when tradeoffs are required.

## Minimal Prompt Contract

Treat these as the only required user inputs:

- `client`: client slug (example: `yeti`)
- `html`: local HTML file path or URL

If the user provides only `client` and `html`, proceed with all defaults in this skill and do not ask for additional setup questions.

Example minimal invocation:

```text
Use $ve-html-template-generator.
client: yeti
html: /path/to/yeti-homepage.html
```

## Collect Inputs

Gather these inputs before coding:

- Client slug (example: `yeti`)
- Source HTML file path (preferred) or page URL
- Custom implementation root (`packages/visual-editor/src/components/custom/<client>`) unless overridden
- Starter wrapper root (`starter/src/templates/<client>`) unless overridden
- Scope boundaries (for example: "exclude only legal/policy fragments")

If only a URL is provided, fetch once and save a local snapshot:

```bash
curl -L "<url>" -o /tmp/<client>-page.html
```

## Build Section Plan

Create a first-pass section breakdown from the HTML:

```bash
python3 scripts/extract_page_sections.py \
  --input /tmp/<client>-page.html \
  --output /tmp/<client>-sections.json
```

Review the JSON and adjust obvious bad splits before generating components.

Favor one horizontal band per component. Keep sections small and cohesive.
Derive the section list from source evidence, not prior client templates.

Before coding, produce a quick source-evidence map:

- planned section -> source selector/snippet (heading/copy/image/link evidence)
- include only sections that have source evidence (or explicit user request)
- infer page archetype from HTML (`location-detail`, `marketing`, etc.) and only include archetype-appropriate sections (do not auto-insert FAQ/store-info bands unless source supports them)

Before coding sections, run normalization guidance from
`references/section-normalization.md` to:

- split over-aggregated slots into focused concerns
- merge structurally duplicate sections into one reusable section with toggles/presets

## Generate Template Files

Create exactly this shape for each client:

- `packages/visual-editor/src/components/custom/<client>/atoms/*.tsx`
- `packages/visual-editor/src/components/custom/<client>/components/<SectionName>Section.tsx`
- `packages/visual-editor/src/components/custom/<client>/components/<SlotName>Slot.tsx`
- `packages/visual-editor/src/components/custom/<client>/index.ts`
- `packages/visual-editor/src/components/custom/<client>/ve.ts`
- `packages/visual-editor/src/components/categories/<Client>SectionsCategory.tsx`
- `packages/visual-editor/src/components/categories/<Client>SlotsCategory.tsx`
- `starter/src/templates/<client>/<client>-config.tsx`
- `starter/src/templates/<client>/<client>-template.tsx`

Follow `references/template-contract.md` for naming, registration, and assembly.

## Generate Section Components

Follow `references/ve-field-patterns.md` for all prop and field conventions.
Follow `references/slot-paradigm.md` for section and slot composition.
Follow `references/section-normalization.md` for slot decomposition and duplicate-section merge decisions.
Follow `references/layout-containment.md` for section shell and slot containment rules.
Follow `references/map-image-parity.md` for map/image parity with existing shared VE components.
Follow `references/baseline-reuse-map.md` to select shared baselines for client-local atoms/slots/sections.

When generating inside this repository, mirror these implementation patterns:

- `packages/visual-editor/src/components/pageSections/VideoSection.tsx` (slot-based section shell)
- `packages/visual-editor/src/components/pageSections/CoreInfoSection.tsx` (multi-slot section and default slot props)
- `packages/visual-editor/src/components/pageSections/AboutSection/AboutSection.tsx` (multi-column slot layout and slot rendering behavior)
- `packages/visual-editor/src/components/contentBlocks/HoursTable.tsx` (hours entity field defaults)

Required conventions:

- Define section props with `styles` and hidden `slots`.
- Define slot fields with `{ type: "slot" }` and `visible: false`.
- Render content through slot children (`<slots.<Name>Slot allow={[]} />`) instead of hard-coded inline structures.
- Render slot children with `style={{ height: "auto" }}` unless there is a specific, justified alternative.
- For slot components that compose child slots (for example header/footer layout slots), apply the same lock-down rule on every nested slot render: `allow={[]}` plus `style={{ height: "auto" }}`.
- Generated slots are for structured prop editing, not free-form nesting; do not leave any generated slot render permissive.
- Keep slots concern-specific; avoid combined slot names such as `HoursLocationSlot`.
- Decompose textual concerns aggressively: heading/subheading/body/legal text/each CTA should be separate slots by default.
- Decompose CTA concerns aggressively: each CTA (primary vs secondary) should be its own slot rather than embedded in text slots.
- For sections with 2+ slots, expose top-level `show...` controls for most slots (target coverage: slot count minus one, or higher).
- For user-visible non-entity copy inputs, use `translatableString` fields (embedded-field capable), not plain `text`/`textarea` inputs.
- Keep plain `text` inputs for infrastructure-only values (for example URLs, class names, ids, API keys, numeric query params), not rendered copy.
- Header/footer must be nested slot trees, not terminal omnibus slots:
  - section shell slot(s) -> layout slot -> focused child slots (logo, nav links, utility links, CTA groups, legal groups)
  - avoid one-slot header/footer implementations that inline all text/links/buttons
- When source HTML includes likely hidden utility labels in nav/footer (for example `Top Links`, `Actions`, `Menu` headings), do not surface those as visible heading copy unless source evidence shows they are actually visible.
- Header/footer layout slots must be directly editable:
  - every layout slot `slots.<ChildSlot>` key must have populated `defaultProps.slots.<ChildSlot>` entries
  - do not leave any child slot empty when section defaults are instantiated
  - do not rely on runtime layout normalization/migrations to make header/footer slots editable
- If a section needs grouping, use a layout slot that composes child slots instead of one slot with many unrelated text/CTA fields.
- Ensure every slot `type` referenced in section `defaultProps.slots` is registered in client slot category components and included in `<client>-config.tsx` components.
- Do not use placeholder slot defaults (`props: {}`); populate full slot prop objects in section `defaultProps.slots`.
- For array fields in slot components, always provide `defaultItemProps` so newly added items are well-formed.
- Use `YextField(..., { type: "entityField", filter: ... })` for editable content props inside slot components.
- Use `entityField` only for supported/intentional types (for example `type.string`, `type.rich_text_v2`, `type.image`, `type.phone`, `type.hours`).
- Avoid `entityField` for `type.url`; use explicit URL fields (`text` or `translatableString`) unless a dedicated supported pattern is required.
- Represent content props as `YextEntityField<T>` (`field`, `constantValue`, `constantValueEnabled`).
- For any `YextEntityField<TranslatableString>` default, use localized constant objects (for example `{ en: "Heading", hasLocalizedValue: "true" }`) instead of plain string constants so right-panel defaults hydrate correctly.
- For any `YextEntityField<TranslatableRichText>` default, use localized constant objects that include `hasLocalizedValue: "true"` at the top level.
- Apply localized constant object rules consistently in `defaultProps`, array `defaultItemProps`, and any section-specific slot-prop overrides created via spread.
- For location-stream templates, default location-specific content (name/address/phone/hours) to entity mode or derive from entity fields; avoid hardcoded city/address/phone constants with empty field bindings.
- For location-stream templates, avoid hardcoded map/directions URLs in defaults; derive from address data at render-time or expose entity-backed fields.
- Map implementations should mirror shared VE behavior:
  - prefer `MapboxStaticMapComponent` with coordinate entity field defaults (`field: "yextDisplayCoordinate"`)
  - or use `getDirections`-derived links when embed providers are unavailable
  - render an actual map surface (static map image or shared map component), not a decorative placeholder panel
  - avoid `iframe` map embeds with hardcoded provider URLs
  - avoid `mapImage` fallback fields in map slots unless explicitly requested by the user
  - do not seed map slots with hero/promo marketing images as map defaults
- Background images should mirror shared hero/promo behavior:
  - use `data.backgroundImage` as `YextEntityField<...>` with `filter.types: ["type.image"]`
  - resolve at render-time via shared image resolution patterns (`resolveYextEntityField` + `getImageUrl`)
  - avoid `backgroundImageUrl` text fields in `styles` or `data`
- Image slots should mirror shared `ImageWrapper` behavior:
  - `data.image` entity field using `type.image`
  - style controls for width/aspect ratio/constrain behavior
  - render-safe empty state when image data is missing
- Resolve content through `resolveComponentData(..., locale, streamDocument)`.
- Use `EntityField` wrappers around rendered values that map to KG/static content.
- Include practical style props for text size, color, alignment, and spacing/background.
- Provide render-safe `defaultProps` that approximate source content.
- For hours-related slot components, default to entity hours (`field: "hours"`, `constantValueEnabled: false`).
- When source has multiple distinct hours bands (for example store hours + drive-thru hours), generate separate hours slots/components for each band (for example `StoreHoursSlot`, `DriveThruHoursSlot`), and keep each band entity-bound.
- Use defensive rendering in list/slot components (guard missing item structures instead of directly dereferencing nested `.field` paths).
- Merge duplicate sections with the same slot/style structure into a single reusable section and expose behavior differences as toggles (for example `showCTA`).
- When merging duplicate sections, keep the superset of optional slots (especially CTA/disclaimer/body variants) and control each optional slot with top-level show/hide toggles instead of removing slots.
- Any CTA-like label must map to an actionable CTA control (CTA/link/button with href/link action). Never render CTA labels as plain non-interactive text.
- Use baseline-first generation: copy/adapt proven shared section shell patterns into client-local files before inventing new section shells.
- Use baseline-first slot/atom generation too:
  - choose the closest shared slot/atom behavior by concern
  - copy/adapt into client-local files
  - only invent new slot/atom APIs when source fidelity requires it
- Prefer grid-first composition when source layout is complex: assemble with shared grid/core-info atoms/slots first, then wrap that composition into client-bespoke named sections with focused slot labels.
- For FAQ/Q&A bands, baseline against shared FAQ implementations first (`FAQsSection` + FAQ card patterns), then adapt styling/layout to match source visuals.
- Nearby stores/location clusters should follow shared NearbyLocations behavior (dynamic lookup from document coordinate/radius/limit) rather than static hardcoded link lists.
- Footer social link groups should follow shared `FooterSocialLinksSlot` behavior (platform-specific fields + URL validation + icon rendering), not generic text-link lists.
- Do not keep location summary or hero summary content in one omnibus slot; use nested layout slots with focused child slots (back-link, heading/address/meta, status, CTA group).
- In multi-column sections, apply containment-safe wrappers (`overflow-hidden` at section content level, `min-w-0` on columns, no absolute positioning for core content blocks).
- If a section exposes `styles.textColor`, avoid hardcoded slot text color classes (for example `text-white`) that neutralize that control; use inherited color or slot-level style props.
- For header/footer slots, avoid hardcoded white/light text and border utility classes (`text-white`, `text-white/..`, `text-neutral-100`, `border-white/...`) that can conflict with section backgrounds; use inherited color or explicit style props.
- Header/footer section defaults should match source-site chrome (dark or light) and preserve readable contrast in the default state.
- Header/footer background controls should include source-theme options (for example source brand blue for Yeti-like dark chrome), not only neutral/white options.
- When source has stacked store-info content (hours/location/map/parking), preserve source order in section structure. Default to `Hours -> Location -> Map -> Parking` when all four are present.
- Hero/promo bands should use full-bleed shell wrappers (`className="px-0 md:px-0 py-0 md:py-0"` + `contentClassName="max-w-none"`) only when the source band is edge-to-edge.
- Hero/promo media slots should not apply rounded corner classes unless the source design explicitly uses rounded media.
- Hero/promo image elements should render as block-level (`className` includes `block h-full w-full object-cover`) to avoid baseline whitespace gaps.
- For rich text slot rendering, prefer `resolveComponentData(...)` render output (`ReactElement | string`) over manual `html` extraction only; this prevents hidden copy when rich text value shapes vary (html/json/localized object forms).
- For source bands that combine media + list content (for example amenities/gallery + feature list), include an explicit media slot alongside list/content slots; do not collapse to list-only when source contains meaningful imagery.

## Generate Client Template Root

In `<client>-template.tsx`:

- Import client section components from `@yext/visual-editor` (package exports), not from local starter `components/`.
- Use full `@yext/pages` template structure as the client entrypoint.
- Compose page output in source order.
- In default layout content entries, set section `props` to section `defaultProps` (or a deliberate deep override of `defaultProps`) instead of `props: {}`.
- Pass stream document metadata into Puck render (`metadata={{ streamDocument: document }}`) for field resolution consistency.
- Keep the implementation client-scoped. Do not modify generic/shared templates unless requested.

In `<client>-config.tsx`:

- Register only client-owned section and slot category components from `@yext/visual-editor` (no shared page-section categories).
- Define one visible client-specific sidebar category for generated sections in the left nav.
- Define one hidden client-specific category for slot components.
- Ensure the visible category contains sections only (no atoms, no slot components).
- Ensure every slot component used by section defaults is present in the slot category component map and therefore available in registry lookups during drag/drop.
- Include slot component registrations in `config.components` (for example: spread `<Client>SlotsCategoryComponents`).

Follow `references/client-config-category-pattern.md` for a concrete config/category shape.

If `starter/src/ve.config.tsx` exists, integrate generated client sections into starter editor nav:

- Keep starter as a consumer of package config. Do not make `mainConfig` depend on starter imports.
- Prefer `...mainConfig.components`/`...mainConfig.categories` for client section visibility after package registration.
- Add `<client>-location` mapped to `<client>Config` in `componentRegistry`.
- Only add explicit client section/slot maps to starter `devConfig` if package `mainConfig` has not been updated yet.
- Extend starter `DevProps` only when explicit starter-local client maps are added.

For package-default availability (non-starter), update shared package config too:

- Add a package-native `<Client>SectionsCategory.tsx` file under `packages/visual-editor/src/components/categories`.
- Add a package-native `<Client>SlotsCategory.tsx` file under `packages/visual-editor/src/components/categories`.
- Register both `<Client>...CategoryComponents` maps in `packages/visual-editor/src/components/configs/mainConfig.tsx`.
- Add a visible `<client>Sections` category and hidden `<client>Slots` category in `mainConfig.categories`.
- Keep `directoryConfig` and `locatorConfig` unchanged unless explicitly requested.

## Validate

Run repository validation commands and fix errors before finishing.
Use `references/quality-checklist.md` as a mandatory gate before finalizing.
Use `references/test-and-screenshot-workflow.md` as a required post-generation step for every new generation unless the user explicitly opts out.
Treat screenshot parity as an advisory signal for spacing/hierarchy/media gaps; do not regress shared baseline functionality (slots, field wiring, editability, data behavior) to chase pixel-perfect matches.
Treat section parity pairing as heuristic by source order and generated section order; use diff output to guide review, not as absolute truth.
Apply at most one parity-driven correction pass by default, focused on high-impact issues (missing media/maps, incorrect hierarchy/layout, severe contrast/readability, major spacing breaks).
For major structure/layout mismatches (slot order, missing key bands, wrong visual hierarchy), increase parity weighting enough to correct those in the single default correction pass.
Do not make parity-driven refactors that reduce slot decomposition, field consistency, or editor stability.
Always run final build checks after the correction-pass reruns, and keep fixing until build commands pass.

Run skill validation:

```bash
python3 scripts/validate_client_template.py --client-path starter/src/templates/<client>
```

Confirm:

- Directory and file names match the required contract exactly.
- No shared/generic VE sections/components/atoms are imported into client config.
- Sections are slot-based and slot fields are hidden.
- Slot types referenced by sections are registered in client slot category and config component registry.
- Section default slot props are populated (no empty `{}` slot prop placeholders).
- Slot array fields define `defaultItemProps`.
- Unsupported `entityField` filters like `type.url` are not used.
- `YextEntityField<TranslatableString>` defaults do not use plain-string `constantValue`; they use localized objects with `hasLocalizedValue: "true"`.
- `YextEntityField<TranslatableString>` and `YextEntityField<TranslatableRichText>` defaults include localized objects with `hasLocalizedValue: "true"` when locale keys are used.
- Sections avoid composite slot concerns (for example `HoursLocationSlot`).
- All slot render calls include `allow={[]}` and `style={{ height: "auto" }}` by default in both section files and nested slot/layout files.
- Non-list slot components avoid over-aggregated text/CTA fields.
- Sections with 2+ slots expose top-level show/hide controls for most slots (target coverage: slot count minus one).
- Multi-slot section shells include containment cues (`overflow-hidden`, column wrappers with `min-w-0`) to prevent visual spillover.
- Location-stream templates avoid hardcoded location constants and map/directions URLs in defaults.
- Map blocks follow shared VE map patterns (no hardcoded iframe map embeds).
- Map slots do not use fallback `mapImage` fields/defaults unless explicitly requested.
- Map defaults do not use hero/promo marketing image URLs.
- Background image and image slot data follow shared VE image entity patterns (no plain URL text controls for core image sources).
- Nearby-locations behavior is not hardcoded to a static link list; it follows shared NearbyLocations-style dynamic data lookup.
- FAQ/Q&A sections preserve shared FAQ behavior patterns (question/answer data shape + interaction model) while matching source styling.
- Slot/atom implementations are adapted from the closest shared baseline unless source constraints require a deliberate divergence.
- Header/footer implementations are nested slot trees with focused child slots.
- Header/footer slot styles maintain text/background contrast without relying on hardcoded white/light utility classes.
- Header/footer defaults match source chrome style (dark/light) while preserving readable contrast.
- Hero/promo sections only use full-bleed wrappers when source parity requires edge-to-edge media.
- No sibling client template paths/symbols are referenced from generated files.
- No sibling custom client paths/symbols are referenced from `packages/visual-editor/src/components/custom/*`.
- Validator does not flag suspicious structural similarity with older sibling client templates.
- Store-info sections that include `HoursSlot`, `LocationInfoSlot`, `MapSlot`, and `ParkingSlot` preserve source-first order (`Hours -> Location -> Map -> Parking`) unless source evidence clearly differs.
- Rich text slot copy renders when edited/defaulted (no html-only parsing assumptions).
- Merged promo-like sections preserve optional CTA slots and expose top-level CTA show/hide toggles.
- Section `textColor` style controls are not undermined by hardcoded slot text color classes.
- No structurally duplicate sections exist when a toggle/variant-based merge is feasible.
- Hours defaults use entity binding, not static weekly strings.
- Multi-band hours sections (for example store + drive-thru) are represented as multiple entity-bound hours slots, not one slot with a secondary heading and no second hours data source.
- Default layout section entries do not use empty `props: {}`.
- Starter editor left nav includes the generated client section category when starter config exists.
- Starter config consumes package `mainConfig` for client sections/slots after package registration (no starter-owned mainConfig mutation).
- Fresh drag/drop from left nav works for header/footer sections and their nested child slots (brand/nav/utility, signup/links/legal) without blank/non-clickable slot regions.
- Footer social areas render platform-aware social link icons/links (not a plain social text list).
- User-facing copy fields are translatable/embedded-field capable (`translatableString` or entity-backed string fields), not plain text inputs.
- Header/nav utility groups do not include noisy hidden headings (for example `Top Links` / `Actions`) unless source shows those labels on-screen.
- CTA labels are always tied to actionable href/link controls (no plain-text CTA labels).
- No Storm-side integration logic is introduced.
- The generated page structure preserves source hierarchy (hero -> body bands -> CTA/footer).

## From-Scratch Test Protocol

Before calling generation "good", validate in a clean run:

1. Remove/ignore old generated client layout data for the target entity (or use a new entity with no saved `__layout`).
2. Start editor, drag fresh generated sections from left nav.
3. Confirm nested header/footer slots are selectable and editable in canvas and right props panel.
4. Confirm defaults are visible in props panel before any edits.
5. Run validator script and address all failures.

## Required Screenshot Parity Step

After initial generation, always scaffold and run section parity:

```bash
python3 scripts/scaffold_client_template_section_parity_test.py \
  --client-slug <client> \
  --html-path /path/to/source.html \
  --config-path starter/src/templates/<client>/<client>-config.tsx \
  --overwrite
```

```bash
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

After this first parity run, perform one focused correction pass in the same turn by default:

- fix the highest-impact issues surfaced by parity + smoke (missing/incorrect bands, major spacing/layout drift, contrast/accessibility failures)
- rerun smoke and section parity
- run final build checks:
  - `pnpm -C packages/visual-editor build`
  - `pnpm -C starter build`
- report what changed and what still differs

Do not stop at parity report output unless the user explicitly asks to skip correction.
Do not stop at rerun screenshots either if build checks fail; fix build errors before finishing.

For a brand-new generated parity test, run once with `--update` to seed screenshot baselines.

Use parity output to apply one focused correction pass. If browser tests cannot run in the current environment, report that parity execution was skipped and why.

Optional section parity controls:

```bash
CLIENT_TEMPLATE_SECTION_PARITY_LIMIT=10 \
CLIENT_TEMPLATE_SECTION_PARITY_ALL_VIEWPORTS=1 \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

Optional section parity gate (keep disabled by default; enable only when needed):

```bash
CLIENT_TEMPLATE_SECTION_PARITY_MAX_DIFF=<pixel-threshold> \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.section-parity.test.tsx
```

## Optional Additional QA

When rapid QA is requested, scaffold a smoke screenshot test:

```bash
python3 scripts/scaffold_client_template_smoke_test.py \
  --client-slug <client> \
  --template-path starter/src/templates/<client>/<client>-template.tsx \
  --config-path starter/src/templates/<client>/<client>-config.tsx
```

Then run the generated test with the repository Vitest browser workflow to produce screenshot artifacts.
For a brand-new generated smoke test, run once with `--update` to seed screenshot baselines.

Smoke screenshots should capture full rendered page height (not just viewport fold) so footer/late-page regressions are visible.

Optional full-page source-vs-generated parity scaffold:

```bash
python3 scripts/scaffold_client_template_visual_parity_test.py \
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

For a brand-new generated visual parity test, run once with `--update` to seed screenshot baselines.

Optional parity gate (fail if diff is above threshold):

```bash
CLIENT_TEMPLATE_PARITY_MAX_DIFF=<pixel-threshold> \
pnpm -C packages/visual-editor exec vitest run \
  src/components/generated/<Client>Template.visual-parity.test.tsx
```
