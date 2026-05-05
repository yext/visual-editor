import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { InsightCard, defaultInsightCardSlotData } from "./InsightCard.tsx";

describe("InsightCard", () => {
  it("when show field styles are disabled then optional slots do not render", () => {
    const data = defaultInsightCardSlotData("insight-card-1") as any;

    render(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <InsightCard.render
          {...data.props}
          parentStyles={{
            showImage: false,
            showCategory: false,
            showPublishTime: false,
            showDescription: false,
            showCTA: false,
          }}
          conditionalRender={{ hasCategory: true, hasPublishTime: true }}
          puck={{ isEditing: false, dragRef: null }}
          slots={{
            ImageSlot: () => <div>image</div>,
            TitleSlot: () => <div>title</div>,
            CategorySlot: () => <div>category</div>,
            DescriptionSlot: () => <div>description</div>,
            PublishTimeSlot: () => <div>publish time</div>,
            CTASlot: () => <div>cta</div>,
          }}
        />
      </VisualEditorProvider>
    );

    expect(screen.getByText("title")).toBeTruthy();
    expect(screen.queryByText("image")).toBeNull();
    expect(screen.queryByText("category")).toBeNull();
    expect(screen.queryByText("publish time")).toBeNull();
    expect(screen.queryByText("description")).toBeNull();
    expect(screen.queryByText("cta")).toBeNull();
  });
});
