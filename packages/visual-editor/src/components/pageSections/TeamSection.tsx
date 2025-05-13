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
  TeamSectionType,
  PersonStruct,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope } from "react-icons/fa";

export interface TeamSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  data: {
    heading: YextEntityField<string>;
    people: YextEntityField<TeamSectionType>;
  };
  liveVisibility: boolean;
}

const TeamSectionFields: Fields<TeamSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      people: YextField("Team Section", {
        type: "entityField",
        filter: {
          types: ["type.team_section"],
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
          {person.cta && (
            <div className="flex justify-start gap-2">
              <CTA
                label={person.cta.label}
                link={person.cta.link}
                linkType={person.cta.linkType}
                variant="link"
              />
            </div>
          )}
        </div>
      </Background>
    </div>
  );
};

const TeamSectionWrapper = ({ data, styles }: TeamSectionProps) => {
  const document = useDocument();
  const resolvedPeople = resolveYextEntityField(document, data.people);
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
      {resolvedPeople?.people && (
        <EntityField
          displayName="Team"
          fieldId={data.people.field}
          constantValueEnabled={data.people.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            {resolvedPeople.people.map((person, index) => (
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
    data: {
      heading: {
        field: "",
        constantValue: "Meet Our Team",
        constantValueEnabled: true,
      },
      people: {
        field: "",
        constantValue: {
          people: [],
        },
        constantValueEnabled: false,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background3.value,
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
      <TeamSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
