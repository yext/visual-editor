import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type TextTransform = "normal" | "uppercase" | "lowercase" | "capitalize";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: FontWeight;
  textTransform: TextTransform;
};

type CtaProps = {
  label: string;
  link: string;
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

export type FriendlyFacesPromoSectionProps = {
  heading: StyledTextProps;
  body: StyledTextProps;
  cta: CtaProps;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

const FriendlyFacesPromoSectionFields: Fields<FriendlyFacesPromoSectionProps> =
  {
    heading: buildStyledTextFields("Heading"),
    body: buildStyledTextFields("Body"),
    cta: {
      label: "Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    image: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Image",
      filter: {
        types: ["type.image"],
      },
    }),
  };

export const FriendlyFacesPromoSectionComponent: PuckComponent<
  FriendlyFacesPromoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedBody =
    resolveComponentData(props.body.text, locale, streamDocument) || "";
  const resolvedImage = resolveComponentData(
    props.image,
    locale,
    streamDocument,
  );

  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 pb-6 pt-14">
      <div className="grid items-center gap-6 rounded-[28px] border border-[#d5e8ea] bg-[#edf9f8] p-6 min-[920px]:grid-cols-[360px_minmax(0,1fr)]">
        {resolvedImage && (
          <div
            aria-hidden="true"
            className="min-h-[280px] overflow-hidden rounded-[24px] border border-[#d5e8ea] bg-white"
          >
            <Image
              image={resolvedImage}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="grid gap-4">
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
          <div className="flex flex-wrap justify-start gap-3">
            <Link
              cta={{ link: props.cta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#0f7c82] bg-[#0f7c82] px-[18px] font-['Nunito','Open_Sans',sans-serif] text-base font-extrabold text-white no-underline"
            >
              {props.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FriendlyFacesPromoSection: ComponentConfig<FriendlyFacesPromoSectionProps> =
  {
    label: "Friendly Faces Promo Section",
    fields: FriendlyFacesPromoSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault(
        "Same-day sick visits that feel organized, not chaotic",
        38,
        "#17313d",
        700,
      ),
      body: buildStyledTextDefault(
        "Families can call ahead in the morning for coughs, fevers, sore throats, and other urgent needs that should be seen the same day.",
        16,
        "#5f7380",
        400,
      ),
      cta: {
        label: "Request a same-day visit",
        link: "#",
      },
      image: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 900,
        },
        constantValueEnabled: true,
      },
    },
    render: FriendlyFacesPromoSectionComponent,
  };
