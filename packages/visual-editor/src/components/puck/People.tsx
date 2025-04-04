import * as React from "react";
import { ComponentConfig, Fields, ArrayField } from "@measured/puck";
import { Phone as PhoneIcon } from "lucide-react";
import mailIcon from "./assets/mail_outline.svg";
import {
  YextEntityField,
  YextEntityFieldSelector,
  useDocument,
  resolveYextEntityField,
  BasicSelector,
  ThemeOptions,
  Heading,
  HeadingLevel,
  Body,
  Section,
  backgroundColors,
  BackgroundStyle,
  EntityField,
  CTA,
  CTAProps,
  Image,
  ImageProps,
  ImageWrapperProps,
} from "../../index.js";
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
  backgroundColor: BasicSelector(
    "Background Color",
    ThemeOptions.BACKGROUND_COLOR
  ),
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
  people: {
    type: "array",
    label: "People",
    arrayFields: {
      headshot: {
        type: "object",
        label: "Headshot",
        objectFields: {
          ...ImageWrapperFields,
        },
      },
      name: YextEntityFieldSelector<any, string>({
        label: "Name",
        filter: {
          types: ["type.string"],
        },
      }),
      title: YextEntityFieldSelector<any, string>({
        label: "Title",
        filter: {
          types: ["type.string"],
        },
      }),
      phone: YextEntityFieldSelector<any, string>({
        label: "Phone",
        filter: {
          types: ["type.phone"],
        },
      }),
      email: YextEntityFieldSelector<any, string>({
        label: "Email",
        filter: {
          types: ["type.string"],
          allowList: ["emails"],
        },
      }),
      cta: YextEntityFieldSelector<any, CTAProps>({
        label: "CTA",
        filter: {
          types: ["type.cta"],
        },
      }),
    },
  },
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
    <div
      key={index}
      className="flex flex-col rounded-lg overflow-hidden border bg-white"
    >
      <Section
        background={backgroundColors.background1.value}
        className="flex p-8 gap-6"
      >
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
      </Section>
      <hr className="border" />
      <Section background={backgroundColors.background1.value} className="p-8">
        <div className="flex flex-col gap-4">
          {resolvedPhone && (
            <EntityField
              displayName="Phone"
              fieldId={phone.field}
              constantValueEnabled={phone.constantValueEnabled}
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
                  className="text-sm"
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
                  className="text-sm"
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
                  className="text-sm"
                />
              </div>
            </EntityField>
          )}
        </div>
      </Section>
    </div>
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
    <Section background={backgroundColor} className="components">
      <div className="flex flex-col gap-12 p-8">
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
      </div>
    </Section>
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
      {
        headshot: ImageWrapperProps;
        name: YextEntityField<string>;
        title: YextEntityField<string>;
        phone: YextEntityField<string>;
        email: YextEntityField<string>;
        cta: YextEntityField<CTAProps>;
      }[]
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
