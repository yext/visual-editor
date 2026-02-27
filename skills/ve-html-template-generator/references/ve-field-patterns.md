# VE Field Patterns

Use these patterns for generated components so they work with Visual Editor controls.

## Slot-First Rule

Section components should be layout shells that render slot children.

Required shape in section props:

```ts
slots: {
  <NamedSlot>: Slot;
  ...
}
```

Required shape in section fields:

```ts
slots: {
  type: "object",
  objectFields: {
    <NamedSlot>: { type: "slot" },
  },
  visible: false,
}
```

Use slot defaults in `defaultProps.slots` with client-owned slot component types.

## Local Atom Rule

When a section needs primitives (heading, body text, image wrapper, button), implement/import them from `packages/visual-editor/src/components/custom/<client>/atoms/*`.

Do not import shared atoms from generic VE directories.

## Core Shape: Entity vs Constant

Use this data shape for content-bearing props:

```ts
type YextEntityField<T> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean;
};
```

Initialize most fields with meaningful constants and `constantValueEnabled: true`.

Exception:

- Hours fields should default to mapped entity values (`field: "hours"`) and entity mode.

Supported entity selector filters for this skill:

- `type.string`
- `type.rich_text_v2`
- `type.image`
- `type.phone`
- `type.hours`

Avoid `entityField` with `type.url` in generated client templates.

## Text Field Pattern

Use an entity field selector filtered to string values:

```ts
text: YextField<any, TranslatableString>("Text", {
  type: "entityField",
  filter: { types: ["type.string"] },
});
```

Default value pattern:

```ts
text: {
  field: "",
  constantValue: { en: "Section heading", hasLocalizedValue: "true" },
  constantValueEnabled: true,
}
```

Do not use a plain string for `constantValue` on `YextEntityField<TranslatableString>` defaults.

Bad:

```ts
constantValue: "Section heading";
```

This can render in preview, but the right-side prop editor often initializes as empty because it reads localized values from `constantValue[locale]`.

## Rich Text Pattern

Use rich text selector for marketing copy blocks:

```ts
description: YextField<any, TranslatableRichText>("Description", {
  type: "entityField",
  filter: { types: ["type.rich_text_v2"] },
});
```

Default constant value should be locale-aware and render-safe.

For `YextEntityField<TranslatableRichText>` defaults, include `hasLocalizedValue: "true"` when using locale keys.

Good:

```ts
description: {
  field: "",
  constantValue: {
    en: { html: "<p>Example</p>", json: "{...}" },
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
}
```

Avoid locale-key objects without `hasLocalizedValue`, which can break prop-panel hydration and runtime rendering.

Render pattern for rich text slots:

- Resolve with `resolveComponentData(...)` and render the result directly.
- Handle both `ReactElement` and `string` outputs.
- Do not rely exclusively on manual `value.html` parsing, because editor/KG data may arrive as different rich-text object shapes.

## Hours Pattern

Use hours selectors for hours-based slot components:

```ts
hours: YextField<any, HoursType>("Hours", {
  type: "entityField",
  filter: { types: ["type.hours"] },
});
```

Default hours binding pattern:

```ts
hours: {
  field: "hours",
  constantValue: {},
  constantValueEnabled: false,
}
```

## URL Field Pattern

Use URL fields directly for links/background URLs:

```ts
ctaUrl: YextField("CTA URL", { type: "text" });
```

If localization is required, use a translatable-string field strategy rather than `entityField` with `type.url`.

Do not use URL text fields for core map/image sources (background images, map embeds, directions source URLs) when entity-backed/shared patterns are available.

## Location Stream Dynamic Data Pattern

For templates with `entityTypes: ["location"]`, avoid hardcoded location defaults that lock output to one site/store.

Preferred defaults:

