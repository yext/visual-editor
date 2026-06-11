import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Config } from "@puckeditor/core";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { ComponentErrorBoundary } from "../components/ComponentErrorBoundary.tsx";
import { wrapConfigWithComponentErrorBoundary } from "./wrapConfigWithComponentErrorBoundary.tsx";

vi.mock("../hooks/useMessageSenders.ts", () => ({
  useCommonMessageSenders: () => ({
    sendError: vi.fn(),
  }),
}));

describe("wrapConfigWithComponentErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("wraps component renders while preserving other config fields", () => {
    const fieldConfig = { type: "text", label: "Title" };
    const defaultProps = { title: "Hello" };
    const renderComponent = vi.fn(() => <div>Banner</div>);
    const config = {
      components: {
        Banner: {
          label: "Banner",
          fields: { title: fieldConfig },
          defaultProps,
          render: renderComponent,
        },
        Hero: {
          label: "Hero",
          render: () => <div>Hero</div>,
        },
      },
    } as unknown as Config<any>;

    const wrappedConfig = wrapConfigWithComponentErrorBoundary(config);

    expect(wrappedConfig).not.toBe(config);
    expect(wrappedConfig.components.Banner.fields?.title).toBe(fieldConfig);
    expect(wrappedConfig.components.Banner.defaultProps).toBe(defaultProps);
    expect(wrappedConfig.components.Banner.render).not.toBe(renderComponent);
    expect(wrappedConfig.components.Hero.render).not.toBe(
      config.components.Hero.render
    );

    const wrappedElement = wrappedConfig.components.Banner.render({
      puck: { isEditing: true },
    } as any) as React.ReactElement;

    expect(wrappedElement.type).toBe(ComponentErrorBoundary);
  });

  it("shows the editor fallback when a wrapped component throws in editing mode", () => {
    const config = {
      components: {
        Banner: {
          render: () => {
            throw new Error("boom");
          },
        },
      },
    } as unknown as Config<any>;

    const wrappedConfig = wrapConfigWithComponentErrorBoundary(config);
    const wrappedElement = wrappedConfig.components.Banner.render({
      puck: { isEditing: true },
    } as any);

    render(
      <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
        {wrappedElement}
      </VisualEditorProvider>
    );

    expect(screen.getByText("Error")).not.toBeNull();
    expect(screen.getByText("Can't render this section.")).not.toBeNull();
  });
});
