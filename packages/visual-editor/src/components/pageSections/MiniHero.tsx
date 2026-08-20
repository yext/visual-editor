import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { PageSection } from "../atoms/pageSection.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import {
  backgroundColors,
  ThemeColor,
} from "../../utils/themeConfigOptions.ts";
import { type YextCTAField } from "../../fields/CTASelectorField.tsx";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";
import { type ComplexImageType, type ImageType } from "@yext/pages-components";
import { type TranslatableAssetImage } from "../../types/images.ts";
import { type TranslatableRichText } from "../../types/types.ts";
import { type ImageStylingProps } from "../contentBlocks/image/styling.ts";

type MiniHeroResolvedProps = {
  data: {
    eyebrow?: string;
    title: string;
    description?: React.ReactNode;
    image?: React.ReactNode;
    primaryCta?: React.ReactNode;
    secondaryCta?: React.ReactNode;
  };
  styles: {
    backgroundColor?: ThemeColor;
    desktopImagePosition: "left" | "right";
    mobileContentAlignment: "left" | "center";
  };
};

export type MiniHeroAuthoredProps = {
  data: {
    eyebrow?: YextEntityField<string>;
    title: YextEntityField<string>;
    description?: YextEntityField<TranslatableRichText>;
    image?: YextEntityField<
      ImageType | ComplexImageType | TranslatableAssetImage
    > &
      Partial<
        Pick<ImageStylingProps, "aspectRatio" | "imageFillType" | "width">
      >;
    primaryCta?: YextCTAField;
    secondaryCta?: YextCTAField;
  };
  styles: {
    backgroundColor?: ThemeColor;
    desktopImagePosition: "left" | "right";
    mobileContentAlignment: "left" | "center";
  };
};

const miniHeroFields: YextFields<MiniHeroAuthoredProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      eyebrow: {
        type: "testEntityField",
        label: msg("fields.eyebrow", "Eyebrow"),
        filter: { types: ["type.string"] },
        output: "plainText",
      },
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
      primaryCta: {
        type: "testCTA",
        label: msg("fields.primaryCTA", "Primary CTA"),
      },
      secondaryCta: {
        type: "testCTA",
        label: msg("fields.secondaryCTA", "Secondary CTA"),
      },
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      desktopImagePosition: {
        type: "radio",
        label: msg("fields.desktopImagePosition", "Desktop Image Position"),
        options: [
          {
            label: msg("fields.options.left", "Left", {
              context: "direction",
            }),
            value: "left",
          },
          {
            label: msg("fields.options.right", "Right", {
              context: "direction",
            }),
            value: "right",
          },
        ],
      },
      mobileContentAlignment: {
        type: "radio",
        label: msg("fields.mobileContentAlignment", "Mobile Content Alignment"),
        options: [
          {
            label: msg("fields.options.left", "Left", {
              context: "direction",
            }),
            value: "left",
          },
          {
            label: msg("fields.options.center", "Center", {
              context: "direction",
            }),
            value: "center",
          },
        ],
      },
    },
  },
};

const MiniHeroComponent: PuckComponent<MiniHeroResolvedProps> = ({
  data,
  styles,
}) => {
  if (!data.title?.trim()) {
    return <></>;
  }

  const isImageLeft = styles.desktopImagePosition === "left";
  const isCentered = styles.mobileContentAlignment === "center";

  return (
    <PageSection
      background={styles.backgroundColor}
      verticalPadding="default"
      className="overflow-hidden"
    >
      <div
        className={[
          "grid items-center gap-8 md:gap-12",
          data.image ? "md:grid-cols-2" : "max-w-3xl",
        ].join(" ")}
      >
        {data.image && (
          <div
            className={[
              "overflow-hidden rounded-image-borderRadius border border-slate-200/70 bg-white shadow-sm",
              isImageLeft ? "md:order-1" : "md:order-2",
            ].join(" ")}
          >
            {data.image}
          </div>
        )}
        <div
          className={[
            "flex flex-col gap-5",
            isCentered ? "items-center text-center" : "items-start text-left",
            data.image ? (isImageLeft ? "md:order-2" : "md:order-1") : "",
          ].join(" ")}
        >
          {data.eyebrow?.trim() && (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
              {data.eyebrow}
            </p>
          )}
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {data.title}
            </h1>
            {data.description && (
              <div className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {data.description}
              </div>
            )}
          </div>
          {(data.primaryCta || data.secondaryCta) && (
            <div
              className={[
                "flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap",
                isCentered ? "items-center justify-center" : "items-start",
              ].join(" ")}
            >
              {data.primaryCta}
              {data.secondaryCta}
            </div>
          )}
        </div>
      </div>
    </PageSection>
  );
};

