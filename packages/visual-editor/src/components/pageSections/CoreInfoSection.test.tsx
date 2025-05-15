import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  testAddress,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  CoreInfoSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...CoreInfoSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Information")).toBeVisible();
      expect(document.body.textContent).not.toContain("Hours");
      expect(document.body.textContent).not.toContain("Services");
      expect(document.body.textContent).not.toContain("Phone");
    },
  },
  {
    name: "default props with document data",
    document: {
      address: testAddress,
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
      hours: testHours,
      services: ["Delivery", "Catering"],
    },
    props: { ...CoreInfoSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Information")).toBeVisible();
      expect(page.getByText("Hours")).toBeVisible();
      expect(page.getByText("Services")).toBeVisible();
      expect(page.getByText("288 Grand St")).toBeVisible();
      expect(page.getByText("(800) 555-1010")).toBeVisible();
      expect(page.getByText("sumo@yext.com")).toBeVisible();
      expect(page.getByText("Wednesday")).toBeVisible();
      expect(page.getByText("Delivery")).toBeVisible();
    },
  },
  {
    name: "version 0 props with entity values",
    document: {
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
    tests: async (page) => {
      expect(page.getByText("test-id")).toBeVisible();
      expect(page.getByText("Galaxy Grill")).toBeVisible();
      expect(page.getByText("test-description")).toBeVisible();
      expect(page.getByText("288 Grand St")).toBeVisible();
      expect(page.getByText("(800) 555-1010")).toBeVisible();
      expect(page.getByText("sumo@yext.com")).toBeVisible();
      expect(page.getByText("Wednesday")).toBeVisible();
      expect(page.getByText("Delivery")).toBeVisible();
    },
  },
  {
    name: "version 0 props with constant value",
    document: {
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
    tests: async (page) => {
      expect(page.getByText("Information")).toBeVisible();
      expect(page.getByText("hours")).toBeVisible();
      expect(page.getByText("Services")).toBeVisible();
      expect(page.getByText("Arlington")).toBeVisible();
      expect(page.getByText("Cell")).toBeVisible();
      expect(page.getByText("email2@yext.com")).toBeVisible();
      expect(page.getByText("Monday - Sunday")).toBeVisible();
      expect(page.getByText("Repair")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("CoreInfoSection", async () => {
  const puckConfig: Config = {
    components: { CoreInfoSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(testsWithViewports)(
    "renders $name $viewport.name",
    async ({
      document,
      props,
      tests,
      version,
      viewport: { width, height } = viewports[0],
    }) => {
      const data = migrate(
        {
          root: { version },
          content: [
            {
              type: "CoreInfoSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig
      );
      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      await page.screenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      await tests(page);
    }
  );
});
