import { ComponentConfig, Fields } from "@measured/puck";
import { pt, VisibilityWrapper } from "@yext/visual-editor";
import React from "react";

export interface AdvancedSettingsProps {
  /**
   * Schema markup configuration for the page.
   */
  data: {
    /**
     * JSON-LD schema markup for SEO and structured data.
     * @defaultValue ""
     */
    schemaMarkup: string;
  };
  /**
   * Whether the component is visible on the live page.
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
    // This component doesn't render anything visible on the page
    // It's only used for configuration in the editor
    return (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility ?? true}
        isEditing={props.puck.isEditing}
        iconSize="md"
      >
        <div style={{ display: "none" }}>
          {/* Schema markup editor - hidden from page but used for configuration */}
        </div>
      </VisibilityWrapper>
    );
  },
};
