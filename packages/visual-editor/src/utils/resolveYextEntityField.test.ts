import { assert, describe, expect, it } from "vitest";
import {
  handleResolveFieldsForCollections,
  resolveYextEntityField,
  resolveYextSubfield,
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
        { field: "address.city", constantValue: "" }
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
        { field: "address.city", constantValue: "abc" }
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
        { field: "address.city", constantValue: "City" }
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
        { field: "", constantValue: "City", constantValueEnabled: true }
      ),
      "City"
    );
  });
});

describe("resolveYextSubfield", () => {
  it("handles constant values", () => {
    assert.equal(
      resolveYextSubfield(
        {},
        { field: "", constantValue: "Text", constantValueEnabled: true }
      ),
      "Text"
    );
  });

  it("handles object parents", () => {
    assert.equal(
      resolveYextSubfield(
        { title: "Test Title", description: "Test Description" },
        {
          field: "c_customSection.items.description",
          constantValue: "Text",
        }
      ),
      "Test Description"
    );
  });

  it("handles non-object parents", () => {
    assert.equal(
      resolveYextSubfield("Example Service", {
        field: "c_customSection.services",
        constantValue: "Text",
      }),
      "Example Service"
    );
  });

  it("returns undefined if no field set", () => {
    assert.equal(
      resolveYextSubfield(
        { title: "Test Title", description: "Test Description" },
        {
          field: "",
          constantValue: "Text",
        }
      ),
      undefined
    );
  });

  it("returns undefined the non-object parent type does not match the expected type", () => {
    assert.equal(
      resolveYextSubfield("abc", {
        field: "c_customSection.services",
        constantValue: 123,
      }),
      undefined
    );
  });

  it("returns undefined if the parent object does not contain the field key", () => {
    assert.equal(
      resolveYextSubfield(
        { title: "Test Title", description: "Test Description" },
        {
          field: "c_customSection.services.promo",
          constantValue: "abc",
        }
      ),
      undefined
    );
  });

  it("returns undefined if the field is not parsable as a subfield", () => {
    assert.equal(
      resolveYextSubfield(
        { title: "Test Title", description: "Test Description" },
        {
          field: "c_customSection",
          constantValue: "abc",
        }
      ),
      undefined
    );
  });
});

describe("handleResolveFieldsForCollections", () => {
  it("returns shouldReturnLastFields=true correctly", () => {
    const res = handleResolveFieldsForCollections(
      {
        props: {
          collection: {
            items: {
              field: "c_collection",
              constantValueEnabled: true,
            },
          },
          mySubField: "ABC",
        },
      },
      {
        lastFields: {
          mySubField: {
            type: "text",
          },
        },
        parent: {
          props: {
            collection: {
              items: {
                field: "c_collection",
                constantValueEnabled: true,
              },
            },
          },
        },
      }
    );

    expect(res.shouldReturnLastFields).toBe(true);
    expect(res.isCollection).toBe(false);
    expect(res.directChildrenFilter).toBeUndefined();
  });

  it("handles incomplete lastFields correctly", () => {
    const res = handleResolveFieldsForCollections(
      {
        props: {
          collection: {
            items: {
              field: "c_collection",
              constantValueEnabled: false,
            },
          },
          mySubField: "ABC",
        },
      },
      {
        lastFields: {},
        parent: {
          props: {
            collection: {
              items: {
                field: "c_collection",
                constantValueEnabled: false,
              },
            },
          },
        },
      }
    );

    expect(res.shouldReturnLastFields).toBe(false);
    expect(res.isCollection).toBe(true);
    expect(res.directChildrenFilter).toBe("c_collection");
  });

  it("returns shouldReturnLastFields=false with data updates correctly", () => {
    const data = {
      props: {
        collection: {
          items: {
            field: "c_collection_1",
            constantValueEnabled: false,
          },
        },
        mySubField: {
          field: "c_collection_1.title",
          constantValue: "ABC",
        },
      },
    };
    const res = handleResolveFieldsForCollections(data, {
      lastFields: {
        mySubField: {
          type: "text",
        },
      },
      parent: {
        props: {
          collection: {
            items: {
              field: "c_collection_2",
              constantValueEnabled: false,
            },
          },
        },
      },
    });

    expect(res.shouldReturnLastFields).toBe(false);
    expect(res.isCollection).toBe(true);
    expect(res.directChildrenFilter).toBe("c_collection_2");
    expect(data.props.mySubField.field).toBe("");
  });

  it("returns shouldReturnLastFields=false with no data updates correctly", () => {
    const data = {
      props: {
        collection: {
          items: {
            field: "c_collection",
            constantValueEnabled: false,
          },
        },
        myRegularField: "ABC",
      },
    };

    const res = handleResolveFieldsForCollections(data, {
      lastFields: {
        mySubField: {
          type: "text",
        },
      },
      parent: {
        props: {
          collection: {
            items: {
              field: "c_collection",
              constantValueEnabled: true,
            },
          },
        },
      },
    });

    expect(res.shouldReturnLastFields).toBe(false);
    expect(res.isCollection).toBe(false);
    expect(res.directChildrenFilter).toBeUndefined();
    expect(data.props.myRegularField).toBe("ABC");
  });
});
