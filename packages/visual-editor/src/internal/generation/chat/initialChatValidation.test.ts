// @vitest-environment node
import { expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import { slottedFixture } from "../slottedGenerationTestUtils.ts";
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
      generation: { props: z.object({ content: z.array(z.unknown()) }) },
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
