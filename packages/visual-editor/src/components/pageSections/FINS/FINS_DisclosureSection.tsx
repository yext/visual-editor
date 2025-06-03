import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  EntityField,
  Heading,
  HeadingLevel,
  MaybeRTF,
  PageSection,
  resolveYextEntityField,
  RTF2,
  useDocument,
  VisibilityWrapper,
  YextEntityField,
  YextField,
} from "@yext/visual-editor";

export interface FINS_DisclosureSectionProps {
  data: {
    headingText: YextEntityField<string>;
    description: YextEntityField<RTF2 | string>;
  };
  styles: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };
  liveVisibility: boolean;
}

const disclosureSectionFields: Fields<FINS_DisclosureSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      headingText: YextField("Heading Text", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      description: YextField("Description", {
        type: "entityField",
        filter: {
          types: ["type.string", "type.rich_text_v2"],
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
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

const DisclosureSectionWrapper = ({
  data: { headingText, description },
  styles: { backgroundColor, headingLevel },
}: FINS_DisclosureSectionProps) => {
  const document = useDocument();
  const resolvedHeadingText = resolveYextEntityField<string>(
    document,
    headingText
  );
  const resolvedDisclosureText = resolveYextEntityField<string | RTF2>(
    document,
    description
  );

  return (
    <PageSection
      background={backgroundColor}
      aria-label="Disclosure"
      className="flex flex-col gap-4 w-full"
    >
      {resolvedHeadingText && (
        <EntityField
          displayName="Heading Text"
          fieldId={headingText.field}
          constantValueEnabled={headingText.constantValueEnabled}
        >
          <Heading level={headingLevel}>{resolvedHeadingText}</Heading>
        </EntityField>
      )}
      {resolvedDisclosureText && (
        <EntityField
          displayName="Disclosure Text"
          fieldId={description.field}
          constantValueEnabled={description.constantValueEnabled}
        >
          <MaybeRTF
            className="text-xs"
            data={resolvedDisclosureText}
          ></MaybeRTF>
        </EntityField>
      )}
    </PageSection>
  );
};

export const FINS_DisclosureSection: ComponentConfig<FINS_DisclosureSectionProps> =
  {
    label: "FINS - Disclosure Section",
    fields: disclosureSectionFields,
    defaultProps: {
      data: {
        headingText: {
          field: "",
          constantValue: "Disclosure",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi, modi asperiores, suscipit delectus eos expedita vero iste iure vel facere sed recusandae temporibus, fugiat natus. Dolore cumque blanditiis eligendi adipisci?",
          constantValueEnabled: true,
        },
      },
      styles: {
        headingLevel: 4,
        backgroundColor: backgroundColors.background3.value,
      },
      liveVisibility: true,
    },
    render: (props) => (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <DisclosureSectionWrapper {...props} />
      </VisibilityWrapper>
    ),
  };
