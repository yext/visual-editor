# Components

## Editor

Use this component to create an `edit.tsx` page in your Pages repository. This is the first step
in making your repo compatible with the Visual Editor. See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for more
information.

#### Props:

| Name              | Type                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| document          | any (json data from [our hook](../hooks/README.md#usePlatformBridgeDocument))        |
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
  const entityDocument = usePlatformBridgeDocument();

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

## Entity Field Selection

### YextEntityFieldSelector

Use this to allow Visual Editor users to choose an entity field or a constant value that will populate data into a component.

#### Props

| Name                      | Type            | Description                                                                                                          |
| ------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| useDocument               | function        | See [@yext/pages useDocument](https://github.com/yext/pages/blob/main/packages/pages/src/util/README.md#usedocument) |
| label?                    | string          | The user-facing label for the field.                                                                                 |
| filter?.types?            | string[]        | Determines which fields will be available based on field type.                                                       |
| filter?.includeSubfields? | boolean         |                                                                                                                      |
| filter?.allowList?        | types: string[] | Field names to include. Cannot be combined with disallowList.                                                        |
| filter?.disallowList?     | types: string[] | Field names to exclude. Cannot be combined with allowList.                                                           |

### resolveDataForEntityField

Determines whether to use a constant value or an entity field. Used as [Puck's resolveData function](https://puckeditor.com/docs/api-reference/configuration/component-config#resolvedatadata-params).

### Usage

```tsx
import {
  EntityFieldType,
  YextEntityFieldSelector,
  resolveDataForEntityField,
} from "@yext/visual-editor";
import { config } from "../templates/myTemplate";
import { useDocument } from "@yext/pages/util";

export type ExampleProps = {
  myField: {
    entityField: EntityFieldType;
  };
};

const exampleFields: Fields<ExampleProps> = {
  myField: {
    type: "object",
    label: "Example Field Populated by Entity Fields",
    objectFields: {
      //@ts-expect-error ts(2322)
      entityField: YextEntityFieldSelector<typeof config>({
        useDocument: useDocument,
        label: "Entity Field",
        filter: {
          types: ["type.string"],
          includeSubfields: true,
          disallowList: ["exampleFieldName"],
        },
      }),
    },
  },
};

export const ExampleComponent: ComponentConfig<ExampleProps> = {
  fields: exampleFields,
  defaultProps: {
    myField: {
      entityField: {
        name: "",
        value: "Information",
      },
    },
  },
  label: "Example Component",
  resolveData: (props, changed) =>
    resolveDataForEntityField<ExampleProps>("myField", props, changed),
  render: ({ myField }) => <Example myField={myField} />,
};

const Example = ({ myField }: ExampleProps) => {
  return <p>{myField.entityField.value}</p>;
};
```
