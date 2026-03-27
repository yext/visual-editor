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

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type HeroCta = {
  label: string;
  link: string;
  variant: "outline" | "solid";
};

export type WelcomeInHeroSectionProps = {
  title: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  ctas: HeroCta[];
  heroImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
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

const createStyledTextField = (label: string): any => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select",
      options: textTransformOptions,
    },
  },
});

const defaultStyledText = (
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

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const WelcomeInHeroSectionFields: Fields<WelcomeInHeroSectionProps> = {
  title: createStyledTextField("Title"),
  location: createStyledTextField("Location"),
  description: createStyledTextField("Description"),
  ctas: {
    label: "Calls To Action",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      variant: {
        label: "Variant",
        type: "select",
        options: [
          { label: "Outline", value: "outline" },
          { label: "Solid", value: "solid" },
        ],
      },
    },
    defaultItemProps: {
      label: "Learn More",
      link: "#",
      variant: "outline",
    },
    getItemSummary: (item: HeroCta) => item.label,
  },
  heroImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Hero Image",
    filter: {
      types: ["type.image"],
    },
  }),
};

export const WelcomeInHeroSectionComponent: PuckComponent<
  WelcomeInHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";
  const resolvedLocation =
    resolveComponentData(props.location.text, locale, streamDocument) || "";
  const resolvedDescription =
    resolveComponentData(props.description.text, locale, streamDocument) || "";
  const resolvedHeroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );

  return (
    <section className="w-full bg-[#fffdfb] py-3">
      <div className="mx-auto w-full max-w-[1024px] px-6 pb-5 pt-10">
        <div className="grid justify-items-center gap-6 rounded-[34px] border border-[#f1dfc5] bg-[#fff6ea] p-8 text-center">
          <h1
            className="m-0"
            style={{
              fontFamily: '"Baloo 2", "Trebuchet MS", sans-serif',
              fontSize: `${props.title.fontSize}px`,
              color: props.title.fontColor,
              fontWeight: props.title.fontWeight,
              textTransform: toCssTextTransform(props.title.textTransform),
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {resolvedTitle}
          </h1>
          <p
            className="m-0"
            style={{
              fontFamily:
                '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
              fontSize: `${props.location.fontSize}px`,
              color: props.location.fontColor,
              fontWeight: props.location.fontWeight,
              textTransform: toCssTextTransform(props.location.textTransform),
            }}
          >
            {resolvedLocation}
          </p>
          <p
            className="m-0 max-w-[44ch]"
            style={{
              fontFamily:
                '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
              fontSize: `${props.description.fontSize}px`,
              color: props.description.fontColor,
              fontWeight: props.description.fontWeight,
              textTransform: toCssTextTransform(
                props.description.textTransform,
              ),
              lineHeight: 1.55,
            }}
          >
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {props.ctas.map((cta) => {
              const isSolid = cta.variant === "solid";

              return (
                <Link
                  key={`${cta.label}-${cta.link}`}
                  cta={{
                    link: cta.link,
                    linkType: "URL",
                  }}
                  className={[
                    "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 px-[18px] text-[16px] font-[700] no-underline",
                    isSolid
                      ? "border-[#db5d7d] bg-[#db5d7d] text-[#fffdfb]"
                      : "border-[#db5d7d] bg-transparent text-[#db5d7d]",
                  ].join(" ")}
                >
                  {cta.label}
                </Link>
              );
            })}
          </div>
          <div className="min-h-[220px] w-full max-w-[720px] overflow-hidden rounded-[34px] border border-[#d9dced]">
            {resolvedHeroImage ? (
              <div className="[&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                <Image image={resolvedHeroImage} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export const WelcomeInHeroSection: ComponentConfig<WelcomeInHeroSectionProps> =
  {
    label: "Welcome In Hero Section",
    fields: WelcomeInHeroSectionFields,
    defaultProps: {
      title: defaultStyledText("Juniper Story House", 80, "#24324d", 800),
      location: defaultStyledText("Ann Arbor, MI", 19, "#db5d7d", 800),
      description: defaultStyledText(
        "A neighborhood children's bookshop with storytime corners, staff picks by reading level, and plenty of room for grown-ups to find gifts without feeling rushed.",
        16,
        "#647089",
        400,
      ),
      ctas: [
        {
          label: "Get directions",
          link: "#",
          variant: "solid",
        },
        {
          label: "See upcoming storytimes",
          link: "#",
          variant: "outline",
        },
      ],
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80",
          width: 1400,
          height: 900,
        },
        constantValueEnabled: true,
      },
    },
    render: WelcomeInHeroSectionComponent,
  };
