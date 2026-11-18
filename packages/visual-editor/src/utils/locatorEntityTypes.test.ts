import { describe, expect, it } from "vitest";
import {
  getEntityTypeLabel,
  getLocatorEntityTypeSourceMap,
  isLocatorEntityType,
  LOCATOR_ENTITY_TYPES,
} from "./locatorEntityTypes.ts";
import type { StreamDocument } from "./types/StreamDocument.ts";

describe("locator entity types", () => {
  it.each([...LOCATOR_ENTITY_TYPES, "ce_warehouse", "anotherCustomType"])(
    "accepts the entity type API name %s",
    (entityType) => {
      expect(isLocatorEntityType(entityType)).toBe(true);
    }
  );

  it.each(["", undefined, null, 123, {}])(
    "rejects a missing or non-string entity type: %j",
    (value) => {
      expect(isLocatorEntityType(value)).toBe(false);
    }
  );

  it.each<{
    name: string;
    document: StreamDocument;
    expected: Record<string, string | undefined>;
  }>([
    {
      name: "a custom type from a source page set",
      document: {
        __: {
          locatorSourcePageSets: JSON.stringify({
            warehouses: { entityType: "ce_warehouse" },
          }),
        },
      },
      expected: { ce_warehouse: "warehouses" },
    },
    {
      name: "a custom type from legacy locator config",
      document: {
        _pageset: JSON.stringify({
          typeConfig: {
            locatorConfig: {
              entityType: "ce_warehouse",
              source: "warehouses",
            },
          },
        }),
      },
      expected: { ce_warehouse: "warehouses" },
    },
    {
      name: "a standalone custom type",
      document: {
        _pageset: JSON.stringify({
          typeConfig: {
            locatorConfig: {
              entityTypeScope: [{ entityType: "ce_warehouse" }],
            },
          },
        }),
      },
      expected: { ce_warehouse: undefined },
    },
    {
      name: "mixed source page sets and standalone types",
      document: {
        __: {
          locatorSourcePageSets: JSON.stringify({
            warehouses: { entityType: "ce_warehouse" },
            locations: { entityType: "location" },
          }),
        },
        _pageset: JSON.stringify({
          typeConfig: {
            locatorConfig: { entityTypeScope: [{ entityType: "ce_depot" }] },
          },
        }),
      },
      expected: {
        ce_warehouse: "warehouses",
        location: "locations",
        ce_depot: undefined,
      },
    },
    {
      name: "the default when there is no locator configuration",
      document: {},
      expected: { location: undefined },
    },
  ])("resolves $name", ({ document, expected }) => {
    expect(getLocatorEntityTypeSourceMap(document)).toEqual(expected);
  });

  it.each([
    ["location", "Locations"],
    ["healthcareProfessional", "Healthcare Professionals"],
    ["ce_warehouse", "ce_warehouse"],
    ["ce_camelCaseName", "ce_camelCaseName"],
    ["ce_warehouse3PL", "ce_warehouse3PL"],
    ["ce_localATMBranch", "ce_localATMBranch"],
    ["anotherCustomType", "anotherCustomType"],
    ["ce_", "ce_"],
    ["ce_invalid_name", "ce_invalid_name"],
    ["ce_UpperCaseName", "ce_UpperCaseName"],
  ])("labels %s as %s", (entityType, expected) => {
    expect(getEntityTypeLabel(entityType)).toBe(expected);
  });
});
