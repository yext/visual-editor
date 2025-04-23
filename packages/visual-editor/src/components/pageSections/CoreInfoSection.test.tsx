import * as React from "react";
import { describe, it, expect } from "vitest";
import { render as reactRender } from "@testing-library/react";
import {
  backgroundColors,
  CoreInfoSection,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { axe, testHours, viewports } from "../WCAG/WCAG.setup.ts";
import { page } from "@vitest/browser/context";

describe.each(viewports)("CoreInfoSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { CoreInfoSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with default props", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "CoreInfoSection",
                props: { id: "abc", ...CoreInfoSection.defaultProps },
              },
            ],
          }}
        />
      </VisualEditorProvider>
    );

    await page.viewport(width, height);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should pass wcag with data", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "CoreInfoSection",
                props: {
                  id: "abc",
                  styles: {
                    headingLevel: 3,
                    backgroundColor: backgroundColors.background6.value,
                  },
                  address: {
                    headingText: {
                      field: "",
                      constantValue: "Information",
                      constantValueEnabled: true,
                    },
                    address: {
                      field: "address",
                      constantValue: {
                        line1: "123 Sesame St",
                        city: "New York",
                        postalCode: "10001",
                        countryCode: "US",
                      },
                      constantValueEnabled: true,
                    },
                    showGetDirectionsLink: true,
                  },
                  phoneNumbers: {
                    phoneNumber: [
                      {
                        number: {
                          field: "mainPhone",
                          constantValue: "+12025551010",
                          constantValueEnabled: true,
                        },
                        label: "Phone",
                      },
                    ],
                    phoneFormat: "domestic",
                    includePhoneHyperlink: true,
                  },
                  emails: {
                    emails: {
                      field: "emails",
                      constantValue: ["sumo@yext.com", "spruce@yext.com"],
                      constantValueEnabled: true,
                    },
                    listLength: 3,
                  },
                  hours: {
                    headingText: {
                      field: "",
                      constantValue: "Hours",
                      constantValueEnabled: true,
                    },
                    hours: {
                      field: "hours",
                      constantValue: testHours,
                      constantValueEnabled: true,
                    },
                    startOfWeek: "today",
                    collapseDays: false,
                    showAdditionalHoursText: true,
                  },
                  services: {
                    headingText: {
                      field: "",
                      constantValue: "Services",
                      constantValueEnabled: true,
                    },
                    servicesList: {
                      field: "services",
                      constantValue: ["repairs", "sales"],
                      constantValueEnabled: true,
                    },
                  },
                },
              },
            ],
          }}
        />
      </VisualEditorProvider>
    );

    await page.viewport(width, height);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
