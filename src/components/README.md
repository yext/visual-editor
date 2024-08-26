# Components

## Editor

Use this component to create an `edit.tsx` page in your Pages repository. This is the first step
in making your repo compatible with the Visual Editor. See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for more
information.

#### Props:

| Name              | Type                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| document          | any (json data from [our hook](../hooks/README.md#usedocumentprovider))              |
| componentRegistry | Map<string, Config<any>> from [@measuredco/puck](https://github.com/measuredco/puck) |

#### Usage:

```tsx
// All the available components for locations
const locationConfig: Config<LocationProps> = {
  components: {...},
  root: {...},
};

const componentRegistry = new Map<string, Config<any>>([
  ["location", locationConfig],
]);


const Edit: () => JSX.Element = () => {
  const entityDocument = useDocumentProvider();

  return (
      <DocumentProvider value={entityDocument}>
        <Editor document={entityDocument} componentRegistry={componentRegistry} />
      </DocumentProvider>
  );
};
```

See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for a more detailed look at the componentRegistry.

## EntityField

Use this to wrap areas which use an entity field to populate data within components. This will
display helpful information to those using the Visual Editor.

#### Props

| Name        | Type   |
| ----------- | ------ |
| displayName | string |
| fieldId     | string |

#### Usage

```tsx
import { EntityField } from "@yext/visual-editor";

<EntityField displayName="Description" fieldId="c_deliveryPromo.description">
  <Body size={promoDescription.size} weight={promoDescription.weight}>
    {deliveryPromo.description}
  </Body>
</EntityField>;
```
