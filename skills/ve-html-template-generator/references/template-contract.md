# Template Contract

Use this contract for every generated client template.

## Required Directory Layout

```text
packages/visual-editor/src/components/custom/<client>/
  atoms/
    <AtomName>.tsx
    ...
  components/
    <SectionName>Section.tsx
    <SlotName>Slot.tsx
    ...
  index.ts
  ve.ts

packages/visual-editor/src/components/categories/
  <Client>SectionsCategory.tsx
  <Client>SlotsCategory.tsx

starter/src/templates/<client>/
  <client>-config.tsx
  <client>-template.tsx
```

## Naming Rules

- Use lowercase client slug for generated folder and starter template filenames.
- Use `PascalCase` for section/slot component filenames and exports.
- Suffix generated section components with `Section`.
- Suffix slot components with `Slot`.
- Keep component names stable after first generation; update implementation instead of renaming unless required.
- Prefix client-branded header/footer names with client context (`YetiHeaderSection`, `YetiFooterSection`).

## Isolation Rules

- Do not import shared/generic VE atoms, sections, categories, or config maps into client generated section/slot/atom implementations.
- Do not import, reference, or adapt sibling client templates under `starter/src/templates/<other-client>`.
- Do not import, reference, or adapt sibling custom clients under `packages/visual-editor/src/components/custom/<other-client>`.
- Always generate new client-specific header/footer sections.
- Always generate client-specific atoms even when equivalent shared atoms exist.
- Keep generated section/slot/atom implementation in `packages/visual-editor/src/components/custom/<client>`.
- Use shared generic components only as behavior baselines to copy/adapt into client-local files.

## Template Responsibilities

In `starter/src/templates/<client>/<client>-template.tsx`:

- Use a full `@yext/pages` template entrypoint structure.
- Import client section components from `@yext/visual-editor`.
- Import client config from `./<client>-config`.
- Preserve source page order when composing the initial layout and defaults.
- In default layout `content`, use section `defaultProps` (or explicit deep overrides) instead of `props: {}` placeholders.
- Export the client template entrypoint used by the site template system.

In `starter/src/templates/<client>/<client>-config.tsx`:

- Register client-owned section and slot category component maps imported from `@yext/visual-editor`.
- Define one visible client-specific category for sections in the left nav.
- Define one hidden client-specific category for slot components.
- Expose only section components in the visible category.
- Do not register atoms as nav-selectable components.
- Register all slot component types referenced by section `defaultProps.slots`.

In `packages/visual-editor/src/components/categories/<Client>SectionsCategory.tsx` and `<Client>SlotsCategory.tsx`:

- Import section/slot components from `../generated/<client>/components/...`.
- Export props interfaces and `<Client>...CategoryComponents` maps.
- Export category arrays from `Object.keys(<Client>...CategoryComponents)`.

In `packages/visual-editor/src/components/configs/mainConfig.tsx`:

- Register `<Client>SectionsCategoryComponents` and `<Client>SlotsCategoryComponents` in `components`.
- Add one visible `<client>Sections` category and one hidden `<client>Slots` category in `mainConfig.categories`.
- Leave `directoryConfig` and `locatorConfig` unchanged unless explicitly requested.

When `starter/src/ve.config.tsx` is present:

- Keep starter as a consumer of package `mainConfig` (`...mainConfig.components`, `...mainConfig.categories`).
- Add `<client>-location` -> `<client>Config` to `componentRegistry`.
- Avoid starter-local mutation of `mainConfig` or starter-sourced category ownership.

## Section Component Responsibilities

In each `packages/visual-editor/src/components/custom/<client>/components/<SectionName>Section.tsx`:

- Define explicit props with `data`, `styles`, and `slots`.
- Drive structure/content composition through slots, not inline hard-coded markup.
- Use intuitive, concern-specific slots (for example `HoursSlot`, `LocationInfoSlot`, `ParkingSlot`).
- When source has multiple hours bands, represent each band with its own entity-bound hours slot.
- Decompose text and CTA concerns into dedicated slots by default (for example `HeadingSlot`, `BodySlot`, `PrimaryCtaSlot`).
- Use embedded-field-capable controls for user-visible copy (`translatableString` or entity-backed string fields), not plain `text` inputs.
- Keep sections focused on one horizontal band from the source page.
- Keep defaults close to source copy and imagery for fast first review.
- Avoid introducing cross-client abstractions in first-pass output.
- Nearby stores/location sections should follow shared NearbyLocations-style dynamic behavior, not static hardcoded store-link lists.
- FAQ/Q&A sections should follow shared FAQ data/interaction patterns first, then adapt visuals.
- When source includes media + list compositions (for example amenities image + amenities list), preserve a dedicated media slot in the section shell.
- When combining two similar sections, preserve the superset of optional slots (for example CTA slots) and gate optional ones with top-level show/hide style toggles.
- Use containment-safe section shells (`overflow-hidden`, `min-w-0` column wrappers, slot render calls with `style={{ height: "auto" }}`).
- Header/footer sections must use nested slot composition (layout slot + focused child slots), not single omnibus slots.
- Header/footer layout slots must include populated default child-slot entries so nested slots are immediately editable after drag/drop.
- Header/footer slot content should not depend on fixed white/light text classes for readability; preserve contrast across background options.
- Header/footer section defaults should match source chrome style (dark or light) while preserving readable contrast.
- Avoid noisy utility heading defaults in header/nav groups (for example `Top Links`, `Actions`, `Menu`) unless source evidence shows those headings are visibly rendered.
- Footer social links should follow the shared social-links baseline (platform-specific fields, URL validation, icon rendering), not plain text social link lists.
- Location summary-style content should use nested layout + focused child slots rather than one large summary slot.
- Hero/promo sections should use full-bleed shell wrappers (`px-0 md:px-0` outer padding, `max-w-none` content wrapper) when source parity expects media to reach section edges.

