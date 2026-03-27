import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";

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

type BulletItemProps = {
  copy: StyledTextProps;
};

export type HereForYouAboutSectionProps = {
  heading: StyledTextProps;
  bulletItems: BulletItemProps[];
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

const HereForYouAboutSectionFields: Fields<HereForYouAboutSectionProps> = {
  heading: {
    label: "Heading",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  bulletItems: {
    label: "Bullet Items",
    type: "array",
    arrayFields: {
      copy: {
        label: "Copy",
        type: "object",
        objectFields: createStyledTextFields(),
      },
    },
    defaultItemProps: {
      copy: createStyledTextDefault("Bullet item", 16, "#203446", 400),
    },
    getItemSummary: (item: any) =>
      item.copy?.text?.constantValue?.defaultValue || "Bullet Item",
  },
};

export const HereForYouAboutSectionComponent: PuckComponent<
  HereForYouAboutSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: YextEntityField<TranslatableString>) =>
    resolveComponentData(value, locale, streamDocument) || "";

  return (
    <section
      aria-labelledby="here-for-you-about-title"
      className="my-3 w-full bg-[#edf8f7] py-6"
    >
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="grid grid-cols-[1.1fr_.9fr] items-start gap-8 py-8 max-[900px]:grid-cols-1">
          <div>
            <h2
              id="here-for-you-about-title"
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: `${props.heading.fontSize}px`,
                color: props.heading.fontColor,
                fontWeight: props.heading.fontWeight,
                textTransform: toCssTextTransform(props.heading.textTransform),
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
              }}
              className="m-0"
            >
              {resolveText(props.heading.text)}
            </h2>
          </div>
          <ul className="m-0 list-disc space-y-4 pl-[18px] marker:text-[#203446]">
            {props.bulletItems.map((item, index) => (
              <li key={index}>
                <p
                  style={{
                    fontFamily: '"Manrope", "Open Sans", sans-serif',
                    fontSize: `${item.copy.fontSize}px`,
                    color: item.copy.fontColor,
                    fontWeight: item.copy.fontWeight,
                    textTransform: toCssTextTransform(item.copy.textTransform),
                    lineHeight: 1.55,
                  }}
                  className="m-0"
                >
                  {resolveText(item.copy.text)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export const HereForYouAboutSection: ComponentConfig<HereForYouAboutSectionProps> =
  {
    label: "Here For You About Section",
    fields: HereForYouAboutSectionFields,
    defaultProps: {
      heading: createStyledTextDefault(
        "Recovery plans that stay practical and personal",
        35,
        "#203446",
        600,
      ),
      bulletItems: [
        {
          copy: createStyledTextDefault(
            "Start with a clear evaluation and a plan that explains what improvement should look like week by week.",
            16,
            "#203446",
            400,
          ),
        },
        {
          copy: createStyledTextDefault(
            "Balance hands-on treatment, guided exercise, and everyday movement strategies that fit real schedules.",
            16,
            "#203446",
            400,
          ),
        },
        {
          copy: createStyledTextDefault(
            "Adjust treatment as progress changes rather than locking every patient into the same sequence.",
            16,
            "#203446",
            400,
          ),
        },
      ],
    },
    render: HereForYouAboutSectionComponent,
  };
