import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DynamicConfigControls } from "./DynamicConfigControls.tsx";

const dispatch = vi.fn();
let currentDynamicConfig: unknown = { components: {} };
const getPuck = () => ({
  appState: {
    data: {
      root: {
        props: {
          _dynamicConfig: currentDynamicConfig,
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
    currentDynamicConfig = { components: {} };
  });

  it("pastes a dynamic config without validating or normalizing it", async () => {
    const pastedDynamicConfig = {
      components: {
        TestHero: {
          label: "Test Hero",
          html: "<section>Unbound content</section>",
          styles: ".test-hero {}",
          fields: {},
          defaultProps: {},
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

  it("copies validation errors without changing the dynamic config", async () => {
    currentDynamicConfig = {
      components: {
        TestImage: {
          label: "Test Image",
          html: `<img data-puck-field-image='{ "type": "testImage" }'>`,
          styles: "",
          fields: { image: { type: "testImage", label: "Image" } },
          defaultProps: {
            image: {
              field: "",
              constantValueEnabled: true,
              constantValue: { url: "https://example.com/image.jpg" },
            },
          },
        },
      },
    };
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<DynamicConfigControls localDev={true} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Validate Dynamic Config" })
    );

    const validationError =
      "TestImage image HTML target must be a non-void element with a closing tag.";
    expect(screen.getByText(validationError)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Copy Validation Results" })
    );

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(validationError)
    );
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("reports when the dynamic config is valid", () => {
    render(<DynamicConfigControls localDev={true} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Validate Dynamic Config" })
    );

    expect(screen.getByText("Dynamic config is valid.")).toBeTruthy();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
