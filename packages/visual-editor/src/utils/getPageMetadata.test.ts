import { describe, expect, it } from "vitest";
import { getPageMetadata } from "./getPageMetadata";

describe("getPageMetadata", () => {
  it("works with entity values ", async () => {
    const testDocument = {
      name: "Test Name",
      description: "Test Description",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              title: {
                field: "name",
                constantValue: {},
              },
              description: { field: "description", constantValue: {} },
            },
          },
        }),
      },
    };
    const metaData = getPageMetadata(testDocument);

    expect(metaData).toMatchObject({
      title: "Test Name",
      description: "Test Description",
    });
  });

  it("works with translated constant values", async () => {
    const testDocument = {
      name: "Test Name",
      description: "Test Description",
      locale: "es",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              version: 20,
              title: {
                field: "name",
                constantValue: {
                  en: "Name",
                  es: "Nombre",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
              description: {
                field: "description",
                constantValue: {
                  en: "Description",
                  es: "Descripción",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
          },
        }),
      },
    };
    const metaData = getPageMetadata(testDocument);

    expect(metaData).toMatchObject({
      title: "Nombre",
      description: "Descripción",
    });
  });

  it("works with missing and escaped values", async () => {
    const testDocument = {
      description: "Test Description",
      locale: "en",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              title: {
                field: "name",
                constantValue: {},
              },
              description: {
                field: "description",
                constantValue: {
                  en: "'<>'",
                  es: "Descripción",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
          },
        }),
      },
    };
    const metaData = getPageMetadata(testDocument);

    expect(metaData).toMatchObject({
      title: "",
      description: "&#39;&lt;&gt;&#39;",
    });
  });

  it("falls back to english for title when the localized value is empty", async () => {
    const testDocument = {
      name: "Test Name",
      description: "Test Description",
      locale: "es",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              title: {
                field: "name",
                constantValue: {
                  en: "English",
                  es: "",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
              description: {
                field: "description",
                constantValue: {
                  en: "English",
                  es: "",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
          },
        }),
      },
    };
    const metaData = getPageMetadata(testDocument);

    expect(metaData).toMatchObject({
      title: "English",
      description: "",
    });
  });

  it("resolves PLACEHOLDER for directory pages", async () => {
    const testDocument = {
      name: "Test Name",
      description: "Test Description",
      meta: {
        entityType: { id: "dm_country" },
      },
      locale: "en",
      dm_addressCountryDisplayName: "United States",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              title: {
                field: "",
                constantValue: {
                  en: "PLACEHOLDER",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
              description: {
                field: "description",
                constantValue: {
                  en: "PLACEHOLDER",
                  es: "",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
          },
        }),
      },
    };
    const metaData = getPageMetadata(testDocument);

    expect(metaData).toMatchObject({
      title: "Locations in United States",
      description: "Browse locations in United States",
    });
  });
});
