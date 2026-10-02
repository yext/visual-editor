import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { type YextCTAField } from "../../fields/CTASelectorField.tsx";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";
import { type TranslatableRichText } from "../../types/types.ts";

type TestBannerResolvedProps = {
  title: string;
  description?: React.ReactNode;
  primarycta?: React.ReactNode;
};

export type TestBannerAuthoredProps = {
  title: YextEntityField<string>;
  description?: YextEntityField<TranslatableRichText>;
  primarycta?: YextCTAField;
};

const testBannerFields: YextFields<TestBannerAuthoredProps> = {
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
  primarycta: {
    type: "testCTA",
    label: msg("fields.primaryCTA", "Primary CTA"),
  },
};

const TestBannerComponent: PuckComponent<TestBannerResolvedProps> = ({
  title,
  description,
  primarycta,
}) => {
  if (!title?.trim()) {
    return <></>;
  }

  return (
    <section className="bg-[#1e2521] px-6 py-10 text-[#fffdf9] md:px-10">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-[40rem] flex-col gap-3">
          <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] leading-[1] tracking-[-0.04em]">
            {title}
          </h2>
          {description && (
            <div className="text-[1rem] leading-[1.6] text-[rgba(255,253,249,0.82)] [&_p]:m-0">
              {description}
            </div>
          )}
        </div>
        {primarycta && (
          <div className="inline-flex items-center">{primarycta}</div>
        )}
      </div>
    </section>
  );
};

export const TestBanner: YextComponentConfig<TestBannerAuthoredProps> = {
  label: msg("components.testBanner", "Test Banner"),
  fields: testBannerFields,
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
          html: "<p>Use this compact banner as a reference for generated banner sections.</p>",
        },
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    primarycta: {
      field: "",
      constantValueEnabled: true,
      selectedType: "textAndLink",
      constantValue: {
        ctaType: "textAndLink",
        label: {
          en: "Get Started",
          hasLocalizedValue: "true",
        },
        link: "/get-started",
        linkType: "URL",
      },
    },
  } as unknown as TestBannerAuthoredProps,
  render:
    TestBannerComponent as unknown as PuckComponent<TestBannerAuthoredProps>,
};
