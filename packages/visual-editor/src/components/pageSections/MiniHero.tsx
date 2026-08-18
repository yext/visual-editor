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

type MiniHeroResolvedProps = {
  data: {
    text: string;
    cta?: React.ReactNode;
  };
  styles: {
    backgroundColor?: ThemeColor;
  };
};

export type MiniHeroAuthoredProps = {
  data: {
    text: YextEntityField<string>;
    cta: YextCTAField;
  };
  styles: {
    backgroundColor?: ThemeColor;
  };
};

const miniHeroFields: YextFields<MiniHeroAuthoredProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      text: {
        type: "testEntityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.string"] },
        output: "plainText",
      },
      cta: {
        type: "testCTA",
        label: msg("fields.cta", "CTA"),
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
    },
  },
};

const MiniHeroComponent: PuckComponent<MiniHeroResolvedProps> = ({
  data,
  styles,
}) => {
  if (!data.text?.trim()) {
    return <></>;
  }

  return (
    <PageSection
      background={styles.backgroundColor}
      verticalPadding="default"
      className="flex flex-col items-start gap-4"
    >
      <p className="text-3xl font-bold">{data.text}</p>
      {data.cta}
    </PageSection>
  );
};

export const MiniHero: YextComponentConfig<MiniHeroAuthoredProps> = {
  label: msg("components.miniHero", "Mini Hero"),
  fields: miniHeroFields,
  defaultProps: {
    data: {
      text: {
        field: "name",
        constantValue: "",
        constantValueEnabled: false,
      },
      cta: {
        field: "",
        constantValue: undefined,
        constantValueEnabled: false,
        selectedType: "textAndLink",
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
  } as unknown as MiniHeroAuthoredProps,
  render: MiniHeroComponent as unknown as PuckComponent<MiniHeroAuthoredProps>,
};
