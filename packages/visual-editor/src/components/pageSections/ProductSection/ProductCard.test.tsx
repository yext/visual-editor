import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard, type ProductCardProps } from "./ProductCard.tsx";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";

const createSlot = (testId: string) =>
  ((props: Record<string, unknown>) => (
    <div data-testid={testId}>{String(props.style ? testId : testId)}</div>
  )) as unknown as ProductCardProps["slots"][keyof ProductCardProps["slots"]];

const createProps = (
  props: Partial<ProductCardProps> = {}
): ProductCardProps & {
  puck: { isEditing: boolean; dragRef?: React.Ref<HTMLDivElement> };
  id: string;
} => ({
  id: "product-card",
  puck: {
    isEditing: false,
    dragRef: undefined,
  },
  styles: {},
  slots: {
    ImageSlot: createSlot("image-slot"),
    BrowSlot: createSlot("brow-slot"),
    TitleSlot: createSlot("title-slot"),
    PriceSlot: createSlot("price-slot"),
    DescriptionSlot: createSlot("description-slot"),
    CTASlot: createSlot("cta-slot"),
  },
  parentStyles: {
    variant: "immersive",
    showImage: true,
    showBrow: true,
    showTitle: true,
    showPrice: true,
    showDescription: true,
    showCTA: true,
  },
  conditionalRender: {
    image: true,
    title: true,
    brow: true,
    price: true,
    description: true,
    cta: true,
  },
  ...props,
});

const renderProductCard = (props: ReturnType<typeof createProps>) =>
  render(
    <VisualEditorProvider templateProps={{ document: {} }}>
      {ProductCard.render!(props as any)}
    </VisualEditorProvider>
  );

describe("ProductCard", () => {
  it("hides toggled-off fields even when data is present", () => {
    const props = createProps({
      parentStyles: {
        variant: "minimal",
        showImage: false,
        showBrow: false,
        showTitle: false,
        showPrice: true,
        showDescription: true,
        showCTA: false,
      },
      conditionalRender: {
        image: true,
        title: true,
        brow: true,
        price: true,
        description: true,
        cta: true,
      },
    });

    renderProductCard(props);

    expect(screen.queryByTestId("image-slot")).toBeNull();
    expect(screen.queryByTestId("brow-slot")).toBeNull();
    expect(screen.queryByTestId("title-slot")).toBeNull();
    expect(screen.queryByTestId("cta-slot")).toBeNull();
    expect(screen.getByTestId("price-slot")).toBeDefined();
    expect(screen.getByTestId("description-slot")).toBeDefined();
  });

  it("hides fields when their data is absent even if the toggle is enabled", () => {
    const props = createProps({
      conditionalRender: {
        image: false,
        title: false,
        brow: false,
        price: false,
        description: true,
        cta: false,
      },
    });

    renderProductCard(props);

    expect(screen.queryByTestId("image-slot")).toBeNull();
    expect(screen.queryByTestId("title-slot")).toBeNull();
    expect(screen.queryByTestId("brow-slot")).toBeNull();
    expect(screen.queryByTestId("price-slot")).toBeNull();
    expect(screen.queryByTestId("cta-slot")).toBeNull();
    expect(screen.getByTestId("description-slot")).toBeDefined();
  });
});
