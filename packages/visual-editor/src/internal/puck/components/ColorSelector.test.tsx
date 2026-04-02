import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorSelector } from "./ColorSelector.tsx";

vi.mock("@puckeditor/core", () => ({
  FieldLabel: ({ label, children, className }: any) => (
    <div className={className}>
      <span>{label}</span>
      {children}
    </div>
  ),
}));

vi.mock("react-color", () => ({
  SketchPicker: ({ color, onChange, onChangeComplete }: any) => (
    <div>
      <div>{color}</div>
      <button type="button" onPointerDown={() => onChange({ hex: "#111111" })}>
        drag-start
      </button>
      <button type="button" onPointerMove={() => onChange({ hex: "#222222" })}>
        drag-move
      </button>
      <button type="button" onClick={() => onChange({ hex: "#333333" })}>
        typed-change
      </button>
      <button
        type="button"
        onClick={() => onChangeComplete?.({ hex: "#444444" })}
      >
        commit-change
      </button>
    </div>
  ),
}));

describe("ColorSelector", () => {
  const renderSelector = (onChange = vi.fn()) =>
    render(
      <ColorSelector
        field={{ label: "Accent" } as any}
        id="accent"
        name="accent"
        value="#000000"
        onChange={onChange}
      />
    );

  it("keeps drag updates local until the picker signals completion", () => {
    const onChange = vi.fn();

    renderSelector(onChange);

    fireEvent.click(screen.getByRole("button", { name: "Accent" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "drag-start" }));
    fireEvent.pointerMove(screen.getByRole("button", { name: "drag-move" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("#222222")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "commit-change" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("#444444");
  });

  it("does not close the picker when a color change is committed", () => {
    const onChange = vi.fn();

    renderSelector(onChange);

    fireEvent.click(screen.getByRole("button", { name: "Accent" }));
    fireEvent.click(screen.getByRole("button", { name: "commit-change" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Close color picker" })
    ).toBeDefined();
  });

  it("does not close the picker when pointer events happen inside the popover", () => {
    renderSelector();

    fireEvent.click(screen.getByRole("button", { name: "Accent" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "drag-start" }));
    fireEvent.pointerMove(screen.getByRole("button", { name: "drag-move" }));
    fireEvent.pointerUp(screen.getByRole("button", { name: "drag-move" }));

    expect(
      screen.getByRole("button", { name: "Close color picker" })
    ).toBeDefined();
  });
});
