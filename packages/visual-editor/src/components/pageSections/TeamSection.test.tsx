import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
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
    tests: async (page) => {
      expect(page.getByText("Meet Our Team")).toBeVisible();
    },
  },
  {
    name: "default props with document data",
    document: { c_team: teamData },
    props: { ...TeamSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Meet Our Team")).toBeVisible();
      expect(document.body.textContent).not.toContain("Captain");
    },
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
    tests: async (page) => {
      expect(page.getByText("Captain Cosmo")).toBeVisible();
      expect(page.getByText("Chef Nova")).toBeVisible();
      expect(page.getByText("Admiral Aster")).toBeVisible();
      expect(page.getByText("Founder & CEO")).toBeVisible();
      expect(page.getByText("Culinary Director")).toBeVisible();
      expect(page.getByText("Operations Manager")).toBeVisible();
      expect(page.getByText("Email Me").elements()).toHaveLength(2);
      expect(page.getByText("(800) 555-1010")).toBeVisible();
      expect(page.getByText("+52 800 555 1010")).toBeVisible();
    },
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
    tests: async (page) => {
      expect(page.getByText("Meet Our Team")).toBeVisible();
      expect(page.getByText("Name")).toBeVisible();
      expect(page.getByText("Title")).toBeVisible();
      expect(page.getByText("8888888888")).toBeVisible();
      expect(page.getByText("email")).toBeVisible();
      expect(page.getByText("CTA")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
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
      await page.screenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      await tests(page);
    }
  );
});
