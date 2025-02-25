import { useDocument } from "../../hooks/useDocument.tsx";
import { BreadcrumbsComponent } from "./Breadcrumbs.tsx";
import { ComponentConfig, Fields } from "@measured/puck";
import { MaybeLink, MaybeLinkProps } from "./atoms/maybeLink.tsx";
import { Address, HoursStatus } from "@yext/pages-components";
import { FontSizeSelector } from "../editor/FontSizeSelector.tsx";
import { VariantProps } from "class-variance-authority";
import {
  innerLayoutVariants,
  // layoutFields,
  layoutVariants,
} from "./Layout.tsx";
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
  linkStyles,
}: {
  profile: any;
  relativePrefixToRoot: string;
  linkStyles: any;
}) => {
  return (
    <div className="bg-white px-6 py-8 border h-full">
      <MaybeLink
        className="hover:underline mb-4"
        href={
          relativePrefixToRoot && profile.slug
            ? relativePrefixToRoot + profile.slug
            : ""
        }
        color={linkStyles.color}
        fontSize={linkStyles.fontSize}
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
  linkStyles,
  gridStyles: {
    backgroundColor,
    verticalPadding,
    horizontalPadding,
    gap,
    maxContentWidth,
    numColumns,
  },
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
  linkStyles: any;
  gridStyles: any;
}) => {
  const sortedDirectoryChildren =
    sortDirectoryByAlphabetical(directoryChildren);

  return (
    <Section
      className={themeManagerCn(
        layoutVariants({
          backgroundColor,
          verticalPadding,
          horizontalPadding,
        })
      )}
      maxWidth="full"
      padding="none"
    >
      <div
        className={themeManagerCn(
          layoutVariants({ gap }),
          innerLayoutVariants({ maxContentWidth })
        )}
        style={{
          gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
        }}
      >
        {sortedDirectoryChildren.map((child, idx) => (
          <div className="w-full" key={idx}>
            <DirectoryCard
              profile={child.profile}
              relativePrefixToRoot={relativePrefixToRoot}
              linkStyles={linkStyles}
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
  linkStyles,
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
  linkStyles: any;
}) => {
  const sortedDirectoryChildren =
    sortDirectoryByAlphabetical(directoryChildren);

  return (
    <div className="container my-8 components">
      <ul className="lg:columns-4 md:columns-3 sm:columns-2 columns-1 -m-3">
        {sortedDirectoryChildren.map((child, idx) => (
          <li className="p-3" key={idx}>
            <MaybeLink
              className="inline-block after:content-[attr(data-count)] after:ml-2 hover:underline"
              href={
                relativePrefixToRoot
                  ? relativePrefixToRoot + child.slug
                  : child.slug
              }
              color={linkStyles.color}
              fontSize={linkStyles.fontSize}
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
      <BreadcrumbsComponent separator={separator} link={props.link} />
      {document.dm_directoryChildren &&
        isDirectoryGrid(document.dm_directoryChildren) && (
          <DirectoryGrid
            directoryChildren={document.dm_directoryChildren}
            relativePrefixToRoot={document.relativePrefixToRoot}
            linkStyles={props.link}
            gridStyles={props}
          />
        )}
      {document.dm_directoryChildren &&
        !isDirectoryGrid(document.dm_directoryChildren) && (
          <DirectoryList
            directoryChildren={document.dm_directoryChildren}
            relativePrefixToRoot={document.relativePrefixToRoot}
            linkStyles={props.link}
          />
        )}
    </>
  );
};

const directoryFields: Fields<DirectoryProps> = {
  link: {
    type: "object",
    label: "Link",
    objectFields: {
      fontSize: FontSizeSelector(),
      color: {
        label: "Font Color",
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Accent", value: "accent" },
          { label: "Text", value: "text" },
          { label: "Background", value: "background" },
        ],
      },
    },
  },
  // GridOrList: {
  //   label: "Grid or List",
  //   type: "radio",
  //   options: [
  //     { label: "Grid", value: "grid" },
  //     { label: "List", value: "list" },
  //   ],
  // },
};

export interface DirectoryProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants>,
    VariantProps<typeof innerLayoutVariants> {
  separator?: string;
  link: {
    fontSize: MaybeLinkProps["fontSize"];
    color: MaybeLinkProps["color"];
  };
  // GridOrList: string;
  NumberOfColumns?: number;
}

export const Directory: ComponentConfig<DirectoryProps> = {
  fields: directoryFields,
  defaultProps: {
    link: {
      fontSize: "default",
      color: "default",
    },
    // GridOrList: "",
  },
  // resolveFields: (data) => {
  //   if (data.props.GridOrList === "grid") {
  //     return {
  //       ...directoryFields,
  //       ...layoutFields,
  //       NumberOfColumns: {
  //         label: "# of Columns",
  //         type: "number",
  //         max: 12,
  //         min: 1,
  //       },
  //     };
  //   }
  //   return directoryFields;
  // },
  render: (props) => <DirectoryComponent {...props} />,
};