- Store name/hero title: bind to `field: "name"` when the source represents location identity.
- Address text: bind to address fields (`address.line1`, derived city/state/postal, or `address` object patterns).
- Phone text: bind to `mainPhone` (or equivalent phone entity field) instead of raw text fields.
- Hours: bind to `hours` with `constantValueEnabled: false`.

Avoid in location-stream defaults:

- hardcoded city/address strings with empty `field`
- hardcoded map/directions URLs tied to one address
- plain `text` field controls for location primitives (`mapUrl`, `directionsUrl`, `phoneNumber`) unless the user explicitly requests static-only behavior

## Image Asset Pattern

Use image selector for visual media blocks:

```ts
image: YextField<any, ImageType | ComplexImageType | TranslatableAssetImage>(
  "Image",
  {
    type: "entityField",
    filter: { types: ["type.image"] },
  },
);
```

Default value should include URL and dimensions to avoid empty render states.

For background imagery, prefer shared hero/promo shape:

```ts
backgroundImage: YextField<
  any,
  ImageType | AssetImageType | TranslatableAssetImage
>("Image", {
  type: "entityField",
  filter: { types: ["type.image"] },
});
```

Avoid `backgroundImageUrl` text fields for primary background image control.

Use shared render-time resolution patterns (`resolveYextEntityField`, `getImageUrl`) for localized image values.

For image slots, mirror `ImageWrapper` conventions:

- `data.image` entity field with `type.image`
- style controls like width/aspect ratio
- empty-state-safe render behavior for missing image data

## Map Pattern

For location templates, align map behavior with shared VE map patterns:

- Preferred: `MapboxStaticMapComponent` + coordinate entity field (`field: "yextDisplayCoordinate"`).
- Acceptable fallback: `getDirections(...)` links derived from address/entity data.

Avoid:

- hardcoded map provider URLs in defaults
- raw `iframe` embeds as the primary map behavior

## Resolve Pattern in Render

Resolve field data through locale + stream document:

```ts
const streamDocument = useDocument();
const { i18n } = useTranslation();

const headline = resolveComponentData(
  data.headline,
  i18n.language,
  streamDocument,
);
```

Wrap resolved field output in `EntityField` where applicable.

## Section Runtime Pattern

Use `VisibilityWrapper` and `ComponentErrorBoundary` for top-level section renders when applicable.

Prefer theme-backed selectors over raw text controls for color choices.

## Array Robustness Pattern

For every array field, include `defaultItemProps`:

```ts
items: YextField("Items", {
  type: "array",
  arrayFields: {
    question: YextField<any, TranslatableString>("Question", {
      type: "entityField",
      filter: { types: ["type.string"] },
    }),
  },
  defaultItemProps: {
    question: {
      field: "",
      constantValue: { en: "Question", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
  },
});
```

Keep the same localized-object shape when overriding translatable fields through spread defaults:

```ts
const override = {
  ...base,
  data: {
    ...base.data,
    heading: {
      field: "",
      constantValue: { en: "Reserve Now", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
  },
};
```

In render code, guard array entries before reading nested values to avoid crashes from malformed editor rows.

Safe field-id pattern for list rows:

```tsx
const questionField = item?.question;
<EntityField
  displayName="Question"
  fieldId={questionField?.field ?? ""}
  constantValueEnabled={questionField?.constantValueEnabled}
>
  {resolveComponentData(
    questionField ?? {
      field: "",
      constantValue: { en: "Question", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    locale,
    streamDocument,
  )}
</EntityField>;
```

## Common Style Controls

Include simple, reusable style controls by default:

- Text alignment (`left`, `center`, `right`)
- Color token selector (`SITE_COLOR` or `BACKGROUND_COLOR`)
- Heading level (if section has heading)
- Section spacing/padding controls

Keep style props shallow and avoid nested style systems for first-pass generated sections.

If a section exposes `styles.textColor`, slot components rendered inside it should not hardcode conflicting color classes (for example `text-white`). Let color inherit or use slot style props wired to editor fields.
