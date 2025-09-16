import { ComponentConfig, Fields } from "@measured/puck";
import { pt, VisibilityWrapper } from "@yext/visual-editor";
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
  /**
   * @defaultValue true
   */
  liveVisibility?: boolean;
}

const advancedSettingsFields: Fields<AdvancedSettingsProps> = {
  data: {
    type: "object",
    objectFields: {
      schemaMarkup: {
        type: "textarea",
        label: pt("schemaMarkup", "Schema Markup"),
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
  label: pt("advancedSettings", "Advanced Settings"),
  fields: advancedSettingsFields,
  defaultProps: {
    data: {
      schemaMarkup: "",
    },
    liveVisibility: true,
  },
  render: (props) => {
    return (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility ?? true}
        isEditing={props.puck.isEditing}
        iconSize="md"
      >
        <div style={{ display: "none" }}>{/* Schema markup editor */}</div>
      </VisibilityWrapper>
    );
  },
};
