import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
} from "./testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  Directory,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const rootDocument = {
  _site: {
    name: "Example Business",
  },
  name: "Location Directory",
  meta: { entityType: { id: "dm_root", uid: 123 }, locale: "en" },
  dm_childEntityIds: ["998877"],
  dm_directoryChildren: [
    {
      name: "United States",
      slug: "us",
      dm_addressCountryDisplayName: "United States",
    },
    {
      name: "Mexico",
      slug: "mx",
      dm_addressCountryDisplayName: "Mexico",
    },
    {
      name: "Canada",
      slug: "ca",
      dm_addressCountryDisplayName: "Canada",
    },
    {
      name: "France",
      slug: "fr",
      dm_addressCountryDisplayName: "France",
    },
  ],
  dm_directoryManagerId: "63590-locations",
  slug: "en/index.html",
};

const countryDocument = {
  _site: {
    name: "Example Business",
  },
  name: "US",
  meta: { entityType: { id: "dm_country", uid: 123 }, locale: "en" },
  dm_addressCountryDisplayName: "United States",
  dm_childEntityIds: ["123456"],
  dm_directoryChildren: [
    {
      name: "Virginia",
      slug: "us/va",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
    {
      name: "Washington DC",
      slug: "us/dc",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Washington DC",
    },
    {
      name: "New York",
      slug: "us/ny",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "New York",
    },
    {
      name: "California",
      slug: "us/ca",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "California",
    },
  ],
  dm_directoryManagerId: "63590-locations",
  dm_directoryParents_63590_locations: [
    {
      name: "Locations Directory",
      slug: "en/index.html",
      dm_addressCountryDisplayName: "United States",
    },
  ],
  slug: "us",
};

const regionDocument = {
  _site: {
    name: "Example Business",
  },
  name: "VA",
  meta: { entityType: { id: "dm_region", uid: 123 }, locale: "en" },
  dm_addressCountryDisplayName: "United States",
  dm_addressRegionDisplayName: "Virginia",
  dm_childEntityIds: ["8932945"],
  dm_directoryChildren: [
    {
      name: "Arlington",
      slug: "us/va/arlington",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
    {
      name: "Fairfax",
      slug: "us/va/fairfax",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
    {
      name: "Alexandria",
      slug: "us/va/alexandria",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
    {
      name: "Falls Church",
      slug: "us/va/fallschurch",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
  ],
  dm_directoryManagerId: "63590-locations",
  dm_directoryParents_63590_locations: [
    {
      name: "Locations Directory",
      slug: "en/index.html",
    },
    {
      name: "US",
      slug: "en/us",
      dm_addressCountryDisplayName: "United States",
    },
  ],
  slug: "us/va",
};

const cityDocument = {
  _site: {
    name: "Example Business",
  },
  dm_childEntityIds: ["8725530"],
  dm_directoryChildren: [
    {
      address: {
        city: "Arlington",
        countryCode: "US",
        line1: "1101 Wilson Blvd",
        postalCode: "22209",
        region: "VA",
      },
      mainPhone: "+12025551010",
      hours: testHours,
      name: "Galaxy Grill Rosslyn",
      timezone: "America/New_York",
      slug: "arlington",
    },
    {
      address: {
        city: "Arlington",
        countryCode: "US",
        line1: "4320 Fairfax Dr",
        postalCode: "22201",
        region: "VA",
      },
      mainPhone: "+12025551011",
      hours: testHours,
      name: "Galaxy Grill Ballston",
      timezone: "America/New_York",
    },
    {
      address: {
        city: "Arlington",
        countryCode: "US",
        line1: "3100 Wilson Blvd",
        postalCode: "22201",
        region: "VA",
      },
      mainPhone: "+12025551012",
      name: "Galaxy Grill Clarendon",
      timezone: "America/New_York",
    },
    {
      address: {
        city: "Arlington",
        countryCode: "US",
        line1: "1250 S Hays St",
        postalCode: "22202",
        region: "VA",
      },
      hours: testHours,
      name: "Galaxy Grill Pentagon City",
      timezone: "America/New_York",
    },
  ],
  name: "Arlington",
  meta: { entityType: { id: "dm_city", uid: 456 }, locale: "en" },
  dm_addressCountryDisplayName: "United States",
  dm_addressRegionDisplayName: "Virginia",
  dm_directoryManagerId: "63590-locations",
  dm_directoryParents_63590_locations: [
    { name: "Locations Directory", slug: "en/index.html" },
    {
      name: "US",
      slug: "en/us",
      dm_addressCountryDisplayName: "United States",
    },
    {
      name: "VA",
      slug: "us/va",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
  ],
  slug: "us/va/arlington",
};

const tests: ComponentTest[] = [
  {
    name: "default props - no document",
    document: {},
    props: { ...Directory.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props - root - document data",
    document: rootDocument,
    props: { ...Directory.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props - country - document data",
    document: countryDocument,
    props: { ...Directory.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props - region - document data",
    document: regionDocument,
    props: { ...Directory.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props - city list - document data",
    document: cityDocument,
    props: { ...Directory.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 4 - directory list - non-default props",
    document: regionDocument,
    props: {
      data: {
        directoryRoot: "Not Default Root",
      },
      liveVisibility: true,
    },
    version: 4,
  },
  {
    name: "version 4 - directory list - default props",
    document: regionDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      liveVisibility: true,
    },
    version: 4,
  },
  {
    name: "version 4 - directory cards - default props",
    document: cityDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      liveVisibility: true,
    },
    version: 4,
  },
  {
    name: "version 7 - directory list - non-default props",
    document: regionDocument,
    props: {
      data: {
        directoryRoot: "Not Default Root",
      },
      styles: {
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 - directory list - default props",
    document: regionDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      styles: {
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 - directory cards - default props",
    document: cityDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      styles: {
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 8 - directory list - non-default props",
    document: regionDocument,
    props: {
      data: {
        directoryRoot: "Not Default Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
  {
    name: "version 8 - directory card - non-default props",
    document: cityDocument,
    props: {
      data: {
        directoryRoot: "Not Default Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
  {
    name: "version 8 - root - default props",
    document: rootDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
  {
    name: "version 8 - country - default props",
    document: countryDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
  {
    name: "version 8 - region - default props",
    document: countryDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
  {
    name: "version 8 - city - default props",
    document: cityDocument,
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
  {
    name: "version 11 with default props",
    document: {
      _site: {
        name: "Example Business",
      },
      name: "VA",
      meta: { entityType: { id: "dm_region", uid: 123 }, locale: "en" },
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
      dm_childEntityIds: ["8932945"],
      dm_directoryChildren: [
        {
          name: "Arlington",
          slug: "us/va/arlington",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
      ],
      dm_directoryManagerId: "63590-locations",
      dm_directoryParents_63590_locations: [
        {
          name: "Locations Directory",
          slug: "en/index.html",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
        {
          name: "US",
          slug: "en/us",
          dm_addressCountryDisplayName: "United States",
        },
      ],
    },
    props: {
      data: {
        title: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "[[name]]",
            hasLocalizedValue: "true",
          },
        },
        directoryRoot: "Directory Root",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        breadcrumbsBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 11,
  },
];

describe("Directory", async () => {
  const puckConfig: Config = {
    components: { Directory },
    root: {
      render: ({ children }) => {
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
              type: "Directory",
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

      await expect(`Directory/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `Directory/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
