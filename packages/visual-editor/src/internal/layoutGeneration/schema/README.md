# Field inference

`createPuckGenerationCatalog` accepts component `layoutGenerationMetadata` and builds authored Zod contracts from static component fields and defaults. It normalizes fields and validates static slotted-source contracts once when constructing the catalog. Creation, full-page updates, edit targeting, validation and preservation consume the same compiled contract. `resolveFields`, React renderers and arbitrary option/default-item callbacks are not executed during inference.

Components participate by default. Set `layoutGenerationMetadata: { exclude: true }` to keep a component outside AI authoring. Such components remain registered for rendering and existing-layout preservation.

## Field metadata

Native Puck and Yext fields both accept `generation`:

```ts
const fields = {
  title: {
    type: "translatableString",
    generation: { required: true, instructions: "Write a short heading." },
  },
  color: {
    type: "themeColor",
    options: "SITE_COLOR",
    generation: {
      required: false,
      instructions: "Set only when the user requests a text color override.",
    },
  },
  HeadingSlot: {
    type: "slot",
    generation: { singleChild: true },
  },
  custom: {
    type: "custom",
    render: CustomEditor,
    generation: { schema: customValueSchema },
  },
  adjusted: {
    type: "text",
    generation: { schema: (inferred) => inferred.optional() },
  },
  privateValue: { type: "text", generation: { exclude: true } },
};
```

- A defined default makes an inferred field required. Fields without defaults are optional. `generation.required` overrides this rule. Required fields may still select `$default`; optional fields may additionally select `$unset`.
- The rule applies recursively to object children. Array item schemas use static `defaultItemProps`, falling back to the first component-default item. Default-item factories are not invoked; use explicit requiredness where needed.
- A replacement `schema` owns its optionality and ignores `required`. A callback receives the inferred schema after requiredness and returns the final schema. Callbacks require an inferable field; use a replacement schema for unknown custom values. Callbacks receive `z.ZodType`; use a replacement schema for type-specific constraints rather than relying on a particular inferred subclass.
- Slot `singleChild: true` requires exactly one child, including hidden slots. `singleChild: false` or omission keeps variable-length arrays. `singleChild` is explicit and is never inferred from defaults or allowed types. Only slots accept `singleChild`; slotted-source `slots.CardSlot` collections cannot use `singleChild: true`. Explicit field schemas remain authoritative. This generation metadata does not change saved data or require a migration.
- `generation.nullable: true` adds null to inferred values for explicit inheritance semantics; omission keeps selectors non-nullable. It is applied before requiredness and schema callbacks. Replacement schemas still own nullability and optionality.
- `instructions` augments the schema description without repeating identical instruction lines. Canonical guidance survives nullable/optional wrappers. Hidden fields are included; `visible` is an editor concern.
- `exclude` omits the field, including when a schema is supplied. Unknown fields are also omitted. Omission means AI cannot author the value: defaults and existing unmentioned values remain owned by the library/editor. Normal render/resolution validation still applies. Existing structural semantics remain: replacing an array creates new items, and explicitly unsetting a containing value is not an edit to its omitted descendants. Ordinary edit preservation rejects wrapper unsets that would erase opaque properties.
- Override schemas must satisfy the strict compiler. Slots use arrays of `z.unknown()` so child contracts come from the catalog. Coercion, transforms and arbitrary refinements remain unsupported.

## Built-in shapes

Native text, textarea and richtext infer strings; number fields retain min/max. A number's `step` is an editor increment, not an inferred integer constraint. Set `generation.integer: true` to infer an integer while retaining the native `min` and `max`. This does not change editor step or round values; explicit schemas remain authoritative. Radio/select/checkbox preserve option value types, including boolean, numeric and structured object values. Objects and arrays recurse; array bounds are retained. Slots use registered child contracts and existing allow/disallow restrictions.

Yext builders cover localized strings, image representations and localized alt text, videos, CTA selectors, comprehensive CTAs, colors, typography/style fields, optional numbers, font-size choices, static basic selectors and multi-selectors. Known ThemeOptions factories can be evaluated; arbitrary callback option lists require explicit schemas. Legacy SITE_COLOR/BACKGROUND_COLOR selectors support custom bracketed hex colors as well as palette values.

