---
title: Utility Functions
outline: deep
---

# Utils

## Versioned theme payload

`themeDataSchema`, `ThemeData`, `validateThemeData`, `ThemeColorReference`,
`defaultThemeData`, `resolveThemeEntry`, and `resolveThemeColor` are available
from `@yext/visual-editor`. The validation implementation has no browser dependency.

```ts
import { defaultThemeData, validateThemeData } from "@yext/visual-editor";

const theme = structuredClone(defaultThemeData);
theme.colors[0].label = "Paper";
theme.colors[0].background = "linear-gradient(90deg, #FFFFFF, #EAF2FF80)";
const result = validateThemeData(theme);
if (!result.success) {
  console.error(result.errors); // severity, code, path, message
}
console.log(result.warnings); // recoverable missing/incompatible references
```

The version 1 payload has ordered, nonempty `colors`, `typography`, and `actions`
collections, plus fixed `page` settings. Entries have immutable `id` values and
editable `label` values. Labels never become CSS names. Reordering changes the
default option while existing selections keep their identifiers.

Typography entries own explicit desktop and mobile sizes and line heights.
Action entries own independent typography, a `button` or `link` presentation,
and complete `default`, `hover`, and `active` states. Button entries additionally
own padding, radius, border width, and state backgrounds and borders. State
colors are `{ colorId, channel: "background" | "foreground" }` references.
Validation never fills missing properties. `defaultThemeData` contains complete
entries materialized from the recorded `main` baseline; clone it before editing.

Supported shared colors are hex (including alpha), RGB/RGBA, HSL/HSLA,
`transparent`, `black`, and `white`. Backgrounds also support linear and radial
gradients with those colors. Foregrounds are solid colors. Missing references
fall back to the first compatible color without changing saved selections. A
gradient cannot supply a text or border color; if every background is a gradient,
the first foreground supplies the solid fallback.

Versioned payloads use the same CSS builder for published output and both editor
documents. Shared atoms accept `typographyId`, `actionId`, and `backgroundId`
selections; heading semantics remain separate. `ThemeCollectionField` exposes
the live ordered collections to custom section controls. Pass `themeData` to
`createPuckGenerationCatalog` to infer theme collection schemas, retaining each
option's label in JSON Schema.

Theme loading converts unversioned saved data before rendering. The append-only
layout migration converts palette, heading, and action selections to deterministic
site-wide identifiers while retaining component literals and overrides. Theme
undo/redo entries are upgraded independently, preserving their identities and order.
The theme editor saves only complete validated payloads. Its collection controls
support adding, renaming, reordering, and deleting entries; the final entry cannot
be deleted. Set Theme Data uses the same public validation contract.

Baseline fixtures and source commits are recorded under
`src/internal/theme/fixtures/main`. The conversion uses those frozen defaults,
not the current theme or the first page opened.

## getPageMetadata

Returns an object containing the key/value pairs from the root/page level configuration.

These can be used to populate meta fields on the live page in getHeadConfig.

### Props

| Name     | Type                |
| -------- | ------------------- |
| document | Record<string, any> |

### Usage

```ts
// src/templates/<template>.tsx in site repository
import { TemplateRenderProps, GetHeadConfig, HeadConfig } from "@yext/pages";
import { getPageMetadata } from "@yext/visual-editor";

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  const { title, description } = getPageMetadata(document);
  return {
    title: title,
    tags: [
      {
        type: "meta",
        attributes: {
          name: "description",
          content: description,
        },
      },
    ],
  };
};
```

## getSchema

Generates page schema using the mode selected in Advanced Settings:

- **Recommended** returns a JSON-LD object containing an `@graph` of schema blocks.
- **Custom** returns the rendered markup from a Handlebars template.

Recommended is the default mode. Each mode keeps its own editable content.

### Usage

Use the result in the page's `getHeadConfig`:

