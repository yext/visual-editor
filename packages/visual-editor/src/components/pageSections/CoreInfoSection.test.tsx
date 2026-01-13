import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  CoreInfoSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";
import {
  HeadingText,
  Address,
  HoursTable,
  Emails,
  TextList,
} from "../contentBlocks/index.ts";
import { PhoneList } from "../contentBlocks/PhoneList.tsx";

const testAddress = {
  city: "Brooklyn",
  countryCode: "US",
  line1: "288 Grand St",
  localizedCountryName: "United States",
  localizedRegionName: "New York",
  postalCode: "11211",
  region: "NY",
};

const tests: ComponentTest[] = [
  {
    name: "default props with no additional document data",
    document: { locale: "en" },
    props: { ...CoreInfoSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: {
      locale: "en",
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      hours: testHours,
      services: ["Delivery", "Catering"],
    },
    props: { ...CoreInfoSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 1 props with entity values",
    document: {
      locale: "en",
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      hours: testHours,
      services: ["Delivery", "Catering"],
      id: "test-id",
      description: "test-description",
      name: "Galaxy Grill",
    },
    props: {
      data: {
        hours: {
          headingText: {
            constantValue: "Hours",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "name",
          },
          hours: {
            constantValue: {},
            field: "hours",
          },
        },
        info: {
          address: {
            constantValue: {
              city: "",
              countryCode: "",
              line1: "",
              postalCode: "",
            },
            field: "address",
          },
          emails: {
            constantValue: [],
            field: "emails",
          },
          headingText: {
            constantValue: "Information",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "id",
          },
          phoneNumbers: [
            {
              label: "Phone",
              number: {
                constantValue: "",
                field: "mainPhone",
              },
            },
          ],
        },
        services: {
          headingText: {
            constantValue: "Services",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "description",
          },
          servicesList: {
            constantValue: [],
            field: "services",
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        headingLevel: 3,
        hours: {
          collapseDays: false,
          showAdditionalHoursText: true,
          startOfWeek: "today",
        },
        info: {
          emailsListLength: 1,
          includePhoneHyperlink: true,
          phoneFormat: "domestic",
          showGetDirectionsLink: true,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 1 props with constant value",
    document: {
      locale: "en",
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      hours: testHours,
      services: ["Delivery", "Catering"],
      id: "test-id",
      description: "test-description",
      name: "Galaxy Grill",
    },
    props: {
      data: {
        hours: {
          headingText: {
            constantValue: "Hours",
            constantValueEnabled: true,
            field: "name",
          },
          hours: {
            constantValue: {},
            field: "hours",
          },
        },
        info: {
          address: {
            constantValue: {
              city: "Arlington",
              countryCode: "",
              line1: "Test",
              postalCode: "",
              region: "VA",
            },
            constantValueEnabled: true,
            field: "address",
          },
          emails: {
            constantValue: ["email1@yext.com", "email2@yext.com"],
            constantValueEnabled: true,
            field: "emails",
          },
          headingText: {
            constantValue: "Information",
            constantValueEnabled: true,
            field: "id",
          },
          phoneNumbers: [
            {
              label: "Main",
              number: {
                constantValue: "5555551010",
                constantValueEnabled: true,
                field: "mainPhone",
              },
            },
            {
              label: "Cell",
              number: {
                constantValue: "8888888888",
                constantValueEnabled: true,
                field: "",
              },
            },
          ],
        },
        services: {
          headingText: {
            constantValue: "Services",
            constantValueEnabled: true,
            field: "description",
          },
          servicesList: {
            constantValue: ["Repair"],
            constantValueEnabled: true,
            field: "services",
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        headingLevel: 6,
        hours: {
          collapseDays: true,
          showAdditionalHoursText: false,
          startOfWeek: "monday",
        },
        info: {
          emailsListLength: 2,
          includePhoneHyperlink: false,
          phoneFormat: "domestic",
          showGetDirectionsLink: false,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 1 props with partial entity values 1",
    document: {
      locale: "en",
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      hours: testHours,
      id: "test-id",
      description: "test-description",
      name: "Galaxy Grill",
    },
    props: {
      data: {
        hours: {
          headingText: {
            constantValue: "Hours",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "name",
          },
          hours: {
            constantValue: {},
            field: "hours",
          },
        },
        info: {
          address: {
            constantValue: {
              city: "",
              countryCode: "",
              line1: "",
              postalCode: "",
            },
            field: "address",
          },
          emails: {
            constantValue: [],
            field: "emails",
          },
          headingText: {
            constantValue: "Information",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "id",
          },
          phoneNumbers: [
            {
              label: "Phone",
              number: {
                constantValue: "",
                field: "mainPhone",
              },
            },
          ],
        },
        services: {
          headingText: {
            constantValue: "Services",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "description",
          },
          servicesList: {
            constantValue: [],
            field: "services",
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        headingLevel: 3,
        hours: {
          collapseDays: false,
          showAdditionalHoursText: true,
          startOfWeek: "today",
        },
        info: {
          emailsListLength: 1,
          includePhoneHyperlink: true,
          phoneFormat: "domestic",
          showGetDirectionsLink: true,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 1 props with partial entity values 2",
    document: {
      locale: "en",
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      services: ["Delivery", "Catering"],
      id: "test-id",
      description: "test-description",
      name: "Galaxy Grill",
    },
    props: {
      data: {
        hours: {
          headingText: {
            constantValue: "Hours",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "name",
          },
          hours: {
            constantValue: {},
            field: "hours",
          },
        },
        info: {
          address: {
            constantValue: {
              city: "",
              countryCode: "",
              line1: "",
              postalCode: "",
            },
            field: "address",
          },
          emails: {
            constantValue: [],
            field: "emails",
          },
          headingText: {
            constantValue: "Information",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "id",
          },
          phoneNumbers: [
            {
              label: "Phone",
              number: {
                constantValue: "",
                field: "mainPhone",
              },
            },
          ],
        },
        services: {
          headingText: {
            constantValue: "Services",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "description",
          },
          servicesList: {
            constantValue: [],
            field: "services",
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        headingLevel: 3,
        hours: {
          collapseDays: false,
          showAdditionalHoursText: true,
          startOfWeek: "today",
        },
        info: {
          emailsListLength: 1,
          includePhoneHyperlink: true,
          phoneFormat: "domestic",
          showGetDirectionsLink: true,
        },
      },
    },
    version: 1,
  },
  {
    name: "version 10 props with partial entity values align right",
    document: {
      locale: "en",
      hours: testHours,
      services: ["Delivery", "Catering"],
      id: "test-id",
      description: "test-description",
      name: "Galaxy Grill",
    },
    props: {
      data: {
        hours: {
          headingText: {
            constantValue: "Hours",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "name",
          },
          hours: {
            constantValue: {},
            field: "hours",
          },
        },
        info: {
          address: {
            constantValue: {
              city: "",
              countryCode: "",
              line1: "",
              postalCode: "",
            },
            field: "address",
          },
          emails: {
            constantValue: [],
            field: "emails",
          },
          headingText: {
            constantValue: "",
            constantValueEnabled: true,
            constantValueOverride: {},
            field: "id",
          },
          phoneNumbers: [
            {
              label: "Phone",
              number: {
                constantValue: "",
                field: "mainPhone",
              },
            },
          ],
        },
        services: {
          headingText: {
            constantValue: "Services",
            constantValueEnabled: false,
            constantValueOverride: {},
            field: "description",
          },
          servicesList: {
            constantValue: [],
            field: "services",
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        heading: {
          align: "right",
          level: 3,
        },
        hours: {
          collapseDays: false,
          showAdditionalHoursText: true,
          startOfWeek: "today",
        },
        info: {
          emailsListLength: 1,
          includePhoneHyperlink: true,
          phoneFormat: "domestic",
          showGetDirectionsLink: true,
        },
      },
    },
    version: 10,
  },
  {
    name: "version 27 props with mixed values",
    document: {
      locale: "en",
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      hours: testHours,
      services: ["Delivery", "Catering"],
      id: "test-id",
      description: "test-description",
      name: "Galaxy Grill",
    },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
      },
      slots: {
        CoreInfoHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-13c80a69-4194-41a6-86d0-1ded6367ed98",
              data: {
                text: {
                  constantValue: {
                    en: "Information",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        CoreInfoAddressSlot: [
          {
            type: "AddressSlot",
            props: {
              id: "AddressSlot-07cfe7a6-e9c7-41c4-b1ae-03558c90c6b9",
              data: {
                address: {
                  constantValue: {
                    line1: "",
                    city: "",
                    postalCode: "",
                    countryCode: "",
                  },
                  field: "address",
                },
              },
              styles: { showGetDirectionsLink: true, ctaVariant: "link" },
            },
          },
        ],
        CoreInfoPhoneNumbersSlot: [
          {
            type: "PhoneNumbersSlot",
            props: {
              id: "PhoneNumbersSlot-c82bd20b-7393-4994-87fb-26a53cd82880",
              data: {
                phoneNumbers: [
                  {
                    number: { field: "mainPhone", constantValue: "" },
                    label: { en: "Phone", hasLocalizedValue: "true" },
                  },
                ],
              },
              styles: { phoneFormat: "domestic", includePhoneHyperlink: true },
            },
          },
        ],
        CoreInfoEmailsSlot: [
          {
            type: "EmailsSlot",
            props: {
              id: "EmailsSlot-4d584104-463f-4569-86e4-19c137697f60",
              data: { list: { field: "emails", constantValue: [] } },
              styles: { listLength: 1 },
            },
          },
        ],
        HoursHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-383eb893-a76f-4457-bf3b-7909b520a384",
              data: {
                text: {
                  constantValue: { en: "Hours", hasLocalizedValue: "true" },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        HoursTableSlot: [
          {
            type: "HoursTableSlot",
            props: {
              id: "HoursTableSlot-ada7341a-2420-4ef2-b9e4-1d2e26945e43",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                startOfWeek: "today",
                collapseDays: false,
                showAdditionalHoursText: true,
                alignment: "items-start",
              },
            },
          },
        ],
        ServicesHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-1b445bc3-cc01-4fa9-9fb8-3c8dc1361ca5",
              data: {
                text: {
                  constantValue: { en: "Services", hasLocalizedValue: "true" },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        TextListSlot: [
          {
            type: "TextListSlot",
            props: {
              id: "ServicesListSlot-88d05408-381e-4a03-a5a0-8b8c9781d6fc",
              list: { field: "services", constantValue: [] },
            },
          },
        ],
      },
      analytics: { scope: "coreInfoSection" },
      liveVisibility: true,
      conditionalRender: {
        coreInfoCol: true,
        hoursCol: true,
        servicesCol: true,
      },
    },
    version: 27,
  },
];

describe("CoreInfoSection", async () => {
  const puckConfig: Config = {
    components: {
      CoreInfoSection,
      AddressSlot: Address,
      EmailsSlot: Emails,
      HeadingTextSlot: HeadingText,
      HoursTableSlot: HoursTable,
      PhoneNumbersSlot: PhoneList,
      TextListSlot: TextList,
    },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      document,
      name,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
    }) => {
      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "CoreInfoSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const updatedData = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render
            config={puckConfig}
            data={updatedData}
            metadata={{ streamDocument: document }}
          />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      await expect(
        `CoreInfoSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `CoreInfoSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