Entity fields use `constantValueFilter ?? filter`, list mode and translation settings. Known constants include text, rich text, images, CTAs, datetime, phone, numbers, booleans, coordinates, address, hours and price. Unknown/custom entity types require explicit schemas; inference omits the field rather than guessing from a default value. Repeated sources recurse through their declared manual and mapping fields.

With `layoutGenerationMetadata.slottedItemSource`, inferred `data` exposes linked bindings and strict mapping objects (`field` and `constantValueEnabled: false` only) while manual content belongs in `slots.CardSlot`. For repeated fields with `disableConstantValueToggle: true`, inference requires `constantValueEnabled: false`, excludes helper-owned `constantValue`, and preserves the declared mapping-field schemas (including boolean controls and custom schema overrides). `fixedRepeatedField` independently restricts `field` to that literal source. This linked-only behavior also applies without slotted-source metadata. Ordinary slotted sources retain strict binding-only mapping objects. Helper-owned constant references, manual backups and derived indexes stay outside the contract. Keep that ownership metadata and `resolvedProps`; schema inference does not replace their lifecycle behavior.

## Component escape hatch and integration

`layoutGenerationMetadata.props` supplies the entire authored contract and bypasses field inference, including field overrides/exclusions. Its Zod descriptions are authoritative. Component `instructions` are appended to the component description. This escape hatch is useful for relationships spanning fields or props that static fields do not expose.

Canonical generation primitives and a pure field helper are available through `@yext/visual-editor/section-library-support` (see below). Public metadata types are exported through `@yext/visual-editor`; `FieldGenerationMetadata` is also available from the section-library-support entrypoint.

Consumers inspecting schemas should read normalized `catalog.data.components[name].generation?.props`. Raw component `layoutGenerationMetadata.props` is optional. The JSON Render adapter exposes `.props` as a derived getter rather than storing a second schema reference.

Unknown-field omissions are available on `catalog.fieldOmissions` as component/path/type/reason records without authored values. Generation sends these records only to the optional local-file diagnostics sink. The local editor records them in its existing generation session logs; transport failures are silent. Console-backed platform diagnostics do not receive omission warnings.

The inference and catalog normalization tests include standard-library-shaped email, localization, image, color, union, fixed-slot and repeated-card contracts. They do not constitute a complete standard-library integration. In particular, matching Emails' optional style behavior requires `required: false` on defaulted styles/controls, and its integer list length needs `generation.integer: true` and native bounds. Dynamic option restrictions and component-specific copy guidance still need field overrides/instructions.

## Reusing contracts in custom editors

Import canonical primitives from `@yext/visual-editor/section-library-support`:

- Text: `translatableStringZodSchema`, `richTextZodSchema` (required HTML, optional Lexical JSON), `translatableRichTextZodSchema`.
- Images: `assetImageZodSchema`, `imageZodSchema` (asset, wrapped asset or localized fallback; existing locale-specific assets are preserved).
- Bindings and CTAs: `entityFieldZodSchema(constantSchema)`, `enhancedCtaZodSchema`, `ctaSelectorZodSchema`, `comprehensiveCtaZodSchema`.
- Colors and hours: `siteColorZodSchema`, `backgroundColorZodSchema`, `hoursZodSchema`.
- Widths: `widthZodSchema`, including `default`, `theme`, `fullWidth` and the fixed `MAX_WIDTH` options. Inferred `basicSelector` fields using `options: "MAX_WIDTH"` and styled page-section widths use this same contract without consulting mounted theme state. Custom explicit option arrays retain their declared restrictions.

`inferFieldZodSchema(field, { defaultValue? })` returns a Zod authored-value contract without constructing a catalog or executing renderers, arbitrary options callbacks, or default-item factories. It accepts original or Puck-adapted field definitions and recursively handles objects and arrays. Requiredness follows the same default-based rules as catalog inference. Set `generation.required` explicitly when no default value is provided. It throws for an unsupported field or nested inference omission, and for an excluded top-level field, rather than silently returning an incomplete custom-editor contract. Slots remain arrays of unknown children; catalog compilation still supplies allowed child contracts.

