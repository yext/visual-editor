import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LayoutGenerationChatUiContext } from "../internal/layoutGeneration/chat/contexts.tsx";
import {
  CardContextProvider,
  useCardContext,
  useParentCardStyles,
} from "./useCardContext.tsx";

afterEach(cleanup);

it("pauses shared card writes during generation and discards stale shared styles", () => {
  let context!: ReturnType<typeof useCardContext<{ color: string }>>;
  let parentStyles: unknown;
  const Consumer = () => {
    context = useCardContext<{ color: string }>();
    parentStyles = useParentCardStyles();
    return null;
  };
  const tree = (active: boolean) => (
    <LayoutGenerationChatUiContext.Provider
      value={{ chat: { isGeneratingPage: active } } as any}
    >
      <CardContextProvider parentStyles={{ variant: "classic" }}>
        <Consumer />
      </CardContextProvider>
    </LayoutGenerationChatUiContext.Provider>
  );
  const view = render(tree(false));
  act(() => context.setSharedCardProps({ color: "red" }));
  expect(context.sharedCardProps).toEqual({ color: "red" });
  const previousSetter = context.setSharedCardProps;
  view.rerender(tree(true));
  expect(context.sharedCardProps).toBeUndefined();
  expect(parentStyles).toEqual({ variant: "classic" });
  const update = vi.fn(() => ({ color: "green" }));
  act(() => {
    previousSetter({ color: "blue" });
    context.setSharedCardProps(update);
  });
  expect(update).not.toHaveBeenCalled();
  view.rerender(tree(false));
  expect(context.sharedCardProps).toBeUndefined();
  act(() => context.setSharedCardProps({ color: "purple" }));
  expect(context.sharedCardProps).toEqual({ color: "purple" });
});
