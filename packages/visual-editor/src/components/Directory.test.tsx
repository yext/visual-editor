import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, testHours, viewports } from "./WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { Directory, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("Directory $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { Directory },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with directory cards", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
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
                name: "Galaxy Grill",
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
          },
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "Directory",
                props: { id: "abc", ...Directory.defaultProps },
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

  it("should pass wcag with directory list", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            _site: {
              name: "Example Business",
            },
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
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "Directory",
                props: { id: "abc", ...Directory.defaultProps },
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
