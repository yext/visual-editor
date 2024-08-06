# Components

## Editor

Use this component to create an `edit.tsx` page in your Pages repository. This is the first step
in making your repo compatible with the Visual Editor. See the [starter](//TODO) for more
information.

#### Props:

| Name             | Type                                                               |
| ---------------- | ------------------------------------------------------------------ |
| document         | any (json data)                                                    |
| puckConfig       | Config from [@measuredco/puck](https://github.com/measuredco/puck) |
| templateMetadata | [TemplateMetadata](./../types/README.md#templatemetadata)          |

#### Usage:

```tsx
import { Editor } from "@yext/visual-editor";

<DocumentProvider value={entityDocument}>
  <Editor
    document={entityDocument}
    puckConfig={puckConfig!}
    templateMetadata={templateMetadata!}
  />
</DocumentProvider>;
```

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
