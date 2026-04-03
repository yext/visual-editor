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

type HeroSlide = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  altText: string;
  title: StyledTextProps;
  caption: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type Hs1ChicagoHeroSectionProps = {
  slides: HeroSlide[];
  activeSlideIndex: number;
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

const styledTextFields = (label: string) => ({
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
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const defaultStyledText = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      en: value,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const Hs1ChicagoHeroSectionFields: Fields<Hs1ChicagoHeroSectionProps> = {
  slides: {
    label: "Slides",
    type: "array",
    arrayFields: {
      image: YextEntityFieldSelector<
        any,
        ImageType | ComplexImageType | TranslatableAssetImage
      >({
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      }),
      altText: { label: "Alt Text", type: "text" },
      title: styledTextFields("Title"),
      caption: styledTextFields("Caption"),
      cta: {
        label: "Call To Action",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
    },
    defaultItemProps: {
      image: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/436x400_80/webmgr/1o/q/x/chicago/slider_1.jpg.webp?2e09dc0eebc1490158f26396354403a7",
          width: 436,
          height: 400,
        },
        constantValueEnabled: true,
      },
      altText: "Hero image",
      title: defaultStyledText(
        "Healthy Mouth",
        36,
        "#ffffff",
        500,
        "uppercase",
      ),
      caption: defaultStyledText("Happy Life", 18, "#ffffff", 300, "normal"),
      cta: {
        label: "Make an Appointment",
        link: "https://www.ofc-chicago.com/appointment",
      },
    },
    getItemSummary: (item) => item.cta?.label || "Slide",
  },
  activeSlideIndex: {
    label: "Active Slide Index",
    type: "number",
  },
};

export const Hs1ChicagoHeroSectionComponent: PuckComponent<
  Hs1ChicagoHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const safeIndex = Math.max(
    0,
    Math.min(
      Math.round(props.activeSlideIndex),
      Math.max(props.slides.length - 1, 0),
    ),
  );
  const slide = props.slides[safeIndex];

  const resolvedImage = slide
    ? resolveComponentData(slide.image, locale, streamDocument)
    : undefined;
  const resolvedTitle =
    slide && resolveComponentData(slide.title.text, locale, streamDocument);
  const resolvedCaption =
    slide && resolveComponentData(slide.caption.text, locale, streamDocument);

  if (!slide) {
    return <section className="bg-white" />;
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute bottom-0 left-0 h-0 w-0 border-r-[50vw] border-t-[108px] border-r-transparent border-t-white max-md:hidden" />
      <div className="absolute bottom-0 right-0 h-0 w-0 border-l-[50vw] border-b-[108px] border-l-transparent border-b-white max-md:hidden" />
      <div className="relative z-10 mx-auto max-w-[1220px] px-10 pb-[100px] pt-[14px] max-md:px-4 max-md:pb-16 max-md:pt-0">
        <div className="mx-auto flex min-h-[360px] items-center justify-between gap-[3%] max-md:flex-col-reverse max-md:gap-5">
          <div className="w-[48.4%] max-md:w-full">
            <div className="bg-black/30 p-[5px]">
              <div className="space-y-5 bg-black/35 px-6 py-8 text-white max-md:px-5 max-md:py-6">
                <div className="space-y-1">
                  <p
                    className="m-0"
                    style={{
                      fontFamily: "'Oswald', Verdana, sans-serif",
                      fontSize: `${slide.title.fontSize}px`,
                      color: slide.title.fontColor,
                      fontWeight: slide.title.fontWeight,
                      textTransform: toCssTextTransform(
                        slide.title.textTransform,
                      ),
                      lineHeight: 1.28,
                    }}
                  >
                    {resolvedTitle || ""}
                  </p>
                  <p
                    className="m-0"
                    style={{
                      fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                      fontSize: `${slide.caption.fontSize}px`,
                      color: slide.caption.fontColor,
                      fontWeight: slide.caption.fontWeight,
                      textTransform: toCssTextTransform(
                        slide.caption.textTransform,
                      ),
                      lineHeight: 1.33,
                    }}
                  >
                    {resolvedCaption || ""}
                  </p>
                </div>
                <Link
                  cta={{
                    link: slide.cta.link,
                    linkType: "URL",
                  }}
                >
                  <span
                    className="inline-flex min-w-[138px] items-center justify-center border border-[#815955] bg-[#dd8b83] px-[10px] pb-[5px] pt-[9px] text-center text-[16px] uppercase text-white transition-colors duration-150 hover:bg-[#815955] max-md:min-w-[120px] max-md:text-[14px]"
                    style={{
                      fontFamily: "'Oswald', Verdana, sans-serif",
                      lineHeight: 1.188,
                    }}
                  >
                    {slide.cta.label}
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="w-[48.4%] border border-[#815955] bg-white p-[10px] max-md:w-full">
            <div className="relative overflow-hidden">
              <div className="aspect-[436/400] overflow-hidden">
                {resolvedImage && (
                  <div className="[&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    <Image image={resolvedImage} />
                  </div>
                )}
              </div>
              {resolvedImage && (
                <span className="sr-only">{slide.altText || "Hero image"}</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {props.slides.map((item, index) => (
            <span
              key={`${item.altText}-${index}`}
              className={`block h-2.5 w-2.5 rotate-45 border ${
                index === safeIndex
                  ? "border-[#815955] bg-[#815955]"
                  : "border-[#acaba9] bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoHeroSection: ComponentConfig<Hs1ChicagoHeroSectionProps> =
  {
    label: "HS1 Chicago Hero Section",
    fields: Hs1ChicagoHeroSectionFields,
    defaultProps: {
      slides: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/436x400_80/webmgr/1o/q/x/chicago/slider_1.jpg.webp?2e09dc0eebc1490158f26396354403a7",
              width: 436,
              height: 400,
            },
            constantValueEnabled: true,
          },
          altText: "Dentist showing patient xray",
          title: defaultStyledText(
            "Healthy Mouth",
            36,
            "#ffffff",
            500,
            "uppercase",
          ),
          caption: defaultStyledText(
            "Happy Life",
            18,
            "#ffffff",
            300,
            "normal",
          ),
          cta: {
            label: "Make an Appointment",
            link: "https://www.ofc-chicago.com/appointment",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/436x400_80/webmgr/1o/q/x/chicago/slider_2.jpg.webp?0744d2a79f8e268ba5ae003468cf2aed",
              width: 436,
              height: 400,
            },
            constantValueEnabled: true,
          },
          altText: "Family brushing teeth together",
          title: defaultStyledText(
            "Changing Lives",
            36,
            "#ffffff",
            500,
            "uppercase",
          ),
          caption: defaultStyledText(
            "One Smile at a time",
            18,
            "#ffffff",
            300,
            "normal",
          ),
          cta: {
            label: "Make an Appointment",
            link: "https://www.ofc-chicago.com/appointment",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/436x400_80/webmgr/1o/q/x/chicago/slider_3.jpg.webp?58f726f0b5d6ed2774f5a4b0b612943c",
              width: 436,
              height: 400,
            },
            constantValueEnabled: true,
          },
          altText: "Couple hugging",
          title: defaultStyledText(
            "Discover your smile",
            36,
            "#ffffff",
            500,
            "normal",
          ),
          caption: defaultStyledText("Today!", 18, "#ffffff", 300, "normal"),
          cta: {
            label: "Make an Appointment",
            link: "https://www.ofc-chicago.com/appointment",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/436x400_80/webmgr/1o/q/x/chicago/slider_4.jpg.webp?283a04eb0591ce258e98ebef6ec5c2e9",
              width: 436,
              height: 400,
            },
            constantValueEnabled: true,
          },
          altText: "Couple hugging",
          title: defaultStyledText(
            "Care for Your Smile",
            36,
            "#ffffff",
            500,
            "uppercase",
          ),
          caption: defaultStyledText(
            "and Let it Brighten Your Day!",
            18,
            "#ffffff",
            300,
            "normal",
          ),
          cta: {
            label: "Make an Appointment",
            link: "https://www.ofc-chicago.com/appointment",
          },
        },
      ],
      activeSlideIndex: 1,
    },
    render: Hs1ChicagoHeroSectionComponent,
  };
