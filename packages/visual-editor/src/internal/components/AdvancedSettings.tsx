import { CustomField } from "@puckeditor/core";
import { msg } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { YextAutoField } from "../../fields/YextAutoField.tsx";
import React from "react";
import {
  useSendMessageToParent,
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../hooks/useMessage.ts";
import { getSchemaTemplate } from "../../utils/schema/defaultSchemas.ts";
import { isFakeStarterLocalDev } from "../../utils/isFakeStarterLocalDev.ts";
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
     * @defaultValue ""
     */
    schemaMarkup: string;
  };
}

const SCHEMA_MARKUP_FIELD: CustomField<string> = {
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

    const defaultSchema = getSchemaTemplate(streamDocument);

    // Use the schema value from root, or default schema if not set
    const schema = value || defaultSchema;

    const codeField = {
      label: msg("schemaMarkup", "Schema Markup"),
      type: "code" as const,
      codeLanguage: "json" as const,
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      /** Handles local development testing outside of Storm */
      if (isFakeStarterLocalDev()) {
        const userInput = prompt("Enter Schema Markup:", schema);
        if (userInput !== null) {
          onChange(userInput);
        }
      } else {
        /** Instructs Storm to open the schema markup drawer */
        const messageId = `SchemaMarkup-${Date.now()}`;
        pendingSchemaMarkupSession = {
          messageId,
          apply: (payload) => onChange(String(payload.value || "")),
        };

        const payload = {
          type: "SchemaMarkup",
          value: schema,
          defaultValue: defaultSchema,
          id: messageId,
        };

        openSchemaMarkupDrawer({ payload });
      }
    };

    return (
      <div
        onClick={handleClick}
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={(e) => e.preventDefault()}
        className="ve-cursor-pointer"
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          style={{ pointerEvents: "none" }}
        >
          <YextAutoField
            field={codeField}
            id="schemaMarkup"
            onChange={onChange}
            value={schema}
          />
        </div>
      </div>
    );
  },
};

const advancedSettingsFields: YextFields<AdvancedSettingsProps> = {
  data: {
    type: "object",
    objectFields: {
      schemaMarkup: SCHEMA_MARKUP_FIELD,
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
      schemaMarkup: "",
    },
  },
  render: () => {
    return <></>;
  },
};
