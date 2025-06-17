import { useTranslation } from "react-i18next";
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
  ComponentFields,
  TranslatableString,
  resolveTranslatableString,
  msg,
  pt,
  ThemeOptions,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope } from "react-icons/fa";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface TeamSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
  };
  data: {
    heading: YextEntityField<TranslatableString>;
    people: YextEntityField<TeamSectionType>;
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/80x80";

const TeamSectionFields: Fields<TeamSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.headingText", "Heading Text"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        }
      ),
      people: YextField(msg("fields.teamSection", "Team Section"), {
        type: "entityField",
        filter: {
          types: [ComponentFields.TeamSection.type],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      cardBackgroundColor: YextField(
        msg("fields.cardBackgroundColor", "Card Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.headingLevel", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

const PersonCard = ({
  key,
  person,
  backgroundColor,
  sectionHeadingLevel,
}: {
  key: number;
  person: PersonStruct;
  backgroundColor?: BackgroundStyle;
  sectionHeadingLevel: HeadingLevel;
}) => {
  const { i18n } = useTranslation();

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
          {person.name && (
            <Heading
              level={3}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
            >
              {resolveTranslatableString(person.name, i18n.language)}
            </Heading>
          )}
          {person.title && (
            <Body variant="base">
              {resolveTranslatableString(person.title, i18n.language)}
            </Body>
          )}
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
              eventName={`phone${key}`}
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
                eventName={`email${key}`}
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
                eventName={`cta${key}`}
                label={resolveTranslatableString(
                  person.cta.label,
                  i18n.language
                )}
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
  const { i18n } = useTranslation();
  const document = useDocument();
  const resolvedPeople = resolveYextEntityField(document, data.people);
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField(document, data.heading),
    i18n.language
  );

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.heading", "Heading")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level ?? 2}>
              {resolvedHeading}
            </Heading>
          </div>
        </EntityField>
      )}
      {resolvedPeople?.people && (
        <EntityField
          displayName={pt("fields.team", "Team")}
          fieldId={data.people.field}
          constantValueEnabled={data.people.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            {resolvedPeople.people.map((person, index) => (
              <PersonCard
                key={index}
                person={person}
                backgroundColor={styles.cardBackgroundColor}
                sectionHeadingLevel={styles.heading.level}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const TeamSection: ComponentConfig<TeamSectionProps> = {
  label: msg("components.teamSection", "Team Section"),
  fields: TeamSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: { en: "Meet Our Team" },
        constantValueEnabled: true,
      },
      people: {
        field: "",
        constantValue: {
          people: [
            {
              name: { en: "First Last" },
              title: { en: "Associate Agent" },
              phoneNumber: "(202) 770-6619 ",
              email: "jkelley@[company].com",
              cta: {
                label: { en: "Visit Profile" },
                link: "#",
                linkType: "URL",
              },
              headshot: {
                url: PLACEHOLDER_IMAGE_URL,
                height: 80,
                width: 80,
              },
            },
            {
              name: { en: "First Last" },
              title: { en: "Associate Agent" },
              phoneNumber: "(202) 770-6619 ",
              email: "jkelley@[company].com",
              cta: {
                label: { en: "Visit Profile" },
                link: "#",
                linkType: "URL",
              },
              headshot: {
                url: PLACEHOLDER_IMAGE_URL,
                height: 80,
                width: 80,
              },
            },
            {
              name: { en: "First Last" },
              title: { en: "Associate Agent" },
              phoneNumber: "(202) 770-6619 ",
              email: "jkelley@[company].com",
              cta: {
                label: { en: "Visit Profile" },
                link: "#",
                linkType: "URL",
              },
              headshot: {
                url: PLACEHOLDER_IMAGE_URL,
                height: 80,
                width: 80,
              },
            },
          ],
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background3.value,
      cardBackgroundColor: backgroundColors.background1.value,
      heading: {
        level: 2,
        align: "left",
      },
    },
    analytics: {
      scope: "teamSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "teamSection"}>
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <TeamSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
