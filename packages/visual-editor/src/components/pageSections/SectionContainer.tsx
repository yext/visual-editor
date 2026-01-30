import * as React from "react";
import { PageSection } from "../atoms/pageSection.tsx";
import { Heading, HeadingProps } from "../atoms/heading.tsx";
import {
  BackgroundStyle,
  ThemeOptions,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { OtherCategory } from "../categories/OtherCategory.tsx";
import { PageSectionCategory } from "../categories/PageSectionCategory.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { TranslatableString } from "../../types/types.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary.tsx";

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

export const SectionContainer: ComponentConfig<{
  props: SectionContainerProps;
}> = {
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
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <SectionContainerComponent {...props} />
      </VisibilityWrapper>
    </ComponentErrorBoundary>
  ),
};
