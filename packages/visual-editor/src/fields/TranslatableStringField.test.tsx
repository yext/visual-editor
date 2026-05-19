import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { type TranslatableStringField } from "./TranslatableStringField.tsx";

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      i18n: {
        language: "en",
      },
    }),
  };
});

vi.mock("../editor/EmbeddedFieldStringInput.tsx", () => ({
  EmbeddedFieldStringInputFromEntity: ({
    filter,
    onChange,
    showFieldSelector,
    sourceField,
    sourceFieldPath,
    value,
  }: any) => (
    <button
      type="button"
      data-filter={JSON.stringify(filter)}
      data-show-field-selector={String(showFieldSelector)}
      data-source-field={sourceField ?? ""}
      data-source-field-path={sourceFieldPath ?? ""}
      data-value={value}
      data-testid="entity-input"
      onClick={() => onChange("Updated")}
    >
      entity-input
    </button>
  ),
  EmbeddedFieldStringInputFromOptions: ({
    onChange,
    optionGroups,
    showFieldSelector,
    value,
  }: any) => {
    const options = optionGroups?.flatMap((group: any) => group.options);
    return (
      <button
        type="button"
        data-options={JSON.stringify(options)}
        data-show-field-selector={String(showFieldSelector)}
        data-value={value}
        data-testid="options-input"
        onClick={() => onChange("Selected")}
      >
        options-input
      </button>
    );
  },
}));

const renderField = (
  field: TranslatableStringField,
  value?: any,
  onChange = vi.fn(),
  document: Record<string, unknown> = {}
) => {
  const view = render(
    <TemplatePropsContext.Provider value={{ document }}>
      <YextAutoField
        field={field}
        id="translatable-string-field"
        onChange={onChange}
        value={value}
      />
    </TemplatePropsContext.Provider>
  );

  return { onChange, ...view };
};

describe("TranslatableStringField", () => {
  it("renders the registered field through YextAutoField with a locale suffix", () => {
    renderField({
      type: "translatableString",
      label: "Title",
      filter: { types: ["type.string"] },
    });

    expect(screen.getByText("Title (en)")).toBeDefined();
  });

  it("uses the default string filter and unlabeled wrapper", () => {
    const { container } = renderField({
      type: "translatableString",
    });

    expect(container.querySelector(".ve-pt-3")).toBeDefined();
    expect(screen.getByTestId("entity-input").dataset.filter).toBe(
      JSON.stringify({ types: ["type.string"] })
    );
  });

  it("passes scoped source-field settings to entity-backed embedding", () => {
    renderField({
      type: "translatableString",
      filter: { types: ["type.string"] },
      sourceField: "dm_directoryChildren",
      sourceFieldPath: "data.source.field",
    });

    expect(screen.getByTestId("entity-input").dataset.sourceField).toBe(
      "dm_directoryChildren"
    );
    expect(screen.getByTestId("entity-input").dataset.sourceFieldPath).toBe(
      "data.source.field"
    );
  });

  it("uses options-based embedding and honors showFieldSelector", () => {
    renderField({
      type: "translatableString",
      label: "Alt Text",
      showFieldSelector: false,
      getOptions: () => [
        { label: "Name", value: "name" },
        { label: "Slug", value: "slug" },
      ],
    });

    expect(screen.getByTestId("options-input").dataset.options).toBe(
      JSON.stringify([
        { label: "Name", value: "name" },
        { label: "Slug", value: "slug" },
      ])
    );
    expect(screen.getByTestId("options-input").dataset.showFieldSelector).toBe(
      "false"
    );
  });

  it("applies the current locale value to every page-set locale", () => {
    const { onChange } = renderField(
      {
        type: "translatableString",
        label: "Title",
        showApplyAllOption: true,
      },
      {
        en: "Hello",
        hasLocalizedValue: "true",
      },
      vi.fn(),
      {
        _pageset: JSON.stringify({
          scope: {
            locales: ["en", "fr"],
          },
        }),
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Apply to all locales" })
    );

    expect(onChange).toHaveBeenCalledWith({
      en: "Hello",
      fr: "Hello",
      hasLocalizedValue: "true",
    });
  });
});
