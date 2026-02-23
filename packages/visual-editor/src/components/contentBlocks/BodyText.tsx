import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { BodyProps, Body } from "../atoms/body.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { pt, msg } from "../../utils/i18n/platform.ts";
import { TranslatableRichText } from "../../types/types.ts";
import { useBackground } from "../../hooks/useBackground.tsx";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { BackgroundStyle } from "../../index.ts";
import { defaultRichText } from "../../utils/i18n/defaultContent.ts";

export type BodyTextProps = {
  data: {
    /** The body text to display. */
    text: YextEntityField<TranslatableRichText>;
  };

  styles: {
    /** The size of the body text. */
    variant: BodyProps["variant"];

    /** The color of the body text. */
    color?: BackgroundStyle;
  };

  /**
   * @internal Controlled data from the parent section.
   */
  parentData?: {
    field: string;
    richText: TranslatableRichText | undefined;
  };

  /** @internal Controlled style from the parent section */
  parentStyles?: {
    className: string;
  };
};

const bodyTextFields: Fields<BodyTextProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      text: YextField(msg("fields.text", "Text"), {
        type: "entityField",
        filter: {
          types: ["type.rich_text_v2"],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "BODY_VARIANT",
      }),
      color: YextField(msg("fields.color", "Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
    },
  }),
};

const BodyTextComponent: PuckComponent<BodyTextProps> = (props) => {
  const { data, styles, puck, parentData } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();

  const sourceData = parentData ? parentData?.richText : data.text;

  const resolvedData = sourceData
    ? resolveComponentData(sourceData, i18n.language, streamDocument, {
        variant: styles.variant,
        isDarkBackground: background?.isDarkBackground,
        className: props.parentStyles?.className,
        color: styles.color,
      })
    : undefined;

  return resolvedData ? (
    <EntityField
      displayName={pt("body", "Body")}
      fieldId={parentData ? parentData.field : data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      {React.isValidElement(resolvedData) ? (
        resolvedData
      ) : (
        <Body variant={styles.variant} color={styles.color}>
          {resolvedData}
        </Body>
      )}
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[60px] min-w-[100px]" />
  ) : (
    <></>
  );
};

export const BodyText: ComponentConfig<{ props: BodyTextProps }> = {
  label: msg("components.richText", "Rich Text"),
  fields: bodyTextFields,
  resolveFields: (data) => resolveDataFromParent(bodyTextFields, data),
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: defaultRichText("componentDefaults.text", "Text"),
        constantValueEnabled: true,
      },
    },
    styles: {
      variant: "base",
    },
  },
  render: (props) => <BodyTextComponent {...props} />,
};
