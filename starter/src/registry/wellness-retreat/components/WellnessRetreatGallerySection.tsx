import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type GalleryImageProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  altText: string;
};

export type WellnessRetreatGallerySectionProps = {
  heading: StyledTextProps;
  images: GalleryImageProps[];
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

const createStyledTextField = (label: string) => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: textTransformOptions,
    },
  },
});

const resolveTextValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(field, locale, streamDocument) || "";

const getTextStyle = (text: StyledTextProps): CSSProperties => ({
  fontSize: `${text.fontSize}px`,
  color: text.fontColor,
  fontWeight: text.fontWeight,
  textTransform: text.textTransform === "normal" ? "none" : text.textTransform,
});

const WellnessRetreatGallerySectionFields: Fields<WellnessRetreatGallerySectionProps> =
  {
    heading: createStyledTextField("Heading"),
    images: {
      label: "Images",
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
      },
      defaultItemProps: {
        altText: "Studio atmosphere image",
        image: {
          field: "",
          constantValue: {
            url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
            width: 1200,
            height: 800,
          },
          constantValueEnabled: true,
        },
      },
      getItemSummary: (item) => item.altText || "Gallery Image",
    },
  };

export const WellnessRetreatGallerySectionComponent: PuckComponent<
  WellnessRetreatGallerySectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveTextValue(
    props.heading.text,
    locale,
    streamDocument,
  );

  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-6">
          <h2
            className="m-0 leading-[0.94] tracking-[-0.03em]"
            style={{
              ...getTextStyle(props.heading),
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {resolvedHeading}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-[1.15fr_.85fr_.85fr]">
          {props.images.map((item, index) => {
            const resolvedImage = resolveComponentData(
              item.image,
              locale,
              streamDocument,
            );

            return (
              <div
                key={`${item.altText}-${index}`}
                className="min-h-[280px] overflow-hidden rounded-[4px] bg-[#f4f5f6]"
              >
                {resolvedImage ? (
                  <Image
                    image={resolvedImage}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WellnessRetreatGallerySection: ComponentConfig<WellnessRetreatGallerySectionProps> =
  {
    label: "Wellness Retreat Gallery Section",
    fields: WellnessRetreatGallerySectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Studio atmosphere",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 38,
        fontColor: "#101418",
        fontWeight: 600,
        textTransform: "normal",
      },
      images: [
        {
          altText: "Sunlit yoga studio moment",
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
        },
        {
          altText: "Yoga pose in warm light",
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
        },
        {
          altText: "Quiet seating corner in the studio",
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
        },
      ],
    },
    render: WellnessRetreatGallerySectionComponent,
  };
