import * as React from "react";
import { Link, CTA } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  EntityField,
  FontSizeSelector,
  getFontWeightOverrideOptions,
  resolveYextEntityField,
  themeManagerCn,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.ts";
import { Body, BodyProps } from "./atoms/body.js";
import { cva, VariantProps } from "class-variance-authority";

const footerVariants = cva("", {
  variants: {
    backgroundColor: {
      default: "bg-footer-backgroundColor",
      primary: "bg-palette-primary",
      secondary: "bg-palette-secondary",
      accent: "bg-palette-accent",
      text: "bg-palette-text",
      background: "bg-palette-background",
    },
  },
  defaultVariants: {
    backgroundColor: "default",
  },
});

export interface FooterProps extends VariantProps<typeof footerVariants> {
  copyright: BodyProps & {
    text: YextEntityField<string>;
  };
  links: { cta: YextEntityField<CTA> }[];
}

const footerFields: Fields<FooterProps> = {
  copyright: {
    type: "object",
    label: "Copyright Text",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: FontSizeSelector(),
      color: {
        label: "Color",
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Accent", value: "accent" },
          { label: "Text", value: "text" },
          { label: "Background", value: "background" },
        ],
      },
      textTransform: {
        label: "Text Transform",
        type: "select",
        options: [
          { label: "None", value: "none" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  },
  links: {
    type: "array",
    label: "Links",
    arrayFields: {
      cta: YextEntityFieldSelector<any, CTA>({
        label: "Call To Action",
        filter: {
          types: ["type.cta"],
        },
      }),
    },
    getItemSummary: (_, i) => `Link ${i !== undefined ? i + 1 : ""}`,
    defaultItemProps: {
      cta: {
        field: "",
        constantValue: { link: "#", label: "Link" },
        constantValueEnabled: true,
      },
    },
  },
  backgroundColor: {
    label: "Background Color",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Accent", value: "accent" },
      { label: "Text", value: "text" },
      { label: "Background", value: "background" },
    ],
  },
};

export const Footer: ComponentConfig<FooterProps> = {
  fields: footerFields,
  defaultProps: {
    copyright: {
      text: {
        field: "",
        constantValue: "Copyright Text",
        constantValueEnabled: true,
      },
    },
    links: [
      {
        cta: {
          field: "",
          constantValue: { link: "#", label: "Footer Link" },
          constantValueEnabled: true,
        },
      },
      {
        cta: {
          field: "",
          constantValue: { link: "#", label: "Footer Link" },
          constantValueEnabled: true,
        },
      },
      {
        cta: {
          field: "",
          constantValue: { link: "#", label: "Footer Link" },
          constantValueEnabled: true,
        },
      },
    ],
  },
  label: "Footer",
  render: (props) => <FooterComponent {...props} />,
  resolveFields: async (_, { fields }) => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: "--fontFamily-body-fontFamily",
    });
    return {
      ...fields,
      copyright: {
        ...fields.copyright,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields does exist on the copyright field
          ...fields.copyright.objectFields,
          fontWeight: {
            label: "Font Weight",
            type: "select",
            options: fontWeightOptions,
          },
        },
      },
    };
  },
};

const FooterComponent: React.FC<FooterProps> = (props) => {
  const document = useDocument();
  const { links, backgroundColor, copyright } = props;

  const resolvedLinks = links
    ?.map((link) => resolveYextEntityField<CTA>(document, link.cta))
    .filter((link) => link !== undefined);

  const resolvedCopyrightText = resolveYextEntityField<string>(
    document,
    copyright.text
  );

  return (
    <footer
      className={themeManagerCn(
        "w-full bg-white components",
        footerVariants({ backgroundColor })
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-1 items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center justify-end space-x-4">
          <ul className="flex space-x-8">
            {resolvedLinks?.map((item, idx) => (
              <li
                key={idx}
                className="cursor-pointer font-bold font-body-fontFamily text-footer-linkColor text-footer-linkFontSize hover:underline"
              >
                {item.link && (
                  <EntityField
                    displayName="Link"
                    fieldId={links[idx].cta.field}
                    constantValueEnabled={links[idx].cta.constantValueEnabled}
                  >
                    <Link cta={item} eventName={`footer-link-${item.label}`} />
                  </EntityField>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-4">
        <EntityField
          displayName="Copyright Text"
          fieldId={copyright.text.field}
          constantValueEnabled={copyright.text.constantValueEnabled}
        >
          <Body
            fontSize={copyright.fontSize}
            textTransform={copyright.textTransform}
            fontWeight={copyright.fontWeight}
            color={copyright.color}
          >
            {resolvedCopyrightText}
          </Body>
        </EntityField>
      </div>
    </footer>
  );
};
