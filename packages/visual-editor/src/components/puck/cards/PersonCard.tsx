import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Phone as PhoneIcon } from "lucide-react";
import mailIcon from "../assets/mail_outline.svg";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  BasicSelector,
  ThemeOptions,
  Heading,
  handleResolveFieldsForCollections,
  Body,
  PageSection,
  backgroundColors,
  BackgroundStyle,
  EntityField,
  CTA,
  CTAProps,
  Image,
  ImageWrapperProps,
  YextCollection,
  resolveYextSubfield,
  YextCollectionSubfieldSelector,
} from "../../../index.js";

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
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      cardBackgroundColor: BasicSelector(
        "Card Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
    },
  },
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
      <PageSection background={cardBackgroundColor} className="flex p-8 gap-6">
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
      </PageSection>
      <hr className="border" />
      <PageSection
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
                  <PhoneIcon className="w-3 h-3 text-black" />
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
                  <img
                    src={mailIcon}
                    alt="Email"
                    className="w-3 h-3 [filter:brightness(0)]"
                  />
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
      </PageSection>
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
    <div className="flex justify-between max-w-pageSection-maxWidth">
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
      card: {
        label: "Card",
        type: "object",
        objectFields: {
          headshot: YextCollectionSubfieldSelector<any, ImageWrapperProps>({
            label: "Headshot",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.image"],
            },
          }),
          name: YextCollectionSubfieldSelector<any, string>({
            label: "Name",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          title: YextCollectionSubfieldSelector<any, string>({
            label: "Title",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          email: YextCollectionSubfieldSelector<any, string>({
            label: "Email",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
              allowList: ["emails"],
            },
          }),
          phone: YextCollectionSubfieldSelector<any, string>({
            label: "Phone",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.phone"],
            },
          }),
          cta: YextCollectionSubfieldSelector<any, CTAProps>({
            label: "CTA",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.cta"],
            },
          }),
        },
      },
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
        constantValue: "jkelley@[company].com",
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
