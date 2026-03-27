import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
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

type CallToAction = { label: string; link: string };

export type Hs1AlbanyWelcomeSectionProps = {
  heading: StyledTextProps;
  subtitle: StyledTextProps;
  body: StyledTextProps;
  cta: CallToAction;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

const weightOptions = [
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

const transformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const textField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: weightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: transformOptions,
    },
  },
});

const textDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
) => ({
  text: {
    field: "",
    constantValue: { en: text, hasLocalizedValue: "true" as const },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): CSSProperties["textTransform"] => (value === "normal" ? undefined : value);

const Hs1AlbanyWelcomeSectionFields: Fields<Hs1AlbanyWelcomeSectionProps> = {
  heading: textField("Heading"),
  subtitle: textField("Subtitle"),
  body: textField("Body"),
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
  >({ label: "Image", filter: { types: ["type.image"] } }),
};

export const Hs1AlbanyWelcomeSectionComponent: PuckComponent<
  Hs1AlbanyWelcomeSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const subtitle =
    resolveComponentData(props.subtitle.text, locale, streamDocument) || "";
  const body =
    resolveComponentData(props.body.text, locale, streamDocument) || "";
  const image = resolveComponentData(props.image, locale, streamDocument);

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1170px] items-center md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="px-8 py-14 md:px-12">
          <h2
            className="m-0"
            style={{
              fontFamily: "Montserrat, Open Sans, sans-serif",
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              letterSpacing: "1px",
              lineHeight: "1.2",
            }}
          >
            {heading}
          </h2>
          <div className="mt-5 h-px w-24 bg-[#d3a335]" />
          <p
            className="mb-0 mt-5 text-[22px] text-[#d3a335]"
            style={{
              fontFamily: "Montserrat, Open Sans, sans-serif",
              lineHeight: "1.4",
            }}
          >
            {subtitle}
          </p>
          <p
            className="mb-0 mt-5 text-[14px] leading-7 text-[#7a7a7a]"
            style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
          >
            {body}
          </p>
          <Link
            cta={{ link: props.cta.link, linkType: "URL" }}
            className="mt-8 inline-flex bg-[#d3a335] px-6 py-3 no-underline"
          >
            <span
              className="text-[15px] font-bold uppercase tracking-[0.08em] text-white"
              style={{ fontFamily: "Nunito Sans, Open Sans, sans-serif" }}
            >
              {props.cta.label}
            </span>
          </Link>
        </div>
        <div className="h-full min-h-[280px]">
          {image ? (
            <div className="h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
              <Image image={image} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyWelcomeSection: ComponentConfig<Hs1AlbanyWelcomeSectionProps> =
  {
    label: "HS1 Albany Welcome Section",
    fields: Hs1AlbanyWelcomeSectionFields,
    defaultProps: {
      heading: textDefault(
        "WELCOME TO OUR PRACTICE",
        28,
        "#7b7b7b",
        400,
        "uppercase",
      ),
      subtitle: textDefault(
        "Welcome to Sunny Smiles Dental, Your Dentist in Downers Grove, IL",
        22,
        "#d3a335",
        300,
        "normal",
      ),
      body: textDefault(
        "Welcome! The dental professionals at Sunny Smiles Dental are pleased to welcome you to our practice. We want patients to be informed decision makers and fully understand any health issues they face, our web site also provides you with background about our, staff, office hours, insurance policies, appointment procedures, maps, directions to our office in and other useful information. We know how hectic life can be and are committed to making our practice convenient and accessible. And we want you to feel confident that when you choose , you're working with doctors and other professionals who are qualified, experienced and caring.",
        14,
        "#7a7a7a",
        400,
        "normal",
      ),
      cta: {
        label: "Read More",
        link: "https://www.ofc-albany.com/testimonials",
      },
      image: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/3000x2002_80/webmgr/1o/u/o/Callouts-LRG/35812201360_9e7a4b0655_6k.jpg.webp?4db324ffd83d659463716cf0925f427e",
          width: 3000,
          height: 2002,
        },
        constantValueEnabled: true,
      },
    },
    render: Hs1AlbanyWelcomeSectionComponent,
  };
