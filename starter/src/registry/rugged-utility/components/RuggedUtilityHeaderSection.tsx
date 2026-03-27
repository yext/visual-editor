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

export type RuggedUtilityHeaderSectionProps = {
  logoLetter: StyledTextProps;
  brandName: StyledTextProps;
  brandLink: {
    label: string;
    link: string;
  };
  utilityAnnouncement: StyledTextProps;
  utilityLinks: NavLink[];
  primaryLinks: NavLink[];
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

const RuggedUtilityHeaderSectionFields: Fields<RuggedUtilityHeaderSectionProps> =
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
    brandLink: {
      label: "Brand Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    utilityAnnouncement: {
      label: "Utility Announcement",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    utilityLinks: navArrayField,
    primaryLinks: navArrayField,
  };

export const RuggedUtilityHeaderSectionComponent: PuckComponent<
  RuggedUtilityHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const logoLetter =
    resolveComponentData(props.logoLetter.text, locale, streamDocument) || "";
  const brandName =
    resolveComponentData(props.brandName.text, locale, streamDocument) || "";
  const utilityAnnouncement =
    resolveComponentData(
      props.utilityAnnouncement.text,
      locale,
      streamDocument,
    ) || "";

  return (
    <header className="w-full bg-[#181715] text-[#fffdf8]">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/15 py-[10px] text-[0.92rem] text-white/75">
          <nav
            aria-label="Utility navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.utilityLinks.map((linkItem, index) => (
              <Link
                key={`${linkItem.label}-${index}`}
                cta={{ link: linkItem.link, linkType: "URL" }}
                className="inline-flex min-h-[44px] items-center text-white no-underline"
              >
                {linkItem.label}
              </Link>
            ))}
          </nav>
          <p
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.utilityAnnouncement.fontSize}px`,
              lineHeight: 1.5,
              color: props.utilityAnnouncement.fontColor,
              fontWeight: props.utilityAnnouncement.fontWeight,
              textTransform:
                props.utilityAnnouncement.textTransform === "normal"
                  ? "none"
                  : props.utilityAnnouncement.textTransform,
            }}
          >
            {utilityAnnouncement}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 py-[18px]">
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
            <Link
              cta={{ link: props.brandLink.link, linkType: "URL" }}
              className="inline-flex min-h-[44px] items-center text-[#fffdf8] no-underline"
            >
              <span
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
              </span>
            </Link>
          </div>
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-5"
          >
            {props.primaryLinks.map((linkItem, index) => {
              const isButton = index === props.primaryLinks.length - 1;

              return (
                <Link
                  key={`${linkItem.label}-${index}`}
                  cta={{ link: linkItem.link, linkType: "URL" }}
                  className={
                    isButton
                      ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#ad5f2d] bg-[#ad5f2d] px-[18px] text-sm font-extrabold text-[#fffdf8] no-underline"
                      : "inline-flex min-h-[44px] items-center text-[#fffdf8] no-underline"
                  }
                >
                  {linkItem.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export const RuggedUtilityHeaderSection: ComponentConfig<RuggedUtilityHeaderSectionProps> =
  {
    label: "Rugged Utility Header Section",
    fields: RuggedUtilityHeaderSectionFields,
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
      brandLink: {
        label: "Northline Outfitters",
        link: "#",
      },
      utilityAnnouncement: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Season opener gear clinic this Saturday",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 15,
        fontColor: "rgba(255,255,255,.76)",
        fontWeight: 400,
        textTransform: "normal",
      },
      utilityLinks: [
        { label: "Classes", link: "#" },
        { label: "Repairs", link: "#" },
      ],
      primaryLinks: [
        { label: "Camping", link: "#" },
        { label: "Footwear", link: "#" },
        { label: "Snow", link: "#" },
        { label: "Visit store", link: "#" },
      ],
    },
    render: RuggedUtilityHeaderSectionComponent,
  };
