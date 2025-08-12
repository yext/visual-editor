import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  TeamSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const teamData = {
  people: [
    {
      cta: {
        label: "Email Me",
        link: "cosmo@galaxygrill.com",
        linkType: "EMAIL",
      },
      email: "cosmo@galaxygrill.com",
      headshot: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/2048x2048.jpg",
        width: 2048,
      },
      name: "Captain Cosmo",
      phoneNumber: "+18005551010",
      title: "Founder \u0026 CEO",
    },
    {
      cta: {
        link: "nova@galaxygrill.com",
        label: "Email Me",
        linkType: "EMAIL",
      },
      name: "Chef Nova",
      phoneNumber: "+528005551010",
      title: "Culinary Director",
    },
    {
      headshot: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/2048x2048.jpg",
        width: 2048,
      },
      name: "Admiral Aster",
      title: "Operations Manager",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...TeamSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_team: teamData },
    props: { ...TeamSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_team: teamData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: { people: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-quaternary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_team: teamData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: true,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: {
            people: [
              {
                name: "Name",
                title: "Title",
                phoneNumber: "8888888888",
                email: "email",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 7 props with entity values",
    document: { c_team: teamData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: { people: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
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
    name: "version 7 props with constant value",
    document: { c_team: teamData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: true,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: {
            people: [
              {
                name: "Name",
                title: "Title",
                phoneNumber: "8888888888",
                email: "email",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
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
    name: "version 15 props with missing ctaType",
    document: { c_team: teamData },
    props: {
      data: {
        people: {
          field: "c_team",
          constantValue: [
            {
              name: "Name",
              title: "Title",
              phoneNumber: "8888888888",
              email: "email",
              cta: {
                label: "CTA",
                // Missing link, linkType, and ctaType - should be added by migration
              },
            },
            {
              name: "Name 2",
              title: "Title 2",
              phoneNumber: "9999999999",
              email: "email2",
              cta: {
                label: "CTA 2",
                link: "#",
                linkType: "URL",
                // Missing ctaType - should be added by migration
              },
            },
          ],
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 15,
  },
  {
    name: "version 15 props with nested people structure and missing ctaType",
    document: { c_team: teamData },
    props: {
      data: {
        people: {
          field: "c_team",
          constantValue: {
            people: [
              {
                name: "Name",
                title: "Title",
                phoneNumber: "8888888888",
                email: "email",
                cta: {
                  label: "CTA",
                  // Missing link, linkType, and ctaType - should be added by migration
                },
              },
              {
                name: "Name 2",
                title: "Title 2",
                phoneNumber: "9999999999",
                email: "email2",
                cta: {
                  label: "CTA 2",
                  link: "#",
                  linkType: "URL",
                  // Missing ctaType - should be added by migration
                },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 15,
  },
];

describe("TeamSection", async () => {
  const puckConfig: Config = {
    components: { TeamSection },
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
              type: "TeamSection",
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
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(`TeamSection/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `TeamSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
