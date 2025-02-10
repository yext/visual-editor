import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Body, BodyProps } from "./atoms/body.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  getFontWeightOverrideOptions,
  FontSizeSelector,
} from "../../index.ts";

interface BodyTextProps extends BodyProps {
  text: YextEntityField<string>;
}

const BodyText = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ text, ...bodyProps }, ref) => {
    const document = useDocument();

    return (
      <EntityField
        displayName="Body"
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
  fontSize: FontSizeSelector(),
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

const BodyTextComponent: ComponentConfig<BodyTextProps> = {
  label: "Body Text",
  fields: bodyTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: "Text",
      constantValueEnabled: true,
    },
    fontSize: "default",
    fontWeight: "default",
    color: "default",
    textTransform: "none",
  },
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: "--fontFamily-body-fontFamily",
    });
    return {
      ...bodyTextFields,
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: fontWeightOptions,
      },
    };
  },
  render: (props) => <BodyText {...props} />,
};

export { BodyTextComponent as BodyText, type BodyTextProps };
