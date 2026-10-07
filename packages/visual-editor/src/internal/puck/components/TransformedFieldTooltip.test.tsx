import { describe, expect, it } from "vitest";
import { toPuckFields } from "../../../fields/fields.ts";
import { getTransformedFieldSources } from "./TransformedFieldTooltip.tsx";

describe("transformed field tooltips", () => {
  it("when fields opt in then component tooltips describe only their authored sources", () => {
    expect(
      getTransformedFieldSources(
        toPuckFields({
          title: {
            type: "entityField",
            label: "Title",
            transform: true,
            filter: {},
          },
          image: {
            type: "entityField",
            label: "Image",
            transform: true,
            filter: {},
          },
          primaryCta: { type: "ctaSelector", label: "Order", transform: true },
          oldField: { type: "entityField", filter: {} },
          nested: {
            type: "object",
            objectFields: {
              text: { type: "translatableString", transform: true },
            },
          },
          rows: {
            type: "array",
            arrayFields: {
              name: { type: "entityField", transform: true, filter: {} },
            },
          },
        }),
        {
          title: { field: "name" },
          image: {
            field: "photo",
            constantValueEnabled: true,
            constantValue: {},
          },
          primaryCta: { field: "orderCta", constantValueEnabled: false },
          oldField: { field: "description" },
          nested: { text: { defaultValue: "Text" } },
          rows: [{ name: { field: "linked.name" } }],
        }
      )
    ).toEqual([
      { label: "Title", field: "name" },
      { label: "Image", field: undefined },
      { label: "Order", field: "orderCta" },
      { label: "nested.text", field: undefined },
      { label: "rows[0].name", field: "linked.name" },
    ]);
  });
});
