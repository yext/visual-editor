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

type LinkItem = {
  label: string;
  link: string;
};

export type CoolRunningUpdateBannerSectionProps = {
  message: StyledTextProps;
  cta: LinkItem;
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

const CoolRunningUpdateBannerSectionFields: Fields<CoolRunningUpdateBannerSectionProps> =
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

export const CoolRunningUpdateBannerSectionComponent: PuckComponent<
  CoolRunningUpdateBannerSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const message =
    resolveComponentData(props.message.text, locale, streamDocument) || "";
  const textTransform =
    props.message.textTransform === "normal"
      ? undefined
      : props.message.textTransform;

  return (
    <section className="mx-auto w-full max-w-[1024px] px-6">
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 rounded-[6px] border border-[#dbe2ea] bg-[#eef6fd] px-4 py-3">
        <p
          className="m-0"
          style={{
            fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
            fontSize: `${props.message.fontSize}px`,
            color: props.message.fontColor,
            fontWeight: props.message.fontWeight,
            textTransform,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <Link
          className="text-[16px] leading-[1.5] text-[#1677c9] no-underline"
          cta={{
            link: props.cta.link,
            linkType: "URL",
          }}
        >
          {props.cta.label}
        </Link>
      </div>
    </section>
  );
};

export const CoolRunningUpdateBannerSection: ComponentConfig<CoolRunningUpdateBannerSectionProps> =
  {
    label: "Cool Running Update Banner Section",
    fields: CoolRunningUpdateBannerSectionFields,
    defaultProps: {
      message: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "This machine supports cash withdrawal, balance checks, and card-based deposits.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 400,
        textTransform: "normal",
      },
      cta: {
        label: "See supported transactions",
        link: "#",
      },
    },
    render: CoolRunningUpdateBannerSectionComponent,
  };
