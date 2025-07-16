import { useTranslation } from "react-i18next";
import {
  Image,
  HeadingLevel,
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  PageSection,
  Body,
  Heading,
  EntityField,
  Background,
  CTA,
  backgroundColors,
  VisibilityWrapper,
  ProductSectionType,
  ProductStruct,
  ComponentFields,
  resolveTranslatableRichText,
  resolveTranslatableString,
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  getAnalyticsScopeHash,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultProduct } from "../../internal/puck/constant-value-fields/ProductSection.tsx";

export interface ProductData {
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

export interface ProductStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for the individual product cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };
}

export interface ProductSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: ProductData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: ProductStyles;

  /** @internal  */
  analytics?: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const productSectionFields: Fields<ProductSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.sectionHeading", "Section Heading"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        }
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
        }
      ),
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
            }
          ),
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
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

const ProductCard = ({
  cardNumber,
  product,
  cardStyles,
  sectionHeadingLevel,
}: {
  cardNumber: number;
  product: ProductStruct;
  cardStyles: ProductSectionProps["styles"]["cards"];
  sectionHeadingLevel: HeadingLevel;
}) => {
  const { i18n } = useTranslation();
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
              {resolveTranslatableString(product.name, i18n.language)}
            </Heading>
          )}
          {product.category && (
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded w-fit"
            >
              <Body>
                {resolveTranslatableString(product.category, i18n.language)}
              </Body>
            </Background>
          )}
          {resolveTranslatableRichText(product.description, i18n.language)}
        </div>
        {product.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            variant="secondary"
            label={resolveTranslatableString(product.cta.label, i18n.language)}
            link={product.cta.link}
            linkType={product.cta.linkType}
            className="mt-auto"
          />
        )}
      </div>
    </Background>
  );
};

const ProductSectionWrapper = ({ data, styles }: ProductSectionProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const document = useDocument();
  const resolvedProducts = resolveYextEntityField(
    document,
    data.products,
    locale
  );
  const resolvedHeading = resolveTranslatableRichText(
    resolveYextEntityField(document, data.heading, locale),
    i18n.language
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
      {resolvedProducts?.products && (
        <EntityField
          displayName={pt("fields.products", "Products")}
          fieldId={data.products.field}
          constantValueEnabled={data.products.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedProducts.products.map((product, index) => (
              <ProductCard
                key={index}
                cardNumber={index}
                product={product}
                cardStyles={styles.cards}
                sectionHeadingLevel={styles.heading.level}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

/**
 * The Product Section is used to display a curated list of products in a dedicated section. It features a main heading and renders each product as an individual card, making it ideal for showcasing featured items, new arrivals, or bestsellers.
 * Avaliable on Location templates.
 */
export const ProductSection: ComponentConfig<ProductSectionProps> = {
  label: msg("components.productsSection", "Products Section"),
  fields: productSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: { en: "Featured Products", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      products: {
        field: "",
        constantValue: {
          products: [defaultProduct, defaultProduct, defaultProduct],
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
      heading: {
        level: 2,
        align: "left",
      },
      cards: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 3,
      },
    },
    analytics: {
      scope: "productsSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "productsSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <ProductSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
