# Hooks

## useDocumentProvider

Use this hook to capture the entityDocument from the Yext platform in your `edit.tsx` file.
This is a requirement to make your repo VE compatible and should only be used once - in `edit.tsx`.
Meant to be used in conjunction with the [DocumentProvider](https://github.com/yext/pages/blob/main/packages/pages/src/util/README.md#documentprovider) from @yext/pages.

### Usage

```tsx
import { Editor, useDocumentProvider } from "@yext/visual-editor";

const entityDocument = useDocumentProvider();

return (
  <DocumentProvider value={entityDocument}>
    <Editor document={entityDocument} componentRegistry={componentRegistry} />
  </DocumentProvider>
);
```
