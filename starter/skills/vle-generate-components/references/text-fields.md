# Text Fields Contract

- Use this rule for **every text prop/field** in generated Puck components.
- Do not use for links/CTAs.
- Use this for all heading text and body text.

## Required Shape

Every text prop must follow this TypeScript shape:

```ts
type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string; // hex color
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};
```

## Field Definition Pattern

Use this pattern in `Fields<...>`:

```tsx
type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type ExampleSectionProps = {
  heading: StyledTextProps;
};

const ExampleSectionFields: Fields<ExampleSectionProps> = {
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: YextEntityFieldSelector<any, TranslatableString>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: { label: "Font Size", type: "number" },
      fontColor: { label: "Font Color", type: "text" },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: [
          { label: "Thin", value: 100 },
          { label: "Extra Light", value: 200 },
          { label: "Light", value: 300 },
          { label: "Regular", value: 400 },
          { label: "Medium", value: 500 },
          { label: "Semi Bold", value: 600 },
          { label: "Bold", value: 700 },
          { label: "Extra Bold", value: 800 },
          { label: "Black", value: 900 },
        ],
      },
      textTransform: {
        label: "Text Transform",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  },
};
```

- Keep each text object field complete in one place (text plus style subfields) so generated components stay consistent.

## Render Rules

- Components must apply these style props when rendering text.

Example:

```tsx
const locale = streamDocument.locale ?? "en";
const resolvedHeadingText =
  resolveComponentData(props.heading.text, locale, streamDocument) || "";

return (
  <Text
    fontSize={`${props.heading.fontSize}px`}
    color={props.heading.fontColor}
    fontWeight={props.heading.fontWeight}
    textTransform={props.heading.textTransform}
  >
    {resolvedHeadingText}
  </Text>
);
```

## defaultProps Rules

- `defaultProps` for each text object field must be set from the captured HTML/screenshot artifacts.
- The text content from the HTML should be placed in `constantValue.defaultValue`. `constantValueEnabled` should be true.
- Copy visible values as closely as possible (text content, size, color, weight).
- Do not include `\n` in the defaultProps. If the text should break lines, use CSS.

Example:

```tsx
{
  heading: {
    text: {
      constantValue: {defaultValue: "Value from HTML", hasLocalizedValue: "true"},
      field: "",
      constantValueEnabled: true,
    },
    fontSize: 16,
    fontWeight: 400,
    fontColor: "#00FF00",
    textTransform: "normal"
  }
}
```

## Other Font Properties

If the captured HTML/screenshot includes additional font styling not in this schema (for example `fontFamily`, `lineHeight`, `letterSpacing`, etc.):

- Do **not** add extra editable subproperties to the text object field.
- Hardcode those additional font styles directly in render to preserve visual parity.
