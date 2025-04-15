import * as React from "react";
import { ComponentConfig, Fields, ArrayField } from "@measured/puck";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  Heading,
  HeadingLevel,
  Body,
  PageSection,
  backgroundColors,
  BackgroundStyle,
  EntityField,
  CTA,
  CTAProps,
  Image,
  ImageProps,
  ImageWrapperProps,
  Background,
  YextField,
} from "@yext/visual-editor";
import { resolvedImageFields, ImageWrapperFields } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PeopleProps {
  backgroundColor?: BackgroundStyle;
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  people: Array<{
    headshot: ImageWrapperProps;
    name: YextEntityField<string>;
    title: YextEntityField<string>;
    phone: YextEntityField<string>;
    email: YextEntityField<string>;
    cta: YextEntityField<CTAProps>;
  }>;
}

const peopleFields: Fields<PeopleProps> = {
  backgroundColor: YextField("Background Color", {
    type: "select",
    hasSearch: true,
    options: "BACKGROUND_COLOR",
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<string>("Text", {
        type: "entity",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  people: YextField("People", {
    type: "array",
    arrayFields: {
      headshot: YextField("Headshot", {
        type: "object",
        objectFields: {
          ...ImageWrapperFields,
        },
      }),
      name: YextField<string>("Name", {
        type: "entity",
        filter: {
          types: ["type.string"],
        },
      }),
      title: YextField<string>("Title", {
        type: "entity",
        filter: {
          types: ["type.string"],
        },
      }),
      number: YextField<string>("Phone Number", {
        type: "entity",
        filter: {
          types: ["type.phone"],
        },
      }),
      email: YextField<string>("Email", {
        type: "entity",
        filter: {
          types: ["type.string"],
          allowList: ["emails"],
        },
      }),
      cta: YextField<CTAProps>("CTA", {
        type: "entity",
        filter: {
          types: ["type.cta"],
        },
      }),
    },
  }),
};

interface PersonCardProps {
  headshot: ImageWrapperProps;
  name: YextEntityField<string>;
  title: YextEntityField<string>;
  phone: YextEntityField<string>;
  email: YextEntityField<string>;
  cta: YextEntityField<CTAProps>;
  index: number;
}

const PersonCard: React.FC<PersonCardProps> = ({
  headshot,
  name,
  title,
  phone,
  email,
  cta,
  index,
}) => {
  const document = useDocument();
  const resolvedHeadshot = resolveYextEntityField<ImageProps["image"]>(
    document,
    headshot?.image
  );
  const resolvedName = resolveYextEntityField<string>(document, name);
  const resolvedTitle = resolveYextEntityField<string>(document, title);
  const resolvedPhone = resolveYextEntityField<string>(document, phone);
  const resolvedEmail = resolveYextEntityField<string>(document, email);
  const resolvedCTA = resolveYextEntityField<CTAProps>(document, cta);

  return (
    <Background
      key={index}
      background={backgroundColors.background1.value}
      className="flex flex-col rounded-lg overflow-hidden border"
    >
      <div className="flex p-8 gap-6">
        <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
          {resolvedHeadshot && (
            <EntityField
              displayName="Headshot"
              fieldId={headshot?.image?.field}
              constantValueEnabled={headshot?.image?.constantValueEnabled}
            >
              <Image image={resolvedHeadshot} layout="auto" aspectRatio={1} />
            </EntityField>
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          {resolvedName && (
            <EntityField
              displayName="Name"
              fieldId={name.field}
              constantValueEnabled={name.constantValueEnabled}
            >
              <Heading level={3}>{resolvedName}</Heading>
            </EntityField>
          )}
          {resolvedTitle && (
            <EntityField
              displayName="Title"
              fieldId={title.field}
              constantValueEnabled={title.constantValueEnabled}
            >
              <Body variant="base">{resolvedTitle}</Body>
            </EntityField>
          )}
        </div>
      </div>
      <hr className="border" />
      <div className="p-8">
        <div className="flex flex-col gap-4">
          {resolvedPhone && (
            <EntityField
              displayName="Phone"
              fieldId={phone.field}
              constantValueEnabled={phone.constantValueEnabled}
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
              fieldId={email.field}
              constantValueEnabled={email.constantValueEnabled}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-palette-primary-light flex items-center justify-center">
                  <FaEnvelope className="w-3 h-3 [filter:brightness(0)]" />
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
              fieldId={cta.field}
              constantValueEnabled={cta.constantValueEnabled}
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
      </div>
    </Background>
  );
};

const PeopleWrapper: React.FC<PeopleProps> = (props) => {
  const { backgroundColor, sectionHeading, people } = props;
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <PageSection
      background={backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <div className="text-center">
          <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {people.map((person, index) => (
          <PersonCard key={index} {...person} index={index} />
        ))}
      </div>
    </PageSection>
  );
};

export const People: ComponentConfig<PeopleProps> = {
  label: "People",
  fields: peopleFields,
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Meet Our Team",
        constantValueEnabled: true,
      },
      level: 3,
    },
    people: [
      {
        headshot: {
          image: {
            field: "",
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              height: 360,
              width: 360,
            },
            constantValueEnabled: true,
          },
          layout: "auto",
          aspectRatio: 1,
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
          constantValue: "(202) 770-6619",
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
      {
        headshot: {
          image: {
            field: "",
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              height: 360,
              width: 360,
            },
            constantValueEnabled: true,
          },
          layout: "auto",
          aspectRatio: 1,
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
          constantValue: "(202) 770-6619",
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
      {
        headshot: {
          image: {
            field: "",
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              height: 360,
              width: 360,
            },
            constantValueEnabled: true,
          },
          layout: "auto",
          aspectRatio: 1,
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
          constantValue: "(202) 770-6619",
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
    ],
  },
  resolveFields() {
    const fields = { ...peopleFields };
    const peopleField = fields.people as ArrayField<
      Omit<PersonCardProps, "index">[]
    >;

    // Always include the headshot fields with default layout
    const existingArrayFields = peopleField.arrayFields;
    peopleField.arrayFields = {
      ...existingArrayFields,
      headshot: {
        type: "object",
        label: "Headshot",
        objectFields: resolvedImageFields("auto"),
      },
    };
    fields.people = peopleField;

    return fields;
  },
  render: (props) => <PeopleWrapper {...props} />,
};
