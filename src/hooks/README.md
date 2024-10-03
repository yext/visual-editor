# Hooks

## usePlatformBridgeDocument

Use this hook to capture the entityDocument from the Yext platform in your `edit.tsx` file.
This is a requirement to make your repo VE compatible and should only be used once - in `edit.tsx`.

Meant to be used in conjunction with the [DocumentProvider](https://github.com/yext/pages/blob/main/packages/pages/src/util/README.md#documentprovider) from @yext/pages. This provides the data for [useDocument()](https://github.com/yext/pages/blob/main/packages/pages/src/util/README.md#usedocument) to capture while viewing templates from the Visual Editor in platform.

### Usage

```tsx
import { Editor, usePlatformBridgeDocument } from "@yext/visual-editor";
import { DocumentProvider } from "@yext/pages/util";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();

  return (
    <DocumentProvider value={entityDocument}>
      <Editor document={entityDocument} componentRegistry={componentRegistry} />
    </DocumentProvider>
  );
};
```

## EntityFieldsProvider

Use this component in your `edit.tsx` file. Required for components using the [useEntityFields](#useentityfields) or [usePlatformBridgeEntityFields](#usePlatformBridgeEntityFields) hook.

### Usage

```tsx
import {
  Editor,
  usePlatformBridgeDocument,
  usePlatformBridgeEntityFields,
  EntityFieldsProvider,
} from "@yext/visual-editor";
import { DocumentProvider } from "@yext/pages/util";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <DocumentProvider value={entityDocument}>
      <EntityFieldsProvider entityFields={entityFields}>
        <Editor
          document={entityDocument}
          componentRegistry={componentRegistry}
        />
      </EntityFieldsProvider>
    </DocumentProvider>
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
  EntityFieldsProvider,
} from "@yext/visual-editor";
import { DocumentProvider } from "@yext/pages/util";

const Edit: () => JSX.Element = () => {
  const entityDocument = usePlatformBridgeDocument();
  const entityFields = usePlatformBridgeEntityFields();

  return (
    <DocumentProvider value={entityDocument}>
      <EntityFieldsProvider entityFields={entityFields}>
        <Editor
          document={entityDocument}
          componentRegistry={componentRegistry}
        />
      </EntityFieldsProvider>
    </DocumentProvider>
  );
};
```

## useEntityFields

A React hook that returns entityFields available to your TemplateConfig's stream. Must be used within an [EntityFieldsProvider](#entityfieldsprovider).
