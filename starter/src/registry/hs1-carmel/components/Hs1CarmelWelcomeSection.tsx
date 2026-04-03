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

export type Hs1CarmelWelcomeSectionProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  heading: StyledTextProps;
  body: StyledTextProps;
  cta: ActionLink;
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
  }) satisfies Fields<Hs1CarmelWelcomeSectionProps>["heading"];

const Hs1CarmelWelcomeSectionFields: Fields<Hs1CarmelWelcomeSectionProps> = {
  image: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Image",
    filter: {
      types: ["type.image"],
    },
  }),
  heading: createStyledTextField("Heading"),
  body: createStyledTextField("Body"),
  cta: {
    label: "Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
};

export const Hs1CarmelWelcomeSectionComponent: PuckComponent<
  Hs1CarmelWelcomeSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedImage = resolveComponentData(
    props.image,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedBody =
    resolveComponentData(props.body.text, locale, streamDocument) || "";

  return (
    <section className="bg-white px-4 py-16 lg:px-6">
      <div className="mx-auto grid max-w-[1140px] items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="overflow-hidden rounded-sm bg-[#F0EDEB]">
          {resolvedImage && (
            <Image
              image={resolvedImage}
              className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
            />
          )}
        </div>
        <div>
          <h2
            className="m-0 border-b border-[#7CB0D3] pb-5 font-['Poppins','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: props.heading.textTransform,
              lineHeight: 1.1,
            }}
          >
            {resolvedHeading}
          </h2>
          <p
            className="mt-5 whitespace-pre-line font-['Gothic_A1','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.body.fontSize}px`,
              color: props.body.fontColor,
              fontWeight: props.body.fontWeight,
              textTransform: props.body.textTransform,
              lineHeight: 1.6,
            }}
          >
            {resolvedBody}
          </p>
          <div className="mt-8">
            <Link
              cta={{
                link: props.cta.link,
                linkType: "URL",
              }}
              className="inline-flex rounded-md bg-[#04364E] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-[#7CB0D3]"
            >
              {props.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1CarmelWelcomeSection: ComponentConfig<Hs1CarmelWelcomeSectionProps> =
  {
    label: "HS1 Carmel Welcome Section",
    fields: Hs1CarmelWelcomeSectionFields,
    defaultProps: {
      image: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/2047x1365_80/webmgr/1s/a/7/Sample-Images/52098118932_713490c296_k.jpg.webp?5c70f574b4dc675b359b82e70e6d374a",
          width: 2047,
          height: 1365,
        },
        constantValueEnabled: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "Welcome to Our Practice",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 34,
        fontColor: "#04364E",
        fontWeight: 700,
        textTransform: "none",
      },
      body: {
        text: {
          field: "",
          constantValue: {
            en: "Welcome! The dental professionals at Round Valley Dental Center are pleased to welcome you to our practice. We want all our patients to be informed decision makers and fully understand any oral health issues they face.\n\nOur web site also provides you with background about our staff, office hours, insurance policies, appointment procedures, maps, directions, and other useful information.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#4A4A4A",
        fontWeight: 400,
        textTransform: "none",
      },
      cta: {
        label: "Read More",
        link: "https://www.ofc-carmel.com/testimonials",
      },
    },
    render: Hs1CarmelWelcomeSectionComponent,
  };
