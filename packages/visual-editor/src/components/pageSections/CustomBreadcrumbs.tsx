import { ComponentConfig, Fields, WithPuckProps } from "@puckeditor/core";
import { useDocument } from "../../hooks/useDocument.tsx";
import { StreamDocument } from "../../utils/index.ts";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { PageSection } from "../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { YextField } from "../../editor/YextField.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { useEffect, useState } from "react";

export interface CustomBreadcrumbItem {
  id: string;
  name: string;
  slug: string[];
}

export interface CustomBreadcrumbsData {}

export interface CustomBreadcrumbsStyles {
  backgroundColor?: BackgroundStyle;
}

export interface CustomBreadcrumbsProps {
  data: CustomBreadcrumbsData;
  styles: CustomBreadcrumbsStyles;
  analytics: {
    scope?: string;
  };
  liveVisibility: boolean;

  /** Optional controlled breadcrumbs from parent slot */
  breadcrumbs?: CustomBreadcrumbItem[];

  /** Optional navigation handler from parent */
  onNavigate?: (index: number) => void;
}

const customBreadcrumbFields: Fields<CustomBreadcrumbsProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {},
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

  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),

  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const API_KEY = "d8016f96c913cc8b79931cef51b941f5";
const API_VERSION = "20250101";
const contentEndpoint = "blog";

const CustomBreadcrumbsComponent = ({
  styles,
  puck,
  breadcrumbs,
  onNavigate,
}: WithPuckProps<CustomBreadcrumbsProps>) => {
  const separator = "/";
  const document = useDocument() as StreamDocument;
  console.log(onNavigate);

  const [fetchedBreadcrumbs, setFetchedBreadcrumbs] = useState<
    CustomBreadcrumbItem[]
  >([]);

  const hasControlledBreadcrumbs =
    Array.isArray(breadcrumbs) && breadcrumbs.length > 0;

  const list = hasControlledBreadcrumbs ? breadcrumbs : fetchedBreadcrumbs;

  const hasChildren =
    Array.isArray(document?.dm_childEntityIds) &&
    document.dm_childEntityIds.length > 0;

  useEffect(() => {
    if (hasControlledBreadcrumbs) return;
    if (hasChildren || !document?.uid) return;

    const fetchBreadcrumbs = async () => {
      try {
        const res = await fetch(
          `https://cdn.yextapis.com/v2/accounts/me/content/${contentEndpoint}/${document.uid}?api_key=${API_KEY}&v=${API_VERSION}`
        );

        if (!res.ok) return;

        const json = await res.json();

        const entities =
          json.response?.docs?.[0]?.dm_directoryParents_directory ?? [];

        const mapped: CustomBreadcrumbItem[] = entities.map((entity: any) => ({
          id: entity.uid,
          name: entity.name,
          slug: entity.slug,
        }));

        setFetchedBreadcrumbs(mapped);
      } catch (error) {
        console.error("Breadcrumb fetch failed:", error);
      }
    };

    fetchBreadcrumbs();
  }, [document?.uid, hasChildren, hasControlledBreadcrumbs]);

  if (!list?.length) return null;

  return (
    <PageSection
      as="nav"
      verticalPadding="sm"
      background={styles?.backgroundColor}
      aria-label="Breadcrumb"
    >
      <ol className="inline p-0 m-0 list-none">
        {list.map((crumb, index) => {
          const isRoot = index === 0;
          const isLast = index === list.length - 1;

          return (
            <li
              key={crumb.id}
              className="contents whitespace-normal break-words"
            >
              {!isRoot && (
                <span className="mx-2" aria-hidden>
                  {separator}
                </span>
              )}

              <wbr />

              {!isLast ? (
                <MaybeLink
                  href={`/${crumb.slug}`}
                  eventName={`breadcrumb${index}`}
                  disabled={puck?.isEditing}
                  alwaysHideCaret
                  className="inline text-body-sm-fontSize font-link-fontWeight font-link-fontFamily whitespace-normal break-words"
                >
                  {crumb.name}
                </MaybeLink>
              ) : (
                <span className="text-gray-700">{crumb.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </PageSection>
  );
};

export const CustomBreadcrumbs: ComponentConfig<{
  props: CustomBreadcrumbsProps;
}> = {
  label: "Custom Breadcrumbs",

  fields: customBreadcrumbFields,

  defaultProps: {
    data: {},
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    analytics: {
      scope: "customBreadcrumbs",
    },
    liveVisibility: true,
  },

  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <AnalyticsScopeProvider
        name={props.analytics?.scope ?? "customBreadcrumbs"}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <CustomBreadcrumbsComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
