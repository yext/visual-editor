import * as React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { TranslatableString } from "../../types/types.ts";
import { Body } from "../atoms/body.tsx";
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

  let alignmentStyle = ["text-center"];
  switch (alignment) {
    case "left": {
      alignmentStyle.push("md:text-left");
      break;
    }
    case "right": {
      alignmentStyle.push("md:text-right");
      break;
    }
    default:
      break;
  }

  return resolvedText ? (
    <Body variant="xs" className={alignmentStyle.join(" ")}>
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
