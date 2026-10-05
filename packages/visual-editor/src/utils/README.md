---
title: Utility Functions
outline: deep
---

# Utils

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
- `value`: helper-owned prop type marker for `typeof itemSource.value`
- `resolveItems(value, streamDocument)`: render-ready repeated items
- `populateSlots(data, streamDocument)`: updated wrapper data with `CardSlot`
  populated for linked or manual mode

### Usage

Use this helper when the wrapper owns one repeated `CardSlot` and each item
should become a nested card component. See the `FeaturedItems` / `ItemCard`
example in [editor/README.md](../editor/README.md#linked-entity-item-sources).

## ThemeConfig

The ThemeConfig object defines the styles available for editing in Theme Manager. It is used
by themeResolver, applyTheme, and Editor.

### Defining a ThemeConfig

Each style must specify a label, type, default value, and plugin. The label will be displayed in the
Theme Manager UI. The type can be "color", "number" or "select". If type "select", an array of options
must be provided too. The plugin field must contain one of [Tailwind's Theme Extension Keys](https://v3.tailwindcss.com/docs/theme#configuration-reference), which will determine which Tailwind utilities use the style. Styles that share
a plugin can be nested one level deep together under a shared label.

```ts
export const themeConfig: ThemeConfig = {
  sectionA: {
    label: "Section A",
    styles: {
      style1: {
        label: "Style 1",
        type: "number",
        default: 0,
        plugin: "fontSize",
      },
      style2: {
        label: "Style 2",
        plugin: "colors",
        styles: {
          substyleA: {
            label: "Sub-Style A"
            type: "color"
            default: "#000000"
          },
          substyleB: {
            label: "Sub-Style B"
            type: "color"
            default: "#FFFFFF"
          },
        },
      },
    },
  },
  sectionB: {
    label: "Section B"
    styles: {
      style3: {
        label: "Style 3",
        type: "select",
        default: "normal",
        options: [
          {value: "normal", label: "Normal"}
          {value: "bold", label: "Bold"}
        ]
        plugin: "fontWeight",
      },
    },
  },
};
```

The Theme Manager UI will display the theme configuration fields in the order
and structure specified in the themeConfig.

### Using Theme Manager Classes

Theme Manager uses Tailwind to create classes of the following form: `[tailwindUtility]-[sectionName]-[styleName]-[subStyleName?]` where `tailwindUtility` is the Tailwind Utility class prefix used by the style's core plugin. These classes should be used in components to apply the Theme Manager styles.

For example, in the themeConfig above, the following classes would be available:

- `text-parentA-style1`
- `text-parentA-style2-substyleA`
- `text-parentA-style2-substyleB`
- ... other color utilities such as `bg-parentA-style2-substyleA`
- `font-parentB-style3`

### Referencing Other Theme Values

Underlying these classes are a set of CSS variables that follow the form `--[pluginName]-[sectionName]-[styleName]-[subStyleName?]`.

The themeConfig above creates the following CSS variables:

- `--fontSize-parentA-style1`
- `--colors-parentA-style2-substyleA`
- `--colors-parentA-style2-substyleB`
- `--fontWeight-parentB-style3`

It is not necessary to directly use these CSS variables. However, they can be used to link styles together.

#### Example

```ts
export const themeConfig: ThemeConfig = {
  palette: {
    label: "Color Palette",
    styles: {
      primary: {
        label: "Primary",
        type: "color",
        default: "black",
        plugin: "colors",
      },
      secondary: {
        label: "Secondary",
        type: "color",
        default: "white",
        plugin: "colors",
      },
    },
  },
  headings: {
    label: "Headings"
    styles: {
      textColor: {
        label: "Text Color",
        type: "select",
        default: "var(--colors-palette-primary)",
        options: [
          {value: "var(--colors-palette-primary)", label: "Primary"}
          {value: "var(--colors-palette-secondary)", label: "Secondary"}
        ]
        plugin: "colors",
      },
    },
  },
};
```

This example creates the following classes:

- `text-palette-primary`
- `text-palette-secondary`
- ... other color utilities like bg-palette-primary
- `text-headings-textColor` - can switch between the primary or secondary color

## themeResolver

Used in tailwind.config.ts to combine hard-coded styles with editable Theme Manager styles.

### Props

| Name             | Type                | Description                                             |
| ---------------- | ------------------- | ------------------------------------------------------- |
| developerTheming | Record<string, any> | Tailwind theme extensions not editable in Theme Manager |
| marketerTheming  | ThemeConfig         | The styles to be available in Theme Manager             |

### Usage

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { themeConfig } from "./theme.config";
import { themeResolver } from "@yext/visual-editor";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: themeResolver(
      {}, // developer styles
      themeConfig // Theme Manager styles
    ),
  },
  plugins: [],
} satisfies Config;
```

## applyTheme

Used as part of the [Head Config Interface](https://github.com/yext/pages/blob/main/packages/pages/docs/api/pages.headconfig.md) to apply the styles set in Theme Manager to a template.

### Props

| Name        | Type                | Description                                  |
| ----------- | ------------------- | -------------------------------------------- |
| document    | Record<string, any> | The Yext entity document                     |
| themeConfig | ThemeConfig         | The styles available in Theme Manager        |
| base?       | string              | Additional data to be injected into the head |

### Usage

```tsx
// exampleTemplate.tsx
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    // -- additional HeadConfig options --
    other: applyTheme(document, themeConfig),
  };
};
```

## Fonts

### Type FontRegistry

An object that map font names to FontSpecifications.

### Type FontSpecification

| Name      | Type    | Description                              |
| --------- | ------- | ---------------------------------------- |
| italics   | boolean | Whether the font supports italics        |
| minWeight | number  | The minimum weight supported by the font |
| maxWeight | number  | The maximum weight support by the font   |
| fallback  | string  | The fallback font                        |

### defaultFonts

A FontRegistry of default fonts for use in Visual Editor.

### constructFontSelectOptions

Transforms a FontRegistry into a list of StyleSelectOptions.

#### Usage

```tsx
const fonts: FontRegistry = {
  Georgia: {
    allowItalics: true,
    minWeight: 400,
    maxWeight: 900,
    fallback: "serif",
  }, // other developer-defined fonts
  ...defaultFonts,
};
const fontOptions = constructFontSelectOptions(fonts);

