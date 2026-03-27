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

type NavLink = {
  label: string;
  link: string;
};

export type RuggedUtilityFooterSectionProps = {
  logoLetter: StyledTextProps;
  brandName: StyledTextProps;
  tagline: StyledTextProps;
  footerLinks: NavLink[];
  socialLinks: NavLink[];
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
};

const navArrayField = {
  label: "Links",
  type: "array" as const,
  getItemSummary: (item: NavLink) => item.label || "Link",
  defaultItemProps: {
    label: "Link",
    link: "#",
  },
  arrayFields: {
    label: { label: "Label", type: "text" as const },
    link: { label: "Link", type: "text" as const },
  },
};

const RuggedUtilityFooterSectionFields: Fields<RuggedUtilityFooterSectionProps> =
  {
    logoLetter: {
      label: "Logo Letter",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    brandName: {
      label: "Brand Name",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    tagline: {
      label: "Tagline",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    footerLinks: navArrayField,
    socialLinks: navArrayField,
  };

export const RuggedUtilityFooterSectionComponent: PuckComponent<
  RuggedUtilityFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const logoLetter =
    resolveComponentData(props.logoLetter.text, locale, streamDocument) || "";
  const brandName =
    resolveComponentData(props.brandName.text, locale, streamDocument) || "";
  const tagline =
    resolveComponentData(props.tagline.text, locale, streamDocument) || "";

  return (
    <footer className="mt-16 w-full border-t border-white/15 bg-[#181715] text-[#fffdf8]">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pb-7 pt-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[2px] border-2 border-[#fffdf8]">
            <span
              style={{
                fontFamily: '"Public Sans", "Open Sans", sans-serif',
                fontSize: `${props.logoLetter.fontSize}px`,
                lineHeight: 1,
                color: props.logoLetter.fontColor,
                fontWeight: props.logoLetter.fontWeight,
                textTransform:
                  props.logoLetter.textTransform === "normal"
                    ? "none"
                    : props.logoLetter.textTransform,
              }}
            >
              {logoLetter}
            </span>
          </div>
          <div>
            <p
              className="m-0"
              style={{
                fontFamily: '"Public Sans", "Open Sans", sans-serif',
                fontSize: `${props.brandName.fontSize}px`,
                lineHeight: 1.5,
                color: props.brandName.fontColor,
                fontWeight: props.brandName.fontWeight,
                textTransform:
                  props.brandName.textTransform === "normal"
                    ? "none"
                    : props.brandName.textTransform,
              }}
            >
              {brandName}
            </p>
            <p
              className="m-0"
              style={{
                fontFamily: '"Public Sans", "Open Sans", sans-serif',
                fontSize: `${props.tagline.fontSize}px`,
                lineHeight: 1.5,
                color: props.tagline.fontColor,
                fontWeight: props.tagline.fontWeight,
                textTransform:
                  props.tagline.textTransform === "normal"
                    ? "none"
                    : props.tagline.textTransform,
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
          {props.footerLinks.map((linkItem, index) => (
            <Link
              key={`${linkItem.label}-${index}`}
              cta={{ link: linkItem.link, linkType: "URL" }}
              className="inline-flex min-h-[44px] items-center text-[#fffdf8] no-underline"
            >
              {linkItem.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3" aria-label="Social media links">
          {props.socialLinks.map((linkItem, index) => (
            <Link
              key={`${linkItem.label}-${index}`}
              cta={{ link: linkItem.link, linkType: "URL" }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xs font-medium text-[#fffdf8] no-underline"
            >
              {linkItem.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const RuggedUtilityFooterSection: ComponentConfig<RuggedUtilityFooterSectionProps> =
  {
    label: "Rugged Utility Footer Section",
    fields: RuggedUtilityFooterSectionFields,
    defaultProps: {
      logoLetter: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "N",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#fffdf8",
        fontWeight: 800,
        textTransform: "normal",
      },
      brandName: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Northline Outfitters",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#fffdf8",
        fontWeight: 800,
        textTransform: "normal",
      },
      tagline: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Bend outdoor gear store",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "rgba(255,255,255,.7)",
        fontWeight: 400,
        textTransform: "normal",
      },
      footerLinks: [
        { label: "Departments", link: "#" },
        { label: "Classes", link: "#" },
        { label: "Locations", link: "#" },
      ],
      socialLinks: [
        { label: "ig", link: "#" },
        { label: "f", link: "#" },
        { label: "yt", link: "#" },
      ],
    },
    render: RuggedUtilityFooterSectionComponent,
  };
