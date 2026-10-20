import { describe, expect, it } from "vitest";
import { buildPuckHistoryState } from "./buildPuckHistoryState.ts";

describe("buildPuckHistoryState", () => {
  it("omits ui when it is undefined", () => {
    expect(
      buildPuckHistoryState(
        {
          root: {},
          content: [],
          zones: {},
        },
        undefined
      )
    ).toEqual({
      data: {
        root: {},
        content: [],
        zones: {},
      },
    });
  });

  it("omits ui when it is null", () => {
    expect(
      buildPuckHistoryState(
        {
          root: {},
          content: [],
          zones: {},
        },
        null
      )
    ).toEqual({
      data: {
        root: {},
        content: [],
        zones: {},
      },
    });
  });

  it("preserves ui when it is provided", () => {
    expect(
      buildPuckHistoryState(
        {
          root: {},
          content: [],
          zones: {},
        },
        {
          itemSelector: {
            zone: "root",
            index: 0,
          },
        } as any
      )
    ).toEqual({
      data: {
        root: {},
        content: [],
        zones: {},
      },
      ui: {
        itemSelector: {
          zone: "root",
          index: 0,
        },
        componentList: {},
      },
    });
  });

  it("when restoring saved history then current config supplies component categories", () => {
    expect(
      buildPuckHistoryState(
        {
          root: {},
          content: [],
          zones: {},
        },
        {
          itemSelector: { zone: "root", index: 0 },
          componentList: {
            "section:Sections": { components: ["Banner"], expanded: false },
            "section:Removed": { components: ["OldSection"] },
          },
        } as any,
        {
          "section:Sections": { components: ["Banner", "Hero"] },
          "section:Custom Components": {
            components: ["EventCards"],
            defaultExpanded: true,
          },
        }
      )
    ).toEqual({
      data: {
        root: {},
        content: [],
        zones: {},
      },
      ui: {
        itemSelector: { zone: "root", index: 0 },
        componentList: {
          "section:Sections": {
            title: undefined,
            components: ["Banner", "Hero"],
            visible: undefined,
            expanded: false,
          },
          "section:Custom Components": {
            title: undefined,
            components: ["EventCards"],
            visible: undefined,
            expanded: true,
          },
        },
      },
    });
  });
});
