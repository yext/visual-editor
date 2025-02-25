import { useDocument } from "../../hooks/useDocument.tsx";
import { BreadcrumbsComponent } from "./Breadcrumbs.tsx";
import { ComponentConfig } from "@measured/puck";
import { MaybeLink } from "./atoms/maybeLink.tsx";
import { Address, HoursStatus } from "@yext/pages-components";
import { innerLayoutVariants, layoutVariants } from "./Layout.tsx";
import { Section } from "./atoms/section.tsx";
import { themeManagerCn } from "../../utils/index.ts";

const isDirectoryGrid = (children: string | any[]) => {
  return children.length > 0 && "address" in children[0];
};

const sortDirectoryByAlphabetical = (directoryChildren: any[]) => {
  const sortFn = (p1: any, p2: any) => {
    if (p1.name === p2.name) {
      return 0;
    }
    return p1.name < p2.name ? -1 : 1;
  };

  return directoryChildren.sort(sortFn);
};

const DirectoryCard = ({
  profile,
  relativePrefixToRoot,
}: {
  profile: any;
  relativePrefixToRoot: string;
}) => {
  return (
    <div className="bg-white px-6 py-8 border h-full">
      <MaybeLink
        className="hover:underline text-link-fontSize text-link-color mb-4"
        href={
          relativePrefixToRoot && profile.slug
            ? relativePrefixToRoot + profile.slug
            : ""
        }
      >
        {profile.name}
      </MaybeLink>

      {profile.hours && (
        <div className="mb-2 font-semibold font-body-fontFamily text-body-color">
          <HoursStatus
            hours={profile.hours}
            timezone={profile.timezone}
            className="h-full"
          />
        </div>
      )}

      {profile.address && (
        <div className="font-body-fontFamily text-body-color">
          <Address address={profile.address} lines={[["line1"]]} />
        </div>
      )}
    </div>
  );
};

const DirectoryGrid = ({
  directoryChildren,
  relativePrefixToRoot,
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
}) => {
  const sortedDirectoryChildren =
    sortDirectoryByAlphabetical(directoryChildren);

  return (
    <Section
      className={themeManagerCn(
        layoutVariants({
          backgroundColor: "default",
          verticalPadding: "default",
          horizontalPadding: "default",
        })
      )}
      maxWidth="full"
      padding="none"
    >
      <div
        className={themeManagerCn(
          layoutVariants({ gap: "default" }),
          innerLayoutVariants({ maxContentWidth: "default" })
        )}
        style={{
          gridTemplateColumns: `repeat(3, 1fr)`,
        }}
      >
        {sortedDirectoryChildren.map((child, idx) => (
          <div className="w-full" key={idx}>
            <DirectoryCard
              profile={child.profile}
              relativePrefixToRoot={relativePrefixToRoot}
            />
          </div>
        ))}
      </div>
    </Section>
  );
};

const DirectoryList = ({
  directoryChildren,
  relativePrefixToRoot,
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
}) => {
  const sortedDirectoryChildren =
    sortDirectoryByAlphabetical(directoryChildren);

  return (
    <div className="container my-8 components">
      <ul className="lg:columns-4 md:columns-3 sm:columns-2 columns-1 -m-3">
        {sortedDirectoryChildren.map((child, idx) => (
          <li className="p-3" key={idx}>
            <MaybeLink
              className="inline-block after:content-[attr(data-count)] after:ml-2 hover:underline text-link-fontSize text-link-color"
              href={
                relativePrefixToRoot
                  ? relativePrefixToRoot + child.slug
                  : child.slug
              }
            >
              {child.name}
            </MaybeLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DirectoryComponent = (props: DirectoryProps) => {
  const { separator = "/" } = props;
  const document = useDocument<any>();

  return (
    <>
      <BreadcrumbsComponent separator={separator} />
      {document.dm_directoryChildren &&
        isDirectoryGrid(document.dm_directoryChildren) && (
          <DirectoryGrid
            directoryChildren={document.dm_directoryChildren}
            relativePrefixToRoot={document.relativePrefixToRoot}
          />
        )}
      {document.dm_directoryChildren &&
        !isDirectoryGrid(document.dm_directoryChildren) && (
          <DirectoryList
            directoryChildren={document.dm_directoryChildren}
            relativePrefixToRoot={document.relativePrefixToRoot}
          />
        )}
    </>
  );
};

export interface DirectoryProps {
  separator?: string;
}

export const Directory: ComponentConfig<DirectoryProps> = {
  render: (props) => <DirectoryComponent {...props} />,
};
