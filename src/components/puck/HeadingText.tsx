import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Heading, HeadingProps, headingVariants } from "./atoms/heading.js";
import { useDocument } from "../../hooks/useDocument.js";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.js";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../editor/YextEntityFieldSelector.js";
import { EntityField } from "../editor/EntityField.js";

export interface HeadingTextProps extends HeadingProps {
  text: YextEntityField;
}

const HeadingText = React.forwardRef<HTMLHeadingElement, HeadingTextProps>(
  ({ text, ...headingProps }, ref) => {
    const document = useDocument();

    return (
      <EntityField fieldId={text.field}>
        <Heading ref={ref} {...headingProps}>
          {resolveYextEntityField(document, text)}
        </Heading>
      </EntityField>
    );
  }
);

HeadingText.displayName = "HeadingText";

const headingTextFields: Fields<HeadingTextProps> = {
  text: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.string"],
    },
  }),
  level: {
    type: "number",
    label: "Heading Level",
    min: 1,
    max: 6,
  },
  weight: {
    label: "Font Weight",
    type: "radio",
    options: [
      { label: "Default", value: "default" },
      { label: "Bold", value: "bold" },
    ],
  },
  size: {
    type: "select",
    options: [
      { value: "page", label: "Page" },
      { value: "section", label: "Section" },
      { value: "subheading", label: "Subheading" },
    ],
  },
  color: {
    type: "select",
    options: [
      { value: "default", label: "Default" },
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
      { value: "accent", label: "Accent" },
    ],
  },
  transform: {
    type: "select",
    options: [
      { value: "none", label: "None" },
      { value: "lowercase", label: "Lowercase" },
      { value: "uppercase", label: "Uppercase" },
      { value: "capitalize", label: "Capitalize" },
    ],
  },
};

export const HeadingTextComponent: ComponentConfig<HeadingTextProps> = {
  fields: headingTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: "Text",
      constantValueEnabled: true,
    },
    content: "Heading",
    level: 2,
    weight: "default",
    size: "section",
    color: "default",
    transform: "none",
  },
  render: (props) => <HeadingText {...props} />,
};

export { HeadingText, headingVariants };