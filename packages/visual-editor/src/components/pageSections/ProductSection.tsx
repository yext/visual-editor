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
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface ProductSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    products: YextEntityField<ProductSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
  };
  analytics?: {
    scope?: string;
  };
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
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      cardBackgroundColor: YextField(
        msg("fields.cardBackgroundColor", "Card Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.headingLevel", "Level"), {
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
  key,
  product,
  backgroundColor,
  sectionHeadingLevel,
}: {
  key: number;
  product: ProductStruct;
  backgroundColor?: BackgroundStyle;
  sectionHeadingLevel: HeadingLevel;
}) => {
  const { i18n } = useTranslation();
  return (
    <Background
      className="flex flex-col rounded-lg overflow-hidden border h-full"
      background={backgroundColor}
    >
      {product.image ? (
        <Image
          image={product.image}
          layout={"auto"}
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
              level={3}
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
            eventName={`cta${key}`}
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
  const document = useDocument();
  const resolvedProducts = resolveYextEntityField(document, data.products);
  const resolvedHeading = resolveTranslatableRichText(
    resolveYextEntityField(document, data.heading),
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
            <Heading level={styles?.heading?.level ?? 2}>
              {resolvedHeading}
            </Heading>
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
                product={product}
                backgroundColor={styles.cardBackgroundColor}
                sectionHeadingLevel={styles.heading.level}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const ProductSection: ComponentConfig<ProductSectionProps> = {
  label: msg("components.productsSection", "Products Section"),
  fields: productSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: "Featured Products",
        constantValueEnabled: true,
      },
      products: {
        field: "",
        constantValue: {
          products: [],
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
      cardBackgroundColor: backgroundColors.background1.value,
      heading: {
        level: 2,
        align: "left",
      },
    },
    analytics: {
      scope: "productSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "productSection"}>
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <ProductSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
