import { createElement } from "react";
import { expect, it } from "vitest";
import { z } from "zod";
import {
  createPuckGenerationCatalog,
  withGenerationCatalog,
} from "../../../utils/createPuckGenerationCatalog.ts";
import { getGenerationCatalog } from "./catalogRegistry.ts";

it("shares generated restrictions and metadata across the engine and Puck config copies", () => {
  const catalog = createPuckGenerationCatalog(
    {
      Section: {
        description: "A section",
        generation: { props: z.object({ title: z.string() }) },
        defaultProps: { title: "Default" },
      },
      Child: {
        nestedOnly: true,
        generation: { props: z.object({ text: z.string() }) },
      },
    },
    {
      rootAllowedComponentIds: ["MainContent"],
      defaultGenerationSectionIds: ["Section"],
    }
  );
  const config = withGenerationCatalog({ components: {} }, catalog);
  expect(getGenerationCatalog(config)).toBe(catalog);
  expect(getGenerationCatalog({ ...config })).toBe(catalog);
  expect(catalog.puckOptions.rootAllowedComponentIds).toEqual(["MainContent"]);
  expect(catalog.puckOptions.defaultGenerationSectionIds).toEqual(["Section"]);
  expect(catalog.data.components.Child.nestedOnly).toBe(true);
  expect(catalog.data.components.Section.description).toBe("A section");
  expect(catalog.data.components.Section.defaultProps).toEqual({
    title: "Default",
  });
});
it("caches a runtime catalog for configs without generated contracts", () => {
  const config = {
    components: { Custom: { render: () => createElement("div") } },
  };
  expect(getGenerationCatalog(config)).toBe(getGenerationCatalog(config));
  expect(getGenerationCatalog(config).componentNames).toContain("Custom");
});

it("reads public component generation metadata when building a runtime catalog", () => {
  const metadata = { props: z.object({ title: z.string() }) };
  const config = {
    components: {
      Custom: {
        layoutGenerationMetadata: metadata,
        defaultProps: { title: "Default" },
        render: () => createElement("div"),
      },
    },
  };
  const catalog = getGenerationCatalog(config);
  expect(catalog.data.components.Custom.generation).toBe(metadata);
  expect(
    catalog.data.components.Custom.props.safeParse({ title: "Valid" }).success
  ).toBe(true);
  expect(
    catalog.data.components.Custom.props.safeParse({ title: 42 }).success
  ).toBe(false);
  expect(getGenerationCatalog({ ...config })).toBe(catalog);
});
