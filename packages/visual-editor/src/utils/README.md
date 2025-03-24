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

## getFontSizeOptions

### Props

| Name              | Type     | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| includeLargeSizes | boolean? | Defaults to true. If set to false, only returns XS to 4XL |

### Usage

Returns a list of font size options to be optionally used in the theme.config. The labels and values correspond to tailwind's default classes.

| Tailwind Class | Label       | Value |
| -------------- | ----------- | ----- |
| text-xs        | XS (12px)   | 12px  |
| text-sm        | SM (14px)   | 14px  |
| text-base      | Base (16px) | 16px  |
| text-lg        | LG (18px)   | 18px  |
| text-xl        | XL (20px)   | 20px  |
| text-2xl       | 2XL (24px)  | 24px  |
| text-3xl       | 3XL (30px)  | 30px  |
| text-4xl       | 4XL (36px)  | 36px  |
| text-5xl       | 5XL (48px)  | 48px  |
| text-6xl       | 6XL (60px)  | 60px  |
| text-7xl       | 7XL (72px)  | 72px  |
| text-8xl       | 8XL (96px)  | 96px  |
| text-9xl       | 9XL (128px) | 128px |

## getBorderRadiusOptions

Returns a list of border radius options to be optionally used in the theme.config. The labels and values correspond to tailwind's default classes.

| Tailwind Class | Label         | Value  |
| -------------- | ------------- | ------ |
| rounded-none   | None (0px)    | 0px    |
| rounded-xs     | XS (2px)      | 2px    |
| rounded-sm     | SM (4px)      | 4px    |
| rounded-md     | MD (6px)      | 6px    |
| rounded-lg     | LG (8px)      | 8px    |
| rounded-xl     | XL (12px)     | 12px   |
| rounded-2xl    | 2XL (16px)    | 16px   |
| rounded-3xl    | 3XL (24px)    | 24px   |
| rounded-full   | Full (9999px) | 9999px |

## getSpacingOptions

### Props

| Name        | Type   | Description              |
| ----------- | ------ | ------------------------ |
| spacingType | string | Either "padding" or "gap |

Returns a list of spacing options to be optionally used in the theme.config. It can be used for padding or gap. The labels and values correspond to tailwind's default classes.

| Label      | Value |
| ---------- | ----- |
| 0 (0px)    | 0     |
| 0.5 (2px)  | 0.5   |
| 1 (4px)    | 1     |
| 1.5 (6px)  | 1.5   |
| 2 (8px)    | 2     |
| 2.5 (10px) | 2.5   |
| 3 (12px)   | 3     |
| 3.5 (14px) | 3.5   |
| 4 (16px)   | 4     |
| 5 (20px)   | 5     |
| 6 (24px)   | 6     |
| 7 (28px)   | 7     |
| 8 (32px)   | 8     |
| 9 (36px)   | 9     |
| 10 (40px)  | 10    |
| 11 (44px)  | 11    |
| 12 (48px)  | 12    |
| 14 (56px)  | 14    |
| 16 (64px)  | 16    |
| 20 (80px)  | 20    |
| 24 (96px)  | 24    |

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
