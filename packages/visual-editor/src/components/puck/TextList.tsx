import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { cva, type VariantProps } from "class-variance-authority";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  getFontWeightOverrideOptions,
} from "../../index.js";
import { BasicSelector } from "../editor/BasicSelector.tsx";

const textListVariants = cva(
  "list-disc components list-inside text-body-fontSize font-body-fontFamily",
  {
    variants: {
      fontWeight: {
        default: "font-body-fontWeight",
        "100": "font-thin",
        "200": "font-extralight",
        "300": "font-light",
        "400": "font-normal",
        "500": "font-medium",
        "600": "font-semibold",
        "700": "font-bold",
        "800": "font-extrabold",
        "900": "font-black",
      },
      color: {
        default: "text-palette-body-color",
        primary: "text-palette-primary",
        secondary: "text-palette-secondary",
        accent: "text-palette-accent",
        text: "text-palette-text",
        background: "text-palette-background",
      },
      textTransform: {
        none: "",
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
      },
      padding: {
        default: "px-4 py-16 md:px-8",
        none: "p-0",
        small: "px-4 py-8 md:px-8",
        large: "px-[200px] py-24 md:px-8",
      },
    },
    defaultVariants: {
      padding: "none",
      fontWeight: "default",
      color: "default",
      textTransform: "none",
    },
  }
);

interface TextListProps extends VariantProps<typeof textListVariants> {
  list: YextEntityField<string[]>;
  textSize?: number;
}

const textListFields: Fields<TextListProps> = {
  list: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
    },
  }),
  padding: {
    label: "Padding",
    type: "radio",
    options: [
      { label: "None", value: "none" },
      { label: "Small", value: "small" },
      { label: "Medium", value: "default" },
      { label: "Large", value: "large" },
    ],
  },
  color: BasicSelector("Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
  textTransform: BasicSelector("Text Transform", [
    { label: "None", value: "none" },
    { label: "Uppercase", value: "uppercase" },
    { label: "Lowercase", value: "lowercase" },
    { label: "Capitalize", value: "capitalize" },
  ]),
};

const TextList: React.FC<TextListProps> = ({
  list: textListField,
  padding,
  fontWeight,
  color,
  textTransform,
}) => {
  const document = useDocument();
  let resolvedTextList: any = resolveYextEntityField(document, textListField);
  if (!resolvedTextList) {
    resolvedTextList = ["Sample text 1", "Sample text 2", "Sample text 3"];
  } else if (!Array.isArray(resolvedTextList)) {
    resolvedTextList = [resolvedTextList];
  }

  return (
    <EntityField
      displayName="Text List"
      fieldId={textListField.field}
      constantValueEnabled={textListField.constantValueEnabled}
    >
      <ul
        className={textListVariants({
          padding,
          fontWeight,
          color,
          textTransform,
        })}
      >
        {resolvedTextList.map((text: any, index: any) => (
          <li key={index} className="mb-2">
            {text}
          </li>
        ))}
      </ul>
    </EntityField>
  );
};

const TextListComponent: ComponentConfig<TextListProps> = {
  label: "Text List",
  fields: textListFields,
  defaultProps: {
    padding: "none",
    list: {
      field: "",
      constantValue: [],
    },
  },
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-body-fontFamily`,
    });
    return {
      ...textListFields,
      fontWeight: BasicSelector("Font Weight", fontWeightOptions),
    };
  },
  render: (props) => <TextList {...props} />,
};

export { TextListComponent as TextList, type TextListProps };
