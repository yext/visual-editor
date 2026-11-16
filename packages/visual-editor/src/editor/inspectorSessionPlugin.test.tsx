import React from "react";
import { Puck, useGetPuck, type Config, type Data } from "@puckeditor/core";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { inspectorSessionPlugin } from "./inspectorSessionPlugin.tsx";

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
});
const Inspector = inspectorSessionPlugin.overrides!.puck!;
const config: Config = {
  components: {
    Box: {
      fields: { content: { type: "slot" } },
      render: ({ content: Content }) => <Content />,
    },
    Heading: {
      fields: { size: { type: "text" } },
      render: ({ size }) => <h2 style={{ fontSize: size }}>Heading</h2>,
    },
  },
};
const data = (size: string): Data => ({
  root: { props: {} },
  content: [
    {
      type: "Box",
      props: {
        id: "box",
        content: [{ type: "Heading", props: { id: "heading", size } }],
      },
    },
  ],
});

it("undoes and redoes data while keeping the current child and inspector tab, without adding history", async () => {
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    getPuck = useGetPuck();
    return null;
  };
  render(
    <Puck config={config} data={data("48px")} iframe={{ enabled: false }}>
      <Inspector>
        <Capture />
      </Inspector>
    </Puck>
  );
  await act(async () =>
    getPuck().history.setHistories([
      {
        id: "column-edit",
        state: {
          data: data("32px"),
          ui: {
            itemSelector: { index: 0, zone: "root:default-zone" },
            fieldTab: "Content",
          },
        },
      },
      {
        id: "heading-edit",
        state: {
          data: data("48px"),
          ui: {
            itemSelector: getPuck().getSelectorForId("heading"),
            fieldTab: "Design",
          },
        },
      },
    ])
  );
  await act(async () =>
    getPuck().dispatch({
      type: "setUi",
      ui: {
        itemSelector: getPuck().getSelectorForId("heading"),
        fieldTab: "Design",
      },
    })
  );
  await act(async () => getPuck().history.back());
  expect(getPuck().selectedItem?.props.id).toBe("heading");
  expect(getPuck().selectedItem?.props.size).toBe("32px");
  expect(getPuck().appState.ui.fieldTab).toBe("Design");
  expect(getPuck().history.histories).toHaveLength(2);
  expect(getPuck().history.index).toBe(0);
  await act(async () => getPuck().history.forward());
  expect(getPuck().selectedItem?.props.id).toBe("heading");
  expect(getPuck().selectedItem?.props.size).toBe("48px");
  expect(getPuck().history.histories).toHaveLength(2);
});

it("allows history to remove the selected component without keeping a stale selector", async () => {
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    getPuck = useGetPuck();
    return null;
  };
  render(
    <Puck config={config} data={data("48px")} iframe={{ enabled: false }}>
      <Inspector>
        <Capture />
      </Inspector>
    </Puck>
  );
  await act(async () =>
    getPuck().history.setHistories([
      {
        id: "empty",
        state: {
          data: { root: { props: {} }, content: [] },
          ui: { itemSelector: null },
        },
      },
      {
        id: "insert",
        state: {
          data: data("48px"),
          ui: { itemSelector: getPuck().getSelectorForId("heading") },
        },
      },
    ])
  );
  await act(async () => getPuck().history.back());
  expect(getPuck().selectedItem).toBeNull();
  expect(getPuck().appState.ui.itemSelector).toBeNull();
  expect(getPuck().appState.data.content).toEqual([]);
});

it("finds the current child by Id after history reorders its siblings and permits ordinary selection changes", async () => {
  let getPuck!: ReturnType<typeof useGetPuck>;
  const Capture = () => {
    getPuck = useGetPuck();
    return null;
  };
  const older = data("32px");
  older.content[0].props.content.unshift({
    type: "Heading",
    props: { id: "sibling", size: "20px" },
  });
  const newer = data("48px");
  newer.content[0].props.content.push({
    type: "Heading",
    props: { id: "sibling", size: "20px" },
  });
  render(
    <Puck config={config} data={newer} iframe={{ enabled: false }}>
      <Inspector>
        <Capture />
      </Inspector>
    </Puck>
  );
  await act(async () =>
    getPuck().history.setHistories([
      {
        id: "before-move",
        state: {
          data: older,
          ui: { itemSelector: { index: 0, zone: "root:default-zone" } },
        },
      },
      {
        id: "after-move",
        state: {
          data: newer,
          ui: { itemSelector: getPuck().getSelectorForId("heading") },
        },
      },
    ])
  );
  await act(async () => getPuck().history.back());
  expect(getPuck().selectedItem?.props.id).toBe("heading");
  expect(getPuck().appState.ui.itemSelector?.index).toBe(1);
  await act(async () =>
    getPuck().dispatch({
      type: "setUi",
      ui: { itemSelector: getPuck().getSelectorForId("box") },
    })
  );
  expect(getPuck().selectedItem?.props.id).toBe("box");
  expect(getPuck().history.index).toBe(0);
});
