import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type LinkItem = {
  label: string;
  link: string;
};

export type Hs1LagunaCopyrightSectionProps = {
  links: LinkItem[];
};

const Hs1LagunaCopyrightSectionFields: Fields<Hs1LagunaCopyrightSectionProps> =
  {
    links: {
      label: "Links",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
      defaultItemProps: {
        label: "Link",
        link: "#",
      },
      getItemSummary: (item: LinkItem) => item.label,
    },
  };

export const Hs1LagunaCopyrightSectionComponent: PuckComponent<
  Hs1LagunaCopyrightSectionProps
> = ({ links }) => {
  return (
    <section className="bg-[#1f1714] px-[14px] py-4 text-white md:px-0">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-center gap-4 text-center text-[14px] leading-[1.286]">
        {links.map((link) => (
          <Link
            key={`${link.label}-${link.link}`}
            cta={{ link: link.link, linkType: "URL" }}
            className="text-white no-underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export const Hs1LagunaCopyrightSection: ComponentConfig<Hs1LagunaCopyrightSectionProps> =
  {
    label: "Copyright",
    fields: Hs1LagunaCopyrightSectionFields,
    defaultProps: {
      links: [
        {
          label: "Copyright © 2026 MH Sub I, LLC dba Officite.",
          link: "//www.henryscheinone.com/products/officite",
        },
        {
          label: "Admin Log In",
          link: "https://secure.officite.com",
        },
        {
          label: "Site Map",
          link: "https://www.ofc-laguna.com/sitemap",
        },
      ],
    },
    render: Hs1LagunaCopyrightSectionComponent,
  };
