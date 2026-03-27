import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type LinkItem = {
  label: string;
  link: string;
};

export type WellnessRetreatHeaderSectionProps = {
  brandLink: LinkItem;
  navigationLinks: LinkItem[];
  cta: LinkItem;
};

const WellnessRetreatHeaderSectionFields: Fields<WellnessRetreatHeaderSectionProps> =
  {
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
      },
      defaultItemProps: {
        label: "Navigation Link",
        link: "#",
      },
      getItemSummary: (item) => item.label || "Navigation Link",
    },
    cta: {
      label: "Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
  };

export const WellnessRetreatHeaderSectionComponent: PuckComponent<
  WellnessRetreatHeaderSectionProps
> = (props) => {
  const logoLetter =
    props.brandLink.label.trim().charAt(0).toUpperCase() || "S";

  return (
    <header className="w-full border-b border-[#d9dde1] bg-white">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 py-[22px]">
        <div className="flex items-center gap-3">
          <div className="inline-flex size-[38px] items-center justify-center border border-[#101418] text-sm font-bold text-[#101418]">
            {logoLetter}
          </div>
          <Link
            cta={{ link: props.brandLink.link, linkType: "URL" }}
            className="inline-flex min-h-11 items-center font-['Inter',sans-serif] text-base font-bold text-[#101418] no-underline"
          >
            {props.brandLink.label}
          </Link>
        </div>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.navigationLinks.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              cta={{ link: item.link, linkType: "URL" }}
              className="inline-flex min-h-11 items-center font-['Inter',sans-serif] text-base font-normal text-[#101418] no-underline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            cta={{ link: props.cta.link, linkType: "URL" }}
            className="inline-flex min-h-[46px] items-center justify-center border border-[#101418] px-[18px] font-['Inter',sans-serif] text-base font-semibold text-[#101418] no-underline"
          >
            {props.cta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export const WellnessRetreatHeaderSection: ComponentConfig<WellnessRetreatHeaderSectionProps> =
  {
    label: "Wellness Retreat Header Section",
    fields: WellnessRetreatHeaderSectionFields,
    defaultProps: {
      brandLink: {
        label: "Stillpoint Wellness Studio",
        link: "#",
      },
      navigationLinks: [
        { label: "Classes", link: "#" },
        { label: "Memberships", link: "#" },
        { label: "Visit", link: "#" },
      ],
      cta: {
        label: "Book a class",
        link: "#",
      },
    },
    render: WellnessRetreatHeaderSectionComponent,
  };
