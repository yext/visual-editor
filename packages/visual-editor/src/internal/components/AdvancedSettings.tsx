import { ComponentConfig, Fields } from "@measured/puck";
import { msg } from "@yext/visual-editor";
import React from "react";

export interface AdvancedSettingsProps {
  /**
   * Schema markup configuration for the page.
   */
  data: {
    /**
     * @defaultValue ""
     */
    schemaMarkup: string;
  };
}

const advancedSettingsFields: Fields<AdvancedSettingsProps> = {
  data: {
    type: "object",
    objectFields: {
      schemaMarkup: {
        type: "textarea",
        label: msg("schemaMarkup", "Schema Markup"),
      },
    },
  },
};

/**
 * Advanced Settings component for page-level configuration options.
 * This component provides access to advanced page settings like schema markup.
 * It includes breadcrumb navigation to show "Page > Advanced Settings".
 */
export const AdvancedSettings: ComponentConfig<{
  props: AdvancedSettingsProps;
}> = {
  label: msg("advancedSettings", "Advanced Settings"),
  fields: advancedSettingsFields,
  defaultProps: {
    data: {
      schemaMarkup: "",
    },
  },
  render: () => {
    return <></>;
  },
};
