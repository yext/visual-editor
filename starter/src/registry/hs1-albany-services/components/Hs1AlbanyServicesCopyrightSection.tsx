import {
  type ComponentConfig,
  type Fields,
  type PuckComponent,
} from "@puckeditor/core";
import { Link } from "../../shared/SafeLink";

type CopyrightLink = {
  label: string;
  link: string;
};

export type Hs1AlbanyServicesCopyrightSectionProps = {
  links: CopyrightLink[];
};

export const Hs1AlbanyServicesCopyrightSectionFields: Fields<Hs1AlbanyServicesCopyrightSectionProps> =
  {
    links: {
      label: "Links",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
      defaultItemProps: {
        label: "Site Map",
        link: "https://www.ofc-albany.com/sitemap",
      },
    },
  };

export const Hs1AlbanyServicesCopyrightSectionComponent: PuckComponent<
  Hs1AlbanyServicesCopyrightSectionProps
> = ({ links }) => (
  <section className="bg-white">
    <div className="mx-auto max-w-[1170px] px-6 pb-6">
      <div className="flex flex-wrap items-center justify-center gap-y-2 text-center">
        {links.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center">
            <Link
              href={item.link}
              className="px-4 text-[13px] font-bold uppercase text-[#d3a335] no-underline hover:underline"
              style={{
                fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
              }}
            >
              {item.label}
            </Link>
            {index < links.length - 1 && (
              <span className="text-[16px] text-[#0384d7]">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Hs1AlbanyServicesCopyrightSection: ComponentConfig<Hs1AlbanyServicesCopyrightSectionProps> =
  {
    label: "HS1 Albany Services Copyright Section",
    fields: Hs1AlbanyServicesCopyrightSectionFields,
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
    render: Hs1AlbanyServicesCopyrightSectionComponent,
  };
