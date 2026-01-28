import React from "react";
import {
  AutoField,
  ComponentConfig,
  FieldLabel,
  Fields,
  PuckComponent,
} from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import {
  Body,
  EntityField,
  FooterSocialLinksSlotProps,
  Heading,
  HeadingLevel,
  i18nComponentsInstance,
  msg,
  pt,
  resolveComponentData,
  resolveYextEntityField,
  StreamDocument,
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
  resolveAddressFields,
} from "../../contentBlocks/Address";
import {
  HoursTableProps,
  hoursTableFields,
  HoursTable,
} from "../../contentBlocks/HoursTable";

export type AboutSectionDetailsColumnProps = {
  sections: DetailSection[];
  headingLevelOverride?: HeadingLevel | "span";
};

type DetailSection = {
  header: YextEntityField<TranslatableString>;
  content: {
    type:
      | "hoursStatus"
      | "hoursTable"
      | "address"
      | "phone"
      | "emails"
      | "textList"
      | "socialMedia";
    hoursStatus?: {
      data: HoursStatusProps["data"];
      styles: Omit<HoursStatusProps["styles"], "className">;
    };
    hoursTable?: HoursTableProps;
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
    hoursStatus: {
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
    hoursTable: {
      data: {
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        },
      },
      styles: {
        startOfWeek: "today",
        collapseDays: false,
        showAdditionalHoursText: true,
        alignment: "items-start",
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

const typeToFields = (
  type: DetailSection["content"]["type"],
  data: DetailSection["content"]
) => {
  const fields: Record<DetailSection["content"]["type"], Fields<any>> = {
    hoursStatus: hoursStatusWrapperFields,
    hoursTable: hoursTableFields,
    address:
      "address" in data && data.address
        ? resolveAddressFields({ props: { id: "", ...data.address } })
        : addressFields,
    phone: PhoneFields,
    emails: EmailsFields,
    textList: textListFields,
    socialMedia: FooterSocialLinksSlotFields,
  };
  return fields[type];
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
                          label: msg(
                            "fields.options.HoursStatus",
                            "Hours Status"
                          ),
                          value: "hoursStatus",
                        },
                        {
                          label: msg(
                            "fields.options.HoursTable",
                            "Hours Table"
                          ),
                          value: "hoursTable",
                        },
                        {
                          label: msg("fields.options.address", "Address"),
                          value: "address",
                        },
                        {
                          label: msg("fields.options.phone", "Phone"),
                          value: "phone",
                        },
                        {
                          label: msg("fields.options.emails", "Emails"),
                          value: "emails",
                        },
                        {
                          label: msg("fields.options.textList", "Text List"),
                          value: "textList",
                        },
                        {
                          label: msg(
                            "fields.options.socialMedia",
                            "Social Media"
                          ),
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
                    objectFields: typeToFields(value.type, value),
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
          type: "hoursStatus",
          hoursStatus: defaultAboutSectionProps.hoursStatus,
        },
      },
      getItemSummary: (item, i) => {
        const locale = i18nComponentsInstance.language || "en";
        return (
          resolveComponentData(item.header, locale) ||
          pt("section", "Section") + " " + ((i ?? 0) + 1)
        );
      },
    },
  };

const typeToRenderFunctions: Record<
  DetailSection["content"]["type"],
  PuckComponent<any>
> = {
  hoursStatus: HoursStatus.render,
  hoursTable: HoursTable.render,
  address: Address.render,
  phone: Phone.render,
  emails: Emails.render,
  textList: TextList.render,
  socialMedia: FooterSocialLinksSlot.render,
};

/** Resolves the data for each section type and returns whether the section should be displayed. */
const filterEmptySections = (
  section: DetailSection,
  streamDocument: StreamDocument,
  locale: string
): boolean => {
  switch (section.content.type) {
    case "hoursStatus": {
      if (!section?.content?.hoursStatus?.data?.hours) {
        return false;
      }

      return !!resolveYextEntityField(
        streamDocument,
        section.content.hoursStatus.data.hours,
        locale
      );
    }
    case "hoursTable": {
      if (!section?.content?.hoursTable?.data?.hours) {
        return false;
      }

      return !!resolveYextEntityField(
        streamDocument,
        section.content.hoursTable.data.hours,
        locale
      );
    }
    case "address": {
      if (!section?.content?.address?.data?.address) {
        return false;
      }

      const address = resolveYextEntityField(
        streamDocument,
        section.content.address.data.address,
        locale
      );

      return !!(
        address?.line1 ||
        address?.line2 ||
        address?.city ||
        address?.region ||
        address?.postalCode
      );
    }
    case "phone": {
      if (!section?.content?.phone?.data?.number) {
        return false;
      }

      return !!resolveYextEntityField(
        streamDocument,
        section.content.phone.data.number,
        locale
      );
    }
    case "emails": {
      if (!section?.content?.emails?.data?.list) {
        return false;
      }

      const emails = resolveYextEntityField(
        streamDocument,
        section.content.emails.data.list,
        locale
      );

      return Array.isArray(emails) && emails.length > 0;
    }
    case "textList": {
      if (!section?.content?.textList?.list) {
        return false;
      }

      const textList = resolveComponentData(
        section.content.textList.list,
        locale,
        streamDocument
      ) as string[];

      return (
        Array.isArray(textList) && textList.filter((t) => t.trim()).length > 0
      );
    }
    case "socialMedia": {
      const socialMediaData = section?.content?.socialMedia?.data;

      if (!socialMediaData) {
        return false;
      }

      return Object.values(socialMediaData).some((link) => Boolean(link));
    }
  }
};

const AboutSectionDetailsColumnComponent: PuckComponent<
  AboutSectionDetailsColumnProps
> = (props) => {
  const { sections, headingLevelOverride, puck, id } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  const filteredSections = React.useMemo(
    () =>
      sections.filter((section) =>
        filterEmptySections(section, streamDocument, i18n.language)
      ),
    [sections, streamDocument, i18n.language]
  );

  return (
    <div className="flex flex-col gap-8">
      {filteredSections.map((section, i) => {
        const Component = typeToRenderFunctions[section.content.type];

        return (
          <div
            key={`${section.content.type}-${i}`}
            className={`border-t pt-8 ${i === 0 ? "lg:border-t-0 lg:pt-0" : ""} border-[#BABABA] flex flex-col gap-4`}
          >
            <EntityField
              fieldId={section.header.field}
              displayName={pt("fields.sectionHeader", "Section Header")}
              constantValueEnabled={section.header.constantValueEnabled}
            >
              <Heading level={5} semanticLevelOverride={headingLevelOverride}>
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
                  // Override bodyVariant to "base" for HoursStatus
                  {...(section.content.type === "hoursStatus" && {
                    styles: {
                      ...section.content.hoursStatus?.styles,
                      bodyVariant: "base",
                    },
                  })}
                />
              )}
              {section.content.type === "hoursStatus" &&
                section.content.hoursStatus &&
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
      {filteredSections.length === 0 && puck.isEditing && (
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
