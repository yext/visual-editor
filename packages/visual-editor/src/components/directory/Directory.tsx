import { useTemplateProps } from "../../hooks/useDocument";
import { backgroundColors, BackgroundStyle } from "../../utils/themeConfigOptions";
import { PageSection } from "../atoms/pageSection";
import { msg } from "../../utils/i18n/platform";
import { YextField } from "../../editor/YextField";
import { Background } from "../atoms/background";
import { HeadingTextProps } from "../contentBlocks/HeadingText";
import { BreadcrumbsSectionProps } from "../pageSections/Breadcrumbs";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { DirectoryList } from "./DirectoryWrapper";
import { isDirectoryGrid } from "../../utils/directory/utils";

export interface DirectoryStyles {
  /**
   * The main background color for the directory page content.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
}

export interface DirectoryProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: DirectoryStyles;

  /** @internal */
  slots: {
    TitleSlot: Slot;
    SiteNameSlot: Slot;
    BreadcrumbsSlot: Slot;
    DirectoryGrid: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };
}

const directoryFields: Fields<DirectoryProps> = {
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
  slots: {
    type: "object",
    objectFields: {
      TitleSlot: { type: "slot", allow: [] },
      SiteNameSlot: { type: "slot", allow: [] },
      BreadcrumbsSlot: { type: "slot", allow: [] },
      DirectoryGrid: { type: "slot", allow: [] },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
};

const DirectoryComponent: PuckComponent<DirectoryProps> = ({
  styles,
  slots,
}) => {
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  return (
    <Background background={styles.backgroundColor}>
      <slots.BreadcrumbsSlot style={{ height: "auto" }} />
      <PageSection className="flex flex-col items-center gap-2">
        <slots.SiteNameSlot style={{ height: "auto", width: "100%" }} />
        <slots.TitleSlot style={{ height: "auto", width: "100%" }} />
      </PageSection>
      {streamDocument.dm_directoryChildren &&
        isDirectoryGrid(streamDocument.dm_directoryChildren) && (
          <slots.DirectoryGrid style={{ height: "auto" }} />
        )}
      {streamDocument.dm_directoryChildren &&
        !isDirectoryGrid(streamDocument.dm_directoryChildren) && (
          <DirectoryList
            directoryChildren={streamDocument.dm_directoryChildren}
            relativePrefixToRoot={relativePrefixToRoot ?? ""}
            level={streamDocument?.meta?.entityType?.id}
          />
        )}
    </Background>
  );
};

/**
 * The Directory Page component serves as a navigational hub,
 * displaying a list of child entities within a hierarchical structure
 * (e.g., a list of states in a country, or cities in a state).
 * It includes breadcrumbs for easy navigation and renders each child item as a distinct card.
 * Available on Directory templates.
 */
export const Directory: ComponentConfig<{ props: DirectoryProps }> = {
  label: msg("components.directory", "Directory"),
  fields: directoryFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      TitleSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "[[name]]",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "center" },
          } satisfies HeadingTextProps,
        },
      ],
      SiteNameSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "name",
              },
            },
            styles: { level: 4, align: "center" },
          } satisfies HeadingTextProps,
        },
      ],
      BreadcrumbsSlot: [
        {
          type: "BreadcrumbsSlot",
          props: {
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
              scope: "directory",
            },
            liveVisibility: true,
          } satisfies BreadcrumbsSectionProps,
        },
      ],
      DirectoryGrid: [
        {
          type: "DirectoryGrid",
          props: {
            slots: {
              CardSlot: [],
            },
          },
        },
      ],
    },
    analytics: {
      scope: "directory",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props?.analytics?.scope ?? "directory"}>
      <DirectoryComponent {...props} />
    </AnalyticsScopeProvider>
  ),
};
