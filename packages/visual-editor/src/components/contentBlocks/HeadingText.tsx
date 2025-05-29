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
  i18n,
} from "@yext/visual-editor";

export interface HeadingTextProps extends HeadingProps {
  text: YextEntityField<string>;
}

const HeadingTextWrapper = React.forwardRef<
  HTMLHeadingElement,
  HeadingTextProps
>(({ text, ...headingProps }, ref) => {
  const document = useDocument();

  return (
    <EntityField
      displayName={"Heading " + headingProps.level}
      fieldId={text.field}
      constantValueEnabled={text.constantValueEnabled}
    >
      <Heading ref={ref} {...headingProps}>
        {resolveYextEntityField(document, text)}
      </Heading>
    </EntityField>
  );
});

HeadingTextWrapper.displayName = "HeadingText";

const headingTextFields: Fields<HeadingTextProps> = {
  text: YextField<any, string>(i18n("Text"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  level: YextField(i18n("Heading Level"), {
    type: "select",
    hasSearch: true,
    options: "HEADING_LEVEL",
  }),
};

export const HeadingText: ComponentConfig<HeadingTextProps> = {
  label: i18n("Heading Text"),
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