export const MiniHero: YextComponentConfig<MiniHeroAuthoredProps> = {
  label: msg("components.miniHero", "Mini Hero"),
  ai: {
    instructions:
      'Follow this authored shape exactly for Yext-aware generated components: content lives in transform-backed `testEntityField`, `testRichText`, `testImage`, and `testCTA` fields so render-time field transforms can resolve mapped Yext data, embedded fields like [[name]], rich text, and CTAs. Treat each CTA and each image as one complete field object such as `primaryCta`, `secondaryCta`, `image`, `imageOne`, or `imageTwo`, rather than splitting them across nested sub-properties like `cta.label`, `cta.link`, `image.src`, or `image.alt`. Do not use slots. Do not create helper components for CTAs. Every generated custom field must be fully authored in props, not just annotated in HTML. If you generate a `testCTA` annotation, also generate a full CTA prop object with `field`, `constantValueEnabled`, `selectedType`, and `constantValue`. If you generate a `testImage` annotation, also generate a full image prop object with `field`, `constantValueEnabled`, `constantValue`, and any image presentation props such as `aspectRatio`, `imageFillType`, and `width`. Copy this shape: { "data": { "eyebrow": testEntityField, "title": testEntityField, "description": testRichText, "image": testImage, "primaryCta": testCTA, "secondaryCta": testCTA } }. Copy this props pattern: { "primaryCta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": "Primary Action", "link": "/", "linkType": "URL" } }, "image": { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://placehold.co/960x720", "alternateText": "Hero image" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 } }. Copy this markup pattern: `<p data-puck-field-eyebrow=\'{ "type": "testEntityField" }\'>Featured</p><h1 data-puck-field-title=\'{ "type": "testEntityField" }\'>Hero title</h1><div data-puck-field-description=\'{ "type": "testRichText" }\'><p>Body copy</p></div><a href="#" data-puck-field-primaryCta=\'{ "type": "testCTA" }\'>Primary Action</a><a href="#" data-puck-field-secondaryCta=\'{ "type": "testCTA" }\'>Secondary Action</a><div data-puck-field-image=\'{ "type": "testImage" }\'></div>`.',
  },
  fields: miniHeroFields,
  defaultProps: {
    data: {
      eyebrow: {
        field: "",
        constantValue: "Featured",
        constantValueEnabled: true,
      },
      title: {
        field: "name",
        constantValue: "Mini Hero Title",
        constantValueEnabled: false,
      },
      description: {
        field: "",
        constantValue:
          "A transform-backed hero demo that behaves like an AI-generated component while still supporting Yext field bindings.",
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://placehold.co/960x720",
          height: 720,
          width: 960,
          alternateText: "Mini Hero placeholder image",
        },
        aspectRatio: 1.78,
        imageFillType: "fill",
        width: 640,
        constantValueEnabled: true,
      },
      primaryCta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: "Primary Action",
          link: "/",
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
      secondaryCta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: "Secondary Action",
          link: "/about",
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      desktopImagePosition: "right",
      mobileContentAlignment: "left",
    },
  } as unknown as MiniHeroAuthoredProps,
  render: MiniHeroComponent as unknown as PuckComponent<MiniHeroAuthoredProps>,
};
