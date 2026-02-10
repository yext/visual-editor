import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrayField,
  AutoField,
  ComponentConfig,
  FieldLabel,
  Fields,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { CTA } from "../atoms/cta.tsx";
import { i18nComponentsInstance } from "../../utils/i18n/components.ts";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { TranslatableCTA } from "../../types/types.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { useOverflow } from "../../hooks/useOverflow.ts";
import { usePreviewWindow } from "../../hooks/usePreviewWindow.ts";
import { YextField } from "../../editor/YextField.tsx";
import { linkTypeOptions } from "../../internal/puck/constant-value-fields/CallToAction.tsx";
import {
  useExpandedHeaderMenu,
  useHeaderLinksDisplayMode,
} from "./ExpandedHeaderMenuContext.tsx";
import { getHeaderViewport } from "./viewport.ts";
import { BackgroundStyle } from "../../utils/themeConfigOptions.ts";
import { BodyProps } from "../atoms/body.tsx";

export type HeaderLinksProps = {
  data: {
    links: TranslatableCTA[];
    collapsedLinks: TranslatableCTA[];
  };

  styles: {
    /**
     * Alignment of the header links
     */
    align?: "left" | "center" | "right";

    /**
     * The variant of the header links
     */
    variant?: BodyProps["variant"];

    /**
     * The color of the header links
     */
    color?: BackgroundStyle;

    /**
     * The weight of the header links
     */
    weight?: "normal" | "bold";
  };

  /** @internal data from the parent section */
  parentData?: {
    type: "Primary" | "Secondary";
  };
};

const defaultLink: TranslatableCTA = {
  linkType: "URL",
  label: { en: "Header Link", hasLocalizedValue: "true" },
  link: "#",
  openInNewTab: false,
};

const linkFieldConfig: ArrayField<TranslatableCTA[]> = {
  type: "array",
  arrayFields: {
    label: YextField(msg("fields.label", "Label"), {
      type: "translatableString",
      filter: { types: ["type.string"] },
    }),
    link: YextField(msg("fields.link", "Link"), {
      type: "text",
    }),
    linkType: YextField(msg("fields.linkType", "Link Type"), {
      type: "select",
      options: linkTypeOptions(),
    }),
    openInNewTab: YextField(msg("fields.openInNewTab", "Open in new tab"), {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }),
  },
  defaultItemProps: defaultLink satisfies TranslatableCTA,
  getItemSummary: (item, i) => {
    return (
      resolveComponentData(item.label, i18nComponentsInstance.language) ||
      pt("Link", "Link") + " " + ((i ?? 0) + 1)
    );
  },
};

const headerLinksFields: Fields<HeaderLinksProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      links: {
        type: "custom",
        render: ({ onChange, value }) => {
          const tooltip = pt(
            "fields.linksTooltip",
            "Links will automatically collapse if the viewport is too narrow"
          );
          return (
            <div>
              <FieldLabel
                label={pt("fields.links", "Links")}
                el="div"
                className="mb-3"
              >
                <p className="ve-text-xs ve-mb-3">{tooltip}</p>
                <AutoField
                  value={value}
                  onChange={onChange}
                  field={linkFieldConfig}
                />
              </FieldLabel>
            </div>
          );
        },
      },
      collapsedLinks: YextField(
        msg("fields.collapsedLinks", "Collapsed Links"),
        linkFieldConfig
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      align: YextField(msg("fields.align", "Align"), {
        type: "radio",
        options: "ALIGNMENT",
      }),
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "BODY_VARIANT",
      }),
      color: YextField(msg("fields.color", "Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
      weight: YextField(msg("fields.weight", "Weight"), {
        type: "radio",
        options: [
          { label: msg("fields.options.normal", "Normal"), value: "normal" },
          { label: msg("fields.options.bold", "Bold"), value: "bold" },
        ],
      }),
    },
  }),
};

