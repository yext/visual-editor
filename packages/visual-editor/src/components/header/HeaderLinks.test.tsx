import * as React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { i18nComponentsInstance } from "../../utils/i18n/components.ts";
import { ExpandedHeaderMenuProvider } from "./ExpandedHeaderMenuContext.tsx";
import { HeaderLinks } from "./HeaderLinks.tsx";
import { PrimaryHeaderSlot } from "./PrimaryHeaderSlot.tsx";
import { defaultSecondaryHeaderProps } from "./SecondaryHeaderSlot.tsx";

const hiddenFrenchLink = {
  linkType: "URL" as const,
  label: { defaultValue: "Hidden", fr: "" },
  link: { defaultValue: "/hidden", fr: "" },
};

const visibleFrenchLink = {
  linkType: "URL" as const,
  label: { defaultValue: "Visible", fr: "Visible FR" },
  link: { defaultValue: "/visible", fr: "/fr/visible" },
};

beforeEach(async () => {
  await i18nComponentsInstance.changeLanguage("fr");
});

describe("HeaderLinks localization", () => {
  it("omits links that are empty for the active locale from rendering and measurement", () => {
    const HeaderLinksRender = HeaderLinks.render as React.ComponentType<any>;
    const { container } = render(
      <VisualEditorProvider templateProps={{ document: { locale: "fr" } }}>
        <ExpandedHeaderMenuProvider>
          <HeaderLinksRender
            data={{
              links: [visibleFrenchLink, hiddenFrenchLink],
              collapsedLinks: [],
            }}
            styles={{ align: "right", variant: "sm", weight: "normal" }}
            parentData={{ type: "Primary" }}
            puck={{ isEditing: false }}
          />
        </ExpandedHeaderMenuProvider>
      </VisualEditorProvider>
    );

    const [measurementList, visibleList] =
      container.querySelectorAll("nav > ul");
    expect(measurementList.children).toHaveLength(1);
    expect(visibleList.children).toHaveLength(1);
    expect(visibleList.querySelector("a")?.getAttribute("href")).toBe(
      "/fr/visible"
    );
  });
});

describe("PrimaryHeaderSlot navigation visibility", () => {
  const resolvePrimaryHeaderData = async ({
    links = [],
    collapsedLinks = [],
    secondaryLinks = [],
  }: {
    links?: any[];
    collapsedLinks?: any[];
    secondaryLinks?: any[];
  }): Promise<any> => {
    const props = structuredClone(PrimaryHeaderSlot.defaultProps) as any;
    props.slots.PrimaryCTASlot[0].props.data.show = false;
    props.slots.SecondaryCTASlot[0].props.data.show = false;
    props.slots.LinksSlot[0].props.data = { links, collapsedLinks };
    props.parentValues = {
      SecondaryHeaderSlot: [
        {
          type: "SecondaryHeaderSlot",
          props: structuredClone(defaultSecondaryHeaderProps),
        },
      ],
    };
    props.parentValues.SecondaryHeaderSlot[0].props.data.show =
      secondaryLinks.length > 0;
    props.parentValues.SecondaryHeaderSlot[0].props.slots.LinksSlot[0].props.data =
      { links: secondaryLinks, collapsedLinks: [] };

    return await PrimaryHeaderSlot.resolveData!(
      { props } as any,
      { metadata: { streamDocument: { locale: "fr" } } } as any
    );
  };

  it("treats links that are empty for the active locale as absent", async () => {
    const resolvedData = await resolvePrimaryHeaderData({
      links: [hiddenFrenchLink],
    });

    expect(resolvedData.props.conditionalRender.navContent).toBe(false);
  });

  it("keeps navigation available for a localized collapsed link", async () => {
    const resolvedData = await resolvePrimaryHeaderData({
      collapsedLinks: [visibleFrenchLink],
    });

    expect(resolvedData.props.conditionalRender.navContent).toBe(true);
  });

  it("keeps navigation available for localized secondary links", async () => {
    const resolvedData = await resolvePrimaryHeaderData({
      secondaryLinks: [visibleFrenchLink],
    });

    expect(resolvedData.props.conditionalRender.navContent).toBe(true);
  });
});
