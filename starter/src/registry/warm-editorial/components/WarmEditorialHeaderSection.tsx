import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type HeaderLinkItem = {
  label: string;
  link: string;
  variant: "plain" | "solid";
};

export type WarmEditorialHeaderSectionProps = {
  logoLetter: StyledTextProps;
  brandLink: {
    label: string;
    link: string;
  };
  navLinks: HeaderLinkItem[];
};

const createStyledTextFields = (label: string) =>
  ({
    label,
    type: "object",
    objectFields: {
      text: YextEntityFieldSelector<any, TranslatableString>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: { label: "Font Size", type: "number" },
      fontColor: { label: "Font Color", type: "text" },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: [
          { label: "Thin", value: 100 },
          { label: "Extra Light", value: 200 },
          { label: "Light", value: 300 },
          { label: "Regular", value: 400 },
          { label: "Medium", value: 500 },
          { label: "Semi Bold", value: 600 },
          { label: "Bold", value: 700 },
          { label: "Extra Bold", value: 800 },
          { label: "Black", value: 900 },
        ],
      },
      textTransform: {
        label: "Text Transform",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) as const;

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const getLinkType = (link: string) => {
  if (link.startsWith("tel:")) {
    return "PHONE";
  }

  if (link.startsWith("mailto:")) {
    return "EMAIL";
  }

  return "URL";
};

const WarmEditorialHeaderSectionFields: Fields<WarmEditorialHeaderSectionProps> =
  {
    logoLetter: createStyledTextFields("Logo Letter"),
    brandLink: {
      label: "Brand Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    navLinks: {
      label: "Navigation Links",
      type: "array",
      getItemSummary: (item: HeaderLinkItem) => item.label || "Link",
      defaultItemProps: {
        label: "New Link",
        link: "#",
        variant: "plain",
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        variant: {
          label: "Variant",
          type: "select",
          options: [
            { label: "Plain", value: "plain" },
            { label: "Solid", value: "solid" },
          ],
        },
      },
    },
  };

export const WarmEditorialHeaderSectionComponent: PuckComponent<
  WarmEditorialHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoLetter =
    resolveComponentData(props.logoLetter.text, locale, streamDocument) || "";

  return (
    <header className="w-full bg-[#fffaf3]">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[4px] bg-[#a55739]">
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: `${props.logoLetter.fontSize}px`,
                  color: props.logoLetter.fontColor,
                  fontWeight: props.logoLetter.fontWeight,
                  textTransform: toCssTextTransform(
                    props.logoLetter.textTransform,
                  ),
                  lineHeight: 1,
                }}
              >
                {resolvedLogoLetter}
              </span>
            </div>
            <Link
              cta={{
                link: props.brandLink.link,
                linkType: getLinkType(props.brandLink.link),
              }}
              className="no-underline"
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  color: "#2b211d",
                  fontWeight: 700,
                }}
              >
                {props.brandLink.label}
              </span>
            </Link>
          </div>
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.navLinks.map((item) => {
              const isSolid = item.variant === "solid";

              return (
                <Link
                  key={`${item.label}-${item.link}`}
                  cta={{
                    link: item.link,
                    linkType: getLinkType(item.link),
                  }}
                  className={[
                    "inline-flex min-h-[44px] items-center no-underline",
                    isSolid
                      ? "min-h-[46px] rounded-full border-2 border-[#a55739] bg-[#a55739] px-[18px] text-[#ffffff]"
                      : "text-[#2b211d]",
                  ].join(" ")}
                >
                  <span
                    style={{
                      fontFamily: '"Space Grotesk", Arial, sans-serif',
                      fontWeight: isSolid ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export const WarmEditorialHeaderSection: ComponentConfig<WarmEditorialHeaderSectionProps> =
  {
    label: "Warm Editorial Header Section",
    fields: WarmEditorialHeaderSectionFields,
    defaultProps: {
      logoLetter: createStyledTextDefault("N", 16, "#ffffff", 700),
      brandLink: {
        label: "North Common Bakehouse",
        link: "#",
      },
      navLinks: [
        { label: "Menu", link: "#", variant: "plain" },
        { label: "Preorders", link: "#", variant: "plain" },
        { label: "Hours", link: "#", variant: "plain" },
        { label: "Order online", link: "#", variant: "solid" },
      ],
    },
    render: WarmEditorialHeaderSectionComponent,
  };
