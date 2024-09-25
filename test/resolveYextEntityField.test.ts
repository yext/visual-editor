import { test, assert } from "vitest";
import { resolveYextEntityField } from "../src/utils/resolveYextEntityField.ts";

test("resolveProp returns value when field found in document", async () => {
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

test("resolveProp returns empty value when field found in document", async () => {
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

test("resolveProp returns static value when field not found in document", async () => {
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

test("resolveProp returns static value when 'Use Static Value' is selected", async () => {
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
