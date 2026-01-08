import React from "react";
import {
  AutoField,
  ComponentConfig,
  FieldLabel,
  Fields,
  PuckComponent,
} from "@measured/puck";
import { useTranslation } from "react-i18next";
import {
  Body,
  EntityField,
  FooterSocialLinksSlotProps,
  Heading,
  msg,
  pt,
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextField,
} from "@yext/visual-editor";
import {
  HoursStatus,
  HoursStatusProps,
  hoursStatusWrapperFields,
} from "../../contentBlocks/HoursStatus";
import { Phone, PhoneProps, PhoneFields } from "../../contentBlocks/Phone";
import { Emails, EmailsProps, EmailsFields } from "../../contentBlocks/Emails";
import {
  TextList,
  TextListProps,
  textListFields,
} from "../../contentBlocks/TextList";
import {
  FooterSocialLinksSlot,
  FooterSocialLinksSlotFields,
} from "../../footer/FooterSocialLinksSlot";
import {
  addressFields,
  Address,
  AddressProps,
} from "../../contentBlocks/Address";

type DetailSection = {
  header: YextEntityField<TranslatableString>;
  content:
    | {
        type: "hours";
        hours: {
          data: HoursStatusProps["data"];
          styles: Omit<HoursStatusProps["styles"], "className">;
        };
      }
    | {
        type: "address";
        address: AddressProps;
      }
    | {
        type: "phone";
        phone: {
          data: PhoneProps["data"];
          styles: PhoneProps["styles"];
        };
      }
    | {
        type: "emails";
        emails: EmailsProps;
      }
    | {
        type: "textList";
        textList: TextListProps;
      }
    | {
        type: "socialMedia";
        socialMedia: FooterSocialLinksSlotProps;
      };
};

const defaultProps = {
  hours: {
    data: {
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
    },
    styles: {
      showCurrentStatus: true,
      showDayNames: false,
      timeFormat: "12h" as const,
      dayOfWeekFormat: "short" as const,
    },
  } satisfies HoursStatusProps,
  address: {
    data: {
      address: {
        field: "address",
        constantValue: {} as AddressProps["data"]["address"]["constantValue"],
        constantValueEnabled: false,
      },
    },
    styles: {
      showGetDirectionsLink: false,
      ctaVariant: "link",
    },
  } satisfies AddressProps,
  phone: {
    data: {
      number: {
        field: "mainPhone",
        constantValue: "",
        constantValueEnabled: false,
      },
      label: {
        en: "Phone",
        hasLocalizedValue: "true",
      },
    },
    styles: {
      phoneFormat: "domestic",
      includePhoneHyperlink: false,
    },
  } satisfies PhoneProps,
  emails: {
    data: {
      list: {
        field: "emails",
        constantValue: [],
        constantValueEnabled: true,
      },
    },
    styles: {
      listLength: 1,
    },
  } satisfies EmailsProps,
  textList: {
    list: {
      field: "",
      constantValue: [],
      constantValueEnabled: true,
    },
    commaSeparated: false,
  } satisfies TextListProps,
  socialMedia: {
    data: {
      xLink: "",
      facebookLink: "",
      instagramLink: "",
      linkedInLink: "",
      pinterestLink: "",
      tiktokLink: "",
      youtubeLink: "",
    },
    styles: {
      filledBackground: true,
    },
  } satisfies FooterSocialLinksSlotProps,
};

export type AboutSectionDetailsColumnProps = {
  sections: DetailSection[];
};

