import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Body,
  BodyProps,
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  YextField,
  pt,
  msg,
  TranslatableString,
} from "@yext/visual-editor";

export interface BodyTextProps extends BodyProps {
  text: YextEntityField<TranslatableString>;
}

const bodyTextFields: Fields<BodyTextProps> = {
  text: YextField<any, TranslatableString>(msg("fields.text", "Text"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  variant: YextField(msg("fields.variant", "Variant"), {
    type: "radio",
    options: "BODY_VARIANT",
  }),
};

const BodyTextComponent = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ text, ...bodyProps }, ref) => {
    const { i18n } = useTranslation();
    const streamDocument = useDocument();

    return (
      <EntityField
        displayName={pt("body", "Body")}
        fieldId={text.field}
        constantValueEnabled={text.constantValueEnabled}
      >
        <Body ref={ref} {...bodyProps}>
          {resolveComponentData(text, i18n.language, streamDocument)}
        </Body>
      </EntityField>
    );
  }
);

BodyTextComponent.displayName = "BodyText";

export const BodyText: ComponentConfig<BodyTextProps> = {
  label: msg("components.bodyText", "Body Text"),
  fields: bodyTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: {
        en: "Text",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    variant: "base",
  },
  render: (props) => <BodyTextComponent {...props} />,
};
