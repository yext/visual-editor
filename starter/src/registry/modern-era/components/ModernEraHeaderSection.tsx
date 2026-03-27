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

type PrimaryNavLinkItem = NavLinkItem & {
  isButton: boolean;
  isSolid: boolean;
};

export type ModernEraHeaderSectionProps = {
  utilityMessage: StyledTextProps;
  brandName: StyledTextProps;
  utilityLinks: NavLinkItem[];
  primaryLinks: PrimaryNavLinkItem[];
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

const ModernEraHeaderSectionFields: Fields<ModernEraHeaderSectionProps> = {
  utilityMessage: styledTextFields("Utility Message"),
  brandName: styledTextFields("Brand Name"),
  utilityLinks: {
    label: "Utility Links",
    type: "array",
    getItemSummary: (item) => item.label || "Utility Link",
    defaultItemProps: {
      label: "Link",
      link: "#",
    },
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  primaryLinks: {
    label: "Primary Links",
    type: "array",
    getItemSummary: (item) => item.label || "Primary Link",
    defaultItemProps: {
      label: "Link",
      link: "#",
      isButton: false,
      isSolid: false,
    },
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      isButton: {
        label: "Is Button",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      isSolid: {
        label: "Is Solid",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
};

export const ModernEraHeaderSectionComponent: PuckComponent<
  ModernEraHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const brandName = resolveText(props.brandName, locale, streamDocument);
  const utilityMessage = resolveText(
    props.utilityMessage,
    locale,
    streamDocument,
  );
  const logoLetter = (brandName.trim()[0] || "B").toUpperCase();

  return (
    <header className="w-full border-b border-[#d7e2ec] bg-white">
      <div className="mx-auto w-full max-w-[1120px] px-6">
        <div
          className="flex flex-wrap items-center justify-between gap-6 py-[10px]"
          style={{
            fontFamily: '"Manrope", "Open Sans", sans-serif',
            fontSize: "0.92rem",
            color: "#5d6b7b",
          }}
        >
          <nav
            aria-label="Utility navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.utilityLinks.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{ link: item.link, linkType: "URL" }}
                className="inline-flex min-h-[44px] items-center text-[#1b2430] no-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="m-0">{utilityMessage}</p>
        </div>
        <div
          className="flex flex-wrap items-center justify-between gap-6 py-5"
          style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#19324d] font-extrabold text-white">
              {logoLetter}
            </div>
            <p
              className="m-0 text-[#1b2430]"
              style={{
                fontSize: `${props.brandName.fontSize}px`,
                color: props.brandName.fontColor,
                fontWeight: props.brandName.fontWeight,
                textTransform: cssTextTransform(props.brandName.textTransform),
              }}
            >
              {brandName}
            </p>
          </div>
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.primaryLinks.map((item) => {
              const className = item.isButton
                ? `inline-flex min-h-[46px] items-center justify-center rounded-full border-2 px-[18px] font-bold no-underline ${
                    item.isSolid
                      ? "border-[#2a6cb0] bg-[#2a6cb0] text-white"
                      : "border-[#2a6cb0] bg-transparent text-[#2a6cb0]"
                  }`
                : "inline-flex min-h-[44px] items-center text-[#1b2430] no-underline";

              return (
                <Link
                  key={`${item.label}-${item.link}`}
                  cta={{ link: item.link, linkType: "URL" }}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export const ModernEraHeaderSection: ComponentConfig<ModernEraHeaderSectionProps> =
  {
    label: "Modern Era Header Section",
    fields: ModernEraHeaderSectionFields,
    defaultProps: {
      utilityMessage: styledTextDefault(
        "Retirement planning appointments available this week",
        15,
        "#5d6b7b",
        400,
      ),
      brandName: styledTextDefault("Bluehaven Bank", 16, "#1b2430", 800),
      utilityLinks: [
        { label: "Client support", link: "#" },
        { label: "Workshops", link: "#" },
      ],
      primaryLinks: [
        { label: "Retirement", link: "#", isButton: false, isSolid: false },
        { label: "Advisors", link: "#", isButton: false, isSolid: false },
        { label: "Locations", link: "#", isButton: false, isSolid: false },
        { label: "FAQs", link: "#", isButton: false, isSolid: false },
        { label: "Book a consult", link: "#", isButton: true, isSolid: false },
      ],
    },
    render: ModernEraHeaderSectionComponent,
  };
