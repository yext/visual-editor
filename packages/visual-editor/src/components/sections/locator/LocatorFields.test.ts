import { describe, expect, it } from "vitest";
import { LocatorComponent } from "./Locator.tsx";

const getKeywordsDisplayNameVisibility = (facetValues?: string[]) => {
  const fields = LocatorComponent.resolveFields?.(
    {
      props: {
        filters: {
          facetFields: facetValues
            ? {
                selections: facetValues.map((value) => ({ value })),
              }
            : undefined,
        },
      },
    } as any,
    { metadata: {} } as any
  ) as any;

  return fields.filters.objectFields.keywordsDisplayName.visible;
};

describe("Locator fields", () => {
  it.each([
    {
      name: "shows the display name when Keywords is selected",
      facetValues: ["keywords", "services"],
      expected: true,
    },
    {
      name: "hides the display name when another facet is selected",
      facetValues: ["services"],
      expected: false,
    },
    {
      name: "hides the display name when no facets are selected",
      facetValues: undefined,
      expected: false,
    },
  ])("$name", ({ facetValues, expected }) => {
    expect(getKeywordsDisplayNameVisibility(facetValues)).toBe(expected);
  });
});
