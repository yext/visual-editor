import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  AboutSection,
  migrate,
  migrationRegistry,
  SlotsCategoryComponents,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const testDocument = {
  name: "Test Location",
  hours: testHours,
  address: {
    city: "Brooklyn",
    countryCode: "US",
    line1: "288 Grand St",
    localizedCountryName: "United States",
    localizedRegionName: "New York",
    postalCode: "11211",
    region: "NY",
  },
  additionalHoursText: "Additional hours text.",
  mainPhone: "+12025551010",
  services: ["Accounting", "Tax Preparation", "Financial Consulting"],
};
const tests: ComponentTest[] = [
  {
    name: "default props",
    document: testDocument,
    props: { ...AboutSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 50 props with details column",
    version: 50,
    document: testDocument,
    props: {
      data: {
        showDetailsColumn: true,
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-d1ad11ea-6ba0-4df4-89a2-c0b404d1dccf",
              data: {
                text: {
                  constantValue: {
                    en: "About [[name]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: {
                level: 2,
                align: "left",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-50a06c86-7d6e-4b44-a987-185279d61c87",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                    html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</span></p>',
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
              },
              parentStyles: {
                className: "",
              },
            },
          },
        ],
        SidebarSlot: [
          {
            type: "AboutSectionDetailsColumn",
            props: {
              id: "AboutSectionDetailsColumn-c20740a6-0bfe-4ba0-b507-c6dfc00ad119",
              sections: [
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Missing Data Section (should not render)",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "hoursStatus",
                    hoursStatus: {
                      data: {
                        hours: {
                          field: "fakeField",
                          constantValue: {},
                          constantValueEnabled: false,
                        },
                      },
                      styles: {
                        showCurrentStatus: true,
                        showDayNames: false,
                        timeFormat: "12h",
                        dayOfWeekFormat: "short",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Office Hours",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "hoursStatus",
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
                        timeFormat: "12h",
                        dayOfWeekFormat: "short",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Expanded Hours",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "hoursTable",
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
                        showAdditionalHoursText: false,
                        alignment: "items-start",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Connect With Us",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "socialMedia",
                    socialMedia: {
                      data: {
                        xLink: "https://x.com/yext",
                        facebookLink: "https://facebook.com/yext",
                        instagramLink: "https://instagram.com/yext",
                        linkedInLink: "https://linkedin.com/yext",
                        pinterestLink: "https://pinterest.com/yext",
                        tiktokLink: "https://tiktok.com/yext",
                        youtubeLink: "https://youtube.com/yext",
                      },
                      styles: {
                        filledBackground: true,
                        mobileAlignment: "left",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Office Location",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "address",
                    address: {
                      data: {
                        address: {
                          field: "address",
                          constantValue: {},
                          constantValueEnabled: false,
                        },
                      },
                      styles: {
                        showGetDirectionsLink: true,
                        ctaVariant: "link",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Languages Spoken",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "textList",
                    textList: {
                      list: {
                        field: "",
                        constantValue: [
                          {
                            en: "English",
                            hasLocalizedValue: "true",
                          },
                          {
                            en: "Spanish",
                            hasLocalizedValue: "true",
                          },
                        ],
                        constantValueEnabled: true,
                      },
                      commaSeparated: false,
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Call Us",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "phone",
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
                  },
                },
              ],
            },
          },
        ],
      },
      liveVisibility: true,
      id: "AboutSection-0e1ab431-be45-4652-af05-08c1143f74ad",
    },
  },
  {
    name: "version 50 props with hidden details column",
    version: 50,
    document: testDocument,
    props: {
      data: {
        showDetailsColumn: false,
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-d1ad11ea-6ba0-4df4-89a2-c0b404d1dccf",
              data: {
                text: {
                  constantValue: {
                    en: "About [[name]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: {
                level: 2,
                align: "left",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-50a06c86-7d6e-4b44-a987-185279d61c87",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                    html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.<br /><br />Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</span></p>',
                    en: {
                      json: "",
                      html: "",
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
              },
              parentStyles: {
                className: "",
              },
            },
          },
        ],
        SidebarSlot: [
          {
            type: "AboutSectionDetailsColumn",
            props: {
              id: "AboutSectionDetailsColumn-c20740a6-0bfe-4ba0-b507-c6dfc00ad119",
              sections: [
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Office Hours",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "hoursStatus",
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
                        timeFormat: "12h",
                        dayOfWeekFormat: "short",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Connect With Us",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "socialMedia",
                    socialMedia: {
                      data: {
                        xLink: "https://x.com/yext",
                        facebookLink: "https://facebook.com/yext",
                        instagramLink: "https://instagram.com/yext",
                        linkedInLink: "https://linkedin.com/yext",
                        pinterestLink: "https://pinterest.com/yext",
                        tiktokLink: "https://tiktok.com/yext",
                        youtubeLink: "https://youtube.com/yext",
                      },
                      styles: {
                        filledBackground: true,
                        mobileAlignment: "left",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Office Location",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "address",
                    address: {
                      data: {
                        address: {
                          field: "address",
                          constantValue: {},
                          constantValueEnabled: false,
                        },
                      },
                      styles: {
                        showGetDirectionsLink: true,
                        ctaVariant: "link",
                      },
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Languages Spoken",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "textList",
                    textList: {
                      list: {
                        field: "",
                        constantValue: [
                          {
                            en: "English",
                            hasLocalizedValue: "true",
                          },
                          {
                            en: "Spanish",
                            hasLocalizedValue: "true",
                          },
                        ],
                        constantValueEnabled: true,
                      },
                      commaSeparated: false,
                    },
                  },
                },
                {
                  header: {
                    field: "",
                    constantValue: {
                      en: "Call Us",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                  content: {
                    type: "phone",
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
                  },
                },
              ],
            },
          },
        ],
      },
      liveVisibility: true,
      id: "AboutSection-0e1ab431-be45-4652-af05-08c1143f74ad",
    },
  },
];

describe("AboutSection", async () => {
  const puckConfig: Config = {
    components: { AboutSection, ...SlotsCategoryComponents },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      name,
      document,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
    }) => {
      let data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "AboutSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      data = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      await expect(`AboutSection/[${viewportName}] ${name}`).toMatchScreenshot({
        ignoreExact:
          name === "version 50 props with details column" &&
          viewportName === "tablet"
            ? [5400]
            : undefined,
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `AboutSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
