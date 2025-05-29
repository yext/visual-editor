import * as React from "react";
import {
  PageSection,
  Heading,
  BackgroundStyle,
  YextEntityField,
  ThemeOptions,
  resolveYextEntityField,
  HeadingProps,
  backgroundColors,
  OtherCategory,
  PageSectionCategory,
  useDocument,
  YextField,
  VisibilityWrapper,
  i18n,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  DropZone,
  Fields,
  WithId,
  WithPuckProps,
} from "@measured/puck";

export type SectionContainerProps = {
  background?: BackgroundStyle;
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
    alignment: "left" | "right" | "center";
  };
  liveVisibility: boolean;
};

const sectionContainerFields: Fields<SectionContainerProps> = {
  background: YextField(i18n("Background Color"), {
    type: "select",
    hasSearch: true,
    options: "BACKGROUND_COLOR",
  }),
  sectionHeading: YextField(i18n("Section Heading"), {
    type: "object",
    objectFields: {
      text: YextField<any, string>(i18n("Section Heading Text"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField(i18n("Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      alignment: YextField(i18n("Alignment"), {
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      }),
    },
  }),
  liveVisibility: YextField(i18n("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: i18n("Show"), value: true },
      { label: i18n("Hide"), value: false },
    ],
  }),
};

const SectionContainerComponent = (
  props: WithId<WithPuckProps<SectionContainerProps>>
) => {
  const { background, sectionHeading } = props;
  const document = useDocument();

  const resolvedHeadingText = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[sectionHeading.alignment];

  return (
    <PageSection background={background}>
      {resolvedHeadingText && (
        <Heading
          level={sectionHeading.level}
          className={`flex pb-8 ${justifyClass}`}
        >
          {resolvedHeadingText}
        </Heading>
      )}
      <DropZone
        zone="page-section"
        disallow={[...OtherCategory, ...PageSectionCategory]}
      />
    </PageSection>
  );
};

export const SectionContainer: ComponentConfig<SectionContainerProps> = {
  label: i18n("Section Container"),
  fields: sectionContainerFields,
  defaultProps: {
    background: backgroundColors.background1.value,
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Section",
        constantValueEnabled: true,
      },
      level: 2,
      alignment: "left",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <SectionContainerComponent {...props} />
    </VisibilityWrapper>
  ),
};
