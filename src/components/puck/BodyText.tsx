import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Body, BodyProps, bodyVariants } from "./atoms/body.js";
import { useDocument } from "../../hooks/useDocument.js";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../editor/YextEntityFieldSelector.js";
import { EntityField } from "../editor/EntityField.js";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.js";

export interface BodyTextProps extends BodyProps {
  text: YextEntityField<string>;
}

const BodyText = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ text, ...bodyProps }, ref) => {
    const document = useDocument();

    return (
      <EntityField
        fieldId={text.field}
        constantValueEnabled={text.constantValueEnabled}
      >
        <Body ref={ref} {...bodyProps}>
          {resolveYextEntityField(document, text)}
        </Body>
      </EntityField>
    );
  }
);

BodyText.displayName = "BodyText";

const bodyTextFields: Fields<BodyTextProps> = {
  text: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.string"],
    },
  }),
  textSize: {
    label: "Text Size",
    type: "number",
    min: 1,
  },
  fontWeight: {
    label: "Font Weight",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Thin", value: "thin" },
      { label: "Extra Light", value: "extralight" },
      { label: "Light", value: "light" },
      { label: "Normal", value: "normal" },
      { label: "Medium", value: "medium" },
      { label: "Semibold", value: "semibold" },
      { label: "Bold", value: "bold" },
      { label: "Extrabold", value: "extrabold" },
      { label: "Black", value: "black" },
    ],
  },
  color: {
    label: "Color",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Accent", value: "accent" },
      { label: "Text", value: "text" },
      { label: "Background", value: "background" },
    ],
  },
  textTransform: {
    label: "Text Transform",
    type: "select",
    options: [
      { label: "None", value: "none" },
      { label: "Uppercase", value: "uppercase" },
      { label: "Lowercase", value: "lowercase" },
      { label: "Capitalize", value: "capitalize" },
    ],
  },
};

export const BodyTextComponent: ComponentConfig<BodyTextProps> = {
  label: "Body Text",
  fields: bodyTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: "Text",
      constantValueEnabled: true,
    },
    fontWeight: "default",
    color: "default",
    textTransform: "none",
  },
  render: (props) => <BodyText {...props} />,
};

export { BodyText, bodyVariants };
