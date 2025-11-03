import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate";
import { TeamSectionProps } from "../pageSections/TeamSection/TeamSection";
import { TeamCardProps } from "../pageSections/TeamSection/TeamCard";
import { TeamCardsWrapperProps } from "../pageSections/TeamSection/TeamCardsWrapper";
import { HeadingTextProps } from "../contentBlocks/HeadingText";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";
import { TeamSectionType } from "../../types/types";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
import { ImageWrapperProps } from "../contentBlocks/image/Image";
import { BodyTextProps } from "../contentBlocks/BodyText";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper";
import { resolveComponentData } from "../../utils/resolveComponentData";

export const teamsSectionSlots: Migration = {
  TeamSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean =
        props.data.people.constantValueEnabled;
      const team = resolveYextEntityField(
        streamDocument,
        props.data.people as YextEntityField<TeamSectionType>,
        streamDocument.meta?.locale
      )?.people;

      const cards =
        team?.map((person, i) => {
          const resolvedName = person.name
            ? resolveComponentData(
                person.name,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";
          return {
            type: "TeamCard",
            props: {
              id: `${props.id}-Card-${i}`,
              styles: {
                backgroundColor: props.styles.cards.backgroundColor,
              },
              slots: {
                ImageSlot: [
                  {
                    type: "ImageSlot",
                    props: {
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
                    } satisfies ImageWrapperProps,
                  },
                ],
                NameSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
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
                    } satisfies HeadingTextProps,
                  },
                ],
                TitleSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
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
                    } satisfies BodyTextProps,
                  },
                ],
                PhoneSlot: [
                  {
                    type: "PhoneNumbersSlot",
                    props: {
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
                      eventName: `phone${i}`,
                    },
                  },
                ],
                EmailSlot: [
                  {
                    type: "EmailsSlot",
                    props: {
                      data: {
                        list: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: person.email ? [person.email] : [],
                        },
                      },
                      eventName: `email${i}`,
                    },
                  },
                ],
                CTASlot: [
                  {
                    type: "CTASlot",
                    props: {
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
                      eventName: `cta${i}`,
                    } satisfies CTAWrapperProps,
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.people.field,
                    person,
                  },
            } satisfies WithId<TeamCardProps>,
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
                data: {
                  text: {
                    field: props.data.heading?.field ?? "",
                    constantValueEnabled:
                      props.data.heading?.constantValueEnabled ?? true,
                    constantValue: props.data.heading?.constantValue ?? "",
                  },
                },
                styles: props.styles.heading,
              } satisfies HeadingTextProps,
            },
          ],
          CardsWrapperSlot: [
            {
              type: "TeamCardsWrapper",
              props: {
                data: {
                  field: props.data.people.field,
                  constantValueEnabled: props.data.people.constantValueEnabled,
                  constantValue: cards.map((c) => ({ id: c.props.id })),
                },
                slots: {
                  CardSlot: cards,
                },
              } satisfies TeamCardsWrapperProps,
            },
          ],
        },
      } satisfies WithId<TeamSectionProps>;
    },
  },
};