## Slot Component Responsibilities

In each `packages/visual-editor/src/components/custom/<client>/components/<SlotName>Slot.tsx`:

- Implement client-owned content blocks used by section slots.
- Keep slot component APIs narrow and reusable across client sections.
- Treat generated slots as non-nestable editing surfaces: any `<slots.XSlot />` render inside slot/layout components must use `allow={[]}` and `style={{ height: "auto" }}`.
- For hours slots, default to mapped entity hours (`field: "hours"`) instead of hard-coded constant hours.
- Export slot components through client slot category maps so Puck can resolve them during drag/drop.
- For array controls, provide `defaultItemProps` to prevent malformed new rows.
- Do not rely on `type.url` entity selectors for editable URL values.
- Map slots should follow shared VE map patterns (`MapboxStaticMapComponent` or `getDirections`), not hardcoded iframe URLs.
- Image/background slots should follow shared VE image entity patterns (`type.image` selectors and render-time image resolution).
- Media-led hero/promo slots should avoid rounded-corner wrappers unless source design explicitly requires rounded media.
- Rich text slots should render `resolveComponentData` output directly (React element or string) instead of assuming `value.html` is always present.
- CTA labels should always pair with actionable href/link/CTA data and render as CTA controls, not plain text spans.

## Atom Responsibilities

In each `packages/visual-editor/src/components/custom/<client>/atoms/<AtomName>.tsx`:

- Keep atom API minimal and predictable.
- Include only behavior needed by client-owned sections.
- Avoid importing shared atoms from outside the client generated folder.
- Do not depend on runtime layout-shape normalization to make generated slots editable; generate correct slot defaults directly.

## Minimum Completion Checklist

- Every major visual band has exactly one section component.
- Header and footer are client-specific sections.
- Atoms used by sections are client-specific atoms.
- Sections use hidden slot fields and render through slot children.
- All slot render calls are locked (`allow={[]}`) in both sections and nested slot/layout components.
- Section slot defaults are fully populated (no `props: {}` placeholders).
- Header/footer default section backgrounds/styles match source chrome style.
- Starter client config/template import client category components/sections from `@yext/visual-editor`.
- Package `mainConfig` and categories include the new client section/slot category wiring.
- No sibling client symbols/paths are referenced in generated code.
- The client config includes visible `clientSections` and hidden `clientSlots` categories.
- Slot components with array fields include `defaultItemProps`.
- `YextEntityField<TranslatableString>` defaults use localized constant objects (`{ en, hasLocalizedValue: "true" }`) so right-panel defaults are visible on first load.
- `YextEntityField<TranslatableRichText>` defaults include `hasLocalizedValue: "true"` when using locale-key constants.
- User-facing copy fields are embedded-field capable (`translatableString` or entity-backed string fields), not plain text controls.
- Hours/location/parking are not collapsed into a single omnibus slot.
- Similar shell sections are merged into one configurable section where feasible.
- Location-stream templates avoid hardcoded city/address/phone/map defaults tied to a single location.
- Map blocks avoid hardcoded iframe provider embeds and rely on shared map patterns.
- Map slots do not default to generic `mapImage` fields populated with marketing imagery.
- Background images and image slots are entity-driven (`type.image`) rather than plain URL text fields.
- Section-level text color controls are not neutralized by hardcoded slot text color classes.
- Header/nav defaults do not include hidden utility heading noise (`Top Links`, `Actions`, `Menu`) unless source visibly renders those headings.
- CTA labels are actionable (link/href/cta), not plain text.
- Hero/promo media reaches section edges for full-width source bands (no accidental inset wrappers or rounded-card framing), including desktop breakpoints.
- The template root imports and uses the client config.
- The template default layout does not use empty section `props: {}` placeholders.
- The generated files compile with no type errors.
- The output is easy to iterate component-by-component in follow-up prompts.
