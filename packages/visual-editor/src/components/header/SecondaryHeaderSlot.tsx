import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { PageSection, PageSectionProps } from "../atoms/pageSection.tsx";
import {
  LanguageDropdown,
  parseDocumentForLanguageDropdown,
} from "./languageDropdown.tsx";
import { defaultHeaderLinkProps, HeaderLinksProps } from "./HeaderLinks.tsx";
import {
  useExpandedHeaderMenu,
  useHeaderLinksDisplayMode,
} from "./ExpandedHeaderMenuContext.tsx";
import { pt } from "../../utils/i18n/platform.ts";
import { useOverflow } from "../../hooks/useOverflow.ts";
import * as React from "react";

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
  const displayMode = useHeaderLinksDisplayMode();
  const menuContext = useExpandedHeaderMenu();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isOverflow = useOverflow(containerRef, contentRef, 0);

  const languageDropDownProps =
    parseDocumentForLanguageDropdown(streamDocument);
  const showLanguageSelector =
    languageDropDownProps && languageDropDownProps.locales?.length > 1;

  const { show } = data;
  // Hide the secondary header on live pages if it overflows.
  const hideSecondaryHeader =
    !puck.isEditing && displayMode === "inline" && isOverflow;

  React.useEffect(() => {
    if (!menuContext || displayMode !== "inline") {
      return;
    }

    // Report overflow state to the expanded header menu.
    if (!show) {
      menuContext.setSecondaryOverflow(false);
      return;
    }

    menuContext.setSecondaryOverflow(isOverflow);
    return () => menuContext.setSecondaryOverflow(false);
  }, [menuContext, displayMode, isOverflow, show]);

  if (puck.isEditing && !show) {
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

  if (!show) {
    return <></>;
  }

  return (
    <PageSection
      maxWidth={parentStyles?.maxWidth}
      verticalPadding={hideSecondaryHeader ? "none" : "sm"}
      background={styles.backgroundColor}
      className="w-full"
      outerStyle={
        hideSecondaryHeader
          ? {
              height: 0,
              overflow: "hidden",
              visibility: "hidden",
              pointerEvents: "none",
            }
          : undefined
      }
      aria-hidden={hideSecondaryHeader}
    >
      <div ref={containerRef} className="w-full">
        <div
          className={
            displayMode === "menu"
              ? "flex flex-col items-start gap-4"
              : "md:flex md:justify-end md:gap-6 md:items-center"
          }
        >
          <slots.LinksSlot style={{ height: "auto", width: "100%" }} />
          {data.showLanguageDropdown && showLanguageSelector && (
            <LanguageDropdown {...languageDropDownProps} />
          )}
        </div>
      </div>
      {displayMode === "inline" && (
        <div
          ref={contentRef}
          className="absolute top-0 left-[-9999px] invisible pointer-events-none flex flex-row items-center gap-6 w-max"
          aria-hidden="true"
        >
          {/* Offscreen measurement container for overflow detection. */}
          <div className="flex-shrink-0 w-max">
            <slots.LinksSlot style={{ height: "auto", width: "auto" }} />
          </div>
          {data.showLanguageDropdown && showLanguageSelector && (
            <div className="flex-shrink-0 w-max">
              <LanguageDropdown {...languageDropDownProps} />
            </div>
          )}
        </div>
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
          styles: {
            align: "right",
            variant: "xs",
          },
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
