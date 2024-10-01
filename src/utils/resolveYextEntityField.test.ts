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
      { field: "address.city", constantValue: "" }
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
      { field: "address.city", constantValue: "abc" }
    ),
    ""
  );
});

test("resolveYextEntityField returns constant value when field not found in document", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {},
      },
      { field: "address.city", constantValue: "City" }
    ),
    "City"
  );
});

test("resolveYextEntityField returns constant value when field not set", async () => {
  assert.equal(
    resolveYextEntityField(
      {
        address: {
          city: "",
        },
      },
      { field: "", constantValue: "City" }
    ),
    "City"
  );
});
