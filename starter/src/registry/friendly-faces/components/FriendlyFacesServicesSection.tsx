import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type TextTransform = "normal" | "uppercase" | "lowercase" | "capitalize";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: FontWeight;
  textTransform: TextTransform;
};

type ServiceCardProps = {
  title: StyledTextProps;
  description: StyledTextProps;
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

const buildStyledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
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
  },
});

const buildStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: FontWeight,
  textTransform: TextTransform = "normal",
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
  textTransform,
});

const getTextTransformStyle = (value: TextTransform) =>
  value === "normal" ? undefined : value;

export type FriendlyFacesServicesSectionProps = {
  heading: StyledTextProps;
  cards: ServiceCardProps[];
};

const FriendlyFacesServicesSectionFields: Fields<FriendlyFacesServicesSectionProps> =
  {
    heading: buildStyledTextFields("Heading"),
    cards: {
      label: "Cards",
      type: "array",
      arrayFields: {
        title: buildStyledTextFields("Title"),
        description: buildStyledTextFields("Description"),
      },
      defaultItemProps: {
        title: buildStyledTextDefault("Service title", 17, "#17313d", 800),
        description: buildStyledTextDefault(
          "Service description",
          16,
          "#5f7380",
          400,
        ),
      },
      getItemSummary: () => "Service Card",
    },
  };

export const FriendlyFacesServicesSectionComponent: PuckComponent<
  FriendlyFacesServicesSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: getTextTransformStyle(props.heading.textTransform),
          }}
        >
          {resolvedHeading}
        </h2>
      </div>
      <div className="grid gap-5 min-[920px]:grid-cols-3">
        {props.cards.map((item, index) => {
          const resolvedTitle =
            resolveComponentData(item.title.text, locale, streamDocument) || "";
          const resolvedDescription =
            resolveComponentData(
              item.description.text,
              locale,
              streamDocument,
            ) || "";

          return (
            <article
              key={`${resolvedTitle}-${index}`}
              className="grid gap-4 rounded-[24px] border border-[#d5e8ea] bg-white p-6"
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#edf9f8] font-['Nunito','Open_Sans',sans-serif] text-lg font-extrabold text-[#0f7c82]">
                {index + 1}
              </span>
              <h3
                className="m-0 font-['Nunito','Open_Sans',sans-serif]"
                style={{
                  fontSize: `${item.title.fontSize}px`,
                  color: item.title.fontColor,
                  fontWeight: item.title.fontWeight,
                  textTransform: getTextTransformStyle(
                    item.title.textTransform,
                  ),
                }}
              >
                {resolvedTitle}
              </h3>
              <p
                className="m-0 font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
                style={{
                  fontSize: `${item.description.fontSize}px`,
                  color: item.description.fontColor,
                  fontWeight: item.description.fontWeight,
                  textTransform: getTextTransformStyle(
                    item.description.textTransform,
                  ),
                }}
              >
                {resolvedDescription}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const FriendlyFacesServicesSection: ComponentConfig<FriendlyFacesServicesSectionProps> =
  {
    label: "Friendly Faces Services Section",
    fields: FriendlyFacesServicesSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault("Care services", 38, "#17313d", 700),
      cards: [
        {
          title: buildStyledTextDefault(
            "Infant and toddler visits",
            17,
            "#17313d",
            800,
          ),
          description: buildStyledTextDefault(
            "Routine checkups, feeding conversations, growth tracking, and developmental screenings for the earliest years.",
            16,
            "#5f7380",
            400,
          ),
        },
        {
          title: buildStyledTextDefault(
            "School-age support",
            17,
            "#17313d",
            800,
          ),
          description: buildStyledTextDefault(
            "Annual wellness visits, sports forms, vaccine review, and guidance for common school-year illnesses.",
            16,
            "#5f7380",
            400,
          ),
        },
        {
          title: buildStyledTextDefault("Teen visits", 17, "#17313d", 800),
          description: buildStyledTextDefault(
            "Private conversation time, preventive care, and practical support as health needs become more independent.",
            16,
            "#5f7380",
            400,
          ),
        },
      ],
    },
    render: FriendlyFacesServicesSectionComponent,
  };
