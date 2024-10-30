import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeAll } from "vitest";
import {
  EntityField,
  EntityFieldProvider,
  useEntityField,
} from "./EntityField.js";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("EntityField component", () => {
  it("renders the children and displays a tooltip when tooltips are toggled", () => {
    const TestComponent = () => {
      const { toggleTooltips } = useEntityField();

      return (
        <>
          <button onClick={toggleTooltips}>Toggle</button>
          <EntityField fieldId="123" constantValueEnabled={false}>
            <div>Content</div>
          </EntityField>
        </>
      );
    };

    render(
      <EntityFieldProvider>
        <TestComponent />
      </EntityFieldProvider>
    );

    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.queryAllByText("123")).toHaveLength(0);

    act(() => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.queryAllByText("123")).toBeDefined();
  });
});
