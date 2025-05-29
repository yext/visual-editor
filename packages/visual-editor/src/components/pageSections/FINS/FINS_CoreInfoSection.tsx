import { ComponentConfig, Fields } from "@measured/puck";
import {
  HoursType,
  DayOfWeekNames,
  HoursTable,
  HoursStatus,
  Link,
} from "@yext/pages-components";
import {
  backgroundColors,
  BackgroundStyle,
  Body,
  EntityField,
  Heading,
  HeadingLevel,
  MaybeRTF,
  PageSection,
  RTF2,
  useBackground,
  useDocument,
  resolveYextEntityField,
  ComponentFields,
  YextEntityField,
  YextField,
  Image,
  VisibilityWrapper,
  AwardSectionType,
  AwardStruct,
} from "@yext/visual-editor";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion.js";

export interface FINS_CoreInfoSectionProps {
  data: {
    biography: {
      headingText: YextEntityField<string>;
      entityField: YextEntityField<RTF2 | string>;
    };
    awards: {
      headingText: YextEntityField<string>;
      entityField: YextEntityField<AwardSectionType>;
    };
    hours: {
      headingText: YextEntityField<string>;
      hours: YextEntityField<HoursType>;
    };
    services: {
      headingText: YextEntityField<string>;
      entityField: YextEntityField<string[]>;
    };
    areasServed: {
      headingText: YextEntityField<string>;
      entityField: YextEntityField<string[]>;
    };
    languages: {
      headingText: YextEntityField<string>;
      entityField: YextEntityField<string[]>;
    };
    education: {
      headingText: YextEntityField<string>;
      entityField: YextEntityField<string[]>;
    };
    followUs: {
      headingText: YextEntityField<string>;
    };
  };
  styles: {
    mainHeadingLevel: HeadingLevel;
    subHeadingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
    hours: {
      startOfWeek: keyof DayOfWeekNames | "today";
      showAdditionalHoursText: boolean;
    };
  };
  liveVisibility: boolean;
}

