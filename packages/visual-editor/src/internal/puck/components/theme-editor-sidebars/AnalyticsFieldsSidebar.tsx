import React from "react";
import { FieldLabel, AutoField, Field } from "@measured/puck";
import { OnThemeChangeFunc, ThemeData } from "../../../types/themeData.ts";

const analyticsFields: Record<string, Field> = {
  googleTagManagerId: {
    type: "text",
    label: "Google Tag Manager ID",
  },
};

type AnalyticsFieldsSidebarProps = {
  themeData: ThemeData;
  onThemeChange: OnThemeChangeFunc;
};

export const AnalyticsFieldsSidebar = (props: AnalyticsFieldsSidebarProps) => {
  const { themeData, onThemeChange } = props;

  const handleThemeChange = (key: string, value: any) => {
    const newValues = {
      ...themeData,
      siteAttributes: {
        ...themeData.siteAttributes,
        [key]: value,
      },
    };
    onThemeChange(newValues);
  };

  return (
    <div className="ve-m-4 ve-mt-0">
      {Object.entries(analyticsFields).map(([key, field]) => {
        return (
          <FieldLabel
            el={"div"}
            key={key}
            label={field.label ?? ""}
            className="ve-mb-4"
          >
            <AutoField
              field={field}
              onChange={(v) => handleThemeChange(key, v)}
              value={themeData.siteAttributes?.[key] ?? ""}
            />
          </FieldLabel>
        );
      })}
    </div>
  );
};