```ts
import { getSchema } from "@yext/visual-editor";
import { SchemaWrapper } from "@yext/pages-components";

const schema = getSchema(data);
const other = typeof schema === "string" ? schema : SchemaWrapper(schema);
```

### Recommended schema

Recommended uses a JSON configuration with entity placeholders such as
`[[name]]`, `[[address.city]]`, and `[[path]]`. The editor starts with a default
for the page's entity type, which you can customize in Advanced Settings.

| Page entity                                          | Default schema type                                        |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| Business entities, such as locations and restaurants | `LocalBusiness` or a subtype based on the primary category |
| Directory entities (`dm_*`)                          | `CollectionPage`                                           |
| Locator                                              | `WebPage`                                                  |
| Other entities                                       | `Thing`                                                    |

The business default uses `[[primaryCategory]]` for its schema type. It shares
the category mapping used by the Custom `businessType` helper. Empty fields are
omitted from Recommended output. Page URLs use `siteDomain` when available and
relative URLs otherwise.

Some schema properties format entity data automatically:

| Property / placeholder                       | Output                                                                                          | Formatting helper                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `openingHours` with `[[hours]]`              | Opening-hours strings                                                                           | `OpeningHoursSchema`                                                              |
| `openingHoursSpecification` with `[[hours]]` | `OpeningHoursSpecification` objects                                                             | `OpeningHoursSpecificationSchema`                                                 |
| `image` with `[[photoGallery]]`              | Image URLs                                                                                      | `PhotoGallerySchema`                                                              |
| `hasOfferCatalog` with `[[services]]`        | An `OfferCatalog` containing `Offer` and `Service` entries                                      | Automatic service conversion                                                      |
| `[[dm_directoryChildren]]`                   | Ordered `ListItem` entries with child names, resolved page URLs, and available location details | Automatic directory conversion; `OpeningHoursSpecificationSchema` for child hours |

These conversions apply to the selected entity field; for example,
`"openingHoursSpecification": "[[c_customHours]]"` uses the same hours helper.

#### Breadcrumbs and ratings

For pages with an entity type other than `locator`, Recommended also includes
these blocks when the corresponding data is available:

- **`BreadcrumbList`** lists directory parents in order, followed by the current
  page. A directory root includes its own breadcrumb even without parents.
  Parent URLs use the supplied `slug` with the site domain or `/` prefix,
  without additional slug normalization. The current-page entry uses the
  resolved page URL.
- **`AggregateRating`** uses the average rating and review count from
  `FIRSTPARTY` entries in `ref_reviewsAgg`. It requires an `@id` on the main
  schema block and links to that block through its identifier.

The generated block identifiers use the current page entity's `uid`:

| Block            | `@id` with a site domain                          | `@id` without a site domain |
| ---------------- | ------------------------------------------------- | --------------------------- |
| Breadcrumbs      | `https://[[siteDomain]]/#[[uid]]-breadcrumbs`     | `#[[uid]]-breadcrumbs`      |
| Aggregate rating | `https://[[siteDomain]]/#[[uid]]-aggregaterating` | `#[[uid]]-aggregaterating`  |

### Custom schema

Custom templates contain complete markup, including script tags. Entity fields
are available at the template root, along with `path` and
`relativePrefixToRoot`. The editor starts with a Handlebars default for the
page's entity type. Saving empty content produces no Custom schema markup.

Use `json` for values inside JSON-LD, since ordinary interpolation is unescaped.
Use schema helpers to build objects and `SchemaWrapper` to produce a complete
script tag:

```handlebars
{{SchemaWrapper (LocalBusiness this (businessType))}}
```

Or write your own schema markup:

```handlebars
<script type="application/ld+json">
  { "@context": "https://schema.org", "@type":
  {{json (businessType)}}, "name":
  {{json name}}
  }
</script>
```

Custom renders the markup you author. Include any desired breadcrumb and rating
blocks in the template.

#### Handlebars helpers

