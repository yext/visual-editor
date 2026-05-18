import { describe, expect, it, vi, beforeEach } from "vitest";
import { warnOnMultiValueLinkedEntityTraversal } from "./linkedEntityWarningUtils.ts";
import { toast } from "sonner";
import { type StreamFields } from "../types/entityFields.ts";

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
  },
}));

describe("linkedEntityWarningUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses field display names in the warning message", () => {
    const streamDocument = {
      c_linkedEntity: [
        {
          answer: "Answer",
        },
        {
          answer: "Another answer",
        },
      ],
    };
    const entityFields: StreamFields = {
      fields: [
        {
          name: "c_linkedEntity",
          displayName: "Linked Entity",
          definition: {
            name: "c_linkedEntity",
            typeRegistryId: "type.entity_reference",
            type: {
              documentType: "DOCUMENT_TYPE_ENTITY",
            },
          },
          children: {
            fields: [
              {
                name: "answer",
                displayName: "Answer",
                definition: {
                  name: "answer",
                  typeName: "type.string",
                  type: {},
                },
              },
            ],
          },
        },
      ],
      displayNames: {
        c_linkedEntity: "Linked Entity",
        "c_linkedEntity.answer": "Linked Entity > Answer",
      },
    };

    warnOnMultiValueLinkedEntityTraversal(
      streamDocument,
      "c_linkedEntity.answer",
      entityFields
    );

    expect(toast.warning).toHaveBeenCalledWith(
      "Linked Entity contains multiple linked entities. Using the first one for Linked Entity > Answer."
    );
  });
});
