import { useTemplateProps } from "../../index.js";
import { ComponentConfig } from "@measured/puck";
import { MaybeLink } from "./atoms/maybeLink.js";

export type BreadcrumbsProps = {
  separator?: string;
};

const getDirectoryParents = (
  document: Record<string, any>
): Array<{ slug: string; name: string }> => {
  for (const key in document) {
    if (key.startsWith("dm_directoryParents_")) {
      return document[key];
    }
  }
  return [];
};

export const BreadcrumbsComponent = (props: BreadcrumbsProps) => {
  const { separator = "/" } = props;
  const { document, relativePrefixToRoot } = useTemplateProps<any>();
  const breadcrumbs = getDirectoryParents(document);

  return (
    <div>
      {breadcrumbs?.length > 0 && (
        <nav className="my-4" aria-label="Breadcrumb">
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
