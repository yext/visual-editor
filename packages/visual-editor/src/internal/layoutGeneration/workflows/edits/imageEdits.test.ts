// @vitest-environment node
import { expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import { resolveComponentData } from "../../../../utils/resolveComponentData.tsx";
import { clone, type Content } from "../../shared/authoredValues.ts";
import { editResponse, editTask, unset } from "../../testing/editFixtures.ts";
import { materializeSectionEdit } from "./applyEditsToLayout.ts";
import { compileSectionEditSchema } from "./compileSectionEditSchema.ts";

const asset = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});
const image = z.union([
  asset,
  z.object({ image: asset }),
  z.object({ defaultValue: asset.optional() }),
]);
const source = (value: z.ZodType) =>
  z.object({
    field: z.string(),
    constantValue: value,
    constantValueEnabled: z.boolean(),
  });
const oldAsset = {
  url: "https://example.com/old.jpg",
  width: 640,
  height: 360,
};

it("offers alt-text leaf edits without a competing parent replacement", () => {
  const text = z.union([
    z.string(),
    z
      .object({
        defaultValue: z.string(),
        hasLocalizedValue: z.literal("true").optional(),
      })
      .catchall(z.string().optional()),
  ]);
  const assetWithAlt = asset.extend({ alternateText: text.optional() });
  const catalog = createPuckGenerationCatalog({
    Image: {
      generation: {
        props: z.object({
          data: z.object({
            image: source(
              z.union([
                assetWithAlt,
                z.object({ defaultValue: assetWithAlt.optional() }),
              ])
            ),
          }),
        }),
      },
    },
  });
  const data: Content = {
    content: [
      {
        type: "Image",
        props: {
          id: "image",
          data: {
            image: {
              field: "",
              constantValueEnabled: true,
              constantValue: {
                defaultValue: { ...oldAsset, alternateText: "Old photo" },
              },
            },
          },
        },
      },
    ],
  };
  const before = clone(data);
  const task = editTask("image", ["image"]);
  const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
  const wire = z.fromJSONSchema(compiled.jsonSchema);
  const parent = "/data/image/constantValue/defaultValue/alternateText";
  const child = `${parent}/defaultValue`;
  const output = editResponse(task, child, "Fashion boots for fall");
  expect(wire.safeParse(output).success).toBe(true);
  expect(
    wire.safeParse(editResponse(task, parent, "Fashion boots for fall")).success
  ).toBe(false);
  const overlapping = clone(output);
  overlapping.updates[0].changes.unshift({
    kind: "set",
    path: parent,
    value: "Fashion boots for fall",
  });
  expect(wire.safeParse(overlapping).success).toBe(false);
  expect(() => compiled.parseResponse(JSON.stringify(overlapping))).toThrow(
    "Authored edit paths overlap"
  );
  const applied = materializeSectionEdit(
    catalog,
    data,
    task,
    compiled.parseResponse(JSON.stringify(output))
  );
  const rendered = resolveComponentData(
    applied.content[0].props.data.image,
    "en"
  ) as any;
  expect(resolveComponentData(rendered.alternateText, "en")).toBe(
    "Fashion boots for fall"
  );
  expect(data).toEqual(before);
});

it.each(["direct", "nested", "fallback"] as const)(
  "updates the rendered image in its saved %s representation",
  (representation) => {
    const catalog = createPuckGenerationCatalog({
      Image: {
        generation: {
          props: z.object({ data: z.object({ image: source(image) }) }),
        },
      },
    });
    const current =
      representation === "fallback"
        ? {
            defaultValue: oldAsset,
            fr: { ...oldAsset, url: "https://example.com/fr.jpg" },
          }
        : representation === "nested"
          ? { image: oldAsset }
          : oldAsset;
    const data: Content = {
      content: [
        {
          type: "Image",
          props: {
            id: "image",
            data: {
              image: {
                field: "",
                constantValue: current,
                constantValueEnabled: true,
              },
            },
          },
        },
      ],
    };
    const before = clone(data);
    const task = editTask("image", ["image"]);
    const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
    const suffix =
      representation === "fallback" ? "/defaultValue/url" : "/image/url";
    const path = "/data/image/constantValue";
    const nextUrl = "https://example.com/boots.jpg";
    const output = editResponse(
      task,
      representation === "direct" ? path : path + suffix,
      representation === "direct" ? { ...oldAsset, url: nextUrl } : nextUrl
    );
    expect(
      z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
    ).toBe(true);
    const result = compiled.parseResponse(JSON.stringify(output));
    const updated = materializeSectionEdit(catalog, data, task, result);
    const field = updated.content[0].props.data.image;
    const rendered = resolveComponentData(field, "en") as any;
    expect((rendered.image ?? rendered).url).toBe(nextUrl);
    if (representation === "fallback") {
      expect(field.constantValue.fr).toEqual((current as any).fr);
      const wrongShape = editResponse(task, path, {
        ...oldAsset,
        url: nextUrl,
      });
      expect(
        z.fromJSONSchema(compiled.jsonSchema).safeParse(wrongShape).success
      ).toBe(false);
      expect(() =>
        compiled.parseResponse(JSON.stringify(wrongShape))
      ).toThrow();
      expect(field.constantValue).not.toHaveProperty("url");
    }
    expect(data).toEqual(before);
  }
);

