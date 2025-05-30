import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  Heading,
  Body,
  Image,
  Background,
  backgroundColors,
  YextCollection,
  resolveYextSubfield,
  handleResolveFieldsForCollections,
  CTAProps,
  EntityField,
  CTA,
  YextField,
  i18n,
} from "@yext/visual-editor";
import { ImageType } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/360x200";

export type InsightCardProps = {
  card?: {
    image: YextEntityField<ImageType>;
    title: YextEntityField<string>;
    category: YextEntityField<string>;
    date: YextEntityField<string>;
    description: YextEntityField<string>;
    cta: YextEntityField<CTAProps>;
  };
  collection?: YextCollection;
};

const InsightCardItemFields: Fields<InsightCardProps> = {};

const InsightCardItem = ({
  document,
  card,
}: {
  document: any;
  card: InsightCardProps["card"];
}) => {
  const resolvedImage = resolveYextSubfield(document, card?.image);
  const resolvedTitle = resolveYextSubfield<string>(document, card?.title);
  const resolvedCategory = resolveYextSubfield<string>(
    document,
    card?.category
  );
  const resolvedDate = resolveYextSubfield<string>(document, card?.date);
  const resolvedDescription = resolveYextSubfield<string>(
    document,
    card?.description
  );
  const resolvedCTA = resolveYextSubfield<CTAProps>(document, card?.cta);
  return (
    <Background
      className="rounded-lg h-full"
      background={backgroundColors.background1.value}
    >
      {resolvedImage && (
        <EntityField
          displayName={i18n("image", { defaultValue: "Image" })}
          fieldId={card?.image?.field}
          constantValueEnabled={card?.image?.constantValueEnabled}
        >
          <Image
            image={resolvedImage}
            layout="auto"
            className="rounded-[inherit]"
          />
        </EntityField>
      )}
      <div className="flex flex-col gap-8 p-8">
        <div className="flex flex-col gap-4">
          {(resolvedCategory || resolvedDate) && (
            <div
              className={`flex ${resolvedCategory && resolvedDate && `gap-4`}`}
            >
              <EntityField
                displayName={i18n("category", { defaultValue: "Category" })}
                fieldId={card?.category?.field}
                constantValueEnabled={card?.category?.constantValueEnabled}
              >
                <Body>{resolvedCategory}</Body>
              </EntityField>
              {resolvedCategory && resolvedDate && <Body>|</Body>}
              <EntityField
                displayName={i18n("date", { defaultValue: "Date" })}
                fieldId={card?.date?.field}
                constantValueEnabled={card?.date?.constantValueEnabled}
              >
                <Body>{resolvedDate}</Body>
              </EntityField>
            </div>
          )}
          {resolvedTitle && (
            <EntityField
              displayName={i18n("insightTitle", {
                defaultValue: "Insight Title",
              })}
              fieldId={card?.title?.field}
              constantValueEnabled={card?.title?.constantValueEnabled}
            >
              <Heading level={3} className="text-palette-primary-dark">
                {resolvedTitle}
              </Heading>
            </EntityField>
          )}
          {resolvedDescription && (
            <EntityField
              displayName={i18n("description", { defaultValue: "Description" })}
              fieldId={card?.description?.field}
              constantValueEnabled={card?.description?.constantValueEnabled}
            >
              <Body>{resolvedDescription}</Body>
            </EntityField>
          )}
        </div>
        {resolvedCTA?.link && (
          <EntityField
            displayName={i18n("cta", { defaultValue: "CTA" })}
            fieldId={card?.cta.field}
            constantValueEnabled={card?.cta.constantValueEnabled}
          >
            <CTA
              variant={"link"}
              label={resolvedCTA.label}
              link={resolvedCTA.link}
              linkType={resolvedCTA.linkType ?? "URL"}
            />
          </EntityField>
        )}
      </div>
    </Background>
  );
};

const InsightCardComponent = (props: InsightCardProps) => {
  const { card, collection } = props;
  const document = useDocument();

  // If not in a collection, return single card
  if (!collection || collection.items.constantValueEnabled) {
    return <InsightCardItem document={document} card={card} />;
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="max-w-pageSection-contentWidth mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        ?.map((item, i) => {
          return <InsightCardItem key={i} document={item} card={card} />;
        })}
    </div>
  );
};

export const InsightCard: ComponentConfig<InsightCardProps> = {
  label: "Insight Card",
  fields: InsightCardItemFields,
  resolveFields: (data, params) => {
    // Set the collection prop and determine how to update fields
    const { shouldReturnLastFields, isCollection, directChildrenFilter } =
      handleResolveFieldsForCollections(data, params);

    // Unnecessary field updates can lead to the fields losing focus
    if (shouldReturnLastFields) {
      return params.lastFields;
    }

    // Update each subfield based on isCollection
    return {
      ...params.lastFields,
      card: YextField("Card", {
        type: "object",
        objectFields: {
          image: YextField<any, ImageType>("Image", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.image"],
            },
          }),
          title: YextField<any, string>("Title", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          category: YextField<any, string>("Category", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          date: YextField<any, string>("Date", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          description: YextField<any, string>("Description", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          cta: YextField<any, CTAProps>("CTA", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.cta"],
            },
          }),
        },
      }),
    };
  },
  defaultProps: {
    card: {
      image: {
        field: "",
        constantValue: { height: 200, width: 360, url: PLACEHOLDER_IMAGE_URL },
        constantValueEnabled: true,
      },
      title: {
        field: "",
        constantValue: "Insight Name Lorem Ipsum",
        constantValueEnabled: true,
      },
      category: {
        field: "",
        constantValue: "Category",
        constantValueEnabled: true,
      },
      date: {
        field: "",
        constantValue: "August 2, 2022",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue:
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters",
        constantValueEnabled: true,
      },
      cta: {
        field: "",
        constantValue: {
          label: "Read more",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
    },
  },
  render: (props) => <InsightCardComponent {...props} />,
};
