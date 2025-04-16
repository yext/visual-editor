import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  Heading,
  handleResolveFieldsForCollections,
  Body,
  Background,
  backgroundColors,
  BackgroundStyle,
  EntityField,
  CTA,
  CTAProps,
  Image,
  ImageWrapperProps,
  YextCollection,
  resolveYextSubfield,
  YextField,
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PersonCardProps {
  card?: {
    headshot?: YextEntityField<ImageWrapperProps>;
    name?: YextEntityField<string>;
    title?: YextEntityField<string>;
    phone?: YextEntityField<string>;
    email?: YextEntityField<string>;
    cta?: YextEntityField<CTAProps>;
  };
  styles: {
    cardBackgroundColor?: BackgroundStyle;
  };
  collection?: YextCollection;
}

const PersonCardItemFields: Fields<PersonCardProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      cardBackgroundColor: YextField("Card Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
};

const PersonCardItem = ({
  document,
  card,
  cardBackgroundColor,
}: {
  document: any;
  card?: PersonCardProps["card"];
  cardBackgroundColor?: BackgroundStyle;
}) => {
  const resolvedHeadshot = resolveYextSubfield(document, card?.headshot);
  const resolvedImage = resolveYextSubfield(document, resolvedHeadshot?.image);
  const resolvedName = resolveYextSubfield(document, card?.name);
  const resolvedTitle = resolveYextSubfield(document, card?.title);
  const resolvedPhone = resolveYextSubfield(document, card?.phone);
  const resolvedEmail = resolveYextSubfield(document, card?.email);
  const resolvedCTA = resolveYextSubfield(document, card?.cta);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border bg-white">
      <Background background={cardBackgroundColor} className="flex p-8 gap-6">
        <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
          {resolvedImage && (
            <EntityField
              displayName="Headshot"
              fieldId={card?.headshot?.field}
              constantValueEnabled={
                resolvedHeadshot?.image?.constantValueEnabled
              }
            >
              <Image image={resolvedImage} layout="auto" aspectRatio={1} />
            </EntityField>
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          {resolvedName && (
            <EntityField
              displayName="Name"
              fieldId={card?.name?.field}
              constantValueEnabled={card?.name?.constantValueEnabled}
            >
              <Heading level={3}>{resolvedName}</Heading>
            </EntityField>
          )}
          {resolvedTitle && (
            <EntityField
              displayName="Title"
              fieldId={card?.title?.field}
              constantValueEnabled={card?.title?.constantValueEnabled}
            >
              <Body variant="base">{resolvedTitle}</Body>
            </EntityField>
          )}
        </div>
      </Background>
      <hr className="border" />
      <Background
        background={backgroundColors.background1.value}
        className="p-8"
      >
        <div className="flex flex-col gap-4">
          {resolvedPhone && (
            <EntityField
              displayName="Phone"
              fieldId={resolvedPhone}
              constantValueEnabled={card?.phone?.constantValueEnabled}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-palette-primary-light flex items-center justify-center">
                  <FaPhone className="w-3 h-3 text-black" />
                </div>
                <CTA
                  link={resolvedPhone}
                  label={resolvedPhone}
                  linkType="PHONE"
                  variant="link"
                />
              </div>
            </EntityField>
          )}
          {resolvedEmail && (
            <EntityField
              displayName="Email"
              fieldId={card?.email?.field}
              constantValueEnabled={card?.email?.constantValueEnabled}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-palette-primary-light flex items-center justify-center">
                  <FaEnvelope />
                </div>
                <CTA
                  link={resolvedEmail}
                  label={resolvedEmail}
                  linkType="EMAIL"
                  variant="link"
                />
              </div>
            </EntityField>
          )}
          {resolvedCTA && (
            <EntityField
              displayName="CTA"
              fieldId={card?.cta?.field}
              constantValueEnabled={card?.cta?.constantValueEnabled}
            >
              <div className="flex justify-start gap-2">
                <CTA
                  label={resolvedCTA?.label}
                  link={resolvedCTA?.link || "#"}
                  linkType={resolvedCTA?.linkType}
                  variant="link"
                />
              </div>
            </EntityField>
          )}
        </div>
      </Background>
    </div>
  );
};

const PersonCardComponent = (props: PersonCardProps) => {
  const { card, styles, collection } = props;
  const document = useDocument();

  if (!collection || collection.items.constantValueEnabled) {
    return (
      <PersonCardItem
        document={document}
        card={{
          headshot: card?.headshot,
          name: card?.name,
          title: card?.title,
          phone: card?.phone,
          email: card?.email,
          cta: card?.cta,
        }}
        cardBackgroundColor={styles.cardBackgroundColor}
      />
    );
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="max-w-pageSection-contentWidth mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        .map((item, i) => {
          return (
            <PersonCardItem
              key={i}
              document={item}
              card={{
                headshot: card?.headshot,
                name: card?.name,
                title: card?.title,
                phone: card?.phone,
                email: card?.email,
                cta: card?.cta,
              }}
              cardBackgroundColor={styles.cardBackgroundColor}
            />
          );
        })}
    </div>
  );
};

export const PersonCard: ComponentConfig<PersonCardProps> = {
  label: "Person Card",
  fields: PersonCardItemFields,
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
          headshot: YextField<any, ImageWrapperProps>("Headshot", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.image"],
            },
          }),
          name: YextField<any, string>("Name", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
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
          email: YextField<any, string>("Email", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
              allowList: ["emails"],
            },
          }),
          phone: YextField<any, string>("Phone", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.phone"],
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
    } as Fields<PersonCardProps>;
  },
  defaultProps: {
    card: {
      headshot: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          image: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              width: 360,
              height: 360,
            },
          },
          layout: "auto",
        },
      },
      name: {
        field: "",
        constantValue: "First Last",
        constantValueEnabled: true,
      },
      title: {
        field: "",
        constantValue: "Associate Agent",
        constantValueEnabled: true,
      },
      phone: {
        field: "",
        constantValue: "(555) 555-5555",
        constantValueEnabled: true,
      },
      email: {
        field: "",
        constantValue: "johndoe@[company].com",
        constantValueEnabled: true,
      },
      cta: {
        field: "",
        constantValue: {
          label: "Visit Profile",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      cardBackgroundColor: backgroundColors.background1.value,
    },
  },
  render: (props) => <PersonCardComponent {...props} />,
};
