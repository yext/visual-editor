import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Config, Data, DefaultRootProps, Puck } from "@puckeditor/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { YextPuckFieldOverrides } from "../fields/fields.ts";
import {
  DynamicOption,
  DynamicOptionsSelector,
  DynamicOptionsSelectorType,
} from "./DynamicOptionsSelector.tsx";

type TestRootProps = DefaultRootProps & {
  items?: DynamicOptionsSelectorType<string>;
};

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
  const fieldTypes = { ...YextPuckFieldOverrides };
  expect(fieldTypes.basicSelector).toBeDefined();

  const instrumentedField =
    field.type === "custom"
      ? {
          ...field,
          render: (props: Parameters<typeof field.render>[0]) =>
            field.render({
              ...props,
              onChange: (newValue, uiState) => {
                onChange(newValue);
                props.onChange(newValue, uiState);
              },
            }),
        }
      : field;

  const puckConfig: Config<Record<string, never>, TestRootProps> = {
    components: {},
    root: {
      fields: {
        items: instrumentedField as any,
      },
      render: () => <></>,
    },
  };

  const puckData: Data<any, TestRootProps> = {
    root: {
      props: {
        items: initialValue,
      },
    },
    content: [],
    zones: {},
  };

  render(
    <Puck
      config={puckConfig}
      data={puckData}
      overrides={{
        fieldTypes: fieldTypes as any,
      }}
    >
      <Puck.Fields wrapFields={false} />
    </Puck>
  );

  return { onChange };
};

describe("DynamicOptionsSelector", () => {
  it("renders nested basicSelector items through YextAutoField", async () => {
    let onChange: ReturnType<typeof vi.fn>;

    await act(async () => {
      ({ onChange } = renderDynamicOptionsField(
        [
          { label: "Alpha", value: "alpha" },
          { label: "Beta", value: "beta" },
        ],
        {
          selections: [{ value: "alpha" }],
        }
      ));
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText("Alpha")[0]);
    });

    const selectorCombobox = screen
      .getAllByRole("combobox")
      .find((element) => element.tagName === "BUTTON");

    expect(selectorCombobox?.textContent).toContain("Alpha");

    await act(async () => {
      fireEvent.click(selectorCombobox!);
    });

    expect(screen.getByPlaceholderText("Search")).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByText("Beta"));
    });

    expect(onChange!.mock.lastCall?.[0]).toEqual({
      selections: [{ value: "beta" }],
    });
  });
});
