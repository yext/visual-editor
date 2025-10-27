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

  const text = resolveComponentData(data.text, i18n.language, streamDocument);

  // Show EntityField if there's any content (including empty string after resolving)
  let hasContent = false;
  if (data.text.constantValueEnabled) {
    const val = data.text.constantValue;
    hasContent =
      typeof val === "string"
        ? val !== undefined
        : val && "en" in val && val.en !== undefined;
  } else {
    hasContent = !!data.text.field;
  }

  return hasContent ? (
    <EntityField
      displayName={pt("copyrightMessage", "Copyright Message")}
      fieldId={data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      <p className="text-xs">{text || ""}</p>
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[20px] min-w-[100px]" />
  ) : (
    <></>
  );
};

export const CopyrightMessageSlot: ComponentConfig<{
  props: CopyrightMessageSlotProps;
}> = {
  label: msg("components.copyrightMessageSlot", "Copyright Message"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        text: YextField(msg("fields.copyrightMessage", "Copyright Message"), {
          type: "translatableString",
          filter: { types: ["type.string"] },
        }),
      },
    }),
  },
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: { en: "", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
    },
  },
  render: (props) => <CopyrightMessageSlotInternal {...props} />,
};
