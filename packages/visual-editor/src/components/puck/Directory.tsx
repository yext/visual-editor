import { useDocument } from "../../hooks/useDocument.tsx";
import { BreadcrumbsComponent } from "./Breadcrumbs.tsx";
import { ComponentConfig } from "@measured/puck";
import { MaybeLink } from "./atoms/maybeLink.tsx";
import { Address, HoursStatus } from "@yext/pages-components";
import { innerLayoutVariants, layoutVariants } from "./Layout.tsx";
import { Section } from "./atoms/section.tsx";
import { themeManagerCn } from "../../utils/index.ts";

// isDirectoryGrid indicates whether the children should appear in
// DirectoryGrid or DirectoryList dependent on the dm_directoryChildren type.
const isDirectoryGrid = (children: string | any[]): boolean => {
  return children.length > 0 && "address" in children[0];
};

// sortAlphabetically takes in an array of objects and sorts them alphabetically.
// They are sorted by the value of the field declared by sortBy.
// ex. if sortBy is name, the directoryChildren will be ordered by name alphabetically.
const sortAlphabetically = (directoryChildren: any[], sortBy: string) => {
  const sortFn = (p1: any, p2: any) => {
    const val1 = p1[sortBy] ?? "";
    const val2 = p2[sortBy] ?? "";
    if (val1 === val2) {
      return 0;
    }
    return val1 < val2 ? -1 : 1;
  };

  return directoryChildren.sort(sortFn);
};

// DirectoryCard is the card used within DirectoryGrid.
const DirectoryCard = ({
  profile,
  relativePrefixToRoot,
}: {
  profile: any;
  relativePrefixToRoot: string;
}) => {
  return (
    <div className="bg-card-backgroundColor px-6 py-8 border h-full">
      <MaybeLink
        className="hover:underline text-heading1-fontSize text-link-color mb-4"
        href={
          relativePrefixToRoot && profile.slug
            ? relativePrefixToRoot + profile.slug
            : profile.slug
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

// DirectoryGrid uses PageSection's theme config for styling.
const DirectoryGrid = ({
  directoryChildren,
  relativePrefixToRoot,
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
}) => {
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");

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
          innerLayoutVariants({ maxContentWidth: "default" }),
          "flex flex-col md:grid md:grid-cols-12"
        )}
        style={{
          gridTemplateColumns: `repeat(3, 1fr)`,
        }}
      >
        {sortedDirectoryChildren.map((child, idx) => (
          <div className="w-full" key={idx}>
            <DirectoryCard
              profile={child}
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
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");

  return (
    <div className="container components mx-auto px-4 sm:px-8 lg:px-16 xl:px-20">
      <ul className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
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
      <div className="flex justify-center">
        <BreadcrumbsComponent separator={separator} />
      </div>
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
