import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type CopyrightLink = {
  label: string;
  link: string;
};

export type Hs1CarmelCopyrightSectionProps = {
  links: CopyrightLink[];
};

const Hs1CarmelCopyrightSectionFields: Fields<Hs1CarmelCopyrightSectionProps> =
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
      getItemSummary: (item: CopyrightLink) => item.label || "Link",
    },
  };

export const Hs1CarmelCopyrightSectionComponent: PuckComponent<
  Hs1CarmelCopyrightSectionProps
> = (props) => (
  <section className="bg-[#04364E] px-4 py-8 text-white lg:px-6">
    <div className="mx-auto max-w-[1140px]">
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-0">
        {props.links.map((item, index) => (
          <div
            key={`${item.label}-${item.link}`}
            className="flex items-center text-center md:px-4"
          >
            <Link
              cta={{
                link: item.link,
                linkType: "URL",
              }}
              className="text-sm font-normal uppercase tracking-[0.08em] text-white no-underline transition hover:text-[#7CB0D3]"
            >
              {item.label}
            </Link>
            {index < props.links.length - 1 ? (
              <span className="ml-4 hidden text-white/60 md:inline-block">
                |
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Hs1CarmelCopyrightSection: ComponentConfig<Hs1CarmelCopyrightSectionProps> =
  {
    label: "HS1 Carmel Copyright Section",
    fields: Hs1CarmelCopyrightSectionFields,
    defaultProps: {
      links: [
        {
          label: "Copyright © 2026 MH Sub I, LLC dba Officite",
          link: "//www.henryscheinone.com/products/officite",
        },
        {
          label: "Admin Log In",
          link: "https://secure.officite.com",
        },
        {
          label: "Site Map",
          link: "https://www.ofc-carmel.com/sitemap",
        },
      ],
    },
    render: Hs1CarmelCopyrightSectionComponent,
  };
