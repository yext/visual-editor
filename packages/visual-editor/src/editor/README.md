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
| themeConfig?      | ThemeConfig                                                                          |

### Usage:

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

## YextField

`YextField` provides a unified utility for creating typed field configurations in a [Puck](https://github.com/measuredco/puck) and Yext Visual Editor integration context. It abstracts over common field types and includes special handling for Yext's [BasicSelector](##BasicSelector), [OptionalNumberField](##OptionalNumberField), [YextEntityFieldSelector](##YextEntityFieldSelector), and [YextCollectionSubfieldSelector](##YextCollectionSubfieldSelector).

### Features

- Strongly typed helper for defining field configs
- Support for standard Puck field types (`text`, `radio`, `select`, `array`, etc.)
- Extended support for Yext-specific entity selectors
- Intelligent handling of options from `@yext/visual-editor` theme options

### Props

#### `YextField`

```ts
YextField(label: string, config: YextFieldConfig): Field<any>
```

**Parameters:**

- `label`: `string` — The name of the field shown in the visual editor.
- `config`: `YextFieldConfig` — Configuration object describing the field type and its behavior.

### Usage

```tsx
import { YextField } from "@yext/visual-editor";

const myComponentFields: Fields<myComponentProps> = {
  address: YextField<AddressType>("Address", {
    type: "entity",
    filter: { types: ["type.address"] },
  }),
  showGetDirections: YextField("Show Get Directions Link", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
};

export const MyComponent: ComponentConfig<myComponentProps> = {
  fields: myComponentFields,
  render: (props) => <SomeComponent {...props} />,
};
```

### Supported Field Types

#### Text Field

Creates a simple string input. Supports multi-line input.

```tsx
title: YextField("Title", {
  type: "text",
}),
description: YextField("Description", {
  type: "text",
  isMultiline: true
})
```

**Props:**

- `type`: `"text"`
- `isMultiline?`: `boolean` — if true, renders a `<textarea>` for the multiline input.

---

#### Select Field

Creates a dropdown select input. Options can be passed directly or as a string key from `ThemeOptions`. Optional search behavior uses the [BasicSelector](##BasicSelector).

```tsx
variant: YextField("CTA Variant", {
  type: "select",
  options: "CTA_VARIANT",
  hasSearch: true,
}),
aspectRatio: YextField("Aspect Ratio", {
  type: "select",
  options: [
    { label: "1:1", value: 1 },
    { label: "5:4", value: 1.25 },
    { label: "4:3", value: 1.33 },
  ],
}),
```

**Props:**

- `type`: `"select"`
- `options`: `FieldOptions | keyof ThemeOptions`
- `hasSearch?`: `boolean` — enables searchable dropdown

---

#### Radio Field

Creates a radio button group. Options can be passed directly or via a `ThemeOptions` key.

```tsx
alignment: YextField("Alignment", {
  type: "radio",
  options: "ALIGNMENT",
}),
includeHyperlink: YextField("Include Hyperlink", {
  type: "radio",
  options: [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ],
}),
```

**Props:**

- `type`: `"radio"`
- `options`: `FieldOptions | keyof ThemeOptions`

---

#### Number Field

Creates a numeric input field with optional min and max values. [Additional documentation](https://puckeditor.com/docs/api-reference/fields/number)

```tsx
spacing: YextField("Spacing", { type: "number" });
```

**Props:**

- `type`: `"number"`
- `min?`: `number`
- `max?`: `number`

---

#### Array Field

Creates a repeatable field group (e.g., a list of items). Define inner fields using `arrayFields`. [Additional documentation](https://puckeditor.com/docs/api-reference/fields/array)

```tsx
items: YextField("Items", {
  type: "array",
  arrayFields: {
    title: YextField("Title", { type: "text" }),
    url: YextField("URL", { type: "text" }),
  },
});
```

**Props:**

- `type`: `"array"`
- `arrayFields`: `object`;
- `defaultItemProps?`: `string`;
- `getItemSummary?`: `function`;
- `max?`: `number`;
- `min?`: `number`;

---

#### Object Field

Creates a nested object field with multiple subfields. [Additional documentation](https://puckeditor.com/docs/api-reference/fields/object)

```tsx
card: YextField("Card", {
  type: "object",
  objectFields: {
    title: YextField("Title", { type: "text" }),
    description: YextField("Description", {
      type: "text",
      isMultiline: true,
    }),
  },
});
```

**Props:**

- `type`: `"object"`
- `objectFields`: `object`

---

#### Entity Selector Field

Renders a Yext entity selector with filtering capabilities.

```tsx
linkedEntity: YextField("Linked Entity", {
  type: "entity",
  filter: { entityType: "faq" },
});
```

**Props:**

- `type`: `"entity"`
- `filter`: `any` — passed to [YextEntityFieldSelector](##YextEntityFieldSelector)
- `isCollection?`: `boolean` — used when creating collection subfields, specifically in cardComponents.

---

#### Optional Number Selector Field

[Additional documentation](##OptionalNumberField)

```tsx
limit: YextField("Items Limit", {
  type: "optionalNumber",
  hideNumberFieldRadioLabel: "All",
  showNumberFieldRadioLabel: "Limit",
  defaultCustomValue: 3,
}),
```

**Props:**

- `type`: `"optionalNumber"`
- `hideNumberFieldRadioLabel`: `boolean`
- `showNumberFieldRadioLabel`: `boolean`
- `defaultCustomValue `: `number`
