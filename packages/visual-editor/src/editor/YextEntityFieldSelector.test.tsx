import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type StreamFields } from "../types/entityFields.ts";
import {
  ConstantValueInput,
  EntityFieldInput,
} from "./YextEntityFieldSelector.tsx";

const defaultEntityFields: StreamFields = {
  fields: [
    {
      name: "name",
      definition: {
        name: "name",
        typeName: "type.string",
        type: {},
      },
    },
    {
      name: "description",
      definition: {
        name: "description",
        typeName: "type.string",
        type: {},
      },
    },
    {
      name: "photo",
      definition: {
        name: "photo",
        typeName: "type.image",
        type: {},
      },
    },
  ],
  displayNames: {
    name: "Name",
    description: "Description",
    photo: "Photo",
  },
};

const renderEntityFieldInput = ({
  entityFields = defaultEntityFields,
  filter = { types: ["type.string", "type.image"] },
  onChange = vi.fn(),
  label,
  value = {},
}: {
  entityFields?: StreamFields | null;
  filter?: any;
  onChange?: any;
  label?: string;
  value?: Record<string, any>;
} = {}) => {
  const templateMetadata = {
    ...generateTemplateMetadata(),
    entityTypeDisplayName: "Location",
  };

  render(
    <TemplateMetadataContext.Provider value={templateMetadata}>
      <EntityFieldsContext.Provider value={entityFields}>
        <EntityFieldInput
          filter={filter}
          label={label}
          onChange={onChange}
          value={value}
        />
      </EntityFieldsContext.Provider>
    </TemplateMetadataContext.Provider>
  );

  return { onChange };
};

describe("YextEntityFieldSelector", () => {
  it("renders a single entity field selector with matching options", () => {
    renderEntityFieldInput();

    expect(screen.getAllByRole("combobox")).toHaveLength(1);

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByText("Location Field").length).toBeGreaterThan(0);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.getByText("Photo")).toBeDefined();
  });

  it("updates the selected entity field", () => {
    const { onChange } = renderEntityFieldInput({
      value: {
        field: "name",
      },
    });

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Description"));

    expect(onChange.mock.calls[0]?.[0]).toEqual({
      field: "description",
    });
  });

  it("uses the provided label when one is set", () => {
    renderEntityFieldInput({
      label: "CTA Field",
    });

    expect(screen.getByText("CTA Field")).toBeDefined();
  });

  it("falls back to the default entity field option when no matching entity fields exist", () => {
    renderEntityFieldInput({
      entityFields: {
        fields: [],
      },
    });

    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.getByRole("combobox")?.textContent).toContain(
      "Location Field"
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Location Field").length).toBeGreaterThan(0);
    expect(screen.queryByText("Name")).toBeNull();
  });

  it("renders datetime constant values through the registered Yext field type", () => {
    const onChange = vi.fn();

    render(
      <ConstantValueInput
        filter={{ types: ["type.datetime"] }}
        onChange={onChange}
        value={{ constantValue: "2026-04-15T09:30" }}
      />
    );

    expect(
      (screen.getByDisplayValue("2026-04-15T09:30") as HTMLInputElement).type
    ).toBe("datetime-local");
    expect(screen.queryByText("Value")).toBeNull();

    fireEvent.change(screen.getByDisplayValue("2026-04-15T09:30"), {
      target: { value: "2026-06-01T13:45" },
    });

    expect(onChange).toHaveBeenCalledWith(
      {
        constantValue: "2026-06-01T13:45",
      },
      undefined
    );
  });
});
