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

## entityField Field Type

Use the registered `entityField` field type to allow Visual Editor users to choose an entity field or a constant value that will populate data into a component.
The user can choose an entity field from a dropdown or use a constant value. Regardless, the user should always
enter a constant value as it will be used as a fallback value in the case that the entity is missing the selected entity field.
`YextEntityFieldSelector(...)` remains available as a compatibility wrapper, but new configs should author `entityField` directly in `YextFields`.

The constant value field currently has limited functionality with complex object entity types. When using complex
object types, ensure your render function handles undefined fields.

### Props

| Name                       | Type                | Description                                                    |
| -------------------------- | ------------------- | -------------------------------------------------------------- |
| type                       | `"entityField"`     | Registers the field as the entity/constant selector.           |
| label?                     | string \| MsgString | The user-facing label for the field.                           |
| filter.types               | string[]            | Determines which fields will be available based on field type. |
| filter.allowList?          | string[]            | Field names to include. Cannot be combined with disallowList.  |
| filter.disallowList?       | string[]            | Field names to exclude. Cannot be combined with allowList.     |
| disableConstantValueToggle | boolean             | Disables static-content mode when true.                        |
| disallowTranslation        | boolean             | Uses non-localized constant editors when supported.            |

### Usage

```tsx
import {
  EntityFieldType,
  resolveYextEntityField,
  useDocument,
  YextComponentConfig
  YextFields
} from "@yext/visual-editor";
import { MyFieldType, TemplateStream } from "../types/autogen";
import { config } from "../templates/myTemplate";

export type ExampleProps = {
  myField: {
    entityField: YextEntityField;
  };
};

const exampleFields: YextFields<ExampleProps> = {
  myField: {
    type: "object",
    label: "Example Parent Field", // top-level sidebar label
    objectFields: {
      entityField: {
        type: "entityField",
        label: "Example Field", // sidebar label for the sub field
        filter: {
          types: ["type.string"],
          disallowList: ["exampleField"],
          //allowList: ["exampleField"],
        },
      },
    },
  },
};

export const ExampleComponent: YextComponentConfig<ExampleProps> = {
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

## Linked Entity Item Sources

Use `createItemSource(...)` when a component needs to render repeated content
from a linked list field. This keeps the source selection, per-item mappings,
and manual fallback items in one repeated `entityField` value.

### Pattern

1. Define one authored item-props shape whose leaves are `YextEntityField`
   values.
2. Call `createItemSource(...)` with that props shape and `mappingFields`.
3. Store one prop shaped like `typeof articleSource.value`.
4. Use `useDocument()` plus `articleSource.resolveItems(...)` in render to
   resolve the current list without storing derived output back onto props.

Mapped `entityField` values inside one repeated item always resolve relative to
that current mapped item.

When the user switches from one linked parent source to another, the editor
automatically clears stale `mappings.*.field` selections while preserving any
constant fallback values.

### Example

`ArticleCard.tsx`

```tsx
import { type PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  useDocument,
  type TranslatableRichText,
  type TranslatableString,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export type ArticleCardProps = {
  title?: TranslatableString;
  description?: TranslatableRichText;
};

export const ArticleCard: PuckComponent<ArticleCardProps> = ({
  title,
  description,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  return (
    <article>
      <h3>
        {resolveComponentData(title, i18n.language, streamDocument, {
          output: "plainText",
        })}
      </h3>
      {description &&
        resolveComponentData(description, i18n.language, streamDocument)}
    </article>
  );
};
```

`ArticleList.tsx`

```tsx
import { type PuckComponent } from "@puckeditor/core";
import {
  createItemSource,
  type TranslatableRichText,
  type YextEntityField,
  resolveComponentData,
  type StreamDocument,
  type TranslatableString,
  toPuckFields,
  type YextComponentConfig,
  useDocument,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "./ArticleCard.tsx";

type ArticleCardFields = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
};

const articleSource = createItemSource<ArticleCardFields>({
  label: "Articles",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: {
        types: ["type.string"],
      },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
});

type ArticleListProps = {
  articles: typeof articleSource.value;
  heading: {
    text: TranslatableString;
  };
};

const articleListFields = {
  articles: articleSource.field,
  heading: {
    type: "object",
    label: "Heading",
    objectFields: {
      text: {
        type: "translatableString",
        label: "Text",
      },
    },
  },
};

const ArticleListComponent: PuckComponent<ArticleListProps> = ({
  articles,
  heading,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument<StreamDocument>();
  const items = articleSource.resolveItems(articles, streamDocument);

  return (
    <section>
      <h2>
        {resolveComponentData(heading.text, i18n.language, streamDocument, {
          output: "plainText",
        })}
      </h2>
      <div>
        {items.map((item, index) => (
          <ArticleCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export const ArticleList: YextComponentConfig<ArticleListProps> = {
  label: "Article List",
  fields: toPuckFields(articleListFields),
  defaultProps: {
    articles: articleSource.defaultValue,
    heading: {
      text: { defaultValue: "Linked Articles" },
    },
  },
  render: (props) => <ArticleListComponent {...props} />,
};
```

Use this pattern when the repeated UI is rendered directly by the component. If
you need each item to become a nested slot child instead, build that on top of
the same repeated `entityField` contract.

## basicSelector Field Type

The `basicSelector` field type renders a labeled combobox with optional search, grouped options, translated labels, and empty-state messaging.

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

## image Field

The `image` field type opens the asset selector and stores the selected image as a localized asset image value. Define it directly in `YextFields`.

### Props

| Name                 | Type                                           | Description                                              |
| -------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `type`               | `"image"`                                      | Registers the field as the Visual Editor image selector. |
| `label?`             | `string \| MsgString`                          | The field label shown in the editor.                     |
| `getAltTextOptions?` | `(templateMetadata) => EmbeddedStringOption[]` | Optional locator-specific alt-text source options.       |

### Usage

```tsx
const myComponentFields: YextFields<MyComponentProps> = {
  image: {
    type: "image",
    label: msg("fields.image", "Image"),
  },
};
```

## optionalNumber Field

This registered field type displays a radio group with two options. When one option is selected,
a number input is also rendered. When the other option is selected, the number input is hidden.
This could be used for a number field with an "all" or "default" option.

### Props

| Name                      | Type                  | Description                                                               |
| ------------------------- | --------------------- | ------------------------------------------------------------------------- |
| type                      | `"optionalNumber"`    | The registered field type.                                                |
| label                     | `string \| MsgString` | The label for the field.                                                  |
| hideNumberFieldRadioLabel | `string \| MsgString` | The label for the radio option corresponding to hiding the number field.  |
| showNumberFieldRadioLabel | `string \| MsgString` | The label for the radio option corresponding to showing the number field. |
| defaultCustomValue        | `number`              | The default number if the number field is shown.                          |

#### Usage

```tsx
type MyComponentProps = {
  limit: number | string;
};

const myComponentFields: YextFields<MyComponentProps> = {
  limit: {
    type: "optionalNumber",
    label: msg("fields.limit", "Limit"),
    hideNumberFieldRadioLabel: msg("fields.options.all", "All"),
    showNumberFieldRadioLabel: msg("fields.options.limit", "Limit"),
    defaultCustomValue: 3,
  },
};
```

## YextFields

Author field definitions directly in `YextFields` using the registered Puck and Yext field types.

### Features

- Support for standard Puck field types such as `text`, `array`, and `object`
- Native Puck fields like `radio` can be authored directly inside `YextFields`

### Props

```tsx
import { msg, YextFields, YextComponentConfig } from "@yext/visual-editor";

const myComponentFields: YextFields<myComponentProps> = {
  address: {
    type: "entityField",
    label: msg("fields.address", "Address"),
    filter: { types: ["type.address"] },
  },
  showGetDirections: {
    label: msg("fields.showGetDirections", "Show Get Directions Link"),
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

export const MyComponent: YextComponentConfig<myComponentProps> = {
  fields: myComponentFields,
  render: (props) => <SomeComponent {...props} />,
};
```

### Translation Requirements

Use the `msg()` function for field labels to ensure proper internationalization.

```tsx
import { msg } from "@yext/visual-editor";

// Correct - uses msg() for a native field
title: {
  label: msg("fields.title", "Title"),
  type: "text",
};

// Incorrect - plain string label will not be translated
title: {
  label: "Title",
  type: "text",
};
```

The `msg()` function takes two parameters:

- `key`: Translation key (e.g., `"fields.title"`)
- `defaultValue`: Fallback text shown if translation is missing

### Supported Field Types

#### Native Text Fields

Define plain string inputs directly in `YextFields`. Use `text` for a single-line input and `textarea` for multiline input.

```tsx
title: {
  label: msg("fields.title", "Title"),
  type: "text",
},
description: {
  label: msg("fields.description", "Description"),
  type: "textarea",
},
```

**Props:**

- `type`: `"text"`
- `type`: `"textarea"`

---

#### Native Radio Field

Define radio fields directly in `YextFields`.

```tsx
alignment: {
  label: msg("fields.alignment", "Alignment"),
  type: "radio",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
  ],
},
```

---

#### Number Field

Creates a numeric input field with optional min and max values. [Additional documentation](https://puckeditor.com/docs/api-reference/fields/number)

```tsx
spacing: {
  label: msg("fields.spacing", "Spacing"),
  type: "number",
},
```

**Props:**

- `type`: `"number"`
- `min?`: `number`
- `max?`: `number`

---

#### Array Field

Creates a repeatable field group (e.g., a list of items). Define inner fields using `arrayFields`. [Additional documentation](https://puckeditor.com/docs/api-reference/fields/array)

```tsx
items: {
  label: msg("fields.items", "Items"),
  type: "array",
  arrayFields: {
    title: {
      label: msg("fields.title", "Title"),
      type: "text",
    },
    url: {
      label: msg("fields.url", "URL"),
      type: "text",
    },
  },
},
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
card: {
  label: msg("fields.card", "Card"),
  type: "object",
  objectFields: {
    title: {
      label: msg("fields.title", "Title"),
      type: "text",
    },
    description: {
      label: msg("fields.description", "Description"),
      type: "textarea",
    },
  },
},
```

**Props:**

- `type`: `"object"`
- `objectFields`: `object`

---

#### Entity Selector Field

Use the registered `entityField` type to render the entity selector with filtering capabilities.

```tsx
linkedEntity: {
  type: "entityField",
  label: msg("fields.linkedEntity", "Linked Entity"),
  filter: { types: ["type.string"] },
},
```

**Props:**

- `type`: `"entityField"`
- `label?`: `string | MsgString`
- `filter`: `RenderEntityFieldFilter`

---

#### Translatable String Field

Use the registered `translatableString` field type directly when you need locale-aware string entry with optional entity field embedding and locale management.

```tsx
directoryRoot: {
  type: "translatableString",
  label: msg("fields.directoryRoot", "Directory Root Link Label"),
  filter: { types: ["type.string"] }
},
title: {
  type: "translatableString",
  label: msg("fields.title", "Page Title"),
  filter: { types: ["type.string"] },
  showApplyAllOption: true
},
```

**Props:**

- `type`: `"translatableString"`
- `label?`: `string | MsgString`
- `filter?`: `RenderEntityFieldFilter` — optional filter for entity fields that can be embedded
- `showApplyAllOption?`: `boolean` — enables the "Apply to All Locales" button
- `showFieldSelector?`: `boolean` — controls whether the entity field embed button is shown
- `getOptions?`: `() => EmbeddedStringOption[]` — optional options source for the embed selector
