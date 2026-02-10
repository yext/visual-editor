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

const useWindowWidth = (externalWindow?: Window | null) => {
  const [width, setWidth] = React.useState(externalWindow?.innerWidth ?? 1024);

  React.useLayoutEffect(() => {
    const win = externalWindow || window;
    const handleResize = () => setWidth(win.innerWidth);
    handleResize();
    win.addEventListener("resize", handleResize);
    return () => win.removeEventListener("resize", handleResize);
  }, [externalWindow]);

  return width;
};

const HeaderLinksComponent: PuckComponent<HeaderLinksProps> = ({
  data,
  styles,
  parentData,
  puck,
}) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const previewWindow = usePreviewWindow();

  const navRef = React.useRef<HTMLDivElement | null>(null);
  const measureContainerRef = React.useRef<HTMLUListElement | null>(null);
  const displayMode = useHeaderLinksDisplayMode();
  const menuContext = useExpandedHeaderMenu();

  const windowWidth = useWindowWidth(previewWindow);
  const { isMobile, isDesktop } = getHeaderViewport(windowWidth);
  const isOverflow = useOverflow(navRef, measureContainerRef, 0);

  const type = parentData?.type || "Primary";
  const isSecondary = type === "Secondary";
  const primaryOverflow = menuContext?.primaryOverflow ?? false;
  const ariaLabel =
    displayMode === "menu"
      ? type === "Primary"
        ? t("primaryHeaderLinksMenu", "Primary Header Links (Menu)")
        : t("secondaryHeaderLinksMenu", "Secondary Header Links (Menu)")
      : type === "Primary"
        ? t("primaryHeaderLinks", "Primary Header Links")
        : t("secondaryHeaderLinks", "Secondary Header Links");

  const validLinks = React.useMemo(
    () => data.links?.filter((item) => !!item?.link) || [],
    [data.links]
  );
  const validAlwaysCollapsedLinks = React.useMemo(
    () =>
      isSecondary
        ? []
        : data.collapsedLinks?.filter((item) => !!item?.link) || [],
    [isSecondary, data.collapsedLinks]
  );

  // Derive styles based on display mode and styles props.
  const justifyClass = React.useMemo(() => {
    if (displayMode === "menu") {
      return isDesktop ? "justify-end" : "justify-start";
    }

    const alignmentMap = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };
    return alignmentMap[styles?.align || "right"];
  }, [displayMode, isDesktop, styles?.align]);
  const weightClass = styles?.weight === "bold" ? "font-bold" : "font-normal";
  const sizeClass = styles?.variant
    ? {
        xs: "text-body-xs-fontSize",
        sm: "text-body-sm-fontSize",
        base: "text-body-fontSize",
        lg: "text-body-lg-fontSize",
      }[styles.variant]
    : "text-body-fontSize";

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

  // Update setPrimaryHasCollapsedLinks for menuContext
  React.useEffect(() => {
    if (menuContext && displayMode === "inline" && !isSecondary) {
      menuContext.setPrimaryHasCollapsedLinks(
        validAlwaysCollapsedLinks.length > 0
      );
      return () => menuContext.setPrimaryHasCollapsedLinks(false);
    }
  }, [menuContext, displayMode, isSecondary, validAlwaysCollapsedLinks.length]);

  const renderLink = (item: TranslatableCTA, index: number) => (
    <CTA
      variant={
        !isSecondary ? "headerFooterMainLink" : "headerFooterSecondaryLink"
      }
      color={styles?.color}
      openInNewTab={item.openInNewTab}
      eventName={`cta.${type.toLowerCase()}.${index}`}
      label={resolveComponentData(item.label, i18n.language, streamDocument)}
      linkType={item.linkType}
      link={resolveComponentData(item.link, i18n.language, streamDocument)}
      className={`${justifyClass} ${weightClass} ${sizeClass} w-full text-wrap break-words`}
    />
  );

  // Early return for empty state
  if (validLinks.length + validAlwaysCollapsedLinks.length === 0) {
    return puck.isEditing ? (
      <nav className="h-5 min-w-[100px] opacity-20" />
    ) : (
      <></>
    );
  }

  return (
    <nav
      aria-label={ariaLabel}
      ref={navRef}
      className={`flex md:gap-6 md:items-center ${justifyClass}`}
    >
      {/* Hidden measure list for overflow math */}
      <ul
        ref={measureContainerRef}
        className="flex flex-col md:flex-row absolute top-0 left-[-9999px] invisible"
      >
        {validLinks.map((item, i) => (
          <li key={`measure-${i}`} className="py-4 md:py-0">
            {renderLink(item, i)}
          </li>
        ))}
      </ul>

      {/* Visible list */}
      {(!isSecondary || displayMode === "menu" || isMobile || !isOverflow) && (
        <ul
          className={`flex flex-col w-full sm:w-auto gap-0 ${
            displayMode === "menu"
              ? isDesktop
                ? "md:flex-row md:gap-6 md:items-center justify-end"
                : "justify-start"
              : `${justifyClass} md:flex-row md:gap-6`
          } ${sizeClass} ${weightClass}`}
        >
          {linksToRender.map((item, i) => (
            <li key={`visible-${i}`} className="py-4 lg:py-0">
              {renderLink(item, i)}
            </li>
          ))}
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
