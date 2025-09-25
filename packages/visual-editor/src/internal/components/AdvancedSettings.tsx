import { ComponentConfig, Fields, CustomField } from "@measured/puck";
import { msg, YextField, useDocument } from "@yext/visual-editor";
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

const LOCAL_BUSINESS_SCHEMA = `{
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

const DIRECTORY_LIST_ITEM_SCHEMA = `{
  "@type": "ListItem",
  "position": "[[position]]",
  "item": {
    "@type": "Place",
    "name": "[[name]]",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "[[address.line1]]",
      "addressLocality": "[[address.city]]",
      "addressRegion": "[[address.region]]",
      "postalCode": "[[address.postalCode]]",
      "addressCountry": "[[address.countryCode]]"
    }
  }
}`;

// TODO: get produtionDomain/slug to populated urlWriteback
const FALLBACK_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "Thing",
  "name": "[[name]]",
  "description": "[[description]]",
  "url": "[[urlWriteback]]"
}`;

// Function to get the appropriate schema template based on entity type
const getSchemaTemplate = (entityTypeId?: string): string => {
  if (!entityTypeId) {
    return FALLBACK_SCHEMA;
  }

  if (
    entityTypeId === "location" ||
    entityTypeId === "financialProfessional" ||
    entityTypeId === "healthcareProfessional"
  ) {
    return LOCAL_BUSINESS_SCHEMA;
  } else if (entityTypeId.startsWith("dm_")) {
    // Determine position based on entity type
    let position = 1; // default for dm_root
    if (entityTypeId === "dm_root") {
      position = 1;
    } else if (entityTypeId === "dm_country") {
      position = 2;
    } else if (entityTypeId === "dm_region") {
      position = 3;
    } else if (entityTypeId === "dm_city") {
      position = 4;
    }

    return DIRECTORY_LIST_ITEM_SCHEMA.replace(
      "[[position]]",
      position.toString()
    );
  } else {
    return FALLBACK_SCHEMA;
  }
};

const SCHEMA_MARKUP_FIELD: CustomField<string> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const [pendingMessageId, setPendingMessageId] = React.useState<
      string | undefined
    >();

    const streamDocument = useDocument();
    const entityTypeId = (streamDocument as any)?.meta?.entityType?.id;

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

    // Use the schema value from root, or default schema if not set
    const displayValue =
      value || (entityTypeId ? getSchemaTemplate(entityTypeId) : "");

    const codeField = YextField(msg("schemaMarkup", "Schema Markup"), {
      type: "code",
      codeLanguage: "json",
    });

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Clean the schema value to remove newlines and extra whitespace
      const cleanSchemaValue = displayValue.replace(/\n\s*/g, " ").trim();

      /** Handles local development testing outside of Storm */
      if (window.location.href.includes("http://localhost:5173/dev-location")) {
        const userInput = prompt("Enter Schema Markup:", displayValue);
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
      schemaMarkup: "",
    },
  },
  render: () => {
    return <></>;
  },
};
