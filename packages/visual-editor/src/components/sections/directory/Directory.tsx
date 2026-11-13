import { type SurfaceValue } from "../../../utils/themeOptions.ts";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import { ThemeColor } from "../../../utils/themeOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { Background } from "../../atoms/background.tsx";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { BreadcrumbsSectionProps } from "../Breadcrumbs.tsx";
import { PuckComponent, setDeep, Slot } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { DirectoryList } from "./DirectoryWrapper.tsx";
import { isDirectoryGrid } from "../../../utils/directory/utils.ts";
import {
  toPuckFields,
  YextComponentConfig,
  YextFields,
} from "../../../fields/fields.ts";

export interface DirectoryStyles {
  /**
   * The background color for the directory page heading area.
   * @defaultValue Background Color 1
   */
  backgroundColor?: SurfaceValue;

  /**
   * The background color for the directory list area.
   * @defaultValue Background Color 1
   */
  listBackgroundColor?: SurfaceValue;

  /**
   * The color of links in the directory list layout.
   */
  linkColor?: ThemeColor;

  /**
   * The casing of directory list labels. Default uses the link theme transform,
   * falling back to title case.
   * @defaultValue default
   */
  textTransform?: "none" | "default" | "lowercase" | "uppercase" | "capitalize";
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

const directoryFields: YextFields<DirectoryProps> = {
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "surface",
        label: msg("fields.headingBackgroundColor", "Heading Background Color"),
        allowInherit: false,
      },
      listBackgroundColor: {
        type: "surface",
        label: msg(
          "fields.directoryListBackgroundColor",
          "Directory List Background Color"
        ),
        allowInherit: false,
      },
      linkColor: {
        type: "basicSelector",
        label: msg("fields.linkColor", "Link Color"),
        options: "SITE_COLOR",
      },
      textTransform: {
        type: "select",
        label: msg("theme.textTransform.textTransform", "Text Transform"),
        options: [
          { label: msg("fields.options.none", "None"), value: "none" },
          { label: msg("fields.options.default", "Default"), value: "default" },
          {
            label: msg("theme.textTransform.lowercase", "Lowercase"),
            value: "lowercase",
          },
          {
            label: msg("theme.textTransform.uppercase", "Uppercase"),
            value: "uppercase",
          },
          {
            label: msg("theme.textTransform.capitalize", "Capitalize"),
            value: "capitalize",
          },
        ],
      },
    },
  },
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
  analytics: {
    type: "object",
    label: msg("fields.analytics", "Analytics"),
    visible: false,
    objectFields: {
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  },
};

const DirectoryComponent: PuckComponent<DirectoryProps> = ({
  styles,
  slots,
}) => {
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  return (
    <Background background={styles.backgroundColor}>
      <slots.BreadcrumbsSlot style={{ height: "auto" }} />
      <PageSection
        surfaceRole="inherit"
        className="flex flex-col items-center gap-2"
      >
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
            streamDocument={streamDocument}
            directoryChildren={streamDocument.dm_directoryChildren}
            relativePrefixToRoot={relativePrefixToRoot ?? ""}
            linkColor={styles.linkColor}
            textTransform={styles.textTransform}
            backgroundColor={styles.listBackgroundColor}
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
export const Directory: YextComponentConfig<DirectoryProps> = {
  label: msg("components.directory", "Directory"),
  fields: directoryFields,
  resolveData: (data) => {
    for (const [slot, tag, role] of [
      ["TitleSlot", 1, "headline"],
      ["SiteNameSlot", "p", "eyebrow"],
    ] as const) {
      if (data.props.slots[slot]?.[0]) {
        data = setDeep(
          data,
          `props.slots.${slot}[0].props.styles.semanticLevelOverride`,
          tag
        );
        data = setDeep(
          data,
          `props.slots.${slot}[0].props.parentStyles.typographyRole`,
          role
        );
      }
    }
    return data;
  },
  resolveFields: (data, params) => {
    if (
      params.metadata.streamDocument?.dm_directoryChildren &&
      isDirectoryGrid(params.metadata.streamDocument.dm_directoryChildren)
    ) {
      const updatedFields = setDeep(
        directoryFields,
        "styles.objectFields.listBackgroundColor.visible",
        false
      );
      const listFieldsHidden = setDeep(
        updatedFields,
        "styles.objectFields.linkColor.visible",
        false
      );
      return toPuckFields(
        setDeep(
          listFieldsHidden,
          "styles.objectFields.textTransform.visible",
          false
        )
      );
    }
    return toPuckFields(directoryFields);
  },
  defaultProps: {
    styles: {
      backgroundColor: "page",
      listBackgroundColor: "page",
      textTransform: "default",
    },
    slots: {
      TitleSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: { defaultValue: "" },
                constantValueEnabled: false,
                field: "name",
              },
            },
            styles: { level: 1, align: "center" },
          } satisfies HeadingTextProps,
        },
      ],
      SiteNameSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: { defaultValue: "" },
                constantValueEnabled: true,
                field: "name",
              },
            },
            styles: { level: 2, semanticLevelOverride: "p", align: "center" },
            parentStyles: { typographyRole: "eyebrow" },
          } satisfies HeadingTextProps,
        },
      ],
      BreadcrumbsSlot: [
        {
          type: "BreadcrumbsSlot",
          props: {
            data: {
              directoryRoot: { defaultValue: "Directory Root" },
              currentPage: {
                constantValue: { defaultValue: "[[name]]" },
                field: "name",
                constantValueEnabled: false,
              },
            },
            styles: {
              backgroundColor: "page",
              showCurrentPage: true,
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
            data: {
              field: "dm_directoryChildren",
              constantValueEnabled: false,
              constantValue: [],
              mappings: {
                cardTitle: {
                  field: "name",
                  constantValueEnabled: false,
                  constantValue: undefined,
                },
              },
            },
            styles: {
              backgroundColor: "page",
            },
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
