import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Body, BodyProps } from "./atoms/body.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";

interface BodyTextProps {
  text: YextEntityField<string>;
  variant: "small" | "base" | "large";
}

const BodyText = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ text, variant }, ref) => {
    const document = useDocument();

    // Map variant to fontSize
    const variantToFontSize: Record<
      BodyTextProps["variant"],
      NonNullable<BodyProps["fontSize"]>
    > = {
      small: "xs",
      base: "base",
      large: "xl",
    };
    const fontSize = variantToFontSize[variant];

    return (
      <EntityField
        displayName="Body"
        fieldId={text.field}
        constantValueEnabled={text.constantValueEnabled}
      >
        <Body ref={ref} fontSize={fontSize}>
          {resolveYextEntityField(document, text)}
        </Body>
      </EntityField>
    );
  }
);

BodyText.displayName = "BodyText";

const bodyTextFields: Fields<BodyTextProps> = {
  text: YextEntityFieldSelector({
    label: "Text",
    filter: {
      types: ["type.string"],
    },
  }),
  variant: {
    label: "Variant",
    type: "radio",
    options: [
      { label: "Small", value: "small" },
      { label: "Base", value: "base" },
      { label: "Large", value: "large" },
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
    variant: "base",
  },
  render: (props) => <BodyText {...props} />,
};

export { BodyTextComponent as BodyText, type BodyTextProps };
