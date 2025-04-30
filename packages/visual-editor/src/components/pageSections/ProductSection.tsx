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
} from "@yext/visual-editor";
import {
  ComplexImageType,
  CTA as CTAType,
  LexicalRichText,
} from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";

/** TODO remove types when spruce is ready */
type Products = Array<ProductStruct>;

type ProductStruct = {
  image?: ComplexImageType;
  heading?: string; // single line text
  description?: RTF2;
  category?: string; // single line text
  CTA?: CTAType;
};

type RTF2 = {
  json?: Record<string, any>;
};
/** end of hardcoded types */

export interface ProductSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  products: YextEntityField<Products>;
}

const productSectionFields: Fields<ProductSectionProps> = {
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
    },
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  products: YextField("Product Section", {
    type: "entityField",
    filter: {
      types: ["type.product"],
    },
  }),
};

const ProductCard = ({
  product,
  backgroundColor,
}: {
  product: ProductStruct;
  backgroundColor?: BackgroundStyle;
}) => {
  return (
    <Background
      className="flex flex-col justify-between rounded-lg overflow-hidden border h-full"
      background={backgroundColor}
    >
      {product.image && (
        <Image
          image={product.image}
          layout={"auto"}
          aspectRatio={product.image.image.width / product.image.image.height}
        />
      )}
      <div className="p-8 gap-8 flex flex-col">
        <div className="gap-4 flex flex-col">
          {product.heading && (
            <Heading level={3} className="mb-2">
              {product.heading}
            </Heading>
          )}
          {product.category && (
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded-sm w-fit"
            >
              <Body>{product.category}</Body>
            </Background>
          )}
          {product.description && (
            <Body className="max-w-[290px]">
              <LexicalRichText
                serializedAST={JSON.stringify(product.description.json) ?? ""}
              />
            </Body>
          )}
        </div>
        {product.CTA && (
          <CTA
            variant="secondary"
            label={product.CTA.label}
            link={product.CTA.link}
            linkType={product.CTA.linkType}
          />
        )}
      </div>
    </Background>
  );
};

const ProductSectionWrapper = ({
  styles,
  sectionHeading,
  products,
}: ProductSectionProps) => {
  const document = useDocument();
  const resolvedProducts = resolveYextEntityField(document, products);
  const resolvedHeading = resolveYextEntityField(document, sectionHeading.text);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <div className="text-center">
          <EntityField
            displayName="Heading Text"
            fieldId={sectionHeading.text.field}
            constantValueEnabled={sectionHeading.text.constantValueEnabled}
          >
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </EntityField>
        </div>
      )}
      {resolvedProducts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resolvedProducts.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              backgroundColor={styles.cardBackgroundColor}
            />
          ))}
        </div>
      )}
    </PageSection>
  );
};

export const ProductSection: ComponentConfig<ProductSectionProps> = {
  label: "Products Section",
  fields: productSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
      cardBackgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Featured Products",
        constantValueEnabled: true,
      },
      level: 2,
    },
    products: {
      field: "",
      constantValue: [],
      constantValueEnabled: false,
    },
  },
  render: (props) => <ProductSectionWrapper {...props} />,
};
