# Section Normalization

Use this pass before writing final section files.

## Goal

- Split over-aggregated slots into focused slot components.
- Merge structurally duplicate sections into one reusable section.

## Slot Decomposition Rules

Each slot should map to one clear concern. Avoid omnibus slots.

Good:

- `HoursSlot`
- `LocationInfoSlot`
- `ParkingSlot`

Bad:

- `HoursLocationSlot`
- `InfoAndHoursSlot`

When a section contains hours, location info, and parking, default to three slots:

- `HoursSlot`
- `LocationInfoSlot`
- `ParkingSlot`

If source contains multiple hours bands (for example store hours and drive-thru hours), do not collapse them into one hours slot.
Generate one dedicated entity-bound hours slot per band.

Text and CTA decomposition defaults:

- `HeadingSlot` for primary heading text.
- `BodySlot` for descriptive copy.
- `PrimaryCtaSlot` and `SecondaryCtaSlot` for distinct CTAs.
- `DisclaimerSlot` for legal/supporting copy.
- Use embedded-field-capable copy inputs (`translatableString` or entity-backed string fields) for user-visible non-entity text.
- Every CTA label slot/field should pair with actionable href/link/CTA data; do not keep CTA labels as plain text-only output.

For non-list slots, treat these as over-aggregated and split them:

- 3+ translatable text entity fields in one slot
- Any CTA label/link fields combined with multiple unrelated text fields

If visual grouping is needed, create a layout slot that composes focused child slots.

Nested-slot bias:

- Prefer nested layout slots over packing multiple text/CTA fields into one terminal slot.
- Keep parent section as a shell, with layout slots composing focused content slots.
- Keep nested slot renders locked for editing-only usage (`allow={[]}` + `style={{ height: "auto" }}`).

Header/footer decomposition:

- Treat header/footer as high-priority slotification targets.
- Split monolithic header/footer slots into layout + focused child slots.
- Do not leave header/footer copy/links/buttons in one terminal slot component.
- Do not model footer social as a generic text-link list slot. Use a dedicated social-links slot pattern with platform-aware link fields and icon rendering.
- Suppress noisy hidden utility heading labels in nav/footer defaults (`Top Links`, `Actions`, `Menu`) unless source evidence confirms visible rendering.

Location summary decomposition:

- Treat hero/location summary content as a layout slot composed of focused child slots.
- Split into child concerns such as:
  - back link
  - location heading/address/meta
  - status row
  - CTA row
- Avoid monolithic summary slots with many unrelated text/link fields.

## Duplicate Section Merge Rules

If two sections share the same layout shell, slot schema, and style controls, merge them into one section component.

Use configurable toggles/variants instead of duplicate files.

When merging, preserve the superset of optional content slots from all variants (do not drop "sometimes present" slots).

Example:

- If one variant has CTA and another does not, keep CTA slot(s) in merged component.
- Add explicit top-level show/hide toggles for those optional slots (`showPrimaryCta`, `showSecondaryCta`, etc.).
- Default toggles per layout instance to match source parity (disabled where not used).

Example merge:

- Replace `CustomizeSection` + `ReserveSection` with `PromoBannerSection`
- Add style/data toggles:
  - `showCTA: boolean`
  - `overlayClass`
  - `backgroundImageUrl`
- Keep alternate defaults as preset prop objects.

## Decision Heuristic

Treat sections as duplicates when all are true:

- Same slot keys
- Same style field keys
- Same dominant layout pattern (same wrapper structure)

When duplicates are detected, generate one component plus multiple default preset objects.

## Baseline-First Rules

Use existing shared VE sections as implementation baselines before inventing novel structures.
Do not use sibling client templates as baselines.

Preferred baseline order:

1. `CoreInfoSection` for multi-slot information grids
2. `AboutSection` for mixed column content and sidebar patterns
3. `VideoSection` for simple heading+content shells

For complex bespoke pages, assemble with shared grid/core-info atom patterns first, then wrap that composition in client-bespoke section names and focused slot labels.

Then adapt/copy those patterns into client-local files (do not import shared sections directly).

For location pages with nearby stores/locations content, baseline against NearbyLocations patterns rather than creating static nearby-link lists.

## Containment Rules

Before finalizing, verify section shell containment:

- Multi-slot section container uses `overflow-hidden`.
- Grid/flex column wrappers include `min-w-0`.
- Slot calls use `style={{ height: "auto" }}` unless intentionally overridden.
- Core content in section/slot wrappers avoids absolute/fixed positioning.