| Helper              | Behavior                                                                                                                      | Example                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `if`                | Renders a block when a value is present or truthy                                                                             | `{{#if description}}...{{/if}}`                        |
| `unless`            | Renders a block when a value is absent or falsy                                                                               | `{{#unless @last}},{{/unless}}`                        |
| `each`              | Iterates an array or object                                                                                                   | `{{#each services}}{{json this}}{{/each}}`             |
| `with`              | Sets the current context for a block                                                                                          | `{{#with address}}{{json city}}{{/with}}`              |
| `lookup`            | Looks up a property or array element dynamically                                                                              | `{{lookup address "city"}}`                            |
| `log`               | Logs values for debugging                                                                                                     | `{{log name}}`                                         |
| `json`              | Serializes a value as JSON, including quotes around strings                                                                   | `{{json name}}`                                        |
| `businessType`      | Returns the current document's primary-category business subtype, defaulting to `LocalBusiness`; accepts an explicit document | `{{businessType}}` or `{{businessType @root}}`         |
| `directoryChildUrl` | Resolves a directory child's URL using the same page-set templates, locale handling, and site domain as Recommended           | `{{json (directoryChildUrl this @root)}}`              |
| `slugify`           | Joins its arguments and normalizes the result as a slug                                                                       | `{{slugify address.city "/" name}}`                    |
| `eq`                | Tests strict equality                                                                                                         | `{{#if (eq meta.entityType.id "location")}}...{{/if}}` |
| `ne`                | Tests strict inequality                                                                                                       | `{{#if (ne status "CLOSED")}}...{{/if}}`               |
| `gt`                | Tests greater than                                                                                                            | `{{#if (gt reviewCount 0)}}...{{/if}}`                 |
| `gte`               | Tests greater than or equal to                                                                                                | `{{#if (gte rating 4)}}...{{/if}}`                     |
| `lt`                | Tests less than                                                                                                               | `{{#if (lt rating 3)}}...{{/if}}`                      |
| `lte`               | Tests less than or equal to                                                                                                   | `{{#if (lte reviewCount 10)}}...{{/if}}`               |
| `and`               | Tests whether all arguments are truthy                                                                                        | `{{#if (and name address)}}...{{/if}}`                 |
| `or`                | Tests whether any argument is truthy                                                                                          | `{{#if (or description mainPhone)}}...{{/if}}`         |
| `not`               | Negates a value's truthiness                                                                                                  | `{{#if (not hidden)}}...{{/if}}`                       |

#### Pages schema helpers

These helpers use the schema builders from `@yext/pages-components`. Serialize
object results with `json`, or wrap a complete schema with `SchemaWrapper`.

| Helper                            | Schema output                                                 | Example                                                 |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| `SchemaWrapper`                   | Complete JSON-LD script tag                                   | `{{SchemaWrapper (LocalBusiness this (businessType))}}` |
| `BaseSchema`                      | Context, type, and name for a document                        | `{{json (BaseSchema this "Thing")}}`                    |
| `LocalBusiness`                   | Business schema; accepts an optional subtype                  | `{{json (LocalBusiness this (businessType))}}`          |
| `Event`                           | Event schema; accepts an optional subtype                     | `{{json (Event this "MusicEvent")}}`                    |
| `Product`                         | Product schema; accepts an optional subtype                   | `{{json (Product this)}}`                               |
| `FAQPage`                         | Questions and answers from an FAQ array                       | `{{json (FAQPage faqs)}}`                               |
| `AddressSchema`                   | An `address` property containing a `PostalAddress`            | `{{json (AddressSchema address)}}`                      |
| `LocationSchema`                  | A `Place` with location details                               | `{{json (LocationSchema location)}}`                    |
| `OpeningHoursSchema`              | An `openingHours` property containing hours strings           | `{{json (OpeningHoursSchema hours)}}`                   |
| `OpeningHoursSpecificationSchema` | Opening-hours and special-hours specification properties      | `{{json (OpeningHoursSpecificationSchema hours)}}`      |
| `OfferSchema`                     | An `offers` property containing an `Offer`                    | `{{json (OfferSchema offer)}}`                          |
| `PerformerSchema`                 | A `performer` property built from performer names             | `{{json (PerformerSchema performers)}}`                 |
| `OrganizationSchema`              | An `organizer` property containing an `Organization`          | `{{json (OrganizationSchema organization)}}`            |
| `PhotoGallerySchema`              | An `image` property containing image URLs                     | `{{json (PhotoGallerySchema photoGallery)}}`            |
| `PhotoSchema`                     | An `image` property containing one image URL                  | `{{json (PhotoSchema photo)}}`                          |
| `ReviewSchema`                    | A `review` property containing a `Review`                     | `{{json (ReviewSchema review)}}`                        |
| `AggregateRatingSchema`           | An `aggregateRating` property containing an `AggregateRating` | `{{json (AggregateRatingSchema rating)}}`               |

