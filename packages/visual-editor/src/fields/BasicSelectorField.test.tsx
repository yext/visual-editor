import { CTA } from "../components/atoms/cta.tsx";
import type { ThemeColor } from "../utils/themeConfigOptions.ts";
import { getThemeColorCssValue } from "../utils/colors.ts";
import { buildThemeCss, themeVariable } from "../utils/dynamicTheme.ts";
import { Puck } from "@puckeditor/core";
import type { ThemeData } from "../types/themeData.ts";
import {
  Address,
  resolveAddressFields,
} from "../components/contentBlocks/Address.tsx";
import { ComprehensiveCTA } from "../components/helpers/ComprehensiveCTA.tsx";
import { defaultComprehensiveCTAValue } from "./styledFields/ComprehensiveCTAField.tsx";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { YextAutoField } from "./YextAutoField.tsx";
import { type BasicSelectorField } from "./BasicSelectorField.tsx";
import { resolveCanonicalSelectorGroups } from "../utils/selectorOptions.ts";
import { ThemeFieldsSidebar } from "../internal/puck/components/theme-editor-sidebars/ThemeFieldsSidebar.tsx";
import { migrateThemeData } from "../components/migrations/themeDataLabels.ts";
import { validateThemeData } from "../types/themeData.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { ThemeCollectionFieldOverride } from "./ThemeCollectionField.tsx";
import { Heading } from "../components/atoms/heading.tsx";
import { Body } from "../components/atoms/body.tsx";
import { Button } from "../components/atoms/button.tsx";
import { Background } from "../components/atoms/background.tsx";
import { SetThemeDataButton } from "../internal/puck/components/SetThemeDataButton.tsx";

const renderThemeSidebar = (themeData: ThemeData, onThemeChange = vi.fn()) => {
  const originalError = console.error;
  vi.spyOn(console, "error").mockImplementation((...args) => {
    if (!String(args[0]).includes("Could not parse CSS stylesheet")) {
      originalError(...args);
    }
  });
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const Sidebar = () => {
    const [theme, setTheme] = React.useState(themeData);
    return (
      <>
        <ThemeFieldsSidebar
          themeData={theme}
          onThemeChange={(next) => {
            onThemeChange(next);
            setTheme(next);
          }}
        />
        <button type="button" onClick={() => setTheme(themeData)}>
          Restore original theme
        </button>
      </>
    );
  };
  const view = render(
    <Puck
      config={{ components: {} }}
      data={{ content: [] }}
      overrides={{ fields: Sidebar }}
    >
      <Puck.Fields />
    </Puck>
  );
  // Puck's bootstrap visibility is restored by CSS layers, unsupported in JSDOM.
  view.container.querySelector<HTMLElement>(".Puck")!.style.visibility =
    "visible";
  return view;
};

