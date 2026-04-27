import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { LinkedEntitySchemasContext } from "../hooks/useLinkedEntitySchemas.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import {
  type CTASelectorField,
  type YextCTAField,
} from "./CTASelectorField.tsx";

const defaultEntityFields: StreamFields = {
  fields: [
    {
      name: "c_primaryCTA",
      definition: {
        name: "c_primaryCTA",
        typeName: "type.cta",
        type: {},
      },
    },
  ],
  displayNames: {
    c_primaryCTA: "Primary CTA",
  },
};

const renderCTASelectorField = ({
  field = {
    type: "ctaSelector",
    label: "CTA",
  } satisfies CTASelectorField,
  value = {
    field: "c_primaryCTA",
    constantValue: {
      ctaType: "textAndLink",
      label: { defaultValue: "Learn More" },
      link: { defaultValue: "#" },
      linkType: "URL",
    },
    selectedType: "textAndLink",
  } satisfies YextCTAField,
  entityFields = defaultEntityFields,
}: {
  field?: CTASelectorField;
  value?: YextCTAField;
  entityFields?: StreamFields | null;
} = {}) => {
  const onChange = vi.fn();
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  render(
    <TemplatePropsContext.Provider value={{ document: { locale: "en" } }}>
      <TemplateMetadataContext.Provider value={templateMetadata}>
        <LinkedEntitySchemasContext.Provider value={null}>
          <EntityFieldsContext.Provider value={entityFields}>
            <YextAutoField
              field={field}
              id="cta-selector-field"
              onChange={onChange}
              value={value}
            />
          </EntityFieldsContext.Provider>
        </LinkedEntitySchemasContext.Provider>
      </TemplateMetadataContext.Provider>
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

describe("CTASelectorField", () => {
  it("renders CTA type options", () => {
    renderCTASelectorField();

    fireEvent.click(screen.getByRole("combobox", { name: "CTA Type" }));

    expect(screen.getAllByText("Text & Link").length).toBeGreaterThan(0);
    expect(screen.getByText("Get Directions")).toBeDefined();
    expect(screen.getByText("Preset Image")).toBeDefined();
  });

  it.each([
    ["textAndLink", true],
    ["presetImage", true],
    ["getDirections", false],
  ] as const)(
    "shows the KG field selector for %s = %s",
    (selectedType, shouldShowEntityField) => {
      renderCTASelectorField({
        value: {
          field: "c_primaryCTA",
          constantValue: {
            ctaType: "textAndLink",
            label: { defaultValue: "Learn More" },
            link: { defaultValue: "#" },
            linkType: "URL",
          },
          selectedType,
        },
      });

      expect(screen.getByRole("combobox", { name: "CTA Type" })).toBeDefined();

      expect(screen.getAllByRole("combobox")).toHaveLength(
        shouldShowEntityField ? 2 : 1
      );
    }
  );

  it("clears the selected KG field when the CTA type changes", () => {
    const { onChange } = renderCTASelectorField();

    fireEvent.click(screen.getByRole("combobox", { name: "CTA Type" }));
    fireEvent.click(screen.getByText("Preset Image"));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        field: "",
        selectedType: "presetImage",
      }),
      undefined
    );
  });

  it("renders the CTA constant editor when static content mode is enabled", () => {
    renderCTASelectorField({
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          ctaType: "textAndLink",
          label: { defaultValue: "Learn More" },
          link: { defaultValue: "#" },
          linkType: "URL",
        },
      },
    });

    expect(screen.getByRole("combobox", { name: "CTA Type" })).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Link Type" })).toBeDefined();
  });
});
