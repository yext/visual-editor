import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { type YextCTAField } from "../../fields/CTASelectorField.tsx";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";
import { type ComplexImageType, type ImageType } from "@yext/pages-components";
import { type TranslatableAssetImage } from "../../types/images.ts";
import { type TranslatableRichText } from "../../types/types.ts";
import { type ImageStylingProps } from "../contentBlocks/image/styling.ts";

type MiniHeroResolvedProps = {
  title: string;
  description?: React.ReactNode;
  image?: React.ReactNode;
  primarycta?: React.ReactNode;
  secondarycta?: React.ReactNode;
};

export type MiniHeroAuthoredProps = {
  title: YextEntityField<string>;
  description?: YextEntityField<TranslatableRichText>;
  image?: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  > &
    Partial<Pick<ImageStylingProps, "aspectRatio" | "imageFillType" | "width">>;
  primarycta?: YextCTAField;
  secondarycta?: YextCTAField;
};

const miniHeroFields: YextFields<MiniHeroAuthoredProps> = {
  title: {
    type: "testEntityField",
    label: msg("fields.title", "Title"),
    filter: { types: ["type.string"] },
    output: "plainText",
  },
  description: {
    type: "testRichText",
    label: msg("fields.description", "Description"),
    filter: { types: ["type.string", "type.rich_text_v2"] },
  },
  image: {
    type: "testImage",
    label: msg("fields.image", "Image"),
    filter: { types: ["type.image"] },
  },
  primarycta: {
    type: "testCTA",
    label: msg("fields.primaryCTA", "Primary CTA"),
  },
  secondarycta: {
    type: "testCTA",
    label: msg("fields.secondaryCTA", "Secondary CTA"),
  },
};

const MiniHeroComponent: PuckComponent<MiniHeroResolvedProps> = ({
  title,
  description,
  image,
  primarycta,
  secondarycta,
}) => {
  if (!title?.trim()) {
    return <></>;
  }

  return (
    <section className="bg-[linear-gradient(135deg,_#f7f0e6_0%,_#fffdf9_100%)] px-6 py-12 text-[#1e2521] sm:px-8 md:px-10 md:py-16 lg:px-16 lg:py-24">
      <div
        className={[
          "mx-auto grid max-w-[1280px] items-center gap-6 md:gap-12",
          image
            ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
            : "max-w-[720px]",
        ].join(" ")}
      >
        {image && (
          <div className="flex items-center justify-center overflow-hidden rounded-[1.5rem] border border-[rgba(30,37,33,0.12)] bg-[#e9dfd1] shadow-[0_20px_40px_rgba(30,37,33,0.08)]">
            <div className="flex min-h-[240px] w-full items-center justify-center md:min-h-[320px]">
              {image}
            </div>
          </div>
        )}
        <div className="mx-auto flex max-w-[720px] flex-col items-start gap-5">
          <h1 className="m-0 font-[Georgia,'Times_New_Roman',serif] text-[clamp(2.75rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.06em]">
            {title}
          </h1>
          {description && (
            <div className="max-w-[40rem] text-[1.05rem] leading-[1.6] text-[#55615b] [&_p]:m-0">
              {description}
            </div>
          )}
          {(primarycta || secondarycta) && (
            <div className="flex flex-wrap gap-3">
              {primarycta && (
                <div className="inline-flex items-center">{primarycta}</div>
              )}
              {secondarycta && (
                <div className="inline-flex items-center">{secondarycta}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const MiniHero: YextComponentConfig<MiniHeroAuthoredProps> = {
  label: msg("components.miniHero", "Mini Hero"),
  ai: {
    instructions:
      "Reference the Generated Mini Hero pattern: component-owned transform-backed fields, complete defaultProps values, and empty HTML field targets.",
  },
  fields: miniHeroFields,
  defaultProps: {
    title: {
      field: "name",
      constantValue: "",
      constantValueEnabled: false,
    },
    description: {
      field: "",
      constantValue: {
        en: {
          json: "",
          html: "<p>Discover what makes <b>[[name]]</b> worth the trip.</p>",
        },
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    image: {
      field: "",
      constantValueEnabled: true,
      constantValue: {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alternateText: "",
      },
      aspectRatio: 1.78,
      imageFillType: "fill",
      width: 640,
    },
    primarycta: {
      field: "",
      constantValueEnabled: true,
      selectedType: "textAndLink",
      constantValue: {
        ctaType: "textAndLink",
        label: {
          en: "Book Now",
          hasLocalizedValue: "true",
        },
        link: "/book",
        linkType: "URL",
      },
    },
    secondarycta: {
      field: "",
      constantValueEnabled: true,
      selectedType: "textAndLink",
      constantValue: {
        ctaType: "textAndLink",
        label: {
          en: "Learn More",
          hasLocalizedValue: "true",
        },
        link: "/learn-more",
        linkType: "URL",
      },
    },
  } as unknown as MiniHeroAuthoredProps,
  render: MiniHeroComponent as unknown as PuckComponent<MiniHeroAuthoredProps>,
};
