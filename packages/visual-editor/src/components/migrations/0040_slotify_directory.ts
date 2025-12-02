import { Migration } from "../../utils/migrate.ts";
import {
  isDirectoryGrid,
  sortAlphabetically,
} from "../../utils/directory/utils.ts";

export const directorySlots: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const title = props.data.title;
      const siteName = props.data.siteName;
      const breadcrumbRoot = props.data.directoryRoot;
      const backgroundColor = props.styles.backgroundColor;
      const breadcrumbBackgroundColor = props.styles.breadcrumbsBackgroundColor;

      const isGrid = isDirectoryGrid(
        streamDocument?.dm_directoryChildren || []
      );
      const sortedDirectoryChildren = sortAlphabetically(
        streamDocument?.dm_directoryChildren || [],
        "name"
      );

      const cards = isGrid
        ? sortedDirectoryChildren?.map((child, i) => {
            const cardId = `${props.id}-Card-${i}`;
            return {
              type: "DirectoryCard",
              props: {
                id: cardId,
                slots: {
                  HeadingSlot: [
                    {
                      type: "HeadingTextSlot",
                      props: {
                        id: `${cardId}-HeadingSlot`,
                        data: {
                          text: {
                            constantValue: "",
                            field: "",
                          },
                        },
                        styles: {
                          level: props.styles.cards.headingLevel,
                          align: "left",
                        },
                        parentData: {
                          text: child["name"],
                          field: "profile.name",
                        },
                      },
                    },
                  ],
                  PhoneSlot: [
                    {
                      type: "PhoneSlot",
                      props: {
                        id: `${cardId}-PhoneSlot`,
                        data: {
                          number: {
                            constantValue: "",
                            field: "",
                          },
                          label: {
                            constantValue: "",
                            hasLocalizedValue: "true",
                            field: "",
                          },
                        },
                        styles: {
                          phoneFormat: props.styles.phoneNumberFormat,
                          includePhoneHyperlink: props.styles.phoneNumberLink,
                          includeIcon: false,
                        },
                        parentData: {
                          phoneNumber: child["mainPhone"],
                          field: "profile.mainPhone",
                        },
                      },
                    },
                  ],
                  HoursSlot: [
                    {
                      type: "HoursStatusSlot",
                      props: {
                        id: `${cardId}-HoursSlot`,
                        data: {
                          hours: {
                            constantValue: {},
                            field: "",
                          },
                        },
                        styles: {
                          dayOfWeekFormat: props.styles.hours.dayOfWeekFormat,
                          showDayNames: props.styles.hours.showDayNames,
                          showCurrentStatus:
                            props.styles.hours.showCurrentStatus,
                          timeFormat: props.styles.hours.timeFormat,
                          className:
                            "mb-2 font-semibold font-body-fontFamily text-body-fontSize h-full",
                        },
                        parentData: {
                          hours: child["hours"],
                          field: "profile.hours",
                          timezone: child["timezone"],
                        },
                      },
                    },
                  ],
                },
                styles: {
                  backgroundColor: props.styles.cards.backgroundColor,
                },
                parentData: {
                  profile: child,
                },
                index: i,
              },
            };
          }) || []
        : [];

      delete props.data;
      delete props.styles;

      return {
        ...props,
        styles: {
          backgroundColor: backgroundColor,
        },
        slots: {
          TitleSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-TitleSlot`,
                data: {
                  text: title,
                },
                styles: {
                  align: "center",
                  level: 2,
                },
              },
            },
          ],
          SiteNameSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-SiteNameSlot`,
                data: {
                  text: siteName,
                },
                styles: {
                  align: "center",
                  level: 4,
                },
              },
            },
          ],
          BreadcrumbsSlot: [
            {
              type: "BreadcrumbsSlot",
              props: {
                id: `${props.id}-BreadcrumbsSlot`,
                data: {
                  directoryRoot: breadcrumbRoot,
                },
                styles: {
                  backgroundColor: breadcrumbBackgroundColor,
                },
                liveVisibility: true,
                analytics: props.analytics,
              },
            },
          ],
          DirectoryGrid: [
            {
              type: "DirectoryGrid",
              props: {
                id: `${props.id}-DirectoryGrid`,
                slots: {
                  CardSlot: cards,
                },
              },
            },
          ],
        },
      };
    },
  },
};
