import {
  useTemplateProps,
  themeManagerCn,
  Heading,
  backgroundColors,
  Body,
  MaybeLink,
  PageSection,
  PhoneAtom,
  i18n,
} from "@yext/visual-editor";
import { BreadcrumbsComponent } from "./pageSections/Breadcrumbs.tsx";
import { ComponentConfig } from "@measured/puck";
import { Address, HoursStatus } from "@yext/pages-components";

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
    <div className="flex flex-col p-8 border border-gray-400 rounded h-full gap-4">
      <div>
        <MaybeLink
          alwaysHideCaret={true}
          className="mb-2"
          href={
            relativePrefixToRoot && profile.slug
              ? relativePrefixToRoot + profile.slug
              : profile.slug
          }
        >
          <Heading level={4} semanticLevelOverride={3}>
            {profile.name}
          </Heading>
        </MaybeLink>
        {profile.hours && (
          <div className="font-semibold font-body-fontFamily text-body-fontSize">
            <HoursStatus
              hours={profile.hours}
              timezone={profile.timezone}
              className="h-full"
              dayOfWeekTemplate={() => <></>}
            />
          </div>
        )}
      </div>
      {profile.mainPhone && (
        <PhoneAtom
          phoneNumber={profile.mainPhone}
          includeHyperlink={false}
          includeIcon={false}
          format={
            profile.mainPhone.slice(0, 2) === "+1"
              ? "domestic"
              : "international"
          }
        />
      )}
      {profile.address && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
          <Address
            address={profile.address}
            lines={[["line1"], ["line2"], ["city", "region", "postalCode"]]}
          />
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
    <PageSection
      verticalPadding="sm"
      background={backgroundColors.background1.value}
      className={themeManagerCn(
        "flex min-h-0 min-w-0 mx-auto flex-col md:grid md:grid-cols-12 gap-4 sm:gap-8"
      )}
      style={{
        gridTemplateColumns: `repeat(3, 1fr)`,
      }}
    >
      {sortedDirectoryChildren?.map((child, idx) => (
        <DirectoryCard
          key={idx}
          profile={child}
          relativePrefixToRoot={relativePrefixToRoot}
        />
      ))}
    </PageSection>
  );
};

const DirectoryList = ({
  directoryChildren,
  relativePrefixToRoot,
  level,
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
  level: string;
}) => {
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");

  return (
    <PageSection
      verticalPadding="sm"
      background={backgroundColors.background1.value}
    >
      <ul className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {sortedDirectoryChildren.map((child, idx) => {
          let label;
          switch (level) {
            case "dm_root":
              label = child.dm_addressCountryDisplayName ?? child.name;
              break;
            case "dm_country":
              label = child.dm_addressRegionDisplayName ?? child.name;
              break;
            default:
              label = child.name;
          }

          return (
            <li key={idx}>
              <MaybeLink
                variant="directoryLink"
                href={
                  relativePrefixToRoot
                    ? relativePrefixToRoot + child.slug
                    : child.slug
                }
              >
                <Body>{label}</Body>
              </MaybeLink>
            </li>
          );
        })}
      </ul>
    </PageSection>
  );
};

const DirectoryComponent = (props: DirectoryProps) => {
  const { separator = "/" } = props;
  const { document, relativePrefixToRoot } = useTemplateProps<any>();

  let headingText;
  switch (document?.meta?.entityType?.id) {
    case "dm_root":
      headingText = "All Locations";
      break;
    case "dm_country":
      headingText = document.dm_addressCountryDisplayName ?? document.name;
      break;
    case "dm_region":
      headingText = document.dm_addressRegionDisplayName ?? document.name;
      break;
    case "dm_city":
      headingText = document.name;
  }

  return (
    <>
      <BreadcrumbsComponent separator={separator} liveVisibility={true} />
      <PageSection className="flex flex-col items-center gap-2">
        {document._site.name && (
          <Heading level={4}>{document._site.name}</Heading>
        )}
        {headingText && <Heading level={2}>{headingText}</Heading>}
      </PageSection>
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
            level={document?.meta?.entityType?.id}
          />
        )}
    </>
  );
};

export const Directory: ComponentConfig<DirectoryProps> = {
  label: i18n("Directory"),
  render: (props) => <DirectoryComponent {...props} />,
};
