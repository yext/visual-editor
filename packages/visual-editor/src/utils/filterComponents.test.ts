import { describe, it, expect } from "vitest";
import { filterComponentsFromConfig } from "./filterComponents.ts";
import { mainConfig } from "../components/configs/mainConfig.tsx";

describe("filterComponentsFromConfig", () => {
  it("filters gated components and categories when no feature flags are enabled", () => {
    const config = filterComponentsFromConfig(mainConfig);

    // Test component registry
    expect(Object.keys(config.components)).toContain("BannerSection");
    expect(Object.keys(config.components)).toContain("ExpandedHeader");
    expect(Object.keys(config.components)).not.toContain("Grid");
    expect(Object.keys(config.components)).not.toContain("BodyText");
    expect(Object.keys(config.components)).not.toContain("CustomCodeSection");

    // Test list of categories
    expect(Object.keys(config.categories ?? {})).toContain("pageSections");
    expect(Object.keys(config.categories ?? {})).toContain("other");
    expect(Object.keys(config.categories ?? {})).toContain(
      "deprecatedComponents"
    );
    expect(Object.keys(config.categories ?? {})).not.toContain(
      "coreInformation"
    );

    // Test component visibility within categories
    expect(config.categories?.other?.components).toContain("ExpandedHeader");
    expect(config.categories?.coreInformation?.components).toBeUndefined();
    expect(config.categories?.other?.components).not.toContain(
      "CustomCodeSection"
    );
  });

  it("filters components and categories correctly when the custom code feature flag is enabled", () => {
    const config = filterComponentsFromConfig(mainConfig, [
      "CustomCodeSection",
    ]);

    // Test component registry
    expect(Object.keys(config.components)).toContain("BannerSection");
    expect(Object.keys(config.components)).toContain("ExpandedHeader");
    expect(Object.keys(config.components)).not.toContain("Grid");
    expect(Object.keys(config.components)).not.toContain("BodyText");
    expect(Object.keys(config.components)).toContain("CustomCodeSection");

    // Test list of categories
    expect(Object.keys(config.categories ?? {})).toContain("pageSections");
    expect(Object.keys(config.categories ?? {})).toContain("other");
    expect(Object.keys(config.categories ?? {})).toContain(
      "deprecatedComponents"
    );
    expect(Object.keys(config.categories ?? {})).not.toContain(
      "coreInformation"
    );

    // Test component visibility within categories
    expect(config.categories?.other?.components).toContain("ExpandedHeader");
    expect(config.categories?.coreInformation?.components).toBeUndefined();
    expect(config.categories?.other?.components).toContain("CustomCodeSection");
  });

  it("filters components and categories correctly when the advanced core info section flag is enabled", () => {
    const config = filterComponentsFromConfig(
      mainConfig,
      [],
      ["coreInformation"]
    );

    // Test component registry
    expect(Object.keys(config.components)).toContain("BannerSection");
    expect(Object.keys(config.components)).toContain("ExpandedHeader");
    expect(Object.keys(config.components)).toContain("Grid");
    expect(Object.keys(config.components)).toContain("BodyText");
    expect(Object.keys(config.components)).not.toContain("CustomCodeSection");

    // Test list of categories
    expect(Object.keys(config.categories ?? {})).toContain("pageSections");
    expect(Object.keys(config.categories ?? {})).toContain("other");
    expect(Object.keys(config.categories ?? {})).toContain(
      "deprecatedComponents"
    );
    expect(Object.keys(config.categories ?? {})).toContain("coreInformation");

    // Test component visibility within categories
    expect(config.categories?.other?.components).toContain("ExpandedHeader");
    expect(config.categories?.coreInformation?.components).toContain("Grid");
    expect(config.categories?.other?.components).not.toContain(
      "CustomCodeSection"
    );
  });
});
