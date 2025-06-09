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
  MaybeRTF,
  resolveTranslatableRTF2,
  TranslatableRTF2,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface InsightSectionProps {
  data: {
    heading: YextEntityField<TranslatableRTF2>;
    insights: YextEntityField<InsightSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const insightSectionFields: Fields<InsightSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableRTF2>("Section Heading", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      insights: YextField("Insight Section", {
        type: "entityField",
        filter: {
          types: [ComponentFields.InsightSection.type],
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

const InsightCard = ({
  key,
  insight,
  backgroundColor,
  sectionHeadingLevel,
}: {
  key: number;
  insight: InsightStruct;
  backgroundColor?: BackgroundStyle;
  sectionHeadingLevel: HeadingLevel;
}) => {
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
              <Body>{insight.category}</Body>
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
              {insight.name}
            </Heading>
          )}
          <MaybeRTF data={insight.description} />
        </div>
        {insight.cta && (
          <CTA
            eventName={`cta${key}`}
            variant={"link"}
            label={insight.cta.label}
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
  const { t, i18n } = useTranslation();
  const document = useDocument();
  const resolvedInsights = resolveYextEntityField(document, data.insights);
  const resolvedHeading = resolveTranslatableRTF2(
    resolveYextEntityField(document, data.heading),
    i18n.language
  );

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <div className="text-center">
          <EntityField
            displayName={t("headingText", "Heading Text")}
            fieldId={data.heading.field}
            constantValueEnabled={data.heading.constantValueEnabled}
          >
            <Heading level={styles.headingLevel}>{resolvedHeading}</Heading>
          </EntityField>
        </div>
      )}
      {resolvedInsights?.insights && (
        <EntityField
          displayName={t("insights", "Insights")}
          fieldId={data.insights.field}
          constantValueEnabled={data.insights.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedInsights.insights.map((insight, index) => (
              <InsightCard
                key={index}
                insight={insight}
                backgroundColor={styles.cardBackgroundColor}
                sectionHeadingLevel={styles.headingLevel}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const InsightSection: ComponentConfig<InsightSectionProps> = {
  label: "Insights Section",
  fields: insightSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background3.value,
      cardBackgroundColor: backgroundColors.background1.value,
      headingLevel: 2,
    },
    data: {
      heading: {
        field: "",
        constantValue: "Insights",
        constantValueEnabled: true,
      },
      insights: {
        field: "",
        constantValue: {
          insights: [],
        },
      },
    },
    analytics: {
      scope: "insightSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "insightSection"}>
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <InsightSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
