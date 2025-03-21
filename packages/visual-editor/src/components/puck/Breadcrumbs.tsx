import { useTemplateProps } from "../../index.js";
import { ComponentConfig } from "@measured/puck";
import { MaybeLink } from "./atoms/maybeLink.js";

export type BreadcrumbsProps = {
  separator?: string;
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

export const BreadcrumbsComponent = (props: BreadcrumbsProps) => {
  const { separator = "/" } = props;
  const { document, relativePrefixToRoot } = useTemplateProps<any>();
  let breadcrumbs = getDirectoryParents(document);
  // if no dm_directoryParents nor dm_directoryChildren, then don't append current
  if (breadcrumbs?.length > 0 || document.dm_directoryChildren) {
    // append the current and filter out missing or malformed data
    breadcrumbs = [...breadcrumbs, { name: document.name, slug: "" }].filter(
      (b) => b.name
    );
  }

  return (
    <div>
      {breadcrumbs?.length > 0 && (
        <nav
          className="container mx-auto my-4 px-4 sm:px-8 lg:px-16 xl:px-20 items-center"
          aria-label="Breadcrumb"
        >
          <ol className="components flex flex-wrap text-link-fontSize text-body-color">
            {breadcrumbs.map(({ name, slug }, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const href = relativePrefixToRoot
                ? relativePrefixToRoot + slug
                : slug;
              return (
                <li key={idx}>
                  <MaybeLink
                    href={isLast ? "" : href}
                    className="text-link-color underline hover:no-underline"
                  >
                    {name}
                  </MaybeLink>
                  {!isLast && <span className="mx-2">{separator}</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </div>
  );
};

export const Breadcrumbs: ComponentConfig<BreadcrumbsProps> = {
  render: (props) => <BreadcrumbsComponent {...props} />,
};
