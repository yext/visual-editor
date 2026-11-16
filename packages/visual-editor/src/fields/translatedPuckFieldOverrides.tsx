import React from "react";
import type { Overrides } from "@puckeditor/core";
import { pt, usePlatformTranslation } from "../utils/i18n/platform.ts";

// TranslatePuckFieldLabels recursively walks the React component tree
// created by Puck fields and replaces labels with their translations.
const TranslatePuckFieldLabels = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  usePlatformTranslation();
  const replaceText = (child: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(child)) {
      if (typeof child.props.children === "string") {
        return React.cloneElement(
          child as React.ReactElement<{
            children?: React.ReactNode;
          }>,
          {
            ...child.props,
            children: pt(child.props.children),
          }
        );
      }

      if ("label" in child.props || "title" in child.props) {
        const newChildren = {
          ...child.props,
          children: React.Children.map(child.props.children, replaceText),
          label: child.props.label ? pt(child.props.label) : undefined,
          title: child.props.title ? pt(child.props.title) : undefined,
        };

        // Radio and Select options need to be translated as well
        if (
          child.props.field?.type === "radio" ||
          child.props.field?.type === "select" ||
          child.props.field?.type === "checkbox"
        ) {
          const originalField = child.props.field;
          const originalOptions = originalField.options || [];

          const translatedOptions = originalOptions.map((option: any) => ({
            ...option,
            label: pt(option.label),
          }));

          newChildren.field = {
            ...originalField,
            options: translatedOptions,
          };
        }

        return React.cloneElement(
          child as React.ReactElement<{
            children?: React.ReactNode;
          }>,
          newChildren
        );
      } else {
        return React.cloneElement(
          child as React.ReactElement<{ children?: React.ReactNode }>,
          {
            children: React.Children.map(child.props.children, replaceText),
          }
        );
      }
    }

    return child;
  };

  return <>{React.Children.map(children, replaceText)}</>;
};

// Array fields are mostly handled by the children
// field types but need an override for the array label.
const TranslatePuckArrayFieldLabels = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  usePlatformTranslation();
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      label: pt(children.props.label),
    });
  }
};

/** Translates native Puck labels at render time, including dynamically resolved fields.
 * Standalone editor hosts use the same adapters as the full Visual Editor. */
export const translatedPuckFieldOverrides = {
  array: TranslatePuckArrayFieldLabels,
  number: TranslatePuckFieldLabels,
  object: TranslatePuckFieldLabels,
  radio: TranslatePuckFieldLabels,
  select: TranslatePuckFieldLabels,
  checkbox: TranslatePuckFieldLabels,
  text: TranslatePuckFieldLabels,
  textarea: TranslatePuckFieldLabels,
  richtext: TranslatePuckFieldLabels,
} satisfies Overrides["fieldTypes"];
