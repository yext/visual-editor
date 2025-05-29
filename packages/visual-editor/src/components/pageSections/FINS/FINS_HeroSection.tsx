import { ComponentConfig, Fields } from "@measured/puck";
import { Address, AddressType, getDirections } from "@yext/pages-components";
import {
  BackgroundStyle,
  Image,
  VisibilityWrapper,
  YextField,
  useDocument,
  PageSection,
  EntityField,
  backgroundColors,
  CTA,
  CTAProps,
  HeadingLevel,
  YextEntityField,
  resolveYextEntityField,
  Heading,
  Body,
  Background,
  PhoneAtom,
  ComponentFields,
  HeroSectionType,
  YextStructEntityField,
  YextStructFieldSelector,
  resolveYextStructField,
} from "@yext/visual-editor";
import { FaRegEnvelope } from "react-icons/fa";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/350x240";

export interface FINS_HeroSectionProps {
  data: {
    hero: YextStructEntityField<HeroSectionType>;
    businessName: YextEntityField<string>;
    title: YextEntityField<string>;
    jobTitle: YextEntityField<string>;
    nmls: YextEntityField<string>;
    address: YextEntityField<AddressType>;
    phoneNumbers: Array<{ number: YextEntityField<string>; label: string }>;
    emails: YextEntityField<string[]>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
    jobTitleLevel: HeadingLevel;
    primaryCTA: CTAProps["variant"];
    secondaryCTA: CTAProps["variant"];
    showGetDirectionsLink: boolean;
    phoneFormat: "domestic" | "international";
    includePhoneHyperlink: boolean;
    listLength: number;
  };
  liveVisibility: boolean;
}

