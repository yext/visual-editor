import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type AboutItem = {
  title: StyledTextProps;
  body: StyledTextProps;
};

export type NaturallyGroundedAboutSectionProps = {
  title: StyledTextProps;
  items: AboutItem[];
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

export const NaturallyGroundedAboutSectionComponent: PuckComponent<
  NaturallyGroundedAboutSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="mb-6">
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
      </div>
      <div className="grid gap-6 rounded-[28px] bg-[#f8f4ec] p-8 md:grid-cols-3">
        {props.items.map((item, index) => {
          const resolvedItemTitle =
            resolveComponentData(item.title.text, locale, streamDocument) || "";
          const resolvedItemBody =
            resolveComponentData(item.body.text, locale, streamDocument) || "";

          return (
            <div key={`${resolvedItemTitle}-${index}`} className="grid gap-3">
              <h3
                className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  color: item.title.fontColor,
                  fontSize: `${item.title.fontSize}px`,
                  fontWeight: item.title.fontWeight,
                  textTransform: getTextTransform(item.title.textTransform),
                }}
              >
                {resolvedItemTitle}
              </h3>
              <p
                className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  color: item.body.fontColor,
                  fontSize: `${item.body.fontSize}px`,
                  fontWeight: item.body.fontWeight,
                  textTransform: getTextTransform(item.body.textTransform),
                }}
              >
                {resolvedItemBody}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const NaturallyGroundedAboutSection: ComponentConfig<NaturallyGroundedAboutSectionProps> =
  {
    label: "Naturally Grounded About Section",
    fields: {
      title: {
        label: "Title",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
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
        },
        defaultItemProps: {
          title: createTextDefault("Column Title", 17, "#1f2a24", 800),
          body: createTextDefault("Column body copy.", 16, "#1f2a24", 400),
        },
        getItemSummary: (item) =>
          ((item.title?.text as any)?.constantValue?.defaultValue as string) ||
          "About Item",
      },
    },
    defaultProps: {
      title: createTextDefault(
        "What makes this store feel different",
        40,
        "#1d4b33",
        700,
      ),
      items: [
        {
          title: createTextDefault("Food first", 17, "#1f2a24", 800),
          body: createTextDefault(
            "Built around practical health-food shopping, not just specialty splurges.",
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          title: createTextDefault("Lower-waste habits", 17, "#1f2a24", 800),
          body: createTextDefault(
            "Bulk sections, refill options, and product curation that helps cut packaging where it matters.",
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          title: createTextDefault("Local sourcing", 17, "#1f2a24", 800),
          body: createTextDefault(
            "Regional makers and seasonal relationships are visible throughout the store, especially produce and prepared foods.",
            16,
            "#1f2a24",
            400,
          ),
        },
      ],
    },
    render: NaturallyGroundedAboutSectionComponent,
  };
