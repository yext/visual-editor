import {
  Body,
  useTemplateProps,
  MaybeLink,
  PageSection,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";

export type BreadcrumbsSectionProps = {
  separator?: string;
  liveVisibility: boolean;
};

const breadcrumbsSectionFields: Fields<BreadcrumbsSectionProps> = {
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
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
export const BreadcrumbsComponent = (props: BreadcrumbsSectionProps) => {
  const { separator = "/" } = props;
  const { document, relativePrefixToRoot } = useTemplateProps<any>();
  let breadcrumbs = getDirectoryParents(document);
  if (breadcrumbs?.length > 0 || document.dm_directoryChildren) {
    // append the current and filter out missing or malformed data
    breadcrumbs = [...breadcrumbs, { name: document.name, slug: "" }].filter(
      (b) => b.name
    );
  }

  return (
    <PageSection as="nav" verticalPadding="sm" aria-label="Breadcrumb">
      {breadcrumbs?.length > 0 && (
        <ol className="flex flex-wrap">
          {breadcrumbs.map(({ name, slug }, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const href = relativePrefixToRoot
              ? relativePrefixToRoot + slug
              : slug;
            return (
              <li key={idx} className="flex items-center">
                <MaybeLink
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
      )}
    </PageSection>
  );
};

export const BreadcrumbsSection: ComponentConfig<BreadcrumbsSectionProps> = {
  label: "Breadcrumbs",
  fields: breadcrumbsSectionFields,
  defaultProps: {
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <BreadcrumbsComponent {...props} />
    </VisibilityWrapper>
  ),
};
