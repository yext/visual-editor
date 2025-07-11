import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  Heading,
  HeadingProps,
  YextField,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface HeadingTextProps extends HeadingProps {
  text: YextEntityField<TranslatableString>;
}

const HeadingTextWrapper = React.forwardRef<
  HTMLHeadingElement,
  HeadingTextProps
>(({ text, ...headingProps }, ref) => {
  const document = useDocument();
  const { i18n } = useTranslation();

  return (
    <EntityField
      displayName={"Heading " + headingProps.level}
      fieldId={text.field}
      constantValueEnabled={text.constantValueEnabled}
    >
      <Heading ref={ref} {...headingProps}>
        {resolveTranslatableString(
          resolveYextEntityField(document, i18n.language, text),
          i18n.language
        )}
      </Heading>
    </EntityField>
  );
});

HeadingTextWrapper.displayName = "HeadingText";

const headingTextFields: Fields<HeadingTextProps> = {
  text: YextField<any, TranslatableString>("Text", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  level: YextField("Heading Level", {
    type: "select",
    hasSearch: true,
    options: "HEADING_LEVEL",
  }),
};

export const HeadingText: ComponentConfig<HeadingTextProps> = {
  label: "Heading Text",
  fields: headingTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: "Text",
      constantValueEnabled: true,
    },
    content: "Heading",
    level: 2,
  },
  render: (props) => <HeadingTextWrapper {...props} />,
};
