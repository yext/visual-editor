import { describe, expect, it } from "vitest";
import {
  resolveUrlTemplate,
  resolveUrlTemplateOfChild,
} from "./resolveUrlTemplate";
import { StreamDocument } from "../types/StreamDocument";

const mockStreamDocument: StreamDocument = {
  id: "123",
  locale: "en",
  address: {
    line1: "61 9th Ave",
    city: "New York",
    region: "NY",
  },
  __: {
    isPrimaryLocale: true,
  },
  _pageset: JSON.stringify({
    config: {
      urlTemplate: {
        primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
        alternate:
          "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
      },
    },
  }),
};

const mockDMCityDocument: StreamDocument = {
  name: "Arlington",
  id: "arlington-va",
  locale: "en",
  __: {
    pathInfo: {
      template: "directory/[[id]]",
      primaryLocale: "en",
    },
  },
  _pageset: JSON.stringify({
    type: "DIRECTORY",
  }),
};

const mockChildProfile = {
  id: "child-profile-1",
  locale: "en",
  address: {
    line1: "2000 University Dr",
    city: "Fairfax",
    region: "VA",
  },
  __: {
    pathInfo: {
      sourceEntityPageSetTemplate:
        "[[address.region]]/[[address.city]]/[[address.line1]]",
      template: "",
      primaryLocale: "en",
    },
  },
  _pageset: JSON.stringify({
    type: "ENTITY",
  }),
};

describe("resolveUrlTemplate", () => {
  it("uses pathInfo template before page set template", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      __: {
        ...mockStreamDocument.__,
        pathInfo: {
          template: "stores/[[id]]",
          primaryLocale: "en",
        },
      },
    };

    expect(resolveUrlTemplate(documentWithPathInfo, "")).toBe("stores/123");
  });

  it("falls back to page set template when pathInfo is missing", () => {
    expect(resolveUrlTemplate(mockStreamDocument, "")).toBe(
      "ny/new-york/61-9th-ave"
    );
  });

  it("uses alternate page set template for non-primary locale", () => {
    const alternateLocaleDoc: StreamDocument = {
      ...mockStreamDocument,
      locale: "es",
      __: {
        ...mockStreamDocument.__,
        isPrimaryLocale: false,
      },
    };

    expect(resolveUrlTemplate(alternateLocaleDoc, "")).toBe(
      "es/ny/new-york/61-9th-ave"
    );
  });

  it("normalizes locale before resolving page set templates", () => {
    const alternateLocaleDoc: StreamDocument = {
      ...mockStreamDocument,
      locale: "Zh_HANS-hk",
      __: {
        ...mockStreamDocument.__,
        isPrimaryLocale: false,
      },
    };

    expect(resolveUrlTemplate(alternateLocaleDoc, "")).toBe(
      "zh-hans-hk/ny/new-york/61-9th-ave"
    );
  });

  it("includes locale prefix for primary locale when pathInfo requires it", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      __: {
        ...mockStreamDocument.__,
        pathInfo: {
          template: "stores/[[id]]",
          primaryLocale: "en",
          includeLocalePrefixForPrimaryLocale: true,
        },
      },
    };

    expect(resolveUrlTemplate(documentWithPathInfo, "")).toBe("en/stores/123");
  });

  it("includes locale prefix for non-primary locale when pathInfo sets primaryLocale", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      locale: "es",
      __: {
        ...mockStreamDocument.__,
        pathInfo: {
          template: "stores/[[id]]",
          primaryLocale: "en",
        },
      },
    };

    expect(resolveUrlTemplate(documentWithPathInfo, "")).toBe("es/stores/123");
  });

  it("falls back to location path when no templates are available", () => {
    const documentWithoutTemplates: StreamDocument = {
      id: "location1",
      locale: "en",
    };

    expect(resolveUrlTemplate(documentWithoutTemplates, "")).toBe("location1");
  });

  it("throws error when no resolver succeeds", () => {
    expect(() => resolveUrlTemplate({} as StreamDocument, "")).toThrowError();
  });
});

describe("resolveUrlTemplateOfChild", () => {
  it("resolves child profile URL using its own pathInfo template", () => {
    expect(
      resolveUrlTemplateOfChild(mockChildProfile, mockDMCityDocument, "")
    ).toBe("va/fairfax/2000-university-dr");
  });
});
