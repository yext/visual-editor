import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type HeaderLinkItem = {
  label: string;
  link: string;
};

type HeaderActionItem = HeaderLinkItem & {
  variant: "plain" | "pill";
};

export type FriendlyFacesHeaderSectionProps = {
  skipLink: HeaderLinkItem;
  primaryLinks: HeaderLinkItem[];
  brandLink: {
    initial: string;
    name: string;
    link: string;
  };
  actionLinks: HeaderActionItem[];
};

const headerLinkFields = {
  label: { label: "Label", type: "text" },
  link: { label: "Link", type: "text" },
} as const;

const FriendlyFacesHeaderSectionFields: Fields<FriendlyFacesHeaderSectionProps> =
  {
    skipLink: {
      label: "Skip Link",
      type: "object",
      objectFields: headerLinkFields,
    },
    primaryLinks: {
      label: "Primary Links",
      type: "array",
      arrayFields: headerLinkFields,
      defaultItemProps: {
        label: "Link",
        link: "#",
      },
      getItemSummary: (item) => item.label,
    },
    brandLink: {
      label: "Brand Link",
      type: "object",
      objectFields: {
        initial: { label: "Initial", type: "text" },
        name: { label: "Name", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    actionLinks: {
      label: "Action Links",
      type: "array",
      arrayFields: {
        ...headerLinkFields,
        variant: {
          label: "Variant",
          type: "select",
          options: [
            { label: "Plain", value: "plain" },
            { label: "Pill", value: "pill" },
          ],
        },
      },
      defaultItemProps: {
        label: "Action",
        link: "#",
        variant: "plain",
      },
      getItemSummary: (item) => item.label,
    },
  };

export const FriendlyFacesHeaderSectionComponent: PuckComponent<
  FriendlyFacesHeaderSectionProps
> = (props) => {
  return (
    <header className="relative w-full bg-white">
      <Link
        cta={{ link: props.skipLink.link, linkType: "URL" }}
        className="absolute left-4 top-4 -translate-y-[180%] rounded-full bg-[#111111] px-[14px] py-[10px] text-sm font-bold text-white no-underline focus-visible:translate-y-0"
      >
        {props.skipLink.label}
      </Link>
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-6">
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.primaryLinks.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{ link: item.link, linkType: "URL" }}
                className="inline-flex min-h-11 items-center font-['Nunito','Open_Sans',sans-serif] text-base font-normal text-[#17313d] no-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
            aria-label="Header actions"
            className="flex flex-wrap items-center gap-5"
          >
            {props.actionLinks.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{ link: item.link, linkType: "URL" }}
                className={
                  item.variant === "pill"
                    ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#0f7c82] px-[18px] font-['Nunito','Open_Sans',sans-serif] text-base font-extrabold text-[#0f7c82] no-underline"
                    : "inline-flex min-h-11 items-center font-['Nunito','Open_Sans',sans-serif] text-base font-normal text-[#17313d] no-underline"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export const FriendlyFacesHeaderSection: ComponentConfig<FriendlyFacesHeaderSectionProps> =
  {
    label: "Friendly Faces Header Section",
    fields: FriendlyFacesHeaderSectionFields,
    defaultProps: {
      skipLink: {
        label: "Skip to main content",
        link: "#main-content",
      },
      primaryLinks: [
        { label: "Services", link: "#" },
        { label: "New patients", link: "#" },
      ],
      brandLink: {
        initial: "M",
        name: "Maple Grove Pediatrics",
        link: "#",
      },
      actionLinks: [
        { label: "Forms", link: "#", variant: "plain" },
        { label: "Book a visit", link: "#", variant: "pill" },
      ],
    },
    render: FriendlyFacesHeaderSectionComponent,
  };
