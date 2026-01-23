import {
  ArrayField,
  ComponentConfig,
  Fields,
  PuckComponent,
  registerOverlayPortal,
} from "@measured/puck";
import {
  CTA,
  msg,
  pt,
  resolveComponentData,
  themeManagerCn,
  TranslatableCTA,
  useDocument,
  useOverflow,
  YextField,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown";
import { FaBars } from "react-icons/fa6";
import { linkTypeOptions } from "../../internal/puck/constant-value-fields/CallToAction";
import React, { useRef, useState } from "react";
import { get } from "http";

export type HeaderLinksProps = {
  data: {
    links: TranslatableCTA[];
    collapsedLinks: TranslatableCTA[];
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
    linkType: {
      label: pt("fields.linkType", "Link Type"),
      type: "select",
      options: linkTypeOptions(),
    },
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
    const { i18n } = useTranslation();
    return (
      resolveComponentData(item.label, i18n.language) ||
      pt("Link", "Link") + " " + ((i ?? 0) + 1)
    );
  },
};

const headerLinksFields: Fields<HeaderLinksProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      links: YextField(msg("fields.links", "Links"), linkFieldConfig),
      collapsedLinks: YextField(
        msg("fields.alwaysCollapsedLinks", "Always Collapsed Links"),
        linkFieldConfig
      ),
    },
  }),
};

const getWindow = (): Window | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const iframe = document.getElementById(
    "preview-frame"
  ) as HTMLIFrameElement | null;
  if (iframe) {
    return iframe?.contentWindow;
  }

  return window;
};

