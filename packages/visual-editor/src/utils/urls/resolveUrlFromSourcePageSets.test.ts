import { describe, expect, it } from "vitest";
import { resolveUrlFromSourcePageSets } from "./resolveUrlFromSourcePageSets.ts";
import {
  LocatorSourcePageSetInfo,
  StreamDocument,
} from "../types/StreamDocument.ts";

const baseStreamDocument: StreamDocument = {
  id: "stream-123",
  locale: "en",
  __: {
    isPrimaryLocale: true,
  },
};

const createStreamDocument = (
  sourceEntityPageSets: Record<string, LocatorSourcePageSetInfo>,
  overrides?: Partial<StreamDocument>
): StreamDocument => ({
  ...baseStreamDocument,
  ...overrides,
  __: {
    ...baseStreamDocument.__,
    ...overrides?.__,
    locatorSourcePageSets: JSON.stringify(sourceEntityPageSets),
  },
});

describe("resolveUrlFromEntityTypeScopes", () => {
  it("returns undefined when entity type scopes are missing", () => {
    expect(
      resolveUrlFromSourcePageSets(
        { type: "ce_location" },
        baseStreamDocument,
        ""
      )
    ).toBeUndefined();
  });

  it("returns undefined when entity type is missing from the profile", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_location",
        pathInfo: {
          template:
            "stores/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
        },
      },
    });

    expect(
      resolveUrlFromSourcePageSets({}, streamDocument, "")
    ).toBeUndefined();
  });

  it("resolves URL when entity type matches a scope without saved filter", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_location",
        pathInfo: {
          template:
            "stores/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
        },
      },
    });

    expect(
      resolveUrlFromSourcePageSets(
        {
          type: "ce_location",
          savedFilters: ["1111"],
          id: "2222",
          address: {
            region: "VA",
            city: "Arlington",
            line1: "1101 Wilson Blvd",
          },
        },
        streamDocument,
        ""
      )
    ).toBe("stores/va/arlington/1101-wilson-blvd/2222");
  });

  it("resolves URL when entity matches required saved filter", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_location",
        internalSavedFilterId: 1111,
        pathInfo: {
          template:
            "stores/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
          primaryLocale: "en",
        },
      },
    });

    expect(
      resolveUrlFromSourcePageSets(
        {
          type: "ce_location",
          savedFilters: ["1111"],
          id: "2222",
          address: {
            region: "VA",
            city: "Arlington",
            line1: "1101 Wilson Blvd",
          },
        },
        streamDocument,
        ""
      )
    ).toBe("stores/va/arlington/1101-wilson-blvd/2222");
  });

  it("returns undefined when saved filter does not match", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_location",
        internalSavedFilterId: 1111,
        pathInfo: {
          template:
            "stores/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
          primaryLocale: "en",
        },
      },
    });

    expect(
      resolveUrlFromSourcePageSets(
        { type: "ce_location", savedFilters: ["2222"] },
        streamDocument,
        ""
      )
    ).toBeUndefined();
  });

  it("returns undefined when the matching scope has no URL template", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_location",
        pathInfo: {},
      },
    });

    expect(
      resolveUrlFromSourcePageSets({ type: "ce_location" }, streamDocument, "")
    ).toBeUndefined();
  });

  it("prepends relative prefix and locale for non-primary locale", () => {
    const streamDocument = createStreamDocument(
      {
        ignored: {
          entityType: "ce_location",
          pathInfo: {
            template:
              "stores/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
          },
        },
      },
      {
        locale: "es",
        __: {
          isPrimaryLocale: false,
        },
      }
    );

    expect(
      resolveUrlFromSourcePageSets(
        {
          type: "ce_location",
          id: "1111",
          address: {
            region: "VA",
            city: "Arlington",
            line1: "1101 Wilson Blvd",
          },
        },
        streamDocument,
        "../"
      )
    ).toBe("../es/stores/va/arlington/1101-wilson-blvd/1111");
  });

  it("selects the matching entity type when multiple scopes are present", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_atm",
        pathInfo: {
          template:
            "atms/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
        },
      },
      ignored2: {
        entityType: "ce_location",
        pathInfo: {
          template:
            "stores/[[address.region]]/[[address.city]]/[[address.line1]]/[[id]]",
        },
      },
    });

    expect(
      resolveUrlFromSourcePageSets(
        {
          type: "ce_location",
          id: "1111",
          address: {
            region: "VA",
            city: "Arlington",
            line1: "1101 Wilson Blvd",
          },
        },
        streamDocument,
        ""
      )
    ).toBe("stores/va/arlington/1101-wilson-blvd/1111");
  });

  it("skips scopes with unmatched saved filters and resolves from a later match", () => {
    const streamDocument = createStreamDocument({
      ignored: {
        entityType: "ce_location",
        internalSavedFilterId: 1111,
        pathInfo: {
          template: "first/[[id]]",
        },
      },
      ignored2: {
        entityType: "ce_location",
        internalSavedFilterId: 2222,
        pathInfo: {
          template: "second/[[id]]",
        },
      },
    });

    expect(
      resolveUrlFromSourcePageSets(
        {
          type: "ce_location",
          savedFilters: ["2222"],
          id: "3333",
        },
        streamDocument,
        ""
      )
    ).toBe("second/3333");
  });
});
