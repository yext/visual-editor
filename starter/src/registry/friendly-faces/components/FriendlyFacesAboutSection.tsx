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

export type FriendlyFacesAboutSectionProps = {
  heading: StyledTextProps;
  eyebrow: StyledTextProps;
  body: StyledTextProps;
};

const FriendlyFacesAboutSectionFields: Fields<FriendlyFacesAboutSectionProps> =
  {
    heading: buildStyledTextFields("Heading"),
    eyebrow: buildStyledTextFields("Eyebrow"),
    body: buildStyledTextFields("Body"),
  };

export const FriendlyFacesAboutSectionComponent: PuckComponent<
  FriendlyFacesAboutSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedEyebrow =
    resolveComponentData(props.eyebrow.text, locale, streamDocument) || "";
  const resolvedBody =
    resolveComponentData(props.body.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 pb-6 pt-14">
      <div className="grid gap-8 rounded-[28px] bg-[#fff2ea] p-8 min-[920px]:grid-cols-2">
        <div>
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
        <div className="grid gap-3">
          <p
            className="m-0 font-['Nunito','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.eyebrow.fontSize}px`,
              color: props.eyebrow.fontColor,
              fontWeight: props.eyebrow.fontWeight,
              textTransform: getTextTransformStyle(props.eyebrow.textTransform),
            }}
          >
            {resolvedEyebrow}
          </p>
          <p
            className="m-0 font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
            style={{
              fontSize: `${props.body.fontSize}px`,
              color: props.body.fontColor,
              fontWeight: props.body.fontWeight,
              textTransform: getTextTransformStyle(props.body.textTransform),
            }}
          >
            {resolvedBody}
          </p>
        </div>
      </div>
    </section>
  );
};

export const FriendlyFacesAboutSection: ComponentConfig<FriendlyFacesAboutSectionProps> =
  {
    label: "Friendly Faces About Section",
    fields: FriendlyFacesAboutSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault(
        "Care that feels calm for kids and clear for parents",
        38,
        "#17313d",
        700,
      ),
      eyebrow: buildStyledTextDefault(
        "What families can expect",
        17,
        "#17313d",
        800,
      ),
      body: buildStyledTextDefault(
        "Visits start with practical guidance, space for questions, and a care team that explains what is happening and what happens next without rushing.",
        16,
        "#17313d",
        400,
      ),
    },
    render: FriendlyFacesAboutSectionComponent,
  };
