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

export type NaturallyGroundedPromoSectionProps = {
  title: StyledTextProps;
  body: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
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

export const NaturallyGroundedPromoSectionComponent: PuckComponent<
  NaturallyGroundedPromoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";
  const resolvedBody =
    resolveComponentData(props.body.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="mx-auto grid max-w-[720px] justify-items-center gap-4 rounded-[28px] border border-[#d8e2d8] bg-[#edf4ea] p-8 text-center">
        <h2
          className="m-0 font-['Libre_Baskerville','Times_New_Roman',serif] leading-[1.02] tracking-[-0.03em]"
          style={{
            color: props.title.fontColor,
            fontSize: `${props.title.fontSize}px`,
            fontWeight: props.title.fontWeight,
            textTransform: getTextTransform(props.title.textTransform),
          }}
        >
          {resolvedTitle}
        </h2>
        <p
          className="m-0 max-w-[560px] font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
          style={{
            color: props.body.fontColor,
            fontSize: `${props.body.fontSize}px`,
            fontWeight: props.body.fontWeight,
            textTransform: getTextTransform(props.body.textTransform),
          }}
        >
          {resolvedBody}
        </p>
        <Link
          cta={{
            link: props.cta.link,
            linkType: "URL",
          }}
        >
          <span className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#1d4b33] px-[18px] font-['Work_Sans','Open_Sans',sans-serif] text-sm font-bold text-white no-underline">
            {props.cta.label}
          </span>
        </Link>
      </div>
    </section>
  );
};

export const NaturallyGroundedPromoSection: ComponentConfig<NaturallyGroundedPromoSectionProps> =
  {
    label: "Naturally Grounded Promo Section",
    fields: {
      title: {
        label: "Title",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      body: {
        label: "Body",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      cta: {
        label: "Call To Action",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
    },
    defaultProps: {
      title: createTextDefault(
        "Weekly harvest picks and lower-waste pantry deals",
        28,
        "#1d4b33",
        700,
      ),
      body: createTextDefault(
        "Use the Burlington store page to see what is in season, what is local right now, and where refill discounts are currently highlighted.",
        16,
        "#1f2a24",
        400,
      ),
      cta: {
        label: "See this week's picks",
        link: "#",
      },
    },
    render: NaturallyGroundedPromoSectionComponent,
  };
