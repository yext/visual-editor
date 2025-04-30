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
} from "@yext/visual-editor";
import {
  ComplexImageType,
  CTA as CTAType,
  LexicalRichText,
} from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";

/** TODO remove types when spruce is ready */
type Insights = Array<InsightStruct>;

type InsightStruct = {
  image?: ComplexImageType;
  name?: string; // single line text
  category?: string; // single line text
  publishTime?: string; // lexon's dateTime
  description?: RTF2;
  CTA?: CTAType;
};

type RTF2 = {
  json?: Record<string, any>;
};
/** end of hardcoded types */

export interface InsightSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  insights: YextEntityField<Insights>;
}

const insightSectionFields: Fields<InsightSectionProps> = {
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
  insights: YextField("Insight Section", {
    type: "entityField",
    filter: {
      types: ["type.insight"],
    },
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
              <Body>{insight.publishTime}</Body>
            </div>
          )}
          {insight.name && (
            <Heading level={3} className="text-palette-primary-dark">
              {insight.name}
            </Heading>
          )}
          {insight.description && (
            <Body>
              <LexicalRichText
                serializedAST={JSON.stringify(insight.description.json) ?? ""}
              />
            </Body>
          )}
        </div>
        {insight.CTA && (
          <CTA
            variant={"link"}
            label={insight.CTA.label}
            link={insight.CTA.link}
            linkType={insight.CTA.linkType ?? "URL"}
          />
        )}
      </div>
    </Background>
  );
};

const InsightSectionWrapper = ({
  styles,
  sectionHeading,
  insights,
}: InsightSectionProps) => {
  const document = useDocument();
  const resolvedInsights = resolveYextEntityField(document, insights);
  const resolvedHeading = resolveYextEntityField(document, sectionHeading.text);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <div className="text-center">
          <EntityField
            displayName="Heading Text"
            fieldId={sectionHeading.text.field}
            constantValueEnabled={sectionHeading.text.constantValueEnabled}
          >
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </EntityField>
        </div>
      )}
      {resolvedInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resolvedInsights.map((insight, index) => (
            <InsightCard
              key={index}
              insight={insight}
              backgroundColor={styles.cardBackgroundColor}
            />
          ))}
        </div>
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
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Insights",
        constantValueEnabled: true,
      },
      level: 2,
    },
    insights: {
      field: "",
      constantValue: [],
      constantValueEnabled: false,
    },
  },
  render: (props) => <InsightSectionWrapper {...props} />,
};
