# Quality Checklist

Run this checklist before finishing generation.

## Architecture

- Every section component has `slots` in props and fields.
- Slot fields are hidden (`visible: false`).
- Section render output composes slot children (`<slots.XSlot allow={[]} />`).
- Nested slot/layout components that render child slots also use `<slots.XSlot allow={[]} />`.
- Slot default items use client-owned slot component types.
- Every slot type referenced by section defaults is registered in client slot category components.
- Section slot defaults are populated with real props (no `props: {}` placeholders).
- Slots represent focused concerns, not combined concerns (for example avoid `HoursLocationSlot`).
- Hours/location/parking concerns are represented by separate slots when present.
- Sections with 2+ slots expose top-level show/hide controls for most slots (target coverage: slot count minus one).
- Multi-band hours content (store/drive-thru/etc.) is represented as separate entity-bound hours slots.
- Text concerns are decomposed into focused slots (heading/body/disclaimer instead of one omnibus text slot).
- CTA concerns are decomposed into dedicated slots (primary/secondary CTA slots when both are present).
- Header/footer structures use nested slots (layout slot + focused child slots), not one terminal omnibus slot.
- Header/footer layout slots have fully populated child slot defaults (no empty child slot arrays).
- Footer social links use dedicated social-links slot behavior (platform-aware link fields + icon rendering), not generic text-link list slots.
- Header/footer section defaults match source chrome style (dark or light) while preserving readable contrast.
- Header/footer background style controls include source-theme options (for example brand-blue/dark chrome choices when source uses dark header/footer).
- Client-local sections/slots/atoms are adapted from the closest shared baseline unless a source-driven divergence is required.

## Data Defaults

- Most editable text/image content defaults to constant mode.
- Hours defaults to mapped entity mode (`field: "hours"` and `constantValueEnabled: false`).
- No hard-coded weekly hours rows unless explicitly requested by user.
- User-facing copy inputs use embedded-field-capable controls (`translatableString` or entity-backed string fields), not plain `text` inputs.
- Array fields include `defaultItemProps` so adding rows in editor cannot create malformed items.
- Avoid `entityField` filters with `type.url`; use text/translatable URL fields instead.
- `YextEntityField<TranslatableString>` defaults use localized objects (`{ en: "...", hasLocalizedValue: "true" }`), not plain string constants.
- `YextEntityField<TranslatableRichText>` defaults include localized objects with `hasLocalizedValue: "true"` when locale keys are used.
- Location-stream templates avoid hardcoded location constants (city/address/phone) with empty `field` bindings.
- Location-stream templates avoid hardcoded map/directions URLs tied to one address.
- Map implementations follow shared VE patterns (`MapboxStaticMapComponent` or `getDirections`), not hardcoded iframe map embeds.
- Map sections render real map surfaces (shared map component/static map image), not decorative placeholder cards.
- Map slots do not default to generic `mapImage` content fields unless explicitly requested.
- Map defaults are not reused from hero/promo image assets.
- Nearby stores/locations blocks are dynamic (shared NearbyLocations-style lookup), not static hardcoded store-link lists.
- FAQ/Q&A sections preserve shared FAQ behavior patterns (question/answer modeling + interaction behavior), with client/source-specific styling layered on top.
- Background images are entity-driven (`type.image`) instead of plain URL text fields like `backgroundImageUrl`.
- Image slots use shared-style image data patterns (`data.image` entity field + width/aspect controls + empty-state-safe behavior).

## Editor Nav and Config

- Client sections are visible in one client section category.
- Client slot components are in one hidden client slot category.
- Client slot components are included in `config.components` registration (for example via `<Client>SlotsCategoryComponents` spread).
- Atoms are not nav-selectable.
- Starter config is updated so client sections show in starter `/edit` left nav when applicable.
- Starter remains a consumer of package `mainConfig` (`...mainConfig.components`, `...mainConfig.categories`) instead of owning generated client section/slot maps.
- Starter `componentRegistry` includes `<client>-location` mapped to `<client>Config`.
- Starter `DevProps` is only extended with client section/slot props when explicit starter-local client component maps are intentionally added.
- Package `mainConfig` registers client-specific `<Client>SectionsCategoryComponents` and `<Client>SlotsCategoryComponents`.
- Package `mainConfig.categories` includes visible `<client>Sections` + hidden `<client>Slots` categories.
- Selecting a slot-backed section shows populated slot props in the right-hand props panel.
- All slot render calls include `allow={[]}` and `style={{ height: "auto" }}` in both sections and nested slot/layout components.
- Freshly dragged header/footer sections are editable in-canvas (no blank/non-clickable nested slot regions).

