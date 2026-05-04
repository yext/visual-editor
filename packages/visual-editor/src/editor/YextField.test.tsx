import React from "react";
import { render, screen } from "@testing-library/react";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { msg } from "../utils/i18n/platform.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { YextField } from "./YextField.tsx";

const renderCustomField = (field: any, value?: any) => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="test-field"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

afterEach(() => {
  vi.resetAllMocks();
});

describe("YextField", () => {
  it("renders native radio fields through YextAutoField", () => {
    renderCustomField(
      {
        label: msg("fields.show", "Show"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      true
    );

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { checked: true })).toBeDefined();
  });

  it("renders native text and textarea fields through YextAutoField", () => {
    const { unmount } = render(
      <YextAutoField
        field={{ label: msg("fields.text", "Text"), type: "text" }}
        id="text-field"
        onChange={vi.fn()}
        value="Alpha"
      />
    );

    expect(document.querySelector('input[type="text"]')).toBeDefined();
    expect(screen.getByDisplayValue("Alpha")).toBeDefined();

    unmount();

    render(
      <YextAutoField
        field={{
          label: msg("fields.description", "Description"),
          type: "textarea",
        }}
        id="textarea-field"
        onChange={vi.fn()}
        value="Beta"
      />
    );

    expect(document.querySelector("textarea")).toBeDefined();
    expect(screen.getByDisplayValue("Beta")).toBeDefined();
  });

  it("passes entityField configs through with constant value filters", () => {
    const fieldName = msg("fields.entity", "Entity Field");
    const filter = { types: ["type.string"] };
    const constantValueFilter = { types: ["type.rich_text_v2"] };

    const field = YextField(fieldName, {
      type: "entityField",
      filter,
      constantValueFilter,
      disableConstantValueToggle: true,
      disallowTranslation: true,
    } as any);

    expect(field).toEqual({
      label: fieldName,
      type: "entityField",
      filter,
      constantValueFilter,
      disableConstantValueToggle: true,
      disallowTranslation: true,
    });
  });

  it("passes registered custom field configs through with the provided label", () => {
    const fieldName = msg("fields.cta", "CTA");

    const field = YextField(fieldName, {
      type: "ctaSelector",
      disableConstantValueToggle: true,
    });

    expect(field).toEqual({
      label: fieldName,
      type: "ctaSelector",
      disableConstantValueToggle: true,
    });
  });

  it.each([
    {
      fieldName: msg("fields.number", "Number"),
      config: { type: "number", min: 1, max: 5, visible: false },
    },
    {
      fieldName: msg("fields.group", "Group"),
      config: {
        type: "object",
        objectFields: {
          title: { type: "text" },
        },
      },
    },
    {
      fieldName: msg("fields.list", "List"),
      config: {
        type: "array",
        arrayFields: {
          title: { type: "text" },
        },
        defaultItemProps: {
          title: "Default title",
        },
      },
    },
  ])("passes through standard Puck field configs", ({ fieldName, config }) => {
    const field = YextField(fieldName, config as any);

    expect(field).toEqual({
      label: fieldName,
      ...config,
    });
  });
});
