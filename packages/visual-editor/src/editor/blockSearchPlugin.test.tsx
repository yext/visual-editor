import React from "react";
import { Puck, useGetPuck, type Config } from "@puckeditor/core";
import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { blockSearchPlugin } from "./blockSearchPlugin.tsx";
import { msg } from "../utils/i18n/platform.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityTooltipsProvider, useEntityTooltips } from "./EntityField.tsx";

beforeEach(() =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }))
  )
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.head
    .querySelectorAll("[data-test-preview-style]")
    .forEach((node) => node.remove());
});
const config: Config = {
  components: {
    Heading: {
      label: msg("test.heading", "Heading"),
      render: () => <h2>Heading</h2>,
    },
    Paragraph: { label: "Paragraph", render: () => <p>Paragraph</p> },
    HoursTable: { label: "Hours", render: () => <div /> },
    Cafe: { label: "Café", render: () => <div /> },
    Helper: { label: "Hidden helper", render: () => <div /> },
    Unlisted: { label: "Unlisted", render: () => <div /> },
  },
  categories: {
    content: { title: "Content", components: ["Heading", "Paragraph", "Cafe"] },
    yext: { title: "Yext Data", components: ["HoursTable"] },
    hidden: { visible: false, components: ["Helper"] },
  },
};
const testDocument = { locale: "en", name: "Preview entity" };
function mount(puckConfig = config) {
  let getPuck!: ReturnType<typeof useGetPuck>;
  function Capture() {
    getPuck = useGetPuck();
    return <></>;
  }
  const view = render(
    <TemplatePropsContext.Provider value={{ document: testDocument }}>
      <EntityTooltipsProvider>
        <Puck
          config={puckConfig}
          data={{ root: { props: {} }, content: [] }}
          iframe={{ enabled: false }}
          plugins={[blockSearchPlugin]}
          overrides={{ header: Capture }}
        />
      </EntityTooltipsProvider>
    </TemplatePropsContext.Provider>
  );
  // jsdom cannot parse Puck's layered runtime stylesheet, which normally
  // makes the mounted layout visible over the root's initial hidden style.
  (view.container.querySelector(".Puck") as HTMLElement).style.visibility =
    "visible";
  return {
    ...view,
    getPuck: () => getPuck(),
    search: screen.getByRole("searchbox", { name: "Search blocks" }),
  };
}
const visibleNames = () =>
  Array.from(document.querySelectorAll('[data-testid^="drawer-item:"]')).map(
    (node) => node.getAttribute("data-testid")
  );

it.each([
  ["heading", ["drawer-item:Heading"]],
  ["HOURS table", ["drawer-item:HoursTable"]],
  ["Yext Data", ["drawer-item:HoursTable"]],
  ["content para", ["drawer-item:Paragraph"]],
  ["cafe", ["drawer-item:Cafe"]],
])(
  "finds blocks by translated names, component names, and categories: %s",
  (query, expected) => {
    const { search } = mount();
    fireEvent.change(search, { target: { value: query } });
    expect(visibleNames()).toEqual(expected);
  }
);

it("excludes hidden helpers and empty categories and shows a clear empty result", () => {
  const { search } = mount();
  expect(visibleNames()).not.toContain("drawer-item:Helper");
  fireEvent.change(search, { target: { value: "Hidden helper" } });
  expect(visibleNames()).toEqual([]);
  expect(screen.getByRole("status").textContent).toBe("No matches found.");
  expect(screen.queryByRole("heading", { name: "Content" })).toBeNull();
});

