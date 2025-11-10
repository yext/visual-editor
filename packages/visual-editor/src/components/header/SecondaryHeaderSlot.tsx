import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  YextField,
  msg,
  BackgroundStyle,
  backgroundColors,
  useDocument,
  PageSection,
  PageSectionProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  LanguageDropdown,
  parseDocumentForLanguageDropdown,
} from "./languageDropdown";
import { defaultHeaderLinkProps, HeaderLinksProps } from "./HeaderLinks";

export interface SecondaryHeaderSlotProps {
  data: {
    show: boolean;
    showLanguageDropdown: boolean;
  };

  styles: {
    backgroundColor?: BackgroundStyle;
  };

  parentStyles?: {
    maxWidth?: PageSectionProps["maxWidth"];
  };

  /** @internal */
  slots: {
    LinksSlot: Slot;
  };
}

const secondaryHeaderSlotFields: Fields<SecondaryHeaderSlotProps> = {
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
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
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
  const { t } = useTranslation();

  const languageDropDownProps =
    parseDocumentForLanguageDropdown(streamDocument);
  const showLanguageSelector =
    languageDropDownProps && languageDropDownProps.locales?.length > 1;

  const { show } = data;

  if (puck.isEditing && !show) {
    return (
      <div
        ref={puck.dragRef}
        className="border-2 border-dashed border-gray-400 bg-gray-100 p-4 opacity-50 min-h-[60px] flex items-center justify-center cursor-pointer"
      >
        <p className="text-sm text-gray-600">
          {t(
            "secondaryHeader.hiddenOnLivePage",
            "Secondary Header (Hidden on live page)"
          )}
        </p>
      </div>
    );
  }

  if (!show) {
    return <></>;
  }

  return (
    <PageSection
      ref={puck.dragRef}
      maxWidth={parentStyles?.maxWidth}
      verticalPadding={"sm"}
      background={styles.backgroundColor}
      className="md:flex md:justify-end md:gap-6 md:items-center"
    >
      <slots.LinksSlot style={{ height: "auto" }} />
      {data.showLanguageDropdown && showLanguageSelector && (
        <LanguageDropdown {...languageDropDownProps} />
      )}
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
          parentData: {
            type: "Secondary",
          },
        } satisfies HeaderLinksProps,
      },
    ],
  },
};

export const SecondaryHeaderSlot: ComponentConfig<{
  props: SecondaryHeaderSlotProps;
}> = {
  label: msg("components.secondaryHeader", "Secondary Header"),
  fields: secondaryHeaderSlotFields,
  defaultProps: defaultSecondaryHeaderProps,
  render: (props) => <SecondaryHeaderSlotWrapper {...props} />,
};
