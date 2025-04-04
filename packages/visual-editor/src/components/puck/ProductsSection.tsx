import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  BasicSelector,
  Body,
  CTA,
  Heading,
  HeadingProps,
  resolveYextEntityField,
  Section,
  themeManagerCn,
  ThemeOptions,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";
const PLACEHOLDER_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.";

export interface ProductsSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  cards: Array<{
    imageUrl: string;
    heading: string;
    category: string;
    description: string;
    cta: string;
  }>;
}

const productsSectionFields: Fields<ProductsSectionProps> = {
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
      cardBackgroundColor: BasicSelector(
        "Card Background Color",
        ThemeOptions.BACKGROUND_COLOR
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
  cards: {
    type: "array",
    label: "Cards",
    arrayFields: {
      imageUrl: {
        label: "Image URL",
        type: "text",
      },
      heading: {
        label: "Heading",
        type: "text",
      },
      category: {
        label: "Category",
        type: "text",
      },
      description: {
        label: "Description",
        type: "textarea",
      },
      cta: {
        label: "CTA",
        type: "text",
      },
    },
  },
};

const ProductCard = ({
  card,
  cardBackgroundColor,
}: {
  card: ProductsSectionProps["cards"][number];
  cardBackgroundColor?: BackgroundStyle;
}) => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border">
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          width={640}
          height={360}
          className="w-full object-cover"
        />
      )}
      <Section
        background={cardBackgroundColor}
        className="p-8 gap-8 flex flex-col"
      >
        <div className="gap-4 flex flex-col">
          {card.heading && (
            <Heading level={3} className="mb-2">
              {card.heading}
            </Heading>
          )}
          {card.category && (
            <div
              className={themeManagerCn(
                "components py-2 px-4 rounded-sm w-fit",
                backgroundColors.background5.value.bgColor,
                backgroundColors.background5.value.textColor
              )}
            >
              <Body>{card.category}</Body>
            </div>
          )}
          {card.description && (
            <Body className="line-clamp-5">{card.description}</Body>
          )}
        </div>
        {card.cta && (
          <CTA variant="secondary" label="Learn More" link={card.cta} />
        )}
      </Section>
    </div>
  );
};

const ProductsSectionWrapper: React.FC<ProductsSectionProps> = ({
  styles,
  sectionHeading,
  cards,
}) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <Section background={styles.backgroundColor}>
      <div className="flex flex-col gap-12">
        {resolvedHeading && (
          <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <ProductCard
              key={index}
              card={card}
              cardBackgroundColor={styles.cardBackgroundColor}
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

export const ProductsSection: ComponentConfig<ProductsSectionProps> = {
  label: "Products Section",
  fields: productsSectionFields,
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
    cards: [
      {
        imageUrl: PLACEHOLDER_IMAGE_URL,
        heading: "Product Title",
        category: "Category, Pricing, etc",
        description: PLACEHOLDER_DESCRIPTION,
        cta: "#",
      },
      {
        imageUrl: PLACEHOLDER_IMAGE_URL,
        heading: "Product Title",
        category: "Category, Pricing, etc",
        description: PLACEHOLDER_DESCRIPTION,
        cta: "#",
      },
      {
        imageUrl: PLACEHOLDER_IMAGE_URL,
        heading: "Product Title",
        category: "Category, Pricing, etc",
        description: PLACEHOLDER_DESCRIPTION,
        cta: "#",
      },
    ],
  },
  render: (props) => <ProductsSectionWrapper {...props} />,
};
