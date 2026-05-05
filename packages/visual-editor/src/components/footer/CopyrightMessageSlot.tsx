import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { cva } from "class-variance-authority";
import { msg } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { TranslatableString } from "../../types/types.ts";
import { Body } from "../atoms/body.tsx";
import { useTranslation } from "react-i18next";
import { YextComponentConfig } from "../../fields/fields.ts";

export interface CopyrightMessageSlotProps {
  data: {
    text: TranslatableString;
  };
  /** @internal */
  desktopContentAlignment?: "left" | "center" | "right";
  /** @internal */
  mobileContentAlignment?: "left" | "center" | "right";
}

const copyrightAlignment = cva("", {
  variants: {
    desktopContentAlignment: {
      left: "md:text-left",
      center: "md:text-center",
      right: "md:text-right",
    },
    mobileContentAlignment: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    desktopContentAlignment: "left",
    mobileContentAlignment: "left",
  },
});

const CopyrightMessageSlotInternal: PuckComponent<CopyrightMessageSlotProps> = (
  props
) => {
  const {
    data,
    puck,
    desktopContentAlignment = "left",
    mobileContentAlignment = "left",
  } = props;
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
      className={copyrightAlignment({
        desktopContentAlignment,
        mobileContentAlignment,
      })}
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
    text: { defaultValue: "" },
  },
  desktopContentAlignment: "left",
  mobileContentAlignment: "left",
};

export const CopyrightMessageSlot: YextComponentConfig<CopyrightMessageSlotProps> =
  {
    label: msg("components.copyrightMessage", "Copyright Message"),
    fields: {
      data: {
        type: "object",
        label: msg("fields.data", "Data"),
        objectFields: {
          text: {
            type: "translatableString",
            label: msg("fields.copyrightMessage", "Copyright Message"),
            filter: { types: ["type.string"] },
          },
        },
      },
    },
    defaultProps: defaultCopyrightMessageSlotProps,
    render: (props) => <CopyrightMessageSlotInternal {...props} />,
  };
