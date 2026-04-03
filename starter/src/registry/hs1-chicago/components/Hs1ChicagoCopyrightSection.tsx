import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type FooterLink = {
  label: string;
  link: string;
};

export type Hs1ChicagoCopyrightSectionProps = {
  links: FooterLink[];
};

const fields: Fields<Hs1ChicagoCopyrightSectionProps> = {
  links: {
    label: "Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Admin Log In",
      link: "https://secure.officite.com",
    },
    getItemSummary: (item) => item.label,
  },
};

export const Hs1ChicagoCopyrightSectionComponent: PuckComponent<
  Hs1ChicagoCopyrightSectionProps
> = (props) => (
  <footer className="bg-[#815955] px-6 py-4 max-md:px-4">
    <div className="mx-auto max-w-[1140px] text-center">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {props.links.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <Link cta={{ link: item.link, linkType: "URL" }}>
              <span
                className="text-[12px] uppercase text-white"
                style={{
                  fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                  lineHeight: 1.33,
                }}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);

export const Hs1ChicagoCopyrightSection: ComponentConfig<Hs1ChicagoCopyrightSectionProps> =
  {
    label: "HS1 Chicago Copyright Section",
    fields,
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
          link: "https://www.ofc-chicago.com/sitemap",
        },
      ],
    },
    render: Hs1ChicagoCopyrightSectionComponent,
  };
