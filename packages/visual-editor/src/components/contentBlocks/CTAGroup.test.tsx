import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let currentButton: Record<string, unknown>;

const puckState = {
  appState: {
    ui: {
      itemSelector: { index: 0, zone: "root" },
    },
  },
  getItemBySelector: (): { props: { buttons: Record<string, unknown>[] } } => ({
    props: { buttons: [currentButton] },
  }),
};

vi.mock("@puckeditor/core", async () => {
  const actual =
    await vi.importActual<typeof import("@puckeditor/core")>(
      "@puckeditor/core"
    );

  return {
    ...actual,
    createUsePuck: () => (selector: (state: typeof puckState) => unknown) =>
      selector(puckState),
  };
});

import { CTAGroup } from "./CTAGroup.tsx";

const textColorField = (CTAGroup.fields as any).buttons.arrayFields.textColor;

const renderTextColorField = (): void => {
  render(
    textColorField.render({
      field: textColorField,
      id: "text-color",
      name: "buttons[0].textColor",
      onChange: vi.fn(),
      value: undefined,
    })
  );
};

describe("CTAGroup text color field", () => {
  afterEach(() => {
    currentButton = {};
  });

  it.each([
    { variant: "primary", ctaType: "textAndLink", visible: true },
    { variant: "secondary", ctaType: "textAndLink", visible: false },
    { variant: "link", ctaType: "textAndLink", visible: false },
    { variant: "primary", ctaType: "presetImage", visible: false },
  ])(
    "when the variant is $variant and CTA type is $ctaType, visible is $visible",
    ({ variant, ctaType, visible }) => {
      currentButton = {
        variant,
        entityField: {
          constantValueEnabled: true,
          constantValue: { ctaType },
        },
      };

      renderTextColorField();

      expect(
        screen.queryByRole("combobox", { name: "Text Color" }) !== null
      ).toBe(visible);
    }
  );
});
