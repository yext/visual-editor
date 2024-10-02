# Components

## Editor

Use this component to create an `edit.tsx` page in your Pages repository. This is the first step
in making your repo compatible with the Visual Editor. See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for more
information.

### Props:

| Name              | Type                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| document          | any (json data from [our hook](../hooks/README.md#usePlatformBridgeDocument))        |
| componentRegistry | Map<string, Config<any>> from [@measuredco/puck](https://github.com/measuredco/puck) |

### Usage:

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

See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for a more detailed look at the componentRegistry.

## EntityField

Use this to wrap areas which use an entity field to populate data within components. This will
display helpful information to those using the Visual Editor.

### Props

| Name        | Type   |
| ----------- | ------ |
| displayName | string |
| fieldId     | string |

### Usage

```tsx
import { EntityField } from "@yext/visual-editor";

<EntityField displayName="Description" fieldId="c_deliveryPromo.description">
  <Body size={promoDescription.size} weight={promoDescription.weight}>
    {deliveryPromo.description}
  </Body>
</EntityField>;
```

## YextEntityFieldSelector

Use this to allow Visual Editor users to choose an entity field or constant value that will populate data into a component.
The user can choose an entity field from a dropdown or use a constant value. Regardless, the user should always
enter a constant value as it will be used as a fallback value in the case that the entity is missing the selected entity field.

The constant value field currently has no functionality with complex object entity types (ex. image, c_cta). When using complex
object types, ensure your render function handles undefined fields.

### Props

| Name                 | Type            | Description                                                    |
| -------------------- | --------------- | -------------------------------------------------------------- |
| label?               | string          | The user-facing label for the field.                           |
| filter.types         | string[]        | Determines which fields will be available based on field type. |
| filter.allowList?    | types: string[] | Field names to include. Cannot be combined with disallowList.  |
| filter.disallowList? | types: string[] | Field names to exclude. Cannot be combined with allowList.     |

### Usage

```tsx
import {
  EntityFieldType,
  YextEntityFieldSelector,
  resolveYextEntityField,
} from "@yext/visual-editor";
import { MyFieldType, TemplateStream } from "../types/autogen";
import { config } from "../templates/myTemplate";
import { useDocument } from "@yext/pages/util";

export type ExampleProps = {
  myField: {
    entityField: YextEntityField;
  };
};

const exampleFields: Fields<ExampleProps> = {
  myField: {
    type: "object",
    label: "Example Field", // top-level sidebar label
    objectFields: {
      entityField: YextEntityFieldSelector<typeof config>({
        label: "Entity Field", // sidebar label for the entity field dropdown
        filter: {
          types: ["type.string"],
          disallowList: ["exampleField"],
          //allowList: ["exampleField"],
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
        field: "id", // default to the entity's id
        // field: "", // default to Select a Content field (page will display the constant value)
        constantValue: "Example Text", // default constant value
      },
    },
  },
  label: "Example Component",
  render: ({ myField }) => <Example myField={myField} />,
};

const Example = ({ myField }: ExampleProps) => {
  const document = useDocument<TemplateStream>();
  return (
    // myField?.entityField optional chaining only required when updating existing component
    <p>{resolveYextEntityField<MyFieldType>(document, myField?.entityField)}</p>
  );
};
```
