---
title: Internal Components
outline: deep
---

# Components

## Editor

Use this component to create an `edit.tsx` page in your Pages repository. This is the first step
in making your repo compatible with the Visual Editor. See the [starter](https://github.com/YextSolutions/pages-visual-editor-starter) for more
information.

### Props

| Name              | Type                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| document          | any (json data from [our hook](../hooks/README.md#usePlatformBridgeDocument))             |
| componentRegistry | `Record<string, Config<any>>` from [@measuredco/puck](https://github.com/measuredco/puck) |
| themeConfig?      | ThemeConfig                                                                               |
| metadata?         | Metadata                                                                                  |

### Usage

```tsx
import "@yext/visual-editor/style.css";
import "../index.css";
import tailwindConfig from "../../tailwind.config";

// All the available components for locations
const locationConfig: Config<LocationProps> = {
  components: {...},
  root: {...},
};

const componentRegistry : Record<string, Config<any>> = {
  "location": locationConfig,
};


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

## basicSelector Field Type

The `basicSelector` field type renders a labeled combobox with optional search, grouped options, translated labels, and empty-state messaging. Use it when you need direct access to the selector behavior instead of going through `YextField({ type: "select", ... })`.

### Props

| Name                    | Type                    | Description                                                                 |
| ----------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `type`                  | `"basicSelector"`       | Registers the field as the Yext combobox selector.                          |
| `label?`                | `string \| MsgString`   | The field label shown in the editor.                                        |
| `options`               | `ComboboxOption[]`      | Flat list of selectable options. Cannot be combined with `optionGroups`.    |
| `optionGroups`          | `ComboboxOptionGroup[]` | Grouped options with optional titles and descriptions.                      |
| `translateOptions?`     | `boolean`               | Whether option labels, group titles, and descriptions should be translated. |
| `noOptionsPlaceholder?` | `string \| MsgString`   | Button text shown when no options are available.                            |
| `noOptionsMessage?`     | `string \| MsgString`   | Optional helper text shown below the disabled selector.                     |
| `disableSearch?`        | `boolean`               | Disables the combobox search input.                                         |

### Usage

```tsx
import { YextAutoField, msg } from "@yext/visual-editor";

const toneField = {
  type: "basicSelector" as const,
  label: msg("fields.tone", "Tone"),
  options: [
    { label: "Neutral", value: "neutral" },
    { label: "Bold", value: "bold" },
  ],
};

const ToneField = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) => {
  return <YextAutoField field={toneField} value={value} onChange={onChange} />;
};
```

When the field definition is part of a normal component `fields` config, Puck renders it through the registered Yext field override automatically. Use `YextAutoField` only when you are manually rendering a field definition inside a custom render path.

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

`YextField` provides a unified utility for creating typed field configurations in a [Puck](https://github.com/measuredco/puck) and Yext Visual Editor integration context. It abstracts over common field types and includes special handling for the internal `basicSelector` field type, [OptionalNumberField](##OptionalNumberField), [YextEntityFieldSelector](##YextEntityFieldSelector), and [TranslatableStringField](##TranslatableStringField).

### Features

- Strongly typed helper for defining field configs
- Support for standard Puck field types (`text`, `radio`, `select`, `array`, etc.)
- Extended support for Yext-specific entity selectors
- Intelligent handling of options from `@yext/visual-editor` theme options

### Props

#### `YextField`

```tsx
YextField(label: MsgString, config: YextFieldConfig): Field<any>
```

**Parameters:**

- `label`: `MsgString` — The translated name of the field shown in the visual editor. Must use `msg()` function to ensure translation compliance.
- `config`: `YextFieldConfig` — Configuration object describing the field type and its behavior.

### Usage

```tsx
import { YextField, msg } from "@yext/visual-editor";

const myComponentFields: Fields<myComponentProps> = {
  address: YextField<any, AddressType>(msg("fields.address", "Address"), {
    type: "entityField",
    filter: { types: ["type.address"] },
  }),
  showGetDirections: YextField(
    msg("fields.showGetDirections", "Show Get Directions Link"),
    {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    }
  ),
};

export const MyComponent: ComponentConfig<myComponentProps> = {
  fields: myComponentFields,
  render: (props) => <SomeComponent {...props} />,
};
```

### Translation Requirements

All field labels in `YextField` must use the `msg()` function to ensure proper internationalization. This enforces translation compliance at compile time through TypeScript's type system.

```tsx
import { msg } from "@yext/visual-editor";

// Correct - uses msg() function
title: YextField(msg("fields.title", "Title"), { type: "text" });

// Incorrect - plain string will cause TypeScript error
title: YextField("Title", { type: "text" });
```

The `msg()` function takes two parameters:

- `key`: Translation key (e.g., `"fields.title"`)
- `defaultValue`: Fallback text shown if translation is missing

### Supported Field Types

#### Text Field

Creates a simple string input. Supports multi-line input.

```tsx
title: YextField(msg("fields.title", "Title"), {
  type: "text",
}),
description: YextField(msg("fields.description", "Description"), {
  type: "text",
  isMultiline: true
})
```

**Props:**

- `type`: `"text"`
- `isMultiline?`: `boolean` — if true, renders a `<textarea>` for the multiline input.

---

#### Select Field

Creates a dropdown select input. Options can be passed directly or as a string key from `ThemeOptions`. Optional search behavior uses the internal `basicSelector` field type.

```tsx
variant: YextField(msg("fields.variant", "CTA Variant"), {
  type: "select",
  options: "CTA_VARIANT",
  hasSearch: true,
}),
aspectRatio: YextField(msg("fields.aspectRatio", "Aspect Ratio"), {
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
alignment: YextField(msg("fields.alignment", "Alignment"), {
  type: "radio",
  options: "ALIGNMENT",
}),
includeHyperlink: YextField(msg("fields.includeHyperlink", "Include Hyperlink"), {
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
spacing: YextField(msg("fields.spacing", "Spacing"), { type: "number" });
```

**Props:**

- `type`: `"number"`
- `min?`: `number`
- `max?`: `number`

---

#### Array Field

Creates a repeatable field group (e.g., a list of items). Define inner fields using `arrayFields`. [Additional documentation](https://puckeditor.com/docs/api-reference/fields/array)

```tsx
items: YextField(msg("fields.items", "Items"), {
  type: "array",
  arrayFields: {
    title: YextField(msg("fields.title", "Title"), { type: "text" }),
    url: YextField(msg("fields.url", "URL"), { type: "text" }),
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
card: YextField(msg("fields.card", "Card"), {
  type: "object",
  objectFields: {
    title: YextField(msg("fields.title", "Title"), { type: "text" }),
    description: YextField(msg("fields.description", "Description"), {
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
  type: "entityField",
  filter: { entityType: "faq" },
});
```

**Props:**

- `type`: `"entityField"`
- `filter`: `any` — passed to [YextEntityFieldSelector](##YextEntityFieldSelector)

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

---

#### Translatable String Field

Creates a translatable string input with optional entity field embedding and locale management. [Additional documentation](##TranslatableStringField).

```tsx
directoryRoot: YextField(msg("fields.directoryRoot", "Directory Root Link Label"), {
  type: "translatableString",
  filter: { types: ["type.string"] }
}),
title: YextField(msg("fields.title", "Page Title"), {
  type: "translatableString",
  filter: { types: ["type.string"] },
  showApplyAllOption: true
}),
```

**Props:**

- `type`: `"translatableString"`
- `filter?`: `RenderEntityFieldFilter` — optional filter for entity fields that can be embedded
- `showApplyAllOption?`: `boolean` — enables the "Apply to All Locales" button
