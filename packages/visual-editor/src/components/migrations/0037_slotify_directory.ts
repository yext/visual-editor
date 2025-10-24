import { Migration } from "../../utils/migrate.ts";
import { DirectoryCardProps } from "../directory/DirectoryCard.tsx";
import { WithId } from "@measured/puck";
import {
  isDirectoryGrid,
  sortAlphabetically,
} from "../../utils/directory/utils.ts";
import { HeadingTextProps } from "../contentBlocks/HeadingText.tsx";
import { BreadcrumbsSectionProps } from "../pageSections/Breadcrumbs.tsx";
import { PhoneProps } from "../contentBlocks/Phone.tsx";
import { HoursStatusProps } from "../index.ts";

export const directorySlots: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const title = props.data.title;
      const siteName = props.data.siteName;
      const breadcrumbRoot = props.data.directoryRoot;
      const backgroundColor = props.styles.backgroundColor;
      const breadcrumbBackgroundColor = props.styles.breadcrumbsBackgroundColor;

      const isGrid = isDirectoryGrid(streamDocument.dm_directoryChildren);
      const sortedDirectoryChildren = sortAlphabetically(
        streamDocument.dm_directoryChildren,
        "name"
      );

      const cards = isGrid
        ? sortedDirectoryChildren?.map((child, i) => {
            return {
              type: "DirectoryCard",
              props: {
                id: "DirectoryCard-migrated-" + i,
                slots: {
                  HeadingSlot: [
                    {
                      type: "HeadingTextSlot",
                      props: {
                        ...(props.id && { id: `${props.id}-heading-${i}` }),
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
                      } satisfies HeadingTextProps,
                    },
                  ],
                  PhoneSlot: [
                    {
                      type: "PhoneSlot",
                      props: {
                        ...(props.id && { id: `${props.id}-phone-${i}` }),
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
                          field: "profile.phone",
                        },
                      } satisfies PhoneProps,
                    },
                  ],
                  HoursSlot: [
                    {
                      type: "HoursStatusSlot",
                      props: {
                        ...(props.id && { id: `${props.id}-hours-${i}` }),
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
                      } satisfies HoursStatusProps,
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
              } satisfies WithId<DirectoryCardProps>,
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
                data: {
                  text: title,
                },
                styles: {
                  align: "center",
                  level: 2,
                },
              } satisfies HeadingTextProps,
            },
          ],
          SiteNameSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                data: {
                  text: siteName,
                },
                styles: {
                  align: "center",
                  level: 4,
                },
              } satisfies HeadingTextProps,
            },
          ],
          BreadcrumbsSlot: [
            {
              type: "BreadcrumbsSlot",
              props: {
                data: {
                  directoryRoot: breadcrumbRoot,
                },
                styles: {
                  backgroundColor: breadcrumbBackgroundColor,
                },
                liveVisibility: true,
                analytics: props.analytics,
              } satisfies BreadcrumbsSectionProps,
            },
          ],
          DirectoryGrid: [
            {
              type: "DirectoryGrid",
              props: {
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
