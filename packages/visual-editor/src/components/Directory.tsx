import {
  useTemplateProps,
  themeManagerCn,
  Heading,
  backgroundColors,
  Body,
  MaybeLink,
  PageSection,
  PhoneAtom,
  msg,
  YextField,
  TranslatableStringField,
  TranslatableString,
  BackgroundStyle,
  Background,
  HeadingLevel,
  YextEntityField,
  getLocationPath,
  resolveComponentData,
} from "@yext/visual-editor";
import { BreadcrumbsComponent } from "./pageSections/Breadcrumbs.tsx";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Address,
  AnalyticsScopeProvider,
  HoursStatus,
} from "@yext/pages-components";
import { useTranslation } from "react-i18next";

export interface DirectoryData {
  /**
   * The title for the Directory Section.
   * @defaultValue "[[name]]" (constant using embedded fields)
   */
  title: YextEntityField<TranslatableString>;

  /**
   * The display label for the root link in the breadcrumbs navigation.
   * @defaultValue "Directory Root" (constant)
   */
  directoryRoot: TranslatableString;
}

export interface DirectoryStyles {
  /**
   * The main background color for the directory page content.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * A specific background color for the breadcrumbs navigation bar.
   * @defaultValue Background Color 1
   */
  breadcrumbsBackgroundColor?: BackgroundStyle;

  /**
   * Style properties for directory cards.
   */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };
}

export interface DirectoryProps {
  /**
   * This object contains the content used by the component.
   * @propCategory Data Props
   */
  data: DirectoryData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: DirectoryStyles;

  /** @internal */
  analytics?: {
    scope?: string;
  };
}

const directoryFields: Fields<DirectoryProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      title: YextField<any, TranslatableString>(msg("fields.title", "Title"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      directoryRoot: TranslatableStringField(
        msg("fields.directoryRootLinkLabel", "Directory Root Link Label"),
        { types: ["type.string"] }
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      breadcrumbsBackgroundColor: YextField(
        msg(
          "fields.breadcrumbsBackgroundColor",
          "Breadcrumbs Background Color"
        ),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      cards: YextField(msg("fields.cards", "Cards"), {
        type: "object",
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "BACKGROUND_COLOR",
            }
          ),
        },
      }),
    },
  }),
};

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
  cardNumber,
  profile,
  cardStyles,
}: {
  cardNumber: number;
  profile: any;
  cardStyles: DirectoryProps["styles"]["cards"];
}) => {
  const { relativePrefixToRoot } = useTemplateProps();
  const { i18n } = useTranslation();

  return (
    <Background
      className="h-full flex flex-col p-8 border border-gray-400 rounded gap-4"
      background={cardStyles.backgroundColor}
    >
      <div>
        <MaybeLink
          eventName={`link${cardNumber}`}
          alwaysHideCaret={true}
          className="mb-2"
          href={getLocationPath(profile, i18n.language, relativePrefixToRoot)}
        >
          <Heading level={cardStyles.headingLevel} semanticLevelOverride={3}>
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
    </Background>
  );
};

// DirectoryGrid uses PageSection's theme config for styling.
const DirectoryGrid = ({
  directoryChildren,
  cardStyles,
}: {
  directoryChildren: any[];
  cardStyles: DirectoryProps["styles"]["cards"];
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
          cardNumber={idx}
          profile={child}
          cardStyles={cardStyles}
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
                eventName={`child${idx}`}
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

const DirectoryComponent = ({ data, styles }: DirectoryProps) => {
  const { i18n } = useTranslation();
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const title = resolveComponentData(data.title, i18n.language, streamDocument);

  return (
    <Background background={styles.backgroundColor}>
      <BreadcrumbsComponent
        data={{ directoryRoot: data.directoryRoot }}
        liveVisibility={true}
        styles={{ backgroundColor: styles.breadcrumbsBackgroundColor }}
      />
      <PageSection className="flex flex-col items-center gap-2">
        {streamDocument._site?.name && (
          <Heading level={4}>{streamDocument._site.name}</Heading>
        )}
        {title && <Heading level={2}>{title}</Heading>}
      </PageSection>
      {streamDocument.dm_directoryChildren &&
        isDirectoryGrid(streamDocument.dm_directoryChildren) && (
          <DirectoryGrid
            directoryChildren={streamDocument.dm_directoryChildren}
            cardStyles={styles.cards}
          />
        )}
      {streamDocument.dm_directoryChildren &&
        !isDirectoryGrid(streamDocument.dm_directoryChildren) && (
          <DirectoryList
            directoryChildren={streamDocument.dm_directoryChildren}
            relativePrefixToRoot={relativePrefixToRoot ?? ""}
            level={streamDocument?.meta?.entityType?.id}
          />
        )}
    </Background>
  );
};

/**
 * The Directory Page component serves as a navigational hub, displaying a list of child entities within a hierarchical structure (e.g., a list of states in a country, or cities in a state). It includes breadcrumbs for easy navigation and renders each child item as a distinct card.
 * Avaliable on Directory templates.
 */
export const Directory: ComponentConfig<DirectoryProps> = {
  label: msg("components.directory", "Directory"),
  fields: directoryFields,
  defaultProps: {
    data: {
      title: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "[[name]]",
          hasLocalizedValue: "true",
        },
      },
      directoryRoot: {
        en: "Directory Root",
        hasLocalizedValue: "true",
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      breadcrumbsBackgroundColor: backgroundColors.background1.value,
      cards: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 3,
      },
    },
    analytics: {
      scope: "directory",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props?.analytics?.scope ?? "directory"}>
      <DirectoryComponent {...props} />
    </AnalyticsScopeProvider>
  ),
};
