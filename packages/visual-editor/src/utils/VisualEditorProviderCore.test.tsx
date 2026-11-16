import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VisualEditorProviderCore } from "./VisualEditorProviderCore.tsx";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import type { StreamFields } from "../types/entityFields.ts";

const runtime = {
  loadPageTranslations: async () => {},
  loadPlatformTranslations: async () => {},
};
function FieldsProbe() {
  const fields = useEntityFields();
  return (
    <output>
      {fields
        ? fields.fields.map((field) => field.name).join(",")
        : "No fields available"}
    </output>
  );
}
afterEach(cleanup);
describe("VisualEditorProviderCore entity field metadata", () => {
  it("allows field controls when optional entity metadata is omitted", () => {
    render(
      <VisualEditorProviderCore
        templateProps={{ document: {} }}
        translationRuntime={runtime}
        renderChildren
      >
        <FieldsProbe />
      </VisualEditorProviderCore>
    );
    expect(screen.getByText("No fields available")).toBeTruthy();
  });
  it("supplies the configured schema to field controls", () => {
    const entityFields: StreamFields = {
      fields: [
        {
          name: "name",
          definition: { name: "name", typeName: "type.string", type: {} },
        },
      ],
    };
    render(
      <VisualEditorProviderCore
        templateProps={{ document: {} }}
        translationRuntime={runtime}
        renderChildren
        entityFields={entityFields}
      >
        <FieldsProbe />
      </VisualEditorProviderCore>
    );
    expect(screen.getByText("name")).toBeTruthy();
  });
});
