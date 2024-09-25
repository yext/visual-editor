import { test, assert } from "vitest";
import { resolveYextEntityField } from "../src/utils/resolveYextEntityField.ts";

test("resolveYextEntityField returns value when field found in document", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {
          city: "potato land",
        },
      },
      { fieldName: "address.city", staticValue: "" }
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
      { fieldName: "address.city", staticValue: "abc" }
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
      { fieldName: "address.city", staticValue: "City" }
    ),
    "City"
  );
});

test("resolveYextEntityField returns static value when fieldName not set", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {
          city: "",
        },
      },
      { fieldName: "", staticValue: "City" }
    ),
    "City"
  );
});
