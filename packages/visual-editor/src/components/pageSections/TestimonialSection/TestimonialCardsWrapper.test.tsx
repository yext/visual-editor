import { describe, expect, it } from "vitest";
import { TestimonialCardsWrapper } from "./TestimonialCardsWrapper.tsx";

const defaultProps = TestimonialCardsWrapper.defaultProps!;
const resolveData = async (
  data: Partial<typeof defaultProps.data>,
  streamDocument: Record<string, unknown>
) =>
  await TestimonialCardsWrapper.resolveData!(
    {
      props: {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          ...data,
        },
      },
    } as NonNullable<
      Parameters<NonNullable<typeof TestimonialCardsWrapper.resolveData>>[0]
    >,
    {
      metadata: {
        streamDocument,
      },
    } as Parameters<NonNullable<typeof TestimonialCardsWrapper.resolveData>>[1]
  );

describe("TestimonialCardsWrapper", () => {
  it("when using a base entity section field then legacy testimonials are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_testimonialSection",
        constantValueEnabled: false,
      },
      {
        c_testimonialSection: {
          testimonials: [{ description: { html: "<p>Base Testimonial</p>" } }],
        },
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(
      result.props!.slots!.CardSlot![0]?.props.parentData?.testimonial
    ).toEqual({
      description: { html: "<p>Base Testimonial</p>" },
    });
  });

  it("when using a linked section field then the first linked entity's testimonials are resolved", async () => {
    const result = await resolveData(
      {
        field: "c_linkedLocation.c_testimonialSection",
        constantValueEnabled: false,
      },
      {
        c_linkedLocation: [
          {
            c_testimonialSection: {
              testimonials: [
                { description: { html: "<p>Linked Testimonial</p>" } },
              ],
            },
          },
          {
            c_testimonialSection: {
              testimonials: [
                { description: { html: "<p>Ignored Testimonial</p>" } },
              ],
            },
          },
        ],
      }
    );

    expect(result.props!.slots!.CardSlot!).toHaveLength(1);
    expect(
      result.props!.slots!.CardSlot![0]?.props.parentData?.testimonial
    ).toEqual({
      description: { html: "<p>Linked Testimonial</p>" },
    });
  });
});
