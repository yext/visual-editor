import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  useDocument,
  EntityField,
  YextEntityField,
  Heading,
  HeadingProps,
  YextField,
  TranslatableString,
  resolveComponentData,
  pt,
  msg,
  ThemeOptions,
  HeadingLevel,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export type HeadingTextProps = {
  /** The heading text value */
  data: {
    text: YextEntityField<TranslatableString>;
  };

  /** Styling for the heading. */
  styles: {
    /** The h tag level of the section heading */
    level: HeadingProps["level"];
    /** Alignment of the event section heading */
    align: "left" | "center" | "right";
    /** Optional override to render a different HTML tag instead of the one based on the level */
    semanticLevelOverride?: HeadingLevel | "span";
  };

  /** @internal Controlled data from the parent section */
  parentData?: {
    field: string;
    text: string;
  };
};

const HeadingTextWrapper: PuckComponent<HeadingTextProps> = (props) => {
  const { data, styles, puck, parentData } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const justifyClass = styles?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.align]
    : "justify-start";

  const resolvedHeadingText = parentData
    ? parentData.text
    : resolveComponentData(data.text, i18n.language, streamDocument);

  return resolvedHeadingText ? (
    <div className={`flex ${justifyClass}`}>
      <EntityField
        displayName={pt("Heading", "Heading") + " " + styles.level}
        fieldId={parentData ? parentData.field : data.text.field}
        constantValueEnabled={!parentData && data.text.constantValueEnabled}
      >
        <Heading
          level={styles.level}
          semanticLevelOverride={styles.semanticLevelOverride}
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

const headingTextFields: Fields<HeadingTextProps> = {
  data: {
    label: msg("fields.data", "Data"),
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableString>(msg("fields.text", "Text"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
    },
  },
  styles: {
    label: msg("fields.styles", "Styles"),
    type: "object",
    objectFields: {
      level: YextField(msg("fields.headingLevel", "Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      align: YextField(msg("fields.headingAlign", "Heading Align"), {
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      }),
    },
  },
};

export const HeadingText: ComponentConfig<{ props: HeadingTextProps }> = {
  label: msg("components.headingText", "Heading Text"),
  fields: headingTextFields,
  resolveFields: (data) => {
    if (data.props.parentData) {
      return {
        ...headingTextFields,
        data: {
          label: msg("fields.data", "Data"),
          type: "object",
          objectFields: {
            info: {
              type: "custom",
              render: () => (
                <p style={{ fontSize: "var(--puck-font-size-xxs)" }}>
                  Data is inherited from the parent section.
                </p>
              ),
            },
          },
        },
      } as any;
    }
    return headingTextFields;
  },
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: {
          en: "Text",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      level: 2,
      align: "left",
    },
  },
  render: (props) => <HeadingTextWrapper {...props} />,
};
