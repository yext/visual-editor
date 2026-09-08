import { assert, describe, it } from "vitest";
import {
  resolveEmbeddedFieldsInString,
  resolveField,
  resolveYextEntityField,
} from "./resolveYextEntityField.ts";

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

  it("resolves linked entity fields from the first referenced entity", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          c_linkedLocation: [
            {
              name: "First Linked Location",
            },
          ],
        },
        { field: "c_linkedLocation.name", constantValue: "" },
        "en"
      ),
      "First Linked Location"
    );
  });

  it("resolves nested linked entity fields from the first referenced entity", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          c_linkedLocation: [
            {
              address: {
                city: "New York",
              },
            },
          ],
        },
        { field: "c_linkedLocation.address.city", constantValue: "" },
        "en"
      ),
      "New York"
    );
  });

  it("returns undefined for empty linked entity reference lists", async () => {
    assert.equal(
      resolveYextEntityField(
        {
          c_linkedLocation: [],
        },
        { field: "c_linkedLocation.name", constantValue: "" },
        "en"
      ),
      undefined
    );
  });

  it("tracks when linked entity resolution traverses multiple references", async () => {
    assert.deepEqual(
      resolveField(
        {
          c_linkedLocation: [{ name: "First" }, { name: "Second" }],
        },
        "c_linkedLocation.name"
      ),
      {
        value: "First",
        traversedMultiValueReference: true,
        multiValueReferenceField: "c_linkedLocation",
      }
    );
  });
});

describe("resolveField with bracket indexes", () => {
  const document = {
    groups: [
      {
        name: "First Group",
        items: [{ name: "First Item" }, { name: "Second Item" }],
      },
      {
        name: "Second Group",
        items: [{ name: "Third Item" }, { name: "Fourth Item" }],
      },
    ],
    values: ["first", "second"],
    profile: { name: "Yext" },
  };

  it.each([
    ["resolves index zero", "groups[0].name", "First Group"],
    ["resolves a nonzero index", "groups[1].name", "Second Group"],
    ["resolves nested indexes", "groups[1].items[1].name", "Fourth Item"],
    ["resolves a terminal indexed value", "values[1]", "second"],
    [
      "returns undefined for an out-of-range index",
      "groups[2].name",
      undefined,
    ],
    [
      "returns undefined when indexing a non-array",
      "profile[0].name",
      undefined,
    ],
  ])("%s", (_name, fieldName, expectedValue) => {
    assert.equal(resolveField(document, fieldName).value, expectedValue);
  });

  it("preserves implicit first-item traversal", () => {
    assert.equal(resolveField(document, "groups.name").value, "First Group");
  });

  it("does not report implicit traversal for an explicitly indexed list", () => {
    assert.deepEqual(resolveField(document, "groups[1].name"), {
      value: "Second Group",
      traversedMultiValueReference: false,
      multiValueReferenceField: undefined,
    });
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

  it("resolves locale value even when it matches defaultValue text", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            fr: "Welcome to [[name]]!",
            defaultValue: "Welcome to [[name]]!",
          },
          constantValueEnabled: true,
        },
        "fr"
      ),
      {
        fr: "Welcome to Yext!",
        defaultValue: "Welcome to [[name]]!",
      }
    );
  });

  it("resolves embedded fields in defaultValue when locale key is missing", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            defaultValue: "Welcome to [[name]]!",
          },
          constantValueEnabled: true,
        },
        "fr"
      ),
      { defaultValue: "Welcome to Yext!" }
    );
  });

  it("preserves non-text defaultValue objects", () => {
    assert.deepEqual(
      resolveYextEntityField(
        document,
        {
          field: "",
          constantValue: {
            defaultValue: {
              url: "https://example.com/[[id]].jpg",
              width: 100,
              height: 100,
            },
          },
          constantValueEnabled: true,
        },
        "fr"
      ),
      {
        defaultValue: {
          url: "https://example.com/123.jpg",
          width: 100,
          height: 100,
        },
      }
    );
  });
});

describe("numeric embedded field resolution", () => {
  it("resolves root numeric primitives as unformatted text", () => {
    const resolved = resolveEmbeddedFieldsInString(
      "[[zero]] [[negative]] [[integer]] [[decimal]]",
      {
        zero: 0,
        negative: -12,
        integer: 42,
        decimal: 19.95,
      }
    );

    assert.equal(resolved, "0 -12 42 19.95");
  });

  it("resolves a decimal through the first linked entity", () => {
    const resolved = resolveEmbeddedFieldsInString(
      "[[c_linkedProducts.price.value]]",
      {
        c_linkedProducts: [
          {
            price: {
              value: 19.95,
            },
          },
          {
            price: {
              value: 29.95,
            },
          },
        ],
      }
    );

    assert.equal(resolved, "19.95");
  });
});

describe("indexed embedded field resolution", () => {
  it("resolves zero and nonzero list indexes", () => {
    const resolved = resolveEmbeddedFieldsInString(
      "[[articles[0].name]] and [[articles[2].name]]",
      {
        articles: [{ name: "First" }, { name: "Second" }, { name: "Third" }],
      }
    );

    assert.equal(resolved, "First and Third");
  });

  it("replaces an out-of-range indexed field with an empty string", () => {
    assert.equal(
      resolveEmbeddedFieldsInString("Value: [[values[2]]]", {
        values: ["first"],
      }),
      "Value: "
    );
  });
});
