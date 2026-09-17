import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCATOR_RESULT_CARD_PROPS } from "./LocatorResultCard.tsx";
import { ResultCardPropsField } from "./Results.tsx";

vi.mock("../../hooks/useDocument.tsx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../hooks/useDocument.tsx")>()),
  useDocument: () => ({}),
}));

vi.mock(
  "../../internal/hooks/useMessageReceivers.ts",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../internal/hooks/useMessageReceivers.ts")
    >()),
    useTemplateMetadata: () => ({ locatorDisplayFields: {} }),
  })
);

vi.mock("../../utils/locatorEntityTypes.ts", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../utils/locatorEntityTypes.ts")
  >()),
  getLocatorEntityTypeSourceMap: () => ({ location: undefined }),
}));

vi.mock("../../fields/YextAutoField.tsx", () => ({
  YextAutoField: ({ field }: { field: any }) =>
    React.createElement("div", {
      "data-testid": "result-card-fields",
      "data-primary-text-color-visible": String(
        field.objectFields.primaryCTA.objectFields.textColor.visible
      ),
      "data-secondary-text-color-visible": String(
        field.objectFields.secondaryCTA.objectFields.textColor.visible
      ),
    }),
}));

describe("ResultCardPropsField", () => {
  it("shows CTA text color only for primary variants", () => {
    const { rerender } = render(
      React.createElement(ResultCardPropsField, {
        value: DEFAULT_LOCATOR_RESULT_CARD_PROPS,
        onChange: () => undefined,
      })
    );

    expect(
      screen
        .getByTestId("result-card-fields")
        .getAttribute("data-primary-text-color-visible")
    ).toBe("true");
    expect(
      screen
        .getByTestId("result-card-fields")
        .getAttribute("data-secondary-text-color-visible")
    ).toBe("false");

    rerender(
      React.createElement(ResultCardPropsField, {
        value: {
          ...DEFAULT_LOCATOR_RESULT_CARD_PROPS,
          primaryCTA: {
            ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.primaryCTA,
            variant: "link",
          },
          secondaryCTA: {
            ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.secondaryCTA,
            variant: "primary",
          },
        },
        onChange: () => undefined,
      })
    );

    expect(
      screen
        .getByTestId("result-card-fields")
        .getAttribute("data-primary-text-color-visible")
    ).toBe("false");
    expect(
      screen
        .getByTestId("result-card-fields")
        .getAttribute("data-secondary-text-color-visible")
    ).toBe("true");
  });
});
