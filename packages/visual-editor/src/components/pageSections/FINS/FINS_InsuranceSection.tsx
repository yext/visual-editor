import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  ComponentFields,
  Heading,
  InsuranceProvidersSectionType,
  PageSection,
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextField,
  Image,
  VisibilityWrapper,
  HeadingLevel,
  EntityField,
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/260X105";

export interface FINS_InsuranceSectionProps {
  styles: {
    backgroundColor: BackgroundStyle;
    headingLevel: HeadingLevel;
    insuranceProviderNameLevel: HeadingLevel;
  };
  data: {
    headingText: YextEntityField<string>;
    entityField: YextEntityField<InsuranceProvidersSectionType>;
  };
  liveVisibility: boolean;
}

const insuranceSectionFields: Fields<FINS_InsuranceSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      headingText: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      entityField: YextField("Insurance", {
        type: "entityField",
        filter: {
          types: [ComponentFields.InsuranceProviderSection.type],
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
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      insuranceProviderNameLevel: YextField("Provider Name Heading Level", {
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

const InsuranceProvidersSectionWrapper = ({
  styles: { headingLevel, insuranceProviderNameLevel, backgroundColor },
  data: { headingText, entityField },
}: FINS_InsuranceSectionProps) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField(document, headingText);
  const resolvedProviders = resolveYextEntityField(document, entityField);

  return (
    <PageSection
      background={backgroundColor}
      aria-label="Core Info Section"
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={headingText.field}
          constantValueEnabled={headingText.constantValueEnabled}
        >
          <Heading level={headingLevel} className="text-center">
            {resolvedHeading}
          </Heading>
        </EntityField>
      )}

      {resolvedProviders?.insuranceProviders && (
        <EntityField
          displayName="Insurance Providers"
          fieldId={entityField.field}
          constantValueEnabled={entityField.constantValueEnabled}
        >
          <ul
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            aria-label="Insurance Providers List"
          >
            {resolvedProviders.insuranceProviders.map((item, idx) => (
              <li key={idx} className="flex flex-col gap-2.5">
                {item.image && (
                  <Image image={item.image} layout="auto" aspectRatio={2.5} />
                )}
                <Heading
                  semanticLevelOverride={
                    headingLevel < 6
                      ? ((headingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={insuranceProviderNameLevel}
                >
                  {item.title}
                </Heading>
              </li>
            ))}
          </ul>
        </EntityField>
      )}
    </PageSection>
  );
};

export const FINS_InsuranceProvidersSection: ComponentConfig<FINS_InsuranceSectionProps> =
  {
    label: "FINS - Insurance Providers Section",
    fields: insuranceSectionFields,
    defaultProps: {
      styles: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 2,
        insuranceProviderNameLevel: 5,
      },
      data: {
        headingText: {
          field: "",
          constantValue: "Find the best coverage for you",
          constantValueEnabled: true,
        },
        entityField: {
          field: "",
          constantValue: {
            insuranceProviders: [
              {
                title: "Insurance Name",
                image: {
                  alternateText: "Insurance Provider Logo",
                  height: 105,
                  url: PLACEHOLDER_IMAGE_URL,
                  width: 260,
                },
              },
              {
                title: "Insurance Name",
                image: {
                  alternateText: "Insurance Provider Logo",
                  height: 105,
                  url: PLACEHOLDER_IMAGE_URL,
                  width: 260,
                },
              },
              {
                title: "Insurance Name",
                image: {
                  alternateText: "Insurance Provider Logo",
                  height: 105,
                  url: PLACEHOLDER_IMAGE_URL,
                  width: 260,
                },
              },
              {
                title: "Insurance Name",
                image: {
                  alternateText: "Insurance Provider Logo",
                  height: 105,
                  url: PLACEHOLDER_IMAGE_URL,
                  width: 260,
                },
              },
              {
                title: "Insurance Name",
                image: {
                  alternateText: "Insurance Provider Logo",
                  height: 105,
                  url: PLACEHOLDER_IMAGE_URL,
                  width: 260,
                },
              },
              {
                title: "Insurance Name",
                image: {
                  alternateText: "Insurance Provider Logo",
                  height: 105,
                  url: PLACEHOLDER_IMAGE_URL,
                  width: 260,
                },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      liveVisibility: true,
    },
    render: (props) => (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <InsuranceProvidersSectionWrapper {...props} />
      </VisibilityWrapper>
    ),
  };
