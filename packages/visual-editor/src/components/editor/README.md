---
title: Components
outline: deep
---

# Components

## Editor

Use this component to create an `edit.tsx` page in your Pages repository. This is the first step
in making your repo compatible with the Visual Editor. See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for more
information.

### Props

| Name              | Type                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| document          | any (json data from [our hook](../../hooks/README.md#usePlatformBridgeDocument))          |
| componentRegistry | `Map<string, Config<any>>` from [@measuredco/puck](https://github.com/measuredco/puck) |
| themeConfig?      | ThemeConfig                                                                            |

### Usage

```tsx
import { themeConfig } from "../../theme.config"
import tailwindConfig from "../../tailwind.config";

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
    <VisualEditorProvider
      templateProps={{
        document: entityDocument
      }}
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

The constant value field currently has limited functionality with complex object entity types. When using complex
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
  useDocument,
} from "@yext/visual-editor";
import { MyFieldType, TemplateStream } from "../types/autogen";
import { config } from "../templates/myTemplate";

export type ExampleProps = {
  myField: {
    entityField: YextEntityField;
  };
};

const exampleFields: Fields<ExampleProps> = {
  myField: {
    type: "object",
    label: "Example Parent Field", // top-level sidebar label
    objectFields: {
      entityField: YextEntityFieldSelector<typeof config>({
        label: "Example Field", // sidebar label for the sub field
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

## YextCollectionSubfieldSelector

Use this to allow Visual Editor users to choose an entity field or constant value based on a subfield of a Collection.

### Props

| Name                     | Type            | Description                                                    |
| ------------------------ | --------------- | -------------------------------------------------------------- |
| label?                   | string          | The user-facing label for the field.                           |
| isCollection             | boolean         | If false, will behave like YextEntityFieldSelector.            |
| filter.types             | string[]        | Determines which fields will be available based on field type. |
| filter.allowList?        | types: string[] | Field names to include. Cannot be combined with disallowList.  |
| filter.disallowList?     | types: string[] | Field names to exclude. Cannot be combined with allowList.     |
| filter.directChildrenOf? | string          | Return only the fields that are direct children of this field. |

### Usage

```tsx
{
  // Will return the direct children of c_myCollection that are type string.
  text: YextCollectionSubfieldSelector<any, string>({
    label: "Text",
    isCollection: true,
    filter: {
      directChildrenOf: "c_myCollection",
      types: ["type.string"],
    },
  }),
}
```

## BasicSelector

`BasicSelector` creates a labeled field and searchable dropdown with the provided options. Each option consists of a label, value, and an optional color. This can be used when creating the Fields for a new component.

### Props

| Name    | Type          | Description                       |
| ------- | ------------- | --------------------------------- |
| label   | `string`      | The label for the selector field. |
| options | `Option<T>[]` | An array of selectable options.   |

#### `Option<T>` Object

| Name   | Type      | Description                                                                           |
| ------ | --------- | ------------------------------------------------------------------------------------- |
| label  | `string`  | The display label of the option.                                                      |
| value  | `T`       | The associated value of the option.                                                   |
| color? | `string?` | (Optional) A tailwind color class. Will be used to display the color in the dropdown. |

### Usage

```tsx
const myComponentFields: Fields<MyComponentProps> = {
  heading: {
    type: "object",
    label: "Heading",
    objectFields: {
      level: BasicSelector("Level", [
        { label: "H1", value: 1 },
        { label: "H2", value: 2 },
        { label: "H3", value: 3 },
        { label: "H4", value: 4 },
        { label: "H5", value: 5 },
        { label: "H6", value: 6 },
      ]),
    },
  },
```

## OptionalNumberField

This field displays a radio group with two options. When one option is selected, a number input is also
rendered. When the other option is selected, the number input is hidden. This could be used
for a number field with an "all" or "default" option.

### Props

| Name                      | Type     | Description                                                               |
| ------------------------- | -------- | ------------------------------------------------------------------------- |
| fieldLabel                | `string` | The label for the field.                                                  |
| hideNumberFieldRadioLabel | `string` | The label for the radio option corresponding to hiding the number field.  |
| showNumberFieldRadioLabel | `string` | The label for the radio option corresponding to showing the number field. |
| defaultCustomValue        | `number` | The default number if the number field is shown.                          |

#### Usage

```tsx
type MyComponentProps = {
  limit: number | string;
};

const myComponentFields: Fields<MyComponentProps> = {
  limit: OptionalNumberField({
    fieldLabel: "Number of Items",
    hideNumberFieldRadioLabel: "Show All",
    showNumberFieldRadioLabel: "Limit Items",
    defaultCustomValue: 3,
  }),
};
```
