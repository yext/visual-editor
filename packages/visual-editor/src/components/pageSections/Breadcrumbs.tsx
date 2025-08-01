import { useTranslation } from "react-i18next";
import {
  useTemplateProps,
  MaybeLink,
  PageSection,
  YextField,
  VisibilityWrapper,
  msg,
  TranslatableString,
  TranslatableStringField,
  BackgroundStyle,
  backgroundColors,
  resolveComponentData,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { StreamDocument } from "../../utils/applyTheme";

export interface BreadcrumbsData {
  /**
   * The display label for the first link in the breadcrumb trail (the top-level directory page).
   * @defaultValue "Directory Root"
   */
  directoryRoot: TranslatableString;
}

export interface BreadcrumbsStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
}

/**
 * @public Defines the complete set of properties for the BreadcrumbsSection component.
 */
export interface BreadcrumbsSectionProps {
  /**
   * This object contains the content used by the component.
   * @propCategory Data Props
   */
  data: BreadcrumbsData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: BreadcrumbsStyles;

  /**
   * @internal
   */
  analytics?: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const breadcrumbsSectionFields: Fields<BreadcrumbsSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      directoryRoot: TranslatableStringField(
        msg("fields.directoryRootLinkLabel", "Directory Root Link Label"),
        { types: ["type.string"] }
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
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

// getDirectoryParents returns an array of objects. If no dm_directoryParents or children of
// the directory parent are not the expected objects, returns an empty array.
const getDirectoryParents = (
  streamDocument: StreamDocument
): Array<{ slug: string; name: string }> => {
  for (const key in streamDocument) {
    if (
      key.startsWith("dm_directoryParents_") &&
      isValidDirectoryParents(streamDocument[key])
    ) {
      return streamDocument[key];
    }
  }
  return [];
};

// isValidDirectoryParents returns true if the array from dm_directoryParents
// matches this type: Array<{ slug: string; name: string }>
function isValidDirectoryParents(value: any[]): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        typeof item?.name === "string" &&
        typeof item?.slug === "string"
    )
  );
}

// BreadcrumbsComponent renders breadcrumbs for DM related pages.
// If there are no dm_directoryParents nor dm_directoryChildren,
// then displays nothing. In the case of a root DM page, there are
// no dm_directoryParents but there are dm_directoryChildren so
// that root entity's name will be in the breadcrumbs.
export const BreadcrumbsComponent = ({
  data,
  styles,
}: BreadcrumbsSectionProps) => {
  const { t, i18n } = useTranslation();
  const separator = "/";
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();
  let breadcrumbs = getDirectoryParents(streamDocument);
  if (breadcrumbs?.length > 0 || streamDocument.dm_directoryChildren) {
    // append the current and filter out missing or malformed data
    breadcrumbs = [
      ...breadcrumbs,
      { name: streamDocument.name, slug: "" },
    ].filter((b) => b.name);
  }
  const directoryRoot = resolveComponentData(
    data.directoryRoot,
    i18n.language,
    streamDocument
  );

  if (!breadcrumbs?.length) {
    return <PageSection></PageSection>;
  }

  return (
    <PageSection
      as={"nav"}
      verticalPadding="sm"
      aria-label={t("breadcrumb", "Breadcrumb")}
      background={styles?.backgroundColor}
    >
      <ol className="inline p-0 m-0 list-none">
        {breadcrumbs.map(({ name, slug }, idx) => {
          const isRoot = idx === 0;
          const isLast = idx === breadcrumbs.length - 1;
          const href = relativePrefixToRoot
            ? relativePrefixToRoot + slug
            : slug;

          return (
            <li key={idx} className="contents whitespace-normal break-words">
              {!isRoot && (
                <span className="mx-2" aria-hidden>
                  {separator}
                </span>
              )}

              {/* encourage the browser to break after a full breadcrumb, if necessary */}
              <wbr />

              <MaybeLink
                eventName={`link${idx}`}
                href={isLast ? "" : href}
                className="inline text-body-sm-fontSize font-link-fontWeight font-link-fontFamily whitespace-normal break-words"
                alwaysHideCaret
              >
                {isRoot && directoryRoot ? directoryRoot : name}
              </MaybeLink>
            </li>
          );
        })}
      </ol>
    </PageSection>
  );
};

/**
 * The Breadcrumbs component automatically generates and displays a navigational hierarchy based on a page's position within a Yext directory structure. It renders a list of links showing the path from the main directory root to the current page, helping users understand their location on the site.
 * Available on Location templates.
 */
export const BreadcrumbsSection: ComponentConfig<BreadcrumbsSectionProps> = {
  label: msg("components.breadcrumbs", "Breadcrumbs"),
  fields: breadcrumbsSectionFields,
  defaultProps: {
    data: {
      directoryRoot: {
        en: "Directory Root",
        hasLocalizedValue: "true",
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    analytics: {
      scope: "breadcrumbs",
    },
    liveVisibility: true,
  },
  render: (props) => {
    return (
      <AnalyticsScopeProvider name={props?.analytics?.scope ?? "breadcrumbs"}>
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
          iconSize="md"
        >
          <BreadcrumbsComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  },
};
