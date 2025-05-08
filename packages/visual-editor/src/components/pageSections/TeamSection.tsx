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
  PhoneAtom,
} from "@yext/visual-editor";
import { CTA as CTAType, ImageType } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope } from "react-icons/fa";

/** TODO remove types when spruce is ready */
type People = Array<PersonStruct>;

type PersonStruct = {
  headshot?: ImageType;
  name?: string; // single line text
  title?: string; // single line text
  phoneNumber?: string; // phoneNumber
  email?: string; // email
  CTA?: CTAType;
};
/** end of hardcoded types */

export interface TeamSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  people: YextEntityField<People>;
  liveVisibility: boolean;
}

const TeamSectionFields: Fields<TeamSectionProps> = {
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
  people: YextField("Team Section", {
    type: "entityField",
    filter: {
      types: ["type.team_section"],
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

const PersonCard = ({
  person,
  backgroundColor,
}: {
  person: PersonStruct;
  backgroundColor?: BackgroundStyle;
}) => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border bg-white h-full">
      <Background background={backgroundColor} className="flex p-8 gap-6">
        <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
          {person.headshot && (
            <Image
              image={person.headshot}
              layout="auto"
              aspectRatio={person.headshot.width / person.headshot.height}
            />
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          {person.name && <Heading level={3}>{person.name}</Heading>}
          {person.title && <Body variant="base">{person.title}</Body>}
        </div>
      </Background>
      <hr className="border" />
      <Background
        background={backgroundColors.background1.value}
        className="p-8"
      >
        <div className="flex flex-col gap-4">
          {person.phoneNumber && (
            <PhoneAtom
              phoneNumber={person.phoneNumber}
              includeHyperlink={true}
              includeIcon={true}
              format={
                person.phoneNumber.slice(0, 2) === "+1"
                  ? "domestic"
                  : "international"
              }
            />
          )}
          {person.email && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-palette-primary-light flex items-center justify-center">
                <FaEnvelope />
              </div>
              <CTA
                link={person.email}
                label={person.email}
                linkType="EMAIL"
                variant="link"
              />
            </div>
          )}
          {person.CTA && (
            <div className="flex justify-start gap-2">
              <CTA
                label={person.CTA.label}
                link={person.CTA.link}
                linkType={person.CTA.linkType}
                variant="link"
              />
            </div>
          )}
        </div>
      </Background>
    </div>
  );
};

const TeamSectionWrapper = ({
  styles,
  sectionHeading,
  people,
}: TeamSectionProps) => {
  const document = useDocument();
  const resolvedPeople = resolveYextEntityField(document, people);
  const resolvedHeading = resolveYextEntityField(document, sectionHeading.text);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={sectionHeading.text.field}
          constantValueEnabled={sectionHeading.text.constantValueEnabled}
        >
          <div className="text-center">
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedPeople && (
        <EntityField
          displayName="Team"
          fieldId={people.field}
          constantValueEnabled={people.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            {resolvedPeople.map((person, index) => (
              <PersonCard
                key={index}
                person={person}
                backgroundColor={styles.cardBackgroundColor}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const TeamSection: ComponentConfig<TeamSectionProps> = {
  label: "Team Section",
  fields: TeamSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background3.value,
      cardBackgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Meet Our Team",
        constantValueEnabled: true,
      },
      level: 2,
    },
    people: {
      field: "",
      constantValue: [],
      constantValueEnabled: false,
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <TeamSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
