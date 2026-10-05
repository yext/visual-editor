import { CustomField, FieldLabel } from "@puckeditor/core";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import React from "react";
import {
  useSendMessageToParent,
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../hooks/useMessage.ts";
import { getSchemaTemplate } from "../../utils/schema/defaultSchemas.ts";
import { isLocalDev } from "../../utils/isLocalDev.ts";
import { getCustomSchemaTemplate } from "../../utils/schema/defaultCustomSchemas.ts";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

let pendingSchemaMarkupSession:
  | { messageId: string; apply: (payload: any) => void }
  | undefined;

export interface AdvancedSettingsProps {
  /**
   * Schema markup configuration for the page.
   */
  data: {
    /**
     * Whether schemaMarkup (recommended) or customSchemaMarkup (custom) is being used.
     * Absent on old layouts; defaults to Recommended.
     **/
    schemaMode?: "recommended" | "custom";
    schemaMarkup: string;
    customSchemaMarkup?: string;
  };
}

const createSchemaMarkupField = (custom: boolean): CustomField<string> => ({
  type: "custom",
  render: ({ onChange, value }) => {
    const streamDocument = useDocument();

    const { sendToParent: openSchemaMarkupDrawer } = useSendMessageToParent(
      "constantValueEditorOpened",
      TARGET_ORIGINS
    );

    useReceiveMessage(
      "constantValueEditorClosed",
      TARGET_ORIGINS,
      (_, payload) => {
        const session = pendingSchemaMarkupSession;
        if (!session || session.messageId !== payload?.id) {
          return;
        }
        pendingSchemaMarkupSession = undefined;
        session.apply(payload);
      }
    );

    const recommendedDefaultSchema = custom
      ? ""
      : getSchemaTemplate(streamDocument);

    // Use the schema value from root, or default schema if not set
    const schema = custom
      ? (value ?? getCustomSchemaTemplate(streamDocument))
      : value || recommendedDefaultSchema;

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      /** Handles local development testing outside of Storm */
      if (isLocalDev()) {
        const userInput = prompt("Enter Schema Markup:", schema);
        if (userInput !== null) {
          onChange(userInput);
        }
      } else {
        /** Instructs Storm to open the schema markup drawer */
        const messageId = `${custom ? "CustomSchemaMarkup" : "SchemaMarkup"}-${Date.now()}`;
        pendingSchemaMarkupSession = {
          messageId,
          apply: (payload) => {
            if (typeof payload.value === "string") onChange(payload.value);
          },
        };

        const payload = {
          type: custom ? "CustomSchemaMarkup" : "SchemaMarkup",
          value: schema,
          ...(!custom && { defaultValue: recommendedDefaultSchema }),
          id: messageId,
        };

        openSchemaMarkupDrawer({ payload });
      }
    };

    return (
      <FieldLabel label={pt("schemaMarkup", "Schema Markup")}>
        <button
          type="button"
          aria-label={pt("schemaMarkup", "Schema Markup")}
          onClick={handleClick}
          className="CodeField"
        >
          <div className="ve-line-clamp-3">{schema}</div>
        </button>
      </FieldLabel>
    );
  },
});

const advancedSettingsFields: YextFields<AdvancedSettingsProps> = {
  data: {
    type: "object",
    objectFields: {
      schemaMode: {
        type: "radio",
        label: msg("schemaMode", "Schema Mode"),
        options: [
          { label: msg("recommended", "Recommended"), value: "recommended" },
          { label: msg("custom", "Custom"), value: "custom" },
        ],
      },
      schemaMarkup: createSchemaMarkupField(false),
      customSchemaMarkup: createSchemaMarkupField(true),
    },
  },
};

/**
 * Advanced Settings component for page-level configuration options.
 * This component provides access to advanced page settings like schema markup.
 * It includes breadcrumb navigation to show "Page > Advanced Settings".
 */
export const AdvancedSettings: YextComponentConfig<AdvancedSettingsProps> = {
  label: msg("advancedSettings", "Advanced Settings"),
  fields: advancedSettingsFields,
  defaultProps: {
    data: {
      schemaMode: "recommended",
      schemaMarkup: "",
    },
  },
  render: () => {
    return <></>;
  },
};
