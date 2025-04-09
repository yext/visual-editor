import { ComponentConfig, Fields, ArrayField, Field } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  BasicSelector,
  CTAProps,
  EntityField,
  Heading,
  HeadingLevel,
  ImageProps,
  ImageWrapperProps,
  resolveYextEntityField,
  Section,
  ThemeOptions,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  Image,
  Body,
  CTA,
} from "../../index.js";
import React from "react";
import { ImageWrapperFields, resolvedImageFields } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/360x210";

export interface InsightsSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  insights: Array<{
    image: ImageWrapperProps;
    title: YextEntityField<string>;
    category: YextEntityField<string>;
    date: YextEntityField<string>;
    description: YextEntityField<string>;
    cta: YextEntityField<CTAProps>;
  }>;
}

const insightsFields: Fields<InsightsSectionProps> = {
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
    },
  },
  sectionHeading: {
    label: "Section Heading",
    type: "object",
    objectFields: {
      text: YextEntityFieldSelector({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  insights: {
    label: "Insights",
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: "Image",
        objectFields: {
          ...ImageWrapperFields,
        },
      },
      title: YextEntityFieldSelector({
        label: "Title",
        filter: {
          types: ["type.string"],
        },
      }),
      category: YextEntityFieldSelector({
        label: "Category",
        filter: {
          types: ["type.string"],
        },
      }),
      date: YextEntityFieldSelector({
        label: "Publish Time",
        filter: {
          types: ["type.string"],
        },
      }),
      description: YextEntityFieldSelector({
        label: "Description",
        filter: {
          types: ["type.string"],
        },
      }),
      cta: YextEntityFieldSelector({
        label: "CTA",
        filter: {
          types: ["type.cta"],
        },
      }),
    },
  },
};

const InsightsSectionWrapper = ({
  styles,
  sectionHeading,
  insights: insightsFields,
}: InsightsSectionProps) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );
  return (
    <Section background={styles.backgroundColor}>
      <div className="flex flex-col gap-8">
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

        {insightsFields && (
          <div className="flex flex-col md:flex-row gap-8">
            {insightsFields.map((insight, index) => {
              const resolvedTitle = resolveYextEntityField<string>(
                document,
                insight.title
              );
              const resolvedCategory = resolveYextEntityField<string>(
                document,
                insight.category
              );
              const resolvedDate = resolveYextEntityField<string>(
                document,
                insight.date
              );
              const resolvedDescription = resolveYextEntityField<string>(
                document,
                insight.description
              );
              const resolvedCTA = resolveYextEntityField<CTAProps>(
                document,
                insight.cta
              );
              const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
                document,
                insight.image?.image
              );

              return (
                <Section
                  className="!p-0 rounded"
                  key={index}
                  background={backgroundColors.background1.value}
                >
                  {resolvedImage && (
                    <EntityField
                      displayName="Image"
                      fieldId={insight.image.image.field}
                      constantValueEnabled={
                        insight.image.image.constantValueEnabled
                      }
                    >
                      <Image
                        image={resolvedImage}
                        layout={insight.image.layout}
                        width={insight.image.width}
                        height={insight.image.height}
                        aspectRatio={insight.image.aspectRatio}
                      />
                    </EntityField>
                  )}
                  <div className="border flex flex-col gap-8 p-8">
                    <div className="flex flex-col gap-4">
                      {(resolvedCategory || resolvedDate) && (
                        <div className="flex gap-4">
                          <EntityField
                            displayName="Category"
                            fieldId={insight.category.field}
                            constantValueEnabled={
                              insight.category.constantValueEnabled
                            }
                          >
                            <Body>{resolvedCategory}</Body>
                          </EntityField>
                          {resolvedCategory && resolvedDate && <Body>|</Body>}
                          <EntityField
                            displayName="Date"
                            fieldId={insight.date.field}
                            constantValueEnabled={
                              insight.date.constantValueEnabled
                            }
                          >
                            <Body>{resolvedDate}</Body>
                          </EntityField>
                        </div>
                      )}
                      {resolvedTitle && (
                        <EntityField
                          displayName="Insight Title"
                          fieldId={insight.title.field}
                          constantValueEnabled={
                            insight.title.constantValueEnabled
                          }
                        >
                          <Heading
                            level={4}
                            className="text-palette-primary-dark"
                          >
                            {resolvedTitle}
                          </Heading>
                        </EntityField>
                      )}
                      {resolvedDescription && (
                        <EntityField
                          displayName="Description"
                          fieldId={insight.description.field}
                          constantValueEnabled={
                            insight.description.constantValueEnabled
                          }
                        >
                          <Body>{resolvedDescription}</Body>
                        </EntityField>
                      )}
                    </div>
                    {resolvedCTA && (
                      <EntityField
                        displayName="CTA"
                        fieldId={insight.cta.field}
                        constantValueEnabled={insight.cta.constantValueEnabled}
                      >
                        <CTA
                          variant={"link"}
                          label={resolvedCTA.label ?? ""}
                          link={resolvedCTA.link ?? "#"}
                          linkType={resolvedCTA.linkType ?? "URL"}
                        />
                      </EntityField>
                    )}
                  </div>
                </Section>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
};

export const InsightsSection: ComponentConfig<InsightsSectionProps> = {
  label: "Insights Section",
  fields: insightsFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Insights",
        constantValueEnabled: true,
      },
      level: 3,
    },
    insights: [
      {
        image: {
          image: {
            field: "",
            constantValue: {
              height: 210,
              width: 360,
              url: PLACEHOLDER_IMAGE_URL,
            },
            constantValueEnabled: true,
          },
          layout: "auto",
          aspectRatio: 1.78,
        },
        title: {
          field: "",
          constantValue: "Insight Name Lorem Ipsum",
          constantValueEnabled: true,
        },
        category: {
          field: "",
          constantValue: "Category",
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "August 2, 2022",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters",
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: "Read more",
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
        },
      },
      {
        image: {
          image: {
            field: "",
            constantValue: {
              height: 210,
              width: 360,
              url: PLACEHOLDER_IMAGE_URL,
            },
            constantValueEnabled: true,
          },
          layout: "auto",
          aspectRatio: 1.78,
        },
        title: {
          field: "",
          constantValue: "Insight Name Lorem Ipsum",
          constantValueEnabled: true,
        },
        category: {
          field: "",
          constantValue: "Category",
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "August 2, 2022",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters",
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: "Read more",
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
        },
      },
      {
        image: {
          image: {
            field: "",
            constantValue: {
              height: 210,
              width: 360,
              url: PLACEHOLDER_IMAGE_URL,
            },
            constantValueEnabled: true,
          },
          layout: "auto",
          aspectRatio: 1.78,
        },
        title: {
          field: "",
          constantValue: "Insight Name Lorem Ipsum",
          constantValueEnabled: true,
        },
        category: {
          field: "",
          constantValue: "Category",
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "August 2, 2022",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters",
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: "Read more",
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
        },
      },
    ],
  },
  resolveFields() {
    const fields = { ...insightsFields };
    const insightsField = fields.insights;

    if (insightsField.type === "array") {
      const resolvedImage = resolvedImageFields("auto");
      const cleanedResolvedImage = Object.fromEntries(
        Object.entries(resolvedImage).filter(([, value]) => value !== undefined)
      ) as { [key: string]: Field<any> };

      (insightsField as ArrayField).arrayFields = {
        ...insightsField.arrayFields,
        image: {
          type: "object",
          label: "Image",
          objectFields: cleanedResolvedImage,
        },
      };
    }
    return fields;
  },
  render: (props) => <InsightsSectionWrapper {...props} />,
};
