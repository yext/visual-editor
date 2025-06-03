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
  MaybeRTF,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface ProductSectionProps {
  data: {
    heading: YextEntityField<string>;
    products: YextEntityField<ProductSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const productSectionFields: Fields<ProductSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Section Heading", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      products: YextField("Products", {
        type: "entityField",
        filter: {
          types: [ComponentFields.ProductSection.type],
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      cardBackgroundColor: YextField("Card Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
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
              {product.name}
            </Heading>
          )}
          {product.category && (
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded w-fit"
            >
              <Body>{product.category}</Body>
            </Background>
          )}
          <MaybeRTF data={product.description} />
        </div>
        {product.cta && (
          <CTA
            eventName={`cta${key}`}
            variant="secondary"
            label={product.cta.label}
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
  const document = useDocument();
  const resolvedProducts = resolveYextEntityField(document, data.products);
  const resolvedHeading = resolveYextEntityField(document, data.heading);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className="text-center">
            <Heading level={styles.headingLevel}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedProducts?.products && (
        <EntityField
          displayName="Products"
          fieldId={data.products.field}
          constantValueEnabled={data.products.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedProducts.products.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                backgroundColor={styles.cardBackgroundColor}
                sectionHeadingLevel={styles.headingLevel}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const ProductSection: ComponentConfig<ProductSectionProps> = {
  label: "Products Section",
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
      headingLevel: 2,
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
