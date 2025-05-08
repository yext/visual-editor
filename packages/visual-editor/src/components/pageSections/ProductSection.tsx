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
  data: {
    heading: YextEntityField<string>;
    products: YextEntityField<Products>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  liveVisibility: boolean;
}

const productSectionFields: Fields<ProductSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      products: YextField("Product Section", {
        type: "entityField",
        filter: {
          types: ["type.product"],
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
      {resolvedProducts && (
        <EntityField
          displayName="Products"
          fieldId={data.products.field}
          constantValueEnabled={data.products.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedProducts.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                backgroundColor={styles.cardBackgroundColor}
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
        constantValue: [],
        constantValueEnabled: false,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
      cardBackgroundColor: backgroundColors.background1.value,
      headingLevel: 2,
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <ProductSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
