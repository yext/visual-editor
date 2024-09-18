import { test, assert } from "vitest";
import { resolveProp } from "../src/utils/resolveProp.ts";

test("resolveProp returns value when field found in document", async () => {
  assert.equal(
    resolveProp(
      {
        address: {
          city: "potato land",
        },
      },
      "address.city"
    ),
    "potato land"
  );
});

test("resolveProp returns empty value when field found in document", async () => {
  assert.equal(
    resolveProp(
      {
        address: {
          city: "",
        },
      },
      "address.city"
    ),
    ""
  );
});

test("resolveProp returns constant value when field not found in document", async () => {
  assert.equal(
    resolveProp(
      {
        address: {},
      },
      "address.city"
    ),
    "address.city"
  );
});
