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

export type NaturallyGroundedFooterSectionProps = {
  brandTitle: StyledTextProps;
  descriptor: StyledTextProps;
  navigationLinks: FooterLink[];
  socialLinks: FooterLink[];
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

const styledTextObjectFields = {
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
} satisfies Fields<StyledTextProps>;

const createTextDefault = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const getTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

export const NaturallyGroundedFooterSectionComponent: PuckComponent<
  NaturallyGroundedFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBrandTitle =
    resolveComponentData(props.brandTitle.text, locale, streamDocument) || "";
  const resolvedDescriptor =
    resolveComponentData(props.descriptor.text, locale, streamDocument) || "";

  return (
    <footer className="mt-[72px] w-full border-t border-[#d8e2d8] bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-6 px-6 py-6 font-['Work_Sans','Open_Sans',sans-serif]">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#1d4b33] text-base font-extrabold text-white"
          >
            F
          </div>
          <div className="grid gap-0">
            <strong
              style={{
                color: props.brandTitle.fontColor,
                fontSize: `${props.brandTitle.fontSize}px`,
                fontWeight: props.brandTitle.fontWeight,
                textTransform: getTextTransform(props.brandTitle.textTransform),
              }}
            >
              {resolvedBrandTitle}
            </strong>
            <p
              className="m-0 leading-[1.55]"
              style={{
                color: props.descriptor.fontColor,
                fontSize: `${props.descriptor.fontSize}px`,
                fontWeight: props.descriptor.fontWeight,
                textTransform: getTextTransform(props.descriptor.textTransform),
              }}
            >
              {resolvedDescriptor}
            </p>
          </div>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
          {props.navigationLinks.map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              cta={{
                link: item.link,
                linkType: "URL",
              }}
            >
              <span className="inline-flex min-h-[44px] items-center text-sm text-[#1f2a24] no-underline">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div aria-label="Social media links" className="flex flex-wrap gap-3">
          {props.socialLinks.map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              cta={{
                link: item.link,
                linkType: "URL",
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e2d8] text-sm text-[#1d4b33] no-underline">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const NaturallyGroundedFooterSection: ComponentConfig<NaturallyGroundedFooterSectionProps> =
  {
    label: "Naturally Grounded Footer Section",
    fields: {
      brandTitle: {
        label: "Brand Title",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      descriptor: {
        label: "Descriptor",
        type: "object",
        objectFields: styledTextObjectFields,
      },
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
        getItemSummary: (item) => item.label || "Footer Link",
      },
      socialLinks: {
        label: "Social Links",
        type: "array",
        arrayFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
        defaultItemProps: {
          label: "ig",
          link: "#",
        },
        getItemSummary: (item) => item.label || "Social Link",
      },
    },
    defaultProps: {
      brandTitle: createTextDefault("Field & Root Market", 14, "#1f2a24", 700),
      descriptor: createTextDefault(
        "Burlington health foods grocery",
        12,
        "#1f2a24",
        400,
      ),
      navigationLinks: [
        {
          label: "Departments",
          link: "#",
        },
        {
          label: "Locations",
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
        },
        {
          label: "f",
          link: "#",
        },
        {
          label: "tt",
          link: "#",
        },
      ],
    },
    render: NaturallyGroundedFooterSectionComponent,
  };
