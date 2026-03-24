import { ComponentConfig, Fields, WithPuckProps } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { YextField } from "../../../editor/YextField.tsx";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { TranslatableString } from "../../../types/types.ts";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import { resolveComponentData, themeManagerCn } from "../../../utils/index.ts";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../../utils/themeConfigOptions.ts";
import { Body } from "../../atoms/body.tsx";
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

const CustomBreadcrumbsComponent = ({
  styles,
  data,
  puck,
}: WithPuckProps<CustomBreadcrumbsProps>) => {
  const { t, i18n } = useTranslation();
  const separator = "/";
  const { document: streamDocument } = useTemplateProps();
  const apiKey = streamDocument?._env?.YEXT_PUBLIC_CUSTOM_CONTENT_API_KEY;
  const customEndpointURL =
    streamDocument?._env?.YEXT_PUBLIC_CUSTOM_CONTENT_URL;

  if (!apiKey || !customEndpointURL) {
    if (puck?.isEditing) {
      const missingMessages: string[] = [];
      if (!apiKey) {
        missingMessages.push(
          pt(
            "missingCustomEndpointApiKey",
            "Add your custom Content endpoint API key to view this section"
          )
        );
      }
      if (!customEndpointURL) {
        missingMessages.push(
          pt(
            "missingCustomEndpointURL",
            "Add your custom Content endpoint url to view this section"
          )
        );
      }
      return (
        <div
          className={themeManagerCn(
            "relative h-[100px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5"
          )}
        >
          <Body
            variant="base"
            className="text-gray-500 font-normal text-center whitespace-pre-line"
          >
            {missingMessages.join("\n")}
          </Body>
        </div>
      );
    }

    console.warn("Missing required configuration for Custom Breadcrumbs", {
      apiKey: !!apiKey,
      customEndpointURL: !!customEndpointURL,
    });

    return <></>;
  }

  const directoryRoot = resolveComponentData(
    data.directoryRoot,
    i18n.language,
    streamDocument
  );
  const [fetchedBreadcrumbs, setFetchedBreadcrumbs] = useState<
    CustomBreadcrumbItem[]
  >([]);

  const fetchBreadcrumbs = useCallback(async () => {
    if (!streamDocument?.uid) return;

    try {
      const json = await fetchData({
        endpoint: `${customEndpointURL}/${streamDocument.uid}`,
        apiKey,
      });

      const doc = json?.docs?.[0];

      const parentKey = Object.keys(doc || {}).find(
        (key) =>
          key.startsWith("dm_directoryParents") && key.endsWith("_directory")
      );

      const entities = parentKey ? (doc[parentKey] ?? []) : [];

      const mapped = entities.map((entity: any) => ({
        id: entity.id,
        name: entity.name,
        slug: entity.slug,
      }));

      setFetchedBreadcrumbs([
        ...mapped,
        {
          id: streamDocument.id,
          name: streamDocument.name,
          slug: streamDocument.slug,
        },
      ]);
    } catch (error) {
      console.error("Breadcrumb fetch failed:", error);
    }
  }, [streamDocument, customEndpointURL, apiKey]);

  useEffect(() => {
    fetchBreadcrumbs();
  }, [fetchBreadcrumbs]);

  if (!fetchedBreadcrumbs?.length) {
    return (
      <PageSection
        as="nav"
        verticalPadding="sm"
        background={styles.backgroundColor}
        aria-label="breadcrumb-loading"
      >
        <div className="animate-pulse">
          <div className="h-5 w-48 bg-gray-200 rounded" />
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection
      as="nav"
      verticalPadding="sm"
      background={styles.backgroundColor}
      aria-label={t("breadcrumb", "Breadcrumb")}
    >
      <ol className="inline p-0 m-0 list-none">
        {fetchedBreadcrumbs.map((b, i) => {
          const isLast = i === fetchedBreadcrumbs.length - 1;
          const href = `/${b.id}`;
          return (
            <li key={b.id} className="contents whitespace-normal break-words">
              {i ? (
                <span className="mx-2" aria-hidden>
                  {separator}
                </span>
              ) : (
                ""
              )}
              <MaybeLink
                alwaysHideCaret
                href={isLast ? "" : href}
                className="inline text-body-sm-fontSize font-link-fontWeight font-link-fontFamily whitespace-normal break-words"
              >
                {i === 0 ? directoryRoot : b.name}
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
        "en-GB": "Directory Root",
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
