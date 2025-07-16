import { assert, describe, it } from "vitest";
import { resolveYextEntityField } from "./resolveYextEntityField.ts";

describe("resolveYextEntityField", () => {
  it("returns value when field found in document", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          address: {
            city: "potato land",
          },
        },
        { field: "address.city", constantValue: "" },
        "en"
      ),
      "potato land"
    );
  });

  it("handles the document holding an empty value for the field", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          address: {
            city: "",
          },
        },
        { field: "address.city", constantValue: "abc" },
        "en"
      ),
      ""
    );
  });

  it("returns undefined when field not found in document", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          address: {},
        },
        { field: "address.city", constantValue: "City" },
        "en"
      ),
      undefined
    );
  });

  it("returns constant value when constantValueEnabled is true", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          address: {
            city: "",
          },
        },
        { field: "", constantValue: "City", constantValueEnabled: true },
        "en"
      ),
      "City"
    );
  });
});

describe("resolveYextEntityField with embedded fields", () => {
  const document = {
    name: "Yext",
    id: "123",
    address: {
      city: "New York",
      country: "USA",
    },
    complex: {
      data: "is complex",
    },
  };

  it("resolves a simple embedded field in a TranslatableString", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            en: "Welcome to [[name]]!",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        "en"
      ),
      { en: "Welcome to Yext!", hasLocalizedValue: "true" }
    );
  });

  it("resolves multiple embedded fields", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            en: "[[name]] is in [[address.city]], [[address.country]]. ID: [[id]]",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        "en"
      ),
      {
        en: "Yext is in New York, USA. ID: 123",
        hasLocalizedValue: "true",
      }
    );
  });

  it("resolves embedded fields in a TranslatableRichText", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            en: {
              html: "<p>The ID is [[id]].</p>",
              json: {},
            },
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        "en"
      ),
      {
        en: {
          html: "<p>The ID is 123.</p>",
          json: {},
        },
        hasLocalizedValue: "true",
      }
    );
  });

  it("resolves embedded fields in a deeply nested object", () => {
    const entityField = {
      field: "",
      constantValue: {
        primaryCta: {
          label: {
            en: "CTA for [[name]]",
            hasLocalizedValue: "true",
          },
          link: "#",
        },
        image: {
          url: "image.jpg",
        },
      },
      constantValueEnabled: true,
    };

    const expected = {
      primaryCta: {
        label: {
          en: "CTA for Yext",
          hasLocalizedValue: "true",
        },
        link: "#",
      },
      image: {
        url: "image.jpg",
      },
    };

    assert.deepEqual(
      resolveYextEntityField(document, entityField, "en"),
      expected
    );
  });

  it("replaces an unresolvable embedded field with an empty string", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            en: "This field is [[not.in.document]]",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        "en"
      ),
      { en: "This field is ", hasLocalizedValue: "true" }
    );
  });

  it("stringifies a resolved object value", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            en: "The address is [[address]]",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        "en"
      ),
      {
        en: 'The address is {"city":"New York","country":"USA"}',
        hasLocalizedValue: "true",
      }
    );
  });
});
