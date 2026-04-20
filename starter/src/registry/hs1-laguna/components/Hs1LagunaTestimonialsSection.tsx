import { useState } from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";

type TestimonialItem = {
  quote: string;
  source: string;
};

export type Hs1LagunaTestimonialsSectionProps = {
  title: string;
  caption: string;
  testimonials: TestimonialItem[];
};

const Hs1LagunaTestimonialsSectionFields: Fields<Hs1LagunaTestimonialsSectionProps> =
  {
    title: { label: "Title", type: "text" },
    caption: { label: "Caption", type: "text" },
    testimonials: {
      label: "Testimonials",
      type: "array",
      arrayFields: {
        quote: { label: "Quote", type: "text" },
        source: { label: "Source", type: "text" },
      },
      defaultItemProps: {
        quote: "Quote",
        source: "Source",
      },
      getItemSummary: (item: TestimonialItem) => item.source || item.quote,
    },
  };

export const Hs1LagunaTestimonialsSectionComponent: PuckComponent<
  Hs1LagunaTestimonialsSectionProps
> = ({ title, caption, testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];

  if (!activeTestimonial) {
    return <></>;
  }

  return (
    <section className="bg-white px-[14px] py-[18px] md:px-0 md:py-[22px]">
      <div className="mx-auto max-w-[1140px]">
        <div className="rounded-none bg-white px-[23px] pb-[38px] pt-[22px] shadow-[0_5px_33px_13px_rgba(0,0,0,0.08)] md:px-10 md:pb-[48px]">
          <div className="pb-[12px] text-center">
            <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[23px] font-bold leading-[1.13] text-[#4f4f4f] md:text-[26px]">
              {title}
            </h2>
            <h3 className="m-0 mt-0.5 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] italic font-medium leading-[1.222] text-[#8a8a8a]">
              {caption}
            </h3>
          </div>

          <div className="mx-auto max-w-[976px]">
            <div className="bg-[#fff9f7] px-4 pb-[10px] pt-[18px] text-left md:px-[48px] md:pb-[12px] md:pt-[22px]">
              <p className="m-0 text-[14px] leading-[1.6] text-[#4f4f4f] md:text-[16px]">
                <span className="mr-1 text-[18px] leading-none text-[#755b53]">
                  "
                </span>
                {activeTestimonial.quote}
                <span className="ml-1 text-[18px] leading-none text-[#755b53]">
                  "
                </span>
              </p>
            </div>
            <p className="m-0 bg-[#fff9f7] px-4 pb-[18px] pt-2 text-left font-['Roboto',Arial,Helvetica,sans-serif] text-[12px] italic text-black md:px-[48px] md:pb-[20px] md:text-[13px]">
              {activeTestimonial.source}
            </p>
          </div>

          {testimonials.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(
                    activeIndex === 0
                      ? testimonials.length - 1
                      : activeIndex - 1,
                  )
                }
                className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={`${testimonial.source}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full ${
                      index === activeIndex ? "bg-[#755b53]" : "bg-[#d5b8ae]"
                    }`}
                    aria-label={`Show testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(
                    activeIndex === testimonials.length - 1
                      ? 0
                      : activeIndex + 1,
                  )
                }
                className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaTestimonialsSection: ComponentConfig<Hs1LagunaTestimonialsSectionProps> =
  {
    label: "Testimonials",
    fields: Hs1LagunaTestimonialsSectionFields,
    defaultProps: {
      title: "Testimonials",
      caption: "What Our Clients Say About Us",
      testimonials: [
        {
          quote:
            "Visiting Dental Practice Demo gives my family and me more reasons to smile.",
          source: "The Johnson Family",
        },
        {
          quote:
            "Dr. Smith provided me with excellent care when I needed it the most.",
          source: "Jennifer R.",
        },
      ],
    },
    render: Hs1LagunaTestimonialsSectionComponent,
  };
