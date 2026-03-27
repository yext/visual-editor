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

type LinkItemProps = {
  label: string;
  link: string;
};

type SocialLinkProps = {
  iconText: string;
  link: string;
  ariaLabel: string;
};

export type HereForYouFooterSectionProps = {
  brandLabel: StyledTextProps;
  descriptor: StyledTextProps;
  navLinks: LinkItemProps[];
  socialLinks: SocialLinkProps[];
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

const HereForYouFooterSectionFields: Fields<HereForYouFooterSectionProps> = {
  brandLabel: {
    label: "Brand Label",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  descriptor: {
    label: "Descriptor",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  navLinks: {
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
    getItemSummary: (item) => item.label,
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      iconText: { label: "Icon Text", type: "text" },
      link: { label: "Link", type: "text" },
      ariaLabel: { label: "Aria Label", type: "text" },
    },
    defaultItemProps: {
      iconText: "f",
      link: "#",
      ariaLabel: "Social link",
    },
    getItemSummary: (item) => item.ariaLabel,
  },
};

export const HereForYouFooterSectionComponent: PuckComponent<
  HereForYouFooterSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const brandLabel =
    resolveComponentData(props.brandLabel.text, locale, streamDocument) || "";
  const descriptor =
    resolveComponentData(props.descriptor.text, locale, streamDocument) || "";
  const brandInitial = brandLabel.trim().charAt(0).toUpperCase() || "H";

  return (
    <footer className="mt-16 w-full border-t border-[#d7e7e6] bg-white">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pt-6 pb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#2d8a87] text-base font-extrabold text-white">
            {brandInitial}
          </div>
          <div className="grid gap-1">
            <strong
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
            </strong>
            <p
              style={{
                fontFamily: '"Manrope", "Open Sans", sans-serif',
                fontSize: `${props.descriptor.fontSize}px`,
                color: props.descriptor.fontColor,
                fontWeight: props.descriptor.fontWeight,
                textTransform: toCssTextTransform(
                  props.descriptor.textTransform,
                ),
                lineHeight: 1.55,
              }}
              className="m-0"
            >
              {descriptor}
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
              className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-[#203446] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div
          aria-label="Social media links"
          className="flex flex-wrap items-center gap-3"
        >
          {props.socialLinks.map((item) => (
            <Link
              key={`${item.ariaLabel}-${item.link}`}
              cta={{ link: item.link, linkType: "URL" }}
              aria-label={item.ariaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e7e6] text-sm font-semibold text-[#2d8a87] no-underline"
            >
              {item.iconText}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const HereForYouFooterSection: ComponentConfig<HereForYouFooterSectionProps> =
  {
    label: "Here For You Footer Section",
    fields: HereForYouFooterSectionFields,
    defaultProps: {
      brandLabel: createStyledTextDefault(
        "Harbor Physical Therapy",
        16,
        "#203446",
        700,
      ),
      descriptor: createStyledTextDefault(
        "Providence physical therapy clinic",
        16,
        "#667685",
        400,
      ),
      navLinks: [
        { label: "Conditions", link: "#" },
        { label: "New patients", link: "#" },
        { label: "Contact", link: "#" },
      ],
      socialLinks: [
        {
          iconText: "f",
          link: "#",
          ariaLabel: "Harbor Physical Therapy on Facebook",
        },
        {
          iconText: "ig",
          link: "#",
          ariaLabel: "Harbor Physical Therapy on Instagram",
        },
        {
          iconText: "in",
          link: "#",
          ariaLabel: "Harbor Physical Therapy on LinkedIn",
        },
      ],
    },
    render: HereForYouFooterSectionComponent,
  };
