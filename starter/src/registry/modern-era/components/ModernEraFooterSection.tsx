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

type NavLinkItem = {
  label: string;
  link: string;
};

type SocialLinkItem = NavLinkItem & {
  ariaLabel: string;
};

export type ModernEraFooterSectionProps = {
  brandName: StyledTextProps;
  tagline: StyledTextProps;
  navLinks: NavLinkItem[];
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
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const styledTextDefault = (
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

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const ModernEraFooterSectionFields: Fields<ModernEraFooterSectionProps> = {
  brandName: styledTextFields("Brand Name"),
  tagline: styledTextFields("Tagline"),
  navLinks: {
    label: "Navigation Links",
    type: "array",
    getItemSummary: (item) => item.label || "Footer Link",
    defaultItemProps: { label: "Link", link: "#" },
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    getItemSummary: (item) => item.label || "Social Link",
    defaultItemProps: { label: "in", link: "#", ariaLabel: "Social link" },
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      ariaLabel: { label: "Aria Label", type: "text" },
    },
  },
};

export const ModernEraFooterSectionComponent: PuckComponent<
  ModernEraFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const brandName = resolveText(props.brandName, locale, streamDocument);
  const tagline = resolveText(props.tagline, locale, streamDocument);
  const logoLetter = (brandName.trim()[0] || "B").toUpperCase();

  return (
    <footer className="mt-[72px] w-full border-t border-[#d7e2ec] bg-white">
      <div
        className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-6 px-6 py-6"
        style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#19324d] font-extrabold text-white">
            {logoLetter}
          </div>
          <div>
            <p
              className="m-0"
              style={{
                fontSize: `${props.brandName.fontSize}px`,
                color: props.brandName.fontColor,
                fontWeight: props.brandName.fontWeight,
                textTransform: cssTextTransform(props.brandName.textTransform),
              }}
            >
              {brandName}
            </p>
            <p
              className="m-0"
              style={{
                fontSize: `${props.tagline.fontSize}px`,
                color: props.tagline.fontColor,
                fontWeight: props.tagline.fontWeight,
                textTransform: cssTextTransform(props.tagline.textTransform),
              }}
            >
              {tagline}
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
              cta={{ link: item.link, linkType: "URL" }}
              className="inline-flex min-h-[44px] items-center text-[#1b2430] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3" aria-label="Social media links">
          {props.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.ariaLabel}`}
              cta={{ link: item.link, linkType: "URL" }}
              aria-label={item.ariaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e2ec] text-[#19324d] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const ModernEraFooterSection: ComponentConfig<ModernEraFooterSectionProps> =
  {
    label: "Modern Era Footer Section",
    fields: ModernEraFooterSectionFields,
    defaultProps: {
      brandName: styledTextDefault("Bluehaven Bank", 16, "#1b2430", 800),
      tagline: styledTextDefault(
        "Portland retirement planning branch",
        16,
        "#1b2430",
        400,
      ),
      navLinks: [
        { label: "Retirement", link: "#" },
        { label: "Locations", link: "#" },
        { label: "Contact", link: "#" },
      ],
      socialLinks: [
        { label: "in", link: "#", ariaLabel: "Bluehaven on LinkedIn" },
        { label: "f", link: "#", ariaLabel: "Bluehaven on Facebook" },
        { label: "ig", link: "#", ariaLabel: "Bluehaven on Instagram" },
      ],
    },
    render: ModernEraFooterSectionComponent,
  };
