import { MainContent } from "../../../components/helpers/MainContent.tsx";
import { validateAuthored } from "./authoredValues.ts";
import type { Config } from "@puckeditor/core";
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
        layoutGenerationMetadata: { props: z.object({ title: z.string() }) },
        defaultProps: { title: "Default" },
      },
      Child: {
        nestedOnly: true,
        layoutGenerationMetadata: { props: z.object({ text: z.string() }) },
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
    catalog.data.components.Custom.generation!.props.safeParse({
      title: "Valid",
    }).success
  ).toBe(true);
  expect(
    catalog.data.components.Custom.generation!.props.safeParse({ title: 42 })
      .success
  ).toBe(false);
  expect(getGenerationCatalog({ ...config })).toBe(catalog);
});

it("shares explicit page-area capabilities between editor slots and generation without changing other configs", () => {
  const components: Config["components"] = {
    MainContent,
    FancyPanel: {
      fields: { content: { type: "slot" } },
      render: () => createElement("div"),
    },
    OtherPanel: {
      fields: { content: { type: "slot" } },
      render: () => createElement("div"),
    },
    Heading: {
      fields: { text: { type: "text" } },
      render: () => createElement("h2"),
    },
    MisleadingSection: {
      fields: { text: { type: "text" } },
      render: () => createElement("p"),
    },
  };
  const catalog = createPuckGenerationCatalog(components);
  const raw: Config = {
    components,
    root: {
      metadata: {
        pageContentAllowedComponentIds: [
          "FancyPanel",
          "Unknown",
          "MainContent",
        ],
        rootAllowedComponentIds: ["MainContent", "FancyPanel"],
      },
    },
  };
  const configured = withGenerationCatalog(raw, catalog);
  const scoped = getGenerationCatalog(configured);
  expect(configured.components.MainContent.fields?.content).toMatchObject({
    type: "slot",
    allow: ["FancyPanel"],
  });
  expect(scoped.data.components.MainContent.fields.content).toMatchObject({
    type: "slot",
    allow: ["FancyPanel"],
  });
  expect(configured.components.MainContent.fields?.content).toHaveProperty(
    "disallow",
    undefined
  );
  expect(scoped.data.components.MainContent.fields.content).toHaveProperty(
    "disallow",
    undefined
  );
  expect(components.MainContent.fields?.content).not.toHaveProperty("allow");
  expect(catalog.data.components.MainContent.fields.content).not.toHaveProperty(
    "allow"
  );
  const heading = { type: "Heading", props: { id: "heading", text: "Title" } };
  const page = (content: any[]) => ({
    content: [{ type: "MainContent", props: { id: "main", content } }],
  });
  expect(() =>
    validateAuthored(
      scoped,
      page([{ type: "FancyPanel", props: { id: "panel", content: [heading] } }])
    )
  ).not.toThrow();
  expect(() => validateAuthored(scoped, page([heading]))).toThrow(
    "Heading is not allowed"
  );
  expect(() =>
    validateAuthored(
      scoped,
      page([{ type: "MisleadingSection", props: { id: "fake", text: "Text" } }])
    )
  ).toThrow("MisleadingSection is not allowed");
  expect(() => validateAuthored(scoped, { content: [heading] })).toThrow(
    "Heading is not allowed"
  );
  const other = withGenerationCatalog(
    {
      ...raw,
      root: { metadata: { pageContentAllowedComponentIds: ["OtherPanel"] } },
    },
    catalog
  );
  expect(other.components.MainContent.fields?.content).toMatchObject({
    allow: ["OtherPanel"],
  });
  expect(configured.components.MainContent.fields?.content).toMatchObject({
    allow: ["FancyPanel"],
  });
});
