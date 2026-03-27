import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  TranslatableAssetImage,
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";

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

export type HereForYouPromoSectionProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  heading: StyledTextProps;
  body: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
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

const HereForYouPromoSectionFields: Fields<HereForYouPromoSectionProps> = {
  image: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Promo Image",
    filter: {
      types: ["type.image"],
    },
  }),
  heading: {
    label: "Heading",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  body: {
    label: "Body",
    type: "object",
    objectFields: createStyledTextFields(),
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

export const HereForYouPromoSectionComponent: PuckComponent<
  HereForYouPromoSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: YextEntityField<TranslatableString>) =>
    resolveComponentData(value, locale, streamDocument) || "";
  const image = resolveComponentData(
    props.image,
    locale,
    streamDocument,
  ) as unknown as
    | ImageType
    | ComplexImageType
    | TranslatableAssetImage
    | undefined;

  return (
    <section
      aria-labelledby="here-for-you-promo-title"
      className="my-3 w-full bg-[#f7f2ea] py-6"
    >
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="grid grid-cols-[340px_1fr] items-center gap-6 py-6 max-[900px]:grid-cols-1">
          <div className="min-h-[260px] overflow-hidden rounded-2xl">
            {image ? (
              <div className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                <Image image={image as any} />
              </div>
            ) : null}
          </div>
          <div className="grid gap-4">
            <h2
              id="here-for-you-promo-title"
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
            <p
              style={{
                fontFamily: '"Manrope", "Open Sans", sans-serif',
                fontSize: `${props.body.fontSize}px`,
                color: props.body.fontColor,
                fontWeight: props.body.fontWeight,
                textTransform: toCssTextTransform(props.body.textTransform),
                lineHeight: 1.55,
              }}
              className="m-0"
            >
              {resolveText(props.body.text)}
            </p>
            <div className="w-full">
              <Link
                cta={{ link: props.cta.link, linkType: "URL" }}
                className="flex min-h-[46px] w-full items-center justify-center rounded-full border-2 border-[#2d8a87] bg-transparent px-[18px] text-sm font-bold text-[#2d8a87] no-underline"
              >
                {props.cta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HereForYouPromoSection: ComponentConfig<HereForYouPromoSectionProps> =
  {
    label: "Here For You Promo Section",
    fields: HereForYouPromoSectionFields,
    defaultProps: {
      image: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
        } as any,
        constantValueEnabled: true,
      },
      heading: createStyledTextDefault(
        "New patient evaluations available within the week",
        35,
        "#203446",
        600,
      ),
      body: createStyledTextDefault(
        "The clinic keeps room in the schedule for patients who need to get started quickly after surgery, injury, or a sudden pain flare-up.",
        16,
        "#203446",
        400,
      ),
      cta: {
        label: "See intake steps",
        link: "#",
      },
    },
    render: HereForYouPromoSectionComponent,
  };
