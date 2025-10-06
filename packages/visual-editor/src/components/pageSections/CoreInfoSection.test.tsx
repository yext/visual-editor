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
} from "../contentBlocks/index.ts";
import { ServicesList } from "../contentBlocks/TextList.tsx";
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
    name: "version 0 props with entity values",
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
        headingLevel: 3,
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
      },
      address: {
        headingText: {
          field: "id",
          constantValue: "Information",
          constantValueEnabled: false,
          constantValueOverride: {},
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
        showGetDirectionsLink: true,
      },
      phoneNumbers: {
        phoneNumber: [
          { number: { field: "mainPhone", constantValue: "" }, label: "Phone" },
        ],
        phoneFormat: "domestic",
        includePhoneHyperlink: true,
      },
      emails: { emails: { field: "emails", constantValue: [] }, listLength: 1 },
      hours: {
        headingText: {
          field: "name",
          constantValue: "Hours",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        hours: { field: "hours", constantValue: {} },
        startOfWeek: "today",
        collapseDays: false,
        showAdditionalHoursText: true,
      },
      services: {
        headingText: {
          field: "description",
          constantValue: "Services",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        servicesList: { field: "services", constantValue: [] },
      },
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
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
        headingLevel: 6,
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
      },
      address: {
        headingText: {
          field: "id",
          constantValue: "Information",
          constantValueEnabled: true,
        },
        address: {
          field: "address",
          constantValue: {
            line1: "Test",
            city: "Arlington",
            postalCode: "",
            countryCode: "",
            region: "VA",
          },
          constantValueEnabled: true,
        },
        showGetDirectionsLink: false,
      },
      phoneNumbers: {
        phoneNumber: [
          {
            number: {
              field: "mainPhone",
              constantValue: "5555551010",
              constantValueEnabled: true,
            },
            label: "Main",
          },
          {
            number: {
              field: "",
              constantValue: "8888888888",
              constantValueEnabled: true,
            },
            label: "Cell",
          },
        ],
        phoneFormat: "domestic",
        includePhoneHyperlink: false,
      },
      emails: {
        emails: {
          field: "emails",
          constantValue: ["email1@yext.com", "email2@yext.com"],
          constantValueEnabled: true,
        },
        listLength: 2,
      },
      hours: {
        headingText: {
          field: "name",
          constantValue: "Hours",
          constantValueEnabled: true,
        },
        hours: { field: "hours", constantValue: {} },
        startOfWeek: "monday",
        collapseDays: true,
        showAdditionalHoursText: false,
      },
      services: {
        headingText: {
          field: "description",
          constantValue: "Services",
          constantValueEnabled: true,
        },
        servicesList: {
          field: "services",
          constantValue: ["Repair"],
          constantValueEnabled: true,
        },
      },
    },
    version: 0,
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
    name: "version 1 props with partial entity values 3",
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
      ServicesListSlot: ServicesList,
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
