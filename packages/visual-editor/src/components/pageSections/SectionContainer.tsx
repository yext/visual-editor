import * as React from "react";
import {
  PageSection,
  Heading,
  BackgroundStyle,
  YextEntityField,
  ThemeOptions,
  HeadingProps,
  backgroundColors,
  OtherCategory,
  PageSectionCategory,
  useDocument,
  YextField,
  VisibilityWrapper,
  TranslatableString,
  resolveComponentData,
  msg,
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
  background: YextField(msg("fields.backgroundColor", "Background Color"), {
    type: "select",
    options: "BACKGROUND_COLOR",
  }),
  sectionHeading: YextField(msg("fields.sectionHeading", "Section Heading"), {
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableString>(
        msg("fields.sectionHeadingText", "Section Heading Text"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      level: YextField(msg("fields.headingLevel", "Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      alignment: YextField(msg("fields.alignment", "Alignment"), {
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      }),
    },
  }),
  sectionContent: {
    type: "slot",
  },
  liveVisibility: YextField(
    msg("fields.liveVisibility", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: "Show", value: true },
        { label: "Hide", value: false },
      ],
    }
  ),
};

const SectionContainerComponent: PuckComponent<SectionContainerProps> = (
  props
) => {
  const { background, sectionHeading, sectionContent: SectionContent } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const resolvedHeadingText = resolveComponentData(
    sectionHeading.text,
    locale,
    streamDocument
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
