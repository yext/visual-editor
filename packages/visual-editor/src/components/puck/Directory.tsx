import {
  useTemplateProps,
  themeManagerCn,
  Heading,
  backgroundColors,
  Body,
  MaybeLink,
  Section,
} from "../../index.js";
import { BreadcrumbsComponent } from "./Breadcrumbs.tsx";
import { ComponentConfig } from "@measured/puck";
import { Address, HoursStatus } from "@yext/pages-components";
import { innerLayoutVariants, layoutVariants } from "./Layout.tsx";

export interface DirectoryProps {
  separator?: string;
}

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
    <div className="p-8 border border-gray-400 rounded h-full">
      <MaybeLink
        alwaysHideCaret={true}
        className="mb-4"
        href={
          relativePrefixToRoot && profile.slug
            ? relativePrefixToRoot + profile.slug
            : profile.slug
        }
      >
        <Heading level={5}>{profile.name}</Heading>
      </MaybeLink>
      {profile.hours && (
        <div className="mb-2 font-semibold font-body-fontFamily text-body-fontSize">
          <HoursStatus
            hours={profile.hours}
            timezone={profile.timezone}
            className="h-full"
          />
        </div>
      )}
      {profile.address && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize-sm">
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
          verticalPadding: "default",
          horizontalPadding: "4",
        })
      )}
      background={backgroundColors.background1.value}
      maxWidth="full"
      padding="none"
    >
      <div
        className={themeManagerCn(
          innerLayoutVariants({ maxContentWidth: "default" }),
          "flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-8"
        )}
        style={{
          gridTemplateColumns: `repeat(3, 1fr)`,
        }}
      >
        {sortedDirectoryChildren.map((child, idx) => (
          <DirectoryCard
            key={idx}
            profile={child}
            relativePrefixToRoot={relativePrefixToRoot}
          />
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
          <li key={idx}>
            <MaybeLink
              variant="directoryLink"
              href={
                relativePrefixToRoot
                  ? relativePrefixToRoot + child.slug
                  : child.slug
              }
            >
              <Body>{child.name}</Body>
            </MaybeLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DirectoryComponent = (props: DirectoryProps) => {
  const { separator = "/" } = props;
  const { document, relativePrefixToRoot } = useTemplateProps<any>();

  return (
    <>
      <div className="flex justify-center">
        <BreadcrumbsComponent separator={separator} />
      </div>
      {document.dm_directoryChildren &&
        isDirectoryGrid(document.dm_directoryChildren) && (
          <DirectoryGrid
            directoryChildren={document.dm_directoryChildren}
            relativePrefixToRoot={relativePrefixToRoot}
          />
        )}
      {document.dm_directoryChildren &&
        !isDirectoryGrid(document.dm_directoryChildren) && (
          <DirectoryList
            directoryChildren={document.dm_directoryChildren}
            relativePrefixToRoot={relativePrefixToRoot}
          />
        )}
    </>
  );
};

export const Directory: ComponentConfig<DirectoryProps> = {
  render: (props) => <DirectoryComponent {...props} />,
};
