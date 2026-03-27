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

export type WarmEditorialHeroSectionProps = {
  heroImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: {
    label: string;
    link: string;
  };
  secondaryCta: {
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

const WarmEditorialHeroSectionFields: Fields<WarmEditorialHeroSectionProps> = {
  heroImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Hero Image",
    filter: {
      types: ["type.image"],
    },
  }),
  heading: createStyledTextFields("Heading"),
  location: createStyledTextFields("Location"),
  description: createStyledTextFields("Description"),
  primaryCta: {
    label: "Primary Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  secondaryCta: {
    label: "Secondary Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
};

export const WarmEditorialHeroSectionComponent: PuckComponent<
  WarmEditorialHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedLocation =
    resolveComponentData(props.location.text, locale, streamDocument) || "";
  const resolvedDescription =
    resolveComponentData(props.description.text, locale, streamDocument) || "";

  return (
    <section className="relative w-full overflow-hidden bg-[#2b211d]">
      {resolvedHeroImage && (
        <div className="absolute inset-0">
          <Image
            image={resolvedHeroImage}
            className="h-full w-full object-cover object-[center_48%]"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-[rgba(39,23,16,0.4)]" />
      <div className="relative z-10 mx-auto grid min-h-[460px] max-w-[1024px] content-center justify-items-center px-6 pb-11 pt-16">
        <div className="grid max-w-[620px] gap-4 rounded-[8px] border border-[rgba(234,219,203,0.95)] bg-[rgba(255,250,243,0.92)] p-8 text-center">
          <h1
            className="m-0"
            style={{
              fontFamily: '"Newsreader", Georgia, serif',
              fontSize: `clamp(${props.heading.fontSize}px, 7vw, 5.6rem)`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.98,
            }}
          >
            {resolvedHeading}
          </h1>
          <p
            className="m-0"
            style={{
              fontFamily: '"Space Grotesk", Arial, sans-serif',
              fontSize: `${props.location.fontSize}px`,
              color: props.location.fontColor,
              fontWeight: props.location.fontWeight,
              textTransform: toCssTextTransform(props.location.textTransform),
              lineHeight: 1.5,
            }}
          >
            {resolvedLocation}
          </p>
          <p
            className="mx-auto my-0 max-w-[44ch]"
            style={{
              fontFamily: '"Space Grotesk", Arial, sans-serif',
              fontSize: `${props.description.fontSize}px`,
              color: props.description.fontColor,
              fontWeight: props.description.fontWeight,
              textTransform: toCssTextTransform(
                props.description.textTransform,
              ),
              lineHeight: 1.5,
            }}
          >
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              cta={{
                link: props.primaryCta.link,
                linkType: "URL",
              }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#a55739] bg-[#a55739] px-[18px] text-[#ffffff] no-underline"
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontWeight: 700,
                }}
              >
                {props.primaryCta.label}
              </span>
            </Link>
            <Link
              cta={{
                link: props.secondaryCta.link,
                linkType: "URL",
              }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#a55739] bg-transparent px-[18px] text-[#a55739] no-underline"
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontWeight: 700,
                }}
              >
                {props.secondaryCta.label}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WarmEditorialHeroSection: ComponentConfig<WarmEditorialHeroSectionProps> =
  {
    label: "Warm Editorial Hero Section",
    fields: WarmEditorialHeroSectionFields,
    defaultProps: {
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1600&q=80",
          width: 1600,
          height: 1067,
        },
        constantValueEnabled: true,
      },
      heading: createStyledTextDefault(
        "North Common Bakehouse",
        53,
        "#2b211d",
        700,
      ),
      location: createStyledTextDefault("Burlington, VT", 17, "#a55739", 700),
      description: createStyledTextDefault(
        "A modern neighborhood bakery with slow-fermented breads, seasonal pastries, and a menu built for quick pickup as well as slower weekend visits.",
        16,
        "#726156",
        500,
      ),
      primaryCta: {
        label: "Order online",
        link: "#",
      },
      secondaryCta: {
        label: "Get directions",
        link: "#",
      },
    },
    render: WarmEditorialHeroSectionComponent,
  };
