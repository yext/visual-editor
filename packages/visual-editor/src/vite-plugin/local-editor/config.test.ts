// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import { resolveLocalEditorConfigs } from "./config.ts";

const layout = (
  id: string,
  pageSetType: "ENTITY" | "DIRECTORY" | "LOCATOR"
): SectionLibraryLayout => ({
  metadata:
    pageSetType === "ENTITY"
      ? {
          id,
          displayName: id,
          pageSetType,
          previewImageUrl: "",
        }
      : { id, displayName: id, pageSetType },
  defaultLayout: {},
});

describe("readResolvedLayoutConfigs", () => {
  it("uses page set streams for every matching layout", () => {
    const config = resolveLocalEditorConfigs(
      [
        layout("location-one", "ENTITY"),
        layout("location-two", "ENTITY"),
        layout("directory", "DIRECTORY"),
      ],
      {
        defaults: { locale: "en" },
        pageSetTypes: {
          ENTITY: { stream: { $id: "entity", fields: ["name"] } },
          DIRECTORY: { stream: { $id: "directory", fields: ["slug"] } },
        },
      }
    );

    expect(config.layouts.map((layoutConfig) => layoutConfig.layoutId)).toEqual(
      ["location-one", "location-two", "directory"]
    );
    expect(
      config.layouts.map((layoutConfig) => layoutConfig.stream?.$id)
    ).toEqual(["entity", "entity", "directory"]);
    expect(config.layouts[2]?.dataSource).toBe("stream");
  });

  it("uses a layout override before its page set defaults", () => {
    const config = resolveLocalEditorConfigs(
      [layout("standard", "ENTITY"), layout("special", "ENTITY")],
      {
        defaults: { locale: "en" },
        pageSetTypes: {
          ENTITY: {
            defaults: { entityId: "page-set-entity", locale: "fr" },
            stream: { $id: "entity", fields: ["name"] },
          },
        },
        layouts: {
          special: {
            defaults: { entityId: "layout-entity" },
            stream: { $id: "special", fields: ["description"] },
          },
        },
      }
    );

    expect(config.layouts[0]).toMatchObject({
      layoutId: "standard",
      defaults: { entityId: "page-set-entity", locale: "fr" },
      stream: { $id: "entity" },
    });
    expect(config.layouts[1]).toMatchObject({
      layoutId: "special",
      defaults: { entityId: "layout-entity", locale: "fr" },
      stream: { $id: "special" },
    });
  });

  it("uses fixtures for Directory and Locator layouts without streams", () => {
    const config = resolveLocalEditorConfigs(
      [layout("directory", "DIRECTORY"), layout("locator", "LOCATOR")],
      {}
    );

    expect(config.layouts).toMatchObject([
      {
        layoutId: "directory",
        dataSource: "fixture",
        pageSetType: "DIRECTORY",
      },
      { layoutId: "locator", dataSource: "fixture", pageSetType: "LOCATOR" },
    ]);
  });
});
