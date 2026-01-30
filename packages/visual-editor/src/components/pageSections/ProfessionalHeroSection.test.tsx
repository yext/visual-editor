import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { ProfessionalHeroSection } from "./ProfessionalHeroSection";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider";
import { SlotsCategoryComponents } from "../categories/SlotsCategory";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const defaultProps = ProfessionalHeroSection.defaultProps!;

const testDocument = {
  locale: "en",
  name: "Dr. Jane Doe",
  address: {
    line1: "123 Main St",
    city: "New York",
    postalCode: "10001",
    countryCode: "US",
  },
  mainPhone: "+15551234567",
  emails: ["jane.doe@example.com"],
  ref_reviewsAgg: [
    {
      averageRating: 4.8,
      publisher: "FIRSTPARTY",
      reviewCount: 150,
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "version 51 - default props with no data",
    document: {
      locale: "en",
    },
    props: { ...defaultProps },
    version: 51,
  },
  {
    name: "version 51 - default props with data",
    document: testDocument,
    props: { ...defaultProps },
    version: 51,
  },
  {
    name: "version 51 - no image",
    document: testDocument,
    props: {
      ...defaultProps,
      styles: {
        ...defaultProps.styles,
        showImage: false,
      },
    },
    version: 51,
  },
  {
    name: "version 51 - image right desktop, image bottom mobile",
    document: testDocument,
    props: {
      ...defaultProps,
      styles: {
        ...defaultProps.styles,
        desktopImagePosition: "right",
        mobileImagePosition: "bottom",
      },
    },
    version: 51,
  },
  {
    name: "version 51 - hide average review",
    document: testDocument,
    props: {
      ...defaultProps,
      styles: {
        ...defaultProps.styles,
        showAverageReview: false,
      },
    },
    version: 51,
  },
];

describe("ProfessionalHeroSection", () => {
  it.each(transformTests(tests))("$viewport.name $name", async (test) => {
    const config: Config = {
      components: {
        ProfessionalHeroSection,
        ...SlotsCategoryComponents,
      },
    };

    const data = {
      root: { props: { title: "Test" } },
      content: [
        {
          type: "ProfessionalHeroSection",
          props: test.props,
        },
      ],
    };

    const resolvedData = await resolveAllData(data, config, {
      metadata: {
        streamDocument: test.document,
      },
    });

    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: test.document }}>
        <Render config={config} data={resolvedData} />
      </VisualEditorProvider>
    );

    await page.viewport(test.viewport.width, test.viewport.height);
    const images = Array.from(container.querySelectorAll("img"));
    await waitFor(() => {
      expect(images.every((i) => i.complete)).toBe(true);
    });

    await expect(
      `ProfessionalHeroSection/[${test.viewport.name}] ${test.name}`
    ).toMatchScreenshot({ ignoreExact: [101] });

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Basic assertions
    if (test.props.styles.showImage !== false) {
      expect(container.querySelector("img")).toBeInTheDocument();
    }

    expect(container).toBeInTheDocument();
  });
});
