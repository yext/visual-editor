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

type NavigationLink = {
  label: string;
  link: string;
  variant: "text" | "solid";
};

export type WelcomeInHeaderSectionProps = {
  logoLetter: StyledTextProps;
  brandLink: {
    label: string;
    link: string;
  };
  navigationLinks: NavigationLink[];
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

const WelcomeInHeaderSectionFields: Fields<WelcomeInHeaderSectionProps> = {
  logoLetter: createStyledTextField("Logo Letter"),
  brandLink: {
    label: "Brand Link",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  navigationLinks: {
    label: "Navigation Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      variant: {
        label: "Variant",
        type: "select",
        options: [
          { label: "Text", value: "text" },
          { label: "Solid", value: "solid" },
        ],
      },
    },
    defaultItemProps: {
      label: "Link",
      link: "#",
      variant: "text",
    },
    getItemSummary: (item: NavigationLink) => item.label,
  },
};

export const WelcomeInHeaderSectionComponent: PuckComponent<
  WelcomeInHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoLetter =
    resolveComponentData(props.logoLetter.text, locale, streamDocument) || "";

  return (
    <header className="w-full border-b border-[#d9dced] bg-[#fffdfb]">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 py-[22px]">
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
          <Link
            cta={{
              link: props.brandLink.link,
              linkType: "URL",
            }}
            className="text-[16px] font-[800] text-[#24324d] no-underline"
          >
            {props.brandLink.label}
          </Link>
        </div>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {props.navigationLinks.map((item) => {
            const isSolid = item.variant === "solid";

            return (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{
                  link: item.link,
                  linkType: "URL",
                }}
                className={[
                  "inline-flex min-h-[44px] items-center no-underline",
                  isSolid
                    ? "min-h-[46px] rounded-full border-2 border-[#db5d7d] bg-[#db5d7d] px-[18px] font-[700] text-[#fffdfb]"
                    : "text-[16px] text-[#24324d]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export const WelcomeInHeaderSection: ComponentConfig<WelcomeInHeaderSectionProps> =
  {
    label: "Welcome In Header Section",
    fields: WelcomeInHeaderSectionFields,
    defaultProps: {
      logoLetter: defaultStyledText("J", 20, "#fffdfb", 800),
      brandLink: {
        label: "Juniper Story House",
        link: "#",
      },
      navigationLinks: [
        {
          label: "Books by age",
          link: "#",
          variant: "text",
        },
        {
          label: "Events",
          link: "#",
          variant: "text",
        },
        {
          label: "Gift cards",
          link: "#",
          variant: "text",
        },
        {
          label: "Visit shop",
          link: "#",
          variant: "solid",
        },
      ],
    },
    render: WelcomeInHeaderSectionComponent,
  };
