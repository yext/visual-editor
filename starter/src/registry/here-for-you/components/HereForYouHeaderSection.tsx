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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

type NavLinkProps = {
  label: string;
  link: string;
  isPrimary?: boolean;
};

export type HereForYouHeaderSectionProps = {
  brandLabel: StyledTextProps;
  brandLink: string;
  navLinks: NavLinkProps[];
};

const createStyledTextFields = (): Fields<StyledTextProps> => ({
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
});

const createStyledTextDefault = (
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

const HereForYouHeaderSectionFields: Fields<HereForYouHeaderSectionProps> = {
  brandLabel: {
    label: "Brand Label",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  brandLink: { label: "Brand Link", type: "text" },
  navLinks: {
    label: "Navigation Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      isPrimary: {
        label: "Is Primary",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
    defaultItemProps: {
      label: "Link",
      link: "#",
      isPrimary: false,
    },
    getItemSummary: (item) => item.label,
  },
};

export const HereForYouHeaderSectionComponent: PuckComponent<
  HereForYouHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const brandLabel =
    resolveComponentData(props.brandLabel.text, locale, streamDocument) || "";
  const brandInitial = brandLabel.trim().charAt(0).toUpperCase() || "H";

  return (
    <header className="w-full bg-white">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#2d8a87] text-base font-extrabold text-white">
              {brandInitial}
            </div>
            <Link
              cta={{ link: props.brandLink, linkType: "URL" }}
              className="no-underline"
            >
              <span
                style={{
                  fontFamily: '"Manrope", "Open Sans", sans-serif',
                  fontSize: `${props.brandLabel.fontSize}px`,
                  color: props.brandLabel.fontColor,
                  fontWeight: props.brandLabel.fontWeight,
                  textTransform: toCssTextTransform(
                    props.brandLabel.textTransform,
                  ),
                }}
              >
                {brandLabel}
              </span>
            </Link>
          </div>
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.navLinks.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{ link: item.link, linkType: "URL" }}
                className={
                  item.isPrimary
                    ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d8a87] bg-[#2d8a87] px-[18px] text-sm font-bold text-white no-underline"
                    : "inline-flex min-h-[44px] items-center text-[15px] font-medium text-[#203446] no-underline"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export const HereForYouHeaderSection: ComponentConfig<HereForYouHeaderSectionProps> =
  {
    label: "Here For You Header Section",
    fields: HereForYouHeaderSectionFields,
    defaultProps: {
      brandLabel: createStyledTextDefault(
        "Harbor Physical Therapy",
        16,
        "#203446",
        800,
      ),
      brandLink: "#",
      navLinks: [
        { label: "Conditions", link: "#", isPrimary: false },
        { label: "New patients", link: "#", isPrimary: false },
        { label: "Insurance", link: "#", isPrimary: false },
        { label: "Request evaluation", link: "#", isPrimary: true },
      ],
    },
    render: HereForYouHeaderSectionComponent,
  };
