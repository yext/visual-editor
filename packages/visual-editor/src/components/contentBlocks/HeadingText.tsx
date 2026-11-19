import {
  type TypographyRole,
  ThemeOptions,
  HeadingLevel,
  ThemeColor,
} from "../../utils/themeOptions.ts";
import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { useDocument } from "../../hooks/useDocument.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { Heading, HeadingProps } from "../atoms/heading.tsx";
import { TranslatableString } from "../../types/types.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { pt, msg } from "../../utils/i18n/platform.ts";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { useTranslation } from "react-i18next";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

export type HeadingTextProps = {
  /** The heading text value */
  data: {
    text: YextEntityField<TranslatableString>;
  };

  /** Styling for the heading. */
  styles: {
    /** The h tag level of the section heading */
    level?: HeadingProps["level"];
    /** Alignment of the event section heading */
    align: "left" | "center" | "right";
    /** Optional override to render a different HTML tag instead of the one based on the level */
    semanticLevelOverride?: HeadingLevel | "span" | "p";
    color?: ThemeColor;
    typographyRole?: TypographyRole;
  };

  /** @internal Default typography supplied by the placement. */
  parentStyles?: { typographyRole?: TypographyRole };

  /** @internal Controlled data from the parent section */
  parentData?: {
    field: string;
    text?: string;
  };
};

const HeadingTextWrapper: PuckComponent<
  HeadingTextProps & { defaultTypographyRole?: TypographyRole }
> = (props) => {
  const { data, styles, puck, parentData, defaultTypographyRole } = props;
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

  const resolvedHeadingText =
    parentData?.text ??
    resolveComponentData(data.text, i18n.language, streamDocument);

  return resolvedHeadingText ? (
    <div className={`flex w-full ${justifyClass}`}>
      <EntityField
        displayName={pt("heading", "Heading") + " " + styles.level}
        fieldId={parentData ? parentData.field : data.text.field}
        constantValueEnabled={!parentData && data.text.constantValueEnabled}
      >
        <Heading
          level={styles.level ?? 2}
          className={alignClass}
          semanticLevelOverride={styles.semanticLevelOverride}
          color={styles.color}
          typographyRole={
            styles.typographyRole ??
            props.parentStyles?.typographyRole ??
            defaultTypographyRole
          }
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

const headingTextSlotFields = {
  data: {
    label: msg("fields.data", "Data"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: {
          types: ["type.string"],
        },
      },
    },
  },
  styles: {
    label: msg("fields.styles", "Styles"),
    type: "object",
    objectFields: {
      level: { type: "number", visible: false },
      typographyRole: { type: "typographyRole" },
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
} satisfies YextFields<HeadingTextProps>;

const headingTextFields = {
  ...headingTextSlotFields,
  styles: {
    ...headingTextSlotFields.styles,
    objectFields: {
      ...headingTextSlotFields.styles.objectFields,
      level: {
        type: "basicSelector",
        label: msg("fields.headingLevel", "Heading Level"),
        options: "HEADING_LEVEL",
      },
    },
  },
} satisfies YextFields<HeadingTextProps>;

export const HeadingText: YextComponentConfig<HeadingTextProps> = {
  label: msg("components.headingText", "Heading Text"),
  fields: headingTextFields,
  resolveFields: (data) =>
    resolveDataFromParent(
      data.props.styles?.semanticLevelOverride === undefined
        ? headingTextFields
        : headingTextSlotFields,
      data
    ),
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: { defaultValue: "Text" },
        constantValueEnabled: true,
      },
    },
    styles: {
      level: 2,
      align: "left",
    },
  },
  render: (props) => (
    <HeadingTextWrapper {...props} defaultTypographyRole="section-title" />
  ),
};

export const HeadingTextSlot: YextComponentConfig<HeadingTextProps> = {
  ...HeadingText,
  fields: headingTextSlotFields,
  resolveFields: (data) => resolveDataFromParent(headingTextSlotFields, data),
  render: (props) => <HeadingTextWrapper {...props} />,
};
