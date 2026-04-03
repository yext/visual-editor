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

export type Hs1CarmelContactFormSectionProps = {
  backgroundImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
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
  }) satisfies Fields<Hs1CarmelContactFormSectionProps>["heading"];

const Hs1CarmelContactFormSectionFields: Fields<Hs1CarmelContactFormSectionProps> =
  {
    backgroundImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Background Image",
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

export const Hs1CarmelContactFormSectionComponent: PuckComponent<
  Hs1CarmelContactFormSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBackground = resolveComponentData(
    props.backgroundImage,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedBody =
    resolveComponentData(props.body.text, locale, streamDocument) || "";

  return (
    <section className="relative overflow-hidden px-4 py-16 text-white lg:px-6">
      <div className="absolute inset-0">
        {resolvedBackground && (
          <Image
            image={resolvedBackground}
            className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[#0f2230]/85" />
      </div>
      <div className="relative mx-auto max-w-[1140px]">
        <div className="mx-auto max-w-[40rem] bg-white/8 p-8 shadow-xl backdrop-blur-sm">
          <h2
            className="m-0 text-center font-['Poppins','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: props.heading.textTransform,
            }}
          >
            {resolvedHeading}
          </h2>
          <p
            className="mt-4 text-center font-['Gothic_A1','Open_Sans',sans-serif]"
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
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-none border border-white/20 bg-white px-4 py-3 text-black outline-none"
              placeholder="Name"
              readOnly
            />
            <input
              className="rounded-none border border-white/20 bg-white px-4 py-3 text-black outline-none"
              placeholder="Email"
              readOnly
            />
            <input
              className="rounded-none border border-white/20 bg-white px-4 py-3 text-black outline-none md:col-span-2"
              placeholder="Phone"
              readOnly
            />
            <textarea
              className="min-h-[8rem] rounded-none border border-white/20 bg-white px-4 py-3 text-black outline-none md:col-span-2"
              placeholder="Message"
              readOnly
            />
          </div>
          <div className="mt-6 text-center">
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

export const Hs1CarmelContactFormSection: ComponentConfig<Hs1CarmelContactFormSectionProps> =
  {
    label: "HS1 Carmel Contact Form Section",
    fields: Hs1CarmelContactFormSectionFields,
    defaultProps: {
      backgroundImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1367_80/webmgr/1s/a/7/Sample-Images/52387318393_008419d7e0_k.jpg.webp?245679b6a08e141b79cd1adb05b548eb",
          width: 2048,
          height: 1367,
        },
        constantValueEnabled: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "Send Us A Message",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 32,
        fontColor: "#FFFFFF",
        fontWeight: 700,
        textTransform: "none",
      },
      body: {
        text: {
          field: "",
          constantValue: {
            en: "Questions about treatment, scheduling, or your next visit? Reach out and our team will help you get started.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#FFFFFF",
        fontWeight: 400,
        textTransform: "none",
      },
      cta: {
        label: "Contact Us",
        link: "https://www.ofc-carmel.com/contact",
      },
    },
    render: Hs1CarmelContactFormSectionComponent,
  };
