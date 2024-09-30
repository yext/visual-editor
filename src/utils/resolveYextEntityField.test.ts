import { test, assert } from "vitest";
import { resolveYextEntityField } from "./resolveYextEntityField.ts";

test("resolveYextEntityField returns value when field found in document", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {
          city: "potato land",
        },
      },
      { fieldId: "address.city", staticValue: "" }
    ),
    "potato land"
  );
});

test("resolveYextEntityField returns empty value when field found in document", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {
          city: "",
        },
      },
      { fieldId: "address.city", staticValue: "abc" }
    ),
    ""
  );
});

test("resolveYextEntityField returns static value when field not found in document", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {},
      },
      { fieldId: "address.city", staticValue: "City" }
    ),
    "City"
  );
});

test("resolveYextEntityField returns static value when fieldId is not set", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {
          city: "",
        },
      },
      { fieldId: "", staticValue: "City" }
    ),
    "City"
  );
});
