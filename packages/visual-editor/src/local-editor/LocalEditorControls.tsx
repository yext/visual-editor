import React from "react";
import { shellStyles } from "./styles.ts";
import type { LocalEditorEntityOption } from "./types.ts";

type LocalEditorControlsProps = {
  activeEntities: LocalEditorEntityOption[];
  activeTemplateOptions: string[];
  controlsDisabled: boolean;
  selectedEntityId?: string;
  selectedLocale: string;
  selectedTemplateId: string;
  onEntityChange: (entityId: string) => void;
  onLocaleChange: (locale: string) => void;
  onTemplateChange: (templateId: string) => void;
};

export const LocalEditorControls = ({
  activeEntities,
  activeTemplateOptions,
  controlsDisabled,
  selectedEntityId,
  selectedLocale,
  selectedTemplateId,
  onEntityChange,
  onLocaleChange,
  onTemplateChange,
}: LocalEditorControlsProps) => {
  const selectedEntity = activeEntities.find((entity) => {
    return entity.entityId === selectedEntityId;
  });

  return (
    <div style={shellStyles.controls}>
      <ControlGroup label="Template">
        <select
          value={selectedTemplateId}
          disabled={controlsDisabled}
          onChange={(event) => {
            onTemplateChange(event.target.value);
          }}
        >
          {activeTemplateOptions.map((templateId) => (
            <option key={templateId} value={templateId}>
              {templateId}
            </option>
          ))}
        </select>
      </ControlGroup>

      <ControlGroup label="Entity">
        <select
          value={selectedEntityId ?? ""}
          disabled={controlsDisabled}
          onChange={(event) => {
            onEntityChange(event.target.value);
          }}
        >
          {activeEntities.map((entity) => (
            <option key={entity.entityId} value={entity.entityId}>
              {entity.displayName}
            </option>
          ))}
        </select>
      </ControlGroup>

      <ControlGroup label="Locale">
        <select
          value={selectedLocale}
          disabled={controlsDisabled || !selectedEntity?.locales.length}
          onChange={(event) => {
            onLocaleChange(event.target.value);
          }}
        >
          {(selectedEntity?.locales ?? []).map((locale) => (
            <option key={locale} value={locale}>
              {locale}
            </option>
          ))}
        </select>
      </ControlGroup>
    </div>
  );
};

const ControlGroup = ({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) => {
  return (
    <label style={shellStyles.controlGroup}>
      <span style={shellStyles.controlLabel}>{label}</span>
      {children}
    </label>
  );
};
