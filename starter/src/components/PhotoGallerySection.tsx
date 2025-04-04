import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  BasicSelector,
  EntityField,
  Heading,
  HeadingLevel,
  ImageWrapperProps,
  resolveYextEntityField,
  Section,
  ThemeOptions,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  Image,
  ImageProps,
} from "@yext/visual-editor";
import { ImageWrapperFields, resolvedImageFields } from "./Image.js";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Dot,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { ArrowRight, ArrowLeft } from "lucide-react";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1000x570/png";

export interface PhotoGallerySectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  images: Array<ImageWrapperProps>;
}

const photoGallerySectionFields: Fields<PhotoGallerySectionProps> = {
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR,
      ),
    },
  },
  sectionHeading: {
    type: "object",
    label: "Section Heading",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  images: {
    type: "array",
    label: "Images",
    arrayFields: { ...ImageWrapperFields },
  },
};

const PhotoGallerySectionWrapper = ({
  styles,
  sectionHeading: sectionHeadingField,
  images,
}: PhotoGallerySectionProps) => {
  const document = useDocument();
  const sectionHeading = resolveYextEntityField(
    document,
    sectionHeadingField.text,
  );
  console.log(JSON.stringify(backgroundColors.backgroundColor));

  return (
    <Section
      aria-label="Photo Gallery Section"
      background={styles.backgroundColor}
    >
      <section className="flex flex-col gap-8 justify-center text-center">
        {sectionHeading && (
          <EntityField
            displayName="Heading Text"
            fieldId={sectionHeadingField.text.field}
            constantValueEnabled={sectionHeadingField.text.constantValueEnabled}
          >
            <Heading level={sectionHeadingField.level}>
              {sectionHeading}
            </Heading>
          </EntityField>
        )}
        <CarouselProvider
          className="flex flex-col md:flex-row gap-8"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          totalSlides={images.length}
          isIntrinsicHeight={true}
        >
          <ButtonBack className="hidden md:block my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 text-brand-primary disabled:text-brand-gray-300 disabled:cursor-default">
            <ArrowLeft className="h-10 w-20" />
          </ButtonBack>
          <div className="flex flex-col gap-8">
            <Slider className="md:px-8">
              {images.map((item, idx) => {
                const resolvedImage = resolveYextEntityField<
                  ImageProps["image"]
                >(document, item.image);
                if (!resolvedImage) return;
                return (
                  <Slide index={idx} key={idx}>
                    <Image
                      image={resolvedImage}
                      layout={item.layout}
                      width={item.width}
                      height={item.height}
                      aspectRatio={item.aspectRatio}
                    />
                  </Slide>
                );
              })}
            </Slider>
            <div className="flex justify-between items-center px-4 md:hidden gap-6 w-full">
              <ButtonBack className="pointer-events-auto w-8 h-8 text-brand-primary disabled:text-brand-gray-300 disabled:cursor-default">
                <ArrowLeft className="h-6 w-6" />
              </ButtonBack>
              <div className="flex gap-2 justify-center flex-grow w-full">
                {images.map((_, idx) => (
                  <Dot
                    key={idx}
                    slide={idx}
                    className=" h-1.5 w-full rounded-full bg-red-300 disabled:bg-brand-primary disabled:cursor-default"
                  />
                ))}
              </div>
              <ButtonNext className="pointer-events-auto w-8 h-8 text-brand-primary disabled:text-brand-gray-300 disabled:cursor-default">
                <ArrowRight className="h-6 w-6" />
              </ButtonNext>
            </div>
            <div className="hidden md:flex justify-center">
              {images.map((_, idx) => {
                const afterStyles =
                  "after:content-[' '] after:py-2 after:block";
                return (
                  <div key={idx} className="w-16 flex justify-center">
                    <Dot
                      slide={idx}
                      className={`text-center w-16 mx-2 basis-0 flex-grow h-1 rounded-full disabled:bg-brand-primary disabled:cursor-default ${afterStyles}`}
                    ></Dot>
                  </div>
                );
              })}
            </div>
          </div>

          <ButtonNext className="hidden md:block pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 text-brand-primary disabled:text-brand-gray-300 disabled:cursor-default my-auto">
            <ArrowRight className="h-10 w-20" />
          </ButtonNext>
        </CarouselProvider>
      </section>
    </Section>
  );
};

export const PhotoGallerySection: ComponentConfig<PhotoGallerySectionProps> = {
  label: "Photo Gallery",
  fields: photoGallerySectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "",
        constantValueEnabled: undefined,
      },
      level: 1,
    },
    images: [
      {
        image: {
          field: "",
          constantValue: {
            alternateText: "img1",
            height: 582,
            width: 996,
            url: PLACEHOLDER_IMAGE_URL,
          },
          constantValueEnabled: true,
        },
        layout: "auto",
        aspectRatio: 1.78,
      },
      {
        image: {
          field: "",
          constantValue: {
            alternateText: "img2",
            height: 582,
            width: 996,
            url: PLACEHOLDER_IMAGE_URL,
          },
          constantValueEnabled: true,
        },
        layout: "auto",
        aspectRatio: 1.78,
      },
    ],
  },
  resolveFields(data) {
    const layout = data.props.images?.[0]?.layout ?? "auto";
    return {
      ...photoGallerySectionFields,
      images: {
        ...photoGallerySectionFields.images,
        arrayFields: resolvedImageFields(layout),
      },
    };
  },
  render: (props) => <PhotoGallerySectionWrapper {...props} />,
};
