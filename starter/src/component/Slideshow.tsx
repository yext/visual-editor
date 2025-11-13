import { ComponentConfig, Fields } from "@measured/puck";
import {
  Background,
  BackgroundStyle,
  Body,
  CTA,
  CTAVariant,
  ComponentFields,
  EntityField,
  Heading,
  HeadingLevel,
  Image,
  PageSection,
  ProductSectionProps,
  ProductSectionType,
  ProductStruct,
  ThemeOptions,
  TranslatableString,
  VisibilityWrapper,
  YextEntityField,
  YextField,
  backgroundColors,
  imgSizesHelper,
  msg,
  pt,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Dot,
} from "pure-react-carousel";
//@ts-ignore
import "pure-react-carousel/dist/react-carousel.es.css";
import { DynamicChildColors } from "./DynamicChildColors";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export const defaultProduct: ProductStruct = {
  image: {
    alternateText: "",
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  name: { en: "Product Title", hasLocalizedValue: "true" },
  category: {
    en: "Category, Pricing, etc",
    hasLocalizedValue: "true",
  },
  description: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    hasLocalizedValue: "true",
  },
  cta: {
    link: "#",
    label: { en: "Learn More", hasLocalizedValue: "true" },
    linkType: "URL",
    ctaType: "textAndLink",
  },
};
export interface SlideshowData {
  /**
   * The main heading for the entire products section.
   * @defaultValue "Featured Products" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the product data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder products.
   */
  products: YextEntityField<ProductSectionType>;
}

export interface SlideshowStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;
  visibleSlides: 1 | 2 | 3;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for the individual product cards. */
  cards: {
    /** The h tag level of each product card's title */
    headingLevel: HeadingLevel;
    /** The background color of each product card */
    backgroundColor?: BackgroundStyle;
    /** The CTA variant to use in each product card */
    ctaVariant: CTAVariant;
  };
}

export interface SlideshowSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: SlideshowData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: SlideshowStyles;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;

  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

