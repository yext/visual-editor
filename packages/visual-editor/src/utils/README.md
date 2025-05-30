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

## resolveYextEntityField

Used in a component's render function to pull in the selected entity field's value from the document or use the constant value.

### Props

| Name        | Type                |
| ----------- | ------------------- |
| document    | Record<string, any> |
| entityField | YextEntityField     |

### Usage

See [YextEntityFieldSelector](../editor/README.md#YextEntityFieldSelector)

## resolveYextSubfield

Used in a component's render function to pull in the selected subfield's value from the document or use the constant value.

### Props

| Name        | Type                |
| ----------- | ------------------- |
| document    | Record<string, any> |
| entityField | YextEntityField     |

### Usage

```tsx
const { text, image, collection } = props;
const { items, limit } = collection;
const resolvedParent = resolveYextEntityField(document, items);

// Return one card with resolved subfields for each item in the parent
return (
  <div>
    {resolvedParent
      ?.slice(0, typeof limit !== "number" ? undefined : limit)
      .map((item, i) => {
        const resolvedImage = resolveYextSubfield(item, image);
        const resolvedText = resolveYextSubfield(item, text);
        return (
          <ExampleRepeatableItemCard
            key={i}
            image={resolvedImage}
            text={resolvedText}
          />
        );
      })}
  </div>
);
```

## handleResolveFieldsForCollections

Use this function in Puck's `resolveFields` to handle collection field update.
This function updates the `collection` prop, returns information about how to update
field collection subfields, and resets subfields when the parent or parent field has changed.

### Props

| Name   | Type                                   |
| ------ | -------------------------------------- |
| data   | the Puck `resolveFields` data object   |
| params | the Puck `resolveFields` params object |

### Usage

```tsx
export const ExampleRepeatableItemComponent: ComponentConfig<ExampleRepeatableItemProps> = {
  fields: fields,
  resolveFields: (data, params) => {
    // Set the collection prop and determine how to update fields
    const { shouldReturnLastFields, isCollection, directChildrenFilter } =
      handleResolveFieldsForCollections(data, params);

    // Unnecessary field updates can lead to the fields losing focus
    if (shouldReturnLastFields) {
      return params.lastFields;
    }

    // Update each subfield based on isCollection
    return {
      ...params.lastFields,
      text: YextCollectionSubfieldSelector<any, string>({
        label: "Text",
        isCollection: isCollection,
        filter: {
          directChildrenOf: directChildrenFilter,
          types: ["type.string"],
        },
      }),
      image: YextCollectionSubfieldSelector<any, ImageType>({
        label: "Image",
        isCollection: isCollection,
        filter: {
          directChildrenOf: directChildrenFilter,
          types: ["type.image"],
        },
      }),
      // ... other subfields
    } as Fields<ExampleRepeatableItemProps>;
  },
  defaultProps: ...defaultProps,
}
```

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
      level: BasicSelector("Level", ThemeOptions.HEADING_LEVEL),
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

### Supported usages for in-repo developers

This allows in-repo developers to specify the env var to be used for the NearbyLocationsSection's content endpoint. All other props may be overriden as well but that is not necessarily a recommended usage as most props rely on values input via the editor.

```ts
export const mockConfig: Config<MockProps> = {
  components: {
    NearbyLocationsSection: withPropOverrides(NearbyLocationsSection, {contentEndpointIdEnvVar: "YEXT_PUBLIC_FOO"})
  },
  .....
}
```
