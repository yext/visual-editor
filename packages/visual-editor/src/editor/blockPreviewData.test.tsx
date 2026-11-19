import React from "react";
import {
  Render,
  type Config,
  type ComponentData,
  type Metadata,
} from "@puckeditor/core";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { CTA } from "../components/atoms/cta.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { resolveBlockPreview } from "./blockPreviewData.tsx";
import { toPuckFields } from "../fields/fields.ts";
import { createYextFieldTransforms } from "../fields/fieldTransforms/index.ts";

const config: Config = {
  root: { resolveData: vi.fn(), render: () => <main>Page chrome</main> },
  components: {
    Box: {
      fields: { content: { type: "slot" } },
      defaultProps: { content: [] },
      render: ({ content: Content }) => Content({ as: "div" }),
    },
    Heading: {
      fields: toPuckFields({
        text: {
          type: "entityField",
          transform: true,
          filter: { types: ["type.string"] },
        },
      }),
      defaultProps: { text: { field: "name", constantValueEnabled: false } },
      render: ({ text }) => <h2>{text}</h2>,
    },
    Card: {
      fields: { content: { type: "slot" } },
      defaultProps: {
        as: "article",
        content: [{ type: "Heading", props: { id: "authored-child" } }],
      },
      render: ({ content: Content }) => Content({ as: "article" }),
    },
    List: {
      fields: { content: { type: "slot", allow: ["ListItem"] } },
      defaultProps: { as: "ul", content: [] },
      render: ({ content: Content }) => Content({ as: "ul" }),
    },
  },
};

it("resolves current entity fields with the published transforms without rendering the page chrome", async () => {
  const document = { locale: "en", name: "Actual entity name" };
  const before = structuredClone(config.components.Card.defaultProps);
  const preview = await resolveBlockPreview(config, "Card", document, {
    title: "Page title",
  });
  const html = renderToStaticMarkup(
    <Render
      config={preview.config}
      data={preview.data}
      fieldTransforms={createYextFieldTransforms(document, "en")}
    />
  );
  expect(html).toContain("Actual entity name");
  expect(html).toContain("<article");
  expect(html).toContain("ve-block-preview-stage ve-theme-page ve-theme-body");
  expect(html).not.toContain("Page chrome");
  expect(config.root!.resolveData).not.toHaveBeenCalled();
  expect(config.components.Card.defaultProps).toEqual(before);
  expect(preview.data.content[0].props.content[0].props.id).not.toBe(
    "authored-child"
  );
  expect(preview.wideLayout).toBe(false);
});

it.each(["link", "button"] as const)(
  "keeps authored CTA colors in the default state for a %s action",
  (actionType) => {
    const html = renderToStaticMarkup(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <CTA
          label="Contact"
          link="https://example.com"
          variant="primary"
          actionType={actionType}
          normalizeLink={false}
          color={{ selectedColor: "[#123456]", contrastingColor: "white" }}
        />
      </TemplatePropsContext.Provider>
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    const cta = container.querySelector(
      actionType === "link" ? "a" : "button"
    )!;
    expect(
      cta.style.getPropertyValue(
        "--ve-surface-primary-button-default-background-color"
      )
    ).toBe("#123456");
    expect(
      cta.style.getPropertyValue(
        "--ve-surface-primary-button-default-text-color"
      )
    ).toBe("white");
    expect(cta.style.background).toBe("");
    expect(cta.style.color).toBe("");
  }
);

it("assigns private, stable, unique IDs through nested defaults", async () => {
  const one = await resolveBlockPreview(config, "Card", { locale: "en" }, {});
  const two = await resolveBlockPreview(config, "Card", { locale: "en" }, {});
  expect(one.data).toEqual(two.data);
  const parent = one.data.content[0];
  expect(parent.props.id).not.toBe(parent.props.content[0].props.id);
  expect(parent.props.content[0].props.text.field).toBe("name");
});

it.each([
  ["Box", "div"],
  ["List", "li"],
])(
  "adds marked sample children only to an empty %s layout",
  async (type, tag) => {
    const preview = await resolveBlockPreview(
      config,
      type,
      { locale: "en" },
      {}
    );
    expect(preview.sampleLayout).toBe(true);
    expect(config.components[type].defaultProps!.content).toEqual([]);
    expect(preview.data.content[0].props.content).toHaveLength(3);
    const html = renderToStaticMarkup(
      <Render config={preview.config} data={preview.data} />
    );
    expect(html).toContain(`<${tag}`);
    expect(html).toContain(">1</");
    expect(
      (await resolveBlockPreview(config, "Card", { locale: "en" }, {}))
        .sampleLayout
    ).toBe(false);
  }
);

it("passes entity data to component resolution and isolates invalid defaults", async () => {
  const resolveData = vi.fn(
    (
      item: Omit<ComponentData, "type">,
      { metadata }: { metadata: Metadata }
    ) => ({
      ...item,
      props: { ...item.props, text: metadata.streamDocument.name },
    })
  );
  const local: Config = {
    components: {
      Heading: {
        ...config.components.Heading,
        fields: { text: { type: "text" } },
        resolveData,
      },
    },
  };
  const preview = await resolveBlockPreview(
    local,
    "Heading",
    { locale: "en", name: "Resolved title" },
    {}
  );
  expect(preview.data.content[0].props.text).toBe("Resolved title");
  expect(resolveData).toHaveBeenCalled();
  await expect(
    resolveBlockPreview(local, "Missing", { locale: "en" }, {})
  ).rejects.toThrow("Unknown preview component");
});

it("previews nested layout slots without inventing content for entity-backed components", async () => {
  const layout = {
    fields: {
      slots: {
        type: "array" as const,
        arrayFields: { Column: { type: "slot" as const } },
      },
    },
    defaultProps: { slots: [{ Column: [] }, { Column: [] }] },
    render: () => <div />,
  };
  const local: Config = { components: { Layout: layout } };
  const preview = await resolveBlockPreview(
    local,
    "Layout",
    { locale: "en" },
    {}
  );
  expect(preview.sampleLayout).toBe(true);
  expect(
    preview.data.content[0].props.slots.map(
      (slot: any) => slot.Column[0].props.number
    )
  ).toEqual([1, 2]);
  expect(layout.defaultProps.slots).toEqual([{ Column: [] }, { Column: [] }]);
  const mapped: Config = {
    components: {
      Layout: {
        ...layout,
        fields: {
          ...layout.fields,
          ...toPuckFields({
            source: { type: "entityField", filter: { types: ["type.string"] } },
          }),
        },
      },
    },
  };
  expect(
    (await resolveBlockPreview(mapped, "Layout", { locale: "en" }, {}))
      .sampleLayout
  ).toBe(false);
});
