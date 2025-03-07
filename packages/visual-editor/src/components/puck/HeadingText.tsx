import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Heading, HeadingProps } from "./atoms/heading.js";
import { BasicSelector } from "../editor/index.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  FontSizeSelector,
  getFontWeightOverrideOptions,
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
  fontSize: FontSizeSelector(),
  color: BasicSelector("Font Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
  transform: BasicSelector("Text Transform", [
    { value: "none", label: "None" },
    { value: "lowercase", label: "Lowercase" },
    { value: "uppercase", label: "Uppercase" },
    { value: "capitalize", label: "Capitalize" },
  ]),
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
    fontSize: "default",
    weight: "default",
    color: "default",
    transform: "none",
  },
  resolveFields: async (data) => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-heading${data.props.level}-fontFamily`,
    });
    return {
      ...headingTextFields,
      weight: BasicSelector("Font Weight", fontWeightOptions),
    };
  },
  render: (props) => <HeadingText {...props} />,
};

export { HeadingTextComponent as HeadingText, type HeadingTextProps };
