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

type FooterLink = {
  label: string;
  link: string;
};

type SocialLink = {
  label: string;
  link: string;
  ariaLabel: string;
};

export type WelcomeInFooterSectionProps = {
  logoLetter: StyledTextProps;
  brandTitle: StyledTextProps;
  tagline: StyledTextProps;
  navigationLinks: FooterLink[];
  socialLinks: SocialLink[];
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

const createStyledTextField = (label: string): any => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select",
      options: textTransformOptions,
    },
  },
});

const defaultStyledText = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
) => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true" as const,
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

const WelcomeInFooterSectionFields: Fields<WelcomeInFooterSectionProps> = {
  logoLetter: createStyledTextField("Logo Letter"),
  brandTitle: createStyledTextField("Brand Title"),
  tagline: createStyledTextField("Tagline"),
  navigationLinks: {
    label: "Navigation Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Link",
      link: "#",
    },
    getItemSummary: (item: FooterLink) => item.label,
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
      ariaLabel: "Social profile",
    },
    getItemSummary: (item: SocialLink) => item.label,
  },
};

export const WelcomeInFooterSectionComponent: PuckComponent<
  WelcomeInFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoLetter =
    resolveComponentData(props.logoLetter.text, locale, streamDocument) || "";
  const resolvedBrandTitle =
    resolveComponentData(props.brandTitle.text, locale, streamDocument) || "";
  const resolvedTagline =
    resolveComponentData(props.tagline.text, locale, streamDocument) || "";

  return (
    <footer className="w-full bg-[#fffdfb] pt-16">
      <div className="w-full border-t border-[#d9dced]">
        <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pb-7 pt-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#db5d7d] text-[#fffdfb]">
              <span
                className="leading-none"
                style={{
                  fontFamily:
                    '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                  fontSize: `${props.logoLetter.fontSize}px`,
                  color: props.logoLetter.fontColor,
                  fontWeight: props.logoLetter.fontWeight,
                  textTransform: toCssTextTransform(
                    props.logoLetter.textTransform,
                  ),
                }}
              >
                {resolvedLogoLetter}
              </span>
            </div>
            <div className="grid gap-1">
              <strong
                style={{
                  fontFamily:
                    '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                  fontSize: `${props.brandTitle.fontSize}px`,
                  color: props.brandTitle.fontColor,
                  fontWeight: props.brandTitle.fontWeight,
                  textTransform: toCssTextTransform(
                    props.brandTitle.textTransform,
                  ),
                }}
              >
                {resolvedBrandTitle}
              </strong>
              <p
                className="m-0"
                style={{
                  fontFamily:
                    '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                  fontSize: `${props.tagline.fontSize}px`,
                  color: props.tagline.fontColor,
                  fontWeight: props.tagline.fontWeight,
                  textTransform: toCssTextTransform(
                    props.tagline.textTransform,
                  ),
                  lineHeight: 1.55,
                }}
              >
                {resolvedTagline}
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
                cta={{
                  link: item.link,
                  linkType: "URL",
                }}
                className="inline-flex min-h-[44px] items-center text-[16px] text-[#24324d] no-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div aria-label="Social media links" className="flex flex-wrap gap-3">
            {props.socialLinks.map((item) => (
              <Link
                key={`${item.label}-${item.ariaLabel}`}
                cta={{
                  link: item.link,
                  linkType: "URL",
                }}
                aria-label={item.ariaLabel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dced] text-[16px] text-[#db5d7d] no-underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export const WelcomeInFooterSection: ComponentConfig<WelcomeInFooterSectionProps> =
  {
    label: "Welcome In Footer Section",
    fields: WelcomeInFooterSectionFields,
    defaultProps: {
      logoLetter: defaultStyledText("J", 20, "#fffdfb", 800),
      brandTitle: defaultStyledText("Juniper Story House", 16, "#24324d", 700),
      tagline: defaultStyledText(
        "Ann Arbor children's bookshop",
        16,
        "#647089",
        400,
      ),
      navigationLinks: [
        {
          label: "Books by age",
          link: "#",
        },
        {
          label: "Events",
          link: "#",
        },
        {
          label: "Contact",
          link: "#",
        },
      ],
      socialLinks: [
        {
          label: "ig",
          link: "#",
          ariaLabel: "Juniper Story House on Instagram",
        },
        {
          label: "f",
          link: "#",
          ariaLabel: "Juniper Story House on Facebook",
        },
        {
          label: "tt",
          link: "#",
          ariaLabel: "Juniper Story House on TikTok",
        },
      ],
    },
    render: WelcomeInFooterSectionComponent,
  };
