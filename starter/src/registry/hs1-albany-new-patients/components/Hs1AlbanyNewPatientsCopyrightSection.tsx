import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "../../shared/SafeLink";

type CopyrightLink = {
  label: string;
  link: string;
};

export type Hs1AlbanyNewPatientsCopyrightSectionProps = {
  links: CopyrightLink[];
};

export const Hs1AlbanyNewPatientsCopyrightSectionFields: Fields<Hs1AlbanyNewPatientsCopyrightSectionProps> =
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
      getItemSummary: (item) => item.label,
    },
  };

export const Hs1AlbanyNewPatientsCopyrightSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsCopyrightSectionProps
> = ({ links }) => {
  return (
    <section className="bg-white text-[#4a4a4a]">
      <div className="mx-auto max-w-[1170px] px-[15px] pb-6">
        <div className="flex flex-col items-center justify-center gap-3 text-center text-sm lg:flex-row lg:gap-6">
          {links.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              cta={{ link: item.link, linkType: "URL" }}
              className="text-[#4a4a4a] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsCopyrightSection: ComponentConfig<Hs1AlbanyNewPatientsCopyrightSectionProps> =
  {
    label: "Hs1 Albany New Patients Copyright Section",
    fields: Hs1AlbanyNewPatientsCopyrightSectionFields,
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
    render: Hs1AlbanyNewPatientsCopyrightSectionComponent,
  };
