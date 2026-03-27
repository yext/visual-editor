import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

const SOURCE_SANS_STACK = "'Source Sans 3', 'Open Sans', sans-serif";

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
  ariaLabel?: string;
};

export type FormalFinderFooterSectionProps = {
  brandMark: StyledTextProps;
  brandTitle: StyledTextProps;
  brandSubtitle: StyledTextProps;
  navLinks: FooterLinkItem[];
  socialLinks: FooterLinkItem[];
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

function createStyledTextField(label: string) {
  return {
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
  };
}

function createStyledTextDefault(
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps {
  return {
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
  };
}

function resolveStyledText(
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) {
  return resolveComponentData(value.text, locale, streamDocument) || "";
}

function toCssTextTransform(value: StyledTextProps["textTransform"]) {
  return value === "normal" ? undefined : value;
}

const FormalFinderFooterSectionFields: Fields<FormalFinderFooterSectionProps> =
  {
    brandMark: createStyledTextField("Brand Mark"),
    brandTitle: createStyledTextField("Brand Title"),
    brandSubtitle: createStyledTextField("Brand Subtitle"),
    navLinks: {
      label: "Navigation Links",
      type: "array",
      getItemSummary: (item) => item.label || "Navigation Link",
      defaultItemProps: {
        label: "Link",
        link: "#",
        ariaLabel: "",
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        ariaLabel: { label: "Aria Label", type: "text" },
      },
    },
    socialLinks: {
      label: "Social Links",
      type: "array",
      getItemSummary: (item) => item.label || "Social Link",
      defaultItemProps: {
        label: "in",
        link: "#",
        ariaLabel: "Social media link",
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        ariaLabel: { label: "Aria Label", type: "text" },
      },
    },
  };

export const FormalFinderFooterSectionComponent: PuckComponent<
  FormalFinderFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const brandMarkText = resolveStyledText(
    props.brandMark,
    locale,
    streamDocument,
  );
  const brandTitle = resolveStyledText(
    props.brandTitle,
    locale,
    streamDocument,
  );
  const brandSubtitle = resolveStyledText(
    props.brandSubtitle,
    locale,
    streamDocument,
  );

  return (
    <footer
      className="mt-16 w-full border-t border-[#dde1e7] bg-white"
      style={{ fontFamily: SOURCE_SANS_STACK }}
    >
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pt-6 pb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#27354a] text-white">
            <span
              className="leading-none"
              style={{
                fontSize: `${props.brandMark.fontSize}px`,
                color: props.brandMark.fontColor,
                fontWeight: props.brandMark.fontWeight,
                textTransform: toCssTextTransform(
                  props.brandMark.textTransform,
                ),
              }}
            >
              {brandMarkText}
            </span>
          </div>
          <div>
            <p
              className="m-0"
              style={{
                fontSize: `${props.brandTitle.fontSize}px`,
                lineHeight: 1.55,
                color: props.brandTitle.fontColor,
                fontWeight: props.brandTitle.fontWeight,
                textTransform: toCssTextTransform(
                  props.brandTitle.textTransform,
                ),
              }}
            >
              {brandTitle}
            </p>
            <p
              className="m-0"
              style={{
                fontSize: `${props.brandSubtitle.fontSize}px`,
                lineHeight: 1.55,
                color: props.brandSubtitle.fontColor,
                fontWeight: props.brandSubtitle.fontWeight,
                textTransform: toCssTextTransform(
                  props.brandSubtitle.textTransform,
                ),
              }}
            >
              {brandSubtitle}
            </p>
          </div>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.navLinks.map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              cta={{ link: item.link, linkType: "URL" }}
              className="inline-flex min-h-[44px] items-center text-base font-normal text-[#27354a] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div
          aria-label="Social media links"
          className="flex flex-wrap items-center gap-3"
        >
          {props.socialLinks.map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              cta={{ link: item.link, linkType: "URL" }}
              aria-label={item.ariaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dde1e7] text-base font-normal text-[#27354a] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const FormalFinderFooterSection: ComponentConfig<FormalFinderFooterSectionProps> =
  {
    label: "Formal Finder Footer Section",
    fields: FormalFinderFooterSectionFields,
    defaultProps: {
      brandMark: createStyledTextDefault("H", 16, "#ffffff", 700),
      brandTitle: createStyledTextDefault(
        "Harbor Ledger CPA",
        16,
        "#1a2230",
        700,
      ),
      brandSubtitle: createStyledTextDefault(
        "Hartford accounting office",
        16,
        "#6a7381",
        400,
      ),
      navLinks: [
        { label: "Services", link: "#", ariaLabel: "" },
        { label: "Industries", link: "#", ariaLabel: "" },
        { label: "Contact", link: "#", ariaLabel: "" },
      ],
      socialLinks: [
        {
          label: "in",
          link: "#",
          ariaLabel: "Harbor Ledger CPA on LinkedIn",
        },
        {
          label: "f",
          link: "#",
          ariaLabel: "Harbor Ledger CPA on Facebook",
        },
        {
          label: "x",
          link: "#",
          ariaLabel: "Harbor Ledger CPA on X",
        },
      ],
    },
    render: FormalFinderFooterSectionComponent,
  };
