import { ComponentConfig, Fields, WithPuckProps } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useEffect, useState } from "react";
import { YextField } from "../../../editor/YextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { StreamDocument } from "../../../utils/index.ts";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { MaybeLink } from "../../atoms/maybeLink.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";

export interface CustomBreadcrumbItem {
  id: string;
  name: string;
  slug?: string[];
}

export interface CustomBreadcrumbsProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  analytics: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const customBreadcrumbFields: Fields<CustomBreadcrumbsProps> = {
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
}: WithPuckProps<CustomBreadcrumbsProps>) => {
  const separator = "/";
  const document = useDocument() as StreamDocument;

  const [fetchedBreadcrumbs, setFetchedBreadcrumbs] = useState<
    CustomBreadcrumbItem[]
  >([]);

  useEffect(() => {
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

        const finalBC: CustomBreadcrumbItem[] = [
          ...mapped,
          {
            id: document.uid,
            name: document.name,
            slug: document.slug,
          },
        ];

        setFetchedBreadcrumbs(finalBC);
      } catch (error) {
        console.error("Breadcrumb fetch failed:", error);
      }
    };

    fetchBreadcrumbs();
  }, []);

  return (
    <PageSection
      as="nav"
      verticalPadding="sm"
      background={styles?.backgroundColor}
      aria-label="Breadcrumb"
    >
      <ol className="inline p-0 m-0 list-none">
        {fetchedBreadcrumbs.map((crumb, index) => {
          const isRoot = index === 0;
          const isLast = index === fetchedBreadcrumbs.length - 1;

          !isRoot && (
            <span className="mx-2" aria-hidden>
              {separator}
            </span>
          );
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
              <MaybeLink
                href={isLast ? "" : `/${crumb.slug}`}
                eventName={`breadcrumb${index}`}
                className="inline text-body-sm-fontSize font-link-fontWeight font-link-fontFamily whitespace-normal break-words"
                alwaysHideCaret
              >
                {crumb.name}
              </MaybeLink>
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
