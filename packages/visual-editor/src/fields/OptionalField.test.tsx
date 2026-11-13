import React from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toPuckFields } from "./fields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import type { OptionalField } from "./OptionalField.tsx";
import { getPreferredDistanceUnit } from "../utils/i18n/distance.ts";

type Distance = { value?: number; unit: "mile" | "kilometer" };

const field: OptionalField<Distance> = {
  type: "optional",
  label: "Search Radius",
  defaultCustomValue: ({ locale }) => ({
    value: 25,
    unit: getPreferredDistanceUnit(locale),
  }),
  field: {
    type: "object",
    objectFields: {
      value: { type: "number", label: "Radius", min: 0, max: 100, step: 1 },
      unit: {
        type: "basicSelector",
        label: "Distance Unit",
        options: [
          { label: "Miles", value: "mile" },
          { label: "Kilometers", value: "kilometer" },
        ],
      },
    },
  },
};

async function renderField(value?: Distance, locale = "en", readOnly = false) {
  const i18n = createInstance();
  await i18n
    .use(initReactI18next)
    .init({ lng: locale, fallbackLng: "en", resources: {} });
  const onChange = vi.fn();
  const Editor = () => {
    const [distance, setDistance] = React.useState(value);
    return (
      <YextAutoField
        field={field}
        value={distance}
        readOnly={readOnly}
        onChange={(next) => {
          setDistance(next);
          onChange(next);
        }}
      />
    );
  };
  render(
    <I18nextProvider i18n={i18n}>
      <Editor />
    </I18nextProvider>
  );
  return onChange;
}

function selectMode(mode: "Custom" | "Automatic") {
  fireEvent.click(screen.getAllByRole("combobox")[0]);
  fireEvent.click(screen.getByText(mode));
}

describe("optional", () => {
  it.each([
    { locale: "en", unit: "mile" },
    { locale: "en-GB", unit: "mile" },
    { locale: "fr", unit: "kilometer" },
    { locale: "de", unit: "kilometer" },
  ])(
    "initializes Custom using the $locale page locale",
    async ({ locale, unit }) => {
      const onChange = await renderField(undefined, locale);
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("spinbutton")).toBeNull();
      selectMode("Custom");
      expect(onChange).toHaveBeenLastCalledWith({ value: 25, unit });
    }
  );

  it.each([
    { value: 50, unit: "kilometer" as const, nextValue: 42 },
    { value: 5, unit: "mile" as const, nextValue: 84 },
    { value: 0, unit: "kilometer" as const, nextValue: 0 },
  ])(
    "restores edits to $value $unit after repeated Automatic/Custom toggles",
    async ({ value, unit, nextValue }) => {
      const onChange = await renderField({ value, unit });
      fireEvent.change(screen.getByRole("spinbutton"), {
        target: { value: String(nextValue) },
      });
      const nextUnit = unit === "mile" ? "kilometer" : "mile";
      fireEvent.click(screen.getAllByRole("combobox")[1]);
      fireEvent.click(
        screen.getByText(nextUnit === "mile" ? "Miles" : "Kilometers")
      );
      for (let toggle = 0; toggle < 2; toggle++) {
        selectMode("Automatic");
        expect(onChange).toHaveBeenLastCalledWith(undefined);
        expect(screen.queryByRole("spinbutton")).toBeNull();
        selectMode("Custom");
        expect(onChange).toHaveBeenLastCalledWith({
          value: nextValue,
          unit: nextUnit,
        });
      }
    }
  );

  it("preserves standard number clearing and forwards numeric constraints", async () => {
    const onChange = await renderField({ value: 50, unit: "kilometer" });
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect([input.min, input.max, input.step]).toEqual(["0", "100", "1"]);
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith({ value: 0, unit: "kilometer" });
    fireEvent.change(input, { target: { value: "42" } });
    expect(onChange).toHaveBeenLastCalledWith({ value: 42, unit: "kilometer" });
  });

  it("disables all controls when read-only", async () => {
    await renderField({ value: 50, unit: "kilometer" }, "en", true);
    for (const control of [
      ...screen.getAllByRole("combobox"),
      screen.getByRole("spinbutton"),
    ]) {
      expect(control.matches(":disabled")).toBe(true);
    }
  });

  it("adapts optional fields nested inside objects", () => {
    const fields = toPuckFields({
      settings: { type: "object", objectFields: { distance: field } },
    });
    expect((fields.settings as any).objectFields.distance.type).toBe("custom");
  });
});

describe("generic optional values", () => {
  it.each([0, false, "", null])(
    "keeps %j enabled and remembers it across toggles",
    async (initialValue) => {
      const onChange = vi.fn();
      const Editor = () => {
        const [value, setValue] = React.useState<
          typeof initialValue | undefined
        >(initialValue);
        return (
          <YextAutoField
            field={{
              type: "optional",
              defaultCustomValue: 99,
              field: {
                type: "custom",
                render: () => <span>Custom input</span>,
              },
            }}
            value={value}
            onChange={(next) => {
              setValue(next);
              onChange(next);
            }}
          />
        );
      };
      render(<Editor />);
      expect(screen.getByText("Custom input")).toBeDefined();
      selectMode("Automatic");
      expect(screen.queryByText("Custom input")).toBeNull();
      expect(onChange).toHaveBeenLastCalledWith(undefined);
      selectMode("Custom");
      expect(onChange).toHaveBeenLastCalledWith(initialValue);
    }
  );

  it("initializes a wrapped text input lazily using the current locale", async () => {
    const defaults = vi.fn(
      ({ locale }: { locale: string }) => `Hello ${locale}`
    );
    const i18n = createInstance();
    await i18n.use(initReactI18next).init({ lng: "en", resources: {} });
    const Editor = () => {
      const [value, setValue] = React.useState<string>();
      return (
        <YextAutoField
          field={{
            type: "optional",
            defaultCustomValue: defaults,
            field: { type: "text" },
          }}
          value={value}
          onChange={setValue}
        />
      );
    };
    render(
      <I18nextProvider i18n={i18n}>
        <Editor />
      </I18nextProvider>
    );
    expect(defaults).not.toHaveBeenCalled();
    await act(async () => {
      await i18n.changeLanguage("fr");
    });
    selectMode("Custom");
    expect(defaults).toHaveBeenCalledWith({ locale: "fr" });
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "Hello fr"
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Edited" },
    });
    selectMode("Automatic");
    selectMode("Custom");
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "Edited"
    );
    expect(defaults).toHaveBeenCalledOnce();
  });

  it("renders wrapped Yext fields inside arrays through the native adapter", () => {
    const arrayField: OptionalField = {
      type: "optional",
      defaultCustomValue: [],
      field: {
        type: "array",
        arrayFields: {
          choice: {
            type: "basicSelector",
            label: "Choice",
            options: [{ label: "One", value: "one" }],
          },
        },
      },
    };
    render(
      <YextAutoField
        field={arrayField}
        value={[{ choice: "one" }]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toBeDefined();
    fireEvent.click(screen.getByText("Item #0"));
    expect(screen.getByText("Choice")).toBeDefined();
  });
});
