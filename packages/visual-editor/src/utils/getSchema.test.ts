import { describe, expect, it } from "vitest";
import { getSchema } from "./getSchema";

describe("getSchema", () => {
  it("works with schemaMarkup ", async () => {
    const testDocument = {
      name: "Test Name",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              schemaMarkup: {
                name: "[[name]]",
              },
            },
          },
        }),
      },
      _schema: {
        name: "Old Name",
      },
    };
    const schema = getSchema(testDocument);

    expect(schema).toMatchObject({
      name: "Test Name",
    });
  });

  it("works with old schema ", async () => {
    const testDocument = {
      name: "Test Name",
      __: {
        layout: JSON.stringify({
          root: {
            props: {
              otherField: "test",
            },
          },
        }),
      },
      _schema: {
        name: "Old Name",
      },
    };
    const schema = getSchema(testDocument);

    expect(schema).toMatchObject({
      name: "Old Name",
    });
  });
});
