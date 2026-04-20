import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Config, Data, DefaultRootProps, Puck } from "@puckeditor/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { YextPuckFieldOverrides } from "../fields/fields.ts";
import {
  DynamicOption,
  DynamicOptionsSelector,
  DynamicOptionsSelectorType,
} from "./DynamicOptionsSelector.tsx";

const puckConfig: Config = {
  components: {},
  root: {
    render: () => <></>,
  },
};

const puckData: Data<any, DefaultRootProps> = {
  root: {
    props: {},
  },
  content: [],
  zones: {},
};

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("React.jsx: type is invalid")
    ) {
      return;
    }
  });
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const renderDynamicOptionsField = (
  options: DynamicOption<string>[],
  initialValue: DynamicOptionsSelectorType<string>
) => {
  const onChange = vi.fn();
  const field = DynamicOptionsSelector<string>({
    label: "Items",
    dropdownLabel: "Item",
    getOptions: () => options,
  });

  const TestHarness = () => {
    const [value, setValue] = React.useState<
      DynamicOptionsSelectorType<string> | undefined
    >(initialValue);

    return (
      <YextAutoField
        field={field}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange(newValue);
        }}
      />
    );
  };

  render(
    <Puck
      config={puckConfig}
      data={puckData}
      overrides={{
        fields: () => <TestHarness />,
        fieldTypes: { ...YextPuckFieldOverrides } as any,
      }}
    />
  );

  return { onChange };
};

describe("DynamicOptionsSelector", () => {
  it("renders nested basicSelector items through YextAutoField", () => {
    const { onChange } = renderDynamicOptionsField(
      [
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
      ],
      {
        selections: [{ value: "alpha" }],
      }
    );

    fireEvent.click(screen.getAllByText("Alpha")[0]);

    const selectorCombobox = screen
      .getAllByRole("combobox")
      .find((element) => element.tagName === "BUTTON");

    expect(selectorCombobox?.textContent).toContain("Alpha");

    fireEvent.click(selectorCombobox!);

    expect(screen.getByPlaceholderText("Search")).toBeDefined();

    fireEvent.click(screen.getByText("Beta"));

    expect(onChange.mock.lastCall?.[0]).toEqual({
      selections: [{ value: "beta" }],
    });
  });
});
