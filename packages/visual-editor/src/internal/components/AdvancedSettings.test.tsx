import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Puck, createUsePuck } from "@puckeditor/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../../hooks/useDocument.tsx";
import { fieldsOverride } from "../puck/components/FieldsOverride.tsx";
import { AdvancedSettings } from "./AdvancedSettings.tsx";

const usePuck = createUsePuck();
const SavedState = () => {
  const { appState, history, dispatch } = usePuck((state) => state);
  return (
    <>
      <output data-testid="saved">
        {JSON.stringify(appState.data.root.props)}
      </output>
      <button
        onClick={() =>
          dispatch({
            type: "replaceRoot",
            root: {
              ...appState.data.root,
              props: {
                ...appState.data.root.props,
                title: "Edited while drawer open",
              },
            },
          })
        }
      >
        Edit title
      </button>
      <button disabled={!history.hasPast} onClick={history.back}>
        Undo
      </button>
      <button onClick={history.forward}>Redo</button>
    </>
  );
};
const renderSettings = (
  props: Record<string, any> = {},
  entityTypeId = "location",
  rootDefaultProps: Record<string, any> = {}
) =>
  render(
    <TemplatePropsContext.Provider
      value={{
        document: { name: "Shop", meta: { entityType: { id: entityTypeId } } },
      }}
    >
      <Puck
        config={{
          components: {},
          root: { defaultProps: rootDefaultProps, render: () => <></> },
        }}
        data={{ root: { props }, content: [] }}
        ui={{ itemSelector: { zone: "root:advanced", index: 0 } }}
        overrides={{ fields: fieldsOverride }}
      >
        <Puck.Fields />
        <SavedState />
      </Puck>
    </TemplatePropsContext.Provider>
  );
