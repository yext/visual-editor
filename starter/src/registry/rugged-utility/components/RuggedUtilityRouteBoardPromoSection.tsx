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

export type RuggedUtilityRouteBoardPromoSectionProps = {
  heading: StyledTextProps;
  body: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
  promoImage: YextEntityField<
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
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const styledTextObjectFields = {
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
};

const RuggedUtilityRouteBoardPromoSectionFields: Fields<RuggedUtilityRouteBoardPromoSectionProps> =
  {
    heading: {
      label: "Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    body: {
      label: "Body",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    cta: {
      label: "Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    promoImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Promo Image",
      filter: {
        types: ["type.image"],
      },
    }),
  };

export const RuggedUtilityRouteBoardPromoSectionComponent: PuckComponent<
  RuggedUtilityRouteBoardPromoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const body =
    resolveComponentData(props.body.text, locale, streamDocument) || "";
  const image = resolveComponentData(props.promoImage, locale, streamDocument);

  return (
    <section className="mx-auto my-3 w-full max-w-[1024px] px-6">
      <div className="grid items-center gap-6 rounded-[8px] border border-[#d3c8b6] bg-[#f2ede3] p-6 md:grid-cols-[.92fr_1.08fr]">
        <div className="min-h-[260px] overflow-hidden rounded-[8px] [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
          {image ? <Image image={image} /> : null}
        </div>
        <div className="grid gap-4">
          <div>
            <h2
              className="m-0"
              style={{
                fontFamily: '"Archivo Black", "Arial Black", sans-serif',
                fontSize: `${props.heading.fontSize}px`,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: props.heading.fontColor,
                fontWeight: props.heading.fontWeight,
                textTransform:
                  props.heading.textTransform === "normal"
                    ? "none"
                    : props.heading.textTransform,
              }}
            >
              {heading}
            </h2>
          </div>
          <p
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.body.fontSize}px`,
              lineHeight: 1.5,
              color: props.body.fontColor,
              fontWeight: props.body.fontWeight,
              textTransform:
                props.body.textTransform === "normal"
                  ? "none"
                  : props.body.textTransform,
            }}
          >
            {body}
          </p>
          <div>
            <Link
              cta={{ link: props.cta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#ad5f2d] bg-transparent px-[18px] text-center text-sm font-extrabold text-[#ad5f2d] no-underline"
            >
              {props.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const RuggedUtilityRouteBoardPromoSection: ComponentConfig<RuggedUtilityRouteBoardPromoSectionProps> =
  {
    label: "Rugged Utility Route Board Promo Section",
    fields: RuggedUtilityRouteBoardPromoSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Weekend route picks from the staff board",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 36,
        fontColor: "#181715",
        fontWeight: 400,
        textTransform: "normal",
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Each Friday, the team posts current trail, campground, and weather notes for nearby routes so shoppers can leave the store with a usable plan.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#6d665b",
        fontWeight: 400,
        textTransform: "normal",
      },
      cta: {
        label: "See this weekend's board",
        link: "#",
      },
      promoImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 800,
        },
        constantValueEnabled: true,
      },
    },
    render: RuggedUtilityRouteBoardPromoSectionComponent,
  };
