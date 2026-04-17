import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "../../shared/SafeLink";

type FooterLink = {
  label: string;
  href: string;
  newTab?: boolean;
};

export type Hs1AlbanyStaffCopyrightSectionProps = {
  links: FooterLink[];
};

export const Hs1AlbanyStaffCopyrightSectionFields: Fields<Hs1AlbanyStaffCopyrightSectionProps> =
  {
    links: {
      label: "Links",
      type: "array",
      defaultItemProps: {
        label: "New Link",
        href: "#",
        newTab: false,
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        href: { label: "Link", type: "text" },
        newTab: {
          label: "Open In New Tab",
          type: "radio",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
      },
    },
  };

export const Hs1AlbanyStaffCopyrightSectionComponent: PuckComponent<
  Hs1AlbanyStaffCopyrightSectionProps
> = ({ links }) => {
  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[64px] max-w-[1140px] flex-wrap items-center justify-center gap-x-[14px] gap-y-[6px] border-t border-[#ececec] px-[15px] py-[20px]">
        {links.map((link, index) => (
          <div
            key={`${link.label}-${index}`}
            className="flex items-center gap-x-[14px]"
          >
            <Link
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              rel={link.newTab ? "noreferrer" : undefined}
              className="text-center text-[13px] font-bold uppercase leading-[19.5px] text-[#d3a335] no-underline [font-family:'Lato','Open_Sans',Arial,Helvetica,sans-serif]"
            >
              {link.label}
            </Link>
            {index < links.length - 1 ? (
              <span className="text-[#2f5d8a]">|</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffCopyrightSection: ComponentConfig<Hs1AlbanyStaffCopyrightSectionProps> =
  {
    label: "HS1 Albany Staff Copyright Section",
    fields: Hs1AlbanyStaffCopyrightSectionFields,
    defaultProps: {
      links: [
        {
          label: "Copyright © 2026 MH Sub I, LLC dba Officite",
          href: "//www.henryscheinone.com/products/officite",
          newTab: true,
        },
        {
          label: "Admin Log In",
          href: "https://secure.officite.com",
          newTab: true,
        },
        {
          label: "Site Map",
          href: "https://www.ofc-albany.com/sitemap",
          newTab: false,
        },
      ],
    },
    render: Hs1AlbanyStaffCopyrightSectionComponent,
  };