const aboutSectionDetailsColumnFields: Fields<AboutSectionDetailsColumnProps> =
  {
    sections: {
      type: "array",
      label: msg("fields.sections", "Sections"),
      arrayFields: {
        header: YextField<any, TranslatableString>(
          msg("fields.header", "Header"),
          {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }
        ),
        content: {
          type: "custom",
          label: msg("fields.content", "Content"),
          render: (props) => {
            const { value, onChange } = props;

            return (
              <div>
                <FieldLabel
                  label={pt("fields.contentType", "Content Type")}
                  el="div"
                  className="mb-3"
                >
                  <AutoField
                    value={value.type}
                    onChange={(v) => {
                      switch (v) {
                        case "hours":
                          return onChange({
                            type: v,
                            hours: defaultProps.hours,
                          });
                        case "address":
                          return onChange({
                            type: v,
                            address: defaultProps.address,
                          });
                        case "phone":
                          return onChange({
                            type: v,
                            phone: defaultProps.phone,
                          });
                        case "emails":
                          return onChange({
                            type: v,
                            emails: defaultProps.emails,
                          });
                        case "textList":
                          return onChange({
                            type: v,
                            textList: defaultProps.textList,
                          });
                        case "socialMedia":
                          return onChange({
                            type: v,
                            socialMedia: defaultProps.socialMedia,
                          });
                      }
                    }}
                    field={{
                      type: "select",
                      label: msg("fields.contentType", "Content Type"),
                      options: [
                        {
                          label: msg("fields.hours", "Hours"),
                          value: "hours",
                        },
                        {
                          label: msg("fields.address", "Address"),
                          value: "address",
                        },
                        {
                          label: msg("fields.phone", "Phone"),
                          value: "phone",
                        },
                        {
                          label: msg("fields.emails", "Emails"),
                          value: "emails",
                        },
                        {
                          label: msg("fields.textList", "Text List"),
                          value: "textList",
                        },
                        {
                          label: msg("fields.socialMedia", "Social Media"),
                          value: "socialMedia",
                        },
                      ],
                    }}
                  />
                </FieldLabel>
                {value.type === "hours" && (
                  <AutoField
                    value={value.hours ?? defaultProps.hours}
                    onChange={(v) => onChange({ type: "hours", hours: v })}
                    field={{
                      type: "object",
                      objectFields: hoursStatusWrapperFields,
                    }}
                  />
                )}
                {value.type === "address" && (
                  <AutoField
                    value={value.address ?? defaultProps.address}
                    onChange={(v) => onChange({ type: "address", address: v })}
                    field={{
                      type: "object",
                      objectFields: addressFields,
                    }}
                  />
                )}
                {value.type === "phone" && (
                  <AutoField
                    value={value.phone ?? defaultProps.phone}
                    onChange={(v) => onChange({ type: "phone", phone: v })}
                    field={{
                      type: "object",
                      objectFields: PhoneFields,
                    }}
                  />
                )}
                {value.type === "emails" && (
                  <AutoField
                    value={value.emails ?? defaultProps.emails}
                    onChange={(v) => onChange({ type: "emails", emails: v })}
                    field={{
                      type: "object",
                      objectFields: EmailsFields,
                    }}
                  />
                )}
                {value.type === "textList" && (
                  <AutoField
                    value={value.textList ?? defaultProps.textList}
                    onChange={(v) =>
                      onChange({ type: "textList", textList: v })
                    }
                    field={{
                      type: "object",
                      objectFields: textListFields,
                    }}
                  />
                )}
                {value.type === "socialMedia" && (
                  <AutoField
                    value={value.socialMedia ?? defaultProps.socialMedia}
                    onChange={(v) =>
                      onChange({ type: "socialMedia", socialMedia: v })
                    }
                    field={{
                      type: "object",
                      objectFields: FooterSocialLinksSlotFields,
                    }}
                  />
                )}
              </div>
            );
          },
        },
      },
      defaultItemProps: {
        header: {
          field: "",
          constantValue: { en: "Header", hasLocalizedValue: "true" },
          constantValueEnabled: true,
        },
        content: {
          type: "hours",
          hours: defaultProps.hours,
        },
      },
      getItemSummary: (item, i) => {
        const { i18n } = useTranslation();
        return (
          resolveComponentData(item.header, i18n.language) ||
          pt("section", "Section") + " " + ((i ?? 0) + 1)
        );
      },
    },
  };

const AboutSectionDetailsColumnComponent: PuckComponent<
  AboutSectionDetailsColumnProps
> = (props) => {
  const { sections, puck, id } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, i) => {
        return (
          <div
            key={`${section.content.type}-${i}`}
            className={`border-t ${i == 0 ? "lg:border-t-0" : ""} border-[#BABABA] flex flex-col gap-4 pt-8`}
          >
            <EntityField
              fieldId={section.header.field}
              displayName={pt("fields.sectionHeader", "Section Header")}
              constantValueEnabled={section.header.constantValueEnabled}
            >
              <Heading level={5}>
                {resolveComponentData(
                  section.header,
                  i18n.language,
                  streamDocument
                )}
              </Heading>
            </EntityField>
            <div>
              {section.content.type === "hours" && section.content.hours && (
                <>
                  <HoursStatus.render
                    {...section.content.hours}
                    puck={puck}
                    id={`${id}-hours-${i}`}
                  />

                  {streamDocument.additionalHoursText && (
                    <EntityField
                      displayName={pt("hoursText", "Hours Text")}
                      fieldId="additionalHoursText"
                    >
                      <Body variant="sm" className="mt-4">
                        {streamDocument.additionalHoursText}
                      </Body>
                    </EntityField>
                  )}
                </>
              )}
              {section.content.type === "address" &&
                section.content.address && (
                  <Address.render
                    {...section.content.address}
                    puck={puck}
                    id={`${id}-address-${i}`}
                  />
                )}
              {section.content.type === "phone" && section.content.phone && (
                <Phone.render
                  {...section.content.phone}
                  puck={puck}
                  id={`${id}-phone-${i}`}
                />
              )}
              {section.content.type === "emails" && section.content.emails && (
                <Emails.render
                  {...section.content.emails}
                  puck={puck}
                  id={`${id}-emails-${i}`}
                />
              )}
              {section.content.type === "textList" &&
                section.content.textList && (
                  <TextList.render
                    {...section.content.textList}
                    puck={puck}
                    id={`${id}-textList-${i}`}
                  />
                )}
              {section.content.type === "socialMedia" &&
                section.content.socialMedia && (
                  <FooterSocialLinksSlot.render
                    {...section.content.socialMedia}
                    puck={puck}
                    id={`${id}-socialMedia-${i}`}
                  />
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const AboutSectionDetailsColumn: ComponentConfig<{
  props: AboutSectionDetailsColumnProps;
}> = {
  label: msg("components.aboutSectionDetailsColumn", "Details Column"),
  fields: aboutSectionDetailsColumnFields,
  defaultProps: {
    sections: [],
  },
  render: (props) => <AboutSectionDetailsColumnComponent {...props} />,
};
