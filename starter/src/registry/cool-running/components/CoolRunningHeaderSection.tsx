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

type HeaderLinkItem = LinkItem & {
  isButton: boolean;
  isSolid: boolean;
};

export type CoolRunningHeaderSectionProps = {
  logoMark: StyledTextProps;
  brandLink: LinkItem;
  utilityMessage: StyledTextProps;
  utilityLinks: LinkItem[];
  primaryLinks: HeaderLinkItem[];
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

const CoolRunningHeaderSectionFields: Fields<CoolRunningHeaderSectionProps> = {
  logoMark: createStyledTextField("Logo Mark"),
  brandLink: {
    label: "Brand Link",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  utilityMessage: createStyledTextField("Utility Message"),
  utilityLinks: {
    label: "Utility Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Support",
      link: "#",
    },
    getItemSummary: (item) => item.label || "Utility Link",
  },
  primaryLinks: {
    label: "Primary Links",
    type: "array",
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
    defaultItemProps: {
      label: "Services",
      link: "#",
      isButton: false,
      isSolid: false,
    },
    getItemSummary: (item) => item.label || "Primary Link",
  },
};

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const textStyle = (value: StyledTextProps) => ({
  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
  fontSize: `${value.fontSize}px`,
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
});

const renderLink = (item: LinkItem, className: string) => (
  <Link
    className={className}
    cta={{
      link: item.link,
      linkType: "URL",
    }}
  >
    {item.label}
  </Link>
);

export const CoolRunningHeaderSectionComponent: PuckComponent<
  CoolRunningHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoMark = resolveText(props.logoMark, locale, streamDocument);
  const resolvedUtilityMessage = resolveText(
    props.utilityMessage,
    locale,
    streamDocument,
  );

  return (
    <header
      className="relative mb-6 w-full border-b border-[#dbe2ea] bg-white"
      style={{
        color: "#14202c",
        fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
      }}
    >
      <a
        href="#main-content"
        className="absolute left-4 top-4 -translate-y-[180%] rounded-full bg-[#14202c] px-[14px] py-[10px] text-white no-underline transition-transform focus-visible:translate-y-0"
      >
        Skip to main content
      </a>
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-[10px]">
          <nav
            aria-label="Utility navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.utilityLinks.map((item) => (
              <div key={`${item.label}-${item.link}`}>
                {renderLink(
                  item,
                  "inline-flex min-h-[44px] items-center text-[14.72px] text-[#5e6d7b] no-underline",
                )}
              </div>
            ))}
          </nav>
          <div className="m-0" style={textStyle(props.utilityMessage)}>
            {resolvedUtilityMessage}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 py-[18px]">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#0e446d]"
              style={{
                ...textStyle(props.logoMark),
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              {resolvedLogoMark}
            </div>
            <Link
              className="inline-flex min-h-[44px] items-center no-underline"
              cta={{
                link: props.brandLink.link,
                linkType: "URL",
              }}
            >
              <span
                style={{
                  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
                  fontSize: "16px",
                  color: "#14202c",
                  fontWeight: 700,
                  lineHeight: 1.5,
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
            {props.primaryLinks.map((item) => {
              const linkClasses = item.isButton
                ? [
                    "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 px-[18px] font-bold no-underline",
                    item.isSolid
                      ? "border-[#1677c9] bg-[#1677c9] text-white"
                      : "border-[#1677c9] bg-transparent text-[#1677c9]",
                  ].join(" ")
                : "inline-flex min-h-[44px] items-center text-[#14202c] no-underline";

              return (
                <div key={`${item.label}-${item.link}`}>
                  {renderLink(item, linkClasses)}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export const CoolRunningHeaderSection: ComponentConfig<CoolRunningHeaderSectionProps> =
  {
    label: "Cool Running Header Section",
    fields: CoolRunningHeaderSectionFields,
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
      brandLink: {
        label: "CityPoint ATM",
        link: "#",
      },
      utilityMessage: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Drive-up ATM with 24/7 access",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 15,
        fontColor: "#5e6d7b",
        fontWeight: 400,
        textTransform: "normal",
      },
      utilityLinks: [
        {
          label: "Nearby branches",
          link: "#",
        },
        {
          label: "Support",
          link: "#",
        },
      ],
      primaryLinks: [
        {
          label: "Services",
          link: "#",
          isButton: false,
          isSolid: false,
        },
        {
          label: "Accessibility",
          link: "#",
          isButton: false,
          isSolid: false,
        },
        {
          label: "Nearby ATMs",
          link: "#",
          isButton: false,
          isSolid: false,
        },
        {
          label: "Get directions",
          link: "#",
          isButton: true,
          isSolid: false,
        },
      ],
    },
    render: CoolRunningHeaderSectionComponent,
  };
