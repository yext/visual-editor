import { PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import {
  ThemeColor,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { PageSection, PageSectionProps } from "../atoms/pageSection.tsx";
import {
  LanguageDropdown,
  parseDocumentForLanguageDropdown,
} from "./languageDropdown.tsx";
import { defaultHeaderLinkProps, HeaderLinksProps } from "./HeaderLinks.tsx";
import { pt } from "../../utils/i18n/platform.ts";
import * as React from "react";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

export interface SecondaryHeaderSlotProps {
  data: {
    show: boolean;
    showLanguageDropdown: boolean;
  };

  styles: {
    backgroundColor?: ThemeColor;
  };

  parentStyles?: {
    maxWidth?: PageSectionProps["maxWidth"];
  };

  /** @internal */
  slots: {
    LinksSlot: Slot;
  };
}

const secondaryHeaderSlotFields: YextFields<SecondaryHeaderSlotProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      show: YextField(
        msg("fields.showSecondaryHeader", "Show Secondary Header"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
        }
      ),
      showLanguageDropdown: YextField(
        msg("fields.showLanguageDropdown", "Show Language Dropdown"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
        }
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      LinksSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const SecondaryHeaderSlotWrapper: PuckComponent<SecondaryHeaderSlotProps> = ({
  data,
  styles,
  slots,
  parentStyles,
  puck,
}) => {
  const streamDocument = useDocument();

  const languageDropDownProps = React.useMemo(
    () => parseDocumentForLanguageDropdown(streamDocument),
    [streamDocument]
  );

  const showLanguageSelector =
    data.showLanguageDropdown &&
    languageDropDownProps &&
    languageDropDownProps.locales?.length > 1;

  if (puck.isEditing && !data.show) {
    return (
      <div className="border-2 border-dashed border-gray-400 bg-gray-100 p-4 opacity-50 min-h-[60px] flex items-center justify-center cursor-pointer">
        <p className="text-sm text-gray-600">
          {pt(
            "secondaryHeaderHiddenOnLivePage",
            "Secondary Header (Hidden on live page)"
          )}
        </p>
      </div>
    );
  }

  if (!data.show) {
    return <></>;
  }

  return (
    <PageSection
      maxWidth={parentStyles?.maxWidth}
      verticalPadding={"sm"}
      background={styles.backgroundColor}
      className="w-full"
    >
      <div className="w-full">
        <div className="md:flex md:justify-end md:gap-6 md:items-center">
          <slots.LinksSlot style={{ height: "auto", width: "100%" }} />
          {showLanguageSelector && (
            <LanguageDropdown {...languageDropDownProps} />
          )}
        </div>
      </div>
    </PageSection>
  );
};

export const defaultSecondaryHeaderProps: SecondaryHeaderSlotProps = {
  data: {
    show: true,
    showLanguageDropdown: false,
  },
  styles: {
    backgroundColor: backgroundColors.background2.value,
  },
  slots: {
    LinksSlot: [
      {
        type: "HeaderLinks",
        props: {
          ...defaultHeaderLinkProps,
          styles: {
            align: "right",
            variant: "xs",
            weight: "normal",
          },
          parentData: {
            type: "Secondary",
          },
        } satisfies HeaderLinksProps,
      },
    ],
  },
};

export const SecondaryHeaderSlot: YextComponentConfig<SecondaryHeaderSlotProps> =
  {
    label: msg("components.secondaryHeader", "Secondary Header"),
    fields: secondaryHeaderSlotFields,
    defaultProps: defaultSecondaryHeaderProps,
    render: (props) => <SecondaryHeaderSlotWrapper {...props} />,
  };
