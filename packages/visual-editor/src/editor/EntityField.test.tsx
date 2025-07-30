import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  EntityField,
  EntityTooltipsProvider,
  useEntityTooltips,
} from "./EntityField.tsx";

describe("Entity Tooltips", () => {
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
