import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import type { Fields } from "@puckeditor/core";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { YextAutoField } from "./YextAutoField.tsx";
import { toPuckFields, type YextFields } from "./fields.ts";
import { createYextFieldTransforms } from "./fieldTransforms/index.ts";
import { createPuckGenerationCatalog } from "../utils/createPuckGenerationCatalog.ts";
import {
  surfaceRoleOptions,
  typographyRoleOptions,
  type SurfaceRole,
  type TypographyRole,
} from "../utils/themeOptions.ts";
import type {
  SurfaceField,
  TypographyRoleField,
} from "../sectionLibrarySupport.ts";
import type {
  SurfaceField as PublicSurfaceField,
  TypographyRoleField as PublicTypographyRoleField,
} from "./index.ts";

const surface: PublicSurfaceField & SurfaceField = { type: "surface" };
const typographyRole: PublicTypographyRoleField & TypographyRoleField = {
  type: "typographyRole",
};
const fields = { surface, typographyRole } satisfies YextFields<{
  surface?: SurfaceRole | "inherit";
  typographyRole?: TypographyRole;
}>;
afterEach(cleanup);

describe("built-in theme role fields", () => {
  it("renders surface swatches and preserves role and inherit values", () => {
    const onChange = vi.fn();
    render(
      <YextAutoField
        field={surface}
        id="surface"
        value="primary"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("combobox");
    expect(screen.getByText("Background Color")).toBeTruthy();
    expect(trigger.querySelector(".ve-w-5")).not.toBeNull();
    fireEvent.click(trigger);
    for (const { label } of surfaceRoleOptions) {
      expect(
        screen.getByRole("option", { name: label }).querySelector(".ve-w-5")
      ).not.toBeNull();
    }
    fireEvent.click(screen.getByRole("option", { name: "Accent" }));
    expect(onChange).toHaveBeenLastCalledWith("accent");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Inherit Parent" }));
    expect(onChange).toHaveBeenLastCalledWith("inherit");
  });

  it("offers custom colors but not inheritance for section backgrounds", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <YextAutoField
        field={{ type: "surface", allowInherit: false }}
        id="section-background"
        value="page"
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("option", { name: "Inherit Parent" })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: /^Other/ }));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ selectedColor: "[#000000]" })
    );
    rerender(
      <YextAutoField
        field={{ type: "surface", allowInherit: false }}
        id="section-background"
        value={{ selectedColor: "[#112233]", contrastingColor: "white" }}
        onChange={onChange}
      />
    );
    expect(screen.getByText("Custom Color")).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Muted" }));
    expect(onChange).toHaveBeenLastCalledWith("muted");
  });
  it("resolves legacy palette backgrounds before opening the custom picker without changing saved values", () => {
    const onChange = vi.fn();
    render(
      <TemplatePropsContext.Provider
        value={{
          document: {
            __: { theme: JSON.stringify({ colorPrimary: "#112233" }) },
          },
        }}
      >
        <YextAutoField
          field={{ type: "surface", allowInherit: false }}
          id="background"
          value={{
            selectedColor: "palette-primary",
            contrastingColor: "white",
          }}
          onChange={onChange}
        />
      </TemplatePropsContext.Provider>
    );
    const picker = screen.getByRole("button", { name: "Open color picker" });
    expect((picker.firstElementChild as HTMLElement).style.background).toBe(
      "rgb(17, 34, 51)"
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("validates custom backgrounds and rejects section inheritance in generation", () => {
    const definitions = {
      backgroundColor: { type: "surface" as const, allowInherit: false },
    };
    const catalog = createPuckGenerationCatalog(
      { Section: { fields: toPuckFields(definitions), defaultProps: {} } },
      { rootAllowedComponentIds: ["Section"] }
    );
    const schema = catalog.data.components.Section.generation!.props;
    expect(schema.safeParse({ backgroundColor: "primary" }).success).toBe(true);
    expect(schema.safeParse({ backgroundColor: "inherit" }).success).toBe(
      false
    );
    expect(
      schema.safeParse({
        backgroundColor: {
          selectedColor: "[#112233]",
          contrastingColor: "white",
          isDarkColor: true,
        },
      }).success
    ).toBe(true);
  });

  it("clears typography to the placement default and allows another role", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <YextAutoField
        field={typographyRole}
        id="typography"
        value="headline"
        onChange={onChange}
      />
    );
    expect(screen.getByText("Typography Style")).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      screen.getByRole("option", { name: "Default for Placement" })
    );
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    rerender(
      <YextAutoField
        field={typographyRole}
        id="typography"
        value={undefined}
        onChange={onChange}
      />
    );
    expect(screen.getByRole("combobox").textContent).toContain(
      "Default for Placement"
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Eyebrow" }));
    expect(onChange).toHaveBeenLastCalledWith("eyebrow");
  });

  it("honors a consumer-provided label", () => {
    render(
      <YextAutoField
        field={{ ...surface, label: "Card surface" }}
        id="surface"
        value="muted"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Card surface")).toBeTruthy();
    expect(screen.queryByText("Background Color")).toBeNull();
  });

  it("adapts nested object and array fields without changing saved role values", () => {
    const adapted = toPuckFields({
      styles: { type: "object", objectFields: fields },
      cards: { type: "array", arrayFields: fields },
    });
    if (adapted.styles.type !== "object" || adapted.cards.type !== "array") {
      throw new Error("Expected native object and array fields");
    }
    const transforms = createYextFieldTransforms({}, "en");
    for (const fieldMap of [
      adapted.styles.objectFields,
      adapted.cards.arrayFields,
    ]) {
      for (const [name, value] of [
        ["surface", "inherit"],
        ["typographyRole", undefined],
      ] as const) {
        const field = fieldMap[name];
        expect(field.type).toBe("custom");
        expect(field.metadata?.yextField).toMatchObject({ type: name });
        expect(
          transforms.custom({
            field,
            value,
            componentId: "section",
            propName: name,
            propPath: `styles.${name}`,
            isReadOnly: true,
          })
        ).toBe(value);
      }
    }
  });

  it("infers canonical enum values and defaults for raw and adapted generation fields", () => {
    const roleCatalog = createPuckGenerationCatalog(
      { Section: { fields: fields as unknown as Fields, defaultProps: {} } },
      { rootAllowedComponentIds: ["Section"] }
    );
    const roleSchema = roleCatalog.data.components.Section.generation!.props;
    const surfaceSchema = roleSchema.shape.surface;
    const typographySchema = roleSchema.shape.typographyRole;
    for (const { value } of surfaceRoleOptions) {
      expect(surfaceSchema.safeParse(value).success).toBe(true);
    }
    expect(surfaceSchema.safeParse("inherit").success).toBe(true);
    for (const { value } of typographyRoleOptions) {
      expect(typographySchema.safeParse(value).success).toBe(true);
    }
    expect(typographySchema.safeParse(undefined).success).toBe(true);
    expect(surfaceSchema.safeParse("headline").success).toBe(false);
    expect(typographySchema.safeParse("primary").success).toBe(false);
    for (const definitions of [fields, toPuckFields(fields)]) {
      const catalog = createPuckGenerationCatalog(
        {
          Section: {
            fields: definitions as unknown as Fields,
            defaultProps: {},
          },
        },
        { rootAllowedComponentIds: ["Section"] }
      );
      const schema = catalog.data.components.Section.generation!.props;
      expect(schema.safeParse({ surface: "inherit" }).success).toBe(true);
      expect(
        schema.safeParse({ surface: "muted", typographyRole: "eyebrow" })
          .success
      ).toBe(true);
      expect(schema.safeParse({ typographyRole: "invalid" }).success).toBe(
        false
      );
    }
  });
});
