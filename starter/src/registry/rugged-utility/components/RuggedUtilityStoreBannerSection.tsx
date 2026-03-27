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

export type RuggedUtilityStoreBannerSectionProps = {
  message: StyledTextProps;
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

const RuggedUtilityStoreBannerSectionFields: Fields<RuggedUtilityStoreBannerSectionProps> =
  {
    message: {
      label: "Message",
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
    },
    cta: {
      label: "Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
  };

export const RuggedUtilityStoreBannerSectionComponent: PuckComponent<
  RuggedUtilityStoreBannerSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const message =
    resolveComponentData(props.message.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto my-3 w-full max-w-[1024px] px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-[#d3c8b6] bg-[#f2ede3] px-[18px] py-[14px]">
        <p
          className="m-0"
          style={{
            fontFamily: '"Public Sans", "Open Sans", sans-serif',
            fontSize: `${props.message.fontSize}px`,
            lineHeight: 1.5,
            color: props.message.fontColor,
            fontWeight: props.message.fontWeight,
            textTransform:
              props.message.textTransform === "normal"
                ? "none"
                : props.message.textTransform,
          }}
        >
          {message}
        </p>
        <Link
          cta={{ link: props.cta.link, linkType: "URL" }}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#ad5f2d] no-underline"
        >
          {props.cta.label}
        </Link>
      </div>
    </section>
  );
};

export const RuggedUtilityStoreBannerSection: ComponentConfig<RuggedUtilityStoreBannerSectionProps> =
  {
    label: "Rugged Utility Store Banner Section",
    fields: RuggedUtilityStoreBannerSectionFields,
    defaultProps: {
      message: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Pack fittings and trail-ready layering checklists available at the service desk this week.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#181715",
        fontWeight: 400,
        textTransform: "normal",
      },
      cta: {
        label: "See what to bring",
        link: "#",
      },
    },
    render: RuggedUtilityStoreBannerSectionComponent,
  };
