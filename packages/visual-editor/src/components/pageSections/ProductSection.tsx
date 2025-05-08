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
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { LexicalRichText } from "@yext/pages-components";

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
          types: ["type.products_section"],
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
          aspectRatio={product.image.width / product.image.height}
        />
      )}
      <div className="p-8 gap-8 flex flex-col">
        <div className="gap-4 flex flex-col">
          {product.name && (
            <Heading level={3} className="mb-2">
              {product.name}
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
          {product.description?.html ? (
            <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
              <div
                dangerouslySetInnerHTML={{ __html: product.description.html }}
              />
            </div>
          ) : (
            <Body className="max-w-[290px]">
              <LexicalRichText
                serializedAST={JSON.stringify(product.description?.json) ?? ""}
              />
            </Body>
          )}
        </div>
        {product.cta && (
          <CTA
            variant="secondary"
            label={product.cta.label}
            link={product.cta.link}
            linkType={product.cta.linkType}
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
