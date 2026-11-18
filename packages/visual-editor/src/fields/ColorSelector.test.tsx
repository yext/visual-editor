import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_STYLE_TAG_ID } from "../utils/applyTheme.ts";
import { InternalThemeEditor } from "../internal/components/InternalThemeEditor.tsx";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import type { ThemeHistories } from "../internal/types/themeData.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { ColorPickerInput } from "./ColorSelector.tsx";
import { ThemeFieldControl } from "../internal/puck/components/theme-editor-sidebars/ThemeFieldsSidebar.tsx";
import { ThemeColorFieldOverride } from "./ThemeColorField.tsx";

vi.mock("react-color", () => ({
  SketchPicker: ({ color, onChange, onChangeComplete, disableAlpha }: any) => (
    <button
      type="button"
      data-testid="picker"
      data-color={color}
      data-disable-alpha={String(!!disableAlpha)}
      onClick={() => {
        const result = {
          hex: "#123456",
          rgb: { r: 18, g: 52, b: 86, a: 0.5 },
        };
        onChange(result);
        onChangeComplete(result);
      }}
    >
      Pick translucent color
    </button>
  ),
}));

afterEach(cleanup);

describe("ColorPickerInput", () => {
  it("saves alpha and keeps solid-only controls free of gradient options", () => {
    const onChange = vi.fn();
    render(
      <ColorPickerInput
        ariaLabel="Open picker"
        value="#000000"
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Open picker" }));
    expect(screen.getByTestId("picker").dataset.disableAlpha).toBe("false");
    expect(screen.queryByRole("combobox")).toBeNull();
    fireEvent.click(screen.getByTestId("picker"));
    expect(onChange).toHaveBeenLastCalledWith("#12345680");
  });

  it("edits both gradient stops, direction and type, and restores saved values", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ColorPickerInput
        ariaLabel="Open picker"
        value="#000000"
        allowGradient
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Open picker" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), {
      target: { value: "linear" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      "linear-gradient(90deg, #000000 0%, #FFFFFF 100%)"
    );
    fireEvent.click(screen.getByTestId("picker"));
    fireEvent.click(screen.getByRole("button", { name: "End color" }));
    fireEvent.click(screen.getByTestId("picker"));
    expect(onChange).toHaveBeenLastCalledWith(
      "linear-gradient(90deg, #12345680 0%, #12345680 100%)"
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Angle" }), {
      target: { value: "45" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      "linear-gradient(45deg, #12345680 0%, #12345680 100%)"
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), {
      target: { value: "radial" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      "radial-gradient(circle, #12345680 0%, #12345680 100%)"
    );
    rerender(
      <ColorPickerInput
        ariaLabel="Open picker"
        value="linear-gradient(180deg, #ABCDEF80 0%, #FFFFFF 100%)"
        allowGradient
        onChange={onChange}
      />
    );
    expect(
      (screen.getByRole("spinbutton", { name: "Angle" }) as HTMLInputElement)
        .value
    ).toBe("180");
    expect(screen.getByTestId("picker").dataset.color).toBe("#FFFFFF");
    fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), {
      target: { value: "solid" },
    });
    expect(onChange).toHaveBeenLastCalledWith("#FFFFFF");
  });

  it("retains a saved custom color's opacity when reopening its theme field", () => {
    const onChange = vi.fn();
    render(
      <ThemeColorFieldOverride
        field={{ type: "themeColor", options: "BACKGROUND_COLOR" }}
        value={{ selectedColor: "[#12345680]", contrastingColor: "black" }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Open color picker" }));
    expect(screen.getByTestId("picker").dataset.color).toBe("#12345680");
    fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), {
      target: { value: "radial" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedColor: "[radial-gradient(circle, #12345680 0%, #FFFFFF 100%)]",
      })
    );
  });
});

it.each([
  ["--ve-color-background", true],
  ["--ve-color-primary", true],
  ["--ve-primary-button-hover-background-color", true],
  ["--ve-color-primary-foreground", false],
  ["--ve-color-border", false],
])(
  "offers gradients only for background theme controls: %s",
  (variable, gradients) => {
    render(
      <ThemeFieldControl
        fieldKey="testColor"
        field={{
          type: "color",
          label: "Test color",
          variable: variable as `--${string}`,
          default: "#000000",
        }}
        values={{}}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Test color" }));
    expect(!!screen.queryByRole("combobox", { name: "Fill" })).toBe(gradients);
  }
);

it("keeps the picker open through full editor history updates", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const config = {
    components: {},
    root: { fields: { title: { type: "text" as const } } },
  };
  const metadata = { ...generateTemplateMetadata(), isThemeMode: true };
  const Harness = () => {
    const [histories, setHistories] = React.useState<ThemeHistories>({
      histories: [{ id: "initial", data: {} }],
      index: 0,
    });
    return (
      <TemplatePropsContext.Provider value={{ document: {} } as any}>
        <output data-testid="history-index">{histories.index}</output>
        <InternalThemeEditor
          puckConfig={config}
          puckInitialHistory={undefined}
          isLoading={false}
          templateMetadata={metadata}
          publishTheme={vi.fn()}
          saveThemeSaveState={vi.fn()}
          themeHistories={histories}
          setThemeHistories={setHistories}
          clearThemeHistory={vi.fn()}
          sendDevThemeSaveStateData={vi.fn()}
          buildThemeLocalStorageKey={() => "picker-mount-test"}
          localDev
        />
      </TemplatePropsContext.Provider>
    );
  };
  const originalError = console.error;
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation((...args) => {
      if (!String(args[0]).includes("Could not parse CSS stylesheet")) {
        originalError(...args);
      }
    });
  try {
    const { container } = render(<Harness />);
    (container.querySelector(".Puck") as HTMLElement).style.visibility =
      "visible";
    fireEvent.click(
      (
        await screen.findAllByRole("button", { name: "Page", expanded: false })
      )[0]
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Background" })[0]);
    const picker = screen.getByTestId("picker");
    fireEvent.click(picker);
    expect(screen.getByTestId("history-index").textContent).toBe("1");
    expect(screen.getByTestId("picker")).toBe(picker);
    fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), {
      target: { value: "linear" },
    });
    expect(screen.getByTestId("picker")).toBe(picker);
    fireEvent.click(screen.getByRole("button", { name: "End color" }));
    fireEvent.click(picker);
    expect(
      screen
        .getByRole("button", { name: "End color" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Angle" }), {
      target: { value: "45" },
    });
    expect(screen.getByTestId("picker")).toBe(picker);
    expect(
      (screen.getByRole("spinbutton", { name: "Angle" }) as HTMLInputElement)
        .value
    ).toBe("45");
    fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), {
      target: { value: "radial" },
    });
    expect(screen.getByTestId("picker")).toBe(picker);
    expect(screen.getByTestId("history-index").textContent).toBe("5");
  } finally {
    cleanup();
    document.getElementById(THEME_STYLE_TAG_ID)?.remove();
    window.localStorage.removeItem("picker-mount-test");
    consoleError.mockRestore();
    vi.unstubAllGlobals();
  }
});
