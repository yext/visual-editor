import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  msg,
  useDocument,
  resolveComponentData,
  TranslatableString,
  YextEntityField,
  EntityField,
  pt,
  Body,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface CopyrightMessageSlotProps {
  data: {
    text: YextEntityField<TranslatableString>;
  };
}

const CopyrightMessageSlotInternal: PuckComponent<CopyrightMessageSlotProps> = (
  props
) => {
  const { data, puck } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const resolvedText = resolveComponentData(
    data.text,
    i18n.language,
    streamDocument
  );

  return resolvedText ? (
    <EntityField
      displayName={pt("copyrightMessage", "Copyright Message")}
      fieldId={data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      <Body variant="xs">{resolvedText}</Body>
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[20px] min-w-[100px]" />
  ) : (
    <></>
  );
};

export const defaultCopyrightMessageSlotProps: CopyrightMessageSlotProps = {
  data: {
    text: {
      field: "",
      constantValue: { en: "", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
  },
};

export const CopyrightMessageSlot: ComponentConfig<{
  props: CopyrightMessageSlotProps;
}> = {
  label: msg("components.copyrightMessage", "Copyright Message"),
  fields: {
    data: {
      label: msg("fields.data", "Data"),
      type: "object",
      objectFields: {
        text: YextField<any, TranslatableString>(
          msg("fields.copyrightMessage", "Copyright Message"),
          {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }
        ),
      },
    },
  },
  defaultProps: defaultCopyrightMessageSlotProps,
  render: (props) => <CopyrightMessageSlotInternal {...props} />,
};
