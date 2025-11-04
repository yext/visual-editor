import { assert, describe, it } from "vitest";
import { resolveSchemaJson } from "./resolveSchema";

describe("resolveSchemaJson", () => {
  const document = {
    name: "Yext",
    id: "123",
    address: {
      city: "New York",
      country: "USA",
    },
  };

  it("resolves embedded string fields in a schema string", () => {
    assert.deepEqual(
      resolveSchemaJson(document, `{name:"[[name]]",id:"[[id]]"}`),
      `{name:"Yext",id:"123"}`
    );
  });

  it("resolves embedded complex fields in a schema string", () => {
    assert.deepEqual(
      resolveSchemaJson(document, `{name:"[[name]]",address:"[[address]]"}`),
      `{name:"Yext",address:"{\\"city\\":\\"New York\\",\\"country\\":\\"USA\\"}"}`
    );
  });
});
