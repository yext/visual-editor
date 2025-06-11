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
