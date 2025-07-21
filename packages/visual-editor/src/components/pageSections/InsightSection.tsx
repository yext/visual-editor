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
  CTA,
  backgroundColors,
  VisibilityWrapper,
  InsightSectionType,
  InsightStruct,
  Timestamp,
  ComponentFields,
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  getAnalyticsScopeHash,
  CTAProps,
  resolveComponentData,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultInsight } from "../../internal/puck/constant-value-fields/InsightSection.tsx";

export interface InsightData {
  /**
   * The main heading for the entire insights section.
   * @defaultValue "Insights"
   */
  heading: YextEntityField<TranslatableString>;

  /**
   * The source of the insight data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder insights.
   */
  insights: YextEntityField<InsightSectionType>;
}

export interface InsightStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for the individual insight cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
    ctaVariant: CTAProps["variant"];
  };
}

export interface InsightSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: InsightData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: InsightStyles;

  /** @internal */
  analytics?: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const insightSectionFields: Fields<InsightSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.sectionHeading", "Section Heading"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        }
      ),
      insights: YextField(msg("fields.insightSection", "Insight Section"), {
        type: "entityField",
        filter: {
          types: [ComponentFields.InsightSection.type],
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

const InsightCard = ({
  cardNumber,
  insight,
  cardStyles,
  sectionHeadingLevel,
  ctaVariant,
}: {
  cardNumber: number;
  insight: InsightStruct;
  cardStyles: InsightSectionProps["styles"]["cards"];
  sectionHeadingLevel: HeadingLevel;
  ctaVariant: CTAProps["variant"];
}) => {
  const { i18n } = useTranslation();

  return (
    <Background
      className="rounded h-full flex flex-col"
      background={cardStyles.backgroundColor}
    >
      {insight.image ? (
        <Image
          image={insight.image}
          aspectRatio={1.778} // 16:9
          className="rounded-t-[inherit] h-[200px]"
        />
      ) : (
        <div className="sm:h-[200px]" />
      )}
      <div className="flex flex-col gap-8 p-8 flex-grow">
        <div className="flex flex-col gap-4">
          {(insight.category || insight.publishTime) && (
            <div
              className={`flex ${insight.category && insight.publishTime && `gap-4`}`}
            >
              {insight.category && (
                <Body>
                  {resolveComponentData(insight.category, i18n.language)}
                </Body>
              )}
              {insight.category && insight.publishTime && <Body>|</Body>}
              {insight.publishTime && (
                <Timestamp date={insight.publishTime} hideTimeZone={true} />
              )}
            </div>
          )}
          {insight.name && (
            <Heading
              level={cardStyles.headingLevel}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
            >
              {resolveComponentData(insight.name, i18n.language)}
            </Heading>
          )}
          {insight.description &&
            resolveComponentData(insight.description, i18n.language)}
        </div>
        {insight.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            variant={ctaVariant}
            label={resolveComponentData(insight.cta.label, i18n.language)}
            link={insight.cta.link}
            linkType={insight.cta.linkType ?? "URL"}
            className="mt-auto"
          />
        )}
      </div>
    </Background>
  );
};

const InsightSectionWrapper = ({ data, styles }: InsightSectionProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const document = useDocument();
  const resolvedInsights = resolveComponentData(
    data.insights,
    locale,
    document
  );
  const resolvedHeading = resolveComponentData(data.heading, locale, document);

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
      {resolvedInsights?.insights && (
        <EntityField
          displayName={pt("fields.insights", "Insights")}
          fieldId={data.insights.field}
          constantValueEnabled={data.insights.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedInsights.insights.map((insight, index) => (
              <InsightCard
                key={index}
                cardNumber={index}
                insight={insight}
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
 * The Insight Section is used to display a curated list of content such as articles, blog posts, or other informational blurbs. It features a main section heading and renders each insight as a distinct card, making it an effective way to showcase valuable content.
 * Avaliable on Location templates.
 */
export const InsightSection: ComponentConfig<InsightSectionProps> = {
  label: msg("components.insightsSection", "Insights Section"),
  fields: insightSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: { en: "Insights", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      insights: {
        field: "",
        constantValue: {
          insights: [defaultInsight, defaultInsight, defaultInsight],
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
      heading: {
        level: 3,
        align: "left",
      },
      cards: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 4,
        ctaVariant: "primary",
      },
    },
    analytics: {
      scope: "insightsSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "insightsSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <InsightSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
