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

type FooterLinkItem = {
  label: string;
  link: string;
};

type SocialLinkItem = {
  label: string;
  link: string;
  icon: "instagram" | "facebook";
};

export type WarmEditorialFooterSectionProps = {
  logoLetter: StyledTextProps;
  brandName: StyledTextProps;
  location: StyledTextProps;
  navLinks: FooterLinkItem[];
  socialLinks: SocialLinkItem[];
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
  textTransform: "normal",
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

const renderSocialIcon = (icon: SocialLinkItem["icon"]) => {
  if (icon === "facebook") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.3 0-1.2-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H7.8v3h2.7v8h3z" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
};

const WarmEditorialFooterSectionFields: Fields<WarmEditorialFooterSectionProps> =
  {
    logoLetter: createStyledTextFields("Logo Letter"),
    brandName: createStyledTextFields("Brand Name"),
    location: createStyledTextFields("Location"),
    navLinks: {
      label: "Navigation Links",
      type: "array",
      getItemSummary: (item: FooterLinkItem) => item.label || "Link",
      defaultItemProps: {
        label: "Footer Link",
        link: "#",
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    socialLinks: {
      label: "Social Links",
      type: "array",
      getItemSummary: (item: SocialLinkItem) => item.label || "Social Link",
      defaultItemProps: {
        label: "Instagram",
        link: "#",
        icon: "instagram",
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        icon: {
          label: "Icon",
          type: "select",
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
          ],
        },
      },
    },
  };

export const WarmEditorialFooterSectionComponent: PuckComponent<
  WarmEditorialFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoLetter =
    resolveComponentData(props.logoLetter.text, locale, streamDocument) || "";
  const resolvedBrandName =
    resolveComponentData(props.brandName.text, locale, streamDocument) || "";
  const resolvedLocation =
    resolveComponentData(props.location.text, locale, streamDocument) || "";

  return (
    <footer className="w-full border-t border-[#eadbcb] bg-[#fffaf3]">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pb-7 pt-6">
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
          <div>
            <p
              className="m-0"
              style={{
                fontFamily: '"Space Grotesk", Arial, sans-serif',
                fontSize: `${props.brandName.fontSize}px`,
                color: props.brandName.fontColor,
                fontWeight: props.brandName.fontWeight,
                textTransform: toCssTextTransform(
                  props.brandName.textTransform,
                ),
                lineHeight: 1.5,
              }}
            >
              {resolvedBrandName}
            </p>
            <p
              className="m-0"
              style={{
                fontFamily: '"Space Grotesk", Arial, sans-serif',
                fontSize: `${props.location.fontSize}px`,
                color: props.location.fontColor,
                fontWeight: props.location.fontWeight,
                textTransform: toCssTextTransform(props.location.textTransform),
                lineHeight: 1.5,
              }}
            >
              {resolvedLocation}
            </p>
          </div>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.navLinks.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              cta={{
                link: item.link,
                linkType: getLinkType(item.link),
              }}
              className="inline-flex items-center text-[#2b211d] no-underline"
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3" aria-label="Social media links">
          {props.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.icon}`}
              cta={{
                link: item.link,
                linkType: getLinkType(item.link),
              }}
              aria-label={item.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadbcb] text-[#a55739] no-underline"
            >
              {renderSocialIcon(item.icon)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const WarmEditorialFooterSection: ComponentConfig<WarmEditorialFooterSectionProps> =
  {
    label: "Warm Editorial Footer Section",
    fields: WarmEditorialFooterSectionFields,
    defaultProps: {
      logoLetter: createStyledTextDefault("N", 16, "#ffffff", 700),
      brandName: createStyledTextDefault(
        "North Common Bakehouse",
        16,
        "#2b211d",
        700,
      ),
      location: createStyledTextDefault("Burlington, VT", 16, "#726156", 500),
      navLinks: [
        { label: "Menu", link: "#" },
        { label: "Preorders", link: "#" },
        { label: "Contact", link: "#" },
      ],
      socialLinks: [
        { label: "Instagram", link: "#", icon: "instagram" },
        { label: "Facebook", link: "#", icon: "facebook" },
      ],
    },
    render: WarmEditorialFooterSectionComponent,
  };
