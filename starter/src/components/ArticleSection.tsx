import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  BasicSelector,
  Body,
  CTA,
  CTAProps,
  Heading,
  HeadingLevel,
  ImageWrapperProps,
  resolveYextEntityField,
  Section,
  ThemeOptions,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  Image,
  ImageProps,
} from "@yext/visual-editor";
import { ImageWrapperFields, resolvedImageFields } from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/360x210";

// Define Props
export interface ArticlesProps {
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
  seeAllCTA: YextEntityField<CTAProps>;
}
//Define fields Should be of fields<props in step1>
const articleFields: Fields<ArticlesProps> = {
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR,
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
        label: "Category",
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
    // getItemSummary(item, index: any) {
    //   return `Article ${index + 1}`;
    // },
  },
  seeAllCTA: YextEntityFieldSelector({
    label: "See All CTA",
    filter: {
      types: ["type.cta"],
    },
  }),
};
//Define the Component Wrapper with props
const ArticleSectionWrapper = ({
  styles,
  sectionHeading,
  article: articleFields,
  seeAllCTA: seeAllCTAField,
}: ArticlesProps) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text,
  );
  const resolvedSeeAllCTA = resolveYextEntityField<CTAProps>(
    document,
    seeAllCTAField,
  );
  return (
    <Section background={styles.backgroundColor}>
      <div className="flex flex-col gap-8">
        {resolvedHeading && (
          <div className="text-center">
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          {articleFields.map((article, index) => {
            const resolvedTitle = resolveYextEntityField<string>(
              document,
              article.title,
            );
            const resolvedCategory = resolveYextEntityField<string>(
              document,
              article.category,
            );
            const resolvedDate = resolveYextEntityField<string>(
              document,
              article.date,
            );
            const resolvedDescription = resolveYextEntityField<string>(
              document,
              article.description,
            );
            const resolvedCTA = resolveYextEntityField<CTAProps>(
              document,
              article.cta,
            );
            const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
              document,
              article.image?.image,
            );

            return (
              <div
                className={`md:w-1/3 ${backgroundColors.background1}`}
                key={index}
              >
                {resolvedImage && (
                  <Image
                    image={resolvedImage}
                    layout={article.image.layout}
                    width={article.image.width}
                    height={article.image.height}
                    aspectRatio={article.image.aspectRatio}
                  />
                )}
                <div className="border flex flex-col gap-8 p-8 ">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <Body>{resolvedCategory}</Body>
                      <Body>|</Body>
                      <Body>{resolvedDate}</Body>
                    </div>
                    {resolvedTitle && (
                      <Heading level={4}>{resolvedTitle}</Heading>
                    )}
                    {resolvedDescription && <Body>{resolvedDescription}</Body>}
                  </div>
                  {resolvedCTA && (
                    <CTA
                      variant={"link"}
                      label={resolvedCTA.label ?? ""}
                      link={resolvedCTA.link || "#"}
                      linkType={"URL"}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {resolvedSeeAllCTA && (
          <div className="mx-auto">
            <CTA
              variant={"secondary"}
              label={resolvedSeeAllCTA.label ?? ""}
              link={resolvedSeeAllCTA.link || "#"}
              linkType={"URL"}
            />
          </div>
        )}
      </div>
    </Section>
  );
};
// Create the component of type ComponentConfig<props>
export const ArticlesSection: ComponentConfig<ArticlesProps> = {
  fields: articleFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "name",
        constantValue: "",
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
    seeAllCTA: {
      field: "",
      constantValue: {
        label: "See All Articles",
        link: "#",
        linkType: "URL",
      },
      constantValueEnabled: true,
    },
  },
  resolveFields() {
    const fields = { ...articleFields };
    const articleField = fields.article as any;

    const existingArrayFields = articleField.arrayFields;
    articleField.arrayFields = {
      ...existingArrayFields,
      image: {
        type: "object",
        label: "Image",
        objectFields: resolvedImageFields("auto"),
      },
    };
    fields.article = articleField;
    return fields;
  },
  render: (props) => <ArticleSectionWrapper {...props} />,
};