export const themeConfig: ThemeConfig = {
  heading1: {
    label: "Heading",
    styles: {
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Georgia', serif",
      },
    },
  },
};
```

### getFontWeightOptions

Returns the options for font weight for use in theme.config.
Can filter based on the currently selected font.

#### Params

| Name            | Type              | Description                                                                                                        |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| fontCssVariable | string?           | The CSS variable of a font. Determines which weights are available. If not provided, all weights will be returned. |
| weightOptions   | StyleSelectOption | The available font options. Defaults to weights 100-900 in increments of 100.                                      |
| fontList        | FontRegistry      | Provides the available weights for each font. If not provided, uses defaultFonts.                                  |

#### Usage

```tsx
export const themeConfig: ThemeConfig = {
  heading1: {
    label: "Heading",
    styles: {
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: () =>
          getFontWeightOptions({
            cssVariable: "--fontFamily-heading1-fontFamily",
          }),
        default: "700",
      },
    },
  },
};
```

### getFontWeightOverrideOptions

Returns the options for font weight for use in components.
Can filter based on the currently selected font.

#### Params

| Name            | Type              | Description                                                                                                        |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| fontCssVariable | string?           | The CSS variable of a font. Determines which weights are available. If not provided, all weights will be returned. |
| weightOptions   | StyleSelectOption | The available font options. Defaults to weights 100-900 in increments of 100.                                      |
| fontList        | FontRegistry      | Provides the available weights for each font. If not provided, uses defaultFonts.                                  |

#### Usage

```tsx
export const MyComponent: ComponentConfig<MyComponentProps> = {
  label: "Component",
  fields: myComponentFields,
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: "--fontFamily-body-fontFamily",
    });
    return {
      ...myComponentFields,
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: fontWeightOptions,
      },
    };
  },
  render: (props) => <Component {...props} />,
};
```

## VisualEditorProvider

Use this component in your `edit.tsx` file. Required for components using the [useEntityFields](#useentityfields) or [usePlatformBridgeEntityFields](#usePlatformBridgeEntityFields) hook, and to allow styling options to update based on your Tailwind config.

### Usage

```tsx
import {
  Editor,
  usePlatformBridgeDocument,
  usePlatformBridgeEntityFields,
  EntityFieldsProvider,
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
      <Editor
        document={entityDocument}
        componentRegistry={componentRegistry}
        themeConfig={themeConfig}
      />
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

const componentVariants = cva("components font-body-fontWeight", {
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

Check that the string is a valid slug.

## validateSlug

Normalizes the provided content by converting upper case to lower case, replacing white spaces, '?', and '#', with a "-",
and stripping all other illegal characters.
Allowed special characters: `( ) [ ] _ ~ : @ ; = / $ * - . &`

## defaultThemeTailwindExtensions

A set of Tailwind extensions to complement the default theme.config, including additional auto-generated colors.

#### Usage

```tsx
// tailwind.config.ts
theme: {
  extend: themeResolver(defaultThemeTailwindExtensions, themeConfig),
},
```

## backgroundColors

An object of the following shape containing the seven auto-generated background styles.

```js
{
  backgroundKey: {
    label: "Background Label",
    value: "Background Tailwind Classes"
  }
}
```

| Key         | Label        | Background Color | Text Color |
| ----------- | ------------ | ---------------- | ---------- |
| background1 | Background 1 | white            | black      |
| background2 | Background 2 | primary-light    | black      |
| background3 | Background 3 | secondary-light  | black      |
| background4 | Background 4 | tertiary-light   | black      |
| background5 | Background 5 | quaternary-light | black      |
| background6 | Background 6 | primary-dark     | white      |
| background7 | Background 7 | secondary-dark   | white      |

## darkBackgroundColors

An object of the following shape containing the two auto-generated dark background styles.

```js
{
  backgroundKey: {
    label: "Background Label",
    value: "Background Tailwind Classes"
  }
}
```

| Key         | Label        | Background Color | Text Color |
| ----------- | ------------ | ---------------- | ---------- |
| background6 | Background 6 | primary-dark     | white      |
| background7 | Background 7 | secondary-dark   | white      |

## applyAnalytics

Returns a Google Tag Manager script that uses the Google Tag Manager ID
set in the Theme Editor.

### Usage

```tsx
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    title: document.name,
    other: [applyAnalytics(document), applyTheme(document, themeConfig)].join(
      "\n"
    ),
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
| CTA_VARIANT      | [`ctaVariantOptions`](#ctaVariantOptions)           |
| ALIGNMENT        | [`alignmentOptions`](#alignmentOptions)             |
| JUSTIFY_CONTENT  | [`justifyContentOptions`](#justifyContentOptions)   |
| BODY_VARIANT     | [`bodyVariantOptions`](#bodyVariantOptions)         |
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

#### backgroundColorOptions

| Label        | Value                         |
| ------------ | ----------------------------- |
| Background 1 | `bg-white`                    |
| Background 2 | `bg-palette-primary-light`    |
| Background 3 | `bg-palette-secondary-light`  |
| Background 4 | `bg-palette-tertiary-light`   |
| Background 5 | `bg-palette-quaternary-light` |
| Background 6 | `bg-palette-primary-dark`     |
| Background 7 | `bg-palette-secondary-dark`   |

#### textTransformOptions

| Label      | Value        |
| ---------- | ------------ |
| Normal     | "none"       |
| Uppercase  | "uppercase"  |
| Lowercase  | "lowercase"  |
| Capitalize | "capitalize" |

#### ctaVariantOptions

| Label     | Value       |
| --------- | ----------- |
| Primary   | "primary"   |
| Secondary | "secondary" |
| Link      | "link"      |

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

#### bodyVariantOptions

| Label | Value  |
| ----- | ------ |
| Small | "sm"   |
| Base  | "base" |
| Large | "lg"   |

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
      variant: {
        label: "Variant",
        type: "radio",
        options: ThemeOptions.CTA_VARIANT,
      },
    },
  },
```

## migrate

`migrate` transforms Puck layout data to handle updates to the Puck version and to `visual-editor` components.
It is run when data is loaded into the editor (both published and save state). It should also be
run before using `<Render>` in a template. It does not currently handle dropzones but will be updated
in a future version to handle slots.

`migrate` first runs Puck's `migrate` function to handle Puck migrations and then applies
the migrations specified in `components/migrations/migrationRegistry.ts`.

A version number is stored in `data.root.props.version` of the layout data. This corresponds to
the index of the last applied migration from the `migrationRegistry`.

Migrations should be specified as a map of ComponentName to MigrationAction.
The ComponentName is the name of a component as provided to Puck Config in the `components` object
(see `components/_componentCategories.ts`).

There are three type of MigrationActions:

```ts
{
  ComponentName: {
    action: "removed"
    // This component will be removed from all layouts
  },
  ComponentName: {
    action: "renamed"
    newName: string;
    // This component will be renamed in all layouts
    // Updates Puck's "type" property in data
  },
  ComponentName: {
    action: "updated"
    propTransformation: (oldProps: Record<string, any>) => Record<string, any>;
    // The Puck props of this component will be updated
    // See Puck's transformProps documentation
  }
}
```

## withPropOverrides

`withPropOverrides` lets you inject specific props into a component's `render` function. This is useful for customizing all instances of a component without making the value visible via fields in the Editor.

### Example

Given a component like this:

```ts
interface MockProps {
  name: string;
}

const Mock: ComponentConfig<MockProps> = {
  label: "Mock",
  render: (props) => <>Hello {props.name}</>,
};
```

You can inject `name` like this:

```ts
withPropOverrides(Mock, {
  name: "World",
});
```

and would end up with a component that shows "Hello World"
