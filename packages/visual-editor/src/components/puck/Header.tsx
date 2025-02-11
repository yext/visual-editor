import * as React from "react";
import { Link, CTA, ImageType, Image } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  EntityField,
  resolveYextEntityField,
  themeManagerCn,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.ts";
import { cva, VariantProps } from "class-variance-authority";

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
  links: { cta: YextEntityField<CTA> }[];
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
};

const HeaderComponent: React.FC<HeaderProps> = (props) => {
  const document = useDocument();
  const { logo, links, backgroundColor } = props;

  const resolvedLogo = resolveYextEntityField<ImageType>(document, logo.image);

  const resolvedLinks = links
    ?.map((link) => resolveYextEntityField<CTA>(document, link.cta))
    .filter((link) => link !== undefined);

  return (
    <header
      className={themeManagerCn(
        "w-full bg-white components",
        headerVariants({ backgroundColor })
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-1 items-center justify-between px-4 py-6">
        {resolvedLogo && (
          <EntityField
            displayName="Logo"
            fieldId={logo.image.field}
            constantValueEnabled={logo.image.constantValueEnabled}
          >
            <Image
              image={resolvedLogo}
              className="w-full h-full object-cover"
            />
          </EntityField>
        )}
        <div className="flex items-center justify-end space-x-4">
          <ul className="flex space-x-8">
            {resolvedLinks?.map((item, idx) => (
              <li
                key={idx}
                className="cursor-pointer font-bold text-palette-primary hover:text-palette-secondary"
              >
                {item.link && (
                  <EntityField
                    displayName="Link"
                    fieldId={links[idx].cta.field}
                    constantValueEnabled={links[idx].cta.constantValueEnabled}
                  >
                    <Link cta={item} eventName={`header-link-${item.label}`} />
                  </EntityField>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};
