import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Heading, HeadingProps } from "./atoms/heading.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
  headingLevelOptions,
} from "../../index.js";

interface HeadingTextProps extends HeadingProps {
  text: YextEntityField<string>;
}

const HeadingText = React.forwardRef<HTMLHeadingElement, HeadingTextProps>(
  ({ text, ...headingProps }, ref) => {
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
  }
);

HeadingText.displayName = "HeadingText";

const headingTextFields: Fields<HeadingTextProps> = {
  text: YextEntityFieldSelector({
    label: "Text",
    filter: {
      types: ["type.string"],
    },
  }),
  level: BasicSelector("Heading Level", headingLevelOptions),
};

const HeadingTextComponent: ComponentConfig<HeadingTextProps> = {
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
  render: (props) => <HeadingText {...props} />,
};

export { HeadingTextComponent as HeadingText, type HeadingTextProps };
