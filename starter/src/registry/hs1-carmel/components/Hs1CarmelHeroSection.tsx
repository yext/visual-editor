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
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
};

type ActionLink = {
  label: string;
  link: string;
};

export type Hs1CarmelHeroSectionProps = {
  heading: StyledTextProps;
  subtitle: StyledTextProps;
  primaryCta: ActionLink;
  secondaryCta: ActionLink;
  heroImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
};

const createStyledTextField = (label: string) =>
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
          { label: "Normal", value: "none" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) satisfies Fields<Hs1CarmelHeroSectionProps>["heading"];

const Hs1CarmelHeroSectionFields: Fields<Hs1CarmelHeroSectionProps> = {
  heading: createStyledTextField("Heading"),
  subtitle: createStyledTextField("Subtitle"),
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

export const Hs1CarmelHeroSectionComponent: PuckComponent<
  Hs1CarmelHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedSubtitle =
    resolveComponentData(props.subtitle.text, locale, streamDocument) || "";
  const resolvedHeroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );

  return (
    <section className="relative isolate overflow-hidden bg-[#04364E] text-white">
      <div className="absolute inset-0">
        {resolvedHeroImage && (
          <Image
            image={resolvedHeroImage}
            className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/35" />
      </div>
      <div className="relative mx-auto flex min-h-[36rem] max-w-[1170px] items-center px-4 py-24 text-center lg:px-6">
        <div className="mx-auto max-w-4xl">
          <h2
            className="m-0 font-['Poppins','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: props.heading.textTransform,
              lineHeight: 1,
            }}
          >
            {resolvedHeading}
          </h2>
          <p
            className="mx-auto mt-6 max-w-3xl font-['Gothic_A1','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.subtitle.fontSize}px`,
              color: props.subtitle.fontColor,
              fontWeight: props.subtitle.fontWeight,
              textTransform: props.subtitle.textTransform,
              lineHeight: 1.5,
            }}
          >
            {resolvedSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              cta={{
                link: props.primaryCta.link,
                linkType: "URL",
              }}
              className="inline-flex min-w-[14rem] justify-center rounded-md border border-white bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#04364E] no-underline transition hover:bg-transparent hover:text-white"
            >
              {props.primaryCta.label}
            </Link>
            <Link
              cta={{
                link: props.secondaryCta.link,
                linkType: "URL",
              }}
              className="inline-flex min-w-[14rem] justify-center rounded-md border border-white bg-transparent px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-white hover:text-[#04364E]"
            >
              {props.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1CarmelHeroSection: ComponentConfig<Hs1CarmelHeroSectionProps> =
  {
    label: "HS1 Carmel Hero Section",
    fields: Hs1CarmelHeroSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "We Are Here For You!",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 40,
        fontColor: "#FFFFFF",
        fontWeight: 700,
        textTransform: "none",
      },
      subtitle: {
        text: {
          field: "",
          constantValue: {
            en: "Providing top-of-the-line quality preventive, cosmetic, and restorative dental care is vital to us. Our team is highly experienced and skilled in what they do.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#FFFFFF",
        fontWeight: 400,
        textTransform: "none",
      },
      primaryCta: {
        label: "Make an Appointment",
        link: "https://www.ofc-carmel.com/appointment",
      },
      secondaryCta: {
        label: "Appointment Request",
        link: "https://www.ofc-carmel.com/contact",
      },
      heroImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1152_80/webmgr/1s/a/7/Sample-Images/51966333832_8f1d4a063b_k_20221028_2053.jpg.webp?90d13dd0a5e31eb81727027dee5863b0",
          width: 2048,
          height: 1152,
        },
        constantValueEnabled: true,
      },
    },
    render: Hs1CarmelHeroSectionComponent,
  };
