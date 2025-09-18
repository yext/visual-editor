import { ComponentConfig, Fields, CustomField } from "@measured/puck";
import { msg, YextField } from "@yext/visual-editor";
import React from "react";
import {
  useSendMessageToParent,
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../hooks/useMessage";

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

const DEFAULT_SCHEMA_TEMPLATE = `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[[name]]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[[address.line1]]",
    "addressLocality": "[[address.city]]",
    "addressRegion": "[[address.region]]",
    "postalCode": "[[address.postalCode]]",
    "addressCountry": "[[address.countryCode]]"
  },
  "openingHours": "[[hours]]",
  "image": "[[photoGallery]]",
  "description": "[[description]]",
  "telephone": "[[mainPhone]]",
  "paymentAccepted": "[[paymentOptions]]",
  "hasOfferCatalog": "[[services]]"
}`;

const SCHEMA_MARKUP_FIELD: CustomField<string> = {
  type: "custom",
  render: ({ onChange }) => {
    const [pendingMessageId, setPendingMessageId] = React.useState<
      string | undefined
    >();

    const { sendToParent: openSchemaMarkupDrawer } = useSendMessageToParent(
      "constantValueEditorOpened",
      TARGET_ORIGINS
    );

    useReceiveMessage(
      "constantValueEditorClosed",
      TARGET_ORIGINS,
      (_, payload) => {
        if (pendingMessageId && pendingMessageId === payload?.id) {
          onChange(String(payload.value || ""));
        }
      }
    );

    const displayValue = DEFAULT_SCHEMA_TEMPLATE;

    const codeField = YextField(msg("schemaMarkup", "Schema Markup"), {
      type: "code",
      codeLanguage: "json",
    });

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      console.log("Schema markup clicked!");

      // Clean the schema value to remove newlines and extra whitespace
      const cleanSchemaValue = DEFAULT_SCHEMA_TEMPLATE.replace(
        /\n\s*/g,
        " "
      ).trim();

      /** Handles local development testing outside of Storm */
      if (window.location.href.includes("http://localhost:5173/dev-location")) {
        const userInput = prompt(
          "Enter Schema Markup:",
          DEFAULT_SCHEMA_TEMPLATE
        );
        if (userInput !== null) {
          onChange(userInput);
        }
      } else {
        /** Instructs Storm to open the schema markup drawer */
        const messageId = `SchemaMarkup-${Date.now()}`;
        setPendingMessageId(messageId);

        const payload = {
          type: "SchemaMarkup",
          value: cleanSchemaValue,
          id: messageId,
        };

        console.log("Sending schema markup payload:", payload);
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
          {(codeField as any).render({
            onChange: (newValue: string | number) => {
              onChange(String(newValue));
            },
            value: displayValue,
            field: codeField,
            name: "schemaMarkup",
            id: "schemaMarkup",
          })}
        </div>
      </div>
    );
  },
};

const advancedSettingsFields: Fields<AdvancedSettingsProps> = {
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
export const AdvancedSettings: ComponentConfig<{
  props: AdvancedSettingsProps;
}> = {
  label: msg("advancedSettings", "Advanced Settings"),
  fields: advancedSettingsFields,
  defaultProps: {
    data: {
      schemaMarkup: DEFAULT_SCHEMA_TEMPLATE,
    },
  },
  render: () => {
    return <></>;
  },
};
