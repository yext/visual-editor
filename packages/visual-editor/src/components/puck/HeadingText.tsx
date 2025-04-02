import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
  ThemeOptions,
  Heading,
  HeadingProps,
} from "../../index.js";

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
  text: YextEntityFieldSelector({
    label: "Text",
    filter: {
      types: ["type.string"],
    },
  }),
  level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
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
