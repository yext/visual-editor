import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const puckState = {
  appState: {
    ui: {
      itemSelector: { index: 0, zone: "root" },
    },
  },
  getItemBySelector: () => ({
    props: {
      data: {
        field: "c_eventsSection.events",
        constantValueEnabled: false,
      },
    },
  }),
};

vi.mock("@puckeditor/core", () => ({
  createUsePuck: () => (selector: (state: typeof puckState) => unknown) =>
    selector(puckState),
}));

import { useCurrentSourceField } from "./useCurrentSourceField.tsx";

const CurrentSourceField = ({
  sourceFieldPath,
}: {
  sourceFieldPath: string;
}) => <div>{useCurrentSourceField(sourceFieldPath)}</div>;

describe("useCurrentSourceField", () => {
  it("updates when the selected component source field changes", () => {
    const { rerender } = render(<CurrentSourceField sourceFieldPath="data" />);

    expect(screen.getByText("c_eventsSection.events")).toBeDefined();

    puckState.getItemBySelector = () => ({
      props: {
        data: {
          field: "c_faqSection.faqs",
          constantValueEnabled: false,
        },
      },
    });

    rerender(<CurrentSourceField sourceFieldPath="data" />);

    expect(screen.getByText("c_faqSection.faqs")).toBeDefined();
  });
});
