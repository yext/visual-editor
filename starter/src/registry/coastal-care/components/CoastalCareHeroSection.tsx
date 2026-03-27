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

type LinkProps = {
  label: string;
  link: string;
};

export type CoastalCareHeroSectionProps = {
  backgroundImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  heading: StyledTextProps;
  location: StyledTextProps;
  status: StyledTextProps;
  primaryCta: LinkProps;
  secondaryCta: LinkProps;
};

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
      type: "select" as const,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
    },
  },
});

const linkFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    label: { label: "Label", type: "text" as const },
    link: { label: "Link", type: "text" as const },
  },
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const CoastalCareHeroSectionFields: Fields<CoastalCareHeroSectionProps> = {
  backgroundImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Background Image",
    filter: {
      types: ["type.image"],
    },
  }),
  heading: styledTextFields("Heading"),
  location: styledTextFields("Location"),
  status: styledTextFields("Status"),
  primaryCta: linkFields("Primary Call To Action"),
  secondaryCta: linkFields("Secondary Call To Action"),
};

export const CoastalCareHeroSectionComponent: PuckComponent<
  CoastalCareHeroSectionProps
> = ({
  backgroundImage,
  heading,
  location,
  status,
  primaryCta,
  secondaryCta,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const resolvedBackgroundImage = resolveComponentData(
    backgroundImage,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument) || "";
  const resolvedLocation =
    resolveComponentData(location.text, locale, streamDocument) || "";
  const resolvedStatus =
    resolveComponentData(status.text, locale, streamDocument) || "";

  return (
    <section className="relative w-full overflow-hidden bg-[#d7e3e7]">
      {resolvedBackgroundImage && (
        <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
          <Image image={resolvedBackgroundImage} />
        </div>
      )}
      <div className="absolute inset-0 bg-[rgba(16,37,50,0.45)]" />
      <div className="relative mx-auto grid min-h-[430px] max-w-[1024px] content-end px-6 pb-12 pt-14">
        <div className="grid max-w-[560px] gap-4 rounded-[24px] bg-[rgba(255,255,255,0.92)] p-8 text-left text-[#183347] shadow-[0_0_0_1px_rgba(24,51,71,0.03)]">
          <h1
            className="m-0 max-w-[8ch] font-['DM_Serif_Display','Times_New_Roman',serif] leading-none"
            style={{
              fontSize: `clamp(3rem, 6vw, ${heading.fontSize}px)`,
              color: heading.fontColor,
              fontWeight: heading.fontWeight,
              textTransform: toCssTextTransform(heading.textTransform),
            }}
          >
            {resolvedHeading}
          </h1>
          <p
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.2]"
            style={{
              fontSize: `${location.fontSize}px`,
              color: location.fontColor,
              fontWeight: location.fontWeight,
              textTransform: toCssTextTransform(location.textTransform),
            }}
          >
            {resolvedLocation}
          </p>
          <p
            className="m-0 max-w-[42ch] font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
            style={{
              fontSize: `${status.fontSize}px`,
              color: status.fontColor,
              fontWeight: status.fontWeight,
              textTransform: toCssTextTransform(status.textTransform),
            }}
          >
            {resolvedStatus}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              cta={{
                link: primaryCta.link,
                linkType: "URL",
              }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d6f83] bg-[#2d6f83] px-[18px] font-['Public_Sans','Open_Sans',sans-serif] text-sm font-bold text-white no-underline"
            >
              {primaryCta.label}
            </Link>
            <Link
              cta={{
                link: secondaryCta.link,
                linkType: "URL",
              }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d6f83] bg-transparent px-[18px] font-['Public_Sans','Open_Sans',sans-serif] text-sm font-bold text-[#2d6f83] no-underline"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const CoastalCareHeroSection: ComponentConfig<CoastalCareHeroSectionProps> =
  {
    label: "Coastal Care Hero Section",
    fields: CoastalCareHeroSectionFields,
    defaultProps: {
      backgroundImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1600&q=80",
          width: 1600,
          height: 1067,
        },
        constantValueEnabled: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Harbor Animal Clinic",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 80,
        fontColor: "#183347",
        fontWeight: 400,
        textTransform: "normal",
      },
      location: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Newport, RI",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#2d6f83",
        fontWeight: 800,
        textTransform: "normal",
      },
      status: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "A neighborhood veterinary clinic for checkups, same-week sick visits, and preventive care that feels calm for both pets and people.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5f7684",
        fontWeight: 400,
        textTransform: "normal",
      },
      primaryCta: {
        label: "Book appointment",
        link: "#",
      },
      secondaryCta: {
        label: "Get directions",
        link: "#",
      },
    },
    render: CoastalCareHeroSectionComponent,
  };