const heroSectionFields: Fields<FINS_HeroSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      hero: YextStructFieldSelector({
        label: "Hero",
        filter: {
          type: ComponentFields.HeroSection.type,
        },
      }),
      businessName: YextField<any, string>("Business Name", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      title: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      jobTitle: YextField<any, string>("Job Title", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      nmls: YextField<any, string>("NMLS Number", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      address: YextField<any, AddressType>("Address", {
        type: "entityField",
        filter: { types: ["type.address"] },
      }),
      phoneNumbers: YextField("Phone Numbers", {
        type: "array",
        arrayFields: {
          number: YextField<any, string>("Phone Number", {
            type: "entityField",
            filter: {
              types: ["type.phone"],
            },
          }),
          label: YextField("Label", {
            type: "text",
          }),
        },
        getItemSummary: (item) => item.label || "Item",
      }),
      emails: YextField<any, string[]>("Emails", {
        type: "entityField",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
          allowList: ["emails"],
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      jobTitleLevel: YextField("Job Title Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      primaryCTA: YextField("Primary CTA Variant", {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      secondaryCTA: YextField("Secondary CTA Variant", {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      showGetDirectionsLink: YextField("Show Get Directions Link", {
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      }),
      phoneFormat: YextField("Phone Format", {
        type: "radio",
        options: "PHONE_OPTIONS",
      }),
      includePhoneHyperlink: YextField("Include Phone Hyperlink", {
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      }),
      listLength: YextField("Emails List Length", {
        type: "number",
        min: 0,
        max: 3,
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const HeroSectionWrapper = ({
  data: {
    businessName,
    hero,
    title,
    address,
    phoneNumbers,
    emails,
    nmls,
    jobTitle,
  },
  styles: {
    backgroundColor,
    headingLevel,
    jobTitleLevel,
    primaryCTA,
    secondaryCTA,
    showGetDirectionsLink,
    phoneFormat,
    includePhoneHyperlink,
    listLength,
  },
}: FINS_HeroSectionProps) => {
  const document = useDocument();
  const resolvedHero = resolveYextStructField(document, hero);
  const resolvedName = resolveYextEntityField(document, title);
  const resolvedBusinessName = resolveYextEntityField(document, businessName);
  const resolvedJobTitle = resolveYextEntityField(document, jobTitle);
  const resolvedNMLS = resolveYextEntityField(document, nmls);
  const resolvedAddress = resolveYextEntityField<AddressType>(
    document,
    address
  );
  const resolvedEmails = resolveYextEntityField<string[]>(document, emails);
  const coordinates = getDirections(
    resolvedAddress as AddressType,
    undefined,
    undefined,
    { provider: "google" }
  );
  return (
    <PageSection
      background={backgroundColor}
      aria-label="Hero Banner"
      className="flex flex-col md:flex-row gap-6 md:gap-14 w-full"
    >
      {resolvedHero?.image && (
        <div className="w-full md:w-1/3 !h-full">
          <EntityField
            displayName="Image"
            fieldId={hero.field}
            constantValueEnabled={hero.constantValueOverride.image}
          >
            <Image
              image={resolvedHero?.image}
              layout="auto"
              aspectRatio={
                resolvedHero?.image.width / resolvedHero?.image.height
              }
            />
          </EntityField>
        </div>
      )}
      <section
        className="flex flex-col gap-y-6 break-words md:gap-y-8 md:w-2/3 full"
        aria-labelledby="hero-heading"
      >
        <header className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="w-full flex flex-col gap-1 text-center md:text-left">
              {resolvedBusinessName && (
                <EntityField
                  displayName="Business Name"
                  fieldId={businessName.field}
                  constantValueEnabled={businessName.constantValueEnabled}
                >
                  <Body variant={"lg"} className="font-bold">
                    {resolvedBusinessName}
                  </Body>
                </EntityField>
              )}
              {resolvedName && (
                <EntityField
                  displayName="Name"
                  fieldId={title.field}
                  constantValueEnabled={title.constantValueEnabled}
                >
                  <Heading level={headingLevel}>{resolvedName}</Heading>
                </EntityField>
              )}
            </div>
            {(resolvedJobTitle || resolvedNMLS) && (
              <div className="flex flex-col gap-2 text-center md:text-left">
                {resolvedJobTitle && (
                  <EntityField
                    displayName="Job Title"
                    fieldId={jobTitle.field}
                    constantValueEnabled={jobTitle.constantValueEnabled}
                  >
                    <Heading
                      level={jobTitleLevel}
                      semanticLevelOverride={
                        headingLevel < 6
                          ? ((headingLevel + 1) as HeadingLevel)
                          : "span"
                      }
                    >
                      {resolvedJobTitle}
                    </Heading>
                  </EntityField>
                )}
                {resolvedNMLS && (
                  <EntityField
                    displayName="NMLS Number"
                    fieldId={nmls.field}
                    constantValueEnabled={nmls.constantValueEnabled}
                  >
                    <Body className="font-bold">{resolvedNMLS}</Body>
                  </EntityField>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:gap-8 gap-4">
            {resolvedAddress && (
              <section
                className="w-full md:w-1/2 flex flex-col gap-2"
                aria-label="Address Section"
              >
                <EntityField
                  displayName="Address"
                  fieldId={address.field}
                  constantValueEnabled={address.constantValueEnabled}
                >
                  <Address
                    className="not-italic"
                    address={resolvedAddress}
                    lines={[
                      ["line1"],
                      ["line2"],
                      ["city", ",", "region", "postalCode"],
                    ]}
                  />
                </EntityField>
                {coordinates && showGetDirectionsLink && (
                  <CTA
                    link={coordinates}
                    label="Get Directions"
                    linkType="DRIVING_DIRECTIONS"
                    target="_blank"
                    variant="link"
                  />
                )}
              </section>
            )}
            <section
              className="w-full md:w-1/2 flex flex-col gap-4"
              aria-label="Contact Information"
            >
              {phoneNumbers && (
                <ul className="flex flex-col gap-4" role="list">
                  {phoneNumbers.map((item) => {
                    const resolvedNumber = resolveYextEntityField<string>(
                      document,
                      item.number
                    );
                    if (!resolvedNumber) return;

                    return (
                      <li key={item.label} className="flex gap-2 items-center">
                        <EntityField
                          displayName="Phone Number"
                          fieldId={item.number.field}
                          constantValueEnabled={
                            item.number.constantValueEnabled
                          }
                        >
                          <div className="flex items-center gap-3">
                            <PhoneAtom
                              backgroundColor={
                                backgroundColors.background2.value
                              }
                              label={item.label}
                              phoneNumber={resolvedNumber}
                              format={phoneFormat}
                              includeHyperlink={includePhoneHyperlink}
                              includeIcon={true}
                            />
                          </div>
                        </EntityField>
                      </li>
                    );
                  })}
                </ul>
              )}
              {resolvedEmails && (
                <EntityField
                  displayName="Email List"
                  fieldId={emails.field}
                  constantValueEnabled={emails.constantValueEnabled}
                >
                  <ul className="list-inside flex flex-col gap-4">
                    {resolvedEmails
                      .slice(0, Math.min(resolvedEmails.length, listLength))
                      .map((email, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Background
                            background={backgroundColors.background2.value}
                            className="h-10 w-10 flex justify-center rounded-full items-center"
                          >
                            <FaRegEnvelope className="w-4 h-4" />
                          </Background>
                          <CTA
                            link={email}
                            label={email}
                            linkType="EMAIL"
                            variant="link"
                          />
                        </li>
                      ))}
                  </ul>
                </EntityField>
              )}
            </section>
          </div>
        </header>
        {(resolvedHero?.primaryCta?.label ||
          resolvedHero?.secondaryCta?.label) && (
          <div
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label="Call to Actions"
          >
            {resolvedHero?.primaryCta?.label && (
              <EntityField
                displayName="Primary CTA"
                fieldId={hero.field}
                constantValueEnabled={hero.constantValueOverride.primaryCta}
              >
                <CTA
                  variant={primaryCTA}
                  label={resolvedHero.primaryCta.label}
                  link={resolvedHero.primaryCta.link}
                  linkType={resolvedHero.primaryCta.linkType}
                  className={"py-3"}
                />
              </EntityField>
            )}
            {resolvedHero?.secondaryCta?.label && (
              <EntityField
                displayName="Secondary CTA"
                fieldId={hero.field}
                constantValueEnabled={hero.constantValueOverride.secondaryCta}
              >
                <CTA
                  variant={secondaryCTA}
                  label={resolvedHero.secondaryCta.label}
                  link={resolvedHero.secondaryCta.link}
                  linkType={resolvedHero.secondaryCta.linkType}
                  className={"py-3"}
                />
              </EntityField>
            )}
          </div>
        )}
      </section>
    </PageSection>
  );
};

export const FINS_HeroSection: ComponentConfig<FINS_HeroSectionProps> = {
  label: "FINS - Hero Section",
  fields: heroSectionFields,
  defaultProps: {
    data: {
      businessName: {
        field: "",
        constantValue: "Business Name",
        constantValueEnabled: true,
      },
      title: {
        field: "name",
        constantValue: "",
      },
      jobTitle: {
        field: "",
        constantValue: "Job Title",
        constantValueEnabled: true,
      },
      nmls: {
        field: "nmlsNumber",
        constantValue: "",
      },
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
        },
      },
      phoneNumbers: [
        {
          number: {
            field: "mainPhone",
            constantValue: "",
          },
          label: "Phone",
        },
      ],
      emails: {
        field: "emails",
        constantValue: [],
      },
      hero: {
        field: "",
        constantValue: {
          image: {
            height: 360,
            width: 640,
            url: PLACEHOLDER_IMAGE_URL,
          },
          primaryCta: {
            label: "Call To Action",
            link: "#",
            linkType: "URL",
          },
          secondaryCta: {
            label: "Call To Action",
            link: "#",
            linkType: "URL",
          },
        },
        constantValueOverride: {
          image: false,
          primaryCta: false,
          secondaryCta: false,
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      headingLevel: 1,
      jobTitleLevel: 5,
      primaryCTA: "primary",
      secondaryCTA: "secondary",
      showGetDirectionsLink: true,
      listLength: 1,
      phoneFormat: "domestic",
      includePhoneHyperlink: true,
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <HeroSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