## Runtime and UX

- Use render-safe defaults so sections display immediately.
- Prefer theme-backed controls for color selectors over raw text color fields.
- Add `liveVisibility` toggles for section-level show/hide behavior.
- Use section-level error boundaries/wrappers where appropriate.
- Ensure `<Render>` receives `metadata={{ streamDocument: document }}` in client template entrypoints.
- Render code defensively handles partially defined array rows (no unsafe nested `.field` reads).
- Similar sections that differ only by copy/CTA visibility are merged into one component with toggles.
- Merged sections preserve optional slots from all source variants (for example CTA slots) and expose explicit show/hide toggles for those slots.
- CTA labels are always actionable (paired with href/link/CTA entity data), not rendered as plain text.
- Multi-slot section shells include containment cues (`overflow-hidden`, column wrappers with `min-w-0`).
- Store-info sections that include hours/location/map/parking preserve source-first slot order (default `Hours -> Location -> Map -> Parking`).
- Core section/slot wrappers avoid absolute/fixed positioning for main content.
- Section-level `textColor` controls remain effective (slot content does not force hardcoded conflicting text color classes).
- Header/footer editability is preserved through nested child slots for logo/nav/CTA/legal concerns.
- Header/footer text and border styles maintain contrast and do not rely on fixed white/light utility classes.
- Header/nav utility defaults avoid noisy hidden headings (for example `Top Links`, `Actions`, `Menu`) unless source explicitly shows them.
- Hero/promo sections that are media-led use full-bleed section shell wrappers (`px-0 md:px-0 py-0 md:py-0` + `max-w-none`) when source parity requires edge-to-edge imagery.
- Hero/promo media slots avoid rounded corners by default unless source design explicitly calls for rounded media.
- Hero/promo image elements render as block-level (`block h-full w-full object-cover`) to avoid baseline whitespace seams.
- Rich text slot rendering uses `resolveComponentData` render output (React element or string) rather than html-only extraction, so copy remains visible across value shapes.
- Source bands that pair media + list/content keep a dedicated media slot instead of dropping imagery during decomposition.
- Generated files do not reference sibling client template paths/symbols under `starter/src/templates/<other-client>` or `packages/visual-editor/src/components/custom/<other-client>`.

## Final Validation

- Run `python3 scripts/validate_client_template.py --client-path starter/src/templates/<client>`.
- Type check passes for generated client template files.
- Sections render in expected order in default layout.
- Default layout section entries use populated props (default props or explicit overrides), not `props: {}` placeholders.
- Client category appears in left nav in starter editor.
- Validate with a clean/new layout state (no stale `document.__.layout` from old generations).
- Hours slot resolves live entity hours without manual constant content.
- Hours blocks keep explicit entity-backed wiring (`field: "hours"`) and expose entity/constant state correctly in the editor.
- Summary/hero info areas avoid monolithic slot props and are decomposed into nested focused child slots.
- Validator does not report suspicious structural similarity to older sibling client templates.
- Section parity test is scaffolded and run for the generation (or explicitly reported as skipped with reason if browser screenshot tests are unavailable).
- Parity-driven updates are limited to high-impact visual corrections and do not degrade slot architecture or field/editability behavior.
- For major hierarchy/order mismatches, parity should drive one corrective pass (source order/stacking/theme contrast) before finalizing.
- Optional smoke screenshot tests are scaffolded when requested and run (or explicitly reported as not run if environment lacks browser test support).
- After correction-pass reruns, run `pnpm -C packages/visual-editor build` and ensure it exits successfully.
- After correction-pass reruns, run `pnpm -C starter build` and ensure it exits successfully.
