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

type HeaderLinkItem = {
  label: string;
  link: string;
  variant: "plain" | "solid";
};

export type FormalFinderHeaderSectionProps = {
  brandMark: StyledTextProps;
  homeLink: {
    label: string;
    link: string;
  };
  navLinks: HeaderLinkItem[];
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

const FormalFinderHeaderSectionFields: Fields<FormalFinderHeaderSectionProps> =
  {
    brandMark: createStyledTextField("Brand Mark"),
    homeLink: {
      label: "Home Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    navLinks: {
      label: "Navigation Links",
      type: "array",
      getItemSummary: (item) => item.label || "Navigation Link",
      defaultItemProps: {
        label: "Link",
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

export const FormalFinderHeaderSectionComponent: PuckComponent<
  FormalFinderHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const brandMarkText = resolveStyledText(
    props.brandMark,
    locale,
    streamDocument,
  );

  return (
    <header
      className="w-full border-b border-[#dde1e7] bg-white"
      style={{ fontFamily: SOURCE_SANS_STACK }}
    >
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-5">
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
                  fontFamily: SOURCE_SANS_STACK,
                }}
              >
                {brandMarkText}
              </span>
            </div>
            <Link
              cta={{ link: props.homeLink.link, linkType: "URL" }}
              className="inline-flex min-h-[44px] items-center text-base font-bold text-[#1a2230] no-underline"
            >
              {props.homeLink.label}
            </Link>
          </div>
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.navLinks.map((item, index) => {
              const isSolid = item.variant === "solid";
              return (
                <Link
                  key={`${item.label}-${index}`}
                  cta={{ link: item.link, linkType: "URL" }}
                  className={
                    isSolid
                      ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#27354a] bg-[#27354a] px-[18px] text-base font-bold text-white no-underline"
                      : "inline-flex min-h-[44px] items-center text-base font-normal text-[#1a2230] no-underline"
                  }
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

export const FormalFinderHeaderSection: ComponentConfig<FormalFinderHeaderSectionProps> =
  {
    label: "Formal Finder Header Section",
    fields: FormalFinderHeaderSectionFields,
    defaultProps: {
      brandMark: createStyledTextDefault("H", 16, "#ffffff", 700),
      homeLink: {
        label: "Harbor Ledger CPA",
        link: "#",
      },
      navLinks: [
        { label: "Services", link: "#", variant: "plain" },
        { label: "Industries", link: "#", variant: "plain" },
        { label: "Contact", link: "#", variant: "plain" },
        {
          label: "Schedule consultation",
          link: "#",
          variant: "solid",
        },
      ],
    },
    render: FormalFinderHeaderSectionComponent,
  };
