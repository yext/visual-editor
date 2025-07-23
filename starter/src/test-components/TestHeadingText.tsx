import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  TranslatableString,
  resolveTranslatableString,
  Heading,
  HeadingProps,
} from "@yext/visual-editor";

export interface HeadingTextProps extends HeadingProps {
  text: YextEntityField<TranslatableString>;
}

const headingTextFields: Fields<HeadingTextProps> = {
  text: YextField<any, TranslatableString>("Text", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  level: YextField("Level", {
    type: "select",
    hasSearch: true,
    options: "HEADING_LEVEL",
  }),
};

const HeadingTextComponent = React.forwardRef<
  HTMLHeadingElement,
  HeadingTextProps
>(({ text, level, ...headingProps }, ref) => {
  const { t, i18n } = useTranslation();
  const document = useDocument();

  return (
    <EntityField
      displayName={t("heading", "Heading")}
      fieldId={text.field}
      constantValueEnabled={text.constantValueEnabled}
    >
      <Heading
        ref={ref}
        level={level}
        {...headingProps}
        data-component-type="HeadingText"
        className={`heading-text-component ${headingProps.className || ""}`}
      >
        {resolveTranslatableString(
          resolveYextEntityField(document, text),
          i18n.language,
        )}
      </Heading>
    </EntityField>
  );
});

HeadingTextComponent.displayName = "HeadingText";

export const HeadingText: ComponentConfig<HeadingTextProps> = {
  label: "Heading Text",
  fields: headingTextFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: "Heading Text",
      constantValueEnabled: true,
    },
    level: 2,
  },
  render: (props) => <HeadingTextComponent {...props} />,
};
