import { describe, expect, it } from "vitest";
import { toPuckFields, type YextFieldMap } from "../fields.ts";
import { createYextFieldTransforms } from "./createYextFieldTransforms.ts";

describe("optional field transforms", () => {
  const fields = {
    value: {
      type: "optional",
      defaultCustomValue: {},
      field: {
        type: "object",
        objectFields: {
          label: { type: "translatableString", transform: true },
          authored: { type: "translatableString" },
          rows: {
            type: "array",
            arrayFields: {
              limit: {
                type: "optional",
                defaultCustomValue: 5,
                field: {
                  type: "number",
                },
              },
              label: { type: "translatableString", transform: true },
            },
          },
        },
      },
    },
  } as const satisfies YextFieldMap;

  it.each([false, true])(
    "transforms wrapped fields when adapted=%s without mutating authored data",
    (adapted) => {
      const value = {
        label: { defaultValue: "Hello", es: "Hola [[name]]" },
        authored: { defaultValue: "Keep this binding" },
        rows: [
          {
            limit: undefined,
            label: { defaultValue: "Row", es: "Fila" },
          },
        ],
      };
      const original = structuredClone(value);
      const field = adapted ? toPuckFields(fields).value : fields.value;
      const result = createYextFieldTransforms({ name: "Store" }, "es")[
        field.type
      ]({
        field,
        value,
        componentId: "test",
        propName: "value",
        propPath: "value",
        isReadOnly: true,
      });
      expect(result).toEqual({
        label: "Hola Store",
        authored: value.authored,
        rows: [{ limit: undefined, label: "Fila" }],
      });
      expect(value).toEqual(original);
      expect(
        createYextFieldTransforms({}, "es")[field.type]({
          field,
          value: undefined,
          componentId: "test",
          propName: "value",
          propPath: "value",
          isReadOnly: true,
        })
      ).toBeUndefined();
    }
  );
});
