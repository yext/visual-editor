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
    { entityTypes: ["ce_warehouse"] },
    { entityTypes: ["ce_warehouse", "location"] },
    { entityTypes: ["location", "ce_warehouse"] },
  ])(
    "configures cards and styles for $entityTypes",
    async ({ entityTypes }) => {
      const params = {
        metadata: {
          streamDocument: {
            _pageset: JSON.stringify({
              typeConfig: {
                locatorConfig: {
                  entityTypeScope: entityTypes.map((entityType) => ({
                    entityType,
                  })),
                },
              },
            }),
          },
        },
      } as any;
      const customCard = {
        props: {
          entityType: "ce_warehouse",
          primaryHeading: { field: "c_warehouseName" },
        },
      };
      const customStyle = {
        entityType: "ce_warehouse",
        pinIcon: { type: "icon", iconName: "warehouse" },
      };
      const data = {
        props: {
          ...LocatorComponent.defaultProps,
          resultCard: [customCard],
          locationStyles: [customStyle],
        },
      } as any;
      const fields = LocatorComponent.resolveFields?.(data, params) as any;
      expect(fields.resultCard).toMatchObject({
        min: entityTypes.length,
        max: entityTypes.length,
      });
      expect(fields.locationStyles).toMatchObject({
        min: entityTypes.length,
        max: entityTypes.length,
      });

      const resolved = (await LocatorComponent.resolveData?.(
        data,
        params
      )) as any;
      expect(
        resolved.props.resultCard.map((card: any) => card.props.entityType)
      ).toEqual(entityTypes);
      expect(
        resolved.props.locationStyles.map((style: any) => style.entityType)
      ).toEqual(entityTypes);
      expect(resolved.props.resultCard).toContainEqual(customCard);
      expect(resolved.props.locationStyles).toContainEqual(
        expect.objectContaining(customStyle)
      );
    }
  );

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
