import { Migration } from "../../utils/migrate";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";
import { EventSectionType } from "../../types/types";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
import { resolveComponentData } from "../../utils/resolveComponentData";

export const eventSectionSlots: Migration = {
  EventSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean =
        props.data.events.constantValueEnabled;
      const events = resolveYextEntityField(
        streamDocument,
        props.data.events as YextEntityField<EventSectionType>,
        streamDocument?.locale || "en"
      )?.events;

      const cards =
        events?.map((event, i) => {
          const resolvedTitle = event.title
            ? resolveComponentData(
                event.title,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";
          const resolvedDescription = event.description
            ? resolveComponentData(
                event.description,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";
          const resolvedDateTime = event.dateTime
            ? resolveComponentData(
                event.dateTime,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";

          const cardId = `${props.id}-Card-${i}`;
          return {
            type: "EventCard",
            props: {
              id: cardId,
              styles: {
                backgroundColor: props.styles.cards.backgroundColor,
                truncateDescription: props.styles.cards.truncateDescription,
              },
              slots: {
                ImageSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: `${cardId}-ImageSlot`,
                      data: {
                        image: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: event.image || {
                            url: "",
                            height: 360,
                            width: 640,
                          },
                        },
                      },
                      styles: {
                        width: event.image?.width || 640,
                        aspectRatio:
                          event.image?.width && event.image?.height
                            ? event.image.width / event.image.height
                            : 16 / 9,
                      },
                      className: "max-w-full h-full object-cover",
                      sizes: {
                        base: "calc(100vw - 32px)",
                        lg: "calc(maxWidth * 0.45)",
                      },
                      hideWidthProp: true,
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            image: event.image,
                          },
                    },
                  },
                ],
                DateTimeSlot: [
                  {
                    type: "Timestamp",
                    props: {
                      id: `${cardId}-DateTimeSlot`,
                      data: {
                        date: {
                          field: "",
                          constantValueEnabled,
                          constantValue: resolvedDateTime || "",
                        },
                        endDate: {
                          field: "",
                          constantValueEnabled: false,
                          constantValue: resolvedDateTime || "",
                        },
                      },
                      styles: {
                        includeTime: true,
                        includeRange: false,
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            date: resolvedDateTime,
                          },
                    },
                  },
                ],
                TitleSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
                      id: `${cardId}-TitleSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: event.title ?? "",
                        },
                      },
                      styles: {
                        level: props.styles.cards.headingLevel,
                        align: "left",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            text: resolvedTitle,
                          },
                    },
                  },
                ],
                DescriptionSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-DescriptionSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: event.description ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentStyles: {
                        className: props.styles.cards.truncateDescription
                          ? "md:line-clamp-3"
                          : "",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: event.description,
                          },
                    },
                  },
                ],
                CTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: `${cardId}-CTASlot`,
                      data: {
                        entityField: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: {
                            label: event.cta?.label,
                            link: event.cta?.link,
                            linkType: event.cta?.linkType,
                            ctaType: "textAndLink",
                          },
                        },
                      },
                      styles: {
                        variant: props.styles.cards.ctaVariant,
                        presetImage: "app-store",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            cta: event.cta,
                          },
                      eventName: `cta${i}`,
                    },
                  },
                ],
              },
              conditionalRender: {
                image: !!event?.image?.url,
                title: !!resolvedTitle,
                dateTime: !!resolvedDateTime,
                description: !!resolvedDescription,
                cta: !!event?.cta?.label,
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.field,
                    event,
                  },
            },
          };
        }) || [];

      return {
        id: props.id,
        analytics: props.analytics,
        liveVisibility: props.liveVisibility,
        styles: {
          backgroundColor: props.styles.backgroundColor,
        },
        slots: {
          SectionHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-SectionHeadingSlot`,
                data: {
                  text: {
                    field: props.data.heading?.field ?? "",
                    constantValueEnabled:
                      props.data.heading?.constantValueEnabled ?? true,
                    constantValue: props.data.heading?.constantValue ?? "",
                  },
                },
                styles: props.styles.heading,
              },
            },
          ],
          CardsWrapperSlot: [
            {
              type: "EventCardsWrapper",
              props: {
                id: `${props.id}-CardsWrapperSlot`,
                data: {
                  field: props.data.events.field,
                  constantValueEnabled: props.data.events.constantValueEnabled,
                  constantValue: cards.map((c) => ({
                    id: c.props.id,
                  })),
                },
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
