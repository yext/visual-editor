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

type BannerLink = {
  label: string;
  link: string;
};

export type NaturallyGroundedStoreUpdateBannerSectionProps = {
  announcement: StyledTextProps;
  policyLink: BannerLink;
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

export const NaturallyGroundedStoreUpdateBannerSectionComponent: PuckComponent<
  NaturallyGroundedStoreUpdateBannerSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const announcement =
    resolveComponentData(props.announcement.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-[#edf4ea] px-5 py-[14px] font-['Work_Sans','Open_Sans',sans-serif]">
        <p
          className="m-0 leading-[1.55] text-[#1f2a24]"
          style={{
            color: props.announcement.fontColor,
            fontSize: `${props.announcement.fontSize}px`,
            fontWeight: props.announcement.fontWeight,
            textTransform: getTextTransform(props.announcement.textTransform),
          }}
        >
          {announcement}
        </p>
        <Link
          cta={{
            link: props.policyLink.link,
            linkType: "URL",
          }}
        >
          <span className="text-sm font-medium text-[#1d4b33] no-underline">
            {props.policyLink.label}
          </span>
        </Link>
      </div>
    </section>
  );
};

export const NaturallyGroundedStoreUpdateBannerSection: ComponentConfig<NaturallyGroundedStoreUpdateBannerSectionProps> =
  {
    label: "Naturally Grounded Store Update Banner Section",
    fields: {
      announcement: {
        label: "Announcement",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      policyLink: {
        label: "Policy Link",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
    },
    defaultProps: {
      announcement: createTextDefault(
        "Bring a reusable jar or container on Tuesdays for bulk refill discounts.",
        16,
        "#1f2a24",
        400,
      ),
      policyLink: {
        label: "See store policies",
        link: "#",
      },
    },
    render: NaturallyGroundedStoreUpdateBannerSectionComponent,
  };
