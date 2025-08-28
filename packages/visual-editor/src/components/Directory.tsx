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
  TranslatableString,
  BackgroundStyle,
  Background,
  HeadingLevel,
  YextEntityField,
  resolveComponentData,
  HoursStatusAtom,
  resolveUrlTemplate,
} from "@yext/visual-editor";
import { BreadcrumbsComponent } from "./pageSections/Breadcrumbs.tsx";
import {
  ComponentConfig,
  Fields,
  PuckContext,
  WithPuckProps,
} from "@measured/puck";
import { Address, AnalyticsScopeProvider } from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import * as React from "react";

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

  /**
   * The site name to display above the title.
   * @defaultValue "" (empty string)
   */
  siteName: YextEntityField<TranslatableString>;
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

  /**
   * The display format for phone numbers on the cards.
   * @defaultValue 'domestic'
   */
  phoneNumberFormat: "domestic" | "international";

  /**
   * If "true", wraps phone numbers in a clickable "tel:" hyperlink.
   * @defaultValue false
   */
  phoneNumberLink: boolean;

  /** Styling for the hours display on each card. */
  hours: {
    showCurrentStatus: boolean;
    timeFormat?: "12h" | "24h";
    dayOfWeekFormat?: "short" | "long";
    showDayNames?: boolean;
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
  analytics: {
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
      directoryRoot: YextField(
        msg("fields.directoryRootLinkLabel", "Directory Root Link Label"),
        {
          type: "translatableString",
          filter: { types: ["type.string"] },
        }
      ),
      siteName: YextField(msg("fields.siteName", "Site Name"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
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
      phoneNumberFormat: YextField(
        msg("fields.phoneNumberFormat", "Phone Number Format"),
        {
          type: "radio",
          options: "PHONE_OPTIONS",
        }
      ),
      phoneNumberLink: YextField(
        msg("fields.includePhoneHyperlink", "Include Phone Hyperlink"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
      hours: YextField(msg("fields.hours", "Hours"), {
        type: "object",
        objectFields: {
          showCurrentStatus: YextField(
            msg("fields.showCurrentStatus", "Show Current Status"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }
          ),
          timeFormat: YextField(msg("fields.timeFormat", "Time Format"), {
            type: "radio",
            options: [
              {
                label: msg("fields.options.hour12", "12-hour"),
                value: "12h",
              },
              {
                label: msg("fields.options.hour24", "24-hour"),
                value: "24h",
              },
            ],
          }),
          showDayNames: YextField(
            msg("fields.showDayNames", "Show Day Names"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }
          ),
          dayOfWeekFormat: YextField(
            msg("fields.dayOfWeekFormat", "Day of Week Format"),
            {
              type: "radio",
              options: [
                {
                  label: msg("fields.options.short", "Short"),
                  value: "short",
                },
                {
                  label: msg("fields.options.long", "Long"),
                  value: "long",
                },
              ],
            }
          ),
        },
      }),
    },
  }),
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
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
  styles,
  puck,
}: {
  cardNumber: number;
  profile: any;
  styles: DirectoryProps["styles"];
  puck: PuckContext;
}) => {
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();
  const cardStyles: DirectoryProps["styles"]["cards"] = styles["cards"];

  const documentForDirectory = {
    ...profile,
    __: {
      isPrimaryLocale: streamDocument.__?.isPrimaryLocale,
    },
    _pageset: streamDocument._pageset,
  };

  const resolvedUrl = resolveUrlTemplate(
    documentForDirectory,
    relativePrefixToRoot,
    puck.metadata?.resolveUrlTemplate
  );

  return (
    <Background
      className="h-full flex flex-col p-8 border border-gray-400 rounded gap-4"
      background={cardStyles.backgroundColor}
    >
      <MaybeLink
        eventName={`link${cardNumber}`}
        alwaysHideCaret={true}
        className="mb-2 max-w-full text-wrap break-words"
        href={resolvedUrl}
      >
        <Heading
          level={cardStyles.headingLevel}
          semanticLevelOverride={3}
          className="max-w-full"
        >
          {profile.name}
        </Heading>
      </MaybeLink>
      {profile.hours && (
        <HoursStatusAtom
          hours={profile.hours}
          className="mb-2 font-semibold font-body-fontFamily text-body-fontSize h-full"
          timezone={profile.timezone}
          showCurrentStatus={styles?.hours?.showCurrentStatus}
          dayOfWeekFormat={styles?.hours?.dayOfWeekFormat}
          showDayNames={styles?.hours?.showDayNames}
          timeFormat={styles?.hours?.timeFormat}
        />
      )}
      {profile.mainPhone && (
        <PhoneAtom
          phoneNumber={profile.mainPhone}
          includeHyperlink={styles.phoneNumberLink}
          includeIcon={false}
          format={styles.phoneNumberFormat}
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
  styles,
  puck,
}: {
  directoryChildren: any[];
  styles: DirectoryProps["styles"];
  puck: PuckContext;
}) => {
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");

  return (
    <PageSection
      verticalPadding="sm"
      background={backgroundColors.background1.value}
      className={themeManagerCn(
        "flex min-h-0 min-w-0 mx-auto flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
      )}
    >
      {sortedDirectoryChildren?.map((child, idx) => (
        <DirectoryCard
          key={idx}
          cardNumber={idx}
          profile={child}
          styles={styles}
          puck={puck}
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

const DirectoryComponent = ({
  data,
  styles,
  analytics,
  puck,
}: WithPuckProps<DirectoryProps>) => {
  const { i18n } = useTranslation();
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const title = resolveComponentData(data.title, i18n.language, streamDocument);
  const siteName = resolveComponentData(
    data.siteName,
    i18n.language,
    streamDocument
  );

  return (
    <Background background={styles.backgroundColor}>
      <BreadcrumbsComponent
        data={{ directoryRoot: data.directoryRoot }}
        styles={{ backgroundColor: styles.breadcrumbsBackgroundColor }}
        analytics={analytics}
        liveVisibility={true}
      />
      <PageSection className="flex flex-col items-center gap-2">
        {siteName && <Heading level={4}>{siteName}</Heading>}
        {title && <Heading level={2}>{title}</Heading>}
      </PageSection>
      {streamDocument.dm_directoryChildren &&
        isDirectoryGrid(streamDocument.dm_directoryChildren) && (
          <DirectoryGrid
            directoryChildren={streamDocument.dm_directoryChildren}
            styles={styles}
            puck={puck}
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
 * Available on Directory templates.
 */
export const Directory: ComponentConfig<{ props: DirectoryProps }> = {
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
      siteName: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "",
          hasLocalizedValue: "true",
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      breadcrumbsBackgroundColor: backgroundColors.background1.value,
      cards: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 3,
      },
      hours: {
        showCurrentStatus: true,
        timeFormat: "12h",
        showDayNames: true,
        dayOfWeekFormat: "long",
      },
      phoneNumberFormat: "domestic",
      phoneNumberLink: true,
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
