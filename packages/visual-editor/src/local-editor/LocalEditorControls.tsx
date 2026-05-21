import React from "react";
import type { LocalEditorEntityOption, LocalEditorMode } from "./types.ts";

type LocalEditorControlsProps = {
  activeEntities: LocalEditorEntityOption[];
  activeTemplateOptions: string[];
  controlsDisabled: boolean;
  selectedEntityId?: string;
  selectedLocale: string;
  selectedMode: LocalEditorMode;
  selectedTemplateId: string;
  onEntityChange: (entityId: string) => void;
  onLocaleChange: (locale: string) => void;
  onModeChange: (mode: LocalEditorMode) => void;
  onTemplateChange: (templateId: string) => void;
};

export const LocalEditorControls = ({
  activeEntities,
  activeTemplateOptions,
  controlsDisabled,
  selectedEntityId,
  selectedLocale,
  selectedMode,
  selectedTemplateId,
  onEntityChange,
  onLocaleChange,
  onModeChange,
  onTemplateChange,
}: LocalEditorControlsProps) => {
  const selectedEntity = activeEntities.find((entity) => {
    return entity.entityId === selectedEntityId;
  });

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        marginBottom: "16px",
      }}
    >
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

      <ControlGroup label="Editor">
        <button
          type="button"
          disabled={controlsDisabled}
          onClick={() => {
            onModeChange(selectedMode === "layout" ? "theme" : "layout");
          }}
          style={{
            appearance: "none",
            background: controlsDisabled ? "#f5f5f5" : "#111",
            border: "1px solid #111",
            borderRadius: "6px",
            color: controlsDisabled ? "#777" : "#fff",
            cursor: controlsDisabled ? "not-allowed" : "pointer",
            font: "inherit",
            minHeight: "34px",
            padding: "6px 10px",
            textAlign: "left",
          }}
        >
          {selectedMode === "layout" ? "Layout Editor" : "Theme Editor"}
        </button>
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
    <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
};