const HeaderLinksComponent: PuckComponent<HeaderLinksProps> = ({
  data,
  parentData,
  puck,
}) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const type = parentData?.type || "Primary";
  const isSecondary = type === "Secondary";

  const navRef = React.useRef<HTMLDivElement | null>(null);
  const measureContainerRef = React.useRef<HTMLUListElement | null>(null);
  const linkRefs = useRef<Array<HTMLLIElement | null>>([]);
  const hamburgerButtonRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(data.links?.length || 0);
  // const [windowWidth, setWindowWidth] = useState(0);

  const isOverflow = useOverflow(navRef, measureContainerRef);

  if (isSecondary) {
    console.log(
      "navRef",
      navRef.current,
      "measureContainerRef:",
      measureContainerRef,
      "isOverflow:",
      isOverflow
    );
  }
  React.useEffect(
    () => registerOverlayPortal(hamburgerButtonRef.current),
    [hamburgerButtonRef.current]
  );

  // const measure = () => {
  //   if (styles.alwaysCollapse || !isSecondary) {
  //     return;
  //   }

  //   const w = getWindow();
  //   setWindowWidth(w?.innerWidth || 0);

  //   requestAnimationFrame(() => {
  //     const linkWidths = linkRefs.current.map(
  //       (l) => l?.getBoundingClientRect().width || 0
  //     );
  //     console.log(linkRefs, "linkWidths:", linkWidths);

  //     const gapWidth = 24;
  //     const hamburgerWidth = 16;
  //     const navWidth =
  //       (navRef.current?.offsetWidth || 0) - gapWidth - hamburgerWidth;

  //     let total = 0;
  //     let fitCount = linkWidths.length;

  //     for (let i = 0; i < linkWidths.length; i++) {
  //       total += linkWidths[i] + gapWidth;

  //       if (total > navWidth) {
  //         fitCount = i;
  //         break;
  //       }
  //     }

  //     setVisibleCount(fitCount);
  //   });
  // };

  // React.useEffect(() => {
  //   measure();

  //   const w = getWindow();
  //   if (!w) {
  //     return;
  //   }

  //   w.addEventListener("resize", measure);
  //   return () => {
  //     w.removeEventListener("resize", measure);
  //   };
  // }, [data.links, styles.alwaysCollapse, isSecondary]);

  const renderLink = (
    item: TranslatableCTA,
    index: number,
    ctaType: string
  ) => (
    <CTA
      variant={
        type === "Primary"
          ? "headerFooterMainLink"
          : "headerFooterSecondaryLink"
      }
      openInNewTab={item.openInNewTab}
      eventName={`cta.${ctaType}.${index}`}
      label={resolveComponentData(item.label, i18n.language, streamDocument)}
      linkType={item.linkType}
      link={resolveComponentData(item.link, i18n.language, streamDocument)}
      className="justify-start w-full text-left text-wrap break-words"
    />
  );

  const validLinks = data.links?.filter((item) => !!item?.link) || [];

  if (validLinks.length === 0) {
    if (puck.isEditing) {
      return (
        <nav
          aria-label={
            type === "Primary"
              ? pt("primaryHeaderLinks", "Primary Header Links")
              : pt("secondaryHeaderLinks", "Secondary Header Links")
          }
        >
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
  const windowWidth = navRef.current?.clientWidth || 1000;

  if (isSecondary) {
    console.log("windowWidth:", windowWidth, "visibleCount:", visibleCount);
    // console.log("validLinks", validLinks);
    console.log(
      "sliced",
      validLinks
        .slice(0, windowWidth <= 360 ? undefined : visibleCount)
        .concat(windowWidth <= 360 ? data.collapsedLinks : [])
    );
    // console.log(
    //   "show",
    //   !styles?.alwaysCollapse || windowWidth >= 360 || !isSecondary
    // );
  }

  return (
    <nav
      ref={navRef}
      className="flex md:gap-6 md:items-center justify-end"
      aria-label={
        type === "Primary"
          ? pt("primaryHeaderLinks", "Primary Header Links")
          : pt("secondaryHeaderLinks", "Secondary Header Links")
      }
    >
      {/* Measure div */}
      <ul
        ref={measureContainerRef}
        className="flex flex-col md:flex-row w-fit sm:w-auto gap-0 md:gap-6 md:items-center absolute top-0 left-[-9999px] invisible"
      >
        {validLinks.map((item, index) => {
          return (
            <li
              key={`${type.toLowerCase()}.${index}`}
              ref={(el) => (linkRefs.current[index] = el)}
              className={themeManagerCn("py-4 md:py-0")}
            >
              {renderLink(item, index, type.toLowerCase())}
            </li>
          );
        })}
      </ul>

      {/* Visible div */}
      {(!isSecondary || windowWidth <= 360 || !isOverflow) && (
        <ul className="flex flex-col md:flex-row w-full sm:w-auto gap-0 md:gap-6 md:items-center justify-end">
          {validLinks
            .concat(windowWidth <= 360 ? data.collapsedLinks : [])
            .map((item, index) => {
              return (
                <li
                  key={`${type.toLowerCase()}.${index}`}
                  className={"py-4 md:py-0"}
                >
                  {renderLink(item, index, type.toLowerCase())}
                </li>
              );
            })}
        </ul>
      )}

      {isSecondary &&
        (isOverflow || data.collapsedLinks.length > 0) &&
        windowWidth > 360 && (
          <div className="hidden md:block py-4 md:py-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex flex-row md:items-center gap-4 justify-between w-full"
                aria-label={t(
                  "showAdditionalHeaderLinks",
                  "Show additional header links"
                )}
              >
                <div
                  ref={hamburgerButtonRef}
                  className="flex gap-4 items-center"
                >
                  <FaBars />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border rounded shadow-md p-2 min-w-[200px] z-[9999]">
                {([] as typeof validLinks)
                  .concat(isOverflow ? validLinks : [])
                  .concat(data.collapsedLinks)
                  .map((item, index) => (
                    <DropdownMenuItem
                      key={`overflow-${index}`}
                      className={`cursor-pointer p-2 text-body-sm-fontSize hover:bg-gray-100 ${puck.isEditing ? "pointer-events-none" : "pointer-events-auto"}`}
                    >
                      {renderLink(item, visibleCount + index, "overflow")}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
    </nav>
  );
};

export const defaultHeaderLinkProps: HeaderLinksProps = {
  data: {
    links: [defaultLink, defaultLink, defaultLink],
    collapsedLinks: [],
  },
};

export const HeaderLinks: ComponentConfig<{ props: HeaderLinksProps }> = {
  label: msg("components.headerLinks", "Header Links"),
  fields: headerLinksFields,
  defaultProps: defaultHeaderLinkProps,
  render: (props) => <HeaderLinksComponent {...props} />,
};