describe("dynamic theme collection controls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it("autosaves valid edits and preserves them when changing Puck tabs", () => {
    const theme = migrateThemeData();
    theme.colors = theme.colors.slice(0, 1);
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    expect(onThemeChange).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Save theme changes" })
    ).toBeNull();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Colors",
      "Typography",
      "Actions",
      "Page",
    ]);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Paper" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Actions" }));
    expect(screen.getByLabelText("Presentation")).toBeDefined();
    expect(screen.queryByLabelText("Background color or gradient")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Font" }));
    const styleOptions = Array.from(
      (screen.getByLabelText("Font Style") as HTMLSelectElement).options
    ).map((option) => option.label);
    expect(styleOptions).toContain("Normal");
    expect(styleOptions.join(" ")).not.toContain('"key"');
    fireEvent.click(screen.getByRole("button", { name: "Desktop and mobile" }));
    expect(screen.getByLabelText("Mobile Font Size")).toBeDefined();
    fireEvent.click(screen.getByRole("tab", { name: "Page" }));
    expect(screen.getByLabelText("Content Max Width")).toBeDefined();
    fireEvent.click(screen.getByRole("tab", { name: "Colors" }));
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Paper"
    );
    expect(onThemeChange).toHaveBeenCalledTimes(1);
    expect(onThemeChange.mock.calls.at(-1)![0].colors[0]).toMatchObject({
      id: "main-white",
      label: "Paper",
    });
  });

  it("keeps typed whitespace when an automatic save is echoed through history", () => {
    const theme = migrateThemeData();
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Paper " },
    });
    expect(onThemeChange.mock.calls.at(-1)![0].colors[0].label).toBe("Paper");
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Paper "
    );
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Paper white" },
    });
    expect(onThemeChange.mock.calls.at(-1)![0].colors[0].label).toBe(
      "Paper white"
    );
    expect(onThemeChange).toHaveBeenCalledTimes(2);
  });

  it("restores external history without saving it again", () => {
    const theme = migrateThemeData();
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "White " },
    });
    expect(onThemeChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Paper" },
    });
    expect(onThemeChange).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
    expect(screen.getByRole("alert")).toBeDefined();
    fireEvent.click(
      screen.getByRole("button", { name: "Restore original theme" })
    );
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "White"
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onThemeChange).toHaveBeenCalledTimes(1);
  });

  it("keeps composed action and custom color controls available for every preset", () => {
    const visible: any = resolveAddressFields({
      props: { ...Address.defaultProps, id: "address" },
    } as any);
    expect(visible.styles.objectFields.actionId.visible).toBe(true);
    expect(visible.styles.objectFields.color.visible).toBe(true);
    expect(visible.styles.objectFields).not.toHaveProperty("ctaVariant");
    const hidden: any = resolveAddressFields({
      props: {
        ...Address.defaultProps,
        id: "address",
        styles: {
          ...Address.defaultProps?.styles,
          showGetDirectionsLink: false,
        },
      },
    } as any);
    expect(hidden.styles.objectFields.actionId.visible).toBe(false);
    expect(hidden.styles.objectFields.color.visible).toBe(false);
  });
  it("preserves local action overrides when the selected preset changes presentation", () => {
    const theme = migrateThemeData();
    const value = structuredClone(defaultComprehensiveCTAValue);
    value.data.actionType = "button";
    value.data.buttonText = { defaultValue: "Act" };
    value.data.ariaLabel = { defaultValue: "Act" };
    value.styles.actionId = "main-primary";
    value.styles.button!.fontSize = "23px";
    value.styles.button!.fontWeight = "500";
    const view = (actionId: string) => (
      <TemplatePropsContext.Provider
        value={{
          document: { locale: "en", __: { theme: JSON.stringify(theme) } },
        }}
      >
        <ComprehensiveCTA
          value={{ ...value, styles: { ...value.styles, actionId } }}
        />
      </TemplatePropsContext.Provider>
    );
    const { rerender } = render(view("main-primary"));
    expect(screen.getByRole("button", { name: "Act" }).style.fontSize).toBe(
      "23px"
    );
    rerender(view("main-link"));
    const action = screen.getByRole("button", { name: "Act" });
    expect(action.getAttribute("data-ve-action")).toBe("main-link");
    expect(action.style.fontSize).toBe("23px");
    expect(action.style.fontWeight).toBe("500");
    expect(action.style.fontFamily).toBe("");
    expect(value.styles.actionId).toBe("main-primary");
  });

  it("edits shared gradients through controls and saves a complete payload", () => {
    const theme = migrateThemeData();
    theme.colors = theme.colors.slice(0, 1);
    theme.typography = theme.typography.slice(0, 1);
    theme.actions = theme.actions.slice(0, 1);
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    fireEvent.click(
      screen.getByRole("button", { name: "Use gradient", hidden: true })
    );
    fireEvent.change(screen.getByLabelText("Angle"), {
      target: { value: "120" },
    });
    const saved = onThemeChange.mock.calls.at(-1)![0];
    expect(saved.colors[0].background).toBe(
      "linear-gradient(120deg, #FFFFFF, #00000000)"
    );
    expect(validateThemeData(saved).success).toBe(true);
  });

  it("validates direct JSON updates before passing them to history", () => {
    const theme = migrateThemeData();
    const onThemeChange = vi.fn();
    render(
      <SetThemeDataButton themeData={theme} onThemeChange={onThemeChange} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Set Theme Data" }));
    const incomplete: any = structuredClone(theme);
    delete incomplete.actions[0].active.fontWeight;
    fireEvent.change(screen.getByLabelText("Theme data"), {
      target: { value: JSON.stringify(incomplete) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply theme" }));
    expect(onThemeChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "actions.0.active.fontWeight"
    );
    theme.typography[0].label = "Renamed in JSON";
    fireEvent.change(screen.getByLabelText("Theme data"), {
      target: { value: JSON.stringify(theme) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply theme" }));
    expect(onThemeChange).toHaveBeenCalledWith(theme);
  });

  it("renames and reorders complete entries without changing their identifiers", () => {
    const theme = migrateThemeData();
    theme.typography = theme.typography.slice(0, 1);
    theme.actions = theme.actions.slice(0, 1);
    theme.colors = theme.colors.slice(0, 2);
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    fireEvent.click(screen.getByRole("button", { name: "Black" }));
    fireEvent.click(screen.getByRole("button", { name: "Move Black up" }));
    const name = screen.getAllByLabelText("Name")[0];
    fireEvent.change(name, { target: { value: "Midnight" } });
    const saved = onThemeChange.mock.calls.at(-1)![0];
    expect(saved.colors[0]).toMatchObject({
      id: "main-black",
      label: "Midnight",
    });
    expect(theme.colors[1].label).toBe("Black");
    expect(validateThemeData(saved).success).toBe(true);
  });

  it("initializes new entries, prevents deleting the last entry and rejects incomplete drafts", () => {
    const theme = migrateThemeData();
    theme.colors = theme.colors.slice(0, 1);
    theme.typography = theme.typography.slice(0, 1);
    theme.actions = theme.actions.slice(0, 1);
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    expect(
      screen
        .getAllByRole("button", { name: /^Delete / })
        .every((button) => (button as HTMLButtonElement).disabled)
    ).toBe(true);
    fireEvent.click(screen.getByRole("tab", { name: "Typography" }));
    fireEvent.click(screen.getByRole("button", { name: "Add typography" }));
    const saved = onThemeChange.mock.calls.at(-1)![0];
    expect(saved.typography).toHaveLength(2);
    expect(saved.typography[1].id).not.toBe(saved.typography[0].id);
    expect(validateThemeData(saved).success).toBe(true);
    onThemeChange.mockClear();
    fireEvent.click(screen.getByRole("tab", { name: "Colors" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "" },
    });
    expect(onThemeChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("colors.0.label");
    fireEvent.click(screen.getByRole("tab", { name: "Typography" }));
    fireEvent.click(screen.getByRole("tab", { name: "Colors" }));
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
    expect(onThemeChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Paper" },
    });
    expect(onThemeChange).toHaveBeenCalledTimes(1);
    expect(onThemeChange.mock.calls.at(-1)![0].colors[0].label).toBe("Paper");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("changes presentation while retaining action typography and complete states", () => {
    const theme = migrateThemeData();
    theme.colors = theme.colors.slice(0, 1);
    theme.typography = theme.typography.slice(0, 1);
    theme.actions = theme.actions.slice(0, 1);
    const onThemeChange = vi.fn();
    renderThemeSidebar(theme, onThemeChange);
    fireEvent.click(screen.getByRole("tab", { name: "Actions" }));
    fireEvent.change(screen.getByLabelText("Presentation"), {
      target: { value: JSON.stringify({ value: "link" }) },
    });
    const saved = onThemeChange.mock.calls.at(-1)![0];
    expect(saved.actions[0].presentation).toBe("link");
    expect(saved.actions[0]).not.toHaveProperty("padding");
    expect(saved.actions[0].default).not.toHaveProperty("borderColor");
    expect(saved.actions[0].fontFamily).toBe(theme.actions[0].fontFamily);
    expect(validateThemeData(saved).success).toBe(true);
  });

  it("keeps missing selector identifiers and exposes a warning", () => {
    const theme = migrateThemeData();
    const onChange = vi.fn();
    render(
      <TemplatePropsContext.Provider
        value={{ document: { __: { theme: JSON.stringify(theme) } } }}
      >
        <ThemeCollectionFieldOverride
          field={{
            type: "themeCollection",
            collection: "typography",
            label: "Typography",
          }}
          value="removed"
          onChange={onChange}
        />
      </TemplatePropsContext.Provider>
    );
    expect(screen.getByRole("combobox").textContent).toContain(
      "removed (unavailable)"
    );
    expect(screen.getByRole("status").textContent).toContain("first available");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders shared atoms with independent semantics, channel selection and local overrides", () => {
    const theme = migrateThemeData();
    theme.typography[0].id = "title";
    theme.actions[0].id = "purchase";
    const { container } = render(
      <TemplatePropsContext.Provider
        value={{ document: { __: { theme: JSON.stringify(theme) } } }}
      >
        <Background backgroundId="main-black">
          <Heading
            level={1}
            semanticLevelOverride={3}
            typographyId="title"
            fontSize="3xl"
            weight="500"
            color={{ colorId: "main-black", channel: "foreground" }}
          >
            Title
          </Heading>
          <Body typographyId="missing">Body</Body>
          <Button actionId="purchase" style={{ borderRadius: "12px" }}>
            Buy
          </Button>
        </Background>
      </TemplatePropsContext.Provider>
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.getAttribute("data-ve-typography")).toBe("title");
    expect(heading.style.fontSize).toBe("32px");
    expect(heading.style.fontWeight).toBe("500");
    expect(heading.style.color).toBe("rgb(255, 255, 255)");
    expect(screen.getByText("Body").getAttribute("data-ve-typography")).toBe(
      "title"
    );
    expect(
      screen.getByRole("button", { name: "Buy" }).getAttribute("data-ve-action")
    ).toBe("purchase");
    expect(screen.getByRole("button", { name: "Buy" }).style.borderRadius).toBe(
      "12px"
    );
    expect(
      container.querySelector('[data-ve-background="main-black"]')
    ).not.toBeNull();
  });
});

const renderField = (
  field: BasicSelectorField,
  value?: any
): {
  onChange: ReturnType<typeof vi.fn>;
} => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="test-field"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

describe("shared color override defaults", () => {
  const theme = migrateThemeData();
  theme.colors.push(
    {
      id: "paper",
      label: "Paper",
      background: "#FFF8F0",
      foreground: "#123456",
    },
    { id: "ink", label: "Ink", background: "#102030", foreground: "#ABCDEF" }
  );
  const paper: ThemeColor = { colorId: "paper", channel: "background" };
  const ink: ThemeColor = { colorId: "ink", channel: "background" };
  const ColorExample = ({
    background = paper,
    nestedBackground,
    initialColor,
    fieldType = "basicSelector",
    onChange,
  }: {
    background?: ThemeColor;
    nestedBackground?: ThemeColor;
    initialColor?: ThemeColor;
    fieldType?: "basicSelector" | "themeColor";
    onChange?: (value: ThemeColor | undefined) => void;
  }) => {
    const [color, setColor] = React.useState(initialColor);
    return (
      <TemplatePropsContext.Provider
        value={{ document: { __: { theme: JSON.stringify(theme) } } }}
      >
        <style>{buildThemeCss(theme)}</style>
        <YextAutoField
          field={{
            type: fieldType,
            options: "SITE_COLOR",
            label: "Text color",
          }}
          value={color}
          onChange={(next) => {
            setColor(next);
            onChange?.(next);
          }}
        />
        <output data-testid="saved-color">{JSON.stringify({ color })}</output>
        <Background background={background}>
          <Heading level={2} color={color}>
            Heading text
          </Heading>
          <Body color={color}>Body text</Body>
          <CTA
            actionId="main-primary"
            actionType="button"
            normalizeLink={false}
            label="Action"
            color={color}
          />
          {nestedBackground && (
            <Background background={nestedBackground}>
              <Body color={color}>Nested text</Body>
            </Background>
          )}
        </Background>
      </TemplatePropsContext.Provider>
    );
  };

  it.each(["basicSelector", "themeColor"] as const)(
    "displays Default for an unset %s without saving a color",
    (fieldType) => {
      const onChange = vi.fn();
      render(<ColorExample fieldType={fieldType} onChange={onChange} />);
      expect(screen.getByRole("combobox").textContent).toBe("Default");
      expect(screen.getByTestId("saved-color").textContent).toBe("{}");
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("combobox"));
      expect(screen.getAllByRole("option")[0].textContent).toContain("Default");
    }
  );

  it.each([
    { name: "shared background channel", color: paper },
    {
      name: "shared foreground channel",
      color: { colorId: "paper", channel: "foreground" } as ThemeColor,
    },
    {
      name: "custom color",
      color: {
        selectedColor: "[#FF000080]",
        contrastingColor: "black",
      } as ThemeColor,
    },
    {
      name: "missing reference",
      color: { colorId: "removed", channel: "foreground" } as ThemeColor,
    },
  ])(
    "clears a $name override to undefined and resumes background inheritance",
    ({ color }) => {
      const onChange = vi.fn();
      render(
        <ColorExample
          background={ink}
          initialColor={color}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByRole("combobox"));
      fireEvent.click(screen.getByRole("option", { name: "Default" }));
      expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
      expect(screen.getByTestId("saved-color").textContent).toBe("{}");
      expect(screen.getByRole("combobox").textContent).toBe("Default");
      expect(screen.getByText("Heading text").style.color).toBe("");
      expect(window.getComputedStyle(screen.getByText("Body text")).color).toBe(
        getThemeColorCssValue({ colorId: "ink", channel: "foreground" })
      );
      expect(screen.queryByText(/This color is unavailable/)).toBeNull();
      expect(screen.queryByRole("button", { name: "Custom color" })).toBeNull();
    }
  );

  it("updates default text with its surrounding shared background without saving a reference", () => {
    const { rerender } = render(<ColorExample background={paper} />);
    for (const text of ["Heading text", "Body text"]) {
      expect(window.getComputedStyle(screen.getByText(text)).color).toBe(
        getThemeColorCssValue({ colorId: "paper", channel: "foreground" })
      );
    }
    rerender(<ColorExample background={ink} />);
    for (const text of ["Heading text", "Body text"]) {
      expect(window.getComputedStyle(screen.getByText(text)).color).toBe(
        getThemeColorCssValue({ colorId: "ink", channel: "foreground" })
      );
    }
    expect(screen.getByRole("combobox").textContent).toBe("Default");
    expect(screen.getByTestId("saved-color").textContent).toBe("{}");
  });

  it("inherits the nearest nested background and preserves custom alpha background/foreground pairs", () => {
    const outer: ThemeColor = {
      selectedColor: "[#20304080]",
      contrastingColor: "[#00AA00]",
    };
    const inner: ThemeColor = {
      selectedColor: "[#60302080]",
      contrastingColor: "[rgba(255, 221, 0, 0.4)]",
    };
    const { rerender } = render(
      <ColorExample background={outer} nestedBackground={inner} />
    );
    expect(window.getComputedStyle(screen.getByText("Body text")).color).toBe(
      "rgb(0, 170, 0)"
    );
    expect(window.getComputedStyle(screen.getByText("Nested text")).color).toBe(
      "rgba(255, 221, 0, 0.4)"
    );
    rerender(<ColorExample background={ink} nestedBackground={inner} />);
    expect(window.getComputedStyle(screen.getByText("Body text")).color).toBe(
      getThemeColorCssValue({ colorId: "ink", channel: "foreground" })
    );
    expect(window.getComputedStyle(screen.getByText("Nested text")).color).toBe(
      "rgba(255, 221, 0, 0.4)"
    );
    rerender(<ColorExample background={ink} nestedBackground={paper} />);
    expect(window.getComputedStyle(screen.getByText("Nested text")).color).toBe(
      getThemeColorCssValue({ colorId: "paper", channel: "foreground" })
    );
    expect(screen.getByTestId("saved-color").textContent).toBe("{}");
  });

  it.each([
    {
      name: "shared background channel",
      color: paper,
      label: "Paper — background",
    },
    {
      name: "shared foreground channel",
      color: {
        channel: "foreground",
        colorId: "paper",
        contrastingColor: "[#FFFFFF]",
      } as ThemeColor,
      label: "Paper — foreground",
    },
    {
      name: "custom alpha color",
      color: {
        selectedColor: "[#00AA7780]",
        contrastingColor: "black",
      } as ThemeColor,
      label: "Custom color",
    },
  ])(
    "keeps an explicit $name unchanged when backgrounds change",
    ({ color, label }) => {
      const onChange = vi.fn();
      const { rerender } = render(
        <ColorExample
          background={paper}
          initialColor={color}
          onChange={onChange}
        />
      );
      const renderedColor = window.getComputedStyle(
        screen.getByText("Heading text")
      ).color;
      expect(screen.getByText("Heading text").style.color).not.toBe("");
      expect(screen.getByRole("combobox").textContent).toBe(label);
      rerender(
        <ColorExample
          background={ink}
          initialColor={color}
          onChange={onChange}
        />
      );
      expect(
        window.getComputedStyle(screen.getByText("Heading text")).color
      ).toBe(renderedColor);
      expect(screen.getByRole("combobox").textContent).toBe(label);
      expect(
        JSON.parse(screen.getByTestId("saved-color").textContent!)
      ).toEqual({ color });
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it("retains explicit channel choices and missing-reference warnings", () => {
    const onChange = vi.fn();
    const { rerender } = render(<ColorExample onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      screen.getByRole("option", { name: /^Paper — foreground/ })
    );
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      colorId: "paper",
      channel: "foreground",
    });
    expect(screen.getByRole("combobox").textContent).toBe("Paper — foreground");
    rerender(
      <ColorExample
        key="missing"
        initialColor={{ colorId: "removed", channel: "background" }}
      />
    );
    expect(screen.getByRole("combobox").textContent).toBe(
      "removed (unavailable)"
    );
    expect(screen.getByText(/This color is unavailable/).textContent).toContain(
      "first compatible color"
    );
  });

  it("leaves CTA defaults tied to the action preset when clearing the generic color control", () => {
    const { rerender } = render(
      <ColorExample background={ink} initialColor={paper} />
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Default" }));
    const action = screen.getByRole("button", { name: "Action" });
    const presetColor = `var(${themeVariable("actions", "main-primary", "surface-default-textColor")})`;
    expect(action.getAttribute("data-ve-action")).toBe("main-primary");
    expect(action.style.color).toBe("");
    expect(action.style.background).toBe("");
    expect(action.style.borderColor).toBe("");
    expect(window.getComputedStyle(action).color).toBe(presetColor);
    rerender(<ColorExample background={paper} initialColor={paper} />);
    expect(
      window.getComputedStyle(screen.getByRole("button", { name: "Action" }))
        .color
    ).toBe(presetColor);
    expect(screen.getByRole("combobox").textContent).toBe("Default");
  });
});

describe("BasicSelectorField", () => {
  it("renders static options and returns the raw selected value", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Size",
      options: [
        { label: "Small", value: "small" },
        { label: "Large", value: "large" },
      ],
      translateOptions: false,
    };

    const { onChange } = renderField(field, "small");

    expect(screen.getByRole("combobox").textContent).toContain("Small");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Large"));

    expect(onChange).toHaveBeenCalledWith("large");
  });

  it("re-evaluates function-valued options on re-render", () => {
    const onChange = vi.fn();

    const DynamicField = () => {
      const [showAlternateOptions, setShowAlternateOptions] =
        React.useState(false);

      const field: BasicSelectorField = {
        type: "basicSelector",
        label: "Field",
        options: () =>
          showAlternateOptions
            ? [{ label: "Beta", value: "beta" }]
            : [{ label: "Alpha", value: "alpha" }],
        translateOptions: false,
      };

      return (
        <>
          <button onClick={() => setShowAlternateOptions(true)} type="button">
            Toggle
          </button>
          <YextAutoField
            field={field}
            id="dynamic-field"
            onChange={onChange}
            value="alpha"
          />
        </>
      );
    };

    render(<DynamicField />);

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByText("Toggle"));

    expect(screen.getByRole("combobox").textContent).toContain("Beta");
  });

  it("does not crash when the number of options changes between renders", () => {
    const onChange = vi.fn();

    const DynamicField = () => {
      const [showExtraOption, setShowExtraOption] = React.useState(false);

      const field: BasicSelectorField = {
        type: "basicSelector",
        label: "Field",
        options: () =>
          showExtraOption
            ? [
                { label: "Alpha", value: "alpha" },
                { label: "Beta", value: "beta" },
              ]
            : [{ label: "Alpha", value: "alpha" }],
        translateOptions: false,
      };

      return (
        <>
          <button onClick={() => setShowExtraOption(true)} type="button">
            Add option
          </button>
          <YextAutoField
            field={field}
            id="dynamic-field-with-extra-option"
            onChange={onChange}
            value="alpha"
          />
        </>
      );
    };

    render(<DynamicField />);

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByText("Add option"));

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("resolves ThemeOptions keys passed to basicSelector", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Heading Level",
      options: "HEADING_LEVEL",
    };

    const { onChange } = renderField(field, 1);

    expect(screen.getByRole("combobox").textContent).toContain("H1");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("H2"));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it.each([
    ["BACKGROUND_COLOR", "White"],
    ["SITE_COLOR", "White — background"],
  ] as const)(
    "renders %s grouped options with search",
    (optionKey, expectedHeading) => {
      const field: BasicSelectorField = {
        type: "basicSelector",
        label: "Color",
        options: optionKey,
      };

      renderField(field);

      fireEvent.click(screen.getByRole("combobox"));

      expect(screen.getByPlaceholderText("Search")).toBeDefined();
      expect(screen.getAllByText(expectedHeading).length).toBeGreaterThan(0);
    }
  );

  it("renders expanded canonical groups and preserves their descriptions", () => {
    const { onChange } = renderField(
      {
        type: "basicSelector",
        optionGroups: [
          ...resolveCanonicalSelectorGroups("MAX_WIDTH").map((group) => ({
            ...group,
            title: "Widths",
            description: "Match the page grid.",
          })),
          { title: "Other", options: [{ label: "Custom", value: "custom" }] },
        ],
      },
      "theme"
    );
    expect(screen.getByRole("combobox").textContent).toContain(
      "Match Other Sections"
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Match the page grid.")).toBeDefined();
    expect(screen.getByText("Widths")).toBeDefined();
    expect(screen.getByText("Custom")).toBeDefined();
    fireEvent.click(screen.getByText("Full Width"));
    expect(onChange).toHaveBeenCalledWith("fullWidth");
  });

  it("renders the empty state for function-valued options with no results", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Field",
      options: () => [],
      translateOptions: false,
      noOptionsPlaceholder: "No fields available",
      noOptionsMessage: "Check your configuration.",
    };

    renderField(field);

    expect(
      screen
        .getByRole("button", { name: "No fields available" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(screen.getByText("Check your configuration.")).toBeDefined();
  });

  it("warns when a basicSelector receives an invalid ThemeOptions key", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Field",
      options: "NOT_A_THEME_OPTION" as any,
    };

    renderField(field);

    expect(
      screen
        .getByRole("button", { name: "No options available" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(consoleWarn).toHaveBeenCalledWith(
      'Invalid ThemeOptions key "NOT_A_THEME_OPTION" passed to basicSelector.'
    );

    consoleWarn.mockRestore();
  });

  it("when an existing color selector chooses Other then it keeps authoring a ThemeColor", () => {
    const { onChange } = renderField({
      type: "basicSelector",
      options: "SITE_COLOR",
    });

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Custom color"));

    expect(onChange).toHaveBeenCalledWith({
      selectedColor: "[#000000]",
      contrastingColor: "#FFFFFF",
    });
  });
});
