import * as React from "react";
import {
  ComponentConfig,
  Fields,
  Slot,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { PageSection, PageSectionProps } from "../atoms/pageSection.tsx";
import { defaultCopyrightMessageSlotProps } from "./CopyrightMessageSlot.tsx";

const defaultLink = {
  linkType: "URL" as const,
  label: { defaultValue: "Footer Link" },
  link: "#",
  openInNewTab: false,
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
   * Styling configuration for the secondary footer.
   * @propCategory Style Props
   */
  styles: {
    backgroundColor?: ThemeColor;
    desktopContentAlignment: "left" | "center" | "right";
    mobileContentAlignment: "left" | "center" | "right";
    showLinks: boolean;
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
      desktopContentAlignment: YextField(
        msg("fields.desktopContentAlignment", "Desktop Content Alignment"),
        {
          type: "radio",
          options: "ALIGNMENT",
        }
      ),
      mobileContentAlignment: YextField(
        msg("fields.mobileContentAlignment", "Mobile Content Alignment"),
        {
          type: "radio",
          options: "ALIGNMENT",
        }
      ),
      showLinks: YextField(msg("fields.showLinks", "Show Links"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
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
  styles,
  slots,
  maxWidth = "theme",
  puck,
}) => {
  const { backgroundColor } = styles;

  return (
    <PageSection
      ref={puck.dragRef}
      verticalPadding={"footerSecondary"}
      background={backgroundColor}
      maxWidth={maxWidth}
      className={`flex flex-col gap-5`}
    >
      {styles.showLinks && (
        <slots.SecondaryLinksWrapperSlot
          style={{ height: "auto" }}
          allow={[]}
        />
      )}
      <slots.CopyrightSlot style={{ height: "auto" }} allow={[]} />
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
    styles: {
      desktopContentAlignment: "left",
      mobileContentAlignment: "left",
      showLinks: true,
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
            desktopContentAlignment: "left",
            mobileContentAlignment: "left",
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
  resolveData: async (data) => {
    let updatedData = { ...data };

    // Pass alignment to SecondaryLinksWrapperSlot based on parent styles
    if (data.props.slots?.SecondaryLinksWrapperSlot?.[0]?.props) {
      updatedData = setDeep(
        updatedData,
        "props.slots.SecondaryLinksWrapperSlot[0].props.desktopContentAlignment",
        data.props.styles.desktopContentAlignment
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.SecondaryLinksWrapperSlot[0].props.mobileContentAlignment",
        data.props.styles.mobileContentAlignment
      );
    }

    // Pass alignment to CopyrightSlot based on parent styles
    if (data.props.slots?.CopyrightSlot?.[0]?.props) {
      updatedData = setDeep(
        updatedData,
        "props.slots.CopyrightSlot[0].props.desktopContentAlignment",
        data.props.styles.desktopContentAlignment
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CopyrightSlot[0].props.mobileContentAlignment",
        data.props.styles.mobileContentAlignment
      );
    }

    return updatedData;
  },
  inline: true,
  render: (props) => <SecondaryFooterSlotWrapper {...props} />,
};
