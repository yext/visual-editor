import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
import { Link } from "@yext/pages-components";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

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

export type WellnessRetreatFooterSectionProps = {
  brandName: StyledTextProps;
  descriptor: StyledTextProps;
  navigationLinks: LinkItem[];
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

const resolveTextValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(field, locale, streamDocument) || "";

const getTextStyle = (text: StyledTextProps): CSSProperties => ({
  fontSize: `${text.fontSize}px`,
  color: text.fontColor,
  fontWeight: text.fontWeight,
  textTransform: text.textTransform === "normal" ? "none" : text.textTransform,
});

const WellnessRetreatFooterSectionFields: Fields<WellnessRetreatFooterSectionProps> =
  {
    brandName: createStyledTextField("Brand Name"),
    descriptor: createStyledTextField("Descriptor"),
    navigationLinks: {
      label: "Navigation Links",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
      defaultItemProps: {
        label: "Footer Link",
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
        label: "ig",
        link: "#",
        ariaLabel: "Social link",
      },
      getItemSummary: (item) => item.label || "Social Link",
    },
  };

export const WellnessRetreatFooterSectionComponent: PuckComponent<
  WellnessRetreatFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBrandName = resolveTextValue(
    props.brandName.text,
    locale,
    streamDocument,
  );
  const resolvedDescriptor = resolveTextValue(
    props.descriptor.text,
    locale,
    streamDocument,
  );
  const logoLetter = resolvedBrandName.trim().charAt(0).toUpperCase() || "S";

  return (
    <footer className="w-full border-t border-[#d9dde1] bg-white pt-16">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pb-7 pt-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex size-[38px] items-center justify-center border border-[#101418] text-sm font-bold text-[#101418]">
            {logoLetter}
          </div>
          <div>
            <p
              className="m-0 font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.brandName)}
            >
              {resolvedBrandName}
            </p>
            <p
              className="m-0 font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.descriptor)}
            >
              {resolvedDescriptor}
            </p>
          </div>
        </div>
        <nav
          aria-label="Footer navigation"
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
        </nav>
        <div aria-label="Social media links" className="flex flex-wrap gap-3">
          {props.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              cta={{ link: item.link, linkType: "URL" }}
              aria-label={item.ariaLabel}
              className="inline-flex size-10 items-center justify-center border border-[#d9dde1] font-['Inter',sans-serif] text-sm font-normal text-[#101418] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const WellnessRetreatFooterSection: ComponentConfig<WellnessRetreatFooterSectionProps> =
  {
    label: "Wellness Retreat Footer Section",
    fields: WellnessRetreatFooterSectionFields,
    defaultProps: {
      brandName: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Stillpoint Wellness Studio",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#101418",
        fontWeight: 700,
        textTransform: "normal",
      },
      descriptor: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Seattle yoga and recovery studio",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5f666d",
        fontWeight: 400,
        textTransform: "normal",
      },
      navigationLinks: [
        { label: "Classes", link: "#" },
        { label: "Memberships", link: "#" },
        { label: "Contact", link: "#" },
      ],
      socialLinks: [
        {
          label: "ig",
          link: "#",
          ariaLabel: "Stillpoint Wellness Studio on Instagram",
        },
        {
          label: "tt",
          link: "#",
          ariaLabel: "Stillpoint Wellness Studio on TikTok",
        },
        {
          label: "yt",
          link: "#",
          ariaLabel: "Stillpoint Wellness Studio on YouTube",
        },
      ],
    },
    render: WellnessRetreatFooterSectionComponent,
  };
