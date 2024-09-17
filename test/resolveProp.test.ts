import { test, assert } from "vitest";
import { resolveProp } from "../src/utils/resolveProp.ts";

test("resolve prop data found", async () => {
  assert.equal(
    resolveProp("location.address.city", {
      location: {
        address: {
          city: "potato land",
        },
      },
    }),
    "potato land"
  );
});

test("resolve prop data empty", async () => {
  assert.equal(
    resolveProp("location.address.city", {
      location: {
        address: {
          city: "",
        },
      },
    }),
    ""
  );
});

test("resolve prop data not found", async () => {
  assert.equal(
    resolveProp("location.address.city", {
      location: {},
    }),
    "location.address.city"
  );
});
