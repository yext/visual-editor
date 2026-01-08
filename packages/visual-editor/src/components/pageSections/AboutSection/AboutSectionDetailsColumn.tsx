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
  content: {
    type: "hours" | "address" | "phone" | "emails" | "textList" | "socialMedia";
    hours?: {
      data: HoursStatusProps["data"];
      styles: Omit<HoursStatusProps["styles"], "className">;
    };
    address?: AddressProps;
    phone?: {
      data: PhoneProps["data"];
      styles: PhoneProps["styles"];
    };
    emails?: EmailsProps;
    textList?: TextListProps;
    socialMedia?: FooterSocialLinksSlotProps;
  };
};

export const defaultAboutSectionProps: Omit<DetailSection["content"], "type"> =
  {
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
    },
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
    },
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
    },
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
    },
    textList: {
      list: {
        field: "",
        constantValue: [],
        constantValueEnabled: true,
      },
      commaSeparated: false,
    },
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
        mobileAlignment: "left",
      },
    },
  };

const typeToFields: Record<DetailSection["content"]["type"], Fields<any>> = {
  hours: hoursStatusWrapperFields,
  address: addressFields,
  phone: PhoneFields,
  emails: EmailsFields,
  textList: textListFields,
  socialMedia: FooterSocialLinksSlotFields,
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
                      onChange({ type: v, [v]: defaultAboutSectionProps[v] });
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
                <AutoField
                  value={
                    value?.[value.type] ?? defaultAboutSectionProps[value.type]
                  }
                  onChange={(v) =>
                    onChange({ type: value.type, [value.type]: v })
                  }
                  field={{
                    type: "object",
                    objectFields: typeToFields[value.type],
                  }}
                />
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
          hours: defaultAboutSectionProps.hours,
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

const typeToRenderFunctions: Record<
  DetailSection["content"]["type"],
  PuckComponent<any>
> = {
  hours: HoursStatus.render,
  address: Address.render,
  phone: Phone.render,
  emails: Emails.render,
  textList: TextList.render,
  socialMedia: FooterSocialLinksSlot.render,
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
        const Component = typeToRenderFunctions[section.content.type];

        return (
          <div
            key={`${section.content.type}-${i}`}
            className={`border-t pt-8 ${i == 0 ? "lg:border-t-0 lg:pt-0" : ""} border-[#BABABA] flex flex-col gap-4`}
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
              {section?.content?.[section?.content?.type] && (
                <Component
                  {...section.content[section.content.type]}
                  puck={puck}
                  id={`${id}-${section.content.type}-${i}`}
                />
              )}
              {section.content.type === "hours" &&
                section.content.hours &&
                streamDocument.additionalHoursText && (
                  <EntityField
                    displayName={pt("hoursText", "Hours Text")}
                    fieldId="additionalHoursText"
                  >
                    <Body variant="sm" className="mt-4">
                      {streamDocument.additionalHoursText}
                    </Body>
                  </EntityField>
                )}
            </div>
          </div>
        );
      })}
      {sections.length === 0 && puck.isEditing && (
        <div style={{ minHeight: "500px" }}></div>
      )}
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
