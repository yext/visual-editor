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
import {
  defaultHeaderLinkProps,
  HeaderLinksProps,
  useWindowWidth,
} from "./HeaderLinks.tsx";
import {
  useExpandedHeaderMenu,
  useHeaderLinksDisplayMode,
} from "./ExpandedHeaderMenuContext.tsx";
import { pt } from "../../utils/i18n/platform.ts";
import { useOverflow } from "../../hooks/useOverflow.ts";
import { usePreviewWindow } from "../../hooks/usePreviewWindow.ts";
import { getHeaderViewport } from "./viewport.ts";
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
  const previewWindow = usePreviewWindow();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isOverflow = useOverflow(containerRef, contentRef, 0);

  const windowWidth = useWindowWidth(previewWindow);
  const { isMobile } = getHeaderViewport(windowWidth);

  const languageDropDownProps = React.useMemo(
    () => parseDocumentForLanguageDropdown(streamDocument),
    [streamDocument]
  );

  const showLanguageSelector =
    data.showLanguageDropdown &&
    languageDropDownProps &&
    languageDropDownProps.locales?.length > 1;

  const isMenuMode = displayMode === "menu";
  const hideSecondaryHeader = !isMenuMode && isOverflow;
  const showLanguageSelectorInMenu =
    showLanguageSelector && (isMobile || menuContext.secondaryOverflow);
  const showLanguageSelectorInline = showLanguageSelector && !isMenuMode;

  React.useEffect(() => {
    if (!menuContext || isMenuMode) {
      return;
    }

    // If shown, report actual overflow; if hidden, report false.
    menuContext.setSecondaryOverflow(data.show ? isOverflow : false);

    return () => menuContext.setSecondaryOverflow(false);
  }, [menuContext, isMenuMode, data.show, isOverflow]);

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
            isMenuMode
              ? "flex flex-col items-start gap-4"
              : "md:flex md:justify-end md:gap-6 md:items-center"
          }
        >
          <slots.LinksSlot style={{ height: "auto", width: "100%" }} />
          {(showLanguageSelectorInline ||
            (isMenuMode && showLanguageSelectorInMenu)) && (
            <LanguageDropdown {...languageDropDownProps} />
          )}
        </div>
      </div>

      {/* Measurement Div - Only needed in inline mode */}
      {!isMenuMode && (
        <div
          ref={contentRef}
          className="absolute top-0 left-[-9999px] invisible pointer-events-none flex items-center gap-6 w-max"
          aria-hidden="true"
        >
          <div className="flex-shrink-0 w-max">
            <slots.LinksSlot style={{ height: "auto", width: "auto" }} />
          </div>
          {showLanguageSelector && (
            <div className="flex-shrink-0 w-max">
              <div className="h-5 w-20 bg-gray-200" />{" "}
              {/* Placeholder for language dropdown */}
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
