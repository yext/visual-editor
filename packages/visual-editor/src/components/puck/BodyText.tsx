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
    label: "Text",
    filter: {
      types: ["type.string"],
    },
  }),
  fontSize: {
    label: "Variant",
    type: "radio",
    options: [
      { label: "Small", value: "sm" },
      { label: "Base", value: "base" },
      { label: "Large", value: "lg" },
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
    fontSize: "base",
  },
  render: (props) => <BodyText {...props} />,
};

export { BodyTextComponent as BodyText, type BodyTextProps };
