import { useTranslation } from "react-i18next";
import {
  Body,
  useTemplateProps,
  MaybeLink,
  PageSection,
  YextField,
  VisibilityWrapper,
  msg,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export type BreadcrumbsSectionProps = {
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
};

const breadcrumbsSectionFields: Fields<BreadcrumbsSectionProps> = {
  liveVisibility: YextField(msg("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: msg("Show"), value: true },
      { label: msg("Hide"), value: false },
    ],
  }),
};

// getDirectoryParents returns an array of objects. If no dm_directoryParents or children of
// the directory parent are not the expected objects, returns an empty array.
const getDirectoryParents = (
  document: Record<string, any>
): Array<{ slug: string; name: string }> => {
  for (const key in document) {
    if (
      key.startsWith("dm_directoryParents_") &&
      isValidDirectoryParents(document[key])
    ) {
      return document[key];
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
export const BreadcrumbsComponent = () => {
  const { t } = useTranslation();
  const separator = "/";
  const { document, relativePrefixToRoot } = useTemplateProps<any>();
  let breadcrumbs = getDirectoryParents(document);
  if (breadcrumbs?.length > 0 || document.dm_directoryChildren) {
    // append the current and filter out missing or malformed data
    breadcrumbs = [...breadcrumbs, { name: document.name, slug: "" }].filter(
      (b) => b.name
    );
  }

  if (!breadcrumbs?.length) {
    return <PageSection></PageSection>;
  }

  return (
    <PageSection
      as={"nav"}
      verticalPadding="sm"
      aria-label={t("breadcrumb", "Breadcrumb")}
    >
      <ol className="flex flex-wrap">
        {breadcrumbs.map(({ name, slug }, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          const href = relativePrefixToRoot
            ? relativePrefixToRoot + slug
            : slug;
          return (
            <li key={idx} className="flex items-center">
              <MaybeLink
                eventName={`link${idx}`}
                href={isLast ? "" : href}
                // Force body-sm and link-fontFamily for all breadcrumbs
                className="text-body-sm-fontSize font-link-fontFamily"
                alwaysHideCaret={true}
              >
                <Body variant={"sm"}>{name}</Body>
              </MaybeLink>
              {!isLast && <span className="mx-2">{separator}</span>}
            </li>
          );
        })}
      </ol>
    </PageSection>
  );
};

export const BreadcrumbsSection: ComponentConfig<BreadcrumbsSectionProps> = {
  label: msg("Breadcrumbs"),
  fields: breadcrumbsSectionFields,
  defaultProps: {
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
          <BreadcrumbsComponent />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  },
};
