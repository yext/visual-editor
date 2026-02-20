import { ComponentConfig, Fields, WithPuckProps } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { YextField } from "../../../editor/YextField.tsx";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { TranslatableString } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../../utils/index.ts";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../../utils/themeConfigOptions.ts";
import { MaybeLink } from "../../atoms/maybeLink.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { fetchData } from "./utils.ts";

export interface CustomBreadcrumbItem {
  id: string;
  name: string;
  slug?: string;
}

export interface CustomBreadcrumbsProps {
  data: {
    directoryRoot: TranslatableString;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  analytics: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const customBreadcrumbFields: Fields<CustomBreadcrumbsProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      directoryRoot: YextField(
        msg("fields.directoryRootLinkLabel", "Directory Root Link Label"),
        {
          type: "translatableString",
          filter: { types: ["type.string"] },
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
const contentEndpoint = "blog";

const CustomBreadcrumbsComponent = ({
  styles,
  data,
}: WithPuckProps<CustomBreadcrumbsProps>) => {
  const { t, i18n } = useTranslation();
  const separator = "/";
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const directoryRoot = resolveComponentData(
    data.directoryRoot,
    i18n.language,
    streamDocument
  );
  const [fetchedBreadcrumbs, setFetchedBreadcrumbs] = useState<
    CustomBreadcrumbItem[]
  >([]);

  useEffect(() => {
    if (!streamDocument?.uid) return;

    const fetchBreadcrumbs = async () => {
      try {
        const json = await fetchData({
          endpoint: `https://cdn.yextapis.com/v2/accounts/me/content/${contentEndpoint}/${streamDocument.uid}`,
          apiKey: API_KEY,
        });

        if (!json) return;
        const entities = json.docs?.[0]?.dm_directoryParents_directory ?? [];

        const mapped: CustomBreadcrumbItem[] = entities.map((entity: any) => ({
          id: entity.uid,
          name: entity.name,
          slug: entity.slug,
        }));

        const finalBC: CustomBreadcrumbItem[] = [
          ...mapped,
          {
            id: streamDocument.uid,
            name: streamDocument.name,
            slug: streamDocument.slug,
          },
        ];

        setFetchedBreadcrumbs(finalBC);
      } catch (error) {
        console.error("Breadcrumb fetch failed:", error);
      }
    };

    fetchBreadcrumbs();
  }, [streamDocument?.uid, contentEndpoint]);

  if (!fetchedBreadcrumbs?.length) {
    return <PageSection></PageSection>;
  }

  return (
    <PageSection
      as="nav"
      verticalPadding="sm"
      background={styles?.backgroundColor}
      aria-label={t("breadcrumb", "Breadcrumb")}
    >
      <ol className="inline p-0 m-0 list-none">
        {fetchedBreadcrumbs.map(({ name, slug, id }, index) => {
          const isRoot = index === 0;
          const isLast = index === fetchedBreadcrumbs.length - 1;
          const href = relativePrefixToRoot
            ? relativePrefixToRoot + slug
            : slug;

          !isRoot && (
            <span className="mx-2" aria-hidden>
              {separator}
            </span>
          );
          return (
            <li key={id} className="contents whitespace-normal break-words">
              {!isRoot && (
                <span className="mx-2" aria-hidden>
                  {separator}
                </span>
              )}
              <wbr />
              <MaybeLink
                href={isLast ? "" : href}
                eventName={`breadcrumb${index}`}
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

export const CustomBreadcrumbs: ComponentConfig<{
  props: CustomBreadcrumbsProps;
}> = {
  label: msg("components.customBreadcrumbs", "Custom Breadcrumbs"),
  fields: customBreadcrumbFields,
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
