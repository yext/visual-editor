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

export type WarmEditorialAnnouncementSectionProps = {
  message: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

const createStyledTextFields = (label: string) =>
  ({
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
    },
  }) as const;

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const WarmEditorialAnnouncementSectionFields: Fields<WarmEditorialAnnouncementSectionProps> =
  {
    message: createStyledTextFields("Message"),
    cta: {
      label: "Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
  };

export const WarmEditorialAnnouncementSectionComponent: PuckComponent<
  WarmEditorialAnnouncementSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedMessage =
    resolveComponentData(props.message.text, locale, streamDocument) || "";

  return (
    <section className="w-full bg-[#fffaf3] py-6">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex flex-wrap justify-between gap-4 rounded-[4px] border border-[#e7c98c] bg-[#f4e1bc] px-[18px] py-[14px]">
          <p
            className="m-0"
            style={{
              fontFamily: '"Space Grotesk", Arial, sans-serif',
              fontSize: `${props.message.fontSize}px`,
              color: props.message.fontColor,
              fontWeight: props.message.fontWeight,
              textTransform: toCssTextTransform(props.message.textTransform),
              lineHeight: 1.5,
            }}
          >
            {resolvedMessage}
          </p>
          <Link
            cta={{
              link: props.cta.link,
              linkType: "URL",
            }}
            className="inline-flex items-center text-[#a55739] no-underline"
          >
            <span
              style={{
                fontFamily: '"Space Grotesk", Arial, sans-serif',
                fontWeight: 700,
              }}
            >
              {props.cta.label}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export const WarmEditorialAnnouncementSection: ComponentConfig<WarmEditorialAnnouncementSectionProps> =
  {
    label: "Warm Editorial Announcement Section",
    fields: WarmEditorialAnnouncementSectionFields,
    defaultProps: {
      message: createStyledTextDefault(
        "Weekend pastry boxes and same-day pickup available while quantities last.",
        16,
        "#2b211d",
        500,
      ),
      cta: {
        label: "See preorder options",
        link: "#",
      },
    },
    render: WarmEditorialAnnouncementSectionComponent,
  };
