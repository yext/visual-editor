import { useState } from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type SlideItem = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  link: string;
  imageUrl: string;
};

export type Hs1LagunaHeroSectionProps = {
  slides: SlideItem[];
};

const Hs1LagunaHeroSectionFields: Fields<Hs1LagunaHeroSectionProps> = {
  slides: {
    label: "Slides",
    type: "array",
    arrayFields: {
      title: { label: "Title", type: "text" },
      subtitle: { label: "Subtitle", type: "text" },
      ctaLabel: { label: "Call To Action Label", type: "text" },
      link: { label: "Link", type: "text" },
      imageUrl: { label: "Image Url", type: "text" },
    },
    defaultItemProps: {
      title: "Hero Title",
      subtitle: "Hero Subtitle",
      ctaLabel: "Make an Appointment",
      link: "#",
      imageUrl: "",
    },
    getItemSummary: (item: SlideItem) => item.title,
  },
};

export const Hs1LagunaHeroSectionComponent: PuckComponent<
  Hs1LagunaHeroSectionProps
> = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(slides.length > 1 ? 1 : 0);
  const activeSlide = slides[activeIndex] ?? slides[0];

  if (!activeSlide) {
    return <></>;
  }

  return (
    <section className="bg-[#e8d7c3] px-0 pb-[38px] pt-[10px] md:pb-[64px] md:pt-7">
      <div className="mx-auto max-w-[1140px]">
        <div className="flex flex-col items-stretch md:flex-row md:items-center">
          <div className="mx-[14px] mb-[-70px] shadow-[0_5px_33px_13px_rgba(0,0,0,0.15)] md:mx-0 md:mb-[-25px] md:ml-[6.7%] md:mr-[-25px] md:w-[474px] md:min-w-[474px]">
            <div
              className="min-h-[270px] bg-cover bg-center md:min-h-[318px]"
              style={{ backgroundImage: `url(${activeSlide.imageUrl})` }}
            />
          </div>

          <div className="mx-[14px] mt-0 bg-[#e8d7c3] px-5 pb-[38px] pt-[15px] text-center md:mx-0 md:mb-10 md:mr-[6.7%] md:flex-1 md:px-[44px] md:pb-[50px] md:pl-[64px] md:pt-[26px]">
            <div className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[25px] font-bold leading-[1.182] text-[#4f4f4f] md:text-[33px]">
              {activeSlide.title}
            </div>
            <div className="m-0 mt-0.5 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] italic leading-[1.222] text-[#8a8a8a]">
              {activeSlide.subtitle}
            </div>
            <div className="mt-8">
              <Link
                cta={{ link: activeSlide.link, linkType: "URL" }}
                className="inline-flex min-w-[184px] items-center justify-center border border-[#6b3a2c] bg-[#6b3a2c] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#8f4638]"
              >
                {activeSlide.ctaLabel}
              </Link>
            </div>

            {slides.length > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      activeIndex === 0 ? slides.length - 1 : activeIndex - 1,
                    )
                  }
                  className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
                >
                  ‹
                </button>
                <div className="flex items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={`${slide.title}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full ${
                        index === activeIndex ? "bg-[#755b53]" : "bg-[#ffffff]"
                      }`}
                      aria-label={`Show slide ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      activeIndex === slides.length - 1 ? 0 : activeIndex + 1,
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
      </div>
    </section>
  );
};

export const Hs1LagunaHeroSection: ComponentConfig<Hs1LagunaHeroSectionProps> =
  {
    label: "Hero Slider",
    fields: Hs1LagunaHeroSectionFields,
    defaultProps: {
      slides: [
        {
          title: "Healthy Mouth",
          subtitle: "Happy Life",
          ctaLabel: "Make an Appointment",
          link: "https://www.ofc-laguna.com/appointment",
          imageUrl:
            "https://cdcssl.ibsrv.net/ibimg/smb/1200x1200_80/webmgr/1o/s/5/laguna/featuredblocks_1.jpg.webp?4544b3a1dbcae2ca44b042bc470dcec3",
        },
        {
          title: "Changing Lives",
          subtitle: "One Smile at a time",
          ctaLabel: "Make an Appointment",
          link: "https://www.ofc-laguna.com/appointment",
          imageUrl:
            "https://cdcssl.ibsrv.net/ibimg/smb/1200x1200_80/webmgr/1o/s/5/laguna/slider_2.jpg.webp?3082e519a2ac471923838f8a8c94d418",
        },
        {
          title: "Discover your smile",
          subtitle: "Today!",
          ctaLabel: "Make an Appointment",
          link: "https://www.ofc-laguna.com/appointment",
          imageUrl:
            "https://cdcssl.ibsrv.net/ibimg/smb/1200x1200_80/webmgr/1o/s/5/laguna/slider_3.jpg.webp?bad98343b203708499c06569c63a61e3",
        },
      ],
    },
    render: Hs1LagunaHeroSectionComponent,
  };
