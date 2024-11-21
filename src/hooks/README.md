# Hooks

## usePlatformBridgeDocument

Use this hook to capture the entityDocument from the Yext platform in your `edit.tsx` file.
This is a requirement to make your repo VE compatible and should only be used once - in `edit.tsx`.

Meant to be used in conjunction with the [VisualEditorProvider](https://github.com/yext/pages/blob/main/packages/pages/src/utils/README.md#visualeditorprovider) from @yext/pages. This provides the data for [useDocument()](https://github.com/yext/pages/blob/main/packages/pages/src/util/README.md#usedocument) to capture while viewing templates from the Visual Editor in platform.

### Usage

```tsx
import { Editor, usePlatformBridgeDocument } from "@yext/visual-editor";
import { VisualEditorProvider } from "@yext/pages";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <VisualEditorProvider
      document={entityDocument}
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

## usePlatformBridgeEntityFields

Use this hook to capture the entityFields from the Yext platform in your `edit.tsx` file.
This is a requirement to use mappable entity fields in your component props.
Meant to be used in conjunction with the [EntityFieldsProvider](#entityfieldsprovider).

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
      document={entityDocument}
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

## useEntityFields

A React hook that returns entityFields available to your TemplateConfig's stream. Must be used within an [EntityFieldsProvider](#entityfieldsprovider).
