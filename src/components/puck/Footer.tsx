import * as React from "react";
import { Link, CTA } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  FontSizeSelector,
  getFontWeightOverrideOptions,
  resolveYextEntityField,
  themeMangerCn,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.ts";
import { Body, BodyProps } from "./atoms/body.tsx";
import { cva, VariantProps } from "class-variance-authority";
import { v4 as uuidv4 } from "uuid";

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
  links: { cta: YextEntityField<CTA>; id?: string }[];
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
  resolveData: ({ props }, { lastData }) => {
    // generate a unique id for each of the links
    if (lastData?.props.links.length === props.links.length) {
      return { props };
    }

    // handle duplication by assigning a new id
    const ids: string[] = [];
    const resolveId = (id?: string) => {
      if (!id || ids.includes(id)) {
        const newId = uuidv4();
        ids.push(newId);
        return id;
      }
      return id;
    };

    return {
      props: {
        ...props,
        links: props.links.map((link) => ({
          ...link,
          id: resolveId(link.id),
        })),
      },
    };
  },
};

const FooterComponent: React.FC<FooterProps> = (props) => {
  const document = useDocument();
  const { links, backgroundColor, copyright } = props;

  const resolvedLinks = links
    ?.map((link) => {
      const resolvedCTA = resolveYextEntityField<CTA>(document, link.cta);
      if (resolvedCTA) {
        return {
          id: link.id,
          ...resolvedCTA,
        };
      }
    })
    .filter((link) => link !== undefined);
  const resolvedCopyrightText = resolveYextEntityField<string>(
    document,
    copyright.text
  );

  return (
    <footer
      className={themeMangerCn(
        "w-full bg-white components",
        footerVariants({ backgroundColor })
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-1 items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center justify-end space-x-4">
          <ul className="flex space-x-8">
            {resolvedLinks?.map((item, idx) => (
              <li
                key={item.id ?? idx}
                className="cursor-pointer font-bold text-palette-primary hover:text-palette-secondary"
              >
                <Link cta={item} eventName={`link${idx}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-4">
        <Body
          fontSize={copyright.fontSize}
          textTransform={copyright.textTransform}
          fontWeight={copyright.fontWeight}
          color={copyright.color}
        >
          {resolvedCopyrightText}
        </Body>
      </div>
    </footer>
  );
};
