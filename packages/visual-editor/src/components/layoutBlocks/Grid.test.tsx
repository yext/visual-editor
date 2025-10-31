import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
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
  BodyText,
  CTAGroup,
  CTAWrapper,
  Emails,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  Phone,
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
    name: "version 18 - atoms used to make a HeroSection",
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
    version: 18,
  },
  {
    name: "version 18 - atoms used to make a CoreInfoSection",
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
    version: 18,
  },
  {
    name: "version 19 - various atoms",
    document: {
      address: testAddress,
      id: "test-id",
      name: "Galaxy Grill",
      mainPhone: "+18005551010",
      emails: ["sumo@yext.com"],
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
                    en: "Information",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 3,
                id: "HeadingText-6bc59041-d812-472a-93de-3eaf5aeb67af",
              },
            },
            {
              type: "Address",
              props: {
                data: {
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
                },
                styles: {
                  showGetDirectionsLink: false,
                  ctaVariant: "link",
                },
                id: "Address-a3495aad-afd1-441f-ad2d-d921b2cd1257",
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
                id: "GetDirections-2c8e8f69-4928-415c-9e56-4ff4fa7dc043",
              },
            },
            {
              type: "Phone",
              props: {
                data: {
                  number: {
                    field: "mainPhone",
                    constantValue: "",
                  },
                  label: {
                    en: "Phone",
                    hasLocalizedValue: "true",
                  },
                },
                styles: {
                  phoneFormat: "domestic",
                  includePhoneHyperlink: true,
                },
                id: "Phone-717f487f-d487-47a1-b78a-6378d8c489e7",
              },
            },
            {
              type: "Emails",
              props: {
                list: {
                  field: "emails",
                  constantValue: [],
                },
                listLength: 3,
                id: "Emails-bc6377ff-f4ff-42a8-a2fc-3b62697eba9d",
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
                    en: "Test Body Text",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                level: 3,
                id: "HeadingText-5a040a52-f6c0-4f1d-8c89-18dd575a00d9",
              },
            },
            {
              type: "BodyText",
              props: {
                data: {
                  text: {
                    field: "",
                    constantValue: {
                      en: {
                        json: "",
                        html: '<p dir=\\"ltr\\" style=\\"font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;\\"><b><strong style=\\"font-weight: bold;\\">Lorem</strong></b><span> </span><i><em style=\\"font-style: italic;\\">ipsum</em></i><span> </span><s><span style=\\"text-decoration: line-through;\\">dolor</span></s><span> </span><sup><span style=\\"font-size: 0.8em; vertical-align: super;\\">sit</span></sup><span> </span><sub><span style=\\"font-size: 0.8em; vertical-align: sub !important;\\">amet</span></sub><span>, </span><a href=\\"https://\\" rel=\\"noopener\\" style=\\"color: rgb(33, 111, 219); text-decoration: none;\\"><span>consectetur</span></a><span> Small Text </span></p>',
                      },
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                },
                styles: {
                  variant: "sm",
                },
                id: "BodyText-4cc9d6a0-bc01-41a8-ae12-77ec358eecf0",
              },
            },
            {
              type: "BodyText",
              props: {
                data: {
                  text: {
                    field: "",
                    constantValue: {
                      en: {
                        json: "",
                        html: '<p dir=\\"ltr\\" style=\\"font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;\\"><b><strong style=\\"font-weight: bold;\\">Lorem</strong></b><span> </span><i><em style=\\"font-style: italic;\\">ipsum</em></i><span> </span><s><span style=\\"text-decoration: line-through;\\">dolor</span></s><span> </span><sup><span style=\\"font-size: 0.8em; vertical-align: super;\\">sit</span></sup><span> </span><sub><span style=\\"font-size: 0.8em; vertical-align: sub !important;\\">amet</span></sub><span>, </span><a href=\\"https://\\" rel=\\"noopener\\" style=\\"color: rgb(33, 111, 219); text-decoration: none;\\"><span>consectetur</span></a><span> Base Text </span></p>',
                      },
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                },
                styles: {
                  variant: "base",
                },
                id: "BodyText-6e3653d8-7da8-4cb7-805e-8f8fee7f12a3",
              },
            },
            {
              type: "BodyText",
              props: {
                data: {
                  text: {
                    field: "",
                    constantValue: {
                      en: {
                        json: "",
                        html: '<p dir=\\"ltr\\" style=\\"font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;\\"><b><strong style=\\"font-weight: bold;\\">Lorem</strong></b><span> </span><i><em style=\\"font-style: italic;\\">ipsum</em></i><span> </span><s><span style=\\"text-decoration: line-through;\\">dolor</span></s><span> </span><sup><span style=\\"font-size: 0.8em; vertical-align: super;\\">sit</span></sup><span> </span><sub><span style=\\"font-size: 0.8em; vertical-align: sub !important;\\">amet</span></sub><span>, </span><a href=\\"https://\\" rel=\\"noopener\\" style=\\"color: rgb(33, 111, 219); text-decoration: none;\\"><span>consectetur</span></a><span> Large Text </span></p>',
                      },
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: true,
                  },
                },
                styles: {
                  variant: "lg",
                },
                id: "BodyText-7cf255e9-3c28-4920-9ad2-d30d5a32b946",
              },
            },
          ],
        },
        {
          Column: [],
        },
      ],
    },
    version: 19,
  },
  {
    name: "version 19 - various CTAs",
    document: {
      c_cta: { label: "CTA", link: "#" },
      yextDisplayCoordinate: { latitude: 50, longitude: 50 },
      id: "test-id",
      name: "Galaxy Grill",
    },
    props: {
      columns: 2,
      slots: [
        {
          Column: [
            {
              type: "CTAWrapper",
              props: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Call to Action",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "textAndLink",
                },
                variant: "primary",
                id: "CTAWrapper-025363fe-ffa3-4365-b329-f4527728fccd",
              },
            },
            {
              type: "CTAWrapper",
              props: {
                entityField: {
                  field: "yextDisplayCoordinate",
                  constantValue: {
                    label: "Call to Action",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "getDirections",
                },
                variant: "link",
                id: "CTAWrapper-11a27319-29b5-4255-912d-c538359d051f",
              },
            },
            {
              type: "CTAWrapper",
              props: {
                entityField: {
                  field: "c_cta",
                  constantValue: {
                    label: {
                      en: "",
                      hasLocalizedValue: "true",
                    },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                    presetImageType: "app-store",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
                variant: "primary",
                id: "CTAWrapper-70fad148-36c1-4ef3-ac60-48a1f852f320",
              },
            },
          ],
        },
        {
          Column: [
            {
              type: "CTAGroup",
              props: {
                buttons: [
                  {
                    entityField: {
                      field: "c_cta",
                      constantValueEnabled: false,
                      constantValue: {
                        ctaType: "textAndLink",
                        label: "Button",
                        link: "#",
                      },
                    },
                    variant: "secondary",
                  },
                  {
                    entityField: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: {
                        ctaType: "getDirections",
                        label: {
                          en: "",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                        coordinate: {
                          latitude: 50,
                          longitude: 50,
                        },
                      },
                    },
                    variant: "secondary",
                  },
                  {
                    entityField: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: {
                        ctaType: "presetImage",
                        label: {
                          en: "",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                        presetImageType: "galaxy-store",
                      },
                    },
                    variant: "primary",
                  },
                ],
                id: "CTAGroup-db66e810-ed11-47ce-b305-650f6028a01c",
              },
            },
          ],
        },
        {
          Column: [],
        },
      ],
      backgroundColor: {
        bgColor: "bg-white",
        textColor: "text-black",
      },
      liveVisibility: true,
      analytics: {
        scope: "gridSection",
      },
    },
    version: 19,
  },
  {
    name: "version 28 - various CTAs",
    document: {
      c_callToAction_Phone: {
        label: "Call Us",
        link: "+18005551010",
        linkType: "PHONE",
      },
      c_callToAction_Link: {
        label: "Click Here",
        link: "https://google.com",
        linkType: "URL",
      },
    },
    props: {
      columns: 2,
      slots: [
        {
          Column: [
            {
              type: "CTAWrapper",
              props: {
                data: {
                  entityField: {
                    field: "c_callToAction_Link",
                    constantValue: {
                      label: "Call to Action",
                      link: "#",
                      linkType: "URL",
                      ctaType: "textAndLink",
                    },
                  },
                },
                styles: {
                  displayType: "textAndLink",
                  variant: "link",
                  presetImage: "app-store",
                },
                id: "CTAWrapper-c2de5c91-3079-4c1a-9cad-c70dc978a3e6",
              },
            },
            {
              type: "CTAWrapper",
              props: {
                data: {
                  entityField: {
                    field: "",
                    constantValue: {
                      label: "Call to Action",
                      link: "#",
                      linkType: "URL",
                      ctaType: "textAndLink",
                    },
                    constantValueEnabled: true,
                  },
                },
                styles: {
                  displayType: "presetImage",
                  variant: "primary",
                  presetImage: "app-store",
                },
                id: "CTAWrapper-22bcdff1-f2c4-4339-9d1f-da7c993296d0",
              },
            },
            {
              type: "CTAWrapper",
              props: {
                data: {
                  entityField: {
                    field: "yextDisplayCoordinate",
                    selectedTypes: ["type.coordinate"],
                  },
                },
                styles: {
                  displayType: "textAndLink",
                  variant: "primary",
                  presetImage: "app-store",
                },
                id: "CTAWrapper-8b4e693b-a2a1-4dc4-b92f-30536ffe9a5e",
              },
            },
            {
              type: "CTAWrapper",
              props: {
                data: {
                  entityField: {
                    field: "",
                    constantValue: {
                      label: {
                        en: "Location",
                        hasLocalizedValue: "true",
                      },
                      latitude: 50,
                      longitude: 5,
                    },
                    constantValueEnabled: true,
                    selectedTypes: ["type.coordinate"],
                  },
                },
                styles: {
                  displayType: "textAndLink",
                  variant: "secondary",
                  presetImage: "app-store",
                },
                id: "CTAWrapper-fae7349e-b8b5-46c4-b13c-fe93178d2eab",
              },
            },
          ],
        },
        {
          Column: [
            {
              type: "CTAGroup",
              props: {
                buttons: [
                  {
                    entityField: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: {
                        ctaType: "textAndLink",
                        label: {
                          en: "Constant Button with Text",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                      },
                    },
                    variant: "primary",
                    displayType: "textAndLink",
                  },
                  {
                    entityField: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: {
                        ctaType: "textAndLink",
                        label: {
                          en: "Constant Button with Image",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                      },
                    },
                    variant: "primary",
                    displayType: "presetImage",
                    presetImage: "google-play",
                  },
                  {
                    entityField: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: {
                        label: {
                          en: "Constant Coord",
                          hasLocalizedValue: "true",
                        },
                        latitude: 10,
                        longitude: -10,
                      },
                      selectedTypes: ["type.coordinate"],
                    },
                    variant: "secondary",
                    displayType: "textAndLink",
                  },
                  {
                    entityField: {
                      field: "c_callToAction_Link",
                      constantValueEnabled: false,
                      constantValue: {
                        ctaType: "textAndLink",
                        label: "Button",
                        link: "#",
                      },
                    },
                    variant: "secondary",
                    displayType: "textAndLink",
                  },
                  {
                    entityField: {
                      field: "yextDisplayCoordinate",
                      constantValueEnabled: false,
                      selectedTypes: ["type.coordinate"],
                    },
                    variant: "link",
                    displayType: "textAndLink",
                  },
                  {
                    entityField: {
                      field: "c_callToAction_Phone",
                      constantValueEnabled: false,
                      constantValue: {
                        ctaType: "textAndLink",
                        label: "Button",
                        link: "#",
                      },
                    },
                    variant: "link",
                    displayType: "textAndLink",
                  },
                ],
                id: "CTAGroup-f66ac48c-20e6-4c3b-a8c7-b5aa4996b790",
              },
            },
          ],
        },
        { Column: [] },
      ],
      backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
      liveVisibility: true,
      analytics: { scope: "gridSection" },
    },
    version: 28,
  },
];

describe("Grid", async () => {
  const puckConfig: Config = {
    components: {
      Address,
      BodyText,
      CTAGroup,
      CTAWrapper,
      Emails,
      GetDirections,
      Grid,
      HeadingText,
      HoursStatus,
      HoursTable,
      ImageWrapper,
      Phone,
      TextList,
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
        puckConfig,
        document
      );

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

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
