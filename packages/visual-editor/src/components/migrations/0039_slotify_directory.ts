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
                      } satisfies WithId<HeadingTextProps>,
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
                      } satisfies WithId<PhoneProps>,
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
                      } satisfies WithId<HoursStatusProps>,
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
                id: `${props.id}-TitleSlot`,
                data: {
                  text: title,
                },
                styles: {
                  align: "center",
                  level: 2,
                },
              } satisfies WithId<HeadingTextProps>,
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
              } satisfies WithId<HeadingTextProps>,
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
              } satisfies WithId<BreadcrumbsSectionProps>,
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
