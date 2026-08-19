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

type MiniHeroResolvedProps = {
  data: {
    eyebrow?: string;
    title: string;
    description?: string;
    image?: {
      src: string;
      alt?: string;
      width?: number;
      height?: number;
    };
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
    description?: YextEntityField<string>;
    image?: YextEntityField<
      ImageType | ComplexImageType | TranslatableAssetImage
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
        type: "testEntityField",
        label: msg("fields.description", "Description"),
        filter: { types: ["type.string"] },
        output: "plainText",
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
            <img
              src={data.image.src}
              alt={data.image.alt ?? ""}
              width={data.image.width}
              height={data.image.height}
              className="h-full max-h-[420px] w-full object-cover"
            />
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
            {data.description?.trim() && (
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {data.description}
              </p>
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
        constantValueEnabled: true,
      },
      primaryCta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: {
            defaultValue: "Primary Action",
          },
          link: {
            defaultValue: "/",
          },
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
      secondaryCta: {
        field: "",
        constantValue: {
          ctaType: "textAndLink",
          label: {
            defaultValue: "Secondary Action",
          },
          link: {
            defaultValue: "/about",
          },
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
