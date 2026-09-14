import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DynamicConfigControls } from "./DynamicConfigControls.tsx";

const dispatch = vi.fn();
const getPuck = () => ({
  appState: {
    data: {
      root: {
        props: {
          _dynamicConfig: { components: {} },
        },
      },
    },
  },
  config: { components: {} },
  dispatch,
});

vi.mock("@puckeditor/core", async () => {
  const actual =
    await vi.importActual<typeof import("@puckeditor/core")>(
      "@puckeditor/core"
    );

  return {
    ...actual,
    useGetPuck: () => getPuck,
  };
});

describe("DynamicConfigControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pastes a valid dynamic config without normalizing it", async () => {
    const pastedDynamicConfig = {
      components: {
        TestHero: {
          label: "Test Hero",
          html: `<section><h1 data-puck-field-title='{ "type": "testEntityField" }'></h1></section>`,
          styles: ".test-hero {}",
          fields: {
            title: { type: "testEntityField", label: "Title" },
          },
          defaultProps: {
            title: {
              field: "",
              constantValue: "Pasted title",
              constantValueEnabled: true,
            },
          },
        },
      },
    };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: vi.fn(async () => JSON.stringify(pastedDynamicConfig)),
      },
    });

    render(<DynamicConfigControls localDev={true} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Paste Dynamic Config" })
    );

    await waitFor(() => expect(dispatch).toHaveBeenCalledOnce());
    expect(dispatch.mock.calls[0][0].data.root.props._dynamicConfig).toEqual(
      pastedDynamicConfig
    );
  });
});
