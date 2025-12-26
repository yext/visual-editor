import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  msg,
  useDocument,
  resolveComponentData,
  TranslatableString,
  Body,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface CopyrightMessageSlotProps {
  data: {
    text: TranslatableString;
  };
  /** @internal */
  alignment?: "left" | "center" | "right";
}

const CopyrightMessageSlotInternal: PuckComponent<CopyrightMessageSlotProps> = (
  props
) => {
  const { data, puck, alignment = "left" } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const resolvedText = resolveComponentData(
    data.text,
    i18n.language,
    streamDocument
  );

  return resolvedText ? (
    <Body
      variant="xs"
      className={
        alignment === "right"
          ? "text-center md:text-right"
          : alignment === "center"
            ? "text-center"
            : "text-center md:text-left"
      }
    >
      {resolvedText}
    </Body>
  ) : puck.isEditing ? (
    <div className="h-[20px] min-w-[100px]" />
  ) : (
    <></>
  );
};

export const defaultCopyrightMessageSlotProps: CopyrightMessageSlotProps = {
  data: {
    text: {
      en: "",
      hasLocalizedValue: "true",
    },
  },
};

export const CopyrightMessageSlot: ComponentConfig<{
  props: CopyrightMessageSlotProps;
}> = {
  label: msg("components.copyrightMessage", "Copyright Message"),
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
  defaultProps: defaultCopyrightMessageSlotProps,
  render: (props) => <CopyrightMessageSlotInternal {...props} />,
};
