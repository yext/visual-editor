# Utils

## resolveVisualEditorData

This is a helper function to be used in transformProps within your template tsx files (ex.
`location.tsx`).

### Params

| Name         | Type   | Usage                                              |
| ------------ | ------ | -------------------------------------------------- |
| data         | any    | pass through document from transformProps args     |
| templateName | string | name of the template defined in the TemplateConfig |

### Usage

```tsx
export const transformProps = async (data) => {
  return resolveVisualEditorData(data, "location");
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

See [YextEntityFieldSelector](../components/README.md#YextEntityFieldSelector)

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

console.log(themeResolver({}, themeConfig));

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

Used in Head Config to apply the styles set in Theme Manager.

### Props

| Name        | Type                | Description                                  |
| ----------- | ------------------- | -------------------------------------------- |
| document    | Record<string, any> | The Yext stream document                     |
| themeConfig | ThemeConfig         | The styles to be available in Theme Manager  |
| base?       | string              | Additional data to be injected into the head |

### Usage

```tsx
// exampleTemplate.tsx
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    // -- additional getHeadConfig options --
    other: applyTheme(document, themeConfig),
  };
};
```
