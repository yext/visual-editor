import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Body,
  BodyProps,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  ThemeOptions,
} from "@yext/visual-editor";

export interface BodyTextProps extends BodyProps {
  text: YextEntityField<string>;
}

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
    options: ThemeOptions.BODY_VARIANT,
  },
};

const BodyTextComponent = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
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

BodyTextComponent.displayName = "BodyText";

export const BodyText: ComponentConfig<BodyTextProps> = {
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
  render: (props) => <BodyTextComponent {...props} />,
};
