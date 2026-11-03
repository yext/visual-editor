import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  EntityField,
  EntityTooltipsProvider,
  useEntityTooltips,
} from "./EntityField.tsx";
import { toPuckFields, type YextFieldMap } from "../fields/fields.ts";
import { getTransformedFieldSources } from "../internal/puck/components/TransformedFieldTooltip.tsx";

describe("Entity Tooltips", () => {
  it.each([false, true])(
    "collects only opted-in sources when fields are adapted: %s",
    (adapted) => {
      const fields = {
        title: {
          type: "entityField",
          label: "Title",
          filter: { types: ["type.string"] },
          transform: true,
        },
        subtitle: { type: "translatableString", transform: true },
        legacy: {
          type: "entityField",
          filter: { types: ["type.string"] },
        },
        disabled: { type: "translatableString", transform: false },
        html: { type: "code", codeLanguage: "html" },
        css: { type: "code", codeLanguage: "css" },
        javascript: { type: "code", codeLanguage: "javascript" },
        color: { type: "themeColor", options: "SITE_COLOR" },
      } satisfies YextFieldMap;

      expect(
        getTransformedFieldSources(adapted ? toPuckFields(fields) : fields, {
          title: { field: "name", constantValueEnabled: false },
          subtitle: { defaultValue: "Subtitle" },
          legacy: { field: "description", constantValueEnabled: false },
          disabled: { defaultValue: "Disabled" },
          html: "<p>Content</p>",
          css: "p { color: red; }",
          javascript: "console.log('Content');",
          color: { selectedColor: "palette-primary" },
        })
      ).toEqual([
        { label: "Title", field: "name" },
        { label: "subtitle", field: undefined },
      ]);
    }
  );

  it("renders the children and displays a tooltip when tooltips are toggled", () => {
    const TestComponent = () => {
      const tooltipsContext = useEntityTooltips();
      if (!tooltipsContext) {
        return;
      }
      const { toggleTooltips } = tooltipsContext;

      return (
        <>
          <button onClick={toggleTooltips}>Toggle</button>
          <EntityField displayName="Test Field" fieldId="123">
            <div>Content</div>
          </EntityField>
        </>
      );
    };

    render(
      <EntityTooltipsProvider>
        <TestComponent />
      </EntityTooltipsProvider>
    );

    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.queryAllByText("Test Field (123)")).toHaveLength(0);

    act(() => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.queryAllByText("Test Field (123)")).toBeDefined();
  });

  it("renders the children without the tooltips when outside the context", () => {
    const TestComponent = () => {
      return (
        <>
          <EntityField displayName="Test Field" fieldId="123">
            <div>Content</div>
          </EntityField>
        </>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.queryAllByText("Test Field (123)")).toHaveLength(0);
  });
});
