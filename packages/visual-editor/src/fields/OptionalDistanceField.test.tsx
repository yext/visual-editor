import React from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { pt } from "../utils/i18n/platform.ts";
import { toPuckFields } from "./fields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import type {
  OptionalDistanceField,
  OptionalDistanceValue,
} from "./OptionalDistanceField.tsx";

const field: OptionalDistanceField = {
  type: "optionalDistance",
  label: "Search Radius",
  defaultCustomValue: 25,
  min: 0,
  max: 100,
  step: 1,
};

async function renderField(
  value?: OptionalDistanceValue,
  locale = "en",
  readOnly = false
) {
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

describe("optionalDistance", () => {
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
      fireEvent.click(screen.getByText(pt(nextUnit, { count: 2 })));
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

  it("adapts optionalDistance fields nested inside objects", () => {
    const fields = toPuckFields({
      settings: { type: "object", objectFields: { distance: field } },
    });
    expect((fields.settings as any).objectFields.distance.type).toBe("custom");
  });
});