```ts
import {
  inferFieldZodSchema,
  imageZodSchema,
} from "@yext/visual-editor/section-library-support";
import { z } from "zod";

// Reuse the same native fields used inside a custom result-card renderer.
const resultCardSchema = inferFieldZodSchema({
  type: "object",
  generation: { required: true },
  objectFields: resultCardFields,
});
const resultCardEditor = {
  type: "custom",
  render: ResultCardEditor,
  generation: { schema: resultCardSchema },
};

// Compose relationships that a plain object field cannot express.
const aboutContentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: inferFieldZodSchema({
      type: "translatableString",
      generation: { required: true },
    }),
  }),
  z.object({ type: z.literal("image"), image: imageZodSchema }),
]);

// Null is an explicit inheritance value, not a universal selector default.
const widthField = {
  type: "basicSelector",
  options: "MAX_WIDTH",
  generation: { nullable: true },
};
```

Header link arrays, Locator result-card configuration and custom color editors can attach schemas produced from their native backing fields in the same way. Explicit replacement schemas retain their own optionality and nullability, even with `required` or `nullable` metadata; callbacks receive the inferred contract after those settings are applied. Use optional/nullable replacement schemas where the custom editor's full contract requires them.

Consumers can remove duplicate primitive definitions, hand-written object/array contracts that mirror native backing fields, width enums maintained for unmounted editors, `.nullable()` callbacks replaced by explicit `generation.nullable`, and repeated generic instructions explaining bindings, localized content, color formats, or manual versus linked slotted sources. These instructions now travel with the canonical/inferred schemas, including optional fields. Keep component-specific copy placement, visibility and styling instructions. Keep discriminated unions, dynamic restrictions and cross-field relationships that fields cannot express. Complete component schemas still bypass inference. Generic slotted-source ownership guidance still requires `slottedItemSource` metadata; standalone field inference does not guess component ownership.

This API only changes generation contracts. Saved representations and editor option lists are unchanged; no saved-data migration is required.

## Additional native contracts

`LOCATOR_ENTITY_TYPES` is exported as a readonly tuple through `section-library-support`. Use `z.enum(LOCATOR_ENTITY_TYPES)` instead of duplicating the supported Locator entity type list.

Fixed repeated sources such as Directory can remove their wrapper-level source schema override when `fixedRepeatedField` and `disableConstantValueToggle` already describe their restrictions. Keep `slottedItemSource` ownership metadata and individual mapping overrides for opaque custom editors, such as Directory's link override. Mapping requiredness still follows declared generation metadata and defaults; use `required: false` where an old optional source/mapping contract requires it. A complete component schema still bypasses inference.

Number fields such as Emails' list length and NearbyLocations' limit can replace repeated integer/bounds schemas with `generation: { integer: true }`, keeping `min` and `max` on the native field. Preserve optionality explicitly with `required: false` where needed.

Use `resolveCanonicalSelectorGroups`, exported through `section-library-support`, to expand a canonical ThemeOptions key into ordinary selector groups. Group options remain static arrays; titles and descriptions can be customized. For example, header/footer widths can replace `getMaxWidthOptions()` snapshots and width-schema overrides with:

```ts
import { resolveCanonicalSelectorGroups } from "@yext/visual-editor/section-library-support";

const maxWidthField = {
  type: "basicSelector",
  generation: { nullable: true },
  optionGroups: [
    ...resolveCanonicalSelectorGroups("MAX_WIDTH").map((group) => ({
      ...group,
      description: "Match the page content grid.",
    })),
  ],
};
```

Canonical groups use shared stable options for both the editor UI and inference. Width groups include `default`, `theme`, `fullWidth`, and all fixed widths without reading a mounted theme; explicitly declared option arrays retain their own restrictions. Existing top-level selectors and `getMaxWidthOptions()` keep their editor behavior. Replacing a dynamically filtered width snapshot with a canonical group deliberately offers the full supported list. No saved values change and no migration is required.
