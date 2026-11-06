// @vitest-environment node
import { expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { slottedFixture } from "../testing/slottedFixtures.ts";
import { validateInitialChatLayout } from "./initialChatValidation.ts";

it("names the owning section when a nested wrapper has invalid manual slots", () => {
  const fixture = slottedFixture();
  const data = fixture.materialize();
  const wrapper = data.content[0];
  wrapper.props.manualSlots.CardSlot = [];
  data.content = [
    {
      type: "ProductSection",
      props: { id: "products", content: [wrapper] },
    },
  ];
  const catalog = createPuckGenerationCatalog({
    ...fixture.components,
    ProductSection: {
      layoutGenerationMetadata: {
        props: z.object({ content: z.array(z.unknown()) }),
      },
      fields: { content: { type: "slot" } },
    },
  });
  expect(() =>
    validateInitialChatLayout(catalog, data, (type) =>
      type === "ProductSection" ? "Products" : type
    )
  ).toThrow(
    `Section (${wrapper.props.id}): invalid props/manualSlots/CardSlot\n\nTry deleting the Products section.`
  );
});

it("accepts valid existing layouts", () => {
  const fixture = slottedFixture();
  expect(() =>
    validateInitialChatLayout(fixture.catalog, fixture.materialize(), String)
  ).not.toThrow();
});

it.each(["ProductSection", "EventSection", "Header", "Footer"])(
  "accepts editor-produced linked card mirrors nested in %s",
  async (sectionType) => {
    const fixture = slottedFixture();
    const manual = fixture.materialize();
    Object.assign(manual.content[0].props.data, {
      field: "c_items",
      constantValueEnabled: false,
    });
    const linked = await fixture.resolve(manual, {
      locale: "en",
      c_items: [{ name: "Linked item" }],
    });
    const catalog = createPuckGenerationCatalog({
      ...fixture.components,
      [sectionType]: {
        fields: { content: { type: "slot", allow: ["Section"] } },
      },
    });
    const data = {
      content: [
        {
          type: sectionType,
          props: { id: "container", content: linked.content },
        },
      ],
    };
    expect(() =>
      validateInitialChatLayout(catalog, data, String)
    ).not.toThrow();
  }
);

it("preserves errors when the malformed layout cannot identify a section", () => {
  const fixture = slottedFixture();
  expect(() =>
    validateInitialChatLayout(
      fixture.catalog,
      { content: [{ type: "Unknown", props: { id: "unknown" } }] },
      String
    )
  ).toThrow("content: unknown component Unknown");
});
