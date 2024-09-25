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

Use this to allow Visual Editor users to choose an entity field or static value that will populate data into a component.
The user can choose an entity field from a dropdown or select "Use Static Value". Regardless, the user should always
enter a static value as it will be used as a fallback value in the case that the entity is missing the selected entity field.

#### Props

| Name                      | Type            | Description                                                    |
| ------------------------- | --------------- | -------------------------------------------------------------- |
| label?                    | string          | The user-facing label for the field.                           |
| filter?.types?            | string[]        | Determines which fields will be available based on field type. |
| filter?.includeSubfields? | boolean         |                                                                |
| filter?.allowList?        | types: string[] | Field names to include. Cannot be combined with disallowList.  |
| filter?.disallowList?     | types: string[] | Field names to exclude. Cannot be combined with allowList.     |

### resolveYextEntityField

Used in a component's render function to pull in the selected entity field's value from the document or use the static value.

#### Props

| Name        | Type                |
| ----------- | ------------------- |
| document    | Record<string, any> |
| entityField | EntityFieldType     |

### Usage

```tsx
import {
  EntityFieldType,
  YextEntityFieldSelector,
  resolveYextEntityField,
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
        fieldName: "", // default to Use Static Value
        staticValue: "Example Text", // default static value
      },
    },
  },
  label: "Example Component",
  render: ({ myField }) => <Example myField={myField} />,
};

const Example = ({ myField }: ExampleProps) => {
  const document = useDocument();
  return <p>{resolveYextEntityField(document, myField.entityField)}</p>;
};
```
