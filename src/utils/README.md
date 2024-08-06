# Utils

## resolveVisualEditorData

This is a helper function to be used in transformProps within your template tsx files (ex.
`location.tsx`).

### Params

| Name                       | Type                  |
| -------------------------- | --------------------- |
| entityConfigurations       | VisualConfiguration[] |
| entityLayoutConfigurations | PagesLayout[]         |
| siteLayoutConfigurations   | VisualLayout[]        |
| templateName               | string or undefined   |

### Usage

```tsx
export const transformProps = async (data) => {
  const { document } = data;
  const entityConfigurations = document.c_visualConfigurations ?? [];
  const entityLayoutConfigurations = document.c_pages_layouts ?? [];
  const siteLayoutConfigurations = document._site?.c_visualLayouts;
  return resolveVisualEditorData(
    entityConfigurations,
    entityLayoutConfigurations,
    siteLayoutConfigurations,
    "location"
  );
};
```
