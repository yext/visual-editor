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
};

const sectionContainerFields: Fields<SectionContainerProps> = {
  background: YextField("Background Color", {
    type: "select",
    hasSearch: true,
    options: "BACKGROUND_COLOR",
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<string>("Section Heading Text", {
        type: "entity",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      alignment: YextField("Alignment", {
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      }),
    },
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
  label: "Section Container",
  fields: sectionContainerFields,
  render: (props) => <SectionContainerComponent {...props} />,
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
  },
};
