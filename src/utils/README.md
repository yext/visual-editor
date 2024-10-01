# Utils

## resolveVisualEditorData

This is a helper function to be used in transformProps within your template tsx files (ex.
`location.tsx`).

### Params

| Name         | Type   | Usage                                              |
| ------------ | ------ | -------------------------------------------------- |
| data         | any    | pass through document from transformProps args     |
| templateName | string | name of the template you defined in TemplateConfig |

### Usage

```tsx
export const transformProps = async (data) => {
  return resolveVisualEditorData(data, "location");
};
```

### resolveYextEntityField

Used in a component's render function to pull in the selected entity field's value from the document or use the constant value.

#### Props

| Name        | Type                |
| ----------- | ------------------- |
| document    | Record<string, any> |
| entityField | YextEntityField     |

### Usage

See [YextEntityFieldSelector](../components/README.md#YextEntityFieldSelector)
