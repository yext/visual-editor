import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LinkItem = {
  label: string;
  link: string;
};

type SocialLinkItem = LinkItem & {
  ariaLabel: string;
};

export type CoolRunningFooterSectionProps = {
  logoMark: StyledTextProps;
  brandName: StyledTextProps;
  tagline: StyledTextProps;
  footerLinks: LinkItem[];
  socialLinks: SocialLinkItem[];
};

const fontWeightOptions = [
  { label: "Thin", value: 100 },
  { label: "Extra Light", value: 200 },
  { label: "Light", value: 300 },
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semi Bold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Extra Bold", value: 800 },
  { label: "Black", value: 900 },
];

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const createStyledTextField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: {
        types: ["type.string"],
      },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: textTransformOptions,
    },
  },
});

const CoolRunningFooterSectionFields: Fields<CoolRunningFooterSectionProps> = {
  logoMark: createStyledTextField("Logo Mark"),
  brandName: createStyledTextField("Brand Name"),
  tagline: createStyledTextField("Tagline"),
  footerLinks: {
    label: "Footer Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Services",
      link: "#",
    },
    getItemSummary: (item) => item.label || "Footer Link",
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      ariaLabel: { label: "Aria Label", type: "text" },
    },
    defaultItemProps: {
      label: "f",
      link: "#",
      ariaLabel: "CityPoint on Facebook",
    },
    getItemSummary: (item) => item.ariaLabel || item.label || "Social Link",
  },
};

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const copyStyle = (value: StyledTextProps) => ({
  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
  fontSize: `${value.fontSize}px`,
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
});

export const CoolRunningFooterSectionComponent: PuckComponent<
  CoolRunningFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const logoMark = resolveText(props.logoMark, locale, streamDocument);
  const brandName = resolveText(props.brandName, locale, streamDocument);
  const tagline = resolveText(props.tagline, locale, streamDocument);

  return (
    <footer className="mt-16 w-full border-t border-[#dbe2ea] bg-white pt-6">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pb-7 pt-6">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#0e446d]"
            style={{
              ...copyStyle(props.logoMark),
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            {logoMark}
          </div>
          <div>
            <p className="m-0" style={copyStyle(props.brandName)}>
              {brandName}
            </p>
            <p className="m-0" style={copyStyle(props.tagline)}>
              {tagline}
            </p>
          </div>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.footerLinks.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              className="inline-flex min-h-[44px] items-center text-[14px] leading-[1.5] text-[#14202c] no-underline"
              cta={{
                link: item.link,
                linkType: "URL",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3" aria-label="Social media links">
          {props.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.ariaLabel}`}
              aria-label={item.ariaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe2ea] text-[14px] font-medium leading-none text-[#0e446d] no-underline"
              cta={{
                link: item.link,
                linkType: "URL",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const CoolRunningFooterSection: ComponentConfig<CoolRunningFooterSectionProps> =
  {
    label: "Cool Running Footer Section",
    fields: CoolRunningFooterSectionFields,
    defaultProps: {
      logoMark: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "C",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      brandName: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "CityPoint ATM",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#14202c",
        fontWeight: 700,
        textTransform: "normal",
      },
      tagline: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Charlotte cash access location",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5e6d7b",
        fontWeight: 400,
        textTransform: "normal",
      },
      footerLinks: [
        {
          label: "Services",
          link: "#",
        },
        {
          label: "Accessibility",
          link: "#",
        },
        {
          label: "Support",
          link: "#",
        },
      ],
      socialLinks: [
        {
          label: "f",
          link: "#",
          ariaLabel: "CityPoint on Facebook",
        },
        {
          label: "in",
          link: "#",
          ariaLabel: "CityPoint on LinkedIn",
        },
        {
          label: "x",
          link: "#",
          ariaLabel: "CityPoint on X",
        },
      ],
    },
    render: CoolRunningFooterSectionComponent,
  };