const savedProps = () => JSON.parse(screen.getByTestId("saved").textContent!);
beforeEach(() => {
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener() {},
    removeListener() {},
  }));
  const originalError = console.error;
  vi.spyOn(console, "error").mockImplementation((...args) => {
    if (String(args[0]).includes("Could not parse CSS stylesheet")) return;
    originalError(...args);
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("Advanced Settings", () => {
  it("defaults old layouts to Recommended and preserves both values when toggling", async () => {
    renderSettings({
      schemaMarkup: "Recommended content",
      customSchemaMarkup: "Custom content",
      title: "Unrelated",
    });
    expect(
      (screen.getByLabelText("Recommended") as HTMLInputElement).checked
    ).toBe(true);
    fireEvent.click(screen.getByLabelText("Custom"));
    expect(savedProps()).toEqual({
      schemaMode: "custom",
      schemaMarkup: "Recommended content",
      customSchemaMarkup: "Custom content",
      title: "Unrelated",
    });
    fireEvent.click(screen.getByLabelText("Recommended"));
    expect(savedProps()).toEqual({
      schemaMode: "recommended",
      schemaMarkup: "Recommended content",
      customSchemaMarkup: "Custom content",
      title: "Unrelated",
    });
  });
  it.each([
    ["location", "{{businessType}}"],
    ["dm_root", "CollectionPage"],
    ["locator", "WebPage"],
  ])(
    "uses the %s Custom default without persisting it on selection",
    (entityTypeId, schemaType) => {
      const postMessage = vi
        .spyOn(window.parent, "postMessage")
        .mockImplementation(() => {});
      renderSettings({}, entityTypeId, AdvancedSettings.defaultProps?.data);
      expect(savedProps().customSchemaMarkup).toBeUndefined();

      fireEvent.click(screen.getByLabelText("Custom"));
      expect(savedProps().schemaMode).toBe("custom");
      expect(savedProps().customSchemaMarkup).toBeUndefined();
      fireEvent.click(screen.getByLabelText("Schema Markup"));
      expect(postMessage.mock.calls[0][0].payload.value).toContain(schemaType);
      expect(savedProps().customSchemaMarkup).toBeUndefined();
    }
  );

  it("opens the Custom default without a reset value and saves exact content only to its field", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    renderSettings({
      schemaMode: "custom",
      schemaMarkup: "Recommended content",
      title: "Unrelated",
    });
    fireEvent.click(screen.getByLabelText("Schema Markup"));
    const message = postMessage.mock.calls.find(
      ([message]) => message.type === "constantValueEditorOpened"
    )?.[0];
    expect(message?.payload).toEqual({
      type: "CustomSchemaMarkup",
      value: expect.stringContaining('<script type="application/ld+json">'),
      id: expect.any(String),
    });
    act(() =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://dev.yext.com",
          data: {
            type: "constantValueEditorClosed",
            payload: {
              id: message.payload.id,
              value: "  <script>{{#if name}}</script>\n  ",
            },
          },
        })
      )
    );
    expect(savedProps()).toEqual({
      schemaMode: "custom",
      schemaMarkup: "Recommended content",
      title: "Unrelated",
      customSchemaMarkup: "  <script>{{#if name}}</script>\n  ",
    });
  });

  it.each(["location", "dm_root", "locator"])(
    "supports save, reopen and undo/redo for %s",
    async (entityTypeId) => {
      const postMessage = vi
        .spyOn(window.parent, "postMessage")
        .mockImplementation(() => {});
      renderSettings(
        {
          schemaMode: "custom",
          schemaMarkup: "Recommended",
          customSchemaMarkup: "Old custom",
        },
        entityTypeId
      );
      fireEvent.click(screen.getByLabelText("Schema Markup"));
      const message = postMessage.mock.calls[0][0];
      fireEvent.click(screen.getByText("Edit title"));
      // A mode switch while the drawer is open must not redirect the save.
      fireEvent.click(screen.getByLabelText("Recommended"));
      act(() =>
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: "https://dev.yext.com",
            data: {
              type: "constantValueEditorClosed",
              payload: { id: message.payload.id, value: "New custom" },
            },
          })
        )
      );
      expect(savedProps()).toEqual({
        schemaMode: "recommended",
        schemaMarkup: "Recommended",
        customSchemaMarkup: "New custom",
        title: "Edited while drawer open",
      });
      await waitFor(() =>
        expect((screen.getByText("Undo") as HTMLButtonElement).disabled).toBe(
          false
        )
      );
      fireEvent.click(screen.getByText("Undo"));
      expect(savedProps().customSchemaMarkup).toBe("Old custom");
      fireEvent.click(screen.getByText("Redo"));
      expect(savedProps().customSchemaMarkup).toBe("New custom");
      fireEvent.click(screen.getByLabelText("Custom"));
      postMessage.mockClear();
      fireEvent.click(screen.getByLabelText("Schema Markup"));
      expect(postMessage.mock.calls[0][0].payload.value).toBe("New custom");
      const persisted = savedProps();
      cleanup();
      renderSettings(JSON.parse(JSON.stringify(persisted)), entityTypeId);
      expect(screen.getByText("New custom")).toBeDefined();
    }
  );

  it("ignores mismatched saves and cancellation, but accepts a blank save", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    renderSettings({ schemaMode: "custom", customSchemaMarkup: "Keep" });
    fireEvent.click(screen.getByLabelText("Schema Markup"));
    const message = postMessage.mock.calls[0][0];
    const close = (payload: Record<string, any>) =>
      act(() =>
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: "https://dev.yext.com",
            data: { type: "constantValueEditorClosed", payload },
          })
        )
      );
    close({ id: "different", value: "Ignore" });
    close({ id: message.payload.id });
    expect(savedProps().customSchemaMarkup).toBe("Keep");
    postMessage.mockClear();
    fireEvent.click(screen.getByLabelText("Schema Markup"));
    close({ id: postMessage.mock.calls[0][0].payload.id, value: "" });
    expect(savedProps().customSchemaMarkup).toBe("");
    postMessage.mockClear();
    fireEvent.click(screen.getByLabelText("Schema Markup"));
    expect(postMessage.mock.calls[0][0].payload.value).toBe("");
  });

  it("preserves the Recommended drawer contract", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    renderSettings();
    fireEvent.click(screen.getByLabelText("Schema Markup"));
    expect(postMessage.mock.calls[0][0].payload).toEqual({
      type: "SchemaMarkup",
      id: expect.any(String),
      value: expect.any(String),
      defaultValue: expect.any(String),
    });
    expect(postMessage.mock.calls[0][0].payload.value).toBe(
      postMessage.mock.calls[0][0].payload.defaultValue
    );
  });
});