## resolveYextEntityField

Used in a component's render function to pull in the selected entity field's value from the document or use the constant value.

### Props

| Name        | Type                |
| ----------- | ------------------- |
| document    | Record<string, any> |
| entityField | YextEntityField     |

### Usage

See [YextEntityFieldSelector](../editor/README.md#YextEntityFieldSelector)

## createItemSource

Creates the field definition and authored-state helpers for a repeated list
component backed by either a linked list field or manual items.

### Input

| Name          | Type                       | Description                                                    |
| ------------- | -------------------------- | -------------------------------------------------------------- |
| label         | string                     | Editor label for the repeated source selector.                 |
| mappingFields | `YextFieldMap<TItemProps>` | Field definitions for one authored repeated item mapping tree. |

### Returns

`createItemSource(...)` returns an object with:

- `field`: one repeated `entityField` definition
- `defaultValue`: default authored state for linked and manual modes
- `value`: helper-owned prop type marker for `typeof articleSource.value`
- `resolveItems(value, streamDocument)`: render-ready repeated items

### Usage

Use this helper when a component needs to render a repeated list from a linked
field while keeping source selection, per-item mappings, and manual fallback
items in a single prop. See the full `ArticleList` / `ArticleCard` example in
[editor/README.md](../editor/README.md#linked-entity-item-sources).

## createSlottedItemSource

Creates the field definition and authored-state helpers for a repeated slot
wrapper whose `CardSlot` children should stay aligned with a linked list field
or manual item order.

### Input

| Name             | Type                       | Description                                                    |
| ---------------- | -------------------------- | -------------------------------------------------------------- |
| label            | string                     | Editor label for the repeated source selector.                 |
| itemLabel        | string                     | Singular item label used for manual add-item summaries.        |
| cardName         | string                     | Optional slot child type. Defaults to `itemLabel`.             |
| defaultItemProps | `Record<string, unknown>`  | Optional starter props used when the helper creates new cards. |
| defaultItems     | number                     | Optional manual-mode seed count. Defaults to 3.                |
| mappingFields    | `YextFieldMap<TItemProps>` | Field definitions for one mapped item.                         |

### Returns

`createSlottedItemSource(...)` returns an object with:

- `field`: one repeated `entityField` definition
- `defaultValue`: default authored state for linked and manual modes
- `defaultWrapperProps`: helper-owned default wrapper props for `data` and `CardSlot`
- `generation`: opt-in slotted-source metadata for `generation.slottedItemSource`
- `value`: helper-owned prop type marker for `typeof itemSource.value`
- `resolveItems(value, streamDocument)`: render-ready repeated items
- `populateSlots(data, streamDocument)`: updated wrapper data with `CardSlot`
  populated for linked or manual mode

### Usage

Use this helper when the wrapper owns one repeated `CardSlot` and each item
should become a nested card component. See the `FeaturedItems` / `ItemCard`
example in [editor/README.md](../editor/README.md#linked-entity-item-sources).

## applyTheme

Used as part of the [Head Config Interface](https://github.com/yext/pages/blob/main/packages/pages/docs/api/pages.headconfig.md) to apply the styles set in Theme Manager to a template.

### Props

| Name                 | Type                | Description                                  |
| -------------------- | ------------------- | -------------------------------------------- |
| document             | Record<string, any> | The Yext entity document                     |
| relativePrefixToRoot | string              | Prefix used to load font assets              |
| base?                | string              | Additional data to be injected into the head |

### Usage

```tsx
// exampleTemplate.tsx
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
  relativePrefixToRoot,
}): HeadConfig => {
  return {
    // -- additional HeadConfig options --
    other: applyTheme(document, relativePrefixToRoot),
  };
};
```

## Fonts

The existing Google font catalog and `FontRegistry` custom-font metadata remain
supported. Every typography group and action preset has its own `fontFamily`.
The editor filters weight and style choices against that font. Action default,
hover, and active weights are inspected when collecting custom-font preloads.
Published pages load fonts used by any group or action; live replacement updates
both editor documents.

`constructFontSelectOptions(customFonts)` converts a registry into selector
options. `getFontWeightOptionsForFontFamily` and
`getFontStyleOptionsForFontFamily` accept concrete font-family values, so controls
need no role-specific CSS variable names.

## VisualEditorProvider

Use this component in your `edit.tsx` file. Required for components using the [useEntityFields](#useentityfields) or [usePlatformBridgeEntityFields](#usePlatformBridgeEntityFields) hook, and to allow styling options to update based on your Tailwind config.

### Usage

```tsx
import {
  Editor,
  usePlatformBridgeDocument,
  usePlatformBridgeEntityFields,
  VisualEditorProvider,
} from "@yext/visual-editor";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <VisualEditorProvider
      templateProps={{
        document: entityDocument,
      }}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
    >
      <Editor document={entityDocument} componentRegistry={componentRegistry} />
    </VisualEditorProvider>
  );
};
```

## themeManagerCn

A configured instance of [tailwind-merge](https://www.npmjs.com/package/tailwind-merge).
Accepts a string and returns merged classes, with the right-most classes taking precedence. Use this in custom components to merge tailwind classes while respecting classes created by the default theme.config. If you customize your theme.config, you will probably need to use your own
tailwind-merge extension.

### Usage

```tsx
import { themeManagerCn } from "@yext/visual-editor";
import { cva } from "class-variance-authority";

const componentVariants = cva("components", {
  variants: {
    fontWeight: {
      default: "",
      bold: "bold",
    },
  },
});

const MyComponent = ({ fontWeight, className }) => {
  return (
    <p
      className={themeManagerCn(
        componentVariants(fontWeight),
        "font-sm",
        className
      )}
    >
      My test
    </p>
  );
};
```

In this example, class names will be merged in the following order of precedence:
`cva` base string < selected `cva` variant(s) (in the order they appear in `componentVariants`'s definition) < the string literal (`"font-sm"`) < `MyComponent`'s `className` prop

## normalizeSlug

Normalizes the provided content by converting upper case to lower case, replacing white spaces, '?', and '#', with a "-",
and stripping all other illegal characters.
Allowed special characters: `( ) [ ] _ ~ : @ ; = / $ * - . &`

## validateSlug

Check that the string is a valid slug.

## defaultThemeTailwindExtensions

Use `defaultThemeTailwindExtensions` for the library's ordinary utility sizes and
gray palette. Theme entry styles are generated directly from the payload and need
no Tailwind theme resolver or per-entry safelist.

## applyAnalytics

Returns a Google Tag Manager script that uses the Google Tag Manager ID
set in the Theme Editor.

### Usage

```tsx
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
  relativePrefixToRoot,
}): HeadConfig => {
  return {
    title: document.name,
    other: [
      applyAnalytics(document),
      applyTheme(document, relativePrefixToRoot),
    ].join("\n"),
  };
};
```

## ThemeOptions

Contains preset options to be used when defining a component's fields.

| Name             | Options                                             |
| ---------------- | --------------------------------------------------- |
| HEADING_LEVEL    | [`headingLevelOptions`](#headingLevelOptions)       |
| TEXT_TRANSFORM   | [`textTransformOptions`](#textTransformOptions)     |
| LETTER_SPACING   | [`letterSpacingOptions`](#letterSpacingOptions)     |
| BACKGROUND_COLOR | [`backgroundColorOptions`](#backgroundColorOptions) |
| ALIGNMENT        | [`alignmentOptions`](#alignmentOptions)             |
| JUSTIFY_CONTENT  | [`justifyContentOptions`](#justifyContentOptions)   |
| BORDER_RADIUS    | [`borderRadiusOptions`](#borderRadiusOptions)       |
| SPACING          | [`spacingOptions`](#spacingOptions)                 |
| FONT_SIZE        | [`fontSizeOptions`](#fontSizeOptions)               |
| HOURS_OPTIONS    | [`hoursOptions`](#hoursOptions)                     |
| PHONE_OPTIONS    | [`phoneOptions`](#phoneOptions)                     |

### Available Options

#### headingLevelOptions

| Label | Value |
| ----- | ----- |
| H1    | 1     |
| H2    | 2     |
| H3    | 3     |
| H4    | 4     |
| H5    | 5     |
| H6    | 6     |

#### letterSpacingOptions

| Label             | Value      |
| ----------------- | ---------- |
| Tighter (-0.05em) | "-0.05em"  |
| Tight (-0.025em)  | "-0.025em" |
| Normal (0em)      | "0em"      |
| Wide (0.025em)    | "0.025em"  |
| Wider (0.05em)    | "0.05em"   |
| Widest (0.1em)    | "0.1em"    |

#### textTransformOptions

| Label      | Value        |
| ---------- | ------------ |
| Normal     | "none"       |
| Uppercase  | "uppercase"  |
| Lowercase  | "lowercase"  |
| Capitalize | "capitalize" |

#### alignmentOptions

| Label  | Value    |
| ------ | -------- |
| Left   | "left"   |
| Center | "center" |
| Right  | "right"  |

#### justifyContentOptions

| Label  | Value    |
| ------ | -------- |
| Start  | "start"  |
| Center | "center" |
| End    | "end"    |

#### fontSizeOptions

| Label       | Value   |
| ----------- | ------- |
| XS (12px)   | "12px"  |
| SM (14px)   | "14px"  |
| Base (16px) | "16px"  |
| LG (18px)   | "18px"  |
| XL (20px)   | "20px"  |
| 2XL (24px)  | "24px"  |
| 3XL (30px)  | "30px"  |
| 4XL (36px)  | "36px"  |
| 5XL (48px)  | "48px"  |
| 6XL (60px)  | "60px"  |
| 7XL (72px)  | "72px"  |
| 8XL (96px)  | "96px"  |
| 9XL (128px) | "128px" |

#### hoursOptions

| Label     | Value       |
| --------- | ----------- |
| Monday    | "monday"    |
| Tuesday   | "tuesday"   |
| Wednesday | "wednesday" |
| Thursday  | "thursday"  |
| Friday    | "friday"    |
| Saturday  | "saturday"  |
| Sunday    | "sunday"    |
| Today     | "today"     |

#### phoneOptions

| Label         | Value           |
| ------------- | --------------- |
| Domestic      | "domestic"      |
| International | "international" |

### Usage

```tsx
const myComponentFields: Fields<MyComponentProps> = {
  heading: {
    type: "object",
    label: "Heading",
    objectFields: {
      level: {
        type: "basicSelector",
        label: "Level",
        options: ThemeOptions.HEADING_LEVEL,
      },
    },
  },
  cta: {
    type: "object",
    label: "Call to Action",
    objectFields: {
      actionId: {
        label: "Action preset",
        type: "themeCollection",
        collection: "actions",
      },
    },
  },
```
