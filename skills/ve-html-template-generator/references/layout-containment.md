# Layout Containment

Use these rules to prevent slot content from spilling into neighboring sections in editor or live rendering.

## Shell Rules

- Keep section content in normal document flow; avoid absolute/fixed positioning for core content.
- Add `overflow-hidden` to section content wrappers when multiple slots are stacked or arranged in columns.
- In grid/flex column layouts, add `min-w-0` to each column wrapper.
- Prefer intrinsic height (`h-auto`/content-driven) over fixed heights for text-heavy columns.

## Slot Render Rules

- Render slot children with `style={{ height: "auto" }}` by default.
- Keep `allow={[]}` unless the section intentionally supports free slot replacement.
- Use explicit wrappers per slot row/column to preserve boundaries.

## Two-Column Details Pattern

```tsx
<YetiSection backgroundColor={styles.backgroundColor}>
  <div className="mx-auto grid w-full max-w-6xl gap-8 overflow-hidden px-6 py-12 lg:grid-cols-2">
    <div
      className="min-w-0 flex flex-col gap-8"
      style={{ color: styles.textColor }}
    >
      <slots.HoursSlot style={{ height: "auto" }} allow={[]} />
      <slots.LocationInfoSlot style={{ height: "auto" }} allow={[]} />
      <slots.ParkingSlot style={{ height: "auto" }} allow={[]} />
    </div>
    <div className="min-w-0">
      <slots.MapEmbedSlot style={{ height: "auto" }} allow={[]} />
    </div>
  </div>
</YetiSection>
```

## Pre-Ship Checks

- Resize content-heavy slots (long address, long parking copy, many hour rows) and verify no overlap with next section.
- Drag/reorder section in editor and confirm drop-zone overlays stay inside section bounds.

## Full-Bleed Media Pattern

For hero/promo sections that should match full-width source media:

- Use section shell with zero horizontal padding and unconstrained content width.
- Ensure breakpoint padding is also removed (`md:px-0`) so desktop does not retain side gaps.
- Keep overlay copy padded internally while media itself spans edge-to-edge.
- Avoid rounded-corner wrappers on full-bleed media slots unless source design is rounded.

Example pattern:

```tsx
<YetiSectionShell
  background={styles.backgroundColor}
  className="px-0 md:px-0"
  contentClassName="max-w-none"
>
  <section className="relative overflow-hidden">
    <slots.HeroMediaSlot style={{ height: "auto" }} allow={[]} />
    <div className="pointer-events-none absolute inset-0 flex items-end p-6 md:p-10">
      <div className="pointer-events-auto max-w-xl">
        <slots.HeroHeadingSlot style={{ height: "auto" }} allow={[]} />
      </div>
    </div>
  </section>
</YetiSectionShell>
```