it.each([false, true])(
  "constrains gallery link overrides to saved or approved locales (translate %s)",
  (translate) => {
    const link = z
      .object({
        defaultValue: z.string(),
        hasLocalizedValue: z.literal("true").optional(),
      })
      .catchall(z.string().optional());
    const catalog = createPuckGenerationCatalog({
      Gallery: {
        generation: {
          props: z.object({
            data: z.object({
              images: source(
                z.array(z.object({ image: source(asset), link: source(link) }))
              ),
            }),
          }),
        },
      },
    });
    const row = (index: number) => ({
      image: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          ...oldAsset,
          url: `https://example.com/old-${index}.jpg`,
        },
      },
      link: {
        field: "",
        constantValueEnabled: true,
        constantValue: { defaultValue: "" },
      },
    });
    const rows = [row(0), row(1), row(2)];
    const data: Content = {
      content: [
        {
          type: "Gallery",
          props: {
            id: "gallery",
            data: {
              images: {
                field: "",
                constantValueEnabled: true,
                constantValue: rows,
              },
            },
          },
        },
      ],
    };
    const before = clone(data);
    const task = {
      ...editTask("gallery", ["gallery"]),
      translationMode: translate
        ? ("translate" as const)
        : ("defaultOnly" as const),
    };
    const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
    const wire = z.fromJSONSchema(compiled.jsonSchema);
    const replacements = rows.map((item, index) => ({
      ...item,
      image: {
        ...item.image,
        constantValue: {
          ...oldAsset,
          url: `https://example.com/boots-${index}.jpg`,
        },
      },
      link: {
        ...item.link,
        constantValue: {
          defaultValue: "",
          hasLocalizedValue: unset,
          en: unset,
        },
      },
    }));
    const output = editResponse(
      task,
      "/data/images/constantValue",
      replacements
    );
    expect(wire.safeParse(output).success).toBe(true);
    const updated = materializeSectionEdit(
      catalog,
      data,
      task,
      compiled.parseResponse(JSON.stringify(output))
    );
    const applied = updated.content[0].props.data.images.constantValue;
    expect(applied.map((item: any) => item.image.constantValue.url)).toEqual(
      replacements.map((item) => item.image.constantValue.url)
    );
    expect(applied.map((item: any) => item.link)).toEqual(
      rows.map((item) => item.link)
    );
    const unauthorized = clone(output);
    unauthorized.updates[0].changes[0].value = replacements.map((item) => ({
      ...item,
      link: {
        ...item.link,
        constantValue: { ...item.link.constantValue, en: "" },
      },
    }));
    expect(wire.safeParse(unauthorized).success).toBe(translate);
    if (!translate)
      expect(() =>
        compiled.parseResponse(JSON.stringify(unauthorized))
      ).toThrow("Translation approval");
    expect(data).toEqual(before);
  }
);

it("keeps nested image/video unions atomic instead of offering video metadata on an image", () => {
  const video = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().optional(),
  });
  const catalog = createPuckGenerationCatalog({
    Promo: {
      generation: {
        props: z.object({
          data: z.object({
            promo: source(
              z.object({ image: z.union([image, video]).optional() })
            ),
          }),
        }),
      },
    },
  });
  const data: Content = {
    content: [
      {
        type: "Promo",
        props: {
          id: "promo",
          data: {
            promo: {
              field: "",
              constantValueEnabled: true,
              constantValue: { image: oldAsset },
            },
          },
        },
      },
    ],
  };
  const task = editTask("promo", ["promo"]);
  const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
  const wire = z.fromJSONSchema(compiled.jsonSchema);
  const path = "/data/promo/constantValue/image";
  for (const key of ["id", "name"]) {
    const invalid = editResponse(task, `${path}/${key}`, "fall-boots");
    expect(wire.safeParse(invalid).success).toBe(false);
    expect(() => compiled.parseResponse(JSON.stringify(invalid))).toThrow(
      `Use set:${path} with a complete value matching its schema`
    );
  }
  const output = editResponse(task, path, {
    ...oldAsset,
    url: "https://example.com/boots.jpg",
  });
  expect(wire.safeParse(output).success).toBe(true);
  const applied = materializeSectionEdit(
    catalog,
    data,
    task,
    compiled.parseResponse(JSON.stringify(output))
  );
  expect(applied.content[0].props.data.promo.constantValue.image.url).toBe(
    "https://example.com/boots.jpg"
  );
  expect(data.content[0].props.data.promo.constantValue.image).toEqual(
    oldAsset
  );
});