const coreInfoSectionFields: Fields<FINS_CoreInfoSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      biography: YextField("Biography", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          entityField: YextField("Description", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
        },
      }),
      awards: YextField("Awards", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: { types: ["type.string"] },
          }),
          entityField: YextField("Awards", {
            type: "entityField",
            filter: {
              types: [ComponentFields.AwardSection.type],
            },
          }),
        },
      }),
      hours: YextField("Hours", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          hours: YextField("Hours", {
            type: "entityField",
            filter: {
              types: ["type.hours"],
            },
          }),
        },
      }),
      services: YextField("Services Offered", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          entityField: YextField<any, string[]>("Services Offered", {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
              allowList: ["services"],
            },
          }),
        },
      }),
      areasServed: YextField("Areas Served", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          entityField: YextField<any, string[]>("Areas Served", {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
            },
          }),
        },
      }),
      languages: YextField("Languages Spoken", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          entityField: YextField<any, string[]>("Languages Spoken", {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
            },
          }),
        },
      }),
      education: YextField("Education", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          entityField: YextField<any, string[]>("Education", {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
            },
          }),
        },
      }),
      followUs: YextField("Follow Us", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
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
      mainHeadingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      subHeadingLevel: YextField("Sub Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      hours: YextField("Hours", {
        type: "object",
        objectFields: {
          startOfWeek: YextField("Start of the Week", {
            type: "select",
            hasSearch: true,
            options: "HOURS_OPTIONS",
          }),
          showAdditionalHoursText: YextField("Show additional hours text", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
        },
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

const AwardCard = ({ title, description, image }: AwardStruct) => {
  return (
    <section className="flex gap-2 md:gap-6 items-start md:items-center">
      {image && (
        <figure className="!w-1/3">
          <Image
            image={image}
            layout={"auto"}
            aspectRatio={image.width / image.height}
          />
        </figure>
      )}
      <div className="flex flex-col gap-1 w-2/3">
        <Body className="md:text-lg font-bold">{title}</Body>
        <MaybeRTF className="text-xs md:text-sm" data={description}></MaybeRTF>
      </div>
    </section>
  );
};

const CoreInfoSectionWrapper = ({
  data: {
    biography,
    hours,
    services,
    areasServed,
    languages,
    education,
    followUs,
    awards,
  },
  styles: {
    mainHeadingLevel,
    subHeadingLevel,
    backgroundColor,
    hours: { startOfWeek, showAdditionalHoursText },
  },
}: FINS_CoreInfoSectionProps) => {
  const document = useDocument();
  const resolvedBiographyHeading = resolveYextEntityField<string>(
    document,
    biography.headingText
  );
  const resolvedHoursHeading = resolveYextEntityField<string>(
    document,
    hours.headingText
  );
  const resolvedServicesHeading = resolveYextEntityField<string>(
    document,
    services.headingText
  );
  const resolvedAwardsHeading = resolveYextEntityField<string>(
    document,
    awards.headingText
  );
  const resolvedAreasServedHeading = resolveYextEntityField<string>(
    document,
    areasServed.headingText
  );
  const resolvedLanguagesHeading = resolveYextEntityField<string>(
    document,
    languages.headingText
  );
  const resolvedEducationHeading = resolveYextEntityField<string>(
    document,
    education.headingText
  );
  const resolvedFollowUsHeading = resolveYextEntityField<string>(
    document,
    followUs.headingText
  );
  const resolvedBiography = resolveYextEntityField<string | RTF2>(
    document,
    biography.entityField
  );
  const resolvedHours = resolveYextEntityField<HoursType>(
    document,
    hours.hours
  );
  const resolvedServices = resolveYextEntityField<string[]>(
    document,
    services.entityField
  );
  const resolvedAreasServed = resolveYextEntityField<string[]>(
    document,
    areasServed.entityField
  );
  const resolvedLanguages = resolveYextEntityField<string[]>(
    document,
    languages.entityField
  );
  const resolvedEducation = resolveYextEntityField<string[]>(
    document,
    education.entityField
  );
  const resolvedAwards = resolveYextEntityField(document, awards.entityField);
  const background = useBackground();
  const hasDarkBackground = background?.textColor === "text-white";
  const {
    additionalHoursText,
    twitterHandle,
    facebookPageUrl,
    instagramHandle,
    linkedInUrl,
    timezone,
  } = document as {
    additionalHoursText: string;
    twitterHandle: string;
    facebookPageUrl: string;
    instagramHandle: string;
    linkedInUrl: string;
    timezone: string;
  };

  return (
    <PageSection
      background={backgroundColor}
      aria-label="Core Info Section"
      className="flex flex-col md:flex-row gap-8 divide-y-2 md:divide-y-0"
    >
      <div className="w-full md:w-2/3 flex flex-col gap-8">
        <div className="flex flex-col gap-8 md:gap-16 divide-y-2 md:divide-y-0">
          {resolvedBiography && (
            <section aria-label="Biography" className="flex flex-col gap-8">
              {resolvedBiographyHeading && (
                <EntityField
                  displayName="Heading Text"
                  fieldId={biography.headingText.field}
                  constantValueEnabled={
                    biography.headingText.constantValueEnabled
                  }
                >
                  <Heading level={mainHeadingLevel}>
                    {resolvedBiographyHeading}
                  </Heading>
                </EntityField>
              )}
              <EntityField
                displayName="Description"
                fieldId={biography.entityField.field}
                constantValueEnabled={
                  biography.entityField.constantValueEnabled
                }
              >
                <MaybeRTF data={resolvedBiography} />
              </EntityField>
            </section>
          )}
          {resolvedAwards?.awards && (
            <section
              aria-label="Awards"
              className="flex flex-col gap-4 pt-4 md:pt-0"
            >
              <EntityField
                displayName="Heading Text"
                fieldId={awards.headingText.field}
                constantValueEnabled={awards.headingText.constantValueEnabled}
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedAwardsHeading}
                </Heading>
              </EntityField>
              <EntityField
                displayName="Award"
                fieldId={awards.entityField.field}
                constantValueEnabled={awards.entityField.constantValueEnabled}
              >
                <div className="flex flex-col gap-6">
                  {resolvedAwards.awards.map((award, index) => (
                    <AwardCard key={index} {...award} />
                  ))}
                </div>
              </EntityField>
            </section>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/3 flex flex-col divide-y-2">
        {resolvedHours && (
          <section
            aria-label="Hours Section"
            className="flex flex-col gap-4 py-8 first:md:pt-0 last:md:pb-0"
          >
            {resolvedHoursHeading && (
              <EntityField
                displayName="Heading Text"
                fieldId={hours.headingText.field}
                constantValueEnabled={hours.headingText.constantValueEnabled}
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedHoursHeading}
                </Heading>
              </EntityField>
            )}
            <Accordion type="single" collapsible>
              <AccordionItem value="hoursAccordion" className="border-b-0">
                <AccordionTrigger className="py-0 justify-start gap-3">
                  <EntityField
                    displayName="Hours"
                    fieldId={hours.hours.field}
                    constantValueEnabled={hours.hours.constantValueEnabled}
                  >
                    <HoursStatus
                      hours={resolvedHours}
                      timezone={timezone}
                      dayOfWeekTemplate={() => null}
                    />
                  </EntityField>
                </AccordionTrigger>
                <AccordionContent>
                  <HoursTable
                    className="pt-4 -mb-4"
                    hours={resolvedHours}
                    startOfWeek={startOfWeek}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {additionalHoursText && showAdditionalHoursText && (
              <EntityField
                displayName="Hours Text"
                fieldId="additionalHoursText"
              >
                <Body variant={"sm"}>{additionalHoursText}</Body>
              </EntityField>
            )}
          </section>
        )}
        {resolvedServices && resolvedServices.length > 0 && (
          <section
            aria-label="Services Section"
            className="flex flex-col gap-4 py-8 first:md:pt-0 last:md:pb-0"
          >
            {resolvedServicesHeading && (
              <EntityField
                displayName="Heading Text"
                fieldId={services.headingText.field}
                constantValueEnabled={services.headingText.constantValueEnabled}
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedServicesHeading}
                </Heading>
              </EntityField>
            )}
            <EntityField
              displayName="Text List"
              fieldId={services.entityField.field}
              constantValueEnabled={services.entityField.constantValueEnabled}
            >
              <ul className="list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
                {resolvedServices.map((text, index) => (
                  <li key={index} className="mb-2">
                    {text}
                  </li>
                ))}
              </ul>
            </EntityField>
          </section>
        )}
        {resolvedAreasServed && resolvedAreasServed.length > 0 && (
          <section
            aria-label="Areas Served Section"
            className="flex flex-col gap-4 py-8 first:md:pt-0 last:md:pb-0"
          >
            {resolvedAreasServedHeading && (
              <EntityField
                displayName="Heading Text"
                fieldId={areasServed.headingText.field}
                constantValueEnabled={
                  areasServed.headingText.constantValueEnabled
                }
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedAreasServedHeading}
                </Heading>
              </EntityField>
            )}
            <EntityField
              displayName="Text List"
              fieldId={areasServed.entityField.field}
              constantValueEnabled={
                areasServed.entityField.constantValueEnabled
              }
            >
              <ul className="list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
                {resolvedAreasServed.map((text, index) => (
                  <li key={index} className="mb-2">
                    {text}
                  </li>
                ))}
              </ul>
            </EntityField>
          </section>
        )}
        {resolvedLanguages && resolvedLanguages.length > 0 && (
          <section
            aria-label="Languages Section"
            className="flex flex-col gap-4 py-8 first:md:pt-0 last:md:pb-0"
          >
            {resolvedLanguagesHeading && (
              <EntityField
                displayName="Heading Text"
                fieldId={languages.headingText.field}
                constantValueEnabled={
                  languages.headingText.constantValueEnabled
                }
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedLanguagesHeading}
                </Heading>
              </EntityField>
            )}
            <EntityField
              displayName="Text List"
              fieldId={languages.entityField.field}
              constantValueEnabled={languages.entityField.constantValueEnabled}
            >
              <ul className="list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
                {resolvedLanguages.map((text, index) => (
                  <li key={index} className="mb-2">
                    {text}
                  </li>
                ))}
              </ul>
            </EntityField>
          </section>
        )}
        {resolvedEducation && resolvedEducation.length > 0 && (
          <section
            aria-label="Education Section"
            className="flex flex-col gap-4 py-8 first:md:pt-0 last:md:pb-0"
          >
            {resolvedEducationHeading && (
              <EntityField
                displayName="Heading Text"
                fieldId={education.headingText.field}
                constantValueEnabled={
                  education.headingText.constantValueEnabled
                }
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedEducationHeading}
                </Heading>
              </EntityField>
            )}
            <EntityField
              displayName="Text List"
              fieldId={education.entityField.field}
              constantValueEnabled={education.entityField.constantValueEnabled}
            >
              <ul className="list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
                {resolvedEducation.map((text, index) => (
                  <li key={index} className="mb-2">
                    {text}
                  </li>
                ))}
              </ul>
            </EntityField>
          </section>
        )}
        {(twitterHandle ||
          facebookPageUrl ||
          instagramHandle ||
          linkedInUrl) && (
          <section
            aria-label="Social Section"
            className="flex flex-col gap-4 py-8 first:md:pt-0 last:md:pb-0"
          >
            {resolvedFollowUsHeading && (
              <EntityField
                displayName="Heading Text"
                fieldId={followUs.headingText.field}
                constantValueEnabled={followUs.headingText.constantValueEnabled}
              >
                <Heading
                  semanticLevelOverride={
                    mainHeadingLevel < 6
                      ? ((mainHeadingLevel + 1) as HeadingLevel)
                      : "span"
                  }
                  level={subHeadingLevel}
                >
                  {resolvedFollowUsHeading}
                </Heading>
              </EntityField>
            )}
            <EntityField displayName="Social Media Fields">
              <ul className="list-none flex gap-5">
                {twitterHandle && (
                  <li
                    className={`h-12 w-12 flex items-center justify-center border rounded-full ${!hasDarkBackground ? "bg-palette-primary-dark text-white" : "bg-white text-palette-primary-dark"}`}
                  >
                    <Link
                      href={`https://x.com/${twitterHandle}`}
                      aria-label="Twitter"
                    >
                      <FaXTwitter className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {facebookPageUrl && (
                  <li
                    className={`h-12 w-12 flex items-center justify-center border rounded-full ${!hasDarkBackground ? "bg-palette-primary-dark text-white" : "bg-white text-palette-primary-dark"}`}
                  >
                    <Link href={facebookPageUrl} aria-label="Facebook">
                      <FaFacebookF className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {instagramHandle && (
                  <li
                    className={`h-12 w-12 flex items-center justify-center border rounded-full ${!hasDarkBackground ? "bg-palette-primary-dark text-white" : "bg-white text-palette-primary-dark"}`}
                  >
                    <Link
                      href={`https://instagram.com/${instagramHandle}`}
                      aria-label="Instagram"
                    >
                      <FaInstagram className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {linkedInUrl && (
                  <li
                    className={`h-12 w-12 flex items-center justify-center border rounded-full ${!hasDarkBackground ? "bg-palette-primary-dark text-white" : "bg-white text-palette-primary-dark"}`}
                  >
                    <Link href={linkedInUrl} aria-label="LinkedIn">
                      <FaLinkedinIn className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  </li>
                )}
              </ul>
            </EntityField>
          </section>
        )}
      </div>
    </PageSection>
  );
};

export const FINS_CoreInfoSection: ComponentConfig<FINS_CoreInfoSectionProps> =
  {
    label: "FINS - Core Info Section",
    fields: coreInfoSectionFields,
    defaultProps: {
      data: {
        hours: {
          headingText: {
            field: "",
            constantValue: "Hours",
            constantValueEnabled: true,
          },
          hours: {
            field: "hours",
            constantValue: {},
          },
        },
        services: {
          headingText: {
            field: "",
            constantValue: "Services Offered",
            constantValueEnabled: true,
          },
          entityField: {
            field: "services",
            constantValue: [],
          },
        },
        biography: {
          headingText: {
            field: "",
            constantValue: "About",
            constantValueEnabled: true,
          },
          entityField: {
            field: "description",
            constantValue: "",
          },
        },
        areasServed: {
          headingText: {
            field: "",
            constantValue: "Areas Served",
            constantValueEnabled: true,
          },
          entityField: {
            field: "",
            constantValue: [
              "Augue interdum velit euismod",
              "Euismod lacinia at quis",
              "Viverra ipsum nunc aliquet bib",
              "Ultrices dui sapien",
              "Deserunt mollit anim id est",
            ],
            constantValueEnabled: true,
          },
        },
        languages: {
          headingText: {
            field: "",
            constantValue: "Languages Spoken",
            constantValueEnabled: true,
          },
          entityField: {
            field: "languages",
            constantValue: [],
          },
        },
        education: {
          headingText: {
            field: "",
            constantValue: "Education",
            constantValueEnabled: true,
          },
          entityField: {
            field: "",
            constantValue: [
              "Augue interdum velit euismod",
              "Euismod lacinia at quis",
            ],
            constantValueEnabled: true,
          },
        },
        followUs: {
          headingText: {
            field: "",
            constantValue: "Follow Us",
            constantValueEnabled: true,
          },
        },
        awards: {
          headingText: {
            field: "",
            constantValue: "Awards",
            constantValueEnabled: true,
          },
          entityField: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              awards: [
                {
                  title: "Award title goes here",
                  description:
                    "Published annually Jan - April. Rankings based on data as of June 30 of prior year.",
                  image: {
                    alternateText: "The Galaxy Grill Logo",
                    height: 90,
                    url: "https://placehold.co/175x90",
                    width: 175,
                  },
                },
                {
                  title: "Award title goes here",
                  description:
                    "Published annually Jan - April. Rankings based on data as of June 30 of prior year.",
                  image: {
                    alternateText: "The Galaxy Grill Logo",
                    height: 90,
                    url: "https://placehold.co/175x90",
                    width: 175,
                  },
                },
              ],
            },
          },
        },
      },
      styles: {
        mainHeadingLevel: 2,
        subHeadingLevel: 4,
        hours: {
          startOfWeek: "today",
          showAdditionalHoursText: true,
        },
        backgroundColor: backgroundColors.background2.value,
      },
      liveVisibility: true,
    },
    render: (props) => (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <CoreInfoSectionWrapper {...props} />
      </VisibilityWrapper>
    ),
  };
