import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { useDocument } from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type HeaderLink = {
  label: string;
  link: string;
};

export type NaturallyGroundedHeaderSectionProps = {
  brand: HeaderLink;
  navigationLinks: HeaderLink[];
};

const headerLinkFields = {
  label: {
    label: "Label",
    type: "text",
  },
  link: {
    label: "Link",
    type: "text",
  },
} satisfies Fields<HeaderLink>;

export const NaturallyGroundedHeaderSectionComponent: PuckComponent<
  NaturallyGroundedHeaderSectionProps
> = (props) => {
  useDocument();

  return (
    <header className="w-full border-b border-[#d8e2d8] bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-6 px-6 py-5 font-['Work_Sans','Open_Sans',sans-serif] text-[#1f2a24]">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#1d4b33] text-base font-extrabold text-white"
          >
            F
          </div>
          <Link
            cta={{
              link: props.brand.link,
              linkType: "URL",
            }}
          >
            <span className="text-base font-extrabold text-[#1f2a24] no-underline">
              {props.brand.label}
            </span>
          </Link>
        </div>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.navigationLinks.map((item, index) => {
            const isPillCta = index === props.navigationLinks.length - 1;

            return (
              <Link
                key={`${item.label}-${index}`}
                cta={{
                  link: item.link,
                  linkType: "URL",
                }}
              >
                <span
                  className={`inline-flex min-h-[44px] items-center text-base no-underline ${
                    isPillCta
                      ? "min-h-[46px] rounded-full border-2 border-[#1d4b33] px-[18px] font-bold text-[#1d4b33]"
                      : "text-[#1f2a24]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export const NaturallyGroundedHeaderSection: ComponentConfig<NaturallyGroundedHeaderSectionProps> =
  {
    label: "Naturally Grounded Header Section",
    fields: {
      brand: {
        label: "Brand",
        type: "object",
        objectFields: headerLinkFields,
      },
      navigationLinks: {
        label: "Navigation Links",
        type: "array",
        arrayFields: headerLinkFields,
        defaultItemProps: {
          label: "Link",
          link: "#",
        },
        getItemSummary: (item) => item.label || "Navigation Link",
      },
    },
    defaultProps: {
      brand: {
        label: "Field & Root Market",
        link: "#",
      },
      navigationLinks: [
        {
          label: "Departments",
          link: "#",
        },
        {
          label: "Weekly picks",
          link: "#",
        },
        {
          label: "Nearby stores",
          link: "#",
        },
        {
          label: "Order pickup",
          link: "#",
        },
      ],
    },
    render: NaturallyGroundedHeaderSectionComponent,
  };
