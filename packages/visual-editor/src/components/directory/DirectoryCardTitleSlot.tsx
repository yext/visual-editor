import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { useDocument } from "../../hooks/useDocument.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { Heading } from "../atoms/heading.tsx";
import { TranslatableString } from "../../types/types.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { pt, msg } from "../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { useTranslation } from "react-i18next";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";
import { HeadingTextProps } from "../contentBlocks/HeadingText.tsx";

export type DirectoryCardTitleSlotProps = {
  /**
   * The title text value.
   * Supports embedding the subfields of dm_directoryChildren.
   */
  data: {
    text: TranslatableString;
  };

  /** Styling for the title (same options as HeadingText). */
  styles: HeadingTextProps["styles"];
};

const directoryCardTitleSlotFields: YextFields<DirectoryCardTitleSlotProps> = {
  data: {
    label: msg("fields.data", "Data"),
    type: "object",
    objectFields: {
      text: {
        type: "translatableString",
        label: msg("fields.text", "Text"),
        filter: {
          types: ["type.string"],
        },
        sourceField: "dm_directoryChildren",
        showApplyAllOption: true,
      },
    },
  },
  styles: {
    label: msg("fields.styles", "Styles"),
    type: "object",
    objectFields: {
      level: {
        type: "basicSelector",
        label: msg("fields.headingLevel", "Heading Level"),
        options: "HEADING_LEVEL",
      },
      align: {
        label: msg("fields.headingAlign", "Heading Align"),
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      },
      color: {
        type: "basicSelector",
        label: msg("fields.color", "Color"),
        options: "SITE_COLOR",
      },
    },
  },
};

const DirectoryCardTitleSlotComponent: PuckComponent<
  DirectoryCardTitleSlotProps
> = (props) => {
  const { data, styles, puck } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const justifyClass = styles?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.align]
    : "justify-start";

  const alignClass = styles?.align
    ? {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }[styles.align]
    : "text-left";

  const resolvedHeadingText = resolveComponentData(
    data.text,
    i18n.language,
    streamDocument
  );

  return resolvedHeadingText ? (
    <div className={`flex w-full ${justifyClass}`}>
      <EntityField
        displayName={pt("heading", "Heading") + " " + styles.level}
        constantValueEnabled={true}
      >
        <Heading
          level={styles.level}
          className={alignClass}
          semanticLevelOverride={styles.semanticLevelOverride}
          color={styles.color}
        >
          {resolvedHeadingText}
        </Heading>
      </EntityField>
    </div>
  ) : puck.isEditing ? (
    <div className="h-[30px]" />
  ) : (
    <></>
  );
};

export const DirectoryCardTitleSlot: YextComponentConfig<DirectoryCardTitleSlotProps> =
  {
    label: msg("components.directoryCardTitle", "Directory Card Title"),
    fields: directoryCardTitleSlotFields,
    defaultProps: {
      data: {
        text: {
          defaultValue: "[[name]]",
        },
      },
      styles: {
        level: 3,
        align: "left",
      },
    },
    render: (props) => <DirectoryCardTitleSlotComponent {...props} />,
  };
