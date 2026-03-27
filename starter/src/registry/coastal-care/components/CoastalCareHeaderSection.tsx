import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

export type CoastalCareHeaderLink = {
  label: string;
  link: string;
  variant: "text" | "solid";
};

export type CoastalCareHeaderSectionProps = {
  brandLink: {
    label: string;
    link: string;
  };
  navigationLinks: CoastalCareHeaderLink[];
};

const CoastalCareHeaderSectionFields: Fields<CoastalCareHeaderSectionProps> = {
  brandLink: {
    label: "Brand Link",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  navigationLinks: {
    label: "Navigation Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      variant: {
        label: "Variant",
        type: "select",
        options: [
          { label: "Text", value: "text" },
          { label: "Solid", value: "solid" },
        ],
      },
    },
    defaultItemProps: {
      label: "Navigation Link",
      link: "#",
      variant: "text",
    },
    getItemSummary: (item) => item.label || "Navigation Link",
  },
};

export const CoastalCareHeaderSectionComponent: PuckComponent<
  CoastalCareHeaderSectionProps
> = ({ brandLink, navigationLinks }) => {
  const brandInitial = brandLink.label.trim().charAt(0).toUpperCase() || "C";

  return (
    <header className="mb-6 w-full bg-white">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 py-[22px]">
        <div className="flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#2d6f83] font-['Public_Sans','Open_Sans',sans-serif] text-sm font-extrabold text-white">
            {brandInitial}
          </div>
          <Link
            cta={{
              link: brandLink.link,
              linkType: "URL",
            }}
            className="font-['Public_Sans','Open_Sans',sans-serif] text-sm font-extrabold text-[#183347] no-underline"
          >
            {brandLink.label}
          </Link>
        </div>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {navigationLinks.map((item) => {
            const isSolid = item.variant === "solid";

            return (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{
                  link: item.link,
                  linkType: "URL",
                }}
                className={
                  isSolid
                    ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d6f83] bg-[#2d6f83] px-[18px] font-['Public_Sans','Open_Sans',sans-serif] text-sm font-bold text-white no-underline"
                    : "inline-flex min-h-[44px] items-center font-['Public_Sans','Open_Sans',sans-serif] text-sm font-normal text-[#183347] no-underline"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export const CoastalCareHeaderSection: ComponentConfig<CoastalCareHeaderSectionProps> =
  {
    label: "Coastal Care Header Section",
    fields: CoastalCareHeaderSectionFields,
    defaultProps: {
      brandLink: {
        label: "Harbor Animal Clinic",
        link: "#",
      },
      navigationLinks: [
        {
          label: "Services",
          link: "#",
          variant: "text",
        },
        {
          label: "New clients",
          link: "#",
          variant: "text",
        },
        {
          label: "Care team",
          link: "#",
          variant: "text",
        },
        {
          label: "Book appointment",
          link: "#",
          variant: "solid",
        },
      ],
    },
    render: CoastalCareHeaderSectionComponent,
  };
