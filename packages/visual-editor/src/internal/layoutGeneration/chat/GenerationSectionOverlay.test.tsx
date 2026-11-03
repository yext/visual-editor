import type { Data } from "@puckeditor/core";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GenerationSectionOverlays } from "./GenerationSectionOverlay.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";

const empty: Data = { root: { props: {} }, content: [] };
const data: Data = {
  ...empty,
  content: [
    {
      type: "MainContent",
      props: {
        id: "main",
        content: [{ type: "Heading", props: { id: "heading", text: "Hello" } }],
      },
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("shows Building and Ready without selection, then removes the decoration", async () => {
  vi.useFakeTimers();
  const canvas = new LayoutGenerationChatCanvas();
  canvas.buildingSections(empty, data);
  render(
    <>
      <div data-puck-component="heading">Section content</div>
      <GenerationSectionOverlays canvas={canvas} />
    </>
  );
  await act(() => vi.advanceTimersByTimeAsync(32));
  expect(screen.getAllByRole("status")).toHaveLength(1);
  expect(screen.getByRole("status").textContent).toBe("Building section…");
  expect(screen.getByText("Section content")).toBeTruthy();
  act(() => canvas.readySections(empty, data));
  expect(screen.getByRole("status").textContent).toBe("Ready");
  await act(() => vi.advanceTimersByTimeAsync(2000));
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByText("Section content")).toBeTruthy();
});

it("removes an unfinished overlay when generation stops", () => {
  const canvas = new LayoutGenerationChatCanvas();
  canvas.buildingSections(empty, data);
  render(
    <>
      <div data-puck-component="heading">Section content</div>
      <GenerationSectionOverlays canvas={canvas} />
    </>
  );
  act(() => canvas.finish());
  expect(screen.queryByRole("status")).toBeNull();
});

it("does not mark another resolving section ready when one section is applied", () => {
  const canvas = new LayoutGenerationChatCanvas();
  const before: Data = {
    ...empty,
    content: [
      { type: "Heading", props: { id: "first", text: "Before" } },
      { type: "Heading", props: { id: "second", text: "Before" } },
    ],
  };
  const first: Data = {
    ...before,
    content: [
      { type: "Heading", props: { id: "first", text: "After" } },
      before.content[1],
    ],
  };
  const both: Data = {
    ...first,
    content: [
      first.content[0],
      { type: "Heading", props: { id: "second", text: "After" } },
    ],
  };
  canvas.buildingSections(before, both);
  canvas.readySections(before, first);
  expect(canvas.sectionStatus("first")).toBe("ready");
  expect(canvas.sectionStatus("second")).toBe("building");
});

it("keeps accepted creation sections ready when later chunks omit resolved props", () => {
  const canvas = new LayoutGenerationChatCanvas();
  canvas.attach({
    read: () => empty,
    resolve: async (candidate) => candidate,
    validate: () => {},
    commit: () => {},
  });
  canvas.begin();
  canvas.beginCreation();
  canvas.buildingSections(empty, data);
  canvas.readySections(empty, data);
  const resolved = structuredClone(data);
  resolved.content[0].props.content[0].props.resolvedValue = "Derived";
  const next = structuredClone(data);
  next.content[0].props.content.push({
    type: "Heading",
    props: { id: "next", text: "Next" },
  });
  canvas.buildingSections(resolved, next);
  expect(canvas.sectionStatus("heading")).toBe("ready");
  expect(canvas.sectionStatus("next")).toBe("building");
  canvas.finish();
});