const SlideshowSectionFields: Fields<SlideshowSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.sectionHeading", "Section Heading"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        },
      ),
      products: YextField(msg("fields.products", "Products"), {
        type: "entityField",
        filter: {
          types: [ComponentFields.ProductSection.type],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        },
      ),
      visibleSlides: YextField(msg("fields.visibleSlides", "Visible Slides"), {
        type: "radio",
        options: [
          { label: "2", value: 2 },
          { label: "3", value: 3 },
        ],
      }),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
      cards: YextField(msg("fields.cards", "Cards"), {
        type: "object",
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "BACKGROUND_COLOR",
            },
          ),
          ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
            type: "radio",
            options: "CTA_VARIANT",
          }),
        },
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    },
  ),
};
const ProductCard = ({
  cardNumber,
  product,
  cardStyles,
  sectionHeadingLevel,
  ctaVariant,
}: {
  cardNumber: number;
  product: ProductStruct;
  cardStyles: ProductSectionProps["styles"]["cards"];
  sectionHeadingLevel: HeadingLevel;
  ctaVariant: CTAVariant;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  return (
    <Background
      className="flex flex-col rounded-lg overflow-hidden border h-full"
      background={cardStyles.backgroundColor}
    >
      {product.image ? (
        <Image
          image={product.image}
          aspectRatio={1.778} // 16:9
          className="h-[200px]"
          sizes={imgSizesHelper({
            base: "calc(100vw - 32px)",
            md: "calc((maxWidth - 32px) / 2)",
            lg: "calc((maxWidth - 32px) / 3)",
          })}
        />
      ) : (
        <div className="sm:h-[200px]" />
      )}
      <div className="p-8 gap-8 flex flex-col flex-grow">
        <div className="gap-4 flex flex-col">
          {product.name && (
            <Heading
              level={cardStyles.headingLevel}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
              className="mb-2"
            >
              {resolveComponentData(
                product.name,
                i18n.language,
                streamDocument,
              )}
            </Heading>
          )}
          {product.category && (
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded w-fit"
            >
              <Body>
                {resolveComponentData(
                  product.category,
                  i18n.language,
                  streamDocument,
                )}
              </Body>
            </Background>
          )}
          {product?.description &&
            resolveComponentData(product.description, i18n.language)}
        </div>
        {product.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            variant={ctaVariant}
            label={
              product.cta.label
                ? resolveComponentData(
                    product.cta.label,
                    i18n.language,
                    streamDocument,
                  )
                : undefined
            }
            link={resolveComponentData(
              product.cta.link,
              i18n.language,
              streamDocument,
            )}
            linkType={product.cta.linkType}
            ctaType={product.cta.ctaType}
            presetImageType={product.cta.presetImageType}
            className="mt-auto"
          />
        )}
      </div>
    </Background>
  );
};
const SlideshowComponent = ({ data, styles }: SlideshowSectionProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedProducts = resolveComponentData(
    data.products,
    locale,
    streamDocument,
  );
  const resolvedHeading = resolveComponentData(
    data.heading,
    locale,
    streamDocument,
  );

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";
  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.heading", "Heading")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedProducts && (
        <>
          <CarouselProvider
            visibleSlides={styles.visibleSlides}
            className="hidden md:flex flex-col gap-8 "
            naturalSlideWidth={100}
            naturalSlideHeight={100}
            totalSlides={resolvedProducts.products.length}
            isIntrinsicHeight={true}
          >
            <div className="hidden md:flex justify-center w-full">
              <div
                className="flex items-center gap-2"
                style={{
                  width: `${1000 + 96}px`,
                  maxWidth: "calc(100vw - 2rem)",
                  minWidth: "fit-content",
                }}
              >
                <DynamicChildColors category="arrow">
                  <ButtonBack className="my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
                    <FaArrowLeft className="h-10 w-fit" />
                  </ButtonBack>
                </DynamicChildColors>
                <div className="flex flex-col gap-y-8 items-center w-auto">
                  <EntityField
                    displayName={pt("fields.images", "Images")}
                    fieldId={data.products.field}
                    constantValueEnabled={data.products.constantValueEnabled}
                  >
                    <Slider
                      classNameTray="gap-8"
                      className="w-auto"
                      style={{
                        width: `min(${1000}px, calc(100vw - 6rem))`,
                        maxWidth: "100%",
                      }}
                    >
                      {resolvedProducts.products.map((product, idx) => {
                        return (
                          <Slide index={idx} key={idx}>
                            <div className="flex justify-center">
                              <ProductCard
                                key={idx}
                                cardNumber={idx}
                                product={product}
                                cardStyles={styles.cards}
                                sectionHeadingLevel={styles.heading.level}
                                ctaVariant={styles.cards.ctaVariant}
                              />
                            </div>
                          </Slide>
                        );
                      })}
                    </Slider>
                  </EntityField>
                  <div className="hidden md:flex justify-center">
                    {Array.from({
                      length: resolvedProducts.products.length - 1,
                    }).map((_, idx) => {
                      const afterStyles =
                        "after:content-[' '] after:py-2 after:block";
                      return (
                        <div key={idx} className="w-16 flex justify-center">
                          <DynamicChildColors category="slide">
                            <Dot
                              slide={idx}
                              className={`text-center w-16 mx-2 basis-0 flex-grow h-1 rounded-full disabled:cursor-default ${afterStyles}`}
                            ></Dot>
                          </DynamicChildColors>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <DynamicChildColors category="arrow">
                  <ButtonNext className="pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default my-auto">
                    <FaArrowRight className="h-10 w-fit" />
                  </ButtonNext>
                </DynamicChildColors>
              </div>
            </div>
          </CarouselProvider>
          <CarouselProvider
            className="md:hidden flex flex-col gap-8 "
            naturalSlideWidth={100}
            naturalSlideHeight={100}
            totalSlides={resolvedProducts.products.length}
            isIntrinsicHeight={true}
          >
            <div className="flex justify-center w-full">
              <div
                className="flex items-center gap-2 w-full justify-between"
                style={{
                  maxWidth: "calc(100vw)",
                  minWidth: "fit-content",
                }}
              >
                <DynamicChildColors category="arrow">
                  <ButtonBack className="my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
                    <FaArrowLeft className="h-10 w-fit" />
                  </ButtonBack>
                </DynamicChildColors>
                <div className="flex flex-col gap-y-8 items-center w-auto">
                  <EntityField
                    displayName={pt("fields.images", "Images")}
                    fieldId={data.products.field}
                    constantValueEnabled={data.products.constantValueEnabled}
                  >
                    <Slider
                      classNameTray="gap-8"
                      className="w-auto"
                      style={{
                        width: `min(${1000}px, calc(100vw - 6rem))`,
                        maxWidth: "100%",
                      }}
                    >
                      {resolvedProducts.products.map((product, idx) => {
                        return (
                          <Slide index={idx} key={idx}>
                            <div className="flex justify-center">
                              <ProductCard
                                key={idx}
                                cardNumber={idx}
                                product={product}
                                cardStyles={styles.cards}
                                sectionHeadingLevel={styles.heading.level}
                                ctaVariant={styles.cards.ctaVariant}
                              />
                            </div>
                          </Slide>
                        );
                      })}
                    </Slider>
                  </EntityField>
                  <div className="hidden md:flex justify-center">
                    {Array.from({
                      length: resolvedProducts.products.length - 1,
                    }).map((_, idx) => {
                      const afterStyles =
                        "after:content-[' '] after:py-2 after:block";
                      return (
                        <div key={idx} className="w-16 flex justify-center">
                          <DynamicChildColors category="slide">
                            <Dot
                              slide={idx}
                              className={`text-center w-16 mx-2 basis-0 flex-grow h-1 rounded-full disabled:cursor-default ${afterStyles}`}
                            ></Dot>
                          </DynamicChildColors>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <DynamicChildColors category="arrow">
                  <ButtonNext className="pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default my-auto">
                    <FaArrowRight className="h-10 w-fit" />
                  </ButtonNext>
                </DynamicChildColors>
              </div>
            </div>
          </CarouselProvider>
        </>
      )}
    </PageSection>
  );
};

export const defaultSlideshowProps: SlideshowSectionProps = {
  data: {
    heading: {
      field: "",
      constantValue: { en: "Featured Products", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    products: {
      field: "",
      constantValue: {
        products: Array.from({ length: 4 }).map((_, i) => {
          return {
            ...defaultProduct,
            name: `${defaultProduct?.name?.en ?? "Product"} ${i + 1}`,
          };
        }),
      },
      constantValueEnabled: true,
    },
  },
  styles: {
    backgroundColor: backgroundColors.background2.value,
    visibleSlides: 2,
    heading: {
      level: 2,
      align: "left",
    },
    cards: {
      backgroundColor: backgroundColors.background1.value,
      headingLevel: 3,
      ctaVariant: "primary",
    },
  },
  liveVisibility: true,
};

/**
 * The Slideshow Section component displays a single, translatable line of rich text. It's designed to be used as a simple, full-width Slideshow on a page.
 * Available on Location templates.
 */
export const SlideshowSection: ComponentConfig<{
  props: SlideshowSectionProps;
}> = {
  label: msg("components.SlideshowSection", "Slideshow Section Local"),
  fields: SlideshowSectionFields,
  defaultProps: defaultSlideshowProps,
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <SlideshowComponent {...props} />
    </VisibilityWrapper>
  ),
};
