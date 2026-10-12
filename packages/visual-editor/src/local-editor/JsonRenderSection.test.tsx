import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import type { Config, Slot } from "@puckeditor/core";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  JsonRenderEditingContext,
  JsonRenderSection,
} from "./JsonRenderSection.tsx";

describe("json-render section adapter", () => {
  it("injects host editing context and callbacks over generated props", () => {
    const renderDropZone = vi.fn();
    const host = {
      isEditing: false,
      dragRef: null,
      metadata: {},
      renderDropZone,
    };
    const section = vi.fn(({ text, puck }) => {
      expect(puck).toBe(host);
      expect(puck.renderDropZone).toBe(renderDropZone);
      return <h2>{text}</h2>;
    });
    render(
      <JsonRenderEditingContext.Provider value={host}>
        <JsonRenderSection
          render={section}
          schema={z.object({
            text: z.string(),
            puck: z.object({ isEditing: z.literal(false) }),
          })}
          props={{ text: "Hi", puck: { isEditing: true } }}
        />
      </JsonRenderEditingContext.Provider>
    );
    expect(screen.getByRole("heading").textContent).toBe("Hi");
  });
  it("checks resolved props again when runtime state changes", () => {
    const section = vi.fn(({ color }) => <p>{color}</p>);
    const schema = z.object({
      color: z.string().regex(/^\[#[0-9a-fA-F]{6}\]$/),
    });
    const view = render(
      <JsonRenderSection
        render={section}
        schema={schema}
        props={{ color: "[#D63384]" }}
      />
    );
    expect(section).toHaveBeenCalledTimes(1);
    view.rerender(
      <JsonRenderSection
        render={section}
        schema={schema}
        props={{ color: "#D63384" }}
      />
    );
    expect(section).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("#D63384")).toBeNull();
  });
});

it("resolves nested slot arrays before rendering and updates resolved props", async () => {
  const resolveData = vi.fn((data) => ({
    ...data,
    props: { ...data.props, suffix: " resolved" },
  }));
  const section: Config<{
    Section: { slots: { ImageSlot: Slot }; suffix?: string };
    Image: { text: string };
  }> = {
    components: {
      Section: {
        fields: {
          slots: {
            type: "object",
            objectFields: { ImageSlot: { type: "slot" } },
          },
        },
        resolveData,
        render: ({ slots, suffix }) => (
          <div>
            <slots.ImageSlot />
            <span>{suffix}</span>
          </div>
        ),
      },
      Image: { render: ({ text }) => <h2>{text}</h2> },
    },
  };
  const context = { document: { locale: "en" } };
  const view = (text: string) => (
    <TemplatePropsContext.Provider value={context}>
      <JsonRenderSection
        render={section.components.Section.render}
        puckConfig={section}
        props={{
          id: "hero",
          slots: { ImageSlot: [{ type: "Image", props: { text } }] },
        }}
      />
    </TemplatePropsContext.Provider>
  );
  const rendered = render(view("Hero image"));
  await waitFor(() =>
    expect(screen.getByRole("heading").textContent).toBe("Hero image")
  );
  expect(screen.getByText("resolved")).toBeTruthy();
  const calls = resolveData.mock.calls.length;
  rendered.rerender(view("Hero image"));
  expect(screen.getByRole("heading").textContent).toBe("Hero image");
  expect(resolveData.mock.calls.length).toBe(calls);
  rendered.rerender(view("Updated image"));
  await waitFor(() =>
    expect(screen.getByRole("heading").textContent).toBe("Updated image")
  );
  rendered.unmount();
});
