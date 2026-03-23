import React from "react";
import { describe, expect, it } from "vitest";
import { Config, resolveAllData } from "@puckeditor/core";
import { Directory } from "../../components/directory/Directory.tsx";
import { SlotsCategoryComponents } from "../../components/categories/SlotsCategory.tsx";

const cityDocument = {
  locale: "en",
  _site: {
    name: "Example Business",
  },
  __: {
    isPrimaryLocale: true,
  },
  _pageset: JSON.stringify({
    config: {
      urlTemplate: {
        primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
      },
    },
  }),
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
      hours: {
        monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
      },
      name: "Galaxy Grill Rosslyn",
      timezone: "America/New_York",
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
      name: "Galaxy Grill Ballston",
      timezone: "America/New_York",
    },
  ],
  name: "Arlington",
  meta: { entityType: { id: "dm_city", uid: 456 }, locale: "en" },
};

const directoryProps = {
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-primary-dark",
      textColor: "text-white",
    },
  },
  slots: {
    TitleSlot: [],
    SiteNameSlot: [],
    BreadcrumbsSlot: [],
    DirectoryGrid: [
      {
        type: "DirectoryGrid",
        props: {
          slots: {
            CardSlot: [],
          },
        },
      },
    ],
  },
};

describe("resolveDirectoryCardReferences", () => {
  it("stores directory cards as child references and keeps slot bindings field-based", async () => {
    const puckConfig: Config = {
      components: { Directory, ...SlotsCategoryComponents },
      root: {
        render: () => React.createElement(React.Fragment),
      },
    };

    const resolvedData = await resolveAllData(
      {
        root: {
          props: {},
        },
        content: [
          {
            type: "Directory",
            props: directoryProps,
          },
        ],
      },
      puckConfig,
      {
        streamDocument: cityDocument,
      }
    );

    const cards =
      resolvedData.content[0]?.props?.slots?.DirectoryGrid?.[0]?.props?.slots
        ?.CardSlot ?? [];
    const firstCard = cards[0];

    expect(cards).toHaveLength(2);
    expect(firstCard?.props?.parentData).toEqual({
      childRef: { childIndex: 0 },
    });
    expect(firstCard?.props?.parentData?.profile).toBeUndefined();
    expect(
      firstCard?.props?.slots?.HeadingSlot?.[0]?.props?.data?.text?.field
    ).toBe("name");
    expect(
      firstCard?.props?.slots?.HeadingSlot?.[0]?.props?.parentData
    ).toEqual({
      field: "profile.name",
    });
    expect(
      firstCard?.props?.slots?.AddressSlot?.[0]?.props?.data?.address?.field
    ).toBe("address");
    expect(
      firstCard?.props?.slots?.PhoneSlot?.[0]?.props?.data?.number?.field
    ).toBe("mainPhone");
    expect(
      firstCard?.props?.slots?.HoursSlot?.[0]?.props?.data?.hours?.field
    ).toBe("hours");
  });
});
