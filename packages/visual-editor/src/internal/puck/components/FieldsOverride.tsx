import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { createUsePuck, useGetPuck } from "@puckeditor/core";
import { AdvancedSettings } from "../../../internal/components/AdvancedSettings";
import { msg, pt } from "../../../utils/i18n/platform";

const usePuck = createUsePuck();

// Overrides the right sidebar when the Advanced Settings panel is active
export const fieldsOverride = ({ children }: { children: React.ReactNode }) => {
  const getPuck = useGetPuck();
  const appState = usePuck((s) => s.appState);

  const isAdvancedSettingsSelected =
    appState?.ui?.itemSelector &&
    appState.ui.itemSelector.zone === "root:advanced";

  if (isAdvancedSettingsSelected) {
    const advancedSettingsField = AdvancedSettings.fields?.data;

    if (
      advancedSettingsField &&
      advancedSettingsField.type === "object" &&
      advancedSettingsField.objectFields?.schemaMarkup
    ) {
      const schemaField = advancedSettingsField.objectFields
        .schemaMarkup as any;

      if (schemaField.type === "custom" && schemaField.render) {
        return (
          <div className="ve-p-4 ve-mb-4">
            {/* Title */}
            <div className="ve-mb-4">
              <div className="ve-text-md ve-font-semibold ve-text-gray-900 ve-mb-2">
                {pt("advancedSettings", "Advanced Settings")}
              </div>
            </div>

            {/* Schema markup field */}
            {React.createElement(schemaField.render, {
              onChange: (newValue: string) => {
                const { dispatch } = getPuck();
                dispatch({
                  type: "replaceRoot" as const,
                  root: {
                    ...appState.data.root,
                    props: {
                      ...appState.data.root?.props,
                      schemaMarkup: newValue,
                    } as any,
                  },
                });
              },
              value: appState.data.root?.props?.schemaMarkup || "",
              field: { label: msg("schemaMarkup", "Schema Markup") },
            })}

            {/* Back button */}
            <div className="ve-mt-4">
              <button
                onClick={() => {
                  const { dispatch } = getPuck();
                  dispatch({
                    type: "setUi",
                    ui: {
                      ...appState.ui,
                      itemSelector: null,
                      rightSideBarVisible: true,
                    },
                  });
                }}
                className="ve-flex ve-items-center ve-gap-2 ve-text-sm ve-text-blue-600 hover:ve-text-blue-800 ve-bg-none ve-border-none ve-cursor-pointer ve-p-0"
              >
                <FaArrowLeft className="ve-w-4 ve-h-4" />
                {pt("back", "Back")}
              </button>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
};
