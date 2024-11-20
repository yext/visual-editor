import React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { CTA, CTAProps } from "./atoms/cta.tsx";
import { cn } from "../../internal/utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { EntityField } from "../editor/EntityField.tsx";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../editor/YextEntityFieldSelector.tsx";
import { FontSizeSelector } from "../editor/FontSizeSelector.tsx";

export interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  fontSize: CTAProps["fontSize"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["c_cta"],
    },
  }),
  fontSize: FontSizeSelector(),
  variant: {
    type: "select",
    label: "Variant",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Outline", value: "outline" },
      { label: "Link", value: "link" },
    ],
  },
};

const CTAWrapper: React.FC<CTAWrapperProps> = ({
  entityField,
  variant,
  className,
  fontSize,
  ...rest
}) => {
  const document = useDocument();
  const cta = resolveYextEntityField(document, entityField);

  return (
    <EntityField
      displayName="CTA"
      fieldId={
        entityField.constantValueEnabled ? "constant value" : entityField.field
      }
    >
      <CTA
        label={cta?.name}
        url={cta?.url ?? "#"}
        variant={variant}
        className={cn(className)}
        fontSize={fontSize}
        {...rest}
      />
    </EntityField>
  );
};

export const CTAWrapperComponent: ComponentConfig<CTAWrapperProps> = {
  label: "Call to Action",
  fields: ctaWrapperFields,
  defaultProps: {
    entityField: {
      field: "",
      constantValue: {
        label: "Call to Action",
        variant: "primary",
        size: "default",
      },
    },
    variant: "primary",
    fontSize: "default",
  },
  render: (props) => <CTAWrapper {...props} />,
};

export { CTAWrapper };