it("reveals collapsed matches, restores collapsed groups on clear, and leaves history and data alone", () => {
  const { search, getPuck } = mount();
  const before = getPuck().appState.data;
  const history = getPuck().history.histories;
  fireEvent.click(screen.getByRole("button", { name: "Content" }));
  expect(
    screen
      .getByRole("button", { name: "Content" })
      .getAttribute("aria-expanded")
  ).toBe("false");
  fireEvent.change(search, { target: { value: "Heading" } });
  expect(screen.getByRole("heading", { name: "Content" })).toBeTruthy();
  expect(
    screen.getByTestId("drawer-item:Heading").closest("[hidden]")
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(document.activeElement).toBe(search);
  expect(
    screen
      .getByRole("button", { name: "Content" })
      .getAttribute("aria-expanded")
  ).toBe("false");
  fireEvent.change(search, { target: { value: "Hours" } });
  fireEvent.keyDown(search, { key: "Escape" });
  expect((search as HTMLInputElement).value).toBe("");
  expect(getPuck().appState.data).toBe(before);
  expect(getPuck().history.histories).toBe(history);
});

it("supports uncategorized configs and honors a hidden Other category", () => {
  const { search, unmount } = mount({ ...config, categories: undefined });
  fireEvent.change(search, { target: { value: "Unlisted" } });
  expect(visibleNames()).toEqual(["drawer-item:Unlisted"]);
  unmount();
  mount({
    ...config,
    categories: { ...config.categories, other: { visible: false } },
  });
  expect(visibleNames()).not.toContain("drawer-item:Unlisted");
  expect(visibleNames()).not.toContain("drawer-item:Helper");
});

it("preserves disabled insertion permissions in filtered results", async () => {
  const { search } = mount({
    ...config,
    components: {
      ...config.components,
      Heading: { ...config.components.Heading, permissions: { insert: false } },
    },
  });
  fireEvent.change(search, { target: { value: "Heading" } });
  await waitFor(() =>
    expect(screen.getByTestId("drawer-item:Heading").className).toContain(
      "disabled"
    )
  );
});

it("pre-renders before opening, keeps the last frame ready, and dismisses without editing", async () => {
  const resolveData = vi.fn((data) => data);
  const local = {
    ...config,
    components: {
      ...config.components,
      Heading: { ...config.components.Heading, resolveData },
    },
  };
  const { getPuck } = mount(local);
  const before = structuredClone(getPuck().appState.data);
  const item = screen.getByRole("group", { name: "Heading" });
  fireEvent.pointerEnter(item);
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.pointerLeave(item);
  await act(async () => new Promise((resolve) => setTimeout(resolve, 280)));
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.pointerEnter(item);
  const frame = await screen.findByTitle("Heading: Preview");
  await waitFor(() => expect(resolveData).toHaveBeenCalledTimes(1));
  fireEvent.load(frame);
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip.textContent).not.toContain("Loading preview");
  fireEvent.pointerLeave(item);
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.focus(item);
  expect(await screen.findByRole("tooltip")).toBeTruthy();
  expect(resolveData).toHaveBeenCalledTimes(1);
  expect(screen.getByTitle("Heading: Preview")).toBe(frame);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(getPuck().appState.data).toEqual(before);
  expect(getPuck().history.hasPast).toBe(false);
});

it("closes previews on pointer down so dragging remains available", async () => {
  mount();
  const item = screen.getByRole("group", { name: "Heading" });
  fireEvent.pointerEnter(item);
  fireEvent.load(await screen.findByTitle("Heading: Preview"));
  expect(await screen.findByRole("tooltip")).toBeTruthy();
  fireEvent.pointerDown(item);
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(screen.getByTestId("drawer-item:Heading")).toBeTruthy();
});

it("contains failed preview resolution and keeps the editor usable", async () => {
  mount({
    ...config,
    components: {
      ...config.components,
      Heading: {
        ...config.components.Heading,
        resolveData: async () => {
          throw new Error("Preview-only failure");
        },
      },
    },
  });
  fireEvent.pointerEnter(screen.getByRole("group", { name: "Heading" }));
  expect(
    await screen.findByText("Preview unavailable for this block.")
  ).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByRole("searchbox", { name: "Search blocks" })).toBeTruthy();
});

it("renders published content without inheriting the editor's mapping overlays", async () => {
  function Heading() {
    const editingTooltips = useEntityTooltips();
    return <h2>{editingTooltips ? "Editor overlays" : "Published content"}</h2>;
  }
  mount({
    ...config,
    components: {
      ...config.components,
      Heading: { ...config.components.Heading, render: Heading },
    },
  });
  fireEvent.pointerEnter(screen.getByRole("group", { name: "Heading" }));
  const frame = (await screen.findByTitle(
    "Heading: Preview"
  )) as HTMLIFrameElement;
  fireEvent.load(frame);
  await waitFor(() =>
    expect(frame.contentDocument?.body.textContent).toContain(
      "Published content"
    )
  );
  expect(frame.contentDocument?.body.textContent).not.toContain(
    "Editor overlays"
  );
});

it("keeps slow resolutions hidden and ignores completion after the pointer leaves", async () => {
  let finish!: () => void;
  const resolveData = vi.fn(async (data) => {
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    return data;
  });
  mount({
    ...config,
    components: {
      ...config.components,
      Heading: { ...config.components.Heading, resolveData },
    },
  });
  const item = screen.getByRole("group", { name: "Heading" });
  fireEvent.pointerEnter(item);
  await waitFor(() => expect(resolveData).toHaveBeenCalledTimes(1));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 280)));
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.pointerLeave(item);
  await act(async () => finish());
  const frame = await screen.findByTitle("Heading: Preview");
  fireEvent.load(frame);
  await act(async () => new Promise((resolve) => setTimeout(resolve, 280)));
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.focus(item);
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip.textContent).not.toContain("Loading preview");
});

it("waits for preview styles before revealing the tooltip", async () => {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/slow-preview.css";
  stylesheet.dataset.testPreviewStyle = "true";
  document.head.append(stylesheet);
  mount();
  fireEvent.pointerEnter(screen.getByRole("group", { name: "Heading" }));
  const frame = (await screen.findByTitle(
    "Heading: Preview"
  )) as HTMLIFrameElement;
  fireEvent.load(frame);
  await waitFor(() =>
    expect(frame.contentDocument?.head.querySelector("link")).toBeTruthy()
  );
  await act(async () => new Promise((resolve) => setTimeout(resolve, 280)));
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.load(frame.contentDocument!.head.querySelector("link")!);
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip.textContent).not.toContain("Loading preview");
});
