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
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { Timestamp, TimestampOption } from "../atoms/timestamp.tsx";
import { InsightSectionType, InsightStruct } from "../../types/types.ts";

export interface InsightSectionProps {
  data: {
    heading: YextEntityField<string>;
    insights: YextEntityField<InsightSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  liveVisibility: boolean;
}

const insightSectionFields: Fields<InsightSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      insights: YextField("Insight Section", {
        type: "entityField",
        filter: {
          types: ["type.insights_section"],
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
  insight,
  backgroundColor,
}: {
  insight: InsightStruct;
  backgroundColor?: BackgroundStyle;
}) => {
  return (
    <Background className="rounded-sm h-full" background={backgroundColor}>
      {insight.image && (
        <Image
          image={insight.image}
          layout="auto"
          className="rounded-[inherit]"
        />
      )}
      <div className="flex flex-col gap-8 p-8">
        <div className="flex flex-col gap-4">
          {(insight.category || insight.publishTime) && (
            <div
              className={`flex ${insight.category && insight.publishTime && `gap-4`}`}
            >
              <Body>{insight.category}</Body>
              {insight.category && insight.publishTime && <Body>|</Body>}
              {insight.publishTime?.start && (
                <Timestamp
                  date={insight.publishTime.start}
                  option={TimestampOption.DATE}
                  hideTimeZone={true}
                />
              )}
            </div>
          )}
          {insight.name && <Heading level={3}>{insight.name}</Heading>}
          {insight.description?.html && (
            <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
              <div
                dangerouslySetInnerHTML={{ __html: insight.description.html }}
              />
            </div>
          )}
        </div>
        {insight.cta && (
          <CTA
            variant={"link"}
            label={insight.cta.label}
            link={insight.cta.link}
            linkType={insight.cta.linkType ?? "URL"}
          />
        )}
      </div>
    </Background>
  );
};

const InsightSectionWrapper = ({ data, styles }: InsightSectionProps) => {
  const document = useDocument();
  const resolvedInsights = resolveYextEntityField(document, data.insights);
  const resolvedHeading = resolveYextEntityField(document, data.heading);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <div className="text-center">
          <EntityField
            displayName="Heading Text"
            fieldId={data.heading.field}
            constantValueEnabled={data.heading.constantValueEnabled}
          >
            <Heading level={styles.headingLevel}>{resolvedHeading}</Heading>
          </EntityField>
        </div>
      )}
      {resolvedInsights && (
        <EntityField
          displayName="Insights"
          fieldId={data.insights.field}
          constantValueEnabled={data.insights.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedInsights.map((insight, index) => (
              <InsightCard
                key={index}
                insight={insight}
                backgroundColor={styles.cardBackgroundColor}
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
        constantValue: [],
      },
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <InsightSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
