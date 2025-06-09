import { AutoField, CustomField, TextField } from "@measured/puck";
import React from "react";
import { TranslatableString } from "../../../types/types.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { getDisplayValue } from "../../../utils/resolveTranslatableString.ts";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_TEXT_CONSTANT_CONFIG: CustomField<TranslatableString> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: any = useDocument();
      const locale = document?.locale ?? "en";

      return (
        <AutoField
          field={{ type: "text" }}
          value={getDisplayValue(value, locale)}
          onChange={(val) =>
            onChange({
              ...(typeof value === "object" &&
              value !== null &&
              !Array.isArray(value)
                ? value
                : {}),
              [locale]: val,
            })
          }
        />
      );
    },
  };
