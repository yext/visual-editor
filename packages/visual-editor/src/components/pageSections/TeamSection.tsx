import { useTranslation } from "react-i18next";
import {
  Image,
  HeadingLevel,
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  PageSection,
  Body,
  Heading,
  EntityField,
  Background,
  backgroundColors,
  VisibilityWrapper,
  PhoneAtom,
  TeamSectionType,
  PersonStruct,
  ComponentFields,
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  getAnalyticsScopeHash,
  CTAProps,
  resolveComponentData,
  CTA,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope } from "react-icons/fa";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultPerson } from "../../internal/puck/constant-value-fields/TeamSection.tsx";

export interface TeamData {
  /**
   * The main heading for the entire team section.
   * @defaultValue "Meet Our Team" (constant)
   */
  heading: YextEntityField<TranslatableString>;

  /**
   * The source of the team member data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder people.
   */
  people: YextEntityField<TeamSectionType>;
}

export interface TeamStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for the individual people cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
    ctaVariant: CTAProps["variant"];
  };
}

export interface TeamSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: TeamData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: TeamStyles;

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

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
          options: "BACKGROUND_COLOR",
        }
      ),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
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
      cards: YextField(msg("fields.cards", "Cards"), {
        type: "object",
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "BACKGROUND_COLOR",
            }
          ),
          ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
            type: "radio",
            options: "CTA_VARIANT",
          }),
        },
      }),
    },
  }),
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const PersonCard = ({
  cardNumber,
  person,
  cardStyles,
  sectionHeadingLevel,
  ctaVariant,
}: {
  cardNumber: number;
  person: PersonStruct;
  cardStyles: TeamSectionProps["styles"]["cards"];
  sectionHeadingLevel: HeadingLevel;
  ctaVariant: CTAProps["variant"];
}) => {
  const { i18n } = useTranslation();

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border bg-white h-full">
      <Background
        background={cardStyles.backgroundColor}
        className="flex p-8 gap-6"
      >
        <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
          {person.headshot && (
            <Image image={person.headshot} aspectRatio={1} sizes="80px" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          {person.name && (
            <Heading
              level={cardStyles.headingLevel}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
            >
              {resolveComponentData(person.name, i18n.language)}
            </Heading>
          )}
          {person.title && (
            <Body variant="base">
              {resolveComponentData(person.title, i18n.language)}
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
              eventName={`phone${cardNumber}`}
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
                eventName={`email${cardNumber}`}
                link={person.email}
                label={person.email}
                linkType="EMAIL"
                variant="link"
                ctaType="textAndLink"
              />
            </div>
          )}
          {person.cta && (
            <div className="flex justify-start gap-2">
              <CTA
                eventName={`cta${cardNumber}`}
                label={
                  person.cta.label
                    ? resolveComponentData(person.cta.label, i18n.language)
                    : undefined
                }
                link={resolveComponentData(person.cta.link, i18n.language)}
                linkType={person.cta.linkType}
                ctaType={person.cta.ctaType}
                coordinate={person.cta.coordinate}
                presetImageType={person.cta.presetImageType}
                variant={ctaVariant}
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
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedPeople = resolveComponentData(
    data.people,
    locale,
    streamDocument
  );
  const resolvedHeading = resolveComponentData(
    data.heading,
    locale,
    streamDocument
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
                cardNumber={index}
                person={person}
                cardStyles={styles.cards}
                sectionHeadingLevel={styles.heading.level}
                ctaVariant={styles.cards.ctaVariant}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

/**
 * The Team Section is designed to showcase a list of people, such as employees, executives, or other team members. It features a main section heading and renders each person's information—typically a photo, name, and title—as an individual card.
 * Available on Location templates.
 */
export const TeamSection: ComponentConfig<{ props: TeamSectionProps }> = {
  label: msg("components.teamSection", "Team Section"),
  fields: TeamSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: { en: "Meet Our Team", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      people: {
        field: "",
        constantValue: {
          people: [defaultPerson, defaultPerson, defaultPerson],
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background3.value,
      heading: {
        level: 2,
        align: "left",
      },
      cards: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 3,
        ctaVariant: "primary",
      },
    },
    analytics: {
      scope: "teamSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "teamSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <TeamSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
