import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type FooterLinkItem = {
  label: string;
  link: string;
};

type SocialLinkItem = FooterLinkItem & {
  ariaLabel: string;
};

export type FriendlyFacesFooterSectionProps = {
  brandLink: {
    initial: string;
    name: string;
    link: string;
  };
  footerLinks: FooterLinkItem[];
  socialLinks: SocialLinkItem[];
};

const footerLinkFields = {
  label: { label: "Label", type: "text" },
  link: { label: "Link", type: "text" },
} as const;

const FriendlyFacesFooterSectionFields: Fields<FriendlyFacesFooterSectionProps> =
  {
    brandLink: {
      label: "Brand Link",
      type: "object",
      objectFields: {
        initial: { label: "Initial", type: "text" },
        name: { label: "Name", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    footerLinks: {
      label: "Footer Links",
      type: "array",
      arrayFields: footerLinkFields,
      defaultItemProps: {
        label: "Link",
        link: "#",
      },
      getItemSummary: (item) => item.label,
    },
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: {
        ...footerLinkFields,
        ariaLabel: { label: "Aria Label", type: "text" },
      },
      defaultItemProps: {
        label: "f",
        link: "#",
        ariaLabel: "Social link",
      },
      getItemSummary: (item) => item.ariaLabel,
    },
  };

export const FriendlyFacesFooterSectionComponent: PuckComponent<
  FriendlyFacesFooterSectionProps
> = (props) => {
  return (
    <footer className="mt-[72px] w-full border-t border-[#d5e8ea] bg-white">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-6 px-6 py-6">
        <Link
          cta={{ link: props.brandLink.link, linkType: "URL" }}
          className="inline-flex items-center gap-3 font-['Nunito','Open_Sans',sans-serif] font-extrabold text-[#17313d] no-underline"
        >
          <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#0f7c82] text-base font-extrabold text-white">
            {props.brandLink.initial}
          </span>
          <span>{props.brandLink.name}</span>
        </Link>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.footerLinks.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              cta={{ link: item.link, linkType: "URL" }}
              className="font-['Nunito','Open_Sans',sans-serif] text-base text-[#17313d] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div
          aria-label="Social media links"
          className="flex flex-wrap items-center gap-3"
        >
          {props.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.ariaLabel}`}
              cta={{ link: item.link, linkType: "URL" }}
              aria-label={item.ariaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d5e8ea] font-['Nunito','Open_Sans',sans-serif] text-sm font-bold text-[#0f7c82] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const FriendlyFacesFooterSection: ComponentConfig<FriendlyFacesFooterSectionProps> =
  {
    label: "Friendly Faces Footer Section",
    fields: FriendlyFacesFooterSectionFields,
    defaultProps: {
      brandLink: {
        initial: "M",
        name: "Maple Grove Pediatrics",
        link: "#",
      },
      footerLinks: [
        { label: "Services", link: "#" },
        { label: "New patients", link: "#" },
        { label: "Contact", link: "#" },
      ],
      socialLinks: [
        {
          label: "f",
          link: "#",
          ariaLabel: "Maple Grove Pediatrics on Facebook",
        },
        {
          label: "ig",
          link: "#",
          ariaLabel: "Maple Grove Pediatrics on Instagram",
        },
        {
          label: "yt",
          link: "#",
          ariaLabel: "Maple Grove Pediatrics on YouTube",
        },
      ],
    },
    render: FriendlyFacesFooterSectionComponent,
  };
