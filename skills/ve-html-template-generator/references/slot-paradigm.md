# Slot Paradigm

Use this for all generated client sections.

## Section Shape

Client sections should be structural wrappers that render slot content.

```tsx
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "@yext/visual-editor";

type ClientHeroSectionProps = {
  styles: {
    backgroundColor?: string;
  };
  slots: {
    HeadingSlot: Slot;
    BodySlot: Slot;
    PrimaryCTASlot: Slot;
  };
  liveVisibility: boolean;
};

const fields: Fields<ClientHeroSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot" },
      BodySlot: { type: "slot" },
      PrimaryCTASlot: { type: "slot" },
    },
    visible: false,
  },
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const HeroView: PuckComponent<ClientHeroSectionProps> = ({ slots }) => {
  return (
    <section className="flex flex-col gap-4">
      <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
      <slots.BodySlot style={{ height: "auto" }} allow={[]} />
      <slots.PrimaryCTASlot style={{ height: "auto" }} allow={[]} />
    </section>
  );
};
```

## Default Slot Props

Each section must define `defaultProps.slots` with client-owned slot types.

```tsx
defaultProps: {
  slots: {
    HeadingSlot: [{ type: "YetiHeadingSlot", props: { ... } }],
    BodySlot: [{ type: "YetiBodySlot", props: { ... } }],
    PrimaryCTASlot: [{ type: "YetiCTASlot", props: { ... } }],
  },
}
```

Never use placeholder slot defaults like `props: {}`.

## Slot Drop Lock

Generated slots are for editing pre-scaffolded fields/props, not for arbitrary nesting.

- Always render generated slot calls with `allow={[]}`.
- Apply this to section-level slot calls and nested layout-slot calls.
- Keep `style={{ height: "auto" }}` on those slot calls unless intentionally overridden.

Prefer exporting `default<SlotName>Props` from each slot component and reusing those objects in section slot defaults.

## Top-Level Slot Visibility Controls

For sections with 2+ slots, expose top-level `show...` toggles in `styles` for most slots.

- Target coverage: `slot count - 1` or higher.
- Keep always-on slots only when they are structurally required.
- Wire each toggle directly in section render logic, not only inside nested child slots.

Example:

```tsx
styles: {
  showHeading: boolean;
  showBody: boolean;
  showPrimaryCta: boolean;
}
```

Example:

```tsx
import { defaultYetiFaqListSlotProps } from "./YetiFaqListSlot";

slots: {
  FaqListSlot: [{ type: "YetiFaqListSlot", props: defaultYetiFaqListSlotProps }],
}
```

## Hours Slot Rule

When a section includes hours, route through a client slot component and default to entity hours:

```tsx
HoursSlot: [
  {
    type: "YetiHoursSlot",
    props: {
      data: {
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        },
      },
    },
  },
];
```

Avoid hard-coding weekly hours strings in section defaults.

If source has multiple hours bands, generate multiple hours slots (for example `StoreHoursSlot`, `DriveThruHoursSlot`) and keep each one entity-bound.

## Decomposition Heuristic

Prefer multiple focused slots over one combined slot.

When a section visually contains distinct concerns (hours table, location details, parking notes), represent each concern as its own slot rather than a merged slot.

Apply this rule to copy/CTA decomposition as well:

- Heading text should be its own slot.
- Body/description text should be its own slot.
- Each CTA should be its own slot (primary CTA, secondary CTA).
- Legal/disclaimer text should be its own slot.
- For user-visible non-entity copy fields, use embedded-field-capable inputs (`translatableString`) rather than plain `text` inputs.
- CTA labels must map to actionable href/link/CTA data; do not render CTA labels as plain text spans.

Avoid non-list slots with many text fields plus CTA fields. If grouping is needed, use a layout slot that renders child slots.

Favor nested slot composition when in doubt:

- Section shell slot -> layout slot -> focused text/CTA slots
- Avoid terminal slots that try to own all copy and actions for an entire band

Header/footer specific rule:

- Header/footer should always be multi-layer slot compositions, not single terminal content slots.
- Use focused child slots for:
  - logo/brand
  - navigation groups
  - CTA groups
  - utility/legal groups
- Keep header/footer layout orchestration in layout slots and keep content concerns in child slots.
- Ensure layout slots have populated default child slots so they are editable immediately after drag/drop.
- Avoid introducing layout-slot shapes that require runtime backfill/normalization to become editable.
- Footer social link concerns should use dedicated social slot patterns (platform-aware fields + icon rendering), not generic text-link list slots.
- Avoid noisy nav utility heading defaults (`Top Links`, `Actions`, `Menu`) unless source evidence confirms they are visibly rendered.

Location summary specific rule:

- Avoid one monolithic summary slot with many unrelated fields.
- Use nested summary layout slots with focused child slots (back-link, heading/meta, status, CTA).

Recommended pattern:

```tsx
slots: {
  HoursSlot: Slot;
  LocationInfoSlot: Slot;
  MapSlot: Slot;
  ParkingSlot: Slot;
}
```

When all four concerns are present, preserve source-first stacked order by default:

`Hours -> Location -> Map -> Parking`

## Containment Pattern for Multi-Column Sections

Use containment-safe wrappers to avoid slot overflow into adjacent sections:

```tsx
<section className="w-full overflow-hidden">
  <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2">
    <div className="min-w-0 flex flex-col gap-8">
      <slots.HoursSlot style={{ height: "auto" }} allow={[]} />
      <slots.LocationInfoSlot style={{ height: "auto" }} allow={[]} />
      <slots.ParkingSlot style={{ height: "auto" }} allow={[]} />
    </div>
    <div className="min-w-0">
      <slots.MapEmbedSlot style={{ height: "auto" }} allow={[]} />
    </div>
  </div>
</section>
```

For core content, avoid absolute/fixed positioning in slot wrappers unless strictly decorative and fully bounded by a relative container.
