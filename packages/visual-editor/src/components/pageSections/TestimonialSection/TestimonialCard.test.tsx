import { describe, expect, it } from "vitest";
import {
  TestimonialCard,
  defaultTestimonialCardSlotData,
} from "./TestimonialCard.tsx";

describe("TestimonialCard", () => {
  it("when itemData provides mapped content then conditional render stays enabled", () => {
    const data = defaultTestimonialCardSlotData("testimonial-card-1", 0) as any;
    data.props.itemData = {
      field: "",
      description: { html: "<p>Very good burger</p>" },
      contributorName: "Jane",
      contributionDate: "2026-05-05",
    };

    const resolvedData = TestimonialCard.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: { streamDocument: {} },
      trigger: "initial",
      parent: null,
    } as any) as any;

    expect(resolvedData.props.conditionalRender).toEqual({
      description: true,
      contributorName: true,
      contributionDate: true,
    });
  });
});
