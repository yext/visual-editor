import React from "react";
import type { BaseField, FieldProps } from "@puckeditor/core";
import { msg, type MsgString } from "../utils/i18n/platform.ts";
import {
  type TypographyRole,
  typographyRoleOptions,
} from "../utils/themeOptions.ts";
import { BasicSelectorFieldOverride } from "./BasicSelectorField.tsx";

/** Selects a semantic typography role, including the default for its placement. */
export type TypographyRoleField = BaseField & {
  type: "typographyRole";
  label?: string | MsgString;
  visible?: boolean;
  disableSearch?: boolean;
};

export const TypographyRoleFieldOverride = ({
  field,
  ...props
}: FieldProps<TypographyRoleField, TypographyRole | undefined>) => (
  <BasicSelectorFieldOverride
    {...props}
    field={{
      ...field,
      type: "basicSelector",
      label: field.label ?? msg("fields.typographyRole", "Typography Style"),
      options: [
        {
          label: msg("fields.defaultForPlacement", "Default for Placement"),
          value: undefined,
        },
        ...typographyRoleOptions,
      ],
    }}
  />
);
