import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Heading, HeadingProps, headingVariants } from "./atoms/heading.js";
import { useDocument } from "../hooks/useDocument.js";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../components/YextEntityFieldSelector.js";
import { EntityField } from "../components/EntityField.js";
import { resolveYextEntityField } from "../utils/resolveYextEntityField.js";

export interface HeadingTextProps extends HeadingProps {
  text: YextEntityField;
}

const HeadingText = React.forwardRef<HTMLHeadingElement, HeadingTextProps>(
  ({ text, ...headingProps }, ref) => {
    const document = useDocument();

    return (
      <EntityField fieldId={text.field}>
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
    label: "Entity Field",
    filter: {
      types: ["type.string"],
    },
  }),
  level: {
    type: "number",
    label: "Heading Level",
    min: 1,
    max: 6,
  },
};

export const HeadingTextComponent: ComponentConfig<HeadingTextProps> = {
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

export { HeadingText, headingVariants };
