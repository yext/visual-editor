import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  EntityField,
  YextEntityField,
  Heading,
  HeadingProps,
  YextField,
  TranslatableString,
  resolveComponentData,
  pt,
  msg,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export type HeadingTextProps = {
  text: YextEntityField<TranslatableString>;
  level: HeadingProps["level"];
};

const HeadingTextWrapper = React.forwardRef<
  HTMLHeadingElement,
  HeadingTextProps
>(({ text, ...headingProps }, ref) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  return (
    <EntityField
      displayName={pt("Heading", "Heading") + " " + headingProps.level}
      fieldId={text.field}
      constantValueEnabled={text.constantValueEnabled}
    >
      <Heading ref={ref} {...headingProps}>
        {resolveComponentData(text, i18n.language, streamDocument)}
      </Heading>
    </EntityField>
  );
});

HeadingTextWrapper.displayName = "HeadingText";

const headingTextFields: Fields<HeadingTextProps> = {
  text: YextField<any, TranslatableString>(msg("fields.text", "Text"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  level: YextField(msg("fields.headingLevel", "Heading Level"), {
    type: "select",
    hasSearch: true,
    options: "HEADING_LEVEL",
  }),
};

export const HeadingText: ComponentConfig<{ props: HeadingTextProps }> = {
  label: msg("components.headingText", "Heading Text"),
  fields: headingTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: {
        en: "Text",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    level: 2,
  },
  render: (props) => <HeadingTextWrapper {...props} />,
};
