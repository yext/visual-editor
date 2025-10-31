import * as React from "react";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@measured/puck";
import {
  YextField,
  msg,
  BackgroundStyle,
  PageSection,
  PageSectionProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { defaultCopyrightMessageSlotProps } from "./CopyrightMessageSlot.tsx";

const defaultLink = {
  linkType: "URL" as const,
  label: {
    en: "Footer Link",
    hasLocalizedValue: "true" as const,
  },
  link: "#",
};

const defaultLinks = [
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
];

export interface SecondaryFooterSlotProps {
  /**
   * Data configuration for the secondary footer.
   * @propCategory Data Props
   */
  data: {
    /** Whether to hide or show the secondary footer */
    show: boolean;
  };

  /**
   * Styling configuration for the secondary footer.
   * @propCategory Style Props
   */
  styles: {
    backgroundColor?: BackgroundStyle;
    linksAlignment: "left" | "right";
  };

  /** @internal */
  slots: {
    SecondaryLinksWrapperSlot: Slot;
    CopyrightSlot: Slot;
  };

  /** The maximum width inherited from parent. @internal */
  maxWidth?: PageSectionProps["maxWidth"];
}

const secondaryFooterSlotFields: Fields<SecondaryFooterSlotProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      show: YextField(msg("fields.show", "Show"), {
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      }),
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
      linksAlignment: YextField(
        msg("fields.linksAlignment", "Links Alignment"),
        {
          type: "radio",
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
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      SecondaryLinksWrapperSlot: { type: "slot" },
      CopyrightSlot: { type: "slot" },
    },
    visible: false,
  },
  maxWidth: {
    type: "text",
    visible: false,
  },
};

const SecondaryFooterSlotWrapper: PuckComponent<SecondaryFooterSlotProps> = ({
  data,
  styles,
  slots,
  maxWidth = "theme",
  puck,
}) => {
  const { show } = data;
  const { backgroundColor, linksAlignment } = styles;
  const { t } = useTranslation();

  // In edit mode, show minimal clickable placeholder when hidden
  if (puck.isEditing && !show) {
    return (
      <div
        ref={puck.dragRef}
        className="border-2 border-dashed border-gray-400 bg-gray-100 p-4 opacity-50 min-h-[60px] flex items-center justify-center cursor-pointer"
      >
        <p className="text-sm text-gray-600">
          {t(
            "secondaryFooter.hiddenOnLivePage",
            "Secondary Footer (Hidden on live page)"
          )}
        </p>
      </div>
    );
  }

  // If not shown and not editing, return nothing
  if (!show) {
    return <></>;
  }

  return (
    <PageSection
      ref={puck.dragRef}
      verticalPadding={"footerSecondary"}
      background={backgroundColor}
      maxWidth={maxWidth}
      className={`flex flex-col gap-5`}
    >
      <slots.SecondaryLinksWrapperSlot style={{ height: "auto" }} allow={[]} />
      <div
        className={`text-center ${linksAlignment === "left" ? "md:text-left" : "md:text-right"}`}
      >
        <slots.CopyrightSlot style={{ height: "auto" }} allow={[]} />
      </div>
    </PageSection>
  );
};

/**
 * The Secondary Footer Slot is a sub-section of the Expanded Footer that contains copyright information and secondary links.
 */
export const SecondaryFooterSlot: ComponentConfig<{
  props: SecondaryFooterSlotProps;
}> = {
  label: msg("components.secondaryFooter", "Secondary Footer"),
  fields: secondaryFooterSlotFields,
  defaultProps: {
    data: {
      show: true,
    },
    styles: {
      linksAlignment: "left",
    },
    slots: {
      SecondaryLinksWrapperSlot: [
        {
          type: "FooterLinksSlot",
          props: {
            data: {
              links: defaultLinks,
            },
            variant: "secondary",
            eventNamePrefix: "secondary",
            alignment: "left",
          },
        },
      ],
      CopyrightSlot: [
        {
          type: "CopyrightMessageSlot",
          props: defaultCopyrightMessageSlotProps,
        },
      ],
    },
  },
  resolveFields: (_data, { fields }) => {
    const showSecondaryFooter = _data.props.data.show;

    if (!showSecondaryFooter) {
      // Hide styles when secondary footer is not shown
      return {
        ...fields,
        styles: {
          ...fields.styles,
          visible: false,
        },
      };
    }

    return fields;
  },
  resolveData: async (data) => {
    const hiddenProps: string[] = [];

    // Track hidden fields for locale warnings
    if (!data.props.data?.show) {
      hiddenProps.push("data");
    }

    // Pass alignment to SecondaryLinksWrapperSlot based on parent styles
    const secondaryLinksAlignment =
      data?.props?.styles?.linksAlignment || "left";

    if (
      data?.props?.slots?.SecondaryLinksWrapperSlot &&
      Array.isArray(data.props.slots.SecondaryLinksWrapperSlot)
    ) {
      data.props.slots.SecondaryLinksWrapperSlot =
        data.props.slots.SecondaryLinksWrapperSlot.map((slot: any) => ({
          ...slot,
          props: {
            ...slot.props,
            alignment: secondaryLinksAlignment,
          },
        }));
    }

    return {
      ...data,
      props: {
        ...data.props,
        ignoreLocaleWarning: hiddenProps,
      },
    };
  },
  inline: true,
  render: (props) => <SecondaryFooterSlotWrapper {...props} />,
};
