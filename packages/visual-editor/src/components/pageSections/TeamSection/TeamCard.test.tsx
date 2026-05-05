import { describe, expect, it } from "vitest";
import { TeamCard, defaultTeamCardSlotData } from "./TeamCard.tsx";

describe("TeamCard", () => {
  it("when itemData provides mapped content then conditional render stays enabled", () => {
    const data = defaultTeamCardSlotData("team-card-1", 0) as any;
    data.props.itemData = {
      field: "",
      headshot: {
        url: "https://example.com/team.jpg",
        width: 80,
        height: 80,
      },
      name: "Captain Cosmo",
      title: "Founder",
      phoneNumber: "+18005551212",
      email: "captain@example.com",
      cta: {
        label: "Email me",
        link: "captain@example.com",
        linkType: "EMAIL",
      },
    };

    const resolvedData = TeamCard.resolveData!(data, {
      changed: {},
      fields: {},
      lastFields: null,
      lastData: null,
      metadata: { streamDocument: {} },
      trigger: "initial",
      parent: null,
    } as any) as any;

    expect(resolvedData.props.conditionalRender).toEqual({
      image: true,
      name: true,
      title: true,
      phone: true,
      email: true,
      cta: true,
    });
  });
});
