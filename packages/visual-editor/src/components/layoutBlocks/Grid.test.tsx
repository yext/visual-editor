import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";
import { Grid } from "./Grid.tsx";
import {
  Address,
  CTAGroup,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  TextList,
} from "../contentBlocks/index.ts";

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
    name: "atoms used to make a HeroSection",
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
      ...Grid.defaultProps,
      columns: 2,
      slots: [
        {
          Column: [
            {
              type: "HeadingText",
              props: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Business Name",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 3,
                id: "HeadingText-249f6b77-e83e-472b-8070-6a49e97a6baa",
              },
            },
            {
              type: "HeadingText",
              props: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 1,
                id: "HeadingText-5f271c72-223c-4b95-8f91-4052fa5d8d53",
              },
            },
            {
              type: "HoursStatus",
              props: {
                hours: {
                  field: "hours",
                  constantValue: {},
                },
                className: "",
                showCurrentStatus: true,
                timeFormat: "12h",
                showDayNames: true,
                dayOfWeekFormat: "long",
                id: "HoursStatus-e0650fdf-a727-4673-8b92-dd293466073c",
              },
            },
            {
              type: "CTAGroup",
              props: {
                buttons: [
                  {
                    entityField: {
                      field: "",
                      constantValue: {
                        ctaType: "textAndLink",
                        label: {
                          en: "Call To Action",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                      },
                      constantValueEnabled: true,
                    },
                    variant: "primary",
                  },
                  {
                    entityField: {
                      field: "",
                      constantValue: {
                        ctaType: "textAndLink",
                        label: {
                          en: "Call To Action",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                      },
                      constantValueEnabled: true,
                    },
                    variant: "secondary",
                  },
                ],
                id: "CTAGroup-228c5350-4484-4a11-b727-112afddea438",
              },
            },
          ],
        },
        {
          Column: [
            {
              type: "ImageWrapper",
              props: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: true,
                },
                aspectRatio: 1.78,
                id: "ImageWrapper-b9715435-b370-4c54-a6b6-38f84ff0e918",
              },
            },
          ],
        },
        {
          Column: [],
        },
      ],
    },
    version: migrationRegistry.length,
  },
  {
    name: "atoms used to make a CoreInfoSection",
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
      ...Grid.defaultProps,
      columns: 3,
      slots: [
        {
          Column: [
            {
              type: "HeadingText",
              props: {
                id: "HeadingText-73593184-05d3-4e88-aa7b-356f1b84e81b",
                text: {
                  field: "",
                  constantValue: {
                    en: "Information",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 3,
              },
            },
            {
              type: "Address",
              props: {
                address: {
                  field: "address",
                  constantValue: {
                    line1: "",
                    city: "",
                    region: "",
                    postalCode: "",
                    countryCode: "",
                  },
                },
                showGetDirections: false,
                id: "Address-3f53a172-1bbb-4a31-9068-fbb8d3ea2917",
              },
            },
            {
              type: "GetDirections",
              props: {
                variant: "link",
                coordinate: {
                  field: "yextDisplayCoordinate",
                  constantValue: {
                    latitude: 0,
                    longitude: 0,
                  },
                },
                id: "GetDirections-5a2ef957-bc3d-490d-8a34-f30546ac9591",
              },
            },
          ],
        },
        {
          Column: [
            {
              type: "HeadingText",
              props: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Hours",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 3,
                id: "HeadingText-67a61db9-35b9-4c60-a0d2-ae3641cbbaba",
              },
            },
            {
              type: "HoursTable",
              props: {
                hours: {
                  field: "hours",
                  constantValue: {},
                },
                startOfWeek: "today",
                collapseDays: false,
                showAdditionalHoursText: true,
                alignment: "items-center",
                id: "HoursTable-4f464085-fc9f-46cb-960a-c07f86a10b09",
              },
            },
          ],
        },
        {
          Column: [
            {
              type: "HeadingText",
              props: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Services",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 3,
                id: "HeadingText-c0e0f628-84f1-461d-bff4-1003bfea7f0d",
              },
            },
            {
              type: "TextList",
              props: {
                list: {
                  field: "",
                  constantValue: [
                    {
                      en: "Delivery",
                      hasLocalizedValue: "true",
                    },
                    {
                      en: "Catering",
                      hasLocalizedValue: "true",
                    },
                    {
                      en: "Carry Out",
                      hasLocalizedValue: "true",
                    },
                    {
                      en: "Dine In",
                      hasLocalizedValue: "true",
                    },
                  ],
                  constantValueEnabled: true,
                },
                id: "TextList-1e2288ae-ee0b-4f94-936d-507f101f4a9b",
              },
            },
          ],
        },
      ],
    },
    version: migrationRegistry.length,
  },
];

describe("Grid", async () => {
  const puckConfig: Config = {
    components: {
      Grid,
      HeadingText,
      HoursStatus,
      CTAGroup,
      ImageWrapper,
      Address,
      GetDirections,
      HoursTable,
      TextList,
    },
    root: {
      render: ({ children }) => {
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
      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "Grid",
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

      await expect(`Grid/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `Grid/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
