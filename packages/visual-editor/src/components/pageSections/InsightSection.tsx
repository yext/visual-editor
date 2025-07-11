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
  InsightSectionType,
  InsightStruct,
  Timestamp,
  ComponentFields,
  resolveTranslatableString,
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  resolveTranslatableRichText,
  getAnalyticsScopeHash,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultInsight } from "../../internal/puck/constant-value-fields/InsightSection.tsx";

export interface InsightSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    insights: YextEntityField<InsightSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
  };
  analytics?: {
    scope?: string;
  };
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
      cardBackgroundColor: YextField(
        msg("fields.cardBackgroundColor", "Card Background Color"),
        {
          type: "select",
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

const InsightCard = ({
  cardNumber,
  insight,
  backgroundColor,
  sectionHeadingLevel,
}: {
  cardNumber: number;
  insight: InsightStruct;
  backgroundColor?: BackgroundStyle;
  sectionHeadingLevel: HeadingLevel;
}) => {
  const { i18n } = useTranslation();

  return (
    <Background
      className="rounded h-full flex flex-col"
      background={backgroundColor}
    >
      {insight.image ? (
        <Image
          image={insight.image}
          layout="auto"
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
              <Body>
                {resolveTranslatableString(insight.category, i18n.language)}
              </Body>
              {insight.category && insight.publishTime && <Body>|</Body>}
              {insight.publishTime && (
                <Timestamp date={insight.publishTime} hideTimeZone={true} />
              )}
            </div>
          )}
          {insight.name && (
            <Heading
              level={3}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
            >
              {resolveTranslatableString(insight.name, i18n.language)}
            </Heading>
          )}
          {resolveTranslatableRichText(insight.description, i18n.language)}
        </div>
        {insight.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            variant={"link"}
            label={resolveTranslatableString(insight.cta.label, i18n.language)}
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
  const resolvedInsights = resolveYextEntityField(
    document,
    locale,
    data.insights
  );
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField(document, locale, data.heading),
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
      cardBackgroundColor: backgroundColors.background1.value,
      heading: {
        level: 2,
        align: "left",
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
