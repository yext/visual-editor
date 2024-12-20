import * as React from "react";
import { Link, CTA, ImageType, Image } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  themeMangerCn,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.ts";
import { cva, VariantProps } from "class-variance-authority";
import { v4 } from "uuid";

const PLACEHOLDER_LOGO_URL = "https://placehold.co/50";

const headerVariants = cva("", {
  variants: {
    backgroundColor: {
      default: "bg-header-backgroundColor",
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

export interface HeaderProps extends VariantProps<typeof headerVariants> {
  logo: {
    image: YextEntityField<ImageType>;
  };
  links: { cta: YextEntityField<CTA>; id?: string }[];
}

const headerFields: Fields<HeaderProps> = {
  logo: {
    type: "object",
    label: "Logo",
    objectFields: {
      image: YextEntityFieldSelector<any, ImageType>({
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      }),
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
      id: v4(),
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

export const Header: ComponentConfig<HeaderProps> = {
  fields: headerFields,
  defaultProps: {
    logo: {
      image: {
        field: "",
        constantValue: {
          height: 50,
          width: 50,
          url: PLACEHOLDER_LOGO_URL,
        },
        constantValueEnabled: true,
      },
    },
    links: [
      {
        cta: {
          field: "",
          constantValue: { link: "#", label: "Link" },
          constantValueEnabled: true,
        },
      },
      {
        cta: {
          field: "",
          constantValue: { link: "#", label: "Link" },
          constantValueEnabled: true,
        },
      },
      {
        cta: {
          field: "",
          constantValue: { link: "#", label: "Link" },
          constantValueEnabled: true,
        },
      },
    ],
  },
  label: "Header",
  render: (props) => <HeaderComponent {...props} />,
  resolveData: ({ props }, { lastData }) => {
    if (lastData?.props.links.length === props.links.length) {
      return { props };
    }

    return {
      props: {
        ...props,
        links: props.links.map((link) => ({
          ...link,
          id: link.id ?? v4(),
        })),
      },
    };
  },
};

const HeaderComponent: React.FC<HeaderProps> = (props) => {
  const document = useDocument();
  const { logo, links, backgroundColor } = props;

  const resolvedLogo = resolveYextEntityField<ImageType>(document, logo.image);
  const resolvedLinks = links
    ?.map((link) => {
      const resolvedCTA = resolveYextEntityField<CTA>(document, link.cta);
      if (resolvedCTA) {
        return {
          id: link.id!,
          ...resolvedCTA,
        };
      }
    })
    .filter((link) => link !== undefined);

  console.log(resolvedLinks, links);
  return (
    <header
      className={themeMangerCn(
        "w-full bg-white components",
        headerVariants({ backgroundColor })
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-1 items-center justify-between px-4 py-6">
        {resolvedLogo && (
          <Image image={resolvedLogo} className="w-full h-full object-cover" />
        )}
        <div className="flex items-center justify-end space-x-4">
          <ul className="flex space-x-8">
            {resolvedLinks?.map((item, idx) => (
              <li
                key={item.id}
                className="cursor-pointer font-bold text-palette-primary hover:text-palette-secondary"
              >
                <Link cta={item} eventName={`link${idx}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};
