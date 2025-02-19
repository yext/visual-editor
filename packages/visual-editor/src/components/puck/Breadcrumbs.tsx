import { Link } from "@yext/pages-components";
import { useDocument } from "../../index.js";
import { ComponentConfig } from "@measured/puck";
import { Key } from "react";

export type BreadcrumbsProps = {
  separator?: string;
};

const getDirectoryParents = (
  document: any
): Array<{ slug: string; name: string }> => {
  for (const key in document) {
    if (key.startsWith("dm_directoryParents_")) {
      return document[key];
    }
  }
  return [];
};

const Breadcrumb = ({
  name,
  href,
  linkClassName,
}: {
  name: string;
  href: string;
  linkClassName?: string;
}) => {
  if (href) {
    return (
      <Link href={href} className={linkClassName}>
        {name}
      </Link>
    );
  } else {
    return <>{name}</>;
  }
};

const BreadcrumbsComponent = (props: BreadcrumbsProps) => {
  const { separator = "/" } = props;
  const document = useDocument<any>();
  const breadcrumbs = getDirectoryParents(document);

  return (
    <div>
      {breadcrumbs?.length && (
        <nav className="my-4" aria-label="Breadcrumb">
          <ol className="components flex flex-wrap text-link-fontSize text-body-color">
            {breadcrumbs.map(
              ({ name, slug }: { name: string; slug: string }, idx: Key) => {
                const isLast = idx === breadcrumbs.length - 1;
                const href = document.relativePrefixToRoot
                  ? document.relativePrefixToRoot + slug
                  : slug;
                return (
                  <li key={idx}>
                    <Breadcrumb
                      name={name}
                      href={isLast ? "" : href}
                      linkClassName="text-link-color underline hover:no-underline"
                    />
                    {!isLast && <span className="mx-2">{separator}</span>}
                  </li>
                );
              }
            )}
          </ol>
        </nav>
      )}
    </div>
  );
};

export const Breadcrumbs: ComponentConfig<BreadcrumbsProps> = {
  render: (props) => <BreadcrumbsComponent {...props} />,
};
