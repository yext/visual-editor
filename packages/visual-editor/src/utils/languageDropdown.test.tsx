import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { LanguageDropdown } from "../components/helpers/languageDropdown.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { fetchLocalesToPathsForEntity } from "./api/fetchLocalesToPathsForEntity.ts";

vi.mock("./api/fetchLocalesToPathsForEntity.ts", () => ({
  fetchLocalesToPathsForEntity: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const props = {
  businessId: "business",
  entityId: "entity",
  apiKey: "test",
  contentEndpointId: "endpoint",
  contentDeliveryAPIDomain: "example.test",
  locales: ["en", "fr"],
  currentLocale: "en",
};
const dropdown = (locale = "en") => (
  <TemplatePropsContext.Provider value={{ document: {} }}>
    <div className="ve-theme-primary">
      <LanguageDropdown {...props} currentLocale={locale} />
    </div>
  </TemplatePropsContext.Provider>
);

describe("semantic language dropdown", () => {
  it("retains localized labels, lazy loading, locale filtering, and accessible mobile menu state", async () => {
    vi.mocked(fetchLocalesToPathsForEntity).mockResolvedValue({
      en: "en/location",
      fr: "fr/location",
      es: "es/location",
    });
    const { container, rerender } = render(dropdown());
    expect(fetchLocalesToPathsForEntity).not.toHaveBeenCalled();
    // The mobile accordion trigger is distinct from the desktop Radix menu.
    const mobileTrigger = container.querySelector(
      'button[data-orientation="vertical"]'
    )!;
    expect(mobileTrigger.className).toContain("ve-theme-navigation-link");
    fireEvent.click(mobileTrigger);
    await waitFor(() => expect(container.textContent).toContain("Français"));
    expect(mobileTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).not.toContain("Español");
    expect(container.querySelector('[role="region"]')?.className).toContain(
      "ve-theme-page"
    );
    const selected = container.querySelector('button[aria-current="true"]')!;
    expect(selected.textContent).toBe("English");
    expect(selected.className).toContain("ve-theme-navigation-link");
    fireEvent.click(selected);
    expect(fetchLocalesToPathsForEntity).toHaveBeenCalledTimes(1);
    fireEvent.click(mobileTrigger);
    fireEvent.click(mobileTrigger);
    expect(fetchLocalesToPathsForEntity).toHaveBeenCalledTimes(1);
    rerender(dropdown("fr"));
    expect(mobileTrigger.textContent).toContain("Français");
  });

  it("retains keyboard opening and dismissal with a themed portalled desktop menu", async () => {
    vi.mocked(fetchLocalesToPathsForEntity).mockResolvedValue({
      en: "en/location",
      fr: "fr/location",
    });
    const { container } = render(dropdown());
    const trigger = container.querySelector('button[aria-haspopup="menu"]')!;
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await waitFor(() =>
      expect(
        document.querySelector('[role="menuitem"][aria-current="true"]')
      ).toBeTruthy()
    );
    const menu = document.querySelector('[role="menu"]')!;
    expect(menu.className).toContain("ve-theme-page");
    expect(menu.textContent).toContain("Français");
    expect(document.querySelector('[role="menuitem"]')!.className).toContain(
      "ve-theme-navigation-link"
    );
    fireEvent.keyDown(menu, { key: "Escape" });
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("false")
    );
  });

  it("keeps the current locale available when locale loading fails", async () => {
    vi.mocked(fetchLocalesToPathsForEntity).mockRejectedValue(
      new Error("Unavailable")
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(dropdown());
    fireEvent.click(
      container.querySelector('button[data-orientation="vertical"]')!
    );
    await waitFor(() =>
      expect(
        container.querySelector('button[aria-current="true"]')
      ).toBeTruthy()
    );
    expect(
      container.querySelector('button[aria-current="true"]')!.textContent
    ).toBe("English");
    log.mockRestore();
  });
});
