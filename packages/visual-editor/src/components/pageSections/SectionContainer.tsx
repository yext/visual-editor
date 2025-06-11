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
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@measured/puck";
import { useTranslation } from "react-i18next";

export type SectionContainerProps = {
  background?: BackgroundStyle;
  sectionHeading: {
    text: YextEntityField<TranslatableString>;
    level: HeadingProps["level"];
    alignment: "left" | "right" | "center";
  };
  liveVisibility: boolean;
  sectionContent: Slot;
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
      text: YextField<any, TranslatableString>("Section Heading Text", {
        type: "entityField",
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
  sectionContent: {
    type: "slot",
  },
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const SectionContainerComponent: PuckComponent<SectionContainerProps> = (
  props
) => {
  const { background, sectionHeading, sectionContent: SectionContent } = props;
  const document = useDocument();
  const { i18n } = useTranslation();

  const resolvedHeadingText = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, sectionHeading.text),
    i18n.language
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
      <SectionContent disallow={[...OtherCategory, ...PageSectionCategory]} />
    </PageSection>
  );
};

export const SectionContainer: ComponentConfig<SectionContainerProps> = {
  label: "Section Container",
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
    sectionContent: [],
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
