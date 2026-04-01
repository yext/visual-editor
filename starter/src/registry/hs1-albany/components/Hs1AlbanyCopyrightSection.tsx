import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type LinkItem = {
  label: string;
  link: string;
};

export type Hs1AlbanyCopyrightSectionProps = {
  links: LinkItem[];
};

const Hs1AlbanyCopyrightSectionFields: Fields<Hs1AlbanyCopyrightSectionProps> =
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
      getItemSummary: (item) => item.label,
    },
  };

export const Hs1AlbanyCopyrightSectionComponent: PuckComponent<
  Hs1AlbanyCopyrightSectionProps
> = (props) => {
  return (
    <section className="bg-white px-6 pb-8">
      <div className="mx-auto flex max-w-[1170px] flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
        {props.links.map((item, index) => (
          <div
            key={`${item.label}-${item.link}`}
            className="flex items-center gap-3"
          >
            <Link
              cta={{ link: item.link, linkType: "URL" }}
              className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#7a7a7a] no-underline"
              style={{ fontFamily: "Lato, Open Sans, sans-serif" }}
            >
              {item.label}
            </Link>
            {index < props.links.length - 1 ? (
              <span className="text-[#7a7a7a]">|</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export const Hs1AlbanyCopyrightSection: ComponentConfig<Hs1AlbanyCopyrightSectionProps> =
  {
    label: "HS1 Albany Copyright Section",
    fields: Hs1AlbanyCopyrightSectionFields,
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
          link: "https://www.ofc-albany.com/sitemap",
        },
      ],
    },
    render: Hs1AlbanyCopyrightSectionComponent,
  };