const HeaderLinksComponent: PuckComponent<HeaderLinksProps> = ({
  data,
  styles,
  parentData,
  puck,
}) => {
  const { i18n, t } = useTranslation();
  const streamDocument = useDocument();

  const navRef = React.useRef<HTMLDivElement | null>(null);
  const measureContainerRef = React.useRef<HTMLUListElement | null>(null);
  const displayMode = useHeaderLinksDisplayMode();
  const menuContext = useExpandedHeaderMenu();
  const primaryOverflow = menuContext?.primaryOverflow ?? false;

  const type = parentData?.type || "Primary";
  const isSecondary = type === "Secondary";
  const validLinks = data.links?.filter((item) => !!item?.link) || [];
  const validAlwaysCollapsedLinks = isSecondary
    ? []
    : data.collapsedLinks?.filter((item) => !!item?.link) || [];
  const previewWindow = usePreviewWindow();
  const [windowWidth, setWindowWidth] = React.useState(
    previewWindow?.innerWidth ?? 1024
  );
  const { isMobile, isTablet, isDesktop } = getHeaderViewport(windowWidth);

  // Keep width in sync with the preview window for menu layout decisions.
  React.useEffect(() => {
    if (!previewWindow) {
      return;
    }

    const updateWidth = () => setWindowWidth(previewWindow.innerWidth);
    updateWidth();
    previewWindow.addEventListener("resize", updateWidth);
    return () => previewWindow.removeEventListener("resize", updateWidth);
  }, [previewWindow]);

  const isOverflow = useOverflow(navRef, measureContainerRef, 0);

  // Base alignment. In menu mode we override to match menu UX.
  let justifyClass = styles?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.align]
    : "justify-end";

  if (displayMode === "menu") {
    justifyClass = isDesktop ? "justify-end" : "justify-start";
  }

  const weightClass = styles?.weight === "bold" ? "font-bold" : "font-normal";

  // Size mapping for the link text.
  const sizeClass = styles?.variant
    ? {
        xs: "text-body-xs-fontSize",
        sm: "text-body-sm-fontSize",
        base: "text-body-fontSize",
        lg: "text-body-lg-fontSize",
      }[styles.variant]
    : "text-body-fontSize";

  const renderLink = (
    item: TranslatableCTA,
    index: number,
    ctaType: string
  ) => {
    return (
      <CTA
        variant={
          type === "Primary"
            ? "headerFooterMainLink"
            : "headerFooterSecondaryLink"
        }
        color={styles?.color}
        openInNewTab={item.openInNewTab}
        eventName={`cta.${ctaType}.${index}`}
        label={resolveComponentData(item.label, i18n.language, streamDocument)}
        linkType={item.linkType}
        link={resolveComponentData(item.link, i18n.language, streamDocument)}
        className={`${justifyClass} ${weightClass} ${sizeClass} w-full text-wrap break-words`}
      />
    );
  };

  React.useEffect(() => {
    if (!menuContext || displayMode !== "inline") {
      return;
    }

    if (!isSecondary) {
      menuContext.setPrimaryHasCollapsedLinks(
        validAlwaysCollapsedLinks.length > 0
      );
      return () => menuContext.setPrimaryHasCollapsedLinks(false);
    }
  }, [
    menuContext,
    displayMode,
    isSecondary,
    isOverflow,
    isTablet,
    isDesktop,
    validAlwaysCollapsedLinks.length,
  ]);

  const shouldShowLinks =
    !isSecondary || displayMode === "menu" || isMobile || !isOverflow;

  // Primary header's menu can show all the links or just collapsed links.
  const linksToRender = React.useMemo(() => {
    if (displayMode !== "menu" || isSecondary) {
      return validLinks;
    }

    const showAll = isMobile || primaryOverflow;
    return showAll
      ? [...validLinks, ...validAlwaysCollapsedLinks]
      : validAlwaysCollapsedLinks;
  }, [
    displayMode,
    isSecondary,
    isMobile,
    primaryOverflow,
    validLinks,
    validAlwaysCollapsedLinks,
  ]);

  const ariaLabel =
    displayMode === "menu"
      ? type === "Primary"
        ? t("primaryHeaderLinksMenu", "Primary Header Links (Menu)")
        : t("secondaryHeaderLinksMenu", "Secondary Header Links (Menu)")
      : type === "Primary"
        ? t("primaryHeaderLinks", "Primary Header Links")
        : t("secondaryHeaderLinks", "Secondary Header Links");

  if (validLinks.concat(validAlwaysCollapsedLinks).length === 0) {
    if (puck.isEditing) {
      return (
        <nav aria-label={ariaLabel}>
          <ul className="flex flex-col md:flex-row gap-0 md:gap-6 md:items-center">
            <li className="py-4 md:py-0">
              <div className="h-5 min-w-[100px]" />
            </li>
          </ul>
        </nav>
      );
    }
    return <></>;
  }

  return (
    <nav
      ref={navRef}
      className={`flex md:gap-6 md:items-center ${justifyClass}`}
      aria-label={ariaLabel}
    >
      {/* Measure list: offscreen but used for overflow detection. */}
      <ul
        ref={measureContainerRef}
        className="flex flex-col md:flex-row w-fit sm:w-auto gap-0 md:gap-6 md:items-center absolute top-0 left-[-9999px] invisible"
      >
        {validLinks.map((item, index) => {
          return (
            <li
              key={`${type.toLowerCase()}.${index}`}
              className={themeManagerCn("py-4 md:py-0")}
            >
              {renderLink(item, index, type.toLowerCase())}
            </li>
          );
        })}
      </ul>

      {/* Visible list */}
      {shouldShowLinks && (
        <ul
          className={`flex flex-col w-full sm:w-auto gap-0 ${
            displayMode === "menu"
              ? isDesktop
                ? "justify-end md:flex-row md:gap-6 md:items-center"
                : "justify-start"
              : `${justifyClass} md:flex-row md:gap-6`
          } ${sizeClass} ${weightClass}`}
        >
          {linksToRender.map((item, index) => {
            return (
              <li
                key={`${type.toLowerCase()}.${index}`}
                className={`py-4 lg:py-0`}
              >
                {renderLink(item, index, type.toLowerCase())}
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};

export const defaultHeaderLinkProps: HeaderLinksProps = {
  data: {
    links: [defaultLink, defaultLink, defaultLink],
    collapsedLinks: [],
  },
  styles: {
    align: "right",
    variant: "sm",
  },
};

export const HeaderLinks: ComponentConfig<{ props: HeaderLinksProps }> = {
  label: msg("components.headerLinks", "Header Links"),
  fields: headerLinksFields,
  resolveFields: (data, params) => {
    return setDeep(
      headerLinksFields,
      "data.objectFields.collapsedLinks.visible",
      params.parent?.type === "PrimaryHeaderSlot"
    );
  },
  defaultProps: defaultHeaderLinkProps,
  render: (props) => <HeaderLinksComponent {...props} />,
};
