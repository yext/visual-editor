import { Migration } from "../../utils/migrate.ts";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { TeamSectionType } from "../../types/types.ts";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";

export const teamsSectionSlots: Migration = {
  TeamSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean =
        props.data.people.constantValueEnabled;
      const team = resolveYextEntityField(
        streamDocument,
        props.data.people as YextEntityField<TeamSectionType>,
        streamDocument?.meta?.locale || "en"
      )?.people;

      const cards =
        team?.map((person, i) => {
          const resolvedName = person.name
            ? resolveComponentData(
                person.name,
                streamDocument?.locale || "en",
                streamDocument
              )
            : "";
          const cardId = `${props.id}-Card-${i}`;
          return {
            type: "TeamCard",
            props: {
              id: cardId,
              styles: {
                backgroundColor: props.styles.cards.backgroundColor,
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
                          constantValue: person.headshot || {
                            url: "",
                            height: 80,
                            width: 80,
                          },
                        },
                      },
                      styles: {
                        width: person.headshot?.width || 80,
                        aspectRatio: 1,
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
                            field: props.data.people.field,
                            image: person.headshot,
                          },
                    },
                  },
                ],
                NameSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
                      id: `${cardId}-NameSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: person.name ?? "",
                        },
                      },
                      styles: {
                        level: props.styles.cards.headingLevel,
                        align: "left",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.people.field,
                            text: resolvedName,
                          },
                    },
                  },
                ],
                TitleSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-TitleSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: person.title ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.people.field,
                            richText: person.title,
                          },
                    },
                  },
                ],
                PhoneSlot: [
                  {
                    type: "PhoneNumbersSlot",
                    props: {
                      id: `${cardId}-PhoneSlot`,
                      data: {
                        phoneNumbers: person.phoneNumber
                          ? [
                              {
                                number: {
                                  field: "",
                                  constantValueEnabled: true,
                                  constantValue: person.phoneNumber,
                                },
                                label: {
                                  en: "",
                                  hasLocalizedValue: "true",
                                },
                              },
                            ]
                          : [],
                      },
                      styles: {
                        phoneFormat:
                          person.phoneNumber?.slice(0, 2) === "+1"
                            ? "domestic"
                            : "international",
                        includePhoneHyperlink: true,
                      },
                      eventName: `card${i}-phone`,
                    },
                  },
                ],
                EmailSlot: [
                  {
                    type: "EmailsSlot",
                    props: {
                      id: `${cardId}-EmailSlot`,
                      data: {
                        list: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: person.email ? [person.email] : [],
                        },
                      },
                      styles: {
                        listLength: 1,
                      },
                      eventName: `card${i}-email`,
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
                            label: person.cta?.label ?? "Visit Profile",
                            link: person.cta?.link ?? "#",
                            linkType: person.cta?.linkType ?? "URL",
                            ctaType: "textAndLink",
                          },
                        },
                      },
                      styles: {
                        variant: "primary",
                        presetImage: "app-store",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.people.field,
                            cta: person.cta,
                          },
                      eventName: `card${i}-cta`,
                    },
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.people.field,
                    person,
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
                id: `${props.id}-HeadingSlot`,
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
              type: "TeamCardsWrapper",
              props: {
                id: `${props.id}-CardsWrapperSlot`,
                data: {
                  field: props.data.people.field,
                  constantValueEnabled: props.data.people.constantValueEnabled,
                  constantValue: cards.map((c) => ({ id: c.props.id })),
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
