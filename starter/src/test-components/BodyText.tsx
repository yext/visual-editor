import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Body,
  BodyProps,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";

export interface BodyTextProps extends BodyProps {
  text: YextEntityField<TranslatableString>;
}

const bodyTextFields: Fields<BodyTextProps> = {
  text: YextField<any, TranslatableString>("Text", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  variant: YextField("Variant", {
    type: "radio",
    options: "BODY_VARIANT",
  }),
};

const BodyTextComponent = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ text, ...bodyProps }, ref) => {
    const { t, i18n } = useTranslation();
    const document = useDocument();

    return (
      <EntityField
        displayName={t("body", "Body")}
        fieldId={text.field}
        constantValueEnabled={text.constantValueEnabled}
      >
        <Body ref={ref} {...bodyProps}>
          {resolveTranslatableString(
            resolveYextEntityField(document, text),
            i18n.language,
          )}
        </Body>
      </EntityField>
    );
  },
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
