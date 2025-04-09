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

export interface ArticleSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  article: Array<{
    image: ImageWrapperProps;
    title: YextEntityField<string>;
    category: YextEntityField<string>;
    date: YextEntityField<string>;
    description: YextEntityField<string>;
    cta: YextEntityField<CTAProps>;
  }>;
}

const articleFields: Fields<ArticleSectionProps> = {
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
  article: {
    label: "Article",
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

const ArticleSectionWrapper = ({
  styles,
  sectionHeading,
  article: articleFields,
}: ArticleSectionProps) => {
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

        {articleFields && (
          <div className="flex flex-col md:flex-row gap-8">
            {articleFields.map((article, index) => {
              const resolvedTitle = resolveYextEntityField<string>(
                document,
                article.title
              );
              const resolvedCategory = resolveYextEntityField<string>(
                document,
                article.category
              );
              const resolvedDate = resolveYextEntityField<string>(
                document,
                article.date
              );
              const resolvedDescription = resolveYextEntityField<string>(
                document,
                article.description
              );
              const resolvedCTA = resolveYextEntityField<CTAProps>(
                document,
                article.cta
              );
              const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
                document,
                article.image?.image
              );

              return (
                <Section
                  className="!p-0"
                  key={index}
                  background={backgroundColors.background1.value}
                >
                  {resolvedImage && (
                    <EntityField
                      displayName="Image"
                      fieldId={article.image.image.field}
                      constantValueEnabled={
                        article.image.image.constantValueEnabled
                      }
                    >
                      <Image
                        image={resolvedImage}
                        layout={article.image.layout}
                        width={article.image.width}
                        height={article.image.height}
                        aspectRatio={article.image.aspectRatio}
                      />
                    </EntityField>
                  )}
                  <div className="border flex flex-col gap-8 p-8">
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <EntityField
                          displayName="Category"
                          fieldId={article.category.field}
                          constantValueEnabled={
                            article.category.constantValueEnabled
                          }
                        >
                          <Body>{resolvedCategory}</Body>
                        </EntityField>
                        <Body>|</Body>
                        <EntityField
                          displayName="Date"
                          fieldId={article.date.field}
                          constantValueEnabled={
                            article.date.constantValueEnabled
                          }
                        >
                          <Body>{resolvedDate}</Body>
                        </EntityField>
                      </div>
                      {resolvedTitle && (
                        <EntityField
                          displayName="Article Title"
                          fieldId={article.title.field}
                          constantValueEnabled={
                            article.title.constantValueEnabled
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
                          fieldId={article.description.field}
                          constantValueEnabled={
                            article.description.constantValueEnabled
                          }
                        >
                          <Body>{resolvedDescription}</Body>
                        </EntityField>
                      )}
                    </div>
                    {resolvedCTA && (
                      <EntityField
                        displayName="CTA"
                        fieldId={article.cta.field}
                        constantValueEnabled={article.cta.constantValueEnabled}
                      >
                        <CTA
                          variant={"link"}
                          label={resolvedCTA.label ?? ""}
                          link={resolvedCTA.link ?? "#"}
                          linkType={"URL"}
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

export const ArticleSection: ComponentConfig<ArticleSectionProps> = {
  label: "Articles Section",
  fields: articleFields,
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
    article: [
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
          constantValue: "Article Name Lorem Ipsum",
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
          constantValue: "Article Name Lorem Ipsum",
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
          constantValue: "Article Name Lorem Ipsum",
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
    const fields = { ...articleFields };
    const articleField = fields.article;

    if (articleField.type === "array") {
      const resolvedImage = resolvedImageFields("auto");
      const cleanedResolvedImage = Object.fromEntries(
        Object.entries(resolvedImage).filter(([, value]) => value !== undefined)
      ) as { [key: string]: Field<any> };

      (articleField as ArrayField).arrayFields = {
        ...articleField.arrayFields,
        image: {
          type: "object",
          label: "Image",
          objectFields: cleanedResolvedImage,
        },
      };
    }
    return fields;
  },
  render: (props) => <ArticleSectionWrapper {...props} />,
};
